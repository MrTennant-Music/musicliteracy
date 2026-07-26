(function () {
  const MLH = window.MLH || {};

  MLH.isTouchDevice = function isTouchDevice() {
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;
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
