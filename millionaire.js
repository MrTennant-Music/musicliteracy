const { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } = React;
const CORE = window.MILLIONAIRE_CORE;
const QUESTION_BANK = window.MILLIONAIRE_QUESTION_BANK || [];
const QUESTION_POOLS = window.MILLIONAIRE_QUESTION_POOLS || {};

const MILLIONAIRE_SOUND_PATH = "./soundsmillionaire/";
window.MILLIONAIRE_SOUND_CONFIG = {
  opening: `${MILLIONAIRE_SOUND_PATH}opening menu.ogg`,
  start: `${MILLIONAIRE_SOUND_PATH}start.ogg`,
  lifeline: `${MILLIONAIRE_SOUND_PATH}lifeline.ogg`,
  earlyQuestion: `${MILLIONAIRE_SOUND_PATH}11 $100-$1,000 Questions.ogg`,
  earlyFinalAnswer: `${MILLIONAIRE_SOUND_PATH}final answer 1-5.ogg`,
  earlyCorrect: `${MILLIONAIRE_SOUND_PATH}correct 1-5.ogg`,
  earlyIncorrect: `${MILLIONAIRE_SOUND_PATH}incorrect 1-5.ogg`,
  thousandWin: `${MILLIONAIRE_SOUND_PATH}12 Win $1,000.ogg`,
  stages: {
    6: ["13 Let's Play $2,000.ogg", "14 $2,000 Question.ogg", "15 $2,000 Final Answer-.ogg", "16 $2,000 Lose.ogg", "17 $2,000 Win.ogg"],
    7: ["18 Let's Play $4,000.ogg", "19 $4,000 Question.ogg", "20 $4,000 Final Answer-.ogg", "21 $4,000 Lose.ogg", "22 $4,000 Win.ogg"],
    8: ["23 Let's Play $8,000.ogg", "24 $8,000 Question.ogg", "25 $8,000 Final Answer-.ogg", "26 $8,000 Lose.ogg", "27 $8,000 Win.ogg"],
    9: ["28 Let's Play $16,000.ogg", "29 $16,000 Question.ogg", "30 $16,000 Final Answer-.ogg", "31 $16,000 Lose.ogg", "32 $16,000 Win.ogg"],
    10: ["33 Let's Play $32,000.ogg", "34 $32,000 Question.ogg", "35 $32,000 Final Answer-.ogg", "36 $32,000 Lose.ogg", "37 $32,000 Win.ogg"],
    11: ["38 Let's Play $64,000.ogg", "39 $64,000 Question.ogg", "40 $64,000 Final Answer-.ogg", "41 $64,000 Lose.ogg", "42 $64,000 Win.ogg"],
    12: ["43 Let's Play $125,000.ogg", "44 $125,000 Question.ogg", "45 $125,000 Final Answer-.ogg", "46 $125,000 Lose.ogg", "47 $125,000 Win.ogg"],
    13: ["48 Let's Play $250,000.ogg", "49 $250,000 Question.ogg", "50 $250,000 Final Answer-.ogg", "51 $250,000 Lose.ogg", "52 $250,000 Win.ogg"],
    14: ["53 Let's Play $500,000.ogg", "54 $500,000 Question.ogg", "55 $500,000 Final Answer-.ogg", "56 $500,000 Lose.ogg", "57 $500,000 Win.ogg"],
    15: ["58 Let's Play $1,000,000.ogg", "59 $1,000,000 Question.ogg", "60 $1,000,000 Final Answer-.ogg", "61 $1,000,000 Lose.ogg", "62 $1,000,000 Win.ogg"],
  },
};

Object.values(window.MILLIONAIRE_SOUND_CONFIG.stages).forEach((files) => {
  files.forEach((file, index) => { files[index] = `${MILLIONAIRE_SOUND_PATH}${file}`; });
});

