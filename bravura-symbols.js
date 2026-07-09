/*
  Standard Bravura symbols used across The Music Literacy Hub.

  This file is a shared reference for common music symbols. It is not connected
  to the pupil apps yet, so changing this file will not change an app by itself.

  Use bravura-glyph-picker.html when you want to browse symbols and copy codes.
*/
const BRAVURA_SYMBOLS = {
  // Braces and barlines
  brace: "\uE000",
  barlineSingle: "\uE030",
  barlineFinal: "\uE032",

  // Repeats and navigation marks
  repeatLeft: "\uE040",
  repeatRight: "\uE041",
  dalSegno: "\uE045",
  daCapo: "\uE046",
  segno: "\uE047",

  // Clefs
  gClef: "\uE050",
  fClef: "\uE062",

  // Time signature numbers
  timeSig1: "\uE081",
  timeSig2: "\uE082",
  timeSig3: "\uE083",
  timeSig4: "\uE084",
  timeSig5: "\uE085",
  timeSig6: "\uE086",
  timeSig8: "\uE088",
  timeSig9: "\uE089",

  // Full note symbols
  noteheadBlack: "\uE0A4",
  noteheadHalf: "\uE0A3",
  wholeNote: "\uE1D2",
  halfNoteStemUp: "\uE1D3",
  halfNoteStemDown: "\uE1D4",
  quarterNoteStemUp: "\uE1D5",
  quarterNoteStemDown: "\uE1D6",
  eighthNoteStemUp: "\uE1D7",
  eighthNoteStemDown: "\uE1D8",
  sixteenthNoteStemUp: "\uE1D9",
  sixteenthNoteStemDown: "\uE1DA",
  augmentationDot: "\uE1E7",
  tie: "\uE1FD",

  // Accidentals
  flat: "\uE260",
  natural: "\uE261",
  sharp: "\uE262",

  // Articulations
  accentAbove: "\uE4A0",
  accentBelow: "\uE4A1",
  staccatoAbove: "\uE4A2",
  staccatoBelow: "\uE4A3",

  // Rests
  wholeRest: "\uE4E3",
  halfRest: "\uE4E4",
  quarterRest: "\uE4E5",
  eighthRest: "\uE4E6",
  sixteenthRest: "\uE4E7",

  // Octave markings
  ottavaAlta: "\uE511",
  ottavaBassa: "\uE51C",

  // Dynamics
  piano: "\uE520",
  forte: "\uE522",
  pianissimo: "\uE52B",
  mezzoPiano: "\uE52C",
  mezzoForte: "\uE52D",
  fortissimo: "\uE52F",
  sforzato: "\uE539",
  crescendo: "\uE53E",
  diminuendo: "\uE53F",
};

window.BRAVURA_SYMBOLS = BRAVURA_SYMBOLS;
