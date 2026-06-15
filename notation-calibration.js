/*
  Notation calibration page.

  This admin page draws one single-bar grand staff. The stave is the fixed
  reference. Only the selected Bravura symbol is draggable.
*/

const SVG_NS = "http://www.w3.org/2000/svg";

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value));
}

const DEFAULT_CONFIG = cloneConfig(SHARED_NOTATION_CONFIG);
let config = cloneConfig(DEFAULT_CONFIG);
let selectedCategory = "Clefs";
let selectedSymbolKey = "gClef";
let dragState = null;

const stage = document.getElementById("notationStage");
const categorySelect = document.getElementById("categorySelect");
const symbolSelect = document.getElementById("symbolSelect");
const exportText = document.getElementById("exportText");
const importText = document.getElementById("importText");

const controls = {
  fontSizeScale: document.getElementById("fontSizeScale"),
  widthScale: document.getElementById("widthScale"),
  heightScale: document.getElementById("heightScale"),
  xOffsetScale: document.getElementById("xOffsetScale"),
  yOffsetScale: document.getElementById("yOffsetScale"),
};

const outputs = Object.fromEntries(
  Object.keys(controls).map((id) => [id, document.getElementById(`${id}Value`)])
);

const SYMBOL_GROUPS = {
  "Clefs": ["gClef", "fClef"],
  "Notes": ["wholeNote", "halfNoteStemUp", "halfNoteStemDown", "quarterNoteStemUp", "quarterNoteStemDown", "eighthNoteStemUp", "eighthNoteStemDown", "sixteenthNoteStemUp", "sixteenthNoteStemDown", "augmentationDot", "tie"],
  "Accidentals": ["flat", "natural", "sharp"],
  "Rests": ["wholeRest", "halfRest", "quarterRest", "eighthRest", "sixteenthRest"],
  "Barlines and repeats": ["barlineSingle", "barlineFinal", "repeatLeft", "repeatRight", "dalSegno", "daCapo", "segno"],
  "Time signatures": ["timeSig1", "timeSig2", "timeSig3", "timeSig4", "timeSig5", "timeSig6", "timeSig8", "timeSig9"],
  "Articulations": ["accentAbove", "accentBelow", "staccatoAbove", "staccatoBelow"],
  "Dynamics": ["piano", "forte", "pianissimo", "mezzoPiano", "mezzoForte", "fortissimo", "sforzato", "crescendo", "diminuendo"],
  "Octave markings": ["ottavaAlta", "ottavaBassa"],
  "Other": ["brace", "play", "stop"],
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
  barlineSingle: "Single barline",
  barlineFinal: "Final barline",
  repeatLeft: "Start repeat",
  repeatRight: "End repeat",
  dalSegno: "Dal segno",
  daCapo: "Da capo",
  segno: "Segno",
  gClef: "Treble clef",
  fClef: "Bass clef",
  timeSig1: "Time signature 1",
  timeSig2: "Time signature 2",
  timeSig3: "Time signature 3",
  timeSig4: "Time signature 4",
  timeSig5: "Time signature 5",
  timeSig6: "Time signature 6",
  timeSig8: "Time signature 8",
  timeSig9: "Time signature 9",
  wholeNote: "Semibreve",
  halfNoteStemUp: "Minim stem up",
  halfNoteStemDown: "Minim stem down",
  quarterNoteStemUp: "Crotchet stem up",
  quarterNoteStemDown: "Crotchet stem down",
  eighthNoteStemUp: "Quaver stem up",
  eighthNoteStemDown: "Quaver stem down",
  sixteenthNoteStemUp: "Semiquaver stem up",
  sixteenthNoteStemDown: "Semiquaver stem down",
  augmentationDot: "Dot",
  tie: "Tie",
  flat: "Flat",
  natural: "Natural",
  sharp: "Sharp",
  accentAbove: "Accent above",
  accentBelow: "Accent below",
  staccatoAbove: "Staccato above",
  staccatoBelow: "Staccato below",
  wholeRest: "Semibreve rest",
  halfRest: "Minim rest",
  quarterRest: "Crotchet rest",
  eighthRest: "Quaver rest",
  sixteenthRest: "Semiquaver rest",
  ottavaAlta: "8va",
  ottavaBassa: "8vb",
  piano: "Piano",
  forte: "Forte",
  pianissimo: "Pianissimo",
  mezzoPiano: "Mezzo piano",
  mezzoForte: "Mezzo forte",
  fortissimo: "Fortissimo",
  sforzato: "Sforzato",
  crescendo: "Crescendo",
  diminuendo: "Diminuendo",
  play: "Play",
  stop: "Stop",
};

