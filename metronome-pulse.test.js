"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const audioSource = fs.readFileSync("hub-audio.js", "utf8");
const helperSource = audioSource.match(/function metronomePulseOffsets\(timeSignature\) \{[\s\S]*?\n  \}/)?.[0];
assert.ok(helperSource, "The shared metronome pulse helper must exist.");
const metronomePulseOffsets = vm.runInNewContext(`(${helperSource})`);

test("compound time uses dotted-crotchet metronome beats", () => {
  assert.deepEqual([...metronomePulseOffsets({ id: "6/8", beats: 3 })], [0, 1.5]);
  assert.deepEqual([...metronomePulseOffsets({ id: "9/8", beats: 4.5 })], [0, 1.5, 3]);
  assert.deepEqual([...metronomePulseOffsets({ id: "12/8", beats: 6 })], [0, 1.5, 3, 4.5]);
});

test("simple time keeps one click per crotchet beat", () => {
  assert.deepEqual([...metronomePulseOffsets({ id: "2/4", beats: 2 })], [0, 1]);
  assert.deepEqual([...metronomePulseOffsets({ id: "3/4", beats: 3 })], [0, 1, 2]);
  assert.deepEqual([...metronomePulseOffsets({ id: "4/4", beats: 4 })], [0, 1, 2, 3]);
});

test("all affected Hub activities use the shared compound-time pulse calculation", () => {
  [
    "practicequestions.html",
    "wheredidthemusicstop.html",
    "missingnotes.html",
    "dynamics.html",
  ].forEach((file) => {
    const source = fs.readFileSync(file, "utf8");
    assert.match(source, /metronomePulseOffsets\(/, `${file} must use the shared metronome pulse calculation.`);
  });
});
