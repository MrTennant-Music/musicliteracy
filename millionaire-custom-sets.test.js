const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const JSZip = require("jszip");
const customSets = require("./millionaire-custom-sets.js");

function completeSet(title = "Test Set") {
  const set = customSets.createSet(title);
  set.questions = set.questions.map((question, index) => ({
    ...question,
    prompt: `Question ${index + 1}?`,
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctAnswerIndex: index % 4,
    hint: `Hint ${index + 1}`,
  }));
  set.variants = set.variants.map((stageVariants, index) => ([{
    ...customSets.emptyQuestion(index + 1),
    prompt: `Question ${index + 1}, variation 2?`,
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    correctAnswerIndex: index % 4,
    hint: `Variation hint ${index + 1}`,
  }]));
  return set;
}

test("new custom sets contain exactly 15 stable question slots", () => {
  const set = customSets.createSet("  Classroom Set  ");
  assert.equal(set.title, "Classroom Set");
  assert.equal(set.questions.length, 15);
  assert.equal(customSets.MAX_VARIANTS, 5);
  assert.equal(set.variants.every((variants) => variants.length === 1), true);
  assert.equal(set.shuffleVariants.every((value) => value === false), true);
  assert.equal(new Set(set.questions.map((question) => question.id)).size, 15);
  assert.deepEqual(set.questions.map((question) => question.number), Array.from({ length: 15 }, (_, index) => index + 1));
  const validation = customSets.validateSet(set);
  assert.equal(validation.completeCount, 0);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.field === "variants"));
});

test("saved sets can keep up to five questions at each prize level", () => {
  const set = customSets.createSet("Five questions");
  set.variants[0] = Array.from({ length: 9 }, (_, index) => customSets.emptyQuestion(index + 1));
  const normalised = customSets.normaliseSet(set);
  assert.equal(normalised.variants[0].length, 4);
});

test("the S1 Orchestra starter set is complete and playable without media", () => {
  const starter = customSets.createS1OrchestraStarterSet();
  const validation = customSets.validateSet(starter);
  assert.equal(starter.id, customSets.S1_ORCHESTRA_STARTER_ID);
  assert.equal(starter.title, "Example: Orchestra");
  assert.equal(starter.questions.length, 15);
  assert.equal(starter.variants.every((versions) => versions.length === 3), true);
  assert.equal(starter.questions.every((question) => question.type === "text" && !question.image && !question.audio && !question.youtubeUrl), true);
  assert.match(starter.questions[0].prompt, /family/i);
  assert.match(starter.questions[5].prompt, /highest-sounding/i);
  assert.match(starter.questions[10].prompt, /Listen to the music/i);
  assert.match(starter.questions[12].prompt, /brass players/i);
  assert.match(starter.questions[14].prompt, /single reed/i);
  assert.equal(new Set([...starter.questions, ...starter.variants.flat()].map((question) => question.correctAnswerIndex)).size, 4);
  assert.equal(validation.valid, true);
});

test("the S1 Orchestra starter migration swaps Questions 4 and 15 without losing media", () => {
  const legacyStarter = customSets.createS1OrchestraStarterSet();
  legacyStarter.title = "S1 Orchestra";
  [legacyStarter.questions[3], legacyStarter.questions[14]] = [legacyStarter.questions[14], legacyStarter.questions[3]];
  [legacyStarter.variants[3], legacyStarter.variants[14]] = [legacyStarter.variants[14], legacyStarter.variants[3]];
  legacyStarter.questions[3].image = { id: "saved-image", name: "violin.png", type: "image/png", size: 3, duration: null, blob: new Blob(["png"], { type: "image/png" }) };
  legacyStarter.questions[3].type = "image";
  const migrated = customSets.migrateS1OrchestraStarterSet(legacyStarter);
  assert.equal(migrated.title, "Example: Orchestra");
  assert.equal(migrated.questions[14].image.id, "saved-image");
  assert.equal(migrated.questions[14].image.blob.size, 3);
});

