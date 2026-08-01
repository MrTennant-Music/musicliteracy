(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2024/Music N5 2024 - Track ${String(track).padStart(2, "0")}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Reggae commonly features off-beat chords, syncopation and a strong bass line.",
    q1b: "Con sordino means to play with a mute; here the muted instrument is a trumpet.",
    q1c: "A walking bass is a continuously moving bass line, commonly heard in jazz and blues.",
    q1d: "A pitch bend raises or lowers a sounding note smoothly.",
    q1e: "The chord sequence is I-IV-VI-V: C-F-A minor-G.",
    q1f: "Distortion electronically changes a sound by adding a rough or overdriven quality.",
    q2a: "Alto is a low female singing voice; mezzo soprano lies between soprano and alto.",
    q2b: "Syllabic word setting gives one note to each syllable.",
    q2c: "Rallentando or ritardando means gradually getting slower; a tempo means returning to the original speed.",
    q2d: "A chromatic scale moves by semitone steps.",
    q3a: "Andante means at a walking pace; Moderato means at a moderate speed.",
    q3b: "The music contains four crotchet beats in each bar, so the time signature is 4/4 or common time.",
    q3c: "The outlined notes A, C and E form an A minor chord, chord I in A minor.",
    q3d: "The missing notes are E then D, written as quavers.",
    q3e: "The note marked X is E, written as a minim.",
    q3f: "Piano and mezzo piano are appropriate quiet dynamics for this passage.",
    q4a: "A vamp is a short repeated accompaniment pattern; a Scotch snap is a short accented note followed by a longer note.",
    q4b: "A jig is a lively Scottish dance in compound time.",
    q4c: "Minimalist music develops short repeated patterns through gradual change.",
    q4d: "An inverted pedal is a repeated or sustained high note; the French horn is a mellow-sounding brass instrument.",
    q4e: "Homophonic texture has one main melody supported by chords.",
    q4f: "An imperfect cadence ends on chord V and sounds unfinished.",
    q5a: "The bodhran is a handheld Irish frame drum.",
    q5b: "The time signature 6/8 has two dotted-crotchet beats in each bar.",
    q5c: "A change of key, or modulation, moves the music to a different key.",
    q5d: "Strophic form repeats the same music for each verse.",
    q6a: "The recorder is a woodwind instrument played by blowing through a mouthpiece and covering finger holes.",
    q6b: "The pulse is grouped into recurring groups of two or four beats.",
    q6c: "Baroque music dates from approximately 1600-1750; a concerto features a solo instrument with an ensemble.",
    q7a1: "A Scots ballad is a Scottish narrative song, commonly sung in Scots and accompanied by instruments.",
    q7a2: "A Scots ballad combines singing or lyrics with features such as storytelling, Scots language or accent, accompaniment or strophic form.",
    q7b1: "An aria is a solo song in an opera or oratorio.",
    q7b2: "An aria commonly features one singer accompanied by an orchestra or strings in an operatic style.",
  };

  const paper = {
    id: "national5-2024",
    title: "National 5 Music 2024",
    level: "National 5",
    levelCode: "N5",
    year: 2024,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2024/Music N5 2024 - Track 01-1.mp3",
    sourcePath: "../exampapers/n5/2024/Music N5 2024 Paper.pdf",
    markingInstructionsPath: "../exampapers/n5/2024/Music N5 2024 Answers.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 6, topic: "Vocal music", audio: { clips: [audio(2, [
          { label: "(a)", time: 5.54 }, { label: "(b)", time: 51.86 }, { label: "(c)", time: 114.24 },
          { label: "(d)", time: 164 }, { label: "(e)", time: 210.64 }, { label: "(f)", time: 310.68 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Gospel", "Rock ‘n’ roll", "Reggae", "Blues"].map(x => option(x)), answer: "Reggae" },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and identify the instrument playing con sordino. The excerpt is short and will be played twice.", promptLines: ["Listen to this excerpt and identify the instrument playing con sordino.", "The excerpt is short and will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], acceptedAnswers: ["trumpet", "muted trumpet"], answerDisplay: "Trumpet or muted trumpet" },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to another excerpt in the same style and name the type of bass line featured.", acceptedAnswers: ["walking bass", "walking"], answerDisplay: "Walking bass or walking" },
          { id: "q1d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to this excerpt. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Pitch bend", "A cappella", "Accelerando", "Scat singing"].map(x => option(x)), answer: "Pitch bend" },
          { id: "q1e", label: "(e)", marks: 1, type: "radio", continuationBefore: true, prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of C major. You will hear the music twice, with a pause of 10 seconds between playings.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of C major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I IV VI V", label: "I IV VI V", secondaryLabel: "C F Am G" },
            { value: "I V IV VI", label: "I V IV VI", secondaryLabel: "C G F Am" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "C Am F G" },
          ], answer: "I IV VI V" },
          { id: "q1f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to the guitar in this excerpt and name the electronic effect that you hear.", acceptedAnswers: ["distortion", "distorted"], answerDisplay: "Distortion" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Vocal music", audio: { clips: [audio(3, [
          { label: "1st", time: 95.82 }, { label: "2nd", time: 183.32 }, { label: "3rd", time: 270.7 },
        ])] },
        intro: [
          "In this question you will hear vocal music.",
          "A guide to the music has been laid out on the following page. You will see that further information is required and you should insert this in each of the four areas.",
          "There will now be a pause of one minute to allow you to read through the question.",
          "The music will be played three times, with a pause of 20 seconds between playings.",
          "In the first two playings, a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "music-guide-vertical",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The type of voice is a/an [answer].", inlineAnswer: { before: "The type of voice is a/an", after: "" }, acceptedAnswers: ["alto", "mezzo soprano", "mezzo-soprano"], answerDisplay: "Alto or mezzo soprano" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The word setting is mainly [answer].", inlineAnswer: { before: "The word setting is mainly", after: "" }, acceptedAnswers: ["syllabic", "syllabic word setting"], answerDisplay: "Syllabic" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "Identify the change of tempo [answer] (Italian term)", inlineAnswer: { before: "Identify the change of tempo", after: "(Italian term)" }, acceptedAnswers: ["rallentando", "rall", "rall.", "ritardando", "rit", "rit.", "a tempo"], answerDisplay: "Rallentando, rall, ritardando, rit or a tempo" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The descending scale in the accompaniment is [answer].", inlineAnswer: { before: "The descending scale in the accompaniment is", after: "" }, acceptedAnswers: ["chromatic", "chromatic scale"], answerDisplay: "Chromatic or chromatic scale" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 7.44 }, { label: "1st", time: 114.56 }, { label: "2nd", time: 169.68 }, { label: "3rd", time: 225.4 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have one minute to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "A minor", bars: 8, sharedNotation: "n5-2024-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write the Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Andante", acceptedAnswers: ["Andante", "Moderato"], answerDisplay: "Andante or Moderato" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", acceptedAnswers: ["4/4", "C", "common time"], answerDisplay: "4/4 or common time (C)" },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the chord outlined in bar 1 [answer].", inlineAnswer: { before: "Name the chord outlined in bar 1", after: "." }, acceptedAnswers: ["a minor", "am", "chord i", "i"], answerDisplay: "A minor, Am or chord I" },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 3.", options: [], noteSlots: 2, answer: "E5,D5", answerDisplay: "E quaver followed by D quaver" },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the note marked ‘X’ in bar 6 [answer].", inlineAnswer: { before: "Name the note marked ‘X’ in bar 6", after: "." }, acceptedAnswers: ["e", "e5", "e minim", "minim"], answerDisplay: "E or minim" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "dynamic", prompt: "Insert an appropriate dynamic (Italian term) below the note in bar 8.", scoreHint: "Select a button to apply it to the score.", options: [option("p"), option("mp"), option("mf"), option("sfz")], answer: "mp", acceptedAnswers: ["mp", "mezzo piano", "p", "piano"], answerDisplay: "mp, mezzo piano, p or piano" },
        ],
      },
      {
        id: "q4", number: "4", marks: 8, topic: "Different styles", audio: { clips: [audio(5, [
          { label: "(a)", time: 5.98 }, { label: "(b)", time: 74.96 }, { label: "(c)", time: 115.76 },
          { label: "(d)", time: 160.4 }, { label: "(e)", time: 264.02 }, { label: "(f)", time: 302.12 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt and tick two boxes to describe features of the music. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick two boxes to describe features of the music.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["two"], options: ["Vamp", "Rondo", "Cross rhythms", "Trill", "Scotch snap"].map(x => option(x)), answers: ["Vamp", "Scotch snap"] },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to another excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Reel", "Jig", "March", "Strathspey"].map(x => option(x)), answer: "Jig" },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a new excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Ritardando", "Indian", "Minimalist", "Drone"].map(x => option(x)), answer: "Minimalist" },
          { id: "q4d", label: "(d)", marks: 2, type: "checkbox", maxSelections: 2, continuationBefore: true, prompt: "Listen to this excerpt and tick two boxes to describe features of the music. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick two boxes to describe features of the music.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["two"], options: ["Saxophone", "Inverted pedal", "Descant", "French horn", "Pizzicato"].map(x => option(x)), answers: ["Inverted pedal", "French horn"] },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and describe the texture of the vocals.", acceptedAnswers: ["homophonic", "homophony", "homophonic texture"], answerDisplay: "Homophonic" },
          { id: "q4f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and name the cadence heard at the end. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and name the cadence heard at the end.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], allowAnswerInPhrase: true, acceptedAnswers: ["imperfect", "imperfect cadence", "ends with v", "ends on v", "ends with 5", "ends on 5"], answerDisplay: "Imperfect cadence, ending on V or 5" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Folk music", audio: { clips: [audio(6, [
          { label: "1st", time: 81.66 }, { label: "2nd", time: 171.34 }, { label: "3rd", time: 261 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of folk music which will be played three times.",
          "Tick one answer only in each of the four sections:", "Instrument", "Rhythm/tempo", "Melody/harmony", "Structure/form", "",
          "You now have one minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Instrument", "Rhythm/tempo", "Melody/harmony", "Structure/form"],
        introBulletRange: [2, 5],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Instrument", marks: 1, type: "radio", prompt: "Instrument", instruction: "Tick one box from this selection", options: ["Bodhran", "Cello", "Snare drum"].map(x => option(x)), answer: "Bodhran" },
          { id: "q5b", label: "Rhythm/tempo", marks: 1, type: "radio", prompt: "Rhythm/tempo", instruction: "Tick one box from this selection", options: ["Adagio", "6/8", "Rubato"].map(x => option(x)), answer: "6/8" },
          { id: "q5c", label: "Melody/harmony", marks: 1, type: "radio", prompt: "Melody/harmony", instruction: "Tick one box from this selection", options: ["Atonal", "Change of key", "Contrary motion"].map(x => option(x)), answer: "Change of key" },
          { id: "q5d", label: "Structure/form", marks: 1, type: "radio", prompt: "Structure/form", instruction: "Tick one box from this selection", options: ["Strophic", "Alberti bass", "Cadenza"].map(x => option(x)), answer: "Strophic" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 43.88 }, { label: "2nd", time: 119.98 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings and 20 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        introBoldPhrases: ["twice"],
        introTotalMarks: 3,
        introTotalMarksIndex: 0,
        showPartMarks: false,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The solo instrument is a/an [answer].", inlineAnswer: { before: "The solo instrument is a/an", after: "." }, acceptedAnswers: ["recorder"], answerDisplay: "Recorder" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "There are [answer] beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "two", "4", "four", "2/4", "4/4"], answerDisplay: "2, 4, 2/4 or 4/4" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The style/period of the music is [answer].", inlineAnswer: { before: "The style/period of the music is", after: "." }, acceptedAnswers: ["baroque", "baroque period", "baroque style", "concerto", "recorder concerto"], answerDisplay: "Baroque, concerto or recorder concerto" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 5.66 }, { label: "(b)", time: 93.2 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Bothy ballad", "Scots ballad", "Mouth music", "Pibroch"].map(x => option(x)), answer: "Scots ballad" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", minAcceptedConcepts: 2, acceptedConcepts: [
            { id: "voice", answers: ["song", "singing", "lyrics", "voice", "vocal", "vocals"] },
            { id: "story", answers: ["story", "storytelling", "narrative", "tells a story"] },
            { id: "scots", answers: ["scots", "scottish", "folk", "doric", "scottish accent", "scots accent"] },
            { id: "accompanied", answers: ["accompanied", "accompaniment", "instrument", "instruments"] },
            { id: "strophic", answers: ["strophic", "same music each verse"] },
          ], forbiddenExactKeywordGroups: [["bothy"], ["farm"], ["farming"], ["farmer"]], answerDisplay: "Any two of singing or lyrics, storytelling, Scots/Scottish/folk/accent, accompaniment, or strophic form" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Chorus", "Concerto", "Aria", "Symphony"].map(x => option(x)), answer: "Aria" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedExactKeywordGroups: [
            ["solo", "voice", "orchestra"], ["solo", "voice", "strings"], ["voice", "orchestra"], ["voice", "strings"],
            ["singer", "orchestra"], ["singer", "strings"], ["voice", "operatic"], ["singer", "operatic"],
            ["solo", "song", "opera"], ["solo", "song", "operatic"],
          ], forbiddenExactKeywordGroups: [["voices"], ["choir"], ["chorus"]], answerDisplay: "A solo voice or singer with orchestra or strings, a voice in an operatic style, or a solo song in opera" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 40.78 }, { label: "2nd", time: 132.68 }, { label: "3rd", time: 223.96 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following:",
          "Melody/harmony", "Rhythm/tempo", "Instruments", "Dynamics (Italian terms)", "",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Melody/harmony", "Rhythm/tempo", "Instruments", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 8,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Imperfect cadence / ends on V or 5", answers: ["imperfect cadence", "imperfect", "ends on v", "ends with v", "ends on 5", "ends with 5"], allowFuzzy: false },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Ostinato, riff or repetition", answers: ["ostinato", "riff", "repetition", "repeated", "repeats"], creditId: "ostinato-riff-repetition" },
              { label: "Perfect cadence / V-I or 5-1", answers: ["perfect cadence", "perfect", "v i", "v to i", "5 1", "5 to 1"], allowFuzzy: false },
              { label: "Question and answer", answers: ["question and answer", "call and response"] },
              { label: "Sequence", answers: ["sequence", "sequences"] },
            ] },
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "Simple time / 2 or 4 beats / C / cut common / 2/2 / 2/4 / 4/4", answers: ["simple time", "2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "common time", "cut common", "2/2", "2/4", "4/4"] },
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Allegro or Andante", answers: ["allegro", "andante"], alwaysBlockedAnswers: ["moderato"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat", "up beat", "pickup", "pick up"] },
              { label: "Cross rhythms", answers: ["cross rhythm", "cross rhythms", "cross-rhythm", "cross-rhythms"] },
              { label: "Drum fills", answers: ["drum fill", "drum fills"], blockedAnswers: ["fill", "fills"] },
              { label: "Ostinato, riff or repetition", answers: ["ostinato", "riff", "repetition", "repeated", "repeats"], creditId: "ostinato-riff-repetition" },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
            ] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Bongo drums", answers: ["bongo", "bongos", "bongo drum", "bongo drums"] },
              { label: "Double bass", answers: ["double bass", "double basses"], blockedAnswers: ["bass"] },
              { label: "Drum kit", answers: ["drum kit"], blockedAnswers: ["drum"], alwaysBlockedAnswers: ["drums"] },
              { label: "Guiro or cowbell", answers: ["guiro", "guiros", "cowbell", "cow bell"] },
              { label: "Piano", answers: ["piano"], excludeWithinAnswers: ["mezzo piano"] },
              { label: "Saxophones", answers: ["saxophone", "saxophones", "sax", "saxes"] },
              { label: "Trumpets", answers: ["trumpet", "trumpets"] },
            ], additionalGuidance: ["Bass alone is not accepted for double bass.", "Drums alone is not accepted for drum kit."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "Crescendo", answers: ["crescendo", "cresc"] },
              { label: "mf or f", answers: ["mf", "f", "mezzo forte", "forte"], alwaysBlockedAnswers: ["moderately loud", "loud"] },
              { label: "mp", answers: ["mp", "mezzo piano"], alwaysBlockedAnswers: ["moderately quiet"] },
              { label: "Sfz or sforzando", answers: ["sfz", "sforzando", "sforzato"] },
            ], additionalGuidance: ["Full Italian terms are accepted. English equivalents are not accepted."] },
          ], answerDisplay: "One mark for each valid concept, with a maximum of two marks per heading and five marks overall. Full marks require concepts from at least three headings." },
        ],
      },
    ],
  };

  paper.questions.forEach(question => question.subquestions.forEach(subquestion => {
    subquestion.definition = definitions[subquestion.id];
  }));

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
