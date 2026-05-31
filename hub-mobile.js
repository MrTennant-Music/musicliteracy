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

  window.MLH = MLH;
})();
