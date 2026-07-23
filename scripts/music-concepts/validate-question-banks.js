#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { isDeepStrictEqual } = require("node:util");
const {
  REPOSITORY_ROOT,
  KNOWLEDGE_BANK_FILENAME,
  KNOWLEDGE_BANK_PATH,
  OUTPUT_DIRECTORY,
  RUNTIME_BANK_PATH,
  EDITOR_SLOTS_PATH,
  LEVELS,
  LEVEL_CODES,
  LEVEL_FILENAMES,
  DIFFICULTIES,
  DIFFICULTY_RANGES,
  CONCEPT_IDENTIFICATION_PROMPT,
  sha256File,
  normaliseText,
  normaliseStem,
  conceptTerms,
  hintForbiddenTerms,
  conceptQuestionPresentation,
  questionId,
  loadManualQuestionOverrides,
  senseRule,
  strongHintKey,
  loadStrongHints,
  readJson,
  loadKnowledgeBank,
} = require("./question-bank-common.js");

const STRONG_HINTS = loadStrongHints();
const MANUAL_OVERRIDES = loadManualQuestionOverrides();

const EXPECTED_SOURCE_HASH = "1b8ae6e92b1889f3aceba17da7acbe721874ebed637866e55030a54e7860053e";
const EXPECTED_COUNTS = {
  concepts: 300,
  facts: 710,
  groups: 44,
  senses: 15,
  levels: { "National 3": 68, "National 4": 75, "National 5": 70, Higher: 48, "Advanced Higher": 39 },
};
const AUDIO_LANGUAGE = /\b(listen to|in the recording|in the audio|in the excerpt|what can you hear|audio extract|heard in the recording)\b/i;
const HISTORY_LANGUAGE = /\b(1[0-9]{3}|20[0-9]{2}|\d+(?:st|nd|rd|th) century|composer's biography|composer biography|was born)\b/i;
const ODD_ONE_OUT_CRITERION = /\b(not classified as|does not belong to|is not a|is not an|is neither|not related to|rather than)\b/i;
const MAX_QUESTION_STEM_LENGTH = 200;
const VERBOSE_STEM_FRAMING = /\b(?:Two written clues are given|Consider both details|The following comparison contrasts|Consider every clue and distinction)\b/i;
const AVOIDABLE_FORMAL_WORDING = /\b(?:this concept|commonly|normally|typically|typical|generally|frequently|principally|primarily|principal|simultaneously|respectively|approximately|roughly|successively|substantial)\b|\b(?:intervening pitches|characterised by|characteristic features include|orchestral counterpart)\b/i;
const GENERIC_HINT_OPENING = /^(?:Focus|Use|Compare|Rule out|Think about|Track|Decide|Identify|Ask|Look for|Notice|Concentrate|Follow|Match)\b/i;
const GENERIC_HINT_REFERENCE = /\b(?:the answer|the option|the concept|the clue)\b/i;
const MAX_STRONG_HINT_WORDS = 18;
const ORCHESTRAL_FAMILY_CONCEPT_IDS = new Set(["MC-0047", "MC-0056", "MC-0063", "MC-0068"]);
const ORCHESTRAL_FAMILY_ANSWERS = new Set(["brass", "percussion", "strings", "woodwind"]);
const MISCONCEPTION_GUARDS = [
  /major (?:music )?(?:is|sounds?) always happy/i,
  /minor (?:music )?(?:is|sounds?) always sad/i,
  /atonal (?:music )?(?:is|sounds?) random/i,
  /woodwind .*must be made of wood/i,
  /solo .*must be (?:completely )?unaccompanied/i,
  /canon and imitation (?:are|mean) (?:the )?same/i,
];

function exactDisplayedText(value) {
  return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
}
const REVIEWED_NEAR_DUPLICATES = new Map([
  [
    "MCQ-N3-MC0009-F01-E-001|MCQ-N3-MC0012-F01-E-001",
    "Reviewed: the paired stems deliberately assess opposite pitch directions and differ on both the direction and resulting pitch relationship.",
  ],
  [
    "MCQ-N3-MC0009-F02-E-001|MCQ-N3-MC0012-F02-E-001",
    "Reviewed: the paired scale-and-melody examples deliberately reinforce the same two opposite pitch directions without ambiguity.",
  ],
  [
    "MCQ-N3-MC0026-F01-E-001|MCQ-N3-MC0032-F01-E-001",
    "Reviewed: the paired stems deliberately assess opposite tempo changes and use unambiguous increase/decrease language.",
  ],
  [
    "MCQ-N4-MC0101-F02-E-001|MCQ-N5-MC0179-F02-E-001",
    "Reviewed: these cross-level questions assess the distinct written abbreviations rall. and rit.; neither bank is mixed during play.",
  ],
  [
    "MCQ-H-MC0243-F01-E-001|MCQ-H-MC0244-F01-E-001",
    "Reviewed: this pair deliberately contrasts lengthening every note value with shortening every note value.",
  ],
  [
    "MCQ-H-MC0243-F03-E-001|MCQ-H-MC0244-F03-E-001",
    "Reviewed: this pair deliberately contrasts the slower and faster perceived results while keeping the underlying pulse unchanged.",
  ],
  [
    "MCQ-N3-MC0022-F03-E-001|MCQ-N4-MC0097-F03-E-001",
    "Reviewed: these cross-level questions use distinct approved tempo ranges for Adagio and Andante; the banks are never mixed across course levels.",
  ],
  [
    "MCQ-N3-MC0022-F03-E-001|MCQ-N5-MC0178-F03-E-001",
    "Reviewed: these cross-level questions use distinct approved tempo ranges for Adagio and Moderato; the banks are never mixed across course levels.",
  ],
  [
    "MCQ-N4-MC0097-F03-E-001|MCQ-N5-MC0178-F03-E-001",
    "Reviewed: these cross-level questions use distinct approved tempo ranges for Andante and Moderato; the banks are never mixed across course levels.",
  ],
  [
    "MCQ-N4-MC0125-F01-E-001|MCQ-N4-MC0143-F01-E-001",
    "Reviewed: this same-level pair deliberately tests the defining metal-bar versus wooden-bar distinction between two tuned percussion instruments.",
  ],
  [
    "MCQ-N4-MC0141-F01-E-001|MCQ-N5-MC0206-F01-E-001",
    "Reviewed: these cross-level questions identify the highest standard member of different orchestral families; their level banks are never mixed.",
  ],
  [
    "MCQ-H-MC0239-F01-E-001|MCQ-H-MC0240-F01-E-001",
    "Reviewed: the paired stems deliberately assess the opposite relative-major and relative-minor relationships.",
  ],
]);

function requestedLevels() {
  const argument = process.argv.find((value) => value.startsWith("--level="));
  if (argument) {
    throw new Error("Per-level validation is not supported because production validation must cover all five level banks and their shared artifacts. Run the validator without --level.");
  }
  return LEVELS.slice();
}

function includesNormalisedTerm(text, term) {
  const comparable = (value) => normaliseText(value).replace(/[-/]+/g, " ").replace(/\s+/g, " ").trim();
  const source = ` ${comparable(text)} `;
  const target = comparable(term);
  return Boolean(target) && (source.includes(` ${target} `) || source.trim() === target);
}

function tokenDistanceAtMostTwo(left, right) {
  const a = left.split(" ");
  const b = right.split(" ");
  if (Math.abs(a.length - b.length) > 2) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    let rowMinimum = current[0];
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
      rowMinimum = Math.min(rowMinimum, current[column]);
    }
    if (rowMinimum > 2) return false;
    previous = current;
  }
  return previous[b.length] > 0 && previous[b.length] <= 2;
}

