const { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } = React;
const CORE = window.MILLIONAIRE_CORE;
const QUESTION_BANK = window.MILLIONAIRE_QUESTION_BANK || [];
const QUESTION_POOLS = window.MILLIONAIRE_QUESTION_POOLS || {};

const MILLIONAIRE_SOUND_PATH = "./soundsmillionaire/";
window.MILLIONAIRE_SOUND_CONFIG = {
  opening: `${MILLIONAIRE_SOUND_PATH}opening menu.mp3`,
  start: `${MILLIONAIRE_SOUND_PATH}start.mp3`,
  lifeline: `${MILLIONAIRE_SOUND_PATH}lifeline.mp3`,
  earlyQuestion: `${MILLIONAIRE_SOUND_PATH}11 $100-$1,000 Questions.mp3`,
  earlyFinalAnswer: `${MILLIONAIRE_SOUND_PATH}final answer 1-5.mp3`,
  earlyCorrect: `${MILLIONAIRE_SOUND_PATH}correct 1-5.mp3`,
  earlyIncorrect: `${MILLIONAIRE_SOUND_PATH}incorrect 1-5.mp3`,
  thousandWin: `${MILLIONAIRE_SOUND_PATH}12 Win $1,000.mp3`,
  stages: {
    6: ["13 Let's Play $2,000.mp3", "14 $2,000 Question.mp3", "15 $2,000 Final Answer-.mp3", "16 $2,000 Lose.mp3", "17 $2,000 Win.mp3"],
    7: ["18 Let's Play $4,000.mp3", "19 $4,000 Question.mp3", "20 $4,000 Final Answer-.mp3", "21 $4,000 Lose.mp3", "22 $4,000 Win.mp3"],
    8: ["23 Let's Play $8,000.mp3", "24 $8,000 Question.mp3", "25 $8,000 Final Answer-.mp3", "26 $8,000 Lose.mp3", "27 $8,000 Win.mp3"],
    9: ["28 Let's Play $16,000.mp3", "29 $16,000 Question.mp3", "30 $16,000 Final Answer-.mp3", "31 $16,000 Lose.mp3", "32 $16,000 Win.mp3"],
    10: ["33 Let's Play $32,000.mp3", "34 $32,000 Question.mp3", "35 $32,000 Final Answer-.mp3", "36 $32,000 Lose.mp3", "37 $32,000 Win.mp3"],
    11: ["38 Let's Play $64,000.mp3", "39 $64,000 Question.mp3", "40 $64,000 Final Answer-.mp3", "41 $64,000 Lose.mp3", "42 $64,000 Win.mp3"],
    12: ["43 Let's Play $125,000.mp3", "44 $125,000 Question.mp3", "45 $125,000 Final Answer-.mp3", "46 $125,000 Lose.mp3", "47 $125,000 Win.mp3"],
    13: ["48 Let's Play $250,000.mp3", "49 $250,000 Question.mp3", "50 $250,000 Final Answer-.mp3", "51 $250,000 Lose.mp3", "52 $250,000 Win.mp3"],
    14: ["53 Let's Play $500,000.mp3", "54 $500,000 Question.mp3", "55 $500,000 Final Answer-.mp3", "56 $500,000 Lose.mp3", "57 $500,000 Win.mp3"],
    15: ["58 Let's Play $1,000,000.mp3", "59 $1,000,000 Question.mp3", "60 $1,000,000 Final Answer-.mp3", "61 $1,000,000 Lose.mp3", "62 $1,000,000 Win.mp3"],
  },
};

Object.values(window.MILLIONAIRE_SOUND_CONFIG.stages).forEach((files) => {
  files.forEach((file, index) => { files[index] = `${MILLIONAIRE_SOUND_PATH}${file}`; });
});

const SETTINGS_KEY = "mlh-millionaire-settings-v3";
const HISTORY_KEY = "mlh-millionaire-recent-games-v1";
const PERFORMANCE_KEY = "mlh-millionaire-performance-v1";
const DEFAULT_SETTINGS = {
  soundEffects: true,
  backgroundMusic: true,
  reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false,
  timer: false,
  questionTypes: ["literacy"],
  level: "N3",
};
const TIMER_DURATION_SECONDS = 30;
const MILLIONAIRE_LEVELS = {
  N3: { label: "National 3" },
  N4: { label: "National 4" },
  N5: { label: "National 5" },
  H: { label: "Higher" },
  AH: { label: "Advanced Higher" },
};
const CATEGORY_LABELS = { listening: "Listening", literacy: "Music literacy", concepts: "Music concepts" };
const QUESTION_TYPE_OPTIONS = [
  { id: "literacy", label: "Music Literacy", glyph: "\uE050", notationGlyph: true },
  { id: "concepts", label: "Music Concepts", icon: "worksheet.svg", iconSize: "h-[26px] w-[26px]" },
  { id: "listening", label: "Audio", icon: "audio-svgrepo-com.svg", iconSize: "h-[52.5px] w-[52.5px]" },
];
const LIFELINE_RESULTS = [
  { key: "fifty", icon: "50.50.svg", label: "50:50" },
  { key: "hint", icon: "hint.svg", label: "Hint" },
  { key: "switch", icon: "switch.svg", label: "Switch" },
];
const QUESTION_REWARDS = {
  3: { icon: "bronze.svg", label: "Bronze medal", tier: "bronze", celebrationIcon: "bronzehighres.svg" },
  5: { icon: "silver.svg", label: "Silver medal", tier: "silver", celebrationIcon: "silverhighres.svg" },
  10: { icon: "gold.svg", label: "Gold medal", tier: "gold", celebrationIcon: "goldhighres.svg" },
  15: { icon: "diamond.svg", label: "Diamond", tier: "diamond", celebrationIcon: "diamondhighres.svg" },
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

function levelPerformance(level) {
  const saved = safeRead(PERFORMANCE_KEY, {});
  const record = saved && typeof saved === "object" ? saved[level] : null;
  const highestQuestion = Number.isFinite(record?.highestQuestion) ? Math.max(0, Math.min(15, Math.round(record.highestQuestion))) : 0;
  const legacyBestAmount = highestQuestion ? CORE.PRIZE_LADDER[Math.max(0, highestQuestion - 2)] || 0 : 0;
  const bestTimesByQuestion = record?.bestTimesByQuestion && typeof record.bestTimesByQuestion === "object"
    ? Object.fromEntries(Object.entries(record.bestTimesByQuestion).filter(([question, time]) => Number(question) >= 1 && Number(question) <= 15 && Number.isFinite(time) && time >= 0))
    : {};
  if (Number.isFinite(record?.bestWinMs) && record.bestWinMs >= 0 && bestTimesByQuestion[15] == null) bestTimesByQuestion[15] = record.bestWinMs;
  return {
    bestWinMs: Number.isFinite(record?.bestWinMs) && record.bestWinMs >= 0 ? record.bestWinMs : null,
    highestQuestion,
    bestAmount: Number.isFinite(record?.bestAmount) && record.bestAmount >= 0 ? record.bestAmount : legacyBestAmount,
    bestTimesByQuestion,
  };
}

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function midiFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function finalAnswerDelay(stage) {
  if (stage <= 5) return 2000;
  if (stage <= 8) return 3000;
  if (stage <= 12) return 4000;
  return 5000;
}

const ANSWER_FLASH_DURATION_MS = 1000;

class AudioDirector {
  constructor() {
    this.context = null;
    this.music = null;
    this.musicIncoming = null;
    this.introMusic = null;
    this.earlyStartTimer = null;
    this.musicLoopTimer = null;
    this.musicFadeTimer = null;
    this.earlyStartRemaining = null;
    this.earlyStartBeganAt = null;
    this.effectAudio = null;
    this.effectResolve = null;
    this.effectFadeStartTimer = null;
    this.effectFadeTimer = null;
    this.effectStopTimer = null;
    this.desiredMusic = null;
    this.musicSequence = 0;
    this.effectSequence = 0;
    this.unlockHandler = null;
    this.excerptNodes = [];
    this.excerptAudio = null;
    this.excerptTimer = null;
    this.excerptFadeTimer = null;
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
    if (!this.musicEnabled) this.stopMusic(false);
    else if (!this.excerptPlaying) this.resumeMusic();
    if (!this.effectsEnabled) this.stopEffect();
  }

  makeAudio(path, loop = false) {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.preload = "auto";
    return audio;
  }

  safelyPlay(audio) {
    if (!audio) return;
    audio.play().then(() => this.removeUnlockListeners()).catch(() => this.addUnlockListeners());
  }

  addUnlockListeners() {
    if (this.unlockHandler) return;
    this.unlockHandler = () => {
      this.removeUnlockListeners();
      if (this.musicEnabled && !this.excerptPlaying) this.resumeMusic();
    };
    document.addEventListener("pointerdown", this.unlockHandler, { once: true, capture: true });
    document.addEventListener("keydown", this.unlockHandler, { once: true, capture: true });
  }

  removeUnlockListeners() {
    if (!this.unlockHandler) return;
    document.removeEventListener("pointerdown", this.unlockHandler, true);
    document.removeEventListener("keydown", this.unlockHandler, true);
    this.unlockHandler = null;
  }

  setMusic(path, loop = true) {
    this.stopMusic(false);
    this.desiredMusic = { path, loop };
    if (!this.musicEnabled || this.excerptPlaying || !path) return;
    this.music = this.makeAudio(path, loop);
    this.safelyPlay(this.music);
  }

  playMusicSequence(firstPath, nextPath, nextLoops = true, crossfadeSeconds = 0) {
    this.stopMusic(false);
    this.desiredMusic = crossfadeSeconds > 0
      ? { path: nextPath, loop: false, crossfadeSeconds, waitForIntro: true }
      : { path: nextPath, loop: nextLoops };
    const sequence = this.musicSequence;
    if (!this.musicEnabled || this.excerptPlaying) return;
    const first = this.makeAudio(firstPath, false);
    if (crossfadeSeconds > 0) this.introMusic = first;
    else this.music = first;
    first.addEventListener("ended", () => {
      if (sequence !== this.musicSequence) return;
      if (this.introMusic === first) this.introMusic = null;
      if (crossfadeSeconds > 0) {
        this.desiredMusic.waitForIntro = false;
        this.startEarlyQuestionLoop(nextPath, sequence);
      } else {
        this.setMusic(nextPath, nextLoops);
      }
    }, { once: true });
    this.safelyPlay(first);
  }

  playOpening() {
    const path = window.MILLIONAIRE_SOUND_CONFIG.opening;
    if (this.desiredMusic?.path === path && this.music) {
      this.resumeMusic();
      return;
    }
    this.setMusic(path, true);
  }

  startGame() {
    this.stage = 1;
    this.stopMusic(false);
    const questionPath = window.MILLIONAIRE_SOUND_CONFIG.earlyQuestion;
    this.desiredMusic = { path: questionPath, loop: false, crossfadeSeconds: 5 };
    const sequence = this.musicSequence;
    if (!this.musicEnabled || this.excerptPlaying) return;
    const intro = this.makeAudio(window.MILLIONAIRE_SOUND_CONFIG.start, false);
    this.introMusic = intro;
    intro.addEventListener("ended", () => {
      if (sequence === this.musicSequence && this.introMusic === intro) this.introMusic = null;
    }, { once: true });
    this.safelyPlay(intro);
    this.scheduleEarlyStart(8000, questionPath, sequence);
  }

  playQuestion(stage) {
    this.stage = stage;
    if (stage <= 5) {
      this.startEarlyQuestionLoop(window.MILLIONAIRE_SOUND_CONFIG.earlyQuestion);
      return;
    }
    const stageFiles = window.MILLIONAIRE_SOUND_CONFIG.stages[stage];
    if (stageFiles) this.playMusicSequence(stageFiles[0], stageFiles[1], false, 5);
  }

  pauseMusic() {
    if (this.earlyStartTimer) {
      const elapsed = Date.now() - this.earlyStartBeganAt;
      this.earlyStartRemaining = Math.max(0, this.earlyStartRemaining - elapsed);
    }
    window.clearTimeout(this.earlyStartTimer);
    window.clearTimeout(this.musicLoopTimer);
    window.clearInterval(this.musicFadeTimer);
    this.earlyStartTimer = null;
    this.musicLoopTimer = null;
    this.musicFadeTimer = null;
    if (this.musicIncoming) {
      const keepIncoming = this.musicIncoming.volume >= (this.music?.volume ?? 0);
      const keep = keepIncoming ? this.musicIncoming : this.music;
      const discard = keepIncoming ? this.music : this.musicIncoming;
      discard?.pause();
      this.music = keep;
      this.musicIncoming = null;
      if (this.music) this.music.volume = 1;
    }
    this.music?.pause();
    this.introMusic?.pause();
  }

  resumeMusic() {
    if (!this.musicEnabled || this.excerptPlaying || !this.desiredMusic) return;
    if (this.desiredMusic.crossfadeSeconds) {
      if (this.introMusic) {
        this.safelyPlay(this.introMusic);
        if (this.desiredMusic.waitForIntro) return;
      }
      if (this.music?.src) {
        this.safelyPlay(this.music);
        this.scheduleEarlyCrossfade(this.music, this.desiredMusic.path, this.musicSequence);
      } else if (this.earlyStartRemaining != null) {
        this.scheduleEarlyStart(this.earlyStartRemaining, this.desiredMusic.path, this.musicSequence);
      } else {
        this.startEarlyQuestionLoop(this.desiredMusic.path, this.musicSequence);
      }
      return;
    }
    if (this.music?.src) {
      this.safelyPlay(this.music);
      return;
    }
    this.setMusic(this.desiredMusic.path, this.desiredMusic.loop);
  }

  stopMusic(clearDesired = true) {
    this.musicSequence += 1;
    window.clearTimeout(this.earlyStartTimer);
    window.clearTimeout(this.musicLoopTimer);
    window.clearInterval(this.musicFadeTimer);
    this.music?.pause();
    this.musicIncoming?.pause();
    this.introMusic?.pause();
    this.music = null;
    this.musicIncoming = null;
    this.introMusic = null;
    this.earlyStartTimer = null;
    this.musicLoopTimer = null;
    this.musicFadeTimer = null;
    this.earlyStartRemaining = null;
    this.earlyStartBeganAt = null;
    if (clearDesired) this.desiredMusic = null;
  }

  scheduleEarlyStart(delay, path, sequence) {
    window.clearTimeout(this.earlyStartTimer);
    this.earlyStartRemaining = Math.max(0, delay);
    this.earlyStartBeganAt = Date.now();
    this.earlyStartTimer = window.setTimeout(() => {
      this.earlyStartTimer = null;
      this.earlyStartRemaining = null;
      this.earlyStartBeganAt = null;
      this.startEarlyQuestionLoop(path, sequence);
    }, this.earlyStartRemaining);
  }

  startEarlyQuestionLoop(path, expectedSequence = null) {
    let sequence = expectedSequence;
    if (sequence == null) {
      this.stopMusic(false);
      this.desiredMusic = { path, loop: false, crossfadeSeconds: 5 };
      sequence = this.musicSequence;
    }
    if (sequence !== this.musicSequence || !this.musicEnabled || this.excerptPlaying) return;
    const audio = this.makeAudio(path, false);
    audio.volume = 1;
    this.music = audio;
    this.safelyPlay(audio);
    this.scheduleEarlyCrossfade(audio, path, sequence);
  }

  scheduleEarlyCrossfade(audio, path, sequence) {
    const schedule = () => {
      if (sequence !== this.musicSequence || !Number.isFinite(audio.duration)) return;
      const fadeSeconds = 5;
      const delay = Math.max(0, audio.duration - audio.currentTime - fadeSeconds) * 1000;
      window.clearTimeout(this.musicLoopTimer);
      this.musicLoopTimer = window.setTimeout(() => this.beginEarlyCrossfade(audio, path, sequence, fadeSeconds), delay);
    };
    if (audio.readyState >= 1) schedule();
    else audio.addEventListener("loadedmetadata", schedule, { once: true });
  }

  beginEarlyCrossfade(outgoing, path, sequence, fadeSeconds) {
    if (sequence !== this.musicSequence || !this.musicEnabled || this.excerptPlaying) return;
    const incoming = this.makeAudio(path, false);
    incoming.volume = 0;
    this.musicIncoming = incoming;
    this.safelyPlay(incoming);
    this.scheduleEarlyCrossfade(incoming, path, sequence);
    const startedAt = Date.now();
    window.clearInterval(this.musicFadeTimer);
    this.musicFadeTimer = window.setInterval(() => {
      if (sequence !== this.musicSequence) return;
      const progress = Math.min(1, (Date.now() - startedAt) / (fadeSeconds * 1000));
      outgoing.volume = 1 - progress;
      incoming.volume = progress;
      if (progress < 1) return;
      window.clearInterval(this.musicFadeTimer);
      this.musicFadeTimer = null;
      outgoing.pause();
      if (this.music === outgoing) this.music = incoming;
      if (this.musicIncoming === incoming) this.musicIncoming = null;
    }, 50);
  }

  clearEffectFadeTimers() {
    window.clearTimeout(this.effectFadeStartTimer);
    window.clearInterval(this.effectFadeTimer);
    window.clearTimeout(this.effectStopTimer);
    this.effectFadeStartTimer = null;
    this.effectFadeTimer = null;
    this.effectStopTimer = null;
  }

  stopEffect() {
    this.clearEffectFadeTimers();
    this.effectSequence += 1;
    this.effectAudio?.pause();
    this.effectAudio = null;
    const resolve = this.effectResolve;
    this.effectResolve = null;
    resolve?.();
  }

  scheduleEffectFade(audio, sequence, shortenBy, fadeSeconds) {
    const schedule = () => {
      if (sequence !== this.effectSequence || !Number.isFinite(audio.duration)) return;
      const stopAt = Math.max(0, audio.duration - shortenBy);
      const fadeAt = Math.max(0, stopAt - fadeSeconds);
      const fadeDelay = Math.max(0, fadeAt - audio.currentTime) * 1000;
      const stopDelay = Math.max(0, stopAt - audio.currentTime) * 1000;
      this.effectFadeStartTimer = window.setTimeout(() => {
        if (sequence !== this.effectSequence) return;
        const startedAt = Date.now();
        const startingVolume = audio.volume;
        this.effectFadeTimer = window.setInterval(() => {
          if (sequence !== this.effectSequence) return;
          const progress = Math.min(1, (Date.now() - startedAt) / (fadeSeconds * 1000));
          audio.volume = startingVolume * (1 - progress);
        }, 50);
      }, fadeDelay);
      this.effectStopTimer = window.setTimeout(() => {
        if (sequence === this.effectSequence) this.stopEffect();
      }, stopDelay);
    };
    if (audio.readyState >= 1) schedule();
    else audio.addEventListener("loadedmetadata", schedule, { once: true });
  }

  playEffect(path, { shortenBy = 0, fadeSeconds = 0, stopAfterSeconds = 0 } = {}) {
    if (!this.effectsEnabled || !path) return Promise.resolve();
    this.stopEffect();
    const sequence = this.effectSequence;
    const audio = this.makeAudio(path, false);
    this.effectAudio = audio;
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (sequence === this.effectSequence) {
          this.clearEffectFadeTimers();
          this.effectAudio = null;
          this.effectResolve = null;
        }
        resolve();
      };
      this.effectResolve = finish;
      audio.addEventListener("ended", finish, { once: true });
      audio.addEventListener("error", finish, { once: true });
      audio.play().then(() => {
        if (stopAfterSeconds > 0) {
          this.effectStopTimer = window.setTimeout(() => {
            if (sequence === this.effectSequence) this.stopEffect();
          }, stopAfterSeconds * 1000);
        }
      }).catch(finish);
      if (shortenBy > 0 && fadeSeconds > 0) this.scheduleEffectFade(audio, sequence, shortenBy, fadeSeconds);
    });
  }

  playFinalAnswer(stage) {
    this.stopMusic();
    const path = stage <= 5
      ? window.MILLIONAIRE_SOUND_CONFIG.earlyFinalAnswer
      : window.MILLIONAIRE_SOUND_CONFIG.stages[stage]?.[2];
    if (!this.effectsEnabled || !path) return Promise.resolve();
    this.playEffect(path);
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.stopEffect();
        resolve();
      }, finalAnswerDelay(stage));
    });
  }

  playOutcome(stage, correct, { finishNaturally = false, stopAfterSeconds = 0 } = {}) {
    let path;
    if (stage <= 5) {
      path = correct
        ? (stage === 5 ? window.MILLIONAIRE_SOUND_CONFIG.thousandWin : window.MILLIONAIRE_SOUND_CONFIG.earlyCorrect)
        : window.MILLIONAIRE_SOUND_CONFIG.earlyIncorrect;
    } else {
      path = window.MILLIONAIRE_SOUND_CONFIG.stages[stage]?.[correct ? 4 : 3];
    }
    if (!this.effectsEnabled || !path) {
      return new Promise((resolve) => window.setTimeout(resolve, ANSWER_FLASH_DURATION_MS));
    }
    const shortenEarlyCorrect = path === window.MILLIONAIRE_SOUND_CONFIG.earlyCorrect && !finishNaturally;
    return this.playEffect(path, shortenEarlyCorrect ? { shortenBy: 3, fadeSeconds: 1 } : stopAfterSeconds > 0 ? { stopAfterSeconds } : undefined);
  }

  playLifeline() {
    return this.playEffect(window.MILLIONAIRE_SOUND_CONFIG.lifeline);
  }

  clearExcerptFade() {
    window.clearInterval(this.excerptFadeTimer);
    this.excerptFadeTimer = null;
  }

  fadeOutMusicForExcerpt(seconds, onComplete) {
    this.clearExcerptFade();
    if (this.earlyStartTimer) {
      const elapsed = Date.now() - this.earlyStartBeganAt;
      this.earlyStartRemaining = Math.max(0, this.earlyStartRemaining - elapsed);
    }
    window.clearTimeout(this.earlyStartTimer);
    window.clearTimeout(this.musicLoopTimer);
    window.clearInterval(this.musicFadeTimer);
    this.earlyStartTimer = null;
    this.musicLoopTimer = null;
    this.musicFadeTimer = null;
    if (this.musicIncoming) {
      const keepIncoming = this.musicIncoming.volume >= (this.music?.volume ?? 0);
      const keep = keepIncoming ? this.musicIncoming : this.music;
      const discard = keepIncoming ? this.music : this.musicIncoming;
      discard?.pause();
      this.music = keep;
      this.musicIncoming = null;
    }
    const sources = [this.music, this.introMusic].filter((audio) => audio && !audio.paused);
    if (!this.musicEnabled || sources.length === 0) {
      this.pauseMusic();
      onComplete();
      return;
    }
    const startingVolumes = sources.map((audio) => audio.volume);
    const startedAt = Date.now();
    this.excerptFadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / (seconds * 1000));
      sources.forEach((audio, index) => { audio.volume = startingVolumes[index] * (1 - progress); });
      if (progress < 1) return;
      this.clearExcerptFade();
      sources.forEach((audio) => audio.pause());
      onComplete();
    }, 25);
  }

  fadeInMusicAfterExcerpt(seconds) {
    this.clearExcerptFade();
    if (!this.musicEnabled || !this.desiredMusic) return;
    const sources = [this.music, this.introMusic].filter(Boolean);
    sources.forEach((audio) => { audio.volume = 0; });
    this.resumeMusic();
    const playingSources = [this.music, this.introMusic].filter(Boolean);
    if (playingSources.length === 0) return;
    const startedAt = Date.now();
    this.excerptFadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / (seconds * 1000));
      playingSources.forEach((audio) => { audio.volume = progress; });
      if (progress >= 1) this.clearExcerptFade();
    }, 25);
  }

  stopExcerpt(resume = true) {
    window.clearTimeout(this.excerptTimer);
    this.clearExcerptFade();
    this.excerptNodes.forEach((node) => { try { node.stop(); } catch {} });
    this.excerptNodes = [];
    this.excerptAudio?.pause();
    this.excerptAudio = null;
    this.excerptPlaying = false;
    if (resume) this.resumeMusic();
  }

  playFileExcerpt(src, onEnded) {
    if (!src) return null;
    this.stopExcerpt(false);
    const audio = this.makeAudio(src, false);
    this.excerptAudio = audio;
    this.excerptPlaying = true;
    const finish = () => {
      if (this.excerptAudio !== audio) return;
      this.excerptAudio = null;
      this.excerptPlaying = false;
      this.fadeInMusicAfterExcerpt(.5);
      onEnded?.();
    };
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    this.fadeOutMusicForExcerpt(.5, () => audio.play().catch(finish));
    return true;
  }

  playGenerated(generator, onEnded) {
    const context = this.ensureContext();
    if (!context || !generator) return null;
    this.stopExcerpt(false);
    this.excerptPlaying = true;
    const bpm = generator.bpm || 96;
    const beatSeconds = 60 / bpm;
    const voices = generator.voices || [{
      notes: generator.notes || [], beats: generator.beats || [], gains: generator.gains,
      gain: generator.gain, gate: generator.gate, waveform: generator.waveform,
    }];
    let totalDuration = 0;
    voices.forEach((voice) => {
      const totalBeats = (voice.notes || []).reduce((sum, note, index) => sum + (voice.beats?.[index] || 1), 0);
      totalDuration = Math.max(totalDuration, totalBeats * beatSeconds);
    });
    const startExcerpt = () => {
      if (!this.excerptPlaying) return;
      const start = context.currentTime + .05;
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
      });
      this.excerptTimer = window.setTimeout(() => {
        this.excerptNodes = [];
        this.excerptPlaying = false;
        this.fadeInMusicAfterExcerpt(.5);
        onEnded?.();
      }, (totalDuration + .12) * 1000);
    };
    this.fadeOutMusicForExcerpt(.5, startExcerpt);
    return totalDuration + .62;
  }

  destroy() {
    this.removeUnlockListeners();
    this.stopExcerpt(false);
    this.stopMusic();
    this.stopEffect();
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

function AutoFitAnswer({ answer, question }) {
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const rhythm = (question?.notation?.kind === "bar" || (question?.notation?.kind === "rhythmSum" && Number.isFinite(question.notation.total))) ? RHYTHM_ANSWER_VALUES[answer.text] : null;
  const rest = question?.notation?.kind === "restBar" ? REST_ANSWER_VALUES[answer.text] : null;
  const timeSignature = question?.notation?.kind === "bar" && /^(?:[2-5]\/4|6\/8)$/.test(answer.text) ? answer.text : null;
  const dynamic = question?.answerDisplay === "dynamic" && DYNAMIC_SYMBOL_KEYS[answer.text] ? answer.text : null;

  useLayoutEffect(() => {
    const content = contentRef.current;
    const text = textRef.current;
    if (!content || !text || rhythm || rest || timeSignature || dynamic) return undefined;

    function fitText() {
      text.classList.remove("is-wrapped");
      text.style.fontSize = "";
      let fontSize = parseFloat(window.getComputedStyle(text).fontSize) || 24;
      while (fontSize > 16 && text.scrollWidth > text.clientWidth) {
        fontSize -= .5;
        text.style.fontSize = `${fontSize}px`;
      }
      if (fontSize <= 16 || text.scrollWidth > text.clientWidth) text.classList.add("is-wrapped");
    }

    fitText();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(fitText) : null;
    observer?.observe(content);
    window.addEventListener("resize", fitText);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fitText);
    };
  }, [answer.letter, answer.text, dynamic, rest, rhythm, timeSignature]);

  return <span ref={contentRef} className={`millionaire-answer-content${dynamic ? " has-dynamic-answer" : ""}${rest ? " has-rest-answer" : ""}`}><span className="millionaire-answer-diamond" aria-hidden="true">◆</span><span className="millionaire-answer-letter">{answer.letter}:</span>{rhythm ? <AnswerRhythmGlyph rhythm={rhythm} label={answer.text} /> : rest ? <AnswerRestGlyph rest={rest} label={answer.text} /> : timeSignature ? <AnswerTimeSignatureGlyph timeSignature={timeSignature} label={answer.text} /> : dynamic ? <AnswerDynamicGlyph dynamic={dynamic} label={answer.text} /> : <span ref={textRef} className="millionaire-answer-text">{answer.text}</span>}</span>;
}

