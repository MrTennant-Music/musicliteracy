(function () {
  const NOTES = [
    { name: "A3", letter: "A", octave: 3, step: -4 }, { name: "B3", letter: "B", octave: 3, step: -3 },
    { name: "C4", letter: "C", octave: 4, step: -2 }, { name: "D4", letter: "D", octave: 4, step: -1 },
    { name: "E4", letter: "E", octave: 4, step: 0 }, { name: "F4", letter: "F", octave: 4, step: 1 },
    { name: "G4", letter: "G", octave: 4, step: 2 }, { name: "A4", letter: "A", octave: 4, step: 3 },
    { name: "B4", letter: "B", octave: 4, step: 4 }, { name: "C5", letter: "C", octave: 5, step: 5 },
    { name: "D5", letter: "D", octave: 5, step: 6 }, { name: "E5", letter: "E", octave: 5, step: 7 },
    { name: "F5", letter: "F", octave: 5, step: 8 }, { name: "G5", letter: "G", octave: 5, step: 9 },
    { name: "A5", letter: "A", octave: 5, step: 10 }, { name: "B5", letter: "B", octave: 5, step: 11 },
    { name: "C6", letter: "C", octave: 6, step: 12 },
  ];
  const INTERVALS = [{ size: 2, label: "2nd" }, { size: 3, label: "3rd" }, { size: 4, label: "4th" }, { size: 5, label: "5th" }, { size: 6, label: "6th" }, { size: 7, label: "7th" }, { size: 8, label: "Octave" }];
  const LEVEL_INTERVALS = { N5: [2, 8], H: [2, 3, 4, 5, 6, 7, 8], AH: [2, 3, 4, 5, 6, 7, 8, "tritone", "augmented-4th", "diminished-5th"] };
  const KEY_SIGNATURES = { C: { label: "C major", accidentals: [] }, G: { label: "G major", accidentals: [{ type: "sharp", step: 8, letter: "F" }] }, F: { label: "F major", accidentals: [{ type: "flat", step: 4, letter: "B" }] }, D: { label: "D major", accidentals: [{ type: "sharp", step: 8, letter: "F" }, { type: "sharp", step: 5, letter: "C" }] }, Bb: { label: "B flat major", accidentals: [{ type: "flat", step: 4, letter: "B" }, { type: "flat", step: 7, letter: "E" }] } };
  const CHROMATIC_INTERVALS = [{ id: "tritone-f-b", startIndex: 5, endIndex: 8, key: "C" }, { id: "augmented-4th-c-fsharp", startIndex: 2, endIndex: 5, key: "C", targetAccidental: "sharp" }, { id: "augmented-4th-g-csharp", startIndex: 6, endIndex: 9, key: "D" }, { id: "diminished-5th-b-f", startIndex: 8, endIndex: 12, key: "C" }, { id: "diminished-5th-e-bflat", startIndex: 4, endIndex: 8, key: "F" }, { id: "diminished-5th-a-eflat", startIndex: 7, endIndex: 11, key: "Bb" }];
  const CHROMATIC_INTERVAL_WEIGHTS = CHROMATIC_INTERVALS.flatMap((interval) => interval.id.startsWith("tritone") ? [interval, interval, null] : [interval, interval]);
  const CREATE_TRITONE_INTERVALS = CHROMATIC_INTERVALS.filter((interval) => !interval.targetAccidental);
  const NATURAL_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function randomItem(items, random) { return items[Math.floor(random() * items.length)]; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function noteByIndex(index) { return NOTES[clamp(index, 0, NOTES.length - 1)]; }
  function accidentalOffset(type) { return type === "sharp" ? 1 : type === "flat" ? -1 : 0; }
  function keySignatureAccidental(note, keySignature) { return keySignature.find((item) => item.letter === note.letter)?.type || null; }
  function writtenPitch(note, keySignature, explicitAccidental) { return note.octave * 12 + NATURAL_SEMITONES[note.letter] + accidentalOffset(explicitAccidental || keySignatureAccidental(note, keySignature)); }
  function semitoneDistance(startIndex, endIndex, keySignature = [], targetAccidental = null) { return Math.abs(writtenPitch(noteByIndex(endIndex), keySignature, targetAccidental) - writtenPitch(noteByIndex(startIndex), keySignature)); }
  function intervalLabel(size) {
    if (typeof size === "string") return ({ tritone: "Tritone", "augmented-4th": "Augmented 4th", "diminished-5th": "Diminished 5th" })[size.toLowerCase()] || size;
    return INTERVALS.find((interval) => interval.size === size)?.label || `${size}th`;
  }
  function intervalNameFromHalfSteps(startIndex, endIndex, keySignature, targetAccidental) {
    const diatonicSize = Math.abs(endIndex - startIndex) + 1;
    const halfSteps = semitoneDistance(startIndex, endIndex, keySignature, targetAccidental);
    if (halfSteps === 4 && diatonicSize === 4) return "Diminished 4th";
    if (halfSteps === 6 && diatonicSize === 4) return "Augmented 4th";
    if (halfSteps === 6 && diatonicSize === 5) return "Diminished 5th";
    if (halfSteps === 8 && diatonicSize === 5) return "Augmented 5th";
    if (halfSteps === 6) return "Tritone";
    return intervalLabel(diatonicSize);
  }
  function noteIndexesForLevel(level) {
    const range = level === "AH" ? { min: -4, max: 12 } : { min: -2, max: 10 };
    return NOTES.map((note, index) => ({ note, index })).filter(({ note }) => note.step >= range.min && note.step <= range.max).map(({ index }) => index);
  }
  function intervalsForLevel(level) { return (LEVEL_INTERVALS[level] || LEVEL_INTERVALS.N5).filter((item) => typeof item === "number").map((size) => INTERVALS.find((interval) => interval.size === size)); }
  function isPlainIntervalQuestion(startIndex, endIndex) { const label = intervalNameFromHalfSteps(startIndex, endIndex); return !label.startsWith("Augmented") && !label.startsWith("Diminished") && label !== "Tritone"; }
  function decorate(question) {
    const createLabel = intervalLabel(question.intervalSize).toLowerCase();
    const createPrompt = createLabel === "tritone" ? `Write a note a tritone ${question.direction} than the note given.` : `Create an interval ${createLabel} ${question.direction} than the note given.`;
    return { ...question, activityId: "intervals", prompt: question.type === "create" ? createPrompt : "Identify the interval.", answerText: question.answer || intervalLabel(question.intervalSize), answerData: { interval: question.answer || intervalLabel(question.intervalSize), targetIndex: question.targetIndex ?? question.endIndex }, marks: 1, metadata: { level: question.level, mode: question.type } };
  }
  function makeIdentifyQuestion(level, random) {
    if (level === "AH" && random() < 0.4) {
      const weighted = randomItem(CHROMATIC_INTERVAL_WEIGHTS, random);
      const interval = weighted || CHROMATIC_INTERVALS.find((item) => item.id.startsWith("tritone"));
      const keySignature = KEY_SIGNATURES[interval.key].accidentals;
      const halfSteps = semitoneDistance(interval.startIndex, interval.endIndex, keySignature, interval.targetAccidental);
      const answer = interval.id.startsWith("tritone") && halfSteps === 6 ? "Tritone" : intervalNameFromHalfSteps(interval.startIndex, interval.endIndex, keySignature, interval.targetAccidental);
      return decorate({ id: Math.random().toString(36).slice(2), level, type: "identify", chromatic: true, typedMode: true, startIndex: interval.startIndex, endIndex: interval.endIndex, intervalSize: answer, answer, direction: "higher", targetAccidental: interval.targetAccidental || null, keySignature });
    }
    const interval = randomItem(intervalsForLevel(level), random);
    const distance = interval.size - 1;
    const direction = random() < 0.5 ? "higher" : "lower";
    const allowed = new Set(noteIndexesForLevel(level));
    const possibleStarts = [...allowed].filter((index) => { const end = direction === "higher" ? index + distance : index - distance; return allowed.has(end) && isPlainIntervalQuestion(index, end); });
    const startIndex = randomItem(possibleStarts, random);
    const endIndex = direction === "higher" ? startIndex + distance : startIndex - distance;
    return decorate({ id: Math.random().toString(36).slice(2), level, type: "identify", typedMode: random() < 0.35, startIndex, endIndex, intervalSize: interval.size, direction, answer: interval.label });
  }
  function makeCreateQuestion(level, random) {
    if (level === "AH" && random() < 0.2) {
      const interval = randomItem(CREATE_TRITONE_INTERVALS, random);
      const lower = random() < 0.5;
      const startIndex = lower ? interval.endIndex : interval.startIndex;
      const targetIndex = lower ? interval.startIndex : interval.endIndex;
      return decorate({ id: Math.random().toString(36).slice(2), level, type: "create", chromatic: true, startIndex, targetIndex, intervalSize: "tritone", answer: "Tritone", direction: lower ? "lower" : "higher", targetAccidental: null, keySignature: KEY_SIGNATURES[interval.key].accidentals });
    }
    const valid = [], allowed = new Set(noteIndexesForLevel(level));
    intervalsForLevel(level).forEach((interval) => allowed.forEach((startIndex) => { const distance = interval.size - 1; if (allowed.has(startIndex + distance)) valid.push({ startIndex, targetIndex: startIndex + distance, intervalSize: interval.size, direction: "higher" }); if (allowed.has(startIndex - distance)) valid.push({ startIndex, targetIndex: startIndex - distance, intervalSize: interval.size, direction: "lower" }); }));
    return decorate({ id: Math.random().toString(36).slice(2), level, type: "create", ...randomItem(valid, random) });
  }
  function generateQuestion(config = {}) {
    const level = ["N5", "H", "AH"].includes(config.level) ? config.level : "N5";
    const modes = config.enabledModes && typeof config.enabledModes === "object" ? config.enabledModes : { identify: true, create: true };
    const available = level === "N5" ? ["identify"] : ["identify", "create"].filter((mode) => modes[mode]);
    const mode = config.mode === "identify" || config.mode === "create" ? config.mode : randomItem(available.length ? available : ["identify"], config.random || Math.random);
    return mode === "create" && level !== "N5" ? makeCreateQuestion(level, config.random || Math.random) : makeIdentifyQuestion(level, config.random || Math.random);
  }
  function questionSignature(question) { return JSON.stringify([question.type, question.startIndex, question.endIndex, question.targetIndex, question.intervalSize, question.targetAccidental, question.keySignature]); }
  window.MLHIntervalsWorksheet = { generateQuestion, questionSignature, noteByIndex, notes: NOTES, intervalLabel };
}());
