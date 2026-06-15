/*
  Notation calibration page.

  This admin page draws a Higher-style notation preview. The stave is the fixed
  reference. The controls edit one selected Bravura symbol at a time.
*/

const SVG_NS = "http://www.w3.org/2000/svg";

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value));
}

const DEFAULT_CONFIG = cloneConfig(SHARED_NOTATION_CONFIG);
let config = cloneConfig(DEFAULT_CONFIG);
let selectedCategory = "Clefs";
let selectedSymbolKey = "gClef";

const stage = document.getElementById("notationStage");
const notationScroll = document.querySelector(".notation-scroll");
const symbolSelect = document.getElementById("symbolSelect");
const generatedSymbolChecks = document.getElementById("generatedSymbolChecks");
const exportText = document.getElementById("exportText");
const importText = document.getElementById("importText");

const controls = {
  zoom: document.getElementById("zoom"),
  showGuides: document.getElementById("showGuides"),
  fontSizeScale: document.getElementById("fontSizeScale"),
  widthScale: document.getElementById("widthScale"),
  heightScale: document.getElementById("heightScale"),
  xOffsetScale: document.getElementById("xOffsetScale"),
  yOffsetScale: document.getElementById("yOffsetScale"),
};

const outputs = Object.fromEntries(
  Object.keys(controls).map((id) => [id, document.getElementById(`${id}Value`)])
);

const ALL_NOTE_KEYS = [
  "noteheadBlackStemUp",
  "noteheadBlackStemDown",
  "wholeNote",
  "halfNoteStemUp",
  "halfNoteStemDown",
  "quarterNoteStemUp",
  "quarterNoteStemDown",
  "eighthNoteStemUp",
  "eighthNoteStemDown",
  "sixteenthNoteStemUp",
  "sixteenthNoteStemDown",
];

const SYMBOL_GROUPS = {
  "Clefs": ["gClef", "fClef"],
  "Notes": ["allNotes", ...ALL_NOTE_KEYS, "augmentationDotLine", "augmentationDotSpace", "tie"],
  "Beams": ["quaverBeam", "semiquaverBeam", "semiquaverSecondBeam", "semiquaverBeamHook"],
  "Accidentals": ["flatKeySignature", "sharpKeySignature", "flatInScore", "naturalInScore", "sharpInScore"],
  "Rests": ["wholeRest", "halfRest", "quarterRest", "eighthRest", "sixteenthRest"],
  "Barlines And Repeats": ["barlineSingle", "barlineFinal", "repeatLeft", "repeatRight"],
  "Time Signatures": ["timeSignature"],
  "Articulations": ["accentAbove", "accentBelow", "staccatoAbove", "staccatoBelow"],
  "Dynamics": ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato", "crescendo", "diminuendo"],
  "Other": ["brace", "ledgerLines", "ledgerLineAccidentals"],
};

const SYMBOL_SETTING_KEYS = [
  "fontSizeScale",
  "widthScale",
  "heightScale",
  "xOffsetScale",
  "yOffsetScale",
];

const SYMBOL_LABELS = {
  brace: "Brace",
  barlineSingle: "Single Barline",
  barlineFinal: "Final Barline",
  repeatLeft: "Start Repeat",
  repeatRight: "End Repeat",
  gClef: "Treble Clef",
  fClef: "Bass Clef",
  timeSignature: "Time Signature",
  timeSig24: "2/4",
  timeSig34: "3/4",
  timeSig44: "4/4",
  timeSig54: "5/4",
  timeSig68: "6/8",
  timeSig98: "9/8",
  timeSig128: "12/8",
  allNotes: "All Notes",
  noteheadBlackStemUp: "Black Notehead Stem Up",
  noteheadBlackStemDown: "Black Notehead Stem Down",
  wholeNote: "Semibreve",
  halfNoteStemUp: "Minim Stem Up",
  halfNoteStemDown: "Minim Stem Down",
  quarterNoteStemUp: "Crotchet Stem Up",
  quarterNoteStemDown: "Crotchet Stem Down",
  eighthNoteStemUp: "Quaver Stem Up",
  eighthNoteStemDown: "Quaver Stem Down",
  sixteenthNoteStemUp: "Semiquaver Stem Up",
  sixteenthNoteStemDown: "Semiquaver Stem Down",
  quaverBeam: "Quaver Beam",
  semiquaverBeam: "Semiquaver Beam",
  semiquaverSecondBeam: "Semiquaver Second Beam",
  semiquaverBeamHook: "Semiquaver Beam Hook",
  augmentationDotLine: "Dot On Line Note",
  augmentationDotSpace: "Dot On Space Note",
  tie: "Tie",
  flatKeySignature: "Flat In Key Signature",
  sharpKeySignature: "Sharp In Key Signature",
  flatInScore: "Flat In Score",
  naturalInScore: "Natural In Score",
  sharpInScore: "Sharp In Score",
  accentAbove: "Accent Above",
  accentBelow: "Accent Below",
  staccatoAbove: "Staccato Above",
  staccatoBelow: "Staccato Below",
  wholeRest: "Semibreve Rest",
  halfRest: "Minim Rest",
  quarterRest: "Crotchet Rest",
  eighthRest: "Quaver Rest",
  sixteenthRest: "Semiquaver Rest",
  piano: "Piano",
  forte: "Forte",
  pianissimo: "Pianissimo",
  mezzoPiano: "Mezzo Piano",
  mezzoForte: "Mezzo Forte",
  fortissimo: "Fortissimo",
  sforzato: "Sforzato",
  crescendo: "Crescendo",
  diminuendo: "Diminuendo",
  ledgerLines: "Ledger Lines",
  ledgerLineAccidentals: "Accidentals On Ledger-Line Notes",
};

function symbolLabel(key) {
  return SYMBOL_LABELS[key] || key;
}

const DEFAULT_GENERATED_SYMBOLS = {
  gClef: true,
  fClef: true,
  brace: true,
  timeSignature: true,
  barlineSingle: true,
  barlineFinal: true,
  noteheadBlackStemUp: true,
  noteheadBlackStemDown: true,
  wholeNote: true,
  halfNoteStemUp: true,
  halfNoteStemDown: true,
  quarterNoteStemUp: true,
  quarterNoteStemDown: true,
  eighthNoteStemUp: true,
  eighthNoteStemDown: true,
  sixteenthNoteStemUp: true,
  sixteenthNoteStemDown: true,
  quaverBeam: true,
  semiquaverBeam: true,
  semiquaverSecondBeam: true,
  semiquaverBeamHook: true,
  augmentationDotLine: true,
  augmentationDotSpace: true,
  flatKeySignature: true,
  sharpKeySignature: true,
  flatInScore: true,
  sharpInScore: true,
  naturalInScore: false,
  tie: false,
  wholeRest: false,
  halfRest: false,
  quarterRest: false,
  eighthRest: false,
  sixteenthRest: false,
  repeatLeft: false,
  repeatRight: false,
  accentAbove: false,
  accentBelow: false,
  staccatoAbove: false,
  staccatoBelow: false,
  piano: false,
  forte: false,
  pianissimo: false,
  mezzoPiano: false,
  mezzoForte: false,
  fortissimo: false,
  sforzato: false,
  crescendo: false,
  diminuendo: false,
  ledgerLines: false,
  ledgerLineAccidentals: false,
};

let generatedSymbols = { ...DEFAULT_GENERATED_SYMBOLS };

function generatedKeyForSymbol(key) {
  if (isTimeSignatureKey(key)) return "timeSignature";
  if (key === "augmentationDot") return "augmentationDotSpace";
  return key;
}

function generatedEnabled(key) {
  return Boolean(generatedSymbols[generatedKeyForSymbol(key)]);
}

const TIME_SIGNATURES = {
  timeSig24: { top: ["timeSig2"], bottom: ["timeSig4"] },
  timeSig34: { top: ["timeSig3"], bottom: ["timeSig4"] },
  timeSig44: { top: ["timeSig4"], bottom: ["timeSig4"] },
  timeSig54: { top: ["timeSig5"], bottom: ["timeSig4"] },
  timeSig68: { top: ["timeSig6"], bottom: ["timeSig8"] },
  timeSig98: { top: ["timeSig9"], bottom: ["timeSig8"] },
  timeSig128: { top: ["timeSig1", "timeSig2"], bottom: ["timeSig8"] },
};

function hasRenderableSymbol(key) {
  return key === "allNotes"
    || key === "timeSignature"
    || key === "quaverBeam"
    || key === "semiquaverBeam"
    || key === "semiquaverSecondBeam"
    || key === "semiquaverBeamHook"
    || key === "ledgerLines"
    || key === "ledgerLineAccidentals"
    || Boolean(BRAVURA_SYMBOLS[actualSymbolKey(key)] || TIME_SIGNATURES[key]);
}

function isTimeSignatureKey(key) {
  return key === "timeSignature" || Object.prototype.hasOwnProperty.call(TIME_SIGNATURES, key);
}

const ORDINARY_DYNAMIC_KEYS = ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato"];
const HAIRPIN_DYNAMIC_KEYS = ["crescendo", "diminuendo"];

function linkedSymbolKeys(key) {
  if (key === "allNotes") return ALL_NOTE_KEYS;
  if (key === "timeSignature") return Object.keys(TIME_SIGNATURES);
  if (isTimeSignatureKey(key)) return Object.keys(TIME_SIGNATURES);
  if (ORDINARY_DYNAMIC_KEYS.includes(key)) return ORDINARY_DYNAMIC_KEYS;
  if (HAIRPIN_DYNAMIC_KEYS.includes(key)) return HAIRPIN_DYNAMIC_KEYS;
  return [key];
}

function syncTimeSignatureSettings() {
  const source = config.symbols.timeSig44 || config.symbols.timeSig34 || config.symbols.timeSig24;
  if (!source) return;
  Object.keys(TIME_SIGNATURES).forEach((key) => {
    config.symbols[key] = cloneConfig(source);
  });
}

function settingsKeyForControl(key) {
  if (key === "allNotes") return "noteheadBlackStemUp";
  if (key === "timeSignature") return "timeSig44";
  return key;
}

