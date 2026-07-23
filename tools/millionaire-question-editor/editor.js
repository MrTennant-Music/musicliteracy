"use strict";

const state = {
  questions: [],
  selectedId: null,
  preferredDifficulty: "Easy",
  savedSnapshot: "",
  dirty: false,
  filterSnapshot: null,
};
const elements = {
  level: document.querySelector("#level-filter"),
  editStatus: document.querySelector("#edit-status-filter"),
  poolStatus: document.querySelector("#pool-status-filter"),
  concept: document.querySelector("#concept-filter"),
  search: document.querySelector("#search-filter"),
  count: document.querySelector("#question-count"),
  list: document.querySelector("#question-list"),
  empty: document.querySelector("#empty-state"),
  form: document.querySelector("#question-form"),
  heading: document.querySelector("#editor-heading"),
  meta: document.querySelector("#question-meta"),
  id: document.querySelector("#question-id"),
  badge: document.querySelector("#override-badge"),
  editor: document.querySelector(".question-editor"),
  questionDifficulty: document.querySelector("#question-difficulty"),
  description: document.querySelector("#concept-description"),
  prompt: document.querySelector("#prompt"),
  answers: document.querySelector("#answer-fields"),
  hint: document.querySelector("#hint"),
  explanation: document.querySelector("#explanation"),
  useDescriptionAsFeedback: document.querySelector("#use-description-as-feedback"),
  previewDescription: document.querySelector("#preview-description"),
  previewPrompt: document.querySelector("#preview-prompt"),
  previewHint: document.querySelector("#preview-hint"),
  previewAnswers: [...document.querySelectorAll(".preview-answer")],
  message: document.querySelector("#save-message"),
  saveNote: document.querySelector("#save-note"),
  save: document.querySelector("#save-button"),
  clear: document.querySelector("#clear-button"),
  openGame: document.querySelector("#open-game"),
  stop: document.querySelector("#stop-editor"),
};

function currentQuestion() { return state.questions.find((question) => question.id === state.selectedId); }

function conceptCompletionState(questions) {
  if (questions.some((question) => question.completionState === "incomplete")) return "incomplete";
  if (questions.some((question) => question.completionState === "needs-details")) return "needs-details";
  return "complete";
}

function filteredConcepts() {
  const query = elements.search.value.trim().toLocaleLowerCase("en-GB");
  const grouped = new Map();
  state.questions.forEach((question) => {
    if (question.level !== elements.level.value) return;
    if (elements.concept.value && question.conceptId !== elements.concept.value) return;
    if (!grouped.has(question.conceptId)) {
      grouped.set(question.conceptId, {
        conceptId: question.conceptId,
        concept: question.concept,
        questions: [],
      });
    }
    grouped.get(question.conceptId).questions.push(question);
  });
  return [...grouped.values()].filter((group) => {
    const edited = group.questions.some((question) => question.overridden);
    if (elements.editStatus.value === "edited" && !edited) return false;
    if (elements.editStatus.value === "unedited" && edited) return false;
    const allActive = group.questions.every((question) => question.status === "ready");
    if (elements.poolStatus.value === "active" && !allActive) return false;
    if (elements.poolStatus.value === "inactive" && allActive) return false;
    if (!query) return true;
    return group.questions.some((question) =>
      [question.id, question.concept, question.conceptDescription, question.prompt, question.hint, ...(question.answers || [])]
        .some((value) => String(value).toLocaleLowerCase("en-GB").includes(query)));
  }).sort((left, right) => left.concept.localeCompare(right.concept, "en-GB"));
}

function filterValues() {
  return {
    level: elements.level.value,
    editStatus: elements.editStatus.value,
    poolStatus: elements.poolStatus.value,
    concept: elements.concept.value,
  };
}

function populateConceptFilter(preferredConceptId = "") {
  const concepts = [...new Map(state.questions
    .filter((question) => question.level === elements.level.value)
    .map((question) => [question.conceptId, question.concept])).entries()]
    .sort((left, right) => left[1].localeCompare(right[1], "en-GB"));
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All concepts";
  const options = concepts.map(([conceptId, concept]) => {
    const option = document.createElement("option");
    option.value = conceptId;
    option.textContent = concept;
    return option;
  });
  elements.concept.replaceChildren(all, ...options);
  elements.concept.value = concepts.some(([conceptId]) => conceptId === preferredConceptId) ? preferredConceptId : "";
}

function restoreFilters() {
  if (!state.filterSnapshot) return;
  elements.level.value = state.filterSnapshot.level;
  elements.editStatus.value = state.filterSnapshot.editStatus;
  elements.poolStatus.value = state.filterSnapshot.poolStatus;
  populateConceptFilter(state.filterSnapshot.concept);
}

