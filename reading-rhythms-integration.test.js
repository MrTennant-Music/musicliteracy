const assert = require("node:assert/strict");
const fs = require("node:fs");

const page = fs.readFileSync("readingrhythms.html", "utf8");
const index = fs.readFileSync("index.html", "utf8");

[
  'READY: "ready"', 'COUNTING: "countingIn"', 'PERFORMING: "performing"', 'CALCULATING: "calculating"', 'RESULTS: "results"', 'REFERENCE: "playingReference"',
  'min="60" max="120" step="5"', 'useState(90)', 'event.repeat', 'event.button !== 0', 'performance.now()', 'visibilitychange',
  'playMetronomeClick', 'Hear Correct Rhythm', 'Try Again', 'New Rhythm', 'aria-live="polite"', 'role="region"', 'tabIndex="0"',
  'reading-score-scroll', 'prefers-reduced-motion', 'reading-rhythms-core.js',
  'tap.svg', 'spacebar.svg', 'mouse.svg', 'pulsesPerBar * 2', 'SHARED_NOTATION_CONFIG',
  'quarterNoteStemUp', 'augmentationDot', 'secondaryBeamSegments', 'glyph("tie"',
  'hub-mobile.js', 'hub-audio.js', 'hub-shell.js', 'hub-menu.js', 'footer.js',
  'Compound time • Rests • Triplets', '5/4 • Ties • Syncopation',
].forEach((requiredText) => assert(page.includes(requiredText), `Missing integration safeguard: ${requiredText}`));

assert(index.includes('href: "readingrhythms.html"'), "Reading Rhythms card is missing from index.html");
assert(index.includes('"Reading Rhythms": "readingrhythm-icon.svg"'), "Reading Rhythms icon mapping is missing");
assert(page.includes('event.target.closest("button,input,select,a,[data-menu-panel],[data-menu-trigger]")'), "Pointer taps on controls must be ignored");
assert(page.includes('event.target.closest?.("button,input,select,textarea,a")'), "Spacebar taps inside controls must be ignored");
assert(!page.includes('absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80'), "Count-in must not obscure the music");
assert(!page.includes('{rhythm.timeSignature.id} time'), "The redundant written time-signature label must be removed");

console.log("Reading Rhythms integration checks passed.");
