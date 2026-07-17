const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const page = fs.readFileSync(path.join(root, "concept-recall.html"), "utf8");
const data = fs.readFileSync(path.join(root, "concept-recall-data.js"), "utf8");
const core = fs.readFileSync(path.join(root, "concept-recall-core.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

[
  "Concept Recall",
  "concept-recall-icon.svg",
  "concept-recall-data.js",
  "concept-recall-core.js",
  "window.MLH.AppHeader",
  "window.MLH.LevelMenu",
  "window.MLH.CustomiseButton",
  "Type a musical concept",
  "Correct answers are recognised automatically.",
  "onChange={(event) => setInput(event.target.value)}",
  "CORE.recognizeAnswer(value, activeQuestions, answeredRef.current)",
  "Date.now()",
  "CORE.remainingMilliseconds(timerRef.current, currentTime)",
  "30 seconds remaining.",
  "TimerPauseOverlay",
  "ResultsPanel",
  "Play Again",
  "Time taken",
  "Medal",
  "aria-live=\"polite\"",
  "aria-live=\"assertive\"",
  "role=\"dialog\"",
  "aria-modal=\"true\"",
  "prefers-reduced-motion: reduce",
  "min-h-11",
  "className=\"concept-table\"",
  "<caption className=\"sr-only\">",
  "window.MLH.playFeedbackSound",
  "footer.js",
].forEach((required) => assert(page.includes(required), `Missing Concept Recall integration safeguard: ${required}`));

assert(!page.includes(">Submit<"), "Concept Recall must not have a Submit button");
assert(!page.includes('type="submit"'), "Concept Recall must not require an answer-submission button");
assert(!page.includes("Return to Hub"), "The results screen must not include Return to Hub");
assert(page.indexOf("onChange={(event) => setInput(event.target.value)}") < page.indexOf("onKeyDown={onKeyDown}"), "Automatic recognition should be the primary input route");
assert(page.includes('right={<div className="flex items-center gap-2">'), "The Start and Pause button and answer input should be grouped on the toolbar right");
assert(page.indexOf('aria-label={toolbarButtonLabel}') < page.indexOf("<AnswerInput input={answerInput}"), "The Start, Pause and Play Again button should appear immediately before the answer input");
assert(page.includes('placeholder="Type answer"'), "The toolbar answer input should use the short Type answer placeholder");
assert(!page.includes("timerPopoverOpen") && !page.includes("toggleTimerPopover"), "The timer card should be display-only and contain no pause control");
assert(page.includes("bg-white/90 px-4 text-center backdrop-blur-sm"), "The pause overlay should match Practice Questions");
assert(page.includes("onClick={toolbarButtonAction}"), "The toolbar button should use the action for the current game state");
assert(!page.includes("function StartPanel"), "The How to play panel should be removed");
assert(!page.includes("function GameFilters"), "The answer and category filters should be removed");
assert(page.includes('const toolbarButtonLabel = gameState === "complete" ? "Play Again" : gameState === "ready" ? "Start" : "Pause";'), "The toolbar button should change to Play Again after a completed game");
assert(page.includes('const toolbarButtonAction = gameState === "complete" ? resetGame : gameState === "ready" ? startGame : pauseGame;'), "Play Again should reset the completed attempt to the ready screen");
assert(page.includes('sm:w-[120px]'), "The shared Start and Pause button should use the wider desktop size");
assert(!page.includes("concept-progress"), "The duplicate progress bar and score count should be removed");
assert(page.includes('`${categoryCount} categories • ${levelQuestions.length} concepts • ${durationMinutes} minutes`'), "Level subtitles should show the default category count, concept count and available time");
assert(!page.includes('label="Sound effects"'), "Sound effects should not appear as a customise option");
assert(page.includes("window.MLH.playFeedbackSound?.(true, false, null)"), "Correct-answer sounds should remain enabled");
assert(page.includes("window.MLH.playFeedbackSound?.(false, false, null)"), "Unrecognised-answer sounds should remain enabled");
assert(page.includes('chime: "chime.mp3"') && page.includes("function playCompletionChime()") && page.includes("if (finalResult.completed) playCompletionChime();"), "A successful completion should play the chime");
assert(!page.includes("StartCountdownOverlay") && !page.includes('setGameState("countdown")'), "Start should begin immediately without a countdown");
assert(page.includes("function endGame()") && page.includes("finishGame(answeredRef.current, Date.now())"), "Ending early should finish the attempt and open its feedback");
assert(page.includes('className="concept-results-panel mb-4 rounded-2xl') && page.includes('role="region"') && !page.includes('function ResultsDialog'), "Results feedback should appear in an inline container rather than a modal overlay");
assert(page.includes("Time taken") && page.includes("formatElapsed(result.elapsedMs)"), "Results should show the time taken for the attempt");
assert(page.includes("concept-results-medal") && page.includes("medal.label") && page.includes("medal.icon"), "Results should show the awarded medal in the fourth summary position");
assert(!page.includes("Best category") && !page.includes("Worst category"), "Results should no longer show best or worst categories");
assert(!page.includes("Category breakdown") && !page.includes("Review Answers"), "Results should omit the full category breakdown and Review Answers button");
assert(page.includes("concept-results-score-pill") && page.includes(">Score</span>"), "Results should use the Interactive Papers-style Score pill");
assert(page.includes("function SettingsChangeDialog") && page.includes("Changing this setting will end your current attempt and return you to Start."), "Changing a setting during play should show a confirmation warning");
assert(page.includes('requestSettingChange({ type: "level", value: level })') && page.includes('requestSettingChange({ type: "category", value: category })'), "Level and category changes should use the confirmation route during play");
assert(page.includes("pauseGame();") && page.includes("function cancelSettingChange()") && page.includes("resumeGame();"), "The current attempt should pause while the setting-change warning is open and resume after Cancel");
assert(page.includes('disabled={false}') && !page.includes('${settingsLocked ? "opacity-50" : ""}'), "Level and Customise controls should remain active during play");
assert(!page.includes("function RestartDialog"), "Restart should not show a confirmation prompt");
assert(page.includes('question.hint.replaceAll(".", "")'), "Full stops should be removed from pupil-facing hints");
assert(page.includes("<window.MLH.MenuSubheading>Categories</window.MLH.MenuSubheading>"), "The Categories heading should not show a selection count");
assert(!page.includes(".concept-category-options .hub-toggle-glyph { display: none; }"), "Category options should show their app icons");
assert(page.includes(".concept-category-options { gap: 6px; }"), "Category options should use reduced spacing");
assert(page.includes("<CategoryIcon category={category} menu={true} />"), "Category options should use the matching app icons");
assert(page.includes("label={titleCaseCategory(category)}"), "Category options should use title case");
assert(!page.includes('label="Randomise rows"'), "Randomise rows should not appear as a customise option");
assert(page.includes("const nextRows = [...questions];"), "Games should retain the fixed concept-grid order");
assert(page.includes('group.questions.sort((a, b) => a.answer.localeCompare(b.answer, "en-GB", { numeric: true }))'), "Concept answers should appear alphabetically within each category");
assert(page.includes('if (aStyles !== bStyles) return aStyles ? 1 : -1;'), "The optional Styles category should always remain at the bottom of the category grid");
assert(page.includes('concept-category-card.is-styles { grid-column: span 2; }') && page.includes('concept-styles-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }'), "Styles should span two grid columns and divide its concepts into two columns on wider screens");
assert(page.includes('group.questions.slice(0, Math.ceil(group.questions.length / 2))'), "Styles concepts should be divided evenly between their two internal columns");
assert(data.includes('hint: "Violin"') && data.includes('hint: "Trumpet"') && data.includes('hint: "Flute"') && data.includes('hint: "Glockenspiel"'), "Orchestral-family hints should use instrument names without Eg");
assert(data.includes('answer: "Polyphonic or contrapuntal"') && data.includes('aliases: ["polyphonic", "polyphony", "contrapuntal"]'), "Equivalent texture terms should share one displayed answer and accept either word");
assert(data.includes('answer: "Rallentando or ritardando"') && data.includes('answer: "Polytonality or bitonality"'), "Equivalent musical terms should be displayed together using or");
assert(!page.includes("function TimerChoices"), "Customise should not offer timer choices");
assert(page.includes("N5: 5 * 60 * 1000") && page.includes("H: 6 * 60 * 1000") && page.includes("AH: 8 * 60 * 1000"), "Full games should provide five minutes at National 5, six at Higher and eight at Advanced Higher");
assert(page.includes("CORE.scaledDurationMilliseconds(questions.length, levelQuestionCount, LEVEL_DURATION_MS[level])"), "Custom game time should scale from the selected level's full duration");
assert(core.includes("function scaledDurationMilliseconds"), "Proportional timer calculation should be separate from rendering");
assert(page.includes("function groupRowsByCategory(rows)"), "Concept rows should be grouped into category containers");
assert(page.includes('className="concept-category-title"'), "Each category container should use the category as its heading");
assert(!page.includes('<th scope="col">Category</th>'), "Category should not be repeated as a table column");
assert(!page.includes("<thead>"), "Category containers should not show an Answer or Hint heading row");
assert(page.includes("const [showHints, setShowHints] = useState(false);"), "Hints should be off by default");
assert(page.includes("const hintsVisible = showHints;"), "Hints should appear immediately when enabled");
assert(page.includes("const stylesCategory = isStylesCategory(group.category);") && page.includes("const groupShowsHints = showHints || stylesCategory;") && page.includes('data-hints={groupShowsHints ? "on" : "off"}') && page.includes("{groupShowsHints && <td"), "Style-identification hints should remain visible even when general hints are switched off");
assert(page.includes('label="Hints"') && page.includes('toggleHints={() => requestSettingChange({ type: "hints" })}'), "Customise should include an active Hints switch");
assert(page.includes('<div className="grid grid-cols-1 sm:grid-cols-2">\n      <window.MLH.MenuToggleRow') && page.includes('label="Hints"'), "The Hints switch should match one category-column width on desktop");
assert(page.includes("<window.MLH.MenuSubheading>Help</window.MLH.MenuSubheading>"), "The Hints section should be titled Help");
assert(page.includes('hint: "guide.svg"') && page.includes('glyph={<img src={ASSET.hint}'), "The Hints switch should use guide.svg");
assert(!page.includes("Hints enabled"), "The toolbar should not show a separate hints-enabled indicator");
assert(!page.includes('remainingMs <= timer.durationMs * 0.2'), "Hints should no longer depend on the remaining time");
assert(page.includes("color: rgba(0,0,0,.34) !important; font-size: 11px !important;"), "Hints should use small, very faint text");
assert(page.includes('.concept-table[data-hints="on"] th, .concept-table[data-hints="on"] td { width: 50%; }'), "Answer and Hint should share the category container width equally");
assert(page.includes("grid-template-columns: repeat(4, minmax(0, 1fr));"), "Four category containers should appear side by side on desktop");
assert(page.includes('{(gameState === "playing" || gameState === "paused") && <div className="concept-answer-reveal">'), "The answer field should appear as soon as play begins");
assert(page.includes("@keyframes conceptAnswerReveal"), "Starting the game should animate the answer field into view");
assert(page.includes('className="flex min-h-11 w-[88px] items-center justify-center gap-2 rounded-xl border border-black bg-black'), "Start and Pause should share the same black button appearance");
assert(page.includes('<span>{toolbarButtonLabel}</span>'), "The shared toolbar button should use the correct Start, Pause or Play Again text");
assert(page.includes("onEnd={endGame}"), "The paused overlay End button should finish the current attempt");
assert(page.includes(".concept-table tr.is-missed td { background: #fef2f2; }") && page.includes(".concept-status-missed { background: #dc2626; color: white; }") && page.includes(">×</span>"), "Review should reveal missed answers with a red row and circular cross");
assert(page.includes('groups.sort((a, b) => a.category.localeCompare(b.category, "en-GB"))'), "Category containers should appear in alphabetical order");
assert(page.includes("const [movedCategories, setMovedCategories] = useState(new Set())"), "Completed category cards should keep a separate visual ordering state");
assert(page.includes("setMovedCategories((current) => current.size ? new Set() : current)"), "Resetting category order at zero answers must not cause a repeated render loop");
assert(page.includes("group.questions.every((question) => answeredIds.has(question.id))"), "A category should move only after every concept in it is correct");
assert(page.includes("}), 520)"), "A completed category should pause briefly before moving");
assert(page.includes("element.animate?.([") && page.includes('duration: 650, easing: "cubic-bezier(.22,1,.36,1)"'), "Category cards should animate smoothly into their new positions");
assert(page.includes("const shouldAnimateReorder = [...movedCategories].some") && page.includes("!previousPosition || reduceMotion || !shouldAnimateReorder"), "Category cards should animate only when a completed category is deliberately reordered, not when the page loads or play starts");
assert(page.includes("conceptCategoryComplete") && page.includes("is-celebrating"), "A completed category should briefly show a green success animation");
assert(!data.includes('aliases: ["tr"') && !data.includes('aliases: ["pizz"') && data.includes('"accel"') && data.includes('"rall"'), "Only the specifically approved shortened tempo aliases should be present in the pupil data");
assert(!data.includes('category: "Bass line"') && data.includes('category: "Bass lines"'), "The Bass lines category should use the plural heading");
assert(!data.includes('category: "Playing technique"') && data.includes('category: "Playing techniques"'), "The Playing techniques category should use the plural heading");
assert(!data.includes('category: "Voice type"') && data.includes('category: "Voice types"'), "The Voice types category should use the plural heading");
assert(!data.includes('category: "Orchestral family"') && data.includes('category: "Orchestral families"'), "The Orchestral Families category should use the plural heading");
assert(!data.includes('category: "Tempo markings"') && data.includes('category: "Tempo"'), "The tempo category should use the Tempo heading");
assert(!data.includes('category: "Tempo change"') && data.includes('category: "Tempo changes"'), "The Tempo Changes category should use the plural heading");
assert(!data.includes('category: "Texture"') && data.includes('category: "Textures"'), "The Textures category should use the plural heading");
assert(page.includes("function titleCaseCategory(category)"), "Category headings should be displayed in title case");
assert(page.includes("{titleCaseCategory(group.category)}</span>"), "Category cards should use the title-cased heading");
assert(page.includes('"Bass lines": "./transposing-icon.svg"'), "Bass Lines should use the Transposing app icon");
assert(page.includes('"Cadences": "./cadences-icon.svg"'), "Cadences should use the Cadences app icon");
assert(page.includes('"Concerto grosso": "./concept-recall-piano-icon.svg"'), "Concerto Grosso should use the supplied piano icon");
assert(page.includes('"Key signatures": "./key-signatures-icon.svg"'), "Key Signatures should use the Key Signatures app icon");
assert(page.includes('"Orchestral families": "./concept-recall-violin-icon.svg"'), "Orchestral Families should use the supplied violin icon");
assert(page.includes('"Playing techniques": "./articulation-markings-icon.svg"'), "Playing Techniques should use the Articulation Markings app icon");
assert(page.includes('"Ornaments": "\\uE566"'), "Ornaments should use Bravura's trill glyph");
assert(page.includes("concept-category-bravura-ornaments") && page.includes("transform: translate(-50%, calc(-50% + 3px))"), "The Bravura trill should sit three pixels below geometric centre");
assert(page.includes('"Tempo changes": "./tempo.svg"'), "Tempo Changes should use tempo.svg");
assert(page.includes('"Voice types": "./concept-recall-voice-icon.svg"'), "Voice Types should use the supplied person icon");
assert(page.includes('"Word setting": "./concept-recall-word-setting-icon.svg"'), "Word Setting should use the supplied text-alignment icon");
assert(page.includes('["Tempo changes", "Word setting"].includes(category)') && page.includes("concept-category-icon-reduced-20") && page.includes("concept-category-menu-icon-reduced-20"), "The Tempo Changes and Word Setting icons should be reduced by about 20 percent in both locations");
assert(page.includes('category === "Voice types"') && page.includes("concept-category-icon-reduced-30") && page.includes("concept-category-menu-icon-reduced-30"), "The Voice Types icon should be reduced by about 30 percent overall in both locations");
assert(page.includes("concept-category-icon-reduced") && page.includes("concept-category-menu-icon-reduced"), "The piano and violin artwork should be reduced in both category locations");
assert(page.includes('"Tempo": "./tempo-icon.svg"'), "Tempo should use the Tempo app icon");
assert(page.includes('"Dynamics": "./dynamics-icon.svg"') && page.includes('"Fugue": "./concept-recall-fugue-icon.svg"') && page.includes('"Serial music": "./concept-recall-serial-icon.png"'), "The three new categories should use their matching icons");
assert(page.includes('"National 5 Styles": "./notenaming-icon.svg"') && page.includes('"Higher Styles": "./notenaming-icon.svg"') && page.includes('"Advanced Higher Styles": "./notenaming-icon.svg"'), "All three Styles categories should use notenaming-icon.svg");
assert(page.includes('category === "Fugue"') && page.includes("concept-category-icon-reduced-25") && page.includes("concept-category-menu-icon-reduced-25") && page.includes("transform: scale(.75)"), "The Fugue artwork should be reduced by 25 percent in both locations");
assert(page.includes("function customisableCategoriesAtLevel(level)") && page.includes('allCategoriesAtLevel("N5")'), "Higher levels should offer National 5-only category groups in Customise");
assert(page.includes("function questionsForSelectedCategories(level, selectedCategories)") && page.includes("supplementaryQuestions"), "Enabled National 5-only groups should add their questions to a higher-level custom game");
assert(page.includes("selectedCategories.length === standardCategories.length"), "Supplementary groups should remain off by default and should not alter standard-game eligibility");
assert(page.includes('N5: ["National 5 Styles"]') && page.includes('H: ["Higher Styles", "Orchestral families"]') && page.includes('AH: ["Advanced Higher Styles", "Concerto grosso", "Orchestral families"]'), "Each matching Styles category and the requested supplementary groups should start switched off");
assert(page.includes('N5: "National 5 Styles"') && page.includes('H: "Higher Styles"') && page.includes('AH: "Advanced Higher Styles"') && page.includes("category === STYLE_CATEGORY_BY_LEVEL[level]"), "Customise should show only the Styles list matching the selected level");
assert(page.includes("function standardQuestionsAtLevel(level)") && page.includes("standardQuestionsAtLevel(level).length"), "Default-off groups should remain available in Customise without shortening the standard level time");
assert(page.includes('if (category === "Serial music") return "Serial";'), "Serial music should be displayed with the shorter Serial title");
assert(page.includes('"Chords": "./chords-icon.svg"'), "The Chords category should use the existing Hub chords icon");
assert(data.includes('answer: "Added 6th"') && data.includes('answer: "Diminished 7th"') && data.includes('answer: "Dominant 7th"'), "Higher should include the three requested chord types");
assert(data.includes('answer: "Augmented triad"') && data.includes('category: "Chords", introducedAt: "AH"'), "Advanced Higher should add the augmented triad");
assert(page.includes("concept-category-icon"), "Category headings should show mini app icons");
assert(page.includes("const CATEGORY_ICONS_WITH_FRAME = new Set([") && page.includes('"Bass lines"') && page.includes('"Tonalities"'), "Category icons with embedded app-tile frames should be identified explicitly");
assert(page.includes("concept-category-icon-image-cropped") && page.includes("transform: scale(1.14)"), "Embedded app-tile outlines should be cropped while preserving the shared outer icon container");
assert(page.includes(".concept-hint-cell { overflow-wrap: anywhere;"), "Hint text should wrap within its column");
assert(page.includes('onClick={onEnd} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-600') && page.includes("<span>End</span>"), "The paused overlay should show a red End button to the left of Resume");
assert(page.includes('className="!mb-[10px] md:!mb-[14px]"'), "Padding below the toolbar should match the main container padding above it");
assert(!page.includes("concept-feedback") && !page.includes("Correct —") && !page.includes("Not recognised"), "Correct and incorrect answer banners should be removed");
assert(page.includes("concept-answer-wrap.is-shaking") && page.includes("@keyframes conceptAnswerShake") && page.includes("shake={answerShake}"), "An unrecognised answer should shake the answer box");
assert(!page.includes("performanceMessage") && !core.includes("function performanceMessage"), "The results screen should not show performance messages");
assert(page.includes(".concept-table td { padding: 13px 14px; border-bottom: 1px solid #e7e5e4; color: #000;"), "All table body text should be black");
assert(page.includes("border-bottom: 1px solid #d6d3d1; color: #000;"), "All table heading text should be black");
assert(page.includes('const PLAYABLE_LEVELS = ["N5", "H", "AH"]'), "Concept Recall should only offer National 5, Higher and Advanced Higher");
assert(page.includes('return PLAYABLE_LEVELS.includes(requested) ? requested : "N5";'), "National 5 should be the default Concept Recall level");
const headerControls = page.slice(page.indexOf("function HeaderControls"), page.indexOf("function AnswerInput"));
assert(headerControls.indexOf(">Timer</span>") < headerControls.indexOf(">Score</span>"), "Timer should appear before score in the header");
assert(page.includes('bestTime != null && <span className="concept-stat-note tabular-nums">Best: {formatElapsed(bestTime)}</span>'), "The Timer card should show its saved best completion time with the Best: label only when one exists");
assert(page.includes("const bestScore = levelRecord?.bestScore > 0 ? levelRecord.bestScore : null;") && page.includes('bestScore != null && <span className="concept-stat-note relative z-10">Best: {bestScore}</span>'), "The Score card should show Best: followed by the saved score without a total");
assert(page.includes('bestTime != null && <span') && page.includes('bestScore != null && <span'), "Timer and Score content should remain vertically centred until a Best record is present underneath");
assert(core.includes("function medalTimeLimits(level)") && page.includes("CORE.medalTimeLimits(activeLevel)"), "The medal drop-down and awards should share the same remaining-time thresholds");
assert(page.includes("aria-expanded={medalEligible ? medalsOpen : undefined}") && page.includes("fixed-popover-button") && page.includes("thresholds.map"), "The Timer card should open a Rhythm Identification-style medal drop-down");
assert(page.includes("medalEligible={standardGame}") && page.includes("Medals unavailable for custom games"), "The medal drop-down should be disabled for custom games");
assert(!page.includes('!active && !medalsOpen ? "opacity-45 grayscale"'), "The Timer card should not be greyed out before a standard game starts");
assert(page.includes('${item.className}`}>before</span>') && page.indexOf(">before</span>") < page.indexOf("{formatElapsed(item.value)}</span>"), "Each medal should show a matching-colour lowercase before label with its threshold time underneath");
assert(page.includes("const scoreProgress = total > 0") && page.includes("background: rgba(22,163,74,.38)") && page.includes('height: `${scoreProgress}%`'), "The Score card should fill from bottom to top using the same green as the Note Naming Accuracy card");
assert(page.includes("Concept Recall could not load") && page.includes('id="concept-load-retry"') && page.includes("window.location.reload()"), "A friendly reload panel should appear if Concept Recall cannot load");
assert(!page.includes("timerMinutes: 10, soundEffects: true, randomiseRows: false") && !page.includes("active={gameState !== \"ready\"}"), "Clearly unused legacy values should be removed from the Concept Recall page");
assert(data.includes('hint: "Music based on a mode rather than a major or minor key."') && data.includes('hint: "A bass line that moves steadily, often one note per beat, commonly used in jazz."') && data.includes('hint: "Flexible tempo, with the performer subtly speeding up and slowing down for expression."') && data.includes('hint: "Rapid repeated notes on a percussion instrument, creating a sustained sound."'), "The approved Modal, Walking bass, Rubato and Rolls hints should be used");

assert(data.includes("const QUESTIONS = ["), "Complete quiz content should be held in its own data file");
assert(data.includes("const INCOMPLETE_QUESTIONS = ["), "Incomplete teacher placeholders should be clearly separated");
assert(data.includes("deliberately separate from QUESTIONS"), "The placeholder exclusion should be documented");
assert(core.includes("function normalizeAnswer"), "Answer normalisation should be separate from rendering");
assert(core.includes("function recognizeAnswer"), "Answer recognition should be separate from rendering");
assert(core.includes("function elapsedMilliseconds"), "Timestamp timer logic should be separate from rendering");
assert(core.includes("function updatePersistence"), "Versioned persistence should be separate from rendering");
assert(core.includes('const STORAGE_KEY = "mlh-concept-recall-v1"'), "Concept Recall should use a versioned storage key");

assert(index.includes('"Concept Recall": "concept-recall-icon.svg"'), "The Concept Recall icon mapping is missing from index.html");
assert(index.includes('href: "concept-recall.html"'), "The Concept Recall card is missing from index.html");
assert(index.includes('{ category: "Other", apps: ['), "The Other heading is missing from index.html");
assert(index.indexOf('{ category: "Other", apps: [') > index.indexOf('{ category: "Practice", apps: ['), "Other must appear below Practice");
assert(index.includes('title: "Concept Recall", desc: "Race against the clock to recall musical concepts from written hints.", keywords: "concept recall revision timed quiz terminology definitions hints", audio: false, disabled: ["N3", "N4"]'), "The Hub should disable National 3 and National 4 for Concept Recall");

console.log("Concept Recall integration checks passed.");
