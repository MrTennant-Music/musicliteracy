const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const notation = require("../exam-notation.js");
const papers = [2015, 2017, 2018, 2019, 2022, 2023, 2024, 2025]
  .map(year => require(`../papers/higher-${year}.js`));
const notationSource = fs.readFileSync(path.resolve(__dirname, "..", "exam-notation.js"), "utf8");

class FakeSvgNode {
  constructor(name = "node") { this.name = name; this.attributes = {}; this.children = []; this.style = {}; this.dataset = {}; this.textContent = ""; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || ""; }
  append(...nodes) { this.children.push(...nodes); }
  addEventListener() {}
  closest() { return null; }
  remove() {}
}

const descendants = node => [node, ...node.children.flatMap(descendants)];
const hasClass = (node, className) => String(node.attributes.class || "").split(/\s+/).includes(className);
const scoreQuestion = paper => paper.questions.find(question => question.score?.sharedNotation?.startsWith("higher-"));
const render = (paper, answers, review, onAnswerChange = null) => {
  const wrap = new FakeSvgNode("div");
  notation.renderSharedScore({ innerHTML: "", querySelector: () => wrap }, scoreQuestion(paper), answers, onAnswerChange, review);
  return wrap.children.find(node => node.name === "svg");
};

const previousDocument = global.document;
const previousSymbols = global.BRAVURA_SYMBOLS;
global.BRAVURA_SYMBOLS = new Proxy({}, { get: (_target, key) => String(key) });
global.document = { createElementNS: (_namespace, name) => new FakeSvgNode(name), createElement: name => new FakeSvgNode(name) };

const [higher2015, higher2017, higher2018, higher2019, higher2022, higher2023, higher2024, higher2025] = papers;

const score2015 = render(higher2015, { q4b: "3rd", q4f: "C D" }, { q4b: "incorrect", q4f: "incorrect" });
const nodes2015 = descendants(score2015);
assert.ok(nodes2015.some(node => hasClass(node, "q3-answer-line")), "Higher 2015 should retain its written answer line in review.");
assert.ok(Number(nodes2015.find(node => node.textContent === "4th" && hasClass(node, "q3-answer-correction")).attributes.y) < Number(nodes2015.find(node => node.textContent === "3rd").attributes.y), "Higher 2015's interval correction should sit above the pupil answer.");

const score2017 = render(higher2017, { q4e: "C C", q4f: "C4,G3,G3,A3" }, { q4e: "incorrect", q4f: "correct" });
const nodes2017 = descendants(score2017);
assert.ok(nodes2017.some(node => node.name === "polygon" && hasClass(node, "q3-beam-shape") && hasClass(node, "q3-answer-correct")), "Higher 2017's adjacent transposed quavers should beam in the pupil-answer colour.");
assert.ok(Number(nodes2017.find(node => node.textContent === "D" && hasClass(node, "q3-answer-correction")).attributes.y) < Number(nodes2017.find(node => node.textContent === "C" && hasClass(node, "q3-answer-incorrect")).attributes.y), "Higher 2017 chord corrections should sit above wrong answers.");

const score2018 = render(higher2018, { q3f: "C D" }, { q3f: "incorrect" });
const nodes2018 = descendants(score2018);
assert.ok(nodes2018.filter(node => hasClass(node, "q3-answer-line")).length >= 2, "Higher 2018 should retain both chord answer lines in review.");
assert.ok(nodes2018.some(node => node.textContent === "F" && hasClass(node, "q3-answer-correction")), "Higher 2018 should show the first correct chord in the score.");

const score2019 = render(higher2019, { q3f: "A3,A3,C4,A3" }, { q3f: "correct" });
assert.ok(descendants(score2019).some(node => node.name === "polygon" && hasClass(node, "q3-answer-correct")), "Higher 2019's final three transposed quavers should beam.");

