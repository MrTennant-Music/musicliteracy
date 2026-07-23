const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const CORE = require("./millionaire-core.js");
const BANK = require("./millionaire-question-bank.js");
const { loadManualQuestionOverrides, loadStrongHints, strongHintKey } = require("./scripts/music-concepts/question-bank-common.js");

const ROOT = __dirname;
const LEVELS = [
  { code: "N3", label: "National 3", file: "national3.json" },
  { code: "N4", label: "National 4", file: "national4.json" },
  { code: "N5", label: "National 5", file: "national5.json" },
  { code: "H", label: "Higher", file: "higher.json" },
  { code: "AH", label: "Advanced Higher", file: "advanced-higher.json" },
];
const CANONICAL_BANKS = Object.fromEntries(LEVELS.map(({ code, file }) => [
  code,
  JSON.parse(fs.readFileSync(path.join(ROOT, "data/questions/music-concepts", file), "utf8")),
]));
const KNOWLEDGE_BANK = JSON.parse(fs.readFileSync(path.join(ROOT, "Music_Concept_Knowledge_Bank_Ultimate_Codex_Edition.json"), "utf8"));
const STRONG_HINTS = loadStrongHints();
const MANUAL_OVERRIDES = loadManualQuestionOverrides().questions;
const REVIEWED_ANSWER_EXCEPTIONS = new Map([
  ["MCQ-N3-MC0056-F01-E-001", new Set(["bass"])],
]);
const AVOIDABLE_FORMAL_WORDING = /\b(?:this concept|commonly|normally|typically|typical|generally|frequently|principally|primarily|principal|simultaneously|respectively|approximately|roughly|successively|substantial)\b|\b(?:intervening pitches|characterised by|characteristic features include|orchestral counterpart)\b/i;

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function normalise(value) {
  return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
}

test("the five canonical banks contain only concepts and answer options from their own course level", () => {
  const conceptNamesByLevel = Object.fromEntries(LEVELS.map(({ code, label }) => [
    code,
    new Set(KNOWLEDGE_BANK.concepts.filter((concept) => concept.level === label).flatMap((concept) => [concept.concept, ...(concept.aliases || []), ...(concept.listed_as || [])]).map(normalise)),
  ]));

  for (const { code, label } of LEVELS) {
    const questions = CANONICAL_BANKS[code].questions;
    const permittedConceptIds = new Set(KNOWLEDGE_BANK.concepts.filter((concept) => concept.level === label).map((concept) => concept.concept_id));
    assert.equal(questions.length, permittedConceptIds.size * 2, `${label} should contain one ready Easy and Medium question per concept.`);
    assert.ok(questions.every((question) => question.level === label), `${label} must not contain questions tagged for another level.`);
    assert.ok(questions.every((question) => permittedConceptIds.has(question.conceptId)), `${label} must not assess a concept from another level.`);
    assert.ok(questions.every((question) => ["Easy", "Medium"].includes(question.difficulty)), `${label} should exclude blank Hard slots from its playable bank.`);
    permittedConceptIds.forEach((conceptId) => {
      const conceptQuestions = questions.filter((question) => question.conceptId === conceptId);
      assert.equal(conceptQuestions.length, 2, `${conceptId} should have exactly two ready questions.`);
      assert.deepEqual(new Set(conceptQuestions.map((question) => question.difficulty)), new Set(["Easy", "Medium"]));
    });
    assert.ok(questions.every((question) => !/\bpupil\b/i.test(question.question)), `${label} questions should use direct wording rather than third-person pupil framing.`);
    assert.ok(questions.every((question) => question.question.length <= 200), `${label} questions must fit the Millionaire question panel.`);
    assert.ok(questions.every((question) => !/Two written clues are given|Consider both details|The following comparison contrasts|Consider every clue and distinction/i.test(question.question)), `${label} questions should not use verbose instructional framing.`);
    assert.ok(questions.every((question) => !/\bIt is false that\b/i.test(question.question)), `${label} questions should identify the answer positively rather than through an ambiguous false claim.`);
    assert.ok(questions.every((question) => !/\bdescribed\?$/i.test(question.question)), `${label} questions should end with a direct pupil-friendly prompt.`);
    assert.ok(questions.every((question) => !AVOIDABLE_FORMAL_WORDING.test(question.question)
      && !AVOIDABLE_FORMAL_WORDING.test(question.hint)), `${label} question wording and hints should avoid the reviewed formal wording.`);
    assert.ok(questions.every((question) => !/^A second useful clue is:/i.test(question.hint)), `${label} hints should present the clue directly.`);
    assert.ok(questions.filter((question) => question.difficulty === "Easy").every((question) => question.answers.every((answer) =>
      conceptNamesByLevel[code].has(normalise(answer.text))
      || REVIEWED_ANSWER_EXCEPTIONS.get(question.id)?.has(normalise(answer.text)))), `${label} distractors must come from the same course level unless explicitly reviewed.`);
    assert.equal(new Set(questions.map((question) => question.id)).size, questions.length, `${label} question IDs must be unique.`);
  }
});

