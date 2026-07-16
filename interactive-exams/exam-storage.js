(function (root) {
  "use strict";

  const PREFIX = "mlh-interactive-exams-v1";
  const key = (paperId, suffix) => `${PREFIX}:${paperId}:${suffix}`;

  function read(storageKey, fallback) {
    try {
      const value = root.localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(storageKey, value) {
    try {
      root.localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  const api = {
    loadDraft(paperId) { return read(key(paperId, "draft"), null); },
    saveDraft(paperId, attempt) { return write(key(paperId, "draft"), { ...attempt, savedAt: new Date().toISOString() }); },
    deleteDraft(paperId) { try { root.localStorage.removeItem(key(paperId, "draft")); return true; } catch { return false; } },
    loadSubmitted(paperId) { return read(key(paperId, "submitted"), null); },
    saveSubmitted(paperId, attempt) { return write(key(paperId, "submitted"), { ...attempt, savedAt: new Date().toISOString() }); },
    deleteSubmitted(paperId) { try { root.localStorage.removeItem(key(paperId, "submitted")); return true; } catch { return false; } },
    loadAttempts(paperId) { return read(key(paperId, "attempts"), []); },
    addAttempt(paperId, attempt) {
      const attempts = api.loadAttempts(paperId);
      attempts.unshift(attempt);
      write(key(paperId, "attempts"), attempts.slice(0, 20));
      return attempts[0];
    },
    bestScore(paperId) {
      const scores = api.loadAttempts(paperId).map(item => Number(item.score)).filter(Number.isFinite);
      return scores.length ? Math.max(...scores) : null;
    },
    clearAll(paperId) {
      try {
        root.localStorage.removeItem(key(paperId, "draft"));
        root.localStorage.removeItem(key(paperId, "submitted"));
        root.localStorage.removeItem(key(paperId, "attempts"));
        return true;
      } catch { return false; }
    },
  };

  root.ExamStorage = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