// Use the same shared Bravura symbol catalogue and notation calibration as
// Practice Questions. Fallback values keep the game readable if that file has
// not loaded yet.
const SHARED_BRAVURA_SYMBOLS = window.BRAVURA_SYMBOLS ?? {};
const SHARED_NOTATION = window.SHARED_NOTATION_CONFIG ?? { drawing: {}, symbols: {} };
const bravuraSymbol = (key, fallback) => SHARED_BRAVURA_SYMBOLS[key] || fallback;
const GLYPHS = {
  trebleClef: bravuraSymbol("gClef", "\uE050"),
  quarterNote: bravuraSymbol("quarterNoteStemUp", "\uE1D5"),
  eighthNote: bravuraSymbol("eighthNoteStemUp", "\uE1D7"),
  sixteenthNote: bravuraSymbol("sixteenthNoteStemUp", "\uE1D9"),
  halfNote: bravuraSymbol("halfNoteStemUp", "\uE1D3"),
  wholeNote: bravuraSymbol("wholeNote", "\uE1D2"),
  dottedQuarterNote: `${bravuraSymbol("quarterNoteStemUp", "\uE1D5")}${bravuraSymbol("augmentationDot", "\uE1E7")}`,
  dottedEighthNote: `${bravuraSymbol("eighthNoteStemUp", "\uE1D7")}${bravuraSymbol("augmentationDot", "\uE1E7")}`,
  dottedHalfNote: `${bravuraSymbol("halfNoteStemUp", "\uE1D3")}${bravuraSymbol("augmentationDot", "\uE1E7")}`,
  dynamicForte: bravuraSymbol("forte", "\uE522"),
  dynamicPiano: bravuraSymbol("piano", "\uE520"),
  crescendo: bravuraSymbol("crescendo", "\uE53E"),
  diminuendo: bravuraSymbol("diminuendo", "\uE53F"),
  barlineFinal: bravuraSymbol("barlineFinal", "\uE032"),
  repeatRight: bravuraSymbol("repeatRight", "\uE041"),
};
const TIME_DIGITS = ["\uE080", bravuraSymbol("timeSig1", "\uE081"), bravuraSymbol("timeSig2", "\uE082"), bravuraSymbol("timeSig3", "\uE083"), bravuraSymbol("timeSig4", "\uE084"), bravuraSymbol("timeSig5", "\uE085"), bravuraSymbol("timeSig6", "\uE086"), "\uE087", bravuraSymbol("timeSig8", "\uE088"), bravuraSymbol("timeSig9", "\uE089")];
const PITCH_INDEX = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7, D5: 8, E5: 9, F5: 10, G5: 11, A5: 12, B5: 13, C6: 14 };
const BASS_PITCH_INDEX = { C2: -2, D2: -1, E2: 0, F2: 1, G2: 2, A2: 3, B2: 4, C3: 5, D3: 6, E3: 7, F3: 8, G3: 9, A3: 10, B3: 11, C4: 12, D4: 13, E4: 14 };
const NOTATION_FALLBACKS = { gClef: "\uE050", fClef: "\uE062", brace: "\uE000", segno: "\uE047", tie: "\uE1FD", ottavaAlta: "\uE511", ottavaBassa: "\uE51C", noteheadBlack: "\uE0A4", quarterNoteStemUp: "\uE1D5", quarterNoteStemDown: "\uE1D6", eighthNoteStemUp: "\uE1D7", eighthNoteStemDown: "\uE1D8", sixteenthNoteStemUp: "\uE1D9", halfNoteStemUp: "\uE1D3", halfNoteStemDown: "\uE1D4", wholeNote: "\uE1D2", augmentationDot: "\uE1E7", augmentationDotLine: "\uE1E7", accentAbove: "\uE4A0", staccatoAbove: "\uE4A2", wholeRest: "\uE4E3", halfRest: "\uE4E4", quarterRest: "\uE4E5", eighthRest: "\uE4E6", sharpInScore: "\uE262", flatInScore: "\uE260", naturalInScore: "\uE261", sharpKeySignature: "\uE262", flatKeySignature: "\uE260" };
const NOTE_STEM_DOWN_STEP_THRESHOLD = 4;
const NOTE_STEM_STEP_OFFSET = 2;
const WHAT_NOTE_STAFF_GAP = 18.9;

// Complete-bar time-signature questions use the same measurements and drawing
// rules as timesig.html. The SVG below is simply cropped after bar 1; the
// underlying stave continues briefly so it can fade naturally after the
// barline instead of ending abruptly.
const TIMESIG_PREVIEW = {
  staffLeft: 24,
  staffRight: 896,
  systemTop: 62,
  lineGap: 10,
  noteRx: 6.3,
  stemLength: 32,
  clefX: 32,
  firstBarStart: 117.44,
  firstBarEnd: 348.5,
};

const TIMESIG_RHYTHM_INFO = {
  semibreve: { beats:4, spacing: 8, stem: false, dots: 0 },
  "dotted-minim": { beats:3, spacing: 6, stem: true, dots: 1 },
  minim: { beats:2, spacing: 4, stem: true, dots: 0 },
  crotchet: { beats:1, spacing: 2.2, stem: true, dots: 0 },
  "dotted-crotchet": { beats:1.5, spacing: 3.1, stem: true, dots: 1 },
  "dotted-quaver": { beats:.75, spacing: 1.65, stem: true, dots: 1, beams: 1 },
  quaver: { beats:.5, spacing: 1.15, stem: true, dots: 0, beams: 1 },
  semiquaver: { beats:.25, spacing: .72, stem: true, dots: 0, beams: 2 },
};

const TIMESIG_GLYPH_RHYTHMS = {
  quarterNote: ["crotchet"],
  eighthNote: ["quaver"],
  sixteenthNote: ["semiquaver"],
  halfNote: ["minim"],
  dottedHalfNote: ["dotted-minim"],
  wholeNote: ["semibreve"],
  dottedQuarterNote: ["dotted-crotchet"],
  dottedEighthNote: ["dotted-quaver"],
  dottedQuaverSemiquaver: ["dotted-quaver", "semiquaver"],
  scotchSnap: ["semiquaver", "dotted-quaver"],
  pairedEighthNotes: ["quaver", "quaver"],
  fourSixteenthNotes: ["semiquaver", "semiquaver", "semiquaver", "semiquaver"],
  quaverTwoSemiquavers: ["quaver", "semiquaver", "semiquaver"],
  twoSemiquaversQuaver: ["semiquaver", "semiquaver", "quaver"],
  semiquaverQuaverSemiquaver: ["semiquaver", "quaver", "semiquaver"],
};

