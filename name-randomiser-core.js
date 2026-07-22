(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NAME_RANDOMISER_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const STORAGE_VERSION = 4;
  const RANDOMISER_METHODS = Object.freeze(["Wheel", "Rows"]);
  const MULTI_SEGMENT_COLOUR = "multi";
  const WHITE_SEGMENT_COLOUR = "#ffffff";
  const DEFAULT_SEGMENT_COLOUR = MULTI_SEGMENT_COLOUR;
  const MULTI_CONTROL_COLOUR = "#ffffff";
  const MULTI_SEGMENT_PALETTE = Object.freeze(["#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7", "#dbeafe", "#ede9fe"]);
  const SEGMENT_COLOURS = Object.freeze([
    { id: "multi", label: "Multi", value: MULTI_SEGMENT_COLOUR, palette: MULTI_SEGMENT_PALETTE },
    { id: "white", label: "White", value: WHITE_SEGMENT_COLOUR, strongValue: "#fafaf9" },
    { id: "black", label: "Black", value: "#111111", strongValue: "#ffffff" },
    { id: "red", label: "Red", value: "#fee2e2", strongValue: "#fca5a5" },
    { id: "yellow", label: "Yellow", value: "#fef9c3", strongValue: "#fde047" },
    { id: "green", label: "Green", value: "#dcfce7", strongValue: "#86efac" },
    { id: "blue", label: "Blue", value: "#dbeafe", strongValue: "#93c5fd" },
    { id: "violet", label: "Violet", value: "#ede9fe", strongValue: "#c4b5fd" },
  ]);

  function cleanSegmentColour(value) {
    if (value === "#f5f5f4") return WHITE_SEGMENT_COLOUR;
    if (value === "#ffedd5") return MULTI_SEGMENT_COLOUR;
    return SEGMENT_COLOURS.some((colour) => colour.value === value) ? value : DEFAULT_SEGMENT_COLOUR;
  }

  function segmentColourPalette(value) {
    const selected = SEGMENT_COLOURS.find((colour) => colour.value === cleanSegmentColour(value)) || SEGMENT_COLOURS[0];
    if (selected.value === MULTI_SEGMENT_COLOUR) return [...MULTI_SEGMENT_PALETTE];
    return [selected.strongValue, selected.value];
  }

  function spinControlColour(value) {
    const selected = SEGMENT_COLOURS.find((colour) => colour.value === cleanSegmentColour(value)) || SEGMENT_COLOURS[0];
    if (selected.value === WHITE_SEGMENT_COLOUR || selected.value === "#111111") return "#111111";
    if (selected.value === MULTI_SEGMENT_COLOUR) return MULTI_CONTROL_COLOUR;
    return selected.strongValue;
  }

  function cleanRandomiserMethod(value) {
    if (value === "Puggie" || value === "Slots") return "Rows";
    return RANDOMISER_METHODS.includes(value) ? value : "Wheel";
  }

  function cleanName(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function capitaliseNameInput(value) {
    return String(value ?? "").replace(/(^|\s)(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("en-GB")}`);
  }

  function normaliseNameKey(value) {
    return cleanName(value).toLocaleLowerCase("en-GB");
  }

  function classListNumbering(value, segments = []) {
    const used = new Set(cleanSegments(segments).map((segment) => normaliseNameKey(segment.names[0])));
    let count = 0;
    const numbers = String(value ?? "").split(/\r?\n/).map((line) => {
      const key = normaliseNameKey(line);
      if (!key || used.has(key)) return null;
      used.add(key);
      count += 1;
      return count;
    });
    return { count, numbers };
  }

  function hasName(segments, name) {
    const key = normaliseNameKey(name);
    return Boolean(key) && cleanSegments(segments).some((segment) => normaliseNameKey(segment.names[0]) === key);
  }

  function uniqueNewNames(value, segments = []) {
    const used = new Set(cleanSegments(segments).map((segment) => normaliseNameKey(segment.names[0])));
    return String(value ?? "").split(/\r?\n/).map((name) => cleanName(capitaliseNameInput(name))).filter((name) => {
      const key = normaliseNameKey(name);
      if (!key || used.has(key)) return false;
      used.add(key);
      return true;
    });
  }

  function cleanSegment(segment, fallbackId = "") {
    const names = Array.isArray(segment?.names) ? segment.names.map(cleanName).filter(Boolean) : [];
    if (!names.length) return null;
    return { id: cleanName(segment?.id) || fallbackId, names };
  }

  function cleanSegments(segments) {
    if (!Array.isArray(segments)) return [];
    const usedNames = new Set();
    return segments.flatMap((segment, index) => {
      const clean = cleanSegment(segment, `segment-${index + 1}`);
      if (!clean) return [];
      return clean.names.flatMap((name, nameIndex) => {
        const key = normaliseNameKey(name);
        if (usedNames.has(key)) return [];
        usedNames.add(key);
        return [{
          id: clean.names.length === 1 ? clean.id : `${clean.id}-${nameIndex + 1}`,
          names: [name],
        }];
      });
    });
  }

  function emptyPersistence() {
    return { version: STORAGE_VERSION, currentSegments: [], savedLists: [], activeSavedId: null, draftName: "", soundEffects: true, segmentColour: DEFAULT_SEGMENT_COLOUR, randomiserMethod: "Wheel" };
  }

  function cleanPersistence(value) {
    const fallback = emptyPersistence();
    if (!value || typeof value !== "object") return fallback;
    const savedLists = Array.isArray(value.savedLists) ? value.savedLists.map((list, index) => {
      const title = cleanName(list?.title);
      const segments = cleanSegments(list?.segments);
      if (!title || !segments.length) return null;
      return { id: cleanName(list?.id) || `list-${index + 1}`, title, segments };
    }).filter(Boolean) : [];
    const draftName = capitaliseNameInput(value.draftName ?? (Array.isArray(value.draftNames) ? value.draftNames[0] : "") ?? "");
    return {
      version: STORAGE_VERSION,
      currentSegments: cleanSegments(value.currentSegments),
      savedLists,
      activeSavedId: savedLists.some((list) => list.id === value.activeSavedId) ? value.activeSavedId : null,
      draftName,
      soundEffects: value.soundEffects !== false,
      segmentColour: cleanSegmentColour(value.segmentColour),
      randomiserMethod: cleanRandomiserMethod(value.randomiserMethod),
    };
  }

  function chooseIndex(count, random = Math.random) {
    if (!Number.isInteger(count) || count < 1) return -1;
    const value = Number(random());
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(0.999999999999, value)) : 0;
    return Math.floor(safeValue * count);
  }

  function copySegments(segments) {
    return cleanSegments(segments).map((segment) => ({ ...segment, names: [...segment.names] }));
  }

  function saveList(savedLists, list) {
    const clean = {
      id: cleanName(list?.id),
      title: cleanName(list?.title),
      segments: copySegments(list?.segments),
    };
    if (!clean.id || !clean.title || !clean.segments.length) return Array.isArray(savedLists) ? savedLists : [];
    const existing = Array.isArray(savedLists) ? savedLists : [];
    const match = existing.findIndex((item) => item.id === clean.id);
    return match < 0 ? [...existing, clean] : existing.map((item, index) => index === match ? clean : item);
  }

  function removeSegment(segments, id) {
    return cleanSegments(segments).filter((segment) => segment.id !== id);
  }

  return {
    STORAGE_VERSION,
    DEFAULT_SEGMENT_COLOUR,
    MULTI_SEGMENT_COLOUR,
    MULTI_CONTROL_COLOUR,
    MULTI_SEGMENT_PALETTE,
    SEGMENT_COLOURS,
    segmentColourPalette,
    spinControlColour,
    RANDOMISER_METHODS,
    cleanSegmentColour,
    cleanRandomiserMethod,
    cleanName,
    capitaliseNameInput,
    normaliseNameKey,
    classListNumbering,
    hasName,
    uniqueNewNames,
    cleanSegment,
    cleanSegments,
    emptyPersistence,
    cleanPersistence,
    chooseIndex,
    copySegments,
    saveList,
    removeSegment,
  };
});
