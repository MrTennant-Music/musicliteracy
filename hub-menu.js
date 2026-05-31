(function () {
  const MLH = window.MLH || (window.MLH = {});
  const e = React.createElement;

  const MENU_PANEL_CLASS = "absolute top-full z-[120] mt-2 inline-block w-[calc(100vw-48px)] max-w-[360px] rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:w-[420px] sm:max-w-[420px]";
  const MENU_TITLE_CLASS = "relative -top-[4px] mb-1.5 flex h-[28px] items-center justify-center whitespace-nowrap px-8";
  const TOOLBAR_BUTTON_CLASS = "flex h-10 w-[58px] items-center justify-center rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-800 sm:h-11 sm:w-auto sm:px-2.5";
  const CUSTOMISE_MENU_PANEL_CLASS = "absolute top-full z-[120] mt-2 inline-block w-[calc(100vw-48px)] max-w-[360px] rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:w-fit sm:max-w-none";

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
        e("div", { className: "text-center text-base font-semibold text-stone-800" }, title),
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
    if (dataMenuTrigger) props["data-menu-trigger"] = true;
    return e(
      "button",
      props,
      icon,
      e("span", { className: `relative -left-[5px] sm:hidden ${textClassName}`.trim() }, mobileLabel),
      e("span", { className: `hidden sm:inline ${textClassName}`.trim() }, label),
    );
  }

  function SkipButton({ onClick, icon }) {
    return e(
      "button",
      { type: "button", onClick, className: `${TOOLBAR_BUTTON_CLASS} shrink-0` },
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
        className: "mb-2.5 flex min-h-[44px] w-full whitespace-nowrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-[14px] py-[10px] disabled:opacity-50",
      },
      e(
        "span",
        { className: `flex ${labelWidthClass} items-center gap-2 text-sm font-semibold text-stone-800` },
        e("span", { className: "flex h-[22px] w-[28px] shrink-0 items-center justify-center text-lg leading-none" }, glyph),
        e("span", null, label),
      ),
      e(
        "span",
        { className: `flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? "bg-black" : "bg-stone-400"}` },
        e("span", { className: `h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}` }),
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
            { className: "flex min-w-0 items-center justify-between gap-3 text-stone-900 sm:items-start" },
            e(
              "div",
              { className: "flex min-h-[36px] min-w-[42px] items-center justify-center" },
              e(
                "span",
                { className: "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-[1.22rem] font-black leading-none tracking-tight text-stone-800 shadow-sm scale-[1.08]" },
                key,
              ),
            ),
            e(
              "div",
              { className: "flex min-w-0 flex-1 flex-col justify-center pr-2" },
              e("div", { className: "pb-[1px] text-[13px] font-black leading-[1.2] sm:whitespace-normal" }, level.label),
              e("div", { className: "mt-[2px] pb-[2px] text-[11px] leading-[1.25] text-stone-600 sm:whitespace-normal" }, level.description),
            ),
            active ? e("img", { src: "https://mrtennant-music.github.io/musicliteracy/tick.svg", alt: "", "aria-hidden": "true", className: "h-[22px] w-[22px] shrink-0 object-contain" }) : null,
          ),
        );
      }),
    );
  }

  MLH.MenuPanelClass = MENU_PANEL_CLASS;
  MLH.MenuTitleClass = MENU_TITLE_CLASS;
  MLH.CustomiseMenuPanelClass = CUSTOMISE_MENU_PANEL_CLASS;
  MLH.ToolbarButtonClass = TOOLBAR_BUTTON_CLASS;
  MLH.MenuPanel = MenuPanel;
  MLH.ToolbarButton = ToolbarButton;
  MLH.SkipButton = SkipButton;
  MLH.MenuToggleRow = MenuToggleRow;
  MLH.LevelMenu = LevelMenu;
})();
