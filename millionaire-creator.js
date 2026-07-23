const CUSTOM_SETS = window.MILLIONAIRE_CUSTOM_SETS;
const CREATOR_RESUME_KEY = "mlh-millionaire-creator-resume";

function readCreatorResume() {
  try {
    const saved = JSON.parse(localStorage.getItem(CREATOR_RESUME_KEY) || "null");
    return saved && typeof saved.setId === "string" ? saved : null;
  } catch {
    return null;
  }
}

function clearCreatorResume() {
  try { localStorage.removeItem(CREATOR_RESUME_KEY); } catch {}
}

function CreatorDialog({ title, onClose, children, actions, destructive = false }) {
  const titleId = React.useId();
  const dialogRef = React.useRef(null);
  const previousFocus = React.useRef(document.activeElement);
  React.useEffect(() => {
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])")];
    window.setTimeout(() => (focusable()[0] || dialog)?.focus(), 0);
    function onKeyDown(event) {
      if (event.key === "Escape" && !destructive) { event.preventDefault(); onClose?.(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.({ preventScroll: true });
    };
  }, [onClose, destructive]);
  return <div className="millionaire-dialog-backdrop" onPointerDown={(event) => {
    if (event.target === event.currentTarget && !destructive) onClose?.();
  }}>
    <section ref={dialogRef} className="millionaire-dialog millionaire-creator-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex="-1">
      <h2 id={titleId}>{title}</h2>
      {children}
      <div className="millionaire-dialog-actions">{actions}</div>
    </section>
  </div>;
}

function CreatorFrame({ title, subtitle, onBack, children, actions = null, popover = false }) {
  const headingRef = React.useRef(null);
  React.useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [title]);
  const content = <>
    <header className="millionaire-creator-header">
      {!popover && <button type="button" className="millionaire-secondary millionaire-creator-main-menu" onClick={onBack}>← Back to Main Menu</button>}
      <div>
        <h2 ref={headingRef} tabIndex="-1">{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="millionaire-creator-header-actions">{actions}</div>
    </header>
    {children}
    {popover && <div className="millionaire-rules-actions millionaire-creator-library-back-actions">
      <button type="button" className="millionaire-secondary millionaire-play millionaire-opening-play millionaire-back-button millionaire-creator-main-menu" onClick={onBack}><span className="millionaire-opening-play-label">Back</span></button>
    </div>}
  </>;
  return <section className={`millionaire-creator-screen${popover ? " is-popover" : ""}`}>
    {popover ? <div className="millionaire-setup-card millionaire-rules-card millionaire-creator-library-card">{content}</div> : content}
  </section>;
}

function CreatorStatus({ children, role = "status" }) {
  return <div className="millionaire-creator-status" role={role}>{children}</div>;
}

function formatEditedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function questionState(question) {
  const issues = CUSTOM_SETS.validateQuestion(question);
  if (!CUSTOM_SETS.hasQuestionContent(question)) return { key: "empty", symbol: "○", label: "Empty" };
  if (issues.length) return { key: "incomplete", symbol: "!", label: "Incomplete — validation errors" };
  return { key: "complete", symbol: "✓", label: "Complete" };
}

function QuestionPreview({ question, number, compact = false }) {
  const imageUrl = React.useMemo(
    () => question.image?.blob instanceof Blob ? URL.createObjectURL(question.image.blob) : "",
    [question.image?.blob],
  );
  const audioUrl = React.useMemo(
    () => question.audio?.blob instanceof Blob ? URL.createObjectURL(question.audio.blob) : "",
    [question.audio?.blob],
  );
  React.useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  React.useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  const type = CUSTOM_SETS.TYPES[question.type] || CUSTOM_SETS.TYPES.text;
  return <article className={`millionaire-creator-preview${compact ? " is-compact" : ""}`}>
    <p className="millionaire-creator-preview-number">Question {number}</p>
    <div className="millionaire-question-panel millionaire-creator-question-panel">
      <div className="millionaire-question-media">
        {type.image && imageUrl && <img src={imageUrl} alt={question.imageAlt || "Question preview"} />}
        {type.audio && audioUrl && <audio controls preload="metadata" src={audioUrl} aria-label={`Audio for Question ${number}`} />}
      </div>
      <div className="millionaire-question-rail"><div className="millionaire-question-bar"><h3>{question.prompt || "Question text will appear here"}</h3></div></div>
    </div>
    <div className="millionaire-answers millionaire-creator-preview-answers" aria-label={`Answer preview for Question ${number}`}>
      {[question.answers.slice(0, 2), question.answers.slice(2, 4)].map((row, rowIndex) => <div className="millionaire-answer-row" key={rowIndex}>
        {row.map((answer, index) => {
          const answerIndex = rowIndex * 2 + index;
          return <div className={`millionaire-answer${answerIndex === question.correctAnswerIndex ? " is-creator-correct" : ""}`} key={answerIndex}>
            <span className="millionaire-answer-content"><span className="millionaire-answer-letter">{["A", "B", "C", "D"][answerIndex]}:</span><span>{answer || "Answer option"}</span></span>
          </div>;
        })}
      </div>)}
    </div>
    {question.hint && <p className="millionaire-creator-preview-hint"><strong>Hint:</strong> {question.hint}</p>}
  </article>;
}