const score2022 = render(higher2022, { q4c: "G C", q4e: "A4,A4,A4", q4f: "G3,G3,G3,G3" }, { q4c: "incorrect", q4e: "incorrect", q4f: "incorrect" });
const nodes2022 = descendants(score2022);
assert.ok(nodes2022.filter(node => hasClass(node, "q3-answer-line")).length >= 2, "Higher 2022 should retain both chord answer lines in review.");
const chordCorrections2022 = nodes2022.filter(node => hasClass(node, "q3-answer-correction") && ["C", "Dm"].includes(node.textContent));
assert.equal(chordCorrections2022.length, 2, "Higher 2022 should show both individual chord corrections.");
assert.ok(chordCorrections2022.every(node => Number(node.attributes.y) > 517), "Higher 2022 should show chord corrections below the individual chord boxes.");
assert.ok(nodes2022.filter(node => hasClass(node, "q3-answer-correction")).length >= 9, "Higher 2022 should show its chord, missing-note and transpose corrections in the score.");
assert.equal(nodes2022.filter(node => hasClass(node, "q3-final-barline")).length, 2, "Higher 2022 should end both treble and bass staves with the shared double-barline glyph.");
assert.ok(nodes2022.some(node => node.name === "line" && node.attributes.x1 === "390" && node.attributes.y1 === "1160"), "Higher 2022 should align the bar 12/13 barline in the bass stave with the treble stave.");
assert.ok(nodes2022.filter(node => node.textContent === "halfRest").length >= 2, "Higher 2022 should show the printed dotted minim rest in both the treble and bass bar-13 notation.");
assert.ok(nodes2022.some(node => node.textContent === "flat" && node.attributes.x === "219" && node.attributes.y === "1193"), "Higher 2022 should place the bass-clef flat on the second staff line.");
const wrongTonic2022 = descendants(render(higher2022, { q4d: "bar-8-note-5" }, { q4d: "incorrect" }));
assert.ok(wrongTonic2022.some(node => node.name === "ellipse" && hasClass(node, "q3-answer-incorrect") && hasClass(node, "q3-tonic-selection") && node.attributes.fill === "none"), "Higher 2022 should mark a pupil's selected wrong tonic note with an outline.");
assert.ok(wrongTonic2022.some(node => node.name === "ellipse" && hasClass(node, "q3-answer-correction") && hasClass(node, "q3-tonic-selection") && node.attributes.fill === "none"), "Higher 2022 should circle the correct tonic with an outline in feedback.");
const tonicTargets2022 = descendants(render(higher2022, {}, {}, () => {})).filter(node => node.name === "rect" && String(node.attributes["aria-label"] || "").includes("as the tonic"));
assert.equal(tonicTargets2022.length, 8, "Higher 2022 should allow every non-rest note in the tonic box to be selected.");

const score2023 = render(higher2023, { q4b: "G3,G3,F3,D3,D3", q4c: "A4,G4,F4", q4d: "quaver,dottedCrotchet", q4f: "F F" }, { q4b: "correct", q4c: "correct", q4d: "correct", q4f: "incorrect" });
const nodes2023 = descendants(score2023);
assert.ok(nodes2023.filter(node => node.name === "polygon" && hasClass(node, "q3-answer-correct")).length >= 2, "Higher 2023 should beam the transposition group and the final pair of entered missing quavers.");
assert.deepEqual(nodes2023.filter(node => node.name === "rect" && hasClass(node, "q3-marking-box") && node.attributes.y === "1040").map(node => node.attributes.x), ["312", "467"], "Higher 2023 should retain both source-style square chord answer boxes in review.");
assert.ok(nodes2023.some(node => node.name === "rect" && hasClass(node, "q3-marking-box") && node.attributes.x === "118" && node.attributes.y === "239" && node.attributes.width === "175"), "Higher 2023 should reduce the transpose box by 15 px from the left while keeping its right edge fixed.");
assert.ok(nodes2023.some(node => node.name === "line" && node.attributes.x1 === "50" && node.attributes.y1 === "305" && node.attributes.y2 === "471"), "Higher 2023 should join the line-2 treble and bass staves with a long opening barline before the clefs.");
assert.ok(nodes2023.some(node => node.name === "line" && node.attributes.x1 === "343" && node.attributes.y1 === "427" && node.attributes.y2 === "471"), "Higher 2023 should close the bass-clef stave with a barline at its right-hand end.");
assert.ok(nodes2023.filter(node => node.name === "text" && node.textContent === "quarterRest").some(node => node.attributes.x === "311.5777777777778" && node.attributes.y === "449"), "Higher 2023 should print the bass-clef crotchet rest aligned with the treble bar-4 rest.");
assert.ok(nodes2023.some(node => node.name === "text" && node.textContent === "barlineFinal" && hasClass(node, "q3-final-barline") && node.attributes.x === "855"), "Higher 2023 should end bar 16 with the shared Bravura final-barline glyph.");
assert.ok(nodes2023.some(node => node.textContent === "flat" && node.attributes.x === "104" && node.attributes.y === "460"), "Higher 2023 should place the bass-clef flat on the second line.");