test("the refreshed Orchestra template retains existing media", () => {
  const legacy = customSets.createS1OrchestraStarterSet();
  legacy.questions[5].prompt = "Who leads the orchestra during a performance?";
  legacy.questions[0].image = { id: "kept-image", name: "violin.png", type: "image/png", size: 3, duration: null, blob: new Blob(["png"], { type: "image/png" }) };
  legacy.questions[0].type = "image";
  const refreshed = customSets.refreshOrchestraStarterSet(legacy);
  assert.match(refreshed.questions[5].prompt, /highest-sounding/i);
  assert.equal(refreshed.questions[0].image.id, "kept-image");
  assert.equal(refreshed.questions[0].type, "image");
});

test("the latest Orchestra update moves reed questions and keeps media while varying answers", () => {
  const legacy = customSets.createS1OrchestraStarterSet();
  [legacy.questions[12], legacy.questions[14]] = [legacy.questions[14], legacy.questions[12]];
  [legacy.variants[12], legacy.variants[14]] = [legacy.variants[14], legacy.variants[12]];
  legacy.questions[12].image = { id: "reed-image", name: "reed.png", type: "image/png", size: 4, duration: null, blob: new Blob(["reed"], { type: "image/png" }) };
  legacy.questions[12].type = "image";
  legacy.questions.forEach((question) => { question.correctAnswerIndex = 0; });
  legacy.variants.flat().forEach((question) => { question.correctAnswerIndex = 0; });
  const moved = customSets.moveOrchestraReedQuestions(legacy);
  const shuffled = customSets.shuffleOrchestraStarterAnswers(moved);
  assert.match(shuffled.questions[14].prompt, /single reed/i);
  assert.equal(shuffled.questions[14].image.id, "reed-image");
  assert.equal(new Set([...shuffled.questions, ...shuffled.variants.flat()].map((question) => question.correctAnswerIndex)).size, 4);
});

test("legacy sets receive an empty Question 2 and discard Question Bank entries", () => {
  const set = completeSet("Legacy");
  set.questions = set.questions.slice(0, 15);
  delete set.variants;
  const normalised = customSets.normaliseSet(set);
  const validation = customSets.validateSet(normalised);
  assert.equal(normalised.questions.length, 15);
  assert.equal(normalised.variants.every((variants) => variants.length === 1), true);
  assert.equal(validation.mainCompleteCount, 0);
  assert.equal(validation.incompleteCount, 15);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.field === "variants"));
});

test("validation requires four answers, one correct answer and a hint, but not media", () => {
  const question = customSets.emptyQuestion(1);
  assert.ok(customSets.validateQuestion(question).length > 0);
  const complete = { ...question, prompt: "Question", hint: "Hint", answers: ["A", "B", "C", "D"], correctAnswerIndex: 0 };
  assert.equal(customSets.validateQuestion(complete).length, 0);
  assert.equal(customSets.validateQuestion({ ...complete, type: "image" }).length, 0);
});

test("a set needs two complete questions for every prize level", () => {
  const set = completeSet();
  let validation = customSets.validateSet(set);
  assert.equal(validation.valid, true);
  set.variants[3][0].prompt = "";
  set.variants[3][0].hint = "";
  validation = customSets.validateSet(set);
  assert.equal(validation.valid, false);
  assert.equal(validation.mainCompleteCount, 14);
  assert.equal(validation.completeVariantsByQuestion[3], 1);
});

test("duplicating a set regenerates set, question and media IDs without changing the original", () => {
  const source = completeSet("Original");
  source.questions[0].type = "image";
  source.questions[0].image = {
    id: "original-media",
    name: "example.png",
    type: "image/png",
    size: 3,
    duration: null,
    blob: new Blob(["png"], { type: "image/png" }),
  };
  const copy = customSets.duplicateSet(source);

  assert.equal(copy.title, "Original – Copy");
  assert.notEqual(copy.id, source.id);
  assert.notEqual(copy.questions[0].id, source.questions[0].id);
  assert.notEqual(copy.questions[0].image.id, source.questions[0].image.id);
  assert.equal(copy.questions[0].image.blob.size, source.questions[0].image.blob.size);
  assert.equal(source.title, "Original");
});

test("safe ZIP paths reject traversal and absolute paths", () => {
  assert.equal(customSets.safeZipPath("images/question-01.png"), true);
  assert.equal(customSets.safeZipPath("../question.png"), false);
  assert.equal(customSets.safeZipPath("images/../question.png"), false);
  assert.equal(customSets.safeZipPath("/images/question.png"), false);
  assert.equal(customSets.safeZipPath("images\\question.png"), false);
});

