const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const CORE = require("./millionaire-core.js");
const BANK = require("./millionaire-question-bank.js");

const DIFFICULTY_RANGES = {
  easy: [1, 5],
  medium: [6, 10],
  hard: [11, 15],
};

function syntheticQuestion({ id, difficulty, conceptId }) {
  const [difficultyMin, difficultyMax] = DIFFICULTY_RANGES[difficulty];
  const answers = ["Correct", "Distractor one", "Distractor two", "Distractor three"]
    .map((text, index) => ({ id: `${id}-answer-${index + 1}`, text }));
  return {
    id,
    level: "N3",
    category: "concepts",
    difficulty,
    concept: conceptId || `Legacy concept for ${id}`,
    question: `Synthetic question ${id}?`,
    answers,
    correctAnswer: answers[0].id,
    explanation: `Synthetic explanation for ${id}.`,
    tip: `Synthetic hint for ${id}.`,
    difficultyMin,
    difficultyMax,
    audioSrc: "",
    notationData: null,
    type: "text",
    ...(conceptId ? { conceptId } : {}),
  };
}

function addConceptVariants(bank, difficulty, conceptIds, variantCount = 2) {
  conceptIds.forEach((conceptId) => {
    for (let variant = 1; variant <= variantCount; variant += 1) {
      bank.push(syntheticQuestion({
        id: `${difficulty}-${conceptId}-${variant}`,
        difficulty,
        conceptId,
      }));
    }
  });
}

function variedConceptBank() {
  const bank = [];
  addConceptVariants(bank, "easy", ["MC-A", "MC-B", "MC-C", "MC-D", "MC-E"]);
  addConceptVariants(bank, "medium", ["MC-A", "MC-B", "MC-C", "MC-D", "MC-E"], 1);
  addConceptVariants(bank, "medium", ["MC-F", "MC-G", "MC-H", "MC-I", "MC-J"]);
  addConceptVariants(bank, "hard", ["MC-A", "MC-B", "MC-C", "MC-D", "MC-E", "MC-F", "MC-G", "MC-H", "MC-I", "MC-J"], 1);
  addConceptVariants(bank, "hard", ["MC-K", "MC-L", "MC-M", "MC-N", "MC-O"]);
  return bank;
}

function legacyBank() {
  return Object.entries(DIFFICULTY_RANGES).flatMap(([difficulty]) => Array.from({ length: 5 }, (_, index) =>
    syntheticQuestion({ id: `legacy-${difficulty}-${index + 1}`, difficulty })));
}

test("the default Hard Music Concept pools contain faithful temporary clones of Medium questions", () => {
  const expectedConceptCounts = { N3: 68, N4: 75, N5: 70, H: 48, AH: 39 };
  for (const [level, expectedCount] of Object.entries(expectedConceptCounts)) {
    const mediumQuestions = BANK.pools[level].medium.concepts;
    const hardQuestions = BANK.pools[level].hard.concepts;
    const mediumById = new Map(mediumQuestions.map((question) => [question.id, question]));
    assert.equal(mediumQuestions.length, expectedCount);
    assert.equal(hardQuestions.length, expectedCount);
    for (const fallback of hardQuestions) {
      assert.equal(fallback.temporaryMediumFallback, true);
      assert.equal(fallback.difficulty, "hard");
      assert.equal(fallback.difficultyMin, 11);
      assert.equal(fallback.difficultyMax, 15);
      const source = mediumById.get(fallback.id.replace(/-hard-fallback$/, ""));
      assert.ok(source, `${fallback.id} should have a Medium source in the same level.`);
      assert.equal(source.conceptId, fallback.conceptId);
      assert.equal(source.question, fallback.question);
      assert.deepEqual(source.answers, fallback.answers);
      assert.equal(source.correctAnswer, fallback.correctAnswer);
    }
  }
});

test("the adapter suppresses a temporary clone when that concept has an authored Hard question", () => {
  const source = fs.readFileSync(require.resolve("./millionaire-question-bank.js"), "utf8");
  assert.match(source, /conceptsWithAuthoredHardQuestions = new Set\(direct\.map\(\(question\) => question\.conceptId\)\)/);
  assert.match(source, /question\.difficulty === "medium"[\s\S]*?!conceptsWithAuthoredHardQuestions\.has\(question\.conceptId\)/);
  assert.match(source, /return direct\.concat\(temporaryMediumFallbacks\)/);
});

