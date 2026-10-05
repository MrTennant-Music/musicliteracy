// Rhythm generation and Bravura notation reused from timesig.html.
// The listening adapter hides time signatures and counts dotted-crotchet pulses in compound time.
// Beats Per Bar and Metres use the shared 16-bar Advanced Higher Practice Questions generator.
(function attachTimeSignaturesListening(MLH) {
  const STAFF_LEFT = 24;
  const STAFF_RIGHT = 896;
  const SYSTEM_TOPS = [62, 187];
  const LINE_GAP = 10;
  const KEY_SIGNATURE_SPACING = 11;
  const NOTE_RX = 6.3;
  const STEM_LENGTH = 32;
  const BAR_COUNT = 8;
  const BARS_PER_SYSTEM = 4;
  const CLEF_X = STAFF_LEFT + 8;
  const KEY_SIGNATURE_X = STAFF_LEFT + 58;
  const TIME_SIG_X = STAFF_LEFT + 106;
  const FIRST_SYSTEM_MUSIC_START_X = STAFF_LEFT + 142;
  const OTHER_SYSTEM_MUSIC_START_X = STAFF_LEFT + 86;
  function barCountForSignature(timeSignature) {
    return ["9/8", "12/8"].includes(timeSignature?.id) ? 4 : BAR_COUNT;
  }
  function barsPerSystemForQuestion(question) {
    if (question?.questionType === "time-change") return BARS_PER_SYSTEM;
    return ["9/8", "12/8"].includes(question?.timeSignature?.id) ? 2 : BARS_PER_SYSTEM;
  }
  const NOTES = [{
    name: "C4",
    letter: "C",
    step: -2
  }, {
    name: "D4",
    letter: "D",
    step: -1
  }, {
    name: "E4",
    letter: "E",
    step: 0
  }, {
    name: "F4",
    letter: "F",
    step: 1
  }, {
    name: "G4",
    letter: "G",
    step: 2
  }, {
    name: "A4",
    letter: "A",
    step: 3
  }, {
    name: "B4",
    letter: "B",
    step: 4
  }, {
    name: "C5",
    letter: "C",
    step: 5
  }, {
    name: "D5",
    letter: "D",
    step: 6
  }, {
    name: "E5",
    letter: "E",
    step: 7
  }, {
    name: "F5",
    letter: "F",
    step: 8
  }, {
    name: "G5",
    letter: "G",
    step: 9
  }, {
    name: "A5",
    letter: "A",
    step: 10
  }];
  const KEYS = {
    C: {
      id: "C",
      label: "C major",
      tonic: "C",
      signature: [],
      scale: ["C", "D", "E", "F", "G", "A", "B"]
    },
    G: {
      id: "G",
      label: "G major",
      tonic: "G",
      signature: [{
        type: "sharp",
        step: 8
      }],
      scale: ["G", "A", "B", "C", "D", "E", "F"]
    },
    F: {
      id: "F",
      label: "F major",
      tonic: "F",
      signature: [{
        type: "flat",
        step: 4
      }],
      scale: ["F", "G", "A", "B", "C", "D", "E"]
    },
    Am: {
      id: "Am",
      label: "A minor",
      tonic: "A",
      signature: [],
      scale: ["A", "B", "C", "D", "E", "F", "G"],
      melodicSharps: {
        G: 1
      }
    },
    D: {
      id: "D",
      label: "D major",
      tonic: "D",
      signature: [{
        type: "sharp",
        step: 8
      }, {
        type: "sharp",
        step: 5
      }],
      scale: ["D", "E", "F", "G", "A", "B", "C"]
    },
    Bb: {
      id: "Bb",
      label: "B flat major",
      tonic: "B",
      signature: [{
        type: "flat",
        step: 4
      }, {
        type: "flat",
        step: 7
      }],
      scale: ["B", "C", "D", "E", "F", "G", "A"]
    },
    Em: {
      id: "Em",
      label: "E minor",
      tonic: "E",
      signature: [{
        type: "sharp",
        step: 8
      }],
      scale: ["E", "F", "G", "A", "B", "C", "D"]
    },
    Dm: {
      id: "Dm",
      label: "D minor",
      tonic: "D",
      signature: [{
        type: "flat",
        step: 4
      }],
      scale: ["D", "E", "F", "G", "A", "B", "C"]
    }
  };
  const TIME_SIGNATURES = [{
    id: "2/4",
    top: "2",
    bottom: "4",
    type: "simple",
    beatsPerBar: 2
  }, {
    id: "3/4",
    top: "3",
    bottom: "4",
    type: "simple",
    beatsPerBar: 3
  }, {
    id: "4/4",
    top: "4",
    bottom: "4",
    type: "simple",
    beatsPerBar: 4
  }, {
    id: "5/4",
    top: "5",
    bottom: "4",
    type: "simple",
    beatsPerBar: 5
  }, {
    id: "6/8",
    top: "6",
    bottom: "8",
    type: "compound",
    beatsPerBar: 3,
    compoundGroups: 2
  }, {
    id: "9/8",
    top: "9",
    bottom: "8",
    type: "compound",
    beatsPerBar: 4.5,
    compoundGroups: 3
  }, {
    id: "12/8",
    top: "12",
    bottom: "8",
    type: "compound",
    beatsPerBar: 6,
    compoundGroups: 4
  }];
  const RHYTHM_OPTIONS = [{
    id: "crotchet",
    label: "Crotchet"
  }, {
    id: "minim",
    label: "Minim"
  }, {
    id: "dotted-minim",
    label: "Dotted Minim"
  }, {
    id: "semibreve",
    label: "Semibreve"
  }, {
    id: "quaver",
    label: "Quaver"
  }, {
    id: "semiquaver",
    label: "Semiquaver"
  }, {
    id: "dotted-crotchet",
    label: "Dotted Crotchet"
  }, {
    id: "dotted-quaver",
    label: "Dotted Quaver"
  }, {
    id: "rests",
    label: "Rests"
  }];
  const LEVELS = {
    N3: {
      label: "National 3",
      description: "Crotchet • Minim • Dotted minim • Semibreve",
      rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve"],
      timeSignatureIds: ["2/4", "3/4", "4/4"],
      keyIds: ["C"]
    },
    N4: {
      label: "National 4",
      description: "Quaver • Semiquaver • Grouped semiquavers • Paired quavers",
      rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver"],
      timeSignatureIds: ["2/4", "3/4", "4/4"],
      keyIds: ["C"]
    },
    N5: {
      label: "National 5",
      description: "Dotted rhythms • Dotted crotchet • Dotted quaver",
      rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver"],
      timeSignatureIds: ["2/4", "3/4", "4/4"],
      keyIds: ["C", "G", "F", "Am"]
    },
    H: {
      label: "Higher",
      description: "6/8, 9/8, 12/8 • Rests",
      rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver", "rests"],
      timeSignatureIds: ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"],
      keyIds: ["C", "G", "F", "Am"]
    },
    AH: {
      label: "Advanced Higher",
      description: "Syncopated rhythms • 5/4 • Time changes",
      rhythmIds: ["crotchet", "minim", "dotted-minim", "semibreve", "quaver", "semiquaver", "dotted-crotchet", "dotted-quaver", "rests", "syncopation", "time-changes"],
      timeSignatureIds: ["2/4", "3/4", "4/4", "5/4", "6/8", "9/8", "12/8"],
      keyIds: ["C", "G", "F", "Am", "D", "Bb", "Em", "Dm"]
    }
  };
  const SIMPLE_PATTERNS_BY_LENGTH = {
    2: [["minim"], ["crotchet", "crotchet"], ["quaver", "quaver", "crotchet"], ["crotchet", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver"], ["dotted-crotchet", "quaver"], ["quaver", "dotted-crotchet"], ["semiquaver-group-4", "crotchet"], ["quaver-2semiquavers", "crotchet"], ["2semiquavers-quaver", "crotchet"], ["dotted-quaver-semiquaver", "crotchet"]],
    3: [["dotted-minim"], ["minim", "crotchet"], ["crotchet", "minim"], ["crotchet", "crotchet", "crotchet"], ["quaver", "quaver", "crotchet", "crotchet"], ["crotchet", "quaver", "quaver", "crotchet"], ["crotchet", "crotchet", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver", "crotchet"], ["crotchet", "quaver", "quaver", "quaver", "quaver"], ["semiquaver-group-4", "crotchet", "crotchet"], ["crotchet", "quaver-2semiquavers", "crotchet"], ["crotchet", "crotchet", "2semiquavers-quaver"], ["dotted-quaver-semiquaver", "crotchet", "crotchet"]],
    4: [["minim", "minim"], ["minim", "crotchet", "crotchet"], ["crotchet", "crotchet", "minim"], ["crotchet", "crotchet", "crotchet", "crotchet"], ["quaver", "quaver", "crotchet", "crotchet", "crotchet"], ["crotchet", "quaver", "quaver", "crotchet", "crotchet"], ["crotchet", "crotchet", "quaver", "quaver", "crotchet"], ["crotchet", "crotchet", "crotchet", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver", "minim"], ["minim", "quaver", "quaver", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver"], ["semiquaver-group-4", "crotchet", "crotchet", "crotchet"], ["crotchet", "quaver-2semiquavers", "crotchet", "crotchet"], ["crotchet", "crotchet", "2semiquavers-quaver", "crotchet"], ["crotchet", "crotchet", "crotchet", "dotted-quaver-semiquaver"], ["syncopated-crotchets", "minim"], ["minim", "syncopated-crotchets"]],
    5: [["semibreve", "crotchet"], ["crotchet", "semibreve"], ["minim", "minim", "crotchet"], ["crotchet", "minim", "minim"], ["crotchet", "crotchet", "crotchet", "crotchet", "crotchet"], ["dotted-crotchet", "quaver", "minim", "crotchet"], ["crotchet", "dotted-crotchet", "quaver", "minim"], ["quaver", "quaver", "crotchet", "crotchet", "minim"], ["semiquaver-group-4", "crotchet", "crotchet", "minim"], ["syncopated-crotchets", "minim", "crotchet"], ["minim", "syncopated-crotchets", "crotchet"]]
  };
  const RHYTHM_INFO = {
    semibreve: {
      beats: 4,
      spacing: 8,
      open: true,
      stem: false,
      dots: 0
    },
    "dotted-minim": {
      beats: 3,
      spacing: 6,
      open: true,
      stem: true,
      dots: 1
    },
    minim: {
      beats: 2,
      spacing: 4,
      open: true,
      stem: true,
      dots: 0
    },
    "dotted-crotchet": {
      beats: 1.5,
      spacing: 3,
      open: false,
      stem: true,
      dots: 1
    },
    crotchet: {
      beats: 1,
      spacing: 2.2,
      open: false,
      stem: true,
      dots: 0
    },
    quaver: {
      beats: 0.5,
      spacing: 1.15,
      open: false,
      stem: true,
      dots: 0,
      flag: true,
      beams: 1
    },
    "dotted-quaver": {
      beats: 0.75,
      spacing: 1.5,
      open: false,
      stem: true,
      dots: 1,
      flag: true,
      beams: 1
    },
    semiquaver: {
      beats: 0.25,
      spacing: 0.72,
      open: false,
      stem: true,
      dots: 0,
      flag: true,
      beams: 2
    },
    "quaver-rest": {
      beats: 0.5,
      spacing: 1.15,
      rest: true
    },
    "crotchet-rest": {
      beats: 1,
      spacing: 2.2,
      rest: true
    },
    "dotted-crotchet-rest": {
      beats: 1.5,
      spacing: 3,
      rest: true
    }
  };
  function randomIndex(length) {
    return Math.floor(Math.random() * length);
  }
  function randomItem(items) {
    return items[randomIndex(items.length)];
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function rhythmInfo(rhythm) {
    return RHYTHM_INFO[rhythm] ?? RHYTHM_INFO.crotchet;
  }
  function noteByIndex(index) {
    return NOTES[clamp(index, 0, NOTES.length - 1)];
  }
  function yForStep(step, systemTop) {
    return systemTop + LINE_GAP * 4 - step * (LINE_GAP / 2);
  }
  function stemGoesDown(step) {
    return step > 4;
  }
  function levelEnabledMap(levelKey) {
    const level = LEVELS[levelKey] || LEVELS.N3;
    const enabled = {};
    level.rhythmIds.forEach(id => {
      enabled[id] = true;
    });
    level.timeSignatureIds.forEach(id => {
      enabled[`time-${id}`] = true;
    });
    level.keyIds.forEach(id => {
      enabled[`key-${id}`] = true;
    });
    return enabled;
  }
  function activeKeyIds(enabledRhythms, level) {
    return level.keyIds.filter(id => enabledRhythms[`key-${id}`]);
  }
  function randomKey(level, enabledRhythms) {
    const ids = activeKeyIds(enabledRhythms, level);
    return KEYS[randomItem(ids.length ? ids : level.keyIds)] || KEYS.C;
  }
  function applyKeyAccidental(note, key) {
    if (key?.id === "Am" && note.letter === "G") return {
      ...note,
      writtenAccidental: 1,
      impliedAccidental: 1
    };
    return {
      ...note,
      writtenAccidental: null,
      impliedAccidental: null
    };
  }
  function normaliseAminorAccidentals(bars, key) {
    if (key?.id !== "Am") return;
    bars.forEach(bar => {
      let hasShownGSharp = false;
      bar.notes.forEach(note => {
        if (rhythmInfo(note.rhythm).rest || note.pitch?.letter !== "G") return;
        note.pitch = {
          ...note.pitch,
          impliedAccidental: 1,
          writtenAccidental: hasShownGSharp ? null : 1
        };
        hasShownGSharp = true;
      });
    });
  }
  function tonicNoteForKey(key, referenceStep = null) {
    const tonicNotes = NOTES.filter(note => note.letter === key.tonic);
    const source = tonicNotes.length ? tonicNotes : [NOTES[0]];
    const chosen = referenceStep === null || referenceStep === undefined ? source[Math.floor((source.length - 1) / 2)] : source.reduce((best, note) => Math.abs(note.step - referenceStep) < Math.abs(best.step - referenceStep) ? note : best, source[0]);
    return applyKeyAccidental(chosen, key);
  }
  function forceTonicEndpoints(bars, key) {
    const soundingNotes = bars.flatMap(bar => bar.notes).filter(note => !rhythmInfo(note.rhythm).rest);
    if (!soundingNotes.length) return;
    const secondStep = soundingNotes[1]?.pitch?.step;
    const penultimateStep = soundingNotes[soundingNotes.length - 2]?.pitch?.step;
    soundingNotes[0].pitch = tonicNoteForKey(key, secondStep);
    soundingNotes[soundingNotes.length - 1].pitch = tonicNoteForKey(key, penultimateStep);
  }
  function removeLargeLeaps(bars, key) {
    const soundingNotes = bars.flatMap(bar => bar.notes).filter(note => !rhythmInfo(note.rhythm).rest);
    for (let index = 1; index < soundingNotes.length; index += 1) {
      const previous = soundingNotes[index - 1].pitch;
      const current = soundingNotes[index].pitch;
      if (Math.abs(current.step - previous.step) <= 7) continue;
      const sameLetterNotes = NOTES.filter(note => note.letter === current.letter);
      const replacement = sameLetterNotes.reduce((best, note) => Math.abs(note.step - previous.step) < Math.abs(best.step - previous.step) ? note : best, sameLetterNotes[0] || current);
      soundingNotes[index].pitch = applyKeyAccidental(replacement, key);
    }
  }
  function fastRhythmMovesByStep(rhythm) {
    return ["quaver", "dotted-quaver", "semiquaver"].includes(rhythm);
  }
  function noteByStep(step) {
    return NOTES.find(note => note.step === step) || null;
  }
  function stepPitchNear(referenceStep, targetStep, key) {
    const direction = targetStep >= referenceStep ? 1 : -1;
    const preferred = noteByStep(referenceStep + direction);
    const fallback = noteByStep(referenceStep - direction);
    return applyKeyAccidental(preferred || fallback || noteByIndex(Math.floor(NOTES.length / 2)), key);
  }
  function enforceFastRhythmStepwiseMotion(bars, key) {
    const soundingNotes = bars.flatMap(bar => bar.notes).filter(note => !rhythmInfo(note.rhythm).rest);
    for (let index = 1; index < soundingNotes.length; index += 1) {
      const previous = soundingNotes[index - 1];
      const current = soundingNotes[index];
      if (!fastRhythmMovesByStep(previous.rhythm) && !fastRhythmMovesByStep(current.rhythm)) continue;
      if (Math.abs(current.pitch.step - previous.pitch.step) <= 1) continue;
      if (index === soundingNotes.length - 1 && index > 1) {
        previous.pitch = stepPitchNear(current.pitch.step, previous.pitch.step, key);
      } else {
        current.pitch = stepPitchNear(previous.pitch.step, current.pitch.step, key);
      }
    }
  }
  function expandRhythmToken(token) {
    if (token === "syncopated-crotchets") return ["quaver", "crotchet", "quaver"];
    if (token === "quaver-group-3") return ["quaver", "quaver", "quaver"];
    if (token === "semiquaver-group-4") return ["semiquaver", "semiquaver", "semiquaver", "semiquaver"];
    if (token === "quaver-2semiquavers") return ["quaver", "semiquaver", "semiquaver"];
    if (token === "2semiquavers-quaver") return ["semiquaver", "semiquaver", "quaver"];
    if (token === "dotted-quaver-semiquaver") return ["dotted-quaver", "semiquaver"];
    if (token === "crotchet-quaver") return ["crotchet", "quaver"];
    if (token === "quaver-crotchet") return ["quaver", "crotchet"];
    return [token];
  }
  function rhythmAllowed(rhythm, enabledRhythms, restsEnabled) {
    if (rhythmInfo(rhythm).rest) {
      if (!restsEnabled || !enabledRhythms.rests) return false;
      if (rhythm === "dotted-crotchet-rest") return !!enabledRhythms["dotted-crotchet"];
      if (rhythm === "crotchet-rest") return !!enabledRhythms.crotchet;
      if (rhythm === "quaver-rest") return !!enabledRhythms.quaver;
      return true;
    }
    if (rhythm === "dotted-quaver") return !!enabledRhythms["dotted-quaver"];
    return !!enabledRhythms[rhythm];
  }
  function tokenAllowed(token, enabledRhythms, restsEnabled) {
    if (token === "syncopated-crotchets") return !!enabledRhythms.syncopation && !!enabledRhythms.quaver && !!enabledRhythms.crotchet;
    return expandRhythmToken(token).every(rhythm => rhythmAllowed(rhythm, enabledRhythms, restsEnabled));
  }
  function patternAllowed(pattern, enabledRhythms, restsEnabled) {
    return pattern.every(token => tokenAllowed(token, enabledRhythms, restsEnabled));
  }
  function patternUsesSemiquavers(pattern) {
    return pattern.some(token => expandRhythmToken(token).some(rhythm => rhythm === "semiquaver"));
  }
  function signatureAllowsSemiquavers(signature) {
    return !["9/8", "12/8"].includes(signature?.id);
  }
  function patternAllowedForSignature(pattern, signature, enabledRhythms, restsEnabled) {
    if (!signatureAllowsSemiquavers(signature) && patternUsesSemiquavers(pattern)) return false;
    return patternAllowed(pattern, enabledRhythms, restsEnabled);
  }
  function levelAllowsFourSemiquaverGroups(activeLevel) {
    return !["H", "AH"].includes(activeLevel);
  }
  const COMPOUND_GROUP_PATTERNS = [["dotted-crotchet"], ["quaver-group-3"], ["crotchet-quaver"], ["quaver-crotchet"]];
  function signatureCanBeGenerated(signature, enabledRhythms, restsEnabled) {
    if (!enabledRhythms[`time-${signature.id}`]) return false;
    if (signature.type === "simple") {
      return (SIMPLE_PATTERNS_BY_LENGTH[signature.beatsPerBar] || []).some(pattern => patternAllowedForSignature(pattern, signature, enabledRhythms, restsEnabled));
    }
    return COMPOUND_GROUP_PATTERNS.some(pattern => patternAllowedForSignature(pattern, signature, enabledRhythms, restsEnabled));
  }
  function hasGeneratableTimeSignature(level, enabledRhythms, restsEnabled) {
    const selectedSignatures = TIME_SIGNATURES.filter(signature => level.timeSignatureIds.includes(signature.id) && enabledRhythms[`time-${signature.id}`]);
    return selectedSignatures.length > 0 && selectedSignatures.every(signature => signatureCanBeGenerated(signature, enabledRhythms, restsEnabled));
  }
  function nearestMelodicIndex(previousIndex, stepwiseNoRepeat = false) {
    if (!stepwiseNoRepeat) return clamp(previousIndex + randomItem([-2, -1, 0, 0, 1, 2]), 0, NOTES.length - 1);
    if (previousIndex <= 0) return 1;
    if (previousIndex >= NOTES.length - 1) return NOTES.length - 2;
    return previousIndex + randomItem([-1, 1]);
  }
  function makeCompoundRhythms(timeSignature, barIndex, restsEnabled = true, enabledRhythms = levelEnabledMap("H"), totalBars = BAR_COUNT) {
    if (barIndex === totalBars - 1 && timeSignature.id === "6/8" && patternAllowedForSignature(["dotted-minim"], timeSignature, enabledRhythms, restsEnabled) && Math.random() < 0.45) return ["dotted-minim"];
    const basePatterns = COMPOUND_GROUP_PATTERNS.filter(pattern => patternAllowedForSignature(pattern, timeSignature, enabledRhythms, restsEnabled));
    const basePattern = basePatterns.length ? randomItem(basePatterns)[0] : "dotted-crotchet";
    const groups = Array.from({
      length: timeSignature.compoundGroups
    }, () => basePattern);
    if (restsEnabled && patternAllowedForSignature(["dotted-crotchet-rest"], timeSignature, enabledRhythms, restsEnabled) && Math.random() < 0.22) groups[randomIndex(groups.length)] = "dotted-crotchet-rest";
    if (patternAllowedForSignature(["quaver-group-3"], timeSignature, enabledRhythms, restsEnabled) && Math.random() < 0.5) {
      const available = groups.map((group, index) => ({
        group,
        index
      })).filter(item => item.group === "dotted-crotchet");
      if (available.length) groups[randomItem(available).index] = "quaver-group-3";
    }
    if ((patternAllowedForSignature(["crotchet-quaver"], timeSignature, enabledRhythms, restsEnabled) || patternAllowedForSignature(["quaver-crotchet"], timeSignature, enabledRhythms, restsEnabled)) && Math.random() < 0.4) {
      const available = groups.map((group, index) => ({
        group,
        index
      })).filter(item => item.group === "dotted-crotchet");
      if (available.length) {
        const options = ["crotchet-quaver", "quaver-crotchet"].filter(token => patternAllowedForSignature([token], timeSignature, enabledRhythms, restsEnabled));
        if (options.length) groups[randomItem(available).index] = randomItem(options);
      }
    }
    return groups;
  }
  function applyRareSimpleRests(pattern, restsEnabled = true) {
    if (!restsEnabled) return pattern;
    if (Math.random() > 0.35 || pattern.some(rhythm => rhythm.includes("semiquaver"))) return pattern;
    const result = [...pattern];
    const crotchetIndexes = result.map((rhythm, index) => rhythm === "crotchet" ? index : -1).filter(index => index >= 0);
    if (crotchetIndexes.length && Math.random() < 0.6) {
      result[randomItem(crotchetIndexes)] = "crotchet-rest";
      return result;
    }
    for (let index = 0; index <= result.length - 2; index += 1) {
      if (result[index] === "quaver" && result[index + 1] === "quaver") {
        result[index + randomIndex(2)] = "quaver-rest";
        return result;
      }
    }
    return result;
  }
  function makeSimpleRhythms(timeSignature, barIndex, restsEnabled = true, enabledRhythms = levelEnabledMap("N3"), totalBars = BAR_COUNT, activeLevel = "N3") {
    const patterns = (SIMPLE_PATTERNS_BY_LENGTH[timeSignature.beatsPerBar] ?? [["crotchet"]]).filter(pattern => patternAllowedForSignature(pattern, timeSignature, enabledRhythms, restsEnabled)).filter(pattern => levelAllowsFourSemiquaverGroups(activeLevel) || !pattern.includes("semiquaver-group-4"));
    const safePatterns = patterns.length ? patterns : [["crotchet"]];
    const semiquaverPatterns = patterns.filter(pattern => pattern.some(rhythm => rhythm.includes("semiquaver")));
    const regularPatterns = safePatterns.filter(pattern => !pattern.some(rhythm => rhythm.includes("semiquaver")));
    const pool = semiquaverPatterns.length && Math.random() < 0.16 ? semiquaverPatterns : regularPatterns;
    const finalPool = timeSignature.beatsPerBar === 4 && barIndex === totalBars - 1 && patternAllowedForSignature(["semibreve"], timeSignature, enabledRhythms, restsEnabled) ? [["semibreve"], ...pool] : pool;
    const chosen = randomItem(finalPool.length ? finalPool : safePatterns);
    return applyRareSimpleRests(chosen, restsEnabled);
  }
  function makeBarRhythms(timeSignature, barIndex, restsEnabled = true, enabledRhythms = levelEnabledMap("N3"), totalBars = BAR_COUNT, activeLevel = "N3") {
    return timeSignature.type === "compound" ? makeCompoundRhythms(timeSignature, barIndex, restsEnabled, enabledRhythms, totalBars) : makeSimpleRhythms(timeSignature, barIndex, restsEnabled, enabledRhythms, totalBars, activeLevel);
  }
  function makeBar(timeSignature, previousIndex, barIndex, restsEnabled = true, enabledRhythms = levelEnabledMap("N3"), key = KEYS.C, totalBars = BAR_COUNT, activeLevel = "N3") {
    const rhythms = makeBarRhythms(timeSignature, barIndex, restsEnabled, enabledRhythms, totalBars, activeLevel);
    const notes = [];
    let noteIndex = previousIndex;
    let beamGroupCounter = 0;
    function addNote(rhythm, beamGroupId = undefined, stepwise = false) {
      if (rhythmInfo(rhythm).rest) {
        notes.push({
          rhythm,
          pitch: noteByIndex(noteIndex),
          beamGroupId: null
        });
        return;
      }
      noteIndex = nearestMelodicIndex(noteIndex, stepwise);
      let pitch = noteByIndex(noteIndex);
      if (key?.scale?.length) {
        let attempts = 0;
        while (!key.scale.includes(pitch.letter) && attempts < 8) {
          noteIndex = nearestMelodicIndex(noteIndex, stepwise);
          pitch = noteByIndex(noteIndex);
          attempts += 1;
        }
      }
      notes.push({
        rhythm,
        pitch: applyKeyAccidental(pitch, key),
        beamGroupId
      });
    }
    function addBeamedGroup(rhythmList) {
      const beamGroupId = `beam-${beamGroupCounter}`;
      beamGroupCounter += 1;
      rhythmList.forEach(rhythm => addNote(rhythm, beamGroupId, ["quaver", "semiquaver", "dotted-quaver"].includes(rhythm)));
    }
    rhythms.forEach(rhythm => {
      if (rhythm === "syncopated-crotchets") {
        addNote("quaver", null, true);
        addNote("crotchet");
        addNote("quaver", null, true);
        return;
      }
      if (rhythm === "quaver-group-3") return addBeamedGroup(["quaver", "quaver", "quaver"]);
      if (rhythm === "semiquaver-group-4") return addBeamedGroup(["semiquaver", "semiquaver", "semiquaver", "semiquaver"]);
      if (rhythm === "quaver-2semiquavers") return addBeamedGroup(["quaver", "semiquaver", "semiquaver"]);
      if (rhythm === "2semiquavers-quaver") return addBeamedGroup(["semiquaver", "semiquaver", "quaver"]);
      if (rhythm === "dotted-quaver-semiquaver") return addBeamedGroup(["dotted-quaver", "semiquaver"]);
      if (rhythm === "crotchet-quaver") {
        addNote("crotchet");
        addNote("quaver", null, true);
        return;
      }
      if (rhythm === "quaver-crotchet") {
        addNote("quaver", null, true);
        addNote("crotchet");
        return;
      }
      addNote(rhythm, undefined, rhythm === "quaver");
    });
    return {
      notes,
      nextIndex: noteIndex
    };
  }
  function availableTimeSignatures(level, enabledRhythms, restsEnabled = false) {
    return TIME_SIGNATURES.filter(signature => level.timeSignatureIds.includes(signature.id) && signatureCanBeGenerated(signature, enabledRhythms, restsEnabled));
  }
  function finishQuestion({
    activeLevel,
    key,
    timeSignature,
    bars,
    questionType = "identify",
    givenTimeSignature = null,
    prompt = "Identify the time signature."
  }) {
    forceTonicEndpoints(bars, key);
    removeLargeLeaps(bars, key);
    enforceFastRhythmStepwiseMotion(bars, key);
    normaliseAminorAccidentals(bars, key);
    return {
      id: Math.random().toString(36).slice(2),
      activeLevel,
      questionType,
      key,
      timeSignature,
      givenTimeSignature,
      prompt,
      bars
    };
  }
  const SHARED_SYMBOLS = window.BRAVURA_SYMBOLS || {};
  const SHARED_CONFIG = window.SHARED_NOTATION_CONFIG || {
    drawing: {},
    symbols: {}
  };
  function sharedActualSymbolKey(key) {
    if (key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown") return "noteheadBlack";
    if (key === "augmentationDotLine" || key === "augmentationDotSpace") return "augmentationDot";
    if (key === "sharpKeySignature" || key === "sharpInScore") return "sharp";
    if (key === "flatKeySignature" || key === "flatInScore") return "flat";
    return key;
  }
  function sharedSymbolConfig(key) {
    const symbols = SHARED_CONFIG.symbols || {};
    return symbols[key] || symbols[sharedActualSymbolKey(key)] || {
      fontSizeScale: 3.4,
      xOffsetScale: 0,
      yOffsetScale: 0,
      widthScale: 1,
      heightScale: 1,
      opticalXOffset: 0,
      opticalYOffset: 0
    };
  }
  function sharedSymbolForKey(key) {
    return SHARED_SYMBOLS[sharedActualSymbolKey(key)] || "";
  }
  function CalibratedSymbol({
    symbolKey,
    x,
    y,
    colour = "currentColor",
    opacity = 1,
    lineGap = LINE_GAP,
    settingOverrides = {}
  }) {
    const glyph = sharedSymbolForKey(symbolKey);
    if (!glyph) return null;
    const settings = {
      ...sharedSymbolConfig(symbolKey),
      ...settingOverrides
    };
    const adjustedX = x + lineGap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const adjustedY = y + lineGap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const fontSize = lineGap * Number(settings.fontSizeScale || 3.4);
    return /*#__PURE__*/React.createElement("text", {
      className: "music-symbol",
      x: adjustedX,
      y: adjustedY,
      fill: colour,
      opacity: opacity,
      fontSize: fontSize,
      textAnchor: "middle",
      transform: `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`,
      pointerEvents: "none"
    }, glyph);
  }
  function StaffLines({
    systemTop
  }) {
    return /*#__PURE__*/React.createElement("g", null, [0, 1, 2, 3, 4].map(index => /*#__PURE__*/React.createElement("line", {
      key: index,
      x1: STAFF_LEFT,
      x2: STAFF_RIGHT,
      y1: systemTop + index * LINE_GAP,
      y2: systemTop + index * LINE_GAP,
      stroke: "currentColor",
      strokeWidth: "1.2"
    })));
  }
  function TrebleClef({
    systemTop
  }) {
    return /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: "gClef",
      x: CLEF_X + LINE_GAP * 2.3,
      y: yForStep(2, systemTop)
    });
  }
  function KeySignature({
    keySignature,
    systemTop
  }) {
    return /*#__PURE__*/React.createElement("g", null, (keySignature?.signature || []).map((item, index) => /*#__PURE__*/React.createElement(CalibratedSymbol, {
      key: `${item.type}-${index}`,
      symbolKey: item.type === "sharp" ? "sharpKeySignature" : "flatKeySignature",
      x: KEY_SIGNATURE_X + index * KEY_SIGNATURE_SPACING,
      y: yForStep(item.step, systemTop)
    })));
  }
  function Accidental({
    value,
    x,
    y,
    colour = "currentColor"
  }) {
    if (!value) return null;
    return /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: value > 0 ? "sharpInScore" : "flatInScore",
      x: x,
      y: y,
      colour: colour
    });
  }
  function LedgerLines({
    x,
    step,
    systemTop,
    colour = "currentColor"
  }) {
    const lines = [];
    for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) lines.push(yForStep(ledgerStep, systemTop));
    for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) lines.push(yForStep(ledgerStep, systemTop));
    const settings = sharedSymbolConfig("ledgerLines");
    const xOffset = LINE_GAP * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const yOffset = LINE_GAP * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const halfWidth = LINE_GAP * Number(SHARED_CONFIG.drawing?.ledgerLineWidthScale || 2.4) * Number(settings.widthScale || 1) / 2;
    const thickness = Math.max(1, LINE_GAP * Number(SHARED_CONFIG.drawing?.ledgerLineThicknessScale || 0.11) * Number(settings.heightScale || 1));
    return /*#__PURE__*/React.createElement("g", null, lines.map(lineY => /*#__PURE__*/React.createElement("line", {
      key: lineY,
      x1: x - halfWidth + xOffset,
      x2: x + halfWidth + xOffset,
      y1: lineY + yOffset,
      y2: lineY + yOffset,
      stroke: colour,
      strokeWidth: thickness
    })));
  }
  function Rest({
    rhythm,
    x,
    systemTop,
    colour = "currentColor"
  }) {
    const middleY = yForStep(4, systemTop);
    const restKey = rhythm === "dotted-crotchet-rest" || rhythm === "crotchet-rest" ? "quarterRest" : "eighthRest";
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: restKey,
      x: x,
      y: middleY,
      colour: colour
    }), rhythm === "dotted-crotchet-rest" && /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: "augmentationDotSpace",
      x: x + LINE_GAP * 1.1,
      y: middleY - LINE_GAP * 0.4,
      colour: colour
    }));
  }
  function getStemData(item, x, systemTop, stemDownOverride = null) {
    const step = item.pitch.step;
    const y = yForStep(step, systemTop);
    const stemDown = stemDownOverride ?? stemGoesDown(step);
    const stemX = stemDown ? x - NOTE_RX + 0 : x + NOTE_RX + 0;
    const stemEndY = stemDown ? y + STEM_LENGTH : y - STEM_LENGTH;
    return {
      step,
      y,
      stemDown,
      stemX,
      stemEndY
    };
  }
  function noteSymbolKey(rhythm, stemDown, beamed = false) {
    if (rhythm === "semibreve") return "wholeNote";
    if (rhythm === "minim" || rhythm === "dotted-minim") return stemDown ? "halfNoteStemDown" : "halfNoteStemUp";
    if (beamed) return stemDown ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "quaver" || rhythm === "dotted-quaver") return stemDown ? "eighthNoteStemDown" : "eighthNoteStemUp";
    if (rhythm === "semiquaver") return stemDown ? "sixteenthNoteStemDown" : "sixteenthNoteStemUp";
    return stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp";
  }
  function Note({
    item,
    x,
    systemTop,
    colour = "currentColor",
    stemDownOverride = null,
    forcedStemEndY = null,
    showFlag = true
  }) {
    const info = rhythmInfo(item.rhythm);
    if (info.rest) return /*#__PURE__*/React.createElement(Rest, {
      rhythm: item.rhythm,
      x: x,
      systemTop: systemTop,
      colour: colour
    });
    const stem = getStemData(item, x, systemTop, stemDownOverride);
    const stemEndY = forcedStemEndY ?? stem.stemEndY;
    const beamed = showFlag === false;
    const dotKey = Math.abs(stem.step % 2) === 1 ? "augmentationDotSpace" : "augmentationDotLine";
    const dotY = Math.abs(stem.step % 2) === 1 ? stem.y : stem.y - LINE_GAP * 0.25;
    const stemThickness = Math.max(1, LINE_GAP * Number(SHARED_CONFIG.drawing?.stemThicknessScale || 0.12));
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement(LedgerLines, {
      x: x,
      step: stem.step,
      systemTop: systemTop,
      colour: colour
    }), /*#__PURE__*/React.createElement(Accidental, {
      value: item.pitch.writtenAccidental,
      x: x - LINE_GAP * 2,
      y: stem.y,
      colour: colour
    }), /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: noteSymbolKey(item.rhythm, stem.stemDown, beamed),
      x: x,
      y: stem.y,
      colour: colour
    }), beamed && info.stem && /*#__PURE__*/React.createElement("line", {
      x1: stem.stemX,
      x2: stem.stemX,
      y1: stem.y,
      y2: stemEndY,
      stroke: colour,
      strokeWidth: stemThickness
    }), info.dots === 1 && /*#__PURE__*/React.createElement(CalibratedSymbol, {
      symbolKey: dotKey,
      x: x + LINE_GAP * 1.3,
      y: dotY,
      colour: colour
    }));
  }
  function getBarNotePositions(notes, startX, endX) {
    const totalUnits = notes.reduce((total, note) => total + rhythmInfo(note.rhythm).spacing, 0);
    const unitWidth = Math.max(1, endX - startX) / Math.max(1, totalUnits);
    let cursor = startX + unitWidth * 0.35;
    return notes.map(note => {
      const x = cursor;
      cursor += rhythmInfo(note.rhythm).spacing * unitWidth;
      return x;
    });
  }
  function getBeamLineYAtX(x, start, end) {
    if (!start || !end || start.x === end.x) return start?.y ?? end?.y ?? 0;
    const progress = (x - start.x) / (end.x - start.x);
    return start.y + progress * (end.y - start.y);
  }
  function getBeamData(items, positions, systemTop) {
    const middleLineStep = 4;
    const averageStep = items.reduce((sum, item) => sum + item.pitch.step, 0) / items.length;
    let stemDown;
    if (averageStep > middleLineStep) stemDown = true;else if (averageStep < middleLineStep) stemDown = false;else stemDown = items[0].pitch.step > middleLineStep;
    const anchorStep = stemDown ? Math.max(...items.map(item => item.pitch.step)) : Math.min(...items.map(item => item.pitch.step));
    const anchorIndex = items.findIndex(item => item.pitch.step === anchorStep);
    const startStem = getStemData(items[0], positions[0], systemTop, stemDown);
    const endStem = getStemData(items[items.length - 1], positions[positions.length - 1], systemTop, stemDown);
    const anchorStem = getStemData(items[anchorIndex], positions[anchorIndex], systemTop, stemDown);
    const rawSlope = (items[items.length - 1].pitch.step - items[0].pitch.step) * -2;
    const totalSlope = clamp(rawSlope, -8, 8);
    const totalX = Math.max(1, endStem.stemX - startStem.stemX);
    const slopePerX = totalSlope / totalX;
    return {
      stemDown,
      start: {
        x: startStem.stemX,
        y: anchorStem.stemEndY - slopePerX * (anchorStem.stemX - startStem.stemX)
      },
      end: {
        x: endStem.stemX,
        y: anchorStem.stemEndY + slopePerX * (endStem.stemX - anchorStem.stemX)
      }
    };
  }
  function isBeamableRhythm(rhythm) {
    return ["quaver", "semiquaver", "dotted-quaver"].includes(rhythm);
  }
  function getQuaverGroups(notes) {
    const groups = [];
    let index = 0;
    while (index < notes.length) {
      const note = notes[index];
      if (!isBeamableRhythm(note.rhythm) || note.beamGroupId === null) {
        index += 1;
        continue;
      }
      const runStart = index;
      const beamGroupId = note.beamGroupId;
      if (beamGroupId === undefined) while (index < notes.length && isBeamableRhythm(notes[index].rhythm) && notes[index].beamGroupId === undefined) index += 1;else while (index < notes.length && isBeamableRhythm(notes[index].rhythm) && notes[index].beamGroupId === beamGroupId) index += 1;
      const runEnd = index - 1;
      if (beamGroupId !== undefined) {
        if (runEnd > runStart) groups.push({
          start: runStart,
          end: runEnd
        });
        continue;
      }
      let groupStart = runStart;
      while (groupStart <= runEnd) {
        const remaining = runEnd - groupStart + 1;
        const groupSize = remaining >= 4 ? 4 : remaining === 3 ? 2 : remaining;
        const groupEnd = groupStart + groupSize - 1;
        if (groupEnd > groupStart) groups.push({
          start: groupStart,
          end: groupEnd
        });
        groupStart = groupEnd + 1;
      }
    }
    return groups;
  }
  function groupForNote(groups, noteIndex) {
    return groups.find(group => noteIndex >= group.start && noteIndex <= group.end) ?? null;
  }
  function Beam({
    start,
    end,
    groupNotes,
    groupPositions,
    stemDown
  }) {
    const secondaryOffset = stemDown ? -7 : 7;
    const secondarySegments = [];
    let segmentStart = null;
    groupNotes.forEach((note, index) => {
      const isSemiquaver = rhythmInfo(note.rhythm).beams === 2;
      const nextNote = groupNotes[index + 1];
      const nextIsSemiquaver = Boolean(nextNote && rhythmInfo(nextNote.rhythm).beams === 2);
      if (isSemiquaver && segmentStart === null) segmentStart = index;
      if (segmentStart !== null && (!nextIsSemiquaver || index === groupNotes.length - 1)) {
        secondarySegments.push({
          startIndex: segmentStart,
          endIndex: index,
          isHook: index === segmentStart
        });
        segmentStart = null;
      }
    });
    function stemXFor(index) {
      const x = groupPositions[index];
      return stemDown ? x - NOTE_RX + 1 : x + NOTE_RX - 1;
    }
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: start.x - 0.5,
      y1: start.y,
      x2: end.x + 0.5,
      y2: end.y,
      stroke: "currentColor",
      strokeWidth: "4",
      strokeLinecap: "butt"
    }), secondarySegments.map((segment, index) => {
      const hookLength = 14;
      const hookGoesLeft = segment.startIndex > 0;
      const x1 = stemXFor(segment.startIndex) + (!stemDown ? 1 : 0);
      const y1 = getBeamLineYAtX(x1, start, end) + secondaryOffset;
      const x2 = segment.isHook ? x1 + (hookGoesLeft ? -hookLength : hookLength) : stemXFor(segment.endIndex) + (!stemDown ? 1 : 0);
      const y2 = segment.isHook ? y1 : getBeamLineYAtX(x2, start, end) + secondaryOffset;
      return /*#__PURE__*/React.createElement("line", {
        key: index,
        x1: x1 - 0.5,
        y1: y1,
        x2: x2,
        y2: y2,
        stroke: "currentColor",
        strokeWidth: "4",
        strokeLinecap: "butt"
      });
    }));
  }
  function Bar({
    bar,
    barIndex,
    systemTop,
    startX,
    endX,
    isFinalBar,
    isTimeChangeBoundary = false,
    activeNoteId = null
  }) {
    const isFirstBarInSystem = barIndex === 0 || barIndex === 4;
    const firstNoteOffset = isFirstBarInSystem ? 2 : 7;
    const positions = getBarNotePositions(bar.notes, startX + firstNoteOffset + 5, endX - 6);
    const quaverGroups = getQuaverGroups(bar.notes);
    return /*#__PURE__*/React.createElement("g", null, bar.notes.map((note, index) => {
      const group = groupForNote(quaverGroups, index);
      if (!group) return /*#__PURE__*/React.createElement(Note, {
        key: index,
        item: note,
        colour: note.id === activeNoteId ? "#2563eb" : "currentColor",
        x: positions[index],
        systemTop: systemTop
      });
      const groupNotes = bar.notes.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beamData = getBeamData(groupNotes, groupPositions, systemTop);
      const stem = getStemData(note, positions[index], systemTop, beamData.stemDown);
      const forcedStemEndY = getBeamLineYAtX(stem.stemX, beamData.start, beamData.end);
      return /*#__PURE__*/React.createElement(Note, {
        key: index,
        item: note,
        colour: note.id === activeNoteId ? "#2563eb" : "currentColor",
        x: positions[index],
        systemTop: systemTop,
        stemDownOverride: beamData.stemDown,
        forcedStemEndY: forcedStemEndY,
        showFlag: false
      });
    }), quaverGroups.map((group, index) => {
      const groupNotes = bar.notes.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beamData = getBeamData(groupNotes, groupPositions, systemTop);
      return /*#__PURE__*/React.createElement(Beam, {
        key: index,
        start: beamData.start,
        end: beamData.end,
        groupNotes: groupNotes,
        groupPositions: groupPositions,
        stemDown: beamData.stemDown
      });
    }), isFinalBar ? /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: endX - 5,
      x2: endX - 5,
      y1: systemTop,
      y2: systemTop + LINE_GAP * 4,
      stroke: "currentColor",
      strokeWidth: "1.4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: endX,
      x2: endX,
      y1: systemTop - 0.75,
      y2: systemTop + LINE_GAP * 4 + 0.75,
      stroke: "currentColor",
      strokeWidth: "4"
    })) : isTimeChangeBoundary ? /*#__PURE__*/React.createElement("g", {
      "data-time-change-barline": "true"
    }, /*#__PURE__*/React.createElement("line", {
      x1: endX - 5,
      x2: endX - 5,
      y1: systemTop,
      y2: systemTop + LINE_GAP * 4,
      stroke: "currentColor",
      strokeWidth: "1.4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: endX,
      x2: endX,
      y1: systemTop,
      y2: systemTop + LINE_GAP * 4,
      stroke: "currentColor",
      strokeWidth: "1.4"
    })) : /*#__PURE__*/React.createElement("line", {
      x1: endX,
      x2: endX,
      y1: systemTop,
      y2: systemTop + LINE_GAP * 4,
      stroke: "currentColor",
      strokeWidth: "1.4"
    }));
  }
  function signaturesForLevel(level) {
    return TIME_SIGNATURES.filter(signature => LEVELS[level].timeSignatureIds.includes(signature.id));
  }
  function pulseCount(signature) {
    return signature.type === "compound" ? signature.compoundGroups : signature.beatsPerBar;
  }
  function midiForPitch(pitch, key) {
    const semitones = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11
    };
    const keySign = key.signature.find(sign => NOTES.find(note => note.step === sign.step)?.letter === pitch.letter);
    const accidental = pitch.impliedAccidental ?? pitch.writtenAccidental ?? (keySign?.type === "sharp" ? 1 : keySign?.type === "flat" ? -1 : 0);
    const octave = Number(pitch.name.match(/\d+$/)?.[0] || 4);
    return 12 * (octave + 1) + semitones[pitch.letter] + accidental;
  }
  function buildListeningMelody(activeLevel, signatureIds) {
    const sourceLevel = LEVELS[activeLevel];
    const level = {
      ...sourceLevel,
      timeSignatureIds: signatureIds
    };
    const enabledRhythms = levelEnabledMap(activeLevel);
    TIME_SIGNATURES.forEach(signature => {
      enabledRhythms["time-" + signature.id] = signatureIds.includes(signature.id);
    });
    const restsEnabled = sourceLevel.rhythmIds.includes("rests");
    const key = randomKey(level, enabledRhythms);
    const timeSignature = randomItem(availableTimeSignatures(level, enabledRhythms, restsEnabled));
    if (!timeSignature) throw new Error("No available listening time signature.");
    const barCount = barCountForSignature(timeSignature);
    const bars = [];
    let previousIndex = randomIndex(NOTES.length);
    for (let barIndex = 0; barIndex < barCount; barIndex++) {
      const bar = makeBar(timeSignature, previousIndex, barIndex, restsEnabled, enabledRhythms, key, barCount, activeLevel);
      bars.push({
        ...bar,
        barIndex
      });
      previousIndex = bar.nextIndex;
    }
    const question = finishQuestion({
      activeLevel,
      key,
      timeSignature,
      bars
    });
    bars.forEach(bar => {
      let beat = 0;
      bar.notes = bar.notes.map((note, noteIndex) => {
        const info = rhythmInfo(note.rhythm);
        const result = {
          ...note,
          id: bar.barIndex + "-" + noteIndex,
          beat,
          beats: info.beats,
          rest: Boolean(info.rest),
          midi: midiForPitch(note.pitch, key)
        };
        beat += info.beats;
        return result;
      });
    });
    const pulsePitches = [0, 2, 4].map((degree, index) => midiForPitch({
      name: key.scale[degree] + (index === 0 ? 2 : 3),
      letter: key.scale[degree]
    }, key));
    return {
      ...question,
      timeSignature: {
        ...timeSignature,
        beats: timeSignature.beatsPerBar,
        pulseCount: pulseCount(timeSignature),
        pulseQuarterBeats: timeSignature.type === "compound" ? 1.5 : 1
      },
      pulsePitches
    };
  }
  function practiceScaleMidi(generator, relativeStep, tonicMidi, minor) {
    const degree = ((relativeStep % 7) + 7) % 7;
    // Match Practice Questions' raised leading note and dominant harmony.
    return generator.relativeStepToMidi(relativeStep, tonicMidi, minor ? "minor" : "major")
      + (minor && degree === 6 ? 1 : 0);
  }

  function practiceAccompanimentForBar(generator, bar, key, signature, style, finalBar, subdivisions) {
    const minor = key.id.endsWith("m");
    const tonicMidi = midiForPitch({ name: key.tonic + "3", letter: key.tonic }, key);
    const degrees = generator.CHORD_DEGREES[bar.chordSymbol] || generator.CHORD_DEGREES.I;
    const rootStep = degrees[0] - 1;
    const pitches = degrees.map(degree => {
      let step = degree - 1;
      while (step < rootStep) step += 7;
      return practiceScaleMidi(generator, step, tonicMidi, minor);
    });
    return MLH.AuralAccompaniment.eventsForBar({
      signature, style, finalBar: finalBar && !subdivisions, subdivisions, notes: bar.notes,
      segments: [{ beat: 0, pitches }]
    });
  }

  function buildAdvancedHigherListeningMelody(signatureIds, { subdivisions = false } = {}) {
    const generator = window.PracticeMelodyGenerator;
    if (!generator?.generateAdvancedHigherPlan) throw new Error("The Practice Questions melody generator is unavailable.");
    const sourceSignature = randomItem(TIME_SIGNATURES.filter(signature => signatureIds.includes(signature.id)));
    if (!sourceSignature) throw new Error("No available listening time signature.");
    const timeSignature = {
      ...sourceSignature, beats: sourceSignature.beatsPerBar,
      pulseCount: pulseCount(sourceSignature),
      pulseQuarterBeats: sourceSignature.type === "compound" ? 1.5 : 1
    };
    const key = randomItem(Object.values(KEYS));
    const minor = key.id.endsWith("m");
    const tonicMidi = midiForPitch({ name: key.tonic + (key.id === "C" ? "5" : "4"), letter: key.tonic }, key);
    const plan = generator.generateAdvancedHigherPlan({
      seed: `${Date.now()}-${Math.random()}`,
      cadenceId: "perfect", timeSignatureId: timeSignature.id, allowRests: true
    });
    const accompanimentStyle = MLH.AuralAccompaniment.chooseStyle();
    const bars = plan.bars.map(plannedBar => {
      const bar = {
        ...plannedBar, totalBars: plan.bars.length, timeSignature,
        notes: plannedBar.notes.map((note, noteIndex) => ({
          ...note, id: `${plannedBar.barIndex}-${noteIndex}`, barIndex: plannedBar.barIndex, noteIndex,
          midi: note.rest ? 0 : practiceScaleMidi(generator, note.relativeStep, tonicMidi, minor)
        }))
      };
      bar.accompaniment = practiceAccompanimentForBar(generator, bar, key, timeSignature, accompanimentStyle, bar.barIndex === plan.bars.length - 1, subdivisions);
      return bar;
    });
    return {
      id: Math.random().toString(36).slice(2), key, timeSignature, bars,
      barCount: bars.length, totalBeats: bars.length * timeSignature.beats,
      generationLevel: "AH", melodyGenerationStyle: "advancedHigher", melodyPlan: plan,
      accompanimentStyle
    };
  }
  function ListeningScore({
    question,
    activeNoteId = null
  }) {
    const barsPerSystem = barsPerSystemForQuestion(question);
    const systemCount = Math.ceil(question.bars.length / barsPerSystem);
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 920 340",
      className: "h-auto w-full select-none overflow-visible",
      "aria-label": "Listening exercise without a time signature"
    }, SYSTEM_TOPS.slice(0, systemCount).map((systemTop, systemIndex) => {
      const systemStartX = systemIndex === 0 ? FIRST_SYSTEM_MUSIC_START_X : OTHER_SYSTEM_MUSIC_START_X;
      const barWidth = (STAFF_RIGHT - systemStartX) / barsPerSystem;
      const barsOnSystem = Math.min(barsPerSystem, question.bars.length - systemIndex * barsPerSystem);
      return /*#__PURE__*/React.createElement("g", {
        key: systemIndex
      }, /*#__PURE__*/React.createElement(StaffLines, {
        systemTop: systemTop
      }), /*#__PURE__*/React.createElement(TrebleClef, {
        systemTop: systemTop
      }), /*#__PURE__*/React.createElement(KeySignature, {
        keySignature: question.key,
        systemTop: systemTop
      }), Array.from({
        length: barsOnSystem
      }, (_, localBarIndex) => {
        const globalBarIndex = systemIndex * barsPerSystem + localBarIndex;
        return /*#__PURE__*/React.createElement(Bar, {
          key: globalBarIndex,
          bar: question.bars[globalBarIndex],
          barIndex: globalBarIndex,
          systemTop: systemTop,
          startX: systemStartX + localBarIndex * barWidth,
          endX: systemStartX + (localBarIndex + 1) * barWidth,
          isFinalBar: globalBarIndex === question.bars.length - 1,
          activeNoteId: activeNoteId
        });
      }));
    }));
  }
  MLH.TimeSignaturesListening = {
    levels: LEVELS,
    timeSignatures: TIME_SIGNATURES,
    signaturesForLevel,
    pulseCount,
    buildListeningMelody,
    buildAdvancedHigherListeningMelody,
    ListeningScore
  };
})(window.MLH || (window.MLH = {}));
