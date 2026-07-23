"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const REPOSITORY_ROOT = path.resolve(__dirname, "../..");
const KNOWLEDGE_BANK_FILENAME = "Music_Concept_Knowledge_Bank_Ultimate_Codex_Edition.json";
const KNOWLEDGE_BANK_PATH = path.join(REPOSITORY_ROOT, KNOWLEDGE_BANK_FILENAME);
const OUTPUT_DIRECTORY = path.join(REPOSITORY_ROOT, "data/questions/music-concepts");
const RUNTIME_BANK_PATH = path.join(REPOSITORY_ROOT, "millionaire-music-concept-bank.js");
const MANUAL_OVERRIDES_PATH = path.join(OUTPUT_DIRECTORY, "manual-question-overrides.json");
const EDITOR_SLOTS_PATH = path.join(OUTPUT_DIRECTORY, "editor-slots.json");
const MEDIUM_FEATURE_DIRECTORY = path.join(OUTPUT_DIRECTORY, "medium-features");
const STRONG_HINT_DIRECTORY = path.join(__dirname, "strong-hints");

const LEVELS = ["National 3", "National 4", "National 5", "Higher", "Advanced Higher"];
const LEVEL_CODES = {
  "National 3": "N3",
  "National 4": "N4",
  "National 5": "N5",
  Higher: "H",
  "Advanced Higher": "AH",
};
const LEVEL_FILENAMES = {
  "National 3": "national3.json",
  "National 4": "national4.json",
  "National 5": "national5.json",
  Higher: "higher.json",
  "Advanced Higher": "advanced-higher.json",
};
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const DIFFICULTY_CODES = { Easy: "E", Medium: "M", Hard: "H" };
const DIFFICULTY_RANGES = {
  Easy: { min: 1, max: 5 },
  Medium: { min: 6, max: 10 },
  Hard: { min: 11, max: 15 },
};

const CONCEPT_IDENTIFICATION_PROMPT = "What concept is described?";
const CONCEPT_IDENTIFICATION_ENDINGS = [
  "Which option matches the clue?",
  "Which is the best match?",
  "Which concept fits?",
  "Which term fits best?",
  "Which term matches?",
  "Which term fits?",
  "What is this?",
];

// The knowledge bank defines the available meanings and the required scope,
// but it intentionally does not attach a sense ID to each fact. This reviewed
// table makes that final assessment choice explicit for generation and
// validation, especially where one concept contains facts for two meanings.
const SENSE_RULES = {
  "MC-0035": { default: ["MC-0035-S01", "In chordal or multi-part music, "] },
  "MC-0057": { default: ["MC-0057-S01", "As a keyboard instrument, "] },
  "MC-0083": {
    default: ["MC-0083-S01", "As an accompaniment, "],
    "MC-0083-F02": ["MC-0083-S02", "On bagpipes, "],
  },
  "MC-0088": { default: ["MC-0088-S01", "In harmony, "] },
  "MC-0115": { default: ["MC-0115-S01", "As a male voice, "] },
  "MC-0147": { default: ["MC-0147-S01", "In a large vocal work, "] },
  "MC-0173": { default: ["MC-0173-S01", "As a pitch interval, "] },
  "MC-0185": { default: ["MC-0185-S01", "In rondo form, "] },
  "MC-0225": {
    default: ["MC-0225-S01", "As an ensemble, "],
    "MC-0225-F02": ["MC-0225-S02", "As a chamber work, "],
  },
  "MC-0255": { default: ["MC-0255-S01", "As a musical theme, "] },
  "MC-0286": { default: ["MC-0286-S01", "In a fugue, "] },
  "MC-0288": { default: ["MC-0288-S01", "In sonata form, "] },
  "MC-0291": {
    default: ["MC-0291-S01", "As a melodic or tone-row transformation, "],
    "MC-0291-F02": ["MC-0291-S02", "In a chord, "],
    "MC-0291-F03": ["MC-0291-S02", "In a chord, "],
  },
  "MC-0296": { default: ["MC-0296-S01", "In a fugue, "] },
  "MC-0299": {
    default: ["MC-0299-S01", "As an ensemble, "],
    "MC-0299-F03": ["MC-0299-S02", "As a chamber work, "],
  },
};

const CURATED_DERIVED_TERMS = {
  "MC-0057": ["pianoforte"],
  "MC-0275": ["serialism"],
  "MC-0017": ["repeat", "repeats", "repeated", "repeating"],
  "MC-0028": ["off beat", "off-beat"],
  "MC-0029": ["on beat", "on-beat"],
  "MC-0034": ["accompaniment", "accompany", "accompanies", "accompanying"],
  "MC-0046": ["bow", "bowed"],
  "MC-0062": ["strike", "strikes", "struck", "hit", "hits"],
  "MC-0092": ["tonal"],
  "MC-0099": ["dotted rhythm"],
  "MC-0129": ["mute", "mutes", "muting"],
  "MC-0176": ["compound metre", "compound metres"],
  "MC-0177": ["cross rhythm", "cross-rhythm"],
  "MC-0184": ["counterpoint"],
  "MC-0227": ["added sixth", "sixth added", "6th added"],
  "MC-0228": ["diminished seventh"],
  "MC-0230": ["dominant seventh"],
  "MC-0247": ["triplet"],
};

