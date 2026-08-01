const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2019.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2019, "The 2019 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2019 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [7, 4, 6, 7, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["2", "3", "4", "5", "6", "7", "8", "9"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)),
  [
    [6.44, 67.36, 113.0, 205.7, 324.86, 365.78],
    [98.08, 187.26, 278.7],
    [12.1, 121.28, 178.68, 234.7],
    [6.92, 48.68, 84.78, 173.7, 253.28, 331.82, 377.3],
    [87.76, 138.78, 189.8],
    [54.88, 117.7],
    [6.14, 95.1],
    [45.44, 119.68, 194.38],
  ],
  "Every 2019 marker should retain its Whisper-calibrated spoken cue position.",
);
const officialAudioDurations = [418.22, 369.89, 382.8, 424.65, 250.44, 182.91, 187.48, 387.53];
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 30, "The complete paper should contain all thirty expected markers.");
paper.questions.forEach((question, questionIndex) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file that exists.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} markers should be chronological.`);
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < officialAudioDurations[questionIndex]), true, `${question.id} markers should remain within the official track duration.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should be available.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should be available.");
assert.equal(allParts.filter(part => !part.finalAnswerField).every(part => Boolean(part.definition)), true, "Every individual answer should provide concise pupil feedback.");

allParts.forEach(part => {
  if (part.type === "radio") {
    assert.equal(part.options.some(option => option.value === part.answer), true, `${part.id} should display its official answer.`);
    assert.equal(marking.markSubquestion(part, part.answer).marks, part.marks, `${part.id} should award its official mark.`);
    part.options.filter(option => option.value !== part.answer).forEach(option => {
      assert.equal(marking.markSubquestion(part, option.value).marks, 0, `${part.id} should reject ${option.value}.`);
    });
  }
  if (part.type === "checkbox") {
    assert.equal(part.answers.every(answer => part.options.some(option => option.value === answer)), true, `${part.id} should display each official answer.`);
    assert.equal(marking.markSubquestion(part, part.answers).marks, part.marks, `${part.id} should award all official marks for a complete answer.`);
  }
  (part.acceptedAnswers || []).forEach(answer => {
    assert.equal(marking.markSubquestion(part, answer).marks, part.marks, `${part.id} should accept ${answer}.`);
  });
});

