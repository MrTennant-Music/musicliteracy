(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2019/${String(track).padStart(2, "0")} Track ${track}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "A cappella music is sung without instrumental accompaniment.",
    q1b: "A tenor is a high adult male voice; a baritone lies between tenor and bass.",
    q1c: "A chorus is a recurring section of a song; a major key is based on a major scale.",
    q1d: "The chord sequence is I–VI–IV–V: F–Dm–B flat–C.",
    q1e: "Gospel is religious vocal music rooted in Christian worship.",
    q1f: "A Gaelic psalm is an unaccompanied Gaelic song led by a precentor, with the congregation following.",
    q2a: "The pulse is grouped into recurring groups of two or four beats.",
    q2b: "An accordion, flute or whistle plays the melody with the fiddle.",
    q2c: "Arco means to play a string instrument with the bow.",
    q2d: "Syllabic word setting gives one note to each syllable.",
    q3a: "One sharp in the key signature and a tonal centre of G indicate G major.",
    q3b: "A 3/4 time signature means there are three crotchet beats in each bar.",
    q3c: "The note marked X is B, written as a minim.",
    q3d: "The missing notes are D dotted quaver, B semiquaver and G crotchet.",
    q3e: "The four corrected notes in bar 7 are all semiquavers.",
    q3f: "An imperfect cadence ends on chord V and sounds unfinished.",
    q4a: "Distortion deliberately changes an electric instrument's sound to make it rougher or more aggressive.",
    q4b: "Minimalist music develops short repeated patterns through gradual change.",
    q4c: "A ground bass is a bass pattern which repeats throughout a piece.",
    q4d: "A change of key, or modulation, moves the music to a different key.",
    q4e: "Accelerando means gradually getting faster.",
    q4f: "A whole-tone scale is made entirely from whole-tone steps.",
    q4g: "Hi-hat cymbals are two cymbals mounted together and controlled by a pedal.",
    q5a: "Minor tonality is based on a minor scale and commonly has a darker character.",
    q5b: "Moderato means at a moderate speed.",
    q5c: "The tuba is the lowest-pitched orchestral brass instrument.",
    q5d: "A concerto features a solo instrument accompanied by an orchestra.",
    q6a: "A xylophone or marimba is a tuned percussion instrument with bars arranged by pitch.",
    q6b: "An inverted pedal is a repeated or sustained high note above changing harmony.",
    q6c: "Electric, rhythm or lead guitar contrasts with the bass guitar.",
    q7a1: "Indian classical music commonly features instruments such as sitar and tabla.",
    q7a2: "The sitar is a plucked string instrument and the tabla is a pair of hand drums used in Indian music.",
    q7b1: "A bothy ballad is a Scottish work song associated with farm labourers in north-east Scotland.",
    q7b2: "Bothy ballads are usually solo male, strophic songs in Scots dialect about farming or work.",
  };

  const paper = {
    id: "national5-2019",
    title: "National 5 Music 2019",
    level: "National 5",
    levelCode: "N5",
    year: 2019,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2019/01 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2019/N5_Music_QP_2019.pdf",
    markingInstructionsPath: "../exampapers/n5/2019/mi_N5_Music_mi_2019.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 7, topic: "Vocal music", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.44 }, { label: "(b)", time: 67.36 }, { label: "(c)", time: 113.0 },
          { label: "(d)", time: 205.7 }, { label: "(e)", time: 324.86 }, { label: "(f)", time: 365.78 },
        ])] },
        intro: "This question is about vocal music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["A cappella", "Aria", "Descant", "Rapping"].map(x => option(x)), answer: "A cappella" },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and, in the space provided, name the type of voice featured.", acceptedAnswers: ["tenor", "baritone", "bari tone"], answerDisplay: "Tenor or baritone" },
          { id: "q1c", label: "(c)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a different piece of music and tick two boxes to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to a different piece of music and tick two boxes to describe what you hear.", "The excerpt will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Round", "Chorus", "Coda", "Major key", "Ritardando"].map(x => option(x)), answers: ["Chorus", "Major key"] },
          { id: "q1d", label: "(d)", marks: 1, type: "radio", prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of F major. You will hear the music twice, with a pause of 10 seconds between playings. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of F major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "F C Dm B♭" },
            { value: "I V IV VI", label: "I V IV VI", secondaryLabel: "F C B♭ Dm" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "F Dm B♭ C" },
          ], answer: "I VI IV V" },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and, in the space provided, name the style of the music.", acceptedAnswers: ["gospel", "gospel music"], answerDisplay: "Gospel" },
          { id: "q1f", label: "(f)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Waulking song", "Scots ballad", "Gaelic psalm", "Celtic rock"].map(x => option(x)), answer: "Gaelic psalm" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [audio(3, [
          { label: "1st", time: 98.08 }, { label: "2nd", time: 187.26 }, { label: "3rd", time: 278.7 },
        ])] },
        intro: [
          "In this question you will hear a piece of Scottish music.",
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
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "There are beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "two", "4", "four", "2/4", "4/4"], answerDisplay: "2 or 4 (2/4 or 4/4)" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The melody is played by the fiddle and", inlineAnswer: { before: "The melody is played by the fiddle and", after: "" }, acceptedAnswers: ["accordion", "flute", "whistle"], answerDisplay: "Accordion, flute or whistle" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The fiddle playing technique is (Italian term)", inlineAnswer: { before: "The fiddle playing technique is", after: "(Italian term)" }, acceptedAnswers: ["arco"], answerDisplay: "Arco" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The word setting is mainly", inlineAnswer: { before: "The word setting is mainly", after: "" }, acceptedAnswers: ["syllabic", "syllabic word setting", "silabic"], answerDisplay: "Syllabic" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 12.1 }, { label: "1st", time: 121.28 }, { label: "2nd", time: 178.68 }, { label: "3rd", time: 234.7 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have one minute to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "G major", bars: 8, sharedNotation: "n5-2019-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this music [answer].", inlineAnswer: { before: "Name the key of this music", after: "." }, acceptedAnswers: ["g", "g major", "g maj"], answerDisplay: "G, G major or G maj" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "3/4", answerDisplay: "3/4" },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the note marked X in bar 1 [answer].", inlineAnswer: { before: "Name the note marked X in bar 1", after: "." }, acceptedAnswers: ["b", "b4", "b minim", "minim"], answerDisplay: "B or minim" },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 4 using the rhythm provided.", options: [], noteSlots: 3, answer: "D5,B4,G4", answerDisplay: "D dotted quaver, B semiquaver and G crotchet" },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", prompt: "Correct the rhythm in bar 7.", options: [option("quaver", "Quaver"), option("dottedCrotchet", "Dotted crotchet"), option("semiquaver", "Semiquaver")], noteSlots: 4, answer: "semiquaver,semiquaver,semiquaver,semiquaver", answerDisplay: "D, C, B and C as four semiquavers" },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the cadence at the end of the excerpt [answer].", inlineAnswer: { before: "Name the cadence at the end of the excerpt", after: "." }, allowAnswerInPhrase: true, acceptedAnswers: ["imperfect", "imperfect cadence", "i v", "i to v", "1 5", "1 to 5"], answerDisplay: "Imperfect cadence (I–V)" },
        ],
      },
      {
        id: "q4", number: "4", marks: 7, topic: "Music in different styles", audio: { clips: [audio(5, [
          { label: "(a)", time: 6.92 }, { label: "(b)", time: 48.68 }, { label: "(c)", time: 84.78 },
          { label: "(d)", time: 173.7 }, { label: "(e)", time: 253.28 }, { label: "(f)", time: 331.82 }, { label: "(g)", time: 377.3 },
        ])] },
        intro: "This question features music in different styles.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Flutter tonguing", "Distortion", "Rubato", "Walking bass"].map(x => option(x)), answer: "Distortion" },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to another excerpt and name the style.", acceptedAnswers: ["minimalist", "minimalism", "minimal", "minimalist music"], answerDisplay: "Minimalist, minimalism or minimal" },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The excerpt will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Rondo", "Pitch bend", "Ground bass", "Glissando"].map(x => option(x)), answer: "Ground bass" },
          { id: "q4d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe a feature of the music. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe a feature of the music.", "The excerpt will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Cadenza", "Change of key", "Pedal", "Rock ‘n’ roll"].map(x => option(x)), answer: "Change of key" },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", prompt: "Listen to another piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rallentando", "Cross rhythms", "Accelerando", "Diminuendo"].map(x => option(x)), answer: "Accelerando" },
          { id: "q4f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and, in the space provided, name the scale featured in the music.", acceptedAnswers: ["whole tone", "whole tone scale", "wholetone", "wholetone scale"], answerDisplay: "Whole-tone" },
          { id: "q4g", label: "(g)", marks: 1, type: "radio", prompt: "Listen to another piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rolls", "Scat singing", "Hi-hat cymbals", "Castanets"].map(x => option(x)), answer: "Hi-hat cymbals" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 87.76 }, { label: "2nd", time: 138.78 }, { label: "3rd", time: 189.8 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of orchestral music which will be played three times.",
          "Tick one answer only in each of the four sections.", "Melody/harmony", "Rhythm/tempo", "Solo instrument", "Style", "",
          "You now have one minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Melody/harmony", "Rhythm/tempo", "Solo instrument", "Style"],
        introBulletRange: [2, 5],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Melody/harmony", marks: 1, type: "radio", prompt: "Melody/harmony", instruction: "Tick one box from this selection", options: ["Drone", "Inverted pedal", "Minor key"].map(x => option(x)), answer: "Minor key" },
          { id: "q5b", label: "Rhythm/tempo", marks: 1, type: "radio", prompt: "Rhythm/tempo", instruction: "Tick one box from this selection", options: ["Adagio", "Moderato", "9/8"].map(x => option(x)), answer: "Moderato" },
          { id: "q5c", label: "Solo instrument", marks: 1, type: "radio", prompt: "Solo instrument", instruction: "Tick one box from this selection", options: ["Bassoon", "Trumpet", "Tuba"].map(x => option(x)), answer: "Tuba" },
          { id: "q5d", label: "Style", marks: 1, type: "radio", prompt: "Style", instruction: "Tick one box from this selection", options: ["Pibroch", "Concerto", "Symphony"].map(x => option(x)), answer: "Concerto" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 54.88 }, { label: "2nd", time: 117.7 },
        ])] },
        intro: [
          "In this question you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
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
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The tuned percussion instrument featured at the beginning of the excerpt is a/an [answer].", inlineAnswer: { before: "The tuned percussion instrument featured at the beginning of the excerpt is a/an", after: "." }, acceptedAnswers: ["xylophone", "marimba"], answerDisplay: "Xylophone or marimba" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "When the violins enter they play a/an [answer].", inlineAnswer: { before: "When the violins enter they play a/an", after: "." }, acceptedAnswers: ["inverted pedal", "inverted pedal note"], answerDisplay: "Inverted pedal" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The guitars featured are bass and [answer].", inlineAnswer: { before: "The guitars featured are bass and", after: "." }, acceptedAnswers: ["electric", "electric guitar", "rhythm", "rhythm guitar", "lead", "lead guitar"], answerDisplay: "Electric, rhythm or lead" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.14 }, { label: "(b)", time: 95.1 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["African music", "Indian", "Latin American", "Reggae"].map(x => option(x)), answer: "Indian" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["sitar", "tabla", "sitar and tabla", "tabla and sitar"], acceptedKeywords: ["sitar", "tabla"], answerDisplay: "Sitar and/or tabla" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Bothy ballad", "Pibroch", "Strathspey", "Mouth music"].map(x => option(x)), answer: "Bothy ballad" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", minAcceptedConcepts: 2, acceptedConcepts: [
            { id: "male", answers: ["male", "man", "he", "his"] },
            { id: "solo-song", answers: ["solo", "unaccompanied", "singing", "song", "lyrics", "story"] },
            { id: "strophic", answers: ["strophic", "same music each verse", "verse and chorus"] },
            { id: "scottish", answers: ["scottish", "scots", "doric", "accent", "dialect", "north east", "aberdeen"] },
            { id: "work", answers: ["farming", "farm", "work", "labour"] },
          ], answerDisplay: "Any two: male; solo or unaccompanied singing, song, lyrics or story; strophic; Scottish, Doric, accent or dialect; farming or work" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 45.44 }, { label: "2nd", time: 119.68 }, { label: "3rd", time: 194.38 },
        ])] },
        intro: [
          "As you listen to this excerpt, you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Melody/harmony", "Rhythm/tempo", "Instruments", "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Melody/harmony", "Rhythm/tempo", "Instruments", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 7,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Chromatic or semitones", answers: ["chromatic", "semitone", "semitones"] },
              { label: "Discord or dissonance", answers: ["discord", "discords", "dissonance", "dissonant"] },
              { label: "Glissando or pitch bend", answers: ["glissando", "gliss", "pitch bend", "pitch bending"] },
              { label: "Inverted pedal", answers: ["inverted pedal", "inverted pedal note"] },
              { label: "Minor key", answers: ["minor", "minor key", "minor tonality"] },
              { label: "Modulation or change of key", answers: ["modulation", "modulates", "change of key", "key change"] },
              { label: "Octave leap", answers: ["octave leap", "octave jump", "leap of an octave"] },
              { label: "Repetition or ostinato", answers: ["repetition", "repeated", "repeats", "ostinato"], creditId: "repetition" },
              { label: "Sequence", answers: ["sequence", "sequences"] },
            ] },
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "Anacrusis", answers: ["anacrusis", "upbeat"] },
              { label: "Drum fills", answers: ["drum fill", "drum fills"] },
              { label: "Moderato or Andante", answers: ["moderato", "andante"] },
              { label: "Off the beat", answers: ["off the beat", "offbeat"] },
              { label: "Repetition or ostinato", answers: ["repetition", "repeated", "repeats", "ostinato"], creditId: "repetition" },
              { label: "Simple time / 2 or 4 beats / 2/4 or 4/4", answers: ["simple time", "2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "2/4", "4/4", "common time"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
            ] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Bass guitar", answers: ["bass guitar"], blockedAnswers: ["bass", "double bass"] },
              { label: "Cello", answers: ["cello", "cellos"] },
              { label: "Drum kit, cymbals or hi-hat", answers: ["drum kit", "cymbal", "cymbals", "hi hat", "hi hats", "hi-hat", "hi-hats"], alwaysBlockedAnswers: ["drums"] },
              { label: "Electric or lead guitar", answers: ["electric guitar", "lead guitar"], blockedAnswers: ["guitar", "acoustic guitar"] },
              { label: "Flute", answers: ["flute", "flutes"] },
              { label: "Saxophones, keyboard or synthesizer", answers: ["saxophone", "saxophones", "sax", "keyboard", "synthesizer", "synthesiser", "synth"] },
            ], additionalGuidance: ["Bass or double bass is not accepted for bass guitar.", "Drums is not accepted for drum kit, cymbals or hi-hat.", "Guitar or acoustic guitar is not accepted for electric guitar."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "Crescendo", answers: ["crescendo", "cresc"] },
              { label: "mf or f", answers: ["mf", "mezzo forte", "f", "forte"] },
            ], additionalGuidance: ["Full Italian terms are accepted.", "English equivalents are not accepted."] },
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
