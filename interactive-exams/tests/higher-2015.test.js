const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const { answerComplete, ExamEngine } = require("../exam-engine.js");
const notation = require("../exam-notation.js");
const paper = require("../papers/higher-2015.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const uiSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-ui.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(paper.questions.find(question => question.id === "q4").outroPosition, "before-score", "Question 4's replay instructions should appear before its score.");
assert.deepEqual(paper.questions.find(question => question.id === "q4").outroCompactRange, [2, 4], "Question 4's replay cues should use compact line spacing.");

assert.equal(registry[paper.id].level, "Higher", "The Higher paper should be available through the shared registry.");
assert.equal(paper.questions.length, 9, "Higher 2015 should contain nine questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [3, 5, 3, 6, 3, 6, 4, 5, 5], "Official question marks should be retained.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");

const expectedMarkers = [
  [41.3, 111.12],
  [69.96, 150, 229.94],
  [7.34, 71.56, 112.22],
  [7.7, 227.24, 321.32, 416.28],
  [6.42, 125.66, 202.24],
  [44.64, 117.6, 183.36],
  [45.38, 150.32, 255.74],
  [116.1, 173.08, 236.08, 292.62, 349.18, 402.48, 455.04],
  [105.52, 176.04, 246.48],
];
const durations = [211.487347, 319.268571, 204.564898, 601.338776, 264.881633, 425.012245, 391.444898, 585.926531, 328.933878];
assert.deepEqual(paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)), expectedMarkers, "Whisper-calibrated marker positions should remain fixed.");
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 31, "All expected audio markers should be present.");
paper.questions.forEach((question, index) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an official audio file.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} markers should be chronological.`);
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < durations[index]), true, `${question.id} markers should remain inside the official track.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should exist.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should exist.");

assert.deepEqual(paper.questions[0].introBoldPhrases, ["three"], "Question 1 should bold the requested number of concepts.");
assert.deepEqual(parts.get("q1a").boldPhrases, ["three answers"], "Question 1 should bold the source phrase beside its answer lines.");
assert.match(uiSource, /\$\{bank\}\$\{prompt\}.*higher-concept-lines/, "The concept box should appear before the answer instruction and ruled lines.");
assert.match(uiSource, /data-concept-line/, "Every Higher concept-answer line should be an independently selectable text field.");
assert.match(uiSource, /data-final-answer-line/, "Higher Question 6 should provide an independent input on every Final answer line.");
assert.match(uiSource, /<strong class="subquestion-heading-marks"/, "Source-paper mark numerals should use semantic bold styling.");
assert.match(uiSource, /function correctAnswerLabel[\s\S]*Correct answers:/, "Feedback should pluralise the Correct answers label for multi-answer responses.");
assert.match(uiSource, /function conceptLineFeedbackMarkup[\s\S]*higher-concept-answer-correct[\s\S]*uncreditedConceptMarkup/, "Higher concept-line feedback should colour correct and incorrect phrases separately on the same line.");
assert.equal(parts.get("q4a").boldPhrases.includes("one octave lower"), true);
assert.equal(parts.get("q4f").boldPhrases.includes("the last line"), true);
assert.equal(paper.questions[7].introBoldPhrases.includes("Remember to tick five boxes only in Column C."), true);
assert.deepEqual(paper.questions[7].introCompactRanges, [[6, 7], [8, 9], [10, 11]], "Question 8's three excerpt pairs should use compact spacing.");
assert.equal(paper.questions[7].introTotalMarks, 5, "Question 8's total should appear with its final Column C reminder.");
assert.equal(paper.questions[7].introTotalMarksIndex, 13, "Question 8's total should be anchored to the final Column C reminder.");
assert.equal(parts.get("q8a").hidePrompt, true, "Question 8 should not repeat its instructions above the table.");
assert.equal(parts.get("q8a").minimumResponsesToComplete, undefined, "Question 8 should not use the obsolete one-selection completion threshold.");
assert.equal(answerComplete(parts.get("q8a"), { c: ["Classical"] }), false, "One Column C tick should leave Question 8 partially answered.");
assert.equal(answerComplete(parts.get("q8a"), { c: ["Classical", "Sonata", "Acciaccatura", "Sequence"] }), false, "Four Column C ticks should leave Question 8 partially answered.");
assert.equal(answerComplete(parts.get("q8a"), { c: ["Classical", "Sonata", "Acciaccatura", "Sequence", "Anacrusis"] }), true, "Five Column C ticks should complete Question 8.");
assert.equal(answerComplete(parts.get("q8a"), { a: ["Classical"], c: [] }), false, "Rough-work ticks alone should not complete Question 8.");
assert.match(uiSource, /<th aria-hidden="true"><\/th><th>Concepts<\/th>/, "The Concepts heading should sit only above the concept-name column.");
assert.match(uiSource, /comparison-footer-spacer[^>]*colspan="4"[^>]*><\/td><td class="comparison-marks-footer">5 marks<\/td>/, "Question 8's mark footer should sit directly beneath Column C.");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");
assert.match(stylesSource, /\.paper-level-h\.question-layout-higher-guide \.inline-answer-feedback\s*\{[^}]*width:\s*calc\(var\(--higher-guide-box-width\) - 66px\);[^}]*max-width:\s*calc\(100% - 66px\);/, "Higher Question 2 feedback should remain inside its printed guide box.");
assert.match(stylesSource, /\.marked-question-card \.subquestion-lyric-placement \.text-answer\.is-user-correct,[\s\S]*border:\s*0;[\s\S]*box-shadow:\s*none;/, "Marked lyric answers should use green or red words without a coloured underline.");
assert.match(stylesSource, /\.marked-question-card \.subquestion-concept-lines \.higher-concept-line input\.is-user-correct,[\s\S]*border:\s*0;[\s\S]*box-shadow:\s*none;/, "Marked Higher concept answers should use green or red words without colouring the ruled answer lines.");
assert.match(stylesSource, /\.higher-concept-answer-correct\s*\{\s*color:\s*var\(--green\);\s*\}[\s\S]*\.higher-concept-answer-incorrect\s*\{\s*color:\s*var\(--red\);\s*\}/, "Mixed concepts on one line should use separate green and red feedback spans.");
assert.match(stylesSource, /\.marked-question-card \.higher-comparison-grid input[\s\S]*opacity:\s*0 !important;[\s\S]*\.is-user-correct label:has\(input:checked\)::after[\s\S]*background-color:\s*var\(--green\);/, "Marked comparison answers should show only green or red ticks, not native checkbox backgrounds.");

