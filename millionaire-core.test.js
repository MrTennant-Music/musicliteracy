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

test("question bank contains all course pools and the completed N4/N5 Literacy banks", () => {
  assert.ok(BANK.length >= 400);
  assert.equal(new Set(BANK.map((question) => question.id)).size, BANK.length);
  assert.deepEqual(CORE.validateQuestionBank(BANK), []);
  assert.deepEqual(CORE.validateQuestionPools(BANK.pools), []);
  assert.equal(CORE.questionPoolSummary(BANK.pools).length, 45);
  for (const level of CORE.SUPPORTED_LEVELS) {
    for (const difficulty of CORE.DIFFICULTIES) {
      for (const category of CORE.CATEGORIES) {
        const pool = BANK.pools[level][difficulty][category];
        if (["N4", "N5"].includes(level)) {
          if (category === "literacy") assert.ok(pool.length >= 5, `${level}/${difficulty}/literacy should contain a complete question pool`);
          else assert.equal(pool.length, 0, `${level}/${difficulty}/${category} should remain unavailable`);
        } else assert.ok(pool.length >= 5, `${level}/${difficulty}/${category} should contain the expected questions`);
        assert.ok(pool.every((question) => question.level === level && question.difficulty === difficulty && question.category === category));
      }
    }
  }
  const national3 = BANK.filter((question) => question.level === "N3");
  assert.ok(national3.length >= 76);
  assert.ok(national3.every((question) => !question.placeholder));
  assert.ok(national3.some((question) => question.id === "n3-listening-001"));
  const n3Literacy = BANK.filter((question) => question.level === "N3" && question.category === "literacy");
  assert.ok(n3Literacy.length >= 46);
  assert.ok(n3Literacy.every((question) => ["easy", "medium", "hard"].includes(question.difficulty)));
  assert.ok(n3Literacy.every((question) => !question.question.includes("crotchet beats")), "National 3 Literacy prompts should use the simpler term beats.");
  assert.equal(n3Literacy.find((question) => question.concept === "stave")?.notation?.kind, "stave", "The National 3 stave question should display a blank stave in the notation panel.");
  assert.ok(n3Literacy.filter((question) => question.concept.startsWith("double-barline")).every((question) => question.notation?.kind === "barline"), "National 3 double-barline questions should use the shared Bravura end-barline.");
  assert.equal(n3Literacy.find((question) => question.concept === "treble-clef-name")?.notation?.glyphs?.[0], "trebleClef", "The Easy treble-clef question should show the shared Bravura treble clef in the notation panel.");
  const rhythmSums = n3Literacy.filter((question) => question.concept.startsWith("rhythm-addition") || question.concept.startsWith("rhythm-sum"));
  assert.ok(rhythmSums.length >= 8 && rhythmSums.every((question) => question.notation?.kind === "rhythmSum"), "National 3 rhythm sums should use the Rhythm Sums-style notation presentation.");
  assert.ok(n3Literacy.filter((question) => ["crescendo-symbol", "diminuendo-symbol"].includes(question.concept)).every((question) => question.notation?.kind === "dynamic"), "National 3 dynamic-symbol questions should use the dedicated Dynamics-style renderer.");
  assert.ok(n3Literacy.filter((question) => question.difficulty === "hard").some((question) => question.notation?.kind === "bar"));
});

test("placeholder questions use one consistent schema and safe empty audio fields", () => {
  const placeholders = BANK.filter((question) => question.placeholder);
  assert.equal(placeholders.length, 90);
  placeholders.forEach((question) => {
    assert.match(question.question, /^Placeholder:/);
    assert.equal(question.answers.length, 4);
    assert.equal(question.correctAnswer, "a");
    assert.equal(typeof question.audioSrc, "string");
    assert.ok(Object.hasOwn(question, "notationData"));
    if (question.category === "listening") {
      assert.equal(question.audioSrc, "");
      assert.equal(question.audio.generator, null);
    }
  });
});

test("games for every course level meet block, mixture and uniqueness rules", () => {
  for (const level of CORE.SUPPORTED_LEVELS) {
    for (let seed = 1; seed <= 100; seed += 1) {
      const game = CORE.composeGame(BANK, [], seeded(seed * 10 + CORE.SUPPORTED_LEVELS.indexOf(level)), { level });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15);
      game.forEach((question, index) => {
        assert.equal(question.level, level);
        assert.equal(question.difficulty, CORE.difficultyForStage(index + 1));
        assert.equal(question.answers.length, 4);
        assert.equal(question.answers.find((answer) => answer.letter === question.correctLetter).originalId, question.correctAnswer);
        if (index >= 2) assert.ok(!(game[index - 2].category === question.category && game[index - 1].category === question.category));
      });
      for (let start = 0; start < 15; start += 5) {
        const block = game.slice(start, start + 5);
        const counts = Object.fromEntries(CORE.CATEGORIES.map((category) => [category, block.filter((question) => question.category === category).length]));
        assert.ok(Object.values(counts).every((count) => count >= 1 && count <= 2));
      }
    }
  }
});

test("new games are random while a composed game remains a fixed sequence", () => {
  const first = CORE.composeGame(BANK, [], seeded(101), { level: "N5" });
  const originalIds = first.map((question) => question.id);
  const second = CORE.composeGame(BANK, [], seeded(202), { level: "N5" });
  assert.notDeepEqual(second.map((question) => question.id), originalIds);
  assert.deepEqual(first.map((question) => question.id), originalIds);
});

