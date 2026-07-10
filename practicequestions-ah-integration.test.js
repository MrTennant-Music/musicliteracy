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
includes("const ADVANCED_HIGHER_CHORD_IDENTIFY_BAR = 10;", "Chord identification must use bar 11");
includes("const ADVANCED_HIGHER_CHORD_BASS_BAR = 11;", "Bass-line work must use bar 12");
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

console.log(JSON.stringify({ tests: "passed", integrationRulesChecked: 16 }, null, 2));
