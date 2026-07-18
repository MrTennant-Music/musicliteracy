const { useEffect, useId, useMemo, useRef, useState } = React;
const CORE = window.MILLIONAIRE_CORE;
const QUESTION_BANK = window.MILLIONAIRE_QUESTION_BANK || [];

// Replace these null paths when final, licensed audio is supplied. The generated
// hooks below keep the prototype responsive and never prevent gameplay.
window.MILLIONAIRE_SOUND_CONFIG = {
  openingTheme: null,
  backgroundSuspense: null,
  earlyQuestionMusic: null,
  middleQuestionMusic: null,
  lateQuestionMusic: null,
  question15Music: null,
  answerSelected: null,
  finalAnswerLocked: null,
  correctAnswer: null,
  incorrectAnswer: null,
  milestone: null,
  lifeline: null,
  millionVictory: null,
};

const SETTINGS_KEY = "mlh-millionaire-settings-v3";
const HISTORY_KEY = "mlh-millionaire-recent-games-v1";
const DEFAULT_SETTINGS = {
  soundEffects: true,
  backgroundMusic: true,
  reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false,
};
const MILLIONAIRE_LEVELS = {
  N3: { label: "National 3" },
  N4: { label: "National 4", disabled: true },
  N5: { label: "National 5", disabled: true },
  H: { label: "Higher", disabled: true },
  AH: { label: "Advanced Higher", disabled: true },
};
const CATEGORY_LABELS = { listening: "Listening", literacy: "Music literacy", concepts: "Musical concepts" };
const OUTCOME_LABELS = { incorrect: "Incorrect answer", won: "Won £1 million" };
const QUESTION_REWARDS = {
  5: { glyph: "🥉", label: "Bronze medal" },
  8: { glyph: "🥈", label: "Silver medal" },
  12: { glyph: "🥇", label: "Gold medal" },
  15: { glyph: "💎", label: "Diamond" },
};

function safeRead(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function midiFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

class AudioDirector {
  constructor() {
    this.context = null;
    this.background = null;
    this.backgroundGain = null;
    this.excerptNodes = [];
    this.excerptTimer = null;
    this.musicEnabled = false;
    this.effectsEnabled = true;
    this.stage = 1;
    this.excerptPlaying = false;
  }

  ensureContext() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (!this.context || this.context.state === "closed") this.context = new Context();
    this.context.resume?.().catch(() => {});
    return this.context;
  }

  configure(settings) {
    this.musicEnabled = Boolean(settings.backgroundMusic);
    this.effectsEnabled = Boolean(settings.soundEffects);
    if (!this.musicEnabled) this.stopBackground();
    else if (!this.excerptPlaying) this.startBackground(this.stage);
  }

  effect(name) {
    if (!this.effectsEnabled) return;
    const context = this.ensureContext();
    if (!context) return;
    const patterns = {
      openingTheme: [[392, 0, .12], [523.25, .13, .16], [659.25, .29, .34]],
      answerSelected: [[520, 0, .1]],
      finalAnswerLocked: [[220, 0, .18], [196, .2, .22]],
      correctAnswer: [[659.25, 0, .13], [783.99, .12, .13], [987.77, .24, .34]],
      incorrectAnswer: [[196, 0, .5], [146.83, .18, .58]],
      milestone: [[523.25, 0, .14], [659.25, .13, .14], [783.99, .26, .14], [1046.5, .4, .55]],
      lifeline: [[880, 0, .1], [660, .11, .16]],
      millionVictory: [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .7]],
    };
    const now = context.currentTime + .01;
    (patterns[name] || []).forEach(([frequency, offset, duration]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = name === "incorrectAnswer" ? "sawtooth" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(.055, now + offset + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + duration + .03);
    });
  }

  startBackground(stage = 1) {
    this.stage = stage;
    if (!this.musicEnabled || this.excerptPlaying) return;
    const context = this.ensureContext();
    if (!context) return;
    if (!this.background || !this.backgroundGain) {
      this.background = context.createOscillator();
      this.backgroundGain = context.createGain();
      this.background.type = "sine";
      this.backgroundGain.gain.value = .0001;
      this.background.connect(this.backgroundGain).connect(context.destination);
      this.background.start();
    }
    const frequency = stage >= 15 ? 82.41 : stage >= 11 ? 98 : stage >= 6 ? 110 : 130.81;
    this.background.frequency.setTargetAtTime(frequency, context.currentTime, .25);
    this.backgroundGain.gain.cancelScheduledValues(context.currentTime);
    this.backgroundGain.gain.setTargetAtTime(.018, context.currentTime, .35);
  }

  pauseBackground() {
    if (!this.backgroundGain || !this.context) return;
    this.backgroundGain.gain.cancelScheduledValues(this.context.currentTime);
    this.backgroundGain.gain.setTargetAtTime(.0001, this.context.currentTime, .08);
  }

  resumeBackground() {
    if (this.musicEnabled && !this.excerptPlaying) this.startBackground(this.stage);
  }

  stopBackground() {
    if (this.background) {
      try { this.background.stop(); } catch {}
    }
    this.background = null;
    this.backgroundGain = null;
  }

  stopExcerpt() {
    window.clearTimeout(this.excerptTimer);
    this.excerptNodes.forEach((node) => { try { node.stop(); } catch {} });
    this.excerptNodes = [];
    this.excerptPlaying = false;
    this.resumeBackground();
  }

  playGenerated(generator, onEnded) {
    const context = this.ensureContext();
    if (!context || !generator) return null;
    this.stopExcerpt();
    this.excerptPlaying = true;
    this.pauseBackground();
    const bpm = generator.bpm || 96;
    const beatSeconds = 60 / bpm;
    const start = context.currentTime + .05;
    const voices = generator.voices || [{
      notes: generator.notes || [], beats: generator.beats || [], gains: generator.gains,
      gain: generator.gain, gate: generator.gate, waveform: generator.waveform,
    }];
    let totalDuration = 0;
    voices.forEach((voice) => {
      let cursor = 0;
      (voice.notes || []).forEach((midi, index) => {
        const beats = voice.beats?.[index] || 1;
        const noteStart = start + cursor * beatSeconds;
        const noteDuration = beats * beatSeconds;
        const gate = voice.gate ?? generator.gate ?? .82;
        const peak = voice.gains?.[index] ?? voice.gain ?? generator.gains?.[index] ?? generator.gain ?? .14;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = voice.waveform || generator.waveform || "triangle";
        oscillator.frequency.setValueAtTime(midiFrequency(midi), noteStart);
        gain.gain.setValueAtTime(.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(Math.max(.002, peak), noteStart + .012);
        gain.gain.setValueAtTime(Math.max(.002, peak * .72), noteStart + Math.max(.02, noteDuration * gate * .7));
        gain.gain.exponentialRampToValueAtTime(.0001, noteStart + Math.max(.04, noteDuration * gate));
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + Math.max(.06, noteDuration * gate) + .03);
        this.excerptNodes.push(oscillator);
        cursor += beats;
      });
      totalDuration = Math.max(totalDuration, cursor * beatSeconds);
    });
    this.excerptTimer = window.setTimeout(() => {
      this.excerptNodes = [];
      this.excerptPlaying = false;
      this.resumeBackground();
      onEnded?.();
    }, (totalDuration + .12) * 1000);
    return totalDuration + .12;
  }

  destroy() {
    this.stopExcerpt();
    this.stopBackground();
    try { this.context?.close(); } catch {}
  }
}

