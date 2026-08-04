const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2017.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2017);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [5, 5, 4, 6, 4, 5, 6, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, allParts.length);
assert.match(stylesSource, /\.paper-level-h \.subquestion-structured-review \{ margin-left: 0; \}/, "Higher rough-work and final-answer workspaces should remain centred in the paper content area.");

const expectedMarkers = [
  [43.94, 107.04, 211.54, 243.94],
  [77.5, 157.96, 238.14],
  [7.2, 89.22, 105.6, 127.4, 199.42, 232.14],
  [11.78, 221.46, 309.02, 397.04],
  [46.46, 117.02, 232.4, 303.56],
  [116.32, 210.33, 305.76, 395.22, 487.68, 577.88, 664.3],
  [49.32, 125.86, 203.12],
  [106.52, 200.54, 295.42],
];
const durations = [282.78, 329.2, 270.24, 574.96, 380.58, 796.24, 455.42, 401.97];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 34);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Glissando\nIrregular time signatures\nMass\nPedal").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Recit").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Bassoon").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Perfect").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Common time").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Grace note").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Chromatic").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "Impressionism").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Diminished 7th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Jazz").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Jazz funk").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3d"), "G6").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "C").marks, 1);
assert.deepEqual(parts.get("q4a").options.map(item => item.value), ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"]);
assert.equal(marking.markSubquestion(parts.get("q4b"), "sixth").marks, 1);
assert.equal(parts.get("q4c").answerDisplay, "1.5 beats", "Higher 2017 should show the decimal duration first in feedback.");
assert.equal(marking.markSubquestion(parts.get("q4c"), "1.5").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "1½ beats").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "C5,B4,G4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "V I").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4f"), "C4,G3,G3,A3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Basso continuo\nConcertino\nModulation to the relative minor").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Passacaglia").marks, 1);

