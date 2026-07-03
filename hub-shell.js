(function () {
  const MLH = window.MLH || {};

  MLH.shell = {
    scoreTileClass: "relative h-[58px] rounded-xl border border-stone-200 bg-stone-50 shadow-sm outline-none transition active:scale-[0.98] sm:h-[64px]",
    scoreTileActiveClass: "-translate-y-0.5 scale-[1.01] brightness-105 shadow-lg",
    toolbarButtonClass: "flex h-10 w-[58px] items-center justify-center rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 sm:h-11 sm:w-auto sm:px-2.5",
    menuPanelClass: "absolute top-full z-[120] mt-2 inline-block w-[calc(100vw-48px)] max-w-[360px] rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:w-fit sm:max-w-none",
    menuTitleClass: "relative -top-[4px] mb-1.5 flex h-[28px] items-center justify-center whitespace-nowrap px-8",
    pageShellClass: "overflow-x-hidden bg-stone-50 pb-10 text-black md:pb-12",
    pageContentClass: "mx-auto max-w-6xl px-3 pt-[154px] sm:px-4 sm:pt-[154px] md:px-8 md:pt-[104px]",
    mainShellClass: "relative z-0 min-h-[520px] overflow-visible rounded-2xl border border-stone-200 bg-white px-3 pb-0 pt-[10px] shadow-sm sm:min-h-[390px] sm:px-4 md:h-auto md:min-h-0 md:overflow-visible md:px-6 md:pb-6 md:pt-[14px]",
    footerShellClass: "bg-stone-50",
    questionCardMobileClass: "hub-mobile-question-card",
    confirmButtonClass: "hub-confirm-button rounded-xl border border-black bg-black px-[22px] py-[10px] text-sm font-bold text-white disabled:opacity-60",
    mobileConfirmButtonClass: "hub-confirm-button hub-mobile-confirm-full rounded-xl border border-black bg-black px-[22px] py-[10px] text-sm font-bold text-white disabled:opacity-60",
  };

  function useClickAway(ref, handler) {
    React.useEffect(() => {
      const onPointerDown = (event) => {
        if (!ref.current?.contains(event.target)) handler();
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [ref, handler]);
  }

  function advanceFeedbackPointerDown({ feedback, onCorrect, onIncorrect }) {
    if (!feedback) return false;
    if (feedback.correct) {
      onCorrect?.();
      return true;
    }
    onIncorrect?.();
    return true;
  }

  function AppHeader({ icon, title, subtitle, children }) {
    return (
      React.createElement("header", { className: "fixed left-0 right-0 top-0 z-[1000] w-full overflow-visible border-b border-stone-200 bg-white/95 py-2 shadow-sm backdrop-blur sm:py-3" },
        React.createElement("div", { className: "mx-auto flex w-full max-w-6xl flex-col gap-3 overflow-visible px-3 sm:px-4 md:flex-row md:items-center md:justify-between md:px-8" },
          React.createElement("div", { className: "flex items-center gap-3 sm:gap-4" },
            React.createElement("div", { className: "flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 text-black shadow-sm" },
              React.createElement("img", { src: icon, alt: "", "aria-hidden": "true", className: "block h-full w-full object-contain" })
            ),
            React.createElement("div", { className: "flex h-14 flex-col justify-center" },
              React.createElement("h1", { className: "relative top-[1px] text-[clamp(1.55rem,6vw,2.2rem)] font-semibold leading-none tracking-tight md:text-3xl" }, title),
              React.createElement("p", { className: "relative top-[5px] whitespace-nowrap text-[clamp(0.7rem,2.7vw,1rem)] leading-[1.05] text-stone-600 sm:top-0 sm:max-w-2xl sm:text-[clamp(0.72rem,1.2vw,1rem)] xl:whitespace-nowrap" }, subtitle)
            )
          ),
          React.createElement("div", { className: "relative z-50 flex flex-wrap items-center gap-2 overflow-visible md:ml-auto md:justify-end" }, children)
        )
      )
    );
  }

  function FeedbackBadge({ feedback, fading, animationPrefix = "keysig" }) {
    if (!feedback) return null;
    const fadeOut = animationPrefix === "note" ? "feedbackFadeOut .28s ease-out forwards" : "feedbackOut .28s ease-out forwards";
    const fadeIn = animationPrefix === "note"
      ? feedback.correct ? "correctFade .55s ease-out forwards" : "incorrectDropShake .55s ease-out forwards"
      : "feedbackIn .45s ease-out forwards";

    return (
      React.createElement("div", { className: "relative flex w-full items-center justify-center text-center" },
        React.createElement("div", {
          className: `flex h-10 min-w-[58px] max-w-[calc(100vw-96px)] items-center justify-center rounded-xl border px-3 text-[18px] font-black text-white translate-y-[60px] sm:translate-y-0 ${feedback.correct ? "border-[#16a34a] bg-[#16a34a]" : "border-[#dc2626] bg-[#dc2626]"}`,
          style: { animation: fading ? fadeOut : fadeIn },
        }, feedback.correct ? "Correct" : "Incorrect")
      )
    );
  }

  function ScoreStreakPanel({
    assets,
    correct,
    attempted,
    accuracy,
    streak,
    bestStreak,
    resetScore,
    confettiKey = 0,
    autoShowMedals = false,
    autoMedalPopoverMs = 2000,
    showMedalPopover = false,
    medalEligible = null,
    medalThresholdValues = null,
  }) {
    const [popover, setPopover] = React.useState(null);
    const [autoPopoverKey, setAutoPopoverKey] = React.useState(0);
    const [dismissedAutoPopoverKey, setDismissedAutoPopoverKey] = React.useState(0);
    const [autoMedalEligible, setAutoMedalEligible] = React.useState(true);
    const ref = React.useRef(null);
    useClickAway(ref, () => {
      setPopover(null);
      setAutoPopoverKey(0);
      setDismissedAutoPopoverKey(confettiKey);
    });

    React.useEffect(() => {
      const updateMedalEligibility = () => {
        const hasCustomLevel = Array.from(document.querySelectorAll("button[data-menu-trigger]"))
          .some((button) => button.textContent.trim() === "Custom");
        setAutoMedalEligible(!hasCustomLevel);
      };
      updateMedalEligibility();
      const observer = new MutationObserver(updateMedalEligibility);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      return () => observer.disconnect();
    }, []);

    const scoreFill = Math.max(0, Math.min(100, accuracy || 0));
    const scoreColour = scoreFill < 50 ? "rgba(220,38,38,.38)" : scoreFill < 70 ? "rgba(255,120,0,.42)" : "rgba(22,163,74,.38)";
    const thresholdValues = Array.isArray(medalThresholdValues) && medalThresholdValues.length === 4 ? medalThresholdValues : [10, 15, 20, 30];
    const autoPopoverDuration = Math.max(360, Number(autoMedalPopoverMs) || 2000);
    const autoPopoverOutDelay = Math.max(0.28, (autoPopoverDuration - 240) / 1000);
    const thresholdBase = [
      { tier: "bronze", icon: assets.bronze, className: "text-amber-700" },
      { tier: "silver", icon: assets.silver, className: "text-slate-500" },
      { tier: "gold", icon: assets.gold, className: "text-yellow-500" },
      { tier: "diamond", icon: assets.diamond, className: "text-cyan-500" },
    ];
    const thresholds = thresholdBase.map((item, index) => ({
      ...item,
      value: thresholdValues[index],
      active: streak >= thresholdValues[index] && (index === thresholdValues.length - 1 || streak < thresholdValues[index + 1]),
    }));
    const effectiveMedalEligible = medalEligible ?? autoMedalEligible;
    const medal = effectiveMedalEligible ? thresholds.find((item) => item.active) : null;
    React.useEffect(() => {
      if (!effectiveMedalEligible || confettiKey <= 0) return;
      setDismissedAutoPopoverKey(0);
      setAutoPopoverKey(confettiKey);
      const timer = window.setTimeout(() => setAutoPopoverKey(0), autoPopoverDuration);
      return () => window.clearTimeout(timer);
    }, [confettiKey, effectiveMedalEligible, autoPopoverDuration]);
    const autoPopoverDismissed = confettiKey > 0 && dismissedAutoPopoverKey === confettiKey;
    const autoMedalPopover = effectiveMedalEligible && popover !== "streak" && !autoPopoverDismissed && (autoShowMedals || showMedalPopover || autoPopoverKey > 0);
    const shouldShowMedalPopover = popover === "streak" || autoMedalPopover;
    const medalStyle = !effectiveMedalEligible
      ? { backgroundColor: "#f5f5f4", color: "#a8a29e" }
      : medal?.tier === "diamond"
      ? { backgroundColor: "rgba(34, 211, 238, .25)", color: "#06b6d4" }
      : medal?.tier === "gold"
        ? { backgroundColor: "rgba(250, 204, 21, .25)", color: "#eab308" }
        : medal?.tier === "silver"
          ? { backgroundColor: "rgba(203, 213, 225, .3)", color: "#64748b" }
          : medal?.tier === "bronze"
            ? { backgroundColor: "rgba(180, 83, 9, .2)", color: "#b45309" }
            : { backgroundColor: "#fafaf9", color: "#000000" };
    const tile = MLH.shell.scoreTileClass;
    const active = MLH.shell.scoreTileActiveClass;

    return (
      React.createElement("div", { ref, className: "grid w-full grid-cols-2 gap-2 md:w-auto md:grid-cols-[112px_98px] lg:grid-cols-[124px_108px]" },
        React.createElement("section", {
          role: "button",
          tabIndex: "0",
          onPointerDown: (event) => event.stopPropagation(),
          onClick: () => setPopover((value) => value === "score" ? null : "score"),
          className: `${tile} ${popover === "score" ? active : ""}`,
        },
          React.createElement("div", { className: "absolute inset-0 overflow-hidden rounded-xl" },
            React.createElement("div", { className: "absolute bottom-0 -left-[2px] right-0 rounded-b-xl transition-all duration-700", style: { height: `${scoreFill}%`, background: scoreColour } })
          ),
          React.createElement("div", { className: "relative z-10 flex h-full flex-col items-center justify-center pt-[1px] text-center" },
            React.createElement("div", { className: "text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-black sm:text-[11px]" }, "Score"),
            React.createElement("div", { className: "mt-[3px] text-[20px] font-black leading-none tracking-tight text-black sm:text-[22px]" }, `${correct}/${attempted}`),
            React.createElement("div", { className: "mt-[3px] text-[11px] font-medium leading-none text-stone-500 sm:text-[12px]" }, `Accuracy: ${accuracy}%`)
          ),
          popover === "score" && React.createElement("button", {
            type: "button",
            onClick: (event) => { event.stopPropagation(); resetScore(); setPopover(null); },
            className: "fixed-popover-button score-reset-button absolute left-1/2 top-full z-[120] mt-2 flex min-w-[112px] w-full -translate-x-1/2 items-center justify-center rounded-xl border border-[#dc2626] bg-[#dc2626] px-3 py-2 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.28)] sm:w-auto",
            style: { animation: "medalPopupIn .28s cubic-bezier(.22,1.25,.32,1)" },
          }, "Reset")
        ),
        React.createElement("section", {
          role: "button",
          tabIndex: "0",
          onPointerDown: (event) => event.stopPropagation(),
          onClick: () => setPopover((value) => value === "streak" ? null : "streak"),
          className: `${tile} overflow-visible ${popover === "streak" ? active : ""}`,
          style: { backgroundColor: medalStyle.backgroundColor },
        },
          React.createElement("div", { className: "pointer-events-none absolute inset-0 overflow-hidden rounded-xl" },
            React.createElement("div", {
              className: "absolute inset-0 rounded-xl transition-colors duration-700",
              style: { backgroundColor: medalStyle.backgroundColor },
            })
          ),
          effectiveMedalEligible && confettiKey > 0 && React.createElement("div", { key: confettiKey, className: "pointer-events-none absolute inset-0 z-20 overflow-visible" },
            Array.from({ length: 18 }).map((_, index) => React.createElement("span", {
              key: index,
              className: "absolute block h-1.5 w-1 rounded-sm",
              style: {
                left: `${8 + ((index * 19) % 84)}%`,
                top: "-8px",
                backgroundColor: ["#facc15", "#38bdf8", "#fb7185", "#4ade80", "#a78bfa"][index % 5],
                animation: `confettiDrop ${0.85 + (index % 5) * 0.12}s ease-out forwards`,
                animationDelay: `${(index % 6) * 0.035}s`,
              },
            }))
          ),
          React.createElement("div", { className: "relative z-10 flex h-full flex-col items-center justify-center pt-[1px] text-center" },
            React.createElement("div", { className: "text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-black sm:text-[11px]" }, "Streak"),
            React.createElement("div", { className: "mt-[3px] text-[20px] font-black leading-none tracking-tight sm:text-[22px]", style: { color: medalStyle.color } }, streak),
            React.createElement("div", { className: "mt-[3px] text-[11px] font-medium leading-none text-stone-500 sm:text-[12px]" }, `Highest: ${bestStreak}`)
          ),
          shouldShowMedalPopover && React.createElement("div", {
            className: "fixed-popover-button absolute left-1/2 top-full z-[120] mt-2 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-2.5 py-3 text-[12px] leading-none text-stone-700 shadow-lg sm:text-[13px]",
            style: { animation: autoMedalPopover ? `medalPopupIn .28s cubic-bezier(.22,1.25,.32,1), medalPopupOut .24s ease-in ${autoPopoverOutDelay}s forwards` : "medalPopupIn .28s cubic-bezier(.22,1.25,.32,1)" },
          },
            React.createElement("div", { className: "flex items-end justify-center gap-3" },
              thresholds.map((item) => React.createElement("div", { key: item.value, className: `flex flex-col items-center justify-end ${effectiveMedalEligible && item.active ? "medal-threshold-active" : ""}` },
                React.createElement("img", { src: item.icon, alt: "", "aria-hidden": "true", className: `h-[22.8px] w-[22.8px] object-contain ${effectiveMedalEligible ? "" : "grayscale opacity-35"}` }),
                React.createElement("span", { className: `mt-1 text-[11px] font-semibold leading-none ${effectiveMedalEligible ? item.className : "text-stone-400"}` },
                  item.value < 10 && React.createElement("span", { "aria-hidden": "true", className: "invisible" }, "0"),
                  item.value < 10
                    ? React.createElement("span", { style: { position: "relative", left: "-4px" } }, item.value)
                    : item.value
                )
              ))
            )
          )
        )
      )
    );
  }

  MLH.AppHeader = AppHeader;
  MLH.FeedbackBadge = FeedbackBadge;
  MLH.ScoreStreakPanel = ScoreStreakPanel;
  MLH.advanceFeedbackPointerDown = advanceFeedbackPointerDown;
  window.MLH = MLH;
})();
