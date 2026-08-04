(function (root) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgElement(name, attributes = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  const removalGestureStates = new WeakMap();

  function bindRemovalGesture(target, remove) {
    const host = target.closest(".question-card, .shared-notation-panel") || target.ownerSVGElement || target;
    const state = removalGestureStates.get(host) || { lastTouchEnd: 0, lastPointerUp: null, lastRemoval: 0, pointerDown: null };
    removalGestureStates.set(host, state);
    const label = target.getAttribute("aria-label") || target.className.baseVal || "notation-answer";
    const point = event => {
      const coordinates = pointerEventCoordinates(event);
      return Number.isFinite(coordinates?.clientX) && Number.isFinite(coordinates?.clientY)
        ? { x: coordinates.clientX, y: coordinates.clientY }
        : null;
    };
    const isNearby = (left, right) => left && right && Math.hypot(left.x - right.x, left.y - right.y) <= 12;
    const removeOnce = event => {
      if (target.closest(".is-practice-checked")) {
        event?.preventDefault();
        return;
      }
      const now = Date.now();
      if (now - state.lastRemoval < 250) return;
      state.lastRemoval = now;
      event?.preventDefault();
      remove(event);
    };
    target.addEventListener("dblclick", removeOnce);
    target.addEventListener("contextmenu", removeOnce);
    target.addEventListener("pointerdown", event => {
      state.pointerDown = { label, pointerId: event.pointerId, point: point(event) };
    });
    target.addEventListener("pointerup", event => {
      if (event.pointerType === "touch") return;
      const start = state.pointerDown;
      state.pointerDown = null;
      const currentPoint = point(event);
      if (!start || start.pointerId !== event.pointerId || !isNearby(start.point, currentPoint)) return;
      const now = Date.now();
      const previous = state.lastPointerUp;
      if (previous && previous.label === label && now - previous.time <= 350 && isNearby(previous.point, currentPoint)) removeOnce(event);
      state.lastPointerUp = { label, point: currentPoint, time: now };
    });
    target.addEventListener("touchend", event => {
      const currentPoint = point(event);
      const now = Date.now();
      const previous = state.lastTouchEnd;
      if (previous && previous.label === label && now - previous.time <= 350 && isNearby(previous.point, currentPoint)) {
        state.lastTouchEnd = null;
        removeOnce(event);
        return;
      }
      state.lastTouchEnd = { label, point: currentPoint, time: now };
    }, { passive: false });
    target.addEventListener("keydown", event => {
      if (event.shiftKey && event.key === "Delete") removeOnce(event);
    });
  }

  function pointerEventCoordinates(event) {
    const touch = event?.changedTouches?.[0] || event?.touches?.[0];
    return touch ? { clientX: touch.clientX, clientY: touch.clientY } : event;
  }

  // These dimensions and rhythmic spacing values deliberately match the score
  // renderer in practicequestions.html. Keep both activities visually aligned.
  const Q3_STAFF = { left: 78, right: 842, topA: 72, gap: 11 };
  const Q3_BARS_PER_SYSTEM = 2;
  const Q3_SYSTEM_SPACING = 118;
  const N5_2015_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING + 20;
  const N5_2019_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING + 15;
  const N5_2024_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING + 15;
  const N5_2016_Q3_BARS_PER_SYSTEM = 4;
  const N5_2016_Q3_SYSTEM_SPACING = 128;
  const N5_2023_Q3_SYSTEM_SPACING = Q3_SYSTEM_SPACING + 15;
  const Q3_KEY_SIGNATURE_SPACING = 14;
  const Q3_PITCH_STEPS = { E3: -7, G3: -5, A3: -4, B3: -3, C4: -2, D4: -1, E4: 0, F4: 1, "F♯4": 1, G4: 2, A4: 3, Ab4: 3, B4: 4, Bb4: 4, C5: 5, D5: 6, E5: 7, Eb5: 7, F5: 8, "F♯5": 8, G5: 9, A5: 10, B5: 11, Bb5: 11, C6: 12 };
  const Q3_PITCH_BY_STEP = Object.fromEntries(Object.entries(Q3_PITCH_STEPS).filter(([pitch]) => !["F♯4", "F♯5", "Ab4", "Bb4", "Eb5"].includes(pitch)).map(([pitch, step]) => [step, pitch]));
  let q3RepeatArmed = false;
  let q3BarLabelArmed = false;
  let q3RhythmToolArmed = "";
  let q3AccidentalToolArmed = "";
  const Q3_RHYTHMS = {
    semiquaver: { beats: .25, spacing: .62 },
    quaver: { beats: .5, spacing: .95 },
    dottedQuaver: { beats: .75, spacing: 1.12 },
    crotchet: { beats: 1, spacing: 1.35 },
    dottedCrotchet: { beats: 1.5, spacing: 1.75 },
    minim: { beats: 2, spacing: 2.15 },
    dottedMinim: { beats: 3, spacing: 2.75 },
    semibreve: { beats: 4, spacing: 3.35 },
    semibreveRest: { beats: 4, spacing: 3.35 },
    dottedQuaverRest: { beats: .75, spacing: 1.12 },
    quaverRest: { beats: .5, spacing: .95 },
    crotchetRest: { beats: 1, spacing: 1.15 },
    dottedCrotchetRest: { beats: 1.5, spacing: 1.75 },
    minimRest: { beats: 2, spacing: 2.15 },
    dottedMinimRest: { beats: 3, spacing: 2.75 },
  };
  const Q3_REST_TOOL_VALUES = ["semibreveRest", "minimRest", "crotchetRest", "quaverRest"];
  const q3Glyph = key => root.BRAVURA_SYMBOLS?.[q3ActualSymbolKey(key)] || "";
  const q3SharedConfig = () => root.SHARED_NOTATION_CONFIG || { symbols: {}, drawing: {} };

  function note(pitch, rhythm, extras = {}) {
    return { pitch, step: Q3_PITCH_STEPS[pitch], rhythm, ...extras };
  }
  function rest(rhythm = "crotchetRest") { return { rest: true, step: 4, rhythm }; }
  function bar(notes, extras = {}) {
    let beat = 0;
    return {
      ...extras,
      notes: notes.map(item => {
        const prepared = { ...item, beat, beats: Q3_RHYTHMS[item.rhythm]?.beats || 1 };
        beat += prepared.beats;
        return prepared;
      }),
    };
  }

  const Q3_BARS = [
    bar([note("B4", "crotchet"), note("D4", "crotchet"), note("E4", "crotchet"), note("C5", "quaver"), note("B4", "semiquaver"), note("C5", "semiquaver")]),
    bar([note("B4", "minim"), note("A4", "minim")]),
    bar([note("B4", "crotchet"), note("D4", "crotchet"), note("E4", "crotchet"), note("C5", "quaver"), note("B4", "semiquaver"), note("C5", "semiquaver")], { missing: true }),
    bar([note("B4", "minim"), note("A4", "minim")]),
    bar([rest(), note("B4", "dottedQuaver"), note("C5", "semiquaver"), note("B4", "dottedCrotchet"), note("B4", "quaver")]),
    bar([note("E5", "crotchet"), note("F♯5", "crotchet"), note("G5", "minim")]),
    bar([note("D4", "semiquaver"), note("B4", "dottedQuaver", { tieToNext: true }), note("B4", "dottedMinim", { tiedFromPrevious: true })]),
    bar([note("D4", "semiquaver"), note("A4", "dottedQuaver", { tieToNext: true }), note("A4", "dottedMinim", { tiedFromPrevious: true })]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 8 }));

  // National 5 2015, Question 3: "I Dreamed a Dream". The musical
  // content is kept separate from the drawing code so each printed bar can
  // be checked directly against the source paper.
  const N5_2015_Q3_BAR_5_NOTES = [
    rest("dottedQuaverRest"), note("A4", "semiquaver"), note("A4", "dottedQuaver"), note("A4", "semiquaver"),
    note("A4", "dottedQuaver"), note("G4", "semiquaver"), note("A4", "semiquaver"), note("Bb4", "dottedQuaver"),
  ];
  const N5_2015_Q3_BAR_7_ANSWER_PITCHES = [null, null, null, null, "A4", "A4", "B4", "C5"];
  const N5_2015_Q3_BAR_7_NOTES = N5_2015_Q3_BAR_5_NOTES.map((item, index) => ({
    ...item,
    ...(N5_2015_Q3_BAR_7_ANSWER_PITCHES[index] ? { pitch: N5_2015_Q3_BAR_7_ANSWER_PITCHES[index], step: Q3_PITCH_STEPS[N5_2015_Q3_BAR_7_ANSWER_PITCHES[index]] } : {}),
    ...(index >= 6 ? { rhythm: "quaver" } : {}),
  }));
  const N5_2015_Q3_REPEATED_BAR_BEAMS = [{ start: 2, end: 3 }, { start: 4, end: 5 }, { start: 6, end: 7 }];

  const N5_2015_Q3_BARS = [
    bar([rest("dottedQuaverRest"), note("F4", "semiquaver"), note("F4", "dottedQuaver"), note("F4", "semiquaver"), note("F4", "dottedQuaver"), note("E4", "semiquaver"), note("F4", "dottedQuaver"), note("G4", "semiquaver")], { beamGroups: [{ start: 2, end: 3 }, { start: 4, end: 5 }, { start: 6, end: 7 }] }),
    bar([note("A4", "semibreve")]),
    bar([rest("dottedQuaverRest"), note("F4", "semiquaver"), note("F4", "dottedQuaver"), note("F4", "semiquaver"), note("F4", "dottedQuaver"), note("F4", "semiquaver"), note("G4", "dottedQuaver"), note("A4", "semiquaver")], { beamGroups: [{ start: 2, end: 3 }, { start: 4, end: 5 }, { start: 6, end: 7 }] }),
    bar([note("D4", "quaver"), note("F4", "dottedCrotchet", { tieToNext: true }), note("F4", "minim", { tiedFromPrevious: true })]),
    bar(N5_2015_Q3_BAR_5_NOTES, { beamGroups: N5_2015_Q3_REPEATED_BAR_BEAMS }),
    bar([note("C5", "semibreve")]),
    bar(N5_2015_Q3_BAR_7_NOTES, { missingIndices: [4, 5, 6, 7], beamGroups: N5_2015_Q3_REPEATED_BAR_BEAMS }),
    bar([note("D4", "quaver"), note("F4", "dottedCrotchet", { tieToNext: true }), note("F4", "minim", { tiedFromPrevious: true })]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 8 }));

  const N5_2015_Q3_LYRICS = [
    [null, "I", "dreamed", "a", "dream", "in", "time", "gone"],
    ["by"],
    [null, "When", "hope", "was", "high", "and", "life", "worth"],
    ["li-", "ving.", null],
    [null, "I", "dreamed", "that", "love", "would", "ne-", "ver"],
    ["die,"],
    [null, "I", "dreamed", "that", "God", "would", "be", "for-"],
    ["giv-", "ing.", null],
  ];

  // Higher 2015, Question 4. This is the same structured notation model used
  // by the National 5 scores above: pitch, rhythm, beaming, ties, lyrics and
  // editable elements are recorded separately from the SVG renderer.
  const HIGHER_2015_Q4_BARS = [
    bar([note("E4", "minim"), note("G4", "minim")]),
    bar([note("C5", "dottedMinim"), rest("quaverRest"), note("C5", "quaver")]),
    bar([note("E5", "crotchet"), note("F5", "quaver"), note("E5", "quaver", { tieToNext: true }), note("E5", "quaver", { tiedFromPrevious: true }), note("D5", "dottedCrotchet")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C5", "dottedMinim"), rest("quaverRest"), note("G4", "quaver")]),
    bar([note("Ab4", "crotchet", { accidental: "flat" }), note("G4", "quaver"), note("D5", "quaver", { tieToNext: true }), note("D5", "quaver", { tiedFromPrevious: true }), note("D5", "dottedCrotchet")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C5", "crotchet"), note("G4", "minim"), rest("quaverRest"), note("F♯4", "quaver", { accidental: "sharp" })]),
    bar([note("F♯4", "dottedCrotchet", { accidental: "sharp" }), note("D5", "quaver", { tieToNext: true }), note("D5", "dottedCrotchet", { tiedFromPrevious: true }), note("E4", "quaver")]),
    bar([note("F4", "minim"), note("D5", "crotchet"), note("C5", "quaver"), note("C5", "quaver", { tieToNext: true })], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("C5", "dottedMinim", { tiedFromPrevious: true }), rest("crotchetRest")]),
    bar([note("A4", "minim"), note("C5", "minim")]),
    bar([note("Ab4", "dottedMinim"), rest("quaverRest"), note("Ab4", "quaver")], { missingAccidentalIndex: 0 }),
    bar([note("C5", "minim"), note("B4", "dottedCrotchet"), note("G4", "quaver")]),
    bar([note("E5", "dottedCrotchet"), note("G4", "quaver"), note("G4", "dottedCrotchet"), note("G4", "quaver")]),
    bar([note("E5", "dottedCrotchet"), note("A4", "quaver"), note("A4", "minim")], { missingIndices: [0, 1, 2] }),
    bar([note("E5", "crotchet"), note("B4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("D5", "dottedCrotchet")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("D5", "quaver"), note("C5", "semiquaver"), note("B4", "semiquaver"), note("C5", "crotchet"), rest("quaverRest"), note("C5", "quaver"), note("D5", "quaver"), note("E5", "quaver")], { beamGroups: [{ start: 0, end: 2 }, { start: 6, end: 7 }] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  const HIGHER_2015_Q4_LYRICS = [
    ["En-", "gines"],
    ["roar", null, "and"],
    ["save", "our", "crops__", null, "from"],
    ["trials,", null, "but"],
    ["when", "the", "black__", null, "gold's"],
    ["in", "doubt,", null, "there's"],
    ["none", "left__", null, "for"],
    ["you", "or", "for", "me."],
    ["__", null],
    ["Fuse", "helium"],
    ["three", null, "our"],
    ["last", "hope", "and"],
    ["free__", null, "me,", "and"],
    ["free__", null, "me,"],
    ["free", "me", null, "from", "this"],
    ["world__", null, null, null, null, "We", "don't", "be-"],
  ];

  const HIGHER_2015_Q4_LYRIC_OFFSETS = {
    2: { 2: 6 },
    4: { 2: 6 },
    15: { 0: 10, 6: 3, 7: 6 },
  };

  const HIGHER_2015_Q4_LINE_5 = [
    note("F5", "dottedCrotchet"), note("A4", "quaver"), note("A4", "dottedCrotchet"), note("A4", "quaver"),
    note("B4", "quaver"), note("B4", "quaver"), note("B4", "quaver"), note("C5", "quaver", { tieToNext: true }),
    note("C5", "quaver", { tiedFromPrevious: true }), note("D5", "crotchet"), note("E5", "quaver", { tieToNext: true }),
    note("E5", "crotchet", { tiedFromPrevious: true }), note("F5", "quaver"), note("E5", "quaver", { tieToNext: true }),
    note("E5", "quaver", { tiedFromPrevious: true }), note("D5", "dottedCrotchet"), note("D5", "quaver"), note("C5", "quaver"),
    rest("crotchetRest"), note("D5", "crotchet"), note("E5", "crotchet"),
  ];

  const HIGHER_2015_Q4_LINE_5_LYRICS = [
    "long__", null, "here,", "it", "was", "a", "mis-", "take", null, null, "im-", "pri-", null, "son-", "ing", "our", "souls.", null, null, "Can", "you",
  ];
  // The source beams the four quavers beginning with "was", then the pair
  // leading into "son-" and the pair before "souls". Every other quaver
  // keeps its own tail.
  const HIGHER_2015_Q4_LINE_5_BEAM_GROUPS = [
    { start: 4, end: 7 },
    { start: 12, end: 13 },
    { start: 16, end: 17 },
  ];
  const HIGHER_2015_Q4_LINE_5_SLURS = [{ start: 16, end: 17 }];
  const HIGHER_2015_Q4_ACCIDENTAL_NOTE_INDICES = [0, 2];

  const HIGHER_2015_Q4_FINAL_LINE = [
    note("F5", "dottedCrotchet"), note("A4", "quaver"), note("A4", "dottedCrotchet"), note("A4", "quaver"),
    note("F5", "crotchet"), note("B4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }),
    note("C5", "crotchet"), note("C5", "quaver", { tieToNext: true }), note("C5", "minim", { tiedFromPrevious: true }), rest("minimRest"),
  ];
  const HIGHER_2015_Q4_FINAL_LINE_BEAM_GROUPS = [{ start: 5, end: 6 }];

  // Higher 2016, Question 4: the traditional melody printed in F major.
  // The pickup and all sixteen numbered bars are recorded independently from
  // the renderer so the source transcription can be regression-tested.
  const HIGHER_2016_Q4_PICKUP = [note("E4", "quaver"), note("F4", "quaver"), note("G4", "quaver")];
  const HIGHER_2016_Q4_BARS = [
    bar([note("A4", "dottedCrotchet"), note("G4", "quaver"), note("A4", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("G4", "quaver"), note("F4", "quaver"), note("D4", "crotchet", { tieToNext: true }), note("D4", "quaver", { tiedFromPrevious: true }), note("F4", "quaver"), note("A4", "quaver"), note("B4", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 6 }] }),
    bar([note("C5", "dottedCrotchet"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver"), note("F4", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("G4", "minim", { tieToNext: true }), note("G4", "quaver", { tiedFromPrevious: true }), note("E4", "quaver"), note("F4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("A4", "crotchet"), note("G4", "crotchet"), note("A4", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver")], { rhythmCorrectionIndices: [0, 1], beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("G4", "quaver"), note("F4", "quaver"), note("D4", "crotchet", { tieToNext: true }), note("D4", "quaver", { tiedFromPrevious: true }), note("E4", "quaver"), note("F4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 6 }] }),
    bar([note("A4", "dottedCrotchet"), note("B4", "quaver"), note("A4", "quaver"), note("G4", "quaver"), note("F4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("F4", "minim", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("D5", "quaver"), note("E5", "quaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("F5", "dottedCrotchet"), note("E5", "quaver"), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("D5", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("C5", "quaver"), note("A4", "quaver"), note("F4", "crotchet", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("D5", "quaver"), note("E5", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 6 }] }),
    bar([note("F5", "dottedCrotchet"), note("E5", "quaver"), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("G4", "minim", { tieToNext: true }), note("G4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("C5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("A5", "dottedCrotchet"), note("G5", "quaver"), note("G5", "quaver"), note("F5", "quaver"), note("D5", "quaver"), note("F5", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("C5", "quaver"), note("A4", "quaver"), note("F4", "crotchet", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("E4", "quaver"), note("F4", "quaver"), note("G4", "quaver")], { missingIndices: [4, 5, 6], beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 6 }] }),
    bar([note("A4", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver"), note("G4", "quaver"), note("F4", "quaver"), note("D4", "quaver"), note("E4", "quaver")], { beamGroups: [{ start: 0, end: 3 }, { start: 4, end: 7 }], transposeIndices: [4, 5, 6, 7] }),
    bar([note("F4", "minim", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), rest("quaverRest")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  const HIGHER_2016_Q4_TRANSPOSE = [
    note("G3", "quaver"), note("F3", "quaver"), note("D3", "quaver"), note("E3", "quaver"),
    note("F3", "minim", { tieToNext: true }), note("F3", "quaver", { tiedFromPrevious: true }),
  ];
  const HIGHER_2016_Q4_TRANSPOSE_SOURCE = [
    ...HIGHER_2016_Q4_BARS[14].transposeIndices.map(index => HIGHER_2016_Q4_BARS[14].notes[index]),
    HIGHER_2016_Q4_BARS[15].notes[0],
    HIGHER_2016_Q4_BARS[15].notes[1],
  ];

  // Higher 2017, Question 4: the 23-bar rock melody printed in G major.
  // The score is kept as an explicit bar inventory so pitch, rhythm, ties,
  // slurs and editable notes remain independent from the SVG renderer.
  const HIGHER_2017_Q4_BARS = [
    bar([note("A4", "dottedCrotchet"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("B4", "dottedCrotchet")], { beamGroups: [] }),
    bar([note("A4", "crotchet"), note("B4", "quaver"), note("B4", "quaver"), note("B4", "crotchet"), rest()], { beamGroups: [{ start: 1, end: 2 }], slurs: [{ start: 2, end: 3 }] }),
    bar([note("A4", "crotchet"), note("B4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("G4", "crotchet"), note("E5", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("E5", "quaver", { tiedFromPreviousBar: true }), note("D5", "crotchet"), note("B4", "semiquaver"), note("A4", "semiquaver"), note("G4", "crotchet"), rest()], { beamGroups: [{ start: 2, end: 3 }], slurs: [{ start: 2, end: 4 }] }),
    bar([note("D5", "crotchet"), note("G4", "quaver"), note("G4", "quaver"), note("G4", "crotchet"), rest()], { beamGroups: [{ start: 1, end: 2 }], slurs: [{ start: 2, end: 3 }], valueIndices: [2, 3] }),
    bar([note("D5", "crotchet"), note("C5", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "quaver", { tiedFromPrevious: true }), note("A4", "crotchet"), note("B4", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("B4", "crotchet", { tiedFromPreviousBar: true }), rest(), rest("minimRest")]),
    bar([rest("semibreveRest")]),
    bar([note("A4", "dottedCrotchet"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("B4", "dottedCrotchet")], { beamGroups: [] }),
    bar([note("A4", "crotchet"), note("B4", "quaver"), note("B4", "quaver"), note("B4", "crotchet"), rest()], { beamGroups: [{ start: 1, end: 2 }], slurs: [{ start: 2, end: 3 }] }),
    bar([note("C5", "crotchet"), note("B4", "crotchet"), note("G4", "quaver"), note("A4", "crotchet"), note("B4", "quaver", { tieToNextBar: true })], { missingIndices: [0, 1, 2] }),
    bar([note("B4", "crotchet", { tiedFromPreviousBar: true }), rest(), rest("minimRest")]),
    bar([note("A4", "dottedCrotchet"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("B4", "dottedCrotchet")], { beamGroups: [] }),
    bar([note("B4", "crotchet"), note("F♯4", "quaver"), note("F♯4", "quaver", { tieToNext: true }), note("F♯4", "crotchet", { tiedFromPrevious: true }), rest("quaverRest"), note("D4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("B4", "crotchet"), note("A4", "crotchet"), note("G4", "quaver"), note("G4", "quaver"), note("A4", "quaver"), note("A4", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 2, end: 5 }], slurs: [{ start: 3, end: 4 }] }),
    bar([note("A4", "crotchet", { tiedFromPreviousBar: true }), rest(), rest("minimRest")]),
    bar([note("A4", "dottedCrotchet"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("B4", "crotchet"), note("B4", "quaver")], { beamGroups: [] }),
    bar([note("A4", "quaver"), note("B4", "crotchet"), note("B4", "quaver", { tieToNext: true }), note("B4", "crotchet", { tiedFromPrevious: true }), rest("quaverRest"), note("E4", "quaver")], { slurs: [{ start: 0, end: 1 }] }),
    bar([note("A4", "crotchet"), note("B4", "quaver"), note("B4", "quaver"), note("B4", "quaver"), note("G4", "crotchet"), note("E5", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }], slurs: [{ start: 2, end: 3 }] }),
    bar([note("E5", "quaver", { tiedFromPreviousBar: true }), note("D5", "crotchet"), note("B4", "semiquaver"), note("A4", "semiquaver"), note("G4", "crotchet"), rest()], { beamGroups: [{ start: 2, end: 3 }], slurs: [{ start: 2, end: 4 }] }),
    bar([note("D5", "crotchet"), note("G4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "crotchet", { tiedFromPrevious: true }), rest()], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("D5", "crotchet"), note("C5", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "quaver", { tiedFromPrevious: true }), note("A4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }], transposeIndices: [1, 2, 3, 4] }),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("G4", "crotchet"), rest("quaverRest"), rest("minimRest")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 23 }));

  const HIGHER_2017_Q4_TRANSPOSE = [
    note("C4", "quaver"), note("G3", "quaver", { tieToNext: true }), note("G3", "quaver", { tiedFromPrevious: true }), note("A3", "crotchet"),
  ];

  // Source-aligned engraving geometry for the seven systems on page 7. The
  // unequal bar widths and fixed answer boxes follow the official score rather
  // than stretching every bar evenly across its system.
  const HIGHER_2017_Q4_SCORE_LAYOUT = {
    viewBoxHeight: 1280,
    systems: [124, 294, 449, 604, 775, 928, 1088],
    staffLeft: 15,
    musicStart: 90,
    musicEnd: 915,
    barEnds: [
      [279, 480, 710, 915],
      [374, 683, 915],
      [234, 449, 684, 915],
      [333, 603, 915],
      [318, 485, 685, 915],
      [295, 657, 915],
      [525, 915],
    ],
    boxes: {
      time: { x: 55, y: 18, width: 172, height: 44 },
      interval: { x: 625, y: 18, width: 85, height: 167 },
      value: { x: 198, y: 216, width: 102, height: 137 },
      notes: { x: 691, y: 384, width: 136, height: 121 },
      chords: { x: 7, y: 692, width: 536, height: 143 },
      transpose: { x: 170, y: 1024, width: 262, height: 244 },
    },
    bassTop: 1205,
    bassRight: 450,
  };

  const HIGHER_2017_Q4_LYRICS = [
    ["Ring", "out__", null, "the"],
    ["bells", "a-", "gain__", null, null],
    ["like", "we", "did_", null, "when", "spring__"],
    ["be-", "gan__", null, null],
    ["Wake", "me", "up__", null, null],
    ["when", "Sep-", "tem-", null, "ber", "ends__."],
    [null, null, null, null],
    [null],
    ["Here", "comes", null, "the"],
    ["rain", "a-", "gain__", null, null],
    ["fall-", "ing", "from", "the", "stars"],
    ["__.", null, null],
    ["Drenched", "in__", null, "my"],
    ["pain", "a-", "gain__,", null, null, "be-"],
    ["com-", "ing", "who", "we__", null, "are__."],
    [null],
    ["As", "my__", null, "mem-", "o-"],
    ["ry__", null, "rests,", null, null, "but"],
    ["nev-", "er", "for-", null, "gets", "what__"],
    [null, null, null, "I", "lost____.", null],
    ["Wake", "me", "up__", null, null],
    ["when", "Sep-", "tem-", null, "ber", "ends______"],
    [null, null, null, null],
  ];

  const HIGHER_2017_Q4_LYRIC_OFFSETS = {
    1: [0, -4, 3, 0, 0],
    2: [0, -8, -8, 0, -8, 18],
    3: [30, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 15],
    12: [0, 10, 0, 0],
    10: [-5, -5, -10, 2, 10],
    14: [0, -10, 10, 22, 0, 8],
    15: [20, 0, 0],
    18: [0, -8, 10, 0, 2, 0],
    19: [0, 0, 0, 0, 15, 0],
    21: [0, -8, 8, 0, 0, 15],
  };

  const HIGHER_2017_Q4_LYRIC_POSITION_INDICES = {
    0: [0, 1, null, 3],
    3: [0, 2, null, null],
    5: [0, 1, 2, null, 4, 5],
    18: [0, 1, 2, null, 4, 5],
    19: [null, null, null, 1, 2, null],
    21: [0, 1, 2, null, 4, 5],
  };

  // Higher 2018, Question 3: the nine printed guide lines from "Apache".
  // The source uses unnumbered exercise lines rather than one continuous
  // melody, so each line is inventoried independently from the renderer.
  const HIGHER_2018_Q3_FIGURE_BEAM_GROUPS = [
    { start: 0, end: 2 }, { start: 3, end: 5 },
    { start: 6, end: 8 }, { start: 9, end: 11 },
  ];

  const HIGHER_2018_Q3_LINES = {
    line1: Array.from({ length: 16 }, () => note("B4", "quaver")),
    line2: [
      rest(), note("A4", "quaver"), note("C5", "quaver"), note("D5", "quaver"), note("Eb5", "quaver", { accidental: "flat" }), note("D5", "crotchet", { tieToNext: true }),
      note("D5", "crotchet", { tiedFromPrevious: true }), note("A4", "quaver"), note("C5", "quaver"), note("A5", "quaver"), note("G5", "quaver"), note("E5", "crotchet", { tieToNext: true }),
      note("E5", "crotchet", { tiedFromPrevious: true }), note("A4", "quaver"), note("C5", "quaver"), note("D5", "quaver"), note("Eb5", "quaver", { accidental: "flat" }), note("D5", "crotchet", { tieToNext: true }), note("D5", "crotchet", { tiedFromPrevious: true }),
      note("A4", "semiquaver"), note("C5", "dottedQuaver"), note("A5", "quaver"), note("G5", "quaver"), note("E5", "quaver"), note("E4", "quaver"),
    ],
    line3: [
      bar([note("A4", "minim"), note("E4", "crotchet"), note("A4", "crotchet")]),
      bar([note("F♯4", "minim", { accidental: "sharp" }), note("E4", "crotchet"), note("D4", "crotchet")]),
      bar([note("E4", "semibreve", { tieToNextBar: true })]),
      bar([note("E4", "minim", { tiedFromPreviousBar: true }), rest(), note("E4", "crotchet")]),
      bar([note("A4", "minim"), note("E4", "crotchet"), note("A4", "crotchet")]),
    ],
    line4: [
      bar([note("F♯4", "minim", { accidental: "sharp" }), note("E4", "crotchet"), note("D4", "crotchet")]),
      bar([note("E4", "semibreve", { tieToNextBar: true })]),
      bar([note("E4", "minim", { tiedFromPreviousBar: true }), rest(), note("A4", "crotchet")]),
      bar([note("D5", "minim"), note("A4", "crotchet"), note("D5", "crotchet")]),
      bar([note("B4", "minim"), note("A4", "crotchet"), note("G4", "crotchet")], { missingIndices: [0, 1, 2] }),
    ],
    line5: [
      bar([note("A4", "semibreve", { tieToNextBar: true })]),
      bar([note("A4", "minim", { tiedFromPreviousBar: true }), rest(), note("E4", "crotchet")]),
      bar([note("A4", "minim"), note("E4", "crotchet"), note("A4", "crotchet")], { intervalIndices: [0, 1] }),
      bar([note("F♯4", "minim", { accidental: "sharp" }), note("E4", "minim")]),
      bar([note("E4", "semibreve", { tieToNextBar: true })]),
      bar([note("E4", "semibreve", { tiedFromPreviousBar: true })]),
    ],
    line6: [
      bar([note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver")], { beamGroups: HIGHER_2018_Q3_FIGURE_BEAM_GROUPS }),
      bar([note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver")], { beamGroups: HIGHER_2018_Q3_FIGURE_BEAM_GROUPS }),
      bar([note("E4", "minim"), note("A3", "minim", { tieToNextBar: true })]),
      bar([note("A3", "semibreve", { tiedFromPreviousBar: true })]),
    ],
    line7: [
      bar([note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver")], { beamGroups: HIGHER_2018_Q3_FIGURE_BEAM_GROUPS }),
      bar([note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("C4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver"), note("F4", "quaver"), note("F4", "semiquaver"), note("F4", "semiquaver")], { beamGroups: HIGHER_2018_Q3_FIGURE_BEAM_GROUPS }),
      bar([note("E4", "semibreve", { tieToNextBar: true })]),
      bar([note("E4", "semibreve", { tiedFromPreviousBar: true })]),
    ],
    line8: [
      bar([rest(), note("F4", "crotchet"), note("A4", "crotchet"), note("C5", "crotchet")]),
      bar([note("B4", "minim"), note("C5", "crotchet"), note("D5", "crotchet")]),
      bar([note("E5", "crotchet"), note("D5", "crotchet"), note("C5", "crotchet"), note("A4", "minim", { tieToNextBar: true })], { rhythmCorrectionIndices: [0, 1, 2], printedBeatException: 5 }),
    ],
    line9: [
      bar([note("A4", "semibreve", { tiedFromPreviousBar: true })], { givenChord: ["Am", "VI"] }),
      bar([rest(), note("F4", "crotchet"), note("A4", "crotchet"), note("C5", "crotchet")], { chordAnswer: "F" }),
      bar([note("B4", "minim"), note("C5", "crotchet"), note("D5", "crotchet")], { chordAnswer: "G" }),
      bar([note("G4", "dottedCrotchet")], { closingFragment: true }),
    ],
    transpose: [
      { pitch: "A3", step: 8, rhythm: "minim" }, { pitch: "E3", step: 5, rhythm: "crotchet" },
      { pitch: "A3", step: 8, rhythm: "crotchet" }, { pitch: "F♯3", step: 6, rhythm: "minim", accidental: "sharp" },
    ],
  };

  // The initial rest is not counted in these IDs. The source prints a third
  // barline between the final tied D crotchets; only the other two barlines
  // are answer targets.
  const HIGHER_2018_Q3_LINE2_BEAM_GROUPS = [
    { start: 1, end: 2 }, { start: 3, end: 4 },
    { start: 7, end: 8 }, { start: 9, end: 10 },
    { start: 13, end: 14 }, { start: 15, end: 16 },
    { start: 19, end: 20 }, { start: 21, end: 24 },
  ];

  const HIGHER_2018_Q3_LINE2_MISSING_BARLINE_IDS = ["line2-gap-5", "line2-gap-11"];
  const HIGHER_2018_Q3_LINE2_PRINTED_BARLINE_IDS = ["line2-gap-17"];

  const HIGHER_2018_Q3_LINE2_ACCIACCATURAS = [
    { mainNoteIndex: 9, gracePitch: "G5", symbol: "slashedGraceNoteStemUp" },
    { mainNoteIndex: 21, gracePitch: "G5", symbol: "slashedGraceNoteStemUp" },
  ];

  // Source-aligned geometry measured from page 7 of the official question
  // paper. Keeping it separate from the renderer makes later audits explicit.
  const HIGHER_2018_Q3_SCORE_LAYOUT = {
    viewBox: [0, 0, 920, 1290],
    staffLeft: 65,
    staffRight: 915,
    musicStart: 90,
    line1MusicStart: 125,
    noteOffsetX: 10,
    drumNoteOffsetX: 3,
    drumNoteYOffset: -1,
    drumCircleOffsetX: 1,
    drumCircleOffsetY: -1,
    drumLabelYOffset: -26,
    timeSignatureXOffset: -5,
    line9Right: 670,
    tops: { line1: 55, line2: 182, line3: 321, line4: 512, line5: 654, line6: 781, line7: 908, line8: 1034, line9: 1200 },
    barEnds: {
      line3: [277, 453, 568, 741, 915],
      line4: [279, 394, 568, 741, 915],
      line5: [210, 369, 553, 702, 808, 915],
      line6: [405, 705, 810, 915],
      line7: [405, 705, 810, 915],
      line8: [379, 633, 915],
    },
    denseBarNoteEndPadding: { line6: [12, 12], line7: [12, 12] },
    boxes: {
      barlines: { x: 69, y: 131, width: 615, height: 121 },
      transpose: { x: 69, y: 271, width: 292, height: 209 },
      notes: { x: 747, y: 430, width: 162, height: 149 },
      interval: { x: 381, y: 581, width: 121, height: 138 },
      rhythm: { x: 639, y: 980, width: 270, height: 122 },
      chords: { x: 226, y: 1117, width: 324, height: 149 },
    },
    bassStaff: { left: 65, right: 344, top: 409, barlineX: 277 },
    transposeAlignment: "line3-first-four-notes",
    givenChordBox: { x: 111, y: 1106, width: 37, rowHeight: 37 },
    chordAnswerBoxes: [
      { x: 238, y: 1146, width: 38, height: 42 },
      { x: 412, y: 1146, width: 38, height: 42 },
    ],
  };

  // Source-measured engraving geometry for Higher 2019 Question 3, page 7.
  // The official score uses unequal bar widths and a shorter final system;
  // preserving those measurements also keeps the lyric underlay and answer
  // boxes aligned with the printed paper.
  const HIGHER_2019_Q3_SCORE_LAYOUT = {
    viewBoxHeight: 1450,
    systems: [105, 260, 480, 680, 850, 1025, 1205],
    staffLeft: 15,
    musicStart: 90,
    musicEnd: 915,
    barEnds: [
      [267, 445, 615, 915],
      [240, 483, 655, 915],
      [296, 515, 655, 915],
      [266, 447, 626, 915],
      [335, 483, 770, 915],
      [380, 645, 915],
      [447, 655],
    ],
    boxes: {
      time: { x: 24, y: 15, width: 190, height: 50 },
      interval: { x: 270, y: 15, width: 330, height: 180 },
      chords: { x: 296, y: 384, width: 355, height: 185 },
      notes: { x: 263, y: 584, width: 345, height: 180 },
      rest: { x: 82, y: 949, width: 290, height: 160 },
      transpose: { x: 82, y: 1135, width: 350, height: 298 },
    },
    givenChordBox: { x: 97, y: 387, width: 48, rowHeight: 39 },
    chordAnswerBoxes: [
      { x: 312, y: 421, width: 40, height: 42 },
      { x: 534, y: 421, width: 40, height: 42 },
    ],
    bassStaff: { left: 15, right: 447, top: 1362, barlineX: 447 },
    timeSignatureX: 123,
  };

  const HIGHER_2019_Q3_LYRICS = [
    ["Shall"], ["I"], ["stay?__________"], [null, null, "Would", "it"],
    ["be____________"], [null, "a______"], ["sin"], [],
    ["if", "I_______"], [null, "can't___"], ["help"], ["fall -", "ing__", null, "in"],
    ["love"], ["with"], ["you?"], [],
    ["Like", "a___", null, "riv -", "er"], ["flows"], ["sure -", "ly___", null, "to", "the"], ["sea,"],
    [null, "dar", "-", "ling", "so"], ["it", "goes____"], ["some-", "things___"],
    [null, "are___", null, "meant", "to"], ["be."],
  ];
  const HIGHER_2019_Q3_LYRIC_TEXT_ANCHORS = {
    2: { 0: "start" },
    4: { 0: "start" },
    5: { 1: "start" },
    8: { 1: "start" },
    9: { 1: "start" },
  };

  // Higher 2019, Question 3: the 25-bar melody printed in F major and 6/8.
  // The lyric underlay follows the user-supplied source reference so the
  // horizontal spacing can be compared directly with the printed paper.
  const HIGHER_2019_Q3_BARS = [
    bar([note("F4", "dottedMinim")]),
    bar([note("C5", "dottedMinim")], { intervalIndex: 0 }),
    bar([note("F4", "dottedMinim", { tieToNextBar: true })], { intervalIndex: 0 }),
    bar([note("F4", "dottedCrotchet", { tiedFromPreviousBar: true }), rest("quaverRest"), note("G4", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("Bb4", "dottedMinim", { tieToNextBar: true })]),
    bar([note("Bb4", "quaver", { tiedFromPreviousBar: true }), note("A4", "crotchet", { tieToNext: true }), note("A4", "dottedCrotchet", { tiedFromPrevious: true })]),
    bar([note("G4", "dottedMinim")]),
    bar([rest("semibreveRest")], { fullBarRest: true }),
    bar([note("D4", "quaver"), note("D4", "crotchet", { tieToNext: true }), note("D4", "dottedCrotchet", { tiedFromPrevious: true, tieToNextBar: true })], { givenChord: ["B♭", "IV"] }),
    bar([note("D4", "quaver", { tiedFromPreviousBar: true }), note("E4", "crotchet", { tieToNext: true }), note("E4", "dottedCrotchet", { tiedFromPrevious: true })], { chordAnswer: "C" }),
    bar([note("F4", "dottedMinim")], { chordAnswer: "Dm" }),
    bar([note("G4", "crotchet"), note("A4", "quaver", { tieToNext: true }), note("A4", "quaver", { tiedFromPrevious: true }), note("Bb4", "crotchet")], { beamGroups: [] }),
    bar([note("A4", "dottedMinim")]),
    bar([note("G4", "dottedMinim")], { missingIndices: [0] }),
    bar([note("F4", "dottedMinim")], { missingIndices: [0] }),
    bar([rest("semibreveRest")], { fullBarRest: true }),
    bar([note("E4", "crotchet"), note("A4", "quaver", { tieToNext: true }), note("A4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("E5", "quaver")], { beamGroups: [{ start: 2, end: 4 }] }),
    bar([note("D5", "dottedMinim")]),
    bar([note("E4", "crotchet"), note("A4", "quaver", { tieToNext: true }), note("A4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("E5", "quaver")], { beamGroups: [{ start: 2, end: 4 }] }),
    bar([note("D5", "dottedMinim")]),
    bar([rest("quaverRest"), note("F5", "crotchet", { tieToNext: true }), note("F5", "quaver", { tiedFromPrevious: true }), note("E5", "quaver"), note("D5", "quaver")], { missingIndices: [0], missingRestIndex: 0, beamGroups: [{ start: 2, end: 4 }] }),
    bar([note("C5", "quaver"), note("D5", "crotchet", { tieToNext: true }), note("D5", "dottedCrotchet", { tiedFromPrevious: true })]),
    bar([note("C5", "quaver"), note("C5", "crotchet", { tieToNext: true }), note("C5", "dottedCrotchet", { tiedFromPrevious: true })]),
    bar([rest("crotchetRest"), note("A4", "quaver", { tieToNext: true }), note("A4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("A4", "quaver")], { transposeIndices: [1, 2, 3, 4], beamGroups: [{ start: 2, end: 4 }] }),
    bar([note("Bb4", "dottedMinim")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 25 }));

  const HIGHER_2019_Q3_TRANSPOSE = [
    note("A3", "quaver", { tieToNext: true }), note("A3", "quaver", { tiedFromPrevious: true }),
    note("C4", "quaver"), note("A3", "quaver"),
  ];

  // Higher 2022, Question 4: the 13-bar melody printed in F major and 12/8.
  // The source was audited at 600 dpi, system by system. Editable items remain
  // in the inventory but are hidden by the renderer until the pupil places them.
  const HIGHER_2022_Q4_BARS = [
    bar([note("A5", "dottedCrotchet"), note("A5", "dottedCrotchet"), note("A5", "dottedCrotchet"), note("A5", "quaver"), note("G5", "quaver"), note("F5", "quaver")], { beamGroups: [{ start: 3, end: 5 }] }),
    bar([note("A5", "dottedCrotchet"), note("A5", "dottedCrotchet"), note("A5", "dottedCrotchet"), note("A5", "quaver"), note("G5", "quaver"), note("F5", "quaver")], { beamGroups: [{ start: 3, end: 5 }] }),
    bar([note("Bb5", "dottedCrotchet"), note("A5", "crotchet"), note("G5", "quaver"), note("F5", "dottedCrotchet"), note("C5", "dottedCrotchet")]),
    bar([note("G5", "dottedCrotchet"), rest("dottedCrotchetRest"), note("A5", "semiquaver"), note("C6", "semiquaver", { tieToNext: true }), note("C6", "crotchet", { tiedFromPrevious: true }), note("A5", "semiquaver"), note("G5", "semiquaver"), note("A5", "quaver"), note("G5", "quaver")], { missingIndices: [0], beamGroups: [{ start: 2, end: 3 }, { start: 5, end: 8 }] }),
    bar([note("F5", "dottedCrotchet"), rest("dottedCrotchetRest"), note("F5", "crotchet"), note("E5", "quaver"), note("D5", "crotchet"), note("E5", "quaver")]),
    bar([note("A4", "dottedCrotchet"), rest("dottedCrotchetRest"), note("C5", "crotchet"), note("Bb4", "quaver"), note("A4", "crotchet"), note("G4", "quaver")], { givenChord: ["F", "I"], chordAnswer: "C" }),
    bar([note("F4", "dottedCrotchet"), rest("dottedCrotchetRest"), note("F5", "crotchet"), note("E5", "quaver"), note("D5", "crotchet"), note("E5", "quaver")], { chordAnswer: "Dm" }),
    bar([note("A5", "semiquaver"), note("G5", "semiquaver"), note("F5", "crotchet"), rest("dottedCrotchetRest"), note("C5", "quaver"), note("C5", "quaver"), note("C5", "quaver"), note("C5", "crotchet"), note("D4", "quaver")], { tonicIndex: 2, beamGroups: [{ start: 0, end: 1 }, { start: 4, end: 6 }] }),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("F4", "quaver"), rest("quaverRest"), note("A4", "quaver"), note("C5", "quaver"), note("F5", "crotchet"), note("E5", "quaver"), note("D5", "crotchet"), note("E5", "quaver")], { beamGroups: [{ start: 0, end: 2 }, { start: 4, end: 5 }] }),
    bar([note("A4", "dottedCrotchet"), note("F4", "quaver"), note("G4", "quaver"), note("A4", "quaver"), note("C5", "crotchet"), note("Bb4", "quaver"), note("A4", "crotchet"), note("Bb4", "quaver")], { beamGroups: [{ start: 1, end: 3 }] }),
    bar([note("A4", "dottedCrotchet"), note("G4", "dottedCrotchet"), note("Bb4", "dottedCrotchet"), note("A4", "crotchet"), note("F4", "semiquaver"), note("G4", "semiquaver")], { missingIndices: [0, 1, 2], beamGroups: [{ start: 4, end: 5 }] }),
    bar([note("A4", "dottedCrotchet"), note("G4", "crotchet"), note("F4", "quaver"), note("G4", "dottedCrotchet"), note("F4", "crotchet"), note("E4", "quaver")], { transposeIndices: [3, 4, 5] }),
    bar([note("F4", "dottedMinim"), rest("dottedMinimRest")], { transposeIndices: [0] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 13 }));

  const HIGHER_2022_Q4_TRANSPOSE = [
    note("G3", "dottedCrotchet"), note("F3", "crotchet"), note("E3", "quaver"), note("F3", "dottedMinim"),
  ];

  // Source-measured geometry for the official 2022 Question 4 page. The
  // first and final systems retain their source spacing; the three bars in
  // lines 2, 3 and 4 use equal widths so their systems align consistently.
  const HIGHER_2022_Q4_SCORE_LAYOUT = {
    viewBoxHeight: 1245,
    systems: [110, 335, 565, 800, 1030],
    groups: [[0, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10], [11, 12]],
    staffLefts: [240, 15, 15, 15, 15],
    musicStarts: [350, 105, 105, 105, 105],
    staffRights: [915, 915, 915, 915, 615],
    barEnds: [[625, 915], [375, 645, 915], [375, 645, 915], [375, 645, 915], [390, 615]],
    boxes: {
      time: { x: 235, y: 15, width: 385, height: 165, label: "(a) Time signature" },
      interval: { x: 305, y: 220, width: 120, height: 195, label: "(b) Interval" },
      chords: { x: 195, y: 440, width: 275, height: 190, label: "(c) Chords" },
      tonic: { x: 640, y: 465, width: 275, height: 165, label: "(d) Tonic note" },
      notes: { x: 650, y: 655, width: 155, height: 220, label: "(e) Notes" },
      transpose: { x: 250, y: 940, width: 350, height: 280, label: "(f) Transpose" },
    },
    givenChordBox: { x: 90, y: 444, width: 45, rowHeight: 38 },
    chordAnswerBoxes: [
      { x: 209, y: 475, width: 42, height: 42 },
      { x: 378, y: 475, width: 42, height: 42 },
    ],
    bassStaff: { left: 165, right: 615, top: 1160, barlineX: 390 },
    timeSignatureX: 355,
  };

  // Higher 2023, Question 4: the sixteen-bar melody printed in F major and
  // 4/4. Every bar remains an explicit rhythmic inventory; editable items stay
  // in place but are hidden until the pupil supplies an answer. Cross-bar ties
  // are recorded on both notes so the renderer can preserve the source phrasing.
  const HIGHER_2023_Q4_BARS = [
    bar([note("A4", "quaver"), note("C5", "quaver"), note("C5", "quaver"), note("A4", "quaver"), note("C5", "crotchet"), note("C5", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 0, end: 3 }, { start: 5, end: 6 }] }),
    bar([note("D5", "quaver"), note("C5", "crotchet"), note("A4", "quaver", { tieToNext: true }), note("A4", "crotchet", { tiedFromPrevious: true }), rest("quaverRest"), note("G4", "quaver")], { missingIndices: [0] }),
    bar([note("G4", "quaver"), note("F4", "quaver"), note("F4", "crotchet"), note("F4", "crotchet"), rest("quaverRest"), note("D4", "quaver")], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("G4", "quaver"), note("G4", "quaver"), note("F4", "quaver"), note("D4", "quaver", { tieToNext: true }), note("D4", "crotchet", { tiedFromPrevious: true }), rest("crotchetRest")], { transposeIndices: [0, 1, 2, 3, 4], beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("C4", "quaver"), note("D4", "quaver"), note("F4", "quaver"), note("A4", "quaver", { tieToNext: true }), note("A4", "crotchet", { tiedFromPrevious: true }), note("A4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 0, end: 3 }, { start: 5, end: 6 }] }),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("F4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "crotchet", { tiedFromPrevious: true }), rest("quaverRest"), note("C4", "quaver")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("A4", "quaver"), note("A4", "quaver"), note("F4", "quaver"), note("G4", "quaver"), note("F4", "crotchet"), note("D4", "quaver"), note("G4", "quaver", { tieToNextBar: true })], { missingIndices: [1, 2, 3], beamGroups: [{ start: 2, end: 3 }, { start: 5, end: 6 }] }),
    bar([note("G4", "quaver", { tiedFromPreviousBar: true }), note("D4", "dottedCrotchet"), rest("minimRest")]),
    bar([note("G4", "crotchet"), note("F4", "crotchet"), note("F4", "quaver"), note("G4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })], { rhythmCorrectionIndices: [0, 1] }),
    bar([note("A4", "crotchet", { tiedFromPreviousBar: true }), rest("crotchetRest"), note("A4", "crotchet"), note("C5", "crotchet")]),
    bar([note("D5", "dottedCrotchet"), note("C5", "quaver"), note("C5", "crotchet"), note("A4", "quaver"), note("A4", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("F4", "dottedCrotchet"), rest("dottedCrotchetRest"), note("F4", "quaver")], { missingIndices: [2] }),
    bar([note("C5", "crotchet"), note("C5", "quaver"), note("Bb4", "quaver"), note("Bb4", "quaver"), note("Bb4", "crotchet"), note("A4", "quaver", { tiedFromPreviousBar: true })], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("A4", "crotchet", { tiedFromPreviousBar: true }), rest("crotchetRest"), note("G4", "quaver"), note("F4", "crotchet"), note("F4", "quaver", { tieToNextBar: true })], { givenChord: ["C", "V"] }),
    bar([note("F4", "quaver", { tiedFromPreviousBar: true }), note("A4", "crotchet"), note("G4", "quaver", { tieToNext: true }), note("G4", "quaver", { tiedFromPrevious: true }), note("F4", "crotchet"), note("F4", "quaver", { tieToNextBar: true })], { chordAnswers: ["Bb", "C"], beamGroups: [] }),
    bar([note("F4", "minim", { tiedFromPreviousBar: true }), rest("minimRest")], { finalBarline: "double" }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  const HIGHER_2023_Q4_LYRICS = [
    ["Ev'-", "ry-", "bo-", "dy", "else", "try'n", "to"],
    ["go", "their", "way_", null, null, "you're"],
    ["bound", "to", "get", "tripped,", null, "and"],
    ["what", "can", "you", "say?_", null, null],
    ["Just", "go", "a-", "long_", null, "till", "they"],
    ["turn", "out", "the", "lights;", null, null, "there's"],
    ["noth-", "in'", "we", "can", "do", "to", "fight____"],
    [null, "it.", null],
    ["No", "man's", "got", "it", "made____"],
    [null, null, "till", "he's"],
    ["far", "be-", "yond", "the", "pain,_____"],
    [null, null, null, "and"],
    ["we", "who__", null, "must", "re-", "main"],
    [null, null, "go", "on", "live"],
    ["-", "ing", "just____", null, "the", "same.___"],
    [null, null],
  ];

  const HIGHER_2023_Q4_LYRIC_OFFSETS = {
    3: [0, 0, -5, 8],
    6: [0, 0, 0, 0, 0, -5, 10],
    10: [0, 0, 0, -6, 12],
    14: [0, 0, -4, 8, 0, 0],
  };
  const HIGHER_2023_Q4_LYRIC_Y_OFFSETS = { 3: [10, 10, 10, 10] };
  const HIGHER_2023_Q4_REST_X_OFFSET = -25;

  // Source-measured engraving geometry from official page 7. Answer boxes
  // deliberately cross barlines where they do in the printed paper.
  const HIGHER_2023_Q4_SCORE_LAYOUT = Object.freeze({
    viewBoxHeight: 1265,
    systems: [105, 305, 628, 859, 1097],
    groups: [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9], [10, 11, 12], [13, 14, 15]],
    staffLeft: 50,
    musicStart: 150,
    firstBarLeftShift: 25,
    musicEnd: 855,
    barEnds: [[363, 615, 855], [341, 588, 855], [361, 458, 699, 855], [355, 588, 855], [359, 641, 855]],
    boxes: {
      interval: { x: 328, y: 18, width: 79, height: 183, label: "(a) Interval" },
      transpose: { x: 118, y: 239, width: 175, height: 262, label: "(b) Transpose" },
      notes: { x: 159, y: 543, width: 90, height: 188, label: "(c) Notes" },
      rhythm: { x: 465, y: 546, width: 97, height: 185, label: "(d) Rhythm" },
      rests: { x: 445, y: 801, width: 92, height: 147, label: "(e) Rest(s)" },
      chords: { x: 302, y: 992, width: 292, height: 212, label: "(f) Chords" },
    },
    bassStaff: { left: 50, right: 343, top: 427 },
    givenChordBox: { x: 215, y: 998, width: 39, rowHeight: 42 },
    chordAnswerBoxes: [
      { x: 312, y: 1040, width: 36, height: 42 },
      { x: 467, y: 1040, width: 38, height: 41 },
    ],
  });

  const HIGHER_2023_Q4_TRANSPOSE = [
    note("G3", "quaver"), note("G3", "quaver"), note("F3", "quaver"),
    note("D3", "quaver", { tieToNext: true }), note("D3", "crotchet", { tiedFromPrevious: true }),
  ];

  // Higher 2024, Question 4: the complete 24-bar F-major melody and lyric
  // underlay were audited against the 600 dpi render of official page 7.
  // Editable notes and symbols remain part of the structured inventory so the
  // score and marking rules can be regression-tested independently of layout.
  const HIGHER_2024_Q4_BARS = [
    bar([note("C5", "dottedCrotchet"), note("F4", "quaver", { tieToNext: true }), note("F4", "crotchet", { tiedFromPrevious: true }), rest("crotchetRest")]),
    bar([note("A4", "dottedCrotchet"), note("Bb4", "quaver", { tieToNext: true }), note("Bb4", "crotchet", { tiedFromPrevious: true }), rest("crotchetRest")]),
    bar([note("C5", "dottedCrotchet"), note("F4", "quaver", { tieToNext: true }), note("F4", "crotchet", { tiedFromPrevious: true }), rest("crotchetRest")], { intervalIndices: [0, 1] }),
    bar([note("A4", "minim", { tieToNext: true }), note("A4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("C5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([rest("crotchetRest"), rest("quaverRest"), note("F4", "quaver", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("F4", "quaver"), note("F4", "crotchet")], { beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("A4", "crotchet"), note("Bb4", "crotchet", { tieToNext: true }), note("Bb4", "quaver", { tiedFromPrevious: true }), note("Bb4", "quaver"), note("Bb4", "crotchet")], { rhythmCorrectionIndices: [1, 2], beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("C5", "dottedCrotchet"), note("F4", "quaver", { tieToNext: true }), note("F4", "crotchet", { tiedFromPrevious: true }), rest("crotchetRest")]),
    bar([note("A4", "crotchet"), note("A4", "quaver"), note("Bb4", "quaver", { tieToNext: true }), note("Bb4", "quaver", { tiedFromPrevious: true }), note("C5", "quaver"), note("C5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 1, end: 2 }, { start: 3, end: 6 }] }),
    bar([rest("crotchetRest"), rest("quaverRest"), note("F4", "quaver", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("F4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })], { beamGroups: [] }),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("A4", "crotchet"), note("C5", "quaver", { tieToNext: true }), note("C5", "crotchet", { tiedFromPrevious: true }), note("D5", "crotchet")], { dominantIndices: [2, 3] }),
    bar([rest("crotchetRest"), rest("quaverRest"), note("F4", "quaver", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("F4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })], { beamGroups: [] }),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("G4", "quaver"), note("F4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "crotchet", { tiedFromPrevious: true }), note("F4", "crotchet")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([rest("crotchetRest"), rest("quaverRest"), note("F4", "quaver", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("F4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })]),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("A4", "crotchet"), note("C5", "quaver", { tieToNext: true }), note("C5", "crotchet", { tiedFromPrevious: true }), note("D5", "crotchet")], { transposeIndices: [1, 2, 3] }),
    bar([rest("crotchetRest"), rest("quaverRest"), note("F4", "quaver", { tieToNext: true }), note("F4", "quaver", { tiedFromPrevious: true }), note("F4", "crotchet"), note("A4", "quaver", { tieToNextBar: true })]),
    bar([note("A4", "quaver", { tiedFromPreviousBar: true }), note("G4", "quaver"), note("F4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "crotchet", { tiedFromPrevious: true }), note("F4", "crotchet")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([rest("minimRest"), rest("crotchetRest"), rest("quaverRest"), note("G4", "quaver")], { givenChord: ["C", "V"] }),
    bar([note("G4", "crotchet"), note("A4", "crotchet"), note("C5", "crotchet"), note("F5", "crotchet", { tieToNextBar: true })]),
    bar([note("F5", "crotchet", { tiedFromPreviousBar: true }), note("E5", "quaver"), note("D5", "quaver", { tieToNext: true }), note("D5", "minim", { tiedFromPrevious: true })], { chordAnswer: "Bb", beamGroups: [{ start: 1, end: 2 }] }),
    bar([rest("crotchetRest"), note("F5", "quaver"), note("E5", "quaver", { tieToNext: true }), note("E5", "crotchet", { tiedFromPrevious: true }), note("D5", "quaver"), note("C5", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }] }),
    bar([note("C5", "crotchet", { tiedFromPreviousBar: true }), note("D5", "quaver"), note("A4", "quaver", { tieToNext: true }), note("A4", "minim", { tiedFromPrevious: true })], { chordAnswer: "F" }),
    bar([rest("crotchetRest"), note("E5", "quaver"), note("E5", "quaver", { tieToNext: true }), note("E5", "crotchet", { tiedFromPrevious: true }), note("C5", "quaver"), note("G5", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }] }),
    bar([note("G5", "semibreve", { tiedFromPreviousBar: true, tieToNextBar: true })]),
    bar([note("G5", "semibreve", { tiedFromPreviousBar: true })], { daCapoTarget: true, finalBarline: "single" }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 24 }));

  const HIGHER_2024_Q4_LYRICS = [
    ["May", "-", "be___", null],
    ["we", "can_", null, null],
    ["find", "a___", null, null],
    ["place___", null, "to", "feel", "good"],
    [null, null, "And__", null, "we", "can"],
    ["treat", "peo", "-", "ple", "with"],
    ["kind", "-ness__", null, null],
    ["find", "a", "place", null, "to", "feel", "good"],
    [null, null, "I've__", null, "got", "a_____"],
    [null, "good", "feel", "-", "ing"],
    [null, null, "I'm__", null, "just", "tak"],
    [null, "-", "ing", "it", "all__", "in"],
    [null, null, "Float-", null, "ing", "up_____"],
    [null, "and", "dream-", null, "ing"],
    [null, null, "Drop-", null, "ping", "in"],
    [null, "-", "to", "the", "deep", "end"],
    [null, null, null, "And"],
    ["if", "we're", "here", "long____"],
    [null, "e-", "nough", null],
    [null, "they'll", "sing_", null, "a", "song____"],
    [null, "for", "us__", null],
    [null, "and", "we'll_", null, "be-", "long________________"],
    [null],
    [null],
  ];

  const HIGHER_2024_Q4_LYRIC_OFFSETS = {
    0: [0, -6, 4, 0],
    3: [0, 0, -3, 0, 5],
    5: [0, -3, 0, 2, 5],
    7: [0, -2, 0, 0, -2, 0, 4],
    9: [0, -2, 0, 0, 4],
    11: [0, 0, 0, 0, -2, 4],
    15: [0, 0, -2, 0, 1, 5],
    19: [0, -2, 0, 0, 0, 4],
    21: [0, -2, 0, 0, 0, 5],
  };

  const HIGHER_2024_Q4_SCORE_LAYOUT = Object.freeze({
    viewBoxHeight: 1450,
    systems: [105, 320, 525, 735, 1110, 1340],
    groups: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23]],
    staffLeft: 35,
    musicStart: 130,
    firstBarLeftShift: 25,
    barEnds: [[297, 477, 617, 885], [290, 478, 637, 885], [298, 476, 690, 885], [214.5, 460, 631, 885], [212, 396, 537, 739, 885], [353, 484, 614]],
    boxes: {
      interval: { x: 485, y: 0, width: 95, height: 193, label: "(a) Interval" },
      rhythm: { x: 300, y: 249, width: 173, height: 157, label: "(b) Rhythm" },
      dominant: { x: 96, y: 467, width: 378, height: 151, label: "(c) Dominant note" },
      transpose: { x: 262, y: 673, width: 130, height: 270, label: "(d) Transpose" },
      chords: { x: 413, y: 998, width: 463, height: 201, label: "(e) Chords" },
    },
    dominantSelectableBars: [8, 9],
    bassStaff: { left: 192, right: 392, top: 860 },
    givenChordBox: { x: 96, y: 1021, width: 36, rowHeight: 42 },
    chordAnswerBoxes: [
      { x: 423, y: 1035, width: 44, height: 49 },
      { x: 759, y: 1035, width: 44, height: 49 },
    ],
  });

  const HIGHER_2024_Q4_TRANSPOSE = [
    note("A3", "crotchet"), note("C4", "quaver", { tieToNext: true }), note("C4", "crotchet", { tiedFromPrevious: true }),
  ];

  // Higher 2025, Question 4: each bar and its lyric underlay are stored as
  // structured data. The score was transcribed independently from the 600 dpi
  // source and retains the confirmed ties, rests and editable items.
  const HIGHER_2025_Q4_BARS = [
    bar([rest("crotchetRest"), note("B4", "quaver"), note("C5", "quaver"), note("B4", "crotchet"), note("A4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }] }),
    bar([note("G4", "minim"), rest("minimRest")]),
    bar([rest("crotchetRest"), note("B4", "quaver"), note("C5", "quaver"), note("B4", "crotchet"), note("A4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }], subdominantIndices: [2], subdominantSelectableIndices: [1, 2, 3, 4, 5] }),
    bar([note("G4", "crotchet"), rest("crotchetRest"), rest("minimRest")]),
    bar([rest("quaverRest"), note("G4", "quaver"), note("G4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("C5", "crotchet"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([rest("quaverRest"), note("G4", "quaver"), note("G4", "quaver"), note("C5", "quaver", { tieToNext: true }), note("C5", "quaver", { tiedFromPrevious: true }), note("B4", "crotchet"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 3 }], givenChord: ["C", "IV"] }),
    bar([rest("quaverRest"), note("A4", "quaver"), note("G4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("G4", "crotchet"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }], chordAnswer: "D" }),
    bar([rest("semibreveRest")], { fullBarRest: true, chordAnswer: "Em" }),
    bar([rest("crotchetRest"), note("B4", "quaver"), note("C5", "quaver"), note("B4", "crotchet"), note("A4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }] }),
    bar([note("B4", "minim"), rest("minimRest")]),
    bar([rest("crotchetRest"), note("B4", "quaver"), note("C5", "quaver"), note("B4", "crotchet"), note("A4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }], transposeIndices: [1, 2, 3, 4, 5] }),
    bar([note("G4", "crotchet"), rest("crotchetRest"), rest("minimRest")]),
    bar([rest("quaverRest"), note("G4", "quaver"), note("G4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("C5", "crotchet"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([rest("quaverRest"), note("G4", "quaver"), note("G4", "quaver"), note("C5", "quaver", { tieToNext: true }), note("C5", "quaver", { tiedFromPrevious: true }), note("B4", "crotchet"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([rest("quaverRest"), note("A4", "quaver"), note("G4", "quaver"), note("B4", "quaver", { tieToNext: true }), note("B4", "quaver", { tiedFromPrevious: true }), note("G4", "crotchet"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([rest("semibreveRest")], { fullBarRest: true }),
    bar([rest("crotchetRest"), note("G4", "crotchet"), note("B4", "crotchet"), note("D5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 3, end: 4 }], missingIndices: [3, 4] }),
    bar([note("E5", "dottedMinim"), rest("crotchetRest")]),
    bar([rest("crotchetRest"), note("E5", "quaver"), note("E5", "quaver"), note("D5", "dottedCrotchet"), note("G4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("B4", "minim"), rest("minimRest")]),
    bar([rest("crotchetRest"), note("G5", "quaver"), note("E5", "quaver"), note("G5", "crotchet"), note("G5", "quaver"), note("E5", "quaver", { tieToNextBar: true })], { beamGroups: [{ start: 1, end: 2 }, { start: 4, end: 5 }], missingBarlineAfter: true }),
    bar([note("E5", "quaver", { tiedFromPreviousBar: true }), note("G5", "quaver"), note("E5", "dottedMinim")], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([rest("quaverRest"), note("E5", "quaver"), note("A5", "quaver"), note("A5", "quaver"), note("F5", "quaver"), note("E5", "crotchet"), note("D5", "quaver")], { beamGroups: [{ start: 2, end: 3 }], intervalIndices: [1, 2] }),
    bar([note("D5", "minim"), rest("minimRest")], { finalBarline: "double" }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 24 }));

  const HIGHER_2025_Q4_LYRICS = [
    [null, "Ev-", "'ry", "breath", "you_", null],
    ["take,", null],
    [null, "ev-", "'ry", "move", "you_", null],
    ["make,", null, null],
    [null, "ev-", "'ry", "bond_", null, "you", "break,"],
    [null, "ev-", "'ry", "step_", null, "you", "take,"],
    [null, "I'll", "be", "watch", null, "-ing", "you."],
    [null],
    [null, "Ev-", "'ry", "sin-", "gle_", null],
    ["day,", null],
    [null, "ev-", "'ry", "word", "you_", null],
    ["say,", null, null],
    [null, "ev-", "'ry", "game", null, "you", "play,"],
    [null, "ev-", "'ry", "night", null, "you", "stay,"],
    [null, "I'll", "be", "watch", null, "-ing", "you."],
    [null],
    [null, "Oh,", "can't", "you___", null],
    ["see", null],
    [null, "you", "be-", "long", "to"],
    ["me?", null],
    [null, "How", "my", "poor", "heart_____", null],
    [null, "aches", null],
    [null, "with", "ev-", "'ry", "step_", null, "you"],
    ["take.", null],
  ];

  const HIGHER_2025_Q4_LYRIC_OFFSETS = {
    20: [0, 0, 0, 0, 15, 0],
  };

  // Higher 2025 Question 4 uses the printed score's six-system layout rather
  // than a regular grid. These values are calibrated from the official page 7
  // PDF: the staff gap is mapped to the shared Higher score gap and each
  // system's printed barlines are retained. Keeping this as data makes the
  // paper-specific layout easy to audit without changing the shared renderer.
  const HIGHER_2025_Q4_SCORE_LAYOUT = Object.freeze({
    systems: [105, 344.3, 541.5, 812.8, 1031.7, 1261.6],
    musicStart: 150,
    musicEnd: 855,
    firstBarStartOffset: -25,
    barEnds: [
      [346.9, 478.7, 702.2, 855],
      [336.2, 555, 771.3, 855],
      [320.5, 471.5, 691.3, 855],
      [324.3, 544.7, 765.9, 855],
      [320.5, 469.5, 688.7, 855],
      // The bar line after bar 21 is deliberately missing in the source.
      // Keep its answer position as an internal boundary before the printed
      // bar line after bar 22.
      [344, 495.9, 773.5, 855],
    ],
    boxes: {
      a: { x: 485.1, y: 36.6, width: 210.5, height: 137.2 },
      b: { x: 562.3, y: 238.6, width: 288.8, height: 173.8 },
      c: { x: 514.8, y: 473.8, width: 173.2, height: 280.2 },
      d: { x: 249.1, y: 939.7, width: 65.7, height: 161.8 },
      e: { x: 109.3, y: 1194, width: 376.3, height: 136 },
      f: { x: 537.4, y: 1160.1, width: 74.3, height: 172.1 },
    },
    givenChord: { x: 370.3, y: 243.2, width: 44.7, rowHeight: 41.5 },
    chordInputs: [
      { x: 569.1, y: 283.8, width: 40.8, height: 42.3 },
      { x: 783.9, y: 283.8, width: 38.6, height: 42.3 },
    ],
    intervalInput: { x: 546, y: 1197, width: 55, height: 34 },
    bassTop: 675.6,
  });

  const HIGHER_2025_Q4_TRANSPOSE = [
    note("B3", "quaver"), note("C4", "quaver"), note("B3", "crotchet"), note("A3", "quaver"), note("G3", "quaver"),
  ];

  // National 5 2016, Question 3: "Moon River". Each bar is recorded
  // explicitly so the printed score can be audited pitch by pitch and rhythm
  // by rhythm against the official question paper.
  const N5_2016_Q3_BARS = [
    bar([note("C5", "dottedMinim")]),
    bar([note("G5", "crotchet"), note("F5", "minim")]),
    bar([note("E5", "dottedCrotchet"), note("D5", "quaver"), note("C5", "quaver"), note("Bb4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("C5", "minim"), note("F4", "crotchet")]),
    bar([note("E5", "dottedCrotchet"), note("D5", "quaver"), note("C5", "quaver"), note("Bb4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("C5", "minim"), note("F4", "crotchet")]),
    bar([note("G4", "dottedMinim", { tieToNextBar: true })]),
    bar([note("G4", "minim", { tiedFromPreviousBar: true }), note("A4", "crotchet")]),
    bar([note("F4", "dottedMinim")]),
    bar([note("C5", "crotchet"), note("A4", "dottedCrotchet"), note("G4", "quaver")]),
    bar([note("F4", "dottedMinim")]),
    bar([note("C5", "crotchet"), note("A4", "dottedCrotchet"), note("G4", "quaver")]),
    bar([note("F4", "crotchet"), note("A4", "crotchet"), note("C5", "crotchet")]),
    bar([note("F5", "crotchet"), note("E5", "dottedCrotchet"), note("D5", "quaver")]),
    bar([note("E5", "crotchet"), note("D5", "dottedCrotchet"), note("C5", "quaver")], { missingIndices: [0, 1, 2] }),
    bar([note("D5", "dottedMinim")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  const N5_2016_Q3_LYRICS = [
    ["Moon"], ["ri-", "ver,"], ["wi-", "der", "than", "a"], ["mile,", "I'm"],
    ["cros-", "sin'", "you", "in"], ["style", "some"], ["day."], [null, "Old"],
    ["dream"], ["ma-", "ker,", "you"], ["heart"], ["brea-", "ker,", "wher-"],
    ["ev-", "er", "you're"], ["go-", "ing,", "I'm"], ["go-", "ing", "your"], ["way."],
  ];

  // National 5 2017, Question 3: "The Moon Represents My Heart". The
  // anacrusis is drawn separately; every numbered bar below is an explicit
  // pitch-and-rhythm inventory checked against the official question paper.
  const N5_2017_Q3_BARS = [
    bar([note("G4", "dottedCrotchet"), note("B4", "quaver"), note("D5", "dottedCrotchet"), note("G4", "quaver")]),
    bar([note("F4", "dottedCrotchet"), note("B4", "quaver"), note("D5", "crotchet"), note("D5", "crotchet")], { rhythmCorrectionIndices: [2, 3] }),
    bar([note("E5", "dottedCrotchet"), note("F5", "quaver"), note("G5", "dottedCrotchet"), note("E5", "quaver")]),
    bar([note("D5", "dottedMinim"), note("B4", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("G4", "dottedCrotchet"), note("G4", "quaver"), note("G4", "crotchet"), note("B4", "quaver"), note("A4", "quaver")], { missingIndices: [3, 4], beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("G4", "dottedCrotchet"), note("G4", "quaver"), note("G4", "crotchet"), note("A4", "quaver"), note("B4", "quaver")], { beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("B4", "quaver"), note("A4", "crotchet"), note("G4", "quaver"), note("E4", "crotchet"), note("A4", "quaver"), note("B4", "quaver")], { beamGroups: [{ start: 4, end: 5 }] }),
    bar([note("B4", "quaver"), note("A4", "quaver", { tieToNext: true }), note("A4", "minim", { tiedFromPrevious: true })], { beamGroups: [{ start: 0, end: 1 }] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 8 }));

  // National 5 2018, Question 3: "Somewhere Out There". The score begins
  // after the printed two-bar introduction. Every numbered bar is recorded
  // explicitly so the notation and editable areas can be regression-tested.
  const N5_2018_Q3_BARS = [
    bar([rest(), note("E4", "crotchet"), note("G4", "minim")]),
    bar([note("E4", "minim"), note("C4", "crotchet"), note("D4", "crotchet")], { rhythmCorrectionIndices: [1, 2] }),
    bar([note("E4", "crotchet"), note("G4", "crotchet"), note("D5", "crotchet"), note("C5", "crotchet")]),
    bar([note("A4", "semibreve")]),
    bar([note("A4", "minim"), note("D5", "crotchet"), note("B4", "quaver"), note("A4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("G4", "minim"), note("C4", "minim")]),
    bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "dottedCrotchet"), note("F4", "quaver")]),
    bar([note("D4", "dottedMinim"), rest()]),
    bar([rest(), note("E4", "crotchet"), note("G4", "dottedCrotchet"), note("A4", "quaver")]),
    bar([note("G4", "semibreve")]),
    bar([note("E4", "crotchet"), note("G4", "crotchet"), note("D5", "crotchet"), note("C5", "crotchet")], { missingIndices: [2, 3] }),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("A4", "dottedMinim")], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("A4", "minim"), note("D4", "crotchet"), note("E4", "quaver"), note("F4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("A4", "crotchet"), note("G4", "minim"), note("A4", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("F5", "crotchet"), note("E5", "crotchet"), note("D5", "quaver"), note("C5", "quaver"), note("A4", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 2, end: 5 }] }),
    bar([note("C5", "semibreve")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  // National 5 2019, Question 3: Mozart, Sonata in C, second movement.
  // The eight bars below are a source-audited inventory. Accidentals are
  // stored with their notes so pitch, rhythm and engraving remain separate.
  const N5_2019_Q3_BARS = [
    bar([note("B4", "minim"), note("D5", "semiquaver"), note("C5", "semiquaver"), note("B4", "semiquaver"), note("C5", "semiquaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G4", "crotchet"), rest()], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("G5", "dottedCrotchet"), note("A5", "semiquaver"), note("G5", "semiquaver"), note("F♯5", "semiquaver"), note("E5", "semiquaver"), note("D5", "semiquaver"), note("C5", "semiquaver", { accidental: "sharp", accidentalXOffset: -7 })], { beamGroups: [{ start: 1, end: 2 }, { start: 3, end: 6 }] }),
    bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G4", "crotchet"), rest()], { missingIndices: [0, 1, 2], beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("C5", "dottedQuaver"), note("A4", "semiquaver"), note("F4", "quaver"), note("A4", "quaver"), note("B4", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 2, end: 3 }, { start: 4, end: 5 }] }),
    bar([note("D5", "dottedQuaver"), note("B4", "semiquaver"), note("G5", "crotchet"), rest()], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("A5", "semiquaver"), note("G5", "semiquaver"), note("F♯5", "semiquaver"), note("G5", "semiquaver"), note("F♯5", "semiquaver"), note("E5", "semiquaver"), note("D5", "semiquaver", { accidental: "sharp", accidentalXOffset: -6 }), note("E5", "semiquaver"), note("D5", "crotchet", { accidental: "natural", accidentalXOffset: -5, stemDown: true }), note("C5", "crotchet", { stemDown: true }), note("B4", "crotchet", { stemDown: true }), note("C5", "crotchet", { stemDown: true })], { rhythmCorrectionIndices: [8, 9, 10, 11], positionOffsets: [-20, -20, -20, -20, -20, -20, -10, -10, 3, 3, 0, 0] }),
    bar([note("B4", "quaver"), note("C5", "semiquaver"), note("B4", "semiquaver"), note("A4", "quaver"), rest("quaverRest"), rest()], { beamGroups: [{ start: 0, end: 2 }] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 8 }));

  // National 5 2022, Question 3. The sixteen bars below are an explicit
  // pitch-and-rhythm inventory checked against both the official question
  // paper and the completed score in the official marking instructions.
  const N5_2022_Q3_BARS = [
    bar([note("A4", "quaver"), note("G4", "quaver"), note("E4", "quaver"), note("G4", "quaver"), note("G4", "minim", { tieToNextBar: true })], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), rest()]),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("E4", "quaver"), note("D4", "quaver"), note("E4", "quaver"), note("G4", "quaver"), note("G4", "crotchet", { tieToNextBar: true })], { beamGroups: [{ start: 0, end: 3 }, { start: 4, end: 5 }] }),
    bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), rest()]),
    bar([note("G4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "minim")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("G4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "crotchet"), note("G4", "crotchet")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("E4", "quaver"), note("D4", "quaver"), note("E4", "quaver"), note("G4", "quaver"), note("G4", "crotchet", { tieToNextBar: true })], { beamGroups: [{ start: 0, end: 3 }, { start: 4, end: 5 }] }),
    bar([note("G4", "dottedMinim", { tiedFromPreviousBar: true }), note("C4", "quaver"), note("C4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C5", "minim"), note("C5", "minim")]),
    bar([note("G4", "dottedMinim"), note("E4", "quaver"), note("D4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C4", "minim"), note("C5", "minim")]),
    bar([note("A4", "quaver"), note("G4", "quaver", { tieToNext: true }), note("G4", "minim", { tiedFromPrevious: true }), note("C5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 4 }] }),
    bar([note("B4", "quaver"), note("G4", "quaver"), note("G4", "quaver"), note("G4", "quaver"), note("G4", "dottedCrotchet"), note("G4", "quaver")], { missingIndices: [4, 5], beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("A4", "quaver"), note("F4", "quaver"), note("F4", "quaver"), note("F4", "quaver"), note("F4", "minim")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("G4", "quaver"), note("E4", "quaver"), note("E4", "quaver"), note("E4", "quaver"), note("E4", "crotchet"), note("G4", "crotchet")], { beamGroups: [{ start: 0, end: 3 }] }),
    bar([note("F4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "quaver"), note("D4", "minim")], { beamGroups: [{ start: 0, end: 3 }] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 16 }));

  // National 5 2023, Question 3: "Till There Was You". The anacrusis is
  // drawn separately. Every numbered bar below was checked against both the
  // official question paper and the completed notation in the marking guide.
  const N5_2023_Q3_ANACRUSIS = [note("A4", "quaver"), note("Bb4", "quaver")];
  const N5_2023_Q3_BARS = [
    bar([note("C5", "dottedMinim"), note("A4", "quaver"), note("Bb4", "quaver")], { beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C5", "dottedMinim"), note("A4", "quaver"), note("Bb4", "quaver")], { missingIndices: [1, 2], beamGroups: [{ start: 1, end: 2 }] }),
    bar([note("C5", "crotchet"), note("Bb4", "crotchet", { stemDown: true }), note("F5", "dottedCrotchet"), note("D5", "quaver")]),
    bar([note("C5", "crotchet"), note("Bb4", "minim", { stemDown: true }), note("F4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("Bb4", "crotchet", { stemDown: true }), note("A4", "crotchet"), note("E5", "crotchet"), note("E5", "quaver"), note("E5", "quaver", { accidental: "flat", accidentalXOffset: -6 })], { beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("D5", "minim"), note("E4", "crotchet", { accidental: "natural", accidentalXOffset: -6 }), note("F4", "quaver"), note("G4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("C5", "semibreve", { tieToNextBar: true })]),
    bar([note("C5", "minim", { tiedFromPreviousBar: true }), rest(), note("A4", "quaver"), note("Bb4", "quaver")], { beamGroups: [{ start: 2, end: 3 }] }),
    bar([note("F4", "semibreve", { tieToNextBar: true })]),
    bar([note("F4", "minim", { tiedFromPreviousBar: true })], { positionOffsets: [-45] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 10 }));

  // National 5 2024, Question 3: "Northern Lights". Every bar was
  // checked against both the official question paper and the completed
  // score in the marking instructions. The notes in bar 3 remain in the
  // data but are omitted by the renderer until the pupil places them.
  const N5_2024_Q3_BARS = [
    bar([note("A4", "quaver"), note("C5", "quaver"), note("E5", "crotchet", { tieToNext: true }), note("E5", "quaver"), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 4 }, { start: 5, end: 6 }] }),
    bar([note("D5", "minim", { tieToNext: true }), note("D5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("Bb4", "quaver", { accidental: "flat", accidentalXOffset: -4 })], { beamGroups: [{ start: 1, end: 2 }, { start: 3, end: 4 }] }),
    bar([note("A4", "quaver"), note("D5", "quaver"), note("F5", "crotchet", { tieToNext: true }), note("F5", "quaver"), note("F5", "quaver"), note("E5", "quaver"), note("D5", "quaver")], { missingIndices: [5, 6], beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 4 }, { start: 5, end: 6 }] }),
    bar([note("E5", "semibreve")]),
    bar([note("C5", "quaver"), note("F5", "quaver"), note("A5", "crotchet", { tieToNext: true }), note("A5", "quaver"), note("A5", "quaver"), note("G5", "quaver"), note("F5", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 4 }, { start: 5, end: 6 }] }),
    bar([note("G5", "dottedCrotchet"), note("F5", "quaver"), note("E5", "minim")]),
    bar([note("G4", "quaver", { accidental: "sharp", accidentalXOffset: -4 }), note("B4", "quaver"), note("E5", "crotchet", { tieToNext: true }), note("E5", "quaver"), note("D5", "quaver"), note("C5", "quaver"), note("B4", "quaver")], { beamGroups: [{ start: 0, end: 1 }, { start: 3, end: 4 }, { start: 5, end: 6 }] }),
    bar([note("A4", "semibreve")]),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 8 }));

  // National 5 2025, Question 3: "Wouldn't It Be Loverly". The complete
  // ten-bar inventory was checked against the high-resolution source paper
  // and the completed score in the official marking instructions.
  const N5_2025_Q3_BARS = [
    bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "crotchet"), note("F4", "dottedQuaver"), note("C4", "semiquaver")], { beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("D4", "crotchet"), note("F4", "crotchet"), note("F4", "minim")]),
    bar([note("F4", "crotchet"), note("G4", "crotchet"), note("A4", "crotchet"), note("F4", "dottedQuaver"), note("C4", "semiquaver")], { missingIndices: [0, 1, 2], beamGroups: [{ start: 3, end: 4 }] }),
    bar([note("D4", "crotchet"), note("G4", "crotchet"), note("G4", "minim")]),
    bar([rest("crotchetRest"), note("F4", "crotchet"), note("F4", "crotchet"), note("G4", "crotchet")]),
    bar([note("G4", "crotchet"), note("A4", "crotchet"), note("A4", "crotchet"), note("Bb4", "crotchet")]),
    bar([note("C5", "minim", { tieToNext: true }), note("C5", "quaver"), note("A4", "quaver"), note("Bb4", "quaver"), note("F4", "quaver", { accidental: "sharp", accidentalXOffset: -4 })], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("A4", "quaver"), note("G4", "quaver"), note("G4", "dottedMinim")], { beamGroups: [{ start: 0, end: 1 }] }),
    bar([note("C5", "minim", { tieToNext: true }), note("C5", "quaver"), note("A4", "quaver"), note("Bb4", "quaver"), note("E4", "quaver")], { beamGroups: [{ start: 1, end: 4 }] }),
    bar([note("G4", "quaver"), note("F4", "quaver"), note("F4", "dottedMinim")], { beamGroups: [{ start: 0, end: 1 }] }),
  ].map((item, barIndex) => ({ ...item, barIndex, totalBars: 10 }));

  function q3Text(svg, text, attributes = {}, className = "") {
    const node = svgElement("text", attributes);
    if (className) node.setAttribute("class", className);
    node.textContent = text;
    svg.append(node);
    return node;
  }

  function q3ActualSymbolKey(key) {
    if (["flatInScore", "flatKeySignature"].includes(key)) return "flat";
    if (key === "naturalInScore") return "natural";
    if (["sharpInScore", "sharpKeySignature"].includes(key)) return "sharp";
    if (["noteheadBlackStemUp", "noteheadBlackStemDown"].includes(key)) return "noteheadBlack";
    if (["augmentationDotLine", "augmentationDotSpace"].includes(key)) return "augmentationDot";
    return key;
  }

  function q3SettingsKey(key) {
    const symbols = q3SharedConfig().symbols || {};
    if (key === "timeSigCommon") return "timeSig44";
    if (["flatKeySignature", "sharpKeySignature"].includes(key) && symbols.keySignatureAccidentals) return "keySignatureAccidentals";
    if (["flatInScore", "naturalInScore", "sharpInScore"].includes(key) && symbols.scoreAccidentals) return "scoreAccidentals";
    return key;
  }

  function q3SymbolConfig(key) {
    const symbols = q3SharedConfig().symbols || {};
    const settingsKey = q3SettingsKey(key);
    return symbols[settingsKey] || symbols[q3ActualSymbolKey(settingsKey)] || {
      fontSizeScale: 3.4, xOffsetScale: 0, yOffsetScale: 0,
      widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0,
    };
  }

  function q3CalibratedSymbol(svg, symbolKey, x, y, options = {}) {
    const glyph = q3Glyph(symbolKey);
    if (!glyph) return null;
    const settings = { ...q3SymbolConfig(symbolKey), ...(options.settings || {}) };
    const lineGap = options.lineGap || Q3_STAFF.gap;
    const adjustedX = x + lineGap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const adjustedY = y + lineGap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const widthScale = Number(settings.widthScale || 1);
    const heightScale = Number(settings.heightScale || 1);
    const node = q3Text(svg, glyph, {
      x: adjustedX,
      y: adjustedY,
      "font-size": lineGap * Number(settings.fontSizeScale || 3.4),
      "text-anchor": "middle",
      transform: `translate(${adjustedX} ${adjustedY}) scale(${widthScale} ${heightScale}) translate(${-adjustedX} ${-adjustedY})`,
      opacity: options.opacity ?? 1,
    }, `q3-music-glyph ${options.className || ""}`.trim());
    node.style.pointerEvents = "none";
    return node;
  }

  function q3YForStep(step, top) { return top + Q3_STAFF.gap * 4 - step * (Q3_STAFF.gap / 2); }
  function q3StemDown(step) { return step > 4; }
  function q3MusicStart(barIndex) {
    return Q3_STAFF.left + (Math.floor(barIndex / Q3_BARS_PER_SYSTEM) === 0 ? 122 : 74);
  }
  function q3BarStart(barIndex) {
    const musicStart = q3MusicStart(barIndex);
    return musicStart + (barIndex % Q3_BARS_PER_SYSTEM) * q3BarWidth(barIndex);
  }
  function q3BarWidth(barIndex) {
    const musicStart = q3MusicStart(barIndex);
    return (Q3_STAFF.right - musicStart) / Q3_BARS_PER_SYSTEM;
  }
  function q3SystemTop(barIndex) {
    return Q3_STAFF.topA + Math.floor(barIndex / Q3_BARS_PER_SYSTEM) * Q3_SYSTEM_SPACING;
  }
  function q3SystemTop2015(barIndex) {
    const systemIndex = Math.floor(barIndex / Q3_BARS_PER_SYSTEM);
    return Q3_STAFF.topA + systemIndex * N5_2015_Q3_SYSTEM_SPACING + (systemIndex >= 3 ? 30 : 0);
  }
  function q3SystemTop2019(barIndex) {
    return Q3_STAFF.topA + Math.floor(barIndex / Q3_BARS_PER_SYSTEM) * N5_2019_Q3_SYSTEM_SPACING;
  }
  function q3SystemTop2016(barIndex) {
    return Q3_STAFF.topA + Math.floor(barIndex / N5_2016_Q3_BARS_PER_SYSTEM) * N5_2016_Q3_SYSTEM_SPACING;
  }
  function q3SystemTop2024(barIndex) {
    return Q3_STAFF.topA + Math.floor(barIndex / Q3_BARS_PER_SYSTEM) * N5_2024_Q3_SYSTEM_SPACING;
  }
  function q3SystemTop2023(barIndex) {
    return Q3_STAFF.topA + Math.floor(barIndex / Q3_BARS_PER_SYSTEM) * N5_2023_Q3_SYSTEM_SPACING;
  }
  function q3MusicStart2016(barIndex) {
    return Q3_STAFF.left + (Math.floor(barIndex / N5_2016_Q3_BARS_PER_SYSTEM) === 0 ? 122 : 74);
  }
  function q3BarWidth2016(barIndex) {
    return (Q3_STAFF.right - q3MusicStart2016(barIndex)) / N5_2016_Q3_BARS_PER_SYSTEM;
  }
  function q3BarStart2016(barIndex) {
    return q3MusicStart2016(barIndex) + (barIndex % N5_2016_Q3_BARS_PER_SYSTEM) * q3BarWidth2016(barIndex);
  }
  function q3MusicStart2022(barIndex) {
    return Q3_STAFF.left + (Math.floor(barIndex / N5_2016_Q3_BARS_PER_SYSTEM) === 0 ? 102 : 74);
  }
  function q3BarWidth2022(barIndex) {
    return (Q3_STAFF.right - q3MusicStart2022(barIndex)) / N5_2016_Q3_BARS_PER_SYSTEM;
  }
  function q3BarStart2022(barIndex) {
    return q3MusicStart2022(barIndex) + (barIndex % N5_2016_Q3_BARS_PER_SYSTEM) * q3BarWidth2022(barIndex);
  }
  function q3BarPositions2022(bar) {
    const start = q3BarStart2022(bar.barIndex);
    const end = start + q3BarWidth2022(bar.barIndex);
    const scoreStart = start + (bar.barIndex === 0 ? 4 : 10);
    const scoreEnd = bar.barIndex === 15 ? end - 24 : end - 5;
    const units = bar.notes.reduce((sum, _, index) => sum + q3PositionSpacing(bar.notes, index), 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * .38;
    return bar.notes.map((_, index) => { const x = cursor; cursor += q3PositionSpacing(bar.notes, index) * unit; return x; });
  }
  function q3PositionSpacing(notes, index) {
    const rhythm = notes[index]?.rhythm;
    const previous = notes[index - 1]?.rhythm;
    const next = notes[index + 1]?.rhythm;
    const dottedPair = (rhythm === "dottedQuaver" && [previous, next].includes("semiquaver"))
      || (rhythm === "semiquaver" && [previous, next].includes("dottedQuaver"));
    return dottedPair ? Q3_RHYTHMS.quaver.spacing : (Q3_RHYTHMS[rhythm]?.spacing || Q3_RHYTHMS.crotchet.spacing);
  }
  function q3BarPositions(bar) {
    const start = q3BarStart(bar.barIndex);
    const end = start + q3BarWidth(bar.barIndex);
    const scoreStart = start + (bar.barIndex === 0 ? 4 : 15);
    const scoreEnd = bar.barIndex === 7 ? end - 24 : end - 4;
    const units = bar.notes.reduce((sum, _, index) => sum + q3PositionSpacing(bar.notes, index), 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * .38;
    return bar.notes.map((_, index) => {
      const x = cursor;
      cursor += q3PositionSpacing(bar.notes, index) * unit;
      return x;
    });
  }
  function q3BarPositions2019(bar) {
    const positions = q3BarPositions(bar);
    (bar.positionOffsets || []).forEach((offset, index) => {
      if (positions[index] !== undefined) positions[index] += Number(offset || 0);
    });
    return positions;
  }
  function q3BarPositions2016(bar) {
    const start = q3BarStart2016(bar.barIndex);
    const end = start + q3BarWidth2016(bar.barIndex);
    const scoreStart = start + (bar.barIndex === 0 ? 4 : 10);
    const scoreEnd = bar.barIndex === 15 ? end - 24 : end - 5;
    const units = bar.notes.reduce((sum, _, index) => sum + q3PositionSpacing(bar.notes, index), 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * .38;
    const positions = bar.notes.map((_, index) => {
      const x = cursor;
      cursor += q3PositionSpacing(bar.notes, index) * unit;
      return x;
    });
    (bar.positionOffsets || []).forEach((offset, index) => {
      if (positions[index] !== undefined) positions[index] += Number(offset || 0);
    });
    return positions;
  }

  function q3MusicStart2023(barIndex) {
    return Q3_STAFF.left + (Math.floor(barIndex / Q3_BARS_PER_SYSTEM) === 0 ? 252 : 74);
  }
  function q3BarWidth2023(barIndex) {
    return (Q3_STAFF.right - q3MusicStart2023(barIndex)) / Q3_BARS_PER_SYSTEM;
  }
  function q3BarStart2023(barIndex) {
    return q3MusicStart2023(barIndex) + (barIndex % Q3_BARS_PER_SYSTEM) * q3BarWidth2023(barIndex);
  }
  function q3VisibleBarEnd2023(barIndex) {
    const start = q3BarStart2023(barIndex);
    const width = q3BarWidth2023(barIndex);
    if (barIndex !== 0) return start + width;
    const end = start + width;
    const lastNote = q3BarPositions2023(N5_2023_Q3_BARS[barIndex]).at(-1);
    return lastNote + 25;
  }
  function q3BarPositions2023(bar) {
    const start = q3BarStart2023(bar.barIndex);
    const end = start + q3BarWidth2023(bar.barIndex);
    const scoreStart = start + 9;
    const scoreEnd = end - (bar.barIndex === 7 ? 24 : 7);
    const units = bar.notes.reduce((sum, _, index) => sum + q3PositionSpacing(bar.notes, index), 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * .38;
    const positions = bar.notes.map((_, index) => {
      const x = cursor;
      cursor += q3PositionSpacing(bar.notes, index) * unit;
      return x;
    });
    (bar.positionOffsets || []).forEach((offset, index) => {
      if (positions[index] !== undefined) positions[index] += Number(offset || 0);
    });
    return positions;
  }

  function q3NoteSymbolKey(rhythm, down, beamed = false) {
    if (rhythm === "semibreve") return "wholeNote";
    if (rhythm === "semibreveRest") return "wholeRest";
    if (["dottedQuaverRest", "quaverRest"].includes(rhythm)) return "eighthRest";
    if (["minimRest", "dottedMinimRest"].includes(rhythm)) return "halfRest";
    if (["minim", "dottedMinim"].includes(rhythm)) return down ? "halfNoteStemDown" : "halfNoteStemUp";
    if (["crotchetRest", "dottedCrotchetRest"].includes(rhythm)) return "quarterRest";
    if (rhythm === "semiquaver" && beamed) return down ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "semiquaver") return down ? "sixteenthNoteStemDown" : "sixteenthNoteStemUp";
    if (rhythm === "dottedQuaver" && beamed) return down ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "dottedQuaver") return down ? "eighthNoteStemDown" : "eighthNoteStemUp";
    if (rhythm === "quaver" && beamed) return down ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "quaver") return down ? "eighthNoteStemDown" : "eighthNoteStemUp";
    return down ? "quarterNoteStemDown" : "quarterNoteStemUp";
  }
  function q3Beamable(note) { return ["quaver", "dottedQuaver", "semiquaver"].includes(note?.rhythm); }
  function q3BeamGroups(notes) {
    const groups = [];
    let index = 0;
    while (index < notes.length) {
      if (!q3Beamable(notes[index])) { index += 1; continue; }
      const start = index;
      while (q3Beamable(notes[index + 1])) index += 1;
      let groupStart = start;
      while (groupStart <= index) {
        const remaining = index - groupStart + 1;
        const size = remaining === 5 ? 3 : remaining >= 4 ? 4 : remaining;
        const end = groupStart + size - 1;
        if (end > groupStart) groups.push({ start: groupStart, end });
        groupStart = end + 1;
      }
      index += 1;
    }
    return groups;
  }
  function q3GroupFor(groups, index) { return groups.find(group => index >= group.start && index <= group.end) || null; }
  function q3GetStem(x, y, step, down, forcedEndY = null) {
    const stemLength = Q3_STAFF.gap * 3.1;
    const stemX = x + (down ? -Q3_STAFF.gap * .6 : Q3_STAFF.gap * .6);
    return { down, stemX, startY: y + (down ? .5 : -.5), endY: forcedEndY ?? (down ? y + stemLength : y - stemLength) };
  }
  function q3GroupDown(notes) {
    if (notes.every(item => item?.stemDown === true)) return true;
    let down = 0;
    let up = 0;
    notes.forEach(item => q3StemDown(item.step) ? down += 1 : up += 1);
    return down > up;
  }
  function q3GetBeam(notes, positions, top) {
    const down = q3GroupDown(notes);
    const settings = q3SymbolConfig("quaverBeam");
    const xOffset = Q3_STAFF.gap * Number(settings.xOffsetScale || 0);
    const yOffset = Q3_STAFF.gap * Number(settings.yOffsetScale || 0);
    const stemLength = Q3_STAFF.gap * 3.1 * Number(settings.heightScale || 1);
    const firstY = q3YForStep(notes[0].step, top);
    const lastY = q3YForStep(notes.at(-1).step, top);
    const firstStem = q3GetStem(positions[0] + xOffset, firstY + yOffset, notes[0].step, down, down ? firstY + yOffset + stemLength : firstY + yOffset - stemLength);
    const lastStem = q3GetStem(positions.at(-1) + xOffset, lastY + yOffset, notes.at(-1).step, down, down ? lastY + yOffset + stemLength : lastY + yOffset - stemLength);
    let startY = firstStem.endY;
    let endY = lastStem.endY;
    if (notes.length > 2 && notes.some(item => item.rhythm === "semiquaver")) {
      const points = notes.map((item, index) => ({ x: positions[index], y: q3YForStep(item.step, top) }));
      const spread = Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y));
      if (spread >= Q3_STAFF.gap * .75) {
        const xMean = points.reduce((sum, point) => sum + point.x, 0) / points.length;
        const yMean = points.reduce((sum, point) => sum + point.y, 0) / points.length;
        const variance = points.reduce((sum, point) => sum + ((point.x - xMean) ** 2), 0);
        const covariance = points.reduce((sum, point) => sum + ((point.x - xMean) * (point.y - yMean)), 0);
        let slope = variance ? covariance / variance : 0;
        slope = Math.max(-.11, Math.min(.11, slope));
        if (Math.abs(slope) < .035) slope = points.at(-1).y <= points[0].y ? -.045 : .045;
        const centreX = (firstStem.stemX + lastStem.stemX) / 2;
        const centreY = (firstStem.endY + lastStem.endY) / 2;
        startY = centreY + slope * (firstStem.stemX - centreX);
        endY = centreY + slope * (lastStem.stemX - centreX);
      }
    }
    const minStemLength = Q3_STAFF.gap * 2.45;
    let shift = 0;
    notes.forEach((item, index) => {
      const y = q3YForStep(item.step, top);
      const stemX = q3GetStem(positions[index], y, item.step, down).stemX;
      const projected = startY + ((stemX - firstStem.stemX) / ((lastStem.stemX - firstStem.stemX) || 1)) * (endY - startY);
      shift = down ? Math.max(shift, (y + minStemLength) - projected) : Math.min(shift, (y - minStemLength) - projected);
    });
    return { down, start: { x: firstStem.stemX, y: startY + shift }, end: { x: lastStem.stemX, y: endY + shift } };
  }
  function q3BeamY(x, beam) {
    return beam.start.y + ((x - beam.start.x) / ((beam.end.x - beam.start.x) || 1)) * (beam.end.y - beam.start.y);
  }
  function q3BeamPolygon(svg, beam, options = {}) {
    const thickness = Math.max(1, Q3_STAFF.gap * Number(q3SharedConfig().drawing?.beamThicknessScale || .42));
    const half = thickness / 2;
    svg.append(svgElement("polygon", {
      points: `${beam.start.x - .5},${beam.start.y - half} ${beam.end.x + .5},${beam.end.y - half} ${beam.end.x + .5},${beam.end.y + half} ${beam.start.x - .5},${beam.start.y + half}`,
      class: `q3-beam-shape ${options.className || ""}`.trim(),
      opacity: options.opacity ?? 1,
    }));
  }
  function q3SecondarySegments(notes) {
    const segments = [];
    let start = null;
    notes.forEach((item, index) => {
      const semi = item.rhythm === "semiquaver";
      const nextSemi = notes[index + 1]?.rhythm === "semiquaver";
      if (semi && start === null) start = index;
      if (start !== null && (!nextSemi || index === notes.length - 1)) {
        segments.push({ start, end: index, hook: index === start });
        start = null;
      }
    });
    return segments;
  }
  function q3DrawNote(svg, item, x, top, options = {}) {
    const y = item.rest ? q3YForStep(4, top) : q3YForStep(item.step, top);
    const down = options.down ?? item.stemDown ?? q3StemDown(item.step);
    const beamed = q3Beamable(item) && options.beamed;
    const key = q3NoteSymbolKey(item.rhythm, down, beamed);
    if (!item.rest && (item.step <= -2 || item.step >= 10)) {
      const ledgerSteps = [];
      if (item.step <= -2) for (let step = -2; step >= item.step; step -= 2) ledgerSteps.push(step);
      else for (let step = 10; step <= item.step; step += 2) ledgerSteps.push(step);
      ledgerSteps.forEach(step => {
        const ledgerY = q3YForStep(step, top);
        svg.append(svgElement("line", {
          x1: x - Q3_STAFF.gap,
          x2: x + Q3_STAFF.gap,
          y1: ledgerY,
          y2: ledgerY,
          class: "q3-ledger-line",
          opacity: options.opacity ?? 1,
        }));
      });
    }
    const visualScale = Number(options.scale || 1);
    const symbolSettings = q3SymbolConfig(key);
    if (!item.rest && item.accidental) {
      q3CalibratedSymbol(svg, `${item.accidental}InScore`, x - Q3_STAFF.gap * 1.4 + Number(item.accidentalXOffset || 0), y, {
        className: options.classNames?.[index] || options.className || "",
        opacity: options.opacity ?? 1,
      });
    }
    q3CalibratedSymbol(svg, key, x, y, {
      className: `${beamed ? "q3-notehead" : "q3-complete-note"} ${options.className || ""}`.trim(),
      opacity: options.opacity ?? 1,
      settings: {
        widthScale: Number(symbolSettings.widthScale || 1) * visualScale,
        heightScale: Number(symbolSettings.heightScale || 1) * visualScale,
      },
    });
    if (/dotted/i.test(item.rhythm)) {
      const dotKey = item.step % 2 === 0 ? "augmentationDotLine" : "augmentationDotSpace";
      q3CalibratedSymbol(svg, dotKey, x + Q3_STAFF.gap * 1.3, item.step % 2 === 0 ? y - Q3_STAFF.gap * .25 : y, {
        className: options.className || "",
        opacity: options.opacity ?? 1,
      });
    }
    if (beamed) {
      const stem = q3GetStem(x, y, item.step, down, options.forcedEndY);
      svg.append(svgElement("line", {
        x1: stem.stemX, x2: stem.stemX, y1: stem.startY, y2: stem.endY,
        class: "q3-stem-calibrated",
        "stroke-width": Math.max(1, Q3_STAFF.gap * Number(q3SharedConfig().drawing?.stemThicknessScale || .12)),
      }));
    }
    return { x, y, down };
  }
  function q3DrawTie(svg, first, second, options = {}) {
    const midX = (first.x + second.x) / 2;
    const stemsUp = !first.down && !second.down;
    const drawAbove = options.above === true || !stemsUp;
    const y = drawAbove ? Math.min(first.y, second.y) - Q3_STAFF.gap * .28 : Math.max(first.y, second.y) + Q3_STAFF.gap * .28;
    const stretch = Math.max(1.4, Math.min(7.2 * Number(options.widthScale || 1), Math.abs(second.x - first.x) / (Q3_STAFF.gap * 2)));
    q3Text(svg, q3Glyph("tie"), {
      x: 0,
      y: 0,
      "font-size": 58,
      "text-anchor": "middle",
      opacity: options.opacity ?? 1,
      transform: `translate(${midX} ${y}) scale(${stretch} 1)${drawAbove ? " rotate(180)" : ""}`,
    }, `q3-music-glyph ${options.className || ""}`.trim());
  }
  function q3EnteredPitch(value) {
    if (Q3_PITCH_STEPS[value] !== undefined) return value;
    if (value === "F♯") return "F♯5";
    if (value === "C") return "C5";
    if (["D", "E"].includes(value)) return `${value}4`;
    return "B4";
  }
  function q3VisibleNotes(bar, enteredNotes) {
    if (!bar.missing) return bar.notes;
    const entered = String(enteredNotes || "").split(",").slice(0, 3);
    return bar.notes.map((item, index) => index < 3 ? (entered[index] && entered[index] !== "_" ? { ...note(q3EnteredPitch(entered[index]), "crotchet"), beat: index, beats: 1 } : null) : item);
  }
  function q3DrawBarNotes(svg, bar, top, enteredNotes, enteredAnswerClass = "", enteredReviewStatus = "", correctNotes = "") {
    const positions = q3BarPositions(bar);
    const notes = q3VisibleNotes(bar, enteredNotes);
    const entered = String(enteredNotes || "").split(",").slice(0, 3);
    const expected = String(correctNotes || "").split(",").slice(0, 3);
    const groupingSource = bar.notes;
    const groups = q3BeamGroups(groupingSource);
    const points = [];
    notes.forEach((item, index) => {
      if (!item) { points[index] = null; return; }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = bar.missing && index < 3 ? enteredAnswerClass : "";
      if (bar.missing && index < 3 && enteredReviewStatus) {
        className = q3EnteredPitch(entered[index]) === q3EnteredPitch(expected[index]) ? "q3-answer-correct" : "q3-answer-incorrect";
      }
      points[index] = q3DrawNote(svg, item, positions[index], top, { beamed: Boolean(beam), down: beam?.down, forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null, className });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beam = q3GetBeam(groupNotes, groupPositions, top);
      q3BeamPolygon(svg, beam);
      q3SecondarySegments(groupNotes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const lift = beam.down ? 2 : -2;
        const stemX = localIndex => q3GetStem(groupPositions[localIndex], q3YForStep(groupNotes[localIndex].step, top), groupNotes[localIndex].step, beam.down).stemX;
        const x1 = stemX(segment.start);
        const x2 = segment.hook ? x1 + (segment.start > 0 ? -(Q3_STAFF.gap * .9 + 2) : Q3_STAFF.gap * .9 + 2) : stemX(segment.end);
        q3BeamPolygon(svg, { start: { x: x1, y: q3BeamY(x1, beam) + offset + lift }, end: { x: x2, y: q3BeamY(x2, beam) + offset + lift } });
      });
    });
    notes.forEach((item, index) => {
      if (item?.tieToNext && points[index] && points[index + 1]) q3DrawTie(svg, points[index], points[index + 1]);
    });
    if (bar.missing && enteredReviewStatus && enteredReviewStatus !== "correct") {
      expected.forEach((pitch, index) => {
        const enteredPitch = entered[index] && entered[index] !== "_" ? q3EnteredPitch(entered[index]) : "";
        const expectedPitch = pitch ? q3EnteredPitch(pitch) : "";
        if (!expectedPitch || enteredPitch === expectedPitch) return;
        q3DrawNote(svg, note(expectedPitch, "crotchet"), positions[index] + (enteredPitch ? 5 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
  }

  function q3DrawTimeSignature(svg, value, top, answerClass = "", xOffset = 0, xOverride = null) {
    if (!value) return;
    const isCommonTime = ["c", "common time"].includes(String(value).trim().toLocaleLowerCase("en-GB"));
    if (isCommonTime) {
      const settings = q3SymbolConfig("timeSigCommon");
      const x = (xOverride ?? (Q3_STAFF.left + 12 * Q3_STAFF.gap)) + Q3_STAFF.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0) + xOffset;
      const y = top + Q3_STAFF.gap * 2;
      q3Text(svg, q3Glyph("timeSigCommon"), { x, y, "font-size": Q3_STAFF.gap * Number(settings.fontSizeScale || 3.5), "text-anchor": "middle", "dominant-baseline": "central" }, `q3-music-glyph ${answerClass}`.trim());
      return;
    }
    const [upper, lower] = String(value).split("/");
    const key = `timeSig${upper}${lower}`;
    const settings = q3SymbolConfig(key);
    const x = (xOverride ?? (Q3_STAFF.left + 12 * Q3_STAFF.gap)) + Q3_STAFF.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0) + xOffset;
    const y = q3YForStep(5.3, top) + Q3_STAFF.gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const fontSize = Q3_STAFF.gap * Number(settings.fontSizeScale || 3.4);
    q3Text(svg, [...upper].map(digit => q3Glyph(`timeSig${digit}`)).join(""), { x, y: y - fontSize * .14, "font-size": fontSize, "text-anchor": "middle" }, `q3-music-glyph ${answerClass}`.trim());
    q3Text(svg, q3Glyph(`timeSig${lower}`), { x, y: y + fontSize * .43, "font-size": fontSize, "text-anchor": "middle" }, `q3-music-glyph ${answerClass}`.trim());
  }
  function q3DrawSystemPrefix(svg, top, timeSignature, answerClass = "", timeSignatureXOffset = 0) {
    q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
    q3CalibratedSymbol(svg, "sharpKeySignature", Q3_STAFF.left + 54, q3YForStep(8, top));
    q3DrawTimeSignature(svg, timeSignature, top, answerClass, timeSignatureXOffset);
  }
  function q3LocalPoint(svg, event) {
    const matrix = svg.getScreenCTM?.();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      return { x: local.x, y: local.y };
    }
    const rect = svg.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 920, y: ((event.clientY - rect.top) / rect.height) * 540 };
  }

  function q3AddNoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = Q3_BARS[2];
    const top = q3SystemTop(2);
    const positions = q3BarPositions(bar);
    const targetLeft = positions[0] - 22;
    const targetRight = positions[2] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    function noteFromEvent(event, lockedIndex = null) {
      const local = q3LocalPoint(svg, event);
      const noteIndex = lockedIndex ?? [0, 1, 2].reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, 0);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { noteIndex, pitch } : null;
    }

    function showPreview(item, isDragging = false) {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, "crotchet"), positions[item.noteIndex], top, {
        opacity: isDragging ? .72 : .48,
        scale: isDragging ? 1.6 : 1,
      });
      svg.append(previewGroup);
      svg.append(target);
    }

    function commitNote(item) {
      if (!item) return;
      const questionCard = svg.closest(".question-card");
      const currentValue = questionCard?.dataset.q3CurrentNoteValue ?? String(answers.q3c || "");
      const current = currentValue.split(",").slice(0, 3);
      while (current.length < 3) current.push("_");
      current[item.noteIndex] = item.pitch;
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3c", nextValue);
    }

    function removeNote(event) {
      const questionCard = svg.closest(".question-card");
      const currentValue = questionCard?.dataset.q3CurrentNoteValue ?? String(answers.q3c || "");
      const current = currentValue.split(",").slice(0, 3);
      while (current.length < 3) current.push("_");
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let noteIndex = item?.noteIndex ?? -1;
      if (noteIndex < 0) {
        for (let index = current.length - 1; index >= 0; index -= 1) {
          if (current[index] && current[index] !== "_") { noteIndex = index; break; }
        }
      }
      if (noteIndex < 0 || !current[noteIndex] || current[noteIndex] === "_") return;
      current[noteIndex] = "_";
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3c", nextValue);
    }

    const target = svgElement("rect", {
      x: targetLeft,
      y: targetTop,
      width: targetRight - targetLeft,
      height: targetBottom - targetTop,
      class: "q3-note-hit-area",
    });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.noteIndex ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.noteIndex) || dragging;
      dragging = null;
      showPreview(null);
      commitNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", "Missing notes. Double-click, double-tap or right-click a note to remove it. Keyboard users can press Shift and Delete.");
    target.setAttribute("aria-keyshortcuts", "Shift+Delete");
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3DrawMissingNoteBox(svg) {
    const top = q3SystemTop(2);
    const positions = q3BarPositions(Q3_BARS[2]);
    const x = positions[0] - 22;
    const width = positions[2] - positions[0] + 64;
    const y = top - Q3_STAFF.gap * 3.4 + 18;
    const height = Q3_STAFF.gap * 10.2 - 26;
    svg.append(svgElement("rect", {
      x, y, width, height,
      class: "q3-marking-box",
    }));
  }

  function q3RepeatPlacement(barIndex) {
    const barlineX = q3BarStart(barIndex) + q3BarWidth(barIndex);
    const placementX = barlineX + (barIndex === Q3_BARS.length - 1 ? 6 : 4);
    return {
      x: placementX - Q3_STAFF.gap * 1.1 + 3,
      y: q3YForStep(4, q3SystemTop(barIndex)) + 10,
    };
  }

  function q3SetRepeatToolArmed(armed, context) {
    q3RepeatArmed = armed;
    const scope = context?.closest?.(".question-card") || document;
    scope.querySelectorAll(".notation-tool-repeat-sign").forEach(button => {
      button.classList.toggle("is-selected", armed);
      button.setAttribute("aria-pressed", String(armed));
    });
    scope.querySelectorAll(".q3-repeat-hit-area").forEach(target => {
      const remainsRemovable = target.dataset.repeatPlaced === "true";
      target.setAttribute("tabindex", armed || remainsRemovable ? "0" : "-1");
      target.setAttribute("aria-disabled", String(!armed && !remainsRemovable));
      if (!armed && !remainsRemovable && target === document.activeElement) target.blur();
    });
  }

  function q3AddRepeatTargets(svg, answers, onAnswerChange, options = {}) {
    if (!onAnswerChange) return;
    const bars = options.bars || Q3_BARS;
    const answerId = options.answerId || "q3d";
    const topFor = options.topFor || q3SystemTop;
    const startFor = options.startFor || q3BarStart;
    const widthFor = options.widthFor || q3BarWidth;
    const placementFor = options.placementFor || q3RepeatPlacement;
    bars.forEach((bar, barIndex) => {
      const top = topFor(barIndex);
      const x = startFor(barIndex) + widthFor(barIndex);
      let preview = null;
      const showPreview = () => {
        if (!q3RepeatArmed || preview) return;
        const placement = placementFor(barIndex);
        preview = q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { opacity: .35, className: "q3-repeat-preview" });
      };
      const hidePreview = () => {
        preview?.remove();
        preview = null;
      };
      const target = svgElement("rect", {
        x: x - 13, y: top - Q3_STAFF.gap * 1.2, width: 26, height: Q3_STAFF.gap * 6.4,
        class: "q3-repeat-hit-area", role: "button", tabindex: q3RepeatArmed ? "0" : "-1",
        "aria-disabled": String(!q3RepeatArmed),
        "aria-label": `Place end repeat at the end of bar ${barIndex + 1}`,
      });
      const placedHere = answers[answerId] === `end-bar-${barIndex + 1}`;
      if (placedHere) {
        target.dataset.repeatPlaced = "true";
        target.setAttribute("tabindex", "0");
        target.setAttribute("aria-disabled", "false");
        target.setAttribute("aria-label", `End repeat at the end of bar ${barIndex + 1}. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeRepeat = event => {
        if (!q3RepeatArmed) return;
        event.preventDefault();
        hidePreview();
        q3SetRepeatToolArmed(false, svg);
        onAnswerChange(answerId, `end-bar-${barIndex + 1}`);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeRepeat);
      target.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) placeRepeat(event);
      });
      bindRemovalGesture(target, () => {
        if (!placedHere) return;
        hidePreview();
        q3SetRepeatToolArmed(false, svg);
        onAnswerChange(answerId, "");
      });
      svg.append(target);
    });
  }

  function q3SetBarLabelToolArmed(armed, context) {
    q3BarLabelArmed = armed;
    const scope = context?.closest?.(".question-card") || document;
    scope.querySelectorAll(".notation-tool-bar-label").forEach(button => {
      button.classList.toggle("is-selected", armed);
      button.setAttribute("aria-pressed", String(armed));
    });
    scope.querySelectorAll(".q3-bar-label-hit-area").forEach(target => {
      const remainsRemovable = target.dataset.barLabelPlaced === "true";
      target.setAttribute("tabindex", armed || remainsRemovable ? "0" : "-1");
      target.setAttribute("aria-disabled", String(!armed && !remainsRemovable));
      if (!armed && !remainsRemovable && target === document.activeElement) target.blur();
    });
  }

  function q3SetRhythmToolArmed(value, context) {
    q3RhythmToolArmed = value || "";
    const scope = context?.closest?.(".question-card") || document;
    scope.querySelectorAll(".notation-tool-rhythm-entry").forEach(button => {
      const selected = button.dataset.value === q3RhythmToolArmed;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    scope.querySelectorAll(".q3-rhythm-hit-area").forEach(target => {
      const remainsRemovable = target.dataset.rhythmPlaced === "true";
      target.setAttribute("tabindex", q3RhythmToolArmed || remainsRemovable ? "0" : "-1");
      target.setAttribute("aria-disabled", String(!q3RhythmToolArmed && !remainsRemovable));
      if (!q3RhythmToolArmed && !remainsRemovable && target === document.activeElement) target.blur();
    });
  }

  function q3SetAccidentalToolArmed(value, context) {
    q3AccidentalToolArmed = value || "";
    const scope = context?.closest?.(".question-card") || document;
    scope.querySelectorAll(".notation-tool-accidental").forEach(button => {
      const selected = button.dataset.value === q3AccidentalToolArmed;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    scope.querySelectorAll(".q3-accidental-hit-area").forEach(target => {
      const remainsRemovable = target.dataset.accidentalPlaced === "true";
      target.setAttribute("tabindex", q3AccidentalToolArmed || remainsRemovable ? "0" : "-1");
      target.setAttribute("aria-disabled", String(!q3AccidentalToolArmed && !remainsRemovable));
      if (!q3AccidentalToolArmed && !remainsRemovable && target === document.activeElement) target.blur();
    });
  }

  function q3BarLabelPlacement2016(barIndex) {
    return {
      x: q3BarStart2016(barIndex) + Math.min(28, q3BarWidth2016(barIndex) * .22),
      y: q3SystemTop2016(barIndex) - 19,
    };
  }

  function q3Add2016BarLabelTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    N5_2016_Q3_BARS.forEach((bar, barIndex) => {
      const top = q3SystemTop2016(barIndex);
      const start = q3BarStart2016(barIndex);
      let preview = null;
      const showPreview = () => {
        if (!q3BarLabelArmed || preview) return;
        const placement = q3BarLabelPlacement2016(barIndex);
        preview = q3Text(svg, "V", { x: placement.x, y: placement.y, "text-anchor": "middle", opacity: .35 }, "q3-note-label q3-bar-label-preview");
      };
      const hidePreview = () => {
        preview?.remove();
        preview = null;
      };
      const target = svgElement("rect", {
        x: start,
        y: top - 48,
        width: q3BarWidth2016(barIndex),
        height: 39,
        class: "q3-bar-label-hit-area",
        role: "button",
        tabindex: q3BarLabelArmed ? "0" : "-1",
        "aria-disabled": String(!q3BarLabelArmed),
        "aria-label": `Place V above bar ${barIndex + 1}`,
      });
      const placedHere = answers.q3c === `bar-${barIndex + 1}`;
      if (placedHere) {
        target.dataset.barLabelPlaced = "true";
        target.setAttribute("tabindex", "0");
        target.setAttribute("aria-disabled", "false");
        target.setAttribute("aria-label", `V above bar ${barIndex + 1}. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeLabel = event => {
        if (!q3BarLabelArmed) return;
        event.preventDefault();
        hidePreview();
        q3SetBarLabelToolArmed(false, svg);
        onAnswerChange("q3c", `bar-${barIndex + 1}`);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeLabel);
      target.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) placeLabel(event);
      });
      bindRemovalGesture(target, () => {
        if (!placedHere) return;
        hidePreview();
        q3SetBarLabelToolArmed(false, svg);
        onAnswerChange("q3c", "");
      });
      svg.append(target);
    });
  }

  function q3AddAppliedAnswerTarget(svg, attributes, label, remove) {
    const target = svgElement("rect", {
      ...attributes,
      class: "q3-applied-answer-hit-area",
      role: "button",
      tabindex: "0",
      "aria-label": `${label}. Double-click, double-tap or right-click to remove it.`,
      "aria-keyshortcuts": "Shift+Delete",
    });
    bindRemovalGesture(target, remove);
    svg.append(target);
  }

  function q3AddDirectNoteTargets(svg, answers, onAnswerChange, options) {
    if (!onAnswerChange) return;
    const {
      id,
      xs,
      top,
      pitchMap,
      rhythms,
      label = "Missing notes",
    } = options;
    const pitchEntries = Object.entries(pitchMap);
    const ys = pitchEntries.map(([, y]) => y);
    const targetLeft = Math.min(...xs) - 22;
    const targetRight = Math.max(...xs) + 22;
    const targetTop = Math.min(...ys) - Q3_STAFF.gap * 2.5;
    const targetBottom = Math.max(...ys) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    function currentNotes() {
      const current = String(answers[id] || "").split(",").slice(0, xs.length);
      while (current.length < xs.length) current.push("_");
      return current;
    }

    function noteFromEvent(event, lockedSlot = null) {
      const local = q3LocalPoint(svg, event);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const slot = lockedSlot ?? xs.reduce((closest, x, index) => Math.abs(local.x - x) < Math.abs(local.x - xs[closest]) ? index : closest, 0);
      const pitch = pitchEntries.reduce((closest, entry) => Math.abs(local.y - entry[1]) < Math.abs(local.y - closest[1]) ? entry : closest, pitchEntries[0])[0];
      return { slot, pitch };
    }

    function showPreview(item, isDragging = false) {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      const previewStep = Math.round((top + Q3_STAFF.gap * 4 - pitchMap[item.pitch]) / (Q3_STAFF.gap / 2));
      q3DrawNote(previewGroup, { pitch: item.pitch, step: previewStep, rhythm: rhythms[item.slot] }, xs[item.slot], top, {
        opacity: isDragging ? .72 : .48,
        scale: isDragging ? 1.6 : 1,
      });
      svg.append(previewGroup);
      svg.append(target);
    }

    function commitNote(item) {
      if (!item) return;
      const current = currentNotes();
      current[item.slot] = item.pitch;
      onAnswerChange(id, current.join(","));
    }

    function removeNote(event) {
      const current = currentNotes();
      const coordinates = pointerEventCoordinates(event);
      const item = Number.isFinite(coordinates?.clientX) ? noteFromEvent(coordinates) : null;
      let slot = item?.slot ?? -1;
      if (slot < 0 || !current[slot] || current[slot] === "_") {
        slot = current.findLastIndex(value => value && value !== "_");
      }
      if (slot < 0) return;
      current[slot] = "_";
      onAnswerChange(id, current.join(","));
    }

    const target = svgElement("rect", {
      x: targetLeft,
      y: targetTop,
      width: targetRight - targetLeft,
      height: targetBottom - targetTop,
      class: "q3-note-hit-area",
      tabindex: "0",
      role: "button",
      "aria-label": `${label}. Double-click, double-tap or right-click a note to remove it.`,
      "aria-keyshortcuts": "Shift+Delete",
    });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      commitNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3EnteredPitch2015(value) {
    if (value === "Bb4" || value === "B♭4") return "Bb4";
    return q3EnteredPitch(value);
  }

  function q3Draw2015BarNotes(svg, bar, top, enteredNotes, enteredAnswerClass = "", enteredReviewStatus = "", correctNotes = "", positionResolver = q3BarPositions) {
    const missing = new Set(bar.missingIndices || []);
    const entered = String(enteredNotes || "").split(",").slice(0, missing.size);
    const expected = String(correctNotes || "").split(",").slice(0, missing.size);
    let enteredIndex = 0;
    const notes = bar.notes.map((item, index) => {
      if (!missing.has(index)) return item;
      const value = entered[enteredIndex++];
      return value && value !== "_" ? { ...item, pitch: q3EnteredPitch2015(value), step: Q3_PITCH_STEPS[q3EnteredPitch2015(value)] } : null;
    });
    const positions = positionResolver(bar);
    const groups = bar.beamGroups || q3BeamGroups(bar.notes);
    const points = [];
    let missingOrder = 0;
    notes.forEach((item, index) => {
      if (!item) { points[index] = null; if (missing.has(index)) missingOrder += 1; return; }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = "";
      if (missing.has(index)) {
        className = enteredAnswerClass;
        if (enteredReviewStatus) {
          const expectedPitch = q3EnteredPitch2015(expected[missingOrder]);
          className = item.pitch === expectedPitch ? "q3-answer-correct" : "q3-answer-incorrect";
        }
        missingOrder += 1;
      }
      points[index] = q3DrawNote(svg, item, positions[index], top, { beamed: Boolean(beam), down: beam?.down, forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null, className });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beam = q3GetBeam(groupNotes, groupPositions, top);
      q3BeamPolygon(svg, beam);
      q3SecondarySegments(groupNotes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const lift = beam.down ? 2 : -2;
        const stemX = localIndex => q3GetStem(groupPositions[localIndex], q3YForStep(groupNotes[localIndex].step, top), groupNotes[localIndex].step, beam.down).stemX;
        const x1 = stemX(segment.start);
        const x2 = segment.hook ? x1 + (segment.start > 0 ? -(Q3_STAFF.gap * .9 + 2) : Q3_STAFF.gap * .9 + 2) : stemX(segment.end);
        q3BeamPolygon(svg, { start: { x: x1, y: q3BeamY(x1, beam) + offset + lift }, end: { x: x2, y: q3BeamY(x2, beam) + offset + lift } });
      });
    });
    notes.forEach((item, index) => {
      if (item?.tieToNext && points[index] && points[index + 1]) q3DrawTie(svg, points[index], points[index + 1]);
    });
    if (enteredReviewStatus && enteredReviewStatus !== "correct") {
      Array.from(missing).forEach((noteIndex, index) => {
        const enteredPitch = entered[index] && entered[index] !== "_" ? q3EnteredPitch2015(entered[index]) : "";
        const expectedPitch = expected[index] ? q3EnteredPitch2015(expected[index]) : "";
        if (!expectedPitch || enteredPitch === expectedPitch) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], pitch: expectedPitch, step: Q3_PITCH_STEPS[expectedPitch] }, positions[noteIndex] + (enteredPitch ? 6 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    return points;
  }

  function q3Draw2015RhythmGuide(svg, bar, top) {
    const positions = q3BarPositions(bar);
    const indexes = bar.missingIndices || [];
    const guideTop = top - 59;
    const guideNotes = [
      note("A4", "dottedQuaver"), note("A4", "semiquaver"), note("A4", "quaver"), note("A4", "quaver"),
    ];
    [[0, 1], [2, 3]].forEach(([start, end]) => {
      const notes = guideNotes.slice(start, end + 1);
      const xs = indexes.slice(start, end + 1).map(index => positions[index]);
      const beam = q3GetBeam(notes, xs, guideTop);
      notes.forEach((item, localIndex) => {
        const stem = q3GetStem(xs[localIndex], q3YForStep(item.step, guideTop), item.step, beam.down);
        q3DrawNote(svg, item, xs[localIndex], guideTop, { beamed: true, down: beam.down, forcedEndY: q3BeamY(stem.stemX, beam) });
      });
      q3BeamPolygon(svg, beam);
      q3SecondarySegments(notes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const x1 = q3GetStem(xs[segment.start], q3YForStep(notes[segment.start].step, guideTop), notes[segment.start].step, beam.down).stemX;
        const x2 = segment.hook ? x1 - Q3_STAFF.gap : q3GetStem(xs[segment.end], q3YForStep(notes[segment.end].step, guideTop), notes[segment.end].step, beam.down).stemX;
        q3BeamPolygon(svg, { start: { x: x1, y: q3BeamY(x1, beam) + offset }, end: { x: x2, y: q3BeamY(x2, beam) + offset } });
      });
    });
  }

  function q3Add2015NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2015_Q3_BARS[6];
    const top = q3SystemTop2015(6);
    const positions = q3BarPositions(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 22;
    const targetRight = positions[indexes.at(-1)] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    function noteFromEvent(event, lockedIndex = null) {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = step === 4 ? "Bb4" : Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    }
    function showPreview(item, isDragging = false) {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      const rhythm = bar.notes[item.slot].rhythm;
      q3DrawNote(previewGroup, note(item.pitch, rhythm), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    }
    function currentNotes() {
      const questionCard = svg.closest(".question-card");
      const value = questionCard?.dataset.q3CurrentNoteValue ?? String(answers.q3f || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    }
    function commitNote(item) {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    function removeNote(event) {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) {
        for (let candidate = current.length - 1; candidate >= 0; candidate -= 1) {
          if (current[candidate] && current[candidate] !== "_") { index = candidate; break; }
        }
      }
      if (index < 0 || !current[index] || current[index] === "_") return;
      current[index] = "_";
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      commitNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", "Missing notes in bar 7. Double-click, double-tap or right-click a note to remove it.");
    target.setAttribute("aria-keyshortcuts", "Shift+Delete");
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Add2023NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2023_Q3_BARS[1];
    const top = q3SystemTop(1);
    const positions = q3BarPositions2023(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 24;
    const targetRight = positions[indexes.at(-1)] + 24;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = step === 4 ? "Bb4" : Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3c ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, bar.notes[item.slot].rhythm), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3c", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3c", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 2. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Add2024NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2024_Q3_BARS[2];
    const top = q3SystemTop2024(2);
    const positions = q3BarPositions(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 24;
    const targetRight = positions[indexes.at(-1)] + 24;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3d ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, "quaver"), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3d", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3d", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 3. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Add2025NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2025_Q3_BARS[2];
    const top = q3SystemTop(2);
    const positions = q3BarPositions(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 28;
    const targetRight = positions[indexes.at(-1)] + 28;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3c ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, "crotchet"), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3c", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3c", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 3. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Draw2016BarNotes(svg, bar, top, enteredNotes, enteredAnswerClass = "", enteredReviewStatus = "", correctNotes = "", positionResolver = q3BarPositions2016) {
    const missing = new Set(bar.missingIndices || []);
    const entered = String(enteredNotes || "").split(",").slice(0, missing.size);
    const expected = String(correctNotes || "").split(",").slice(0, missing.size);
    let enteredIndex = 0;
    const notes = bar.notes.map((item, index) => {
      if (!missing.has(index)) return item;
      const value = entered[enteredIndex++];
      const pitch = value && value !== "_" ? q3EnteredPitch2015(value) : "";
      return pitch ? { ...item, pitch, step: Q3_PITCH_STEPS[pitch] } : null;
    });
    const positions = positionResolver(bar);
    const groups = bar.beamGroups || q3BeamGroups(bar.notes);
    const points = [];
    let missingOrder = 0;
    notes.forEach((item, index) => {
      if (!item) {
        points[index] = null;
        if (missing.has(index)) missingOrder += 1;
        return;
      }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = "";
      if (missing.has(index)) {
        className = enteredAnswerClass;
        if (enteredReviewStatus) {
          const expectedPitch = q3EnteredPitch2015(expected[missingOrder]);
          className = item.pitch === expectedPitch ? "q3-answer-correct" : "q3-answer-incorrect";
        }
        missingOrder += 1;
      }
      points[index] = q3DrawNote(svg, item, positions[index], top, {
        beamed: Boolean(beam),
        down: beam?.down,
        forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null,
        className,
      });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beam = q3GetBeam(groupNotes, groupPositions, top);
      q3BeamPolygon(svg, beam);
      q3SecondarySegments(groupNotes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const x1 = q3GetStem(groupPositions[segment.start], q3YForStep(groupNotes[segment.start].step, top), groupNotes[segment.start].step, beam.down).stemX;
        const x2 = segment.hook ? x1 - Q3_STAFF.gap : q3GetStem(groupPositions[segment.end], q3YForStep(groupNotes[segment.end].step, top), groupNotes[segment.end].step, beam.down).stemX;
        q3BeamPolygon(svg, { start: { x: x1, y: q3BeamY(x1, beam) + offset }, end: { x: x2, y: q3BeamY(x2, beam) + offset } });
      });
    });
    if (enteredReviewStatus && enteredReviewStatus !== "correct") {
      Array.from(missing).forEach((noteIndex, index) => {
        const enteredPitch = entered[index] && entered[index] !== "_" ? q3EnteredPitch2015(entered[index]) : "";
        const expectedPitch = expected[index] ? q3EnteredPitch2015(expected[index]) : "";
        if (!expectedPitch || enteredPitch === expectedPitch) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], pitch: expectedPitch, step: Q3_PITCH_STEPS[expectedPitch] }, positions[noteIndex] + (enteredPitch ? 6 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    return points;
  }

  function q3Draw2016RhythmGuide(svg, bar, top) {
    const positions = q3BarPositions2016(bar);
    const guideTop = top - 58;
    const guideNotes = [note("A4", "crotchet"), note("A4", "dottedCrotchet"), note("A4", "quaver")];
    guideNotes.forEach((item, index) => q3DrawNote(svg, item, positions[index], guideTop));
  }

  function q3Add2016NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2016_Q3_BARS[14];
    const top = q3SystemTop2016(14);
    const positions = q3BarPositions2016(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 18;
    const targetRight = positions[indexes.at(-1)] + 18;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    function noteFromEvent(event, lockedIndex = null) {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = step === 4 ? "Bb4" : Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    }
    function showPreview(item, isDragging = false) {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, bar.notes[item.slot].rhythm), positions[item.slot], top, {
        opacity: isDragging ? .72 : .48,
        scale: isDragging ? 1.6 : 1,
      });
      svg.append(previewGroup);
      svg.append(target);
    }
    function currentNotes() {
      const questionCard = svg.closest(".question-card");
      const value = questionCard?.dataset.q3CurrentNoteValue ?? String(answers.q3f || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    }
    function commitNote(item) {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    function removeNote(event) {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) {
        for (let candidate = current.length - 1; candidate >= 0; candidate -= 1) {
          if (current[candidate] && current[candidate] !== "_") { index = candidate; break; }
        }
      }
      if (index < 0 || !current[index] || current[index] === "_") return;
      current[index] = "_";
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      commitNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", "Missing notes in bar 15. Double-click, double-tap or right-click a note to remove it.");
    target.setAttribute("aria-keyshortcuts", "Shift+Delete");
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Add2022NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2022_Q3_BARS[12];
    const top = q3SystemTop2016(12);
    const positions = q3BarPositions2022(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 22;
    const targetRight = positions[indexes.at(-1)] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3e ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, bar.notes[item.slot].rhythm), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3e", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3e", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 13. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Draw2017BarNotes(svg, bar, top, answers, review = {}, question = null) {
    const positions = q3BarPositions(bar);
    const missing = new Set(bar.missingIndices || []);
    const correction = new Set(bar.rhythmCorrectionIndices || []);
    const enteredPitches = String(answers.q3f || "").split(",").slice(0, missing.size);
    const enteredRhythms = String(answers.q3d || "").split(",").slice(0, correction.size);
    const correctPitches = String(question?.subquestions?.find(item => item.id === "q3f")?.answer || "B4,A4").split(",");
    const correctRhythms = String(question?.subquestions?.find(item => item.id === "q3d")?.answer || "dottedCrotchet,quaver").split(",");
    let missingOrder = 0;
    let correctionOrder = 0;
    const notes = bar.notes.map((item, index) => {
      if (missing.has(index)) {
        const value = enteredPitches[missingOrder++];
        const pitch = value && value !== "_" ? q3EnteredPitch2015(value) : "";
        return pitch ? { ...item, pitch, step: Q3_PITCH_STEPS[pitch] } : null;
      }
      if (correction.has(index)) {
        const rhythm = enteredRhythms[correctionOrder++];
        return rhythm && rhythm !== "_" ? { ...item, rhythm, beats: Q3_RHYTHMS[rhythm]?.beats || item.beats } : item;
      }
      return item;
    });
    const groups = bar.beamGroups || q3BeamGroups(notes.filter(Boolean));
    const points = [];
    missingOrder = 0;
    correctionOrder = 0;
    notes.forEach((item, index) => {
      if (!item) {
        points[index] = null;
        if (missing.has(index)) missingOrder += 1;
        return;
      }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = "";
      if (missing.has(index)) {
        className = review.q3f === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review.q3f) ? "q3-answer-incorrect" : "";
        if (review.q3f) className = item.pitch === q3EnteredPitch2015(correctPitches[missingOrder]) ? "q3-answer-correct" : "q3-answer-incorrect";
        missingOrder += 1;
      }
      if (correction.has(index) && enteredRhythms[correctionOrder] && enteredRhythms[correctionOrder] !== "_") {
        className = review.q3d === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review.q3d) ? "q3-answer-incorrect" : "";
        if (review.q3d) className = item.rhythm === correctRhythms[correctionOrder] ? "q3-answer-correct" : "q3-answer-incorrect";
      }
      if (correction.has(index)) correctionOrder += 1;
      points[index] = q3DrawNote(svg, item, positions[index], top, {
        beamed: Boolean(beam), down: beam?.down,
        forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null,
        className,
      });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      q3BeamPolygon(svg, q3GetBeam(groupNotes, groupPositions, top));
    });
    notes.forEach((item, index) => {
      if (item?.tieToNext && points[index] && points[index + 1]) q3DrawTie(svg, points[index], points[index + 1]);
    });
    if (review.q3d && review.q3d !== "correct") {
      Array.from(correction).forEach((noteIndex, index) => {
        const entered = enteredRhythms[index];
        if (entered === correctRhythms[index]) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], rhythm: correctRhythms[index] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    if (review.q3f && review.q3f !== "correct") {
      Array.from(missing).forEach((noteIndex, index) => {
        const entered = enteredPitches[index] && enteredPitches[index] !== "_" ? q3EnteredPitch2015(enteredPitches[index]) : "";
        const expected = q3EnteredPitch2015(correctPitches[index]);
        if (entered === expected) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], pitch: expected, step: Q3_PITCH_STEPS[expected] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    return points;
  }

  function q3Add2017RhythmEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2017_Q3_BARS[1];
    const top = q3SystemTop(1);
    const positions = q3BarPositions(bar);
    const indexes = bar.rhythmCorrectionIndices;
    const questionCard = svg.closest(".question-card");

    function currentRhythms() {
      const currentValue = questionCard?.dataset.q3CurrentRhythmValue ?? String(answers.q3d || "");
      const current = currentValue.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    }
    function saveRhythms(current) {
      const nextValue = current.every(value => !value || value === "_") ? "" : current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentRhythmValue = nextValue;
      onAnswerChange("q3d", nextValue);
    }

    indexes.forEach((noteIndex, order) => {
      let preview = null;
      const placedRhythm = currentRhythms()[order];
      const showPreview = () => {
        if (!q3RhythmToolArmed || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, { ...bar.notes[noteIndex], rhythm: q3RhythmToolArmed }, positions[noteIndex], top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      const hidePreview = () => {
        preview?.remove();
        preview = null;
      };
      const target = svgElement("rect", {
        x: positions[noteIndex] - 22,
        y: top - 31,
        width: 44,
        height: 100,
        class: "q3-rhythm-hit-area",
        role: "button",
        tabindex: q3RhythmToolArmed || (placedRhythm && placedRhythm !== "_") ? "0" : "-1",
        "aria-disabled": String(!q3RhythmToolArmed && (!placedRhythm || placedRhythm === "_")),
        "aria-label": `Rhythm correction for note ${order + 3} in bar 2`,
      });
      if (placedRhythm && placedRhythm !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-label", `${placedRhythm === "dottedCrotchet" ? "Dot" : "Quaver tail"} applied to note ${order + 3} in bar 2. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeRhythm = event => {
        if (!q3RhythmToolArmed) return;
        event.preventDefault();
        hidePreview();
        const current = currentRhythms();
        current[order] = q3RhythmToolArmed;
        saveRhythms(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeRhythm);
      target.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) placeRhythm(event);
      });
      bindRemovalGesture(target, () => {
        const current = currentRhythms();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        saveRhythms(current);
      });
      svg.append(target);
    });
  }

  function q3Add2017NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2017_Q3_BARS[4];
    const top = q3SystemTop(4);
    const positions = q3BarPositions(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 22;
    const targetRight = positions[indexes.at(-1)] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;

    function noteFromEvent(event, lockedIndex = null) {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    }
    function showPreview(item, isDragging = false) {
      previewGroup?.remove();
      previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, "quaver"), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    }
    function currentNotes() {
      const questionCard = svg.closest(".question-card");
      const value = questionCard?.dataset.q3CurrentNoteValue ?? String(answers.q3f || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    }
    function commitNote(item) {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    function removeNote(event) {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) {
        for (let candidate = current.length - 1; candidate >= 0; candidate -= 1) {
          if (current[candidate] && current[candidate] !== "_") { index = candidate; break; }
        }
      }
      if (index < 0 || !current[index] || current[index] === "_") return;
      current[index] = "_";
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3f", nextValue);
    }
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      commitNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    target.setAttribute("tabindex", "0");
    target.setAttribute("role", "button");
    target.setAttribute("aria-label", "Missing notes in bar 5. Double-click, double-tap or right-click a note to remove it.");
    target.setAttribute("aria-keyshortcuts", "Shift+Delete");
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3ScoreSvg2017(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 540", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3bCorrection = review.q3b && review.q3b !== "correct";
    const drawnPoints = [];

    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "sharpKeySignature", Q3_STAFF.left + 54, q3YForStep(8, top));
      if (systemIndex === 0) {
        const timeSignatureOffset = -24;
        q3DrawTimeSignature(svg, answers.q3b, top, answerClass("q3b"), timeSignatureOffset + (q3bCorrection && answers.q3b ? -18 : 0));
        if (q3bCorrection) q3DrawTimeSignature(svg, correctAnswer("q3b", "4/4"), top, "q3-answer-correction", timeSignatureOffset + (answers.q3b ? -2 : 0));
        q3DrawNote(svg, note("D4", "quaver"), q3BarStart(0) - 24, top);
        svg.append(svgElement("line", { x1: q3BarStart(0) - 5, x2: q3BarStart(0) - 5, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2017_Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        const positions = q3BarPositions(item);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        drawnPoints[barIndex] = q3Draw2017BarNotes(svg, item, top, answers, review, question);
        if (barIndex === 1) {
          svg.append(svgElement("rect", { x: positions[2] - 35, y: top - 31, width: positions[3] - positions[2] + 70, height: 100, class: "q3-marking-box" }));
          q3Text(svg, "Rhythm", { x: positions[2] - 22, y: top - 10, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 2) {
          svg.append(svgElement("rect", { x: positions[1] - 22, y: top - 31, width: 44, height: 94, class: "q3-marking-box" }));
          q3Text(svg, "X", { x: positions[1], y: top - 10, "text-anchor": "middle" }, "q3-note-label");
        }
        if (barIndex === 4) {
          svg.append(svgElement("rect", { x: positions[3] - 32, y: top - 51, width: positions[4] - positions[3] + 64, height: 120, class: "q3-marking-box" }));
          q3Text(svg, "Notes", { x: positions[3] - 19, y: top - 30, "text-anchor": "start" }, "q3-marking-box-label");
        }
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });
    const tempoX = q3BarStart(0) - 53;
    const tempoY = q3SystemTop(0) - 34;
    if (answers.q3c) {
      q3Text(svg, answers.q3c, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3c")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 118, height: 34 }, "Tempo marking", () => onAnswerChange("q3c", ""));
    }
    if (review.q3c && review.q3c !== "correct") {
      q3Text(svg, correctAnswer("q3c", "Adagio"), { x: tempoX + (answers.q3c ? 112 : 0), y: tempoY, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");
    }
    if (answers.q3b && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 136, y: 49, width: 40, height: 68 }, "Time signature", () => onAnswerChange("q3b", ""));
    q3Add2017RhythmEntryTargets(svg, answers, onAnswerChange);
    q3Add2017NoteEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3Draw2018BarNotes(svg, bar, top, answers, review = {}, question = null) {
    const positions = q3BarPositions2016(bar);
    const missing = new Set(bar.missingIndices || []);
    const correction = new Set(bar.rhythmCorrectionIndices || []);
    const enteredPitches = String(answers.q3f || "").split(",").slice(0, missing.size);
    const enteredRhythms = String(answers.q3c || "").split(",").slice(0, correction.size);
    const correctPitches = String(question?.subquestions?.find(item => item.id === "q3f")?.answer || "D5,C5").split(",");
    const correctRhythms = String(question?.subquestions?.find(item => item.id === "q3c")?.answer || "dottedCrotchet,quaver").split(",");
    let missingOrder = 0;
    let correctionOrder = 0;
    const notes = bar.notes.map((item, index) => {
      if (missing.has(index)) {
        const value = enteredPitches[missingOrder++];
        const pitch = value && value !== "_" ? q3EnteredPitch2015(value) : "";
        return pitch ? { ...item, pitch, step: Q3_PITCH_STEPS[pitch] } : null;
      }
      if (correction.has(index)) {
        const rhythm = enteredRhythms[correctionOrder++];
        return rhythm && rhythm !== "_" ? { ...item, rhythm, beats: Q3_RHYTHMS[rhythm]?.beats || item.beats } : item;
      }
      return item;
    });
    const groups = bar.beamGroups || q3BeamGroups(bar.notes);
    const points = [];
    missingOrder = 0;
    correctionOrder = 0;
    notes.forEach((item, index) => {
      if (!item) {
        points[index] = null;
        if (missing.has(index)) missingOrder += 1;
        return;
      }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = "";
      if (missing.has(index)) {
        if (review.q3f) className = item.pitch === q3EnteredPitch2015(correctPitches[missingOrder]) ? "q3-answer-correct" : "q3-answer-incorrect";
        missingOrder += 1;
      }
      if (correction.has(index) && enteredRhythms[correctionOrder] && enteredRhythms[correctionOrder] !== "_") {
        if (review.q3c) className = item.rhythm === correctRhythms[correctionOrder] ? "q3-answer-correct" : "q3-answer-incorrect";
      }
      if (correction.has(index)) correctionOrder += 1;
      points[index] = q3DrawNote(svg, item, positions[index], top, {
        beamed: Boolean(beam),
        down: beam?.down,
        forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null,
        className,
      });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      q3BeamPolygon(svg, q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top));
    });
    if (review.q3c && review.q3c !== "correct") {
      Array.from(correction).forEach((noteIndex, index) => {
        const entered = enteredRhythms[index];
        if (entered === correctRhythms[index]) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], rhythm: correctRhythms[index] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    if (review.q3f && review.q3f !== "correct") {
      Array.from(missing).forEach((noteIndex, index) => {
        const entered = enteredPitches[index] && enteredPitches[index] !== "_" ? q3EnteredPitch2015(enteredPitches[index]) : "";
        const expected = q3EnteredPitch2015(correctPitches[index]);
        if (entered === expected) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], pitch: expected, step: Q3_PITCH_STEPS[expected] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    return points;
  }

  function q3Draw2019BarNotes(svg, bar, top, answers, review = {}, question = null) {
    const positions = q3BarPositions2019(bar);
    const missing = new Set(bar.missingIndices || []);
    const correction = new Set(bar.rhythmCorrectionIndices || []);
    const enteredPitches = String(answers.q3d || "").split(",").slice(0, missing.size);
    const enteredRhythms = String(answers.q3e || "").split(",").slice(0, correction.size);
    const correctPitches = String(question?.subquestions?.find(item => item.id === "q3d")?.answer || "D5,B4,G4").split(",");
    const correctRhythms = String(question?.subquestions?.find(item => item.id === "q3e")?.answer || "semiquaver,semiquaver,semiquaver,semiquaver").split(",");
    let missingOrder = 0;
    let correctionOrder = 0;
    const notes = bar.notes.map((item, index) => {
      if (missing.has(index)) {
        const value = enteredPitches[missingOrder++];
        const pitch = value && value !== "_" ? q3EnteredPitch2015(value) : "";
        return pitch ? { ...item, pitch, step: Q3_PITCH_STEPS[pitch] } : null;
      }
      if (correction.has(index)) {
        const rhythm = enteredRhythms[correctionOrder++];
        return rhythm && rhythm !== "_" ? { ...item, rhythm, beats: Q3_RHYTHMS[rhythm]?.beats || item.beats } : item;
      }
      return item;
    });
    const groups = bar.rhythmCorrectionIndices
      ? [
        { start: 0, end: 3 }, { start: 4, end: 7 },
        ...q3BeamGroups(notes.slice(8)).map(group => ({ start: group.start + 8, end: group.end + 8 })),
      ]
      : bar.beamGroups || q3BeamGroups(notes);
    const points = [];
    missingOrder = 0;
    correctionOrder = 0;
    notes.forEach((item, index) => {
      if (!item) {
        points[index] = null;
        if (missing.has(index)) missingOrder += 1;
        return;
      }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = notes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      let className = "";
      if (missing.has(index)) {
        if (review.q3d) className = item.pitch === q3EnteredPitch2015(correctPitches[missingOrder]) ? "q3-answer-correct" : "q3-answer-incorrect";
        missingOrder += 1;
      }
      if (correction.has(index) && enteredRhythms[correctionOrder] && enteredRhythms[correctionOrder] !== "_") {
        if (review.q3e) className = item.rhythm === correctRhythms[correctionOrder] ? "q3-answer-correct" : "q3-answer-incorrect";
      }
      if (correction.has(index)) correctionOrder += 1;
      points[index] = q3DrawNote(svg, item, positions[index], top, {
        beamed: Boolean(beam),
        down: beam?.down,
        forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null,
        className,
      });
    });
    groups.forEach(group => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beam = q3GetBeam(groupNotes, groupPositions, top);
      q3BeamPolygon(svg, beam);
      q3SecondarySegments(groupNotes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const lift = beam.down ? 2 : -2;
        const stemX = localIndex => q3GetStem(groupPositions[localIndex], q3YForStep(groupNotes[localIndex].step, top), groupNotes[localIndex].step, beam.down).stemX;
        const x1 = stemX(segment.start);
        const x2 = segment.hook ? x1 + (segment.start > 0 ? -(Q3_STAFF.gap * .9 + 2) : Q3_STAFF.gap * .9 + 2) : stemX(segment.end);
        q3BeamPolygon(svg, { start: { x: x1, y: q3BeamY(x1, beam) + offset + lift }, end: { x: x2, y: q3BeamY(x2, beam) + offset + lift } });
      });
    });
    if (review.q3e && review.q3e !== "correct") {
      Array.from(correction).forEach((noteIndex, index) => {
        const entered = enteredRhythms[index];
        if (entered === correctRhythms[index]) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], rhythm: correctRhythms[index] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    if (review.q3d && review.q3d !== "correct") {
      Array.from(missing).forEach((noteIndex, index) => {
        const entered = enteredPitches[index] && enteredPitches[index] !== "_" ? q3EnteredPitch2015(enteredPitches[index]) : "";
        const expected = q3EnteredPitch2015(correctPitches[index]);
        if (entered === expected) return;
        q3DrawNote(svg, { ...bar.notes[noteIndex], pitch: expected, step: Q3_PITCH_STEPS[expected] }, positions[noteIndex] + (entered ? 7 : 0), top, { className: "q3-answer-correction", opacity: .9 });
      });
    }
    return points;
  }

  function q3Draw2019RhythmGuide(svg, bar, top) {
    const positions = q3BarPositions2019(bar);
    const indexes = bar.missingIndices || [];
    const guideTop = top - 53;
    const guideScale = .8;
    const guideCentreX = positions[indexes[1]] + 10;
    const guide = svgElement("g", { transform: `translate(${guideCentreX} ${top}) scale(${guideScale}) translate(${-guideCentreX} ${-top})` });
    svg.append(guide);
    const guideNotes = [note("A4", "dottedQuaver"), note("A4", "semiquaver"), note("A4", "crotchet")];
    const pair = guideNotes.slice(0, 2);
    const pairPositions = indexes.slice(0, 2).map(index => positions[index] + 10);
    const beam = q3GetBeam(pair, pairPositions, guideTop);
    pair.forEach((item, index) => {
      const stem = q3GetStem(pairPositions[index], q3YForStep(item.step, guideTop), item.step, beam.down);
      q3DrawNote(guide, item, pairPositions[index], guideTop, { beamed: true, down: beam.down, forcedEndY: q3BeamY(stem.stemX, beam) });
    });
    q3BeamPolygon(guide, beam);
    q3SecondarySegments(pair).forEach(segment => {
      const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
      const x1 = q3GetStem(pairPositions[segment.start], q3YForStep(pair[segment.start].step, guideTop), pair[segment.start].step, beam.down).stemX;
      const x2 = segment.hook ? x1 - Q3_STAFF.gap : q3GetStem(pairPositions[segment.end], q3YForStep(pair[segment.end].step, guideTop), pair[segment.end].step, beam.down).stemX;
      q3BeamPolygon(guide, { start: { x: x1, y: q3BeamY(x1, beam) + offset }, end: { x: x2, y: q3BeamY(x2, beam) + offset } });
    });
    q3DrawNote(guide, guideNotes[2], positions[indexes[2]] + 10, guideTop);
  }

  function q3Add2018RhythmEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2018_Q3_BARS[1];
    const top = q3SystemTop2016(1);
    const positions = q3BarPositions2016(bar);
    const indexes = bar.rhythmCorrectionIndices;
    const questionCard = svg.closest(".question-card");
    const currentRhythms = () => {
      const current = String(questionCard?.dataset.q3CurrentRhythmValue ?? answers.q3c ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    };
    const saveRhythms = current => {
      const value = current.every(item => !item || item === "_") ? "" : current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentRhythmValue = value;
      onAnswerChange("q3c", value);
    };
    indexes.forEach((noteIndex, order) => {
      let preview = null;
      const placedRhythm = currentRhythms()[order];
      const target = svgElement("rect", {
        x: positions[noteIndex] - 22, y: top - 31, width: 44, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: q3RhythmToolArmed || (placedRhythm && placedRhythm !== "_") ? "0" : "-1",
        "aria-disabled": String(!q3RhythmToolArmed && (!placedRhythm || placedRhythm === "_")),
        "aria-label": `Rhythm correction for note ${order + 3} in bar 2`,
      });
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!q3RhythmToolArmed || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, { ...bar.notes[noteIndex], rhythm: q3RhythmToolArmed }, positions[noteIndex], top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      if (placedRhythm && placedRhythm !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-label", `${placedRhythm === "dottedCrotchet" ? "Dot" : "Quaver tail"} applied in bar 2. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeRhythm = event => {
        if (!q3RhythmToolArmed) return;
        event.preventDefault();
        hidePreview();
        const current = currentRhythms();
        current[order] = q3RhythmToolArmed;
        saveRhythms(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeRhythm);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) placeRhythm(event); });
      bindRemovalGesture(target, () => {
        const current = currentRhythms();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        saveRhythms(current);
      });
      svg.append(target);
    });
  }

  function q3BarLabelPlacement2018(barIndex) {
    return { x: q3BarStart2016(barIndex) + Math.min(28, q3BarWidth2016(barIndex) * .22), y: q3SystemTop2016(barIndex) - 19 };
  }

  function q3Add2018BarLabelTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    N5_2018_Q3_BARS.forEach((bar, barIndex) => {
      const top = q3SystemTop2016(barIndex);
      const start = q3BarStart2016(barIndex);
      let preview = null;
      const target = svgElement("rect", {
        x: start, y: top - 48, width: q3BarWidth2016(barIndex), height: 39,
        class: "q3-bar-label-hit-area", role: "button", tabindex: q3BarLabelArmed ? "0" : "-1",
        "aria-disabled": String(!q3BarLabelArmed), "aria-label": `Place D above bar ${barIndex + 1}`,
      });
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!q3BarLabelArmed || preview) return;
        const placement = q3BarLabelPlacement2018(barIndex);
        preview = q3Text(svg, "D", { x: placement.x, y: placement.y, "text-anchor": "middle", opacity: .35 }, "q3-note-label q3-bar-label-preview");
      };
      const placedHere = answers.q3e === `bar-${barIndex + 1}`;
      if (placedHere) {
        target.dataset.barLabelPlaced = "true";
        target.setAttribute("tabindex", "0");
        target.setAttribute("aria-disabled", "false");
        target.setAttribute("aria-label", `D above bar ${barIndex + 1}. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeLabel = event => {
        if (!q3BarLabelArmed) return;
        event.preventDefault();
        hidePreview();
        q3SetBarLabelToolArmed(false, svg);
        onAnswerChange("q3e", `bar-${barIndex + 1}`);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeLabel);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) placeLabel(event); });
      bindRemovalGesture(target, () => {
        if (!placedHere) return;
        hidePreview();
        q3SetBarLabelToolArmed(false, svg);
        onAnswerChange("q3e", "");
      });
      svg.append(target);
    });
  }

  function q3Add2018NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2018_Q3_BARS[10];
    const top = q3SystemTop2016(10);
    const positions = q3BarPositions2016(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 22;
    const targetRight = positions[indexes.at(-1)] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;
    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3f ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove(); previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, "crotchet"), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3f", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3f", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 11. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3Add2019RhythmEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2019_Q3_BARS[6];
    const top = q3SystemTop2019(6);
    const positions = q3BarPositions2019(bar);
    const indexes = bar.rhythmCorrectionIndices;
    const questionCard = svg.closest(".question-card");
    const currentRhythms = () => {
      const current = String(questionCard?.dataset.q3CurrentRhythmValue ?? answers.q3e ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    };
    const saveRhythms = current => {
      const value = current.every(item => !item || item === "_") ? "" : current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentRhythmValue = value;
      onAnswerChange("q3e", value);
    };
    indexes.forEach((noteIndex, order) => {
      let preview = null;
      const placedRhythm = currentRhythms()[order];
      const target = svgElement("rect", {
        x: positions[noteIndex] - 18, y: top - 31, width: 36, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: q3RhythmToolArmed || (placedRhythm && placedRhythm !== "_") ? "0" : "-1",
        "aria-disabled": String(!q3RhythmToolArmed && (!placedRhythm || placedRhythm === "_")),
        "aria-label": `Rhythm correction for note ${order + 1} in bar 7`,
      });
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!q3RhythmToolArmed || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, { ...bar.notes[noteIndex], rhythm: q3RhythmToolArmed }, positions[noteIndex], top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      if (placedRhythm && placedRhythm !== "_") {
        target.dataset.rhythmPlaced = "true";
        const appliedName = placedRhythm === "dottedCrotchet" ? "Dot" : placedRhythm === "quaver" ? "Quaver tail" : "Semiquaver";
        target.setAttribute("aria-label", `${appliedName} applied to note ${order + 1} in bar 7. Double-click, double-tap or right-click to remove it.`);
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const placeRhythm = event => {
        if (!q3RhythmToolArmed) return;
        event.preventDefault();
        hidePreview();
        const current = currentRhythms();
        current[order] = q3RhythmToolArmed;
        saveRhythms(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeRhythm);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) placeRhythm(event); });
      bindRemovalGesture(target, () => {
        const current = currentRhythms();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        saveRhythms(current);
      });
      svg.append(target);
    });
  }

  function q3Add2019NoteEntryTargets(svg, answers, onAnswerChange) {
    if (!onAnswerChange) return;
    const bar = N5_2019_Q3_BARS[3];
    const top = q3SystemTop2019(3);
    const positions = q3BarPositions2019(bar);
    const indexes = bar.missingIndices;
    const targetLeft = positions[indexes[0]] - 22;
    const targetRight = positions[indexes.at(-1)] + 22;
    const targetTop = q3YForStep(10, top) - Q3_STAFF.gap * 2.5;
    const targetBottom = q3YForStep(-2, top) + Q3_STAFF.gap * 2.5;
    let dragging = null;
    let previewGroup = null;
    const noteFromEvent = (event, lockedIndex = null) => {
      const local = q3LocalPoint(svg, event);
      const slot = lockedIndex ?? indexes.reduce((closest, index) => Math.abs(local.x - positions[index]) < Math.abs(local.x - positions[closest]) ? index : closest, indexes[0]);
      if (local.x < targetLeft || local.x > targetRight || local.y < targetTop || local.y > targetBottom) return null;
      const step = Math.max(-2, Math.min(10, Math.round((top + Q3_STAFF.gap * 4 - local.y) / (Q3_STAFF.gap / 2))));
      const pitch = Q3_PITCH_BY_STEP[step];
      return pitch ? { slot, pitch } : null;
    };
    const currentNotes = () => {
      const questionCard = svg.closest(".question-card");
      const current = String(questionCard?.dataset.q3CurrentNoteValue ?? answers.q3d ?? "").split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return { questionCard, current };
    };
    const showPreview = (item, isDragging = false) => {
      previewGroup?.remove(); previewGroup = null;
      if (!item) return;
      previewGroup = svgElement("g", { class: `q3-note-preview ${isDragging ? "is-dragging" : ""}` });
      q3DrawNote(previewGroup, note(item.pitch, bar.notes[item.slot].rhythm), positions[item.slot], top, { opacity: isDragging ? .72 : .48, scale: isDragging ? 1.6 : 1 });
      svg.append(previewGroup);
      svg.append(target);
    };
    const saveNote = item => {
      if (!item) return;
      const { questionCard, current } = currentNotes();
      current[indexes.indexOf(item.slot)] = item.pitch;
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3d", value);
    };
    const removeNote = event => {
      const { questionCard, current } = currentNotes();
      const item = Number.isFinite(pointerEventCoordinates(event)?.clientX) ? noteFromEvent(pointerEventCoordinates(event)) : null;
      let index = item ? indexes.indexOf(item.slot) : -1;
      if (index < 0) index = current.findLastIndex(value => value && value !== "_");
      if (index < 0) return;
      current[index] = "_";
      const value = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = value;
      onAnswerChange("q3d", value);
    };
    const target = svgElement("rect", { x: targetLeft, y: targetTop, width: targetRight - targetLeft, height: targetBottom - targetTop, class: "q3-note-hit-area", tabindex: "0", role: "button", "aria-label": "Missing notes in bar 4. Double-click, double-tap or right-click a note to remove it.", "aria-keyshortcuts": "Shift+Delete" });
    target.addEventListener("pointermove", event => showPreview(noteFromEvent(event, dragging?.slot ?? null), Boolean(dragging)));
    target.addEventListener("pointerleave", () => { if (!dragging) showPreview(null); });
    target.addEventListener("pointerdown", event => {
      const next = noteFromEvent(event);
      if (!next) return;
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      dragging = next;
      showPreview(next, true);
    });
    target.addEventListener("pointerup", event => {
      if (!dragging) return;
      event.preventDefault();
      target.releasePointerCapture?.(event.pointerId);
      const finalNote = noteFromEvent(event, dragging.slot) || dragging;
      dragging = null;
      showPreview(null);
      saveNote(finalNote);
    });
    target.addEventListener("pointercancel", () => { dragging = null; showPreview(null); });
    bindRemovalGesture(target, removeNote);
    svg.append(target);
  }

  function q3ScoreSvg2019(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 620", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3bCorrection = review.q3b && review.q3b !== "correct";
    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2019(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "sharpKeySignature", Q3_STAFF.left + 54, q3YForStep(8, top));
      if (systemIndex === 0) {
        const timeSignatureOffset = -24;
        q3DrawTimeSignature(svg, answers.q3b, top, answerClass("q3b"), timeSignatureOffset + (q3bCorrection && answers.q3b ? -18 : 0));
        if (q3bCorrection) q3DrawTimeSignature(svg, correctAnswer("q3b", "3/4"), top, "q3-answer-correction", timeSignatureOffset + (answers.q3b ? -2 : 0));
      }
      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2019_Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        const positions = q3BarPositions2019(item);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3Draw2019BarNotes(svg, item, top, answers, review, question);
        if (barIndex === 0) {
          svg.append(svgElement("rect", { x: positions[0] - 22, y: top - 39, width: 44, height: 94, class: "q3-marking-box" }));
          q3Text(svg, "X", { x: positions[0], y: top - 17, "text-anchor": "middle" }, "q3-note-label");
        }
        if (barIndex === 3) {
          const boxLeft = positions[0] - 25;
          const boxRight = positions[2] + 25;
          svg.append(svgElement("rect", { x: boxLeft, y: top - 62, width: boxRight - boxLeft, height: 120, class: "q3-marking-box" }));
          q3Text(svg, "Notes", { x: boxLeft + 12, y: top - 41, "text-anchor": "start" }, "q3-marking-box-label");
          q3Draw2019RhythmGuide(svg, item, top);
        }
        if (barIndex === 6) {
          const left = positions[8] - 25;
          svg.append(svgElement("rect", { x: left, y: top - 53, width: positions[11] - positions[8] + 50, height: 145, class: "q3-marking-box" }));
          q3Text(svg, "Rhythm", { x: left + 13, y: top - 31, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === N5_2019_Q3_BARS.length - 1) {
          svg.append(svgElement("line", { x1: end - 7, x2: end - 7, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thin" }));
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thick" }));
        } else {
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });
    if (answers.q3b && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 166, y: 49, width: 40, height: 68 }, "Time signature", () => onAnswerChange("q3b", ""));
    q3Add2019NoteEntryTargets(svg, answers, onAnswerChange);
    q3Add2019RhythmEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg2022(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 570", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const drawnPoints = [];

    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * N5_2016_Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2016(firstBar);
      for (let line = 0; line < 5; line += 1) {
        svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      }
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      if (systemIndex === 0) q3DrawTimeSignature(svg, "4/4", top, "", 0, Q3_STAFF.left + 112);

      for (let local = 0; local < N5_2016_Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2022_Q3_BARS[barIndex];
        const start = q3BarStart2022(barIndex);
        const end = start + q3BarWidth2022(barIndex);
        const positions = q3BarPositions2022(item);
        if (barIndex > 0) q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        drawnPoints[barIndex] = q3Draw2016BarNotes(svg, item, top, barIndex === 12 ? answers.q3e : "", barIndex === 12 ? answerClass("q3e") : "", barIndex === 12 ? review.q3e : "", correctAnswer("q3e", "G4,G4"), q3BarPositions2022);
        item.notes.forEach((entry, noteIndex) => {
          if (entry?.tieToNext && drawnPoints[barIndex]?.[noteIndex] && drawnPoints[barIndex]?.[noteIndex + 1]) q3DrawTie(svg, drawnPoints[barIndex][noteIndex], drawnPoints[barIndex][noteIndex + 1]);
        });

        if (barIndex === 4) {
          const x = positions.at(-1);
          svg.append(svgElement("rect", { x: x - 15, y: top - 70, width: 40, height: 142, class: "q3-marking-box" }));
          q3Text(svg, "X", { x, y: top - 39, "text-anchor": "middle" }, "q3-note-label");
        }
        if (barIndex === 10) {
          const left = positions[0] - 30;
          const right = positions[1] + 30;
          svg.append(svgElement("rect", { x: left, y: top - 47, width: right - left, height: 117, class: "q3-marking-box" }));
          q3Text(svg, "Interval", { x: left + 12, y: top - 33, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 12) {
          const missing = item.missingIndices;
          const left = positions[missing[0]] - 24;
          const right = positions[missing.at(-1)] + 24;
          const boxWidth = (right - left) * .85;
          svg.append(svgElement("rect", { x: left + (right - left - boxWidth) / 2 + 5, y: top - 72, width: boxWidth, height: 148, class: "q3-marking-box" }));
          const guideTop = top - 52;
          q3DrawNote(svg, note("A4", "dottedCrotchet"), positions[missing[0]], guideTop);
          q3DrawNote(svg, note("A4", "quaver"), positions[missing[1]], guideTop);
        }
        if (barIndex === 15) {
          const left = start + 2;
          svg.append(svgElement("rect", { x: left, y: top - 57, width: end - left - 2, height: 133, class: "q3-marking-box" }));
          q3Text(svg, "Cadence", { x: left + 12, y: top - 38, "text-anchor": "start" }, "q3-marking-box-label");
        }
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });

    [[0, 1], [2, 3], [6, 7]].forEach(([from, to]) => {
      if (drawnPoints[from]?.at(-1) && drawnPoints[to]?.[0]) q3DrawTie(svg, drawnPoints[from].at(-1), drawnPoints[to][0]);
    });

    const printedDynamicX = q3BarPositions2022(N5_2022_Q3_BARS[0])[0];
    q3CalibratedSymbol(svg, "mezzoPiano", printedDynamicX, q3SystemTop2016(0) + Q3_STAFF.gap * 7.7);

    if (answers.q3a) {
      const tempoX = q3BarStart2022(0) + 14;
      const tempoY = q3SystemTop2016(0) - 27;
      q3Text(svg, answers.q3a, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3a")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 116, height: 34 }, "Tempo marking", () => onAnswerChange("q3a", ""));
    }
    if (review.q3a && review.q3a !== "correct") {
      q3Text(svg, correctAnswer("q3a", "Andante"), { x: q3BarStart2022(0) + 14 + (answers.q3a ? 116 : 0), y: q3SystemTop2016(0) - 27, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");
    }

    const dynamicKey = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[answers.q3c];
    const dynamicX = q3BarPositions2022(N5_2022_Q3_BARS[8])[0];
    const dynamicY = q3SystemTop2016(8) + Q3_STAFF.gap * 7.75;
    if (dynamicKey) {
      q3CalibratedSymbol(svg, dynamicKey, dynamicX, dynamicY, { className: answerClass("q3c") });
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: dynamicX - 25, y: dynamicY - 34, width: 50, height: 46 }, "Dynamic marking", () => onAnswerChange("q3c", ""));
    }
    if (review.q3c && review.q3c !== "correct") {
      const correctionKey = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[correctAnswer("q3c", "f")];
      if (correctionKey) q3CalibratedSymbol(svg, correctionKey, dynamicX + (answers.q3c ? 18 : 0), dynamicY, { className: "q3-answer-correction", opacity: .9 });
    }

    q3Add2022NoteEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg2023(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 700", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const drawnPoints = [];

    [0, 1, 2, 3, 4].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2023(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "flatKeySignature", Q3_STAFF.left + 54, q3YForStep(4, top));

      if (systemIndex === 0) {
        q3DrawTimeSignature(svg, "4/4", top, "", 0, Q3_STAFF.left + 105);
        const pickupX = [Q3_STAFF.left + 133, Q3_STAFF.left + 169];
        const pickupBeam = q3GetBeam(N5_2023_Q3_ANACRUSIS, pickupX, top);
        N5_2023_Q3_ANACRUSIS.forEach((item, index) => {
          const stem = q3GetStem(pickupX[index], q3YForStep(item.step, top), item.step, pickupBeam.down);
          q3DrawNote(svg, item, pickupX[index], top, { beamed: true, down: pickupBeam.down, forcedEndY: q3BeamY(stem.stemX, pickupBeam) });
        });
        q3BeamPolygon(svg, pickupBeam);
        q3CalibratedSymbol(svg, "repeatLeft", q3BarStart2023(0) - 32, q3YForStep(4, top) + 10);
      }

      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2023_Q3_BARS[barIndex];
        const start = q3BarStart2023(barIndex);
        const end = start + q3BarWidth2023(barIndex);
        const positions = q3BarPositions2023(item);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        drawnPoints[barIndex] = q3Draw2015BarNotes(svg, item, top, barIndex === 1 ? answers.q3c : "", barIndex === 1 ? answerClass("q3c") : "", barIndex === 1 ? review.q3c : "", correctAnswer("q3c", "A4,Bb4"), q3BarPositions2023);

        if (barIndex === 1) {
          const missing = item.missingIndices;
          const left = positions[missing[0]] - 30;
          const right = positions[missing.at(-1)] + 30;
          svg.append(svgElement("rect", { x: left, y: top - 50, width: right - left, height: 125, class: "q3-marking-box" }));
          q3Text(svg, "Notes", { x: left + 12, y: top - 37, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 2) {
          const x = positions[2];
          svg.append(svgElement("rect", { x: x - 38, y: top - 57, width: 76, height: 127, class: "q3-marking-box" }));
          q3Text(svg, "X", { x, y: top - 32, "text-anchor": "middle" }, "q3-note-label");
        }
        if (barIndex === 4) {
          const left = positions[0] - 28;
          const right = positions[1] + 28;
          svg.append(svgElement("rect", { x: left, y: top - 57, width: right - left, height: 127, class: "q3-marking-box" }));
          q3Text(svg, "Interval", { x: left + 12, y: top - 38, "text-anchor": "start" }, "q3-marking-box-label");
        }

        const placedRepeatHere = answers.q3f === `end-bar-${barIndex + 1}` && barIndex < 8;
        if (!placedRepeatHere && barIndex < 9) {
          const visibleEnd = q3VisibleBarEnd2023(barIndex);
          svg.append(svgElement("line", { x1: visibleEnd, x2: visibleEnd, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });

    [[6, 7], [8, 9]].forEach(([from, to]) => {
      if (drawnPoints[from]?.[0] && drawnPoints[to]?.[0]) q3DrawTie(svg, drawnPoints[from][0], drawnPoints[to][0], { widthScale: 2 });
    });

    [[6, 7, "1."], [8, 9, "2."]].forEach(([from, to, label]) => {
      const top = q3SystemTop2023(from);
      const left = q3BarStart2023(from) - 2;
      const right = q3BarStart2023(to) + q3BarWidth2023(to) - 4;
      const y = top - 47;
      svg.append(svgElement("path", { d: `M ${left} ${y + 18} V ${y} H ${right} V ${y + 18}`, class: "q3-interval-bracket" }));
      q3Text(svg, label, { x: left + 12, y: y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    });

    if (answers.q3b) {
      const tempoX = Q3_STAFF.left + 142;
      const tempoY = q3SystemTop2023(0) - 27;
      q3Text(svg, answers.q3b, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3b")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 116, height: 34 }, "Tempo marking", () => onAnswerChange("q3b", ""));
    }
    if (review.q3b && review.q3b !== "correct") q3Text(svg, correctAnswer("q3b", "Andante"), { x: Q3_STAFF.left + 142 + (answers.q3b ? 116 : 0), y: q3SystemTop2023(0) - 27, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");

    const repeatPlacement = barIndex => {
      const barlineX = q3BarStart2023(barIndex) + q3BarWidth2023(barIndex);
      return { x: barlineX - Q3_STAFF.gap * 1.1 + 7, y: q3YForStep(4, q3SystemTop2023(barIndex)) + 10 };
    };
    const repeatMatch = String(answers.q3f || "").match(/^end-bar-(\d+)$/);
    if (repeatMatch) {
      const barIndex = Math.max(0, Math.min(7, Number(repeatMatch[1]) - 1));
      const placement = repeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: answerClass("q3f") });
    }
    if (review.q3f && review.q3f !== "correct") {
      const correctMatch = String(correctAnswer("q3f", "end-bar-8")).match(/^end-bar-(\d+)$/);
      const barIndex = correctMatch ? Math.max(0, Math.min(7, Number(correctMatch[1]) - 1)) : 7;
      const placement = repeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: "q3-answer-correction", opacity: .9 });
    }

    q3Add2023NoteEntryTargets(svg, answers, onAnswerChange);
    q3AddRepeatTargets(svg, answers, onAnswerChange, {
      bars: N5_2023_Q3_BARS.slice(0, 8), answerId: "q3f", topFor: q3SystemTop2023,
      startFor: q3BarStart2023, widthFor: q3BarWidth2023, placementFor: repeatPlacement,
    });
    return svg;
  }

  function q3ScoreSvg2025(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 660", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;

    [0, 1, 2, 3, 4].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "flatKeySignature", Q3_STAFF.left + 54, q3YForStep(4, top));
      if (systemIndex === 0) q3DrawTimeSignature(svg, "4/4", top, "", 0, Q3_STAFF.left + 110);

      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2025_Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        const positions = q3BarPositions(item);
        if (barIndex > 0) q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3Draw2015BarNotes(svg, item, top, barIndex === 2 ? answers.q3c : "", barIndex === 2 ? answerClass("q3c") : "", barIndex === 2 ? review.q3c : "", correctAnswer("q3c", "F4,G4,A4"));

        if (barIndex === 2) {
          const missing = item.missingIndices;
          const left = positions[missing[0]] - 30;
          const right = positions[missing.at(-1)] + 30;
          svg.append(svgElement("rect", { x: left, y: top - 50, width: right - left, height: 125, class: "q3-marking-box" }));
          q3Text(svg, "(c) Notes", { x: left + 12, y: top - 32, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 5) {
          const left = positions[2] - 28;
          const right = positions[3] + 28;
          svg.append(svgElement("rect", { x: left, y: top - 47, width: right - left, height: 109, class: "q3-marking-box" }));
          q3Text(svg, "(d) Interval", { x: left + 12, y: top - 33, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 8) {
          const left = positions[3] - 28;
          const right = q3BarStart(9) + q3BarWidth(9) - 20;
          svg.append(svgElement("rect", { x: left, y: top - 52, width: right - left, height: 121, class: "q3-marking-box" }));
          q3Text(svg, "(f) Cadence", { x: left + 12, y: top - 28, "text-anchor": "start" }, "q3-marking-box-label");
        }

        const placedRepeatHere = answers.q3e === `end-bar-${barIndex + 1}` && barIndex < 8;
        if (barIndex === N5_2025_Q3_BARS.length - 1) {
          svg.append(svgElement("line", { x1: end - 7, x2: end - 7, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thin" }));
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thick" }));
        } else if (!placedRepeatHere) {
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });

    [[6, 7, "1."], [8, 8, "2."]].forEach(([from, to, label]) => {
      const top = q3SystemTop(from);
      const left = q3BarStart(from) - 2;
      const right = q3BarStart(to) + q3BarWidth(to) - 4;
      const y = top - 47;
      svg.append(svgElement("path", { d: `M ${left} ${y + 18} V ${y} H ${right} V ${y + 18}`, class: "q3-interval-bracket" }));
      q3Text(svg, label, { x: left + 12, y: y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    });

    if (answers.q3b) {
      const tempoX = q3BarStart(0) + 14;
      const tempoY = q3SystemTop(0) - 27;
      q3Text(svg, answers.q3b, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3b")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 116, height: 34 }, "Tempo marking", () => onAnswerChange("q3b", ""));
    }
    if (review.q3b && review.q3b !== "correct") q3Text(svg, correctAnswer("q3b", "Andante"), { x: q3BarStart(0) + 14 + (answers.q3b ? 116 : 0), y: q3SystemTop(0) - 27, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");

    const repeatPlacement = barIndex => {
      const barlineX = q3BarStart(barIndex) + q3BarWidth(barIndex);
      return { x: barlineX - Q3_STAFF.gap * 1.1 + 7, y: q3YForStep(4, q3SystemTop(barIndex)) + 10 };
    };
    const repeatMatch = String(answers.q3e || "").match(/^end-bar-(\d+)$/);
    if (repeatMatch) {
      const barIndex = Math.max(0, Math.min(7, Number(repeatMatch[1]) - 1));
      const placement = repeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: answerClass("q3e") });
    }
    if (review.q3e && review.q3e !== "correct") {
      const correctMatch = String(correctAnswer("q3e", "end-bar-8")).match(/^end-bar-(\d+)$/);
      const barIndex = correctMatch ? Math.max(0, Math.min(7, Number(correctMatch[1]) - 1)) : 7;
      const placement = repeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: "q3-answer-correction", opacity: .9 });
    }

    q3Add2025NoteEntryTargets(svg, answers, onAnswerChange);
    q3AddRepeatTargets(svg, answers, onAnswerChange, {
      bars: N5_2025_Q3_BARS.slice(0, 8), answerId: "q3e", topFor: q3SystemTop,
      startFor: q3BarStart, widthFor: q3BarWidth, placementFor: repeatPlacement,
    });
    return svg;
  }

  function q3ScoreSvg2024(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 600", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const timeCorrection = review.q3b && review.q3b !== "correct";

    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2024(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      if (systemIndex === 0) {
        const timeX = Q3_STAFF.left + 103;
        q3DrawTimeSignature(svg, answers.q3b, top, answerClass("q3b"), timeCorrection && answers.q3b ? -18 : 0, timeX);
        if (timeCorrection) q3DrawTimeSignature(svg, correctAnswer("q3b", "4/4"), top, "q3-answer-correction", answers.q3b ? -2 : 0, timeX);
      }

      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2024_Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        const positions = q3BarPositions(item);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3Draw2015BarNotes(svg, item, top, barIndex === 2 ? answers.q3d : "", barIndex === 2 ? answerClass("q3d") : "", barIndex === 2 ? review.q3d : "", correctAnswer("q3d", "E5,D5"));

        if (barIndex === 0) {
          const left = positions[0] - 23;
          const right = positions[2] + 30;
          svg.append(svgElement("rect", { x: left, y: top - 45, width: right - left, height: 107, class: "q3-marking-box" }));
          q3Text(svg, "Chord", { x: left + 12, y: top - 23, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 2) {
          const missing = item.missingIndices;
          const left = positions[missing[0]] - 30;
          const right = positions[missing.at(-1)] + 30;
          svg.append(svgElement("rect", { x: left, y: top - 72, width: right - left, height: 148, class: "q3-marking-box" }));
          q3Text(svg, "Notes", { x: left + 12, y: top - 49, "text-anchor": "start" }, "q3-marking-box-label");
          const guideTop = top - 42;
          const guideNotes = [note("A4", "quaver"), note("A4", "quaver")];
          const guideXs = missing.map(index => positions[index]);
          const guideCentreX = (guideXs[0] + guideXs[1]) / 2;
          const guide = svgElement("g", { transform: `translate(${guideCentreX} ${guideTop}) scale(.5) translate(${-guideCentreX} ${-guideTop})` });
          svg.append(guide);
          const beam = q3GetBeam(guideNotes, guideXs, guideTop);
          guideNotes.forEach((guideNote, index) => {
            const stem = q3GetStem(guideXs[index], q3YForStep(guideNote.step, guideTop), guideNote.step, beam.down);
            q3DrawNote(guide, guideNote, guideXs[index], guideTop, { beamed: true, down: beam.down, forcedEndY: q3BeamY(stem.stemX, beam) });
          });
          q3BeamPolygon(guide, beam);
        }
        if (barIndex === 5) {
          const x = positions[2];
          svg.append(svgElement("rect", { x: x - 28, y: top - 58, width: 56, height: 126, class: "q3-marking-box" }));
          q3Text(svg, "X", { x, y: top - 34, "text-anchor": "middle" }, "q3-note-label");
        }

        if (barIndex === N5_2024_Q3_BARS.length - 1) {
          svg.append(svgElement("line", { x1: end - 7, x2: end - 7, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thin" }));
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thick" }));
        } else {
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });

    const printedDynamicX = q3BarPositions(N5_2024_Q3_BARS[0])[0];
    q3CalibratedSymbol(svg, "mezzoForte", printedDynamicX, q3SystemTop2024(0) + Q3_STAFF.gap * 7.6);

    const wedgeTop = q3SystemTop2024(6);
    const wedgeLeft = q3BarPositions(N5_2024_Q3_BARS[6])[0];
    const wedgeRight = q3BarPositions(N5_2024_Q3_BARS[6]).at(-1) + 20;
    const wedgeY = wedgeTop + Q3_STAFF.gap * 7.7;
    svg.append(svgElement("line", { x1: wedgeLeft, x2: wedgeRight, y1: wedgeY - 7, y2: wedgeY, class: "q3-hairpin" }));
    svg.append(svgElement("line", { x1: wedgeLeft, x2: wedgeRight, y1: wedgeY + 7, y2: wedgeY, class: "q3-hairpin" }));

    if (answers.q3a) {
      const tempoX = q3BarStart(0) + 14;
      const tempoY = q3SystemTop2024(0) - 48;
      q3Text(svg, answers.q3a, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3a")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 116, height: 34 }, "Tempo marking", () => onAnswerChange("q3a", ""));
    }
    if (review.q3a && review.q3a !== "correct") q3Text(svg, correctAnswer("q3a", "Andante"), { x: q3BarStart(0) + 14 + (answers.q3a ? 116 : 0), y: q3SystemTop2024(0) - 48, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");

    if (answers.q3b && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: Q3_STAFF.left + 80, y: q3SystemTop2024(0) - 18, width: 46, height: 78 }, "Time signature", () => onAnswerChange("q3b", ""));

    const dynamicSymbols = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", sfz: "sforzato" };
    const dynamicX = q3BarPositions(N5_2024_Q3_BARS[7])[0];
    const dynamicY = q3SystemTop2024(7) + Q3_STAFF.gap * 7.8;
    const dynamicKey = dynamicSymbols[answers.q3f];
    if (dynamicKey) {
      q3CalibratedSymbol(svg, dynamicKey, dynamicX, dynamicY, { className: answerClass("q3f") });
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: dynamicX - 27, y: dynamicY - 35, width: 54, height: 47 }, "Dynamic marking", () => onAnswerChange("q3f", ""));
    }
    if (review.q3f && review.q3f !== "correct") {
      const correctionKey = dynamicSymbols[correctAnswer("q3f", "mp")];
      if (correctionKey) q3CalibratedSymbol(svg, correctionKey, dynamicX + (answers.q3f ? 20 : 0), dynamicY, { className: "q3-answer-correction", opacity: .9 });
    }

    q3Add2024NoteEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg2018(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 560", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3bCorrection = review.q3b && review.q3b !== "correct";
    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * N5_2016_Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2016(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      if (systemIndex === 0) {
        q3DrawTimeSignature(svg, answers.q3b, top, answerClass("q3b"), q3bCorrection && answers.q3b ? -18 : 0);
        if (q3bCorrection) q3DrawTimeSignature(svg, correctAnswer("q3b", "4/4"), top, "q3-answer-correction", answers.q3b ? -2 : 0);
      }
      for (let local = 0; local < N5_2016_Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2018_Q3_BARS[barIndex];
        const start = q3BarStart2016(barIndex);
        const end = start + q3BarWidth2016(barIndex);
        const positions = q3BarPositions2016(item);
        if (barIndex > 0) q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3Draw2018BarNotes(svg, item, top, answers, review, question);
        if (barIndex === 1) {
          svg.append(svgElement("rect", { x: start + 2, y: top - 31, width: end - start - 4, height: 100, class: "q3-marking-box" }));
          q3Text(svg, "Rhythm", { x: start + 14, y: top - 10, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 10) {
          svg.append(svgElement("rect", { x: positions[2] - 31, y: top - 48, width: positions[3] - positions[2] + 62, height: 116, class: "q3-marking-box" }));
          q3Text(svg, "Notes", { x: positions[2] - 18, y: top - 28, "text-anchor": "start" }, "q3-marking-box-label");
        }
        if (barIndex === 15) {
          svg.append(svgElement("line", { x1: end - 7, x2: end - 7, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thin" }));
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thick" }));
        } else {
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });
    svg.append(svgElement("rect", { x: Q3_STAFF.left + 8, y: 8, width: 165, height: 42, class: "q3-marking-box" }));
    q3Text(svg, "Two bar introduction.", { x: Q3_STAFF.left + 90.5, y: 35, "text-anchor": "middle" }, "q3-marking-box-label q3-introduction-label");
    const cadenceTop = q3SystemTop2016(6);
    const cadenceStart = q3BarStart2016(6) + 30;
    const cadenceBoxTop = cadenceTop - 76;
    svg.append(svgElement("rect", { x: cadenceStart, y: cadenceBoxTop, width: q3BarWidth2016(6) + q3BarWidth2016(7) - 60, height: 58, class: "q3-marking-box" }));
    q3Text(svg, "Cadence:", { x: cadenceStart + 12, y: cadenceBoxTop + 21, "text-anchor": "start" }, "q3-marking-box-label");
    svg.append(svgElement("line", { x1: cadenceStart + 18, x2: cadenceStart + q3BarWidth2016(6) + q3BarWidth2016(7) - 78, y1: cadenceBoxTop + 46, y2: cadenceBoxTop + 46, class: "q3-answer-line" }));
    if (answers.q3e) {
      const barIndex = Math.max(0, Number(String(answers.q3e).replace("bar-", "")) - 1);
      const placement = q3BarLabelPlacement2018(barIndex);
      q3Text(svg, "D", { x: placement.x, y: placement.y, "text-anchor": "middle" }, `q3-note-label ${answerClass("q3e")}`.trim());
    }
    if (review.q3e && review.q3e !== "correct") {
      const barIndex = Math.max(0, Number(String(correctAnswer("q3e", "bar-9")).replace("bar-", "")) - 1);
      const placement = q3BarLabelPlacement2018(barIndex);
      q3Text(svg, "D", { x: placement.x + (answers.q3e === correctAnswer("q3e", "bar-9") ? 0 : 12), y: placement.y, "text-anchor": "middle" }, "q3-note-label q3-answer-correction");
    }
    if (answers.q3b && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 136, y: 49, width: 40, height: 68 }, "Time signature", () => onAnswerChange("q3b", ""));
    q3Add2018RhythmEntryTargets(svg, answers, onAnswerChange);
    q3Add2018BarLabelTargets(svg, answers, onAnswerChange);
    q3Add2018NoteEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg2015(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 630", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3aCorrection = review.q3a && review.q3a !== "correct";
    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2015(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "flatKeySignature", Q3_STAFF.left + 54, q3YForStep(4, top));
      if (systemIndex === 0) {
        q3DrawTimeSignature(svg, answers.q3a, top, answerClass("q3a"), q3aCorrection && answers.q3a ? -18 : 0);
        if (q3aCorrection) q3DrawTimeSignature(svg, correctAnswer("q3a", "4/4"), top, "q3-answer-correction", answers.q3a ? -2 : 0);
      }
      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2015_Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        const positions = q3BarPositions(item);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3Draw2015BarNotes(svg, item, top, barIndex === 6 ? answers.q3f : "", barIndex === 6 ? answerClass("q3f") : "", barIndex === 6 ? review.q3f : "", correctAnswer("q3f", "A4,A4,B4,C5"));
        if (barIndex === 4) {
          q3Text(svg, "X", { x: positions.at(-1), y: q3YForStep(item.notes.at(-1).step, top) - 41, "text-anchor": "middle" }, "q3-note-label");
        }
        N5_2015_Q3_LYRICS[barIndex].forEach((syllable, noteIndex) => {
          if (!syllable) return;
          q3Text(svg, syllable, { x: positions[noteIndex], y: top + Q3_STAFF.gap * 7.15, "text-anchor": "middle" }, "q3-score-lyrics");
        });
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });
    const missingBar = N5_2015_Q3_BARS[6];
    const missingPositions = q3BarPositions(missingBar);
    const missingIndexes = missingBar.missingIndices;
    const missingTop = q3SystemTop2015(6);
    svg.append(svgElement("rect", {
      x: missingPositions[missingIndexes[0]] - 24,
      y: missingTop - 72,
      width: missingPositions[missingIndexes.at(-1)] - missingPositions[missingIndexes[0]] + 48,
      height: 166,
      class: "q3-marking-box",
    }));
    q3Draw2015RhythmGuide(svg, missingBar, missingTop);
    if (answers.q3b) {
      const tempoX = q3BarStart(0) + 24;
      const tempoY = q3SystemTop2015(0) - 25;
      q3Text(svg, answers.q3b, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3b")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 120, height: 34 }, "Tempo marking", () => onAnswerChange("q3b", ""));
    }
    if (review.q3b && review.q3b !== "correct") {
      q3Text(svg, correctAnswer("q3b", "Andante"), { x: q3BarStart(0) + 24 + (answers.q3b ? 118 : 0), y: q3SystemTop2015(0) - 25, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");
    }
    if (answers.q3a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 185, y: 49, width: 45, height: 68 }, "Time signature", () => onAnswerChange("q3a", ""));
    q3Add2015NoteEntryTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg2016(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 570", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} guide score for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3aCorrection = review.q3a && review.q3a !== "correct";
    const drawnPoints = [];

    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * N5_2016_Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop2016(firstBar);
      for (let line = 0; line < 5; line += 1) {
        svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      }
      q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
      q3CalibratedSymbol(svg, "flatKeySignature", Q3_STAFF.left + 54, q3YForStep(4, top));
      if (systemIndex === 0) {
        q3DrawTimeSignature(svg, answers.q3a, top, answerClass("q3a"), q3aCorrection && answers.q3a ? -18 : 0);
        if (q3aCorrection) q3DrawTimeSignature(svg, correctAnswer("q3a", "3/4"), top, "q3-answer-correction", answers.q3a ? -2 : 0);
      }

      for (let local = 0; local < N5_2016_Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = N5_2016_Q3_BARS[barIndex];
        const start = q3BarStart2016(barIndex);
        const end = start + q3BarWidth2016(barIndex);
        const positions = q3BarPositions2016(item);
        if (barIndex > 0) {
          q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        }
        drawnPoints[barIndex] = q3Draw2016BarNotes(svg, item, top, barIndex === 14 ? answers.q3f : "", barIndex === 14 ? answerClass("q3f") : "", barIndex === 14 ? review.q3f : "", correctAnswer("q3f", "E5,D5,C5"));

        N5_2016_Q3_LYRICS[barIndex].forEach((syllable, noteIndex) => {
          if (!syllable) return;
          q3Text(svg, syllable, { x: positions[noteIndex], y: top + Q3_STAFF.gap * 7.15, "text-anchor": "middle" }, "q3-score-lyrics");
        });

        if (barIndex === 4) {
          const bracketY = top - 39;
          const bracketCentre = (positions[2] - 2 + positions[3] + 10) / 2;
          const bracketWidth = (positions[3] + 10 - (positions[2] - 2)) * .85;
          const bracketLeft = bracketCentre - bracketWidth / 2;
          const bracketRight = bracketCentre + bracketWidth / 2;
          svg.append(svgElement("path", {
            d: `M ${bracketLeft} ${bracketY + 18} V ${bracketY} H ${bracketRight} V ${bracketY + 18}`,
            class: "q3-interval-bracket",
          }));
        }

        if (barIndex === 15) {
          svg.append(svgElement("line", { x1: end - 7, x2: end - 7, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thin" }));
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline q3-final-thick" }));
        } else {
          svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
        }
      }
    });

    if (drawnPoints[6]?.[0] && drawnPoints[7]?.[0]) q3DrawTie(svg, drawnPoints[6][0], drawnPoints[7][0]);

    const missingBar = N5_2016_Q3_BARS[14];
    const missingPositions = q3BarPositions2016(missingBar);
    const missingTop = q3SystemTop2016(14);
    svg.append(svgElement("rect", {
      x: missingPositions[0] - 20,
      y: missingTop - 76,
      width: missingPositions.at(-1) - missingPositions[0] + 40,
      height: 168,
      class: "q3-marking-box",
    }));
    q3Draw2016RhythmGuide(svg, missingBar, missingTop);

    if (answers.q3b) {
      const tempoX = q3BarStart2016(0) + 8;
      const tempoY = q3SystemTop2016(0) - 25;
      q3Text(svg, answers.q3b, { x: tempoX, y: tempoY, "text-anchor": "start" }, `q3-tempo-answer ${answerClass("q3b")}`.trim());
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: tempoX - 8, y: tempoY - 24, width: 116, height: 34 }, "Tempo marking", () => onAnswerChange("q3b", ""));
    }
    if (review.q3b && review.q3b !== "correct") {
      q3Text(svg, correctAnswer("q3b", "Moderato"), { x: q3BarStart2016(0) + 8 + (answers.q3b ? 116 : 0), y: q3SystemTop2016(0) - 25, "text-anchor": "start" }, "q3-tempo-answer q3-answer-correction");
    }

    const labelMatch = String(answers.q3c || "").match(/^bar-(\d+)$/);
    if (labelMatch) {
      const barIndex = Math.max(0, Math.min(15, Number(labelMatch[1]) - 1));
      const placement = q3BarLabelPlacement2016(barIndex);
      q3Text(svg, "V", { x: placement.x, y: placement.y, "text-anchor": "middle" }, `q3-note-label ${answerClass("q3c")}`.trim());
    }
    if (review.q3c && review.q3c !== "correct") {
      const correctMatch = String(correctAnswer("q3c", "bar-9")).match(/^bar-(\d+)$/);
      const barIndex = correctMatch ? Math.max(0, Math.min(15, Number(correctMatch[1]) - 1)) : 8;
      const placement = q3BarLabelPlacement2016(barIndex);
      q3Text(svg, "V", { x: placement.x + (answers.q3c === `bar-${barIndex + 1}` ? 14 : 0), y: placement.y, "text-anchor": "middle" }, "q3-note-label q3-answer-correction");
    }

    if (answers.q3a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 185, y: 49, width: 45, height: 68 }, "Time signature", () => onAnswerChange("q3a", ""));
    q3Add2016NoteEntryTargets(svg, answers, onAnswerChange);
    q3Add2016BarLabelTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function q3ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 540", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} music guide for Question 3` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : review[id] === "incorrect" ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const q3aCorrection = review.q3a && review.q3a !== "correct";
    const q3aUserOffset = q3aCorrection && answers.q3a ? -18 : 0;
    q3DrawMissingNoteBox(svg);
    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3DrawSystemPrefix(svg, top, systemIndex === 0 ? answers.q3a : null, systemIndex === 0 ? answerClass("q3a") : "", systemIndex === 0 ? q3aUserOffset : 0);
      if (systemIndex === 0 && q3aCorrection) {
        q3DrawTimeSignature(svg, correctAnswer("q3a", "4/4"), top, "q3-answer-correction", answers.q3a ? -2 : 0);
      }
      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3DrawBarNotes(svg, item, top, answers.q3c, answerClass("q3c"), review.q3c, correctAnswer("q3c", "B4,D4,E4"));
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });
    const dynamicKey = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[answers.q3b];
    if (answers.q3a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 185, y: 49, width: 45, height: 68 }, "Time signature", () => onAnswerChange("q3a", ""));
    if (dynamicKey) {
      const dynamicX = q3BarPositions(Q3_BARS[0])[0];
      const dynamicY = Q3_STAFF.topA + Q3_STAFF.gap * 7.85;
      q3CalibratedSymbol(svg, dynamicKey, dynamicX, dynamicY, { className: answerClass("q3b") });
      if (onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: dynamicX - 25, y: dynamicY - 34, width: 50, height: 46 }, "Dynamic marking", () => onAnswerChange("q3b", ""));
    }
    if (review.q3b && review.q3b !== "correct") {
      const correctionKey = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[correctAnswer("q3b", "p")];
      const correctionX = q3BarPositions(Q3_BARS[0])[0] + (answers.q3b ? 18 : 0);
      const correctionY = Q3_STAFF.topA + Q3_STAFF.gap * 7.85;
      if (correctionKey) q3CalibratedSymbol(svg, correctionKey, correctionX, correctionY, { className: "q3-answer-correction", opacity: .9 });
    }
    const repeat = answers.q3d;
    if (repeat) {
      const match = String(repeat).match(/^end-bar-(\d+)$/);
      const barIndex = match ? Math.max(0, Math.min(7, Number(match[1]) - 1)) : 0;
      const placement = q3RepeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: answerClass("q3d") });
    }
    if (review.q3d && review.q3d !== "correct") {
      const match = String(correctAnswer("q3d", "end-bar-8")).match(/^end-bar-(\d+)$/);
      const barIndex = match ? Math.max(0, Math.min(7, Number(match[1]) - 1)) : 7;
      const placement = q3RepeatPlacement(barIndex);
      q3CalibratedSymbol(svg, "repeatRight", placement.x, placement.y, { className: "q3-answer-correction", opacity: .9 });
    }
    q3AddNoteEntryTargets(svg, answers, onAnswerChange);
    q3AddRepeatTargets(svg, answers, onAnswerChange);
    return svg;
  }

  function higher2015Staff(svg, top, options = {}) {
    const left = options.left || 78;
    const right = options.right || 842;
    const keySignatureX = left + 54 + Number(options.keySignatureXOffset || 0);
    for (let line = 0; line < 5; line += 1) {
      svg.append(svgElement("line", { x1: left, x2: right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
    }
    q3CalibratedSymbol(svg, options.bass ? "fClef" : "gClef", left + 27, q3YForStep(options.bass ? 6 : 2, top));
    const flatKeySignatureStep = Number.isFinite(Number(options.flatKeySignatureStep)) ? Number(options.flatKeySignatureStep) : 4;
    if (options.flatKeySignature) q3CalibratedSymbol(svg, "flatKeySignature", keySignatureX, q3YForStep(flatKeySignatureStep, top));
    if (options.sharpKeySignature) q3CalibratedSymbol(svg, "sharpKeySignature", keySignatureX, q3YForStep(options.bass ? 6 : 8, top));
    if (options.timeSignature) q3DrawTimeSignature(svg, options.timeSignatureValue || "4/4", top, "", Number(options.timeSignatureXOffset || 0), left + 83);
  }

  function higher2015Positions(notes, start, end, options = {}) {
    // A whole-bar rest is centred in the bar rather than positioned using the
    // normal note-spacing rhythm. This applies to every Higher score that
    // reuses this position helper, including bars without an explicit
    // `fullBarRest` flag in older paper data.
    if (notes.length === 1 && notes[0]?.rest && notes[0]?.rhythm === "semibreveRest") {
      return [(start + end) / 2];
    }
    // Keep Higher note spacing identical to the established National 5
    // renderer.  The shared renderer uses visual rhythm spacing (rather than
    // stretching every bar purely by beat totals), which keeps noteheads and
    // stems at a consistent distance from their neighbouring barlines.
    const scoreStart = start + (options.firstInSystem ? 4 : 15);
    const scoreEnd = end - 4;
    const units = notes.reduce((sum, _, index) => sum + q3PositionSpacing(notes, index), 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * .38;
    return notes.map((_, index) => {
      const x = cursor;
      cursor += q3PositionSpacing(notes, index) * unit;
      return x;
    });
  }

  function higher2015DrawNotes(svg, notes, positions, top, options = {}) {
    const hidden = new Set(options.hiddenIndices || []);
    const visibleNotes = notes.map((item, index) => hidden.has(index) ? null : item);
    const groups = options.beamGroups || q3BeamGroups(notes);
    const points = [];
    visibleNotes.forEach((item, index) => {
      if (!item) { points[index] = null; return; }
      const group = q3GroupFor(groups, index);
      let beam = null;
      if (group) {
        const groupNotes = visibleNotes.slice(group.start, group.end + 1);
        if (groupNotes.every(Boolean)) beam = q3GetBeam(groupNotes, positions.slice(group.start, group.end + 1), top);
      }
      const stem = beam ? q3GetStem(positions[index], q3YForStep(item.step, top), item.step, beam.down) : null;
      const renderedItem = item.accidental
        ? { ...item, accidentalXOffset: Number(item.accidentalXOffset || 0) - 7 }
        : item;
      points[index] = q3DrawNote(svg, renderedItem, positions[index], top, {
        beamed: Boolean(beam),
        down: beam?.down,
        forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null,
        className: options.classNames?.[index] || options.className || "",
        opacity: options.opacity ?? 1,
        scale: options.scale || 1,
      });
    });
    groups.forEach(group => {
      const groupNotes = visibleNotes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return;
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beam = q3GetBeam(groupNotes, groupPositions, top);
      const groupClasses = groupNotes.map((_, localIndex) => options.classNames?.[group.start + localIndex] || options.className || "");
      const beamClassName = groupClasses.every(className => className === groupClasses[0]) ? groupClasses[0] : "";
      q3BeamPolygon(svg, beam, { className: beamClassName, opacity: options.opacity });
      q3SecondarySegments(groupNotes).forEach(segment => {
        const offset = beam.down ? -Q3_STAFF.gap * .85 : Q3_STAFF.gap * .85;
        const lift = beam.down ? 2 : -2;
        const stemX = localIndex => q3GetStem(groupPositions[localIndex], q3YForStep(groupNotes[localIndex].step, top), groupNotes[localIndex].step, beam.down).stemX;
        const x1 = stemX(segment.start);
        const x2 = segment.hook ? x1 + (segment.start > 0 ? -(Q3_STAFF.gap * .9 + 2) : Q3_STAFF.gap * .9 + 2) : stemX(segment.end);
        q3BeamPolygon(svg, {
          start: { x: x1, y: q3BeamY(x1, beam) + offset + lift },
          end: { x: x2, y: q3BeamY(x2, beam) + offset + lift },
        }, { className: beamClassName, opacity: options.opacity });
      });
    });
    visibleNotes.forEach((item, index) => {
      if (item?.tieToNext && points[index] && points[index + 1]) {
        const firstClass = options.classNames?.[index] || options.className || "";
        const secondClass = options.classNames?.[index + 1] || options.className || "";
        q3DrawTie(svg, points[index], points[index + 1], {
          className: firstClass === secondClass ? firstClass : "",
          opacity: options.opacity,
        });
      }
    });
    (options.slurs || []).forEach(slur => {
      if (points[slur.start] && points[slur.end]) q3DrawTie(svg, points[slur.start], points[slur.end], { widthScale: slur.widthScale || 1, above: slur.above === true });
    });
    return points;
  }

  function q3DrawTupletMark(svg, notes, positions, top, options = {}) {
    const visibleNotes = (notes || []).filter(Boolean);
    if (visibleNotes.length !== 3 || (positions || []).length < 3) return;
    const isQuaverTriplet = options.isQuaverTriplet === true;
    const opacity = options.opacity ?? 1;
    const className = options.className || "";
    if (isQuaverTriplet) {
      const centreX = positions[1];
      const beam = q3GetBeam(visibleNotes, positions, top);
      const yOnBeam = q3BeamY(centreX, beam);
      q3Text(svg, "3", {
        x: beam.down ? centreX - 5 : centreX + 4,
        y: beam.down ? yOnBeam + 24 : yOnBeam - 6,
        "text-anchor": "middle",
        "font-family": "serif",
        "font-weight": 900,
        "font-size": 21,
        opacity,
      }, `q3-tuplet-number ${className}`.trim());
      return;
    }

    const x1 = positions[0] - 10;
    const x2 = positions[2] + 10;
    const y = top - 24;
    const centreX = (x1 + x2) / 2;
    svg.append(svgElement("path", {
      d: `M ${x1} ${y + 8} L ${x1} ${y} L ${centreX - 12} ${y}`,
      class: `q3-tuplet-bracket ${className}`.trim(),
      opacity,
    }));
    svg.append(svgElement("path", {
      d: `M ${centreX + 12} ${y} L ${x2} ${y} L ${x2} ${y + 8}`,
      class: `q3-tuplet-bracket ${className}`.trim(),
      opacity,
    }));
    q3Text(svg, "3", {
      x: centreX,
      y: y + 6,
      "text-anchor": "middle",
      "font-family": "serif",
      "font-weight": 900,
      "font-size": 21,
      opacity,
    }, `q3-tuplet-number ${className}`.trim());
  }

  function higher2015Lyrics(svg, lyrics, positions, top, options = {}) {
    (lyrics || []).forEach((syllable, index) => {
      if (!syllable || positions[index] === undefined) return;
      const xOffset = Number(options.xOffsets?.[index] || 0);
      const yOffset = Number(options.yOffsets?.[index] || 0);
      const positionIndex = options.positionIndices?.[index] ?? index;
      const x = positions[positionIndex] === undefined ? positions[index] : positions[positionIndex];
      const textAnchor = options.textAnchors?.[index] || "middle";
      q3Text(svg, syllable, { x: x + xOffset, y: top + Q3_STAFF.gap * 7.15 + yOffset, "text-anchor": textAnchor }, "q3-score-lyrics");
    });
  }

  function higher2015SystemBreakTie(svg, first, second, rightEdge, leftEdge) {
    if (!first || !second) return;
    q3DrawTie(svg, first, { ...first, x: rightEdge }, { widthScale: .9 });
    q3DrawTie(svg, { ...second, x: leftEdge }, second, { widthScale: .9 });
  }

  // Match the established Higher chord-answer behaviour in chords.html.
  function formatHigherChordAnswer(value) {
    return String(value || "")
      .replace(/[^ivafgcdebmIVAFGCDEBM]/g, "")
      .split("")
      .reduce((out, char) => {
        const lower = char.toLowerCase();
        if (lower === "m") return out + "m";
        if (lower === "b") return out.endsWith("B") ? out + "b" : out + "B";
        return out + char.toUpperCase();
      }, "")
      .slice(0, 2);
  }

  function higher2015TextInput(svg, options) {
    const foreignObject = svgElement("foreignObject", {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      class: "higher-2015-score-input-wrap",
    });
    const input = document.createElement("input");
    input.type = "text";
    input.className = `higher-2015-score-input ${options.className || ""}`.trim();
    input.value = options.value || "";
    input.autocomplete = "off";
    input.setAttribute("autocapitalize", "sentences");
    input.setAttribute("aria-label", options.label);
    input.setAttribute("aria-keyshortcuts", "Shift+Delete");
    if (options.maxLength) input.maxLength = options.maxLength;
    input.addEventListener("input", () => {
      if (options.formatValue) input.value = options.formatValue(input.value);
      if (options.capitalise && /^[a-z]/.test(input.value)) input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1);
      options.onInput(input.value);
    });
    bindRemovalGesture(input, () => {
      if (!input.value) return;
      input.value = "";
      options.onInput("");
    });
    foreignObject.append(input);
    svg.append(foreignObject);
    return input;
  }

  function higher2015AccidentalAnswer(value, noteIndices = HIGHER_2015_Q4_ACCIDENTAL_NOTE_INDICES) {
    const match = String(value || "").match(/^(flat|natural|sharp)(?:@(\d+))?$/);
    if (!match) return null;
    const noteIndex = match[2] === undefined ? noteIndices[0] : Number(match[2]);
    if (!noteIndices.includes(noteIndex)) return null;
    return { accidental: match[1], noteIndex };
  }

  function higher2015AccidentalPlacement(positions, top, noteIndex) {
    const item = HIGHER_2015_Q4_BARS[10].notes[noteIndex];
    return {
      x: positions[noteIndex] - Q3_STAFF.gap * 1.4 - 7,
      y: q3YForStep(item.step, top),
    };
  }

  function q3AddHigher2015AccidentalTargets(svg, answers, onAnswerChange, options) {
    if (!onAnswerChange) return;
    const noteIndices = options.noteIndices || HIGHER_2015_Q4_ACCIDENTAL_NOTE_INDICES;
    const positions = options.positions;
    const top = options.top;
    const placed = higher2015AccidentalAnswer(answers.q4c, noteIndices);
    noteIndices.forEach((noteIndex, order) => {
      let preview = null;
      const placedHere = placed?.noteIndex === noteIndex;
      const noteLabel = `note ${order + 1}`;
      const target = svgElement("rect", {
        x: positions[noteIndex] - 36,
        y: top - 34,
        width: 72,
        height: 104,
        class: "q3-accidental-hit-area",
        role: "button",
        tabindex: q3AccidentalToolArmed || placedHere ? "0" : "-1",
        "aria-disabled": String(!q3AccidentalToolArmed && !placedHere),
        "aria-label": placedHere
          ? `Accidental placed before ${noteLabel}. Double-click, double-tap or right-click to remove it.`
          : `Place the selected accidental before ${noteLabel}`,
      });
      if (placedHere) {
        target.dataset.accidentalPlaced = "true";
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const hidePreview = () => {
        preview?.remove();
        preview = null;
      };
      const showPreview = () => {
        if (!q3AccidentalToolArmed || preview) return;
        const placement = higher2015AccidentalPlacement(positions, top, noteIndex);
        preview = q3CalibratedSymbol(svg, `${q3AccidentalToolArmed}InScore`, placement.x, placement.y, { opacity: .35, className: "q3-accidental-preview" });
        svg.append(target);
      };
      const placeAccidental = event => {
        if (!q3AccidentalToolArmed) return;
        event.preventDefault();
        const accidental = q3AccidentalToolArmed;
        hidePreview();
        q3SetAccidentalToolArmed("", svg);
        onAnswerChange("q4c", `${accidental}@${noteIndex}`);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", placeAccidental);
      target.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) placeAccidental(event);
      });
      bindRemovalGesture(target, () => {
        if (!placedHere) return;
        hidePreview();
        q3SetAccidentalToolArmed("", svg);
        onAnswerChange("q4c", "");
      });
      svg.append(target);
    });
  }

  function higher2015ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score", viewBox: "0 0 920 1190", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2015 Question 4 score` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const firstSystemTop = 70;
    const transposeBassTop = firstSystemTop + Q3_STAFF.gap * 10;
    const systemSpacing = 170;
    const systems = [
      firstSystemTop,
      transposeBassTop + systemSpacing,
      transposeBassTop + systemSpacing * 2,
      transposeBassTop + systemSpacing * 3,
    ];
    // The transpose answer uses a second staff directly below the opening
    // system. Keep a deliberately generous gap so the bass clef and lyrics
    // remain legible instead of colliding with the treble staff.
    const musicStart = 138;
    const musicEnd = 842;
    const barWidth = (musicEnd - musicStart) / 4;
    // The transpose area ends just after the third printed note: the two
    // notes in bar 1 and the first note in bar 2.  Keep the bass staff the
    // same width so its answer area follows the printed score precisely.
    const transposeBoxRight = musicStart + barWidth + 96;
    const barPoints = [];
    const barPositions = [];

    // Source-paper answer areas are drawn first so the shared notation remains
    // crisp and readable over the boxes, exactly as it is on the official page.
    svg.append(svgElement("rect", { x: 120, y: 13, width: transposeBoxRight - 120, height: 229, class: "q3-marking-box" }));
    q3Text(svg, "(a) Transpose", { x: 136, y: 34, "text-anchor": "start" }, "q3-marking-box-label");
    const intervalBoxTop = systems[1] - 69;
    const accidentalBoxTop = systems[2] - 44;
    const notesBoxTop = systems[3] - 69;
    // Keep the interval box around only the first two notes in bar 6.
    const intervalBarStart = musicStart + barWidth;
    const intervalBarEnd = intervalBarStart + barWidth;
    const intervalNotePositions = higher2015Positions(HIGHER_2015_Q4_BARS[5].notes, intervalBarStart, intervalBarEnd);
    const intervalBoxLeft = intervalBarStart + 12;
    const intervalBoxRight = intervalNotePositions[1] + Q3_STAFF.gap * 1.5 + 10;
    const intervalBoxWidth = intervalBoxRight - intervalBoxLeft;
    svg.append(svgElement("rect", { x: intervalBoxLeft, y: intervalBoxTop, width: intervalBoxWidth, height: 151, class: "q3-marking-box" }));
    q3Text(svg, "(b) Interval:", { x: intervalBoxLeft + 10, y: intervalBoxTop + 21, "text-anchor": "start" }, "q3-marking-box-label");
    const accidentalBoxLeft = musicStart + barWidth * 2 + 12;
    const accidentalBoxRight = accidentalBoxLeft + barWidth - 5;
    svg.append(svgElement("rect", { x: accidentalBoxLeft - 15, y: accidentalBoxTop, width: accidentalBoxRight - accidentalBoxLeft + 15, height: 126, class: "q3-marking-box" }));
    q3Text(svg, "(c) Accidental", { x: musicStart + barWidth * 2 + 22, y: accidentalBoxTop + 21, "text-anchor": "start" }, "q3-marking-box-label");
    const notesBoxLeft = musicStart + barWidth + 12;
    const notesBoxRight = notesBoxLeft + barWidth - 5;
    svg.append(svgElement("rect", { x: notesBoxLeft - 5, y: notesBoxTop, width: notesBoxRight - notesBoxLeft + 5, height: 156, class: "q3-marking-box" }));
    q3Text(svg, "(d) Notes", { x: musicStart + barWidth + 22, y: notesBoxTop + 21, "text-anchor": "start" }, "q3-marking-box-label");

    systems.forEach((top, systemIndex) => {
      higher2015Staff(svg, top, { timeSignature: systemIndex === 0 });
      for (let local = 0; local < 4; local += 1) {
        const barIndex = systemIndex * 4 + local;
        const item = HIGHER_2015_Q4_BARS[barIndex];
        const start = musicStart + local * barWidth;
        const end = start + barWidth;
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions;
        if (barIndex !== 0) q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        barPoints[barIndex] = higher2015DrawNotes(svg, item.notes, positions, top, {
          hiddenIndices: barIndex === 13 ? item.missingIndices : [],
          beamGroups: item.beamGroups,
          slurs: barIndex === 12 ? [{ start: 0, end: 1, widthScale: 1.15 }] : barIndex === 15 ? [{ start: 0, end: 2, widthScale: 1.1 }] : [],
        });
        higher2015Lyrics(
          svg,
          HIGHER_2015_Q4_LYRICS[barIndex],
          positions,
          top,
          HIGHER_2015_Q4_LYRIC_OFFSETS[barIndex] ? { xOffsets: HIGHER_2015_Q4_LYRIC_OFFSETS[barIndex] } : undefined,
        );
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });
    higher2015SystemBreakTie(svg, barPoints[7]?.at(-1), barPoints[8]?.[0], musicEnd + 1, musicStart - 3);

    // (a) uses the shared bass-clef staff and Bravura note renderer.
    const bassTop = transposeBassTop;
    higher2015Staff(svg, bassTop, { left: 78, right: transposeBoxRight, bass: true, timeSignature: true });
    // The source paper joins the opening treble and bass staves with one
    // continuous barline placed immediately before the two clefs.
    const openingBarlineX = 78;
    svg.append(svgElement("line", {
      x1: openingBarlineX,
      x2: openingBarlineX,
      y1: firstSystemTop,
      y2: bassTop + Q3_STAFF.gap * 4,
      class: "q3-barline",
    }));
    // Align the bass-clef barline with the first treble-staff barline.
    svg.append(svgElement("line", {
      x1: musicStart + barWidth,
      x2: musicStart + barWidth,
      y1: bassTop,
      y2: bassTop + Q3_STAFF.gap * 4,
      class: "q3-barline",
    }));
    // Keep each transposed answer directly beneath its source treble note.
    const bassSlotX = [barPositions[0][0], barPositions[0][1], barPositions[1][0]];
    // Permit every natural staff position from E2 (one ledger line below the
    // bass staff) through C4 (one ledger line above it).
    const bassSteps = {
      E2: -2, F2: -1, G2: 0, A2: 1, B2: 2,
      C3: 3, D3: 4, E3: 5, F3: 6, G3: 7, A3: 8, B3: 9, C4: 10,
    };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const bassRhythms = ["minim", "minim", "dottedMinim"];
    const bassValues = String(answers.q4a || "").split(",");
    const bassExpectedValues = String(correctAnswer("q4a", "E3,G3,C4")).split(",");
    bassValues.forEach((pitch, index) => {
      if (bassSteps[pitch] === undefined) return;
      const className = review.q4a ? pitch === bassExpectedValues[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      q3DrawNote(svg, { pitch, step: bassSteps[pitch], rhythm: bassRhythms[index] }, bassSlotX[index], bassTop, { className });
    });
    if (needsCorrection("q4a")) bassExpectedValues.forEach((pitch, index) => {
      const enteredPitch = bassValues[index] || "";
      if (bassSteps[pitch] === undefined || enteredPitch === pitch) return;
      q3DrawNote(svg, { pitch, step: bassSteps[pitch], rhythm: bassRhythms[index] }, bassSlotX[index] + (enteredPitch ? 7 : 0), bassTop, { className: "q3-answer-correction", opacity: .9 });
    });

    // (b) is typed directly into the interval box superimposed on bar 6.
    const intervalBoxX = intervalBarStart;
    const intervalAnswerRight = intervalBoxRight - 12;
    if (onAnswerChange) {
      higher2015TextInput(svg, {
        x: intervalBoxX + 27, y: intervalBoxTop + 23, width: Math.max(28, intervalAnswerRight - (intervalBoxX + 27)), height: 27,
        value: answers.q4b,
        label: "Answer for part (b), interval in bar 6",
        maxLength: 18,
        capitalise: true,
        onInput: value => onAnswerChange("q4b", value, { rerender: false }),
      });
    } else {
      svg.append(svgElement("line", { x1: intervalBoxX + 30, x2: intervalAnswerRight, y1: intervalBoxTop + 48, y2: intervalBoxTop + 48, class: "q3-answer-line" }));
      const intervalAnswerX = (intervalBoxX + 30 + intervalAnswerRight) / 2;
      if (answers.q4b) q3Text(svg, String(answers.q4b), { x: intervalAnswerX, y: intervalBoxTop + 44, "text-anchor": "middle" }, `q3-entered-answer ${answerClass("q4b")}`.trim());
      if (needsCorrection("q4b")) q3Text(svg, "4th", { x: intervalAnswerX, y: intervalBoxTop + 23, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
    }

    // (c) lets the pupil select an accidental and place it before either
    // printed note in bar 11.
    const accidentalNoteIndices = question?.subquestions?.find(item => item.id === "q4c")?.accidentalNoteIndices || HIGHER_2015_Q4_ACCIDENTAL_NOTE_INDICES;
    const accidentalAnswer = higher2015AccidentalAnswer(answers.q4c, accidentalNoteIndices);
    if (accidentalAnswer) {
      const placement = higher2015AccidentalPlacement(barPositions[10], systems[2], accidentalAnswer.noteIndex);
      q3CalibratedSymbol(svg, `${accidentalAnswer.accidental}InScore`, placement.x, placement.y, { className: answerClass("q4c") });
    }
    if (needsCorrection("q4c")) {
      const correctionNoteIndex = accidentalAnswer?.noteIndex ?? accidentalNoteIndices[0];
      const placement = higher2015AccidentalPlacement(barPositions[10], systems[2], correctionNoteIndex);
      q3CalibratedSymbol(svg, "flatInScore", placement.x + (accidentalAnswer ? 7 : 0), placement.y, { className: "q3-answer-correction", opacity: .9 });
    }

    // (d) prints the rhythm above the empty stave and lets the pupil place the
    // three pitches on the shared score targets.
    const noteSlotX = barPositions[13];
    const guideItems = HIGHER_2015_Q4_BARS[13].notes.map(item => ({ ...item, pitch: "B4", step: 4, accidental: "" }));
    // Keep the printed guide rhythm clear of the answer staff while retaining
    // its alignment with the three note-entry positions below.
    const guideOffsetX = -20;
    const guideSlotX = [
      musicStart + barWidth * 1.35 + guideOffsetX,
      musicStart + barWidth * 1.58 + guideOffsetX,
      musicStart + barWidth * 1.78 + guideOffsetX,
    ];
    const guideTop = systems[3] - 35;
    higher2015DrawNotes(svg, guideItems, guideSlotX, guideTop, { beamGroups: [] });
    const noteValues = String(answers.q4d || "").split(",");
    const noteExpectedValues = String(correctAnswer("q4d", "E5,A4,A4")).split(",");
    noteValues.forEach((pitch, index) => {
      if (!Q3_PITCH_STEPS[pitch] && Q3_PITCH_STEPS[pitch] !== 0) return;
      const className = review.q4d ? pitch === noteExpectedValues[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      q3DrawNote(svg, { ...HIGHER_2015_Q4_BARS[13].notes[index], pitch, step: Q3_PITCH_STEPS[pitch] }, noteSlotX[index], systems[3], { className });
    });
    if (needsCorrection("q4d")) noteExpectedValues.forEach((pitch, index) => {
      const enteredPitch = noteValues[index] || "";
      if ((!Q3_PITCH_STEPS[pitch] && Q3_PITCH_STEPS[pitch] !== 0) || enteredPitch === pitch) return;
      q3DrawNote(svg, { ...HIGHER_2015_Q4_BARS[13].notes[index], pitch, step: Q3_PITCH_STEPS[pitch] }, noteSlotX[index] + (enteredPitch ? 7 : 0), systems[3], { className: "q3-answer-correction", opacity: .9 });
    });

    // (e) is a complete, printed fifth line. A bar line may be placed in any
    // gap between consecutive printed score items. The official boundaries
    // follow the source-confirmed four-beat rhythm inventory.
    const line5Top = systems[3] + 190;
    svg.append(svgElement("rect", { x: 126, y: line5Top - 52, width: 726, height: 146, class: "q3-marking-box" }));
    q3Text(svg, "(e) Bar lines", { x: 136, y: line5Top - 31, "text-anchor": "start" }, "q3-marking-box-label");
    higher2015Staff(svg, line5Top);
    const line5Positions = higher2015Positions(HIGHER_2015_Q4_LINE_5, musicStart, musicEnd, { firstInSystem: true });
    higher2015DrawNotes(svg, HIGHER_2015_Q4_LINE_5, line5Positions, line5Top, {
      beamGroups: HIGHER_2015_Q4_LINE_5_BEAM_GROUPS,
      slurs: HIGHER_2015_Q4_LINE_5_SLURS,
    });
    higher2015Lyrics(svg, HIGHER_2015_Q4_LINE_5_LYRICS, line5Positions, line5Top);
    // Line 5 ends with a printed barline at the right edge of the staff.
    svg.append(svgElement("line", {
      x1: musicEnd,
      x2: musicEnd,
      y1: line5Top,
      y2: line5Top + Q3_STAFF.gap * 4,
      class: "q3-barline",
    }));
    const officialBarlineIds = new Map([
      [3, "line5-gap-4"],
      [10, "line5-gap-11"],
      [15, "line5-15"],
    ]);
    const barlineTargets = line5Positions.slice(0, -1).map((position, index) => {
      const nextPosition = line5Positions[index + 1];
      const gap = nextPosition - position;
      const hitWidth = Math.max(16, Math.min(42, gap * 0.8));
      return {
        id: officialBarlineIds.get(index) || `line5-gap-${index + 1}`,
        after: index,
        x: (position + nextPosition) / 2,
        hitX: (position + nextPosition - hitWidth) / 2,
        hitWidth,
      };
    });
    const enteredBarlines = String(answers.q4e || "").split(",").filter(Boolean);
    const expectedBarlines = String(correctAnswer("q4e", "line5-gap-4,line5-gap-11,line5-15")).split(",").filter(Boolean);
    barlineTargets.forEach(item => {
      const placed = enteredBarlines.includes(item.id);
      const placedClass = review.q4e ? expectedBarlines.includes(item.id) ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      if (placed) svg.append(svgElement("line", { x1: item.x, x2: item.x, y1: line5Top, y2: line5Top + Q3_STAFF.gap * 4, class: `q3-barline ${placedClass}`.trim() }));
      if (needsCorrection("q4e") && expectedBarlines.includes(item.id) && !placed) {
        svg.append(svgElement("line", { x1: item.x, x2: item.x, y1: line5Top, y2: line5Top + Q3_STAFF.gap * 4, class: "q3-barline q3-answer-correction" }));
      }
      if (!onAnswerChange) return;
      const preview = placed ? null : svgElement("line", { x1: item.x, x2: item.x, y1: line5Top, y2: line5Top + Q3_STAFF.gap * 4, class: "q3-barline higher-2015-barline-preview" });
      if (preview) svg.append(preview);
      const target = svgElement("rect", { x: item.hitX, y: line5Top - 16, width: item.hitWidth, height: 78, class: "q3-bar-label-hit-area", tabindex: "0", role: "button", "aria-label": `Place bar line between notes ${item.after + 1} and ${item.after + 2} in line 5` });
      const showPreview = () => preview?.classList.add("is-visible");
      const hidePreview = () => preview?.classList.remove("is-visible");
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", () => {
        if (!onAnswerChange) return;
        if (placed) return;
        const next = [...enteredBarlines, item.id].sort((a, b) => barlineTargets.findIndex(entry => entry.id === a) - barlineTargets.findIndex(entry => entry.id === b));
        onAnswerChange("q4e", next.join(","));
      });
      bindRemovalGesture(target, () => {
        if (placed && onAnswerChange) onAnswerChange("q4e", enteredBarlines.filter(id => id !== item.id).join(","));
      });
      svg.append(target);
    });

    // (f) prints the complete final line. The first chord is given and the two
    // answer fields sit above the exact chord positions in the score.
    const finalTop = line5Top + 210;
    const finalRight = 690;
    higher2015Staff(svg, finalTop, { right: finalRight });
    const finalPositions = higher2015Positions(HIGHER_2015_Q4_FINAL_LINE, musicStart, finalRight, { firstInSystem: true });
    higher2015DrawNotes(svg, HIGHER_2015_Q4_FINAL_LINE, finalPositions, finalTop, { beamGroups: HIGHER_2015_Q4_FINAL_LINE_BEAM_GROUPS });
    higher2015Lyrics(svg, ["free__", null, "me,", "and", "free", "me", null, "from", "this", "world?-"], finalPositions, finalTop);
    // The source music closes with a single barline after the final minim rest
    // and a barline separating the two tied notes in the final phrase.
    const finalTieBarlineX = (finalPositions[9] + finalPositions[10]) / 2;
    svg.append(svgElement("line", { x1: finalTieBarlineX, x2: finalTieBarlineX, y1: finalTop, y2: finalTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    svg.append(svgElement("line", { x1: finalRight, x2: finalRight, y1: finalTop, y2: finalTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    const firstChordStart = (finalPositions[3] + finalPositions[4]) / 2;
    const secondChordStart = (finalPositions[9] + finalPositions[10]) / 2;
    svg.append(svgElement("line", { x1: firstChordStart, x2: firstChordStart, y1: finalTop, y2: finalTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    const chordBoxRight = finalRight + 10;
    svg.append(svgElement("rect", { x: firstChordStart - 7, y: finalTop - 98, width: chordBoxRight - (firstChordStart - 7), height: 166, class: "q3-marking-box" }));
    q3Text(svg, "(f) Chords", { x: firstChordStart + 3, y: finalTop - 82, "text-anchor": "start" }, "q3-marking-box-label");
    const givenX = finalPositions[0];
    svg.append(svgElement("rect", { x: givenX - 23, y: finalTop - 68, width: 46, height: 25, class: "q3-marking-box" }));
    svg.append(svgElement("rect", { x: givenX - 23, y: finalTop - 43, width: 46, height: 25, class: "q3-marking-box" }));
    q3Text(svg, "F", { x: givenX, y: finalTop - 50, "text-anchor": "middle" }, "q3-marking-box-label");
    q3Text(svg, "IV", { x: givenX, y: finalTop - 25, "text-anchor": "middle" }, "q3-marking-box-label");
    const chordAnswer = String(answers.q4f || "");
    const chordTokens = chordAnswer.includes(",")
      ? chordAnswer.split(",").slice(0, 2).map(token => token.trim())
      : chordAnswer.split(/[\s;/]+/).filter(Boolean).slice(0, 2);
    const chordAnswerBoxWidth = 37.2 * 1.1;
    const chordAnswerBoxTop = finalTop - 59;
    const chordAnswerBoxHeight = 34 * 1.15;
    const chordAnswerInputHeight = 28 * 1.15;
    const chordBoxX = [firstChordStart + 10, secondChordStart + 10];
    chordBoxX.forEach(x => svg.append(svgElement("rect", { x, y: chordAnswerBoxTop, width: chordAnswerBoxWidth, height: chordAnswerBoxHeight, class: "q3-marking-box higher-2015-chord-answer-box" })));
    if (onAnswerChange) {
      const chordInputs = [];
      chordBoxX.forEach((x, index) => {
        const input = higher2015TextInput(svg, {
          x: x + 3, y: chordAnswerBoxTop + 3, width: chordAnswerBoxWidth - 6, height: chordAnswerInputHeight,
          value: chordTokens[index] || "",
          label: `Answer ${index + 1} for part (f), chords in the last line`,
          maxLength: 2,
          formatValue: formatHigherChordAnswer,
          className: "is-boxed",
          onInput: value => {
            const next = chordInputs.map(field => field.value.trim());
            next[index] = value.trim();
            onAnswerChange("q4f", next.join(", "), { rerender: false });
          },
        });
        chordInputs.push(input);
      });
    } else {
      const acceptedChordTokens = [["g", "v", "5"], ["am", "a", "vi", "6"]];
      const expectedChordTokens = ["G", "Am"];
      chordTokens.slice(0, 2).forEach((token, index) => {
        const tokenCorrect = acceptedChordTokens[index].includes(String(token).toLocaleLowerCase("en-GB"));
        const className = review.q4f ? tokenCorrect ? "q3-answer-correct" : "q3-answer-incorrect" : "";
        q3Text(svg, token, { x: chordBoxX[index] + chordAnswerBoxWidth / 2, y: chordAnswerBoxTop + chordAnswerBoxHeight - 6, "text-anchor": "middle" }, `q3-entered-answer ${className}`.trim());
      });
      if (needsCorrection("q4f")) expectedChordTokens.forEach((token, index) => {
        const enteredToken = chordTokens[index] || "";
        if (acceptedChordTokens[index].includes(enteredToken.toLocaleLowerCase("en-GB"))) return;
        q3Text(svg, token, { x: chordBoxX[index] + chordAnswerBoxWidth / 2, y: chordAnswerBoxTop + 11, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      });
    }

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, {
      id: "q4a",
      xs: bassSlotX,
      top: bassTop,
      pitchMap: bassPitchY,
      rhythms: bassRhythms,
      label: "Transposed notes in the bass clef",
    });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, {
      id: "q4d",
      xs: noteSlotX,
      top: systems[3],
      pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[3])])),
      rhythms: HIGHER_2015_Q4_BARS[13].notes.map(item => item.rhythm),
      label: "Missing notes in bar 14",
    });
    q3AddHigher2015AccidentalTargets(svg, answers, onAnswerChange, { positions: barPositions[10], top: systems[2], noteIndices: accidentalNoteIndices });
    return svg;
  }

  function q3AddHigher2016RhythmTargets(svg, answers, onAnswerChange, positions, top) {
    if (!onAnswerChange) return;
    const indexes = HIGHER_2016_Q4_BARS[4].rhythmCorrectionIndices;
    const questionCard = svg.closest(".question-card");
    const currentRhythms = () => {
      const value = questionCard?.dataset.q3CurrentRhythmValue ?? String(answers.q4c || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    };
    const save = current => {
      const value = current.every(item => !item || item === "_") ? "" : current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentRhythmValue = value;
      onAnswerChange("q4c", value);
    };
    indexes.forEach((noteIndex, order) => {
      let preview = null;
      const placed = currentRhythms()[order];
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!q3RhythmToolArmed || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, { ...HIGHER_2016_Q4_BARS[4].notes[noteIndex], rhythm: q3RhythmToolArmed }, positions[noteIndex], top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      const target = svgElement("rect", {
        x: positions[noteIndex] - 25, y: top - 31, width: 50, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: q3RhythmToolArmed || (placed && placed !== "_") ? "0" : "-1",
        "aria-disabled": String(!q3RhythmToolArmed && (!placed || placed === "_")),
        "aria-label": `Rhythm correction for note ${order + 1} in bar 5`,
      });
      if (placed && placed !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const place = event => {
        if (!q3RhythmToolArmed) return;
        event.preventDefault();
        hidePreview();
        const current = currentRhythms();
        current[order] = q3RhythmToolArmed;
        save(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", place);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(event); });
      bindRemovalGesture(target, () => {
        const current = currentRhythms();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        save(current);
      });
      svg.append(target);
    });
  }

  function q3AddHigher2024RhythmTargets(svg, answers, onAnswerChange, positions, top, questionCard = null) {
    if (!onAnswerChange) return;
    const bar = HIGHER_2024_Q4_BARS[5];
    const indexes = bar.rhythmCorrectionIndices;
    const editableIndexes = bar.notes.map((item, noteIndex) => item.rhythm === "crotchet" ? noteIndex : null).filter(noteIndex => noteIndex !== null);
    questionCard = questionCard || svg.closest(".question-card");
    const overrides = () => String(questionCard?.dataset.q3Higher2024RhythmOverrides || "").split(",").reduce((result, entry) => {
      const [noteIndex, rhythm] = entry.split(":");
      if (/^\d+$/.test(noteIndex) && rhythm) result[noteIndex] = rhythm;
      return result;
    }, {});
    const saveOverrides = next => {
      if (!questionCard) return;
      questionCard.dataset.q3Higher2024RhythmOverrides = Object.entries(next).map(([noteIndex, rhythm]) => `${noteIndex}:${rhythm}`).join(",");
    };
    const currentRhythms = () => {
      const value = questionCard?.dataset.q3CurrentRhythmValue ?? String(answers.q4b || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    };
    const save = current => {
      const hasEditableRhythm = editableIndexes.some(noteIndex => {
        const order = indexes.indexOf(noteIndex);
        return current[order] && current[order] !== "_";
      });
      const value = hasEditableRhythm ? current.join(",") : "";
      if (questionCard) questionCard.dataset.q3CurrentRhythmValue = value;
      onAnswerChange("q4b", value);
    };
    editableIndexes.forEach(noteIndex => {
      const order = indexes.indexOf(noteIndex);
      let preview = null;
      const placed = order >= 0 ? currentRhythms()[order] : overrides()[noteIndex];
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!q3RhythmToolArmed || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, { ...bar.notes[noteIndex], rhythm: q3RhythmToolArmed }, positions[noteIndex], top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      const target = svgElement("rect", {
        x: positions[noteIndex] - 25, y: top - 31, width: 50, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: q3RhythmToolArmed || (placed && placed !== "_") ? "0" : "-1",
        "aria-disabled": String(!q3RhythmToolArmed && (!placed || placed === "_")),
        "aria-label": `Rhythm correction for crotchet note ${noteIndex + 1} in bar 6`,
      });
      if (placed && placed !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const place = event => {
        if (!q3RhythmToolArmed) return;
        event.preventDefault();
        hidePreview();
        if (order >= 0) {
          const current = currentRhythms();
          current[order] = q3RhythmToolArmed;
          indexes.forEach((correctionIndex, correctionOrder) => {
            if (!editableIndexes.includes(correctionIndex) && (!current[correctionOrder] || current[correctionOrder] === "_")) current[correctionOrder] = bar.notes[correctionIndex].rhythm;
          });
          save(current);
        } else {
          const next = overrides();
          next[noteIndex] = q3RhythmToolArmed;
          saveOverrides(next);
          onAnswerChange("q4b", questionCard?.dataset.q3CurrentRhythmValue || String(answers.q4b || ""));
        }
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", place);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(event); });
      bindRemovalGesture(target, () => {
        hidePreview();
        if (order >= 0) {
          const current = currentRhythms();
          if (!current[order] || current[order] === "_") return;
          current[order] = "_";
          save(current);
        } else {
          const next = overrides();
          if (!next[noteIndex]) return;
          delete next[noteIndex];
          saveOverrides(next);
          onAnswerChange("q4b", questionCard?.dataset.q3CurrentRhythmValue || String(answers.q4b || ""));
        }
      });
      svg.append(target);
    });
  }

  function q3AddHigher2023RhythmTargets(svg, answers, onAnswerChange, positions, top) {
    if (!onAnswerChange) return;
    const indexes = [0, 1];
    const bar = HIGHER_2023_Q4_BARS[8];
    const questionCard = svg.closest(".question-card");
    const dataKey = "q3CurrentRhythmQ4d";
    const allowedRhythms = new Set(["dottedCrotchet", "quaver"]);
    const noteheadX = (item, x) => {
      const down = item.stemDown ?? q3StemDown(item.step);
      const settings = q3SymbolConfig(q3NoteSymbolKey(item.rhythm, down, false));
      return x - Q3_STAFF.gap * Number(settings.xOffsetScale || 0) - Number(settings.opticalXOffset || 0);
    };
    const currentRhythms = () => {
      const value = questionCard?.dataset[dataKey] ?? String(answers.q4d || "");
      const current = value.split(",").slice(0, indexes.length);
      while (current.length < indexes.length) current.push("_");
      return current;
    };
    const save = current => {
      const value = current.every(item => !item || item === "_") ? "" : current.join(",");
      if (questionCard) questionCard.dataset[dataKey] = value;
      onAnswerChange("q4d", value);
    };
    indexes.forEach((noteIndex, order) => {
      let preview = null;
      const placed = currentRhythms()[order];
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!allowedRhythms.has(q3RhythmToolArmed) || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        const item = { ...bar.notes[noteIndex], rhythm: q3RhythmToolArmed };
        q3DrawNote(preview, item, noteheadX(item, positions[noteIndex]), top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      const target = svgElement("rect", {
        x: positions[noteIndex] - 25, y: top - 31, width: 50, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: allowedRhythms.has(q3RhythmToolArmed) || (placed && placed !== "_") ? "0" : "-1",
        "aria-disabled": String(!allowedRhythms.has(q3RhythmToolArmed) && (!placed || placed === "_")),
        "aria-label": `Rhythm correction for note ${order + 1} in bar 9`,
      });
      if (placed && placed !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const place = event => {
        if (!allowedRhythms.has(q3RhythmToolArmed)) return;
        event.preventDefault();
        hidePreview();
        const current = currentRhythms();
        current[order] = q3RhythmToolArmed;
        save(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", place);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(event); });
      bindRemovalGesture(target, () => {
        const current = currentRhythms();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        save(current);
      });
      svg.append(target);
    });
  }

  function q3AddHigher2023RestTargets(svg, answers, onAnswerChange, firstX, top) {
    if (!onAnswerChange) return;
    const positions = [firstX, firstX + 24, firstX + 48].map(x => x + HIGHER_2023_Q4_REST_X_OFFSET);
    const questionCard = svg.closest(".question-card");
    const dataKey = "q3CurrentRhythmQ4e";
    const allowedRests = new Set(["crotchetRest", "quaverRest", "dottedCrotchetRest"]);
    const currentRests = () => {
      const value = questionCard?.dataset[dataKey] ?? String(answers.q4e || "");
      const current = value.split(",").slice(0, positions.length);
      while (current.length < positions.length) current.push("_");
      return current;
    };
    const save = current => {
      const value = current.filter(item => item && item !== "_").join(",");
      if (questionCard) questionCard.dataset[dataKey] = value;
      onAnswerChange("q4e", value);
    };
    positions.forEach((x, order) => {
      let preview = null;
      const placed = currentRests()[order];
      const hidePreview = () => { preview?.remove(); preview = null; };
      const showPreview = () => {
        if (!allowedRests.has(q3RhythmToolArmed) || preview) return;
        preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
        q3DrawNote(preview, rest(q3RhythmToolArmed), x, top, { opacity: .35 });
        svg.append(preview);
        svg.append(target);
      };
      const target = svgElement("rect", {
        x: x - 18, y: top - 31, width: 36, height: 100,
        class: "q3-rhythm-hit-area", role: "button",
        tabindex: allowedRests.has(q3RhythmToolArmed) || (placed && placed !== "_") ? "0" : "-1",
        "aria-disabled": String(!allowedRests.has(q3RhythmToolArmed) && (!placed || placed === "_")),
        "aria-label": `Rest placement ${order + 1} for part (e) in bar 12`,
      });
      if (placed && placed !== "_") {
        target.dataset.rhythmPlaced = "true";
        target.setAttribute("aria-keyshortcuts", "Shift+Delete");
      }
      const place = event => {
        if (!allowedRests.has(q3RhythmToolArmed)) return;
        event.preventDefault();
        hidePreview();
        const current = currentRests();
        current[order] = q3RhythmToolArmed;
        save(current);
      };
      target.addEventListener("pointerenter", showPreview);
      target.addEventListener("pointerleave", hidePreview);
      target.addEventListener("pointerdown", event => event.preventDefault());
      target.addEventListener("focus", showPreview);
      target.addEventListener("blur", hidePreview);
      target.addEventListener("click", place);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(event); });
      bindRemovalGesture(target, () => {
        const current = currentRests();
        if (!current[order] || current[order] === "_") return;
        hidePreview();
        current[order] = "_";
        save(current);
      });
      svg.append(target);
    });
  }

  function higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, options) {
    const value = String(answers[options.id] || "");
    const status = review[options.id];
    const incorrect = status && status !== "correct";
    if (onAnswerChange) {
      higher2015TextInput(svg, {
        x: options.x, y: options.y, width: options.width, height: 29,
        value, label: options.label, maxLength: options.maxLength || 24, capitalise: true,
        onInput: next => onAnswerChange(options.id, next, { rerender: false }),
      });
      return;
    }
    svg.append(svgElement("line", { x1: options.x + 3, x2: options.x + options.width - 3, y1: options.y + 27, y2: options.y + 27, class: "q3-answer-line" }));
    if (value) q3Text(svg, value, { x: options.x + options.width / 2, y: options.y + 23, "text-anchor": "middle" }, `q3-entered-answer ${status === "correct" ? "q3-answer-correct" : incorrect ? "q3-answer-incorrect" : ""}`.trim());
    if (incorrect) q3Text(svg, options.correction, { x: options.x + options.width / 2, y: options.y + 2, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
  }

  function higher2016ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2016-q4-score", viewBox: "0 0 920 1260", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2016 Question 4 score` });
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const systems = [140, 375, 610, 820, 1050];
    const groups = [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15]];
    const systemStarts = [185, 70, 70, 70, 70];
    const staffLeft = 2;
    const musicEnd = 918;
    // The printed transpose box begins just before the G4 at the start of the
    // final quaver group in bar 15 and continues around both staves.
    const transposeBox = { x: 450, y: systems[4] - 100, width: 385, height: 300 };
    const bassLeft = transposeBox.x - 48;
    const bassRight = transposeBox.x + transposeBox.width - 2;
    const systemEnds = systems.map((_, systemIndex) => systemIndex === systems.length - 1 ? bassRight : musicEnd);
    const barPositions = [];
    const barTops = [];
    const barStarts = [];
    const barEnds = [];
    const enteredRhythms = String(answers.q4c || "").split(",");
    const enteredRhythmIndexes = new Set(HIGHER_2016_Q4_BARS[4].rhythmCorrectionIndices.filter((_, order) => {
      const value = enteredRhythms[order];
      return Boolean(value && value !== "_");
    }));
    const systemLayouts = systems.map((top, systemIndex) => {
      const group = groups[systemIndex];
      const start = systemStarts[systemIndex];
      const end = systemEnds[systemIndex];
      return { top, group, start, end, width: (end - start) / group.length };
    });

    systemLayouts.forEach(({ top, group, start, width }) => {
      group.forEach((barIndex, local) => {
        const item = HIGHER_2016_Q4_BARS[barIndex];
        const barStart = start + local * width;
        const barEnd = barStart + width;
        barPositions[barIndex] = higher2015Positions(item.notes, barStart, barEnd, { firstInSystem: local === 0 });
        barTops[barIndex] = top;
        barStarts[barIndex] = barStart;
        barEnds[barIndex] = barEnd;
      });
    });

    const keyBox = { x: 42, y: 34, width: 140, height: 94 };
    const ornamentBox = { x: barStarts[1] + 3, y: 34, width: barEnds[1] - barStarts[1] - 8, height: 178 };
    const rhythmBox = { x: barStarts[4] + 2, y: systems[1] - 93, width: barEnds[4] - barStarts[4] - 10, height: 176 };
    const intervalBox = { x: barStarts[7] + 80, y: systems[2] - 105, width: 107, height: 188 };
    const notesBox = { x: 221, y: systems[4] - 100, width: 108, height: 202 };

    // Draw the printed answer boxes before the notation so staff lines and
    // noteheads remain crisp above their outlines.
    [keyBox, ornamentBox, rhythmBox, intervalBox, notesBox, transposeBox].forEach(box => svg.append(svgElement("rect", { ...box, class: "q3-marking-box" })));
    q3Text(svg, "(a) Key:", { x: keyBox.x + 10, y: keyBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(b) Ornament:", { x: ornamentBox.x + 10, y: ornamentBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(c) Rhythm", { x: rhythmBox.x + 10, y: rhythmBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(d) Interval:", { x: intervalBox.x + 10, y: intervalBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(e) Notes", { x: notesBox.x + 10, y: notesBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(f) Transpose", { x: transposeBox.x + 10, y: transposeBox.y + 27, "font-size": 16, "text-anchor": "start" }, "q3-marking-box-label");

    const drawBarline = (x, top) => svg.append(svgElement("line", {
      x1: x, x2: x, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline",
    }));

    systemLayouts.forEach(({ top, group, start, end, width }, systemIndex) => {
      higher2015Staff(svg, top, { left: staffLeft, right: end, timeSignature: systemIndex === 0, flatKeySignature: true, keySignatureXOffset: -5.7, timeSignatureXOffset: 13.7 });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2016_Q4_BARS[barIndex];
        const barStart = start + local * width;
        const barEnd = barStart + width;
        const positions = barPositions[barIndex];
        const numberX = systemIndex > 0 && local === 0 ? staffLeft + 10 : barStart + 5;
        q3Text(svg, String(barIndex + 1), { x: numberX, y: top - 17, "font-size": 15, "text-anchor": "middle" }, "q3-bar-number");
        const hidden = barIndex === 13 ? item.missingIndices : barIndex === 15 ? [2] : barIndex === 4 ? [...enteredRhythmIndexes] : [];
        higher2015DrawNotes(svg, item.notes, positions, top, { hiddenIndices: hidden, beamGroups: item.beamGroups });
        if (systemIndex === 0 && local === 0) drawBarline(barStart, top);
        if (barIndex < HIGHER_2016_Q4_BARS.length - 1) drawBarline(barEnd, top);
      });
    });

    // The source prints a fermata above the third note of bar 14.
    q3CalibratedSymbol(svg, "fermataAbove", barPositions[13][2], barTops[13] - Q3_STAFF.gap * 2.6 + 15, {
      settings: { fontSizeScale: 3.6 },
    });

    const pickupPositions = [90, 125, 160];
    higher2015DrawNotes(svg, HIGHER_2016_Q4_PICKUP, pickupPositions, systems[0], { beamGroups: [{ start: 1, end: 2 }] });

    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4a", x: keyBox.x + 7, y: keyBox.y + 46, width: keyBox.width - 14, label: "Answer for part (a), key", correction: "F major" });
    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4b", x: ornamentBox.x + 13, y: ornamentBox.y + 46, width: ornamentBox.width - 26, label: "Answer for part (b), ornament in bar 2", correction: "Mordent" });
    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4d", x: intervalBox.x + 17, y: intervalBox.y + 45, width: intervalBox.width - 34, label: "Answer for part (d), interval in bar 8", correction: "5th" });

    if (enteredRhythms.some(Boolean)) {
      [0, 1].forEach((noteIndex, order) => {
        const rhythm = enteredRhythms[order];
        if (!rhythm || rhythm === "_") return;
        const expected = ["dottedCrotchet", "quaver"][order];
        const className = review.q4c ? rhythm === expected ? "q3-answer-correct" : "q3-answer-incorrect" : "";
        q3DrawNote(svg, { ...HIGHER_2016_Q4_BARS[4].notes[noteIndex], rhythm }, barPositions[4][noteIndex], barTops[4], { className });
      });
    }
    if (needsCorrection("q4c")) ["dottedCrotchet", "quaver"].forEach((rhythm, order) => {
      if (enteredRhythms[order] === rhythm) return;
      q3DrawNote(svg, { ...HIGHER_2016_Q4_BARS[4].notes[order], rhythm }, barPositions[4][order] + (enteredRhythms[order] ? 7 : 0), barTops[4], { className: "q3-answer-correction", opacity: .9 });
    });

    const noteValues = String(answers.q4e || "").split(",");
    const noteExpected = String(correctAnswer("q4e", "E4,F4,G4")).split(",");
    const noteIndices = HIGHER_2016_Q4_BARS[13].missingIndices;
    const enteredNoteItems = noteIndices.map((noteIndex, order) => {
      const pitch = noteValues[order];
      if (noteIndex === undefined || Q3_PITCH_STEPS[pitch] === undefined) return null;
      return { ...HIGHER_2016_Q4_BARS[13].notes[noteIndex], pitch, step: Q3_PITCH_STEPS[pitch] };
    });
    const enteredNoteClasses = enteredNoteItems.map((item, order) => {
      if (!item) return "";
      return review.q4e ? item.pitch === noteExpected[order] ? "q3-answer-correct" : "q3-answer-incorrect" : "";
    });
    // Match the printed guide: the first missing quaver is flagged, and the
    // final two are beamed together when the pupil applies them.
    higher2015DrawNotes(svg, enteredNoteItems, barPositions[13].slice(4), barTops[13], {
      beamGroups: [{ start: 1, end: 2 }],
      classNames: enteredNoteClasses,
    });
    if (needsCorrection("q4e")) {
      const correctionItems = noteExpected.map((pitch, order) => {
        if (noteValues[order] === pitch) return null;
        const noteIndex = noteIndices[order];
        return { ...HIGHER_2016_Q4_BARS[13].notes[noteIndex], pitch, step: Q3_PITCH_STEPS[pitch] };
      });
      const correctionPositions = noteExpected.map((_, order) => barPositions[13][noteIndices[order]] + (noteValues[order] ? 7 : 0));
      higher2015DrawNotes(svg, correctionItems, correctionPositions, barTops[13], {
        beamGroups: [{ start: 1, end: 2 }],
        className: "q3-answer-correction",
        opacity: .9,
      });
    }

    // Print the three given quaver rhythms above the empty part of bar 14.
    higher2015DrawNotes(svg, [note("B4", "quaver"), note("B4", "quaver"), note("B4", "quaver")], barPositions[13].slice(4), barTops[13] - 35, { beamGroups: [{ start: 1, end: 2 }] });

    const bassTop = systems[4] + 122;
    higher2015Staff(svg, bassTop, { left: bassLeft, right: bassRight, bass: true });
    drawBarline(barStarts[15], bassTop);
    const transposeSlotX = [
      ...barPositions[14].slice(4),
      barPositions[15][0],
      barPositions[15][1],
    ];
    const bassSteps = { E2: -2, F2: -1, G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, F3: 6, G3: 7, A3: 8, B3: 9, C4: 10 };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q4f || "").split(",");
    const transposeExpected = String(correctAnswer("q4f", "G3,F3,D3,E3,F3,F3")).split(",");
    const transposeRhythms = ["quaver", "quaver", "quaver", "quaver", "minim", "quaver"];
    const enteredTransposeItems = transposeValues.slice(0, transposeSlotX.length).map((pitch, index) => {
      if (bassSteps[pitch] === undefined) return null;
      return { ...HIGHER_2016_Q4_TRANSPOSE[index], pitch, step: bassSteps[pitch] };
    });
    const enteredTransposeClasses = enteredTransposeItems.map((item, index) => {
      if (!item) return "";
      return review.q4f ? item.pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "";
    });
    const enteredTransposePoints = higher2015DrawNotes(svg, enteredTransposeItems, transposeSlotX, bassTop, {
      beamGroups: [{ start: 0, end: 3 }],
      classNames: enteredTransposeClasses,
    });
    if (enteredTransposePoints[4] && enteredTransposePoints[5]) q3DrawTie(svg, enteredTransposePoints[4], enteredTransposePoints[5]);
    if (needsCorrection("q4f")) {
      const correctionItems = transposeExpected.map((pitch, index) => {
        if (transposeValues[index] === pitch) return null;
        return { ...HIGHER_2016_Q4_TRANSPOSE[index], pitch, step: bassSteps[pitch] };
      });
      const correctionPositions = transposeExpected.map((_, index) => transposeSlotX[index] + (transposeValues[index] ? 7 : 0));
      higher2015DrawNotes(svg, correctionItems, correctionPositions, bassTop, {
        beamGroups: [{ start: 0, end: 3 }],
        className: "q3-answer-correction",
        opacity: .9,
      });
    }

    q3AddHigher2016RhythmTargets(svg, answers, onAnswerChange, barPositions[4], systems[1]);
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, {
      id: "q4e", xs: barPositions[13].slice(4), top: systems[4],
      pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[4])])),
      rhythms: ["quaver", "quaver", "quaver"], label: "Missing notes in bar 14",
    });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, {
      id: "q4f", xs: transposeSlotX, top: bassTop, pitchMap: bassPitchY,
      rhythms: transposeRhythms, label: "Transposed notes in the bass clef",
    });
    return svg;
  }

  function higher2017ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2017-q4-score", viewBox: `0 0 920 ${HIGHER_2017_Q4_SCORE_LAYOUT.viewBoxHeight}`, role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2017 Question 4 score` });
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const { systems, staffLeft, musicStart, musicEnd, barEnds: systemBarEnds, boxes } = HIGHER_2017_Q4_SCORE_LAYOUT;
    const groups = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9, 10], [11, 12, 13], [14, 15, 16, 17], [18, 19, 20], [21, 22]];
    const barPositions = [];
    const barPoints = [];
    const barTops = [];
    const barStarts = [];
    const barEnds = [];

    Object.values(boxes).forEach(box => svg.append(svgElement("rect", { ...box, class: "q3-marking-box" })));
    q3Text(svg, "(a) Time signature", { x: boxes.time.x + 8, y: boxes.time.y + 24, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(b) Interval:", { x: boxes.interval.x + 7, y: boxes.interval.y + 24, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(c) Value:", { x: boxes.value.x + 7, y: boxes.value.y + 24, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "beats", { x: boxes.value.x + 63, y: boxes.value.y + 62, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(d) Notes", { x: boxes.notes.x + 7, y: boxes.notes.y + 24, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(e) Chords", { x: boxes.chords.x + 6, y: boxes.chords.y + 24, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(f) Transpose", { x: boxes.transpose.x + 15, y: boxes.transpose.y + 27, "text-anchor": "start" }, "q3-marking-box-label");

    systems.forEach((top, systemIndex) => {
      const group = groups[systemIndex];
      higher2015Staff(svg, top, { left: staffLeft, right: musicEnd, sharpKeySignature: true });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2017_Q4_BARS[barIndex];
        const start = local === 0
          ? musicStart + (systemIndex === 0 ? 0 : HIGHER_2025_Q4_SCORE_LAYOUT.firstBarStartOffset)
          : systemBarEnds[systemIndex][local - 1];
        const end = systemBarEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions;
        barTops[barIndex] = top;
        barStarts[barIndex] = start;
        barEnds[barIndex] = end;

        if (barIndex !== 0) q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        barPoints[barIndex] = higher2015DrawNotes(svg, item.notes, positions, top, { hiddenIndices: item.missingIndices || [], beamGroups: item.beamGroups, slurs: item.slurs });
        const lyricOptions = HIGHER_2017_Q4_LYRIC_OFFSETS[barIndex] || HIGHER_2017_Q4_LYRIC_POSITION_INDICES[barIndex]
          ? { xOffsets: HIGHER_2017_Q4_LYRIC_OFFSETS[barIndex], positionIndices: HIGHER_2017_Q4_LYRIC_POSITION_INDICES[barIndex] }
          : undefined;
        higher2015Lyrics(svg, HIGHER_2017_Q4_LYRICS[barIndex], positions, top, lyricOptions);
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
    });

    [[2, 3], [5, 6], [10, 11], [14, 15], [18, 19], [21, 22]].forEach(([from, to]) => {
      const first = barPoints[from]?.at(-1);
      const second = barPoints[to]?.[0];
      if (barTops[from] === barTops[to]) q3DrawTie(svg, first, second);
      else higher2015SystemBreakTie(svg, first, second, barEnds[from] - 4, barStarts[to] + 4);
    });

    if (answers.q4a) q3DrawTimeSignature(svg, answers.q4a, systems[0], answerClass("q4a"), 0, 115);
    if (needsCorrection("q4a") && String(answers.q4a || "").toLowerCase() !== "4/4") q3DrawTimeSignature(svg, correctAnswer("q4a", "4/4"), systems[0], "q3-answer-correction", answers.q4a ? 18 : 0, 115);
    if (answers.q4a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 93, y: 88, width: 48, height: 58 }, "Time signature", () => onAnswerChange("q4a", ""));

    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4b", x: boxes.interval.x + 5, y: boxes.interval.y + 36, width: boxes.interval.width - 10, label: "Answer for part (b), interval in bar 3", correction: "6th" });
    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4c", x: boxes.value.x + 7, y: boxes.value.y + 38, width: 52, label: "Answer for part (c), value in bar 5", correction: "1.5" });

    // The source prints the rhythms above the empty positions in bar 11.
    const missingIndices = HIGHER_2017_Q4_BARS[10].missingIndices;
    higher2015DrawNotes(svg, [note("B4", "crotchet"), note("B4", "crotchet"), note("B4", "quaver")], barPositions[10].slice(0, 3), systems[2] - 38);
    const enteredNotes = String(answers.q4d || "").split(",");
    const expectedNotes = String(correctAnswer("q4d", "C5,B4,G4")).split(",");
    enteredNotes.forEach((pitch, order) => {
      const noteIndex = missingIndices[order];
      if (noteIndex === undefined || Q3_PITCH_STEPS[pitch] === undefined) return;
      const className = review.q4d ? pitch === expectedNotes[order] ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      q3DrawNote(svg, { ...HIGHER_2017_Q4_BARS[10].notes[noteIndex], pitch, step: Q3_PITCH_STEPS[pitch] }, barPositions[10][noteIndex], systems[2], { className });
    });
    if (needsCorrection("q4d")) expectedNotes.forEach((pitch, order) => {
      if (enteredNotes[order] === pitch) return;
      const noteIndex = missingIndices[order];
      q3DrawNote(svg, { ...HIGHER_2017_Q4_BARS[10].notes[noteIndex], pitch, step: Q3_PITCH_STEPS[pitch] }, barPositions[10][noteIndex] + (enteredNotes[order] ? 7 : 0), systems[2], { className: "q3-answer-correction", opacity: .9 });
    });

    const givenChordBox = { x: 105, y: systems[4] - 79, width: 38, height: 28 };
    svg.append(svgElement("rect", { ...givenChordBox, class: "q3-marking-box higher-2017-chord-answer-box" }));
    svg.append(svgElement("rect", { ...givenChordBox, y: givenChordBox.y + givenChordBox.height, class: "q3-marking-box higher-2017-chord-answer-box" }));
    q3Text(svg, "C", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + 20, "text-anchor": "middle" }, "q3-marking-box-label");
    q3Text(svg, "IV", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.height + 20, "text-anchor": "middle" }, "q3-marking-box-label");
    const chordValues = String(answers.q4e || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    const chordExpected = ["D", "G"];
    [15, 16].forEach((barIndex, order) => {
      const x = barStarts[barIndex] + 15;
      const className = review.q4e ? [order === 0 ? "D" : "G", order === 0 ? "V" : "I", order === 0 ? "5" : "1"].includes(String(chordValues[order] || "").toUpperCase()) ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      svg.append(svgElement("rect", { x, y: systems[4] - 64, width: 38, height: 36, class: "q3-marking-box higher-2017-chord-answer-box" }));
      if (onAnswerChange) higher2015TextInput(svg, { x, y: systems[4] - 64, width: 38, height: 36, value: chordValues[order] || "", className: "is-boxed", label: `Chord ${order + 1} for part (e)`, maxLength: 2, formatValue: formatHigherChordAnswer, onInput: next => { chordValues[order] = next; onAnswerChange("q4e", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        if (chordValues[order]) q3Text(svg, chordValues[order], { x: x + 19, y: systems[4] - 38, "text-anchor": "middle" }, `q3-entered-answer ${className}`.trim());
        if (needsCorrection("q4e") && ![order === 0 ? "D" : "G", order === 0 ? "V" : "I", order === 0 ? "5" : "1"].includes(String(chordValues[order] || "").toUpperCase())) q3Text(svg, chordExpected[order], { x: x + 19, y: systems[4] - 58, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    const bassTop = HIGHER_2017_Q4_SCORE_LAYOUT.bassTop;
    const bassLeft = HIGHER_2017_Q4_SCORE_LAYOUT.staffLeft;
    const bassRight = HIGHER_2017_Q4_SCORE_LAYOUT.bassRight;
    higher2015Staff(svg, bassTop, { left: bassLeft, right: bassRight, bass: true, sharpKeySignature: true });
    svg.append(svgElement("line", { x1: bassLeft, x2: bassLeft, y1: systems[6], y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    const transposeXs = barPositions[21].slice(1, 5);
    const bassSteps = { G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, F3: 6, "F♯3": 6, G3: 7, A3: 8, B3: 9, C4: 10, D4: 11 };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q4f || "").split(",");
    const transposeExpected = String(correctAnswer("q4f", "C4,G3,G3,A3")).split(",");
    const transposeNotes = HIGHER_2017_Q4_TRANSPOSE.map((item, index) => bassSteps[transposeValues[index]] === undefined ? null : { ...item, pitch: transposeValues[index], step: bassSteps[transposeValues[index]] });
    higher2015DrawNotes(svg, transposeNotes, transposeXs, bassTop, {
      beamGroups: [{ start: 0, end: 1 }],
      classNames: transposeValues.map((pitch, index) => review.q4f ? pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : ""),
    });
    if (needsCorrection("q4f")) higher2015DrawNotes(svg, HIGHER_2017_Q4_TRANSPOSE.map((item, index) => ({ ...item, pitch: transposeExpected[index], step: bassSteps[transposeExpected[index]] })), transposeXs.map(x => x + (transposeValues.some(Boolean) ? 7 : 0)), bassTop, { beamGroups: [{ start: 0, end: 1 }], className: "q3-answer-correction", opacity: .9 });

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4d", xs: barPositions[10].slice(0, 3), top: systems[2], pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[2])])), rhythms: ["crotchet", "crotchet", "quaver"], label: "Missing notes in bar 11" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4f", xs: transposeXs, top: bassTop, pitchMap: bassPitchY, rhythms: HIGHER_2017_Q4_TRANSPOSE.map(item => item.rhythm), label: "Transposed notes in the bass clef" });
    return svg;
  }

  function higher2018ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const layout = HIGHER_2018_Q3_SCORE_LAYOUT;
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2018-q3-score", viewBox: layout.viewBox.join(" "), role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2018 Question 3 score` });
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const left = layout.staffLeft;
    const right = layout.staffRight;
    const musicStart = layout.musicStart;
    const tops = layout.tops;
    const rendered = {};

    const offsetPositions = positions => positions.map(position => position + layout.noteOffsetX);

    function staffLabel(name, top) {
      q3Text(svg, name.replace("line", "Line "), { x: 58, y: top + Q3_STAFF.gap * 2.3, "text-anchor": "end" }, "higher-2018-line-label");
    }

    function drawBarLine(lineName, options = {}) {
      const bars = HIGHER_2018_Q3_LINES[lineName];
      const top = tops[lineName];
      const lineRight = options.right || right;
      const lineStart = options.musicStart || musicStart;
      const barEnds = options.barEnds || layout.barEnds[lineName];
      higher2015Staff(svg, top, { left, right: lineRight, timeSignature: options.timeSignature, timeSignatureValue: "4/4" });
      staffLabel(lineName, top);
      const width = (lineRight - lineStart) / bars.length;
      const positions = [];
      const points = [];
      bars.forEach((item, barIndex) => {
        const start = barIndex === 0 ? lineStart : barEnds?.[barIndex - 1] || lineStart + barIndex * width;
        const end = barEnds?.[barIndex] || lineStart + (barIndex + 1) * width;
        const endPadding = Array.isArray(options.positionEndPadding)
          ? Number(options.positionEndPadding[barIndex] || 0)
          : Number(options.positionEndPadding || 0);
        const itemPositions = offsetPositions(higher2015Positions(item.notes, start, end - endPadding, { firstInSystem: barIndex === 0 }));
        positions[barIndex] = itemPositions;
        points[barIndex] = higher2015DrawNotes(svg, item.notes, itemPositions, top, { hiddenIndices: options.hidden?.[barIndex] || [], beamGroups: item.beamGroups, slurs: item.slurs });
        if (barIndex < bars.length - 1 || options.finalBarline !== false) svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
      for (let barIndex = 0; barIndex < bars.length - 1; barIndex += 1) {
        const first = points[barIndex]?.at(-1);
        const second = points[barIndex + 1]?.[0];
        if (bars[barIndex].notes.at(-1)?.tieToNextBar && first && second) q3DrawTie(svg, first, second);
      }
      rendered[lineName] = { bars, top, width, positions, points, barEnds: barEnds || bars.map((_bar, index) => lineStart + (index + 1) * width) };
      return rendered[lineName];
    }

    // Line 1 is the printed drum introduction. Standard noteheads are used
    // for its unpitched quavers while retaining the exact rhythmic inventory.
    higher2015Staff(svg, tops.line1, { left, right, timeSignature: true, timeSignatureValue: "4/4", timeSignatureXOffset: layout.timeSignatureXOffset });
    staffLabel("line1", tops.line1);
    q3Text(svg, "[Drums]", { x: 128, y: tops.line1 + layout.drumLabelYOffset, "text-anchor": "start" }, "higher-2018-drums-label");
    const line1Positions = offsetPositions(higher2015Positions(HIGHER_2018_Q3_LINES.line1, layout.line1MusicStart, right, { firstInSystem: true }));
    higher2015DrawNotes(svg, HIGHER_2018_Q3_LINES.line1, line1Positions, tops.line1, { beamGroups: [{ start: 0, end: 3 }, { start: 4, end: 7 }, { start: 8, end: 11 }, { start: 12, end: 15 }] });
    line1Positions.forEach(x => {
      const y = q3YForStep(Q3_PITCH_STEPS.B4, tops.line1);
      svg.append(svgElement("circle", { cx: x + layout.drumCircleOffsetX, cy: y + layout.drumCircleOffsetY, r: 6.5, fill: "white", stroke: "none" }));
      q3Text(svg, "×", { x: x + layout.drumNoteOffsetX, y: y + layout.drumNoteYOffset, "font-size": 24, "text-anchor": "middle", "dominant-baseline": "central" }, "q3-score-drum-notehead");
    });
    svg.append(svgElement("line", { x1: (line1Positions[7] + line1Positions[8]) / 2, x2: (line1Positions[7] + line1Positions[8]) / 2, y1: tops.line1, y2: tops.line1 + Q3_STAFF.gap * 4, class: "q3-barline" }));
    svg.append(svgElement("line", { x1: right, x2: right, y1: tops.line1, y2: tops.line1 + Q3_STAFF.gap * 4, class: "q3-barline" }));

    // Line 2 is a continuous bar-line exercise. The source prints one
    // boundary; all of the other note-to-note gaps inside the marking box
    // remain available as placement targets so pupils can practise placing a
    // barline at any internal position. Only the two official gaps earn the
    // mark.
    const barlineBox = layout.boxes.barlines;
    svg.append(svgElement("rect", { ...barlineBox, class: "q3-marking-box" }));
    q3Text(svg, "(a) Bar lines", { x: barlineBox.x + 10, y: barlineBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    higher2015Staff(svg, tops.line2, { left, right });
    staffLabel("line2", tops.line2);
    const line2 = HIGHER_2018_Q3_LINES.line2;
    const line2Positions = offsetPositions(higher2015Positions(line2, musicStart, right, { firstInSystem: true }));
    const line2Points = higher2015DrawNotes(svg, line2, line2Positions, tops.line2, { beamGroups: HIGHER_2018_Q3_LINE2_BEAM_GROUPS });
    const line2Gaps = line2Positions.slice(0, -1).map((position, index) => {
      const gapNumber = index === 0 ? 0 : index;
      return { gapNumber, id: `line2-gap-${gapNumber}`, x: (position + line2Positions[index + 1]) / 2 };
    });
    line2Gaps.filter(({ id }) => HIGHER_2018_Q3_LINE2_PRINTED_BARLINE_IDS.includes(id)).forEach(({ x }) => {
      svg.append(svgElement("line", { x1: x, x2: x, y1: tops.line2, y2: tops.line2 + Q3_STAFF.gap * 4, class: "q3-barline q3-printed-barline" }));
    });
    svg.append(svgElement("line", { x1: right, x2: right, y1: tops.line2, y2: tops.line2 + Q3_STAFF.gap * 4, class: "q3-barline" }));
    line2.forEach((item, index) => { if (item.tieToNext && line2Points[index] && line2Points[index + 1]) q3DrawTie(svg, line2Points[index], line2Points[index + 1]); });
    HIGHER_2018_Q3_LINE2_ACCIACCATURAS.forEach(({ mainNoteIndex, gracePitch, symbol }) => {
      const mainPoint = line2Points[mainNoteIndex];
      if (!mainPoint) return;
      q3CalibratedSymbol(svg, symbol, mainPoint.x - Q3_STAFF.gap * 1.15, q3YForStep(Q3_PITCH_STEPS[gracePitch], tops.line2), { className: "q3-line2-acciaccatura" });
    });
    const enteredBarlines = String(answers.q3a || "").split(",").filter(Boolean);
    const expectedBarlines = String(correctAnswer("q3a", HIGHER_2018_Q3_LINE2_MISSING_BARLINE_IDS.join(","))).split(",");
    const line2EditableGaps = line2Gaps.filter(({ id, x, gapNumber }) => gapNumber > 0 && !HIGHER_2018_Q3_LINE2_PRINTED_BARLINE_IDS.includes(id) && x >= barlineBox.x && x <= barlineBox.x + barlineBox.width);
    line2EditableGaps.forEach(({ gapNumber, id, x }, editableIndex) => {
      const placed = enteredBarlines.includes(id);
      if (placed) svg.append(svgElement("line", { x1: x, x2: x, y1: tops.line2, y2: tops.line2 + Q3_STAFF.gap * 4, class: `q3-barline ${review.q3a ? expectedBarlines.includes(id) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim() }));
      if (needsCorrection("q3a") && expectedBarlines.includes(id) && !placed) svg.append(svgElement("line", { x1: x, x2: x, y1: tops.line2, y2: tops.line2 + Q3_STAFF.gap * 4, class: "q3-barline q3-answer-correction" }));
      if (!onAnswerChange) return;
      const preview = placed ? null : svgElement("line", { x1: x, x2: x, y1: tops.line2, y2: tops.line2 + Q3_STAFF.gap * 4, class: "q3-barline higher-2015-barline-preview" });
      if (preview) svg.append(preview);
      const previousGap = line2EditableGaps[editableIndex - 1];
      const nextGap = line2EditableGaps[editableIndex + 1];
      const targetLeft = previousGap ? (previousGap.x + x) / 2 : barlineBox.x;
      const targetRight = nextGap ? (x + nextGap.x) / 2 : barlineBox.x + barlineBox.width;
      const target = svgElement("rect", { x: targetLeft, y: tops.line2 - 14, width: Math.max(1, targetRight - targetLeft), height: 76, class: "q3-bar-label-hit-area", tabindex: "0", role: "button", "aria-label": `Place bar line in line 2 gap ${gapNumber}` });
      target.addEventListener("pointerenter", () => preview?.classList.add("is-visible"));
      target.addEventListener("pointerleave", () => preview?.classList.remove("is-visible"));
      target.addEventListener("focus", () => preview?.classList.add("is-visible"));
      target.addEventListener("blur", () => preview?.classList.remove("is-visible"));
      target.addEventListener("click", () => { if (!placed) onAnswerChange("q3a", [...enteredBarlines, id].sort((a, b) => Number(a.split("-").at(-1)) - Number(b.split("-").at(-1))).join(",")); });
      bindRemovalGesture(target, () => { if (placed) onAnswerChange("q3a", enteredBarlines.filter(value => value !== id).join(",")); });
      svg.append(target);
    });

    const transposeBox = layout.boxes.transpose;
    svg.append(svgElement("rect", { ...transposeBox, class: "q3-marking-box" }));
    q3Text(svg, "(b) Transpose", { x: transposeBox.x + 10, y: transposeBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    const line3 = drawBarLine("line3");
    const bassTop = layout.bassStaff.top;
    higher2015Staff(svg, bassTop, { left: layout.bassStaff.left, right: layout.bassStaff.right, bass: true });
    svg.append(svgElement("line", { x1: line3.barEnds[0], x2: line3.barEnds[0], y1: bassTop, y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    const transposeXs = [
      line3.positions[0][0], line3.positions[0][1], line3.positions[0][2], line3.positions[1][0],
    ];
    const bassSteps = { G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, "F♯3": 6, G3: 7, A3: 8, B3: 9, C4: 10 };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q3b || "").replaceAll("#", "♯").split(",");
    const transposeExpected = String(correctAnswer("q3b", "A3,E3,A3,F♯3")).split(",");
    transposeValues.forEach((pitch, index) => {
      if (bassSteps[pitch] === undefined) return;
      q3DrawNote(svg, { ...HIGHER_2018_Q3_LINES.transpose[index], pitch, step: bassSteps[pitch], accidentalXOffset: -7 }, transposeXs[index], bassTop, { className: review.q3b ? pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "" });
    });
    if (needsCorrection("q3b")) transposeExpected.forEach((pitch, index) => {
      if (transposeValues[index] === pitch) return;
      q3DrawNote(svg, { ...HIGHER_2018_Q3_LINES.transpose[index], pitch, step: bassSteps[pitch], accidentalXOffset: -7 }, transposeXs[index] + (transposeValues[index] ? 7 : 0), bassTop, { className: "q3-answer-correction", opacity: .9 });
    });

    const notesBox = layout.boxes.notes;
    svg.append(svgElement("rect", { ...notesBox, class: "q3-marking-box" }));
    q3Text(svg, "(c) Notes", { x: notesBox.x + 8, y: notesBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    const line4 = drawBarLine("line4", { hidden: { 4: [0, 1, 2] } });
    const missingXs = line4.positions[4];
    higher2015DrawNotes(svg, [note("B4", "minim"), note("B4", "crotchet"), note("B4", "crotchet")], missingXs, tops.line4 - 38);
    const missingValues = String(answers.q3c || "").split(",");
    const missingExpected = String(correctAnswer("q3c", "B4,A4,G4")).split(",");
    missingValues.forEach((pitch, index) => {
      if (Q3_PITCH_STEPS[pitch] === undefined) return;
      q3DrawNote(svg, { ...HIGHER_2018_Q3_LINES.line4[4].notes[index], pitch, step: Q3_PITCH_STEPS[pitch] }, missingXs[index], tops.line4, { className: review.q3c ? pitch === missingExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "" });
    });
    if (needsCorrection("q3c")) missingExpected.forEach((pitch, index) => { if (missingValues[index] !== pitch) q3DrawNote(svg, { ...HIGHER_2018_Q3_LINES.line4[4].notes[index], pitch, step: Q3_PITCH_STEPS[pitch] }, missingXs[index] + (missingValues[index] ? 7 : 0), tops.line4, { className: "q3-answer-correction", opacity: .9 }); });

    const line5 = drawBarLine("line5");
    const intervalBox = layout.boxes.interval;
    svg.append(svgElement("rect", { ...intervalBox, class: "q3-marking-box" }));
    q3Text(svg, "(d) Interval:", { x: intervalBox.x + 8, y: intervalBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q3d", x: intervalBox.x + 9, y: intervalBox.y + 27, width: intervalBox.width - 18, label: "Answer for part (d), interval in line 5", correction: "4th" });

    drawBarLine("line6", { positionEndPadding: layout.denseBarNoteEndPadding.line6 });
    drawBarLine("line7", { positionEndPadding: layout.denseBarNoteEndPadding.line7 });
    const rhythmValues = String(answers.q3e || "").split(",").slice(0, 3);
    while (rhythmValues.length < 3) rhythmValues.push("_");
    const enteredRhythmIndices = rhythmValues.reduce((indices, value, index) => {
      if (value && value !== "_") indices.push(index);
      return indices;
    }, []);
    const line8Hidden = enteredRhythmIndices.length ? { 2: enteredRhythmIndices } : {};
    const line8 = drawBarLine("line8", { hidden: line8Hidden });
    const rhythmXs = line8.positions[2].slice(0, 3);
    const rhythmBox = layout.boxes.rhythm;
    svg.append(svgElement("rect", { ...rhythmBox, class: "q3-marking-box" }));
    q3Text(svg, "(e) Rhythm", { x: rhythmBox.x + 10, y: rhythmBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    const rhythmMember = value => value === "tripletQuaver" ? "quaver" : value === "tripletCrotchet" ? "crotchet" : value;
    const rhythmNotes = values => values.map((value, index) => value && value !== "_" ? { ...HIGHER_2018_Q3_LINES.line8[2].notes[index], rhythm: rhythmMember(value) } : null);
    const tripletValue = rhythmValues.every(value => value === "tripletQuaver")
      ? "tripletQuaver"
      : rhythmValues.every(value => value === "tripletCrotchet") ? "tripletCrotchet" : "";
    if (answers.q3e) {
      const expected = String(correctAnswer("q3e", "tripletCrotchet,tripletCrotchet,tripletCrotchet"));
      const className = review.q3e ? String(answers.q3e) === expected ? "q3-answer-correct" : "q3-answer-incorrect" : "";
      const placedNotes = rhythmNotes(rhythmValues);
      if (tripletValue) {
        const placedPoints = higher2015DrawNotes(svg, placedNotes, rhythmXs, tops.line8, { beamGroups: tripletValue === "tripletQuaver" ? [{ start: 0, end: 2 }] : [], className });
        q3DrawTupletMark(svg, placedNotes, rhythmXs, tops.line8, {
          isQuaverTriplet: tripletValue === "tripletQuaver",
          points: placedPoints,
          className,
        });
      } else {
        placedNotes.forEach((item, index) => { if (item) q3DrawNote(svg, item, rhythmXs[index], tops.line8, { className }); });
      }
    }
    if (needsCorrection("q3e") && String(answers.q3e) !== correctAnswer("q3e", "tripletCrotchet,tripletCrotchet,tripletCrotchet")) {
      const correctedNotes = HIGHER_2018_Q3_LINES.line8[2].notes.slice(0, 3).map(item => ({ ...item, rhythm: "crotchet" }));
      const correctedXs = rhythmXs.map(x => x + 6);
      const correctedPoints = higher2015DrawNotes(svg, correctedNotes, correctedXs, tops.line8, { beamGroups: [], className: "q3-answer-correction", opacity: .9 });
      q3DrawTupletMark(svg, correctedNotes, correctedXs, tops.line8, {
        isQuaverTriplet: false,
        points: correctedPoints,
        className: "q3-answer-correction",
        opacity: .9,
      });
    }
    if (onAnswerChange) {
      const questionCard = svg.closest(".question-card");
      const currentRhythms = () => {
        const current = String(questionCard?.dataset.q3CurrentRhythmValue ?? answers.q3e ?? "").split(",").slice(0, 3);
        while (current.length < 3) current.push("_");
        return current;
      };
      const saveRhythms = current => {
        const nextValue = current.every(value => !value || value === "_") ? "" : current.join(",");
        if (questionCard) questionCard.dataset.q3CurrentRhythmValue = nextValue;
        onAnswerChange("q3e", nextValue);
      };
      rhythmXs.forEach((x, index) => {
        let preview = null;
        const showPreview = () => {
          if (!q3RhythmToolArmed || preview) return;
          preview = svgElement("g", { class: "q3-note-preview q3-rhythm-preview" });
          if (["tripletQuaver", "tripletCrotchet"].includes(q3RhythmToolArmed)) {
            const previewNotes = HIGHER_2018_Q3_LINES.line8[2].notes.slice(0, 3).map(item => ({ ...item, rhythm: rhythmMember(q3RhythmToolArmed) }));
            const previewPoints = higher2015DrawNotes(preview, previewNotes, rhythmXs, tops.line8, { beamGroups: q3RhythmToolArmed === "tripletQuaver" ? [{ start: 0, end: 2 }] : [], opacity: .35 });
            q3DrawTupletMark(preview, previewNotes, rhythmXs, tops.line8, {
              isQuaverTriplet: q3RhythmToolArmed === "tripletQuaver",
              points: previewPoints,
              opacity: .35,
            });
          } else {
            q3DrawNote(preview, { ...HIGHER_2018_Q3_LINES.line8[2].notes[index], rhythm: q3RhythmToolArmed }, x, tops.line8, { opacity: .35 });
          }
          svg.append(preview);
          svg.append(target);
        };
        const hidePreview = () => { preview?.remove(); preview = null; };
        const placedRhythm = currentRhythms()[index];
        const target = svgElement("rect", {
          x: x - 22,
          y: tops.line8 - 20,
          width: 44,
          height: 84,
          class: "q3-rhythm-hit-area",
          role: "button",
          tabindex: q3RhythmToolArmed || (placedRhythm && placedRhythm !== "_") ? "0" : "-1",
          "aria-disabled": String(!q3RhythmToolArmed && (!placedRhythm || placedRhythm === "_")),
          "aria-label": `Apply a rhythm to note ${index + 1} in the line 8 box`,
        });
        if (placedRhythm && placedRhythm !== "_") {
          target.dataset.rhythmPlaced = "true";
          target.setAttribute("aria-label", `Rhythm applied to note ${index + 1} in the line 8 box. Double-click, double-tap or right-click to remove it.`);
          target.setAttribute("aria-keyshortcuts", "Shift+Delete");
        }
        const placeRhythm = event => {
          if (!q3RhythmToolArmed) return;
          event?.preventDefault?.();
          hidePreview();
          const current = currentRhythms();
          if (["tripletQuaver", "tripletCrotchet"].includes(q3RhythmToolArmed)) current.fill(q3RhythmToolArmed);
          else current[index] = q3RhythmToolArmed;
          saveRhythms(current);
        };
        target.addEventListener("pointerenter", showPreview);
        target.addEventListener("pointerleave", hidePreview);
        target.addEventListener("pointerdown", event => event.preventDefault());
        target.addEventListener("focus", showPreview);
        target.addEventListener("blur", hidePreview);
        target.addEventListener("click", placeRhythm);
        target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) placeRhythm(event); });
        bindRemovalGesture(target, () => {
          const current = currentRhythms();
          if (!current[index] || current[index] === "_") return;
          hidePreview();
          if (["tripletQuaver", "tripletCrotchet"].includes(current[index])) current.fill("_");
          else current[index] = "_";
          saveRhythms(current);
        });
        svg.append(target);
      });
    }

    const line9 = drawBarLine("line9", { right: layout.line9Right, finalBarline: false });
    higher2015SystemBreakTie(svg, line8.points[2]?.at(-1), line9.points[0]?.[0], right - 4, musicStart + 4);
    const chordBox = layout.boxes.chords;
    svg.append(svgElement("rect", { ...chordBox, class: "q3-marking-box" }));
    q3Text(svg, "(f) Chords", { x: chordBox.x + 10, y: chordBox.y + 22, "text-anchor": "start" }, "q3-marking-box-label");
    const givenChordBox = layout.givenChordBox;
    svg.append(svgElement("rect", { x: givenChordBox.x, y: givenChordBox.y, width: givenChordBox.width, height: givenChordBox.rowHeight * 2, class: "q3-marking-box" }));
    svg.append(svgElement("line", { x1: givenChordBox.x, x2: givenChordBox.x + givenChordBox.width, y1: givenChordBox.y + givenChordBox.rowHeight, y2: givenChordBox.y + givenChordBox.rowHeight, class: "q3-answer-line" }));
    q3Text(svg, "Am", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");
    q3Text(svg, "VI", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight + givenChordBox.rowHeight / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");
    const chordValues = String(answers.q3f || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    const chordExpected = ["F", "G"];
    [1, 2].forEach((barIndex, order) => {
      const answerBox = layout.chordAnswerBoxes[order];
      const accepted = [order === 0 ? "F" : "G", order === 0 ? "IV" : "V", order === 0 ? "4" : "5"];
      svg.append(svgElement("rect", { ...answerBox, class: "q3-marking-box higher-2018-chord-answer-box" }));
      if (onAnswerChange) higher2015TextInput(svg, { ...answerBox, value: chordValues[order] || "", className: "is-boxed", label: `Chord ${order + 1} for part (f)`, maxLength: 2, formatValue: formatHigherChordAnswer, onInput: next => { chordValues[order] = next; onAnswerChange("q3f", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        if (chordValues[order]) q3Text(svg, chordValues[order], { x: answerBox.x + answerBox.width / 2, y: answerBox.y + 27, "text-anchor": "middle" }, `q3-entered-answer ${review.q3f ? accepted.includes(String(chordValues[order]).toUpperCase()) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim());
        if (needsCorrection("q3f") && !accepted.includes(String(chordValues[order] || "").toUpperCase())) q3Text(svg, chordExpected[order], { x: answerBox.x + answerBox.width / 2, y: answerBox.y + 13, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q3b", xs: transposeXs, top: bassTop, pitchMap: bassPitchY, rhythms: HIGHER_2018_Q3_LINES.transpose.map(item => item.rhythm), label: "Transposed notes in the bass clef" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q3c", xs: missingXs, top: tops.line4, pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], tops.line4)])), rhythms: ["minim", "crotchet", "crotchet"], label: "Missing notes in line 4" });
    return svg;
  }

  function higher2019ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2019-q3-score", viewBox: `0 0 920 ${HIGHER_2019_Q3_SCORE_LAYOUT.viewBoxHeight}`, role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2019 Question 3 score` });
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const { systems, staffLeft, musicStart, musicEnd, barEnds: systemBarEnds, boxes } = HIGHER_2019_Q3_SCORE_LAYOUT;
    const groups = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [16, 17, 18, 19], [20, 21, 22], [23, 24]];
    const barPositions = [];
    const barPoints = [];
    const barTops = [];
    const barStarts = [];
    const barEnds = [];

    Object.values(boxes).forEach(box => svg.append(svgElement("rect", { ...box, class: "q3-marking-box" })));
    q3Text(svg, "(a) Time signature", { x: boxes.time.x + 10, y: boxes.time.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(b) Interval:", { x: boxes.interval.x + 10, y: boxes.interval.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(c) Chords", { x: boxes.chords.x + 10, y: boxes.chords.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(d) Notes", { x: boxes.notes.x + 10, y: boxes.notes.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(e) Rest", { x: boxes.rest.x + 10, y: boxes.rest.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    q3Text(svg, "(f) Transpose", { x: boxes.transpose.x + 10, y: boxes.transpose.y + 25, "text-anchor": "start" }, "q3-marking-box-label");

    systems.forEach((top, systemIndex) => {
      const group = groups[systemIndex];
      const systemRight = systemBarEnds[systemIndex].at(-1);
      higher2015Staff(svg, top, { left: staffLeft, right: systemRight, flatKeySignature: true });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2019_Q3_BARS[barIndex];
        const start = local === 0 ? musicStart : systemBarEnds[systemIndex][local - 1];
        const end = systemBarEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions;
        barTops[barIndex] = top;
        barStarts[barIndex] = start;
        barEnds[barIndex] = end;

        q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        const hiddenIndices = item.missingIndices || [];
        barPoints[barIndex] = higher2015DrawNotes(svg, item.notes, positions, top, { hiddenIndices, beamGroups: item.beamGroups, slurs: item.slurs });
        higher2015Lyrics(svg, HIGHER_2019_Q3_LYRICS[barIndex], positions, top, {
          textAnchors: HIGHER_2019_Q3_LYRIC_TEXT_ANCHORS[barIndex],
        });
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
    });

    [[2, 3], [4, 5], [8, 9]].forEach(([from, to]) => {
      const first = barPoints[from]?.at(-1);
      const second = barPoints[to]?.[0];
      if (!first || !second) return;
      if (barTops[from] === barTops[to]) q3DrawTie(svg, first, second);
      else higher2015SystemBreakTie(svg, first, second, barEnds[from] - 4, barStarts[to] + 4);
    });

    if (answers.q3a) q3DrawTimeSignature(svg, answers.q3a, systems[0], answerClass("q3a"), 0, HIGHER_2019_Q3_SCORE_LAYOUT.timeSignatureX);
    if (needsCorrection("q3a") && String(answers.q3a || "") !== "6/8") q3DrawTimeSignature(svg, correctAnswer("q3a", "6/8"), systems[0], "q3-answer-correction", answers.q3a ? 18 : 0, HIGHER_2019_Q3_SCORE_LAYOUT.timeSignatureX);
    if (answers.q3a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: 107, y: systems[0] - 7, width: 44, height: 64 }, "Time signature", () => onAnswerChange("q3a", ""));

    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q3b", x: boxes.interval.x + 10, y: boxes.interval.y + 25, width: boxes.interval.width - 20, label: "Answer for part (b), interval in bars 2 and 3", correction: "5th" });

    const givenChordBox = HIGHER_2019_Q3_SCORE_LAYOUT.givenChordBox;
    svg.append(svgElement("rect", { x: givenChordBox.x, y: givenChordBox.y, width: givenChordBox.width, height: givenChordBox.rowHeight * 2, class: "q3-marking-box" }));
    svg.append(svgElement("line", { x1: givenChordBox.x, x2: givenChordBox.x + givenChordBox.width, y1: givenChordBox.y + givenChordBox.rowHeight, y2: givenChordBox.y + givenChordBox.rowHeight, class: "q3-answer-line" }));
    q3Text(svg, "B♭", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");
    q3Text(svg, "IV", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight * 1.5, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");
    const chordValues = String(answers.q3c || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    const chordExpected = ["C", "Dm"];
    [9, 10].forEach((barIndex, order) => {
      const answerBox = HIGHER_2019_Q3_SCORE_LAYOUT.chordAnswerBoxes[order];
      const accepted = order === 0 ? ["C", "V", "5"] : ["DM", "DMI", "VI", "6"];
      const current = String(chordValues[order] || "").toUpperCase();
      svg.append(svgElement("rect", { ...answerBox, class: "q3-marking-box higher-2019-chord-answer-box" }));
      if (onAnswerChange) higher2015TextInput(svg, { ...answerBox, value: chordValues[order] || "", className: "is-boxed", label: `Chord ${order + 1} for part (c)`, maxLength: 3, formatValue: formatHigherChordAnswer, onInput: next => { chordValues[order] = next; onAnswerChange("q3c", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        if (chordValues[order]) q3Text(svg, chordValues[order], { x: answerBox.x + answerBox.width / 2, y: answerBox.y + 28, "text-anchor": "middle" }, `q3-entered-answer ${review.q3c ? accepted.includes(current) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim());
        if (needsCorrection("q3c") && !accepted.includes(current)) q3Text(svg, chordExpected[order], { x: answerBox.x + answerBox.width / 2, y: answerBox.y + 13, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    const missingBars = [13, 14];
    const missingXs = missingBars.map(index => barPositions[index][0]);
    higher2015DrawNotes(svg, [note("B4", "dottedMinim"), note("B4", "dottedMinim")], missingXs, systems[3] - 38);
    const missingValues = String(answers.q3d || "").split(",");
    const missingExpected = String(correctAnswer("q3d", "G4,F4")).split(",");
    missingValues.forEach((pitch, index) => {
      if (Q3_PITCH_STEPS[pitch] === undefined) return;
      q3DrawNote(svg, { ...HIGHER_2019_Q3_BARS[missingBars[index]].notes[0], pitch, step: Q3_PITCH_STEPS[pitch] }, missingXs[index], systems[3], { className: review.q3d ? pitch === missingExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "" });
    });
    if (needsCorrection("q3d")) missingExpected.forEach((pitch, index) => { if (missingValues[index] !== pitch) q3DrawNote(svg, { ...HIGHER_2019_Q3_BARS[missingBars[index]].notes[0], pitch, step: Q3_PITCH_STEPS[pitch] }, missingXs[index] + (missingValues[index] ? 7 : 0), systems[3], { className: "q3-answer-correction", opacity: .9 }); });

    const restX = barPositions[20][0];
    const selectedRest = Q3_REST_TOOL_VALUES.includes(answers.q3e) ? answers.q3e : "";
    const correctRest = correctAnswer("q3e", "quaverRest");
    if (selectedRest) q3DrawNote(svg, rest(selectedRest), restX, systems[5], { className: answerClass("q3e") });
    if (needsCorrection("q3e") && selectedRest !== correctRest) q3DrawNote(svg, rest(correctRest), restX + (selectedRest ? 7 : 0), systems[5], { className: "q3-answer-correction", opacity: .9 });
    if (onAnswerChange) {
      let preview = null;
      const target = svgElement("rect", { x: restX - 25, y: systems[5] - 19, width: 50, height: 82, class: "q3-rhythm-hit-area", role: "button", tabindex: q3RhythmToolArmed || selectedRest ? "0" : "-1", "aria-disabled": String(!q3RhythmToolArmed && !selectedRest), "aria-label": "Place the missing rest in bar 21" });
      if (selectedRest) target.dataset.rhythmPlaced = "true";
      const showPreview = () => { if (!Q3_REST_TOOL_VALUES.includes(q3RhythmToolArmed) || preview || selectedRest) return; preview = svgElement("g", { class: "q3-note-preview" }); q3DrawNote(preview, rest(q3RhythmToolArmed), restX, systems[5], { opacity: .48 }); svg.append(preview); svg.append(target); };
      const hidePreview = () => { preview?.remove(); preview = null; };
      const place = event => { if (!Q3_REST_TOOL_VALUES.includes(q3RhythmToolArmed)) return; event?.preventDefault?.(); hidePreview(); const value = q3RhythmToolArmed; q3SetRhythmToolArmed("", svg); onAnswerChange("q3e", value); };
      target.addEventListener("pointerenter", showPreview); target.addEventListener("pointerleave", hidePreview); target.addEventListener("focus", showPreview); target.addEventListener("blur", hidePreview); target.addEventListener("click", place); target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(event); });
      bindRemovalGesture(target, () => { if (answers.q3e) onAnswerChange("q3e", ""); });
      svg.append(target);
    }

    const { top: bassTop, left: bassLeft, right: bassRight, barlineX: bassBarlineX } = HIGHER_2019_Q3_SCORE_LAYOUT.bassStaff;
    higher2015Staff(svg, bassTop, { left: bassLeft, right: bassRight, bass: true, flatKeySignature: true, flatKeySignatureStep: 2 });
    svg.append(svgElement("line", { x1: bassBarlineX, x2: bassBarlineX, y1: bassTop, y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    const transposeXs = barPositions[23].slice(1, 5);
    const bassSteps = { G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, F3: 6, G3: 7, A3: 8, B3: 9, C4: 10, D4: 11 };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q3f || "").split(",");
    const transposeExpected = String(correctAnswer("q3f", "A3,A3,C4,A3")).split(",");
    // Bar 24 begins with the printed crotchet rest in both staves.
    higher2015DrawNotes(svg, [HIGHER_2019_Q3_BARS[23].notes[0]], [barPositions[23][0]], bassTop);
    const transposeNotes = HIGHER_2019_Q3_TRANSPOSE.map((item, index) => bassSteps[transposeValues[index]] === undefined ? null : { ...item, pitch: transposeValues[index], step: bassSteps[transposeValues[index]] });
    higher2015DrawNotes(svg, transposeNotes, transposeXs, bassTop, {
      beamGroups: [{ start: 1, end: 3 }],
      classNames: transposeValues.map((pitch, index) => review.q3f ? pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : ""),
    });
    if (needsCorrection("q3f")) higher2015DrawNotes(svg, HIGHER_2019_Q3_TRANSPOSE.map((item, index) => ({ ...item, pitch: transposeExpected[index], step: bassSteps[transposeExpected[index]] })), transposeXs.map(x => x + (transposeValues.some(Boolean) ? 7 : 0)), bassTop, { beamGroups: [{ start: 1, end: 3 }], className: "q3-answer-correction", opacity: .9 });

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q3d", xs: missingXs, top: systems[3], pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[3])])), rhythms: ["dottedMinim", "dottedMinim"], label: "Missing notes in bars 14 and 15" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q3f", xs: transposeXs, top: bassTop, pitchMap: bassPitchY, rhythms: HIGHER_2019_Q3_TRANSPOSE.map(item => item.rhythm), label: "Transposed notes in the bass clef" });
    return svg;
  }

  function higher2025ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2025-q4-score", viewBox: "0 0 920 1405", role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2025 Question 4 score` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const { systems, musicStart, musicEnd, barEnds: systemBarEnds } = HIGHER_2025_Q4_SCORE_LAYOUT;
    const groups = [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], [16,17,18,19], [20,21,22,23]];
    const staffLeft = 50;
    const barPositions = [], barStarts = [], barEnds = [], barPoints = [];

    systems.forEach((top, systemIndex) => {
      const group = groups[systemIndex];
      higher2015Staff(svg, top, { left: staffLeft, right: musicEnd, sharpKeySignature: true, timeSignature: systemIndex === 0, timeSignatureValue: "4/4", timeSignatureXOffset: systemIndex === 0 ? 20 : 0 });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2025_Q4_BARS[barIndex];
        const start = local === 0 ? musicStart : systemBarEnds[systemIndex][local - 1];
        const end = systemBarEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions; barStarts[barIndex] = start; barEnds[barIndex] = end;
        const boxByBar = { 2: "a", 6: "b", 10: "c", 16: "d", 20: "e", 22: "f" };
        const boxLabels = { a: "(a) Subdominant note", b: "(b) Chords", c: "(c) Transpose", d: "(d) Notes", e: "(e) Bar line", f: "(f) Interval" };
        const boxKey = boxByBar[barIndex];
        if (boxKey) {
          const box = HIGHER_2025_Q4_SCORE_LAYOUT.boxes[boxKey];
          svg.append(svgElement("rect", { ...box, class: "q3-marking-box" }));
          q3Text(svg, boxLabels[boxKey], { x: box.x + 4, y: box.y + 27, "text-anchor": "start" }, "q3-marking-box-label");
        }
        // The source starts each new system's first label at the staff edge,
        // omits bar 1 and omits bar 22 because its bar line is missing.
        if (![0, 21].includes(barIndex)) {
          q3Text(svg, String(barIndex + 1), { x: local === 0 ? staffLeft + 6 : start + 2, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        }
        barPoints[barIndex] = higher2015DrawNotes(svg,item.notes,positions,top,{hiddenIndices:item.missingIndices||[],beamGroups:item.beamGroups,slurs:item.slurs});
        higher2015Lyrics(svg, HIGHER_2025_Q4_LYRICS[barIndex], positions, top, { xOffsets: HIGHER_2025_Q4_LYRIC_OFFSETS[barIndex] });
        if (!item.missingBarlineAfter) {
          const final = barIndex === HIGHER_2025_Q4_BARS.length - 1;
          if (final) q3CalibratedSymbol(svg, "barlineFinal", end, q3YForStep(4, top), { className: "q3-final-barline" });
          else svg.append(svgElement("line",{x1:end,x2:end,y1:top,y2:top+Q3_STAFF.gap*4,class:"q3-barline"}));
        }
      });
    });
    for (let barIndex = 0; barIndex < HIGHER_2025_Q4_BARS.length - 1; barIndex += 1) {
      const first = barPoints[barIndex]?.at(-1);
      const second = barPoints[barIndex + 1]?.[0];
      if (HIGHER_2025_Q4_BARS[barIndex].notes.at(-1)?.tieToNextBar && first && second) q3DrawTie(svg, first, second);
    }

    const subdominantBar = HIGHER_2025_Q4_BARS[2];
    const subdominantIndex = subdominantBar.subdominantIndices[0];
    const selectableSubdominantIndices = subdominantBar.subdominantSelectableIndices || subdominantBar.notes.map((item, index) => item.rest ? null : index).filter(index => index !== null);
    const selectedSubdominantMatch = String(answers.q4a || "").match(/^bar-3-note-(\d+)$/);
    const selectedSubdominantIndex = answers.q4a === "bar-3-c"
      ? subdominantIndex
      : selectedSubdominantMatch && selectableSubdominantIndices.includes(Number(selectedSubdominantMatch[1]))
        ? Number(selectedSubdominantMatch[1])
        : null;
    if (selectedSubdominantIndex !== null) {
      const selectedNote = subdominantBar.notes[selectedSubdominantIndex];
      const selectedX = barPositions[2][selectedSubdominantIndex];
      const selectedY = q3YForStep(selectedNote.step, systems[0]);
      svg.append(svgElement("ellipse", { cx: selectedX, cy: selectedY, rx: 15, ry: 12, fill: "none", class: `q3-note-selection-outline ${answerClass("q4a") || "q3-entered-answer"}`.trim(), stroke: "currentColor", "stroke-width": 2 }));
    }
    if (needsCorrection("q4a") && selectedSubdominantIndex !== subdominantIndex) {
      const correctX = barPositions[2][subdominantIndex];
      const correctY = q3YForStep(subdominantBar.notes[subdominantIndex].step, systems[0]);
      svg.append(svgElement("ellipse", { cx: correctX, cy: correctY, rx: 15, ry: 12, fill: "none", class: "q3-note-selection-outline q3-answer-correction", stroke: "currentColor", "stroke-width": 2 }));
    }
    if (onAnswerChange) {
      selectableSubdominantIndices.forEach(noteIndex => {
        const noteItem = subdominantBar.notes[noteIndex];
        const noteX = barPositions[2][noteIndex];
        const noteY = q3YForStep(noteItem.step, systems[0]);
        const target = svgElement("rect", { x: noteX - 22, y: noteY - 22, width: 44, height: 44, class: "q3-note-hit-area", role: "button", tabindex: "0", "aria-label": `Select note ${noteIndex} in bar 3 for the subdominant answer` });
        const place = () => onAnswerChange("q4a", noteIndex === subdominantIndex ? "bar-3-c" : `bar-3-note-${noteIndex}`);
        target.addEventListener("click", place);
        target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(); });
        bindRemovalGesture(target, () => { if (selectedSubdominantIndex === noteIndex) onAnswerChange("q4a", ""); });
        svg.append(target);
      });
    }

    const givenChord = HIGHER_2025_Q4_SCORE_LAYOUT.givenChord;
    [0, 1].forEach(row => {
      svg.append(svgElement("rect", {
        x: givenChord.x - givenChord.width / 2,
        y: givenChord.y + row * givenChord.rowHeight,
        width: givenChord.width,
        height: givenChord.rowHeight,
        class: "q3-marking-box",
      }));
    });
    ["C", "IV"].forEach((label, row) => q3Text(svg, label, {
      x: givenChord.x,
      y: givenChord.y + row * givenChord.rowHeight + givenChord.rowHeight / 2,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
    }, "q3-marking-box-label higher-2025-given-chord-label"));
    const chordValues=String(answers.q4b||"").split(/[\s,]+/).filter(Boolean).slice(0,2);
    [[6,["D","V","5"]],[7,["EM","EMI","VI","6"]]].forEach(([barIndex,accepted],index)=>{
      const answerBox = HIGHER_2025_Q4_SCORE_LAYOUT.chordInputs[index];
      svg.append(svgElement("rect", { ...answerBox, class: "q3-marking-box higher-2025-chord-answer-box" }));
      const centre = answerBox.x + answerBox.width / 2;
      if(onAnswerChange) higher2015TextInput(svg,{x:answerBox.x,y:answerBox.y,width:answerBox.width,height:answerBox.height,value:chordValues[index]||"",className:"is-boxed",label:`Chord ${index+1} for part (b)`,maxLength:3,formatValue:formatHigherChordAnswer,onInput:next=>{chordValues[index]=next;onAnswerChange("q4b",chordValues.join(" ").trim(),{rerender:false});}});
      else {
        const current = String(chordValues[index] || "").toUpperCase();
        if(chordValues[index]) q3Text(svg,chordValues[index],{x:centre,y:answerBox.y+29,"text-anchor":"middle"},`q3-entered-answer ${review.q4b?accepted.includes(current)?"q3-answer-correct":"q3-answer-incorrect":""}`.trim());
        if(needsCorrection("q4b")&&!accepted.includes(current)) q3Text(svg,index===0?"D":"Em",{x:centre,y:answerBox.y+10,"text-anchor":"middle"},"q3-entered-answer q3-answer-correction");
      }
    });

    const bassTop=HIGHER_2025_Q4_SCORE_LAYOUT.bassTop, transposeXs=barPositions[10].slice(1,6);
    const bassStaffLeft = barStarts[10] - 25;
    higher2015Staff(svg,bassTop,{left:bassStaffLeft,right:barEnds[10],bass:true,sharpKeySignature:true});
    const bassSteps={G2:0,A2:1,B2:2,C3:3,D3:4,E3:5,F3:6,G3:7,A3:8,B3:9,C4:10,D4:11};
    const bassPitchMap=Object.fromEntries(Object.entries(bassSteps).map(([pitch,step])=>[pitch,q3YForStep(step,bassTop)]));
    const transposeValues=String(answers.q4c||"").split(","), expectedTranspose=["B3","C4","B3","A3","G3"];
    const transposeNotes=HIGHER_2025_Q4_TRANSPOSE.map((item,index)=>bassSteps[transposeValues[index]]===undefined?null:{...item,pitch:transposeValues[index],step:bassSteps[transposeValues[index]]});
    higher2015DrawNotes(svg,transposeNotes,transposeXs,bassTop,{beamGroups:[{start:0,end:1},{start:3,end:4}],classNames:transposeValues.map((pitch,index)=>review.q4c?pitch===expectedTranspose[index]?"q3-answer-correct":"q3-answer-incorrect":"")});
    if(needsCorrection("q4c"))higher2015DrawNotes(svg,HIGHER_2025_Q4_TRANSPOSE.map((item,index)=>({...item,pitch:expectedTranspose[index],step:bassSteps[expectedTranspose[index]]})),transposeXs.map(x=>x+(transposeValues.some(Boolean)?7:0)),bassTop,{beamGroups:[{start:0,end:1},{start:3,end:4}],className:"q3-answer-correction",opacity:.9});

    const missingXs=HIGHER_2025_Q4_BARS[16].missingIndices.map(index=>barPositions[16][index]);
    higher2015DrawNotes(svg,[note("C5","quaver"),note("C5","quaver")],missingXs,systems[4]-67,{beamGroups:[{start:0,end:1}]});
    const missingValues=String(answers.q4d||"").split(","), missingExpected=["D5","C5"];
    const enteredMissingNotes=missingExpected.map((_,index)=>Q3_PITCH_STEPS[missingValues[index]]===undefined?null:note(missingValues[index],"quaver"));
    higher2015DrawNotes(svg,enteredMissingNotes,missingXs,systems[4],{beamGroups:[{start:0,end:1}],classNames:missingValues.map((pitch,index)=>review.q4d?pitch===missingExpected[index]?"q3-answer-correct":"q3-answer-incorrect":"")});
    if(needsCorrection("q4d"))higher2015DrawNotes(svg,missingExpected.map(pitch=>note(pitch,"quaver")),missingXs.map(x=>x+(missingValues.some(Boolean)?7:0)),systems[4],{beamGroups:[{start:0,end:1}],className:"q3-answer-correction",opacity:.9});

    const barlineTop = systems[5];
    const barlineBox = HIGHER_2025_Q4_SCORE_LAYOUT.boxes.e;
    const barlineNotes = [20, 21].flatMap(barIndex => HIGHER_2025_Q4_BARS[barIndex].notes
      .map((item, noteIndex) => item.rest ? null : { barIndex, noteIndex, x: barPositions[barIndex][noteIndex] })
      .filter(Boolean));
    const barlineTargets = barlineNotes.slice(0, -1).map((item, index) => {
      const next = barlineNotes[index + 1];
      const isCorrectBoundary = item.barIndex === 20 && next.barIndex === 21;
      return {
        id: isCorrectBoundary ? "after-bar-21" : `higher-2025-line6-gap-${index + 1}`,
        x: isCorrectBoundary ? barEnds[20] : (item.x + next.x) / 2,
        afterNote: index + 1,
      };
    }).filter(item => item.x >= barlineBox.x && item.x <= barlineBox.x + barlineBox.width);
    const selectedBarline = String(answers.q4e || "");
    barlineTargets.forEach((item, index) => {
      const placed = selectedBarline === item.id;
      if (placed) svg.append(svgElement("line", { x1: item.x, x2: item.x, y1: barlineTop, y2: barlineTop + Q3_STAFF.gap * 4, class: `q3-barline ${answerClass("q4e")}`.trim() }));
      if (needsCorrection("q4e") && item.id === "after-bar-21" && !placed) svg.append(svgElement("line", { x1: item.x, x2: item.x, y1: barlineTop, y2: barlineTop + Q3_STAFF.gap * 4, class: "q3-barline q3-answer-correction" }));
      if (!onAnswerChange) return;
      const preview = placed ? null : svgElement("line", { x1: item.x, x2: item.x, y1: barlineTop, y2: barlineTop + Q3_STAFF.gap * 4, class: "q3-barline higher-2015-barline-preview" });
      if (preview) svg.append(preview);
      const previousTarget = barlineTargets[index - 1];
      const nextTarget = barlineTargets[index + 1];
      const targetLeft = previousTarget ? (previousTarget.x + item.x) / 2 : barlineBox.x;
      const targetRight = nextTarget ? (item.x + nextTarget.x) / 2 : barlineBox.x + barlineBox.width;
      const target = svgElement("rect", { x: targetLeft, y: barlineTop - 16, width: Math.max(1, targetRight - targetLeft), height: 78, class: "q3-bar-label-hit-area", tabindex: "0", role: "button", "aria-label": `Place the missing bar line after note ${item.afterNote} in the answer box` });
      const show = () => preview?.classList.add("is-visible");
      const hide = () => preview?.classList.remove("is-visible");
      target.addEventListener("pointerenter", show);
      target.addEventListener("pointerleave", hide);
      target.addEventListener("focus", show);
      target.addEventListener("blur", hide);
      target.addEventListener("click", () => { if (!placed) onAnswerChange("q4e", item.id); });
      bindRemovalGesture(target, () => { if (placed) onAnswerChange("q4e", ""); });
      svg.append(target);
    });

    const intervalInput = HIGHER_2025_Q4_SCORE_LAYOUT.intervalInput;
    higher2016ScoreTextAnswer(svg,answers,review,onAnswerChange,{id:"q4f",x:intervalInput.x,y:intervalInput.y,width:intervalInput.width,label:"Interval in bar 23",correction:"4th",maxLength:12});

    q3AddDirectNoteTargets(svg,answers,onAnswerChange,{id:"q4c",xs:transposeXs,top:bassTop,pitchMap:bassPitchMap,rhythms:HIGHER_2025_Q4_TRANSPOSE.map(item=>item.rhythm),label:"Transposed notes in bar 11"});
    q3AddDirectNoteTargets(svg,answers,onAnswerChange,{id:"q4d",xs:missingXs,top:systems[4],pitchMap:Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5"].map(pitch=>[pitch,q3YForStep(Q3_PITCH_STEPS[pitch],systems[4])])),rhythms:["quaver","quaver"],label:"Missing notes in bar 17"});
    return svg;
  }

  function higher2024ScoreSvg(answers, onAnswerChange, review = {}, question = null, context = null) {
    const isReview = Object.values(review).some(Boolean);
    const layout = HIGHER_2024_Q4_SCORE_LAYOUT;
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2024-q4-score", viewBox: `0 0 920 ${layout.viewBoxHeight}`, role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2024 Question 4 score` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const { systems, groups, staffLeft, musicStart, firstBarLeftShift, barEnds: systemBarEnds } = layout;
    const barPositions = [], barStarts = [], barEnds = [], barPoints = [], barTops = [];
    const questionCard = context || svg.closest(".question-card");
    const rhythmOverrides = String(questionCard?.dataset.q3Higher2024RhythmOverrides || "").split(",").reduce((result, entry) => {
      const [noteIndex, rhythm] = entry.split(":");
      if (/^\d+$/.test(noteIndex) && rhythm) result[noteIndex] = rhythm;
      return result;
    }, {});
    const rhythmOverrideIndices = Object.keys(rhythmOverrides).map(Number);

    Object.values(layout.boxes).forEach(box => {
      svg.append(svgElement("rect", { x: box.x, y: box.y, width: box.width, height: box.height, class: "q3-marking-box" }));
      q3Text(svg, box.label, { x: box.x + 8, y: box.y + 26, "text-anchor": "start" }, "q3-marking-box-label");
    });

    const givenChordBox = layout.givenChordBox;
    svg.append(svgElement("rect", { x: givenChordBox.x, y: givenChordBox.y, width: givenChordBox.width, height: givenChordBox.rowHeight * 2, class: "q3-marking-box" }));
    svg.append(svgElement("line", { x1: givenChordBox.x, x2: givenChordBox.x + givenChordBox.width, y1: givenChordBox.y + givenChordBox.rowHeight, y2: givenChordBox.y + givenChordBox.rowHeight, class: "q3-marking-box" }));
    ["C", "V"].forEach((label, row) => q3Text(svg, label, {
      x: givenChordBox.x + givenChordBox.width / 2,
      y: givenChordBox.y + givenChordBox.rowHeight * (row + .5),
      "text-anchor": "middle",
      "dominant-baseline": "middle",
    }, "q3-marking-box-label higher-2024-given-chord-label"));

    systems.forEach((top, systemIndex) => {
      const group = groups[systemIndex];
      const systemMusicStart = systemIndex === 0 ? musicStart : musicStart - firstBarLeftShift;
      const systemRight = systemBarEnds[systemIndex].at(-1);
      higher2015Staff(svg, top, { left: staffLeft, right: systemRight, flatKeySignature: true, timeSignature: systemIndex === 0, timeSignatureValue: "4/4", timeSignatureXOffset: systemIndex === 0 ? 20 : 0 });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2024_Q4_BARS[barIndex];
        const start = local === 0 ? systemMusicStart : systemBarEnds[systemIndex][local - 1];
        const end = systemBarEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions; barStarts[barIndex] = start; barEnds[barIndex] = end; barTops[barIndex] = top;
        if (barIndex !== 0) q3Text(svg, String(barIndex + 1), { x: local === 0 ? staffLeft + 6 : start + 3, y: top - 17 - (barIndex >= 22 ? 15 : 0), "text-anchor": "middle" }, "q3-bar-number");
        const enteredRhythmValue = barIndex === 5 ? String(answers.q4b || "").split(",")[0] : "";
        barPoints[barIndex] = higher2015DrawNotes(svg, item.notes, positions, top, {
          hiddenIndices: barIndex === 5 ? [...new Set([...(enteredRhythmValue && enteredRhythmValue !== "_" ? [item.rhythmCorrectionIndices[0]] : []), ...rhythmOverrideIndices])] : [],
          beamGroups: item.beamGroups,
        });
        higher2015Lyrics(svg, HIGHER_2024_Q4_LYRICS[barIndex], positions, top, {
          xOffsets: HIGHER_2024_Q4_LYRIC_OFFSETS[barIndex],
          textAnchors: [12, 21].includes(barIndex) ? [null, null, null, null, null, "start"] : undefined,
        });
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
    });

    for (let barIndex = 0; barIndex < HIGHER_2024_Q4_BARS.length - 1; barIndex += 1) {
      if (!HIGHER_2024_Q4_BARS[barIndex].notes.at(-1)?.tieToNextBar) continue;
      const first = barPoints[barIndex]?.at(-1);
      const second = barPoints[barIndex + 1]?.[0];
      if (!first || !second) continue;
      if (barTops[barIndex] === barTops[barIndex + 1]) q3DrawTie(svg, first, second);
      else higher2015SystemBreakTie(svg, first, second, barEnds[barIndex] - 4, barStarts[barIndex + 1] + 4);
    }

    const intervalBox = layout.boxes.interval;
    higher2016ScoreTextAnswer(svg, answers, review, onAnswerChange, { id: "q4a", x: intervalBox.x + 14, y: intervalBox.y + 44, width: intervalBox.width - 28, label: "Interval in bar 3", correction: "5th", maxLength: 12 });

    const rhythmIndexes = HIGHER_2024_Q4_BARS[5].rhythmCorrectionIndices;
    const rhythmSourceIndex = rhythmIndexes[0];
    const rhythmX = barPositions[5][rhythmSourceIndex];
    const rhythmSourceNote = HIGHER_2024_Q4_BARS[5].notes[rhythmSourceIndex];
    const enteredRhythms = String(answers.q4b || "").split(",");
    const enteredRhythm = enteredRhythms[0];
    if (enteredRhythm && enteredRhythm !== "_") {
      higher2015DrawNotes(svg, [{ ...rhythmSourceNote, rhythm: enteredRhythm }], [rhythmX], systems[1], {
        beamGroups: [],
        classNames: [answerClass("q4b")],
      });
    }
    Object.entries(rhythmOverrides).forEach(([noteIndexValue, rhythm]) => {
      const noteIndex = Number(noteIndexValue);
      const sourceNote = HIGHER_2024_Q4_BARS[5].notes[noteIndex];
      if (!sourceNote || sourceNote.rest) return;
      q3DrawNote(svg, { ...sourceNote, rhythm }, barPositions[5][noteIndex], systems[1], { className: answerClass("q4b") });
    });
    if (needsCorrection("q4b")) higher2015DrawNotes(svg, [{ ...rhythmSourceNote, rhythm: "quaver" }], [rhythmX + (enteredRhythm && enteredRhythm !== "_" ? 7 : 0)], systems[1], {
      beamGroups: [],
      classNames: ["q3-answer-correction"],
      opacity: .9,
    });

    const dominantSelectableNotes = layout.dominantSelectableBars.flatMap(barIndex => HIGHER_2024_Q4_BARS[barIndex].notes
      .map((item, noteIndex) => item.rest ? null : { barIndex, noteIndex })
      .filter(Boolean));
    const dominantToken = ({ barIndex, noteIndex }) => `bar-${barIndex + 1}-note-${noteIndex}`;
    const correctDominantNotes = [
      { barIndex: 9, noteIndex: 2 },
      { barIndex: 9, noteIndex: 3 },
    ];
    const selectedDominantTokens = (() => {
      const value = String(answers.q4c || "");
      if (value === "bar-10-c") return [dominantToken(correctDominantNotes[0])];
      if (value === "bar-10-c-second") return [dominantToken(correctDominantNotes[1])];
      if (value === "bar-10-c-both") return [dominantToken(correctDominantNotes[1])];
      const tokens = value.split(",").filter(token => dominantSelectableNotes.some(noteItem => dominantToken(noteItem) === token));
      return tokens.length ? [tokens.at(-1)] : [];
    })();
    const selectedDominantNotes = dominantSelectableNotes.filter(noteItem => selectedDominantTokens.includes(dominantToken(noteItem)));
    selectedDominantNotes.forEach(noteItem => {
      const note = HIGHER_2024_Q4_BARS[noteItem.barIndex].notes[noteItem.noteIndex];
      svg.append(svgElement("ellipse", {
        cx: barPositions[noteItem.barIndex][noteItem.noteIndex],
        cy: q3YForStep(note.step, systems[2]),
        rx: 15,
        ry: 12,
        fill: "none",
        class: `q3-note-selection-outline ${answerClass("q4c") || "q3-entered-answer"}`.trim(),
        stroke: "currentColor",
        "stroke-width": 2,
      }));
    });
    if (needsCorrection("q4c") && !["bar-10-c", "bar-10-c-second", "bar-10-c-both"].includes(String(answers.q4c || ""))) {
      const correctNote = correctDominantNotes[0];
      svg.append(svgElement("ellipse", {
        cx: barPositions[correctNote.barIndex][correctNote.noteIndex],
        cy: q3YForStep(HIGHER_2024_Q4_BARS[correctNote.barIndex].notes[correctNote.noteIndex].step, systems[2]),
        rx: 15,
        ry: 12,
        fill: "none",
        class: "q3-note-selection-outline q3-answer-correction",
        stroke: "currentColor",
        "stroke-width": 2,
      }));
    }

    const bassTop = layout.bassStaff.top;
    const transposeXs = HIGHER_2024_Q4_BARS[13].transposeIndices.map(index => barPositions[13][index]);
    higher2015Staff(svg, bassTop, { left: layout.bassStaff.left, right: layout.bassStaff.right, bass: true, flatKeySignature: true, flatKeySignatureStep: 2 });
    const bassSteps={G2:0,A2:1,B2:2,C3:3,D3:4,E3:5,F3:6,G3:7,A3:8,B3:9,C4:10,D4:11};
    const bassPitchMap=Object.fromEntries(Object.entries(bassSteps).map(([pitch,step])=>[pitch,q3YForStep(step,bassTop)]));
    const transposeValues = String(answers.q4d || "").split(","), expectedTranspose = ["A3", "C4", "C4"];
    const transposeNotes = HIGHER_2024_Q4_TRANSPOSE.map((item, index) => bassSteps[transposeValues[index]] === undefined ? null : { ...item, pitch: transposeValues[index], step: bassSteps[transposeValues[index]] });
    higher2015DrawNotes(svg, transposeNotes, transposeXs, bassTop, { classNames: transposeValues.map((pitch, index) => review.q4d ? pitch === expectedTranspose[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "") });
    if (needsCorrection("q4d")) higher2015DrawNotes(svg, HIGHER_2024_Q4_TRANSPOSE.map((item, index) => ({ ...item, pitch: expectedTranspose[index], step: bassSteps[expectedTranspose[index]] })), transposeXs.map(x => x + (transposeValues.some(Boolean) ? 7 : 0)), bassTop, { className: "q3-answer-correction", opacity: .9 });

    const chordValues = String(answers.q4e || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    [[18, ["BB", "IV", "4"]], [20, ["F", "I", "1"]]].forEach(([barIndex, accepted], index) => {
      const answerBox = layout.chordAnswerBoxes[index];
      const centre = answerBox.x + answerBox.width / 2;
      svg.append(svgElement("rect", { ...answerBox, class: "q3-marking-box higher-2024-chord-answer-box" }));
      if (onAnswerChange) higher2015TextInput(svg, { ...answerBox, value: chordValues[index] || "", className: "is-boxed", label: `Chord ${index + 1} for part (e)`, maxLength: 3, formatValue: formatHigherChordAnswer, onInput: next => { chordValues[index] = next; onAnswerChange("q4e", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        const current = String(chordValues[index] || "").toUpperCase();
        if (chordValues[index]) q3Text(svg, chordValues[index], { x: centre, y: answerBox.y + answerBox.height / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, `q3-entered-answer ${review.q4e ? accepted.includes(current) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim());
        if (needsCorrection("q4e") && !accepted.includes(current)) q3Text(svg, index === 0 ? "B♭" : "F", { x: centre, y: answerBox.y - 7, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    const dcBarLabelPlacement = barIndex => ({
      x: barStarts[barIndex] + Math.min(28, (barEnds[barIndex] - barStarts[barIndex]) * .22),
      y: barTops[barIndex] - 19,
    });
    const dcMatch = String(answers.q4f || "").match(/^bar-(\d+)$/);
    const dcBarIndex = dcMatch ? Math.max(0, Math.min(HIGHER_2024_Q4_BARS.length - 1, Number(dcMatch[1]) - 1)) : -1;
    if (dcBarIndex >= 0) q3CalibratedSymbol(svg, "daCapo", dcBarLabelPlacement(dcBarIndex).x, dcBarLabelPlacement(dcBarIndex).y, { className: answerClass("q4f") || "q3-entered-answer" });
    if (needsCorrection("q4f") && dcBarIndex !== 23) q3CalibratedSymbol(svg, "daCapo", dcBarLabelPlacement(23).x, dcBarLabelPlacement(23).y, { className: "q3-answer-correction" });

    if(onAnswerChange){
      dominantSelectableNotes.forEach(noteItem => {
        const note = HIGHER_2024_Q4_BARS[noteItem.barIndex].notes[noteItem.noteIndex];
        const token = dominantToken(noteItem);
        const noteX = barPositions[noteItem.barIndex][noteItem.noteIndex];
        const noteY = q3YForStep(note.step, systems[2]);
        const target = svgElement("rect", { x: noteX - 22, y: noteY - 22, width: 44, height: 44, class: "q3-note-hit-area", role: "button", tabindex: "0", "aria-label": `Circle note ${noteItem.noteIndex + 1} in bar ${noteItem.barIndex + 1} for the dominant answer` });
        const place = () => {
          const value = noteItem.barIndex === correctDominantNotes[0].barIndex && noteItem.noteIndex === correctDominantNotes[0].noteIndex
            ? "bar-10-c"
            : noteItem.barIndex === correctDominantNotes[1].barIndex && noteItem.noteIndex === correctDominantNotes[1].noteIndex
              ? "bar-10-c-second"
              : token;
          onAnswerChange("q4c", value);
        };
        target.addEventListener("click", place);
        target.addEventListener("keydown", event => { if(["Enter", " "].includes(event.key))place(); });
        bindRemovalGesture(target, () => onAnswerChange("q4c", ""));
        svg.append(target);
      });
      HIGHER_2024_Q4_BARS.forEach((_, barIndex) => {
        let preview = null;
        const placement = dcBarLabelPlacement(barIndex);
        const placedHere = answers.q4f === `bar-${barIndex + 1}`;
        const hidePreview = () => { preview?.remove(); preview = null; };
        const showPreview = () => {
          if (!q3BarLabelArmed || preview) return;
          preview = q3CalibratedSymbol(svg, "daCapo", placement.x, placement.y, { opacity: .35, className: "q3-bar-label-preview" });
        };
        const target = svgElement("rect", {
          x: barStarts[barIndex], y: barTops[barIndex] - 48,
          width: barEnds[barIndex] - barStarts[barIndex], height: 39,
          class: "q3-bar-label-hit-area", role: "button",
          tabindex: q3BarLabelArmed || placedHere ? "0" : "-1",
          "aria-disabled": String(!q3BarLabelArmed && !placedHere),
          "aria-label": `Place D.C. above bar ${barIndex + 1}`,
        });
        if (placedHere) {
          target.dataset.barLabelPlaced = "true";
          target.setAttribute("aria-label", `D.C. above bar ${barIndex + 1}. Double-click, double-tap or right-click to remove it.`);
          target.setAttribute("aria-keyshortcuts", "Shift+Delete");
        }
        const placeDc = event => {
          if (!q3BarLabelArmed) return;
          event.preventDefault();
          hidePreview();
          q3SetBarLabelToolArmed(false, svg);
          onAnswerChange("q4f", `bar-${barIndex + 1}`);
        };
        target.addEventListener("pointerenter", showPreview);
        target.addEventListener("pointerleave", hidePreview);
        target.addEventListener("pointerdown", event => event.preventDefault());
        target.addEventListener("focus", showPreview);
        target.addEventListener("blur", hidePreview);
        target.addEventListener("click", placeDc);
        target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) placeDc(event); });
        bindRemovalGesture(target, () => {
          if (!placedHere) return;
          hidePreview();
          q3SetBarLabelToolArmed(false, svg);
          onAnswerChange("q4f", "");
        });
        svg.append(target);
      });
    }
    q3AddHigher2024RhythmTargets(svg, answers, onAnswerChange, barPositions[5], systems[1], questionCard);
    q3AddDirectNoteTargets(svg,answers,onAnswerChange,{id:"q4d",xs:transposeXs,top:bassTop,pitchMap:bassPitchMap,rhythms:HIGHER_2024_Q4_TRANSPOSE.map(item=>item.rhythm),label:"Transposed notes in bar 14"});
    return svg;
  }

  function higher2023ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const layout = HIGHER_2023_Q4_SCORE_LAYOUT;
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2023-q4-score", viewBox: `0 0 920 ${layout.viewBoxHeight}`, role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2023 Question 4 score` });
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const feedbackXOffset = 5;
    const { systems, groups, staffLeft, musicStart, firstBarLeftShift, musicEnd, barEnds: systemBarEnds } = layout;
    const barPositions = [], barPoints = [], barTops = [], barStarts = [], barEnds = [];

    Object.values(layout.boxes).forEach(box => {
      svg.append(svgElement("rect", { x: box.x, y: box.y, width: box.width, height: box.height, class: "q3-marking-box" }));
      q3Text(svg, box.label, { x: box.x + 8, y: box.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    });
    const givenChordBox = layout.givenChordBox;
    svg.append(svgElement("rect", { x: givenChordBox.x, y: givenChordBox.y, width: givenChordBox.width, height: givenChordBox.rowHeight * 2, class: "q3-marking-box" }));
    svg.append(svgElement("line", { x1: givenChordBox.x, x2: givenChordBox.x + givenChordBox.width, y1: givenChordBox.y + givenChordBox.rowHeight, y2: givenChordBox.y + givenChordBox.rowHeight, class: "q3-marking-box" }));
    q3Text(svg, "C", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");
    q3Text(svg, "V", { x: givenChordBox.x + givenChordBox.width / 2, y: givenChordBox.y + givenChordBox.rowHeight * 1.5, "text-anchor": "middle", "dominant-baseline": "middle" }, "q3-marking-box-label");

    systems.forEach((top, systemIndex) => {
      const group = groups[systemIndex];
      const systemMusicStart = systemIndex === 0 ? musicStart : musicStart - firstBarLeftShift;
      higher2015Staff(svg, top, { left: staffLeft, right: musicEnd, flatKeySignature: true, timeSignature: systemIndex === 0, timeSignatureValue: "4/4", timeSignatureXOffset: systemIndex === 0 ? 20 : 0 });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2023_Q4_BARS[barIndex];
        const start = local === 0 ? systemMusicStart : systemBarEnds[systemIndex][local - 1];
        const end = systemBarEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions; barTops[barIndex] = top; barStarts[barIndex] = start; barEnds[barIndex] = end;
        if (barIndex !== 0) q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        barPoints[barIndex] = higher2015DrawNotes(svg, item.notes, positions, top, {
          hiddenIndices: barIndex === 8 && answers.q4d ? item.rhythmCorrectionIndices || [] : item.missingIndices || [],
          beamGroups: item.beamGroups,
          slurs: item.slurs,
        });
        higher2015Lyrics(svg, HIGHER_2023_Q4_LYRICS[barIndex], positions, top, { xOffsets: HIGHER_2023_Q4_LYRIC_OFFSETS[barIndex], yOffsets: HIGHER_2023_Q4_LYRIC_Y_OFFSETS[barIndex] });
        const final = barIndex === HIGHER_2023_Q4_BARS.length - 1;
        if (final) q3CalibratedSymbol(svg, "barlineFinal", end, q3YForStep(4, top), { className: "q3-final-barline" });
        else svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
    });

    [[6, 7], [8, 9], [10, 11], [12, 13], [13, 14], [14, 15]].forEach(([from, to]) => {
      const first = barPoints[from]?.at(-1);
      const second = barPoints[to]?.[0];
      if (!first || !second) return;
      if (barTops[from] === barTops[to]) q3DrawTie(svg, first, second);
      else higher2015SystemBreakTie(svg, first, second, barEnds[from] - 4, barStarts[to] + 4);
    });

    const treblePitchMap = top => Object.fromEntries(["C4","D4","E4","F4","G4","A4","Bb4","B4","C5","D5","E5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], top)]));
    const intervalX = barPositions[1][0], intervalValue = String(answers.q4a || "").split(",")[0];
    higher2015DrawNotes(svg, [note("D5", "quaver")], [intervalX], systems[0] - 48);
    if (Q3_PITCH_STEPS[intervalValue] !== undefined) q3DrawNote(svg, note(intervalValue, "quaver"), intervalX, systems[0], { className: review.q4a ? intervalValue === "D5" ? "q3-answer-correct" : "q3-answer-incorrect" : "" });
    if (needsCorrection("q4a") && intervalValue !== "D5") q3DrawNote(svg, note("D5", "quaver"), intervalX + (intervalValue ? 7 : 0), systems[0], { className: "q3-answer-correction", opacity: .9 });

    const transposeXs = barPositions[3].slice(0, 5), bassTop = layout.bassStaff.top;
    higher2015Staff(svg, bassTop, { left: layout.bassStaff.left, right: layout.bassStaff.right, bass: true, flatKeySignature: true, flatKeySignatureStep: 2 });
    svg.append(svgElement("line", { x1: staffLeft, x2: staffLeft, y1: systems[1], y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    svg.append(svgElement("line", { x1: layout.bassStaff.right, x2: layout.bassStaff.right, y1: bassTop, y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    q3DrawNote(svg, rest("crotchetRest"), barPositions[3][5], bassTop);
    const bassSteps = { G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, F3: 6, G3: 7, A3: 8, B3: 9, C4: 10 };
    const bassPitchMap = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q4b || "").split(",");
    const transposeExpected = HIGHER_2023_Q4_TRANSPOSE.map(item => item.pitch);
    const transposeNotes = HIGHER_2023_Q4_TRANSPOSE.map((item, index) => bassSteps[transposeValues[index]] === undefined ? null : { ...item, pitch: transposeValues[index], step: bassSteps[transposeValues[index]] });
    higher2015DrawNotes(svg, transposeNotes, transposeXs, bassTop, {
      beamGroups: [{ start: 0, end: 3 }],
      classNames: transposeValues.map((pitch, index) => review.q4b ? pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : ""),
    });
    if (needsCorrection("q4b")) higher2015DrawNotes(svg, HIGHER_2023_Q4_TRANSPOSE.map((item, index) => ({ ...item, pitch: transposeExpected[index], step: bassSteps[transposeExpected[index]] })), transposeXs.map(x => x + (transposeValues.some(Boolean) ? 7 + feedbackXOffset : 0)), bassTop, { beamGroups: [{ start: 0, end: 3 }], className: "q3-answer-correction", opacity: .9 });

    const missingXs = barPositions[6].slice(1, 4), missingValues = String(answers.q4c || "").split(","), missingExpected = ["A4", "G4", "F4"];
    const missingGuideNotes = [note("A4", "quaver"), note("A4", "quaver"), note("A4", "quaver")];
    higher2015DrawNotes(svg, missingGuideNotes, missingXs, systems[2] - 48, { beamGroups: [{ start: 1, end: 2 }] });
    const enteredMissingNotes = missingExpected.map((_, index) => Q3_PITCH_STEPS[missingValues[index]] === undefined ? null : note(missingValues[index], "quaver"));
    higher2015DrawNotes(svg, enteredMissingNotes, missingXs, systems[2], {
      beamGroups: [{ start: 1, end: 2 }],
      classNames: missingValues.map((pitch, index) => review.q4c ? pitch === missingExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : ""),
    });
    if (needsCorrection("q4c")) higher2015DrawNotes(svg, missingExpected.map(pitch => note(pitch, "quaver")), missingXs.map(x => x + (missingValues.some(Boolean) ? 7 + feedbackXOffset : 0)), systems[2], { beamGroups: [{ start: 1, end: 2 }], className: "q3-answer-correction", opacity: .9 });

    const drawRhythmAnswer = (value, className = "", xOffset = 0) => {
      if (!value) return;
      const rhythms = value.split(",");
      rhythms.slice(0, 2).forEach((rhythm, index) => {
        const item = note(index ? "F4" : "G4", rhythm);
        const down = item.stemDown ?? q3StemDown(item.step);
        const settings = q3SymbolConfig(q3NoteSymbolKey(item.rhythm, down, false));
        const x = barPositions[8][index] + xOffset - Q3_STAFF.gap * Number(settings.xOffsetScale || 0) - Number(settings.opticalXOffset || 0);
        q3DrawNote(svg, item, x, systems[2], { className });
      });
    };
    drawRhythmAnswer(answers.q4d, answerClass("q4d"));
    if (needsCorrection("q4d") && answers.q4d !== "quaver,dottedCrotchet") drawRhythmAnswer("quaver,dottedCrotchet", "q3-answer-correction", answers.q4d ? feedbackXOffset : 0);

    const restX = barPositions[11][2] + HIGHER_2023_Q4_REST_X_OFFSET;
    const restValues = String(answers.q4e || "").split(",").filter(Boolean);
    restValues.forEach((rhythm, index) => q3DrawNote(svg, rest(rhythm), restX + index * 24, systems[3], { className: answerClass("q4e") }));
    if (needsCorrection("q4e") && !["crotchetRest,quaverRest", "quaverRest,quaverRest,quaverRest", "dottedCrotchetRest"].includes(String(answers.q4e || ""))) q3DrawNote(svg, rest("dottedCrotchetRest"), restX + (answers.q4e ? 8 + feedbackXOffset : 0), systems[3], { className: "q3-answer-correction", opacity: .9 });

    const chordValues = String(answers.q4f || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    layout.chordAnswerBoxes.forEach((answerBox, index) => {
      const accepted = index === 0 ? ["BB", "IV", "4"] : ["C", "V", "5"];
      const centre = answerBox.x + answerBox.width / 2;
      if (onAnswerChange) higher2015TextInput(svg, { x: answerBox.x, y: answerBox.y, width: answerBox.width, height: answerBox.height, value: chordValues[index] || "", label: `Chord ${index + 1} for part (f)`, maxLength: 3, className: "is-boxed higher-2023-chord-input", formatValue: formatHigherChordAnswer, onInput: next => { chordValues[index] = next; onAnswerChange("q4f", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        const current = String(chordValues[index] || "").toUpperCase();
        svg.append(svgElement("rect", { x: answerBox.x, y: answerBox.y, width: answerBox.width, height: answerBox.height, class: "q3-marking-box" }));
        if (chordValues[index]) q3Text(svg, chordValues[index], { x: centre, y: answerBox.y + answerBox.height / 2, "text-anchor": "middle", "dominant-baseline": "middle" }, `q3-entered-answer ${review.q4f ? accepted.includes(current) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim());
        if (needsCorrection("q4f") && !accepted.includes(current)) q3Text(svg, index === 0 ? "B♭" : "C", { x: centre, y: answerBox.y - 7, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4a", xs: [intervalX], top: systems[0], pitchMap: treblePitchMap(systems[0]), rhythms: ["quaver"], label: "Missing interval note at the start of bar 2" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4b", xs: transposeXs, top: bassTop, pitchMap: bassPitchMap, rhythms: HIGHER_2023_Q4_TRANSPOSE.map(item => item.rhythm), label: "Transposed notes in bar 4" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4c", xs: missingXs, top: systems[2], pitchMap: treblePitchMap(systems[2]), rhythms: ["quaver", "quaver", "quaver"], label: "Missing notes in bar 7" });
    q3AddHigher2023RhythmTargets(svg, answers, onAnswerChange, barPositions[8], systems[2]);
    q3AddHigher2023RestTargets(svg, answers, onAnswerChange, barPositions[11][2], systems[3]);
    return svg;
  }

  function higher2022ScoreSvg(answers, onAnswerChange, review = {}, question = null) {
    const isReview = Object.values(review).some(Boolean);
    const layout = HIGHER_2022_Q4_SCORE_LAYOUT;
    const svg = svgElement("svg", { class: "q3-shared-score higher-2015-q4-score higher-2022-q4-score", viewBox: `0 0 920 ${layout.viewBoxHeight}`, role: "img", "aria-label": `${isReview ? "Marked" : "Interactive"} Higher 2022 Question 4 score` });
    const correctAnswer = (id, fallback) => question?.subquestions?.find(item => item.id === id)?.answer || fallback;
    const answerClass = id => review[id] === "correct" ? "q3-answer-correct" : ["incorrect", "partial"].includes(review[id]) ? "q3-answer-incorrect" : "";
    const needsCorrection = id => Boolean(review[id] && review[id] !== "correct");
    const systems = layout.systems;
    const barPositions = [], barStarts = [], barEnds = [];

    Object.values(layout.boxes).forEach(box => {
      svg.append(svgElement("rect", { x: box.x, y: box.y, width: box.width, height: box.height, class: "q3-marking-box" }));
      q3Text(svg, box.label, { x: box.x + 10, y: box.y + 25, "text-anchor": "start" }, "q3-marking-box-label");
    });
    const given = layout.givenChordBox;
    svg.append(svgElement("rect", { x: given.x, y: given.y, width: given.width, height: given.rowHeight * 2, class: "q3-marking-box" }));
    svg.append(svgElement("line", { x1: given.x, x2: given.x + given.width, y1: given.y + given.rowHeight, y2: given.y + given.rowHeight, class: "q3-marking-box" }));
    q3Text(svg, "F", { x: given.x + given.width / 2, y: given.y + 27, "text-anchor": "middle" }, "q3-marking-box-label");
    q3Text(svg, "I", { x: given.x + given.width / 2, y: given.y + given.rowHeight + 27, "text-anchor": "middle" }, "q3-marking-box-label");

    systems.forEach((top, systemIndex) => {
      const group = layout.groups[systemIndex];
      const staffLeft = layout.staffLefts[systemIndex];
      const musicStart = layout.musicStarts[systemIndex];
      const staffRight = layout.staffRights[systemIndex];
      higher2015Staff(svg, top, { left: staffLeft, right: staffRight, flatKeySignature: true });
      group.forEach((barIndex, local) => {
        const item = HIGHER_2022_Q4_BARS[barIndex];
        const start = local === 0 ? musicStart : layout.barEnds[systemIndex][local - 1];
        const end = layout.barEnds[systemIndex][local];
        const positions = higher2015Positions(item.notes, start, end, { firstInSystem: local === 0 });
        barPositions[barIndex] = positions; barStarts[barIndex] = start; barEnds[barIndex] = end;
        if (barIndex > 0) q3Text(svg, String(barIndex + 1), { x: local === 0 ? staffLeft + 7 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        higher2015DrawNotes(svg, item.notes, positions, top, { hiddenIndices: item.missingIndices || [], beamGroups: item.beamGroups });
        const finalBar = barIndex === HIGHER_2022_Q4_BARS.length - 1;
        if (finalBar) q3CalibratedSymbol(svg, "barlineFinal", end, q3YForStep(4, top), { className: "q3-final-barline" });
        else svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      });
    });

    if (answers.q4a) q3DrawTimeSignature(svg, answers.q4a, systems[0], answerClass("q4a"), 0, layout.timeSignatureX);
    if (needsCorrection("q4a") && String(answers.q4a || "") !== "12/8") q3DrawTimeSignature(svg, correctAnswer("q4a", "12/8"), systems[0], "q3-answer-correction", answers.q4a ? 18 : 0, layout.timeSignatureX);
    if (answers.q4a && onAnswerChange) q3AddAppliedAnswerTarget(svg, { x: layout.timeSignatureX - 28, y: systems[0] - 8, width: 56, height: 58 }, "Time signature", () => onAnswerChange("q4a", ""));

    const intervalX = barPositions[3][0];
    higher2015DrawNotes(svg, [note("C5", "dottedCrotchet")], [intervalX], systems[1] - 58);
    const intervalValue = String(answers.q4b || "").split(",")[0];
    if (Q3_PITCH_STEPS[intervalValue] !== undefined) q3DrawNote(svg, note(intervalValue, "dottedCrotchet"), intervalX, systems[1], { className: review.q4b ? intervalValue === "G5" ? "q3-answer-correct" : "q3-answer-incorrect" : "" });
    if (needsCorrection("q4b") && intervalValue !== "G5") q3DrawNote(svg, note("G5", "dottedCrotchet"), intervalX + (intervalValue ? 7 : 0), systems[1], { className: "q3-answer-correction", opacity: .9 });

    const chordValues = String(answers.q4c || "").split(/[\s,]+/).filter(Boolean).slice(0, 2);
    [[5, ["C", "C7", "V", "V7", "5"]], [6, ["DM", "DMI", "VI", "6"]]].forEach(([barIndex, accepted], order) => {
      const box = layout.chordAnswerBoxes[order];
      const x = box.x;
      if (onAnswerChange) higher2015TextInput(svg, { x, y: box.y, width: box.width, height: box.height, value: chordValues[order] || "", label: `Chord ${order + 1} for part (c)`, maxLength: 3, className: "is-boxed higher-2022-chord-input", formatValue: formatHigherChordAnswer, onInput: next => { chordValues[order] = next; onAnswerChange("q4c", chordValues.join(" ").trim(), { rerender: false }); } });
      else {
        const current = String(chordValues[order] || "").toUpperCase();
        svg.append(svgElement("rect", { x, y: box.y, width: box.width, height: box.height, class: "q3-marking-box q3-answer-line" }));
        if (chordValues[order]) q3Text(svg, chordValues[order], { x: x + box.width / 2, y: box.y + 28, "text-anchor": "middle" }, `q3-entered-answer ${review.q4c ? accepted.includes(current) ? "q3-answer-correct" : "q3-answer-incorrect" : ""}`.trim());
        if (needsCorrection("q4c") && !accepted.includes(current)) q3Text(svg, order === 0 ? "C" : "Dm", { x: x + box.width / 2, y: box.y + box.height + 18, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
      }
    });

    const tonicIndex = HIGHER_2022_Q4_BARS[7].tonicIndex;
    const selectableTonicIndices = HIGHER_2022_Q4_BARS[7].notes.map((item, index) => item.rest ? null : index).filter(index => index !== null);
    const selectedTonicMatch = String(answers.q4d || "").match(/^bar-8-note-(\d+)$/);
    const selectedTonicIndex = answers.q4d === "F5" ? tonicIndex : selectedTonicMatch ? Number(selectedTonicMatch[1]) : -1;
    if (selectedTonicIndex >= 0 && barPositions[7][selectedTonicIndex] !== undefined) {
      const selectedItem = HIGHER_2022_Q4_BARS[7].notes[selectedTonicIndex];
      svg.append(svgElement("ellipse", { cx: barPositions[7][selectedTonicIndex], cy: q3YForStep(selectedItem.step, systems[2]), rx: 16, ry: 12, fill: "none", class: `q3-tonic-selection ${answerClass("q4d") || "q3-entered-answer"}`.trim(), stroke: "currentColor", "stroke-width": 2 }));
    }
    if (needsCorrection("q4d") && selectedTonicIndex !== tonicIndex) {
      svg.append(svgElement("ellipse", { cx: barPositions[7][tonicIndex], cy: q3YForStep(HIGHER_2022_Q4_BARS[7].notes[tonicIndex].step, systems[2]), rx: 16, ry: 12, fill: "none", class: "q3-tonic-selection q3-answer-correction", stroke: "currentColor", "stroke-width": 2 }));
    }
    if (onAnswerChange) selectableTonicIndices.forEach(index => {
      const item = HIGHER_2022_Q4_BARS[7].notes[index];
      const x = barPositions[7][index], y = q3YForStep(item.step, systems[2]);
      const target = svgElement("rect", { x: x - 20, y: y - 20, width: 40, height: 40, class: "q3-rhythm-hit-area", role: "button", tabindex: "0", "aria-label": `Select note ${index + 1} in bar 8 as the tonic` });
      const place = () => onAnswerChange("q4d", index === tonicIndex ? "F5" : `bar-8-note-${index}`);
      target.addEventListener("click", place);
      target.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) place(); });
      if (index === selectedTonicIndex) bindRemovalGesture(target, () => onAnswerChange("q4d", ""));
      svg.append(target);
    });

    const missingXs = barPositions[10].slice(0, 3), missingValues = String(answers.q4e || "").split(","), missingExpected = ["A4", "G4", "Bb4"];
    higher2015DrawNotes(svg, missingExpected.map(() => note("B4", "dottedCrotchet", { stemDown: false })), missingXs, systems[3] - 58);
    missingValues.forEach((pitch, index) => { if (Q3_PITCH_STEPS[pitch] !== undefined) q3DrawNote(svg, note(pitch, "dottedCrotchet"), missingXs[index], systems[3], { className: review.q4e ? pitch === missingExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "" }); });
    if (needsCorrection("q4e")) missingExpected.forEach((pitch, index) => { if (missingValues[index] !== pitch) q3DrawNote(svg, note(pitch, "dottedCrotchet"), missingXs[index] + (missingValues[index] ? 7 : 0), systems[3], { className: "q3-answer-correction", opacity: .9 }); });

    const bassTop = layout.bassStaff.top, bassLeft = layout.bassStaff.left, bassRight = layout.bassStaff.right;
    higher2015Staff(svg, bassTop, { left: bassLeft, right: bassRight, bass: true, flatKeySignature: true, flatKeySignatureStep: 2 });
    const bassBar13Positions = higher2015Positions(HIGHER_2022_Q4_BARS[12].notes, layout.bassStaff.barlineX, bassRight);
    higher2015DrawNotes(svg, [HIGHER_2022_Q4_BARS[12].notes[1]], [bassBar13Positions[1]], bassTop);
    svg.append(svgElement("line", { x1: layout.bassStaff.barlineX, x2: layout.bassStaff.barlineX, y1: bassTop, y2: bassTop + Q3_STAFF.gap * 4, class: "q3-barline" }));
    q3CalibratedSymbol(svg, "barlineFinal", bassRight, q3YForStep(4, bassTop), { className: "q3-final-barline" });
    const transposeXs = [barPositions[11][3], barPositions[11][4], barPositions[11][5], barPositions[12][0]];
    const bassSteps = { G2: 0, A2: 1, B2: 2, C3: 3, D3: 4, E3: 5, F3: 6, G3: 7, A3: 8, B3: 9, C4: 10, D4: 11 };
    const bassPitchY = Object.fromEntries(Object.entries(bassSteps).map(([pitch, step]) => [pitch, q3YForStep(step, bassTop)]));
    const transposeValues = String(answers.q4f || "").split(","), transposeExpected = ["G3", "F3", "E3", "F3"];
    transposeValues.forEach((pitch, index) => { if (bassSteps[pitch] !== undefined) q3DrawNote(svg, { ...HIGHER_2022_Q4_TRANSPOSE[index], pitch, step: bassSteps[pitch] }, transposeXs[index], bassTop, { className: review.q4f ? pitch === transposeExpected[index] ? "q3-answer-correct" : "q3-answer-incorrect" : "" }); });
    if (needsCorrection("q4f")) transposeExpected.forEach((pitch, index) => { if (transposeValues[index] !== pitch) q3DrawNote(svg, { ...HIGHER_2022_Q4_TRANSPOSE[index], pitch, step: bassSteps[pitch] }, transposeXs[index] + (transposeValues[index] ? 7 : 0), bassTop, { className: "q3-answer-correction", opacity: .9 }); });

    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4b", xs: [intervalX], top: systems[1], pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","Bb4","C5","D5","E5","F5","G5","A5","Bb5","B5","C6"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[1])])), rhythms: ["dottedCrotchet"], label: "Missing interval note at the start of bar 4" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4e", xs: missingXs, top: systems[3], pitchMap: Object.fromEntries(["C4","D4","E4","F4","G4","A4","B4","Bb4","C5"].map(pitch => [pitch, q3YForStep(Q3_PITCH_STEPS[pitch], systems[3])])), rhythms: ["dottedCrotchet", "dottedCrotchet", "dottedCrotchet"], label: "Missing notes in bar 11" });
    q3AddDirectNoteTargets(svg, answers, onAnswerChange, { id: "q4f", xs: transposeXs, top: bassTop, pitchMap: bassPitchY, rhythms: HIGHER_2022_Q4_TRANSPOSE.map(item => item.rhythm), label: "Transposed notes in bars 12 and 13" });
    return svg;
  }

  function renderSharedScore(container, question, answers, onAnswerChange, review = {}, context = null) {
    container.innerHTML = `<div class="shared-notation-score-wrap"></div>`;
    const score = question?.score?.sharedNotation === "higher-2025-q4"
      ? higher2025ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2024-q4"
      ? higher2024ScoreSvg(answers || {}, onAnswerChange, review, question, context)
      : question?.score?.sharedNotation === "higher-2023-q4"
      ? higher2023ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2022-q4"
      ? higher2022ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2019-q3"
      ? higher2019ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2018-q3"
      ? higher2018ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2017-q4"
      ? higher2017ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2016-q4"
      ? higher2016ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "higher-2015-q4"
      ? higher2015ScoreSvg(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2025-q3"
      ? q3ScoreSvg2025(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2024-q3"
      ? q3ScoreSvg2024(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2023-q3"
      ? q3ScoreSvg2023(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2022-q3"
      ? q3ScoreSvg2022(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2019-q3"
      ? q3ScoreSvg2019(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2018-q3"
        ? q3ScoreSvg2018(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2017-q3"
        ? q3ScoreSvg2017(answers || {}, onAnswerChange, review, question)
      : question?.score?.sharedNotation === "n5-2016-q3"
          ? q3ScoreSvg2016(answers || {}, onAnswerChange, review, question)
          : question?.score?.sharedNotation === "n5-2015-q3"
            ? q3ScoreSvg2015(answers || {}, onAnswerChange, review, question)
            : q3ScoreSvg(answers || {}, onAnswerChange, review, question);
    container.querySelector(".shared-notation-score-wrap").append(score);
  }

  function rhythmTripletPreviewSvg(value) {
    const isQuaverTriplet = value === "tripletQuaver";
    if (!isQuaverTriplet && value !== "tripletCrotchet") return "";
    const notePositions = [35, 62, 89];
    const notes = notePositions.map(x => `<g><ellipse cx="${x}" cy="38" rx="6.3" ry="4.6" transform="rotate(-18 ${x} 38)" fill="currentColor"/><line x1="${x + 5.3}" x2="${x + 5.3}" y1="38" y2="12" stroke="currentColor" stroke-width="1.5"/></g>`).join("");
    const mark = isQuaverTriplet
      ? `<line x1="40.3" x2="94.3" y1="12" y2="12" stroke="currentColor" stroke-width="4"/>`
      : `<g stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M 40 9 L 40 0 L 56 0"/><path d="M 80 0 L 96 0 L 96 9"/></g>`;
    const number = `<text x="67" y="${isQuaverTriplet ? 5 : 7}" text-anchor="middle" font-family="serif" font-weight="900" font-size="19" fill="currentColor">3</text>`;
    return `<svg class="notation-triplet-preview-svg ${isQuaverTriplet ? "is-quaver-triplet" : "is-crotchet-triplet"}" viewBox="0 -8 150 78" aria-hidden="true" focusable="false"><g transform="translate(-24,-13) scale(1.58)">${notes}${mark}${number}</g></svg>`;
  }

  function renderSharedControls(container, subquestion, value, onChange) {
    let history = String(value || "").split(",").filter(item => item && item !== "_");
    const showsHintBelowControls = subquestion.scoreHint && subquestion.scoreHintPlacement !== "prompt";
    container.innerHTML = `<div class="notation-controls-only"><div class="notation-tools" role="group" aria-label="${subquestion.prompt}"></div>${showsHintBelowControls ? `<p class="score-apply-hint" data-score-apply-hint></p>` : ""}</div>`;
    const controlsOnly = container.querySelector(".notation-controls-only");
    const tools = container.querySelector(".notation-tools");
    const hint = container.querySelector("[data-score-apply-hint]");
    if (hint) hint.textContent = subquestion.scoreHint;
    const isNotes = subquestion.notationTool === "note-entry";
    const isRhythmPlacement = subquestion.notationTool === "rhythm-entry";
    const isBarlinePlacement = subquestion.notationTool === "barline-entry";
    const isAccidentalPlacement = subquestion.notationTool === "accidental";
    const isSequenceEntry = isNotes || isBarlinePlacement;
    const questionCard = container.closest(".question-card");
    const rhythmDataKey = ["q4d", "q4e"].includes(subquestion.id)
      ? `q3CurrentRhythmQ${subquestion.id.slice(1)}`
      : "q3CurrentRhythmValue";
    if (isNotes && questionCard) questionCard.dataset.q3CurrentNoteValue = String(value || "");
    if (isRhythmPlacement && questionCard) questionCard.dataset[rhythmDataKey] = String(value || "");

    function refresh(next, notify = true) {
      const selected = isSequenceEntry ? history.join(",") : next;
      tools.querySelectorAll("button").forEach(button => button.classList.toggle("is-selected", !isSequenceEntry && button.dataset.value === selected));
      if (notify) onChange(selected);
    }

    subquestion.options.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `notation-tool-button notation-tool-${subquestion.notationTool}`;
      button.dataset.value = item.value;
      button.setAttribute("aria-keyshortcuts", "Shift+Delete");
      if (subquestion.notationTool === "dynamic") {
        const symbol = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte", sfz: "sforzato" }[item.value];
        button.innerHTML = `<span class="notation-option-glyph" aria-hidden="true">${q3Glyph(symbol)}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "accidental") {
        const symbol = { flat: "flatInScore", natural: "naturalInScore", sharp: "sharpInScore" }[item.value];
        button.innerHTML = `<span class="notation-option-glyph notation-accidental-option-glyph" aria-hidden="true">${q3Glyph(symbol)}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "time-signature") {
        const isCommonTime = ["c", "common time"].includes(String(item.value).trim().toLocaleLowerCase("en-GB"));
        const [upper, lower] = item.value.split("/");
        button.innerHTML = `<span class="notation-time-signature-preview${isCommonTime ? " is-common-time" : ""}" aria-hidden="true">${isCommonTime ? `<span>${q3Glyph("timeSigCommon")}</span>` : `<span>${[...upper].map(digit => q3Glyph(`timeSig${digit}`)).join("")}</span><span>${q3Glyph(`timeSig${lower}`)}</span>`}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "repeat-sign") {
        button.innerHTML = `<span class="notation-option-glyph notation-repeat-option-glyph" aria-hidden="true">${q3Glyph("repeatRight")}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "barline-entry") {
        button.innerHTML = `<span class="notation-option-glyph notation-barline-option-glyph" aria-hidden="true">${q3Glyph("barlineSingle")}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "bar-label") {
        const isDaCapo = item.value === "D.C." || item.label === "D.C.";
        button.innerHTML = isDaCapo
          ? `<span class="notation-option-glyph notation-da-capo-option-glyph" aria-hidden="true">${q3Glyph("daCapo")}</span><span class="visually-hidden">${item.label}</span>`
          : item.label;
      } else if (subquestion.notationTool === "rhythm-entry") {
        const compoundRhythmGlyphs = {
          "quaver,quaver": `${q3Glyph("eighthNoteStemUp")} ${q3Glyph("eighthNoteStemUp")}`,
          "quaver,dottedCrotchet": `${q3Glyph("eighthNoteStemUp")} ${q3Glyph("quarterNoteStemUp")}${q3Glyph("augmentationDot")}`,
          "crotchetRest,quaverRest": `${q3Glyph("quarterRest")} ${q3Glyph("eighthRest")}`,
          "quaverRest,quaverRest,quaverRest": `${q3Glyph("eighthRest")} ${q3Glyph("eighthRest")} ${q3Glyph("eighthRest")}`,
          dottedCrotchetRest: `${q3Glyph("quarterRest")}${q3Glyph("augmentationDot")}`,
        };
        // Use the calibrated standalone Bravura rest glyphs for the whole-rest
        // and minim-rest choices, matching the rhythm activities.
        const restGlyphs = {
          semibreveRest: "\uE4F4",
          minimRest: "\uE4F5",
          crotchetRest: q3Glyph("quarterRest"),
          quaverRest: q3Glyph("eighthRest"),
        };
        const glyph = compoundRhythmGlyphs[item.value]
          ? `<span class="rhythm-compound-preview">${compoundRhythmGlyphs[item.value]}</span>`
          : restGlyphs[item.value]
          ? `<span class="rhythm-glyph-layer rhythm-glyph-accent">${restGlyphs[item.value]}</span>`
          : ["tripletQuaver", "tripletCrotchet"].includes(item.value)
          ? rhythmTripletPreviewSvg(item.value)
          : item.value === "dottedCrotchet"
          ? `<span class="rhythm-glyph-layer rhythm-glyph-muted">${q3Glyph("quarterNoteStemUp")}</span><span class="rhythm-glyph-layer rhythm-glyph-accent rhythm-glyph-dot">${q3Glyph("augmentationDot")}</span>`
          : item.value === "quaver"
            ? `<span class="rhythm-glyph-layer rhythm-glyph-accent">${q3Glyph("eighthNoteStemUp")}</span><span class="rhythm-glyph-layer rhythm-glyph-muted">${q3Glyph("quarterNoteStemUp")}</span>`
            : `<span class="rhythm-glyph-layer rhythm-glyph-accent">${q3Glyph("sixteenthNoteStemUp")}</span>`;
        const rhythmClass = compoundRhythmGlyphs[item.value] ? "is-compound-tool" : restGlyphs[item.value] ? "is-rest-tool" : ["tripletQuaver", "tripletCrotchet"].includes(item.value) ? "is-triplet-tool" : item.value === "dottedCrotchet" ? "is-dot-tool" : item.value === "quaver" ? "is-tail-tool" : "is-semiquaver-tool";
        button.innerHTML = `<span class="notation-option-glyph notation-rhythm-option-glyph ${rhythmClass}" aria-hidden="true">${glyph}</span><span class="visually-hidden">${item.label}</span>`;
      } else button.textContent = item.label;
      button.addEventListener("click", () => {
        if (isBarlinePlacement) return;
        if (isAccidentalPlacement) {
          q3SetAccidentalToolArmed(item.value, button);
          return;
        }
        if (subquestion.notationTool === "repeat-sign") {
          q3SetRepeatToolArmed(true, button);
          return;
        }
        if (subquestion.notationTool === "bar-label") {
          q3SetBarLabelToolArmed(true, button);
          return;
        }
        if (isRhythmPlacement) {
          q3SetRhythmToolArmed(item.value, button);
          return;
        }
        if (!isSequenceEntry) return refresh(item.value);
        if (history.length >= subquestion.noteSlots) return;
        history.push(item.value);
        refresh(history.join(","));
      });
      bindRemovalGesture(button, () => {
        if (isAccidentalPlacement) {
          q3SetAccidentalToolArmed("", button);
          return onChange("");
        }
        if (subquestion.notationTool === "repeat-sign") {
          q3SetRepeatToolArmed(false, button);
          return onChange("");
        }
        if (subquestion.notationTool === "bar-label") {
          q3SetBarLabelToolArmed(false, button);
          return onChange("");
        }
        if (isRhythmPlacement) {
          q3SetRhythmToolArmed("", button);
          if (questionCard) {
            questionCard.dataset[rhythmDataKey] = "";
            delete questionCard.dataset.q3Higher2024RhythmOverrides;
          }
          return onChange("");
        }
        if (isSequenceEntry) {
          history = [];
          if (isNotes && questionCard) questionCard.dataset.q3CurrentNoteValue = "";
          return onChange("");
        }
        if (!button.classList.contains("is-selected")) return;
        refresh("");
      });
      tools.append(button);
    });
    if (isSequenceEntry || isRhythmPlacement || isAccidentalPlacement) {
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "notation-clear-button";
      clearButton.textContent = "Clear";
      clearButton.addEventListener("click", () => {
        history = [];
        if (isNotes && questionCard) questionCard.dataset.q3CurrentNoteValue = "";
        if (isRhythmPlacement && questionCard) {
          questionCard.dataset[rhythmDataKey] = "";
          delete questionCard.dataset.q3Higher2024RhythmOverrides;
        }
        if (isAccidentalPlacement) q3SetAccidentalToolArmed("", container);
        refresh("");
      });
      const isHigherQuestionFour = questionCard?.classList.contains("paper-level-h") && questionCard?.classList.contains("question-q4");
      (isHigherQuestionFour ? controlsOnly : tools).append(clearButton);
    }
    refresh(value || "", false);
    if (subquestion.notationTool === "repeat-sign") q3SetRepeatToolArmed(q3RepeatArmed, container);
    if (subquestion.notationTool === "bar-label") q3SetBarLabelToolArmed(q3BarLabelArmed, container);
    if (isRhythmPlacement) q3SetRhythmToolArmed(q3RhythmToolArmed, container);
    if (isAccidentalPlacement) q3SetAccidentalToolArmed(q3AccidentalToolArmed, container);
  }

  function drawStaff(svg, selected, tool) {
    const gap = root.SHARED_NOTATION_CONFIG?.stave?.lineGap || 14;
    const top = 44;
    for (let index = 0; index < 5; index += 1) {
      svg.append(svgElement("line", { x1: 28, x2: 612, y1: top + index * gap, y2: top + index * gap, stroke: "#292524", "stroke-width": 1.2 }));
    }
    const clef = svgElement("text", { x: 34, y: 97, class: "notation-glyph notation-clef" });
    clef.textContent = "";
    svg.append(clef);
    const sharp = svgElement("text", { x: 72, y: 68, class: "notation-glyph notation-sharp" });
    sharp.textContent = "";
    svg.append(sharp);
    const barXs = [116, 236, 356, 476, 612];
    barXs.forEach(x => svg.append(svgElement("line", { x1: x, x2: x, y1: top, y2: top + gap * 4, stroke: "#57534e", "stroke-width": 1 })));
    [144, 184, 265, 305, 385, 425, 505, 545].forEach((x, index) => {
      const y = [72, 86, 65, 79, 72, 58, 86, 72][index];
      svg.append(svgElement("ellipse", { cx: x, cy: y, rx: 6.5, ry: 4.6, fill: "#1c1917", transform: `rotate(-18 ${x} ${y})` }));
      svg.append(svgElement("line", { x1: x + 5, x2: x + 5, y1: y, y2: y - 28, stroke: "#1c1917", "stroke-width": 1.7 }));
    });
    if (tool === "time-signature" && selected) {
      const [topNumber, bottomNumber] = selected.split("/");
      const textTop = svgElement("text", { x: 94, y: 68, class: "time-signature-number" });
      const textBottom = svgElement("text", { x: 94, y: 96, class: "time-signature-number" });
      textTop.textContent = topNumber;
      textBottom.textContent = bottomNumber;
      svg.append(textTop, textBottom);
    }
    if (tool === "dynamic" && selected) {
      const dynamic = svgElement("text", { x: 132, y: 124, class: "notation-dynamic" });
      dynamic.textContent = selected;
      svg.append(dynamic);
    }
    if (tool === "note-entry") {
      const cover = svgElement("rect", { x: 238, y: 35, width: 116, height: 72, rx: 5, fill: "#f5f5f4", stroke: selected ? "#1c1917" : "#a8a29e", "stroke-dasharray": "5 4" });
      svg.append(cover);
      const pitches = String(selected || "").split(",").filter(Boolean);
      const pitchY = { "B": 72, "D": 86, "E": 79, "F♯": 65 };
      pitches.forEach((pitch, index) => {
        const x = 260 + index * 34;
        const y = pitchY[pitch] || 72;
        svg.append(svgElement("ellipse", { cx: x, cy: y, rx: 6.5, ry: 4.6, fill: "#1c1917", transform: `rotate(-18 ${x} ${y})` }));
        svg.append(svgElement("line", { x1: x + 5, x2: x + 5, y1: y, y2: y - 28, stroke: "#1c1917", "stroke-width": 1.7 }));
      });
      if (!pitches.length) {
        const label = svgElement("text", { x: 296, y: 76, "text-anchor": "middle", class: "missing-pattern-label" });
        label.textContent = "Enter three notes";
        svg.append(label);
      }
    }
    if (tool === "repeat-sign" && selected) {
      const x = selected === "end-bar-4" ? 356 : selected === "start-bar-1" ? 116 : 612;
      const repeat = svgElement("text", { x: x - 14, y: 96, class: "notation-glyph notation-repeat" });
      repeat.textContent = "";
      svg.append(repeat);
    }
  }

  function render(container, subquestion, value, onChange) {
    if (subquestion.sharedScore) return renderSharedControls(container, subquestion, value, onChange);
    let history = value ? [value] : [];
    container.innerHTML = `
      <div class="notation-task" data-notation-task>
        <div class="notation-score-wrap"><svg class="notation-score" viewBox="0 0 640 142" role="img" aria-label="Interactive music notation preview"></svg></div>
        <div class="notation-tools" role="group" aria-label="${subquestion.prompt}"></div>
      </div>`;
    const svg = container.querySelector("svg");
    const tools = container.querySelector(".notation-tools");

    function update(next, record = true) {
      if (record && next !== history.at(-1)) history.push(next);
      svg.innerHTML = "";
      drawStaff(svg, next, subquestion.notationTool);
      tools.querySelectorAll("button").forEach(button => button.classList.toggle("is-selected", button.dataset.value === next));
      onChange(next);
    }

    subquestion.options.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "notation-tool-button";
      button.dataset.value = item.value;
      button.setAttribute("aria-keyshortcuts", "Shift+Delete");
      button.textContent = item.label;
      button.addEventListener("click", () => {
        if (subquestion.notationTool !== "note-entry") return update(item.value);
        const notes = String(history.at(-1) || "").split(",").filter(Boolean);
        if (notes.length >= subquestion.noteSlots) return;
        notes.push(item.value);
        update(notes.join(","));
      });
      bindRemovalGesture(button, () => {
        const current = String(history.at(-1) || "");
        if (!current) return;
        if (subquestion.notationTool !== "note-entry") return update("", false);
        const notes = current.split(",").filter(Boolean);
        notes.pop();
        update(notes.join(","), false);
      });
      tools.append(button);
    });
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("aria-keyshortcuts", "Shift+Delete");
    bindRemovalGesture(svg, () => {
      const current = String(history.at(-1) || "");
      if (!current) return;
      if (subquestion.notationTool !== "note-entry") return update("", false);
      const notes = current.split(",").filter(Boolean);
      notes.pop();
      update(notes.join(","), false);
    });
    update(value || "", false);
  }

  function getInventory(id) {
    if (id === "higher-2025-q4") return JSON.parse(JSON.stringify({
      bars: HIGHER_2025_Q4_BARS,
      lyrics: HIGHER_2025_Q4_LYRICS,
      lyricOffsets: HIGHER_2025_Q4_LYRIC_OFFSETS,
      transpose: HIGHER_2025_Q4_TRANSPOSE,
      timeSignature: "4/4",
      subdominantBar: 3,
      subdominantIndices: HIGHER_2025_Q4_BARS[2].subdominantIndices,
      subdominantSelectableIndices: HIGHER_2025_Q4_BARS[2].subdominantSelectableIndices,
      chordBars: [7, 8],
      transposeBar: 11,
      transposeIndices: HIGHER_2025_Q4_BARS[10].transposeIndices,
      missingNoteBar: 17,
      missingIndices: HIGHER_2025_Q4_BARS[16].missingIndices,
      missingBarlineAfterBar: 21,
      intervalBar: 23,
      intervalIndices: HIGHER_2025_Q4_BARS[22].intervalIndices,
      finalBarline: "double",
      scoreLayout: HIGHER_2025_Q4_SCORE_LAYOUT,
    }));
    if (id === "higher-2024-q4") return JSON.parse(JSON.stringify({
      bars: HIGHER_2024_Q4_BARS,
      lyrics: HIGHER_2024_Q4_LYRICS,
      lyricOffsets: HIGHER_2024_Q4_LYRIC_OFFSETS,
      transpose: HIGHER_2024_Q4_TRANSPOSE,
      timeSignature: "4/4",
      intervalBar: 3,
      intervalIndices: HIGHER_2024_Q4_BARS[2].intervalIndices,
      rhythmCorrectionBar: 6,
      rhythmCorrectionIndices: HIGHER_2024_Q4_BARS[5].rhythmCorrectionIndices,
      dominantBars: [9, 10],
      dominantIndices: HIGHER_2024_Q4_BARS[9].dominantIndices,
      dominantSelectableBars: HIGHER_2024_Q4_SCORE_LAYOUT.dominantSelectableBars.map(index => index + 1),
      transposeBar: 14,
      transposeIndices: HIGHER_2024_Q4_BARS[13].transposeIndices,
      chordBars: [19, 21],
      daCapoBar: 24,
      scoreLayout: HIGHER_2024_Q4_SCORE_LAYOUT,
      finalBarline: "single",
    }));
    if (id === "higher-2023-q4") return JSON.parse(JSON.stringify({
      bars: HIGHER_2023_Q4_BARS,
      transpose: HIGHER_2023_Q4_TRANSPOSE,
      lyrics: HIGHER_2023_Q4_LYRICS,
      lyricOffsets: HIGHER_2023_Q4_LYRIC_OFFSETS,
      lyricYOffsets: HIGHER_2023_Q4_LYRIC_Y_OFFSETS,
      timeSignature: "4/4",
      intervalBar: 2,
      transposeBar: 4,
      missingNoteBar: 7,
      rhythmCorrectionBar: 9,
      missingRestBar: 12,
      chordBars: [14, 15],
      acceptedRestAnswers: ["crotchetRest,quaverRest", "quaverRest,quaverRest,quaverRest", "dottedCrotchetRest"],
      scoreLayout: HIGHER_2023_Q4_SCORE_LAYOUT,
      finalBarline: "double",
    }));
    if (id === "higher-2022-q4") return JSON.parse(JSON.stringify({
      bars: HIGHER_2022_Q4_BARS,
      transpose: HIGHER_2022_Q4_TRANSPOSE,
      timeSignature: "12/8",
      intervalBar: 4,
      chordBars: [6, 7],
      tonicBar: 8,
      tonicIndex: 2,
      missingNoteBar: 11,
      transposeBars: [12, 13],
      scoreLayout: HIGHER_2022_Q4_SCORE_LAYOUT,
      finalBarline: "double",
    }));
    if (id === "higher-2019-q3") return JSON.parse(JSON.stringify({
      bars: HIGHER_2019_Q3_BARS,
      transpose: HIGHER_2019_Q3_TRANSPOSE,
      lyrics: HIGHER_2019_Q3_LYRICS,
      lyricTextAnchors: HIGHER_2019_Q3_LYRIC_TEXT_ANCHORS,
      scoreLayout: HIGHER_2019_Q3_SCORE_LAYOUT,
      intervalBars: [2, 3],
      chordBars: [10, 11],
      missingNoteBars: [14, 15],
      missingRestBar: 21,
      transposeBar: 24,
      finalBarline: "single",
    }));
    if (id === "higher-2018-q3") return JSON.parse(JSON.stringify({
      lines: HIGHER_2018_Q3_LINES,
      line2BeamGroups: HIGHER_2018_Q3_LINE2_BEAM_GROUPS,
      figureBeamGroups: HIGHER_2018_Q3_FIGURE_BEAM_GROUPS,
      line2Acciaccaturas: HIGHER_2018_Q3_LINE2_ACCIACCATURAS,
      missingBarlineIds: HIGHER_2018_Q3_LINE2_MISSING_BARLINE_IDS,
      printedBarlineIds: HIGHER_2018_Q3_LINE2_PRINTED_BARLINE_IDS,
      transposeSource: [
        HIGHER_2018_Q3_LINES.line3[0].notes[0], HIGHER_2018_Q3_LINES.line3[0].notes[1],
        HIGHER_2018_Q3_LINES.line3[0].notes[2], HIGHER_2018_Q3_LINES.line3[1].notes[0],
      ],
      missingNoteIndices: HIGHER_2018_Q3_LINES.line4[4].missingIndices,
      intervalNoteIndices: HIGHER_2018_Q3_LINES.line5[2].intervalIndices,
      rhythmCorrectionIndices: HIGHER_2018_Q3_LINES.line8[2].rhythmCorrectionIndices,
      scoreLayout: HIGHER_2018_Q3_SCORE_LAYOUT,
      line2FinalBarline: "single",
      line9FinalBarline: "none",
      finalBarline: "none",
    }));
    if (id === "higher-2017-q4") return JSON.parse(JSON.stringify({
      bars: HIGHER_2017_Q4_BARS,
      transpose: HIGHER_2017_Q4_TRANSPOSE,
      valueNoteIndices: HIGHER_2017_Q4_BARS[4].valueIndices,
      missingNoteIndices: HIGHER_2017_Q4_BARS[10].missingIndices,
      transposeNoteIndices: HIGHER_2017_Q4_BARS[21].transposeIndices,
      lyrics: HIGHER_2017_Q4_LYRICS,
      lyricOffsets: HIGHER_2017_Q4_LYRIC_OFFSETS,
      lyricPositionIndices: HIGHER_2017_Q4_LYRIC_POSITION_INDICES,
      scoreLayout: HIGHER_2017_Q4_SCORE_LAYOUT,
      finalBarline: "single",
    }));
    if (id === "higher-2016-q4") return JSON.parse(JSON.stringify({
      pickup: HIGHER_2016_Q4_PICKUP,
      bars: HIGHER_2016_Q4_BARS,
      transpose: HIGHER_2016_Q4_TRANSPOSE,
      transposeSource: HIGHER_2016_Q4_TRANSPOSE_SOURCE,
      rhythmCorrectionIndices: HIGHER_2016_Q4_BARS[4].rhythmCorrectionIndices,
      missingNoteIndices: HIGHER_2016_Q4_BARS[13].missingIndices,
      finalBarline: "none",
    }));
    if (id !== "higher-2015-q4") return null;
    return JSON.parse(JSON.stringify({
      bars: HIGHER_2015_Q4_BARS,
      lyrics: HIGHER_2015_Q4_LYRICS,
      lyricOffsets: HIGHER_2015_Q4_LYRIC_OFFSETS,
      line5: HIGHER_2015_Q4_LINE_5,
      line5Lyrics: HIGHER_2015_Q4_LINE_5_LYRICS,
      line5BeamGroups: HIGHER_2015_Q4_LINE_5_BEAM_GROUPS,
      line5Slurs: HIGHER_2015_Q4_LINE_5_SLURS,
      accidentalNoteIndices: HIGHER_2015_Q4_ACCIDENTAL_NOTE_INDICES,
      finalLine: HIGHER_2015_Q4_FINAL_LINE,
      finalLineBeamGroups: HIGHER_2015_Q4_FINAL_LINE_BEAM_GROUPS,
    }));
  }

  const api = { render, renderSharedScore, getInventory, formatHigherChordAnswer };
  root.ExamNotation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
