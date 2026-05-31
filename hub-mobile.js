(function () {
  const MLH = window.MLH || {};

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

  window.MLH = MLH;
})();