test("single question-type games use all 15 questions once and still get harder", () => {
  for (const level of CORE.SUPPORTED_LEVELS) {
    for (const category of CORE.CATEGORIES) {
      const game = CORE.composeGame(BANK, [], seeded(300 + CORE.CATEGORIES.indexOf(category)), { level, categories: [category] });
      assert.equal(game.length, 15);
      assert.equal(new Set(game.map((question) => question.id)).size, 15);
      assert.ok(game.every((question) => question.level === level && question.category === category));
      assert.deepEqual(game.map((question) => question.difficulty), [
        ...Array(5).fill("easy"), ...Array(5).fill("medium"), ...Array(5).fill("hard"),
      ]);
    }
  }
});

test("two enabled question types appear in every difficulty block without triples", () => {
  const enabled = ["listening", "concepts"];
  for (let seed = 1; seed <= 100; seed += 1) {
    const game = CORE.composeGame(BANK, [], seeded(400 + seed), { level: "H", categories: enabled });
    assert.equal(new Set(game.map((question) => question.id)).size, 15);
    for (let start = 0; start < 15; start += 5) {
      const counts = enabled.map((category) => game.slice(start, start + 5).filter((question) => question.category === category).length).sort();
      assert.deepEqual(counts, [2, 3]);
    }
    game.forEach((question, index) => {
      if (index >= 2) assert.ok(!(game[index - 2].category === question.category && game[index - 1].category === question.category));
    });
  }
});

