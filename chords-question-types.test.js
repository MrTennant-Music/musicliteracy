"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("chords.html", "utf8");

test("National 5 Chords offers both requested question-type toggles", () => {
  assert.match(source, /DEFAULT_N5_CUSTOMISE = \{ chordProgression:true, identifyChord:true \}/);
  assert.match(source, /\{ id:"chordProgression", label:"Chord Progression", glyph:"V-I" \}/);
  assert.match(source, /glyph=\{<span className="min-w-\[34px\] text-center text-xs font-black">\{row\.glyph\}<\/span>\}/);
  assert.match(source, /label:"Chord Progression"/);
  assert.match(source, /label:"Identify Chord"/);
  assert.match(source, /<window\.MLH\.MenuSubheading>Question Types<\/window\.MLH\.MenuSubheading>/);
});

test("National 5 question generation follows the enabled question types", () => {
  assert.match(source, /if\(n5Customise\.chordProgression\) pool\.push\(makeN5ChordSequenceQuestion\)/);
  assert.match(source, /if\(n5Customise\.identifyChord\) pool\.push\(makeN5Question\)/);
  assert.match(source, /if\(!next\.chordProgression&&!next\.identifyChord\) return current;/);
  assert.match(source, /newQuestion\("N5",ahCustomise,nextN5Customise\)/);
});
