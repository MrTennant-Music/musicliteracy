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
const phraseCoverage = {};
for (const level of Object.keys(core.LEVELS)) {
  coverage[level] = { signatures: new Set(), rests: false, ties: false, triplets: false, syncopation: false };
  phraseCoverage[level] = { AA: 0, AA_PRIME: 0, QUESTION_ANSWER: 0, variedPrime: 0, relatedTotal: 0 };
  const random = seededRandom(level.charCodeAt(0) * 113);
  for (let index = 0; index < 400; index += 1) {
    const rhythm = core.generateRhythm(level, random);
    assert(["AA", "AA_PRIME", "QUESTION_ANSWER"].includes(rhythm.phraseTemplate), `${level} generated an unknown phrase template`);
    assert(rhythm.relatedMaterial >= 0.19 && rhythm.relatedMaterial <= 1, `${level} generated an unrelated second bar`);
    phraseCoverage[level][rhythm.phraseTemplate] += 1;
    phraseCoverage[level].relatedTotal += rhythm.relatedMaterial;
    if (rhythm.phraseTemplate === "AA_PRIME" && rhythm.bars[0].cellIds.join("|") !== rhythm.bars[1].cellIds.join("|")) phraseCoverage[level].variedPrime += 1;
    assert.equal(rhythm.bars.length, 2, `${level} must generate two bars`);
    assert(core.LEVELS[level].timeSignatureIds.includes(rhythm.timeSignature.id), `${level} generated an unavailable time signature`);
    coverage[level].signatures.add(rhythm.timeSignature.id);
    rhythm.bars.forEach((bar) => {
      assert(bar.cellIds.length > 0 && bar.cellIds.length === bar.cellDensities.length, `${level} must retain its rhythmic-cell metadata`);
      assert.equal(bar.events[0].type, "note", `${level} began a bar with a rest`);
      assert.equal(bar.events.at(-1).type, "note", `${level} ended a bar with a rest`);
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
        if (level !== "AH" && !rhythm.timeSignature.compound && event.type === "note" && !info.triplet) {
          const startsOffBeat = Math.abs(event.startBeats - Math.round(event.startBeats)) > 1e-7;
          const nextBeat = Math.floor(event.startBeats + 1e-7) + 1;
          const crossesNextBeat = event.startBeats + event.durationBeats > nextBeat + 1e-7;
          assert(!(startsOffBeat && crossesNextBeat), `${level} generated syncopation before Advanced Higher`);
        }
      });
      const groups = new Map();
      bar.events.filter((event) => event.groupId).forEach((event) => groups.set(event.groupId, [...(groups.get(event.groupId) || []), event]));
      groups.forEach((events) => {
        if (!events.some((event) => core.RHYTHMS[event.rhythm].beams)) return;
        const sequence = events.map((event) => event.rhythm).join(",");
        const permitted = new Set([
          "quaver,quaver", "quaver,quaver,quaver",
          "semiquaver,semiquaver,semiquaver,semiquaver",
          "quaver,semiquaver,semiquaver", "semiquaver,semiquaver,quaver",
          "dotted-quaver,semiquaver",
          "triplet-quaver,triplet-quaver,triplet-quaver",
        ]);
        assert(permitted.has(sequence), `${level} generated a non-Barlines beam group: ${sequence}`);
      });
      bar.events.forEach((event, index) => {
        if (!event.tiedToNext) return;
        const next = bar.events[index + 1];
        assert.equal(rhythm.timeSignature.compound, false, `${level} generated a tie in compound time`);
        assert.notEqual(rhythm.timeSignature.id, "2/4", `${level} generated a tie in 2/4`);
        assert.equal(event.rhythm, "quaver", `${level} tie did not begin with an off-beat quaver`);
        assert(["quaver", "crotchet"].includes(next.rhythm), `${level} tie ended on an invalid rhythm`);
        assert(Math.abs(event.startBeats % 1 - .5) < 1e-7, `${level} tie did not begin on an off-beat`);
        assert(Math.abs(next.startBeats % 1) < 1e-7, `${level} tie did not cross onto a beat`);
        assert.notEqual(event.groupId, next.groupId, `${level} tie was placed inside a beamed group`);
      });
    });
    assert(rhythm.expectedOnsetsBeats.length >= 3, `${level} generated too few playable onsets`);
  }
}

