const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2016.js");
const registry = require("../paper-registry.js");
const bravuraSource = fs.readFileSync(path.resolve(__dirname, "../../bravura-symbols.js"), "utf8");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const uiSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-ui.js"), "utf8");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2016, "Higher 2016 should be available through the shared registry.");
assert.match(registry[paper.id].dataFile, /20260803-higher-2016-feedback-transpose-fix-v1/, "Higher 2016 should load the corrected six-note transpose data instead of a cached older paper definition.");
assert.equal(paper.questions.length, 8, "Higher 2016 should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [4, 5, 3, 6, 6, 6, 5, 5], "Official question marks should be retained.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");

const expectedMarkers = [
  [45, 120.5, 227.12],
  [72.98, 178.02, 283.96],
  [6.78, 55.3, 102.68],
  [14.86, 259.14, 381.04, 503.46],
  [47.8, 127.4, 206.7, 316.06, 379.22, 419.62],
  [53.92, 138.32, 223.76],
  [121.82, 191.56, 292.12, 356.54, 455.22, 521.56, 611.56],
  [108.84, 230.54, 352.56],
];
const durations = [273.763265, 399.830204, 155.062857, 715.258776, 464.117551, 484.963265, 742.791837, 486.739592];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers, "Whisper-calibrated marker positions should remain fixed.");
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 32, "All 32 expected audio markers should be present.");
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} markers should be chronological.`);
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true, `${question.id} markers should remain inside the official track.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should exist.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should exist.");

assert.equal(paper.questions[0].intro, "This question features instrumental music.", "Question 1's unindented introduction should remain separate from part (a).");
assert.equal(parts.get("q1a").label, "(a)");
assert.equal(parts.get("q1a").letteredConcept, true, "Question 1(a) should use the source paper's lettered concept layout.");
assert.equal(parts.get("q1a").leadLines.length, 2, "Question 1(a)'s two indented instruction lines should remain grouped together.");
assert.equal(parts.get("q5a").label, "(a)");
assert.equal(parts.get("q5a").letteredConcept, true, "Question 5(a) should reuse the source paper's lettered concept layout.");
assert.match(uiSource, /subquestion\.letteredConcept \? "is-lettered-concept"/, "The renderer should expose a scoped class for lettered concept questions.");
assert.match(stylesSource, /subquestion-concept-lines\.is-lettered-concept/, "Lettered concept indentation should remain isolated from the 2015 layout.");
assert.match(stylesSource, /is-lettered-concept[^}]+higher-concept-line[\s\S]*?border-bottom-width: 1\.5px/, "Lettered concept answer lines should match the standard short-answer rule thickness.");
assert.match(stylesSource, /is-lettered-concept > \.higher-concept-lines \{[\s\S]*?width: min\(calc\(100% - 94px\), calc\(46rem - 70px\)\)/, "Lettered concept answer lines should match the standard part-labelled short-answer width.");
assert.match(stylesSource, /question-q4 \[data-subquestion="q4e"\] \.subquestion-heading-question,[\s\S]*?question-q4 \[data-subquestion="q4f"\] \.subquestion-heading-question \{ max-width: 46rem; \}/, "Higher 2016 Question 4(e) and 4(f) prompts should retain their single-line width.");
assert.match(stylesSource, /subquestion-after-answer-lines > span:nth-child\(2\)[\s\S]*?margin-top: 14px/, "Playback cues should retain a visible gap after the timing paragraph.");
assert.match(stylesSource, /question-q5 \[data-subquestion="q5c"\] \.subquestion-after-answer-lines[\s\S]*?display: grid[\s\S]*?margin: 24px 0 0 44px/, "Question 5(c)'s playback cues should stack below the choices with source-paper spacing.");
assert.match(stylesSource, /paper-level-h\.question-q8 \.question-intro \{ margin-bottom: 0; \}/, "Question 8's feature list should follow its final introductory sentence without an excessive gap.");

assert.equal(marking.markSubquestion(parts.get("q1a"), "Ritornello\nPerfect cadence\nBasso continuo").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q1b"), "Harmonic").marks, 1, "The official singular alternative should be accepted.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "Ostinato").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q2b"), "Repetition").marks, 0, "Repetition should not earn the ostinato mark.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "7 beats in the bar").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q3c"), "Jazz").marks, 0, "Jazz on its own should be rejected.");
assert.equal(marking.markSubquestion(parts.get("q4a"), "F").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4a"), "F minor").marks, 0);
assert.equal(marking.markSubquestion(parts.get("q4b"), "Upper mordent").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4c"), "dottedCrotchet,quaver").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "5th").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "E4,F4,G4").marks, 1);
assert.equal(parts.get("q4f").noteSlots, 6, "Higher 2016 Question 4(f) should require all six written transposition noteheads, including the final tied quaver.");
assert.equal(parts.get("q4f").answer, "G3,F3,D3,E3,F3,F3");
assert.equal(marking.markSubquestion(parts.get("q4f"), "G3,F3,D3,E3,F3,F3").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5b"), "Coloratura").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q5c"), "Modal").marks, 1);