function actualSymbolKey(key) {
  if (key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown") return "noteheadBlack";
  if (key === "augmentationDotLine" || key === "augmentationDotSpace") return "augmentationDot";
  if (key === "flatKeySignature" || key === "flatInScore") return "flat";
  if (key === "naturalInScore") return "natural";
  if (key === "sharpKeySignature" || key === "sharpInScore") return "sharp";
  return key;
}

const DEFAULT_ANCHOR = { staff: "treble", xScale: 30, step: 4 };
const PREVIEW = {
  width: 920,
  height: 640,
  staffLeft: 42,
  staffRight: 878,
  systemTops: [72, 342],
  bassStaffOffset: 86,
  gap: 10,
  barsPerSystem: 4,
  barCount: 8,
  clefX: 50,
  keySigX: 96,
  timeSigX: 124,
  musicStartX: 160,
};

const PREVIEW_RHYTHMS = {
  quaver: { beats: 0.5, spacing: 0.95 },
  semiquaver: { beats: 0.25, spacing: 0.65 },
  dottedQuaver: { beats: 0.75, spacing: 1.2, dotted: true },
  crotchet: { beats: 1, spacing: 1.65 },
  dottedCrotchet: { beats: 1.5, spacing: 2.15, dotted: true },
  minim: { beats: 2, spacing: 2.6 },
  dottedMinim: { beats: 3, spacing: 3.4, dotted: true },
  semibreve: { beats: 4, spacing: 4.4 },
};

const ONE_BEAT_RHYTHM_UNITS = [
  ["semiquaver", "semiquaver", "quaver"],
  ["quaver", "semiquaver", "semiquaver"],
  ["semiquaver", "quaver", "semiquaver"],
  ["dottedQuaver", "semiquaver"],
  ["semiquaver", "dottedQuaver"],
];

const TWO_BEAT_RHYTHM_UNITS = [
  ["dottedCrotchet", "quaver"],
  ["quaver", "dottedCrotchet"],
  ["dottedCrotchet", "semiquaver", "semiquaver"],
  ["semiquaver", "semiquaver", "dottedCrotchet"],
  ["quaver", "crotchet", "quaver"],
];

const PREVIEW_RHYTHM_PATTERNS = {
  "2/4": [
    ["crotchet", "crotchet"],
    ["minim"],
    ["quaver", "quaver", "crotchet"],
    ["crotchet", "quaver", "quaver"],
    ...TWO_BEAT_RHYTHM_UNITS,
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet"]),
    ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet"],
  ],
  "3/4": [
    ["crotchet", "crotchet", "crotchet"],
    ["minim", "crotchet"],
    ["crotchet", "minim"],
    ["dottedMinim"],
    ["quaver", "quaver", "crotchet", "crotchet"],
    ["crotchet", "quaver", "quaver", "crotchet"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet"]),
    ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet", "crotchet"],
  ],
  "4/4": [
    ["crotchet", "crotchet", "crotchet", "crotchet"],
    ["minim", "minim"],
    ["minim", "crotchet", "crotchet"],
    ["crotchet", "crotchet", "minim"],
    ["quaver", "quaver", "crotchet", "crotchet", "crotchet"],
    ["crotchet", "quaver", "quaver", "crotchet", "crotchet"],
    ["minim", "crotchet", "quaver", "quaver"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet", "crotchet"]),
    ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet", "crotchet", "crotchet"],
  ],
  "5/4": [
    ["semibreve", "crotchet"],
    ["minim", "minim", "crotchet"],
    ["crotchet", "crotchet", "crotchet", "crotchet", "crotchet"],
    ["minim", "crotchet", "quaver", "quaver", "crotchet"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet", "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet", "crotchet", "crotchet"]),
    ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "crotchet", "crotchet", "crotchet", "crotchet"],
  ],
  "6/8": [
    ["quaver", "quaver", "quaver", "quaver", "quaver", "quaver"],
    ["crotchet", "quaver", "crotchet", "quaver"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "quaver", "quaver"]),
    ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "quaver", "quaver", "crotchet"],
    ["dottedMinim"],
  ],
  "9/8": [
    ["dottedMinim", "crotchet", "quaver"],
    ["crotchet", "quaver", "crotchet", "quaver", "crotchet", "quaver"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "quaver", "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "quaver", "dottedCrotchet", "quaver"]),
    ["quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver"],
  ],
  "12/8": [
    ["dottedMinim", "dottedMinim"],
    ["crotchet", "quaver", "crotchet", "quaver", "crotchet", "quaver", "crotchet", "quaver"],
    ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "quaver", "crotchet", "quaver", "crotchet"]),
    ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "quaver", "crotchet", "quaver", "crotchet", "quaver", "quaver"]),
    ["semibreve", "crotchet", "quaver", "quaver"],
  ],
};

const PREVIEW_TIME_SIGNATURES = [
  { id: "2/4", symbolKey: "timeSig24", beats: 2 },
  { id: "3/4", symbolKey: "timeSig34", beats: 3 },
  { id: "4/4", symbolKey: "timeSig44", beats: 4 },
  { id: "5/4", symbolKey: "timeSig54", beats: 5 },
  { id: "6/8", symbolKey: "timeSig68", beats: 3 },
  { id: "9/8", symbolKey: "timeSig98", beats: 4.5 },
  { id: "12/8", symbolKey: "timeSig128", beats: 6 },
];

const PREVIEW_KEYS = [
  { id: "C", name: "C major", tonic: "C", keyAccidentals: {}, chords: {
    I: { name: "C major", shortName: "C", notes: ["C", "E", "G"] },
    IV: { name: "F major", shortName: "F", notes: ["F", "A", "C"] },
    V: { name: "G major", shortName: "G", notes: ["G", "B", "D"] },
    VI: { name: "A minor", shortName: "Am", notes: ["A", "C", "E"] },
  } },
  { id: "F", name: "F major", tonic: "F", keyAccidentals: { B: -1 }, chords: {
    I: { name: "F major", shortName: "F", notes: ["F", "A", "C"] },
    IV: { name: "B flat major", shortName: "B♭", notes: ["B", "D", "F"] },
    V: { name: "C major", shortName: "C", notes: ["C", "E", "G"] },
    VI: { name: "D minor", shortName: "Dm", notes: ["D", "F", "A"] },
  } },
  { id: "G", name: "G major", tonic: "G", keyAccidentals: { F: 1 }, chords: {
    I: { name: "G major", shortName: "G", notes: ["G", "B", "D"] },
    IV: { name: "C major", shortName: "C", notes: ["C", "E", "G"] },
    V: { name: "D major", shortName: "D", notes: ["D", "F", "A"] },
    VI: { name: "E minor", shortName: "Em", notes: ["E", "G", "B"] },
  } },
  { id: "Bb", name: "B flat major", tonic: "B", keyAccidentals: { B: -1, E: -1 }, chords: {
    I: { name: "B flat major", shortName: "B♭", notes: ["B", "D", "F"] },
    IV: { name: "E flat major", shortName: "E♭", notes: ["E", "G", "B"] },
    V: { name: "F major", shortName: "F", notes: ["F", "A", "C"] },
    VI: { name: "G minor", shortName: "Gm", notes: ["G", "B", "D"] },
  } },
  { id: "D", name: "D major", tonic: "D", keyAccidentals: { F: 1, C: 1 }, chords: {
    I: { name: "D major", shortName: "D", notes: ["D", "F", "A"] },
    IV: { name: "G major", shortName: "G", notes: ["G", "B", "D"] },
    V: { name: "A major", shortName: "A", notes: ["A", "C", "E"] },
    VI: { name: "B minor", shortName: "Bm", notes: ["B", "D", "F"] },
  } },
  { id: "Em", name: "E minor", tonic: "E", keyAccidentals: { F: 1 }, chords: {
    I: { name: "E minor", shortName: "Em", notes: ["E", "G", "B"] },
    IV: { name: "A minor", shortName: "Am", notes: ["A", "C", "E"] },
    V: { name: "B major", shortName: "B", notes: ["B", "D", "F"], raised: { D: 1 } },
    VI: { name: "C major", shortName: "C", notes: ["C", "E", "G"] },
  } },
  { id: "Dm", name: "D minor", tonic: "D", keyAccidentals: { B: -1 }, chords: {
    I: { name: "D minor", shortName: "Dm", notes: ["D", "F", "A"] },
    IV: { name: "G minor", shortName: "Gm", notes: ["G", "B", "D"] },
    V: { name: "A major", shortName: "A", notes: ["A", "C", "E"], raised: { C: 1 } },
    VI: { name: "B flat major", shortName: "B♭", notes: ["B", "D", "F"] },
  } },
  { id: "Am", name: "A minor", tonic: "A", keyAccidentals: {}, chords: {
    I: { name: "A minor", shortName: "Am", notes: ["A", "C", "E"] },
    IV: { name: "D minor", shortName: "Dm", notes: ["D", "F", "A"] },
    V: { name: "E major", shortName: "E", notes: ["E", "G", "B"], raised: { G: 1 } },
    VI: { name: "F major", shortName: "F", notes: ["F", "A", "C"] },
  } },
];