test("at least 90% of Music Concept questions use the preferred concise stem length", () => {
  const questions = LEVELS.flatMap(({ code }) => CANONICAL_BANKS[code].questions);
  const conciseQuestions = questions.filter((question) => question.question.length <= 180);
  assert.ok(conciseQuestions.length / questions.length >= 0.9, `${conciseQuestions.length} of ${questions.length} questions meet the preferred 180-character length.`);
});

test("orchestral-family questions use only the four orchestral families", () => {
  const question = CANONICAL_BANKS.N3.questions.find((item) => item.id === "MCQ-N3-MC0056-F01-E-001");
  assert.ok(question);
  assert.deepEqual(new Set(question.answers.map((answer) => answer.text)), new Set(["Strings", "Percussion", "Woodwind", "Brass"]));
  assert.equal(question.answers.find((answer) => answer.correct)?.text, "Percussion");
  const familyConceptIds = new Set(["MC-0047", "MC-0056", "MC-0063", "MC-0068"]);
  CANONICAL_BANKS.N3.questions.filter((item) => item.difficulty === "Easy" && familyConceptIds.has(item.conceptId)).forEach((item) => {
    assert.deepEqual(new Set(item.answers.map((answer) => answer.text)), new Set(["Strings", "Percussion", "Woodwind", "Brass"]), item.id);
  });
});

test("Easy style-identification questions contain only styles from their qualification", () => {
  for (const { code } of LEVELS) {
    const styleNames = new Set(CANONICAL_BANKS[code].questions.filter((question) => question.category === "Styles").map((question) => question.concept));
    CANONICAL_BANKS[code].questions.filter((question) => question.category === "Styles" && question.difficulty === "Easy").forEach((question) => {
      question.answers.forEach((answer) => assert.ok(styleNames.has(answer.text), `${question.id}: ${answer.text} is not a ${code} style.`));
    });
  }
});

test("description questions reuse their description as feedback", () => {
  BANK.filter((question) => question.category === "concepts" && question.conceptDescription).forEach((question) => {
    assert.equal(question.explanation, question.conceptDescription, question.id);
  });
});

test("the Millionaire adapter preserves 600 ready questions and adds 300 temporary Hard clones", () => {
  const runtimeConcepts = BANK.filter((question) => question.category === "concepts");
  const canonicalIds = new Set(LEVELS.flatMap(({ code }) => CANONICAL_BANKS[code].questions.map((question) => question.id)));
  const directQuestions = runtimeConcepts.filter((question) => !question.temporaryMediumFallback);
  const temporaryHardQuestions = runtimeConcepts.filter((question) => question.temporaryMediumFallback);
  const directById = new Map(directQuestions.map((question) => [question.id, question]));
  assert.equal(canonicalIds.size, 600);
  assert.equal(directQuestions.length, 600);
  assert.deepEqual(new Set(directQuestions.map((question) => question.id)), canonicalIds);
  assert.equal(temporaryHardQuestions.length, 300);
  for (const fallback of temporaryHardQuestions) {
    assert.equal(fallback.difficulty, "hard");
    assert.equal(fallback.difficultyMin, 11);
    assert.equal(fallback.difficultyMax, 15);
    assert.match(fallback.id, /-hard-fallback$/);
    const source = directById.get(fallback.id.replace(/-hard-fallback$/, ""));
    assert.ok(source, `${fallback.id} should identify its ready Medium source.`);
    assert.equal(source.difficulty, "medium");
    ["level", "category", "concept", "conceptId", "question", "prompt", "conceptDescription", "correctAnswer", "explanation", "tip", "questionType", "answerMode"].forEach((key) => {
      assert.deepEqual(fallback[key], source[key], `${fallback.id} should preserve ${key} from its Medium source.`);
    });
    assert.deepEqual(fallback.answers, source.answers);
  }
  assert.ok(runtimeConcepts.every((question) => question.type === "text" && question.audioSrc === "" && question.notationData === null && !question.audio));
  assert.deepEqual(CORE.validateQuestionBank(runtimeConcepts), []);
});