const q6Correct = "Acciaccatura\nMajor\nAnacrusis\nSyncopation\nFlute\nGlockenspiel";
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct }).marks, 6, "Two valid concepts from each category should earn six marks.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct + "\nTriangle" }).marks, 6, "An incorrect additional concept should not remove an earned analysis mark.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Major\nModulation\nMordent" }).marks, 2, "No more than two concepts should be credited from one category.");

const q7Correct = ["Dominant 7th", "Trill", "Alberti bass", "Simple time", "Classical"];
assert.equal(marking.markSubquestion(parts.get("q7a"), { a: ["Rondo"], b: ["Cadenza"], c: q7Correct }).marks, 5, "Columns A and B should remain unmarked rough work.");
assert.equal(marking.markSubquestion(parts.get("q7a"), { c: [...q7Correct, "Rondo"] }).marks, 4, "An additional incorrect Column C choice should deduct one mark.");

const q8 = parts.get("q8a");
const q8Correct = { 3: "ritardando", 5: "dominant 7th arpeggio", 6: "tremolando", 12: "modulation", 19: "glockenspiel" };
assert.equal(q8.lyricLines.length, 20, "Question 8 should retain all 20 source line positions.");
assert.equal(crypto.createHash("sha256").update(JSON.stringify(q8.lyricLines)).digest("hex"), "8d28d5261c007de559b961e2a57036491255320df0b9ec68f1a5ee05db223deb", "The teacher-supplied lyric rows should retain their exact wording and order.");
assert.equal(marking.markSubquestion(q8, q8Correct).marks, 5, "The official feature placements should still earn five marks with the restored lyric rows.");
assert.equal(marking.markSubquestion(q8, { ...q8Correct, 1: "trill" }).marks, 4, "An additional incorrect placement should deduct one mark.");
assert.equal(answerComplete(q8, q8Correct), true, "Five entered features should complete the lyric-placement task.");