const PREVIEW_NOTE_POOL = [
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

const KEY_SIG_ORDER = {
  sharp: ["F", "C", "G", "D", "A", "E", "B"],
  flat: ["B", "E", "A", "D", "G", "C", "F"],
};

const TREBLE_KEY_SIG_STEPS = {
  sharp: { F: 8, C: 5, G: 9, D: 6, A: 10, E: 7, B: 11 },
  flat: { B: 4, E: 7, A: 3, D: 6, G: 2, C: 5, F: 1 },
};

const BASS_KEY_SIG_STEPS = {
  sharp: { F: 6, C: 3, G: 7, D: 4, A: 8, E: 5, B: 9 },
  flat: { B: 2, E: 5, A: 1, D: 4, G: 0, C: 3, F: -1 },
};

const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

function previewStepForBass(letter, octave) {
  const pitchIndex = octave * 7 + NOTE_LETTERS.indexOf(letter);
  const bassBaseIndex = 2 * 7 + NOTE_LETTERS.indexOf("G");
  return pitchIndex - bassBaseIndex;
}

function previewBassRootForChord(chord, rhythm = "semibreve") {
  const letter = chord.notes[0];
  const octave = ["C", "D", "E"].includes(letter) ? 3 : 2;
  return {
    letter,
    octave,
    step: previewStepForBass(letter, octave),
    rhythm,
    accidental: chord.raised?.[letter] ?? null,
  };
}

function previewBassPatternForTimeSignature(timeSignature) {
  return {
    "2/4": ["minim"],
    "3/4": ["dottedMinim"],
    "4/4": ["semibreve"],
    "5/4": ["semibreve", "crotchet"],
    "6/8": ["dottedMinim"],
    "9/8": ["dottedMinim", "crotchet", "quaver"],
    "12/8": ["dottedMinim", "dottedMinim"],
  }[timeSignature.id] || ["semibreve"];
}

function makePreviewBassNotesForBar(chord, timeSignature) {
  return previewBassPatternForTimeSignature(timeSignature).map((rhythm) => previewBassRootForChord(chord, rhythm));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rhythmInfo(id) {
  return PREVIEW_RHYTHMS[id] || PREVIEW_RHYTHMS.crotchet;
}

function previewRestKeyForRhythm(rhythmId) {
  if (rhythmId === "semibreve") return "wholeRest";
  if (rhythmId === "minim" || rhythmId === "dottedMinim") return "halfRest";
  if (rhythmId === "crotchet" || rhythmId === "dottedCrotchet") return "quarterRest";
  if (rhythmId === "quaver" || rhythmId === "dottedQuaver") return "eighthRest";
  if (rhythmId === "semiquaver") return "sixteenthRest";
  return null;
}

function canGenerateRest(rhythmId) {
  const restKey = previewRestKeyForRhythm(rhythmId);
  return restKey && generatedEnabled(restKey);
}

function patternBeats(pattern) {
  return pattern.reduce((sum, id) => sum + rhythmInfo(id).beats, 0);
}

function validPreviewPatterns(timeSignature) {
  const patterns = PREVIEW_RHYTHM_PATTERNS[timeSignature.id] || PREVIEW_RHYTHM_PATTERNS["4/4"];
  return patterns.filter((pattern) => patternBeats(pattern) === timeSignature.beats);
}

function fillPatternToTimeSignature(unit, timeSignature) {
  const pattern = [...unit];
  let remaining = timeSignature.beats - patternBeats(pattern);
  while (remaining >= 1) {
    pattern.push("crotchet");
    remaining -= 1;
  }
  if (remaining === 0.5) pattern.push("quaver");
  return patternBeats(pattern) === timeSignature.beats ? pattern : null;
}

function forcedPatternForSymbol(symbolKey, timeSignature) {
  const candidatesBySymbol = {
    wholeNote: [["semibreve"]],
    halfNoteStemUp: [["minim"]],
    halfNoteStemDown: [["minim"]],
    quarterNoteStemUp: [["crotchet"]],
    quarterNoteStemDown: [["crotchet"]],
    eighthNoteStemUp: [["quaver", "quaver"]],
    eighthNoteStemDown: [["quaver", "quaver"]],
    sixteenthNoteStemUp: [["semiquaver", "semiquaver", "quaver"]],
    sixteenthNoteStemDown: [["quaver", "semiquaver", "semiquaver"]],
    quaverBeam: [["quaver", "quaver"]],
    semiquaverBeam: [["semiquaver", "semiquaver", "quaver"]],
    semiquaverSecondBeam: [["semiquaver", "semiquaver", "quaver"]],
    semiquaverBeamHook: [["dottedQuaver", "semiquaver"], ["semiquaver", "dottedQuaver"], ["quaver", "semiquaver", "semiquaver"]],
    augmentationDotLine: [["dottedCrotchet", "quaver"], ["dottedQuaver", "semiquaver"]],
    augmentationDotSpace: [["dottedCrotchet", "quaver"], ["dottedQuaver", "semiquaver"]],
    wholeRest: [["semibreve"]],
    halfRest: [["minim"]],
    quarterRest: [["crotchet"]],
    eighthRest: [["quaver", "quaver"]],
    sixteenthRest: [["semiquaver", "semiquaver", "quaver"]],
    flatInScore: [["crotchet"]],
    naturalInScore: [["crotchet"]],
    sharpInScore: [["crotchet"]],
    ledgerLines: [["crotchet"]],
    ledgerLineAccidentals: [["crotchet"]],
  };
  const candidates = candidatesBySymbol[symbolKey] || [];
  for (const unit of candidates) {
    const pattern = fillPatternToTimeSignature(unit, timeSignature);
    if (pattern) return pattern;
  }
  return null;
}

function keyForGeneratedSymbol(symbolKey) {
  if (symbolKey === "flatKeySignature") return randomItem(PREVIEW_KEYS.filter((key) => Object.values(key.keyAccidentals).some((value) => value < 0)));
  if (symbolKey === "sharpKeySignature" || symbolKey === "ledgerLineAccidentals") return randomItem(PREVIEW_KEYS.filter((key) => Object.values(key.keyAccidentals).some((value) => value > 0)));
  if (symbolKey === "flatInScore") return randomItem(PREVIEW_KEYS.filter((key) => Object.values(key.keyAccidentals).some((value) => value < 0)));
  if (symbolKey === "sharpInScore") return randomItem(PREVIEW_KEYS.filter((key) => Object.values(key.keyAccidentals).some((value) => value > 0)));
  return null;
}

function previewNoteByLetter(letter, preferredIndex = 6) {
  const candidates = PREVIEW_NOTE_POOL
    .map((note, index) => ({ ...note, index }))
    .filter((note) => note.letter === letter);
  return candidates.reduce((best, item) => (
    Math.abs(item.index - preferredIndex) < Math.abs(best.index - preferredIndex) ? item : best
  ), candidates[0]);
}

function previewNoteByStepParity(evenStep, preferredIndex = 6) {
  const candidates = PREVIEW_NOTE_POOL
    .map((note, index) => ({ ...note, index }))
    .filter((note) => Math.abs(note.step % 2) === (evenStep ? 0 : 1));
  return candidates.reduce((best, item) => (
    Math.abs(item.index - preferredIndex) < Math.abs(best.index - preferredIndex) ? item : best
  ), candidates[0]);
}

function previewLedgerLineNote() {
  return randomItem(PREVIEW_NOTE_POOL.filter((note) => note.step <= -2 || note.step >= 10));
}

function previewNotePoolIndex(note) {
  return PREVIEW_NOTE_POOL.findIndex((item) => item.letter === note.letter && item.octave === note.octave);
}

function previewChordAccidentalForLetter(chord, letter) {
  return chord.raised?.[letter] ?? null;
}

function previewWrittenAccidentalForMelody(key, chord, letter) {
  if (key.id === "Am" && letter === "G") return 1;
  const accidental = previewChordAccidentalForLetter(chord, letter);
  return accidental !== null ? accidental : null;
}

function makePreviewChordProgression() {
  const middleOptions = ["IV", "V", "VI"];
  const progression = ["I"];
  for (let index = 1; index < PREVIEW.barCount - 1; index += 1) {
    const available = middleOptions.filter((symbol) => symbol !== progression[index - 1]);
    progression.push(randomItem(available));
  }
  const finalOptions = ["I", "V"].filter((symbol) => symbol !== progression[progression.length - 1]);
  progression.push(randomItem(finalOptions));
  return progression;
}

function choosePreviewMelodyNote({ key, chord, rhythmId, previousNote, previousIndex, strongBeat, phraseDirection, phraseAnchorIndex }) {
  const candidates = [];
  PREVIEW_NOTE_POOL.forEach((candidate, candidateIndex) => {
    const isChordTone = chord.notes.includes(candidate.letter);
    const distance = candidateIndex - previousIndex;
    const absoluteDistance = Math.abs(distance);
    const phraseRange = Math.abs(candidateIndex - phraseAnchorIndex);

    if (phraseRange > 8 || absoluteDistance > 4) return;
    if (strongBeat && !isChordTone) return;
    if (rhythmId === "quaver" && absoluteDistance !== 1) return;
    if (rhythmId === "quaver" && previousNote && candidate.letter === previousNote.letter) return;
    if (!strongBeat && !isChordTone && absoluteDistance !== 1) return;

    let weight = 1;
    if (strongBeat) weight *= 9;
    if (isChordTone) weight *= 4;
    if (absoluteDistance === 0) weight *= 1.2;
    if (absoluteDistance === 1) weight *= 7;
    if (absoluteDistance === 2) weight *= 3;
    if (absoluteDistance >= 3) weight *= 0.6;
    if (phraseDirection > 0 && distance > 0) weight *= 1.4;
    if (phraseDirection < 0 && distance < 0) weight *= 1.4;
    if (candidateIndex < 1 || candidateIndex > PREVIEW_NOTE_POOL.length - 2) weight *= 0.4;
    candidates.push({ candidate, weight });
  });

  if (!candidates.length) return previewNoteByLetter(randomItem(chord.notes), previousIndex);
  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of candidates) {
    roll -= item.weight;
    if (roll <= 0) return item.candidate;
  }
  return candidates[candidates.length - 1].candidate;
}

function makePreviewMelodyForBar(key, chordSymbol, barIndex, previousIndex, timeSignature, options = {}) {
  const chord = key.chords[chordSymbol];
  const finalPatterns = {
    "2/4": [["minim"]],
    "3/4": [["dottedMinim"]],
    "4/4": [["semibreve"]],
    "5/4": [["semibreve", "crotchet"]],
    "6/8": [["dottedMinim"]],
    "9/8": [["dottedMinim", "crotchet", "quaver"]],
    "12/8": [["dottedMinim", "dottedMinim"]],
  };
  const patternChoices = barIndex === PREVIEW.barCount - 1
    ? finalPatterns[timeSignature.id] || validPreviewPatterns(timeSignature)
    : validPreviewPatterns(timeSignature);
  const forcedPattern = barIndex === 0 ? options.forcedPattern : null;
  const pattern = forcedPattern || randomItem(patternChoices);
  const accidentalMemory = {};
  let beatPosition = 0;
  let currentIndex = clamp(previousIndex, 0, PREVIEW_NOTE_POOL.length - 1);
  let previousNote = PREVIEW_NOTE_POOL[currentIndex] || previewNoteByLetter(key.tonic, 6);
  const phraseAnchorIndex = currentIndex;
  const phraseDirection = barIndex < 4 ? 1 : -1;

  const notes = pattern.map((rhythmId, noteIndex) => {
    const beats = rhythmInfo(rhythmId).beats;
    const strongBeat = beatPosition === 0 || beatPosition === 2 || beatPosition === 3;
    const restKey = previewRestKeyForRhythm(rhythmId);
    const forceRest = options.forceRestKey
      && barIndex === 0
      && previewRestKeyForRhythm(rhythmId) === options.forceRestKey
      && !options.usedForcedRest;
    const mayUseRest = (forceRest || canGenerateRest(rhythmId))
      && (barIndex > 0 || forceRest)
      && !(barIndex === PREVIEW.barCount - 1 && noteIndex === pattern.length - 1)
      && (forceRest || Math.random() < 0.2);

    if (mayUseRest) {
      if (forceRest) options.usedForcedRest = true;
      const note = {
        id: `${barIndex}-${noteIndex}`,
        barIndex,
        noteIndex,
        rhythm: rhythmId,
        beats,
        beatPosition,
        restKey,
        step: 4,
      };
      beatPosition += beats;
      return note;
    }

    let base = choosePreviewMelodyNote({
      key,
      chord,
      rhythmId,
      previousNote,
      previousIndex: currentIndex,
      strongBeat,
      phraseDirection,
      phraseAnchorIndex,
    });

    if (barIndex === 0 && noteIndex === 0) base = previewNoteByLetter(key.tonic, 6);
    if (barIndex === 0 && noteIndex === 0 && options.forceLedgerLineNote) {
      base = previewLedgerLineNote();
      options.forceLedgerLineNote = false;
    }
    if (barIndex === 0 && rhythmInfo(rhythmId).dotted && options.forceDotKey) {
      base = previewNoteByStepParity(options.forceDotKey === "augmentationDotLine", currentIndex);
      options.forceDotKey = "";
    }
    if (barIndex === PREVIEW.barCount - 1 && noteIndex === pattern.length - 1) {
      base = previewNoteByLetter(key.chords.I.notes[0], currentIndex);
    }

    currentIndex = previewNotePoolIndex(base) >= 0 ? previewNotePoolIndex(base) : currentIndex;
    const accidentalValue = previewWrittenAccidentalForMelody(key, chord, base.letter);
    const shouldShowAccidental = accidentalValue !== null && accidentalMemory[base.letter] !== accidentalValue;
    if (accidentalValue !== null) accidentalMemory[base.letter] = accidentalValue;
    const forcedScoreAccidentalValue = options.forceScoreAccidental === "sharpInScore"
      ? 1
      : options.forceScoreAccidental === "flatInScore"
        ? -1
        : options.forceScoreAccidental === "naturalInScore"
          ? 0
          : null;

    const note = {
      id: `${barIndex}-${noteIndex}`,
      barIndex,
      noteIndex,
      rhythm: rhythmId,
      beats,
      beatPosition,
      letter: base.letter,
      octave: base.octave,
      step: base.step,
      midi: base.midi,
      accidental: options.forceLedgerLineAccidental && barIndex === 0 && noteIndex === 0 ? 1 : forcedScoreAccidentalValue !== null && barIndex === 0 && noteIndex === 0 ? forcedScoreAccidentalValue : shouldShowAccidental ? accidentalValue : null,
    };

    if (options.forceLedgerLineAccidental && barIndex === 0 && noteIndex === 0) {
      options.forceLedgerLineAccidental = false;
    }
    if (options.forceScoreAccidental && barIndex === 0 && noteIndex === 0) {
      options.forceScoreAccidental = "";
    }

    previousNote = base;
    beatPosition += beats;
    return note;
  });

  return { notes, lastIndex: currentIndex };
}

function makeHigherPreviewQuestion(requiredSymbolKey = "") {
  const timeSignatureChoices = requiredSymbolKey
    ? PREVIEW_TIME_SIGNATURES.filter((item) => forcedPatternForSymbol(requiredSymbolKey, item))
    : PREVIEW_TIME_SIGNATURES;
  const timeSignature = randomItem(timeSignatureChoices.length ? timeSignatureChoices : PREVIEW_TIME_SIGNATURES);
  const key = keyForGeneratedSymbol(requiredSymbolKey) || randomItem(PREVIEW_KEYS);
  const forcedPattern = forcedPatternForSymbol(requiredSymbolKey, timeSignature);
  const melodyOptions = {
    forcedPattern,
    forceRestKey: requiredSymbolKey.endsWith("Rest") ? requiredSymbolKey : "",
    forceDotKey: requiredSymbolKey === "augmentationDotLine" || requiredSymbolKey === "augmentationDotSpace" ? requiredSymbolKey : "",
    forceLedgerLineNote: requiredSymbolKey === "ledgerLines" || requiredSymbolKey === "ledgerLineAccidentals",
    forceLedgerLineAccidental: requiredSymbolKey === "ledgerLineAccidentals",
    forceScoreAccidental: ["flatInScore", "naturalInScore", "sharpInScore"].includes(requiredSymbolKey) ? requiredSymbolKey : "",
  };
  const progression = makePreviewChordProgression();
  let previousIndex = previewNotePoolIndex(previewNoteByLetter(key.tonic, 6));
  const bars = progression.map((symbol, barIndex) => {
    const melody = makePreviewMelodyForBar(key, symbol, barIndex, previousIndex, timeSignature, melodyOptions);
    previousIndex = melody.lastIndex;
    return {
      barIndex,
      chordSymbol: symbol,
      chord: key.chords[symbol],
      notes: melody.notes,
      bassNotes: makePreviewBassNotesForBar(key.chords[symbol], timeSignature),
    };
  });
  return {
    id: Math.random().toString(36).slice(2),
    key,
    timeSignature,
    timeSignatureKey: timeSignature.symbolKey,
    targetBars: [5, 6],
    bars,
  };
}

let previewQuestion = makeHigherPreviewQuestion();

const SYMBOL_ANCHORS = {
  brace: { staff: "system", xScale: -2.5, step: 4 },
  barlineSingle: { staff: "system", xScale: 6, step: 4 },
  barlineFinal: { staff: "system", xScale: 70, step: 4 },
  repeatLeft: { staff: "system", xScale: 12, step: 4 },
  repeatRight: { staff: "system", xScale: 62, step: 4 },
  gClef: { staff: "treble", xScale: 3.2, step: 2 },
  fClef: { staff: "bass", xScale: 3.2, step: 6 },
  timeSig24: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig34: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig44: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig54: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig68: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig98: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig128: { staff: "treble", xScale: 12, step: 5.3 },
  wholeNote: { staff: "treble", xScale: 26, step: 4, ledger: [] },
  halfNoteStemUp: { staff: "treble", xScale: 22, step: 2 },
  halfNoteStemDown: { staff: "treble", xScale: 30, step: 7 },
  quarterNoteStemUp: { staff: "treble", xScale: 18, step: 0 },
  quarterNoteStemDown: { staff: "treble", xScale: 34, step: 8, ledger: [10] },
  eighthNoteStemUp: { staff: "treble", xScale: 40, step: 1, beam: "up" },
  eighthNoteStemDown: { staff: "treble", xScale: 48, step: 6, beam: "down" },
  sixteenthNoteStemUp: { staff: "bass", xScale: 40, step: -2, ledger: [-2] },
  sixteenthNoteStemDown: { staff: "bass", xScale: 48, step: 7 },
  augmentationDotLine: { staff: "treble", xScale: 35.8, step: 8 },
  augmentationDotSpace: { staff: "treble", xScale: 35.8, step: 7 },
  tie: { staff: "treble", xScale: 54, step: -1 },
  flat: { staff: "treble", xScale: 17, step: 0 },
  natural: { staff: "treble", xScale: 25, step: 4 },
  sharp: { staff: "treble", xScale: 33, step: 8 },
  accentAbove: { staff: "treble", xScale: 46, step: 9.8 },
  accentBelow: { staff: "treble", xScale: 46, step: -2.2 },
  staccatoAbove: { staff: "treble", xScale: 52, step: 9.8 },
  staccatoBelow: { staff: "treble", xScale: 52, step: -2.2 },
  wholeRest: { staff: "treble", xScale: 18, step: 5 },
  halfRest: { staff: "treble", xScale: 26, step: 5 },
  quarterRest: { staff: "treble", xScale: 34, step: 4 },
  eighthRest: { staff: "bass", xScale: 22, step: 4 },
  sixteenthRest: { staff: "bass", xScale: 30, step: 4 },
  piano: { staff: "treble", xScale: 20, step: -5.4 },
  forte: { staff: "treble", xScale: 27, step: -5.4 },
  pianissimo: { staff: "treble", xScale: 34, step: -5.4 },
  mezzoPiano: { staff: "treble", xScale: 42, step: -5.4 },
  mezzoForte: { staff: "treble", xScale: 50, step: -5.4 },
  fortissimo: { staff: "treble", xScale: 58, step: -5.4 },
  sforzato: { staff: "treble", xScale: 66, step: -5.4 },
  crescendo: { staff: "bass", xScale: 28, step: -5.2 },
  diminuendo: { staff: "bass", xScale: 46, step: -5.2 },
};

function makeElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}

