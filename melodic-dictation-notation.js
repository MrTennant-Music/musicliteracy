// Shared Bravura notation from Melodic Dictation.
(function attachMelodicDictationNotation(MLH) {
  const {
    BAR_COUNT,
    clamp,
    rhythmInfo
  } = MLH.MelodicDictation;
  const SHARED_SYMBOLS = window.BRAVURA_SYMBOLS ?? {};
  const SHARED_CONFIG = window.SHARED_NOTATION_CONFIG ?? {
    symbols: {},
    drawing: {}
  };
  const STAFF = {
    left: 58,
    right: 862,
    topA: 82,
    topB: 218,
    gap: 11
  };
  const BARS_PER_SYSTEM = 4;
  const KEY_SIGNATURE_SPACING = 14;
  const COLOUR = {
    green: "#16a34a",
    red: "#dc2626",
    blue: "#2563eb",
    guide: "#525252"
  };
  const clefStepOffset = clef => clef === "bass" ? 12 : 0;
  const displayStep = (note, clef = "treble") => (note?.step ?? 0) + clefStepOffset(clef);
  const yForStep = (step, top) => top + STAFF.gap * 4 - step * (STAFF.gap / 2);
  const stemDown = step => step > 4;
  function sharedActualSymbolKey(key) {
    if (key === "flatInScore" || key === "flatKeySignature") return "flat";
    if (key === "naturalInScore") return "natural";
    if (key === "sharpInScore" || key === "sharpKeySignature") return "sharp";
    if (key === "noteheadBlackStemUp" || key === "noteheadBlackStemDown") return "noteheadBlack";
    if (key === "augmentationDotLine" || key === "augmentationDotSpace") return "augmentationDot";
    return key;
  }
  function sharedSettingsKey(key) {
    if (key === "flatKeySignature" || key === "sharpKeySignature") return SHARED_CONFIG.symbols?.keySignatureAccidentals ? "keySignatureAccidentals" : key;
    if (key === "flatInScore" || key === "naturalInScore" || key === "sharpInScore") return SHARED_CONFIG.symbols?.scoreAccidentals ? "scoreAccidentals" : key;
    return key;
  }
  function sharedSymbolConfig(key) {
    const symbols = SHARED_CONFIG.symbols ?? {};
    const settingsKey = sharedSettingsKey(key);
    return symbols[settingsKey] ?? symbols[sharedActualSymbolKey(settingsKey)] ?? {
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
    return SHARED_SYMBOLS[sharedActualSymbolKey(key)] ?? "";
  }
  function calibrationAnchorX(symbolKey, left = STAFF.left) {
    if (symbolKey?.startsWith("timeSig")) return left + 12 * STAFF.gap;
    return left;
  }
  function calibrationAnchorY(symbolKey, top = STAFF.topA) {
    if (symbolKey?.startsWith("timeSig")) return yForStep(5.3, top);
    return yForStep(4, top);
  }
  function CalibratedSymbol({
    symbolKey,
    x,
    y,
    colour = "currentColor",
    opacity = 1,
    lineGap = STAFF.gap,
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
    const widthScale = Number(settings.widthScale || 1);
    const heightScale = Number(settings.heightScale || 1);
    return React.createElement("text", {
      className: "music-symbol",
      x: adjustedX,
      y: adjustedY,
      fill: colour,
      opacity: opacity,
      fontSize: fontSize,
      textAnchor: "middle",
      transform: `translate(${adjustedX} ${adjustedY}) scale(${widthScale} ${heightScale}) translate(${-adjustedX} ${-adjustedY})`,
      pointerEvents: "none"
    }, glyph);
  }
  function noteSymbolKey(rhythm, down, beamed = false) {
    if (rhythm === "semibreve") return "wholeNote";
    if (rhythm === "minim" || rhythm === "dottedMinim") return down ? "halfNoteStemDown" : "halfNoteStemUp";
    if (rhythm === "crotchetRest") return "quarterRest";
    if (rhythm === "quaverRest") return "eighthRest";
    if (rhythm === "semiquaver" && beamed) return down ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "semiquaver") return down ? "sixteenthNoteStemDown" : "sixteenthNoteStemUp";
    if (rhythm === "quaver" && beamed) return down ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
    if (rhythm === "quaver") return down ? "eighthNoteStemDown" : "eighthNoteStemUp";
    return down ? "quarterNoteStemDown" : "quarterNoteStemUp";
  }
  function barStart(barIndex, displayBarCount = BARS_PER_SYSTEM, musicStartOverride = null) {
    const topSystem = barIndex < 4;
    const musicStart = musicStartOverride ?? (topSystem ? STAFF.left + 122 : STAFF.left + 74);
    const width = (STAFF.right - musicStart) / displayBarCount;
    return musicStart + barIndex % BARS_PER_SYSTEM * width;
  }
  function barWidth(barIndex, displayBarCount = BARS_PER_SYSTEM, musicStartOverride = null) {
    const musicStart = musicStartOverride ?? (barIndex < 4 ? STAFF.left + 122 : STAFF.left + 74);
    return (STAFF.right - musicStart) / displayBarCount;
  }
  function systemTop(barIndex) {
    return STAFF.topA + Math.floor(barIndex / BARS_PER_SYSTEM) * (STAFF.topB - STAFF.topA);
  }
  function barPositions(bar, displayBarCount = BARS_PER_SYSTEM) {
    const start = barStart(bar.barIndex, displayBarCount);
    const end = start + barWidth(bar.barIndex, displayBarCount);
    const scoreStart = start + (bar.barIndex === 0 ? 4 : 15);
    const scoreEnd = bar.barIndex === (bar.totalBars ?? BAR_COUNT) - 1 ? end - 24 : end - 4;
    const units = bar.notes.reduce((sum, note) => sum + rhythmInfo(note.rhythm).spacing, 0);
    const unit = Math.max(1, scoreEnd - scoreStart) / Math.max(1, units);
    let cursor = scoreStart + unit * 0.38;
    return bar.notes.map(note => {
      const x = cursor;
      cursor += rhythmInfo(note.rhythm).spacing * unit;
      return x;
    });
  }
  function isBeamableRhythm(rhythm) {
    return rhythm === "quaver" || rhythm === "semiquaver";
  }
  function getQuaverGroups(notes, timeSignature = null) {
    const groups = [];
    let index = 0;
    while (index < notes.length) {
      if (!isBeamableRhythm(notes[index]?.rhythm)) {
        index += 1;
        continue;
      }
      const start = index;
      while (isBeamableRhythm(notes[index + 1]?.rhythm)) {
        if (timeSignature?.id === "6/8") {
          const currentGroup = Math.floor((notes[index].beat + 0.001) / 1.5);
          const nextGroup = Math.floor((notes[index + 1].beat + 0.001) / 1.5);
          if (currentGroup !== nextGroup) break;
        }
        index += 1;
      }
      let groupStart = start;
      while (groupStart <= index) {
        const remaining = index - groupStart + 1;
        const groupSize = remaining === 5 ? 3 : remaining >= 4 ? 4 : remaining;
        const groupEnd = groupStart + groupSize - 1;
        if (groupEnd > groupStart) groups.push({
          start: groupStart,
          end: groupEnd
        });
        groupStart = groupEnd + 1;
      }
      index += 1;
    }
    return groups;
  }
  function groupContaining(groups, index) {
    return groups.find(group => index >= group.start && index <= group.end) ?? null;
  }
  function secondaryBeamSegments(groupNotes) {
    const segments = [];
    let segmentStart = null;
    groupNotes.forEach((note, index) => {
      const isSemiquaver = note?.rhythm === "semiquaver";
      const nextIsSemiquaver = groupNotes[index + 1]?.rhythm === "semiquaver";
      if (isSemiquaver && segmentStart === null) segmentStart = index;
      if (segmentStart !== null && (!nextIsSemiquaver || index === groupNotes.length - 1)) {
        segments.push({
          startIndex: segmentStart,
          endIndex: index,
          isHook: index === segmentStart
        });
        segmentStart = null;
      }
    });
    return segments;
  }
  function getStem(x, y, step, down, forcedEndY = null) {
    const stemLength = STAFF.gap * 3.1;
    const stemXOffset = STAFF.gap * 0.6;
    return {
      down,
      stemX: x + (down ? -stemXOffset : stemXOffset),
      startY: y + (down ? 0.5 : -0.5),
      endY: forcedEndY ?? (down ? y + stemLength : y - stemLength)
    };
  }
  function groupHasDownStems(notes, clef = "treble") {
    let down = 0;
    let up = 0;
    notes.forEach(note => stemDown(displayStep(note, clef)) ? down += 1 : up += 1);
    return down > up;
  }
  function getBeam(notes, positions, top, forcedDown = null, clef = "treble") {
    const down = forcedDown ?? groupHasDownStems(notes, clef);
    const settings = sharedSymbolConfig("quaverBeam");
    const xOffset = STAFF.gap * Number(settings.xOffsetScale || 0);
    const yOffset = STAFF.gap * Number(settings.yOffsetScale || 0);
    const stemLength = STAFF.gap * 3.1 * Number(settings.heightScale || 1);
    const beamWidthAdjust = STAFF.gap * 0.6 * (Number(settings.widthScale || 1) - 1);
    const firstStep = displayStep(notes[0], clef);
    const lastStep = displayStep(notes.at(-1), clef);
    const firstY = yForStep(firstStep, top);
    const lastY = yForStep(lastStep, top);
    const firstStem = getStem(positions[0] + xOffset, firstY + yOffset, firstStep, down, down ? firstY + yOffset + stemLength : firstY + yOffset - stemLength);
    const lastStem = getStem(positions.at(-1) + xOffset, lastY + yOffset, lastStep, down, down ? lastY + yOffset + stemLength : lastY + yOffset - stemLength);
    let startY = firstStem.endY;
    let endY = lastStem.endY;
    const beamPoints = notes.map((note, index) => ({
      x: positions[index],
      y: yForStep(displayStep(note, clef), top)
    }));
    if (notes.length > 2 && notes.some(note => note.rhythm === "semiquaver")) {
      const steps = beamPoints.map(point => point.y);
      const spread = Math.max(...steps) - Math.min(...steps);
      if (spread >= STAFF.gap * 0.75) {
        const xMean = beamPoints.reduce((sum, point) => sum + point.x, 0) / beamPoints.length;
        const yMean = beamPoints.reduce((sum, point) => sum + point.y, 0) / beamPoints.length;
        const xVariance = beamPoints.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
        const covariance = beamPoints.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
        let slope = xVariance ? covariance / xVariance : 0;
        const maxSlope = 0.11;
        slope = clamp(slope, -maxSlope, maxSlope);
        if (Math.abs(slope) < 0.035) {
          const firstNoteY = beamPoints[0].y;
          const lastNoteY = beamPoints.at(-1).y;
          slope = lastNoteY <= firstNoteY ? -0.045 : 0.045;
        }
        const centreX = (firstStem.stemX + lastStem.stemX) / 2;
        const centreY = (firstStem.endY + lastStem.endY) / 2;
        startY = centreY + slope * (firstStem.stemX - centreX);
        endY = centreY + slope * (lastStem.stemX - centreX);
      }
    }
    const minStemLength = STAFF.gap * 2.45;
    let beamShift = 0;
    beamPoints.forEach((point, index) => {
      const noteStep = displayStep(notes[index], clef);
      const stemX = getStem(positions[index], point.y, noteStep, down).stemX;
      const projectedY = startY + (stemX - firstStem.stemX) / (lastStem.stemX - firstStem.stemX || 1) * (endY - startY);
      if (down) {
        beamShift = Math.max(beamShift, point.y + minStemLength - projectedY);
      } else {
        beamShift = Math.min(beamShift, point.y - minStemLength - projectedY);
      }
    });
    startY += beamShift;
    endY += beamShift;
    return {
      down,
      start: {
        x: firstStem.stemX,
        y: startY
      },
      end: {
        x: lastStem.stemX,
        y: endY
      }
    };
  }
  function beamYAtX(x, beam) {
    const progress = (x - beam.start.x) / (beam.end.x - beam.start.x || 1);
    return beam.start.y + progress * (beam.end.y - beam.start.y);
  }
  function secondaryBeamForSegment(beam, segment, groupNotes, groupPositions, top, clef) {
    const secondaryOffset = beam.down ? -STAFF.gap * 0.85 : STAFF.gap * 0.85;
    const hookLength = STAFF.gap * 1.25;
    function stemXFor(index) {
      const noteStep = displayStep(groupNotes[index], clef);
      const y = yForStep(noteStep, top);
      return getStem(groupPositions[index], y, noteStep, beam.down).stemX;
    }
    const x1 = stemXFor(segment.startIndex);
    const x2 = segment.isHook ? x1 + (segment.startIndex > 0 ? -hookLength : hookLength) : stemXFor(segment.endIndex);
    return {
      down: beam.down,
      start: {
        x: x1,
        y: beamYAtX(x1, beam) + secondaryOffset
      },
      end: {
        x: x2,
        y: (segment.isHook ? beamYAtX(x1, beam) : beamYAtX(x2, beam)) + secondaryOffset
      }
    };
  }
  function beamPolygonPoints(x1, y1, x2, y2, thickness) {
    const halfThickness = thickness / 2;
    return [`${x1},${y1 - halfThickness}`, `${x2},${y2 - halfThickness}`, `${x2},${y2 + halfThickness}`, `${x1},${y1 + halfThickness}`].join(" ");
  }
  function BeamShape({
    beam,
    colour = "currentColor",
    opacity = 1
  }) {
    const thickness = Math.max(1, STAFF.gap * Number(SHARED_CONFIG.drawing?.beamThicknessScale || 0.42));
    return React.createElement("polygon", {
      points: beamPolygonPoints(beam.start.x - 0.5, beam.start.y, beam.end.x + 0.5, beam.end.y, thickness),
      fill: colour,
      opacity: opacity
    });
  }
  function TieShape({
    firstNote,
    secondNote,
    firstX,
    secondX,
    top,
    clef = "treble",
    colour = "currentColor"
  }) {
    if (!firstNote || !secondNote) return null;
    const firstStep = displayStep(firstNote, clef);
    const secondStep = displayStep(secondNote, clef);
    const firstY = yForStep(firstStep, top);
    const secondY = yForStep(secondStep, top);
    const averageStep = (firstStep + secondStep) / 2;
    const tieAbove = stemDown(averageStep);
    const leftX = Math.min(firstX, secondX) + STAFF.gap * 0.08;
    const rightX = Math.max(firstX, secondX) - STAFF.gap * 0.08;
    const width = Math.max(STAFF.gap * 1.4, rightX - leftX);
    const baseY = (firstY + secondY) / 2 + (tieAbove ? -STAFF.gap * 1.0 : STAFF.gap * 1.0);
    const archDepth = clamp(width * 0.12, STAFF.gap * 0.55, STAFF.gap * 1.45);
    const thickness = Math.max(1.6, STAFF.gap * 0.22);
    const outerY = baseY + (tieAbove ? -archDepth : archDepth);
    const innerY = outerY + (tieAbove ? thickness : -thickness);
    const path = [`M ${leftX} ${baseY}`, `C ${leftX + width * 0.22} ${outerY}, ${rightX - width * 0.22} ${outerY}, ${rightX} ${baseY}`, `C ${rightX - width * 0.22} ${innerY}, ${leftX + width * 0.22} ${innerY}, ${leftX} ${baseY}`, "Z"].join(" ");
    return React.createElement("path", {
      d: path,
      fill: colour,
      transform: `translate(0 ${tieAbove ? -1 : 1})`,
      pointerEvents: "none"
    });
  }
  function LedgerLines({
    x,
    step,
    top,
    colour = "currentColor",
    opacity = 1
  }) {
    const ledgerSteps = [];
    for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) ledgerSteps.push(ledgerStep);
    for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) ledgerSteps.push(ledgerStep);
    const settings = sharedSymbolConfig("ledgerLines");
    const xOffset = STAFF.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const yOffset = STAFF.gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const halfWidth = STAFF.gap * Number(SHARED_CONFIG.drawing?.ledgerLineWidthScale || 2.4) * Number(settings.widthScale || 1) / 2;
    const thickness = Math.max(1, STAFF.gap * Number(SHARED_CONFIG.drawing?.ledgerLineThicknessScale || 0.11) * Number(settings.heightScale || 1));
    return React.createElement("g", null, ledgerSteps.map(ledgerStep => React.createElement("line", {
      key: ledgerStep,
      x1: x - halfWidth + xOffset,
      x2: x + halfWidth + xOffset,
      y1: yForStep(ledgerStep, top) + yOffset,
      y2: yForStep(ledgerStep, top) + yOffset,
      stroke: colour,
      strokeWidth: thickness,
      strokeLinecap: "butt",
      opacity: opacity
    })));
  }
  function Accidental({
    value,
    x,
    y,
    colour = "currentColor"
  }) {
    if (value == null) return null;
    const sharpOffsetX = value === 1 ? -2 : 0;
    return React.createElement(CalibratedSymbol, {
      symbolKey: value === 1 ? "sharpInScore" : value === 0 ? "naturalInScore" : "flatInScore",
      x: x + sharpOffsetX,
      y: y,
      colour: colour
    });
  }
  function Note({
    note,
    x,
    top,
    colour = "currentColor",
    opacity = 1,
    active = false,
    faint = false,
    showFlag = true,
    forcedDown = null,
    forcedEndY = null,
    scale = 1,
    clef = "treble"
  }) {
    if (!note) return null;
    const step = displayStep(note, clef);
    const y = note.rest ? yForStep(4, top) : yForStep(step, top);
    const down = forcedDown ?? stemDown(step);
    const beamed = isBeamableRhythm(note.rhythm) && !showFlag;
    const stem = getStem(x, y, step, down, forcedEndY);
    const dotKey = step % 2 === 0 ? "augmentationDotLine" : "augmentationDotSpace";
    const dotY = step % 2 === 0 ? y - STAFF.gap * 0.25 : y;
    const noteColour = active ? COLOUR.blue : colour;
    const stemThickness = Math.max(1, STAFF.gap * Number(SHARED_CONFIG.drawing?.stemThicknessScale || 0.12));
    return React.createElement("g", {
      pointerEvents: "none",
      opacity: faint ? 0.32 : opacity,
      transform: scale !== 1 ? `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})` : undefined
    }, !note.rest && React.createElement(LedgerLines, {
      x: x,
      step: step,
      top: top,
      colour: noteColour
    }), React.createElement(Accidental, {
      value: note.writtenAccidental,
      x: x - STAFF.gap * 1.75,
      y: y,
      colour: noteColour
    }), React.createElement(CalibratedSymbol, {
      symbolKey: noteSymbolKey(note.rhythm, down, beamed),
      x: x,
      y: y,
      colour: noteColour
    }), (note.rhythm === "dottedMinim" || note.rhythm === "dottedCrotchet") && React.createElement(CalibratedSymbol, {
      symbolKey: dotKey,
      x: x + STAFF.gap * 1.3,
      y: dotY,
      colour: noteColour
    }), beamed && React.createElement("line", {
      x1: stem.stemX,
      x2: stem.stemX,
      y1: stem.startY,
      y2: stem.endY,
      stroke: noteColour,
      strokeWidth: stemThickness
    }));
  }
  function Staff({
    top,
    systemIndex,
    question,
    displayBarCount = BARS_PER_SYSTEM,
    musicStartOverride = null,
    timeSignatureX = null,
    repeatKeySignature = false,
    colour = "currentColor"
  }) {
    const finalBar = Math.min(systemIndex * BARS_PER_SYSTEM + BARS_PER_SYSTEM - 1, question.bars.length - 1);
    const staffEnd = barStart(finalBar, displayBarCount, musicStartOverride) + barWidth(finalBar, displayBarCount, musicStartOverride);
    const clef = question.clef ?? "treble";
    return React.createElement("g", null, [0, 1, 2, 3, 4].map(line => React.createElement("line", {
      key: line,
      x1: STAFF.left,
      x2: staffEnd,
      y1: top + line * STAFF.gap,
      y2: top + line * STAFF.gap,
      stroke: "currentColor",
      strokeWidth: "1.25"
    })), React.createElement(CalibratedSymbol, {
      symbolKey: clef === "bass" ? "fClef" : "gClef",
      x: STAFF.left + 32,
      y: clef === "bass" ? yForStep(6, top) : yForStep(2, top),
      colour: colour
    }), (systemIndex === 0 || repeatKeySignature) && React.createElement(KeySignature, {
      keySignature: question.key,
      top: top,
      clef: clef,
      colour: colour
    }), systemIndex === 0 && React.createElement(TimeSignature, {
      signature: question.timeSignature,
      top: top,
      positionX: timeSignatureX,
      colour: colour
    }));
  }
  function KeySignature({
    keySignature,
    top,
    clef = "treble",
    colour = "currentColor"
  }) {
    return React.createElement("g", null, keySignature.signature.map((item, index) => {
      const clefStep = clef === "bass" ? item.step - 2 : item.step;
      return React.createElement(CalibratedSymbol, {
        key: `${item.type}-${index}`,
        symbolKey: item.type === "sharp" ? "sharpKeySignature" : "flatKeySignature",
        x: STAFF.left + 54 + index * KEY_SIGNATURE_SPACING,
        y: yForStep(clefStep, top),
        colour: colour
      });
    }));
  }
  function TimeSignature({
    signature,
    top,
    positionX = null,
    colour = "currentColor"
  }) {
    const key = `timeSig${signature.top}${signature.bottom}`;
    const settings = sharedSymbolConfig(key);
    const topGlyph = sharedSymbolForKey(`timeSig${signature.top}`);
    const bottomGlyph = sharedSymbolForKey(`timeSig${signature.bottom}`);
    const x = positionX ?? (calibrationAnchorX(key) + STAFF.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0));
    const y = calibrationAnchorY(key, top) + STAFF.gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const fontSize = STAFF.gap * Number(settings.fontSizeScale || 3.4);
    return React.createElement("g", {
      pointerEvents: "none"
    }, React.createElement("text", {
      className: "music-symbol",
      x: x,
      y: y - fontSize * 0.14,
      fill: colour,
      fontSize: fontSize,
      textAnchor: "middle"
    }, topGlyph), React.createElement("text", {
      className: "music-symbol",
      x: x,
      y: y + fontSize * 0.43,
      fill: colour,
      fontSize: fontSize,
      textAnchor: "middle"
    }, bottomGlyph));
  }
  function BarNotes({
    bar,
    notes,
    positions,
    top,
    colour = "currentColor",
    feedback = null,
    hidden = false,
    activeNoteId = null,
    activeNoteIds = null,
    forceStemUp = false,
    timeSignature = null,
    clef = "treble"
  }) {
    const groups = getQuaverGroups(hidden ? bar.notes : notes, timeSignature);
    const shownAccidentals = new Set();
    return React.createElement("g", null, notes.map((note, index) => {
      if (!note) return null;
      const accidentalKey = `${note.letter}:${note.octave}:${note.writtenAccidental}`;
      const hasAccidental = note.writtenAccidental != null;
      const showAccidental = hasAccidental && (note.forceAccidental || !shownAccidentals.has(accidentalKey));
      if (hasAccidental) shownAccidentals.add(accidentalKey);
      const displayNote = showAccidental ? note : {
        ...note,
        writtenAccidental: null
      };
      const group = groupContaining(groups, index);
      const groupNotes = group ? notes.slice(group.start, group.end + 1) : [];
      const groupPositions = group ? positions.slice(group.start, group.end + 1) : [];
      const beam = group && groupNotes.every(Boolean) ? getBeam(groupNotes, groupPositions, top, forceStemUp ? false : null, clef) : null;
      const noteStemDown = forceStemUp ? false : beam?.down ?? null;
      const noteStep = displayStep(note, clef);
      const stem = beam ? getStem(positions[index], yForStep(noteStep, top), noteStep, beam.down) : null;
      const forcedEndY = beam && stem ? beamYAtX(stem.stemX, beam) : null;
      const expected = bar.notes[index];
      const resultColour = feedback && hidden ? note.step === expected?.step ? COLOUR.green : COLOUR.red : colour;
      return React.createElement(Note, {
        key: note.id ?? `${bar.barIndex}-${index}`,
        note: displayNote,
        x: positions[index],
        top: top,
        colour: resultColour,
        active: activeNoteId === note.id || Boolean(activeNoteIds?.includes(note.id)),
        showFlag: !beam,
        forcedDown: noteStemDown,
        forcedEndY: forcedEndY,
        opacity: feedback && hidden && note.step !== expected?.step ? 0.58 : 1,
        clef: clef
      });
    }), groups.map((group, index) => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      if (!groupNotes.every(Boolean)) return null;
      const beam = getBeam(groupNotes, positions.slice(group.start, group.end + 1), top, forceStemUp ? false : null, clef);
      const groupCorrect = groupNotes.every((note, noteIndex) => note?.step === bar.notes[group.start + noteIndex]?.step);
      const beamColour = feedback && hidden ? groupCorrect ? COLOUR.green : COLOUR.red : colour;
      return React.createElement("g", {
        key: `beam-${bar.barIndex}-${index}`
      }, React.createElement(BeamShape, {
        beam: beam,
        colour: beamColour
      }), secondaryBeamSegments(groupNotes).map((segment, segmentIndex) => React.createElement(BeamShape, {
        key: `secondary-${segmentIndex}`,
        beam: secondaryBeamForSegment(beam, segment, groupNotes, positions.slice(group.start, group.end + 1), top, clef),
        colour: beamColour
      })));
    }), notes.map((note, index) => {
      if (!note?.tieToNext || !notes[index + 1]) return null;
      const expected = bar.notes[index];
      const nextExpected = bar.notes[index + 1];
      const tieCorrect = note.step === expected?.step && notes[index + 1]?.step === nextExpected?.step;
      const tieColour = feedback && hidden ? tieCorrect ? COLOUR.green : COLOUR.red : colour;
      return React.createElement(TieShape, {
        key: `tie-${bar.barIndex}-${index}`,
        firstNote: note,
        secondNote: notes[index + 1],
        firstX: positions[index],
        secondX: positions[index + 1],
        top: top,
        clef: clef,
        colour: tieColour
      });
    }));
  }
  function PolytonalListeningScore({ question, activeNoteIds = [] }) {
    const layers = question.layers;
    const systemCount = Math.ceil(question.barCount / BARS_PER_SYSTEM);
    const height = 340 + (systemCount * layers.length - 2) * (STAFF.topB - STAFF.topA);
    const maxKeySigns = Math.max(...layers.map(layer => layer.key.signature.length));
    const firstMusicStart = STAFF.left + Math.max(122, 54 + maxKeySigns * KEY_SIGNATURE_SPACING + 50);
    const laterMusicStart = STAFF.left + Math.max(74, 54 + maxKeySigns * KEY_SIGNATURE_SPACING + 20);
    return React.createElement("svg", {
      viewBox: `0 0 920 ${height}`,
      className: "h-auto w-full select-none overflow-visible",
      role: "img", "aria-label": "Two-part music score"
    }, React.createElement("rect", { width: 920, height, fill: "transparent" }),
    Array.from({ length: systemCount }, (_, systemIndex) => {
      const musicStart = systemIndex === 0 ? firstMusicStart : laterMusicStart;
      const tops = layers.map((_, partIndex) => systemTop((systemIndex * layers.length + partIndex) * BARS_PER_SYSTEM));
      const bottom = tops[tops.length - 1] + STAFF.gap * 4;
      return React.createElement("g", { key: systemIndex },
        layers.map((layer, partIndex) => React.createElement(Staff, {
          key: layer.id, question: layer, top: tops[partIndex], systemIndex,
          musicStartOverride: musicStart, timeSignatureX: firstMusicStart - 34,
          repeatKeySignature: true,
        })),
        React.createElement("line", {
          x1: STAFF.left, x2: STAFF.left, y1: tops[0], y2: bottom,
          stroke: "currentColor", strokeWidth: 1.35,
        }),
        layers[0].bars.slice(systemIndex * BARS_PER_SYSTEM, (systemIndex + 1) * BARS_PER_SYSTEM).map(referenceBar => {
          const barIndex = referenceBar.barIndex;
          const start = barStart(barIndex, BARS_PER_SYSTEM, musicStart);
          const end = start + barWidth(barIndex, BARS_PER_SYSTEM, musicStart);
          const finalBar = barIndex === question.barCount - 1;
          const noteStart = start + 16;
          const noteWidth = end - (finalBar ? 24 : 12) - noteStart;
          return React.createElement("g", { key: barIndex },
            React.createElement("text", {
              x: barIndex % BARS_PER_SYSTEM === 0 ? start - 15 : start + 5,
              y: tops[0] - 17, fontSize: 12, fontWeight: 700,
            }, barIndex + 1),
            layers.map((layer, partIndex) => {
              const bar = layer.bars[barIndex];
              // Both staves use the same beat positions, so simultaneous
              // attacks remain vertically aligned despite different rhythms.
              const positions = bar.notes.map(note => noteStart + note.beat / question.timeSignature.beats * noteWidth);
              return React.createElement(BarNotes, {
                key: layer.id, bar, notes: bar.notes, positions, top: tops[partIndex],
                clef: layer.clef, timeSignature: question.timeSignature, activeNoteIds,
              });
            }),
            finalBar ? React.createElement("g", null,
              React.createElement("line", { x1: end - 5, x2: end - 5, y1: tops[0] - 0.5, y2: bottom + 0.5, stroke: "currentColor", strokeWidth: 1.4 }),
              React.createElement("line", { x1: end, x2: end, y1: tops[0] - 0.5, y2: bottom + 0.5, stroke: "currentColor", strokeWidth: 4 })
            ) : React.createElement("line", { x1: end, x2: end, y1: tops[0], y2: bottom, stroke: "currentColor", strokeWidth: 1.35 })
          );
        })
      );
    }));
  }

  function ListeningScore({
    question,
    activeNoteId = null,
    activeNoteIds = []
  }) {
    if (question.layers) return React.createElement(PolytonalListeningScore, { question, activeNoteIds });
    const systemCount = Math.ceil(question.bars.length / BARS_PER_SYSTEM);
    const systems = Array.from({ length: systemCount }, (_, index) => systemTop(index * BARS_PER_SYSTEM));
    const height = systemCount === 1 ? 250 : 340 + (systemCount - 2) * (STAFF.topB - STAFF.topA);
    return React.createElement("svg", {
      viewBox: `0 0 920 ${height}`,
      className: "h-auto w-full select-none overflow-visible"
    }, React.createElement("rect", {
      width: "920",
      height: height,
      fill: "transparent"
    }), systems.map((top, systemIndex) => React.createElement(Staff, {
      key: systemIndex,
      top: top,
      systemIndex: systemIndex,
      question: question
    })), question.bars.map(bar => {
      const top = systemTop(bar.barIndex);
      const start = barStart(bar.barIndex);
      const end = start + barWidth(bar.barIndex);
      const positions = barPositions(bar);
      return React.createElement("g", {
        key: bar.barIndex
      }, React.createElement("text", {
        x: bar.barIndex % BARS_PER_SYSTEM === 0 ? start - 15 : start + 5,
        y: top - 17,
        fontSize: "12",
        fontWeight: "700"
      }, bar.barIndex + 1), React.createElement(BarNotes, {
        bar: bar,
        notes: bar.notes,
        positions: positions,
        top: top,
        activeNoteId: activeNoteId,
        timeSignature: question.timeSignature
      }), bar.barIndex === question.bars.length - 1 ? React.createElement("g", null, React.createElement("line", {
        x1: end - 5,
        x2: end - 5,
        y1: top - 0.5,
        y2: top + STAFF.gap * 4 + 0.5,
        stroke: "currentColor",
        strokeWidth: "1.4"
      }), React.createElement("line", {
        x1: end,
        x2: end,
        y1: top - 0.5,
        y2: top + STAFF.gap * 4 + 0.5,
        stroke: "currentColor",
        strokeWidth: "4"
      })) : React.createElement("line", {
        x1: end,
        x2: end,
        y1: top,
        y2: top + STAFF.gap * 4,
        stroke: "currentColor",
        strokeWidth: "1.35"
      }));
    }));
  }
  MLH.MelodicDictationNotation = {
    SHARED_SYMBOLS,
    SHARED_CONFIG,
    STAFF,
    BARS_PER_SYSTEM,
    KEY_SIGNATURE_SPACING,
    COLOUR,
    clefStepOffset,
    displayStep,
    yForStep,
    stemDown,
    sharedActualSymbolKey,
    sharedSettingsKey,
    sharedSymbolConfig,
    sharedSymbolForKey,
    calibrationAnchorX,
    calibrationAnchorY,
    CalibratedSymbol,
    noteSymbolKey,
    barStart,
    barWidth,
    systemTop,
    barPositions,
    isBeamableRhythm,
    getQuaverGroups,
    groupContaining,
    secondaryBeamSegments,
    getStem,
    groupHasDownStems,
    getBeam,
    beamYAtX,
    secondaryBeamForSegment,
    beamPolygonPoints,
    BeamShape,
    TieShape,
    LedgerLines,
    Accidental,
    Note,
    Staff,
    KeySignature,
    TimeSignature,
    BarNotes,
    PolytonalListeningScore,
    ListeningScore
  };
})(window.MLH || (window.MLH = {}));
