(function () {
  const MLH = window.MLH || (window.MLH = {});
  const e = React.createElement;
  const { useEffect } = React;

  const MENU_PANEL_CLASS = "hub-menu-panel hub-menu-panel-level";
  const MENU_TITLE_CLASS = "hub-menu-title";
  const TOOLBAR_BUTTON_CLASS = "flex h-10 w-[58px] items-center justify-center rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 sm:h-11 sm:w-auto sm:px-2.5";
  const CUSTOMISE_MENU_PANEL_CLASS = "hub-menu-panel hub-menu-panel-customise";

  function useClickAway(ref, handler) {
    useEffect(() => {
      function onPointerDown(event) {
        if (!ref.current || ref.current.contains(event.target)) return;
        handler(event);
      }

      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [ref, handler]);
  }

  function useClickOutside(refs, handlers) {
    useEffect(() => {
      function onPointerDown(event) {
        refs.forEach((ref, index) => {
          if (ref.current && !ref.current.contains(event.target)) handlers[index]?.(event);
        });
      }

      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [refs, handlers]);
  }

  function MenuPanel({ title, children, position = "left-0", variant = "level", dataMenuPanel = false }) {
    const className = `${variant === "customise" ? CUSTOMISE_MENU_PANEL_CLASS : MENU_PANEL_CLASS} ${position}`;
    const props = { className };
    if (dataMenuPanel) props["data-menu-panel"] = true;
    return e(
      "div",
      props,
      e(
        "div",
        { className: MENU_TITLE_CLASS },
        e("div", { className: "hub-menu-title-text" }, title),
      ),
      children,
    );
  }

  function ToolbarButton({ icon, label, mobileLabel = "", onClick, className = "", textClassName = "", iconClassName = "", dataMenuTrigger = false }) {
    const props = {
      type: "button",
      onClick,
      className: `${TOOLBAR_BUTTON_CLASS} ${className}`.trim(),
    };
    const children = [iconClassName ? e("span", { key: "icon", className: iconClassName }, icon) : icon];
    if (mobileLabel) {
      children.push(e("span", { key: "mobile-label", className: `relative -left-[5px] sm:hidden ${textClassName}`.trim() }, mobileLabel));
    }
    if (label) {
      children.push(e("span", { key: "desktop-label", className: `hidden sm:inline ${textClassName}`.trim() }, label));
    }
    if (dataMenuTrigger) props["data-menu-trigger"] = true;
    return e(
      "button",
      props,
      children,
    );
  }

  function LevelButton({ icon, activeLevel, activeLabel, onClick, isCustom = false, dataMenuTrigger = false }) {
    return e(ToolbarButton, {
      icon,
      label: activeLabel,
      mobileLabel: isCustom ? "" : activeLevel,
      onClick,
      dataMenuTrigger,
      className: isCustom ? "gap-0" : "gap-1",
      textClassName: "sm:relative sm:-left-[3px]",
    });
  }

  function CustomiseButton({ icon, onClick, dataMenuTrigger = false }) {
    return e(ToolbarButton, {
      icon,
      label: "Customise",
      onClick,
      dataMenuTrigger,
      className: "gap-2",
    });
  }

  function HelpButton({ icon, onClick, dataMenuTrigger = false }) {
    return e(ToolbarButton, {
      icon,
      label: "Help",
      onClick,
      dataMenuTrigger,
      className: "gap-2",
    });
  }

  function runSkipQuestion({ resetStreak, nextQuestion } = {}) {
    resetStreak?.();
    nextQuestion?.();
  }

  function resetLevelSessionProgress({
    setCorrect,
    setAttempted,
    setStreak,
    setBestStreak,
    setBest,
    setConfettiKey,
    setConfetti,
    setAutoShowMedals,
    setScore,
  } = {}) {
    setCorrect?.(0);
    setAttempted?.(0);
    setStreak?.(0);
    setBestStreak?.(0);
    setBest?.(0);
    setConfettiKey?.(0);
    setConfetti?.(0);
    setAutoShowMedals?.(false);
    setScore?.({ correct: 0, attempted: 0, streak: 0, best: 0 });
  }

  function SkipButton({ onClick, icon, resetStreak }) {
    return e(
      "button",
      { type: "button", onClick: () => runSkipQuestion({ resetStreak, nextQuestion: onClick }), className: `${TOOLBAR_BUTTON_CLASS} shrink-0` },
      e(
        "span",
        { className: "flex w-full items-center justify-center sm:relative sm:left-[4px] sm:w-auto sm:gap-1" },
        e("span", { className: "hidden sm:inline" }, "Skip"),
        icon,
      ),
    );
  }

  function MenuToggleRow({ glyph, label, checked, disabled = false, onChange, labelWidthClass = "min-w-[145px]" }) {
    return e(
      "button",
      {
        type: "button",
        disabled,
        onClick: onChange,
        className: "hub-toggle-row",
      },
      e(
        "span",
        { className: `hub-toggle-label ${labelWidthClass}` },
        e("span", { className: "hub-toggle-glyph flex items-center justify-center" }, glyph),
        e("span", { className: "leading-none" }, label),
      ),
      e(
        "span",
        { className: `hub-toggle-track ${checked ? "is-on" : ""}` },
        e("span", { className: "hub-toggle-thumb" }),
      ),
    );
  }

  function LevelMenu({ activeLevel, onSelect, levels }) {
    return e(
      "div",
      { className: "flex w-full min-w-0 flex-col gap-2" },
      Object.entries(levels).map(([key, level]) => {
        const active = activeLevel === key;
        return e(
          "button",
          {
            key,
            type: "button",
            onClick: () => onSelect(key),
            className: `w-full rounded-xl border px-3 py-2 text-left transition sm:px-4 ${active ? "border-stone-400 bg-stone-100" : "border-stone-200 bg-stone-50 hover:bg-stone-100"}`,
          },
          e(
            "div",
            { className: "flex min-h-[46px] min-w-0 items-center justify-between gap-3 text-stone-900" },
            e(
              "div",
              { className: "flex min-h-[46px] min-w-[42px] items-center justify-center" },
              e(
                "span",
                { className: "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-[1.22rem] font-black leading-none tracking-tight text-stone-800 shadow-sm scale-[1.08]" },
                key,
              ),
            ),
            e(
              "div",
              { className: "flex min-h-[46px] min-w-0 flex-1 flex-col justify-center pr-2" },
              e("div", { className: "pb-[1px] text-[13px] font-black leading-[1.2] sm:whitespace-normal" }, level.label),
              e("div", { className: "mt-[2px] pb-[2px] text-[11px] leading-[1.25] text-stone-600 sm:whitespace-normal" }, level.description),
            ),
            active ? e("img", { src: "https://mrtennant-music.github.io/musicliteracy/tick.svg", alt: "", "aria-hidden": "true", className: "h-[22px] w-[22px] shrink-0 self-center object-contain" }) : null,
          ),
        );
      }),
    );
  }

  MLH.MenuPanelClass = MENU_PANEL_CLASS;
  MLH.MenuTitleClass = MENU_TITLE_CLASS;
  MLH.CustomiseMenuPanelClass = CUSTOMISE_MENU_PANEL_CLASS;
  MLH.ToolbarButtonClass = TOOLBAR_BUTTON_CLASS;
  MLH.useClickAway = useClickAway;
  MLH.useClickOutside = useClickOutside;
  MLH.MenuPanel = MenuPanel;
  MLH.ToolbarButton = ToolbarButton;
  MLH.LevelButton = LevelButton;
  MLH.CustomiseButton = CustomiseButton;
  MLH.HelpButton = HelpButton;
  MLH.SkipButton = SkipButton;
  MLH.runSkipQuestion = runSkipQuestion;
  MLH.resetLevelSessionProgress = resetLevelSessionProgress;
  MLH.MenuToggleRow = MenuToggleRow;
  MLH.LevelMenu = LevelMenu;
})();
