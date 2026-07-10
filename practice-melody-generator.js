(function attachPracticeMelodyGenerator(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PracticeMelodyGenerator = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function createPracticeMelodyGenerator() {
  "use strict";

  const RHYTHM_BEATS = {
    semibreve: 4,
    dottedMinim: 3,
    minim: 2,
    dottedCrotchet: 1.5,
    crotchet: 1,
    quaver: 0.5,
    dottedCrotchetRest: 1.5,
    crotchetRest: 1,
    quaverRest: 0.5,
  };

  const RHYTHM_POOLS = {
    "2/4": [
      ["quaver", "quaver", "crotchet"],
      ["crotchet", "quaver", "quaver"],
      ["crotchet", "crotchet"],
      ["quaverRest", "quaver", "crotchet"],
    ],
    "3/4": [
      ["quaver", "quaver", "crotchet", "crotchet"],
      ["crotchet", "quaver", "quaver", "crotchet"],
      ["dottedCrotchet", "quaver", "crotchet"],
      ["crotchet", "crotchet", "crotchet"],
      ["crotchetRest", "quaver", "quaver", "crotchet"],
    ],
    "4/4": [
      ["quaver", "quaver", "crotchet", "quaver", "quaver", "crotchet"],
      ["crotchet", "quaver", "quaver", "crotchet", "crotchet"],
      ["dottedCrotchet", "quaver", "crotchet", "crotchet"],
      ["minim", "quaver", "quaver", "crotchet"],
      ["crotchetRest", "quaver", "quaver", "crotchet", "crotchet"],
    ],
    "5/4": [
      ["quaver", "quaver", "crotchet", "crotchet", "quaver", "quaver", "crotchet"],
      ["crotchet", "quaver", "quaver", "crotchet", "crotchet", "crotchet"],
      ["dottedCrotchet", "quaver", "crotchet", "quaver", "quaver", "crotchet"],
      ["minim", "quaver", "quaver", "dottedCrotchet", "quaver"],
      ["crotchetRest", "quaver", "quaver", "crotchet", "crotchet", "crotchet"],
    ],
    "6/8": [
      ["quaver", "quaver", "quaver", "dottedCrotchet"],
      ["dottedCrotchet", "quaver", "quaver", "quaver"],
      ["crotchet", "quaver", "dottedCrotchet"],
      ["quaverRest", "quaver", "quaver", "dottedCrotchet"],
    ],
    "9/8": [
      ["quaver", "quaver", "quaver", "dottedCrotchet", "dottedCrotchet"],
      ["dottedCrotchet", "quaver", "quaver", "quaver", "dottedCrotchet"],
      ["crotchet", "quaver", "dottedCrotchet", "dottedCrotchet"],
      ["dottedCrotchet", "dottedCrotchet", "dottedCrotchet"],
    ],
  };

  const CADENCE_TEMPLATES = {
    perfect: [[2, 1], [7, 1], [5, 1], [4, 2, 1], [3, 2, 1]],
    imperfect: [[2, 5], [7, 5], [4, 5], [6, 5]],
    interrupted: [[7, 6], [2, 1], [5, 6]],
    plagal: [[4, 3, 2, 1], [6, 5, 1], [3, 2, 1]],
  };

  const CHORD_DEGREES = {
    I: [1, 3, 5],
    IV: [4, 6, 1],
    V: [5, 7, 2],
    V7: [5, 7, 2, 4],
    VI: [6, 1, 3],
  };

  const GLOBAL_DEFAULTS = {
    form: { sections: ["A", "A-prime", "B", "A-double-prime"], barsPerSection: 4 },
    rhythm: { allowRests: true, finalSimplification: true },
    motifs: { minLength: 2, maxLength: 4, allowSequence: true, maxSequences: 1 },
    pitchRange: { minRelativeStep: -3, maxRelativeStep: 7, maxTotalRange: 10 },
    intervalWeights: { step: 55, third: 30, larger: 15 },
    leapRules: { maxLeap: 5, recoveryThreshold: 3, requireOppositeStepRecovery: true },
    repetition: { maxConsecutive: 3 },
    climax: { preferredBars: [8, 9, 10, 11], requireSingleMainClimax: true },
    validation: {
      threshold: 85,
      maxAttempts: 80,
      penalties: { minor: 3, significant: 7, major: 12 },
    },
  };

  const LEVEL_DEFAULTS = {
    AH: {
      nonChordTones: {
        passing: true,
        upperNeighbour: true,
        lowerNeighbour: true,
        anticipation: true,
        suspension: true,
        appoggiatura: true,
      },
      accidentals: { diatonicByDefault: true, requireExplicitReason: true },
    },
  };

  const QUESTION_DEFAULTS = {
    missing: { repetition: { requireExactCopy: false }, questionOverrides: { preferredBars: [4, 5, 6, 7] } },
    rhythmicDictation: { questionOverrides: { targetBars: [8], mayReplaceRhythm: true } },
    accidentals: { questionOverrides: { targetBars: [8, 9, 10, 11], mayReplaceHarmony: true } },
    rests: { questionOverrides: { targetBars: [8, 9, 10, 11], mayReplaceRhythm: true } },
    rhythmIdentification: { questionOverrides: { targetBars: [8, 9, 10, 11], mayReplaceRhythm: true } },
    barlines: { rhythm: { allowRests: true }, questionOverrides: { targetBars: [8, 9, 10, 11] } },
    ahChord: { questionOverrides: { targetBars: [8], mayReplaceHarmony: true } },
    ahBassLine: { questionOverrides: { targetBars: [9], mayReplaceHarmony: true } },
  };

  function deepMerge(base, override) {
    const result = Array.isArray(base) ? [...base] : { ...(base || {}) };
    Object.entries(override || {}).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key] = deepMerge(result[key] || {}, value);
      } else {
        result[key] = Array.isArray(value) ? [...value] : value;
      }
    });
    return result;
  }

  function resolveConfig({ level = "AH", questionTypes = [], overrides = {} } = {}) {
    let config = deepMerge(GLOBAL_DEFAULTS, LEVEL_DEFAULTS[level] || {});
    questionTypes.forEach((questionType) => {
      config = deepMerge(config, QUESTION_DEFAULTS[questionType] || {});
    });
    return deepMerge(config, overrides);
  }

  function hashSeed(seed) {
    const text = String(seed ?? "advanced-higher");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createSeededRandom(seed) {
    let state = hashSeed(seed) || 1;
    return function seededRandom() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomItem(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function weightedItem(items, random) {
    const total = items.reduce((sum, item) => sum + Math.max(0, item.weight || 0), 0);
    let roll = random() * total;
    for (const item of items) {
      roll -= Math.max(0, item.weight || 0);
      if (roll <= 0) return item.value;
    }
    return items.at(-1).value;
  }

  function degreeClass(relativeStep) {
    return ((relativeStep % 7) + 7) % 7 + 1;
  }

  function nearestStepForDegree(degree, previousStep, minStep, maxStep) {
    const targetClass = ((degree - 1) % 7 + 7) % 7;
    const candidates = [];
    for (let step = minStep; step <= maxStep; step += 1) {
      if (((step % 7) + 7) % 7 === targetClass) candidates.push(step);
    }
    return candidates.sort((first, second) => Math.abs(first - previousStep) - Math.abs(second - previousStep))[0];
  }

  function cadencePair(cadenceId, random) {
    if (cadenceId === "perfect") return [random() < 0.28 ? "V7" : "V", "I"];
    if (cadenceId === "imperfect") return [randomItem(["I", "IV", "VI"], random), "V"];
    if (cadenceId === "plagal") return ["IV", "I"];
    return ["V", "VI"];
  }

  function buildHarmonyPlan(cadenceId, random) {
    const bCadenceId = random() < 0.58 ? "imperfect" : "interrupted";
    const openingMiddle = randomItem(["I", "IV", "VI"], random);
    const openingSecond = randomItem(["IV", "VI"], random);
    const bEnding = cadencePair(bCadenceId, random);
    const finalEnding = cadencePair(cadenceId, random);
    return {
      bCadenceId,
      chords: [
        "I", openingSecond, openingMiddle, "V",
        "I", openingSecond, random() < 0.22 ? "V7" : "V", "I",
        randomItem(["VI", "IV"], random), randomItem(["IV", "V", "VI"], random), bEnding[0], bEnding[1],
        "I", openingSecond, finalEnding[0], finalEnding[1],
      ],
    };
  }

  function phraseForBar(barIndex) {
    return ["A", "A-prime", "B", "A-double-prime"][Math.floor(barIndex / 4)];
  }

  function expectedBeats(timeSignatureId) {
    return { "2/4": 2, "3/4": 3, "4/4": 4, "5/4": 5, "6/8": 3, "9/8": 4.5 }[timeSignatureId] || 4;
  }

  function patternBeats(pattern) {
    return pattern.reduce((sum, rhythm) => sum + (RHYTHM_BEATS[rhythm] || 0), 0);
  }

  function rhythmPool(timeSignatureId, allowRests) {
    const source = RHYTHM_POOLS[timeSignatureId] || RHYTHM_POOLS["4/4"];
    const filtered = allowRests ? source : source.filter((pattern) => !pattern.some((rhythm) => rhythm.endsWith("Rest")));
    return filtered.length ? filtered : source;
  }

  function finalPattern(timeSignatureId) {
    return {
      "2/4": ["minim"],
      "3/4": ["dottedMinim"],
      "4/4": ["semibreve"],
      "5/4": ["dottedMinim", "minim"],
      "6/8": ["dottedMinim"],
      "9/8": ["dottedMinim", "dottedCrotchet"],
    }[timeSignatureId] || ["semibreve"];
  }

  function isStrongBeat(timeSignatureId, beat) {
    if (timeSignatureId === "5/4") return Math.abs(beat) < 0.001 || Math.abs(beat - 3) < 0.001;
    if (timeSignatureId.endsWith("/8")) return Math.abs((beat / 1.5) - Math.round(beat / 1.5)) < 0.001;
    return Math.abs(beat - Math.round(beat)) < 0.001;
  }

  function generateMotif(config, random) {
    const length = Math.floor(config.motifs.minLength + random() * (config.motifs.maxLength - config.motifs.minLength + 1));
    const motif = [0];
    while (motif.length < length) {
      const interval = weightedItem([
        { value: randomItem([-1, 1], random), weight: config.intervalWeights.step },
        { value: randomItem([-2, 2], random), weight: config.intervalWeights.third },
        { value: randomItem([-3, 3], random), weight: config.intervalWeights.larger },
      ], random);
      const next = Math.max(config.pitchRange.minRelativeStep, Math.min(config.pitchRange.maxRelativeStep, motif.at(-1) + interval));
      motif.push(next);
    }
    return motif;
  }

  function choosePitch({ previousStep, previousInterval, chordSymbol, strongBeat, contourTarget, motifTarget, config, random, repeatedRun }) {
    const chordDegrees = CHORD_DEGREES[chordSymbol] || CHORD_DEGREES.I;
    const candidates = [];
    for (let step = config.pitchRange.minRelativeStep; step <= config.pitchRange.maxRelativeStep; step += 1) {
      const interval = step - previousStep;
      const distance = Math.abs(interval);
      if (distance > config.leapRules.maxLeap) continue;
      if (strongBeat && !chordDegrees.includes(degreeClass(step))) continue;
      if (repeatedRun >= config.repetition.maxConsecutive && distance === 0) continue;
      if (Math.abs(previousInterval) > config.leapRules.recoveryThreshold && interval !== 0) {
        if (Math.sign(interval) === Math.sign(previousInterval) || distance > 1) continue;
      }
      let weight = 1;
      if (distance === 0) weight *= 0.35;
      else if (distance === 1) weight *= config.intervalWeights.step;
      else if (distance === 2) weight *= config.intervalWeights.third;
      else weight *= config.intervalWeights.larger / Math.max(1, distance - 2);
      if (chordDegrees.includes(degreeClass(step))) weight *= strongBeat ? 4 : 1.5;
      weight /= 1 + Math.abs(step - contourTarget) * 0.8;
      weight /= 1 + Math.abs(step - motifTarget) * 0.35;
      candidates.push({ value: step, weight });
    }
    return weightedItem(candidates.length ? candidates : [{ value: previousStep, weight: 1 }], random);
  }

  function cadenceTemplate(cadenceId, random) {
    return [...randomItem(CADENCE_TEMPLATES[cadenceId] || CADENCE_TEMPLATES.perfect, random)];
  }

  function generateBar({ barIndex, chordSymbol, pattern, previousStep, previousInterval, motif, contourTarget, cadenceDegrees = [], timeSignatureId, config, random, existingNotes }) {
    let beat = 0;
    let repeatedRun = 1;
    const notes = [];
    const soundingIndexes = pattern.map((rhythm, index) => rhythm.endsWith("Rest") ? null : index).filter((index) => index !== null);
    const cadenceStart = Math.max(0, soundingIndexes.length - cadenceDegrees.length);
    pattern.forEach((rhythm, noteIndex) => {
      if (rhythm.endsWith("Rest")) {
        notes.push({ rhythm, beat, beats: RHYTHM_BEATS[rhythm], rest: true, relativeStep: null });
        beat += RHYTHM_BEATS[rhythm];
        return;
      }
      const soundingPosition = soundingIndexes.indexOf(noteIndex);
      let relativeStep;
      let cadenceTone = false;
      if (cadenceDegrees.length && soundingPosition >= cadenceStart) {
        const degree = cadenceDegrees[soundingPosition - cadenceStart + Math.max(0, cadenceDegrees.length - soundingIndexes.length)];
        relativeStep = nearestStepForDegree(degree, previousStep, config.pitchRange.minRelativeStep, config.pitchRange.maxRelativeStep);
        cadenceTone = true;
      } else if (existingNotes?.[noteIndex] && !existingNotes[noteIndex].rest) {
        relativeStep = existingNotes[noteIndex].relativeStep;
      } else {
        relativeStep = choosePitch({
          previousStep,
          previousInterval,
          chordSymbol,
          strongBeat: isStrongBeat(timeSignatureId, beat),
          contourTarget,
          motifTarget: motif[(noteIndex + Math.floor(barIndex / 4)) % motif.length],
          config,
          random,
          repeatedRun,
        });
      }
      const interval = relativeStep - previousStep;
      repeatedRun = interval === 0 ? repeatedRun + 1 : 1;
      notes.push({ rhythm, beat, beats: RHYTHM_BEATS[rhythm], rest: false, relativeStep, cadenceTone });
      previousInterval = interval;
      previousStep = relativeStep;
      beat += RHYTHM_BEATS[rhythm];
    });
    return { barIndex, phrase: phraseForBar(barIndex), chordSymbol, pattern: [...pattern], notes, previousStep, previousInterval };
  }

  function comparableBarSignature(bar) {
    return bar.notes.map((note) => note.rest ? `R:${note.rhythm}` : `${note.relativeStep}:${note.rhythm}`).join("|");
  }

  function rhythmSignature(bar) {
    return bar.pattern.join("|");
  }

  function scorePlan(plan, config) {
    const penalties = [];
    const hardFailures = [];
    const sounding = plan.bars.flatMap((bar) => bar.notes.filter((note) => !note.rest).map((note) => ({ ...note, barIndex: bar.barIndex })));
    const expected = expectedBeats(plan.timeSignatureId);
    plan.bars.forEach((bar) => {
      if (Math.abs(patternBeats(bar.pattern) - expected) > 0.001) hardFailures.push(`bar-${bar.barIndex + 1}-duration`);
      const chordDegrees = CHORD_DEGREES[bar.chordSymbol] || CHORD_DEGREES.I;
      const unsupportedStrongNotes = bar.notes.filter((note) => (
        !note.rest
        && !note.cadenceTone
        && isStrongBeat(plan.timeSignatureId, note.beat)
        && !chordDegrees.includes(degreeClass(note.relativeStep))
      )).length;
      if (unsupportedStrongNotes) penalties.push({
        id: `bar-${bar.barIndex + 1}-strong-beat-non-chord-tone`,
        amount: config.validation.penalties.significant * unsupportedStrongNotes,
      });
    });
    if (plan.bars.length !== 16) hardFailures.push("incorrect-bar-count");
    if (sounding[0]?.relativeStep !== 0) hardFailures.push("opening-is-not-tonic");

    const finalExpectedDegree = { perfect: 1, plagal: 1, imperfect: 5, interrupted: 6 }[plan.cadenceId];
    if (degreeClass(sounding.at(-1)?.relativeStep) !== finalExpectedDegree) hardFailures.push("incorrect-final-degree");

    const steps = sounding.map((note) => note.relativeStep);
    const range = Math.max(...steps) - Math.min(...steps);
    if (range > config.pitchRange.maxTotalRange) hardFailures.push("range-exceeded");

    const intervals = sounding.slice(1).map((note, index) => note.relativeStep - sounding[index].relativeStep);
    const unrecovered = intervals.filter((interval, index) => (
      Math.abs(interval) > config.leapRules.recoveryThreshold
      && index < intervals.length - 1
      && (Math.sign(intervals[index + 1]) === Math.sign(interval) || Math.abs(intervals[index + 1]) > 1)
    )).length;
    if (unrecovered) penalties.push({ id: "unrecovered-leaps", amount: config.validation.penalties.major * unrecovered });

    const highest = Math.max(...steps);
    const highestBars = sounding.filter((note) => note.relativeStep === highest).map((note) => note.barIndex);
    if (!highestBars.some((barIndex) => config.climax.preferredBars.includes(barIndex))) {
      penalties.push({ id: "missing-b-climax", amount: config.validation.penalties.major });
    }
    if (highestBars.some((barIndex) => barIndex < 4)) penalties.push({ id: "climax-too-early", amount: config.validation.penalties.significant });

    const aPrimeRecall = comparableBarSignature(plan.bars[0]) === comparableBarSignature(plan.bars[4])
      && comparableBarSignature(plan.bars[1]) === comparableBarSignature(plan.bars[5]);
    if (!aPrimeRecall) penalties.push({ id: "weak-a-prime-recall", amount: config.validation.penalties.major });
    const recapRecall = comparableBarSignature(plan.bars[0]) === comparableBarSignature(plan.bars[12])
      && comparableBarSignature(plan.bars[1]) === comparableBarSignature(plan.bars[13]);
    if (!recapRecall) penalties.push({ id: "weak-recap-recall", amount: config.validation.penalties.major });

    const aRhythms = new Set(plan.bars.slice(0, 4).map(rhythmSignature));
    const bHasContrast = plan.bars.slice(8, 12).some((bar) => !aRhythms.has(rhythmSignature(bar)));
    if (!bHasContrast) penalties.push({ id: "insufficient-b-contrast", amount: config.validation.penalties.significant });

    const rhythmCounts = new Map();
    plan.bars.slice(0, 15).forEach((bar) => rhythmCounts.set(rhythmSignature(bar), (rhythmCounts.get(rhythmSignature(bar)) || 0) + 1));
    const mostRepeatedRhythm = Math.max(...rhythmCounts.values());
    if (mostRepeatedRhythm > 7) penalties.push({ id: "excessive-rhythm-repetition", amount: config.validation.penalties.minor });

    const score = Math.max(0, 100 - penalties.reduce((sum, penalty) => sum + penalty.amount, 0));
    return { score, penalties, hardFailures, accepted: !hardFailures.length && score >= config.validation.threshold };
  }

  function generateAttempt({ cadenceId, timeSignatureId, allowRests, config, random }) {
    const harmony = buildHarmonyPlan(cadenceId, random);
    const motif = generateMotif(config, random);
    const pool = rhythmPool(timeSignatureId, allowRests);
    const noRestPool = pool.filter((pattern) => !pattern.some((rhythm) => rhythm.endsWith("Rest")));
    const phraseA = Array.from({ length: 4 }, (_, index) => [...randomItem(index === 0 && noRestPool.length ? noRestPool : pool, random)]);
    const phraseAPrime = [
      [...phraseA[0]],
      [...phraseA[1]],
      [...randomItem(pool, random)],
      [...randomItem(pool, random)],
    ];
    const densePool = [...pool].sort((first, second) => second.length - first.length);
    const phraseB = Array.from({ length: 4 }, (_, index) => [...randomItem(index % 2 === 0 ? densePool.slice(0, Math.max(1, Math.ceil(densePool.length / 2))) : pool, random)]);
    const phraseRecap = [[...phraseA[0]], [...phraseA[1]], [...randomItem(pool, random)], finalPattern(timeSignatureId)];
    const patterns = [...phraseA, ...phraseAPrime, ...phraseB, ...phraseRecap];
    const contours = [0, 1, 2, 1, 0, 2, 3, 1, 2, 4, 6, 3, 0, 1, 1, 0];
    const cadenceByEndBar = { 3: "imperfect", 7: "perfect", 11: harmony.bCadenceId, 15: cadenceId };
    const cadenceDegreesByBar = {};
    Object.entries(cadenceByEndBar).forEach(([endBarText, phraseCadenceId]) => {
      const endBar = Number(endBarText);
      const template = cadenceTemplate(phraseCadenceId, random);
      cadenceDegreesByBar[endBar] = template;
    });
    const bars = [];
    let previousStep = 0;
    let previousInterval = 0;
    for (let barIndex = 0; barIndex < 16; barIndex += 1) {
      const sourceBar = barIndex === 4 || barIndex === 12 ? bars[0] : barIndex === 5 || barIndex === 13 ? bars[1] : null;
      const bar = generateBar({
        barIndex,
        chordSymbol: harmony.chords[barIndex],
        pattern: patterns[barIndex],
        previousStep,
        previousInterval,
        motif,
        contourTarget: contours[barIndex],
        cadenceDegrees: cadenceDegreesByBar[barIndex] || [],
        timeSignatureId,
        config,
        random,
        existingNotes: sourceBar?.notes,
      });
      if (barIndex === 0 && bar.notes.find((note) => !note.rest)) {
        const firstIndex = bar.notes.findIndex((note) => !note.rest);
        bar.notes[firstIndex].relativeStep = 0;
      }
      bars.push(bar);
      previousStep = bar.previousStep;
      previousInterval = bar.previousInterval;
    }
    const plan = {
      version: 1,
      level: "AH",
      timeSignatureId,
      cadenceId,
      bCadenceId: harmony.bCadenceId,
      motif,
      bars: bars.map(({ previousStep: ignoredStep, previousInterval: ignoredInterval, ...bar }) => bar),
    };
    plan.validation = scorePlan(plan, config);
    return plan;
  }

  function generateAdvancedHigherPlan({ seed = Date.now(), cadenceId = "perfect", timeSignatureId = "4/4", allowRests = true, questionTypes = [], overrides = {} } = {}) {
    const config = resolveConfig({ level: "AH", questionTypes, overrides });
    const random = createSeededRandom(seed);
    let best = null;
    for (let attempt = 0; attempt < config.validation.maxAttempts; attempt += 1) {
      const plan = generateAttempt({ cadenceId, timeSignatureId, allowRests, config, random });
      plan.seed = String(seed);
      plan.attempt = attempt + 1;
      if (!best || plan.validation.score > best.validation.score) best = plan;
      if (plan.validation.accepted) return plan;
    }
    return best;
  }

  function relativeStepToMidi(relativeStep, tonicMidi = 60, mode = "major") {
    const scale = mode === "minor" ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    const octave = Math.floor(relativeStep / 7);
    const degreeIndex = ((relativeStep % 7) + 7) % 7;
    return tonicMidi + octave * 12 + scale[degreeIndex];
  }

  function summarisePlan(plan, { tonicMidi = 60, mode = "major" } = {}) {
    return plan.bars.map((bar) => ({
      bar: bar.barIndex + 1,
      phrase: bar.phrase,
      harmony: bar.chordSymbol,
      rhythm: [...bar.pattern],
      relativeSteps: bar.notes.filter((note) => !note.rest).map((note) => note.relativeStep),
      midi: bar.notes
        .filter((note) => !note.rest)
        .map((note) => relativeStepToMidi(note.relativeStep, tonicMidi, mode)),
    }));
  }

  return {
    GLOBAL_DEFAULTS,
    LEVEL_DEFAULTS,
    QUESTION_DEFAULTS,
    CADENCE_TEMPLATES,
    CHORD_DEGREES,
    createSeededRandom,
    resolveConfig,
    generateAdvancedHigherPlan,
    relativeStepToMidi,
    scorePlan,
    summarisePlan,
  };
}));
