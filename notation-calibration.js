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
const enableAllGeneratedSymbols = document.getElementById("enableAllGeneratedSymbols");
const exportText = document.getElementById("exportText");
const copyConfirmation = document.getElementById("copyConfirmation");

const controls = {
  zoom: document.getElementById("zoom"),
  barCount: document.getElementById("barCount"),
  showGuides: document.getElementById("showGuides"),
  showBarNumbers: document.getElementById("showBarNumbers"),
  fontSizeScale: document.getElementById("fontSizeScale"),
  widthScale: document.getElementById("widthScale"),
  heightScale: document.getElementById("heightScale"),
  xOffsetScale: document.getElementById("xOffsetScale"),
  yOffsetScale: document.getElementById("yOffsetScale"),
};

const outputs = Object.fromEntries(
  Object.keys(controls).map((id) => [id, document.getElementById(`${id}Value`)])
);

const BEAM_NOTEHEAD_KEYS = [
  "noteheadBlackStemUp",
  "noteheadBlackStemDown",
];

const ORDINARY_NOTE_KEYS = [
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

const ALL_NOTE_KEYS = [...BEAM_NOTEHEAD_KEYS, ...ORDINARY_NOTE_KEYS];

const SYMBOL_GROUPS = {
  "Clefs": ["gClef", "fClef"],
  "Key Signatures": ["keySignatureAccidentals"],
  "Time Signatures": ["timeSignature"],
  "Rhythms": [...ORDINARY_NOTE_KEYS, ...BEAM_NOTEHEAD_KEYS, "quaverBeam", "semiquaverBeam", "semiquaverSecondBeam", "semiquaverBeamHook", "augmentationDotLine", "augmentationDotSpace", "tieStemUp", "tieStemDown"],
  "Rests": ["wholeRest", "halfRest", "quarterRest", "eighthRest", "sixteenthRest"],
  "Accidentals": ["scoreAccidentals"],
  "Articulations": ["accentAbove", "accentBelow", "staccatoAbove", "staccatoBelow", "slurStemUp", "slurStemDown", "phraseMarking"],
  "Dynamics": ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato", "crescendo", "diminuendo"],
  "Barlines And Repeat Signs": ["barlineSingle", "barlineFinal", "repeatLeft", "repeatRight"],
  "Other": ["brace", "ledgerLines", "ledgerLineAccidentals"],
};

const GENERATED_SYMBOL_GROUPS = {
  "Clefs": [
    "gClef",
    "fClef",
  ],
  "Rhythms": [
    { key: "wholeNote" },
    { key: "halfNote", label: "Minim", keys: ["halfNoteStemUp", "halfNoteStemDown"] },
    { key: "quarterNote", label: "Crotchet", keys: ["quarterNoteStemUp", "quarterNoteStemDown"] },
    { key: "eighthNote", label: "Quaver", keys: ["eighthNoteStemUp", "eighthNoteStemDown"] },
    { key: "sixteenthNote", label: "Semiquaver", keys: ["sixteenthNoteStemUp", "sixteenthNoteStemDown"] },
    { key: "augmentationDot", label: "Dot", keys: ["augmentationDotLine", "augmentationDotSpace"] },
    { key: "tie", label: "Tie", keys: ["tieStemUp", "tieStemDown"] },
  ],
  "Rests": ["wholeRest", "halfRest", "quarterRest", "eighthRest", "sixteenthRest"],
  "Accidentals": ["scoreAccidentals"],
  "Articulations": [
    { key: "accent", label: "Accent", keys: ["accentAbove", "accentBelow"] },
    { key: "staccato", label: "Staccato", keys: ["staccatoAbove", "staccatoBelow"] },
    { key: "slur", label: "Slur", keys: ["slurStemUp", "slurStemDown"] },
    { key: "phraseMarking", label: "Phrase Marking" },
  ],
  "Dynamics": ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato", "crescendo", "diminuendo"],
  "Barlines And Repeat Signs": [
    "barlineSingle",
    "barlineFinal",
    { key: "repeat", label: "Repeat Signs", keys: ["repeatLeft", "repeatRight"] },
  ],
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
  gClef: "Treble",
  fClef: "Bass",
  timeSignature: "Time Signature",
  timeSig24: "2/4",
  timeSig34: "3/4",
  timeSig44: "4/4",
  timeSig54: "5/4",
  timeSig68: "6/8",
  timeSig98: "9/8",
  timeSig128: "12/8",
  allNotes: "All Notes",
  noteheadBlackStemUp: "Beamed Notehead - Stem Up",
  noteheadBlackStemDown: "Beamed Notehead - Stem Down",
  wholeNote: "Semibreve",
  halfNoteStemUp: "Minim - Stem Up",
  halfNoteStemDown: "Minim - Stem Down",
  quarterNoteStemUp: "Crotchet - Stem Up",
  quarterNoteStemDown: "Crotchet - Stem Down",
  eighthNoteStemUp: "Quaver - Stem Up",
  eighthNoteStemDown: "Quaver - Stem Down",
  sixteenthNoteStemUp: "Semiquaver - Stem Up",
  sixteenthNoteStemDown: "Semiquaver - Stem Down",
  quaverBeam: "Quaver Beam",
  semiquaverBeam: "Semiquaver Beam",
  semiquaverSecondBeam: "Semiquaver Second Beam",
  semiquaverBeamHook: "Semiquaver Beam Hook",
  augmentationDotLine: "Dot On Line Note",
  augmentationDotSpace: "Dot On Space Note",
  tie: "Tie",
  tieStemUp: "Tie - Stem Up",
  tieStemDown: "Tie - Stem Down",
  slur: "Slur",
  slurStemUp: "Slur - Stem Up",
  slurStemDown: "Slur - Stem Down",
  phraseMarking: "Phrase Marking",
  keySignatureAccidentals: "Accidentals In Key Signature",
  scoreAccidentals: "Accidentals",
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
  sforzato: "Sforzando",
  crescendo: "Crescendo",
  diminuendo: "Diminuendo",
  ledgerLines: "Ledger Lines",
  ledgerLineAccidentals: "Accidentals On Ledger-Line Notes",
};

function symbolLabel(key) {
  return SYMBOL_LABELS[key] || key;
}

function symbolGlyph(key) {
  if (isTimeSignatureKey(key)) return "4/4";
  if (key === "keySignatureAccidentals" || key === "scoreAccidentals") return BRAVURA_SYMBOLS.sharp;
  if (key === "quaverBeam" || key === "semiquaverBeam" || key === "semiquaverSecondBeam" || key === "semiquaverBeamHook") return "━";
  const symbol = BRAVURA_SYMBOLS[actualSymbolKey(key)];
  return symbol || "";
}

function optionGlyph(option) {
  const keys = generatedOptionKeys(option);
  if (keys.length > 1 && keys.some((key) => key.includes("StemDown"))) {
    return symbolGlyph(keys.find((key) => key.includes("StemUp")) || keys[0]);
  }
  return symbolGlyph(keys[0]);
}

function glyphMarkup(glyph, className = "") {
  if (!glyph) return "";
  const textGlyph = /[A-Za-z0-9/]/.test(glyph);
  return `<span class="option-glyph ${textGlyph ? "text-glyph" : ""} ${className}" aria-hidden="true">${glyph}</span>`;
}

function optionGlyphClass(option) {
  return generatedOptionKeys(option).some((key) => key.startsWith("barline") || key.startsWith("repeat"))
    ? "barline-repeat-glyph"
    : "";
}

function labelledOptionText(key) {
  const glyph = symbolGlyph(key);
  return `${glyph ? `${glyph}  ` : ""}${symbolLabel(key)}`;
}

function titleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const DEFAULT_GENERATED_SYMBOLS = {
  gClef: true,
  fClef: false,
  brace: false,
  timeSignature: false,
  barlineSingle: true,
  barlineFinal: true,
  noteheadBlackStemUp: false,
  noteheadBlackStemDown: false,
  wholeNote: false,
  halfNoteStemUp: false,
  halfNoteStemDown: false,
  quarterNoteStemUp: false,
  quarterNoteStemDown: false,
  eighthNoteStemUp: false,
  eighthNoteStemDown: false,
  sixteenthNoteStemUp: false,
  sixteenthNoteStemDown: false,
  quaverBeam: false,
  semiquaverBeam: false,
  semiquaverSecondBeam: false,
  semiquaverBeamHook: false,
  augmentationDotLine: false,
  augmentationDotSpace: false,
  flatKeySignature: false,
  sharpKeySignature: false,
  keySignatureAccidentals: false,
  flatInScore: false,
  sharpInScore: false,
  naturalInScore: false,
  scoreAccidentals: false,
  tieStemUp: false,
  tieStemDown: false,
  slurStemUp: false,
  slurStemDown: false,
  phraseMarking: false,
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

const PREVIEW_FALLBACK_GENERATED_SYMBOLS = {
  wholeNote: true,
  halfNoteStemUp: true,
  halfNoteStemDown: true,
  quarterNoteStemUp: true,
  quarterNoteStemDown: true,
  eighthNoteStemUp: true,
  eighthNoteStemDown: true,
  sixteenthNoteStemUp: true,
  sixteenthNoteStemDown: true,
  noteheadBlackStemUp: true,
  noteheadBlackStemDown: true,
  quaverBeam: true,
  semiquaverBeam: true,
  semiquaverSecondBeam: true,
  semiquaverBeamHook: true,
  augmentationDotLine: true,
  augmentationDotSpace: true,
  wholeRest: true,
  halfRest: true,
  quarterRest: true,
  eighthRest: true,
  sixteenthRest: true,
};

let generatedSymbols = { ...DEFAULT_GENERATED_SYMBOLS };
let generatedTimeSignatures = {};
let generatedKeys = {};

function generatedKeyForSymbol(key) {
  if (isTimeSignatureKey(key)) return "timeSignature";
  if (key === "augmentationDot") return "augmentationDotSpace";
  if (key === "flatKeySignature" || key === "sharpKeySignature") return "keySignatureAccidentals";
  if (key === "flatInScore" || key === "naturalInScore" || key === "sharpInScore") return "scoreAccidentals";
  if (key === "tie") return "tieStemUp";
  if (key === "slur") return "slurStemUp";
  return key;
}

function generatedEnabled(key) {
  if (key === "noteheadBlackStemUp") return generatedSymbols.eighthNoteStemUp || generatedSymbols.sixteenthNoteStemUp;
  if (key === "noteheadBlackStemDown") return generatedSymbols.eighthNoteStemDown || generatedSymbols.sixteenthNoteStemDown;
  if (key === "quaverBeam") return generatedSymbols.eighthNoteStemUp || generatedSymbols.eighthNoteStemDown;
  if (key === "semiquaverBeam" || key === "semiquaverSecondBeam" || key === "semiquaverBeamHook") {
    return generatedSymbols.sixteenthNoteStemUp || generatedSymbols.sixteenthNoteStemDown;
  }
  return Boolean(generatedSymbols[generatedKeyForSymbol(key)]);
}

function hasExplicitRhythmGeneration() {
  return Object.keys(PREVIEW_FALLBACK_GENERATED_SYMBOLS).some((key) => generatedEnabled(key));
}

function previewCanUseSymbol(key) {
  return generatedEnabled(key)
    || (!hasExplicitRhythmGeneration() && Boolean(PREVIEW_FALLBACK_GENERATED_SYMBOLS[generatedKeyForSymbol(key)]));
}

function timeSignatureEnabled(item) {
  return Boolean(generatedTimeSignatures[item.id]);
}

function keyEnabled(item) {
  return Boolean(generatedKeys[item.id]);
}

function enabledTimeSignatureCount() {
  return PREVIEW_TIME_SIGNATURES.filter((item) => timeSignatureEnabled(item)).length;
}

function enabledKeyCount() {
  return PREVIEW_KEYS.filter((item) => keyEnabled(item)).length;
}

function enabledClefCount() {
  return ["gClef", "fClef"].filter((key) => generatedEnabled(key)).length;
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
    || key === "keySignatureAccidentals"
    || key === "scoreAccidentals"
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
  if (key === "keySignatureAccidentals") return ["flatKeySignature", "sharpKeySignature"];
  if (key === "scoreAccidentals") return ["flatInScore", "naturalInScore", "sharpInScore"];
  if (key === "tieStemUp" || key === "tieStemDown") return ["tie"];
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
  if (key === "keySignatureAccidentals") return "flatKeySignature";
  if (key === "scoreAccidentals") return "flatInScore";
  if (key === "tieStemUp" || key === "tieStemDown") return "tie";
  return key;
}

function actualSymbolKey(key) {
  if (key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown") return "noteheadBlack";
  if (key === "augmentationDotLine" || key === "augmentationDotSpace") return "augmentationDot";
  if (key === "keySignatureAccidentals" || key === "scoreAccidentals") return "flat";
  if (key === "tieStemUp" || key === "tieStemDown") return "tie";
  if (key === "slurStemUp" || key === "slurStemDown" || key === "phraseMarking") return "tie";
  if (key === "flatKeySignature" || key === "flatInScore") return "flat";
  if (key === "naturalInScore") return "natural";
  if (key === "sharpKeySignature" || key === "sharpInScore") return "sharp";
  return key;
}

function settingsKeyForDrawing(key) {
  if (key === "flatInScore" || key === "naturalInScore" || key === "sharpInScore") return "flatInScore";
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

const PREVIEW_BAR_COUNT_OPTIONS = [1, 4, 8];
const PREVIEW_VIEWBOX_HEIGHTS = {
  singleStaff: 360,
  grandStaff: 360,
};
const PREVIEW_VIEWBOX_UP_SHIFT = 15;
const PREVIEW_ONE_BAR_ZOOM = 1;
const PREVIEW_LAYOUT_OFFSETS = {
  keySignature: 54,
  timeSignature: 82,
  musicStart: 118,
};

function previewBarCount() {
  const requestedCount = Number(controls.barCount?.value || PREVIEW.barCount || 8);
  return PREVIEW_BAR_COUNT_OPTIONS.includes(requestedCount) ? requestedCount : 8;
}

function previewSystemCount() {
  return Math.ceil(previewBarCount() / PREVIEW.barsPerSystem);
}

function previewBarsOnSystem(systemIndex) {
  const remaining = previewBarCount() - systemIndex * PREVIEW.barsPerSystem;
  return clamp(remaining, 0, PREVIEW.barsPerSystem);
}

function previewSystemIndexForBar(barIndex) {
  return Math.floor(barIndex / PREVIEW.barsPerSystem);
}

function previewSystemStartX(systemIndex) {
  return systemIndex === 0 ? PREVIEW.musicStartX : previewSecondSystemStartX();
}

function previewSystemVisibleStartX(systemIndex) {
  return systemIndex === 0 ? PREVIEW.staffLeft : previewSecondSystemStartX();
}

function activePreviewSystemTops() {
  return PREVIEW.systemTops.slice(0, previewSystemCount());
}

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

const TWO_BEAT_GROUP_UNITS = [
  ["minim"],
  ["crotchet", "crotchet"],
  ["quaver", "quaver", "crotchet"],
  ["crotchet", "quaver", "quaver"],
  ...TWO_BEAT_RHYTHM_UNITS,
];

const THREE_BEAT_RHYTHM_UNITS = [
  ["dottedMinim"],
  ["minim", "crotchet"],
  ["crotchet", "minim"],
  ["crotchet", "crotchet", "crotchet"],
  ["quaver", "quaver", "crotchet", "crotchet"],
  ["crotchet", "quaver", "quaver", "crotchet"],
  ...TWO_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet"]),
  ...ONE_BEAT_RHYTHM_UNITS.map((unit) => [...unit, "crotchet", "crotchet"]),
];

function combineFiveFourGroups() {
  return [
    ...THREE_BEAT_RHYTHM_UNITS.flatMap((threeBeatUnit) => (
      TWO_BEAT_GROUP_UNITS.map((twoBeatUnit) => [...threeBeatUnit, ...twoBeatUnit])
    )),
    ...TWO_BEAT_GROUP_UNITS.flatMap((twoBeatUnit) => (
      THREE_BEAT_RHYTHM_UNITS.map((threeBeatUnit) => [...twoBeatUnit, ...threeBeatUnit])
    )),
  ];
}

const COMPOUND_BEAT_UNITS = [
  ["quaver", "quaver", "quaver"],
  ["crotchet", "quaver"],
  ["quaver", "crotchet"],
  ["dottedCrotchet"],
  ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "semiquaver", "semiquaver"],
  ["semiquaver", "semiquaver", "quaver", "quaver"],
  ["quaver", "semiquaver", "semiquaver", "quaver"],
  ["quaver", "quaver", "semiquaver", "semiquaver"],
  ["semiquaver", "semiquaver", "semiquaver", "semiquaver", "quaver"],
  ["quaver", "semiquaver", "semiquaver", "semiquaver", "semiquaver"],
];

const COMPOUND_LONG_BEAT_UNITS = [
  ["dottedMinim"],
];

function combineCompoundBeatUnits(beatCount) {
  const patterns = [];
  function addUnits(prefix, remainingBeats) {
    if (remainingBeats === 0) {
      patterns.push(prefix);
      return;
    }
    COMPOUND_BEAT_UNITS.forEach((unit) => addUnits([...prefix, ...unit], remainingBeats - 1));
  }
  addUnits([], beatCount);
  return patterns;
}

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
    ["semibreve"],
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
    ["dottedMinim", "minim"],
    ["minim", "dottedMinim"],
    ...combineFiveFourGroups(),
  ],
  "6/8": [
    ...combineCompoundBeatUnits(2),
    ["dottedMinim"],
  ],
  "9/8": [
    ...combineCompoundBeatUnits(3),
    ["dottedMinim", "dottedCrotchet"],
    ["dottedCrotchet", "dottedMinim"],
  ],
  "12/8": [
    ...combineCompoundBeatUnits(4),
    ["dottedMinim", "dottedMinim"],
    ...COMPOUND_BEAT_UNITS.flatMap((firstUnit) => COMPOUND_BEAT_UNITS.map((secondUnit) => ["dottedMinim", ...firstUnit, ...secondUnit])),
    ...COMPOUND_BEAT_UNITS.flatMap((firstUnit) => COMPOUND_BEAT_UNITS.map((secondUnit) => [...firstUnit, "dottedMinim", ...secondUnit])),
    ...COMPOUND_BEAT_UNITS.flatMap((firstUnit) => COMPOUND_BEAT_UNITS.map((secondUnit) => [...firstUnit, ...secondUnit, "dottedMinim"])),
  ],
};

function isCompoundTimeSignature(timeSignature) {
  return ["6/8", "9/8", "12/8"].includes(timeSignature?.id);
}

function allowedCompoundUnits(timeSignature) {
  return [...COMPOUND_BEAT_UNITS, ...COMPOUND_LONG_BEAT_UNITS]
    .filter((unit) => unit.every((rhythmId) => canGenerateRhythm(rhythmId, timeSignature)));
}

function patternStartsWithUnit(pattern, index, unit) {
  return unit.every((rhythmId, unitIndex) => pattern[index + unitIndex] === rhythmId);
}

function patternHasBeatBoundary(pattern, targetBeat) {
  let beat = 0;
  for (let index = 0; index < pattern.length - 1; index += 1) {
    beat += rhythmInfo(pattern[index]).beats;
    if (Math.abs(beat - targetBeat) < 0.001) return true;
    if (beat > targetBeat) return false;
  }
  return false;
}

function patternRespectsFiveFourGroupings(pattern, timeSignature) {
  if (timeSignature?.id !== "5/4") return true;
  if (Math.abs(patternBeats(pattern) - 5) > 0.001) return false;
  return patternHasBeatBoundary(pattern, 2) || patternHasBeatBoundary(pattern, 3);
}

function patternRespectsCompoundGroupings(pattern, timeSignature) {
  if (!patternRespectsFiveFourGroupings(pattern, timeSignature)) return false;
  if (!isCompoundTimeSignature(timeSignature)) return true;
  const units = allowedCompoundUnits(timeSignature);

  function canSegmentFrom(index) {
    if (index >= pattern.length) return true;
    return units.some((unit) => (
      patternStartsWithUnit(pattern, index, unit)
      && canSegmentFrom(index + unit.length)
    ));
  }

  return canSegmentFrom(0);
}

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
  { id: "Bb", name: "Bb major", tonic: "B", keyAccidentals: { B: -1, E: -1 }, chords: {
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

const DEFAULT_GENERATED_TIME_SIGNATURES = Object.fromEntries(
  PREVIEW_TIME_SIGNATURES.map((item) => [item.id, item.id === "4/4"])
);

const DEFAULT_GENERATED_KEYS = Object.fromEntries(
  PREVIEW_KEYS.map((item) => [item.id, item.id === "C"])
);

generatedTimeSignatures = { ...DEFAULT_GENERATED_TIME_SIGNATURES };
generatedKeys = { ...DEFAULT_GENERATED_KEYS };

const PREVIEW_NOTE_POOL = [
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
  { letter: "B", octave: 5, step: 11, midi: 83 },
  { letter: "C", octave: 6, step: 12, midi: 84 },
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
    "5/4": ["dottedMinim", "minim"],
    "6/8": ["dottedMinim"],
    "9/8": ["dottedMinim", "crotchet", "quaver"],
    "12/8": ["dottedMinim", "dottedMinim"],
  }[timeSignature.id] || ["semibreve"];
}

function makePreviewBassNotesForBar(chord, timeSignature, pattern = null) {
  const rhythms = pattern || previewBassPatternForTimeSignature(timeSignature);
  let beatPosition = 0;
  return rhythms.map((rhythm) => {
    const beats = rhythmInfo(rhythm).beats;
    const restKey = previewRestKeyForRhythm(rhythm, timeSignature);
    const commonValues = {
      rhythm,
      beats,
      beatPosition,
    };
    beatPosition += beats;

    if (mustGenerateRestForRhythm(rhythm, timeSignature) && restKey) {
      return {
        ...commonValues,
        restKey,
        step: 4,
      };
    }
    return {
      ...previewBassRootForChord(chord, rhythm),
      ...commonValues,
    };
  });
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

function previewRestKeyForRhythm(rhythmId, timeSignature = null) {
  if (timeSignature && rhythmInfo(rhythmId).beats === timeSignature.beats) return "wholeRest";
  if (rhythmId === "semibreve") return "wholeRest";
  if (rhythmId === "minim" || rhythmId === "dottedMinim") return "halfRest";
  if (rhythmId === "crotchet" || rhythmId === "dottedCrotchet") return "quarterRest";
  if (rhythmId === "quaver" || rhythmId === "dottedQuaver") return "eighthRest";
  if (rhythmId === "semiquaver") return "sixteenthRest";
  return null;
}

function canGenerateRest(rhythmId, timeSignature = null) {
  const restKey = previewRestKeyForRhythm(rhythmId, timeSignature);
  return restKey && previewCanUseSymbol(restKey);
}

function rhythmNeedsDot(rhythmId) {
  return Boolean(rhythmInfo(rhythmId).dotted);
}

function canGenerateDotForRhythm(rhythmId) {
  return !rhythmNeedsDot(rhythmId)
    || previewCanUseSymbol("augmentationDotLine")
    || previewCanUseSymbol("augmentationDotSpace");
}

function canGenerateNoteRhythm(rhythmId) {
  if (!canGenerateDotForRhythm(rhythmId)) return false;
  if (rhythmId === "semibreve") return previewCanUseSymbol("wholeNote");
  if (rhythmId === "minim" || rhythmId === "dottedMinim") {
    return previewCanUseSymbol("halfNoteStemUp") || previewCanUseSymbol("halfNoteStemDown");
  }
  if (rhythmId === "crotchet" || rhythmId === "dottedCrotchet") {
    return previewCanUseSymbol("quarterNoteStemUp") || previewCanUseSymbol("quarterNoteStemDown");
  }
  if (rhythmId === "quaver" || rhythmId === "dottedQuaver") {
    return previewCanUseSymbol("eighthNoteStemUp") || previewCanUseSymbol("eighthNoteStemDown");
  }
  if (rhythmId === "semiquaver") {
    return previewCanUseSymbol("sixteenthNoteStemUp") || previewCanUseSymbol("sixteenthNoteStemDown");
  }
  return false;
}

function canGenerateRestRhythm(rhythmId, timeSignature = null) {
  return canGenerateDotForRhythm(rhythmId) && canGenerateRest(rhythmId, timeSignature);
}

function timeSignatureAllowsSemiquavers(timeSignature = null) {
  return !["9/8", "12/8"].includes(timeSignature?.id);
}

function canGenerateRhythm(rhythmId, timeSignature = null) {
  if (rhythmId === "semiquaver" && !timeSignatureAllowsSemiquavers(timeSignature)) return false;
  return canGenerateNoteRhythm(rhythmId) || canGenerateRestRhythm(rhythmId, timeSignature);
}

function mustGenerateRestForRhythm(rhythmId, timeSignature = null) {
  return !canGenerateNoteRhythm(rhythmId) && canGenerateRestRhythm(rhythmId, timeSignature);
}

function patternBeats(pattern) {
  return pattern.reduce((sum, id) => sum + rhythmInfo(id).beats, 0);
}

function validPreviewPatterns(timeSignature) {
  const patterns = PREVIEW_RHYTHM_PATTERNS[timeSignature.id] || PREVIEW_RHYTHM_PATTERNS["4/4"];
  return patterns.filter((pattern) => (
    patternBeats(pattern) === timeSignature.beats
    && patternRespectsCompoundGroupings(pattern, timeSignature)
    && pattern.every((rhythmId) => canGenerateRhythm(rhythmId, timeSignature))
  ));
}

function fillPatternToTimeSignature(unit, timeSignature) {
  const pattern = [...unit];
  let remaining = timeSignature.beats - patternBeats(pattern);
  while (remaining >= 1) {
    pattern.push("crotchet");
    remaining -= 1;
  }
  if (remaining === 0.5) pattern.push("quaver");
  return patternBeats(pattern) === timeSignature.beats
    && patternRespectsCompoundGroupings(pattern, timeSignature)
    && pattern.every((rhythmId) => canGenerateRhythm(rhythmId, timeSignature))
    ? pattern
    : null;
}

const FORCED_SYMBOL_PATTERNS = {
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
  tieStemUp: [["crotchet", "crotchet"]],
  tieStemDown: [["crotchet", "crotchet"]],
  wholeRest: [["semibreve"]],
  halfRest: [["minim"]],
  quarterRest: [["crotchet"]],
  eighthRest: [["quaver", "quaver"]],
  sixteenthRest: [["semiquaver", "semiquaver", "quaver"]],
  scoreAccidentals: [["crotchet"]],
  flatInScore: [["crotchet"]],
  naturalInScore: [["crotchet"]],
  sharpInScore: [["crotchet"]],
  ledgerLines: [["crotchet"]],
  ledgerLineAccidentals: [["crotchet"]],
};

function forcedPatternForSymbol(symbolKey, timeSignature) {
  const candidates = FORCED_SYMBOL_PATTERNS[symbolKey] || [];
  for (const unit of candidates) {
    const pattern = fillPatternToTimeSignature(unit, timeSignature);
    if (pattern) return pattern;
  }
  return null;
}

function keyForGeneratedSymbol(symbolKey) {
  const keys = enabledKeyChoices();
  if (symbolKey === "keySignatureAccidentals") return randomItem(keys.filter((key) => Object.values(key.keyAccidentals).some((value) => value !== 0)));
  if (symbolKey === "flatKeySignature") return randomItem(keys.filter((key) => Object.values(key.keyAccidentals).some((value) => value < 0)));
  if (symbolKey === "sharpKeySignature" || symbolKey === "ledgerLineAccidentals") return randomItem(keys.filter((key) => Object.values(key.keyAccidentals).some((value) => value > 0)));
  if (symbolKey === "flatInScore") return randomItem(keys.filter((key) => Object.values(key.keyAccidentals).some((value) => value < 0)));
  if (symbolKey === "sharpInScore") return randomItem(keys.filter((key) => Object.values(key.keyAccidentals).some((value) => value > 0)));
  return null;
}

function keySignatureAllowed(key) {
  return true;
}

function enabledKeyChoices() {
  const choices = PREVIEW_KEYS.filter((key) => keyEnabled(key) && keySignatureAllowed(key));
  return choices.length ? choices : PREVIEW_KEYS.filter((key) => key.id === "C");
}

function enabledPreviewKeyChoicesForShuffle() {
  return enabledKeyChoices();
}

function enabledTimeSignatureChoices(requiredSymbolKey = "") {
  const choices = PREVIEW_TIME_SIGNATURES.filter((item) => (
    timeSignatureEnabled(item)
    && (!requiredSymbolKey || forcedPatternForSymbol(requiredSymbolKey, item))
    && validPreviewPatterns(item).length
  ));
  if (choices.length) return choices;
  const fallback = PREVIEW_TIME_SIGNATURES.filter((item) => item.id === "4/4" && validPreviewPatterns(item).length);
  return fallback.length ? fallback : PREVIEW_TIME_SIGNATURES.filter((item) => validPreviewPatterns(item).length);
}

function selectedTimeSignaturesForRules() {
  const selected = PREVIEW_TIME_SIGNATURES.filter((item) => timeSignatureEnabled(item));
  return selected.length ? selected : PREVIEW_TIME_SIGNATURES.filter((item) => item.id === "4/4");
}

function withTemporaryGeneratedSymbol(key, value, callback) {
  const generatedKey = generatedKeyForSymbol(key);
  const previous = generatedSymbols[generatedKey];
  generatedSymbols[generatedKey] = value;
  try {
    return callback();
  } finally {
    generatedSymbols[generatedKey] = previous;
  }
}

function symbolGenerationDisabledReason(key) {
  if (key === "wholeRest") return "";
  if (!FORCED_SYMBOL_PATTERNS[key]) return "";
  const possible = withTemporaryGeneratedSymbol(key, true, () => (
    selectedTimeSignaturesForRules().some((timeSignature) => forcedPatternForSymbol(key, timeSignature))
  ));
  return possible ? "" : "This cannot fit the selected time signature.";
}

function symbolGenerationDisabled(key) {
  return Boolean(symbolGenerationDisabledReason(key));
}

function reconcileGeneratedSymbolChoices() {
  Object.keys(generatedSymbols).forEach((key) => {
    if (symbolGenerationDisabled(key)) generatedSymbols[key] = false;
  });
}

function visibleGeneratedSymbolKeys() {
  return Object.values(GENERATED_SYMBOL_GROUPS)
    .flatMap((options) => options.flatMap((option) => generatedOptionKeys(option)))
    .filter((key) => hasRenderableSymbol(key));
}

function allGeneratedControlsEnabled() {
  return visibleGeneratedSymbolKeys().every((key) => generatedEnabled(key))
    && PREVIEW_KEYS.every((item) => keyEnabled(item))
    && PREVIEW_TIME_SIGNATURES.every((item) => timeSignatureEnabled(item));
}

function setGeneratedSection(sectionKind, keys, checked) {
  if (sectionKind === "timeSignature") {
    keys.forEach((key) => {
      generatedTimeSignatures[key] = checked;
    });
    if (!enabledTimeSignatureCount()) generatedTimeSignatures["4/4"] = true;
    return;
  }

  if (sectionKind === "key") {
    keys.forEach((key) => {
      generatedKeys[key] = checked;
    });
    if (!enabledKeyCount()) generatedKeys.C = true;
    return;
  }

  keys.forEach((key) => {
    generatedSymbols[key] = checked;
  });
  if (keys.some((key) => key === "gClef" || key === "fClef") && !enabledClefCount()) {
    generatedSymbols.gClef = true;
  }
}

function enableEveryGeneratedControl() {
  setGeneratedSection("symbol", visibleGeneratedSymbolKeys(), true);
  setGeneratedSection("key", PREVIEW_KEYS.map((item) => item.id), true);
  setGeneratedSection("timeSignature", PREVIEW_TIME_SIGNATURES.map((item) => item.id), true);
}

function disableEveryGeneratedControl() {
  setGeneratedSection("symbol", visibleGeneratedSymbolKeys(), false);
  setGeneratedSection("key", PREVIEW_KEYS.map((item) => item.id), false);
  setGeneratedSection("timeSignature", PREVIEW_TIME_SIGNATURES.map((item) => item.id), false);
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
  const barCount = previewBarCount();
  for (let index = 1; index < barCount - 1; index += 1) {
    const available = middleOptions.filter((symbol) => symbol !== progression[index - 1]);
    progression.push(randomItem(available));
  }
  const finalOptions = ["I", "V"].filter((symbol) => symbol !== progression[progression.length - 1]);
  if (barCount > 1) progression.push(randomItem(finalOptions));
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
    "5/4": [["dottedMinim", "minim"], ["minim", "dottedMinim"]],
    "6/8": [["dottedMinim"]],
    "9/8": [["dottedMinim", "crotchet", "quaver"]],
    "12/8": [["dottedMinim", "dottedMinim"]],
  };
  const validPatterns = validPreviewPatterns(timeSignature);
  const validFinalPatterns = (finalPatterns[timeSignature.id] || []).filter((pattern) => (
    patternBeats(pattern) === timeSignature.beats
    && patternRespectsCompoundGroupings(pattern, timeSignature)
    && pattern.every((rhythmId) => canGenerateRhythm(rhythmId, timeSignature))
  ));
  const patternChoices = barIndex === previewBarCount() - 1 && validFinalPatterns.length
    ? validFinalPatterns
    : validPatterns;
  const forcedPattern = barIndex === 0 ? options.forcedPattern : null;
  const pattern = forcedPattern || randomItem(patternChoices);
  if (!pattern) return { notes: [], pattern: [], lastIndex: previousIndex };
  const accidentalMemory = {};
  let beatPosition = 0;
  let currentIndex = clamp(previousIndex, 0, PREVIEW_NOTE_POOL.length - 1);
  let previousNote = PREVIEW_NOTE_POOL[currentIndex] || previewNoteByLetter(key.tonic, 6);
  const phraseAnchorIndex = currentIndex;
  const phraseDirection = barIndex < 4 ? 1 : -1;

  const notes = pattern.map((patternRhythmId, noteIndex) => {
    let rhythmId = patternRhythmId;
    let beats = rhythmInfo(rhythmId).beats;
    const strongBeat = beatPosition === 0 || beatPosition === 2 || beatPosition === 3;
    const restKey = previewRestKeyForRhythm(rhythmId, timeSignature);
    const forceRest = options.forceRestKey
      && barIndex === 0
      && previewRestKeyForRhythm(rhythmId, timeSignature) === options.forceRestKey
      && !options.usedForcedRest;
    const forceAccidentalOnThisNote = barIndex === 0
      && noteIndex === 0
      && (options.forceLedgerLineAccidental || options.forceScoreAccidental);
    const mustUseRest = mustGenerateRestForRhythm(rhythmId, timeSignature);
    const mayUseRest = (mustUseRest || forceRest || canGenerateRestRhythm(rhythmId, timeSignature))
      && !forceAccidentalOnThisNote
      && (mustUseRest || forceRest || Math.random() < 0.35);

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
    if (barIndex === previewBarCount() - 1 && noteIndex === pattern.length - 1) {
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

  const barIsOnlyRests = notes.length > 0
    && notes.every((note) => note.restKey)
    && Math.abs(notes.reduce((sum, note) => sum + Number(note.beats || 0), 0) - timeSignature.beats) < 0.001;

  if (barIsOnlyRests && generatedEnabled("wholeRest")) {
    return {
      notes: [{
        id: `${barIndex}-whole-bar-rest`,
        barIndex,
        noteIndex: 0,
        rhythm: "semibreve",
        beats: timeSignature.beats,
        beatPosition: 0,
        restKey: "wholeRest",
        step: 4,
        wholeBarRest: true,
      }],
      pattern,
      lastIndex: currentIndex,
    };
  }

  return { notes, pattern, lastIndex: currentIndex };
}

function melodyOptionsForRequiredSymbol(requiredSymbolKey) {
  return {
    forcedPattern: null,
    forceRestKey: requiredSymbolKey.endsWith("Rest") ? requiredSymbolKey : "",
    forceDotKey: requiredSymbolKey === "augmentationDotLine" || requiredSymbolKey === "augmentationDotSpace" ? requiredSymbolKey : "",
    forceLedgerLineNote: requiredSymbolKey === "ledgerLines"
      || requiredSymbolKey === "ledgerLineAccidentals",
    forceLedgerLineAccidental: requiredSymbolKey === "ledgerLineAccidentals",
    forceScoreAccidental: ["flatInScore", "naturalInScore", "sharpInScore", "scoreAccidentals"].includes(requiredSymbolKey)
      ? randomItem(["flatInScore", "naturalInScore", "sharpInScore"])
      : "",
  };
}

function enabledRequiredMelodySymbols(timeSignature) {
  return Object.keys(FORCED_SYMBOL_PATTERNS).filter((key) => (
    generatedEnabled(key)
    && forcedPatternForSymbol(key, timeSignature)
  ));
}

function randomBarIndex() {
  return Math.floor(Math.random() * previewBarCount());
}

function randomUnusedBarIndex(usedBars) {
  const available = Array.from({ length: previewBarCount() }, (_, index) => index)
    .filter((index) => !usedBars.has(index));
  if (!available.length) return null;
  const barIndex = randomItem(available);
  usedBars.add(barIndex);
  return barIndex;
}

function shuffledCopy(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function randomSubset(items, maxCount) {
  if (!items.length) return [];
  const limit = Math.min(maxCount, items.length);
  const count = Math.floor(Math.random() * (limit + 1));
  return shuffledCopy(items).slice(0, count);
}

function randomScoreNotePlacement(bars, predicate = () => true) {
  const choices = [];
  const visibleStaffs = previewVisibleStaffs();
  bars.forEach((bar) => {
    if (visibleStaffs.includes("treble")) {
      bar.notes.forEach((note, noteIndex) => {
        const placement = { staff: "treble", barIndex: bar.barIndex, noteIndex };
        if (!note.restKey && predicate(note, placement)) choices.push(placement);
      });
    }
    if (visibleStaffs.includes("bass")) {
      (bar.bassNotes || []).forEach((note, noteIndex) => {
        const placement = { staff: "bass", barIndex: bar.barIndex, noteIndex };
        if (!note.restKey && predicate(note, placement)) choices.push(placement);
      });
    }
  });
  return choices.length ? randomItem(choices) : null;
}

function noteAlreadyHasAccidental(note) {
  return note
    && (
      (note.accidental !== null && note.accidental !== undefined)
      || (note.optionalAccidental !== null && note.optionalAccidental !== undefined)
    );
}

function articulationNeedsStemDown(key) {
  if (key === "accentAbove" || key === "staccatoAbove") return true;
  if (key === "accentBelow" || key === "staccatoBelow") return false;
  return null;
}

function notesHaveSamePitch(first, second) {
  return first
    && second
    && !first.restKey
    && !second.restKey
    && first.letter === second.letter
    && first.octave === second.octave
    && first.step === second.step;
}

function tieDirectionAllowed(stemDown) {
  return stemDown ? generatedEnabled("tieStemDown") : generatedEnabled("tieStemUp");
}

function slurDirectionAllowed(stemDown) {
  return stemDown ? generatedEnabled("slurStemDown") : generatedEnabled("slurStemUp");
}

function notesHaveDifferentLetters(first, second) {
  return first
    && second
    && !first.restKey
    && !second.restKey
    && first.letter
    && second.letter
    && first.letter !== second.letter;
}

function nearbyDifferentLetterNote(note, direction = 1) {
  const noteIndex = previewNoteIndex(note);
  const candidates = direction >= 0
    ? PREVIEW_NOTE_POOL.slice(noteIndex + 1)
    : PREVIEW_NOTE_POOL.slice(0, Math.max(0, noteIndex)).reverse();
  return candidates.find((candidate) => candidate.letter !== note.letter)
    || PREVIEW_NOTE_POOL.find((candidate) => candidate.letter !== note.letter)
    || null;
}

function randomTiePlacement(bars) {
  const choices = [];
  const visibleStaffs = previewVisibleStaffs();
  bars.forEach((bar) => {
    [
      { staff: "treble", notes: bar.notes },
      { staff: "bass", notes: bar.bassNotes || [] },
    ].filter((item) => visibleStaffs.includes(item.staff)).forEach((item) => {
      for (let noteIndex = 0; noteIndex < item.notes.length - 1; noteIndex += 1) {
        const first = item.notes[noteIndex];
        const second = item.notes[noteIndex + 1];
        const stemDown = previewStemDown(first.step);
        if (notesHaveSamePitch(first, second) && tieDirectionAllowed(stemDown)) {
          choices.push({ staff: item.staff, barIndex: bar.barIndex, indexes: [noteIndex, noteIndex + 1], stemDown });
        }
      }
    });
  });
  if (choices.length) return randomItem(choices);

  const writableChoices = [];
  bars.forEach((bar) => {
    [
      { staff: "treble", notes: bar.notes },
      { staff: "bass", notes: bar.bassNotes || [] },
    ].filter((item) => visibleStaffs.includes(item.staff)).forEach((item) => {
      for (let noteIndex = 0; noteIndex < item.notes.length - 1; noteIndex += 1) {
        const first = item.notes[noteIndex];
        const second = item.notes[noteIndex + 1];
        if (!first || !second || first.restKey || second.restKey) continue;
        const stemDown = previewStemDown(first.step);
        if (tieDirectionAllowed(stemDown)) writableChoices.push({ bar, staff: item.staff, notes: item.notes, indexes: [noteIndex, noteIndex + 1], stemDown });
      }
    });
  });

  const choice = writableChoices.length ? randomItem(writableChoices) : null;
  if (!choice) {
    const fallbackChoices = [];
    bars.forEach((bar) => {
      [
        { staff: "treble", notes: bar.notes },
        { staff: "bass", notes: bar.bassNotes || [] },
      ].filter((item) => visibleStaffs.includes(item.staff)).forEach((item) => {
        for (let noteIndex = 0; noteIndex < item.notes.length - 1; noteIndex += 1) {
          const first = item.notes[noteIndex];
          const second = item.notes[noteIndex + 1];
          if (!first || !second || first.restKey || second.restKey) continue;
          fallbackChoices.push({ bar, staff: item.staff, notes: item.notes, indexes: [noteIndex, noteIndex + 1] });
        }
      });
    });
    const fallback = fallbackChoices.length ? randomItem(fallbackChoices) : null;
    if (!fallback) return null;
    const stemDown = generatedEnabled("tieStemDown") && !generatedEnabled("tieStemUp");
    const note = stemDown
      ? { letter: "D", octave: 5, step: 6, midi: 74 }
      : { letter: "E", octave: 4, step: 0, midi: 64 };
    fallback.notes[fallback.indexes[0]] = { ...fallback.notes[fallback.indexes[0]], ...note, accidental: null };
    fallback.notes[fallback.indexes[1]] = { ...fallback.notes[fallback.indexes[1]], ...note, accidental: null };
    return {
      staff: fallback.staff,
      barIndex: fallback.bar.barIndex,
      indexes: fallback.indexes,
      stemDown,
    };
  }
  const first = choice.notes[choice.indexes[0]];
  const second = choice.notes[choice.indexes[1]];
  Object.assign(second, {
    letter: first.letter,
    octave: first.octave,
    step: first.step,
    midi: first.midi,
    accidental: null,
  });
  return {
    staff: choice.staff,
    barIndex: choice.bar.barIndex,
    indexes: choice.indexes,
    stemDown: choice.stemDown,
  };
}

function randomSlurPlacement(bars) {
  const choices = [];
  const visibleStaffs = previewVisibleStaffs();
  bars.forEach((bar) => {
    [
      { staff: "treble", notes: bar.notes },
      { staff: "bass", notes: bar.bassNotes || [] },
    ].filter((item) => visibleStaffs.includes(item.staff)).forEach((item) => {
      for (let noteIndex = 0; noteIndex < item.notes.length - 1; noteIndex += 1) {
        const first = item.notes[noteIndex];
        const second = item.notes[noteIndex + 1];
        const stemDown = previewStemDown(first?.step ?? 0);
        if (notesHaveDifferentLetters(first, second) && slurDirectionAllowed(stemDown)) {
          choices.push({ staff: item.staff, barIndex: bar.barIndex, indexes: [noteIndex, noteIndex + 1], stemDown });
        }
      }
    });
  });
  if (choices.length) return randomItem(choices);

  const writableChoices = [];
  bars.forEach((bar) => {
    [
      { staff: "treble", notes: bar.notes },
      { staff: "bass", notes: bar.bassNotes || [] },
    ].filter((item) => visibleStaffs.includes(item.staff)).forEach((item) => {
      for (let noteIndex = 0; noteIndex < item.notes.length - 1; noteIndex += 1) {
        const first = item.notes[noteIndex];
        const second = item.notes[noteIndex + 1];
        if (!first || !second || first.restKey || second.restKey) continue;
        const stemDown = previewStemDown(first.step);
        if (slurDirectionAllowed(stemDown)) writableChoices.push({ bar, staff: item.staff, notes: item.notes, indexes: [noteIndex, noteIndex + 1], stemDown });
      }
    });
  });

  const choice = writableChoices.length ? randomItem(writableChoices) : null;
  if (!choice) return null;
  const first = choice.notes[choice.indexes[0]];
  const replacement = nearbyDifferentLetterNote(first, 1);
  if (!replacement) return null;
  Object.assign(choice.notes[choice.indexes[1]], {
    letter: replacement.letter,
    octave: replacement.octave,
    step: replacement.step,
    midi: replacement.midi,
    accidental: null,
  });
  return {
    staff: choice.staff,
    barIndex: choice.bar.barIndex,
    indexes: choice.indexes,
    stemDown: choice.stemDown,
  };
}

function firstPlayableNoteIndex(notes) {
  return notes.findIndex((note) => note && !note.restKey);
}

function lastPlayableNoteIndex(notes) {
  for (let index = notes.length - 1; index >= 0; index -= 1) {
    if (notes[index] && !notes[index].restKey) return index;
  }
  return -1;
}

function phraseStemDownFromMajority(bars, staff, startBarIndex, startNoteIndex, endBarIndex, endNoteIndex) {
  let stemUpCount = 0;
  let stemDownCount = 0;

  for (let barIndex = startBarIndex; barIndex <= endBarIndex; barIndex += 1) {
    const bar = bars[barIndex];
    if (!bar) continue;
    const notes = notesForPlacement(bar, staff);
    const firstIndex = barIndex === startBarIndex ? startNoteIndex : 0;
    const lastIndex = barIndex === endBarIndex ? endNoteIndex : notes.length - 1;

    for (let noteIndex = firstIndex; noteIndex <= lastIndex; noteIndex += 1) {
      const note = notes[noteIndex];
      if (!note || note.restKey) continue;
      if (previewStemDown(note.step)) {
        stemDownCount += 1;
      } else {
        stemUpCount += 1;
      }
    }
  }

  if (stemDownCount > stemUpCount) return true;
  if (stemUpCount > stemDownCount) return false;

  const startBar = bars[startBarIndex];
  const startNote = startBar ? notesForPlacement(startBar, staff)[startNoteIndex] : null;
  return previewStemDown(startNote?.step ?? 0);
}

function randomPhrasePlacement(bars) {
  const choices = [];
  const visibleStaffs = previewVisibleStaffs();
  activePreviewSystemTops().forEach((_, systemIndex) => {
    const systemStartBar = systemIndex * PREVIEW.barsPerSystem;
    const systemEndBar = Math.min(systemStartBar + PREVIEW.barsPerSystem - 1, previewBarCount() - 1);
    if (systemEndBar - systemStartBar < 1) return;
    visibleStaffs.forEach((staff) => {
      const startBar = bars[systemStartBar];
      const endBar = bars[systemEndBar];
      const startNotes = notesForPlacement(startBar, staff);
      const endNotes = notesForPlacement(endBar, staff);
      const startNoteIndex = firstPlayableNoteIndex(startNotes);
      const endNoteIndex = lastPlayableNoteIndex(endNotes);
      if (startNoteIndex < 0 || endNoteIndex < 0) return;
      choices.push({
        staff,
        startBarIndex: systemStartBar,
        startNoteIndex,
        endBarIndex: systemEndBar,
        endNoteIndex,
        stemDown: phraseStemDownFromMajority(bars, staff, systemStartBar, startNoteIndex, systemEndBar, endNoteIndex),
      });
    });
  });
  return choices.length ? randomItem(choices) : null;
}

function makeOptionalPlacements(bars) {
  const placements = [];
  const usedArticulationNotes = new Set();
  const usedDynamicBars = new Set();

  shuffledCopy(["accentAbove", "accentBelow", "staccatoAbove", "staccatoBelow"].filter((key) => generatedEnabled(key))).forEach((key) => {
    const requiredStemDown = articulationNeedsStemDown(key);
    const note = randomScoreNotePlacement(bars, (candidate, placement) => {
      const noteId = `${placement.staff}-${placement.barIndex}-${placement.noteIndex}`;
      return !usedArticulationNotes.has(noteId)
        && (requiredStemDown === null || previewStemDown(candidate.step) === requiredStemDown);
    });
    if (note) {
      usedArticulationNotes.add(`${note.staff}-${note.barIndex}-${note.noteIndex}`);
      placements.push({ type: "articulation", key, ...note });
    }
  });

  const enabledScoreAccidentals = [
    { key: "flatInScore", value: -1 },
    { key: "naturalInScore", value: 0 },
    { key: "sharpInScore", value: 1 },
  ].filter((item) => generatedEnabled(item.key));

  shuffledCopy(enabledScoreAccidentals).slice(0, 2).forEach((item) => {
    const placement = randomScoreNotePlacement(bars, (note) => !noteAlreadyHasAccidental(note));
    if (!placement) return;
    const notes = placement.staff === "bass"
      ? bars[placement.barIndex]?.bassNotes || []
      : bars[placement.barIndex]?.notes || [];
    const note = notes[placement.noteIndex];
    if (!note || noteAlreadyHasAccidental(note)) return;
    note.optionalAccidental = item.value;
    placements.push({ type: "accidental", value: item.value, ...placement });
  });

  shuffledCopy(["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato"].filter((key) => generatedEnabled(key))).forEach((key) => {
    const barIndex = randomUnusedBarIndex(usedDynamicBars);
    if (barIndex !== null) placements.push({ type: "dynamic", key, barIndex });
  });

  shuffledCopy(["crescendo", "diminuendo"].filter((key) => generatedEnabled(key))).forEach((key) => {
    const barIndex = randomUnusedBarIndex(usedDynamicBars);
    if (barIndex !== null) placements.push({ type: "hairpin", key, barIndex });
  });

  if (generatedEnabled("tieStemUp") || generatedEnabled("tieStemDown")) {
    const tie = randomTiePlacement(bars);
    if (tie) placements.push({ type: "tie", ...tie });
  }

  if (generatedEnabled("slurStemUp") || generatedEnabled("slurStemDown")) {
    const slur = randomSlurPlacement(bars);
    if (slur) placements.push({ type: "slur", ...slur });
  }

  if (generatedEnabled("phraseMarking")) {
    const phrase = randomPhrasePlacement(bars);
    if (phrase) placements.push({ type: "phrase", barIndex: phrase.startBarIndex, ...phrase });
  }

  if (generatedEnabled("repeatLeft")) {
    const startRepeatBars = previewBarCount() > PREVIEW.barsPerSystem ? [0, PREVIEW.barsPerSystem] : [0];
    placements.push({ type: "repeat", key: "repeatLeft", barIndex: randomItem(startRepeatBars) });
  }

  if (generatedEnabled("repeatRight")) {
    const endRepeatBars = [
      Math.min(PREVIEW.barsPerSystem - 1, previewBarCount() - 1),
      previewBarCount() - 1,
    ].filter((barIndex, index, items) => barIndex >= 0 && items.indexOf(barIndex) === index);
    placements.push({ type: "repeat", key: "repeatRight", barIndex: randomItem(endRepeatBars) });
  }

  return placements;
}

function makeHigherPreviewQuestion(requiredSymbolKey = "") {
  const timeSignatureChoices = enabledTimeSignatureChoices(requiredSymbolKey);
  const timeSignature = randomItem(timeSignatureChoices.length ? timeSignatureChoices : PREVIEW_TIME_SIGNATURES);
  const key = keyForGeneratedSymbol(requiredSymbolKey) || randomItem(enabledPreviewKeyChoicesForShuffle());
  const requiredSymbols = requiredSymbolKey
    ? [requiredSymbolKey]
    : enabledRequiredMelodySymbols(timeSignature);
  const progression = makePreviewChordProgression();
  let previousIndex = previewNotePoolIndex(previewNoteByLetter(key.tonic, 6));
  const bars = progression.map((symbol, barIndex) => {
    const barRequiredSymbol = requiredSymbols[barIndex] || "";
    const melodyOptions = melodyOptionsForRequiredSymbol(barRequiredSymbol);
    melodyOptions.forcedPattern = forcedPatternForSymbol(barRequiredSymbol, timeSignature);
    const melody = makePreviewMelodyForBar(key, symbol, barIndex, previousIndex, timeSignature, melodyOptions);
    previousIndex = melody.lastIndex;
    return {
      barIndex,
      chordSymbol: symbol,
      chord: key.chords[symbol],
      notes: melody.notes,
      bassNotes: makePreviewBassNotesForBar(key.chords[symbol], timeSignature, melody.pattern),
    };
  });
  return {
    id: Math.random().toString(36).slice(2),
    key,
    timeSignature,
    timeSignatureKey: timeSignature.symbolKey,
    targetBars: [5, 6],
    bars,
    optionalPlacements: makeOptionalPlacements(bars),
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
  slurStemUp: { staff: "treble", xScale: 54, step: 0 },
  slurStemDown: { staff: "treble", xScale: 54, step: 8 },
  phraseMarking: { staff: "treble", xScale: 54, step: 10 },
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
    if ((key === "slurStemUp" || key === "slurStemDown" || key === "phraseMarking") && config.symbols.tie) {
      config.symbols[key] = cloneConfig(config.symbols.tie);
      return config.symbols[key];
    }
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

function drawSymbol(parent, ctx, key, x, y, interactive, settingOverrides = {}) {
  const symbol = BRAVURA_SYMBOLS[actualSymbolKey(key)];
  const timeSignature = TIME_SIGNATURES[key];
  if (!symbol && !timeSignature) return null;

  const settings = { ...symbolConfig(settingsKeyForDrawing(key)), ...settingOverrides };
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
  if (key === "slurStemUp") {
    drawSymbol(parent, ctx, "quarterNoteStemUp", point.x - px(ctx, 2), yForStep(ctx, layout.trebleTop, 0), false);
    drawSymbol(parent, ctx, "quarterNoteStemUp", point.x + px(ctx, 2), yForStep(ctx, layout.trebleTop, 1), false);
  }
  if (key === "slurStemDown") {
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x - px(ctx, 2), yForStep(ctx, layout.trebleTop, 7), false);
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x + px(ctx, 2), yForStep(ctx, layout.trebleTop, 6), false);
  }
  if (key === "phraseMarking") {
    [0, 1, 2, 3].forEach((index) => {
      drawSymbol(parent, ctx, "quarterNoteStemUp", point.x - px(ctx, 6) + px(ctx, index * 4), yForStep(ctx, layout.trebleTop, index % 2 === 0 ? 2 : 4), false);
    });
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
  renderHigherPreview(stage, { showBarNumbers: controls.showBarNumbers.checked });
}

function previewSnapshot() {
  return Object.fromEntries(
    Object.entries(PREVIEW).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])
  );
}

function restorePreview(snapshot) {
  Object.entries(snapshot).forEach(([key, value]) => {
    PREVIEW[key] = Array.isArray(value) ? [...value] : value;
  });
}

function applyProportionalPreviewOffsets() {
  PREVIEW.keySigX = PREVIEW.staffLeft + PREVIEW_LAYOUT_OFFSETS.keySignature;
  PREVIEW.timeSigX = PREVIEW.staffLeft + PREVIEW_LAYOUT_OFFSETS.timeSignature;
  PREVIEW.musicStartX = PREVIEW.staffLeft + PREVIEW_LAYOUT_OFFSETS.musicStart;
}

function applyPreviewBarDisplayLayout() {
  const barCount = previewBarCount();
  const visibility = previewStaffVisibility();

  if (barCount === 1) {
    Object.assign(PREVIEW, {
      staffLeft: 130,
      staffRight: 790,
      systemTops: [visibility.grand ? 112 : 112],
      bassStaffOffset: visibility.grand ? 80 : 86,
      gap: 10,
    });
    applyProportionalPreviewOffsets();
    return;
  }

  if (barCount === 4) {
    Object.assign(PREVIEW, {
      staffLeft: 72,
      staffRight: 848,
      systemTops: [visibility.grand ? 100 : 90],
      bassStaffOffset: visibility.grand ? 80 : 86,
      gap: 10,
    });
    applyProportionalPreviewOffsets();
    return;
  }

  Object.assign(PREVIEW, {
    staffLeft: 42,
    staffRight: 878,
    systemTops: visibility.grand ? [86, 260] : [76, 240],
    bassStaffOffset: visibility.grand ? 80 : 86,
    gap: 10,
  });
  applyProportionalPreviewOffsets();
}

function previewYForStep(step, top) {
  return top + PREVIEW.gap * 4 - step * (PREVIEW.gap / 2);
}

function previewFirstSystemBarWidth() {
  return (PREVIEW.staffRight - PREVIEW.musicStartX) / previewBarsOnSystem(0);
}

function previewSecondSystemStartX() {
  return PREVIEW.timeSigX - 18;
}

function previewSecondSystemBarWidth() {
  return (PREVIEW.staffRight - previewSecondSystemStartX()) / Math.max(1, previewBarsOnSystem(1));
}

function previewBarWidth(barIndex) {
  return previewSystemIndexForBar(barIndex) >= 1 ? previewSecondSystemBarWidth() : previewFirstSystemBarWidth();
}

function previewBarStart(barIndex) {
  const localIndex = barIndex % PREVIEW.barsPerSystem;
  const systemStart = previewSystemStartX(previewSystemIndexForBar(barIndex));
  return systemStart + localIndex * previewBarWidth(barIndex);
}

function previewSystemTop(barIndex) {
  return PREVIEW.systemTops[previewSystemIndexForBar(barIndex)] || PREVIEW.systemTops[0];
}

function previewBassTop(trebleTop) {
  return trebleTop + PREVIEW.bassStaffOffset;
}

function previewStaffVisibility() {
  const trebleSelected = generatedEnabled("gClef");
  const bassSelected = generatedEnabled("fClef");
  return {
    treble: trebleSelected || !bassSelected,
    bass: bassSelected,
    grand: trebleSelected && bassSelected,
  };
}

function previewVisibleStaffs() {
  const visibility = previewStaffVisibility();
  const staffs = [];
  if (visibility.treble) staffs.push("treble");
  if (visibility.bass) staffs.push("bass");
  return staffs;
}

function previewStaffTopForSystem(top, staff) {
  const visibility = previewStaffVisibility();
  if (staff === "bass" && visibility.grand) return previewBassTop(top);
  return top;
}

function previewStaffTopForBar(barIndex, staff) {
  return previewStaffTopForSystem(previewSystemTop(barIndex), staff);
}

function previewLowestStaffTopForSystem(top) {
  const visibility = previewStaffVisibility();
  return visibility.grand ? previewBassTop(top) : top;
}

function previewLowestStaffTopForBar(barIndex) {
  return previewLowestStaffTopForSystem(previewSystemTop(barIndex));
}

function previewRhythmSpacing(rhythm) {
  return rhythmInfo(rhythm).spacing;
}

function previewBarNotePositions(barIndex, notes) {
  const start = previewBarStart(barIndex);
  const end = start + previewBarWidth(barIndex);
  const startX = start + (barIndex === 0 ? 4 : barIndex < 4 ? 15 : 19);
  const endX = barIndex === previewBarCount() - 1 ? end - 24 : end - 4;
  const totalBeats = notes.reduce((sum, note) => sum + Number(note.beats || 0), 0);
  const units = notes.reduce((sum, note) => sum + previewRhythmSpacing(note.rhythm), 0);
  const unit = Math.max(1, endX - startX) / Math.max(1, units);
  let cursor = startX + unit * 0.38;
  return notes.map((note) => {
    if (note.restKey === "wholeRest" && Number(note.beats || 0) === totalBeats) {
      return startX + (endX - startX) / 2;
    }
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

function previewRenderCurve(parent, key, firstX, firstY, secondX, secondY, stemDown, options = {}) {
  const settings = symbolConfig(key);
  const direction = stemDown ? -1 : 1;
  const sizeRatio = clamp(Number(settings.fontSizeScale || 5.3) / 5.3, 0.55, 1.8);
  const widthRatio = clamp(Number(settings.widthScale || 1), 0.35, 2.5);
  const heightRatio = clamp(Number(settings.heightScale || 1), 0.35, 2.5);
  const xOffset = PREVIEW.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
  const yOffset = PREVIEW.gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
  const endpointGap = PREVIEW.gap * (options.endpointGapScale ?? 1.05) * sizeRatio;
  const startX = firstX + xOffset;
  const endX = secondX + xOffset;
  const startY = firstY + direction * endpointGap + yOffset;
  const endY = secondY + direction * endpointGap + yOffset;
  const span = Math.max(PREVIEW.gap * 1.4, Math.abs(endX - startX));
  const handleWidth = span * 0.28 * widthRatio;
  const curveDepth = direction * PREVIEW.gap * (options.depthScale ?? 1) * heightRatio * sizeRatio;
  const strokeWidth = Math.max(1.1, PREVIEW.gap * 0.13 * sizeRatio);

  append(parent, makeElement("path", {
    class: "marking-curve",
    d: [
      `M ${startX} ${startY}`,
      `C ${startX + handleWidth} ${startY + curveDepth},`,
      `${endX - handleWidth} ${endY + curveDepth},`,
      `${endX} ${endY}`,
    ].join(" "),
    fill: "none",
    stroke: "currentColor",
    "stroke-width": strokeWidth,
    "stroke-linecap": "round",
  }));
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

  for (let step = -4; step <= 12; step += 1) {
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

function drawPreviewSystemBarline(parent, x, trebleTop, bassTop = null, final = false) {
  const top = trebleTop;
  const connectsGrandStaff = typeof bassTop === "number" && bassTop !== trebleTop;
  const bottom = connectsGrandStaff ? bassTop + PREVIEW.gap * 4 : trebleTop + PREVIEW.gap * 4;
  if (final) {
    previewRenderSymbol(parent, "barlineFinal", x, previewYForStep(4, trebleTop), PREVIEW.gap);
    if (connectsGrandStaff) previewRenderSymbol(parent, "barlineFinal", x, previewYForStep(4, bassTop), PREVIEW.gap);
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

  if (step <= -2) {
    for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) {
      const y = previewYForStep(ledgerStep, top) + yOffset;
      append(parent, makeElement("line", { class: "ledger-line", x1: x + xOffset - halfWidth, x2: x + xOffset + halfWidth, y1: y, y2: y, "stroke-width": thickness }));
    }
  }
  if (step >= 10) {
    for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) {
      const y = previewYForStep(ledgerStep, top) + yOffset;
      append(parent, makeElement("line", { class: "ledger-line", x1: x + xOffset - halfWidth, x2: x + xOffset + halfWidth, y1: y, y2: y, "stroke-width": thickness }));
    }
  }
}

function accidentalKeyForValue(value, context = "score") {
  if (context === "keySignature") return value > 0 ? "sharpKeySignature" : "flatKeySignature";
  return value > 0 ? "sharpInScore" : value < 0 ? "flatInScore" : "naturalInScore";
}

function drawPreviewAccidental(parent, value, x, y, context = "score") {
  const accidentalKey = accidentalKeyForValue(value, context);
  if (context !== "keySignature" && !generatedEnabled(accidentalKey)) {
    return;
  }
  previewRenderSymbol(parent, accidentalKey, x, y, PREVIEW.gap);
}

function previewAccidentalX(noteheadX) {
  return noteheadX - PREVIEW.gap * 2.1;
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
    if (note.restKey !== "wholeRest" && rhythmInfo(note.rhythm).dotted) {
      drawPreviewDot(parent, x, previewYForStep(4, top), 4);
    }
    return;
  }

  const stemDown = forceStemDown ?? previewStemDown(note.step);
  const symbolKey = previewNoteKey(note, stemDown, beamed);
  if (!generatedEnabled(symbolKey)) return;
  drawPreviewLedgerLines(parent, x, note.step, top, isLedgerLineStep(note.step));
  if (note.accidental !== null && note.accidental !== undefined) {
    drawPreviewAccidental(parent, note.accidental, previewAccidentalX(x), y);
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

function notesForPlacement(bar, staff) {
  return staff === "bass" ? bar.bassNotes || [] : bar.notes;
}

function topForPlacement(barIndex, staff) {
  return previewStaffTopForBar(barIndex, staff);
}

function notePositionForPlacement(bar, staff, noteIndex) {
  const notes = notesForPlacement(bar, staff);
  const positions = previewBarNotePositions(bar.barIndex, notes);
  return positions[noteIndex] || previewBarStart(bar.barIndex) + PREVIEW.gap * 3;
}

function drawPreviewArticulation(parent, key, bar, note, top, above = true) {
  if (!generatedEnabled(key) || !note) return;
  const x = notePositionInBar(bar, note);
  const y = previewYForStep(note.step, top) + (above ? -PREVIEW.gap * 3.1 : PREVIEW.gap * 3.1);
  previewRenderSymbol(parent, key, x, y, PREVIEW.gap);
}

function drawPreviewOptionalSymbols(parent, question) {
  (question.optionalPlacements || []).forEach((placement) => {
    const bar = question.bars[placement.barIndex];
    if (!bar) return;

    if (placement.type === "articulation") {
      const notes = notesForPlacement(bar, placement.staff);
      const note = notes[placement.noteIndex];
      if (!note) return;
      const top = topForPlacement(placement.barIndex, placement.staff);
      const x = notePositionForPlacement(bar, placement.staff, placement.noteIndex);
      const above = placement.key.includes("Above");
      const y = previewYForStep(note.step, top) + (above ? -PREVIEW.gap * 3.1 : PREVIEW.gap * 3.1);
      previewRenderSymbol(parent, placement.key, x, y, PREVIEW.gap);
    }

    if (placement.type === "accidental") {
      const notes = notesForPlacement(bar, placement.staff);
      const note = notes[placement.noteIndex];
      if (!note) return;
      const top = topForPlacement(placement.barIndex, placement.staff);
      const x = notePositionForPlacement(bar, placement.staff, placement.noteIndex);
      drawPreviewAccidental(parent, placement.value, previewAccidentalX(x), previewYForStep(note.step, top));
    }

    if (placement.type === "dynamic") {
      const top = previewLowestStaffTopForBar(placement.barIndex);
      previewRenderSymbol(parent, placement.key, previewBarStart(placement.barIndex) + PREVIEW.gap * 3.5, top + PREVIEW.gap * 8.4, PREVIEW.gap);
    }

    if (placement.type === "hairpin") {
      const top = previewLowestStaffTopForBar(placement.barIndex);
      previewRenderSymbol(parent, placement.key, previewBarStart(placement.barIndex) + PREVIEW.gap * 4, top + PREVIEW.gap * 8.5, PREVIEW.gap);
    }

    if (placement.type === "tie") {
      const notes = notesForPlacement(bar, placement.staff);
      const top = topForPlacement(placement.barIndex, placement.staff);
      const firstNote = notes[placement.indexes[0]];
      const secondNote = notes[placement.indexes[1]];
      if (!firstNote || !secondNote) return;
      const firstX = notePositionForPlacement(bar, placement.staff, placement.indexes[0]);
      const secondX = notePositionForPlacement(bar, placement.staff, placement.indexes[1]);
      const stemDown = placement.stemDown ?? previewStemDown(firstNote.step);
      const firstY = previewYForStep(firstNote.step, top);
      const secondY = previewYForStep(secondNote.step, top);
      previewRenderCurve(parent, "tie", firstX, firstY, secondX, secondY, stemDown, {
        endpointGapScale: 0.85,
        depthScale: 0.7,
      });
    }

    if (placement.type === "slur") {
      const notes = notesForPlacement(bar, placement.staff);
      const top = topForPlacement(placement.barIndex, placement.staff);
      const firstNote = notes[placement.indexes[0]];
      const secondNote = notes[placement.indexes[1]];
      if (!firstNote || !secondNote) return;
      const firstX = notePositionForPlacement(bar, placement.staff, placement.indexes[0]);
      const secondX = notePositionForPlacement(bar, placement.staff, placement.indexes[1]);
      const stemDown = placement.stemDown ?? previewStemDown(firstNote.step);
      const slurKey = stemDown ? "slurStemDown" : "slurStemUp";
      const firstY = previewYForStep(firstNote.step, top);
      const secondY = previewYForStep(secondNote.step, top);
      previewRenderCurve(parent, slurKey, firstX, firstY, secondX, secondY, stemDown, {
        endpointGapScale: 1.05,
        depthScale: 1,
      });
    }

    if (placement.type === "phrase") {
      const startBar = question.bars[placement.startBarIndex];
      const endBar = question.bars[placement.endBarIndex];
      if (!startBar || !endBar) return;
      const startNotes = notesForPlacement(startBar, placement.staff);
      const endNotes = notesForPlacement(endBar, placement.staff);
      const firstNote = startNotes[placement.startNoteIndex];
      const lastNote = endNotes[placement.endNoteIndex];
      if (!firstNote || !lastNote) return;
      const top = topForPlacement(placement.startBarIndex, placement.staff);
      const firstX = notePositionForPlacement(startBar, placement.staff, placement.startNoteIndex);
      const secondX = notePositionForPlacement(endBar, placement.staff, placement.endNoteIndex);
      const stemDown = placement.stemDown ?? phraseStemDownFromMajority(
        question.bars,
        placement.staff,
        placement.startBarIndex,
        placement.startNoteIndex,
        placement.endBarIndex,
        placement.endNoteIndex,
      );
      const firstY = previewYForStep(firstNote.step, top);
      const secondY = previewYForStep(lastNote.step, topForPlacement(placement.endBarIndex, placement.staff));
      previewRenderCurve(parent, "phraseMarking", firstX, firstY, secondX, secondY, stemDown, {
        endpointGapScale: 1.4,
        depthScale: 2.1,
      });
    }

    if (placement.type === "repeat") {
      const top = previewSystemTop(placement.barIndex);
      const visibility = previewStaffVisibility();
      const bassTop = visibility.grand ? previewBassTop(top) : null;
      const x = placement.key === "repeatLeft"
        ? previewBarStart(placement.barIndex) - PREVIEW.gap * 1.1
        : previewBarStart(placement.barIndex) + previewBarWidth(placement.barIndex) - PREVIEW.gap * 0.5;
      const repeatTop = visibility.bass && !visibility.treble ? previewStaffTopForSystem(top, "bass") : top;
      previewRenderSymbol(parent, placement.key, x, repeatTop + PREVIEW.gap * 2.9, PREVIEW.gap);
      if (bassTop !== null) previewRenderSymbol(parent, placement.key, x, bassTop + PREVIEW.gap * 2.9, PREVIEW.gap);
    }
  });

}

function hasRepeatAtBar(question, repeatKey, barIndex) {
  return (question.optionalPlacements || []).some((placement) => (
    placement.type === "repeat"
    && placement.key === repeatKey
    && placement.barIndex === barIndex
  ));
}

function renderHigherPreview(parent, options = {}) {
  const previewBefore = previewSnapshot();
  applyPreviewBarDisplayLayout();

  try {
    renderHigherPreviewWithCurrentLayout(parent, options);
  } finally {
    restorePreview(previewBefore);
  }
}

function renderHigherPreviewWithCurrentLayout(parent, options = {}) {
  parent.replaceChildren();
  const question = options.question || previewQuestion;
  const showBarNumbers = options.showBarNumbers !== false;
  const systemTops = activePreviewSystemTops();
  const visibility = previewStaffVisibility();
  const lastSystemTop = systemTops[systemTops.length - 1] || PREVIEW.systemTops[0];
  const firstSystemTop = systemTops[0] || PREVIEW.systemTops[0];
  const contentTop = firstSystemTop - PREVIEW.gap * (showBarNumbers ? 6.2 : 5);
  const contentBottom = previewLowestStaffTopForSystem(lastSystemTop) + PREVIEW.gap * 4 + PREVIEW.gap * (visibility.grand ? 7 : 6);
  const contentCenter = (contentTop + contentBottom) / 2;
  const oneBarZoom = previewBarCount() === 1 ? PREVIEW_ONE_BAR_ZOOM : 1;
  const width = PREVIEW.width / oneBarZoom;
  const height = (visibility.grand ? PREVIEW_VIEWBOX_HEIGHTS.grandStaff : PREVIEW_VIEWBOX_HEIGHTS.singleStaff) / oneBarZoom;
  const opticalDrop = visibility.grand ? PREVIEW.gap * 0.2 : PREVIEW.gap * 0.8;
  const viewBoxX = (PREVIEW.width - width) / 2;
  const viewBoxY = contentCenter - height / 2 - opticalDrop + PREVIEW_VIEWBOX_UP_SHIFT;
  parent.setAttribute("viewBox", `${viewBoxX} ${viewBoxY} ${width} ${height}`);
  append(parent, makeElement("rect", { x: viewBoxX, y: viewBoxY, width, height, fill: "transparent" }));

  systemTops.forEach((top, systemIndex) => {
    const bassTop = visibility.grand ? previewBassTop(top) : null;
    const barsOnSystem = previewBarsOnSystem(systemIndex);
    if (!barsOnSystem) return;
    const finalBar = systemIndex * PREVIEW.barsPerSystem + barsOnSystem - 1;
    const endX = previewBarStart(finalBar) + previewBarWidth(finalBar);
    if (visibility.treble) drawPreviewStave(parent, previewStaffTopForSystem(top, "treble"), endX);
    if (visibility.bass) drawPreviewStave(parent, previewStaffTopForSystem(top, "bass"), endX);
    if (visibility.treble && generatedEnabled("gClef")) {
      previewRenderSymbol(parent, "gClef", previewAnchorX("gClef"), previewAnchorY("gClef", top), PREVIEW.gap);
    }
    if (visibility.bass && generatedEnabled("fClef")) {
      const fClefTop = previewStaffTopForSystem(top, "bass");
      previewRenderSymbol(parent, "fClef", previewAnchorX("fClef"), previewAnchorY("fClef", fClefTop), PREVIEW.gap);
    }
    if (visibility.grand) {
      previewRenderSymbol(parent, "brace", PREVIEW.staffLeft - 18, top + PREVIEW.gap * 4, PREVIEW.gap);
      if (generatedEnabled("barlineSingle")) drawPreviewSystemBarline(parent, PREVIEW.staffLeft, top, bassTop);
    }
    if (systemIndex === 0 || systemIndex === 1) {
      if (visibility.treble) drawPreviewKeySignature(parent, question.key, previewStaffTopForSystem(top, "treble"), "treble");
      if (visibility.bass) drawPreviewKeySignature(parent, question.key, previewStaffTopForSystem(top, "bass"), "bass");
    }
    if (systemIndex === 0) {
      if (visibility.treble) {
        previewRenderSymbol(parent, question.timeSignatureKey, previewAnchorX(question.timeSignatureKey), previewAnchorY(question.timeSignatureKey, top), PREVIEW.gap);
      }
      if (visibility.bass) {
        const timeSigTop = previewStaffTopForSystem(top, "bass");
        previewRenderSymbol(parent, question.timeSignatureKey, previewAnchorX(question.timeSignatureKey), previewAnchorY(question.timeSignatureKey, timeSigTop), PREVIEW.gap);
      }
    }
  });

  question.bars.slice(0, previewBarCount()).forEach((bar) => {
    const start = previewBarStart(bar.barIndex);
    const end = start + previewBarWidth(bar.barIndex);
    const top = previewSystemTop(bar.barIndex);
    const bassTop = visibility.grand ? previewBassTop(top) : null;
    const trebleTop = previewStaffTopForSystem(top, "treble");
    const bassStaffTop = previewStaffTopForSystem(top, "bass");
    const positions = previewBarNotePositions(bar.barIndex, bar.notes);
    const bassPositions = previewBarNotePositions(bar.barIndex, bar.bassNotes || []);
    const groups = previewQuaverGroups(bar.notes, question.timeSignature)
      .filter((group) => generatedEnabled(previewBeamConfigKey(bar.notes.slice(group.start, group.end + 1))));
    const bassGroups = previewQuaverGroups(bar.bassNotes || [], question.timeSignature)
      .filter((group) => generatedEnabled(previewBeamConfigKey((bar.bassNotes || []).slice(group.start, group.end + 1))));
    const groupedIndexes = new Set(groups.flatMap((group) => {
      const indexes = [];
      for (let index = group.start; index <= group.end; index += 1) indexes.push(index);
      return indexes;
    }));
    const bassGroupedIndexes = new Set(bassGroups.flatMap((group) => {
      const indexes = [];
      for (let index = group.start; index <= group.end; index += 1) indexes.push(index);
      return indexes;
    }));
    if (showBarNumbers) {
      append(parent, makeElement("text", {
        x: (bar.barIndex === 0 || bar.barIndex === 4) ? start - 15 : start + 5,
        y: top - 18,
        "font-size": 13,
        "font-weight": 600,
      }, String(bar.barIndex + 1)));
    }

    if (visibility.treble) {
      bar.notes.forEach((note, index) => {
        if (!groupedIndexes.has(index)) drawPreviewNote(parent, note, positions[index], trebleTop);
      });
      groups.forEach((group) => drawPreviewBeam(parent, bar.notes, positions, trebleTop, group));
    }
    if (visibility.bass) {
      (bar.bassNotes || []).forEach((note, index) => {
        if (!bassGroupedIndexes.has(index)) drawPreviewNote(parent, note, bassPositions[index], bassStaffTop);
      });
      bassGroups.forEach((group) => drawPreviewBeam(parent, bar.bassNotes || [], bassPositions, bassStaffTop, group));
    }

    if (bar.barIndex === previewBarCount() - 1 && hasRepeatAtBar(question, "repeatRight", previewBarCount() - 1)) {
      return;
    } else if (bar.barIndex === previewBarCount() - 1) {
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

function generatedOptionKeys(option) {
  if (typeof option === "string") return [option];
  return option.keys || [option.key];
}

function generatedOptionKey(option) {
  return typeof option === "string" ? option : option.key;
}

function generatedOptionLabel(option) {
  return typeof option === "string" ? symbolLabel(option) : option.label || symbolLabel(option.key);
}

function keySignatureGlyph(item) {
  const values = Object.values(item.keyAccidentals || {});
  if (!values.length) return "C";
  const accidental = values.some((value) => value < 0) ? BRAVURA_SYMBOLS.flat : BRAVURA_SYMBOLS.sharp;
  return accidental.repeat(Math.min(values.length, 2));
}

function generatedOptionChecked(option) {
  return generatedOptionKeys(option).some((key) => generatedEnabled(key));
}

function generatedOptionDisabledReason(option) {
  const keys = generatedOptionKeys(option);
  const disabledReasons = keys.map((key) => symbolGenerationDisabledReason(key)).filter(Boolean);
  const allDisabled = disabledReasons.length === keys.length;
  if (allDisabled) return disabledReasons[0];
  const visibleKeys = keys.filter((key) => ["gClef", "fClef"].includes(key));
  if (
    visibleKeys.length === 1
    && generatedEnabled(visibleKeys[0])
    && enabledClefCount() === 1
  ) {
    return "At least one clef must stay selected.";
  }
  return "";
}

function timeSignatureColumnClass(item) {
  return item.id.endsWith("/8") ? "column-left" : "column-right";
}

function keyColumnClass(item) {
  return item.name.toLowerCase().includes("minor") ? "column-right" : "column-left";
}

function fillGeneratedSymbolChecks() {
  reconcileGeneratedSymbolChoices();
  const renderSection = (groupName, rows, sectionKind, sectionKeys, checked) => {
    const keys = sectionKeys.join(",");
    return rows ? `
      <section class="generated-section">
        <header class="generated-section-header">
          <h3>${groupName}</h3>
          <label class="section-toggle">
            <input type="checkbox" data-generated-kind="section" data-section-kind="${sectionKind}" data-section-keys="${keys}" ${checked ? "checked" : ""} />
            All
          </label>
        </header>
        <div class="generated-section-options">${rows}</div>
      </section>
    ` : "";
  };

  const renderGeneratedSymbolSection = (groupName, options) => {
    const sectionKeys = options.flatMap((option) => generatedOptionKeys(option))
      .filter((key) => hasRenderableSymbol(key));
    const rows = options
      .filter((option) => (
        generatedOptionKey(option) !== "timeSignature"
        && generatedOptionKeys(option).some((key) => hasRenderableSymbol(key))
      ))
      .map((option) => {
        const unavailableReason = generatedOptionDisabledReason(option);
        const disabled = unavailableReason ? "disabled" : "";
        const title = unavailableReason ? ` title="${unavailableReason}"` : "";
        const disabledClass = unavailableReason && unavailableReason !== "At least one clef must stay selected." ? "is-disabled" : "";
        const lockedClass = unavailableReason === "At least one clef must stay selected." ? "is-locked" : "";
        return `
        <label class="${disabledClass} ${lockedClass}"${title}>
          <input type="checkbox" value="${generatedOptionKey(option)}" data-generated-kind="symbol" data-generated-keys="${generatedOptionKeys(option).join(",")}" ${generatedOptionChecked(option) ? "checked" : ""} ${disabled} />
          ${glyphMarkup(optionGlyph(option), optionGlyphClass(option))}
          <span class="option-label-text">${generatedOptionLabel(option)}</span>
        </label>
      `;
      })
      .join("");
    const sectionChecked = sectionKeys.length > 0 && sectionKeys.every((key) => generatedEnabled(key));
    return renderSection(groupName, rows, "symbol", sectionKeys, sectionChecked);
  };

  const renderTimeSignatureRows = (items) => items.map((item) => {
    const locked = timeSignatureEnabled(item) && enabledTimeSignatureCount() === 1;
    return `
    <label class="${locked ? "is-locked" : ""}"${locked ? " title=\"At least one time signature must stay selected.\"" : ""}>
      <input type="checkbox" value="${item.id}" data-generated-kind="timeSignature" ${timeSignatureEnabled(item) ? "checked" : ""} ${locked ? "disabled" : ""} />
      <span class="option-label-text">${item.id}</span>
    </label>
  `;
  }).join("");

  const renderKeyRows = (items) => items.map((item) => {
    const locked = keyEnabled(item) && enabledKeyCount() === 1;
    return `
    <label class="${locked ? "is-locked" : ""}"${locked ? " title=\"At least one key must stay selected.\"" : ""}>
      <input type="checkbox" value="${item.id}" data-generated-kind="key" ${keyEnabled(item) ? "checked" : ""} ${locked ? "disabled" : ""} />
      <span class="option-label-text">${titleCase(item.name)}</span>
    </label>
  `;
  }).join("");

  const majorKeys = PREVIEW_KEYS.filter((item) => !item.name.toLowerCase().includes("minor"));
  const minorKeys = PREVIEW_KEYS.filter((item) => item.name.toLowerCase().includes("minor"));
  const simpleTimeSignatures = PREVIEW_TIME_SIGNATURES.filter((item) => !item.id.endsWith("/8"));
  const compoundTimeSignatures = PREVIEW_TIME_SIGNATURES.filter((item) => item.id.endsWith("/8"));
  const keySectionChecked = PREVIEW_KEYS.every((item) => keyEnabled(item));
  const timeSignatureSectionChecked = PREVIEW_TIME_SIGNATURES.every((item) => timeSignatureEnabled(item));

  generatedSymbolChecks.innerHTML = `
    ${renderGeneratedSymbolSection("Clefs", GENERATED_SYMBOL_GROUPS.Clefs)}
    <section class="generated-section">
      <header class="generated-section-header">
        <h3>Key Signatures</h3>
        <label class="section-toggle">
          <input type="checkbox" data-generated-kind="section" data-section-kind="key" data-section-keys="${PREVIEW_KEYS.map((item) => item.id).join(",")}" ${keySectionChecked ? "checked" : ""} />
          All
        </label>
      </header>
      <div class="generated-section-options split-columns">
        <div>${renderKeyRows(majorKeys)}</div>
        <div>${renderKeyRows(minorKeys)}</div>
      </div>
    </section>
    <section class="generated-section">
      <header class="generated-section-header">
        <h3>Time Signatures</h3>
        <label class="section-toggle">
          <input type="checkbox" data-generated-kind="section" data-section-kind="timeSignature" data-section-keys="${PREVIEW_TIME_SIGNATURES.map((item) => item.id).join(",")}" ${timeSignatureSectionChecked ? "checked" : ""} />
          All
        </label>
      </header>
      <div class="generated-section-options split-columns">
        <div>${renderTimeSignatureRows(simpleTimeSignatures)}</div>
        <div>${renderTimeSignatureRows(compoundTimeSignatures)}</div>
      </div>
    </section>
    ${Object.entries(GENERATED_SYMBOL_GROUPS)
      .filter(([groupName]) => groupName !== "Clefs")
      .map(([groupName, options]) => renderGeneratedSymbolSection(groupName, options))
      .join("")}
  `;
  if (enableAllGeneratedSymbols) enableAllGeneratedSymbols.checked = allGeneratedControlsEnabled();
}

function refreshGeneratedSymbolChecks() {
  const scrollTop = generatedSymbolChecks.scrollTop;
  fillGeneratedSymbolChecks();
  generatedSymbolChecks.scrollTop = scrollTop;
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

function syncSymbolRangeLimits() {
  const wideHairpin = HAIRPIN_DYNAMIC_KEYS.includes(selectedSymbolKey);
  controls.widthScale.max = wideHairpin ? "6" : "2";
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
  setRange(controls.barCount, previewBarCount());
  controls.showGuides.checked = Boolean(config.stave.showGuides);

  if (!selectedSymbolKey) {
    setSymbolControlsDisabled(true);
    SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], 0));
    return;
  }

  setSymbolControlsDisabled(false);
  syncSymbolRangeLimits();
  setAllNotesControls();
  const settings = symbolConfig(settingsKeyForControl(selectedSymbolKey));
  SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], settings[key]));
}

function updateZoom() {
  const zoom = Number(controls.zoom.value || 100);
  stage.style.width = `${zoom}%`;
  stage.style.height = `${zoom}%`;
}

function setZoomValue(value) {
  const min = Number(controls.zoom.min || 100);
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

symbolSelect.addEventListener("change", () => {
  selectedSymbolKey = symbolSelect.value;
  selectedCategory = Object.entries(SYMBOL_GROUPS).find(([, keys]) => keys.includes(selectedSymbolKey))?.[0] || selectedCategory;
  updateAll();
});

controls.zoom.addEventListener("input", updateAll);

controls.barCount.addEventListener("change", () => {
  previewQuestion = makeHigherPreviewQuestion();
  updateAll();
});

if (notationScroll) {
  notationScroll.addEventListener("wheel", handlePinchZoom, { passive: false });
}

controls.showGuides.addEventListener("change", () => {
  config.stave.showGuides = controls.showGuides.checked;
  updateAll();
});

controls.showBarNumbers.addEventListener("change", updateAll);

document.getElementById("shufflePreviewButton").addEventListener("click", () => {
  previewQuestion = makeHigherPreviewQuestion();
  updateAll();
});

if (enableAllGeneratedSymbols) {
  enableAllGeneratedSymbols.addEventListener("change", () => {
    if (enableAllGeneratedSymbols.checked) {
      enableEveryGeneratedControl();
    } else {
      disableEveryGeneratedControl();
    }
    refreshGeneratedSymbolChecks();
    previewQuestion = makeHigherPreviewQuestion();
    updateAll();
  });
}

generatedSymbolChecks.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  if (event.target.disabled) return;
  const kind = event.target.dataset.generatedKind || "symbol";
  if (kind === "section") {
    const sectionKind = event.target.dataset.sectionKind || "symbol";
    const sectionKeys = (event.target.dataset.sectionKeys || "")
      .split(",")
      .filter(Boolean);
    setGeneratedSection(sectionKind, sectionKeys, event.target.checked);
  } else if (kind === "timeSignature") {
    if (!event.target.checked && enabledTimeSignatureCount() <= 1) {
      event.target.checked = true;
      return;
    }
    generatedTimeSignatures[event.target.value] = event.target.checked;
  } else if (kind === "key") {
    if (!event.target.checked && enabledKeyCount() <= 1) {
      event.target.checked = true;
      return;
    }
    generatedKeys[event.target.value] = event.target.checked;
  } else {
    const symbolKeys = (event.target.dataset.generatedKeys || event.target.value)
      .split(",")
      .filter(Boolean);
    if (symbolKeys.some((key) => ["gClef", "fClef"].includes(key)) && !event.target.checked && enabledClefCount() <= 1) {
      event.target.checked = true;
      return;
    }
    symbolKeys.forEach((key) => {
      generatedSymbols[key] = event.target.checked;
    });
    if (symbolKeys.some((key) => key === "gClef" || key === "fClef") && !event.target.checked) {
      generatedSymbols.brace = false;
    }
  }
  refreshGeneratedSymbolChecks();
  previewQuestion = makeHigherPreviewQuestion();
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
  const button = document.getElementById("exportButton");
  updateExportText();
  try {
    await navigator.clipboard.writeText(exportText.value);
  } catch (error) {
    exportText.classList.remove("export-storage");
    exportText.select();
    document.execCommand("copy");
    exportText.classList.add("export-storage");
  }
  button.classList.add("copied");
  copyConfirmation.textContent = "Configuration copied";
  copyConfirmation.classList.add("visible");
  window.setTimeout(() => {
    button.classList.remove("copied");
    copyConfirmation.classList.remove("visible");
  }, 1600);
});

fillGeneratedSymbolChecks();
updateAll();
