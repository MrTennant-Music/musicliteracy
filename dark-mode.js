(function () {
  const STORAGE_KEY = "mlh-dark-mode";

  function savedPreference() {
    try { return window.localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  }

  function apply(enabled, save = true) {
    document.documentElement.classList.toggle("mlh-dark-mode", Boolean(enabled));
    document.documentElement.style.colorScheme = enabled ? "dark" : "light";
    if (save) {
      try { window.localStorage.setItem(STORAGE_KEY, String(Boolean(enabled))); }
      catch {}
    }
    window.dispatchEvent(new CustomEvent("mlh-dark-mode-change", { detail: { enabled: Boolean(enabled) } }));
  }

  const style = document.createElement("style");
  style.textContent = `
    html.mlh-dark-mode {
      background: #fff;
      filter: invert(1) hue-rotate(180deg);
    }
    html.mlh-dark-mode img,
    html.mlh-dark-mode svg,
    html.mlh-dark-mode canvas,
    html.mlh-dark-mode iframe,
    html.mlh-dark-mode video {
      transition: filter .18s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      html.mlh-dark-mode img,
      html.mlh-dark-mode svg,
      html.mlh-dark-mode canvas,
      html.mlh-dark-mode iframe,
      html.mlh-dark-mode video { transition: none; }
    }
  `;
  document.head.appendChild(style);

  apply(savedPreference(), false);

  window.MLH_DARK_MODE = {
    isEnabled: () => document.documentElement.classList.contains("mlh-dark-mode"),
    set: (enabled) => apply(enabled),
    toggle: () => apply(!document.documentElement.classList.contains("mlh-dark-mode")),
  };

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) apply(event.newValue === "true", false);
  });
})();
