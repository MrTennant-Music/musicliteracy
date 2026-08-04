const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2022.js");
const registry = require("../paper-registry.js");

const parts = new Map(paper.questions.flatMap(question => question.subquestions).map(part => [part.id, part]));
assert.equal(registry[paper.id].year, 2022);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [4, 5, 4, 6, 5, 5, 6, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal([...parts.values()].reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, parts.size);
assert.equal(parts.get("q1a").conceptLayout, "flush");

const expectedMarkers = [
  [39.34, 115.38, 191.52], [69.7, 167.72, 265.9], [16.16, 56.86, 101.8, 174.98, 226.56],
  [12.92, 209.88, 300.34, 386.94], [41.72, 117.94, 231.14, 314.44],
  [117.26, 207.32, 298.14, 385.2, 473.1, 559.44, 637.2], [47.48, 143.66, 240.68], [93.5, 185.42, 272.12],
];
const durations = [299.36, 376.11, 285.02, 565.03, 393.9, 768.42, 508.21, 370.76];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 32);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Acciaccatura\nRelative minor\nRondo\nSonata").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Perfect").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Pizz").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Plucking").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Relative major").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Glock").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Dim 7th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "Irregular time signatures").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "G6").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Jazz funk").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3d"), "Musique concrète").marks, 1);
assert.deepEqual(parts.get("q4a").options.map(item => item.value), ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"]);
assert.equal(marking.markSubquestion(parts.get("q4a"), "12/8").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4b"), "G5").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "C7 Dm").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "F5").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "bar-8-note-5").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4e"), "A4,G4,Bb4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4f"), "G3,F3,E3,F3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Lied\nRubato\nTriplets").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Augmentation").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5c"), "Interrupted cadence").marks, 1);