const N5_SIMPLE_TIME_PATTERNS = {
  "2/4": [
    ["minim"], ["crotchet", "crotchet"], ["quaver", "quaver", "crotchet"],
    ["crotchet", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver"],
    ["dotted-crotchet", "quaver"], ["quaver", "dotted-crotchet"],
    ["semiquaver-group-4", "crotchet"], ["quaver-2semiquavers", "crotchet"],
    ["2semiquavers-quaver", "crotchet"], ["dotted-quaver-semiquaver", "crotchet"],
  ],
  "3/4": [
    ["dotted-minim"], ["minim", "crotchet"], ["crotchet", "minim"],
    ["crotchet", "crotchet", "crotchet"], ["quaver", "quaver", "crotchet", "crotchet"],
    ["crotchet", "quaver", "quaver", "crotchet"], ["crotchet", "crotchet", "quaver", "quaver"],
    ["quaver", "quaver", "quaver", "quaver", "crotchet"], ["crotchet", "quaver", "quaver", "quaver", "quaver"],
    ["semiquaver-group-4", "crotchet", "crotchet"], ["crotchet", "quaver-2semiquavers", "crotchet"],
    ["crotchet", "crotchet", "2semiquavers-quaver"], ["dotted-quaver-semiquaver", "crotchet", "crotchet"],
  ],
  "4/4": [
    ["minim", "minim"], ["minim", "crotchet", "crotchet"], ["crotchet", "crotchet", "minim"],
    ["crotchet", "crotchet", "crotchet", "crotchet"], ["quaver", "quaver", "crotchet", "crotchet", "crotchet"],
    ["crotchet", "quaver", "quaver", "crotchet", "crotchet"], ["crotchet", "crotchet", "quaver", "quaver", "crotchet"],
    ["crotchet", "crotchet", "crotchet", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver", "minim"],
    ["minim", "quaver", "quaver", "quaver", "quaver"], ["quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver", "quaver"],
    ["semiquaver-group-4", "crotchet", "crotchet", "crotchet"], ["crotchet", "quaver-2semiquavers", "crotchet", "crotchet"],
    ["crotchet", "crotchet", "2semiquavers-quaver", "crotchet"], ["crotchet", "crotchet", "crotchet", "dotted-quaver-semiquaver"],
  ],
};

const TIMESIG_RHYTHM_TOKENS = {
  crotchet: ["crotchet"], minim: ["minim"], "dotted-minim": ["dotted-minim"], semibreve: ["semibreve"],
  quaver: ["quaver"], semiquaver: ["semiquaver"], "dotted-crotchet": ["dotted-crotchet"],
  "semiquaver-group-4": ["semiquaver", "semiquaver", "semiquaver", "semiquaver"],
  "quaver-2semiquavers": ["quaver", "semiquaver", "semiquaver"],
  "2semiquavers-quaver": ["semiquaver", "semiquaver", "quaver"],
  "dotted-quaver-semiquaver": ["dotted-quaver", "semiquaver"],
  "dotted-quaver-semiquaver-quaver": ["dotted-quaver", "semiquaver", "quaver"],
  "quaver-2semiquavers-quaver": ["quaver", "semiquaver", "semiquaver", "quaver"],
  "quaver-group-3": ["quaver", "quaver", "quaver"],
  "crotchet-quaver": ["crotchet", "quaver"],
  "quaver-crotchet": ["quaver", "crotchet"],
};

function timeSigRhythmInfo(rhythm) {
  return TIMESIG_RHYTHM_INFO[rhythm] || TIMESIG_RHYTHM_INFO.crotchet;
}

function timeSigYForStep(step) {
  return TIMESIG_PREVIEW.systemTop + TIMESIG_PREVIEW.lineGap * 4 - step * (TIMESIG_PREVIEW.lineGap / 2);
}

function timeSigStemGoesDown(step) {
  return step > 4;
}

function TimeSigCalibratedSymbol({ symbolKey, x, y }) {
  const actualSymbolKey = actualBravuraSymbolKey(symbolKey);
  const configuredSymbolKey = SHARED_NOTATION.symbols?.[symbolKey] ? symbolKey : actualSymbolKey;
  const settings = sharedNotationSymbol(configuredSymbolKey);
  const gap = TIMESIG_PREVIEW.lineGap;
  const adjustedX = x + gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
  const adjustedY = y + gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
  const transform = `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`;
  return <text className="millionaire-music-symbol" x={adjustedX} y={adjustedY} fontSize={gap * Number(settings.fontSizeScale || 3.4)} textAnchor="middle" transform={transform}>{bravuraSymbol(actualSymbolKey, NOTATION_FALLBACKS[actualSymbolKey] || "?")}</text>;
}

function timeSigStemData(item, x, stemDownOverride = null) {
  const y = timeSigYForStep(item.pitch.step);
  const stemDown = stemDownOverride ?? timeSigStemGoesDown(item.pitch.step);
  const stemX = stemDown ? x - TIMESIG_PREVIEW.noteRx : x + TIMESIG_PREVIEW.noteRx;
  const stemEndY = stemDown ? y + TIMESIG_PREVIEW.stemLength : y - TIMESIG_PREVIEW.stemLength;
  return { y, stemDown, stemX, stemEndY };
}

function timeSigNoteSymbolKey(rhythm, stemDown, beamed = false) {
  if (rhythm === "semibreve") return "wholeNote";
  if (rhythm === "minim" || rhythm === "dotted-minim") return stemDown ? "halfNoteStemDown" : "halfNoteStemUp";
  if (beamed) return stemDown ? "noteheadBlackStemDown" : "noteheadBlackStemUp";
  if (rhythm === "quaver" || rhythm === "dotted-quaver") return stemDown ? "eighthNoteStemDown" : "eighthNoteStemUp";
  if (rhythm === "semiquaver") return stemDown ? "sixteenthNoteStemDown" : "sixteenthNoteStemUp";
  return stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp";
}

function TimeSigPreviewNote({ item, x, stemDownOverride = null, forcedStemEndY = null, showFlag = true }) {
  const info = timeSigRhythmInfo(item.rhythm);
  const stem = timeSigStemData(item, x, stemDownOverride);
  const stemEndY = forcedStemEndY ?? stem.stemEndY;
  const beamed = showFlag === false;
  const dotKey = Math.abs(item.pitch.step % 2) === 1 ? "augmentationDotSpace" : "augmentationDotLine";
  const dotY = Math.abs(item.pitch.step % 2) === 1 ? stem.y : stem.y - TIMESIG_PREVIEW.lineGap * .25;
  const stemThickness = Math.max(1, TIMESIG_PREVIEW.lineGap * Number(SHARED_NOTATION.drawing?.stemThicknessScale || .12));
  return <g>
    <TimeSigCalibratedSymbol symbolKey={timeSigNoteSymbolKey(item.rhythm, stem.stemDown, beamed)} x={x} y={stem.y} />
    {beamed && info.stem && <line x1={stem.stemX} x2={stem.stemX} y1={stem.y} y2={stemEndY} stroke="currentColor" strokeWidth={stemThickness} />}
    {info.dots === 1 && <TimeSigCalibratedSymbol symbolKey={dotKey} x={x + TIMESIG_PREVIEW.lineGap * 1.3} y={dotY} />}
  </g>;
}

function timeSigBarNotePositions(notes, groupAfterBeats = null) {
  const groupGap = Number.isFinite(groupAfterBeats) ? 18 : 0;
  const totalUnits = notes.reduce((total, note) => total + timeSigRhythmInfo(note.rhythm).spacing, 0);
  const unitWidth = Math.max(1, TIMESIG_PREVIEW.firstBarEnd - 6 - (TIMESIG_PREVIEW.firstBarStart + 7) - groupGap) / Math.max(1, totalUnits);
  let cursor = TIMESIG_PREVIEW.firstBarStart + 7 + unitWidth * .35;
  let elapsedBeats = 0;
  return notes.map((note, index) => {
    const x = cursor;
    elapsedBeats += Number(timeSigRhythmInfo(note.rhythm).beats || 0);
    cursor += timeSigRhythmInfo(note.rhythm).spacing * unitWidth;
    if (index < notes.length-1 && Number.isFinite(groupAfterBeats) && Math.abs(elapsedBeats-groupAfterBeats)<.001) cursor += groupGap;
    return x;
  });
}

function timeSigBeamLineYAtX(x, start, end) {
  if (start.x === end.x) return start.y;
  return start.y + ((x - start.x) / (end.x - start.x)) * (end.y - start.y);
}

function timeSigBeamData(items, positions) {
  const averageStep = items.reduce((sum, item) => sum + item.pitch.step, 0) / items.length;
  const stemDown = averageStep > 4 || (averageStep === 4 && items[0].pitch.step > 4);
  const anchorStep = stemDown ? Math.max(...items.map((item) => item.pitch.step)) : Math.min(...items.map((item) => item.pitch.step));
  const anchorIndex = items.findIndex((item) => item.pitch.step === anchorStep);
  const startStem = timeSigStemData(items[0], positions[0], stemDown);
  const endStem = timeSigStemData(items.at(-1), positions.at(-1), stemDown);
  const anchorStem = timeSigStemData(items[anchorIndex], positions[anchorIndex], stemDown);
  const totalSlope = Math.max(-8, Math.min(8, (items.at(-1).pitch.step - items[0].pitch.step) * -2));
  const slopePerX = totalSlope / Math.max(1, endStem.stemX - startStem.stemX);
  return {
    stemDown,
    start: { x: startStem.stemX, y: anchorStem.stemEndY - slopePerX * (anchorStem.stemX - startStem.stemX) },
    end: { x: endStem.stemX, y: anchorStem.stemEndY + slopePerX * (endStem.stemX - anchorStem.stemX) },
  };
}

function timeSigQuaverGroups(notes) {
  const groups = [];
  let index = 0;
  while (index < notes.length) {
    const note = notes[index];
    const beamable = ["quaver", "semiquaver", "dotted-quaver"].includes(note.rhythm);
    if (!beamable || note.beamGroupId === null) { index += 1; continue; }
    const runStart = index;
    const groupId = note.beamGroupId;
    if (groupId === undefined) {
      while (index < notes.length && ["quaver", "semiquaver", "dotted-quaver"].includes(notes[index].rhythm) && notes[index].beamGroupId === undefined) index += 1;
    } else {
      while (index < notes.length && ["quaver", "semiquaver", "dotted-quaver"].includes(notes[index].rhythm) && notes[index].beamGroupId === groupId) index += 1;
    }
    const runEnd = index - 1;
    if (groupId !== undefined) {
      if (runEnd > runStart) groups.push({ start: runStart, end: runEnd });
      continue;
    }
    let groupStart = runStart;
    while (groupStart <= runEnd) {
      const remaining = runEnd - groupStart + 1;
      const groupSize = remaining >= 4 ? 4 : remaining === 3 ? 2 : remaining;
      const groupEnd = groupStart + groupSize - 1;
      if (groupEnd > groupStart) groups.push({ start: groupStart, end: groupEnd });
      groupStart = groupEnd + 1;
    }
  }
  return groups;
}

function TimeSigPreviewBeam({ beamData, groupNotes, groupPositions }) {
  const secondarySegments = [];
  let segmentStart = null;
  groupNotes.forEach((note, index) => {
    const isSemiquaver = timeSigRhythmInfo(note.rhythm).beams === 2;
    const nextIsSemiquaver = timeSigRhythmInfo(groupNotes[index + 1]?.rhythm).beams === 2;
    if (isSemiquaver && segmentStart === null) segmentStart = index;
    if (segmentStart !== null && (!nextIsSemiquaver || index === groupNotes.length - 1)) {
      secondarySegments.push({ startIndex: segmentStart, endIndex: index, isHook: index === segmentStart });
      segmentStart = null;
    }
  });
  const stemXFor = (index) => groupPositions[index] + TIMESIG_PREVIEW.noteRx - 1;
  return <g>
    <line x1={beamData.start.x - .5} y1={beamData.start.y} x2={beamData.end.x + .5} y2={beamData.end.y} stroke="currentColor" strokeWidth="4" strokeLinecap="butt" />
    {secondarySegments.map((segment, index) => {
      const x1 = stemXFor(segment.startIndex) + 1;
      const y1 = timeSigBeamLineYAtX(x1, beamData.start, beamData.end) + 7;
      const x2 = segment.isHook ? x1 + (segment.startIndex > 0 ? -14 : 14) : stemXFor(segment.endIndex) + 1;
      const y2 = timeSigBeamLineYAtX(x2, beamData.start, beamData.end) + 7;
      return <line key={index} x1={x1 - .5} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="4" strokeLinecap="butt" />;
    })}
  </g>;
}

function normaliseFiveFourRhythmTokens(notation) {
  const tokens = Array.isArray(notation.rhythmTokens) ? notation.rhythmTokens : [];
  if (notation.timeSignature !== "5/4") return tokens;
  const signature = tokens.join("|");
  if (signature === "minim|minim|crotchet") return ["minim", "crotchet", "minim"];
  if (signature === "dotted-crotchet|quaver|dotted-minim") return ["dotted-crotchet", "quaver", "crotchet", "minim"];
  return tokens;
}

function timeSigPreviewNotes(notation) {
  const notes = [];
  let pitchIndex = 0;
  const usesRhythmTokens = Array.isArray(notation.rhythmTokens);
  const source = usesRhythmTokens ? normaliseFiveFourRhythmTokens(notation) : notation.glyphs || [];
  source.forEach((token, tokenIndex) => {
    const rhythms = usesRhythmTokens ? TIMESIG_RHYTHM_TOKENS[token] || ["crotchet"] : TIMESIG_GLYPH_RHYTHMS[token] || ["crotchet"];
    const isExplicitGroup = rhythms.length > 1 && rhythms.every((rhythm) => ["quaver", "dotted-quaver", "semiquaver"].includes(rhythm));
    const beamGroupId = isExplicitGroup ? `beam-${tokenIndex}` : usesRhythmTokens ? undefined : null;
    rhythms.forEach((rhythm) => {
      const step = [2, 3, 4, 3, 2, 1, 2, 0][pitchIndex % 8];
      notes.push({ rhythm, pitch: { step }, beamGroupId });
      pitchIndex += 1;
    });
  });
  return notes;
}

function TimeSigFirstBarNotation({ notation }) {
  const notes = timeSigPreviewNotes(notation);
  const groupAfterBeats = notation.timeSignature === "5/4" ? 3 : notation.groupAfterBeats;
  const positions = timeSigBarNotePositions(notes, groupAfterBeats);
  const groups = timeSigQuaverGroups(notes);
  const fadeStart = TIMESIG_PREVIEW.firstBarEnd + 1;
  return <svg className="millionaire-timesig-first-bar" viewBox="14 18 365 112" aria-hidden="true">
    <defs><linearGradient id="millionaire-timesig-bar-fade" x1={fadeStart} y1="0" x2="379" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#fff" stopOpacity="1" /></linearGradient></defs>
    <rect x="14" y="18" width="365" height="112" fill="#fff" />
    {Array.from({ length: 5 }, (_, index) => <line key={index} x1={TIMESIG_PREVIEW.staffLeft} x2={TIMESIG_PREVIEW.staffRight} y1={TIMESIG_PREVIEW.systemTop + index * TIMESIG_PREVIEW.lineGap} y2={TIMESIG_PREVIEW.systemTop + index * TIMESIG_PREVIEW.lineGap} stroke="currentColor" strokeWidth="1.2" />)}
    <TimeSigCalibratedSymbol symbolKey="gClef" x={TIMESIG_PREVIEW.clefX + TIMESIG_PREVIEW.lineGap * 2.3} y={timeSigYForStep(2)} />
    {notes.map((note, index) => {
      const group = groups.find((candidate) => index >= candidate.start && index <= candidate.end);
      if (!group) return <TimeSigPreviewNote key={index} item={note} x={positions[index]} />;
      const groupNotes = notes.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beamData = timeSigBeamData(groupNotes, groupPositions);
      const stem = timeSigStemData(note, positions[index], beamData.stemDown);
      return <TimeSigPreviewNote key={index} item={note} x={positions[index]} stemDownOverride={beamData.stemDown} forcedStemEndY={timeSigBeamLineYAtX(stem.stemX, beamData.start, beamData.end)} showFlag={false} />;
    })}
    {groups.map((group, index) => {
      const groupNotes = notes.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      return <TimeSigPreviewBeam key={index} beamData={timeSigBeamData(groupNotes, groupPositions)} groupNotes={groupNotes} groupPositions={groupPositions} />;
    })}
    <line x1={TIMESIG_PREVIEW.firstBarEnd} x2={TIMESIG_PREVIEW.firstBarEnd} y1={TIMESIG_PREVIEW.systemTop} y2={TIMESIG_PREVIEW.systemTop + TIMESIG_PREVIEW.lineGap * 4} stroke="currentColor" strokeWidth="1.4" />
    <rect x={fadeStart} y="18" width={379 - fadeStart} height="112" fill="url(#millionaire-timesig-bar-fade)" />
  </svg>;
}

const RESTS_PREVIEW = {
  systemTop: 150,
  lineGap: 10,
  noteRx: 6.3,
  stemLength: 32,
  staffStart: 154.8,
  clefX: 185.8,
  timeSignatureX: 260.8,
  barStart: 261.776,
  barEnd: 520,
};

const RESTS_PREVIEW_BEATS = {
  quarterNote: 1,
  eighthNote: .5,
  sixteenthNote: .25,
  halfNote: 2,
  dottedHalfNote: 3,
  wholeNote: 4,
  dottedQuarterNote: 1.5,
  dottedEighthNote: .75,
  dottedQuaverSemiquaver: 1,
  scotchSnap: 1,
  pairedEighthNotes: 1,
  fourSixteenthNotes: 1,
  quaverTwoSemiquavers: 1,
  twoSemiquaversQuaver: 1,
  semiquaverQuaverSemiquaver: 1,
};

function restsYForStep(step) {
  return RESTS_PREVIEW.systemTop + RESTS_PREVIEW.lineGap * 4 - step * (RESTS_PREVIEW.lineGap / 2);
}

function restsMissingRhythm(notation) {
  const shownBeats = (notation.glyphs || []).reduce((total, glyph) => total + (glyph === "blank" ? 0 : Number(RESTS_PREVIEW_BEATS[glyph] || 0)), 0);
  const missingBeats = Math.max(.25, Number(notation.time?.[0] || 4) - shownBeats);
  if (missingBeats >= 4) return "wholeNote";
  if (missingBeats >= 3) return "dottedHalfNote";
  if (missingBeats >= 2) return "halfNote";
  if (missingBeats >= 1) return "quarterNote";
  if (missingBeats >= .5) return "eighthNote";
  return "sixteenthNote";
}

function restsPreviewItems(notation) {
  const items = [];
  let pitchIndex = 0;
  (notation.glyphs || []).forEach((glyph, glyphIndex) => {
    if (glyph === "blank") {
      const missingGlyph = restsMissingRhythm(notation);
      items.push({ rhythm: "missing", units: Number(RESTS_PREVIEW_BEATS[missingGlyph] || 1) * 4, missingGlyph });
      return;
    }
    const rhythms = TIMESIG_GLYPH_RHYTHMS[glyph] || ["crotchet"];
    const beamGroupId = rhythms.length > 1 && rhythms.every((rhythm) => ["quaver", "dotted-quaver", "semiquaver"].includes(rhythm)) ? `rests-beam-${glyphIndex}` : null;
    rhythms.forEach((rhythm) => {
      const step = [2, 3, 4, 3, 2, 1, 2, 0][pitchIndex % 8];
      items.push({ rhythm, pitch: { step }, beamGroupId });
      pitchIndex += 1;
    });
  });
  return items;
}

function restsItemSpacing(item) {
  if (item.rhythm === "missing") return Math.max(1.15, item.units / 2);
  return timeSigRhythmInfo(item.rhythm).spacing;
}

function restsBarNotePositions(items, groupAfterBeats = null) {
  const startX = RESTS_PREVIEW.barStart + 7;
  const endX = RESTS_PREVIEW.barEnd - 6;
  const groupGap = Number.isFinite(groupAfterBeats) ? 18 : 0;
  const totalSpacing = items.reduce((sum, item) => sum + restsItemSpacing(item), 0);
  const unitWidth = Math.max(1, endX - startX - groupGap) / Math.max(1, totalSpacing);
  let cursor = startX + unitWidth * .35;
  let elapsedBeats = 0;
  return items.map((item, index) => {
    const x = cursor;
    elapsedBeats += item.rhythm === "missing" ? Number(item.units || 0)/4 : Number(timeSigRhythmInfo(item.rhythm).beats || 0);
    cursor += restsItemSpacing(item) * unitWidth;
    if (index < items.length-1 && Number.isFinite(groupAfterBeats) && Math.abs(elapsedBeats-groupAfterBeats)<.001) cursor += groupGap;
    return x;
  });
}

function RestsPreviewTimeSignature({ time }) {
  const [top, bottom] = time;
  const symbolKey = `timeSig${top}${bottom}`;
  const settings = sharedNotationSymbol(symbolKey);
  const anchorY = restsYForStep(5.3);
  const adjustedX = RESTS_PREVIEW.timeSignatureX + RESTS_PREVIEW.lineGap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
  const adjustedY = anchorY + RESTS_PREVIEW.lineGap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
  const fontSize = RESTS_PREVIEW.lineGap * Number(settings.fontSizeScale || 3.5);
  const digitGlyphs = (value) => String(value).split("").map((digit) => bravuraSymbol(`timeSig${digit}`, TIME_DIGITS[digit])).join("");
  return <g className="millionaire-music-symbol" transform={`translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`}>
    <text x={adjustedX} y={adjustedY - fontSize * .14} fontSize={fontSize} textAnchor="middle">{digitGlyphs(top)}</text>
    <text x={adjustedX} y={adjustedY + fontSize * .43} fontSize={fontSize} textAnchor="middle">{digitGlyphs(bottom)}</text>
  </g>;
}

function restsStemData(item, x, stemDownOverride = null) {
  const y = restsYForStep(item.pitch.step);
  const stemDown = stemDownOverride ?? item.pitch.step > 4;
  const stemX = stemDown ? x - RESTS_PREVIEW.noteRx : x + RESTS_PREVIEW.noteRx;
  const stemEndY = stemDown ? y + RESTS_PREVIEW.stemLength : y - RESTS_PREVIEW.stemLength;
  return { y, stemDown, stemX, stemEndY };
}

function RestsPreviewNote({ item, x, stemDownOverride = null, forcedStemEndY = null, showFlag = true }) {
  const info = timeSigRhythmInfo(item.rhythm);
  const stem = restsStemData(item, x, stemDownOverride);
  const beamed = showFlag === false;
  const dotKey = Math.abs(item.pitch.step % 2) === 1 ? "augmentationDotSpace" : "augmentationDotLine";
  const dotY = Math.abs(item.pitch.step % 2) === 1 ? stem.y : stem.y - RESTS_PREVIEW.lineGap * .25;
  const stemThickness = Math.max(1, RESTS_PREVIEW.lineGap * Number(SHARED_NOTATION.drawing?.stemThicknessScale || .12));
  return <g>
    <TimeSigCalibratedSymbol symbolKey={timeSigNoteSymbolKey(item.rhythm, stem.stemDown, beamed)} x={x} y={stem.y} />
    {beamed && info.stem && <line x1={stem.stemX} x2={stem.stemX} y1={stem.y} y2={forcedStemEndY ?? stem.stemEndY} stroke="currentColor" strokeWidth={stemThickness} />}
    {info.dots === 1 && <TimeSigCalibratedSymbol symbolKey={dotKey} x={x + RESTS_PREVIEW.lineGap * 1.3} y={dotY} />}
  </g>;
}

function restsBeamData(items, positions) {
  const settings = sharedNotationSymbol("quaverBeam");
  const averageStep = items.reduce((sum, item) => sum + item.pitch.step, 0) / items.length;
  const stemDown = averageStep > 4;
  const xOffset = RESTS_PREVIEW.lineGap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
  const yOffset = RESTS_PREVIEW.lineGap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
  const stemLength = RESTS_PREVIEW.stemLength * Number(settings.heightScale || 1);
  const beamWidthAdjust = RESTS_PREVIEW.lineGap * Number(settings.widthScale || 1) - RESTS_PREVIEW.lineGap;
  const firstY = restsYForStep(items[0].pitch.step);
  const lastY = restsYForStep(items.at(-1).pitch.step);
  const firstStemX = positions[0] + xOffset + (stemDown ? -RESTS_PREVIEW.noteRx : RESTS_PREVIEW.noteRx);
  const lastStemX = positions.at(-1) + xOffset + (stemDown ? -RESTS_PREVIEW.noteRx : RESTS_PREVIEW.noteRx);
  return { stemDown, start: { x: firstStemX - beamWidthAdjust, y: firstY + yOffset + (stemDown ? stemLength : -stemLength) }, end: { x: lastStemX + beamWidthAdjust, y: lastY + yOffset + (stemDown ? stemLength : -stemLength) } };
}

function RestsPreviewBeam({ beamData, groupItems, groupPositions }) {
  const settings = sharedNotationSymbol("quaverBeam");
  const secondarySettings = sharedNotationSymbol("semiquaverBeam");
  const xOffset = RESTS_PREVIEW.lineGap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
  const secondaryWidthAdjust = RESTS_PREVIEW.lineGap * Number(secondarySettings.widthScale || 1) - RESTS_PREVIEW.lineGap;
  const secondaryOffset = (beamData.stemDown ? -1 : 1) * RESTS_PREVIEW.lineGap * .72 * Number(secondarySettings.heightScale || 1);
  const thickness = Math.max(1, RESTS_PREVIEW.lineGap * Number(SHARED_NOTATION.drawing?.beamThicknessScale || .42) * Number(settings.fontSizeScale || 1));
  const polygon = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const normalX = (-dy / length) * (thickness / 2);
    const normalY = (dx / length) * (thickness / 2);
    return `${x1 + normalX},${y1 + normalY} ${x2 + normalX},${y2 + normalY} ${x2 - normalX},${y2 - normalY} ${x1 - normalX},${y1 - normalY}`;
  };
  const segments = [];
  let start = null;
  groupItems.forEach((item, index) => {
    const isSemi = timeSigRhythmInfo(item.rhythm).beams === 2;
    const nextIsSemi = timeSigRhythmInfo(groupItems[index + 1]?.rhythm).beams === 2;
    if (isSemi && start === null) start = index;
    if (start !== null && (!nextIsSemi || index === groupItems.length - 1)) { segments.push({ startIndex: start, endIndex: index, hook: index === start }); start = null; }
  });
  const stemX = (index) => groupPositions[index] + xOffset + (beamData.stemDown ? -RESTS_PREVIEW.noteRx : RESTS_PREVIEW.noteRx);
  return <g>
    <polygon points={polygon(beamData.start.x, beamData.start.y, beamData.end.x, beamData.end.y)} fill="currentColor" />
    {segments.map((segment, index) => {
      const x1 = stemX(segment.startIndex) - secondaryWidthAdjust;
      const y1 = timeSigBeamLineYAtX(x1, beamData.start, beamData.end) + secondaryOffset;
      const x2 = segment.hook ? x1 + (segment.startIndex > 0 ? -14 : 14) : stemX(segment.endIndex) + secondaryWidthAdjust;
      const y2 = timeSigBeamLineYAtX(x2, beamData.start, beamData.end) + secondaryOffset;
      return <polygon key={index} points={polygon(x1, y1, x2, y2)} fill="currentColor" />;
    })}
  </g>;
}

function RestsFirstBarNotation({ notation, selectedRhythm = null }) {
  const items = restsPreviewItems(notation);
  const positions = restsBarNotePositions(items, notation.groupAfterBeats);
  const groups = timeSigQuaverGroups(items);
  const fadeStart = RESTS_PREVIEW.barEnd + 1;
  return <svg className="millionaire-rests-first-bar" viewBox="135 94 415 116" aria-hidden="true">
    <defs><linearGradient id="millionaire-rests-bar-fade" x1={fadeStart} y1="0" x2="550" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#fff" stopOpacity="1" /></linearGradient></defs>
    <rect x="135" y="94" width="415" height="116" fill="#fff" />
    {Array.from({ length: 5 }, (_, index) => <line key={index} x1={RESTS_PREVIEW.staffStart} x2="550" y1={RESTS_PREVIEW.systemTop + index * RESTS_PREVIEW.lineGap} y2={RESTS_PREVIEW.systemTop + index * RESTS_PREVIEW.lineGap} stroke="currentColor" strokeWidth="1.2" />)}
    <TimeSigCalibratedSymbol symbolKey="gClef" x={RESTS_PREVIEW.clefX} y={restsYForStep(2)} />
    <RestsPreviewTimeSignature time={notation.time} />
    {items.map((item, index) => {
      if (item.rhythm === "missing") {
        const outlineWidth = Math.max(40, Math.min(58, item.units * 8));
        const selectedItem = selectedRhythm ? { rhythm: selectedRhythm === "dottedHalfNote" ? "dotted-minim" : selectedRhythm === "wholeNote" ? "semibreve" : selectedRhythm === "halfNote" ? "minim" : selectedRhythm === "eighthNote" ? "quaver" : selectedRhythm === "sixteenthNote" ? "semiquaver" : "crotchet", pitch: { step: 3 } } : null;
        return <g key={index}>
          <rect x={positions[index] - outlineWidth / 2 + 4} y={RESTS_PREVIEW.systemTop - 9} width={outlineWidth} height={RESTS_PREVIEW.lineGap * 4 + 17} rx="7" ry="7" fill="none" stroke="#78716c" strokeWidth="1.6" />
          {selectedItem && <RestsPreviewNote item={selectedItem} x={positions[index]} />}
        </g>;
      }
      const group = groups.find((candidate) => index >= candidate.start && index <= candidate.end);
      if (!group) return <RestsPreviewNote key={index} item={item} x={positions[index]} />;
      const groupItems = items.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beamData = restsBeamData(groupItems, groupPositions);
      const stem = restsStemData(item, positions[index], beamData.stemDown);
      return <RestsPreviewNote key={index} item={item} x={positions[index]} stemDownOverride={beamData.stemDown} forcedStemEndY={timeSigBeamLineYAtX(stem.stemX, beamData.start, beamData.end)} showFlag={false} />;
    })}
    {groups.map((group, index) => {
      const groupItems = items.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      return <RestsPreviewBeam key={index} beamData={restsBeamData(groupItems, groupPositions)} groupItems={groupItems} groupPositions={groupPositions} />;
    })}
    <line x1={RESTS_PREVIEW.barEnd} x2={RESTS_PREVIEW.barEnd} y1={RESTS_PREVIEW.systemTop} y2={RESTS_PREVIEW.systemTop + RESTS_PREVIEW.lineGap * 4} stroke="currentColor" strokeWidth="1.4" />
    <rect x={fadeStart} y="94" width={550 - fadeStart} height="116" fill="url(#millionaire-rests-bar-fade)" />
  </svg>;
}

const HIGHER_REST_UNITS = { "quaver-rest": 2, "crotchet-rest": 4, "dotted-crotchet-rest": 6, "minim-rest": 8, "dotted-minim-rest": 12, "semibreve-rest": 16 };

// This is the same token expansion used by rests.html. Explicit token groups
// carry their own beam id; isolated quavers stay separate, which preserves
// the dotted-crotchet beat groupings in 6/8, 9/8 and 12/8.
function higherRestBarItems(notation) {
  const items = [];
  let pitchIndex = 0;
  let beamIndex = 0;
  const addTokens = (tokens) => (tokens || []).forEach((token) => {
    const rhythms = TIMESIG_RHYTHM_TOKENS[token] || [token];
    const explicitlyBeamed = ["quaver-group-2", "quaver-group-3", "semiquaver-group-4", "quaver-2semiquavers", "2semiquavers-quaver", "dotted-quaver-semiquaver"].includes(token);
    const beamGroupId = explicitlyBeamed && rhythms.length > 1 ? `higher-rest-beam-${beamIndex++}` : null;
    rhythms.forEach((rhythm) => {
      const step = [2, 3, 4, 3, 2, 1, 2, 0][pitchIndex % 8];
      items.push({ rhythm, pitch: { step }, beamGroupId });
      pitchIndex += 1;
    });
  });
  addTokens(notation.before);
  items.push({ rhythm: "missing", units: HIGHER_REST_UNITS[notation.missingRest] || 4 });
  addTokens(notation.after);
  return items;
}

function HigherRestBarNotation({ notation, selectedRest = null }) {
  const items = higherRestBarItems(notation);
  const positions = restsBarNotePositions(items, notation.groupAfterBeats);
  const groups = timeSigQuaverGroups(items);
  return <svg className="millionaire-higher-rest-bar" viewBox="135 94 415 116" aria-hidden="true">
    <rect x="135" y="94" width="415" height="116" fill="#fff" />
    {Array.from({ length: 5 }, (_, index) => <line key={index} x1={RESTS_PREVIEW.staffStart} x2="550" y1={RESTS_PREVIEW.systemTop + index * RESTS_PREVIEW.lineGap} y2={RESTS_PREVIEW.systemTop + index * RESTS_PREVIEW.lineGap} stroke="currentColor" strokeWidth="1.2" />)}
    <TimeSigCalibratedSymbol symbolKey="gClef" x={RESTS_PREVIEW.clefX} y={restsYForStep(2)} />
    <RestsPreviewTimeSignature time={notation.time} />
    {items.map((item, index) => {
      if (item.rhythm === "missing") {
        const width = Math.max(40, Math.min(58, item.units * 8));
        const missingTargetX = positions[index] + 10;
        return <g key={index}>
          <rect x={missingTargetX - width / 2} y={RESTS_PREVIEW.systemTop - 9} width={width} height={RESTS_PREVIEW.lineGap * 4 + 17} rx="7" ry="7" fill="none" stroke="#78716c" strokeWidth="1.6" />
          {selectedRest && <HigherRestMark rest={selectedRest} x={missingTargetX} y={restsYForStep(4)} gap={RESTS_PREVIEW.lineGap} />}
        </g>;
      }
      const group = groups.find((candidate) => index >= candidate.start && index <= candidate.end);
      if (!group) return <RestsPreviewNote key={index} item={item} x={positions[index]} />;
      const groupItems = items.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      const beamData = restsBeamData(groupItems, groupPositions);
      const stem = restsStemData(item, positions[index], beamData.stemDown);
      return <RestsPreviewNote key={index} item={item} x={positions[index]} stemDownOverride={beamData.stemDown} forcedStemEndY={timeSigBeamLineYAtX(stem.stemX, beamData.start, beamData.end)} showFlag={false} />;
    })}
    {groups.map((group, index) => {
      const groupItems = items.slice(group.start, group.end + 1);
      const groupPositions = positions.slice(group.start, group.end + 1);
      return <RestsPreviewBeam key={index} beamData={restsBeamData(groupItems, groupPositions)} groupItems={groupItems} groupPositions={groupPositions} />;
    })}
    <line x1={RESTS_PREVIEW.barEnd} x2={RESTS_PREVIEW.barEnd} y1={RESTS_PREVIEW.systemTop} y2={RESTS_PREVIEW.systemTop + RESTS_PREVIEW.lineGap * 4} stroke="currentColor" strokeWidth="1.4" />
  </svg>;
}

function sharedNotationSymbol(symbolKey) {
  const settings = SHARED_NOTATION.symbols?.[symbolKey] ?? {};
  return {
    fontSizeScale: Number(settings.fontSizeScale || 3.4),
    xOffsetScale: Number(settings.xOffsetScale || 0),
    yOffsetScale: Number(settings.yOffsetScale || 0),
    widthScale: Number(settings.widthScale || 1),
    heightScale: Number(settings.heightScale || 1),
    opticalXOffset: Number(settings.opticalXOffset || 0),
    opticalYOffset: Number(settings.opticalYOffset || 0),
  };
}

function actualBravuraSymbolKey(symbolKey) {
  if (symbolKey === "noteheadBlackStemUp" || symbolKey === "noteheadBlackStemDown") return "noteheadBlack";
  if (symbolKey === "augmentationDotLine" || symbolKey === "augmentationDotSpace") return "augmentationDot";
  return symbolKey;
}

function accidentalSymbolKey(accidental, context = "score") {
  if (context === "keySignature") return accidental === "sharp" ? "sharpKeySignature" : "flatKeySignature";
  if (accidental === "sharp") return "sharpInScore";
  if (accidental === "flat") return "flatInScore";
  return "naturalInScore";
}

// This is the same calibrated Bravura-symbol approach used by Practice
// Questions, kept small here because Millionaire only needs a single stave.
function CalibratedNotationSymbol({ symbolKey, x, y, gap, settingOverrides = {} }) {
  const settings = { ...sharedNotationSymbol(symbolKey), ...settingOverrides };
  const actualSymbolKey = actualBravuraSymbolKey(symbolKey);
  const adjustedX = x + gap * settings.xOffsetScale + settings.opticalXOffset;
  const adjustedY = y + gap * settings.yOffsetScale + settings.opticalYOffset;
  const transform = `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale} ${settings.heightScale}) translate(${-adjustedX} ${-adjustedY})`;
  return <text className="millionaire-music-symbol" x={adjustedX} y={adjustedY} fontSize={gap * settings.fontSizeScale} textAnchor="middle" transform={transform}>{bravuraSymbol(actualSymbolKey, NOTATION_FALLBACKS[actualSymbolKey] || "?")}</text>;
}

function StaffNotation({ notation, compactStave = false, whatNoteQuestion = false }) {
  const pitches = notation.kind === "note" ? [notation.pitch] : notation.pitches || [];
  const bassClef = notation.clef === "bass";
  const pitchIndex = bassClef ? BASS_PITCH_INDEX : PITCH_INDEX;
  const staffGap = whatNoteQuestion ? WHAT_NOTE_STAFF_GAP : Math.max(10, Number(SHARED_NOTATION.stave?.lineGap || 14));
  const accidentalXOffset = Number(notation.accidentalXOffset || 0);
  const clefXOffset = Number(notation.clefXOffset || 0);
  const noteXOffset = Number(notation.noteXOffset || 0);
  const staveInset = Math.max(0, Number(notation.staveInset || 0));
  const left = 52 + staveInset;
  const fullRight = 462 - staveInset;
  const compactSpanScale = 0.72;
  const right = compactStave ? left + (fullRight - left) * compactSpanScale : fullRight;
  const top = 36;
  const bottom = top + staffGap * 4;
  const fullLeft = left;
  const fullStartPositions = {
    1: whatNoteQuestion ? 258 : 280,
    2: 225,
    3: 174
  };
  const fullStart = whatNoteQuestion ? 258 : (fullStartPositions[pitches.length] || 174);
  const compactStart = fullLeft + (fullStart - fullLeft) * compactSpanScale;
  const noteStart = compactStave ? compactStart : fullStart;
  const fullSpacing = pitches.length > 1 ? Math.min(62, 196 / Math.max(1, pitches.length - 1)) : 0;
  const noteSpacing = compactStave ? fullSpacing * compactSpanScale : fullSpacing;
  const staffFadeId = notation.kind === "melody" ? "millionaire-melody-staff-line-fade" : "millionaire-staff-line-fade";
  const staffClassName = `millionaire-staff${Number(notation.notationZoom) === 1.15 ? " is-enharmonic-focus" : ""}`;
  return <svg className={staffClassName} viewBox="30 10 440 130" aria-hidden="true">
    <defs><linearGradient id={staffFadeId} x1={left} y1="0" x2={right} y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor" stopOpacity="1" /><stop offset="84%" stopColor="currentColor" stopOpacity="1" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-staff-line" x1={left} x2={right} y1={top + index * staffGap} y2={top + index * staffGap} style={{ stroke: `url(#${staffFadeId})` }} />)}
    {notation.showClef !== false && <CalibratedNotationSymbol symbolKey={bassClef ? "fClef" : "gClef"} x={94+clefXOffset} y={bassClef ? bottom - staffGap * 3 : bottom - staffGap} gap={staffGap} />}
    {pitches.map((pitch, index) => {
      const position = pitchIndex[pitch] ?? 4;
      const y = bottom - (position - 2) * staffGap / 2;
      const x = noteStart + noteXOffset + index * noteSpacing + (notation.kind === "melody" ? (index === 0 ? -40 : -15) : 0);
      const step = position - NOTE_STEM_STEP_OFFSET;
      const stemDown = step > NOTE_STEM_DOWN_STEP_THRESHOLD;
      const ledgerAccidentalXOffset = position <= 0 || position >= 12 ? -10 : 0;
      const ledgerPositions = [];
      if (position <= 0) for (let ledger = 0; ledger >= position; ledger -= 2) ledgerPositions.push(ledger);
      if (position >= 12) for (let ledger = 12; ledger <= position; ledger += 2) ledgerPositions.push(ledger);
      return <React.Fragment key={`${pitch}-${index}`}>
        {ledgerPositions.map((ledger) => {
          const ledgerY = bottom - (ledger - 2) * staffGap / 2;
          return <line key={ledger} className="millionaire-ledger" x1={x - staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} x2={x + staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} y1={ledgerY} y2={ledgerY} />;
        })}
        {(notation.accidentals?.[index] || (index === 0 ? notation.accidental : null)) && <CalibratedNotationSymbol symbolKey={accidentalSymbolKey(notation.accidentals?.[index] || notation.accidental)} x={x - staffGap * 1.65 + accidentalXOffset + ledgerAccidentalXOffset} y={y} gap={staffGap} settingOverrides={{ fontSizeScale: 3.05 }} />}
        <CalibratedNotationSymbol symbolKey={stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={x} y={y} gap={staffGap} />
      </React.Fragment>;
    })}
  </svg>;
}

