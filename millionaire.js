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
  questionTypes: ["literacy", "listening", "concepts"],
  level: "N3",
};
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
  const rhythm = question?.notation?.kind === "bar" ? RHYTHM_ANSWER_VALUES[answer.text] : null;

  useLayoutEffect(() => {
    const content = contentRef.current;
    const text = textRef.current;
    if (!content || !text || rhythm) return undefined;

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
  }, [answer.letter, answer.text, rhythm]);

  return <span ref={contentRef} className="millionaire-answer-content"><span className="millionaire-answer-diamond" aria-hidden="true">◆</span><span className="millionaire-answer-letter">{answer.letter}:</span>{rhythm ? <AnswerRhythmGlyph rhythm={rhythm} label={answer.text} /> : <span ref={textRef} className="millionaire-answer-text">{answer.text}</span>}</span>;
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
const PITCH_INDEX = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7, D5: 8, E5: 9, F5: 10 };
const NOTATION_FALLBACKS = { gClef: "\uE050", quarterNoteStemUp: "\uE1D5", halfNoteStemUp: "\uE1D3", wholeNote: "\uE1D2" };

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

// This is the same calibrated Bravura-symbol approach used by Practice
// Questions, kept small here because Millionaire only needs a single stave.
function CalibratedNotationSymbol({ symbolKey, x, y, gap, settingOverrides = {} }) {
  const settings = { ...sharedNotationSymbol(symbolKey), ...settingOverrides };
  const adjustedX = x + gap * settings.xOffsetScale + settings.opticalXOffset;
  const adjustedY = y + gap * settings.yOffsetScale + settings.opticalYOffset;
  const transform = `translate(${adjustedX} ${adjustedY}) scale(${settings.widthScale} ${settings.heightScale}) translate(${-adjustedX} ${-adjustedY})`;
  return <text className="millionaire-music-symbol" x={adjustedX} y={adjustedY} fontSize={gap * settings.fontSizeScale} textAnchor="middle" transform={transform}>{bravuraSymbol(symbolKey, NOTATION_FALLBACKS[symbolKey] || "?")}</text>;
}

function StaffNotation({ notation }) {
  const pitches = notation.kind === "note" ? [notation.pitch] : notation.pitches || [];
  const staffGap = Math.max(10, Number(SHARED_NOTATION.stave?.lineGap || 14));
  const left = 52;
  const right = 462;
  const top = 36;
  const bottom = top + staffGap * 4;
  const noteStart = pitches.length === 1 ? 280 : pitches.length === 2 ? 225 : 174;
  const noteSpacing = pitches.length > 1 ? Math.min(62, 196 / Math.max(1, pitches.length - 1)) : 0;
  return <svg className="millionaire-staff" viewBox="30 10 440 130" aria-hidden="true">
    <defs><linearGradient id="millionaire-staff-line-fade" x1={left} y1="0" x2={right} y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="currentColor" stopOpacity="1" /><stop offset="84%" stopColor="currentColor" stopOpacity="1" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-staff-line" x1={left} x2={right} y1={top + index * staffGap} y2={top + index * staffGap} />)}
    {notation.showClef !== false && <CalibratedNotationSymbol symbolKey="gClef" x={94} y={bottom - staffGap} gap={staffGap} />}
    {pitches.map((pitch, index) => {
      const position = PITCH_INDEX[pitch] ?? 4;
      const y = bottom - (position - 2) * staffGap / 2;
      const x = noteStart + index * noteSpacing;
      return <React.Fragment key={`${pitch}-${index}`}>
        {position < 2 && <line className="millionaire-ledger" x1={x - staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} x2={x + staffGap * Number(SHARED_NOTATION.drawing?.ledgerLineWidthScale || 2.4) / 2} y1={y} y2={y} />}
        <CalibratedNotationSymbol symbolKey="quarterNoteStemUp" x={x} y={y} gap={staffGap} />
      </React.Fragment>;
    })}
  </svg>;
}