function append(parent, child) {
  parent.appendChild(child);
  return child;
}

function px(ctx, scale) {
  return scale * ctx.lineGap;
}

function yForStep(ctx, top, step) {
  return top + ctx.lineGap * 4 - step * (ctx.lineGap / 2);
}

function symbolConfig(key) {
  if (!config.symbols[key]) {
    if ((key === "augmentationDotLine" || key === "augmentationDotSpace") && config.symbols.augmentationDot) {
      config.symbols[key] = cloneConfig(config.symbols.augmentationDot);
      return config.symbols[key];
    }
    if ((key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown") && config.symbols.noteheadBlack) {
      config.symbols[key] = cloneConfig(config.symbols.noteheadBlack);
      return config.symbols[key];
    }
    const fontSizeScale = key === "quaverBeam" || key === "semiquaverBeam" || key === "semiquaverSecondBeam" || key === "semiquaverBeamHook" ? 1 : key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown" ? 3.4 : 2;
    config.symbols[key] = { fontSizeScale, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 };
  }
  return config.symbols[key];
}

function isSelected(key) {
  return key === selectedSymbolKey;
}

function visibleSymbolKeys() {
  return selectedSymbolKey ? [selectedSymbolKey] : [];
}

function drawPlainLabel(parent, text, x, y, className = "section-label") {
  append(parent, makeElement("text", { x, y, class: className }, text));
}

function drawStave(parent, ctx, x, top, width) {
  for (let line = 0; line < 5; line += 1) {
    append(parent, makeElement("line", {
      class: "stave-line",
      x1: x,
      x2: x + width,
      y1: top + line * ctx.lineGap,
      y2: top + line * ctx.lineGap,
      "stroke-width": Math.max(1, ctx.lineGap * 0.1),
    }));
  }

  if (!ctx.showGuides) return;

  for (let step = -4; step <= 12; step += 1) {
    const y = yForStep(ctx, top, step);
    append(parent, makeElement("line", {
      class: "guide-line",
      x1: x,
      x2: x + width,
      y1: y,
      y2: y,
    }));
    drawPlainLabel(parent, String(step), x - 24, y + 3, "guide-label");
  }
}

function drawFixedReferenceBarlines(parent, ctx, x, trebleTop, bassTop, width) {
  const top = trebleTop;
  const bottom = bassTop + ctx.lineGap * 4;
  [x, x + width].forEach((barX) => {
    append(parent, makeElement("line", {
      class: "barline fixed-reference",
      x1: barX,
      x2: barX,
      y1: top,
      y2: bottom,
      "stroke-width": Math.max(1, ctx.lineGap * 0.1),
    }));
  });
}

function drawLedgerLine(parent, ctx, x, y) {
  append(parent, makeElement("line", {
    class: "ledger-line",
    x1: x - px(ctx, config.drawing.ledgerLineWidthScale) / 2,
    x2: x + px(ctx, config.drawing.ledgerLineWidthScale) / 2,
    y1: y,
    y2: y,
    "stroke-width": Math.max(1, px(ctx, config.drawing.ledgerLineThicknessScale)),
  }));
}

function anchorPoint(ctx, anchor, layout) {
  const staffTop = anchor.staff === "bass" ? layout.bassTop : layout.trebleTop;
  if (anchor.staff === "system") {
    return {
      x: layout.x + px(ctx, anchor.xScale),
      y: (layout.trebleTop + layout.bassTop + ctx.lineGap * 4) / 2,
    };
  }
  return {
    x: layout.x + px(ctx, anchor.xScale),
    y: yForStep(ctx, staffTop, anchor.step),
  };
}

function drawSymbol(parent, ctx, key, x, y, interactive) {
  const symbol = BRAVURA_SYMBOLS[actualSymbolKey(key)];
  const timeSignature = TIME_SIGNATURES[key];
  if (!symbol && !timeSignature) return null;

  const settings = symbolConfig(key);
  const adjustedX = x + px(ctx, settings.xOffsetScale) + Number(settings.opticalXOffset || 0);
  const adjustedY = y + px(ctx, settings.yOffsetScale) + Number(settings.opticalYOffset || 0);
  const fontSize = px(ctx, settings.fontSizeScale);
  const group = append(parent, makeElement("g", {
    class: `calibration-symbol ${isSelected(key) ? "selected" : ""}`,
    "data-symbol-key": key,
    "data-line-gap": ctx.lineGap,
  }));

  if (timeSignature) {
    const scaledGroup = append(group, makeElement("g", {
      transform: `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`,
    }));
    const topText = timeSignature.top.map((numberKey) => BRAVURA_SYMBOLS[numberKey]).join("");
    const bottomText = timeSignature.bottom.map((numberKey) => BRAVURA_SYMBOLS[numberKey]).join("");

    append(scaledGroup, makeElement("text", {
      class: "music-symbol",
      x: adjustedX,
      y: adjustedY - fontSize * 0.14,
      "font-size": fontSize,
      "text-anchor": "middle",
    }, topText));
    append(scaledGroup, makeElement("text", {
      class: "music-symbol",
      x: adjustedX,
      y: adjustedY + fontSize * 0.43,
      "font-size": fontSize,
      "text-anchor": "middle",
    }, bottomText));
  } else {
    append(group, makeElement("text", {
      class: "music-symbol",
      x: adjustedX,
      y: adjustedY,
      "font-size": fontSize,
      "text-anchor": "middle",
      transform: `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`,
    }, symbol));
  }

  return group;
}

function drawSupportMarks(parent, ctx, key, anchor, point, layout) {
  const staffTop = anchor.staff === "bass" ? layout.bassTop : layout.trebleTop;
  (anchor.ledger || []).forEach((step) => drawLedgerLine(parent, ctx, point.x, yForStep(ctx, staffTop, step)));
  if (anchor.beam === "up") {
    append(parent, makeElement("line", { class: "beam fixed-reference", x1: point.x - px(ctx, 0.2), x2: point.x + px(ctx, 4), y1: point.y - px(ctx, 3.2), y2: point.y - px(ctx, 3.2), "stroke-width": px(ctx, config.drawing.beamThicknessScale) }));
  }
  if (anchor.beam === "down") {
    append(parent, makeElement("line", { class: "beam fixed-reference", x1: point.x - px(ctx, 0.2), x2: point.x + px(ctx, 4), y1: point.y + px(ctx, 3.2), y2: point.y + px(ctx, 3.2), "stroke-width": px(ctx, config.drawing.beamThicknessScale) }));
  }
  if (key === "augmentationDotLine") {
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x - px(ctx, 1.55), yForStep(ctx, layout.trebleTop, 8), false);
  }
  if (key === "augmentationDotSpace") {
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x - px(ctx, 1.55), yForStep(ctx, layout.trebleTop, 7), false);
  }
  if (["accentAbove", "staccatoAbove"].includes(key)) {
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x, yForStep(ctx, layout.trebleTop, 3), false);
  }
  if (["accentBelow", "staccatoBelow"].includes(key)) {
    drawSymbol(parent, ctx, "quarterNoteStemUp", point.x, yForStep(ctx, layout.trebleTop, 3), false);
  }
  if (key === "tie") {
    drawSymbol(parent, ctx, "quarterNoteStemUp", point.x - px(ctx, 2), yForStep(ctx, layout.trebleTop, 0), false);
    drawSymbol(parent, ctx, "quarterNoteStemUp", point.x + px(ctx, 2), yForStep(ctx, layout.trebleTop, 0), false);
  }
}

