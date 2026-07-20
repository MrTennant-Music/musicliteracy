(function (root) {
  "use strict";

  // MILLIONAIRE QUESTION BANK
  // -------------------------
  // Questions are organised by course level, difficulty and question category.
  // National 3 keeps the existing questions. The other levels deliberately use
  // obvious placeholders, which can be replaced one pool at a time later.

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
  const CATEGORY_NAMES = {
    literacy: "music literacy",
    concepts: "music concepts",
    listening: "audio",
  };

  const A = (a, b, c, d) => [
    { id: "a", text: a }, { id: "b", text: b },
    { id: "c", text: c }, { id: "d", text: d },
  ];

  const audio = (file, generator) => ({
    src: `audio/millionaire/placeholders/${file}.mp3`,
    type: "listening",
    placeholder: true,
    generator,
  });

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
  const RHYTHM_VALUE_NAMES = ["Crotchet", "Minim", "Dotted minim", "Semibreve"];
  const RHYTHM_BEATS = { Crotchet: 1, Minim: 2, "Dotted minim": 3, Semibreve: 4 };
  const RHYTHM_GLYPHS = { Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };
  const rhythmCompletion = (id, shownValues, target, answer) => {
    const shownBeats = shownValues.reduce((total, value) => total + RHYTHM_BEATS[value], 0);
    const answerChoices = [answer, ...RHYTHM_VALUE_NAMES.filter((value) => value !== answer)];
    return base(id, "literacy", "rhythm-completion", "Which note value completes this calculation?", A(...answerChoices), "a", `The shown note value${shownValues.length > 1 ? "s" : ""} total ${shownBeats} beat${shownBeats === 1 ? "" : "s"}. To make ${target} beats, the missing value is ${answer.toLowerCase()}.`, "Add the shown beats, then subtract from the total.", 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: [...shownValues.map((value) => RHYTHM_GLYPHS[value]), "blank"], operators: Array(shownValues.length).fill("+"), total: target, label: `A rhythm calculation totalling ${target} beats with one missing note value.` } });
  };
  const N4_RHYTHM_BEATS = { Semiquaver: .25, Quaver: .5, Crotchet: 1, Minim: 2, "Dotted minim": 3, Semibreve: 4 };
  const N4_RHYTHM_GLYPHS = { Semiquaver: "sixteenthNote", Quaver: "eighthNote", Crotchet: "quarterNote", Minim: "halfNote", "Dotted minim": "dottedHalfNote", Semibreve: "wholeNote" };
  const n4RhythmCompletion = (id, values, missingIndex, distractors) => {
    const answer = values[missingIndex];
    const total = values.reduce((sum, value) => sum + N4_RHYTHM_BEATS[value], 0);
    const terms = values.map((value, index) => index === missingIndex ? "blank" : N4_RHYTHM_GLYPHS[value]);
    const missingPosition = ["first", "middle", "last"][missingIndex];
    const calculation = values.map((value) => N4_RHYTHM_BEATS[value]).join(" + ");
    return n4Base(id, "hard", "three-rhythm-completion", "Which note value completes this calculation?", A(answer, ...distractors), "a", `${calculation} = ${total} beats, so the missing ${missingPosition} note value is a ${answer.toLowerCase()}.`, "Add the two visible note values, then subtract their total from the completed answer.", { type: "notation", notation: { kind: "rhythmSum", terms, operators: ["+", "+"], total, label: `A three-rhythm calculation totalling ${total} beats with the ${missingPosition} note value missing.` } });
  };

  const listening = [
    base("n3-listening-001", "listening", "major-tonality", "Which tonality do you hear?", A("Major", "Minor", "Atonal", "Modal"), "a", "The notes outline a major chord, which gives the example a bright and settled sound.", "Listen to whether the final chord sounds bright or dark.", 1, 3, { type: "audio", audio: audio("n3-major-example", { bpm: 92, notes: [60, 64, 67, 72], beats: [1, 1, 1, 2], waveform: "triangle" }), preferredFiftyFiftyDistractor: "b" }),
    base("n3-listening-002", "listening", "descending", "What happens to the pitch in this example?", A("It descends", "It ascends", "It repeats one note", "It stays still"), "a", "The notes move from a higher pitch to lower pitches, so the melody descends.", "Follow the direction of the notes from the beginning to the end.", 1, 3, { type: "audio", audio: audio("n3-descending-example", { bpm: 96, notes: [72, 71, 69, 67, 65, 64, 62, 60], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5] }) }),
    base("n3-listening-003", "listening", "piano-dynamic", "Which dynamic best describes this example?", A("Piano", "Forte", "Crescendo", "Fortissimo"), "a", "The example is played quietly, so the most suitable dynamic is piano.", "Think about the overall volume, not the speed or pitch.", 1, 3, { type: "audio", audio: audio("n3-piano-example", { bpm: 88, gain: 0.07, notes: [60, 62, 64, 65, 67], beats: [1, 1, 1, 1, 2] }), preferredFiftyFiftyDistractor: "b" }),

    base("n3-listening-004", "listening", "allegro", "Which tempo word best matches the music?", A("Allegro", "Adagio", "Largo", "Slow"), "a", "The quick pulse is best described as allegro, meaning fast.", "Tap the steady beat and decide whether it feels fast or slow.", 4, 5, { type: "audio", audio: audio("n3-allegro-example", { bpm: 148, notes: [60, 64, 67, 64, 60, 64, 67, 72], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1] }) }),
    base("n3-listening-005", "listening", "staccato", "How are these notes played?", A("Staccato", "Legato", "Very quietly", "As one long note"), "a", "The notes are short and detached, which is staccato articulation.", "Listen for gaps between the notes.", 4, 5, { type: "audio", audio: audio("n3-staccato-example", { bpm: 108, gate: 0.28, notes: [60, 62, 64, 65, 67, 65, 64, 62], beats: [1, 1, 1, 1, 1, 1, 1, 1] }), preferredFiftyFiftyDistractor: "b" }),
    base("n3-listening-006", "listening", "crescendo", "Which change in dynamics do you hear?", A("Crescendo", "Diminuendo", "The volume stays the same", "A sudden silence"), "a", "The notes gradually become louder, creating a crescendo.", "Compare the volume at the beginning with the volume at the end.", 4, 5, { type: "audio", audio: audio("n3-crescendo-example", { bpm: 96, gains: [0.04, 0.055, 0.075, 0.1, 0.14, 0.19, 0.25], notes: [60, 62, 64, 65, 67, 69, 72], beats: [1, 1, 1, 1, 1, 1, 2] }), preferredFiftyFiftyDistractor: "b" }),

    base("n3-listening-007", "listening", "step", "How does the melody mainly move?", A("By step", "By leap", "By repeated notes only", "It does not move"), "a", "The melody moves between neighbouring notes, so it moves mainly by step.", "Listen to the distance between each pair of notes.", 6, 8, { type: "audio", audio: audio("n3-step-example", { bpm: 94, notes: [60, 62, 64, 65, 67, 69, 71, 72], beats: [0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 1.5] }), preferredFiftyFiftyDistractor: "b" }),
    base("n3-listening-008", "listening", "repetition", "Which melodic feature is most obvious?", A("Repetition", "A descending scale", "A large leap", "A change of key"), "a", "The same pitch is sounded several times, creating repetition.", "Concentrate on whether the pitch changes from note to note.", 6, 8, { type: "audio", audio: audio("n3-repetition-example", { bpm: 104, notes: [67, 67, 67, 67, 69, 69, 67], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5] }) }),
    base("n3-listening-009", "listening", "forte-dynamic", "Which dynamic marking best suits the example?", A("f", "p", "cresc.", "dim."), "a", "The example is played loudly, so the suitable marking is f, meaning forte.", "Decide whether the overall sound is loud or quiet.", 6, 8, { type: "audio", audio: audio("n3-forte-example", { bpm: 100, gain: 0.25, notes: [60, 64, 67, 72, 67, 64, 60], beats: [1, 1, 1, 1, 1, 1, 2] }), preferredFiftyFiftyDistractor: "b" }),

    base("n3-listening-010", "listening", "minor-tonality", "Which tonality is used in this example?", A("Minor", "Major", "Whole-tone", "Atonal"), "a", "The example outlines a minor chord and scale, giving it a darker minor sound.", "Listen especially to the third note of the opening chord.", 9, 10, { type: "audio", audio: audio("n3-minor-example", { bpm: 84, notes: [57, 60, 64, 69, 67, 65, 64, 62, 60, 59, 57], beats: [1, 1, 1, 1.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 2] }), preferredFiftyFiftyDistractor: "b" }),
    base("n3-listening-011", "listening", "melody-and-accompaniment", "Which texture do you hear?", A("Melody and accompaniment", "Unison", "Silence", "A single repeated note"), "a", "A clear upper melody is supported by lower accompanying notes.", "Listen separately to the high and low parts.", 9, 10, { type: "audio", audio: audio("n3-melody-accompaniment-example", { bpm: 92, voices: [{ notes: [67, 69, 71, 72, 71, 69, 67, 64], beats: [1, 1, 1, 1, 1, 1, 1, 1], gain: 0.16 }, { notes: [48, 48, 53, 53, 55, 55, 48, 48], beats: [1, 1, 1, 1, 1, 1, 1, 1], gain: 0.07, waveform: "sine" }] }) }),
    base("n3-listening-012", "listening", "diminuendo", "What happens to the dynamics?", A("They gradually become quieter", "They gradually become louder", "They remain forte", "They alternate suddenly"), "a", "The sound gradually fades from loud to quiet, which is a diminuendo.", "Compare the first two notes with the final two notes.", 9, 10, { type: "audio", audio: audio("n3-diminuendo-example", { bpm: 90, gains: [0.25, 0.2, 0.16, 0.12, 0.09, 0.065, 0.045], notes: [72, 71, 69, 67, 65, 64, 60], beats: [1, 1, 1, 1, 1, 1, 2] }), preferredFiftyFiftyDistractor: "b" }),

    base("n3-listening-013", "listening", "unison", "Two sound sources perform this example. Which texture do they create?", A("Unison", "Melody and accompaniment", "An ostinato with a different melody", "Silence"), "a", "Both sound sources perform the same notes at the same time, which creates unison.", "Decide whether the parts have different musical jobs or share one melody.", 11, 12, { type: "audio", audio: audio("n3-unison-example", { bpm: 88, voices: [{ notes: [60, 62, 64, 67, 65, 64, 62, 60], beats: [1, 1, 1, 1, 1, 1, 1, 2], gain: 0.12, waveform: "triangle" }, { notes: [60, 62, 64, 67, 65, 64, 62, 60], beats: [1, 1, 1, 1, 1, 1, 1, 2], gain: 0.055, waveform: "sine" }] }) }),
    base("n3-listening-014", "listening", "leap", "Which description best matches the melodic movement?", A("It contains several leaps", "It moves only by step", "It repeats one pitch throughout", "It continually descends"), "a", "Several consecutive notes are separated by larger pitch distances, so the melody contains leaps.", "Focus on the size of the gaps between neighbouring notes.", 13, 14, { type: "audio", audio: audio("n3-leap-example", { bpm: 92, notes: [60, 67, 62, 69, 64, 72, 65, 71, 67], beats: [0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 2] }), preferredFiftyFiftyDistractor: "b" }),
    base("n3-listening-015", "listening", "ostinato", "Which concept is created by the repeated four-note pattern?", A("Ostinato", "Unison", "Diminuendo", "A single sustained note"), "a", "The same four-note musical pattern repeats several times, so it is an ostinato.", "Listen for a short pattern that begins again more than once.", 15, 15, { type: "audio", audio: audio("n3-ostinato-example", { bpm: 104, notes: [60, 64, 67, 64, 60, 64, 67, 64, 60, 64, 67, 64], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5] }) }),
  ];

  const literacy = [
    // Easy: recognise the four National 3 note values, simple time signatures,
    // treble-stave notes and step/leap movement.
    base("n3-literacy-001", "literacy", "crotchet-beats", "How many beats does this note last?", A("1", "2", "3", "4"), "a", "A crotchet lasts for one beat.", "A crotchet has a filled notehead and a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["quarterNote"], label: "One crotchet." } }),
    base("n3-literacy-002", "literacy", "minim-beats", "How many beats does this note last?", A("2", "1", "3", "4"), "a", "A minim lasts for two beats.", "A minim has an open notehead and a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["halfNote"], label: "One minim." } }),
    base("n3-literacy-003", "literacy", "dotted-minim-beats", "How many beats does this note last?", A("3", "2", "4", "1"), "a", "A dotted minim lasts for three beats.", "The dot adds one beat to a minim.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["dottedHalfNote"], label: "One dotted minim." } }),
    base("n3-literacy-004", "literacy", "semibreve-beats", "How many beats does this note last?", A("4", "3", "2", "1"), "a", "A semibreve lasts for four beats.", "A semibreve has an open notehead and no stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["wholeNote"], label: "One semibreve." } }),
    base("n3-literacy-005", "literacy", "crotchet-name", "What is this note value called?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "This is a crotchet.", "Look for a filled notehead with a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["quarterNote"], label: "One crotchet." } }),
    base("n3-literacy-006", "literacy", "minim-name", "What is this note value called?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "This is a minim.", "Look for an open notehead with a stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["halfNote"], label: "One minim." } }),
    base("n3-literacy-007", "literacy", "dotted-minim-name", "What is this note value called?", A("Dotted minim", "Minim", "Crotchet", "Semibreve"), "a", "This is a dotted minim.", "The dot makes it different from an ordinary minim.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["dottedHalfNote"], label: "One dotted minim." } }),
    base("n3-literacy-008", "literacy", "semibreve-name", "What is this note value called?", A("Semibreve", "Minim", "Crotchet", "Dotted minim"), "a", "This is a semibreve.", "It is the only one of these four note values with no stem.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["wholeNote"], label: "One semibreve." } }),
    base("n3-literacy-011", "literacy", "time-signature-name", "What is this symbol called?", A("Time signature", "Double barline", "Repeat sign", "Crescendo"), "a", "This is a time signature. It tells us how many beats are in each bar.", "It is written at the start of the music as two numbers, one above the other.", 1, 5, { type: "notation", notation: { kind: "timeSignature", top: 4, bottom: 4, label: "A four-four time signature." } }),
    base("n3-literacy-046", "literacy", "treble-clef-name", "What is this symbol called?", A("Treble clef", "Bass clef", "Time signature", "Double barline"), "a", "This symbol is a treble clef, also called a G clef.", "The curl of the treble clef circles the G line on the stave.", 1, 5, { type: "notation", notation: { kind: "glyphs", glyphs: ["trebleClef"], label: "A treble clef." } }),
    base("n3-literacy-012", "literacy", "treble-clef-e", "What note is this?", A("E", "G", "B", "D"), "a", "The bottom line of the treble stave is E.", "Use the five line names: E, G, B, D, F.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "E4", label: "A crotchet E on the bottom line of the treble stave." } }),
    base("n3-literacy-047", "literacy", "treble-clef-f", "What note is this?", A("F", "A", "C", "E"), "a", "The first space of the treble stave is F.", "Use the four space names: F, A, C, E.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "F4", label: "A crotchet F in the first space of the treble stave." } }),
    base("n3-literacy-013", "literacy", "treble-clef-g", "What note is this?", A("G", "B", "D", "F"), "a", "The second line of the treble stave is G.", "Use the five line names: E, G, B, D, F.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "G4", label: "A crotchet G on the second line of the treble stave." } }),
    base("n3-literacy-048", "literacy", "treble-clef-a", "What note is this?", A("A", "C", "E", "G"), "a", "The second space of the treble stave is A.", "Use the four space names: F, A, C, E.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "A4", label: "A crotchet A in the second space of the treble stave." } }),
    base("n3-literacy-028", "literacy", "treble-clef-b", "What note is this?", A("B", "G", "D", "F"), "a", "The middle line of the treble stave is B.", "Use the five line names: E, G, B, D, F.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "B4", label: "A crotchet B on the middle line of the treble stave." } }),
    base("n3-literacy-014", "literacy", "treble-clef-c", "What note is this?", A("C", "A", "E", "B"), "a", "The third space of the treble stave is C.", "Use the four space names: F, A, C, E.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "C5", label: "A crotchet C in the third space of the treble stave." } }),
    base("n3-literacy-049", "literacy", "treble-clef-d", "What note is this?", A("D", "B", "F", "A"), "a", "The fourth line of the treble stave is D.", "Use the five line names: E, G, B, D, F.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "D5", label: "A crotchet D on the fourth line of the treble stave." } }),
    base("n3-literacy-029", "literacy", "treble-clef-e-space", "What note is this?", A("E", "C", "F", "D"), "a", "The top space of the treble stave is E.", "Use the four space names: F, A, C, E.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "E5", label: "A crotchet E in the top space of the treble stave." } }),
    base("n3-literacy-050", "literacy", "treble-clef-f-top", "What note is this?", A("F", "D", "E", "G"), "a", "The top line of the treble stave is F.", "Use the five line names: E, G, B, D, F.", 1, 5, { type: "notation", notation: { kind: "note", pitch: "F5", label: "A crotchet F on the top line of the treble stave." } }),
    base("n3-literacy-015", "literacy", "step", "What is the distance between these two notes?", A("Step", "Leap", "Repeat", "Rest"), "a", "The notes are next to each other, so they move by step.", "Check whether there is a note position between the two notes.", 1, 5, { type: "notation", notation: { kind: "melody", pitches: ["E4", "F4"], label: "Two crotchets moving from E to F by step." } }),

    // Medium: read common notation and calculate rhythmic addition.
    base("n3-literacy-016", "literacy", "stave", "What are the five lines and four spaces called?", A("Stave", "Bar", "Time signature", "Rhythm"), "a", "The five lines and four spaces used to write music are called a stave.", "It is the framework on which musical notes are written.", 6, 10, { type: "notation", notation: { kind: "stave", label: "A blank five-line stave." } }),
    base("n3-literacy-017", "literacy", "double-barline-name", "What is the name of this symbol?", A("Double barline", "Repeat sign", "Time signature", "Crescendo"), "a", "Two vertical lines together form a double barline.", "Check whether there are repeat dots beside the lines.", 6, 10, { type: "notation", notation: { kind: "barline", label: "A double barline with no repeat dots." } }),
    base("n3-literacy-018", "literacy", "double-barline-meaning", "What does this symbol usually mean?", A("The end of the music", "Play the section again", "Play louder", "Play faster"), "a", "A double barline usually marks the end of the music or a section.", "There are no repeat dots, so it does not tell you to repeat.", 6, 10, { type: "notation", notation: { kind: "barline", label: "A double barline with no repeat dots." } }),
    base("n3-literacy-021", "literacy", "crescendo-symbol", "What is this symbol called?", A("Crescendo", "Diminuendo", "Double barline", "Repeat sign"), "a", "This opening hairpin is a crescendo sign.", "The symbol opens out as the music becomes louder.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "crescendo", label: "A crescendo hairpin." } }),
    base("n3-literacy-022", "literacy", "diminuendo-symbol", "What is this symbol called?", A("Diminuendo", "Crescendo", "Double barline", "Repeat sign"), "a", "This closing hairpin is a diminuendo sign.", "The symbol closes in as the music becomes quieter.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "diminuendo", label: "A diminuendo hairpin." } }),
    base("n3-literacy-053", "literacy", "forte-symbol", "What does this symbol mean?", A("Loud", "Quiet", "Gradually louder", "Gradually quieter"), "a", "The symbol f means forte, which means loud.", "Forte begins with f, like forceful sound.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "f", label: "A forte dynamic marking." } }),
    base("n3-literacy-054", "literacy", "piano-symbol", "What does this symbol mean?", A("Quiet", "Loud", "Gradually quieter", "Gradually louder"), "a", "The symbol p means piano, which means quiet.", "Piano begins with p, like peaceful sound.", 6, 10, { type: "notation", notation: { kind: "dynamic", dynamic: "p", label: "A piano dynamic marking." } }),
    base("n3-literacy-023", "literacy", "rhythm-addition-three", "What is the total number of beats?", A("3", "2", "4", "5"), "a", "A crotchet is worth one beat and a minim is worth two beats, making three.", "Add the value of each note.", 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["quarterNote", "halfNote"], operators: ["+"], label: "A crotchet plus a minim." } }),
    base("n3-literacy-024", "literacy", "rhythm-addition-four", "What is the total number of beats?", A("4", "3", "5", "2"), "a", "A dotted minim is worth three beats and a crotchet is worth one beat, making four.", "A dot adds one beat to a minim.", 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["dottedHalfNote", "quarterNote"], operators: ["+"], label: "A dotted minim plus a crotchet." } }),
    base("n3-literacy-025", "literacy", "rhythm-addition-five", "What is the total number of beats?", A("5", "4", "6", "3"), "a", "A semibreve is worth four beats and a crotchet is worth one beat, making five.", "Start with the longest note value.", 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "quarterNote"], operators: ["+"], label: "A semibreve plus a crotchet." } }),
    base("n3-literacy-026", "literacy", "rhythm-addition-two-minims", "What is the total number of beats?", A("4", "2", "3", "6"), "a", "Each minim is worth two beats, so two minims make four beats.", "Add two beats and two beats.", 6, 10, { type: "notation", notation: { kind: "rhythmSum", terms: ["halfNote", "halfNote"], operators: ["+"], label: "A minim plus a minim." } }),
    base("n3-literacy-027", "literacy", "leap", "What is the distance between these two notes?", A("Leap", "Step", "Repeat", "Rest"), "a", "There are note positions between these two notes, so they move by leap.", "A leap skips over one or more note positions.", 6, 10, { type: "notation", notation: { kind: "melody", pitches: ["E4", "C5"], label: "Two crotchets moving from E to C by leap." } }),
    base("n3-literacy-030", "literacy", "time-signature-purpose", "What does a time signature tell you?", A("How many beats are in each bar", "Which instrument to play", "How loud to play", "How fast to play"), "a", "A time signature tells you how many beats fit into each bar.", "It is about organising the beat, not the sound quality.", 6, 10, { type: "notation", notation: { kind: "timeSignature", top: 3, bottom: 4, label: "A three-four time signature." } }),

    // Hard: complete simple bars, identify their time signatures and calculate
    // positive rhythm sums using addition and subtraction.
    base("n3-literacy-031", "literacy", "complete-24-crotchet", "Which note value completes this 2/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "One crotchet is already shown. One more crotchet completes a two-beat bar.", "A 2/4 bar needs two beats altogether.", 11, 15, { type: "notation", notation: { kind: "bar", time: [2, 4], glyphs: ["quarterNote", "blank"], label: "A two-four bar with one crotchet and a blank." } }),
    base("n3-literacy-032", "literacy", "complete-24-minim", "Which note value completes this 2/4 bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "The blank must last two beats to complete the bar, so it is a minim.", "The bar needs two beats and the blank is the whole bar.", 11, 15, { type: "notation", notation: { kind: "bar", time: [2, 4], glyphs: ["blank"], label: "An empty two-four bar with one blank." } }),
    base("n3-literacy-033", "literacy", "complete-34-minim", "Which note value completes this 3/4 bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "One crotchet uses one beat, leaving two beats. A minim completes the bar.", "Subtract the one beat already shown from three beats.", 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["quarterNote", "blank"], label: "A three-four bar with one crotchet and a blank." } }),
    base("n3-literacy-034", "literacy", "complete-34-crotchet", "Which note value completes this 3/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A minim uses two beats, leaving one beat. A crotchet completes the bar.", "Subtract two beats from the three beats in the bar.", 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["halfNote", "blank"], label: "A three-four bar with one minim and a blank." } }),
    base("n3-literacy-035", "literacy", "complete-34-two-crotchets", "Which note value completes this 3/4 bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "Two crotchets use two beats, leaving one beat. A crotchet completes the bar.", "Count the beats already used before choosing the missing note.", 11, 15, { type: "notation", notation: { kind: "bar", time: [3, 4], glyphs: ["quarterNote", "quarterNote", "blank"], label: "A three-four bar with two crotchets and a blank." } }),
    base("n3-literacy-036", "literacy", "complete-44-minim", "Which note value completes this bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "A minim uses two beats, leaving two beats. Another minim completes the bar.", "A 4/4 bar needs four beats altogether.", 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["halfNote", "blank"], label: "A four-four bar with one minim and a blank." } }),
    base("n3-literacy-037", "literacy", "complete-44-two-crotchets", "Which note value completes this bar?", A("Minim", "Crotchet", "Dotted minim", "Semibreve"), "a", "Two crotchets use two beats, leaving two beats. A minim completes the bar.", "Subtract the two shown beats from the four beats in the bar.", 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["quarterNote", "quarterNote", "blank"], label: "A four-four bar with two crotchets and a blank." } }),
    base("n3-literacy-038", "literacy", "complete-44-dotted-minim", "Which note value completes this bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A dotted minim uses three beats, leaving one beat. A crotchet completes the bar.", "A dotted minim is worth three beats.", 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["dottedHalfNote", "blank"], label: "A four-four bar with a dotted minim and a blank." } }),
    base("n3-literacy-039", "literacy", "time-signature-from-two-beat-bar", "Which time signature fits this complete bar?", A("2/4", "3/4", "4/4", "5/4"), "a", "Two crotchets make two beats, so this is a 2/4 bar.", "Count the total number of beats in the bar.", 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote"], label: "A bar containing two crotchets." } }),
    base("n3-literacy-040", "literacy", "time-signature-from-three-beat-bar", "Which time signature fits this complete bar?", A("3/4", "2/4", "4/4", "5/4"), "a", "Three crotchets make three beats, so this is a 3/4 bar.", "Count the total number of beats in the bar.", 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote", "quarterNote"], label: "A bar containing three crotchets." } }),
    base("n3-literacy-041", "literacy", "time-signature-from-four-beat-bar", "Which time signature fits this complete bar?", A("4/4", "2/4", "3/4", "5/4"), "a", "Four crotchets make four beats, so this is a 4/4 bar.", "Count the total number of beats in the bar.", 11, 15, { type: "notation", notation: { kind: "bar", glyphs: ["quarterNote", "quarterNote", "quarterNote", "quarterNote"], label: "A bar containing four crotchets." } }),
    base("n3-literacy-042", "literacy", "rhythm-sum-six", "What is the total number of beats?", A("6 beats", "5 beats", "4 beats", "3 beats"), "a", "A crotchet is one, a minim is two and a dotted minim is three: 1 + 2 + 3 = 6 beats.", "Write the value of each note before adding.", 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["quarterNote", "halfNote", "dottedHalfNote"], operators: ["+", "+"], label: "A crotchet plus a minim plus a dotted minim." } }),
    base("n3-literacy-043", "literacy", "rhythm-sum-three", "What is the total number of beats?", A("3 beats", "2 beats", "4 beats", "5 beats"), "a", "A semibreve is four beats. 4 − 2 + 1 = 3 beats.", "Work from left to right using the note values.", 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "halfNote", "quarterNote"], operators: ["−", "+"], label: "A semibreve minus a minim plus a crotchet." } }),
    base("n3-literacy-044", "literacy", "rhythm-sum-four", "What is the total number of beats?", A("4 beats", "3 beats", "5 beats", "2 beats"), "a", "A dotted minim is three beats, a minim is two and a crotchet is one: 3 + 2 − 1 = 4 beats.", "Change each note value into a number first.", 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["dottedHalfNote", "halfNote", "quarterNote"], operators: ["+", "−"], label: "A dotted minim plus a minim minus a crotchet." } }),
    base("n3-literacy-045", "literacy", "rhythm-sum-one", "What is the total number of beats?", A("1 beat", "2 beats", "3 beats", "4 beats"), "a", "A semibreve is four beats. 4 − 2 − 1 = 1 beat.", "Take away the minim before taking away the crotchet.", 11, 15, { type: "notation", notation: { kind: "rhythmSum", terms: ["wholeNote", "halfNote", "quarterNote"], operators: ["−", "−"], label: "A semibreve minus a minim minus a crotchet." } }),
    base("n3-literacy-055", "literacy", "complete-44-minim-crotchet", "Which note value completes this bar?", A("Crotchet", "Minim", "Dotted minim", "Semibreve"), "a", "A minim and a crotchet use three beats, leaving one beat. A crotchet completes the bar.", "A 4/4 bar needs four beats altogether.", 11, 15, { type: "notation", notation: { kind: "bar", time: [4, 4], glyphs: ["halfNote", "quarterNote", "blank"], label: "A four-four bar with a minim, a crotchet and a blank." } }),
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
    n4Base("n4-literacy-easy-002", "easy", "quaver-name", "What is this note value called?", A("Quaver", "Crotchet", "Semiquaver", "Minim"), "a", "This note is a quaver.", "A quaver has one flag.", { type: "notation", notation: { kind: "glyphs", glyphs: ["eighthNote"], label: "One quaver." } }),
    n4Base("n4-literacy-easy-003", "easy", "paired-quavers-total", "What is the total number of beats?", A("1 beat", "0.5 beat", "2 beats", "0.25 beat"), "a", "Two paired quavers make one beat altogether.", "Each quaver is worth half a beat.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "pairedEighthNotes", label: "Two paired quavers." } }),
    n4Base("n4-literacy-easy-004", "easy", "paired-quavers-name", "What are these note values called?", A("Quavers", "Semiquavers", "Crotchets", "Minims"), "a", "These note values are quavers.", "Quavers can be joined together with one beam.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "pairedEighthNotes", label: "Two paired quavers." } }),
    n4Base("n4-literacy-easy-005", "easy", "semiquaver-beats", "How many beats does this note last?", A("0.25 beat", "0.5 beat", "1 beat", "2 beats"), "a", "A semiquaver lasts for a quarter of a beat.", "Four semiquavers fit into one crotchet beat.", { type: "notation", notation: { kind: "glyphs", glyphs: ["sixteenthNote"], label: "One semiquaver." } }),
    n4Base("n4-literacy-easy-006", "easy", "semiquaver-name", "What is this note value called?", A("Semiquaver", "Quaver", "Crotchet", "Minim"), "a", "This note is a semiquaver.", "A semiquaver has two flags.", { type: "notation", notation: { kind: "glyphs", glyphs: ["sixteenthNote"], label: "One semiquaver." } }),
    n4Base("n4-literacy-easy-007", "easy", "grouped-semiquavers-total", "What is the total number of beats?", A("1 beat", "0.5 beat", "2 beats", "4 beats"), "a", "Four grouped semiquavers make one beat altogether.", "Each semiquaver is worth a quarter of a beat.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "fourSixteenthNotes", label: "Four grouped semiquavers." } }),
    n4Base("n4-literacy-easy-008", "easy", "grouped-semiquavers-name", "What are these note values called?", A("Semiquavers", "Quavers", "Crotchets", "Minims"), "a", "These note values are semiquavers.", "Semiquavers can be grouped together with two beams.", { type: "notation", notation: { kind: "rhythmFigure", pattern: "fourSixteenthNotes", label: "Four grouped semiquavers." } }),
    n4Base("n4-literacy-easy-009", "easy", "repeat-sign-name", "What is the name of this symbol?", A("Repeat sign", "Double barline", "Time signature", "Treble clef"), "a", "This is a repeat sign.", "Look for the two dots beside the barlines.", { type: "notation", notation: { kind: "glyphs", glyphs: ["repeatRight"], label: "A right repeat sign." } }),
    n4Base("n4-literacy-easy-010", "easy", "repeat-sign-meaning", "What does this symbol mean?", A("Play the section again", "Finish the music", "Play more loudly", "Play more slowly"), "a", "A repeat sign tells the performer to play the section again.", "The two dots distinguish it from an ordinary double barline.", { type: "notation", notation: { kind: "glyphs", glyphs: ["repeatRight"], label: "A right repeat sign." } }),
    n4Base("n4-literacy-easy-011", "easy", "mezzo-piano-meaning", "What does this symbol mean?", A("Moderately quiet", "Very quiet", "Moderately loud", "Very loud"), "a", "mp means mezzo piano: moderately quiet.", "Mezzo means moderately and piano means quiet.", { type: "notation", notation: { kind: "dynamic", dynamic: "mp", label: "The dynamic marking mezzo piano." } }),
    n4Base("n4-literacy-easy-012", "easy", "mezzo-piano-name", "What is the name of this dynamic?", A("Mezzo piano", "Mezzo forte", "Piano", "Pianissimo"), "a", "The dynamic marking mp is called mezzo piano.", "Read both letters in the symbol.", { type: "notation", notation: { kind: "dynamic", dynamic: "mp", label: "The dynamic marking mezzo piano." } }),
    n4Base("n4-literacy-easy-013", "easy", "mezzo-forte-meaning", "What does this symbol mean?", A("Moderately loud", "Very loud", "Moderately quiet", "Very quiet"), "a", "mf means mezzo forte: moderately loud.", "Mezzo means moderately and forte means loud.", { type: "notation", notation: { kind: "dynamic", dynamic: "mf", label: "The dynamic marking mezzo forte." } }),
    n4Base("n4-literacy-easy-014", "easy", "mezzo-forte-name", "What is the name of this dynamic?", A("Mezzo forte", "Mezzo piano", "Forte", "Fortissimo"), "a", "The dynamic marking mf is called mezzo forte.", "Read both letters in the symbol.", { type: "notation", notation: { kind: "dynamic", dynamic: "mf", label: "The dynamic marking mezzo forte." } }),
    ...[
      [["E4", "F4", "G4", "A4"], ["E4", "F4", "G4", "A4"]],
      [["G4", "A4", "B4", "C5"], ["G4", "A4", "B4", "C5"]],
      [["C5", "B4", "A4", "G4"], ["C5", "B4", "A4", "G4"]],
      [["A4", "G4", "F4", "E4"], ["A4", "G4", "F4", "E4"]],
    ].map(([firstBar, secondBar], index) => n4Base(`n4-literacy-easy-${String(index + 15).padStart(3, "0")}`, "easy", "two-bar-repetition", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "a", "The second bar repeats exactly the same notes as the first bar.", "Compare every note in the second bar with the first.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: "Two bars showing exact melodic repetition." } })),

    // Medium: new ledger-line notes, true sequences and quaver calculations.
    ...[
      ["C4", "C", "D", "B", "E"], ["D4", "D", "C", "E", "B"],
      ["G5", "G", "F", "A", "E"], ["A5", "A", "G", "F", "B"],
      ["C4", "C", "A", "D", "E"], ["D4", "D", "B", "C", "E"],
      ["G5", "G", "A", "E", "F"], ["A5", "A", "F", "G", "B"],
    ].map(([pitch, correct, b, c, d], index) => n4Base(`n4-literacy-medium-${String(index + 1).padStart(3, "0")}`, "medium", `ledger-note-${pitch.toLowerCase()}`, "What note is this?", A(correct, b, c, d), "a", `This ledger-line note is ${correct}.`, "Count carefully from the nearest line or space on the stave.", { type: "notation", notation: { kind: "note", pitch, label: `A crotchet ${correct} shown ${pitch === "C4" || pitch === "D4" ? "below" : "above"} the treble stave.` } })),
    ...[
      [["E4", "F4", "G4", "A4"], ["F4", "G4", "A4", "B4"]],
      [["F4", "G4", "A4", "B4"], ["G4", "A4", "B4", "C5"]],
      [["G4", "A4", "B4", "C5"], ["F4", "G4", "A4", "B4"]],
      [["C5", "B4", "A4", "G4"], ["B4", "A4", "G4", "F4"]],
      [["B4", "A4", "G4", "F4"], ["C5", "B4", "A4", "G4"]],
      [["A4", "B4", "C5", "D5"], ["G4", "A4", "B4", "C5"]],
    ].map(([firstBar, secondBar], index) => n4Base(`n4-literacy-medium-${String(index + 9).padStart(3, "0")}`, "medium", "two-bar-sequence", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "b", "Every note in the second bar is one step higher, so this is a sequence higher.", "Check whether every note has moved by the same step, then decide whether it moved higher or lower.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: "Two bars showing a melodic sequence one step higher." } })),
    ...[
      ["quarterNote", "1.5 beats", "A quaver plus a crotchet."],
      ["halfNote", "2.5 beats", "A quaver plus a minim."],
      ["dottedHalfNote", "3.5 beats", "A quaver plus a dotted minim."],
      ["wholeNote", "4.5 beats", "A quaver plus a semibreve."],
    ].map(([other, total, label], index) => {
      const distractors = ["1.5 beats", "2.5 beats", "3.5 beats", "4.5 beats", "5.5 beats"].filter((choice) => choice !== total).slice(0, 3);
      return n4Base(`n4-literacy-medium-${String(index + 15).padStart(3, "0")}`, "medium", "two-rhythm-quaver-sum", "What is the total number of beats?", A(total, ...distractors), "a", `A quaver is worth half a beat, giving a total of ${total}.`, "Change both note values into numbers before adding.", { type: "notation", notation: { kind: "rhythmSum", terms: ["eighthNote", other], operators: ["+"], label } });
    }),
    ...[
      [["pairedEighthNotes", "quarterNote"], "2/4"],
      [["pairedEighthNotes", "halfNote"], "3/4"],
      [["pairedEighthNotes", "dottedHalfNote"], "4/4"],
      [["pairedEighthNotes", "pairedEighthNotes"], "2/4"],
      [["pairedEighthNotes", "quarterNote", "quarterNote"], "3/4"],
    ].map(([glyphs, answer], index) => n4Base(`n4-literacy-medium-${String(index + 19).padStart(3, "0")}`, "medium", "time-signature-paired-quavers", "Which time signature fits this complete bar?", A(answer, answer === "2/4" ? "3/4" : "2/4", answer === "4/4" ? "3/4" : "4/4", "5/4"), "a", `The rhythms total ${answer[0]} beats, so the bar is in ${answer}.`, "Count the paired quavers as one beat.", { type: "notation", notation: { kind: "bar", glyphs, label: `A complete ${answer} bar containing paired quavers.` } })),
    ...[
      [[2, 4], ["quarterNote", "eighthNote", "blank"], "Quaver", "One crotchet and one quaver use one and a half beats, leaving half a beat."],
      [[2, 4], ["pairedEighthNotes", "blank"], "Crotchet", "Paired quavers use one beat, leaving one crotchet beat."],
      [[3, 4], ["halfNote", "eighthNote", "blank"], "Quaver", "A minim and a quaver use two and a half beats, leaving half a beat."],
      [[3, 4], ["pairedEighthNotes", "quarterNote", "blank"], "Crotchet", "Paired quavers and a crotchet use two beats, leaving one crotchet beat."],
      [[4, 4], ["dottedHalfNote", "eighthNote", "blank"], "Quaver", "A dotted minim and a quaver use three and a half beats, leaving half a beat."],
      [[4, 4], ["halfNote", "pairedEighthNotes", "blank"], "Crotchet", "A minim and paired quavers use three beats, leaving one crotchet beat."],
    ].map(([time, glyphs, answer, explanation], index) => {
      const quaverDescription = glyphs.includes("pairedEighthNotes") ? "paired quavers" : "a single quaver";
      return n4Base(`n4-literacy-medium-${String(index + 24).padStart(3, "0")}`, "medium", "complete-bar-single-quaver", "Which note value completes this bar?", A(answer, answer === "Quaver" ? "Crotchet" : "Quaver", "Semiquaver", "Minim"), "a", `${explanation} The missing note is a ${answer.toLowerCase()}.`, "Count the beats already shown, then subtract from the time signature.", { type: "notation", notation: { kind: "bar", time, glyphs, label: `A ${time[0]}/${time[1]} bar with ${quaverDescription} and one missing note.` } });
    }),

    // Hard: beams, mixed semiquaver groups and fractional calculations.
    n4Base("n4-literacy-hard-001", "hard", "beam-name", "What is the highlighted part of the rhythm called?", A("Beam", "Stem", "Notehead", "Flag"), "a", "The horizontal line joining the notes is called a beam.", "The highlighted part joins the stems together.", { type: "notation", notation: { kind: "beam", pattern: "pairedEighthNotes", label: "Paired quavers with their beam highlighted." } }),
    n4Base("n4-literacy-hard-002", "hard", "beam-name", "What is the highlighted music symbol called?", A("Beam", "Barline", "Ledger line", "Tie"), "a", "This horizontal joining line is a beam.", "It groups short note values together.", { type: "notation", notation: { kind: "beam", pattern: "fourSixteenthNotes", label: "Grouped semiquavers with their beams highlighted." } }),
    n4Base("n4-literacy-hard-045", "hard", "note-part-stem", "What is the part of the note indicated by the arrow called?", A("Stem", "Notehead", "Flag", "Beam"), "a", "The vertical line extending from the notehead is called the stem.", "Look at the straight vertical part of the note.", { type: "notation", notation: { kind: "notePart", part: "stem", label: "A quaver with an arrow pointing to its stem." } }),
    n4Base("n4-literacy-hard-046", "hard", "note-part-notehead", "What is the part of the note indicated by the arrow called?", A("Notehead", "Stem", "Flag", "Beam"), "a", "The filled oval part of the note is called the notehead.", "Look at the rounded part that shows the note's pitch.", { type: "notation", notation: { kind: "notePart", part: "notehead", label: "A quaver with an arrow pointing to its notehead." } }),
    n4Base("n4-literacy-hard-047", "hard", "note-part-flag", "What is the part of the note indicated by the arrow called?", A("Flag", "Stem", "Notehead", "Beam"), "a", "The curved mark attached to the top of a single quaver's stem is called the flag.", "A flag appears on a single quaver instead of a beam joining it to another note.", { type: "notation", notation: { kind: "notePart", part: "flag", label: "A quaver with an arrow pointing to its flag." } }),
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
      return n4Base(`n4-literacy-hard-${String(index + 7).padStart(3, "0")}`, "hard", "three-rhythm-semiquaver-sum", "What is the total number of beats?", A(answer, ...distractors), "a", explanation, "Work from left to right and remember that one semiquaver is worth a quarter beat.", { type: "notation", notation: { kind: "rhythmSum", terms, operators, label: "A three-part rhythm calculation involving a single semiquaver." } });
    }),
    ...[
      [["fourSixteenthNotes", "quarterNote"], "2/4"],
      [["fourSixteenthNotes", "halfNote"], "3/4"],
      [["fourSixteenthNotes", "dottedHalfNote"], "4/4"],
      [["fourSixteenthNotes", "pairedEighthNotes"], "2/4"],
      [["fourSixteenthNotes", "quarterNote", "quarterNote"], "3/4"],
      [["fourSixteenthNotes", "halfNote", "quarterNote"], "4/4"],
    ].map(([glyphs, answer], index) => n4Base(`n4-literacy-hard-${String(index + 15).padStart(3, "0")}`, "hard", "time-signature-grouped-semiquavers", "Which time signature fits this complete bar?", A(answer, answer === "2/4" ? "3/4" : "2/4", answer === "4/4" ? "3/4" : "4/4", "5/4"), "a", `Four grouped semiquavers equal one beat. The complete bar totals ${answer[0]} beats, so it is in ${answer}.`, "Count the group of four semiquavers as one beat.", { type: "notation", notation: { kind: "bar", glyphs, label: `A complete ${answer} bar containing four grouped semiquavers.` } })),
    ...[
      [[2, 4], ["quarterNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total one and three-quarter beats, leaving one semiquaver."],
      [[2, 4], ["semiquaverQuaverSemiquaver", "blank"], "Crotchet", "The mixed semiquaver group uses one beat, leaving one crotchet beat."],
      [[3, 4], ["halfNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total two and three-quarter beats, leaving one semiquaver."],
      [[3, 4], ["semiquaverQuaverSemiquaver", "quarterNote", "blank"], "Crotchet", "The mixed group and crotchet use two beats, leaving one crotchet beat."],
      [[4, 4], ["dottedHalfNote", "eighthNote", "sixteenthNote", "blank"], "Semiquaver", "The shown notes total three and three-quarter beats, leaving one semiquaver."],
      [[4, 4], ["halfNote", "semiquaverQuaverSemiquaver", "blank"], "Crotchet", "The minim and mixed group use three beats, leaving one crotchet beat."],
    ].map(([time, glyphs, answer, explanation], index) => n4Base(`n4-literacy-hard-${String(index + 21).padStart(3, "0")}`, "hard", "complete-bar-single-semiquaver", "Which note value completes this bar?", A(answer, answer === "Semiquaver" ? "Crotchet" : "Semiquaver", "Quaver", "Minim"), "a", explanation, "Count in quarter beats before subtracting from the time signature.", { type: "notation", notation: { kind: "bar", time, glyphs, label: `A ${time[0]}/${time[1]} bar involving single semiquavers and one missing note.` } })),
    ...[
      [["E4", "F4", "G4", "A4"], ["F4", "G4", "B4", "B4"]],
      [["F4", "G4", "A4", "B4"], ["G4", "A4", "B4", "D5"]],
      [["G4", "A4", "B4", "C5"], ["F4", "G4", "A4", "C5"]],
      [["C5", "B4", "A4", "G4"], ["B4", "A4", "F4", "F4"]],
      [["B4", "A4", "G4", "F4"], ["C5", "B4", "A4", "F4"]],
      [["A4", "B4", "C5", "D5"], ["G4", "A4", "C5", "C5"]],
    ].map(([firstBar, secondBar], index) => n4Base(`n4-literacy-hard-${String(index + 27).padStart(3, "0")}`, "hard", "two-bar-near-sequence", "What relationship is shown between the two bars?", A("Repetition", "Sequence higher", "Sequence lower", "None of these"), "d", "One note is a step away from the expected pattern, so the bars show neither an exact sequence nor repetition.", "Check every note: a sequence must move the complete pattern by the same distance.", { type: "notation", notation: { kind: "twoBarMelody", bars: [firstBar, secondBar], label: "Two related bars with one altered note, showing neither sequence nor exact repetition." } })),
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
  ];

  const concepts = [
    base("n3-concepts-001", "concepts", "violin", "Which instrument belongs to the string family?", A("Violin", "Trumpet", "Flute", "Snare drum"), "a", "The violin is a bowed string instrument.", "Think about which instrument normally uses a bow.", 1, 3),
    base("n3-concepts-002", "concepts", "soprano", "What is the name of the highest common female voice?", A("Soprano", "Alto", "Tenor", "Bass"), "a", "Soprano is the highest common female voice.", "The answer begins with the same letter as 'sky'.", 1, 3),
    base("n3-concepts-003", "concepts", "forte", "What does forte mean?", A("Loud", "Quiet", "Fast", "Slow"), "a", "Forte is the Italian musical term meaning loud.", "Do not confuse dynamics with tempo.", 1, 3),

    base("n3-concepts-004", "concepts", "woodwind-family", "Which instrument belongs to the woodwind family?", A("Clarinet", "Violin", "Trombone", "Timpani"), "a", "The clarinet is a woodwind instrument.", "Think about which instrument is played by blowing through a mouthpiece with a reed.", 4, 5),
    base("n3-concepts-005", "concepts", "bass-voice", "Which is the lowest common male voice?", A("Bass", "Tenor", "Alto", "Soprano"), "a", "Bass is the lowest common male voice.", "The name is also used for low-pitched instruments.", 4, 5),
    base("n3-concepts-006", "concepts", "adagio", "Which tempo word means slow?", A("Adagio", "Allegro", "Forte", "Crescendo"), "a", "Adagio is an Italian tempo term meaning slow.", "First remove the answers that describe dynamics rather than speed.", 4, 5),

    base("n3-concepts-007", "concepts", "brass-family", "Which pair of instruments belongs to the brass family?", A("Trumpet and trombone", "Flute and clarinet", "Violin and cello", "Timpani and snare drum"), "a", "Trumpet and trombone both produce sound through vibrating lips and belong to the brass family.", "Look for the pair commonly made from coiled metal tubing with flared bells.", 6, 8),
    base("n3-concepts-008", "concepts", "crescendo", "What does crescendo instruct a performer to do?", A("Become gradually louder", "Become gradually quieter", "Play short notes", "Play more slowly"), "a", "A crescendo is a gradual increase in volume.", "Think about a sound growing in strength.", 6, 8, { preferredFiftyFiftyDistractor: "b" }),
    base("n3-concepts-009", "concepts", "staccato", "Which description matches staccato?", A("Short and detached", "Smooth and connected", "Gradually louder", "Very slow"), "a", "Staccato notes are performed short and detached from one another.", "This is about how separate notes are connected, not speed or volume.", 6, 8, { preferredFiftyFiftyDistractor: "b" }),

    base("n3-concepts-010", "concepts", "percussion-family", "Which instrument is normally played by striking or shaking it?", A("Tambourine", "Oboe", "Cello", "French horn"), "a", "A tambourine is a percussion instrument played by striking or shaking it.", "Consider how the sound of each instrument is started.", 9, 10),
    base("n3-concepts-011", "concepts", "melody-and-accompaniment", "What is melody and accompaniment?", A("A main tune supported by other music", "Everyone performing the same notes", "A repeated short pattern only", "Music without a melody"), "a", "Melody and accompaniment has one main tune supported by another musical part.", "Identify which answer gives different roles to the musical parts.", 9, 10),
    base("n3-concepts-012", "concepts", "diminuendo", "Which statement describes a diminuendo?", A("The music gradually becomes quieter", "The music gradually becomes louder", "The tempo becomes faster", "The melody moves higher"), "a", "A diminuendo is a gradual decrease in volume.", "Dynamics describe volume, not tempo or pitch direction.", 9, 10, { preferredFiftyFiftyDistractor: "b" }),

    base("n3-concepts-013", "concepts", "unison", "Which classroom performance is in unison?", A("Everyone sings the same melody together", "One group sings a tune while another plays chords", "A drum repeats a pattern under a different melody", "Each pupil improvises different notes"), "a", "Unison means performers sing or play the same melody at the same time.", "Ask whether the performers share one musical line or have different parts.", 11, 12),
    base("n3-concepts-014", "concepts", "ostinato", "Which description is an ostinato?", A("A short musical pattern repeated several times", "A melody moving from low to high once", "Two performers playing the same melody", "A gradual change in volume"), "a", "An ostinato is a short melodic or rhythmic pattern that repeats persistently.", "Look for both a short pattern and repeated use.", 13, 14),
    base("n3-concepts-015", "concepts", "texture-and-pattern", "A class sings one melody together while a xylophone repeats the same four-note pattern underneath. Which pair of concepts is present?", A("Unison and ostinato", "Melody and accompaniment only", "Crescendo and diminuendo", "Step and leap only"), "a", "The singers perform one melody together in unison, while the repeating xylophone pattern is an ostinato.", "Identify one concept for the singers and a separate concept for the xylophone.", 15, 15, { preferredFiftyFiftyDistractor: "b" }),
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

  // Questions are ordered from easiest to hardest. A pool can contain more than
  // five questions; the game chooses the five it needs for each difficulty.
  function splitExistingQuestions(questions, questionsPerDifficulty = 5) {
    return {
      easy: questions.slice(0, questionsPerDifficulty).map((question) => prepareQuestion(question, "easy")),
      medium: questions.slice(questionsPerDifficulty, questionsPerDifficulty * 2).map((question) => prepareQuestion(question, "medium")),
      hard: questions.slice(questionsPerDifficulty * 2, questionsPerDifficulty * 3).map((question) => prepareQuestion(question, "hard")),
    };
  }

  function groupQuestionsByDifficultyRange(questions) {
    return Object.fromEntries(Object.entries(DIFFICULTIES).map(([difficulty, range]) => [difficulty,
      questions
        .filter((question) => question.difficultyMin === range.min && question.difficultyMax === range.max)
        .map((question) => prepareQuestion(question, difficulty)),
    ]));
  }

  function createPlaceholder(level, difficulty, category, number) {
    const levelDetails = LEVELS[level];
    const range = DIFFICULTIES[difficulty];
    const paddedNumber = String(number).padStart(2, "0");
    const prompt = `Placeholder: ${levelDetails.label} ${difficulty} ${CATEGORY_NAMES[category]} question ${number}`;
    const question = {
      id: `${levelDetails.slug}-${difficulty}-${category}-${paddedNumber}`,
      level,
      difficulty,
      category,
      concept: "placeholder",
      question: prompt,
      prompt,
      answers: A("Answer A", "Answer B", "Answer C", "Answer D"),
      correctAnswer: "a",
      explanation: "Placeholder explanation. Replace this when the final question is added.",
      tip: "Placeholder hint. Replace this when the final question is added.",
      difficultyMin: range.min,
      difficultyMax: range.max,
      type: category === "listening" ? "audio" : "text",
      audioSrc: "",
      notationData: null,
      placeholder: true,
    };
    if (category === "listening") question.audio = { src: "", generator: null, placeholder: true };
    return question;
  }

  function createPlaceholderLevel(level) {
    return Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty,
      Object.fromEntries(Object.keys(CATEGORY_NAMES).map((category) => [category,
        Array.from({ length: 5 }, (_, index) => createPlaceholder(level, difficulty, category, index + 1)),
      ])),
    ]));
  }

  const n3Listening = splitExistingQuestions(listening);
  const n3Literacy = groupQuestionsByDifficultyRange(literacy);
  const n3Concepts = splitExistingQuestions(concepts);
  const n4LiteracyPools = groupQuestionsByDifficultyRange(n4Literacy);
  // Replace a createPlaceholderLevel(...) entry with real pools when that
  // course's final questions are ready. No game-engine change will be needed.
  const questionPools = {
    N3: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: n3Listening[difficulty],
      literacy: n3Literacy[difficulty],
      concepts: n3Concepts[difficulty],
    }])),
    N4: Object.fromEntries(Object.keys(DIFFICULTIES).map((difficulty) => [difficulty, {
      listening: [],
      literacy: n4LiteracyPools[difficulty],
      concepts: [],
    }])),
    N5: createPlaceholderLevel("N5"),
    H: createPlaceholderLevel("H"),
    AH: createPlaceholderLevel("AH"),
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