const RHYTHM_SUM_SYMBOL_KEYS = { quarterNote: "quarterNoteStemUp", halfNote: "halfNoteStemUp", dottedHalfNote: "halfNoteStemUp", wholeNote: "wholeNote" };
const BAR_NOTE_SYMBOL_KEYS = { quarterNote: "quarterNoteStemUp", halfNote: "halfNoteStemUp", dottedHalfNote: "halfNoteStemUp", wholeNote: "wholeNote" };
const RHYTHM_ANSWER_VALUES = { Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };

function RhythmSumTerm({ rhythm }) {
  const symbolKey = RHYTHM_SUM_SYMBOL_KEYS[rhythm] || "quarterNoteStemUp";
  return <svg className="millionaire-rhythm-sum-term" viewBox="0 0 90 90" aria-hidden="true">
    <g transform="translate(45 70) scale(.86) translate(-42 -50)">
      <CalibratedNotationSymbol symbolKey={symbolKey} x={42} y={40} gap={10} />
      {rhythm === "dottedHalfNote" && <CalibratedNotationSymbol symbolKey="augmentationDot" x={55} y={37.5} gap={10} />}
    </g>
  </svg>;
}

function AnswerRhythmGlyph({ rhythm, label }) {
  const symbolKey = BAR_NOTE_SYMBOL_KEYS[rhythm] || "quarterNoteStemUp";
  return <span className="millionaire-answer-rhythm" role="img" aria-label={label}><svg viewBox="0 0 64 70" aria-hidden="true"><CalibratedNotationSymbol symbolKey={symbolKey} x={30} y={43} gap={10} />{rhythm === "dottedHalfNote" && <CalibratedNotationSymbol symbolKey="augmentationDotLine" x={43} y={40.5} gap={10} />}</svg></span>;
}

function RhythmSumNotation({ notation }) {
  return <div className="millionaire-rhythm-sum">
    {(notation.terms || []).map((term, index) => <React.Fragment key={`${term}-${index}`}>
      <RhythmSumTerm rhythm={term} />
      {notation.operators?.[index] && <span className="millionaire-rhythm-sum-operator" aria-hidden="true">{notation.operators[index]}</span>}
    </React.Fragment>)}
  </div>;
}

// Match the presentation in Dynamics: hairpins are drawn as two clean lines,
// while letter dynamics use the shared Bravura calibration.
const DYNAMIC_SYMBOL_KEYS = { pp: "pianissimo", p: "piano", mp: "mezzoPiano", mf: "mezzoForte", f: "forte", ff: "fortissimo", sfz: "sforzato" };

