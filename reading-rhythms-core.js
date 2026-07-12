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
    passPercentage: 60,
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

  const DENSITY = Object.freeze({ low: 0, medium: 1, high: 2 });
  const ALL_ROLES = Object.freeze(["opening", "middle", "ending"]);
  const PHRASE_PROFILES = Object.freeze({
    N3: { templates: [["AA", 50], ["AA_PRIME", 40], ["QUESTION_ANSWER", 10]], contrastRange: [0.6, 0.8], maximumHighShare: 0 },
    N4: { templates: [["AA", 45], ["AA_PRIME", 45], ["QUESTION_ANSWER", 10]], contrastRange: [0.6, 0.8], maximumHighShare: 0.4 },
    N5: { templates: [["AA", 20], ["AA_PRIME", 50], ["QUESTION_ANSWER", 30]], contrastRange: [0.4, 0.6], maximumHighShare: 0.45 },
    H: { templates: [["AA", 10], ["AA_PRIME", 45], ["QUESTION_ANSWER", 45]], contrastRange: [0.2, 0.4], maximumHighShare: 0.5 },
    AH: { templates: [["AA", 10], ["AA_PRIME", 45], ["QUESTION_ANSWER", 45]], contrastRange: [0.2, 0.4], maximumHighShare: 0.55 },
  });

  function cell(id, events, metadata = {}) {
    return {
      id,
      events,
      duration: events.reduce((sum, rhythmId) => sum + RHYTHMS[rhythmId].durationBeats, 0),
      groupType: metadata.groupType || null,
      eventGroups: metadata.eventGroups || null,
      concepts: metadata.concepts || [...new Set(events.map(selectableRhythmId))],
      difficulty: metadata.difficulty || 1,
      density: metadata.density || "low",
      phraseRoles: metadata.phraseRoles || ALL_ROLES,
      startsWithRest: Boolean(RHYTHMS[events[0]]?.rest),
      syncopated: Boolean(metadata.syncopated),
      family: metadata.family || id,
      variationOf: metadata.variationOf || null,
      weight: metadata.weight || 30,
    };
  }

  function enabledRhythmSet(level, enabledRhythms) {
    const official = LEVELS[level].rhythmIds;
    if (!enabledRhythms) return new Set(official);
    if (Array.isArray(enabledRhythms)) return new Set(enabledRhythms.filter((id) => official.includes(id)));
    return new Set(official.filter((id) => enabledRhythms[id]));
  }

  function selectableRhythmId(rhythm) {
    if (rhythm === "triplet-quaver") return "quaver";
    if (rhythm === "triplet-crotchet") return "crotchet";
    if (rhythm.endsWith("-rest")) return rhythm.slice(0, -5);
    return rhythm;
  }

  function groupIsEnabled(item, enabled, restsEnabled = true) { return item.events.every((rhythm) => (restsEnabled || !RHYTHMS[rhythm].rest) && enabled.has(selectableRhythmId(rhythm))); }

  function canFillBar(groups, durationBeats, memo = new Map()) {
    const units = Math.round(durationBeats * 12);
    if (units === 0) return true;
    if (units < 0) return false;
    if (memo.has(units)) return memo.get(units);
    memo.set(units, false);
    const possible = groups.some((item) => canFillBar(groups, (units - Math.round(item.duration * 12)) / 12, memo));
    memo.set(units, possible);
    return possible;
  }

  function simpleGroups(level) {
    const groups = [
      cell("simple_crotchet", ["crotchet"], { family: "steady", weight: 50 }),
      cell("simple_minim", ["minim"], { family: "sustained", weight: 44 }),
      cell("simple_dotted_minim", ["dotted-minim"], { family: "sustained", weight: 30 }),
      cell("simple_semibreve", ["semibreve"], { family: "sustained", weight: 24 }),
      cell("simple_two_crotchets", ["crotchet", "crotchet"], { family: "steady", variationOf: "simple_minim", weight: 36 }),
      cell("simple_three_crotchets", ["crotchet", "crotchet", "crotchet"], { family: "steady", variationOf: "simple_dotted_minim", weight: 22 }),
      cell("simple_four_crotchets", ["crotchet", "crotchet", "crotchet", "crotchet"], { family: "steady", variationOf: "simple_semibreve", weight: 16 }),
    ];
    if (level !== "N3") {
      groups.push(cell("simple_quaver_pair", ["quaver", "quaver"], { groupType: "beam", family: "quaver_pair", density: "medium", weight: 42 }));
      groups.push(cell("simple_four_semiquavers", ["semiquaver", "semiquaver", "semiquaver", "semiquaver"], { groupType: "beam", family: "semiquaver_group", density: "high", difficulty: 2, phraseRoles: ["middle"], weight: 12 }));
      groups.push(cell("simple_quaver_two_semiquavers", ["quaver", "semiquaver", "semiquaver"], { groupType: "beam", family: "mixed_quaver_semiquaver", density: "high", difficulty: 2, phraseRoles: ["middle"], weight: 16 }));
      groups.push(cell("simple_two_semiquavers_quaver", ["semiquaver", "semiquaver", "quaver"], { groupType: "beam", family: "mixed_quaver_semiquaver", density: "high", difficulty: 2, phraseRoles: ["middle"], variationOf: "simple_quaver_two_semiquavers", weight: 16 }));
      groups.push(cell("simple_crotchet_quaver_pair", ["crotchet", "quaver", "quaver"], { groupType: "beam", eventGroups: [null, "a", "a"], family: "crotchet_quavers", density: "medium", weight: 32 }));
      groups.push(cell("simple_quaver_pair_crotchet", ["quaver", "quaver", "crotchet"], { groupType: "beam", eventGroups: ["a", "a", null], family: "crotchet_quavers", density: "medium", variationOf: "simple_crotchet_quaver_pair", weight: 30 }));
      groups.push(cell("simple_four_quavers", ["quaver", "quaver", "quaver", "quaver"], { groupType: "beam", eventGroups: ["a", "a", "b", "b"], family: "quaver_pair", density: "medium", weight: 26 }));
    }
    if (["N5", "H", "AH"].includes(level)) {
      groups.push(cell("simple_dotted_quaver_semiquaver", ["dotted-quaver", "semiquaver"], { groupType: "beam", family: "dotted_pattern", density: "high", difficulty: 3, phraseRoles: ["middle"], weight: 14 }));
      groups.push(cell("simple_dotted_crotchet_quaver", ["dotted-crotchet", "quaver"], { family: "dotted_pattern", density: "medium", difficulty: 2, weight: 28 }));
      if (level === "AH") groups.push(cell("simple_quaver_dotted_crotchet", ["quaver", "dotted-crotchet"], { family: "syncopated_dotted", density: "high", difficulty: 4, phraseRoles: ["middle"], syncopated: true, weight: 7 }));
    }
    if (LEVELS[level].triplets) {
      groups.push(cell("simple_quaver_triplet", ["triplet-quaver", "triplet-quaver", "triplet-quaver"], { groupType: "triplet", family: "triplet", density: "high", difficulty: 3, phraseRoles: ["middle", "ending"], weight: 12 }));
      groups.push(cell("simple_crotchet_triplet", ["triplet-crotchet", "triplet-crotchet", "triplet-crotchet"], { groupType: "triplet", family: "triplet", density: "medium", difficulty: 3, phraseRoles: ["middle"], weight: 9 }));
    }
    if (LEVELS[level].syncopation) groups.push(cell("simple_quaver_crotchet_quaver", ["quaver", "crotchet", "quaver"], { family: "syncopation", density: "high", difficulty: 4, phraseRoles: ["middle"], syncopated: true, weight: 5 }));
    if (LEVELS[level].rests) {
      groups.push(cell("simple_crotchet_rest", ["crotchet-rest"], { family: "rest", density: "low", difficulty: 2, phraseRoles: ["middle"], weight: 10 }));
      groups.push(cell("simple_minim_rest", ["minim-rest"], { family: "rest", density: "low", difficulty: 2, phraseRoles: ["middle"], weight: 7 }));
      groups.push(cell("simple_quaver_rest_quaver", ["quaver-rest", "quaver"], { family: "rest", density: "medium", difficulty: 3, phraseRoles: ["middle"], weight: 8 }));
    }
    return groups;
  }

  function compoundGroups(level) {
    const groups = [
      cell("compound_dotted_crotchet", ["dotted-crotchet"], { family: "compound_pulse", weight: 50 }),
      cell("compound_crotchet_quaver", ["crotchet", "quaver"], { family: "compound_split", density: "medium", weight: 32 }),
      cell("compound_quaver_crotchet", ["quaver", "crotchet"], { family: "compound_split", density: "medium", variationOf: "compound_crotchet_quaver", weight: 28 }),
      cell("compound_three_quavers", ["quaver", "quaver", "quaver"], { groupType: "beam", family: "compound_quavers", density: "high", difficulty: 2, weight: 22 }),
    ];
    if (LEVELS[level].rests) groups.push(cell("compound_dotted_crotchet_rest", ["dotted-crotchet-rest"], { family: "rest", difficulty: 2, phraseRoles: ["middle"], weight: 9 }));
    return groups;
  }

  function availableGroups(level, signature, enabledRhythms, options = {}) {
    const enabled = enabledRhythmSet(level, enabledRhythms);
    const restsEnabled = options.restsEnabled ?? LEVELS[level].rests;
    return (signature.compound ? compoundGroups(level) : simpleGroups(level)).filter((item) => groupIsEnabled(item, enabled, restsEnabled));
  }

  function canGenerateWithEnabled(level, enabledRhythms, options = {}) {
    const safeLevel = LEVELS[level] ? level : "N3";
    const enabledSignatureIds = options.timeSignatureIds || LEVELS[safeLevel].timeSignatureIds;
    return LEVELS[safeLevel].timeSignatureIds.filter((id) => enabledSignatureIds.includes(id)).some((id) => {
      const signature = TIME_SIGNATURES[id];
      const groups = availableGroups(safeLevel, signature, enabledRhythms, options);
      return groups.length && canFillBar(groups, signature.quarterBeatsPerBar);
    });
  }

  function weightedItem(items, random = Math.random, weightFor = (item) => item.weight || 1) {
    const weighted = items.map((item) => ({ item, weight: Math.max(0.01, Number(weightFor(item)) || 0.01) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let target = random() * total;
    for (const entry of weighted) { target -= entry.weight; if (target <= 0) return entry.item; }
    return weighted.at(-1)?.item;
  }

  function choosePhraseTemplate(level, random) {
    return weightedItem(PHRASE_PROFILES[level].templates, random, (entry) => entry[1])[0];
  }

  function candidateRole(result, candidate, remaining) {
    if (!result.length) return "opening";
    if (closeEnough(candidate.duration, remaining)) return "ending";
    return "middle";
  }

  function chooseCellsForBar(level, signature, random = Math.random, enabledRhythms = null, generationOptions = {}) {
    const options = availableGroups(level, signature, enabledRhythms, generationOptions);
    const result = [];
    let remaining = signature.quarterBeatsPerBar;
    let guard = 0;
    let highDuration = 0;
    while (remaining > 1e-7 && guard < 40) {
      guard += 1;
      const fillable = options.filter((item) => item.duration <= remaining + 1e-7 && canFillBar(options, remaining - item.duration));
      const roleMatched = fillable.filter((item) => item.phraseRoles.includes(candidateRole(result, item, remaining)));
      let candidates = roleMatched.length ? roleMatched : fillable;
      if (!candidates.length) return [];
      const previous = result.at(-1);
      const smooth = candidates.filter((item) => !previous || Math.abs(DENSITY[item.density] - DENSITY[previous.density]) <= 1);
      if (smooth.length) candidates = smooth;
      const selected = weightedItem(candidates, random, (item) => {
        let weight = item.weight;
        if (previous?.family === item.family) weight *= 1.3;
        const projectedHighShare = (highDuration + (item.density === "high" ? item.duration : 0)) / signature.quarterBeatsPerBar;
        if (projectedHighShare > PHRASE_PROFILES[level].maximumHighShare) weight *= 0.08;
        if (candidateRole(result, item, remaining) === "ending" && item.density === "low") weight *= 1.45;
        return weight;
      });
      result.push(selected);
      if (selected.density === "high") highDuration += selected.duration;
      remaining -= selected.duration;
    }
    if (!closeEnough(remaining, 0)) return [];
    return result;
  }

  function makeBarFromCells(selectedGroups, barIndex) {
    const events = [];
    let cursor = 0;
    selectedGroups.forEach((selectedGroup, groupIndex) => {
      selectedGroup.events.forEach((rhythm, eventIndex) => {
        const info = RHYTHMS[rhythm];
        const groupToken = selectedGroup.eventGroups ? selectedGroup.eventGroups[eventIndex] : selectedGroup.groupType ? "all" : null;
        const groupId = groupToken ? `b${barIndex}-g${groupIndex}-${groupToken}` : null;
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
          cellId: selectedGroup.id,
        };
        events.push(event);
        cursor += info.durationBeats;
      });
    });
    return { barIndex, events, durationBeats: cursor, cellIds: selectedGroups.map((item) => item.id), cellDensities: selectedGroups.map((item) => item.density) };
  }

  function alternativeForCell(original, index, sourceCells, options, random, preferRelated = true) {
    const role = index === 0 ? "opening" : index === sourceCells.length - 1 ? "ending" : "middle";
    const candidates = options.filter((item) => item.id !== original.id && closeEnough(item.duration, original.duration) && item.phraseRoles.includes(role));
    if (!candidates.length) return original;
    const family = candidates.filter((item) => item.family === original.family || item.variationOf === original.id || original.variationOf === item.id);
    const contrast = candidates.filter((item) => !family.includes(item));
    const pool = preferRelated ? (family.length ? family : candidates) : (contrast.length ? contrast : candidates);
    return weightedItem(pool, random, (item) => item.weight / Math.max(1, item.difficulty));
  }

  function secondBarCells(level, template, firstCells, options, random) {
    if (template === "AA") return firstCells.slice();
    if (template === "AA_PRIME") {
      const result = firstCells.slice();
      for (let index = result.length - 1; index >= 0; index -= 1) {
        const alternative = alternativeForCell(result[index], index, result, options, random);
        if (alternative.id !== result[index].id) { result[index] = alternative; break; }
      }
      return result;
    }
    const [minimum, maximum] = PHRASE_PROFILES[level].contrastRange;
    const targetRatio = minimum + random() * (maximum - minimum);
    const totalDuration = firstCells.reduce((sum, item) => sum + item.duration, 0);
    const keep = new Set();
    const indices = firstCells.map((_, index) => index);
    for (let index = indices.length - 1; index > 0; index -= 1) { const swap = Math.floor(random() * (index + 1)); [indices[index], indices[swap]] = [indices[swap], indices[index]]; }
    indices.sort((a, b) => (a === 0 ? -1 : b === 0 ? 1 : 0));
    let keptDuration = 0;
    for (const index of indices) {
      if (keptDuration / totalDuration >= targetRatio && keep.size) break;
      keep.add(index); keptDuration += firstCells[index].duration;
    }
    return firstCells.map((item, index) => keep.has(index) ? item : alternativeForCell(item, index, firstCells, options, random, false));
  }

  function applyOneTie(level, signature, bars, random, generationOptions) {
    const tiesAvailable = LEVELS[level].ties && (generationOptions.tiesEnabled ?? true) && !signature.compound && signature.id !== "2/4";
    if (!tiesAvailable || random() >= 0.3) return;
    const candidates = [];
    bars.forEach((bar) => bar.events.forEach((event, index) => {
        const next = bar.events[index + 1];
        if (event.type !== "note" || next?.type !== "note") return;
        if (event.rhythm !== "quaver" || !["quaver", "crotchet"].includes(next.rhythm)) return;
        const startsOffBeat = closeEnough(event.startBeats % 1, .5);
        const nextStartsOnBeat = closeEnough(next.startBeats % 1, 0);
        if (startsOffBeat && nextStartsOnBeat && event.groupId !== next.groupId) candidates.push({ bar, index });
      }));
    const candidate = candidates.length ? randomItem(candidates, random) : null;
    if (!candidate) return;
    candidate.bar.events[candidate.index].tiedToNext = true;
    candidate.bar.events[candidate.index + 1].tiedFromPrevious = true;
    candidate.bar.events[candidate.index + 1].requiresTap = false;
  }

  function relatedDurationRatio(firstCells, secondCells) {
    const total = firstCells.reduce((sum, item) => sum + item.duration, 0);
    const related = firstCells.reduce((sum, item, index) => {
      const other = secondCells[index];
      const closelyRelated = other && (other.id === item.id || other.family === item.family || other.variationOf === item.id || item.variationOf === other.id);
      return sum + (closelyRelated ? item.duration : 0);
    }, 0);
    return total ? related / total : 0;
  }

  function averageDensity(cells) {
    const duration = cells.reduce((sum, item) => sum + item.duration, 0);
    return duration ? cells.reduce((sum, item) => sum + DENSITY[item.density] * item.duration, 0) / duration : 0;
  }

  function validatePhrase(rhythm, firstCells, secondCells) {
    if (rhythm.bars.some((bar) => !closeEnough(bar.durationBeats, rhythm.timeSignature.quarterBeatsPerBar))) return false;
    if (rhythm.bars.some((bar) => !bar.events.length || bar.events[0].type === "rest" || bar.events.at(-1).type === "rest")) return false;
    if (rhythm.expectedOnsetsBeats.length < 3) return false;
    if (averageDensity(secondCells) > averageDensity(firstCells) + 1) return false;
    if (relatedDurationRatio(firstCells, secondCells) < 0.19) return false;
    const allCells = [...firstCells, ...secondCells];
    if (allCells.length > 2 && allCells.every((item) => item.density === "high")) return false;
    const maximumHighShare = PHRASE_PROFILES[rhythm.level].maximumHighShare;
    if (maximumHighShare > 0 && [firstCells, secondCells].some((cells) => cells.reduce((sum, item) => sum + (item.density === "high" ? item.duration : 0), 0) / rhythm.timeSignature.quarterBeatsPerBar > maximumHighShare + 1e-7)) return false;
    if ([firstCells, secondCells].some((cells) => cells.some((item, index) => item.density === "high" && cells[index + 1]?.density === "high" && cells[index + 1].family !== item.family))) return false;
    if (rhythm.bars.some((bar) => bar.events.filter((event) => event.type === "rest").length > Math.max(1, Math.floor(bar.events.length / 3)))) return false;
    return true;
  }

  function fallbackCells(options, duration, minimumOnsets = 0) {
    function onsetCount(cells) { return cells.reduce((sum, item) => sum + item.events.filter((rhythmId) => !RHYTHMS[rhythmId].rest).length, 0); }
    function fill(remaining, selected) {
      if (closeEnough(remaining, 0)) return onsetCount(selected) >= minimumOnsets ? selected : null;
      const candidates = options.filter((item) => item.duration <= remaining + 1e-7).sort((a, b) => {
        const roleA = a.phraseRoles.includes(candidateRole(selected, a, remaining)) ? 0 : 1;
        const roleB = b.phraseRoles.includes(candidateRole(selected, b, remaining)) ? 0 : 1;
        return roleA - roleB || DENSITY[a.density] - DENSITY[b.density] || b.weight - a.weight || a.id.localeCompare(b.id);
      });
      for (const candidate of candidates) { const result = fill(remaining - candidate.duration, [...selected, candidate]); if (result) return result; }
      return null;
    }
    return fill(duration, []) || [];
  }

  function rhythmSignature(rhythm) {
    return `${rhythm.timeSignature.id}|${rhythm.bars.map((bar) => bar.events.map((event) => `${event.rhythm}${event.tiedToNext ? "~" : ""}`).join(",")).join("|")}`;
  }

  function generateRhythm(level = "N3", random = Math.random, previousSignature = "", enabledRhythms = null, generationOptions = {}) {
    const safeLevel = LEVELS[level] ? level : "N3";
    const enabledSignatureIds = generationOptions.timeSignatureIds || LEVELS[safeLevel].timeSignatureIds;
    const viableSignatureIds = LEVELS[safeLevel].timeSignatureIds.filter((id) => enabledSignatureIds.includes(id)).filter((id) => {
      const options = availableGroups(safeLevel, TIME_SIGNATURES[id], enabledRhythms, generationOptions);
      return options.length && canFillBar(options, TIME_SIGNATURES[id].quarterBeatsPerBar);
    });
    const signatureIds = viableSignatureIds.length ? viableSignatureIds : LEVELS[safeLevel].timeSignatureIds;
    let rhythm;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const timeSignature = TIME_SIGNATURES[randomItem(signatureIds, random)];
      const options = availableGroups(safeLevel, timeSignature, enabledRhythms, generationOptions);
      const firstCells = chooseCellsForBar(safeLevel, timeSignature, random, enabledRhythms, generationOptions);
      if (!firstCells.length) continue;
      const phraseTemplate = choosePhraseTemplate(safeLevel, random);
      const secondCells = secondBarCells(safeLevel, phraseTemplate, firstCells, options, random);
      const bars = [makeBarFromCells(firstCells, 0), makeBarFromCells(secondCells, 1)];
      rhythm = { level: safeLevel, timeSignature, bars, phraseTemplate, relatedMaterial: relatedDurationRatio(firstCells, secondCells) };
      applyOneTie(safeLevel, timeSignature, bars, random, generationOptions);
      rhythm.expectedOnsetsBeats = expectedOnsetsBeats(rhythm);
      if (validatePhrase(rhythm, firstCells, secondCells) && rhythmSignature(rhythm) !== previousSignature) return rhythm;
    }
    const timeSignature = TIME_SIGNATURES[signatureIds[0]];
    const options = availableGroups(safeLevel, timeSignature, enabledRhythms, generationOptions);
    const preferredFallback = fallbackCells(options, timeSignature.quarterBeatsPerBar, 2);
    const firstCells = preferredFallback.length ? preferredFallback : fallbackCells(options, timeSignature.quarterBeatsPerBar);
    const bars = [makeBarFromCells(firstCells, 0), makeBarFromCells(firstCells, 1)];
    rhythm = { level: safeLevel, timeSignature, bars, phraseTemplate: "AA", relatedMaterial: 1, fallback: true };
    rhythm.expectedOnsetsBeats = expectedOnsetsBeats(rhythm);
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

  return { TIMING, LEVELS, TIME_SIGNATURES, RHYTHMS, DENSITY, PHRASE_PROFILES, generateRhythm, canGenerateWithEnabled, rhythmSignature, expectedOnsetsBeats, expectedOnsetsSeconds, timingThresholds, matchPerformance };
});
