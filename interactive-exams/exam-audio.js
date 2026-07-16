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
    const { clips, locked = false, limitPlayback = false, playConsumed = false, onConsumed, continuous = false, autoplay = false, onClipStart, onSequenceEnd } = config;
    let clipIndex = 0;
    let audio = null;
    let destroyed = false;
    let consumed = Boolean(limitPlayback && playConsumed);

    function render() {
      const clip = clips[clipIndex];
      container.innerHTML = `
        <div class="exam-audio-player" data-audio-player>
          ${clips.length > 1 && !continuous ? `<div class="audio-clip-tabs" role="tablist">${clips.map((item, index) => `<button type="button" class="audio-clip-tab ${index === clipIndex ? "is-active" : ""}" data-clip="${index}">${item.label}</button>`).join("")}</div>` : ""}
          <audio preload="metadata" src="${clip.file}"></audio>
          <div class="audio-controls">
            <button type="button" class="audio-play-button ${continuous ? "is-exam-sequence" : ""}" data-audio-action="toggle" ${locked || consumed || (continuous && autoplay) ? "disabled" : ""} aria-label="${continuous ? "Exam audio playing" : consumed ? "Audio already played" : "Play excerpt"}">${continuous ? "" : `<span class="audio-play-glyph" data-play-glyph>▶</span>`}<span data-play-label>${continuous ? `Question ${clipIndex + 1}` : "Play"}</span></button>
            <span class="audio-time" data-elapsed>0:00</span>
            <div class="audio-progress-wrap">
              <input class="audio-progress" data-progress type="range" min="0" max="1000" value="0" ${locked || limitPlayback ? "disabled" : ""} aria-label="Audio progress" />
              ${clip.markers?.length ? `<div class="audio-markers" aria-label="Audio section timestamps">${clip.markers.map(marker => `<button type="button" class="audio-marker" data-marker-time="${marker.time}" ${locked || limitPlayback ? "disabled" : ""} aria-label="Go to part ${marker.label}">${marker.label}</button>`).join("")}</div>` : ""}
            </div>
            <span class="audio-time" data-duration>0:00</span>
          </div>
        </div>`;
      audio = container.querySelector("audio");
      players.add(audio);
      bind(clip);
      if (autoplay) {
        pauseOtherPlayers(audio);
        audio.play().then(() => onClipStart?.(clipIndex)).catch(() => {});
      }
    }

    function bind(clip) {
      const playToggle = container.querySelector('[data-audio-action="toggle"]');
      const playGlyph = container.querySelector("[data-play-glyph]");
      const playLabel = container.querySelector("[data-play-label]");
      const progress = container.querySelector("[data-progress]");
      const elapsed = container.querySelector("[data-elapsed]");
      const duration = container.querySelector("[data-duration]");

      function updatePlayButton(isPlaying) {
        if (continuous) {
          playLabel.textContent = `Question ${clipIndex + 1}`;
          return;
        }
        playGlyph.textContent = isPlaying ? "Ⅱ" : "▶";
        playLabel.textContent = isPlaying ? "Pause" : "Play";
        playToggle.setAttribute("aria-label", isPlaying ? "Pause excerpt" : "Play excerpt");
      }

      playToggle?.addEventListener("click", async () => {
        if (locked || consumed) return;
        if (!audio.paused) {
          audio.pause();
          return;
        }
        pauseOtherPlayers(audio);
        try { await audio.play(); } catch { /* Browser playback messages are handled by native controls state. */ }
      });
      audio.addEventListener("play", () => updatePlayButton(true));
      audio.addEventListener("pause", () => updatePlayButton(false));
      audio.addEventListener("ended", () => {
        updatePlayButton(false);
        if (continuous) {
          if (clipIndex < clips.length - 1) {
            players.delete(audio);
            clipIndex += 1;
            render();
          } else {
            onSequenceEnd?.();
          }
          return;
        }
        if (!limitPlayback || consumed) return;
        consumed = true;
        playToggle.disabled = true;
        playToggle.setAttribute("aria-label", "Audio already played");
        onConsumed?.();
      });
      audio.addEventListener("play", () => onClipStart?.(clipIndex), { once: true });
      audio.addEventListener("loadedmetadata", () => {
        duration.textContent = formatTime(audio.duration);
        container.querySelectorAll("[data-marker-time]").forEach(marker => {
          const markerTime = Number(marker.dataset.markerTime);
          marker.style.left = `${Math.min(100, Math.max(0, (markerTime / audio.duration) * 100))}%`;
        });
      });
      audio.addEventListener("timeupdate", () => {
        elapsed.textContent = formatTime(audio.currentTime);
        progress.value = audio.duration ? String(Math.round((audio.currentTime / audio.duration) * 1000)) : "0";
      });
      progress.addEventListener("input", () => {
        if (locked || limitPlayback || !audio.duration) return;
        audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
        elapsed.textContent = formatTime(audio.currentTime);
      });
      container.querySelectorAll("[data-marker-time]").forEach(marker => marker.addEventListener("click", () => {
        if (locked || limitPlayback || !audio.duration) return;
        audio.currentTime = Math.min(Number(marker.dataset.markerTime), audio.duration);
        progress.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
        elapsed.textContent = formatTime(audio.currentTime);
      }));
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