test("Easy descriptions and Medium NOT-a-feature prompts use their intended game containers", () => {
  const runtimeConcepts = BANK.filter((question) => question.category === "concepts");
  const easyQuestions = runtimeConcepts.filter((question) => question.difficulty === "easy");
  const mediumQuestions = runtimeConcepts.filter((question) => question.difficulty === "medium");
  const hardFallbacks = runtimeConcepts.filter((question) => question.difficulty === "hard");
  assert.equal(easyQuestions.length, 300);
  assert.equal(mediumQuestions.length, 300);
  assert.equal(hardFallbacks.length, 300);
  for (const question of easyQuestions) {
    assert.equal(question.answerMode, "concept");
    assert.equal(question.prompt, "What concept is described?");
    assert.ok(question.conceptDescription?.trim(), `${question.id} should provide its concept description separately.`);
    assert.ok(question.question.startsWith(question.conceptDescription), `${question.id} should retain its full reviewed question for records and review.`);
    assert.notEqual(question.conceptDescription, question.question);
  }
  for (const question of [...mediumQuestions, ...hardFallbacks]) {
    assert.equal(question.questionType, "feature_exclusion");
    assert.equal(question.answerMode, "not_feature");
    assert.equal(question.conceptDescription, null);
    assert.equal(question.prompt, question.question);
    assert.equal(question.prompt, `Which is NOT a feature of ${question.concept}?`);
  }
  const directQuestions = [...easyQuestions, ...mediumQuestions];
  const displayedKeys = directQuestions.map((question) => [question.level, normalise(question.conceptDescription), normalise(question.prompt)].join("|"));
  assert.equal(new Set(displayedKeys).size, displayedKeys.length, "The 600 authored questions should have unique displays.");
  hardFallbacks.forEach((fallback) => {
    const sourceId = fallback.id.replace(/-hard-fallback$/, "");
    const source = mediumQuestions.find((question) => question.id === sourceId);
    assert.ok(source);
    assert.equal(CORE.questionFingerprint(fallback), CORE.questionFingerprint(source), `${fallback.id} should deliberately mirror its Medium source.`);
  });
});

test("Music Concept games use temporary Medium clones at Hard stages without repeating concepts", () => {
  for (const { code } of LEVELS) {
    for (let seed = 1; seed <= 20; seed += 1) {
      const game = CORE.composeGame(BANK, [], seeded(seed * 97 + LEVELS.findIndex((level) => level.code === code)), { level: code, categories: ["concepts"] });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15, `${code} must not repeat a question ID.`);
      assert.equal(new Set(game.map(CORE.questionFingerprint)).size, 15, `${code} must not repeat the same pupil-facing question.`);
      assert.equal(new Set(game.map((question) => question.conceptId)).size, 15, `${code} should avoid repeating a concept when the bank offers alternatives.`);
      assert.deepEqual(game.map((question) => question.difficulty), [
        ...Array(5).fill("easy"),
        ...Array(5).fill("medium"),
        ...Array(5).fill("hard"),
      ]);
      assert.ok(game.slice(0, 10).every((question) => !question.temporaryMediumFallback));
      assert.ok(game.slice(10).every((question) => question.temporaryMediumFallback === true));
      assert.ok(game.every((question) => question.level === code && question.category === "concepts"));
    }
  }
});

