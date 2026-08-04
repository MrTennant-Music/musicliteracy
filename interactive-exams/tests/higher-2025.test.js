const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2025.js");
const registry = require("../paper-registry.js");

const parts = new Map(paper.questions.flatMap(question => question.subquestions).map(part => [part.id, part]));
assert.equal(registry[paper.id].year, 2025);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [4, 5, 4, 6, 5, 6, 5, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal([...parts.values()].reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, parts.size);

const expectedMarkers = [
  [43.02, 127.04, 241.3], [70.92, 156.6, 242.72], [7.02, 53.64, 73.88, 98.86, 169.36, 193.3],
  [11.52, 211.88, 294.78, 378.58], [43.26, 127.66, 211.54, 325.68], [47.78, 122.36, 197.4],
  [119.86, 214.32, 306.84, 397.06, 486.52, 575.6, 656.06], [100.84, 187.62, 274.28],
];
const durations = [293.8, 340.56, 224.13, 553.38, 370.39, 444.4, 788.14, 374];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 33);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Basso continuo\nModulation\nRipieno").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q1a"), "Basso continuo\nModulation\nRipieno\nPedal").marks, 2);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Piano sonata").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Sonata form").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Trill").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Ostinato").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Acciaccatura").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Tenor saxophone").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Imperfect cadence").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "Plainsong").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Diminished 7th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "5/4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3d"), "Diminution").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "bar-3-c").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "bar-3-note-1").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4b"), "D Em").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4b"), "V VI").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "B3,C4,B3,A3,G3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "D5,C5").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "C5,B4").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4e"), "after-bar-21").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "higher-2025-line6-gap-1").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4f"), "Perfect 4th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Anacrusis\nChamber music\nChromatic scale\nTriplets").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Jazz funk").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Jazz").marks, 0);

const q6Correct = "Chamber music\nLied\nAcciaccatura\nPerfect cadence\nAnacrusis\nRitardando";
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Relative major\nMajor scale" }).marks, 0);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Moderato\nAndante\nTriplets" }).marks, 2);
const q7Correct = ["Mass", "Imperfect cadence", "Time changes", "Homophonic", "Timpani"];
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: q7Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: [...q7Correct, "Gospel"] }).marks, 4);
assert.equal(marking.markSubquestion(parts.get("q7a"), { a: q7Correct, b: q7Correct, c: [] }).marks, 0);

const q8 = parts.get("q8a");
const q8Correct = { 2: "dominant 7th, tremolando", 5: "hi-hat", 7: "con sordino", 15: "xylophone" };
assert.equal(q8.lyricLines.length, 15);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "72275f19f134e8e06bbd8d86f303008ccb41775f17666a30a2cc7594c70679cb", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { 2: "dominant 7th", 3: "tremolando", 6: "hi-hat", 8: "con sordino", 15: "xylophone" }).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 1: "pizzicato" }).marks, 4);
assert.equal(answerComplete(q8, q8Correct), true);

const inventory = notation.getInventory("higher-2025-q4");
assert.equal(inventory.bars.length, 24);
assert.equal(inventory.timeSignature, "4/4");
assert.equal(inventory.subdominantBar, 3);
assert.deepEqual(inventory.subdominantIndices, [2]);
assert.deepEqual(inventory.subdominantSelectableIndices, [1, 2, 3, 4, 5]);
assert.deepEqual(inventory.chordBars, [7, 8]);
assert.equal(inventory.transposeBar, 11);
assert.deepEqual(inventory.transposeIndices, [1, 2, 3, 4, 5]);
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["B3", "quaver"], ["C4", "quaver"], ["B3", "crotchet"], ["A3", "quaver"], ["G3", "quaver"]]);
assert.equal(inventory.missingNoteBar, 17);
assert.deepEqual(inventory.missingIndices, [3, 4]);
assert.equal(inventory.missingBarlineAfterBar, 21);
assert.equal(inventory.intervalBar, 23);
assert.deepEqual(inventory.intervalIndices, [1, 2]);
assert.equal(inventory.finalBarline, "double");
assert.deepEqual(inventory.scoreLayout.systems, [105, 344.3, 541.5, 812.8, 1031.7, 1261.6]);
assert.deepEqual(inventory.scoreLayout.barEnds[0], [346.9, 478.7, 702.2, 855]);
assert.deepEqual(inventory.scoreLayout.barEnds[5], [344, 495.9, 773.5, 855]);
assert.equal(inventory.scoreLayout.firstBarStartOffset, -25);
assert.equal(inventory.scoreLayout.boxes.a.x, 485.1);
assert.deepEqual(inventory.scoreLayout.boxes.f, { x: 537.4, y: 1160.1, width: 74.3, height: 172.1 });
assert.deepEqual(inventory.scoreLayout.boxes.d, { x: 249.1, y: 939.7, width: 65.7, height: 161.8 });
assert.deepEqual(inventory.scoreLayout.intervalInput, { x: 546, y: 1197, width: 55, height: 34 });
assert.equal(inventory.scoreLayout.boxes.f.y, 1160.1);
inventory.bars.forEach((bar, index) => assert.equal(bar.notes.reduce((sum, item) => sum + item.beats, 0), 4, `Bar ${index + 1} should total four crotchet beats in 4/4.`));