function symbolLabel(key) {
  return SYMBOL_LABELS[key] || key;
}

const DEFAULT_ANCHOR = { staff: "treble", xScale: 30, step: 4 };
const SYMBOL_ANCHORS = {
  brace: { staff: "system", xScale: -2.5, step: 4 },
  barlineSingle: { staff: "system", xScale: 6, step: 4 },
  barlineFinal: { staff: "system", xScale: 70, step: 4 },
  repeatLeft: { staff: "system", xScale: 12, step: 4 },
  repeatRight: { staff: "system", xScale: 62, step: 4 },
  dalSegno: { staff: "treble", xScale: 18, step: 11 },
  daCapo: { staff: "treble", xScale: 28, step: 11 },
  segno: { staff: "treble", xScale: 38, step: 11 },
  gClef: { staff: "treble", xScale: 3.2, step: 2 },
  fClef: { staff: "bass", xScale: 3.2, step: 6 },
  timeSig1: { staff: "treble", xScale: 12, step: 5.3 },
  timeSig2: { staff: "treble", xScale: 16, step: 5.3 },
  timeSig3: { staff: "treble", xScale: 20, step: 5.3 },
  timeSig4: { staff: "treble", xScale: 24, step: 5.3 },
  timeSig5: { staff: "treble", xScale: 28, step: 5.3 },
  timeSig6: { staff: "treble", xScale: 32, step: 5.3 },
  timeSig8: { staff: "treble", xScale: 36, step: 5.3 },
  timeSig9: { staff: "treble", xScale: 40, step: 5.3 },
  wholeNote: { staff: "treble", xScale: 26, step: 4, ledger: [] },
  halfNoteStemUp: { staff: "treble", xScale: 22, step: 2 },
  halfNoteStemDown: { staff: "treble", xScale: 30, step: 7 },
  quarterNoteStemUp: { staff: "treble", xScale: 18, step: 0 },
  quarterNoteStemDown: { staff: "treble", xScale: 34, step: 8, ledger: [10] },
  eighthNoteStemUp: { staff: "treble", xScale: 40, step: 1, beam: "up" },
  eighthNoteStemDown: { staff: "treble", xScale: 48, step: 6, beam: "down" },
  sixteenthNoteStemUp: { staff: "bass", xScale: 40, step: -2, ledger: [-2] },
  sixteenthNoteStemDown: { staff: "bass", xScale: 48, step: 7 },
  augmentationDot: { staff: "treble", xScale: 35.8, step: 8 },
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
  ottavaAlta: { staff: "treble", xScale: 28, step: 12 },
  ottavaBassa: { staff: "bass", xScale: 28, step: -4 },
  piano: { staff: "treble", xScale: 20, step: -5.4 },
  forte: { staff: "treble", xScale: 27, step: -5.4 },
  pianissimo: { staff: "treble", xScale: 34, step: -5.4 },
  mezzoPiano: { staff: "treble", xScale: 42, step: -5.4 },
  mezzoForte: { staff: "treble", xScale: 50, step: -5.4 },
  fortissimo: { staff: "treble", xScale: 58, step: -5.4 },
  sforzato: { staff: "treble", xScale: 66, step: -5.4 },
  crescendo: { staff: "bass", xScale: 28, step: -5.2 },
  diminuendo: { staff: "bass", xScale: 46, step: -5.2 },
  play: { staff: "treble", xScale: 22, step: 12 },
  stop: { staff: "treble", xScale: 30, step: 12 },
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
    config.symbols[key] = { fontSizeScale: 2, xOffsetScale: 0, yOffsetScale: 0, widthScale: 1, heightScale: 1, opticalXOffset: 0, opticalYOffset: 0 };
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
  append(parent, makeElement("line", {
    class: "barline fixed-reference",
    x1: x + width - px(ctx, 0.4),
    x2: x + width - px(ctx, 0.4),
    y1: top,
    y2: bottom,
    "stroke-width": Math.max(1, ctx.lineGap * 0.25),
  }));
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
  const symbol = BRAVURA_SYMBOLS[key];
  if (!symbol) return null;

  const settings = symbolConfig(key);
  const adjustedX = x + px(ctx, settings.xOffsetScale) + Number(settings.opticalXOffset || 0);
  const adjustedY = y + px(ctx, settings.yOffsetScale) + Number(settings.opticalYOffset || 0);
  const fontSize = px(ctx, settings.fontSizeScale);
  const group = append(parent, makeElement("g", {
    class: `calibration-symbol ${isSelected(key) ? "selected" : ""}`,
    "data-symbol-key": key,
    "data-line-gap": ctx.lineGap,
  }));

  if (interactive && isSelected(key)) {
    append(group, makeElement("rect", {
      class: "selected-symbol-outline",
      x: adjustedX - fontSize * 0.45,
      y: adjustedY - fontSize * 0.85,
      width: fontSize * 0.9,
      height: fontSize,
      rx: 4,
    }));
  }

  append(group, makeElement("text", {
    class: "music-symbol",
    x: adjustedX,
    y: adjustedY,
    "font-size": fontSize,
    "text-anchor": "middle",
    transform: `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`,
  }, symbol));

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
  if (key === "augmentationDot") {
    drawSymbol(parent, ctx, "quarterNoteStemDown", point.x - px(ctx, 1.55), point.y, false);
  }
  if (["accentAbove", "accentBelow", "staccatoAbove", "staccatoBelow"].includes(key)) {
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
  stage.replaceChildren();
  const width = Number(config.stave.width);
  let nextY = 35;

  const mainHeight = renderSingleBarGrandStaff(stage, {
    x: 90,
    y: nextY,
    width,
    lineGap: Number(config.stave.lineGap),
    showGuides: Boolean(config.stave.showGuides),
    interactive: true,
    label: "Single-bar grand staff calibration",
  }).height;

  nextY += mainHeight + 48;

  stage.setAttribute("viewBox", `0 0 1200 ${Math.ceil(nextY + 20)}`);
}

function updateExportText() {
  exportText.value = `const SHARED_NOTATION_CONFIG = ${JSON.stringify(config, null, 2)};`;
}

function fillCategorySelect() {
  categorySelect.innerHTML = Object.keys(SYMBOL_GROUPS).map((groupName) => `<option value="${groupName}">${groupName}</option>`).join("");
  categorySelect.value = selectedCategory;
}

function fillSymbolSelect() {
  const keys = SYMBOL_GROUPS[selectedCategory] || [];
  symbolSelect.innerHTML = keys
    .filter((key) => BRAVURA_SYMBOLS[key])
    .map((key) => `<option value="${key}">${symbolLabel(key)}</option>`)
    .join("");
  if (!keys.includes(selectedSymbolKey)) selectedSymbolKey = keys[0] || "";
  symbolSelect.value = selectedSymbolKey;
}

function decimalsFor(control) {
  return control.step && Number(control.step) < 1 ? 2 : 0;
}

function setRange(control, value) {
  control.value = value;
  const output = outputs[control.id];
  if (output) output.textContent = Number(value).toFixed(decimalsFor(control));
}

function setSymbolControlsDisabled(disabled) {
  SYMBOL_SETTING_KEYS.forEach((key) => {
    controls[key].disabled = disabled;
  });
}

function syncControlsFromConfig() {
  fillCategorySelect();
  fillSymbolSelect();
  if (!selectedSymbolKey) {
    setSymbolControlsDisabled(true);
    SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], 0));
    return;
  }

  setSymbolControlsDisabled(false);
  const settings = symbolConfig(selectedSymbolKey);
  SYMBOL_SETTING_KEYS.forEach((key) => setRange(controls[key], settings[key]));
}

