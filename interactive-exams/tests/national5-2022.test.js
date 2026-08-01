const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2022.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2022, "The 2022 paper should be available through the shared registry.");
assert.equal(paper.questions.length, 8, "The 2022 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [7, 4, 6, 7, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["02", "03", "04", "05", "06", "07", "08", "09"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);

const expectedMarkers = [
  [6.42, 51.2, 90.08, 134.68, 188.72, 267.54],
  [97.3, 176.96, 257.22],
  [7.48, 138.16, 216.52, 295.16],
  [6.28, 89.1, 173.12, 220.58, 268.24, 376.34],
  [83.66, 140.5, 197.6],
  [54.42, 142.1],
  [6.66, 77.02],
  [37.96, 136.4, 235.24],
];
const officialAudioDurations = [321.02, 338.21, 464.98, 465.27, 263.18, 231.58, 148.9, 450.95];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers, "Every marker should retain its Whisper-calibrated spoken cue position.");
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
    assert.equal(part.answers.every(answer => part.options.some(option => option.value === answer)), true, `${part.id} should display every official answer.`);
    assert.equal(marking.markSubquestion(part, part.answers).marks, part.marks, `${part.id} should award all official marks.`);
  }
  (part.acceptedAnswers || []).forEach(answer => {
    assert.equal(marking.markSubquestion(part, answer).marks, part.marks, `${part.id} should accept ${answer}.`);
  });
});