const score2024 = render(higher2024, { q4a: "3rd", q4b: "quaver,quaver", q4e: "C C" }, { q4a: "incorrect", q4b: "correct", q4e: "incorrect" });
const nodes2024 = descendants(score2024);
const lyricCount2024 = notation.getInventory("higher-2024-q4").lyrics.flat().filter(Boolean).length;
assert.ok(nodes2024.some(node => node.name === "polygon" && hasClass(node, "q3-beam-shape")), "Higher 2024's corrected quavers should beam together.");
const correctedRhythmNoteheads2024 = nodes2024.filter(node => node.name === "text" && hasClass(node, "q3-complete-note") && hasClass(node, "q3-answer-correct"));
assert.equal(correctedRhythmNoteheads2024.length, 1, "Higher 2024 should colour only the altered crotchet's new rhythm.");
assert.equal(correctedRhythmNoteheads2024[0].attributes.y, "342", "Higher 2024 rhythm changes should preserve the original B-flat 4 pitch.");
const rhythmTargets2024 = descendants(render(higher2024, {}, {}, () => {})).filter(node => node.name === "rect" && String(node.attributes["aria-label"] || "").startsWith("Rhythm correction"));
assert.equal(rhythmTargets2024.length, 3, "Higher 2024 should expose all three crotchets in bar 6 as rhythm-edit targets.");
const partialRhythm2024 = descendants(render(higher2024, { q4b: "dottedCrotchet,quaver" }, { q4b: "incorrect" }));
assert.equal(partialRhythm2024.filter(node => node.name === "text" && hasClass(node, "q3-complete-note") && hasClass(node, "q3-answer-incorrect")).length, 1, "Higher 2024 should colour only the altered crotchet when a rhythm is applied.");
assert.ok(Number(nodes2024.find(node => node.textContent === "5th" && hasClass(node, "q3-answer-correction")).attributes.y) < Number(nodes2024.find(node => node.textContent === "3rd").attributes.y), "Higher 2024's interval correction should sit above the pupil answer.");
assert.equal(nodes2024.filter(node => hasClass(node, "q3-score-lyrics")).length, lyricCount2024, "Higher 2024 should draw every lyric syllable from its structured score data.");
assert.equal(nodes2024.find(node => node.textContent === "long________________").attributes["text-anchor"], "start", "Higher 2024 should extend the final lyric line from the last note of bar 22 toward bar 24.");
assert.equal(nodes2024.find(node => node.textContent === "up_____").attributes["text-anchor"], "start", "Higher 2024 should start up_____ beneath the last note of bar 13.");
assert.deepEqual(nodes2024.filter(node => node.name === "rect" && hasClass(node, "higher-2024-chord-answer-box")).map(node => [node.attributes.x, node.attributes.y, node.attributes.width, node.attributes.height]), [["423", "1035", "44", "49"], ["759", "1035", "44", "49"]], "Higher 2024 should use the two source-style square chord answer boxes.");
assert.ok(nodes2024.some(node => node.name === "line" && node.attributes.x1 === "614" && node.attributes.y1 === "1340"), "Higher 2024 should end its shortened final system at the source position after bar 24.");
const dominantTargets2024 = descendants(render(higher2024, {}, {}, () => {})).filter(node => node.name === "rect" && String(node.attributes["aria-label"] || "").includes("for the dominant answer"));
assert.equal(dominantTargets2024.length, 9, "Higher 2024 should allow every non-rest note inside the dominant-note box to be selected.");
const wrongDominant2024 = descendants(render(higher2024, { q4c: "bar-9-note-2" }, { q4c: "incorrect" }));
assert.ok(wrongDominant2024.some(node => node.name === "ellipse" && hasClass(node, "q3-answer-incorrect") && hasClass(node, "q3-note-selection-outline") && node.attributes.fill === "none"), "Higher 2024 should show a wrong selectable dominant-box note as an outline in feedback.");
const legacyMultipleDominant2024 = descendants(render(higher2024, { q4c: "bar-10-c-both" }, {})).filter(node => node.name === "ellipse" && hasClass(node, "q3-note-selection-outline"));
assert.equal(legacyMultipleDominant2024.length, 1, "Higher 2024 should retain only one visible dominant-note circle when an older multiple-selection value is loaded.");
const dcTargets2024 = descendants(render(higher2024, {}, {}, () => {})).filter(node => node.name === "rect" && hasClass(node, "q3-bar-label-hit-area"));
assert.equal(dcTargets2024.length, 24, "Higher 2024 should allow D.C. placement above every bar.");
const wrongDc2024 = descendants(render(higher2024, { q4f: "bar-10" }, { q4f: "incorrect" }));
assert.ok(wrongDc2024.some(node => node.name === "text" && node.textContent === "daCapo" && hasClass(node, "q3-answer-incorrect")), "Higher 2024 should display a Bravura D.C. placed above an incorrect bar in the pupil-answer colour.");
assert.ok(wrongDc2024.some(node => node.name === "text" && node.textContent === "daCapo" && hasClass(node, "q3-answer-correction")), "Higher 2024 should show the correct Bravura D.C. placement after an incorrect answer.");

