const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const CORE = require("./millionaire-core.js");
const BANK = require("./millionaire-question-bank.js");

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

test("question bank contains completed Music Literacy pools only", () => {
  assert.ok(BANK.length >= 400);
  assert.equal(new Set(BANK.map((question) => question.id)).size, BANK.length);
  assert.deepEqual(CORE.validateQuestionBank(BANK), []);
  assert.deepEqual(CORE.validateQuestionPools(BANK.pools), []);
  assert.equal(CORE.questionPoolSummary(BANK.pools).length, 45);
  for (const level of CORE.SUPPORTED_LEVELS) {
    for (const difficulty of CORE.DIFFICULTIES) {
      for (const category of CORE.CATEGORIES) {
        const pool = BANK.pools[level][difficulty][category];
        if (category === "literacy") assert.ok(pool.length >= 5, `${level}/${difficulty}/literacy should contain a complete question pool`);
        else assert.equal(pool.length, 0, `${level}/${difficulty}/${category} should remain unavailable`);
        assert.ok(pool.every((question) => question.level === level && question.difficulty === difficulty && question.category === category));
      }
    }
  }
  const national3 = BANK.filter((question) => question.level === "N3");
  assert.ok(national3.length >= 60);
  assert.ok(national3.every((question) => !question.placeholder));
  assert.ok(national3.every((question) => question.category === "literacy"));
  const n3Literacy = BANK.filter((question) => question.level === "N3" && question.category === "literacy");
  assert.ok(n3Literacy.length >= 46);
  assert.ok(n3Literacy.every((question) => ["easy", "medium", "hard"].includes(question.difficulty)));
  assert.ok(n3Literacy.every((question) => !question.question.includes("crotchet beats")), "National 3 Literacy prompts should use the simpler term beats.");
  assert.equal(n3Literacy.find((question) => question.concept === "stave")?.notation?.kind, "stave", "The National 3 stave question should display a blank stave in the notation panel.");
  assert.ok(n3Literacy.filter((question) => question.concept.startsWith("double-barline")).every((question) => question.notation?.kind === "barline"), "National 3 double-barline questions should use the shared Bravura end-barline.");
  assert.equal(n3Literacy.find((question) => question.concept === "treble-clef-name")?.notation?.glyphs?.[0], "trebleClef", "The Easy treble-clef question should show the shared Bravura treble clef in the notation panel.");
  const n5AccidentalNotes = BANK.filter((question) => question.level === "N5" && question.concept === "accidental-note-identification");
  assert.ok(n5AccidentalNotes.length > 0 && n5AccidentalNotes.every((question) => question.notation?.accidentalXOffset === -7), "National 5 note-identification accidentals should sit seven pixels further left.");
  const n5Intervals = BANK.filter((question) => question.level === "N5" && question.concept === "interval-identification");
  assert.ok(n5Intervals.length > 0 && n5Intervals.every((question) => question.question === "What interval is this?"), "National 5 interval prompts should be phrased as questions.");
  assert.ok(n5Intervals.every((question) => question.notation?.matchStepLeapLayout === true), "National 5 interval notation should use the National 3 step/leap layout.");
  const n5Chords = BANK.filter((question) => question.level === "N5" && question.concept === "chord-identification");
  assert.ok(n5Chords.length > 0 && n5Chords.every((question) => question.notation?.kind === "n5ChordOutline" && question.notation.pitches?.length === 3), "National 5 chord questions should use the Chords score data.");
  const dynamicComparisonQuestions = BANK.filter((question) => question.level === "N5" && question.concept === "dynamic-comparison");
  assert.ok(dynamicComparisonQuestions.length > 0 && dynamicComparisonQuestions.every((question) => question.type === "text" && question.notation === undefined), "Dynamic-comparison questions should rely on their dynamic answer choices without a separate notation container.");
  assert.ok(dynamicComparisonQuestions.every((question) => ["Which dynamic is the quietest?", "Which dynamic is the loudest?"].includes(question.question)), "Dynamic-comparison questions should use quietest or loudest wording.");
  const n5TimeSignatureBars = BANK.filter((question) => question.level === "N5" && question.concept === "national-5-time-signature");
  assert.ok(n5TimeSignatureBars.length > 0 && n5TimeSignatureBars.every((question) => Array.isArray(question.notation?.rhythmTokens)), "National 5 time-signature bars should use the Timesig rhythm tokens.");
  assert.ok(n5TimeSignatureBars.filter((question) => question.notation.timeSignature === "4/4").every((question) => !question.notation.rhythmTokens.join(" ").includes("dotted-crotchet dotted-crotchet")), "Simple 4/4 bars should not use the invalid paired dotted-crotchet grouping.");
  const n5ToneSemitoneQuestions = BANK.filter((question) => question.level === "N5" && question.concept === "tone-or-semitone");
  assert.ok(n5ToneSemitoneQuestions.length > 0 && n5ToneSemitoneQuestions.every((question) => question.notation?.noteXOffset === -45 && question.notation?.keySignatureXOffset === -15 && question.notation?.toneSemitoneZoom === true), "National 5 tone-and-semitone notes and key signatures should use their requested left offsets and enlarged layout.");
  const n5NoteValueComparisons = BANK.filter((question) => question.level === "N5" && question.concept === "note-value-comparison");
  assert.equal(n5NoteValueComparisons.filter((question) => question.difficulty === "medium").length, 1, "National 5 should retain only its unique Medium note-value comparison.");
  assert.equal(n5NoteValueComparisons.filter((question) => question.difficulty === "hard").length, 4, "National 5 should contain four Hard note-value comparisons.");
  assert.ok(n5NoteValueComparisons.every((question) => question.notation?.kind === "rhythmSum" && question.notation?.operators?.[0] === "→"), "National 5 note-value comparisons should show both musical note values.");
  assert.ok(n5NoteValueComparisons.filter((question) => question.question.includes("dotted quaver") || question.question.includes("dotted crotchet")).every((question) => question.difficulty === "hard"), "Comparisons involving dotted quavers or dotted crotchets should be Hard.");
  const n5AccidentalFunctions = BANK.filter((question) => question.level === "N5" && question.concept === "accidental-function");
  assert.equal(n5AccidentalFunctions.length, 3, "National 5 should ask what sharp, flat and natural signs do.");
  assert.ok(n5AccidentalFunctions.every((question) => question.difficulty === "easy" && question.notation?.kind === "accidentalSymbol"), "Accidental-function questions should be Easy and show the relevant symbol.");
  const augmentationDotQuestion = BANK.find((question) => question.id === "n5-literacy-easy-041");
  assert.equal(augmentationDotQuestion?.answers?.find((answer) => answer.id === augmentationDotQuestion.correctAnswer)?.text, "Adds half the note’s original value");
  assert.deepEqual(augmentationDotQuestion?.notation?.glyphs, ["dottedQuarterNote"]);
  const n5KeySignatureAccidentals = BANK.filter((question) => question.level === "N5" && question.concept === "key-signature-accidental");
  assert.deepEqual(n5KeySignatureAccidentals.map((question) => [question.question, question.answers.find((answer) => answer.id === question.correctAnswer)?.text, question.difficulty]), [
    ["Which note is sharpened in G major?", "F", "medium"],
    ["Which note is flattened in F major?", "B", "medium"],
  ]);
  const dottedPairNameQuestion = BANK.find((question) => question.id === "n5-literacy-medium-027");
  assert.equal(dottedPairNameQuestion?.question, "Which statement best describes the rhythm you see?", "The dotted-quaver and semiquaver question should use the requested wording.");
  const dottedQuaverNameQuestion = BANK.find((question) => question.id === "n5-literacy-easy-035");
  assert.equal(dottedQuaverNameQuestion?.notation?.kind, "glyphs", "The standalone dotted quaver should use the same large symbol renderer as the National 3 crotchet.");
  assert.deepEqual(dottedQuaverNameQuestion?.notation?.glyphs, ["dottedEighthNote"]);
  ["n5-literacy-easy-034", "n5-literacy-medium-021", "n5-literacy-medium-025"].forEach((id) => {
    const question = BANK.find((item) => item.id === id);
    assert.equal(question?.notation?.kind, "glyphs", `${id} should use the large standalone symbol renderer.`);
    assert.deepEqual(question?.notation?.glyphs, ["dottedQuarterNote"]);
  });
  const rhythmSums = n3Literacy.filter((question) => question.concept.startsWith("rhythm-addition") || question.concept.startsWith("rhythm-sum"));
  assert.ok(rhythmSums.length >= 8 && rhythmSums.every((question) => question.notation?.kind === "rhythmSum"), "National 3 rhythm sums should use the Rhythm Sums-style notation presentation.");
  assert.ok(n3Literacy.filter((question) => ["crescendo-symbol", "diminuendo-symbol"].includes(question.concept)).every((question) => question.notation?.kind === "dynamic"), "National 3 dynamic-symbol questions should use the dedicated Dynamics-style renderer.");
  assert.ok(n3Literacy.filter((question) => question.difficulty === "hard").some((question) => question.notation?.kind === "bar"));

  const higherLiteracy = BANK.filter((question) => question.level === "H" && question.category === "literacy");
  assert.deepEqual(Object.fromEntries(CORE.DIFFICULTIES.map((difficulty) => [difficulty, higherLiteracy.filter((question) => question.difficulty === difficulty).length])), { easy: 25, medium: 31, hard: 27 });
  assert.ok(higherLiteracy.every((question) => !question.placeholder), "Higher Music Literacy should use real questions only.");
  assert.ok(higherLiteracy.every((question) => !["transposition", "chord-identification", "written-interval"].includes(question.concept)), "The omitted Higher topics must not appear.");

  const higherBassNotes = higherLiteracy.filter((question) => question.concept === "bass-clef-note-identification");
  assert.equal(higherBassNotes.length, 13);
  assert.deepEqual(higherBassNotes.map((question) => question.notation?.pitch), ["E2", "F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]);
  assert.ok(higherBassNotes.every((question) => question.notation?.clef === "bass"));
  const higherIntervals = higherLiteracy.filter((question) => question.concept === "diatonic-interval-identification");
  assert.equal(higherIntervals.length, 7);
  assert.ok(higherIntervals.every((question) => question.notation?.matchStepLeapLayout === true), "Higher intervals should use the same enlarged note positions as National 5 intervals.");
  assert.equal(higherLiteracy.filter((question) => question.concept === "articulation-definition").length, 4);
  assert.equal(higherLiteracy.filter((question) => question.concept === "articulation-identification").length, 4);

  const higherRestNames = higherLiteracy.filter((question) => question.concept === "rest-name");
  const higherRestValues = higherLiteracy.filter((question) => question.concept === "rest-value");
  const allowedRests = ["quaver-rest", "crotchet-rest", "dotted-crotchet-rest", "minim-rest", "semibreve-rest"];
  assert.equal(higherRestNames.length, 5);
  assert.equal(higherRestValues.length, 5);
  assert.deepEqual(higherRestNames.map((question) => question.notation.rest), allowedRests);
  assert.deepEqual(higherRestValues.map((question) => question.notation.rest), allowedRests);
  assert.ok(higherLiteracy.every((question) => question.notation?.rest !== "whole-bar-rest"), "Whole-bar rests should be omitted.");

  const higherRestSums = higherLiteracy.filter((question) => question.concept === "note-rest-sum");
  assert.equal(higherRestSums.length, 8);
  assert.ok(higherRestSums.every((question) => question.notation?.kind === "restSum" && question.notation.note && question.notation.rest), "Each rest sum should contain exactly one note and one rest.");
  const higherTimeSignatures = higherLiteracy.filter((question) => question.concept === "higher-time-signature");
  assert.equal(higherTimeSignatures.length, 8);
  assert.deepEqual([...new Set(higherTimeSignatures.map((question) => question.notation.timeSignature))].sort(), ["2/4", "3/4", "4/4", "6/8"]);
  assert.ok(higherTimeSignatures.every((question) => question.notation.rhythmTokens.length >= 2 && question.notation.rhythmTokens.some((token) => token.includes("semiquaver") || token.includes("quaver-group") || token === "dotted-crotchet")), "Higher time-signature bars should use dotted or subdivided rhythms rather than National 3-style single notes.");
  const higherCompoundTimeSignatures = higherTimeSignatures.filter((question) => question.notation.timeSignature === "6/8");
  const compoundBeatGroups = new Set(["dotted-crotchet", "quaver-group-3", "crotchet-quaver", "quaver-crotchet"]);
  assert.ok(higherCompoundTimeSignatures.every((question) => question.notation.rhythmTokens.length === 2 && question.notation.rhythmTokens.every((token) => compoundBeatGroups.has(token))), "Each Higher 6/8 bar should contain exactly two valid dotted-crotchet beat groups copied from timesig.html.");

  const higherMissingRests = higherLiteracy.filter((question) => question.concept === "missing-rest");
  assert.equal(higherMissingRests.length, 12);
  assert.ok(higherMissingRests.every((question) => question.notation?.kind === "restBar" && question.notation.source === "rests.html" && question.notation.missingRest));
  assert.ok(higherMissingRests.every((question) => allowedRests.map((rest) => rest.replaceAll("-", " ")).some((rest) => question.answers[0].text.toLowerCase() === rest)), "Missing-rest answers should use only the five requested rest values.");
  const rhythmUnits = { quaver: 2, crotchet: 4, "dotted-crotchet": 6, minim: 8, "dotted-minim": 12, semibreve: 16, "quaver-group-2": 4, "quaver-group-3": 6 };
  const restUnits = { "quaver-rest": 2, "crotchet-rest": 4, "dotted-crotchet-rest": 6, "minim-rest": 8, "semibreve-rest": 16 };
  assert.ok(higherMissingRests.every((question) => {
    const [upper, lower] = question.notation.time;
    const requiredUnits = upper * (16 / lower);
    return [...question.notation.before, ...question.notation.after].reduce((total, rhythm) => total + rhythmUnits[rhythm], restUnits[question.notation.missingRest]) === requiredUnits;
  }), "Every missing-rest bar should total exactly the displayed time signature.");
  const compoundMissingRests = higherMissingRests.filter((question) => question.notation.time[1] === 8 && question.notation.time[0] >= 6);
  assert.ok(compoundMissingRests.every((question) => {
    const events = [...question.notation.before.map((rhythm) => rhythmUnits[rhythm]), restUnits[question.notation.missingRest], ...question.notation.after.map((rhythm) => rhythmUnits[rhythm])];
    let cursor = 0;
    return events.every((units) => {
      const staysInsideDottedCrotchetBeat = Math.floor(cursor / 6) === Math.floor((cursor + units - 1) / 6);
      cursor += units;
      return staysInsideDottedCrotchetBeat;
    });
  }), "Every compound-time rhythm and missing rest should remain inside one dotted-crotchet beat group.");
  assert.equal(higherLiteracy.filter((question) => question.concept === "triplet-equivalence").length, 3);
  const higherScaleDegrees = higherLiteracy.filter((question) => question.concept === "tonic-subdominant-dominant");
  assert.equal(higherScaleDegrees.length, 12);
  assert.ok(higherScaleDegrees.every((question) => question.type !== "notation" && question.notation === undefined), "Tonic, subdominant and dominant questions should not show a notation container.");

  const ahLiteracy = BANK.filter((question) => question.level === "AH" && question.category === "literacy");
  assert.deepEqual(Object.fromEntries(CORE.DIFFICULTIES.map((difficulty) => [difficulty, ahLiteracy.filter((question) => question.difficulty === difficulty).length])), { easy: 26, medium: 30, hard: 144 });
  assert.ok(ahLiteracy.every((question) => !question.placeholder), "Advanced Higher Music Literacy should use real questions only.");
  assert.ok(BANK.every((question) => /\?$/.test(String(question.question || question.prompt || "").trim())), "Every Millionaire prompt across every level should be phrased as a direct question.");
  const ahNotes = ahLiteracy.filter((question) => question.concept === "note-identification");
  assert.equal(ahNotes.length, 10);
  assert.equal(ahNotes.filter((question) => question.notation.accidental).length, 2, "Twenty per cent of AH note-identification questions should contain an accidental.");
  const isLedgerNote = (question) => {
    const pitch = question.notation.pitch;
    const index = question.notation.clef === "bass"
      ? ["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4"].indexOf(pitch) - 2
      : ["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6"].indexOf(pitch);
    return index <= 0 || index >= 12;
  };
  assert.equal(ahNotes.filter(isLedgerNote).length, 8, "Eighty per cent of AH note-identification questions should use ledger lines.");
  const ahKeys = ahLiteracy.filter((question) => question.concept === "key-signature-identification");
  assert.equal(ahKeys.length, 8);
  assert.equal(ahKeys.filter((question) => ["D major","B flat major","E minor","D minor"].includes(question.notation.signature)).length, 4);
  assert.ok(ahKeys.filter((question) => question.notation.signature.endsWith("minor")).every((question) => question.question.includes("minor key signature")));
  const ahTimeSignatures = ahLiteracy.filter((question) => question.concept === "time-signature");
  assert.equal(ahTimeSignatures.length, 10);
  assert.equal(ahTimeSignatures.filter((question) => question.answers[0].text === "5/4").length, 6);
  assert.ok(ahTimeSignatures.filter((question) => question.answers[0].text === "5/4").every((question) => question.notation.groupAfterBeats === 3), "Every 5/4 identification bar should show a 3+2 grouping.");
  const ahFiveFourRests = ahLiteracy.filter((question) => question.concept === "five-four-missing-rest");
  assert.equal(ahFiveFourRests.length, 8);
  assert.ok(ahFiveFourRests.every((question) => question.notation.groupAfterBeats === 3), "Every missing-rest bar should show a 3+2 grouping.");
  const ahFiveFourQuestions = ahLiteracy.filter((question) => question.gameLimitGroup === "five-four");
  assert.equal(ahFiveFourQuestions.length, 14);
  assert.ok(ahFiveFourQuestions.every((question) => question.gameLimit === 1), "All 5/4 questions should share a one-per-game limit.");
  const ahTimeSignatureQuestions = ahLiteracy.filter((question) => question.concept === "time-signature");
  const ahTimeTokenBeats = { quaver:.5, "dotted-crotchet":1.5, "semiquaver-group-4":1, "quaver-2semiquavers":1, "2semiquavers-quaver":1, "dotted-quaver-semiquaver":1, "dotted-quaver-semiquaver-quaver":1.5, "quaver-2semiquavers-quaver":1.5 };
  const ahExpectedBarBeats = { "2/4":2, "3/4":3, "4/4":4, "5/4":5, "6/8":3 };
  const ahComplexRhythms = new Set(["semiquaver-group-4","quaver-2semiquavers","2semiquavers-quaver","dotted-quaver-semiquaver","dotted-quaver-semiquaver-quaver","quaver-2semiquavers-quaver"]);
  assert.ok(ahTimeSignatureQuestions.every((question) => question.notation.rhythmTokens.some((token) => ahComplexRhythms.has(token))), "Every AH time-signature bar should contain an appropriately complex rhythm.");
  assert.ok(ahTimeSignatureQuestions.every((question) => Math.abs(question.notation.rhythmTokens.reduce((sum, token) => sum + ahTimeTokenBeats[token], 0) - ahExpectedBarBeats[question.notation.timeSignature]) < .001), "Every complex AH time-signature rhythm must still complete its displayed bar exactly.");
  assert.ok(ahTimeSignatureQuestions.filter((question) => question.notation.timeSignature === "5/4").every((question) => question.notation.rhythmTokens.reduce((state, token) => ({ elapsed:state.elapsed+ahTimeTokenBeats[token], boundary:state.boundary||Math.abs(state.elapsed+ahTimeTokenBeats[token]-3)<.001 }), { elapsed:0, boundary:false }).boundary), "Every complex 5/4 bar should preserve the visible 3+2 boundary.");
  const ahRhythmUnits = { quaver:2, crotchet:4, "dotted-crotchet":6, minim:8, "dotted-minim":12, "semiquaver-group-4":4 };
  const ahRestUnits = { "crotchet-rest":4, "minim-rest":8, "dotted-minim-rest":12 };
  assert.ok(ahFiveFourRests.every((question) => {
    const events = [...question.notation.before.map((token) => ahRhythmUnits[token]), ahRestUnits[question.notation.missingRest], ...question.notation.after.map((token) => ahRhythmUnits[token])];
    let cursor=0;
    return events.reduce((total,units)=>total+units,0)===20 && events.every((units)=>{const start=cursor;cursor+=units;return !(start<12&&cursor>12);});
  }), "Every 5/4 missing-rest example should total five beats without crossing the 3+2 boundary.");
  assert.equal(ahLiteracy.filter((question) => question.concept === "enharmonic-equivalent").length, 10);
  const ahOctaveSigns = ahLiteracy.filter((question) => question.concept === "octave-sign");
  assert.equal(ahOctaveSigns.filter((question) => question.question.startsWith("What does")).length, 2);
  assert.ok(ahOctaveSigns.filter((question) => question.question.startsWith("What does")).every((question) => question.notation?.kind === "octaveSign"), "8va and 8vb meaning questions should show the Bravura sign in a notation container.");
  assert.ok(ahOctaveSigns.filter((question) => question.question.startsWith("Which instruction")).every((question) => !question.notation), "Instruction-identification questions must not display their answer as notation.");
  assert.ok(ahLiteracy.filter((question) => question.concept === "enharmonic-equivalent").every((question) => question.notation.accidentalXOffset === -7 && question.notation.clefXOffset === 10 && question.notation.noteXOffset === -15), "AH enharmonic notes should use the requested accidental, clef and note spacing.");
  const ahChordQuestions = ahLiteracy.filter((question) => question.concept === "chord-and-position");
  assert.equal(ahChordQuestions.length, 106, "The AH chord pool should contain every required key, chord and permitted inversion combination.");
  const ahMajorChordKeys = ["C major","G major","F major","D major","B flat major"];
  const ahMinorChordKeys = ["A minor","E minor","D minor"];
  const expectedAhChordCases = [
    ...ahMajorChordKeys.flatMap((key) => ["I","II","IV","V","VI"].flatMap((symbol) => (symbol === "II" ? [0,1] : [0,1,2]).map((inversion) => `${key}|${symbol}|${inversion}`))),
    ...ahMinorChordKeys.flatMap((key) => ["I","IV","V","VI"].flatMap((symbol) => [0,1,2].map((inversion) => `${key}|${symbol}|${inversion}`))),
  ].sort();
  const actualAhChordCases = ahChordQuestions.map((question) => {
    const key = question.question.match(/^In (.+), which chord/)?.[1];
    const answer = question.answers[0].text.match(/^Chord (I|II|IV|V|VI), (root position|1st inversion|2nd inversion)$/);
    const inversion = answer?.[2] === "1st inversion" ? 1 : answer?.[2] === "2nd inversion" ? 2 : 0;
    return `${key}|${answer?.[1]}|${inversion}`;
  }).sort();
  assert.deepEqual(actualAhChordCases, expectedAhChordCases, "Chord II should use root and 1st inversion in every listed major key, while chords I, IV, V and VI should use all three positions in every listed major and minor key.");
  assert.ok(ahChordQuestions.every((question) => question.notation.kind === "ahChord" && !question.notation.chordSymbol && !/\b(?:I|II|IV|V|VI)(?:b|c)?\b/.test(question.notation.label)), "Chord-identification notation must not reveal the chord or inversion visually or accessibly.");
  assert.ok(ahChordQuestions.every((question) => new Set(question.answers.map((answer) => answer.text.match(/^Chord (I|II|IV|V|VI),/)?.[1])).size === 4), "Each chord-identification answer set should use four different chord numbers.");
  assert.ok(ahChordQuestions.every((question) => question.gameLimitGroup === "chord-and-position" && question.gameLimit === 1), "Chord-and-position questions should be limited to one per game.");
  const ahBassQuestions = ahLiteracy.filter((question) => question.concept === "bass-note-from-chord");
  assert.ok(ahBassQuestions.every((question) => question.notation.kind === "ahBassPrompt" && question.gameLimitGroup === "bass-note-from-chord" && question.gameLimit === 1), "Bass-note questions should have their own one-per-game limit, separate from chord-and-position questions.");
  assert.ok(ahBassQuestions.every((question) => /Which bass note should be used for [A-G](?: (?:sharp|flat))? (?:major|minor), (?:root position|1st inversion|2nd inversion)\?$/.test(question.question)), "Bass-note questions should name the chord and inversion in plain text.");
  assert.ok(ahBassQuestions.every((question) => question.notation.treblePitches.length === 3 && question.notation.bassPitch === null), "Bass-note questions should show the complete three-note chord on the treble stave and leave the bass stave unanswered.");
  const ahTritoneQuestions = ahLiteracy.filter((question) => question.concept === "tritone");
  assert.equal(ahTritoneQuestions.length, 8);
  assert.ok(ahTritoneQuestions.every((question) => question.notation.kind === "ahInterval" && question.notation.source === "intervals.html"), "AH tritone questions should use the dedicated intervals.html notation construction.");
  assert.ok(ahTritoneQuestions.every((question) => question.gameLimitGroup === "interval-identification" && question.gameLimit === 1), "AH interval questions should be limited to one per game.");
  const ahDsAlFineQuestions = ahLiteracy.filter((question) => question.concept === "ds-al-fine");
  assert.equal(ahDsAlFineQuestions.length, 8);
  assert.ok(ahDsAlFineQuestions.every((question) => question.gameLimitGroup === "ds-al-fine" && question.gameLimit === 1), "D.S. al Fine interpretation questions should form their own hard-question group.");
  const ahSegnoQuestions = ahLiteracy.filter((question) => question.concept === "segno");
  assert.equal(ahSegnoQuestions.length, 1);
  assert.ok(ahSegnoQuestions.every((question) => question.answers.find((answer) => answer.id === question.correctAnswer)?.text === "Segno" && question.notation?.label === "The segno sign."));
  assert.deepEqual([...new Set(ahLiteracy.filter((question) => question.concept === "raised-seventh").map((question) => question.answers[0].text))].sort(), ["C sharp","D sharp","G sharp"]);
  assert.ok(ahLiteracy.filter((question) => question.concept === "raised-seventh").every((question) => question.fixedStage === 15), "Raised-seventh questions should be locked to the £1 million stage.");
  for (let seed = 1; seed <= 25; seed += 1) {
    const game = CORE.composeGame(BANK, [], seeded(seed), { level:"AH", categories:["literacy"] });
    assert.ok(game.filter((question) => question.gameLimitGroup === "five-four").length <= 1, "An AH game must contain no more than one 5/4 question.");
    assert.ok(game.filter((question) => question.concept === "chord-and-position").length <= 1, "An AH game must contain no more than one chord-and-position question.");
    assert.ok(game.filter((question) => question.concept === "bass-note-from-chord").length <= 1, "An AH game must contain no more than one bass-note question.");
    assert.ok(game.filter((question) => question.concept === "tritone").length <= 1, "An AH game must contain no more than one interval question.");
    assert.ok(game.filter((question) => question.concept === "ds-al-fine").length <= 1, "An AH game must contain no more than one D.S. al Fine question.");
    assert.deepEqual(game.slice(10,14).map((question) => question.concept).sort(), ["bass-note-from-chord","chord-and-position","ds-al-fine","tritone"], "The four non-million-pound hard stages should use one question from each hard type.");
    assert.ok(game.slice(0,14).every((question) => question.concept !== "raised-seventh"), "A raised-seventh question must never appear before £1 million.");
    assert.equal(game[14].concept, "raised-seventh", "The £1 million AH question should use the raised-seventh pool.");
  }
});

test("question bank contains no non-literacy or placeholder records", () => {
  assert.ok(BANK.every((question) => question.category === "literacy"));
  assert.ok(BANK.every((question) => !question.placeholder && !question.fallback));
});

test("games for every course level meet block, mixture and uniqueness rules", () => {
  for (const level of CORE.SUPPORTED_LEVELS) {
    for (let seed = 1; seed <= 100; seed += 1) {
      const categories = ["literacy"];
      const game = CORE.composeGame(BANK, [], seeded(seed * 10 + CORE.SUPPORTED_LEVELS.indexOf(level)), { level, categories });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15);
      assert.equal(new Set(game.map(CORE.questionFingerprint)).size, 15, `${level} games must never repeat the same pupil-facing question.`);
      game.forEach((question, index) => {
        assert.equal(question.level, level);
        assert.equal(question.difficulty, CORE.difficultyForStage(index + 1));
        assert.equal(question.answers.length, 4);
        assert.equal(question.answers.find((answer) => answer.letter === question.correctLetter).originalId, question.correctAnswer);
        if (categories.length > 1 && index >= 2) assert.ok(!(game[index - 2].category === question.category && game[index - 1].category === question.category));
      });
      for (let start = 0; start < 15; start += 5) {
        const block = game.slice(start, start + 5);
        const counts = Object.fromEntries(CORE.CATEGORIES.map((category) => [category, block.filter((question) => question.category === category).length]));
        if (categories.length === 1) assert.deepEqual(counts, { literacy: 5, concepts: 0, listening: 0 });
        else assert.ok(Object.values(counts).every((count) => count >= 1 && count <= 2));
      }
    }
  }
});

test("new games are random while a composed game remains a fixed sequence", () => {
  const first = CORE.composeGame(BANK, [], seeded(101), { level: "N5" });
  const originalIds = first.map((question) => question.id);
  const second = CORE.composeGame(BANK, [], seeded(202), { level: "N5" });
  assert.notDeepEqual(second.map((question) => question.id), originalIds);
  assert.deepEqual(first.map((question) => question.id), originalIds);
});

test("recent-game history recognises duplicate pupil-facing questions with different IDs", () => {
  const original = BANK.find((question) => question.id === "n4-literacy-medium-002");
  const duplicate = { ...original, id: "test-only-duplicate-question" };
  const testBank = [...BANK, duplicate];
  assert.equal(CORE.questionFingerprint(original), CORE.questionFingerprint(duplicate));
  const freshAlternative = BANK.find((question) => question.level === "N4" && question.difficulty === "medium" && question.category === "literacy"
    && CORE.questionFingerprint(original) !== CORE.questionFingerprint(question));
  assert.ok(freshAlternative);
  const game = CORE.composeGame(testBank, [[original.id]], seeded(17), { level: "N4", categories: ["literacy"] });
  assert.ok(!game.some((question) => CORE.questionFingerprint(question) === CORE.questionFingerprint(original)));
});

test("question validation rejects blank and effectively duplicated answer text", () => {
  const valid = BANK[0];
  const blank = { ...valid, id: "audit-blank-answer", answers: valid.answers.map((answer, index) => index === 3 ? { ...answer, text: "   " } : answer) };
  const duplicate = { ...valid, id: "audit-duplicate-answer", answers: valid.answers.map((answer, index) => index === 3 ? { ...answer, text: `  ${valid.answers[0].text.toUpperCase()}  ` } : answer) };
  assert.ok(CORE.validateQuestion(blank).includes("Every answer must contain non-blank text."));
  assert.ok(CORE.validateQuestion(duplicate).includes("Answer text must be unique after normalising case and spacing."));
});

test("Music Literacy games use 15 unique questions and get harder", () => {
  for (const level of CORE.SUPPORTED_LEVELS) {
      const category = "literacy";
      const game = CORE.composeGame(BANK, [], seeded(300), { level, categories: [category] });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15);
      assert.equal(new Set(game.map(CORE.questionFingerprint)).size, 15, `${level}/${category} must not repeat a pupil-facing question.`);
      assert.ok(game.every((question) => question.level === level && question.category === category));
      assert.deepEqual(game.map((question) => question.difficulty), [
        ...Array(5).fill("easy"), ...Array(5).fill("medium"), ...Array(5).fill("hard"),
      ]);
  }
});