function SignatureMarks({ signature, top, bottom, gap, startX = 140, clef = "treble" }) {
  const signatureCount = {
    "G major": ["sharp", 1], "E minor": ["sharp", 1], "D major": ["sharp", 2],
    "F major": ["flat", 1], "D minor": ["flat", 1], "B flat major": ["flat", 2],
  }[signature];
  const positions = clef === "bass"
    ? { sharp: [8, 5, 9, 6, 10, 7, 11], flat: [4, 7, 3, 6, 2, 5, 1] }
    : { sharp: [10, 7, 11, 8, 12, 9, 13], flat: [6, 9, 5, 8, 4, 7, 3] };
  const marks = signatureCount ? positions[signatureCount[0]].slice(0, signatureCount[1]).map((position) => ({ accidental: signatureCount[0], position })) : [];
  return marks.map((mark, index) => {
    const y = bottom - (mark.position - 2) * gap / 2;
    return <CalibratedNotationSymbol key={`${mark.accidental}-${index}`} symbolKey={accidentalSymbolKey(mark.accidental, "keySignature")} x={startX + index * gap * 1.25} y={y} gap={gap} />;
  });
}

function KeySignatureNotation({ notation }) {
  const gap = 14;
  const top = 36;
  const bottom = top + gap * 4;
  return <svg className="millionaire-key-signature" viewBox="30 10 440 130" aria-hidden="true">
    <defs><linearGradient id="millionaire-key-signature-fade" x1="52" y1="0" x2="462" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor" /><stop offset="84%" stopColor="currentColor" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-staff-line" x1="52" x2="462" y1={top + index * gap} y2={top + index * gap} style={{ stroke: "url(#millionaire-key-signature-fade)" }} />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom - gap} gap={gap} />
    <SignatureMarks signature={notation.signature} top={top} bottom={bottom} gap={gap} startX={130} />
  </svg>;
}

function IntervalNotation({ notation }) {
  if (notation.matchStepLeapLayout) return <StaffNotation notation={{ ...notation, kind: "melody" }} whatNoteQuestion={true} />;
  const gap = 14;
  const top = 36;
  const bottom = top + gap * 4;
  const noteXOffset = Number(notation.noteXOffset || 0);
  const keySignatureXOffset = Number(notation.keySignatureXOffset || 0);
  const noteXs = [260 + noteXOffset, 345 + noteXOffset];
  return <svg className={`millionaire-interval${notation.toneSemitoneZoom ? " is-tone-semitone-interval" : ""}`} viewBox="30 10 440 130" aria-hidden="true">
    <defs><linearGradient id="millionaire-interval-fade" x1="52" y1="0" x2="462" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor" /><stop offset="84%" stopColor="currentColor" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-staff-line" x1="52" x2="462" y1={top + index * gap} y2={top + index * gap} style={{ stroke: "url(#millionaire-interval-fade)" }} />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom - gap} gap={gap} />
    <SignatureMarks signature={notation.keySignature} top={top} bottom={bottom} gap={gap} startX={140 + keySignatureXOffset} />
    {(notation.pitches || []).slice(0, 2).map((pitch, index) => {
      const position = PITCH_INDEX[pitch] ?? 4;
      const y = bottom - (position - 2) * gap / 2;
      const stemDown = position - NOTE_STEM_STEP_OFFSET > NOTE_STEM_DOWN_STEP_THRESHOLD;
      return <React.Fragment key={`${pitch}-${index}`}>
        {notation.accidentals?.[index] && <CalibratedNotationSymbol symbolKey={accidentalSymbolKey(notation.accidentals[index])} x={noteXs[index] - gap * 1.7} y={y} gap={gap} settingOverrides={{ fontSizeScale: 3.05 }} />}
        <CalibratedNotationSymbol symbolKey={stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={noteXs[index]} y={y} gap={gap} />
      </React.Fragment>;
    })}
  </svg>;
}

function AHIntervalNotation({ notation }) {
  // Directly match intervals.html at Advanced Higher: score size, stave,
  // responsive crop, note anchors, key signatures, ledger lines and stems.
  const width=920, height=420, left=222, right=684, top=132, gap=21;
  const bottom=top+gap*4;
  const noteXs=[392,536];
  const yForStep=(step)=>bottom-step*(gap/2);
  const signatureMarks={
    "D major":[["sharp",8],["sharp",5]],
    "F major":[["flat",4]],
    "B flat major":[["flat",4],["flat",7]],
  }[notation.keySignature]||[];
  const ledgerSettings=SHARED_NOTATION.symbols?.ledgerLines||{};
  const ledgerHalfWidth=gap*Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale||2.4)*Number(ledgerSettings.widthScale||1)/2;
  const ledgerThickness=Math.max(1,gap*Number(SHARED_NOTATION.drawing?.ledgerLineThicknessScale||.11)*Number(ledgerSettings.heightScale||1));
  const ledgerXOffset=gap*Number(ledgerSettings.xOffsetScale||0)+Number(ledgerSettings.opticalXOffset||0);
  const ledgerYOffset=gap*Number(ledgerSettings.yOffsetScale||0)+Number(ledgerSettings.opticalYOffset||0);
  const ledgerSteps=(step)=>{const lines=[];if(step<=-2)for(let ledger=-2;ledger>=step;ledger-=2)lines.push(ledger);if(step>=10)for(let ledger=10;ledger<=step;ledger+=2)lines.push(ledger);return lines;};
  return <svg className="millionaire-ah-interval" viewBox={`195 96 ${width/1.806} ${height/1.806}`} aria-hidden="true">
    <defs><linearGradient id="millionaire-ah-interval-staff-fade" x1={left} y1="0" x2={right} y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor"/><stop offset="86%" stopColor="currentColor"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
    <rect width={width} height={height} fill="#fff"/>
    {Array.from({length:5},(_,index)=><line key={index} x1={left} x2={right} y1={top+index*gap} y2={top+index*gap} stroke="url(#millionaire-ah-interval-staff-fade)" strokeWidth="1.5"/>)}
    <CalibratedNotationSymbol symbolKey="gClef" x={left+gap*2.5} y={yForStep(2)} gap={gap}/>
    {signatureMarks.map(([accidental,step],index)=><CalibratedNotationSymbol key={`${accidental}-${step}`} symbolKey={accidentalSymbolKey(accidental,"keySignature")} x={left+92+index*30} y={yForStep(step)} gap={gap}/>)}
    {(notation.pitches||[]).slice(0,2).map((pitch,index)=>{const step=(PITCH_INDEX[pitch]??2)-2;const x=noteXs[index];const y=yForStep(step);return <React.Fragment key={`${pitch}-${index}`}>
      {ledgerSteps(step).map((ledger)=><line key={ledger} x1={x+ledgerXOffset-ledgerHalfWidth} x2={x+ledgerXOffset+ledgerHalfWidth} y1={yForStep(ledger)+ledgerYOffset} y2={yForStep(ledger)+ledgerYOffset} stroke="currentColor" strokeWidth={ledgerThickness}/>)}
      {notation.accidentals?.[index]&&<CalibratedNotationSymbol symbolKey={accidentalSymbolKey(notation.accidentals[index])} x={x-gap*2.1} y={y} gap={gap}/>}
      <CalibratedNotationSymbol symbolKey={step>4?"quarterNoteStemDown":"quarterNoteStemUp"} x={x} y={y} gap={gap}/>
    </React.Fragment>;})}
  </svg>;
}

function NavigationSymbolNotation({ notation }) {
  return <svg className="millionaire-navigation-symbol" viewBox="0 0 180 150" aria-hidden="true">
    <CalibratedNotationSymbol symbolKey={notation.symbol || "segno"} x={90} y={82} gap={24} settingOverrides={{ fontSizeScale: 3.2 }} />
  </svg>;
}

function TieCalloutNotation({ notation }) {
  const gap = 14, top = 42, bottom = top + gap * 4;
  const position = PITCH_INDEX[notation.pitch] ?? 4;
  const step = position - 2;
  const y = bottom - step * gap / 2;
  const ledgerConfig = SHARED_NOTATION.symbols?.ledgerLines || {};
  const ledgerHalfWidth = gap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2;
  const ledgerThickness = Math.max(1, gap * Number(SHARED_NOTATION.drawing?.ledgerLineThicknessScale || .11));
  const ledgerXOffset = gap * Number(ledgerConfig.xOffsetScale || 0);
  const ledgerYOffset = gap * Number(ledgerConfig.yOffsetScale || 0);
  const ledgerSteps = [];
  for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) ledgerSteps.push(ledgerStep);
  for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) ledgerSteps.push(ledgerStep);
  const noteSymbol = notation.rhythm === "halfNote" ? "halfNoteStemUp" : notation.rhythm === "eighthNote" ? "eighthNoteStemUp" : "quarterNoteStemUp";
  const orange = "#f97316";
  const firstX = 230, secondX = 300;
  const leftX = firstX + gap * .08, rightX = secondX - gap * .08;
  const width = Math.max(gap * 1.4, rightX - leftX);
  const baseY = y + gap;
  const archDepth = Math.max(gap * .55, Math.min(gap * 1.45, width * .12));
  const thickness = Math.max(1.6, gap * .22);
  const outerY = baseY + archDepth, innerY = outerY - thickness;
  const arrowSize = 46;
  const arrowCentreX = (leftX + rightX) / 2;
  const arrowY = outerY + 7;
  const tiePath = `M ${leftX} ${baseY} C ${leftX + width * .22} ${outerY}, ${rightX - width * .22} ${outerY}, ${rightX} ${baseY} C ${rightX - width * .22} ${innerY}, ${leftX + width * .22} ${innerY}, ${leftX} ${baseY} Z`;
  return <svg className="millionaire-tie-callout" viewBox="20 8 440 150" aria-hidden="true">
    <defs><linearGradient id="millionaire-tie-staff-fade" x1="52" y1="0" x2="462" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor"/><stop offset="84%" stopColor="currentColor"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
    {Array.from({length:5},(_,index)=><line key={index} x1="52" x2="462" y1={top+index*gap} y2={top+index*gap} stroke="url(#millionaire-tie-staff-fade)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom-gap} gap={gap} />
    {[firstX,secondX].map((x)=><React.Fragment key={x}>
      {ledgerSteps.map((ledgerStep)=><line key={ledgerStep} x1={x+ledgerXOffset-ledgerHalfWidth} x2={x+ledgerXOffset+ledgerHalfWidth} y1={bottom-ledgerStep*gap/2+ledgerYOffset} y2={bottom-ledgerStep*gap/2+ledgerYOffset} stroke="currentColor" strokeWidth={ledgerThickness} vectorEffect="non-scaling-stroke" />)}
      <CalibratedNotationSymbol symbolKey={noteSymbol} x={x} y={y} gap={gap} />
    </React.Fragment>)}
    <path d={tiePath} fill={orange} transform="translate(0 1)" pointerEvents="none" />
    <image className="millionaire-tie-arrow" href="next.svg" x={arrowCentreX-arrowSize/2} y={arrowY} width={arrowSize} height={arrowSize} transform={`rotate(-90 ${arrowCentreX} ${arrowY+arrowSize/2})`} />
  </svg>;
}

const AH_RENDER_SIGNATURE_ACCIDENTALS = {
  "G major": { F:1 }, "E minor": { F:1 }, "D major": { F:1, C:1 },
  "F major": { B:-1 }, "D minor": { B:-1 }, "B flat major": { B:-1, E:-1 },
};

function ahSelectedBassNotation(answerText, keySignature) {
  const match = String(answerText || "").match(/^([A-G])(?: (sharp|flat))?$/);
  if (!match) return null;
  const letter = match[1];
  const selectedAccidental = match[2] === "sharp" ? 1 : match[2] === "flat" ? -1 : 0;
  const signatureAccidental = AH_RENDER_SIGNATURE_ACCIDENTALS[keySignature]?.[letter] || 0;
  const writtenAccidental = selectedAccidental === signatureAccidental ? null : selectedAccidental === 1 ? "sharp" : selectedAccidental === -1 ? "flat" : "natural";
  return { pitch:`${letter}${letter === "B" ? 2 : 3}`, accidental:writtenAccidental };
}

function AHGrandStaff({ notation, showTrebleChord = true, showBassNote = true, selectedBassNote = null }) {
  // Match the Advanced Higher inversion score in chords.html: the same score
  // proportions, grand-stave spacing, brace, clefs, key signatures and chord
  // stack. The Roman numeral is omitted because identifying it is the question.
  const width=920, height=430, gap=10, trebleTop=112, bassTop=220;
  const left=255, right=665, keyX=left+68, noteX=width/2;
  const fadeId=`millionaire-ah-staff-fade-${notation.keySignature.replace(/\W+/g,"-").toLowerCase()}-${showBassNote?"chord":"bass-prompt"}`;
  const pitchStep=(pitch,clef)=>((clef==="bass"?BASS_PITCH_INDEX:PITCH_INDEX)[pitch]??2)-2;
  const yFor=(pitch,clef,top)=>top+gap*4-pitchStep(pitch,clef)*gap/2;
  const renderAccidental=(accidental,y,key)=>(accidental?<CalibratedNotationSymbol key={key} symbolKey={accidentalSymbolKey(accidental)} x={noteX-gap*2.1} y={y} gap={gap}/>:null);
  const treblePitches=notation.treblePitches||[];
  const trebleStemDown=!treblePitches.some((pitch)=>pitchStep(pitch,"treble")<4);
  const selectedBass=ahSelectedBassNotation(selectedBassNote,notation.keySignature);
  const bassPitch=selectedBass?.pitch||notation.bassPitch;
  const bassAccidental=selectedBass?selectedBass.accidental:notation.bassAccidental;
  const braceSettings=sharedNotationSymbol("brace");
  return <svg className="millionaire-ah-grand-staff" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs>
      <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={left} x2={right} y1="0" y2="0">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
        <stop offset="84%" stopColor="currentColor" stopOpacity="1"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <rect width={width} height={height} fill="transparent"/>
    <g transform={`translate(${width/2} 202) scale(1.13) translate(${-width/2} -202)`}>
      {[trebleTop,bassTop].flatMap((top,staff)=>(Array.from({length:5},(_,index)=><line key={`${staff}-${index}`} x1={left} x2={right} y1={top+index*gap} y2={top+index*gap} stroke={`url(#${fadeId})`} strokeWidth="1.2"/>)))}
      <CalibratedNotationSymbol symbolKey="brace" x={left-18} y={trebleTop+gap*4+19} gap={gap} settingOverrides={{widthScale:braceSettings.widthScale*1.16,heightScale:braceSettings.heightScale*1.12}}/>
      <CalibratedNotationSymbol symbolKey="gClef" x={left+gap*3.2} y={trebleTop+gap*3} gap={gap}/>
      <CalibratedNotationSymbol symbolKey="fClef" x={left+gap*3.2} y={bassTop+gap} gap={gap}/>
      <SignatureMarks signature={notation.keySignature} top={trebleTop} bottom={trebleTop+gap*4} gap={gap} startX={keyX}/>
      <SignatureMarks signature={notation.keySignature} top={bassTop} bottom={bassTop+gap*4} gap={gap} startX={keyX} clef="bass"/>
      <line x1={left} x2={left} y1={trebleTop} y2={bassTop+gap*4} stroke="currentColor" strokeWidth="1.4"/>
      <React.Fragment>
        {showTrebleChord&&treblePitches.map((pitch,index)=>{const noteY=yFor(pitch,"treble",trebleTop);return <React.Fragment key={`${pitch}-${index}`}>{renderAccidental(notation.trebleAccidentals?.[index],noteY,`ta-${index}`)}<CalibratedNotationSymbol symbolKey={trebleStemDown?"quarterNoteStemDown":"quarterNoteStemUp"} x={noteX} y={noteY} gap={gap}/></React.Fragment>;})}
        {showBassNote&&bassPitch&&<React.Fragment>{renderAccidental(bassAccidental,yFor(bassPitch,"bass",bassTop),"ba")}<CalibratedNotationSymbol symbolKey="quarterNoteStemUp" x={noteX} y={yFor(bassPitch,"bass",bassTop)} gap={gap}/></React.Fragment>}
      </React.Fragment>
    </g>
  </svg>;
}

function AHChordNotation({notation}) { return <AHGrandStaff notation={notation}/>; }
function AHBassPromptNotation({notation,selectedBassNote}) { return <AHGrandStaff notation={notation} showBassNote={Boolean(selectedBassNote)} selectedBassNote={selectedBassNote}/>; }

function OctaveSignNotation({ notation }) {
  const symbolKey=notation.marking==="8vb"?"ottavaBassa":"ottavaAlta";
  return <svg className="millionaire-octave-sign" viewBox="0 0 240 140" aria-hidden="true">
    <CalibratedNotationSymbol symbolKey={symbolKey} x={120} y={86} gap={36}/>
  </svg>;
}

function RepeatEndingNotation({ notation }) {
  return <svg className="millionaire-repeat-ending" viewBox="0 0 110 70" aria-hidden="true">
    <g transform="translate(7 25)" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="square">
      <path d="M 20 28 L 20 4 L 88 4" />
      <text x="29" y="-3" fill="currentColor" stroke="none" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">{notation.number}.</text>
    </g>
  </svg>;
}

function AccidentalSymbolNotation({ notation }) {
  return <svg className="millionaire-accidental-symbol" viewBox="0 0 120 110" aria-hidden="true">
    <CalibratedNotationSymbol symbolKey={accidentalSymbolKey(notation.accidental)} x={60} y={58} gap={24} settingOverrides={{ fontSizeScale: 3.3, xOffsetScale: 0 }} />
  </svg>;
}

function higherRestSymbolKey(rest) {
  if (rest === "semibreve-rest") return "wholeRest";
  if (["minim-rest", "dotted-minim-rest"].includes(rest)) return "halfRest";
  if (rest === "quaver-rest") return "eighthRest";
  return "quarterRest";
}

function HigherRestMark({ rest, x, y, gap = 14 }) {
  return <g>
    <CalibratedNotationSymbol symbolKey={higherRestSymbolKey(rest)} x={x} y={y} gap={gap} />
    {["dotted-crotchet-rest", "dotted-minim-rest"].includes(rest) && <CalibratedNotationSymbol symbolKey="augmentationDotLine" x={x + gap * 1.1} y={y - gap * .4} gap={gap} />}
  </g>;
}

function HigherRhythmSumsRest({ rest, x = 42, systemTop = 12, gap = 10 }) {
  const y = systemTop + gap * 2 - (["crotchet-rest", "dotted-crotchet-rest"].includes(rest) ? gap * .5 : 0);
  const exactRestGlyph = rest === "semibreve-rest" ? "\uE4F4" : ["minim-rest", "dotted-minim-rest"].includes(rest) ? "\uE4F5" : null;
  return <g>
    {exactRestGlyph
      ? <text className="millionaire-music-symbol" x={x} y={y} fontSize={gap * 3.4} textAnchor="middle" dominantBaseline="middle">{exactRestGlyph}</text>
      : <CalibratedNotationSymbol symbolKey={higherRestSymbolKey(rest)} x={x} y={y} gap={gap} />}
    {["dotted-crotchet-rest", "dotted-minim-rest"].includes(rest) && <CalibratedNotationSymbol symbolKey="augmentationDotSpace" x={x + gap * 1.1} y={y - gap * .35} gap={gap} />}
  </g>;
}

function HigherRestNotation({ notation }) {
  const visualOffset = notation.rest === "semibreve-rest" ? -5 : notation.rest === "minim-rest" ? -2 : notation.rest === "crotchet-rest" ? 5 : notation.rest === "dotted-crotchet-rest" ? 10 : 0;
  return <svg className="millionaire-higher-rest" viewBox="0 0 90 90" aria-hidden="true">
    <g transform={`translate(45 ${45 + visualOffset}) scale(2.2) translate(-42 -32)`}>
      <HigherRhythmSumsRest rest={notation.rest} x={42} systemTop={12} />
    </g>
  </svg>;
}

function HigherRestSumNotation({ notation }) {
  const noteItem = RHYTHM_SUM_ITEMS[notation.note] || RHYTHM_SUM_ITEMS.quarterNote;
  return <div className="millionaire-higher-rest-sum" aria-hidden="true">
    <span className="millionaire-higher-rest-sum-slot"><RhythmSumsGlyph item={noteItem} scale={1.14} /></span>
    <span className="millionaire-higher-rest-sum-plus">+</span>
    <span className="millionaire-higher-rest-sum-slot"><svg viewBox="0 0 90 90" className="millionaire-higher-rest-sum-rest"><g transform="translate(45 70) scale(1.14) translate(-42 -50)"><HigherRhythmSumsRest rest={notation.rest} x={42} systemTop={12} /></g></svg></span>
  </div>;
}

function HigherArticulationNotation({ notation }) {
  const gap = 14;
  const top = 36;
  const bottom = top + gap * 4;
  const notes = notation.marking === "phrase"
    ? [{ x: 154, position: 3 }, { x: 190, position: 5 }, { x: 237, position: 4 }, { x: 273, position: 6 }, { x: 320, position: 5 }, { x: 356, position: 3 }, { x: 403, position: 4 }, { x: 439, position: 2 }]
    : notation.marking === "slur"
      ? [{ x: 235, position: 3 }, { x: 325, position: 6 }]
      : [{ x: 278, position: 4 }];
  const yFor = (position) => bottom - (position - 2) * gap / 2;
  const stemDownFor = (position) => position - NOTE_STEM_STEP_OFFSET > NOTE_STEM_DOWN_STEP_THRESHOLD;
  const firstStemDown = stemDownFor(notes[0].position);
  const curveFor = (phrase) => {
    const first = notes[0];
    const last = notes.at(-1);
    const settings = sharedNotationSymbol(phrase ? "phraseMarking" : (firstStemDown ? "slurStemDown" : "slurStemUp"));
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const direction = firstStemDown ? -1 : 1;
    const xOffset = gap * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0);
    const yOffset = gap * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0);
    const sizeRatio = clamp(Number(settings.fontSizeScale || 5) / 5.3, .55, 1.8);
    const endpointGap = gap * (phrase ? 1.4 : 1.05) * sizeRatio;
    const x1 = first.x + xOffset;
    const x2 = last.x + xOffset;
    const y1 = yFor(first.position) + direction * endpointGap + yOffset;
    const y2 = yFor(last.position) + direction * endpointGap + yOffset;
    const span = Math.max(gap * 1.4, Math.abs(x2 - x1));
    const handleWidth = span * .28 * clamp(Number(settings.widthScale || 1), .35, 2.5);
    const depth = direction * gap * (phrase ? 2.1 : 1) * clamp(Number(settings.heightScale || 1), .35, 2.5) * sizeRatio;
    const strokeWidth = Math.max(1.1, gap * .13 * sizeRatio);
    return <path d={`M${x1} ${y1} C${x1 + handleWidth} ${y1 + depth}, ${x2 - handleWidth} ${y2 + depth}, ${x2} ${y2}`} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />;
  };
  return <svg className="millionaire-higher-articulation" viewBox="30 10 440 130" aria-hidden="true">
    {Array.from({ length: 5 }, (_, index) => <line key={index} x1="52" x2="462" y1={top + index * gap} y2={top + index * gap} stroke="currentColor" strokeWidth="1.2" />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom - gap} gap={gap} />
    {notation.marking === "phrase" && [213, 296, 379].map((x) => <line key={x} x1={x} x2={x} y1={top} y2={bottom} stroke="currentColor" strokeWidth="1.2" />)}
    {notation.marking === "phrase" && <><line x1="457" x2="457" y1={top} y2={bottom} stroke="currentColor" strokeWidth="1.2" /><line x1="462" x2="462" y1={top - .75} y2={bottom + .75} stroke="currentColor" strokeWidth="4" /></>}
    {notes.map((note, index) => <CalibratedNotationSymbol key={index} symbolKey={stemDownFor(note.position) ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={note.x} y={yFor(note.position)} gap={gap} />)}
    {notation.marking === "accent" && <CalibratedNotationSymbol symbolKey={firstStemDown ? "accentBelow" : "accentAbove"} x={notes[0].x} y={yFor(notes[0].position)} gap={gap} settingOverrides={{ opticalYOffset: firstStemDown ? 1 : -5 }} />}
    {notation.marking === "staccato" && <CalibratedNotationSymbol symbolKey={firstStemDown ? "staccatoBelow" : "staccatoAbove"} x={notes[0].x} y={yFor(notes[0].position)} gap={gap} settingOverrides={{ opticalYOffset: firstStemDown ? 2 : -6 }} />}
    {notation.marking === "slur" && curveFor(false)}
    {notation.marking === "phrase" && curveFor(true)}
  </svg>;
}

function HigherTripletNotation({ notation }) {
  const quaverTriplet = notation.triplet === "quaver";
  return <svg className="millionaire-higher-triplet" viewBox="0 -8 150 78" aria-hidden="true">
    <g transform="translate(-8,-4) scale(1.25)">
      {[35, 62, 89].map((x) => <g key={x}>
        <ellipse cx={x} cy="38" rx="6.3" ry="4.6" transform={`rotate(-18 ${x} 38)`} fill="currentColor" />
        <line x1={x + 5.3} x2={x + 5.3} y1="38" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </g>)}
      {quaverTriplet && <line x1="39.3" x2="95.3" y1="12" y2="12" stroke="currentColor" strokeWidth="4" />}
      {!quaverTriplet && <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M 40 9 L 40 0 L 56 0" />
        <path d="M 80 0 L 96 0 L 96 9" />
      </g>}
      <text x="67" y={quaverTriplet ? "8" : "10"} textAnchor="middle" fontFamily="serif" fontWeight="900" fontSize="11" fill="currentColor">3</text>
    </g>
  </svg>;
}

const RHYTHM_FIGURE_PATTERNS = {
  pairedEighthNotes: ["eighth", "eighth"],
  fourSixteenthNotes: ["sixteenth", "sixteenth", "sixteenth", "sixteenth"],
  quaverTwoSemiquavers: ["eighth", "sixteenth", "sixteenth"],
  twoSemiquaversQuaver: ["sixteenth", "sixteenth", "eighth"],
  semiquaverQuaverSemiquaver: ["sixteenth", "eighth", "sixteenth"],
};

const SHARED_RHYTHM_LINE_GAP = 10;
const SHARED_RHYTHM_NOTE_RX = 7;
const SHARED_BEAMED_STEM_X_OFFSET = -2;
const SHARED_BEAMED_STEM_Y_OFFSET = -11;
const SHARED_BEAMED_STEM_DOWN_EXTENSION = 9;
const SHARED_SEMIQUAVER_BEAM_TRIM = 4;

function calibratedRhythmPoint(symbolKey, x, y) {
  const settings = sharedNotationSymbol(symbolKey);
  return {
    x: x + SHARED_RHYTHM_LINE_GAP * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0),
    y: y + SHARED_RHYTHM_LINE_GAP * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0),
  };
}

