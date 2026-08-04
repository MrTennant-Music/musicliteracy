const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2018.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");
const tripletsSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "triplets.html"), "utf8");
const correctRhythmSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "correctrhythm.html"), "utf8");
const bravuraSource = fs.readFileSync(path.resolve(__dirname, "..", "..", "bravura-symbols.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2018);
assert.equal(paper.questions.length, 8);
assert.equal(paper.questions.find(question => question.id === "q2").guideBoxSubquestions, 5);
assert.equal(paper.questions.find(question => question.id === "q2").introPartLabel, "(a)");
assert.equal(paper.questions.find(question => question.id === "q2").intro[0], "In this question you will hear orchestral music.");
assert.deepEqual(paper.questions.map(question => question.marks), [5, 6, 6, 6, 4, 3, 5, 5]);
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40);
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40);
assert.equal(new Set(parts.keys()).size, allParts.length);

const expectedMarkers = [
  [47.54, 108.78, 171.82, 263.22],
  [76.66, 163.46, 250.92, 362.84, 408.72],
  [13.04, 235.64, 335.22, 437.18],
  [55.08, 132.64, 204.44],
  [49.44, 130.34, 241.42],
  [20.2, 53.92, 112.54, 152.24, 210.06, 246.6],
  [120.22, 211.98, 298.86, 386.96, 469.7, 556.4, 635.4],
  [108.1, 185.94, 264.42],
];
const durations = [323.03, 460.72, 630.83, 462.26, 307.51, 289.59, 767.74, 356.05];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers);
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 35);
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b));
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true);
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true);

assert.equal(marking.markSubquestion(parts.get("q1a"), "Classical\nInterrupted cadence\nPizzicato\nDiminished 7th").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q1b"), "String quartet").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Strings").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q2a"), "Mordent").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Oboe").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2c"), "Bassoon").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2d"), "Broken chord").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2e"), "Unison").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2f"), "Harmonic minor scale").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3a"), "line2-gap-5,line2-gap-11").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3b"), "A3,E3,A3,F♯3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "B4,A4,G4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3d"), "4th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3e"), "tripletCrotchet,tripletCrotchet,tripletCrotchet").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3f"), "IV V").marks, 1);
assert.deepEqual(parts.get("q3e").options.map(item => item.value), ["dottedCrotchet", "quaver", "tripletQuaver", "tripletCrotchet"]);

const q4Correct = "Chamber music\nRomantic\nDominant 7th\nPerfect cadence\nAnacrusis\nRubato";
assert.equal(marking.markSubquestion(parts.get("q4a"), { final: q4Correct }).marks, 6);
assert.equal(marking.markSubquestion(parts.get("q4a"), { final: "Chamber music\nImitation\nLied" }).marks, 2);
assert.equal(marking.markSubquestion(parts.get("q5a"), "Passacaglia\nChromatic\nTierce de Picardie").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Obbligato").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q6a"), "Modal").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q6b"), "Augmentation").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q6c"), "Plagal cadence").marks, 1);

const q7Correct = ["Mass", "Sequence", "Syllabic", "Homophonic", "Ostinato"];
assert.equal(marking.markSubquestion(parts.get("q7a"), { a: ["Gospel"], b: ["Soul"], c: q7Correct }).marks, 5);
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: [...q7Correct, "Rubato"] }).marks, 4);

const q8 = parts.get("q8a");
const q8Correct = { 4: "glissando, imperfect", 9: "harmony", 13: "octaves", 16: "contrary" };
assert.equal(q8.lyricLines.length, 16);
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "4ff994c22987c41397bc815126977b7173a878bd39309c9c077b29415245c7a4", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5);
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 1: "trill" }).marks, 4);
assert.equal(answerComplete(q8, q8Correct), true);

