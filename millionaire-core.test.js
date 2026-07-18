const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const CORE = require("./millionaire-core.js");
const BANK = require("./millionaire-question-bank.js");

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

test("prototype bank contains 45 valid, unique National 3 questions", () => {
  assert.equal(BANK.length, 45);
  assert.deepEqual(CORE.validateQuestionBank(BANK), []);
  assert.equal(new Set(BANK.map((question) => question.id)).size, BANK.length);
  assert.deepEqual(Object.fromEntries(CORE.CATEGORIES.map((category) => [category, BANK.filter((question) => question.category === category).length])), {
    listening: 15, literacy: 15, concepts: 15,
  });
});

test("the engine accepts future Hub levels without a rewrite", () => {
  assert.deepEqual(CORE.SUPPORTED_LEVELS, ["N3", "N4", "N5", "H", "AH"]);
  const national4Bank = BANK.map((question) => ({ ...question, id: question.id.replace("n3-", "n4-"), level: "N4" }));
  assert.deepEqual(CORE.validateQuestionBank(national4Bank), []);
  const game = CORE.composeGame(national4Bank, [], seeded(88), { level: "N4" });
  assert.equal(game.length, 15);
  assert.ok(game.every((question) => question.level === "N4"));
});

test("200 generated games meet composition and difficulty rules", () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    const game = CORE.composeGame(BANK, [], seeded(seed));
    assert.equal(game.length, 15);
    assert.equal(new Set(game.map((question) => question.id)).size, 15);
    const counts = Object.fromEntries(CORE.CATEGORIES.map((category) => [category, game.filter((question) => question.category === category).length]));
    assert.deepEqual(counts, CORE.CATEGORY_TARGETS);
    assert.ok(game.slice(10).some((question) => question.category === "listening"));
    assert.ok(game.slice(10).some((question) => question.category === "literacy"));
    game.forEach((question, index) => {
      const stage = index + 1;
      assert.ok(question.difficultyMin <= stage && question.difficultyMax >= stage, `${question.id} is not eligible for stage ${stage}`);
      assert.equal(question.answers.length, 4);
      assert.equal(question.answers.find((answer) => answer.letter === question.correctLetter).originalId, question.correctAnswer);
      if (index >= 2) assert.ok(!(game[index - 2].category === question.category && game[index - 1].category === question.category));
      if (index >= 2) assert.ok(!(game[index - 2].correctLetter === question.correctLetter && game[index - 1].correctLetter === question.correctLetter));
    });
    const answerCounts = Object.fromEntries(CORE.LETTERS.map((letter) => [letter, game.filter((question) => question.correctLetter === letter).length]));
    assert.ok(Math.max(...Object.values(answerCounts)) - Math.min(...Object.values(answerCounts)) <= 1);
    assert.equal(game[14].difficultyMin, 15);
    assert.equal(game[14].difficultyMax, 15);
  }
});

test("recent questions are minimised when eligibility requires gradual reuse", () => {
  const first = CORE.composeGame(BANK, [], seeded(101));
  const second = CORE.composeGame(BANK, [first.map((question) => question.id)], seeded(202));
  const firstIds = new Set(first.map((question) => question.id));
  const repeated = second.filter((question) => firstIds.has(question.id)).length;
  assert.ok(repeated > 0, "The fixed hardest-stage eligibility requires at least one gradual reuse with a 45-question prototype bank.");
  assert.ok(repeated <= 2, `Expected the composer to prefer fresh eligible questions, but it repeated ${repeated}.`);
});

test("invalid questions are excluded without breaking composition", () => {
  const invalid = { ...BANK[0], id: "broken", answers: BANK[0].answers.slice(0, 3) };
  const game = CORE.composeGame([...BANK, invalid], [], seeded(7));
  assert.equal(game.length, 15);
  assert.ok(!game.some((question) => question.id === "broken"));
});

