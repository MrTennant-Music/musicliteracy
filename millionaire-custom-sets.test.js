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
  set.questions.push({
    ...customSets.emptyQuestion(16),
    prompt: "Reserve question?",
    answers: ["Reserve A", "Reserve B", "Reserve C", "Reserve D"],
    correctAnswerIndex: 0,
    hint: "Reserve hint",
  });
  return set;
}

test("new custom sets contain exactly 15 stable question slots", () => {
  const set = customSets.createSet("  Classroom Set  ");
  assert.equal(set.title, "Classroom Set");
  assert.equal(set.questions.length, 15);
  assert.equal(new Set(set.questions.map((question) => question.id)).size, 15);
  assert.deepEqual(set.questions.map((question) => question.number), Array.from({ length: 15 }, (_, index) => index + 1));
  const validation = customSets.validateSet(set);
  assert.equal(validation.completeCount, 0);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.field === "reserve"));
});

test("legacy sets with 15 complete main questions remain readable but need a reserve question", () => {
  const set = completeSet("Legacy");
  set.questions = set.questions.slice(0, 15);
  const normalised = customSets.normaliseSet(set);
  const validation = customSets.validateSet(normalised);
  assert.equal(normalised.questions.length, 15);
  assert.equal(validation.mainCompleteCount, 15);
  assert.equal(validation.incompleteCount, 1);
  assert.equal(validation.reserveCount, 0);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.field === "reserve"));
});

test("validation requires four answers, one correct answer and type-specific media", () => {
  const set = completeSet();
  assert.equal(customSets.validateSet(set).valid, true);

  set.questions[3].answers[2] = " ";
  set.questions[6].correctAnswerIndex = null;
  set.questions[8].type = "image";
  set.questions[11].type = "audio";
  const validation = customSets.validateSet(set);

  assert.equal(validation.valid, false);
  assert.equal(validation.completeCount, 12);
  assert.equal(validation.mainCompleteCount, 11);
  assert.equal(validation.reserveCompleteCount, 1);
  assert.equal(validation.incompleteCount, 4);
  assert.ok(validation.issues.some((issue) => issue.message === "Question 4 has an empty answer option."));
  assert.ok(validation.issues.some((issue) => issue.message === "Question 7 has no correct answer."));
  assert.ok(validation.issues.some((issue) => issue.message === "Question 9 requires an image."));
  assert.ok(validation.issues.some((issue) => issue.message === "Question 12 requires audio."));
});

test("validation ignores unfinished extra reserve questions once one reserve is complete", () => {
  const set = completeSet();
  set.questions.push({
    ...customSets.emptyQuestion(17),
    prompt: "Second reserve?",
    answers: ["A", "B", "C", "D"],
    correctAnswerIndex: 1,
    hint: "Second reserve hint",
  });
  let validation = customSets.validateSet(set);
  assert.equal(validation.valid, true);
  assert.equal(validation.reserveCount, 2);
  assert.equal(validation.reserveCompleteCount, 2);

  set.questions[16].prompt = "";
  set.questions[16].hint = "";
  validation = customSets.validateSet(set);
  assert.equal(validation.valid, true);
  assert.equal(validation.reserveCompleteCount, 1);
  assert.equal(validation.incompleteCount, 0);
  assert.equal(validation.issues.length, 0);
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
  source.questions.push({
    ...customSets.emptyQuestion(17),
    prompt: "Second reserve?",
    answers: ["A", "B", "C", "D"],
    correctAnswerIndex: 2,
    hint: "Second reserve hint",
  });

  const exported = await customSets.exportSet(source, JSZip);
  assert.equal(exported.filename, "round-trip.millionaire-set");
  const imported = await customSets.importPackage(exported.blob, JSZip);

  assert.equal(imported.summary.questionCount, 17);
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
  assert.equal(imported.set.questions[15].prompt, "Reserve question?");
  assert.equal(imported.set.questions[16].prompt, "Second reserve?");
});

test("runtime keeps the 15-question ladder separate from all reserve Switch questions", () => {
  const source = completeSet("Runtime");
  source.questions.push({
    ...customSets.emptyQuestion(17),
    prompt: "Second reserve?",
    answers: ["A", "B", "C", "D"],
    correctAnswerIndex: 2,
    hint: "Second reserve hint",
  });
  source.questions.push(customSets.emptyQuestion(18));
  const runtime = customSets.runtimeSet(source);
  assert.equal(runtime.questions.length, 15);
  assert.equal(runtime.reserveQuestions.length, 2);
  assert.equal(runtime.questions.some((question) => question.customReserve), false);
  assert.equal(runtime.reserveQuestions.every((question) => question.customReserve), true);
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
  assert.ok(game.includes("activeCustomSet.reserveQuestions"));
  assert.ok(game.includes("completedStages = []"));
  assert.ok(game.includes("millionaire-prize-completion-tick"));
  assert.ok(game.includes("millionaire-creator-global-toolbar"));
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
  assert.ok(creator.includes("Choose one media type"));
  assert.ok(creator.includes("YouTube video"));
  assert.ok(creator.includes("Switch lifeline preview"));
  assert.ok(creator.includes("Question Bank"));
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
  assert.ok(creator.includes("Delete reserve"));
  assert.ok(creator.includes("millionaire-creator-inline-hint-editor"));
  assert.ok(creator.includes('editor.style.height = `${editor.scrollHeight}px`'));
  assert.ok(creator.includes("Drag an image, audio file or YouTube link here"));
  assert.ok(creator.includes('src="image.svg"'));
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
  assert.ok(creator.includes("Replace Existing Set"));
  assert.ok(creator.includes("Import as a Copy"));
});