const SETTINGS_KEY = "mlh-millionaire-settings-v3";
const HISTORY_KEY = "mlh-millionaire-recent-games-v1";
const DEFAULT_SETTINGS = {
  soundEffects: true,
  backgroundMusic: true,
  reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false,
  timer: false,
  questionTypes: ["literacy", "listening", "concepts"],
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
  { id: "listening", label: "Audio", icon: "audio-svgrepo-com.svg", iconSize: "h-[42px] w-[42px]" },
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
  const timeSignature = question?.notation?.kind === "bar" && /^([2-5])\/4$/.test(answer.text) ? answer.text : null;

  useLayoutEffect(() => {
    const content = contentRef.current;
    const text = textRef.current;
    if (!content || !text || rhythm || timeSignature) return undefined;

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
  }, [answer.letter, answer.text, rhythm, timeSignature]);

  return <span ref={contentRef} className="millionaire-answer-content"><span className="millionaire-answer-diamond" aria-hidden="true">◆</span><span className="millionaire-answer-letter">{answer.letter}:</span>{rhythm ? <AnswerRhythmGlyph rhythm={rhythm} label={answer.text} /> : timeSignature ? <AnswerTimeSignatureGlyph timeSignature={timeSignature} label={answer.text} /> : <span ref={textRef} className="millionaire-answer-text">{answer.text}</span>}</span>;
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
  dottedHalfNote: `${bravuraSymbol("halfNoteStemUp", "\uE1D3")}${bravuraSymbol("augmentationDot", "\uE1E7")}`,
  dynamicForte: bravuraSymbol("forte", "\uE522"),
  dynamicPiano: bravuraSymbol("piano", "\uE520"),
  crescendo: bravuraSymbol("crescendo", "\uE53E"),
  diminuendo: bravuraSymbol("diminuendo", "\uE53F"),
  barlineFinal: bravuraSymbol("barlineFinal", "\uE032"),
  repeatRight: bravuraSymbol("repeatRight", "\uE041"),
};
const TIME_DIGITS = ["\uE080", bravuraSymbol("timeSig1", "\uE081"), bravuraSymbol("timeSig2", "\uE082"), bravuraSymbol("timeSig3", "\uE083"), bravuraSymbol("timeSig4", "\uE084"), bravuraSymbol("timeSig5", "\uE085"), bravuraSymbol("timeSig6", "\uE086"), "\uE087", bravuraSymbol("timeSig8", "\uE088"), bravuraSymbol("timeSig9", "\uE089")];
const PITCH_INDEX = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7, D5: 8, E5: 9, F5: 10, G5: 11, A5: 12 };
const NOTATION_FALLBACKS = { gClef: "\uE050", noteheadBlack: "\uE0A4", quarterNoteStemUp: "\uE1D5", quarterNoteStemDown: "\uE1D6", eighthNoteStemUp: "\uE1D7", sixteenthNoteStemUp: "\uE1D9", halfNoteStemUp: "\uE1D3", wholeNote: "\uE1D2", augmentationDot: "\uE1E7", augmentationDotLine: "\uE1E7" };
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
  semibreve: { spacing: 8, stem: false, dots: 0 },
  "dotted-minim": { spacing: 6, stem: true, dots: 1 },
  minim: { spacing: 4, stem: true, dots: 0 },
  crotchet: { spacing: 2.2, stem: true, dots: 0 },
  quaver: { spacing: 1.15, stem: true, dots: 0, beams: 1 },
  semiquaver: { spacing: .72, stem: true, dots: 0, beams: 2 },
};

const TIMESIG_GLYPH_RHYTHMS = {
  quarterNote: ["crotchet"],
  eighthNote: ["quaver"],
  sixteenthNote: ["semiquaver"],
  halfNote: ["minim"],
  dottedHalfNote: ["dotted-minim"],
  wholeNote: ["semibreve"],
  pairedEighthNotes: ["quaver", "quaver"],
  fourSixteenthNotes: ["semiquaver", "semiquaver", "semiquaver", "semiquaver"],
  quaverTwoSemiquavers: ["quaver", "semiquaver", "semiquaver"],
  twoSemiquaversQuaver: ["semiquaver", "semiquaver", "quaver"],
  semiquaverQuaverSemiquaver: ["semiquaver", "quaver", "semiquaver"],
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
  if (rhythm === "quaver") return stemDown ? "eighthNoteStemDown" : "eighthNoteStemUp";
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

function timeSigBarNotePositions(notes) {
  const totalUnits = notes.reduce((total, note) => total + timeSigRhythmInfo(note.rhythm).spacing, 0);
  const unitWidth = Math.max(1, TIMESIG_PREVIEW.firstBarEnd - 6 - (TIMESIG_PREVIEW.firstBarStart + 7)) / Math.max(1, totalUnits);
  let cursor = TIMESIG_PREVIEW.firstBarStart + 7 + unitWidth * .35;
  return notes.map((note) => {
    const x = cursor;
    cursor += timeSigRhythmInfo(note.rhythm).spacing * unitWidth;
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
    const groupId = notes[index].beamGroupId;
    if (!groupId) { index += 1; continue; }
    const start = index;
    while (index < notes.length && notes[index].beamGroupId === groupId) index += 1;
    if (index - start > 1) groups.push({ start, end: index - 1 });
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
      const y2 = segment.isHook ? y1 : timeSigBeamLineYAtX(x2, beamData.start, beamData.end) + 7;
      return <line key={index} x1={x1 - .5} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="4" strokeLinecap="butt" />;
    })}
  </g>;
}