test("mixed Music Literacy and Music Concept games stay balanced without repeating concepts", () => {
  for (const { code } of LEVELS) {
    for (let seed = 1; seed <= 50; seed += 1) {
      const game = CORE.composeGame(BANK, [], seeded(seed * 193 + LEVELS.findIndex((level) => level.code === code)), {
        level: code,
        categories: ["literacy", "concepts"],
      });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15);
      assert.equal(new Set(game.map(CORE.questionFingerprint)).size, 15);
      const conceptQuestions = game.filter((question) => question.category === "concepts");
      assert.equal(new Set(conceptQuestions.map((question) => question.conceptId)).size, conceptQuestions.length, `${code} should not repeat a Music Concept in a mixed game.`);
      game.forEach((question, index) => {
        assert.equal(question.level, code);
        assert.equal(question.difficulty, CORE.difficultyForStage(index + 1));
        if (index >= 10 && question.category === "concepts") assert.equal(question.temporaryMediumFallback, true);
        else assert.ok(!question.temporaryMediumFallback);
        if (index >= 2) {
          assert.ok(!(game[index - 2].category === question.category && game[index - 1].category === question.category), `${code} should never ask three questions of the same type in a row.`);
        }
      });
      for (let start = 0; start < game.length; start += 5) {
        const block = game.slice(start, start + 5);
        const literacyCount = block.filter((question) => question.category === "literacy").length;
        const conceptCount = block.filter((question) => question.category === "concepts").length;
        assert.ok([2, 3].includes(literacyCount) && [2, 3].includes(conceptCount), `${code} should use a 2/3 split in each five-question block.`);
      }
    }
  }
});

test("stored hints reach the existing Hint lifeline without exposing an audio dependency", () => {
  const script = fs.readFileSync(path.join(ROOT, "millionaire.js"), "utf8");
  for (const { code } of LEVELS) {
    const canonicalById = new Map(CANONICAL_BANKS[code].questions.map((question) => [question.id, question]));
    const runtime = BANK.filter((question) => question.level === code && question.category === "concepts");
    assert.ok(runtime.every((question) => {
      const sourceId = question.temporaryMediumFallback ? question.id.replace(/-hard-fallback$/, "") : question.id;
      return question.tip === canonicalById.get(sourceId)?.hint && question.tip.trim().length > 0;
    }));
  }
  assert.match(script, /function useHint\(\)[\s\S]*?setHintVisible\(true\);[\s\S]*?`Hint: \$\{question\.tip\}`/);
  assert.ok(script.includes("<HintText question={question} />"), "The visible Hint panel should render the stored question tip.");
});

test("Easy hints identify the target while Medium hints guide pupils towards the false feature", () => {
  const canonicalQuestions = LEVELS.flatMap(({ code }) => CANONICAL_BANKS[code].questions);
  const easyByConcept = new Map(canonicalQuestions.filter((question) => question.difficulty === "Easy")
    .map((question) => [question.conceptId, question]));
  const requiredKeys = new Set();
  assert.equal(Object.keys(STRONG_HINTS).length, 304);
  assert.equal(STRONG_HINTS["MC-0015"], "A _____ of faith.");
  assert.equal(STRONG_HINTS["MC-0283"], "Three tones.");
  assert.equal(new Set(Object.values(STRONG_HINTS).map(normalise)).size, 304, "Each stored concept meaning should have its own distinct hint.");
  const genericOpening = /^(?:Focus|Use|Compare|Rule out|Think about|Track|Decide|Identify|Ask|Look for|Notice|Concentrate|Follow|Match)\b/i;
  const genericReference = /\b(?:the answer|the option|the concept|the clue)\b/i;
  for (const question of canonicalQuestions) {
    let key;
    if (question.difficulty === "Medium" && !MANUAL_OVERRIDES[question.id]) {
      const sourceQuestion = easyByConcept.get(question.featureSourceConceptId);
      assert.ok(sourceQuestion, `${question.id} should identify a same-level false-feature source.`);
      key = strongHintKey(sourceQuestion.conceptId, sourceQuestion.senseId);
    } else {
      key = strongHintKey(question.conceptId, question.senseId);
    }
    requiredKeys.add(key);
    const expectedHint = MANUAL_OVERRIDES[question.id]?.hint || STRONG_HINTS[key];
    assert.equal(question.hint, expectedHint, `${question.id} should use its saved reviewed hint for ${key}.`);
    assert.ok(question.hint.trim().split(/\s+/).length <= 18, `${key} should remain concise.`);
    assert.doesNotMatch(question.hint, genericOpening);
    assert.doesNotMatch(question.hint, genericReference);
  }
  assert.ok([...requiredKeys].every((key) => Object.hasOwn(STRONG_HINTS, key)));
});