test("composeGame prefers a different conceptId whenever the valid stage pool offers one", () => {
  const bank = variedConceptBank();
  assert.ok(bank.every((question) => CORE.validateQuestion(question).length === 0));

  const game = CORE.composeGame(bank, [], () => 0, { level: "N3", categories: ["concepts"] });

  assert.equal(game.length, 15);
  assert.equal(new Set(game.map((question) => question.conceptId)).size, 15);
  assert.ok(game.every((question) => question.level === "N3" && question.category === "concepts"));
  assert.deepEqual(game.map((question) => question.difficulty), [
    ...Array(5).fill("easy"),
    ...Array(5).fill("medium"),
    ...Array(5).fill("hard"),
  ]);
});

test("composeGame reuses a conceptId when the valid stage pool has no unused concept", () => {
  const bank = Object.entries(DIFFICULTY_RANGES).flatMap(([difficulty]) => Array.from({ length: 5 }, (_, index) =>
    syntheticQuestion({ id: `only-${difficulty}-${index + 1}`, difficulty, conceptId: "MC-ONLY" })));

  const game = CORE.composeGame(bank, [], () => 0, { level: "N3", categories: ["concepts"] });

  assert.equal(game.length, 15);
  assert.equal(new Set(game.map((question) => question.id)).size, 15);
  assert.deepEqual(new Set(game.map((question) => question.conceptId)), new Set(["MC-ONLY"]));
});

test("composeGame continues to support legacy questions without conceptId", () => {
  const bank = legacyBank();
  assert.ok(bank.every((question) => CORE.validateQuestion(question).length === 0));

  const game = CORE.composeGame(bank, [], () => 0, { level: "N3", categories: ["concepts"] });

  assert.equal(game.length, 15);
  assert.equal(new Set(game.map((question) => question.id)).size, 15);
  assert.ok(game.every((question) => !("conceptId" in question)));
});

test("switchQuestion avoids concepts used by the other game questions", () => {
  const game = CORE.composeGame(variedConceptBank(), [], () => 0, { level: "N3", categories: ["concepts"] });
  const stage = 7;
  const conceptUsedElsewhere = game[0].conceptId;
  const conceptOfQuestionBeingReplaced = game[stage - 1].conceptId;
  const candidates = [
    syntheticQuestion({ id: "switch-repeated-other", difficulty: "medium", conceptId: conceptUsedElsewhere }),
    syntheticQuestion({ id: "switch-current-concept", difficulty: "medium", conceptId: conceptOfQuestionBeingReplaced }),
  ];

  const replacement = CORE.switchQuestion(candidates, game, stage, "N3", () => 0);

  assert.ok(replacement);
  assert.equal(replacement.id, "switch-current-concept");
  assert.equal(replacement.conceptId, conceptOfQuestionBeingReplaced);
});

test("switchQuestion continues to support legacy questions without conceptId", () => {
  const game = CORE.composeGame(legacyBank(), [], () => 0, { level: "N3", categories: ["concepts"] });
  const candidate = syntheticQuestion({ id: "legacy-switch", difficulty: "medium" });

  const replacement = CORE.switchQuestion([candidate], game, 7, "N3", () => 0);

  assert.ok(replacement);
  assert.equal(replacement.id, candidate.id);
  assert.ok(!("conceptId" in replacement));
});

test("switchQuestion keeps a Hard-stage replacement inside the temporary Music Concept fallback pool", () => {
  const game = CORE.composeGame(BANK, [], () => 0, { level: "N3", categories: ["concepts"] });
  const replacement = CORE.switchQuestion(BANK, game, 11, "N3", () => 0);

  assert.ok(replacement);
  assert.equal(replacement.level, "N3");
  assert.equal(replacement.category, "concepts");
  assert.equal(replacement.difficulty, "hard");
  assert.equal(replacement.temporaryMediumFallback, true);
  assert.ok(!game.some((question) => question.id === replacement.id));
  assert.ok(!game.some((question) => CORE.questionFingerprint(question) === CORE.questionFingerprint(replacement)));
});