function timeSigPreviewNotes(glyphs) {
  const notes = [];
  let pitchIndex = 0;
  (glyphs || []).forEach((glyph, glyphIndex) => {
    const rhythms = TIMESIG_GLYPH_RHYTHMS[glyph] || ["crotchet"];
    const beamGroupId = rhythms.length > 1 && rhythms.every((rhythm) => ["quaver", "semiquaver"].includes(rhythm)) ? `beam-${glyphIndex}` : null;
    rhythms.forEach((rhythm) => {
      const step = [2, 3, 4, 3, 2, 1, 2, 0][pitchIndex % 8];
      notes.push({ rhythm, pitch: { step }, beamGroupId });
      pitchIndex += 1;
    });
  });
  return notes;
}

function TimeSigFirstBarNotation({ notation }) {
  const notes = timeSigPreviewNotes(notation.glyphs);
  const positions = timeSigBarNotePositions(notes);
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
    const beamGroupId = rhythms.length > 1 && rhythms.every((rhythm) => ["quaver", "semiquaver"].includes(rhythm)) ? `rests-beam-${glyphIndex}` : null;
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

function restsBarNotePositions(items) {
  const startX = RESTS_PREVIEW.barStart + 7;
  const endX = RESTS_PREVIEW.barEnd - 6;
  const totalSpacing = items.reduce((sum, item) => sum + restsItemSpacing(item), 0);
  const unitWidth = Math.max(1, endX - startX) / Math.max(1, totalSpacing);
  let cursor = startX + unitWidth * .35;
  return items.map((item) => {
    const x = cursor;
    cursor += restsItemSpacing(item) * unitWidth;
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
  return <g className="millionaire-music-symbol" transform={`translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale || 1} ${settings.heightScale || 1}) translate(${-adjustedX} ${-adjustedY})`}>
    <text x={adjustedX} y={adjustedY - fontSize * .14} fontSize={fontSize} textAnchor="middle">{bravuraSymbol(`timeSig${top}`, TIME_DIGITS[top])}</text>
    <text x={adjustedX} y={adjustedY + fontSize * .43} fontSize={fontSize} textAnchor="middle">{bravuraSymbol(`timeSig${bottom}`, TIME_DIGITS[bottom])}</text>
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
  const positions = restsBarNotePositions(items);
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
  const staffGap = whatNoteQuestion ? WHAT_NOTE_STAFF_GAP : Math.max(10, Number(SHARED_NOTATION.stave?.lineGap || 14));
  const left = 52;
  const fullRight = 462;
  const compactSpanScale = 0.72;
  const right = compactStave ? left + (fullRight - left) * compactSpanScale : fullRight;
  const top = 36;
  const bottom = top + staffGap * 4;
  const fullLeft = 52;
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
  return <svg className="millionaire-staff" viewBox="30 10 440 130" aria-hidden="true">
    <defs><linearGradient id={staffFadeId} x1={left} y1="0" x2={right} y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor" stopOpacity="1" /><stop offset="84%" stopColor="currentColor" stopOpacity="1" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-staff-line" x1={left} x2={right} y1={top + index * staffGap} y2={top + index * staffGap} style={{ stroke: `url(#${staffFadeId})` }} />)}
    {notation.showClef !== false && <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom - staffGap} gap={staffGap} />}
    {pitches.map((pitch, index) => {
      const position = PITCH_INDEX[pitch] ?? 4;
      const y = bottom - (position - 2) * staffGap / 2;
      const x = noteStart + index * noteSpacing + (notation.kind === "melody" ? (index === 0 ? -40 : -15) : 0);
      const step = position - NOTE_STEM_STEP_OFFSET;
      const stemDown = step > NOTE_STEM_DOWN_STEP_THRESHOLD;
      const ledgerPositions = [];
      if (position <= 0) for (let ledger = 0; ledger >= position; ledger -= 2) ledgerPositions.push(ledger);
      if (position >= 12) for (let ledger = 12; ledger <= position; ledger += 2) ledgerPositions.push(ledger);
      return <React.Fragment key={`${pitch}-${index}`}>
        {ledgerPositions.map((ledger) => {
          const ledgerY = bottom - (ledger - 2) * staffGap / 2;
          return <line key={ledger} className="millionaire-ledger" x1={x - staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} x2={x + staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} y1={ledgerY} y2={ledgerY} />;
        })}
        <CalibratedNotationSymbol symbolKey={stemDown ? "quarterNoteStemDown" : "quarterNoteStemUp"} x={x} y={y} gap={staffGap} />
      </React.Fragment>;
    })}
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
    {highlightBeam && <g className="millionaire-beam-pointer"><path d="M 100 -18 L 100 -2" /><path d="M 94 -8 L 100 -1 L 106 -8" /></g>}
  </svg>;
}