test("unavailable question types fail safely instead of creating placeholders", () => {
  assert.throws(() => CORE.composeGame(BANK, [], seeded(400), { level: "N3", categories: ["listening"] }), /question pool is empty/);
  assert.throws(() => CORE.composeGame(BANK, [], seeded(401), { level: "N3", categories: ["concepts"] }), /question pool is empty/);
});

test("invalid, empty and incomplete pools fail safely without crossing level or difficulty", () => {
    const tooSmall = BANK.filter((question) => !(question.level === "AH" && question.difficulty === "easy" && question.category === "literacy"))
      .concat(BANK.pools.AH.easy.literacy[0]);
    assert.throws(() => CORE.composeGame(tooSmall, [], seeded(9), { level: "AH", categories: ["literacy"] }), /question pools are exhausted/);

    const invalid = { ...BANK[0], id: "broken", answers: BANK[0].answers.slice(0, 3) };
    const validGame = CORE.composeGame([...BANK, invalid], [], seeded(8), { level: "N3", categories: ["literacy"] });
    assert.ok(!validGame.some((question) => question.id === "broken"));
});

test("50:50 keeps the correct answer and one distractor after shuffling", () => {
  const source = BANK[0];
  const shuffled = CORE.shuffledQuestion(source, "D", seeded(4));
  const removed = CORE.fiftyFifty(shuffled, seeded(5));
  assert.equal(removed.length, 2);
  assert.ok(!removed.includes(shuffled.correctLetter));
  assert.equal(shuffled.answers.filter((answer) => !removed.includes(answer.letter)).length, 2);
});

