"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const read = (file) => fs.readFileSync(file, "utf8");

test("the shared touch-drag safeguard blocks scrolling without duplicate listeners", () => {
  const context = { window: {} };
  vm.runInNewContext(read("hub-input.js"), context);

  const listeners = new Map();
  const surface = {
    style: {},
    addEventListener(type, handler, options) {
      assert.equal(options.passive, false);
      listeners.set(type, handler);
    },
  };

  const protect = context.window.MLH.preventTouchScrollWhileDragging;
  protect(surface);
  protect(surface);

  assert.equal(surface.style.touchAction, "none");
  assert.equal(surface.style.overscrollBehavior, "contain");
  assert.deepEqual([...listeners.keys()].sort(), ["touchmove", "touchstart"]);

  const event = {
    cancelable: true,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
  };
  listeners.get("touchmove")(event);
  assert.equal(event.defaultPrevented, true);
});

test("standalone stave-placement activities use the shared safeguard", () => {
  const expectedUses = {
    "enharmonics.html": 1,
    "intervals.html": 1,
    "transposing.html": 2,
    "chords.html": 1,
    "keysig.html": 1,
  };

  Object.entries(expectedUses).forEach(([file, expected]) => {
    const source = read(file);
    assert.match(source, /hub-input\.js\?v=1\.4/);
    assert.equal(
      (source.match(/preventTouchScrollWhileDragging/g) || []).length,
      expected,
      `${file} must protect every stave drag target`,
    );
  });
});

test("Practice Questions and Follow the Score protect every note-placement variant", () => {
  ["practicequestions.html", "wheredidthemusicstop.html"].forEach((file) => {
    const source = read(file);
    assert.match(source, /hub-input\.js\?v=1\.4/);
    assert.equal((source.match(/preventTouchScrollWhileDragging/g) || []).length, 2);
    assert.match(source, /addEventListener\("touchstart", blockScroll, \{ passive: false \}\)/);
    assert.match(source, /addEventListener\("touchmove", blockScroll, \{ passive: false \}\)/);
  });

  const missingNotes = read("missingnotes.html");
  assert.match(missingNotes, /addEventListener\("touchstart", blockScroll, \{ passive: false \}\)/);
  assert.match(missingNotes, /addEventListener\("touchmove", blockScroll, \{ passive: false \}\)/);
});

test("Digital Question Paper note-entry targets use the same safeguard", () => {
  const page = read("interactive-exams/exam.html");
  const notation = read("interactive-exams/exam-notation.js");
  const styles = read("interactive-exams/styles.css");

  assert.match(page, /\.\.\/hub-input\.js\?v=1\.4/);
  assert.match(notation, /includes\("q3-note-hit-area"\)[\s\S]*preventTouchScrollWhileDragging/);
  assert.match(styles, /\.q3-note-hit-area[^}]*touch-action:\s*none/);
});