function updateAll() {
  syncControlsFromConfig();
  renderStage();
  updateExportText();
}

function updateSymbolSetting(key, value) {
  if (!selectedSymbolKey) return;
  symbolConfig(selectedSymbolKey)[key] = Number(value);
  updateAll();
}

function svgPointFromEvent(event) {
  const point = stage.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(stage.getScreenCTM().inverse());
}

function startDrag(event) {
  const symbolGroup = event.target.closest(".calibration-symbol");
  if (!symbolGroup) return;

  const key = symbolGroup.dataset.symbolKey;
  if (!key) return;

  event.preventDefault();
  selectedSymbolKey = key;
  selectedCategory = Object.entries(SYMBOL_GROUPS).find(([, keys]) => keys.includes(key))?.[0] || selectedCategory;

  const point = svgPointFromEvent(event);
  const settings = symbolConfig(key);
  dragState = {
    key,
    startX: point.x,
    startY: point.y,
    startXOffsetScale: Number(settings.xOffsetScale || 0),
    startYOffsetScale: Number(settings.yOffsetScale || 0),
    lineGap: Number(symbolGroup.dataset.lineGap || config.stave.lineGap),
  };

  stage.setPointerCapture(event.pointerId);
  updateAll();
}

function moveDrag(event) {
  if (!dragState) return;
  const point = svgPointFromEvent(event);
  const settings = symbolConfig(dragState.key);
  settings.xOffsetScale = dragState.startXOffsetScale + (point.x - dragState.startX) / dragState.lineGap;
  settings.yOffsetScale = dragState.startYOffsetScale + (point.y - dragState.startY) / dragState.lineGap;
  updateAll();
}

