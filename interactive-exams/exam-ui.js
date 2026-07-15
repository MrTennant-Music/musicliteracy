(function (root) {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  let engine;
  let paper;
  let audioPlayer;
  let allQuestionAudioPlayers = [];
  let showingAllQuestions = false;

  function destroyAudioPlayers() {
    audioPlayer?.destroy();
    audioPlayer = null;
    allQuestionAudioPlayers.forEach(player => player.destroy());
    allQuestionAudioPlayers = [];
  }

  function showScreen(name) {
    closePaperMenus();
    document.querySelectorAll("[data-screen]").forEach(screen => screen.hidden = screen.dataset.screen !== name);
    document.body.dataset.view = name;
    root.scrollTo({ top: 0, behavior: "smooth" });
  }

  function currentQuestion() { return paper.questions.find(question => question.id === engine.attempt.currentQuestion) || engine.visibleQuestions()[0]; }

  function questionIsComplete(question) { return engine.questionState(question) === "answered"; }

  function lastUnlockedQuestionIndex(questions) {
    const firstIncomplete = questions.findIndex(question => !questionIsComplete(question));
    return firstIncomplete === -1 ? questions.length - 1 : firstIncomplete;
  }

  function canShowAllQuestions() {
    const questions = engine.visibleQuestions();
    return !engine.attempt.questionsLocked || lastUnlockedQuestionIndex(questions) === questions.length - 1;
  }

  function formatTimer(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
  }

  function renderToolbarStats() {
    const remainingSeconds = engine?.attempt?.timer?.remainingSeconds ?? paper.estimatedMinutes * 60;
    const submitted = engine?.attempt?.status === "submitted" && engine.attempt.result;
    const score = submitted ? engine.attempt.result.score : null;
    const timerCard = $("[data-toolbar-duration]").closest(".exam-header-stat");
    const timerEnabled = Boolean(engine?.attempt?.timer?.enabled);
    const marksFill = $("[data-toolbar-marks-fill]");
    $("[data-toolbar-duration]").textContent = formatTimer(remainingSeconds);
    timerCard.hidden = !timerEnabled;
    timerCard.closest(".exam-header-stats").classList.toggle("is-timer-hidden", !timerEnabled);
    timerCard.classList.toggle("is-urgent", timerEnabled && !submitted && remainingSeconds <= 30);
    $("[data-toolbar-marks]").textContent = submitted ? `${score}/${paper.totalMarks}` : String(paper.totalMarks);
    if (!submitted) {
      marksFill.style.height = "0";
      marksFill.style.backgroundColor = "transparent";
      return;
    }
    const fill = Math.max(0, Math.min(100, (score / paper.totalMarks) * 100));
    const colour = score >= 20 ? "rgba(22, 163, 74, .38)" : score >= 15 ? "rgba(250, 204, 21, .42)" : "rgba(220, 38, 38, .38)";
    marksFill.style.height = score === 0 ? "100%" : `${fill}%`;
    marksFill.style.backgroundColor = score === 0 ? "rgba(220, 38, 38, .72)" : colour;
  }

  function renderCustomiseMenu() {
    const timerToggle = $("[data-timer-toggle]");
    if (!timerToggle) return;
    const timerEnabled = Boolean(engine?.attempt?.timer?.enabled);
    timerToggle.setAttribute("aria-pressed", String(timerEnabled));
    timerToggle.disabled = engine?.attempt?.status === "submitted";
    $("[data-timer-toggle-track]").classList.toggle("is-on", timerEnabled);
    const audioLimitToggle = $("[data-audio-limit-toggle]");
    const audioLimitEnabled = Boolean(engine?.attempt?.audioLimitEnabled);
    audioLimitToggle.setAttribute("aria-pressed", String(audioLimitEnabled));
    audioLimitToggle.disabled = engine?.attempt?.status === "submitted";
    $("[data-audio-limit-toggle-track]").classList.toggle("is-on", audioLimitEnabled);
    const questionsLockedToggle = $("[data-questions-locked-toggle]");
    const questionsLocked = Boolean(engine?.attempt?.questionsLocked);
    questionsLockedToggle.setAttribute("aria-pressed", String(questionsLocked));
    questionsLockedToggle.disabled = engine?.attempt?.status === "submitted";
    $("[data-questions-locked-toggle-track]").classList.toggle("is-on", questionsLocked);
  }

  function renderNavigator() {
    if (!engine?.attempt) return;
    const navigator = $("[data-question-navigator]");
    const questions = engine.visibleQuestions();
    const lastUnlocked = lastUnlockedQuestionIndex(questions);
    const current = currentQuestion();
    $("[data-current-question-label]").textContent = showingAllQuestions ? "All Questions" : `Question ${current.number}`;
    navigator.innerHTML = questions.map((question, index) => {
      const state = engine.questionState(question);
      const isCurrent = question.id === engine.attempt.currentQuestion;
      const locked = Boolean(engine.attempt.questionsLocked) && index > lastUnlocked;
      const stateLabel = state === "partial" ? "Partially answered" : state === "answered" ? "Answered" : "Unanswered";
      const subtitle = state === "answered" || state === "partial" ? `<span class="navigator-status">${stateLabel}</span>` : "";
      return `<button type="button" class="navigator-item is-${state} ${isCurrent ? "is-current" : ""} ${locked ? "is-locked" : ""}" data-go-question="${question.id}" aria-label="Question ${question.number}, ${stateLabel}${locked ? ", locked" : ""}" aria-current="${isCurrent ? "step" : "false"}" ${locked ? "disabled aria-disabled=\"true\"" : ""}>
        <span class="navigator-question-glyph" aria-hidden="true">${question.number}</span>
        <span class="navigator-copy"><span class="navigator-label">Question ${question.number}</span>${subtitle}</span>
        <span class="navigator-marks">${question.marks} ${question.marks === 1 ? "mark" : "marks"}</span>
      </button>`;
    }).join("");
    navigator.querySelectorAll("[data-go-question]").forEach(button => button.addEventListener("click", () => {
      showingAllQuestions = false;
      closePaperMenus();
      engine.goToQuestion(button.dataset.goQuestion);
    }));
    const showAllButton = $("[data-show-all-questions]");
    showAllButton.disabled = !canShowAllQuestions();
    showAllButton.setAttribute("aria-disabled", String(showAllButton.disabled));
  }

  function updateQuestionActions() {
    const questions = engine.visibleQuestions();
    const question = currentQuestion();
    const index = questions.findIndex(item => item.id === question.id);
    const complete = questionIsComplete(question);
    const next = $("[data-next-question]");
    const submit = $("[data-submit-paper]");
    if (index < questions.length - 1) next.disabled = Boolean(engine.attempt.questionsLocked) && !complete;
    if (index === questions.length - 1) submit.disabled = !complete;
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

  function answerHasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.values(value).some(item => String(item || "").trim());
    return Boolean(String(value || "").trim());
  }

  function hasDedicatedClearControl(subquestion) {
    return subquestion.type === "notation-choice" && subquestion.notationTool === "note-entry";
  }

  function isClearableSubquestion(subquestion) {
    return ["short-text", "structured-review", "notation-choice"].includes(subquestion.type) && !hasDedicatedClearControl(subquestion);
  }

  function clearButtonMarkup(subquestion, value) {
    if (!isClearableSubquestion(subquestion)) return "";
    return `<div class="subquestion-clear-row"><button type="button" class="button button-secondary button-small" data-clear-subquestion ${answerHasValue(value) ? "" : "disabled"}>Clear</button></div>`;
  }

  function subquestionsMarkup(question) {
    return question.subquestions.map(subquestion => `<section class="subquestion" data-subquestion="${subquestion.id}">
      <div class="subquestion-heading"><span>${escapeHtml(subquestion.label)}</span><span>${subquestion.marks} ${subquestion.marks === 1 ? "mark" : "marks"}</span></div>
      <p class="subquestion-prompt">${escapeHtml(subquestion.prompt)}</p>
      ${inputMarkup(subquestion, engine.attempt.answers[subquestion.id])}
      ${clearButtonMarkup(subquestion, engine.attempt.answers[subquestion.id])}
    </section>`).join("");
  }

  function sharedNotationMarkup(question) {
    return question.score?.sharedNotation ? `<div class="shared-notation-panel" data-shared-notation="${escapeHtml(question.score.sharedNotation)}"></div>` : "";
  }

  function renderSharedNotation(card, question) {
    const container = card.querySelector("[data-shared-notation]");
    if (!container || !root.ExamNotation?.renderSharedScore) return;
    root.ExamNotation.renderSharedScore(container, question, engine.attempt.answers, (subquestionId, value) => {
      engine.setAnswer(subquestionId, value);
      renderSharedNotation(card, question);
    });
  }

  function bindSubquestion(card, subquestion) {
    const clearButton = card.querySelector("[data-clear-subquestion]");
    const updateClearButton = value => { if (clearButton) clearButton.disabled = !answerHasValue(value); };
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
      input.addEventListener("input", () => {
        engine.setAnswer(subquestion.id, input.value);
        updateClearButton(input.value);
      });
    } else if (subquestion.type === "structured-review") {
      card.querySelectorAll("textarea").forEach(textarea => textarea.addEventListener("input", () => {
        const value = {};
        card.querySelectorAll("textarea").forEach(field => { value[field.dataset.heading] = field.value; });
        engine.setAnswer(subquestion.id, value);
        updateClearButton(value);
      }));
    } else if (subquestion.type === "notation-choice") {
      const notationContainer = card.querySelector("[data-notation-container]");
      const renderNotationControl = value => root.ExamNotation.render(notationContainer, subquestion, value, nextValue => {
        engine.setAnswer(subquestion.id, nextValue);
        updateClearButton(nextValue);
        const questionCard = card.closest(".question-card");
        const question = paper.questions.find(item => item.subquestions.some(part => part.id === subquestion.id));
        if (questionCard && question) renderSharedNotation(questionCard, question);
      });
      renderNotationControl(engine.attempt.answers[subquestion.id]);
    }

    clearButton?.addEventListener("click", () => {
      const emptyValue = subquestion.type === "structured-review" ? {} : "";
      engine.setAnswer(subquestion.id, emptyValue);
      if (subquestion.type === "short-text") card.querySelector("input").value = "";
      if (subquestion.type === "structured-review") card.querySelectorAll("textarea").forEach(field => { field.value = ""; });
      if (subquestion.type === "notation-choice") {
        root.ExamNotation.render(card.querySelector("[data-notation-container]"), subquestion, "", value => {
          engine.setAnswer(subquestion.id, value);
          updateClearButton(value);
          const questionCard = card.closest(".question-card");
          const question = paper.questions.find(item => item.subquestions.some(part => part.id === subquestion.id));
          if (questionCard && question) renderSharedNotation(questionCard, question);
        });
        const questionCard = card.closest(".question-card");
        const question = paper.questions.find(item => item.subquestions.some(part => part.id === subquestion.id));
        if (questionCard && question) renderSharedNotation(questionCard, question);
      }
      updateClearButton(emptyValue);
    });
  }

  function renderQuestion() {
    destroyAudioPlayers();
    showingAllQuestions = false;
    $("[data-single-question-area]").hidden = false;
    $("[data-all-questions-area]").hidden = true;
    $("[data-all-questions-area]").innerHTML = "";
    let question = currentQuestion();
    if (!question) return;
    const visible = engine.visibleQuestions();
    let index = visible.findIndex(item => item.id === question.id);
    const lastUnlocked = lastUnlockedQuestionIndex(visible);
    if (engine.attempt.questionsLocked && index > lastUnlocked) {
      engine.goToQuestion(visible[lastUnlocked].id);
      return;
    }
    engine.attempt.currentQuestion = question.id;
    $("[data-question-heading]").textContent = `Question ${question.number}`;
    $("[data-question-marks]").textContent = `${question.marks} ${question.marks === 1 ? "mark" : "marks"}`;
    $("[data-question-intro]").textContent = question.intro || "";
    const parts = $("[data-subquestions]");
    parts.innerHTML = `${sharedNotationMarkup(question)}${subquestionsMarkup(question)}`;
    renderSharedNotation(parts.closest(".question-card"), question);
    question.subquestions.forEach(subquestion => bindSubquestion(parts.querySelector(`[data-subquestion="${subquestion.id}"]`), subquestion));
    audioPlayer = root.ExamAudio.createPlayer($("[data-audio-container]"), {
      clips: question.audio.clips,
      mode: engine.attempt.mode,
      limitPlayback: Boolean(engine.attempt.audioLimitEnabled),
      playConsumed: Boolean(engine.attempt.audioLimitEnabled && engine.attempt.audioPlayCounts?.[question.id]),
      onConsumed: () => engine.setPlayCounts({ ...engine.attempt.audioPlayCounts, [question.id]: 1 }),
    });
    const previous = $("[data-previous-question]");
    const next = $("[data-next-question]");
    previous.hidden = index === 0;
    if (index > 0) $("[data-previous-label]").textContent = `Question ${visible[index - 1].number}`;
    next.hidden = index === visible.length - 1;
    if (index < visible.length - 1) $("[data-next-label]").textContent = `Question ${visible[index + 1].number}`;
    $("[data-submit-paper]").hidden = index !== visible.length - 1;
    renderNavigator();
    updateQuestionActions();
  }

  function renderAllQuestions() {
    if (!canShowAllQuestions()) return;
    destroyAudioPlayers();
    showingAllQuestions = true;
    const singleArea = $("[data-single-question-area]");
    const allArea = $("[data-all-questions-area]");
    singleArea.hidden = true;
    allArea.hidden = false;
    allArea.innerHTML = engine.visibleQuestions().map(question => `<article class="question-card all-question-card" data-all-question="${question.id}">
      <div data-all-question-audio></div>
      <header class="question-header"><div><span class="eyebrow">${question.marks} ${question.marks === 1 ? "mark" : "marks"}</span><h2>Question ${question.number}</h2></div></header>
      <p class="question-intro">${escapeHtml(question.intro || "")}</p>
      <div class="subquestions">${sharedNotationMarkup(question)}${subquestionsMarkup(question)}</div>
    </article>`).join("");
    engine.visibleQuestions().forEach(question => {
      const card = allArea.querySelector(`[data-all-question="${question.id}"]`);
      renderSharedNotation(card, question);
      question.subquestions.forEach(subquestion => bindSubquestion(card.querySelector(`[data-subquestion="${subquestion.id}"]`), subquestion));
      allQuestionAudioPlayers.push(root.ExamAudio.createPlayer(card.querySelector("[data-all-question-audio]"), {
        clips: question.audio.clips,
        mode: engine.attempt.mode,
        limitPlayback: Boolean(engine.attempt.audioLimitEnabled),
        playConsumed: Boolean(engine.attempt.audioLimitEnabled && engine.attempt.audioPlayCounts?.[question.id]),
        onConsumed: () => engine.setPlayCounts({ ...engine.attempt.audioPlayCounts, [question.id]: 1 }),
      }));
    });
    renderNavigator();
    closePaperMenus();
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
    renderToolbarStats();
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
          ${subquestion.practiceLinks?.length ? `<div class="related-links">${subquestion.practiceLinks.map(link => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join("")}</div>` : ""}
        </article>`;
      }).join("")}</div>
    </details>`).join("");
    $("[data-topic-breakdown]").innerHTML = result.topicBreakdown.map(topic => `<div><span>${escapeHtml(topic.topic)}</span><strong>${topic.marks}/${topic.maxMarks}${topic.reviewRequired ? " + review" : ""}</strong></div>`).join("");
    showScreen("results");
  }

  function onEngineChange(attempt, reason) {
    if (reason === "submit") return renderResults();
    if (reason === "timer") {
      renderToolbarStats();
      return;
    }
    if (reason === "timer-setting") {
      renderToolbarStats();
      renderCustomiseMenu();
      return;
    }
    if (reason === "audio-limit") {
      renderCustomiseMenu();
      if (showingAllQuestions) renderAllQuestions();
      else renderQuestion();
      return;
    }
    if (reason === "questions-locked") {
      renderCustomiseMenu();
      if (showingAllQuestions && canShowAllQuestions()) renderAllQuestions();
      else renderQuestion();
      return;
    }
    if (reason === "answer") {
      renderNavigator();
      updateQuestionActions();
      return;
    }
    if (reason === "audio") {
      renderNavigator();
      return;
    }
    renderToolbarStats();
    showScreen("exam");
    renderQuestion();
  }

  function startExam() { engine.start("exam", false); }

  function openSubmitModal() {
    if (!questionIsComplete(currentQuestion())) return;
    $("[data-submit-overlay]").classList.add("is-open");
  }
  function closeSubmitModal() { $("[data-submit-overlay]").classList.remove("is-open"); }
  function openResetModal() { closePaperMenus(); $("[data-reset-overlay]").classList.add("is-open"); }
  function closeResetModal() { $("[data-reset-overlay]").classList.remove("is-open"); }

  function closePaperMenus() {
    document.querySelectorAll("[data-exam-menu]").forEach(menu => { menu.hidden = true; });
    document.querySelectorAll("[data-exam-menu-trigger]").forEach(trigger => trigger.setAttribute("aria-expanded", "false"));
  }

  function bindPaperMenus() {
    document.querySelectorAll("[data-exam-menu-trigger]").forEach(trigger => trigger.addEventListener("click", event => {
      event.stopPropagation();
      const menu = document.querySelector(`[data-exam-menu="${trigger.dataset.examMenuTrigger}"]`);
      const shouldOpen = menu.hidden;
      closePaperMenus();
      menu.hidden = !shouldOpen;
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    }));
    document.querySelectorAll("[data-exam-menu] button[data-selection-label]:not(:disabled)").forEach(option => option.addEventListener("click", () => {
      const menu = option.closest("[data-exam-menu]");
      const label = document.querySelector(`[data-exam-menu-trigger="${menu.dataset.examMenu}"] [data-exam-selection-label]`);
      if (label && option.dataset.selectionLabel) label.textContent = option.dataset.selectionLabel;
      closePaperMenus();
    }));
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-exam-menu-anchor]")) closePaperMenus();
    });
  }

  function bindEvents() {
    bindPaperMenus();
    $("[data-previous-question]").addEventListener("click", () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (index > 0) engine.goToQuestion(questions[index - 1].id);
    });
    $("[data-next-question]").addEventListener("click", () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (index < questions.length - 1 && (!engine.attempt.questionsLocked || questionIsComplete(questions[index]))) engine.goToQuestion(questions[index + 1].id);
    });
    $("[data-submit-paper]").addEventListener("click", openSubmitModal);
    $("[data-cancel-submit]").addEventListener("click", closeSubmitModal);
    $("[data-confirm-submit]").addEventListener("click", () => { closeSubmitModal(); engine.submit(); });
    $("[data-submit-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeSubmitModal(); });
    $("[data-timer-toggle]").addEventListener("click", () => engine.setTimerEnabled(!engine.attempt.timer.enabled));
    $("[data-audio-limit-toggle]").addEventListener("click", () => engine.setAudioLimitEnabled(!engine.attempt.audioLimitEnabled));
    $("[data-questions-locked-toggle]").addEventListener("click", () => engine.setQuestionsLocked(!engine.attempt.questionsLocked));
    $("[data-show-all-questions]").addEventListener("click", () => {
      if (canShowAllQuestions()) renderAllQuestions();
    });
    $("[data-reset-paper]").addEventListener("click", openResetModal);
    $("[data-cancel-reset]").addEventListener("click", closeResetModal);
    $("[data-confirm-reset]").addEventListener("click", () => {
      closeResetModal();
      root.ExamStorage.deleteDraft(paper.id);
      startExam();
    });
    $("[data-reset-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeResetModal(); });
    $("[data-results-new-attempt]").addEventListener("click", () => {
      root.ExamStorage.deleteDraft(paper.id);
      startExam();
    });
    $("[data-continue-review]").addEventListener("click", () => $("[data-question-breakdown]").scrollIntoView({ behavior: "smooth" }));
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      closeSubmitModal();
      closeResetModal();
      closePaperMenus();
    });
  }

  function initialise() {
    const id = new URLSearchParams(root.location.search).get("paper") || "national5-2014";
    paper = root.InteractiveExamPapers?.[id];
    if (!paper) {
      $("main").innerHTML = '<section class="empty-state"><h1>Paper unavailable</h1><p>This paper is not currently available.</p><a class="button" href="index.html">Choose another paper</a></section>';
      return;
    }
    engine = new root.ExamEngineCore.ExamEngine(paper, onEngineChange);
    renderToolbarStats();
    bindEvents();
    const draft = root.ExamStorage.loadDraft(paper.id);
    if (draft?.mode === "exam") {
      const usesCurrentDefaults = draft.customiseDefaultsVersion === 1;
      const timerWasEnabled = usesCurrentDefaults && draft.timer?.enabled === true;
      draft.timer = {
        ...draft.timer,
        enabled: timerWasEnabled,
        remainingSeconds: timerWasEnabled && Number.isFinite(draft.timer?.remainingSeconds) ? draft.timer.remainingSeconds : paper.estimatedMinutes * 60,
        lastUpdatedAt: timerWasEnabled ? draft.timer.lastUpdatedAt : new Date().toISOString(),
      };
      draft.audioLimitEnabled = usesCurrentDefaults && Boolean(draft.audioLimitEnabled);
      draft.questionsLocked = Boolean(draft.questionsLocked);
      draft.customiseDefaultsVersion = 1;
      draft.audioPlayCounts = { ...(draft.audioPlayCounts || {}) };
      delete draft.audioPlayCounts[draft.currentQuestion];
      root.ExamStorage.saveDraft(paper.id, draft);
      engine.resume(draft);
    } else {
      if (draft) root.ExamStorage.deleteDraft(paper.id);
      startExam();
    }
    renderCustomiseMenu();
    root.addEventListener("beforeunload", () => { root.ExamAudio.pauseAll(); engine.destroy(); });
  }

  root.ExamUI = { initialise };
  document.addEventListener("DOMContentLoaded", initialise);
})(window);