test("50:50 removes exactly two wrong answers and leaves the correct answer", () => {
  for (const { code } of LEVELS) {
    const [question] = CORE.composeGame(BANK, [], seeded(501 + LEVELS.findIndex((level) => level.code === code)), { level: code, categories: ["concepts"] });
    const removed = CORE.fiftyFifty(question, seeded(777));
    const remaining = question.answers.filter((answer) => !removed.includes(answer.letter));
    assert.equal(removed.length, 2);
    assert.equal(new Set(removed).size, 2);
    assert.ok(removed.every((letter) => letter !== question.correctLetter));
    assert.equal(remaining.length, 2);
    assert.equal(remaining.filter((answer) => answer.letter === question.correctLetter).length, 1);
  }
});

test("existing Music Literacy games still compose normally at every level", () => {
  for (const { code } of LEVELS) {
    const game = CORE.composeGame(BANK, [], seeded(900 + LEVELS.findIndex((level) => level.code === code)), { level: code, categories: ["literacy"] });
    assert.equal(game.length, 15);
    assert.equal(new Set(game.map((question) => question.id)).size, 15);
    assert.ok(game.every((question) => question.level === code && question.category === "literacy"));
    assert.deepEqual(game.map((question) => question.difficulty), [
      ...Array(5).fill("easy"), ...Array(5).fill("medium"), ...Array(5).fill("hard"),
    ]);
  }
});

test("questions for concepts with multiple meanings carry a valid, explicit sense context", () => {
  const multiSenseConcepts = KNOWLEDGE_BANK.concepts.filter((concept) => (concept.senses || []).length > 1);
  const allQuestions = LEVELS.flatMap(({ code }) => CANONICAL_BANKS[code].questions);
  for (const concept of multiSenseConcepts) {
    const questions = allQuestions.filter((question) => question.conceptId === concept.concept_id);
    const permittedSenseIds = new Set(concept.senses.map((sense) => sense.sense_id));
    assert.ok(questions.length > 0, `${concept.concept} should be represented in its level bank.`);
    assert.ok(questions.every((question) => permittedSenseIds.has(question.senseId)), `${concept.concept} should identify the intended meaning.`);
    assert.ok(questions.every((question) => typeof question.senseContext === "string" && question.senseContext.trim().length > 0), `${concept.concept} should state the context that disambiguates its meaning.`);
    assert.ok(questions.filter((question) => question.answerMode === "concept")
      .every((question) => normalise(question.question).includes(normalise(question.senseContext))), `${concept.concept} Easy descriptions should show their sense context to the pupil.`);
    assert.ok(questions.filter((question) => question.answerMode === "not_feature")
      .every((question) => question.question === `Which is NOT a feature of ${concept.concept}?`), `${concept.concept} Medium questions should use the fixed feature prompt.`);
  }
});

test("every Medium question has three true target features and one correct false feature", () => {
  const conceptsById = new Map(KNOWLEDGE_BANK.concepts.map((concept) => [concept.concept_id, concept]));
  const mediumQuestions = LEVELS.flatMap(({ code }) => CANONICAL_BANKS[code].questions
    .filter((question) => question.difficulty === "Medium"));
  assert.equal(mediumQuestions.length, 300);
  for (const question of mediumQuestions) {
    assert.equal(question.questionType, "feature_exclusion");
    assert.equal(question.answerMode, "not_feature");
    assert.match(question.question, /which is NOT a feature of .+\?$/i);
    assert.equal(question.answers.length, 4);
    assert.equal(new Set(question.answers.map((answer) => normalise(answer.text))).size, 4);
    assert.ok(question.answers.every((answer) => answer.text.length <= 120));
    const correct = question.answers.filter((answer) => answer.correct);
    const trueFeatures = question.answers.filter((answer) => !answer.correct);
    assert.equal(correct.length, 1, `${question.id} should have one false feature marked correct.`);
    assert.equal(trueFeatures.length, 3, `${question.id} should have three true target features.`);
    assert.ok(trueFeatures.every((answer) => answer.featureOfConceptId === question.conceptId), `${question.id} true features should belong to the assessed concept.`);
    assert.ok(question.featureSourceConceptId && question.featureSourceConceptId !== question.conceptId);
    assert.equal(correct[0].featureOfConceptId, question.featureSourceConceptId);
    assert.equal(conceptsById.get(question.featureSourceConceptId)?.level, conceptsById.get(question.conceptId)?.level, `${question.id} false feature must come from the same qualification.`);
    assert.match(question.explanation, new RegExp(`describes ${conceptsById.get(question.featureSourceConceptId).concept.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}, not `, "i"));
  }
});

