const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const marking = require("../exam-marking.js");
const paper = require("../papers/national5-2015.js");
const registry = require("../paper-registry.js");
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");
const stylesSource = fs.readFileSync(path.resolve(__dirname, "..", "styles.css"), "utf8");

const parts = new Map(
  paper.questions.flatMap(question => question.subquestions.map(part => [part.id, part])),
);

assert.equal(registry[paper.id].year, 2015, "The 2015 paper should be available through the shared paper registry.");
assert.equal(paper.questions.length, 8, "The 2015 paper should contain eight questions.");
assert.equal(paper.questions.reduce((sum, question) => sum + question.marks, 0), 40, "The eight questions should total 40 marks.");
assert.equal(paper.questions.flatMap(question => question.subquestions).reduce((sum, part) => sum + part.marks, 0), 40, "The individual parts should total 40 marks.");
assert.equal(new Set(parts.keys()).size, paper.questions.flatMap(question => question.subquestions).length, "Every answer should have a unique identifier.");
assert.deepEqual(paper.questions.map(question => question.marks), [6, 4, 6, 8, 4, 3, 4, 5], "Each question should retain its official mark allocation.");
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].file.match(/Track (\d+)/)[1]),
  ["2", "3", "4", "5", "6", "7", "8", "9"],
  "Questions 1 to 8 should use official Tracks 2 to 9.",
);
assert.deepEqual(
  paper.questions.map(question => question.audio.clips[0].markers.map(marker => marker.time)),
  [
    [6.54, 50.32, 93.56, 149.76, 221.68, 257.9],
    [99.46, 178.94, 259],
    [13.94, 66.7, 130.66, 194.48],
    [5.74, 42.96, 79.52, 142.6, 198.06, 288.88, 338.86],
    [85.38, 139.7, 194.32],
    [57.8, 155.92],
    [6.28, 85.72],
    [46.86, 119.22, 192.1],
  ],
  "Every 2015 audio marker should retain its calibrated official cue position.",
);
const officialAudioDurations = [312.268, 338.651, 350.537, 384.496, 250.958, 255.608, 173.61, 385.28];
assert.equal(paper.questions.flatMap(question => question.audio.clips[0].markers).length, 30, "The complete 2015 paper should retain all thirty audio markers.");
paper.questions.forEach((question, questionIndex) => {
  const clip = question.audio.clips[0];
  const clipPath = path.resolve(__dirname, "..", clip.file);
  assert.equal(fs.existsSync(clipPath), true, `${question.id} should reference an audio file that exists.`);
  assert.deepEqual(clip.markers.map(marker => marker.time), [...clip.markers.map(marker => marker.time)].sort((a, b) => a - b), `${question.id} audio markers should be in chronological order.`);
  assert.equal(clip.markers.every(marker => marker.time >= 0 && marker.time < officialAudioDurations[questionIndex]), true, `${question.id} audio markers should remain within the measured official track duration.`);
});
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.sourcePath)), true, "The official question paper should be available.");
assert.equal(fs.existsSync(path.resolve(__dirname, "..", paper.markingInstructionsPath)), true, "The official marking instructions should be available.");
assert.equal(
  paper.questions.flatMap(question => question.subquestions).filter(part => !part.finalAnswerField).every(part => Boolean(part.definition)),
  true,
  "Every individual answer should provide concise pupil feedback.",
);
paper.questions.flatMap(question => question.subquestions).forEach(part => {
  if (part.type === "radio") {
    assert.equal(part.options.some(option => option.value === part.answer), true, `${part.id} should include its correct answer among the visible options.`);
    assert.equal(marking.markSubquestion(part, part.answer).marks, part.marks, `${part.id} should award its full official mark.`);
    part.options.filter(option => option.value !== part.answer).forEach(option => {
      assert.equal(marking.markSubquestion(part, option.value).marks, 0, `${part.id} should reject the incorrect option ${option.value}.`);
    });
  }
  if (part.type === "checkbox") {
    assert.equal(part.answers.every(answer => part.options.some(option => option.value === answer)), true, `${part.id} should include every correct answer among the visible options.`);
    assert.equal(marking.markSubquestion(part, part.answers).marks, part.marks, `${part.id} should award all of its official marks for the complete correct selection.`);
  }
  (part.acceptedAnswers || []).forEach(answer => {
    assert.equal(marking.markSubquestion(part, answer).marks, part.marks, `${part.id} should accept the declared official answer or spelling ${answer}.`);
  });
});