function sharedRhythmLayout(pattern, compact = false, positionSteps = null) {
  const values = RHYTHM_FIGURE_PATTERNS[pattern] || RHYTHM_FIGURE_PATTERNS.pairedEighthNotes;
  let spacing;
  if (compact) spacing = values.length >= 4 ? 14 : values.length === 3 ? 16 : 22;
  else spacing = values.length >= 4 ? 24 : 26;
  const positions = values.reduce((result, _, index) => {
    if (index === 0) result.push(22);
    else result.push(result[index - 1] + (positionSteps?.[index - 1] ?? spacing));
    return result;
  }, []);
  const noteY = 12 + SHARED_RHYTHM_LINE_GAP * 2;
  const stemXs = positions.map((x) => calibratedRhythmPoint("noteheadBlackStemUp", x, noteY).x + SHARED_RHYTHM_NOTE_RX + SHARED_BEAMED_STEM_X_OFFSET);
  const beamY = 12 + SHARED_RHYTHM_LINE_GAP * .1 + SHARED_BEAMED_STEM_Y_OFFSET;
  return {
    values, positions, stemXs, noteY,
    start: { x: stemXs[0], y: beamY },
    end: { x: stemXs.at(-1), y: beamY },
    centreX: (stemXs[0] + stemXs.at(-1)) / 2,
  };
}

function sharedBeamLineY(x, start, end) {
  if (start.x === end.x) return start.y;
  return start.y + ((x - start.x) / (end.x - start.x)) * (end.y - start.y);
}

function sharedBeamPolygonPoints(x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = (-dy / length) * thickness;
  const normalY = (dx / length) * thickness;
  return `${x1},${y1} ${x2},${y2} ${x2 + normalX},${y2 + normalY} ${x1 + normalX},${y1 + normalY}`;
}

function SharedRhythmBeam({ start, end, colour, widthScale = 1, thicknessScale = 1, trim = 0 }) {
  const thickness = SHARED_RHYTHM_LINE_GAP * Number(SHARED_NOTATION.drawing?.beamThicknessScale || .42) * thicknessScale;
  const midX = (start.x + end.x) / 2;
  const halfWidth = Math.max(1, ((end.x - start.x) * widthScale) / 2 - trim / 2);
  const x1 = midX - halfWidth;
  const x2 = midX + halfWidth;
  const y1 = sharedBeamLineY(x1, start, end);
  const y2 = sharedBeamLineY(x2, start, end);
  return <polygon points={sharedBeamPolygonPoints(x1, y1, x2, y2, thickness)} fill={colour} pointerEvents="none" />;
}

function SharedBeamedRhythmGroup({ pattern, highlightBeam = false, compact = false, positionSteps = null, secondaryBeamTrim = 0 }) {
  const layout = sharedRhythmLayout(pattern, compact, positionSteps);
  const { values, positions, stemXs, noteY, start, end } = layout;
  const stemThickness = Math.max(1, SHARED_RHYTHM_LINE_GAP * Number(SHARED_NOTATION.drawing?.stemThicknessScale || .12));
  const primaryBeamConfig = sharedNotationSymbol("quaverBeam");
  const secondBeamConfig = sharedNotationSymbol("semiquaverBeam");
  const beamColour = highlightBeam ? "#d97706" : "currentColor";
  const secondarySegments = [];

  values.forEach((value, index) => {
    const isSemiquaver = value === "sixteenth";
    const previousIsSemiquaver = values[index - 1] === "sixteenth";
    const nextIsSemiquaver = values[index + 1] === "sixteenth";
    if (!isSemiquaver) return;
    if (nextIsSemiquaver && !previousIsSemiquaver) secondarySegments.push({ startIndex: index, endIndex: null });
    const openSegment = secondarySegments.at(-1);
    if (openSegment?.endIndex === null && (!nextIsSemiquaver || index === values.length - 1)) openSegment.endIndex = index;
    if (!previousIsSemiquaver && !nextIsSemiquaver) secondarySegments.push({ startIndex: index, endIndex: index, hook: true });
  });

  return <g>
    {positions.map((noteX, index) => {
      const symbolPoint = calibratedRhythmPoint("noteheadBlackStemUp", noteX, noteY);
      const stemEndY = sharedBeamLineY(stemXs[index], start, end);
      const stemStartY = symbolPoint.y + SHARED_BEAMED_STEM_Y_OFFSET + SHARED_BEAMED_STEM_DOWN_EXTENSION;
      return <React.Fragment key={`${pattern}-${index}`}>
        <CalibratedNotationSymbol symbolKey="noteheadBlackStemUp" x={noteX} y={noteY} gap={SHARED_RHYTHM_LINE_GAP} />
        <line x1={stemXs[index]} x2={stemXs[index]} y1={stemStartY} y2={stemEndY} stroke="currentColor" strokeWidth={stemThickness} strokeLinecap="butt" />
      </React.Fragment>;
    })}
    <SharedRhythmBeam start={start} end={end} colour={beamColour} widthScale={Number(primaryBeamConfig.widthScale || 1)} thicknessScale={Number(primaryBeamConfig.heightScale || 1)} trim={(values.includes("sixteenth") ? SHARED_SEMIQUAVER_BEAM_TRIM : 0) + (pattern === "pairedEighthNotes" ? 1 : 0)} />
    {secondarySegments.map((segment, index) => {
      const segmentStartX = stemXs[segment.startIndex];
      const segmentEndX = segment.hook ? segmentStartX + (segment.startIndex > 0 ? -14 : 14) : stemXs[segment.endIndex];
      let separatedHookShift = 0;
      if (pattern === "semiquaverQuaverSemiquaver" && segment.hook) separatedHookShift = segment.startIndex === 0 ? -1 : 1;
      const leftX = Math.min(segmentStartX, segmentEndX) + separatedHookShift;
      const rightX = Math.max(segmentStartX, segmentEndX) + separatedHookShift;
      const secondStart = { x: leftX, y: sharedBeamLineY(leftX, start, end) + SHARED_RHYTHM_LINE_GAP * .58 };
      const secondEnd = { x: rightX, y: sharedBeamLineY(rightX, start, end) + SHARED_RHYTHM_LINE_GAP * .58 };
      const baseSecondaryTrim = segment.hook || pattern === "fourSixteenthNotes" ? SHARED_SEMIQUAVER_BEAM_TRIM : 0;
      const appliedSecondaryTrim = baseSecondaryTrim + secondaryBeamTrim;
      return <SharedRhythmBeam key={index} start={secondStart} end={secondEnd} colour={beamColour} widthScale={Number(secondBeamConfig.widthScale || 1)} thicknessScale={Number(secondBeamConfig.heightScale || 1)} trim={appliedSecondaryTrim} />;
    })}
  </g>;
}

function PositionedBeamedRhythm({ pattern, targetX, targetY, scale = 1, highlightBeam = false, compact = false, positionSteps = null, secondaryBeamTrim = 0 }) {
  const layout = sharedRhythmLayout(pattern, compact, positionSteps);
  return <g transform={`translate(${targetX} ${targetY}) scale(${scale}) translate(${-layout.centreX} ${-layout.noteY})`}><SharedBeamedRhythmGroup pattern={pattern} highlightBeam={highlightBeam} compact={compact} positionSteps={positionSteps} secondaryBeamTrim={secondaryBeamTrim} /></g>;
}

function RhythmFigureNotation({ notation, highlightBeam = false }) {
  const pattern = notation.pattern || "pairedEighthNotes";
  const noteCount = RHYTHM_FIGURE_PATTERNS[pattern]?.length || 2;
  const scale = noteCount >= 4 ? 1.7 : noteCount === 3 ? 2 : 2.5;
  const pairedQuaverClass = pattern === "pairedEighthNotes" ? " is-paired-quavers" : "";
  return <svg className={`millionaire-rhythm-figure${pairedQuaverClass}`} viewBox="0 0 200 105" aria-hidden="true">
    <PositionedBeamedRhythm pattern={pattern} targetX={100} targetY={74} scale={scale} highlightBeam={highlightBeam} secondaryBeamTrim={Number(notation.secondaryBeamTrim || 0)} />
    {highlightBeam && <g className="millionaire-beam-pointer" transform={pattern === "pairedEighthNotes" ? "translate(0 -10)" : undefined}><path d="M 100 -18 L 100 -2" /><path d="M 94 -8 L 100 -1 L 106 -8" /></g>}
  </svg>;
}

function NotePartNotation({ notation }) {
  const arrows = {
    notehead: { x1: 38, y1: 82, x2: 86, y2: 82 },
    stem: { x1: 164, y1: 54, x2: 113, y2: 54 },
    flag: { x1: 164, y1: 33, x2: 124, y2: 51 },
  };
  const part = arrows[notation.part] ? notation.part : "notehead";
  const arrow = arrows[part];
  const dx = arrow.x2 - arrow.x1;
  const dy = arrow.y2 - arrow.y1;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;
  const arrowHeadBackX = arrow.x2 - unitX * 10;
  const arrowHeadBackY = arrow.y2 - unitY * 10;
  const perpendicularX = -unitY * 6;
  const perpendicularY = unitX * 6;
  const arrowHeadPath = `M ${arrowHeadBackX + perpendicularX} ${arrowHeadBackY + perpendicularY} L ${arrow.x2} ${arrow.y2} L ${arrowHeadBackX - perpendicularX} ${arrowHeadBackY - perpendicularY}`;
  return <svg className="millionaire-note-part" viewBox="0 0 200 120" aria-hidden="true">
    <CalibratedNotationSymbol symbolKey="eighthNoteStemUp" x={100} y={88} gap={20} />
    <g className="millionaire-note-part-arrow"><path d={`M ${arrow.x1} ${arrow.y1} L ${arrow.x2} ${arrow.y2}`} /><path d={arrowHeadPath} /></g>
  </svg>;
}