const score2025 = render(higher2025, { q4b: "C C", q4c: "B3,C4,B3,A3,G3", q4d: "D5,C5", q4f: "2nd" }, { q4b: "incorrect", q4c: "correct", q4d: "correct", q4f: "incorrect" });
const nodes2025 = descendants(score2025);
const lyricCount2025 = notation.getInventory("higher-2025-q4").lyrics.flat().filter(Boolean).length;
assert.equal(nodes2025.filter(node => hasClass(node, "q3-score-lyrics")).length, lyricCount2025, "Higher 2025 should draw every lyric syllable from its structured score data.");
const correctSubdominant2025 = descendants(render(higher2025, { q4a: "bar-3-c" }, { q4a: "correct" }));
assert.ok(correctSubdominant2025.some(node => node.name === "ellipse" && hasClass(node, "q3-answer-correct") && hasClass(node, "q3-note-selection-outline") && node.attributes.fill === "none"), "Higher 2025 should mark the correct subdominant with a hollow green circle.");
const subdominantTargets2025 = descendants(render(higher2025, {}, {}, () => {})).filter(node => node.name === "rect" && String(node.attributes["aria-label"] || "").includes("for the subdominant answer"));
assert.equal(subdominantTargets2025.length, 5, "Higher 2025 should allow every non-rest note in the subdominant box to be selected.");
assert.ok(nodes2025.filter(node => node.name === "polygon" && hasClass(node, "q3-answer-correct")).length >= 3, "Higher 2025 should beam both transposition groups and the missing-note pair.");
assert.ok(nodes2025.some(node => hasClass(node, "q3-answer-line")), "Higher 2025 should retain the interval answer line in review.");
assert.ok(nodes2025.some(node => node.textContent === "4th" && hasClass(node, "q3-answer-correction")), "Higher 2025 should show the correct interval above a wrong answer.");
const givenChordLabels2025 = nodes2025.filter(node => hasClass(node, "higher-2025-given-chord-label"));
assert.equal(givenChordLabels2025.length, 2, "Higher 2025 should show both given-chord labels.");
assert.ok(givenChordLabels2025.every(node => node.attributes["dominant-baseline"] === "middle"), "Higher 2025 given-chord labels should be vertically centred in their boxes.");
assert.ok(nodes2025.some(node => node.textContent === "sharp" && node.attributes.x === "500.5"), "Higher 2025 should place the bass-clef sharp to the left of the transpose box.");
assert.ok(nodes2025.some(node => node.name === "line" && node.attributes.x1 === "446.5" && node.attributes.y1 === "675.6"), "Higher 2025 should extend the bass stave 25px left for its clef and key signature.");
assert.ok(nodes2025.some(node => node.name === "text" && node.textContent === "barlineFinal" && hasClass(node, "q3-final-barline") && node.attributes.x === "855"), "Higher 2025 should end bar 24 with the shared Bravura final barline glyph.");
assert.equal(nodes2025.filter(node => node.textContent === "tie").length, 7, "Higher 2025 should show six repeated-note ties and the cross-bar E tie without drawing any slurs.");
const interactiveBarlines2025 = descendants(render(higher2025, {}, {}, () => {})).filter(node => node.name === "rect" && hasClass(node, "q3-bar-label-hit-area"));
assert.equal(interactiveBarlines2025.length, 7, "Higher 2025 should allow bar-line placement in every note-to-note gap inside the part (e) box.");
const wrongBarline2025 = descendants(render(higher2025, { q4e: "higher-2025-line6-gap-1" }, { q4e: "incorrect" }));
assert.ok(wrongBarline2025.some(node => node.name === "line" && hasClass(node, "q3-answer-incorrect")), "Higher 2025 should show a pupil's wrong bar-line placement in red.");
assert.ok(wrongBarline2025.some(node => node.name === "line" && hasClass(node, "q3-answer-correction")), "Higher 2025 should show the correct bar-line position after a wrong placement.");