const q6Correct = ["Baroque", "Concerto", "Modulation to relative major", "Sequence", "Basso continuo"];
assert.equal(marking.markSubquestion(parts.get("q6a"), { c: q6Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q6a"), { c: [...q6Correct, "Triplets"] }).marks, 4);
const q7Correct = "Cluster\nCountermelody\nAnacrusis\nSyncopation\nCello\nHarmonics";
assert.equal(marking.markSubquestion(parts.get("q7a"), { final: q7Correct }).marks, 6);

const q8 = parts.get("q8a");
const q8Correct = { 1: "glissando", 3: "perfect", 4: "walking bass", 7: "trill", 12: "scale" };
assert.equal(q8.lyricLines.length, 13);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "ee021fb75d06209e9a362bc3659acd3a3254f517c7df2fab5d5bfd6f79587c0a", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { 2: "glissando", 6: "perfect", 4: "walking bass", 8: "trill", 12: "scale" }).marks, 5);
assert.equal(answerComplete(q8, q8Correct), true);

const inventory = notation.getInventory("higher-2022-q4");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
assert.equal(inventory.bars.length, 13);
assert.equal(inventory.timeSignature, "12/8");
assert.equal(inventory.intervalBar, 4);
assert.deepEqual(inventory.chordBars, [6, 7]);
assert.equal(inventory.tonicBar, 8);
assert.equal(inventory.tonicIndex, 2);
assert.equal(inventory.missingNoteBar, 11);
assert.deepEqual(inventory.transposeBars, [12, 13]);
assert.deepEqual(inventory.scoreLayout.systems, [110, 335, 565, 800, 1030]);
assert.deepEqual(inventory.scoreLayout.staffLefts, [240, 15, 15, 15, 15]);
assert.deepEqual(inventory.scoreLayout.staffRights, [915, 915, 915, 915, 615]);
assert.deepEqual(inventory.scoreLayout.barEnds, [[625, 915], [375, 645, 915], [375, 645, 915], [375, 645, 915], [390, 615]]);
assert.deepEqual(inventory.scoreLayout.bassStaff, { left: 165, right: 615, top: 1160, barlineX: 390 });
assert.deepEqual(inventory.scoreLayout.chordAnswerBoxes, [
  { x: 209, y: 475, width: 42, height: 42 },
  { x: 378, y: 475, width: 42, height: 42 },
]);
assert.equal(inventory.scoreLayout.timeSignatureX, 355);
assert.deepEqual(Object.fromEntries(Object.entries(inventory.scoreLayout.boxes).map(([key, box]) => [key, [box.x, box.y, box.width, box.height]])), {
  time: [235, 15, 385, 165], interval: [305, 220, 120, 195], chords: [195, 440, 275, 190],
  tonic: [640, 465, 275, 165], notes: [650, 655, 155, 220], transpose: [250, 940, 350, 280],
});
assert.match(notationSource, /q3CalibratedSymbol\(svg, "barlineFinal", end, q3YForStep\(4, top\)/);
assert.match(notationSource, /q3CalibratedSymbol\(svg, "barlineFinal", bassRight, q3YForStep\(4, bassTop\)/);
assert.match(notationSource, /higher2015DrawNotes\(svg, missingExpected\.map\(\(\) => note\("B4", "dottedCrotchet", \{ stemDown: false \}\)\), missingXs, systems\[3\] - 58\)/);
assert.deepEqual(inventory.bars[3].missingIndices, [0]);
assert.deepEqual(inventory.bars[10].missingIndices, [0, 1, 2]);
assert.deepEqual(inventory.bars[10].notes.slice(0, 3).map(item => [item.pitch, item.rhythm]), [["A4", "dottedCrotchet"], ["G4", "dottedCrotchet"], ["Bb4", "dottedCrotchet"]]);
assert.deepEqual(inventory.bars[11].transposeIndices, [3, 4, 5]);
assert.deepEqual(inventory.bars[12].transposeIndices, [0]);
assert.deepEqual(inventory.bars[12].notes.map(item => [Boolean(item.rest), item.rhythm]), [[false, "dottedMinim"], [true, "dottedMinimRest"]]);
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["G3", "dottedCrotchet"], ["F3", "crotchet"], ["E3", "quaver"], ["F3", "dottedMinim"]]);
assert.deepEqual(inventory.bars.map(bar => bar.notes.map(item => item.rest ? null : item.pitch)), [
  ["A5", "A5", "A5", "A5", "G5", "F5"],
  ["A5", "A5", "A5", "A5", "G5", "F5"],
  ["Bb5", "A5", "G5", "F5", "C5"],
  ["G5", null, "A5", "C6", "C6", "A5", "G5", "A5", "G5"],
  ["F5", null, "F5", "E5", "D5", "E5"],
  ["A4", null, "C5", "Bb4", "A4", "G4"],
  ["F4", null, "F5", "E5", "D5", "E5"],
  ["A5", "G5", "F5", null, "C5", "C5", "C5", "C5", "D4"],
  ["A4", "G4", "F4", null, "A4", "C5", "F5", "E5", "D5", "E5"],
  ["A4", "F4", "G4", "A4", "C5", "Bb4", "A4", "Bb4"],
  ["A4", "G4", "Bb4", "A4", "F4", "G4"],
  ["A4", "G4", "F4", "G4", "F4", "E4"],
  ["F4", null],
]);
assert.deepEqual(inventory.bars[3].notes.map(item => [item.rhythm, Boolean(item.tieToNext), Boolean(item.tiedFromPrevious)]), [
  ["dottedCrotchet", false, false], ["dottedCrotchetRest", false, false], ["semiquaver", false, false], ["semiquaver", true, false], ["crotchet", false, true], ["semiquaver", false, false], ["semiquaver", false, false], ["quaver", false, false], ["quaver", false, false],
]);
assert.deepEqual(inventory.bars[10].notes.map(item => [item.pitch, item.rhythm]), [["A4", "dottedCrotchet"], ["G4", "dottedCrotchet"], ["Bb4", "dottedCrotchet"], ["A4", "crotchet"], ["F4", "semiquaver"], ["G4", "semiquaver"]]);
assert.equal(inventory.finalBarline, "double");
inventory.bars.forEach((bar, index) => assert.equal(bar.notes.reduce((sum, item) => sum + item.beats, 0), 6, `Bar ${index + 1} should total twelve quavers in 12/8.`));

const completeAnswers = {
  q1a: "Acciaccatura\nRelative minor\nRondo\nSonata", q2a: "Perfect", q2b: "Pizzicato", q2c: "Major", q2d: "Glockenspiel", q2e: "Diminished 7th",
  q3a: "Irregular time signatures", q3b: "Added 6th", q3c: "Jazz funk", q3d: "Musique concrète",
  q4a: "12/8", q4b: "G5", q4c: "C Dm", q4d: "F5", q4e: "A4,G4,Bb4", q4f: "G3,F3,E3,F3",
  q5a: "Lied\nRubato\nTriplets", q5b: "Augmentation", q5c: "Interrupted cadence", q6a: { c: q6Correct }, q7a: { final: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2022 paper tests passed.");