const expectedLyrics = [
  [null, "Ev-", "'ry", "breath", "you_", null], ["take,", null],
  [null, "ev-", "'ry", "move", "you_", null], ["make,", null, null],
  [null, "ev-", "'ry", "bond_", null, "you", "break,"], [null, "ev-", "'ry", "step_", null, "you", "take,"],
  [null, "I'll", "be", "watch", null, "-ing", "you."], [null],
  [null, "Ev-", "'ry", "sin-", "gle_", null], ["day,", null],
  [null, "ev-", "'ry", "word", "you_", null], ["say,", null, null],
  [null, "ev-", "'ry", "game", null, "you", "play,"], [null, "ev-", "'ry", "night", null, "you", "stay,"],
  [null, "I'll", "be", "watch", null, "-ing", "you."], [null],
  [null, "Oh,", "can't", "you___", null], ["see", null],
  [null, "you", "be-", "long", "to"], ["me?", null],
  [null, "How", "my", "poor", "heart_____", null], [null, "aches", null],
  [null, "with", "ev-", "'ry", "step_", null, "you"], ["take.", null],
];
assert.deepEqual(inventory.lyrics, expectedLyrics);
assert.deepEqual(inventory.lyricOffsets, { 20: [0, 0, 0, 0, 15, 0] });

const expectedBars = [
  "R:crotchetRest,B4:quaver,C5:quaver,B4:crotchet,A4:quaver,G4:quaver", "G4:minim,R:minimRest",
  "R:crotchetRest,B4:quaver,C5:quaver,B4:crotchet,A4:quaver,G4:quaver", "G4:crotchet,R:crotchetRest,R:minimRest",
  "R:quaverRest,G4:quaver,G4:quaver,B4:quaver,B4:quaver,C5:crotchet,G4:quaver",
  "R:quaverRest,G4:quaver,G4:quaver,C5:quaver,C5:quaver,B4:crotchet,A4:quaver",
  "R:quaverRest,A4:quaver,G4:quaver,B4:quaver,B4:quaver,G4:crotchet,G4:quaver", "R:semibreveRest",
  "R:crotchetRest,B4:quaver,C5:quaver,B4:crotchet,A4:quaver,G4:quaver", "B4:minim,R:minimRest",
  "R:crotchetRest,B4:quaver,C5:quaver,B4:crotchet,A4:quaver,G4:quaver", "G4:crotchet,R:crotchetRest,R:minimRest",
  "R:quaverRest,G4:quaver,G4:quaver,B4:quaver,B4:quaver,C5:crotchet,G4:quaver",
  "R:quaverRest,G4:quaver,G4:quaver,C5:quaver,C5:quaver,B4:crotchet,A4:quaver",
  "R:quaverRest,A4:quaver,G4:quaver,B4:quaver,B4:quaver,G4:crotchet,G4:quaver", "R:semibreveRest",
  "R:crotchetRest,G4:crotchet,B4:crotchet,D5:quaver,C5:quaver", "E5:dottedMinim,R:crotchetRest",
  "R:crotchetRest,E5:quaver,E5:quaver,D5:dottedCrotchet,G4:quaver", "B4:minim,R:minimRest",
  "R:crotchetRest,G5:quaver,E5:quaver,G5:crotchet,G5:quaver,E5:quaver", "E5:quaver,G5:quaver,E5:dottedMinim",
  "R:quaverRest,E5:quaver,A5:quaver,A5:quaver,F5:quaver,E5:crotchet,D5:quaver", "D5:minim,R:minimRest",
];
const barSignature = bar => bar.notes.map(item => `${item.rest ? "R" : item.pitch}:${item.rhythm}`).join(",");
assert.deepEqual(inventory.bars.map(barSignature), expectedBars);
assert.ok(inventory.bars.every(bar => !bar.slurs?.length), "Higher 2025 should contain no slurs.");
[4, 5, 6, 12, 13, 14].forEach(barIndex => {
  assert.equal(inventory.bars[barIndex].notes[3].tieToNext, true, `Bar ${barIndex + 1} should retain its repeated-note tie.`);
  assert.equal(inventory.bars[barIndex].notes[4].tiedFromPrevious, true, `Bar ${barIndex + 1} should retain the second half of its repeated-note tie.`);
});
assert.equal(inventory.bars[20].notes[5].tieToNextBar, true);
assert.equal(inventory.bars[21].notes[0].tiedFromPreviousBar, true);

const completeAnswers = {
  q1a: "Basso continuo\nModulation\nRipieno", q1b: "Sonata",
  q2a: "Trill", q2b: "Syncopation", q2c: "Acciaccatura", q2d: "Saxophone", q2e: "Imperfect",
  q3a: "Plainchant", q3b: "Diminished 7th", q3c: "Irregular time signature", q3d: "Diminution",
  q4a: "bar-3-c", q4b: "D Em", q4c: "B3,C4,B3,A3,G3", q4d: "D5,C5", q4e: "after-bar-21", q4f: "4th",
  q5a: "Anacrusis\nChamber music\nChromatic scale\nTriplets", q5b: "Jazz funk",
  q6a: { final: q6Correct }, q7a: { c: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2025 paper tests passed.");
