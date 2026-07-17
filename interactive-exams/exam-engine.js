(function (root) {
  "use strict";

  const STORAGE_VERSION = 1;

  function deepCopy(value) { return JSON.parse(JSON.stringify(value)); }

  function createAttempt(paper, mode, timerEnabled = false) {
    return {
      storageVersion: STORAGE_VERSION,
      id: `${paper.id}-${Date.now()}`,
      paperId: paper.id,
      mode,
      status: "active",
      currentQuestion: paper.questions[0].id,
      answers: {},
      checkedQuestionIds: [],
      flaggedQuestions: [],
      audioPlayCounts: {},
      audioLimitEnabled: false,
      questionsLocked: false,
      examStarted: false,
      examUnlockedQuestionIndex: mode === "exam" ? -1 : paper.questions.length - 1,
      customiseDefaultsVersion: 1,
      startedAt: new Date().toISOString(),
      timer: { enabled: mode === "exam" && timerEnabled, remainingSeconds: paper.estimatedMinutes * 60, lastUpdatedAt: new Date().toISOString() },
      retryQuestionIds: null,
    };
  }

  function validDate(value) { return typeof value === "string" && Number.isFinite(Date.parse(value)); }
  function plainObject(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }

  function validSubmittedResult(paper, result) {
    if (!plainObject(result) || !Number.isFinite(result.score) || result.totalMarks !== paper.totalMarks || !Array.isArray(result.questionBreakdown)) return false;
    if (result.score < 0 || result.score > paper.totalMarks || result.questionBreakdown.length !== paper.questions.length) return false;
    const validStatuses = new Set(["correct", "partial", "incorrect", "unanswered", "review"]);
    const questionResults = new Map(result.questionBreakdown.map(question => [question?.id, question]));
    if (questionResults.size !== paper.questions.length) return false;
    let calculatedScore = 0;
    for (const question of paper.questions) {
      const questionResult = questionResults.get(question.id);
      if (!plainObject(questionResult) || !Number.isFinite(questionResult.marks) || questionResult.maxMarks !== question.marks || !Array.isArray(questionResult.parts)) return false;
      if (questionResult.marks < 0 || questionResult.marks > question.marks || questionResult.parts.length !== question.subquestions.length) return false;
      const partResults = new Map(questionResult.parts.map(part => [part?.id, part]));
      if (partResults.size !== question.subquestions.length) return false;
      let questionScore = 0;
      for (const subquestion of question.subquestions) {
        const partResult = partResults.get(subquestion.id);
        if (!plainObject(partResult) || !Number.isFinite(partResult.marks) || partResult.maxMarks !== subquestion.marks || !validStatuses.has(partResult.status)) return false;
        if (partResult.marks < 0 || partResult.marks > subquestion.marks) return false;
        questionScore += partResult.marks;
      }
      if (questionScore !== questionResult.marks) return false;
      calculatedScore += questionScore;
    }
    return calculatedScore === result.score;
  }

  function validateAttempt(paper, attempt, expectedStatus) {
    if (!plainObject(attempt) || attempt.storageVersion !== STORAGE_VERSION || attempt.paperId !== paper.id) return false;
    if (!["practice", "exam"].includes(attempt.mode) || attempt.status !== expectedStatus) return false;
    if (!plainObject(attempt.answers) || !validDate(attempt.startedAt)) return false;
    if (!paper.questions.some(question => question.id === attempt.currentQuestion)) return false;
    const validQuestionIds = new Set(paper.questions.map(question => question.id));
    const validPartIds = new Set(paper.questions.flatMap(question => question.subquestions.map(part => part.id)));
    if (Object.keys(attempt.answers).some(id => !validPartIds.has(id))) return false;
    if (attempt.checkedQuestionIds && (!Array.isArray(attempt.checkedQuestionIds) || attempt.checkedQuestionIds.some(id => !validQuestionIds.has(id)))) return false;
    if (!plainObject(attempt.timer) || typeof attempt.timer.enabled !== "boolean" || !Number.isFinite(Number(attempt.timer.remainingSeconds))) return false;
    if (expectedStatus === "submitted") {
      if (!validSubmittedResult(paper, attempt.result)) return false;
      if (!validDate(attempt.completedAt)) return false;
    }
    return true;
  }

  function answerComplete(subquestion, value) {
    if (!root.ExamMarking.isAnswered(subquestion, value)) return false;
    if (subquestion.type === "checkbox") return value.length === subquestion.maxSelections;
    if (subquestion.type === "structured-review") {
      if (subquestion.finalAnswerField) return Boolean(String(value?.final || "").trim());
      return Object.values(value).filter(entry => String(entry || "").trim()).length >= 3;
    }
    return true;
  }

  class ExamEngine {
    constructor(paper, onChange) {
      this.paper = paper;
      this.onChange = onChange;
      this.attempt = null;
      this.timerId = null;
    }

    start(mode, timerEnabled = false) {
      this.stopTimer();
      this.attempt = createAttempt(this.paper, mode, timerEnabled);
      this.persist();
      this.startTimer();
      this.notify("start");
      return this.attempt;
    }

    beginExamSession() {
      if (!this.attempt || this.attempt.mode !== "exam" || this.attempt.status !== "active") return;
      this.stopTimer();
      this.attempt.examStarted = true;
      this.attempt.questionsLocked = true;
      this.attempt.audioLimitEnabled = true;
      this.attempt.examUnlockedQuestionIndex = 0;
      this.attempt.timer.enabled = true;
      this.attempt.timer.remainingSeconds = this.paper.estimatedMinutes * 60;
      this.attempt.timer.lastUpdatedAt = new Date().toISOString();
      root.ExamStorage.deleteDraft(this.paper.id);
      this.startTimer();
      this.notify("exam-begin");
    }

    unlockExamQuestion(index) {
      if (!this.attempt || this.attempt.mode !== "exam") return;
      this.attempt.examUnlockedQuestionIndex = Math.max(this.attempt.examUnlockedQuestionIndex ?? 0, index);
      this.attempt.currentQuestion = this.paper.questions[index]?.id || this.attempt.currentQuestion;
      this.notify("exam-unlock");
    }

    convertExamToPractice() {
      if (!this.attempt || this.attempt.mode !== "exam") return;
      this.stopTimer();
      this.attempt.mode = "practice";
      this.attempt.examStarted = false;
      this.attempt.questionsLocked = false;
      this.attempt.audioLimitEnabled = false;
      this.attempt.examUnlockedQuestionIndex = this.paper.questions.length - 1;
      this.attempt.timer.enabled = false;
      this.attempt.timer.remainingSeconds = this.paper.estimatedMinutes * 60;
      this.persist();
      this.notify("mode-practice");
    }

    resume(attempt) {
      if (!validateAttempt(this.paper, attempt, "active")) return false;
      this.stopTimer();
      this.attempt = deepCopy(attempt);
      this.attempt.status = "active";
      this.attempt.checkedQuestionIds ||= [];
      if (this.attempt.timer?.enabled) {
        const lastUpdate = new Date(this.attempt.timer.lastUpdatedAt || this.attempt.savedAt || Date.now()).getTime();
        const elapsedWhileClosed = Math.max(0, Math.floor((Date.now() - lastUpdate) / 1000));
        this.attempt.timer.remainingSeconds = Math.max(0, this.attempt.timer.remainingSeconds - elapsedWhileClosed);
        this.attempt.timer.lastUpdatedAt = new Date().toISOString();
        if (this.attempt.timer.remainingSeconds === 0) {
          this.submit();
          return;
        }
      }
      this.startTimer();
      this.notify("resume");
      return true;
    }

    restoreSubmitted(attempt) {
      this.stopTimer();
      const restoredAttempt = deepCopy(attempt);
      if (!validateAttempt(this.paper, restoredAttempt, "submitted")) return false;
      restoredAttempt.result = root.ExamMarking.markPaper(this.paper, restoredAttempt.answers);
      this.attempt = restoredAttempt;
      root.ExamStorage.saveSubmitted(this.paper.id, this.attempt);
      this.notify("restore-submit");
      return true;
    }

    setAnswer(id, value) {
      if (!this.attempt || this.attempt.status !== "active") return;
      const question = this.paper.questions.find(item => item.subquestions.some(subquestion => subquestion.id === id));
      if (question && this.attempt.checkedQuestionIds?.includes(question.id)) return;
      this.attempt.answers[id] = value;
      this.persist();
      this.notify("answer");
    }

    goToQuestion(id) {
      if (!this.attempt || !this.paper.questions.some(question => question.id === id)) return;
      this.attempt.currentQuestion = id;
      this.persist();
      this.notify("navigate");
    }

    toggleFlag(id) {
      if (!this.attempt) return;
      const flags = new Set(this.attempt.flaggedQuestions);
      if (flags.has(id)) flags.delete(id); else flags.add(id);
      this.attempt.flaggedQuestions = [...flags];
      this.persist();
      this.notify("flag");
    }

    setPlayCounts(counts) {
      if (!this.attempt) return;
      this.attempt.audioPlayCounts = { ...counts };
      this.persist();
      this.notify("audio");
    }

    setAudioLimitEnabled(enabled) {
      if (!this.attempt || this.attempt.status !== "active") return;
      this.attempt.audioLimitEnabled = Boolean(enabled);
      this.attempt.audioPlayCounts = {};
      this.persist();
      this.notify("audio-limit");
    }

    setTimerEnabled(enabled) {
      if (!this.attempt || this.attempt.status !== "active") return;
      this.stopTimer();
      this.attempt.timer.enabled = Boolean(enabled);
      if (!this.attempt.timer.enabled) this.attempt.timer.remainingSeconds = this.paper.estimatedMinutes * 60;
      this.attempt.timer.lastUpdatedAt = new Date().toISOString();
      this.persist();
      if (this.attempt.timer.enabled) this.startTimer();
      this.notify("timer-setting");
    }

    setQuestionsLocked(enabled) {
      if (!this.attempt || this.attempt.status !== "active") return;
      this.attempt.questionsLocked = Boolean(enabled);
      this.persist();
      this.notify("questions-locked");
    }

    questionState(question) {
      const completed = question.subquestions.filter(subquestion => answerComplete(subquestion, this.attempt?.answers[subquestion.id])).length;
      if (completed === 0) return "unanswered";
      return completed === question.subquestions.length ? "answered" : "partial";
    }

    isQuestionChecked(id) {
      return Boolean(this.attempt?.checkedQuestionIds?.includes(id));
    }

    checkQuestion(id) {
      if (!this.attempt || this.attempt.status !== "active" || this.attempt.mode !== "practice" || this.isQuestionChecked(id)) return false;
      const question = this.paper.questions.find(item => item.id === id);
      if (!question || question.subquestions.some(subquestion => !answerComplete(subquestion, this.attempt.answers[subquestion.id]))) return false;
      this.attempt.checkedQuestionIds ||= [];
      this.attempt.checkedQuestionIds.push(id);
      this.persist();
      this.notify("question-check");
      return true;
    }

    visibleQuestions() {
      const ids = this.attempt?.retryQuestionIds;
      return ids?.length ? this.paper.questions.filter(question => ids.includes(question.id)) : this.paper.questions;
    }

    submit() {
      if (!this.attempt || this.attempt.status !== "active") return null;
      this.stopTimer();
      const result = root.ExamMarking.markPaper(this.paper, this.attempt.answers);
      const completedAt = new Date().toISOString();
      const durationSeconds = Math.max(0, Math.round((Date.now() - new Date(this.attempt.startedAt).getTime()) / 1000));
      const record = {
        id: this.attempt.id,
        date: completedAt,
        mode: this.attempt.mode,
        durationSeconds,
        score: result.score,
        totalMarks: this.paper.totalMarks,
        answers: deepCopy(this.attempt.answers),
        questionBreakdown: result.questionBreakdown,
        topicBreakdown: result.topicBreakdown,
        reviewMarks: result.reviewMarks,
      };
      root.ExamStorage.addAttempt(this.paper.id, record);
      root.ExamStorage.deleteDraft(this.paper.id);
      this.attempt.status = "submitted";
      this.attempt.result = result;
      this.attempt.completedAt = completedAt;
      this.attempt.durationSeconds = durationSeconds;
      root.ExamStorage.saveSubmitted(this.paper.id, this.attempt);
      this.notify("submit");
      return result;
    }

    retryIncorrect() {
      if (this.attempt?.mode !== "practice" || !this.attempt.result) return;
      const incorrectParts = this.attempt.result.questionBreakdown.flatMap(question => question.parts.filter(part => part.status === "incorrect" || part.status === "unanswered").map(part => ({ questionId: question.id, partId: part.id })));
      if (!incorrectParts.length) return;
      incorrectParts.forEach(part => { delete this.attempt.answers[part.partId]; });
      this.attempt.retryQuestionIds = [...new Set(incorrectParts.map(part => part.questionId))];
      this.attempt.checkedQuestionIds = (this.attempt.checkedQuestionIds || []).filter(id => !this.attempt.retryQuestionIds.includes(id));
      this.attempt.currentQuestion = this.attempt.retryQuestionIds[0];
      this.attempt.status = "active";
      this.attempt.result = null;
      this.attempt.startedAt = new Date().toISOString();
      this.persist();
      this.startTimer();
      this.notify("retry");
    }

    startTimer() {
      if (!this.attempt?.timer?.enabled || this.attempt.status !== "active") return;
      this.timerId = root.setInterval(() => {
        this.attempt.timer.remainingSeconds = Math.max(0, this.attempt.timer.remainingSeconds - 1);
        this.attempt.timer.lastUpdatedAt = new Date().toISOString();
        this.persist();
        this.notify("timer");
        if (this.attempt.timer.remainingSeconds === 0) this.submit();
      }, 1000);
    }

    stopTimer() { if (this.timerId) root.clearInterval(this.timerId); this.timerId = null; }
    persist() { if (this.attempt?.status === "active" && this.attempt.mode === "practice") root.ExamStorage.saveDraft(this.paper.id, this.attempt); }
    notify(reason) { this.onChange?.(this.attempt, reason); }
    destroy() { this.stopTimer(); }
  }

  const api = { ExamEngine, createAttempt, answerComplete, validateAttempt };
  root.ExamEngineCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