assert.equal(marking.markSubquestion(parts.get("q1a"), "Interrupted cadence\nConcerto grosso\nBasso continuo").marks, 3);
assert.equal(marking.markSubquestion(parts.get("q1a"), "Interrupted cadence\nConcherto grosso\nBasso continuo").marks, 3, "Higher concept lines should accept a clear common spelling mistake.");
assert.equal(marking.markSubquestion(parts.get("q1a"), "Interrupted cadence\nConcerto grosso\nBasso continuo\nCluster").marks, 2, "An additional answer should deduct one mark.");
assert.equal(marking.markSubquestion(parts.get("q1a"), "Interrupted cadence, Concerto grosso, Basso continuo").marks, 3, "All answers may be entered on one line.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "diminished").marks, 0, "Diminished alone must not earn the diminished-seventh mark.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "6").marks, 1, "The official numerical alternative should be accepted.");
assert.equal(marking.markSubquestion(parts.get("q3a"), "chant").marks, 0, "Chant alone is explicitly rejected.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "D6").marks, 1, "The official chord-symbol alternative should be accepted.");
const q7MixedAnswers = marking.markSubquestion(parts.get("q7a"), "Strophic\nTime changes\nSoul\nHaronimc minor scale");
assert.equal(q7MixedAnswers.marks, 4, "Higher Question 7 should accept the confirmed Harmonic spelling mistake.");
assert.deepEqual(new Set(q7MixedAnswers.correctEvidence.map(item => item.label)), new Set(["Time changes", "Soul", "Harmonic minor scale", "Strophic"]), "Higher Question 7 should identify every correct concept separately for feedback.");
const q7SameLineFeedback = marking.markSubquestion(parts.get("q7a"), "Strophic, Lied, Time changes, Soul, Harmonic minor scale");
assert.equal(q7SameLineFeedback.marks, 3, "An additional wrong concept should still apply the official Question 7 deduction.");
assert.deepEqual(new Set(q7SameLineFeedback.correctEvidence.map(item => item.text)), new Set(["Strophic", "Time changes", "Soul", "Harmonic minor scale"]), "Correct concepts should remain identifiable for green feedback even when a wrong concept shares their line.");
assert.deepEqual(paper.questions[5].introHeadingRowRange, [3, 5], "Question 6's three headings should share one row without bullets.");
assert.deepEqual(paper.questions[5].introCompactRange, [11, 13], "Question 6's playback statements should use compact spacing.");
assert.equal(paper.questions[5].introBoldPhrases.includes("Marks will only be awarded for the final answer."), false, "Question 6's final-answer sentence should not be bold.");
assert.equal(parts.get("q6a").endOfPaper, false, "Question 6 should not display an end-of-paper label.");
assert.deepEqual(parts.get("q7a").boldPhrases, ["four"], "Question 7 should bold only the number, not the word answers.");
assert.deepEqual(paper.questions[6].outroCompactRange, [1, 3], "Question 7's three playback statements should use compact spacing.");
assert.match(paper.questions[6].outro[0], /seconds\nbefore the next question starts\.$/, "Question 7 should break before the final timing phrase.");
assert.deepEqual(parts.get("q5a").promptLines, ["Listen to this excerpt and tick one box to identify the rhythmic feature.", "The music will be played twice."], "Question 5(a)'s heading should end before the choices.");
assert.deepEqual(parts.get("q5a").afterAnswerLines, ["Here is the music for the first time.", "Here is the music for the second time."], "Question 5(a)'s playback statements should follow the choices.");

assert.equal(paper.questions[3].score.sharedNotation, "higher-2015-q4");
assert.equal(paper.questions[3].scorePosition, "before", "The Higher literacy score should precede its questions.");
assert.match(parts.get("q4b").prompt, /Write your answer in the box\.$/, "Question 4(b) should retain the source instruction to write in the box.");
assert.equal(parts.get("q4b").answerInScore, true, "The interval answer should be entered in its source-paper score box.");
assert.deepEqual(parts.get("q4c").accidentalNoteIndices, [0, 2], "Higher Question 4(c) should allow placement before either printed note in bar 11.");
assert.equal(parts.get("q4f").answerInScore, true, "The chord answers should be entered in their two source-paper score boxes.");
assert.deepEqual(parts.get("q4f").answerReference.rows, [["C", "Chord I"], ["F", "Chord IV"], ["G", "Chord V"], ["Am", "Chord VI"]], "Higher Question 4(f) should retain the complete printed chord reference list.");
assert.equal(notation.formatHigherChordAnswer("am"), "Am", "Higher chord names should use the same capitalisation as chords.html.");
assert.equal(notation.formatHigherChordAnswer("vi"), "VI", "Higher Roman-numeral chord answers should be capitalised.");
assert.equal(notation.formatHigherChordAnswer("g7!"), "G", "Higher chord boxes should remove unsupported characters.");
assert.equal(notation.formatHigherChordAnswer("ivv"), "IV", "Each Higher chord box should accept no more than two characters.");
assert.deepEqual(parts.get("q4e").options, [], "Higher Question 4(e) should not show a separate bar-line selection button.");
assert.match(notationSource, /function higher2015ScoreSvg\(/, "Higher Question 4 should have a dedicated interactive score.");
assert.match(notationSource, /const HIGHER_2015_Q4_BARS = \[/, "Higher Question 4 should be encoded as structured bar data.");
assert.match(notationSource, /const removalGestureStates = new WeakMap\(\)/, "Notation removal timing should survive the score redraw after the first click.");
assert.match(notationSource, /pointerup[\s\S]*lastPointerUp[\s\S]*removeOnce\(event\)/, "Editable notation should support double-click removal when the first click redraws the score.");
assert.match(notationSource, /higher2015DrawNotes[\s\S]*q3DrawNote\(/, "Higher Question 4 should reuse the shared National 5 Bravura note renderer.");
assert.match(notationSource, /higher2015DrawNotes[\s\S]*q3GetBeam\(/, "Higher Question 4 should reuse the shared National 5 beaming rules.");
assert.match(notationSource, /higher2015DrawNotes[\s\S]*q3DrawTie\(/, "Higher Question 4 should reuse the shared National 5 tie renderer.");
assert.match(notationSource, /function q3AddDirectNoteTargets\([\s\S]*q3-note-preview[\s\S]*bindRemovalGesture/, "Higher direct note entry should reuse the National 5 hover-preview, drag and removal interaction pattern.");
assert.match(notationSource, /q3AddDirectNoteTargets\(svg, answers, onAnswerChange, \{\s*id: "q4a"/, "The transpose staff should use the shared direct note-entry interaction.");
assert.match(notationSource, /q3AddDirectNoteTargets\(svg, answers, onAnswerChange, \{\s*id: "q4d"/, "The missing-note staff should use the shared direct note-entry interaction.");
assert.match(notationSource, /const bassSteps = \{[\s\S]*E2: -2,[\s\S]*C4: 10,/, "Higher Question 4 transpose placement should accept bass-clef staff positions from E2 through C4.");
assert.match(notationSource, /const bassSlotX = \[barPositions\[0\]\[0\], barPositions\[0\]\[1\], barPositions\[1\]\[0\]\]/, "Each bass-clef answer note should align directly beneath its source treble note.");
assert.match(notationSource, /function higher2015DrawNotes[\s\S]*accidentalXOffset: Number\(item\.accidentalXOffset \|\| 0\) - 7/, "Printed Higher Question 4 accidentals should sit 2px further left than their previous calibration.");
assert.match(notationSource, /function higher2015AccidentalPlacement[\s\S]*Q3_STAFF\.gap \* 1\.4 - 7/, "The pupil-applied accidental should use the same additional 2px left adjustment.");
assert.match(notationSource, /function q3AddHigher2015AccidentalTargets[\s\S]*q3-accidental-preview[\s\S]*q3SetAccidentalToolArmed/, "Higher Question 4(c) should arm an accidental tool and preview it before placement.");
assert.match(notationSource, /function q3AddHigher2015AccidentalTargets[\s\S]*x: positions\[noteIndex\] - 36,[\s\S]*y: top - 34,[\s\S]*width: 72,[\s\S]*height: 104,/, "Both bar 11 accidental targets should surround the complete notehead, stem and quaver tail.");
assert.doesNotMatch(notationSource, /function higher2015BasicNote\(/, "Higher Question 4 must not fall back to hand-drawn ellipse noteheads and stems.");
assert.match(notationSource, /higher2015SystemBreakTie\(/, "The tie from bar 8 into bar 9 should be engraved as two system-break segments.");
assert.match(notationSource, /higher2015TextInput\(/, "Higher Question 4 should provide text entry inside its score boxes.");
assert.match(notationSource, /const intervalNotePositions = higher2015Positions\(HIGHER_2015_Q4_BARS\[5\]\.notes, intervalBarStart, intervalBarEnd\);[\s\S]*const intervalBoxRight = intervalNotePositions\[1\] \+ Q3_STAFF\.gap \* 1\.5 \+ 10;/, "Higher Question 4's interval box should end after the first two notes of bar 6 with the requested 10px extension.");
assert.match(notationSource, /higher2015SystemBreakTie\(svg, barPoints\[7\]\?\.at\(-1\), barPoints\[8\]\?\.\[0\], musicEnd \+ 1, musicStart - 3\)/, "The bar-8 system-break tie should extend 4px farther right.");
assert.match(notationSource, /const finalTieBarlineX = \(finalPositions\[9\] \+ finalPositions\[10\]\) \/ 2;[\s\S]*x1: finalRight,[\s\S]*x2: finalRight,[\s\S]*y1: finalTop/, "Higher Question 4's final line should include the requested internal and closing barlines.");
assert.match(notationSource, /notation-accidental-option-glyph/, "Higher Question 4 accidental controls should use Bravura glyphs.");
assert.match(notationSource, /isHigherQuestionFour \? controlsOnly : tools/, "Higher Question 4 Clear controls should be separate from the answer-button row.");
assert.match(notationSource, /isSequenceEntry \|\| isRhythmPlacement \|\| isAccidentalPlacement/, "Higher score accidentals should receive the same shared Clear control as notes, rhythms and bar lines.");
assert.match(uiSource, /paper\.levelCode === "H" && subquestion\.answerInScore[\s\S]*data-clear-score-answer/, "Higher answers typed directly in score boxes should receive a Clear control by default.");
assert.match(uiSource, /scoreClearButton\.addEventListener\("click"[\s\S]*engine\.setAnswer\(subquestion\.id, ""\)[\s\S]*renderSharedNotation/, "A Higher score-box Clear control should remove only its own answer and refresh the score.");
assert.equal((uiSource.match(/subquestion\.type === "notation-choice" \|\| subquestion\.answerInScore/g) || []).length, 2, "Both checked-question and final-paper feedback should send score-box answer results to the Higher notation renderer.");
assert.match(notationSource, /higher-2015-barline-preview/, "Higher Question 4 should preview bar lines directly inside the line 5 score box.");
assert.match(notationSource, /const barlineTargets = line5Positions\.slice\(0, -1\)\.map\(\(position, index\) => \{/, "Higher Question 4(e) should allow bar-line placement in every gap between consecutive line 5 score items.");
assert.match(notationSource, /officialBarlineIds = new Map\(\[\s*\[3, "line5-gap-4"\],\s*\[10, "line5-gap-11"\],\s*\[15, "line5-15"\],/, "Higher Question 4(e) should place its three marked bar lines after each complete four-beat group.");
assert.match(notationSource, /needsCorrection\("q4e"\)[\s\S]*q3-barline q3-answer-correction/, "Incorrect Higher bar-line feedback should retain the pupil's red positions and add missing correct positions in green.");
assert.match(notationSource, /bassExpectedValues[\s\S]*q3-answer-correction[\s\S]*noteExpectedValues[\s\S]*q3-answer-correction/, "Higher transposition and missing-note feedback should use the National 5 red-answer and green-correction pattern.");
assert.match(notationSource, /needsCorrection\("q4c"\)[\s\S]*flatInScore[\s\S]*q3-answer-correction/, "Higher accidental feedback should draw the correct Bravura accidental in green when required.");
assert.match(notationSource, /acceptedChordTokens[\s\S]*expectedChordTokens[\s\S]*q3-answer-correction/, "Higher chord feedback should retain incorrect pupil text in red and add the correct chord in green.");
assert.match(notationSource, /const openingBarlineX = 78;[\s\S]*y1: firstSystemTop,[\s\S]*y2: bassTop \+ Q3_STAFF\.gap \* 4,/, "Higher Question 4 should join the opening treble and bass staves with a continuous barline.");
assert.match(notationSource, /x1: musicEnd,[\s\S]*x2: musicEnd,[\s\S]*y1: line5Top,[\s\S]*y2: line5Top \+ Q3_STAFF\.gap \* 4,/, "Higher Question 4(e) should show a barline at the end of line 5.");
assert.match(notationSource, /const guideOffsetX = -20;[\s\S]*const guideTop = systems\[3\] - 35;/, "Higher Question 4(d)'s guide rhythm should be 20px left and 10px lower.");
assert.equal(marking.markSubquestion(parts.get("q4b"), "4th").marks, 1);
assert.equal(answerComplete(parts.get("q4c"), "flat"), false, "Selecting an accidental without placing it should not complete Question 4(c).");
assert.equal(answerComplete(parts.get("q4c"), "flat@0"), true, "Placing a flat before the first note should complete Question 4(c).");
assert.equal(answerComplete(parts.get("q4c"), "flat@2"), true, "Placing a flat before the second note should complete Question 4(c).");
assert.equal(marking.markSubquestion(parts.get("q4c"), "flat@0").marks, 1, "A correctly placed flat before the first note should earn the mark.");
assert.equal(marking.markSubquestion(parts.get("q4c"), "flat@2").marks, 1, "A correctly placed flat before the second note should earn the mark.");
assert.equal(marking.markSubquestion(parts.get("q4c"), "natural@2").marks, 0, "An incorrectly selected accidental should not earn the mark at the second note.");
assert.equal(marking.markSubquestion(parts.get("q4f"), "G, Am").marks, 1, "The two separate chord boxes should combine into one correctly marked response.");
assert.equal(marking.markSubquestion(parts.get("q4a"), "E3,G3,C4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4d"), "E5,A4,A4").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "line5-gap-4,line5-gap-11,line5-15").marks, 1);
assert.equal(marking.markSubquestion(parts.get("q4e"), "line5-2,line5-8,line5-15").marks, 0, "The obsolete pre-correction bar-line gaps should no longer earn the mark.");

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  remove() {}
}
const previousDocument = global.document;
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };
const notationWrap = new FakeSvgNode("div");
const notationContainer = { innerHTML: "", querySelector: () => notationWrap };
notation.renderSharedScore(
  notationContainer,
  paper.questions.find(question => question.id === "q4"),
  { q4e: "line5-gap-5,line5-gap-11,line5-15" },
  null,
  { q4e: "incorrect" },
);
const markedBarlines = (function collect(node) {
  return [node, ...node.children.flatMap(collect)];
})(notationWrap).filter(node => node.name === "line" && node.attributes.y1 === "880" && /q3-answer-(?:correct|incorrect|correction)/.test(node.attributes.class || ""));
const barlineClasses = node => new Set(String(node.attributes.class || "").split(/\s+/));
assert.equal(markedBarlines.filter(node => barlineClasses(node).has("q3-answer-incorrect")).length, 1, "An incorrectly placed Higher bar line should remain visible in red.");
assert.equal(markedBarlines.filter(node => barlineClasses(node).has("q3-answer-correct")).length, 2, "Correctly placed Higher bar lines should remain visible in green even when another bar line is wrong.");
assert.equal(markedBarlines.filter(node => barlineClasses(node).has("q3-answer-correction")).length, 1, "The missing correct Higher bar line should be added to the score in green.");
const textFeedbackWrap = new FakeSvgNode("div");
notation.renderSharedScore(
  { innerHTML: "", querySelector: () => textFeedbackWrap },
  paper.questions.find(question => question.id === "q4"),
  { q4b: "5th", q4f: "C,F" },
  null,
  { q4b: "incorrect", q4f: "incorrect" },
);
const markedScoreText = (function collect(node) {
  return [node, ...node.children.flatMap(collect)];
})(textFeedbackWrap).filter(node => node.name === "text" && /q3-answer-(?:incorrect|correction)/.test(node.attributes.class || ""));
assert.equal(markedScoreText.some(node => node.textContent === "5th" && barlineClasses(node).has("q3-answer-incorrect")), true, "An incorrect Higher interval should remain visible in red inside its score box.");
assert.equal(markedScoreText.some(node => node.textContent === "4th" && barlineClasses(node).has("q3-answer-correction")), true, "The correct Higher interval should be added in green inside the score.");
assert.deepEqual(markedScoreText.filter(node => barlineClasses(node).has("q3-answer-correction") && ["G", "Am"].includes(node.textContent)).map(node => node.textContent), ["G", "Am"], "Incorrect Higher chord boxes should add both correct chords in green.");
global.document = previousDocument;

const q4Inventory = notation.getInventory("higher-2015-q4");
assert.equal(q4Inventory.bars.length, 16, "Higher Question 4 should retain all sixteen numbered bars.");
assert.deepEqual(
  q4Inventory.bars.map(item => item.notes.map(note => `${note.rest ? "rest" : note.pitch}:${note.rhythm}`)),
  [
    ["E4:minim", "G4:minim"],
    ["C5:dottedMinim", "rest:quaverRest", "C5:quaver"],
    ["E5:crotchet", "F5:quaver", "E5:quaver", "E5:quaver", "D5:dottedCrotchet"],
    ["C5:dottedMinim", "rest:quaverRest", "G4:quaver"],
    ["Ab4:crotchet", "G4:quaver", "D5:quaver", "D5:quaver", "D5:dottedCrotchet"],
    ["C5:crotchet", "G4:minim", "rest:quaverRest", "F♯4:quaver"],
    ["F♯4:dottedCrotchet", "D5:quaver", "D5:dottedCrotchet", "E4:quaver"],
    ["F4:minim", "D5:crotchet", "C5:quaver", "C5:quaver"],
    ["C5:dottedMinim", "rest:crotchetRest"],
    ["A4:minim", "C5:minim"],
    ["Ab4:dottedMinim", "rest:quaverRest", "Ab4:quaver"],
    ["C5:minim", "B4:dottedCrotchet", "G4:quaver"],
    ["E5:dottedCrotchet", "G4:quaver", "G4:dottedCrotchet", "G4:quaver"],
    ["E5:dottedCrotchet", "A4:quaver", "A4:minim"],
    ["E5:crotchet", "B4:quaver", "B4:quaver", "B4:quaver", "D5:dottedCrotchet"],
    ["D5:quaver", "C5:semiquaver", "B4:semiquaver", "C5:crotchet", "rest:quaverRest", "C5:quaver", "D5:quaver", "E5:quaver"],
  ],
  "Every numbered bar should match the explicit source-audited pitch and rhythm inventory.",
);
const q4RhythmBeats = { semiquaver: .25, quaver: .5, dottedQuaver: .75, crotchet: 1, dottedCrotchet: 1.5, minim: 2, dottedMinim: 3, semibreve: 4, quaverRest: .5, crotchetRest: 1, minimRest: 2 };
q4Inventory.bars.forEach((item, index) => {
  const beats = item.notes.reduce((sum, note) => sum + q4RhythmBeats[note.rhythm], 0);
  assert.equal(beats, 4, `Higher Question 4 bar ${index + 1} should contain exactly four crotchet beats.`);
});
assert.equal(q4Inventory.line5.reduce((sum, note) => sum + q4RhythmBeats[note.rhythm], 0), 16, "The bar-line exercise should contain four complete bars.");
assert.equal(q4Inventory.finalLine.reduce((sum, note) => sum + q4RhythmBeats[note.rhythm], 0), 12, "The chord exercise should contain three complete bars.");
assert.deepEqual(
  q4Inventory.line5.map(note => `${note.rest ? "rest" : note.pitch}:${note.rhythm}`),
  ["F5:dottedCrotchet", "A4:quaver", "A4:dottedCrotchet", "A4:quaver", "B4:quaver", "B4:quaver", "B4:quaver", "C5:quaver", "C5:quaver", "D5:crotchet", "E5:quaver", "E5:crotchet", "F5:quaver", "E5:quaver", "E5:quaver", "D5:dottedCrotchet", "D5:quaver", "C5:quaver", "rest:crotchetRest", "D5:crotchet", "E5:crotchet"],
  "The complete line 5 pitch-and-rhythm inventory should retain the user-confirmed correction.",
);
assert.deepEqual(
  q4Inventory.finalLine.map(note => `${note.rest ? "rest" : note.pitch}:${note.rhythm}`),
  ["F5:dottedCrotchet", "A4:quaver", "A4:dottedCrotchet", "A4:quaver", "F5:crotchet", "B4:quaver", "B4:quaver", "B4:quaver", "C5:crotchet", "C5:quaver", "C5:minim", "rest:minimRest"],
  "The complete line 6 pitch-and-rhythm inventory should retain the user-confirmed correction.",
);
assert.equal(q4Inventory.bars[4].notes[0].accidental, "flat", "Line 2 should print the confirmed A-flat accidental.");
assert.deepEqual([q4Inventory.bars[5].notes[3].accidental, q4Inventory.bars[6].notes[0].accidental], ["sharp", "sharp"], "Line 2 should print both confirmed F-sharp accidentals.");
assert.equal(q4Inventory.bars[10].notes.filter(note => !note.rest).every(note => !note.accidental), true, "Bar 11 should leave the confirmed A-flat accidental for the pupil to place.");
assert.deepEqual(q4Inventory.line5BeamGroups, [{ start: 4, end: 7 }, { start: 12, end: 13 }, { start: 16, end: 17 }], "Line 5 should retain the three source-confirmed beam groups and leave every other quaver standalone.");
assert.deepEqual(q4Inventory.line5Slurs, [{ start: 16, end: 17 }], "Line 5 should retain the slur over the D5-C5 pair at souls.");
assert.deepEqual(
  q4Inventory.line5.map((note, index) => note.tieToNext ? index : null).filter(index => index !== null),
  [7, 10, 13],
  "Line 5 should retain the confirmed C5, E5 and E5 tie starts.",
);
assert.deepEqual(
  q4Inventory.line5.map((note, index) => note.tiedFromPrevious ? index : null).filter(index => index !== null),
  [8, 11, 14],
  "Line 5 should retain the confirmed tied C5, E5 and E5 destinations.",
);
assert.deepEqual(q4Inventory.finalLineBeamGroups, [{ start: 5, end: 6 }], "The final tied quaver should remain separate from the preceding beam group.");
assert.equal(q4Inventory.lyricOffsets[15][0], 10, "The word world in bar 16 should be moved 10 px to the right.");

const q6Correct = ["Major", "Perfect cadence", "Anacrusis", "Syncopation", "Flute", "Accordion"].join("\n");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct }).marks, 6, "Two valid concepts from every heading should earn all six marks.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: q6Correct + "\nTriangle" }).marks, 6, "Incorrect extra answers should not reduce Question 6 marks.");
assert.equal(
  marking.markSubquestion(parts.get("q6a"), { final: ["Accordion", "Drum kit", "Major", "Perfect cadence", "Syncopation"].join("\n") }).marks,
  5,
  "Five valid concepts across the headings should earn five marks even without a sixth response.",
);
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Drum kit\nDrums" }).marks, 1, "An additional rejected Drums response must not cancel the valid Drum kit concept.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Accordion\nDrum kit\nDrums\nMajor\nPerfect cadence\nSyncopation" }).marks, 5, "Question 6 should retain every valid mark when Drums is also present.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Major\nMinor\nModulation\nPerfect cadence\nPlagal cadence\nOrnament" }).marks, 2, "A heading remains capped at two marks.");
assert.equal(marking.markSubquestion(parts.get("q6a"), { final: "Flute\nAccordion\nMajor\nMinor\nAnacrusis\nSyncopation" }).marks, 6, "Concepts are recognised regardless of the order or heading used.");

assert.equal(marking.markSubquestion(parts.get("q7a"), "Time changes\nSoul\nHarmonic minor scale\nStrophic").marks, 4);
assert.equal(marking.markSubquestion(parts.get("q7a"), "Time changes\nSoul\nHarmonic minor scale\nStrophic\nLied").marks, 3);

const q8Correct = ["Classical", "Sonata", "Acciaccatura", "Sequence", "Anacrusis"];
assert.equal(marking.markSubquestion(parts.get("q8a"), { a: ["Romantic"], b: ["Concerto"], c: q8Correct }).marks, 5, "Columns A and B must not affect the mark.");
assert.equal(marking.markSubquestion(parts.get("q8a"), { c: [...q8Correct, "Romantic"] }).marks, 4, "A sixth, incorrect Column C answer should deduct one mark.");

const q9Correct = { 6: "harp glissando", 10: "rallentando", 11: "tremolando starts", 14: "major scale played by the strings", 16: "timpani rolls" };
assert.equal(marking.markSubquestion(parts.get("q9a"), { 6: "glisando" }).marks, 1, "Lyric-placement answers should use the same cautious spelling tolerance.");
assert.equal(parts.get("q9a").lyricLines.length, 17, "Question 9 should contain all 17 printed lyric lines.");
assert.equal(parts.get("q9a").lyricLines.some(line => /^Lyric line /.test(line)), false, "Question 9 should not contain placeholder lyric text.");
assert.equal(paper.questions[8].intro.some(line => line.startsWith("The music will now be played")), false, "Question 9's playback text should no longer appear above the feature list.");
assert.deepEqual(parts.get("q9a").playbackLines.slice(1), ["Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."], "Question 9's playback cues should follow the feature list.");
assert.equal(parts.get("q9a").hidePrompt, true, "Question 9 should not repeat its insertion instruction above the feature list.");
assert.equal(paper.questions[8].totalMarksOnLastPart, undefined, "Question 9's mark should be rendered beside the lower insertion instruction.");
assert.equal(marking.markSubquestion(parts.get("q9a"), q9Correct).marks, 5, "Full printed phrases should be accepted.");
assert.equal(marking.markSubquestion(parts.get("q9a"), { 6: "glissando", 10: "rallentando", 11: "rallentando tremolando", 14: "scale", 16: "rolls", 17: "rolls" }).marks, 5, "Official either-line and both-line alternatives should not be penalised.");
assert.equal(marking.markSubquestion(parts.get("q9a"), { ...q9Correct, 1: "Sonata" }).marks, 4, "An additional incorrect placement should deduct one mark.");

assert.equal(answerComplete(parts.get("q1a"), "Interrupted cadence"), false, "One Question 1 concept should be partially answered.");
assert.equal(answerComplete(parts.get("q1a"), "Interrupted cadence Concerto grosso Basso continuo"), true, "Three recognised Question 1 concepts may complete one line.");
assert.equal(answerComplete(parts.get("q6a"), { final: "Accordion\nDrum kit\nMajor\nPerfect cadence\nSyncopation" }), false, "Five Question 6 responses should be partially answered.");
assert.equal(answerComplete(parts.get("q6a"), { final: "Accordion\nDrum kit\nMajor\nPerfect cadence\nAnacrusis\nSyncopation" }), true, "Six Question 6 responses should complete the question.");
assert.equal(answerComplete(parts.get("q6a"), { final: "Accordion Drum kit Major Perfect cadence Anacrusis Syncopation" }), true, "Six recognised Question 6 concepts may complete one final-answer line.");
assert.equal(answerComplete(parts.get("q7a"), "Strophic\nTime changes\nSoul"), false, "Three Question 7 concepts should be partially answered.");
assert.equal(answerComplete(parts.get("q7a"), "Strophic Time changes Soul Haronimc minor scale"), true, "Four recognised Question 7 concepts may complete one line.");

const completionEngine = new ExamEngine(paper);
completionEngine.attempt = { answers: { q1a: "Interrupted cadence" } };
assert.equal(completionEngine.questionState(paper.questions[0]), "partial", "A partly completed single-part question should be labelled Partially answered.");
completionEngine.attempt.answers.q1a = "Interrupted cadence Concerto grosso Basso continuo";
assert.equal(completionEngine.questionState(paper.questions[0]), "answered", "Question 1 should be labelled Answered only after three responses.");
completionEngine.attempt.answers = { q6a: { final: "Accordion\nDrum kit\nMajor\nPerfect cadence\nSyncopation" } };
assert.equal(completionEngine.questionState(paper.questions[5]), "partial", "Question 6 should remain Partially answered after five responses.");
completionEngine.attempt.answers = { q7a: "Strophic\nTime changes\nSoul" };
assert.equal(completionEngine.questionState(paper.questions[6]), "partial", "Question 7 should remain Partially answered after three responses.");
completionEngine.attempt.answers = { q8a: { c: ["Classical", "Sonata", "Acciaccatura", "Sequence"] } };
assert.equal(completionEngine.questionState(paper.questions[7]), "partial", "Question 8 should remain Partially answered after four Column C ticks.");

const completeAnswers = {
  q1a: "Interrupted cadence\nConcerto grosso\nBasso continuo",
  q2a: "homophonic", q2b: "diminished 7th", q2c: "clarinet", q2d: "12/8", q2e: "perfect",
  q3a: "plainchant", q3b: "recitative", q3c: "added 6th",
  q4a: "E3,G3,C4", q4b: "4th", q4c: "flat@0", q4d: "E5,A4,A4", q4e: "line5-gap-4,line5-gap-11,line5-15", q4f: "G Am",
  q5a: "3 against 2", q5b: "Impressionist", q5c: "String quartet",
  q6a: { final: q6Correct },
  q7a: "Time changes\nSoul\nHarmonic minor scale\nStrophic",
  q8a: { a: [], b: [], c: q8Correct },
  q9a: q9Correct,
};
assert.equal(marking.markPaper(paper, completeAnswers).score, 40, "A complete official response should score 40 out of 40.");

console.log("Higher 2015 paper tests passed.");