const q6Correct = ["Major tonality", "Syllabic", "Time changes", "Homophonic", "Musical"];
assert.equal(marking.markSubquestion(parts.get("q6a"), { a: ["Opera"], b: ["Soul"], c: q6Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q6a"), { c: [...q6Correct, "Opera"] }).marks, 4);
const q7Correct = "Major\nPerfect cadence\nSyncopation\nTime changes\nPizzicato\nTrumpet";
assert.equal(marking.markSubquestion(parts.get("q7a"), { final: q7Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q7a"), { final: "Major\nMinor\nVamp" }).marks, 2);

const q8 = parts.get("q8a");
const q8Correct = { 3: "octave", 4: "dominant 7th", 6: "cello", 10: "xylophone", 16: "drum roll" };
assert.equal(q8.lyricLines.length, 18);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "fa36c1aca739d892cd54ecb8790c8d5308fe3899d6dee7b8f2a3e88a73ab6504", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 1: "trill" }).marks, 4);
assert.equal(answerComplete(q8, q8Correct), true);

assert.equal(paper.questions[3].score.sharedNotation, "higher-2017-q4");
assert.match(notationSource, /const HIGHER_2017_Q4_BARS = \[/);
assert.match(notationSource, /function higher2017ScoreSvg\(/);
assert.match(notationSource, /id: "q4d"[\s\S]*id: "q4f"/);
const inventory = notation.getInventory("higher-2017-q4");
assert.equal(inventory.bars.length, 23);
assert.deepEqual(inventory.valueNoteIndices, [2, 3]);
assert.deepEqual(inventory.missingNoteIndices, [0, 1, 2]);
assert.deepEqual(inventory.transposeNoteIndices, [1, 2, 3, 4]);
assert.equal(inventory.finalBarline, "single");
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["C4", "quaver"], ["G3", "quaver"], ["G3", "quaver"], ["A3", "crotchet"]]);
assert.equal(inventory.transpose[1].tieToNext, true, "The transposed G quavers should retain their tie.");
assert.equal(inventory.transpose[2].tiedFromPrevious, true, "The transposed G quavers should retain their tie.");
assert.equal(inventory.lyrics.length, 23);
assert.deepEqual(inventory.lyricOffsets[2], [0, -8, -8, 0, -8, 18]);
assert.deepEqual(inventory.lyricOffsets[3], [30, 0, 0, 0, 0, 0]);
assert.deepEqual(inventory.lyricOffsets[5], [0, 0, 0, 0, 0, 15]);
assert.equal(inventory.lyricOffsets[6], undefined);
assert.deepEqual(inventory.lyricOffsets[12], [0, 10, 0, 0]);
assert.deepEqual(inventory.lyricOffsets[18], [0, -8, 10, 0, 2, 0]);
assert.deepEqual(inventory.lyricOffsets[19], [0, 0, 0, 0, 15, 0]);
assert.deepEqual(inventory.lyricOffsets[21], [0, -8, 8, 0, 0, 15]);
assert.deepEqual(inventory.lyricPositionIndices[0], [0, 1, null, 3]);
assert.deepEqual(inventory.lyricPositionIndices[3], [0, 2, null, null]);
assert.deepEqual(inventory.lyricPositionIndices[5], [0, 1, 2, null, 4, 5]);
assert.deepEqual(inventory.lyricPositionIndices[18], [0, 1, 2, null, 4, 5]);
assert.deepEqual(inventory.lyricPositionIndices[19], [null, null, null, 1, 2, null]);
assert.deepEqual(inventory.lyricPositionIndices[21], [0, 1, 2, null, 4, 5]);
assert.deepEqual(inventory.lyrics[5], ["when", "Sep-", "tem-", null, "ber", "ends__."]);
assert.deepEqual(inventory.lyrics[6], [null, null, null, null]);
assert.deepEqual(inventory.lyrics[15], [null]);
assert.deepEqual(inventory.lyrics[16], ["As", "my__", null, "mem-", "o-"]);
assert.deepEqual(inventory.lyrics[17], ["ry__", null, "rests,", null, null, "but"]);
assert.deepEqual(inventory.lyrics[18], ["nev-", "er", "for-", null, "gets", "what__"]);
assert.deepEqual(inventory.lyrics[19], [null, null, null, "I", "lost____.", null]);
assert.deepEqual(inventory.lyrics[21], ["when", "Sep-", "tem-", null, "ber", "ends______"]);
assert.deepEqual(inventory.scoreLayout.systems, [124, 294, 449, 604, 775, 928, 1088]);
assert.deepEqual(inventory.scoreLayout.barEnds[0], [279, 480, 710, 915]);
assert.deepEqual(inventory.scoreLayout.barEnds[6], [525, 915]);
assert.deepEqual(inventory.scoreLayout.boxes.interval, { x: 625, y: 18, width: 85, height: 167 });
assert.deepEqual(inventory.scoreLayout.boxes.value, { x: 198, y: 216, width: 102, height: 137 });
assert.deepEqual(inventory.scoreLayout.boxes.notes, { x: 691, y: 384, width: 136, height: 121 });
assert.deepEqual(inventory.scoreLayout.boxes.chords, { x: 7, y: 692, width: 536, height: 143 });
assert.deepEqual(inventory.scoreLayout.boxes.transpose, { x: 170, y: 1024, width: 262, height: 244 });
assert.equal(inventory.scoreLayout.bassTop, 1205);

const expectedBars = [
  ["A4:dottedCrotchet", "B4:quaver", "B4:quaver", "B4:dottedCrotchet"],
  ["A4:crotchet", "B4:quaver", "B4:quaver", "B4:crotchet", "rest:crotchetRest"],
  ["A4:crotchet", "B4:quaver", "B4:quaver", "B4:quaver", "G4:crotchet", "E5:quaver"],
  ["E5:quaver", "D5:crotchet", "B4:semiquaver", "A4:semiquaver", "G4:crotchet", "rest:crotchetRest"],
  ["D5:crotchet", "G4:quaver", "G4:quaver", "G4:crotchet", "rest:crotchetRest"],
  ["D5:crotchet", "C5:quaver", "G4:quaver", "G4:quaver", "A4:crotchet", "B4:quaver"],
  ["B4:crotchet", "rest:crotchetRest", "rest:minimRest"],
  ["rest:semibreveRest"],
  ["A4:dottedCrotchet", "B4:quaver", "B4:quaver", "B4:dottedCrotchet"],
  ["A4:crotchet", "B4:quaver", "B4:quaver", "B4:crotchet", "rest:crotchetRest"],
  ["C5:crotchet", "B4:crotchet", "G4:quaver", "A4:crotchet", "B4:quaver"],
  ["B4:crotchet", "rest:crotchetRest", "rest:minimRest"],
  ["A4:dottedCrotchet", "B4:quaver", "B4:quaver", "B4:dottedCrotchet"],
  ["B4:crotchet", "F♯4:quaver", "F♯4:quaver", "F♯4:crotchet", "rest:quaverRest", "D4:quaver"],
  ["B4:crotchet", "A4:crotchet", "G4:quaver", "G4:quaver", "A4:quaver", "A4:quaver"],
  ["A4:crotchet", "rest:crotchetRest", "rest:minimRest"],
  ["A4:dottedCrotchet", "B4:quaver", "B4:quaver", "B4:crotchet", "B4:quaver"],
  ["A4:quaver", "B4:crotchet", "B4:quaver", "B4:crotchet", "rest:quaverRest", "E4:quaver"],
  ["A4:crotchet", "B4:quaver", "B4:quaver", "B4:quaver", "G4:crotchet", "E5:quaver"],
  ["E5:quaver", "D5:crotchet", "B4:semiquaver", "A4:semiquaver", "G4:crotchet", "rest:crotchetRest"],
  ["D5:crotchet", "G4:quaver", "G4:quaver", "G4:crotchet", "rest:crotchetRest"],
  ["D5:crotchet", "C5:quaver", "G4:quaver", "G4:quaver", "A4:crotchet", "A4:quaver"],
  ["A4:quaver", "G4:crotchet", "rest:quaverRest", "rest:minimRest"],
];
assert.deepEqual(inventory.bars.map(item => item.notes.map(note => `${note.rest ? "rest" : note.pitch}:${note.rhythm}`)), expectedBars);
assert.equal(inventory.bars[2].notes[2].tieToNext, true, "Bar 3's third B should tie to its fourth B.");
assert.equal(inventory.bars[2].notes[3].tiedFromPrevious, true, "Bar 3's fourth B should receive the tie from the third note.");
assert.equal(inventory.bars[20].notes[1].tieToNext, undefined, "Bar 21's second note should no longer carry the tie.");
assert.equal(inventory.bars[20].notes[2].tieToNext, true, "Bar 21's third note should tie to its fourth note.");
assert.equal(inventory.bars[20].notes[3].tiedFromPrevious, true, "Bar 21's fourth note should receive the tie from the third note.");
assert.equal(inventory.bars[21].notes[2].tieToNext, true, "Bar 22's G quavers should retain their tie.");
assert.equal(inventory.bars[21].notes[3].tiedFromPrevious, true, "Bar 22's G quavers should retain their tie.");
assert.equal(inventory.bars[21].notes[5].tieToNextBar, true, "The printed tie from bar 22 into bar 23 should remain.");
assert.equal(inventory.bars[22].slurs, undefined, "Bar 23 should not contain the unwanted internal tie.");
const rhythmBeats = { semiquaver: .25, quaver: .5, crotchet: 1, dottedCrotchet: 1.5, minimRest: 2, semibreveRest: 4, quaverRest: .5, crotchetRest: 1 };
inventory.bars.forEach((bar, index) => assert.equal(bar.notes.reduce((sum, item) => sum + rhythmBeats[item.rhythm], 0), 4, `Bar ${index + 1} should total four beats.`));
[0, 8, 12, 16].forEach(index => assert.deepEqual(inventory.bars[index].beamGroups, [], `Bar ${index + 1}'s tied quavers cross a beat boundary and must remain unbeamed.`));

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; this.textContent = ""; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  remove() {}
}
const previousDocument = global.document;
const previousSymbols = global.BRAVURA_SYMBOLS;
global.BRAVURA_SYMBOLS = new Proxy({}, { get: (_target, key) => String(key) });
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };
const notationWrap = new FakeSvgNode("div");
notation.renderSharedScore({ innerHTML: "", querySelector: () => notationWrap }, paper.questions[3], { q4a: "C", q4b: "5th", q4c: "2", q4d: "C5,B4,G4", q4e: "D G", q4f: "C4,G3,G3,A3" }, null, { q4b: "incorrect", q4c: "incorrect" });
const scoreSvg = notationWrap.children.find(node => node.name === "svg" && node.attributes["aria-label"] === "Marked Higher 2017 Question 4 score");
assert.ok(scoreSvg);
assert.equal(scoreSvg.children.filter(node => String(node.attributes.class || "").includes("higher-2017-chord-answer-box")).length, 4, "The printed C/IV boxes and the two empty chord-answer boxes should all remain visible.");
const bassSharpGlyph = scoreSvg.children.find(node => node.textContent === "sharp" && Number(node.attributes.y) > 1200);
assert.equal(Number(bassSharpGlyph?.attributes.y), 1216, "The bass-clef G-major sharp should sit on the fourth staff line.");
const chordBoxYs = scoreSvg.children
  .filter(node => String(node.attributes.class || "").includes("higher-2017-chord-answer-box"))
  .map(node => Number(node.attributes.y));
assert.ok(chordBoxYs.includes(696), "The printed C/IV chord boxes should move up 15px.");
assert.ok(chordBoxYs.filter(y => y === 711).length >= 2, "The two pupil chord boxes should move up 15px.");
const wholeRestGlyph = scoreSvg.children.find(node => node.textContent === "wholeRest");
assert.ok(wholeRestGlyph, "Higher 2017's whole-bar rest should be rendered.");
assert.equal(Number(wholeRestGlyph.attributes.x), 162, "The whole-bar rest in bar 8 should be centred between its source-aligned barlines.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;

const completeAnswers = {
  q1a: "Glissando\nIrregular time signatures\nMass\nPedal", q1b: "Recitative",
  q2a: "Bassoon", q2b: "Perfect", q2c: "4/4", q2d: "Acciaccatura", q2e: "Chromatic",
  q3a: "Impressionist", q3b: "Diminished 7th", q3c: "Jazz funk", q3d: "Added 6th",
  q4a: "4/4", q4b: "6th", q4c: "1.5", q4d: "C5,B4,G4", q4e: "D G", q4f: "C4,G3,G3,A3",
  q5a: "Basso continuo\nConcertino\nModulation to the relative minor", q5b: "Passacaglia",
  q6a: { a: [], b: [], c: q6Correct }, q7a: { final: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2017 paper tests passed.");
