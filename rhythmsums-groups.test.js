"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("rhythmsums.html", "utf8");
const beamedRhythmsSource = source.match(/const BEAMED_RHYTHMS = \[[\s\S]*?\n\];/)[0];
const beamedPoolSource = source.match(/function beamedPoolFromSettings\(settings\) \{[\s\S]*?\n\}/)[0];
const beamedPoolFromSettings = new Function(
  `${beamedRhythmsSource}\n${beamedPoolSource}\nreturn beamedPoolFromSettings;`
)();

function settings(enabledItems) {
  return {
    enabledItems,
    enabledBeamedItems: [
      "two-quavers",
      "four-semiquavers",
      "dotted-quaver-semiquaver",
      "scotch-snap",
      "triplet-quavers",
      "triplet-crotchets",
    ],
    includeBeamedGroups: true,
  };
}

test("groups only use rhythms selected by the pupil", () => {
  const pool = beamedPoolFromSettings(settings(["crotchet", "quaver", "dotted-quaver"]));

  assert.deepEqual(pool.map((item) => item.id), [
    "two-quavers",
    "triplet-quavers",
    "triplet-crotchets",
  ]);
  assert.equal(pool.some((item) => item.rhythms.includes("semiquaver")), false);
});

test("semiquaver groups return when semiquavers are selected", () => {
  const pool = beamedPoolFromSettings(settings(["crotchet", "quaver", "semiquaver", "dotted-quaver"]));

  assert.deepEqual(pool.map((item) => item.id), [
    "two-quavers",
    "four-semiquavers",
    "dotted-quaver-semiquaver",
    "scotch-snap",
    "triplet-quavers",
    "triplet-crotchets",
  ]);
});

test("turning groups off removes all grouped rhythms", () => {
  const current = settings(["crotchet", "quaver", "semiquaver", "dotted-quaver"]);
  current.includeBeamedGroups = false;

  assert.deepEqual(beamedPoolFromSettings(current), []);
});
