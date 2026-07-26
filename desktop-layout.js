(function enforceDesktopLayout() {
  const DESKTOP_WIDTH = 1280;
  const viewport = document.querySelector('meta[name="viewport"]');

  if (viewport) {
    viewport.setAttribute("content", `width=${DESKTOP_WIDTH}, initial-scale=1.0`);
  }

  /*
   * Older Hub pages still contain Tailwind breakpoint prefixes. Make every
   * breakpoint unconditional so those existing classes always resolve to
   * their desktop values, regardless of the physical screen width.
   */
  if (window.tailwind) {
    const current = window.tailwind.config || {};
    window.tailwind.config = {
      ...current,
      theme: {
        ...(current.theme || {}),
        screens: {
          sm: "0px",
          md: "0px",
          lg: "0px",
          xl: "0px",
          "2xl": "0px",
        },
      },
    };
  }
})();
