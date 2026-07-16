(function (root) {
  "use strict";

  function deepCopy(value) { return JSON.parse(JSON.stringify(value)); }

  function createAttempt(paper, mode, timerEnabled = false) {
    return {
      id: `${paper.id}-${Date.now()}`,
      paperId: paper.id,
      mode,
      status: "active",
      currentQuestion: paper.questions[0].id,
      answers: {},
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
      this.stopTimer();
      this.attempt = deepCopy(attempt);
      this.attempt.status = "active";
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
    }

    restoreSubmitted(attempt) {
      this.stopTimer();
      const restoredAttempt = deepCopy(attempt);
      if (restoredAttempt?.status !== "submitted" || !restoredAttempt.result) return false;
      this.attempt = restoredAttempt;
      this.notify("restore-submit");
      return true;
    }

    setAnswer(id, value) {
      if (!this.attempt || this.attempt.status !== "active") return;
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

  const api = { ExamEngine, createAttempt, answerComplete };
  root.ExamEngineCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