test("Switch replaces the current question with an unused question valid for the same stage", () => {
  const game = CORE.composeGame(BANK, [], seeded(44));
  const stage = 7;
  const replacement = CORE.switchQuestion(BANK, game, stage, "N3", seeded(45));
  assert.ok(replacement);
  assert.ok(!game.some((question) => question.id === replacement.id));
  assert.ok(!game.some((question) => CORE.questionFingerprint(question) === CORE.questionFingerprint(replacement)));
  assert.ok(replacement.difficultyMin <= stage && replacement.difficultyMax >= stage);
  assert.equal(replacement.level, "N3");
  assert.equal(replacement.answers.length, 4);
  assert.equal(replacement.answers.find((answer) => answer.letter === replacement.correctLetter).originalId, replacement.correctAnswer);
});

test("Switch keeps a replacement within the selected question type", () => {
  const category = "literacy";
  const categoryBank = BANK.filter((question) => question.category === category);
  const game = CORE.composeGame(categoryBank, [], seeded(500), { categories: [category] });
  const stage = 15;
  const replacement = CORE.switchQuestion(categoryBank, game, stage, "N3", seeded(501));
  assert.ok(replacement);
  assert.equal(replacement.category, category);
  assert.notEqual(replacement.id, game[stage - 1].id);
  assert.notEqual(replacement.id, game[stage - 1].id);
});

test("prize and guaranteed milestone calculations are exact", () => {
  assert.deepEqual(CORE.PRIZE_LADDER, [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]);
  assert.equal(CORE.guaranteedPrize(0), 0);
  assert.equal(CORE.guaranteedPrize(4), 0);
  assert.equal(CORE.guaranteedPrize(5), 1000);
  assert.equal(CORE.guaranteedPrize(9), 1000);
  assert.equal(CORE.guaranteedPrize(10), 32000);
  assert.equal(CORE.guaranteedPrize(15), 32000);
});

test("category results count only attempted records", () => {
  const summary = CORE.categoryResults([
    { category: "listening", correct: true },
    { category: "listening", correct: false },
    { category: "literacy", correct: true },
  ]);
  assert.deepEqual(summary, {
    listening: { correct: 1, attempted: 2 },
    literacy: { correct: 1, attempted: 1 },
    concepts: { correct: 0, attempted: 0 },
  });
});