test("the UI loads the concept bank before the combined bank and keeps non-audio concepts independent", () => {
  const html = fs.readFileSync(path.join(ROOT, "millionaire.html"), "utf8");
  const script = fs.readFileSync(path.join(ROOT, "millionaire.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "millionaire.css"), "utf8");
  const generatedIndex = html.indexOf("millionaire-music-concept-bank.js");
  const combinedIndex = html.indexOf("millionaire-question-bank.js");
  assert.ok(generatedIndex >= 0 && combinedIndex > generatedIndex, "The generated concept bank must load before the combined question bank.");
  assert.match(script, /id: "concepts", categories: \["concepts"\], label: "Music Concepts"/);
  assert.match(script, /audioQuestions:\s*true/);
  assert.match(script, /settings\.audioQuestions && categories\.includes\("concepts"\) && categoryAvailableAtLevel\(settings\.level, "listening"\)/);
  assert.match(script, /label="Audio Questions"[\s\S]*?disabled=\{!settings\.questionTypes\.includes\("concepts"\) \|\| !categoryAvailableAtLevel\(settings\.level, "listening"\)\}/);
  assert.ok(!BANK.some((question) => question.category === "concepts" && (question.audioSrc || question.audio)), "Current Music Concept questions must remain text-only.");
  assert.ok(script.includes('className="millionaire-concept-description"') && script.includes("question.prompt || question.question"), "The description and short question should render in separate containers.");
  assert.match(css, /\.millionaire-question-media\.has-concept-description \{[^}]*align-items: center;[^}]*padding-bottom: 0;/s, "The concept description should be vertically centred above the question.");
  assert.match(css, /\.millionaire-concept-description \{[^}]*width: min\(520px, calc\(100% - 80px\)\);/s, "The concept description should use the narrower centred width.");
  assert.match(css, /\.millionaire-concept-description \{[^}]*border:[^;]*rgba\(147,197,253,[^)]+\)[^}]*background:[^}]*linear-gradient[^}]*text-align: center;/s);
});

