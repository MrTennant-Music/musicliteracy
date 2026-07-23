#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const {
  REPOSITORY_ROOT,
  EDITOR_SLOTS_PATH,
  LEVELS,
  DIFFICULTIES,
  CONCEPT_IDENTIFICATION_PROMPT,
  MANUAL_OVERRIDES_PATH,
  loadManualQuestionOverrides,
  loadKnowledgeBank,
  normaliseText,
} = require("./question-bank-common.js");

const HOST = "127.0.0.1";
const PORT = Number(process.env.MLH_QUESTION_EDITOR_PORT || 4178);
const EDITOR_DIRECTORY = path.join(REPOSITORY_ROOT, "tools", "millionaire-question-editor");
const GENERATOR_PATH = path.join(__dirname, "generate-question-banks.js");
const VALIDATOR_PATH = path.join(__dirname, "validate-question-banks.js");
const MAX_REQUEST_BYTES = 64 * 1024;
const ORCHESTRAL_FAMILY_CONCEPT_IDS = new Set(["MC-0047", "MC-0056", "MC-0063", "MC-0068"]);
const ORCHESTRAL_FAMILY_ANSWERS = new Set(["brass", "percussion", "strings", "woodwind"]);
const KNOWLEDGE_BANK = loadKnowledgeBank();
const STYLE_NAMES_BY_LEVEL = new Map(LEVELS.map((level) => [level,
  new Set(KNOWLEDGE_BANK.concepts.filter((concept) => concept.level === level && concept.primary_element === "Styles")
    .flatMap((concept) => [concept.concept, ...(concept.aliases || []), ...(concept.listed_as || [])])
    .map(normaliseText))]));
const ALL_STYLE_NAMES = new Set([...STYLE_NAMES_BY_LEVEL.values()].flatMap((names) => [...names]));
const CONCEPTS_BY_LEVEL_AND_NAME = new Map(LEVELS.map((level) => [level,
  new Map(KNOWLEDGE_BANK.concepts.filter((concept) => concept.level === level)
    .flatMap((concept) => [concept.concept, ...(concept.aliases || []), ...(concept.listed_as || [])]
      .map((name) => [normaliseText(name), concept])))]));

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function allQuestions() {
  if (!fs.existsSync(EDITOR_SLOTS_PATH)) {
    throw new Error("The Question Editor slots have not been generated yet. Run the Music Concept question generator, then try again.");
  }
  const source = readJson(EDITOR_SLOTS_PATH);
  if (source?.schemaVersion !== "1.0" || !Array.isArray(source.slots)
    || source.slotCount !== source.slots.length || source.slotCount !== 900) {
    throw new Error("editor-slots.json does not contain a valid Question Editor slot list.");
  }
  const levelOrder = new Map(LEVELS.map((level, index) => [level, index]));
  const difficultyOrder = new Map(DIFFICULTIES.map((difficulty, index) => [difficulty, index]));
  return source.slots.map((slot) => ({
    ...slot,
    conceptDescription: String(slot.conceptDescription || ""),
    prompt: String(slot.prompt || ""),
    answers: Array.from({ length: 4 }, (_, index) => String(slot.answers?.[index] || "")),
    correctAnswer: Number.isInteger(slot.correctAnswer) ? slot.correctAnswer : -1,
    hint: String(slot.hint || ""),
    explanation: String(slot.explanation || ""),
    useDescriptionAsFeedback: slot.useDescriptionAsFeedback === true
      || (slot.useDescriptionAsFeedback == null
        && Boolean(slot.conceptDescription) && slot.explanation === slot.conceptDescription),
    status: slot.status === "ready" ? "ready" : "draft",
    completionState: ["complete", "needs-details", "incomplete"].includes(slot.completionState)
      ? slot.completionState
      : slot.status === "ready" ? "complete" : "incomplete",
    overridden: Boolean(slot.overridden),
  })).sort((left, right) => levelOrder.get(left.level) - levelOrder.get(right.level)
    || left.concept.localeCompare(right.concept, "en-GB")
    || difficultyOrder.get(left.difficulty) - difficultyOrder.get(right.difficulty));
}

