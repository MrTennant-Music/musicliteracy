"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("index.html", "utf8");

test("the two planned Other apps are disabled Coming soon cards", () => {
  assert.match(source, /title: "Aural Recognition", desc: "Test your ears on chords, scales, tonalities and more\."[\s\S]*?comingSoon: true/);
  assert.match(source, /title: "Family Fortunes", desc: "Guess the most popular musical answers in this game-show challenge\."[\s\S]*?comingSoon: true/);
  assert.match(source, /"Aural Recognition": "aural-recognition-icon\.svg"/);
  assert.match(source, /"Family Fortunes": "familyfortunes-icon\.svg"/);
  assert.match(source, /app\.comingSoon \? 'disabled aria-disabled="true"'/);
  assert.match(source, /Coming soon/);
  assert.equal(fs.existsSync("aural-recognition.html"), false);
  assert.equal(fs.existsSync("familyfortunes.html"), false);
});

test("the Aural Recognition ear icon uses the shared app-icon frame", () => {
  const icon = fs.readFileSync("aural-recognition-icon.svg", "utf8");
  assert.match(icon, /viewBox="0 0 128 128"/);
  assert.match(icon, /stroke="#e5e7eb"/);
  assert.match(icon, /stroke="#020617"/);
});

test("Digital Question Papers opens an Advanced Higher Coming soon row", () => {
  assert.match(source, /const digitalPaperYears = \{[\s\S]*?AH: \[\][\s\S]*?\};/);
  assert.match(source, /title: "Digital Question Papers"[\s\S]*?disabled: \["N3", "N4"\]/);
  assert.match(source, /class="year-coming-soon" data-level="\$\{level\}" hidden>Coming soon<\/p>/);
  assert.match(source, /\.year-coming-soon\s*\{[\s\S]*?grid-column: 1 \/ -1;[\s\S]*?justify-content: center;/);
  assert.match(source, /app\.title === "Digital Question Papers" && digitalPaperYears\[key\]/);
});
