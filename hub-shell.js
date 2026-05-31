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
    showMedalPopover = false,
  }) {
    const [popover, setPopover] = React.useState(null);
    const ref = React.useRef(null);
    useClickAway(ref, () => setPopover(null));

    const scoreFill = Math.max(0, Math.min(100, accuracy || 0));
    const scoreColour = scoreFill < 50 ? "rgba(220,38,38,.38)" : scoreFill < 70 ? "rgba(255,120,0,.42)" : "rgba(22,163,74,.38)";
    const thresholds = [
      { tier: "bronze", value: 10, icon: assets.bronze, className: "text-amber-700", active: streak >= 10 && streak < 15 },
      { tier: "silver", value: 15, icon: assets.silver, className: "text-slate-500", active: streak >= 15 && streak < 20 },
      { tier: "gold", value: 20, icon: assets.gold, className: "text-yellow-500", active: streak >= 20 && streak < 30 },
      { tier: "diamond", value: 30, icon: assets.diamond, className: "text-cyan-500", active: streak >= 30 },
    ];
    const medal = thresholds.find((item) => item.active);
    const medalStyle = streak >= 30
      ? { backgroundColor: "rgba(34, 211, 238, .25)", color: "#06b6d4" }
      : streak >= 20
        ? { backgroundColor: "rgba(250, 204, 21, .25)", color: "#eab308" }
        : streak >= 15
          ? { backgroundColor: "rgba(203, 213, 225, .3)", color: "#64748b" }
          : streak >= 10
            ? { backgroundColor: "rgba(180, 83, 9, .2)", color: "#b45309" }
            : { backgroundColor: "#f8fafc", color: "#000000" };
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
          confettiKey > 0 && React.createElement("div", { key: confettiKey, className: "pointer-events-none absolute inset-0 z-20 overflow-visible" },
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
          (popover === "streak" || autoShowMedals || showMedalPopover) && React.createElement("div", {
            className: "fixed-popover-button absolute left-1/2 top-full z-[120] mt-2 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-2.5 py-3 text-[12px] leading-none text-stone-700 shadow-lg sm:text-[13px]",
            style: { animation: autoShowMedals ? "medalPopupIn .28s cubic-bezier(.22,1.25,.32,1), medalPopupOut .24s ease-in 1.76s forwards" : "medalPopupIn .28s cubic-bezier(.22,1.25,.32,1)" },
          },
            React.createElement("div", { className: "flex items-end justify-center gap-3" },
              thresholds.map((item) => React.createElement("div", { key: item.value, className: `flex flex-col items-center justify-end ${item.active ? "medal-threshold-active" : ""}` },
                React.createElement("img", { src: item.icon, alt: "", "aria-hidden": "true", className: "h-[22.8px] w-[22.8px] object-contain" }),
                React.createElement("span", { className: `mt-1 text-[11px] font-semibold leading-none ${item.className}` }, item.value)
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
  window.MLH = MLH;
})();