function NotePartNotation({ notation }) {
  const arrows = {
    notehead: { x1: 38, y1: 82, x2: 86, y2: 82 },
    stem: { x1: 164, y1: 54, x2: 113, y2: 54 },
    flag: { x1: 164, y1: 18, x2: 124, y2: 36 },
  };
  const part = arrows[notation.part] ? notation.part : "notehead";
  const arrow = arrows[part];
  const markerId = `millionaire-note-part-arrow-${part}`;
  return <svg className="millionaire-note-part" viewBox="0 0 200 120" aria-hidden="true">
    <defs><marker id={markerId} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M 0 0 L 9 4.5 L 0 9 Z" fill="#d97706" /></marker></defs>
    <CalibratedNotationSymbol symbolKey="eighthNoteStemUp" x={100} y={88} gap={20} />
    <line className="millionaire-note-part-arrow" x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} markerEnd={`url(#${markerId})`} />
  </svg>;
}

const BAR_NOTE_SYMBOL_KEYS = { quarterNote: "quarterNoteStemUp", eighthNote: "eighthNoteStemUp", sixteenthNote: "sixteenthNoteStemUp", halfNote: "halfNoteStemUp", dottedHalfNote: "halfNoteStemUp", wholeNote: "wholeNote" };
const RHYTHM_ANSWER_VALUES = { Semiquaver: "sixteenthNote", Quaver: "eighthNote", Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };

const RHYTHM_SUMS_INFO = {
  semibreve: { stem: false, dots: 0 },
  "dotted-minim": { stem: true, dots: 1 },
  minim: { stem: true, dots: 0 },
  crotchet: { stem: true, dots: 0 },
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
  eighthNote: { displayType: "note", rhythm: "quaver" },
  sixteenthNote: { displayType: "note", rhythm: "semiquaver" },
  halfNote: { displayType: "note", rhythm: "minim" },
  dottedHalfNote: { displayType: "note", rhythm: "dotted-minim" },
  wholeNote: { displayType: "note", rhythm: "semibreve" },
  pairedEighthNotes: { displayType: "beamed", rhythms: ["quaver", "quaver"] },
  fourSixteenthNotes: { displayType: "beamed", rhythms: ["semiquaver", "semiquaver", "semiquaver", "semiquaver"] },
  quaverTwoSemiquavers: { displayType: "beamed", rhythms: ["quaver", "semiquaver", "semiquaver"] },
  twoSemiquaversQuaver: { displayType: "beamed", rhythms: ["semiquaver", "semiquaver", "quaver"] },
  semiquaverQuaverSemiquaver: { displayType: "beamed", rhythms: ["semiquaver", "quaver", "semiquaver"] },
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
  const spacing = rhythms.length >= 4 ? 24 : 26;
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
      {rhythms.map((rhythm, index) => <RhythmSumsNote key={`${rhythm}-${index}`} rhythm={rhythm} x={positions[index]} systemTop={systemTop} colour={colour} beamed stemEndY={rhythmSumsBeamLineY(stemXs[index], start, end)} />)}
      <RhythmSumsBeam start={start} end={end} colour={colour} widthScale={Number(primaryBeamConfig.widthScale || 1)} thicknessScale={Number(primaryBeamConfig.heightScale || 1)} trim={hasSemi ? RHYTHM_SUMS_SEMIQUAVER_BEAM_TRIM : 0} />
      {secondarySegments.map((segment, index) => {
        const segmentStartX = stemXs[segment.startIndex];
        const segmentEndX = segment.hook ? segmentStartX + (segment.startIndex > 0 ? -14 : 14) : stemXs[segment.endIndex];
        const secondStart = { x: Math.min(segmentStartX, segmentEndX), y: rhythmSumsBeamLineY(Math.min(segmentStartX, segmentEndX), start, end) + RHYTHM_SUMS_LINE_GAP * .58 };
        const secondEnd = { x: Math.max(segmentStartX, segmentEndX), y: rhythmSumsBeamLineY(Math.max(segmentStartX, segmentEndX), start, end) + RHYTHM_SUMS_LINE_GAP * .58 };
        return <RhythmSumsBeam key={index} start={secondStart} end={secondEnd} colour={colour} widthScale={Number(secondBeamConfig.widthScale || 1)} thicknessScale={Number(secondBeamConfig.heightScale || 1)} trim={RHYTHM_SUMS_SEMIQUAVER_BEAM_TRIM} />;
      })}
    </g>
  </svg>;
}