test("export and import preserve all question fields and packaged media", async () => {
  const source = completeSet("Round Trip");
  source.questions[0] = {
    ...source.questions[0],
    type: "image",
    imageAlt: "A labelled musical instrument",
    image: {
      id: customSets.uniqueId("media"),
      name: "instrument.png",
      type: "image/png",
      size: 7,
      duration: null,
      blob: new Blob(["pngdata"], { type: "image/png" }),
    },
  };
  source.questions[1] = {
    ...source.questions[1],
    type: "audio",
    audio: {
      id: customSets.uniqueId("media"),
      name: "excerpt.mp3",
      type: "audio/mpeg",
      size: 7,
      duration: 4.5,
      blob: new Blob(["mp3data"], { type: "audio/mpeg" }),
    },
  };
  source.questions[2] = {
    ...source.questions[2],
    type: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  };
  source.variants[0].push({
    ...customSets.emptyQuestion(1),
    prompt: "Question 1, variation 3?",
    answers: ["A", "B", "C", "D"],
    correctAnswerIndex: 2,
    hint: "Variation 3 hint",
  });

  const exported = await customSets.exportSet(source, JSZip);
  assert.equal(exported.filename, "round-trip.millionaire-set");
  const imported = await customSets.importPackage(exported.blob, JSZip);

  assert.equal(imported.summary.questionCount, 15);
  assert.equal(imported.summary.imageCount, 1);
  assert.equal(imported.summary.audioCount, 1);
  assert.equal(imported.summary.youtubeCount, 1);
  assert.equal(imported.summary.playable, true);
  assert.equal(imported.set.questions[0].prompt, source.questions[0].prompt);
  assert.deepEqual(imported.set.questions[0].answers, source.questions[0].answers);
  assert.equal(imported.set.questions[0].correctAnswerIndex, source.questions[0].correctAnswerIndex);
  assert.equal(imported.set.questions[0].hint, source.questions[0].hint);
  assert.equal(imported.set.questions[0].imageAlt, source.questions[0].imageAlt);
  assert.equal(imported.set.questions[0].image.blob.size, 7);
  assert.equal(imported.set.questions[0].audio, null);
  assert.equal(imported.set.questions[1].audio.blob.size, 7);
  assert.equal(imported.set.questions[1].image, null);
  assert.equal(imported.set.questions[2].youtubeUrl, source.questions[2].youtubeUrl);
  assert.equal(imported.set.variants[0][1].prompt, "Question 1, variation 3?");
  assert.equal(imported.set.playOnly, false);

  const playOnlyExport = await customSets.exportSet(source, JSZip, { playOnly: true });
  assert.equal(playOnlyExport.filename, "round-trip-play-only.millionaire-set");
  const playOnlyImported = await customSets.importPackage(playOnlyExport.blob, JSZip);
  assert.equal(playOnlyImported.set.playOnly, true);
});

test("runtime keeps each ladder question's versions together for the Switch lifeline", () => {
  const source = completeSet("Runtime");
  const runtime = customSets.runtimeSet(source);
  assert.equal(runtime.questions.length, 15);
  assert.equal(runtime.variants.length, 15);
  assert.equal(runtime.variants.every((variants) => variants.length === 2), true);
  assert.equal(runtime.questions.every((question) => Number.isInteger(question.customStage)), true);
  runtime.revoke();
});

