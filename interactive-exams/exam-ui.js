(function (root) {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    const bottomNext = $("[data-bottom-next-question]");
    const submits = [...document.querySelectorAll("[data-submit-paper]")];
    const nextDisabled = Boolean(engine.attempt.questionsLocked) && !complete;
    next.disabled = nextDisabled;
    bottomNext.disabled = nextDisabled;
    submits.forEach(submit => { submit.disabled = index === questions.length - 1 && !complete; });
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
    if (subquestion.type === "radio") return optionMarkup(subquestion, value, false);
    if (subquestion.type === "checkbox") return optionMarkup(subquestion, value, true);
    if (subquestion.type === "short-text" && subquestion.inlineAnswer) return `<div class="sentence-answer"><span>${paperTextMarkup(subquestion.inlineAnswer.before, subquestion.boldPhrases)}</span><label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><input id="${subquestion.id}" class="text-answer short-answer-line" type="text" value="${escapeHtml(value || "")}" autocomplete="off" /><span>${paperTextMarkup(subquestion.inlineAnswer.after, subquestion.boldPhrases)}</span></div>`;
    if (subquestion.type === "short-text" && subquestion.answerStyle === "reason") return `<label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><textarea id="${subquestion.id}" class="text-answer extended-answer-box" rows="4">${escapeHtml(value || "")}</textarea>`;
    if (subquestion.type === "short-text") return `<label class="visually-hidden" for="${subquestion.id}">${escapeHtml(subquestion.prompt)}</label><input id="${subquestion.id}" class="text-answer short-answer-line" type="text" value="${escapeHtml(value || "")}" autocomplete="off" />`;
    if (subquestion.type === "structured-review") {
      if (subquestion.roughWork && subquestion.finalAnswerField) {
        return `<div class="q8-answer-workspace"><section class="q8-rough-work" aria-labelledby="q8-rough-work-heading"><h3 id="q8-rough-work-heading">Rough work</h3><div class="q8-rough-work-table">${subquestion.headings.map(heading => `<label><span>${escapeHtml(heading.label)}</span><textarea data-heading="${heading.id}" aria-label="Rough work: ${escapeHtml(heading.label)}">${escapeHtml(value?.[heading.id] || "")}</textarea></label>`).join("")}</div></section><section class="q8-final-answer" aria-labelledby="q8-final-answer-heading"><h3 id="q8-final-answer-heading">Final answer</h3><label class="visually-hidden" for="${subquestion.id}-final">Final answer</label><textarea id="${subquestion.id}-final" data-heading="final" aria-label="Final answer">${escapeHtml(value?.final || "")}</textarea><p class="q8-end-paper">[END OF QUESTION PAPER]</p></section></div>`;
      }
      return `<div class="structured-answer">${subquestion.headings.map(heading => `<label><span>${escapeHtml(heading.label)}</span><textarea data-heading="${heading.id}" rows="4">${escapeHtml(value?.[heading.id] || "")}</textarea></label>`).join("")}</div>`;
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
      return `<p class="question-intro-mark-row"><span>${paperTextMarkup(text, question.introBoldPhrases)}</span><span class="question-intro-marks" aria-label="${marks} ${marks === 1 ? "mark" : "marks"}">${marks}</span></p>`;
    };
    if (!Array.isArray(question.introBulletRange)) return paragraphs.map(paragraphMarkup).join("");
    const [bulletStart, bulletEnd] = question.introBulletRange;
    return paragraphs.map((text, index) => {
      if (index === bulletStart) return `<ul class="question-intro-list">${paragraphs.slice(bulletStart, bulletEnd + 1).map(item => `<li>${paperTextMarkup(item, question.introBoldPhrases)}</li>`).join("")}</ul>`;
      if (index > bulletStart && index <= bulletEnd) return "";
      return paragraphMarkup(text, index);
    }).join("");
  }

  function questionOutroMarkup(question) {
    if (!question.outro) return "";
    return questionIntroMarkup({
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
        <div class="q7-prompt-row"><span>${escapeHtml(styleQuestion.label)}</span><span>${paperTextMarkup(styleQuestion.prompt, styleQuestion.boldPhrases)}</span><strong aria-label="${styleQuestion.marks} mark">${styleQuestion.marks}</strong></div>
        <div class="q7-prompt-row"><span>${escapeHtml(reasonQuestion.label)}</span><span>${paperTextMarkup(reasonQuestion.prompt, reasonQuestion.boldPhrases)}</span><strong aria-label="${reasonQuestion.marks} mark">${reasonQuestion.marks}</strong></div>
        <div class="q7-playback-lines">${styleQuestion.instructionLines.map(line => `<span>${escapeHtml(line)}</span>`).join("")}</div>
        <section class="subquestion q7-style-options" data-subquestion="${styleQuestion.id}">${inputMarkup(styleQuestion, styleValue)}</section>
        <section class="subquestion q7-reason-entry" data-subquestion="${reasonQuestion.id}"><label for="${reasonQuestion.id}"><span>Reason</span><textarea id="${reasonQuestion.id}" class="text-answer q7-reason-answer" rows="1">${escapeHtml(reasonValue || "")}</textarea></label></section>
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
        ${showHeading || headingQuestion || showMarks ? `<div class="subquestion-heading"><span class="subquestion-heading-label">${showHeading ? escapeHtml(subquestion.label) : ""}</span><div class="subquestion-heading-question">${headingQuestion}</div>${showMarks ? `<span class="subquestion-heading-marks ${subquestion.markAlign === "prompt-end" ? "is-prompt-end" : ""}" aria-label="${subquestion.marks} ${subquestion.marks === 1 ? "mark" : "marks"}">${subquestion.marks}</span>` : ""}</div>` : ""}
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
    if (subquestion.type === "radio") {
      card.querySelectorAll('input[type="radio"]').forEach(input => {
        const label = input.closest(".answer-option");
        input.addEventListener("change", () => {
          card.querySelectorAll(".answer-option").forEach(option => option.classList.toggle("is-selected", option.contains(input) && input.checked));
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
        engine.setAnswer(subquestion.id, checked.map(item => item.value));
      };
      card.querySelectorAll('input[type="checkbox"]').forEach(input => {
        const label = input.closest(".answer-option");
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
      input.addEventListener("input", () => engine.setAnswer(subquestion.id, input.value));
      bindRemovalGesture(input, () => {
        if (!input.value) return;
        input.value = "";
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
        textarea.addEventListener("input", updateStructuredAnswer);
        bindRemovalGesture(textarea, () => {
          if (!textarea.value) return;
          textarea.value = "";
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
    const questionCard = $("[data-single-question-area] .question-card");
    questionCard.className = `question-card question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""}`;
    $("[data-question-heading]").textContent = `Question ${question.number}`;
    $("[data-question-intro]").innerHTML = questionIntroMarkup(question);
    const parts = $("[data-subquestions]");
    parts.innerHTML = `${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}`;
    $("[data-question-outro]").innerHTML = questionOutroMarkup(question);
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
    previous.hidden = false;
    previous.disabled = index === 0;
    $("[data-bottom-previous-question]").hidden = false;
    $("[data-bottom-previous-question]").disabled = index === 0;
    if (index > 0) $("[data-previous-label]").textContent = "Previous";
    const isLastQuestion = index === visible.length - 1;
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
    showingAllQuestions = true;
    const singleArea = $("[data-single-question-area]");
    const allArea = $("[data-all-questions-area]");
    singleArea.hidden = true;
    allArea.hidden = false;
    allArea.innerHTML = engine.visibleQuestions().map(question => `<article class="question-card all-question-card question-${question.id} ${question.layout ? `question-layout-${question.layout}` : ""}" data-all-question="${question.id}">
      <div data-all-question-audio></div>
      <div class="paper-marks-heading">MARKS</div>
      <header class="question-header"><h2>Question ${question.number}</h2></header>
      <div class="question-intro">${questionIntroMarkup(question)}</div>
      <div class="subquestions">${contentHeadingMarkup(question)}${sharedNotationMarkup(question)}${subquestionsMarkup(question)}</div>
      <div class="question-outro">${questionOutroMarkup(question)}</div>
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
    $("[data-qr-subtitle]").textContent = "Scan to open this Digital Past Paper";
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
    $("[data-bottom-previous-question]").addEventListener("click", () => $("[data-previous-question]").click());
    $("[data-bottom-next-question]").addEventListener("click", () => $("[data-next-question]").click());
    document.querySelectorAll("[data-submit-paper]").forEach(submit => submit.addEventListener("click", openSubmitModal));
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
    $("[data-open-qr]").addEventListener("click", openQrOverlay);
    $("[data-close-qr]").addEventListener("click", closeQrOverlay);
    $("[data-copy-paper-link]").addEventListener("click", copyPaperLink);
    $("[data-qr-overlay]").addEventListener("click", event => { if (event.target === event.currentTarget) closeQrOverlay(); });
    $("[data-results-new-attempt]").addEventListener("click", () => {
      root.ExamStorage.deleteDraft(paper.id);
      startExam();
    });
    $("[data-continue-review]").addEventListener("click", () => $("[data-question-breakdown]").scrollIntoView({ behavior: "smooth" }));
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      closeSubmitModal();
      closeResetModal();
      closeQrOverlay();
      closePaperMenus();
    });
    root.addEventListener("beforeprint", renderPrintPaper);
    root.addEventListener("afterprint", () => { const printArea = $("[data-print-paper]"); if (printArea) printArea.innerHTML = ""; });
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
