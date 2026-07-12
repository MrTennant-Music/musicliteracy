const assert = require("node:assert/strict");
const fs = require("node:fs");

const page = fs.readFileSync("readingrhythms.html", "utf8");
const index = fs.readFileSync("index.html", "utf8");

[
  'READY: "ready"', 'COUNTING: "countingIn"', 'PERFORMING: "performing"', 'CALCULATING: "calculating"', 'RESULTS: "results"', 'REFERENCE: "playingReference"',
  'min="60" max="120" step="5"', 'useState(90)', 'event.repeat', 'event.button !== 0', 'performance.now()', 'visibilitychange',
  'playMetronomeClick', 'Hear Correct Rhythm', 'Try Again', 'New Rhythm', 'aria-live="polite"', 'role="region"', 'tabIndex="0"',
  'reading-score-scroll', 'prefers-reduced-motion', 'dark-mode.js', 'reading-rhythms-core.js',
].forEach((requiredText) => assert(page.includes(requiredText), `Missing integration safeguard: ${requiredText}`));

assert(index.includes('href: "readingrhythms.html"'), "Reading Rhythms card is missing from index.html");
assert(index.includes('"Reading Rhythms": "readingrhythm-icon.svg"'), "Reading Rhythms icon mapping is missing");
assert(page.includes('event.target.closest("button,input,select,a,[data-menu-panel],[data-menu-trigger]")'), "Pointer taps on controls must be ignored");
assert(page.includes('event.target.closest?.("button,input,select,textarea,a")'), "Spacebar taps inside controls must be ignored");

console.log("Reading Rhythms integration checks passed.");
