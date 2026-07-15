const assert = require("node:assert/strict");

global.localStorage = {
  values: new Map(),
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
  setItem(key, value) { this.values.set(key, value); },
  removeItem(key) { this.values.delete(key); },
};

const storage = require("../exam-storage.js");
global.ExamStorage = storage;
const marking = require("../exam-marking.js");
global.ExamMarking = marking;
const paper = require("../papers/national5-2014.js");
const { ExamEngine, createAttempt } = require("../exam-engine.js");

assert.equal(paper.questions.length, 8, "The paper should contain eight main questions.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "Question marks should total 40.");
assert.equal(paper.questions.flatMap(question => question.subquestions).reduce((sum, part) => sum + part.marks, 0), 40, "Subquestion marks should total 40.");
assert.equal(paper.questions.flatMap(question => question.audio.clips).length, 8, "Each main question should have one complete audio track.");
assert.match(paper.introductionAudio, /Track 1-1\.mp3$/, "The separate spoken introduction should remain identified in the paper data.");
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]), ["2", "3", "4", "5", "6", "7", "8", "9"], "Tracks 2 to 9 should map to Questions 1 to 8.");
assert.equal(new Set(paper.questions.flatMap(question => question.subquestions.map(part => part.id))).size, paper.questions.flatMap(question => question.subquestions).length, "Subquestion IDs should be unique.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2014-q3", "Question 3 should use its shared interactive music guide.");
assert.deepEqual(questionThree.subquestions.slice(0, 4).map(part => part.sharedScore), [true, true, true, true], "Parts (a) to (d) should update the shared score.");
assert.equal(questionThree.subquestions.find(part => part.id === "q3a").answer, "4/4", "The official Question 3 time signature should be retained.");
assert.equal(questionThree.subquestions.find(part => part.id === "q3b").answer, "p", "The official quiet dynamic should be retained.");
assert.equal(questionThree.subquestions.find(part => part.id === "q3c").answer, "B4,D4,E4", "The first three missing beats should match the corrected score transcription and preserve their stave positions.");
assert.equal(questionThree.subquestions.find(part => part.id === "q3d").answer, "end-bar-8", "The repeat sign should be placed at the end of bar 8.");

assert.equal(marking.normalise("  Dominant--Seventh!  "), "dominant seventh");
assert.deepEqual(marking.markSubquestion({ type: "short-text", marks: 1, acceptedAnswers: ["dominant seventh"] }, " Dominant-Seventh. "), { marks: 1, status: "correct" });
assert.equal(marking.markSubquestion({ type: "checkbox", marks: 2, answers: ["A", "B"] }, ["A"]).marks, 1, "Checkbox marking should award deterministic partial marks.");
assert.equal(marking.markSubquestion({ type: "checkbox", marks: 2, answers: ["A", "B"] }, ["A", "C"]).marks, 0, "A wrong extra choice should offset a correct choice.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else if (part.type === "structured-review") fullAnswers[part.id] = { rhythm: "swing", melody: "major", instruments: "piano", dynamics: "mf" };
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const result = marking.markPaper(paper, fullAnswers);
assert.equal(result.score, 35, "Objective and deterministic responses should total 35 marks.");
assert.equal(result.reviewMarks, 5, "Question 8 should reserve five marks for review.");
assert.equal(result.automaticallyMarkableMarks, 35);

const attempt = createAttempt(paper, "exam", true);
assert.equal(attempt.timer.remainingSeconds, 2700);
assert.ok(attempt.timer.lastUpdatedAt);
assert.equal(attempt.mode, "exam");
assert.equal(attempt.audioLimitEnabled, false, "Audio limiting should remain optional by default.");
assert.equal(attempt.questionsLocked, false, "Question locking should be off by default.");
assert.equal(createAttempt(paper, "exam").timer.enabled, false, "The timer should be off by default.");

const engine = new ExamEngine(paper);
engine.start("practice");
engine.setAnswer("q1a", "Gospel");
engine.goToQuestion("q2");
engine.toggleFlag("q2");
engine.setPlayCounts({ track: 1 });
const saved = storage.loadDraft(paper.id);
assert.equal(saved.currentQuestion, "q2");
assert.equal(saved.answers.q1a, "Gospel");
assert.deepEqual(saved.flaggedQuestions, ["q2"]);
assert.deepEqual(saved.audioPlayCounts, { track: 1 });
engine.destroy();

const timerEngine = new ExamEngine(paper);
timerEngine.start("exam", true);
timerEngine.attempt.timer.remainingSeconds = 1200;
timerEngine.setTimerEnabled(false);
assert.equal(timerEngine.attempt.timer.enabled, false, "The Customise timer switch should pause the countdown.");
assert.equal(timerEngine.attempt.timer.remainingSeconds, 2700, "Turning the timer off should reset it to the paper's full duration.");
assert.equal(timerEngine.timerId, null, "Turning the timer off should stop its interval.");
assert.equal(storage.loadDraft(paper.id).timer.enabled, false, "The timer preference should be saved with the attempt.");
timerEngine.setTimerEnabled(true);
assert.equal(timerEngine.attempt.timer.enabled, true, "The Customise timer switch should restart the countdown.");
assert.ok(timerEngine.timerId, "Turning the timer on should restart its interval.");
timerEngine.destroy();

const audioLimitEngine = new ExamEngine(paper);
audioLimitEngine.start("exam", false);
audioLimitEngine.setPlayCounts({ q1: 1 });
audioLimitEngine.setAudioLimitEnabled(true);
assert.equal(audioLimitEngine.attempt.audioLimitEnabled, true, "The Audio Limit switch should enable exam-style playback restrictions.");
assert.deepEqual(audioLimitEngine.attempt.audioPlayCounts, {}, "Changing the Audio Limit setting should reset playback availability.");
audioLimitEngine.setQuestionsLocked(true);
assert.equal(audioLimitEngine.attempt.questionsLocked, true, "The Questions Locked switch should enable sequential navigation.");
assert.equal(storage.loadDraft(paper.id).questionsLocked, true, "The question-locking preference should be saved with the attempt.");
audioLimitEngine.destroy();

console.log("Interactive exam engine tests passed.");