test("YouTube links are validated and converted to privacy-enhanced embeds", () => {
  assert.equal(customSets.youtubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(customSets.youtubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(customSets.youtubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ"), "");
  assert.equal(customSets.youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
});

test("Millionaire page integrates the creator and uses local runtime dependencies", () => {
  const html = fs.readFileSync("millionaire.html", "utf8");
  const game = fs.readFileSync("millionaire.js", "utf8");
  const creator = fs.readFileSync("millionaire-creator.js", "utf8");

  assert.ok(html.includes("./millionaire-custom-sets.js"));
  assert.ok(customSets.ORCHESTRA_STARTER_PACKAGE_URL.endsWith("orchestra.millionaire-set"));
  assert.ok(fs.existsSync(customSets.ORCHESTRA_STARTER_PACKAGE_URL));
  assert.ok(html.includes("./millionaire-creator.js"));
  assert.ok(html.includes("./vendor/jszip/jszip.min.js"));
  assert.doesNotMatch(html, /https?:\/\/(?:cdn\.tailwindcss\.com|unpkg\.com)/);
  assert.ok(game.includes(">Create &amp; Import</"));
  assert.doesNotMatch(game, /millionaire-create-questions-menu/);
  assert.ok(game.includes("MILLIONAIRE_CUSTOM_SETS.runtimeSet(set)"));
  assert.ok(game.includes('<window.MillionaireCreator'));
  assert.ok(game.includes("activeCustomSet.variants"));
  assert.ok(game.includes("completedStages = []"));
  assert.ok(game.includes("millionaire-prize-completion-tick"));
  assert.ok(game.includes("millionaire-creator-global-toolbar"));
  assert.ok(creator.includes('millionaire-setup-card millionaire-rules-card millionaire-creator-library-card'));
  assert.ok(creator.includes('className="millionaire-set-card-thumbnail"') && creator.includes('src="millionairelogo new.svg"'), "Created-game cards should show the Millionaire logo thumbnail.");
  assert.ok(creator.includes("Download your game and send it to others."));
  assert.ok(creator.includes('const enterEditor = () => {') && creator.includes('onEditingChange?.(true);') && creator.includes('enterEditor();'), "The editor should enable its toolbar placeholders before opening or restoring an editor.");
  assert.doesNotMatch(creator, /millionaire-creator-toolbar-clear/);
  assert.ok(creator.includes('millionaire-creator-variant-bar') && creator.includes('aria-label="Add question"'), "Questions at each prize level should be managed beneath the question editor.");
  assert.ok(creator.includes('millionaire-creator-toolbar-customise') && creator.includes('millionaire-creator-shuffle-toggle'), "Shuffle should be available from the Customise menu.");
  assert.doesNotMatch(creator, /millionaire-creator-toolbar-playable/, "The editor toolbar should not duplicate the game-card playable status.");
  assert.ok(creator.includes('millionaire-creator-toolbar-guide') && creator.includes('src="guide.svg"') && creator.includes('millionaire-creator-guide-overlay'), "The editor should offer a toggleable help guide.");
  assert.ok(creator.includes("Every prize level needs at least two complete questions.") && creator.includes('src="warning.svg"') && creator.includes('src="tick.svg"'), "The help guide should explain question requirements and ladder statuses.");
  assert.doesNotMatch(creator, /aria-label=\{`Clear \$\{label\}`\}/, "Required questions should not have a misleading clear-content bin.");
  assert.ok(creator.includes('aria-label={`Delete ${label}`}'), "Additional questions should retain their delete bin.");
  assert.ok(game.includes('screen === "creator" && !creatorEditing'));
  assert.ok(game.includes("const isCustomGame = Boolean(activeCustomSet);") && game.includes("!isCustomGame && <fieldset"), "Custom games should hide the level selector while retaining the Customise menu.");
  assert.ok(game.includes('recordQuestion.type === "youtube"'));
  assert.ok(game.includes("onClick={() => onSelect(stage - 1)}"));
  assert.ok(creator.includes("← Back to Main Menu"));
  assert.ok(creator.includes("CreatorInlineEditor"));
  assert.ok(creator.includes("onEditingChange?.(screen === \"editor\")"));
  assert.ok(creator.includes('className="millionaire-answer-diamond"'));
  assert.ok(creator.includes('src="tick.svg"'));
  assert.ok(creator.includes("millionaire-creator-correct-tick"));
  assert.ok(creator.includes("completedStages={completedStages}"));
  assert.ok(!creator.includes("Choose one media type"));
  assert.ok(creator.includes('dialog?.type === "youtube"') && creator.includes("Edit YouTube link"));
  assert.ok(creator.includes("Switch lifeline preview"));
  assert.ok(creator.includes("The game will randomly choose between the available questions at each prize level every time a game is played."));
  assert.ok(creator.includes("Shuffle Questions"));
  assert.ok(creator.includes("At least one alternative question required"));
  assert.ok(creator.includes("Correct answer missing"));
  assert.ok(creator.includes("millionaire-creator-required-question-status"));
  assert.ok(creator.includes("mlh-millionaire-creator-resume"));
  assert.ok(creator.includes("restoredQuestionIndex"));
  assert.ok(creator.includes('select <strong>Import</strong>'));
  assert.ok(creator.includes("loadOrchestraStarterSet"));
  assert.ok(creator.includes('millionaire-opening-play-label">Create</span>'));
  assert.ok(creator.includes('<CreatorDialog title="Create Game"'));
  assert.ok(creator.includes('placeholder="For example, S1 Orchestra"'));
  assert.ok(game.includes("mlh-millionaire-creator-resume"));
  assert.ok(creator.includes("Save and Exit"));
  assert.ok(creator.includes("millionaire-creator-inline-hint-editor"));
  assert.ok(creator.includes('editor.style.height = `${editor.scrollHeight}px`'));
  assert.doesNotMatch(creator, /Drag an image or YouTube link here/);
  assert.ok(creator.includes("Add optional media:"));
  assert.ok(creator.includes('src="image.svg"'));
  assert.ok(creator.includes('onClick={() => audioInputRef.current?.click()}'));
  assert.ok(creator.includes('src="audio.svg"'));
  assert.ok(creator.includes('src="youtube.svg"'));
  assert.doesNotMatch(creator, /Choose Files/);
  assert.ok(creator.includes("onDrop={handleDrop}"));
  assert.ok(creator.includes("onPaste={handlePaste}"));
  assert.doesNotMatch(creator, /millionaire-creator-inline-utilities/);
  assert.doesNotMatch(creator, /dialog\?\.type === "hint"/);
  assert.ok(creator.includes("onSelect={setQuestionIndex}"));
  assert.doesNotMatch(creator, /Question \{index \+ 1\} • \{state\.label\}/);
  assert.doesNotMatch(creator, /Play Random Set|Include in random selection|millionaire-random-toggle|toggleRandom|playRandom/);
  assert.doesNotMatch(creator, /millionaire-set-facts/);
  assert.ok(creator.includes("onClick={requestCreate}"));
  assert.ok(creator.includes("importInputRef.current?.click()"));
  assert.doesNotMatch(creator, />Rename<\/button>|type: "rename"|dialog\?\.type === "rename"/);
  for (const icon of ["play.svg", "rename.svg", "copy.svg", "download.svg", "bin.svg"]) assert.ok(creator.includes(`src="${icon}"`));
  for (const label of ["Play", "Edit", "Duplicate", "Download", "Delete"]) assert.ok(creator.includes(`aria-label="${label}"`));
  assert.ok(creator.includes('aria-label="Question set title"'));
  assert.ok(creator.includes("onChange={(event) => setTitleDraft(event.target.value)}"));
  assert.ok(creator.includes('if (event.key === "Enter") event.currentTarget.blur()'));
  assert.ok(creator.includes("millionaire-readiness-tooltip"));
  assert.ok(creator.includes('{incompleteCount === 1 ? "question" : "questions"} incomplete'));
  assert.doesNotMatch(creator, /Number of incomplete questions|Reserve Switch questions/);
  assert.doesNotMatch(creator, /Play is unavailable because/);
  assert.ok(creator.includes("<CreatorFrame popover title=\"Create\""));
  assert.ok(creator.includes('<span className="millionaire-opening-play-label">Back</span>'));
  assert.ok(creator.indexOf("{children}") < creator.indexOf("millionaire-creator-library-back-actions"));
  assert.ok(creator.includes("if (collision)"));
  assert.ok(creator.includes('normaliseSet(set, { regenerateIds: true })'));
  assert.ok(creator.includes('setImported(true)'));
  assert.ok(creator.includes('setTimeout(() => setImported(false), 1000)'));
  assert.doesNotMatch(creator, /Review this package before saving/);
  assert.ok(creator.includes(">Play<") && creator.includes(">Play &amp; Edit<"), "Downloads should offer play-only and editable files.");
  assert.ok(creator.includes('document.addEventListener("pointerdown", dismissDownloadMenu)'), "The download menu should close when the user taps outside it.");
  assert.ok(creator.includes('exportSet(set, undefined, { playOnly: true })'), "The play-only download should be an importable Millionaire game file.");
  assert.ok(creator.includes('!set.playOnly && <button') && creator.includes('if (set.playOnly) throw new Error("This is a play-only game and cannot be edited.")'), "Imported play-only games should not expose editing controls.");
});