[
  [higher2017, { q4f: "" }, { q4f: "incorrect" }, 1],
  [higher2019, { q3f: "" }, { q3f: "incorrect" }, 1],
  [higher2023, { q4b: "", q4c: "" }, { q4b: "incorrect", q4c: "incorrect" }, 2],
  [higher2025, { q4c: "", q4d: "" }, { q4c: "incorrect", q4d: "incorrect" }, 3],
].forEach(([paper, answers, review, expectedBeams]) => {
  const correctionBeams = descendants(render(paper, answers, review)).filter(node => node.name === "polygon" && hasClass(node, "q3-answer-correction"));
  assert.ok(correctionBeams.length >= expectedBeams, `${paper.year} should retain beam groups when showing the correct notation for an unanswered or wrong response.`);
});

assert.match(notationSource, /barIndex === 8 && answers\.q4d \? item\.rhythmCorrectionIndices/, "Higher 2023 should replace only the rhythm notes once the pupil applies an answer.");
assert.match(notationSource, /const missingGuideNotes = \[note\("A4", "quaver"\), note\("A4", "quaver"\), note\("A4", "quaver"\)\];[\s\S]*missingGuideNotes, missingXs, systems\[2\] - 48[\s\S]*beamGroups: \[\{ start: 1, end: 2 \}\]/, "Higher 2023's Notes-box guide should place all three guide notes on the same horizontal pitch level.");
assert.match(notationSource, /q3AddHigher2023RhythmTargets\(svg, answers, onAnswerChange, barPositions\[8\], systems\[2\]\)/, "Higher 2023 question (d) should use separate dot and quaver-tail rhythm targets.");
assert.match(notationSource, /const dataKey = "q3CurrentRhythmQ4d";[\s\S]*dataset\[dataKey\]/, "Higher 2023 question (d) should keep its rhythm placements separate from question (e).");
assert.match(notationSource, /const noteheadX = \(item, x\) =>[\s\S]*q3NoteSymbolKey\(item\.rhythm, down, false\)[\s\S]*settings\.xOffsetScale/, "Higher 2023 question (d) should keep changed rhythm noteheads on their original horizontal positions.");
assert.match(notationSource, /const item = note\(index \? "F4" : "G4", rhythm\)/, "Higher 2023 question (d) should preserve the printed G4 and F4 pitches when applying a rhythm answer.");
assert.match(notationSource, /const allowedRhythms = new Set\(\["dottedCrotchet", "quaver"\]\);[\s\S]*allowedRhythms\.has\(q3RhythmToolArmed\)/, "Higher 2023 question (d) should reject rest tools.");
assert.match(notationSource, /const allowedRests = new Set\(\["crotchetRest", "quaverRest", "dottedCrotchetRest"\]\);[\s\S]*allowedRests\.has\(q3RhythmToolArmed\)/, "Higher 2023 question (e) should reject note-rhythm tools.");
assert.match(notationSource, /const feedbackXOffset = 5;[\s\S]*transposeXs\.map\(x => x \+ \(transposeValues\.some\(Boolean\) \? 7 \+ feedbackXOffset : 0\)\)[\s\S]*missingXs\.map\(x => x \+ \(missingValues\.some\(Boolean\) \? 7 \+ feedbackXOffset : 0\)\)[\s\S]*answers\.q4d \? feedbackXOffset : 0[\s\S]*answers\.q4e \? 8 \+ feedbackXOffset : 0/, "Higher 2023 wrong-answer feedback for transpose, notes, rhythm and rests should be shifted 5 pixels right.");
assert.match(notationSource, /q3AddHigher2023RestTargets\(svg, answers, onAnswerChange, barPositions\[11\]\[2\], systems\[3\]\)/, "Higher 2023 question (e) should use separate rest-placement targets.");
assert.match(notationSource, /const HIGHER_2023_Q4_REST_X_OFFSET = -25;[\s\S]*const positions = \[firstX, firstX \+ 24, firstX \+ 48\]\.map\(x => x \+ HIGHER_2023_Q4_REST_X_OFFSET\)/, "Higher 2023 question (e) should shift rest hover and placement targets 25 pixels left from their original positions.");
assert.match(notationSource, /bar\(\[note\("C5", "crotchet"\), note\("C5", "quaver"\), note\("Bb4", "quaver"\), note\("Bb4", "quaver"\), note\("Bb4", "crotchet"\), note\("A4", "quaver", \{ tiedFromPreviousBar: true \}\)\], \{ beamGroups: \[\{ start: 1, end: 2 \}\] \}\),/, "Higher 2023 bar 13 should beam the quaver pair without a slur.");
assert.match(notationSource, /\[\[6, 7\], \[8, 9\], \[10, 11\], \[12, 13\], \[13, 14\], \[14, 15\]\]/, "Higher 2023 should render the cross-bar ties through bars 12 to 16.");
assert.match(notationSource, /const editableIndexes = bar\.notes\.map\(\(item, noteIndex\) => item\.rhythm === "crotchet" \? noteIndex : null\)/, "Higher 2024 should make every crotchet in bar 6 editable.");
assert.match(notationSource, /const enteredRhythmValue = barIndex === 5 \? String\(answers\.q4b \|\| ""\)\.split\(","\)\[0\]/, "Higher 2024 should track only the selected bar-6 crotchet rhythm.");
assert.match(notationSource, /const rhythmSourceIndex = rhythmIndexes\[0\];[\s\S]*higher2015DrawNotes\(svg, \[\{ \.\.\.rhythmSourceNote, rhythm: enteredRhythm \}\]/, "Higher 2024 should redraw only the selected crotchet and leave the quavers untouched.");
assert.match(notationSource, /missingXs,systems\[4\]-67/, "Higher 2025 should position the bar-17 guide quavers 67 pixels above the answer stave.");
assert.match(notationSource, /id:"q4d",xs:missingXs,top:systems\[4\],pitchMap:Object\.fromEntries\(\["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5"\]/, "Higher 2025 bar-17 note entry should allow pitches through A5.");

global.document = previousDocument;
global.BRAVURA_SYMBOLS = previousSymbols;

console.log("Higher literacy rendering regression tests passed.");
