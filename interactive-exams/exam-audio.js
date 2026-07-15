(function (root) {
  "use strict";

  let activeAudio = null;
  const players = new Set();

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const rounded = Math.max(0, Math.floor(seconds));
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
  }

  function pauseOtherPlayers(audio) {
    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
  }

  function createPlayer(container, config) {
    const { clips, mode, playCounts, onPlayCountChange, locked = false } = config;
    let clipIndex = 0;
    let audio = null;
    let destroyed = false;

    function remaining(clip) {
      if (mode !== "exam") return null;
      return Math.max(0, clip.maxPlaysExam - (playCounts[clip.file] || 0));
    }

    function render() {
      const clip = clips[clipIndex];
      const left = remaining(clip);
      container.innerHTML = `
        <div class="exam-audio-player" data-audio-player>
          ${clips.length > 1 ? `<div class="audio-clip-tabs" role="tablist">${clips.map((item, index) => `<button type="button" class="audio-clip-tab ${index === clipIndex ? "is-active" : ""}" data-clip="${index}">${item.label}</button>`).join("")}</div>` : `<div class="audio-title">${clip.label}</div>`}
          <audio preload="metadata" src="${clip.file}"></audio>
          <div class="audio-controls">
            <button type="button" class="audio-icon-button" data-audio-action="play" ${locked || left === 0 ? "disabled" : ""} aria-label="Play">▶</button>
            <button type="button" class="audio-icon-button" data-audio-action="pause" aria-label="Pause">Ⅱ</button>
            <button type="button" class="audio-icon-button" data-audio-action="restart" ${locked ? "disabled" : ""} aria-label="Restart">↺</button>
            <span class="audio-time" data-elapsed>0:00</span>
            <input class="audio-progress" data-progress type="range" min="0" max="1000" value="0" ${mode === "exam" || locked ? "disabled" : ""} aria-label="Audio progress" />
            <span class="audio-time" data-duration>0:00</span>
            <label class="audio-volume-label"><span>Volume</span><input data-volume type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume" /></label>
          </div>
          ${mode === "exam" ? `<p class="plays-remaining" data-plays-remaining>${left} ${left === 1 ? "play" : "plays"} remaining</p>` : `<p class="plays-remaining">Unlimited plays · seeking available</p>`}
        </div>`;
      audio = container.querySelector("audio");
      players.add(audio);
      bind(clip);
    }

    function bind(clip) {
      const play = container.querySelector('[data-audio-action="play"]');
      const pause = container.querySelector('[data-audio-action="pause"]');
      const restart = container.querySelector('[data-audio-action="restart"]');
      const progress = container.querySelector("[data-progress]");
      const elapsed = container.querySelector("[data-elapsed]");
      const duration = container.querySelector("[data-duration]");
      const volume = container.querySelector("[data-volume]");

      play?.addEventListener("click", async () => {
        const left = remaining(clip);
        if (locked || left === 0) return;
        const startingNewPlay = audio.paused && (audio.currentTime === 0 || audio.ended);
        if (startingNewPlay && mode === "exam") {
          playCounts[clip.file] = (playCounts[clip.file] || 0) + 1;
          onPlayCountChange?.(playCounts);
          const nowLeft = remaining(clip);
          const label = container.querySelector("[data-plays-remaining]");
          if (label) label.textContent = `${nowLeft} ${nowLeft === 1 ? "play" : "plays"} remaining`;
        }
        pauseOtherPlayers(audio);
        try { await audio.play(); } catch { /* Browser playback messages are handled by native controls state. */ }
      });
      pause?.addEventListener("click", () => audio.pause());
      restart?.addEventListener("click", () => {
        audio.pause();
        audio.currentTime = 0;
        progress.value = 0;
        elapsed.textContent = "0:00";
      });
      audio.addEventListener("loadedmetadata", () => { duration.textContent = formatTime(audio.duration); });
      audio.addEventListener("timeupdate", () => {
        elapsed.textContent = formatTime(audio.currentTime);
        progress.value = audio.duration ? String(Math.round((audio.currentTime / audio.duration) * 1000)) : "0";
      });
      audio.addEventListener("ended", () => {
        if (mode === "exam" && remaining(clip) === 0) play.disabled = true;
      });
      progress.addEventListener("input", () => {
        if (mode !== "practice" || !audio.duration) return;
        audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
      });
      volume.addEventListener("input", () => { audio.volume = Number(volume.value); });
      container.querySelectorAll("[data-clip]").forEach(button => button.addEventListener("click", () => {
        audio.pause();
        players.delete(audio);
        clipIndex = Number(button.dataset.clip);
        render();
      }));
    }

    render();
    return {
      destroy() {
        if (destroyed) return;
        destroyed = true;
        audio?.pause();
        players.delete(audio);
        if (activeAudio === audio) activeAudio = null;
        container.innerHTML = "";
      },
    };
  }

  const api = { createPlayer, formatTime, pauseAll() { players.forEach(audio => audio.pause()); activeAudio = null; } };
  root.ExamAudio = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
