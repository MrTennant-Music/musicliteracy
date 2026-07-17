const assert = require("node:assert/strict");
const core = require("./concept-recall-core.js");
const data = require("./concept-recall-data.js");

assert.equal(data.QUESTIONS.length, 122, "The pupil question set should contain 122 complete questions");
assert.equal(data.INCOMPLETE_QUESTIONS.length, 7, "All seven teacher placeholders should remain available");
assert.equal(core.completeQuestions([...data.QUESTIONS, ...data.INCOMPLETE_QUESTIONS]).length, 122, "Incomplete placeholders must never enter the pupil question set");
assert.deepEqual(Object.fromEntries(Object.keys(core.LEVELS).map((level) => [level, core.questionsForLevel(data.QUESTIONS, level).length])), { N3: 7, N4: 16, N5: 63, H: 69, AH: 88 }, "Each playable level should include its own complete optional SQA Styles list");
assert.deepEqual(
  Object.fromEntries(["N5", "H", "AH"].map((level) => [level, core.questionsForLevel(data.QUESTIONS, level).filter((question) => question.category.endsWith("Styles")).length])),
  { N5: 12, H: 12, AH: 14 },
  "National 5, Higher and Advanced Higher should contain the complete official style lists",
);
assert.equal(core.questionsForLevel(data.QUESTIONS, "H").some((question) => question.category === "National 5 Styles"), false, "Higher should not show the National 5 Styles list");
assert.equal(core.questionsForLevel(data.QUESTIONS, "AH").some((question) => question.category === "Higher Styles"), false, "Advanced Higher should not show the Higher Styles list");

assert.equal(core.normalizeAnswer("  PERFECT   CADENCE  "), "perfect cadence");
assert.equal(core.normalizeAnswer("whole–tone, scale!"), "whole tone scale");
assert.equal(core.normalizeAnswer("G♯"), "g sharp");
assert.equal(core.normalizeAnswer("g#"), "g sharp");
assert.equal(core.normalizeAnswer("Flutter-tonguing"), "flutter tonguing");

