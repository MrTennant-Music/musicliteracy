const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2025.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2025, "The 2025 paper should be available through the shared registry.");
assert.equal(paper.questions.length, 8, "The 2025 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [8, 4, 6, 6, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The paper should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["02", "03", "04", "05", "06", "07", "08", "09"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);

const expectedMarkers = [
  [5.56, 59.58, 158.34, 178.4, 250.54, 326.14],
  [96.7, 159.5, 221.54],
  [10.56, 127.44, 195.72, 261.74],
  [4.82, 91.96, 143.66, 193.98, 284.82, 306.66],
  [81.76, 151.9, 221.76],
  [53.24, 133.98],
  [5.32, 86.7],
  [41.92, 118.84, 196.64],
];
const officialAudioDurations = [430.001633, 286.876735, 423.88898, 419.683265, 302.28898, 217.573878, 183.353469, 393.639184];
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
assert.equal(allParts.filter(part => part.finalAnswerField).every(part => part.finalAnswerMarks === undefined), true, "Question 8 should not repeat its mark beside the ruled Final answer area.");

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

assert.equal(marking.markSubquestion(parts.get("q1c"), "Alberti").marks, 1, "Question 1(c) should accept Alberti on its own.");
assert.equal(marking.markSubquestion(parts.get("q1d"), "12 / 8").marks, 1, "Question 1(d) should accept an equivalent spaced time signature.");
assert.equal(marking.markSubquestion(parts.get("q1d"), "compound time").marks, 0, "Question 1(d) should reject compound time without a time signature.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "glissando").marks, 1, "Question 2 should accept the official alternative string technique.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "4/4").marks, 1, "Question 2 should accept the official time-signature alternative.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "four").marks, 0, "Question 2 should not accept only the number of beats.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "rit.").marks, 1, "Question 2 should accept the official abbreviated tempo term.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2025-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 10, "Question 3 should retain all ten bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3b"), "Andante").marks, 1, "Question 3(b) should accept Andante under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Moderato").marks, 1, "Question 3(b) should accept the official expected answer Moderato.");
assert.deepEqual(parts.get("q3b").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(b) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "F4,G4,A4").marks, 1, "Question 3(c) should require the three correct missing notes.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "G4,F4,A4").marks, 0, "Question 3(c) should reject notes in the wrong order.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "2nd").marks, 1, "Question 3(d) should accept the official interval-number alternative.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "end-bar-8").marks, 1, "Question 3(e) should require the end-repeat after bar 8.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "end-bar-1").marks, 0, "Question 3(e) should reject an end-repeat at bar 1.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "V-I").marks, 1, "Question 3(f) should accept the cadence chords.");
assert.match(notationSource, /const N5_2025_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
const expectedQuestionThreeBars = [
  'bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "crotchet"), note("F4", "dottedQuaver"), note("C4", "semiquaver")]',
  'bar([note("D4", "crotchet"), note("F4", "crotchet"), note("F4", "minim")])',
  'bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "crotchet"), note("F4", "dottedQuaver"), note("C4", "semiquaver")], { missingIndices: [0, 1, 2]',
  'bar([note("D4", "crotchet"), note("G4", "crotchet"), note("G4", "minim")])',
  'bar([rest("crotchetRest"), note("F4", "crotchet"), note("F4", "crotchet"), note("G4", "crotchet")])',
  'bar([note("G4", "crotchet"), note("A4", "crotchet"), note("A4", "crotchet"), note("Bb4", "crotchet")])',
  'bar([note("C5", "minim", { tieToNext: true }), note("C5", "quaver"), note("A4", "quaver"), note("Bb4", "quaver"), note("F4", "quaver", { accidental: "sharp", accidentalXOffset: -4 })]',
  'bar([note("A4", "quaver"), note("G4", "quaver"), note("G4", "dottedMinim")]',
  'bar([note("C5", "minim", { tieToNext: true }), note("C5", "quaver"), note("A4", "quaver"), note("Bb4", "quaver"), note("E4", "quaver")]',
  'bar([note("G4", "quaver"), note("F4", "quaver"), note("F4", "dottedMinim")]',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /function q3Add2025NoteEntryTargets[\s\S]+onAnswerChange\("q3c", value\)/, "Question 3(c) should save notes placed directly on bar 3.");
assert.match(notationSource, /correctAnswer\("q3c", "F4,G4,A4"\)[\s\S]+top - 50, width: right - left, height: 125/, "Question 3(c) Notes box should be shortened from the top while retaining its lower edge.");
assert.match(notationSource, /q3Text\(svg, "\(c\) Notes", \{ x: left \+ 12, y: top - 32/, "Question 3(c) Notes label should sit 10px lower.");
assert.match(notationSource, /barIndex === 5[\s\S]+top - 47, width: right - left, height: 109/, "Question 3(d) Interval box should be shortened from the bottom while retaining its top edge.");
assert.match(notationSource, /q3Text\(svg, "\(d\) Interval", \{ x: left \+ 12, y: top - 33/, "Question 3(d) Interval label should sit 5px lower.");
assert.match(notationSource, /barIndex === 8[\s\S]+top - 52, width: right - left, height: 121/, "Question 3(f) Cadence box should be moved 20px down.");
assert.match(notationSource, /q3Text\(svg, "\(f\) Cadence", \{ x: left \+ 12, y: top - 28/, "Question 3(f) Cadence label should sit 10px higher.");
assert.match(notationSource, /q3DrawTimeSignature\(svg, "4\/4", top, "", 0, Q3_STAFF\.left \+ 110\)/, "Question 3 printed time signature should be moved 15px right.");
assert.match(notationSource, /q3AddRepeatTargets[\s\S]+answerId: "q3e"/, "Question 3(e) should use the shared repeat-sign interaction.");

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
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2025 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 660", "The 2025 score should use its complete five-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q7a2"), "orchestra").marks, 1, "Question 7(a) should accept orchestra.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "orchestral").marks, 1, "Question 7(a) should accept orchestral.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "solo instrument and orchestra").marks, 0, "Question 7(a) should reject evidence suggesting a featured solo instrument.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "speaking over a beat").marks, 1, "Question 7(b) should accept linked speech and beat evidence.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "lyrics with background singing").marks, 1, "Question 7(b) should accept the official linked lyrics and background evidence.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "words sung quickly").marks, 0, "Question 7(b) should reject evidence without a beat, rhythm or accompaniment.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "rapping over a beat").marks, 0, "Question 7(b) should not credit the selected style name as vocal evidence.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  if ((concept.alwaysBlockedAnswers || []).includes(answer)) return;
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "guitar" }).marks, 0, "Question 8 should reject guitar without acoustic or electric.");
assert.equal(marking.markSubquestion(questionEight, { final: "electric guitar" }).marks, 1, "Question 8 should accept electric guitar.");
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "drum kit" }).marks, 1, "Question 8 should accept drum kit.");
assert.equal(marking.markSubquestion(questionEight, { final: "fills" }).marks, 0, "Question 8 should reject fills without drum.");
assert.equal(marking.markSubquestion(questionEight, { final: "drum fills" }).marks, 1, "Question 8 should accept drum fills.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
assert.equal(marking.markSubquestion(questionEight, { final: "mezzo forte" }).marks, 1, "Question 8 should award mezzo forte only once.");
assert.equal(marking.markSubquestion(questionEight, { final: "Repetition" }).marks, 1, "Question 8 should award repetition only once across headings.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Major, sequence, accents, drum fills, saxophone and crescendo." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.melody.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Major, sequence, perfect cadence, accents and syncopation." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Major, sequence, accents, drum fills and saxophone." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Major, sequence, accents, drum fills and saxophone." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "orchestra";
  else if (part.id === "q7b2") fullAnswers[part.id] = "speaking over a beat";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
assert.equal(marking.markPaper(paper, {}).score, 0, "A blank 2025 paper should score zero.");
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2025 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2025 paper tests passed.");
