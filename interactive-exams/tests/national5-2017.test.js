const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2017.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2017, "The 2017 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2017 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [7, 4, 6, 7, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The eight questions should total 40 marks.");
assert.equal(allParts.reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, allParts.length, "Every answer should have a unique identifier.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["2", "3", "4", "5", "6", "7", "8", "9"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)),
  [
    [6.4, 96.34, 156.04, 202.78, 248.36, 291.02],
    [98.8, 172.76, 247.3],
    [7.28, 94.2, 154.38, 215.42],
    [7.14, 50.8, 96.62, 143.12, 184.32, 241.2],
    [83.07, 187.11, 289.81],
    [54.92, 133.38],
    [5.96, 97.7],
    [42.62, 117.2, 191.82],
  ],
  "Every 2017 audio marker should retain its Whisper-calibrated spoken cue position.",
);
const officialAudioDurations = [335.9, 322.479, 368.779, 351.736, 396.597, 212.741, 189.428, 386.241];
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 29, "The complete 2017 paper should contain all twenty-nine expected audio markers.");
paper.questions.forEach((question, questionIndex) => {
  const clip = question.audio.clips[0];
  assert.equal(fs.existsSync(path.resolve(__dirname, "..", clip.file)), true, `${question.id} should reference an audio file that exists.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} audio markers should be chronological.`);
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < officialAudioDurations[questionIndex]), true, `${question.id} audio markers should remain within the measured official track duration.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should be available.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should be available.");
assert.equal(allParts.filter(part => !part.finalAnswerField).every(part => Boolean(part.definition)), true, "Every individual answer should provide concise pupil feedback.");

allParts.forEach(part => {
  if (part.type === "radio") {
    assert.equal(part.options.some(option => option.value === part.answer), true, `${part.id} should display its correct option.`);
    assert.equal(marking.markSubquestion(part, part.answer).marks, part.marks, `${part.id} should award its official mark.`);
    part.options.filter(option => option.value !== part.answer).forEach(option => {
      assert.equal(marking.markSubquestion(part, option.value).marks, 0, `${part.id} should reject ${option.value}.`);
    });
  }
  if (part.type === "checkbox") {
    assert.equal(part.answers.every(answer => part.options.some(option => option.value === answer)), true, `${part.id} should display every correct option.`);
    assert.equal(marking.markSubquestion(part, part.answers).marks, part.marks, `${part.id} should award all official marks for the complete correct selection.`);
  }
  (part.acceptedAnswers || []).forEach(answer => {
    assert.equal(marking.markSubquestion(part, answer).marks, part.marks, `${part.id} should accept ${answer}.`);
  });
});

assert.equal(marking.markSubquestion(parts.get("q1a"), ["Jig"]).marks, 1, "One correct Question 1(a) selection should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q1a"), ["Jig", "March"]).marks, 1, "A correct and an incorrect Question 1(a) selection should retain the earned mark.");
assert.equal(marking.markSubquestion(parts.get("q1b"), "I to V").marks, 1, "Question 1(b) should accept I to V.");
assert.equal(marking.markSubquestion(parts.get("q1d"), "walking").marks, 1, "Question 1(d) should accept walking.");

assert.equal(paper.questions.find(question => question.id === "q2").layout, "music-guide-vertical", "Question 2 should use the established vertical guide layout.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "two").marks, 1, "Question 2 should accept number words.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "2 / 4").marks, 1, "Question 2 should accept equivalent time-signature spacing.");
assert.equal(marking.markSubquestion(parts.get("q2a"), "3").marks, 0, "Question 2 should reject other beat counts.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "bowing").marks, 0, "Question 2 should reject bowing for arco.");
assert.equal(marking.markSubquestion(parts.get("q2c"), "Moderato").marks, 1, "Question 2 should accept Moderato.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "drums").marks, 0, "Question 2 should reject drums.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2017-q3", "Question 3 should use its own audited interactive guide score.");
assert.equal(questionThree.score.bars, 8, "Question 3 should contain all eight printed bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "G maj").marks, 1, "Question 3(a) should accept G maj.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "4/4").marks, 1, "Question 3(b) should accept 4/4.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "3/4").marks, 0, "Question 3(b) should reject 3/4.");
assert.deepEqual(parts.get("q3c").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(c) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "Andante").marks, 1, "Question 3(c) should accept Andante.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "Moderato").marks, 0, "Question 3(c) should reject Moderato because the official instructions do not accept it.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "dottedCrotchet,quaver").marks, 1, "Question 3(d) should accept the complete corrected rhythm.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "quaver,dottedCrotchet").marks, 0, "Question 3(d) should reject a reversed rhythm.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "F#").marks, 1, "Question 3(e) should accept F sharp.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "quaver").marks, 1, "Question 3(e) should accept quaver under the official guidance.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "B4,A4").marks, 1, "Question 3(f) should accept the complete B and A missing-note answer.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "A4,B4").marks, 0, "Question 3(f) should reject notes in the wrong order.");
assert.equal(parts.get("q3f").inlineNotationControls, true, "Question 3(f) should keep its Clear control beside the question text.");
assert.match(notationSource, /const N5_2017_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
[
  'bar([note("G4", "dottedCrotchet"), note("B4", "quaver"), note("D5", "dottedCrotchet"), note("G4", "quaver")])',
  'bar([note("F4", "dottedCrotchet"), note("B4", "quaver"), note("D5", "crotchet"), note("D5", "crotchet")], { rhythmCorrectionIndices: [2, 3] })',
  'bar([note("E5", "dottedCrotchet"), note("F5", "quaver"), note("G5", "dottedCrotchet"), note("E5", "quaver")])',
  'bar([note("D5", "dottedMinim"), note("B4", "quaver"), note("A4", "quaver")]',
  'bar([note("G4", "dottedCrotchet"), note("G4", "quaver"), note("G4", "crotchet"), note("B4", "quaver"), note("A4", "quaver")]',
  'bar([note("G4", "dottedCrotchet"), note("G4", "quaver"), note("G4", "crotchet"), note("A4", "quaver"), note("B4", "quaver")]',
  'bar([note("B4", "quaver"), note("A4", "crotchet"), note("G4", "quaver"), note("E4", "crotchet"), note("A4", "quaver"), note("B4", "quaver")]',
  'bar([note("B4", "quaver"), note("A4", "quaver", { tieToNext: true }), note("A4", "minim", { tiedFromPrevious: true })]',
].forEach(sourceBar => assert.equal(notationSource.includes(sourceBar), true, `Question 3 should retain ${sourceBar}.`));
assert.match(notationSource, /q3DrawNote\(svg, note\("D4", "quaver"\), q3BarStart\(0\) - 24, top\)/, "Question 3 should retain the printed D anacrusis.");
assert.match(notationSource, /const timeSignatureOffset = -24;/, "Question 3's time signature should align with its placement focus box.");
assert.doesNotMatch(notationSource, /barIndex === 7[\s\S]{0,300}q3-final-thick/, "Question 3 should finish with the source paper's single barline.");
assert.match(notationSource, /y: top - 51,[^\n]+height: 120,[^\n]+q3-marking-box/, "Question 3's missing-notes box should extend upward to clear the inserted notes.");
assert.match(notationSource, /q3Text\(svg, "Notes", \{[^\n]+y: top - 30/, "Question 3's Notes label should sit above the inserted notes.");
assert.match(notationSource, /const tempoY = q3SystemTop\(0\) - 34;/, "Question 3's tempo marking should sit clear of bar 1.");
assert.match(notationSource, /rhythm-glyph-muted[^\n]+quarterNoteStemUp[^\n]+rhythm-glyph-accent rhythm-glyph-dot[^\n]+augmentationDot/, "The dotted-crotchet tool should emphasise only the added dot.");
assert.match(notationSource, /rhythm-glyph-accent[^\n]+eighthNoteStemUp[^\n]+rhythm-glyph-muted[^\n]+quarterNoteStemUp/, "The quaver tool should emphasise only the added tail.");
assert.match(notationSource, /function q3Add2017RhythmEntryTargets[\s\S]+onAnswerChange\("q3d", nextValue\)/, "Question 3(d) should save rhythm additions placed directly on the score.");
assert.match(notationSource, /function q3Add2017RhythmEntryTargets[\s\S]+if \(!q3RhythmToolArmed\) return;[\s\S]+current\[order\] = q3RhythmToolArmed/, "Question 3(d) should require a rhythm tool to be selected before score placement.");
assert.match(notationSource, /q3Add2017RhythmEntryTargets\(svg, answers, onAnswerChange\)/, "Question 3 should render the direct rhythm-placement targets.");
assert.doesNotMatch(notationSource, /const isSequenceEntry = \["note-entry", "rhythm-entry"\]/, "Question 3(d) should not be answered by clicking two buttons in sequence.");
assert.match(notationSource, /q3Add2017NoteEntryTargets/, "Question 3(f) should provide direct missing-note entry on the score.");

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
global.document = {
  createElementNS: (_namespace, name) => new FakeSvgNode(name),
  createElement: name => new FakeSvgNode(name),
};
global.BRAVURA_SYMBOLS = new Proxy({}, { get: () => "x" });
global.SHARED_NOTATION_CONFIG = { symbols: {}, drawing: {}, stave: { lineGap: 14 } };
const notation = require("../exam-notation.js");
const notationWrap = new FakeSvgNode("div");
const notationContainer = { innerHTML: "", querySelector: () => notationWrap };
assert.doesNotThrow(() => notation.renderSharedScore(notationContainer, questionThree, {}, null, {}), "The complete 2017 score should render without a runtime error.");
assert.equal(notationWrap.children[0]?.attributes?.viewBox, "0 0 920 540", "The 2017 score should use the established four-system canvas.");
global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;
global.SHARED_NOTATION_CONFIG = previousConfig;

assert.equal(marking.markSubquestion(parts.get("q4c"), ["A cappella"]).marks, 1, "One correct Question 4(c) choice should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q4c"), ["A cappella", "Gospel"]).marks, 1, "A correct and incorrect Question 4(c) choice should retain the earned mark.");
assert.equal(marking.markSubquestion(parts.get("q4a"), "Bari-tone").marks, 1, "Question 4(a) should accept harmless hyphenation in Baritone.");

assert.equal(paper.questions.find(question => question.id === "q5").introTotalMarksIndex, 1, "Question 5's combined mark should sit beside the source instruction row.");
assert.equal(paper.questions.find(question => question.id === "q6").totalMarksOnLastPart, true, "Question 6's combined mark should sit beside its final sentence-completion row.");

assert.equal(marking.markSubquestion(parts.get("q7a2"), "Solo voice with strings.").marks, 1, "Question 7(a) should accept solo voice with strings.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Voice in an operatic style.").marks, 1, "Question 7(a) should accept voice in an operatic style.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Orchestra").marks, 0, "Question 7(a) should reject orchestra alone.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "The melody is syncopated.").marks, 1, "Question 7(b) should accept syncopation on its own.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Piano and vamp.").marks, 1, "Question 7(b) should accept piano and vamp together.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Piano").marks, 0, "Question 7(b) should reject piano alone.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Vamp").marks, 0, "Question 7(b) should reject vamp alone.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "key change" }).marks, 0, "Question 8 should reject key change for modulation.");
assert.equal(marking.markSubquestion(questionEight, { final: "flute" }).marks, 0, "Question 8 should reject singular flute.");
assert.equal(marking.markSubquestion(questionEight, { final: "violin" }).marks, 0, "Question 8 should reject singular violin.");
assert.equal(marking.markSubquestion(questionEight, { final: "guitar" }).marks, 0, "Question 8 should reject guitar alone.");
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud and quiet" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
const repeatedOnce = marking.markSubquestion(questionEight, { final: "Repetition, 4/4, major, sequence, flutes and crescendo." });
assert.equal(repeatedOnce.marks, 5, "Question 8 should retain its overall five-mark limit.");
assert.equal(Object.values(repeatedOnce.matchedConcepts).flat().filter(label => label === "Repetition").length, 1, "Repetition should only be credited once across headings.");
const cappedQuestionEightResult = marking.markSubquestion(questionEight, { final: "4/4, syncopation, allegro, major, sequence, trills, flutes and crescendo." });
assert.equal(cappedQuestionEightResult.marks, 5, "Question 8 should retain its overall five-mark limit.");
assert.equal(Object.values(cappedQuestionEightResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts which earned the five available marks.");
assert.equal(cappedQuestionEightResult.matchedConcepts.rhythm.length, 2, "Question 8 should retain the two-mark heading limit.");
assert.equal(marking.markSubquestion(questionEight, { final: "4/4, syncopation, major, sequence and trills." }).marks, 4, "Five valid concepts across only two headings should be capped below full marks.");
assert.equal(marking.markSubquestion(questionEight, { final: "4/4, syncopation, major, flutes and crescendo." }).marks, 5, "Five valid concepts across at least three headings should earn full marks.");

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "4/4, syncopation, major, flutes and crescendo." };
  else if (part.id === "q7a2") fullAnswers[part.id] = "Solo voice with orchestra.";
  else if (part.id === "q7b2") fullAnswers[part.id] = "Syncopation.";
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2017 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete 2017 paper should be marked automatically.");

console.log("National 5 Music 2017 paper tests passed.");