function findNearDuplicates(questions) {
  const bucketsByLength = new Map();
  const entries = questions.map((question, index) => {
    const stem = normaliseStem(question.question);
    const tokenCount = stem.split(" ").length;
    const entry = { question, stem, tokenCount, index };
    if (!bucketsByLength.has(tokenCount)) bucketsByLength.set(tokenCount, []);
    bucketsByLength.get(tokenCount).push(entry);
    return entry;
  });
  const matches = [];
  entries.forEach((entry) => {
    for (let tokenCount = entry.tokenCount - 2; tokenCount <= entry.tokenCount + 2; tokenCount += 1) {
      (bucketsByLength.get(tokenCount) || []).forEach((candidate) => {
        if (candidate.index > entry.index && tokenDistanceAtMostTwo(entry.stem, candidate.stem)) {
          matches.push({
            firstId: entry.question.id,
            secondId: candidate.question.id,
            firstStem: entry.question.question,
            secondStem: candidate.question.question,
          });
        }
      });
    }
  });
  return matches;
}

function validateKnowledgeBank(bank, errors) {
  if (bank.schema_version !== "5.0") errors.push(`Knowledge bank: expected schema 5.0, found ${bank.schema_version || "missing"}.`);
  if (sha256File(KNOWLEDGE_BANK_PATH) !== EXPECTED_SOURCE_HASH) errors.push("Knowledge bank: SHA-256 does not match the approved authoritative file.");
  if (bank.concepts?.length !== EXPECTED_COUNTS.concepts) errors.push("Knowledge bank: concept count is not 300.");
  if (bank.validation_summary?.question_eligible_facts !== EXPECTED_COUNTS.facts) errors.push("Knowledge bank: eligible-fact count is not 710.");
  if (bank.comparison_groups?.length !== EXPECTED_COUNTS.groups) errors.push("Knowledge bank: comparison-group count is not 44.");
  if (bank.concepts.filter((concept) => concept.senses?.length).length !== EXPECTED_COUNTS.senses) errors.push("Knowledge bank: multiple-sense concept count is not 15.");
  if (bank.validation_summary?.validation_status !== "passed") errors.push("Knowledge bank: authoritative validation status is not passed.");
  LEVELS.forEach((level) => {
    if (bank.validation_summary?.level_breakdown?.[level] !== EXPECTED_COUNTS.levels[level]) {
      errors.push(`Knowledge bank: ${level} concept count is incorrect.`);
    }
  });
}

