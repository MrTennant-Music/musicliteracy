/*
  Shared notation calibration values for The Music Literacy Hub.

  These values are deliberately separate from the pupil apps for now.
  The calibration page edits a copy of this object in the browser.

  All scale values are relative to the stave line gap.
  Example: fontSizeScale: 3 means "3 times the current stave gap".
*/
const SHARED_NOTATION_CONFIG = {
  stave: {
    width: 980,
    lineGap: 14,
    grandStaffGapScale: 8.4,
    showGuides: true,
    showScalingTest: false,
  },

  drawing: {
    stemThicknessScale: 0.12,
    beamThicknessScale: 0.42,
    ledgerLineWidthScale: 1.8,
    ledgerLineThicknessScale: 0.11,
  },

  symbols: {
    brace: { fontSizeScale: 4.4, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    barlineSingle: { fontSizeScale: 4.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    barlineFinal: { fontSizeScale: 4.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    repeatLeft: { fontSizeScale: 4.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    repeatRight: { fontSizeScale: 4.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    dalSegno: { fontSizeScale: 2.3, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    daCapo: { fontSizeScale: 2.3, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    segno: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    gClef: { fontSizeScale: 5.1, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    fClef: { fontSizeScale: 4.4, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    timeSig1: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig2: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig3: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig4: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig5: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig6: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig8: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    timeSig9: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    wholeNote: { fontSizeScale: 2.35, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    halfNoteStemUp: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    halfNoteStemDown: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    quarterNoteStemUp: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    quarterNoteStemDown: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    eighthNoteStemUp: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    eighthNoteStemDown: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    sixteenthNoteStemUp: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    sixteenthNoteStemDown: { fontSizeScale: 4.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    augmentationDot: { fontSizeScale: 1.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    tie: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    flat: { fontSizeScale: 2.6, xOffsetScale: 0, yOffsetScale: -0.5, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    natural: { fontSizeScale: 2.6, xOffsetScale: 0, yOffsetScale: -0.5, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    sharp: { fontSizeScale: 2.6, xOffsetScale: 0, yOffsetScale: -0.5, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    accentAbove: { fontSizeScale: 1.7, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    accentBelow: { fontSizeScale: 1.7, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    staccatoAbove: { fontSizeScale: 1.25, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    staccatoBelow: { fontSizeScale: 1.25, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    wholeRest: { fontSizeScale: 2.3, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    halfRest: { fontSizeScale: 2.3, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    quarterRest: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    eighthRest: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    sixteenthRest: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    ottavaAlta: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    ottavaBassa: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    piano: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    forte: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    pianissimo: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    mezzoPiano: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    mezzoForte: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    fortissimo: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    sforzato: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    crescendo: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    diminuendo: { fontSizeScale: 2.8, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },

    play: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
    stop: { fontSizeScale: 2.2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 },
  },
};