const BAR_NOTE_SYMBOL_KEYS = { quarterNote: "quarterNoteStemUp", dottedQuarterNote: "quarterNoteStemUp", eighthNote: "eighthNoteStemUp", dottedEighthNote: "eighthNoteStemUp", sixteenthNote: "sixteenthNoteStemUp", halfNote: "halfNoteStemUp", dottedHalfNote: "halfNoteStemUp", wholeNote: "wholeNote" };
const RHYTHM_ANSWER_VALUES = { Semiquaver: "sixteenthNote", Quaver: "eighthNote", "Dotted quaver": "dottedEighthNote", Crotchet: "quarterNote", "Dotted crotchet": "dottedQuarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };
const REST_ANSWER_VALUES = { "Quaver rest": "quaver-rest", "Crotchet rest": "crotchet-rest", "Dotted crotchet rest": "dotted-crotchet-rest", "Minim rest": "minim-rest", "Dotted minim rest": "dotted-minim-rest", "Semibreve rest": "semibreve-rest" };

const RHYTHM_SUMS_INFO = {
  semibreve: { stem: false, dots: 0 },
  "dotted-minim": { stem: true, dots: 1 },
  minim: { stem: true, dots: 0 },
  crotchet: { stem: true, dots: 0 },
  "dotted-crotchet": { stem: true, dots: 1 },
  "dotted-quaver": { stem: true, dots: 1, beams: 1 },
  quaver: { stem: true, dots: 0, beams: 1 },
  semiquaver: { stem: true, dots: 0, beams: 2 },
};
const RHYTHM_SUMS_LINE_GAP = 10;
const RHYTHM_SUMS_NOTE_RX = 7;
const RHYTHM_SUMS_BEAMED_STEM_X_OFFSET = -2;
const RHYTHM_SUMS_BEAMED_STEM_Y_OFFSET = -11;
const RHYTHM_SUMS_BEAMED_STEM_DOWN_EXTENSION = 9;
const RHYTHM_SUMS_SEMIQUAVER_BEAM_TRIM = 4;

const RHYTHM_SUM_ITEMS = {
  quarterNote: { displayType: "note", rhythm: "crotchet" },
  dottedQuarterNote: { displayType: "note", rhythm: "dotted-crotchet" },
  eighthNote: { displayType: "note", rhythm: "quaver" },
  dottedEighthNote: { displayType: "note", rhythm: "dotted-quaver" },
  sixteenthNote: { displayType: "note", rhythm: "semiquaver" },
  halfNote: { displayType: "note", rhythm: "minim" },
  dottedHalfNote: { displayType: "note", rhythm: "dotted-minim" },
  wholeNote: { displayType: "note", rhythm: "semibreve" },
  pairedEighthNotes: { displayType: "beamed", rhythms: ["quaver", "quaver"] },
  fourSixteenthNotes: { displayType: "beamed", rhythms: ["semiquaver", "semiquaver", "semiquaver", "semiquaver"] },
  quaverTwoSemiquavers: { displayType: "beamed", rhythms: ["quaver", "semiquaver", "semiquaver"] },
  twoSemiquaversQuaver: { displayType: "beamed", rhythms: ["semiquaver", "semiquaver", "quaver"] },
  semiquaverQuaverSemiquaver: { displayType: "beamed", rhythms: ["semiquaver", "quaver", "semiquaver"] },
  dottedQuaverSemiquaver: { displayType: "beamed", rhythms: ["dotted-quaver", "semiquaver"] },
  scotchSnap: { displayType: "beamed", rhythms: ["semiquaver", "dotted-quaver"] },
};

function rhythmSumsInfo(rhythm) {
  return RHYTHM_SUMS_INFO[rhythm] || {};
}

function rhythmSumsCalibratedPoint(symbolKey, x, y) {
  const actualSymbolKey = actualBravuraSymbolKey(symbolKey);
  const configuredSymbolKey = SHARED_NOTATION.symbols?.[symbolKey] ? symbolKey : actualSymbolKey;
  const settings = sharedNotationSymbol(configuredSymbolKey);
  return {
    x: x + RHYTHM_SUMS_LINE_GAP * Number(settings.xOffsetScale || 0) + Number(settings.opticalXOffset || 0),
    y: y + RHYTHM_SUMS_LINE_GAP * Number(settings.yOffsetScale || 0) + Number(settings.opticalYOffset || 0),
    settings,
    actualSymbolKey,
  };
}

function RhythmSumsCalibratedSymbol({ symbolKey, x, y, colour = "currentColor" }) {
  const point = rhythmSumsCalibratedPoint(symbolKey, x, y);
  const fontSize = RHYTHM_SUMS_LINE_GAP * Number(point.settings.fontSizeScale || 3.4);
  return <text className="millionaire-music-symbol" x={point.x} y={point.y} fill={colour} fontSize={fontSize} textAnchor="middle" transform={`translate(${point.x} ${point.y}) scale(${point.settings.widthScale || 1} ${point.settings.heightScale || 1}) translate(${-point.x} ${-point.y})`} pointerEvents="none">{bravuraSymbol(point.actualSymbolKey, NOTATION_FALLBACKS[point.actualSymbolKey] || "?")}</text>;
}

function rhythmSumsNoteSymbolKey(rhythm, beamed = false) {
  if (rhythm === "semibreve") return "wholeNote";
  if (rhythm === "minim" || rhythm === "dotted-minim") return "halfNoteStemUp";
  if (beamed) return "noteheadBlackStemUp";
  if (rhythm === "quaver" || rhythm === "dotted-quaver") return "eighthNoteStemUp";
  if (rhythm === "semiquaver") return "sixteenthNoteStemUp";
  return "quarterNoteStemUp";
}

function rhythmSumsSymbolY(systemTop) {
  return systemTop + RHYTHM_SUMS_LINE_GAP * 2;
}

function RhythmSumsNote({ rhythm, x = 42, systemTop = 12, colour = "currentColor", beamed = false, stemEndY = null, dotXOffset = null }) {
  const info = rhythmSumsInfo(rhythm);
  const y = rhythmSumsSymbolY(systemTop);
  const symbolKey = rhythmSumsNoteSymbolKey(rhythm, beamed);
  const symbolPoint = rhythmSumsCalibratedPoint(symbolKey, x, y);
  const stemX = beamed ? symbolPoint.x + RHYTHM_SUMS_NOTE_RX + RHYTHM_SUMS_BEAMED_STEM_X_OFFSET : x + RHYTHM_SUMS_NOTE_RX;
  const stemStartY = beamed ? symbolPoint.y + RHYTHM_SUMS_BEAMED_STEM_Y_OFFSET + RHYTHM_SUMS_BEAMED_STEM_DOWN_EXTENSION : y;
  const dotY = y - RHYTHM_SUMS_LINE_GAP * .25;
  const stemThickness = Math.max(1, RHYTHM_SUMS_LINE_GAP * Number(SHARED_NOTATION.drawing?.stemThicknessScale || .12));
  return <g>
    <RhythmSumsCalibratedSymbol symbolKey={symbolKey} x={x} y={y} colour={colour} />
    {beamed && info.stem && <line x1={stemX} x2={stemX} y1={stemStartY} y2={stemEndY} stroke={colour} strokeWidth={stemThickness} strokeLinecap="butt" />}
    {info.dots === 1 && <RhythmSumsCalibratedSymbol symbolKey="augmentationDotLine" x={x + RHYTHM_SUMS_LINE_GAP * 1.3 + (dotXOffset ?? (rhythm === "dotted-quaver" ? 8 : 0))} y={dotY} colour={colour} />}
  </g>;
}

function rhythmSumsStemX(rhythm, x, systemTop) {
  const point = rhythmSumsCalibratedPoint(rhythmSumsNoteSymbolKey(rhythm, true), x, rhythmSumsSymbolY(systemTop));
  return point.x + RHYTHM_SUMS_NOTE_RX + RHYTHM_SUMS_BEAMED_STEM_X_OFFSET;
}

function rhythmSumsBeamLineY(x, start, end) {
  if (start.x === end.x) return start.y;
  return start.y + ((x - start.x) / (end.x - start.x)) * (end.y - start.y);
}

function rhythmSumsBeamPoints(x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = (-dy / length) * thickness;
  const normalY = (dx / length) * thickness;
  return `${x1},${y1} ${x2},${y2} ${x2 + normalX},${y2 + normalY} ${x1 + normalX},${y1 + normalY}`;
}

function RhythmSumsBeam({ start, end, colour = "currentColor", widthScale = 1, thicknessScale = 1, trim = 0 }) {
  const thickness = RHYTHM_SUMS_LINE_GAP * Number(SHARED_NOTATION.drawing?.beamThicknessScale || .42) * thicknessScale;
  const midX = (start.x + end.x) / 2;
  const halfWidth = Math.max(1, ((end.x - start.x) * widthScale) / 2 - trim / 2);
  const x1 = midX - halfWidth;
  const x2 = midX + halfWidth;
  return <polygon points={rhythmSumsBeamPoints(x1, rhythmSumsBeamLineY(x1, start, end), x2, rhythmSumsBeamLineY(x2, start, end), thickness)} fill={colour} pointerEvents="none" />;
}

function RhythmSumsBeamedNotes({ rhythms, colour = "currentColor", scale = 1 }) {
  const systemTop = 12;
  const isDottedPair = rhythms.length === 2 && rhythms[0] === "dotted-quaver" && rhythms[1] === "semiquaver";
  const isScotchSnap = rhythms.length === 2 && rhythms[0] === "semiquaver" && rhythms[1] === "dotted-quaver";
  const spacing = isDottedPair ? 30 : rhythms.length >= 4 ? 24 : 26;
  const positions = rhythms.map((_, index) => 22 + index * spacing);
  const stemXs = positions.map((x, index) => rhythmSumsStemX(rhythms[index], x, systemTop));
  const hasSemi = rhythms.some((rhythm) => rhythmSumsInfo(rhythm).beams === 2);
  const beamY = systemTop + RHYTHM_SUMS_LINE_GAP * .1 + RHYTHM_SUMS_BEAMED_STEM_Y_OFFSET;
  const start = { x: stemXs[0], y: beamY };
  const end = { x: stemXs.at(-1), y: beamY - RHYTHM_SUMS_LINE_GAP * .08 * Math.max(0, rhythms.length - 2) };
  const primaryBeamConfig = sharedNotationSymbol("quaverBeam");
  const secondBeamConfig = sharedNotationSymbol("semiquaverBeam");
  const secondarySegments = [];
  let segmentStart = null;
  rhythms.forEach((rhythm, index) => {
    const isSemi = rhythmSumsInfo(rhythm).beams === 2;
    const nextIsSemi = rhythmSumsInfo(rhythms[index + 1]).beams === 2;
    if (isSemi && segmentStart === null) segmentStart = index;
    if (segmentStart !== null && (!nextIsSemi || index === rhythms.length - 1)) { secondarySegments.push({ startIndex: segmentStart, endIndex: index, hook: index === segmentStart }); segmentStart = null; }
  });
  return <svg viewBox="0 0 118 92" className="millionaire-rhythmsums-glyph is-beamed" aria-hidden="true">
    <g transform={`translate(58 72) scale(${scale}) translate(-54 -50)`}>
      {rhythms.map((rhythm, index) => {
        const dotXOffset = rhythm === "dotted-quaver" ? isDottedPair ? 3 : isScotchSnap ? 2 : null : null;
        return <RhythmSumsNote key={`${rhythm}-${index}`} rhythm={rhythm} x={positions[index]} systemTop={systemTop} colour={colour} beamed stemEndY={rhythmSumsBeamLineY(stemXs[index], start, end)} dotXOffset={dotXOffset} />;
      })}
      <RhythmSumsBeam start={start} end={end} colour={colour} widthScale={Number(primaryBeamConfig.widthScale || 1)} thicknessScale={Number(primaryBeamConfig.heightScale || 1)} trim={hasSemi ? RHYTHM_SUMS_SEMIQUAVER_BEAM_TRIM - (isDottedPair || isScotchSnap ? 1 : 0) : 0} />
      {secondarySegments.map((segment, index) => {
        const segmentStartX = stemXs[segment.startIndex];
        const segmentEndX = segment.hook ? segmentStartX + (segment.startIndex > 0 ? -14 : 14) : stemXs[segment.endIndex];
        const rawSecondStartX = segmentStartX + (isDottedPair ? 4 : 0) - (isScotchSnap ? 1 : 0);
        const rawSecondEndX = segmentEndX - (isScotchSnap ? 1 : 0);
        const secondBeamShiftX = isDottedPair ? -1 : 0;
        const secondBeamWidthReduction = isDottedPair ? 3 : 0;
        const secondBeamLeftX = Math.min(rawSecondStartX, rawSecondEndX) + secondBeamShiftX + secondBeamWidthReduction / 2;
        const secondBeamRightX = Math.max(rawSecondStartX, rawSecondEndX) + secondBeamShiftX - secondBeamWidthReduction / 2;
        const secondStart = { x: secondBeamLeftX, y: rhythmSumsBeamLineY(secondBeamLeftX, start, end) + RHYTHM_SUMS_LINE_GAP * .58 };
        const secondEnd = { x: secondBeamRightX, y: rhythmSumsBeamLineY(secondBeamRightX, start, end) + RHYTHM_SUMS_LINE_GAP * .58 };
        return <RhythmSumsBeam key={index} start={secondStart} end={secondEnd} colour={colour} widthScale={Number(secondBeamConfig.widthScale || 1)} thicknessScale={Number(secondBeamConfig.heightScale || 1)} trim={RHYTHM_SUMS_SEMIQUAVER_BEAM_TRIM} />;
      })}
    </g>
  </svg>;
}

function RhythmSumsGlyph({ item, colour = "currentColor", scale = 1 }) {
  if (item.displayType === "beamed") return <RhythmSumsBeamedNotes rhythms={item.rhythms} colour={colour} scale={scale} />;
  return <svg viewBox="0 0 90 90" className="millionaire-rhythmsums-glyph" aria-hidden="true"><g transform={`translate(45 70) scale(${scale}) translate(-42 -50)`}><RhythmSumsNote rhythm={item.rhythm} x={42} systemTop={12} colour={colour} /></g></svg>;
}

function RhythmSumTerm({ rhythm, scale = .9 }) {
  if (rhythm === "blank") return <span className="millionaire-rhythmsums-blank" aria-hidden="true" />;
  const item = RHYTHM_SUM_ITEMS[rhythm] || RHYTHM_SUM_ITEMS.quarterNote;
  const positionClass = rhythm === "dottedQuaverSemiquaver" ? " is-dotted-quaver-semiquaver" : rhythm === "scotchSnap" ? " is-scotch-snap" : "";
  return <span className={`millionaire-rhythmsums-slot${positionClass}`}><RhythmSumsGlyph item={item} scale={scale} /></span>;
}

function AnswerRhythmGlyph({ rhythm, label }) {
  const symbolKey = BAR_NOTE_SYMBOL_KEYS[rhythm] || "quarterNoteStemUp";
  const dotted = ["dottedEighthNote", "dottedQuarterNote", "dottedHalfNote"].includes(rhythm);
  return <span className="millionaire-answer-rhythm" role="img" aria-label={label}><svg viewBox="0 0 64 70" aria-hidden="true"><CalibratedNotationSymbol symbolKey={symbolKey} x={30} y={43} gap={10} />{dotted && <CalibratedNotationSymbol symbolKey="augmentationDotLine" x={43} y={40.5} gap={10} />}</svg></span>;
}

function AnswerRestGlyph({ rest, label }) {
  const answerYOffset = rest === "semibreve-rest" ? -1 : rest === "quaver-rest" ? 2 : 7;
  return <span className="millionaire-answer-rhythm" role="img" aria-label={label}><svg viewBox="0 0 64 70" aria-hidden="true"><g transform={`translate(0 ${answerYOffset}) scale(1.15)`}><HigherRhythmSumsRest rest={rest} x={27} systemTop={8} /></g></svg></span>;
}

function AnswerTimeSignatureGlyph({ timeSignature, label }) {
  const [upper, lower] = timeSignature.split("/").map(Number);
  return <span className="millionaire-answer-time-signature" role="img" aria-label={label}><span aria-hidden="true">{TIME_DIGITS[upper]}</span><span aria-hidden="true">{TIME_DIGITS[lower]}</span></span>;
}

function RhythmSumNotation({ notation }) {
  const terms = notation.terms || [];
  const className = `millionaire-rhythmsums${terms.length === 1 ? " is-single-term" : ""}${terms.length === 2 ? " is-two-term" : ""}${terms.length === 3 ? " is-three-term" : ""}${Number.isFinite(notation.total) ? " is-completion" : ""}`;
  return <div className={className}>
    {(notation.terms || []).map((term, index) => <React.Fragment key={`${term}-${index}`}>
      <RhythmSumTerm rhythm={term} scale={terms.length === 1 ? 1.14 : .9} />
      {notation.operators?.[index] && <span className="millionaire-rhythmsums-operator" aria-hidden="true">{notation.operators[index]}</span>}
    </React.Fragment>)}
    {Number.isFinite(notation.total) && <><span className="millionaire-rhythmsums-operator" aria-hidden="true">=</span><span className="millionaire-rhythmsums-total" aria-label={`${notation.total} beats`}>{notation.total}</span></>}
  </div>;
}

// Match the presentation in Dynamics: hairpins are drawn as two clean lines,
// while letter dynamics use the shared Bravura calibration.
const DYNAMIC_SYMBOL_KEYS = { pp: "pianissimo", p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte", ff: "fortissimo", sfz: "sforzato" };

function AnswerDynamicGlyph({ dynamic, label }) {
  const symbolKey = DYNAMIC_SYMBOL_KEYS[dynamic];
  return <span className="millionaire-answer-dynamic" role="img" aria-label={label}><svg viewBox="0 0 90 70" aria-hidden="true"><CalibratedNotationSymbol symbolKey={symbolKey} x={56.5} y={44} gap={10} settingOverrides={{ fontSizeScale: 5.475 }} /></svg></span>;
}

function DynamicNotationGlyph({ dynamic, x = 80, y = 50 }) {
  if (dynamic === "crescendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y - 12}`} /><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y + 8}`} /></g>;
  if (dynamic === "diminuendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 12} L ${x + 32} ${y - 2}`} /><path d={`M ${x - 32} ${y + 8} L ${x + 32} ${y - 2}`} /></g>;
  const symbolKey = DYNAMIC_SYMBOL_KEYS[dynamic];
  const fontSizeScale = ["pp", "p", "mp", "mf", "f", "ff", "sfz"].includes(dynamic) ? 5.475 : 3.65;
  return symbolKey ? <CalibratedNotationSymbol symbolKey={symbolKey} x={x} y={y + 4} gap={14} settingOverrides={{ fontSizeScale }} /> : null;
}

function DynamicNotation({ notation }) {
  const letterDynamic = ["pp", "p", "mp", "mf", "f", "ff", "sfz"].includes(notation.dynamic);
  return <svg className="millionaire-dynamic-notation" viewBox="0 0 160 88" aria-hidden="true"><DynamicNotationGlyph dynamic={notation.dynamic} x={letterDynamic ? 95 : 80} /></svg>;
}

// This is the calibrated Bravura end-barline from Barlines, rather than two
// ordinary text strokes. It includes the correct thin and thick lines.
function FinalBarlineNotation() {
  return <svg className="millionaire-final-barline-notation" viewBox="0 0 160 110" aria-hidden="true"><CalibratedNotationSymbol symbolKey="barlineFinal" x={80} y={50} gap={14} settingOverrides={{ fontSizeScale: 12 }} /></svg>;
}

function BarTimeSignature({ time, x, top, gap }) {
  if (!time) return null;
  const [upper, lower] = time;
  const symbolKey = `timeSig${upper}${lower}`;
  const settings = sharedNotationSymbol(symbolKey);
  const anchorY = top + gap * 1.35;
  const adjustedX = x + gap * settings.xOffsetScale + settings.opticalXOffset;
  const adjustedY = anchorY + gap * settings.yOffsetScale + settings.opticalYOffset;
  const transform = `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale} ${settings.heightScale}) translate(${-adjustedX} ${-adjustedY})`;
  const fontSize = gap * settings.fontSizeScale;
  return <g className="millionaire-music-symbol" transform={transform}>
    <text x={adjustedX} y={adjustedY - fontSize * .14} fontSize={fontSize} textAnchor="middle">{bravuraSymbol(`timeSig${upper}`, TIME_DIGITS[upper])}</text>
    <text x={adjustedX} y={adjustedY + fontSize * .43} fontSize={fontSize} textAnchor="middle">{bravuraSymbol(`timeSig${lower}`, TIME_DIGITS[lower])}</text>
  </g>;
}

function StandaloneTimeSignature({ notation, centered = false }) {
  const x = centered ? 172 : 145;
  return <svg className="millionaire-time-signature-notation" viewBox="0 0 220 160" aria-hidden="true"><BarTimeSignature time={[notation.top, notation.bottom]} x={x} top={42} gap={24} /></svg>;
}

function TwoBarMelodyNotation({ notation }) {
  const gap = Math.max(10, Number(SHARED_NOTATION.stave?.lineGap || 14));
  const top = 50;
  const bottom = top + gap * 4;
  const staffLeft = 28;
  const staffRight = 492;
  const middleBarline = 286;
  const notePositions = [[142, 180, 218, 256], [330, 368, 406, 444]];
  return <svg className="millionaire-two-bar-melody" viewBox="0 0 520 160" aria-hidden="true">
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-complete-bar-line" x1={staffLeft} x2={staffRight} y1={top + index * gap} y2={top + index * gap} />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={72} y={bottom - gap} gap={gap} />
    {(notation.bars || []).slice(0, 2).map((bar, barIndex) => (bar || []).slice(0, 4).map((pitch, noteIndex) => {
      const position = PITCH_INDEX[pitch] ?? 4;
      const y = bottom - (position - 2) * gap / 2;
      const x = notePositions[barIndex][noteIndex];
      const stemDown = position - NOTE_STEM_STEP_OFFSET > NOTE_STEM_DOWN_STEP_THRESHOLD;
      return <CalibratedNotationSymbol key={`${barIndex}-${noteIndex}-${pitch}`} symbolKey={stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={x} y={y} gap={gap} />;
    }))}
    <line className="millionaire-complete-barline" x1={middleBarline} x2={middleBarline} y1={top} y2={bottom} />
    <line className="millionaire-complete-barline" x1={staffRight} x2={staffRight} y1={top} y2={bottom} />
  </svg>;
}

// National 5 chord questions use the same score dimensions, note positions,
// rhythm choices and shared Bravura calibration as chords.html.
function N5ChordOutlineNotation({ notation }) {
  const width = 920;
  const height = 430;
  const gap = 10;
  const top = 154;
  const staffStart = 248;
  const staffEnd = 673;
  const noteXs = [338, 458, 578];
  const fadeId = `millionaire-n5-chord-fade-${notation.scoreId || "score"}`;
  const ledgerConfig = SHARED_NOTATION.symbols?.ledgerLines || {};
  const ledgerWidth = 12 * Number(ledgerConfig.widthScale || 1);
  const ledgerThickness = Math.max(1, .6 * Number(ledgerConfig.fontSizeScale || 2) * Number(ledgerConfig.heightScale || 1));
  const ledgerXOffset = Number(ledgerConfig.xOffsetScale || 0) * gap;
  const ledgerYOffset = Number(ledgerConfig.yOffsetScale || 0) * gap;
  return <svg className="millionaire-n5-chord-outline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs>
      <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={staffStart} x2={staffEnd} y1="0" y2="0">
        <stop offset="0%" stopColor="#000" stopOpacity="1" />
        <stop offset="82%" stopColor="#000" stopOpacity="1" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width={width} height={height} fill="transparent" />
    <g transform={`translate(${width / 2} ${top + gap * 2}) scale(1.5) translate(${-width / 2} ${-(top + gap * 2)})`}>
      {Array.from({ length: 5 }, (_, line) => <line key={line} x1={staffStart} x2={staffEnd} y1={top + line * gap} y2={top + line * gap} stroke={`url(#${fadeId})`} strokeWidth="1.2" />)}
      <CalibratedNotationSymbol symbolKey="gClef" x={staffStart + gap * 3.2} y={top + gap * 3} gap={gap} />
      {(notation.notes || []).slice(0, 3).map((note, index) => {
        const position = PITCH_INDEX[note.pitch] ?? 4;
        const step = position - NOTE_STEM_STEP_OFFSET;
        const noteY = top + gap * 4 - step * gap / 2;
        const noteX = noteXs[index];
        const stemDown = step > NOTE_STEM_DOWN_STEP_THRESHOLD;
        const symbolKey = note.rhythm === "minim"
          ? (stemDown ? "halfNoteStemDown" : "halfNoteStemUp")
          : (stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp");
        const ledgerSteps = [];
        for (let ledgerStep = -2; ledgerStep >= step; ledgerStep -= 2) ledgerSteps.push(ledgerStep);
        for (let ledgerStep = 10; ledgerStep <= step; ledgerStep += 2) ledgerSteps.push(ledgerStep);
        return <React.Fragment key={`${note.pitch}-${note.rhythm}-${index}`}>
          {ledgerSteps.map((ledgerStep) => {
            const ledgerY = top + gap * 4 - ledgerStep * gap / 2 + ledgerYOffset;
            return <line key={ledgerStep} x1={noteX + ledgerXOffset - ledgerWidth} x2={noteX + ledgerXOffset + ledgerWidth} y1={ledgerY} y2={ledgerY} stroke="currentColor" strokeWidth={ledgerThickness} />;
          })}
          <CalibratedNotationSymbol symbolKey={symbolKey} x={noteX} y={noteY} gap={gap} />
        </React.Fragment>;
      })}
    </g>
  </svg>;
}

// Complete-bar questions now use the Rests single-bar score. Selecting a
// Millionaire answer places that note into the outlined target.
function CompleteBarNotation({ notation, selectedRhythm = null }) {
  if (!notation.time) return <TimeSigFirstBarNotation notation={notation} />;
  return <RestsFirstBarNotation notation={notation} selectedRhythm={selectedRhythm} />;
}

function InlineNotationGlyph({ glyph, index, shiftDottedMinimRight = false }) {
  if (glyph === "blank") return <span className="millionaire-glyph-blank" key={index}>?</span>;
  const isDottedMinim = glyph === "dottedHalfNote";
  const isDottedNote = isDottedMinim || ["dottedQuarterNote", "dottedEighthNote"].includes(glyph);
  const className = [isDottedNote ? "millionaire-dotted-note" : "", shiftDottedMinimRight && isDottedMinim ? "millionaire-dotted-minim-shift-right" : ""].filter(Boolean).join(" ");
  return <span className={className} key={index}>{GLYPHS[glyph] || "?"}</span>;
}

function NotationView({ notation, className = "", whatNoteQuestion = false, selectedRhythm = null, selectedBassNote = null }) {
  if (!notation) return null;
  const singleSymbolNotation = ["glyphs", "barline", "dynamic"].includes(notation.kind);
  const timeSignatureNotation = notation.kind === "timeSignature";
  const melodyNotation = notation.kind === "melody";
  const hairpinNotation = notation.kind === "dynamic" && ["crescendo", "diminuendo"].includes(notation.dynamic);
  const trebleClefNotation = notation.kind === "glyphs" && notation.glyphs?.length === 1 && notation.glyphs[0] === "trebleClef";
  const semibreveNotation = notation.kind === "glyphs" && notation.glyphs?.length === 1 && notation.glyphs[0] === "wholeNote";
  const repeatSignNotation = notation.kind === "glyphs" && notation.glyphs?.length === 1 && notation.glyphs[0] === "repeatRight";
  const twoTermRhythmSum = notation.kind === "rhythmSum" && notation.terms?.length === 2;
  const rhythmCompletionNotation = notation.kind === "rhythmSum" && Number.isFinite(notation.total);
  let content = null;
  const compactStave = typeof className === "string" && className.includes("is-note-name-question") && notation.kind !== "melody";
  const centeredTimeSignature = typeof className === "string" && className.includes("is-time-signature-question");
  const shiftDottedMinimRight = typeof className === "string" && className.includes("is-dotted-minim-name-question");
  if (notation.kind === "note" || notation.kind === "melody") content = <StaffNotation notation={notation} compactStave={compactStave} whatNoteQuestion={whatNoteQuestion || notation.kind === "melody"} />;
  else if (notation.kind === "n5ChordOutline") content = <N5ChordOutlineNotation notation={notation} />;
  else if (notation.kind === "stave") content = <StaffNotation notation={{ ...notation, showClef: false, showBarline: false }} compactStave={compactStave} whatNoteQuestion={whatNoteQuestion} />;
  else if (notation.kind === "keySignature") content = <KeySignatureNotation notation={notation} />;
  else if (notation.kind === "interval") content = <IntervalNotation notation={notation} />;
  else if (notation.kind === "ahInterval") content = <AHIntervalNotation notation={notation} />;
  else if (notation.kind === "navigationSymbol") content = <NavigationSymbolNotation notation={notation} />;
  else if (notation.kind === "tieCallout") content = <TieCalloutNotation notation={notation} />;
  else if (notation.kind === "ahChord") content = <AHChordNotation notation={notation} />;
  else if (notation.kind === "ahBassPrompt") content = <AHBassPromptNotation notation={notation} selectedBassNote={selectedBassNote} />;
  else if (notation.kind === "octaveSign") content = <OctaveSignNotation notation={notation} />;
  else if (notation.kind === "repeatEnding") content = <RepeatEndingNotation notation={notation} />;
  else if (notation.kind === "accidentalSymbol") content = <AccidentalSymbolNotation notation={notation} />;
  else if (notation.kind === "articulation") content = <HigherArticulationNotation notation={notation} />;
  else if (notation.kind === "rest") content = <HigherRestNotation notation={notation} />;
  else if (notation.kind === "restSum") content = <HigherRestSumNotation notation={notation} />;
  else if (notation.kind === "restBar") content = <HigherRestBarNotation notation={notation} selectedRest={selectedRhythm} />;
  else if (notation.kind === "triplet") content = <HigherTripletNotation notation={notation} />;
  else if (notation.kind === "rhythmSum") content = <RhythmSumNotation notation={notation} />;
  else if (notation.kind === "dynamic") content = <DynamicNotation notation={notation} />;
  else if (notation.kind === "barline") content = <div className="millionaire-glyphs millionaire-final-barline-glyphs"><InlineNotationGlyph glyph="barlineFinal" index={0} /></div>;
  else if (notation.kind === "timeSignature") content = <StandaloneTimeSignature notation={notation} centered={centeredTimeSignature} />;
  else if (notation.kind === "bar") content = <CompleteBarNotation notation={notation} selectedRhythm={selectedRhythm} />;
  else if (notation.kind === "rhythmFigure") content = <RhythmFigureNotation notation={notation} />;
  else if (notation.kind === "beam") content = <RhythmFigureNotation notation={notation} highlightBeam={true} />;
  else if (notation.kind === "notePart") content = <NotePartNotation notation={notation} />;
  else if (notation.kind === "twoBarMelody") content = <TwoBarMelodyNotation notation={notation} />;
  else content = <div className="millionaire-glyphs">{(notation.glyphs || []).map((glyph, index) => <InlineNotationGlyph glyph={glyph} index={index} shiftDottedMinimRight={shiftDottedMinimRight} />)}</div>;
  const accessibleLabel = selectedBassNote ? `${notation.label || "Music notation"} Selected bass note: ${selectedBassNote}.` : notation.label || "Music notation";
  return <div className={`millionaire-notation${singleSymbolNotation ? " is-single-symbol-notation" : ""}${timeSignatureNotation ? " is-time-signature-question" : ""}${melodyNotation ? " is-melody-notation" : ""}${hairpinNotation ? " is-hairpin-notation" : ""}${trebleClefNotation ? " is-treble-clef-notation" : ""}${semibreveNotation ? " is-semibreve-notation" : ""}${repeatSignNotation ? " is-repeat-sign-notation" : ""}${twoTermRhythmSum ? " is-two-term-rhythm-sum" : ""}${rhythmCompletionNotation ? " is-rhythm-completion-question" : ""}${className ? ` ${className}` : ""}`} role="img" aria-label={accessibleLabel}>{content}</div>;
}

function isDottedMinimNameQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  const normalisedPrompt = String(prompt).trim().toLowerCase();
  const isDottedMinimPrompt = normalisedPrompt === "what is this note value called?" || normalisedPrompt.includes("what is this note") && normalisedPrompt.includes("called");
  return concept === "dotted-minim-name" || isDottedMinimPrompt;
}

function isDottedMinimBeatsQuestion(question) {
  return question?.concept === "dotted-minim-beats";
}

function isTimeSignatureBarCompletionQuestion(question) {
  return question?.notation?.kind === "restBar" || (question?.notation?.kind === "bar"
    && Array.isArray(question.notation.time)
    && question.notation.glyphs?.includes("blank"));
}

function isWhatNoteQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  const normalisedPrompt = String(prompt).trim().toLowerCase();
  return normalisedPrompt === "what note is this?" || ["treble-clef-e", "treble-clef-g", "treble-clef-c", "treble-clef-b", "treble-clef-e-space"].includes(concept);
}

function isNoteValueNameQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  const isNamedNotePrompt = typeof prompt === "string" && (prompt === "What note is this?" || prompt.startsWith("Name the note"));
  const isSymbolPrompt = typeof prompt === "string" && (prompt === "What is this symbol called?" || prompt === "What is the name of this symbol?");
  return ["crotchet-name", "minim-name", "dotted-minim-name", "semibreve-name", "treble-clef-e", "treble-clef-g", "treble-clef-c", "treble-clef-b", "treble-clef-e-space", "double-barline-name"].includes(concept) || isNamedNotePrompt || isSymbolPrompt;
}

function isDynamicSymbolQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  const normalisedPrompt = String(prompt).trim().toLowerCase();
  return ["crescendo-symbol", "diminuendo-symbol"].includes(concept) || (normalisedPrompt === "what is this symbol called?" && ["crescendo", "diminuendo"].includes(concept));
}

function isSymbolMeaningQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  const normalisedPrompt = String(prompt).trim().toLowerCase();
  return (
    concept === "double-barline-meaning" ||
    normalisedPrompt === "what does this symbol usually mean?" ||
    (normalisedPrompt.includes("what does") && normalisedPrompt.includes("this symbol") && normalisedPrompt.includes("mean"))
  );
}

function isBeatTotalQuestion(question) {
  const prompt = question?.prompt || "";
  return prompt === "Calculate the total number of beats.";
}

function isSingleNoteBeatsQuestion(question) {
  const concept = question?.concept || "";
  const prompt = question?.prompt || "";
  return ["crotchet-beats", "minim-beats", "dotted-minim-beats", "semibreve-beats"].includes(concept) || prompt === "How many beats does this note last?";
}

function isTopNumberTimeSignatureQuestion(question) {
  const prompt = question?.prompt || "";
  const concept = question?.concept || "";
  return prompt === "What does the top number tell you?" || prompt === "What does a time signature tell you?" || concept === "time-signature-purpose" || question?.notation?.kind === "timeSignature";
}

function QuestionImage({ image }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) return image ? <div className="millionaire-placeholder-note" role="status">The question image is unavailable. Use the accessible description: {image.alt || "No description supplied."}</div> : null;
  return <img src={image.src} alt={image.alt || "Question illustration"} onError={() => setFailed(true)} style={{ maxWidth: 520, maxHeight: 180, marginTop: 16, borderRadius: 10 }} />;
}