function renderList() {
  const concepts = filteredConcepts();
  const selectedConceptId = currentQuestion()?.conceptId;
  elements.count.textContent = `${concepts.length} concept${concepts.length === 1 ? "" : "s"}`;
  elements.list.replaceChildren(...concepts.map((group) => {
    const selected = group.conceptId === selectedConceptId;
    const edited = group.questions.some((question) => question.overridden);
    const button = document.createElement("button");
    button.type = "button";
    const completionState = conceptCompletionState(group.questions);
    button.className = `question-list-item is-${completionState}${selected ? " is-selected" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", selected ? "true" : "false");
    const heading = document.createElement("span");
    heading.className = "list-heading";
    const concept = document.createElement("span");
    concept.textContent = group.concept;
    if (edited) {
      const editedLabel = document.createElement("span");
      editedLabel.className = "list-edited";
      editedLabel.textContent = "• Edited";
      concept.append(editedLabel);
    }
    const difficultySummary = document.createElement("span");
    difficultySummary.className = "list-difficulty-summary";
    difficultySummary.textContent = "3 slots";
    heading.append(concept, difficultySummary);
    const copy = document.createElement("span");
    copy.className = "list-copy";
    copy.textContent = ["Easy", "Medium", "Hard"].map((difficulty) => {
      const question = group.questions.find((candidate) => candidate.difficulty === difficulty);
      return `${difficulty} ${question?.completionState === "complete" ? "complete" : question?.completionState === "needs-details" ? "needs details" : "inactive"}`;
    }).join(" • ");
    const id = document.createElement("span");
    id.className = "list-id";
    id.textContent = group.conceptId;
    button.append(heading, copy, id);
    button.addEventListener("click", () => selectConcept(group.conceptId));
    return button;
  }));
}

function selectConcept(conceptId) {
  const selected = currentQuestion();
  if (selected?.conceptId === conceptId) return;
  const questions = state.questions.filter((question) => question.conceptId === conceptId);
  const question = questions.find((candidate) => candidate.difficulty === state.preferredDifficulty)
    || questions.find((candidate) => candidate.difficulty === "Easy")
    || questions[0];
  if (question) selectQuestion(question.id);
}

function formValue() {
  const description = elements.description.value;
  return {
    id: state.selectedId,
    difficulty: elements.questionDifficulty.value,
    conceptDescription: description,
    prompt: elements.prompt.value,
    answers: [...elements.answers.querySelectorAll('input[type="text"]')].map((input) => input.value),
    correctAnswer: Number(elements.answers.querySelector('input[type="radio"]:checked')?.value ?? -1),
    hint: elements.hint.value,
    explanation: elements.explanation.value,
    useDescriptionAsFeedback: elements.useDescriptionAsFeedback.checked,
  };
}

function snapshot() { return JSON.stringify(formValue()); }

function resizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function resizeTextareas() {
  elements.form.querySelectorAll("textarea").forEach(resizeTextarea);
}

function updatePreview() {
  if (!state.selectedId) return;
  const value = formValue();
  const hasDescription = Boolean(value.conceptDescription.trim());
  elements.previewDescription.hidden = !hasDescription;
  elements.previewDescription.textContent = hasDescription ? value.conceptDescription : "";
  elements.previewPrompt.textContent = value.prompt || "The question will appear here.";
  elements.previewHint.textContent = value.hint || "The hint will appear here.";
  elements.previewAnswers.forEach((answer, index) => {
    answer.querySelector("span:last-child").textContent = value.answers[index] || `Answer ${index + 1}`;
    answer.classList.toggle("is-correct", value.correctAnswer === index);
  });
}

function updateDirtyState() {
  if (!state.selectedId) return;
  const hasDescription = Boolean(elements.description.value.trim());
  elements.useDescriptionAsFeedback.disabled = !hasDescription;
  if (!hasDescription) elements.useDescriptionAsFeedback.checked = false;
  if (elements.useDescriptionAsFeedback.checked) {
    elements.explanation.value = elements.description.value;
    elements.explanation.readOnly = true;
  } else {
    elements.explanation.readOnly = false;
  }
  updatePreview();
  resizeTextareas();
  state.dirty = snapshot() !== state.savedSnapshot;
  elements.save.disabled = !state.dirty;
  elements.save.textContent = state.dirty ? "Save" : "Saved";
}

function showMessage(text, kind) {
  elements.message.textContent = text;
  elements.message.className = `save-message is-visible is-${kind}`;
}

function clearMessage() {
  elements.message.textContent = "";
  elements.message.className = "save-message";
}

function selectQuestion(id, force = false) {
  if (!force && state.dirty && !window.confirm("Discard the unsaved changes to this question?")) return;
  state.selectedId = id;
  const question = currentQuestion();
  if (!question) return;
  state.preferredDifficulty = question.difficulty;
  elements.empty.hidden = true;
  elements.form.hidden = false;
  elements.heading.textContent = question.concept;
  elements.meta.textContent = question.level;
  elements.id.textContent = `${question.id} • ${question.factId}`;
  elements.badge.hidden = !question.overridden;
  elements.badge.textContent = "Manually edited";
  elements.questionDifficulty.value = question.difficulty;
  elements.description.value = question.conceptDescription;
  elements.prompt.value = question.prompt;
  const answers = Array.from({ length: 4 }, (_, index) => question.answers?.[index] || "");
  elements.answers.replaceChildren(...answers.map((answer, index) => {
    const row = document.createElement("div");
    row.className = "answer-row";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "correct-answer";
    radio.value = String(index);
    radio.checked = index === question.correctAnswer;
    radio.setAttribute("aria-label", `Mark answer ${index + 1} as correct`);
    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = `${String.fromCharCode(65 + index)}:`;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 120;
    input.value = answer;
    input.setAttribute("aria-label", `Answer ${index + 1}`);
    row.append(radio, letter, input);
    return row;
  }));
  elements.hint.value = question.hint;
  elements.explanation.value = question.explanation;
  elements.useDescriptionAsFeedback.checked = question.useDescriptionAsFeedback ?? Boolean(
    question.conceptDescription && question.explanation === question.conceptDescription,
  );
  elements.explanation.readOnly = false;
  elements.saveNote.textContent = "";
  elements.openGame.href = `/game/millionaire.html?level=${encodeURIComponent(question.levelCode)}&editor=${Date.now()}`;
  clearMessage();
  updateDirtyState();
  state.savedSnapshot = snapshot();
  state.dirty = false;
  elements.save.disabled = true;
  elements.save.textContent = "Saved";
  renderList();
}

async function loadQuestions(selectedId = state.selectedId) {
  const response = await fetch("/api/questions", { cache: "no-store" });
  if (!response.ok) throw new Error("The question bank could not be loaded.");
  const data = await response.json();
  state.questions = data.questions;
  populateConceptFilter(elements.concept.value);
  state.filterSnapshot = filterValues();
  renderList();
  if (selectedId && state.questions.some((question) => question.id === selectedId)) selectQuestion(selectedId, true);
}

elements.form.addEventListener("input", updateDirtyState);
elements.form.addEventListener("change", (event) => {
  if (event.target !== elements.questionDifficulty) updateDirtyState();
});
elements.questionDifficulty.addEventListener("change", () => {
  const question = currentQuestion();
  if (!question) return;
  const nextQuestion = state.questions.find((candidate) =>
    candidate.conceptId === question.conceptId
    && candidate.difficulty === elements.questionDifficulty.value);
  if (!nextQuestion) {
    elements.questionDifficulty.value = question.difficulty;
    return;
  }
  if (state.dirty && !window.confirm("Discard the unsaved changes to this question?")) {
    elements.questionDifficulty.value = question.difficulty;
    return;
  }
  selectQuestion(nextQuestion.id, true);
});
elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();
  elements.save.disabled = true;
  elements.save.textContent = "Saving…";
  try {
    const response = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValue()),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The question could not be saved.");
    await loadQuestions(state.selectedId);
    elements.openGame.href = `/game/millionaire.html?level=${encodeURIComponent(currentQuestion().levelCode)}&editor=${Date.now()}`;
  } catch (error) {
    showMessage(error.message, "error");
    elements.save.disabled = false;
    elements.save.textContent = "Save";
  }
});

[elements.level, elements.editStatus, elements.poolStatus, elements.concept].forEach((element) => element.addEventListener("change", () => {
  if (state.dirty && !window.confirm("Discard the unsaved changes to this question?")) {
    restoreFilters();
    return;
  }
  if (element === elements.level) populateConceptFilter();
  state.filterSnapshot = filterValues();
  state.selectedId = null;
  state.dirty = false;
  elements.form.hidden = true;
  elements.empty.hidden = false;
  renderList();
}));
elements.search.addEventListener("input", renderList);
elements.clear.addEventListener("click", () => {
  const question = currentQuestion();
  if (!question) return;
  if (!window.confirm(`Clear all content from this ${question.concept} question? Nothing will change in Millionaire until you save.`)) return;
  clearMessage();
  elements.description.value = "";
  elements.prompt.value = "";
  elements.answers.querySelectorAll('input[type="text"]').forEach((input) => { input.value = ""; });
  elements.answers.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
  elements.hint.value = "";
  elements.explanation.value = "";
  elements.explanation.readOnly = false;
  elements.useDescriptionAsFeedback.checked = false;
  updateDirtyState();
  elements.saveNote.textContent = "";
});
elements.stop.addEventListener("click", async () => {
  if (state.dirty && !window.confirm("Stop the editor and discard your unsaved changes?")) return;
  try { await fetch("/api/shutdown", { method: "POST" }); } finally {
    document.body.innerHTML = '<main class="empty-state"><div><h1>Question Editor stopped</h1><p>You can close this tab.</p></div></main>';
  }
});
window.addEventListener("beforeunload", (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ""; } });
window.addEventListener("resize", resizeTextareas);

loadQuestions().catch((error) => {
  elements.empty.innerHTML = `<h2>Question bank unavailable</h2><p>${error.message}</p>`;
});
