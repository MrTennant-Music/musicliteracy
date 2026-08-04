const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2019.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const uiSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-ui.js"), "utf8");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");

const parts = new Map(paper.questions.flatMap(question => question.subquestions).map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2019);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [5, 5, 6, 3, 5, 5, 6, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal([...parts.values()].reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, parts.size);

const expectedMarkers = [
  [42.64, 107.28, 202.18, 272.94],
  [77.18, 173.36, 270.82],
  [12.22, 218.24, 304.16, 390.24],
  [18.66, 64.08, 114.82],
  [115.78, 204.14, 290.04, 373.24, 454.56, 537.38, 610.02],
  [44.5, 107.7, 170.96, 263.98],
  [51.1, 115.74, 181.42],
  [99.9, 162.52, 225.98],
];
const durations = [360.12, 377.29, 567.33, 182.05, 743.76, 324.13, 422.4, 303.44];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 31);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Melismatic\nObbligato\nOratorio").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Recit").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q1c"), "Plagal cadence").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Harmonic").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Portamento").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Double bass").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Bass").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Tremolo").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Ground bass").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "6/8").marks, 1);
assert.deepEqual(parts.get("q3a").options.map(item => item.value), ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"]);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Perfect fifth").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "V VI").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3d"), "G4,F4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3e"), "quaverRest").marks, 1);
assert.deepEqual(parts.get("q3e").options.map(item => item.value), ["semibreveRest", "minimRest", "crotchetRest", "quaverRest"]);
assert.match(stylesSource, /\.notation-rhythm-option-glyph\.is-rest-tool \.rhythm-glyph-accent\s*\{\s*top:\s*-10px;/);
assert.match(stylesSource, /\[data-subquestion="q3c"\] \.answer-reference-grid\s*\{\s*margin-bottom:\s*0;/);
assert.match(notationSource, /semibreveRest:\s*"\\uE4F4"/);
assert.match(notationSource, /minimRest:\s*"\\uE4F5"/);
assert.match(notationSource, /clearButton\.addEventListener\("click", \(\) => \{[\s\S]*?refresh\(""\);/);
assert.match(uiSource, /rerenderNotationControl\?\.\(""\);/);
assert.equal(marking.markSubquestion(parts.get("q3f"), "A3,A3,C4,A3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4ai"), "Harmonics").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4aii"), "Mordent").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4b"), "Chamber music").marks, 1);
assert.equal(parts.get("q4ai").label, "(a)");
assert.equal(parts.get("q4ai").markOnAnswerPrompt, true);
assert.equal(parts.get("q4ai").answerPromptLabel, "(i)");
assert.equal(parts.get("q4ai").promptLines[2], "");

const q5Correct = ["Chamber music", "Modulation to relative major", "Perfect cadence", "Simple time", "Imitation"];
assert.equal(marking.markSubquestion(parts.get("q5a"), { a: [], b: [], c: q5Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q5a"), { c: [...q5Correct, "Rubato"] }).marks, 4);
assert.equal(marking.markSubquestion(parts.get("q6a"), "Harpsichord\nInterrupted cadence\nIrregular time signatures\nTierce de Picardie").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q6b"), "Sonata").marks, 1);

const q7Correct = "Baroque\nBasso continuo\nMajor\nPerfect cadence\nCello\nHarpsichord";
assert.equal(marking.markSubquestion(parts.get("q7a"), { final: q7Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q7a"), { final: "Baroque\nBasso continuo\nConcerto" }).marks, 2);

const q8 = parts.get("q8a");
const q8Correct = { 1: "con sordino", 4: "sequence", 8: "chromatic", 10: "minor", 14: "dominant 7th" };
assert.equal(q8.lyricLines.length, 15);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "1486508ebc9f32366243dea1b11e905ec9211b3d2010bdb4407bbc830a469362", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { 1: "con sordino", 5: "sequence", 10: "chromatic, minor", 14: "dominant 7th" }).marks, 5);
assert.equal(answerComplete(q8, { 1: "con sordino", 5: "sequence", 10: "chromatic, minor", 14: "dominant 7th" }), true);

assert.equal(paper.questions[2].score.sharedNotation, "higher-2019-q3");
assert.match(notationSource, /const HIGHER_2019_Q3_BARS = \[/);
assert.match(notationSource, /function higher2019ScoreSvg\(/);
const inventory = notation.getInventory("higher-2019-q3");
assert.equal(inventory.bars.length, 25);
assert.equal(inventory.lyrics.length, 25);
assert.deepEqual(inventory.lyricTextAnchors, { 2: { 0: "start" }, 4: { 0: "start" }, 5: { 1: "start" }, 8: { 1: "start" }, 9: { 1: "start" } });
assert.equal(crypto.createHash("sha256").update(JSON.stringify(inventory.lyrics)).digest("hex"), "dc824c24c7e37cc94d15107eca759a713cfd5c481577191d09cc959d025b8ad5", "The source-aligned lyric underlay should retain its exact syllable placement.");
assert.deepEqual(inventory.scoreLayout.systems, [105, 260, 480, 680, 850, 1025, 1205]);
assert.deepEqual(inventory.scoreLayout.barEnds, [
  [267, 445, 615, 915],
  [240, 483, 655, 915],
  [296, 515, 655, 915],
  [266, 447, 626, 915],
  [335, 483, 770, 915],
  [380, 645, 915],
  [447, 655],
]);
assert.deepEqual(inventory.scoreLayout.boxes, {
  time: { x: 24, y: 15, width: 190, height: 50 },
  interval: { x: 270, y: 15, width: 330, height: 180 },
  chords: { x: 296, y: 384, width: 355, height: 185 },
  notes: { x: 263, y: 584, width: 345, height: 180 },
  rest: { x: 82, y: 949, width: 290, height: 160 },
  transpose: { x: 82, y: 1135, width: 350, height: 298 },
});
assert.deepEqual(inventory.scoreLayout.bassStaff, { left: 15, right: 447, top: 1362, barlineX: 447 });
assert.deepEqual(inventory.scoreLayout.givenChordBox, { x: 97, y: 387, width: 48, rowHeight: 39 });
assert.equal(inventory.scoreLayout.timeSignatureX, 123);
assert.deepEqual(inventory.scoreLayout.chordAnswerBoxes, [
 { x: 312, y: 421, width: 40, height: 42 },
 { x: 534, y: 421, width: 40, height: 42 },
]);
assert.deepEqual(inventory.intervalBars, [2, 3]);
assert.deepEqual(inventory.chordBars, [10, 11]);
assert.deepEqual(inventory.missingNoteBars, [14, 15]);
assert.equal(inventory.missingRestBar, 21);
assert.equal(inventory.transposeBar, 24);
assert.deepEqual(inventory.bars.map(bar => bar.notes.filter(item => !item.rest).map(item => item.pitch)), [
  ["F4"], ["C5"], ["F4"], ["F4", "G4", "A4"],
  ["Bb4"], ["Bb4", "A4", "A4"], ["G4"], [],
  ["D4", "D4", "D4"], ["D4", "E4", "E4"], ["F4"], ["G4", "A4", "A4", "Bb4"],
  ["A4"], ["G4"], ["F4"], [],
  ["E4", "A4", "A4", "C5", "E5"], ["D5"], ["E4", "A4", "A4", "C5", "E5"], ["D5"],
  ["F5", "F5", "E5", "D5"], ["C5", "D5", "D5"], ["C5", "C5", "C5"],
  ["A4", "A4", "C5", "A4"], ["Bb4"],
]);
assert.deepEqual(inventory.bars[13].notes.map(item => [item.pitch, item.rhythm]), [["G4", "dottedMinim"]]);
assert.deepEqual(inventory.bars[14].notes.map(item => [item.pitch, item.rhythm]), [["F4", "dottedMinim"]]);
assert.equal(inventory.bars[20].notes[0].rhythm, "quaverRest");
assert.deepEqual(inventory.bars[8].notes.map(item => [item.pitch, item.rhythm]), [["D4", "quaver"], ["D4", "crotchet"], ["D4", "dottedCrotchet"]]);
assert.deepEqual(inventory.bars[9].notes.map(item => [item.pitch, item.rhythm]), [["D4", "quaver"], ["E4", "crotchet"], ["E4", "dottedCrotchet"]]);
assert.deepEqual(inventory.bars[11].notes.map(item => [item.pitch, item.rhythm]), [["G4", "crotchet"], ["A4", "quaver"], ["A4", "quaver"], ["Bb4", "crotchet"]]);
assert.equal(inventory.bars[8].notes[2].tieToNextBar, true);
assert.equal(inventory.bars[9].notes[0].tiedFromPreviousBar, true);
assert.deepEqual(inventory.bars[11].beamGroups, []);
assert.equal(inventory.bars[11].notes[1].tieToNext, true);
assert.equal(inventory.bars[11].notes[2].tiedFromPrevious, true);
assert.deepEqual(inventory.bars[16].notes.slice(1, 3).map(item => [item.pitch, item.rhythm]), [["A4", "quaver"], ["A4", "quaver"]]);
assert.equal(inventory.bars[16].notes[1].tieToNext, true);
assert.equal(inventory.bars[16].notes[2].tiedFromPrevious, true);
assert.deepEqual(inventory.bars[18].notes.slice(1, 3).map(item => [item.pitch, item.rhythm]), [["A4", "quaver"], ["A4", "quaver"]]);
assert.equal(inventory.bars[18].notes[1].tieToNext, true);
assert.equal(inventory.bars[18].notes[2].tiedFromPrevious, true);
assert.equal(inventory.bars[23].notes[0].rest, true);
assert.equal(inventory.bars[23].notes[0].rhythm, "crotchetRest");
assert.deepEqual(inventory.bars[23].transposeIndices, [1, 2, 3, 4]);
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["A3", "quaver"], ["A3", "quaver"], ["C4", "quaver"], ["A3", "quaver"]]);
assert.equal(inventory.transpose[0].tieToNext, true);
assert.equal(inventory.transpose[1].tiedFromPrevious, true);
assert.equal(inventory.finalBarline, "single");

inventory.bars.forEach((bar, index) => {
  if (bar.fullBarRest) return assert.equal(bar.notes.length, 1);
  const beats = bar.notes.reduce((sum, item) => sum + item.beats, 0);
  assert.equal(beats, 3, `Bar ${index + 1} should total six quavers in 6/8.`);
});

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; this.textContent = ""; this.classList = { add() {}, remove() {}, contains() { return false; }, toggle() {} }; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  remove() {}
}
const previousDocument = global.document;
const previousSymbols = global.BRAVURA_SYMBOLS;
global.BRAVURA_SYMBOLS = new Proxy({}, { get: () => "x" });
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };
const notationWrap = new FakeSvgNode("div");
notation.renderSharedScore({ innerHTML: "", querySelector: () => notationWrap }, paper.questions[2], { q3a: "6/8", q3b: "5th", q3c: "C Dm", q3d: "G4,F4", q3e: "quaverRest", q3f: "A3,A3,C4,A3" }, null, { q3b: "correct" });
assert.equal(notationWrap.children.some(node => node.name === "svg" && node.attributes["aria-label"] === "Marked Higher 2019 Question 3 score"), true);
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;

const completeAnswers = {
  q1a: "Melismatic\nObbligato\nOratorio", q1b: "Recitative", q1c: "Plagal cadence",
  q2a: "Harmonic", q2b: "Glissando", q2c: "Double bass", q2d: "Tremolando", q2e: "Passacaglia",
  q3a: "6/8", q3b: "5th", q3c: "C Dm", q3d: "G4,F4", q3e: "quaverRest", q3f: "A3,A3,C4,A3",
  q4ai: "Harmonics", q4aii: "Mordent", q4b: "Sonata", q5a: { a: [], b: [], c: q5Correct },
  q6a: "Harpsichord\nInterrupted cadence\nIrregular time signatures\nTierce de Picardie", q6b: "Impressionist", q7a: { final: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2019 paper tests passed.");