function RhythmSumsGlyph({ item, colour = "currentColor", scale = 1 }) {
  if (item.displayType === "beamed") return <RhythmSumsBeamedNotes rhythms={item.rhythms} colour={colour} scale={scale} />;
  return <svg viewBox="0 0 90 90" className="millionaire-rhythmsums-glyph" aria-hidden="true"><g transform={`translate(45 70) scale(${scale}) translate(-42 -50)`}><RhythmSumsNote rhythm={item.rhythm} x={42} systemTop={12} colour={colour} /></g></svg>;
}

function RhythmSumTerm({ rhythm }) {
  if (rhythm === "blank") return <span className="millionaire-rhythmsums-blank" aria-hidden="true" />;
  const item = RHYTHM_SUM_ITEMS[rhythm] || RHYTHM_SUM_ITEMS.quarterNote;
  return <span className="millionaire-rhythmsums-slot"><RhythmSumsGlyph item={item} scale={.9} /></span>;
}

function AnswerRhythmGlyph({ rhythm, label }) {
  const symbolKey = BAR_NOTE_SYMBOL_KEYS[rhythm] || "quarterNoteStemUp";
  return <span className="millionaire-answer-rhythm" role="img" aria-label={label}><svg viewBox="0 0 64 70" aria-hidden="true"><CalibratedNotationSymbol symbolKey={symbolKey} x={30} y={43} gap={10} />{rhythm === "dottedHalfNote" && <CalibratedNotationSymbol symbolKey="augmentationDotLine" x={43} y={40.5} gap={10} />}</svg></span>;
}

function AnswerTimeSignatureGlyph({ timeSignature, label }) {
  const [upper, lower] = timeSignature.split("/").map(Number);
  return <span className="millionaire-answer-time-signature" role="img" aria-label={label}><span aria-hidden="true">{TIME_DIGITS[upper]}</span><span aria-hidden="true">{TIME_DIGITS[lower]}</span></span>;
}

function RhythmSumNotation({ notation }) {
  const terms = notation.terms || [];
  const className = `millionaire-rhythmsums${terms.length === 2 ? " is-two-term" : ""}${terms.length === 3 ? " is-three-term" : ""}${Number.isFinite(notation.total) ? " is-completion" : ""}`;
  return <div className={className}>
    {(notation.terms || []).map((term, index) => <React.Fragment key={`${term}-${index}`}>
      <RhythmSumTerm rhythm={term} />
      {notation.operators?.[index] && <span className="millionaire-rhythmsums-operator" aria-hidden="true">{notation.operators[index]}</span>}
    </React.Fragment>)}
    {Number.isFinite(notation.total) && <><span className="millionaire-rhythmsums-operator" aria-hidden="true">=</span><span className="millionaire-rhythmsums-total" aria-label={`${notation.total} beats`}>{notation.total}</span></>}
  </div>;
}

