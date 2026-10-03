const { useEffect, useRef, useState } = React;
const ROUND_BANKS = window.FAMILY_FORTUNES_ROUNDS_BY_LEVEL || { H: window.FAMILY_FORTUNES_ROUNDS || [] };
const CUSTOM_CATEGORY_STORAGE_KEY = "mlh-family-fortunes-custom-categories-v1";
const ROUND_OVERRIDE_STORAGE_KEY = "mlh-family-fortunes-round-overrides-v1";
const SELECTED_ROUNDS_STORAGE_KEY = "mlh-family-fortunes-selected-rounds-concept-recall-v1";
const OPTIONS_STORAGE_KEY = "mlh-family-fortunes-options-v1";
const TEAM_ROSTER_STORAGE_KEY = "mlh-family-fortunes-team-roster-v1";
const DEFAULT_TEAM_MEMBER_COUNT = 4;
const DEFAULT_ROUNDS_TO_PLAY = 5;
const MAX_ANSWERS_PER_QUESTION = 10;
const ANSWER_TIME_SECONDS = 60;
const LEVEL_MENU = {
  N3: { label: "National 3" },
  N4: { label: "National 4" },
  N5: { label: "National 5" },
  H: { label: "Higher" },
  AH: { label: "Advanced Higher" },
};
const cleanAnswer = window.FAMILY_FORTUNES_ANSWERS.normalize;
const capitalizeFirstLetter = (value) => String(value || "").replace(/^(\s*)(\p{L})/u, (_, leading, letter) => `${leading}${letter.toLocaleUpperCase("en-GB")}`);
function readGameOptions() {
  const requestedLevel = new URLSearchParams(window.location.search).get("level");
  const linkedLevel = LEVEL_MENU[requestedLevel] ? requestedLevel : null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(OPTIONS_STORAGE_KEY) || "null");
    const roundsToPlay = Number(stored?.roundsToPlay);
    return {
      level: linkedLevel || (LEVEL_MENU[stored?.level] ? stored.level : "H"),
      timer: typeof stored?.timer === "boolean" ? stored.timer : false,
      randomiseRounds: stored?.randomiseRounds === true,
      roundsToPlay: Number.isInteger(roundsToPlay) && roundsToPlay > 0 ? Math.max(3, roundsToPlay) : DEFAULT_ROUNDS_TO_PLAY,
    };
  } catch {
    return { level: linkedLevel || "H", timer: false, randomiseRounds: false, roundsToPlay: DEFAULT_ROUNDS_TO_PLAY };
  }
}
function createDefaultTeamRoster() {
  return { teamNames: ["", ""], teamMembers: Array.from({ length: 2 }, () => Array(DEFAULT_TEAM_MEMBER_COUNT).fill("")) };
}
function readTeamRoster() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TEAM_ROSTER_STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return createDefaultTeamRoster();
    const teamNames = Array.from({ length: 2 }, (_, team) => Array.isArray(saved.teamNames) && typeof saved.teamNames[team] === "string" ? saved.teamNames[team].slice(0, 22) : "");
    const teamMembers = Array.from({ length: 2 }, (_, team) => {
      const roster = Array.isArray(saved.teamMembers) && Array.isArray(saved.teamMembers[team]) ? saved.teamMembers[team] : null;
      return roster?.length ? roster.map((name) => typeof name === "string" ? name.slice(0, 32) : "") : Array(DEFAULT_TEAM_MEMBER_COUNT).fill("");
    });
    return { teamNames, teamMembers };
  } catch {
    return createDefaultTeamRoster();
  }
}
const shuffledIndexes = (length) => {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
};
function dealFaceoff(queues, members) {
  const nextQueues = queues.map((queue) => [...queue]);
  const players = members.map((roster, team) => {
    if (!nextQueues[team].length) nextQueues[team] = shuffledIndexes(roster.length);
    return nextQueues[team].shift();
  });
  return { players, queues: nextQueues };
}
function FamilyFortunesTimer({ seconds }) {
  const remaining = Math.max(0, Math.ceil(seconds));
  const progress = Math.max(0, Math.min(100, (seconds / ANSWER_TIME_SECONDS) * 100));
  return <div className="ff-question-timer" role="timer" aria-label={`${remaining} seconds remaining`}>
    <svg className="ff-question-timer-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="ff-question-timer-track" cx="50" cy="50" r="45" pathLength="100" />
      <circle className="ff-question-timer-progress" cx="50" cy="50" r="45" pathLength="100" style={{ strokeDashoffset: 100 - progress }} />
    </svg>
    <span>{remaining}</span>
  </div>;
}
function readCustomCategories() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CUSTOM_CATEGORY_STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((category) => category && typeof category.id === "string" && typeof category.name === "string" && Array.isArray(category.questions))
      .map((category) => ({
        id: category.id,
        name: category.name.slice(0, 40),
        questions: category.questions.filter((question) => question && typeof question.prompt === "string" && Array.isArray(question.answers))
          .map((question) => ({ prompt: question.prompt.slice(0, 180), answers: question.answers.filter((answer) => typeof answer === "string" && answer.trim()).slice(0, MAX_ANSWERS_PER_QUESTION).map((answer) => answer.slice(0, 70)) }))
          .filter((question) => question.prompt.trim() && question.answers.length >= 2),
      }))
      .filter((category) => category.name.trim() && category.questions.length);
  } catch {
    return [];
  }
}
const levelStorageKey = (key, level) => level === "H" ? key : `${key}-${level.toLowerCase()}`;
function readRoundOverrides(level = "H") {
  try {
    const saved = JSON.parse(window.localStorage.getItem(levelStorageKey(ROUND_OVERRIDE_STORAGE_KEY, level)) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).filter(([, round]) => round && typeof round === "object").map(([id, round]) => [id, {
      ...(typeof round.label === "string" ? { label: round.label.slice(0, 40) } : {}),
      ...(typeof round.prompt === "string" ? { prompt: round.prompt.slice(0, 180) } : {}),
      ...(Array.isArray(round.answers) ? { answers: round.answers.filter((answer) => typeof answer === "string").slice(0, MAX_ANSWERS_PER_QUESTION).map((answer) => answer.slice(0, 70)) } : {}),
    }]));
  } catch {
    return {};
  }
}
function readSelectedQuestionIds(availableIds, level = "H") {
  const defaultSelection = availableIds.filter((id) => id.startsWith("builtin-"));
  try {
    const saved = JSON.parse(window.localStorage.getItem(levelStorageKey(SELECTED_ROUNDS_STORAGE_KEY, level)) || "null");
    if (!Array.isArray(saved)) return defaultSelection;
    const selected = [...new Set(saved.filter((id) => typeof id === "string" && availableIds.includes(id)))];
    return selected;
  } catch {
    return defaultSelection;
  }
}

