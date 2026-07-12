(function () {
  const MLH = window.MLH || {};
  const pianoBuffersByContext = new WeakMap();
  let pianoMapPromise = null;

  function ensurePianoMap() {
    if (window.MLH_PIANO_SAMPLE_MAP) return Promise.resolve(window.MLH_PIANO_SAMPLE_MAP);
    if (pianoMapPromise) return pianoMapPromise;
    pianoMapPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./piano%20audio/salamander-browser-map.js";
      script.onload = () => resolve(window.MLH_PIANO_SAMPLE_MAP);
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return pianoMapPromise;
  }

  function midiFromFrequency(frequency) {
    return Math.max(21, Math.min(108, Math.round(69 + 12 * Math.log2(frequency / 440))));
  }

  function pianoLayerForFrequency(frequency, velocity = 96) {
    const midi = midiFromFrequency(frequency);
    const layers = window.MLH_PIANO_SAMPLE_MAP?.notes?.[String(midi)] || [];
    return layers.find((layer) => velocity >= layer.loVel && velocity <= layer.hiVel) || layers[layers.length - 1] || null;
  }

  function pianoBufferCache(context) {
    if (!pianoBuffersByContext.has(context)) pianoBuffersByContext.set(context, new Map());
    return pianoBuffersByContext.get(context);
  }

  async function loadPianoLayer(context, layer) {
    if (!layer) return null;
    const cache = pianoBufferCache(context);
    if (cache.has(layer.sample)) return cache.get(layer.sample);
    const request = fetch(`./piano%20audio/${encodeURIComponent(layer.sample)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${layer.sample}`);
        return response.arrayBuffer();
      })
      .then((data) => context.decodeAudioData(data));
    cache.set(layer.sample, request);
    try {
      const buffer = await request;
      cache.set(layer.sample, buffer);
      return buffer;
    } catch (error) {
      cache.delete(layer.sample);
      throw error;
    }
  }

  function synthesisedPiano(context, destination, frequency, start, duration, volume) {
    [
      { ratio: 1, gain: 1, type: "triangle" },
      { ratio: 2, gain: 0.28, type: "sine" },
      { ratio: 3, gain: 0.11, type: "sine" },
    ].forEach((partial) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(frequency * partial.ratio, start);
      const peak = Math.max(0.0002, volume * partial.gain);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.32), start + Math.min(0.28, duration * 0.42));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.18);
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.22);
    });
  }

  function playPianoFrequency(context, destination, frequency, start, duration, volume = 0.08, velocity = 96) {
    if (!context || !destination || !Number.isFinite(frequency) || !Number.isFinite(start) || !Number.isFinite(duration)) return;
    const layer = pianoLayerForFrequency(frequency, velocity);
    const cached = layer ? pianoBufferCache(context).get(layer.sample) : null;
    if (!cached || typeof cached.duration !== "number") {
      ensurePianoMap()
        .then(() => {
          const loadedLayer = pianoLayerForFrequency(frequency, velocity);
          return loadPianoLayer(context, loadedLayer).then((buffer) => ({ buffer, layer: loadedLayer }));
        })
        .then(({ buffer, layer: loadedLayer }) => {
          if (!buffer || context.state === "closed") return;
          const actualStart = Math.max(start, context.currentTime + 0.005);
          const source = context.createBufferSource();
          const gain = context.createGain();
          source.buffer = buffer;
          source.playbackRate.setValueAtTime(loadedLayer.rate || 1, actualStart);
          const peak = Math.max(0.0002, Math.min(0.55, volume * 4 * (loadedLayer.gain || 1)));
          gain.gain.setValueAtTime(0.0001, actualStart);
          gain.gain.exponentialRampToValueAtTime(peak, actualStart + 0.012);
          gain.gain.setValueAtTime(peak * 0.94, actualStart + Math.max(0.04, duration));
          gain.gain.exponentialRampToValueAtTime(0.0001, actualStart + duration + 0.16);
          source.connect(gain);
          gain.connect(destination);
          source.start(actualStart);
          source.stop(actualStart + duration + 0.22);
        })
        .catch(() => {
          if (context.state !== "closed") synthesisedPiano(context, destination, frequency, Math.max(start, context.currentTime + 0.005), duration, volume);
        });
      return;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = cached;
    source.playbackRate.setValueAtTime(layer.rate || 1, start);
    const peak = Math.max(0.0002, Math.min(0.55, volume * 4 * (layer.gain || 1)));
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.setValueAtTime(peak * 0.94, start + Math.max(0.04, duration));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.16);
    source.connect(gain);
    gain.connect(destination);
    source.start(start);
    source.stop(start + duration + 0.22);
  }

  // The map is small and contains no audio. Loading it early means the first
  // press of Play can immediately request only the samples that are needed.
  ensurePianoMap().catch(() => {});

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

  function playMetronomeClick(context, destination, start, accented = false) {
    if (!context || !destination || !Number.isFinite(start)) return;
    const duration = accented ? 0.032 : 0.024;
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.4);
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(accented ? 1800 : 2200, start);
    gain.gain.setValueAtTime(accented ? 0.08 : 0.052, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(start);
    noise.stop(start + duration);
  }

  MLH.audio = {
    ...(MLH.audio || {}),
    playFeedbackSound,
    getStreakMedal,
    playMetronomeClick,
    playPianoFrequency,
  };
  MLH.playFeedbackSound = playFeedbackSound;
  MLH.getStreakMedal = getStreakMedal;
  MLH.playMetronomeClick = playMetronomeClick;
  MLH.playPianoFrequency = playPianoFrequency;
  window.MLH = MLH;
})();