test("the local Question Editor manages 900 permanent concept and difficulty slots", () => {
  const fs = require("node:fs");
  const common = fs.readFileSync(path.join(__dirname, "scripts/music-concepts/question-bank-common.js"), "utf8");
  const generator = fs.readFileSync(path.join(__dirname, "scripts/music-concepts/generate-question-banks.js"), "utf8");
  const server = fs.readFileSync(path.join(__dirname, "scripts/music-concepts/question-editor-server.js"), "utf8");
  const editor = fs.readFileSync(path.join(__dirname, "tools/millionaire-question-editor/index.html"), "utf8");
  const editorScript = fs.readFileSync(path.join(__dirname, "tools/millionaire-question-editor/editor.js"), "utf8");
  const gameScript = fs.readFileSync(path.join(__dirname, "millionaire.js"), "utf8");
  const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, "data/questions/music-concepts/manual-question-overrides.json"), "utf8"));
  const editorSlots = JSON.parse(fs.readFileSync(path.join(__dirname, "data/questions/music-concepts/editor-slots.json"), "utf8"));
  assert.match(common, /MANUAL_OVERRIDES_PATH/);
  assert.match(common, /EDITOR_SLOTS_PATH/);
  assert.match(generator, /buildFixedQuestionSlots\(bank, mappings, requestedLevels\)/);
  assert.match(generator, /applyFixedSlotOverrides\(slots, manualOverrides\)/);
  assert.match(generator, /slots\.filter\(\(slot\) => slot\.complete\)/);
  assert.match(server, /runScript\(GENERATOR_PATH\);[\s\S]*runScript\(VALIDATOR_PATH\);[\s\S]*fs\.writeFileSync\(MANUAL_OVERRIDES_PATH, previousText\)/);
  assert.match(server, /EDITOR_SLOTS_PATH/);
  assert.match(server, /difficulty !== knownQuestion\.difficulty/);
  assert.doesNotMatch(server, /\/api\/question\/(?:delete|restore)/);
  assert.ok(editor.includes('id="question-list"') && editor.includes('id="answer-fields"') && editor.includes('id="save-button"'));
  assert.ok(editor.includes('id="question-difficulty"') && !editor.includes('id="question-difficulty" disabled')
    && editor.includes('id="clear-button"') && editor.includes('id="edit-status-filter"'));
  assert.ok(!editor.includes('id="difficulty-filter"'), "Difficulty should be selected inside a concept rather than duplicating concept cards.");
  assert.ok(editor.includes('id="concept-filter"') && editor.includes("All concepts"));
  assert.ok(!editor.includes('id="restore-button"') && !editor.includes('id="show-deleted"'));
  assert.ok(editor.includes('class="game-preview"') && editor.includes('id="preview-description"') && editor.includes('id="preview-answer-3"'));
  assert.match(editorScript, /function updatePreview\(\)/);
  assert.match(editorScript, /function filteredConcepts\(\)/);
  assert.match(editorScript, /function selectConcept\(conceptId\)/);
  assert.match(editorScript, /concepts\.length} concept/);
  assert.match(editorScript, /question\.conceptId !== elements\.concept\.value/);
  assert.match(editorScript, /elements\.clear\.addEventListener\("click"/);
  assert.match(editorScript, /Nothing will change in Millionaire until you save/);
  assert.match(editorScript, /question\?\.status === "ready" \? "ready" : "blank"/);
  assert.match(editorScript, /• Edited/);
  assert.doesNotMatch(editorScript, /fetch\("\/api\/question\/delete"/);
  assert.match(gameScript, /href="http:\/\/127\.0\.0\.1:4178\/"[^>]*>[^<]*<span[^>]*>Question Editor<\/span>/);
  assert.equal(overrides.schemaVersion, "1.0");
  assert.ok(overrides.questions && !Array.isArray(overrides.questions));

  assert.equal(editorSlots.schemaVersion, "1.0");
  assert.equal(editorSlots.slotCount, 900);
  assert.equal(editorSlots.slots.length, 900);
  assert.deepEqual(Object.fromEntries(["Easy", "Medium", "Hard"].map((difficulty) => [difficulty,
    editorSlots.slots.filter((slot) => slot.difficulty === difficulty).length])), {
    Easy: 300,
    Medium: 300,
    Hard: 300,
  });
  const slotsByConcept = editorSlots.slots.reduce((groups, slot) => {
    if (!groups.has(slot.conceptId)) groups.set(slot.conceptId, []);
    groups.get(slot.conceptId).push(slot);
    return groups;
  }, new Map());
  assert.equal(slotsByConcept.size, 300);
  slotsByConcept.forEach((slots, conceptId) => {
    assert.equal(slots.length, 3, `${conceptId} should retain exactly three permanent slots.`);
    assert.deepEqual(new Set(slots.map((slot) => slot.difficulty)), new Set(["Easy", "Medium", "Hard"]));
  });
  const readySlots = editorSlots.slots.filter((slot) => slot.status === "ready");
  const draftSlots = editorSlots.slots.filter((slot) => slot.status === "draft");
  assert.equal(readySlots.length, 600);
  assert.equal(draftSlots.length, 300);
  assert.ok(editorSlots.slots.filter((slot) => slot.difficulty === "Easy" || slot.difficulty === "Medium")
    .every((slot) => slot.status === "ready"));
  const hardSlots = editorSlots.slots.filter((slot) => slot.difficulty === "Hard");
  assert.ok(hardSlots.every((slot) => slot.status === "draft"
    && slot.prompt === ""
    && slot.answers.length === 4
    && slot.answers.every((answer) => answer === "")
    && slot.correctAnswer === -1
    && slot.hint === ""
    && slot.explanation === ""), "Every default Hard slot should remain a blank teacher-authored placeholder.");
  const runtimeIds = new Set(BANK.filter((question) => question.category === "concepts").map((question) => question.id));
  editorSlots.slots.forEach((slot) => {
    assert.equal(runtimeIds.has(slot.id), slot.status === "ready", `${slot.id} readiness should match its inclusion in Millionaire.`);
  });
});