function renderSingleBarGrandStaff(parent, options) {
  const ctx = {
    lineGap: options.lineGap,
    showGuides: options.showGuides,
    interactive: Boolean(options.interactive),
  };
  const x = options.x;
  const y = options.y;
  const width = options.width;
  const trebleTop = y + px(ctx, 4);
  const bassTop = trebleTop + px(ctx, Number(config.stave.grandStaffGapScale || 8.4));
  const layout = { x, trebleTop, bassTop, width };
  const bottom = bassTop + px(ctx, 4);
  const group = append(parent, makeElement("g", { class: options.className || "" }));

  if (options.label) drawPlainLabel(group, options.label, x, y, "section-label");
  drawStave(group, ctx, x, trebleTop, width);
  drawStave(group, ctx, x, bassTop, width);
  drawFixedReferenceBarlines(group, ctx, x, trebleTop, bassTop, width);

  visibleSymbolKeys().forEach((key) => {
    const baseAnchor = SYMBOL_ANCHORS[key] || DEFAULT_ANCHOR;
    const anchor = baseAnchor;
    const point = anchorPoint(ctx, anchor, layout);
    drawSupportMarks(group, ctx, key, anchor, point, layout);
    drawSymbol(group, ctx, key, point.x, point.y, ctx.interactive);
  });

  return { height: bottom + px(ctx, 7) - y };
}

function renderStage() {
  renderHigherPreview(stage);
}

function previewYForStep(step, top) {
  return top + PREVIEW.gap * 4 - step * (PREVIEW.gap / 2);
}

function previewFirstSystemBarWidth() {
  return (PREVIEW.staffRight - PREVIEW.musicStartX) / PREVIEW.barsPerSystem;
}

function previewSecondSystemStartX() {
  return PREVIEW.timeSigX - 18;
}

function previewSecondSystemBarWidth() {
  return (PREVIEW.staffRight - previewSecondSystemStartX()) / PREVIEW.barsPerSystem;
}

function previewBarWidth(barIndex) {
  return barIndex >= 4 ? previewSecondSystemBarWidth() : previewFirstSystemBarWidth();
}

function previewBarStart(barIndex) {
  const localIndex = barIndex % PREVIEW.barsPerSystem;
  const systemStart = barIndex >= 4 ? previewSecondSystemStartX() : PREVIEW.musicStartX;
  return systemStart + localIndex * previewBarWidth(barIndex);
}

function previewSystemTop(barIndex) {
  return barIndex < 4 ? PREVIEW.systemTops[0] : PREVIEW.systemTops[1];
}

function previewBassTop(trebleTop) {
  return trebleTop + PREVIEW.bassStaffOffset;
}

function previewRhythmSpacing(rhythm) {
  return rhythmInfo(rhythm).spacing;
}

function previewBarNotePositions(barIndex, notes) {
  const start = previewBarStart(barIndex);
  const end = start + previewBarWidth(barIndex);
  const startX = start + (barIndex === 0 ? 4 : barIndex < 4 ? 15 : 19);
  const endX = barIndex === PREVIEW.barCount - 1 ? end - 24 : end - 4;
  const units = notes.reduce((sum, note) => sum + previewRhythmSpacing(note.rhythm), 0);
  const unit = Math.max(1, endX - startX) / Math.max(1, units);
  let cursor = startX + unit * 0.38;
  return notes.map((note) => {
    const x = cursor;
    cursor += previewRhythmSpacing(note.rhythm) * unit;
    return x;
  });
}

function shouldShowLedgerLines() {
  return generatedEnabled("ledgerLines")
    || generatedEnabled("ledgerLineAccidentals")
    || selectedSymbolKey === "ledgerLines"
    || selectedSymbolKey === "ledgerLineAccidentals";
}

function previewStemDown(step) {
  return step > 4;
}

function previewRenderSymbol(parent, key, x, y, lineGap = PREVIEW.gap) {
  drawSymbol(parent, { lineGap, interactive: false }, key, x, y, false);
}

