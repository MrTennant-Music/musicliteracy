const assert = require("node:assert/strict");
const core = require("./name-randomiser-core.js");

assert.equal(core.chooseIndex(4, () => 0), 0, "The first random interval should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.2499), 0, "Values below one quarter should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.25), 1, "Each segment should receive an equal random interval");
assert.equal(core.chooseIndex(4, () => 0.999999), 3, "The final random interval should select the final segment");
assert.equal(core.chooseIndex(0, () => 0.5), -1, "An empty wheel should not select a segment");
assert.equal(core.capitaliseNameInput("jamie smith"), "Jamie Smith", "The first letter and each letter after a space should be capitalised");
assert.equal(core.capitaliseNameInput("Érin  jones"), "Érin  Jones", "Capitalisation should support names with accented letters without changing typed spacing");

const paired = core.cleanSegment({ id: "pair-1", names: [" Jamie   Smith ", "Erin Jones", ""] });
assert.deepEqual(paired, { id: "pair-1", names: ["Jamie Smith", "Erin Jones"] }, "Legacy grouped data should be readable and normalise harmless spacing before migration");

const originalSegments = [{ id: "a", names: ["Jamie Smith", "Erin Jones"] }, { id: "b", names: ["Lewis"] }];
const copiedSegments = core.copySegments(originalSegments);
copiedSegments[0].names[0] = "Changed";
assert.equal(originalSegments[0].names[0], "Jamie Smith", "Loading a saved list must not mutate the saved copy");
assert.equal(copiedSegments.length, 3, "Grouped legacy entries should become individual names");

const saved = core.saveList([], { id: "s2", title: " S2 Music ", segments: originalSegments });
assert.equal(saved.length, 1);
assert.equal(saved[0].title, "S2 Music");
assert.equal(saved[0].segments.length, 3, "Saved lists should store one name per wheel segment");
assert.equal(saved[0].segments[0].names.length, 1);
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
assert.equal(restored.currentSegments.length, 3, "Previously grouped names should migrate to individual wheel segments");
assert.equal(restored.activeSavedId, "s2");
assert.equal(restored.draftName, "Draft Name");
assert.equal(restored.soundEffects, false);
assert.equal(restored.borderSymbols, true, "Older saved data should show decorative border symbols by default");
assert.equal(core.cleanPersistence({ borderSymbols: false }).borderSymbols, false, "The hidden border-symbol preference should be restored");
assert.equal(restored.segmentColour, core.DEFAULT_SEGMENT_COLOUR, "Older saved data should retain the default grey alternating segments");
assert.equal(restored.randomiserMethod, "Wheel", "Older saved data should retain Wheel as the default method");
assert.equal(core.cleanPersistence({ segmentColour: "#dbeafe" }).segmentColour, "#dbeafe", "A supported pastel segment colour should be restored");
assert.deepEqual(core.SEGMENT_COLOURS.slice(0, 2).map((colour) => colour.label), ["Grey", "Black"], "Black should sit immediately to the right of Grey in the colour picker");
assert.equal(core.cleanPersistence({ segmentColour: "#111111" }).segmentColour, "#111111", "The black wheel colour should be restored");
assert.equal(core.cleanPersistence({ segmentColour: "hotpink" }).segmentColour, core.DEFAULT_SEGMENT_COLOUR, "Unsupported colours should safely fall back to grey");
assert.equal(core.cleanPersistence({ randomiserMethod: "Slots" }).randomiserMethod, "Slots", "The Slots method should be restored");
assert.equal(core.cleanPersistence({ randomiserMethod: "Puggie" }).randomiserMethod, "Slots", "The former Puggie name should migrate to Slots");
assert.equal(core.cleanPersistence({ randomiserMethod: "Cards" }).randomiserMethod, "Wheel", "Unknown methods should safely fall back to Wheel");

assert.deepEqual(core.removeSegment([{ id: "a", names: ["Jamie Smith"] }, { id: "b", names: ["Lewis"] }], "a"), [{ id: "b", names: ["Lewis"] }], "Removing a result should remove only that name");

console.log("Name Randomiser core tests passed.");
