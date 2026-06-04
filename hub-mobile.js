(function () {
  const MLH = window.MLH || {};

  if (!document.getElementById("mlh-phone-landscape-lock-style")) {
    const style = document.createElement("style");
    style.id = "mlh-phone-landscape-lock-style";
    style.textContent = `
      .phone-landscape-lock {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: #f5f5f4;
        color: #0f172a;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-align: center;
        transform: translateZ(0);
      }

      .phone-landscape-lock-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .phone-landscape-lock-icon {
        width: 110px;
        height: 110px;
        object-fit: contain;
        opacity: .92;
      }
    `;
    document.head.appendChild(style);
  }

  MLH.isTouchDevice = function isTouchDevice() {
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;
  };

  MLH.installPhoneLandscapeLock = function installPhoneLandscapeLock() {
    function updatePhoneLandscapeLock() {
      const isPhoneLandscape = window.matchMedia("(max-width: 767px) and (orientation: landscape)").matches;
      let overlay = document.querySelector(".phone-landscape-lock");

      if (isPhoneLandscape && !overlay) {
        overlay = document.createElement("div");
        overlay.className = "phone-landscape-lock";
        overlay.innerHTML = `
          <div class="phone-landscape-lock-content">
            <img src="https://mrtennant-music.github.io/musicliteracy/portrait.svg" alt="Portrait orientation" class="phone-landscape-lock-icon" />
          </div>
        `;
        document.body.appendChild(overlay);
      }

      if (!isPhoneLandscape && overlay) {
        overlay.remove();
      }
    }

    updatePhoneLandscapeLock();
    window.addEventListener("resize", updatePhoneLandscapeLock);
    window.addEventListener("orientationchange", updatePhoneLandscapeLock);

    return function cleanupPhoneLandscapeLock() {
      window.removeEventListener("resize", updatePhoneLandscapeLock);
      window.removeEventListener("orientationchange", updatePhoneLandscapeLock);
      document.querySelector(".phone-landscape-lock")?.remove();
    };
  };

  MLH.useKeyboardReset = function useKeyboardReset() {
    const scrollY = React.useRef(0);
    const bodyTop = React.useRef("");

    return {
      onFocus(event) {
        if (!MLH.isTouchDevice()) return;
        scrollY.current = window.scrollY;
        bodyTop.current = document.body.style.top || "";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY.current}px`;
        event?.currentTarget?.focus?.({ preventScroll: true });
      },
      onBlur() {
        if (!MLH.isTouchDevice()) return;
        const nextY = scrollY.current;
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = bodyTop.current;
        window.scrollTo({ top: nextY, behavior: "auto" });
      },
    };
  };

  MLH.mobileScoreZoomPresets = {
    compact: 0.9,
    standard: 1,
    large: 1.25,
    touchPractice: 1.45,
    closeWork: 1.7,
  };

  MLH.mobileQuestionCardClass = "hub-mobile-question-card";
  MLH.mobileFullWidthConfirmClass = "hub-mobile-confirm-full";
  MLH.mobileDragMessageClass = "hub-mobile-drag-message";

  MLH.TouchDragMessage = function TouchDragMessage({ text = "Press and hold to drag note into place." }) {
    return React.createElement("div", { className: MLH.mobileDragMessageClass }, text);
  };

  MLH.getTouchPoint = function getTouchPoint(event) {
    const point = event.touches?.[0] || event.changedTouches?.[0] || event;
    return { clientX: point.clientX, clientY: point.clientY };
  };

  MLH.getTouchPreviewPosition = function getTouchPreviewPosition(event, { yOffset = 44 } = {}) {
    const point = MLH.getTouchPoint(event);
    return {
      x: point.clientX,
      y: point.clientY - yOffset,
      sourceX: point.clientX,
      sourceY: point.clientY,
    };
  };

  window.MLH = MLH;
})();