function Dialog({ title, onClose, children, actions, wide = false }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocus = useRef(document.activeElement);

  useEffect(() => {
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])")];
    window.setTimeout(() => (focusable()[0] || dialog)?.focus(), 0);
    function onKeyDown(event) {
      if (event.key === "Escape") { event.preventDefault(); onClose?.(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return <div className="millionaire-dialog-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <section ref={dialogRef} className="millionaire-dialog" style={wide ? { width: "min(720px, 100%)" } : undefined} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex="-1">
      <h2 id={titleId}>{title}</h2>
      {children}
      {actions && <div className="millionaire-dialog-actions">{actions}</div>}
    </section>
  </div>;
}

function ToggleRow({ label, glyph, checked, onChange }) {
  return <button type="button" className="hub-toggle-row" aria-pressed={checked} onClick={onChange}>
    <span className="hub-toggle-label"><span className="hub-toggle-glyph" aria-hidden="true">{glyph}</span><span>{label}</span></span>
    <span className={`hub-toggle-track ${checked ? "is-on" : ""}`} aria-hidden="true"><span className="hub-toggle-thumb" /></span>
  </button>;
}

function CustomiseMenu({ settings, updateSetting }) {
  return <div className="millionaire-customise-menu">
    <ToggleRow label="Sound Effects" glyph={<img src="audio-svgrepo-com.svg" alt="" className="h-[36px] w-[36px] object-contain" />} checked={settings.soundEffects} onChange={() => updateSetting("soundEffects", !settings.soundEffects)} />
    <ToggleRow label="Background Music" glyph="♫" checked={settings.backgroundMusic} onChange={() => updateSetting("backgroundMusic", !settings.backgroundMusic)} />
  </div>;
}

const GLYPHS = {
  quarterNote: "\uE1D5",
  halfNote: "\uE1D3",
  wholeNote: "\uE1D2",
  dottedHalfNote: "\uE1D3\uE1E7",
  dynamicForte: "\uE522",
  dynamicPiano: "\uE520",
  barlineDouble: "\uE031",
  repeatRight: "\uE041",
};
const TIME_DIGITS = ["\uE080", "\uE081", "\uE082", "\uE083", "\uE084", "\uE085", "\uE086", "\uE087", "\uE088", "\uE089"];
const PITCH_INDEX = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7, D5: 8, E5: 9, F5: 10 };

function StaffNotation({ notation }) {
  const pitches = notation.kind === "note" ? [notation.pitch] : notation.pitches || [];
  const xStart = pitches.length === 1 ? 215 : 140;
  const gap = pitches.length > 1 ? Math.min(64, 245 / Math.max(1, pitches.length - 1)) : 0;
  return <div className="millionaire-staff" aria-hidden="true">
    <div className="millionaire-staff-lines" />
    <span className="millionaire-clef">{"\uE050"}</span>
    {notation.time && <span className="millionaire-ts-on-staff"><span>{TIME_DIGITS[notation.time[0]]}</span><span>{TIME_DIGITS[notation.time[1]]}</span></span>}
    {pitches.map((pitch, index) => {
      const y = 95 - (PITCH_INDEX[pitch] ?? 4) * 7;
      const x = xStart + index * gap;
      return <React.Fragment key={`${pitch}-${index}`}>
        {y >= 94 && <span className="millionaire-ledger" style={{ left: x, top: 95 }} />}
        <span className="millionaire-staff-note" style={{ left: x, top: y }}>{GLYPHS.quarterNote}</span>
      </React.Fragment>;
    })}
    <span className="millionaire-barline" />
  </div>;
}

function NotationView({ notation }) {
  if (!notation) return null;
  let content = null;
  if (notation.kind === "note" || notation.kind === "melody") content = <StaffNotation notation={notation} />;
  else if (notation.kind === "timeSignature") content = <span className="millionaire-time-signature"><span>{TIME_DIGITS[notation.top]}</span><span>{TIME_DIGITS[notation.bottom]}</span></span>;
  else if (notation.kind === "bar") content = <div style={{ display: "flex", alignItems: "center", gap: 24 }}><StaffNotation notation={{ kind: "melody", pitches: ["E4", "E4"], time: notation.time }} /><span className="millionaire-glyph-blank">?</span></div>;
  else content = <div className="millionaire-glyphs">{(notation.glyphs || []).map((glyph, index) => glyph === "blank" ? <span className="millionaire-glyph-blank" key={index}>?</span> : <span key={index}>{GLYPHS[glyph] || "?"}</span>)}</div>;
  return <div className="millionaire-notation" role="img" aria-label={notation.label || "Music notation"}>{content}</div>;
}

function QuestionImage({ image }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) return image ? <div className="millionaire-placeholder-note" role="status">The question image is unavailable. Use the accessible description: {image.alt || "No description supplied."}</div> : null;
  return <img src={image.src} alt={image.alt || "Question illustration"} onError={() => setFailed(true)} style={{ maxWidth: 520, maxHeight: 180, marginTop: 16, borderRadius: 10 }} />;
}

function AudioCard({ question, playsUsed, playing, progress, onPlay, learning = false }) {
  const remaining = Math.max(0, 3 - playsUsed);
  return <div className="millionaire-audio-card">
    <div className="millionaire-audio-row">
      <button type="button" className="millionaire-audio-button" onClick={() => onPlay(learning)} disabled={playing || (!learning && remaining === 0)} aria-label={learning ? "Replay listening excerpt" : `Play listening excerpt. ${remaining} plays remaining`}>
        <span aria-hidden="true">{playing ? "■" : "▶"}</span>{playing ? "Playing" : learning ? "Replay excerpt" : "Play excerpt"}
      </button>
      <span className="millionaire-audio-count">{learning ? "Learning replay" : `Plays remaining: ${remaining}`}</span>
    </div>
    <div className="millionaire-audio-track" role="progressbar" aria-label="Listening excerpt progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}><div className="millionaire-audio-progress" style={{ width: `${progress}%` }} /></div>
    {question.audio?.placeholder && <p className="millionaire-placeholder-note">Prototype generated musical example</p>}
  </div>;
}

function PrizeLadder({ currentIndex, correctCount, controls }) {
  return <aside className="millionaire-ladder" aria-label="Prize ladder">
    {controls}
    {[...CORE.PRIZE_LADDER].map((value, index) => ({ value, stage: index + 1 })).reverse().map(({ value, stage }) => {
      const classes = ["millionaire-prize-row"];
      const reward = QUESTION_REWARDS[stage];
      if (reward) classes.push("is-reward");
      if (stage === currentIndex + 1) classes.push("is-current");
      if (stage <= correctCount) classes.push("is-complete");
      const prizeLabel = value === 1000000 ? "£1 MILLION" : CORE.formatPrize(value);
      return <div key={stage} className={classes.join(" ")} aria-current={stage === currentIndex + 1 ? "step" : undefined}><span className="millionaire-prize-number">{stage}</span><span className="millionaire-prize-diamond" aria-hidden="true">◆</span><span className="millionaire-prize-value">{prizeLabel}</span>{reward && <span className="millionaire-prize-reward" role="img" aria-label={reward.label}>{reward.glyph}</span>}</div>;
    })}
  </aside>;
}

function ResultStat({ label, children }) {
  return <div className="millionaire-result-stat"><span>{label}</span><strong>{children}</strong></div>;
}

function App() {
  const [screen, setScreen] = useState("title");
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...safeRead(SETTINGS_KEY, {}) }));
  const [levelOpen, setLevelOpen] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(null);
  const [removedLetters, setRemovedLetters] = useState([]);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [lifelines, setLifelines] = useState({ fifty: true, hint: true, switch: true });
  const [records, setRecords] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [finalPrize, setFinalPrize] = useState(0);
  const [highestReached, setHighestReached] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [announcement, setAnnouncement] = useState("Welcome to Who Wants to Be a Millionaire.");
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const levelRef = useRef(null);
  const customiseRef = useRef(null);
  const lifelineRef = useRef(null);
  const audioDirector = useRef(new AudioDirector());
  const progressTimer = useRef(null);
  const gameSaved = useRef(false);
  const allowNavigation = useRef(false);

  const question = questions[currentIndex];
  const gameActive = (screen === "game" || screen === "milestone") && !outcome;
  const categorySummary = useMemo(() => CORE.categoryResults(records), [records]);

  window.MLH.useClickOutside(
    [levelRef, customiseRef],
    [() => setLevelOpen(false), () => setCustomiseOpen(false)],
  );

  useEffect(() => {
    const errors = CORE.validateQuestionBank(QUESTION_BANK);
    if (errors.length) console.error("Millionaire question-bank validation errors:", errors);
    else console.info(`Millionaire question bank validated: ${QUESTION_BANK.length} National 3 prototype questions.`);
  }, []);

  useEffect(() => {
    safeWrite(SETTINGS_KEY, settings);
    document.documentElement.classList.toggle("millionaire-reduced-motion", settings.reducedMotion);
    audioDirector.current.configure(settings);
  }, [settings]);

  useEffect(() => () => {
    window.clearInterval(progressTimer.current);
    audioDirector.current.destroy();
  }, []);

  useEffect(() => {
    audioDirector.current.stage = currentIndex + 1;
    if (screen === "game") audioDirector.current.startBackground(currentIndex + 1);
    else audioDirector.current.pauseBackground();
  }, [currentIndex, screen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, currentIndex]);

  useEffect(() => {
    function protectInternalNavigation(event) {
      if (!gameActive || allowNavigation.current) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.getAttribute("href") === "#") return;
      event.preventDefault();
      setPendingNavigation(anchor.href);
      setDialog({ type: "leave" });
    }
    document.addEventListener("click", protectInternalNavigation, true);
    return () => document.removeEventListener("click", protectInternalNavigation, true);
  }, [gameActive]);

  useEffect(() => {
    function onKeyDown(event) {
      if (dialog || helpOpen || customiseOpen || screen !== "game") return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      const key = event.key.toLowerCase();
      const answerMap = { a: "A", "1": "A", b: "B", "2": "B", c: "C", "3": "C", d: "D", "4": "D" };
      if (answerMap[key]) { event.preventDefault(); selectAnswer(answerMap[key]); }
      else if (event.key === "Enter") { event.preventDefault(); lockAnswer(); }
      else if (event.code === "Space" && question?.audio) { event.preventDefault(); playQuestionAudio(false); }
      else if (key === "l") { event.preventDefault(); lifelineRef.current?.querySelector("button:not(:disabled)")?.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function createQuestions() {
    const recentGames = safeRead(HISTORY_KEY, []);
    try {
      return CORE.composeGame(QUESTION_BANK, recentGames, Math.random, { level: "N3" });
    } catch (error) {
      console.error("Millionaire game composition failed.", error);
      return null;
    }
  }

  function resetQuestionState() {
    audioDirector.current.stopExcerpt();
    window.clearInterval(progressTimer.current);
    setSelectedLetter(null);
    setLocked(false);
    setRevealed(null);
    setRemovedLetters([]);
    setPlaysUsed(0);
    setAudioPlaying(false);
    setAudioProgress(0);
    setTransitioning(false);
  }

  function startGame() {
    const nextQuestions = createQuestions();
    if (!nextQuestions) {
      setDialog({ type: "error", message: "A complete National 3 game could not be prepared. Please reload and try again." });
      return;
    }
    gameSaved.current = false;
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setRecords([]);
    setCorrectCount(0);
    setOutcome(null);
    setFinalPrize(0);
    setHighestReached(1);
    setLifelines({ fifty: true, hint: true, switch: true });
    setStartedAt(Date.now());
    setFinishedAt(null);
    setMilestone(null);
    resetQuestionState();
    setScreen("game");
    setAnnouncement("Question 1 for £100.");
    audioDirector.current.effect("openingTheme");
    audioDirector.current.startBackground(1);
  }

  function quitGame() {
    resetQuestionState();
    audioDirector.current.stopBackground();
    setDialog(null);
    setPendingNavigation(null);
    setScreen("title");
  }

  function selectAnswer(letter) {
    if (locked || transitioning || removedLetters.includes(letter) || !question?.answers.some((answer) => answer.letter === letter)) return;
    setSelectedLetter(letter);
    setAnnouncement(`Answer ${letter} selected. Press Final Answer to lock it in.`);
    audioDirector.current.effect("answerSelected");
  }

  function currentRecord(isCorrect) {
    const pupil = question.answers.find((answer) => answer.letter === selectedLetter);
    const correct = question.answers.find((answer) => answer.letter === question.correctLetter);
    return {
      questionNumber: currentIndex + 1,
      question,
      category: question.category,
      concept: question.concept,
      pupilLetter: selectedLetter,
      pupilAnswer: pupil?.text || "Not answered",
      correctLetter: question.correctLetter,
      correctAnswer: correct?.text || "",
      correct: isCorrect,
    };
  }

  function lockAnswer() {
    if (!selectedLetter || locked || transitioning || !question) return;
    setLocked(true);
    setTransitioning(true);
    setAnnouncement(`Answer ${selectedLetter} locked.`);
    audioDirector.current.effect("finalAnswerLocked");
    const delay = settings.reducedMotion ? 80 : 850;
    window.setTimeout(() => {
      const isCorrect = selectedLetter === question.correctLetter;
      const record = currentRecord(isCorrect);
      setRecords((current) => [...current, record]);
      setRevealed(isCorrect ? "correct" : "incorrect");
      setTransitioning(false);
      if (isCorrect) handleCorrectAnswer(record);
      else handleIncorrectAnswer(record);
    }, delay);
  }

  function handleCorrectAnswer(record) {
    const nextCorrect = correctCount + 1;
    setCorrectCount(nextCorrect);
    setAnnouncement(`Correct. You have won ${CORE.formatPrize(CORE.PRIZE_LADDER[currentIndex])}.`);
    audioDirector.current.effect("correctAnswer");
    const delay = settings.reducedMotion ? 140 : 1050;
    window.setTimeout(() => {
      if (currentIndex === 14) {
        setOutcome("won");
        setFinalPrize(1000000);
        setHighestReached(15);
        setMilestone({ stage: 15, prize: 1000000, victory: true });
        setScreen("milestone");
        audioDirector.current.effect("millionVictory");
      } else if (nextCorrect === 5 || nextCorrect === 10) {
        const prize = CORE.PRIZE_LADDER[nextCorrect - 1];
        setMilestone({ stage: nextCorrect, prize, victory: false });
        setScreen("milestone");
        setAnnouncement(`Milestone reached: ${CORE.formatPrize(prize)}.`);
        audioDirector.current.effect("milestone");
      } else {
        goToQuestion(currentIndex + 1);
      }
    }, delay);
  }

  function handleIncorrectAnswer() {
    const prize = CORE.guaranteedPrize(correctCount);
    setOutcome("incorrect");
    setFinalPrize(prize);
    setHighestReached(currentIndex + 1);
    setAnnouncement(`Incorrect. The correct answer is ${question.correctLetter}.`);
    audioDirector.current.effect("incorrectAnswer");
    audioDirector.current.pauseBackground();
  }

  function goToQuestion(index) {
    resetQuestionState();
    setCurrentIndex(index);
    setHighestReached(index + 1);
    setScreen("game");
    setAnnouncement(`Question ${index + 1} for ${CORE.formatPrize(CORE.PRIZE_LADDER[index])}.`);
  }

  function continueMilestone() {
    if (milestone?.victory) finishGame("won", 1000000);
    else goToQuestion(currentIndex + 1);
  }

  function saveCompletedGame() {
    if (gameSaved.current) return;
    const recent = safeRead(HISTORY_KEY, []);
    const next = [...(Array.isArray(recent) ? recent : []), questions.map((item) => item.id)].slice(-5);
    safeWrite(HISTORY_KEY, next);
    gameSaved.current = true;
  }

  function finishGame(finalOutcome = outcome, prize = finalPrize) {
    audioDirector.current.stopExcerpt();
    audioDirector.current.stopBackground();
    const now = Date.now();
    setOutcome(finalOutcome);
    setFinalPrize(prize);
    setFinishedAt(now);
    setScreen("results");
    setDialog(null);
    saveCompletedGame();
    setAnnouncement(`Game complete. Final prize ${CORE.formatPrize(prize)}.`);
  }

  function useFiftyFifty() {
    if (!lifelines.fifty || locked || transitioning || !question) return;
    const removed = CORE.fiftyFifty(question);
    setRemovedLetters(removed);
    if (removed.includes(selectedLetter)) setSelectedLetter(null);
    setLifelines((current) => ({ ...current, fifty: false }));
    setAnnouncement(`50:50 used. Answers ${removed.join(" and ")} removed.`);
    audioDirector.current.effect("lifeline");
  }

  function useHint() {
    if (!lifelines.hint || locked || transitioning || !question) return;
    setLifelines((current) => ({ ...current, hint: false }));
    setDialog({ type: "hint" });
    setAnnouncement("Hint lifeline opened.");
    audioDirector.current.effect("lifeline");
  }

  function useSwitch() {
    if (!lifelines.switch || locked || transitioning || !question) return;
    const replacement = CORE.switchQuestion(QUESTION_BANK, questions, currentIndex + 1, question.level);
    if (!replacement) {
      setDialog({ type: "error", message: "A replacement question of the same difficulty is not available." });
      return;
    }
    resetQuestionState();
    setQuestions((current) => current.map((item, index) => index === currentIndex ? replacement : item));
    setLifelines((current) => ({ ...current, switch: false }));
    setAnnouncement(`Switch used. A replacement question has been selected for question ${currentIndex + 1}.`);
    audioDirector.current.effect("lifeline");
  }

  function playQuestionAudio(learning = false) {
    if (!question?.audio || audioPlaying || (!learning && playsUsed >= 3)) return;
    const duration = audioDirector.current.playGenerated(question.audio.generator, () => {
      window.clearInterval(progressTimer.current);
      setAudioPlaying(false);
      setAudioProgress(100);
      window.setTimeout(() => setAudioProgress(0), 350);
    });
    if (!duration) {
      setAnnouncement("The listening excerpt is unavailable. No play has been counted.");
      return;
    }
    if (!learning) setPlaysUsed((count) => count + 1);
    setAudioPlaying(true);
    setAudioProgress(0);
    const began = performance.now();
    window.clearInterval(progressTimer.current);
    progressTimer.current = window.setInterval(() => {
      const percent = Math.min(100, ((performance.now() - began) / (duration * 1000)) * 100);
      setAudioProgress(percent);
      if (percent >= 100) window.clearInterval(progressTimer.current);
    }, 80);
  }

  function confirmLeave() {
    allowNavigation.current = true;
    const target = pendingNavigation || "index.html";
    window.location.href = target;
  }

  const elapsedMs = Math.max(0, (finishedAt || Date.now()) - (startedAt || Date.now()));
  const misses = records.filter((record) => !record.correct).map((record) => record.concept);
  const lifelinesUsed = Object.values(lifelines).filter((available) => !available).length;

  function renderQuestionMedia(recordQuestion = question, learning = false) {
    return <>
      {(recordQuestion.type === "notation" || recordQuestion.type === "text-notation") && <NotationView notation={recordQuestion.notation} />}
      {recordQuestion.type === "image" && <QuestionImage image={recordQuestion.image} />}
      {recordQuestion.audio && <AudioCard question={recordQuestion} playsUsed={recordQuestion === question ? playsUsed : 0} playing={recordQuestion === question ? audioPlaying : false} progress={recordQuestion === question ? audioProgress : 0} onPlay={() => {
        if (recordQuestion === question) playQuestionAudio(learning);
        else {
          const duration = audioDirector.current.playGenerated(recordQuestion.audio.generator, () => {});
          if (!duration) setAnnouncement("The listening excerpt is unavailable.");
        }
      }} learning={learning} />}
    </>;
  }

  function TitleScreen() {
    return <section className="millionaire-screen">
      <img className="millionaire-opening-logo" src="millionairelogo.svg" alt="Who Wants to Be a Millionaire" />
      <p className="millionaire-screen-copy millionaire-opening-copy">Test your musical knowledge and climb the prize ladder to £1 million.</p>
      <div className="millionaire-opening-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-opening-play" onClick={() => setScreen("rules")}><span className="millionaire-opening-play-label">Rules</span></button>
        <button type="button" className="millionaire-primary millionaire-play millionaire-opening-play" onClick={startGame}><span className="millionaire-opening-play-label">Start</span></button>
      </div>
    </section>;
  }

  function RulesScreen() {
    return <section className="millionaire-screen"><div className="millionaire-setup-card millionaire-rules-card">
      <h2>RULES</h2>
      <div className="millionaire-rules-grid">
        <section className="millionaire-rules-section" aria-labelledby="millionaire-rules-gameplay">
          <h3 id="millionaire-rules-gameplay">Playing the game</h3>
          <div className="millionaire-game-rules-copy">
            <p>Answer 15 music questions which progressively get more challenging.</p>
            <p>Each question is multiple choice with four possible answers.</p>
            <p>Earn medals for reaching question milestones.</p>
          </div>
          <h4 className="millionaire-rewards-heading">Rewards</h4>
          <ul className="millionaire-rewards-list">
            {[15, 12, 8, 5].map((stage) => <li key={stage}><span>Question {stage}</span><span className="millionaire-reward-glyph" role="img" aria-label={QUESTION_REWARDS[stage].label}>{QUESTION_REWARDS[stage].glyph}</span></li>)}
          </ul>
        </section>
        <section className="millionaire-rules-section millionaire-lifeline-rules-section" aria-labelledby="millionaire-rules-lifelines">
          <h3 id="millionaire-rules-lifelines">Lifelines</h3>
          <ul className="millionaire-lifeline-rules">
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="50.50.svg" alt="" /></span><strong>50:50</strong><span>Removes two incorrect answers</span></li>
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="hint.svg" alt="" /></span><strong>Hint</strong><span>Gives you a clue about the question</span></li>
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="switch.svg" alt="" /></span><strong>Switch</strong><span>Replaces the current question with another of the same difficulty</span></li>
          </ul>
          <p className="millionaire-rules-note">Each lifeline can be used once during the game.</p>
        </section>
      </div>
      <div className="millionaire-rules-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-back-button" aria-label="Back" onClick={() => setScreen("title")}><img className="millionaire-back-icon" src="next.svg" alt="" /></button>
      </div>
    </div></section>;
  }

  function GameScreen() {
    if (!question) return null;
    return <div className="millionaire-game-grid">
      <section className="millionaire-play-area">
        <div className="millionaire-question-panel">
          <div className="millionaire-question-media">{renderQuestionMedia(question, outcome === "incorrect")}</div>
          <div className="millionaire-question-rail"><div className="millionaire-question-bar"><h2>{question.question}</h2></div></div>
        </div>
        <div className="millionaire-answers" role="group" aria-label="Answer choices">
          {[question.answers.slice(0, 2), question.answers.slice(2, 4)].map((answerRow, rowIndex) => <div className="millionaire-answer-row" role="presentation" key={rowIndex}>{answerRow.map((answer) => {
            const removed = removedLetters.includes(answer.letter);
            const isCorrect = revealed && answer.letter === question.correctLetter;
            const isIncorrect = revealed === "incorrect" && answer.letter === selectedLetter;
            const classes = ["millionaire-answer"];
            if (selectedLetter === answer.letter && !revealed) classes.push(locked ? "is-locked" : "is-selected");
            if (isCorrect) classes.push("is-correct");
            if (isIncorrect) classes.push("is-incorrect");
            if (removed) classes.push("is-removed");
            const status = isCorrect ? "✓" : isIncorrect ? "✕" : selectedLetter === answer.letter ? "Selected" : "";
            return <button key={answer.letter} type="button" className={classes.join(" ")} disabled={locked || transitioning || removed} tabIndex={removed ? -1 : undefined} aria-hidden={removed || undefined} aria-pressed={selectedLetter === answer.letter} onClick={() => selectAnswer(answer.letter)}>
              <span className="millionaire-answer-content"><span className="millionaire-answer-diamond" aria-hidden="true">◆</span><span className="millionaire-answer-letter">{answer.letter}:</span>{" "}<span className="millionaire-answer-text">{answer.text}</span></span><span className="millionaire-answer-status" aria-label={status || undefined}>{status}</span>
            </button>;
          })}</div>)}
        </div>
        {revealed === "incorrect" ? <>
          <div className="millionaire-explanation"><strong>Incorrect answer</strong>{question.explanation}</div>
          <div className="millionaire-actions"><button type="button" className="millionaire-secondary millionaire-quit" aria-label="Quit game and return to start" onClick={quitGame}>QUIT</button><button type="button" className="millionaire-primary" onClick={() => finishGame("incorrect", finalPrize)}>Continue to results</button></div>
        </> : <div className="millionaire-actions">
          <button type="button" className="millionaire-secondary millionaire-quit" aria-label="Quit game and return to start" onClick={quitGame}>QUIT</button>
          <button type="button" className="millionaire-primary millionaire-final-answer" disabled={!selectedLetter || locked || transitioning} onClick={lockAnswer}><span className="millionaire-final-answer-label">FINAL ANSWER</span></button>
        </div>}
      </section>
      <PrizeLadder currentIndex={currentIndex} correctCount={correctCount} controls={<div className="millionaire-lifelines millionaire-ladder-lifelines" ref={lifelineRef} aria-label="Lifelines">
        <button type="button" className={`millionaire-lifeline ${!lifelines.fifty ? "is-used" : ""}`} disabled={!lifelines.fifty || locked || transitioning} aria-label={`50:50 lifeline${!lifelines.fifty ? ", used" : ""}`} aria-pressed={!lifelines.fifty} onClick={useFiftyFifty}><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="50.50.svg" alt="" /></span></button>
        <button type="button" className={`millionaire-lifeline ${!lifelines.hint ? "is-used" : ""}`} disabled={!lifelines.hint || locked || transitioning} aria-label={`Hint lifeline${!lifelines.hint ? ", used" : ""}`} aria-pressed={!lifelines.hint} onClick={useHint}><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="hint.svg" alt="" /></span></button>
        <button type="button" className={`millionaire-lifeline ${!lifelines.switch ? "is-used" : ""}`} disabled={!lifelines.switch || locked || transitioning} aria-label={`Switch lifeline${!lifelines.switch ? ", used" : ""}`} aria-pressed={!lifelines.switch} onClick={useSwitch}><span className="millionaire-lifeline-badge"><img className="millionaire-lifeline-icon" src="switch.svg" alt="" /></span></button>
      </div>} />
    </div>;
  }

  function MilestoneScreen() {
    return <section className="millionaire-screen millionaire-celebration">
      <div className="millionaire-celebration-ring"><img src="./millionaire-icon.svg" alt="" /></div>
      <h2>{milestone?.victory ? "You win £1 million!" : "Congratulations!"}</h2>
      <p className="millionaire-celebration-prize">{milestone?.victory ? "You answered all 15 questions correctly." : `You have reached the ${CORE.formatPrize(milestone?.prize)} milestone.`}</p>
      <button type="button" className="millionaire-primary" onClick={continueMilestone}>{milestone?.victory ? "View results" : "Continue"}</button>
    </section>;
  }

  function ResultsScreen() {
    return <section className="millionaire-screen millionaire-results">
      <h2>Results</h2><div className="millionaire-result-prize">{CORE.formatPrize(finalPrize)}</div>
      <div className="millionaire-results-grid">
        <ResultStat label="Outcome">{OUTCOME_LABELS[outcome]}</ResultStat>
        <ResultStat label="Highest question">{highestReached} of 15</ResultStat>
        <ResultStat label="Correct answers">{records.filter((record) => record.correct).length} of 15</ResultStat>
        <ResultStat label="Attempted">{records.length}</ResultStat>
        <ResultStat label="Listening">{categorySummary.listening.correct}/{categorySummary.listening.attempted}</ResultStat>
        <ResultStat label="Music literacy">{categorySummary.literacy.correct}/{categorySummary.literacy.attempted}</ResultStat>
        <ResultStat label="Musical concepts">{categorySummary.concepts.correct}/{categorySummary.concepts.attempted}</ResultStat>
        <ResultStat label="Lifelines used">{lifelinesUsed} of 3</ResultStat>
        <ResultStat label="Total time">{formatTime(elapsedMs)}</ResultStat>
      </div>
      <div className="millionaire-concept-misses"><strong>Concepts answered incorrectly:</strong> {misses.length ? misses.map((item) => item.replaceAll("-", " ")).join(", ") : "None"}</div>
      <div className="millionaire-result-actions"><button type="button" className="millionaire-primary" onClick={startGame}>Play Again</button></div>
    </section>;
  }

  function ReviewScreen() {
    return <section className="millionaire-screen millionaire-review">
      <div className="millionaire-review-header"><h2>Answer review</h2><button type="button" className="millionaire-secondary" onClick={() => setScreen("results")}>Back to results</button></div>
      <div className="millionaire-review-list">{records.map((record) => <article className="millionaire-review-card" key={record.question.id}>
        <div className="millionaire-review-meta">Question {record.questionNumber} • {CATEGORY_LABELS[record.category]} • {record.concept.replaceAll("-", " ")}</div>
        <h3>{record.question.question}</h3>
        {(record.question.notation || record.question.image) && <div>{record.question.notation ? <NotationView notation={record.question.notation} /> : <QuestionImage image={record.question.image} />}</div>}
        <ul className="millionaire-review-options">{record.question.answers.map((answer) => <li key={answer.letter} className={`millionaire-review-option ${answer.letter === record.pupilLetter ? "is-pupil" : ""} ${answer.letter === record.correctLetter ? "is-right" : ""}`}>{answer.letter}: {answer.text}{answer.letter === record.pupilLetter ? " — your answer" : ""}{answer.letter === record.correctLetter ? " — correct" : ""}</li>)}</ul>
        <p className="millionaire-review-explanation"><strong>{record.correct ? "Correct." : "Incorrect."}</strong> {record.question.explanation}</p>
        {record.question.audio && <div className="millionaire-review-audio"><button type="button" className="millionaire-secondary" onClick={() => audioDirector.current.playGenerated(record.question.audio.generator, () => {})}>Replay excerpt</button></div>}
      </article>)}</div>
    </section>;
  }

  function CurrentScreen() {
    if (screen === "title") return <TitleScreen />;
    if (screen === "rules") return <RulesScreen />;
    if (screen === "game") return <GameScreen />;
    if (screen === "milestone") return <MilestoneScreen />;
    if (screen === "results") return <ResultsScreen />;
    return <ReviewScreen />;
  }

  return <div className={window.MLH.shell.pageShellClass} style={{ overflowX: "clip" }}>
    <window.MLH.AppHeader icon="millionaire-icon.svg" title="Who Wants to Be a Millionaire?" subtitle="Test your musical knowledge and climb the prize ladder to £1 million." profileLabel="National 3" profileUsesSharedSettings={false} />
    <div className="millionaire-page-content"><main className="millionaire-main-shell">
      <div className="millionaire-toolbar-wrap"><window.MLH.AppToolbar left={<div className="flex items-center gap-2">
        <div className="hub-menu-anchor relative" ref={levelRef}>
          <window.MLH.LevelButton icon={<img src="levels.svg" alt="" className="h-[26px] w-[26px]" />} activeLevel="N3" activeLabel="National 3" onClick={() => { setCustomiseOpen(false); setLevelOpen((open) => !open); }} dataMenuTrigger={true} />
          {levelOpen && <window.MLH.MenuPanel title="Level" position="left-0" dataMenuPanel={true}><window.MLH.LevelMenu activeLevel="N3" onSelect={() => setLevelOpen(false)} levels={MILLIONAIRE_LEVELS} /></window.MLH.MenuPanel>}
        </div>
        <div className="hub-menu-anchor relative" ref={customiseRef}><window.MLH.CustomiseButton icon={<img src="customise.svg" alt="" className="h-[26px] w-[26px]" />} onClick={() => { setLevelOpen(false); setCustomiseOpen((open) => !open); }} dataMenuTrigger={true} />{customiseOpen && <window.MLH.MenuPanel title="Customise" position="left-0" variant="customise" dataMenuPanel={true}><CustomiseMenu settings={settings} updateSetting={updateSetting} /></window.MLH.MenuPanel>}</div>
      </div>} feedback={null} right={null} /></div>
      <div className="millionaire-scroll"><div className="millionaire-stage"><div className="millionaire-board"><CurrentScreen /></div></div></div>
    </main></div>
    <div className="millionaire-legal-attribution">Unofficial educational classroom resource. Not affiliated with or endorsed by the owners of <em>Who Wants to Be a Millionaire?</em></div>
    <div className="millionaire-live-region" aria-live="polite" aria-atomic="true">{announcement}</div>

    {helpOpen && <Dialog title="Help and keyboard shortcuts" onClose={() => setHelpOpen(false)} actions={<button type="button" className="millionaire-primary" onClick={() => setHelpOpen(false)}>Close</button>}><dl className="millionaire-shortcuts"><dt>A–D or 1–4</dt><dd>Select an answer</dd><dt>Enter</dt><dd>Final Answer</dd><dt>Space</dt><dd>Play a listening excerpt</dd><dt>L</dt><dd>Focus the lifelines</dd><dt>Escape</dt><dd>Close an open pop-up</dd></dl><p>Choose an answer first, then press Final Answer. Each lifeline can be used once.</p></Dialog>}
    {dialog?.type === "hint" && <Dialog title="Hint" onClose={() => setDialog(null)} actions={<button type="button" className="millionaire-primary" onClick={() => setDialog(null)}>Return to question</button>}><p>{question?.tip}</p></Dialog>}
    {dialog?.type === "leave" && <Dialog title="Leave game?" onClose={() => { setDialog(null); setPendingNavigation(null); }} actions={<><button type="button" className="millionaire-secondary" onClick={() => { setDialog(null); setPendingNavigation(null); }}>Stay</button><button type="button" className="millionaire-danger" onClick={confirmLeave}>Leave game</button></>}><p>Are you sure you want to leave? Your current game will be lost.</p></Dialog>}
    {dialog?.type === "error" && <Dialog title="Game unavailable" onClose={() => setDialog(null)} actions={<button type="button" className="millionaire-primary" onClick={() => setDialog(null)}>Close</button>}><p>{dialog.message}</p></Dialog>}
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
window.dispatchEvent(new Event("millionaire-ready"));
