const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2016.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

const allParts = paper.questions.flatMap(question => question.subquestions);
const parts = new Map(allParts.map(part => [part.id, part]));

assert.equal(registry[paper.id].year, 2016, "The 2016 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2016 paper should contain eight questions.");
assert.deepEqual(paper.questions.map(question => question.marks), [6, 4, 6, 8, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
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
    [6.86, 52.02, 98.16, 142.54, 188.44, 234.64],
    [100.12, 169.02, 238.72],
    [15.28, 127.98, 192.68, 257.6],
    [8.18, 48.7, 104.86, 146.3, 197.22, 245.34, 326.32],
    [84.8, 148.68, 200.14],
    [57.12, 124.12],
    [6.7, 90.4],
    [47, 107.28, 167],
  ],
  "Every 2016 audio marker should retain its Whisper-calibrated spoken cue position.",
);
const officialAudioDurations = [278.965, 307.572, 414.523, 364.925, 279.337, 191.426, 173.732, 348.671];
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 30, "The complete 2016 paper should contain all thirty expected audio markers.");
paper.questions.forEach((question, questionIndex) => {
  const clip = question.audio.clips[0];
  const clipPath = path.resolve(__dirname, "..", clip.file);
  assert.equal(fs.existsSync(clipPath), true, `${question.id} should reference an audio file that exists.`);
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

const questionTwo = paper.questions.find(question => question.id === "q2");
assert.equal(questionTwo.layout, "music-guide-vertical", "Question 2 should use the established vertical guide layout.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "dotted rhythms").marks, 1, "Question 2 should accept dotted rhythm.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "swung").marks, 1, "Question 2 should accept swung.");
assert.equal(marking.markSubquestion(parts.get("q2c"), "2/4").marks, 1, "Question 2 should accept 2/4.");
assert.equal(marking.markSubquestion(parts.get("q2c"), "common time").marks, 1, "Question 2 should accept common time.");
assert.equal(marking.markSubquestion(parts.get("q2c"), "2 beats").marks, 0, "Question 2 should reject the explicitly excluded answer 2 beats.");
assert.equal(marking.markSubquestion(parts.get("q2d"), "slide").marks, 0, "Question 2 should reject an English equivalent for glissando.");

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2016-q3", "Question 3 should use its own audited interactive guide score.");
assert.equal(questionThree.score.bars, 16, "Question 3 should contain all sixteen printed bars.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "3/4").marks, 1, "Question 3(a) should accept 3/4.");
assert.equal(marking.markSubquestion(parts.get("q3a"), "4/4").marks, 0, "Question 3(a) should reject 4/4.");
assert.deepEqual(parts.get("q3b").options.map(option => option.label), ["Adagio", "Andante", "Moderato", "Allegro"], "Question 3(b) should show the shared four tempo options.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Andante").marks, 1, "Question 3(b) should accept Andante.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Adagio").marks, 0, "Question 3(b) should reject Adagio.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "bar-9").marks, 1, "Question 3(c) should place V above bar 9.");
assert.equal(marking.markSubquestion(parts.get("q3c"), "bar-8").marks, 0, "Question 3(c) should reject another bar.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "whole tone").marks, 1, "Question 3(d) should accept whole tone.");
assert.equal(marking.markSubquestion(parts.get("q3d"), "2nd").marks, 1, "Question 3(d) should accept 2nd.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "f").marks, 1, "Question 3(e) should accept lower-case F.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "E5,D5,C5").marks, 1, "Question 3(f) should accept the complete E, D, C missing-note answer.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "E5,C5,D5").marks, 0, "Question 3(f) should reject notes in the wrong order.");
assert.match(notationSource, /const N5_2016_Q3_BARS = \[/, "Question 3 should keep its musical content as structured data.");
[
  'bar([note("C5", "dottedMinim")])',
  'bar([note("G5", "crotchet"), note("F5", "minim")])',
  'bar([note("E5", "dottedCrotchet"), note("D5", "quaver"), note("C5", "quaver"), note("Bb4", "quaver")]',
  'bar([note("C5", "minim"), note("F4", "crotchet")])',
  'bar([note("G4", "dottedMinim", { tieToNextBar: true })])',
  'bar([note("G4", "minim", { tiedFromPreviousBar: true }), note("A4", "crotchet")])',
  'bar([note("F4", "dottedMinim")])',
  'bar([note("C5", "crotchet"), note("A4", "dottedCrotchet"), note("G4", "quaver")])',
  'bar([note("F4", "crotchet"), note("A4", "crotchet"), note("C5", "crotchet")])',
  'bar([note("F5", "crotchet"), note("E5", "dottedCrotchet"), note("D5", "quaver")])',
  'bar([note("E5", "crotchet"), note("D5", "dottedCrotchet"), note("C5", "quaver")]',
  'bar([note("D5", "dottedMinim")])',
].forEach(sourceBar => assert.equal(notationSource.includes(sourceBar), true, `Question 3 should retain ${sourceBar}.`));
assert.match(notationSource, /bar\(\[note\("C5", "dottedMinim"\)\]\)/, "Bar 1 should contain C as a dotted minim.");
assert.match(notationSource, /bar\(\[note\("F4", "crotchet"\), note\("A4", "crotchet"\), note\("C5", "crotchet"\)\]\)/, "Bar 13 should contain the F major chord notes F, A and C.");
assert.match(notationSource, /bar\(\[note\("E5", "crotchet"\), note\("D5", "dottedCrotchet"\), note\("C5", "quaver"\)\], \{ missingIndices: \[0, 1, 2\] \}\)/, "Bar 15 should retain the official missing pitches and rhythms.");
assert.match(notationSource, /N5_2016_Q3_LYRICS[\s\S]*?\["Moon"\][\s\S]*?\["go-", "ing", "your"\][\s\S]*?\["way\."\]/, "Every lyric syllable should remain mapped to its note.");
assert.match(notationSource, /if \(barIndex === 4\) \{[\s\S]*?bracketY = top - 39;[\s\S]*?bracketWidth = \(positions\[3\] \+ 10 - \(positions\[2\] - 2\)\) \* \.85;/, "The bar 5 interval bracket should be narrower and raised above the final two quavers.");
assert.match(notationSource, /q3Add2016BarLabelTargets/, "Question 3(c) should provide score placement targets for V.");
assert.match(notationSource, /q3Add2016NoteEntryTargets/, "Question 3(f) should provide direct missing-note entry on the score.");

assert.equal(marking.markSubquestion(parts.get("q4b"), ["Bass"]).marks, 1, "One correct Question 4(b) choice should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q4b"), ["Bass", "Melismatic"]).marks, 1, "A correct and an incorrect Question 4(b) choice should retain the earned mark.");
assert.equal(marking.markSubquestion(parts.get("q4b"), ["Bass", "Melismatic"]).status, "partial", "One of two marks should display as partially correct.");
assert.equal(marking.markSubquestion(parts.get("q4d"), "Bothy ballad music").marks, 1, "Question 4(d) should accept the style followed by music.");

assert.equal(paper.questions.find(question => question.id === "q5").introTotalMarksIndex, 1, "Question 5's combined mark should sit beside the source instruction row.");
assert.equal(paper.questions.find(question => question.id === "q6").totalMarksOnLastPart, true, "Question 6's combined mark should sit beside its final sentence-completion row.");

assert.equal(marking.markSubquestion(parts.get("q7a2"), "The beat divides into three.").marks, 1, "Question 7(a) should accept the beat division explanation.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "Triplets").marks, 0, "Question 7(a) should reject triplets as instructed by the official scheme.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "There are cross rhythms.").marks, 1, "Question 7(b) should accept a natural sentence containing cross rhythms.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "Trumpet").marks, 0, "Question 7(b) should reject an individual instrument.");

const questionEightData = paper.questions.find(question => question.id === "q8");
const questionEight = parts.get("q8a");
assert.equal(questionEightData.introTotalMarks, 5, "Question 8's combined mark should appear beside the playback instructions.");
assert.equal(questionEightData.intro[questionEightData.introTotalMarksIndex], "Here is the music for the third time.", "Question 8's combined mark should align with the third-playback sentence.");
assert.equal(questionEight.finalAnswerMarks, undefined, "Question 8 should not repeat its mark beside the ruled final-answer area.");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "fills" }).marks, 0, "Question 8 should reject fills without drum.");
assert.equal(marking.markSubquestion(questionEight, { final: "pipes" }).marks, 0, "Question 8 should reject pipes without bag.");
assert.equal(marking.markSubquestion(questionEight, { final: "drums" }).marks, 0, "Question 8 should reject drums instead of drumkit.");
assert.equal(marking.markSubquestion(questionEight, { final: "acoustic guitar" }).marks, 0, "Question 8 should reject acoustic guitar.");
assert.equal(marking.markSubquestion(questionEight, { final: "bass guitar" }).marks, 0, "Question 8 should reject bass guitar.");
assert.equal(marking.markSubquestion(questionEight, { final: "guitar" }).marks, 0, "Question 8 should reject guitar alone.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud and quiet" }).marks, 0, "Question 8 should reject English dynamic equivalents.");
const cappedQuestionEightResult = marking.markSubquestion(questionEight, { final: "4/4, drum fills, anacrusis, major, grace notes, perfect cadence, bagpipes and crescendo." });
assert.equal(cappedQuestionEightResult.marks, 5, "Question 8 should retain its overall five-mark limit.");
assert.equal(Object.values(cappedQuestionEightResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only concepts which earned the five available marks.");
assert.equal(cappedQuestionEightResult.matchedConcepts.rhythm.length, 2, "Question 8 should retain the two-mark heading limit.");
assert.equal(
  marking.markSubquestion(questionEight, { final: "4/4, drum fills, major, grace notes and perfect cadence." }).marks,
  4,
  "Five valid concepts across only two headings should be capped below full marks.",
);
assert.equal(
  marking.markSubquestion(questionEight, { final: "4/4, drum fills, major, bagpipes and crescendo." }).marks,
  5,
  "Five valid concepts across at least three headings should earn full marks.",
);

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") fullAnswers[part.id] = { final: "4/4, drum fills, major, bagpipes and crescendo." };
  else if (part.type === "checkbox") fullAnswers[part.id] = [...part.answers];
  else fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
}));
const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2016 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete 2016 paper should be marked automatically.");

console.log("National 5 Music 2016 paper tests passed.");