function validateQuestion(question, fileLevel, context, errors) {
  const label = question?.id || `${fileLevel} question with no ID`;
  const { conceptsById, groupsById, namesByLevel, styleNamesByLevel, allStyleNames, literacyIds, localTargetExists } = context;
  if (!question || typeof question !== "object") {
    errors.push(`${label}: question must be an object.`);
    return;
  }
  if (!/^MCQ-(N3|N4|N5|H|AH)-MC\d{4}-F\d{2}-(E|M|H)-\d{3}$/.test(question.id || "")) errors.push(`${label}: invalid stable question ID.`);
  if (!LEVELS.includes(question.level)) errors.push(`${label}: invalid level.`);
  if (question.level !== fileLevel) errors.push(`${label}: level does not match its bank file.`);
  if (!DIFFICULTIES.includes(question.difficulty)) errors.push(`${label}: invalid difficulty.`);
  const concept = conceptsById.get(question.conceptId);
  if (!concept) {
    errors.push(`${label}: conceptId does not exist.`);
    return;
  }
  if (concept.level !== question.level || !concept.allowed_levels?.includes(question.level)) errors.push(`${label}: target concept is not exclusive to the question level.`);
  if (question.concept !== concept.concept) errors.push(`${label}: concept name does not match the knowledge bank.`);
  if (question.category !== concept.primary_element) errors.push(`${label}: category does not match primary_element.`);
  if (JSON.stringify(question.categories) !== JSON.stringify(concept.categories)) errors.push(`${label}: categories do not match the knowledge bank.`);
  const conceptAnswerQuestion = question.answerMode === "concept";
  const notFeatureQuestion = question.answerMode === "not_feature";
  const customQuestion = question.answerMode === "custom";
  if (!conceptAnswerQuestion && !notFeatureQuestion && !customQuestion) errors.push(`${label}: unsupported answerMode.`);
  const factsById = new Map(concept.question_eligible_facts.map((fact) => [fact.fact_id, fact]));
  const fact = factsById.get(question.factId);
  if (!fact) errors.push(`${label}: factId is not an eligible fact for the target concept.`);
  (question.supportingFactIds || []).forEach((factId) => {
    const supportingFact = factsById.get(factId);
    if (!supportingFact) errors.push(`${label}: supportingFactId ${factId} is not an eligible fact for the target concept.`);
    else if (supportingFact.source === "source_audit" || supportingFact.background_only === true) errors.push(`${label}: supporting fact ${factId} comes from a prohibited source field.`);
  });
  let hintFact = null;
  if (!Object.prototype.hasOwnProperty.call(question, "hintFactId")) {
    errors.push(`${label}: hintFactId audit metadata is missing.`);
  } else if (question.hintFactId != null) {
    hintFact = factsById.get(question.hintFactId);
    if (!hintFact) errors.push(`${label}: hintFactId ${question.hintFactId} is not an eligible fact for the target concept.`);
    else if (hintFact.source === "source_audit" || hintFact.background_only === true) errors.push(`${label}: hint fact ${question.hintFactId} comes from a prohibited source field.`);
  }
  if (conceptAnswerQuestion && !concept.question_support?.allowed_question_types?.includes(question.questionType)) errors.push(`${label}: questionType is not permitted for this concept.`);
  if (notFeatureQuestion && question.questionType !== "feature_exclusion") errors.push(`${label}: Medium feature question has the wrong questionType.`);
  if (customQuestion && question.questionType !== "teacher_authored") errors.push(`${label}: custom question has the wrong questionType.`);
  if (question.comparisonGroupId != null && !groupsById.has(question.comparisonGroupId)) errors.push(`${label}: comparisonGroupId does not exist.`);
  const sensesById = new Map((concept.senses || []).map((sense) => [sense.sense_id, sense]));
  if (concept.senses?.length) {
    if (!sensesById.has(question.senseId)) errors.push(`${label}: multiple-meaning concept has no valid senseId.`);
    const reviewedPrimarySense = senseRule(concept, question.factId);
    if (reviewedPrimarySense.senseId !== question.senseId || reviewedPrimarySense.context !== question.senseContext) {
      errors.push(`${label}: primary fact does not use its reviewed meaning and context.`);
    }
    (question.supportingFactIds || []).forEach((factId) => {
      if (senseRule(concept, factId).senseId !== question.senseId) {
        errors.push(`${label}: supporting fact ${factId} belongs to a different meaning of the term.`);
      }
    });
    if (hintFact && senseRule(concept, hintFact.fact_id).senseId !== question.senseId) {
      errors.push(`${label}: hint fact ${hintFact.fact_id} belongs to a different meaning of the term.`);
    }
    if (!question.senseContext || (!notFeatureQuestion
      && !normaliseStem(question.question).startsWith(normaliseStem(question.senseContext)))) {
      errors.push(`${label}: multiple-meaning concept does not state its curated context clearly.`);
    }
  } else if (question.senseId !== null || question.senseContext !== null) {
    errors.push(`${label}: sense metadata is present for a concept without defined senses.`);
  }
  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    errors.push(`${label}: exactly four answers are required.`);
  } else {
    const correct = question.answers.filter((answer) => answer?.correct === true);
    if (correct.length !== 1) errors.push(`${label}: exactly one answer must be correct.`);
    const answerTexts = question.answers.map((answer) => normaliseText(answer?.text));
    if (answerTexts.some((text) => !text)) errors.push(`${label}: answer text must not be blank.`);
    if (new Set(answerTexts).size !== 4) errors.push(`${label}: answer text is duplicated after normalisation.`);
    if (answerTexts.some((answer) => allStyleNames.has(answer))
      && answerTexts.some((answer) => !styleNamesByLevel.get(question.level)?.has(answer))) {
      errors.push(`${label}: an answer set containing a musical style must contain only styles from ${question.level}.`);
    }
    if (ORCHESTRAL_FAMILY_CONCEPT_IDS.has(concept.concept_id)
      && (conceptAnswerQuestion || answerTexts.some((answer) => ORCHESTRAL_FAMILY_ANSWERS.has(answer)))
      && (answerTexts.some((answer) => !ORCHESTRAL_FAMILY_ANSWERS.has(answer))
        || new Set(answerTexts).size !== ORCHESTRAL_FAMILY_ANSWERS.size)) {
      errors.push(`${label}: an answer set containing an orchestral family must contain Brass, Percussion, Strings and Woodwind.`);
    }
    if (conceptAnswerQuestion) {
      if (correct[0]?.text !== concept.concept) errors.push(`${label}: correct answer is not the target concept.`);
      question.answers.forEach((answer) => {
        if (!namesByLevel.get(question.level)?.has(normaliseText(answer.text))) {
          errors.push(`${label}: answer '${answer.text}' is not a concept at ${question.level}.`);
        }
      });
    }
    if (notFeatureQuestion) {
      const sourceConcept = conceptsById.get(question.featureSourceConceptId);
      if (!sourceConcept || sourceConcept.level !== question.level || sourceConcept.concept_id === question.conceptId) {
        errors.push(`${label}: false feature source must be a different concept at the same qualification.`);
      }
      const targetFeatures = question.answers.filter((answer) => answer.featureOfConceptId === question.conceptId);
      const falseFeatures = question.answers.filter((answer) => answer.featureOfConceptId === question.featureSourceConceptId);
      if (targetFeatures.length !== 3 || falseFeatures.length !== 1 || falseFeatures[0]?.correct !== true) {
        errors.push(`${label}: NOT-a-feature question must contain three target features and one correct false feature.`);
      }
      if (sourceConcept && (!includesNormalisedTerm(question.explanation, sourceConcept.concept)
        || !includesNormalisedTerm(question.explanation, concept.concept))) {
        errors.push(`${label}: NOT-a-feature feedback must name both the false-feature source and the assessed concept.`);
      }
    }
  }
  if (!question.question?.trim()) errors.push(`${label}: question stem is blank.`);
  if (!/\?$/.test(question.question?.trim() || "")) errors.push(`${label}: question stem must end as a direct question.`);
  if ((question.question || "").length > MAX_QUESTION_STEM_LENGTH) errors.push(`${label}: question stem exceeds the ${MAX_QUESTION_STEM_LENGTH}-character Millionaire layout limit.`);
  if (VERBOSE_STEM_FRAMING.test(question.question || "")) errors.push(`${label}: question uses unnecessary instructional framing.`);
  if (/\bdescribed\?$/i.test(question.question || "")) errors.push(`${label}: question uses a passive, exam-style ending instead of a direct prompt.`);
  [
    ["question", question.question],
    ["hint", question.hint],
    ["explanation", question.explanation],
    ...(question.answers || []).map((answer, index) => [`answer ${index + 1}`, answer?.text]),
  ].forEach(([field, text]) => {
    if (AVOIDABLE_FORMAL_WORDING.test(text || "")) errors.push(`${label}: ${field} contains avoidable formal wording.`);
  });
  if (/\bIt is false that\b/i.test(question.question || "")) errors.push(`${label}: question relies on an ambiguous negative claim instead of a positive identifying clue.`);
  if (/\bpupil\b/i.test(question.question || "")) errors.push(`${label}: question uses unnecessary third-person pupil framing.`);
  if (!question.hint?.trim()) errors.push(`${label}: hint is blank.`);
  const manualPresentation = MANUAL_OVERRIDES.questions[question.id];
  const presentation = manualPresentation ? {
    conceptDescription: manualPresentation.conceptDescription || null,
    prompt: manualPresentation.prompt,
  } : conceptQuestionPresentation(question);
  if (presentation.conceptDescription && question.explanation !== presentation.conceptDescription) {
    errors.push(`${label}: description-question feedback must exactly match its displayed description.`);
  }
  if (/^A second useful clue is:/i.test(question.hint || "")) errors.push(`${label}: hint contains redundant introductory wording.`);
  const reviewedHintKey = strongHintKey(question.conceptId, question.senseId);
  if (conceptAnswerQuestion) {
    const reviewedHint = MANUAL_OVERRIDES.questions[question.id]?.hint || STRONG_HINTS[reviewedHintKey];
    if (!reviewedHint) errors.push(`${label}: no reviewed strong hint exists for ${reviewedHintKey}.`);
    else if (question.hint !== reviewedHint) errors.push(`${label}: hint does not match the reviewed strong hint for ${reviewedHintKey}.`);
  } else if (notFeatureQuestion) {
    const sourceHints = Object.entries(STRONG_HINTS)
      .filter(([key]) => key === question.featureSourceConceptId || key.startsWith(`${question.featureSourceConceptId}|`))
      .map(([, hint]) => hint);
    const manualHint = MANUAL_OVERRIDES.questions[question.id]?.hint;
    if (manualHint ? question.hint !== manualHint : !sourceHints.includes(question.hint)) {
      errors.push(`${label}: hint must be the reviewed or teacher-edited clue for its false-feature source.`);
    }
  }
  if (question.hintFactId !== null) errors.push(`${label}: production hints must come from the reviewed strong-hint bank, not a rotated fact.`);
  if (GENERIC_HINT_OPENING.test(question.hint || "") || GENERIC_HINT_REFERENCE.test(question.hint || "")) {
    errors.push(`${label}: hint uses generic solving instructions instead of an answer-specific clue.`);
  }
  if ((question.hint || "").trim().split(/\s+/).filter(Boolean).length > MAX_STRONG_HINT_WORDS) {
    errors.push(`${label}: hint exceeds the ${MAX_STRONG_HINT_WORDS}-word strong-hint limit.`);
  }
  if (!question.explanation?.trim()) errors.push(`${label}: explanation is blank.`);
  if (conceptAnswerQuestion) {
    const correctText = question.answers?.find((answer) => answer.correct)?.text || concept.concept;
    [...hintForbiddenTerms(concept), correctText].forEach((term) => {
      if (includesNormalisedTerm(question.hint, term)) errors.push(`${label}: hint contains the answer term '${term}'.`);
    });
    (question.answers || []).filter((answer) => !answer.correct).forEach((answer) => {
      if (includesNormalisedTerm(question.hint, answer.text)) {
        errors.push(`${label}: hint names the distractor '${answer.text}', which could misdirect the pupil.`);
      }
    });
    conceptTerms(concept).forEach((term) => {
      if (includesNormalisedTerm(question.question, term)) errors.push(`${label}: concept-identification stem reveals the answer term '${term}'.`);
    });
    if (/this concept/i.test(question.question)) errors.push(`${label}: mechanically masked wording remains in the pupil-facing question.`);
    if (/\bthis concept (?:beats?|notes?|textures?)\b/i.test(question.question)) {
      errors.push(`${label}: mechanically masked comparison is ungrammatical.`);
    }
  }
  if (/Do not assume that/i.test(question.question)) errors.push(`${label}: misconception uses avoidable double-negative framing.`);
  const coreHint = question.hint.replace(/^A second useful clue is:\s*/i, "");
  const normalisedHint = normaliseStem(coreHint);
  const normalisedQuestion = normaliseStem(question.question);
  if (normalisedHint.length >= 20 && normalisedQuestion.includes(normalisedHint)) {
    errors.push(`${label}: hint repeats wording already present in the question.`);
  }
  const numberedClues = [...question.question.matchAll(/(?:^|\s)\d+\)\s*(.*?)(?=\s+\d+\)\s*|\s+(?:Distinction|Misconception to reject):|\s+Which (?:concept|term|of the four))/gi)]
    .map((match) => normaliseStem(match[1])).filter(Boolean);
  for (let left = 0; left < numberedClues.length; left += 1) {
    for (let right = left + 1; right < numberedClues.length; right += 1) {
      const shorter = numberedClues[left].length <= numberedClues[right].length ? numberedClues[left] : numberedClues[right];
      const longer = shorter === numberedClues[left] ? numberedClues[right] : numberedClues[left];
      if (shorter.length >= 25 && longer.includes(shorter)) errors.push(`${label}: one numbered clue is wholly repeated inside another clue.`);
    }
  }
  if (fact?.source === "source_audit" || fact?.background_only === true) errors.push(`${label}: primary fact comes from a prohibited source field.`);
  if (AUDIO_LANGUAGE.test(question.question)) errors.push(`${label}: question incorrectly requires or refers to audio.`);
  if (HISTORY_LANGUAGE.test(question.question)) errors.push(`${label}: question relies on prohibited historical or biographical wording.`);
  if (question.questionType === "odd_one_out" && !ODD_ONE_OUT_CRITERION.test(question.question)) errors.push(`${label}: odd-one-out question does not state its classification criterion.`);
  const misconception = MISCONCEPTION_GUARDS.find((pattern) => pattern.test(question.question));
  if (misconception && !/not always|misconception/i.test(question.question)) errors.push(`${label}: a known misconception is presented without a corrective context.`);
  if (question.literacyLink != null) {
    if (!question.literacyLink.relationship
      || !Array.isArray(question.literacyLink.targets) || !question.literacyLink.targets.length
      || !Array.isArray(question.literacyLink.targetLiteracyIds) || !question.literacyLink.targetLiteracyIds.length) {
      errors.push(`${label}: literacyLink is incomplete.`);
    } else {
      const flattenedIds = [];
      question.literacyLink.targets.forEach((target) => {
        if (!target?.sourceFile || !target?.matchKind || !Array.isArray(target.localIds) || !target.localIds.length) {
          errors.push(`${label}: literacyLink contains an incomplete source-qualified target.`);
          return;
        }
        if (new Set(target.localIds).size !== target.localIds.length) errors.push(`${label}: literacyLink target IDs are duplicated within ${target.sourceFile}.`);
        target.localIds.forEach((id) => {
          flattenedIds.push(id);
          if (target.sourceFile === "millionaire-question-bank.js") {
            if (!literacyIds.has(id)) errors.push(`${label}: Music Literacy question target ${id} does not exist.`);
          } else if (!localTargetExists(target.sourceFile, id)) {
            errors.push(`${label}: component target ${target.sourceFile}:${id} does not exist.`);
          }
        });
      });
      const declaredIds = [...new Set(question.literacyLink.targetLiteracyIds)].sort();
      const qualifiedIds = [...new Set(flattenedIds)].sort();
      if (JSON.stringify(declaredIds) !== JSON.stringify(qualifiedIds)) errors.push(`${label}: source-qualified targets do not match targetLiteracyIds.`);
    }
  }
}

