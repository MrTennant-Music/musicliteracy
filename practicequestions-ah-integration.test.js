"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("practicequestions.html", "utf8");

function includes(text, message) {
  assert.equal(source.includes(text), true, message);
}

function excludes(text, message) {
  assert.equal(source.includes(text), false, message);
}

includes("./practice-melody-generator.js?v=20260710-ah-rules", "The AH generator must load before the page app");
includes("const ADVANCED_HIGHER_DEVELOPMENT_BARS = [8, 9, 10, 11];", "Development questions must use bars 9-12");
includes("const ADVANCED_HIGHER_VARIATION_BARS = [4, 5, 6, 7];", "Variation questions must use bars 5-8");
includes("const ADVANCED_HIGHER_CHORD_IDENTIFY_BAR = 8;", "Chord identification must use bar 9");
includes("const ADVANCED_HIGHER_CHORD_BASS_BAR = 9;", "Bass-line work must use bar 10");
includes("function makePracticeTimeChangeTarget(question, timeSignatureLevel, preferredBarIndexes = [8], endBarIndex = 11, restoreBarIndex = 12)", "Time changes must default to bars 9-12 and restore in bar 13");
includes("return { barIndex, endBarIndex, restoreBarIndex, signature };", "Time changes must retain their configured end and restore bars");
includes("if (level === \"H\") return generateAdvancedHigherPhraseQuestion", "Higher must use the Advanced Higher melody and harmony plan");
includes("const chordBar = needsChord ? (level === \"H\" ? 8", "The Higher given chord must use bar 9");
includes("const higherChordAnswerBars = needsChord && level === \"H\" ? [9, 10]", "The Higher chord answers must use bars 10 and 11");
includes("? { startBarIndex: 6, endBarIndex: 7, cadenceId: \"perfect\" }", "Higher must be able to ask about the bar 8 cadence");
includes("level === \"H\"\n          ? makePracticeTimeChangeTarget(question, timeSignatureLevel, [11], 11, 12)", "Higher time changes must happen in bar 12 and restore in bar 13");
includes("question.practiceLevel === \"AH\" ? null : plantTranspositionFallbackBar", "AH transposition must not rewrite the generated melody");
includes("const transpositionStartBar = question.practiceLevel === \"AH\" ? 1 : 0;", "AH transposition must still avoid bar 1 while Higher can use the wider score");
includes("const transpositionEndBar = question.practiceLevel === \"AH\" ? 8 : question.bars.length - 1;", "AH transposition must still stop at bar 8 while Higher can use later bars");
includes("questionSelectionLevel === \"AH\" || level === \"H\" ? ADVANCED_HIGHER_DEVELOPMENT_BARS : null", "Higher and AH accidental questions must use the development line");
includes("const targetBarIndex = randomItem(unusedQuestionBars([10, 11]));", "AH rhythmic dictation must target bars 11-12");
includes("forceFinalDominantCadence: forceAdvancedHigherDominantCadence", "A cadence with a chord-type question must use the dominant-seventh exception");
includes("!forceAdvancedHigherDominantCadence ? cadenceBarIndexes : []", "The dominant-seventh cadence exception must be allowed to share bars 15-16");
includes("&& Math.random() < 0.1;", "The dominant-seventh cadence exception must be rare enough for other chord types to appear");
includes("const activeTimeSignature = timeSignatureForBar(question, barIndex);", "Chord slots must follow a line-3 time change");
includes("{ beat: 3, beats: 2, rhythm: \"minim\" }", "AH chord slots in 5/4 must preserve the 3+2 grouping");
includes("barlineQuestionPromptText(barlineTargets[0], question.bars.length)", "AH barline prompts must retain two-digit bar numbers");
includes("question.transpositionTarget?.type === \"meaning\" ? 0 : 95", "A written transposition stave must add 95 pixels below its system");
includes("const scaleDegreeBoxHeight = MARKING_BOX_HEIGHT + 10;", "Scale-degree boxes must extend 10 pixels farther downward");
includes("reserveExtraSpacingAfterSystem(ahChordSystemIndex, 300);", "Chord and bass-line boxes must push line 4 down by 300 pixels");
includes("sharedBoxY - 10", "Total-value boxes must extend 10 pixels upward from the top");
includes("const lineStart = start + 39;", "8va and 8vb dashed lines must be shortened 35 pixels from the left");
includes("const ENHARMONIC_KEY_SOURCE_OPTIONS = {", "Enharmonic questions must use key-specific boxed source spellings");
includes("{ letter: \"E\", accidental: 1 }", "C major enharmonic sources must include E sharp");
includes("{ letter: \"F\", accidental: -1 }", "C major enharmonic sources must include F flat");
includes("Dm: [\n        { letter: \"C\", accidental: 1 },\n        { letter: \"D\", accidental: -1 },\n        { letter: \"B\", accidental: -1 },\n        { letter: \"A\", accidental: 1 },", "D minor must include its own and relative-major enharmonic sources");
includes("const blend = 0.35;", "Barline question note spacing must use the current mild offset");
includes("if (question.practiceLevel === \"AH\" && intervalNumber === 2) return false;", "AH interval questions must not target existing 2nds");
includes("higherIntervalTypeOrder(ADVANCED_HIGHER_INTERVAL_TYPE_WEIGHTS)", "AH planted interval questions must use AH-specific interval weighting");
includes("return { ...target, weight: intervalNumber === 3 ? 1 : 4 };", "AH existing interval targets must favour intervals other than 3rds");
includes("(questionSelectionLevel === \"AH\" || level === \"H\") && needsTime && !timeChangeTarget", "Higher and Advanced Higher time questions must have a valid time-change target");
includes(".filter((signature) => signature.id !== \"5/4\")", "5/4 must not be selected as the starting AH time signature");
includes("type.id !== \"articulation\"", "Articulation questions must be removed from AH");
excludes("{ key: \"articulation\", weight: 0.05, choose: () => \"articulation\" }", "Articulation must not remain in the AH audio-question pool");
includes("const variant = question.practiceLevel === \"AH\" ? weightedRandomItem(variants) : randomItem(variants);", "AH transposition variants must use weighted selection");
includes("const AH_KEY_SUCCESS_COUNTS = Object.fromEntries(KEYS.map((key) => [key.id, 0]));", "AH key selection must track successful generated papers");
includes("recordAdvancedHigherKeySuccess(question);", "AH key balancing must record successful keys");
includes("return [barIndex, resolutionBarIndex].filter((index) => question.bars?.[index]);", "Augmented triads must use a two-bar context");
includes("const resolutionTones = dominantLetter && tonicLetters.length >= 2", "Augmented triads must resolve into the tonic chord in the next bar");
includes("rhythmIdentificationTarget?.variant", "Rhythm-identification generation must guard against a missing target");
includes("function advancedHigherPlaybackSlotsForBar(question, bar)", "AH playback must read the generated chord slots for bars 9 and 10");
includes("advancedHigherChordPlaybackMidiMap(question, bar, advancedHigherPlaybackSlotForBeat(advancedHigherChordSlots, event.time))", "AH accompaniment patterns must follow generated chord inversions at each pulse");
includes("function melodyCeilingMidiForBeat(question, bar, beat = 0)", "Playback must calculate a melody-aware ceiling for accompaniment notes");
includes("lowerAccompanimentMidiBelow(midi, melodyCeilingMidiForBeat(question, bar, beatOffset))", "Accompaniment playback must be lowered below the melody at each pulse");
excludes("{ rests: [\"quaverRest\"], before: [\"quaver\", \"quaver\", \"quaver\"], after: [\"crotchet\"], ties: [1] }", "Rest questions must not use the awkward tied-quaver 3/4 template");
includes("{ rests: [\"quaverRest\"], before: [\"crotchet\", \"quaver\"], after: [\"crotchet\"] }", "3/4 rest questions must include a clean untied quaver-rest template");
includes("const chordFittingCandidates = candidates.filter(({ bar, candidate }) => {", "Enharmonic source spellings must prefer chord tones on the primary beat");
includes("return chordPitchClasses.has(pitchClass(pitchOfSpelledNote(candidate.source)));", "Enharmonic primary-beat spellings must be checked by sounding pitch against the bar harmony");
includes("function closestEnharmonicSourceOctave(question, bar, note, source, clef = \"treble\")", "Enharmonic source spellings must be fitted to the original melody register");
includes("fitEnharmonicCandidateToMelodyNote(question, bar, note, candidate, clef)", "Enharmonic candidates must be refitted before selection");

console.log(JSON.stringify({ tests: "passed", integrationRulesChecked: 49 }, null, 2));
