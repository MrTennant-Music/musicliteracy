(function () {
  const MLH = window.MLH || {};

  function playFeedbackSound(correct, celebration = false, medal = null) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const master = context.createGain();
    const now = context.currentTime + 0.01;
    master.gain.value = 0.18;
    master.connect(context.destination);
    context.resume?.();

    function tone(freq, start, duration, type = "triangle", volume = 0.12) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    }

    function trumpet(freq, start, duration, volume = 0.1) {
      tone(freq, start, duration, "sawtooth", volume);
      tone(freq * 1.002, start, duration * 0.96, "square", volume * 0.32);
      tone(freq * 2, start, duration * 0.75, "triangle", volume * 0.16);
    }

    function medalPhrase(root, chord, start, beats = 4) {
      const beat = 0.6;
      const triplet = 0.13;
      const finalDuration = beats === 2 ? 0.72 : 1.95;
      chord.forEach((freq) => trumpet(freq, start, beats * beat, 0.045));
      trumpet(root, start, triplet, 0.11);
      trumpet(root, start + triplet, triplet, 0.11);
      trumpet(root, start + triplet * 2, triplet, 0.11);
      trumpet(root, start + 0.42, finalDuration, 0.13);
    }

    if (!correct) {
      tone(180, now, 0.55, "sawtooth", 0.075);
    } else if (celebration) {
      if (medal === "bronze") medalPhrase(659.25, [329.63, 415.3, 493.88], now);
      if (medal === "silver") medalPhrase(739.99, [369.99, 466.16, 554.37], now);
      if (medal === "gold") medalPhrase(830.61, [415.3, 523.25, 622.25], now);
      if (medal === "platinum") {
        medalPhrase(739.99, [369.99, 466.16, 554.37], now, 2);
        medalPhrase(830.61, [415.3, 523.25, 622.25], now + 0.82, 2);
        medalPhrase(932.33, [466.16, 587.33, 698.46], now + 1.64, 4);
      }
    } else {
      tone(740, now, 0.16, "triangle", 0.08);
      tone(988, now + 0.12, 0.34, "triangle", 0.1);
    }

    window.setTimeout(() => {
      try { context.close(); } catch {}
    }, medal === "platinum" ? 9000 : celebration ? 3500 : 900);
  }

  function getStreakMedal(streak) {
    const medals = {
      platinum: {
        tier: "diamond",
        emoji: "💎",
        icon: "https://mrtennant-music.github.io/musicliteracy/diamond.svg",
        bg: "bg-cyan-400/25",
        text: "text-cyan-500",
        sound: "platinum",
      },
      gold: {
        tier: "gold",
        emoji: "🥇",
        icon: "https://mrtennant-music.github.io/musicliteracy/gold.svg",
        bg: "bg-yellow-400/25",
        text: "text-yellow-500",
        sound: "gold",
      },
      silver: {
        tier: "silver",
        emoji: "🥈",
        icon: "https://mrtennant-music.github.io/musicliteracy/silver.svg",
        bg: "bg-slate-300/30",
        text: "text-slate-500",
        sound: "silver",
      },
      bronze: {
        tier: "bronze",
        emoji: "🥉",
        icon: "https://mrtennant-music.github.io/musicliteracy/bronze.svg",
        bg: "bg-amber-700/20",
        text: "text-amber-700",
        sound: "bronze",
      },
    };

    if (streak >= 30) return medals.platinum;
    if (streak >= 20) return medals.gold;
    if (streak >= 15) return medals.silver;
    if (streak >= 10) return medals.bronze;
    return null;
  }

  MLH.audio = {
    ...(MLH.audio || {}),
    playFeedbackSound,
    getStreakMedal,
  };
  MLH.playFeedbackSound = playFeedbackSound;
  MLH.getStreakMedal = getStreakMedal;
  window.MLH = MLH;
})();
