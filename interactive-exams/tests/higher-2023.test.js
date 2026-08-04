const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2023.js");
const registry = require("../paper-registry.js");

const parts = new Map(paper.questions.flatMap(question => question.subquestions).map(part => [part.id, part]));
assert.equal(registry[paper.id].year, 2023);
assert.equal(paper.questions.length, 8);
assert.deepEqual(paper.questions.map(question => question.marks), [5, 5, 3, 6, 5, 6, 5, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal([...parts.values()].reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, parts.size);

const expectedMarkers = [
  [42.5, 116.68, 190.46, 294.22], [70.66, 185.36, 300.24], [18.58, 33.42, 61.2, 117.9],
  [12.22, 201.1, 273.28, 345.92], [44.36, 108.06, 201.14, 245.4], [50.46, 137.9, 224.8],
  [120.48, 208.98, 300.72, 385.46, 475.2, 558.04, 636.82], [102.62, 171.12, 240.1],
];
const durations = [357.54, 426.24, 198.45, 510.2, 344.87, 488.99, 769.52, 321.91];
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

assert.equal(marking.markSubquestion(parts.get("q1a"), "Acciaccatura\nDiminished 7th\nPedal\nString quartet").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Passacaglia").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Homophonic").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Interrupted cadence").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Pizz").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Plucking").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Horn").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "B♭7").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "Augmentation").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Plainsong").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Mass").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "D5").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4b"), "G3,G3,F3,D3,D3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "A4,G4,F4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "quaver,dottedCrotchet").marks, 1);
assert.deepEqual(parts.get("q4d").options.map(option => [option.value, option.label]), [["dottedCrotchet", "Dot"], ["quaver", "Quaver tail"]]);
assert.deepEqual(parts.get("q4e").options.map(option => [option.value, option.label]), [["crotchetRest", "Crotchet rest"], ["quaverRest", "Quaver rest"], ["dottedCrotchetRest", "Dotted crotchet rest"]]);
assert.equal(marking.markSubquestion(parts.get("q4e"), "crotchetRest,quaverRest").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "quaverRest,quaverRest,quaverRest").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "dottedCrotchetRest").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "quaverRest,crotchetRest").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4f"), "IV V").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4f"), "B flat, C").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Basso continuo\nMelismatic\nObbligato").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Coloratura").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5c"), "Tierce de Picardie").marks, 1);

const q6Correct = "Acciaccatura\nPerfect cadence\nAnacrusis\nTriplets\nBaroque\nHomophonic";
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Harmonic minor\nSonata form" }).marks, 0);
const q7Correct = ["Classical", "Concerto", "Trill", "Anacrusis", "Triplet"];
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: q7Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: [...q7Correct, "Ritornello"] }).marks, 4);

const q8 = parts.get("q8a");
const q8Correct = { 1: "con sordino", 2: "violin", 11: "tremolando", 13: "glissando", 16: "perfect" };
assert.equal(q8.lyricLines.length, 16);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "e3795e75dfe5ea898e63d4c704166aeb2c9d63e668c235710acfe51e3e8c349f", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 2: undefined, 3: "violin" }).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 4: "sequence" }).marks, 4);
assert.equal(answerComplete(q8, q8Correct), true);