function FamilyFortunesGame() {
  const [screen, setScreen] = useState("setup");
  const [initialTeamRoster] = useState(readTeamRoster);
  const [teamNames, setTeamNames] = useState(initialTeamRoster.teamNames);
  const [teamMembers, setTeamMembers] = useState(initialTeamRoster.teamMembers);
  const [rosterError, setRosterError] = useState("");
  const [options, setOptions] = useState(readGameOptions);
  const level = options.level || "H";
  const roundBank = ROUND_BANKS[level] || ROUND_BANKS.H;
  const [customCategories, setCustomCategories] = useState(readCustomCategories);
  const [roundOverrides, setRoundOverrides] = useState(() => readRoundOverrides(level));
  const allQuestions = [
    ...roundBank.map((question) => {
      const id = question.id;
      return { ...question, ...roundOverrides[id], id };
    }),
    ...customCategories.flatMap((category) => category.questions.map((question, index) => {
      const id = `${category.id}-question-${index}`;
      return { ...question, id, label: category.questions.length > 1 ? `${category.name} · ${index + 1}` : category.name, ...roundOverrides[id], id };
    })),
  ];
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(() => readSelectedQuestionIds(allQuestions.map((question) => question.id), level));
  const orderedQuestions = [
    ...selectedQuestionIds.map((id) => allQuestions.find((question) => question.id === id)).filter(Boolean),
    ...allQuestions.filter((question) => !selectedQuestionIds.includes(question.id)),
  ];
  const [draggedRoundId, setDraggedRoundId] = useState(null);
  const [roundDropTarget, setRoundDropTarget] = useState(null);
  const roundsToPlay = Math.max(3, Math.min(options.roundsToPlay, selectedQuestionIds.length));
  const [roundLibraryError, setRoundLibraryError] = useState("");
  const [expandedRoundId, setExpandedRoundId] = useState(null);
  const [roundLibraryFadeVisible, setRoundLibraryFadeVisible] = useState(false);
  const [gameRounds, setGameRounds] = useState(roundBank);
  const [roundIndex, setRoundIndex] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [roundPoints, setRoundPoints] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState(null);
  const [roundEndCueRequested, setRoundEndCueRequested] = useState(false);
  const [roundEndMusicReady, setRoundEndMusicReady] = useState(false);
  const [answerSequencePlaying, setAnswerSequencePlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [strikes, setStrikes] = useState([0, 0]);
  const [stealRevealMode, setStealRevealMode] = useState(false);
  const [recentCorrectAnswerIndex, setRecentCorrectAnswerIndex] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [roundController, setRoundController] = useState(0);
  const [stealTeam, setStealTeam] = useState(null);
  const [memberQueues, setMemberQueues] = useState([[], []]);
  const [faceoffPlayers, setFaceoffPlayers] = useState([0, 0]);
  const [faceoffPhase, setFaceoffPhase] = useState("ready");
  const [spinningNames, setSpinningNames] = useState(["", ""]);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [faceoffCountdown, setFaceoffCountdown] = useState(3);
  const [faceoffAttemptTeam, setFaceoffAttemptTeam] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(ANSWER_TIME_SECONDS);
  const [answerTimerKey, setAnswerTimerKey] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [entry, setEntry] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackKind, setFeedbackKind] = useState("");
  const [overlay, setOverlay] = useState(null);
  const [answerKeyOpen, setAnswerKeyOpen] = useState(false);
  const [categoryNameDraft, setCategoryNameDraft] = useState("");
  const [questionDrafts, setQuestionDrafts] = useState([{ prompt: "", answers: ["", ""] }]);
  const [categoryError, setCategoryError] = useState("");
  const [levelOpen, setLevelOpen] = useState(false);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const levelRef = useRef(null);
  const customiseRef = useRef(null);
  const answerKeyPopoverRef = useRef(null);
  const answerKeyToggleRef = useRef(null);
  const roundLibraryScrollRef = useRef(null);
  const timerExpiredRef = useRef(false);
  const answerSequenceRef = useRef(false);
  const answerSequenceAudioRef = useRef(null);
  const roundEndCuePendingRef = useRef(false);
  const musicTrackRef = useRef(null);
  const soundEnabledRef = useRef(true);
  const audioElementsRef = useRef(new Set());
  const skipTeamRosterSaveRef = useRef(false);
  const round = gameRounds[roundIndex];
  const answerItems = round?.answers.map((answer, index) => ({ answer, index })) ?? [];
  const showAnswerKey = ["faceoff", "faceoff-choice", "game", "steal", "round-end"].includes(screen) && Boolean(round);
  const answerSplitIndex = Math.ceil(answerItems.length / 2);
  const answerGroups = answerItems.length > 5
    ? [answerItems.slice(0, answerSplitIndex), answerItems.slice(answerSplitIndex)]
    : [answerItems];
  const answerTotal = <div className="ff-round-count ff-round-total-count" aria-label={`Points bank: ${roundPoints}`}>Points bank: {roundPoints}</div>;
  const roundOver = screen === "round-end";
  const isFinalRound = roundIndex + 1 === gameRounds.length;
  const allRoundAnswersRevealed = Boolean(round) && round.answers.every((_, index) => revealed.includes(index));
  const activeLevelLabel = LEVEL_MENU[level].label;
  const customiseUnavailable = screen !== "setup";
  const createAudio = (source) => {
    const audio = new Audio(source);
    audio.muted = !soundEnabledRef.current;
    audioElementsRef.current.add(audio);
    return audio;
  };

  useEffect(() => {
    setAnswerKeyOpen(false);
  }, [screen, roundIndex]);

  useEffect(() => {
    if (roundOver && isFinalRound && allRoundAnswersRevealed) setScreen("final");
  }, [roundOver, isFinalRound, allRoundAnswersRevealed]);

  useEffect(() => {
    const scroller = roundLibraryScrollRef.current;
    if (overlay !== "round-library" || !scroller) {
      setRoundLibraryFadeVisible(false);
      return undefined;
    }
    const updateFade = () => {
      const shouldShow = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
      setRoundLibraryFadeVisible((current) => current === shouldShow ? current : shouldShow);
    };
    updateFade();
    scroller.addEventListener("scroll", updateFade, { passive: true });
    window.addEventListener("resize", updateFade);
    const observer = window.ResizeObserver ? new window.ResizeObserver(updateFade) : null;
    observer?.observe(scroller);
    if (scroller.firstElementChild) observer?.observe(scroller.firstElementChild);
    return () => {
      scroller.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
      observer?.disconnect();
    };
  }, [overlay, expandedRoundId, allQuestions.length, roundOverrides]);

  useEffect(() => {
    if (!answerKeyOpen) return undefined;
    const dismissOnOutsideClick = (event) => {
      if (answerKeyPopoverRef.current?.contains(event.target) || answerKeyToggleRef.current?.contains(event.target)) return;
      setAnswerKeyOpen(false);
    };
    document.addEventListener("pointerdown", dismissOnOutsideClick);
    return () => document.removeEventListener("pointerdown", dismissOnOutsideClick);
  }, [answerKeyOpen]);
  const releaseAudio = (audio) => {
    if (!audio) return;
    audio.pause();
    audio.src = "";
    audioElementsRef.current.delete(audio);
  };
  const toggleSound = () => {
    const enabled = !soundEnabledRef.current;
    soundEnabledRef.current = enabled;
    audioElementsRef.current.forEach((audio) => { audio.muted = !enabled; });
    setSoundEnabled(enabled);
  };
  const musicMode = answerSequencePlaying ? null
    : screen === "setup" ? "menu"
    : screen === "final" ? null
      : roundEndCueRequested ? roundEndMusicReady ? "menu" : null
        : screen === "steal" || (screen === "faceoff" && ["countdown", "typing", "buzzer"].includes(faceoffPhase)) ? "steal"
          : ["faceoff", "faceoff-choice", "game"].includes(screen) ? "game" : null;
  const roundEndCueMode = answerSequencePlaying ? null
    : screen === "final" ? "final"
      : roundEndCueRequested && !isFinalRound ? "round" : null;

  useEffect(() => {
    try { window.localStorage.setItem(CUSTOM_CATEGORY_STORAGE_KEY, JSON.stringify(customCategories)); } catch { /* Storage may be unavailable for private file origins. */ }
  }, [customCategories]);

  useEffect(() => {
    try { window.localStorage.setItem(levelStorageKey(ROUND_OVERRIDE_STORAGE_KEY, level), JSON.stringify(roundOverrides)); } catch { /* Storage may be unavailable for private file origins. */ }
  }, [roundOverrides, level]);

  useEffect(() => {
    try { window.localStorage.setItem(levelStorageKey(SELECTED_ROUNDS_STORAGE_KEY, level), JSON.stringify(selectedQuestionIds)); } catch { /* Storage may be unavailable for private file origins. */ }
  }, [selectedQuestionIds, level]);

  useEffect(() => {
    try { window.localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options)); } catch { /* Storage may be unavailable for private file origins. */ }
  }, [options]);

  useEffect(() => {
    if (skipTeamRosterSaveRef.current) {
      skipTeamRosterSaveRef.current = false;
      return;
    }
    try { window.localStorage.setItem(TEAM_ROSTER_STORAGE_KEY, JSON.stringify({ teamNames, teamMembers })); } catch { /* Storage may be unavailable for private file origins. */ }
  }, [teamNames, teamMembers]);

  useEffect(() => {
    if (!musicMode) return undefined;
    const playbackEvents = ["pointerdown", "touchend", "click", "keydown"];
    if (musicMode === "steal") {
      let activeTrack = createAudio("./familyfortunes-audio/steal.mp3");
      let nextTrack = createAudio("./familyfortunes-audio/steal.mp3");
      [activeTrack, nextTrack].forEach((track) => { track.preload = "auto"; track.loop = false; });
      activeTrack.volume = 1;
      nextTrack.volume = 0;
      let crossfading = false;
      let animationFrame = null;
      const startTrack = () => {
        if (activeTrack.paused) activeTrack.play().catch(() => {});
      };
      const updateCrossfade = () => {
        const duration = activeTrack.duration;
        if (!crossfading && Number.isFinite(duration) && duration > 3 && duration - activeTrack.currentTime <= 3) {
          crossfading = true;
          nextTrack.currentTime = 0;
          nextTrack.volume = 0;
          nextTrack.play().catch(() => { crossfading = false; });
        }
        if (crossfading && Number.isFinite(duration) && duration > 3) {
          const progress = Math.max(0, Math.min(1, (activeTrack.currentTime - (duration - 3)) / 3));
          activeTrack.volume = 1 - progress;
          nextTrack.volume = progress;
        }
        animationFrame = window.requestAnimationFrame(updateCrossfade);
      };
      const handleEnded = (event) => {
        if (event.currentTarget !== activeTrack) return;
        activeTrack.pause();
        activeTrack.currentTime = 0;
        activeTrack.volume = 0;
        [activeTrack, nextTrack] = [nextTrack, activeTrack];
        activeTrack.volume = 1;
        nextTrack.volume = 0;
        crossfading = false;
        startTrack();
      };
      activeTrack.addEventListener("ended", handleEnded);
      nextTrack.addEventListener("ended", handleEnded);
      startTrack();
      animationFrame = window.requestAnimationFrame(updateCrossfade);
      playbackEvents.forEach((eventType) => window.addEventListener(eventType, startTrack));
      return () => {
        playbackEvents.forEach((eventType) => window.removeEventListener(eventType, startTrack));
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        activeTrack.removeEventListener("ended", handleEnded);
        nextTrack.removeEventListener("ended", handleEnded);
        [activeTrack, nextTrack].forEach(releaseAudio);
      };
    }
    const track = createAudio(`./familyfortunes-audio/${musicMode === "menu" ? "1theme.mp3" : "headtohead.mp3"}`);
    track.loop = true;
    track.preload = "auto";
    musicTrackRef.current = track;
    const startTrack = () => {
      if (track.paused) track.play().catch(() => {});
    };
    startTrack();
    playbackEvents.forEach((eventType) => window.addEventListener(eventType, startTrack));
    return () => {
      playbackEvents.forEach((eventType) => window.removeEventListener(eventType, startTrack));
      track.currentTime = 0;
      releaseAudio(track);
      if (musicTrackRef.current === track) musicTrackRef.current = null;
    };
  }, [musicMode]);

  useEffect(() => {
    if (!roundEndCueMode) return undefined;
    const cue = createAudio("./familyfortunes-audio/win-round.mp3");
    const audienceCue = createAudio("./familyfortunes-audio/audience.mp3");
    cue.preload = "auto";
    audienceCue.preload = "auto";
    audienceCue.volume = 0.5;
    let finished = false;
    const finishCue = () => {
      if (finished) return;
      finished = true;
      setRoundEndMusicReady(true);
    };
    cue.addEventListener("ended", finishCue);
    cue.addEventListener("error", finishCue);
    cue.play().catch(finishCue);
    audienceCue.play().catch(() => {});
    return () => {
      cue.removeEventListener("ended", finishCue);
      cue.removeEventListener("error", finishCue);
      releaseAudio(cue);
      releaseAudio(audienceCue);
    };
  }, [roundEndCueMode]);

  useEffect(() => {
    if (!overlay) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setOverlay(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [overlay]);

  window.MLH.useClickOutside(
    [levelRef, customiseRef],
    [() => setLevelOpen(false), () => setCustomiseOpen(false)],
  );

  const showOverlay = (nextOverlay) => {
    setLevelOpen(false);
    setCustomiseOpen(false);
    setOverlay(nextOverlay);
  };

  const openRosterSetup = () => {
    const savedRoster = readTeamRoster();
    setTeamNames(savedRoster.teamNames);
    setTeamMembers(savedRoster.teamMembers);
    setRosterError("");
    showOverlay("roster");
  };

  const changeTeamName = (team, value) => setTeamNames((names) => names.map((name, index) => index === team ? capitalizeFirstLetter(value) : name));
  const updateTeamMember = (team, member, value) => setTeamMembers((rosters) => rosters.map((roster, index) => index === team ? roster.map((name, item) => item === member ? capitalizeFirstLetter(value) : name) : roster));
  const addTeamMember = (team) => setTeamMembers((rosters) => rosters.map((roster, index) => index === team ? [...roster, ""] : roster));
  const removeTeamMember = (team, member) => setTeamMembers((rosters) => rosters.map((roster, index) => index === team && roster.length > 1 ? roster.filter((_, item) => item !== member) : roster));

  const beginGame = (event) => {
    event?.preventDefault();
    const availableRounds = selectedQuestionIds.map((id) => allQuestions.find((question) => question.id === id)).filter(Boolean);
    if (availableRounds.length < 3) {
      setRosterError("Choose at least 3 rounds in Edit Rounds before you play.");
      return;
    }
    const invalidRound = availableRounds.find((question) => !question.label?.trim() || !question.prompt.trim() || question.answers.length < 2 || question.answers.length > MAX_ANSWERS_PER_QUESTION || question.answers.some((answer) => !answer.trim()) || new Set(question.answers.map(cleanAnswer)).size !== question.answers.length);
    if (invalidRound) {
      setRoundLibraryError(`Complete “${invalidRound.label || "Untitled round"}” with a question and 2–${MAX_ANSWERS_PER_QUESTION} different answers before starting.`);
      setOverlay("round-library");
      return;
    }
    const namedMembers = teamMembers.map((roster) => roster.map((name) => name.trim()).filter(Boolean));
    if (namedMembers.some((roster) => !roster.length)) {
      setRosterError("Enter at least one member name for each team.");
      return;
    }
    const namedTeams = teamNames.map((name, index) => name.trim() || `Team ${index + 1}`);
    skipTeamRosterSaveRef.current = teamNames.some((name, index) => name !== namedTeams[index]);
    const shuffledQueues = namedMembers.map((roster) => shuffledIndexes(roster.length));
    const firstDeal = dealFaceoff(shuffledQueues, namedMembers);
    setTeamNames(namedTeams);
    setTeamMembers(namedMembers);
    const orderedRounds = options.randomiseRounds ? shuffledIndexes(availableRounds.length).map((index) => availableRounds[index]) : availableRounds;
    setGameRounds(orderedRounds.slice(0, roundsToPlay));
    setScores([0, 0]);
    setRoundIndex(0);
    setRoundPoints(0);
    setLastRoundResult(null);
    setRoundEndCueRequested(false);
    setRoundEndMusicReady(false);
    setRoundController(0);
    setStealTeam(null);
    setStrikes([0, 0]);
    setStealRevealMode(false);
    setRevealed([]);
    setRecentCorrectAnswerIndex(null);
    setEntry("");
    setFeedback("");
    setFeedbackKind("");
    setMemberQueues(firstDeal.queues);
    setFaceoffPlayers(firstDeal.players);
    setFaceoffPhase("ready");
    setSpinningNames(namedTeams);
    setTypedPrompt("");
    setFaceoffAttemptTeam(null);
    setRosterError("");
    setLevelOpen(false);
    setCustomiseOpen(false);
    setOverlay(null);
    setScreen("faceoff");
  };

  const resetGame = () => {
    const savedRoster = readTeamRoster();
    setTeamNames(savedRoster.teamNames);
    setTeamMembers(savedRoster.teamMembers);
    setScores([0, 0]);
    setRoundIndex(0);
    setRoundPoints(0);
    setLastRoundResult(null);
    setRoundEndCueRequested(false);
    setRoundEndMusicReady(false);
    setRoundController(0);
    setStealTeam(null);
    setStrikes([0, 0]);
    setStealRevealMode(false);
    setRevealed([]);
    setRecentCorrectAnswerIndex(null);
    setEntry("");
    setFeedback("");
    setFeedbackKind("");
    setFaceoffPhase("ready");
    setTypedPrompt("");
    setFaceoffAttemptTeam(null);
    setScreen("setup");
  };

  const moveRound = (id, targetId) => {
    setSelectedQuestionIds((current) => {
      const from = current.indexOf(id);
      const to = current.indexOf(targetId);
      if (from < 0 || to < 0 || from === to) return current;
      const reordered = [...current];
      reordered.splice(from, 1);
      reordered.splice(to, 0, id);
      return reordered;
    });
  };
  const finishRoundDrag = () => {
    setDraggedRoundId(null);
    setRoundDropTarget(null);
  };
  const toggleQuestion = (id) => {
    if (selectedQuestionIds.includes(id) && selectedQuestionIds.length <= 3) {
      setRoundLibraryError("Choose at least 3 rounds to play.");
      return;
    }
    setRoundLibraryError("");
    setSelectedQuestionIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const updateRoundOverride = (id, changes) => {
    setRoundLibraryError("");
    setRoundOverrides((current) => ({ ...current, [id]: { ...current[id], ...changes } }));
  };

  const openRoundLibrary = () => {
    setRoundLibraryError("");
    setExpandedRoundId(null);
    showOverlay("round-library");
  };

  const openCategoryCreator = () => {
    setCategoryNameDraft("");
    setQuestionDrafts([{ prompt: "", answers: ["", ""] }]);
    setCategoryError("");
    setRoundLibraryError("");
    showOverlay("create-category");
  };

  const updateQuestionDraft = (questionIndex, changes) => setQuestionDrafts((questions) => questions.map((question, index) => index === questionIndex ? { ...question, ...changes, ...(typeof changes.prompt === "string" ? { prompt: capitalizeFirstLetter(changes.prompt) } : {}) } : question));
  const updateAnswerDraft = (questionIndex, answerIndex, value) => setQuestionDrafts((questions) => questions.map((question, index) => index === questionIndex ? { ...question, answers: question.answers.map((answer, item) => item === answerIndex ? capitalizeFirstLetter(value) : answer) } : question));

  const saveCategory = (event) => {
    event.preventDefault();
    const name = categoryNameDraft.trim();
    if (!name) { setCategoryError("Enter a round name."); return; }
    if (customCategories.some((category) => cleanAnswer(category.name) === cleanAnswer(name))) { setCategoryError("A round with that name already exists."); return; }
    const questions = questionDrafts.map((question) => ({ prompt: question.prompt.trim(), answers: question.answers.map((answer) => answer.trim()) }));
    const invalidQuestion = questions.findIndex((question) => !question.prompt || question.answers.length < 2 || question.answers.length > MAX_ANSWERS_PER_QUESTION || question.answers.some((answer) => !answer) || new Set(question.answers.map(cleanAnswer)).size !== question.answers.length);
    if (invalidQuestion >= 0) { setCategoryError(`Complete Question ${invalidQuestion + 1} with 2–${MAX_ANSWERS_PER_QUESTION} different possible answers.`); return; }
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const category = { id, name, questions };
    setCustomCategories((current) => [...current, category]);
    setSelectedQuestionIds((current) => [...current, ...questions.map((_, index) => `${id}-question-${index}`)]);
    setOverlay("round-library");
  };

  const requestRoundEndCue = () => {
    if (answerSequenceRef.current) {
      roundEndCuePendingRef.current = true;
      return;
    }
    if (!roundEndCueRequested) {
      setRoundEndCueRequested(true);
      setRoundEndMusicReady(false);
    }
  };

  const finishRound = (winningTeam, points, reason) => {
    requestRoundEndCue();
    setScores((current) => current.map((score, team) => team === winningTeam ? score + points : score));
    setRoundPoints(points);
    setLastRoundResult({ winningTeam, points, reason });
    setEntry("");
    setFeedback("");
    setFeedbackKind("");
    setScreen("round-end");
  };

  const nextFaceoff = () => {
    const dealt = dealFaceoff(memberQueues, teamMembers);
    setMemberQueues(dealt.queues);
    setFaceoffPlayers(dealt.players);
    setFaceoffPhase("ready");
    setSpinningNames(teamNames);
    setTypedPrompt("");
    setFaceoffAttemptTeam(null);
    setEntry("");
  };

  const revealFaceoffQuestion = () => {
    setTypedPrompt("");
    setFaceoffCountdown(3);
    setFaceoffPhase("countdown");
  };

  useEffect(() => {
    if (screen !== "faceoff" || faceoffPhase !== "spinning") return undefined;
    const allMembers = teamMembers.flat();
    let spinStep = Math.floor(Math.random() * Math.max(1, allMembers.length));
    const spin = window.setInterval(() => {
      setSpinningNames(teamMembers.map((roster, team) => {
        const pool = roster.length > 1 ? roster : allMembers;
        return pool[(spinStep + team) % pool.length];
      }));
      spinStep += 1;
    }, 75);
    const finish = window.setTimeout(() => {
      window.clearInterval(spin);
      setSpinningNames(faceoffPlayers.map((player, team) => teamMembers[team][player]));
      const audienceCue = createAudio("./familyfortunes-audio/audience.mp3");
      audienceCue.preload = "auto";
      audienceCue.volume = 0.5;
      const releaseAudienceCue = () => {
        audienceCue.removeEventListener("ended", releaseAudienceCue);
        audienceCue.removeEventListener("error", releaseAudienceCue);
        releaseAudio(audienceCue);
      };
      audienceCue.addEventListener("ended", releaseAudienceCue);
      audienceCue.addEventListener("error", releaseAudienceCue);
      audienceCue.play().catch(releaseAudienceCue);
      setFaceoffPhase("confirm");
    }, 2200);
    return () => {
      window.clearInterval(spin);
      window.clearTimeout(finish);
    };
  }, [screen, faceoffPhase, faceoffPlayers, teamMembers]);

  useEffect(() => {
    if (screen !== "faceoff" || faceoffPhase !== "countdown") return undefined;
    const countdown = window.setInterval(() => {
      setFaceoffCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          setFaceoffPhase("typing");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [screen, faceoffPhase]);

  useEffect(() => {
    if (screen !== "faceoff" || faceoffPhase !== "typing" || !round) return undefined;
    let position = 0;
    const type = window.setInterval(() => {
      position += 1;
      setTypedPrompt(round.prompt.slice(0, position));
      if (position >= round.prompt.length) {
        window.clearInterval(type);
        setFaceoffPhase("buzzer");
      }
    }, 38);
    return () => window.clearInterval(type);
  }, [screen, faceoffPhase, round]);

  const beginRound = () => {
    setSpinningNames(teamMembers.map((roster) => roster[Math.floor(Math.random() * roster.length)]));
    setFaceoffPhase("spinning");
  };

  const chooseBuzzingTeam = (team) => {
    setFaceoffAttemptTeam(team);
    setAnswerTimerKey((key) => key + 1);
    setEntry("");
    setFeedback(`${teamNames[team]} buzzed first. Enter ${teamMembers[team][faceoffPlayers[team]]}’s answer.`);
    setFeedbackKind("");
  };

  const playAnswerFeedback = async (isCorrect, revealAnswer) => {
    if (answerSequenceRef.current) return;
    answerSequenceRef.current = true;
    musicTrackRef.current?.pause();
    setAnswerSequencePlaying(true);

    const playOnce = (path, onStart, onNearEnd) => new Promise((resolve) => {
      const audio = createAudio(path);
      audio.preload = "auto";
      answerSequenceAudioRef.current = audio;
      let started = false;
      let finished = false;
      let nearEndTriggered = false;
      const start = () => {
        if (started) return;
        started = true;
        onStart?.();
      };
      const triggerNearEnd = () => {
        if (nearEndTriggered) return;
        nearEndTriggered = true;
        audio.removeEventListener("timeupdate", checkNearEnd);
        onNearEnd?.();
      };
      const checkNearEnd = () => {
        if (Number.isFinite(audio.duration) && audio.duration - audio.currentTime <= 1) triggerNearEnd();
      };
      const finish = () => {
        if (finished) return;
        if (audio.currentTime > 0 && Number.isFinite(audio.duration) && audio.duration - audio.currentTime <= 1) triggerNearEnd();
        finished = true;
        audio.removeEventListener("ended", finish);
        audio.removeEventListener("error", finish);
        audio.removeEventListener("timeupdate", checkNearEnd);
        releaseAudio(audio);
        if (answerSequenceAudioRef.current === audio) answerSequenceAudioRef.current = null;
        resolve();
      };
      audio.addEventListener("ended", finish);
      audio.addEventListener("error", finish);
      audio.addEventListener("timeupdate", checkNearEnd);
      const playback = audio.play();
      if (playback && typeof playback.then === "function") {
        playback.then(start).catch(() => { start(); finish(); });
      } else start();
    });

    const playAudienceFade = () => new Promise((resolve) => {
      const audio = createAudio("./familyfortunes-audio/audience.mp3");
      audio.preload = "auto";
      audio.loop = true;
      audio.volume = 0.5;
      let animationFrame = null;
      let startedAt = null;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        audio.removeEventListener("error", finish);
        releaseAudio(audio);
        resolve();
      };
      const fade = (timestamp) => {
        if (startedAt === null) startedAt = timestamp;
        const elapsed = timestamp - startedAt;
        audio.volume = 0.5 * Math.max(0, 1 - elapsed / 2000);
        if (elapsed >= 2000) finish();
        else animationFrame = window.requestAnimationFrame(fade);
      };
      audio.addEventListener("error", finish);
      const playback = audio.play();
      if (playback && typeof playback.then === "function") playback.then(() => { animationFrame = window.requestAnimationFrame(fade); }).catch(finish);
      else animationFrame = window.requestAnimationFrame(fade);
    });

    try {
      await playOnce("./familyfortunes-audio/oursurveysaid.wav");
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      let audiencePromise = null;
      const startCorrectSequence = () => {
        revealAnswer();
        if (isCorrect) audiencePromise = playAudienceFade();
      };
      await playOnce(`./familyfortunes-audio/${isCorrect ? "correct.mp3" : "wrong.wav"}`, startCorrectSequence);
      if (isCorrect) await (audiencePromise || playAudienceFade());
    } finally {
      answerSequenceAudioRef.current?.pause();
      answerSequenceAudioRef.current = null;
      answerSequenceRef.current = false;
      if (roundEndCuePendingRef.current) {
        roundEndCuePendingRef.current = false;
        if (!roundEndCueRequested) {
          setRoundEndCueRequested(true);
          setRoundEndMusicReady(false);
        }
      }
      setAnswerSequencePlaying(false);
    }
  };

  const renderFaceoffPlayerButtons = ({ disabled = false, spinning = false } = {}) => <div className="ff-buzzer-buttons">
    {teamNames.map((name, index) => {
      const playerName = spinning ? spinningNames[index] : teamMembers[index][faceoffPlayers[index]];
      return <React.Fragment key={index}>
        <button className={`ff-opening-button ff-opening-secondary ff-faceoff-player-button${spinning ? " is-spinning" : ""}`} type="button" disabled={disabled} aria-label={`${playerName} from ${name}${disabled ? "" : " buzzed first"}`} onClick={() => chooseBuzzingTeam(index)}>
          <span className="ff-faceoff-person">{playerName}</span>
          <span className="ff-faceoff-divider" aria-hidden="true" />
          <span className="ff-faceoff-team">{name}</span>
        </button>
        {index === 0 && <span className="ff-faceoff-versus">vs.</span>}
      </React.Fragment>;
    })}
  </div>;

  const recordFaceoffAnswer = (answer, timedOut = false) => {
    const guess = cleanAnswer(answer);
    if ((!guess && !timedOut) || screen !== "faceoff" || faceoffAttemptTeam === null || answerSequenceRef.current) return;
    const team = faceoffAttemptTeam;
    const matchIndex = window.FAMILY_FORTUNES_ANSWERS.matchIndex(round, guess, revealed);
    setEntry("");

    playAnswerFeedback(matchIndex >= 0, () => {
      if (matchIndex >= 0) {
        const updatedRevealed = [...revealed, matchIndex];
        setRevealed(updatedRevealed);
        setRecentCorrectAnswerIndex(matchIndex);
        setRoundPoints((points) => points + 1);
        setAnswerTimerKey((key) => key + 1);
        setRoundController(team);
        setCurrentTeam(team);
        setFaceoffAttemptTeam(null);
        setFeedback(`${teamMembers[team][faceoffPlayers[team]]} found ${round.answers[matchIndex]}. ${teamNames[team]} won the head-to-head and added 1 point to the round bank.`);
        setFeedbackKind("good");
        if (updatedRevealed.length === round.answers.length) finishRound(team, roundPoints + 1, "cleared-board");
        else setScreen("faceoff-choice");
        return;
      }

      const updatedStrikes = [...strikes];
      updatedStrikes[team] = Math.min(3, updatedStrikes[team] + 1);
      setStrikes(updatedStrikes);
      setAnswerTimerKey((key) => key + 1);
      const other = 1 - team;
      setFaceoffAttemptTeam(null);
      setRoundController(other);
      setCurrentTeam(other);
      setFeedback(`${timedOut ? "Time ran out." : "Not on the board."} Control passes to ${teamNames[other]}, who can choose to play or pass without answering.`);
      setFeedbackKind("bad");
      setScreen("faceoff-choice");
    });
  };

  const submitFaceoffAnswer = (event) => {
    event?.preventDefault();
    recordFaceoffAnswer(entry);
  };

  const chooseBoardControl = (team) => {
    setRoundController(team);
    setCurrentTeam(team);
    setFeedback("");
    setFeedbackKind("");
    setEntry("");
    setScreen("game");
  };

  const recordGuess = (answer, timedOut = false) => {
    const guess = cleanAnswer(answer);
    if ((!guess && !timedOut) || roundOver || screen !== "game" || answerSequenceRef.current) return;
    const team = currentTeam;
    const matchIndex = window.FAMILY_FORTUNES_ANSWERS.matchIndex(round, guess, revealed);
    setEntry("");

    playAnswerFeedback(matchIndex >= 0, () => {
      if (matchIndex >= 0 && !revealed.includes(matchIndex)) {
        const updatedRevealed = [...revealed, matchIndex];
        setRevealed(updatedRevealed);
        setRecentCorrectAnswerIndex(matchIndex);
        const updatedRoundPoints = roundPoints + 1;
        setRoundPoints(updatedRoundPoints);
        setAnswerTimerKey((key) => key + 1);
        setFeedback("");
        setFeedbackKind("");
        if (updatedRevealed.length === round.answers.length) finishRound(team, updatedRoundPoints, "cleared-board");
        return;
      }

      const updatedStrikes = [...strikes];
      updatedStrikes[team] = Math.min(3, updatedStrikes[team] + 1);
      setStrikes(updatedStrikes);
      setAnswerTimerKey((key) => key + 1);
      setFeedback("");
      setFeedbackKind("");
      if (updatedStrikes[team] >= 3) {
        setStealTeam(1 - team);
        setStealRevealMode(false);
        setFeedback(`${teamNames[team]} have three strikes. ${teamNames[1 - team]} can steal the round bank.`);
        setScreen("steal");
        setOverlay("steal-announcement");
      }
    });
  };

  const submitGuess = (event) => {
    event?.preventDefault();
    recordGuess(entry);
  };

  const recordStealAttempt = (answer, timedOut = false) => {
    const guess = cleanAnswer(answer);
    if ((!guess && !timedOut) || screen !== "steal" || stealRevealMode || stealTeam === null || answerSequenceRef.current) return;
    const matchIndex = window.FAMILY_FORTUNES_ANSWERS.matchIndex(round, guess, revealed);
    setEntry("");

    playAnswerFeedback(matchIndex >= 0, () => {
      if (matchIndex >= 0) {
        setRevealed((current) => [...current, matchIndex]);
        setRecentCorrectAnswerIndex(matchIndex);
        finishRound(stealTeam, roundPoints + 1, "successful-steal");
      } else {
        const updatedStrikes = [...strikes];
        updatedStrikes[stealTeam] = Math.min(3, updatedStrikes[stealTeam] + 1);
        setStrikes(updatedStrikes);
        requestRoundEndCue();
        setStealRevealMode(true);
        setFeedback("Wrong answer. Reveal the remaining answers one at a time.");
        setFeedbackKind("bad");
      }
    });
  };

  const revealNextStealAnswer = () => {
    const failedStealReveal = screen === "steal" && stealRevealMode;
    if ((!failedStealReveal && screen !== "round-end") || answerSequenceRef.current) return;
    const answerIndex = round.answers.findIndex((_, index) => !revealed.includes(index));
    if (answerIndex < 0) {
      if (failedStealReveal) finishRound(roundController, roundPoints, "failed-steal");
      return;
    }
    const updatedRevealed = [...revealed, answerIndex];
    setRevealed(updatedRevealed);
    setRecentCorrectAnswerIndex(answerIndex);
    setFeedback("");
    setFeedbackKind("");
    if (failedStealReveal && updatedRevealed.length === round.answers.length) {
      finishRound(roundController, roundPoints, "failed-steal");
    }
  };

  const submitSteal = (event) => {
    event?.preventDefault();
    recordStealAttempt(entry);
  };

  const timedAnswerActive = options.timer && !answerSequencePlaying && (screen === "game" || (screen === "steal" && !stealRevealMode) || (screen === "faceoff" && faceoffAttemptTeam !== null));

  useEffect(() => {
    if (!timedAnswerActive) {
      setTimeRemaining(ANSWER_TIME_SECONDS);
      timerExpiredRef.current = false;
      return undefined;
    }
    timerExpiredRef.current = false;
    const endAt = Date.now() + ANSWER_TIME_SECONDS * 1000;
    const update = () => {
      const remaining = Math.max(0, (endAt - Date.now()) / 1000);
      setTimeRemaining(remaining);
      if (remaining === 0 && !timerExpiredRef.current) {
        timerExpiredRef.current = true;
        if (screen === "faceoff") recordFaceoffAnswer("", true);
        else if (screen === "game") recordGuess("", true);
        else if (screen === "steal") recordStealAttempt("", true);
      }
    };
    update();
    const interval = window.setInterval(update, 100);
    return () => window.clearInterval(interval);
  }, [timedAnswerActive, screen, faceoffAttemptTeam, answerTimerKey]);

  const continueRound = () => {
    if (roundIndex + 1 >= gameRounds.length) {
      if (!allRoundAnswersRevealed) return;
      setRoundEndCueRequested(false);
      setRoundEndMusicReady(false);
      setScreen("final");
      return;
    }
    const nextRound = roundIndex + 1;
    setRoundIndex(nextRound);
    setRoundPoints(0);
    setLastRoundResult(null);
    setRoundEndCueRequested(false);
    setRoundEndMusicReady(false);
    setRoundController(0);
    setStealTeam(null);
    setStrikes([0, 0]);
    setStealRevealMode(false);
    setRevealed([]);
    setRecentCorrectAnswerIndex(null);
    setEntry("");
    setFeedback("");
    setFeedbackKind("");
    nextFaceoff();
    setScreen("faceoff");
  };

  const setLevelMenu = (nextLevel) => {
    if (!ROUND_BANKS[nextLevel]) return;
    if (nextLevel !== level) {
      const availableIds = [
        ...ROUND_BANKS[nextLevel].map((question) => question.id),
        ...customCategories.flatMap((category) => category.questions.map((_, index) => `${category.id}-question-${index}`)),
      ];
      setRoundOverrides(readRoundOverrides(nextLevel));
      setSelectedQuestionIds(readSelectedQuestionIds(availableIds, nextLevel));
      setOptions((current) => ({ ...current, level: nextLevel }));
      setExpandedRoundId(null);
      setRoundLibraryError("");
      setRosterError("");
    }
    const url = new URL(window.location.href);
    url.searchParams.set("level", nextLevel);
    window.history.replaceState({}, "", url);
    setLevelOpen(false);
  };
  const winner = scores[0] === scores[1] ? "It's a tie!" : `${teamNames[scores[0] > scores[1] ? 0 : 1]} win!`;
  const roundLibraryOverlay = overlay === "round-library" ? <div className="ff-overlay-backdrop ff-how-to-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOverlay(null); }}>
    <div className="ff-logo-shine ff-how-to-logo"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
    <section className="ff-modal ff-how-to-modal ff-round-library-modal" role="dialog" aria-modal="true" aria-labelledby="ff-round-library-title">
      <div className="ff-round-library-header">
        <p className="ff-round-library-subtitle">Active rounds: <span>{selectedQuestionIds.length}</span></p>
        <h2 id="ff-round-library-title">Edit Rounds</h2>
        <button className="ff-randomise-rounds" type="button" role="switch" aria-checked={options.randomiseRounds} onClick={() => setOptions((current) => ({ ...current, randomiseRounds: !current.randomiseRounds }))}>
          <span>Randomise Rounds</span><span className="ff-rounds-switch-track" aria-hidden="true"><span /></span>
        </button>
      </div>
      <p className="ff-round-library-saved-note">Round selections, edits, user-created rounds, and options are saved in this browser.</p>
      <div className="ff-round-bulk-actions">
        <button className="ff-round-edit-toggle" type="button" onClick={() => { setSelectedQuestionIds(orderedQuestions.map((question) => question.id)); setRoundLibraryError(""); }}>All On</button>
        <button className="ff-round-edit-toggle" type="button" onClick={() => { setSelectedQuestionIds([]); setRoundLibraryError(""); }}>All Off</button>
        <label className="ff-round-count-setting">
          <span>Rounds to play</span>
          <select disabled={selectedQuestionIds.length < 3} aria-label="Number of rounds to play" value={roundsToPlay} onChange={(event) => setOptions((current) => ({ ...current, roundsToPlay: Number(event.target.value) }))}>
            {Array.from({ length: Math.max(0, selectedQuestionIds.length - 2) }, (_, index) => index + 3).map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
      </div>
      {roundLibraryError && <p className="ff-category-error" role="alert">{roundLibraryError}</p>}
      <div className="ff-round-library-scroll-area">
        <div className="ff-round-library-scroll" ref={roundLibraryScrollRef}>
          <div className="ff-round-library-list">
          {orderedQuestions.map((question) => {
            const expanded = expandedRoundId === question.id;
            const orderIndex = selectedQuestionIds.indexOf(question.id);
            const active = orderIndex >= 0;
            return <article className={`ff-round-library-item${expanded ? " is-expanded" : ""}${draggedRoundId === question.id ? " is-dragging" : ""}${roundDropTarget === question.id ? " is-drop-target" : ""}`} key={question.id}
              onDragOver={(event) => {
                if (!draggedRoundId || !active || draggedRoundId === question.id) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setRoundDropTarget(question.id);
              }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setRoundDropTarget(null); }}
              onDrop={(event) => {
                if (!draggedRoundId || !active) return;
                event.preventDefault();
                moveRound(draggedRoundId, question.id);
                finishRoundDrag();
              }}>
              <div className="ff-round-library-item-heading">
                <button className="ff-round-order-handle" type="button" draggable={active} disabled={!active}
                  aria-label={active ? `Round ${orderIndex + 1}: ${question.label}. Drag to reorder, or use the up and down arrow keys.` : `${question.label}: inactive round`}
                  title={active ? "Drag to reorder, or use ↑ / ↓" : "Select this round to add it to the game"}
                  onDragStart={(event) => {
                    setDraggedRoundId(question.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", question.id);
                  }}
                  onDragEnd={finishRoundDrag}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                    event.preventDefault();
                    const target = selectedQuestionIds[orderIndex + (event.key === "ArrowUp" ? -1 : 1)];
                    if (target) moveRound(question.id, target);
                  }}>
                  <span className="ff-round-order-number">{active ? orderIndex + 1 : "–"}</span>
                  <svg viewBox="0 0 16 20" aria-hidden="true"><path d="M5 4h.01M11 4h.01M5 10h.01M11 10h.01M5 16h.01M11 16h.01" /></svg>
                </button>
                <label className="ff-round-select-label">
                  <input type="checkbox" checked={selectedQuestionIds.includes(question.id)} onChange={() => toggleQuestion(question.id)} />
                  <span>{question.label || "Untitled round"}</span>
                </label>
                <button className="ff-round-edit-toggle" type="button" aria-expanded={expanded} onClick={() => setExpandedRoundId((current) => current === question.id ? null : question.id)}>{expanded ? "Done" : "Edit"}</button>
              </div>
              {expanded && <div className="ff-round-editor">
                <label className="ff-modal-field">Round Name
                  <input className="ff-modal-input" maxLength="40" value={question.label || ""} onChange={(event) => updateRoundOverride(question.id, { label: capitalizeFirstLetter(event.target.value) })} />
                </label>
                <label className="ff-modal-field">Question
                  <input className="ff-modal-input" maxLength="180" value={question.prompt} onChange={(event) => updateRoundOverride(question.id, { prompt: capitalizeFirstLetter(event.target.value) })} />
                </label>
                <div className="ff-answer-draft-heading"><span>Answers</span><span>{question.answers.length} / {MAX_ANSWERS_PER_QUESTION}</span></div>
                {question.answers.map((answer, answerIndex) => <div className="ff-answer-draft-row" key={`${question.id}-${answerIndex}`}>
                  <input className="ff-modal-input" maxLength="70" value={answer} onChange={(event) => updateRoundOverride(question.id, { answers: question.answers.map((item, itemIndex) => itemIndex === answerIndex ? capitalizeFirstLetter(event.target.value) : item) })} aria-label={`${question.label}, answer ${answerIndex + 1}`} />
                  {question.answers.length > 2 && <button className="ff-remove-answer" type="button" aria-label={`Remove answer ${answerIndex + 1}`} title="Remove answer" onClick={() => updateRoundOverride(question.id, { answers: question.answers.filter((_, itemIndex) => itemIndex !== answerIndex) })}><img src="bin.svg" alt="" aria-hidden="true" /></button>}
                </div>)}
                <button className="ff-add-member ff-add-answer" type="button" aria-label="Add answer" title="Add answer" disabled={question.answers.length >= MAX_ANSWERS_PER_QUESTION} onClick={() => updateRoundOverride(question.id, { answers: [...question.answers, ""] })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>
              </div>}
            </article>;
          })}
          </div>
        </div>
        {roundLibraryFadeVisible && <div className="ff-roster-scroll-fade" aria-hidden="true" />}
      </div>
      <div className="ff-modal-actions ff-round-library-actions">
        <button className="ff-opening-button ff-opening-secondary" type="button" onClick={openCategoryCreator}><span>New Round</span></button>
        <button className="ff-opening-button ff-opening-primary" type="button" disabled={selectedQuestionIds.length < 3} title={selectedQuestionIds.length < 3 ? "Select at least 3 active rounds" : undefined} onClick={() => setOverlay(null)}><span>Done</span></button>
      </div>
    </section>
  </div> : null;
  const createRoundOverlay = overlay === "create-category" ? <div className="ff-overlay-backdrop ff-how-to-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOverlay("round-library"); }}>
    <div className="ff-logo-shine ff-how-to-logo"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
    <section className="ff-modal ff-how-to-modal ff-create-modal" role="dialog" aria-modal="true" aria-label="Add Round">
      <form className="ff-create-round-form" onSubmit={saveCategory}>
        <div className="ff-create-round-content">
          <label className="ff-modal-field">Round Name
            <input className="ff-modal-input" autoFocus autoCapitalize="sentences" maxLength="40" value={categoryNameDraft} onChange={(event) => setCategoryNameDraft(capitalizeFirstLetter(event.target.value))} placeholder="e.g. Classical Periods" />
          </label>
          <div className="ff-draft-questions">
            {questionDrafts.map((question, questionIndex) => <section className="ff-draft-question" key={questionIndex}>
              <label className="ff-modal-field">Question
                <input className="ff-modal-input" autoCapitalize="sentences" maxLength="180" value={question.prompt} onChange={(event) => updateQuestionDraft(questionIndex, { prompt: event.target.value })} placeholder="e.g. Name a composer from the Classical period" />
              </label>
              <div className="ff-answer-draft-heading"><span>Answers</span><span>{question.answers.length} / {MAX_ANSWERS_PER_QUESTION}</span></div>
              {question.answers.map((answer, answerIndex) => <div className="ff-answer-draft-row" key={answerIndex}>
                <input className="ff-modal-input" autoCapitalize="sentences" maxLength="70" value={answer} onChange={(event) => updateAnswerDraft(questionIndex, answerIndex, event.target.value)} aria-label={`Question ${questionIndex + 1}, possible answer ${answerIndex + 1}`} placeholder={answerIndex === 0 ? "e.g. Mozart" : answerIndex === 1 ? "e.g. Haydn" : `e.g. Answer ${answerIndex + 1}`} />
                {question.answers.length > 2 && <button className="ff-remove-answer" type="button" aria-label={`Remove answer ${answerIndex + 1}`} title={`Remove answer ${answerIndex + 1}`} onClick={() => updateQuestionDraft(questionIndex, { answers: question.answers.filter((_, index) => index !== answerIndex) })}><img src="bin.svg" alt="" aria-hidden="true" /></button>}
              </div>)}
              <button className="ff-add-member ff-add-answer" type="button" aria-label="Add answer" title="Add answer" disabled={question.answers.length >= MAX_ANSWERS_PER_QUESTION} onClick={() => updateQuestionDraft(questionIndex, { answers: [...question.answers, ""] })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>
            </section>)}
          </div>
        </div>
        {categoryError && <p className="ff-category-error" role="alert">{categoryError}</p>}
        <div className="ff-modal-actions"><button className="ff-opening-button ff-opening-secondary ff-modal-back" type="button" onClick={() => setOverlay("round-library")}><span>Back</span></button><button className="ff-opening-button ff-opening-primary" type="submit"><span>Save</span></button></div>
      </form>
    </section>
  </div> : null;

  return <div className="ff-app-shell">
    <window.MLH.AppHeader icon="familyfortunes-icon.svg" title="Family Fortunes" subtitle="Name the most popular musical answers in this game-show challenge." profileLabel={activeLevelLabel} profileUsesSharedSettings={false} />
    <main className="ff-content">
      <div className="ff-main-shell">
      <div className="ff-toolbar-wrap">
        <window.MLH.AppToolbar
          left={<div className="flex items-center gap-2">
            <fieldset disabled={customiseUnavailable} className="m-0 min-w-0 border-0 p-0 disabled:opacity-50">
              <div className="hub-menu-anchor relative" ref={levelRef}>
                <window.MLH.LevelButton icon={<img src="levels.svg" alt="" className="h-[26px] w-[26px]" />} activeLevel={level} activeLabel={activeLevelLabel} onClick={() => { setCustomiseOpen(false); setLevelOpen((open) => !open); }} dataMenuTrigger={true} />
                {levelOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Level" position="left-0" dataMenuPanel={true}><window.MLH.LevelMenu activeLevel={level} onSelect={setLevelMenu} levels={LEVEL_MENU} /></window.MLH.MenuPanel>}
              </div>
            </fieldset>
            <fieldset disabled={customiseUnavailable} className="m-0 min-w-0 border-0 p-0 disabled:opacity-50">
              <div className="hub-menu-anchor relative" ref={customiseRef}>
                <window.MLH.CustomiseButton icon={<img src="customise.svg" alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />} onClick={() => { setLevelOpen(false); setCustomiseOpen((open) => !open); }} dataMenuTrigger={true} />
                {customiseOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Customise" position="left-0" variant="customise" dataMenuPanel={true} className="ff-customise-menu">
                  <window.MLH.MenuSubheading>Options</window.MLH.MenuSubheading>
                  <window.MLH.MenuToggleRow glyph={<img src="timer.svg" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />} label="Timer" profileKey="" checked={options.timer} onChange={() => setOptions((current) => ({ ...current, timer: !current.timer }))} />

                </window.MLH.MenuPanel>}
              </div>
            </fieldset>
          </div>}
          right={<button type="button" className="ff-toolbar-reset" aria-label="Reset game and return to setup" disabled={screen === "setup"} onClick={resetGame}><img src="restart.svg" alt="" /><span>Reset</span></button>}
        />
      </div>
      <section className={`ff-stage${screen === "setup" ? " is-setup" : ""}${["faceoff", "faceoff-choice", "game", "steal", "round-end"].includes(screen) ? " has-live-round" : ""}${timedAnswerActive ? " has-answer-timer" : ""}`} aria-live="polite">
        <button className="ff-sound-toggle" type="button" aria-label={soundEnabled ? "Mute sound" : "Turn sound on"} aria-pressed={!soundEnabled} onClick={toggleSound}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {soundEnabled ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <path d="m16 9 5 6m0-6-5 6" />}
          </svg>
        </button>
        {timedAnswerActive && <FamilyFortunesTimer seconds={timeRemaining} />}
        {screen === "setup" && <>
          <div className="ff-logo-shine ff-logo-shine-brand"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
          <div className="ff-opening-actions">
            <button className="ff-opening-button ff-opening-secondary" type="button" onClick={() => showOverlay("how-to")}><span>How to Play</span></button>
            <button className="ff-opening-button ff-opening-primary" type="button" onClick={openRosterSetup}><span>Play</span></button>
          </div>
          <button className="ff-opening-button ff-opening-secondary ff-rounds-customise-button" type="button" onClick={openRoundLibrary}><span>Edit Rounds</span></button>
        </>}

        {["faceoff", "faceoff-choice", "game", "steal", "round-end"].includes(screen) && round && <>
          <div className="ff-game-header">
          <div className="ff-scoreboard ff-scoreboard-game">
            {teamNames.map((name, index) => <div key={index} className={`ff-team ${index === 1 ? "is-reversed" : ""} ${((screen === "game" && currentTeam === index) || (screen === "faceoff-choice" && roundController === index) || (screen === "steal" && stealTeam === index)) ? "is-active" : ""} ${screen !== "faceoff" && strikes[index] >= 3 ? "is-out" : ""}`}>
              <div className="ff-team-name-display">{name}</div>
              <div className="ff-score" aria-label={`${name}: ${scores[index]} cumulative points`}>{scores[index]}</div>
            </div>)}
            <div className="ff-logo-shine ff-game-logo"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
          </div>
          <div className="ff-round-count ff-round-count-bottom">Round {roundIndex + 1} of {gameRounds.length}</div>
          </div>
          <div className="ff-question-board-panel">
          <div className="ff-round-bank ff-question-panel">
            {screen === "faceoff" && ["confirm", "countdown"].includes(faceoffPhase)
              ? <button className={`ff-primary ff-faceoff-action ff-reveal-question-button${faceoffPhase === "countdown" ? " is-countdown" : ""}`} type="button" disabled={faceoffPhase === "countdown"} onClick={revealFaceoffQuestion}><span>{faceoffPhase === "countdown" ? faceoffCountdown : "Reveal Question"}</span></button>
              : <h1 className="ff-question">{screen === "faceoff" ? (faceoffPhase === "typing" || faceoffPhase === "buzzer" ? typedPrompt : faceoffAttemptTeam !== null ? round.prompt : "") : round.prompt}</h1>}
          </div>
          <div className="ff-board">
            <div className="ff-strikes" aria-label={`${teamNames[0]} strikes`}>
              {[0, 1, 2].map((strike) => <span key={strike} className={`ff-x ${strike < strikes[0] ? "is-used" : ""}`} aria-hidden="true">×</span>)}
            </div>
            <div className={`ff-answer-board${answerItems.length > 5 ? " is-two-column" : ""}`} aria-label="Answer board">
              {answerGroups.map((group, groupIndex) => <div className="ff-answer-column" key={groupIndex}>
                {group.map(({ answer, index }) => <div key={`${roundIndex}-${index}`} className={`ff-answer-slot ${revealed.includes(index) ? "is-revealed" : ""} ${index === recentCorrectAnswerIndex ? "is-recent" : ""}`}>
                  <span className="ff-answer-number">{index + 1}</span>
                  <span className="ff-answer-text">{revealed.includes(index) ? answer : ""}</span>
                </div>)}
              </div>)}
              {answerTotal}
            </div>
            <div className="ff-strikes" aria-label={`${teamNames[1]} strikes`}>
              {[0, 1, 2].map((strike) => <span key={strike} className={`ff-x ${strike < strikes[1] ? "is-used" : ""}`} aria-hidden="true">×</span>)}
            </div>
          </div>
          </div>
          {screen === "faceoff" && <div className="ff-faceoff-panel ff-headtohead-panel">
            <h2 className="ff-buzzer-title">Head-to-Head</h2>
            {faceoffAttemptTeam === null && faceoffPhase === "ready" && <button className="ff-primary ff-faceoff-action" type="button" onClick={beginRound}><span>Begin</span></button>}
            {faceoffAttemptTeam === null && faceoffPhase === "spinning" && <>
              {renderFaceoffPlayerButtons({ disabled: true, spinning: true })}
            </>}
            {faceoffAttemptTeam === null && faceoffPhase === "confirm" && <>
              {renderFaceoffPlayerButtons({ disabled: true })}
            </>}
            {faceoffAttemptTeam === null && faceoffPhase === "countdown" && renderFaceoffPlayerButtons({ disabled: true })}
            {faceoffAttemptTeam === null && faceoffPhase === "typing" && <>
              {renderFaceoffPlayerButtons({ disabled: true })}
            </>}
            {faceoffAttemptTeam === null && faceoffPhase === "buzzer" && <>
              {renderFaceoffPlayerButtons()}
            </>}
            {faceoffAttemptTeam !== null && <form className="ff-entry-row" onSubmit={submitFaceoffAnswer}>
              <input disabled={answerSequencePlaying} autoComplete="off" autoCapitalize="sentences" className="ff-answer-entry" value={entry} onChange={(event) => setEntry(capitalizeFirstLetter(event.target.value))} placeholder="Type answer" aria-label="Head-to-head answer" />
              <button disabled={answerSequencePlaying} className="ff-primary ff-faceoff-action ff-faceoff-submit" type="submit"><span>Submit</span></button>
            </form>}
          </div>}
          {screen === "faceoff-choice" && <div className="ff-faceoff-panel">
            <div className="ff-buzzer-buttons">
              <button className="ff-opening-button ff-opening-primary" type="button" onClick={() => chooseBoardControl(roundController)}><span>Play</span></button>
              <button className="ff-opening-button ff-opening-secondary" type="button" onClick={() => chooseBoardControl(1 - roundController)}><span>Pass</span></button>
            </div>
          </div>}
          {screen === "game" && <>
            <div className="ff-entry-panel">
              <h2 className="ff-turn-title">{teamNames[currentTeam]} to Play</h2>
              <form className="ff-entry-row" onSubmit={submitGuess}>
                <input disabled={answerSequencePlaying} autoComplete="off" autoCapitalize="sentences" className="ff-answer-entry" value={entry} onChange={(event) => setEntry(capitalizeFirstLetter(event.target.value))} placeholder="Type answer" aria-label="Your answer attempt" />
                <button disabled={answerSequencePlaying} className="ff-primary ff-faceoff-action" type="submit"><span>Submit</span></button>
              </form>
            </div>
            {feedback && <p className={`ff-feedback ${feedbackKind ? `is-${feedbackKind}` : ""}`} role="status">{feedback}</p>}
          </>}
          {screen === "steal" && (stealRevealMode
            ? <div className="ff-entry-panel">
                <button className="ff-primary ff-faceoff-action" type="button" onClick={revealNextStealAnswer}><span>Reveal next answer</span></button>
              </div>
            : <div className="ff-entry-panel">
                <h2 className="ff-turn-title">{teamNames[stealTeam]} to Play</h2>
                <form className="ff-entry-row" onSubmit={submitSteal}>
                  <input disabled={answerSequencePlaying} autoComplete="off" autoCapitalize="sentences" className="ff-answer-entry" value={entry} onChange={(event) => setEntry(capitalizeFirstLetter(event.target.value))} placeholder="Type answer" aria-label="Steal attempt answer" />
                  <button disabled={answerSequencePlaying} className="ff-primary ff-faceoff-action" type="submit"><span>Steal</span></button>
                </form>
              </div>)}
          {screen === "round-end" && <>
            <div className="ff-opening-actions">
              {revealed.length < round.answers.length && <button className="ff-opening-button ff-opening-secondary" type="button" disabled={answerSequencePlaying} onClick={revealNextStealAnswer}><span>Reveal next answer</span></button>}
              {!isFinalRound && <button className="ff-opening-button ff-opening-primary" type="button" disabled={answerSequencePlaying} onClick={continueRound}><span>Next Round</span></button>}
            </div>
          </>}
        </>}

        {screen === "final" && <>
          <div className="ff-logo-shine ff-logo-shine-brand"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
          <h1 className="ff-display">{winner}</h1>
          <div className="ff-opening-actions"><button className="ff-opening-button ff-opening-primary" type="button" onClick={resetGame}><span>Main Menu</span></button></div>
        </>}
        {showAnswerKey && <>
          {answerKeyOpen && <section ref={answerKeyPopoverRef} className="ff-answer-key-popover" role="region" aria-labelledby="ff-answer-key-title">
            <div className="ff-answer-key-heading">
              <h2 id="ff-answer-key-title">Answers</h2>
            </div>
            <ol>
              {round.answers.map((answer, index) => <li key={`${roundIndex}-${index}`}><span>{index + 1}</span><span>{answer}</span></li>)}
            </ol>
          </section>}
          <button ref={answerKeyToggleRef} className="ff-answer-key-toggle" type="button" aria-label={answerKeyOpen ? "Hide answers for this round" : "Show answers for this round"} aria-expanded={answerKeyOpen} onClick={() => setAnswerKeyOpen((open) => !open)}><span>?</span></button>
        </>}
        {overlay === "steal-announcement" && <div className="ff-overlay-backdrop ff-steal-announcement-backdrop">
          <section className="ff-modal ff-steal-announcement" role="dialog" aria-modal="true" aria-labelledby="ff-steal-announcement-message">
            <p id="ff-steal-announcement-message">{teamNames[stealTeam]}, this is your chance to steal the points!</p>
            <button className="ff-opening-button ff-opening-primary" type="button" autoFocus onClick={() => setOverlay(null)}><span>Continue</span></button>
          </section>
        </div>}
        {overlay === "how-to" && <div className="ff-overlay-backdrop ff-how-to-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOverlay(null); }}>
          <div className="ff-logo-shine ff-how-to-logo"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
          <section className="ff-modal ff-how-to-modal" role="dialog" aria-modal="true" aria-labelledby="ff-modal-title">
            <h2 id="ff-modal-title">How to Play</h2>
            <div className="ff-how-to-content">
              <div className="ff-how-to-rules">
                <section className="ff-how-to-rule">
                  <div className="ff-how-to-rule-heading">
                    <span className="ff-how-to-rule-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4ZM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 11.5V17m-4 3h8m-7-3h6"/></svg></span>
                    <h3>Objective</h3>
                  </div>
                  <p>The game is played in rounds, each with multiple correct answers. Each correct answer adds 1 point to the round bank. The team with the most points after the final round wins.</p>
                </section>
                <section className="ff-how-to-rule">
                  <div className="ff-how-to-rule-heading">
                    <span className="ff-how-to-rule-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg></span>
                    <h3>Rounds</h3>
                  </div>
                  <p>The team playing the round keeps making attempts until it reveals every answer or gets three wrong answers. Work together to find the answers; each correct answer adds 1 point to the round bank.</p>
                </section>
                <section className="ff-how-to-rule">
                  <div className="ff-how-to-rule-heading">
                    <span className="ff-how-to-rule-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="7.5" cy="7" r="3"/><circle cx="16.5" cy="7" r="3"/><path d="M2.5 20c.3-3.3 2.2-5.3 5-5.3s4.7 2 5 5.3M11.5 20c.3-3.3 2.2-5.3 5-5.3s4.7 2 5 5.3"/></svg></span>
                    <h3>Head to Head</h3>
                  </div>
                  <p>One player from each team is chosen at random. The host records who buzzed first and enters that player’s answer. A correct answer adds 1 point to the round bank and gives that team the choice to play or pass. If the first answer is wrong, control passes automatically to the other team; they can play or pass without answering.</p>
                </section>
                <section className="ff-how-to-rule">
                  <div className="ff-how-to-rule-heading">
                    <span className="ff-how-to-rule-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4"/></svg></span>
                    <h3>Steal</h3>
                  </div>
                  <p>After three wrong answers, the opposing team gets one attempt. A correct answer wins the round bank; a wrong answer leaves it with the playing team.</p>
                </section>
              </div>
            </div>
            <div className="ff-modal-actions"><button className="ff-opening-button ff-opening-secondary ff-modal-back" type="button" onClick={() => setOverlay(null)}><span>Back</span></button></div>
          </section>
        </div>}
        {overlay === "roster" && <div className="ff-overlay-backdrop ff-how-to-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setRosterError(""); setOverlay(null); } }}>
          <div className="ff-logo-shine ff-how-to-logo"><img className="ff-brand-logo" src="./familyfortunes-logo.png?v=20260928-hd-logo" alt="Family Fortunes" /></div>
          <section className="ff-modal ff-how-to-modal ff-roster-modal" role="dialog" aria-modal="true" aria-labelledby="ff-roster-modal-title">
            <h2 id="ff-roster-modal-title">Teams</h2>
            <div className="ff-roster-view">
              <form onSubmit={beginGame}>
                <div className="ff-roster-scroll-area">
                  <div className="ff-roster-grid">
                    {teamMembers.map((members, team) => <section className="ff-roster-team" key={team}>
                      <label className="ff-roster-team-label">Team {team + 1} Name
                        <input className="ff-roster-input" autoCapitalize="sentences" maxLength="22" value={teamNames[team]} onChange={(event) => changeTeamName(team, event.target.value)} placeholder={`Team ${team + 1}`} />
                      </label>
                      <div className="ff-roster-members-heading"><span>Members</span></div>
                      {members.map((member, index) => <div className="ff-roster-member" key={`${team}-${index}`}>
                        <span className="ff-roster-member-number">{index + 1}</span>
                        <input className="ff-roster-input" autoCapitalize="sentences" maxLength="32" value={member} onChange={(event) => updateTeamMember(team, index, event.target.value)} aria-label={`${teamNames[team].trim() || `Team ${team + 1}`} member ${index + 1}`} placeholder={`Name ${index + 1}`} />
                        {members.length > 1 && <button className="ff-roster-remove-member" type="button" aria-label={`Remove member ${index + 1} from Team ${team + 1}`} title={`Remove member ${index + 1}`} onClick={() => removeTeamMember(team, index)}><img src="bin.svg" alt="" aria-hidden="true" /></button>}
                      </div>)}
                      <button className="ff-add-member" type="button" aria-label={`Add member to Team ${team + 1}`} title="Add team member" onClick={() => addTeamMember(team)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>
                    </section>)}
                  </div>
                  <div className="ff-roster-scroll-fade" aria-hidden="true" />
                </div>
                {rosterError && <p className="ff-category-error" role="alert">{rosterError}</p>}
                <div className="ff-controls ff-modal-actions"><button className="ff-opening-button ff-opening-secondary" type="button" onClick={() => { setRosterError(""); setOverlay(null); }}><span>Back</span></button><button className="ff-opening-button ff-opening-primary" type="submit"><span>Start</span></button></div>
              </form>
            </div>
          </section>
        </div>}
        {roundLibraryOverlay}
        {createRoundOverlay}
      </section>
      </div>
    </main>
    <div className="ff-legal-attribution">Unofficial educational classroom resource. Not affiliated with or endorsed by the owners of <em>Family Fortunes</em>.</div>
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<FamilyFortunesGame />);