function MediaEditor({ kind, media, altText, onChange, onAltChange, onError, onDuration }) {
  const inputRef = React.useRef(null);
  const previewUrl = React.useMemo(
    () => media?.blob instanceof Blob ? URL.createObjectURL(media.blob) : "",
    [media?.blob],
  );
  React.useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const isImage = kind === "image";
  const label = isImage ? "Image" : "Audio";
  const limit = isImage ? CUSTOM_SETS.LIMITS.imageBytes : CUSTOM_SETS.LIMITS.audioBytes;
  const accepted = isImage ? CUSTOM_SETS.IMAGE_MIME_TYPES : CUSTOM_SETS.AUDIO_MIME_TYPES;

  function chooseFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!accepted.includes(file.type)) {
      onError(`${file.name} is not a supported ${label.toLowerCase()} file.`);
      return;
    }
    if (!file.size || file.size > limit) {
      onError(`${label} files must be smaller than ${Math.round(limit / 1024 / 1024)} MB.`);
      return;
    }
    onChange({
      id: CUSTOM_SETS.uniqueId("media"),
      name: file.name,
      type: file.type,
      size: file.size,
      duration: null,
      blob: file,
    });
  }

  return <fieldset className="millionaire-media-editor">
    <legend>{label}</legend>
    <input ref={inputRef} type="file" accept={accepted.join(",")} hidden onChange={chooseFile} />
    {!media ? <button type="button" className="millionaire-secondary" onClick={() => inputRef.current?.click()}>Upload {label}</button> : <>
      <div className="millionaire-media-summary">
        <strong>{media.name}</strong>
        <span>{(media.size / 1024 / 1024).toFixed(2)} MB{!isImage && Number.isFinite(media.duration) ? ` • ${media.duration.toFixed(1)} seconds` : ""}</span>
      </div>
      {isImage && previewUrl && <img className="millionaire-media-preview-image" src={previewUrl} alt={altText || "Uploaded image preview"} />}
      {!isImage && previewUrl && <audio controls preload="metadata" src={previewUrl} aria-label="Preview uploaded audio" onLoadedMetadata={(event) => {
        const duration = event.currentTarget.duration;
        if (Number.isFinite(duration) && duration !== media.duration) onDuration(duration);
      }} />}
      <div className="millionaire-media-actions">
        <button type="button" className="millionaire-secondary" onClick={() => inputRef.current?.click()}>Replace</button>
        <button type="button" className="millionaire-secondary is-danger" onClick={() => onChange(null)}>Remove</button>
      </div>
    </>}
    {isImage && <label className="millionaire-creator-field">Image alternative text
      <input type="text" value={altText} onChange={(event) => onAltChange(event.target.value)} placeholder="Describe what pupils need to know from the image" />
    </label>}
  </fieldset>;
}

function CreatorInlineMedia({ question, onEditYoutube, onUpdate, onError }) {
  const imageInputRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const imageUrl = React.useMemo(
    () => question.type === "image" && question.image?.blob instanceof Blob ? URL.createObjectURL(question.image.blob) : "",
    [question.type, question.image?.blob],
  );
  React.useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  const youtubeUrl = question.type === "youtube" ? CUSTOM_SETS.youtubeEmbedUrl(question.youtubeUrl) : "";

  function useFile(file) {
    if (!file) return;
    const isImage = CUSTOM_SETS.IMAGE_MIME_TYPES.includes(file.type);
    if (!isImage) {
      onError("Choose a supported image file.");
      return;
    }
    const limit = CUSTOM_SETS.LIMITS.imageBytes;
    if (!file.size || file.size > limit) {
      onError(`Image files must be smaller than ${Math.round(limit / 1024 / 1024)} MB.`);
      return;
    }
    const media = {
      id: CUSTOM_SETS.uniqueId("media"),
      name: file.name,
      type: file.type,
      size: file.size,
      duration: null,
      blob: file,
    };
    onUpdate({ type: "image", image: media, audio: null, youtubeUrl: "" });
  }

  function useYoutubeLink(value) {
    const link = String(value || "").trim();
    if (!CUSTOM_SETS.youtubeVideoId(link)) return false;
    onUpdate({ type: "youtube", youtubeUrl: link, image: null, imageAlt: "", audio: null });
    return true;
  }

  function chooseFile(event) {
    useFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      useFile(file);
      return;
    }
    const link = event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain");
    if (!useYoutubeLink(link)) onError("Drop a supported image file or valid YouTube link.");
  }

  function handlePaste(event) {
    const link = event.clipboardData.getData("text/plain");
    if (!useYoutubeLink(link)) return;
    event.preventDefault();
  }

  if (imageUrl) return <div className="millionaire-creator-media-preview"><img src={imageUrl} alt={question.imageAlt || "Question image preview"} /></div>;
  if (youtubeUrl) return <div className="millionaire-creator-media-preview is-youtube"><iframe src={youtubeUrl} title="Question video preview" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><button type="button" className="millionaire-secondary" onClick={onEditYoutube}>Edit YouTube link</button></div>;
  return <div
    className={`millionaire-creator-empty-media${dragging ? " is-dragging" : ""}`}
    tabIndex="0"
    onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
    onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
    onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
    onDrop={handleDrop}
    onPaste={handlePaste}
    aria-label="Add an image or YouTube link"
  >
    <input ref={imageInputRef} type="file" accept={CUSTOM_SETS.IMAGE_MIME_TYPES.join(",")} hidden onChange={chooseFile} />
    <p className="millionaire-creator-drop-heading">Drag an image or YouTube link here</p>
    <div className="millionaire-creator-media-kinds">
      <button type="button" onClick={() => imageInputRef.current?.click()}><img src="image.svg" alt="" /><span>Image</span></button>
      <button type="button" onClick={() => { onUpdate({ type: "youtube", youtubeUrl: "", image: null, imageAlt: "", audio: null }); onEditYoutube(); }}><img src="youtube.svg" alt="" /><span>YouTube</span></button>
    </div>
  </div>;
}

