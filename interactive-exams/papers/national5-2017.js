(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2017/${String(track).padStart(2, "0")} Track ${track}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "A jig is a lively Scottish dance in compound time; Celtic rock combines Scottish traditional music with rock instruments and rhythms.",
    q1b: "An imperfect cadence moves from chord I to chord V and sounds unfinished.",
    q1c: "Tabla are a pair of tuned hand drums used in Indian music.",
    q1d: "A walking bass moves continuously, usually in crotchets.",
    q1e: "Contrary motion is when two melodic lines move in opposite directions.",
    q1f: "Rapping uses spoken rhythmic words over a musical backing.",
    q2a: "The pulse is grouped into recurring groups of two or four beats.",
    q2b: "Arco means to play a string instrument with the bow.",
    q2c: "Allegro means fast and lively; Moderato means at a moderate speed.",
    q2d: "A snare drum is an untuned percussion instrument with metal snares stretched across its lower head.",
    q3a: "One sharp in the key signature identifies G major.",
    q3b: "A 4/4 time signature means there are four crotchet beats in each bar.",
    q3c: "Adagio means slowly; Andante means at a walking pace.",
    q3d: "The third and fourth notes in bar 2 are a dotted crotchet followed by a quaver.",
    q3e: "The note marked X is F sharp and is written as a quaver.",
    q3f: "The missing notes are B and A, both written as quavers.",
    q4a: "A baritone is a male voice between tenor and bass.",
    q4b: "Rubato allows the performer to vary the tempo expressively.",
    q4c: "A cappella music is sung without instrumental accompaniment; syllabic setting gives one note to each syllable.",
    q4d: "An inverted pedal is a repeated or sustained high note above changing harmony.",
    q4e: "Reverb is an electronic effect which makes a sound continue after it is produced.",
    q4f: "The chord sequence is I–V–VI–IV: F–C–Dm–B flat.",
    q5a: "A clarinet is a single-reed woodwind instrument.",
    q5b: "An anacrusis is one or more notes before the first full bar.",
    q5c: "Plucking produces sound by pulling and releasing a string.",
    q5d: "Strophic form uses the same music for each verse.",
    q6a: "Major tonality is based on a major scale and commonly sounds bright.",
    q6b: "A bassoon is a low-pitched double-reed woodwind instrument.",
    q6c: "A concerto contrasts a solo instrument with an orchestra.",
    q7a1: "An aria is a solo song in an opera or oratorio.",
    q7a2: "An aria commonly features a solo voice with orchestral or string accompaniment.",
    q7b1: "Ragtime commonly features syncopation, a vamp and piano.",
    q7b2: "Syncopation places emphasis on normally unaccented beats or parts of beats.",
  };

  const paper = {
    id: "national5-2017",
    title: "National 5 Music 2017",
    level: "National 5",
    levelCode: "N5",
    year: 2017,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2017/01 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2017/N5_Music_QP_2017.pdf",
    markingInstructionsPath: "../exampapers/n5/2017/mi_N5_Music_mi_2017.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 7, topic: "Music in different styles", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.4 }, { label: "(b)", time: 96.34 }, { label: "(c)", time: 156.04 },
          { label: "(d)", time: 202.78 }, { label: "(e)", time: 248.36 }, { label: "(f)", time: 291.02 },
        ])] },
        intro: "This question is about music in different styles.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt and tick two boxes to describe features of the music.", promptLines: ["Listen to this excerpt and tick two boxes to describe features of the music.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["March", "Reel", "Jig", "Celtic rock", "Pibroch"].map(x => option(x)), answers: ["Jig", "Celtic rock"] },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new piece of music and name the cadence heard at the end of the excerpt. The excerpt is short and will be played twice.", promptLines: ["Listen to a new piece of music and name the cadence heard at the end of the excerpt. The excerpt is short and will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["imperfect cadence", "imperfect", "i to v", "1 to 5", "i-v", "1-5"], answerDisplay: "Imperfect cadence (or I to V)" },
          { id: "q1c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a different style of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Timpani", "Tabla", "Bodhran", "Bongo drums"].map(x => option(x)), answer: "Tabla" },
          { id: "q1d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to another style of music and name the type of bass line featured.", acceptedAnswers: ["walking bass", "walking", "walkin bass"], answerDisplay: "Walking bass (or walking)" },
          { id: "q1e", label: "(e)", marks: 1, type: "radio", prompt: "Listen to more music from that same piece and tick one box to describe what you hear.", promptLines: ["Listen to more music from that same piece and tick one box to describe what you hear.", "The excerpt is short and will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Contrary motion", "Atonal", "Distortion", "Trill"].map(x => option(x)), answer: "Contrary motion" },
          { id: "q1f", label: "(f)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rock", "Rock ‘n’ roll", "Rapping", "Reggae"].map(x => option(x)), answer: "Rapping" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [audio(3, [
          { label: "1st", time: 98.8 }, { label: "2nd", time: 172.76 }, { label: "3rd", time: 247.3 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music.",
          "A guide to the music has been laid out on the next page. You will see that further information is required and you should insert this in each of the four areas.",
          "There will now be a pause of one minute to allow you to read through the question.",
          "The music will be played three times, with a pause of 20 seconds between playings.",
          "In the first two playings, a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introTotalMarks: 4,
        introTotalMarksIndex: 7,
        showPartMarks: false,
        layout: "music-guide-vertical",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "There are beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "two", "4", "four", "2/4", "4/4"], answerDisplay: "2 or 4 (2/4 or 4/4)" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The playing technique of the violin is (Italian term)", inlineAnswer: { before: "The playing technique of the violin is", after: "(Italian term)" }, acceptedAnswers: ["arco", "arko"], answerDisplay: "Arco" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The tempo is (Italian term)", inlineAnswer: { before: "The tempo is", after: "(Italian term)" }, acceptedAnswers: ["allegro", "alegro", "moderato"], answerDisplay: "Allegro or Moderato" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The untuned percussion instrument playing off the beat is a/an", inlineAnswer: { before: "The untuned percussion instrument playing off the beat is a/an", after: "" }, acceptedAnswers: ["snare drum", "snare", "snare-drum"], answerDisplay: "Snare drum (or snare)" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 7.28 }, { label: "1st", time: 94.2 }, { label: "2nd", time: 154.38 }, { label: "3rd", time: 215.42 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have 30 seconds to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "G major", bars: 8, sharedNotation: "n5-2017-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this excerpt [answer].", inlineAnswer: { before: "Name the key of this excerpt", after: "." }, acceptedAnswers: ["g", "g major", "g maj"], answerDisplay: "G, G major or G maj" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", answerDisplay: "4/4" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write an Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Adagio", acceptedAnswers: ["Adagio", "Andante"], answerDisplay: "Adagio or Andante" },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", prompt: "Correct the rhythm in bar 2.", options: [option("dottedCrotchet", "Dotted crotchet"), option("quaver", "Quaver")], noteSlots: 2, answer: "dottedCrotchet,quaver", answerDisplay: "D dotted crotchet followed by D quaver" },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the note marked X in bar 3 [answer].", inlineAnswer: { before: "Name the note marked X in bar 3", after: "." }, acceptedAnswers: ["f sharp", "f#", "f♯", "quaver", "eighth note"], answerDisplay: "F sharp (F#); quaver is also accepted" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 5.", options: [], noteSlots: 2, answer: "B4,A4", answerDisplay: "B quaver followed by A quaver" },
        ],
      },
      {
        id: "q4", number: "4", marks: 7, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 7.14 }, { label: "(b)", time: 50.8 }, { label: "(c)", time: 96.62 },
          { label: "(d)", time: 143.12 }, { label: "(e)", time: 184.32 }, { label: "(f)", time: 241.2 },
        ])] },
        intro: "This question features vocal music in contrasting styles.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and name the type of voice you hear.", acceptedAnswers: ["baritone", "bari tone", "bari-tone", "bariton"], answerDisplay: "Baritone" },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to that excerpt again and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Descant", "Rubato", "Coda", "Alberti bass"].map(x => option(x)), answer: "Rubato" },
          { id: "q4c", label: "(c)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a new excerpt and tick two boxes to describe what you hear.", boldPhrases: ["two"], options: ["Gospel", "Mouth music", "Glissando", "A cappella", "Syllabic"].map(x => option(x)), answers: ["A cappella", "Syllabic"] },
          { id: "q4d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe a feature of the music.", boldPhrases: ["one"], options: ["Whole tone scale", "Inverted pedal", "Middle 8", "Scat singing"].map(x => option(x)), answer: "Inverted pedal" },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and name the electronic effect that you hear.", promptLines: ["Listen to this excerpt and name the electronic effect that you hear.", "The excerpt is short and will be played twice.", "Here it is for the first time.", "Here it is for the second time."], acceptedAnswers: ["reverb", "reverberation", "reverbertion"], answerDisplay: "Reverb" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", continuationBefore: true, prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of F major. You will hear the music twice, with a pause of 10 seconds between playings. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of F major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "F C Dm B♭" },
            { value: "I IV V VI", label: "I IV V VI", secondaryLabel: "F B♭ C Dm" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "F Dm B♭ C" },
          ], answer: "I V VI IV" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 83.07 }, { label: "2nd", time: 187.11 }, { label: "3rd", time: 289.81 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of vocal music which will be played three times.",
          "Tick one answer only in each of the four sections.", "", "Instrument", "Rhythm", "Timbre", "Structure/form", "",
          "You now have 1 minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Instrument", "Rhythm", "Timbre", "Structure/form"],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Instrument", marks: 1, type: "radio", prompt: "Instrument", instruction: "Tick one box from this selection", options: ["Oboe", "Clarinet", "Bassoon"].map(x => option(x)), answer: "Clarinet" },
          { id: "q5b", label: "Rhythm", marks: 1, type: "radio", prompt: "Rhythm", instruction: "Tick one box from this selection", options: ["Anacrusis", "Compound time", "Cross rhythms"].map(x => option(x)), answer: "Anacrusis" },
          { id: "q5c", label: "Timbre", marks: 1, type: "radio", prompt: "Timbre", instruction: "Tick one box from this selection", options: ["Flutter tonguing", "Rolls", "Plucking"].map(x => option(x)), answer: "Plucking" },
          { id: "q5d", label: "Structure/form", marks: 1, type: "radio", prompt: "Structure/form", instruction: "Tick one box from this selection", options: ["Rondo", "Strophic", "Canon"].map(x => option(x)), answer: "Strophic" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 54.92 }, { label: "2nd", time: 133.38 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings and 20 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        introBoldPhrases: ["twice"],
        showPartMarks: false,
        totalMarksOnLastPart: true,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The tonality of this excerpt is [answer].", inlineAnswer: { before: "The tonality of this excerpt is", after: "." }, acceptedAnswers: ["major", "major key", "major tonality", "majour"], answerDisplay: "Major" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The solo instrument is a/an [answer]", inlineAnswer: { before: "The solo instrument is a/an", after: "" }, acceptedAnswers: ["bassoon", "basoon", "basson"], answerDisplay: "Bassoon" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "and the type of work is a/an [answer].", inlineAnswer: { before: "and the type of work is a/an", after: "." }, acceptedAnswers: ["concerto", "concertto", "concherto"], answerDisplay: "Concerto" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 5.96 }, { label: "(b)", time: 97.7 },
        ])] },
        intro: "This question features two contrasting excerpts.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Chorus", "Baroque", "Aria", "Symphony"].map(x => option(x)), answer: "Aria" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedKeywordGroups: [["solo", "voice", "orchestra"], ["solo", "voice", "strings"], ["voice", "orchestra"], ["voice", "strings"], ["solo", "song", "opera"], ["voice", "operatic", "style"]], answerDisplay: "Solo voice with orchestra/strings, solo song in opera, or voice in an operatic style" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Minimalist", "Ragtime", "Classical", "Blues"].map(x => option(x)), answer: "Ragtime" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedKeywords: ["syncopation", "syncopated"], acceptedKeywordGroups: [["piano", "vamp"]], answerDisplay: "Syncopation, or piano and vamp" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 42.62 }, { label: "2nd", time: 117.2 }, { label: "3rd", time: 191.82 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Rhythm/tempo", "Melody/harmony", "Instruments", "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Rhythm/tempo", "Melody/harmony", "Instruments", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "2 or 4 beats in the bar / 2/4 / 4/4 / simple time", answers: ["2 beats in the bar", "2 beats in a bar", "2 beats per bar", "two beats in the bar", "two beats in a bar", "two beats per bar", "4 beats in the bar", "4 beats in a bar", "4 beats per bar", "four beats in the bar", "four beats in a bar", "four beats per bar", "2/4", "4/4", "simple time"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
              { label: "Allegro", answers: ["allegro"] },
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
            ] },
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Ornaments (turns or mordents)", answers: ["ornament", "ornaments", "ornamentation", "turn", "turns", "mordent", "mordents"] },
              { label: "Trill(s)", answers: ["trill", "trills"] },
              { label: "Modulation", answers: ["modulation", "modulates", "modulated"] },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Sequence", answers: ["sequence", "sequences"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
            ], additionalGuidance: ["Key change is not accepted for modulation.", "Repetition can only gain one mark across Rhythm/tempo and Melody/harmony."] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Flutes", answers: ["flutes", "fluts"], allowFuzzy: false, alwaysBlockedAnswers: ["flute"] },
              { label: "Violins", answers: ["violins", "violns"], allowFuzzy: false, alwaysBlockedAnswers: ["violin"] },
              { label: "Harpsichord", answers: ["harpsichord", "electronic piano", "keyboard", "synthesiser", "synthesizer"] },
              { label: "Electric guitar or bass guitar", answers: ["electric guitar", "bass guitar"], blockedAnswers: ["guitar"] },
              { label: "Drumkit", answers: ["drumkit", "drum kit", "snare", "snare drum"], blockedAnswers: ["drum", "drums"] },
            ], additionalGuidance: ["Flute and violin must be plural.", "Guitar, drum and drums are not accepted on their own."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "mf or f", answers: ["mf", "mezzo forte", "f", "forte"] },
              { label: "Crescendo", answers: ["crescendo", "cresc", "<", "＜"] },
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
