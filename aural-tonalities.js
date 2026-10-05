// Aural tonalities share the AH Practice Questions' sixteen-bar phrase and
// rhythm engine, with pitch and harmony mapped to the requested tonality.
(function attachAuralTonalities(MLH) {
  "use strict";
  const choose = items => items[Math.floor(Math.random() * items.length)];
  const pitchClass = midi => ((midi % 12) + 12) % 12;
  const signature = { id: "4/4", top: 4, bottom: 4, beats: 4, type: "simple" };
  const major = [0, 2, 4, 5, 7, 9, 11];
  const minor = [0, 2, 3, 5, 7, 8, 11];
  const dorian = [0, 2, 3, 5, 7, 9, 10];

  function makePlan() {
    return window.PracticeMelodyGenerator.generateAdvancedHigherPlan({
      seed: `${Date.now()}-${Math.random()}`, cadenceId: "perfect",
      timeSignatureId: signature.id, allowRests: true,
    });
  }

  function scaleMidi(step, tonicMidi, scale) {
    return tonicMidi + Math.floor(step / 7) * 12 + scale[((step % 7) + 7) % 7];
  }

  function diatonicLayer({ key, tonicMidi, scale, style, id = "tonality", pan = 0, volume = 1 }) {
    const plan = makePlan();
    const bars = plan.bars.map(plannedBar => {
      const notes = plannedBar.notes.map((note, noteIndex) => {
        const midi = note.rest ? 0 : scaleMidi(note.relativeStep, tonicMidi, scale);
        return { ...note, id: `${id}-${plannedBar.barIndex}-${noteIndex}`, midi, soundingMidi: midi };
      });
      // Mapping the same chord degrees into Dorian gives minor i/v and major
      // IV with its natural sixth, without importing a raised leading note.
      const degrees = window.PracticeMelodyGenerator.CHORD_DEGREES[plannedBar.chordSymbol];
      const rootStep = degrees[0] - 1;
      const pitches = degrees.map(degree => {
        let step = degree - 1;
        while (step < rootStep) step += 7;
        return scaleMidi(step, tonicMidi - 12, scale);
      });
      const accompanimentHarmony = [{ beat: 0, pitches }];
      return {
        ...plannedBar, notes, totalBars: plan.bars.length, accompanimentHarmony,
        accompaniment: MLH.AuralAccompaniment.eventsForBar({
          signature, notes, segments: accompanimentHarmony, style,
          finalBar: plannedBar.barIndex === plan.bars.length - 1,
        }),
      };
    });
    return {
      id, type: "tonality", key, tonicMidi, timeSignature: signature, bars,
      barCount: bars.length, totalBeats: bars.length * signature.beats,
      generationLevel: "AH", melodyGenerationStyle: "advancedHigher", melodyPlan: plan,
      accompanimentPattern: style, pan, volume,
    };
  }

  function isTriad(pitches) {
    return pitches.some(root => {
      const intervals = new Set(pitches.map(pitch => pitchClass(pitch - root)));
      return intervals.has(7) && (intervals.has(3) || intervals.has(4));
    });
  }

  function atonalPassage(style) {
    const plan = makePlan();
    const dictation = MLH.MelodicDictation;
    const count = plan.bars.reduce((total, bar) => total + bar.notes.filter(note => !note.rest).length, 0);
    const forms = Array.from({ length: 12 }, (_, transpose) => [1, -1].flatMap(direction => {
      const row = dictation.ATONAL_PITCH_ROW.map(pitch => pitchClass(transpose + direction * pitch));
      return [row, [...row].reverse()];
    })).flat();
    const pitches = [...choose(forms)];
    while (pitches.length < count) {
      const used = Math.min(12, count - pitches.length);
      const row = choose(forms.filter(candidate => candidate[0] !== pitches.at(-1)
        && !isTriad([pitches.at(-2), pitches.at(-1), candidate[0]])
        && !isTriad([pitches.at(-1), candidate[0], candidate[1]])
        && (pitches.length + used < count || candidate[used - 1] !== pitches[0])));
      pitches.push(...row);
    }
    let pitchIndex = 0;
    const bars = plan.bars.map(plannedBar => {
      const notes = plannedBar.notes.map((note, noteIndex) => {
        let midi = 0;
        if (!note.rest) {
          const pc = pitches[pitchIndex++];
          // Retain the AH contour/register while removing its diatonic pitch
          // hierarchy. Every twelve sounding notes exhaust the pitch classes.
          const target = scaleMidi(note.relativeStep, 60, major);
          const candidates = [48 + pc, 60 + pc, 72 + pc].filter(pitch => pitch >= 55 && pitch <= 81);
          midi = candidates.reduce((best, pitch) => Math.abs(pitch - target) < Math.abs(best - target) ? pitch : best);
        }
        return { ...note, id: `atonal-${plannedBar.barIndex}-${noteIndex}`, midi, soundingMidi: midi };
      });
      const sounding = notes.filter(note => !note.rest);
      const accompanimentHarmony = [0, 2].map(beat => {
        const note = sounding.find(note => note.beat >= beat) || sounding.at(-1);
        const anchor = 48 + pitchClass(note?.midi ?? pitches[pitchIndex - 1]);
        return { beat, beats: 2, pitches: choose(dictation.ATONAL_CHORD_CELLS).map(interval => anchor + interval) };
      });
      return {
        ...plannedBar, chordSymbol: null, notes, accompanimentHarmony,
        accompaniment: MLH.AuralAccompaniment.eventsForBar({
          signature, notes, segments: accompanimentHarmony, style,
          finalBar: plannedBar.barIndex === plan.bars.length - 1,
        }),
      };
    });
    return {
      id: Math.random().toString(36).slice(2), type: "tonality", key: dictation.ATONAL_KEY,
      timeSignature: signature, bars, barCount: bars.length, totalBeats: bars.length * signature.beats,
      generationLevel: "AH", melodyGenerationStyle: "advancedHigher", melodyPlan: plan, accompanimentPattern: style,
    };
  }

  function buildMelody(tonality) {
    const dictation = MLH.MelodicDictation;
    const style = MLH.AuralAccompaniment.chooseStyle();
    if (tonality === "atonal") return atonalPassage(style);
    if (tonality === "polytonality") {
      const pair = choose(dictation.POLYTONAL_KEY_PAIRS);
      const layers = pair.map((keyId, index) => {
        const key = dictation.POLYTONAL_KEYS[keyId];
        const tonicMidi = (index === 0 ? 60 : key.tonicPitchClass >= 6 ? 36 : 48) + key.tonicPitchClass;
        return diatonicLayer({ key, tonicMidi, scale: major, style,
          id: `poly-${index}`, pan: index === 0 ? -0.28 : 0.28, volume: 0.7 });
      });
      return { ...layers[0], layers, accompanimentPattern: style };
    }
    if (tonality === "modal") return diatonicLayer({ key: dictation.DORIAN_MODE, tonicMidi: 62, scale: dorian, style });
    const key = choose(dictation.KEYS.filter(key => (key.id === "Am") === (tonality === "minor")));
    const tonicMidi = { C: 60, F: 65, G: 67, Am: 57 }[key.id];
    return diatonicLayer({ key, tonicMidi, scale: tonality === "minor" ? minor : major, style });
  }

  MLH.AuralTonalities = { buildMelody };
})(window.MLH || (window.MLH = {}));
