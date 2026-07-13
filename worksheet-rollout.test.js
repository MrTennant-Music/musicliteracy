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
const hubShell = fs.readFileSync("hub-shell.js", "utf8");
const outlineContext = { window: {} };
vm.runInNewContext(fs.readFileSync("bravura-worksheet-outlines.js", "utf8"), outlineContext);
const worksheetOutlines = outlineContext.window.BRAVURA_WORKSHEET_OUTLINES?.symbols || {};
for (const symbol of ["brace", "gClef", "fClef", "noteheadBlack", "wholeNote", "halfNoteStemUp", "halfNoteStemDown", "quarterNoteStemUp", "quarterNoteStemDown", "eighthNoteStemUp", "eighthNoteStemDown", "sharp", "flat", "natural", "timeSig2", "timeSig3", "timeSig4", "barlineFinal", "repeatLeft", "repeatRight"]) {
  assert.ok(worksheetOutlines[symbol]?.path, `Worksheet PDFs need a vector outline for ${symbol}`);
}
for (const { file } of eligible.filter(({ file }) => file !== "intervals.html")) {
  assert.match(generic, new RegExp(`${file.replace(".html", "")}:\\s*\\{`), `${file} needs a generator definition`);
  const source = fs.readFileSync(file, "utf8");
  const header = source.match(/<(?:window\.MLH\.)?AppHeader[\s\S]*?title="([^"]+)"[\s\S]*?subtitle="([^"]+)"[\s\S]*?worksheetConfig=/);
  const activityId = source.match(/activityId:\s*"([^"]+)"/)?.[1];
  assert.ok(header && activityId, `${file} must expose its pupil-facing header to worksheet mode`);
  const escapedTitle = header[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedSubtitle = header[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(generic, new RegExp(`${activityId}: \\{ title: "${escapedTitle}", subtitle: "${escapedSubtitle}"`), `${file} worksheet fallback must match its normal pupil-facing subtitle`);
}
assert.match(fs.readFileSync("chords.html", "utf8"), /activeLevel==="N5"\|\|\(activeLevel==="AH"&&\(ahCustomise\.insertPosition\|\|ahCustomise\.createBassLine\)\)/, "Chords worksheets must stay disabled at Higher and when no written Advanced Higher type is enabled");
assert.match(fs.readFileSync("chords.html", "utf8"), /function ahSymbolOrChordLabel/, "The Chords activity must share a Roman-numeral-or-chord label formatter");
assert.match(fs.readFileSync("chords.html", "utf8"), /ahSymbolOrChordLabel\(question\.key,item\.symbol,item\.chord\)/, "The Chords activity tables must always show both accepted chord labels");
assert.match(fs.readFileSync("chords.html", "utf8"), /inversionLabel\(item\.inversion\)\|\|"Root"/, "The Chords activity bass table bottom row must use consistent position names");
assert.match(fs.readFileSync("missingnotes.html", "utf8"), /activeLevel==="N3"\|\|activeLevel==="N4"/, "Melodic Dictation worksheets must stay limited to National 3 and National 4");
assert.doesNotMatch(fs.readFileSync("missingnotes.html", "utf8"), /window\.MLH\.useClickAway\(menuRef/, "Melodic Dictation must not treat its portalled customise panel as an outside click");
assert.match(fs.readFileSync("missingnotes.html", "utf8"), /closest\?\.\("\[data-menu-panel\],\[data-menu-trigger\]"\)/, "Melodic Dictation customise toggles must keep their portalled menu open");
assert.match(generic, /function MissingNotesStaff/, "Melodic Dictation worksheets must use their activity-matched two-bar renderer");
assert.match(generic, /missingnotes-staff-fade-/, "Melodic Dictation worksheet staves must fade out on the right");
assert.match(generic, /symbolKey="gClef"/, "Melodic Dictation worksheets must use the calibrated Bravura treble clef");
assert.match(generic, /key:KEYSIG_WORKSHEET_KEYS\["c-major"\]/, "National 3 and National 4 Melodic Dictation worksheets must retain the activity's C-major key");
assert.match(generic, /const timeSignature=random\(Object\.keys\(MISSING_NOTES_PATTERNS\)\)/, "Melodic Dictation worksheets must use the activity's simple time-signature range");
assert.match(generic, /symbolKey=\{`timeSig\$\{question\.timeSignature\.split\("\/"\)\[0\]\}`\}/, "Melodic Dictation worksheets must draw their selected Bravura time signature");
assert.match(generic, /<WorksheetMelodyNotes steps=\{question\.sourceMelody\}/, "Melodic Dictation worksheets must draw the given first bar on the stave");
assert.match(generic, /<WorksheetMelodyNotes steps=\{question\.answerMelody\}/, "Melodic Dictation examples and answer sheets must complete the missing bar on the stave");
assert.match(generic, /sourceMelody\.push\(random\(possible\)\)/, "National 3 and National 4 Melodic Dictation melodies must remain stepwise");
assert.match(generic, /answerMelody:sourceMelody\.map\(note=>note\+delta\)/, "National 4 Melodic Dictation answers must transpose the source by one diatonic step");
assert.match(generic, /level==="N3"\?"Repetition • National 3"/, "National 3 Melodic Dictation worksheets must use the confirmed Repetition title");
assert.match(generic, /level==="N4"\?"Sequences • National 4"/, "National 4 Melodic Dictation worksheets must use the confirmed Sequences title");
assert.match(generic, /Copy each bar to create an exact repetition\./, "National 3 Repetition worksheets must use the confirmed subtitle");
assert.match(generic, /Create musical sequences by writing notes onto the stave\./, "National 4 Sequences worksheets must use the confirmed subtitle");
assert.match(generic, /prompt:direction\?`Write the sequence one step \$\{direction\} in the blank bar\.`:""/, "National 3 Repetition boxes must not repeat the worksheet instruction");
assert.match(generic, /if\(level==="N3"\|\|level==="N4"\)/, "National 3 and National 4 Melodic Dictation must share the confirmed stacked-stave layout");
assert.match(generic, /drawStave\(topBar,"source-stave"\)/, "National 3 Repetition questions must show the completed source bar above");
assert.match(generic, /drawStave\(bottomBar,"copy-stave"\)/, "National 3 Repetition questions must provide a separate treble-clef stave underneath");
assert.match(generic, /completed\?<WorksheetMelodyNotes steps=\{question\.answerMelody\}/, "National 3 examples and answer sheets must complete the lower stave");
assert.match(generic, /gap=9\.6, topBar=28, bottomBar=138, clefX=49/, "The National 3 Repetition staves must use the confirmed height, separation and clef position");
assert.match(generic, /staveZoom=1\.15/, "Both National 3 Repetition staves must be enlarged by 15 percent");
assert.match(generic, /viewBox="0 0 320 200"/, "The enlarged stacked staves must have enough vertical room in preview and PDF output");
assert.match(generic, /fontSize=\{gap\*3\.5\}/, "National 3 time signatures must scale proportionally with the taller staves");
assert.match(generic, /x1=\{x-gap\*1\.125\} x2=\{x\+gap\*1\.125\}/, "National 3 ledger lines must scale proportionally with the taller notation");
assert.match(generic, /strokeWidth="1\.32"/, "National 3 stave lines must retain their proportional weight after enlargement");
assert.match(generic, /function WorksheetMelodyNotes/, "Melodic Dictation worksheets must share the activity's rhythm-aware note renderer");
assert.match(generic, /while\(end\+1<rhythms\.length&&rhythms\[end\+1\]==="quaver"/, "Adjacent worksheet quavers must be collected into beam groups");
assert.match(generic, /symbolKey="noteheadBlack"/, "Beamed worksheet quavers must use Bravura noteheads without individual flags");
assert.match(generic, /prefix}-beam-/, "Adjacent worksheet quavers must be joined with a shared beam");
assert.match(generic, /<WorksheetMelodyNotes steps=\{question\.answerMelody\}/, "Completed repetition bars must use the same beaming logic as their source bars");
assert.match(generic, /worksheetSymbolSettings\("quaverBeam"\)/, "Worksheet quaver beams must carry over the activity's shared Bravura calibration");
assert.match(generic, /stemXFor=\(x,down\)=>x\+\(down\?-gap\*\.6\+1:gap\*\.6-1\)/, "Upward beamed stems must move 1px left and downward stems 1px right");
assert.match(generic, /MISSING_NOTES_RHYTHM_SPACING=\{semibreve:3\.4,minim:2\.15,crotchet:1\.35,quaver:\.95\}/, "Melodic Dictation worksheets must use the activity's rhythm engraving widths");
assert.match(generic, /const scoreStart=start\+\(first\?4:15\), scoreEnd=end-\(final\?24:4\)/, "Worksheet note spacing must retain the activity's first- and final-bar margins");
assert.match(generic, /let cursor=scoreStart\+unit\*\.38/, "Worksheet note spacing must use the activity's optical starting position");
assert.doesNotMatch(generic, /beat\+duration\/2/, "Melodic Dictation worksheet notes must not use beat-centre spacing");
assert.match(generic, /completed&&muted\?<rect className="melodic-example-answer-box"/, "National 3 and National 4 examples must box only their completed lower stave");
assert.match(generic, /y=\{bottomBar-13\}[\s\S]*height=\{gap\*4\+26\}/, "The melodic example box must extend 5px farther above and below the stave");
assert.doesNotMatch(generic, />Bar [12]<\/text>/, "Melodic Dictation worksheet staves must not display bar numbers");
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
assert.match(generic, /function EnharmonicsStaff/, "Enharmonics worksheets must use their activity-matched stave renderer");
assert.match(generic, /enharmonics-staff-fade-/, "Enharmonics worksheet staves must fade out on the right");
assert.match(generic, /question\.clef==="bass"\?"fClef":"gClef"/, "Enharmonics worksheets must carry over both Bravura clefs");
assert.match(generic, /note\.accidental==="sharp"\?"sharpInScore":"flatInScore"/, "Enharmonics worksheets must render calibrated Bravura accidentals");
assert.match(generic, /note\.step>4\?"quarterNoteStemDown":"quarterNoteStemUp"/, "Enharmonics worksheet notes must use the correct Bravura stem direction");
assert.match(generic, /if\(note\.step<=-4\)lines\.push\(-4\)/, "Enharmonics worksheets must include the activity's two-ledger-line range");
assert.match(generic, /index>=0&&index%10===9&&unusual\.length>0/, "Unusual enharmonic spellings must be limited to one question in ten");
assert.match(generic, /completed\?drawNote\(question\.target,answerX,"target"\):null/, "Enharmonics examples and answer sheets must show the answer on the stave");
assert.match(generic, /function KeySignatureStaff/, "Key Signature worksheets must use their activity-matched four-bar renderer");
assert.match(generic, /symbolKey=\{item\.type==="sharp"\?"sharpKeySignature":"flatKeySignature"\}/, "Key Signature worksheets must use calibrated Bravura key-signature accidentals");
assert.match(generic, /key === "flatInScore" \|\| key === "flatKeySignature"/, "Flat key-signature glyphs must resolve to their PDF-safe Bravura outline");
assert.match(generic, /key === "sharpInScore" \|\| key === "sharpKeySignature"/, "Sharp key-signature glyphs must resolve to their PDF-safe Bravura outline");
assert.match(generic, /symbolKey="timeSig4"/, "Key Signature excerpts must use the Bravura 4/4 outline");
assert.match(generic, /symbolKey="barlineFinal"/, "Key Signature excerpts must use the Bravura final-barline outline");
assert.match(generic, /question\.notes\.map/, "Key Signature worksheets must render the four-bar melodic excerpt rather than an empty stave");
assert.match(generic, /const signatureVisible=!question\.build\|\|completed/, "Create Key questions must leave the key signature blank until the completed example or answer sheet");
assert.match(generic, /Identify the key signatures shown below\./, "Key Signature worksheets must use the confirmed identification-only subtitle");
assert.match(generic, /return \{\.\.\.base,key,build:false,notes,prompt:"",answer:key\.label,response:"text"\}/, "Key Signature worksheets must remain identification-only with no repeated question text");
assert.doesNotMatch(generic, /prompt:build\?`Create the key signature/, "Key Signature worksheets must never generate Create Key questions");
assert.match(generic, /KEYSIG_LEVEL_KEYS\[level\]/, "Key Signature worksheets must use only keys available at the selected level");
assert.match(generic, /fullRight=510/, "Key Signature worksheets must retain the activity's full excerpt behind the compact mobile crop");
assert.match(generic, /keysig-mobile-fade-/, "Key Signature worksheet questions must use the mobile-view fade on the right");
assert.match(generic, /mask id=\{`\$\{fadeId\}-mask`\}/, "The Key Signature mobile crop must fade through transparency rather than a visible white overlay");
assert.doesNotMatch(generic, /<rect x=\{visibleRight-52\}/, "The Key Signature fade must not draw a white rectangle over grey example boxes");
assert.match(generic, /leadingNote=notes\.find\(note=>note\.barIndex===1/, "Minor-key identifying accidentals must appear within the visible mobile excerpt");
assert.doesNotMatch(generic, /bar-number-/, "Key Signature worksheet excerpts must not display bar numbers");
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
assert.match(generic, /answerIsInNotation/, "Answers completed inside notation must not be repeated as text below it");
assert.match(generic, /topLabel=`\$\{item\.symbol\} or \$\{item\.chordName\}`, bottomLabel=shortPosition\(item\.inversion\)/, "Both Advanced Higher worksheet question types must show Roman numeral or chord name above the position");
assert.doesNotMatch(generic, /const romanPosition=/, "Advanced Higher bass tables must not use compact Roman inversion codes in the position row");
assert.match(generic, /AH_WORKSHEET_TYPES\.map\(\(type,typeIndex\)=>makeQuestion\(-1-typeIndex,type\)\)/, "Advanced Higher chord worksheets must create one example for each enabled written question type");
assert.match(generic, /i<examples\.length/, "Both Advanced Higher examples must occupy the first worksheet row");
assert.match(generic, /i-examples\.length\+1/, "Numbered Advanced Higher questions must begin at 1 after both examples");
assert.match(generic, /CONFIG\.settings\.ahCustomise\.createBassLine\?"bass":null/, "Advanced Higher worksheet generation must carry over the Create Bass Line profile setting");
assert.match(generic, /CONFIG\.settings\.ahCustomise\.insertPosition\?"position":null/, "Advanced Higher worksheet generation must carry over the Insert Chord and Position profile setting");
const carriedWorksheetSettings = {
  enharmonics: ["options"],
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
vm.runInNewContext(`${safePdfTitleSource}; result = safePdfTitle("Repetition • National 3");`, filenameContext);
assert.equal(filenameContext.result, "Repetition - National 3", "The National 3 Repetition PDF must use the confirmed filename");
vm.runInNewContext(`${safePdfTitleSource}; result = safePdfTitle("Sequences • National 4");`, filenameContext);
assert.equal(filenameContext.result, "Sequences - National 4", "The National 4 Sequences PDF must use the confirmed filename");
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
assert.match(hubShell, /worksheetSourceConfig = \{ \.\.\.config, subtitle: typeof subtitle === "string" \? subtitle/, "Every pupil activity must carry its normal subtitle into worksheet mode");
assert.match(generic, /subtitle:CONFIG\.subtitle\|\|DEF\.subtitle/, "Generic worksheets must display the saved pupil-facing subtitle");
assert.match(generic, /subtitle=\{CONFIG\.subtitle\|\|DEF\.subtitle\}/, "Generic worksheet headers must fall back to their pupil-facing subtitle for an already-open worksheet");
assert.doesNotMatch(generic, /Generate a printable worksheet from \$\{DEF\.title\}/, "Generic worksheet mode must not replace pupil-facing subtitles with worksheet text");
assert.match(intervalWorksheet, /subtitle=\{imported\.subtitle \|\| "Identify and create intervals\."\}/, "The separate Intervals worksheet must preserve its pupil-facing subtitle");
assert.match(generic, /setPreviewVisible\(false\)[\s\S]*setTimeout\([\s\S]*setPreviewVisible\(true\)[\s\S]*260/, "Generic worksheet Refresh must use the activity-style 260ms preview transition");
assert.match(generic, /transition-opacity duration-300 \$\{previewVisible\?"opacity-100":"opacity-0"\}/, "Generic worksheet previews must fade like pupil activity questions");
assert.match(intervalWorksheet, /setPreviewVisible\(false\)[\s\S]*window\.setTimeout\([\s\S]*setPreviewVisible\(true\)[\s\S]*260/, "Intervals Refresh must use the same activity-style preview transition");
assert.match(intervalWorksheet, /transition-opacity duration-300 \$\{previewVisible \? "opacity-100" : "opacity-0"\}/, "Intervals preview must use the shared fade timing");
console.log(`Worksheet rollout checks passed for ${eligible.length} activities.`);
