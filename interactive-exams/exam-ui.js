(function (root) {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const USER_ANSWER_GLIMMER_DURATION = 8000;

  function syncUserAnswerGlimmer(target) {
    const elapsed = root.performance?.now?.() ?? Date.now();
    target.style.setProperty("--user-answer-glimmer-delay", `${-(elapsed % USER_ANSWER_GLIMMER_DURATION)}ms`);
  }

  function bindRemovalGesture(target, remove) {
    let lastTouchEnd = 0;
    let lastRemoval = 0;
    const removeOnce = event => {
      const now = Date.now();
      if (now - lastRemoval < 250) return;
      lastRemoval = now;
      event?.preventDefault();
      remove();
    };
    target.addEventListener("dblclick", removeOnce);
    target.addEventListener("contextmenu", removeOnce);
    target.addEventListener("touchend", event => {
      const now = Date.now();
      if (now - lastTouchEnd <= 350) {
        lastTouchEnd = 0;
        removeOnce(event);
        return;
      }
      lastTouchEnd = now;
    }, { passive: false });
    target.addEventListener("keydown", event => {
      if (event.shiftKey && event.key === "Delete") removeOnce(event);
    });
  }

  function capitaliseInitialText(value) {
    return String(value || "").replace(/^(\s*)(\p{Ll})/u, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`);
  }

  function capitaliseInitialAnswer(field) {
    const nextValue = capitaliseInitialText(field.value);
    if (nextValue === field.value) return;
    const selectionStart = field.selectionStart;
    const selectionEnd = field.selectionEnd;
    field.value = nextValue;
    if (selectionStart !== null && selectionEnd !== null) field.setSelectionRange(selectionStart, selectionEnd);
  }

  function hasAnswerContent(value) {
    if (Array.isArray(value)) return value.some(hasAnswerContent);
    if (value && typeof value === "object") return Object.values(value).some(hasAnswerContent);
    return Boolean(String(value ?? "").trim());
  }

  function paperTextMarkup(text, boldPhrases = []) {
    const source = String(text ?? "");
    const phrases = [...new Set(boldPhrases.filter(Boolean))].sort((a, b) => b.length - a.length);
    if (!phrases.length) return escapeHtml(source);
    const phraseSet = new Set(phrases);
    const pattern = new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "g");
    return source.split(pattern).map(part => phraseSet.has(part) ? `<strong class="paper-emphasis">${escapeHtml(part)}</strong>` : escapeHtml(part)).join("");
  }
  let engine;
  let paper;
  let audioPlayer;
  let allQuestionAudioPlayers = [];
  let showingAllQuestions = false;
  let selectedStartMode = null;
  let modePickerForExistingAttempt = false;
  let modePickerHasProgress = false;
  let pendingModeChange = null;
  let returnToModePickerAfterCancel = false;
  let pendingQuestionCheck = null;

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
    if (engine.attempt.mode === "exam") return true;
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
    const timerCard = $("[data-toolbar-duration]").closest(".exam-header-stat");
    const headerStats = timerCard.closest(".exam-header-stats");
    const timerEnabled = Boolean(engine?.attempt?.timer?.enabled);
    const timerVisible = timerEnabled && !submitted;
    $("[data-toolbar-duration]").textContent = formatTimer(remainingSeconds);
    timerCard.hidden = !timerVisible;
    headerStats.classList.toggle("is-timer-hidden", !timerVisible);
    timerCard.classList.toggle("is-urgent", timerVisible && remainingSeconds <= 30);
  }

  function renderCustomiseMenu() {
    const options = document.querySelectorAll("[data-mode-option]");
    if (options.length && engine?.attempt) {
      options.forEach(option => {
        const active = option.dataset.modeOption === engine.attempt.mode;
        option.classList.toggle("is-active", active);
        option.setAttribute("aria-pressed", String(active));
      });
      const icon = $("[data-mode-toolbar-icon]");
      if (icon) icon.src = engine.attempt.mode === "exam" ? "../worksheet.svg" : "../practicemode.svg";
      const label = $("[data-mode-toolbar-label]");
      if (label) label.textContent = engine.attempt.mode === "exam" ? "Exam Mode" : "Practice Mode";
    }
  }

  function renderNavigator() {
    if (!engine?.attempt) return;
    const navigator = $("[data-question-navigator]");
    const questions = engine.visibleQuestions();
    const reviewingResults = engine.attempt.status === "submitted";
    const lastUnlocked = lastUnlockedQuestionIndex(questions);
    const current = currentQuestion();
    $("[data-current-question-label]").textContent = showingAllQuestions ? "All Questions" : `Question ${current.number}`;
    navigator.innerHTML = questions.map((question, index) => {
      const state = engine.questionState(question);
      const isCurrent = !showingAllQuestions && question.id === engine.attempt.currentQuestion;
      const locked = reviewingResults ? false : engine.attempt.mode === "exam" ? index > (engine.attempt.examUnlockedQuestionIndex ?? -1) : Boolean(engine.attempt.questionsLocked) && index > lastUnlocked;
      const stateLabel = state === "partial" ? "Partially answered" : state === "answered" ? "Answered" : "Not attempted";
      const subtitle = `<span class="navigator-status">${stateLabel}</span>`;
      return `<button type="button" class="navigator-item is-${state} ${isCurrent ? "is-current" : ""} ${locked ? "is-locked" : ""}" data-go-question="${question.id}" aria-label="Question ${question.number}, ${stateLabel}${locked ? ", locked" : ""}" aria-current="${isCurrent ? "step" : "false"}" ${locked ? "disabled aria-disabled=\"true\"" : ""}>
        <span class="navigator-question-glyph" aria-hidden="true">${question.number}</span>
        <span class="navigator-copy"><span class="navigator-label">Question ${question.number}</span>${subtitle}</span>
        <span class="navigator-marks">${question.marks} ${question.marks === 1 ? "mark" : "marks"}</span>
      </button>`;
    }).join("");
    navigator.querySelectorAll("[data-go-question]").forEach(button => button.addEventListener("click", () => {
      if (reviewingResults) {
        showResultQuestion(button.dataset.goQuestion);
        return;
      }
      if (engine.attempt.mode === "exam") {
        closePaperMenus();
        document.querySelector(`[data-all-question="${button.dataset.goQuestion}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      showingAllQuestions = false;
      closePaperMenus();
      engine.goToQuestion(button.dataset.goQuestion);
    }));
    const showAllButton = $("[data-show-all-questions]");
    showAllButton.disabled = reviewingResults ? showingAllQuestions : !canShowAllQuestions() || engine.attempt.mode === "exam";
    showAllButton.setAttribute("aria-disabled", String(showAllButton.disabled));
  }

  function updateQuestionActions() {
    const questions = engine.visibleQuestions();
    const question = currentQuestion();
    const index = questions.findIndex(item => item.id === question.id);
    const complete = questionIsComplete(question);
    const next = $("[data-next-question]");
    const bottomNext = $("[data-bottom-next-question]");
    const submits = [...document.querySelectorAll("[data-submit-paper]")];
    const checkAnswers = $("[data-check-question]");
    const checked = engine.isQuestionChecked(question.id);
    const nextDisabled = Boolean(engine.attempt.questionsLocked) && !complete;
    next.disabled = nextDisabled;
    bottomNext.disabled = nextDisabled;
    submits.forEach(submit => { submit.disabled = false; });
    checkAnswers.hidden = engine.attempt.mode !== "practice" || checked;
    checkAnswers.disabled = !complete;
    checkAnswers.setAttribute("aria-disabled", String(checkAnswers.disabled));
    checkAnswers.title = complete ? "Mark and lock this question" : "Complete every part of this question first";
  }

  function optionMarkup(subquestion, value, checkbox = false) {
    const selected = checkbox ? (Array.isArray(value) ? value : []) : value;
    const limitId = `${subquestion.id}-selection-limit`;
    const removalId = `${subquestion.id}-removal-help`;
    const options = `<div class="answer-options ${checkbox ? "answer-options-checkbox" : ""}">${subquestion.options.map(item => {
      const checked = checkbox ? selected.includes(item.value) : selected === item.value;
      const optionText = item.stackedFraction
        ? `<span class="answer-option-copy answer-option-fraction"><span>${escapeHtml(item.stackedFraction[0])}</span><span>${escapeHtml(item.stackedFraction[1])}</span></span>`
        : item.secondaryLabel
        ? `<span class="answer-option-copy chord-option-copy">${String(item.label).split(/\s+/).map(cell => `<span>${escapeHtml(cell)}</span>`).join("")}${String(item.secondaryLabel).split(/\s+/).map(cell => `<span>${escapeHtml(cell)}</span>`).join("")}</span>`
        : `<span class="answer-option-copy">${escapeHtml(item.label)}</span>`;
      const accessibleOptionLabel = item.secondaryLabel ? `${item.label}, ${item.secondaryLabel}` : item.label;
      return `<label class="answer-option ${checked ? "is-selected" : ""}"><input type="${checkbox ? "checkbox" : "radio"}" name="${subquestion.id}" value="${escapeHtml(item.value)}" aria-label="${escapeHtml(accessibleOptionLabel)}" aria-keyshortcuts="Shift+Delete" ${checked ? "checked" : ""} />${optionText}</label>`;
    }).join("")}</div>`;
    const describedBy = checkbox ? `${limitId} ${removalId}` : removalId;
    return `<fieldset class="answer-fieldset" aria-describedby="${describedBy}"><legend class="visually-hidden">${escapeHtml(subquestion.prompt)}</legend>${options}</fieldset><span class="visually-hidden" id="${removalId}">Double-click, double-tap or right-click a selected answer to remove it. Keyboard users can press Shift and Delete.</span>${checkbox ? `<span class="visually-hidden" id="${limitId}">Tick ${subquestion.maxSelections} boxes.</span><p class="answer-error" data-selection-error role="status" hidden>You can tick no more than ${subquestion.maxSelections} boxes.</p>` : ""}`;
  }

  function inputMarkup(subquestion, value) {
    const displayedValue = subquestion.capitaliseAnswer ? capitaliseInitialText(value) : value;
    if (subquestion.type === "radio") return optionMarkup(subquestion, value, false);
    if (subquestion.type === "checkbox") return optionMarkup(subquestion, value, true);
    if (subquestion.type === "short-text" && subquestion.inlineAnswer) return `<div class="sentence-answer"><span>${paperTextMarkup(subquestion.inlineAnswer.before, subquestion.boldPhrases)}</span><label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><input id="${subquestion.id}" class="text-answer short-answer-line" type="text" value="${escapeHtml(displayedValue || "")}" autocomplete="off" autocapitalize="${subquestion.capitaliseAnswer ? "sentences" : "none"}" /><span>${paperTextMarkup(subquestion.inlineAnswer.after, subquestion.boldPhrases)}</span></div>`;
    if (subquestion.type === "short-text" && subquestion.answerStyle === "reason") return `<label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><textarea id="${subquestion.id}" class="text-answer extended-answer-box" rows="4" autocapitalize="sentences">${escapeHtml(value || "")}</textarea>`;
    if (subquestion.type === "short-text") return `<label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><input id="${subquestion.id}" class="text-answer short-answer-line" type="text" value="${escapeHtml(value || "")}" autocomplete="off" autocapitalize="sentences" />`;
    if (subquestion.type === "structured-review") {
      if (subquestion.roughWork && subquestion.finalAnswerField) {
        return `<div class="q8-answer-workspace"><section class="q8-rough-work" aria-labelledby="q8-rough-work-heading"><h3 id="q8-rough-work-heading">Rough work</h3><div class="q8-rough-work-table">${subquestion.headings.map(heading => `<label><span>${escapeHtml(heading.label)}</span><textarea data-heading="${heading.id}" aria-label="Rough work: ${escapeHtml(heading.label)}" autocapitalize="sentences">${escapeHtml(value?.[heading.id] || "")}</textarea></label>`).join("")}</div></section><section class="q8-final-answer" aria-labelledby="q8-final-answer-heading"><h3 id="q8-final-answer-heading">Final answer</h3><label class="visually-hidden" for="${subquestion.id}-final">Final answer</label><textarea id="${subquestion.id}-final" data-heading="final" aria-label="Final answer" autocapitalize="sentences">${escapeHtml(value?.final || "")}</textarea><p class="q8-end-paper">[END OF QUESTION PAPER]</p></section></div>`;
      }
      return `<div class="structured-answer">${subquestion.headings.map(heading => `<label><span>${escapeHtml(heading.label)}</span><textarea data-heading="${heading.id}" rows="4" autocapitalize="sentences">${escapeHtml(value?.[heading.id] || "")}</textarea></label>`).join("")}</div>`;
    }
    if (subquestion.type === "notation-choice") return `<div data-notation-container></div>`;
    return "";
  }

  function questionIntroMarkup(question) {
    const paragraphs = Array.isArray(question.intro) ? question.intro : [question.intro];
    const lastTextIndex = paragraphs.reduce((lastIndex, text, index) => text ? index : lastIndex, -1);
    const paragraphMarkup = (text, index) => {
      if (!text) return `<p class="question-intro-spacer" aria-hidden="true"></p>`;
      const isTotalMarksRow = question.introTotalMarks && index === lastTextIndex;
      if (!isTotalMarksRow) return `<p>${paperTextMarkup(text, question.introBoldPhrases)}</p>`;
      const marks = Number(question.introTotalMarks);
      return `<p class="question-intro-mark-row"><span>${paperTextMarkup(text, question.introBoldPhrases)}</span><span class="question-intro-marks" ${question.id ? `data-question-total-mark="${escapeHtml(question.id)}"` : ""} aria-label="${marks} ${marks === 1 ? "mark" : "marks"}">${marks}</span></p>`;
    };
    if (!Array.isArray(question.introBulletRange)) return paragraphs.map(paragraphMarkup).join("");
    const [bulletStart, bulletEnd] = question.introBulletRange;
    return paragraphs.map((text, index) => {
      if (index === bulletStart) return `<ul class="question-intro-list">${paragraphs.slice(bulletStart, bulletEnd + 1).map(item => `<li>${paperTextMarkup(item, question.introBoldPhrases)}</li>`).join("")}</ul>`;
      if (index > bulletStart && index <= bulletEnd) return "";
      return paragraphMarkup(text, index);
    }).join("");
  }

  function paperOpeningMarkup(question) {
    if (Number(question?.number) !== 1 || !Array.isArray(paper.openingInstructions)) return "";
    return `<div class="paper-opening-instructions">${paper.openingInstructions.map(line => `<p>${escapeHtml(line)}</p>`).join("")}</div>`;
  }

  function questionOutroMarkup(question) {
    if (!question.outro) return "";
    return questionIntroMarkup({
      id: question.id,
      intro: question.outro,
      introBoldPhrases: question.outroBoldPhrases,
      introTotalMarks: question.outroTotalMarks,
    });
  }

  function styleReasonGroupsMarkup(question) {
    const groups = [];
    for (let index = 0; index < question.subquestions.length; index += 2) {
      const styleQuestion = question.subquestions[index];
      const reasonQuestion = question.subquestions[index + 1];
      const styleValue = engine.attempt.answers[styleQuestion.id];
      const reasonValue = engine.attempt.answers[reasonQuestion.id];
      groups.push(`<div class="q7-question-group">
        <div class="q7-group-heading"><span>${escapeHtml(styleQuestion.groupStart.label)}</span><span>${escapeHtml(styleQuestion.groupStart.prompt)}</span></div>
        <div class="q7-prompt-row"><span>${escapeHtml(styleQuestion.label)}</span><span>${paperTextMarkup(styleQuestion.prompt, styleQuestion.boldPhrases)}</span><strong data-subquestion-mark="${styleQuestion.id}" aria-label="${styleQuestion.marks} mark">${styleQuestion.marks}</strong></div>
        <div class="q7-prompt-row"><span>${escapeHtml(reasonQuestion.label)}</span><span>${paperTextMarkup(reasonQuestion.prompt, reasonQuestion.boldPhrases)}</span><strong data-subquestion-mark="${reasonQuestion.id}" aria-label="${reasonQuestion.marks} mark">${reasonQuestion.marks}</strong></div>
        <div class="q7-playback-lines">${styleQuestion.instructionLines.map(line => `<span>${escapeHtml(line)}</span>`).join("")}</div>
        <section class="subquestion q7-style-options" data-subquestion="${styleQuestion.id}">${inputMarkup(styleQuestion, styleValue)}</section>
        <section class="subquestion q7-reason-entry" data-subquestion="${reasonQuestion.id}"><label for="${reasonQuestion.id}"><span>Reason</span><textarea id="${reasonQuestion.id}" class="text-answer q7-reason-answer" rows="1" autocapitalize="sentences">${escapeHtml(reasonValue || "")}</textarea></label></section>
      </div>`);
    }
    return groups.join("");
  }

  function subquestionsMarkup(question) {
    if (question.layout === "style-reason-groups") return styleReasonGroupsMarkup(question);
    return question.subquestions.map((subquestion, subquestionIndex) => {
      const groupStart = subquestion.groupStart ? `<div class="subquestion-group-heading"><strong>${escapeHtml(subquestion.groupStart.label)}</strong><span>${escapeHtml(subquestion.groupStart.prompt)}</span></div>` : "";
      const showMarks = question.showPartMarks !== false;
      const showHeading = Boolean(subquestion.label) && subquestion.type !== "structured-review";
      const promptMatchesLabel = subquestion.prompt === subquestion.label;
      const value = engine.attempt.answers[subquestion.id];
      const inlineAnswer = Boolean(subquestion.inlineAnswer);
      const promptMarkup = Array.isArray(subquestion.promptLines)
        ? `<div class="subquestion-prompt-lines">${subquestion.promptLines.map(line => line ? `<span>${paperTextMarkup(line, subquestion.boldPhrases)}</span>` : `<span class="subquestion-prompt-spacer" aria-hidden="true"></span>`).join("")}</div>`
        : `<span>${paperTextMarkup(subquestion.prompt, subquestion.boldPhrases)}</span>`;
      const headingQuestion = subquestion.type === "structured-review"
        ? subquestion.roughWork ? "" : `<h3 class="final-answer-heading">${escapeHtml(subquestion.prompt)}</h3>`
        : inlineAnswer
          ? inputMarkup(subquestion, value)
          : promptMatchesLabel
            ? ""
            : `${promptMarkup}${subquestion.scoreHint && subquestion.scoreHintPlacement === "prompt" ? `<span class="score-apply-hint score-apply-hint-inline">${escapeHtml(subquestion.scoreHint)}</span>` : ""}`;
      const instruction = subquestion.instruction ? `<p class="subquestion-instruction">${escapeHtml(subquestion.instruction)}</p>` : "";
      const guideArrow = question.layout === "music-guide" && subquestionIndex < question.subquestions.length - 1
        ? `<svg class="music-guide-arrow" viewBox="0 0 52 28" aria-hidden="true" focusable="false"><path d="M0 8 H35 V1 L51 14 L35 27 V20 H0 Z" /></svg>`
        : "";
      return `${groupStart}<section class="subquestion subquestion-${subquestion.type} ${showHeading ? "has-part-label" : ""} ${subquestion.answerStyle ? `answer-style-${subquestion.answerStyle}` : ""}" data-subquestion="${subquestion.id}">
        ${showHeading || headingQuestion || showMarks ? `<div class="subquestion-heading"><span class="subquestion-heading-label">${showHeading ? escapeHtml(subquestion.label) : ""}</span><div class="subquestion-heading-question">${headingQuestion}</div>${showMarks ? `<span class="subquestion-heading-marks ${subquestion.markAlign === "prompt-end" ? "is-prompt-end" : ""}" data-subquestion-mark="${subquestion.id}" aria-label="${subquestion.marks} ${subquestion.marks === 1 ? "mark" : "marks"}">${subquestion.marks}</span>` : ""}</div>` : ""}
        ${instruction}
        ${inlineAnswer ? "" : inputMarkup(subquestion, value)}
        ${guideArrow}
      </section>`;
    }).join("");
  }

  function sharedNotationMarkup(question) {
    return question.score?.sharedNotation ? `<div class="shared-notation-panel" data-shared-notation="${escapeHtml(question.score.sharedNotation)}"></div>` : "";
  }

  function contentHeadingMarkup(question) {
    if (!question.contentHeading || /\(continued\)\s*$/i.test(question.contentHeading)) return "";
    return `<h3 class="question-continuation question-content-heading">${escapeHtml(question.contentHeading)}</h3>`;
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
    const syncTypedAnswerStyle = field => {
      const hasAnswer = Boolean(field.value.trim());
      field.classList.toggle("has-user-answer", hasAnswer);
      if (hasAnswer) syncUserAnswerGlimmer(field);
    };
    if (subquestion.type === "radio") {
      card.querySelectorAll('input[type="radio"]').forEach(input => {
        const label = input.closest(".answer-option");
        if (input.checked) syncUserAnswerGlimmer(input);
        input.addEventListener("change", () => {
          card.querySelectorAll(".answer-option").forEach(option => option.classList.toggle("is-selected", option.contains(input) && input.checked));
          if (input.checked) syncUserAnswerGlimmer(input);
          engine.setAnswer(subquestion.id, input.value);
        });
        bindRemovalGesture(label, () => {
          if (!input.checked) return;
          input.checked = false;
          label.classList.remove("is-selected");
          engine.setAnswer(subquestion.id, "");
        });
      });
    } else if (subquestion.type === "checkbox") {
      const syncCheckboxes = () => {
        const checked = [...card.querySelectorAll('input[type="checkbox"]:checked')];
        card.querySelectorAll(".answer-option").forEach(label => label.classList.toggle("is-selected", label.querySelector("input").checked));
        checked.forEach(syncUserAnswerGlimmer);
        engine.setAnswer(subquestion.id, checked.map(item => item.value));
      };
      card.querySelectorAll('input[type="checkbox"]').forEach(input => {
        const label = input.closest(".answer-option");
        if (input.checked) syncUserAnswerGlimmer(input);
        input.addEventListener("change", () => {
          const checked = [...card.querySelectorAll('input[type="checkbox"]:checked')];
          const error = card.querySelector("[data-selection-error]");
          if (checked.length > subquestion.maxSelections) {
            input.checked = false;
            if (error) error.hidden = false;
            return;
          }
          if (error) error.hidden = true;
          syncCheckboxes();
        });
        bindRemovalGesture(label, () => {
          if (!input.checked) return;
          input.checked = false;
          const error = card.querySelector("[data-selection-error]");
          if (error) error.hidden = true;
          syncCheckboxes();
        });
      });
    } else if (subquestion.type === "short-text") {
      const input = card.querySelector("input, textarea");
      input.setAttribute("aria-keyshortcuts", "Shift+Delete");
      syncTypedAnswerStyle(input);
      input.addEventListener("input", () => {
        if (!subquestion.inlineAnswer || subquestion.capitaliseAnswer) capitaliseInitialAnswer(input);
        syncTypedAnswerStyle(input);
        engine.setAnswer(subquestion.id, input.value);
      });
      bindRemovalGesture(input, () => {
        if (!input.value) return;
        input.value = "";
        syncTypedAnswerStyle(input);
        engine.setAnswer(subquestion.id, "");
      });
    } else if (subquestion.type === "structured-review") {
      const updateStructuredAnswer = () => {
        const value = {};
        card.querySelectorAll("textarea").forEach(field => { value[field.dataset.heading] = field.value; });
        engine.setAnswer(subquestion.id, value);
      };
      card.querySelectorAll("textarea").forEach(textarea => {
        textarea.setAttribute("aria-keyshortcuts", "Shift+Delete");
        syncTypedAnswerStyle(textarea);
        textarea.addEventListener("input", () => {
          capitaliseInitialAnswer(textarea);
          syncTypedAnswerStyle(textarea);
          updateStructuredAnswer();
        });
        bindRemovalGesture(textarea, () => {
          if (!textarea.value) return;
          textarea.value = "";
          syncTypedAnswerStyle(textarea);
          updateStructuredAnswer();
        });
      });
    } else if (subquestion.type === "notation-choice") {
      const notationContainer = card.querySelector("[data-notation-container]");
      const renderNotationControl = value => root.ExamNotation.render(notationContainer, subquestion, value, nextValue => {
        engine.setAnswer(subquestion.id, nextValue);
        const questionCard = card.closest(".question-card");
        const question = paper.questions.find(item => item.subquestions.some(part => part.id === subquestion.id));
        if (questionCard && question) renderSharedNotation(questionCard, question);
      });
      renderNotationControl(engine.attempt.answers[subquestion.id]);
    }
  }

  function renderQuestion() {
    destroyAudioPlayers();
    const paperToolbar = $(".exam-paper-toolbar");
    paperToolbar?.remove();
    showingAllQuestions = false;
    $(".exam-header-audio").hidden = false;
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
    const questionCard = $("[data-single-question-area] .question-card");
    const paperActions = $("[data-single-question-area] .question-actions");
    const paperWidth = questionCard.getBoundingClientRect().width;
    if (paperWidth) questionCard.style.setProperty("--checked-paper-min-height", `${paperWidth * 297 / 210}px`);
    if (paperToolbar) questionCard.prepend(paperToolbar);
    if (paperActions.parentElement !== questionCard) questionCard.append(paperActions);
    const checked = engine.isQuestionChecked(question.id);
    const questionResult = checked ? root.ExamMarking.markPaper(paper, engine.attempt.answers).questionBreakdown.find(item => item.id === question.id) : null;
    questionCard.className = `question-card question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""} ${checked ? "marked-question-card is-practice-checked" : ""}`;
    $("[data-question-heading]").textContent = `Question ${question.number}`;
    $("[data-paper-opening]").innerHTML = paperOpeningMarkup(question);
    $("[data-question-intro]").innerHTML = questionIntroMarkup(question);
    const parts = $("[data-subquestions]");
    parts.innerHTML = `${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}`;
    $("[data-question-outro]").innerHTML = questionOutroMarkup(question);
    const sharedNotation = parts.closest(".question-card").querySelector("[data-shared-notation]");
    if (checked && sharedNotation && root.ExamNotation?.renderSharedScore) {
      const notationReview = Object.fromEntries(question.subquestions.filter(subquestion => subquestion.type === "notation-choice").map(subquestion => [subquestion.id, questionResult.parts.find(part => part.id === subquestion.id)?.status]));
      root.ExamNotation.renderSharedScore(sharedNotation, question, engine.attempt.answers, null, notationReview);
    } else {
      renderSharedNotation(parts.closest(".question-card"), question);
    }
    question.subquestions.forEach(subquestion => bindSubquestion(parts.querySelector(`[data-subquestion="${subquestion.id}"]`), subquestion));
    if (checked) applyPracticeQuestionMarking(questionCard, question, questionResult);
    audioPlayer = root.ExamAudio.createPlayer($("[data-audio-container]"), {
      clips: question.audio.clips,
      mode: engine.attempt.mode,
      limitPlayback: Boolean(engine.attempt.audioLimitEnabled),
      playConsumed: Boolean(engine.attempt.audioLimitEnabled && engine.attempt.audioPlayCounts?.[question.id]),
      onConsumed: () => engine.setPlayCounts({ ...engine.attempt.audioPlayCounts, [question.id]: 1 }),
    });
    const previous = $("[data-previous-question]");
    const next = $("[data-next-question]");
    previous.hidden = false;
    previous.classList.remove("is-invisible-placeholder");
    previous.disabled = index === 0;
    $("[data-bottom-previous-question]").hidden = false;
    $("[data-bottom-previous-question]").disabled = index === 0;
    if (index > 0) $("[data-previous-label]").textContent = "Previous";
    const isLastQuestion = index === visible.length - 1;
    $(".exam-question-navigation").classList.toggle("is-submit-visible", isLastQuestion);
    next.hidden = isLastQuestion;
    $("[data-bottom-next-question]").hidden = isLastQuestion;
    if (index < visible.length - 1) $("[data-next-label]").textContent = "Next";
    document.querySelectorAll("[data-submit-paper]").forEach(submit => { submit.hidden = !isLastQuestion; });
    renderNavigator();
    updateQuestionActions();
  }

  function renderAllQuestions() {
    if (!canShowAllQuestions()) return;
    destroyAudioPlayers();
    const paperToolbar = $(".exam-paper-toolbar");
    paperToolbar?.remove();
    showingAllQuestions = true;
    const activeExam = engine.attempt.mode === "exam" && engine.attempt.examStarted;
    $(".exam-header-audio").hidden = !activeExam;
    const singleArea = $("[data-single-question-area]");
    const allArea = $("[data-all-questions-area]");
    const setExamSubmitVisibility = visible => {
      const topSubmit = $(".question-submit-button");
      const bottomSubmit = allArea.querySelector("[data-all-submit-paper]");
      topSubmit.hidden = !visible;
      if (bottomSubmit) bottomSubmit.hidden = !visible;
      $(".exam-question-navigation").classList.toggle("is-submit-visible", visible);
    };
    singleArea.hidden = true;
    allArea.hidden = false;
    allArea.innerHTML = engine.visibleQuestions().map(question => `<article class="question-card all-question-card question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""}" data-all-question="${question.id}">
      <div data-all-question-audio></div>
      <div class="paper-marks-heading">MARKS</div>
      ${paperOpeningMarkup(question)}
      <header class="question-header"><h2>Question ${question.number}</h2></header>
      <div class="question-intro">${questionIntroMarkup(question)}</div>
      <div class="subquestions">${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}</div>
      <div class="question-outro">${questionOutroMarkup(question)}</div>
    </article>`).join("") + `<div class="question-actions all-question-actions"><span></span><button class="button button-dark" type="button" data-all-submit-paper>Submit</button></div>`;
    const firstPaper = allArea.querySelector(".all-question-card");
    const lastPaper = allArea.querySelector(".all-question-card:last-of-type");
    const allPaperActions = allArea.querySelector(".all-question-actions");
    if (firstPaper && paperToolbar) firstPaper.prepend(paperToolbar);
    if (lastPaper && allPaperActions) {
      lastPaper.classList.add("has-paper-actions");
      lastPaper.append(allPaperActions);
    }
    engine.visibleQuestions().forEach((question, questionIndex) => {
      const card = allArea.querySelector(`[data-all-question="${question.id}"]`);
      const locked = activeExam && questionIndex > (engine.attempt.examUnlockedQuestionIndex ?? 0);
      card.classList.toggle("is-exam-locked", locked);
      card.inert = locked;
      renderSharedNotation(card, question);
      question.subquestions.forEach(subquestion => bindSubquestion(card.querySelector(`[data-subquestion="${subquestion.id}"]`), subquestion));
      if (!activeExam) allQuestionAudioPlayers.push(root.ExamAudio.createPlayer(card.querySelector("[data-all-question-audio]"), { clips: question.audio.clips }));
    });
    if (activeExam) {
      const clips = engine.visibleQuestions().map((question, index) => ({ ...question.audio.clips[0], label: `Question ${index + 1}` }));
      audioPlayer = root.ExamAudio.createPlayer($("[data-audio-container]"), {
        clips,
        continuous: true,
        autoplay: true,
        limitPlayback: true,
        onClipStart: index => {
          engine.unlockExamQuestion(index);
          const card = allArea.querySelector(`[data-all-question="${paper.questions[index].id}"]`);
          allArea.querySelectorAll("[data-all-question]").forEach((item, itemIndex) => {
            const isLocked = itemIndex > index;
            item.classList.toggle("is-exam-locked", isLocked);
            item.inert = isLocked;
          });
          if (index === engine.visibleQuestions().length - 1) setExamSubmitVisibility(true);
          card?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      });
    }
    $("[data-next-question]").hidden = !activeExam;
    $("[data-previous-question]").hidden = false;
    $("[data-previous-question]").disabled = true;
    $("[data-previous-question]").classList.add("is-invisible-placeholder");
    setExamSubmitVisibility(!activeExam || (engine.attempt.examUnlockedQuestionIndex ?? 0) === engine.visibleQuestions().length - 1);
    allArea.querySelector("[data-all-submit-paper]")?.addEventListener("click", openSubmitModal);
    renderNavigator();
    closePaperMenus();
  }

  function renderPrintPaper() {
    const printArea = $("[data-print-paper]");
    if (!printArea) return;
    printArea.innerHTML = `<header class="print-paper-header"><h1>${escapeHtml(paper.title)}</h1><span>Total marks: ${paper.totalMarks}</span></header>${paper.questions.map(question => `<article class="question-card print-question-card question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""}" data-print-question="${question.id}">
      <div class="paper-marks-heading">MARKS</div>
      <header class="question-header"><h2>Question ${question.number}</h2></header>
      <div class="question-intro">${questionIntroMarkup(question)}</div>
      <div class="subquestions">${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}</div>
      <div class="question-outro">${questionOutroMarkup(question)}</div>
    </article>`).join("")}`;
    paper.questions.forEach(question => {
      const card = printArea.querySelector(`[data-print-question="${question.id}"]`);
      const notation = card?.querySelector("[data-shared-notation]");
      if (notation && root.ExamNotation?.renderSharedScore) root.ExamNotation.renderSharedScore(notation, question, engine.attempt.answers, () => {});
    });
  }

  function paperShareUrl() {
    return `https://mrtennant-music.github.io/musicliteracy/interactive-exams/exam.html?paper=${encodeURIComponent(paper.id)}`;
  }

  function openQrOverlay() {
    const overlay = $("[data-qr-overlay]");
    const shareUrl = paperShareUrl();
    $("[data-qr-title]").textContent = `${paper.level} • ${paper.year}`;
    const image = $("[data-qr-image]");
    image.src = `https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=${encodeURIComponent(shareUrl)}`;
    image.alt = `QR code linking to ${paper.level} • ${paper.year}`;
    overlay.classList.add("is-open");
    overlay.querySelector("[data-close-qr]")?.focus();
  }

  function closeQrOverlay() { $("[data-qr-overlay]")?.classList.remove("is-open"); }

  async function copyPaperLink() {
    const button = $("[data-copy-paper-link]");
    try {
      await navigator.clipboard.writeText(paperShareUrl());
      button.textContent = "Copied";
      root.setTimeout(() => { button.textContent = "Copy link"; }, 1800);
    } catch {
      button.textContent = "Copy unavailable";
    }
  }

  function acceptedAnswerDisplay(subquestion) {
    const answer = subquestion.answerDisplay
      || (subquestion.answers?.length ? subquestion.answers.join(" and ") : subquestion.answer)
      || "See the marking guidance";
    if (subquestion.type === "notation-choice") return answer;
    return String(answer).replace(/^(\s*)([a-z])/, (_, spacing, letter) => `${spacing}${letter.toUpperCase()}`);
  }

  function partResult(id) {
    return engine.attempt.result.questionBreakdown.flatMap(question => question.parts).find(part => part.id === id);
  }

  function structuredAnswerGuidanceMarkup(subquestion, part) {
    if (!subquestion.finalAnswerField || !subquestion.headings?.length) return "";
    const headings = subquestion.headings.map(heading => {
      const awardedConcepts = new Set(part?.matchedConcepts?.[heading.id] || []);
      const concepts = (heading.concepts || []).map(concept => `<li${awardedConcepts.has(concept.label) ? ' class="is-awarded-concept"' : ""}>${escapeHtml(concept.label)}</li>`).join("");
      return `<section><h4>${escapeHtml(heading.label)}</h4><ul>${concepts}</ul>${heading.additionalGuidance?.length ? `<div class="q8-heading-guidance"><b>Additional guidance</b><ul>${heading.additionalGuidance.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}</section>`;
    }).join("");
    const generalGuidance = subquestion.additionalGuidance?.length ? `<section class="q8-general-guidance"><h4>Additional guidance</h4><ul>${subquestion.additionalGuidance.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : "";
    return `<div class="q8-feedback-answer-bank" aria-label="Answers and additional guidance from the marking instructions">${headings}${generalGuidance}</div>`;
  }

  function highlightedFinalAnswerMarkup(value, matchedEvidence = {}) {
    const source = String(value || "");
    const ranges = Object.values(matchedEvidence).flat().sort((left, right) => left.start - right.start || left.end - right.end);
    let cursor = 0;
    let markup = "";
    ranges.forEach(range => {
      if (range.start < cursor || range.end <= range.start) return;
      markup += escapeHtml(source.slice(cursor, range.start));
      markup += `<mark class="q8-earned-answer">${escapeHtml(source.slice(range.start, range.end))}</mark>`;
      cursor = range.end;
    });
    return markup + escapeHtml(source.slice(cursor));
  }

  function inlineFeedbackMarkup(subquestion, part) {
    const hasPartialCredit = part.status === "partial" || part.marks > 0 && part.marks < part.maxMarks;
    const state = part.status === "correct" ? "correct" : hasPartialCredit ? "partial" : part.status === "unanswered" ? "unanswered" : "incorrect";
    const title = state === "correct" ? "Correct" : state === "partial" ? "Partially correct" : state === "unanswered" ? "Not answered" : "Incorrect";
    const headingLabels = Object.fromEntries((subquestion.headings || []).map(heading => [heading.id, heading.label]));
    const headingCap = subquestion.maxMarksPerHeading || 2;
    const cappedHeadings = Object.entries(part.validConceptCounts || {}).filter(([, count]) => count > headingCap);
    const capExplanation = part.marks < part.maxMarks && cappedHeadings.length
      ? `<p class="q8-heading-cap-explanation">${cappedHeadings.map(([heading, count]) => `You identified ${count} valid concepts under <b>${escapeHtml(headingLabels[heading] || heading)}</b>, but only ${headingCap} marks can be awarded from one heading.`).join(" ")} To achieve full marks, include valid concepts from at least 3 headings.</p>`
      : "";
    return `<aside class="inline-answer-feedback is-${state}" aria-label="Feedback for ${escapeHtml(subquestion.label || subquestion.prompt)}">
      <div class="inline-feedback-heading"><strong>${title}</strong></div>
      ${capExplanation}
      ${part.status !== "correct" && !subquestion.finalAnswerField ? `<p class="inline-correct-answer"><b>Correct answer:</b> ${escapeHtml(acceptedAnswerDisplay(subquestion))}</p>` : ""}
      ${subquestion.definition ? `<p class="inline-answer-definition">${escapeHtml(subquestion.definition)}</p>` : ""}
      ${structuredAnswerGuidanceMarkup(subquestion, part)}
    </aside>`;
  }

  function applyReviewMark(markElement, awardedMarks, availableMarks) {
    if (!markElement) return;
    const fullMarks = awardedMarks >= availableMarks;
    markElement.classList.add(fullMarks ? "is-awarded" : "is-not-awarded");
    markElement.setAttribute("aria-label", fullMarks
      ? `${awardedMarks} out of ${availableMarks} marks awarded`
      : `Maximum ${availableMarks} marks; ${awardedMarks} awarded`);
    if (!fullMarks) {
      markElement.innerHTML = `<span class="unachieved-maximum-mark" aria-hidden="true">${availableMarks}</span>${availableMarks > 1 && awardedMarks > 0 ? `<span class="subquestion-earned-marks" aria-hidden="true">${awardedMarks}</span>` : ""}`;
    }
  }

  function applyInlineMarking(card, subquestion, part) {
    const section = card.querySelector(`[data-subquestion="${subquestion.id}"]`);
    if (!section || !part) return;
    const partMark = card.querySelector(`[data-subquestion-mark="${subquestion.id}"]`);
    applyReviewMark(partMark, part.marks, part.maxMarks);
    const expected = new Set((subquestion.type === "checkbox" ? subquestion.answers : [subquestion.answer]).filter(Boolean).map(String));
    const chosen = new Set((Array.isArray(part.value) ? part.value : [part.value]).filter(value => value !== undefined && value !== null && String(value) !== "").map(String));

    if (["radio", "checkbox"].includes(subquestion.type)) {
      section.querySelectorAll(".answer-option").forEach(option => {
        const input = option.querySelector("input");
        const isExpected = expected.has(input.value);
        const isChosen = chosen.has(input.value);
        option.classList.toggle("is-review-correct", isChosen && isExpected);
        option.classList.toggle("is-user-correct", isChosen && isExpected);
        option.classList.toggle("is-user-incorrect", isChosen && !isExpected);
      });
    } else if (subquestion.type === "short-text") {
      const field = section.querySelector("input, textarea");
      if (field) field.classList.add(part.status === "correct" ? "is-user-correct" : part.status === "unanswered" ? "is-unanswered" : "is-user-incorrect");
    } else if (subquestion.type === "notation-choice") {
      section.querySelectorAll(".notation-tool-button").forEach(button => {
        const isExpected = button.dataset.value === subquestion.answer;
        const hasAnswer = Boolean(String(part.value || "").replace(/_/g, "").replace(/,/g, ""));
        const representsPlacementTool = ["note-entry", "repeat-sign"].includes(subquestion.notationTool);
        button.classList.toggle("is-review-correct", isExpected || representsPlacementTool && part.status === "unanswered");
        button.classList.toggle("is-user-correct", part.status === "correct" && (isExpected || representsPlacementTool));
        button.classList.toggle("is-user-incorrect", hasAnswer && part.status !== "correct" && (button.classList.contains("is-selected") || representsPlacementTool));
      });
    } else if (subquestion.type === "structured-review") {
      const finalAnswer = section.querySelector('[data-heading="final"]');
      if (finalAnswer) {
        const markedAnswer = document.createElement("div");
        markedAnswer.id = finalAnswer.id;
        markedAnswer.className = "q8-marked-final-answer";
        markedAnswer.setAttribute("role", "textbox");
        markedAnswer.setAttribute("aria-readonly", "true");
        markedAnswer.setAttribute("aria-label", "Marked final answer. Words which earned marks are green.");
        markedAnswer.innerHTML = highlightedFinalAnswerMarkup(part.value?.final, part.matchedEvidence);
        finalAnswer.replaceWith(markedAnswer);
      }
      section.querySelector(".q8-rough-work")?.classList.add("is-unmarked-rough-work");
    }

    section.querySelectorAll("input, textarea, button").forEach(control => {
      if (control.matches("input, button")) control.disabled = true;
      if (control.matches("textarea")) control.readOnly = true;
      control.removeAttribute("aria-keyshortcuts");
    });
    section.insertAdjacentHTML("beforeend", inlineFeedbackMarkup(subquestion, part));
  }

  function arrangeMusicGuideFeedback(card, question) {
    if (question.layout !== "music-guide") return;
    const feedbackItems = Array.from(card.querySelectorAll(".inline-answer-feedback"));
    if (!feedbackItems.length) return;
    const feedbackList = document.createElement("div");
    feedbackList.className = "music-guide-feedback-list";
    feedbackItems.forEach((feedback, index) => {
      const number = document.createElement("span");
      number.className = "music-guide-feedback-number";
      number.textContent = question.subquestions[index]?.label || String(index + 1);
      feedback.querySelector(".inline-feedback-heading")?.prepend(number);
      feedbackList.append(feedback);
    });
    card.querySelector(".subquestions")?.append(feedbackList);
  }

  function applyPracticeQuestionMarking(card, question, questionResult) {
    if (!questionResult) return;
    applyReviewMark(card.querySelector(`[data-question-total-mark="${question.id}"]`), questionResult.marks, questionResult.maxMarks);
    question.subquestions.forEach(subquestion => {
      applyInlineMarking(card, subquestion, questionResult.parts.find(part => part.id === subquestion.id));
    });
    arrangeMusicGuideFeedback(card, question);
  }

  function renderResultsPaper() {
    const resultsPaper = $("[data-results-paper]");
    destroyAudioPlayers();
    document.body.dataset.resultsLayout = showingAllQuestions ? "all" : "single";
    $(".exam-header-audio").hidden = showingAllQuestions;
    const questions = showingAllQuestions ? paper.questions : [currentQuestion()];
    resultsPaper.innerHTML = questions.map(question => {
      return `<article class="question-card all-question-card marked-question-card ${showingAllQuestions ? "" : "has-paper-actions"} question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""}" data-result-question="${question.id}">
        ${showingAllQuestions ? "<div data-result-question-audio></div>" : ""}
        <div class="paper-marks-heading">MARKS</div>
        <header class="question-header"><h2>Question ${question.number}</h2></header>
        <div class="question-intro">${questionIntroMarkup(question)}</div>
        <div class="subquestions">${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}</div>
        <div class="question-outro">${questionOutroMarkup(question)}</div>
        ${showingAllQuestions ? "" : `<div class="question-review-footer">
          <button class="button button-primary question-navigation-button" type="button" data-result-bottom-previous aria-label="Previous question" title="Previous"><img class="question-nav-arrow is-previous" src="../next.svg" alt="" aria-hidden="true" /></button>
          <button class="button button-primary question-navigation-button" type="button" data-result-bottom-next aria-label="Next question" title="Next"><img class="question-nav-arrow" src="../next.svg" alt="" aria-hidden="true" /></button>
        </div>`}
      </article>`;
    }).join("");

    questions.forEach(question => {
      const card = resultsPaper.querySelector(`[data-result-question="${question.id}"]`);
      const questionResult = engine.attempt.result.questionBreakdown.find(item => item.id === question.id);
      applyReviewMark(card.querySelector(`[data-question-total-mark="${question.id}"]`), questionResult.marks, questionResult.maxMarks);
      const sharedNotation = card.querySelector("[data-shared-notation]");
      const notationReview = Object.fromEntries(question.subquestions.filter(subquestion => subquestion.type === "notation-choice").map(subquestion => [subquestion.id, partResult(subquestion.id)?.status]));
      if (sharedNotation && root.ExamNotation?.renderSharedScore) root.ExamNotation.renderSharedScore(sharedNotation, question, engine.attempt.answers, null, notationReview);
      const feedbackAudio = card.querySelector("[data-result-question-audio]");
      if (feedbackAudio) allQuestionAudioPlayers.push(root.ExamAudio.createPlayer(feedbackAudio, { clips: question.audio.clips }));
      if (!showingAllQuestions) audioPlayer = root.ExamAudio.createPlayer($("[data-audio-container]"), { clips: question.audio.clips });
      question.subquestions.forEach(subquestion => {
        const section = card.querySelector(`[data-subquestion="${subquestion.id}"]`);
        if (subquestion.type === "notation-choice") {
          const notationContainer = section?.querySelector("[data-notation-container]");
          if (notationContainer) root.ExamNotation?.render(notationContainer, subquestion, engine.attempt.answers[subquestion.id], () => {});
        }
        applyInlineMarking(card, subquestion, partResult(subquestion.id));
      });
      arrangeMusicGuideFeedback(card, question);
      if (!showingAllQuestions) {
        const questionIndex = paper.questions.findIndex(item => item.id === question.id);
        const bottomPrevious = card.querySelector("[data-result-bottom-previous]");
        const bottomNext = card.querySelector("[data-result-bottom-next]");
        bottomPrevious.disabled = questionIndex <= 0;
        bottomNext.disabled = questionIndex >= paper.questions.length - 1;
        bottomPrevious.addEventListener("click", () => showResultQuestion(paper.questions[questionIndex - 1].id));
        bottomNext.addEventListener("click", () => showResultQuestion(paper.questions[questionIndex + 1].id));
      }
    });
  }

  function updateResultNavigation() {
    const questions = engine.visibleQuestions();
    const index = questions.findIndex(question => question.id === engine.attempt.currentQuestion);
    const previous = $("[data-previous-question]");
    const next = $("[data-next-question]");
    previous.hidden = false;
    previous.classList.remove("is-invisible-placeholder");
    next.hidden = false;
    previous.disabled = showingAllQuestions || index <= 0;
    next.disabled = showingAllQuestions || index < 0 || index >= questions.length - 1;
    $(".question-submit-button").hidden = true;
    $(".exam-question-navigation").classList.remove("is-submit-visible");
  }

  function showResultQuestion(questionId) {
    if (!paper.questions.some(question => question.id === questionId)) return;
    showingAllQuestions = false;
    engine.attempt.currentQuestion = questionId;
    closePaperMenus();
    renderResultsPaper();
    renderNavigator();
    updateResultNavigation();
    $("[data-results-paper]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showAllResultQuestions() {
    showingAllQuestions = true;
    closePaperMenus();
    renderResultsPaper();
    renderNavigator();
    updateResultNavigation();
    $("[data-results-paper]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderResults() {
    root.ExamAudio.pauseAll();
    destroyAudioPlayers();
    const result = engine.attempt.result;
    showingAllQuestions = false;
    engine.attempt.currentQuestion = paper.questions[0].id;
    renderToolbarStats();
    $("[data-results-score]").textContent = `${result.score}/${paper.totalMarks}`;
    const performanceClass = result.score < 15 ? "is-score-low" : result.score < 20 ? "is-score-middle" : "is-score-high";
    const scoreStat = $("[data-results-score-stat]");
    scoreStat.classList.remove("is-score-low", "is-score-middle", "is-score-high");
    scoreStat.classList.add(performanceClass);
    $("[data-results-percentage]").textContent = `${result.percentage}%`;
    const questionPerformance = result.questionBreakdown.map(questionResult => ({
      ...questionResult,
      number: paper.questions.find(question => question.id === questionResult.id)?.number || questionResult.id,
      percentage: questionResult.maxMarks ? questionResult.marks / questionResult.maxMarks : 0,
    }));
    const bestPercentage = Math.max(...questionPerformance.map(question => question.percentage));
    const weakestPercentage = Math.min(...questionPerformance.map(question => question.percentage));
    const formatQuestions = questions => questions.map(question => `<span class="result-question-entry"><span>Question ${escapeHtml(question.number)}</span><span class="result-question-marks">${question.marks} of ${question.maxMarks} marks</span></span>`).join("");
    const bestQuestion = questionPerformance
      .filter(question => question.percentage === bestPercentage)
      .reduce((best, question) => question.maxMarks > best.maxMarks ? question : best);
    $("[data-results-best-question]").innerHTML = formatQuestions([bestQuestion]);
    const weakestQuestion = questionPerformance
      .filter(question => question.percentage === weakestPercentage)
      .reduce((weakest, question) => question.maxMarks > weakest.maxMarks ? question : weakest);
    $("[data-results-weakest-question]").innerHTML = formatQuestions([weakestQuestion]);
    const markingInstructions = $("[data-marking-instructions]");
    markingInstructions.hidden = !paper.markingInstructionsPath;
    if (paper.markingInstructionsPath) markingInstructions.href = paper.markingInstructionsPath;
    $("[data-review-notice]").hidden = !result.reviewMarks;
    renderResultsPaper();
    renderNavigator();
    updateResultNavigation();
    showScreen("results");
  }

  function onEngineChange(attempt, reason) {
    if (reason === "submit" || reason === "restore-submit") return renderResults();
    if (reason === "timer") {
      renderToolbarStats();
      return;
    }
    if (reason === "exam-unlock") {
      renderNavigator();
      return;
    }
    if (reason === "exam-begin") {
      document.body.dataset.examActive = "true";
      renderToolbarStats();
      renderCustomiseMenu();
      showScreen("exam");
      renderAllQuestions();
      return;
    }
    if (reason === "mode-practice") {
      document.body.dataset.examActive = "false";
      renderToolbarStats();
      renderCustomiseMenu();
      renderQuestion();
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

  function startAttempt(mode) {
    root.ExamStorage.deleteDraft(paper.id);
    root.ExamStorage.deleteSubmitted(paper.id);
    document.body.dataset.examActive = String(mode === "exam");
    engine.start(mode, false);
    renderCustomiseMenu();
    if (mode === "exam") engine.beginExamSession();
  }

  function openSubmitModal() {
    const unanswered = paper.questions.filter(question => !questionIsComplete(question)).length;
    $("[data-submit-message]").textContent = unanswered
      ? "Some questions are not fully answered. You can still submit, or keep working and review the paper."
      : "All questions have been answered. After submission, your answers will be locked.";
    $("[data-submit-overlay]").classList.add("is-open");
  }
  function closeSubmitModal() { $("[data-submit-overlay]").classList.remove("is-open"); }
  function openQuestionCheckModal() {
    const question = currentQuestion();
    if (!question || engine.attempt.mode !== "practice" || engine.isQuestionChecked(question.id) || !questionIsComplete(question)) return;
    pendingQuestionCheck = question.id;
    $("[data-check-question-overlay]").classList.add("is-open");
  }
  function closeQuestionCheckModal() {
    pendingQuestionCheck = null;
    $("[data-check-question-overlay]").classList.remove("is-open");
  }
  function openResetModal() { closePaperMenus(); $("[data-reset-overlay]").classList.add("is-open"); }
  function closeResetModal() { $("[data-reset-overlay]").classList.remove("is-open"); }
  function openBlankModePicker(existingAttempt = false) {
    modePickerForExistingAttempt = existingAttempt;
    const hasAttemptedAnswers = existingAttempt && Object.values(engine?.attempt?.answers || {}).some(hasAnswerContent);
    modePickerHasProgress = hasAttemptedAnswers;
    selectedStartMode = null;
    document.querySelectorAll("[data-start-mode]").forEach(button => { button.classList.remove("is-selected"); button.setAttribute("aria-checked", "false"); });
    $("[data-practice-mode-information]").hidden = true;
    $("[data-exam-mode-warning]").hidden = true;
    $("[data-cancel-start]").hidden = !existingAttempt;
    $("[data-cancel-start-button]").hidden = !existingAttempt;
    $("[data-mode-progress-warning]").hidden = !hasAttemptedAnswers;
    $("[data-start-attempt]").hidden = true;
    $("[data-start-actions]").hidden = true;
    $("[data-start-overlay]").classList.add("is-open");
  }

  function closeActiveModePicker() {
    if (!modePickerForExistingAttempt) return;
    $("[data-start-overlay]").classList.remove("is-open");
    modePickerForExistingAttempt = false;
  }

  function openModeChangeConfirmation(mode, returnToPicker = false) {
    pendingModeChange = mode;
    returnToModePickerAfterCancel = returnToPicker;
    $("[data-mode-warning-title]").textContent = mode === "exam" ? "Exam Mode" : "Practice Mode";
    $("[data-mode-warning-message]").textContent = "Changing mode will clear your current answers and start a new attempt.";
    $("[data-confirm-mode-change]").textContent = mode === "exam" ? "Start Exam Mode" : "Start Practice Mode";
    $("[data-mode-warning-overlay]").classList.add("is-open");
  }

  function closeModeChangeConfirmation() {
    $("[data-mode-warning-overlay]").classList.remove("is-open");
    if (returnToModePickerAfterCancel) $("[data-start-overlay]").classList.add("is-open");
    pendingModeChange = null;
    returnToModePickerAfterCancel = false;
  }

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
    $("[data-open-mode-picker]").addEventListener("click", () => {
      closePaperMenus();
      openBlankModePicker(Boolean(engine?.attempt));
    });
    $("[data-previous-question]").addEventListener("click", () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (engine.attempt.status === "submitted") {
        if (!showingAllQuestions && index > 0) showResultQuestion(questions[index - 1].id);
        return;
      }
      if (index > 0) engine.goToQuestion(questions[index - 1].id);
    });
    const goNext = () => {
      const questions = engine.visibleQuestions();
      const index = questions.findIndex(item => item.id === currentQuestion().id);
      if (engine.attempt.status === "submitted") {
        if (!showingAllQuestions && index < questions.length - 1) showResultQuestion(questions[index + 1].id);
        return;
      }
      if (index < questions.length - 1) engine.goToQuestion(questions[index + 1].id);
    };
    $("[data-next-question]").addEventListener("click", goNext);
    $("[data-bottom-previous-question]").addEventListener("click", () => $("[data-previous-question]").click());
    $("[data-bottom-next-question]").addEventListener("click", () => $("[data-next-question]").click());
    document.querySelectorAll("[data-submit-paper]").forEach(submit => submit.addEventListener("click", openSubmitModal));
    $("[data-check-question]").addEventListener("click", openQuestionCheckModal);
    $("[data-cancel-check-question]").addEventListener("click", closeQuestionCheckModal);
    $("[data-confirm-check-question]").addEventListener("click", () => {
      const questionId = pendingQuestionCheck;
      closeQuestionCheckModal();
      if (questionId) engine.checkQuestion(questionId);
    });
    $("[data-check-question-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeQuestionCheckModal(); });
    $("[data-cancel-submit]").addEventListener("click", closeSubmitModal);
    $("[data-confirm-submit]").addEventListener("click", () => { closeSubmitModal(); engine.submit(); });
    $("[data-submit-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeSubmitModal(); });
    document.querySelectorAll("[data-mode-option]").forEach(option => option.addEventListener("click", () => {
      closePaperMenus();
      const requestedMode = option.dataset.modeOption;
      if (requestedMode === engine.attempt.mode) return;
      if (requestedMode === "practice" && engine.attempt.mode === "exam") {
        root.ExamAudio.pauseAll();
        engine.convertExamToPractice();
      } else {
        openModeChangeConfirmation(requestedMode);
      }
    }));
    $("[data-cancel-mode-change]").addEventListener("click", closeModeChangeConfirmation);
    $("[data-confirm-mode-change]").addEventListener("click", () => {
      $("[data-mode-warning-overlay]").classList.remove("is-open");
      root.ExamAudio.pauseAll();
      const mode = pendingModeChange || "exam";
      pendingModeChange = null;
      returnToModePickerAfterCancel = false;
      modePickerForExistingAttempt = false;
      modePickerHasProgress = false;
      startAttempt(mode);
    });
    $("[data-cancel-start]").addEventListener("click", closeActiveModePicker);
    $("[data-cancel-start-button]").addEventListener("click", closeActiveModePicker);
    $("[data-show-all-questions]").addEventListener("click", () => {
      if (engine.attempt.status === "submitted") {
        showAllResultQuestions();
        return;
      }
      if (canShowAllQuestions()) renderAllQuestions();
    });
    $("[data-reset-paper]").addEventListener("click", openResetModal);
    $("[data-cancel-reset]").addEventListener("click", closeResetModal);
    $("[data-confirm-reset]").addEventListener("click", () => {
      closeResetModal();
      root.ExamStorage.deleteDraft(paper.id);
      root.ExamStorage.deleteSubmitted(paper.id);
      root.ExamAudio.pauseAll();
      engine.destroy();
      openBlankModePicker();
    });
    $("[data-reset-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeResetModal(); });
    $("[data-open-qr]").addEventListener("click", openQrOverlay);
    $("[data-close-qr]").addEventListener("click", closeQrOverlay);
    $("[data-copy-paper-link]").addEventListener("click", copyPaperLink);
    $("[data-qr-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeQrOverlay(); });
    $("[data-results-new-attempt]").addEventListener("click", () => {
      root.ExamStorage.deleteDraft(paper.id);
      openBlankModePicker();
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      closeSubmitModal();
      closeQuestionCheckModal();
      closeResetModal();
      closeQrOverlay();
      closePaperMenus();
      closeActiveModePicker();
    });
    root.addEventListener("beforeprint", renderPrintPaper);
    root.addEventListener("afterprint", () => { const printArea = $("[data-print-paper]"); if (printArea) printArea.innerHTML = ""; });
  }

  function bindStartOverlay() {
    document.querySelectorAll("[data-start-mode]").forEach(button => button.addEventListener("click", () => {
      selectedStartMode = button.dataset.startMode;
      document.querySelectorAll("[data-start-mode]").forEach(item => { const selected = item === button; item.classList.toggle("is-selected", selected); item.setAttribute("aria-checked", String(selected)); });
      $("[data-practice-mode-information]").hidden = selectedStartMode !== "practice";
      $("[data-exam-mode-warning]").hidden = selectedStartMode !== "exam";
      $("[data-start-attempt]").textContent = selectedStartMode === "exam" ? "Start Exam Mode" : "Start Practice Mode";
      $("[data-start-attempt]").hidden = false;
      $("[data-start-actions]").hidden = false;
    }));
    $("[data-start-attempt]").addEventListener("click", () => {
      if (!selectedStartMode) return;
      $("[data-start-overlay]").classList.remove("is-open");
      if (modePickerForExistingAttempt && engine?.attempt) {
        if (modePickerHasProgress) {
          openModeChangeConfirmation(selectedStartMode, true);
          return;
        }
        modePickerForExistingAttempt = false;
        modePickerHasProgress = false;
        root.ExamAudio.pauseAll();
        startAttempt(selectedStartMode);
        return;
      }
      startAttempt(selectedStartMode);
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
    bindStartOverlay();
    const submitted = root.ExamStorage.loadSubmitted(paper.id);
    const draft = root.ExamStorage.loadDraft(paper.id);
    if (submitted?.status === "submitted" && submitted.result) {
      selectedStartMode = submitted.mode;
      $("[data-start-overlay]").classList.remove("is-open");
      engine.restoreSubmitted(submitted);
    } else {
      if (submitted) root.ExamStorage.deleteSubmitted(paper.id);
      if (draft?.mode === "practice") {
        engine.resume(draft);
        selectedStartMode = "practice";
        $("[data-start-overlay]").classList.remove("is-open");
      } else if (draft) root.ExamStorage.deleteDraft(paper.id);
    }
    renderCustomiseMenu();
    root.addEventListener("beforeunload", event => {
      if (engine.attempt?.mode === "exam" && engine.attempt.examStarted && engine.attempt.status === "active") {
        root.ExamStorage.deleteDraft(paper.id);
        event.preventDefault();
        event.returnValue = "";
        return;
      }
      root.ExamAudio.pauseAll();
      engine.destroy();
    });
  }

  root.ExamUI = { initialise };
  document.addEventListener("DOMContentLoaded", initialise);
})(window);