function CreatorInlineEditor({
  set,
  questionIndex,
  variantIndex,
  setVariantIndex,
  setQuestionIndex,
  updateTitle,
  updateQuestion,
  onSave,
  onExit,
  onEditYoutube,
  onMediaError,
  onClear,
  onAddVariant,
  onToggleShuffle,
  PrizeLadderComponent,
}) {
  const variants = [set.questions[questionIndex], ...(set.variants?.[questionIndex] || [])];
  const question = variants[variantIndex] || variants[0];
  const completedStages = set.questions.slice(0, CUSTOM_SETS.QUESTION_COUNT)
    .flatMap((item, index) => [item, ...(set.variants?.[index] || [])].filter((variant) => CUSTOM_SETS.validateQuestion(variant).length === 0).length >= CUSTOM_SETS.MIN_COMPLETE_VARIANTS ? [index + 1] : []);
  const incompleteStages = set.questions.slice(0, CUSTOM_SETS.QUESTION_COUNT)
    .flatMap((item, index) => [item, ...(set.variants?.[index] || [])].some(CUSTOM_SETS.hasQuestionContent) && !completedStages.includes(index + 1) ? [index + 1] : []);
  const [toolbarReady, setToolbarReady] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(set.title);
  const [saveConfirmed, setSaveConfirmed] = React.useState(false);
  const saveConfirmationTimerRef = React.useRef(null);
  React.useEffect(() => { setToolbarReady(true); }, []);
  React.useEffect(() => { setTitleDraft(set.title); }, [set.id, set.title]);
  React.useEffect(() => () => window.clearTimeout(saveConfirmationTimerRef.current), []);
  const leftTarget = toolbarReady ? document.getElementById("millionaire-creator-toolbar-left") : null;
  const rightTarget = toolbarReady ? document.getElementById("millionaire-creator-toolbar-right") : null;
  const hasInsertedMedia = (question.type === "image" && Boolean(question.image?.blob))
    || (question.type === "audio" && Boolean(question.audio?.blob))
    || (question.type === "youtube" && Boolean(CUSTOM_SETS.youtubeVideoId(question.youtubeUrl)));
  const hintEditorId = `millionaire-creator-hint-${question.id}`;
  const hintEditorRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const editor = hintEditorRef.current;
    if (!editor) return;
    editor.style.height = "auto";
    editor.style.height = `${editor.scrollHeight}px`;
  }, [question.id, question.hint]);
  const focusHintEditor = () => document.getElementById(hintEditorId)?.focus();
  async function handleSave() {
    const saved = await onSave();
    if (!saved) return;
    window.clearTimeout(saveConfirmationTimerRef.current);
    setSaveConfirmed(true);
    saveConfirmationTimerRef.current = window.setTimeout(() => setSaveConfirmed(false), 1000);
  }

  const toolbar = <>
    {leftTarget && ReactDOM.createPortal(
      <>
        <label className="millionaire-creator-toolbar-name">
          <span className="millionaire-creator-toolbar-name-label">Name</span>
          <input
            className={`millionaire-creator-toolbar-title${titleDraft.length > 48 ? " is-very-long" : titleDraft.length > 30 ? " is-long" : ""}`}
            type="text"
            value={titleDraft}
            aria-label="Question set title"
            title="Edit the question set name"
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={(event) => {
              const title = event.target.value.trim() || "Untitled Set";
              setTitleDraft(title);
              if (title !== set.title) updateTitle(title);
            }}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
          />
        </label>
      </>,
      leftTarget,
    )}
    {rightTarget && ReactDOM.createPortal(
      <div className="millionaire-creator-toolbar-actions">
        <button type="button" className="millionaire-creator-toolbar-clear" disabled={!CUSTOM_SETS.hasQuestionContent(question)} onClick={onClear}>Clear</button>
        <button type="button" className={`is-primary millionaire-creator-toolbar-save${saveConfirmed ? " is-saved" : ""}`} onClick={handleSave}>{!saveConfirmed && <img src="save.svg" alt="" aria-hidden="true" />}<span>{saveConfirmed ? "Saved!" : "Save"}</span></button>
        <button type="button" className="is-primary millionaire-creator-toolbar-exit" onClick={onExit}>Exit</button>
      </div>,
      rightTarget,
    )}
  </>;

  const answerRows = [question.answers.slice(0, 2), question.answers.slice(2, 4)];
  const lifelines = <div className="millionaire-lifelines millionaire-ladder-lifelines" aria-label="Creator lifeline preview">
    <button type="button" className="millionaire-lifeline" disabled aria-label="50:50 unavailable in the editor"><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="50.50.svg" alt="" /></span></button>
    <button type="button" className="millionaire-lifeline" aria-label="Edit Hint" onClick={focusHintEditor}><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="hint.svg" alt="" /></span></button>
    <button type="button" className="millionaire-lifeline" disabled aria-label="Switch lifeline preview"><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="switch.svg" alt="" /></span></button>
  </div>;

  return <>
    {toolbar}
    <section className="millionaire-creator-game-editor" aria-label={`Editing ${set.title}, Question ${questionIndex + 1}, Variant ${variantIndex + 1}`}>
      <div className="millionaire-game-grid">
        <section className="millionaire-play-area">
          <div className="millionaire-question-panel">
            <label className="millionaire-inline-hint millionaire-creator-inline-hint-editor" htmlFor={hintEditorId}>
              <strong>Hint</strong>
              <textarea ref={hintEditorRef} id={hintEditorId} rows="1" value={question.hint} onChange={(event) => updateQuestion({ hint: event.target.value })} placeholder="Type the hint here" />
            </label>
            <div className="millionaire-question-media"><CreatorInlineMedia question={question} onEditYoutube={onEditYoutube} onUpdate={updateQuestion} onError={onMediaError} /></div>
            {hasInsertedMedia && <button type="button" className="millionaire-creator-remove-media" onClick={() => updateQuestion({ type: "text", image: null, imageAlt: "", audio: null, youtubeUrl: "" })}>Remove</button>}
            <div className="millionaire-question-rail"><div className="millionaire-question-bar">
              <textarea className="millionaire-creator-inline-question" aria-label="Question text" rows="1" value={question.prompt} onChange={(event) => updateQuestion({ prompt: event.target.value })} placeholder="Type the question here" />
            </div></div>
          </div>
          <div className="millionaire-answers millionaire-creator-inline-answers" role="group" aria-label="Editable answer choices">
            {answerRows.map((row, rowIndex) => <div className="millionaire-answer-row" key={rowIndex}>{row.map((answer, columnIndex) => {
              const answerIndex = rowIndex * 2 + columnIndex;
              const letter = ["A", "B", "C", "D"][answerIndex];
              const isCorrect = question.correctAnswerIndex === answerIndex;
              return <div className="millionaire-creator-answer-slot" key={letter}>
                <label className={`millionaire-answer${isCorrect ? " is-creator-correct" : ""}`}>
                  <span className="millionaire-answer-content">
                    <span className="millionaire-answer-diamond" aria-hidden="true">◆</span>
                    <span className="millionaire-answer-letter">{letter}:</span>
                    <input type="text" value={answer} onChange={(event) => {
                      const answers = [...question.answers];
                      answers[answerIndex] = event.target.value;
                      updateQuestion({ answers });
                    }} aria-label={`Answer ${letter}`} placeholder={`Answer ${letter}`} />
                  </span>
                </label>
                <button type="button" className={`millionaire-creator-correct-tick${isCorrect ? " is-active" : ""}`} aria-label={`Mark Answer ${letter} as correct`} aria-pressed={isCorrect} onClick={() => updateQuestion({ correctAnswerIndex: answerIndex })}>
                  <img src="tick.svg" alt="" aria-hidden="true" />
                </button>
              </div>;
            })}</div>)}
          </div>
          <div className="millionaire-creator-variant-bar" aria-label="Question variants">
            {variants.map((item, index) => <button type="button" key={item.id} className={index === variantIndex ? "is-current" : ""} onClick={() => setVariantIndex(index)}>Variant {index + 1}</button>)}
            {variants.length < CUSTOM_SETS.MAX_VARIANTS && <button type="button" className="millionaire-creator-add-variant" onClick={onAddVariant}><img src="plus.svg" alt="" aria-hidden="true" />Add variant</button>}
            <label className="millionaire-creator-shuffle-variants"><input type="checkbox" checked={Boolean(set.shuffleVariants?.[questionIndex])} onChange={(event) => onToggleShuffle(event.target.checked)} />Shuffle between variants</label>
          </div>
        </section>
        {PrizeLadderComponent && <PrizeLadderComponent currentIndex={questionIndex} correctCount={0} completedStages={completedStages} incompleteStages={incompleteStages} controls={lifelines} onSelect={setQuestionIndex} />}
      </div>
    </section>
  </>;
}