function requiredText(value, label, maximum) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} cannot be blank.`);
  if (text.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return text;
}

function optionalText(value, label, maximum) {
  const text = String(value ?? "").trim();
  if (text.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return text;
}

function normaliseQuestionOverride(value, knownQuestion = null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The saved question is not valid.");
  const id = requiredText(value.id, "Question ID", 80);
  const conceptDescription = optionalText(value.conceptDescription, "Description", 500);
  const prompt = optionalText(value.prompt, "Question", 200);
  if (!Array.isArray(value.answers) || value.answers.length !== 4) throw new Error("Exactly four answers are required.");
  const answers = value.answers.map((answer, index) => optionalText(answer, `Answer ${index + 1}`, 120));
  const correctAnswer = value.correctAnswer == null || value.correctAnswer === "" ? -1 : Number(value.correctAnswer);
  if (!Number.isInteger(correctAnswer) || correctAnswer < -1 || correctAnswer > 3) throw new Error("The selected correct answer is not valid.");
  const hint = optionalText(value.hint, "Hint", 240);
  const suppliedExplanation = optionalText(value.explanation, "Explanation", 600);
  const useDescriptionAsFeedback = value.useDescriptionAsFeedback === true;
  if (useDescriptionAsFeedback && !conceptDescription) {
    throw new Error("Add a description before using it as feedback.");
  }
  const explanation = useDescriptionAsFeedback ? conceptDescription : suppliedExplanation;
  const difficulty = requiredText(value.difficulty, "Difficulty", 20);
  if (!DIFFICULTIES.includes(difficulty)) throw new Error("Choose Easy, Medium or Hard difficulty.");
  if (knownQuestion && difficulty !== knownQuestion.difficulty) {
    throw new Error("This slot's difficulty is fixed and cannot be changed.");
  }
  const normalisedAnswers = answers.map(normaliseText);
  const canEnterPool = Boolean(prompt) && answers.every(Boolean) && correctAnswer >= 0;
  const needsDescription = (knownQuestion?.difficulty || difficulty) === "Easy";
  const fullyComplete = (!needsDescription || Boolean(conceptDescription))
    && Boolean(prompt) && prompt.endsWith("?")
    && answers.every(Boolean) && new Set(normalisedAnswers).size === 4
    && correctAnswer >= 0
    && Boolean(hint) && Boolean(explanation);
  const ready = canEnterPool;
  const completionState = !ready ? "incomplete" : fullyComplete ? "complete" : "needs-details";
  if (fullyComplete && difficulty === "Easy" && prompt !== CONCEPT_IDENTIFICATION_PROMPT) {
    throw new Error(`Easy questions must use: ${CONCEPT_IDENTIFICATION_PROMPT}`);
  }
  const cleared = !conceptDescription && !prompt && answers.every((answer) => !answer)
    && correctAnswer === -1 && !hint && !explanation;
  return {
    id,
    conceptDescription,
    prompt,
    answers,
    correctAnswer,
    hint,
    explanation,
    useDescriptionAsFeedback,
    difficulty,
    status: ready ? "ready" : "draft",
    completionState,
    cleared,
  };
}

function writeJsonAtomically(filename, value) {
  const temporary = `${filename}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, filename);
}

function runScript(filename) {
  const result = spawnSync(process.execPath, [filename], { cwd: REPOSITORY_ROOT, encoding: "utf8" });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    throw new Error(output || `${path.basename(filename)} could not be completed.`);
  }
  return result.stdout.trim();
}

function saveQuestion(value) {
  const id = requiredText(value?.id, "Question ID", 80);
  const knownQuestion = allQuestions().find((question) => question.id === id);
  if (!knownQuestion) throw new Error(`Question ${id} could not be found.`);
  const override = normaliseQuestionOverride(value, knownQuestion);
  if (override.status === "ready") validateRestrictedAnswers(knownQuestion, override);
  writeQuestionOverride(knownQuestion, override);
  const savedQuestion = allQuestions().find((question) => question.id === override.id);
  if (!savedQuestion) throw new Error(`Question ${override.id} was saved but is missing from the Question Editor slots.`);
  return savedQuestion;
}

function validateRestrictedAnswers(question, override) {
  const answers = new Set(override.answers.map(normaliseText));
  const answerConcepts = override.answers.map((answer) =>
    CONCEPTS_BY_LEVEL_AND_NAME.get(question.level)?.get(normaliseText(answer))).filter(Boolean);
  if ([...answers].some((answer) => ALL_STYLE_NAMES.has(answer))
    && [...answers].some((answer) => !STYLE_NAMES_BY_LEVEL.get(question.level)?.has(answer))) {
    throw new Error(`Every answer must be a ${question.level} musical style.`);
  }
  if (ORCHESTRAL_FAMILY_CONCEPT_IDS.has(question.conceptId)
    && (question.answerMode === "concept" || question.difficulty === "Easy"
      || answerConcepts.some((concept) => ORCHESTRAL_FAMILY_CONCEPT_IDS.has(concept.concept_id)))
    && (answers.size !== 4 || [...answers].some((answer) => !ORCHESTRAL_FAMILY_ANSWERS.has(answer)))) {
    throw new Error("Orchestral-family answers must be Brass, Percussion, Strings and Woodwind.");
  }
}

