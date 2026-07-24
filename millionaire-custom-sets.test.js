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
  assert.equal(customSets.MAX_VARIANTS, 4);
  assert.equal(set.variants.every((variants) => variants.length === 1), true);
  assert.equal(new Set(set.questions.map((question) => question.id)).size, 15);
  assert.deepEqual(set.questions.map((question) => question.number), Array.from({ length: 15 }, (_, index) => index + 1));
  const validation = customSets.validateSet(set);
  assert.equal(validation.completeCount, 0);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.field === "variants"));
});

test("legacy sets receive an empty Variant 1 and discard Question Bank entries", () => {
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

test("validation requires four answers, one correct answer and type-specific media", () => {
  const question = customSets.emptyQuestion(1);
  assert.ok(customSets.validateQuestion(question).length > 0);
  const complete = { ...question, prompt: "Question", hint: "Hint", answers: ["A", "B", "C", "D"], correctAnswerIndex: 0 };
  assert.equal(customSets.validateQuestion(complete).length, 0);
  assert.ok(customSets.validateQuestion({ ...complete, type: "image" }).some((issue) => issue.field === "image"));
});

test("a set needs two complete variants for every ladder question", () => {
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
});

test("runtime keeps each ladder question's variants together for the Switch lifeline", () => {
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
  assert.ok(html.includes("./millionaire-creator.js"));
  assert.ok(html.includes("./vendor/jszip/jszip.min.js"));
  assert.doesNotMatch(html, /https?:\/\/(?:cdn\.tailwindcss\.com|unpkg\.com)/);
  assert.ok(game.includes(">Create</"));
  assert.doesNotMatch(game, /millionaire-create-questions-menu/);
  assert.ok(game.includes("MILLIONAIRE_CUSTOM_SETS.runtimeSet(set)"));
  assert.ok(game.includes('<window.MillionaireCreator'));
  assert.ok(game.includes("activeCustomSet.variants"));
  assert.ok(game.includes("completedStages = []"));
  assert.ok(game.includes("millionaire-prize-completion-tick"));
  assert.ok(game.includes("millionaire-creator-global-toolbar"));
  assert.ok(creator.includes('millionaire-setup-card millionaire-rules-card millionaire-creator-library-card'));
  assert.ok(creator.includes("download your game file and share it with students."));
  assert.ok(creator.includes('const enterEditor = () => {') && creator.includes('onEditingChange?.(true);') && creator.includes('enterEditor();'), "The editor should enable its toolbar placeholders before opening or restoring an editor.");
  assert.doesNotMatch(creator, /millionaire-creator-toolbar-clear/);
  assert.ok(creator.includes('millionaire-creator-variant-bar') && creator.includes('aria-label="Add variant"'), "Variants should be managed beneath the question editor.");
  assert.ok(creator.includes('millionaire-creator-toolbar-customise') && creator.includes('millionaire-creator-shuffle-toggle'), "Shuffle should be available from the Customise menu.");
  assert.ok(creator.includes('aria-label={`Clear ${label}`}') && creator.includes('onClearVariant={clearQuestion}'), "Each populated variant should offer a clear-content bin.");
  assert.ok(game.includes('screen === "creator" && !creatorEditing'));
  assert.doesNotMatch(game, /Boolean\(activeCustomSet\)/);
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
  assert.ok(creator.includes("Randomly choose between the original question and its variants"));
  assert.ok(creator.includes("mlh-millionaire-creator-resume"));
  assert.ok(creator.includes("restoredQuestionIndex"));
  assert.ok(creator.includes("Import Game"));
  assert.ok(creator.includes("Create Game"));
  assert.ok(creator.includes('<CreatorDialog title="Create Game"'));
  assert.ok(creator.includes('placeholder="For example, S1 Orchestra"'));
  assert.ok(game.includes("mlh-millionaire-creator-resume"));
  assert.ok(creator.includes('src="save.svg"'));
  assert.ok(creator.includes('"Save"'));
  assert.ok(creator.includes('saveConfirmationTimerRef'));
  assert.ok(creator.includes('"Saved!"'));
  assert.ok(creator.includes(">Exit</"));
  assert.ok(creator.includes("millionaire-creator-inline-hint-editor"));
  assert.ok(creator.includes('editor.style.height = `${editor.scrollHeight}px`'));
  assert.doesNotMatch(creator, /Drag an image or YouTube link here/);
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
});