function validatePositionBalance(questions, levels, errors, warnings) {
  levels.forEach((level) => {
    DIFFICULTIES.forEach((difficulty) => {
      const pool = questions.filter((question) => question.level === level && question.difficulty === difficulty);
      if (difficulty !== "Hard" && pool.length < 5) errors.push(`${level} / ${difficulty}: only ${pool.length} complete questions; at least 5 are required to build a game.`);
      const counts = [0, 1, 2, 3].map((position) => pool.filter((question) => question.answers?.[position]?.correct).length);
      if (difficulty !== "Hard" && Math.max(...counts) - Math.min(...counts) > 1) {
        warnings.push(`${level} / ${difficulty}: completed questions have uneven stored answer positions (${counts.join(", ")}); answers are still shuffled during play.`);
      }
    });
  });
}

function validateEditorSlots(bank, errors) {
  let file;
  try {
    file = readJson(EDITOR_SLOTS_PATH);
  } catch (error) {
    errors.push(`Editor slots: could not parse editor-slots.json (${error.message}).`);
    return new Set();
  }
  const slots = Array.isArray(file?.slots) ? file.slots : [];
  if (file?.schemaVersion !== "1.0" || file?.slotCount !== 900 || slots.length !== 900) {
    errors.push(`Editor slots: expected exactly 900 fixed slots, found ${slots.length}.`);
  }
  const conceptsById = new Map(bank.concepts.map((concept) => [concept.concept_id, concept]));
  const seenIds = new Set();
  const seenKeys = new Set();
  const readyIds = new Set();
  slots.forEach((slot) => {
    const label = slot?.id || "Editor slot with no ID";
    const concept = conceptsById.get(slot?.conceptId);
    if (!concept) errors.push(`${label}: editor slot refers to an unknown concept.`);
    else if (slot.level !== concept.level || slot.concept !== concept.concept || slot.category !== concept.primary_element) {
      errors.push(`${label}: editor slot metadata does not match its concept.`);
    }
    if (!DIFFICULTIES.includes(slot?.difficulty)) errors.push(`${label}: editor slot difficulty is invalid.`);
    if (seenIds.has(slot?.id)) errors.push(`${label}: editor slot ID is duplicated.`);
    seenIds.add(slot?.id);
    const key = `${slot?.conceptId}|${slot?.difficulty}`;
    if (seenKeys.has(key)) errors.push(`${label}: concept/difficulty slot is duplicated.`);
    seenKeys.add(key);
    if (concept && slot?.factId && slot.id !== questionId({ level: concept.level, conceptId: concept.concept_id, factId: slot.factId, difficulty: slot.difficulty, sequence: 1 })) {
      errors.push(`${label}: editor slot ID is not the stable concept/difficulty ID.`);
    }
    if (!Array.isArray(slot?.answers) || slot.answers.length !== 4 || slot.answers.some((answer) => typeof answer !== "string")) {
      errors.push(`${label}: editor slot must expose four editable answer fields.`);
    }
    if (!Number.isInteger(slot?.correctAnswer) || slot.correctAnswer < -1 || slot.correctAnswer > 3) errors.push(`${label}: editor correctAnswer is invalid.`);
    if (slot?.status !== "ready" && slot?.status !== "draft") errors.push(`${label}: editor slot status is invalid.`);
    if (typeof slot?.overridden !== "boolean") errors.push(`${label}: editor slot overridden flag is invalid.`);
    if (slot?.status === "ready") readyIds.add(slot.id);
  });
  DIFFICULTIES.forEach((difficulty) => {
    const count = slots.filter((slot) => slot.difficulty === difficulty).length;
    if (count !== 300) errors.push(`Editor slots: expected 300 ${difficulty} slots, found ${count}.`);
  });
  bank.concepts.forEach((concept) => DIFFICULTIES.forEach((difficulty) => {
    if (!seenKeys.has(`${concept.concept_id}|${difficulty}`)) errors.push(`${concept.concept_id}: missing ${difficulty} editor slot.`);
  }));
  return readyIds;
}