const inventory = notation.getInventory("higher-2023-q4");
assert.equal(inventory.bars.length, 16);
assert.equal(inventory.timeSignature, "4/4");
assert.equal(inventory.intervalBar, 2);
assert.equal(inventory.transposeBar, 4);
assert.equal(inventory.missingNoteBar, 7);
assert.equal(inventory.rhythmCorrectionBar, 9);
assert.equal(inventory.missingRestBar, 12);
assert.deepEqual(inventory.chordBars, [14, 15]);
assert.deepEqual(inventory.bars[1].missingIndices, [0]);
assert.deepEqual(inventory.bars[3].transposeIndices, [0, 1, 2, 3, 4]);
assert.deepEqual(inventory.bars[6].missingIndices, [1, 2, 3]);
assert.deepEqual(inventory.bars[6].beamGroups, [{ start: 2, end: 3 }, { start: 5, end: 6 }]);
assert.deepEqual(inventory.bars[14].beamGroups, []);
assert.deepEqual(inventory.bars[6].notes.slice(1, 4).map(item => [item.pitch, item.rhythm]), [["A4", "quaver"], ["F4", "quaver"], ["G4", "quaver"]]);
assert.deepEqual(inventory.bars[8].rhythmCorrectionIndices, [0, 1]);
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["G3", "quaver"], ["G3", "quaver"], ["F3", "quaver"], ["D3", "quaver"], ["D3", "crotchet"]]);
assert.deepEqual(inventory.acceptedRestAnswers, ["crotchetRest,quaverRest", "quaverRest,quaverRest,quaverRest", "dottedCrotchetRest"]);
assert.equal(inventory.finalBarline, "double");
inventory.bars.forEach((bar, index) => assert.equal(bar.notes.reduce((sum, item) => sum + item.beats, 0), 4, `Bar ${index + 1} should total four crotchet beats in 4/4.`));

