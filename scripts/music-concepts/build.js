#!/usr/bin/env node
"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { REPOSITORY_ROOT } = require("./question-bank-common.js");

function run(label, argumentsList) {
  const result = spawnSync(process.execPath, argumentsList, {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}.`);
}

run("Question generation", [path.join("scripts", "music-concepts", "generate-question-banks.js")]);
run("Question validation", [path.join("scripts", "music-concepts", "validate-question-banks.js")]);

[
  "millionaire-core.js",
  "millionaire-question-bank.js",
  "millionaire-music-concept-bank.js",
  path.join("scripts", "music-concepts", "question-bank-common.js"),
  path.join("scripts", "music-concepts", "generate-question-banks.js"),
  path.join("scripts", "music-concepts", "question-editor-server.js"),
  path.join("scripts", "music-concepts", "validate-question-banks.js"),
  path.join("scripts", "music-concepts", "smoke-games.js"),
  path.join("tools", "millionaire-question-editor", "editor.js"),
].forEach((filename) => run(`Syntax check for ${filename}`, ["--check", filename]));

run("Five-level smoke games", [path.join("scripts", "music-concepts", "smoke-games.js")]);
console.log("Static Music Concept production build passed.");
