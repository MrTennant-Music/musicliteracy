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
  else if (part.type === "structured-review") fullAnswers[part.id] = { rhythm: "rough work is ignored", melody: "rough work is ignored", instruments: "rough work is ignored", dynamics: "rough work is ignored", final: "Swing, dotted rhythms, major tonality, piano and mf." };
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const result = marking.markPaper(paper, fullAnswers);
assert.equal(result.score, 40, "All 40 marks, including Question 8, should be marked automatically.");
assert.equal(result.reviewMarks, 0, "Question 8 should not require human review.");
assert.equal(result.automaticallyMarkableMarks, 40);
const questionEightPart = paper.questions.find(question => question.id === "q8").subquestions[0];
assert.equal(marking.isAnswered(questionEightPart, { rhythm: "swing", melody: "major", instruments: "piano" }), false, "Rough work alone should not complete Question 8.");
assert.equal(marking.isAnswered(questionEightPart, { final: "Swing, major tonality and piano." }), true, "The final answer should complete Question 8.");
assert.equal(marking.markSubquestion(questionEightPart, { rhythm: "swing, major, piano, mf, crescendo", final: "" }).marks, 0, "Rough work must earn no marks when the Final answer is blank.");
assert.equal(marking.markSubquestion(questionEightPart, { rhythm: "swing, dotted rhythms, piano, mf", final: "Major" }).marks, 1, "Only concepts written in the Final answer should be marked.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "2 beats in the bar, 4/4 and simple time." }).marks, 1, "Alternative descriptions of the same metre concept should earn one mark only.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "Major, repetition, riff, scat singing, sequence, syllabic and walking bass." }).marks, 2, "A single heading should contribute no more than two marks.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "Melody/harmony: 4 beats in the bar. Rhythm/tempo: mf. Instruments: piano." }).marks, 3, "Correct concepts should not be penalised for appearing under the wrong heading.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "The music uses synchopation, a crecendo and syllibic word setting." }).marks, 3, "Clear minor spelling errors should still earn the intended marks.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "Guitar, bass, drums, trombone, violin and lead vocals." }).marks, 0, "Explicitly unacceptable standalone instrument and voice terms must not earn marks.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "Bass guitar, drum kit, trombones, violins, male voice and backing singers." }).marks, 2, "Valid instrument concepts should be recognised but capped at two marks for the heading.");
assert.equal(marking.markSubquestion(questionEightPart, { final: "There are many irrelevant words here, but the music is in a major key, uses swing, piano, crescendo and forte." }).marks, 5, "Irrelevant prose should be ignored while valid concepts are banked up to five marks.");

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

storage.deleteSubmitted(paper.id);
const submittedEngine = new ExamEngine(paper);
submittedEngine.start("practice");
submittedEngine.setAnswer("q1a", "Gospel");
submittedEngine.submit();
const savedSubmission = storage.loadSubmitted(paper.id);
assert.equal(savedSubmission.status, "submitted", "A submitted attempt should be saved for persistent feedback.");
assert.equal(savedSubmission.answers.q1a, "Gospel", "The saved feedback attempt should retain the pupil's answers.");
assert.equal(savedSubmission.result.questionBreakdown[0].parts[0].status, "correct", "The saved feedback attempt should retain its marking result.");
let restoreReason = "";
const restoredEngine = new ExamEngine(paper, (restoredAttempt, reason) => { restoreReason = reason; });
assert.equal(restoredEngine.restoreSubmitted(savedSubmission), true, "A valid submitted attempt should be restorable after refresh.");
assert.equal(restoredEngine.attempt.status, "submitted");
assert.equal(restoreReason, "restore-submit", "Restoring a submission should reopen the feedback screen.");
storage.deleteSubmitted(paper.id);

storage.deleteDraft(paper.id);
const examEngine = new ExamEngine(paper);
examEngine.start("exam", false);
assert.equal(storage.loadDraft(paper.id), null, "Exam attempts must not survive a refresh.");
examEngine.beginExamSession();
assert.equal(examEngine.attempt.examStarted, true);
assert.equal(examEngine.attempt.timer.enabled, true, "Starting Exam mode should start the 45-minute timer.");
assert.equal(examEngine.attempt.audioLimitEnabled, true, "Exam mode should enforce one continuous audio run.");
assert.equal(examEngine.attempt.questionsLocked, true, "Exam mode should lock future questions.");
examEngine.unlockExamQuestion(3);
assert.equal(examEngine.attempt.examUnlockedQuestionIndex, 3, "Questions should unlock as their audio begins.");
examEngine.setAnswer("q1a", "Gospel");
examEngine.convertExamToPractice();
assert.equal(examEngine.attempt.mode, "practice", "An Exam attempt can become a Practice attempt.");
assert.equal(examEngine.attempt.answers.q1a, "Gospel", "Exam-to-Practice conversion should retain progress.");
assert.equal(examEngine.attempt.timer.enabled, false);
assert.equal(examEngine.attempt.questionsLocked, false);
assert.equal(storage.loadDraft(paper.id).answers.q1a, "Gospel", "The converted Practice attempt should be saved.");
examEngine.destroy();

console.log("Interactive exam engine tests passed.");
