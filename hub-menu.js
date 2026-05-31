(function () {
  const MLH = window.MLH || (window.MLH = {});

  const MENU_PANEL_CLASS = "absolute top-full z-50 mt-2 inline-block w-[calc(100vw-48px)] max-w-[360px] rounded-2xl border border-stone-200 bg-white p-3 shadow-lg sm:w-[420px] sm:max-w-[420px]";
  const MENU_TITLE_CLASS = "relative -top-[4px] mb-1.5 flex h-[28px] items-center justify-center whitespace-nowrap px-8";

  function LevelMenu({ activeLevel, onSelect, levels }) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-2">
        {Object.entries(levels).map(([key, level]) => {
          const active = activeLevel === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition sm:px-4 ${active ? "border-stone-400 bg-stone-100" : "border-stone-200 bg-stone-50 hover:bg-stone-100"}`}
            >
              <div className="flex min-w-0 items-center justify-between gap-3 text-stone-900 sm:items-start">
                <div className="flex min-h-[36px] min-w-[42px] items-center justify-center">
                  <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-[1.22rem] font-black leading-none tracking-tight text-stone-800 shadow-sm scale-[1.08]">
                    {key}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
                  <div className="pb-[1px] text-[13px] font-black leading-[1.2] sm:whitespace-normal">{level.label}</div>
                  <div className="mt-[2px] pb-[2px] text-[11px] leading-[1.25] text-stone-600 sm:whitespace-normal">{level.description}</div>
                </div>
                {active && <img src={level.tickSrc || "https://mrtennant-music.github.io/musicliteracy/tick.svg"} alt="" aria-hidden="true" className="h-[22px] w-[22px] shrink-0 object-contain" />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  MLH.MenuPanelClass = MENU_PANEL_CLASS;
  MLH.MenuTitleClass = MENU_TITLE_CLASS;
  MLH.LevelMenu = LevelMenu;
})();
