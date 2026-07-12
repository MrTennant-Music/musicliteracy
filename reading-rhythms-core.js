(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.READING_RHYTHMS_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const TIMING = {
    perfectMs: 60,
    acceptableMs: 120,
    associationMs: 250,
    minimumScale: 0.9,
    maximumScale: 1.2,
    passPercentage: 80,
  };

  // These level lists mirror the established Barlines/Time Signatures rules.
  // Triplets follow the existing Higher/AH Rhythmic Dictation convention.
  const LEVELS = {
    N3: { label: "National 3", rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve"], timeSignatureIds: ["2/4", "3/4", "4/4"], rests: false, ties: false, syncopation: false, triplets: false },
    N4: { label: "National 4", rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver"], timeSignatureIds: ["2/4", "3/4", "4/4"], rests: false, ties: false, syncopation: false, triplets: false },
    N5: { label: "National 5", rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver"], timeSignatureIds: ["2/4", "3/4", "4/4"], rests: false, ties: false, syncopation: false, triplets: false },
    H: { label: "Higher", rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver"], timeSignatureIds: ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"], rests: true, ties: false, syncopation: false, triplets: true },
    AH: { label: "Advanced Higher", rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver"], timeSignatureIds: ["2/4", "3/4", "4/4", "5/4", "6/8", "9/8", "12/8"], rests: true, ties: true, syncopation: true, triplets: true },
  };

  const TIME_SIGNATURES = {
    "2/4": { id: "2/4", numerator: 2, denominator: 4, compound: false, quarterBeatsPerBar: 2, pulseQuarterBeats: 1, pulsesPerBar: 2 },
    "3/4": { id: "3/4", numerator: 3, denominator: 4, compound: false, quarterBeatsPerBar: 3, pulseQuarterBeats: 1, pulsesPerBar: 3 },
    "4/4": { id: "4/4", numerator: 4, denominator: 4, compound: false, quarterBeatsPerBar: 4, pulseQuarterBeats: 1, pulsesPerBar: 4 },
    "5/4": { id: "5/4", numerator: 5, denominator: 4, compound: false, quarterBeatsPerBar: 5, pulseQuarterBeats: 1, pulsesPerBar: 5 },
    "6/8": { id: "6/8", numerator: 6, denominator: 8, compound: true, quarterBeatsPerBar: 3, pulseQuarterBeats: 1.5, pulsesPerBar: 2 },
    "9/8": { id: "9/8", numerator: 9, denominator: 8, compound: true, quarterBeatsPerBar: 4.5, pulseQuarterBeats: 1.5, pulsesPerBar: 3 },
    "12/8": { id: "12/8", numerator: 12, denominator: 8, compound: true, quarterBeatsPerBar: 6, pulseQuarterBeats: 1.5, pulsesPerBar: 4 },
  };

  const RHYTHMS = {
    semibreve: { label: "Semibreve", durationBeats: 4, open: true, stem: false },
    "dotted-minim": { label: "Dotted minim", durationBeats: 3, open: true, stem: true, dotted: true },
    minim: { label: "Minim", durationBeats: 2, open: true, stem: true },
    "dotted-crotchet": { label: "Dotted crotchet", durationBeats: 1.5, stem: true, dotted: true },
    crotchet: { label: "Crotchet", durationBeats: 1, stem: true },
    "dotted-quaver": { label: "Dotted quaver", durationBeats: 0.75, stem: true, dotted: true, beams: 1 },
    quaver: { label: "Quaver", durationBeats: 0.5, stem: true, beams: 1 },
    semiquaver: { label: "Semiquaver", durationBeats: 0.25, stem: true, beams: 2 },
    "triplet-quaver": { label: "Triplet quaver", durationBeats: 1 / 3, stem: true, beams: 1, triplet: true },
    "triplet-crotchet": { label: "Triplet crotchet", durationBeats: 2 / 3, stem: true, triplet: true },
    "minim-rest": { label: "Minim rest", durationBeats: 2, rest: true, restBase: "minim" },
    "dotted-crotchet-rest": { label: "Dotted crotchet rest", durationBeats: 1.5, rest: true, restBase: "crotchet", dotted: true },
    "crotchet-rest": { label: "Crotchet rest", durationBeats: 1, rest: true, restBase: "crotchet" },
    "quaver-rest": { label: "Quaver rest", durationBeats: 0.5, rest: true, restBase: "quaver" },
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomItem(items, random = Math.random) { return items[Math.floor(random() * items.length)]; }
  function closeEnough(a, b) { return Math.abs(a - b) < 1e-7; }

  function group(events, groupType = null) { return { events, duration: events.reduce((sum, id) => sum + RHYTHMS[id].durationBeats, 0), groupType }; }

  function simpleGroups(level) {
    const groups = [group(["crotchet"]), group(["minim"]), group(["dotted-minim"]), group(["semibreve"])];
    if (level !== "N3") {
      groups.push(group(["quaver", "quaver"], "beam"));
      groups.push(group(["semiquaver", "semiquaver", "semiquaver", "semiquaver"], "beam"));
      groups.push(group(["quaver", "semiquaver", "semiquaver"], "beam"));
      groups.push(group(["semiquaver", "semiquaver", "quaver"], "beam"));
    }
    if (["N5", "H", "AH"].includes(level)) {
      groups.push(group(["dotted-quaver", "semiquaver"], "beam"));
      groups.push(group(["semiquaver", "dotted-quaver"], "beam"));
      groups.push(group(["dotted-crotchet", "quaver"], "beam"));
      groups.push(group(["quaver", "dotted-crotchet"], "beam"));
    }
    if (LEVELS[level].triplets) {
      groups.push(group(["triplet-quaver", "triplet-quaver", "triplet-quaver"], "triplet"));
      groups.push(group(["triplet-crotchet", "triplet-crotchet", "triplet-crotchet"], "triplet"));
    }
    if (LEVELS[level].syncopation) groups.push(group(["quaver", "crotchet", "quaver"]));
    return groups;
  }

  function compoundGroups(level) {
    const groups = [
      group(["dotted-crotchet"]),
      group(["crotchet", "quaver"], "beam"),
      group(["quaver", "crotchet"], "beam"),
      group(["quaver", "quaver", "quaver"], "beam"),
    ];
    if (LEVELS[level].rests) groups.push(group(["quaver-rest", "quaver", "quaver"], "beam"));
    return groups;
  }

  function chooseGroupsForBar(level, signature, random = Math.random) {
    if (signature.compound) {
      return Array.from({ length: signature.pulsesPerBar }, () => randomItem(compoundGroups(level), random));
    }
    const options = simpleGroups(level);
    const result = [];
    let remaining = signature.quarterBeatsPerBar;
    let guard = 0;
    while (remaining > 1e-7 && guard < 30) {
      guard += 1;
      const candidates = options.filter((item) => item.duration <= remaining + 1e-7 && (closeEnough(item.duration, remaining) || item.duration <= 1 || remaining - item.duration >= 1 - 1e-7));
      const selected = randomItem(candidates.length ? candidates : options.filter((item) => closeEnough(item.duration, 1)), random);
      result.push(selected);
      remaining -= selected.duration;
    }
    if (!closeEnough(remaining, 0)) return Array.from({ length: signature.quarterBeatsPerBar }, () => group(["crotchet"]));
    return result;
  }

  function maybeConvertToRest(event, level, random) {
    if (!LEVELS[level].rests || random() >= 0.17) return event;
    const restIds = { minim: "minim-rest", "dotted-crotchet": "dotted-crotchet-rest", crotchet: "crotchet-rest", quaver: "quaver-rest" };
    const restId = restIds[event.rhythm];
    return restId ? { ...event, rhythm: restId, type: "rest", requiresTap: false } : event;
  }

  function makeBar(level, signature, barIndex, random = Math.random) {
    const selectedGroups = chooseGroupsForBar(level, signature, random);
    const events = [];
    let cursor = 0;
    selectedGroups.forEach((selectedGroup, groupIndex) => {
      const groupId = selectedGroup.groupType ? `b${barIndex}-g${groupIndex}` : null;
      selectedGroup.events.forEach((rhythm) => {
        const info = RHYTHMS[rhythm];
        let event = {
          id: `b${barIndex}-e${events.length}`,
          type: info.rest ? "rest" : "note",
          rhythm,
          durationBeats: info.durationBeats,
          startBeats: cursor,
          requiresTap: !info.rest,
          tiedFromPrevious: false,
          tiedToNext: false,
          groupId,
          groupType: selectedGroup.groupType,
        };
        if (!groupId && (!signature.compound || rhythm !== "quaver")) event = maybeConvertToRest(event, level, random);
        events.push(event);
        cursor += info.durationBeats;
      });
    });

    if (LEVELS[level].ties && random() < 0.4) {
      const candidates = events.map((event, index) => ({ event, index })).filter(({ event, index }) => event.type === "note" && events[index + 1]?.type === "note" && !event.groupType?.includes("triplet"));
      const candidate = candidates.length ? randomItem(candidates, random) : null;
      if (candidate) {
        events[candidate.index].tiedToNext = true;
        events[candidate.index + 1].tiedFromPrevious = true;
        events[candidate.index + 1].requiresTap = false;
      }
    }
    return { barIndex, events, durationBeats: cursor };
  }

  function rhythmSignature(rhythm) {
    return `${rhythm.timeSignature.id}|${rhythm.bars.map((bar) => bar.events.map((event) => `${event.rhythm}${event.tiedToNext ? "~" : ""}`).join(",")).join("|")}`;
  }

  function generateRhythm(level = "N3", random = Math.random, previousSignature = "") {
    const safeLevel = LEVELS[level] ? level : "N3";
    let rhythm;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const timeSignature = TIME_SIGNATURES[randomItem(LEVELS[safeLevel].timeSignatureIds, random)];
      const bars = [makeBar(safeLevel, timeSignature, 0, random), makeBar(safeLevel, timeSignature, 1, random)];
      rhythm = { level: safeLevel, timeSignature, bars };
      rhythm.expectedOnsetsBeats = expectedOnsetsBeats(rhythm);
      if (rhythm.expectedOnsetsBeats.length >= 2 && rhythmSignature(rhythm) !== previousSignature) break;
    }
    return rhythm;
  }

  function expectedOnsetsBeats(rhythm) {
    const result = [];
    rhythm.bars.forEach((bar) => {
      const barStart = bar.barIndex * rhythm.timeSignature.quarterBeatsPerBar;
      bar.events.forEach((event) => {
        if (event.requiresTap) result.push({ id: event.id, barIndex: bar.barIndex, eventId: event.id, beat: barStart + event.startBeats });
      });
    });
    return result;
  }

  function expectedOnsetsSeconds(rhythm, tempo) {
    const secondsPerPulse = 60 / tempo;
    return rhythm.expectedOnsetsBeats.map((onset) => ({ ...onset, time: onset.beat / rhythm.timeSignature.pulseQuarterBeats * secondsPerPulse }));
  }

  function timingThresholds(tempo) {
    const scale = clamp(Math.sqrt(90 / tempo), TIMING.minimumScale, TIMING.maximumScale);
    return {
      perfectMs: TIMING.perfectMs * scale,
      acceptableMs: TIMING.acceptableMs * scale,
      associationMs: TIMING.associationMs * scale,
    };
  }

  function matchPerformance(expectedSeconds, tapSeconds, tempo) {
    const thresholds = timingThresholds(tempo);
    const expected = expectedSeconds.map((item) => ({ ...item, matched: false }));
    const extras = [];
    const taps = [...tapSeconds].sort((a, b) => a - b);
    taps.forEach((tap, tapIndex) => {
      const candidates = expected.filter((item) => !item.matched).map((item) => ({ item, errorMs: (tap - item.time) * 1000 })).filter(({ errorMs }) => Math.abs(errorMs) <= thresholds.associationMs).sort((a, b) => Math.abs(a.errorMs) - Math.abs(b.errorMs));
      if (!candidates.length) { extras.push({ tapIndex, time: tap, category: "extra" }); return; }
      const match = candidates[0];
      match.item.matched = true;
      match.item.errorMs = match.errorMs;
      const absoluteError = Math.abs(match.errorMs);
      match.item.category = absoluteError <= thresholds.perfectMs ? "perfect" : absoluteError <= thresholds.acceptableMs ? "acceptable" : match.errorMs < 0 ? "early" : "late";
    });
    const results = expected.map((item) => item.matched ? item : { ...item, category: "missed", errorMs: null });
    const counts = { perfect: 0, acceptable: 0, early: 0, late: 0, missed: 0, extra: extras.length };
    results.forEach((item) => { counts[item.category] += 1; });
    const accurate = counts.perfect + counts.acceptable;
    const percentage = expected.length ? Math.round((accurate / expected.length) * 100) : 0;
    const matchedErrors = results.filter((item) => Number.isFinite(item.errorMs)).map((item) => Math.abs(item.errorMs));
    const averageAbsoluteErrorMs = matchedErrors.length ? Math.round(matchedErrors.reduce((sum, value) => sum + value, 0) / matchedErrors.length) : 0;
    return { results, extras, counts, accurate, totalExpected: expected.length, percentage, averageAbsoluteErrorMs, passed: percentage >= TIMING.passPercentage, thresholds };
  }

  return { TIMING, LEVELS, TIME_SIGNATURES, RHYTHMS, generateRhythm, rhythmSignature, expectedOnsetsBeats, expectedOnsetsSeconds, timingThresholds, matchPerformance };
});
