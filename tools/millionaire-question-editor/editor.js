"use strict";

const state = { questions: [], selectedId: null, savedSnapshot: "", dirty: false, filterSnapshot: null };
const elements = {
  level: document.querySelector("#level-filter"),
  difficulty: document.querySelector("#difficulty-filter"),
  editStatus: document.querySelector("#edit-status-filter"),
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

function filteredQuestions() {
  const query = elements.search.value.trim().toLocaleLowerCase("en-GB");
  return state.questions.filter((question) => {
    if (question.level !== elements.level.value) return false;
    if (elements.difficulty.value && question.difficulty !== elements.difficulty.value) return false;
    if (elements.editStatus.value === "edited" && !question.overridden) return false;
    if (elements.editStatus.value === "unedited" && question.overridden) return false;
    if (elements.concept.value && question.conceptId !== elements.concept.value) return false;
    if (!query) return true;
    return [question.id, question.concept, question.conceptDescription, question.prompt, question.hint, ...(question.answers || [])]
      .some((value) => String(value).toLocaleLowerCase("en-GB").includes(query));
  });
}

function filterValues() {
  return {
    level: elements.level.value,
    difficulty: elements.difficulty.value,
    editStatus: elements.editStatus.value,
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
  elements.difficulty.value = state.filterSnapshot.difficulty;
  elements.editStatus.value = state.filterSnapshot.editStatus;
  populateConceptFilter(state.filterSnapshot.concept);
}

function renderList() {
  const questions = filteredQuestions();
  elements.count.textContent = `${questions.length} question${questions.length === 1 ? "" : "s"}`;
  elements.list.replaceChildren(...questions.map((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `question-list-item${question.id === state.selectedId ? " is-selected" : ""}`;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", question.id === state.selectedId ? "true" : "false");
    const heading = document.createElement("span");
    heading.className = "list-heading";
    const concept = document.createElement("span");
    concept.textContent = question.concept;
    if (question.overridden) {
      const edited = document.createElement("span");
      edited.className = "list-edited";
      edited.textContent = "• Edited";
      concept.append(edited);
    }
    const difficulty = document.createElement("span");
    difficulty.className = "list-difficulty";
    difficulty.textContent = question.difficulty;
    heading.append(concept, difficulty);
    const copy = document.createElement("span");
    copy.className = "list-copy";
    copy.textContent = question.conceptDescription || question.prompt || "Blank question — not in game";
    const id = document.createElement("span");
    id.className = "list-id";
    id.textContent = question.id;
    button.append(heading, copy, id);
    button.addEventListener("click", () => selectQuestion(question.id));
    return button;
  }));
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
    explanation: description.trim() ? description : elements.explanation.value,
  };
}

function snapshot() { return JSON.stringify(formValue()); }

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
  if (elements.description.value.trim()) {
    elements.explanation.value = elements.description.value;
    elements.explanation.readOnly = true;
  } else {
    elements.explanation.readOnly = false;
  }
  updatePreview();
  state.dirty = snapshot() !== state.savedSnapshot;
  elements.save.disabled = !state.dirty;
  elements.save.textContent = state.dirty ? "Save Question" : "Saved";
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
  elements.empty.hidden = true;
  elements.form.hidden = false;
  elements.heading.textContent = question.concept;
  elements.meta.textContent = `${question.level} • ${question.difficulty} • ${question.category}`;
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
  elements.explanation.value = question.conceptDescription || question.explanation;
  elements.explanation.readOnly = Boolean(question.conceptDescription);
  elements.saveNote.textContent = question.status === "ready"
    ? "Saving regenerates and checks the question bank automatically."
    : "This slot is incomplete and is not currently included in Millionaire.";
  elements.openGame.href = `/game/millionaire.html?level=${encodeURIComponent(question.levelCode)}&editor=${Date.now()}`;
  clearMessage();
  state.savedSnapshot = snapshot();
  state.dirty = false;
  elements.save.disabled = true;
  elements.save.textContent = "Saved";
  updatePreview();
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
elements.form.addEventListener("change", updateDirtyState);
elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();
  elements.save.disabled = true;
  elements.save.textContent = "Saving and checking…";
  try {
    const response = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValue()),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The question could not be saved.");
    await loadQuestions(state.selectedId);
    showMessage(result.message, "success");
    elements.openGame.href = `/game/millionaire.html?level=${encodeURIComponent(currentQuestion().levelCode)}&editor=${Date.now()}`;
  } catch (error) {
    showMessage(error.message, "error");
    elements.save.disabled = false;
    elements.save.textContent = "Save Question";
  }
});

[elements.level, elements.difficulty, elements.editStatus, elements.concept].forEach((element) => element.addEventListener("change", () => {
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
  updateDirtyState();
  elements.saveNote.textContent = "The fields are clear. Select Save Question to keep this slot blank and remove it from Millionaire.";
});
elements.stop.addEventListener("click", async () => {
  if (state.dirty && !window.confirm("Stop the editor and discard your unsaved changes?")) return;
  try { await fetch("/api/shutdown", { method: "POST" }); } finally {
    document.body.innerHTML = '<main class="empty-state"><div><h1>Question Editor stopped</h1><p>You can close this tab.</p></div></main>';
  }
});
window.addEventListener("beforeunload", (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ""; } });

loadQuestions().catch((error) => {
  elements.empty.innerHTML = `<h2>Question bank unavailable</h2><p>${error.message}</p>`;
});
