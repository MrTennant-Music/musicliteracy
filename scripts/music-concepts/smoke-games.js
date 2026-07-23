#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const {
  REPOSITORY_ROOT,
  LEVELS,
  LEVEL_CODES,
} = require("./question-bank-common.js");

const core = require(path.join(REPOSITORY_ROOT, "millionaire-core.js"));
const bank = require(path.join(REPOSITORY_ROOT, "millionaire-question-bank.js"));

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function smokeGame(level, index) {
  const levelCode = LEVEL_CODES[level];
  const game = core.composeGame(bank, [], seeded(20260722 + index), {
    level: levelCode,
    categories: ["concepts"],
  });

  assert.equal(game.length, 15);
  assert.equal(new Set(game.map((question) => question.id)).size, 15);
  assert.equal(new Set(game.map((question) => question.conceptId)).size, 15);
  assert.deepEqual(game.map((question) => question.difficulty), [
    ...Array(5).fill("easy"),
    ...Array(5).fill("medium"),
    ...Array(5).fill("hard"),
  ]);

  game.forEach((question, stageIndex) => {
    assert.equal(question.level, levelCode);
    assert.equal(question.category, "concepts");
    assert.equal(question.type, "text");
    assert.equal(question.audioSrc, "");
    assert.equal(question.notationData, null);
    assert.ok(question.tip?.trim());
    assert.ok(question.explanation?.trim());
    assert.equal(question.answers.filter((answer) => answer.letter === question.correctLetter).length, 1);

    if (stageIndex === 0) {
      const removed = core.fiftyFifty(question, seeded(9000 + index));
      assert.equal(removed.length, 2);
      assert.ok(removed.every((letter) => letter !== question.correctLetter));
    }
  });

  return {
    level,
    ids: game.map((question) => question.id),
    concepts: game.map((question) => question.concept),
  };
}

const results = LEVELS.map(smokeGame);
results.forEach((result) => {
  console.log(`${result.level}: completed 15-question Music Concept smoke game (${result.ids.length} unique questions and concepts).`);
});