function previewAnchorX(key) {
  const anchor = SYMBOL_ANCHORS[key] || DEFAULT_ANCHOR;
  return PREVIEW.staffLeft + anchor.xScale * PREVIEW.gap;
}

function previewAnchorY(key, top) {
  const anchor = SYMBOL_ANCHORS[key] || DEFAULT_ANCHOR;
  return previewYForStep(anchor.step, top);
}

function drawPreviewStave(parent, top, endX) {
  for (let line = 0; line < 5; line += 1) {
    append(parent, makeElement("line", {
      class: "stave-line",
      x1: PREVIEW.staffLeft,
      x2: endX,
      y1: top + line * PREVIEW.gap,
      y2: top + line * PREVIEW.gap,
      "stroke-width": 1.2,
    }));
  }

  if (!config.stave.showGuides) return;

  for (let step = -2; step <= 10; step += 1) {
    const y = previewYForStep(step, top);
    append(parent, makeElement("line", {
      class: "guide-line",
      x1: PREVIEW.staffLeft,
      x2: endX,
      y1: y,
      y2: y,
    }));
    append(parent, makeElement("text", {
      class: "guide-label",
      x: PREVIEW.staffLeft - 18,
      y: y + 3,
      "text-anchor": "middle",
    }, String(step)));
  }
}

function drawPreviewSystemBarline(parent, x, trebleTop, bassTop, final = false) {
  const top = trebleTop;
  const bottom = bassTop + PREVIEW.gap * 4;
  if (final) {
    previewRenderSymbol(parent, "barlineFinal", x, previewYForStep(4, trebleTop), PREVIEW.gap);
    previewRenderSymbol(parent, "barlineFinal", x, previewYForStep(4, bassTop), PREVIEW.gap);
    return;
  }
  append(parent, makeElement("line", { class: "barline", x1: x, x2: x, y1: top, y2: bottom, "stroke-width": 1.4 }));
}

function drawPreviewLedgerLines(parent, x, step, top, forceShow = false) {
  if (!forceShow && !shouldShowLedgerLines()) return;
  const settings = symbolConfig("ledgerLines");
  const xOffset = PREVIEW.gap * Number(settings.xOffsetScale || 0);
  const yOffset = PREVIEW.gap * Number(settings.yOffsetScale || 0);
  const halfWidth = 12 * Number(settings.widthScale || 1);
  const thickness = Math.max(1, 0.6 * Number(settings.fontSizeScale || 2) * Number(settings.heightScale || 1));

  for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) {
    const y = previewYForStep(ledgerStep, top) + yOffset;
    append(parent, makeElement("line", { class: "ledger-line", x1: x + xOffset - halfWidth, x2: x + xOffset + halfWidth, y1: y, y2: y, "stroke-width": thickness }));
  }
  for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) {
    const y = previewYForStep(ledgerStep, top) + yOffset;
    append(parent, makeElement("line", { class: "ledger-line", x1: x + xOffset - halfWidth, x2: x + xOffset + halfWidth, y1: y, y2: y, "stroke-width": thickness }));
  }
}

function accidentalKeyForValue(value, context = "score") {
  if (context === "keySignature") return value > 0 ? "sharpKeySignature" : "flatKeySignature";
  return value > 0 ? "sharpInScore" : value < 0 ? "flatInScore" : "naturalInScore";
}

function drawPreviewAccidental(parent, value, x, y, context = "score") {
  const accidentalKey = accidentalKeyForValue(value, context);
  if (!generatedEnabled(accidentalKey)) return;
  previewRenderSymbol(parent, accidentalKey, x, y, PREVIEW.gap);
}

function isLedgerLineStep(step) {
  return step <= -2 || step >= 10;
}

function previewNoteKey(note, stemDown, beamed = false) {
  if (note.rhythm === "semibreve") return "wholeNote";
  if (beamed && (note.rhythm === "quaver" || note.rhythm === "semiquaver" || note.rhythm === "dottedQuaver")) return stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp";
  if (note.rhythm === "quaver" || note.rhythm === "dottedQuaver") return stemDown ? "eighthNoteStemDown" : "eighthNoteStemUp";
  if (note.rhythm === "semiquaver") return stemDown ? "sixteenthNoteStemDown" : "sixteenthNoteStemUp";
  if (note.rhythm === "minim" || note.rhythm === "dottedMinim") return stemDown ? "halfNoteStemDown" : "halfNoteStemUp";
  return stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp";
}

function dotKeyForStep(step) {
  return step % 2 === 0 ? "augmentationDotLine" : "augmentationDotSpace";
}

function drawPreviewDot(parent, x, y, step) {
  const dotKey = dotKeyForStep(step);
  if (!generatedEnabled(dotKey)) return;
  const dotY = step % 2 === 0 ? y - PREVIEW.gap * 0.25 : y;
  previewRenderSymbol(parent, dotKey, x + 13, dotY, PREVIEW.gap);
}

function drawPreviewNote(parent, note, x, top, forcedStemEnd = null, forceStemDown = null, beamed = false) {
  const y = previewYForStep(note.step, top);
  if (note.restKey) {
    if (!generatedEnabled(note.restKey)) return;
    previewRenderSymbol(parent, note.restKey, x, previewYForStep(4, top), PREVIEW.gap);
    if (rhythmInfo(note.rhythm).dotted) drawPreviewDot(parent, x, previewYForStep(4, top), 4);
    return;
  }

  const stemDown = forceStemDown ?? previewStemDown(note.step);
  const symbolKey = previewNoteKey(note, stemDown, beamed);
  if (!generatedEnabled(symbolKey)) return;
  drawPreviewLedgerLines(parent, x, note.step, top, isLedgerLineStep(note.step));
  if (note.accidental !== null && note.accidental !== undefined && (!isLedgerLineStep(note.step) || generatedEnabled("ledgerLineAccidentals"))) {
    drawPreviewAccidental(parent, note.accidental, x - 17, y);
  }
  if (beamed) {
    const noteheadKey = stemDown ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (!generatedEnabled(noteheadKey)) return;
    previewRenderSymbol(parent, noteheadKey, x, y, PREVIEW.gap);
  } else {
    previewRenderSymbol(parent, symbolKey, x, y, PREVIEW.gap);
  }
  if (rhythmInfo(note.rhythm).dotted) drawPreviewDot(parent, x, y, note.step);
  if (forcedStemEnd !== null) {
    const stemX = x + (stemDown ? -6 : 6);
    const noteheadStemJoinY = y + (stemDown ? 0.5 : -0.5);
    append(parent, makeElement("line", {
      class: "stem",
      x1: stemX,
      x2: stemX,
      y1: noteheadStemJoinY,
      y2: forcedStemEnd,
      "stroke-width": 1.15,
    }));
  }
}

function isBeamableRhythm(rhythm) {
  return rhythm === "quaver" || rhythm === "semiquaver" || rhythm === "dottedQuaver";
}

function previewBeamUnit(timeSignature) {
  return ["6/8", "9/8", "12/8"].includes(timeSignature.id) ? 1.5 : 2;
}

function previewBeamBucket(note, timeSignature) {
  return Math.floor((note.beatPosition + 0.0001) / previewBeamUnit(timeSignature));
}

function previewQuaverGroups(notes, timeSignature) {
  const groups = [];
  let index = 0;
  while (index < notes.length) {
    if (notes[index].restKey || !isBeamableRhythm(notes[index].rhythm)) {
      index += 1;
      continue;
    }

    const start = index;
    const bucket = previewBeamBucket(notes[start], timeSignature);
    while (
      index + 1 < notes.length
      && !notes[index + 1].restKey
      && isBeamableRhythm(notes[index + 1].rhythm)
      && previewBeamBucket(notes[index + 1], timeSignature) === bucket
    ) {
      index += 1;
    }

    if (index > start) groups.push({ start, end: index });
    index += 1;
  }
  return groups;
}

function previewBeamConfigKey(notes) {
  return notes.some((note) => note.rhythm === "semiquaver")
    ? "semiquaverBeam"
    : "quaverBeam";
}

function previewBeamYAtX(x, beam) {
  const amount = (x - beam.start.x) / (beam.end.x - beam.start.x || 1);
  return beam.start.y + amount * (beam.end.y - beam.start.y);
}

function beamPolygonPoints(x1, y1, x2, y2, thickness) {
  const halfThickness = thickness / 2;
  return [
    `${x1},${y1 - halfThickness}`,
    `${x2},${y2 - halfThickness}`,
    `${x2},${y2 + halfThickness}`,
    `${x1},${y1 + halfThickness}`,
  ].join(" ");
}

function drawPreviewBeamShape(parent, x1, y1, x2, y2, thickness) {
  append(parent, makeElement("polygon", {
    class: "beam",
    points: beamPolygonPoints(x1, y1, x2, y2, thickness),
  }));
}

function drawPreviewSecondaryBeam(parent, beam, x1, x2, stemDown, beamThickness, secondBeamGap, yOffset = 0) {
  drawPreviewBeamShape(
    parent,
    x1,
    previewBeamYAtX(x1, beam) + (stemDown ? -secondBeamGap : secondBeamGap) + yOffset,
    x2,
    previewBeamYAtX(x2, beam) + (stemDown ? -secondBeamGap : secondBeamGap) + yOffset,
    beamThickness
  );
}

