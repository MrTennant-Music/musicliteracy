(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NAME_RANDOMISER_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const STORAGE_VERSION = 4;
  const RANDOMISER_METHODS = Object.freeze(["Wheel", "Slots"]);
  const DEFAULT_SEGMENT_COLOUR = "#f5f5f4";
  const SEGMENT_COLOURS = Object.freeze([
    { id: "grey", label: "Grey", value: DEFAULT_SEGMENT_COLOUR },
    { id: "black", label: "Black", value: "#111111" },
    { id: "red", label: "Red", value: "#fee2e2" },
    { id: "orange", label: "Orange", value: "#ffedd5" },
    { id: "yellow", label: "Yellow", value: "#fef9c3" },
    { id: "green", label: "Green", value: "#dcfce7" },
    { id: "blue", label: "Blue", value: "#dbeafe" },
    { id: "violet", label: "Violet", value: "#ede9fe" },
  ]);

  function cleanSegmentColour(value) {
    return SEGMENT_COLOURS.some((colour) => colour.value === value) ? value : DEFAULT_SEGMENT_COLOUR;
  }

  function cleanRandomiserMethod(value) {
    if (value === "Puggie") return "Slots";
    return RANDOMISER_METHODS.includes(value) ? value : "Wheel";
  }

  function cleanName(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function capitaliseNameInput(value) {
    return String(value ?? "").replace(/(^|\s)(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("en-GB")}`);
  }

  function cleanSegment(segment, fallbackId = "") {
    const names = Array.isArray(segment?.names) ? segment.names.map(cleanName).filter(Boolean) : [];
    if (!names.length) return null;
    return { id: cleanName(segment?.id) || fallbackId, names };
  }

  function cleanSegments(segments) {
    if (!Array.isArray(segments)) return [];
    return segments.flatMap((segment, index) => {
      const clean = cleanSegment(segment, `segment-${index + 1}`);
      if (!clean) return [];
      return clean.names.map((name, nameIndex) => ({
        id: clean.names.length === 1 ? clean.id : `${clean.id}-${nameIndex + 1}`,
        names: [name],
      }));
    });
  }

  function emptyPersistence() {
    return { version: STORAGE_VERSION, currentSegments: [], savedLists: [], activeSavedId: null, draftName: "", soundEffects: true, borderSymbols: true, segmentColour: DEFAULT_SEGMENT_COLOUR, randomiserMethod: "Wheel" };
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
      borderSymbols: value.borderSymbols !== false,
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
    SEGMENT_COLOURS,
    RANDOMISER_METHODS,
    cleanSegmentColour,
    cleanRandomiserMethod,
    cleanName,
    capitaliseNameInput,
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
