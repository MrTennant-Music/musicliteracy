const assert = require("node:assert/strict");
const core = require("./name-randomiser-core.js");

assert.equal(core.chooseIndex(4, () => 0), 0, "The first random interval should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.2499), 0, "Values below one quarter should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.25), 1, "Each segment should receive an equal random interval");
assert.equal(core.chooseIndex(4, () => 0.999999), 3, "The final random interval should select the final segment");
assert.equal(core.chooseIndex(0, () => 0.5), -1, "An empty wheel should not select a segment");

const paired = core.cleanSegment({ id: "pair-1", names: [" Jamie   Smith ", "Erin Jones", ""] });
assert.deepEqual(paired, { id: "pair-1", names: ["Jamie Smith", "Erin Jones"] }, "A segment should retain several separate names and normalise harmless spacing");

const originalSegments = [{ id: "a", names: ["Jamie Smith", "Erin Jones"] }, { id: "b", names: ["Lewis"] }];
const copiedSegments = core.copySegments(originalSegments);
copiedSegments[0].names[0] = "Changed";
assert.equal(originalSegments[0].names[0], "Jamie Smith", "Loading a saved list must not mutate the saved copy");

const saved = core.saveList([], { id: "s2", title: " S2 Music ", segments: originalSegments });
assert.equal(saved.length, 1);
assert.equal(saved[0].title, "S2 Music");
assert.equal(saved[0].segments[0].names.length, 2, "Saved lists should preserve paired segments");
const updated = core.saveList(saved, { id: "s2", title: "S2 Music", segments: [originalSegments[1]] });
assert.equal(updated.length, 1, "Updating a saved list should not create a duplicate");
assert.equal(updated[0].segments.length, 1);

const restored = core.cleanPersistence({
  currentSegments: originalSegments,
  savedLists: saved,
  activeSavedId: "s2",
  draftNames: ["Draft name", ""],
  soundEffects: false,
});
assert.equal(restored.currentSegments.length, 2);
assert.equal(restored.activeSavedId, "s2");
assert.deepEqual(restored.draftNames, ["Draft name", ""]);
assert.equal(restored.soundEffects, false);

assert.deepEqual(core.removeSegment(originalSegments, "a"), [{ id: "b", names: ["Lewis"] }], "Removing a result should remove only that segment");

console.log("Name Randomiser core tests passed.");