function drawPreviewBeam(parent, notes, positions, top, group) {
  const groupNotes = notes.slice(group.start, group.end + 1);
  const groupXs = positions.slice(group.start, group.end + 1);
  const beamKey = previewBeamConfigKey(groupNotes);
  const settings = symbolConfig(beamKey);
  const averageStep = groupNotes.reduce((sum, note) => sum + note.step, 0) / groupNotes.length;
  const stemDown = averageStep > 4;
  const firstY = previewYForStep(groupNotes[0].step, top);
  const lastY = previewYForStep(groupNotes[groupNotes.length - 1].step, top);
  const xOffset = PREVIEW.gap * Number(settings.xOffsetScale || 0);
  const yOffset = PREVIEW.gap * Number(settings.yOffsetScale || 0);
  const stemLength = 31 * Number(settings.heightScale || 1);
  const beamWidthAdjust = PREVIEW.gap * (Number(settings.widthScale || 1) - 1);
  const firstStemX = groupXs[0] + xOffset + (stemDown ? -6 : 6);
  const lastStemX = groupXs[groupXs.length - 1] + xOffset + (stemDown ? -6 : 6);
  const beam = {
    start: { x: firstStemX - beamWidthAdjust, y: firstY + yOffset + (stemDown ? stemLength : -stemLength) },
    end: { x: lastStemX + beamWidthAdjust, y: lastY + yOffset + (stemDown ? stemLength : -stemLength) },
  };

  groupNotes.forEach((note, localIndex) => {
    const noteX = groupXs[localIndex] + xOffset;
    const stemX = noteX + (stemDown ? -6 : 6);
    drawPreviewNote(parent, note, noteX, top, previewBeamYAtX(stemX, beam), stemDown, true);
  });

  const beamThickness = Math.max(1, 4 * Number(settings.fontSizeScale || 1));
  drawPreviewBeamShape(parent, beam.start.x, beam.start.y, beam.end.x, beam.end.y, beamThickness);

  if (beamKey === "semiquaverBeam") {
    const secondBeamSettings = symbolConfig("semiquaverSecondBeam");
    const secondBeamXOffset = PREVIEW.gap * Number(secondBeamSettings.xOffsetScale || 0);
    const secondBeamYOffset = PREVIEW.gap * Number(secondBeamSettings.yOffsetScale || 0);
    const secondBeamThickness = Math.max(1, 4 * Number(secondBeamSettings.fontSizeScale || 1));
    const secondBeamGap = 6 * Number(secondBeamSettings.heightScale || 1);
    const secondBeamWidthAdjust = PREVIEW.gap * (Number(secondBeamSettings.widthScale || 1) - 1);
    const stemXs = groupXs.map((x) => x + xOffset + (stemDown ? -6 : 6));
    let index = 0;

    while (index < groupNotes.length) {
      if (groupNotes[index].rhythm !== "semiquaver") {
        index += 1;
        continue;
      }

      const start = index;
      while (index + 1 < groupNotes.length && groupNotes[index + 1].rhythm === "semiquaver") index += 1;
      const end = index;

      if (end > start && generatedEnabled("semiquaverSecondBeam")) {
        drawPreviewSecondaryBeam(
          parent,
          beam,
          stemXs[start] - 1 - secondBeamWidthAdjust + secondBeamXOffset,
          stemXs[end] + 1 + secondBeamWidthAdjust + secondBeamXOffset,
          stemDown,
          secondBeamThickness,
          secondBeamGap,
          secondBeamYOffset
        );
      } else if (generatedEnabled("semiquaverBeamHook")) {
        const hookSettings = symbolConfig("semiquaverBeamHook");
        const neighbourIndex = start === 0 ? start + 1 : start - 1;
        const direction = neighbourIndex > start ? 1 : -1;
        const hookLength = Math.min(Math.abs(stemXs[neighbourIndex] - stemXs[start]) * 0.58, PREVIEW.gap * 1.8) * Number(hookSettings.widthScale || 1);
        const hookXOffset = PREVIEW.gap * Number(hookSettings.xOffsetScale || 0);
        const hookYOffset = PREVIEW.gap * Number(hookSettings.yOffsetScale || 0);
        const hookThickness = Math.max(1, 4 * Number(hookSettings.fontSizeScale || 1));
        const hookGap = secondBeamGap * Number(hookSettings.heightScale || 1);
        drawPreviewSecondaryBeam(
          parent,
          beam,
          stemXs[start] - 1 + hookXOffset,
          stemXs[start] + direction * hookLength + hookXOffset,
          stemDown,
          hookThickness,
          hookGap,
          hookYOffset
        );
      }

      index += 1;
    }
  }
}

function drawPreviewKeySignature(parent, key, top, clef = "treble") {
  const entries = Object.entries(key.keyAccidentals || {});
  if (!entries.length) return;
  const kind = entries.some(([, value]) => value < 0) ? "flat" : "sharp";
  if (!generatedEnabled(kind)) return;
  const steps = clef === "bass" ? BASS_KEY_SIG_STEPS : TREBLE_KEY_SIG_STEPS;
  const letters = KEY_SIG_ORDER[kind].filter((letter) => key.keyAccidentals[letter]);
  letters.forEach((letter, index) => {
    const value = key.keyAccidentals[letter];
    const step = steps[kind][letter];
    drawPreviewAccidental(parent, value, PREVIEW.keySigX + index * 14, previewYForStep(step, top), "keySignature");
  });
}

function firstDrawableNote(bar) {
  return bar.notes.find((note) => !note.restKey);
}

function notePositionInBar(bar, note) {
  const positions = previewBarNotePositions(bar.barIndex, bar.notes);
  const index = bar.notes.indexOf(note);
  return positions[index] || previewBarStart(bar.barIndex) + PREVIEW.gap * 3;
}

function drawPreviewArticulation(parent, key, bar, note, top, above = true) {
  if (!generatedEnabled(key) || !note) return;
  const x = notePositionInBar(bar, note);
  const y = previewYForStep(note.step, top) + (above ? -PREVIEW.gap * 3.1 : PREVIEW.gap * 3.1);
  previewRenderSymbol(parent, key, x, y, PREVIEW.gap);
}

function drawPreviewOptionalSymbols(parent, question) {
  const firstTop = PREVIEW.systemTops[0];
  const firstBassTop = previewBassTop(firstTop);
  const secondTop = PREVIEW.systemTops[1];
  const secondBassTop = previewBassTop(secondTop);
  const firstBar = question.bars[0];
  const secondBar = question.bars[1];
  const thirdBar = question.bars[2];
  const fifthBar = question.bars[4];
  const sixthBar = question.bars[5];
  const firstNote = firstDrawableNote(firstBar);
  const secondNote = firstDrawableNote(secondBar);
  const thirdNote = firstDrawableNote(thirdBar);
  const fifthNote = firstDrawableNote(fifthBar);

  drawPreviewArticulation(parent, "accentAbove", secondBar, secondNote, firstTop, true);
  drawPreviewArticulation(parent, "staccatoAbove", thirdBar, thirdNote, firstTop, true);
  drawPreviewArticulation(parent, "accentBelow", fifthBar, fifthNote, secondTop, false);
  drawPreviewArticulation(parent, "staccatoBelow", sixthBar, firstDrawableNote(sixthBar), secondTop, false);

  if (generatedEnabled("naturalInScore") && firstNote) {
    drawPreviewAccidental(parent, 0, notePositionInBar(firstBar, firstNote) - 17, previewYForStep(firstNote.step, firstTop));
  }

  if (generatedEnabled("tie")) {
    const tieNotes = firstBar.notes.filter((note) => !note.restKey).slice(0, 2);
    if (tieNotes.length === 2) {
      const firstX = notePositionInBar(firstBar, tieNotes[0]);
      const secondX = notePositionInBar(firstBar, tieNotes[1]);
      const tieY = previewYForStep(Math.min(tieNotes[0].step, tieNotes[1].step), firstTop) + PREVIEW.gap * 2.4;
      previewRenderSymbol(parent, "tie", (firstX + secondX) / 2, tieY, PREVIEW.gap);
    }
  }

  const dynamicKeys = ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato"];
  dynamicKeys.forEach((key, index) => {
    if (!generatedEnabled(key)) return;
    previewRenderSymbol(parent, key, previewBarStart(index % 4) + PREVIEW.gap * 3.5, firstBassTop + PREVIEW.gap * 8.4, PREVIEW.gap);
  });

  if (generatedEnabled("crescendo")) {
    previewRenderSymbol(parent, "crescendo", previewBarStart(5) + PREVIEW.gap * 4, secondBassTop + PREVIEW.gap * 8.5, PREVIEW.gap);
  }

  if (generatedEnabled("diminuendo")) {
    previewRenderSymbol(parent, "diminuendo", previewBarStart(6) + PREVIEW.gap * 4, secondBassTop + PREVIEW.gap * 8.5, PREVIEW.gap);
  }

  if (shouldShowLedgerLines()) {
    drawPreviewNote(parent, {
      rhythm: "crotchet",
      step: 10,
      accidental: generatedEnabled("ledgerLineAccidentals") ? 1 : null,
    }, previewBarStart(3) + PREVIEW.gap * 6.2, firstTop);
    drawPreviewNote(parent, {
      rhythm: "crotchet",
      step: -2,
      accidental: generatedEnabled("ledgerLineAccidentals") ? -1 : null,
    }, previewBarStart(7) + PREVIEW.gap * 4.2, secondBassTop);
  }

  const restExamples = [
    { key: "wholeRest", barIndex: 4, staffTop: secondTop },
    { key: "halfRest", barIndex: 5, staffTop: secondTop },
    { key: "quarterRest", barIndex: 6, staffTop: secondTop },
    { key: "eighthRest", barIndex: 4, staffTop: secondBassTop },
    { key: "sixteenthRest", barIndex: 5, staffTop: secondBassTop },
  ];
  restExamples.forEach((item) => {
    if (!generatedEnabled(item.key)) return;
    const alreadyShown = question.bars.some((bar) => bar.notes.some((note) => note.restKey === item.key));
    if (alreadyShown) return;
    previewRenderSymbol(parent, item.key, previewBarStart(item.barIndex) + PREVIEW.gap * 5, previewYForStep(4, item.staffTop), PREVIEW.gap);
  });

  if (generatedEnabled("repeatLeft")) {
    previewRenderSymbol(parent, "repeatLeft", previewBarStart(4) - PREVIEW.gap * 1.1, secondTop + PREVIEW.gap * 2.9, PREVIEW.gap);
  }

  if (generatedEnabled("repeatRight")) {
    previewRenderSymbol(parent, "repeatRight", previewBarStart(3) + previewBarWidth(3) - PREVIEW.gap * 0.5, firstTop + PREVIEW.gap * 2.9, PREVIEW.gap);
  }
}