const inventoryEntry = item => [
  item.rest ? "rest" : item.pitch,
  item.rhythm,
  Boolean(item.tieToNext),
  Boolean(item.tiedFromPrevious),
  Boolean(item.tieToNextBar),
  Boolean(item.tiedFromPreviousBar),
];
assert.deepEqual(inventory.bars.map(bar => bar.notes.map(inventoryEntry)), [
  [["A4", "quaver", false, false, false, false], ["C5", "quaver", false, false, false, false], ["C5", "quaver", false, false, false, false], ["A4", "quaver", false, false, false, false], ["C5", "crotchet", false, false, false, false], ["C5", "quaver", false, false, false, false], ["A4", "quaver", false, false, false, false]],
  [["D5", "quaver", false, false, false, false], ["C5", "crotchet", false, false, false, false], ["A4", "quaver", true, false, false, false], ["A4", "crotchet", false, true, false, false], ["rest", "quaverRest", false, false, false, false], ["G4", "quaver", false, false, false, false]],
  [["G4", "quaver", false, false, false, false], ["F4", "quaver", false, false, false, false], ["F4", "crotchet", false, false, false, false], ["F4", "crotchet", false, false, false, false], ["rest", "quaverRest", false, false, false, false], ["D4", "quaver", false, false, false, false]],
  [["G4", "quaver", false, false, false, false], ["G4", "quaver", false, false, false, false], ["F4", "quaver", false, false, false, false], ["D4", "quaver", true, false, false, false], ["D4", "crotchet", false, true, false, false], ["rest", "crotchetRest", false, false, false, false]],
  [["C4", "quaver", false, false, false, false], ["D4", "quaver", false, false, false, false], ["F4", "quaver", false, false, false, false], ["A4", "quaver", true, false, false, false], ["A4", "crotchet", false, true, false, false], ["A4", "quaver", false, false, false, false], ["G4", "quaver", false, false, false, false]],
  [["A4", "quaver", false, false, false, false], ["G4", "quaver", false, false, false, false], ["F4", "quaver", false, false, false, false], ["G4", "quaver", true, false, false, false], ["G4", "crotchet", false, true, false, false], ["rest", "quaverRest", false, false, false, false], ["C4", "quaver", false, false, false, false]],
  [["A4", "quaver", false, false, false, false], ["A4", "quaver", false, false, false, false], ["F4", "quaver", false, false, false, false], ["G4", "quaver", false, false, false, false], ["F4", "crotchet", false, false, false, false], ["D4", "quaver", false, false, false, false], ["G4", "quaver", false, false, true, false]],
  [["G4", "quaver", false, false, false, true], ["D4", "dottedCrotchet", false, false, false, false], ["rest", "minimRest", false, false, false, false]],
  [["G4", "crotchet", false, false, false, false], ["F4", "crotchet", false, false, false, false], ["F4", "quaver", false, false, false, false], ["G4", "crotchet", false, false, false, false], ["A4", "quaver", false, false, true, false]],
  [["A4", "crotchet", false, false, false, true], ["rest", "crotchetRest", false, false, false, false], ["A4", "crotchet", false, false, false, false], ["C5", "crotchet", false, false, false, false]],
  [["D5", "dottedCrotchet", false, false, false, false], ["C5", "quaver", false, false, false, false], ["C5", "crotchet", false, false, false, false], ["A4", "quaver", false, false, false, false], ["A4", "quaver", false, false, true, false]],
  [["A4", "quaver", false, false, false, true], ["F4", "dottedCrotchet", false, false, false, false], ["rest", "dottedCrotchetRest", false, false, false, false], ["F4", "quaver", false, false, false, false]],
  [["C5", "crotchet", false, false, false, false], ["C5", "quaver", false, false, false, false], ["Bb4", "quaver", false, false, false, false], ["Bb4", "quaver", false, false, false, false], ["Bb4", "crotchet", false, false, false, false], ["A4", "quaver", false, false, false, true]],
  [["A4", "crotchet", false, false, false, true], ["rest", "crotchetRest", false, false, false, false], ["G4", "quaver", false, false, false, false], ["F4", "crotchet", false, false, false, false], ["F4", "quaver", false, false, true, false]],
  [["F4", "quaver", false, false, false, true], ["A4", "crotchet", false, false, false, false], ["G4", "quaver", true, false, false, false], ["G4", "quaver", false, true, false, false], ["F4", "crotchet", false, false, false, false], ["F4", "quaver", false, false, true, false]],
  [["F4", "minim", false, false, false, true], ["rest", "minimRest", false, false, false, false]],
]);
assert.deepEqual(inventory.scoreLayout.systems, [105, 305, 628, 859, 1097]);
assert.deepEqual(inventory.scoreLayout.barEnds, [[363, 615, 855], [341, 588, 855], [361, 458, 699, 855], [355, 588, 855], [359, 641, 855]]);
assert.deepEqual(Object.fromEntries(Object.entries(inventory.scoreLayout.boxes).map(([key, box]) => [key, [box.x, box.y, box.width, box.height]])), {
  interval: [328, 18, 79, 183], transpose: [118, 239, 175, 262], notes: [159, 543, 90, 188],
  rhythm: [465, 546, 97, 185], rests: [445, 801, 92, 147], chords: [302, 992, 292, 212],
});
assert.deepEqual(inventory.scoreLayout.chordAnswerBoxes.map(box => [box.x, box.y, box.width, box.height]), [[312, 1040, 36, 42], [467, 1040, 38, 41]]);
assert.equal(inventory.lyrics.flat().filter(Boolean).join(" "), "Ev'- ry- bo- dy else try'n to go their way_ you're bound to get tripped, and what can you say?_ Just go a- long_ till they turn out the lights; there's noth- in' we can do to fight____ it. No man's got it made____ till he's far be- yond the pain,_____ and we who__ must re- main go on live - ing just____ the same.___");
assert.deepEqual(inventory.lyricOffsets, { 3: [0, 0, -5, 8], 6: [0, 0, 0, 0, 0, -5, 10], 10: [0, 0, 0, -6, 12], 14: [0, 0, -4, 8, 0, 0] });
assert.deepEqual(inventory.lyricYOffsets, { 3: [10, 10, 10, 10] });

const completeAnswers = {
  q1a: "Acciaccatura\nDiminished 7th\nPedal\nString quartet", q1b: "Passacaglia",
  q2a: "Homophonic", q2b: "Interrupted", q2c: "Pizzicato", q2d: "French horn", q2e: "Dominant 7th",
  q3a: "Augmentation", q3b: "Plainchant", q3c: "Mass", q4a: "D5", q4b: "G3,G3,F3,D3,D3", q4c: "A4,G4,F4",
  q4d: "quaver,dottedCrotchet", q4e: "dottedCrotchetRest", q4f: "IV V", q5a: "Basso continuo\nMelismatic\nObbligato",
  q5b: "Coloratura", q5c: "Tierce de Picardie", q6a: { final: q6Correct }, q7a: { c: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2023 paper tests passed.");
