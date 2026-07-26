"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("wheredidthemusicstop.html", "utf8");
const homepage = fs.readFileSync("index.html", "utf8");

test("Follow the Score is a self-contained copy of the Practice Questions implementation", () => {
  assert.match(source, /<title>Follow the Score<\/title>/);
  assert.match(source, /function makePracticePaperQuestion\(/);
  assert.match(source, /function makeEightBarRepetitionQuestion\(/);
  assert.match(source, /async function playQuestionAudio\(/);
  assert.match(source, /function playPianoMidi\(/);
  assert.match(source, /const accompanimentPattern = randomItem\(ACCOMPANIMENT_PATTERNS\)/);
  assert.doesNotMatch(source, /<iframe/);
  assert.doesNotMatch(source, /MLHPracticeAudioEngine|MLHPracticeQuestionEngine|mlh-practice-/);
  assert.doesNotMatch(source, /where-did-music-stop\.jsx/);
});

test("Follow the Score keeps the requested level, repeat and answer rules", () => {
  const followRules = source.slice(
    source.indexOf("function makeFollowScoreRepeat"),
    source.indexOf("function followScoreNoteSounds"),
  );
  assert.match(source, /Math\.random\(\) >= 0\.3/);
  assert.match(source, /exactNote: \["N5", "H", "AH"\]\.includes\(level\)/);
  assert.match(source, /identify the <strong className="font-black">\{exactInstruction \? "exact note" : "bar"\}<\/strong> where the music stops/);
  assert.match(source, /nextTimer\.current = window\.setTimeout\(\(\) => newQuestion\(\), 2050\)/);
  assert.match(source, /function advanceAfterFollowScoreFeedback\(\)/);
  assert.match(source, /if \(!followFeedback \|\| followFeedback\.correct \|\| feedbackFading\) return/);
  assert.match(source, /fadeTimer\.current = window\.setTimeout\(\(\) => setFeedbackFading\(true\), 1700\)/);
  assert.match(source, /<Feedback feedback=\{followFeedback\} fading=\{feedbackFading\} \/>/);
  assert.match(source, /const medalSound = followScoreMedalSoundForStreak\(nextStreak\)/);
  assert.match(source, /window\.setTimeout\(\(\) => playSound\(true, true, medalSound\), 180\)/);
  assert.match(source, /if \(followPlayback \|\| \(FOLLOW_SCORE_APP && followFeedback\)\)/);
  assert.match(source, /activeNoteId=\{followFeedback \? activeNoteId : null\}/);
  assert.doesNotMatch(source, /if \(!followPlayedOnce \|\| isPlaying \|\| followFeedback\) return/);
  assert.doesNotMatch(source, /Play the music before selecting an answer\./);
  assert.match(source, /start === 0 \? \[\] : \[\{ symbolId: "start-repeat"/);
  assert.match(source, /symbolId: "ds-fine"/);
  assert.match(source, /symbolId: "ds"/);
  assert.doesNotMatch(followRules, /symbolId: "dc"/);
});

test("the Hub lists Follow the Score with the requested icon", () => {
  assert.match(homepage, /href: "wheredidthemusicstop\.html"[\s\S]*?disabled: \[\]/);
  assert.match(homepage, /"Follow the Score": "stopmusic-icon\.svg"/);
  assert.match(homepage, /app\.comingSoon \|\| app\.title === "Digital Past Papers" \|\| app\.title === "Follow the Score"/);
});
