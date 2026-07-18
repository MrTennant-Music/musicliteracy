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
  assert.ok(script.includes('const [hintVisible, setHintVisible] = useState(false);'), "Hint visibility should be managed inside the question screen.");
  assert.ok(script.includes('setHintVisible(true);') && script.includes('setAnnouncement(`Hint: ${question.tip}`);'), "Using Hint should reveal and announce the in-page clue.");
  assert.ok(script.includes('{hintVisible && <div className="millionaire-inline-hint" role="note"><strong>Hint</strong><span>{question.tip}</span></div>}'), "The hint should appear at the top of the question panel.");
  assert.ok(!script.includes('dialog?.type === "hint"'), "Hint should not use a popover dialog.");
  assert.match(script, /function resetQuestionState\(\)\s*\{[^}]*setHintVisible\(false\);/s, "Changing questions should hide the current hint.");
  assert.match(script, /function lockAnswer\(\)\s*\{[^}]*setHintVisible\(false\);/s, "Answering should hide the current hint.");
  assert.ok(script.includes("Earn medals for correctly answering the following questions:"));
  assert.ok(!script.includes('className="millionaire-rewards-heading"'), "The redundant Rewards heading should be removed.");
  assert.ok(script.includes('onClick={() => setScreen("title")}><span className="millionaire-back-button-label">Back</span></button>'), "The rules button should show Back in title case.");
  assert.ok(!script.includes('className="millionaire-back-icon"'), "The rules Back button should not show an icon.");
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
  assert.ok(script.includes('<span className="millionaire-opening-play-label">How to Play</span>'), "The opening screen should include a How to Play button.");
  assert.ok(script.includes('<span className="millionaire-opening-play-label">Start</span>'), "The opening button should read Start.");
  assert.ok(script.indexOf('>Rules</span>') < script.indexOf('>Start</span>'), "Rules should appear to the left of Start.");
  assert.ok(script.includes('onClick={startGame}><span className="millionaire-opening-play-label">Start</span>'), "Start should begin the game immediately.");
  assert.ok(script.includes('if (screen === "rules") return <RulesScreen />;'), "Rules should open in a separate panel.");
  assert.ok(!script.includes('screen === "setup"'), "The old setup step should be removed.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">National 3 prototype</span>'), "The rules panel should not show the prototype label.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">Game rules</span>'), "The rules panel should not show a Game rules badge.");
  assert.ok(script.includes("<h2>How to Play</h2>"), "The instructions panel heading should match the How to Play button.");
  assert.ok(!script.includes("Answer 15 increasingly challenging questions to climb the prize ladder and win £1 million."), "The rules panel should not repeat the game objective.");
  assert.ok(!script.includes("millionaire-setup-grid"), "The question-type breakdown should be removed.");
  ["Answer 15 music questions which progressively get more challenging.", "Each question is multiple choice with four possible answers."].forEach((rule) => assert.ok(script.includes(rule), `Missing rules guidance: ${rule}`));
  assert.ok(script.includes('<div className="millionaire-game-rules-copy millionaire-lifeline-intro"><p>If you get stuck on a question, you can use a lifeline:</p></div>'), "The Lifelines introduction should lead into the choices with a colon.");
  ["Choose and confirm:", "Milestones:", "Listening questions:"].forEach((oldRule) => assert.ok(!script.includes(oldRule), `Old rules guidance should be removed: ${oldRule}`));
  ['icon: "bronze.svg", label: "Bronze medal", tier: "bronze"', 'icon: "silver.svg", label: "Silver medal", tier: "silver"', 'icon: "gold.svg", label: "Gold medal", tier: "gold"', 'icon: "diamond.svg", label: "Diamond", tier: "diamond"'].forEach((reward) => assert.ok(script.includes(reward), `Missing reward details: ${reward}`));
  assert.ok(script.includes("[15, 12, 8, 5].map"), "Rules should list rewards for questions 15, 12, 8 and 5.");
  assert.ok(script.includes('className="millionaire-reward-icon" src={QUESTION_REWARDS[stage].icon}'), "Rules rewards should use the supplied SVG medal artwork.");
  assert.ok(script.includes('className={`millionaire-reward-label is-${QUESTION_REWARDS[stage].tier}`}>Question {stage}</span>'), "Reward rows should show each medal directly beside its full Question label.");
  assert.ok(!script.includes('millionaire-reward-diamond'), "Reward rows should not include a diamond between the medal and Question label.");
  assert.ok(script.includes('className="millionaire-prize-reward" src={reward.icon} alt={reward.label}'), "Reward SVGs should appear beside their prize values on the ladder.");
  ['src="50.50.svg"', 'src="hint.svg"', 'src="switch.svg"'].forEach((icon) => assert.ok(script.includes(icon), `Missing lifeline rules icon: ${icon}`));
  assert.equal((script.match(/className="millionaire-lifeline-icon"/g) || []).length, 3, "All three in-game lifelines should use SVG icons.");
  ["Removes two incorrect answers.", "Guides you towards the correct answer with some helpful tips.", "Switch your current question to a different question."].forEach((sentence) => assert.ok(!script.includes(sentence), `Lifeline guidance should not end with a full stop: ${sentence}`));
  assert.ok(script.includes("Guides you towards the correct answer with some helpful tips"), "The Hint rules should use the requested wording.");
  assert.ok(!script.includes('className="millionaire-primary millionaire-play" onClick={startGame}>Start game</button>'), "The rules panel should not include a Start Game button.");
  assert.ok(script.includes('src="audio-svgrepo-com.svg"'), "The Sound effects setting should use the requested audio icon.");
  assert.ok(script.includes('className="h-[36px] w-[36px] object-contain"'), "The Sound Effects icon should be doubled to 36px.");
  assert.ok(script.includes('label="Sound Effects"'), "The Sound Effects label should use title case.");
  assert.ok(script.includes('const SETTINGS_KEY = "mlh-millionaire-settings-v3";'), "The settings version should apply the new defaults once.");
  assert.match(script, /const DEFAULT_SETTINGS = \{[^}]*soundEffects:\s*true,[^}]*backgroundMusic:\s*true,/s, "Sound Effects and Background Music should both default to on.");
  assert.ok(script.includes('label="Background Music"'), "The Background Music label should use title case.");
  assert.ok(script.includes("Test your musical knowledge and climb the prize ladder to £1 million."), "The opening screen should repeat the page subtitle.");
  assert.match(css, /\.millionaire-opening-copy\s*\{[^}]*font-size:\s*24px;[^}]*white-space:\s*nowrap;/s, "The opening subtitle should be 24px and remain on one line.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*font-size:\s*30px;[^}]*line-height:\s*1;[^}]*text-transform:\s*none;/s, "Opening Rules and Start should use title case and fill their button height.");
  assert.match(css, /\.millionaire-opening-play\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;/s, "The opening Play label should be centred inside its button.");
  assert.match(css, /\.millionaire-opening-play-label\s*\{[^}]*transform:\s*translateY\(3px\);/s, "The Conduit Play label should be shifted down for optical centring.");
  assert.ok(script.includes('<span className="millionaire-back-button-label">Back</span>'), "The rules Back button should use a separately aligned title-case label.");
  assert.match(css, /\.millionaire-back-button\s*\{[^}]*text-transform:\s*none;/s, "The Back button should preserve its title-case label.");
  assert.match(css, /\.millionaire-back-button-label\s*\{[^}]*font-size:\s*30px;[^}]*line-height:\s*1;[^}]*transform:\s*translateY\(3px\);/s, "The Back label should match the Start label and remain optically centred.");
  assert.match(css, /\.millionaire-opening-actions\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*center;/s, "Rules and Start should sit together on one row.");
  assert.match(css, /\.millionaire-rules-card h2\s*\{[^}]*margin-top:\s*-2px;/s, "The RULES heading should move up by 20px.");
  assert.match(css, /\.millionaire-rules-grid\s*\{[^}]*min-height:\s*320px;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s, "The rules panels should extend upward while keeping their lower alignment.");
  assert.match(css, /\.millionaire-rules-section h3\s*\{[^}]*text-align:\s*center;/s, "Both rules-panel headings should be centred.");
  assert.match(css, /\.millionaire-lifeline-rules\s*\{[^}]*flex:\s*1;[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);[^}]*align-items:\s*center;[^}]*translateY\(-15px\);/s, "The lifeline rules should use three equal columns and sit 15px higher.");
  assert.match(css, /\.millionaire-lifeline-rule-icon\s*\{[^}]*width:\s*90px;[^}]*height:\s*55px;/s, "Lifeline rules icons should stay tightly fitted to the SVG artwork.");
  assert.match(css, /\.millionaire-lifeline-rule-badge\s*\{[^}]*margin:\s*0;/s, "Lifeline badges should not introduce different vertical spacing.");
  assert.match(css, /\.millionaire-lifeline-rules li\s*\{[^}]*display:\s*grid;[^}]*height:\s*164px;[^}]*grid-template-rows:\s*55px 21px 1fr;[^}]*justify-items:\s*center;[^}]*row-gap:\s*5px;/s, "All three lifeline columns should align their icons, titles and descriptions on shared rows.");
  assert.match(css, /\.millionaire-lifeline-icon\s*\{[^}]*width:\s*104px;[^}]*object-fit:\s*contain;/s, "In-game lifeline SVG images should display without cropping.");
  assert.equal((script.match(/className="millionaire-lifeline-badge"/g) || []).length, 3, "Each in-game lifeline should have a shine wrapper.");
  assert.match(css, /\.millionaire-lifeline-badge::after\s*\{[^}]*millionaireLifelineShine 3\.8s/s, "Lifeline badges should use the shine animation.");
  assert.match(css, /\.millionaire-rules-note\s*\{[^}]*margin:\s*auto 0 0;[^}]*font-size:\s*11px;[^}]*opacity:\s*\.6;[^}]*text-align:\s*center;/s, "The one-use note should be small, translucent, centred and anchored to the panel bottom.");
  assert.ok(script.includes("Each lifeline can only be used once during a game.</p>"), "The one-use note should use the requested wording.");
  assert.match(css, /\.millionaire-rewards-list li\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*gap:\s*\.25em;/s, "Reward medals and Question labels should share one centred row with one text-space between them.");
  [["diamond", "#06b6d4"], ["gold", "#eab308"], ["silver", "#64748b"], ["bronze", "#b45309"]].forEach(([tier, colour]) => assert.match(css, new RegExp(`\\.millionaire-reward-label\\.is-${tier}\\s*\\{[^}]*color:\\s*${colour};`), `${tier} reward text should use the shared medal colour.`));
  assert.match(css, /\.millionaire-rewards-list\s*\{[^}]*color:\s*#dbeafe;[^}]*font-family:\s*Arial, sans-serif;[^}]*font-size:\s*15px;[^}]*font-weight:\s*400;[^}]*line-height:\s*1\.3;/s, "Reward labels should match the 15px gameplay sentence.");
  assert.match(css, /\.millionaire-reward-icon\s*\{[^}]*width:\s*15px;[^}]*height:\s*15px;[^}]*object-fit:\s*contain;/s, "Reward SVGs should match the 15px label size and align with their text.");
  assert.match(css, /\.millionaire-reward-label\s*\{[^}]*width:\s*84px;[^}]*white-space:\s*nowrap;/s, "Each reward Question label should remain on one line.");
  assert.match(css, /\.millionaire-game-rules-copy\s*\{[^}]*font-weight:\s*400;/s, "The gameplay description should use regular text.");
  assert.match(css, /\.millionaire-lifeline-rules strong\s*\{[^}]*font-size:\s*16px;/s, "The lifeline names should be larger.");
  assert.match(css, /\.millionaire-lifeline-rules span\s*\{[^}]*font-weight:\s*400;/s, "The lifeline descriptions should use regular text.");
  assert.ok(script.includes('controls={<div className="millionaire-lifelines millionaire-ladder-lifelines"'), "The lifelines should appear above the prize-ladder questions.");
  assert.ok(!script.includes("<h2>Prize ladder</h2>"), "The prize ladder should not show a visible heading.");
  assert.ok(script.includes('className="millionaire-prize-diamond"'), "Prize rows should include a completion diamond.");
  assert.match(css, /\.millionaire-prize-row\.is-complete \.millionaire-prize-diamond, \.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*opacity:\s*1;/s, "Diamonds should show for completed and current questions only.");
  assert.match(css, /\.millionaire-prize-row\.is-current\s*\{[^}]*clip-path:\s*polygon\([^}]*filter:\s*drop-shadow/s, "The current question should use a glowing orange pointed bar.");
  assert.match(css, /\.millionaire-primary\s*\{[^}]*background:\s*linear-gradient\(#ffe9a5, #e9a832\);/s, "Primary Start and Final Answer buttons should retain their original gold gradient.");
  assert.match(css, /\.millionaire-answer-letter\s*\{[^}]*color:\s*#f6c453;/s, "Answer letters should use the original gold.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*color:\s*#f6c453;/s, "Standard prize-ladder numbers and amounts should use the original gold.");
  assert.match(css, /\.millionaire-prize-row\.is-reward\s*\{[^}]*color:\s*#fff;/s, "Reward questions should use their original white text.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"ITC Conduit Pro";[^}]*Conduit ITC Bold\.otf/s, "The game font should load the local ITC Conduit Pro Bold file.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*font-family:\s*"ITC Conduit Pro",\s*sans-serif;/s, "ITC Conduit Pro should be scoped to the game window.");
  assert.match(css, /\.millionaire-board\s*\{[^}]*box-shadow:\s*inset 0 0 80px rgba\(0,0,0,\.68\);/s, "The game window should keep only its inner shading, without a drop shadow.");
  assert.ok(css.includes(".millionaire-toolbar-wrap { padding: 10px 18px 0; }"), "Desktop toolbar spacing should match above and below the buttons.");
  assert.match(css, /\.millionaire-page-content\s*\{[^}]*max-width:\s*1152px;/s, "The game container should align with the shared 1152px header.");
  assert.ok(!script.includes("min-w-[106px]"), "The old level card should not remain in the header.");
  assert.ok(!script.includes("millionaire-question-number"), "The question counter should not be shown above the game.");
  assert.ok(!script.includes("millionaire-current-value"), "The current prize label should not be shown above the game.");
  assert.ok(!script.includes("millionaire-category-chip"), "The category and concept label should not appear above questions.");
  assert.ok(script.includes('<span className="millionaire-final-answer-label">Final Answer</span>'), "The Final Answer label should use title case.");
  assert.ok(script.includes('onClick={resetGame}><span className="millionaire-final-answer-label">Exit</span>'), "The Review screen should offer an Exit button matching the Review action and returning to the opening screen.");
  assert.ok(!script.includes("Concepts answered incorrectly:") && !script.includes("millionaire-concept-misses"), "The Review screen should not show a separate incorrectly answered concepts panel.");
  assert.match(css, /\.millionaire-final-answer\s*\{[^}]*min-width:\s*220px;[^}]*font-size:\s*26px;[^}]*line-height:\s*1;/s, "The Final Answer label should fill its button.");
  assert.ok(script.includes('className="millionaire-actions millionaire-final-answer-actions"'), "The Final Answer row should have dedicated spacing.");
  assert.match(css, /\.millionaire-final-answer-actions\s*\{[^}]*padding-top:\s*14px;/s, "The existing 14px grid gap plus 14px top padding should create 28px above Final Answer.");
  assert.match(css, /\.millionaire-final-answer-label\s*\{[^}]*translateY\(3px\);/s, "The Final Answer label should be optically centred.");
  assert.ok(script.includes('aria-label="Reset game and return to opening screen" disabled={screen !== "game"} onClick={resetGame}'), "Reset should remain visible but be disabled outside the active question screen.");
  assert.ok(script.includes('src="restart.svg" alt="" className="h-[16px] w-[16px]"') && script.includes('>Reset</span>'), "Reset should use a small 16px restart icon and title-case label.");
  assert.match(css, /\.millionaire-toolbar-reset:disabled\s*\{[^}]*cursor:\s*not-allowed;[^}]*filter:\s*grayscale\(1\);[^}]*opacity:\s*\.42;/s, "Unavailable Reset buttons should appear greyed out.");
  assert.match(script, /function resetGame\(\)\s*\{[^}]*setScreen\("title"\);/s, "Reset should return directly to the opening screen.");
  assert.ok(!script.includes("millionaire-quit") && !script.includes(">QUIT</button>"), "The old bottom-left Quit button should be removed.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto repeat\(15, minmax\(0, 1fr\)\);/s, "The 15 prize rows should expand evenly to fill the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*min-height:\s*0;/s, "Prize rows should be free to share the full ladder height evenly.");
  assert.ok(script.includes('className="millionaire-question-media"'), "Question media should have a separate area above the question bar.");
  assert.ok(script.includes('className="millionaire-question-rail"'), "The question should use a connected outlined rail.");
  assert.ok(script.includes('className="millionaire-answer-row"'), "Answers should be arranged in two connected rows.");
  assert.match(css, /\.millionaire-question-rail::before\s*\{[^}]*background:\s*#fff;/s, "The question rail should use a white outline colour.");
  assert.match(css, /\.millionaire-inline-hint\s*\{[^}]*width:\s*min\(560px, calc\(100% - 40px\)\);[^}]*justify-content:\s*center;[^}]*text-align:\s*center;/s, "The in-page hint should be centred at the top of the question area.");
  assert.match(css, /\.millionaire-question-bar::before\s*\{[^}]*background:\s*#fff;/s, "The question outline should be white.");
  assert.match(css, /\.millionaire-question-bar\s*\{[^}]*width:\s*100%;/s, "The question bar should reach the same left and right endpoints as the answer rows.");
  assert.match(css, /\.millionaire-question-bar::after\s*\{[^}]*radial-gradient\(circle at 112% 48%, rgba\(72,132,255,\.75\)[^}]*linear-gradient\(90deg, #02051d 0%, #070b4b 58%, #123c9c 100%\);/s, "The question bar should match the answer-button gradient.");
  assert.match(css, /\.millionaire-answer-row::before\s*\{[^}]*background:\s*#fff;/s, "Each answer row should use a connected white line.");
  assert.match(css, /\.millionaire-answer::before\s*\{[^}]*background:\s*#fff;/s, "Answer outlines should be white.");
  assert.match(css, /\.millionaire-rules-actions\s*\{[^}]*justify-content:\s*center;/s, "The rules return button should be centred beneath the panels.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) 286px;/s, "The restyled prize ladder should have room for larger text.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;[^}]*radial-gradient\(circle at 112% 48%/s, "The prize ladder should use the flat deep-blue reference treatment with a side glow.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*font-size:\s*26px;/s, "Prize-ladder numbers and values should be larger.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*inset 2px 0 0 #fff;/s, "The prize-ladder divider should be white.");
  assert.match(css, /\.millionaire-ladder-lifelines \.millionaire-lifeline-icon\s*\{[^}]*width:\s*82px;[^}]*height:\s*54px;/s, "The prize-ladder lifelines should be larger.");
  assert.match(css, /\.millionaire-game-grid\s*\{[^}]*padding:\s*0;/s, "The prize ladder should reach the full height and right edge of the game window.");
  assert.match(css, /\.millionaire-play-area\s*\{[^}]*padding:\s*18px;/s, "The question area should retain even internal spacing without clipping its controls.");
  assert.match(css, /\.millionaire-play-area::before\s*\{[^}]*background:\s*url\("\.\/background-lossless\.webp"\) center \/ cover no-repeat;[^}]*filter:\s*blur\(3px\);/s, "The question-and-answer area should use the softly blurred, optimised stage background behind all elements and up to the divider.");
  assert.ok(fs.existsSync(path.join(__dirname, "background-lossless.webp")), "The lossless compressed stage background should be present.");
  assert.ok(script.includes("this.scheduleEarlyStart(8000, questionPath, sequence)"), "The Questions 1–5 music should begin eight seconds after Start is pressed.");
  assert.ok(script.includes("const fadeSeconds = 5"), "The Questions 1–5 loop should crossfade during its final five seconds.");
  assert.ok(script.includes("this.playMusicSequence(stageFiles[0], stageFiles[1], false, 5)"), "Every £2,000–£1 million question track should use a five-second crossfade loop.");
  assert.match(script, /playMusicSequence\(firstPath, nextPath, nextLoops = true, crossfadeSeconds = 0\)[\s\S]*waitForIntro: true[\s\S]*first\.addEventListener\("ended"[\s\S]*this\.startEarlyQuestionLoop\(nextPath, sequence\);/, "The Let's Play introduction should finish before the crossfading question loop begins.");
  assert.ok(script.includes("this.fadeOutMusicForExcerpt(.5, startExcerpt)"), "Question music should fade out for half a second before an excerpt begins.");
  assert.ok(script.includes("this.fadeInMusicAfterExcerpt(.5)"), "Question music should fade back in for half a second after an excerpt ends.");
  assert.ok(script.includes("return totalDuration + .62"), "Excerpt progress should include the half-second fade before playback.");
  assert.doesNotMatch(script, /nextCorrect === 5 \|\| nextCorrect === 10/, "The £1,000 and £32,000 milestones should not interrupt the question sequence.");
  assert.match(script, /if \(currentIndex === 14\)[\s\S]*setScreen\("milestone"\);[\s\S]*else \{\s*goToQuestion\(currentIndex \+ 1\);/, "Only the £1 million win should open the celebration screen.");
  assert.ok(script.includes("<h2>You win £1 million!</h2>") && !script.includes("<h2>{milestone?.victory"), "The remaining celebration screen should be exclusively for the £1 million win.");
  assert.match(script, /function finalAnswerDelay\(stage\)\s*\{\s*if \(stage <= 5\) return 2000;\s*if \(stage <= 8\) return 3000;\s*if \(stage <= 12\) return 4000;\s*return 5000;\s*\}/s, "Final Answer reveals should use the confirmed 2, 3, 4 and 5 second question bands.");
  assert.match(script, /playFinalAnswer\(stage\)\s*\{[^}]*this\.playEffect\(path\);[^}]*window\.setTimeout\(\(\) => \{\s*this\.stopEffect\(\);\s*resolve\(\);\s*\}, finalAnswerDelay\(stage\)\);/s, "The Final Answer audio should be stopped at the fixed reveal delay instead of playing to completion.");
  assert.ok(script.includes('path === window.MILLIONAIRE_SOUND_CONFIG.earlyCorrect') && script.includes('shortenEarlyCorrect ? { shortenBy: 3, fadeSeconds: 1 } : undefined'), "Only correct 1-5.ogg should fade for one second and stop three seconds early.");
  assert.ok(script.includes('className="millionaire-skip-correct-overlay"') && script.includes("audioDirector.current.stopEffect();"), "A click or tap anywhere should skip the remaining correct-answer reveal.");
  assert.match(css, /\.millionaire-skip-correct-overlay\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*1250;[^}]*inset:\s*0;[^}]*background:\s*transparent;/s, "The correct-answer skip target should cover the whole viewport without changing its appearance.");
  assert.ok(script.includes('value === 1000000 ? "£1 MILLION"'), "The top prize should display MILLION in capitals on the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*grid-template-columns:\s*30px 12px minmax\(0, 1fr\);[^}]*column-gap:\s*4px;[^}]*line-height:\s*1\.2;/s, "Prize rows should leave equal breathing room on both sides of the diamond.");
  assert.match(css, /\.millionaire-prize-number\s*\{[^}]*text-align:\s*right;[^}]*translateX\(5px\);/s, "Prize question numbers should be optically spaced equally from the diamond and amount.");
  assert.match(css, /\.millionaire-prize-value-wrap\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*gap:\s*6px;/s, "Reward SVGs should sit immediately beside their prize values.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*display:\s*grid;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*place-items:\s*center;[^}]*align-self:\s*center;[^}]*justify-self:\s*center;[^}]*font-size:\s*11px;/s, "Current and completed question diamonds should be larger and centred in both directions.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*transform:\s*translateX\(1px\);/s, "Every prize-ladder diamond should include the additional half-pixel right shift.");
  assert.ok(script.includes('<AutoFitAnswer answer={answer} />'), "Each answer should use automatic single-line text fitting.");
  assert.match(css, /\.millionaire-answer\.is-removed\s*\{[^}]*pointer-events:\s*none;[^}]*\}/s, "50:50 removed choices should retain their answer containers but remain non-interactive.");
  assert.match(css, /\.millionaire-answer\.is-removed \.millionaire-answer-content, \.millionaire-answer\.is-removed \.millionaire-answer-status\s*\{[^}]*visibility:\s*hidden;/s, "50:50 should hide only the removed choice's diamond and text.");
  assert.ok(script.includes("content.scrollWidth > content.clientWidth") && script.includes("fontSize -= .5"), "Long answers should reduce in size until they fit.");
  assert.ok(script.includes('className="millionaire-answer-diamond"'), "Each answer should begin with a diamond.");
  assert.match(css, /\.millionaire-answer\s*\{[^}]*height:\s*48px;[^}]*min-height:\s*48px;/s, "Answer boxes should be two-thirds of the 72px question-box height.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*font-size:\s*clamp\(18px, 1\.75vw, 24px\);[^}]*line-height:\s*1;/s, "Answer text should fit cleanly inside the half-height boxes.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*translateY\(2px\);/s, "Answer text should remain optically centred in the shorter boxes.");
  assert.match(css, /\.millionaire-answer-diamond\s*\{[^}]*font-size:\s*\.62em;[^}]*vertical-align:\s*middle;[^}]*\}/s, "Answer diamonds should be larger and vertically centred with the shifted text.");
  assert.doesNotMatch(css, /\.millionaire-answer-diamond\s*\{[^}]*translateY\(-/s, "Answer diamonds should no longer be shifted upward.");
  assert.match(css, /\.millionaire-answer-status\s*\{[^}]*position:\s*absolute;[^}]*width:\s*1px;[^}]*height:\s*1px;[^}]*overflow:\s*hidden;/s, "Correct and incorrect answer status should remain available to assistive technology without showing a tick or cross.");
  assert.ok(!script.includes('isCorrect ? "✓"') && !script.includes('isIncorrect ? "✕"'), "Revealed answers should not display tick or cross symbols.");
  assert.ok(script.includes('revealed === "correct" ? "is-correct-selection" : "is-correct-reveal"'), "Correct selections and corrected wrong answers should use distinct flash treatments.");
  assert.match(css, /\.millionaire-answer\.is-incorrect::before\s*\{\s*background:\s*#ffe38b;\s*\}[\s\S]*\.millionaire-answer\.is-incorrect::after\s*\{\s*background:\s*#c37a0c;/, "A pupil's wrong selection should remain orange rather than turning red.");
  assert.match(css, /\.millionaire-answer\.is-correct-selection::after\s*\{\s*animation:\s*millionaireCorrectFillOrange 1s linear;/, "A correct selection should flash green and orange for one second.");
  assert.match(css, /\.millionaire-answer\.is-correct-reveal::after\s*\{\s*animation:\s*millionaireCorrectFillBlue 1s linear;/, "The actual answer after a wrong selection should flash green and blue for one second.");
  assert.match(css, /@keyframes millionaireCorrectFillOrange[\s\S]*100%\s*\{\s*background:\s*#15803d;/, "Correct-answer flashes should finish on green.");
  assert.ok(script.includes("const answerDisabled = locked || transitioning || removed;") && script.includes("disabled={answerDisabled}"), "Answers should remain enabled while a musical excerpt is playing.");
  assert.doesNotMatch(script, /const answerDisabled\s*=\s*[^;]*audioPlaying/, "Excerpt playback must never disable the answer buttons.");
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold";[^}]*Copperplate-Gothic-Std-33-BC\.ttf/s, "The local Copperplate Gothic ExtraBold font should be loaded.");
  assert.match(css, /\.millionaire-ladder\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold",\s*serif;/s, "Copperplate Gothic ExtraBold should be scoped to the prize-ladder sidebar.");
  assert.match(css, /\.millionaire-answer::after\s*\{[^}]*radial-gradient\(circle at 112% 48%, rgba\(72,132,255,\.75\)[^}]*linear-gradient\(90deg, #02051d 0%, #070b4b 58%, #123c9c 100%\);/s, "Answer boxes should use the same gradient colours as the sidebar.");
  assert.ok(!script.includes("beforeunload"), "Browser refresh should not be blocked during an active game.");
  assert.ok(!script.includes("Ask the Audience"), "Ask the Audience should be replaced by Switch.");
  assert.ok(script.includes('src="50.50.svg"') && script.includes('src="hint.svg"') && script.includes('src="switch.svg"'), "The three lifelines should use the supplied SVG icons.");
  assert.match(script, /function useSwitch\(\)\s*\{[^}]*CORE\.switchQuestion\(QUESTION_BANK, questions, currentIndex \+ 1, question\.level\)/s, "Switch should request a replacement for the current difficulty stage.");
  assert.ok(script.includes("Switch your current question to a different question"), "The rules should explain the Switch lifeline.");
});
