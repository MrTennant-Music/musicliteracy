const assert = require("node:assert/strict");
const core = require("./name-randomiser-core.js");

assert.equal(core.chooseIndex(4, () => 0), 0, "The first random interval should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.2499), 0, "Values below one quarter should select the first segment");
assert.equal(core.chooseIndex(4, () => 0.25), 1, "Each segment should receive an equal random interval");
assert.equal(core.chooseIndex(4, () => 0.999999), 3, "The final random interval should select the final segment");
assert.equal(core.chooseIndex(0, () => 0.5), -1, "An empty wheel should not select a segment");
assert.equal(core.capitaliseNameInput("jamie smith"), "Jamie Smith", "The first letter and each letter after a space should be capitalised");
assert.equal(core.capitaliseNameInput("Érin  jones"), "Érin  Jones", "Capitalisation should support names with accented letters without changing typed spacing");
assert.equal(core.normaliseNameKey("  JOHN   Smith "), "john smith", "Duplicate checks should ignore capitalisation and harmless extra spaces");
assert.equal(core.hasName([{ id: "john", names: ["John"] }], " john "), true, "An existing pupil should be recognised regardless of capitalisation");
assert.equal(core.hasName([{ id: "john-1", names: ["John 1"] }], "John 2"), false, "Numbered pupils should remain distinct names");
assert.deepEqual(core.uniqueNewNames("John\nJOHN\nJohn 1\nJohn 2\n Debra ", [{ id: "debra", names: ["Debra"] }]), ["John", "John 1", "John 2"], "A pasted class should keep unique names and skip duplicates within the list or current randomiser");

const paired = core.cleanSegment({ id: "pair-1", names: [" Jamie   Smith ", "Erin Jones", ""] });
assert.deepEqual(paired, { id: "pair-1", names: ["Jamie Smith", "Erin Jones"] }, "Legacy grouped data should be readable and normalise harmless spacing before migration");
assert.deepEqual(core.cleanSegments([{ id: "a", names: ["Jamie"] }, { id: "b", names: [" jamie "] }, { id: "c", names: ["Lewis"] }]).map((segment) => segment.names[0]), ["Jamie", "Lewis"], "Old stored data should not be able to restore duplicate pupil names");

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
assert.equal(Object.hasOwn(restored, "borderSymbols"), false, "The removed Symbols preference should no longer be restored");
assert.equal(restored.segmentColour, core.MULTI_SEGMENT_COLOUR, "Saved data without a colour choice should use the new Multi default");
assert.equal(restored.randomiserMethod, "Wheel", "Older saved data should retain Wheel as the default method");
assert.equal(core.cleanPersistence({ segmentColour: "#dbeafe" }).segmentColour, "#dbeafe", "A supported pastel segment colour should be restored");
assert.deepEqual(core.SEGMENT_COLOURS.slice(0, 3).map((colour) => colour.label), ["Multi", "White", "Black"], "Multi should be first, followed by White and Black in the colour picker");
assert.deepEqual(core.segmentColourPalette("#fee2e2"), ["#fca5a5", "#fee2e2"], "A selected pastel should alternate with its fixed stronger companion");
assert.deepEqual(core.segmentColourPalette("#ffffff"), ["#fafaf9", "#ffffff"], "White should alternate with the Sound Effects control grey");
assert.deepEqual(core.segmentColourPalette("#111111"), ["#ffffff", "#111111"], "Black should alternate with White");
assert.deepEqual(core.segmentColourPalette("unsupported"), ["#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7", "#dbeafe", "#ede9fe"], "An unsupported colour should safely use the Multi palette");
assert.equal(core.SEGMENT_COLOURS[0].label, "Multi", "Multi should be the first colour option");
assert.equal(core.SEGMENT_COLOURS.some((colour) => colour.label === "Orange"), false, "Orange should no longer appear as a standalone option");
assert.deepEqual(core.segmentColourPalette(core.MULTI_SEGMENT_COLOUR), ["#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7", "#dbeafe", "#ede9fe"], "Multi should cycle through the approved fixed pastel palette");
assert.equal(core.spinControlColour("#ffffff"), "#111111", "White should retain black Spin controls");
assert.equal(core.spinControlColour("#111111"), "#111111", "Black should retain black Spin controls");
assert.equal(core.spinControlColour("#fee2e2"), "#fca5a5", "Pastel colours should use their stronger companion for Spin controls");
assert.equal(core.spinControlColour(core.MULTI_SEGMENT_COLOUR), "#ffffff", "Multi should use a white arrow while its Spin button remains black");
assert.equal(core.cleanSegmentColour("#ffedd5"), core.MULTI_SEGMENT_COLOUR, "The former standalone Orange preference should migrate to Multi");
assert.equal(core.cleanSegmentColour("#f5f5f4"), "#ffffff", "The former light-grey default should migrate to White");
assert.equal(core.cleanPersistence({ segmentColour: "#111111" }).segmentColour, "#111111", "The black wheel colour should be restored");
assert.equal(core.cleanPersistence({ segmentColour: "hotpink" }).segmentColour, core.MULTI_SEGMENT_COLOUR, "Unsupported colours should safely fall back to Multi");
assert.equal(core.cleanPersistence({ randomiserMethod: "Rows" }).randomiserMethod, "Rows", "The Rows method should be restored");
assert.equal(core.cleanPersistence({ randomiserMethod: "Slots" }).randomiserMethod, "Rows", "The former Slots name should migrate to Rows");
assert.equal(core.cleanPersistence({ randomiserMethod: "Puggie" }).randomiserMethod, "Rows", "The former Puggie name should migrate to Rows");
assert.equal(core.cleanPersistence({ randomiserMethod: "Cards" }).randomiserMethod, "Wheel", "Unknown methods should safely fall back to Wheel");
assert.deepEqual(core.classListNumbering("Emma\n\nemma\nLewis\n  Lewis  \nSophie"), { count: 3, numbers: [1, null, null, 2, null, 3] }, "Class numbering should exclude blank and repeated names while preserving their visual rows");
assert.deepEqual(core.classListNumbering("Emma\nLewis", [{ id: "existing", names: ["Emma"] }]), { count: 1, numbers: [null, 1] }, "Add Class numbering should exclude students already in the randomiser");

assert.deepEqual(core.removeSegment([{ id: "a", names: ["Jamie Smith"] }, { id: "b", names: ["Lewis"] }], "a"), [{ id: "b", names: ["Lewis"] }], "Removing a result should remove only that name");

console.log("Name Randomiser core tests passed.");