assert.equal(paper.questions[2].score.sharedNotation, "higher-2018-q3");
assert.match(notationSource, /const HIGHER_2018_Q3_LINES = \{/);
assert.match(notationSource, /function higher2018ScoreSvg\(/);
assert.match(tripletsSource, /function TripletMark\(/);
assert.match(tripletsSource, /tripletType\.id === "quaver-triplet"/);
assert.match(correctRhythmSource, /function TripletButtonGlyph\(/);
assert.match(notationSource, /const notePositions = \[35, 62, 89\]/);
assert.match(notationSource, /viewBox="0 -8 150 78"/);
assert.match(notationSource, /translate\(-24,-13\) scale\(1\.58\)/);
assert.match(notationSource, /function q3DrawTupletMark\([\s\S]*font-family": "serif"[\s\S]*q3-tuplet-bracket/);
assert.match(stylesSource, /\.q3-tuplet-number[\s\S]*\.q3-tuplet-bracket/);
assert.match(notationSource, /q3AddDirectNoteTargets[\s\S]*id: "q3b"[\s\S]*id: "q3c"/);
assert.match(notationSource, /const transposeXs = \[\s*line3\.positions\[0\]\[0\]/);
assert.match(notationSource, /higher2015SystemBreakTie\(svg, line8\.points\[2\]\?\.at\(-1\), line9\.points\[0\]\?\.\[0\]/);
const inventory = notation.getInventory("higher-2018-q3");
assert.deepEqual(Object.keys(inventory.lines).sort(), ["line1", "line2", "line3", "line4", "line5", "line6", "line7", "line8", "line9", "transpose"].sort());
assert.equal(inventory.lines.line1.length, 16);
assert.equal(inventory.lines.line2.length, 25);
const pitchList = items => items.map(item => item.rest ? "rest" : item.pitch);
const linePitchList = line => line.flatMap(bar => pitchList(bar.notes));
assert.deepEqual(pitchList(inventory.lines.line2), [
  "rest", "A4", "C5", "D5", "Eb5", "D5", "D5", "A4", "C5", "A5", "G5", "E5", "E5",
  "A4", "C5", "D5", "Eb5", "D5", "D5", "A4", "C5", "A5", "G5", "E5", "E4",
]);
assert.deepEqual(inventory.lines.line2.map(item => item.rhythm), [
  "crotchetRest", "quaver", "quaver", "quaver", "quaver", "crotchet", "crotchet",
  "quaver", "quaver", "quaver", "quaver", "crotchet", "crotchet",
  "quaver", "quaver", "quaver", "quaver", "crotchet", "crotchet", "semiquaver", "dottedQuaver",
  "quaver", "quaver", "quaver", "quaver",
]);
assert.deepEqual(inventory.lines.line2.slice(17, 19).map(item => [item.pitch, item.rhythm, Boolean(item.tieToNext), Boolean(item.tiedFromPrevious)]), [
  ["D5", "crotchet", true, false], ["D5", "crotchet", false, true],
]);
assert.deepEqual(inventory.lines.line2.filter(item => item.accidental).map(item => [item.pitch, item.accidental]), [["Eb5", "flat"], ["Eb5", "flat"]]);
assert.deepEqual(inventory.line2BeamGroups, [
  { start: 1, end: 2 }, { start: 3, end: 4 }, { start: 7, end: 8 }, { start: 9, end: 10 },
  { start: 13, end: 14 }, { start: 15, end: 16 }, { start: 19, end: 20 }, { start: 21, end: 24 },
]);
assert.deepEqual(inventory.line2Acciaccaturas, [
  { mainNoteIndex: 9, gracePitch: "G5", symbol: "slashedGraceNoteStemUp" },
  { mainNoteIndex: 21, gracePitch: "G5", symbol: "slashedGraceNoteStemUp" },
]);
assert.deepEqual(inventory.figureBeamGroups, [
  { start: 0, end: 2 }, { start: 3, end: 5 }, { start: 6, end: 8 }, { start: 9, end: 11 },
]);
assert.match(bravuraSource, /slashedGraceNoteStemUp: "\\uE560"/);
assert.deepEqual(inventory.missingBarlineIds, ["line2-gap-5", "line2-gap-11"]);
assert.deepEqual(inventory.printedBarlineIds, ["line2-gap-17"]);
assert.deepEqual(inventory.transposeSource.map(item => [item.pitch, item.rhythm]), [["A4", "minim"], ["E4", "crotchet"], ["A4", "crotchet"], ["F♯4", "minim"]]);
assert.deepEqual(inventory.lines.transpose.map(item => [item.pitch, item.rhythm]), [["A3", "minim"], ["E3", "crotchet"], ["A3", "crotchet"], ["F♯3", "minim"]]);
assert.deepEqual(inventory.missingNoteIndices, [0, 1, 2]);
assert.deepEqual(inventory.lines.line3[1].notes[0].accidental, "sharp");
assert.deepEqual(inventory.lines.line4[0].notes[0].accidental, "sharp");
assert.deepEqual(inventory.lines.line5[3].notes[0].accidental, "sharp");
assert.deepEqual(inventory.lines.line6.slice(0, 2).map(bar => bar.beamGroups), [inventory.figureBeamGroups, inventory.figureBeamGroups]);
assert.deepEqual(inventory.lines.line7.slice(0, 2).map(bar => bar.beamGroups), [inventory.figureBeamGroups, inventory.figureBeamGroups]);
assert.equal(inventory.lines.line6.length, 4);
assert.deepEqual(inventory.scoreLayout.barEnds.line6, [405, 705, 810, 915]);
assert.deepEqual(inventory.scoreLayout.barEnds.line7, [405, 705, 810, 915]);
assert.deepEqual(inventory.scoreLayout.denseBarNoteEndPadding, { line6: [12, 12], line7: [12, 12] });
assert.deepEqual(linePitchList(inventory.lines.line3), ["A4", "E4", "A4", "F♯4", "E4", "D4", "E4", "E4", "rest", "E4", "A4", "E4", "A4"]);
assert.deepEqual(linePitchList(inventory.lines.line4), ["F♯4", "E4", "D4", "E4", "E4", "rest", "A4", "D5", "A4", "D5", "B4", "A4", "G4"]);
assert.deepEqual(inventory.lines.line4[4].notes.map(item => [item.pitch, item.rhythm]), [["B4", "minim"], ["A4", "crotchet"], ["G4", "crotchet"]]);
assert.deepEqual(linePitchList(inventory.lines.line5), ["A4", "A4", "rest", "E4", "A4", "E4", "A4", "F♯4", "E4", "E4", "E4"]);
assert.deepEqual(linePitchList(inventory.lines.line6), ["C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "E4", "A3", "A3"]);
assert.deepEqual(inventory.lines.line6.slice(-2).map(bar => bar.notes.map(item => [item.pitch, item.rhythm])), [
  [["E4", "minim"], ["A3", "minim"]], [["A3", "semibreve"]],
]);
assert.equal(inventory.lines.line6.at(-2).notes.at(-1).tieToNextBar, true);
assert.equal(inventory.lines.line6.at(-1).notes[0].tiedFromPreviousBar, true);
assert.deepEqual(linePitchList(inventory.lines.line7), ["C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "C4", "F4", "F4", "F4", "F4", "F4", "E4", "E4"]);
assert.deepEqual(inventory.intervalNoteIndices, [0, 1]);
assert.deepEqual(inventory.rhythmCorrectionIndices, [0, 1, 2]);
assert.deepEqual(linePitchList(inventory.lines.line8), ["rest", "F4", "A4", "C5", "B4", "C5", "D5", "E5", "D5", "C5", "A4"]);
assert.deepEqual(inventory.lines.line8[2].notes.map(item => [item.pitch, item.rhythm]), [["E5", "crotchet"], ["D5", "crotchet"], ["C5", "crotchet"], ["A4", "minim"]]);
assert.equal(inventory.lines.line8[2].notes.at(-1).tieToNextBar, true);
assert.equal(inventory.lines.line9[0].notes[0].tiedFromPreviousBar, true);
assert.deepEqual(linePitchList(inventory.lines.line9), ["A4", "rest", "F4", "A4", "C5", "B4", "C5", "D5", "G4"]);
assert.deepEqual(inventory.lines.line9.slice(1, 3).map(item => item.chordAnswer), ["F", "G"]);
assert.deepEqual(inventory.scoreLayout.viewBox, [0, 0, 920, 1290]);
assert.deepEqual(inventory.scoreLayout.tops, { line1: 55, line2: 182, line3: 321, line4: 512, line5: 654, line6: 781, line7: 908, line8: 1034, line9: 1200 });
assert.deepEqual(inventory.scoreLayout.boxes, {
  barlines: { x: 69, y: 131, width: 615, height: 121 },
  transpose: { x: 69, y: 271, width: 292, height: 209 },
  notes: { x: 747, y: 430, width: 162, height: 149 },
  interval: { x: 381, y: 581, width: 121, height: 138 },
  rhythm: { x: 639, y: 980, width: 270, height: 122 },
  chords: { x: 226, y: 1117, width: 324, height: 149 },
});
assert.deepEqual(inventory.scoreLayout.bassStaff, { left: 65, right: 344, top: 409, barlineX: 277 });
assert.equal(inventory.scoreLayout.noteOffsetX, 10);
assert.equal(inventory.scoreLayout.drumNoteOffsetX, 3);
assert.equal(inventory.scoreLayout.drumNoteYOffset, -1);
assert.equal(inventory.scoreLayout.drumCircleOffsetX, 1);
assert.equal(inventory.scoreLayout.drumCircleOffsetY, -1);
assert.equal(inventory.scoreLayout.drumLabelYOffset, -26);
assert.equal(inventory.scoreLayout.timeSignatureXOffset, -5);
assert.equal(inventory.scoreLayout.bassStaff.barlineX, inventory.scoreLayout.barEnds.line3[0]);
assert.equal(inventory.scoreLayout.transposeAlignment, "line3-first-four-notes");
assert.deepEqual(inventory.scoreLayout.boxes.notes, { x: 747, y: 430, width: 162, height: 149 });
assert.deepEqual(inventory.scoreLayout.boxes.chords, { x: 226, y: 1117, width: 324, height: 149 });
assert.deepEqual(inventory.scoreLayout.givenChordBox, { x: 111, y: 1106, width: 37, rowHeight: 37 });
assert.deepEqual(inventory.scoreLayout.chordAnswerBoxes, [
  { x: 238, y: 1146, width: 38, height: 42 },
  { x: 412, y: 1146, width: 38, height: 42 },
]);
assert.equal(inventory.line9FinalBarline, "none");
assert.equal(inventory.line2FinalBarline, "single");
assert.equal(inventory.finalBarline, "none");

const rhythmBeats = { semiquaver: .25, quaver: .5, crotchet: 1, dottedCrotchet: 1.5, minim: 2, semibreve: 4, crotchetRest: 1 };
for (const lineName of ["line3", "line4", "line5", "line6", "line7", "line8", "line9"]) {
  inventory.lines[lineName].forEach((bar, index) => {
    const beats = bar.notes.reduce((sum, item) => sum + rhythmBeats[item.rhythm], 0);
    const expected = lineName === "line8" && index === 2 ? 5 : lineName === "line9" && index === 3 ? 1.5 : 4;
    assert.equal(beats, expected, `${lineName} bar ${index + 1} should retain its audited rhythmic total.`);
  });
}

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; this.textContent = ""; this.classList = { add() {}, remove() {}, contains() { return false; }, toggle() {} }; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  closest() { return null; }
  remove() {}
}
const previousDocument = global.document;
const previousSymbols = global.BRAVURA_SYMBOLS;
global.BRAVURA_SYMBOLS = new Proxy({}, { get: () => "x" });
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };
const notationWrap = new FakeSvgNode("div");
notation.renderSharedScore({ innerHTML: "", querySelector: () => notationWrap }, paper.questions[2], { q3a: "line2-gap-5,line2-gap-11", q3b: "A3,E3,A3,F♯3", q3c: "B4,A4,G4", q3d: "5th", q3e: "tripletCrotchet,tripletCrotchet,tripletCrotchet", q3f: "F G" }, null, { q3d: "incorrect" });
const renderedScore = notationWrap.children.find(node => node.name === "svg" && node.attributes["aria-label"] === "Marked Higher 2018 Question 3 score");
assert.equal(Boolean(renderedScore), true);
assert.equal(renderedScore.attributes.viewBox, "0 0 920 1290");
assert.equal(renderedScore.children.filter(node => node.name === "rect" && node.attributes.class?.includes("higher-2018-chord-answer-box")).length, 2);
assert.equal(renderedScore.children.filter(node => node.name === "line" && node.attributes.class === "q3-barline" && node.attributes.x1 === "670").length, 0);
assert.equal(renderedScore.children.filter(node => node.name === "line" && node.attributes.class === "q3-barline" && node.attributes.x1 === "277" && node.attributes.y1 === "409").length, 1);
assert.equal(renderedScore.children.filter(node => node.name === "line" && node.attributes.class === "q3-barline" && node.attributes.x1 === "915" && node.attributes.y1 === "182").length, 1);
assert.equal(renderedScore.children.filter(node => node.name === "line" && node.attributes.class === "q3-barline q3-printed-barline").length, 1);
const interactiveNotationWrap = new FakeSvgNode("div");
notation.renderSharedScore({ innerHTML: "", querySelector: () => interactiveNotationWrap }, paper.questions[2], {}, () => {}, {});
const interactiveScore = interactiveNotationWrap.children.find(node => node.name === "svg" && node.attributes["aria-label"] === "Interactive Higher 2018 Question 3 score");
assert.equal(interactiveScore.children.filter(node => node.name === "rect" && node.attributes.class === "q3-bar-label-hit-area").length, 16);
assert.equal(interactiveScore.children.filter(node => node.name === "rect" && node.attributes.class === "q3-rhythm-hit-area").length, 3);
const line2BarlineTargets = interactiveScore.children
  .filter(node => node.name === "rect" && node.attributes.class === "q3-bar-label-hit-area")
  .map(node => [Number(node.attributes.x), Number(node.attributes.width)])
  .sort((left, right) => left[0] - right[0]);
line2BarlineTargets.slice(0, -1).forEach((target, index) => assert.equal(
  target[0] + target[1] <= line2BarlineTargets[index + 1][0],
  true,
  "Line 2 barline hit areas must not overlap."
));
assert.match(notationSource, /const bassSteps = \{ G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, "F♯3": 6, G3: 7, A3: 8, B3: 9, C4: 10 \}/);
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;

const completeAnswers = {
  q1a: "Classical\nInterrupted cadence\nPizzicato\nDiminished 7th", q1b: "String quartet",
  q2a: "Mordent", q2b: "Oboe", q2c: "Bassoon", q2d: "Arpeggio", q2e: "Octaves", q2f: "Harmonic minor",
  q3a: "line2-gap-5,line2-gap-11", q3b: "A3,E3,A3,F♯3", q3c: "B4,A4,G4", q3d: "4th", q3e: "tripletCrotchet,tripletCrotchet,tripletCrotchet", q3f: "F G",
  q4a: { final: q4Correct }, q5a: "Passacaglia\nChromatic\nTierce de Picardie", q5b: "Obbligato",
  q6a: "Modal", q6b: "Augmentation", q6c: "Plagal cadence", q7a: { a: [], b: [], c: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40);
assert.equal(marking.markPaper(paper, {}).score, 0);

console.log("Higher 2018 paper tests passed.");
