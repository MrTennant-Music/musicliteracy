(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.NAME_RANDOMISER_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const STORAGE_VERSION = 1;

  function cleanName(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function cleanSegment(segment, fallbackId = "") {
    const names = Array.isArray(segment?.names) ? segment.names.map(cleanName).filter(Boolean) : [];
    if (!names.length) return null;
    return { id: cleanName(segment?.id) || fallbackId, names };
  }

  function cleanSegments(segments) {
    if (!Array.isArray(segments)) return [];
    return segments.map((segment, index) => cleanSegment(segment, `segment-${index + 1}`)).filter(Boolean);
  }

  function emptyPersistence() {
    return { version: STORAGE_VERSION, currentSegments: [], savedLists: [], activeSavedId: null, draftNames: [""], soundEffects: true };
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
    const draftNames = Array.isArray(value.draftNames) ? value.draftNames.map((name) => String(name ?? "")) : [""];
    return {
      version: STORAGE_VERSION,
      currentSegments: cleanSegments(value.currentSegments),
      savedLists,
      activeSavedId: savedLists.some((list) => list.id === value.activeSavedId) ? value.activeSavedId : null,
      draftNames: draftNames.length ? draftNames : [""],
      soundEffects: value.soundEffects !== false,
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
    cleanName,
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
