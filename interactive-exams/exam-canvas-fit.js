(function fitInteractiveExamCanvas(root) {
  "use strict";

  const DESKTOP_WIDTH = 1280;

  function updateScale() {
    const visibleWidth = Math.max(1, Number(root.visualViewport?.width || root.innerWidth || DESKTOP_WIDTH));
    const scale = Math.min(1, visibleWidth / DESKTOP_WIDTH);
    document.documentElement.style.setProperty("--interactive-exam-scale", scale.toFixed(6));
  }

  updateScale();
  root.addEventListener("resize", updateScale, { passive: true });
})(window);
