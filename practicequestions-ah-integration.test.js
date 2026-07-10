"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("practicequestions.html", "utf8");

function includes(text, message) {
  assert.equal(source.includes(text), true, message);
}

includes("./practice-melody-generator.js?v=20260710-ah-rules", "The AH generator must load before the page app");
includes("const ADVANCED_HIGHER_DEVELOPMENT_BARS = [8, 9, 10, 11];", "Development questions must use bars 9-12");
includes("const ADVANCED_HIGHER_VARIATION_BARS = [4, 5, 6, 7];", "Variation questions must use bars 5-8");
includes("const ADVANCED_HIGHER_CHORD_IDENTIFY_BAR = 8;", "Chord identification must use bar 9");
includes("const ADVANCED_HIGHER_CHORD_BASS_BAR = 9;", "Bass-line work must use bar 10");
includes("return { barIndex, endBarIndex: 11, restoreBarIndex: 12, signature };", "Time changes must end after bar 12");
includes("question.practiceLevel === \"AH\" ? null : plantTranspositionFallbackBar", "AH transposition must not rewrite the generated melody");
includes(".filter((bar) => bar.barIndex >= 1 && bar.barIndex < 8)", "AH transposition must select bars 2-8");
includes("questionSelectionLevel === \"AH\" ? ADVANCED_HIGHER_DEVELOPMENT_BARS : null", "AH editable questions must be directed to the development line");
includes("const targetBarIndex = 8;", "AH rhythmic dictation must target bar 9");
includes("forceFinalDominantCadence: forceAdvancedHigherDominantCadence", "A cadence with a chord-type question must use the dominant-seventh exception");
includes("!forceAdvancedHigherDominantCadence ? cadenceBarIndexes : []", "The dominant-seventh cadence exception must be allowed to share bars 15-16");
includes("const activeTimeSignature = timeSignatureForBar(question, barIndex);", "Chord slots must follow a line-3 time change");
includes("{ beat: 3, beats: 2, rhythm: \"minim\" }", "AH chord slots in 5/4 must preserve the 3+2 grouping");
includes("barlineQuestionPromptText(barlineTargets[0], question.bars.length)", "AH barline prompts must retain two-digit bar numbers");
includes("question.transpositionTarget?.type === \"meaning\" ? 0 : 80", "A written transposition stave must add 80 pixels below its system");
includes("const scaleDegreeBoxHeight = MARKING_BOX_HEIGHT + 10;", "Scale-degree boxes must extend 10 pixels farther downward");
includes("reserveExtraSpacingAfterSystem(ahChordSystemIndex, 300);", "Chord and bass-line boxes must push line 4 down by 300 pixels");
includes("sharedBoxY - 10", "Total-value boxes must extend 10 pixels upward from the top");
includes("const lineStart = start + 39;", "8va and 8vb dashed lines must be shortened 35 pixels from the left");
includes("const ENHARMONIC_KEY_SOURCE_OPTIONS = {", "Enharmonic questions must use key-specific boxed source spellings");
includes("{ letter: \"E\", accidental: 1 }", "C major enharmonic sources must include E sharp");
includes("{ letter: \"F\", accidental: -1 }", "C major enharmonic sources must include F flat");
includes("Dm: [\n        { letter: \"C\", accidental: 1 },\n        { letter: \"D\", accidental: -1 },\n        { letter: \"B\", accidental: -1 },\n        { letter: \"A\", accidental: 1 },", "D minor must include its own and relative-major enharmonic sources");
includes("const blend = 0;", "Barline question note spacing must preserve rhythmic grammar");
includes("if (question.practiceLevel === \"AH\" && intervalNumber === 2) return false;", "AH interval questions must not target existing 2nds");
includes("higherIntervalTypeOrder().filter((type) => type !== \"second\")", "AH planted interval questions must not choose 2nds");
includes("return selected.has(\"ahChord\") && selected.has(\"rhythmicDictation\");", "Chord identify and rhythmic dictation must not both occupy bar 9");
includes("questionSelectionLevel === \"AH\" && needsKey && needsTime && !timeChangeTarget", "Key and starting time-signature questions must not both occupy bar 1");
includes(".filter((signature) => signature.id !== \"5/4\")", "5/4 must not be selected as the starting AH time signature");
includes("function advancedHigherPlaybackSlotsForBar(question, bar)", "AH playback must read the generated chord slots for bars 9 and 10");
includes("advancedHigherChordPlaybackMidiMap(question, bar, advancedHigherPlaybackSlotForBeat(advancedHigherChordSlots, event.time))", "AH accompaniment patterns must follow generated chord inversions at each pulse");
includes("function melodyCeilingMidiForBeat(question, bar, beat = 0)", "Playback must calculate a melody-aware ceiling for accompaniment notes");
includes("lowerAccompanimentMidiBelow(midi, melodyCeilingMidiForBeat(question, bar, beatOffset))", "Accompaniment playback must be lowered below the melody at each pulse");

console.log(JSON.stringify({ tests: "passed", integrationRulesChecked: 34 }, null, 2));