function AudioCard({ playsUsed, playing, onPlay, onStop, learning = false }) {
  const remaining = Math.max(0, 3 - playsUsed);
  return <div className="millionaire-audio-controls">
    <button type="button" className="millionaire-primary millionaire-final-answer millionaire-audio-button" onClick={() => playing ? onStop() : onPlay(learning)} disabled={!playing && !learning && remaining === 0} aria-label={playing ? "Stop listening excerpt" : `Play listening excerpt. ${remaining} plays remaining`}>
      <span className={`millionaire-audio-glyph${playing ? " is-stop" : ""}`} aria-hidden="true">{playing ? "■" : "▶"}</span>
      <span className="millionaire-final-answer-label">{playing ? "Stop" : "Play"}</span>
    </button>
    {!learning && <span className="millionaire-audio-count">Remaining: {remaining}</span>}
  </div>;
}

const MILESTONE_CONFETTI_COLOURS = ["#f6c453", "#38bdf8", "#ffffff", "#a78bfa", "#4ade80"];

function MilestoneCelebration({ reward, showBurst = true }) {
  return <div className="millionaire-milestone-reveal" role="img" aria-label={`${reward.label} earned`}>
    {showBurst && <div className="millionaire-milestone-confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        const distance = 54 + (index % 5) * 13;
        return <span key={index} className="millionaire-confetti-piece" style={{
          "--confetti-x": `${Math.cos(angle) * distance}px`,
          "--confetti-y": `${Math.sin(angle) * distance}px`,
          "--confetti-rotate": `${(index % 2 ? 1 : -1) * (180 + index * 23)}deg`,
          backgroundColor: MILESTONE_CONFETTI_COLOURS[index % MILESTONE_CONFETTI_COLOURS.length],
          animationDelay: `${(index % 7) * .035}s`,
        }} />;
      })}
    </div>}
    <img className="millionaire-milestone-medal" src={reward.celebrationIcon} alt="" aria-hidden="true" />
    <span className="millionaire-milestone-shine" style={{ "--millionaire-medal-mask": `url("${reward.celebrationIcon}")` }} aria-hidden="true" />
  </div>;
}

function FinalConfetti() {
  return <div className="millionaire-final-confetti" aria-hidden="true">{Array.from({ length: 60 }, (_, index) => <span key={index} className="millionaire-final-confetti-piece" style={{
    left: `${(index * 37) % 100}%`,
    width: `${6 + (index % 3) * 2}px`,
    height: `${10 + (index % 4) * 2}px`,
    backgroundColor: MILESTONE_CONFETTI_COLOURS[index % MILESTONE_CONFETTI_COLOURS.length],
    "--confetti-fall-duration": `${3.8 + (index % 7) * .55}s`,
    "--confetti-fall-delay": `${-(index % 15) * .42}s`,
    "--confetti-fall-drift": `${((index % 9) - 4) * 12}px`,
    "--confetti-fall-rotate": `${360 + (index % 6) * 120}deg`,
  }} />)}</div>;
}

function PrizeLadder({ currentIndex, correctCount, controls }) {
  return <aside className="millionaire-ladder" aria-label="Prize ladder">
    {controls}
    {[...CORE.PRIZE_LADDER].map((value, index) => ({ value, stage: index + 1 })).reverse().map(({ value, stage }) => {
      const classes = ["millionaire-prize-row"];
      const reward = QUESTION_REWARDS[stage];
      if (reward && stage !== 3) classes.push("is-reward");
      if (stage === currentIndex + 1) classes.push("is-current");
      if (stage <= correctCount) classes.push("is-complete");
      const prizeLabel = value === 1000000 ? "£1 MILLION" : CORE.formatPrize(value);
      return <div key={stage} className={classes.join(" ")} aria-current={stage === currentIndex + 1 ? "step" : undefined}><span className="millionaire-prize-number">{stage}</span><span className="millionaire-prize-diamond" aria-hidden="true">◆</span><span className="millionaire-prize-value-wrap"><span className="millionaire-prize-value">{prizeLabel}</span>{reward && <img className="millionaire-prize-reward" src={reward.icon} alt={reward.label} />}</span></div>;
    })}
  </aside>;
}

function ResultStat({ label, children, previous = null, valueClassName = "" }) {
  return <div className="millionaire-result-stat">
    <span>{label}</span>
    <strong className={valueClassName}>{children}</strong>
    {previous != null && <small>{previous}</small>}
  </div>;
}

function QuestionTypeGlyph({ option }) {
  return <span className="flex h-[22px] w-[28px] items-center justify-center overflow-visible text-stone-900">{option.icon
    ? <img src={option.icon} alt="" aria-hidden="true" className={`${option.iconSize || "h-[21px] w-[21px]"} object-contain`} />
    : <span className={option.notationGlyph ? "millionaire-question-type-clef" : "text-[13px] font-black leading-none tracking-tight"}>{option.glyph}</span>}</span>;
}

function hasQuestionAudio(question) {
  return Boolean(question?.audio?.generator || question?.audioSrc);
}

function QuestionTimer({ seconds }) {
  const remaining = Math.max(0, Math.ceil(seconds));
  const progress = Math.max(0, Math.min(100, (seconds / TIMER_DURATION_SECONDS) * 100));
  return <div className="millionaire-question-timer" role="timer" aria-label={`${remaining} seconds remaining`}>
    <svg className="millionaire-question-timer-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="millionaire-question-timer-track" cx="50" cy="50" r="45" pathLength="100" />
      <circle className="millionaire-question-timer-progress" cx="50" cy="50" r="45" pathLength="100" style={{ strokeDashoffset: 100 - progress }} />
    </svg>
    <span>{remaining}</span>
  </div>;
}

function HintText({ question }) {
  const emphasis = question.tipEmphasis;
  const emphasisIndex = emphasis ? question.tip.indexOf(emphasis) : -1;
  if (emphasisIndex < 0) return question.tip;
  const before = question.tip.slice(0, emphasisIndex);
  const emphasised = question.tip.slice(emphasisIndex, emphasisIndex + emphasis.length);
  const after = question.tip.slice(emphasisIndex + emphasis.length);
  return <>{before}<b>{emphasised}</b>{after}</>;
}

