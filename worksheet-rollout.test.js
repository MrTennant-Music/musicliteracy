const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const index = fs.readFileSync("index.html", "utf8");
const activities = [...index.matchAll(/href: "([^"]+\.html)"[^\n]+audio: (true|false)/g)]
  .map((match) => ({ file: match[1], audio: match[2] === "true" }));
const intentionallyExcluded = new Set(["rhythmmatch.html"]);
const mixedActivityExceptions = new Set(["accidentals.html", "chords.html", "articulation.html", "missingnotes.html", "practicequestions.html"]);
const eligible = activities.filter(({ audio, file }) => (!audio || mixedActivityExceptions.has(file)) && !intentionallyExcluded.has(file));

for (const { file } of eligible) {
  assert.match(fs.readFileSync(file, "utf8"), /worksheetConfig/, `${file} should enable worksheet mode`);
}
for (const { file } of activities.filter(({ audio, file }) => audio && !mixedActivityExceptions.has(file))) {
  assert.doesNotMatch(fs.readFileSync(file, "utf8"), /worksheetConfig/, `${file} requires audio and must remain disabled`);
}
assert.doesNotMatch(fs.readFileSync("rhythmmatch.html", "utf8"), /worksheetConfig/, "Rhythm Identification was explicitly excluded");

const generic = fs.readFileSync("worksheet-generic.jsx", "utf8");
const outlineContext = { window: {} };
vm.runInNewContext(fs.readFileSync("bravura-worksheet-outlines.js", "utf8"), outlineContext);
const worksheetOutlines = outlineContext.window.BRAVURA_WORKSHEET_OUTLINES?.symbols || {};
for (const symbol of ["gClef", "fClef", "noteheadBlack", "wholeNote", "quarterNoteStemUp", "quarterNoteStemDown", "eighthNoteStemUp", "eighthNoteStemDown", "sharp", "flat", "natural", "repeatLeft", "repeatRight"]) {
  assert.ok(worksheetOutlines[symbol]?.path, `Worksheet PDFs need a vector outline for ${symbol}`);
}
for (const { file } of eligible.filter(({ file }) => file !== "intervals.html")) {
  assert.match(generic, new RegExp(`${file.replace(".html", "")}:\\s*\\{`), `${file} needs a generator definition`);
}
assert.match(fs.readFileSync("chords.html", "utf8"), /activeLevel==="N5"\|\|activeLevel==="AH"/, "Chords worksheets must stay disabled at Higher");
assert.match(fs.readFileSync("missingnotes.html", "utf8"), /activeLevel==="N3"\|\|activeLevel==="N4"/, "Melodic Dictation worksheets must stay limited to National 3 and National 4");
assert.match(fs.readFileSync("practicequestions.html", "utf8"), /excludeRhythmIdentification: true/, "Mixed Practice Questions must exclude Rhythm Identification");
assert.match(generic, /function EmphasisedPrompt/, "Generic worksheets must emphasise the musical variable in each question");
assert.match(generic, /\\b\(\?:tone\|semitone\)\\b/, "Standalone tone and semitone words must be emphasised in worksheet questions");
assert.match(generic, /function WorksheetOutlineGlyph/, "Generic worksheet music symbols must render as vector outlines");
assert.doesNotMatch(generic, /className="music-symbol"/, "Generic worksheet notation must not rely on font glyphs during PDF capture");
assert.match(generic, /function AccidentalsStaff/, "Accidentals worksheets must use their calibrated stave renderer");
assert.match(generic, /accidentals-staff-fade/, "Accidentals worksheet staves must fade out on the right");
assert.match(generic, /worksheetSymbolSettings/, "Accidentals worksheet symbols must use the shared notation calibration");
assert.match(generic, /function accidentalIdentificationQuestion/, "Accidentals worksheets must generate identification questions containing accidentals");
assert.match(generic, /function accidentalCreationQuestion/, "Accidentals worksheets must generate note-writing questions requiring accidentals");
assert.match(generic, /index%3!==0/, "Accidentals worksheets must guarantee a balanced mixture of accidental and natural-note questions");
assert.match(generic, /value === -1 \|\| value === 1/, "Isolated worksheet notes must not display redundant natural signs");
assert.match(generic, /question\.answerAccidental/, "Accidentals worksheet answers must render the required accidental");
assert.doesNotMatch(generic, /prepareBravuraForPdf/, "Vector worksheet PDFs must not depend on custom-font loading workarounds");
assert.match(generic, /!answers&&data\.marks&&pageIndex===pages\.length-1/, "Generic worksheets must hide total marks when Marks is disabled");
assert.match(generic, /total-marks-box relative h-8 w-24/, "Generic preview total box must align vertically with its label");
assert.match(generic, /total-marks-value absolute left-2 right-2 text-right leading-none/, "Generic total must remain right-aligned inside its box");
assert.match(generic, /mb-\[3px\] h-px min-w-8 flex-1 bg-black/, "Generic worksheet must use explicit, PDF-stable pupil detail lines");
assert.doesNotMatch(generic, /inline-block w-3\/4 border-b/, "Generic worksheet must not rely on inline baselines for pupil detail lines");
const intervalWorksheet = fs.readFileSync("worksheet-generator.html", "utf8");
assert.match(intervalWorksheet, /\.pdf-capture \.total-marks-box \{ top: 3px; \}/, "PDF capture must retain its separate total-box alignment correction");
assert.match(intervalWorksheet, /\.total-marks-value \{ top: 8px; \}/, "Preview total must be vertically centred inside its box");
assert.match(intervalWorksheet, /\.pdf-capture \.total-marks-value \{ top: 3px; \}/, "PDF total must retain its separate vertical correction");
assert.match(intervalWorksheet, /function safePdfTitle/, "All worksheet PDFs must share one filename cleaner");
assert.match(intervalWorksheet, /replace\(\/\\s\*\[·•\]\\s\*\/g, " - "\)/, "PDF titles must normalise spacing around their separator");
const safePdfTitleSource = intervalWorksheet.match(/function safePdfTitle[\s\S]*?\n}/)?.[0];
const filenameContext = {};
vm.runInNewContext(`${safePdfTitleSource}; result = safePdfTitle("Accidentals · National 5");`, filenameContext);
assert.equal(filenameContext.result, "Accidentals - National 5", "PDF filenames must use single spaces around the hyphen");
assert.match(intervalWorksheet, /const safeTitle = safePdfTitle\(previewWorksheet\.title/, "Intervals PDFs must use the shared filename cleaner");
assert.match(generic, /window\.MLH\.safePdfTitle\(title, DEF\.title\)/, "Generic worksheet PDFs must use the shared filename cleaner");
assert.match(generic, /grid-cols-\[minmax\(0,1fr\)_max-content_max-content\]/, "Generic worksheet options must use aligned content-sized checkbox columns");
assert.match(intervalWorksheet, /grid-cols-\[minmax\(0,1fr\)_max-content_max-content\]/, "Intervals worksheet options must use aligned content-sized checkbox columns");
assert.match(generic, /whitespace-nowrap text-sm/, "Generic worksheet checkbox labels must stay on one line");
assert.match(intervalWorksheet, /whitespace-nowrap text-sm/, "Intervals worksheet checkbox labels must stay on one line");
assert.match(generic, /px-3 py-2 font-normal" value=\{title\}/, "Generic worksheet title text must use normal weight");
assert.match(generic, /Instructions<textarea[^>]*resizeWorksheetTextarea[^>]*resize-none overflow-hidden/, "Generic worksheet instructions must wrap and grow automatically");
assert.match(intervalWorksheet, /const fieldClass = "[^"]*font-normal"/, "Intervals worksheet text fields must use normal weight");
assert.match(intervalWorksheet, /function resizeWorksheetTextarea/, "All worksheet instruction fields must share one automatic resize helper");
assert.match(intervalWorksheet, /Instructions<textarea[^>]*resizeWorksheetTextarea/, "Intervals worksheet instructions must wrap and grow automatically");
assert.match(intervalWorksheet, /worksheet\.includeMarks && pageIndex === pages\.length - 1/, "Intervals preview must hide total marks when Marks is disabled");
assert.match(intervalWorksheet, /previewWorksheet\.includeMarks && !answerSheet && pageIndex === questionGroups\.length - 1/, "Intervals PDFs must hide total marks when Marks is disabled");
assert.match(generic, /root position\|first inversion\|second inversion/, "Chord positions must be included in worksheet emphasis");
console.log(`Worksheet rollout checks passed for ${eligible.length} activities.`);
