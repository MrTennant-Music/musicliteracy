(function () {
  const measurementId = String(window.MLH_ANALYTICS?.measurementId || "").trim();

  if (
    measurementId === "G-XXXXXXXXXX"
    || !/^G-[A-Z0-9]{6,}$/i.test(measurementId)
  ) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  const googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(googleTag);

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const appName = document.title
    .replace(/\s*(?:\||–|-)\s*(?:The\s+)?Music Literacy Hub.*$/i, "")
    .trim() || "Music Literacy Hub";

  window.gtag("event", "app_opened", {
    app_name: appName,
  });

  const curriculumLevels = [
    ["Advanced Higher", /ADVANCED\s+HIGHER|\bAH\b/i],
    ["National 3", /NATIONAL\s*3|\bN3\b/i],
    ["National 4", /NATIONAL\s*4|\bN4\b/i],
    ["National 5", /NATIONAL\s*5|\bN5\b/i],
    ["Higher", /\bHIGHER\b/i],
  ];

  function getCurriculumLevel(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    const match = curriculumLevels.find(([, pattern]) => pattern.test(text));
    return match?.[0] || "";
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.("button");
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;

    const isLevelControl = Boolean(
      button.dataset.level
      || button.dataset.filterLevel
      || button.dataset.selectionLabel
      || button.closest(".hub-menu-panel-level")
      || button.closest("[data-paper-level-options]"),
    );

    if (!isLevelControl) return;

    const curriculumLevel = getCurriculumLevel(
      button.dataset.level
      || button.dataset.filterLevel
      || button.dataset.selectionLabel
      || button.textContent,
    );

    if (!curriculumLevel) return;

    window.gtag("event", "level_selected", {
      curriculum_level: curriculumLevel,
    });
  });
})();