function validateStrongHintCoverage(questions, errors) {
  const requiredKeys = new Set(questions.map((question) => strongHintKey(question.conceptId, question.senseId)));
  const suppliedKeys = new Set(Object.keys(STRONG_HINTS));
  requiredKeys.forEach((key) => {
    if (!suppliedKeys.has(key)) errors.push(`Strong-hint bank: missing required key ${key}.`);
  });
  // Curated hints may remain unused when all playable slots for a concept have
  // been cleared or left incomplete in the local Question Editor.
  const ownersByHint = new Map();
  Object.entries(STRONG_HINTS).forEach(([key, hint]) => {
    const normalised = normaliseStem(hint);
    if (ownersByHint.has(normalised)) {
      errors.push(`Strong-hint bank: ${key} duplicates the hint used by ${ownersByHint.get(normalised)}.`);
    } else {
      ownersByHint.set(normalised, key);
    }
  });
}

function expectedRuntimeQuestion(question) {
  const answerIds = ["a", "b", "c", "d"];
  const correctIndex = question.answers.findIndex((answer) => answer.correct);
  const range = DIFFICULTY_RANGES[question.difficulty];
  const manualPresentation = MANUAL_OVERRIDES.questions[question.id];
  const presentation = manualPresentation ? {
    conceptDescription: manualPresentation.conceptDescription || null,
    prompt: manualPresentation.prompt,
  } : conceptQuestionPresentation(question);
  return {
    id: question.id,
    level: LEVEL_CODES[question.level],
    category: "concepts",
    concept: question.concept,
    conceptId: question.conceptId,
    factId: question.factId,
    supportingFactIds: question.supportingFactIds,
    senseId: question.senseId,
    comparisonGroupId: question.comparisonGroupId,
    musicConceptCategory: question.category,
    musicConceptCategories: question.categories,
    questionType: question.questionType,
    answerMode: question.answerMode,
    question: question.question,
    prompt: presentation.prompt,
    conceptDescription: presentation.conceptDescription,
    answers: question.answers.map((answer, index) => ({ id: answerIds[index], text: answer.text })),
    correctAnswer: answerIds[correctIndex],
    explanation: question.explanation,
    tip: question.hint,
    difficulty: question.difficulty.toLowerCase(),
    difficultyMin: range.min,
    difficultyMax: range.max,
    type: "text",
    audioSrc: "",
    notationData: null,
    literacyLink: question.literacyLink,
  };
}

