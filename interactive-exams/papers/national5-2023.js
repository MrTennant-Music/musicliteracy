(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2023/Music N5 2023 - Track ${String(track).padStart(2, "0")}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Latin American music commonly features syncopated rhythms and characteristic percussion.",
    q1b: "Homophonic texture has one main melody supported by chords; a cappella music is sung without instrumental accompaniment.",
    q1c: "Mezzo soprano is a female voice between soprano and alto.",
    q1d: "A waulking song is a Scottish Gaelic work song traditionally sung while preparing tweed.",
    q1e: "The chord sequence is I–V–VI–IV: C–G–A minor–F.",
    q2a: "The French horn is a brass instrument with a coiled tube and a mellow tone.",
    q2b: "Arco means to play a string instrument with the bow.",
    q2c: "A trill rapidly alternates between a note and the note above it.",
    q2d: "A perfect cadence moves from chord V to chord I and sounds finished.",
    q3a: "The key signature has one flat and the music centres on F, so the key is F major.",
    q3b: "Andante means at a walking pace; Moderato means at a moderate speed.",
    q3c: "The missing notes are A and B flat, written as quavers.",
    q3d: "A dotted crotchet lasts for one and a half beats.",
    q3e: "A semitone is the smallest interval between adjacent notes in Western music.",
    q3f: "The end-repeat sign at bar 8 sends the performer back to the repeat-start sign.",
    q4a: "A Scotch snap is a short accented note followed by a longer note.",
    q4b: "An Alberti bass is a broken-chord accompaniment pattern, commonly played low–high–middle–high.",
    q4c: "Con sordino means to play with a mute.",
    q4d: "Imitation repeats an idea in another part; contrary motion moves two parts in opposite directions.",
    q4e: "A symphony is a large-scale orchestral work, usually in several movements.",
    q4f: "Accelerando means gradually getting faster.",
    q4g: "The bassoon is a low-pitched double-reed woodwind instrument.",
    q5a: "A brass band is made mainly from brass instruments and percussion.",
    q5b: "Allegro means fast and lively.",
    q5c: "A countermelody is a second melody heard alongside the main melody.",
    q5d: "A change of key, or modulation, moves the music to a different key.",
    q6a: "Syllabic word setting gives one note to each syllable.",
    q6b: "Major tonality is based on a major scale.",
    q6c: "Strophic form repeats the same music for each verse.",
    q7a1: "A chorus is performed by a choir or group of singers.",
    q7a2: "A chorus features more than one vocalist, such as a choir or group of singers.",
    q7b1: "Celtic rock combines Scottish or Celtic traditional music with rock music.",
    q7b2: "Celtic rock links traditional Celtic music or instruments with rock music or instruments.",
  };

  const paper = {
    id: "national5-2023",
    title: "National 5 Music 2023",
    level: "National 5",
    levelCode: "N5",
    year: 2023,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2023/Music N5 2023 - Track 01-1.mp3",
    sourcePath: "../exampapers/n5/2023/Music N5 2023 Paper.pdf",
    markingInstructionsPath: "../exampapers/n5/2023/Music N5 2023 Answers.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 6, topic: "Vocal music", audio: { clips: [audio(2, [
          { label: "(a)", time: 5.9 }, { label: "(b)", time: 63.74 }, { label: "(c)", time: 137.86 },
          { label: "(d)", time: 202.4 }, { label: "(e)", time: 250.44 },
        ])] },
        intro: "This question is about vocal music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Reggae", "Latin American", "African music", "Rock ‘n’ roll"].map(x => option(x)), answer: "Latin American" },
          { id: "q1b", label: "(b)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a different piece of music and tick two boxes to describe what you hear. You will hear the music twice.", promptLines: ["Listen to a different piece of music and tick two boxes to describe what you hear.", "You will hear the music twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Cross rhythms", "Sequence", "Canon", "Homophonic", "A cappella"].map(x => option(x)), answers: ["Homophonic", "A cappella"] },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and, in the space provided, name the type of voice featured.", acceptedAnswers: ["mezzo soprano", "mezzo-soprano"], answerDisplay: "Mezzo soprano" },
          { id: "q1d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, allowMusicSuffix: true, prompt: "Listen to another excerpt and write the concept which describes the style.", acceptedAnswers: ["waulking song", "waulking songs"], answerDisplay: "Waulking song" },
          { id: "q1e", label: "(e)", marks: 1, type: "radio", continuationBefore: true, prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of C major. You will hear the music twice, with a pause of 10 seconds between playings.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of C major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I IV VI V", label: "I IV VI V", secondaryLabel: "C F Am G" },
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "C G Am F" },
            { value: "I VI V IV", label: "I VI V IV", secondaryLabel: "C Am G F" },
          ], answer: "I V VI IV" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Instrumental music", audio: { clips: [audio(3, [
          { label: "1st", time: 97.94 }, { label: "2nd", time: 172.12 }, { label: "3rd", time: 245.38 },
        ])] },
        intro: [
          "In this question you will hear instrumental music.",
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
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "Two [answer] play in harmony. (name of brass instrument)", inlineAnswer: { before: "Two", after: "play in harmony. (name of brass instrument)" }, acceptedAnswers: ["french horn", "french horns", "horn", "horns"], answerDisplay: "French horn or horns" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The string playing technique is [answer] (Italian term)", inlineAnswer: { before: "The string playing technique is", after: "(Italian term)" }, acceptedAnswers: ["arco"], answerDisplay: "Arco" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The ornament played is a/an [answer].", inlineAnswer: { before: "The ornament played is a/an", after: "" }, acceptedAnswers: ["trill", "trills"], answerDisplay: "Trill" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The music ends with a/an [answer] cadence.", inlineAnswer: { before: "The music ends with a/an", after: "cadence." }, allowAnswerInPhrase: true, acceptedAnswers: ["perfect", "perfect cadence", "v to i", "5 to 1", "v-i", "5-1"], answerDisplay: "Perfect cadence (V–I or 5–1)" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 8.4 }, { label: "1st", time: 134.92 },
          { label: "2nd", time: 208.08 }, { label: "3rd", time: 280.48 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have one minute to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "F major", bars: 10, sharedNotation: "n5-2023-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this excerpt [answer].", inlineAnswer: { before: "Name the key of this excerpt", after: "." }, acceptedAnswers: ["f", "f major", "f maj"], answerDisplay: "F or F major" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write an Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Andante", acceptedAnswers: ["Andante", "Moderato"], answerDisplay: "Andante or Moderato" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 2.", options: [], noteSlots: 2, answer: "A4,Bb4", answerDisplay: "A quaver followed by B flat quaver" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", prompt: "The value of the note marked X in bar 3 is [answer] beat(s).", inlineAnswer: { before: "The value of the note marked X in bar 3 is", after: "beat(s)." }, acceptedAnswers: ["1.5", "1 1/2", "1½", "1 and a half", "one and a half"], answerDisplay: "1½ or 1.5" },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "The interval between the first two notes in bar 5 is a/an [answer].", inlineAnswer: { before: "The interval between the first two notes in bar 5 is a/an", after: "." }, acceptedAnswers: ["semitone", "2", "2nd", "second", "minor 2nd", "minor second", "major 2nd", "major second"], answerDisplay: "Semitone, 2 or any 2nd" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "repeat-sign", prompt: "Insert a repeat sign at the correct place in the music.", scoreHint: "Select the button first, then apply to the score.", options: [option("end-repeat", "End repeat")], answer: "end-bar-8", answerDisplay: "An end-repeat sign at the end of bar 8" },
        ],
      },
      {
        id: "q4", number: "4", marks: 8, topic: "Different styles", audio: { clips: [audio(5, [
          { label: "(a)", time: 6.38 }, { label: "(b)", time: 43.64 }, { label: "(c)", time: 107.6 },
          { label: "(d)", time: 164.8 }, { label: "(e)", time: 260.58 }, { label: "(f)", time: 315 },
          { label: "(g)", time: 362.8 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Waltz", "Scotch snap", "Vamp", "Walking bass"].map(x => option(x)), answer: "Scotch snap" },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Coda", "Tabla", "Cadenza", "Alberti bass"].map(x => option(x)), answer: "Alberti bass" },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Con sordino", "Flutter-tonguing", "Distortion", "Rolls"].map(x => option(x)), answer: "Con sordino" },
          { id: "q4d", label: "(d)", marks: 2, type: "checkbox", maxSelections: 2, continuationBefore: true, prompt: "Listen to a different piece of music and tick two boxes to describe what you hear. The music will be played twice.", promptLines: ["Listen to a different piece of music and tick two boxes to describe what you hear.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Whole-tone scale", "Minimalist", "Imitation", "Contrary motion", "Adagio"].map(x => option(x)), answers: ["Imitation", "Contrary motion"] },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a further excerpt from the same piece of music. Name the type of large scale orchestral work.", acceptedAnswers: ["symphony"], answerDisplay: "Symphony" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", prompt: "Listen to a new excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Accelerando", "Inverted pedal", "Compound time", "Pitch bend"].map(x => option(x)), answer: "Accelerando" },
          { id: "q4g", label: "(g)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to that excerpt again and name the solo instrument.", acceptedAnswers: ["bassoon"], answerDisplay: "Bassoon" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Instrumental music", audio: { clips: [audio(6, [
          { label: "1st", time: 83.4 }, { label: "2nd", time: 135.44 }, { label: "3rd", time: 188.38 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music which will be played three times.",
          "Tick one answer only in each of the four sections:", "Timbre", "Tempo", "Melody", "Harmony", "",
          "You now have one minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Timbre", "Tempo", "Melody", "Harmony"],
        introBulletRange: [2, 5],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Timbre", marks: 1, type: "radio", prompt: "Timbre", instruction: "Tick one box from this selection", options: ["Wind band", "Brass band", "Orchestra"].map(x => option(x)), answer: "Brass band" },
          { id: "q5b", label: "Tempo", marks: 1, type: "radio", prompt: "Tempo", instruction: "Tick one box from this selection", options: ["Allegro", "Rubato", "Ritardando"].map(x => option(x)), answer: "Allegro" },
          { id: "q5c", label: "Melody", marks: 1, type: "radio", prompt: "Melody", instruction: "Tick one box from this selection", options: ["Countermelody", "Trill", "Glissando"].map(x => option(x)), answer: "Countermelody" },
          { id: "q5d", label: "Harmony", marks: 1, type: "radio", prompt: "Harmony", instruction: "Tick one box from this selection", options: ["Pedal", "Atonal", "Change of key"].map(x => option(x)), answer: "Change of key" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 54.6 }, { label: "2nd", time: 169.08 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will be now a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings and 20 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        introBoldPhrases: ["twice"],
        introTotalMarks: 3,
        introTotalMarksIndex: 0,
        showPartMarks: false,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The word setting is [answer].", inlineAnswer: { before: "The word setting is", after: "." }, acceptedAnswers: ["syllabic", "syllabic word setting"], answerDisplay: "Syllabic" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The tonality of the music is [answer].", inlineAnswer: { before: "The tonality of the music is", after: "." }, acceptedAnswers: ["major", "major key", "major tonality"], answerDisplay: "Major" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The structure/form of the song is [answer].", inlineAnswer: { before: "The structure/form of the song is", after: "." }, acceptedAnswers: ["strophic", "strophic form", "verse and chorus", "verse chorus", "abab", "ab ab", "a b a b"], answerDisplay: "Strophic, verse and chorus, or ABAB" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.64 }, { label: "(b)", time: 85.7 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Chorus", "Gospel", "Symphony", "Aria"].map(x => option(x)), answer: "Chorus" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["choir", "group of singers", "group of vocalists", "multiple singers", "many singers", "several singers", "two singers", "singers", "vocalists"], acceptedKeywords: ["choir", "singers", "vocalists"], answerDisplay: "Choir, group of singers, or any answer implying more than one vocalist" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Indian", "Pibroch", "Celtic rock", "Pop"].map(x => option(x)), answer: "Celtic rock" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", minAcceptedConcepts: 2, acceptedConcepts: [
            { id: "traditional", answers: ["folk", "celtic", "traditional", "accordion", "tin whistle", "whistle", "bagpipe", "bagpipes", "pipes"] },
            { id: "rock", answers: ["rock", "electric guitar", "electric guitars", "drum kit", "drums", "rock band"] },
          ], answerDisplay: "A link between folk, Celtic or traditional music or instruments and rock music or instruments" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 40.36 }, { label: "2nd", time: 115.96 }, { label: "3rd", time: 192.38 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following:",
          "Rhythm", "Melody/harmony", "Instruments", "Dynamics", "",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Rhythm", "Melody/harmony", "Instruments", "Dynamics", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 8,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "Simple time / 2 or 4 beats / C / 2/4 or 4/4", answers: ["simple time", "2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "2/4", "4/4", "common time"] },
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat", "up beat", "pickup", "pick up"] },
              { label: "Pause", answers: ["pause", "pauses", "fermata"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
              { label: "Swing", answers: ["swing", "swung", "swing rhythm"] },
            ] },
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Chromatic", answers: ["chromatic", "chromaticism", "semitone", "semitones"] },
              { label: "Contrary motion", answers: ["contrary motion"] },
              { label: "Discord, cluster or dissonance", answers: ["discord", "discords", "cluster", "clusters", "dissonance", "dissonant"] },
              { label: "Glissando", answers: ["glissando", "gliss", "glissandi"] },
              { label: "Imperfect cadence", answers: ["imperfect cadence", "imperfect"], allowFuzzy: false },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Minor", answers: ["minor", "minor key", "minor tonality"] },
              { label: "Perfect cadence", answers: ["perfect cadence", "perfect"], allowFuzzy: false },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Sequence", answers: ["sequence", "sequences"] },
              { label: "Trills", answers: ["trill", "trills"] },
            ] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Clarinets", answers: ["clarinet", "clarinets"] },
              { label: "Cymbals, hi-hat or drum kit", answers: ["cymbal", "cymbals", "hi hat", "hi hats", "hi-hat", "hi-hats", "drum kit"], blockedAnswers: ["drum"], alwaysBlockedAnswers: ["drums"] },
              { label: "Double bass", answers: ["double bass", "double basses"] },
              { label: "Saxophones", answers: ["saxophone", "saxophones", "sax"] },
              { label: "Timpani or kettle drums", answers: ["timpani", "kettle drum", "kettle drums"] },
              { label: "Triangle", answers: ["triangle", "triangles"] },
              { label: "Trombones", answers: ["trombone", "trombones"] },
              { label: "Trumpets", answers: ["trumpet", "trumpets"] },
              { label: "Violins", answers: ["violins"], blockedAnswers: ["violin"] },
              { label: "Xylophone or marimba", answers: ["xylophone", "xylophones", "marimba", "marimbas"] },
            ], additionalGuidance: ["Drums alone is not accepted for drum kit, cymbals or hi-hat.", "Violin must be plural: violins."] },
            { id: "dynamics", label: "Dynamics", concepts: [
              { label: "p, mp or mf", answers: ["p", "mp", "mf", "piano", "mezzo piano", "mezzo forte"], alwaysBlockedAnswers: ["quiet", "soft", "moderately quiet", "moderately loud"] },
              { label: "f or ff", answers: ["f", "ff", "forte", "fortissimo"], alwaysBlockedAnswers: ["loud", "very loud", "mezzo forte"] },
              { label: "sfz", answers: ["sfz", "sforzando", "sforzato"] },
              { label: "Crescendo", answers: ["crescendo", "cresc"] },
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
