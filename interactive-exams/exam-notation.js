(function (root) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgElement(name, attributes = {}) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  // These dimensions and rhythmic spacing values deliberately match the score
  // renderer in practicequestions.html. Keep both activities visually aligned.
  const Q3_STAFF = { left: 78, right: 842, topA: 72, gap: 11 };
  const Q3_BARS_PER_SYSTEM = 2;
  const Q3_SYSTEM_SPACING = 118;
  const Q3_KEY_SIGNATURE_SPACING = 14;
  const Q3_PITCH_STEPS = { C4: -2, D4: -1, E4: 0, F4: 1, G4: 2, A4: 3, B4: 4, C5: 5, D5: 6, E5: 7, F5: 8, "F♯5": 8, G5: 9, A5: 10 };
  const Q3_PITCH_BY_STEP = Object.fromEntries(Object.entries(Q3_PITCH_STEPS).filter(([pitch]) => pitch !== "F♯5").map(([pitch, step]) => [step, pitch]));
  let q3RepeatArmed = false;
  const Q3_RHYTHMS = {
    semiquaver: { beats: .25, spacing: .62 },
    quaver: { beats: .5, spacing: .95 },
    dottedQuaver: { beats: .75, spacing: 1.12 },
    crotchet: { beats: 1, spacing: 1.35 },
    dottedCrotchet: { beats: 1.5, spacing: 1.75 },
    minim: { beats: 2, spacing: 2.15 },
    dottedMinim: { beats: 3, spacing: 2.75 },
    crotchetRest: { beats: 1, spacing: 1.15 },
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

  function q3NoteSymbolKey(rhythm, down, beamed = false) {
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
    const down = options.down ?? q3StemDown(item.step);
    const beamed = q3Beamable(item) && options.beamed;
    const key = q3NoteSymbolKey(item.rhythm, down, beamed);
    if (!item.rest && (item.step <= -2 || item.step >= 10)) {
      const ledgerY = item.step <= -2 ? q3YForStep(-2, top) : q3YForStep(10, top);
      svg.append(svgElement("line", { x1: x - Q3_STAFF.gap, x2: x + Q3_STAFF.gap, y1: ledgerY, y2: ledgerY, class: "q3-ledger-line" }));
    }
    const visualScale = Number(options.scale || 1);
    const symbolSettings = q3SymbolConfig(key);
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
      q3CalibratedSymbol(svg, dotKey, x + Q3_STAFF.gap * 1.3, item.step % 2 === 0 ? y - Q3_STAFF.gap * .25 : y);
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
  function q3DrawTie(svg, first, second) {
    const midX = (first.x + second.x) / 2;
    const stemsUp = !first.down && !second.down;
    const y = stemsUp ? Math.max(first.y, second.y) + Q3_STAFF.gap * .28 : Math.min(first.y, second.y) - Q3_STAFF.gap * .28;
    const stretch = Math.max(1.4, Math.min(7.2, Math.abs(second.x - first.x) / (Q3_STAFF.gap * 2)));
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
  function q3DrawBarNotes(svg, bar, top, enteredNotes) {
    const positions = q3BarPositions(bar);
    const notes = q3VisibleNotes(bar, enteredNotes);
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
      points[index] = q3DrawNote(svg, item, positions[index], top, { beamed: Boolean(beam), down: beam?.down, forcedEndY: beam && stem ? q3BeamY(stem.stemX, beam) : null });
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
  }

  function q3DrawTimeSignature(svg, value, top) {
    if (!value) return;
    const [upper, lower] = String(value).split("/");
    const key = `timeSig${upper}${lower}`;
    const settings = q3SymbolConfig(key);
    const x = Q3_STAFF.left + 12 * Q3_STAFF.gap + Q3_STAFF.gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const y = q3YForStep(5.3, top) + Q3_STAFF.gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const fontSize = Q3_STAFF.gap * Number(settings.fontSizeScale || 3.4);
    q3Text(svg, q3Glyph(`timeSig${upper}`), { x, y: y - fontSize * .14, "font-size": fontSize, "text-anchor": "middle" }, "q3-music-glyph");
    q3Text(svg, q3Glyph(`timeSig${lower}`), { x, y: y + fontSize * .43, "font-size": fontSize, "text-anchor": "middle" }, "q3-music-glyph");
  }
  function q3DrawSystemPrefix(svg, top, timeSignature) {
    q3CalibratedSymbol(svg, "gClef", Q3_STAFF.left + 32, q3YForStep(2, top));
    q3CalibratedSymbol(svg, "sharpKeySignature", Q3_STAFF.left + 54, q3YForStep(8, top));
    q3DrawTimeSignature(svg, timeSignature, top);
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
      if (questionCard) {
        const undoHistory = JSON.parse(questionCard.dataset.q3NoteHistory || "[]");
        undoHistory.push(currentValue);
        questionCard.dataset.q3NoteHistory = JSON.stringify(undoHistory);
      }
      current[item.noteIndex] = item.pitch;
      const nextValue = current.join(",");
      if (questionCard) questionCard.dataset.q3CurrentNoteValue = nextValue;
      onAnswerChange("q3c", nextValue);
      if (questionCard) {
        const count = current.filter(value => value && value !== "_").length;
        const progress = questionCard.querySelector("[data-note-progress]");
        const undo = questionCard.querySelector("[data-notation-undo]");
        const clear = questionCard.querySelector("[data-notation-reset]");
        if (progress) progress.textContent = `${count} of 3 notes entered`;
        if (undo) undo.disabled = false;
        if (clear) clear.disabled = count === 0;
      }
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
    svg.append(target);
  }

  function q3DrawMissingNoteBox(svg) {
    const top = q3SystemTop(2);
    const positions = q3BarPositions(Q3_BARS[2]);
    const x = positions[0] - 22;
    const width = positions[2] - positions[0] + 44;
    const y = top - Q3_STAFF.gap * 3.4;
    q3Text(svg, "(c) Notes", { x, y: y - 5, "font-size": 12 }, "q3-marking-box-label");
    svg.append(svgElement("rect", {
      x, y, width, height: Q3_STAFF.gap * 10.2,
      class: "q3-marking-box",
    }));
  }

  function q3AddRepeatTargets(svg, onAnswerChange) {
    if (!onAnswerChange) return;
    Q3_BARS.forEach((bar, barIndex) => {
      const top = q3SystemTop(barIndex);
      const x = q3BarStart(barIndex) + q3BarWidth(barIndex);
      const target = svgElement("rect", {
        x: x - 13, y: top - Q3_STAFF.gap * 1.2, width: 26, height: Q3_STAFF.gap * 6.4,
        class: "q3-repeat-hit-area", role: "button", tabindex: "0",
        "aria-label": `Place end repeat at the end of bar ${barIndex + 1}`,
      });
      const placeRepeat = event => {
        if (!q3RepeatArmed) return;
        event.preventDefault();
        q3RepeatArmed = false;
        onAnswerChange("q3d", `end-bar-${barIndex + 1}`);
      };
      target.addEventListener("click", placeRepeat);
      target.addEventListener("keydown", event => {
        if (["Enter", " "].includes(event.key)) placeRepeat(event);
      });
      svg.append(target);
    });
  }

  function q3ScoreSvg(answers, onAnswerChange) {
    const svg = svgElement("svg", { class: "q3-shared-score", viewBox: "0 0 920 540", role: "img", "aria-label": "Interactive music guide for Question 3" });
    q3DrawMissingNoteBox(svg);
    [0, 1, 2, 3].forEach(systemIndex => {
      const firstBar = systemIndex * Q3_BARS_PER_SYSTEM;
      const top = q3SystemTop(firstBar);
      for (let line = 0; line < 5; line += 1) svg.append(svgElement("line", { x1: Q3_STAFF.left, x2: Q3_STAFF.right, y1: top + line * Q3_STAFF.gap, y2: top + line * Q3_STAFF.gap, class: "q3-staff-line" }));
      q3DrawSystemPrefix(svg, top, systemIndex === 0 ? answers.q3a : null);
      for (let local = 0; local < Q3_BARS_PER_SYSTEM; local += 1) {
        const barIndex = firstBar + local;
        const item = Q3_BARS[barIndex];
        const start = q3BarStart(barIndex);
        const end = start + q3BarWidth(barIndex);
        q3Text(svg, String(barIndex + 1), { x: local === 0 ? start - 15 : start + 5, y: top - 17, "text-anchor": "middle" }, "q3-bar-number");
        q3DrawBarNotes(svg, item, top, answers.q3c);
        svg.append(svgElement("line", { x1: end, x2: end, y1: top, y2: top + Q3_STAFF.gap * 4, class: "q3-barline" }));
      }
    });
    const dynamicKey = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[answers.q3b];
    if (dynamicKey) q3CalibratedSymbol(svg, dynamicKey, q3BarPositions(Q3_BARS[0])[0], Q3_STAFF.topA + Q3_STAFF.gap * 7.85);
    const repeat = answers.q3d;
    if (repeat) {
      const match = String(repeat).match(/^end-bar-(\d+)$/);
      const barIndex = match ? Math.max(0, Math.min(7, Number(match[1]) - 1)) : 0;
      const barlineX = q3BarStart(barIndex) + q3BarWidth(barIndex);
      const placementX = barlineX + (barIndex === Q3_BARS.length - 1 ? 6 : 4);
      const x = placementX - Q3_STAFF.gap * 1.1 + 3;
      q3CalibratedSymbol(svg, "repeatRight", x, q3YForStep(4, q3SystemTop(barIndex)));
    }
    q3AddNoteEntryTargets(svg, answers, onAnswerChange);
    q3AddRepeatTargets(svg, onAnswerChange);
    return svg;
  }

  function renderSharedScore(container, question, answers, onAnswerChange) {
    container.innerHTML = `<div class="shared-notation-heading"><strong>Music guide</strong><span>Apply answers for parts (a)–(d) directly to the score.</span></div><div class="shared-notation-score-wrap"></div>`;
    container.querySelector(".shared-notation-score-wrap").append(q3ScoreSvg(answers || {}, onAnswerChange));
  }

  function renderSharedControls(container, subquestion, value, onChange) {
    let history = String(value || "").split(",").filter(item => item && item !== "_");
    container.innerHTML = `<div class="notation-controls-only"><div class="notation-tools" role="group" aria-label="${subquestion.prompt}"></div><div class="notation-entry-meta" hidden><span data-note-progress></span><div class="notation-actions"><button type="button" class="button button-secondary button-small" data-notation-undo>Undo</button><button type="button" class="button button-secondary button-small" data-notation-reset>Clear</button></div></div></div>`;
    const tools = container.querySelector(".notation-tools");
    const meta = container.querySelector(".notation-entry-meta");
    const progress = container.querySelector("[data-note-progress]");
    const undo = container.querySelector("[data-notation-undo]");
    const reset = container.querySelector("[data-notation-reset]");
    const isNotes = subquestion.notationTool === "note-entry";
    meta.hidden = !isNotes;
    const questionCard = container.closest(".question-card");
    if (isNotes && questionCard) questionCard.dataset.q3CurrentNoteValue = String(value || "");

    function refresh(next, notify = true) {
      const selected = isNotes ? history.join(",") : next;
      tools.querySelectorAll("button").forEach(button => button.classList.toggle("is-selected", !isNotes && button.dataset.value === selected));
      if (isNotes) {
        progress.textContent = `${history.length} of ${subquestion.noteSlots} notes entered`;
        undo.disabled = history.length === 0;
        reset.disabled = history.length === 0;
      }
      if (notify) onChange(selected);
    }

    if (isNotes) {
      const hint = document.createElement("p");
      hint.className = "notation-score-hint";
      hint.textContent = "Select each missing note position directly on the score above.";
      tools.append(hint);
    }

    subquestion.options.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `notation-tool-button notation-tool-${subquestion.notationTool}`;
      button.dataset.value = item.value;
      if (subquestion.notationTool === "dynamic") {
        const symbol = { p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte" }[item.value];
        button.innerHTML = `<span class="notation-option-glyph" aria-hidden="true">${q3Glyph(symbol)}</span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "time-signature") {
        const [upper, lower] = item.value.split("/");
        button.innerHTML = `<span class="notation-time-signature-preview" aria-hidden="true"><span>${q3Glyph(`timeSig${upper}`)}</span><span>${q3Glyph(`timeSig${lower}`)}</span></span><span class="visually-hidden">${item.label}</span>`;
      } else if (subquestion.notationTool === "repeat-sign") {
        button.innerHTML = `<span class="notation-option-glyph notation-repeat-option-glyph" aria-hidden="true">${q3Glyph("repeatRight")}</span><span class="visually-hidden">${item.label}</span>`;
      } else button.textContent = item.label;
      button.addEventListener("click", () => {
        if (subquestion.notationTool === "repeat-sign") {
          q3RepeatArmed = true;
          button.classList.add("is-selected");
          return;
        }
        if (!isNotes) return refresh(item.value);
        if (history.length >= subquestion.noteSlots) return;
        history.push(item.value);
        refresh(history.join(","));
      });
      tools.append(button);
    });
    undo.addEventListener("click", () => {
      if (isNotes) {
        const undoHistory = JSON.parse(questionCard?.dataset.q3NoteHistory || "[]");
        if (!undoHistory.length) return;
        const previous = undoHistory.pop();
        if (questionCard) {
          questionCard.dataset.q3NoteHistory = JSON.stringify(undoHistory);
          questionCard.dataset.q3CurrentNoteValue = previous;
        }
        return onChange(previous);
      }
      history.pop(); refresh(history.join(","));
    });
    reset.addEventListener("click", () => {
      if (isNotes) {
        const currentValue = questionCard?.dataset.q3CurrentNoteValue || "";
        if (currentValue && questionCard) {
          const undoHistory = JSON.parse(questionCard.dataset.q3NoteHistory || "[]");
          undoHistory.push(currentValue);
          questionCard.dataset.q3NoteHistory = JSON.stringify(undoHistory);
          questionCard.dataset.q3CurrentNoteValue = "";
        }
        return onChange("");
      }
      history = []; refresh("");
    });
    refresh(value || "", false);
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
        <div class="notation-actions">
          <button type="button" class="button button-secondary button-small" data-notation-undo>Undo</button>
          <button type="button" class="button button-secondary button-small" data-notation-reset>Reset</button>
        </div>
      </div>`;
    const svg = container.querySelector("svg");
    const tools = container.querySelector(".notation-tools");
    const undo = container.querySelector("[data-notation-undo]");
    const reset = container.querySelector("[data-notation-reset]");

    function update(next, record = true) {
      if (record && next !== history.at(-1)) history.push(next);
      svg.innerHTML = "";
      drawStaff(svg, next, subquestion.notationTool);
      tools.querySelectorAll("button").forEach(button => button.classList.toggle("is-selected", button.dataset.value === next));
      undo.disabled = history.length < 2;
      reset.disabled = !next;
      onChange(next);
    }

    subquestion.options.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "notation-tool-button";
      button.dataset.value = item.value;
      button.textContent = item.label;
      button.addEventListener("click", () => {
        if (subquestion.notationTool !== "note-entry") return update(item.value);
        const notes = String(history.at(-1) || "").split(",").filter(Boolean);
        if (notes.length >= subquestion.noteSlots) return;
        notes.push(item.value);
        update(notes.join(","));
      });
      tools.append(button);
    });
    undo.addEventListener("click", () => {
      if (history.length < 2) return;
      history.pop();
      update(history.at(-1) || "", false);
    });
    reset.addEventListener("click", () => { history = []; update("", false); });
    update(value || "", false);
  }

  const api = { render, renderSharedScore };
  root.ExamNotation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