function App() {
  const [screen, setScreen] = useState("title");
  const [settings, setSettings] = useState(() => {
    const saved = safeRead(SETTINGS_KEY, {});
    const savedTypes = Array.isArray(saved.questionTypes) ? saved.questionTypes.filter((category) => CORE.CATEGORIES.includes(category)) : [];
    const queryLevel = new URLSearchParams(window.location.search).get("level");
    const level = CORE.SUPPORTED_LEVELS.includes(queryLevel) ? queryLevel
      : CORE.SUPPORTED_LEVELS.includes(saved.level) ? saved.level : DEFAULT_SETTINGS.level;
    const availableTypes = CORE.CATEGORIES.filter((category) => CORE.DIFFICULTIES.every((difficulty) => (QUESTION_POOLS[level]?.[difficulty]?.[category]?.length || 0) >= 5));
    const selectedTypes = savedTypes.filter((category) => availableTypes.includes(category));
    return { ...DEFAULT_SETTINGS, ...saved, level, questionTypes: selectedTypes.length ? [...new Set(selectedTypes)] : availableTypes };
  });
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
  const [hintVisible, setHintVisible] = useState(false);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [lifelines, setLifelines] = useState({ fifty: true, hint: true, switch: true });
  const [records, setRecords] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [finalPrize, setFinalPrize] = useState(0);
  const [highestReached, setHighestReached] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [previousPerformance, setPreviousPerformance] = useState({ bestWinMs: null, highestQuestion: 0, bestAmount: 0, bestTimesByQuestion: {} });
  const [milestone, setMilestone] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION_SECONDS);
  const [announcement, setAnnouncement] = useState("Welcome to Who Wants to Be a Millionaire.");
  const [transitioning, setTransitioning] = useState(false);
  const [correctRevealSkippable, setCorrectRevealSkippable] = useState(false);
  const [openingZooming, setOpeningZooming] = useState(false);
  const levelRef = useRef(null);
  const customiseRef = useRef(null);
  const lifelineRef = useRef(null);
  const audioDirector = useRef(new AudioDirector());
  const gameSaved = useRef(false);
  const timerExpired = useRef(false);
  const timerTickAudio = useRef(null);
  const lastTimerTick = useRef(null);
  const twoBarPatternHistory = useRef(new Map());
  const openingZoomTimer = useRef(null);

  const question = questions[currentIndex];
  window.MLH.useClickOutside(
    [levelRef, customiseRef],
    [() => setLevelOpen(false), () => setCustomiseOpen(false)],
  );

  useEffect(() => {
    const errors = CORE.validateQuestionPools(QUESTION_POOLS);
    if (errors.length) console.error("Millionaire question-bank validation errors:", errors);
    else console.info(`Millionaire question bank validated: ${QUESTION_BANK.length} questions across 45 pools.`);
    const isDevelopment = window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isDevelopment) console.info(`Millionaire question-bank summary:\n${CORE.questionPoolSummary(QUESTION_POOLS).join("\n")}`);
  }, []);

  useEffect(() => {
    safeWrite(SETTINGS_KEY, settings);
    document.documentElement.classList.toggle("millionaire-reduced-motion", settings.reducedMotion);
    audioDirector.current.configure(settings);
  }, [settings]);

  useEffect(() => {
    const canRunTimer = settings.timer && screen === "game" && question && !openingZooming && !locked && !transitioning && !revealed;
    if (!canRunTimer) {
      setTimeRemaining(TIMER_DURATION_SECONDS);
      return undefined;
    }
    timerExpired.current = false;
    const endsAt = Date.now() + TIMER_DURATION_SECONDS * 1000;
    const updateTimer = () => {
      const remaining = Math.max(0, (endsAt - Date.now()) / 1000);
      setTimeRemaining(remaining);
      if (remaining === 0 && !timerExpired.current) {
        timerExpired.current = true;
        handleTimerExpired();
      }
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(interval);
  }, [settings.timer, screen, currentIndex, question?.id, openingZooming, locked, transitioning, revealed]);

  useEffect(() => {
    const timerIsActive = settings.timer && settings.soundEffects && screen === "game" && question && !locked && !transitioning && !revealed;
    if (!timerIsActive) {
      lastTimerTick.current = null;
      timerTickAudio.current?.pause();
      return;
    }
    const seconds = Math.ceil(timeRemaining);
    if (seconds > 8 || seconds < 1 || seconds === lastTimerTick.current) return;
    lastTimerTick.current = seconds;
    const audio = timerTickAudio.current || new Audio(`${MILLIONAIRE_SOUND_PATH}tick.mp3`);
    timerTickAudio.current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [settings.timer, settings.soundEffects, screen, question?.id, locked, transitioning, revealed, timeRemaining]);

  useEffect(() => () => {
    window.clearTimeout(openingZoomTimer.current);
    audioDirector.current.destroy();
  }, []);

  useEffect(() => {
    if (screen === "results" && outcome === "won") audioDirector.current.pauseMusic();
    else if (["title", "rules", "results"].includes(screen)) audioDirector.current.playOpening();
    else if (screen !== "game") audioDirector.current.pauseMusic();
  }, [screen, outcome]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, currentIndex]);

  useEffect(() => {
    function onKeyDown(event) {
      if (dialog || helpOpen || screen !== "game") return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      const key = event.key.toLowerCase();
      const answerMap = { a: "A", "1": "A", b: "B", "2": "B", c: "C", "3": "C", d: "D", "4": "D" };
      if (answerMap[key]) { event.preventDefault(); selectAnswer(answerMap[key]); }
      else if (event.key === "Enter") { event.preventDefault(); lockAnswer(); }
      else if (event.code === "Space" && hasQuestionAudio(question)) { event.preventDefault(); playQuestionAudio(false); }
      else if (key === "l") { event.preventDefault(); lifelineRef.current?.querySelector("button:not(:disabled)")?.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function toggleGameAudio() {
    const enabled = settings.backgroundMusic && settings.soundEffects;
    const nextSettings = { ...settings, backgroundMusic: !enabled, soundEffects: !enabled };
    audioDirector.current.configure(nextSettings);
    setSettings(nextSettings);
  }

  function toggleQuestionType(category) {
    const availableTypes = CORE.CATEGORIES.filter((item) => CORE.DIFFICULTIES.every((difficulty) => (QUESTION_POOLS[settings.level]?.[difficulty]?.[item]?.length || 0) >= 5));
    if (!availableTypes.includes(category)) return;
    setSettings((current) => {
      const enabled = current.questionTypes.includes(category);
      if (enabled && current.questionTypes.length === 1) return current;
      return { ...current, questionTypes: enabled ? current.questionTypes.filter((item) => item !== category) : [...current.questionTypes, category] };
    });
  }

  function createQuestions() {
    const recentGames = safeRead(HISTORY_KEY, []);
    try {
      const categories = settings.questionTypes;
      for (let gameAttempt = 0; gameAttempt < 20; gameAttempt += 1) {
        const prepared = [];
        const usedFingerprints = new Set();
        const selected = CORE.composeGame(QUESTION_BANK, recentGames, Math.random, { level: settings.level, categories });
        let collision = false;
        for (const targetQuestion of selected) {
          let candidate = targetQuestion;
          let fingerprint = "";
          for (let variantAttempt = 0; variantAttempt < 40; variantAttempt += 1) {
            candidate = randomiseTwoBarQuestion(targetQuestion);
            fingerprint = CORE.questionFingerprint(candidate);
            if (!usedFingerprints.has(fingerprint)) break;
          }
          if (usedFingerprints.has(fingerprint)) { collision = true; break; }
          usedFingerprints.add(fingerprint);
          prepared.push(candidate);
        }
        if (!collision && prepared.length === 15) return prepared;
      }
      throw new Error("Could not prepare fifteen pupil-facing questions without a repeat.");
    } catch (error) {
      console.error("Millionaire game composition failed.", error);
      return null;
    }
  }

  function randomiseTwoBarQuestion(targetQuestion) {
    if (targetQuestion?.concept === "national-5-time-signature") {
      const notation = targetQuestion.notation || {};
      const timeSignature = targetQuestion.answers?.find((answer) => answer.id === targetQuestion.correctAnswer)?.text || notation.timeSignature;
      const patterns = N5_SIMPLE_TIME_PATTERNS[timeSignature] || [];
      const semiquaverPatterns = patterns.filter((pattern) => pattern.some((token) => token.includes("semiquaver")));
      const regularPatterns = patterns.filter((pattern) => !pattern.some((token) => token.includes("semiquaver")));
      const pool = semiquaverPatterns.length && Math.random() < .16 ? semiquaverPatterns : regularPatterns;
      const finalPool = timeSignature === "4/4" ? [["semibreve"], ...pool] : pool;
      const rhythmTokens = CORE.shuffle(finalPool.length ? finalPool : patterns, Math.random)[0];
      return { ...targetQuestion, notation: { ...notation, timeSignature, rhythmTokens } };
    }
    if (targetQuestion?.concept === "chord-identification") {
      const notation = targetQuestion.notation || {};
      const rhythmPatterns = [
        ["crotchet", "crotchet", "minim"],
        ["minim", "crotchet", "crotchet"],
      ];
      const pattern = CORE.shuffle(rhythmPatterns, Math.random)[0];
      const notes = CORE.shuffle(notation.pitches || [], Math.random).map((pitch, index) => ({ pitch, rhythm: pattern[index] }));
      return { ...targetQuestion, notation: { ...notation, scoreId: targetQuestion.id, notes } };
    }
    const previousSignature = twoBarPatternHistory.current.get(targetQuestion?.concept) || "";
    const generated = CORE.generateTwoBarMelody(targetQuestion?.concept, Math.random, previousSignature);
    if (!generated) return targetQuestion;
    twoBarPatternHistory.current.set(targetQuestion.concept, generated.signature);
    return CORE.applyGeneratedTwoBarMelody(targetQuestion, generated);
  }

  function resetQuestionState() {
    audioDirector.current.stopExcerpt();
    setSelectedLetter(null);
    setLocked(false);
    setRevealed(null);
    setRemovedLetters([]);
    setHintVisible(false);
    setPlaysUsed(0);
    setAudioPlaying(false);
    setTransitioning(false);
    setCorrectRevealSkippable(false);
  }

  function beginPreparedGame(nextQuestions, keepOpeningZoom = false) {
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
    if (!keepOpeningZoom) setOpeningZooming(false);
    setScreen("game");
    setAnnouncement("Question 1 for £100.");
  }

  function startGame() {
    if (openingZooming) return;
    const nextQuestions = createQuestions();
    if (!nextQuestions) {
      setDialog({ type: "error", message: `A complete ${MILLIONAIRE_LEVELS[settings.level].label} game could not be prepared. Please reload and try again.` });
      return;
    }
    setLevelOpen(false);
    setCustomiseOpen(false);
    setPreviousPerformance(levelPerformance(settings.level));
    audioDirector.current.configure(settings);
    audioDirector.current.startGame();
    if (settings.reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      beginPreparedGame(nextQuestions);
      return;
    }
    setOpeningZooming(true);
    beginPreparedGame(nextQuestions, true);
    openingZoomTimer.current = window.setTimeout(() => {
      openingZoomTimer.current = null;
      setOpeningZooming(false);
    }, 1600);
  }

  function resetGame() {
    window.clearTimeout(openingZoomTimer.current);
    openingZoomTimer.current = null;
    setOpeningZooming(false);
    resetQuestionState();
    audioDirector.current.stopMusic();
    audioDirector.current.stopEffect();
    setDialog(null);
    setMilestone(null);
    setScreen("title");
  }

  function selectAnswer(letter) {
    if (locked || transitioning || removedLetters.includes(letter) || !question?.answers.some((answer) => answer.letter === letter)) return;
    setSelectedLetter(letter);
    setAnnouncement(`Answer ${letter} selected. Press Final Answer to lock it in.`);
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

  async function lockAnswer() {
    if (!selectedLetter || locked || transitioning || !question) return;
    audioDirector.current.stopExcerpt(false);
    setAudioPlaying(false);
    setHintVisible(false);
    setLocked(true);
    setTransitioning(true);
    setAnnouncement(`Answer ${selectedLetter} locked.`);
    await audioDirector.current.playFinalAnswer(currentIndex + 1);
    const isCorrect = selectedLetter === question.correctLetter;
    const record = currentRecord(isCorrect);
    setRecords((current) => [...current, record]);
    setRevealed(isCorrect ? "correct" : "incorrect");
    setTransitioning(false);
    if (isCorrect) await handleCorrectAnswer(record);
    else await handleIncorrectAnswer(record);
  }

  async function handleTimerExpired() {
    if (locked || transitioning || !question) return;
    audioDirector.current.stopExcerpt(false);
    setAudioPlaying(false);
    setHintVisible(false);
    setLocked(true);
    setTransitioning(true);
    setAnnouncement("Time is up. The correct answer is being revealed.");
    setSelectedLetter(null);
    const record = { ...currentRecord(false), pupilLetter: null, pupilAnswer: "Not answered" };
    setRecords((current) => [...current, record]);
    setRevealed("incorrect");
    setTransitioning(false);
    await handleIncorrectAnswer(record);
    audioDirector.current.stopMusic();
  }

  async function handleCorrectAnswer(record) {
    const stage = currentIndex + 1;
    const nextCorrect = correctCount + 1;
    setCorrectCount(nextCorrect);
    setAnnouncement(`Correct. You have won ${CORE.formatPrize(CORE.PRIZE_LADDER[currentIndex])}.`);
    if (stage === 15) {
      setOutcome("won");
      setFinalPrize(1000000);
      setHighestReached(15);
      setMilestone({ stage: 15, prize: 1000000, victory: true });
      setScreen("milestone");
      audioDirector.current.playOutcome(15, true, { finishNaturally: true });
      return;
    }
    if (QUESTION_REWARDS[stage]) {
      setMilestone({ stage, prize: CORE.PRIZE_LADDER[currentIndex], nextIndex: currentIndex + 1, autoAdvance: true });
      setAnnouncement(`Milestone reached. You have won ${CORE.formatPrize(CORE.PRIZE_LADDER[currentIndex])}. Moving to Question ${stage + 1} when the correct-answer audio finishes.`);
      const stopAfterSeconds = stage === 5 ? 7 : stage === 10 ? 8 : 0;
      await audioDirector.current.playOutcome(stage, true, { finishNaturally: stage !== 3, stopAfterSeconds });
      setMilestone(null);
      goToQuestion(currentIndex + 1);
      return;
    }
    setCorrectRevealSkippable(true);
    await audioDirector.current.playOutcome(stage, true);
    setCorrectRevealSkippable(false);
    goToQuestion(currentIndex + 1);
  }

  async function handleIncorrectAnswer() {
    const prize = CORE.guaranteedPrize(correctCount);
    setOutcome("incorrect");
    setFinalPrize(prize);
    setHighestReached(currentIndex + 1);
    setAnnouncement(`Incorrect. The correct answer is ${question.correctLetter}.`);
    if (currentIndex + 1 <= 5) audioDirector.current.stopMusic();
    await audioDirector.current.playOutcome(currentIndex + 1, false);
  }

  function skipCorrectReveal() {
    if (!correctRevealSkippable) return;
    setCorrectRevealSkippable(false);
    audioDirector.current.stopEffect();
  }

  function goToQuestion(index) {
    resetQuestionState();
    setCurrentIndex(index);
    setHighestReached(index + 1);
    setScreen("game");
    setAnnouncement(`Question ${index + 1} for ${CORE.formatPrize(CORE.PRIZE_LADDER[index])}.`);
    audioDirector.current.playQuestion(index + 1);
  }

  function saveCompletedGame(finalOutcome, completedAt) {
    if (gameSaved.current) return;
    const recent = safeRead(HISTORY_KEY, []);
    const next = [...(Array.isArray(recent) ? recent : []), questions.map((item) => item.id)].slice(-5);
    safeWrite(HISTORY_KEY, next);
    const allPerformance = safeRead(PERFORMANCE_KEY, {});
    const previous = levelPerformance(settings.level);
    const completedDuration = Math.max(0, completedAt - (startedAt || completedAt));
    const completedHighestQuestion = Math.max(1, Math.min(15, highestReached || currentIndex + 1));
    const lastCorrectRecord = [...records].reverse().find((record) => record.correct);
    const completedAmount = lastCorrectRecord ? CORE.PRIZE_LADDER[lastCorrectRecord.questionNumber - 1] || 0 : 0;
    const nextBestWinMs = finalOutcome === "won" && (previous.bestWinMs == null || completedDuration < previous.bestWinMs) ? completedDuration : previous.bestWinMs;
    const previousQuestionBestMs = previous.bestTimesByQuestion[completedHighestQuestion];
    const nextQuestionBestMs = previousQuestionBestMs == null || completedDuration < previousQuestionBestMs ? completedDuration : previousQuestionBestMs;
    safeWrite(PERFORMANCE_KEY, {
      ...(allPerformance && typeof allPerformance === "object" ? allPerformance : {}),
      [settings.level]: {
        bestWinMs: nextBestWinMs,
        highestQuestion: Math.max(previous.highestQuestion, completedHighestQuestion),
        bestAmount: Math.max(previous.bestAmount, completedAmount),
        bestTimesByQuestion: { ...previous.bestTimesByQuestion, [completedHighestQuestion]: nextQuestionBestMs },
      },
    });
    gameSaved.current = true;
  }

  function finishGame(finalOutcome = outcome, prize = finalPrize) {
    const preserveMillionWinAudio = finalOutcome === "won" && prize === 1000000;
    audioDirector.current.stopExcerpt();
    audioDirector.current.stopMusic();
    if (!preserveMillionWinAudio) audioDirector.current.stopEffect();
    const now = Date.now();
    setOutcome(finalOutcome);
    setFinalPrize(prize);
    setFinishedAt(now);
    setScreen("results");
    setDialog(null);
    saveCompletedGame(finalOutcome, now);
    setAnnouncement(`Game complete. Final prize ${CORE.formatPrize(prize)}.`);
  }

  function useFiftyFifty() {
    if (!lifelines.fifty || locked || transitioning || !question) return;
    const removed = CORE.fiftyFifty(question);
    setRemovedLetters(removed);
    if (removed.includes(selectedLetter)) setSelectedLetter(null);
    setLifelines((current) => ({ ...current, fifty: false }));
    setAnnouncement(`50:50 used. Answers ${removed.join(" and ")} removed.`);
    audioDirector.current.playLifeline();
  }

  function useHint() {
    if (!lifelines.hint || locked || transitioning || !question) return;
    setLifelines((current) => ({ ...current, hint: false }));
    setHintVisible(true);
    setAnnouncement(`Hint: ${question.tip}`);
    audioDirector.current.playLifeline();
  }

  function useSwitch() {
    if (!lifelines.switch || locked || transitioning || !question) return;
    const enabledQuestionBank = QUESTION_BANK.filter((item) => settings.questionTypes.includes(item.category));
    const otherFingerprints = new Set(questions.filter((_, index) => index !== currentIndex).map(CORE.questionFingerprint));
    let randomisedReplacement = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const replacement = CORE.switchQuestion(enabledQuestionBank, questions, currentIndex + 1, question.level, Math.random);
      if (!replacement) break;
      const candidate = randomiseTwoBarQuestion(replacement);
      if (!otherFingerprints.has(CORE.questionFingerprint(candidate))) { randomisedReplacement = candidate; break; }
    }
    if (!randomisedReplacement) {
      setDialog({ type: "error", message: "A replacement question of the same difficulty is not available." });
      return;
    }
    resetQuestionState();
    setQuestions((current) => current.map((item, index) => index === currentIndex ? randomisedReplacement : item));
    setLifelines((current) => ({ ...current, switch: false }));
    setAnnouncement(`Switch used. A replacement question has been selected for question ${currentIndex + 1}.`);
    audioDirector.current.playLifeline();
  }

  function playQuestionExcerpt(targetQuestion, onEnded) {
    if (targetQuestion?.audio?.generator) return audioDirector.current.playGenerated(targetQuestion.audio.generator, onEnded);
    return audioDirector.current.playFileExcerpt(targetQuestion?.audioSrc || targetQuestion?.audio?.src, onEnded);
  }

  function playQuestionAudio(learning = false) {
    if (!hasQuestionAudio(question)) {
      setAnnouncement("The listening excerpt is unavailable.");
      return;
    }
    if (audioPlaying || (!learning && playsUsed >= 3)) return;
    const duration = playQuestionExcerpt(question, () => {
      setAudioPlaying(false);
    });
    if (!duration) {
      setAnnouncement("The listening excerpt is unavailable. No play has been counted.");
      return;
    }
    if (!learning) setPlaysUsed((count) => count + 1);
    setAudioPlaying(true);
  }

  function stopQuestionAudio() {
    audioDirector.current.stopExcerpt();
    setAudioPlaying(false);
    setAnnouncement("Listening excerpt stopped.");
  }

  const elapsedMs = Math.max(0, (finishedAt || Date.now()) - (startedAt || Date.now()));
  const usedLifelines = LIFELINE_RESULTS.filter(({ key }) => !lifelines[key]);

  function renderQuestionMedia(recordQuestion = question, learning = false) {
    const noteValueNameQuestion = isNoteValueNameQuestion(recordQuestion);
    const whatNoteQuestion = isWhatNoteQuestion(recordQuestion);
    const beatTotalQuestion = isBeatTotalQuestion(recordQuestion);
    const singleNoteBeatsQuestion = isSingleNoteBeatsQuestion(recordQuestion);
    const timeSignatureQuestion = isTopNumberTimeSignatureQuestion(recordQuestion);
    const dottedMinimNameQuestion = isDottedMinimNameQuestion(recordQuestion);
    const dottedMinimBeatsQuestion = isDottedMinimBeatsQuestion(recordQuestion);
    const dynamicSymbolQuestion = isDynamicSymbolQuestion(recordQuestion);
    const symbolMeaningQuestion = isSymbolMeaningQuestion(recordQuestion);
    const timeSignatureBarCompletionQuestion = isTimeSignatureBarCompletionQuestion(recordQuestion);
    const selectedBarAnswer = recordQuestion === question && selectedLetter ? recordQuestion.answers?.find((answer) => answer.letter === selectedLetter) : null;
    const selectedBarRhythm = selectedBarAnswer ? (recordQuestion.notation?.kind === "restBar" ? REST_ANSWER_VALUES[selectedBarAnswer.text] : RHYTHM_ANSWER_VALUES[selectedBarAnswer.text]) || null : null;
    const selectedBassNote = recordQuestion.notation?.kind === "ahBassPrompt" ? selectedBarAnswer?.text || null : null;
    const notationClassName = [noteValueNameQuestion ? "is-name-note-question is-note-name-question" : "", whatNoteQuestion ? "is-what-note-question" : "", recordQuestion.notation?.kind === "melody" ? "is-name-note-question" : "", singleNoteBeatsQuestion ? "is-note-name-question" : "", beatTotalQuestion ? "is-beat-total-question" : "", timeSignatureQuestion ? "is-time-signature-question" : "", dottedMinimNameQuestion ? "is-dotted-minim-name-question" : "", dottedMinimBeatsQuestion ? "is-dotted-minim-beats-question" : "", dynamicSymbolQuestion ? "is-dynamic-symbol-question" : "", symbolMeaningQuestion ? "is-symbol-meaning-question" : "", timeSignatureBarCompletionQuestion ? "is-time-signature-bar-completion" : ""].filter(Boolean).join(" ");
    return <>
      {(recordQuestion.type === "notation" || recordQuestion.type === "text-notation") && <NotationView notation={recordQuestion.notation} className={notationClassName} whatNoteQuestion={whatNoteQuestion} selectedRhythm={selectedBarRhythm} selectedBassNote={selectedBassNote} />}
      {recordQuestion.type === "image" && <QuestionImage image={recordQuestion.image} />}
      {hasQuestionAudio(recordQuestion) && <AudioCard playsUsed={recordQuestion === question ? playsUsed : 0} playing={recordQuestion === question ? audioPlaying : false} onPlay={() => {
        if (recordQuestion === question) playQuestionAudio(learning);
        else {
          const duration = playQuestionExcerpt(recordQuestion, () => {});
          if (!duration) setAnnouncement("The listening excerpt is unavailable.");
        }
      }} onStop={stopQuestionAudio} learning={learning} />}
    </>;
  }

  function TitleScreen() {
    const openingLightRayLengths = [64, 71.5, 66, 73, 68.5, 70, 63, 69, 72, 65.5, 70.5, 62, 67.5, 74, 64.5, 71, 67, 73.5, 63.5, 69.5, 62.5, 72.5, 68, 65];
    return <section className={`millionaire-screen millionaire-opening-screen ${openingZooming ? "is-opening-zoom" : ""}`} aria-busy={openingZooming} aria-hidden={openingZooming || undefined}>
      <span className="millionaire-opening-logo-stage">
        <span className="millionaire-opening-logo-shine"><img className="millionaire-opening-logo" src="millionairelogo new.svg" alt="Who Wants to Be a Millionaire" /></span>
        <span className="millionaire-opening-logo-backlight" aria-hidden="true">
          <span className="millionaire-opening-logo-rays">
            {openingLightRayLengths.map((length, index) => <span className="millionaire-opening-logo-ray" key={length} style={{ "--ray-angle": `${index * 15}deg`, "--ray-length": `${length}%`, "--ray-width": `${8 + index % 5 * 1.8}px`, "--ray-opacity": .54 + index % 4 * .07 }} />)}
          </span>
        </span>
      </span>
      <p className="millionaire-screen-copy millionaire-opening-copy">Test your musical knowledge and climb the prize ladder to £1 million.</p>
      <div className="millionaire-opening-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-opening-play" disabled={openingZooming} onClick={() => setScreen("rules")}><span className="millionaire-opening-play-label">How to Play</span></button>
        <button type="button" className="millionaire-primary millionaire-play millionaire-opening-play" disabled={openingZooming} onClick={startGame}><span className="millionaire-opening-play-label">Start</span></button>
      </div>
    </section>;
  }

  function RulesScreen() {
    return <section className="millionaire-screen millionaire-rules-screen"><div className="millionaire-setup-card millionaire-rules-card">
      <h2>How to Play</h2>
      <div className="millionaire-rules-grid">
        <section className="millionaire-rules-section" aria-labelledby="millionaire-rules-gameplay">
          <h3 id="millionaire-rules-gameplay">Playing the game</h3>
          <div className="millionaire-game-rules-copy">
            <p>Answer 15 music questions which progressively get more challenging.</p>
            <p>Each question is multiple choice with four possible answers.</p>
            <p>Earn awards for correctly answering the following questions:</p>
          </div>
          <ul className="millionaire-rewards-list">
            {[15, 10, 5, 3].map((stage) => <li key={stage}><img className="millionaire-reward-icon" src={QUESTION_REWARDS[stage].icon} alt={QUESTION_REWARDS[stage].label} /><span className={`millionaire-reward-label is-${QUESTION_REWARDS[stage].tier}`}>Question {stage}</span></li>)}
          </ul>
        </section>
        <section className="millionaire-rules-section millionaire-lifeline-rules-section" aria-labelledby="millionaire-rules-lifelines">
          <h3 id="millionaire-rules-lifelines">Lifelines</h3>
          <div className="millionaire-game-rules-copy millionaire-lifeline-intro"><p>If you get stuck on a question, you can use a lifeline:</p></div>
          <ul className="millionaire-lifeline-rules">
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="50.50.svg" alt="" /></span><strong>50:50</strong><span>Removes two incorrect answers</span></li>
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="hint.svg" alt="" /></span><strong>Hint</strong><span>Guides you towards the correct answer with a hint</span></li>
            <li><span className="millionaire-lifeline-badge millionaire-lifeline-rule-badge"><img className="millionaire-lifeline-rule-icon" src="switch.svg" alt="" /></span><strong>Switch</strong><span>Switch your current question to a different question</span></li>
          </ul>
          <p className="millionaire-rules-note">Each lifeline can only be used once per game.</p>
        </section>
      </div>
      <div className="millionaire-rules-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-back-button" onClick={() => setScreen("title")}><span className="millionaire-back-button-label">Back</span></button>
      </div>
    </div></section>;
  }

  function GameScreen() {
    if (!question) return null;
    const earnedReward = revealed === "correct" && currentIndex < 14 ? QUESTION_REWARDS[currentIndex + 1] : null;
    const milestoneIsShowing = Boolean(earnedReward && milestone?.stage === currentIndex + 1);
    const autoAdvancingMilestone = Boolean(milestoneIsShowing && milestone?.autoAdvance);
    const earnedPrize = CORE.PRIZE_LADDER[currentIndex] === 1000000 ? "£1 MILLION" : CORE.formatPrize(CORE.PRIZE_LADDER[currentIndex]);
    const showWonAmount = revealed === "correct";
    const ranOutOfTime = revealed === "incorrect" && settings.timer && !selectedLetter;
    return <div className="millionaire-game-grid">
      <section className="millionaire-play-area">
        {settings.timer && !revealed && !earnedReward && <QuestionTimer seconds={timeRemaining} />}
        <div className="millionaire-question-panel">
          {hintVisible && <div className="millionaire-inline-hint" role="note"><strong>Hint</strong><span><HintText question={question} /></span></div>}
          <div className="millionaire-question-media">{earnedReward ? <MilestoneCelebration reward={earnedReward} /> : renderQuestionMedia(question, outcome === "incorrect")}</div>
          <div className="millionaire-question-rail"><div className="millionaire-question-bar"><h2 className={showWonAmount ? "is-milestone-amount" : undefined}>{showWonAmount ? <span className="millionaire-milestone-amount" aria-label={earnedPrize}><span aria-hidden="true">◆</span><span>{earnedPrize}</span><span aria-hidden="true">◆</span></span> : question.question}</h2></div></div>
        </div>
        <div className="millionaire-answers" role="group" aria-label="Answer choices">
          {[question.answers.slice(0, 2), question.answers.slice(2, 4)].map((answerRow, rowIndex) => <div className="millionaire-answer-row" role="presentation" key={rowIndex}>{answerRow.map((answer) => {
            const removed = removedLetters.includes(answer.letter);
            const isCorrect = revealed && answer.letter === question.correctLetter;
            const isIncorrect = revealed === "incorrect" && answer.letter === selectedLetter;
            const classes = ["millionaire-answer"];
            if (selectedLetter === answer.letter && !revealed) classes.push(locked ? "is-locked" : "is-selected");
            if (isCorrect) classes.push("is-correct", revealed === "correct" ? "is-correct-selection" : "is-correct-reveal");
            if (isIncorrect) classes.push("is-incorrect");
            if (removed) classes.push("is-removed");
            const answerDisabled = locked || transitioning || removed;
            const status = isCorrect ? "Correct answer" : isIncorrect ? "Incorrect answer" : "";
            return <button key={answer.letter} type="button" className={classes.join(" ")} disabled={answerDisabled} tabIndex={removed ? -1 : undefined} aria-hidden={removed || undefined} aria-label={`${answer.letter}: ${answer.text}`} aria-pressed={selectedLetter === answer.letter} onClick={() => selectAnswer(answer.letter)}>
              <AutoFitAnswer answer={answer} question={question} /><span className="millionaire-answer-status">{status}</span>
            </button>;
          })}</div>)}
        </div>
        {revealed === "incorrect" ? <>
          <div className="millionaire-explanation"><strong>{ranOutOfTime ? "You ran out of time" : "Incorrect answer"}</strong>{question.explanation}</div>
          <div className="millionaire-actions"><button type="button" className="millionaire-primary millionaire-final-answer" onClick={() => finishGame("incorrect", finalPrize)}><span className="millionaire-final-answer-label">Review</span></button></div>
        </> : <div className="millionaire-actions millionaire-final-answer-actions">
          <button type="button" className="millionaire-primary millionaire-final-answer" disabled={autoAdvancingMilestone || !selectedLetter || locked || transitioning} onClick={lockAnswer}><span className="millionaire-final-answer-label">Final Answer</span></button>
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
      <FinalConfetti />
      <div className="millionaire-celebration-centre">
        <MilestoneCelebration reward={QUESTION_REWARDS[15]} showBurst={false} />
        <h2>£1 MILLION</h2>
        <p className="millionaire-celebration-message">Congratulations!</p>
      </div>
      <button type="button" className="millionaire-primary millionaire-final-answer" onClick={() => finishGame("won", 1000000)}><span className="millionaire-final-answer-label">Review</span></button>
    </section>;
  }

  function ResultsScreen() {
    const lastCorrectRecord = [...records].reverse().find((record) => record.correct);
    const reviewQuestionNumber = lastCorrectRecord?.questionNumber || 0;
    const reachedQuestionNumber = Math.max(1, Math.min(15, highestReached || currentIndex + 1));
    const reviewPrizeValue = reviewQuestionNumber ? CORE.PRIZE_LADDER[reviewQuestionNumber - 1] || 0 : 0;
    const reviewPrize = reviewPrizeValue === 1000000 ? "£1 Million" : CORE.formatPrize(reviewPrizeValue);
    const previousPrizeValue = previousPerformance.bestAmount || 0;
    const previousPrize = previousPrizeValue === 1000000 ? "£1 Million" : CORE.formatPrize(previousPrizeValue);
    const previousQuestionBestMs = previousPerformance.bestTimesByQuestion[reachedQuestionNumber];
    const earnedMedalStage = [15, 10, 5, 3].find((stage) => stage <= correctCount);
    const earnedMedal = earnedMedalStage ? QUESTION_REWARDS[earnedMedalStage] : null;
    return <section className="millionaire-screen millionaire-results">
      {outcome === "won" && <FinalConfetti />}
      <h2>Review</h2>
      <div className="millionaire-results-grid">
        <ResultStat label="Question" previous={`Previous best: ${previousPerformance.highestQuestion ? `${previousPerformance.highestQuestion} / 15` : "—"}`}>{reachedQuestionNumber} / 15</ResultStat>
        <ResultStat label="Amount" valueClassName="millionaire-result-amount" previous={<React.Fragment>Previous best: <span className="millionaire-result-previous-amount">{previousPerformance.highestQuestion ? previousPrize : "—"}</span></React.Fragment>}>{lastCorrectRecord ? reviewPrize : "—"}</ResultStat>
        <ResultStat label="Award"><span className="millionaire-result-medal">{earnedMedal ? <img src={earnedMedal.icon} alt={earnedMedal.label} /> : "—"}</span></ResultStat>
        <ResultStat label="Time" previous={`Previous best for ${reachedQuestionNumber}/15: ${previousQuestionBestMs == null ? "—" : formatTime(previousQuestionBestMs)}`}>{formatTime(elapsedMs)}</ResultStat>
        <ResultStat label="Lifelines used"><span className="millionaire-result-lifelines">{usedLifelines.length ? usedLifelines.map(({ key, icon, label }) => <img key={key} src={icon} alt={label} />) : "—"}</span></ResultStat>
      </div>
      <div className="millionaire-result-actions"><button type="button" className="millionaire-primary millionaire-final-answer" onClick={resetGame}><span className="millionaire-final-answer-label">Exit</span></button></div>
    </section>;
  }

  function ReviewScreen() {
    return <section className="millionaire-screen millionaire-review">
      <div className="millionaire-review-header"><h2>Answer review</h2><button type="button" className="millionaire-secondary" onClick={() => setScreen("results")}>Back to results</button></div>
      <div className="millionaire-review-list">{records.map((record) => <article className="millionaire-review-card" key={record.question.id}>
        <div className="millionaire-review-meta">Question {record.questionNumber} • {CATEGORY_LABELS[record.category]} • {record.concept.replaceAll("-", " ")}</div>
        <h3>{record.question.question}</h3>
        {(record.question.notation || record.question.image) && <div>{record.question.notation ? <NotationView notation={record.question.notation} whatNoteQuestion={isWhatNoteQuestion(record.question)} className={[isNoteValueNameQuestion(record.question) ? "is-name-note-question is-note-name-question" : "", isWhatNoteQuestion(record.question) ? "is-what-note-question" : "", record.question.notation.kind === "melody" ? "is-name-note-question" : "", isSingleNoteBeatsQuestion(record.question) ? "is-note-name-question" : "", isBeatTotalQuestion(record.question) ? "is-beat-total-question" : "", isTopNumberTimeSignatureQuestion(record.question) ? "is-time-signature-question" : "", isDottedMinimNameQuestion(record.question) ? "is-dotted-minim-name-question" : "", isDottedMinimBeatsQuestion(record.question) ? "is-dotted-minim-beats-question" : "", isDynamicSymbolQuestion(record.question) ? "is-dynamic-symbol-question" : "", isSymbolMeaningQuestion(record.question) ? "is-symbol-meaning-question" : "", isTimeSignatureBarCompletionQuestion(record.question) ? "is-time-signature-bar-completion" : ""].filter(Boolean).join(" ")} /> : <QuestionImage image={record.question.image} />}</div>}
        <ul className="millionaire-review-options">{record.question.answers.map((answer) => <li key={answer.letter} className={`millionaire-review-option ${answer.letter === record.pupilLetter ? "is-pupil" : ""} ${answer.letter === record.correctLetter ? "is-right" : ""}`}>{answer.letter}: {answer.text}{answer.letter === record.pupilLetter ? " — your answer" : ""}{answer.letter === record.correctLetter ? " — correct" : ""}</li>)}</ul>
        <p className="millionaire-review-explanation"><strong>{record.correct ? "Correct." : "Incorrect."}</strong> {record.question.explanation}</p>
        {hasQuestionAudio(record.question) && <div className="millionaire-review-audio"><button type="button" className="millionaire-secondary" onClick={() => playQuestionExcerpt(record.question, () => {})}>Replay excerpt</button></div>}
      </article>)}</div>
    </section>;
  }

  function CurrentScreen() {
    if (screen === "title") return TitleScreen();
    if (screen === "rules") return RulesScreen();
    if (screen === "game") return GameScreen();
    if (screen === "milestone") return MilestoneScreen();
    if (screen === "results") return ResultsScreen();
    return ReviewScreen();
  }

  const customiseUnavailable = openingZooming || screen === "game" || screen === "milestone";
  const activeLevelLabel = MILLIONAIRE_LEVELS[settings.level]?.label || "National 3";

  return <div className={window.MLH.shell.pageShellClass} style={{ overflowX: "clip" }}>
    <window.MLH.AppHeader icon="millionaire-icon.svg" title="Who Wants to Be a Millionaire?" subtitle="Test your musical knowledge and climb the prize ladder to £1 million." profileLabel={activeLevelLabel} profileUsesSharedSettings={false} />
    <div className="millionaire-page-content"><main className="millionaire-main-shell">
      <div className="millionaire-toolbar-wrap"><window.MLH.AppToolbar left={<div className="flex items-center gap-2">
        <fieldset disabled={customiseUnavailable} className="millionaire-customise-fieldset m-0 min-w-0 border-0 p-0">
          <div className="hub-menu-anchor relative" ref={levelRef}>
            <window.MLH.LevelButton icon={<img src="levels.svg" alt="" className="h-[26px] w-[26px]" />} activeLevel={settings.level} activeLabel={activeLevelLabel} onClick={() => { setCustomiseOpen(false); setLevelOpen((open) => !open); }} dataMenuTrigger={true} />
            {levelOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Level" position="left-0" dataMenuPanel={true}><window.MLH.LevelMenu activeLevel={settings.level} onSelect={(level) => { const availableTypes = CORE.CATEGORIES.filter((category) => CORE.DIFFICULTIES.every((difficulty) => (QUESTION_POOLS[level]?.[difficulty]?.[category]?.length || 0) >= 5)); setSettings((current) => ({ ...current, level, questionTypes: availableTypes })); setLevelOpen(false); }} levels={MILLIONAIRE_LEVELS} /></window.MLH.MenuPanel>}
          </div>
        </fieldset>
        <fieldset disabled={customiseUnavailable} className="millionaire-customise-fieldset m-0 min-w-0 border-0 p-0">
          <div className="hub-menu-anchor relative" ref={customiseRef}>
            <window.MLH.CustomiseButton icon={<img src="customise.svg" alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />} onClick={() => { setLevelOpen(false); setCustomiseOpen((open) => !open); }} dataMenuTrigger={true} />
            {customiseOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Customise" position="-left-[66px] sm:left-0" variant="customise" dataMenuPanel={true}>
              <window.MLH.MenuSubheading>Question Types</window.MLH.MenuSubheading>
              {QUESTION_TYPE_OPTIONS.map((option) => { const available = CORE.DIFFICULTIES.every((difficulty) => (QUESTION_POOLS[settings.level]?.[difficulty]?.[option.id]?.length || 0) >= 5); return <window.MLH.MenuToggleRow key={option.id} glyph={<QuestionTypeGlyph option={option} />} label={option.label} checked={settings.questionTypes.includes(option.id)} disabled={!available || (settings.questionTypes.includes(option.id) && settings.questionTypes.length === 1)} onChange={() => toggleQuestionType(option.id)} />; })}
              <p className="mx-3 my-2 text-xs leading-snug text-stone-500">Only completed question types can be selected.</p>
              <window.MLH.MenuSubheading>Options</window.MLH.MenuSubheading>
              <window.MLH.MenuToggleRow glyph={<img src="timer.svg" alt="" aria-hidden="true" className="h-7 w-7 object-contain" />} label="Timer" checked={settings.timer} onChange={() => setSettings((current) => ({ ...current, timer: !current.timer }))} />
            </window.MLH.MenuPanel>}
          </div>
        </fieldset>
      </div>} feedback={null} right={<button type="button" className="millionaire-toolbar-reset flex h-10 w-[58px] items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 sm:h-11 sm:w-auto sm:px-2.5" aria-label="Reset game and return to opening screen" disabled={screen !== "game"} onClick={resetGame}><img src="restart.svg" alt="" className="h-[20px] w-[20px]" /><span className="hidden sm:relative sm:-left-[1.5px] sm:inline">Reset</span></button>} /></div>
      <div className="millionaire-scroll"><div className="millionaire-stage"><div className="millionaire-board">
        <button type="button" className="millionaire-audio-toggle" aria-label={settings.backgroundMusic && settings.soundEffects ? "Turn off game audio" : "Turn on game audio"} aria-pressed={settings.backgroundMusic && settings.soundEffects} onClick={toggleGameAudio}>
          <img src="audio-svgrepo-com.svg" alt="" aria-hidden="true" />
        </button>
        {CurrentScreen()}
        {openingZooming && TitleScreen()}
        {openingZooming && <span className="millionaire-opening-flash" aria-hidden="true" />}
      </div></div></div>
    </main></div>
    <div className="millionaire-legal-attribution">Unofficial educational classroom resource. Not affiliated with or endorsed by the owners of <em>Who Wants to Be a Millionaire?</em></div>
    <div className="millionaire-live-region" aria-live="polite" aria-atomic="true">{announcement}</div>
    {correctRevealSkippable && <button type="button" className="millionaire-skip-correct-overlay" aria-label="Skip correct answer animation" onClick={skipCorrectReveal} />}

    {helpOpen && <Dialog title="Help and keyboard shortcuts" onClose={() => setHelpOpen(false)} actions={<button type="button" className="millionaire-primary" onClick={() => setHelpOpen(false)}>Close</button>}><dl className="millionaire-shortcuts"><dt>A–D or 1–4</dt><dd>Select an answer</dd><dt>Enter</dt><dd>Final Answer</dd><dt>Space</dt><dd>Play a listening excerpt</dd><dt>L</dt><dd>Focus the lifelines</dd><dt>Escape</dt><dd>Close an open pop-up</dd></dl><p>Choose an answer first, then press Final Answer. Each lifeline can be used once.</p></Dialog>}
    {dialog?.type === "error" && <Dialog title="Game unavailable" onClose={() => setDialog(null)} actions={<button type="button" className="millionaire-primary" onClick={() => setDialog(null)}>Close</button>}><p>{dialog.message}</p></Dialog>}
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
window.dispatchEvent(new Event("millionaire-ready"));
