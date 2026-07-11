"use strict";

const assert = require("node:assert/strict");
const generator = require("./practice-melody-generator.js");

const CADENCES = ["perfect", "imperfect", "plagal", "interrupted"];
const SIGNATURES = ["2/4", "3/4", "4/4", "5/4", "6/8", "9/8", "12/8"];
const EXPECTED_FINAL_DEGREE = { perfect: 1, plagal: 1, imperfect: 5, interrupted: 6 };
const BEATS = { semibreve: 4, dottedMinim: 3, minim: 2, dottedCrotchet: 1.5, crotchet: 1, quaver: 0.5, dottedCrotchetRest: 1.5, crotchetRest: 1, quaverRest: 0.5 };
const BAR_BEATS = { "2/4": 2, "3/4": 3, "4/4": 4, "5/4": 5, "6/8": 3, "9/8": 4.5, "12/8": 6 };

function degreeClass(relativeStep) {
  return ((relativeStep % 7) + 7) % 7 + 1;
}

function sounding(bar) {
  return bar.notes.filter((note) => !note.rest);
}

function signature(bar) {
  return bar.notes.map((note) => note.rest ? `R:${note.rhythm}` : `${note.relativeStep}:${note.rhythm}`).join("|");
}

const first = generator.generateAdvancedHigherPlan({ seed: "deterministic", cadenceId: "perfect", timeSignatureId: "4/4" });
const second = generator.generateAdvancedHigherPlan({ seed: "deterministic", cadenceId: "perfect", timeSignatureId: "4/4" });
assert.deepEqual(first, second, "The same seed must produce the same melody plan");
assert.deepEqual(
  generator.resolveConfig({ level: "AH", questionTypes: ["missing", "accidentals"] }).questionOverrides.targetBars,
  [8, 9, 10, 11],
  "Later question settings must override earlier settings hierarchically"
);

for (const cadenceId of CADENCES) {
  for (const timeSignatureId of SIGNATURES) {
    for (let seedIndex = 0; seedIndex < 12; seedIndex += 1) {
      const plan = generator.generateAdvancedHigherPlan({
        seed: `${cadenceId}-${timeSignatureId}-${seedIndex}`,
        cadenceId,
        timeSignatureId,
        allowRests: seedIndex % 2 === 0,
      });
      assert.equal(plan.bars.length, 16, "AH melodies must contain 16 bars");
      assert.equal(plan.validation.accepted, true, `Plan rejected for ${cadenceId}, ${timeSignatureId}, seed ${seedIndex}`);
      assert.equal(sounding(plan.bars[0])[0].relativeStep, 0, "The melody must begin on the tonic");
      assert.equal(signature(plan.bars[0]), signature(plan.bars[4]), "Bar 5 must recall bar 1");
      assert.equal(signature(plan.bars[1]), signature(plan.bars[5]), "Bar 6 must recall bar 2");
      assert.equal(signature(plan.bars[0]), signature(plan.bars[12]), "Bar 13 must recall bar 1");
      assert.equal(signature(plan.bars[1]), signature(plan.bars[13]), "Bar 14 must recall bar 2");
      const finalNote = sounding(plan.bars[15]).at(-1);
      assert.equal(degreeClass(finalNote.relativeStep), EXPECTED_FINAL_DEGREE[cadenceId], "Final note must match the cadence");
      plan.bars.forEach((bar) => {
        const total = bar.pattern.reduce((sum, rhythm) => sum + BEATS[rhythm], 0);
        assert.equal(total, BAR_BEATS[timeSignatureId], `Bar ${bar.barIndex + 1} has the wrong duration`);
      });
      if (timeSignatureId === "5/4") {
        assert.deepEqual(plan.bars[15].pattern, ["dottedMinim", "minim"], "5/4 must finish with a 3+2 rhythm");
      }
      generator.summarisePlan(plan).forEach((bar) => {
        assert.equal(bar.midi.length, bar.relativeSteps.length, "Each sounding note must have a MIDI pitch in summaries");
        assert.equal(bar.midi.every(Number.isInteger), true, "MIDI pitches must be whole numbers");
      });
    }
  }
}

const examplePlans = CADENCES.map((cadenceId, index) => generator.generateAdvancedHigherPlan({
  seed: `example-${cadenceId}-${index}`,
  cadenceId,
  timeSignatureId: SIGNATURES[index],
  allowRests: true,
}));

console.log(JSON.stringify({
  tests: "passed",
  generatedPlans: CADENCES.length * SIGNATURES.length * 12 + 2,
  examples: examplePlans.map((plan) => ({
    seed: plan.seed,
    cadence: plan.cadenceId,
    timeSignature: plan.timeSignatureId,
    score: plan.validation.score,
    bars: generator.summarisePlan(plan, { tonicMidi: 60, mode: "major" }),
  })),
}, null, 2));
