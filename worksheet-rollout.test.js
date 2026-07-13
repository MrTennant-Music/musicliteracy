const assert = require("node:assert/strict");
const fs = require("node:fs");

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
for (const { file } of eligible.filter(({ file }) => file !== "intervals.html")) {
  assert.match(generic, new RegExp(`${file.replace(".html", "")}:\\s*\\{`), `${file} needs a generator definition`);
}
assert.match(fs.readFileSync("chords.html", "utf8"), /activeLevel==="N5"\|\|activeLevel==="AH"/, "Chords worksheets must stay disabled at Higher");
assert.match(fs.readFileSync("missingnotes.html", "utf8"), /activeLevel==="N3"\|\|activeLevel==="N4"/, "Melodic Dictation worksheets must stay limited to National 3 and National 4");
assert.match(fs.readFileSync("practicequestions.html", "utf8"), /excludeRhythmIdentification: true/, "Mixed Practice Questions must exclude Rhythm Identification");
assert.match(generic, /function EmphasisedPrompt/, "Generic worksheets must emphasise the musical variable in each question");
assert.match(generic, /tone\|semitone/, "Accidental distance and direction must be included in worksheet emphasis");
assert.match(generic, /function AccidentalsStaff/, "Accidentals worksheets must use their calibrated stave renderer");
assert.match(generic, /accidentals-staff-fade/, "Accidentals worksheet staves must fade out on the right");
assert.match(generic, /worksheetSymbolSettings/, "Accidentals worksheet symbols must use the shared notation calibration");
assert.match(generic, /root position\|first inversion\|second inversion/, "Chord positions must be included in worksheet emphasis");
console.log(`Worksheet rollout checks passed for ${eligible.length} activities.`);
