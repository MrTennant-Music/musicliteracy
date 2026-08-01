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
  const Q3_PITCH_STEPS = { C4: -2, D4: -1, E4: 0, F4: 1, "F♯4": 1, G4: 2, A4: 3, Ab4: 3, B4: 4, Bb4: 4, C5: 5, D5: 6, E5: 7, F5: 8, "F♯5": 8, G5: 9, A5: 10 };
  const Q3_PITCH_BY_STEP = Object.fromEntries(Object.entries(Q3_PITCH_STEPS).filter(([pitch]) => !["F♯4", "F♯5", "Ab4", "Bb4"].includes(pitch)).map(([pitch, step]) => [step, pitch]));
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
    dottedQuaverRest: { beats: .75, spacing: 1.12 },
    quaverRest: { beats: .5, spacing: .95 },
    crotchetRest: { beats: 1, spacing: 1.15 },
    minimRest: { beats: 2, spacing: 2.15 },
  };
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
    if (["dottedQuaverRest", "quaverRest"].includes(rhythm)) return "eighthRest";
    if (rhythm === "minimRest") return "halfRest";
    if (["minim", "dottedMinim"].includes(rhythm)) return down ? "halfNoteStemDown" : "halfNoteStemUp";
    if (rhythm === "crotchetRest") return "quarterRest";
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
  function q3BeamPolygon(svg, beam) {
    const thickness = Math.max(1, Q3_STAFF.gap * Number(q3SharedConfig().drawing?.beamThicknessScale || .42));
    const half = thickness / 2;
    svg.append(svgElement("polygon", {
      points: `${beam.start.x - .5},${beam.start.y - half} ${beam.end.x + .5},${beam.end.y - half} ${beam.end.x + .5},${beam.end.y + half} ${beam.start.x - .5},${beam.start.y + half}`,
      class: "q3-beam-shape",
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
      const ledgerY = item.step <= -2 ? q3YForStep(-2, top) : q3YForStep(10, top);
      svg.append(svgElement("line", {
        x1: x - Q3_STAFF.gap,
        x2: x + Q3_STAFF.gap,
        y1: ledgerY,
        y2: ledgerY,
        class: "q3-ledger-line",
        opacity: options.opacity ?? 1,
      }));
    }
    const visualScale = Number(options.scale || 1);
    const symbolSettings = q3SymbolConfig(key);
    if (!item.rest && item.accidental) {
      q3CalibratedSymbol(svg, `${item.accidental}InScore`, x - Q3_STAFF.gap * 1.4 + Number(item.accidentalXOffset || 0), y, {
        className: options.className || "",
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
    const y = stemsUp ? Math.max(first.y, second.y) + Q3_STAFF.gap * .28 : Math.min(first.y, second.y) - Q3_STAFF.gap * .28;
    const stretch = Math.max(1.4, Math.min(7.2 * Number(options.widthScale || 1), Math.abs(second.x - first.x) / (Q3_STAFF.gap * 2)));
    q3Text(svg, q3Glyph("tie"), {
      x: 0,
      y: 0,
      "font-size": 58,
      "text-anchor": "middle",
      transform: `translate(${midX} ${y}) scale(${stretch} 1)${stemsUp ? "" : " rotate(180)"}`,
    }, "q3-music-glyph");
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
    q3Text(svg, q3Glyph(`timeSig${upper}`), { x, y: y - fontSize * .14, "font-size": fontSize, "text-anchor": "middle" }, `q3-music-glyph ${answerClass}`.trim());
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
    for (let line = 0; line < 5; line += 1) {
      svg.append(svgElement("line", { x1: left, x2: right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
    }
    q3CalibratedSymbol(svg, options.bass ? "fClef" : "gClef", left + 27, q3YForStep(options.bass ? 6 : 2, top));
    if (options.timeSignature) q3DrawTimeSignature(svg, "4/4", top, "", 0, left + 83);
  }

  function higher2015Positions(notes, start, end, options = {}) {
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
        className: options.className || "",
        opacity: options.opacity ?? 1,
        scale: options.scale || 1,
      });
    });
    groups.forEach(group => {
      const groupNotes = visibleNotes.slice(group.start, group.end + 1);
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
        q3BeamPolygon(svg, {
          start: { x: x1, y: q3BeamY(x1, beam) + offset + lift },
          end: { x: x2, y: q3BeamY(x2, beam) + offset + lift },
        });
      });
    });
    visibleNotes.forEach((item, index) => {
      if (item?.tieToNext && points[index] && points[index + 1]) q3DrawTie(svg, points[index], points[index + 1]);
    });
    (options.slurs || []).forEach(slur => {
      if (points[slur.start] && points[slur.end]) q3DrawTie(svg, points[slur.start], points[slur.end], { widthScale: slur.widthScale || 1 });
    });
    return points;
  }

  function higher2015Lyrics(svg, lyrics, positions, top, options = {}) {
    (lyrics || []).forEach((syllable, index) => {
      if (!syllable || positions[index] === undefined) return;
      const xOffset = Number(options.xOffsets?.[index] || 0);
      q3Text(svg, syllable, { x: positions[index] + xOffset, y: top + Q3_STAFF.gap * 7.15, "text-anchor": "middle" }, "q3-score-lyrics");
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
        q3Text(svg, String(barIndex + 1), { x: start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
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
      if (answers.q4b) q3Text(svg, String(answers.q4b), { x: intervalAnswerX + (needsCorrection("q4b") ? -14 : 0), y: intervalBoxTop + 44, "text-anchor": "middle" }, `q3-entered-answer ${answerClass("q4b")}`.trim());
      if (needsCorrection("q4b")) q3Text(svg, "4th", { x: intervalAnswerX + (answers.q4b ? 24 : 0), y: intervalBoxTop + 44, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
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
        q3Text(svg, token, { x: chordBoxX[index] + chordAnswerBoxWidth / 2 + (needsCorrection("q4f") && !tokenCorrect ? -7 : 0), y: chordAnswerBoxTop + chordAnswerBoxHeight - 8, "text-anchor": "middle" }, `q3-entered-answer ${className}`.trim());
      });
      if (needsCorrection("q4f")) expectedChordTokens.forEach((token, index) => {
        const enteredToken = chordTokens[index] || "";
        if (acceptedChordTokens[index].includes(enteredToken.toLocaleLowerCase("en-GB"))) return;
        q3Text(svg, token, { x: chordBoxX[index] + chordAnswerBoxWidth / 2 + (enteredToken ? 13 : 0), y: chordAnswerBoxTop + chordAnswerBoxHeight - 8, "text-anchor": "middle" }, "q3-entered-answer q3-answer-correction");
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

  function renderSharedScore(container, question, answers, onAnswerChange, review = {}) {
    container.innerHTML = `<div class="shared-notation-score-wrap"></div>`;
    const score = question?.score?.sharedNotation === "higher-2015-q4"
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
    if (isNotes && questionCard) questionCard.dataset.q3CurrentNoteValue = String(value || "");
    if (isRhythmPlacement && questionCard) questionCard.dataset.q3CurrentRhythmValue = String(value || "");

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
        button.innerHTML = `<span class="notation-time-signature-preview${isCommonTime ? " is-common-time" : ""}" aria-hidden="true">${isCommonTime ? `<span>${q3Glyph("timeSigCommon")}</span>` : `<span>${q3Glyph(`timeSig${upper}`)}</span><span>${q3Glyph(`timeSig${lower}`)}</span>`}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "repeat-sign") {
        button.innerHTML = `<span class="notation-option-glyph notation-repeat-option-glyph" aria-hidden="true">${q3Glyph("repeatRight")}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "barline-entry") {
        button.innerHTML = `<span class="notation-option-glyph notation-barline-option-glyph" aria-hidden="true">${q3Glyph("barlineSingle")}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "bar-label") {
        button.textContent = item.label;
      } else if (subquestion.notationTool === "rhythm-entry") {
        const glyph = item.value === "dottedCrotchet"
          ? `<span class="rhythm-glyph-layer rhythm-glyph-muted">${q3Glyph("quarterNoteStemUp")}</span><span class="rhythm-glyph-layer rhythm-glyph-accent rhythm-glyph-dot">${q3Glyph("augmentationDot")}</span>`
          : item.value === "quaver"
            ? `<span class="rhythm-glyph-layer rhythm-glyph-accent">${q3Glyph("eighthNoteStemUp")}</span><span class="rhythm-glyph-layer rhythm-glyph-muted">${q3Glyph("quarterNoteStemUp")}</span>`
            : `<span class="rhythm-glyph-layer rhythm-glyph-accent">${q3Glyph("sixteenthNoteStemUp")}</span>`;
        const rhythmClass = item.value === "dottedCrotchet" ? "is-dot-tool" : item.value === "quaver" ? "is-tail-tool" : "is-semiquaver-tool";
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
          if (questionCard) questionCard.dataset.q3CurrentRhythmValue = "";
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
        if (isRhythmPlacement && questionCard) questionCard.dataset.q3CurrentRhythmValue = "";
        if (isAccidentalPlacement) q3SetAccidentalToolArmed("", container);
        onChange("");
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