assert.equal(marking.markSubquestion(parts.get("q1d"), "Minimalist music").marks, 1, "Question 1(d) should accept the style followed by music.");
assert.equal(marking.markSubquestion(parts.get("q1e"), ["Vamp"]).marks, 1, "One correct Question 1(e) selection should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q1f"), "Celtic harp").marks, 1, "Question 1(f) should accept Celtic harp.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "2 / 4").marks, 1, "Question 2 should accept equivalent time-signature spacing.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "marimba").marks, 1, "Question 2 should accept marimba under the additional guidance.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2022-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 16, "Question 3 should retain all sixteen printed bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.deepEqual(parts.get("q3a").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(a) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3a"), "Moderato").marks, 1, "Question 3(a) should accept Moderato.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "minim").marks, 1, "Question 3(b) should accept minim under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "mf").marks, 1, "Question 3(c) should accept mezzo forte.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "8ve").marks, 1, "Question 3(d) should accept 8ve.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "G4,G4").marks, 1, "Question 3(e) should require both G notes in order.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "F4,F4").marks, 0, "Question 3(e) should reject the wrong pitches.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "ends on V").marks, 1, "Question 3(f) should accept the official chord-V description.");
assert.match(notationSource, /const N5_2022_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
assert.match(notationSource, /note\("G4", "minim", \{ tieToNextBar: true \}\)[\s\S]+bar\(\[note\("G4", "dottedMinim", \{ tiedFromPreviousBar: true \}\)/, "Question 3 bars 1 and 2 should tie G4 across the barline.");
assert.match(notationSource, /x: x - 15, y: top - 70, width: 40, height: 142/, "Question 3 bar 5 box should move 5px right.");
assert.match(notationSource, /function q3MusicStart2022\(barIndex\) \{[\s\S]+?\? 102 : 74\)/, "Question 3 first-system music start should move 20px left.");
assert.match(notationSource, /function q3BarWidth2022\(barIndex\) \{[\s\S]+?Q3_STAFF\.right - q3MusicStart2022\(barIndex\)/, "Question 3 should redistribute the freed first-system width across equal bars.");
assert.match(notationSource, /q3DrawTimeSignature\(svg, "4\/4", top, "", 0, Q3_STAFF\.left \+ 112\)/, "Question 3 time signature should be moved 20px left.");
assert.match(notationSource, /q3Text\(svg, "Interval", \{ x: left \+ 12, y: top - 33/, "Question 3 Interval label should be moved down 10px.");
assert.match(notationSource, /y: top - 57, width: end - left - 2, height: 133/, "Question 3 Cadence box should be shortened from the top by 15px.");
assert.match(notationSource, /q3Text\(svg, "Cadence", \{ x: left \+ 12, y: top - 38/, "Question 3 Cadence label should be moved down 5px.");
assert.match(notationSource, /const boxWidth = \(right - left\) \* \.85/, "Question 3 bar 13 box should be 15% narrower.");
const expectedQuestionThreeBars = [
  'bar([note("A4", "quaver"), note("G4", "quaver"), note("E4", "quaver"), note("G4", "quaver"), note("G4", "minim", { tieToNextBar: true })]',
  'bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), rest()])',
  'note("G4", "crotchet", { tieToNextBar: true })], { beamGroups: [{ start: 0, end: 3 }, { start: 4, end: 5 }] })',
  'bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), rest()])',
  'bar([note("G4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "minim")]',
  'bar([note("G4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "crotchet"), note("G4", "crotchet")]',
  'bar([note("A4", "quaver"), note("G4", "quaver"), note("E4", "quaver"), note("D4", "quaver"), note("E4", "quaver"), note("G4", "quaver"), note("G4", "crotchet", { tieToNextBar: true })]',
  'bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), note("C4", "quaver"), note("C4", "quaver")]',
  'bar([note("C5", "minim"), note("C5", "minim")])',
  'bar([note("G4", "dottedMinim"), note("E4", "quaver"), note("D4", "quaver")]',
  'bar([note("C4", "minim"), note("C5", "minim")])',
  'bar([note("A4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "minim", { tiedFromPrevious: true }), note("C5", "quaver"), note("C5", "quaver")]',
  'bar([note("B4", "quaver"), note("G4", "quaver"), note("G4", "quaver"), note("G4", "quaver"), note("G4", "dottedCrotchet"), note("G4", "quaver")], { missingIndices: [4, 5]',
  'bar([note("A4", "quaver"), note("F4", "quaver"), note("F4", "quaver"), note("F4", "quaver"), note("F4", "minim")]',
  'bar([note("G4", "quaver"), note("E4", "quaver"), note("E4", "quaver"), note("E4", "quaver"), note("E4", "crotchet"), note("G4", "crotchet")]',
  'bar([note("F4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "minim")]',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /function q3Add2022NoteEntryTargets[\s\S]+onAnswerChange\("q3e", value\)/, "Question 3(e) should save notes placed directly on bar 13.");
assert.match(notationSource, /q3CalibratedSymbol\(svg, "mezzoPiano"/, "Question 3 should retain the printed mezzo-piano marking.");

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
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2022 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 570", "The 2022 score should use its full four-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q6b"), "marching band").marks, 0, "Question 6 should reject marching band.");
assert.equal(marking.markSubquestion(parts.get("q6b"), "military band").marks, 1, "Question 6 should accept military band.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Jazz").marks, 1, "Question 7(a) should accept jazz on its own.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Jazz funk").marks, 0, "Question 7(a) should reject a different named jazz style.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Improvised nonsense words").marks, 1, "Question 7(a) should accept an official supporting reason.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Scots snap").marks, 1, "Question 7(b) should accept Scots snap.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "gradual change of tempo" }).marks, 0, "Question 8 should reject a gradual change of tempo.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Chromatic, contrary motion, accents, syncopation, piano and allegro." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.melody.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Chromatic, contrary motion, accents, syncopation and dotted rhythms." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Chromatic, contrary motion, accents, syncopation and piano." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Chromatic, contrary motion, accents, syncopation and piano." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "Jazz";
  else if (part.id === "q7b2") fullAnswers[part.id] = "Scots snap";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
assert.equal(marking.markPaper(paper, {}).score, 0, "A blank 2022 paper should score zero.");
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2022 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2022 paper tests passed.");
