const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2023.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2023, "The 2023 paper should be available through the shared registry.");
assert.equal(paper.questions.length, 8, "The 2023 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [6, 4, 6, 8, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["02", "03", "04", "05", "06", "07", "08", "09"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);

const expectedMarkers = [
  [5.9, 63.74, 137.86, 202.4, 250.44],
  [97.94, 172.12, 245.38],
  [8.4, 134.92, 208.08, 280.48],
  [6.38, 43.64, 107.6, 164.8, 260.58, 315, 362.8],
  [83.4, 135.44, 188.38],
  [54.6, 169.08],
  [6.64, 85.7],
  [40.36, 115.96, 192.38],
];
const officialAudioDurations = [362.997551, 320.783673, 445.910204, 417.253878, 250.462041, 284.395102, 168.385306, 386.35102];
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
    assert.equal(marking.markSubquestion(part, [part.answers[0]]).marks, 1, `${part.id} should award one mark for one correct selection.`);
  }
  (part.acceptedAnswers || []).forEach(answer => {
    assert.equal(marking.markSubquestion(part, answer).marks, part.marks, `${part.id} should accept ${answer}.`);
  });
});

assert.equal(marking.markSubquestion(parts.get("q1c"), "mezzo").marks, 0, "Question 1(c) should require the full voice type.");
assert.equal(marking.markSubquestion(parts.get("q1d"), "Waulking song music").marks, 1, "Question 1(d) should accept the style followed by music.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "5 - 1").marks, 1, "Question 2 should accept the official chord-number cadence description.");
assert.equal(marking.markSubquestion(parts.get("q4d"), ["Imitation"]).marks, 1, "One correct Question 4(d) selection should earn one mark.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2023-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 10, "Question 3 should retain all ten numbered bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "F major").marks, 1, "Question 3(a) should accept F major.");
assert.deepEqual(parts.get("q3b").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(b) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Moderato").marks, 1, "Question 3(b) should accept Moderato under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "A4,Bb4").marks, 1, "Question 3(c) should require A followed by B flat.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "Bb4,A4").marks, 0, "Question 3(c) should reject the notes in the wrong order.");
assert.equal(parts.get("q3d").answerDisplay, "1.5 or 1½", "National 5 2023 should show the decimal duration first in feedback.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "1.5").marks, 1, "Question 3(d) should accept the decimal duration.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "one and a half").marks, 1, "Question 3(d) should accept the duration in words.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "minor 2nd").marks, 1, "Question 3(e) should accept any official second/semitone description.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "end-bar-8").marks, 1, "Question 3(f) should require the repeat sign at bar 8.");
assert.match(notationSource, /const N5_2023_Q3_ANACRUSIS = \[note\("A4", "quaver"\), note\("Bb4", "quaver"\)\]/, "Question 3 should retain its two-note anacrusis.");
assert.match(notationSource, /const N5_2023_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
assert.match(notationSource, /N5_2023_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING \+ 15/, "Question 3 systems should have 15px additional spacing.");
assert.match(notationSource, /note\("E5", "quaver", \{ accidental: "flat", accidentalXOffset: -6 \}\)/, "Question 3 bar 5 flat should be moved further left.");
assert.match(notationSource, /q3DrawTie\(svg, drawnPoints\[from\]\[0\], drawnPoints\[to\]\[0\], \{ widthScale: 2 \}\)/, "Question 3 ties between bars 7/8 and 9/10 should extend over the notes.");
assert.match(notationSource, /viewBox: "0 0 920 700"/, "Question 3 score should leave room for the lower tie.");
assert.match(notationSource, /function q3BarPositions2023[\s\S]+bar\.positionOffsets/, "Question 3 should apply the bar 10 minim position adjustment.");
assert.match(notationSource, /const pickupX = \[Q3_STAFF\.left \+ 133, Q3_STAFF\.left \+ 169\]/, "Question 3 opening paired quavers should be moved 15px right.");
assert.match(notationSource, /q3CalibratedSymbol\(svg, "repeatLeft", q3BarStart2023\(0\) - 32/, "Question 3 opening repeat sign should be moved another 15px left.");
assert.match(notationSource, /q3DrawTimeSignature\(svg, "4\/4", top, "", 0, Q3_STAFF\.left \+ 105\)/, "Question 3 time signature should be moved 10px right.");
assert.match(notationSource, /function q3VisibleBarEnd2023[\s\S]+return lastNote \+ 25/, "Question 3 first bar should end shortly after its paired quavers.");
assert.match(notationSource, /q3Text\(svg, "Notes", \{ x: left \+ 12, y: top - 37/, "Question 3 bar 2 Notes label should be moved down another 5px.");
assert.match(notationSource, /q3Text\(svg, "Interval", \{ x: left \+ 12, y: top - 38/, "Question 3 Interval label should be moved down 5px.");
assert.match(notationSource, /x: x - 38, y: top - 57, width: 76, height: 127/, "Question 3 bar 3 X box should be shortened from the top by 15px.");
assert.match(notationSource, /q3Text\(svg, "X", \{ x, y: top - 32/, "Question 3 X label should be moved down 10px.");
const expectedQuestionThreeBars = [
  'bar([note("C5", "dottedMinim"), note("A4", "quaver"), note("Bb4", "quaver")]',
  'bar([note("C5", "dottedMinim"), note("A4", "quaver"), note("Bb4", "quaver")], { missingIndices: [1, 2]',
  'bar([note("C5", "crotchet"), note("Bb4", "crotchet", { stemDown: true }), note("F5", "dottedCrotchet"), note("D5", "quaver")])',
  'bar([note("C5", "crotchet"), note("Bb4", "minim", { stemDown: true }), note("F4", "quaver"), note("G4", "quaver")]',
  'bar([note("Bb4", "crotchet", { stemDown: true }), note("A4", "crotchet"), note("E5", "crotchet"), note("E5", "quaver"), note("E5", "quaver", { accidental: "flat", accidentalXOffset: -6 })]',
  'bar([note("D5", "minim"), note("E4", "crotchet", { accidental: "natural", accidentalXOffset: -6 }), note("F4", "quaver"), note("G4", "quaver")]',
  'bar([note("C5", "semibreve", { tieToNextBar: true })])',
  'bar([note("C5", "minim", { tiedFromPreviousBar: true }), rest(), note("A4", "quaver"), note("Bb4", "quaver")]',
  'bar([note("F4", "semibreve", { tieToNextBar: true })])',
  'bar([note("F4", "minim", { tiedFromPreviousBar: true })], { positionOffsets: [-45] })',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /function q3Add2023NoteEntryTargets[\s\S]+onAnswerChange\("q3c", value\)/, "Question 3(c) should save notes placed directly on bar 2.");
assert.match(notationSource, /bars: N5_2023_Q3_BARS\.slice\(0, 8\), answerId: "q3f"/, "Question 3(f) should allow the pupil to place the repeat sign physically.");

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
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2023 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 700", "The 2023 score should use its expanded five-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q7a2"), "choir").marks, 1, "Question 7(a) should accept choir as the supporting reason.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "accordion and electric guitar").marks, 1, "Question 7(b) should accept one traditional and one rock feature.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "bagpipes").marks, 0, "Question 7(b) should not award a mark for only the traditional half of the link.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "rock band").marks, 0, "Question 7(b) should not award a mark for only the rock half of the link.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  if ((concept.alwaysBlockedAnswers || []).includes(answer)) return;
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "drum kit" }).marks, 1, "Question 8 should accept drum kit.");
assert.equal(marking.markSubquestion(questionEight, { final: "violin" }).marks, 0, "Question 8 should reject singular violin.");
assert.equal(marking.markSubquestion(questionEight, { final: "violins" }).marks, 1, "Question 8 should accept plural violins.");
assert.equal(marking.markSubquestion(questionEight, { final: "quiet" }).marks, 0, "Question 8 should reject an English dynamic equivalent.");
assert.equal(marking.markSubquestion(questionEight, { final: "piano" }).marks, 1, "Question 8 should accept a full Italian dynamic term.");
assert.equal(marking.markSubquestion(questionEight, { final: "Repetition" }).marks, 1, "Question 8 should award repetition only once across headings.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Accents, anacrusis, chromatic, perfect cadence, clarinet and forte." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.rhythm.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Accents, anacrusis, chromatic, perfect cadence and major." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Accents, anacrusis, chromatic, perfect cadence and clarinet." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Accents, anacrusis, chromatic, perfect cadence and clarinet." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "choir";
  else if (part.id === "q7b2") fullAnswers[part.id] = "accordion and electric guitar";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
assert.equal(marking.markPaper(paper, {}).score, 0, "A blank 2023 paper should score zero.");
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2023 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2023 paper tests passed.");