// These reviewed nicknames, alternative names and abbreviations are useful
// question material, but a Hint lifeline must not use them because doing so
// would reveal the answer under another name. They intentionally remain
// separate from CURATED_DERIVED_TERMS so they can still appear in a question
// stem when recognising that approved term is the knowledge being assessed.
const CURATED_HINT_FORBIDDEN_TERMS = {
  "MC-0030": ["fermata"],
  "MC-0042": ["squeeze box"],
  "MC-0051": ["violin"],
  "MC-0072": ["puirt-a-beul"],
  "MC-0101": ["rall", "rall."],
  "MC-0172": ["syllable", "syllables"],
  "MC-0174": ["tr", "tr."],
  "MC-0207": ["pizz", "pizz."],
  "MC-0221": ["Gregorian chant", "plainsong"],
  "MC-0254": ["first-movement form", "first movement form"],
  "MC-0288": ["transition"],
};

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function strongHintKey(conceptId, senseId = null) {
  return senseId ? `${conceptId}|${senseId}` : conceptId;
}

function loadStrongHints() {
  const hints = {};
  Object.values(LEVEL_FILENAMES).forEach((filename) => {
    const filepath = path.join(STRONG_HINT_DIRECTORY, filename);
    const levelHints = readJson(filepath);
    if (!levelHints || Array.isArray(levelHints) || typeof levelHints !== "object") {
      throw new Error(`${filepath} must contain a JSON object keyed by concept or concept-and-sense ID.`);
    }
    Object.entries(levelHints).forEach(([key, hint]) => {
      if (Object.hasOwn(hints, key)) throw new Error(`Strong hint key ${key} is duplicated across level files.`);
      if (typeof hint !== "string" || !hint.trim()) throw new Error(`Strong hint ${key} must be a non-blank string.`);
      hints[key] = hint.trim();
    });
  });
  return Object.freeze(hints);
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]));
}

