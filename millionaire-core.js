(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MILLIONAIRE_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const LETTERS = ["A", "B", "C", "D"];
  const CATEGORIES = ["listening", "literacy", "concepts"];
  const SUPPORTED_LEVELS = ["N3", "N4", "N5", "H", "AH"];
  const DIFFICULTIES = ["easy", "medium", "hard"];
  const DIFFICULTY_RANGES = {
    easy: { min: 1, max: 5 },
    medium: { min: 6, max: 10 },
    hard: { min: 11, max: 15 },
  };
  const LEVEL_LABELS = { N3: "National 3", N4: "National 4", N5: "National 5", H: "Higher", AH: "Advanced Higher" };
  const CATEGORY_LABELS = { listening: "Audio", literacy: "Literacy", concepts: "Concepts" };
  const PRIZE_LADDER = [
    100, 200, 300, 500, 1000,
    2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000,
  ];
  const MILESTONES = { 5: 1000, 10: 32000 };

  function randomInt(max, rng = Math.random) {
    return Math.floor(rng() * max);
  }

  function shuffle(items, rng = Math.random) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = randomInt(index + 1, rng);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function formatPrize(value) {
    return value === 1000000 ? "£1 Million" : `£${Number(value || 0).toLocaleString("en-GB")}`;
  }

  function guaranteedPrize(correctCount) {
    if (correctCount >= 10) return 32000;
    if (correctCount >= 5) return 1000;
    return 0;
  }

  function validateQuestion(question) {
    const errors = [];
    if (!question || typeof question !== "object") return ["Question must be an object."];
    if (!question.id || typeof question.id !== "string") errors.push("A stable string ID is required.");
    if (!SUPPORTED_LEVELS.includes(question.level)) errors.push("Level must be N3, N4, N5, H or AH.");
    if (!CATEGORIES.includes(question.category)) errors.push("Category must be listening, literacy or concepts.");
    if (!DIFFICULTIES.includes(question.difficulty)) errors.push("Difficulty must be easy, medium or hard.");
    if (!question.concept || typeof question.concept !== "string") errors.push("A concept is required.");
    if (!question.question || typeof question.question !== "string") errors.push("Question wording is required.");
    if (!Array.isArray(question.answers) || question.answers.length !== 4) errors.push("Exactly four answers are required.");
    const answerIds = Array.isArray(question.answers) ? question.answers.map((answer) => answer?.id) : [];
    if (new Set(answerIds).size !== 4 || answerIds.some((id) => typeof id !== "string" || !id)) errors.push("Answer IDs must be unique strings.");
    if (!answerIds.includes(question.correctAnswer)) errors.push("The correct answer must match one answer ID.");
    if (!question.explanation || typeof question.explanation !== "string") errors.push("An explanation is required.");
    if (!question.tip || typeof question.tip !== "string") errors.push("A tip is required.");
    if (!Number.isInteger(question.difficultyMin) || !Number.isInteger(question.difficultyMax)
      || question.difficultyMin < 1 || question.difficultyMax > 15
      || question.difficultyMin > question.difficultyMax) errors.push("Difficulty range must use valid stages from 1 to 15.");
    const expectedRange = DIFFICULTY_RANGES[question.difficulty];
    if (expectedRange && (question.difficultyMin !== expectedRange.min || question.difficultyMax !== expectedRange.max)) {
      errors.push(`Difficulty ${question.difficulty} must use stages ${expectedRange.min} to ${expectedRange.max}.`);
    }
    if (typeof question.audioSrc !== "string") errors.push("An audioSrc field is required, even when it is empty.");
    if (!("notationData" in question)) errors.push("A notationData field is required, even when it is null.");
    const type = question.type || "text";
    const validTypes = ["text", "audio", "notation", "image", "text-notation", "text-audio"];
    if (!validTypes.includes(type)) errors.push("Question type is not supported.");
    if ((type === "audio" || type === "text-audio") && (!question.audio || typeof question.audio !== "object")) errors.push("Audio question data is required.");
    if ((type === "notation" || type === "text-notation") && (!question.notation || typeof question.notation !== "object")) errors.push("Notation question data is required.");
    if (type === "image" && (!question.image || typeof question.image.src !== "string")) errors.push("Image source data is required.");
    return errors;
  }

  function validateQuestionBank(questions) {
    const errors = [];
    const ids = new Set();
    (questions || []).forEach((question, index) => {
      const questionErrors = validateQuestion(question);
      questionErrors.forEach((message) => errors.push(`${question?.id || `Question ${index + 1}`}: ${message}`));
      if (question?.id) {
        if (ids.has(question.id)) errors.push(`${question.id}: Duplicate question ID.`);
        ids.add(question.id);
      }
    });
    return errors;
  }

  function validateQuestionPools(questionPools) {
    const errors = [];
    const allQuestions = [];
    SUPPORTED_LEVELS.forEach((level) => {
      DIFFICULTIES.forEach((difficulty) => {
        CATEGORIES.forEach((category) => {
          const pool = questionPools?.[level]?.[difficulty]?.[category];
          const label = `${LEVEL_LABELS[level]} / ${difficulty} / ${CATEGORY_LABELS[category]}`;
          if (!Array.isArray(pool)) {
            errors.push(`${label}: Required question pool is missing.`);
            return;
          }
          pool.forEach((question) => {
            allQuestions.push(question);
            if (question?.level !== level) errors.push(`${question?.id || label}: Level does not match its pool (${level}).`);
            if (question?.difficulty !== difficulty) errors.push(`${question?.id || label}: Difficulty does not match its pool (${difficulty}).`);
            if (question?.category !== category) errors.push(`${question?.id || label}: Category does not match its pool (${category}).`);
          });
        });
      });
    });
    return errors.concat(validateQuestionBank(allQuestions));
  }

  function questionPoolSummary(questionPools) {
    return SUPPORTED_LEVELS.flatMap((level) => DIFFICULTIES.flatMap((difficulty) => CATEGORIES.map((category) => {
      const count = questionPools?.[level]?.[difficulty]?.[category]?.length || 0;
      const difficultyLabel = difficulty[0].toUpperCase() + difficulty.slice(1);
      return `${LEVEL_LABELS[level]} / ${difficultyLabel} / ${CATEGORY_LABELS[category]}: ${count} questions`;
    })));
  }

  function normaliseCategories(categories) {
    const requested = Array.isArray(categories) ? categories.filter((category) => CATEGORIES.includes(category)) : CATEGORIES;
    const unique = [...new Set(requested)];
    return unique.length ? unique : CATEGORIES.slice();
  }

  // Build one independently shuffled five-question plan. Passing the previous
  // block prevents three matching categories at a difficulty boundary.
  function buildBlockCategoryPlan(rng = Math.random, categories = CATEGORIES, previousCategories = []) {
    const enabled = normaliseCategories(categories);
    if (enabled.length === 1) return Array(5).fill(enabled[0]);

    const distributionOrder = shuffle(enabled, rng);
    const counts = Object.fromEntries(enabled.map((category) => [category, Math.floor(5 / enabled.length)]));
    for (let index = 0; index < 5 % enabled.length; index += 1) counts[distributionOrder[index]] += 1;
    const plan = [];

    function fill() {
      if (plan.length === 5) return true;
      const candidates = shuffle(enabled.filter((category) => counts[category] > 0), rng);
      for (const category of candidates) {
        const recent = previousCategories.concat(plan).slice(-2);
        if (recent.length === 2 && recent.every((item) => item === category)) continue;
        plan.push(category);
        counts[category] -= 1;
        if (fill()) return true;
        counts[category] += 1;
        plan.pop();
      }
      return false;
    }

    if (!fill()) throw new Error("Could not create a valid five-question type plan.");
    return plan;
  }

  function buildCategorySchedule(rng = Math.random, categories = CATEGORIES) {
    const schedule = [];
    DIFFICULTIES.forEach(() => schedule.push(...buildBlockCategoryPlan(rng, categories, schedule)));
    return schedule;
  }

  function answerLetterPlan(rng = Math.random) {
    const lowerCountLetter = LETTERS[randomInt(LETTERS.length, rng)];
    const pool = LETTERS.flatMap((letter) => Array(letter === lowerCountLetter ? 3 : 4).fill(letter));
    for (let attempt = 0; attempt < 300; attempt += 1) {
      const plan = shuffle(pool, rng);
      const hasTriple = plan.some((letter, index) => index >= 2 && letter === plan[index - 1] && letter === plan[index - 2]);
      if (!hasTriple) return plan;
    }
    return ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C"];
  }

  function shuffledQuestion(question, correctLetter, rng = Math.random) {
    const correct = question.answers.find((answer) => answer.id === question.correctAnswer);
    const distractors = shuffle(question.answers.filter((answer) => answer.id !== question.correctAnswer), rng);
    const correctIndex = LETTERS.indexOf(correctLetter);
    const ordered = distractors.slice();
    ordered.splice(correctIndex, 0, correct);
    return {
      ...question,
      answers: ordered.map((answer, index) => ({ ...answer, originalId: answer.id, letter: LETTERS[index] })),
      correctLetter,
    };
  }

  function recentSets(recentGames) {
    return (Array.isArray(recentGames) ? recentGames : [])
      .slice(-5)
      .map((game) => new Set(Array.isArray(game) ? game : []));
  }

  function difficultyForStage(stage) {
    if (stage <= 5) return "easy";
    if (stage <= 10) return "medium";
    return "hard";
  }

  function createFallbackQuestion(level, difficulty, category, stage) {
    const levelLabel = LEVEL_LABELS[level] || level;
    const categoryLabel = CATEGORY_LABELS[category] || category;
    const range = DIFFICULTY_RANGES[difficulty];
    return {
      id: `fallback-${level}-${difficulty}-${category}-${String(stage).padStart(2, "0")}`,
      level,
      difficulty,
      category,
      concept: "fallback-placeholder",
      question: `Fallback placeholder: ${levelLabel} ${difficulty} ${categoryLabel} question`,
      prompt: `Fallback placeholder: ${levelLabel} ${difficulty} ${categoryLabel} question`,
      answers: ["Answer A", "Answer B", "Answer C", "Answer D"].map((text, index) => ({ id: "abcd"[index], text })),
      correctAnswer: "a",
      explanation: "This fallback appears because the requested question pool is incomplete.",
      tip: "Development fallback question.",
      difficultyMin: range.min,
      difficultyMax: range.max,
      type: category === "listening" ? "audio" : "text",
      audio: category === "listening" ? { src: "", generator: null, placeholder: true } : undefined,
      audioSrc: "",
      notationData: null,
      placeholder: true,
      fallback: true,
    };
  }

  // Selection may change category only when a pool is too small. It never
  // crosses the selected course level or the current difficulty block.
  function selectForSchedule(validQuestions, schedule, recentlyUsed, rng, level, enabledCategories) {
    const used = new Set();
    const selected = [];
    for (let stage = 1; stage <= 15; stage += 1) {
      const category = schedule[stage - 1];
      const difficulty = difficultyForStage(stage);
      const requestedPool = validQuestions.filter((question) => question.category === category && question.difficulty === difficulty);
      if (!requestedPool.length) {
        console.warn(`Millionaire question pool is empty: ${level} / ${difficulty} / ${category}. Using a fallback placeholder.`);
        const fallback = createFallbackQuestion(level, difficulty, category, stage);
        selected.push(fallback);
        used.add(fallback.id);
        continue;
      }
      const unusedRequested = requestedPool.filter((question) => !used.has(question.id));
      const unusedSameDifficulty = validQuestions.filter((question) => question.difficulty === difficulty
        && enabledCategories.includes(question.category) && !used.has(question.id));
      let candidates = unusedRequested;
      if (!candidates.length && unusedSameDifficulty.length) {
        console.warn(`Millionaire question pool has too few unused questions: ${level} / ${difficulty} / ${category}. Using another type at the same level and difficulty.`);
        candidates = unusedSameDifficulty;
      }
      if (!candidates.length) {
        console.warn(`Millionaire question pools are exhausted: ${level} / ${difficulty}. Reusing a question as the final fallback.`);
        candidates = requestedPool;
      }
      const fresh = candidates.filter((question) => !recentlyUsed.has(question.id));
      const preferred = fresh.length ? fresh : candidates;
      const choice = preferred[randomInt(preferred.length, rng)];
      selected.push(choice);
      used.add(choice.id);
    }
    return selected;
  }

  function composeGame(questionBank, recentGames = [], rng = Math.random, options = {}) {
    const invalidIds = new Set();
    const seen = new Set();
    (questionBank || []).forEach((question) => {
      if (validateQuestion(question).length || seen.has(question?.id)) invalidIds.add(question?.id);
      if (question?.id) seen.add(question.id);
    });
    const requestedLevel = options.level || (questionBank || []).find((question) => !invalidIds.has(question?.id))?.level || "N3";
    const enabledCategories = normaliseCategories(options.categories);
    const validQuestions = (questionBank || []).filter((question) => !invalidIds.has(question.id) && question.level === requestedLevel && enabledCategories.includes(question.category));
    const history = recentSets(recentGames);
    const recentlyUsed = new Set(history.flatMap((set) => [...set]));
    const schedule = buildCategorySchedule(rng, enabledCategories);
    const selected = selectForSchedule(validQuestions, schedule, recentlyUsed, rng, requestedLevel, enabledCategories);
    const letters = answerLetterPlan(rng);
    return selected.map((question, index) => shuffledQuestion(question, letters[index], rng));
  }

  function fiftyFifty(question, rng = Math.random) {
    const incorrect = question.answers.filter((answer) => answer.letter !== question.correctLetter);
    const preferred = incorrect.find((answer) => answer.originalId === question.preferredFiftyFiftyDistractor);
    const retainedDistractor = preferred || incorrect[randomInt(incorrect.length, rng)];
    return incorrect.filter((answer) => answer.letter !== retainedDistractor.letter).map((answer) => answer.letter);
  }

  function switchQuestion(questionBank, currentQuestions, stage, level = "N3", rng = Math.random, options = {}) {
    const usedIds = new Set((currentQuestions || []).map((question) => question.id));
    const currentQuestion = (currentQuestions || [])[stage - 1];
    const validAtLevel = (questionBank || []).filter((question) => question.level === level
      && !validateQuestion(question).length);
    const difficulty = difficultyForStage(stage);
    const eligible = validAtLevel.filter((question) => question.difficulty === difficulty
      && !usedIds.has(question.id));
    const sameCategory = eligible.filter((question) => question.category === currentQuestion?.category);
    let candidates = sameCategory.length ? sameCategory : eligible;
    if (!candidates.length && options.allowRepeats) {
      const sameCategoryPool = validAtLevel.filter((question) => question.category === currentQuestion?.category && question.id !== currentQuestion?.id);
      candidates = sameCategoryPool.filter((question) => question.difficulty === difficulty);
    }
    if (!candidates.length) return null;
    const replacement = candidates[randomInt(candidates.length, rng)];
    const correctLetter = LETTERS[randomInt(LETTERS.length, rng)];
    return shuffledQuestion(replacement, correctLetter, rng);
  }

  function audienceReliability(stage, rng = Math.random) {
    const ranges = stage <= 3 ? [70, 90]
      : stage <= 5 ? [60, 80]
        : stage <= 8 ? [45, 70]
          : stage <= 10 ? [35, 60]
            : stage <= 12 ? [25, 55]
              : [20, 50];
    return ranges[0] + randomInt(ranges[1] - ranges[0] + 1, rng);
  }

  function audienceVotes(question, stage, removedLetters = [], rng = Math.random) {
    const available = question.answers.map((answer) => answer.letter).filter((letter) => !removedLetters.includes(letter));
    const correctPercent = audienceReliability(stage, rng);
    const others = available.filter((letter) => letter !== question.correctLetter);
    const result = Object.fromEntries(LETTERS.map((letter) => [letter, 0]));
    result[question.correctLetter] = correctPercent;
    let remaining = 100 - correctPercent;
    const weights = others.map(() => rng() + 0.1);
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    others.forEach((letter, index) => {
      if (index === others.length - 1) result[letter] = remaining;
      else {
        const share = Math.round((100 - correctPercent) * weights[index] / totalWeight);
        result[letter] = Math.min(remaining, share);
        remaining -= result[letter];
      }
    });
    return result;
  }

  function categoryResults(records) {
    return CATEGORIES.reduce((summary, category) => {
      const entries = (records || []).filter((record) => record.category === category);
      summary[category] = {
        correct: entries.filter((record) => record.correct).length,
        attempted: entries.length,
      };
      return summary;
    }, {});
  }

  return {
    LETTERS,
    CATEGORIES,
    SUPPORTED_LEVELS,
    DIFFICULTIES,
    DIFFICULTY_RANGES,
    PRIZE_LADDER,
    MILESTONES,
    shuffle,
    formatPrize,
    guaranteedPrize,
    validateQuestion,
    validateQuestionBank,
    validateQuestionPools,
    questionPoolSummary,
    buildBlockCategoryPlan,
    buildCategorySchedule,
    difficultyForStage,
    answerLetterPlan,
    shuffledQuestion,
    composeGame,
    fiftyFifty,
    switchQuestion,
    audienceVotes,
    categoryResults,
  };
});