const questionThree = paper.questions.find(question => question.id === "q3");
assert.equal(questionThree.score.sharedNotation, "n5-2015-q3", "Question 3 should use the 2015 interactive guide score.");
assert.match(notationSource, /N5_2015_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING \+ 20/, "Question 3 should add twenty pixels between each notation system.");
assert.match(notationSource, /systemIndex >= 3 \? 30 : 0/, "Question 3 should add a further thirty pixels between systems 3 and 4.");
assert.match(notationSource, /q3ScoreSvg2015[\s\S]*?viewBox: "0 0 920 630"/, "The taller 2015 guide score should retain all four spaced notation systems.");
assert.match(notationSource, /N5_2015_Q3_BAR_5_NOTES[\s\S]*?note\("A4", "semiquaver"\)[\s\S]*?note\("A4", "dottedQuaver"\)[\s\S]*?note\("A4", "semiquaver"\)[\s\S]*?note\("A4", "dottedQuaver"\)[\s\S]*?note\("G4", "semiquaver"\)[\s\S]*?note\("A4", "semiquaver"\)[\s\S]*?note\("Bb4", "dottedQuaver"\)/, "Bar 5 should retain the corrected A, A, A, A, G, A, B flat pitch inventory.");
assert.match(notationSource, /N5_2015_Q3_BAR_7_NOTES = N5_2015_Q3_BAR_5_NOTES\.map\(\(item, index\) => index >= 6 \? \{ \.\.\.item, rhythm: "quaver" \} : item\)/, "Bar 7 should retain Bar 5's pitches while changing its final two notes to quavers.");
assert.match(notationSource, /bar\(\[note\("C5", "semibreve"\)\]\)/, "Bar 6 should contain a C semibreve.");
assert.match(notationSource, /const guideTop = top - 59/, "Bar 7's rhythm guide should sit thirty pixels lower.");
assert.match(notationSource, /note\("A4", "dottedQuaver"\), note\("A4", "semiquaver"\), note\("A4", "quaver"\), note\("A4", "quaver"\)/, "Bar 7's guide rhythm pairs should share the same vertical note level.");
assert.match(notationSource, /y: missingTop - 72,[\s\S]*?height: 166/, "Bar 7's marking box should extend ten pixels upward while retaining its bottom edge.");
assert.match(notationSource, /q3YForStep\(item\.notes\.at\(-1\)\.step, top\) - 41/, "Question 3(e)'s X label should sit seven pixels higher.");
assert.match(notationSource, /\[null, "I", "dreamed", "a", "dream", "in", "time", "gone"\]/, "Question 3's opening lyric should map each word to its individual note.");
assert.match(notationSource, /\["li-", "ving\.", null\][\s\S]*?\["giv-", "ing\.", null\]/, "Question 3's split syllables should align with their notes without repeating text on tied continuations.");
assert.match(notationSource, /x: positions\[noteIndex\]/, "Question 3 should position each lyric syllable beneath its corresponding note.");
assert.deepEqual(questionThree.subquestions.map(part => part.marks), [1, 1, 1, 1, 1, 1]);
assert.equal(marking.markSubquestion(parts.get("q3a"), "common time").marks, 1, "Question 3(a) should accept common time.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Moderato").marks, 1, "Question 3(b) should accept Moderato.");
assert.equal(marking.markSubquestion(parts.get("q3b"), "Adagio").marks, 1, "Question 3(b) should accept Adagio.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "B flat").marks, 1, "Question 3(e) should accept B flat.");
assert.equal(marking.markSubquestion(parts.get("q3e"), "B").marks, 0, "Question 3(e) should reject B natural.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "A4,G4,A4,Bb4").marks, 1, "Question 3(f) should mark the complete missing-note answer.");
assert.equal(marking.markSubquestion(parts.get("q3f"), "A4,A4,Bb4,C5").marks, 0, "Question 3(f) should reject the superseded missing-note answer.");

const questionFive = paper.questions.find(question => question.id === "q5");
const questionSix = paper.questions.find(question => question.id === "q6");
const questionEightData = paper.questions.find(question => question.id === "q8");
assert.equal(questionFive.introTotalMarksIndex, 1, "Question 5's combined mark should sit beside the source instruction row.");
assert.equal(questionSix.totalMarksOnLastPart, true, "Question 6's combined mark should sit beside its final sentence-completion row.");
assert.match(stylesSource, /\.question-q6 \[data-subquestion="q6c"\] \.subquestion-heading \{ display: grid; grid-template-columns: minmax\(0, 1fr\) auto;/, "Question 6's combined mark should sit at the right of the final printed sentence row.");
assert.match(stylesSource, /\.question-q6 \[data-subquestion="q6c"\] \.subquestion-heading-marks \{ align-self: end; \}/, "Question 6's combined mark should align with the final answer-line row.");
assert.equal(questionEightData.introTotalMarks, 5, "Question 8's mark should appear beside the third-playback instruction.");
assert.equal(questionEightData.intro[questionEightData.introTotalMarksIndex], "Here is the music for the third time.", "Question 8's mark row should remain the third-playback instruction.");
assert.equal(parts.get("q8a").finalAnswerMarks, undefined, "Question 8 should not repeat its mark beside the ruled final-answer area.");

assert.equal(marking.markSubquestion(parts.get("q2b"), "Trumpets").marks, 1, "Question 2 should accept the named muted instrument.");
assert.equal(marking.markSubquestion(parts.get("q2b"), "Brass").marks, 0, "Question 2 should not accept a family name where the marking scheme requires trumpet.");
assert.ok(["pitsicato", "pitzicato", "pitsickato"].every(answer => marking.markSubquestion(parts.get("q2c"), answer).marks === 1), "Question 2 should accept the requested clear pizzicato misspellings.");

assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria"]).marks, 1, "One correct choice in Question 4(f) should earn one mark.");
assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria", "Scat singing"]).marks, 1, "A correct and an incorrect choice in Question 4(f) should still earn the correct mark.");
assert.equal(marking.markSubquestion(parts.get("q4f"), ["Aria", "Scat singing"]).status, "partial", "One of two marks should display as partially correct.");
assert.equal(marking.markSubquestion(parts.get("q4g"), "Mezzo-soprano").marks, 1, "Question 4(g) should accept the official alternative voice.");
assert.equal(parts.get("q4g").answerDisplay, "Soprano (or Mezzo-soprano)", "Question 4(g) feedback should name both officially accepted voices.");
assert.match(parts.get("q4g").definition, /Soprano and mezzo-soprano are both accepted here/, "Question 4(g) feedback should explain why either voice receives the mark.");

assert.equal(marking.markSubquestion(parts.get("q6a"), "four").marks, 1, "Question 6 should accept a beat number written as a word.");
assert.equal(marking.markSubquestion(parts.get("q6a"), "three").marks, 0, "Question 6 should reject an incorrect beat count.");

assert.equal(marking.markSubquestion(parts.get("q7a2"), "The full orchestra performs the music.").marks, 1, "Question 7(a) should accept natural wording containing the official reason.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "A solo instrument plays with the orchestra.").marks, 0, "Question 7(a) should reject the concerto description excluded by the scheme.");
assert.equal(marking.markSubquestion(parts.get("q7a2"), "There is no solo instrument, only the full orchestra.").marks, 1, "Question 7(a) should not misread a negated solo instrument as a concerto description.");
assert.equal(marking.markSubquestion(parts.get("q7b2"), "I can hear tabla drums.").marks, 1, "Question 7(b) should accept a natural sentence containing an official instrument.");

const questionEight = parts.get("q8a");
questionEight.headings.forEach(heading => heading.concepts.forEach(concept => concept.answers.forEach(answer => {
  assert.equal(marking.markSubquestion(questionEight, { final: answer }).marks, 1, `Question 8 should award one mark for the declared ${concept.label} answer ${answer}.`);
})));
assert.equal(marking.markSubquestion(questionEight, { final: "3 beats in the bar." }).marks, 0, "Question 8 should reject an incorrect beat count.");
assert.equal(marking.markSubquestion(questionEight, { final: "beats in the bar." }).marks, 0, "Question 8 should require the accepted beat count.");
assert.equal(marking.markSubquestion(questionEight, { final: "4 beats per bar." }).marks, 1, "Question 8 should accept the complete correct metre concept.");
assert.equal(marking.markSubquestion(questionEight, { final: "violin" }).marks, 0, "Question 8 should require violins in the plural.");
assert.equal(marking.markSubquestion(questionEight, { final: "violins" }).marks, 1, "Question 8 should accept violins in the plural.");
assert.equal(marking.markSubquestion(questionEight, { final: "loud then quiet" }).marks, 0, "Question 8 should not replace Italian dynamics with English equivalents.");
const cappedQuestionEightResult = marking.markSubquestion(questionEight, { final: "4 beats, repetition, major, modulation, perfect cadence, cymbals, flutes and mf." });
assert.equal(cappedQuestionEightResult.marks, 5, "Question 8 should retain its overall five-mark limit.");
assert.equal(Object.values(cappedQuestionEightResult.matchedConcepts).flat().length, 5, "Question 8 should highlight only the five concepts which earned marks.");
assert.equal(Object.values(cappedQuestionEightResult.matchedEvidence).flat().length, 5, "Question 8 should highlight only five awarded phrases in the pupil's final answer.");
assert.equal(cappedQuestionEightResult.matchedConcepts.melody.includes("Perfect cadence"), false, "A third valid concept under one heading should remain unhighlighted after that heading's two marks are awarded.");
assert.equal(marking.markSubquestion(questionEight, { final: "The rhythm repeats and the melody uses repetition." }).marks, 1, "Repetition should earn only one mark when repeated under different headings.");
assert.equal(
  marking.markSubquestion(questionEight, { final: "Allegro, 4 beats in the bar, major, minor and a perfect cadence." }).marks,
  4,
  "Five valid concepts across only two headings should be capped below full marks.",
);
assert.equal(
  marking.markSubquestion(questionEight, { final: "Allegro, 4 beats in the bar, major, flute and crescendo." }).marks,
  5,
  "Five valid concepts across at least three headings should earn full marks.",
);

const fullAnswers = {};
paper.questions.forEach(question => question.subquestions.forEach(part => {
  if (part.id === "q8a") {
    fullAnswers[part.id] = { final: "Allegro, 4 beats in the bar, major, flute and crescendo." };
  } else if (part.type === "checkbox") {
    fullAnswers[part.id] = [...part.answers];
  } else {
    fullAnswers[part.id] = part.answer ?? part.acceptedAnswers?.[0];
  }
}));

const completeResult = marking.markPaper(paper, fullAnswers);
assert.equal(completeResult.score, 40, "A fully correct 2015 paper should score 40 out of 40.");
assert.equal(completeResult.reviewMarks, 0, "The complete 2015 paper should be marked automatically.");

console.log("National 5 Music 2015 paper tests passed.");
