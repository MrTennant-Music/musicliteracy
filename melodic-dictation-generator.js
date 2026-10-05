// Melody generation shared by Melodic Dictation and Aural Recognition.
// The existing question generators retain their original defaults.
(function attachMelodicDictationGenerator(MLH) {
  "use strict";

const BAR_COUNT = 8;

const TIME_SIGNATURES = [
      { id: "2/4", top: 2, bottom: 4, beats: 2 },
      { id: "3/4", top: 3, bottom: 4, beats: 3 },
      { id: "4/4", top: 4, bottom: 4, beats: 4 },
      { id: "6/8", top: 6, bottom: 8, beats: 3 },
    ];

const RHYTHMS = {
      semiquaver: { beats: 0.25, spacing: 0.62, label: "semiquaver" },
      quaver: { beats: 0.5, spacing: 0.95, label: "quaver" },
      crotchet: { beats: 1, spacing: 1.35, label: "crotchet" },
      dottedCrotchet: { beats: 1.5, spacing: 1.75, label: "dotted crotchet" },
      minim: { beats: 2, spacing: 2.15, label: "minim" },
      dottedMinim: { beats: 3, spacing: 2.75, label: "dotted minim" },
      semibreve: { beats: 4, spacing: 3.4, label: "semibreve" },
      crotchetRest: { beats: 1, spacing: 1.15, label: "crotchet rest" },
      quaverRest: { beats: 0.5, spacing: 0.82, label: "quaver rest" },
    };

const BAR_PATTERNS = {
      "2/4": [
        ["crotchet", "crotchet"],
        ["minim"],
        ["dottedCrotchet", "quaver"],
        ["quaver", "quaver", "crotchet"],
        ["crotchet", "quaver", "quaver"],
      ],
      "3/4": [
        ["crotchet", "crotchet", "crotchet"],
        ["minim", "crotchet"],
        ["crotchet", "minim"],
        ["dottedMinim"],
        ["dottedCrotchet", "quaver", "crotchet"],
        ["crotchet", "dottedCrotchet", "quaver"],
        ["quaver", "quaver", "crotchet", "crotchet"],
        ["crotchet", "quaver", "quaver", "crotchet"],
      ],
      "4/4": [
        ["crotchet", "crotchet", "crotchet", "crotchet"],
        ["minim", "crotchet", "crotchet"],
        ["crotchet", "crotchet", "minim"],
        ["dottedMinim", "crotchet"],
        ["crotchet", "dottedMinim"],
        ["dottedCrotchet", "quaver", "minim"],
        ["minim", "dottedCrotchet", "quaver"],
        ["quaver", "quaver", "crotchet", "crotchet", "crotchet"],
        ["crotchet", "quaver", "quaver", "crotchet", "crotchet"],
        ["crotchet", "crotchet", "quaver", "quaver", "crotchet"],
        ["minim", "minim"],
      ],
      "6/8": [
        ["dottedMinim"],
        ["dottedCrotchet", "dottedCrotchet"],
        ["dottedCrotchet", "quaver", "crotchet"],
        ["crotchet", "quaver", "crotchet", "quaver"],
      ],
    };

const AH_BAR_PATTERNS = {
      "2/4": [
        ["quaver", "quaver", "quaver", "quaver"],
        ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "quaver", "quaver"],
        ["quaver", "semiquaver", "semiquaver", "crotchet"],
        ["crotchet", "quaver", "quaver"],
        ["crotchetRest", "quaver", "quaver"],
        ["quaverRest", "quaver", "crotchet"],
      ],
      "3/4": [
        ["quaver", "quaver", "crotchet", "quaver", "quaver"],
        ["crotchet", "semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet"],
        ["dottedCrotchet", "quaver", "crotchet"],
        ["crotchet", "quaver", "quaver", "crotchet"],
        ["crotchetRest", "quaver", "quaver", "crotchet"],
        ["quaverRest", "quaver", "crotchet", "crotchet"],
      ],
      "4/4": [
        ["quaver", "quaver", "crotchet", "quaver", "quaver", "crotchet"],
        ["crotchet", "semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet", "crotchet"],
        ["dottedCrotchet", "quaver", "crotchet", "crotchet"],
        ["crotchet", "quaver", "quaver", "crotchetRest", "crotchet"],
        ["minim", "quaver", "quaver", "crotchet"],
        ["quaverRest", "quaver", "crotchet", "minim"],
      ],
      "6/8": [
        ["quaver", "quaver", "quaver", "quaver", "quaver", "quaver"],
        ["dottedCrotchet", "quaver", "quaver", "quaver"],
        ["quaver", "quaver", "quaver", "dottedCrotchet"],
        ["crotchet", "quaver", "quaverRest", "quaver", "quaver"],
      ],
    };

const NOTE_POOL = [
      { letter: "C", octave: 3, step: -9, midi: 48 },
      { letter: "D", octave: 3, step: -8, midi: 50 },
      { letter: "E", octave: 3, step: -7, midi: 52 },
      { letter: "F", octave: 3, step: -6, midi: 53 },
      { letter: "G", octave: 3, step: -5, midi: 55 },
      { letter: "A", octave: 3, step: -4, midi: 57 },
      { letter: "B", octave: 3, step: -3, midi: 59 },
      { letter: "C", octave: 4, step: -2, midi: 60 },
      { letter: "D", octave: 4, step: -1, midi: 62 },
      { letter: "E", octave: 4, step: 0, midi: 64 },
      { letter: "F", octave: 4, step: 1, midi: 65 },
      { letter: "G", octave: 4, step: 2, midi: 67 },
      { letter: "A", octave: 4, step: 3, midi: 69 },
      { letter: "B", octave: 4, step: 4, midi: 71 },
      { letter: "C", octave: 5, step: 5, midi: 72 },
      { letter: "D", octave: 5, step: 6, midi: 74 },
      { letter: "E", octave: 5, step: 7, midi: 76 },
      { letter: "F", octave: 5, step: 8, midi: 77 },
      { letter: "G", octave: 5, step: 9, midi: 79 },
      { letter: "A", octave: 5, step: 10, midi: 81 },
    ];

const KEYS = [
      { id: "C", tonic: "C", signature: [], chords: { I: ["C", "E", "G"], IV: ["F", "A", "C"], V: ["G", "B", "D"], VI: ["A", "C", "E"] } },
      { id: "F", tonic: "F", signature: [{ type: "flat", step: 4 }], chords: { I: ["F", "A", "C"], IV: ["B", "D", "F"], V: ["C", "E", "G"], VI: ["D", "F", "A"] } },
      { id: "G", tonic: "G", signature: [{ type: "sharp", step: 8 }], chords: { I: ["G", "B", "D"], IV: ["C", "E", "G"], V: ["D", "F", "A"], VI: ["E", "G", "B"] } },
      { id: "Am", tonic: "A", signature: [], chords: { I: ["A", "C", "E"], IV: ["D", "F", "A"], V: ["E", "G", "B"], VI: ["F", "A", "C"] }, raised: { V: { G: 1 } } },
    ];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const rhythmInfo = (rhythm) => RHYTHMS[rhythm] ?? RHYTHMS.crotchet;

const isHigherLevel = (level) => level === "H" || level === "AH";

const timeSignaturesForLevel = (level) => TIME_SIGNATURES.filter((signature) => signature.id !== "6/8" || isHigherLevel(level));

const barPatternsForSignature = (signature) => BAR_PATTERNS[signature.id] ?? BAR_PATTERNS["4/4"];

const hasSemiquaverGroup = (pattern) => pattern.includes("semiquaver");

const isRestRhythm = (rhythm) => rhythm === "crotchetRest" || rhythm === "quaverRest";

const ahBarPatternsForSignature = (signature, allowSemiquaverGroups = false) => {
      const patterns = AH_BAR_PATTERNS[signature.id] ?? AH_BAR_PATTERNS["4/4"];
      return allowSemiquaverGroups ? patterns : patterns.filter((pattern) => !hasSemiquaverGroup(pattern));
    };

const noteBaseIndex = (note) => NOTE_POOL.findIndex((item) => item.letter === note?.letter && item.octave === note?.octave);

const LEGACY_NOTE_INDEX_OFFSET = 7;

const noteByLetter = (letter, preferredIndex = 6) => {
      const targetIndex = preferredIndex + LEGACY_NOTE_INDEX_OFFSET;
      const options = NOTE_POOL.map((note, index) => ({ ...note, index })).filter((note) => note.letter === letter);
      return options.reduce((best, item) => Math.abs(item.index - targetIndex) < Math.abs(best.index - targetIndex) ? item : best, options[0]);
    };

const keyAccidentalForLetter = (key, letter) => {
      if (key?.id === "F" && letter === "B") return -1;
      if (key?.id === "G" && letter === "F") return 1;
      return 0;
    };

const chordAccidentalForLetter = (key, chordSymbol, letter) => key?.raised?.[chordSymbol]?.[letter] ?? null;

const melodicAccidentalForLetter = (key, letter) => key?.id === "Am" && letter === "G" ? 1 : null;

const cloneNotesForBar = (notes, barIndex) => notes.map((note, noteIndex) => ({
      ...note,
      id: `${barIndex}-${noteIndex}`,
      barIndex,
      noteIndex,
      beat: note.beat,
    }));

const transposeNotesForBar = (notes, barIndex, offset) => cloneNotesForBar(notes, barIndex).map((note) => ({
      ...note,
      ...NOTE_POOL[clamp(noteBaseIndex(note) + offset, 0, NOTE_POOL.length - 1)],
      writtenAccidental: null,
    }));

const finalRhythmForSignature = (signature) => ({
      "2/4": "minim",
      "3/4": "dottedMinim",
      "4/4": "semibreve",
      "6/8": "dottedMinim",
    }[signature.id] ?? "semibreve");

function makeNote(base, rhythm, barIndex, noteIndex, beat, key, chordSymbol) {
      if (isRestRhythm(rhythm)) {
        return {
          id: `${barIndex}-${noteIndex}`,
          rhythm,
          beats: rhythmInfo(rhythm).beats,
          beat,
          barIndex,
          noteIndex,
          rest: true,
          step: 4,
          midi: 0,
          letter: "R",
          octave: 4,
          writtenAccidental: null,
        };
      }
      const melodicAccidental = melodicAccidentalForLetter(key, base.letter);
      const chordAccidental = chordAccidentalForLetter(key, chordSymbol, base.letter);
      return {
        ...base,
        id: `${barIndex}-${noteIndex}`,
        rhythm,
        beats: rhythmInfo(rhythm).beats,
        beat,
        barIndex,
        noteIndex,
        writtenAccidental: melodicAccidental ?? chordAccidental,
      };
    }

function levelMode(level) {
      if (level === "N3") return "repetition";
      if (level === "N4") return "sequence";
      if (isHigherLevel(level)) return randomItem(["repetition", "sequence", "repetition", "sequence", "free"]);
      return randomItem(["repetition", "sequence"]);
    }

function maxStepForLevel(level, mode) {
      if (isHigherLevel(level)) return 4;
      if (level === "N3" || level === "N4" || level === "N5") return 1;
      return 2;
    }

function stepRangeForLevel(level) {
      if (level === "N3" || level === "N4") return { min: 0, max: 8 };
      if (level === "N5" || level === "H") return { min: -2, max: 10 };
      if (level === "AH") return { min: -4, max: 12 };
      return { min: NOTE_POOL[0].step, max: NOTE_POOL.at(-1).step };
    }

function noteAllowedForLevel(level, note) {
      const range = stepRangeForLevel(level);
      return note.step >= range.min && note.step <= range.max;
    }

function barCountForLevel(level) {
      return 4;
    }

function tonicStartNoteForLevel(level, key) {
      if (level === "N3" || level === "N4") return randomItem(NOTE_POOL.filter((note) => note.letter === "C" && (note.octave === 4 || note.octave === 5)));
      return noteByLetter(key.tonic, 6);
    }

function hasSamePitchPattern(first, second) {
      if (!first?.notes || !second?.notes || first.notes.length !== second.notes.length) return false;
      return first.notes.every((note, index) => note.step === second.notes[index]?.step);
    }

function hasSequencePitchPattern(first, second) {
      if (!first?.notes || !second?.notes || first.notes.length !== second.notes.length) return false;
      const offset = second.notes[0].step - first.notes[0].step;
      if (offset === 0) return false;
      return first.notes.every((note, index) => second.notes[index]?.step - note.step === offset);
    }

function canTransposeBarByStep(bar, offset, level) {
      if (!bar?.notes?.length) return false;
      return bar.notes.every((note) => {
        const target = NOTE_POOL[noteBaseIndex(note) + offset];
        return target && noteAllowedForLevel(level, target);
      });
    }

function targetHasSourcePattern(bars, targetBar, matcher) {
      const target = bars[targetBar];
      return bars.some((bar) => bar.barIndex !== targetBar && matcher(bar, target));
    }

function targetHasAnySourcePattern(bars, targetBar) {
      return targetHasSourcePattern(bars, targetBar, hasSamePitchPattern)
        || targetHasSourcePattern(bars, targetBar, hasSequencePitchPattern);
    }

function chooseNextNote({ key, chordLetters, previous, currentIndex, strongBeat, rhythm, maxLeap, level, forceDirection = 0, preferLeap = false }) {
      const previousIndex = noteBaseIndex(previous) >= 0 ? noteBaseIndex(previous) : currentIndex;
      const previousMidi = previous?.midi ?? NOTE_POOL[previousIndex]?.midi ?? 72;
      const candidates = [];

      NOTE_POOL.forEach((candidate, candidateIndex) => {
        const distance = candidateIndex - previousIndex;
        const absDistance = Math.abs(distance);
        const isChordTone = chordLetters.includes(candidate.letter);
        const pitchDistance = Math.abs((candidate.midi + keyAccidentalForLetter(key, candidate.letter)) - previousMidi);

        if (!noteAllowedForLevel(level, candidate)) return;
        if (pitchDistance > 12) return;
        if (absDistance > maxLeap) return;
        if (strongBeat && !isChordTone) return;
        if (forceDirection > 0 && distance < 0) return;
        if (forceDirection < 0 && distance > 0) return;
        if (rhythm === "quaver" && absDistance > 2) return;

        let weight = isChordTone ? 8 : 2;
        if (strongBeat) weight *= 2.8;
        if (absDistance === 0) weight *= 0.6;
        if (absDistance === 1) weight *= 5;
        if (absDistance === 2) weight *= level === "H" ? 0.75 : 3;
        if (absDistance >= 3) weight *= level === "H" ? 0.25 : (preferLeap ? 4 : 0.7);
        if (candidateIndex < 1 || candidateIndex > NOTE_POOL.length - 2) weight *= 0.35;
        if (key.id === "Am" && candidate.letter === "G") weight *= 0.8;
        candidates.push({ candidate, weight });
      });

      if (!candidates.length) {
        const fallback = NOTE_POOL
          .map((note, index) => ({ ...note, index }))
          .filter((note) => {
            const distance = note.index - previousIndex;
            const absDistance = Math.abs(distance);
            if (!noteAllowedForLevel(level, note)) return false;
            if (absDistance > maxLeap) return false;
            if (forceDirection > 0 && distance < 0) return false;
            if (forceDirection < 0 && distance > 0) return false;
            if (rhythm === "quaver" && absDistance > 1) return false;
            return true;
          });
        return randomItem(fallback.length ? fallback : [previous]);
      }
      let roll = Math.random() * candidates.reduce((sum, item) => sum + item.weight, 0);
      for (const item of candidates) {
        roll -= item.weight;
        if (roll <= 0) return item.candidate;
      }
      return candidates.at(-1).candidate;
    }

function buildNotesFromPattern({ key, chordSymbol, pattern, barIndex, previousIndex, level, mode }) {
      const chordLetters = key.chords[chordSymbol] ?? key.chords.I;
      let currentIndex = previousIndex;
      let previous = NOTE_POOL[currentIndex] ?? noteByLetter(key.tonic, 6);
      let beat = 0;
      const notes = [];
      const direction = level === "N3" || level === "N4" ? randomItem([-1, 1]) : 0;
      const maxLeap = maxStepForLevel(level, mode);

      pattern.forEach((rhythm, noteIndex) => {
        if (isRestRhythm(rhythm)) {
          const rest = makeNote(null, rhythm, barIndex, noteIndex, beat, key, chordSymbol);
          notes.push(rest);
          beat += rhythmInfo(rhythm).beats;
          return;
        }
        const strongBeat = beat === 0 || beat === 2 || (beat === 1.5 && rhythmInfo(rhythm).beats >= 1);
        const preferLeap = false;
        let base = chooseNextNote({
          key,
          chordLetters,
          previous,
          currentIndex,
          strongBeat,
          rhythm,
          maxLeap,
          level,
          forceDirection: direction,
          preferLeap,
        });
        if (barIndex === 0 && noteIndex === 0) base = tonicStartNoteForLevel(level, key);
        const note = makeNote(base, rhythm, barIndex, noteIndex, beat, key, chordSymbol);
        notes.push(note);
        currentIndex = noteBaseIndex(base) >= 0 ? noteBaseIndex(base) : currentIndex;
        previous = base;
        beat += rhythmInfo(rhythm).beats;
      });

      return { notes, lastIndex: currentIndex };
    }

function buildFinalBar({ key, chordSymbol, barIndex, timeSignature, previousIndex, totalBars, level }) {
      const rhythm = finalRhythmForSignature(timeSignature);
      const previous = NOTE_POOL[previousIndex] ?? noteByLetter(key.tonic, 6);
      const tonicOptions = level === "N3" || level === "N4"
        ? NOTE_POOL.filter((note) => note.letter === "C" && (note.octave === 4 || note.octave === 5))
        : NOTE_POOL.filter((note) => note.letter === key.tonic && noteAllowedForLevel(level, note));
      const base = tonicOptions.reduce((best, note) => Math.abs(note.midi - previous.midi) < Math.abs(best.midi - previous.midi) ? note : best, tonicOptions[0] ?? noteByLetter(key.tonic, previousIndex));
      return {
        barIndex,
        chordSymbol,
        notes: [makeNote(base, rhythm, barIndex, 0, 0, key, chordSymbol)],
        totalBars,
        pattern: [rhythm],
      };
    }

function buildCadenceBar({ key, chordSymbol, targetLetter, barIndex, timeSignature, previousIndex, totalBars, level }) {
      const rhythm = finalRhythmForSignature(timeSignature);
      const previous = NOTE_POOL[previousIndex] ?? noteByLetter(key.tonic, 6);
      const options = NOTE_POOL
        .filter((note) => note.letter === targetLetter && noteAllowedForLevel(level, note));
      const base = options.reduce((best, note) => Math.abs(note.midi - previous.midi) < Math.abs(best.midi - previous.midi) ? note : best, options[0] ?? noteByLetter(targetLetter, previousIndex));
      return {
        barIndex,
        chordSymbol,
        notes: [makeNote(base, rhythm, barIndex, 0, 0, key, chordSymbol)],
        totalBars,
        pattern: [rhythm],
      };
    }

function applyMelodicAccidentals(notes, key) {
      return notes.map((note) => {
        const accidental = melodicAccidentalForLetter(key, note.letter);
        return accidental === null ? note : { ...note, writtenAccidental: accidental };
      });
    }

function targetMovesWithinInterval(bars, targetBar, maximumInterval) {
      const target = bars[targetBar];
      const notes = (target?.notes ?? []).filter((note) => !note.rest);
      if (!notes.length) return false;
      for (let index = 1; index < notes.length; index += 1) {
        if (Math.abs(notes[index].step - notes[index - 1].step) > maximumInterval) return false;
      }
      return true;
    }

function melodyHasOctaveLeap(bars) {
      const notes = bars.flatMap((bar) => bar.notes ?? []).filter((note) => !note.rest);
      return notes.some((note, index) => index > 0 && Math.abs(note.step - notes[index - 1].step) >= 7);
    }

function hasEnoughPitchVariety(bars, minimum = 3) {
      const pitches = new Set(bars.flatMap((bar) => bar.notes ?? []).filter((note) => !note.rest).map((note) => `${note.letter}${note.octave}`));
      return pitches.size >= minimum;
    }

function melodyNotes(bars) {
      return bars.flatMap((bar) => bar.notes ?? []).filter((note) => !note.rest);
    }

function dominantLetterForKey(key) {
      return key?.chords?.V?.[0] ?? "G";
    }

function levelMaximumInterval(level) {
      if (level === "N3") return 2;
      if (level === "N4") return 1;
      if (isHigherLevel(level)) return 4;
      if (level === "N5") return 3;
      return 3;
    }

function levelMaximumRange(level) {
      if (level === "N3" || level === "N4") return 5;
      if (level === "N5" || isHigherLevel(level)) return 7;
      return 7;
    }

function longestRepeatedPitchRun(notes) {
      let longest = 1;
      let current = 1;
      for (let index = 1; index < notes.length; index += 1) {
        if (notes[index].step === notes[index - 1].step) {
          current += 1;
          longest = Math.max(longest, current);
        } else {
          current = 1;
        }
      }
      return longest;
    }

function hasAwkwardBarlineLeap(bars, level) {
      const maximum = levelMaximumInterval(level);
      return bars.some((bar, index) => {
        const nextBar = bars[index + 1];
        const barNotes = (bar?.notes ?? []).filter((note) => !note.rest);
        const nextNotes = (nextBar?.notes ?? []).filter((note) => !note.rest);
        if (!barNotes.length || !nextNotes.length) return false;
        return Math.abs(nextNotes[0].step - barNotes.at(-1).step) > maximum;
      });
    }

function hasBalancedContour(notes) {
      let rises = 0;
      let falls = 0;
      for (let index = 1; index < notes.length; index += 1) {
        const interval = notes[index].step - notes[index - 1].step;
        if (interval > 0) rises += 1;
        if (interval < 0) falls += 1;
      }
      return rises > 0 && falls > 0;
    }

function leapsRecoverByStep(notes, level) {
      const recoveryLimit = 1;
      const leapThreshold = isHigherLevel(level) ? 3 : 2;
      for (let index = 1; index < notes.length - 1; index += 1) {
        const leap = notes[index].step - notes[index - 1].step;
        if (Math.abs(leap) < leapThreshold) continue;
        const recovery = notes[index + 1].step - notes[index].step;
        if (recovery === 0) continue;
        if (Math.sign(recovery) === Math.sign(leap) || Math.abs(recovery) > recoveryLimit) return false;
      }
      return true;
    }

function melodyPassesQualityRules(question) {
      const notes = melodyNotes(question.bars);
      if (notes.length < 2) return false;
      const intervals = notes.slice(1).map((note, index) => Math.abs(note.step - notes[index].step));
      const range = Math.max(...notes.map((note) => note.step)) - Math.min(...notes.map((note) => note.step));
      const first = notes[0];
      const last = notes.at(-1);
      const tonic = question.key.tonic;
      const maximumRepeatedRun = question.level === "N3" ? 3 : 2;

      if (first.letter !== tonic) return false;
      if (last.letter !== tonic) return false;
      if (range > levelMaximumRange(question.level)) return false;
      if (Math.max(...intervals) > levelMaximumInterval(question.level)) return false;
      if (hasAwkwardBarlineLeap(question.bars, question.level)) return false;
      if (!hasBalancedContour(notes)) return false;
      if (!leapsRecoverByStep(notes, question.level)) return false;
      if (longestRepeatedPitchRun(notes) > maximumRepeatedRun) return false;
      return true;
    }

function makeChordProgression() {
      const bar2 = randomItem(["I", "IV", "V", "VI"]);
      const bar3 = randomItem(["IV", "V"]);
      return ["I", bar2, bar3, "I"];
    }

function makeEightBarRepetitionProgression() {
      const bar2 = randomItem(["I", "IV", "V", "VI"]);
      return ["I", bar2, "IV", "V", "I", bar2, "V", "I"];
    }

function allowedChordsForBar(barIndex) {
      if (barIndex === 0 || barIndex === 3) return ["I"];
      if (barIndex === 1) return ["I", "IV", "V", "VI"];
      return ["IV", "V"];
    }

function chordFitScore(key, bar, chordSymbol) {
      const chordLetters = key.chords[chordSymbol] ?? [];
      return (bar.notes ?? []).reduce((score, note) => {
        if (note.rest) return score;
        const isChordTone = chordLetters.includes(note.letter);
        const weight = note.beat === 0 || note.beat === 2 ? 3 : 1;
        return score + (isChordTone ? weight : -weight);
      }, 0);
    }

function fitChordsToMelody(key, bars) {
      return bars.map((bar) => {
        const allowed = allowedChordsForBar(bar.barIndex);
        const bestChord = allowed.reduce((best, chordSymbol) => (
          chordFitScore(key, bar, chordSymbol) > chordFitScore(key, bar, best) ? chordSymbol : best
        ), allowed[0]);
        return { ...bar, chordSymbol: bestChord };
      });
    }

function sequenceSourceCandidates(bars, targetBar, level) {
      if (level !== "N4") return bars.filter((bar) => bar.barIndex !== targetBar && bar.notes?.length);
      return bars.filter((bar) => bar.barIndex === targetBar - 1 && bar.notes?.length);
    }

function makeCompletionQuestion(level = "N5", attempt = 0, allowDenseAhPatterns = false, forcedKey = null) {
      const activeBarCount = barCountForLevel(level);
      const timeSignature = randomItem(timeSignaturesForLevel(level));
      const majorKeys = KEYS.filter((key) => key.id !== "Am");
      const key = forcedKey ?? (level === "N3" || level === "N4"
        ? KEYS.find((item) => item.id === "C")
        : Math.random() < 0.82 ? randomItem(majorKeys) : KEYS.find((item) => item.id === "Am"));
      const progression = makeChordProgression();

      const targetBar = level === "N4" || level === "N5" || isHigherLevel(level)
        ? randomItem([1, 2])
        : randomItem(Array.from({ length: activeBarCount }, (_, index) => index));
      const bars = [];
      let previousIndex = noteBaseIndex(tonicStartNoteForLevel(level, key));
      const mode = levelMode(level);

      for (let barIndex = 0; barIndex < activeBarCount; barIndex += 1) {
        const chordSymbol = progression[barIndex];
        let bar;
        if (barIndex === activeBarCount - 1) {
          bar = buildFinalBar({ key, chordSymbol, barIndex, timeSignature, previousIndex, totalBars: activeBarCount, level });
          previousIndex = noteBaseIndex(bar.notes[0]);
        } else {
          const availablePatterns = level === "AH" ? ahBarPatternsForSignature(timeSignature, allowDenseAhPatterns) : barPatternsForSignature(timeSignature);
          const pattern = randomItem(availablePatterns);
          const built = buildNotesFromPattern({ key, chordSymbol, pattern, barIndex, previousIndex, level, mode });
          previousIndex = built.lastIndex;
          bar = { barIndex, chordSymbol, notes: built.notes, totalBars: activeBarCount, pattern };
        }
        bars.push(bar);
      }

      if (bars[targetBar]?.notes?.length) {
        if (mode === "repetition") {
          let repetitionCandidates = bars.filter((bar) => bar.barIndex !== targetBar && bar.notes?.length);
          const repetitionSource = randomItem(repetitionCandidates.length ? repetitionCandidates : bars.filter((bar) => bar.barIndex !== targetBar && bar.notes?.length));
          bars[targetBar] = { ...bars[targetBar], notes: cloneNotesForBar(repetitionSource.notes, targetBar) };
        } else if (mode === "sequence") {
          let possibleSources = sequenceSourceCandidates(bars, targetBar, level);
          const sequenceOptions = possibleSources.flatMap((source) => [-1, 1]
            .filter((offset) => canTransposeBarByStep(source, offset, level))
            .map((offset) => ({ source, offset })));
          const selectedSequence = randomItem(sequenceOptions);
          if (selectedSequence) {
            bars[targetBar] = { ...bars[targetBar], notes: transposeNotesForBar(selectedSequence.source.notes, targetBar, selectedSequence.offset) };
          }
        }
        bars[targetBar] = { ...bars[targetBar], notes: applyMelodicAccidentals(bars[targetBar].notes, key), pattern: bars[targetBar].notes.map((note) => note.rhythm) };
      }

      const fittedBars = fitChordsToMelody(key, bars);

      const question = {
        id: Math.random().toString(36).slice(2),
        key,
        timeSignature,
        bars: fittedBars,
        targetBar,
        level,
        mode,
        barCount: activeBarCount,
      };

      const targetMaximumInterval = isHigherLevel(level) && mode === "free" ? 1 : maxStepForLevel(level, mode);

      if ((level === "N3" || level === "N4" || level === "N5" || isHigherLevel(level)) && !targetMovesWithinInterval(bars, targetBar, targetMaximumInterval) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if ((level === "N3" || level === "N4") && !hasEnoughPitchVariety(bars) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if ((level === "N5" || isHigherLevel(level)) && ((bars[targetBar]?.notes ?? []).filter((note) => !note.rest).length) < 3 && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (level === "N3" && melodyHasOctaveLeap(bars) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (level === "N4" && !targetHasSourcePattern(bars, targetBar, mode === "repetition" ? hasSamePitchPattern : hasSequencePitchPattern) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (level === "N5" && !targetHasSourcePattern(bars, targetBar, mode === "repetition" ? hasSamePitchPattern : hasSequencePitchPattern) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (isHigherLevel(level) && mode !== "free" && !targetHasSourcePattern(bars, targetBar, mode === "repetition" ? hasSamePitchPattern : hasSequencePitchPattern) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (isHigherLevel(level) && mode === "free" && targetHasAnySourcePattern(bars, targetBar) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      if (!melodyPassesQualityRules(question) && attempt < 160) {
        return makeCompletionQuestion(level, attempt + 1, allowDenseAhPatterns, forcedKey);
      }

      return question;
    }

function makeEightBarRepetitionQuestion(level = "N5", attempt = 0, forcedKey = null) {
      const activeBarCount = BAR_COUNT;
      const timeSignature = randomItem(timeSignaturesForLevel(level));
      const majorKeys = KEYS.filter((key) => key.id !== "Am");
      const key = forcedKey ?? (level === "N3" || level === "N4"
        ? KEYS.find((item) => item.id === "C")
        : Math.random() < 0.82 ? randomItem(majorKeys) : KEYS.find((item) => item.id === "Am"));
      const progression = makeEightBarRepetitionProgression();
      const targetBar = randomItem([4, 5]);
      const bars = [];
      let previousIndex = noteBaseIndex(tonicStartNoteForLevel(level, key));
      const mode = "repetition";
      const availablePatterns = level === "AH" ? ahBarPatternsForSignature(timeSignature, false) : barPatternsForSignature(timeSignature);

      for (let barIndex = 0; barIndex < activeBarCount; barIndex += 1) {
        const chordSymbol = progression[barIndex];
        let bar;
        if (barIndex === 3) {
          bar = buildCadenceBar({
            key,
            chordSymbol,
            targetLetter: dominantLetterForKey(key),
            barIndex,
            timeSignature,
            previousIndex,
            totalBars: activeBarCount,
            level,
          });
        } else if (barIndex === 4) {
          bar = { ...bars[0], barIndex, chordSymbol, totalBars: activeBarCount, notes: cloneNotesForBar(bars[0].notes, barIndex) };
        } else if (barIndex === 5) {
          bar = { ...bars[1], barIndex, chordSymbol, totalBars: activeBarCount, notes: cloneNotesForBar(bars[1].notes, barIndex) };
        } else if (barIndex === activeBarCount - 1) {
          bar = buildFinalBar({ key, chordSymbol, barIndex, timeSignature, previousIndex, totalBars: activeBarCount, level });
        } else {
          const pattern = randomItem(availablePatterns);
          const built = buildNotesFromPattern({ key, chordSymbol, pattern, barIndex, previousIndex, level, mode });
          previousIndex = built.lastIndex;
          bar = { barIndex, chordSymbol, notes: built.notes, totalBars: activeBarCount, pattern };
        }
        bars.push(bar);
        const lastNote = [...bar.notes].reverse().find((note) => !note.rest);
        if (lastNote) previousIndex = noteBaseIndex(lastNote);
      }

      const question = {
        id: Math.random().toString(36).slice(2),
        key,
        timeSignature,
        bars,
        targetBar,
        level,
        mode,
        questionType: "eightBarRepetition",
        barCount: activeBarCount,
        useShortPrompt: true,
      };

      const targetMaximumInterval = maxStepForLevel(level, mode);
      if (!targetMovesWithinInterval(bars, targetBar, targetMaximumInterval) && attempt < 160) {
        return makeEightBarRepetitionQuestion(level, attempt + 1, forcedKey);
      }

      if ((level === "N3" || level === "N4") && !hasEnoughPitchVariety(bars) && attempt < 160) {
        return makeEightBarRepetitionQuestion(level, attempt + 1, forcedKey);
      }

      if (level === "N5" && ((bars[targetBar]?.notes ?? []).filter((note) => !note.rest).length) < 3 && attempt < 160) {
        return makeEightBarRepetitionQuestion(level, attempt + 1, forcedKey);
      }

      if (level === "N3" && melodyHasOctaveLeap(bars) && attempt < 160) {
        return makeEightBarRepetitionQuestion(level, attempt + 1, forcedKey);
      }

      return question;
    }

  const pitchForChordLetter = (question, bar, letter, preferredIndex = 4) => {
    const base = noteByLetter(letter, preferredIndex);
    const raised = chordAccidentalForLetter(question.key, bar.chordSymbol, letter);
    return base.midi + keyAccidentalForLetter(question.key, letter) + (raised ?? 0);
  };

  const DORIAN_MODE = {
    id: "D-dorian", name: "D Dorian", tonic: "D", tonality: "modal",
    scale: ["D", "E", "F", "G", "A", "B", "C"], signature: [],
    chords: {
      i: ["D", "F", "A"], ii: ["E", "G", "B"], III: ["F", "A", "C"],
      IV: ["G", "B", "D"], v: ["A", "C", "E"], vi: ["B", "D", "F"], VII: ["C", "E", "G"],
    },
  };

  // Each four-beat bar has two melodic alternatives. Both versions expose the
  // minor third (F) and natural sixth (B), with minor v rather than major V.
  // Keep this mode separate from KEYS so ordinary Major/Minor generators retain
  // their existing key pools and accidental rules.
  const DORIAN_BAR_PLANS = [
    { chordSymbol: "i", alternatives: [
      [["D4", "crotchet"], ["E4", "quaver"], ["F4", "quaver"], ["A4", "crotchet"], ["F4", "crotchet"]],
      [["D4", "crotchet"], ["F4", "crotchet"], ["A4", "crotchet"], ["G4", "quaver"], ["F4", "quaver"]],
    ] },
    { chordSymbol: "IV", alternatives: [
      [["G4", "crotchet"], ["A4", "crotchet"], ["B4", "minim"]],
      [["G4", "crotchet"], ["A4", "quaver"], ["B4", "quaver"], ["B4", "crotchet"], ["A4", "crotchet"]],
    ] },
    { chordSymbol: "i", alternatives: [
      [["A4", "crotchet"], ["G4", "quaver"], ["F4", "quaver"], ["F4", "crotchet"], ["E4", "crotchet"]],
      [["A4", "minim"], ["F4", "crotchet"], ["E4", "crotchet"]],
    ] },
    { chordSymbol: "VII", alternatives: [
      [["E4", "crotchet"], ["D4", "crotchet"], ["C4", "minim"]],
      [["E4", "minim"], ["C4", "minim"]],
    ] },
    { chordSymbol: "i", alternatives: [
      [["D4", "crotchet"], ["E4", "quaver"], ["F4", "quaver"], ["A4", "crotchet"], ["F4", "crotchet"]],
      [["D4", "crotchet"], ["F4", "crotchet"], ["A4", "crotchet"], ["G4", "quaver"], ["F4", "quaver"]],
    ] },
    { chordSymbol: "IV", alternatives: [
      [["G4", "crotchet"], ["A4", "quaver"], ["B4", "quaver"], ["B4", "crotchet"], ["A4", "crotchet"]],
      [["G4", "crotchet"], ["A4", "crotchet"], ["B4", "minim"]],
    ] },
    { chordSymbol: "v", alternatives: [
      [["A4", "crotchet"], ["G4", "crotchet"], ["E4", "crotchet"], ["C4", "crotchet"]],
      [["A4", "crotchet"], ["G4", "quaver"], ["E4", "quaver"], ["E4", "crotchet"], ["C4", "crotchet"]],
    ] },
    { chordSymbol: "i", alternatives: [[["D4", "semibreve"]]] },
  ];

  function buildDorianMelody() {
    const timeSignature = TIME_SIGNATURES.find(signature => signature.id === "4/4");
    const bars = DORIAN_BAR_PLANS.map((plan, barIndex) => {
      const events = randomItem(plan.alternatives);
      let beat = 0;
      const notes = events.map(([pitch, rhythm], noteIndex) => {
        const base = NOTE_POOL.find(note => `${note.letter}${note.octave}` === pitch);
        if (!base || !DORIAN_MODE.scale.includes(base.letter)) throw new Error("Invalid Dorian melody pitch.");
        const note = makeNote(base, rhythm, barIndex, noteIndex, beat, DORIAN_MODE, plan.chordSymbol);
        beat += note.beats;
        return note;
      });
      if (beat !== timeSignature.beats) throw new Error("A Dorian melody bar must contain four beats.");
      return { barIndex, chordSymbol: plan.chordSymbol, notes, totalBars: DORIAN_BAR_PLANS.length, pattern: events.map(([, rhythm]) => rhythm) };
    });
    return {
      id: Math.random().toString(36).slice(2), level: "H", key: DORIAN_MODE, timeSignature,
      bars, barCount: bars.length, questionType: "dorianTonality",
    };
  }

  const ATONAL_KEY = {
    id: "atonal", name: "Atonal", tonic: null, tonality: "atonal", signature: [], chords: {},
  };
  // Use every pitch class before repeating any. Semitones and tritones keep
  // this row away from a diatonic scale or a sequence of major/minor triads.
  const ATONAL_PITCH_ROW = [0, 1, 6, 2, 8, 7, 3, 9, 4, 10, 5, 11];
  const ATONAL_CHORD_CELLS = [[0, 1, 6], [0, 6, 7], [0, 1, 5], [0, 2, 6]];
  const ATONAL_RHYTHMS = [
    ["crotchet", "crotchet", "minim"],
    ["minim", "crotchet", "crotchet"],
    ["crotchet", "minim", "crotchet"],
    ["crotchet", "crotchet", "crotchet", "crotchet"],
    ["minim", "quaver", "quaver", "crotchet"],
    ["crotchet", "quaver", "quaver", "minim"],
    ["quaver", "quaver", "crotchet", "crotchet", "crotchet"],
    ["crotchet", "quaver", "quaver", "crotchet", "crotchet"],
    ["crotchet", "crotchet", "quaver", "quaver", "crotchet"],
    ["crotchet", "crotchet", "crotchet", "quaver", "quaver"],
    ["dottedCrotchet", "quaver", "minim"],
    ["minim", "dottedCrotchet", "quaver"],
    ["dottedCrotchet", "quaver", "crotchet", "crotchet"],
    ["crotchet", "dottedCrotchet", "quaver", "crotchet"],
    ["crotchet", "crotchet", "dottedCrotchet", "quaver"],
  ];
  const CHROMATIC_SPELLINGS = [
    ["C", 0], ["C", 1], ["D", 0], ["D", 1], ["E", 0], ["F", 0],
    ["F", 1], ["G", 0], ["G", 1], ["A", 0], ["A", 1], ["B", 0],
  ];

  function atonalRowForms() {
    const forms = [];
    for (let transpose = 0; transpose < 12; transpose++) {
      for (const direction of [1, -1]) {
        const row = ATONAL_PITCH_ROW.map(pitch => (transpose + direction * pitch + 12) % 12);
        forms.push(row, [...row].reverse());
      }
    }
    return forms;
  }

  function isMajorOrMinorTriad(pitches) {
    return pitches.some(root => {
      const intervals = new Set(pitches.map(pitch => (pitch - root + 12) % 12));
      return intervals.has(7) && (intervals.has(3) || intervals.has(4));
    });
  }

  function atonalBarPatterns() {
    // Guarantee contrasting durations, beamed quavers and dotted rhythms in
    // every example, then select eight distinct patterns and vary their order.
    const patterns = [
      randomItem(ATONAL_RHYTHMS.filter(pattern => pattern.includes("minim") && !pattern.includes("quaver"))),
      randomItem(ATONAL_RHYTHMS.filter(pattern => pattern.length === 5)),
      randomItem(ATONAL_RHYTHMS.filter(pattern => pattern.includes("dottedCrotchet"))),
    ];
    const remaining = ATONAL_RHYTHMS.filter(pattern => !patterns.includes(pattern));
    while (patterns.length < 8) {
      const index = Math.floor(Math.random() * remaining.length);
      patterns.push(...remaining.splice(index, 1));
    }
    for (let index = patterns.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [patterns[index], patterns[other]] = [patterns[other], patterns[index]];
    }
    return patterns.map(pattern => [...pattern]);
  }

  function buildAtonalMelody() {
    const timeSignature = TIME_SIGNATURES.find(signature => signature.id === "4/4");
    const barPatterns = atonalBarPatterns();
    const noteCount = barPatterns.reduce((total, pattern) => total + pattern.length, 0);
    const forms = atonalRowForms();
    const firstRow = randomItem(forms);
    const pitchClasses = [...firstRow];
    // Supply as many chromatic rows as the varying rhythms require. Keep
    // row joins non-triadic and avoid returning to the opening pitch at the end.
    while (pitchClasses.length < noteCount) {
      const previousRow = pitchClasses.slice(-12);
      const usedNotes = Math.min(12, noteCount - pitchClasses.length);
      const nextRow = randomItem(forms.filter(row =>
        row.some((pitch, index) => pitch !== previousRow[index])
        && row[0] !== previousRow[11]
        && (noteCount - pitchClasses.length > 12 || row[usedNotes - 1] !== firstRow[0])
        && !isMajorOrMinorTriad([previousRow[10], previousRow[11], row[0]])
        && !isMajorOrMinorTriad([previousRow[11], row[0], row[1]])
      ));
      pitchClasses.push(...nextRow);
    }
    let pitchIndex = 0;
    let previousMidi = 72;
    const bars = barPatterns.map((pattern, barIndex) => {
      const accidentals = new Map();
      let beat = 0;
      const notes = pattern.map((rhythm, noteIndex) => {
        const pitchClass = pitchClasses[pitchIndex++];
        const candidates = [60 + pitchClass, 72 + pitchClass].filter(midi => midi <= 81);
        const nearest = Math.min(...candidates.map(midi => Math.abs(midi - previousMidi)));
        const soundingMidi = randomItem(candidates.filter(midi => Math.abs(midi - previousMidi) === nearest));
        previousMidi = soundingMidi;
        const [letter, alteration] = CHROMATIC_SPELLINGS[pitchClass];
        const octave = Math.floor(soundingMidi / 12) - 1;
        const base = NOTE_POOL.find(note => note.letter === letter && note.octave === octave);
        if (!base) throw new Error("Invalid atonal melody pitch.");
        const accidentalKey = `${letter}${octave}`;
        const needsAccidental = alteration !== (accidentals.get(accidentalKey) ?? 0);
        accidentals.set(accidentalKey, alteration);
        const note = {
          ...makeNote(base, rhythm, barIndex, noteIndex, beat, ATONAL_KEY, null),
          soundingMidi,
          writtenAccidental: needsAccidental ? alteration : null,
          forceAccidental: needsAccidental,
        };
        beat += note.beats;
        return note;
      });
      if (beat !== timeSignature.beats) throw new Error("An atonal melody bar must contain four beats.");
      // Explicit, shifting dissonant sonorities replace functional harmony.
      // Their lowest pitches follow the row, so there is no tonic bass pedal.
      const accompaniment = [0, 1].map(eventIndex => {
        const eventBeat = eventIndex * 2 + randomItem([0, 0.5]);
        const anchor = 48 + pitchClasses[barIndex * 2 + eventIndex];
        return {
          beat: eventBeat,
          beats: barIndex === 7 && eventIndex === 1 ? 4 - eventBeat - 0.05 : 1.1,
          pitches: randomItem(ATONAL_CHORD_CELLS).map(interval => anchor + interval),
        };
      });
      return { barIndex, chordSymbol: null, notes, accompaniment, totalBars: 8, pattern };
    });
    return {
      id: Math.random().toString(36).slice(2), level: "N5", key: ATONAL_KEY, timeSignature,
      bars, barCount: bars.length, questionType: "atonalTonality",
    };
  }

  const POLYTONAL_KEYS = {
    C: { id: "poly-C", name: "C major", tonic: "C", tonicPitchClass: 0, scale: ["C", "D", "E", "F", "G", "A", "B"], alterations: {}, signature: [], chords: {} },
    Fsharp: { id: "poly-Fsharp", name: "F sharp major", tonic: "F", tonicPitchClass: 6, scale: ["F", "G", "A", "B", "C", "D", "E"], alterations: { F: 1, C: 1, G: 1, D: 1, A: 1, E: 1 }, signature: [8, 5, 9, 6, 3, 7].map(step => ({ type: "sharp", step })), chords: {} },
    F: { id: "poly-F", name: "F major", tonic: "F", tonicPitchClass: 5, scale: ["F", "G", "A", "B", "C", "D", "E"], alterations: { B: -1 }, signature: [{ type: "flat", step: 4 }], chords: {} },
    B: { id: "poly-B", name: "B major", tonic: "B", tonicPitchClass: 11, scale: ["B", "C", "D", "E", "F", "G", "A"], alterations: { F: 1, C: 1, G: 1, D: 1, A: 1 }, signature: [8, 5, 9, 6, 3].map(step => ({ type: "sharp", step })), chords: {} },
    G: { id: "poly-G", name: "G major", tonic: "G", tonicPitchClass: 7, scale: ["G", "A", "B", "C", "D", "E", "F"], alterations: { F: 1 }, signature: [{ type: "sharp", step: 8 }], chords: {} },
    Dflat: { id: "poly-Dflat", name: "D flat major", tonic: "D", tonicPitchClass: 1, scale: ["D", "E", "F", "G", "A", "B", "C"], alterations: { B: -1, E: -1, A: -1, D: -1, G: -1 }, signature: [4, 7, 3, 6, 2].map(step => ({ type: "flat", step })), chords: {} },
  };
  // Fourth/fifth-related keys share most scale notes for a gentler blend.
  // Each part retains its own diatonic melody and functional harmony.
  const POLYTONAL_KEY_PAIRS = [["C", "G"], ["F", "C"], ["G", "C"]];
  const POLYTONAL_CHORD_DEGREES = { I: [1, 3, 5], ii: [2, 4, 6], IV: [4, 6, 8], V: [5, 7, 9], vi: [6, 8, 10] };
  const POLYTONAL_PART_PLANS = [
    [
      { chord: "I", alternatives: [[[1, "crotchet"], [2, "quaver"], [3, "quaver"], [5, "crotchet"], [3, "crotchet"]], [[1, "crotchet"], [3, "crotchet"], [5, "minim"]]] },
      { chord: "IV", alternatives: [[[4, "crotchet"], [6, "crotchet"], [5, "quaver"], [4, "quaver"], [2, "crotchet"]], [[4, "minim"], [6, "crotchet"], [5, "crotchet"]]] },
      { chord: "V", alternatives: [[[5, "minim"], [7, "crotchet"], [2, "crotchet"]], [[5, "crotchet"], [7, "crotchet"], [5, "crotchet"], [2, "crotchet"]]] },
      { chord: "I", alternatives: [[[3, "crotchet"], [2, "crotchet"], [1, "minim"]], [[3, "minim"], [2, "crotchet"], [1, "crotchet"]]] },
      { chord: "vi", alternatives: [[[6, "crotchet"], [7, "quaver"], [8, "quaver"], [3, "crotchet"], [6, "crotchet"]], [[6, "minim"], [3, "crotchet"], [6, "crotchet"]]] },
      { chord: "ii", alternatives: [[[2, "dottedCrotchet"], [3, "quaver"], [4, "crotchet"], [6, "crotchet"]], [[2, "crotchet"], [4, "crotchet"], [6, "minim"]]] },
      { chord: "V", alternatives: [[[5, "crotchet"], [2, "crotchet"], [7, "minim"]], [[5, "minim"], [2, "crotchet"], [7, "crotchet"]]] },
      { chord: "I", alternatives: [[[8, "semibreve"]]] },
    ],
    [
      { chord: "I", alternatives: [[[1, "minim"], [5, "crotchet"], [3, "crotchet"]], [[1, "dottedMinim"], [5, "crotchet"]]] },
      { chord: "vi", alternatives: [[[6, "crotchet"], [3, "crotchet"], [6, "minim"]], [[6, "minim"], [5, "crotchet"], [3, "crotchet"]]] },
      { chord: "IV", alternatives: [[[4, "crotchet"], [6, "quaver"], [5, "quaver"], [4, "minim"]], [[4, "dottedMinim"], [6, "crotchet"]]] },
      { chord: "V", alternatives: [[[2, "minim"], [7, "crotchet"], [5, "crotchet"]], [[5, "crotchet"], [2, "minim"], [7, "crotchet"]]] },
      { chord: "I", alternatives: [[[3, "crotchet"], [5, "crotchet"], [1, "minim"]], [[1, "minim"], [3, "crotchet"], [5, "crotchet"]]] },
      { chord: "IV", alternatives: [[[4, "minim"], [6, "crotchet"], [1, "crotchet"]], [[4, "crotchet"], [1, "crotchet"], [6, "minim"]]] },
      { chord: "V", alternatives: [[[5, "dottedMinim"], [7, "crotchet"]], [[2, "minim"], [5, "crotchet"], [7, "crotchet"]]] },
      { chord: "I", alternatives: [[[8, "semibreve"]]] },
    ],
  ];

  function polytonalDegreeMidi(tonicMidi, degree) {
    const index = degree - 1;
    return tonicMidi + [0, 2, 4, 5, 7, 9, 11][index % 7] + Math.floor(index / 7) * 12;
  }

  function buildPolytonalLayer(key, partIndex, timeSignature) {
    const tonicMidi = partIndex === 0 ? 60 + key.tonicPitchClass
      : (key.tonicPitchClass >= 6 ? 36 : 48) + key.tonicPitchClass;
    const chordTonicMidi = partIndex === 0 ? tonicMidi - 12 : tonicMidi;
    const id = partIndex === 0 ? "poly-upper" : "poly-lower";
    const bars = POLYTONAL_PART_PLANS[partIndex].map((plan, barIndex) => {
      const events = randomItem(plan.alternatives);
      let beat = 0;
      const notes = events.map(([degree, rhythm], noteIndex) => {
        const letter = key.scale[(degree - 1) % 7];
        const soundingMidi = polytonalDegreeMidi(tonicMidi, degree);
        const midi = soundingMidi - (key.alterations[letter] ?? 0);
        const octave = Math.floor(midi / 12) - 1;
        const step = (octave - 4) * 7 + ["C", "D", "E", "F", "G", "A", "B"].indexOf(letter) - 2;
        const note = {
          ...makeNote({ letter, octave, step, midi }, rhythm, barIndex, noteIndex, beat, key, plan.chord),
          id: `${id}-${barIndex}-${noteIndex}`, soundingMidi, degree,
        };
        beat += note.beats;
        return note;
      });
      if (beat !== timeSignature.beats) throw new Error("A polytonal melody bar must contain four beats.");
      const degrees = POLYTONAL_CHORD_DEGREES[plan.chord];
      const chord = degrees.map(degree => polytonalDegreeMidi(chordTonicMidi, degree));
      const accompaniment = barIndex === 7
        ? [{ beat: 0, beats: 3.9, pitches: chord }]
        : Array.from({ length: 4 }, (_, pulse) => {
          const chordPulse = (pulse + partIndex) % 2 === 1;
          return {
            beat: pulse, beats: chordPulse ? 0.65 : 0.85,
            pitches: chordPulse ? chord : [chord[pulse < 2 ? 0 : 2]],
          };
        });
      return { barIndex, totalBars: 8, chordSymbol: plan.chord, notes, accompaniment, pattern: events.map(([, rhythm]) => rhythm) };
    });
    return {
      id, type: "tonality", key, tonicMidi, timeSignature, bars, barCount: 8,
      clef: partIndex === 0 ? "treble" : "bass", pan: partIndex === 0 ? -0.28 : 0.28, volume: 0.7,
    };
  }

  function buildPolytonalMelody() {
    const timeSignature = TIME_SIGNATURES.find(signature => signature.id === "4/4");
    const pair = randomItem(POLYTONAL_KEY_PAIRS);
    const layers = pair.map((keyId, partIndex) => buildPolytonalLayer(POLYTONAL_KEYS[keyId], partIndex, timeSignature));
    return {
      id: Math.random().toString(36).slice(2), level: "AH", questionType: "polytonalTonality",
      key: { id: "polytonal", tonic: null, signature: [], chords: {} }, timeSignature,
      layers, bars: layers[0].bars, barCount: 8,
    };
  }

  function buildTonalityMelody(tonality) {
    if (tonality === "modal") return buildDorianMelody();
    if (tonality === "atonal") return buildAtonalMelody();
    if (tonality === "polytonality") return buildPolytonalMelody();
    const keys = KEYS.filter(key => (key.id === "Am") === (tonality === "minor"));
    const key = randomItem(keys);
    return Math.random() < 0.5
      ? makeEightBarRepetitionQuestion("N5", 0, key)
      : makeCompletionQuestion("N5", 0, false, key);
  }

  MLH.MelodicDictation = {
    BAR_COUNT,
    TIME_SIGNATURES,
    RHYTHMS,
    BAR_PATTERNS,
    AH_BAR_PATTERNS,
    NOTE_POOL,
    KEYS,
    clamp,
    randomItem,
    rhythmInfo,
    isHigherLevel,
    timeSignaturesForLevel,
    barPatternsForSignature,
    hasSemiquaverGroup,
    isRestRhythm,
    ahBarPatternsForSignature,
    noteBaseIndex,
    LEGACY_NOTE_INDEX_OFFSET,
    noteByLetter,
    keyAccidentalForLetter,
    chordAccidentalForLetter,
    melodicAccidentalForLetter,
    cloneNotesForBar,
    transposeNotesForBar,
    finalRhythmForSignature,
    makeNote,
    levelMode,
    maxStepForLevel,
    stepRangeForLevel,
    noteAllowedForLevel,
    barCountForLevel,
    tonicStartNoteForLevel,
    hasSamePitchPattern,
    hasSequencePitchPattern,
    canTransposeBarByStep,
    targetHasSourcePattern,
    targetHasAnySourcePattern,
    chooseNextNote,
    buildNotesFromPattern,
    buildFinalBar,
    buildCadenceBar,
    applyMelodicAccidentals,
    targetMovesWithinInterval,
    melodyHasOctaveLeap,
    hasEnoughPitchVariety,
    melodyNotes,
    dominantLetterForKey,
    levelMaximumInterval,
    levelMaximumRange,
    longestRepeatedPitchRun,
    hasAwkwardBarlineLeap,
    hasBalancedContour,
    leapsRecoverByStep,
    melodyPassesQualityRules,
    makeChordProgression,
    makeEightBarRepetitionProgression,
    allowedChordsForBar,
    chordFitScore,
    fitChordsToMelody,
    sequenceSourceCandidates,
    makeCompletionQuestion,
    makeEightBarRepetitionQuestion,
    pitchForChordLetter,
    DORIAN_MODE,
    DORIAN_BAR_PLANS,
    buildDorianMelody,
    ATONAL_KEY,
    ATONAL_PITCH_ROW,
    ATONAL_CHORD_CELLS,
    buildAtonalMelody,
    POLYTONAL_KEYS,
    POLYTONAL_KEY_PAIRS,
    POLYTONAL_PART_PLANS,
    buildPolytonalMelody,
    buildTonalityMelody,
  };
})(window.MLH || (window.MLH = {}));