for (const level of ["N3", "N4"]) assert(phraseCoverage[level].AA + phraseCoverage[level].AA_PRIME >= 300, `${level} must strongly favour A–A and A–A′ phrases`);
for (const level of ["N5", "H", "AH"]) assert(phraseCoverage[level].AA_PRIME + phraseCoverage[level].QUESTION_ANSWER >= 280, `${level} must favour controlled variation or question–answer phrases`);
for (const level of Object.keys(core.LEVELS)) assert(phraseCoverage[level].variedPrime > 0, `${level} must produce recognisable A′ variations rather than only exact repeats`);

for (const level of Object.keys(core.LEVELS)) {
  const firstRandom = seededRandom(8800 + level.length * 37);
  const secondRandom = seededRandom(8800 + level.length * 37);
  for (let index = 0; index < 40; index += 1) {
    const first = core.generateRhythm(level, firstRandom);
    const second = core.generateRhythm(level, secondRandom);
    assert.equal(core.rhythmSignature(first), core.rhythmSignature(second), `${level} lost seeded rhythm reproducibility`);
    assert.equal(first.phraseTemplate, second.phraseTemplate, `${level} lost seeded phrase reproducibility`);
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

result = core.matchPerformance(expected, [0, 1], 90);
assert.equal(result.percentage, 67, "Two accurate taps from three must round to 67%");
assert.equal(result.passed, true, "The minimum passing accuracy must be 60%");

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
assert.equal(core.TIMING.passPercentage, 60);

for (const level of Object.keys(core.LEVELS)) {
  for (const selectedId of core.LEVELS[level].rhythmIds) {
    const enabled = Object.fromEntries(core.LEVELS[level].rhythmIds.map((id) => [id, id === selectedId]));
    if (!core.canGenerateWithEnabled(level, enabled)) continue;
    const random = seededRandom(selectedId.length * 971 + level.length);
    for (let index = 0; index < 30; index += 1) {
      const generated = core.generateRhythm(level, random, "", enabled);
      generated.bars.flatMap((bar) => bar.events).forEach((event) => {
        const selectableId = event.rhythm === "triplet-quaver" ? "quaver" : event.rhythm === "triplet-crotchet" ? "crotchet" : event.rhythm.endsWith("-rest") ? event.rhythm.slice(0, -5) : event.rhythm;
        assert.equal(selectableId, selectedId, `${level} generated ${event.rhythm} while only ${selectedId} was enabled`);
      });
    }
  }
}

for (const level of ["H", "AH"]) {
  const enabled = Object.fromEntries(core.LEVELS[level].rhythmIds.map((id) => [id, true]));
  const selectedSignature = core.LEVELS[level].timeSignatureIds.at(-1);
  const random = seededRandom(level === "H" ? 4401 : 5501);
  for (let index = 0; index < 120; index += 1) {
    const generated = core.generateRhythm(level, random, "", enabled, { timeSignatureIds: [selectedSignature], restsEnabled: false, tiesEnabled: false });
    assert.equal(generated.timeSignature.id, selectedSignature, `${level} ignored the selected time signature`);
    generated.bars.flatMap((bar) => bar.events).forEach((event) => {
      assert.notEqual(event.type, "rest", `${level} generated a disabled rest`);
      assert.equal(Boolean(event.tiedFromPrevious || event.tiedToNext), false, `${level} generated a disabled tie`);
    });
  }
}

const semibreveOnly = { crotchet: false, minim: false, "dotted-minim": false, semibreve: true };
const semibreveException = core.generateRhythm("N3", seededRandom(777), "", semibreveOnly, { timeSignatureIds: ["4/4"] });
assert.equal(semibreveException.expectedOnsetsBeats.length, 2, "Semibreve-only custom settings must retain the unavoidable two-note exception");
assert.equal(semibreveException.fallback, true, "The two-note exception must be limited to the safe fallback path");

console.log("Reading Rhythms core tests passed.");
