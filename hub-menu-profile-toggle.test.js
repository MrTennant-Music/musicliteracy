"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const menuSource = fs.readFileSync("hub-menu.js", "utf8");
const practiceSource = fs.readFileSync("practicequestions.html", "utf8");

test("formatted toggle labels do not share an object-string profile key", () => {
  assert.match(menuSource, /const toggleKey = profileKey \?\? \(typeof label === "string" \? label : null\);/);
  assert.match(menuSource, /getToggle\(toggleKey\)/);
  assert.match(menuSource, /setToggle\(toggleKey, !checked\)/);
  assert.doesNotMatch(menuSource, /getToggle\(label\)/);
  assert.doesNotMatch(menuSource, /setToggle\(label, !checked\)/);
});

test("each Practice Questions toggle has an independent profile key", () => {
  assert.match(practiceSource, /profileKey=\{`Practice Questions:\$\{type\.id\}`\}/);
});