assert.equal(paper.questions[3].score.sharedNotation, "higher-2016-q4");
assert.match(notationSource, /const HIGHER_2016_Q4_BARS = \[/, "The literacy score should be encoded as structured data.");
assert.match(notationSource, /function higher2016ScoreSvg\(/, "Higher 2016 should use a dedicated interactive score renderer.");
assert.match(notationSource, /function higher2016ScoreSvg\([\s\S]*?viewBox: "0 0 920 1260"[\s\S]*?const groups = \[\[0, 1, 2\], \[3, 4, 5, 6\], \[7, 8, 9\], \[10, 11, 12\], \[13, 14, 15\]\]/, "Higher 2016 Question 4 should retain the source paper's five-system bar grouping.");
assert.match(notationSource, /higher2015Staff\(svg, top, \{ left: staffLeft, right: end, timeSignature: systemIndex === 0, flatKeySignature: true, keySignatureXOffset: -5\.7, timeSignatureXOffset: 13\.7 \}\)/, "Higher 2016 should keep the key and time signatures in their calibrated swapped positions.");
assert.match(notationSource, /const rhythmBox = \{ x: barStarts\[4\] \+ 2,/, "Higher 2016's rhythm box should retain its calibrated rightward position.");
assert.match(notationSource, /const intervalBox = \{ x: barStarts\[7\] \+ 80,/, "Higher 2016's interval box should retain its calibrated rightward position.");
assert.match(bravuraSource, /fermataAbove: "\\uE4C0"/, "The shared Bravura symbol map should provide an above-staff fermata.");
assert.match(notationSource, /q3CalibratedSymbol\(svg, "fermataAbove", barPositions\[13\]\[2\]/, "Higher 2016 should place the fermata above the third note of bar 14.");
assert.match(notationSource, /barTops\[13\] - Q3_STAFF\.gap \* 2\.6 \+ 15/, "Higher 2016's fermata should retain the requested 15px downward adjustment.");
assert.match(notationSource, /const transposeBox = \{ x: 450, y: systems\[4\] - 100, width: 385, height: 300 \}/, "Higher 2016's transpose box should surround the six printed source notes and both staves.");
assert.match(notationSource, /const transposeSlotX = \[\s*\.\.\.barPositions\[14\]\.slice\(4\),\s*barPositions\[15\]\[0\],\s*barPositions\[15\]\[1\],\s*\]/, "Higher 2016's lower transpose notes should align with the six printed source notes above.");
assert.match(notationSource, /const transposeRhythms = \["quaver", "quaver", "quaver", "quaver", "minim", "quaver"\]/, "Higher 2016's transpose input should expose the final tied quaver as its own slot.");
assert.match(notationSource, /beamGroups: \[\{ start: 0, end: 3 \}\],[\s\S]*?classNames: enteredTransposeClasses/, "Higher 2016's first four entered transpose quavers should share one beam group.");
assert.match(notationSource, /if \(enteredTransposePoints\[4\] && enteredTransposePoints\[5\]\) q3DrawTie/, "The final tied quaver should appear only after its own note slot is entered.");
assert.match(notationSource, /if \(barIndex < HIGHER_2016_Q4_BARS\.length - 1\) drawBarline\(barEnd, top\);/, "Higher 2016's treble stave should stop without a final barline after bar 16.");
assert.match(notationSource, /drawBarline\(barStarts\[15\], bassTop\);/, "Higher 2016's lower stave should include the barline between bars 15 and 16.");
assert.match(notationSource, /q3AddHigher2016RhythmTargets/, "The bar 5 correction should reuse the shared armed rhythm interaction.");
assert.match(notationSource, /const enteredRhythmIndexes = new Set\(HIGHER_2016_Q4_BARS\[4\]\.rhythmCorrectionIndices\.filter\(\(_, order\) => \{[\s\S]*?return Boolean\(value && value !== "_"\);[\s\S]*?\}\)\)/, "Higher 2016 Question 4(c) should hide only the rhythm notes that the pupil has edited.");
assert.match(notationSource, /barIndex === 4 \? \[\.\.\.enteredRhythmIndexes\] : \[\]/, "An untouched second crotchet in Higher 2016 Question 4(c) should remain visible.");
assert.match(notationSource, /q3AddDirectNoteTargets[\s\S]*id: "q4e"[\s\S]*id: "q4f"/, "Both missing-note tasks should use direct score entry.");
assert.match(notationSource, /className: options\.classNames\?\.\[index\] \|\| options\.className \|\| ""/, "The shared Higher note renderer should support a separate feedback class for each entered note.");
assert.match(notationSource, /higher2015DrawNotes\(svg, enteredNoteItems, barPositions\[13\]\.slice\(4\), barTops\[13\], \{\s*beamGroups: \[\{ start: 1, end: 2 \}\],\s*classNames: enteredNoteClasses,\s*\}\)/, "Higher 2016 Question 4(e) should beam the final two applied quavers like the printed guide.");
assert.match(notationSource, /if \(incorrect\) q3Text\(svg, options\.correction, \{ x: options\.x \+ options\.width \/ 2, y: options\.y \+ 2,/, "Higher score corrections should be centred on a separate line above the pupil's written answer.");
assert.match(stylesSource, /\.q3-answer-line \{[^}]*stroke: currentColor;[^}]*stroke-width: 1\.15;/, "Higher 2016 marked score answers should retain visible answer lines.");
const inventory = notation.getInventory("higher-2016-q4");
assert.equal(inventory.pickup.length, 3, "The source anacrusis should contain three quavers.");
assert.equal(inventory.bars.length, 16, "All sixteen numbered bars should be retained.");
assert.deepEqual(inventory.rhythmCorrectionIndices, [0, 1], "The first two notes of bar 5 should remain editable.");
assert.deepEqual(inventory.missingNoteIndices, [4, 5, 6], "The final three notes of bar 14 should remain editable.");
const expectedHigher2016Pitches = [
  ["A4", "G4", "A4", "D5", "C5", "A4"],
  ["G4", "F4", "D4", "D4", "F4", "A4", "B4"],
  ["C5", "D5", "C5", "A4", "F4", "A4"],
  ["G4", "G4", "E4", "F4", "G4"],
  ["A4", "G4", "A4", "D5", "C5", "A4"],
  ["G4", "F4", "D4", "D4", "E4", "F4", "G4"],
  ["A4", "B4", "A4", "G4", "F4", "G4"],
  ["F4", "F4", "C5", "D5", "E5"],
  ["F5", "E5", "E5", "D5", "C5", "D5"],
  ["C5", "A4", "F4", "F4", "C5", "D5", "E5"],
  ["F5", "E5", "E5", "D5", "C5", "A4"],
  ["G4", "G4", "C5", "C5", "C5"],
  ["A5", "G5", "G5", "F5", "D5", "F5"],
  ["C5", "A4", "F4", "F4", "E4", "F4", "G4"],
  ["A4", "D5", "C5", "A4", "G4", "F4", "D4", "E4"],
  ["F4", "F4"],
];
assert.deepEqual(inventory.bars.map(bar => bar.notes.filter(item => item.pitch).map(item => item.pitch)), expectedHigher2016Pitches, "The complete Higher 2016 pitch inventory should remain fixed bar by bar.");
assert.deepEqual(inventory.bars[13].notes.slice(4).map(item => [item.pitch, item.rhythm]), [["E4", "quaver"], ["F4", "quaver"], ["G4", "quaver"]]);
assert.deepEqual(inventory.bars[14].transposeIndices, [4, 5, 6, 7], "The printed quaver group at the end of bar 15 should be the transposition source.");
assert.deepEqual(inventory.bars[14].notes.slice(4).map(item => [item.pitch, item.rhythm]), [["G4", "quaver"], ["F4", "quaver"], ["D4", "quaver"], ["E4", "quaver"]], "The bar-15 transposition group should begin with the printed G4.");
assert.deepEqual(inventory.transposeSource.map(item => [item.pitch, item.rhythm]), [["G4", "quaver"], ["F4", "quaver"], ["D4", "quaver"], ["E4", "quaver"], ["F4", "minim"], ["F4", "quaver"]], "The transposition source should contain the final tied F4 notehead as well as the tied minim.");
assert.deepEqual(inventory.transpose.map(item => [item.pitch, item.rhythm]), [["G3", "quaver"], ["F3", "quaver"], ["D3", "quaver"], ["E3", "quaver"], ["F3", "minim"], ["F3", "quaver"]]);
assert.equal(inventory.finalBarline, "none", "Neither stave should draw a final barline after bar 16.");
const rhythmBeats = { semiquaver: .25, quaver: .5, dottedQuaver: .75, crotchet: 1, dottedCrotchet: 1.5, minim: 2, dottedMinim: 3, semibreve: 4, quaverRest: .5, crotchetRest: 1, minimRest: 2 };
inventory.bars.forEach((bar, index) => {
  const beats = bar.notes.reduce((sum, item) => sum + rhythmBeats[item.rhythm], 0);
  assert.equal(beats, index === 15 ? 3 : 4, `Bar ${index + 1} should retain its audited rhythmic total.`);
});

const completeAnswers = {
  q1a: "Ritornello\nPerfect cadence\nBasso continuo", q1b: "Harmonics",
  q2a: "Oboe", q2b: "Syncopation", q2c: "Arco", q2d: "Pedal", q2e: "Melodic",
  q3a: "Musique concrète", q3b: "Irregular time signature", q3c: "Jazz funk",
  q4a: "F major", q4b: "Mordent", q4c: "dottedCrotchet,quaver", q4d: "5th", q4e: "E4,F4,G4", q4f: "G3,F3,D3,E3,F3,F3",
  q5a: "Lied\nInterrupted cadence\nStrophic\nDiminished 7th", q5b: "Coloratura", q5c: "Modal",
  q6a: { final: q6Correct }, q7a: { a: [], b: [], c: q7Correct }, q8a: q8Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40, "A complete official response should score 40 out of 40.");
assert.equal(marking.markPaper(paper, {}).score, 0, "A blank Higher 2016 paper should score zero.");

console.log("Higher 2016 paper tests passed.");