function sha256Text(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function sha256File(filename) {
  return sha256Text(fs.readFileSync(filename));
}

function normaliseText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[‘’`]/g, "'")
    .replace(/[‐‑‒–—−]/g, "-")
    .toLocaleLowerCase("en-GB")
    .replace(/[^a-z0-9/+' -]+/g, " ")
    .replace(/\s*[-/]\s*/g, (match) => match.includes("/") ? "/" : "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseStem(value) {
  return normaliseText(value)
    .replace(/[!?.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function conceptTerms(concept) {
  const variantSources = [
    concept.concept,
    ...(concept.aliases || []),
  ].map((term) => String(term || "").trim()).filter(Boolean);
  const variants = variantSources.flatMap((term) => {
    // A spaced slash separates alternative names (for example
    // "Leap / leaping"). A slash inside 2/4 or 6/8 is musical data, not a
    // name separator, and must remain available for use as a question clue.
    const slashParts = term.split(/\s+\/\s+/g);
    // Short parenthetical abbreviations such as EDM are useful aliases.
    // Longer explanatory text, including lists of time signatures, is not.
    const parentheticalParts = [...term.matchAll(/\(([^)]+)\)/g)]
      .map((match) => match[1].trim())
      .filter((part) => /^[A-Za-z][A-Za-z0-9 .'-]{0,19}$/.test(part));
    const withoutParentheses = term.replace(/\s*\([^)]+\)\s*/g, " ").trim();
    return [term, ...slashParts, ...parentheticalParts, withoutParentheses];
  });
  const baseTerms = [...new Set([
    ...variants,
    ...(concept.listed_as || []),
    ...(CURATED_DERIVED_TERMS[concept.concept_id] || []),
  ].map((term) => String(term || "").trim()).filter(Boolean))];
  const pluralTerms = baseTerms.flatMap((term) => {
    if (!/^[A-Za-z][A-Za-z '-]*$/.test(term) || /s$/i.test(term)) return [];
    if (/[^aeiou]y$/i.test(term)) return [`${term.slice(0, -1)}ies`];
    if (/(?:ch|sh|x|z)$/i.test(term)) return [`${term}es`];
    return [`${term}s`];
  });
  return [...new Set([...baseTerms, ...pluralTerms])]
    .sort((left, right) => right.length - left.length);
}

function hintForbiddenTerms(concept) {
  return [...new Set([
    ...conceptTerms(concept),
    ...(CURATED_HINT_FORBIDDEN_TERMS[concept.concept_id] || []),
  ])].sort((left, right) => right.length - left.length);
}

function maskConceptTerms(text, concept, replacement = "this concept") {
  let masked = String(text || "");
  conceptTerms(concept).forEach((term) => {
    const flexible = escapeRegExp(term).replace(/ /g, "[\\s-]+");
    masked = masked.replace(new RegExp(`(^|[^A-Za-z0-9])(${flexible})(?=$|[^A-Za-z0-9])`, "gi"),
      (match, prefix) => `${prefix}${replacement}`);
  });
  return masked.replace(/\bthis concept\s*\/\s*this concept\b/gi, "this concept");
}

function ensureTerminalPunctuation(value) {
  const text = String(value || "").trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function conceptQuestionPresentation(question) {
  const fullQuestion = String(question?.question || "").trim();
  if (question?.answerMode !== "concept" || question?.questionType === "odd_one_out") {
    return { conceptDescription: null, prompt: fullQuestion };
  }
  const ending = CONCEPT_IDENTIFICATION_ENDINGS.find((candidate) => fullQuestion.endsWith(candidate));
  if (!ending) return { conceptDescription: null, prompt: fullQuestion };
  return {
    conceptDescription: fullQuestion.slice(0, -ending.length).trim(),
    prompt: CONCEPT_IDENTIFICATION_PROMPT,
  };
}

function compactFact(value, maximumLength = 180) {
  const text = ensureTerminalPunctuation(value).replace(/\s+/g, " ");
  if (text.length <= maximumLength) return text;
  const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (firstSentence && firstSentence.length >= 55 && firstSentence.length <= maximumLength) return firstSentence;
  // A complete long fact is preferable to a shorter but grammatically broken
  // clause. Facts that need a shorter pupil-facing version receive an authored
  // override in the generator.
  return text;
}

function humaniseIdentifier(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\bor\b/g, "or")
    .replace(/\b([a-z])/g, (letter) => letter.toLowerCase());
}

function questionId({ level, conceptId, factId, difficulty, sequence }) {
  const compactConcept = conceptId.replace(/-/g, "");
  const factCode = factId.match(/F\d+$/)?.[0] || factId.replace(`${conceptId}-`, "");
  return `MCQ-${LEVEL_CODES[level]}-${compactConcept}-${factCode}-${DIFFICULTY_CODES[difficulty]}-${String(sequence).padStart(3, "0")}`;
}

function senseRule(concept, factId) {
  if (!concept.senses?.length) return { senseId: null, prefix: "", context: null };
  const rules = SENSE_RULES[concept.concept_id];
  const selected = rules?.[factId] || rules?.default;
  if (!selected) throw new Error(`No reviewed sense rule exists for ${concept.concept_id} / ${factId}.`);
  return { senseId: selected[0], prefix: selected[1], context: selected[1].trim() };
}

function loadKnowledgeBank() {
  return readJson(KNOWLEDGE_BANK_PATH);
}

function loadGeneratedBanks() {
  return LEVELS.map((level) => readJson(path.join(OUTPUT_DIRECTORY, LEVEL_FILENAMES[level])));
}

function loadManualQuestionOverrides() {
  if (!fs.existsSync(MANUAL_OVERRIDES_PATH)) return { schemaVersion: "1.0", questions: {} };
  const value = readJson(MANUAL_OVERRIDES_PATH);
  if (value?.schemaVersion !== "1.0" || !value.questions || Array.isArray(value.questions) || typeof value.questions !== "object") {
    throw new Error("manual-question-overrides.json must contain schemaVersion 1.0 and a questions object.");
  }
  return value;
}

module.exports = {
  REPOSITORY_ROOT,
  KNOWLEDGE_BANK_FILENAME,
  KNOWLEDGE_BANK_PATH,
  OUTPUT_DIRECTORY,
  RUNTIME_BANK_PATH,
  MANUAL_OVERRIDES_PATH,
  EDITOR_SLOTS_PATH,
  MEDIUM_FEATURE_DIRECTORY,
  STRONG_HINT_DIRECTORY,
  LEVELS,
  LEVEL_CODES,
  LEVEL_FILENAMES,
  DIFFICULTIES,
  DIFFICULTY_CODES,
  DIFFICULTY_RANGES,
  CONCEPT_IDENTIFICATION_PROMPT,
  CONCEPT_IDENTIFICATION_ENDINGS,
  SENSE_RULES,
  readJson,
  strongHintKey,
  loadStrongHints,
  stableJson,
  sha256Text,
  sha256File,
  normaliseText,
  normaliseStem,
  conceptTerms,
  hintForbiddenTerms,
  maskConceptTerms,
  ensureTerminalPunctuation,
  conceptQuestionPresentation,
  compactFact,
  humaniseIdentifier,
  questionId,
  senseRule,
  loadKnowledgeBank,
  loadGeneratedBanks,
  loadManualQuestionOverrides,
};
