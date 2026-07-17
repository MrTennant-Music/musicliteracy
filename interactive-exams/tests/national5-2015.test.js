const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2015.js");
const registry = require("../paper-registry.js");

const parts = new Map(
  paper.questions.flatMap(question => question.subquestions.map(part => [part.id, part])),
);

assert.equal(registry[paper.id].year, 2015, "The 2015 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2015 paper should contain eight questions.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The eight questions should total 40 marks.");
assert.equal(paper.questions.flatMap(question => question.subquestions).reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, paper.questions.flatMap(question => question.subquestions).length, "Every answer should have a unique identifier.");
assert.deepEqual(paper.questions.map(question => question.marks), [6, 4, 6, 8, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["2", "3", "4", "5", "6", "7", "8", "9"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);
paper.questions.forEach(question => {
  const clip = question.audio.clips[0];
  const clipPath = path.resolve(__dirname, "..", clip.file);
  assert.equal(fs.existsSync(clipPath), true, `${question.id} should reference an audio file that exists.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} audio markers should be in chronological order.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should be available.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should be available.");
assert.equal(
  paper.questions.flatMap(question => question.subquestions).filter(part => !part.finalAnswerField).every(part => Boolean(part.definition)),
  true,
  "Every individual answer should provide concise pupil feedback.",
);

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2015-q3", "Question 3 should use the 2015 interactive guide score.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "common time").marks, 1, "Question 3(a) should accept common time.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Moderato").marks, 1, "Question 3(b) should accept Moderato.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Adagio").marks, 1, "Question 3(b) should accept Adagio.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "B flat").marks, 1, "Question 3(e) should accept B flat.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "B").marks, 0, "Question 3(e) should reject B natural.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "A4,A4,Bb4,C5").marks, 1, "Question 3(f) should mark the complete missing-note answer.");

const questionFive = paper.questions.find(question => question.id === "q5");
const questionSix = paper.questions.find(question => question.id === "q6");
const questionEightData = paper.questions.find(question => question.id === "q8");
assert.equal(questionFive.introTotalMarksIndex, 1, "Question 5's combined mark should sit beside the source instruction row.");
assert.equal(questionSix.totalMarksOnLastPart, true, "Question 6's combined mark should sit beside its final sentence-completion row.");
assert.equal(parts.get("q8a").finalAnswerMarks, 5, "Question 8's mark should appear beside the ruled final-answer area.");
assert.equal(questionEightData.introTotalMarks, undefined, "Question 8 should not add an invented mark beside the introductory text.");

assert.equal(marking.markSubquestion(parts.get("q2b"), "Trumpets").marks, 1, "Question 2 should accept the named muted instrument.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "Brass").marks, 0, "Question 2 should not accept a family name where the marking scheme requires trumpet.");
assert.ok(["pitsicato", "pitzicato", "pitsickato"].every(answer => marking.markSubquestion(parts.get("q2c"), answer).marks === 1), "Question 2 should accept the requested clear pizzicato misspellings.");

assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria"]).marks, 1, "One correct choice in Question 4(f) should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria", "Scat singing"]).marks, 1, "A correct and an incorrect choice in Question 4(f) should still earn the correct mark.");
assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria", "Scat singing"]).status, "partial", "One of two marks should display as partially correct.");
assert.equal(marking.markSubquestion(parts.get("q4g"), "Mezzo-soprano").marks, 1, "Question 4(g) should accept the official alternative voice.");

assert.equal(marking.markSubquestion(parts.get("q6a"), "four").marks, 1, "Question 6 should accept a beat number written as a word.");
assert.equal(marking.markSubquestion(parts.get("q6a"), "three").marks, 0, "Question 6 should reject an incorrect beat count.");

assert.equal(marking.markSubquestion(parts.get("q7a2"), "The full orchestra performs the music.").marks, 1, "Question 7(a) should accept natural wording containing the official reason.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "A solo instrument plays with the orchestra.").marks, 0, "Question 7(a) should reject the concerto description excluded by the scheme.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "I can hear tabla drums.").marks, 1, "Question 7(b) should accept a natural sentence containing an official instrument.");

const questionEight = parts.get("q8a");
assert.equal(marking.markSubquestion(questionEight, { final: "3 beats in the bar." }).marks, 0, "Question 8 should reject an incorrect beat count.");
assert.equal(marking.markSubquestion(questionEight, { final: "beats in the bar." }).marks, 0, "Question 8 should require the accepted beat count.");
assert.equal(marking.markSubquestion(questionEight, { final: "4 beats per bar." }).marks, 1, "Question 8 should accept the complete correct metre concept.");
assert.equal(marking.markSubquestion(questionEight, { final: "violin" }).marks, 0, "Question 8 should require violins in the plural.");
assert.equal(marking.markSubquestion(questionEight, { final: "violins" }).marks, 1, "Question 8 should accept violins in the plural.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud then quiet" }).marks, 0, "Question 8 should not replace Italian dynamics with English equivalents.");
assert.equal(marking.markSubquestion(questionEight, { final: "The rhythm repeats and the melody uses repetition." }).marks, 1, "Repetition should earn only one mark when repeated under different headings.");
assert.equal(
  marking.markSubquestion(questionEight, { final: "Allegro, 4 beats in the bar, major, minor and a perfect cadence." }).marks,
  4,
  "Five valid concepts across only two headings should be capped below full marks.",
);
assert.equal(
  marking.markSubquestion(questionEight, { final: "Allegro, 4 beats in the bar, major, flute and crescendo." }).marks,
  5,
  "Five valid concepts across at least three headings should earn full marks.",
);

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") {
    fullAnswers[part.id] = { final: "Allegro, 4 beats in the bar, major, flute and crescendo." };
  } else if (part.type === "checkbox") {
    fullAnswers[part.id] = [...part.answers];
  } else {
    fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
  }
}));

const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2015 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete 2015 paper should be marked automatically.");

console.log("National 5 Music 2015 paper tests passed.");