function validateRuntimeAdapter(questions, errors) {
  delete require.cache[require.resolve(RUNTIME_BANK_PATH)];
  const runtime = require(RUNTIME_BANK_PATH);
  if (!Array.isArray(runtime)) {
    errors.push("Runtime adapter: export is not an array.");
    return;
  }
  if (runtime.length !== questions.length) errors.push(`Runtime adapter: expected ${questions.length} questions, found ${runtime.length}.`);
  const runtimeById = new Map();
  runtime.forEach((question) => {
    if (runtimeById.has(question.id)) errors.push(`${question.id}: duplicate runtime question ID.`);
    runtimeById.set(question.id, question);
    if (question.category !== "concepts") errors.push(`${question.id}: runtime category is not concepts.`);
    if (question.audioSrc !== "" || question.audio || question.notationData !== null || question.type !== "text") errors.push(`${question.id}: runtime Music Concept question must not request audio or unrelated media.`);
    if (!LEVELS.some((level) => LEVEL_CODES[level] === question.level)) errors.push(`${question.id}: runtime level code is invalid.`);
    if (!Array.isArray(question.answers) || question.answers.length !== 4 || !question.answers.some((answer) => answer.id === question.correctAnswer)) errors.push(`${question.id}: runtime answers are invalid.`);
    if (!question.tip || !question.explanation) errors.push(`${question.id}: runtime hint or explanation is missing.`);
    if (question.answerMode === "concept" && (!question.conceptDescription || question.prompt !== CONCEPT_IDENTIFICATION_PROMPT)) {
      errors.push(`${question.id}: Easy description and identification prompt are not separated correctly.`);
    }
    if (question.answerMode === "not_feature" && (question.conceptDescription !== null || question.prompt !== question.question)) {
      errors.push(`${question.id}: Medium NOT-a-feature wording must stay in the main question panel.`);
    }
    if (question.answerMode === "custom" && !question.prompt?.trim()) errors.push(`${question.id}: custom runtime prompt is blank.`);
  });
  questions.forEach((question) => {
    const runtimeQuestion = runtimeById.get(question.id);
    if (!runtimeQuestion) {
      errors.push(`${question.id}: missing from the runtime adapter.`);
      return;
    }
    if (!isDeepStrictEqual(runtimeQuestion, expectedRuntimeQuestion(question))) {
      errors.push(`${question.id}: runtime content does not exactly match its canonical question record.`);
    }
  });
  runtime.forEach((question) => {
    if (!questions.some((canonical) => canonical.id === question.id)) errors.push(`${question.id}: runtime adapter contains an unknown question.`);
  });
}

function validateManifest(questions, errors) {
  const manifestPath = path.join(OUTPUT_DIRECTORY, "manifest.json");
  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    errors.push(`Manifest could not be parsed (${error.message}).`);
    return;
  }
  if (manifest.schemaVersion !== "1.0" || manifest.bankType !== "music-concept-questions") errors.push("Manifest metadata is invalid.");
  if (manifest.source?.knowledgeBankFile !== KNOWLEDGE_BANK_FILENAME
    || manifest.source?.knowledgeBankSchemaVersion !== "5.0"
    || manifest.source?.knowledgeBankSha256 !== EXPECTED_SOURCE_HASH) errors.push("Manifest source metadata is invalid.");
  if (!Array.isArray(manifest.levels) || manifest.levels.length !== LEVELS.length) {
    errors.push(`Manifest must contain exactly ${LEVELS.length} level entries.`);
  } else {
    const seenLevels = new Set();
    manifest.levels.forEach((entry) => {
      if (seenLevels.has(entry.level)) errors.push(`Manifest contains duplicate level ${entry.level}.`);
      seenLevels.add(entry.level);
      if (!LEVELS.includes(entry.level)) {
        errors.push(`Manifest contains unknown level ${entry.level || "(missing)"}.`);
        return;
      }
      const expectedFile = LEVEL_FILENAMES[entry.level];
      const levelPath = path.join(OUTPUT_DIRECTORY, expectedFile);
      const levelQuestions = questions.filter((question) => question.level === entry.level);
      const expectedDifficultyCounts = Object.fromEntries(DIFFICULTIES.map((difficulty) => [
        difficulty,
        levelQuestions.filter((question) => question.difficulty === difficulty).length,
      ]));
      if (entry.levelCode !== LEVEL_CODES[entry.level] || entry.file !== expectedFile) errors.push(`${entry.level}: manifest file mapping is invalid.`);
      if (entry.questionCount !== levelQuestions.length || !isDeepStrictEqual(entry.difficultyCounts, expectedDifficultyCounts)) {
        errors.push(`${entry.level}: manifest question counts do not match the canonical bank.`);
      }
      if (!fs.existsSync(levelPath) || entry.sha256 !== sha256File(levelPath)) errors.push(`${entry.level}: manifest file hash is stale or invalid.`);
    });
    LEVELS.forEach((level) => {
      if (!seenLevels.has(level)) errors.push(`${level}: missing from the manifest.`);
    });
  }
  const expectedRuntimeFile = path.relative(REPOSITORY_ROOT, RUNTIME_BANK_PATH);
  if (manifest.runtimeAdapter?.file !== expectedRuntimeFile) errors.push("Manifest runtime-adapter path is invalid.");
  if (!fs.existsSync(RUNTIME_BANK_PATH) || manifest.runtimeAdapter?.sha256 !== sha256File(RUNTIME_BANK_PATH)) {
    errors.push("Manifest runtime-adapter hash is stale or invalid.");
  }
  const expectedEditorSlotsFile = path.relative(REPOSITORY_ROOT, EDITOR_SLOTS_PATH);
  if (manifest.editorSlots?.file !== expectedEditorSlotsFile || manifest.editorSlots?.slotCount !== 900) {
    errors.push("Manifest editor-slot metadata is invalid.");
  }
  if (!fs.existsSync(EDITOR_SLOTS_PATH) || manifest.editorSlots?.sha256 !== sha256File(EDITOR_SLOTS_PATH)) {
    errors.push("Manifest editor-slot hash is stale or invalid.");
  }
}