test("interface includes the required screens, controls and protections", () => {
  const script = fs.readFileSync(path.join(__dirname, "millionaire.js"), "utf8");
  const coreScript = fs.readFileSync(path.join(__dirname, "millionaire-core.js"), "utf8");
  const bankScript = fs.readFileSync(path.join(__dirname, "millionaire-question-bank.js"), "utf8");
  const html = fs.readFileSync(path.join(__dirname, "millionaire.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "millionaire.css"), "utf8");
  const menuScript = fs.readFileSync(path.join(__dirname, "hub-menu.js"), "utf8");
  ["50:50", "Hint", "Switch", "Final Answer", "aria-live", "role=\"dialog\""].forEach((required) => {
    assert.ok(script.includes(required) || html.includes(required), `Missing ${required}`);
  });
  assert.ok(!script.includes("Walk Away"), "Walk Away option should not be shown");
  assert.ok(!script.includes("requestWalkAway"), "Walk Away behaviour should be removed");
  assert.ok(!script.includes("Return to Hub"), "Return to Hub option should not be shown on the results screen");
  assert.ok(!script.includes("Review Answers"), "Review Answers option should not be shown on the results screen");
  assert.ok(script.includes('const [screen, setScreen] = useState("title");'), "A refreshed page should initialise on the title screen.");
  assert.ok(script.includes('["title", "rules", "results"].includes(screen)) audioDirector.current.playOpening();'), "Opening-menu audio should start when the Review screen opens.");
  assert.ok(script.includes('const [hintVisible, setHintVisible] = useState(false);'), "Hint visibility should be managed inside the question screen.");
  assert.ok(script.includes('setHintVisible(true);') && script.includes('setAnnouncement(`Hint: ${question.tip}`);'), "Using Hint should reveal and announce the in-page clue.");
  assert.ok(script.includes('{hintVisible && <div className="millionaire-inline-hint" role="note"><strong>Hint</strong><span><HintText question={question} /></span></div>}'), "The hint should appear at the top of the question panel.");
  assert.ok(script.includes("question.tipEmphasis") && script.includes("<b>{emphasised}</b>"), "Hints should safely support a bold emphasis segment without interpreting arbitrary HTML.");
  assert.ok(script.includes('const ranOutOfTime = revealed === "incorrect" && settings.timer && !selectedLetter;') && script.includes('{ranOutOfTime ? "You ran out of time" : "Incorrect answer"}'), "Timer expiry should show a distinct message while submitted wrong answers retain the normal incorrect-answer heading.");
  assert.match(script, /async function handleTimerExpired\(\)[\s\S]*?await handleIncorrectAnswer\(record\);\s*audioDirector\.current\.stopMusic\(\);/, "Timer expiry should let the incorrect-answer sound finish and then stop the background music.");
  assert.ok(!script.includes('dialog?.type === "hint"'), "Hint should not use a popover dialog.");
  assert.match(script, /function resetQuestionState\(\)\s*\{[^}]*setHintVisible\(false\);/s, "Changing questions should hide the current hint.");
  assert.match(script, /function lockAnswer\(\)\s*\{[^}]*setHintVisible\(false\);/s, "Answering should hide the current hint.");
  assert.ok(script.includes("Earn awards for correctly answering the following questions:"));
  assert.ok(!script.includes('className="millionaire-rewards-heading"'), "The redundant Rewards heading should be removed.");
  assert.ok(script.includes('onClick={() => setScreen("title")}><span className="millionaire-back-button-label">Back</span></button>'), "The rules button should show Back in title case.");
  assert.ok(!script.includes('className="millionaire-back-icon"'), "The rules Back button should not show an icon.");
  assert.ok(html.includes("bravura-symbols.js") && html.includes("shared-notation-config.js"), "Millionaire notation should use the shared Bravura symbols and notation settings.");
  assert.ok(html.includes("millionaire.css?v=20260721-literacy-only") && html.includes("millionaire-core.js?v=20260721-literacy-only") && html.includes("millionaire-question-bank.js?v=20260721-literacy-only") && html.includes("millionaire.js?v=20260721-literacy-only"), "The Millionaire files should use current cache-version tags.");
  assert.ok(!css.includes('background-lossless.webp'), "The menu, How to Play and Review screens should use the built-in Millionaire background rather than a separate picture.");
  assert.ok(css.includes('.millionaire-opening-copy { max-width: none; font-size: 24px; text-shadow: 0 2px 5px rgba(0,0,0,.85);'), "The main-menu introduction should have a restrained shadow for contrast over the artwork.");
  assert.ok(bankScript.includes("staveInset:20, notationZoom:1.15") && script.includes("const left = 52 + staveInset;") && script.includes("const fullRight = 462 - staveInset;") && css.includes(".millionaire-staff.is-enharmonic-focus { transform: scale(1.15);"), "Advanced Higher enharmonic notation should shorten the stave by 20px per side and enlarge it by 15%.");
  assert.ok(script.includes("const firstX = 230, secondX = 300;") && script.includes("const arrowY = outerY + 7;") && script.includes('transform={`rotate(-90 ${arrowCentreX} ${arrowY+arrowSize/2})`}') && script.includes('stroke="url(#millionaire-tie-staff-fade)"'), "The tied notes, tie and upward arrow should share the requested placement, with the stave fading on the right.");
  assert.ok(css.includes(".millionaire-tie-callout { display: block; width: 100%; height: auto; overflow: visible; transform: scale(1.15); transform-origin: center; }"), "The AH tie example should be enlarged by 15% without changing its notation container.");
  assert.ok(coreScript.includes("withinGameLimit(question, groupCounts)") && coreScript.includes("addToGameLimit(choice, groupCounts)"), "Game composition and Switch should enforce per-game question-group limits.");
  assert.ok(script.includes('if (screen === "results" && outcome === "won") audioDirector.current.pauseMusic();') && script.includes('const preserveMillionWinAudio = finalOutcome === "won" && prize === 1000000;') && script.includes('if (!preserveMillionWinAudio) audioDirector.current.stopEffect();'), "A £1 million win should keep its correct-answer audio through Review and defer menu music until Exit.");
  assert.ok(script.includes('valueClassName="millionaire-result-amount"') && script.includes('className="millionaire-result-previous-amount"') && !css.includes('.millionaire-result-stat strong.millionaire-result-amount') && !css.includes('.millionaire-result-previous-amount {'), "The current and previous-best Amount values should inherit the same interface font as the other result values.");
  assert.ok(script.includes("const width=920, height=430, gap=10, trebleTop=112, bassTop=220") && script.includes("const left=255, right=665, keyX=left+68, noteX=width/2") && css.includes(".millionaire-ah-grand-staff { display: block; width: 100%; height: auto; overflow: visible; transform: translateY(19px) scale(2.06640625);") && script.includes("The Roman numeral is omitted because identifying it is the question"), "Advanced Higher chord and bass-note scores should share the shortened and enlarged grand-stave geometry, positioned 15px lower.");
  assert.ok(script.includes("function AHIntervalNotation({ notation })") && script.includes("const width=920, height=420, left=222, right=684, top=132, gap=21") && script.includes("const noteXs=[392,536]") && script.includes('viewBox={`195 96 ${width/1.806} ${height/1.806}`}'), "Advanced Higher tritones should reuse intervals.html score geometry while leaving enough room for the complete treble clef.");
  assert.ok(css.includes(".millionaire-ah-interval { display: block; width: 100%; height: auto; overflow: hidden; transform: translateY(40px);"), "The cropped Advanced Higher interval score should remain clipped and sit a further 15px lower in its notation container.");
  assert.ok(script.includes('const selectedBassNote = recordQuestion.notation?.kind === "ahBassPrompt" ? selectedBarAnswer?.text || null : null;') && script.includes('showBassNote={Boolean(selectedBassNote)}') && script.includes("function ahSelectedBassNotation(answerText, keySignature)"), "Selecting a bass-note answer should preview the correctly spelled note on the bass stave.");
  assert.ok(script.includes("function timeSigBarNotePositions(notes, groupAfterBeats = null)") && script.includes("function restsBarNotePositions(items, groupAfterBeats = null)"), "5/4 note and rest bars should support a visible three-plus-two group gap.");
  assert.ok(script.includes("const missingTargetX = positions[index] + 10;") && script.includes("<HigherRestMark rest={selectedRest} x={missingTargetX}"), "The Advanced Higher missing-rest target and selected rest should sit 10px farther right.");
  assert.ok(script.includes("function normaliseFiveFourRhythmTokens(notation)") && script.includes('signature === "minim|minim|crotchet"') && script.includes('notation.timeSignature === "5/4" ? 3'), "Legacy 5/4 questions should be normalised to a valid 3+2 grouping before rendering.");
  assert.ok(script.includes('if (rest === "semibreve-rest") return "wholeRest";') && script.includes('<CalibratedNotationSymbol symbolKey={higherRestSymbolKey(rest)} x={x} y={y} gap={gap} />'), "Whole rests placed on a stave should use the shared calibration that hangs them from the fourth line.");
  assert.ok(script.includes("function TieCalloutNotation") && script.includes("const tiePath =") && script.includes('href="next.svg"'), "AH tie questions should use the Missing Notes tie geometry and the shared next.svg arrow.");
  assert.match(script, /function TieCalloutNotation[\s\S]*?for \(let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2\)[\s\S]*?ledgerSteps\.map/, "Tie notes outside the stave should draw the required calibrated ledger lines.");
  assert.ok(script.includes('openingZooming ? "is-opening-zoom" : ""') && script.includes("function beginPreparedGame(nextQuestions, keepOpeningZoom = false)") && script.includes("}, 1600);"), "Starting the game should zoom through the centre of the opening logo, then complete the slower white-light reveal before showing Question 1.");
  assert.ok(script.includes('settings.reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches') && script.includes("beginPreparedGame(nextQuestions);"), "The opening zoom should be skipped when reduced motion is enabled.");
  assert.ok(css.includes("@keyframes millionaireOpeningLogoZoom") && css.includes("transform: scale(18)") && css.includes("transform-origin: center") && !css.includes("72% { opacity: 1; transform: scale(5.5); }"), "The opening logo should use one uninterrupted, centred camera-style zoom.");
  assert.match(css, /\.millionaire-opening-screen\.is-opening-zoom\s*\{[^}]*background:\s*#020617;/s, "The opening zoom should have an opaque backing so the prepared question cannot show through the logo.");
  assert.match(script, /function startGame\(\)[\s\S]*audioDirector\.current\.startGame\(\);[\s\S]*window\.setTimeout/, "The Start click should begin audio before the delayed screen change so browser autoplay protection does not block it.");
  assert.match(script, /function toggleGameAudio\(\)[\s\S]*audioDirector\.current\.configure\(nextSettings\);[\s\S]*setSettings\(nextSettings\);/, "Turning audio on should request playback synchronously inside the pupil's click.");
  assert.match(script, /function startGame\(\)[\s\S]*audioDirector\.current\.configure\(settings\);[\s\S]*audioDirector\.current\.startGame\(\);/, "Starting should synchronously apply the current sound settings before requesting the opening game audio.");
  assert.ok(script.includes('src="millionairelogo new.svg"') && script.includes("{openingZooming && TitleScreen()}"), "The transparent-hole logo should zoom above the already-rendered game screen.");
  assert.ok(script.includes('className="millionaire-opening-logo-stage"') && script.includes('className="millionaire-opening-logo-backlight"') && script.includes("openingLightRayLengths") && script.includes('className="millionaire-opening-logo-ray"') && css.includes("@keyframes millionaireOpeningCentreLight") && css.includes("@keyframes millionaireOpeningRaysRotate") && css.includes(".millionaire-opening-logo-backlight { position: absolute; z-index: 2; left: 50%; top: 50%;") && css.includes(".millionaire-opening-logo-ray::before") && css.includes("height: var(--ray-length, 68%)") && css.includes("transparent 95%, transparent 100%") && css.includes("millionaireOpeningRaysRotate 96s") && css.includes(".is-opening-zoom .millionaire-opening-logo-stage"), "Separate, differently sized light beams should clear the logo ring, then fade completely before their individual ends while rotating slowly with the logo.");
  assert.ok(script.includes('className="millionaire-opening-flash"') && css.includes("background: #fff") && css.includes("animation: millionaireOpeningFlashReveal 1600ms") && css.includes("@keyframes millionaireOpeningFlashReveal") && css.includes("42% { opacity: 1; }") && css.includes("52% { opacity: 1; }") && css.includes("100% { opacity: 0; }"), "The completed logo zoom should fill the board with pure white, hold briefly, then fade slowly to reveal the prepared game.");
  assert.ok(css.includes("animation: millionaireOpeningLayerHide 1600ms steps(1, end) both") && css.includes("@keyframes millionaireOpeningLayerHide") && css.includes("42%, 100% { visibility: hidden; }"), "The enlarged logo layer should disappear behind full white before that white fades directly over the prepared game.");
  assert.ok(script.includes("beginPreparedGame(nextQuestions, true);") && script.includes("setOpeningZooming(false);"), "The game should be prepared behind the transparent logo and the overlay should disappear after the zoom.");
  assert.ok(!script.includes(".ogg") && script.includes("opening menu.mp3") && script.includes("62 $1,000,000 Win.mp3"), "All Millionaire programme audio should use browser-compatible MP3 files.");
  assert.ok(script.includes("function CalibratedNotationSymbol") && script.includes("SHARED_NOTATION.stave?.lineGap") && script.includes("sharedNotationSymbol(symbolKey)"), "Stave notation should directly use the shared Practice Questions calibration settings.");
  assert.ok(script.includes('viewBox="30 10 440 130"') && script.includes('millionaire-staff-line-fade') && script.includes('2: 225'), "Note staves should use the enlarged, centre-focused Note Identification presentation with fading staff lines.");
  assert.ok(script.includes('const accidentalXOffset = Number(notation.accidentalXOffset || 0);') && script.includes('x={x - staffGap * 1.65 + accidentalXOffset + ledgerAccidentalXOffset}'), "Staff notation should honour question-specific and ledger-line accidental offsets.");
  assert.ok(script.includes('const ledgerAccidentalXOffset = position <= 0 || position >= 12 ? -10 : 0;') && script.includes('accidentalXOffset + ledgerAccidentalXOffset'), "Accidentals beside ledger-line notes should move an additional ten pixels left.");
  const keySignatureRenderer = script.match(/function KeySignatureNotation\(\{ notation \}\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(keySignatureRenderer.includes("<SignatureMarks") && !keySignatureRenderer.includes("millionaire-complete-barline"), "Key-signature questions should not show a trailing barline.");
  assert.ok(keySignatureRenderer.includes("startX={130}"), "Standalone key-signature accidentals should move ten pixels further left.");
  assert.ok(css.includes(".millionaire-key-signature { transform: scale(1.1); transform-origin: center center; }"), "Key-signature questions at every level should be enlarged by ten percent while remaining centred.");
  assert.ok(script.includes('function SignatureMarks({ signature, top, bottom, gap, startX = 140, clef = "treble" })'), "Key-signature accidentals should retain their established horizontal position and support both clefs.");
  assert.match(script, /function SignatureMarks[\s\S]*?symbolKey=\{accidentalSymbolKey\(mark\.accidental, "keySignature"\)\}[\s\S]*?gap=\{gap\}\s*\/>;/, "Key-signature accidentals should retain the shared calibrated size used by Key Signatures.");
  assert.ok(script.includes('if (notation.matchStepLeapLayout) return <StaffNotation notation={{ ...notation, kind: "melody" }} whatNoteQuestion={true} />;'), "National 5 intervals should reuse the complete National 3 step/leap stave renderer.");
  assert.ok(script.includes('y={bassClef ? bottom - staffGap * 3 : bottom - staffGap}'), "Bass clefs should use the same second-line anchor as Note Identification.");
  assert.ok(script.includes('sharedNotationSymbol(phrase ? "phraseMarking" : (firstStemDown ? "slurStemDown" : "slurStemUp"))'), "Slurs and phrase marks should use the calibrated curve settings from Articulation Markings.");
  assert.ok(script.includes('notation.marking === "phrase" && [213, 296, 379].map') && script.includes('{ x: 154, position: 3 }') && script.includes('{ x: 439, position: 2 }') && script.includes('x1="457" x2="457"') && script.includes('x1="462" x2="462"'), "Phrase-mark questions should render four bars with two notes per bar, internal barlines and a final double barline.");
  assert.ok(script.includes('settingOverrides={{ opticalYOffset: firstStemDown ? 1 : -5 }}') && script.includes('settingOverrides={{ opticalYOffset: firstStemDown ? 2 : -6 }}'), "Accents and staccato marks should use the calibrated Articulation Markings offsets.");
  assert.ok(script.includes('rest === "semibreve-rest" ? "\\uE4F4"') && script.includes('["minim-rest", "dotted-minim-rest"].includes(rest) ? "\\uE4F5"'), "Higher semibreve, minim and dotted-minim rests should use the exact Bravura rest glyphs from Rests.");
  const higherRestRenderer = script.match(/function HigherRestNotation\(\{ notation \}\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(higherRestRenderer.includes('<HigherRhythmSumsRest rest={notation.rest} x={42} systemTop={12} />') && !higherRestRenderer.includes('symbolKey="gClef"'), "Standalone rest questions should be centred and shown without a treble clef.");
  assert.ok(higherRestRenderer.includes('notation.rest === "crotchet-rest" ? 5 : notation.rest === "dotted-crotchet-rest" ? 10 : 0'), "The standalone crotchet rest should sit twenty pixels above its previous position while the dotted crotchet rest keeps its independent adjustment.");
  const higherRestSumRenderer = script.match(/function HigherRestSumNotation\(\{ notation \}\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(higherRestSumRenderer && !higherRestSumRenderer.includes('symbolKey="gClef"'), "Note-and-rest sums should not show a treble clef.");
  const higherTripletRenderer = script.match(/function HigherTripletNotation\(\{ notation \}\)\s*\{[\s\S]*?\n\}/)?.[0] || "";
  assert.ok(higherTripletRenderer && !higherTripletRenderer.includes('symbolKey="gClef"') && !higherTripletRenderer.includes("millionaire-staff-line") && higherTripletRenderer.includes('transform="translate(-8,-4) scale(1.25)"') && higherTripletRenderer.includes('fontFamily="serif"'), "Higher triplets should reuse the standalone triplet appearance from triplets.html without a stave or treble clef.");
  assert.ok(higherTripletRenderer.includes('x1="39.3" x2="95.3"') && higherTripletRenderer.includes('fontSize="11"'), "The quaver-triplet beam should extend one pixel at both ends and its numeral should be half size.");
  assert.ok(script.includes("function higherRestBarItems(notation)") && script.includes("const groups = timeSigQuaverGroups(items);") && script.includes("<RestsPreviewBeam"), "Missing-rest bars should use the rhythm-token expansion and beaming rules from Rests.");
  assert.ok(script.includes('const digitGlyphs = (value) => String(value).split("")'), "Multi-digit time signatures such as 12/8 should render every digit.");
  assert.ok(script.includes("const noteXs = [260 + noteXOffset, 345 + noteXOffset];") && script.includes("startX={140 + keySignatureXOffset}") && css.includes(".millionaire-interval.is-tone-semitone-interval { transform: scale(1.25);"), "Tone-and-semitone interval notation should shift its notes and key signature left and zoom in by twenty-five percent.");
  assert.ok(script.includes('const y2 = timeSigBeamLineYAtX(x2, beamData.start, beamData.end) + 7;'), "Secondary semiquaver beams and hooks should follow the slope of the primary beam.");
  assert.ok(script.includes("const N5_SIMPLE_TIME_PATTERNS") && script.includes('Math.random() < .16 ? semiquaverPatterns : regularPatterns'), "National 5 time-signature questions should select rhythms from the Timesig simple-time pool.");
  assert.ok(script.includes('const isDottedPair = rhythms.length === 2 && rhythms[0] === "dotted-quaver" && rhythms[1] === "semiquaver";') && script.includes('const spacing = isDottedPair ? 30 : rhythms.length >= 4 ? 24 : 26;'), "Dotted-quaver and semiquaver groups should use the Rhythm Sums spacing.");
  assert.ok(script.includes('scale={terms.length === 1 ? 1.14 : .9}') && css.includes('.millionaire-rhythmsums.is-single-term .millionaire-rhythmsums-glyph { width: 128px; height: 112px; }') && css.includes('.millionaire-rhythmsums.is-single-term .millionaire-rhythmsums-glyph.is-beamed { width: 160px; height: 112px; }'), "Single-rhythm questions should use the zoom and SVG sizes from Rhythm Sums.");
  assert.ok(script.includes('rhythm === "dottedQuaverSemiquaver" ? " is-dotted-quaver-semiquaver"') && css.includes('.millionaire-rhythmsums.is-single-term .millionaire-rhythmsums-slot.is-dotted-quaver-semiquaver { transform: translate(18px, 10px); }'), "The standalone dotted-quaver and semiquaver figure should use its requested optical position.");
  assert.ok(script.includes('rhythm === "scotchSnap" ? " is-scotch-snap"') && css.includes('.millionaire-rhythmsums.is-single-term .millionaire-rhythmsums-slot.is-scotch-snap { transform: translate(25px, -5px); }'), "The standalone Scotch snap should match the dotted crotchet's optical size and position.");
  assert.ok(script.includes("function N5ChordOutlineNotation") && script.includes("const noteXs = [338, 458, 578];") && script.includes("scale(1.5)"), "National 5 chord questions should use the score layout from Chords.");
  assert.ok(script.includes('targetQuestion?.concept === "chord-identification"') && script.includes("CORE.shuffle(notation.pitches || [], Math.random)") && script.includes('["crotchet", "crotchet", "minim"]'), "National 5 chord questions should shuffle the chord tones and rhythm patterns like Chords.");
  assert.ok(css.includes('.millionaire-n5-chord-outline { display: block; width: 100%; height: auto; overflow: visible; transform: translateY(15px) scale(1.61);'), "National 5 chord notation should be enlarged by a further fifteen percent and moved down fifteen pixels.");
  assert.ok(script.includes("function InlineNotationGlyph") && script.includes('const isDottedNote = isDottedMinim || ["dottedQuarterNote", "dottedEighthNote"].includes(glyph);'), "Standalone dotted notes should use the large symbol renderer with clear dot spacing.");
  assert.ok(script.includes('settingOverrides={{ fontSizeScale: 3.3, xOffsetScale: 0 }}'), "The standalone natural sign should cancel the in-score horizontal offset and remain centred.");
  assert.ok(script.includes("function DynamicNotationGlyph") && script.includes('dynamic === "diminuendo"') && script.includes('strokeWidth="2.4"'), "Dynamic hairpins should use the clear two-line treatment from Dynamics.");
  assert.ok(script.includes("function FinalBarlineNotation") && script.includes('symbolKey="barlineFinal"'), "Double-barline questions should use the calibrated shared Bravura end-barline from Barlines.");
  assert.ok(script.includes("function CompleteBarNotation") && script.includes("function RestsFirstBarNotation") && script.includes('fill="none" stroke="#78716c"'), "Complete-bar questions should use the shared-score style with a clear note-value target.");
  assert.ok(script.includes("function AnswerRhythmGlyph") && script.includes("RHYTHM_ANSWER_VALUES"), "Complete-bar answer choices should be displayed as Bravura note-value glyphs.");
  assert.ok(script.includes('const answerYOffset = rest === "semibreve-rest" ? -1 : rest === "quaver-rest" ? 2 : 7;'), "Semibreve-rest and quaver-rest answer glyphs should retain their separate vertical adjustments.");
  assert.ok(script.includes("function StandaloneTimeSignature") && script.includes('<BarTimeSignature time={[notation.top, notation.bottom]}'), "Standalone time signatures should use the calibrated shared score renderer.");
  assert.match(css, /\.millionaire-dotted-note\s*\{[^}]*font-weight:\s*400;[^}]*letter-spacing:\s*10px;/s, "Dotted minim notation should use regular weight and a clearly separated augmentation dot.");
  assert.ok(html.includes("hub-shell.js"));
  assert.ok(html.includes("footer.js"));
  assert.ok(script.includes("<window.MLH.LevelButton"));
  [
    'N3: { label: "National 3" }',
    'N4: { label: "National 4" }',
    'N5: { label: "National 5" }',
    'H: { label: "Higher" }',
    'AH: { label: "Advanced Higher" }',
  ].forEach((level) => assert.ok(script.includes(level), `Missing selectable level: ${level}`));
  assert.ok(script.includes("activeLevel={settings.level}") && script.includes("activeLabel={activeLevelLabel}"), "The Level menu should show the selected course level.");
  assert.ok(script.includes("const categories = settings.questionTypes;") && script.includes("level: settings.level, categories"), "New games should use the selected course level and available question types.");
  assert.ok(script.includes('profileLabel={activeLevelLabel}'), "The page header should reflect the selected course level.");
  assert.ok(script.includes("CORE.validateQuestionPools(QUESTION_POOLS)") && script.includes("CORE.questionPoolSummary(QUESTION_POOLS)"), "Development checks should validate and summarise all 45 pools.");
  assert.ok(script.includes('${dynamic ? " has-dynamic-answer" : ""}${rest ? " has-rest-answer" : ""}') && css.includes('.millionaire-answer-content.has-dynamic-answer .millionaire-answer-dynamic { position: absolute; left: 50%; top: calc(50% - 3px); width: 76px;'), "Dynamic symbols should be horizontally centred and sit three pixels above the answer centre independently of the answer letter and diamond.");
  assert.ok(css.includes('.millionaire-answer-content.has-rest-answer .millionaire-answer-rhythm { position: absolute; left: 50%; top: 50%; width: 76px;'), "Rest symbols should be centred independently of the answer letter and diamond.");
  assert.ok(script.includes('rest === "semibreve-rest" ? -1 : rest === "quaver-rest" ? 2 : 7'), "Only the quaver-rest answer glyph should move five pixels upward from the standard rest-answer position.");
  assert.ok(!script.includes("Audio file not yet added."), "Temporary audio placeholder text should not remain in the interface.");
  assert.ok(!script.includes("<window.MLH.HelpButton"), "The toolbar Help button should not be shown.");
  assert.ok(!script.includes('label="Reduced motion"'), "The manual Reduced motion setting should not be shown.");
  assert.ok(!script.includes("Listening plays: 3 maximum"), "The listening-play information row should not be shown in Customise.");
  assert.ok(!script.includes("Full screen"), "The Full screen action should not be shown in Customise.");
  assert.ok(!script.includes("Reset recent-question history"), "The question-history reset action should not be shown in Customise.");
  assert.ok(!script.includes("Reset settings to default"), "The settings reset action should not be shown in Customise.");
  assert.ok(script.includes('title="Who Wants to Be a Millionaire?"'), "The page header should include the title question mark.");
  assert.ok(script.includes("<em>Who Wants to Be a Millionaire?</em>"), "The disclaimer should italicise the complete programme title and question mark.");
  assert.ok(script.includes('src="millionairelogo new.svg"'), "The opening screen should use the transparent-hole Millionaire logo.");
  assert.ok(script.includes('<span className="millionaire-opening-play-label">How to Play</span>'), "The opening screen should include a How to Play button.");
  assert.ok(script.includes('<span className="millionaire-opening-play-label">Start</span>'), "The opening button should read Start.");
  assert.ok(script.indexOf('>Rules</span>') < script.indexOf('>Start</span>'), "Rules should appear to the left of Start.");
  assert.ok(script.includes('onClick={startGame}><span className="millionaire-opening-play-label">Start</span>'), "Start should begin the game immediately.");
  assert.ok(script.includes('if (screen === "rules") return RulesScreen();'), "Rules should open in a separate panel without remounting the active screen renderer.");
  assert.ok(!script.includes('screen === "setup"'), "The old setup step should be removed.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">National 3 prototype</span>'), "The rules panel should not show the prototype label.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">Game rules</span>'), "The rules panel should not show a Game rules badge.");
  assert.match(css, /\.millionaire-notation\s*\{[^}]*width:\s*min\(460px, calc\(100% - 40px\)\);[^}]*min-height:\s*180px;[^}]*place-items:\s*center;[^}]*background:\s*#fff;/s, "Notation should use a large white panel with centred content.");
  assert.match(css, /\.millionaire-glyphs > span:not\(\.millionaire-glyph-blank\)\s*\{[^}]*transform:\s*translateY\(22px\);/s, "Bravura glyph ink should be optically centred within the notation panel.");
  assert.ok(script.includes("<h2>How to Play</h2>"), "The instructions panel heading should match the How to Play button.");
  assert.ok(script.includes('className="millionaire-screen millionaire-rules-screen"'), "The How to Play screen should have a dedicated fixed-height layout class.");
  assert.match(css, /\.millionaire-rules-screen\s*\{[^}]*height:\s*670px;[^}]*max-height:\s*670px;/s, "The How to Play screen should not make the game container taller.");
  assert.ok(!script.includes("Answer 15 increasingly challenging questions to climb the prize ladder and win £1 million."), "The rules panel should not repeat the game objective.");
  assert.ok(!script.includes("millionaire-setup-grid"), "The question-type breakdown should be removed.");
  ["Answer 15 music questions which progressively get more challenging.", "Each question is multiple choice with four possible answers."].forEach((rule) => assert.ok(script.includes(rule), `Missing rules guidance: ${rule}`));
  assert.ok(script.includes('<div className="millionaire-game-rules-copy millionaire-lifeline-intro"><p>If you get stuck on a question, you can use a lifeline:</p></div>'), "The Lifelines introduction should lead into the choices with a colon.");
  ["Choose and confirm:", "Milestones:", "Listening questions:"].forEach((oldRule) => assert.ok(!script.includes(oldRule), `Old rules guidance should be removed: ${oldRule}`));
  ['icon: "bronze.svg", label: "Bronze medal", tier: "bronze"', 'icon: "silver.svg", label: "Silver medal", tier: "silver"', 'icon: "gold.svg", label: "Gold medal", tier: "gold"', 'icon: "diamond.svg", label: "Diamond", tier: "diamond"'].forEach((reward) => assert.ok(script.includes(reward), `Missing reward details: ${reward}`));
  ["bronzehighres.svg", "silverhighres.svg", "goldhighres.svg", "diamondhighres.svg"].forEach((icon) => assert.ok(script.includes(`celebrationIcon: "${icon}"`), `Missing high-resolution celebration medal: ${icon}`));
  assert.ok(script.includes('className="millionaire-milestone-medal" src={reward.celebrationIcon}'), "The centre celebration should use the high-resolution medal artwork.");
  assert.ok(script.includes('className="millionaire-milestone-shine"') && script.includes('"--millionaire-medal-mask"'), "Every high-resolution milestone medal should receive a masked shine overlay.");
  assert.match(css, /\.millionaire-milestone-shine::after\s*\{[^}]*millionaireLifelineShine 3\.8s/s, "Milestone medals should use the same repeating shine animation as lifelines.");
  assert.ok(script.includes("[15, 10, 5, 3].map"), "Rules should list rewards for Questions 15, 10, 5 and 3.");
  assert.ok(script.includes('className="millionaire-reward-icon" src={QUESTION_REWARDS[stage].icon}'), "Rules rewards should use the supplied SVG medal artwork.");
  assert.ok(script.includes('className={`millionaire-reward-label is-${QUESTION_REWARDS[stage].tier}`}>Question {stage}</span>'), "Reward rows should show each medal directly beside its full Question label.");
  assert.ok(!script.includes('millionaire-reward-diamond'), "Reward rows should not include a diamond between the medal and Question label.");
  assert.ok(script.includes('if (reward && stage !== 3) classes.push("is-reward");') && script.includes('className="millionaire-prize-reward" src={reward.icon} alt={reward.label}'), "Question 3 should remain a normal gold ladder row while retaining its Bronze medal icon.");
  assert.ok(script.includes('earnedReward ? <MilestoneCelebration reward={earnedReward} />'), "A correctly earned milestone should replace the question media with its medal celebration.");
  assert.ok(script.includes('className="millionaire-milestone-amount"'), "A correctly earned milestone should show its prize with a diamond on either side in the question bar.");
  assert.match(css, /\.millionaire-milestone-amount\s*\{[^}]*font-size:\s*clamp\(32px, 3\.2vw, 42px\);[^}]*line-height:\s*1;/s, "The milestone amount should be larger while remaining centred in the question bar.");
  assert.ok(script.includes('className={showWonAmount ? "is-milestone-amount" : undefined}'), "Every won amount should receive the special money styling.");
  assert.ok(script.includes('const showWonAmount = revealed === "correct";') && script.includes('{showWonAmount ? <span className="millionaire-milestone-amount"'), "Every correct answer should replace the question wording with the styled amount won.");
  assert.match(css, /\.millionaire-question-bar h2\.is-milestone-amount\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*none;[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold", serif;/s, "Milestone money should be precisely centred and use the prize-ladder Gothic font.");
  assert.match(css, /\.millionaire-milestone-amount\s*\{[^}]*display:\s*flex;[^}]*width:\s*100%;[^}]*justify-content:\s*center;/s, "The complete milestone amount and both diamonds should be centred as one group.");
  assert.ok(script.includes("if (screen === \"game\") return GameScreen();") && script.includes("{CurrentScreen()}"), "State updates should preserve the active screen so milestone animations run once.");
  assert.ok(!script.includes("<CurrentScreen />"), "The active screen should not remount on every state update.");
  assert.match(css, /\.millionaire-confetti-piece\s*\{[^}]*millionaireConfettiBurst 1\.65s/s, "Milestone medals should trigger the confetti animation.");
  assert.match(css, /@keyframes millionaireMilestoneMedal/, "Milestone medals should animate into the question media area.");
  ['src="50.50.svg"', 'src="hint.svg"', 'src="switch.svg"'].forEach((icon) => assert.ok(script.includes(icon), `Missing lifeline rules icon: ${icon}`));
  assert.equal((script.match(/className="millionaire-lifeline-icon"/g) || []).length, 3, "All three in-game lifelines should use SVG icons.");
  ["Removes two incorrect answers.", "Guides you towards the correct answer with a hint.", "Switch your current question to a different question."].forEach((sentence) => assert.ok(!script.includes(sentence), `Lifeline guidance should not end with a full stop: ${sentence}`));
  assert.ok(script.includes("Guides you towards the correct answer with a hint"), "The Hint rules should use the requested wording.");
  assert.ok(!script.includes('className="millionaire-primary millionaire-play" onClick={startGame}>Start game</button>'), "The rules panel should not include a Start Game button.");
  assert.ok(script.includes('className="millionaire-audio-toggle"'), "The game board should include the combined audio control.");
  assert.ok(script.includes('<img src="audio-svgrepo-com.svg" alt="" aria-hidden="true" />'), "The combined audio control should use the requested audio icon.");
  assert.match(css, /\.millionaire-audio-toggle img\s*\{[^}]*filter:\s*brightness\(0\) invert\(1\);/s, "The combined audio icon should be white.");
  assert.ok(script.includes('const nextSettings = { ...settings, backgroundMusic: !enabled, soundEffects: !enabled };'), "The combined audio control should toggle music and effects together.");
  assert.ok(script.includes('const SETTINGS_KEY = "mlh-millionaire-settings-v3";'), "The settings version should apply the new defaults once.");
  assert.match(script, /const DEFAULT_SETTINGS = \{[^}]*soundEffects:\s*true,[^}]*backgroundMusic:\s*true,/s, "Sound Effects and Background Music should both default to on.");
  assert.ok(script.includes("Test your musical knowledge and climb the prize ladder to £1 million."), "The opening screen should repeat the page subtitle.");
  assert.match(css, /\.millionaire-opening-copy\s*\{[^}]*font-size:\s*24px;[^}]*white-space:\s*nowrap;/s, "The opening subtitle should be 24px and remain on one line.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*font-size:\s*30px;[^}]*line-height:\s*1;[^}]*text-transform:\s*none;/s, "Opening Rules and Start should use title case and fill their button height.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;/s, "The opening Play label should be centred inside its button.");
  assert.match(css, /\.millionaire-opening-play-label\s*\{[^}]*transform:\s*translateY\(3px\);/s, "The Conduit Play label should be shifted down for optical centring.");
  assert.ok(script.includes('<span className="millionaire-back-button-label">Back</span>'), "The rules Back button should use a separately aligned title-case label.");
  assert.match(css, /\.millionaire-back-button\s*\{[^}]*text-transform:\s*none;/s, "The Back button should preserve its title-case label.");
  assert.match(css, /\.millionaire-back-button-label\s*\{[^}]*font-size:\s*30px;[^}]*line-height:\s*1;[^}]*transform:\s*translateY\(3px\);/s, "The Back label should match the Start label and remain optically centred.");
  assert.match(css, /\.millionaire-opening-actions\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*center;/s, "Rules and Start should sit together on one row.");
  assert.ok(css.includes(".millionaire-opening-actions .millionaire-opening-play { box-shadow: 0 10px 28px rgba(0,0,0,.58); }"), "Both opening-screen buttons should cast a clear shadow without changing the sound control.");
  assert.match(css, /\.millionaire-rules-card h2\s*\{[^}]*margin-top:\s*-2px;/s, "The RULES heading should move up by 20px.");
  assert.match(css, /\.millionaire-rules-grid\s*\{[^}]*min-height:\s*320px;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s, "The rules panels should extend upward while keeping their lower alignment.");
  assert.match(css, /\.millionaire-rules-section h3\s*\{[^}]*text-align:\s*center;/s, "Both rules-panel headings should be centred.");
  assert.match(css, /\.millionaire-lifeline-rules\s*\{[^}]*flex:\s*1;[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);[^}]*align-items:\s*center;[^}]*translateY\(-15px\);/s, "The lifeline rules should use three equal columns and sit 15px higher.");
  assert.match(css, /\.millionaire-lifeline-rule-icon\s*\{[^}]*width:\s*90px;[^}]*height:\s*55px;/s, "Lifeline rules icons should stay tightly fitted to the SVG artwork.");
  assert.match(css, /\.millionaire-lifeline-rule-badge\s*\{[^}]*margin:\s*0;/s, "Lifeline badges should not introduce different vertical spacing.");
  assert.match(css, /\.millionaire-lifeline-rules li\s*\{[^}]*display:\s*grid;[^}]*height:\s*164px;[^}]*grid-template-rows:\s*55px 21px 1fr;[^}]*justify-items:\s*center;[^}]*row-gap:\s*5px;/s, "All three lifeline columns should align their icons, titles and descriptions on shared rows.");
  assert.match(css, /\.millionaire-lifeline-icon\s*\{[^}]*width:\s*104px;[^}]*object-fit:\s*contain;/s, "In-game lifeline SVG images should display without cropping.");
  assert.equal((script.match(/className="millionaire-lifeline-badge"/g) || []).length, 3, "Each in-game lifeline should have a shine wrapper.");
  assert.match(css, /\.millionaire-lifeline-badge::after\s*\{[^}]*millionaireLifelineShine 3\.8s/s, "Lifeline badges should use the shine animation.");
  assert.match(css, /\.millionaire-rules-note\s*\{[^}]*margin:\s*auto 0 0;[^}]*font-size:\s*11px;[^}]*opacity:\s*\.6;[^}]*text-align:\s*center;/s, "The one-use note should be small, translucent, centred and anchored to the panel bottom.");
  assert.ok(script.includes("Each lifeline can only be used once per game.</p>"), "The one-use note should use the requested wording.");
  assert.match(css, /\.millionaire-rewards-list li\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*gap:\s*\.25em;/s, "Reward medals and Question labels should share one centred row with one text-space between them.");
  [["diamond", "#06b6d4"], ["gold", "#eab308"], ["silver", "#64748b"], ["bronze", "#b45309"]].forEach(([tier, colour]) => assert.match(css, new RegExp(`\\.millionaire-reward-label\\.is-${tier}\\s*\\{[^}]*color:\\s*${colour};`), `${tier} reward text should use the shared medal colour.`));
  assert.match(css, /\.millionaire-rewards-list\s*\{[^}]*color:\s*#dbeafe;[^}]*font-family:\s*inherit;[^}]*font-size:\s*19px;[^}]*font-weight:\s*700;[^}]*line-height:\s*1\.3;/s, "Reward labels should use the heading font in bold at 19px.");
  assert.match(css, /\.millionaire-reward-icon\s*\{[^}]*width:\s*19px;[^}]*height:\s*19px;[^}]*object-fit:\s*contain;[^}]*translateY\(-2\.5px\);/s, "Reward SVGs should match the label size and sit 2.5px higher for optical alignment.");
  assert.match(css, /\.millionaire-reward-label\s*\{[^}]*width:\s*112px;[^}]*white-space:\s*nowrap;/s, "Each enlarged reward Question label should remain on one line.");
  assert.match(css, /\.millionaire-game-rules-copy\s*\{[^}]*font-weight:\s*400;/s, "The gameplay description should use regular text.");
  assert.match(css, /\.millionaire-lifeline-rules strong\s*\{[^}]*font-size:\s*16px;/s, "The lifeline names should be larger.");
  assert.match(css, /\.millionaire-lifeline-rules span\s*\{[^}]*font-weight:\s*400;/s, "The lifeline descriptions should use regular text.");
  assert.ok(script.includes('controls={<div className="millionaire-lifelines millionaire-ladder-lifelines"'), "The lifelines should appear above the prize-ladder questions.");
  assert.ok(!script.includes("<h2>Prize ladder</h2>"), "The prize ladder should not show a visible heading.");
  assert.ok(script.includes('className="millionaire-prize-diamond"'), "Prize rows should include a completion diamond.");
  assert.match(css, /\.millionaire-prize-row\.is-complete \.millionaire-prize-diamond, \.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*opacity:\s*1;/s, "Diamonds should show for completed and current questions only.");
  assert.match(css, /\.millionaire-prize-row\.is-current\s*\{[^}]*clip-path:\s*polygon\([^}]*filter:\s*drop-shadow/s, "The current question should use a glowing orange pointed bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-number\s*\{[^}]*color:\s*#07123d;/s, "The current prize number should use dark blue on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-value-wrap\s*\{[^}]*color:\s*#07123d;/s, "The current prize amount should use dark blue on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current\.is-reward \.millionaire-prize-number\s*\{[^}]*color:\s*#fff;/s, "The current milestone question number should stay white on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current\.is-reward \.millionaire-prize-value-wrap\s*\{[^}]*color:\s*#fff;/s, "The current milestone amount should stay white on the orange bar.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "Visible prize diamonds should always be white.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "The current prize diamond should remain white on the orange bar.");
  assert.match(css, /\.millionaire-primary\s*\{[^}]*background:\s*linear-gradient\(#ffe9a5, #e9a832\);/s, "Primary Start and Final Answer buttons should retain their original gold gradient.");
  assert.match(css, /\.millionaire-answer-letter\s*\{[^}]*color:\s*#f6c453;/s, "Answer letters should use the original gold.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*color:\s*#f6c453;/s, "Standard prize-ladder numbers and amounts should use the original gold.");
  assert.match(css, /\.millionaire-prize-row\.is-reward\s*\{[^}]*color:\s*#fff;/s, "Reward questions should use their original white text.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"ITC Conduit Pro";[^}]*Conduit ITC Bold\.otf/s, "The game font should load the local ITC Conduit Pro Bold file.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*font-family:\s*"ITC Conduit Pro",\s*sans-serif;/s, "ITC Conduit Pro should be scoped to the game window.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*box-shadow:\s*inset 0 0 80px rgba\(0,0,0,\.68\);/s, "The game window should keep only its inner shading, without a drop shadow.");
  assert.ok(css.includes(".millionaire-toolbar-wrap { padding: 10px 18px 0; }"), "Desktop toolbar spacing should match above and below the buttons.");
  assert.match(css, /\.millionaire-page-content\s*\{[^}]*max-width:\s*1152px;/s, "The game container should align with the shared 1152px header.");
  assert.ok(!script.includes("min-w-[106px]"), "The old level card should not remain in the header.");
  assert.ok(!script.includes("millionaire-question-number"), "The question counter should not be shown above the game.");
  assert.ok(!script.includes("millionaire-current-value"), "The current prize label should not be shown above the game.");
  assert.ok(!script.includes("millionaire-category-chip"), "The category and concept label should not appear above questions.");
  assert.ok(script.includes('<span className="millionaire-final-answer-label">Final Answer</span>'), "The answer action should use the title-case Final Answer label.");
  assert.ok(script.includes('onClick={resetGame}><span className="millionaire-final-answer-label">Exit</span>'), "The Review screen should offer an Exit button matching the Review action and returning to the opening screen.");
  assert.ok(!script.includes("Concepts answered incorrectly:") && !script.includes("millionaire-concept-misses"), "The Review screen should not show a separate incorrectly answered concepts panel.");
  assert.ok(!script.includes('<ResultStat label="Outcome">') && !script.includes('<ResultStat label="Correct answers">') && !script.includes('<ResultStat label="Attempted">'), "The Review summary should omit Outcome, Correct Answers and Attempted cards.");
  assert.ok(!script.includes('<ResultStat label="Audio questions">') && !script.includes('<ResultStat label="Music literacy questions">') && !script.includes('<ResultStat label="Music concept questions">'), "The Review screen should not show question-type count cards.");
  assert.ok(!script.includes("categorySummary."), "The Review screen should not calculate question-type summary counts.");
  assert.ok(script.includes('className="millionaire-result-lifelines"') && script.includes('usedLifelines.map(({ key, icon, label }) => <img'), "The Review summary should show the actual icons for used lifelines.");
  assert.ok(script.includes('label="Lifelines used"'), "The Lifelines used heading should use sentence case.");
  assert.ok(script.includes('const earnedMedalStage = [15, 10, 5, 3].find((stage) => stage <= correctCount);') && script.includes('label="Award"'), "The Review summary should identify the highest milestone award actually earned.");
  assert.ok(script.includes('{outcome === "won" && <FinalConfetti />}'), "The Review screen should continue the confetti for a £1 MILLION winner.");
  assert.ok(script.includes('<img src={earnedMedal.icon} alt={earnedMedal.label} /> : "—"') && script.includes('usedLifelines.map(({ key, icon, label }) => <img key={key} src={icon} alt={label} />) : "—"'), "Empty Medal and Lifelines Used cards should show the same long dash as other unavailable Review values.");
  assert.match(css, /\.millionaire-results-grid\s*\{[^}]*grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\);/s, "The Review cards should use a six-track grid for a balanced three-card and two-card layout.");
  assert.match(css, /\.millionaire-results-grid\s*\{[^}]*margin-top:\s*122px;/s, "The desktop Review cards should be vertically centred in the open middle area.");
  assert.ok(css.includes(".millionaire-result-stat:nth-child(-n+3) { grid-column: span 2; }") && css.includes(".millionaire-result-stat:nth-child(4) { grid-column: 2 / span 2; }") && css.includes(".millionaire-result-stat:nth-child(5) { grid-column: 4 / span 2; }"), "The two previous-record cards should sit centred beneath the three current-game cards.");
  assert.match(css, /\.millionaire-results > :not\(.millionaire-final-confetti\)\s*\{[^}]*z-index:\s*2;/s, "Review content should remain readable above winner confetti.");
  assert.ok(css.includes(".millionaire-results h2 { margin: 0; font-size: 36px; font-weight: 950; text-shadow: 0 4px 12px rgba(0,0,0,.78); }"), "The Review heading should cast a readable shadow over the menu artwork.");
  assert.ok(css.includes("box-shadow: 0 10px 26px rgba(0,0,0,.48); text-shadow: 0 2px 5px rgba(0,0,0,.72);"), "Every Review statistic card and its text should have a coordinated shadow.");
  assert.ok(css.includes(".millionaire-result-actions .millionaire-final-answer { box-shadow: 0 10px 28px rgba(0,0,0,.5), 0 8px 24px rgba(246,196,83,.24); }"), "The Review Exit button should cast a shadow while leaving the sound control unchanged.");
  assert.match(css, /\.millionaire-result-lifelines img\s*\{[^}]*width:\s*60px;[^}]*height:\s*40px;/s, "Used lifeline icons should be clearly visible in the Review summary.");
  assert.ok(!script.includes('className="millionaire-result-prize"'), "The Review prize should be shown inside the Amount card rather than above the cards.");
  assert.ok(script.includes('const reviewPrizeValue = reviewQuestionNumber ? CORE.PRIZE_LADDER[reviewQuestionNumber - 1] || 0 : 0;'), "The Review screen should show the monetary value of the highest correctly answered question.");
  assert.ok(script.includes('const reviewPrize = reviewPrizeValue === 1000000 ? "£1 Million" : CORE.formatPrize(reviewPrizeValue);') && script.includes('const previousPrize = previousPrizeValue === 1000000 ? "£1 Million" : CORE.formatPrize(previousPrizeValue);'), "Only the Review screen should show the current and previous top prize as £1 Million.");
  assert.match(script, /<ResultStat label="Question"[\s\S]*<ResultStat label="Amount"[\s\S]*<ResultStat label="Award">[\s\S]*<ResultStat label="Time"[\s\S]*<ResultStat label="Lifelines used">/, "Review should show Question, Amount and Award above Time and Lifelines used.");
  assert.ok(script.includes('Previous best: ${previousPerformance.highestQuestion') && script.includes('Previous best for ${reachedQuestionNumber}/15: ${previousQuestionBestMs'), "The Question, Amount and Time cards should include their previous best in smaller supporting text, with the Time card naming the matching score.");
  assert.match(css, /\.millionaire-result-stat small\s*\{[^}]*color:\s*#9ca3af;[^}]*font-size:\s*13px;/s, "Previous-best values should use smaller grey text inside their cards.");
  assert.ok(script.includes('const PERFORMANCE_KEY = "mlh-millionaire-performance-v1";') && script.includes("function levelPerformance(level)") && script.includes("highestQuestion: Math.max(previous.highestQuestion, completedHighestQuestion)") && script.includes("bestAmount: Math.max(previous.bestAmount, completedAmount)") && script.includes("bestTimesByQuestion: { ...previous.bestTimesByQuestion, [completedHighestQuestion]: nextQuestionBestMs }"), "Best times by question, highest question and best amount should be stored separately for each course level.");
  assert.ok(script.includes('finalOutcome === "won"') && script.includes("previous.bestWinMs == null || completedDuration < previous.bestWinMs"), "Only a faster £1 MILLION win should replace the saved best time.");
  assert.ok(script.includes('previousQuestionBestMs == null ? "—"') && script.includes('`${previousPerformance.highestQuestion} / 15`') && script.includes("previousPerformance.bestAmount"), "A first game should show no previous record, while later games should show the previous time for the same reached question, highest question and best amount.");
  assert.match(css, /\.millionaire-result-medal img\s*\{[^}]*width:\s*36px;[^}]*height:\s*36px;/s, "The highest earned medal glyph should use the requested smaller Review size.");
  assert.match(css, /\.millionaire-result-actions\s*\{[^}]*margin-top:\s*auto;[^}]*padding-top:\s*20px;/s, "The Review Exit button should remain anchored to the bottom of the game container.");
  assert.match(css, /\.millionaire-result-stat > span\s*\{[^}]*color:\s*#f6c453;[^}]*font-family:\s*inherit;[^}]*font-size:\s*21px;[^}]*font-weight:\s*700;[^}]*letter-spacing:\s*normal;[^}]*text-transform:\s*none;/s, "Review card headings should match the gold 21px rules-panel headings without uppercase styling.");
  assert.match(css, /\.millionaire-final-answer\s*\{[^}]*min-width:\s*220px;[^}]*font-size:\s*26px;[^}]*line-height:\s*1;/s, "The Final Answer label should fill its button.");
  assert.match(css, /\.millionaire-final-answer\.millionaire-audio-button\s*\{[^}]*min-width:\s*0;[^}]*gap:\s*8px;/s, "The Play and Stop button should override the Final Answer width and fit its contents.");
  assert.match(css, /\.millionaire-audio-glyph\s*\{[^}]*translateY\(3px\);/s, "The Play and Stop glyph should be optically centred with its label.");
  assert.match(css, /\.millionaire-audio-glyph\.is-stop\s*\{[^}]*font-size:\s*28px;/s, "The square Stop glyph should be large enough to balance the Play glyph.");
  assert.ok(script.includes('<span className="millionaire-audio-count">Remaining: {remaining}</span>'), "The listening counter should use the concise Remaining label.");
  assert.match(css, /\.millionaire-audio-button:disabled \.millionaire-audio-glyph\s*\{[^}]*color:\s*#6b7280;/s, "The expired Play glyph should use the same grey as its disabled label.");
  assert.ok(script.includes('className="millionaire-actions millionaire-final-answer-actions"'), "The Final Answer row should have dedicated spacing.");
  assert.match(css, /\.millionaire-final-answer-actions\s*\{[^}]*padding-top:\s*14px;/s, "The existing 14px grid gap plus 14px top padding should create 28px above Final Answer.");
  assert.match(css, /\.millionaire-final-answer-label\s*\{[^}]*translateY\(3px\);/s, "The Final Answer label should be optically centred.");
  assert.ok(script.includes('aria-label="Reset game and return to opening screen" disabled={screen !== "game"} onClick={resetGame}'), "Reset should remain visible but be disabled outside the active question screen.");
  assert.ok(script.includes('src="restart.svg" alt="" className="h-[20px] w-[20px]"') && script.includes('>Reset</span>'), "Reset should use a balanced 20px restart icon and title-case label.");
  assert.match(css, /\.millionaire-toolbar-reset:disabled\s*\{[^}]*cursor:\s*not-allowed;[^}]*filter:\s*grayscale\(1\);[^}]*opacity:\s*\.42;/s, "Unavailable Reset buttons should appear greyed out.");
  assert.match(script, /function resetGame\(\)\s*\{[^}]*setScreen\("title"\);/s, "Reset should return directly to the opening screen.");
  assert.ok(!script.includes("millionaire-quit") && !script.includes(">QUIT</button>"), "The old bottom-left Quit button should be removed.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto repeat\(15, minmax\(0, 1fr\)\);/s, "The 15 prize rows should expand evenly to fill the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*min-height:\s*0;/s, "Prize rows should be free to share the full ladder height evenly.");
  assert.ok(script.includes('className="millionaire-question-media"'), "Question media should have a separate area above the question bar.");
  assert.ok(script.includes('className="millionaire-question-rail"'), "The question should use a connected outlined rail.");
  assert.ok(script.includes('className="millionaire-answer-row"'), "Answers should be arranged in two connected rows.");
  assert.match(css, /\.millionaire-question-rail::before\s*\{[^}]*background:\s*#fff;/s, "The question rail should use a white outline colour.");
  assert.match(css, /\.millionaire-inline-hint\s*\{[^}]*width:\s*min\(560px, calc\(100% - 40px\)\);[^}]*justify-content:\s*center;[^}]*text-align:\s*center;/s, "The in-page hint should be centred at the top of the question area.");
  assert.match(css, /\.millionaire-question-bar::before\s*\{[^}]*background:\s*#fff;/s, "The question outline should be white.");
  assert.match(css, /\.millionaire-question-bar\s*\{[^}]*width:\s*100%;/s, "The question bar should reach the same left and right endpoints as the answer rows.");
  assert.match(css, /\.millionaire-question-bar::after\s*\{[^}]*radial-gradient\(circle at 112% 48%, rgba\(72,132,255,\.75\)[^}]*linear-gradient\(90deg, #02051d 0%, #070b4b 58%, #123c9c 100%\);/s, "The question bar should match the answer-button gradient.");
  assert.match(css, /\.millionaire-answer-row::before\s*\{[^}]*background:\s*#fff;/s, "Each answer row should use a connected white line.");
  assert.match(css, /\.millionaire-answer::before\s*\{[^}]*background:\s*#fff;/s, "Answer outlines should be white.");
  assert.match(css, /\.millionaire-rules-actions\s*\{[^}]*justify-content:\s*center;/s, "The rules return button should be centred beneath the panels.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 286px;/s, "The restyled prize ladder should have room for larger text.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*radial-gradient\(circle at 112% 48%/s, "The prize ladder should use the flat deep-blue reference treatment with a side glow.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*font-size:\s*26px;/s, "Prize-ladder numbers and values should be larger.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*inset 2px 0 0 #fff;/s, "The prize-ladder divider should be white.");
  assert.match(css, /\.millionaire-ladder-lifelines \.millionaire-lifeline-icon\s*\{[^}]*width:\s*82px;[^}]*height:\s*54px;/s, "The prize-ladder lifelines should be larger.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*padding:\s*0;/s, "The prize ladder should reach the full height and right edge of the game window.");
  assert.match(css, /\.millionaire-play-area\s*\{[^}]*padding:\s*18px;/s, "The question area should retain even internal spacing without clipping its controls.");
  assert.match(css, /\.millionaire-play-area::before\s*\{[^}]*background:\s*url\("\.\/gameback-optimized\.webp\?v=20260721-new-photo"\) center \/ cover no-repeat;[^}]*filter:\s*blur\(3px\);/s, "The question-and-answer area should use the softly blurred replacement game background behind all elements and up to the divider.");
  assert.ok(fs.existsSync(path.join(__dirname, "gameback-optimized.webp")), "The compressed restored game background should be present.");
  assert.ok(script.includes("this.scheduleEarlyStart(8000, questionPath, sequence)"), "The Questions 1–5 music should begin eight seconds after Start is pressed.");
  assert.ok(script.includes("const fadeSeconds = 5"), "The Questions 1–5 loop should crossfade during its final five seconds.");
  assert.ok(script.includes("this.playMusicSequence(stageFiles[0], stageFiles[1], false, 5)"), "Every £2,000–£1 million question track should use a five-second crossfade loop.");
  assert.match(script, /playMusicSequence\(firstPath, nextPath, nextLoops = true, crossfadeSeconds = 0\)[\s\S]*waitForIntro: true[\s\S]*first\.addEventListener\("ended"[\s\S]*this\.startEarlyQuestionLoop\(nextPath, sequence\);/, "The Let's Play introduction should finish before the crossfading question loop begins.");
  assert.ok(script.includes("this.fadeOutMusicForExcerpt(.5, startExcerpt)"), "Question music should fade out for half a second before an excerpt begins.");
  assert.ok(script.includes("this.fadeInMusicAfterExcerpt(.5)"), "Question music should fade back in for half a second after an excerpt ends.");
  assert.ok(script.includes("return totalDuration + .62"), "Excerpt progress should include the half-second fade before playback.");
  assert.match(script, /if \(QUESTION_REWARDS\[stage\]\) \{[\s\S]*autoAdvance: true[\s\S]*const stopAfterSeconds = stage === 5 \? 7 : stage === 10 \? 8 : 0;[\s\S]*playOutcome\(stage, true, \{ finishNaturally: stage !== 3, stopAfterSeconds \}\);[\s\S]*goToQuestion\(currentIndex \+ 1\);[\s\S]*return;/, "Medal questions should advance automatically, with £1,000 and £32,000 using their requested audio lengths.");
  assert.ok(script.includes('disabled={autoAdvancingMilestone || !selectedLetter || locked || transitioning}') && !script.includes('waitingForMilestoneContinue') && !script.includes('continueMilestone'), "Milestone celebrations should keep Final Answer visible but disabled, without offering Continue.");
  assert.match(script, /if \(stage === 15\) \{[\s\S]*setScreen\("milestone"\);[\s\S]*playOutcome\(15, true, \{ finishNaturally: true \}\);[\s\S]*return;/, "The £1 million win should open its dedicated celebration screen and play Sound 62.");
  assert.ok(script.includes('<MilestoneCelebration reward={QUESTION_REWARDS[15]} showBurst={false} />'), "The £1 million screen should show the high-resolution diamond without the small burst confetti.");
  assert.ok(script.includes('<FinalConfetti />') && script.includes('Array.from({ length: 60 }'), "The £1 million screen should pour confetti across its full width.");
  assert.match(css, /\.millionaire-final-confetti-piece\s*\{[^}]*millionaireConfettiFall[^}]*infinite;/s, "Final-screen confetti should fall continuously.");
  assert.ok(script.includes('<h2>£1 MILLION</h2>'), "The final celebration heading should use the requested £1 MILLION wording.");
  assert.ok(!script.includes("You answered all 15 questions correctly."), "The final celebration should not show the removed explanatory sentence.");
  assert.match(css, /\.millionaire-celebration h2\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold", serif;/s, "The £1 MILLION heading should use the Gothic prize-ladder font.");
  assert.ok(script.includes('<p className="millionaire-celebration-message">Congratulations!</p>'), "The £1 MILLION screen should congratulate the player beneath the prize.");
  assert.match(css, /\.millionaire-celebration-message\s*\{[^}]*margin:\s*16px 0 0;[^}]*color:\s*#fff;[^}]*font-family:\s*"ITC Conduit Pro", sans-serif;/s, "The congratulations message should sit slightly lower in white question text.");
  assert.ok(script.includes('onClick={() => finishGame("won", 1000000)}><span className="millionaire-final-answer-label">Review</span>'), "The £1 million screen should offer Review after the diamond celebration.");
  assert.match(script, /function finalAnswerDelay\(stage\)\s*\{\s*if \(stage <= 5\) return 2000;\s*if \(stage <= 8\) return 3000;\s*if \(stage <= 12\) return 4000;\s*return 5000;\s*\}/s, "Final Answer reveals should use the confirmed 2, 3, 4 and 5 second question bands.");
  assert.match(script, /playFinalAnswer\(stage\)\s*\{[^}]*this\.playEffect\(path\);[^}]*window\.setTimeout\(\(\) => \{\s*this\.stopEffect\(\);\s*resolve\(\);\s*\}, finalAnswerDelay\(stage\)\);/s, "The Final Answer audio should be stopped at the fixed reveal delay instead of playing to completion.");
  assert.ok(script.includes('finishNaturally: stage !== 3') && script.includes('path === window.MILLIONAIRE_SOUND_CONFIG.earlyCorrect && !finishNaturally') && script.includes('shortenEarlyCorrect ? { shortenBy: 3, fadeSeconds: 1 } : stopAfterSeconds > 0 ? { stopAfterSeconds } : undefined') && script.includes('stopAfterSeconds * 1000'), "Question 3 should use the same shortened early-correct audio as Question 2, while £1,000 and £32,000 use their requested audio caps.");
  assert.ok(script.includes('className="millionaire-skip-correct-overlay"') && script.includes("audioDirector.current.stopEffect();"), "A click or tap anywhere should skip the remaining correct-answer reveal.");
  assert.match(css, /\.millionaire-skip-correct-overlay\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*1250;[^}]*inset:\s*0;[^}]*background:\s*transparent;/s, "The correct-answer skip target should cover the whole viewport without changing its appearance.");
  assert.ok(script.includes('value === 1000000 ? "£1 MILLION"'), "The top prize should display MILLION in capitals on the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*grid-template-columns:\s*30px 12px minmax\(0, 1fr\);[^}]*column-gap:\s*4px;[^}]*line-height:\s*1\.2;/s, "Prize rows should leave equal breathing room on both sides of the diamond.");
  assert.match(css, /\.millionaire-prize-number\s*\{[^}]*text-align:\s*right;[^}]*translateX\(5px\);/s, "Prize question numbers should be optically spaced equally from the diamond and amount.");
  assert.match(css, /\.millionaire-prize-value-wrap\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*gap:\s*6px;/s, "Reward SVGs should sit immediately beside their prize values.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*display:\s*grid;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*place-items:\s*center;[^}]*align-self:\s*center;[^}]*justify-self:\s*center;[^}]*font-size:\s*11px;/s, "Current and completed question diamonds should be larger and centred in both directions.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*transform:\s*translateX\(2px\);/s, "Every prize-ladder diamond should sit 2px to the right for optical alignment.");
  assert.ok(script.includes('<AutoFitAnswer answer={answer} question={question} />'), "Each answer should use automatic fitting, or a notation glyph where the question asks for a missing note value.");
  assert.match(css, /\.millionaire-answer\.is-removed\s*\{[^}]*pointer-events:\s*none;[^}]*\}/s, "50:50 removed choices should retain their answer containers but remain non-interactive.");
  assert.match(css, /\.millionaire-answer\.is-removed \.millionaire-answer-content, \.millionaire-answer\.is-removed \.millionaire-answer-status\s*\{[^}]*visibility:\s*hidden;/s, "50:50 should hide only the removed choice's diamond and text.");
  assert.ok(script.includes("text.scrollWidth > text.clientWidth") && script.includes("text.style.fontSize") && script.includes("fontSize -= .5"), "Only long white answer wording should reduce in size until it fits.");
  assert.ok(script.includes('text.classList.remove("is-wrapped")') && script.includes('if (fontSize <= 16 || text.scrollWidth > text.clientWidth) text.classList.add("is-wrapped")'), "White answer wording should always wrap after reaching its minimum fitted size, even when flex sizing masks the overflow.");
  assert.ok(script.includes('className="millionaire-answer-diamond"'), "Each answer should begin with a diamond.");
  assert.match(css, /\.millionaire-answer\s*\{[^}]*height:\s*48px;[^}]*min-height:\s*48px;/s, "Answer boxes should be two-thirds of the 72px question-box height.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*display:\s*flex;[^}]*font-size:\s*clamp\(18px, 1\.75vw, 24px\);[^}]*line-height:\s*1;/s, "Answer content should fit cleanly inside the half-height boxes.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*translateY\(2px\);/s, "Answer text should remain optically centred in the shorter boxes.");
  assert.match(css, /\.millionaire-answer-letter\s*\{[^}]*flex:\s*0 0 auto;[^}]*font-size:\s*inherit;/s, "Answer letters should remain at the full standard size when wording shrinks.");
  assert.match(css, /\.millionaire-answer-text\s*\{[^}]*min-width:\s*0;[^}]*flex:\s*1 1 auto;[^}]*overflow:\s*hidden;/s, "Only the white answer wording should occupy the flexible resizable space.");
  assert.match(css, /\.millionaire-answer-text\.is-wrapped\s*\{[^}]*overflow:\s*visible;[^}]*line-height:\s*1\.05;[^}]*white-space:\s*normal;/s, "Long white answer wording should use a second line instead of being cut off.");
  assert.match(css, /\.millionaire-answer-diamond\s*\{[^}]*font-size:\s*\.62em;[^}]*vertical-align:\s*middle;[^}]*\}/s, "Answer diamonds should be larger and vertically centred with the shifted text.");
  assert.doesNotMatch(css, /\.millionaire-answer-diamond\s*\{[^}]*translateY\(-/s, "Answer diamonds should no longer be shifted upward.");
  assert.match(css, /\.millionaire-answer-status\s*\{[^}]*position:\s*absolute;[^}]*width:\s*1px;[^}]*height:\s*1px;[^}]*overflow:\s*hidden;/s, "Correct and incorrect answer status should remain available to assistive technology without showing a tick or cross.");
  assert.ok(!script.includes('isCorrect ? "✓"') && !script.includes('isIncorrect ? "✕"'), "Revealed answers should not display tick or cross symbols.");
  assert.ok(script.includes('revealed === "correct" ? "is-correct-selection" : "is-correct-reveal"'), "Correct selections and corrected wrong answers should use distinct flash treatments.");
  assert.match(css, /\.millionaire-answer\.is-incorrect::before\s*\{\s*background:\s*#ffe38b;\s*\}[\s\S]*\.millionaire-answer\.is-incorrect::after\s*\{\s*background:\s*#c37a0c;/, "A pupil's wrong selection should remain orange rather than turning red.");
  assert.match(css, /\.millionaire-answer\.is-correct-selection::after\s*\{\s*animation:\s*millionaireCorrectFillOrange 1s linear;/, "A correct selection should flash green and orange for one second.");
  assert.match(css, /\.millionaire-answer\.is-correct-reveal::after\s*\{\s*animation:\s*millionaireCorrectFillBlue 1s linear;/, "The actual answer after a wrong selection should flash green and blue for one second.");
  assert.match(css, /@keyframes millionaireCorrectFillOrange[\s\S]*100%\s*\{\s*background:\s*#15803d;/, "Correct-answer flashes should finish on green.");
  assert.ok(script.includes("const answerDisabled = locked || transitioning || removed;") && script.includes("disabled={answerDisabled}"), "Answers should remain enabled while a musical excerpt is playing.");
  assert.doesNotMatch(script, /const answerDisabled\s*=\s*[^;]*audioPlaying/, "Excerpt playback must never disable the answer buttons.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold";[^}]*Copperplate-Gothic-Std-33-BC\.ttf/s, "The local Copperplate Gothic ExtraBold font should be loaded.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold",\s*serif;/s, "Copperplate Gothic ExtraBold should be scoped to the prize-ladder sidebar.");
  assert.match(css, /\.millionaire-answer::after\s*\{[^}]*radial-gradient\(circle at 112% 48%, rgba\(72,132,255,\.75\)[^}]*linear-gradient\(90deg, #02051d 0%, #070b4b 58%, #123c9c 100%\);/s, "Answer boxes should use the same gradient colours as the sidebar.");
  assert.ok(!script.includes("beforeunload"), "Browser refresh should not be blocked during an active game.");
  assert.ok(!script.includes("Ask the Audience"), "Ask the Audience should be replaced by Switch.");
  assert.ok(script.includes('src="50.50.svg"') && script.includes('src="hint.svg"') && script.includes('src="switch.svg"'), "The three lifelines should use the supplied SVG icons.");
  assert.ok(script.includes("<window.MLH.CustomiseButton") && script.includes("<window.MLH.MenuSubheading>Question Types</window.MLH.MenuSubheading>"), "Customise should use the shared Hub menu and Question Types heading.");
  ["Music Literacy", "Audio", "Music Concepts"].forEach((label) => assert.ok(script.includes(`label: "${label}"`), `Customise should include ${label}.`));
  assert.match(script, /const QUESTION_TYPE_OPTIONS = \[[\s\S]*id: "literacy"[\s\S]*id: "concepts"[\s\S]*id: "listening"/, "Customise should list Music Literacy, Music Concepts, then Audio.");
  assert.ok(script.includes('glyph: "\\uE050", notationGlyph: true'), "Music Literacy should use the Bravura treble clef glyph.");
  assert.ok(script.includes('icon: "worksheet.svg", iconSize: "h-[26px] w-[26px]"'), "Music Concepts should use a larger worksheet.svg icon.");
  assert.ok(script.includes('iconSize: "h-[52.5px] w-[52.5px]"'), "The Audio icon should be 25 percent larger than its previous 42px size.");
  assert.match(css, /\.millionaire-question-type-clef\s*\{[^}]*font-family:\s*"Bravura", serif;[^}]*font-size:\s*20px;[^}]*font-weight:\s*400;[^}]*transform:\s*translateY\(4px\);/s, "The Music Literacy glyph should use smaller regular-weight Bravura notation with the requested vertical alignment.");
  assert.ok(script.includes("if (enabled && current.questionTypes.length === 1) return current;"), "At least one question type should always remain enabled.");
  assert.ok(script.includes('disabled={!available || (settings.questionTypes.includes(option.id) && settings.questionTypes.length === 1)}'), "Unavailable question types and the final enabled type should be visibly unavailable.");
  assert.ok(!coreScript.includes("audienceVotes") && !css.includes("millionaire-audience"), "Unused audience-vote code and styling should be removed.");
  assert.ok(script.includes('const customiseUnavailable = openingZooming || screen === "game" || screen === "milestone";') && script.includes("<fieldset disabled={customiseUnavailable}"), "Customise should be unavailable during the opening transition and while a game is active.");
  assert.ok(script.includes('level: settings.level, categories'), "The next game should use the selected question types.");
  assert.ok(script.includes("const otherFingerprints = new Set") && script.includes("!otherFingerprints.has(CORE.questionFingerprint(candidate))"), "Switch must reject any replacement that duplicates another pupil-facing question in the game.");
  assert.ok(script.includes("Switch your current question to a different question"), "The rules should explain the Switch lifeline.");
});
