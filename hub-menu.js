(function () {
  const MLH = window.MLH || (window.MLH = {});
  const e = React.createElement;
  const { useEffect } = React;

  const MENU_PANEL_CLASS = "hub-menu-panel hub-menu-panel-level";
  const MENU_TITLE_CLASS = "hub-menu-title";
  const TOOLBAR_BUTTON_CLASS = "flex h-10 w-[58px] items-center justify-center rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 sm:h-11 sm:w-auto sm:px-2.5";
  const CUSTOMISE_MENU_PANEL_CLASS = "hub-menu-panel hub-menu-panel-customise";
  const CONFIRM_BUTTON_CLASS = "hub-confirm-button rounded-xl border border-black bg-black px-[22px] py-[10px] text-sm font-bold text-white disabled:opacity-60";
  const WRONG_NOTATION_COLOUR = "#dc2626";
  const WRONG_NOTATION_OPACITY = 0.4;
  const CORRECT_NOTATION_COLOUR = "#16a34a";

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

  function AppToolbar({ left, feedback, right, className = "" }) {
    return e(
      "div",
      { className: `hub-toolbar relative z-20 ${className}`.trim() },
      e("div", { className: "hub-toolbar-left" }, left),
      e("div", { className: "hub-toolbar-feedback" }, feedback),
      e("div", { className: "hub-toolbar-right" }, right),
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

  function ConfirmButton({ onClick, disabled = false, children = "Confirm", className = "" }) {
    return e(
      "button",
      {
        type: "button",
        disabled,
        onClick,
        className: `${CONFIRM_BUTTON_CLASS} ${className}`.trim(),
      },
      children,
    );
  }

  function typedAnswerClass(feedback, baseClass = "") {
    const tone = !feedback ? "text-stone-900" : feedback.correct ? "text-green-600" : "text-red-600";
    return `${baseClass} ${tone}`.trim();
  }

  function feedbackNotationStyle(correct, { wrongOpacity = WRONG_NOTATION_OPACITY, correctOpacity = 1 } = {}) {
    return {
      colour: correct ? CORRECT_NOTATION_COLOUR : WRONG_NOTATION_COLOUR,
      color: correct ? CORRECT_NOTATION_COLOUR : WRONG_NOTATION_COLOUR,
      opacity: correct ? correctOpacity : wrongOpacity,
    };
  }

  function feedbackSvgProps(correct, options) {
    const style = feedbackNotationStyle(correct, options);
    return {
      stroke: style.colour,
      fill: style.colour,
      opacity: style.opacity,
    };
  }

  function createFeedbackAdvanceHandler({ feedback, feedbackFading, onCorrect, onIncorrect }) {
    return function onFeedbackPointerDown() {
      if (!feedback || feedbackFading) return false;
      return MLH.advanceFeedbackPointerDown?.({ feedback, onCorrect, onIncorrect }) || false;
    };
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

  function MenuSubheading({ children }) {
    return e(
      "div",
      {
        className: "px-2 pb-1 pt-3 text-[11px] font-black uppercase tracking-[0.12em] text-stone-400 first:pt-0",
      },
      children,
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
  MLH.ConfirmButtonClass = CONFIRM_BUTTON_CLASS;
  MLH.useClickAway = useClickAway;
  MLH.useClickOutside = useClickOutside;
  MLH.MenuPanel = MenuPanel;
  MLH.AppToolbar = AppToolbar;
  MLH.ToolbarButton = ToolbarButton;
  MLH.LevelButton = LevelButton;
  MLH.CustomiseButton = CustomiseButton;
  MLH.HelpButton = HelpButton;
  MLH.SkipButton = SkipButton;
  MLH.runSkipQuestion = runSkipQuestion;
  MLH.resetLevelSessionProgress = resetLevelSessionProgress;
  MLH.MenuToggleRow = MenuToggleRow;
  MLH.MenuSubheading = MenuSubheading;
  MLH.LevelMenu = LevelMenu;
  MLH.ConfirmButton = ConfirmButton;
  MLH.typedAnswerClass = typedAnswerClass;
  MLH.feedbackNotationStyle = feedbackNotationStyle;
  MLH.feedbackSvgProps = feedbackSvgProps;
  MLH.createFeedbackAdvanceHandler = createFeedbackAdvanceHandler;
})();