assert.equal(marking.markSubquestion(parts.get("q1b"), "Bari-tone").marks, 1, "Question 1(b) should accept an unambiguous hyphenated baritone spelling.");
assert.equal(marking.markSubquestion(parts.get("q1c"), ["Chorus"]).marks, 1, "One correct Question 1(c) selection should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q1c"), ["Chorus", "Coda"]).marks, 1, "A correct and an incorrect Question 1(c) selection should retain the earned mark.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "2 / 4").marks, 1, "Question 2 should accept equivalent time-signature spacing.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "whistle").marks, 1, "Question 2 should accept whistle under the additional guidance.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2019-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 8, "Question 3 should retain all eight printed bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "G maj").marks, 1, "Question 3(a) should accept G maj.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "3/4").marks, 1, "Question 3(b) should accept 3/4.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "minim").marks, 1, "Question 3(c) should accept minim under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "D5,B4,G4").marks, 1, "Question 3(d) should accept all three missing pitches in order.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "D5,G4,B4").marks, 0, "Question 3(d) should reject reordered missing notes.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "semiquaver,semiquaver,semiquaver,semiquaver").marks, 1, "Question 3(e) should require all four semiquaver corrections.");
assert.deepEqual(parts.get("q3e").options.map(option => option.value), ["quaver", "dottedCrotchet", "semiquaver"], "Question 3(e) should offer the established quaver-tail, dot and semiquaver tools.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "I–V").marks, 1, "Question 3(f) should accept I–V.");
assert.match(notationSource, /const N5_2019_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
const expectedQuestionThreeBars = [
  'bar([note("B4", "minim"), note("D5", "semiquaver"), note("C5", "semiquaver"), note("B4", "semiquaver"), note("C5", "semiquaver")]',
  'bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G4", "crotchet"), rest()]',
  'bar([note("G5", "dottedCrotchet"), note("A5", "semiquaver"), note("G5", "semiquaver"), note("F♯5", "semiquaver"), note("E5", "semiquaver"), note("D5", "semiquaver"), note("C5", "semiquaver", { accidental: "sharp", accidentalXOffset: -7 })]',
  'bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G4", "crotchet"), rest()], { missingIndices: [0, 1, 2]',
  'bar([note("C5", "dottedQuaver"), note("A4", "semiquaver"), note("F4", "quaver"), note("A4", "quaver"), note("B4", "quaver"), note("C5", "quaver")]',
  'bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G5", "crotchet"), rest()]',
  'note("D5", "crotchet", { accidental: "natural", accidentalXOffset: -5, stemDown: true }), note("C5", "crotchet", { stemDown: true }), note("B4", "crotchet", { stemDown: true }), note("C5", "crotchet", { stemDown: true })], { rhythmCorrectionIndices: [8, 9, 10, 11], positionOffsets: [-20, -20, -20, -20, -20, -20, -10, -10, 3, 3, 0, 0] }',
  'bar([note("B4", "quaver"), note("C5", "semiquaver"), note("B4", "semiquaver"), note("A4", "quaver"), rest("quaverRest"), rest()]',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /function q3Add2019NoteEntryTargets[\s\S]+onAnswerChange\("q3d", value\)/, "Question 3(d) should save notes placed directly on bar 4.");
assert.match(notationSource, /function q3Add2019RhythmEntryTargets[\s\S]+onAnswerChange\("q3e", value\)/, "Question 3(e) should save all four score-applied semiquavers.");
assert.match(notationSource, /const guideScale = \.8/, "Question 3(d)'s given rhythm should be reduced to 80% of its original size.");
assert.match(notationSource, /const boxLeft = positions\[0\] - 25;[\s\S]+const boxRight = positions\[2\] \+ 25;/, "Question 3(d)'s box should stop before the crotchet rest.");
assert.match(notationSource, /barIndex === N5_2019_Q3_BARS\.length - 1[\s\S]+q3-final-thin[\s\S]+q3-final-thick/, "Question 3 should finish with the source paper's double barline.");

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  remove() {}
}
const previousDocument = global.document;
const previousSymbols = global.BRAVURA_SYMBOLS;
const previousConfig = global.SHARED_NOTATION_CONFIG;
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };
global.BRAVURA_SYMBOLS = new Proxy({}, { get: () => "x" });
global.SHARED_NOTATION_CONFIG = { symbols: {}, drawing: {}, stave: { lineGap: 14 } };
const notation = require("../exam-notation.js");
const notationWrap = new FakeSvgNode("div");
const notationContainer = { innerHTML: "", querySelector: () => notationWrap };
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2019 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 620", "The 2019 score should use its full four-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(paper.questions.find(question => question.id === "q5").introTotalMarksIndex, 1, "Question 5's combined mark should remain on the source instruction row.");
assert.equal(paper.questions.find(question => question.id === "q6").introTotalMarksIndex, 0, "Question 6's combined mark should remain on its opening instruction row.");
assert.equal(marking.markSubquestion(parts.get("q6a"), "marimba").marks, 1, "Question 6 should accept marimba under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q6c"), "lead guitar").marks, 1, "Question 6 should accept lead guitar under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Sitar").marks, 1, "Question 7(a) should accept sitar on its own.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Male").marks, 0, "Question 7(b) should reject only one supporting concept.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Male unaccompanied singer").marks, 1, "Question 7(b) should accept two distinct supporting concepts.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "He is singing about his life").marks, 1, "Question 7(b) should apply the official implied male-and-singing example.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "bass" }).marks, 0, "Question 8 should reject bass on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "double bass" }).marks, 0, "Question 8 should reject double bass for bass guitar.");
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "acoustic guitar" }).marks, 0, "Question 8 should reject acoustic guitar.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud and quiet" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
const repeatedOnce = marking.markSubquestion(questionEight, { final: "Repetition, chromatic, drum fills, syncopation and cello." });
assert.equal(repeatedOnce.marks, 5, "Question 8 should retain its five-mark limit.");
assert.equal(Object.values(repeatedOnce.matchedConcepts).flat().filter(label => label === "Repetition or ostinato").length, 1, "Repetition should only be credited once across headings.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Chromatic, discord, inverted pedal, anacrusis, drum fills, cello and forte." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.melody.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Chromatic, discord, anacrusis, drum fills and syncopation." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Chromatic, discord, anacrusis, drum fills and cello." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Chromatic, discord, anacrusis, drum fills and cello." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "Sitar";
  else if (part.id === "q7b2") fullAnswers[part.id] = "Male unaccompanied singer";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2019 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2019 paper tests passed.");
