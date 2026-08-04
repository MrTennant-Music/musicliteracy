const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2024.js");
const registry = require("../paper-registry.js");

const parts = new Map(paper.questions.flatMap(question => question.subquestions).map(part => [part.id, part]));
assert.equal(registry[paper.id].year, 2024);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [4, 5, 3, 6, 6, 6, 5, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal([...parts.values()].reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, parts.size);

const expectedMarkers = [
  [41.66, 107.28, 215.68, 242.48], [70, 145, 221], [15.88, 47.6, 83.42, 133.12],
  [11.2, 215, 302, 384], [45.32, 132.44, 208.44, 347.28, 370.4, 408.4, 434.4],
  [45.32, 87.04, 147.04], [116.88, 206.88, 266.88, 356.88, 436.64, 543.84, 613.04], [104.04, 207.76, 310.76],
];
const durations = [281.97, 308.8, 179.96, 570.44, 476.45, 371.1, 748.2, 426.43];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 35);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Basso continuo\nConcertino\nTrill").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Tierce de Picardie").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Arco").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Mordent").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Major scale").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Triplets").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "A7").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Dominant").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q3a"), "Irregular time signatures").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Impressionism").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Soul").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "Perfect 5th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4b"), "quaver,quaver").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "bar-10-c").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "bar-10-c-second").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "bar-10-c-both").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "bar-9-note-2").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4d"), "A3,C4,C4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "IV I").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "B flat, F").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4f"), "bar-24").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4f"), "bar-10").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Acciaccatura\nArpeggio\nLied\nRubato").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Recit").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5c"), "G6").marks, 1);

const q6Correct = "Chamber music\nClassical\nContrary motion\nPerfect cadence\nAnacrusis\n12/8";
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Major scale\nMinor\n4 beats in the bar" }).marks, 0);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Major and minor\nModulation to minor" }).marks, 2);
const q7Correct = ["Baroque", "Melismatic", "Obbligato", "Anacrusis", "Imitation"];
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: q7Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: [...q7Correct, "Classical"] }).marks, 4);

const q8 = parts.get("q8a");
const q8Correct = { 1: "glissando", 6: "male", 10: "harmony", 16: "interrupted", 17: "perfect" };
assert.equal(q8.lyricLines.length, 17);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "d270282f06ab2b400c9269ac3274d5aa896192f9dfc2968e79a6161ee127c8bc", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 6: undefined, 7: "male" }).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 2: "descant" }).marks, 4);
assert.equal(answerComplete(q8, q8Correct), true);

