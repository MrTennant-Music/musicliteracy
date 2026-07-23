(function (root) {
  "use strict";

  // MILLIONAIRE QUESTION BANK
  // -------------------------
  // Questions are organised by course level, difficulty and question category.
  // Music Literacy records live in this hand-authored file. Music Concept
  // records are generated from the validated per-level JSON banks.

  const LEVELS = {
    N3: { slug: "n3", label: "National 3" },
    N4: { slug: "n4", label: "National 4" },
    N5: { slug: "n5", label: "National 5" },
    H: { slug: "h", label: "Higher" },
    AH: { slug: "ah", label: "Advanced Higher" },
  };
  const DIFFICULTIES = {
    easy: { min: 1, max: 5 },
    medium: { min: 6, max: 10 },
    hard: { min: 11, max: 15 },
  };
  const A = (a, b, c, d) => [
    { id: "a", text: a }, { id: "b", text: b },
    { id: "c", text: c }, { id: "d", text: d },
  ];

  const base = (id, category, concept, question, answers, correctAnswer, explanation, tip, difficultyMin, difficultyMax, extra = {}) => ({
    id, level: "N3", category, concept, question, answers, correctAnswer,
    explanation, tip, difficultyMin, difficultyMax, ...extra,
  });
  const n4Base = (id, difficulty, concept, question, answers, correctAnswer, explanation, tip, extra = {}) => {
    const range = DIFFICULTIES[difficulty];
    return {
      id, level: "N4", category: "literacy", concept, question, answers, correctAnswer,
      explanation, tip, difficultyMin: range.min, difficultyMax: range.max, ...extra,
    };
  };
  const n5Base = (id, difficulty, concept, question, answers, correctAnswer, explanation, tip, extra = {}) => {
    const range = DIFFICULTIES[difficulty];
    return {
      id, level: "N5", category: "literacy", concept, question, answers, correctAnswer,
      explanation, tip, difficultyMin: range.min, difficultyMax: range.max, ...extra,
    };
  };
  const hBase = (id, difficulty, concept, question, answers, correctAnswer, explanation, tip, extra = {}) => {
    const range = DIFFICULTIES[difficulty];
    return {
      id, level: "H", category: "literacy", concept, question, answers, correctAnswer,
      explanation, tip, difficultyMin: range.min, difficultyMax: range.max, ...extra,
    };
  };
  const ahBase = (id, difficulty, concept, question, answers, correctAnswer, explanation, tip, extra = {}) => {
    const range = DIFFICULTIES[difficulty];
    return {
      id, level: "AH", category: "literacy", concept, question, answers, correctAnswer,
      explanation, tip, difficultyMin: range.min, difficultyMax: range.max, ...extra,
    };
  };
  const RHYTHM_VALUE_NAMES = ["Crotchet", "Minim", "Dotted minim", "Semibreve"];
  const RHYTHM_BEATS = { Crotchet: 1, Minim: 2, "Dotted minim": 3, Semibreve: 4 };
  const RHYTHM_GLYPHS = { Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };
  const RHYTHM_CALCULATION_VALUES = {
    quarterNote: ["crotchet", "1 beat"],
    halfNote: ["minim", "2 beats"],
    dottedHalfNote: ["dotted minim", "3 beats"],
    wholeNote: ["semibreve", "4 beats"],
    eighthNote: ["quaver", "0.5 beat"],
    sixteenthNote: ["semiquaver", "0.25 beat"],
    pairedEighthNotes: ["pair of quavers", "1 beat"],
    fourSixteenthNotes: ["group of four semiquavers", "1 beat"],
    dottedQuarterNote: ["dotted crotchet", "1.5 beats"],
    dottedEighthNote: ["dotted quaver", "0.75 beat"],
    dottedQuaverSemiquaver: ["dotted quaver and semiquaver rhythm", "1 beat"],
    scotchSnap: ["Scotch snap", "1 beat"],
  };
  const rhythmCalculationHint = (terms) => {
    const [name, beats] = RHYTHM_CALCULATION_VALUES[terms.find((term) => RHYTHM_CALCULATION_VALUES[term])];
    return `The ${name} is worth ${beats}.`;
  };
  const BAR_RHYTHM_BEATS = {
    quarterNote: 1, halfNote: 2, dottedHalfNote: 3, wholeNote: 4,
    eighthNote: .5, sixteenthNote: .25, pairedEighthNotes: 1,
    fourSixteenthNotes: 1, dottedQuarterNote: 1.5, dottedEighthNote: .75,
    dottedQuaverSemiquaver: 1, scotchSnap: 1, semiquaverQuaverSemiquaver: 1,
    crotchet: 1, quaver: .5, minim: 2, "dotted-minim": 3,
    "dotted-crotchet": 1.5, "dotted-quaver-semiquaver": 1,
    "quaver-2semiquavers": 1, "2semiquavers-quaver": 1,
    "semiquaver-group-4": 1, "dotted-quaver-semiquaver-quaver": 1.5,
    "quaver-2semiquavers-quaver": 1.5, "crotchet-quaver": 1.5,
    "quaver-crotchet": 1.5, "quaver-group-2": 1, "quaver-group-3": 1.5,
  };
  const barCurrentTotalHint = (...groups) => {
    const total = groups.flat().filter((token) => token !== "blank")
      .reduce((sum, token) => sum + BAR_RHYTHM_BEATS[token], 0);
    return `The bar currently adds up to ${total} beat${total === 1 ? "" : "s"}.`;
  };
  const missingNoteValueHint = (beats) => `The note value missing is equal to ${beats} beat${beats === 1 ? "" : "s"}.`;
  const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const NOTE_HINTS = {
    treble: {
      lines: new Set(["E4", "G4", "B4", "D5", "F5"]),
      spaces: new Set(["F4", "A4", "C5", "E5"]),
      bottom: { pitch: "E4", letter: "E" },
      top: { pitch: "F5", letter: "F" },
      lineHint: "Every Good Boy Deserves Fun.",
      spaceHint: "FACE in the SPACE.",
    },
    bass: {
      lines: new Set(["G2", "B2", "D3", "F3", "A3"]),
      spaces: new Set(["A2", "C3", "E3", "G3"]),
      bottom: { pitch: "G2", letter: "G" },
      top: { pitch: "A3", letter: "A" },
      lineHint: "Glasgow Buses Drive Fast Always.",
      spaceHint: "All Cows Eat Grass.",
    },
  };
  const notePosition = (pitch) => Number(pitch.slice(1)) * 7 + NOTE_LETTERS.indexOf(pitch[0]);
  const noteIdentificationHint = (pitch, clef = "treble", accidental = null) => {
    const hints = NOTE_HINTS[clef];
    let hint;
    if (hints.lines.has(pitch)) hint = hints.lineHint;
    else if (hints.spaces.has(pitch)) hint = hints.spaceHint;
    else {
      const below = notePosition(pitch) < notePosition(hints.bottom.pitch);
      const reference = below ? hints.bottom : hints.top;
      hint = `The ${below ? "bottom" : "top"} line is ${reference.letter}. Work ${below ? "backward" : "forward"} through the musical alphabet one letter at a time.`;
    }
    return accidental ? `${hint} Then check the accidental in front of the note.` : hint;
  };
  const N5_CHORD_PITCHES = {
    "C major": ["C4", "E4", "G4"],
    "G major": ["G4", "B4", "D5"],
    "F major": ["F4", "A4", "C5"],
    "A minor": ["A4", "C5", "E5"],
  };
  const chordNoteName = (note) => Array.isArray(note)
    ? `${note[0]}${note[1] === 1 ? " sharp" : note[1] === -1 ? " flat" : ""}`
    : String(note).replace(/\d+/g, "");
  const chordNoteList = (notes) => {
    const names = notes.map(chordNoteName);
    return `${names[0]}, ${names[1]}, and ${names[2]}`;
  };
  const chordNotesHint = (notes) => `The notes are ${chordNoteList(notes)}.`;
  const noteValueComparisonHint = (smaller) => ({
    sixteenthNote: "A semiquaver is worth 0.25 beat.",
    eighthNote: "A quaver is worth 0.5 beat.",
    dottedEighthNote: "A dotted quaver is worth 0.75 beat.",
    quarterNote: "A crotchet is worth 1 beat.",
    pairedEighthNotes: "A pair of quavers is worth 1 beat.",
    fourSixteenthNotes: "A group of four semiquavers is worth 1 beat.",
  })[smaller] || "Work out the value of the smaller rhythm first.";
  const articulationHint = (marking) => ({
    accent: "Use the force.",
    staccato: "Separated.",
    slur: "Join it together.",
    phrase: "What is a triangle and a square an example of?",
  })[marking];
  const national5KeySignatureHint = (signature) => ({
    "C major": "Do you SEE anything?",
    "G major": "A sharp looks like a hashtaG.",
    "F major": "What letter does the word flat begin with?",
    "A minor": "Don't let this cause you A minor problem.",
  })[signature];
  const advancedHigherKeySignatureHint = (signature, fallback) => {
    if (signature === "D major") return "A 5th higher than G.";
    if (signature === "B flat major") return "Look at the two accidentals. They are flats. Think of what key is associated with the word flat.";
    if (signature.endsWith(" minor")) return "You can find the relative minor by going back two letters from the relative major.";
    return national5KeySignatureHint(signature) || fallback;
  };
  const rhythmCompletion = (id, shownValues, target, answer) => {
    const shownBeats = shownValues.reduce((total, value) => total + RHYTHM_BEATS[value], 0);
    const answerChoices = [answer, ...RHYTHM_VALUE_NAMES.filter((value) => value !== answer)];
    return base(id, "literacy", "rhythm-completion", "Which note value completes this calculation?", A(...answerChoices), "a", `The shown note value${shownValues.length > 1 ? "s" : ""} total ${shownBeats} beat${shownBeats === 1 ? "" : "s"}. To make ${target} beats, the missing value is ${answer.toLowerCase()}.`, missingNoteValueHint(RHYTHM_BEATS[answer]), 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: [...shownValues.map((value) => RHYTHM_GLYPHS[value]), "blank"], operators: Array(shownValues.length).fill("+"), total: target, label: `A rhythm calculation totalling ${target} beats with one missing note value.` } });
  };
  const N4_RHYTHM_BEATS = { Semiquaver: .25, Quaver: .5, Crotchet: 1, Minim: 2, "Dotted minim": 3, Semibreve: 4 };
  const N4_RHYTHM_GLYPHS = { Semiquaver: "sixteenthNote", Quaver: "eighthNote", Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };
  const n4RhythmCompletion = (id, values, missingIndex, distractors) => {
    const answer = values[missingIndex];
    const total = values.reduce((sum, value) => sum + N4_RHYTHM_BEATS[value], 0);
    const terms = values.map((value, index) => index === missingIndex ? "blank" : N4_RHYTHM_GLYPHS[value]);
    const missingPosition = ["first", "middle", "last"][missingIndex];
    const calculation = values.map((value) => N4_RHYTHM_BEATS[value]).join(" + ");
    return n4Base(id, "hard", "three-rhythm-completion", "Which note value completes this calculation?", A(answer, ...distractors), "a", `${calculation} = ${total} beats, so the missing ${missingPosition} note value is a ${answer.toLowerCase()}.`, missingNoteValueHint(N4_RHYTHM_BEATS[answer]), { type: "notation", notation: { kind: "rhythmSum", terms, operators: ["+", "+"], total, label: `A three-rhythm calculation totalling ${total} beats with the ${missingPosition} note value missing.` } });
  };

  const literacy = [
    // Easy: recognise the four National 3 note values, simple time signatures,
    // treble-stave notes and step/leap movement.
    base("n3-literacy-001", "literacy", "crotchet-beats", "How many beats does this note last?", A("1", "2", "3", "4"), "a", "A crotchet lasts for one beat.", "A crotchet has a filled notehead and a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["quarterNote"], label: "One crotchet." } }),
    base("n3-literacy-002", "literacy", "minim-beats", "How many beats does this note last?", A("2", "1", "3", "4"), "a", "A minim lasts for two beats.", "A minim has an open notehead and a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["halfNote"], label: "One minim." } }),
    base("n3-literacy-003", "literacy", "dotted-minim-beats", "How many beats does this note last?", A("3", "2", "4", "1"), "a", "A dotted minim lasts for three beats.", "The dot adds one beat to a minim.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["dottedHalfNote"], label: "One dotted minim." } }),
    base("n3-literacy-004", "literacy", "semibreve-beats", "How many beats does this note last?", A("4", "3", "2", "1"), "a", "A semibreve lasts for four beats.", "A semibreve has an open notehead and no stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["wholeNote"], label: "One semibreve." } }),
    base("n3-literacy-005", "literacy", "crotchet-name", "What is this note value called?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "This is a crotchet.", "It is a 1 beat note.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["quarterNote"], label: "One crotchet." } }),
    base("n3-literacy-006", "literacy", "minim-name", "What is this note value called?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "This is a minim.", "This is a 2 beat note.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["halfNote"], label: "One minim." } }),
    base("n3-literacy-007", "literacy", "dotted-minim-name", "What is this note value called?", A("Dotted minim", "Minim", "Crotchet", "Semibreve"), "a", "This is a dotted minim.", "This is a 3 beat note.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["dottedHalfNote"], label: "One dotted minim." } }),
    base("n3-literacy-008", "literacy", "semibreve-name", "What is this note value called?", A("Semibreve", "Minim", "Crotchet", "Dotted minim"), "a", "This is a semibreve.", "This is a 4 beat note.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["wholeNote"], label: "One semibreve." } }),
    base("n3-literacy-011", "literacy", "time-signature-name", "What is this symbol called?", A("Time signature", "Double barline", "Repeat sign", "Crescendo"), "a", "This is a time signature. It tells us how many beats are in each bar.", "A clock tells you the first part, and you write the second part to identify yourself.", 1, 5, { type: "notation", notation: { kind: "timeSignature", top: 4, bottom: 4, label: "A four-four time signature." } }),
    base("n3-literacy-046", "literacy", "treble-clef-name", "What is this symbol called?", A("Treble clef", "Bass clef", "Time signature", "Double barline"), "a", "This symbol is a treble clef, also called a G clef.", "The first word rhymes with ‘rebel’, and the second word rhymes with ‘deaf’.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["trebleClef"], label: "A treble clef." } }),
    base("n3-literacy-012", "literacy", "treble-clef-e", "What note is this?", A("E", "G", "B", "D"), "a", "The bottom line of the treble stave is E.", noteIdentificationHint("E4"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "E4", label: "A crotchet E on the bottom line of the treble stave." } }),
    base("n3-literacy-047", "literacy", "treble-clef-f", "What note is this?", A("F", "A", "C", "E"), "a", "The first space of the treble stave is F.", noteIdentificationHint("F4"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "F4", label: "A crotchet F in the first space of the treble stave." } }),
    base("n3-literacy-013", "literacy", "treble-clef-g", "What note is this?", A("G", "B", "D", "F"), "a", "The second line of the treble stave is G.", noteIdentificationHint("G4"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "G4", label: "A crotchet G on the second line of the treble stave." } }),
    base("n3-literacy-048", "literacy", "treble-clef-a", "What note is this?", A("A", "C", "E", "G"), "a", "The second space of the treble stave is A.", noteIdentificationHint("A4"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "A4", label: "A crotchet A in the second space of the treble stave." } }),
    base("n3-literacy-028", "literacy", "treble-clef-b", "What note is this?", A("B", "G", "D", "F"), "a", "The middle line of the treble stave is B.", noteIdentificationHint("B4"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "B4", label: "A crotchet B on the middle line of the treble stave." } }),
    base("n3-literacy-014", "literacy", "treble-clef-c", "What note is this?", A("C", "A", "E", "B"), "a", "The third space of the treble stave is C.", noteIdentificationHint("C5"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "C5", label: "A crotchet C in the third space of the treble stave." } }),
    base("n3-literacy-049", "literacy", "treble-clef-d", "What note is this?", A("D", "B", "F", "A"), "a", "The fourth line of the treble stave is D.", noteIdentificationHint("D5"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "D5", label: "A crotchet D on the fourth line of the treble stave." } }),
    base("n3-literacy-029", "literacy", "treble-clef-e-space", "What note is this?", A("E", "C", "F", "D"), "a", "The top space of the treble stave is E.", noteIdentificationHint("E5"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "E5", label: "A crotchet E in the top space of the treble stave." } }),
    base("n3-literacy-050", "literacy", "treble-clef-f-top", "What note is this?", A("F", "D", "E", "G"), "a", "The top line of the treble stave is F.", noteIdentificationHint("F5"), 1, 5, { type: "notation", notation: { kind: "note", pitch: "F5", label: "A crotchet F on the top line of the treble stave." } }),
    base("n3-literacy-015", "literacy", "step", "What is the distance between these two notes?", A("Step", "Leap", "Repeat", "Rest"), "a", "The notes are next to each other, so they move by step.", "People take these when they walk.", 1, 5, { type: "notation", notation: { kind: "melody", pitches: ["E4", "F4"], label: "Two crotchets moving from E to F by step." } }),

    // Medium: read common notation and calculate rhythmic addition.
    base("n3-literacy-016", "literacy", "stave", "What are the five lines and four spaces called?", A("Stave", "Bar", "Time signature", "Rhythm"), "a", "The five lines and four spaces used to write music are called a stave.", "Rhymes with the name Dave.", 6, 10, { type: "notation", notation: { kind: "stave", label: "A blank five-line stave." } }),
    base("n3-literacy-017", "literacy", "double-barline-name", "What is the name of this symbol?", A("Double barline", "Repeat sign", "Time signature", "Crescendo"), "a", "Two vertical lines together form a double barline.", "It’s not a single barline.", 6, 10, { type: "notation", notation: { kind: "barline", label: "A double barline with no repeat dots." } }),
    base("n3-literacy-018", "literacy", "double-barline-meaning", "What does this symbol usually mean?", A("The end of the music", "Play the section again", "Play louder", "Play faster"), "a", "A double barline usually marks the end of the music or a section.", "It’s like a full stop.", 6, 10, { type: "notation", notation: { kind: "barline", label: "A double barline with no repeat dots." } }),
    base("n3-literacy-021", "literacy", "crescendo-symbol", "What is this symbol called?", A("Crescendo", "Diminuendo", "Double barline", "Repeat sign"), "a", "This opening hairpin is a crescendo sign.", "Michael Jackson - Smooth Criminal: “Came in through the window, was the sound of a…”", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "crescendo", label: "A crescendo hairpin." } }),
    base("n3-literacy-022", "literacy", "diminuendo-symbol", "What is this symbol called?", A("Diminuendo", "Crescendo", "Double barline", "Repeat sign"), "a", "This closing hairpin is a diminuendo sign.", "It’s not a crescendo.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "diminuendo", label: "A diminuendo hairpin." } }),
    base("n3-literacy-053", "literacy", "forte-symbol", "What does this symbol mean?", A("Loud", "Quiet", "Gradually louder", "Gradually quieter"), "a", "The symbol f means forte, which means loud.", "It’s not quiet.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "f", label: "A forte dynamic marking." } }),
    base("n3-literacy-054", "literacy", "piano-symbol", "What does this symbol mean?", A("Quiet", "Loud", "Gradually quieter", "Gradually louder"), "a", "The symbol p means piano, which means quiet.", "It’s not loud.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "p", label: "A piano dynamic marking." } }),
    base("n3-literacy-023", "literacy", "rhythm-addition-three", "What is the total number of beats?", A("3", "2", "4", "5"), "a", "A crotchet is worth one beat and a minim is worth two beats, making three.", rhythmCalculationHint(["quarterNote", "halfNote"]), 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["quarterNote", "halfNote"], operators: ["+"], label: "A crotchet plus a minim." } }),
    base("n3-literacy-024", "literacy", "rhythm-addition-four", "What is the total number of beats?", A("4", "3", "5", "2"), "a", "A dotted minim is worth three beats and a crotchet is worth one beat, making four.", rhythmCalculationHint(["dottedHalfNote", "quarterNote"]), 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["dottedHalfNote", "quarterNote"], operators: ["+"], label: "A dotted minim plus a crotchet." } }),
    base("n3-literacy-025", "literacy", "rhythm-addition-five", "What is the total number of beats?", A("5", "4", "6", "3"), "a", "A semibreve is worth four beats and a crotchet is worth one beat, making five.", rhythmCalculationHint(["wholeNote", "quarterNote"]), 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "quarterNote"], operators: ["+"], label: "A semibreve plus a crotchet." } }),
    base("n3-literacy-026", "literacy", "rhythm-addition-two-minims", "What is the total number of beats?", A("4", "2", "3", "6"), "a", "Each minim is worth two beats, so two minims make four beats.", rhythmCalculationHint(["halfNote", "halfNote"]), 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["halfNote", "halfNote"], operators: ["+"], label: "A minim plus a minim." } }),
    base("n3-literacy-027", "literacy", "leap", "What is the distance between these two notes?", A("Leap", "Step", "Repeat", "Rest"), "a", "There are note positions between these two notes, so they move by leap.", "A ______ of faith.", 6, 10, { type: "notation", notation: { kind: "melody", pitches: ["E4", "C5"], label: "Two crotchets moving from E to C by leap." } }),
    base("n3-literacy-030", "literacy", "time-signature-purpose", "What does a time signature tell you?", A("How many beats are in each bar", "Which instrument to play", "How loud to play", "How fast to play"), "a", "A time signature tells you how many beats fit into each bar.", "It is about organising the beat, not the sound quality.", 6, 10, { type: "notation", notation: { kind: "timeSignature", top: 3, bottom: 4, label: "A three-four time signature." } }),

    // Hard: complete simple bars, identify their time signatures and calculate
    // positive rhythm sums using addition and subtraction.
    base("n3-literacy-031", "literacy", "complete-24-crotchet", "Which note value completes this 2/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "One crotchet is already shown. One more crotchet completes a two-beat bar.", barCurrentTotalHint(["quarterNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [2, 4], glyphs: ["quarterNote", "blank"], label: "A two-four bar with one crotchet and a blank." } }),
    base("n3-literacy-032", "literacy", "complete-24-minim", "Which note value completes this 2/4 bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "The blank must last two beats to complete the bar, so it is a minim.", barCurrentTotalHint(["blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [2, 4], glyphs: ["blank"], label: "An empty two-four bar with one blank." } }),
    base("n3-literacy-033", "literacy", "complete-34-minim", "Which note value completes this 3/4 bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "One crotchet uses one beat, leaving two beats. A minim completes the bar.", barCurrentTotalHint(["quarterNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["quarterNote", "blank"], label: "A three-four bar with one crotchet and a blank." } }),
    base("n3-literacy-034", "literacy", "complete-34-crotchet", "Which note value completes this 3/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A minim uses two beats, leaving one beat. A crotchet completes the bar.", barCurrentTotalHint(["halfNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["halfNote", "blank"], label: "A three-four bar with one minim and a blank." } }),
    base("n3-literacy-035", "literacy", "complete-34-two-crotchets", "Which note value completes this 3/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "Two crotchets use two beats, leaving one beat. A crotchet completes the bar.", barCurrentTotalHint(["quarterNote", "quarterNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["quarterNote", "quarterNote", "blank"], label: "A three-four bar with two crotchets and a blank." } }),
    base("n3-literacy-036", "literacy", "complete-44-minim", "Which note value completes this bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "A minim uses two beats, leaving two beats. Another minim completes the bar.", barCurrentTotalHint(["halfNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["halfNote", "blank"], label: "A four-four bar with one minim and a blank." } }),
    base("n3-literacy-037", "literacy", "complete-44-two-crotchets", "Which note value completes this bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "Two crotchets use two beats, leaving two beats. A minim completes the bar.", barCurrentTotalHint(["quarterNote", "quarterNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["quarterNote", "quarterNote", "blank"], label: "A four-four bar with two crotchets and a blank." } }),
    base("n3-literacy-038", "literacy", "complete-44-dotted-minim", "Which note value completes this bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A dotted minim uses three beats, leaving one beat. A crotchet completes the bar.", barCurrentTotalHint(["dottedHalfNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["dottedHalfNote", "blank"], label: "A four-four bar with a dotted minim and a blank." } }),
    base("n3-literacy-039", "literacy", "time-signature-from-two-beat-bar", "Which time signature fits this complete bar?", A("2/4", "3/4", "4/4", "5/4"), "a", "Two crotchets make two beats, so this is a 2/4 bar.", barCurrentTotalHint(["quarterNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote"], label: "A bar containing two crotchets." } }),
    base("n3-literacy-040", "literacy", "time-signature-from-three-beat-bar", "Which time signature fits this complete bar?", A("3/4", "2/4", "4/4", "5/4"), "a", "Three crotchets make three beats, so this is a 3/4 bar.", barCurrentTotalHint(["quarterNote", "quarterNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote", "quarterNote"], label: "A bar containing three crotchets." } }),
    base("n3-literacy-041", "literacy", "time-signature-from-four-beat-bar", "Which time signature fits this complete bar?", A("4/4", "2/4", "3/4", "5/4"), "a", "Four crotchets make four beats, so this is a 4/4 bar.", barCurrentTotalHint(["quarterNote", "quarterNote", "quarterNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote", "quarterNote", "quarterNote"], label: "A bar containing four crotchets." } }),
    base("n3-literacy-042", "literacy", "rhythm-sum-six", "What is the total number of beats?", A("6 beats", "5 beats", "4 beats", "3 beats"), "a", "A crotchet is one, a minim is two and a dotted minim is three: 1 + 2 + 3 = 6 beats.", rhythmCalculationHint(["quarterNote", "halfNote", "dottedHalfNote"]), 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["quarterNote", "halfNote", "dottedHalfNote"], operators: ["+", "+"], label: "A crotchet plus a minim plus a dotted minim." } }),
    base("n3-literacy-043", "literacy", "rhythm-sum-three", "What is the total number of beats?", A("3 beats", "2 beats", "4 beats", "5 beats"), "a", "A semibreve is four beats. 4 − 2 + 1 = 3 beats.", rhythmCalculationHint(["wholeNote", "halfNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "halfNote", "quarterNote"], operators: ["−", "+"], label: "A semibreve minus a minim plus a crotchet." } }),
    base("n3-literacy-044", "literacy", "rhythm-sum-four", "What is the total number of beats?", A("4 beats", "3 beats", "5 beats", "2 beats"), "a", "A dotted minim is three beats, a minim is two and a crotchet is one: 3 + 2 − 1 = 4 beats.", rhythmCalculationHint(["dottedHalfNote", "halfNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["dottedHalfNote", "halfNote", "quarterNote"], operators: ["+", "−"], label: "A dotted minim plus a minim minus a crotchet." } }),
    base("n3-literacy-045", "literacy", "rhythm-sum-one", "What is the total number of beats?", A("1 beat", "2 beats", "3 beats", "4 beats"), "a", "A semibreve is four beats. 4 − 2 − 1 = 1 beat.", rhythmCalculationHint(["wholeNote", "halfNote", "quarterNote"]), 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "halfNote", "quarterNote"], operators: ["−", "−"], label: "A semibreve minus a minim minus a crotchet." } }),
    base("n3-literacy-055", "literacy", "complete-44-minim-crotchet", "Which note value completes this bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A minim and a crotchet use three beats, leaving one beat. A crotchet completes the bar.", barCurrentTotalHint(["halfNote", "quarterNote", "blank"]), 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["halfNote", "quarterNote", "blank"], label: "A four-four bar with a minim, a crotchet and a blank." } }),
    rhythmCompletion("n3-literacy-056", ["Crotchet"], 2, "Crotchet"),
    rhythmCompletion("n3-literacy-057", ["Crotchet"], 3, "Minim"),
    rhythmCompletion("n3-literacy-058", ["Crotchet"], 4, "Dotted minim"),
    rhythmCompletion("n3-literacy-059", ["Crotchet"], 5, "Semibreve"),
    rhythmCompletion("n3-literacy-060", ["Minim"], 3, "Crotchet"),
    rhythmCompletion("n3-literacy-061", ["Minim"], 4, "Minim"),
    rhythmCompletion("n3-literacy-062", ["Minim"], 5, "Dotted minim"),
    rhythmCompletion("n3-literacy-063", ["Minim"], 6, "Semibreve"),
    rhythmCompletion("n3-literacy-064", ["Dotted minim"], 4, "Crotchet"),
    rhythmCompletion("n3-literacy-065", ["Dotted minim"], 5, "Minim"),
    rhythmCompletion("n3-literacy-066", ["Dotted minim"], 6, "Dotted minim"),
    rhythmCompletion("n3-literacy-067", ["Dotted minim"], 7, "Semibreve"),
    rhythmCompletion("n3-literacy-068", ["Semibreve"], 5, "Crotchet"),
    rhythmCompletion("n3-literacy-069", ["Semibreve"], 6, "Minim"),
    rhythmCompletion("n3-literacy-070", ["Semibreve"], 7, "Dotted minim"),
    rhythmCompletion("n3-literacy-071", ["Semibreve"], 8, "Semibreve"),
    rhythmCompletion("n3-literacy-072", ["Minim", "Crotchet"], 4, "Crotchet"),
  ];

  // National 4 is deliberately level-specific. These questions use National 3
  // note values only when they form part of a new National 4 calculation.
  const n4Literacy = [
    // Easy: recognise the new note values, repeat signs and mezzo dynamics.
    n4Base("n4-literacy-easy-001", "easy", "quaver-beats", "How many beats does this note last?", A("0.5 beat", "1 beat", "0.25 beat", "2 beats"), "a", "A quaver lasts for half a beat.", "Two quavers fit into one crotchet beat.", { type: "notation", notation: { kind: "glyphs", glyphs: ["eighthNote"], label: "One quaver." } }),
    n4Base("n4-literacy-easy-002", "easy", "quaver-name", "What is this note value called?", A("Quaver", "Crotchet", "Semiquaver", "Minim"), "a", "This note is a quaver.", "Same name as a popular brand of crisps.", { type: "notation", notation: { kind: "glyphs", glyphs: ["eighthNote"], label: "One quaver." } }),
    n4Base("n4-literacy-easy-003", "easy", "paired-quavers-total", "What is the total number of beats?", A("1 beat", "0.5 beat", "2 beats", "0.25 beat"), "a", "Two paired quavers make one beat altogether.", "Each quaver is worth half a beat.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "pairedEighthNotes", label: "Two paired quavers." } }),
    n4Base("n4-literacy-easy-004", "easy", "paired-quavers-name", "What are these note values called?", A("Quavers", "Semiquavers", "Crotchets", "Minims"), "a", "These note values are quavers.", "Same as the name given to a note worth 0.5 beats.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "pairedEighthNotes", label: "Two paired quavers." } }),
    n4Base("n4-literacy-easy-005", "easy", "semiquaver-beats", "How many beats does this note last?", A("0.25 beat", "0.5 beat", "1 beat", "2 beats"), "a", "A semiquaver lasts for a quarter of a beat.", "A quaver is worth 0.5. A semiquaver is half of a quaver.", { type: "notation", notation: { kind: "glyphs", glyphs: ["sixteenthNote"], label: "One semiquaver." } }),
    n4Base("n4-literacy-easy-006", "easy", "semiquaver-name", "What is this note value called?", A("Semiquaver", "Quaver", "Crotchet", "Minim"), "a", "This note is a semiquaver.", "A quaver has one tail/flag.", { type: "notation", notation: { kind: "glyphs", glyphs: ["sixteenthNote"], label: "One semiquaver." } }),
    n4Base("n4-literacy-easy-007", "easy", "grouped-semiquavers-total", "What is the total number of beats?", A("1 beat", "0.5 beat", "2 beats", "4 beats"), "a", "Four grouped semiquavers make one beat altogether.", "Each semiquaver is worth a quarter of a beat.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "fourSixteenthNotes", label: "Four grouped semiquavers." } }),
    n4Base("n4-literacy-easy-008", "easy", "grouped-semiquavers-name", "What are these note values called?", A("Semiquavers", "Quavers", "Crotchets", "Minims"), "a", "These note values are semiquavers.", "Each are worth 0.25.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "fourSixteenthNotes", label: "Four grouped semiquavers." } }),
    n4Base("n4-literacy-easy-009", "easy", "repeat-sign-name", "What is the name of this symbol?", A("Repeat sign", "Double barline", "Time signature", "Treble clef"), "a", "This is a repeat sign.", "What is the name of this symbol? What is the name of this symbol? What is the name of this symbol?", { type: "notation", notation: { kind: "glyphs", glyphs: ["repeatRight"], label: "A right repeat sign." } }),
    n4Base("n4-literacy-easy-010", "easy", "repeat-sign-meaning", "What does this symbol mean?", A("Play the section again", "Finish the music", "Play more loudly", "Play more slowly"), "a", "A repeat sign tells the performer to play the section again.", "It’s called a repeat sign.", { type: "notation", notation: { kind: "glyphs", glyphs: ["repeatRight"], label: "A right repeat sign." } }),
    n4Base("n4-literacy-easy-011", "easy", "mezzo-piano-meaning", "What does this symbol mean?", A("Moderately quiet", "Very quiet", "Moderately loud", "Very loud"), "a", "mp means mezzo piano: moderately quiet.", "Mezzo is the Italian word for half, middle or medium.", { type: "notation", notation: { kind: "dynamic", dynamic: "mp", label: "The dynamic marking mezzo piano." } }),
    n4Base("n4-literacy-easy-012", "easy", "mezzo-piano-name", "What is the name of this dynamic?", A("Mezzo piano", "Mezzo forte", "Piano", "Pianissimo"), "a", "The dynamic marking mp is called mezzo piano.", "Mezzo is the Italian word for half, middle or medium.", { type: "notation", notation: { kind: "dynamic", dynamic: "mp", label: "The dynamic marking mezzo piano." } }),
    n4Base("n4-literacy-easy-013", "easy", "mezzo-forte-meaning", "What does this symbol mean?", A("Moderately loud", "Very loud", "Moderately quiet", "Very quiet"), "a", "mf means mezzo forte: moderately loud.", "Mezzo is the Italian word for half, middle or medium.", { type: "notation", notation: { kind: "dynamic", dynamic: "mf", label: "The dynamic marking mezzo forte." } }),
    n4Base("n4-literacy-easy-014", "easy", "mezzo-forte-name", "What is the name of this dynamic?", A("Mezzo forte", "Mezzo piano", "Forte", "Fortissimo"), "a", "The dynamic marking mf is called mezzo forte.", "Mezzo is the Italian word for half, middle or medium.", { type: "notation", notation: { kind: "dynamic", dynamic: "mf", label: "The dynamic marking mezzo forte." } }),
    ...[
      [["E4", "F4", "G4", "A4"], ["E4", "F4", "G4", "A4"]],
      [["G4", "A4", "B4", "C5"], ["G4", "A4", "B4", "C5"]],
    ].map(([firstBar, secondBar], index) => n4Base(`n4-literacy-easy-${String(index + 15).padStart(3, "0")}`, "easy", "two-bar-repetition", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "a", "The second bar repeats exactly the same notes as the first bar.", "Copy and paste.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: "Two bars showing exact melodic repetition." } })),
    ...[
      ["E4", "E", "G", "F", "D"],
      ["F4", "F", "A", "E", "G"],
      ["G4", "G", "B", "F", "A"],
      ["A4", "A", "C", "G", "B"],
      ["B4", "B", "D", "A", "C"],
      ["C5", "C", "E", "B", "D"],
      ["D5", "D", "F", "C", "E"],
      ["E5", "E", "G", "D", "F"],
      ["F5", "F", "A", "E", "G"],
    ].map(([pitch, correct, b, c, d], index) => n4Base(`n4-literacy-easy-${String(index + 19).padStart(3, "0")}`, "easy", `treble-stave-note-${pitch.toLowerCase()}`, "What note is this?", A(correct, b, c, d), "a", `This note is ${correct}.`, noteIdentificationHint(pitch), { type: "notation", notation: { kind: "note", pitch, label: `A crotchet ${correct} on the treble stave.` } })),

    // Medium: new ledger-line notes, true sequences and quaver calculations.
    ...[
      ["C4", "C", "D", "B", "E"], ["D4", "D", "C", "E", "B"],
      ["G5", "G", "F", "A", "E"], ["A5", "A", "G", "F", "B"],
      ["C4", "C", "A", "D", "E"],
    ].map(([pitch, correct, b, c, d], index) => n4Base(`n4-literacy-medium-${String(index + 1).padStart(3, "0")}`, "medium", `ledger-note-${pitch.toLowerCase()}`, "What note is this?", A(correct, b, c, d), "a", `This ledger-line note is ${correct}.`, noteIdentificationHint(pitch), { type: "notation", notation: { kind: "note", pitch, label: `A crotchet ${correct} shown ${pitch === "C4" || pitch === "D4" ? "below" : "above"} the treble stave.` } })),
    ...[
      [["E4", "F4", "G4", "A4"], ["F4", "G4", "A4", "B4"], "higher"],
      [["F4", "G4", "A4", "B4"], ["G4", "A4", "B4", "C5"], "higher"],
      [["G4", "A4", "B4", "C5"], ["F4", "G4", "A4", "B4"], "lower"],
      [["C5", "B4", "A4", "G4"], ["B4", "A4", "G4", "F4"], "lower"],
      [["B4", "A4", "G4", "F4"], ["C5", "B4", "A4", "G4"], "higher"],
      [["A4", "B4", "C5", "D5"], ["G4", "A4", "B4", "C5"], "lower"],
    ].map(([firstBar, secondBar, direction], index) => n4Base(`n4-literacy-medium-${String(index + 9).padStart(3, "0")}`, "medium", "two-bar-sequence", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), direction === "higher" ? "b" : "c", `Every note in the second bar is one step ${direction}, so this is a sequence ${direction}.`, "Check whether every note has moved by the same step, then decide whether it moved higher or lower.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: `Two bars showing a melodic sequence one step ${direction}.` } })),
    ...[
      [["E5", "D5", "F5", "E5"], ["D5", "C5", "E5", "D5"], "one step"],
      [["C5", "E5", "D5", "F5"], ["B4", "D5", "C5", "E5"], "one step"],
      [["G5", "E5", "F5", "D5"], ["E5", "C5", "D5", "B4"], "two steps"],
      [["A5", "F5", "G5", "E5"], ["F5", "D5", "E5", "C5"], "two steps"],
    ].map(([firstBar, secondBar, distance], index) => n4Base(`n4-literacy-medium-${String(index + 30).padStart(3, "0")}`, "medium", "two-bar-sequence-lower", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "c", `Every note in the second bar is ${distance} lower, so this is a sequence lower.`, "Check that every note moves down by the same distance.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: `Two bars showing a melodic sequence ${distance} lower.` } })),
    n4Base("n4-literacy-medium-034", "medium", "dynamic-order-loudest", "Which dynamic is the loudest?", A("f", "mf", "mp", "p"), "a", "Forte, shown as f, is the loudest of these four dynamics.", "Piano is the Italian word for soft.", { type: "text", answerDisplay: "dynamic" }),
    n4Base("n4-literacy-medium-035", "medium", "dynamic-order-quietest", "Which dynamic is the quietest?", A("p", "mp", "mf", "f"), "a", "Piano, shown as p, is the quietest of these four dynamics.", "Forte is the Italian word for loud.", { type: "text", answerDisplay: "dynamic" }),
    ...[
      ["quarterNote", "1.5 beats", "A quaver plus a crotchet."],
      ["halfNote", "2.5 beats", "A quaver plus a minim."],
      ["dottedHalfNote", "3.5 beats", "A quaver plus a dotted minim."],
      ["wholeNote", "4.5 beats", "A quaver plus a semibreve."],
    ].map(([other, total, label], index) => {
      const distractors = ["1.5 beats", "2.5 beats", "3.5 beats", "4.5 beats", "5.5 beats"].filter((choice) => choice !== total).slice(0, 3);
      return n4Base(`n4-literacy-medium-${String(index + 15).padStart(3, "0")}`, "medium", "two-rhythm-quaver-sum", "What is the total number of beats?", A(total, ...distractors), "a", `A quaver is worth half a beat, giving a total of ${total}.`, rhythmCalculationHint(["eighthNote", other]), { type: "notation", notation: { kind: "rhythmSum", terms: ["eighthNote", other], operators: ["+"], label } });
    }),
    ...[
      [["pairedEighthNotes", "quarterNote"], "2/4"],
      [["pairedEighthNotes", "halfNote"], "3/4"],
      [["pairedEighthNotes", "dottedHalfNote"], "4/4"],
      [["pairedEighthNotes", "pairedEighthNotes"], "2/4"],
      [["pairedEighthNotes", "quarterNote", "quarterNote"], "3/4"],
    ].map(([glyphs, answer], index) => n4Base(`n4-literacy-medium-${String(index + 19).padStart(3, "0")}`, "medium", "time-signature-paired-quavers", "Which time signature fits this complete bar?", A(answer, answer === "2/4" ? "3/4" : "2/4", answer === "4/4" ? "3/4" : "4/4", "5/4"), "a", `The rhythms total ${answer[0]} beats, so the bar is in ${answer}.`, barCurrentTotalHint(glyphs), { type: "notation", notation: { kind: "bar", glyphs, label: `A complete ${answer} bar containing paired quavers.` } })),
    ...[
      [[2, 4], ["quarterNote", "eighthNote", "blank"], "Quaver", "One crotchet and one quaver use one and a half beats, leaving half a beat."],
      [[2, 4], ["pairedEighthNotes", "blank"], "Crotchet", "Paired quavers use one beat, leaving one crotchet beat."],
      [[3, 4], ["halfNote", "eighthNote", "blank"], "Quaver", "A minim and a quaver use two and a half beats, leaving half a beat."],
      [[3, 4], ["pairedEighthNotes", "quarterNote", "blank"], "Crotchet", "Paired quavers and a crotchet use two beats, leaving one crotchet beat."],
      [[4, 4], ["dottedHalfNote", "eighthNote", "blank"], "Quaver", "A dotted minim and a quaver use three and a half beats, leaving half a beat."],
      [[4, 4], ["halfNote", "pairedEighthNotes", "blank"], "Crotchet", "A minim and paired quavers use three beats, leaving one crotchet beat."],
    ].map(([time, glyphs, answer, explanation], index) => {
      const quaverDescription = glyphs.includes("pairedEighthNotes") ? "paired quavers" : "a single quaver";
      return n4Base(`n4-literacy-medium-${String(index + 24).padStart(3, "0")}`, "medium", "complete-bar-single-quaver", "Which note value completes this bar?", A(answer, answer === "Quaver" ? "Crotchet" : "Quaver", "Semiquaver", "Minim"), "a", `${explanation} The missing note is a ${answer.toLowerCase()}.`, barCurrentTotalHint(glyphs), { type: "notation", notation: { kind: "bar", time, glyphs, label: `A ${time[0]}/${time[1]} bar with ${quaverDescription} and one missing note.` } });
    }),

    // Hard: beams, mixed semiquaver groups and fractional calculations.
    n4Base("n4-literacy-hard-001", "hard", "beam-name", "What is the highlighted part of the rhythm called?", A("Beam", "Stem", "Notehead", "Flag"), "a", "The horizontal line joining the notes is called a beam.", "Light can create these.", { type: "notation", notation: { kind: "beam", pattern: "pairedEighthNotes", label: "Paired quavers with their beam highlighted." } }),
    n4Base("n4-literacy-hard-002", "hard", "beam-name", "What is the highlighted music symbol called?", A("Beam", "Barline", "Ledger line", "Tie"), "a", "This horizontal joining line is a beam.", "Light can create these.", { type: "notation", notation: { kind: "beam", pattern: "fourSixteenthNotes", label: "Grouped semiquavers with their beams highlighted." } }),
    n4Base("n4-literacy-hard-045", "hard", "note-part-stem", "What is the part of the note indicated by the arrow called?", A("Stem", "Notehead", "Flag", "Beam"), "a", "The vertical line extending from the notehead is called the stem.", "Flowers have these.", { type: "notation", notation: { kind: "notePart", part: "stem", label: "A quaver with an arrow pointing to its stem." } }),
    n4Base("n4-literacy-hard-046", "hard", "note-part-notehead", "What is the part of the note indicated by the arrow called?", A("Notehead", "Stem", "Flag", "Beam"), "a", "The filled oval part of the note is called the notehead.", "We all have one of these, take note.", { type: "notation", notation: { kind: "notePart", part: "notehead", label: "A quaver with an arrow pointing to its notehead." } }),
    n4Base("n4-literacy-hard-047", "hard", "note-part-flag", "What is the part of the note indicated by the arrow called?", A("Flag", "Stem", "Notehead", "Beam"), "a", "The curved mark attached to the top of a single quaver's stem is called the flag.", "You can wave these. Sometimes called a tail.", { type: "notation", notation: { kind: "notePart", part: "flag", label: "A quaver with an arrow pointing to its flag." } }),
    ...[
      ["quaverTwoSemiquavers", "A quaver followed by two semiquavers.", 1],
      ["twoSemiquaversQuaver", "Two semiquavers followed by a quaver.", 1],
      ["semiquaverQuaverSemiquaver", "A semiquaver, a quaver and a semiquaver.", 0],
      ["quaverTwoSemiquavers", "A quaver and two semiquavers grouped together.", 1],
    ].map(([pattern, label, secondaryBeamTrim], index) => n4Base(`n4-literacy-hard-${String(index + 3).padStart(3, "0")}`, "hard", "mixed-quaver-semiquavers-total", "What is the total value of this rhythm?", A("1 beat", "0.5 beat", "1.5 beats", "2 beats"), "a", "The quaver is half a beat and the two semiquavers total half a beat, making one beat altogether.", "Convert each note into its beat value.", { type: "notation", notation: { kind: "rhythmFigure", pattern, label, secondaryBeamTrim } })),
    ...[
      [["wholeNote", "halfNote", "sixteenthNote"], ["−", "+"], "2.25 beats", "4 − 2 + 0.25 = 2.25 beats."],
      [["dottedHalfNote", "pairedEighthNotes", "sixteenthNote"], ["+", "−"], "3.75 beats", "3 + 1 − 0.25 = 3.75 beats."],
      [["halfNote", "eighthNote", "sixteenthNote"], ["−", "+"], "1.75 beats", "2 − 0.5 + 0.25 = 1.75 beats."],
      [["pairedEighthNotes", "fourSixteenthNotes", "sixteenthNote"], ["+", "−"], "1.75 beats", "1 + 1 − 0.25 = 1.75 beats."],
      [["wholeNote", "dottedHalfNote", "sixteenthNote"], ["−", "+"], "1.25 beats", "4 − 3 + 0.25 = 1.25 beats."],
      [["halfNote", "eighthNote", "sixteenthNote"], ["+", "−"], "2.25 beats", "2 + 0.5 − 0.25 = 2.25 beats."],
      [["dottedHalfNote", "pairedEighthNotes", "sixteenthNote"], ["−", "+"], "2.25 beats", "3 − 1 + 0.25 = 2.25 beats."],
      [["wholeNote", "fourSixteenthNotes", "sixteenthNote"], ["−", "−"], "2.75 beats", "4 − 1 − 0.25 = 2.75 beats."],
    ].map(([terms, operators, answer, explanation], index) => {
      const distractors = ["1.25 beats", "1.75 beats", "2.25 beats", "2.5 beats", "2.75 beats", "3.25 beats", "3.75 beats"].filter((choice) => choice !== answer).slice(0, 3);
      return n4Base(`n4-literacy-hard-${String(index + 7).padStart(3, "0")}`, "hard", "three-rhythm-semiquaver-sum", "What is the total number of beats?", A(answer, ...distractors), "a", explanation, rhythmCalculationHint(terms), { type: "notation", notation: { kind: "rhythmSum", terms, operators, label: "A three-part rhythm calculation involving a single semiquaver." } });
    }),
    ...[
      [["fourSixteenthNotes", "quarterNote"], "2/4"],
      [["fourSixteenthNotes", "halfNote"], "3/4"],
      [["fourSixteenthNotes", "dottedHalfNote"], "4/4"],
      [["fourSixteenthNotes", "pairedEighthNotes"], "2/4"],
      [["fourSixteenthNotes", "quarterNote", "quarterNote"], "3/4"],
      [["fourSixteenthNotes", "halfNote", "quarterNote"], "4/4"],
    ].map(([glyphs, answer], index) => n4Base(`n4-literacy-hard-${String(index + 15).padStart(3, "0")}`, "hard", "time-signature-grouped-semiquavers", "Which time signature fits this complete bar?", A(answer, answer === "2/4" ? "3/4" : "2/4", answer === "4/4" ? "3/4" : "4/4", "5/4"), "a", `Four grouped semiquavers equal one beat. The complete bar totals ${answer[0]} beats, so it is in ${answer}.`, barCurrentTotalHint(glyphs), { type: "notation", notation: { kind: "bar", glyphs, label: `A complete ${answer} bar containing four grouped semiquavers.` } })),
    ...[
      [[2, 4], ["quarterNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total one and three-quarter beats, leaving one semiquaver."],
      [[2, 4], ["semiquaverQuaverSemiquaver", "blank"], "Crotchet", "The mixed semiquaver group uses one beat, leaving one crotchet beat."],
      [[3, 4], ["halfNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total two and three-quarter beats, leaving one semiquaver."],
      [[3, 4], ["semiquaverQuaverSemiquaver", "quarterNote", "blank"], "Crotchet", "The mixed group and crotchet use two beats, leaving one crotchet beat."],
      [[4, 4], ["dottedHalfNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total three and three-quarter beats, leaving one semiquaver."],
      [[4, 4], ["halfNote", "semiquaverQuaverSemiquaver", "blank"], "Crotchet", "The minim and mixed group use three beats, leaving one crotchet beat."],
    ].map(([time, glyphs, answer, explanation], index) => n4Base(`n4-literacy-hard-${String(index + 21).padStart(3, "0")}`, "hard", "complete-bar-single-semiquaver", "Which note value completes this bar?", A(answer, answer === "Semiquaver" ? "Crotchet" : "Semiquaver", "Quaver", "Minim"), "a", explanation, barCurrentTotalHint(glyphs), { type: "notation", notation: { kind: "bar", time, glyphs, label: `A ${time[0]}/${time[1]} bar involving single semiquavers and one missing note.` } })),
    ...[
      [["E4", "F4", "G4", "A4"], ["F4", "G4", "B4", "B4"]],
      [["F4", "G4", "A4", "B4"], ["G4", "A4", "B4", "D5"]],
      [["G4", "A4", "B4", "C5"], ["F4", "G4", "A4", "C5"]],
      [["C5", "B4", "A4", "G4"], ["B4", "A4", "F4", "F4"]],
      [["B4", "A4", "G4", "F4"], ["C5", "B4", "A4", "F4"]],
      [["A4", "B4", "C5", "D5"], ["G4", "A4", "C5", "C5"]],
    ].map(([firstBar, secondBar], index) => n4Base(`n4-literacy-hard-${String(index + 27).padStart(3, "0")}`, "hard", "two-bar-near-sequence", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "d", "One note is a step away from the expected pattern, so the bars show neither an exact sequence nor repetition.", "Check each note very carefully.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: "Two related bars with one altered note, showing neither sequence nor exact repetition." } })),
    ...[
      [["Quaver", "Minim", "Crotchet"], 0, ["Semiquaver", "Crotchet", "Minim"]],
      [["Dotted minim", "Semiquaver", "Crotchet"], 1, ["Quaver", "Crotchet", "Minim"]],
      [["Quaver", "Crotchet", "Minim"], 2, ["Crotchet", "Dotted minim", "Semibreve"]],
      [["Crotchet", "Semiquaver", "Dotted minim"], 0, ["Quaver", "Minim", "Dotted minim"]],
      [["Semibreve", "Quaver", "Minim"], 1, ["Semiquaver", "Crotchet", "Minim"]],
      [["Semiquaver", "Dotted minim", "Semibreve"], 2, ["Crotchet", "Minim", "Dotted minim"]],
      [["Minim", "Quaver", "Dotted minim"], 0, ["Crotchet", "Dotted minim", "Semibreve"]],
      [["Crotchet", "Semibreve", "Semiquaver"], 1, ["Crotchet", "Minim", "Dotted minim"]],
      [["Minim", "Crotchet", "Quaver"], 2, ["Semiquaver", "Crotchet", "Minim"]],
      [["Semiquaver", "Semibreve", "Minim"], 0, ["Quaver", "Crotchet", "Minim"]],
      [["Dotted minim", "Crotchet", "Quaver"], 1, ["Quaver", "Minim", "Dotted minim"]],
      [["Semibreve", "Dotted minim", "Semiquaver"], 2, ["Quaver", "Crotchet", "Minim"]],
    ].map(([values, missingIndex, distractors], index) => n4RhythmCompletion(`n4-literacy-hard-${String(index + 33).padStart(3, "0")}`, values, missingIndex, distractors)),
    ...[
      ["How many semiquavers fit into a quaver?", "sixteenthNote", "eighthNote", "2", ["4", "1", "8"], "Two semiquavers have the same total value as one quaver.", "A semiquaver compared with a quaver."],
      ["How many semiquavers fit into a crotchet?", "sixteenthNote", "quarterNote", "4", ["2", "8", "3"], "Four semiquavers have the same total value as one crotchet.", "A semiquaver compared with a crotchet."],
      ["How many semiquavers fit into a minim?", "sixteenthNote", "halfNote", "8", ["4", "12", "6"], "A minim lasts two beats, so eight semiquavers fit into it.", "A semiquaver compared with a minim."],
      ["How many semiquavers fit into a dotted minim?", "sixteenthNote", "dottedHalfNote", "12", ["8", "16", "6"], "A dotted minim lasts three beats, so twelve semiquavers fit into it.", "A semiquaver compared with a dotted minim."],
      ["How many semiquavers fit into a semibreve?", "sixteenthNote", "wholeNote", "16", ["12", "8", "4"], "A semibreve lasts four beats, so sixteen semiquavers fit into it.", "A semiquaver compared with a semibreve."],
      ["How many quavers fit into a crotchet?", "eighthNote", "quarterNote", "2", ["4", "1", "3"], "Two quavers have the same total value as one crotchet.", "A quaver compared with a crotchet."],
      ["How many quavers fit into a minim?", "eighthNote", "halfNote", "4", ["2", "8", "6"], "A minim lasts two beats, so four quavers fit into it.", "A quaver compared with a minim."],
      ["How many quavers fit into a dotted minim?", "eighthNote", "dottedHalfNote", "6", ["4", "8", "3"], "A dotted minim lasts three beats, so six quavers fit into it.", "A quaver compared with a dotted minim."],
      ["How many quavers fit into a semibreve?", "eighthNote", "wholeNote", "8", ["4", "6", "16"], "A semibreve lasts four beats, so eight quavers fit into it.", "A quaver compared with a semibreve."],
      ["How many pairs of quavers fit into a minim?", "pairedEighthNotes", "halfNote", "2", ["4", "1", "3"], "Each pair of quavers equals one beat, so two pairs fit into a minim.", "A pair of quavers compared with a minim."],
      ["How many pairs of quavers fit into a dotted minim?", "pairedEighthNotes", "dottedHalfNote", "3", ["2", "6", "4"], "Each pair of quavers equals one beat, so three pairs fit into a dotted minim.", "A pair of quavers compared with a dotted minim."],
      ["How many groups of four semiquavers fit into a minim?", "fourSixteenthNotes", "halfNote", "2", ["4", "1", "8"], "Each group of four semiquavers equals one beat, so two groups fit into a minim.", "Four grouped semiquavers compared with a minim."],
    ].map(([question, smaller, larger, answer, distractors, explanation, label], index) => n4Base(`n4-literacy-hard-${String(index + 48).padStart(3, "0")}`, "hard", "note-value-comparison", question, A(answer, ...distractors), "a", explanation, noteValueComparisonHint(smaller), { type: "notation", notation: { kind: "rhythmSum", terms: [smaller, larger], operators: ["→"], label } })),
  ];

  const n5Literacy = [
    // Easy: National 4 natural notes within the stave, plus National 5
    // accidentals, key signatures and named dotted rhythms.
    ...[
      ["E4", "E", ["G", "B", "D"]], ["F4", "F", ["A", "C", "E"]],
      ["G4", "G", ["B", "D", "F"]], ["A4", "A", ["C", "E", "G"]],
      ["B4", "B", ["G", "D", "F"]], ["C5", "C", ["A", "E", "B"]],
      ["D5", "D", ["B", "F", "A"]], ["E5", "E", ["C", "F", "D"]],
      ["F5", "F", ["D", "E", "G"]],
    ].map(([pitch, answer, distractors], index) => n5Base(`n5-literacy-easy-${String(index + 1).padStart(3, "0")}`, "easy", "natural-note-identification", "What note is this?", A(answer, ...distractors), "a", `This note is ${answer}.`, noteIdentificationHint(pitch), { type: "notation", notation: { kind: "note", pitch, label: `The note ${answer} within the treble stave.` } })),
    ...[
      ["C4", "sharp", "C sharp"], ["D4", "sharp", "D sharp"], ["D4", "flat", "D flat"],
      ["E4", "flat", "E flat"], ["F4", "sharp", "F sharp"], ["G4", "sharp", "G sharp"],
      ["G4", "flat", "G flat"], ["A4", "sharp", "A sharp"], ["A4", "flat", "A flat"],
      ["B4", "flat", "B flat"], ["C5", "sharp", "C sharp"], ["D5", "sharp", "D sharp"],
      ["D5", "flat", "D flat"], ["E5", "flat", "E flat"], ["F5", "sharp", "F sharp"],
      ["G5", "sharp", "G sharp"], ["G5", "flat", "G flat"], ["A5", "sharp", "A sharp"],
      ["A5", "flat", "A flat"],
    ].map(([pitch, accidental, answer], index) => {
      const allowedSpellings = ["C sharp", "D sharp", "D flat", "E flat", "F sharp", "G sharp", "G flat", "A sharp", "A flat", "B flat"];
      const distractors = [...allowedSpellings.slice(index % allowedSpellings.length), ...allowedSpellings]
        .filter((choice, choiceIndex, choices) => choice !== answer && choices.indexOf(choice) === choiceIndex)
        .slice(0, 3);
      return n5Base(`n5-literacy-easy-${String(index + 10).padStart(3, "0")}`, "easy", "accidental-note-identification", "What note is this?", A(answer, ...distractors), "a", `The note is ${answer}.`, noteIdentificationHint(pitch, "treble", accidental), { type: "notation", notation: { kind: "note", pitch, accidental, accidentalXOffset: -7, label: `The note ${answer} on the treble stave.` } });
    }),
    n5Base("n5-literacy-easy-029", "easy", "natural-sign-name", "What is this symbol called?", A("Natural", "Sharp", "Flat", "Key signature"), "a", "This is a natural sign. It cancels a sharp or flat.", "If you're good at something, someone may describe you as this.", { type: "notation", notation: { kind: "accidentalSymbol", accidental: "natural", label: "A natural sign." } }),
    ...[
      ["C major", "What is this major key signature?", ["C major", "G major", "F major", "D major"], "Do you SEE anything?"],
      ["G major", "What is this major key signature?", ["G major", "F major", "C major", "D major"], "A sharp looks like a hashtaG."],
      ["F major", "What is this major key signature?", ["F major", "G major", "C major", "D major"], "What letter does the word flat begin with?"],
      ["A minor", "What is this minor key signature?", ["A minor", "G sharp minor", "C minor", "F minor"], "Don't let this cause you A minor problem."],
    ].map(([signature, question, answers, tip], index) => n5Base(`n5-literacy-easy-${String(index + 30).padStart(3, "0")}`, "easy", "key-signature-identification", question, A(...answers), "a", `${signature} has ${signature === "G major" ? "one sharp" : signature === "F major" ? "one flat" : "no sharps or flats"} in its key signature.`, tip, { type: "notation", notation: { kind: "keySignature", signature, label: `The key signature of ${signature}.` } })),
    ...[
      ["dottedQuarterNote", "Dotted crotchet", "A dotted crotchet lasts one and a half beats.", "The dot adds on 0.5 to this particular rhythm."],
      ["dottedEighthNote", "Dotted quaver", "A dotted quaver lasts three quarters of a beat.", "The dot adds on 0.25 to this particular rhythm."],
      ["scotchSnap", "Scotch snap", "A Scotch snap is a semiquaver followed by a dotted quaver.", "These type of rhythms are often found in strathspeys."],
      ["dottedQuaverSemiquaver", "Dotted quaver and semiquaver", "This group is a dotted quaver followed by a semiquaver.", "The first note is worth 0.75 and the second is 0.25. They are joined together with the beam."],
    ].map(([term, answer, explanation, tip], index) => {
      const notation = ["dottedQuarterNote", "dottedEighthNote"].includes(term)
        ? { kind: "glyphs", glyphs: [term], label: explanation }
        : { kind: "rhythmSum", terms: [term], operators: [], label: explanation };
      return n5Base(`n5-literacy-easy-${String(index + 34).padStart(3, "0")}`, "easy", "national-5-rhythm-name", "What is the name given to this rhythm?", A(answer, answer === "Scotch snap" ? "Dotted quaver and semiquaver" : "Scotch snap", "Paired quavers", "Four semiquavers"), "a", explanation, tip, { type: "notation", notation });
    }),
    ...[
      ["sharp", "What does a sharp sign do?", "Raises a note by one semitone", ["Lowers a note by one semitone", "Cancels a sharp or flat", "Raises a note by one tone"], "A sharp sign raises a note by one semitone.", "Sharp things sticking up make your tyres go down flat."],
      ["flat", "What does a flat sign do?", "Lowers a note by one semitone", ["Raises a note by one semitone", "Cancels a sharp or flat", "Lowers a note by one tone"], "A flat sign lowers a note by one semitone.", "Sharp things sticking up make your tyres go down flat."],
      ["natural", "What does a natural sign do?", "Cancels a sharp or flat", ["Raises a note by one semitone", "Lowers a note by one semitone", "Raises a note by one tone"], "A natural sign cancels a sharp or flat.", "I don't want a flat or a sharp."],
    ].map(([accidental, question, answer, distractors, explanation, tip], index) => n5Base(`n5-literacy-easy-${String(index + 38).padStart(3, "0")}`, "easy", "accidental-function", question, A(answer, ...distractors), "a", explanation, tip, { type: "notation", notation: { kind: "accidentalSymbol", accidental, label: `A ${accidental} sign.` } })),
    n5Base("n5-literacy-easy-041", "easy", "augmentation-dot-function", "What does the dot after a note do?", A("Adds half the note’s original value", "Adds one beat", "Doubles the note’s value", "Makes the note staccato"), "a", "An augmentation dot adds half of the note’s original value.", "Multiplied by 1.5", { type: "notation", notation: { kind: "glyphs", glyphs: ["dottedQuarterNote"], label: "A dotted crotchet showing an augmentation dot after the note." } }),

    // Medium: dynamics, repeat endings, intervals and beat values.
    ...[
      ["pp", "What is this dynamic called?", "Pianissimo", ["Fortissimo", "Piano", "Mezzo piano"], "Pianissimo means very quiet."],
      ["ff", "What is this dynamic called?", "Fortissimo", ["Pianissimo", "Forte", "Mezzo forte"], "Fortissimo means very loud."],
      ["pp", "What does this dynamic mean?", "Very quiet", ["Quiet", "Very loud", "Moderately quiet"], "Pianissimo means very quiet."],
      ["ff", "What does this dynamic mean?", "Very loud", ["Loud", "Very quiet", "Moderately loud"], "Fortissimo means very loud."],
    ].map(([dynamic, question, answer, distractors, explanation], index) => n5Base(`n5-literacy-medium-${String(index + 1).padStart(3, "0")}`, "medium", "national-5-dynamics", question, A(answer, ...distractors), "a", explanation, dynamic === "pp" ? "Piano is the Italian word for soft." : "Forte is the Italian word for loud.", { type: "notation", notation: { kind: "dynamic", dynamic, label: `The dynamic ${dynamic}.` } })),
    ...[
      ["Which dynamic is the quietest?", "pp", ["pp", "p", "f", "ff"], "Pianissimo is the quietest of these dynamics."],
      ["Which dynamic is the loudest?", "ff", ["ff", "f", "p", "pp"], "Fortissimo is the loudest of these dynamics."],
      ["Which dynamic is the quietest?", "pp", ["pp", "mp", "mf", "ff"], "Pianissimo is the quietest of these dynamics."],
      ["Which dynamic is the loudest?", "ff", ["ff", "mf", "mp", "pp"], "Fortissimo is the loudest of these dynamics."],
    ].map(([question, answer, answers, explanation], index) => n5Base(`n5-literacy-medium-${String(index + 5).padStart(3, "0")}`, "medium", "dynamic-comparison", question, A(...answers), "a", explanation, answer === "pp" ? "Piano is the Italian word for soft." : "Forte is the Italian word for loud.", { answerDisplay: "dynamic", type: "text" })),
    ...[
      [1, "1st-time bar", ["1st-time bar", "2nd-time bar", "Repeat sign", "Double barline"]],
      [2, "2nd-time bar", ["2nd-time bar", "1st-time bar", "Repeat sign", "Double barline"]],
      [1, "1st-time bar", ["1st-time bar", "Double barline", "2nd-time bar", "Barline"]],
      [2, "2nd-time bar", ["2nd-time bar", "Double barline", "1st-time bar", "Barline"]],
    ].map(([number, answer, answers], index) => n5Base(`n5-literacy-medium-${String(index + 9).padStart(3, "0")}`, "medium", "repeat-ending-name", "What is the name given to this symbol?", A(...answers), "a", `This is a ${answer}.`, "The number shows which ending is played on that pass through the repeated section.", { type: "notation", notation: { kind: "repeatEnding", number, label: `A ${answer} symbol.` } })),
    ...[
      [["E4", "F4"], "2nd"], [["G4", "A4"], "2nd"], [["B4", "C5"], "2nd"],
      [["D5", "E5"], "2nd"], [["E4", "E5"], "Octave"], [["F4", "F5"], "Octave"],
      [["G4", "G5"], "Octave"], [["A4", "A5"], "Octave"],
    ].map(([pitches, answer], index) => n5Base(`n5-literacy-medium-${String(index + 13).padStart(3, "0")}`, "medium", "interval-identification", "What interval is this?", A(answer, answer === "2nd" ? "3rd" : "7th", answer === "2nd" ? "Octave" : "6th", answer === "2nd" ? "Unison" : "2nd"), "a", `The interval is ${answer === "Octave" ? "an octave" : "a 2nd"}.`, answer === "Octave" ? "Both notes are the same letter spaced apart." : "Count both the starting note and the finishing note.", { type: "notation", notation: { kind: "interval", pitches, matchStepLeapLayout: true, label: `Two notes forming ${answer === "Octave" ? "an octave" : "a second"}.` } })),
    ...[
      ["dottedQuarterNote", "Dotted crotchet", "1.5 beats", ["1 beat", "0.75 beat", "2 beats"]],
      ["dottedEighthNote", "Dotted quaver", "0.75 beat", ["0.5 beat", "1 beat", "1.5 beats"]],
      ["dottedQuaverSemiquaver", "Dotted quaver and semiquaver", "1 beat", ["0.75 beat", "1.25 beats", "1.5 beats"]],
      ["scotchSnap", "Scotch snap", "1 beat", ["0.75 beat", "1.25 beats", "1.5 beats"]],
    ].flatMap(([term, name, answer, distractors], index) => {
      const notation = term === "dottedQuarterNote"
        ? { kind: "glyphs", glyphs: [term], label: name }
        : { kind: "rhythmSum", terms: [term], operators: [], label: name };
      return [
        n5Base(`n5-literacy-medium-${String(index + 21).padStart(3, "0")}`, "medium", "national-5-rhythm-beats", "What is the total value of this rhythm?", A(answer, ...distractors), "a", `${name} has a total value of ${answer}.`, "Add the value of the dot or the grouped notes.", { type: "notation", notation }),
        n5Base(`n5-literacy-medium-${String(index + 25).padStart(3, "0")}`, "medium", "national-5-rhythm-name", name === "Dotted quaver and semiquaver" ? "Which statement best describes the rhythm you see?" : "What is this rhythm called?", A(name, ...["Scotch snap", "Dotted quaver and semiquaver", "Paired quavers", "Four semiquavers"].filter((choice) => choice !== name).slice(0, 3)), "a", `This is ${name.toLowerCase()}.`, "Look at the order of the note values and any augmentation dot.", { type: "notation", notation }),
      ];
    }),
    ...[
      [["dotted-crotchet", "quaver"], "2/4"],
      [["dotted-quaver-semiquaver", "crotchet", "crotchet"], "3/4"],
      [["crotchet", "crotchet", "crotchet", "dotted-quaver-semiquaver"], "4/4"],
      [["dotted-quaver-semiquaver", "crotchet"], "2/4"],
      [["crotchet", "quaver-2semiquavers", "crotchet"], "3/4"],
      [["minim", "quaver", "quaver", "quaver", "quaver"], "4/4"],
    ].map(([rhythmTokens, answer], index) => n5Base(`n5-literacy-medium-${String(index + 29).padStart(3, "0")}`, "medium", "national-5-time-signature", "Which time signature fits this complete bar?", A(answer, answer === "2/4" ? "3/4" : "2/4", answer === "4/4" ? "3/4" : "4/4", "5/4"), "a", `The notes fill a complete ${answer} bar.`, barCurrentTotalHint(rhythmTokens), { type: "notation", notation: { kind: "bar", timeSignature: answer, rhythmTokens, label: `A complete ${answer} bar using National 5 rhythms.` } })),
    ...[
      ["How many crotchets fit into a semibreve?", "quarterNote", "wholeNote", "4", ["2", "8", "3"], "A semibreve lasts four beats, so four crotchets fit into it.", "A crotchet compared with a semibreve."],
    ].map(([question, smaller, larger, answer, distractors, explanation, label], index) => n5Base(`n5-literacy-medium-${String(index + 35).padStart(3, "0")}`, "medium", "note-value-comparison", question, A(answer, ...distractors), "a", explanation, noteValueComparisonHint(smaller), { type: "notation", notation: { kind: "rhythmSum", terms: [smaller, larger], operators: ["→"], label } })),
    ...[
      ["G major", "Which note is sharpened in G major?", "F", ["C", "G", "B"], "G major has one sharp: F sharp."],
      ["F major", "Which note is flattened in F major?", "B", ["F", "E", "A"], "F major has one flat: B flat."],
    ].map(([signature, question, answer, distractors, explanation], index) => n5Base(`n5-literacy-medium-${String(index + 39).padStart(3, "0")}`, "medium", "key-signature-accidental", question, A(answer, ...distractors), "a", explanation, "Read the accidental shown in the key signature and identify its line or space.", { type: "notation", notation: { kind: "keySignature", signature, label: `The key signature of ${signature}.` } })),

    // Hard: chords, sforzando, tone/semitone decisions and calculations.
    ...["C major", "G major", "F major", "A minor"].map((answer, index) => {
      const chordPitches = N5_CHORD_PITCHES[answer];
      return n5Base(`n5-literacy-hard-${String(index + 1).padStart(3, "0")}`, "hard", "chord-identification", "Which chord is outlined?", A(answer, ...["C major", "G major", "F major", "A minor"].filter((choice) => choice !== answer)), "a", `The notes belong to the chord of ${answer}.`, chordNotesHint(chordPitches), { type: "notation", notation: { kind: "n5ChordOutline", pitches: chordPitches, label: `The notes of the ${answer} chord.` } });
    }),
    ...[
      ["What is this dynamic called?", "Sforzando", ["Fortissimo", "Pianissimo", "Forte"]],
      ["What does this dynamic mean?", "A sudden strong accent", ["Very quiet", "Gradually louder", "Very loud throughout"]],
      ["Which description matches this dynamic?", "Suddenly accented and strong", ["Gradually quieter", "Smooth and connected", "Very quiet"]],
    ].map(([question, answer, distractors], index) => n5Base(`n5-literacy-hard-${String(index + 9).padStart(3, "0")}`, "hard", "sforzando", question, A(answer, ...distractors), "a", "Sforzando (sfz) means a sudden strong accent.", "Bang!", { type: "notation", notation: { kind: "dynamic", dynamic: "sfz", label: "The dynamic sfz." } })),
    ...[
      ["C major", ["E4", "F4"], "Semitone"], ["C major", ["C5", "D5"], "Tone"],
      ["G major", ["E5", "F5"], "Tone"], ["G major", ["F5", "G5"], "Semitone"],
      ["G major", ["B4", "C5"], "Semitone"], ["F major", ["A4", "B4"], "Semitone"],
      ["F major", ["B4", "C5"], "Tone"], ["F major", ["G4", "A4"], "Tone"],
      ["A minor", ["E4", "F4"], "Semitone"], ["A minor", ["G4", "A4"], "Tone"],
      ["A minor", ["B4", "C5"], "Semitone"], ["A minor", ["C5", "D5"], "Tone"],
    ].map(([keySignature, pitches, answer], index) => n5Base(`n5-literacy-hard-${String(index + 12).padStart(3, "0")}`, "hard", "tone-or-semitone", "What is the distance between these two notes?", A(answer, answer === "Tone" ? "Semitone" : "Tone", "Octave", "Unison"), "a", `In ${keySignature}, these notes are a ${answer.toLowerCase()} apart.`, "Apply the key signature before judging the distance.", { type: "notation", notation: { kind: "interval", pitches, keySignature, noteXOffset: -45, keySignatureXOffset: -15, toneSemitoneZoom: true, label: `Two adjacent notes in the key signature of ${keySignature}.` } })),
    ...[
      [["dottedQuarterNote", "dottedEighthNote"], ["+"], "2.25 beats"],
      [["dottedQuaverSemiquaver", "dottedQuarterNote"], ["+"], "2.5 beats"],
      [["scotchSnap", "dottedEighthNote"], ["+"], "1.75 beats"],
      [["dottedQuarterNote", "sixteenthNote", "dottedEighthNote"], ["+", "+"], "2.5 beats"],
      [["halfNote", "dottedEighthNote", "sixteenthNote"], ["+", "+"], "3 beats"],
      [["dottedQuaverSemiquaver", "dottedQuaverSemiquaver", "dottedQuarterNote"], ["+", "+"], "3.5 beats"],
      [["wholeNote", "dottedQuarterNote", "dottedEighthNote"], ["−", "+"], "3.25 beats"],
      [["dottedHalfNote", "dottedEighthNote", "sixteenthNote"], ["−", "+"], "2.5 beats"],
    ].map(([terms, operators, answer], index) => n5Base(`n5-literacy-hard-${String(index + 24).padStart(3, "0")}`, "hard", "national-5-rhythm-sum", "What is the total number of beats?", A(answer, ...["1.75 beats", "2.25 beats", "2.75 beats", "3 beats", "3.5 beats"].filter((choice) => choice !== answer).slice(0, 3)), "a", `Working from left to right gives ${answer}.`, rhythmCalculationHint(terms), { type: "notation", notation: { kind: "rhythmSum", terms, operators, label: "A National 5 rhythm calculation." } })),
    ...[
      [[2, 4], ["dottedQuarterNote", "blank"], "Quaver"],
      [[3, 4], ["dottedQuarterNote", "quarterNote", "blank"], "Quaver"],
      [[4, 4], ["dottedQuarterNote", "halfNote", "blank"], "Quaver"],
      [[2, 4], ["dottedEighthNote", "sixteenthNote", "blank"], "Crotchet"],
      [[3, 4], ["dottedQuaverSemiquaver", "quarterNote", "blank"], "Crotchet"],
      [[4, 4], ["scotchSnap", "halfNote", "blank"], "Crotchet"],
    ].map(([time, glyphs, answer], index) => n5Base(`n5-literacy-hard-${String(index + 32).padStart(3, "0")}`, "hard", "national-5-bar-completion", "Which note value completes this bar?", A(answer, answer === "Quaver" ? "Crotchet" : "Quaver", "Semiquaver", "Dotted crotchet"), "a", `A ${answer.toLowerCase()} completes this ${time[0]}/${time[1]} bar.`, barCurrentTotalHint(glyphs), { type: "notation", notation: { kind: "bar", time, glyphs, label: `A ${time[0]}/${time[1]} bar using a National 5 dotted rhythm with one note missing.` } })),
    ...[
      ["How many semiquavers fit into a dotted quaver?", "sixteenthNote", "dottedEighthNote", "3", ["2", "4", "6"], "A dotted quaver lasts three quarters of a beat, so three semiquavers fit into it.", "A semiquaver compared with a dotted quaver."],
      ["How many semiquavers fit into a dotted crotchet?", "sixteenthNote", "dottedQuarterNote", "6", ["3", "4", "8"], "A dotted crotchet lasts one and a half beats, so six semiquavers fit into it.", "A semiquaver compared with a dotted crotchet."],
      ["How many quavers fit into a dotted crotchet?", "eighthNote", "dottedQuarterNote", "3", ["2", "4", "6"], "A dotted crotchet lasts one and a half beats, so three quavers fit into it.", "A quaver compared with a dotted crotchet."],
      ["How many dotted quavers fit into a dotted crotchet?", "dottedEighthNote", "dottedQuarterNote", "2", ["3", "4", "6"], "A dotted crotchet is worth twice as much as a dotted quaver, so two dotted quavers fit into it.", "A dotted quaver compared with a dotted crotchet."],
    ].map(([question, smaller, larger, answer, distractors, explanation, label], index) => n5Base(`n5-literacy-hard-${String(index + 38).padStart(3, "0")}`, "hard", "note-value-comparison", question, A(answer, ...distractors), "a", explanation, noteValueComparisonHint(smaller), { type: "notation", notation: { kind: "rhythmSum", terms: [smaller, larger], operators: ["→"], label } })),
  ];

  const higherLiteracy = [
    // Easy: Higher bass-clef range, diatonic intervals, articulation
    // definitions and the four National 5 key signatures.
    ...[
      ["E2", "E"], ["F2", "F"], ["G2", "G"], ["A2", "A"], ["B2", "B"],
      ["C3", "C"], ["D3", "D"], ["E3", "E"], ["F3", "F"], ["G3", "G"],
      ["A3", "A"], ["B3", "B"], ["C4", "C"],
    ].map(([pitch, answer], index) => {
      const distractors = ["C", "D", "E", "F", "G", "A", "B"].filter((choice) => choice !== answer);
      return hBase(`h-literacy-easy-${String(index + 1).padStart(3, "0")}`, "easy", "bass-clef-note-identification", "What note is this?", A(answer, ...distractors.slice(index % 4, index % 4 + 3).concat(distractors).slice(0, 3)), "a", `This bass-clef note is ${answer}.`, noteIdentificationHint(pitch, "bass"), { type: "notation", notation: { kind: "note", clef: "bass", pitch, label: `The note ${answer} in the bass clef.` } });
    }),
    ...[
      [["E4", "F4"], "2nd"], [["E4", "G4"], "3rd"], [["E4", "A4"], "4th"],
      [["E4", "B4"], "5th"], [["D4", "B4"], "6th"], [["D4", "C5"], "7th"],
      [["C4", "C5"], "Octave"],
    ].map(([pitches, answer], index) => hBase(`h-literacy-easy-${String(index + 14).padStart(3, "0")}`, "easy", "diatonic-interval-identification", "What interval is this?", A(answer, ...["2nd", "3rd", "4th", "5th", "6th", "7th", "Octave"].filter((choice) => choice !== answer).slice(index % 3, index % 3 + 3).concat(["2nd", "3rd", "4th", "5th", "6th", "7th", "Octave"]).filter((choice, choiceIndex, choices) => choice !== answer && choices.indexOf(choice) === choiceIndex).slice(0, 3)), "a", `Counting both written notes gives ${answer === "Octave" ? "an octave" : `a ${answer}`}.`, answer === "Octave" ? "Both notes are the same letter spaced apart." : "Count the first note as one, then count each line and space up to the second note.", { type: "notation", notation: { kind: "interval", pitches, matchStepLeapLayout: true, label: `Two treble-clef notes forming ${answer === "Octave" ? "an octave" : `a ${answer}`}.` } })),
    ...[
      ["accent", "What does an accent tell a performer to do?", "Play the note with extra emphasis", ["Play the note short and detached", "Play the notes smoothly", "Play the phrase more quietly"], "An accent gives a note extra emphasis."],
      ["staccato", "What does staccato tell a performer to do?", "Play short and detached", ["Play smoothly and connected", "Play with extra emphasis", "Play gradually louder"], "Staccato notes are played short and detached."],
      ["slur", "What does a slur tell a performer to do?", "Play the notes smoothly and connected", ["Play every note with an accent", "Play the notes short and detached", "Repeat the complete phrase"], "A slur tells the performer to play the notes smoothly and connected."],
      ["phrase", "What does a phrase mark show?", "Where a complete musical phrase is shaped", ["Where every note is detached", "Where the music must repeat", "Where one note is strongly accented"], "A phrase mark shows the span of a complete musical phrase."],
    ].map(([marking, question, answer, distractors, explanation], index) => hBase(`h-literacy-easy-${String(index + 21).padStart(3, "0")}`, "easy", "articulation-definition", question, A(answer, ...distractors), "a", explanation, articulationHint(marking), { marking })),
    ...[
      ["A minor", "What is this minor key signature?", ["A minor", "E minor", "C minor", "D minor"]],
    ].map(([signature, question, answers], index) => hBase(`h-literacy-easy-${String(index + 25).padStart(3, "0")}`, "easy", "key-signature-identification", question, A(...answers), "a", `${signature} has ${signature === "G major" ? "one sharp" : signature === "F major" ? "one flat" : "no sharps or flats"} in its key signature.`, national5KeySignatureHint(signature), { type: "notation", notation: { kind: "keySignature", signature, label: `The key signature of ${signature}.` } })),

    // Medium: visual articulation, D.C., rest recognition and arithmetic,
    // plus simple and 6/8 time-signature identification.
    ...[
      ["accent", "Accent", ["Accent", "Staccato", "Slur", "Phrase mark"]],
      ["staccato", "Staccato", ["Staccato", "Accent", "Slur", "Phrase mark"]],
      ["slur", "Slur", ["Slur", "Phrase mark", "Accent", "Staccato"]],
      ["phrase", "Phrase mark", ["Phrase mark", "Slur", "Staccato", "Accent"]],
    ].map(([marking, answer, answers], index) => hBase(`h-literacy-medium-${String(index + 1).padStart(3, "0")}`, "medium", "articulation-identification", "What is this articulation marking called?", A(...answers), "a", `This is ${answer === "Accent" ? "an accent" : answer === "Phrase mark" ? "a phrase mark" : `a ${answer.toLowerCase()}`}.`, articulationHint(marking), { type: "notation", notation: { kind: "articulation", marking, label: `${answer} shown on musical notation.` } })),
    hBase("h-literacy-medium-005", "medium", "da-capo-definition", "What does D.C. instruct a performer to do?", A("Return to the beginning and play again", "Repeat only the previous bar", "Jump to the coda", "Finish immediately"), "a", "Da capo, abbreviated D.C., means return to the beginning and play again.", "From the top."),
    ...[
      ["quaver-rest", "Quaver rest", "0.5 beat"],
      ["crotchet-rest", "Crotchet rest", "1 beat"],
      ["dotted-crotchet-rest", "Dotted crotchet rest", "1.5 beats"],
      ["minim-rest", "Minim rest", "2 beats"],
      ["semibreve-rest", "Semibreve rest", "4 beats"],
    ].flatMap(([rest, name, value], index) => [
      hBase(`h-literacy-medium-${String(index + 6).padStart(3, "0")}`, "medium", "rest-name", "What is this rest called?", A(name, ...["Quaver rest", "Crotchet rest", "Dotted crotchet rest", "Minim rest", "Semibreve rest"].filter((choice) => choice !== name).slice(0, 3)), "a", `This symbol is a ${name.toLowerCase()}.`, `This rest is worth ${value}.`, { type: "notation", notation: { kind: "rest", rest, label: name } }),
      hBase(`h-literacy-medium-${String(index + 11).padStart(3, "0")}`, "medium", "rest-value", "What is the value of this rest?", A(value, ...["0.5 beat", "1 beat", "1.5 beats", "2 beats", "4 beats"].filter((choice) => choice !== value).slice(0, 3)), "a", `A ${name.toLowerCase()} is worth ${value}.`, `This is a ${name.toLowerCase()}.`, { type: "notation", notation: { kind: "rest", rest, label: name } }),
    ]),
    ...[
      ["quarterNote", "quaver-rest", "1.5 beats"],
      ["dottedQuarterNote", "quaver-rest", "2 beats"],
      ["halfNote", "crotchet-rest", "3 beats"],
      ["quarterNote", "minim-rest", "3 beats"],
      ["eighthNote", "dotted-crotchet-rest", "2 beats"],
      ["dottedHalfNote", "dotted-crotchet-rest", "4.5 beats"],
      ["halfNote", "semibreve-rest", "6 beats"],
      ["dottedQuarterNote", "crotchet-rest", "2.5 beats"],
    ].map(([note, rest, answer], index) => hBase(`h-literacy-medium-${String(index + 16).padStart(3, "0")}`, "medium", "note-rest-sum", "What is the total value of these two symbols?", A(answer, ...["1.5 beats", "2 beats", "2.5 beats", "3 beats", "4 beats", "4.5 beats", "6 beats"].filter((choice) => choice !== answer).slice(index % 3, index % 3 + 3).concat(["1.5 beats", "2 beats", "2.5 beats", "3 beats", "4 beats", "4.5 beats", "6 beats"]).filter((choice, choiceIndex, choices) => choice !== answer && choices.indexOf(choice) === choiceIndex).slice(0, 3)), "a", `The note and rest have a combined value of ${answer}.`, rhythmCalculationHint([note]), { type: "notation", notation: { kind: "restSum", note, rest, label: "One note plus one rest." } })),
    ...[
      [["dotted-quaver-semiquaver", "quaver-2semiquavers"], "2/4"],
      [["semiquaver-group-4", "2semiquavers-quaver"], "2/4"],
      [["dotted-crotchet", "quaver", "dotted-quaver-semiquaver"], "3/4"],
      [["quaver-2semiquavers", "crotchet", "2semiquavers-quaver"], "3/4"],
      [["dotted-crotchet", "quaver", "semiquaver-group-4", "dotted-quaver-semiquaver"], "4/4"],
      [["semiquaver-group-4", "2semiquavers-quaver", "dotted-crotchet", "quaver"], "4/4"],
      [["quaver-group-3", "crotchet-quaver"], "6/8"],
      [["quaver-crotchet", "quaver-group-3"], "6/8"],
    ].map(([rhythmTokens, answer], index) => hBase(`h-literacy-medium-${String(index + 24).padStart(3, "0")}`, "medium", "higher-time-signature", "Which time signature fits this complete bar?", A(answer, ...["2/4", "3/4", "4/4", "6/8"].filter((choice) => choice !== answer)), "a", `The displayed rhythms form a complete ${answer} bar.`, barCurrentTotalHint(rhythmTokens), { type: "notation", notation: { kind: "bar", timeSignature: answer, rhythmTokens, label: `A complete ${answer} bar using dotted and subdivided rhythms.` } })),

    // Hard: missing rests, triplet equivalence and scale-degree notes.
    // These bars use the same valid before/missing/after templates as rests.html.
    // In compound time, every array section is built around a dotted-crotchet beat,
    // so quaver groups and missing rests never cross a compound-beat boundary.
    ...[
      [[2, 4], [], "crotchet-rest", ["crotchet"], "Crotchet rest"],
      [[2, 4], ["quaver"], "quaver-rest", ["crotchet"], "Quaver rest"],
      [[3, 4], ["crotchet"], "crotchet-rest", ["crotchet"], "Crotchet rest"],
      [[3, 4], ["quaver-group-2"], "crotchet-rest", ["crotchet"], "Crotchet rest"],
      [[4, 4], ["minim"], "minim-rest", [], "Minim rest"],
      [[4, 4], ["crotchet", "crotchet"], "minim-rest", [], "Minim rest"],
      [[6, 8], [], "dotted-crotchet-rest", ["dotted-crotchet"], "Dotted crotchet rest"],
      [[6, 8], ["crotchet", "quaver"], "dotted-crotchet-rest", [], "Dotted crotchet rest"],
      [[9, 8], ["dotted-crotchet"], "dotted-crotchet-rest", ["dotted-crotchet"], "Dotted crotchet rest"],
      [[9, 8], ["dotted-crotchet", "quaver"], "crotchet-rest", ["dotted-crotchet"], "Crotchet rest"],
      [[12, 8], ["dotted-crotchet", "quaver-group-3"], "dotted-crotchet-rest", ["crotchet", "quaver"], "Dotted crotchet rest"],
      [[12, 8], ["dotted-crotchet", "quaver-group-3", "quaver"], "crotchet-rest", ["dotted-crotchet"], "Crotchet rest"],
    ].map(([time, before, missingRest, after, answer], index) => hBase(`h-literacy-hard-${String(index + 1).padStart(3, "0")}`, "hard", "missing-rest", "Which rest completes this bar?", A(answer, ...["Quaver rest", "Crotchet rest", "Dotted crotchet rest", "Minim rest", "Semibreve rest"].filter((choice) => choice !== answer).slice(index % 2, index % 2 + 3).concat(["Quaver rest", "Crotchet rest", "Dotted crotchet rest", "Minim rest", "Semibreve rest"]).filter((choice, choiceIndex, choices) => choice !== answer && choices.indexOf(choice) === choiceIndex).slice(0, 3)), "a", `A ${answer.toLowerCase()} supplies the missing value and completes the ${time[0]}/${time[1]} bar.`, barCurrentTotalHint(before, after), { type: "notation", notation: { kind: "restBar", time, before, missingRest, after, source: "rests.html", label: `A ${time[0]}/${time[1]} bar with one missing rest.` } })),
    hBase("h-literacy-hard-013", "hard", "triplet-equivalence", "How many quaver-triplet groups fit into a semibreve?", A("4", "3", "6", "8"), "a", "One quaver-triplet group lasts one beat, so four groups fit into a four-beat semibreve.", "A quaver-triplet group is worth 1 beat.", { type: "notation", notation: { kind: "triplet", triplet: "quaver", comparison: "wholeNote", label: "A quaver-triplet group compared with a semibreve." } }),
    hBase("h-literacy-hard-014", "hard", "triplet-equivalence", "Which rhythm has the same total value as a crotchet-triplet group?", A("Minim", "Crotchet", "Dotted crotchet", "Semibreve"), "a", "A complete crotchet-triplet group lasts two beats, the same as a minim.", "A crotchet-triplet group is worth 2 beats.", { type: "notation", notation: { kind: "triplet", triplet: "crotchet", label: "A group of three crotchet triplets." } }),
    hBase("h-literacy-hard-015", "hard", "triplet-equivalence", "Which rhythm has the same total value as a quaver-triplet group?", A("Crotchet", "Quaver", "Minim", "Dotted crotchet"), "a", "A complete quaver-triplet group lasts one beat, the same as a crotchet.", "Three quaver triplets fit evenly into one crotchet beat.", { type: "notation", notation: { kind: "triplet", triplet: "quaver", label: "A group of three quaver triplets." } }),
    ...[
      ["C major", "tonic", "C"], ["C major", "subdominant", "F"], ["C major", "dominant", "G"],
      ["G major", "tonic", "G"], ["G major", "subdominant", "C"], ["G major", "dominant", "D"],
      ["F major", "tonic", "F"], ["F major", "subdominant", "B flat"], ["F major", "dominant", "C"],
      ["A minor", "tonic", "A"], ["A minor", "subdominant", "D"], ["A minor", "dominant", "E"],
    ].map(([key, degree, answer], index) => hBase(`h-literacy-hard-${String(index + 16).padStart(3, "0")}`, "hard", "tonic-subdominant-dominant", `The key is ${key}. What is the ${degree} note?`, A(answer, ...["A", "B flat", "B", "C", "D", "E", "F", "G"].filter((choice) => choice !== answer).slice(index % 4, index % 4 + 3).concat(["A", "B flat", "B", "C", "D", "E", "F", "G"]).filter((choice, choiceIndex, choices) => choice !== answer && choices.indexOf(choice) === choiceIndex).slice(0, 3)), "a", `In ${key}, the ${degree} note is ${answer}.`, `The ${degree} is the ${degree === "tonic" ? "1st" : degree === "subdominant" ? "4th" : "5th"} note in the scale of ${key}.`)),
  ];

  const AH_KEY_SIGNATURES = [
    ["D major", "What is this major key signature?", ["D major", "B flat major", "G major", "E minor"]],
    ["B flat major", "What is this major key signature?", ["B flat major", "D major", "F major", "D minor"]],
    ["E minor", "What is this minor key signature?", ["E minor", "G major", "D minor", "A minor"]],
    ["D minor", "What is this minor key signature?", ["D minor", "B flat major", "E minor", "A minor"]],
  ];
  const AH_REVIEW_KEY_SIGNATURES = [
    ["C major", "What is this major key signature?", ["C major", "F major", "G major", "A minor"]],
    ["F major", "What is this major key signature?", ["F major", "G major", "C major", "D minor"]],
    ["G major", "What is this major key signature?", ["G major", "F major", "D major", "E minor"]],
    ["A minor", "What is this minor key signature?", ["A minor", "E minor", "D minor", "C major"]],
  ];
  const AH_CHORD_KEYS = [
    { name: "C major", signature: "C major", major: true, chords: { I: [["C",0],["E",0],["G",0]], II: [["D",0],["F",0],["A",0]], IV: [["F",0],["A",0],["C",0]], V: [["G",0],["B",0],["D",0]], VI: [["A",0],["C",0],["E",0]] } },
    { name: "G major", signature: "G major", major: true, chords: { I: [["G",0],["B",0],["D",0]], II: [["A",0],["C",0],["E",0]], IV: [["C",0],["E",0],["G",0]], V: [["D",0],["F",1],["A",0]], VI: [["E",0],["G",0],["B",0]] } },
    { name: "F major", signature: "F major", major: true, chords: { I: [["F",0],["A",0],["C",0]], II: [["G",0],["B",-1],["D",0]], IV: [["B",-1],["D",0],["F",0]], V: [["C",0],["E",0],["G",0]], VI: [["D",0],["F",0],["A",0]] } },
    { name: "D major", signature: "D major", major: true, chords: { I: [["D",0],["F",1],["A",0]], II: [["E",0],["G",0],["B",0]], IV: [["G",0],["B",0],["D",0]], V: [["A",0],["C",1],["E",0]], VI: [["B",0],["D",0],["F",1]] } },
    { name: "B flat major", signature: "B flat major", major: true, chords: { I: [["B",-1],["D",0],["F",0]], II: [["C",0],["E",-1],["G",0]], IV: [["E",-1],["G",0],["B",-1]], V: [["F",0],["A",0],["C",0]], VI: [["G",0],["B",-1],["D",0]] } },
    { name: "A minor", signature: "A minor", major: false, chords: { I: [["A",0],["C",0],["E",0]], IV: [["D",0],["F",0],["A",0]], V: [["E",0],["G",1],["B",0]], VI: [["F",0],["A",0],["C",0]] } },
    { name: "E minor", signature: "E minor", major: false, chords: { I: [["E",0],["G",0],["B",0]], IV: [["A",0],["C",0],["E",0]], V: [["B",0],["D",1],["F",1]], VI: [["C",0],["E",0],["G",0]] } },
    { name: "D minor", signature: "D minor", major: false, chords: { I: [["D",0],["F",0],["A",0]], IV: [["G",0],["B",-1],["D",0]], V: [["A",0],["C",1],["E",0]], VI: [["B",-1],["D",0],["F",0]] } },
  ];
  const accidentalName = (value) => value === 1 ? "sharp" : value === -1 ? "flat" : null;
  const accidentalText = (letter, value) => `${letter}${value === 1 ? " sharp" : value === -1 ? " flat" : ""}`;
  const chordName = (tones) => {
    const pitchClasses = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const root = pitchClasses[tones[0][0]] + tones[0][1];
    const third = pitchClasses[tones[1][0]] + tones[1][1];
    const quality = (third - root + 12) % 12 === 4 ? "major" : "minor";
    return `${accidentalText(tones[0][0], tones[0][1])} ${quality}`;
  };
  const AH_SIGNATURE_ACCIDENTALS = {
    "G major": { F:1 }, "E minor": { F:1 }, "D major": { F:1, C:1 },
    "F major": { B:-1 }, "D minor": { B:-1 }, "B flat major": { B:-1, E:-1 },
  };
  const ahChordVoicing = (key, symbol, inversion) => {
    const tones = key.chords[symbol];
    const bassTone = tones[inversion];
    const bassOctave = bassTone[0] === "B" ? 2 : 3;
    const trebleTones = tones.filter((_, index) => index !== inversion).concat([bassTone]);
    const writtenAccidental = ([letter, accidental]) => accidental === (AH_SIGNATURE_ACCIDENTALS[key.signature]?.[letter] || 0) ? null : accidentalName(accidental);
    return {
      kind: "ahChord", keySignature: key.signature,
      bassPitch: `${bassTone[0]}${bassOctave}`, bassAccidental: writtenAccidental(bassTone),
      treblePitches: trebleTones.map(([letter]) => `${letter}${["C","D"].includes(letter) ? 5 : 4}`),
      trebleAccidentals: trebleTones.map(writtenAccidental),
      label: `A chord shown on a grand stave in ${key.name}.`,
    };
  };
  const ahChordClefHint = (tones, inversion, includeBass) => {
    const bassTone = tones[inversion];
    const trebleTones = tones.filter((_, index) => index !== inversion).concat([bassTone]);
    const trebleHint = `The notes in the treble clef are ${chordNoteList(trebleTones)}.`;
    return includeBass ? `${trebleHint} The note in the bass clef is ${chordNoteName(bassTone)}.` : trebleHint;
  };
  const ahChordPositionText = (symbol, inversion) => `Chord ${symbol}, ${inversion === 1 ? "1st inversion" : inversion === 2 ? "2nd inversion" : "root position"}`;
  const ahChordDistractors = (key, correctSymbol, correctInversion, questionIndex) => {
    const otherSymbols = Object.keys(key.chords).filter((symbol) => symbol !== correctSymbol);
    const rotation = otherSymbols.length ? questionIndex % otherSymbols.length : 0;
    const variedSymbols = otherSymbols.slice(rotation).concat(otherSymbols.slice(0, rotation)).slice(0, 3);
    return variedSymbols.map((symbol, index) => {
      const validInversions = symbol === "II" ? [0, 1] : [0, 1, 2];
      const inversion = validInversions[(correctInversion + index + 1) % validInversions.length];
      return ahChordPositionText(symbol, inversion);
    });
  };
  const AH_CHORD_POSITION_CASES = AH_CHORD_KEYS.flatMap((key) =>
    (key.major ? ["I","II","IV","V","VI"] : ["I","IV","V","VI"]).flatMap((symbol) =>
      (symbol === "II" ? [0,1] : [0,1,2]).map((inversion) => ({ key, symbol, inversion }))));

  const advancedHigherLiteracy = [
    // Easy: AH note ranges, 8va/8vb, key signatures and ties.
    ...[
      ["bass","C2"],["bass","D2"],["bass","D4"],["bass","E4"],
      ["treble","C4"],["treble","A5"],["treble","B5"],["treble","C6"],
      ["bass","A3","flat"],["treble","F5","sharp"],
    ].map(([clef, pitch, accidental], index) => {
      const letter = pitch[0];
      const answer = accidental ? `${letter} ${accidental}` : letter;
      const alternatives = ["C","D","E","F","G","A","B"].filter((item) => item !== letter).slice(index % 4).concat(["C","D","E","F","G","A","B"]).filter((item, itemIndex, all) => item !== letter && all.indexOf(item) === itemIndex).slice(0,3);
      return ahBase(`ah-literacy-easy-${String(index + 1).padStart(3,"0")}`, "easy", "note-identification", "What note is this?", A(answer, ...alternatives.map((item) => accidental ? `${item} ${accidental}` : item)), "a", `This is ${answer}.`, noteIdentificationHint(pitch, clef, accidental), { type:"notation", notation:{ kind:"note", clef, pitch, accidental, accidentalXOffset:accidental ? -7 : 0, label:`${answer} in the ${clef} clef.` } });
    }),
    ...[
      ["What does 8va mean?", "Play the notes one octave higher", ["Play the notes one octave lower","Play the notes eight times","Play the notes twice as fast"], "8va"],
      ["What does 8vb mean?", "Play the notes one octave lower", ["Play the notes one octave higher","Play the notes eight times","Play the notes twice as quietly"], "8vb"],
      ["Which instruction means play one octave higher?", "8va", ["8vb","D.S.","Fine"], null],
      ["Which instruction means play one octave lower?", "8vb", ["8va","D.C.","Fine"], null],
    ].map(([question, answer, distractors, marking], index) => ahBase(`ah-literacy-easy-${String(index + 21).padStart(3,"0")}`, "easy", "octave-sign", question, A(answer,...distractors), "a", answer === "8va" || question.includes("higher") ? "8va tells the performer to play the written notes one octave higher." : "8vb tells the performer to play the written notes one octave lower.", (marking || answer) === "8va" ? "8va - 8 refers to octave. Think of the va part like very angelic." : "8vb - 8 refers to octave. Think of the vb part like very bassy.", marking ? { type:"notation", notation:{ kind:"octaveSign", marking, label:`The ${marking} octave sign.` } } : {})),
    ...AH_KEY_SIGNATURES.map(([signature, question, answers], index) => ahBase(`ah-literacy-easy-${String(25 + index).padStart(3,"0")}`, "easy", "key-signature-identification", question, A(...answers), "a", `This is the key signature of ${signature}.`, advancedHigherKeySignatureHint(signature, "Count the sharps or flats, then distinguish carefully between the related major and minor keys."), { type:"notation", notation:{ kind:"keySignature", signature, label:`The key signature of ${signature}.` } })),
    ...AH_REVIEW_KEY_SIGNATURES.map(([signature, question, answers], index) => ahBase(`ah-literacy-easy-${String(41 + index).padStart(3,"0")}`, "easy", "key-signature-identification", question, A(...answers), "a", `This is the key signature of ${signature}.`, advancedHigherKeySignatureHint(signature, "Count the sharps or flats, then decide whether the question asks for a major or minor key."), { type:"notation", notation:{ kind:"keySignature", signature, label:`The key signature of ${signature}.` } })),
    ...[["C4","quarterNote"],["E4","halfNote"],["G4","eighthNote"],["B4","quarterNote"]].map(([pitch, rhythm], index) => ahBase(`ah-literacy-easy-${String(45 + index).padStart(3,"0")}`, "easy", "tie-identification", "What is the highlighted symbol called?", A("Tie","Slur","Phrase mark","Legato"), "a", "A tie joins two notes of exactly the same pitch so their durations are added together.", "Many people wear these.", { type:"notation", notation:{ kind:"tieCallout", pitch, rhythm, label:"Two notes of the same pitch joined by a highlighted tie." } })),

    // Medium: 5/4, missing rests, enharmonics, Fine and the segno sign.
    ...[
      ["5/4",["dotted-quaver-semiquaver","quaver-2semiquavers","2semiquavers-quaver","dotted-crotchet","quaver"]],
      ["5/4",["semiquaver-group-4","dotted-crotchet","quaver","dotted-quaver-semiquaver","quaver-2semiquavers"]],
      ["5/4",["dotted-crotchet","quaver","dotted-quaver-semiquaver","semiquaver-group-4","2semiquavers-quaver"]],
      ["5/4",["quaver-2semiquavers","dotted-quaver-semiquaver","semiquaver-group-4","dotted-crotchet","quaver"]],
      ["5/4",["2semiquavers-quaver","dotted-crotchet","quaver","quaver-2semiquavers","dotted-quaver-semiquaver"]],
      ["5/4",["dotted-quaver-semiquaver","semiquaver-group-4","quaver-2semiquavers","2semiquavers-quaver","semiquaver-group-4"]],
      ["2/4",["dotted-quaver-semiquaver","quaver-2semiquavers"]],
      ["3/4",["quaver-2semiquavers","dotted-crotchet","quaver"]],
      ["4/4",["dotted-quaver-semiquaver","quaver-2semiquavers","2semiquavers-quaver","semiquaver-group-4"]],
      ["6/8",["dotted-quaver-semiquaver-quaver","quaver-2semiquavers-quaver"]],
    ].map(([answer, rhythmTokens], index) => ahBase(`ah-literacy-medium-${String(index + 1).padStart(3,"0")}`, "medium", "time-signature", "Which time signature fits this complete bar?", A(answer,...["2/4","3/4","4/4","5/4","6/8"].filter((item)=>item!==answer).slice(0,3)), "a", `The displayed rhythms make a complete ${answer} bar.`, barCurrentTotalHint(rhythmTokens), { ...(answer==="5/4"?{gameLimitGroup:"five-four",gameLimit:1}:{}), type:"notation", notation:{ kind:"bar", timeSignature:answer, rhythmTokens, groupAfterBeats:answer==="5/4"?3:null, label:`A complete ${answer} bar.` } })),
    ...[
      [[],"dotted-minim-rest",["minim"],"Dotted minim rest"], [["dotted-minim"],"minim-rest",[],"Minim rest"], [["minim"],"crotchet-rest",["minim"],"Crotchet rest"],
      [["crotchet"],"minim-rest",["minim"],"Minim rest"], [["dotted-crotchet","quaver"],"crotchet-rest",["minim"],"Crotchet rest"],
      [["semiquaver-group-4"],"minim-rest",["minim"],"Minim rest"], [["dotted-minim","crotchet"],"crotchet-rest",[],"Crotchet rest"], [["minim","crotchet"],"minim-rest",[],"Minim rest"],
    ].map(([before, missingRest, after, answer], index) => ahBase(`ah-literacy-medium-${String(index + 11).padStart(3,"0")}`, "medium", "five-four-missing-rest", "Which rest completes this 5/4 bar?", A(answer,...["Crotchet rest","Minim rest","Dotted minim rest","Semibreve rest"].filter((item)=>item!==answer)), "a", `A ${answer.toLowerCase()} supplies the missing beats in this 5/4 bar.`, barCurrentTotalHint(before, after), { gameLimitGroup:"five-four", gameLimit:1, type:"notation", notation:{ kind:"restBar", time:[5,4], before, missingRest, after, groupAfterBeats:3, source:"rests.html", label:"A 5/4 bar grouped as three crotchet beats followed by two, with one missing rest." } })),
    ...[
      ["C4","sharp","D flat"],["D4","flat","C sharp"],["D4","sharp","E flat"],["E4","flat","D sharp"],["F4","sharp","G flat"],
      ["G4","flat","F sharp"],["G4","sharp","A flat"],["A4","flat","G sharp"],["A4","sharp","B flat"],["B4","flat","A sharp"],
    ].map(([pitch, accidental, answer], index) => ahBase(`ah-literacy-medium-${String(index + 19).padStart(3,"0")}`, "medium", "enharmonic-equivalent", "Which note is the enharmonic equivalent of the note shown?", A(answer,...["C sharp","D flat","D sharp","E flat","F sharp","G flat","G sharp","A flat","A sharp","B flat"].filter((item)=>item!==answer).slice(index%4).concat(["C sharp","D flat","D sharp","E flat","F sharp","G flat","G sharp","A flat","A sharp","B flat"]).filter((item,itemIndex,all)=>item!==answer&&all.indexOf(item)===itemIndex).slice(0,3)), "a", `${answer} sounds at the same pitch but is written with a different letter name.`, "Move one letter name and change from a sharp to a flat, or from a flat to a sharp.", { type:"notation", notation:{ kind:"note", pitch, accidental, accidentalXOffset:-7, staveInset:20, notationZoom:1.15, clefXOffset:10, noteXOffset:-15, label:`${pitch[0]} ${accidental}.` } })),
    ahBase("ah-literacy-medium-029", "medium", "fine-definition", "What does Fine instruct a performer to do?", A("Finish the music","Return to the sign","Return to the beginning","Repeat the previous bar"), "a", "Fine marks the place where the performance should finish.", "Fine is the Italian word for end."),
    ahBase("ah-literacy-medium-033", "medium", "segno", "What is this symbol called?", A("Segno","Da capo","Fine","Coda"), "a", "This is the segno sign. D.S. tells the performer to return to this sign.", "D.S.", { tipEmphasis:"S", type:"notation", notation:{ kind:"navigationSymbol", symbol:"segno", label:"The segno sign." } }),

    // Hard: chord inversions, tritones, bass notes and raised sevenths.
    ...AH_CHORD_POSITION_CASES.map(({key,symbol,inversion}, index) => {
      const position=inversion===1?"1st inversion":inversion===2?"2nd inversion":"root position", answer=ahChordPositionText(symbol,inversion);
      const distractors=ahChordDistractors(key,symbol,inversion,index);
      return ahBase(`ah-literacy-hard-chord-${String(index + 1).padStart(3,"0")}`, "hard", "chord-and-position", `In ${key.name}, which chord is shown and what is its position?`, A(answer,...distractors), "a", `The notes form chord ${symbol} in ${position}.`, ahChordClefHint(key.chords[symbol], inversion, true), { gameLimitGroup:"chord-and-position", gameLimit:1, type:"notation", notation:ahChordVoicing(key,symbol,inversion) });
    }),
    ...[
      [["F4","B4"],"C major",[null,null]], [["B4","F5"],"C major",[null,null]],
      [["C4","F4"],"C major",[null,"sharp"]], [["G4","C5"],"D major",[null,null]],
      [["E4","B4"],"F major",[null,null]], [["A4","E5"],"B flat major",[null,null]],
      [["D4","G4"],"C major",[null,"sharp"]], [["A4","D5"],"C major",[null,"sharp"]],
    ].map(([pitches,keySignature,accidentals], index) => ahBase(`ah-literacy-hard-${String(index + 17).padStart(3,"0")}`, "hard", "tritone", "Which interval is shown?", A("Tritone","Perfect 4th","Perfect 5th","Minor 6th"), "a", "The two notes are six semitones apart, so the interval is a tritone.", "Three tones.", { gameLimitGroup:"interval-identification", gameLimit:1, type:"notation", notation:{ kind:"ahInterval", source:"intervals.html", pitches, keySignature, accidentals, label:"Two notes forming a tritone using the Advanced Higher intervals layout." } })),
    ...[
      [0,"II",1],[1,"V",2],[2,"I",1],[3,"VI",2],[4,"IV",1],[5,"V",1],[6,"IV",2],[7,"I",2],
      [0,"V",0],[1,"II",0],[2,"VI",1],[3,"I",1],[4,"II",1],[5,"VI",0],[6,"V",2],[7,"IV",1],
    ].map(([keyIndex,symbol,inversion], index) => {
      const key=AH_CHORD_KEYS[keyIndex], tones=key.chords[symbol], tone=tones[inversion], answer=accidentalText(tone[0],tone[1]);
      const distractors=[...new Set(key.chords[symbol].map(([letter, accidental])=>accidentalText(letter,accidental)).concat(["C","D","E","F","G","A","B"]))].filter((item)=>item!==answer).slice(0,3);
      const position=inversion===1?"1st inversion":inversion===2?"2nd inversion":"root position";
      const namedChord=chordName(tones);
      const voicing=ahChordVoicing(key,symbol,inversion);
      return ahBase(`ah-literacy-hard-${String(index + 25).padStart(3,"0")}`, "hard", "bass-note-from-chord", `The key is ${key.name}. Which bass note should be used for ${namedChord}, ${position}?`, A(answer,...distractors), "a", `${answer} is the bass note of ${namedChord}, ${position}.`, ahChordClefHint(tones, inversion, false), { gameLimitGroup:"bass-note-from-chord", gameLimit:1, type:"notation", notation:{ ...voicing, kind:"ahBassPrompt", bassPitch:null, bassAccidental:null, label:`The ${namedChord} chord shown on the treble stave in ${key.name}, with the bass stave left blank.` } });
    }),
    ...[
      ["E minor","D sharp",["D sharp","D","F sharp","C sharp"]], ["D minor","C sharp",["C sharp","C","B flat","D sharp"]], ["A minor","G sharp",["G sharp","G","F sharp","A sharp"]],
      ["E minor","D sharp",["D sharp","C sharp","F sharp","G sharp"]], ["D minor","C sharp",["C sharp","B flat","D sharp","G sharp"]], ["A minor","G sharp",["G sharp","F sharp","C sharp","A sharp"]],
    ].map(([signature,answer,answers], index) => ahBase(`ah-literacy-hard-${String(index + 41).padStart(3,"0")}`, "hard", "raised-seventh", "Which note is this key’s raised 7th, often used in its harmonic minor scale?", A(...answers), "a", `The raised 7th in ${signature} is ${answer}.`, "Find the seventh note of the natural minor scale, then raise it by one semitone.", { fixedStage:15, type:"notation", notation:{ kind:"keySignature", signature, label:`The key signature of ${signature}.` } })),
    ...[
      ["What does D.S. al Fine instruct the performer to do?", "Return to the sign and continue until Fine", ["Return to the beginning and continue to the end","Repeat the previous section once","Continue directly to the coda"]],
      ["After reaching D.S. al Fine, where should the performer return?", "The segno sign", ["The beginning of the piece","The coda sign","The nearest repeat sign"]],
      ["After returning to the sign in D.S. al Fine, where should the performance finish?", "At Fine", ["At the final barline","At the coda","At the next repeat sign"]],
      ["Which sequence correctly follows D.S. al Fine?", "Return to the sign, then finish at Fine", ["Return to the beginning, then play to the end","Go to the coda, then repeat","Repeat the previous bar, then finish"]],
      ["How long should the performer continue after returning to the sign in D.S. al Fine?", "Until reaching Fine", ["Until the final barline","For one bar only","Until reaching the coda"]],
      ["Which instruction means return to the sign and then finish at the instructed place?", "D.S. al Fine", ["D.C. al Coda","D.S. al Coda","Da capo"]],
      ["In D.S. al Fine, what does D.S. tell the performer to do?", "Return to the segno sign", ["Return to the beginning","Move to the coda","Repeat the previous bar"]],
      ["What should happen when Fine is reached after following D.S.?", "The performance should finish", ["The music should return to the beginning","The previous section should repeat","The performer should move to the coda"]],
    ].map(([question,answer,distractors],index)=>ahBase(`ah-literacy-hard-${String(index+47).padStart(3,"0")}`,"hard","ds-al-fine",question,A(answer,...distractors),"a",`${answer}.`,index === 5 ? "D.S. means 'from the sign'." : index === 6 ? "D.S. stands for Dal Segno." : index === 7 ? "Fine is the Italian word for end." : "D.S. means return to the sign; Fine marks where the performance ends.",{gameLimitGroup:"ds-al-fine",gameLimit:1})),
  ];

  function prepareQuestion(question, difficulty) {
    const range = DIFFICULTIES[difficulty];
    return {
      ...question,
      difficulty,
      difficultyMin: range.min,
      difficultyMax: range.max,
      prompt: question.question,
      audioSrc: question.audio?.src || "",
      notationData: question.notation || null,
    };
  }

  function groupQuestionsByDifficultyRange(questions) {
    return Object.fromEntries(Object.entries(DIFFICULTIES).map(([difficulty, range]) => [difficulty,
      questions
        .filter((question) => question.difficultyMin === range.min && question.difficultyMax === range.max)
        .map((question) => prepareQuestion(question, difficulty)),
    ]));
  }

  const n3Literacy = groupQuestionsByDifficultyRange(literacy);
  const n4LiteracyPools = groupQuestionsByDifficultyRange(n4Literacy);
  const n5LiteracyPools = groupQuestionsByDifficultyRange(n5Literacy);
  const higherLiteracyPools = groupQuestionsByDifficultyRange(higherLiteracy);
  const advancedHigherLiteracyPools = groupQuestionsByDifficultyRange(advancedHigherLiteracy);
  const musicConceptQuestions = root.MILLIONAIRE_MUSIC_CONCEPT_QUESTION_BANK
    || (typeof module === "object" && module.exports ? require("./millionaire-music-concept-bank.js") : []);
  const conceptPool = (level, difficulty) => {
    const direct = musicConceptQuestions.filter((question) => question.level === level && question.difficulty === difficulty);
    if (difficulty !== "hard") return direct;
    const conceptsWithAuthoredHardQuestions = new Set(direct.map((question) => question.conceptId));
    const temporaryMediumFallbacks = musicConceptQuestions
      .filter((question) => question.level === level && question.difficulty === "medium"
        && !conceptsWithAuthoredHardQuestions.has(question.conceptId))
      .map((question) => ({
        ...question,
        id: `${question.id}-hard-fallback`,
        difficulty: "hard",
        difficultyMin: DIFFICULTIES.hard.min,
        difficultyMax: DIFFICULTIES.hard.max,
        temporaryMediumFallback: true,
      }));
    return direct.concat(temporaryMediumFallbacks);
  };
  const questionPools = {
    N3: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: n3Literacy[difficulty],
      concepts: conceptPool("N3", difficulty),
    }])),
    N4: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: n4LiteracyPools[difficulty],
      concepts: conceptPool("N4", difficulty),
    }])),
    N5: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: n5LiteracyPools[difficulty],
      concepts: conceptPool("N5", difficulty),
    }])),
    H: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: higherLiteracyPools[difficulty],
      concepts: conceptPool("H", difficulty),
    }])),
    AH: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: advancedHigherLiteracyPools[difficulty],
      concepts: conceptPool("AH", difficulty),
    }])),
  };

  const flatQuestionBank = Object.values(questionPools).flatMap((level) =>
    Object.values(level).flatMap((difficulty) => Object.values(difficulty).flat()));

  root.MILLIONAIRE_QUESTION_POOLS = questionPools;
  root.MILLIONAIRE_QUESTION_BANK = flatQuestionBank;
  if (typeof module === "object" && module.exports) {
    module.exports = flatQuestionBank;
    Object.defineProperties(module.exports, {
      pools: { value: questionPools },
      levels: { value: LEVELS },
      difficulties: { value: DIFFICULTIES },
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