function endDrag(event) {
  if (!dragState) return;
  try {
    stage.releasePointerCapture(event.pointerId);
  } catch {}
  dragState = null;
}

function parseImportedConfig(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Import box is empty.");
  const objectText = trimmed
    .replace(/^const\s+SHARED_NOTATION_CONFIG\s*=\s*/, "")
    .replace(/;\s*$/, "");
  return JSON.parse(objectText);
}

categorySelect.addEventListener("change", () => {
  selectedCategory = categorySelect.value;
  selectedSymbolKey = SYMBOL_GROUPS[selectedCategory]?.[0] || "";
  updateAll();
});

symbolSelect.addEventListener("change", () => {
  selectedSymbolKey = symbolSelect.value;
  updateAll();
});

SYMBOL_SETTING_KEYS.forEach((key) => {
  controls[key].addEventListener("input", () => updateSymbolSetting(key, controls[key].value));
});

stage.addEventListener("pointerdown", startDrag);
stage.addEventListener("pointermove", moveDrag);
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

document.getElementById("resetButton").addEventListener("click", () => {
  if (!selectedSymbolKey) return;
  config.symbols[selectedSymbolKey] = cloneConfig(
    DEFAULT_CONFIG.symbols[selectedSymbolKey] || symbolConfig(selectedSymbolKey)
  );
  updateAll();
});

document.getElementById("exportButton").addEventListener("click", async () => {
  updateExportText();
  exportText.select();
  try {
    await navigator.clipboard.writeText(exportText.value);
  } catch (error) {
    document.execCommand("copy");
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

updateAll();
