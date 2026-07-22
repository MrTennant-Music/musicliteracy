const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const page = fs.readFileSync(path.join(root, "name-randomiser.html"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

[
  "Name Randomiser",
  "Randomly select students to perform, participate in activities or answer questions.",
  "names-icon.svg",
  "name-randomiser-core.js",
  "window.MLH.AppHeader",
  "window.MLH.CustomiseButton",
  "Sound effects",
  "spin.mp3",
  "playFeedbackSound?.(true, true, \"bronze\")",
  "Add another name",
  "Add to wheel",
  "Current wheel",
  "Saved lists",
  "Save current list",
  "Remove and spin again",
  "Keep and spin again",
  "localStorage",
  "role=\"dialog\"",
  "aria-live=\"polite\"",
  "prefers-reduced-motion: reduce",
  "footer.js",
].forEach((required) => assert(page.includes(required), `Missing Name Randomiser safeguard: ${required}`));

assert(page.includes("nextSegments.length < 2"), "The wheel must require two segments before spinning");
assert(page.includes("const chosenIndex = CORE.chooseIndex(nextSegments.length)"), "The winner must be chosen fairly before the visual landing position is calculated");
assert(page.includes("segment.names.flatMap") && page.includes("wrapName(name, maxChars)"), "Every name in a grouped segment should wrap independently inside its wedge");
assert(page.includes('fill="#fff" stroke="#111"'), "Wheel segments should use the approved white design with black boundaries");
assert(page.includes("Loading") && page.includes("will replace the current wheel"), "Loading a saved list should warn before replacing the wheel");
assert(page.includes("Saved lists will not be affected"), "Clearing the current wheel must not delete saved lists");

assert(index.includes('"Name Randomiser": "names-icon.svg"'), "The Hub should map the supplied Name Randomiser icon");
assert(index.includes('href: "name-randomiser.html", title: "Name Randomiser"'), "The Name Randomiser should appear in the Hub app data");
assert(index.indexOf('{ category: "Other"') < index.indexOf('href: "name-randomiser.html"'), "The Name Randomiser should be listed under Other");

console.log("Name Randomiser integration tests passed.");