function renderHigherPreview(parent) {
  parent.replaceChildren();
  const question = previewQuestion;
  parent.setAttribute("viewBox", `0 0 ${PREVIEW.width} ${PREVIEW.height}`);
  append(parent, makeElement("rect", { width: PREVIEW.width, height: PREVIEW.height, fill: "transparent" }));

  PREVIEW.systemTops.forEach((top, systemIndex) => {
    const bassTop = previewBassTop(top);
    const finalBar = systemIndex === 0 ? 3 : 7;
    const endX = previewBarStart(finalBar) + previewBarWidth(finalBar);
    drawPreviewStave(parent, top, endX);
    drawPreviewStave(parent, bassTop, endX);
    if (generatedEnabled("barlineSingle")) drawPreviewSystemBarline(parent, PREVIEW.staffLeft, top, bassTop);
    if (generatedEnabled("gClef")) previewRenderSymbol(parent, "gClef", previewAnchorX("gClef"), previewAnchorY("gClef", top), PREVIEW.gap);
    if (generatedEnabled("fClef")) previewRenderSymbol(parent, "fClef", previewAnchorX("fClef"), previewAnchorY("fClef", bassTop), PREVIEW.gap);
    if (generatedEnabled("brace")) previewRenderSymbol(parent, "brace", PREVIEW.staffLeft - 18, top + PREVIEW.gap * 4, PREVIEW.gap);
    if (systemIndex === 0) {
      drawPreviewKeySignature(parent, question.key, top, "treble");
      drawPreviewKeySignature(parent, question.key, bassTop, "bass");
      if (generatedEnabled("timeSignature")) {
        previewRenderSymbol(parent, question.timeSignatureKey, previewAnchorX(question.timeSignatureKey), previewAnchorY(question.timeSignatureKey, top), PREVIEW.gap);
        previewRenderSymbol(parent, question.timeSignatureKey, previewAnchorX(question.timeSignatureKey), previewAnchorY(question.timeSignatureKey, bassTop), PREVIEW.gap);
      }
    }
  });

  question.bars.forEach((bar) => {
    const start = previewBarStart(bar.barIndex);
    const end = start + previewBarWidth(bar.barIndex);
    const top = previewSystemTop(bar.barIndex);
    const bassTop = previewBassTop(top);
    const positions = previewBarNotePositions(bar.barIndex, bar.notes);
    const bassPositions = previewBarNotePositions(bar.barIndex, bar.bassNotes || []);
    const groups = previewQuaverGroups(bar.notes, question.timeSignature)
      .filter((group) => generatedEnabled(previewBeamConfigKey(bar.notes.slice(group.start, group.end + 1))));
    const groupedIndexes = new Set(groups.flatMap((group) => {
      const indexes = [];
      for (let index = group.start; index <= group.end; index += 1) indexes.push(index);
      return indexes;
    }));
    append(parent, makeElement("text", {
      x: (bar.barIndex === 0 || bar.barIndex === 4) ? start - 15 : start + 5,
      y: top - 18,
      "font-size": 13,
      "font-weight": 600,
    }, String(bar.barIndex + 1)));

    bar.notes.forEach((note, index) => {
      if (!groupedIndexes.has(index)) drawPreviewNote(parent, note, positions[index], top);
    });
    groups.forEach((group) => drawPreviewBeam(parent, bar.notes, positions, top, group));
    (bar.bassNotes || []).forEach((note, index) => {
      drawPreviewNote(parent, note, bassPositions[index], bassTop);
    });

    if (bar.barIndex === PREVIEW.barCount - 1) {
      if (generatedEnabled("barlineFinal")) drawPreviewSystemBarline(parent, end, top, bassTop, true);
    } else if (generatedEnabled("barlineSingle")) {
      drawPreviewSystemBarline(parent, end, top, bassTop);
    }
  });

  drawPreviewOptionalSymbols(parent, question);
}

function updateExportText() {
  exportText.value = `const SHARED_NOTATION_CONFIG = ${JSON.stringify(config, null, 2)};`;
}

function fillGeneratedSymbolChecks() {
  generatedSymbolChecks.innerHTML = Object.entries(SYMBOL_GROUPS).map(([groupName, keys]) => {
    const rows = keys
      .filter((key) => hasRenderableSymbol(key))
      .map((key) => `
        <label>
          <input type="checkbox" value="${key}" ${generatedEnabled(key) ? "checked" : ""} />
          ${symbolLabel(key)}
        </label>
      `)
      .join("");
    return `<div class="checkbox-heading">${groupName}</div>${rows}`;
  }).join("");
}

function fillSymbolSelect() {
  const existingKeys = Array.from(symbolSelect.options).map((option) => option.value);
  const allRenderableKeys = [];
  Object.values(SYMBOL_GROUPS).forEach((keys) => {
    keys.filter((key) => hasRenderableSymbol(key)).forEach((key) => allRenderableKeys.push(key));
  });

  if (existingKeys.join("|") !== allRenderableKeys.join("|")) {
    symbolSelect.innerHTML = Object.entries(SYMBOL_GROUPS).map(([groupName, keys]) => {
      const options = keys
        .filter((key) => hasRenderableSymbol(key))
        .map((key) => `<option value="${key}">${symbolLabel(key)}</option>`)
        .join("");
      return `<optgroup label="${groupName}">${options}</optgroup>`;
    }).join("");
  }

  if (!allRenderableKeys.includes(selectedSymbolKey)) selectedSymbolKey = allRenderableKeys[0] || "";
  selectedCategory = Object.entries(SYMBOL_GROUPS).find(([, keys]) => keys.includes(selectedSymbolKey))?.[0] || selectedCategory;
  symbolSelect.value = selectedSymbolKey;
}

function decimalsFor(control) {
  return control.step && Number(control.step) < 1 ? 2 : 0;
}

function setRange(control, value) {
  control.value = value;
  const output = outputs[control.id];
  if (!output) return;
  if (control.id === "zoom") {
    output.textContent = `${Number(value)}%`;
    return;
  }
  output.textContent = Number(value).toFixed(decimalsFor(control));
}

function setSymbolControlsDisabled(disabled) {
  SYMBOL_SETTING_KEYS.forEach((key) => {
    controls[key].disabled = disabled;
  });
}

function setAllNotesControls() {
  const positionOnly = selectedSymbolKey === "allNotes";
  ["fontSizeScale", "widthScale", "heightScale"].forEach((key) => {
    controls[key].disabled = positionOnly;
  });
  ["xOffsetScale", "yOffsetScale"].forEach((key) => {
    controls[key].disabled = false;
  });
}

function syncControlsFromConfig() {
  fillSymbolSelect();
  setRange(controls.zoom, Number(controls.zoom.value || 100));
  controls.showGuides.checked = Boolean(config.stave.showGuides);

  if (!selectedSymbolKey) {
    setSymbolControlsDisabled(true);
    SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], 0));
    return;
  }

  setSymbolControlsDisabled(false);
  setAllNotesControls();
  const settings = symbolConfig(settingsKeyForControl(selectedSymbolKey));
  SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], settings[key]));
}

function updateZoom() {
  stage.style.width = `${Number(controls.zoom.value || 100)}%`;
}

function setZoomValue(value) {
  const min = Number(controls.zoom.min || 50);
  const max = Number(controls.zoom.max || 400);
  const step = Number(controls.zoom.step || 10);
  const rounded = Math.round(value / step) * step;
  controls.zoom.value = clamp(rounded, min, max);
  updateAll();
}

function handlePinchZoom(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  const currentZoom = Number(controls.zoom.value || 100);
  setZoomValue(currentZoom - event.deltaY * 0.5);
}

function updateAll() {
  syncTimeSignatureSettings();
  syncControlsFromConfig();
  updateZoom();
  renderStage();
  updateExportText();
}

function updateSymbolSetting(key, value) {
  if (!selectedSymbolKey) return;
  if (selectedSymbolKey === "allNotes" && !["xOffsetScale", "yOffsetScale"].includes(key)) return;
  linkedSymbolKeys(selectedSymbolKey).forEach((symbolKey) => {
    symbolConfig(symbolKey)[key] = Number(value);
  });
  updateAll();
}

function parseImportedConfig(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Import box is empty.");
  const objectText = trimmed
    .replace(/^const\s+SHARED_NOTATION_CONFIG\s*=\s*/, "")
    .replace(/;\s*$/, "");
  return JSON.parse(objectText);
}

symbolSelect.addEventListener("change", () => {
  selectedSymbolKey = symbolSelect.value;
  selectedCategory = Object.entries(SYMBOL_GROUPS).find(([, keys]) => keys.includes(selectedSymbolKey))?.[0] || selectedCategory;
  updateAll();
});

controls.zoom.addEventListener("input", updateAll);

if (notationScroll) {
  notationScroll.addEventListener("wheel", handlePinchZoom, { passive: false });
}

controls.showGuides.addEventListener("change", () => {
  config.stave.showGuides = controls.showGuides.checked;
  updateAll();
});

document.getElementById("shufflePreviewButton").addEventListener("click", () => {
  previewQuestion = makeHigherPreviewQuestion();
  updateAll();
});

generatedSymbolChecks.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  generatedSymbols[event.target.value] = event.target.checked;
  previewQuestion = makeHigherPreviewQuestion(event.target.checked ? event.target.value : "");
  updateAll();
});

SYMBOL_SETTING_KEYS.forEach((key) => {
  controls[key].addEventListener("input", () => updateSymbolSetting(key, controls[key].value));
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (!selectedSymbolKey) return;
  linkedSymbolKeys(selectedSymbolKey).forEach((symbolKey) => {
    config.symbols[symbolKey] = cloneConfig(
      DEFAULT_CONFIG.symbols[symbolKey] || symbolConfig(symbolKey)
    );
  });
  updateAll();
});

document.getElementById("exportButton").addEventListener("click", async () => {
  updateExportText();
  try {
    await navigator.clipboard.writeText(exportText.value);
  } catch (error) {
    exportText.classList.remove("export-storage");
    exportText.select();
    document.execCommand("copy");
    exportText.classList.add("export-storage");
  }
});

document.getElementById("importButton").addEventListener("click", () => {
  try {
    const imported = parseImportedConfig(importText.value);
    config = cloneConfig(imported);
    if (!config.stave.grandStaffGapScale) config.stave.grandStaffGapScale = DEFAULT_CONFIG.stave.grandStaffGapScale;
    updateAll();
  } catch (error) {
    alert("The pasted config could not be imported. Please check it is valid JSON from the export box.");
  }
});

fillGeneratedSymbolChecks();
updateAll();
