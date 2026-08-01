const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2024.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2024, "The 2024 paper should be available through the shared registry.");
assert.equal(paper.questions.length, 8, "The 2024 paper should contain eight questions.");
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
  [5.54, 51.86, 114.24, 164, 210.64, 310.68],
  [95.82, 183.32, 270.7],
  [7.44, 114.56, 169.68, 225.4],
  [5.98, 74.96, 115.76, 160.4, 264.02, 302.12],
  [81.66, 171.34, 261],
  [43.88, 119.98],
  [5.66, 93.2],
  [40.78, 132.68, 223.96],
];
const officialAudioDurations = [382.458776, 359.653878, 371.722449, 374.230204, 360.803265, 191.503673, 187.08898, 432.300408];
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

assert.equal(marking.markSubquestion(parts.get("q1b"), "muted trumpet").marks, 1, "Question 1(b) should accept muted trumpet.");
assert.equal(marking.markSubquestion(parts.get("q1c"), "walking").marks, 1, "Question 1(c) should accept walking on its own.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "mezzo-soprano").marks, 1, "Question 2 should accept the official alternative voice type.");
assert.equal(marking.markSubquestion(parts.get("q2c"), "rit.").marks, 1, "Question 2 should accept the official abbreviated tempo term.");
assert.equal(marking.markSubquestion(parts.get("q4a"), ["Vamp"]).marks, 1, "One correct Question 4(a) selection should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q6b"), "four").marks, 1, "Question 6 should accept a number word.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2024-q3", "Question 3 should use its own audited interactive score.");
assert.equal(questionThree.score.bars, 8, "Question 3 should retain all eight numbered bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.deepEqual(parts.get("q3a").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(a) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3a"), "Moderato").marks, 1, "Question 3(a) should accept Moderato under the additional guidance.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "common time").marks, 1, "Question 3(b) should accept common time.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "A").marks, 0, "Question 3(c) should not accept A without minor or chord I.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "E5,D5").marks, 1, "Question 3(d) should require E followed by D.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "D5,E5").marks, 0, "Question 3(d) should reject the notes in the wrong order.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "minim").marks, 1, "Question 3(e) should accept the official rhythm answer.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "piano").marks, 1, "Question 3(f) should accept the remaining quiet dynamic option.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "mf").marks, 0, "Question 3(f) should reject mezzo forte.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "sfz").marks, 0, "Question 3(f) should reject sfz.");
assert.match(notationSource, /const N5_2024_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
assert.match(notationSource, /viewBox: "0 0 920 600"/, "Question 3 score should leave room for dynamics below the final system.");
assert.match(notationSource, /N5_2024_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING \+ 15/, "Question 3 systems should have 15px additional spacing.");
assert.match(notationSource, /const timeX = Q3_STAFF\.left \+ 103/, "Question 3 time signature should be moved 15px right.");
assert.match(notationSource, /const tempoY = q3SystemTop2024\(0\) - 48/, "Question 3 tempo marking should be moved 20px up.");
assert.match(notationSource, /q3Text\(svg, "Notes"[\s\S]+const guideTop = top - 42[\s\S]+scale\(\.5\)/, "Question 3 Notes guide rhythm should be 50% smaller and 25px lower.");
const expectedQuestionThreeBars = [
  'bar([note("A4", "quaver"), note("C5", "quaver"), note("E5", "crotchet", { tieToNext: true }), note("E5", "quaver"), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver")]',
  'bar([note("D5", "minim", { tieToNext: true }), note("D5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("Bb4", "quaver", { accidental: "flat", accidentalXOffset: -4 })]',
  'bar([note("A4", "quaver"), note("D5", "quaver"), note("F5", "crotchet", { tieToNext: true }), note("F5", "quaver"), note("F5", "quaver"), note("E5", "quaver"), note("D5", "quaver")], { missingIndices: [5, 6]',
  'bar([note("E5", "semibreve")])',
  'bar([note("C5", "quaver"), note("F5", "quaver"), note("A5", "crotchet", { tieToNext: true }), note("A5", "quaver"), note("A5", "quaver"), note("G5", "quaver"), note("F5", "quaver")]',
  'bar([note("G5", "dottedCrotchet"), note("F5", "quaver"), note("E5", "minim")])',
  'bar([note("G4", "quaver", { accidental: "sharp", accidentalXOffset: -4 }), note("B4", "quaver"), note("E5", "crotchet", { tieToNext: true }), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("B4", "quaver")]',
  'bar([note("A4", "semibreve")])',
];
expectedQuestionThreeBars.forEach((barSource, barIndex) => {
  assert.equal(notationSource.includes(barSource), true, `Question 3 bar ${barIndex + 1} should retain its source-verified pitches and rhythms.`);
});
assert.match(notationSource, /function q3Add2024NoteEntryTargets[\s\S]+onAnswerChange\("q3d", value\)/, "Question 3(d) should save notes placed directly on bar 3.");
assert.match(notationSource, /q3CalibratedSymbol\(svg, "mezzoForte", printedDynamicX/, "Question 3 should retain the printed mezzo-forte marking.");
assert.match(notationSource, /sforzato/, "Question 3 should render the sfz dynamic option with the Bravura symbol.");
assert.match(notationSource, /class: "q3-hairpin"/, "Question 3 should retain the diminuendo in bar 7.");

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
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2024 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 600", "The 2024 score should use its expanded canvas for dynamics below the final system.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q7a2"), "Scottish song").marks, 1, "Question 7(a) should accept two official features.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "storytelling with accompaniment").marks, 1, "Question 7(a) should accept a different valid feature pair.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "song about farming").marks, 0, "Question 7(a) should reject farming evidence.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Gaelic song").marks, 0, "Question 7(a) should reject Gaelic evidence.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "solo voice and orchestra").marks, 1, "Question 7(b) should accept the official aria evidence.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "voices and orchestra").marks, 0, "Question 7(b) should require a singular voice.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  if ((concept.alwaysBlockedAnswers || []).includes(answer)) return;
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "bass" }).marks, 0, "Question 8 should reject bass on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "double bass" }).marks, 1, "Question 8 should accept double bass.");
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums on its own.");
assert.equal(marking.markSubquestion(questionEight, { final: "drum kit" }).marks, 1, "Question 8 should accept drum kit.");
assert.equal(marking.markSubquestion(questionEight, { final: "fills" }).marks, 0, "Question 8 should reject fills without drum.");
assert.equal(marking.markSubquestion(questionEight, { final: "drum fills" }).marks, 1, "Question 8 should accept drum fills.");
assert.equal(marking.markSubquestion(questionEight, { final: "Moderato" }).marks, 0, "Question 8 should reject Moderato.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
assert.equal(marking.markSubquestion(questionEight, { final: "Repetition" }).marks, 1, "Question 8 should award repetition only once across headings.");
const cappedResult = marking.markSubquestion(questionEight, { final: "Major, sequence, accents, drum fills, piano and crescendo." });
assert.equal(cappedResult.marks, 5, "Question 8 should cap the total at five marks.");
assert.equal(Object.values(cappedResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts that earned marks.");
assert.equal(cappedResult.matchedConcepts.melody.length, 2, "Question 8 should retain the two-mark heading cap.");
assert.equal(marking.markSubquestion(questionEight, { final: "Major, sequence, perfect cadence, accents and syncopation." }).marks, 4, "Five concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "Major, sequence, accents, drum fills and piano." }).marks, 5, "Five concepts across three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "Major, sequence, accents, drum fills and piano." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "Scottish song";
  else if (part.id === "q7b2") fullAnswers[part.id] = "solo voice and orchestra";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
assert.equal(marking.markPaper(paper, {}).score, 0, "A blank 2024 paper should score zero.");
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2024 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete paper should be marked automatically.");

console.log("National 5 Music 2024 paper tests passed.");