function validateLiteracyMappings(bank, context, errors) {
  const filename = path.join(OUTPUT_DIRECTORY, "music-literacy-links.json");
  let file;
  try {
    file = readJson(filename);
  } catch (error) {
    errors.push(`Music Literacy mapping file could not be parsed (${error.message}).`);
    return;
  }
  const expectedConceptIds = new Set(bank.concepts
    .filter((concept) => concept.music_literacy_links?.length)
    .map((concept) => concept.concept_id));
  if (file.sourceKnowledgeBankSha256 !== EXPECTED_SOURCE_HASH) errors.push("Music Literacy mapping file has the wrong source hash.");
  if (!Array.isArray(file.mappings) || file.mappings.length !== expectedConceptIds.size) {
    errors.push(`Music Literacy mapping file should contain ${expectedConceptIds.size} candidate records.`);
    return;
  }
  const seen = new Set();
  file.mappings.forEach((mapping) => {
    const label = mapping.conceptId || "mapping with no conceptId";
    if (seen.has(mapping.conceptId)) errors.push(`${label}: duplicate Music Literacy mapping.`);
    seen.add(mapping.conceptId);
    if (!expectedConceptIds.has(mapping.conceptId)) errors.push(`${label}: does not correspond to a knowledge-bank link candidate.`);
    const targets = Array.isArray(mapping.targets) ? mapping.targets : [];
    const flattened = targets.flatMap((target) => target.localIds || []);
    if (mapping.resolutionStatus === "resolved") {
      if (!targets.length || !mapping.resolutionMethod) errors.push(`${label}: resolved mapping has no reviewed targets or method.`);
    } else if (mapping.resolutionStatus === "unresolved") {
      if (targets.length || flattened.length || mapping.resolutionMethod != null) errors.push(`${label}: unresolved mapping must not claim a target.`);
    } else {
      errors.push(`${label}: invalid mapping resolutionStatus.`);
    }
    const declared = [...new Set(mapping.targetLiteracyIds || [])].sort();
    const qualified = [...new Set(flattened)].sort();
    if (JSON.stringify(declared) !== JSON.stringify(qualified)) errors.push(`${label}: flattened targetLiteracyIds do not match the source-qualified targets.`);
    targets.forEach((target) => (target.localIds || []).forEach((id) => {
      if (target.sourceFile === "millionaire-question-bank.js") {
        if (!context.literacyIds.has(id)) errors.push(`${label}: Music Literacy question target ${id} does not exist.`);
      } else if (!context.localTargetExists(target.sourceFile, id)) {
        errors.push(`${label}: component target ${target.sourceFile}:${id} does not exist.`);
      }
    }));
  });
  const resolvedCount = file.mappings.filter((mapping) => mapping.resolutionStatus === "resolved").length;
  if (expectedConceptIds.size === 120 && resolvedCount !== 37) {
    errors.push(`Music Literacy mapping audit should resolve 37 of 120 candidates, found ${resolvedCount}.`);
  }
}