function overrideValue(question, override) {
  const editorMetadata = {
    level: question.level,
    category: question.category,
    concept: question.concept,
    conceptId: question.conceptId,
    factId: question.factId,
    questionType: question.questionType,
  };
  return {
    conceptDescription: override.conceptDescription,
    prompt: override.prompt,
    answers: override.answers,
    correctAnswer: override.correctAnswer,
    hint: override.hint,
    explanation: override.explanation,
    useDescriptionAsFeedback: override.useDescriptionAsFeedback,
    difficulty: override.difficulty,
    status: override.status,
    completionState: override.completionState,
    cleared: override.cleared,
    editorMetadata,
  };
}

function rebuildWithRollback(change) {
  const previousText = fs.readFileSync(MANUAL_OVERRIDES_PATH, "utf8");
  const overrides = loadManualQuestionOverrides();
  change(overrides);
  writeJsonAtomically(MANUAL_OVERRIDES_PATH, overrides);
  try {
    runScript(GENERATOR_PATH);
    runScript(VALIDATOR_PATH);
  } catch (error) {
    fs.writeFileSync(MANUAL_OVERRIDES_PATH, previousText);
    try {
      runScript(GENERATOR_PATH);
      runScript(VALIDATOR_PATH);
    } catch (rollbackError) {
      throw new Error(`The change was rejected and the previous bank could not be rebuilt automatically. ${rollbackError.message}`);
    }
    throw new Error(`Nothing was changed. ${String(error.message).split("\n").filter(Boolean).slice(-3).join(" ")}`);
  }
}

function writeQuestionOverride(question, override) {
  rebuildWithRollback((overrides) => {
    overrides.questions[override.id] = overrideValue(question, override);
  });
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_REQUEST_BYTES) reject(new Error("The saved question is too large."));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body)); } catch { reject(new Error("The saved question is not valid JSON.")); }
    });
    request.on("error", reject);
  });
}

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(response, filename) {
  if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(filename).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${HOST}:${PORT}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/questions") return sendJson(response, 200, { questions: allQuestions() });
    if (request.method === "POST" && url.pathname === "/api/question") {
      const saved = saveQuestion(await readBody(request));
      const message = saved.status === "ready"
        ? "Saved and loaded into the Millionaire question bank."
        : "Saved as incomplete. This question will stay out of Millionaire until every required field is complete.";
      return sendJson(response, 200, { message, status: saved.status, question: saved });
    }
    if (request.method === "POST" && url.pathname === "/api/shutdown") {
      sendJson(response, 200, { message: "Question Editor stopped." });
      return setTimeout(() => server.close(() => process.exit(0)), 100);
    }
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) return sendFile(response, path.join(EDITOR_DIRECTORY, "index.html"));
    if (request.method === "GET" && url.pathname.startsWith("/editor/")) {
      const relative = url.pathname.slice("/editor/".length);
      const filename = path.resolve(EDITOR_DIRECTORY, relative);
      if (!filename.startsWith(`${EDITOR_DIRECTORY}${path.sep}`)) throw new Error("Invalid editor path.");
      return sendFile(response, filename);
    }
    if (request.method === "GET" && url.pathname.startsWith("/game/")) {
      const relative = url.pathname.slice("/game/".length);
      const filename = path.resolve(REPOSITORY_ROOT, relative);
      if (!filename.startsWith(`${REPOSITORY_ROOT}${path.sep}`)) throw new Error("Invalid game path.");
      return sendFile(response, filename);
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    spawn("open", [`http://${HOST}:${PORT}/`], { detached: true, stdio: "ignore" }).unref();
    process.exit(0);
  }
  throw error;
});

function startServer() {
  server.listen(PORT, HOST, () => {
    const editorUrl = `http://${HOST}:${PORT}/`;
    console.log(`Millionaire Question Editor is running at ${editorUrl}`);
    console.log("Keep this window open while editing. Press Control-C to stop.");
    if (process.env.MLH_QUESTION_EDITOR_NO_OPEN !== "1") spawn("open", [editorUrl], { detached: true, stdio: "ignore" }).unref();
  });
}

if (require.main === module) startServer();

module.exports = { allQuestions, normaliseQuestionOverride, validateRestrictedAnswers, saveQuestion, startServer };