function DynamicNotationGlyph({ dynamic, x = 80, y = 50 }) {
  if (dynamic === "crescendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y - 12}`} /><path d={`M ${x - 32} ${y - 2} L ${x + 32} ${y + 8}`} /></g>;
  if (dynamic === "diminuendo") return <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d={`M ${x - 32} ${y - 12} L ${x + 32} ${y - 2}`} /><path d={`M ${x - 32} ${y + 8} L ${x + 32} ${y - 2}`} /></g>;
  const symbolKey = DYNAMIC_SYMBOL_KEYS[dynamic];
  return symbolKey ? <CalibratedNotationSymbol symbolKey={symbolKey} x={x} y={y + 4} gap={14} settingOverrides={{ fontSizeScale: 3.65 }} /> : null;
}

function DynamicNotation({ notation }) {
  return <svg className="millionaire-dynamic-notation" viewBox="0 0 160 88" aria-hidden="true"><DynamicNotationGlyph dynamic={notation.dynamic} /></svg>;
}

// This is the calibrated Bravura end-barline from Barlines, rather than two
// ordinary text strokes. It includes the correct thin and thick lines.
function FinalBarlineNotation() {
  return <svg className="millionaire-final-barline-notation" viewBox="0 0 160 110" aria-hidden="true"><CalibratedNotationSymbol symbolKey="barlineFinal" x={80} y={50} gap={14} /></svg>;
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

function StandaloneTimeSignature({ notation }) {
  return <svg className="millionaire-time-signature-notation" viewBox="0 0 220 160" aria-hidden="true"><BarTimeSignature time={[notation.top, notation.bottom]} x={145} top={42} gap={24} /></svg>;
}

// A compact version of the score in Rests. The blank stays a static target
// because Millionaire answers are chosen below the question, not placed on it.
function CompleteBarNotation({ notation }) {
  const gap = Math.max(10, Number(SHARED_NOTATION.stave?.lineGap || 14));
  const top = 50;
  const bottom = top + gap * 4;
  const staffLeft = 28;
  const staffRight = 492;
  const barStart = notation.time ? 174 : 116;
  const barEnd = 466;
  const glyphs = notation.glyphs || [];
  const usableWidth = barEnd - barStart - 84;
  const positions = glyphs.map((_, index) => glyphs.length === 1 ? barStart + (barEnd - barStart) / 2 : barStart + 42 + usableWidth * index / (glyphs.length - 1));
  const noteY = bottom - gap;
  return <svg className="millionaire-complete-bar" viewBox="0 0 520 160" aria-hidden="true">
    {Array.from({ length: 5 }, (_, index) => <line key={index} className="millionaire-complete-bar-line" x1={staffLeft} x2={staffRight} y1={top + index * gap} y2={top + index * gap} />)}
    <CalibratedNotationSymbol symbolKey="gClef" x={78} y={bottom - gap} gap={gap} />
    <BarTimeSignature time={notation.time} x={130} top={top} gap={gap} />
    <line className="millionaire-complete-barline" x1={barStart} x2={barStart} y1={top} y2={bottom} />
    {glyphs.map((glyph, index) => {
      const x = positions[index];
      if (glyph === "blank") return <g key={`${glyph}-${index}`}><rect className="millionaire-note-blank" x={x - 27} y={top - 9} width="54" height={gap * 4 + 18} rx="7" /><text className="millionaire-note-blank-mark" x={x} y={top + gap * 2.75} textAnchor="middle">?</text></g>;
      const symbolKey = BAR_NOTE_SYMBOL_KEYS[glyph] || "quarterNoteStemUp";
      return <g key={`${glyph}-${index}`}><CalibratedNotationSymbol symbolKey={symbolKey} x={x} y={noteY} gap={gap} />{glyph === "dottedHalfNote" && <CalibratedNotationSymbol symbolKey="augmentationDotLine" x={x + gap * 1.3} y={noteY - gap * .25} gap={gap} />}</g>;
    })}
    <CalibratedNotationSymbol symbolKey="barlineFinal" x={barEnd} y={top + gap * 2} gap={gap} />
  </svg>;
}

function InlineNotationGlyph({ glyph, index }) {
  if (glyph === "blank") return <span className="millionaire-glyph-blank" key={index}>?</span>;
  return <span className={glyph === "dottedHalfNote" ? "millionaire-dotted-note" : ""} key={index}>{GLYPHS[glyph] || "?"}</span>;
}

function NotationView({ notation }) {
  if (!notation) return null;
  let content = null;
  if (notation.kind === "note" || notation.kind === "melody") content = <StaffNotation notation={notation} />;
  else if (notation.kind === "stave") content = <StaffNotation notation={{ ...notation, showClef: false, showBarline: false }} />;
  else if (notation.kind === "rhythmSum") content = <RhythmSumNotation notation={notation} />;
  else if (notation.kind === "dynamic") content = <DynamicNotation notation={notation} />;
  else if (notation.kind === "barline") content = <FinalBarlineNotation />;
  else if (notation.kind === "timeSignature") content = <StandaloneTimeSignature notation={notation} />;
  else if (notation.kind === "bar") content = <CompleteBarNotation notation={notation} />;
  else content = <div className="millionaire-glyphs">{(notation.glyphs || []).map((glyph, index) => <InlineNotationGlyph glyph={glyph} index={index} />)}</div>;
  return <div className="millionaire-notation" role="img" aria-label={notation.label || "Music notation"}>{content}</div>;
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

function App() {
  const [screen, setScreen] = useState("title");
  const [settings, setSettings] = useState(() => {
    const saved = safeRead(SETTINGS_KEY, {});
    const savedTypes = Array.isArray(saved.questionTypes) ? saved.questionTypes.filter((category) => CORE.CATEGORIES.includes(category)) : [];
    const queryLevel = new URLSearchParams(window.location.search).get("level");
    const level = CORE.SUPPORTED_LEVELS.includes(queryLevel) ? queryLevel
      : CORE.SUPPORTED_LEVELS.includes(saved.level) ? saved.level : DEFAULT_SETTINGS.level;
    return { ...DEFAULT_SETTINGS, ...saved, level, questionTypes: savedTypes.length ? [...new Set(savedTypes)] : DEFAULT_SETTINGS.questionTypes.slice() };
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
  const [announcement, setAnnouncement] = useState("Welcome to Who Wants to Be a Millionaire.");
  const [transitioning, setTransitioning] = useState(false);
  const [correctRevealSkippable, setCorrectRevealSkippable] = useState(false);
  const levelRef = useRef(null);
  const customiseRef = useRef(null);
  const lifelineRef = useRef(null);
  const audioDirector = useRef(new AudioDirector());
  const gameSaved = useRef(false);

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
    setSettings((current) => {
      const enabled = current.questionTypes.includes(category);
      if (enabled && current.questionTypes.length === 1) return current;
      return { ...current, questionTypes: enabled ? current.questionTypes.filter((item) => item !== category) : [...current.questionTypes, category] };
    });
  }

  function createQuestions() {
    const recentGames = safeRead(HISTORY_KEY, []);
    try {
      return CORE.composeGame(QUESTION_BANK, recentGames, Math.random, { level: settings.level, categories: settings.questionTypes });
    } catch (error) {
      console.error("Millionaire game composition failed.", error);
      return null;
    }
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
    setQuestions((current) => current.map((item, index) => index === currentIndex ? replacement : item));
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
    return <>
      {(recordQuestion.type === "notation" || recordQuestion.type === "text-notation") && <NotationView notation={recordQuestion.notation} />}
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
          <p className="millionaire-rules-note">Each lifeline can only be used once during a game.</p>
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
    const reviewPrizeValue = CORE.PRIZE_LADDER[highestReached - 1] || 0;
    const reviewPrize = reviewPrizeValue === 1000000 ? "£1 MILLION" : CORE.formatPrize(reviewPrizeValue);
    const earnedMedalStage = [15, 10, 5, 3].find((stage) => stage <= correctCount);
    const earnedMedal = earnedMedalStage ? QUESTION_REWARDS[earnedMedalStage] : null;
    return <section className="millionaire-screen millionaire-results">
      {outcome === "won" && <FinalConfetti />}
      <h2>Review</h2><div className="millionaire-result-prize" aria-label={`Question ${highestReached}, ${reviewPrize}`}><span>QUESTION {highestReached}</span><span className="millionaire-result-prize-diamond" aria-hidden="true">◆</span><span>{reviewPrize}</span></div>
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
        {(record.question.notation || record.question.image) && <div>{record.question.notation ? <NotationView notation={record.question.notation} /> : <QuestionImage image={record.question.image} />}</div>}
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
            {levelOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Level" position="left-0" dataMenuPanel={true}><window.MLH.LevelMenu activeLevel={settings.level} onSelect={(level) => { setSettings((current) => ({ ...current, level })); setLevelOpen(false); }} levels={MILLIONAIRE_LEVELS} /></window.MLH.MenuPanel>}
          </div>
        </fieldset>
        <fieldset disabled={customiseUnavailable} className="millionaire-customise-fieldset m-0 min-w-0 border-0 p-0">
          <div className="hub-menu-anchor relative" ref={customiseRef}>
            <window.MLH.CustomiseButton icon={<img src="customise.svg" alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />} onClick={() => { setLevelOpen(false); setCustomiseOpen((open) => !open); }} dataMenuTrigger={true} />
            {customiseOpen && !customiseUnavailable && <window.MLH.MenuPanel title="Customise" position="-left-[66px] sm:left-0" variant="customise" dataMenuPanel={true}>
              <window.MLH.MenuSubheading>Question Types</window.MLH.MenuSubheading>
              {QUESTION_TYPE_OPTIONS.map((option) => <window.MLH.MenuToggleRow key={option.id} glyph={<QuestionTypeGlyph option={option} />} label={option.label} checked={settings.questionTypes.includes(option.id)} disabled={settings.questionTypes.includes(option.id) && settings.questionTypes.length === 1} onChange={() => toggleQuestionType(option.id)} />)}
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