function updateSummary(errors, warnings, nearDuplicates, questionCount) {
  const summaryPath = path.join(OUTPUT_DIRECTORY, "summary.json");
  if (!fs.existsSync(summaryPath)) return null;
  const summary = readJson(summaryPath);
  summary.validationStatus = errors.length ? "failed" : "passed";
  summary.validatedAt = summary.generatedAt || null;
  summary.validator = {
    errors: errors.length,
    warnings: warnings.length,
    questionsValidated: questionCount,
  };
  summary.nearDuplicateReview = nearDuplicates;
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

function writeReviewReport(summary) {
  if (!summary) return;
  const levelRows = LEVELS.map((level) => {
    const counts = summary.questionsPerLevelAndDifficulty[level];
    return `| ${level} | ${counts.Easy} | ${counts.Medium} | ${counts.Hard} | ${summary.questionsPerLevel[level]} |`;
  });
  const resolvedLinks = summary.musicLiteracyLinks.resolved
    .map((entry) => `${entry.conceptId} (${entry.concept})`).join(", ") || "None";
  const reviewedNearDuplicates = summary.nearDuplicateReview
    .filter((entry) => entry.status === "reviewed-distinct").length;
  const flaggedNearDuplicates = summary.nearDuplicateReview.length - reviewedNearDuplicates;
  const report = [
    "# Music Concept question-bank review",
    "",
    `Validation status: **${summary.validationStatus}**`,
    "",
    `Authoritative source SHA-256: \`${summary.sourceKnowledgeBankSha256}\``,
    "",
    `Total questions: **${summary.totalQuestions}**`,
    "",
    `Permanent editor slots: **${summary.totalEditorSlots}** (${summary.readyEditorSlots} ready; ${summary.draftEditorSlots} incomplete)`,
    "",
    "| Level | Easy | Medium | Hard | Total |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...levelRows,
    "",
    `All 300 concepts have one ready Easy slot and one ready Medium slot. ${summary.conceptsWithIncompleteRequiredSlots.length} concepts are missing one of those required playable slots.`,
    "",
    `Blank teacher-authored Hard slots: ${summary.blankHardSlots.length}. Until these are completed, Millionaire temporarily reuses Medium questions for stages 11–15.`,
    "",
    `Music Literacy links resolved against exact existing IDs: ${resolvedLinks}.`,
    "",
    `Music Literacy links still requiring manual review: ${summary.musicLiteracyLinks.unresolved.length}.`,
    "",
    `Near-duplicate review: ${reviewedNearDuplicates} pairs retained as deliberately distinct; ${flaggedNearDuplicates} pairs still flagged.`,
    "",
    "Editorial safeguards include fixed concept/difficulty slots, source-ID validation, complete reviewed strong-hint coverage, concise pupil-friendly wording, reviewed multiple-meaning contexts, qualification-specific style choices, orchestral-family answer checks and exact runtime-to-source matching.",
    "",
    "Regenerate with `node scripts/music-concepts/generate-question-banks.js` and validate with `node scripts/music-concepts/validate-question-banks.js`.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(OUTPUT_DIRECTORY, "review-report.md"), report);
}

function main() {
  const levels = requestedLevels();
  const errors = [];
  const warnings = [];
  const bank = loadKnowledgeBank();
  try {
    const schema = readJson(path.join(OUTPUT_DIRECTORY, "question-bank.schema.json"));
    if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema" || schema.$defs?.question?.type !== "object") {
      errors.push("Question-bank JSON Schema is missing its Draft 2020-12 question definition.");
    }
  } catch (error) {
    errors.push(`Question-bank JSON Schema could not be parsed (${error.message}).`);
  }
  validateKnowledgeBank(bank, errors);
  const readySlotIds = validateEditorSlots(bank, errors);
  const conceptsById = new Map(bank.concepts.map((concept) => [concept.concept_id, concept]));
  const groupsById = new Map(bank.comparison_groups.map((group) => [group.group_id, group]));
  const namesByLevel = new Map(LEVELS.map((level) => [level,
    new Set(bank.concepts.filter((concept) => concept.level === level)
      .flatMap((concept) => [concept.concept, ...(concept.aliases || []), ...(concept.listed_as || [])])
      .map(normaliseText))]));
  const styleNamesByLevel = new Map(LEVELS.map((level) => [level,
    new Set(bank.concepts.filter((concept) => concept.level === level && concept.primary_element === "Styles")
      .flatMap((concept) => [concept.concept, ...(concept.aliases || []), ...(concept.listed_as || [])])
      .map(normaliseText))]));
  const allStyleNames = new Set([...styleNamesByLevel.values()].flatMap((names) => [...names]));
  const existingBankPath = path.join(REPOSITORY_ROOT, "millionaire-question-bank.js");
  delete require.cache[require.resolve(existingBankPath)];
  const literacyIds = new Set(require(existingBankPath).filter((question) => question.category === "literacy").map((question) => question.id));
  const sourceTextCache = new Map();
  const localTargetExists = (sourceFile, localId) => {
    const resolved = path.resolve(REPOSITORY_ROOT, sourceFile);
    if (!resolved.startsWith(`${REPOSITORY_ROOT}${path.sep}`) || !fs.existsSync(resolved)) return false;
    if (!sourceTextCache.has(resolved)) sourceTextCache.set(resolved, fs.readFileSync(resolved, "utf8"));
    const source = sourceTextCache.get(resolved);
    return [`"${localId}"`, `'${localId}'`, `id="${localId}"`, `id='${localId}'`]
      .some((marker) => source.includes(marker));
  };
  const context = { conceptsById, groupsById, namesByLevel, styleNamesByLevel, allStyleNames, literacyIds, localTargetExists };
  validateLiteracyMappings(bank, context, errors);
  const allQuestions = [];
  const seenIds = new Set();
  const seenStems = new Map();
  const seenDisplayedQuestions = new Map();

  levels.forEach((level) => {
    const filename = path.join(OUTPUT_DIRECTORY, LEVEL_FILENAMES[level]);
    let file;
    try {
      file = readJson(filename);
    } catch (error) {
      errors.push(`${level}: could not parse ${LEVEL_FILENAMES[level]} (${error.message}).`);
      return;
    }
    if (file.schemaVersion !== "1.0" || file.bankType !== "music-concept-questions") errors.push(`${level}: bank metadata is invalid.`);
    if (file.level !== level) errors.push(`${level}: top-level bank level is incorrect.`);
    if (file.source?.knowledgeBankFile !== KNOWLEDGE_BANK_FILENAME || file.source?.knowledgeBankSchemaVersion !== "5.0"
      || file.source?.knowledgeBankSha256 !== EXPECTED_SOURCE_HASH) errors.push(`${level}: source knowledge-bank metadata is invalid.`);
    (file.questions || []).forEach((question) => {
      if (seenIds.has(question.id)) errors.push(`${question.id}: duplicate question ID.`);
      seenIds.add(question.id);
      const stem = `${level}|${normaliseStem(question.question)}`;
      if (seenStems.has(stem)) errors.push(`${question.id}: duplicate question stem also used by ${seenStems.get(stem)}.`);
      seenStems.set(stem, question.id);
      const manual = MANUAL_OVERRIDES.questions[question.id];
      const presentation = manual ? { conceptDescription: manual.conceptDescription, prompt: manual.prompt } : conceptQuestionPresentation(question);
      const displayedKey = [question.level, exactDisplayedText(presentation.conceptDescription), exactDisplayedText(presentation.prompt)].join("|");
      if (seenDisplayedQuestions.has(displayedKey)) errors.push(`${question.id}: exact displayed question also used by ${seenDisplayedQuestions.get(displayedKey)}.`);
      seenDisplayedQuestions.set(displayedKey, question.id);
      validateQuestion(question, level, context, errors);
      allQuestions.push(question);
    });
  });

  const playableIds = new Set(allQuestions.map((question) => question.id));
  readySlotIds.forEach((id) => {
    if (!playableIds.has(id)) errors.push(`${id}: ready editor slot is missing from the playable banks.`);
  });
  playableIds.forEach((id) => {
    if (!readySlotIds.has(id)) errors.push(`${id}: playable question does not correspond to a ready editor slot.`);
  });

  validateStrongHintCoverage(allQuestions, errors);
  validatePositionBalance(allQuestions, levels, errors, warnings);
  const questionsById = new Map(allQuestions.map((question) => [question.id, question]));
  const nearDuplicates = findNearDuplicates(allQuestions.filter((question) => question.answerMode === "concept")).map((match) => {
    const key = [match.firstId, match.secondId].sort().join("|");
    const firstQuestion = questionsById.get(match.firstId);
    const secondQuestion = questionsById.get(match.secondId);
    const sameConceptAcrossDifficulties = firstQuestion?.conceptId === secondQuestion?.conceptId
      && firstQuestion?.difficulty !== secondQuestion?.difficulty;
    const review = REVIEWED_NEAR_DUPLICATES.get(key)
      || (sameConceptAcrossDifficulties
        ? "Reviewed: the same approved clue is deliberately reused at another difficulty with a closer answer set; one game never repeats a concept."
        : null);
    if (!review) warnings.push(`${match.firstId} and ${match.secondId}: stems differ by only one or two words and require editorial review.`);
    return {
      ...match,
      status: review ? "reviewed-distinct" : "flagged-for-editorial-review",
      review: review || null,
    };
  });
  validateRuntimeAdapter(allQuestions, errors);
  validateManifest(allQuestions, errors);
  const summary = updateSummary(errors, warnings, nearDuplicates, allQuestions.length);
  writeReviewReport(summary);

  if (warnings.length) {
    console.warn(`Music Concept question-bank validator warnings (${warnings.length}):`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
  if (errors.length) {
    console.error(`Music Concept question-bank validation failed (${errors.length} errors):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Music Concept question-bank validation passed: ${allQuestions.length} questions across ${levels.length} level${levels.length === 1 ? "" : "s"}.`);
  console.log(`Near-duplicate stem pairs reviewed or flagged: ${nearDuplicates.length}.`);
}

main();