function MillionaireCreator({ onBack, onPlay, PrizeLadderComponent, onEditingChange }) {
  const repositoryRef = React.useRef(new CUSTOM_SETS.QuestionSetRepository());
  const [screen, setScreen] = React.useState("library");
  const [sets, setSets] = React.useState([]);
  const [currentSet, setCurrentSet] = React.useState(null);
  const currentSetRef = React.useRef(null);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [dialog, setDialog] = React.useState(null);
  const [status, setStatus] = React.useState("Loading question sets…");
  const [saveState, setSaveState] = React.useState("");
  const [dirtyVersion, setDirtyVersion] = React.useState(0);
  const [importResult, setImportResult] = React.useState(null);
  const [readinessOpenId, setReadinessOpenId] = React.useState(null);
  const importInputRef = React.useRef(null);
  const saveTimerRef = React.useRef(null);
  const enterEditor = () => {
    onEditingChange?.(true);
    setScreen("editor");
  };

  React.useEffect(() => { currentSetRef.current = currentSet; }, [currentSet]);
  React.useEffect(() => { onEditingChange?.(screen === "editor"); }, [screen, onEditingChange]);
  React.useEffect(() => () => onEditingChange?.(false), [onEditingChange]);
  React.useEffect(() => {
    async function initialiseCreator() {
      await refreshLibrary();
      const resume = readCreatorResume();
      if (!resume) return;
      try {
        const set = await repositoryRef.current.get(resume.setId);
        if (!set) {
          clearCreatorResume();
          return;
        }
        const restoredQuestionIndex = Math.min(Math.max(Number(resume.questionIndex) || 0, 0), set.questions.length - 1);
        setCurrentSet(set);
        currentSetRef.current = set;
        setQuestionIndex(restoredQuestionIndex);
        setDirtyVersion(0);
        setSaveState("Saved.");
        setStatus(`Editing “${set.title}”.`);
        enterEditor();
      } catch (error) {
        clearCreatorResume();
        handleError(error, "The game you were editing could not be reopened.");
      }
    }
    initialiseCreator();
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);
  React.useEffect(() => {
    if (screen !== "editor" || !currentSet?.id) return;
    try {
      localStorage.setItem(CREATOR_RESUME_KEY, JSON.stringify({ setId: currentSet.id, questionIndex }));
    } catch {}
  }, [screen, currentSet?.id, questionIndex]);
  React.useEffect(() => {
    if (!currentSet || screen !== "editor" || !dirtyVersion) return undefined;
    window.clearTimeout(saveTimerRef.current);
    setSaveState("Saving…");
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const saved = await repositoryRef.current.save(currentSetRef.current);
        currentSetRef.current = saved;
        setCurrentSet(saved);
        setSaveState("Saved.");
      } catch (error) {
        handleError(error, "Save failed. Your unsaved changes remain on this screen.");
        setSaveState("Save failed.");
      }
    }, 700);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [dirtyVersion, screen]);

  function handleError(error, message = null) {
    console.error("Millionaire custom-set error.", error);
    const storageMessage = error?.name === "QuotaExceededError"
      ? "Browser storage is full. Remove some saved media or download and delete an older set."
      : error?.message === "Browser storage is unavailable."
        ? "Browser storage is unavailable. Check that private browsing or browser settings are not blocking storage."
        : message || error?.message || "Something went wrong. Please try again.";
    setStatus(storageMessage);
  }

  async function refreshLibrary(message = "") {
    try {
      const next = await repositoryRef.current.list();
      setSets(next);
      setStatus(message || (next.length ? `${next.length} saved question set${next.length === 1 ? "" : "s"}.` : "No custom question sets have been saved yet."));
    } catch (error) {
      handleError(error);
    }
  }

  function updateCurrent(updater) {
    setCurrentSet((existing) => {
      const next = typeof updater === "function" ? updater(existing) : updater;
      currentSetRef.current = next;
      return next;
    });
    setDirtyVersion((version) => version + 1);
  }

  function updateQuestion(patch) {
    updateCurrent((set) => ({
      ...set,
      questions: set.questions.map((question, index) => index === questionIndex && variantIndex === 0 ? { ...question, ...patch } : question),
      variants: (set.variants || []).map((stageVariants, index) => index === questionIndex && variantIndex > 0
        ? stageVariants.map((question, index) => index === variantIndex - 1 ? { ...question, ...patch } : question)
        : stageVariants),
    }));
  }

  function updateTitle(title) {
    updateCurrent((set) => ({ ...set, title }));
  }

  async function flushSave() {
    window.clearTimeout(saveTimerRef.current);
    if (!currentSetRef.current) return null;
    setSaveState("Saving…");
    try {
      const saved = await repositoryRef.current.save(currentSetRef.current);
      currentSetRef.current = saved;
      setCurrentSet(saved);
      setSaveState("Saved.");
      return saved;
    } catch (error) {
      handleError(error, "Save failed. Your unsaved changes remain on this screen.");
      setSaveState("Save failed.");
      return null;
    }
  }

  function requestCreate() {
    setDialog({ type: "create", name: "" });
  }

  async function createNewSet() {
    const name = String(dialog.name || "").trim();
    if (!name) {
      setDialog((value) => ({ ...value, error: "Enter a name for the question set." }));
      return;
    }
    try {
      const saved = await repositoryRef.current.save(CUSTOM_SETS.createSet(name), { touch: false });
      setCurrentSet(saved);
      currentSetRef.current = saved;
      setQuestionIndex(0);
      setDirtyVersion(0);
      setSaveState("Saved.");
      setStatus(`Editing “${saved.title}”.`);
      setDialog(null);
      enterEditor();
      localStorage.setItem("mlh-millionaire-last-custom-set", saved.id);
    } catch (error) {
      handleError(error);
    }
  }

  async function editSet(id) {
    try {
      const set = await repositoryRef.current.get(id);
      if (!set) throw new Error("The question set could not be found.");
      setCurrentSet(set);
      currentSetRef.current = set;
      setQuestionIndex(0);
      setDirtyVersion(0);
      setSaveState("Saved.");
      setStatus(`Editing “${set.title}”.`);
      enterEditor();
      localStorage.setItem("mlh-millionaire-last-custom-set", set.id);
    } catch (error) {
      handleError(error);
    }
  }

  async function deleteSet() {
    try {
      await repositoryRef.current.delete(dialog.id);
      const title = dialog.title;
      setDialog(null);
      await refreshLibrary(`Deleted “${title}” and its stored media.`);
    } catch (error) {
      handleError(error);
    }
  }

  async function duplicateSet(id) {
    try {
      const copy = await repositoryRef.current.duplicate(id);
      await refreshLibrary(`Created “${copy.title}”.`);
    } catch (error) {
      handleError(error);
    }
  }

  async function downloadSet(id) {
    try {
      setStatus("Preparing download…");
      const set = await repositoryRef.current.get(id);
      if (!set) throw new Error("The question set could not be found.");
      const exported = await CUSTOM_SETS.exportSet(set);
      const url = URL.createObjectURL(exported.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exported.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`Downloaded “${set.title}”.`);
    } catch (error) {
      handleError(error, "The question set could not be downloaded.");
    }
  }

  async function playSet(id) {
    try {
      const set = await repositoryRef.current.get(id);
      if (!set) throw new Error("The question set could not be found.");
      const validation = CUSTOM_SETS.validateSet(set);
      if (!validation.valid) {
        setStatus(`“${set.title}” cannot be played until every ladder question has two complete variants.`);
        return;
      }
      await onPlay(set);
    } catch (error) {
      handleError(error, "The question set could not be started.");
    }
  }

  async function saveAndExit() {
    const saved = await flushSave();
    if (!saved) return;
    clearCreatorResume();
    setCurrentSet(null);
    currentSetRef.current = null;
    setScreen("library");
    await refreshLibrary(`Saved “${saved.title}”.`);
  }

  async function saveOnly() {
    return flushSave();
  }

  async function backToMain() {
    if (screen === "editor" && currentSetRef.current && dirtyVersion) {
      const saved = await flushSave();
      if (!saved) return;
    }
    clearCreatorResume();
    onBack();
  }

  function clearQuestion() {
    const question = variantIndex === 0 ? currentSet.questions[questionIndex] : currentSet.variants?.[questionIndex]?.[variantIndex - 1];
    if (!CUSTOM_SETS.hasQuestionContent(question)) return;
    updateCurrent((set) => ({
      ...set,
      questions: set.questions.map((item, index) => index === questionIndex && variantIndex === 0 ? CUSTOM_SETS.emptyQuestion(index + 1) : item),
      variants: (set.variants || []).map((stageVariants, index) => index === questionIndex && variantIndex > 0
        ? stageVariants.map((item, index) => index === variantIndex - 1 ? CUSTOM_SETS.emptyQuestion(questionIndex + 1) : item)
        : stageVariants),
    }));
  }

  function addVariant() {
    const stage = questionIndex;
    const nextVariantIndex = (currentSetRef.current.variants?.[stage] || []).length + 1;
    updateCurrent((set) => ({
      ...set,
      variants: (set.variants || []).map((stageVariants, index) => index === stage
        ? [...stageVariants, CUSTOM_SETS.emptyQuestion(stage + 1)]
        : stageVariants),
    }));
    setVariantIndex(nextVariantIndex);
  }

  function toggleShuffleVariants(checked) {
    updateCurrent((set) => ({
      ...set,
      shuffleVariants: (set.shuffleVariants || []).map((value, index) => index === questionIndex ? checked : value),
    }));
  }

  function requestDuplicateQuestion() {
    const firstEmpty = currentSet.questions.findIndex((question, index) => index !== questionIndex && !CUSTOM_SETS.hasQuestionContent(question));
    setDialog({ type: "duplicate-question", destination: firstEmpty >= 0 ? firstEmpty : (questionIndex + 1) % currentSet.questions.length });
  }

  function addReserveQuestion() {
    const nextIndex = currentSetRef.current.questions.length;
    updateCurrent((set) => ({
      ...set,
      questions: [...set.questions, CUSTOM_SETS.emptyQuestion(set.questions.length + 1)],
    }));
    setQuestionIndex(nextIndex);
    setStatus(`Added Reserve Question ${nextIndex - CUSTOM_SETS.QUESTION_COUNT + 1}.`);
  }

  function deleteReserveQuestion(removedIndex = questionIndex) {
    if (removedIndex < CUSTOM_SETS.QUESTION_COUNT) return;
    const reserveNumber = removedIndex - CUSTOM_SETS.QUESTION_COUNT + 1;
    const nextIndex = removedIndex < questionIndex
      ? questionIndex - 1
      : removedIndex === questionIndex
        ? Math.max(CUSTOM_SETS.QUESTION_COUNT - 1, Math.min(removedIndex, currentSetRef.current.questions.length - 2))
        : questionIndex;
    updateCurrent((set) => ({
      ...set,
      questions: set.questions
        .filter((_, index) => index !== removedIndex)
        .map((question, index) => ({ ...question, number: index + 1 })),
    }));
    setQuestionIndex(nextIndex);
    setStatus(`Deleted Reserve Question ${reserveNumber}.`);
  }

  function duplicateQuestionToDestination() {
    const destination = Number(dialog.destination);
    const targetHasContent = CUSTOM_SETS.hasQuestionContent(currentSet.questions[destination]);
    if (targetHasContent && !dialog.replaceConfirmed) {
      setDialog((value) => ({ ...value, replaceConfirmed: true }));
      return;
    }
    updateCurrent((set) => ({
      ...set,
      questions: set.questions.map((question, index) => index === destination
        ? CUSTOM_SETS.duplicateQuestion(set.questions[questionIndex], index + 1)
        : question),
    }));
    setQuestionIndex(destination);
    setDialog(null);
  }

  function focusValidationIssue(issue) {
    if (issue.questionNumber) {
      setQuestionIndex(issue.questionNumber - 1);
      window.setTimeout(() => document.querySelector(`[data-creator-field="${issue.field}"]`)?.focus(), 0);
    }
  }

  async function chooseImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".millionaire-set")) {
      setStatus("Choose a file ending in .millionaire-set.");
      return;
    }
    setStatus("Checking imported question set…");
    try {
      const result = await CUSTOM_SETS.importPackage(file);
      const collision = await repositoryRef.current.idExists(result.set.id);
      setImportResult({ ...result, collision });
      setScreen("import");
      setStatus("Import checked. Review the details before saving.");
    } catch (error) {
      handleError(error, "The selected file could not be imported.");
    }
  }

  async function commitImport(mode) {
    try {
      let set = importResult.set;
      if (mode === "copy") {
        set = CUSTOM_SETS.normaliseSet(set, { regenerateIds: true });
        set.title = `${importResult.set.title} – Copy`;
      }
      if (importResult.collision && mode !== "replace" && mode !== "copy") return;
      await repositoryRef.current.save(set, { touch: false });
      setImportResult(null);
      setScreen("library");
      await refreshLibrary(`Imported “${set.title}”.`);
    } catch (error) {
      handleError(error, "The imported set could not be saved.");
    }
  }

  function LibraryScreen() {
    return <CreatorFrame popover title="Create" onBack={backToMain}>
      <div className="millionaire-creator-library-layout">
        <section className="millionaire-creator-library-panel millionaire-creator-instructions" aria-labelledby="millionaire-creator-instructions-title">
          <h3 id="millionaire-creator-instructions-title">Instructions</h3>
          <div className="millionaire-creator-instructions-list">
            <p><strong>Create:</strong> Build 15 multiple-choice questions with four answers and one correct answer.</p>
            <p><strong>Add media:</strong> Use text, images, audio or a YouTube video.</p>
            <p><strong>Manage:</strong> Use the buttons beside a game to play, edit, duplicate, download or delete it.</p>
            <p><strong>Share:</strong> Complete all your questions, download your game file and share it with students. Pupils choose <strong>Create</strong>, then <strong>Import Game</strong>, select the file and press <strong>Play</strong>.</p>
            <p><strong>Save:</strong> Games are saved in this browser, so download your game sets before clearing browser data or moving to another device.</p>
          </div>
        </section>
        <section className="millionaire-creator-library-panel millionaire-created-games-panel" aria-labelledby="millionaire-created-games-title">
          <h3 id="millionaire-created-games-title">Created games</h3>
          <div className="millionaire-set-library">
            {sets.length ? sets.map((set) => {
              const summary = CUSTOM_SETS.setSummary(set);
              const incompleteCount = summary.incompleteCount;
              return <article className="millionaire-set-card" key={set.id}>
                <div className="millionaire-set-card-heading">
                  <div><h4 className={set.title.length > 24 ? "is-very-long" : set.title.length > 16 ? "is-long" : ""} title={set.title}>{set.title}</h4><p>Last edited {formatEditedDate(set.updatedAt)}</p></div>
                  {summary.playable
                    ? <span className="millionaire-readiness is-ready">Playable</span>
                    : <div className={`millionaire-readiness-tooltip-wrap${readinessOpenId === set.id ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="millionaire-readiness is-draft"
                        aria-expanded={readinessOpenId === set.id}
                        aria-describedby={`millionaire-readiness-tooltip-${set.id}`}
                        onClick={() => setReadinessOpenId((openId) => openId === set.id ? null : set.id)}
                        onBlur={() => setReadinessOpenId(null)}
                      >
                        Not playable
                      </button>
                      <div className="millionaire-readiness-tooltip" id={`millionaire-readiness-tooltip-${set.id}`} role="tooltip">
                        <span>{incompleteCount} {incompleteCount === 1 ? "question" : "questions"} incomplete</span>
                      </div>
                    </div>}
                </div>
                <div className="millionaire-set-actions">
                  <button type="button" className="millionaire-primary millionaire-set-icon-button" disabled={!summary.playable} aria-label="Play" title={!summary.playable ? "Complete two variants for each of the 15 questions before playing." : "Play"} onClick={() => playSet(set.id)}><img className="millionaire-set-action-icon" src="play.svg" alt="" /></button>
                  <button type="button" className="millionaire-secondary millionaire-set-icon-button" aria-label="Edit" title="Edit" onClick={() => editSet(set.id)}><img className="millionaire-set-action-icon" src="rename.svg" alt="" /></button>
                  <button type="button" className="millionaire-secondary millionaire-set-icon-button" aria-label="Duplicate" title="Duplicate" onClick={() => duplicateSet(set.id)}><img className="millionaire-set-action-icon" src="copy.svg" alt="" /></button>
                  <button type="button" className="millionaire-secondary millionaire-set-icon-button" aria-label="Download" title="Download" onClick={() => downloadSet(set.id)}><img className="millionaire-set-action-icon" src="download.svg" alt="" /></button>
                  <button type="button" className="millionaire-secondary millionaire-set-icon-button is-danger" aria-label="Delete" title="Delete" onClick={() => setDialog({ type: "delete", id: set.id, title: set.title })}><img className="millionaire-set-action-icon" src="bin.svg" alt="" /></button>
                </div>
              </article>;
            }) : <p className="millionaire-created-games-empty">Your created games will appear here.</p>}
          </div>
        </section>
      </div>
      <div className="millionaire-library-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-opening-play millionaire-import-button" onClick={() => importInputRef.current?.click()}><span className="millionaire-opening-play-label">Import Game</span></button>
        <button type="button" className="millionaire-primary millionaire-play millionaire-opening-play" onClick={requestCreate}><span className="millionaire-opening-play-label">Create Game</span></button>
        <input ref={importInputRef} hidden type="file" accept=".millionaire-set,application/zip" onChange={chooseImport} />
      </div>
    </CreatorFrame>;
  }

  function EditorScreen() {
    const question = currentSet.questions[questionIndex];
    const validation = CUSTOM_SETS.validateSet(currentSet);
    const type = CUSTOM_SETS.TYPES[question.type] || CUSTOM_SETS.TYPES.text;
    const editingLabel = questionIndex < CUSTOM_SETS.QUESTION_COUNT
      ? `Editing Question ${questionIndex + 1} of ${CUSTOM_SETS.QUESTION_COUNT}`
      : `Editing Reserve Question ${questionIndex - CUSTOM_SETS.QUESTION_COUNT + 1}`;
    return <CreatorFrame title={currentSet.title} subtitle={editingLabel} onBack={backToMain} actions={<span className={`millionaire-save-state is-${saveState.toLowerCase().replace(/[^a-z]+/g, "-")}`} aria-live="polite">{saveState}</span>}>
      <nav className="millionaire-question-navigator" aria-label="Question editor navigation">
        {currentSet.questions.map((item, index) => {
          const state = questionState(item);
          return <button type="button" key={item.id} className={`is-${state.key}${index === questionIndex ? " is-current" : ""}`} aria-current={index === questionIndex ? "step" : undefined} aria-label={`Question ${index + 1}: ${state.label}${index === questionIndex ? ", currently selected" : ""}`} title={`${index + 1}: ${state.label}`} onClick={() => setQuestionIndex(index)}>
            <span>{index + 1}</span><small aria-hidden="true">{state.symbol}</small>
          </button>;
        })}
      </nav>
      <div className="millionaire-editor-layout">
        <div className="millionaire-editor-form">
          <label className="millionaire-creator-field">Question type
            <select data-creator-field="type" value={question.type} onChange={(event) => updateQuestion({ type: event.target.value })}>
              {Object.entries(CUSTOM_SETS.TYPES).map(([value, record]) => <option value={value} key={value}>{record.label}</option>)}
            </select>
          </label>
          <label className="millionaire-creator-field">Question text
            <textarea data-creator-field="prompt" rows="3" value={question.prompt} onChange={(event) => updateQuestion({ prompt: event.target.value })} placeholder="Enter the question pupils will see" />
          </label>
          <fieldset className="millionaire-answer-editor" data-creator-field="answers" tabIndex="-1">
            <legend>Answers</legend>
            {question.answers.map((answer, index) => <div className="millionaire-answer-editor-row" key={index}>
              <label className="millionaire-correct-answer-radio"><input type="radio" name={`correct-${question.id}`} checked={question.correctAnswerIndex === index} onChange={() => updateQuestion({ correctAnswerIndex: index })} /> <span>Mark {["A", "B", "C", "D"][index]} as correct</span></label>
              <label><span>{["A", "B", "C", "D"][index]}</span><input type="text" value={answer} onChange={(event) => {
                const answers = [...question.answers];
                answers[index] = event.target.value;
                updateQuestion({ answers });
              }} placeholder={`Answer ${["A", "B", "C", "D"][index]}`} /></label>
            </div>)}
          </fieldset>
          <label className="millionaire-creator-field">Hint
            <textarea data-creator-field="hint" rows="2" value={question.hint} onChange={(event) => updateQuestion({ hint: event.target.value })} placeholder="This appears when the Hint lifeline is used" />
          </label>
          {(type.image || question.image) && <MediaEditor kind="image" media={question.image} altText={question.imageAlt} onAltChange={(imageAlt) => updateQuestion({ imageAlt })} onChange={(image) => updateQuestion({ image })} onError={setStatus} onDuration={() => {}} />}
          {(type.audio || question.audio) && <MediaEditor kind="audio" media={question.audio} altText="" onAltChange={() => {}} onChange={(audio) => updateQuestion({ audio })} onError={setStatus} onDuration={(duration) => updateQuestion({ audio: { ...question.audio, duration } })} />}
          <p className="millionaire-media-preservation-note">Changing question type does not delete uploaded media. Use Remove if you want to delete it from this question.</p>
        </div>
        <aside className="millionaire-editor-validation" aria-label="Set validation">
          <h3>Set progress</h3>
          <p><strong>{validation.mainCompleteCount}/{CUSTOM_SETS.QUESTION_COUNT}</strong> main questions complete</p>
          <p><strong>{validation.reserveCompleteCount}/{validation.reserveCount}</strong> reserve questions complete</p>
          {validation.valid ? <p className="is-valid">✓ This set is ready to play.</p> : <>
            <p className="is-invalid">! Complete the issues below before playing.</p>
            <ul>{validation.issues.map((issue, index) => <li key={`${issue.questionNumber}-${issue.field}-${index}`}><button type="button" onClick={() => focusValidationIssue(issue)}>{issue.message}</button></li>)}</ul>
          </>}
        </aside>
      </div>
      <div className="millionaire-editor-actions">
        <button type="button" className="millionaire-secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous Question</button>
        <button type="button" className="millionaire-secondary" disabled={questionIndex === currentSet.questions.length - 1} onClick={() => setQuestionIndex((index) => index + 1)}>Next Question</button>
        <button type="button" className="millionaire-secondary" onClick={requestDuplicateQuestion}>Duplicate Question</button>
        <button type="button" className="millionaire-secondary is-danger" disabled={!CUSTOM_SETS.hasQuestionContent(question)} onClick={clearQuestion}>Clear Question</button>
        <button type="button" className="millionaire-secondary" onClick={() => { setPreviewIndex(questionIndex); setScreen("preview-question"); }}>Preview Question</button>
        <button type="button" className="millionaire-secondary" onClick={() => setScreen("preview-set")}>Preview Full Set</button>
        <button type="button" className="millionaire-primary" onClick={saveAndExit}>Save and Exit</button>
      </div>
      <CreatorStatus>{status}</CreatorStatus>
    </CreatorFrame>;
  }

  function PreviewQuestionScreen() {
    return <CreatorFrame title="Preview Question" subtitle={`“${currentSet.title}” • Question ${previewIndex + 1}`} onBack={backToMain}>
      <QuestionPreview question={currentSet.questions[previewIndex]} number={previewIndex + 1} />
      <div className="millionaire-preview-actions">
        <button type="button" className="millionaire-secondary" disabled={previewIndex === 0} onClick={() => setPreviewIndex((index) => index - 1)}>Previous Question</button>
        <button type="button" className="millionaire-secondary" onClick={() => { setQuestionIndex(previewIndex); enterEditor(); }}>Back to Editor</button>
        <button type="button" className="millionaire-secondary" disabled={previewIndex === currentSet.questions.length - 1} onClick={() => setPreviewIndex((index) => index + 1)}>Next Question</button>
      </div>
    </CreatorFrame>;
  }

  function PreviewSetScreen() {
    return <CreatorFrame title="Preview Full Set" subtitle={`“${currentSet.title}” • Preview does not affect scores or progress.`} onBack={backToMain}>
      <div className="millionaire-full-set-preview">{currentSet.questions.map((question, index) => <QuestionPreview compact question={question} number={index + 1} key={question.id} />)}</div>
      <div className="millionaire-preview-actions"><button type="button" className="millionaire-secondary" onClick={enterEditor}>Back to Editor</button></div>
    </CreatorFrame>;
  }

  function ImportScreen() {
    const summary = importResult.summary;
    return <CreatorFrame title="Import Set" subtitle="Review this package before saving it to your library." onBack={backToMain}>
      <article className="millionaire-import-summary">
        <h3>{summary.title}</h3>
        <dl>
          <div><dt>Questions</dt><dd>{summary.questionCount}</dd></div>
          <div><dt>Images</dt><dd>{summary.imageCount}</dd></div>
          <div><dt>Audio files</dt><dd>{summary.audioCount}</dd></div>
          <div><dt>Videos</dt><dd>{summary.youtubeCount}</dd></div>
          <div><dt>Status</dt><dd>{summary.playable ? "Ready to play" : `${summary.mainCompleteCount}/${CUSTOM_SETS.QUESTION_COUNT} main • ${summary.reserveCompleteCount}/${summary.reserveCount} reserve complete`}</dd></div>
        </dl>
        {summary.warnings.length > 0 && <div className="millionaire-import-warnings"><h4>Warnings</h4><ul>{summary.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
        {importResult.collision && <p className="millionaire-import-collision"><strong>A set with this ID already exists.</strong> Choose whether to replace it or import a separate copy.</p>}
      </article>
      <div className="millionaire-preview-actions">
        <button type="button" className="millionaire-secondary" onClick={() => { setImportResult(null); setScreen("library"); }}>Cancel</button>
        {importResult.collision ? <>
          <button type="button" className="millionaire-secondary is-danger" onClick={() => commitImport("replace")}>Replace Existing Set</button>
          <button type="button" className="millionaire-primary" onClick={() => commitImport("copy")}>Import as a Copy</button>
        </> : <button type="button" className="millionaire-primary" onClick={() => commitImport("new")}>Import Set</button>}
      </div>
      <CreatorStatus>{status}</CreatorStatus>
    </CreatorFrame>;
  }

  const renderedScreen = screen === "editor" && currentSet ? <CreatorInlineEditor
    set={currentSet}
    questionIndex={questionIndex}
    variantIndex={variantIndex}
    setVariantIndex={setVariantIndex}
    setQuestionIndex={(index) => { setQuestionIndex(index); setVariantIndex(0); }}
    updateTitle={updateTitle}
    updateQuestion={updateQuestion}
    onSave={saveOnly}
    onExit={saveAndExit}
    onEditYoutube={() => setDialog({ type: "youtube" })}
    onMediaError={setStatus}
    onClear={clearQuestion}
    onAddVariant={addVariant}
    onToggleShuffle={toggleShuffleVariants}
    PrizeLadderComponent={PrizeLadderComponent}
  />
    : screen === "preview-question" && currentSet ? PreviewQuestionScreen()
      : screen === "preview-set" && currentSet ? PreviewSetScreen()
        : screen === "import" && importResult ? ImportScreen()
          : LibraryScreen();

  return <>
    {renderedScreen}
    {dialog?.type === "create" && <CreatorDialog title="Create Game" onClose={() => setDialog(null)} actions={<><button type="button" className="millionaire-secondary" onClick={() => setDialog(null)}>Cancel</button><button type="button" className="millionaire-primary" onClick={createNewSet}>Create</button></>}>
      <label className="millionaire-creator-field">Name<input type="text" value={dialog.name} placeholder="For example, S1 Orchestra" onChange={(event) => setDialog({ ...dialog, name: event.target.value, error: "" })} onKeyDown={(event) => { if (event.key === "Enter") createNewSet(); }} /></label>
      {dialog.error && <p className="millionaire-field-error" role="alert">{dialog.error}</p>}
    </CreatorDialog>}
    {dialog?.type === "delete" && <CreatorDialog destructive title="Delete Set" onClose={() => setDialog(null)} actions={<><button type="button" className="millionaire-secondary" onClick={() => setDialog(null)}>Cancel</button><button type="button" className="millionaire-primary is-danger" onClick={deleteSet}>Delete</button></>}>
      <p>Delete “{dialog.title}”? This cannot be undone unless you have downloaded a copy.</p>
    </CreatorDialog>}
    {dialog?.type === "duplicate-question" && <CreatorDialog title="Duplicate Question" onClose={() => setDialog(null)} actions={<><button type="button" className="millionaire-secondary" onClick={() => setDialog(null)}>Cancel</button><button type="button" className="millionaire-primary" onClick={duplicateQuestionToDestination}>{dialog.replaceConfirmed ? "Replace Question" : "Duplicate Question"}</button></>}>
      <label className="millionaire-creator-field">Destination
        <select value={dialog.destination} onChange={(event) => setDialog({ ...dialog, destination: Number(event.target.value), replaceConfirmed: false })}>
          {currentSet?.questions.map((question, index) => index !== questionIndex && <option value={index} key={question.id}>Question {index + 1}{CUSTOM_SETS.hasQuestionContent(question) ? " — contains content" : " — empty"}</option>)}
        </select>
      </label>
      {dialog.replaceConfirmed && <p className="millionaire-field-error" role="alert">Question {Number(dialog.destination) + 1} already contains content. Select Replace Question to overwrite it.</p>}
    </CreatorDialog>}
    {dialog?.type === "youtube" && currentSet && (() => {
      const question = currentSet.questions[questionIndex];
      const youtubeInvalid = question.youtubeUrl && !CUSTOM_SETS.youtubeVideoId(question.youtubeUrl);
      return <CreatorDialog title="YouTube" onClose={() => setDialog(null)} actions={<button type="button" className="millionaire-primary" onClick={() => setDialog(null)}>Done</button>}>
        <div className="millionaire-youtube-editor">
          <label className="millionaire-creator-field">Paste URL below:
            <input type="url" value={question.youtubeUrl} onChange={(event) => updateQuestion({ type: "youtube", youtubeUrl: event.target.value, image: null, imageAlt: "", audio: null })} placeholder="https://www.youtube.com/watch?v=…" />
          </label>
          {youtubeInvalid && <p className="millionaire-field-error" role="alert">Enter a valid YouTube video link.</p>}
        </div>
      </CreatorDialog>;
    })()}
  </>;
}

window.MillionaireCreator = MillionaireCreator;