const allQuestions = core.questionsForLevel(data.QUESTIONS, "AH");
const national5Questions = core.questionsForLevel(data.QUESTIONS, "N5");
assert.equal(core.recognizeAnswer("flutter tongue", allQuestions)?.answer, "Flutter tonguing", "Complete alternative names should work");
["flutter tunging", "flutter tonging", "flutter tounging", "flutter tongeing"].forEach((spelling) => assert.equal(core.recognizeAnswer(spelling, allQuestions)?.answer, "Flutter tonguing", `${spelling} should recognise Flutter tonguing`));
assert.equal(core.recognizeAnswer("roll", allQuestions)?.answer, "Rolls", "Roll should be accepted while displaying the official plural Rolls wording");
assert.equal(core.recognizeAnswer("  PiZZiCaTo ", allQuestions)?.answer, "Pizzicato", "Case and surrounding spaces should be ignored");
assert.equal(core.recognizeAnswer("tremolo", allQuestions)?.answer, "Tremolando", "Tremolo should recognise the Higher Tremolando concept");
assert.equal(core.recognizeAnswer("acciacatura", allQuestions)?.answer, "Acciaccatura", "Configured spelling variants should work");
assert.equal(core.recognizeAnswer("alberti", allQuestions)?.answer, "Alberti bass", "Alberti should be accepted for Alberti bass");
assert.equal(core.recognizeAnswer("walking", allQuestions)?.answer, "Walking bass", "Walking should be accepted for Walking bass");
assert.equal(core.recognizeAnswer("ground", allQuestions)?.answer, "Ground bass", "Ground should be accepted for Ground bass");
assert.equal(core.recognizeAnswer("perfect", allQuestions)?.answer, "Perfect cadence", "Perfect should be accepted for Perfect cadence");
assert.equal(core.recognizeAnswer("imperfect", allQuestions)?.answer, "Imperfect cadence", "Imperfect should be accepted for Imperfect cadence");
assert.equal(core.recognizeAnswer("interrupted", allQuestions)?.answer, "Interrupted cadence", "Interrupted should be accepted for Interrupted cadence");
assert.equal(core.recognizeAnswer("plagal", allQuestions)?.answer, "Plagal cadence", "Plagal should be accepted for Plagal cadence");
assert.equal(core.recognizeAnswer("accel", allQuestions)?.answer, "Accelerando", "Accel should be accepted for Accelerando");
assert.equal(core.recognizeAnswer("rall", allQuestions)?.answer, "Rallentando or ritardando", "Rall should be accepted for Rallentando or ritardando");
assert.equal(core.recognizeAnswer("ritardando", allQuestions)?.answer, "Rallentando or ritardando", "Ritardando should be accepted for Rallentando or ritardando");
assert.equal(core.recognizeAnswer("andante", allQuestions)?.answer, "Andante or moderato", "Andante should be accepted for the combined tempo concept");
assert.equal(core.recognizeAnswer("moderato", allQuestions)?.answer, "Andante or moderato", "Moderato should be accepted for the combined tempo concept");
assert.equal(core.recognizeAnswer("polytonality", allQuestions)?.answer, "Polytonality or bitonality", "Polytonality should be accepted for the combined tonality concept");
assert.equal(core.recognizeAnswer("bitonality", allQuestions)?.answer, "Polytonality or bitonality", "Bitonality should be accepted for the combined tonality concept");
assert.equal(core.recognizeAnswer("polyphonic", allQuestions)?.answer, "Polyphonic or contrapuntal", "Polyphonic should be accepted for the combined texture concept");
assert.equal(core.recognizeAnswer("contrapuntal", allQuestions)?.answer, "Polyphonic or contrapuntal", "Contrapuntal should be accepted for the combined texture concept");
assert.equal(core.recognizeAnswer("mordent", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Mordent", "Mordent should appear at Higher");
assert.equal(core.recognizeAnswer("mordent", allQuestions)?.answer, "Mordent", "Mordent should remain available at Advanced Higher");
assert.equal(core.recognizeAnswer("whole tone", allQuestions)?.answer, "Whole-tone scale", "Whole tone should be accepted without the word scale");
assert.equal(core.recognizeAnswer("wholetone", allQuestions)?.answer, "Whole-tone scale", "Wholetone should be accepted without the word scale");
assert.equal(core.recognizeAnswer("chromatic", allQuestions)?.answer, "Chromatic scale", "Chromatic should be accepted without the word scale");
assert.equal(core.recognizeAnswer("pentatonic", allQuestions)?.answer, "Pentatonic scale", "Pentatonic should be accepted without the word scale");
assert.equal(core.recognizeAnswer("penta-tonic", allQuestions)?.answer, "Pentatonic scale", "Penta-tonic should be accepted without the word scale");
assert.equal(core.recognizeAnswer("penta tonic", allQuestions)?.answer, "Pentatonic scale", "Penta tonic should be accepted without the word scale");
assert.equal(core.recognizeAnswer("em", allQuestions)?.answer, "E minor", "Em should be accepted for E minor");
assert.equal(core.recognizeAnswer("dm", allQuestions)?.answer, "D minor", "Dm should be accepted for D minor");
assert.equal(core.recognizeAnswer("am", allQuestions)?.answer, "A minor", "Am should be accepted for A minor");
assert.equal(core.recognizeAnswer("bb major", allQuestions)?.answer, "B flat major", "Bb major should be accepted for B flat major");
assert.equal(core.recognizeAnswer("mezzosoprano", allQuestions)?.answer, "Mezzo-soprano", "Mezzosoprano should be accepted for Mezzo-soprano");
assert.equal(core.recognizeAnswer("melisma", allQuestions), null, "Melisma should not be accepted in place of the full word Melismatic");
assert.equal(core.recognizeAnswer("grace note", national5Questions)?.answer, "Grace notes", "The singular Grace note should recognise the displayed plural Grace notes answer");
assert.equal(core.recognizeAnswer("grace note", core.questionsForLevel(data.QUESTIONS, "H")), null, "Grace Note should not appear at Higher");
assert.equal(core.recognizeAnswer("grace note", allQuestions), null, "Grace Note should not appear at Advanced Higher");
assert.equal(core.recognizeAnswer("mute", national5Questions), null, "Mute should not be accepted for Con sordino");
assert.equal(core.recognizeAnswer("muted", national5Questions), null, "Muted should not be accepted for Con sordino");
assert.equal(core.recognizeAnswer("pitch bend", allQuestions), null, "Pitch bend should not appear in Concept Recall");
assert.equal(core.recognizeAnswer("pp", national5Questions), null, "Pianissimo should require its full name");
assert.equal(core.recognizeAnswer("p", national5Questions), null, "Piano should require its full name");
assert.equal(core.recognizeAnswer("mp", national5Questions), null, "Mezzo piano should require its full name");
assert.equal(core.recognizeAnswer("mf", national5Questions), null, "Mezzo forte should require its full name");
assert.equal(core.recognizeAnswer("f", national5Questions), null, "Forte should require its full name");
assert.equal(core.recognizeAnswer("ff", national5Questions), null, "Fortissimo should require its full name");
assert.equal(core.recognizeAnswer("cres", national5Questions)?.answer, "Crescendo", "Cres should recognise Crescendo");
assert.equal(core.recognizeAnswer("cresc", national5Questions)?.answer, "Crescendo", "Cresc should recognise Crescendo");
assert.equal(core.recognizeAnswer("sfz", national5Questions)?.answer, "Sforzando", "Sfz should recognise Sforzando");
assert.equal(core.recognizeAnswer("dim", national5Questions)?.answer, "Diminuendo", "Dim should recognise Diminuendo");
assert.equal(core.recognizeAnswer("dynamics", core.questionsForLevel(data.QUESTIONS, "H")), null, "Dynamics should not add an answer at Higher");
assert.equal(core.questionsForLevel(data.QUESTIONS, "H").some((question) => question.category === "Dynamics"), false, "The Dynamics category should be hidden at Higher");
assert.equal(allQuestions.some((question) => question.category === "Dynamics"), false, "The Dynamics category should be hidden at Advanced Higher");
assert.equal(core.recognizeAnswer("counter subject", allQuestions)?.answer, "Countersubject", "Counter subject should recognise Countersubject");
assert.equal(core.recognizeAnswer("tone row", allQuestions)?.answer, "Tone row or note row", "Tone row should recognise the combined Serial music answer");
assert.equal(core.recognizeAnswer("note row", allQuestions)?.answer, "Tone row or note row", "Note row should recognise the combined Serial music answer");
assert.equal(core.recognizeAnswer("added sixth", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Added 6th", "Added sixth should be accepted at Higher");
assert.equal(core.recognizeAnswer("added6th", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Added 6th", "Added6th should be accepted without a space");
assert.equal(core.recognizeAnswer("dim7", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Diminished 7th", "Dim7 should be accepted at Higher");
assert.equal(core.recognizeAnswer("diminished7th", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Diminished 7th", "Diminished7th should be accepted without a space");
assert.equal(core.recognizeAnswer("dom7", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Dominant 7th", "Dom7 should be accepted at Higher");
assert.equal(core.recognizeAnswer("dominant7th", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Dominant 7th", "Dominant7th should be accepted without a space");
assert.equal(core.recognizeAnswer("aug", allQuestions)?.answer, "Augmented triad", "Aug should be accepted for the Advanced Higher augmented triad");
assert.equal(core.recognizeAnswer("augmentedtriad", allQuestions)?.answer, "Augmented triad", "Augmentedtriad should be accepted without a space");
assert.equal(core.recognizeAnswer("aug", core.questionsForLevel(data.QUESTIONS, "H")), null, "Augmented triad should begin at Advanced Higher");
assert.equal(core.recognizeAnswer("minimalism", national5Questions)?.answer, "Minimalist", "Minimalism should recognise the National 5 Minimalist style");
assert.equal(core.recognizeAnswer("musique concrete", core.questionsForLevel(data.QUESTIONS, "H"))?.answer, "Musique concrète", "Musique concrete should work without the accent");
assert.equal(core.recognizeAnswer("air", allQuestions)?.answer, "Ayre or air", "Air should recognise the combined Advanced Higher style answer");
assert.equal(core.recognizeAnswer("edm", allQuestions)?.answer, "Electronic dance music (EDM)", "EDM should recognise the full displayed style name");
[
  "tr", "pizz", "acci", "rip", "barit", "c maj", "continuo", "mezzo",
].forEach((shortened) => assert.equal(core.recognizeAnswer(shortened, allQuestions), null, `Shortened answer ${shortened} must not be accepted`));
assert.equal(core.recognizeAnswer("perf", allQuestions), null, "Unconfigured partial answers must not be accepted");
assert.equal(core.recognizeAnswer("pizzic", allQuestions), null, "Broad substring matching must not be used");
assert.equal(core.recognizeAnswer("minor c", allQuestions), null, "Ambiguous fragments must not be accepted");

const answered = new Set(["technique-pizzicato"]);
assert.equal(core.recognizeAnswer("pizzicato", allQuestions, answered), null, "An answered concept must not score twice");
assert.equal(core.recognizeAnswer("turn", allQuestions, answered)?.id, "ornaments-turn", "Answers should be accepted in any order");
assert.deepEqual(core.answerCollisions(data.QUESTIONS), [], "No alias should point to two different concepts");

const selected = core.questionsForSetup(data.QUESTIONS, "N5", ["Tempo", "Tonalities"]);
assert(selected.length > 0 && selected.every((question) => ["Tempo", "Tonalities"].includes(question.category)), "Category selection should restrict the question set");

const original = allQuestions.slice(0, 5);
const values = [0.1, 0.8, 0.3, 0.6];
let randomIndex = 0;
const shuffled = core.shuffleQuestions(original, () => values[randomIndex++ % values.length]);
assert.equal(shuffled.length, original.length);
assert.deepEqual(new Set(shuffled.map((question) => question.id)), new Set(original.map((question) => question.id)));

const runningTimer = { durationMs: 600000, accumulatedMs: 12000, startedAt: 100000, running: true };
assert.equal(core.elapsedMilliseconds(runningTimer, 148500), 60500, "Elapsed time should be calculated from timestamps");
assert.equal(core.remainingMilliseconds(runningTimer, 148500), 539500, "A delayed interval or background tab must not make the timer drift");
const pausedTimer = { durationMs: 600000, accumulatedMs: 60500, startedAt: null, running: false };
assert.equal(core.remainingMilliseconds(pausedTimer, 999999), 539500, "Paused time should remain frozen");
const unlimitedTimer = { durationMs: 0, accumulatedMs: 12000, startedAt: 100000, running: true };
assert.equal(core.elapsedMilliseconds(unlimitedTimer, 700000), 612000, "An unlimited timer should count up without being capped by a duration");
assert.equal(core.formatClock(600000), "10:00");
assert.equal(core.formatClock(29999), "00:29");

assert.deepEqual(core.medalTimeLimits("N5"), { bronze: 360000, silver: 300000, gold: 240000, diamond: 180000 });
assert.deepEqual(core.medalTimeLimits("H"), { bronze: 360000, silver: 300000, gold: 240000, diamond: 180000 });
assert.deepEqual(core.medalTimeLimits("AH"), { bronze: 360000, silver: 300000, gold: 240000, diamond: 180000 });
assert.equal(core.medalForCompletion({ level: "N5", completed: true, standardGame: true, elapsedMs: 180000, durationMs: 0 }), "diamond", "A standard game completed within three minutes should award Diamond");
assert.equal(core.medalForCompletion({ level: "N5", completed: true, standardGame: true, elapsedMs: 180001, durationMs: 0 }), "gold", "A standard game completed after three minutes but within four should award Gold");
assert.equal(core.medalForCompletion({ level: "H", completed: true, standardGame: true, elapsedMs: 240000, durationMs: 0 }), "gold", "A standard game completed within four minutes should award Gold");
assert.equal(core.medalForCompletion({ level: "AH", completed: true, standardGame: true, elapsedMs: 300000, durationMs: 0 }), "silver", "A standard game completed within five minutes should award Silver");
assert.equal(core.medalForCompletion({ level: "AH", completed: true, standardGame: true, elapsedMs: 360000, durationMs: 0 }), "bronze", "A standard game completed within six minutes should award Bronze");
assert.equal(core.medalForCompletion({ level: "AH", completed: true, standardGame: true, elapsedMs: 360001, durationMs: 0 }), null, "A standard game completed after six minutes should not award a medal");
assert.equal(core.medalForCompletion({ level: "N5", completed: true, standardGame: false, elapsedMs: 1000, durationMs: 300000 }), null, "Custom category games must not award medals");
assert.equal(core.medalForCompletion({ level: "N5", completed: false, standardGame: true, elapsedMs: 300000, durationMs: 300000 }), null, "Incomplete games must not award medals");

const result = core.createResult({
  level: "N3",
  questions: core.questionsForLevel(data.QUESTIONS, "N3"),
  answeredIds: new Set(["family-strings", "tempo-allegro"]),
  elapsedMs: 600000,
  durationMs: 600000,
  standardGame: true,
  completedAt: 1234,
});
assert.deepEqual({ correct: result.correct, missed: result.missed, total: result.total, percentage: result.percentage }, { correct: 2, missed: 5, total: 7, percentage: 29 });
assert.equal(result.categoryBreakdown.reduce((sum, item) => sum + item.correct, 0), 2, "Category totals should equal the result score");

const memoryStorage = {
  value: "",
  getItem() { return this.value; },
  setItem(_key, value) { this.value = value; },
};
assert.deepEqual(core.loadPersistence(memoryStorage), core.emptyPersistence(), "Missing saved data should use safe defaults");
memoryStorage.value = "{bad json";
assert.deepEqual(core.loadPersistence(memoryStorage), core.emptyPersistence(), "Broken saved data should not break the game");

const completeResult = core.createResult({
  level: "N3",
  questions: core.questionsForLevel(data.QUESTIONS, "N3"),
  answeredIds: new Set(core.questionsForLevel(data.QUESTIONS, "N3").map((question) => question.id)),
  elapsedMs: 100000,
  durationMs: 600000,
  standardGame: true,
});
const persisted = core.updatePersistence(core.emptyPersistence(), completeResult, { timerMinutes: 5, soundEffects: false });
assert.equal(persisted.records.N3.bestScore, 7);
assert.equal(persisted.records.N3.fastestCompletionMs, 100000);
assert.equal(persisted.records.N3.bestMedal, "diamond");
assert.equal(persisted.preferences.timerMinutes, 5);
assert.equal(persisted.preferences.soundEffects, false);

const changedQuestionSet = core.sanitizePersistence({ ...persisted, records: { N3: { ...persisted.records.N3, questionTotal: 999 } } });
assert.equal(changedQuestionSet.records.N3.questionTotal, 999, "A changed question count should remain readable rather than crashing storage");

const customResult = { ...completeResult, standardGame: false, correct: 2, total: 2 };
const afterCustom = core.updatePersistence(persisted, customResult);
assert.deepEqual(afterCustom.records.N3, persisted.records.N3, "Custom results must not replace standard level records");
assert.equal(afterCustom.recentResult.standardGame, false, "The most recent custom result should still be saved");

console.log("Concept Recall core checks passed.");
