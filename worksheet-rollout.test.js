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
for (const symbol of ["brace", "gClef", "fClef", "noteheadBlack", "wholeNote", "halfNoteStemUp", "halfNoteStemDown", "quarterNoteStemUp", "quarterNoteStemDown", "eighthNoteStemUp", "eighthNoteStemDown", "sharp", "flat", "natural", "repeatLeft", "repeatRight"]) {
  assert.ok(worksheetOutlines[symbol]?.path, `Worksheet PDFs need a vector outline for ${symbol}`);
}
for (const { file } of eligible.filter(({ file }) => file !== "intervals.html")) {
  assert.match(generic, new RegExp(`${file.replace(".html", "")}:\\s*\\{`), `${file} needs a generator definition`);
}
assert.match(fs.readFileSync("chords.html", "utf8"), /activeLevel==="N5"\|\|\(activeLevel==="AH"&&\(ahCustomise\.insertPosition\|\|ahCustomise\.createBassLine\)\)/, "Chords worksheets must stay disabled at Higher and when no written Advanced Higher type is enabled");
assert.match(fs.readFileSync("chords.html", "utf8"), /function ahSymbolOrChordLabel/, "The Chords activity must share a Roman-numeral-or-chord label formatter");
assert.match(fs.readFileSync("chords.html", "utf8"), /ahSymbolOrChordLabel\(question\.key,item\.symbol,item\.chord\)/, "The Chords activity tables must always show both accepted chord labels");
assert.match(fs.readFileSync("chords.html", "utf8"), /inversionLabel\(item\.inversion\)\|\|"Root"/, "The Chords activity bass table bottom row must use consistent position names");
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
assert.match(generic, /Name the outlined chord – your options are C major, F major, G major or A minor\./, "National 5 chord worksheets must show the full instruction once in the subtitle");
assert.match(generic, /function N5ChordStaff/, "National 5 chord worksheets must use their calibrated stave renderer");
assert.match(generic, /n5-chord-staff-fade/, "National 5 chord worksheet staves must fade out on the right");
assert.match(generic, /chordNotes:shuffled\(chord\.notes\)/, "National 5 chord worksheet notes must come from the chord being answered");
assert.match(generic, /prompt:"",chordNotes/, "National 5 chord boxes must not repeat the instruction");
assert.match(generic, /compactChord/, "National 5 chord boxes must retain numbering without repeated question text");
assert.match(generic, /showNoteNames \? <text[^>]*>\{note\.letter\}<\/text>/, "The National 5 chord example must label every note used to form the answer");
assert.match(generic, /showNoteNames=\{example\}/, "Chord note labels must appear only in the example box");
assert.match(generic, /Write the chord and position or draw in the bass note for the given chord\./, "Advanced Higher chord worksheets must explain their two written question types once in the subtitle");
assert.match(generic, /const ahType=forcedAHType\|\|AH_WORKSHEET_TYPES\[Math\.abs\(index\)%AH_WORKSHEET_TYPES\.length\]/, "Advanced Higher chord worksheets must use only the written types enabled in the source profile");
assert.match(generic, /function AHChordStaff/, "Advanced Higher chord worksheets must use their calibrated grand-stave renderer");
assert.match(generic, /ah-chord-staff-fade/, "Advanced Higher chord worksheet staves must fade out on the right");
assert.match(generic, /CONFIG\.activityId === "chords" && level === "AH"\) \? 4 : 6/, "Advanced Higher chord worksheets must use four questions per page");
assert.match(generic, /const ahItems=\[first,second\]/, "Advanced Higher chord questions must use the same two-chord structure as the mobile activity");
assert.match(generic, /question\.ahItems\.map/, "Advanced Higher chord worksheets must render both mobile-view chord columns");
assert.match(generic, /symbolKey="brace"/, "Advanced Higher grand staves must use the Bravura brace outline");
assert.match(generic, /const drawStack=/, "Advanced Higher chords must join their Bravura noteheads to one shared stem");
assert.match(generic, /if\(accidentalIndices\.length<=1\)return 0/, "A single Advanced Higher chord accidental must sit beside its note");
assert.doesNotMatch(generic, /toneIndex\*gap\*\.85/, "Advanced Higher chord accidentals must not be spaced by their tone index");
assert.match(generic, /trebleTop=54, bassTop=139/, "Advanced Higher sheet music must sit another 10px lower while preserving the 15px larger gap between staves");
assert.match(generic, /chordXs=\[122,220\], keyX=58/, "Advanced Higher key signatures and both chord positions must sit 20px farther left");
assert.match(generic, /columnWidth=140, rowHeight=43/, "Advanced Higher paper answer boxes must be 25 percent larger");
assert.match(generic, /tableX=20, tableY=199/, "The enlarged Advanced Higher chord boxes must remain centred and vertically aligned");
assert.match(generic, /fontSize="16" fontWeight="700"/, "Advanced Higher chord-box labels must use the confirmed 16px size");
assert.match(generic, /The key is <tspan fontWeight="700">\{question\.key\.name\}<\/tspan>\./, "Every Advanced Higher chord worksheet question must state its key below the chord boxes");
assert.match(generic, /viewBox="0 0 320 315"/, "Advanced Higher chord notation must leave room for the key statement below its chord boxes");
assert.match(generic, /question\.ahType==="position"\|\|itemIndex===0\|\|completed/, "Advanced Higher bass questions must supply the first bass note and leave the second for the pupil");
assert.match(generic, /response:"mark"/, "Advanced Higher answers must remain inside the mobile-style notation and table");
assert.match(generic, /Identify the chord and its position\. The first has been done for you\./, "Advanced Higher chord-position questions must include their specific instruction");
assert.match(generic, /Insert the correct note in the bass line using the chord information provided\./, "Advanced Higher bass-line questions must include their specific instruction");
assert.match(generic, /smallAHChordPrompt\?"text-xs":""/, "Advanced Higher chord instructions must use smaller 12px text without shrinking question numbers");
assert.match(generic, /completed&&question\.ahType==="bass"\?<rect className="ah-answer-highlight"/, "Advanced Higher bass answers must be highlighted around the inserted note");
assert.match(generic, /completed&&question\.ahType==="position"\?<rect className="ah-answer-highlight"/, "Advanced Higher chord-and-position answers must highlight the completed right-hand column");
assert.match(generic, /answerIsInAHNotation/, "Advanced Higher answers must not be repeated as text below the notation");
assert.match(generic, /topLabel=`\$\{item\.symbol\} or \$\{item\.chordName\}`, bottomLabel=shortPosition\(item\.inversion\)/, "Both Advanced Higher worksheet question types must show Roman numeral or chord name above the position");
assert.doesNotMatch(generic, /const romanPosition=/, "Advanced Higher bass tables must not use compact Roman inversion codes in the position row");
assert.match(generic, /AH_WORKSHEET_TYPES\.map\(\(type,typeIndex\)=>makeQuestion\(-1-typeIndex,type\)\)/, "Advanced Higher chord worksheets must create one example for each enabled written question type");
assert.match(generic, /i<examples\.length/, "Both Advanced Higher examples must occupy the first worksheet row");
assert.match(generic, /i-examples\.length\+1/, "Numbered Advanced Higher questions must begin at 1 after both examples");
assert.match(generic, /CONFIG\.settings\.ahCustomise\.createBassLine\?"bass":null/, "Advanced Higher worksheet generation must carry over the Create Bass Line profile setting");
assert.match(generic, /CONFIG\.settings\.ahCustomise\.insertPosition\?"position":null/, "Advanced Higher worksheet generation must carry over the Insert Chord and Position profile setting");
const carriedWorksheetSettings = {
  enharmonics: ["options"],
  keysig: ["modes"],
  notenaming: ["treble", "bass", "ledger", "accidentals", "advancedRange"],
  tonic: ["questionTypes"],
  transposing: ["questionOptions"],
  barlines: ["enabledRhythms"],
  rests: ["enabledOptions"],
  rhythmsums: ["enabledItems", "enabledBeamedItems", "enabledOperators", "includeBeamedGroups"],
  timesig: ["enabledRhythms"],
  accidentals: ["enabledAccidentals"],
  articulation: ["enabledMarkings", "enabledTypes"],
  practicequestions: ["enabledQuestionTypes"],
};
for (const [activityId, settingNames] of Object.entries(carriedWorksheetSettings)) {
  for (const settingName of settingNames) {
    assert.match(generic, new RegExp(`\\b${settingName}\\b`), `${activityId} worksheets must read the ${settingName} source setting`);
  }
}
assert.match(generic, /function configuredTimeSignatures/, "Rhythm-based worksheets must share the selected time-signature filter");
assert.match(generic, /const types=selected\.length\?selected/, "Practice Question worksheets must be built from the selected written question types");
assert.match(generic, /types\[Math\.abs\(index\)%types\.length\]/, "Practice Question worksheets must not reintroduce disabled written question types");
assert.match(generic, /selected=CONFIG\.settings\?\.enabledMarkings\|\|\[\]/, "Articulation worksheets must use only selected markings");
assert.match(generic, /types=CONFIG\.settings\?\.enabledTypes\|\|\[\]/, "Articulation worksheets must use only selected written question types");
assert.match(generic, /selected=enabledKeys\(CONFIG\.settings\?\.enabledOptions,"rest-"\)/, "Rests worksheets must use only selected rest values");
assert.match(generic, /const pool=configuredRhythmPool\(\)/, "Rhythm Sums worksheets must use the selected rhythm pool");
assert.doesNotMatch(generic, /prepareBravuraForPdf/, "Vector worksheet PDFs must not depend on custom-font loading workarounds");
assert.match(generic, /!answers&&data\.marks&&pageIndex===pages\.length-1/, "Generic worksheets must hide total marks when Marks is disabled");
assert.match(generic, /total-marks-box relative h-8 w-24/, "Generic preview total box must align vertically with its label");
assert.match(generic, /total-marks-value absolute left-2 right-2 text-right leading-none/, "Generic total must remain right-aligned inside its box");
assert.match(generic, /mb-\[3px\] h-px min-w-8 flex-1 bg-black/, "Generic worksheet must use explicit, PDF-stable pupil detail lines");
assert.doesNotMatch(generic, /inline-block w-3\/4 border-b/, "Generic worksheet must not rely on inline baselines for pupil detail lines");
const intervalWorksheet = fs.readFileSync("worksheet-generator.html", "utf8");
assert.match(intervalWorksheet, /\.pdf-capture \.pupil-detail-line \{ transform: translateY\(10px\); \}/, "PDF capture must correct the pupil detail line position");
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
