(function () {
  const MLH = window.MLH || (window.MLH = {});
  const LEVELS = {
    N3: "National 3",
    N4: "National 4",
    N5: "National 5",
    H: "Higher",
    AH: "Advanced Higher",
  };
  const SHORT_LEVELS = {
    N3: "N3",
    N4: "N4",
    N5: "N5",
    H: "H",
    AH: "AH",
  };
  const MODERN_HEADER_SELECTOR = "header.fixed, header[class*='fixed'][class*='top-0']";
  const RETROFIT_STYLE_ID = "mlh-retrofit-style";

  function ensureStyles() {
    if (document.getElementById(RETROFIT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = RETROFIT_STYLE_ID;
    style.textContent = `
      body.mlh-retrofit-active {
        background: #fafaf9;
      }

      body.mlh-retrofit-active .mlh-retrofit-page {
        padding-top: 154px !important;
      }

      @media (min-width: 768px) {
        body.mlh-retrofit-active .mlh-retrofit-page {
          padding-top: 104px !important;
        }
      }

      body.mlh-retrofit-active .mlh-retrofit-header {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        z-index: 1000 !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-top: 0 !important;
        border-radius: 0 !important;
        background: rgba(255, 255, 255, .95) !important;
        box-shadow: 0 1px 8px rgba(0, 0, 0, .08) !important;
        backdrop-filter: blur(12px);
      }

      body.mlh-retrofit-active .mlh-retrofit-header > div {
        max-width: 72rem !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      button[data-mlh-confirm="true"],
      button[data-mlh-confirm="true"]:hover,
      button[data-mlh-confirm="true"]:focus,
      button[data-mlh-confirm="true"]:active {
        border-color: #0c0a09 !important;
        background: #0c0a09 !important;
        color: #fff !important;
      }

      button[data-mlh-confirm="true"]:disabled {
        border-color: #d6d3d1 !important;
        background: #e7e5e4 !important;
        color: #78716c !important;
      }

      .mlh-retrofit-toggle-on {
        background: #0c0a09 !important;
      }

      svg .mlh-red-note-dim,
      svg [data-mlh-wrong="true"] {
        opacity: .48 !important;
      }

      .mlh-retrofit-level-anchor {
        position: relative;
        display: inline-flex;
      }

      .mlh-retrofit-level-button {
        display: inline-flex;
        height: 2.75rem;
        min-width: 132px;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        border-radius: .75rem;
        border: 1px solid #d6d3d1;
        background: #fff;
        padding: 0 1rem;
        color: #292524;
        font-size: .875rem;
        font-weight: 600;
      }

      .mlh-retrofit-level-icon {
        height: 26px;
        width: 28px;
        object-fit: contain;
      }

      .mlh-retrofit-level-menu {
        position: absolute;
        left: 0;
        top: calc(100% + .5rem);
        z-index: 140;
        width: min(360px, calc(100vw - 2rem));
        border-radius: 1rem;
        border: 1px solid #e7e5e4;
        background: #fff;
        padding: .75rem;
        box-shadow: 0 18px 48px rgba(0, 0, 0, .16);
      }

      .mlh-retrofit-level-title {
        margin-bottom: .5rem;
        text-align: center;
        font-size: .875rem;
        font-weight: 700;
      }

      .mlh-retrofit-level-option {
        display: flex;
        min-height: 44px;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        border-radius: .75rem;
        border: 1px solid #e7e5e4;
        background: #fafaf9;
        padding: .625rem .75rem;
        text-align: left;
        font-size: .875rem;
        font-weight: 650;
      }

      .mlh-retrofit-level-option + .mlh-retrofit-level-option {
        margin-top: .5rem;
      }

      .mlh-retrofit-level-option.is-active {
        border-color: #a8a29e;
        background: #f5f5f4;
      }

      .mlh-retrofit-score-popover {
        position: absolute;
        left: 50%;
        top: calc(100% + .5rem);
        z-index: 150;
        display: none;
        min-width: 112px;
        transform: translateX(-50%);
      }

      .mlh-retrofit-score-popover.is-open {
        display: block;
      }

      .mlh-retrofit-score-reset {
        width: 100%;
        border-radius: .75rem;
        border: 1px solid #dc2626;
        background: #dc2626;
        padding: .5rem .75rem;
        color: #fff;
        font-size: .875rem;
        font-weight: 700;
        box-shadow: 0 14px 34px rgba(0, 0, 0, .24);
      }

      .mlh-retrofit-medal-list {
        position: absolute !important;
        left: 50% !important;
        top: calc(100% + .5rem) !important;
        z-index: 145 !important;
        display: none !important;
        min-width: 116px !important;
        transform: translateX(-50%) !important;
        border: 1px solid #e7e5e4 !important;
        border-radius: .875rem !important;
        background: #fff !important;
        padding: .625rem .75rem !important;
        box-shadow: 0 14px 34px rgba(0, 0, 0, .18) !important;
      }

      .mlh-retrofit-medal-list.is-open {
        display: flex !important;
      }

      @media (max-width: 639px) {
        .mlh-retrofit-level-button {
          width: 58px;
          min-width: 58px;
          padding: 0;
        }

        .mlh-retrofit-level-button .mlh-retrofit-level-label {
          position: relative;
          left: -5px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getLevel() {
    const params = new URLSearchParams(window.location.search);
    const level = (params.get("level") || "").toUpperCase();
    if (LEVELS[level]) return level;
    const path = window.location.pathname;
    if (/transposing|tonic/.test(path)) return "H";
    if (/keysig|intervals|chords|accidentals/.test(path)) return "N5";
    return "N3";
  }

  function setLevel(level) {
    const url = new URL(window.location.href);
    url.searchParams.set("level", level);
    window.MLH?.resetLevelSessionProgress?.({});
    window.location.href = url.toString();
  }

  function buildLevelMenu(activeLevel, closeMenu) {
    const menu = document.createElement("div");
    menu.className = "mlh-retrofit-level-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML = `<div class="mlh-retrofit-level-title">Level</div>`;
    Object.entries(LEVELS).forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mlh-retrofit-level-option ${key === activeLevel ? "is-active" : ""}`;
      button.setAttribute("role", "menuitem");
      button.innerHTML = `<span>${label}</span>${key === activeLevel ? '<img src="https://mrtennant-music.github.io/musicliteracy/tick.svg" alt="" aria-hidden="true" style="height:20px;width:20px;object-fit:contain;">' : ""}`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        closeMenu();
        setLevel(key);
      });
      menu.appendChild(button);
    });
    return menu;
  }

  function isModernHeader(header) {
    return header?.matches?.(MODERN_HEADER_SELECTOR);
  }

  function retrofitHeader() {
    const root = document.getElementById("root");
    if (!root) return;
    const header = root.querySelector("header");
    if (!header || isModernHeader(header)) return;
    document.body.classList.add("mlh-retrofit-active");
    header.classList.add("mlh-retrofit-header");
    const page = root.firstElementChild;
    if (page) page.classList.add("mlh-retrofit-page");
  }

  function retrofitLevelButton() {
    if (document.querySelector(".mlh-retrofit-level-anchor")) return;
    if (document.querySelector("[data-mlh-modern-level='true']")) return;
    const customiseButton = Array.from(document.querySelectorAll("button")).find((button) => {
      const text = button.textContent || "";
      return /\bCustomise\b/.test(text);
    });
    if (!customiseButton) return;
    const toolbar = customiseButton.closest(".flex");
    if (!toolbar) return;
    const existingLevel = Array.from(toolbar.querySelectorAll("button")).find((button) => {
      if (button === customiseButton) return false;
      const text = (button.textContent || "").replace(/\s+/g, " ").trim();
      return Object.values(LEVELS).some((label) => text.includes(label)) ||
        Object.keys(LEVELS).some((key) => text === key || text.includes(key));
    });
    if (existingLevel) return;
    const activeLevel = getLevel();
    const anchor = document.createElement("div");
    anchor.className = "mlh-retrofit-level-anchor";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mlh-retrofit-level-button";
    button.innerHTML = `
      <img class="mlh-retrofit-level-icon" src="https://mrtennant-music.github.io/musicliteracy/levels.svg" alt="" aria-hidden="true">
      <span class="mlh-retrofit-level-label">
        <span class="hidden sm:inline">${LEVELS[activeLevel]}</span>
        <span class="sm:hidden">${SHORT_LEVELS[activeLevel]}</span>
      </span>
    `;
    anchor.appendChild(button);
    toolbar.insertBefore(anchor, toolbar.firstElementChild);

    let menu = null;
    function closeMenu() {
      menu?.remove();
      menu = null;
    }
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu) {
        closeMenu();
        return;
      }
      menu = buildLevelMenu(activeLevel, closeMenu);
      anchor.appendChild(menu);
    });
    document.addEventListener("pointerdown", (event) => {
      if (!anchor.contains(event.target)) closeMenu();
    }, true);
  }

  function retrofitConfirmButtons() {
    Array.from(document.querySelectorAll("button")).forEach((button) => {
      if ((button.textContent || "").trim() !== "Confirm") return;
      button.dataset.mlhConfirm = "true";
      button.classList.remove("bg-green-600", "hover:bg-green-700", "border-green-700", "bg-green-600/35");
      button.classList.add("bg-stone-950", "border-stone-950");
    });
  }

  function retrofitToggles() {
    Array.from(document.querySelectorAll("span.bg-green-600")).forEach((span) => {
      const hasThumb = span.querySelector(".translate-x-5") || span.querySelector('[class*="translate-x-5"]');
      const looksLikeToggle = span.className.includes("rounded-full") && span.className.includes("w-11");
      if (!hasThumb && !looksLikeToggle) return;
      span.classList.remove("bg-green-600");
      span.classList.add("bg-stone-950", "mlh-retrofit-toggle-on");
    });
  }

  function removeCustomiseResetButtons() {
    Array.from(document.querySelectorAll("button")).forEach((button) => {
      if (/reset score/i.test(button.textContent || "")) button.remove();
    });
  }

  function retrofitScoreResetPopover() {
    if (!document.body.classList.contains("mlh-retrofit-active")) return;
    const scoreLabels = Array.from(document.querySelectorAll("div,span")).filter((node) => {
      return (node.textContent || "").trim().toLowerCase() === "score";
    });
    scoreLabels.forEach((label) => {
      let tile = label.parentElement;
      for (let depth = 0; tile && depth < 5; depth += 1) {
        const className = (tile.className || "").toString();
        if (className.includes("rounded-xl") || className.includes("stat") || tile.tagName.toLowerCase() === "section") break;
        tile = tile.parentElement;
      }
      if (!tile || tile.dataset.mlhScorePopover === "true") return;
      if (!/score/i.test(tile.textContent || "")) return;
      tile.dataset.mlhScorePopover = "true";
      tile.style.position = tile.style.position || "relative";
      const popover = document.createElement("div");
      popover.className = "mlh-retrofit-score-popover";
      popover.innerHTML = `<button type="button" class="mlh-retrofit-score-reset">Reset</button>`;
      popover.querySelector("button").addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.reload();
      });
      tile.appendChild(popover);
      tile.addEventListener("click", (event) => {
        event.stopPropagation();
        popover.classList.toggle("is-open");
      });
    });
  }

  function retrofitMedalDropdown() {
    if (!document.body.classList.contains("mlh-retrofit-active")) return;
    Array.from(document.querySelectorAll("div")).forEach((node) => {
      const text = node.textContent || "";
      if (!text.includes("💎") || !text.includes("🥉")) return;
      if (node.classList.contains("mlh-retrofit-medal-list")) return;
      const tile = node.parentElement;
      if (!tile || tile.dataset.mlhMedalDropdown === "true") return;
      tile.dataset.mlhMedalDropdown = "true";
      tile.style.position = tile.style.position || "relative";
      node.classList.add("mlh-retrofit-medal-list");
      tile.addEventListener("click", (event) => {
        event.stopPropagation();
        node.classList.toggle("is-open");
      });
      document.addEventListener("pointerdown", (event) => {
        if (!tile.contains(event.target)) node.classList.remove("is-open");
      }, true);
    });
  }

  function dimRedScoreNotes() {
    const redValues = new Set(["#dc2626", "rgb(220, 38, 38)", "red"]);
    Array.from(document.querySelectorAll("svg [fill], svg [stroke]")).forEach((node) => {
      const fill = (node.getAttribute("fill") || "").toLowerCase();
      const stroke = (node.getAttribute("stroke") || "").toLowerCase();
      if (!redValues.has(fill) && !redValues.has(stroke)) return;
      if (node.tagName.toLowerCase() === "text") return;
      node.classList.add("mlh-red-note-dim");
    });
  }

  function retrofit() {
    ensureStyles();
    retrofitHeader();
    retrofitLevelButton();
    retrofitConfirmButtons();
    retrofitToggles();
    removeCustomiseResetButtons();
    retrofitScoreResetPopover();
    retrofitMedalDropdown();
    dimRedScoreNotes();
  }

  MLH.retrofitApps = retrofit;

  let scheduled = false;
  function scheduleRetrofit() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      retrofit();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRetrofit, { once: true });
  } else {
    scheduleRetrofit();
  }

  const observer = new MutationObserver(scheduleRetrofit);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