// Match the presentation in Dynamics: hairpins are drawn as two clean lines,
// while letter dynamics use the shared Bravura calibration.
const DYNAMIC_SYMBOL_KEYS = { pp: "pianissimo", p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte", ff: "fortissimo", sfz: "sforzato" };

function DynamicNotationGlyph({ dynamic, x = 80, y = 50 }) {
  if (dynamic === "crescendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y - 12}`} /><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y + 8}`} /></g>;
  if (dynamic === "diminuendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 12} L ${x + 32} ${y - 2}`} /><path d={`M ${x - 32} ${y + 8} L ${x + 32} ${y - 2}`} /></g>;
  const symbolKey = DYNAMIC_SYMBOL_KEYS[dynamic];
  const fontSizeScale = ["mp", "mf"].includes(dynamic) ? 5.475 : 3.65;
  return symbolKey ? <CalibratedNotationSymbol symbolKey={symbolKey} x={x} y={y + 4} gap={14} settingOverrides={{ fontSizeScale }} /> : null;
}

function DynamicNotation({ notation }) {
  const letterDynamic = ["p", "mp", "mf", "f"].includes(notation.dynamic);
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

// Complete-bar questions now use the Rests single-bar score. Selecting a
// Millionaire answer places that note into the outlined target.
function CompleteBarNotation({ notation, selectedRhythm = null }) {
  if (!notation.time) return <TimeSigFirstBarNotation notation={notation} />;
  return <RestsFirstBarNotation notation={notation} selectedRhythm={selectedRhythm} />;
}

function InlineNotationGlyph({ glyph, index, shiftDottedMinimRight = false }) {
  if (glyph === "blank") return <span className="millionaire-glyph-blank" key={index}>?</span>;
  const isDottedMinim = glyph === "dottedHalfNote";
  const className = [isDottedMinim ? "millionaire-dotted-note" : "", shiftDottedMinimRight && isDottedMinim ? "millionaire-dotted-minim-shift-right" : ""].filter(Boolean).join(" ");
  return <span className={className} key={index}>{GLYPHS[glyph] || "?"}</span>;
}

function NotationView({ notation, className = "", whatNoteQuestion = false, selectedRhythm = null }) {
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
  else if (notation.kind === "stave") content = <StaffNotation notation={{ ...notation, showClef: false, showBarline: false }} compactStave={compactStave} whatNoteQuestion={whatNoteQuestion} />;
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
  return <div className={`millionaire-notation${singleSymbolNotation ? " is-single-symbol-notation" : ""}${timeSignatureNotation ? " is-time-signature-question" : ""}${melodyNotation ? " is-melody-notation" : ""}${hairpinNotation ? " is-hairpin-notation" : ""}${trebleClefNotation ? " is-treble-clef-notation" : ""}${semibreveNotation ? " is-semibreve-notation" : ""}${repeatSignNotation ? " is-repeat-sign-notation" : ""}${twoTermRhythmSum ? " is-two-term-rhythm-sum" : ""}${rhythmCompletionNotation ? " is-rhythm-completion-question" : ""}${className ? ` ${className}` : ""}`} role="img" aria-label={notation.label || "Music notation"}>{content}</div>;
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
  return question?.notation?.kind === "bar"
    && Array.isArray(question.notation.time)
    && question.notation.glyphs?.includes("blank");
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

function ResultStat({ label, children }) {
  return <div className="millionaire-result-stat"><span>{label}</span><strong>{children}</strong></div>;
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

function App() {
  const [screen, setScreen] = useState("title");
  const [settings, setSettings] = useState(() => {
    const saved = safeRead(SETTINGS_KEY, {});
    const savedTypes = Array.isArray(saved.questionTypes) ? saved.questionTypes.filter((category) => CORE.CATEGORIES.includes(category)) : [];
    const queryLevel = new URLSearchParams(window.location.search).get("level");
    const level = CORE.SUPPORTED_LEVELS.includes(queryLevel) ? queryLevel
      : CORE.SUPPORTED_LEVELS.includes(saved.level) ? saved.level : DEFAULT_SETTINGS.level;
    return { ...DEFAULT_SETTINGS, ...saved, level, questionTypes: level === "N4" ? ["literacy"] : savedTypes.length ? [...new Set(savedTypes)] : DEFAULT_SETTINGS.questionTypes.slice() };
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
  const [milestone, setMilestone] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION_SECONDS);
  const [announcement, setAnnouncement] = useState("Welcome to Who Wants to Be a Millionaire.");
  const [transitioning, setTransitioning] = useState(false);
  const [correctRevealSkippable, setCorrectRevealSkippable] = useState(false);
  const levelRef = useRef(null);
  const customiseRef = useRef(null);
  const lifelineRef = useRef(null);
  const audioDirector = useRef(new AudioDirector());
  const gameSaved = useRef(false);
  const timerExpired = useRef(false);
  const timerTickAudio = useRef(null);
  const lastTimerTick = useRef(null);
  const twoBarPatternHistory = useRef(new Map());

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
    const canRunTimer = settings.timer && screen === "game" && question && !locked && !transitioning && !revealed;
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
  }, [settings.timer, screen, currentIndex, question?.id, locked, transitioning, revealed]);

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
    audioDirector.current.destroy();
  }, []);

  useEffect(() => {
    if (["title", "rules", "results"].includes(screen)) audioDirector.current.playOpening();
    else if (screen !== "game") audioDirector.current.pauseMusic();
  }, [screen]);

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
    setSettings((current) => {
      const enabled = current.backgroundMusic && current.soundEffects;
      return { ...current, backgroundMusic: !enabled, soundEffects: !enabled };
    });
  }

  function toggleQuestionType(category) {
    if (settings.level === "N4") return;
    setSettings((current) => {
      const enabled = current.questionTypes.includes(category);
      if (enabled && current.questionTypes.length === 1) return current;
      return { ...current, questionTypes: enabled ? current.questionTypes.filter((item) => item !== category) : [...current.questionTypes, category] };
    });
  }

  function createQuestions() {
    const recentGames = safeRead(HISTORY_KEY, []);
    try {
      const categories = settings.level === "N4" ? ["literacy"] : settings.questionTypes;
      return CORE.composeGame(QUESTION_BANK, recentGames, Math.random, { level: settings.level, categories }).map(randomiseTwoBarQuestion);
    } catch (error) {
      console.error("Millionaire game composition failed.", error);
      return null;
    }
  }

  function randomiseTwoBarQuestion(targetQuestion) {
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

  function startGame() {
    const nextQuestions = createQuestions();
    if (!nextQuestions) {
      setDialog({ type: "error", message: `A complete ${MILLIONAIRE_LEVELS[settings.level].label} game could not be prepared. Please reload and try again.` });
      return;
    }
    gameSaved.current = false;
    setCustomiseOpen(false);
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
    audioDirector.current.startGame();
    setScreen("game");
    setAnnouncement("Question 1 for £100.");
  }

  function resetGame() {
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

  function saveCompletedGame() {
    if (gameSaved.current) return;
    const recent = safeRead(HISTORY_KEY, []);
    const next = [...(Array.isArray(recent) ? recent : []), questions.map((item) => item.id)].slice(-5);
    safeWrite(HISTORY_KEY, next);
    gameSaved.current = true;
  }

  function finishGame(finalOutcome = outcome, prize = finalPrize) {
    audioDirector.current.stopExcerpt();
    audioDirector.current.stopMusic();
    audioDirector.current.stopEffect();
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
    const replacement = CORE.switchQuestion(enabledQuestionBank, questions, currentIndex + 1, question.level, Math.random, { allowRepeats: settings.questionTypes.length === 1 });
    if (!replacement) {
      setDialog({ type: "error", message: "A replacement question of the same difficulty is not available." });
      return;
    }
    resetQuestionState();
    const randomisedReplacement = randomiseTwoBarQuestion(replacement);
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
      setAnnouncement("Audio file not yet added.");
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
    const selectedBarRhythm = selectedBarAnswer ? RHYTHM_ANSWER_VALUES[selectedBarAnswer.text] || null : null;
    const notationClassName = [noteValueNameQuestion ? "is-name-note-question is-note-name-question" : "", whatNoteQuestion ? "is-what-note-question" : "", recordQuestion.notation?.kind === "melody" ? "is-name-note-question" : "", singleNoteBeatsQuestion ? "is-note-name-question" : "", beatTotalQuestion ? "is-beat-total-question" : "", timeSignatureQuestion ? "is-time-signature-question" : "", dottedMinimNameQuestion ? "is-dotted-minim-name-question" : "", dottedMinimBeatsQuestion ? "is-dotted-minim-beats-question" : "", dynamicSymbolQuestion ? "is-dynamic-symbol-question" : "", symbolMeaningQuestion ? "is-symbol-meaning-question" : "", timeSignatureBarCompletionQuestion ? "is-time-signature-bar-completion" : ""].filter(Boolean).join(" ");
    return <>
      {(recordQuestion.type === "notation" || recordQuestion.type === "text-notation") && <NotationView notation={recordQuestion.notation} className={notationClassName} whatNoteQuestion={whatNoteQuestion} selectedRhythm={selectedBarRhythm} />}
      {recordQuestion.type === "image" && <QuestionImage image={recordQuestion.image} />}
      {recordQuestion.category === "listening" && !hasQuestionAudio(recordQuestion) && <div className="millionaire-placeholder-note" role="status">Audio file not yet added.</div>}
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
    return <section className="millionaire-screen">
      <span className="millionaire-opening-logo-shine"><img className="millionaire-opening-logo" src="millionairelogo.svg" alt="Who Wants to Be a Millionaire" /></span>
      <p className="millionaire-screen-copy millionaire-opening-copy">Test your musical knowledge and climb the prize ladder to £1 million.</p>
      <div className="millionaire-opening-actions">
        <button type="button" className="millionaire-secondary millionaire-play millionaire-opening-play" onClick={() => setScreen("rules")}><span className="millionaire-opening-play-label">How to Play</span></button>
        <button type="button" className="millionaire-primary millionaire-play millionaire-opening-play" onClick={startGame}><span className="millionaire-opening-play-label">Start</span></button>
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
            <p>Earn medals for correctly answering the following questions:</p>
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
    return <div className="millionaire-game-grid">
      <section className="millionaire-play-area">
        {settings.timer && !revealed && !earnedReward && <QuestionTimer seconds={timeRemaining} />}
        <div className="millionaire-question-panel">
          {hintVisible && <div className="millionaire-inline-hint" role="note"><strong>Hint</strong><span>{question.tip}</span></div>}
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
          <div className="millionaire-explanation"><strong>Incorrect answer</strong>{question.explanation}</div>
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
    const reviewPrizeValue = reviewQuestionNumber ? CORE.PRIZE_LADDER[reviewQuestionNumber - 1] || 0 : 0;
    const reviewPrize = reviewPrizeValue === 1000000 ? "£1 MILLION" : CORE.formatPrize(reviewPrizeValue);
    const earnedMedalStage = [15, 10, 5, 3].find((stage) => stage <= correctCount);
    const earnedMedal = earnedMedalStage ? QUESTION_REWARDS[earnedMedalStage] : null;
    return <section className="millionaire-screen millionaire-results">
      {outcome === "won" && <FinalConfetti />}
      <h2>Review</h2>{lastCorrectRecord && <div className="millionaire-result-prize" aria-label={`Question ${reviewQuestionNumber}, ${reviewPrize}`}><span>QUESTION {reviewQuestionNumber}</span><span className="millionaire-result-prize-diamond" aria-hidden="true">◆</span><span>{reviewPrize}</span></div>}
      <div className="millionaire-results-grid">
        <ResultStat label="Medal achieved"><span className="millionaire-result-medal">{earnedMedal ? <img src={earnedMedal.icon} alt={earnedMedal.label} /> : "-"}</span></ResultStat>
        <ResultStat label="Lifelines used"><span className="millionaire-result-lifelines">{usedLifelines.length ? usedLifelines.map(({ key, icon, label }) => <img key={key} src={icon} alt={label} />) : "-"}</span></ResultStat>
        <ResultStat label="Time">{formatTime(elapsedMs)}</ResultStat>
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
        {record.question.category === "listening" && !hasQuestionAudio(record.question) && <div className="millionaire-placeholder-note" role="status">Audio file not yet added.</div>}
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

  const customiseUnavailable = screen === "game" || screen === "milestone";
  const activeLevelLabel = MILLIONAIRE_LEVELS[settings.level]?.label || "National 3";

  return <div className={window.MLH.shell.pageShellClass} style={{ overflowX: "clip" }}>
    <window.MLH.AppHeader icon="millionaire-icon.svg" title="Who Wants to Be a Millionaire?" subtitle="Test your musical knowledge and climb the prize ladder to £1 million." profileLabel={activeLevelLabel} profileUsesSharedSettings={false} />
    <div className="millionaire-page-content"><main className="millionaire-main-shell">
      <div className="millionaire-toolbar-wrap"><window.MLH.AppToolbar left={<div className="flex items-center gap-2">
        <fieldset disabled={customiseUnavailable} className="millionaire-customise-fieldset m-0 min-w-0 border-0 p-0">
          <div className="hub-menu-anchor relative" ref={levelRef}>
            <window.MLH.LevelButton icon={<img src="levels.svg" alt="" className="h-[26px] w-[26px]" />} activeLevel={settings.level} activeLabel={activeLevelLabel} onClick={() => { setCustomiseOpen(false); setLevelOpen((open) => !open); }} dataMenuTrigger={true} />
            {levelOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Level" position="left-0" dataMenuPanel={true}><window.MLH.LevelMenu activeLevel={settings.level} onSelect={(level) => { setSettings((current) => ({ ...current, level, questionTypes: level === "N4" ? ["literacy"] : current.questionTypes })); setLevelOpen(false); }} levels={MILLIONAIRE_LEVELS} /></window.MLH.MenuPanel>}
          </div>
        </fieldset>
        <fieldset disabled={customiseUnavailable} className="millionaire-customise-fieldset m-0 min-w-0 border-0 p-0">
          <div className="hub-menu-anchor relative" ref={customiseRef}>
            <window.MLH.CustomiseButton icon={<img src="customise.svg" alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />} onClick={() => { setLevelOpen(false); setCustomiseOpen((open) => !open); }} dataMenuTrigger={true} />
            {customiseOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Customise" position="-left-[66px] sm:left-0" variant="customise" dataMenuPanel={true}>
              <window.MLH.MenuSubheading>Question Types</window.MLH.MenuSubheading>
              {QUESTION_TYPE_OPTIONS.map((option) => <window.MLH.MenuToggleRow key={option.id} glyph={<QuestionTypeGlyph option={option} />} label={option.label} checked={settings.questionTypes.includes(option.id)} disabled={settings.level === "N4" || (settings.questionTypes.includes(option.id) && settings.questionTypes.length === 1)} onChange={() => toggleQuestionType(option.id)} />)}
              {settings.level === "N4" && <p className="mx-3 my-2 text-xs leading-snug text-stone-500">National 4 currently contains Music Literacy questions only.</p>}
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