test("the Question Editor saves complete questions and keeps cleared or partial slots out of the game", () => {
  const { normaliseQuestionOverride, validateRestrictedAnswers } = require("./scripts/music-concepts/question-editor-server.js");
  const blank = normaliseQuestionOverride({
    id: "MCQ-H-MC0218-F01-H-001",
    difficulty: "Hard",
    conceptDescription: "",
    prompt: "",
    answers: ["", "", "", ""],
    correctAnswer: -1,
    hint: "",
    explanation: "",
  }, { difficulty: "Hard" });
  assert.equal(blank.status, "draft");
  assert.equal(blank.cleared, true);

  const partial = normaliseQuestionOverride({ ...blank, prompt: "Which section belongs to the Mass?" }, { difficulty: "Hard" });
  assert.equal(partial.status, "draft");
  assert.equal(partial.cleared, false);

  const complete = normaliseQuestionOverride({
    ...blank,
    prompt: "Which section belongs to the Mass?",
    answers: ["Gloria", "Aria", "Episode", "Ritornello"],
    correctAnswer: 0,
    hint: "Glory begins this Latin movement.",
    explanation: "Gloria is one of the fixed sections of the Mass.",
  }, { difficulty: "Hard" });
  assert.equal(complete.status, "ready");
  assert.equal(complete.cleared, false);
  assert.throws(() => normaliseQuestionOverride({ ...complete, difficulty: "Medium" }, { difficulty: "Hard" }), /difficulty is fixed/);

  const mediumQuestion = {
    id: "MCQ-H-MC0218-F01-M-001",
    difficulty: "Medium",
    conceptDescription: "",
    prompt: "Which is NOT a feature of Mass?",
    answers: ["Uses the ordinary of the Mass", "May include a Gloria", "Often sets Latin text", "Built on a twelve-bar blues pattern"],
    correctAnswer: 3,
    hint: "Twelve bars and blue notes.",
    explanation: "A twelve-bar blues pattern describes Blues, not Mass. Mass sets parts of the liturgy.",
  };
  const savedMedium = normaliseQuestionOverride(mediumQuestion, { difficulty: "Medium", concept: "Mass" });
  assert.equal(savedMedium.status, "ready");
  assert.throws(() => normaliseQuestionOverride({
    ...mediumQuestion,
    conceptDescription: "A vocal setting of parts of the liturgy.",
  }, { difficulty: "Medium", concept: "Mass" }), /upper description box blank/);
  assert.throws(() => normaliseQuestionOverride({
    ...mediumQuestion,
    prompt: "Which statement does not match Mass?",
  }, { difficulty: "Medium", concept: "Mass" }), /Medium questions must use/);

  assert.doesNotThrow(() => validateRestrictedAnswers({ level: "National 3", conceptId: "MC-0001" }, {
    answers: ["Blues", "Jazz", "Pop", "Rock"], correctAnswer: 0,
  }));
  assert.throws(() => validateRestrictedAnswers({ level: "National 3", conceptId: "MC-0001" }, {
    answers: ["Blues", "Chord", "Pop", "Rock"], correctAnswer: 0,
  }), /Every answer must be a National 3 musical style/);
  assert.throws(() => validateRestrictedAnswers({ level: "National 3", conceptId: "MC-0010" }, {
    answers: ["Ragtime", "Chord", "Scale", "Sequence"], correctAnswer: 0,
  }), /Every answer must be a National 3 musical style/);
  assert.doesNotThrow(() => validateRestrictedAnswers({ level: "National 3", conceptId: "MC-0047" }, {
    answers: ["Brass", "Percussion", "Strings", "Woodwind"], correctAnswer: 0,
  }));
  assert.throws(() => validateRestrictedAnswers({ level: "National 3", conceptId: "MC-0047" }, {
    answers: ["Brass", "Percussion", "Strings", "Bass"], correctAnswer: 0,
  }), /Orchestral-family answers must be Brass, Percussion, Strings and Woodwind/);
  assert.throws(() => validateRestrictedAnswers({
    level: "National 3", conceptId: "MC-0047", difficulty: "Easy", answerMode: "concept",
  }, {
    answers: ["Trumpet", "French horn", "Trombone", "Tuba"], correctAnswer: 0,
  }), /Orchestral-family answers must be Brass, Percussion, Strings and Woodwind/);
});
