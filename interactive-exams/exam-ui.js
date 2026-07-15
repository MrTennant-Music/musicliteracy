(function (root) {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  let engine;
  let paper;
  let audioPlayer;

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }

  function formatDate(value) {
    try { return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
    catch { return value; }
  }

  function showScreen(name) {
    document.querySelectorAll("[data-screen]").forEach(screen => screen.hidden = screen.dataset.screen !== name);
    document.body.dataset.view = name;
    root.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderIntroduction() {
    const draft = root.ExamStorage.loadDraft(paper.id);
    const attempts = root.ExamStorage.loadAttempts(paper.id);
    const best = root.ExamStorage.bestScore(paper.id);
    $("[data-paper-title]").textContent = paper.title;
    $("[data-paper-summary]").innerHTML = `
      <div><strong>${paper.estimatedMinutes} minutes</strong><span>Estimated duration</span></div>
      <div><strong>${paper.questions.length}</strong><span>Main questions</span></div>
      <div><strong>${paper.totalMarks}</strong><span>Total marks</span></div>
      <div><strong>${best === null ? "—" : `${best}/${paper.totalMarks}`}</strong><span>Previous best</span></div>`;
    $("[data-draft-panel]").hidden = !draft;
    if (draft) {
      $("[data-draft-description]").textContent = `${draft.mode === "exam" ? "Exam" : "Practice"} Mode · saved ${formatDate(draft.savedAt || draft.startedAt)}`;
    }
    $("[data-attempt-count]").textContent = attempts.length ? `${attempts.length} completed ${attempts.length === 1 ? "attempt" : "attempts"} stored on this device.` : "No completed attempts on this device yet.";
  }

  function currentQuestion() { return paper.questions.find(question => question.id === engine.attempt.currentQuestion) || engine.visibleQuestions()[0]; }

  function renderNavigator() {
    if (!engine?.attempt) return;
    const navigator = $("[data-question-navigator]");
    const questions = engine.visibleQuestions();
    navigator.innerHTML = questions.map(question => {
      const state = engine.questionState(question);
      const flagged = engine.attempt.flaggedQuestions.includes(question.id);
      const current = question.id === engine.attempt.currentQuestion;
      return `<button type="button" class="navigator-item is-${state} ${flagged ? "is-flagged" : ""} ${current ? "is-current" : ""}" data-go-question="${question.id}" aria-current="${current ? "step" : "false"}">
        <span class="navigator-number">${question.number}</span><span class="navigator-label">Question ${question.number}</span><span class="navigator-state">${state === "partial" ? "Partially answered" : state[0].toUpperCase() + state.slice(1)}</span>${flagged ? '<span class="navigator-flag" aria-label="Flagged">⚑</span>' : ""}
      </button>`;
    }).join("");
    navigator.querySelectorAll("[data-go-question]").forEach(button => button.addEventListener("click", () => engine.goToQuestion(button.dataset.goQuestion)));
  }

  function optionMarkup(subquestion, value, checkbox = false) {
    const selected = checkbox ? (Array.isArray(value) ? value : []) : value;
    return `<div class="answer-options ${checkbox ? "answer-options-checkbox" : ""}">${subquestion.options.map(item => {
      const checked = checkbox ? selected.includes(item.value) : selected === item.value;
      return `<label class="answer-option ${checked ? "is-selected" : ""}"><input type="${checkbox ? "checkbox" : "radio"}" name="${subquestion.id}" value="${escapeHtml(item.value)}" ${checked ? "checked" : ""} /><span>${escapeHtml(item.label)}</span></label>`;
    }).join("")}</div>${checkbox ? `<p class="answer-hint">Choose ${subquestion.maxSelections} answers.</p>` : ""}`;
  }

  function inputMarkup(subquestion, value) {
    if (subquestion.type === "radio") return optionMarkup(subquestion, value, false);
    if (subquestion.type === "checkbox") return optionMarkup(subquestion, value, true);
    if (subquestion.type === "short-text") return `<label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><input id="${subquestion.id}" class="text-answer" type="text" value="${escapeHtml(value || "")}" autocomplete="off" />`;
    if (subquestion.type === "structured-review") {
      return `<div class="structured-answer">${subquestion.headings.map(heading => `<label><span>${escapeHtml(heading.label)}</span><textarea data-heading="${heading.id}" rows="3">${escapeHtml(value?.[heading.id] || "")}</textarea></label>`).join("")}</div><p class="answer-hint">For full marks, comment under at least three headings.</p>`;
    }
    if (subquestion.type === "notation-choice") return `<div data-notation-container></div>`;
    return "";
  }

  function bindSubquestion(card, subquestion) {
    if (subquestion.type === "radio") {
      card.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener("change", () => {
        card.querySelectorAll(".answer-option").forEach(label => label.classList.toggle("is-selected", label.contains(input) && input.checked));
        engine.setAnswer(subquestion.id, input.value);
      }));
    } else if (subquestion.type === "checkbox") {
      card.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", () => {
        const checked = [...card.querySelectorAll('input[type="checkbox"]:checked')];
        if (checked.length > subquestion.maxSelections) { input.checked = false; return; }
        card.querySelectorAll(".answer-option").forEach(label => label.classList.toggle("is-selected", label.querySelector("input").checked));
        engine.setAnswer(subquestion.id, checked.map(item => item.value));
      }));
    } else if (subquestion.type === "short-text") {
      const input = card.querySelector("input");
      input.addEventListener("input", () => engine.setAnswer(subquestion.id, input.value));
    } else if (subquestion.type === "structured-review") {
      card.querySelectorAll("textarea").forEach(textarea => textarea.addEventListener("input", () => {
        const value = {};
        card.querySelectorAll("textarea").forEach(field => { value[field.dataset.heading] = field.value; });
        engine.setAnswer(subquestion.id, value);
      }));
    } else if (subquestion.type === "notation-choice") {
      root.ExamNotation.render(card.querySelector("[data-notation-container]"), subquestion, engine.attempt.answers[subquestion.id], value => engine.setAnswer(subquestion.id, value));
    }
  }

  function renderQuestion() {
    audioPlayer?.destroy();
    const question = currentQuestion();
    if (!question) return;
    const visible = engine.visibleQuestions();
    const index = visible.findIndex(item => item.id === question.id);
    const flagged = engine.attempt.flaggedQuestions.includes(question.id);
    engine.attempt.currentQuestion = question.id;
    $("[data-mode-label]").textContent = engine.attempt.mode === "exam" ? "Exam Mode" : "Practice Mode";
    $("[data-question-heading]").textContent = `Question ${question.number}`;
    $("[data-question-marks]").textContent = `${question.marks} ${question.marks === 1 ? "mark" : "marks"}`;
    $("[data-question-intro]").textContent = question.intro || "";
    const flagButton = $("[data-flag-question]");
    flagButton.classList.toggle("is-active", flagged);
    flagButton.setAttribute("aria-pressed", String(flagged));
    flagButton.textContent = flagged ? "⚑ Flagged for review" : "⚐ Flag for review";
    const parts = $("[data-subquestions]");
    parts.innerHTML = question.subquestions.map(subquestion => `<section class="subquestion" data-subquestion="${subquestion.id}">
      <div class="subquestion-heading"><span>${escapeHtml(subquestion.label)}</span><span>${subquestion.marks} ${subquestion.marks === 1 ? "mark" : "marks"}</span></div>
      <p class="subquestion-prompt">${escapeHtml(subquestion.prompt)}</p>
      ${inputMarkup(subquestion, engine.attempt.answers[subquestion.id])}
    </section>`).join("");
    question.subquestions.forEach(subquestion => bindSubquestion(parts.querySelector(`[data-subquestion="${subquestion.id}"]`), subquestion));
    audioPlayer = root.ExamAudio.createPlayer($("[data-audio-container]"), {
      clips: question.audio.clips,
      mode: engine.attempt.mode,
      playCounts: engine.attempt.audioPlayCounts,
      onPlayCountChange: counts => engine.setPlayCounts(counts),
    });
    const previous = $("[data-previous-question]");
    const next = $("[data-next-question]");
    previous.disabled = index === 0;
    next.hidden = index === visible.length - 1;
    $("[data-submit-paper]").hidden = index !== visible.length - 1;
    renderNavigator();
    renderTimer();
  }

  function renderTimer() {
    const timer = $("[data-timer]");
    if (!engine?.attempt?.timer.enabled) { timer.hidden = true; return; }
    timer.hidden = false;
    timer.textContent = `Time remaining ${root.ExamAudio.formatTime(engine.attempt.timer.remainingSeconds)}`;
    timer.classList.toggle("is-low", engine.attempt.timer.remainingSeconds <= 300);
  }

  function answerDisplay(value) {
    if (Array.isArray(value)) return value.join(", ");
    if (value && typeof value === "object") return Object.entries(value).filter(([, entry]) => String(entry || "").trim()).map(([key, entry]) => `${key}: ${entry}`).join(" · ");
    return String(value || "Not answered");
  }

  function findSubquestion(id) {
    return paper.questions.flatMap(question => question.subquestions).find(item => item.id === id);
  }

  function renderResults() {
    root.ExamAudio.pauseAll();
    const result = engine.attempt.result;
    const best = root.ExamStorage.bestScore(paper.id);
    $("[data-results-summary]").innerHTML = `
      <div class="result-score"><strong>${result.score}<span>/${paper.totalMarks}</span></strong><p>${result.percentage}% provisional score</p></div>
      <div class="result-stat"><strong>${result.automaticallyMarkableMarks}</strong><span>Automatically markable marks</span></div>
      <div class="result-stat"><strong>${result.reviewMarks}</strong><span>Marks requiring review</span></div>
      <div class="result-stat"><strong>${best}/${paper.totalMarks}</strong><span>Best stored score</span></div>`;
    $("[data-review-notice]").hidden = !result.reviewMarks;
    $("[data-question-breakdown]").innerHTML = result.questionBreakdown.map(question => `<details class="result-question" ${question.reviewRequired ? "open" : ""}>
      <summary><span>Question ${question.number}</span><strong>${question.marks}/${question.maxMarks}${question.reviewRequired ? " + review" : ""}</strong></summary>
      <div class="result-parts">${question.parts.map(part => {
        const subquestion = findSubquestion(part.id);
        const matches = part.suggestedMatches ? Object.entries(part.suggestedMatches).flatMap(([heading, items]) => items.map(item => `${heading}: ${item}`)) : [];
        return `<article class="result-part is-${part.status}">
          <div class="result-part-title"><strong>${escapeHtml(subquestion.label)}</strong><span>${part.reviewRequired ? "Review required" : `${part.marks}/${part.maxMarks}`}</span></div>
          <p><b>Your answer:</b> ${escapeHtml(answerDisplay(part.value))}</p>
          <p><b>Accepted answer:</b> ${escapeHtml(subquestion.answerDisplay || subquestion.answer || (subquestion.answers || []).join(", "))}</p>
          ${matches.length ? `<p><b>Suggested marking-point matches:</b> ${escapeHtml(matches.join("; "))}</p>` : ""}
          <p>${escapeHtml(subquestion.explanation || "")}</p>
          ${subquestion.practiceLinks?.length ? `<div class="practice-links">${subquestion.practiceLinks.map(link => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
        </article>`;
      }).join("")}</div>
    </details>`).join("");
    $("[data-topic-breakdown]").innerHTML = result.topicBreakdown.map(topic => `<div><span>${escapeHtml(topic.topic)}</span><strong>${topic.marks}/${topic.maxMarks}${topic.reviewRequired ? " + review" : ""}</strong></div>`).join("");
    $("[data-retry-incorrect]").hidden = engine.attempt.mode !== "practice" || !result.questionBreakdown.some(question => question.parts.some(part => part.status === "incorrect" || part.status === "unanswered"));
    showScreen("results");
  }

  function onEngineChange(attempt, reason) {
    if (reason === "submit") return renderResults();
    if (reason === "timer") return renderTimer();
    if (reason === "answer" || reason === "audio") {
      renderNavigator();
      const saved = $("[data-save-status]");
      saved.textContent = "Saved";
      root.setTimeout(() => { saved.textContent = "Autosave on"; }, 900);
      return;
    }
    showScreen("exam");
    renderQuestion();
  }

  function start(mode) {
    const timerEnabled = mode === "exam" && $("[data-timer-option]").checked;
    engine.start(mode, timerEnabled);
  }

  function openSubmitModal() { $("[data-submit-overlay]").classList.add("is-open"); }
  function closeSubmitModal() { $("[data-submit-overlay]").classList.remove("is-open"); }

  function bindEvents() {
    $("[data-start-practice]").addEventListener("click", () => start("practice"));
    $("[data-start-exam]").addEventListener("click", () => start("exam"));
    $("[data-continue-draft]").addEventListener("click", () => {
      const draft = root.ExamStorage.loadDraft(paper.id);
      if (draft) engine.resume(draft);
    });
    $("[data-delete-draft]").addEventListener("click", () => {
      root.ExamStorage.deleteDraft(paper.id);
      renderIntroduction();
    });
    $("[data-new-attempt]").addEventListener("click", () => {
      root.ExamStorage.deleteDraft(paper.id);
      renderIntroduction();
    });
    $("[data-flag-question]").addEventListener("click", () => engine.toggleFlag(currentQuestion().id));
    $("[data-previous-question]").addEventListener("click", () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (index > 0) engine.goToQuestion(questions[index - 1].id);
    });
    $("[data-next-question]").addEventListener("click", () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (index < questions.length - 1) engine.goToQuestion(questions[index + 1].id);
    });
    $("[data-submit-paper]").addEventListener("click", openSubmitModal);
    $("[data-cancel-submit]").addEventListener("click", closeSubmitModal);
    $("[data-confirm-submit]").addEventListener("click", () => { closeSubmitModal(); engine.submit(); });
    $("[data-submit-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeSubmitModal(); });
    $("[data-retry-incorrect]").addEventListener("click", () => engine.retryIncorrect());
    $("[data-results-new-attempt]").addEventListener("click", () => { engine.attempt = null; renderIntroduction(); showScreen("intro"); });
    $("[data-continue-review]").addEventListener("click", () => $("[data-question-breakdown]").scrollIntoView({ behavior: "smooth" }));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeSubmitModal(); });
  }

  function initialise() {
    const id = new URLSearchParams(root.location.search).get("paper") || "national5-2014";
    paper = root.InteractiveExamPapers?.[id];
    if (!paper) {
      $("main").innerHTML = '<section class="empty-state"><h1>Paper unavailable</h1><p>This paper is not currently available.</p><a class="button" href="index.html">Choose another paper</a></section>';
      return;
    }
    engine = new root.ExamEngineCore.ExamEngine(paper, onEngineChange);
    renderIntroduction();
    bindEvents();
    const resumeRequested = new URLSearchParams(root.location.search).get("resume") === "1";
    const draft = root.ExamStorage.loadDraft(paper.id);
    if (resumeRequested && draft) engine.resume(draft); else showScreen("intro");
    root.addEventListener("beforeunload", () => { root.ExamAudio.pauseAll(); engine.destroy(); });
  }

  root.ExamUI = { initialise };
  document.addEventListener("DOMContentLoaded", initialise);
})(window);