const inventory = notation.getInventory("higher-2024-q4");
assert.equal(inventory.bars.length, 24);
assert.equal(inventory.timeSignature, "4/4");
assert.equal(inventory.intervalBar, 3);
assert.deepEqual(inventory.intervalIndices, [0, 1]);
assert.equal(inventory.rhythmCorrectionBar, 6);
assert.deepEqual(inventory.rhythmCorrectionIndices, [1, 2]);
assert.deepEqual(inventory.dominantBars, [9, 10]);
assert.deepEqual(inventory.dominantIndices, [2, 3]);
assert.deepEqual(inventory.dominantSelectableBars, [9, 10]);
assert.equal(inventory.transposeBar, 14);
assert.deepEqual(inventory.transposeIndices, [1, 2, 3]);
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["A3", "crotchet"], ["C4", "quaver"], ["C4", "crotchet"]]);
assert.deepEqual(inventory.chordBars, [19, 21]);
assert.equal(inventory.daCapoBar, 24);
assert.equal(inventory.finalBarline, "single");
inventory.bars.forEach((bar, index) => assert.equal(bar.notes.reduce((sum, item) => sum + item.beats, 0), 4, `Bar ${index + 1} should total four crotchet beats in 4/4.`));
const expectedBars = [
  [["C5","dottedCrotchet"],["F4","quaver"],["F4","crotchet"],["rest","crotchetRest"]],
  [["A4","dottedCrotchet"],["Bb4","quaver"],["Bb4","crotchet"],["rest","crotchetRest"]],
  [["C5","dottedCrotchet"],["F4","quaver"],["F4","crotchet"],["rest","crotchetRest"]],
  [["A4","minim"],["A4","quaver"],["C5","quaver"],["C5","quaver"],["C5","quaver"]],
  [["rest","crotchetRest"],["rest","quaverRest"],["F4","quaver"],["F4","quaver"],["F4","quaver"],["F4","crotchet"]],
  [["A4","crotchet"],["Bb4","crotchet"],["Bb4","quaver"],["Bb4","quaver"],["Bb4","crotchet"]],
  [["C5","dottedCrotchet"],["F4","quaver"],["F4","crotchet"],["rest","crotchetRest"]],
  [["A4","crotchet"],["A4","quaver"],["Bb4","quaver"],["Bb4","quaver"],["C5","quaver"],["C5","quaver"],["C5","quaver"]],
  [["rest","crotchetRest"],["rest","quaverRest"],["F4","quaver"],["F4","quaver"],["F4","crotchet"],["A4","quaver"]],
  [["A4","quaver"],["A4","crotchet"],["C5","quaver"],["C5","crotchet"],["D5","crotchet"]],
  [["rest","crotchetRest"],["rest","quaverRest"],["F4","quaver"],["F4","quaver"],["F4","crotchet"],["A4","quaver"]],
  [["A4","quaver"],["G4","quaver"],["F4","quaver"],["G4","quaver"],["G4","crotchet"],["F4","crotchet"]],
  [["rest","crotchetRest"],["rest","quaverRest"],["F4","quaver"],["F4","quaver"],["F4","crotchet"],["A4","quaver"]],
  [["A4","quaver"],["A4","crotchet"],["C5","quaver"],["C5","crotchet"],["D5","crotchet"]],
  [["rest","crotchetRest"],["rest","quaverRest"],["F4","quaver"],["F4","quaver"],["F4","crotchet"],["A4","quaver"]],
  [["A4","quaver"],["G4","quaver"],["F4","quaver"],["G4","quaver"],["G4","crotchet"],["F4","crotchet"]],
  [["rest","minimRest"],["rest","crotchetRest"],["rest","quaverRest"],["G4","quaver"]],
  [["G4","crotchet"],["A4","crotchet"],["C5","crotchet"],["F5","crotchet"]],
  [["F5","crotchet"],["E5","quaver"],["D5","quaver"],["D5","minim"]],
  [["rest","crotchetRest"],["F5","quaver"],["E5","quaver"],["E5","crotchet"],["D5","quaver"],["C5","quaver"]],
  [["C5","crotchet"],["D5","quaver"],["A4","quaver"],["A4","minim"]],
  [["rest","crotchetRest"],["E5","quaver"],["E5","quaver"],["E5","crotchet"],["C5","quaver"],["G5","quaver"]],
  [["G5","semibreve"]],
  [["G5","semibreve"]],
];
assert.deepEqual(inventory.bars.map(bar => bar.notes.map(item => [item.rest ? "rest" : item.pitch, item.rhythm])), expectedBars, "Every Higher 2024 bar should retain the source-audited pitch and rhythm inventory.");
assert.deepEqual(inventory.bars.map((bar, index) => bar.notes.at(-1)?.tieToNextBar ? index + 1 : null).filter(Boolean), [9, 11, 13, 15, 18, 20, 22, 23], "The eight printed cross-bar ties should remain attached to their source bars.");
assert.deepEqual(inventory.bars.map((bar, index) => bar.notes.some(item => item.tieToNext) ? index + 1 : null).filter(Boolean), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22], "The twenty printed within-bar ties should remain attached to their source bars.");
const tiedQuaverPairs = inventory.bars.flatMap((bar, barIndex) => bar.notes.map((item, noteIndex) => item.tieToNext && item.rhythm === "quaver" && bar.notes[noteIndex + 1]?.tiedFromPrevious && bar.notes[noteIndex + 1]?.rhythm === "quaver" ? [barIndex + 1, noteIndex, noteIndex + 1] : null).filter(Boolean));
assert.deepEqual(tiedQuaverPairs, [[5, 2, 3], [8, 2, 3], [9, 2, 3], [11, 2, 3], [13, 2, 3], [15, 2, 3]], "Every tied quaver pair should remain identified independently.");
assert.deepEqual(inventory.bars[4].beamGroups || [], [{ start: 3, end: 4 }], "The second and third F4 notes in bar 5 should be beamed together while the first tied pair remains separate.");
assert.deepEqual(inventory.bars[7].beamGroups || [], [{ start: 1, end: 2 }, { start: 3, end: 6 }], "Bar 8 should beam notes 2–3 and the final four quavers, with the tie between notes 3 and 4 preserved.");
assert.deepEqual(inventory.bars[8].beamGroups || [], [], "The first two F4 notes in bar 9 should appear individually.");
assert.deepEqual(inventory.bars[10].beamGroups || [], [], "The first two F4 notes in bar 11 should appear individually.");
assert.equal(inventory.lyrics.flat().filter(Boolean).length, 73);
assert.deepEqual(inventory.scoreLayout.groups.map(group => group.map(index => index + 1)), [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20,21],[22,23,24]]);
assert.deepEqual(inventory.scoreLayout.barEnds[3], [214.5, 460, 631, 885], "Higher 2024 should give half of bar 13's width to bar 14 while keeping the later barlines fixed.");
assert.deepEqual(inventory.scoreLayout.barEnds.at(-1), [353, 484, 614]);

const completeAnswers = {
  q1a: "Basso continuo\nConcertino\nTrill", q1b: "Tierce de Picardie",
  q2a: "Arco", q2b: "Mordent", q2c: "Major", q2d: "3 against 2", q2e: "Dominant 7th",
  q3a: "Irregular time signatures", q3b: "Impressionist", q3c: "Soul music",
  q4a: "5th", q4b: "quaver,quaver", q4c: "bar-10-c", q4d: "A3,C4,C4", q4e: "IV I", q4f: "bar-24",
  q5a: "Acciaccatura\nArpeggio\nLied\nRubato", q5b: "Recitative", q5c: "Added 6th",
  q6a: { final: q6Correct }, q7a: { c: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2024 paper tests passed.");
