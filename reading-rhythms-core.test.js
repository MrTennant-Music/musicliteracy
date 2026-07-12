const assert = require("node:assert/strict");
const core = require("./reading-rhythms-core.js");

function seededRandom(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const coverage = {};
for (const level of Object.keys(core.LEVELS)) {
  coverage[level] = { signatures: new Set(), rests: false, ties: false, triplets: false, syncopation: false };
  const random = seededRandom(level.charCodeAt(0) * 113);
  for (let index = 0; index < 400; index += 1) {
    const rhythm = core.generateRhythm(level, random);
    assert.equal(rhythm.bars.length, 2, `${level} must generate two bars`);
    assert(core.LEVELS[level].timeSignatureIds.includes(rhythm.timeSignature.id), `${level} generated an unavailable time signature`);
    coverage[level].signatures.add(rhythm.timeSignature.id);
    rhythm.bars.forEach((bar) => {
      const total = bar.events.reduce((sum, event) => sum + event.durationBeats, 0);
      assert(Math.abs(total - rhythm.timeSignature.quarterBeatsPerBar) < 1e-7, `${level} generated an incomplete or overfilled bar`);
      bar.events.forEach((event) => {
        const info = core.RHYTHMS[event.rhythm];
        assert(info, `Unknown rhythm ${event.rhythm}`);
        if (info.rest) assert(core.LEVELS[level].rests, `${level} generated a rest`);
        if (info.triplet) assert(core.LEVELS[level].triplets, `${level} generated a triplet`);
        if (event.tiedFromPrevious || event.tiedToNext) assert(core.LEVELS[level].ties, `${level} generated a tie`);
        if (info.rest) coverage[level].rests = true;
        if (info.triplet) coverage[level].triplets = true;
        if (event.tiedFromPrevious || event.tiedToNext) coverage[level].ties = true;
        if (event.rhythm === "crotchet" && event.startBeats % 1 !== 0) coverage[level].syncopation = true;
      });
    });
    assert(rhythm.expectedOnsetsBeats.length >= 2, `${level} generated too few playable onsets`);
  }
}

assert(coverage.H.rests && coverage.H.triplets, "Higher must generate rests and triplets");
assert(coverage.H.signatures.has("6/8") && coverage.H.signatures.has("9/8") && coverage.H.signatures.has("12/8"), "Higher must generate compound metres");
assert(coverage.AH.rests && coverage.AH.triplets && coverage.AH.ties && coverage.AH.syncopation, "Advanced Higher must generate its permitted concepts");
assert(coverage.AH.signatures.has("5/4"), "Advanced Higher must generate 5/4");
assert(!Object.values(coverage).some((item) => item.signatures.has("time-change")), "Time changes must not be generated");

const expected = [
  { id: "a", eventId: "a", time: 0 },
  { id: "b", eventId: "b", time: 1 },
  { id: "c", eventId: "c", time: 2 },
];

let result = core.matchPerformance(expected, [0, 1, 2], 90);
assert.equal(result.counts.perfect, 3, "Exact taps must be perfect");
assert.equal(result.percentage, 100);
assert.equal(result.passed, true);

result = core.matchPerformance(expected, [0.05, 0.9, 2.18], 90);
assert.equal(result.counts.perfect, 1, "A 50ms tap must be perfect at 90 bpm");
assert.equal(result.counts.acceptable, 1, "A 100ms early tap must be acceptable at 90 bpm");
assert.equal(result.counts.late, 1, "A 180ms late tap must be late");

result = core.matchPerformance(expected, [0, 0.45, 2], 90);
assert.equal(result.counts.perfect, 2, "An extra tap must not shift later correct taps");
assert.equal(result.counts.extra, 1);
assert.equal(result.counts.missed, 1, "The unmatched expected onset must remain missed");

result = core.matchPerformance(expected, [0, 1, 1.45, 2], 90);
assert.equal(result.counts.perfect, 3, "An extra tap must not consume a later onset");
assert.equal(result.counts.extra, 1);

const manualRhythm = {
  timeSignature: core.TIME_SIGNATURES["4/4"],
  bars: [
    { barIndex: 0, events: [
      { id: "n1", type: "note", startBeats: 0, durationBeats: 1, requiresTap: true },
      { id: "n2", type: "note", startBeats: 1, durationBeats: 1, requiresTap: false, tiedFromPrevious: true },
      { id: "r1", type: "rest", startBeats: 2, durationBeats: 1, requiresTap: false },
      { id: "n3", type: "note", startBeats: 3, durationBeats: 1, requiresTap: true },
    ] },
    { barIndex: 1, events: [{ id: "n4", type: "note", startBeats: 0, durationBeats: 4, requiresTap: true }] },
  ],
};
manualRhythm.expectedOnsetsBeats = core.expectedOnsetsBeats(manualRhythm);
assert.deepEqual(manualRhythm.expectedOnsetsBeats.map((item) => item.beat), [0, 3, 4], "Ties and rests must not require taps");

const compoundRhythm = {
  timeSignature: core.TIME_SIGNATURES["6/8"],
  expectedOnsetsBeats: [{ id: "a", eventId: "a", beat: 0 }, { id: "b", eventId: "b", beat: 1.5 }, { id: "c", eventId: "c", beat: 3 }],
};
assert.deepEqual(core.expectedOnsetsSeconds(compoundRhythm, 60).map((item) => item.time), [0, 1, 2], "6/8 must use the dotted-crotchet pulse");
assert(core.timingThresholds(60).acceptableMs > core.timingThresholds(120).acceptableMs, "Tolerance must scale moderately with tempo");
assert.equal(core.TIMING.passPercentage, 80);

console.log("Reading Rhythms core tests passed.");