test("invalid, empty and incomplete pools fail safely without crossing level or difficulty", () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(message);
  try {
    const incomplete = BANK.filter((question) => !(question.level === "H" && question.difficulty === "easy" && question.category === "listening"));
    const game = CORE.composeGame(incomplete, [], seeded(7), { level: "H" });
    assert.equal(game.length, 15);
    assert.ok(game.every((question, index) => question.level === "H" && question.difficulty === CORE.difficultyForStage(index + 1)));
    assert.ok(game.some((question) => question.fallback && question.category === "listening" && question.difficulty === "easy"));
    assert.ok(warnings.some((message) => message.includes("question pool is empty")));

    const tooSmall = BANK.filter((question) => !(question.level === "H" && question.difficulty === "easy" && question.category === "literacy"))
      .concat(BANK.pools.H.easy.literacy[0]);
    const fallbackGame = CORE.composeGame(tooSmall, [], seeded(9), { level: "H", categories: ["literacy", "concepts"] });
    assert.equal(new Set(fallbackGame.map((question) => question.id)).size, 15);
    assert.ok(fallbackGame.every((question, index) => question.level === "H" && question.difficulty === CORE.difficultyForStage(index + 1)));
    assert.ok(warnings.some((message) => message.includes("too few unused questions")));

    const invalid = { ...BANK[0], id: "broken", answers: BANK[0].answers.slice(0, 3) };
    const validGame = CORE.composeGame([...BANK, invalid], [], seeded(8), { level: "N3" });
    assert.ok(!validGame.some((question) => question.id === "broken"));
  } finally {
    console.warn = originalWarn;
  }
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

test("Switch keeps a replacement within the selected question type", () => {
  const category = "literacy";
  const categoryBank = BANK.filter((question) => question.category === category);
  const game = CORE.composeGame(categoryBank, [], seeded(500), { categories: [category] });
  const stage = 15;
  const replacement = CORE.switchQuestion(categoryBank, game, stage, "N3", seeded(501), { allowRepeats: true });
  assert.ok(replacement);
  assert.equal(replacement.category, category);
  assert.notEqual(replacement.id, game[stage - 1].id);
  assert.notEqual(replacement.id, game[stage - 1].id);
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
  assert.ok(script.includes('["title", "rules", "results"].includes(screen)) audioDirector.current.playOpening();'), "Opening-menu audio should start when the Review screen opens.");
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
  assert.ok(html.includes("bravura-symbols.js") && html.includes("shared-notation-config.js"), "Millionaire notation should use the shared Bravura symbols and notation settings.");
  assert.ok(script.includes("function CalibratedNotationSymbol") && script.includes("SHARED_NOTATION.stave?.lineGap") && script.includes("sharedNotationSymbol(symbolKey)"), "Stave notation should directly use the shared Practice Questions calibration settings.");
  assert.ok(script.includes('viewBox="30 10 440 130"') && script.includes('millionaire-staff-line-fade') && script.includes('2: 225'), "Note staves should use the enlarged, centre-focused Note Identification presentation with fading staff lines.");
  assert.ok(script.includes("function InlineNotationGlyph") && script.includes('const isDottedMinim = glyph === "dottedHalfNote"'), "Standalone dotted minims should have their own spacing treatment.");
  assert.ok(script.includes("function DynamicNotationGlyph") && script.includes('dynamic === "diminuendo"') && script.includes('strokeWidth="2.4"'), "Dynamic hairpins should use the clear two-line treatment from Dynamics.");
  assert.ok(script.includes("function FinalBarlineNotation") && script.includes('symbolKey="barlineFinal"'), "Double-barline questions should use the calibrated shared Bravura end-barline from Barlines.");
  assert.ok(script.includes("function CompleteBarNotation") && script.includes("function RestsFirstBarNotation") && script.includes('fill="none" stroke="#78716c"'), "Complete-bar questions should use the shared-score style with a clear note-value target.");
  assert.ok(script.includes("function AnswerRhythmGlyph") && script.includes("RHYTHM_ANSWER_VALUES"), "Complete-bar answer choices should be displayed as Bravura note-value glyphs.");
  assert.ok(script.includes("function StandaloneTimeSignature") && script.includes('<BarTimeSignature time={[notation.top, notation.bottom]}'), "Standalone time signatures should use the calibrated shared score renderer.");
  assert.match(css, /\.millionaire-dotted-note\s*\{[^}]*font-weight:\s*400;[^}]*letter-spacing:\s*10px;/s, "Dotted minim notation should use regular weight and a clearly separated augmentation dot.");
  assert.ok(html.includes("hub-shell.js"));
  assert.ok(html.includes("footer.js"));
  assert.ok(script.includes("<window.MLH.LevelButton"));
  [
    'N3: { label: "National 3" }',
    'N4: { label: "National 4" }',
    'N5: { label: "National 5" }',
    'H: { label: "Higher" }',
    'AH: { label: "Advanced Higher" }',
  ].forEach((level) => assert.ok(script.includes(level), `Missing selectable level: ${level}`));
  assert.ok(script.includes("activeLevel={settings.level}") && script.includes("activeLabel={activeLevelLabel}"), "The Level menu should show the selected course level.");
  assert.ok(script.includes('const categories = ["N4", "N5"].includes(settings.level) ? ["literacy"] : settings.questionTypes;') && script.includes("level: settings.level, categories"), "New games should use the selected course level and available question types.");
  assert.ok(script.includes('profileLabel={activeLevelLabel}'), "The page header should reflect the selected course level.");
  assert.ok(script.includes("CORE.validateQuestionPools(QUESTION_POOLS)") && script.includes("CORE.questionPoolSummary(QUESTION_POOLS)"), "Development checks should validate and summarise all 45 pools.");
  assert.ok(script.includes('role="status">Audio file not yet added.</div>'), "Missing question audio should show a safe temporary message.");
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
  assert.ok(script.includes('if (screen === "rules") return RulesScreen();'), "Rules should open in a separate panel without remounting the active screen renderer.");
  assert.ok(!script.includes('screen === "setup"'), "The old setup step should be removed.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">National 3 prototype</span>'), "The rules panel should not show the prototype label.");
  assert.ok(!script.includes('<span className="millionaire-setup-badge">Game rules</span>'), "The rules panel should not show a Game rules badge.");
  assert.match(css, /\.millionaire-notation\s*\{[^}]*width:\s*min\(460px, calc\(100% - 40px\)\);[^}]*min-height:\s*180px;[^}]*place-items:\s*center;[^}]*background:\s*#fff;/s, "Notation should use a large white panel with centred content.");
  assert.match(css, /\.millionaire-glyphs > span:not\(\.millionaire-glyph-blank\)\s*\{[^}]*transform:\s*translateY\(22px\);/s, "Bravura glyph ink should be optically centred within the notation panel.");
  assert.ok(script.includes("<h2>How to Play</h2>"), "The instructions panel heading should match the How to Play button.");
  assert.ok(script.includes('className="millionaire-screen millionaire-rules-screen"'), "The How to Play screen should have a dedicated fixed-height layout class.");
  assert.match(css, /\.millionaire-rules-screen\s*\{[^}]*height:\s*670px;[^}]*max-height:\s*670px;/s, "The How to Play screen should not make the game container taller.");
  assert.ok(!script.includes("Answer 15 increasingly challenging questions to climb the prize ladder and win £1 million."), "The rules panel should not repeat the game objective.");
  assert.ok(!script.includes("millionaire-setup-grid"), "The question-type breakdown should be removed.");
  ["Answer 15 music questions which progressively get more challenging.", "Each question is multiple choice with four possible answers."].forEach((rule) => assert.ok(script.includes(rule), `Missing rules guidance: ${rule}`));
  assert.ok(script.includes('<div className="millionaire-game-rules-copy millionaire-lifeline-intro"><p>If you get stuck on a question, you can use a lifeline:</p></div>'), "The Lifelines introduction should lead into the choices with a colon.");
  ["Choose and confirm:", "Milestones:", "Listening questions:"].forEach((oldRule) => assert.ok(!script.includes(oldRule), `Old rules guidance should be removed: ${oldRule}`));
  ['icon: "bronze.svg", label: "Bronze medal", tier: "bronze"', 'icon: "silver.svg", label: "Silver medal", tier: "silver"', 'icon: "gold.svg", label: "Gold medal", tier: "gold"', 'icon: "diamond.svg", label: "Diamond", tier: "diamond"'].forEach((reward) => assert.ok(script.includes(reward), `Missing reward details: ${reward}`));
  ["bronzehighres.svg", "silverhighres.svg", "goldhighres.svg", "diamondhighres.svg"].forEach((icon) => assert.ok(script.includes(`celebrationIcon: "${icon}"`), `Missing high-resolution celebration medal: ${icon}`));
  assert.ok(script.includes('className="millionaire-milestone-medal" src={reward.celebrationIcon}'), "The centre celebration should use the high-resolution medal artwork.");
  assert.ok(script.includes('className="millionaire-milestone-shine"') && script.includes('"--millionaire-medal-mask"'), "Every high-resolution milestone medal should receive a masked shine overlay.");
  assert.match(css, /\.millionaire-milestone-shine::after\s*\{[^}]*millionaireLifelineShine 3\.8s/s, "Milestone medals should use the same repeating shine animation as lifelines.");
  assert.ok(script.includes("[15, 10, 5, 3].map"), "Rules should list rewards for Questions 15, 10, 5 and 3.");
  assert.ok(script.includes('className="millionaire-reward-icon" src={QUESTION_REWARDS[stage].icon}'), "Rules rewards should use the supplied SVG medal artwork.");
  assert.ok(script.includes('className={`millionaire-reward-label is-${QUESTION_REWARDS[stage].tier}`}>Question {stage}</span>'), "Reward rows should show each medal directly beside its full Question label.");
  assert.ok(!script.includes('millionaire-reward-diamond'), "Reward rows should not include a diamond between the medal and Question label.");
  assert.ok(script.includes('if (reward && stage !== 3) classes.push("is-reward");') && script.includes('className="millionaire-prize-reward" src={reward.icon} alt={reward.label}'), "Question 3 should remain a normal gold ladder row while retaining its Bronze medal icon.");
  assert.ok(script.includes('earnedReward ? <MilestoneCelebration reward={earnedReward} />'), "A correctly earned milestone should replace the question media with its medal celebration.");
  assert.ok(script.includes('className="millionaire-milestone-amount"'), "A correctly earned milestone should show its prize with a diamond on either side in the question bar.");
  assert.match(css, /\.millionaire-milestone-amount\s*\{[^}]*font-size:\s*clamp\(32px, 3\.2vw, 42px\);[^}]*line-height:\s*1;/s, "The milestone amount should be larger while remaining centred in the question bar.");
  assert.ok(script.includes('className={showWonAmount ? "is-milestone-amount" : undefined}'), "Every won amount should receive the special money styling.");
  assert.ok(script.includes('const showWonAmount = revealed === "correct";') && script.includes('{showWonAmount ? <span className="millionaire-milestone-amount"'), "Every correct answer should replace the question wording with the styled amount won.");
  assert.match(css, /\.millionaire-question-bar h2\.is-milestone-amount\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*none;[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold", serif;/s, "Milestone money should be precisely centred and use the prize-ladder Gothic font.");
  assert.match(css, /\.millionaire-milestone-amount\s*\{[^}]*display:\s*flex;[^}]*width:\s*100%;[^}]*justify-content:\s*center;/s, "The complete milestone amount and both diamonds should be centred as one group.");
  assert.ok(script.includes("if (screen === \"game\") return GameScreen();") && script.includes("{CurrentScreen()}"), "State updates should preserve the active screen so milestone animations run once.");
  assert.ok(!script.includes("<CurrentScreen />"), "The active screen should not remount on every state update.");
  assert.match(css, /\.millionaire-confetti-piece\s*\{[^}]*millionaireConfettiBurst 1\.65s/s, "Milestone medals should trigger the confetti animation.");
  assert.match(css, /@keyframes millionaireMilestoneMedal/, "Milestone medals should animate into the question media area.");
  ['src="50.50.svg"', 'src="hint.svg"', 'src="switch.svg"'].forEach((icon) => assert.ok(script.includes(icon), `Missing lifeline rules icon: ${icon}`));
  assert.equal((script.match(/className="millionaire-lifeline-icon"/g) || []).length, 3, "All three in-game lifelines should use SVG icons.");
  ["Removes two incorrect answers.", "Guides you towards the correct answer with a hint.", "Switch your current question to a different question."].forEach((sentence) => assert.ok(!script.includes(sentence), `Lifeline guidance should not end with a full stop: ${sentence}`));
  assert.ok(script.includes("Guides you towards the correct answer with a hint"), "The Hint rules should use the requested wording.");
  assert.ok(!script.includes('className="millionaire-primary millionaire-play" onClick={startGame}>Start game</button>'), "The rules panel should not include a Start Game button.");
  assert.ok(script.includes('className="millionaire-audio-toggle"'), "The game board should include the combined audio control.");
  assert.ok(script.includes('<img src="audio-svgrepo-com.svg" alt="" aria-hidden="true" />'), "The combined audio control should use the requested audio icon.");
  assert.match(css, /\.millionaire-audio-toggle img\s*\{[^}]*filter:\s*brightness\(0\) invert\(1\);/s, "The combined audio icon should be white.");
  assert.ok(script.includes('return { ...current, backgroundMusic: !enabled, soundEffects: !enabled };'), "The combined audio control should toggle music and effects together.");
  assert.ok(script.includes('const SETTINGS_KEY = "mlh-millionaire-settings-v3";'), "The settings version should apply the new defaults once.");
  assert.match(script, /const DEFAULT_SETTINGS = \{[^}]*soundEffects:\s*true,[^}]*backgroundMusic:\s*true,/s, "Sound Effects and Background Music should both default to on.");
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
  assert.ok(script.includes("Each lifeline can only be used once per game.</p>"), "The one-use note should use the requested wording.");
  assert.match(css, /\.millionaire-rewards-list li\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*gap:\s*\.25em;/s, "Reward medals and Question labels should share one centred row with one text-space between them.");
  [["diamond", "#06b6d4"], ["gold", "#eab308"], ["silver", "#64748b"], ["bronze", "#b45309"]].forEach(([tier, colour]) => assert.match(css, new RegExp(`\\.millionaire-reward-label\\.is-${tier}\\s*\\{[^}]*color:\\s*${colour};`), `${tier} reward text should use the shared medal colour.`));
  assert.match(css, /\.millionaire-rewards-list\s*\{[^}]*color:\s*#dbeafe;[^}]*font-family:\s*inherit;[^}]*font-size:\s*19px;[^}]*font-weight:\s*700;[^}]*line-height:\s*1\.3;/s, "Reward labels should use the heading font in bold at 19px.");
  assert.match(css, /\.millionaire-reward-icon\s*\{[^}]*width:\s*19px;[^}]*height:\s*19px;[^}]*object-fit:\s*contain;[^}]*translateY\(-2\.5px\);/s, "Reward SVGs should match the label size and sit 2.5px higher for optical alignment.");
  assert.match(css, /\.millionaire-reward-label\s*\{[^}]*width:\s*112px;[^}]*white-space:\s*nowrap;/s, "Each enlarged reward Question label should remain on one line.");
  assert.match(css, /\.millionaire-game-rules-copy\s*\{[^}]*font-weight:\s*400;/s, "The gameplay description should use regular text.");
  assert.match(css, /\.millionaire-lifeline-rules strong\s*\{[^}]*font-size:\s*16px;/s, "The lifeline names should be larger.");
  assert.match(css, /\.millionaire-lifeline-rules span\s*\{[^}]*font-weight:\s*400;/s, "The lifeline descriptions should use regular text.");
  assert.ok(script.includes('controls={<div className="millionaire-lifelines millionaire-ladder-lifelines"'), "The lifelines should appear above the prize-ladder questions.");
  assert.ok(!script.includes("<h2>Prize ladder</h2>"), "The prize ladder should not show a visible heading.");
  assert.ok(script.includes('className="millionaire-prize-diamond"'), "Prize rows should include a completion diamond.");
  assert.match(css, /\.millionaire-prize-row\.is-complete \.millionaire-prize-diamond, \.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*opacity:\s*1;/s, "Diamonds should show for completed and current questions only.");
  assert.match(css, /\.millionaire-prize-row\.is-current\s*\{[^}]*clip-path:\s*polygon\([^}]*filter:\s*drop-shadow/s, "The current question should use a glowing orange pointed bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-number\s*\{[^}]*color:\s*#07123d;/s, "The current prize number should use dark blue on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-value-wrap\s*\{[^}]*color:\s*#07123d;/s, "The current prize amount should use dark blue on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current\.is-reward \.millionaire-prize-number\s*\{[^}]*color:\s*#fff;/s, "The current milestone question number should stay white on the orange bar.");
  assert.match(css, /\.millionaire-prize-row\.is-current\.is-reward \.millionaire-prize-value-wrap\s*\{[^}]*color:\s*#fff;/s, "The current milestone amount should stay white on the orange bar.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "Visible prize diamonds should always be white.");
  assert.match(css, /\.millionaire-prize-row\.is-current \.millionaire-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "The current prize diamond should remain white on the orange bar.");
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
  assert.ok(script.includes('<span className="millionaire-final-answer-label">Final Answer</span>'), "The answer action should use the title-case Final Answer label.");
  assert.ok(script.includes('onClick={resetGame}><span className="millionaire-final-answer-label">Exit</span>'), "The Review screen should offer an Exit button matching the Review action and returning to the opening screen.");
  assert.ok(!script.includes("Concepts answered incorrectly:") && !script.includes("millionaire-concept-misses"), "The Review screen should not show a separate incorrectly answered concepts panel.");
  assert.ok(!script.includes('<ResultStat label="Outcome">') && !script.includes('<ResultStat label="Correct answers">') && !script.includes('<ResultStat label="Attempted">'), "The Review summary should omit Outcome, Correct Answers and Attempted cards.");
  assert.ok(!script.includes('<ResultStat label="Audio questions">') && !script.includes('<ResultStat label="Music literacy questions">') && !script.includes('<ResultStat label="Music concept questions">'), "The Review screen should not show question-type count cards.");
  assert.ok(!script.includes("categorySummary."), "The Review screen should not calculate question-type summary counts.");
  assert.ok(script.includes('className="millionaire-result-lifelines"') && script.includes('usedLifelines.map(({ key, icon, label }) => <img'), "The Review summary should show the actual icons for used lifelines.");
  assert.ok(script.includes('label="Lifelines used"'), "The Lifelines used heading should use sentence case.");
  assert.ok(script.includes('const earnedMedalStage = [15, 10, 5, 3].find((stage) => stage <= correctCount);') && script.includes('label="Medal achieved"'), "The Review summary should identify the highest milestone medal actually earned.");
  assert.ok(script.includes('{outcome === "won" && <FinalConfetti />}'), "The Review screen should continue the confetti for a £1 MILLION winner.");
  assert.ok(script.includes('<img src={earnedMedal.icon} alt={earnedMedal.label} /> : "-"') && script.includes('usedLifelines.map(({ key, icon, label }) => <img key={key} src={icon} alt={label} />) : "-"'), "Empty Medal Achieved and Lifelines Used cards should show a dash.");
  assert.match(css, /\.millionaire-results-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/s, "The three remaining Review cards should use a balanced three-column layout.");
  assert.match(css, /\.millionaire-results > :not\(.millionaire-final-confetti\)\s*\{[^}]*z-index:\s*2;/s, "Review content should remain readable above winner confetti.");
  assert.match(css, /\.millionaire-result-lifelines img\s*\{[^}]*width:\s*60px;[^}]*height:\s*40px;/s, "Used lifeline icons should be clearly visible in the Review summary.");
  assert.ok(script.includes('aria-label={`Question ${reviewQuestionNumber}, ${reviewPrize}`}') && script.includes('className="millionaire-result-prize-diamond"'), "The Review prize should show the highest correctly answered question, a diamond and the current value.");
  assert.ok(script.includes('<span>QUESTION {reviewQuestionNumber}</span>'), "The Review prize should label the highest correctly answered question clearly.");
  assert.ok(script.includes('const reviewPrizeValue = reviewQuestionNumber ? CORE.PRIZE_LADDER[reviewQuestionNumber - 1] || 0 : 0;'), "The Review screen should show the monetary value of the highest correctly answered question.");
  assert.ok(script.includes('const reviewPrize = reviewPrizeValue === 1000000 ? "£1 MILLION" : CORE.formatPrize(reviewPrizeValue);'), "The Review question value should capitalise MILLION at the top prize.");
  assert.match(css, /\.millionaire-result-prize\s*\{[^}]*display:\s*flex;[^}]*width:\s*fit-content;[^}]*justify-content:\s*center;[^}]*white-space:\s*nowrap;/s, "The Review prize should keep QUESTION 15 and £1 MILLION on one centred line.");
  assert.match(css, /\.millionaire-result-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "The Review prize should separate the question number and value with a white diamond.");
  assert.match(css, /\.millionaire-result-prize-diamond\s*\{[^}]*color:\s*#fff;/s, "The Review prize separator should use a white diamond.");
  assert.match(script, /<ResultStat label="Medal achieved">[\s\S]*<ResultStat label="Lifelines used">[\s\S]*<ResultStat label="Time">/, "Review should show Medal achieved, Lifelines used and Time in that order.");
  assert.match(css, /\.millionaire-result-medal img\s*\{[^}]*width:\s*36px;[^}]*height:\s*36px;/s, "The highest earned medal glyph should use the requested smaller Review size.");
  assert.match(css, /\.millionaire-result-actions\s*\{[^}]*margin-top:\s*auto;[^}]*padding-top:\s*20px;/s, "The Review Exit button should remain anchored to the bottom of the game container.");
  assert.match(css, /\.millionaire-result-stat > span\s*\{[^}]*color:\s*#f6c453;[^}]*font-family:\s*inherit;[^}]*font-size:\s*21px;[^}]*font-weight:\s*700;[^}]*letter-spacing:\s*normal;[^}]*text-transform:\s*none;/s, "Review card headings should match the gold 21px rules-panel headings without uppercase styling.");
  assert.match(css, /\.millionaire-final-answer\s*\{[^}]*min-width:\s*220px;[^}]*font-size:\s*26px;[^}]*line-height:\s*1;/s, "The Final Answer label should fill its button.");
  assert.match(css, /\.millionaire-final-answer\.millionaire-audio-button\s*\{[^}]*min-width:\s*0;[^}]*gap:\s*8px;/s, "The Play and Stop button should override the Final Answer width and fit its contents.");
  assert.match(css, /\.millionaire-audio-glyph\s*\{[^}]*translateY\(3px\);/s, "The Play and Stop glyph should be optically centred with its label.");
  assert.match(css, /\.millionaire-audio-glyph\.is-stop\s*\{[^}]*font-size:\s*28px;/s, "The square Stop glyph should be large enough to balance the Play glyph.");
  assert.ok(script.includes('<span className="millionaire-audio-count">Remaining: {remaining}</span>'), "The listening counter should use the concise Remaining label.");
  assert.match(css, /\.millionaire-audio-button:disabled \.millionaire-audio-glyph\s*\{[^}]*color:\s*#6b7280;/s, "The expired Play glyph should use the same grey as its disabled label.");
  assert.ok(script.includes('className="millionaire-actions millionaire-final-answer-actions"'), "The Final Answer row should have dedicated spacing.");
  assert.match(css, /\.millionaire-final-answer-actions\s*\{[^}]*padding-top:\s*14px;/s, "The existing 14px grid gap plus 14px top padding should create 28px above Final Answer.");
  assert.match(css, /\.millionaire-final-answer-label\s*\{[^}]*translateY\(3px\);/s, "The Final Answer label should be optically centred.");
  assert.ok(script.includes('aria-label="Reset game and return to opening screen" disabled={screen !== "game"} onClick={resetGame}'), "Reset should remain visible but be disabled outside the active question screen.");
  assert.ok(script.includes('src="restart.svg" alt="" className="h-[20px] w-[20px]"') && script.includes('>Reset</span>'), "Reset should use a balanced 20px restart icon and title-case label.");
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
  assert.match(script, /if \(QUESTION_REWARDS\[stage\]\) \{[\s\S]*autoAdvance: true[\s\S]*const stopAfterSeconds = stage === 5 \? 7 : stage === 10 \? 8 : 0;[\s\S]*playOutcome\(stage, true, \{ finishNaturally: stage !== 3, stopAfterSeconds \}\);[\s\S]*goToQuestion\(currentIndex \+ 1\);[\s\S]*return;/, "Medal questions should advance automatically, with £1,000 and £32,000 using their requested audio lengths.");
  assert.ok(script.includes('disabled={autoAdvancingMilestone || !selectedLetter || locked || transitioning}') && !script.includes('waitingForMilestoneContinue') && !script.includes('continueMilestone'), "Milestone celebrations should keep Final Answer visible but disabled, without offering Continue.");
  assert.match(script, /if \(stage === 15\) \{[\s\S]*setScreen\("milestone"\);[\s\S]*playOutcome\(15, true, \{ finishNaturally: true \}\);[\s\S]*return;/, "The £1 million win should open its dedicated celebration screen and play Sound 62.");
  assert.ok(script.includes('<MilestoneCelebration reward={QUESTION_REWARDS[15]} showBurst={false} />'), "The £1 million screen should show the high-resolution diamond without the small burst confetti.");
  assert.ok(script.includes('<FinalConfetti />') && script.includes('Array.from({ length: 60 }'), "The £1 million screen should pour confetti across its full width.");
  assert.match(css, /\.millionaire-final-confetti-piece\s*\{[^}]*millionaireConfettiFall[^}]*infinite;/s, "Final-screen confetti should fall continuously.");
  assert.ok(script.includes('<h2>£1 MILLION</h2>'), "The final celebration heading should use the requested £1 MILLION wording.");
  assert.ok(!script.includes("You answered all 15 questions correctly."), "The final celebration should not show the removed explanatory sentence.");
  assert.match(css, /\.millionaire-celebration h2\s*\{[^}]*font-family:\s*"Copperplate Gothic Std ExtraBold", serif;/s, "The £1 MILLION heading should use the Gothic prize-ladder font.");
  assert.ok(script.includes('<p className="millionaire-celebration-message">Congratulations!</p>'), "The £1 MILLION screen should congratulate the player beneath the prize.");
  assert.match(css, /\.millionaire-celebration-message\s*\{[^}]*margin:\s*16px 0 0;[^}]*color:\s*#fff;[^}]*font-family:\s*"ITC Conduit Pro", sans-serif;/s, "The congratulations message should sit slightly lower in white question text.");
  assert.ok(script.includes('onClick={() => finishGame("won", 1000000)}><span className="millionaire-final-answer-label">Review</span>'), "The £1 million screen should offer Review after the diamond celebration.");
  assert.match(script, /function finalAnswerDelay\(stage\)\s*\{\s*if \(stage <= 5\) return 2000;\s*if \(stage <= 8\) return 3000;\s*if \(stage <= 12\) return 4000;\s*return 5000;\s*\}/s, "Final Answer reveals should use the confirmed 2, 3, 4 and 5 second question bands.");
  assert.match(script, /playFinalAnswer\(stage\)\s*\{[^}]*this\.playEffect\(path\);[^}]*window\.setTimeout\(\(\) => \{\s*this\.stopEffect\(\);\s*resolve\(\);\s*\}, finalAnswerDelay\(stage\)\);/s, "The Final Answer audio should be stopped at the fixed reveal delay instead of playing to completion.");
  assert.ok(script.includes('finishNaturally: stage !== 3') && script.includes('path === window.MILLIONAIRE_SOUND_CONFIG.earlyCorrect && !finishNaturally') && script.includes('shortenEarlyCorrect ? { shortenBy: 3, fadeSeconds: 1 } : stopAfterSeconds > 0 ? { stopAfterSeconds } : undefined') && script.includes('stopAfterSeconds * 1000'), "Question 3 should use the same shortened early-correct audio as Question 2, while £1,000 and £32,000 use their requested audio caps.");
  assert.ok(script.includes('className="millionaire-skip-correct-overlay"') && script.includes("audioDirector.current.stopEffect();"), "A click or tap anywhere should skip the remaining correct-answer reveal.");
  assert.match(css, /\.millionaire-skip-correct-overlay\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*1250;[^}]*inset:\s*0;[^}]*background:\s*transparent;/s, "The correct-answer skip target should cover the whole viewport without changing its appearance.");
  assert.ok(script.includes('value === 1000000 ? "£1 MILLION"'), "The top prize should display MILLION in capitals on the ladder.");
  assert.match(css, /\.millionaire-prize-row\s*\{[^}]*grid-template-columns:\s*30px 12px minmax\(0, 1fr\);[^}]*column-gap:\s*4px;[^}]*line-height:\s*1\.2;/s, "Prize rows should leave equal breathing room on both sides of the diamond.");
  assert.match(css, /\.millionaire-prize-number\s*\{[^}]*text-align:\s*right;[^}]*translateX\(5px\);/s, "Prize question numbers should be optically spaced equally from the diamond and amount.");
  assert.match(css, /\.millionaire-prize-value-wrap\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*gap:\s*6px;/s, "Reward SVGs should sit immediately beside their prize values.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*display:\s*grid;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*place-items:\s*center;[^}]*align-self:\s*center;[^}]*justify-self:\s*center;[^}]*font-size:\s*11px;/s, "Current and completed question diamonds should be larger and centred in both directions.");
  assert.match(css, /\.millionaire-prize-diamond\s*\{[^}]*transform:\s*translateX\(2px\);/s, "Every prize-ladder diamond should sit 2px to the right for optical alignment.");
  assert.ok(script.includes('<AutoFitAnswer answer={answer} question={question} />'), "Each answer should use automatic fitting, or a notation glyph where the question asks for a missing note value.");
  assert.match(css, /\.millionaire-answer\.is-removed\s*\{[^}]*pointer-events:\s*none;[^}]*\}/s, "50:50 removed choices should retain their answer containers but remain non-interactive.");
  assert.match(css, /\.millionaire-answer\.is-removed \.millionaire-answer-content, \.millionaire-answer\.is-removed \.millionaire-answer-status\s*\{[^}]*visibility:\s*hidden;/s, "50:50 should hide only the removed choice's diamond and text.");
  assert.ok(script.includes("text.scrollWidth > text.clientWidth") && script.includes("text.style.fontSize") && script.includes("fontSize -= .5"), "Only long white answer wording should reduce in size until it fits.");
  assert.ok(script.includes('text.classList.remove("is-wrapped")') && script.includes('if (fontSize <= 16 || text.scrollWidth > text.clientWidth) text.classList.add("is-wrapped")'), "White answer wording should always wrap after reaching its minimum fitted size, even when flex sizing masks the overflow.");
  assert.ok(script.includes('className="millionaire-answer-diamond"'), "Each answer should begin with a diamond.");
  assert.match(css, /\.millionaire-answer\s*\{[^}]*height:\s*48px;[^}]*min-height:\s*48px;/s, "Answer boxes should be two-thirds of the 72px question-box height.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*display:\s*flex;[^}]*font-size:\s*clamp\(18px, 1\.75vw, 24px\);[^}]*line-height:\s*1;/s, "Answer content should fit cleanly inside the half-height boxes.");
  assert.match(css, /\.millionaire-answer-content\s*\{[^}]*translateY\(2px\);/s, "Answer text should remain optically centred in the shorter boxes.");
  assert.match(css, /\.millionaire-answer-letter\s*\{[^}]*flex:\s*0 0 auto;[^}]*font-size:\s*inherit;/s, "Answer letters should remain at the full standard size when wording shrinks.");
  assert.match(css, /\.millionaire-answer-text\s*\{[^}]*min-width:\s*0;[^}]*flex:\s*1 1 auto;[^}]*overflow:\s*hidden;/s, "Only the white answer wording should occupy the flexible resizable space.");
  assert.match(css, /\.millionaire-answer-text\.is-wrapped\s*\{[^}]*overflow:\s*visible;[^}]*line-height:\s*1\.05;[^}]*white-space:\s*normal;/s, "Long white answer wording should use a second line instead of being cut off.");
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
  assert.ok(script.includes("<window.MLH.CustomiseButton") && script.includes("<window.MLH.MenuSubheading>Question Types</window.MLH.MenuSubheading>"), "Customise should use the shared Hub menu and Question Types heading.");
  ["Music Literacy", "Audio", "Music Concepts"].forEach((label) => assert.ok(script.includes(`label: "${label}"`), `Customise should include ${label}.`));
  assert.match(script, /const QUESTION_TYPE_OPTIONS = \[[\s\S]*id: "literacy"[\s\S]*id: "concepts"[\s\S]*id: "listening"/, "Customise should list Music Literacy, Music Concepts, then Audio.");
  assert.ok(script.includes('glyph: "\\uE050", notationGlyph: true'), "Music Literacy should use the Bravura treble clef glyph.");
  assert.ok(script.includes('icon: "worksheet.svg", iconSize: "h-[26px] w-[26px]"'), "Music Concepts should use a larger worksheet.svg icon.");
  assert.ok(script.includes('iconSize: "h-[42px] w-[42px]"'), "The Audio icon should be substantially larger.");
  assert.match(css, /\.millionaire-question-type-clef\s*\{[^}]*font-family:\s*"Bravura", serif;[^}]*font-size:\s*20px;[^}]*font-weight:\s*400;[^}]*transform:\s*translateY\(4px\);/s, "The Music Literacy glyph should use smaller regular-weight Bravura notation with the requested vertical alignment.");
  assert.ok(script.includes("if (enabled && current.questionTypes.length === 1) return current;"), "At least one question type should always remain enabled.");
  assert.ok(script.includes('disabled={["N4", "N5"].includes(settings.level) || (settings.questionTypes.includes(option.id) && settings.questionTypes.length === 1)}'), "The final enabled question-type toggle should be visibly unavailable.");
  assert.ok(script.includes('const customiseUnavailable = screen === "game" || screen === "milestone";') && script.includes("<fieldset disabled={customiseUnavailable}"), "Customise should be unavailable while a game is active.");
  assert.ok(script.includes('level: settings.level, categories'), "The next game should use the selected question types.");
  assert.match(script, /function useSwitch\(\)\s*\{[\s\S]*CORE\.switchQuestion\(enabledQuestionBank, questions, currentIndex \+ 1, question\.level, Math\.random, \{ allowRepeats: settings\.questionTypes\.length === 1 \}\)/, "Switch should stay within the enabled types and temporarily allow repeats in single-type games.");
  assert.ok(script.includes("Switch your current question to a different question"), "The rules should explain the Switch lifeline.");
});
