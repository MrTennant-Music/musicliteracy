(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MILLIONAIRE_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const LETTERS = ["A", "B", "C", "D"];
  const CATEGORIES = ["listening", "literacy", "concepts"];
  const SUPPORTED_LEVELS = ["N3", "N4", "N5", "H", "AH"];
  const CATEGORY_TARGETS = { listening: 6, literacy: 4, concepts: 5 };
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

  function buildCategorySchedule(rng = Math.random) {
    const targets = { ...CATEGORY_TARGETS };
    const schedule = [];

    function canUse(category, stage) {
      if (targets[category] <= 0) return false;
      if (schedule.length >= 2 && schedule.at(-1) === category && schedule.at(-2) === category) return false;
      const remainingSlots = 15 - stage;
      const nextTargets = { ...targets, [category]: targets[category] - 1 };
      if (Object.values(nextTargets).some((count) => count > remainingSlots)) return false;
      if (stage > 10) {
        const lastFive = schedule.slice(10).concat(category);
        const slotsAfter = 15 - stage;
        if (!lastFive.includes("listening") && slotsAfter === 0) return false;
        if (!lastFive.includes("literacy") && slotsAfter === 0) return false;
      }
      return true;
    }

    function fill(stage) {
      if (stage === 16) {
        const lastFive = schedule.slice(10);
        return lastFive.includes("listening") && lastFive.includes("literacy");
      }
      const weighted = shuffle(CATEGORIES.flatMap((category) => Array(Math.max(0, targets[category])).fill(category)), rng);
      const candidates = [...new Set(weighted)];
      for (const category of candidates) {
        if (!canUse(category, stage)) continue;
        schedule.push(category);
        targets[category] -= 1;
        if (fill(stage + 1)) return true;
        targets[category] += 1;
        schedule.pop();
      }
      return false;
    }

    if (!fill(1)) throw new Error("Could not create a valid category schedule.");
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

  function selectForSchedule(validQuestions, schedule, excluded, recentlyUsed, rng) {
    const used = new Set();
    const selected = [];
    for (let stage = 1; stage <= 15; stage += 1) {
      const category = schedule[stage - 1];
      const eligible = validQuestions.filter((question) => question.category === category
        && question.difficultyMin <= stage && question.difficultyMax >= stage
        && !used.has(question.id) && !excluded.has(question.id));
      if (!eligible.length) return null;
      const fresh = eligible.filter((question) => !recentlyUsed.has(question.id));
      const preferred = fresh.length ? fresh : eligible;
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
    const validQuestions = (questionBank || []).filter((question) => !invalidIds.has(question.id) && question.level === requestedLevel);
    const history = recentSets(recentGames);
    const recentlyUsed = new Set(history.flatMap((set) => [...set]));
    for (let retainedGames = history.length; retainedGames >= 0; retainedGames -= 1) {
      const excluded = new Set(history.slice(history.length - retainedGames).flatMap((set) => [...set]));
      let bestSelection = null;
      let fewestRecentRepeats = Infinity;
      for (let attempt = 0; attempt < 500; attempt += 1) {
        const schedule = buildCategorySchedule(rng);
        const selected = selectForSchedule(validQuestions, schedule, excluded, recentlyUsed, rng);
        if (!selected) continue;
        const recentRepeats = selected.filter((question) => recentlyUsed.has(question.id)).length;
        if (recentRepeats < fewestRecentRepeats) {
          bestSelection = selected;
          fewestRecentRepeats = recentRepeats;
          if (recentRepeats === 0) break;
        }
      }
      if (bestSelection) {
        const letters = answerLetterPlan(rng);
        return bestSelection.map((question, index) => shuffledQuestion(question, letters[index], rng));
      }
    }
    throw new Error("The National 3 question bank cannot create a valid 15-question game.");
  }

  function fiftyFifty(question, rng = Math.random) {
    const incorrect = question.answers.filter((answer) => answer.letter !== question.correctLetter);
    const preferred = incorrect.find((answer) => answer.originalId === question.preferredFiftyFiftyDistractor);
    const retainedDistractor = preferred || incorrect[randomInt(incorrect.length, rng)];
    return incorrect.filter((answer) => answer.letter !== retainedDistractor.letter).map((answer) => answer.letter);
  }

  function switchQuestion(questionBank, currentQuestions, stage, level = "N3", rng = Math.random) {
    const usedIds = new Set((currentQuestions || []).map((question) => question.id));
    const currentQuestion = (currentQuestions || [])[stage - 1];
    const eligible = (questionBank || []).filter((question) => question.level === level
      && !validateQuestion(question).length
      && question.difficultyMin <= stage && question.difficultyMax >= stage
      && !usedIds.has(question.id));
    const sameCategory = eligible.filter((question) => question.category === currentQuestion?.category);
    const candidates = sameCategory.length ? sameCategory : eligible;
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
    CATEGORY_TARGETS,
    PRIZE_LADDER,
    MILESTONES,
    shuffle,
    formatPrize,
    guaranteedPrize,
    validateQuestion,
    validateQuestionBank,
    buildCategorySchedule,
    answerLetterPlan,
    shuffledQuestion,
    composeGame,
    fiftyFifty,
    switchQuestion,
    audienceVotes,
    categoryResults,
  };
});