test("50:50 keeps the correct answer and preferred distractor after shuffling", () => {
  const source = BANK.find((question) => question.preferredFiftyFiftyDistractor);
  const shuffled = CORE.shuffledQuestion(source, "D", seeded(4));
  const removed = CORE.fiftyFifty(shuffled, seeded(5));
  assert.equal(removed.length, 2);
  assert.ok(!removed.includes(shuffled.correctLetter));
  const preferred = shuffled.answers.find((answer) => answer.originalId === source.preferredFiftyFiftyDistractor);
  assert.ok(!removed.includes(preferred.letter));
});

test("Switch replaces the current question with an unused question valid for the same stage", () => {
  const game = CORE.composeGame(BANK, [], seeded(44));
  const stage = 7;
  const replacement = CORE.switchQuestion(BANK, game, stage, "N3", seeded(45));
  assert.ok(replacement);
  assert.ok(!game.some((question) => question.id === replacement.id));
  assert.ok(replacement.difficultyMin <= stage && replacement.difficultyMax >= stage);
  assert.equal(replacement.level, "N3");
  assert.equal(replacement.answers.length, 4);
  assert.equal(replacement.answers.find((answer) => answer.letter === replacement.correctLetter).originalId, replacement.correctAnswer);
});

test("audience percentages total 100 and respect 50:50 removals", () => {
  const question = CORE.shuffledQuestion(BANK[0], "C", seeded(9));
  const removed = CORE.fiftyFifty(question, seeded(10));
  for (let stage = 1; stage <= 15; stage += 1) {
    const votes = CORE.audienceVotes(question, stage, removed, seeded(stage));
    assert.equal(Object.values(votes).reduce((sum, value) => sum + value, 0), 100);
    removed.forEach((letter) => assert.equal(votes[letter], 0));
  }
});

test("prize and guaranteed milestone calculations are exact", () => {
  assert.deepEqual(CORE.PRIZE_LADDER, [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]);
  assert.equal(CORE.guaranteedPrize(0), 0);
  assert.equal(CORE.guaranteedPrize(4), 0);
  assert.equal(CORE.guaranteedPrize(5), 1000);
  assert.equal(CORE.guaranteedPrize(9), 1000);
  assert.equal(CORE.guaranteedPrize(10), 32000);
  assert.equal(CORE.guaranteedPrize(15), 32000);
});

test("category results count only attempted records", () => {
  const summary = CORE.categoryResults([
    { category: "listening", correct: true },
    { category: "listening", correct: false },
    { category: "literacy", correct: true },
  ]);
  assert.deepEqual(summary, {
    listening: { correct: 1, attempted: 2 },
    literacy: { correct: 1, attempted: 1 },
    concepts: { correct: 0, attempted: 0 },
  });
});

