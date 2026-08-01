const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2018.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2018, "The 2018 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2018 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [8, 4, 6, 6, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
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
    [6.52, 55.8, 115.8, 160.8, 319.72, 398.68],
    [114.3, 220.78, 326.64],
    [7.44, 127.96, 221.98, 316.08],
    [5.74, 92.32, 137.32, 189.04, 298.56, 356.2],
    [100.44, 144.68, 184.78],
    [64.16, 147.16],
    [6.28, 94.48],
    [44.3, 113.64, 182.82],
  ],
  "Every 2018 marker should retain its Whisper-calibrated spoken cue position.",
);
const officialAudioDurations = [459.703, 434.756, 523.938, 477.336, 232.647, 231.68, 174.002, 396.539];
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 29, "The complete paper should contain all twenty-nine expected markers.");
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

assert.equal(marking.markSubquestion(parts.get("q1d"), ["Middle 8"]).marks, 1, "One correct Question 1(d) selection should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q1d"), ["Middle 8", "Canon"]).marks, 1, "A correct and an incorrect Question 1(d) selection should retain the earned mark.");
assert.equal(marking.markSubquestion(parts.get("q1e"), "rall.").marks, 1, "Question 1(e) should accept rall.");
assert.equal(marking.markSubquestion(parts.get("q1e"), "accelerando").marks, 0, "Question 1(e) should reject accelerando.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "vibrato").marks, 1, "Question 2 should accept vibrato under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "2 / 4").marks, 1, "Question 2 should accept equivalent time-signature spacing.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "V to I").marks, 1, "Question 2 should accept V to I.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2018-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 16, "Question 3 should retain all sixteen printed bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "C maj").marks, 1, "Question 3(a) should accept C maj.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "4/4").marks, 1, "Question 3(b) should accept 4/4.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "dottedCrotchet,quaver").marks, 1, "Question 3(c) should accept the complete corrected rhythm.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "The cadence ends on chord V").marks, 1, "Question 3(d) should accept an answer ending on chord V.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "bar-8").marks, 1, "Question 3(e) should accept D above bar 8.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "bar-9").marks, 1, "Question 3(e) should accept D above bar 9.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "D5,C5").marks, 1, "Question 3(f) should accept D then C crotchets.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "C5,D5").marks, 0, "Question 3(f) should reject reversed notes.");
assert.equal(parts.get("q3f").inlineNotationControls, true, "Question 3(f) should keep its Clear control beside the prompt.");
assert.match(notationSource, /const N5_2018_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
const expectedQuestionThreeBars = [
  'bar([rest(), note("E4", "crotchet"), note("G4", "minim")])',
  'bar([note("E4", "minim"), note("C4", "crotchet"), note("D4", "crotchet")], { rhythmCorrectionIndices: [1, 2] })',
  'bar([note("E4", "crotchet"), note("G4", "crotchet"), note("D5", "crotchet"), note("C5", "crotchet")])',
  'bar([note("A4", "semibreve")])',
  'bar([note("A4", "minim"), note("D5", "crotchet"), note("B4", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] })',
  'bar([note("G4", "minim"), note("C4", "minim")])',
  'bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "dottedCrotchet"), note("F4", "quaver")])',
  'bar([note("D4", "dottedMinim"), rest()])',
  'bar([rest(), note("E4", "crotchet"), note("G4", "dottedCrotchet"), note("A4", "quaver")])',
  'bar([note("G4", "semibreve")])',
  'bar([note("E4", "crotchet"), note("G4", "crotchet"), note("D5", "crotchet"), note("C5", "crotchet")], { missingIndices: [2, 3] })',
  'bar([note("A4", "quaver"), note("G4", "quaver"), note("A4", "dottedMinim")], { beamGroups: [{ start: 0, end: 1 }] })',
  'bar([note("A4", "minim"), note("D4", "crotchet"), note("E4", "quaver"), note("F4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] })',
  'bar([note("A4", "crotchet"), note("G4", "minim"), note("A4", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 2, end: 3 }] })',
  'bar([note("F5", "crotchet"), note("E5", "crotchet"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 2, end: 5 }] })',
  'bar([note("C5", "semibreve")])',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /rhythmCorrectionIndices: \[1, 2\]/, "Question 3 should expose the two rhythm-correction notes in bar 2.");
assert.match(notationSource, /missingIndices: \[2, 3\]/, "Question 3 should expose the two missing notes in bar 11.");
assert.match(notationSource, /barIndex === 15[\s\S]+q3-final-thin[\s\S]+q3-final-thick/, "Question 3 should end with the source paper's double barline.");
assert.match(notationSource, /barIndex === 1[\s\S]+x: start \+ 2[\s\S]+width: end - start - 4[\s\S]+"Rhythm"/, "Question 3's rhythm box should surround the whole of bar 2.");
assert.match(notationSource, /const cadenceBoxTop = cadenceTop - 76[\s\S]+"Cadence:"/, "Question 3's cadence box should sit above bars 7 and 8.");
assert.match(notationSource, /"Two bar introduction\."[\s\S]+"text-anchor": "middle"[\s\S]+q3-introduction-label/, "Question 3's introduction text should be centred in its original box.");
assert.match(notationSource, /function q3Add2018RhythmEntryTargets[\s\S]+onAnswerChange\("q3c", value\)/, "Question 3(c) should save score-applied rhythm additions.");
assert.match(notationSource, /function q3Add2018BarLabelTargets[\s\S]+onAnswerChange\("q3e", `bar-\$\{barIndex \+ 1\}`\)/, "Question 3(e) should place D directly above a selected bar.");
assert.match(notationSource, /function q3Add2018NoteEntryTargets/, "Question 3(f) should provide direct missing-note entry.");

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
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2018 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 560", "The 2018 score should use its full four-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q4e"), "mezzo").marks, 1, "Question 4(e) should accept mezzo.");
assert.equal(marking.markSubquestion(parts.get("q4e"), "soprano").marks, 0, "Question 4(e) should reject soprano on its own.");
assert.equal(paper.questions.find(question => question.id === "q5").introTotalMarksIndex, 1, "Question 5's combined mark should remain on the source instruction row.");
assert.equal(paper.questions.find(question => question.id === "q6").totalMarksOnLastPart, true, "Question 6's combined mark should remain beside the final completion row.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Full orchestra").marks, 1, "Question 7(a) should accept full orchestra.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Orchestra with a solo instrument").marks, 0, "Question 7(a) should reject a featured solo instrument.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Words of praise").marks, 1, "Question 7(b) should accept words of praise.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums for bodhran.");
assert.equal(marking.markSubquestion(questionEight, { final: "bass" }).marks, 0, "Question 8 should reject bass on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "Bodhran drum" }).marks, 1, "Question 8 should accept bodhran when the instrument is named.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud and quiet" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
const repeatedOnce = marking.markSubquestion(questionEight, { final: "Repetition, grace notes, accents, dotted rhythms and bodhran." });
assert.equal(repeatedOnce.marks, 5, "Question 8 should retain its five-mark limit.");
assert.equal(Object.values(repeatedOnce.matchedConcepts).flat().filter(label => label === "Repetition").length, 1, "Repetition should only be credited once across headings.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Grace notes, drone, accents, anacrusis, dotted rhythms, bodhran and forte." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only the concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.melody.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Grace notes, drone, accents, anacrusis and dotted rhythms." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Grace notes, drone, accents, anacrusis and bodhran." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Grace notes, drone, accents, anacrusis and bodhran." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "Full orchestra";
  else if (part.id === "q7b2") fullAnswers[part.id] = "Words of praise";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2018 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2018 paper tests passed.");
