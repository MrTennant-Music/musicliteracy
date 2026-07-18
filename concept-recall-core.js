(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CONCEPT_RECALL_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const LEVELS = Object.freeze({
    N3: { label: "National 3", rank: 0 },
    N4: { label: "National 4", rank: 1 },
    N5: { label: "National 5", rank: 2 },
    H: { label: "Higher", rank: 3 },
    AH: { label: "Advanced Higher", rank: 4 },
  });
  const STORAGE_KEY = "mlh-concept-recall-v1";
  const MEDAL_RANK = Object.freeze({ bronze: 1, silver: 2, gold: 3, diamond: 4 });
  const MEDAL_TIME_LIMITS_MS = Object.freeze({
    N5: Object.freeze({ bronze: 345000, silver: 300000, gold: 240000, diamond: 195000 }),
    H: Object.freeze({ bronze: 390000, silver: 345000, gold: 285000, diamond: 225000 }),
    AH: Object.freeze({ bronze: 465000, silver: 405000, gold: 330000, diamond: 270000 }),
  });

  function normalizeAnswer(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[♯#]/g, " sharp ")
      .replace(/[♭]/g, " flat ")
      .replace(/&/g, " and ")
      .replace(/[’'`]/g, "")
      .replace(/[\-–—_/\\.,:;!?()[\]{}\"“”]+/g, " ")
      .toLocaleLowerCase("en-GB")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCompleteQuestion(question) {
    return Boolean(question && typeof question.id === "string" && question.id && typeof question.hint === "string" && question.hint.trim() && typeof question.answer === "string" && question.answer.trim() && typeof question.category === "string" && question.category.trim() && LEVELS[question.introducedAt]);
  }

  function completeQuestions(questions) {
    return (Array.isArray(questions) ? questions : []).filter(isCompleteQuestion);
  }

  function questionsForLevel(questions, level) {
    const safeLevel = LEVELS[level] ? level : "N3";
    return completeQuestions(questions).filter((question) => {
      if (Array.isArray(question.levels)) return question.levels.includes(safeLevel);
      return LEVELS[question.introducedAt].rank <= LEVELS[safeLevel].rank;
    });
  }

  function categoriesForQuestions(questions) {
    return [...new Set(completeQuestions(questions).map((question) => question.category))].sort((a, b) => a.localeCompare(b, "en-GB"));
  }

  function questionsForSetup(questions, level, selectedCategories) {
    const levelQuestions = questionsForLevel(questions, level);
    const selected = new Set(Array.isArray(selectedCategories) ? selectedCategories : categoriesForQuestions(levelQuestions));
    return levelQuestions.filter((question) => selected.has(question.category));
  }

  function acceptedAnswers(question) {
    return [question?.answer, ...(Array.isArray(question?.aliases) ? question.aliases : [])]
      .map(normalizeAnswer)
      .filter(Boolean);
  }

  function multiAnswerAliases(question) {
    return (Array.isArray(question?.multiAnswerAliases) ? question.multiAnswerAliases : [])
      .map(normalizeAnswer)
      .filter(Boolean);
  }

  function answerCollisions(questions) {
    const owners = new Map();
    const collisions = [];
    completeQuestions(questions).forEach((question) => {
      acceptedAnswers(question).forEach((answer) => {
        const owner = owners.get(answer);
        const deliberatelyShared = owner && multiAnswerAliases(owner).includes(answer) && multiAnswerAliases(question).includes(answer);
        if (owner && owner.id !== question.id && !deliberatelyShared) collisions.push({ answer, firstId: owner.id, secondId: question.id });
        else if (!owner) owners.set(answer, question);
      });
    });
    return collisions;
  }

  function recognizeAnswers(input, questions, answeredIds = new Set()) {
    const normalized = normalizeAnswer(input);
    if (!normalized) return [];
    const answered = answeredIds instanceof Set ? answeredIds : new Set(answeredIds || []);
    const matches = completeQuestions(questions).filter((question) => !answered.has(question.id) && acceptedAnswers(question).includes(normalized));
    if (matches.length <= 1) return matches;
    return matches.every((question) => multiAnswerAliases(question).includes(normalized)) ? matches : matches.slice(0, 1);
  }

  function recognizeAnswer(input, questions, answeredIds = new Set()) {
    return recognizeAnswers(input, questions, answeredIds)[0] || null;
  }

  function shuffleQuestions(questions, random = Math.random) {
    const shuffled = [...questions];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  function elapsedMilliseconds(timer, now = Date.now()) {
    const durationMs = Math.max(0, Number(timer?.durationMs) || 0);
    const accumulatedMs = Math.max(0, Number(timer?.accumulatedMs) || 0);
    const activeMs = timer?.running && Number.isFinite(timer?.startedAt) ? Math.max(0, now - timer.startedAt) : 0;
    const elapsedMs = accumulatedMs + activeMs;
    return durationMs > 0 ? Math.min(durationMs, elapsedMs) : elapsedMs;
  }

  function remainingMilliseconds(timer, now = Date.now()) {
    return Math.max(0, (Number(timer?.durationMs) || 0) - elapsedMilliseconds(timer, now));
  }

  function formatClock(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor((Number(milliseconds) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function scaledDurationMilliseconds(questionCount, baselineQuestionCount = 52, baselineDurationMs = 600000) {
    const count = Math.max(1, Math.round(Number(questionCount) || 1));
    const baselineCount = Math.max(1, Math.round(Number(baselineQuestionCount) || 1));
    const baselineDuration = Math.max(1000, Number(baselineDurationMs) || 600000);
    return Math.max(1000, Math.round((baselineDuration * count / baselineCount) / 1000) * 1000);
  }

  function categoryBreakdown(questions, answeredIds) {
    const answered = answeredIds instanceof Set ? answeredIds : new Set(answeredIds || []);
    const totals = new Map();
    completeQuestions(questions).forEach((question) => {
      const current = totals.get(question.category) || { category: question.category, correct: 0, total: 0 };
      current.total += 1;
      if (answered.has(question.id)) current.correct += 1;
      totals.set(question.category, current);
    });
    return [...totals.values()].sort((a, b) => a.category.localeCompare(b.category, "en-GB"));
  }

  function medalTimeLimits(level) {
    return { ...(MEDAL_TIME_LIMITS_MS[level] || MEDAL_TIME_LIMITS_MS.N5) };
  }

  function medalForCompletion({ completed, standardGame, elapsedMs, durationMs, level }) {
    if (!completed || !standardGame) return null;
    const timeMs = Math.max(0, elapsedMs);
    const limits = medalTimeLimits(level);
    if (timeMs <= limits.diamond) return "diamond";
    if (timeMs <= limits.gold) return "gold";
    if (timeMs <= limits.silver) return "silver";
    if (timeMs <= limits.bronze) return "bronze";
    return null;
  }

  function createResult({ level, questions, answeredIds, elapsedMs, durationMs, standardGame, medalEligible = standardGame, completedAt = Date.now() }) {
    const answered = answeredIds instanceof Set ? answeredIds : new Set(answeredIds || []);
    const total = completeQuestions(questions).length;
    const correct = completeQuestions(questions).filter((question) => answered.has(question.id)).length;
    const completed = total > 0 && correct === total;
    return {
      level: LEVELS[level] ? level : "N3",
      correct,
      missed: Math.max(0, total - correct),
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0,
      elapsedMs: Math.max(0, Math.round(elapsedMs || 0)),
      durationMs: Math.max(0, Math.round(durationMs || 0)),
      standardGame: Boolean(standardGame),
      medalEligible: Boolean(medalEligible),
      completed,
      medal: medalForCompletion({ completed, standardGame: medalEligible, elapsedMs, durationMs, level }),
      completedAt,
      categoryBreakdown: categoryBreakdown(questions, answered),
    };
  }

  function emptyPersistence() {
    return { version: 1, preferences: { timerMinutes: 10, soundEffects: true, randomiseRows: false }, records: {}, recentResult: null };
  }

  function sanitizePersistence(value) {
    const fallback = emptyPersistence();
    if (!value || value.version !== 1 || typeof value !== "object") return fallback;
    const timerMinutes = [2, 5, 10, 15].includes(Number(value.preferences?.timerMinutes)) ? Number(value.preferences.timerMinutes) : 10;
    const records = {};
    Object.entries(value.records && typeof value.records === "object" ? value.records : {}).forEach(([level, record]) => {
      if (!LEVELS[level] || !record || typeof record !== "object") return;
      records[level] = {
        bestScore: Math.max(0, Number(record.bestScore) || 0),
        questionTotal: Math.max(0, Number(record.questionTotal) || 0),
        fastestCompletionMs: Number(record.fastestCompletionMs) > 0 ? Number(record.fastestCompletionMs) : null,
        bestMedal: MEDAL_RANK[record.bestMedal] ? record.bestMedal : null,
      };
    });
    return {
      version: 1,
      preferences: {
        timerMinutes,
        soundEffects: value.preferences?.soundEffects !== false,
        randomiseRows: Boolean(value.preferences?.randomiseRows),
      },
      records,
      recentResult: value.recentResult && typeof value.recentResult === "object" ? value.recentResult : null,
    };
  }

  function loadPersistence(storage) {
    try {
      return sanitizePersistence(JSON.parse(storage?.getItem(STORAGE_KEY) || "null"));
    } catch {
      return emptyPersistence();
    }
  }

  function updatePersistence(current, result, preferences = {}) {
    const next = sanitizePersistence(current);
    next.preferences = { ...next.preferences, ...preferences };
    next.recentResult = result;
    if (result?.standardGame && result?.medalEligible !== false && LEVELS[result.level]) {
      const previous = next.records[result.level] || { bestScore: 0, questionTotal: 0, fastestCompletionMs: null, bestMedal: null };
      const fastestCompletionMs = result.completed
        ? previous.fastestCompletionMs ? Math.min(previous.fastestCompletionMs, result.elapsedMs) : result.elapsedMs
        : previous.fastestCompletionMs;
      const bestMedal = MEDAL_RANK[result.medal] > (MEDAL_RANK[previous.bestMedal] || 0) ? result.medal : previous.bestMedal;
      next.records[result.level] = {
        bestScore: Math.max(previous.bestScore, result.correct),
        questionTotal: result.total,
        fastestCompletionMs,
        bestMedal,
      };
    }
    return next;
  }

  function savePersistence(storage, value) {
    const safe = sanitizePersistence(value);
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(safe)); } catch {}
    return safe;
  }

  return {
    LEVELS,
    STORAGE_KEY,
    normalizeAnswer,
    isCompleteQuestion,
    completeQuestions,
    questionsForLevel,
    categoriesForQuestions,
    questionsForSetup,
    acceptedAnswers,
    multiAnswerAliases,
    answerCollisions,
    recognizeAnswers,
    recognizeAnswer,
    shuffleQuestions,
    elapsedMilliseconds,
    remainingMilliseconds,
    formatClock,
    scaledDurationMilliseconds,
    categoryBreakdown,
    medalTimeLimits,
    medalForCompletion,
    createResult,
    emptyPersistence,
    sanitizePersistence,
    loadPersistence,
    updatePersistence,
    savePersistence,
  };
});