test("interface includes the required screens, controls and protections", () => {
  const script = fs.readFileSync(path.join(__dirname, "millionaire.js"), "utf8");
  const html = fs.readFileSync(path.join(__dirname, "millionaire.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "millionaire.css"), "utf8");
  const menuScript = fs.readFileSync(path.join(__dirname, "hub-menu.js"), "utf8");
  ["50:50", "Hint", "Switch", "Final Answer", "aria-live", "role=\"dialog\""].forEach((required) => {
    assert.ok(script.includes(required) || html.includes(required), `Missing ${required}`);
  });
  assert.ok(!script.includes("Walk Away"), "Walk Away option should not be shown");
  assert.ok(!script.includes("requestWalkAway"), "Walk Away behaviour should be removed");
  assert.ok(!script.includes("Return to Hub"), "Return to Hub option should not be shown on the results screen");
  assert.ok(!script.includes("Review Answers"), "Review Answers option should not be shown on the results screen");
  assert.ok(script.includes('const [screen, setScreen] = useState("title");'), "A refreshed page should initialise on the title screen.");
  assert.ok(script.includes("Earn medals for reaching question milestones."));
  assert.ok(script.includes('aria-label="Back"'));
  assert.ok(script.includes('className="millionaire-back-icon"'));
  assert.ok(!script.includes("millionaire-back-label"));
  assert.ok(html.includes("shared-notation-config.js"));
  assert.ok(html.includes("hub-shell.js"));
  assert.ok(html.includes("footer.js"));
  assert.ok(script.includes("<window.MLH.LevelButton"));
  [
    'N3: { label: "National 3" }',
    'N4: { label: "National 4", disabled: true }',
    'N5: { label: "National 5", disabled: true }',
    'H: { label: "Higher", disabled: true }',
    'AH: { label: "Advanced Higher", disabled: true }',
  ].forEach((level) => assert.ok(script.includes(level), `Missing level placeholder: ${level}`));
  assert.ok(!script.includes("Prototype available"), "Level rows should not include subtitles.");
  assert.ok(menuScript.includes("const unavailable = Boolean(level.disabled);"), "The shared Level menu should recognise unavailable levels.");
  assert.ok(menuScript.includes("disabled: unavailable"), "Unavailable level placeholders should be disabled.");
  assert.ok(!script.includes("<window.MLH.HelpButton"), "The toolbar Help button should not be shown.");
  assert.ok(!script.includes('label="Reduced motion"'), "The manual Reduced motion setting should not be shown.");
  assert.ok(!script.includes("Listening plays: 3 maximum"), "The listening-play information row should not be shown in Customise.");
  assert.ok(!script.includes("Full screen"), "The Full screen action should not be shown in Customise.");
  assert.ok(!script.includes("Reset recent-question history"), "The question-history reset action should not be shown in Customise.");
  assert.ok(!script.includes("Reset settings to default"), "The settings reset action should not be shown in Customise.");
  assert.ok(script.includes('title="Who Wants to Be a Millionaire?"'), "The page header should include the title question mark.");
  assert.ok(script.includes("<em>Who Wants to Be a Millionaire?</em>"), "The disclaimer should italicise the complete programme title and question mark.");
  assert.ok(script.includes('src="millionairelogo.svg"'), "The opening screen should use millionairelogo.svg.");
  assert.ok(script.includes('<span className="millionaire-opening-play-label">Rules</span>'), "The opening screen should include a Rules button.");
  assert.ok(script.includes('<span className="millionaire-opening-play-label">Start</span>'), "The opening button should read Start.");
  assert.ok(script.indexOf('>Rules</span>') < script.indexOf('>Start</span>'), "Rules should appear to the left of Start.");
  assert.ok(script.includes('onClick={startGame}><span className="millionaire-opening-play-label">Start</span>'), "Start should begin the game immediately.");
  assert.ok(script.includes('if (screen === "rules") return <RulesScreen />;'), "Rules should open in a separate panel.");
  assert.ok(!script.includes('screen === "setup"'), "The old setup step should be removed.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">National 3 prototype</span>'), "The rules panel should not show the prototype label.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">Game rules</span>'), "The rules panel should not show a Game rules badge.");
  assert.ok(script.includes("<h2>RULES</h2>"), "The rules panel heading should read RULES in capitals.");
  assert.ok(!script.includes("Answer 15 increasingly challenging questions to climb the prize ladder and win £1 million."), "The rules panel should not repeat the game objective.");
  assert.ok(!script.includes("millionaire-setup-grid"), "The question-type breakdown should be removed.");
  ["Answer 15 music questions which progressively get more challenging.", "Each question is multiple choice with four possible answers."].forEach((rule) => assert.ok(script.includes(rule), `Missing rules guidance: ${rule}`));
  ["Choose and confirm:", "Milestones:", "Listening questions:"].forEach((oldRule) => assert.ok(!script.includes(oldRule), `Old rules guidance should be removed: ${oldRule}`));
  ["🥉", "🥈", "🥇", "💎"].forEach((glyph) => assert.ok(script.includes(glyph), `Missing reward glyph: ${glyph}`));
  assert.ok(script.includes("[15, 12, 8, 5].map"), "Rules should list rewards for questions 15, 12, 8 and 5.");
  assert.ok(script.includes('className="millionaire-prize-reward"'), "Reward glyphs should appear on the prize ladder.");
  ['src="50.50.svg"', 'src="hint.svg"', 'src="switch.svg"'].forEach((icon) => assert.ok(script.includes(icon), `Missing lifeline rules icon: ${icon}`));
  assert.equal((script.match(/className="millionaire-lifeline-icon"/g) || []).length, 3, "All three in-game lifelines should use SVG icons.");
  ["Removes two incorrect answers.", "Gives you a clue about the question.", "Replaces the current question with another of the same difficulty."].forEach((sentence) => assert.ok(!script.includes(sentence), `Lifeline guidance should not end with a full stop: ${sentence}`));
  assert.ok(script.includes('className="millionaire-back-icon" src="next.svg" alt="" />'), "The Back button should use next.svg as its icon.");
  assert.ok(!script.includes('className="millionaire-primary millionaire-play" onClick={startGame}>Start game</button>'), "The rules panel should not include a Start Game button.");
  assert.ok(script.includes('src="audio-svgrepo-com.svg"'), "The Sound effects setting should use the requested audio icon.");
  assert.ok(script.includes('className="h-[36px] w-[36px] object-contain"'), "The Sound Effects icon should be doubled to 36px.");
  assert.ok(script.includes('label="Sound Effects"'), "The Sound Effects label should use title case.");
  assert.ok(script.includes('const SETTINGS_KEY = "mlh-millionaire-settings-v3";'), "The settings version should apply the new defaults once.");
  assert.match(script, /const DEFAULT_SETTINGS = \{[^}]*soundEffects:\s*true,[^}]*backgroundMusic:\s*true,/s, "Sound Effects and Background Music should both default to on.");
  assert.ok(script.includes('label="Background Music"'), "The Background Music label should use title case.");
  assert.ok(script.includes("Test your musical knowledge and climb the prize ladder to £1 million."), "The opening screen should repeat the page subtitle.");
  assert.match(css, /\.millionaire-opening-copy\s*\{[^}]*font-size:\s*24px;[^}]*white-space:\s*nowrap;/s, "The opening subtitle should be 24px and remain on one line.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*font-size:\s*30px;[^}]*line-height:\s*1;/s, "Only the opening Play label should fill the button height.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;/s, "The opening Play label should be centred inside its button.");
  assert.match(css, /\.millionaire-opening-play-label\s*\{[^}]*transform:\s*translateY\(3px\);/s, "The Conduit Play label should be shifted down for optical centring.");
  assert.match(css, /\.millionaire-opening-actions\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*center;/s, "Rules and Start should sit together on one row.");
  assert.match(css, /\.millionaire-rules-card h2\s*\{[^}]*margin-top:\s*-2px;/s, "The RULES heading should move up by 20px.");
  assert.match(css, /\.millionaire-rules-grid\s*\{[^}]*min-height:\s*320px;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s, "The rules panels should extend upward while keeping their lower alignment.");
  assert.match(css, /\.millionaire-rules-section h3\s*\{[^}]*text-align:\s*center;/s, "Both rules-panel headings should be centred.");
  assert.match(css, /\.millionaire-lifeline-rules\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/s, "The lifeline rules should use three equal columns.");
  assert.match(css, /\.millionaire-lifeline-rule-icon\s*\{[^}]*width:\s*90px;/s, "Lifeline rules icons should be 90px wide.");
  assert.match(css, /\.millionaire-lifeline-icon\s*\{[^}]*width:\s*104px;[^}]*object-fit:\s*contain;/s, "In-game lifeline SVG images should display without cropping.");
  assert.equal((script.match(/className="millionaire-lifeline-badge"/g) || []).length, 3, "Each in-game lifeline should have a shine wrapper.");
  assert.match(css, /\.millionaire-lifeline-badge::after\s*\{[^}]*millionaireLifelineShine 3\.8s/s, "Lifeline badges should use the shine animation.");
  assert.match(css, /\.millionaire-rules-note\s*\{[^}]*margin:\s*auto 0 0;[^}]*font-size:\s*11px;[^}]*opacity:\s*\.6;[^}]*text-align:\s*center;/s, "The one-use note should be small, translucent, centred and anchored to the panel bottom.");
  assert.ok(script.includes("Each lifeline can be used once during the game.</p>"), "The one-use note should end with a full stop.");
  assert.match(css, /\.millionaire-back-icon\s*\{[^}]*width:\s*42px;[^}]*height:\s*42px;/s, "The Back icon should be displayed at the larger size.");
  assert.match(css, /\.millionaire-back-icon\s*\{[^}]*transform:\s*rotate\(180deg\);/s, "The Back icon should point left.");
  assert.match(css, /\.millionaire-game-rules-copy\s*\{[^}]*font-weight:\s*400;/s, "The gameplay description should use regular text.");
  assert.match(css, /\.millionaire-lifeline-rules strong\s*\{[^}]*font-size:\s*16px;/s, "The lifeline names should be larger.");
  assert.match(css, /\.millionaire-lifeline-rules span\s*\{[^}]*font-weight:\s*400;/s, "The lifeline descriptions should use regular text.");
  assert.ok(script.includes('controls={<div className="millionaire-lifelines millionaire-ladder-lifelines"'), "The lifelines should appear above the prize-ladder questions.");
  assert.ok(!script.includes("<h2>Prize ladder</h2>"), "The prize ladder should not show a visible heading.");
  assert.ok(script.includes('className="millionaire-prize-diamond"'), "Prize rows should include a completion diamond.");
  assert.match(css, /\.millionaire-prize-row\.is-complete \.millionaire-prize-diamond, \.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*opacity:\s*1;/s, "Diamonds should show for completed and current questions only.");
  assert.match(css, /\.millionaire-prize-row\.is-current\s*\{[^}]*clip-path:\s*polygon\([^}]*filter:\s*drop-shadow/s, "The current question should use a glowing orange pointed bar.");
  assert.match(css, /\.millionaire-prize-row\.is-reward\s*\{[^}]*color:\s*#fff;/s, "Reward questions should use white text.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"ITC Conduit Pro";[^}]*Conduit ITC Bold\.otf/s, "The game font should load the local ITC Conduit Pro Bold file.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*font-family:\s*"ITC Conduit Pro",\s*sans-serif;/s, "ITC Conduit Pro should be scoped to the game window.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*box-shadow:\s*inset 0 0 80px rgba\(0,0,0,\.68\);/s, "The game window should keep only its inner shading, without a drop shadow.");
  assert.ok(css.includes(".millionaire-toolbar-wrap { padding: 10px 18px 0; }"), "Desktop toolbar spacing should match above and below the buttons.");
  assert.match(css, /\.millionaire-page-content\s*\{[^}]*max-width:\s*1152px;/s, "The game container should align with the shared 1152px header.");
  assert.ok(!script.includes("min-w-[106px]"), "The old level card should not remain in the header.");
  assert.ok(!script.includes("millionaire-question-number"), "The question counter should not be shown above the game.");
  assert.ok(!script.includes("millionaire-current-value"), "The current prize label should not be shown above the game.");
  assert.ok(!script.includes("millionaire-category-chip"), "The category and concept label should not appear above questions.");
  assert.ok(script.includes('<span className="millionaire-final-answer-label">FINAL ANSWER</span>'), "The Final Answer label should be capitalised.");
  assert.match(css, /\.millionaire-final-answer\s*\{[^}]*min-width:\s*220px;[^}]*font-size:\s*26px;[^}]*line-height:\s*1;/s, "The Final Answer label should fill its button.");
  assert.match(css, /\.millionaire-final-answer-label\s*\{[^}]*translateY\(3px\);/s, "The Final Answer label should be optically centred.");
  assert.ok(script.includes('aria-label="Quit game and return to start" onClick={quitGame}>QUIT</button>'), "The active game should include an immediate Quit button.");
  assert.match(script, /function quitGame\(\)\s*\{[^}]*setScreen\("title"\);/s, "Quit should return directly to the title screen.");
  assert.match(css, /\.millionaire-quit\s*\{[^}]*position:\s*absolute;[^}]*left:\s*0;/s, "Quit should sit at the bottom-left of the question area.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto repeat\(15, 32px\) 1fr;/s, "The 15 prize rows should use compact fixed-height spacing.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*min-height:\s*0;/s, "Prize rows should be free to share the full ladder height evenly.");
  assert.ok(script.includes('className="millionaire-question-media"'), "Question media should have a separate area above the question bar.");
  assert.ok(script.includes('className="millionaire-question-rail"'), "The question should use a connected outlined rail.");
  assert.ok(script.includes('className="millionaire-answer-row"'), "Answers should be arranged in two connected rows.");
  assert.match(css, /\.millionaire-question-rail::before\s*\{[^}]*background:\s*#fff;/s, "The question rail should use a white outline colour.");
  assert.match(css, /\.millionaire-question-bar::before\s*\{[^}]*background:\s*#fff;/s, "The question outline should be white.");
  assert.match(css, /\.millionaire-answer-row::before\s*\{[^}]*background:\s*#fff;/s, "Each answer row should use a connected white line.");
  assert.match(css, /\.millionaire-answer::before\s*\{[^}]*background:\s*#fff;/s, "Answer outlines should be white.");
  assert.match(css, /\.millionaire-rules-actions\s*\{[^}]*justify-content:\s*center;/s, "The rules return button should be centred beneath the panels.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 286px;/s, "The restyled prize ladder should have room for larger text.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*radial-gradient\(circle at 112% 48%/s, "The prize ladder should use the flat deep-blue reference treatment with a side glow.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*font-size:\s*26px;/s, "Prize-ladder numbers and values should be larger.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*inset 2px 0 0 #fff;/s, "The prize-ladder divider should be white.");
  assert.match(css, /\.millionaire-ladder-lifelines \.millionaire-lifeline-icon\s*\{[^}]*width:\s*82px;[^}]*height:\s*54px;/s, "The prize-ladder lifelines should be larger.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*padding:\s*0;/s, "The prize ladder should reach the full height and right edge of the game window.");
  assert.match(css, /\.millionaire-play-area\s*\{[^}]*padding:\s*18px 0 18px 18px;/s, "Only the question area should retain the game-grid inset spacing.");
  assert.ok(script.includes('value === 1000000 ? "£1 MILLION"'), "The top prize should display MILLION in capitals on the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*grid-template-columns:\s*30px 12px minmax\(0, 1fr\) 26px;[^}]*column-gap:\s*2px;[^}]*line-height:\s*1\.2;/s, "Prize rows should group the number, diamond and prize closely together.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*display:\s*grid;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*place-items:\s*center;[^}]*align-self:\s*center;[^}]*justify-self:\s*center;/s, "Current and completed question diamonds should be centred in both directions.");
  assert.ok(script.includes('className="millionaire-answer-content"'), "Each answer should keep its diamond, letter and text together.");
  assert.ok(script.includes('className="millionaire-answer-diamond"'), "Each answer should begin with a diamond.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*font-size:\s*clamp\(22px, 2\.1vw, 31px\);/s, "Answer text should match the responsive question font size.");
  assert.match(css, /\.millionaire-answer-diamond\s*\{[^}]*vertical-align:\s*middle;/s, "Answer diamonds should be vertically centred with the text.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold";[^}]*Copperplate-Gothic-Std-33-BC\.ttf/s, "The local Copperplate Gothic ExtraBold font should be loaded.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold",\s*serif;/s, "Copperplate Gothic ExtraBold should be scoped to the prize-ladder sidebar.");
  assert.match(css, /\.millionaire-answer::after\s*\{[^}]*radial-gradient\(circle at 112% 48%, rgba\(72,132,255,\.75\)[^}]*linear-gradient\(90deg, #02051d 0%, #070b4b 58%, #123c9c 100%\);/s, "Answer boxes should use the same gradient colours as the sidebar.");
  assert.ok(!script.includes("beforeunload"), "Browser refresh should not be blocked during an active game.");
  assert.ok(!script.includes("Ask the Audience"), "Ask the Audience should be replaced by Switch.");
  assert.ok(script.includes('src="50.50.svg"') && script.includes('src="hint.svg"') && script.includes('src="switch.svg"'), "The three lifelines should use the supplied SVG icons.");
  assert.match(script, /function useSwitch\(\)\s*\{[^}]*CORE\.switchQuestion\(QUESTION_BANK, questions, currentIndex \+ 1, question\.level\)/s, "Switch should request a replacement for the current difficulty stage.");
  assert.ok(script.includes("Replaces the current question with another of the same difficulty"), "The rules should explain the Switch lifeline.");
});
