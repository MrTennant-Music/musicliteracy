(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2016/${String(track).padStart(2, "0")} Track ${track}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Rock ‘n’ roll developed from rhythm and blues and commonly features a strong backbeat.",
    q1b: "A walking bass moves continuously, usually in crotchets.",
    q1c: "Ragtime uses a syncopated melody over a steady accompaniment.",
    q1d: "Con sordino means played with a mute; the instruments heard are brass.",
    q1e: "A harpsichord produces sound by plucking its strings when the keys are pressed.",
    q1f: "Contrapuntal music combines independent melodic lines.",
    q2a: "The trumpet is a brass instrument with a bright, penetrating tone.",
    q2b: "Syncopation places emphasis on normally unaccented beats or parts of beats.",
    q2c: "Simple time has beats which divide naturally into two equal parts.",
    q2d: "A glissando is a rapid slide through a succession of pitches.",
    q3a: "A 3/4 time signature means there are three crotchet beats in each bar.",
    q3b: "Moderato means at a moderate speed; Andante means at a walking pace.",
    q3c: "The violins are first heard in bar 9.",
    q3d: "A tone is the interval of a second spanning two semitones.",
    q3e: "The notes F, A and C form an F major chord.",
    q3f: "The missing notes are E, D and C, using the printed crotchet, dotted crotchet and quaver rhythm.",
    q4a: "An aria is a solo song in an opera or oratorio.",
    q4b: "A bass is the lowest common male voice; syllabic setting gives one note to each syllable.",
    q4c: "A cappella music is sung without instrumental accompaniment.",
    q4d: "A bothy ballad is a Scottish work song associated with farm workers.",
    q4e: "Strophic form uses the same music for each verse.",
    q4f: "The chord sequence is I–VI–IV–V: G–Em–C–D.",
    q4g: "A change of key is also called modulation.",
    q5a: "A French horn is a brass instrument with a mellow, rounded tone.",
    q5b: "Allegro means fast and lively.",
    q5c: "A sequence repeats a musical idea at a higher or lower pitch.",
    q5d: "A concerto contrasts a solo instrument with an orchestra.",
    q6a: "Major tonality commonly sounds bright and is based on a major scale.",
    q6b: "Arco means to play a string instrument with the bow.",
    q6c: "A symphony is a large-scale work for orchestra, usually in several movements.",
    q7a1: "A jig is a lively Scottish dance in compound time.",
    q7a2: "In compound time each beat divides naturally into three equal parts.",
    q7b1: "Latin American music commonly features dance rhythms and syncopated percussion.",
    q7b2: "Syncopation, off-beat accents and cross rhythms are common Latin American features.",
  };

  const paper = {
    id: "national5-2016",
    title: "National 5 Music 2016",
    level: "National 5",
    levelCode: "N5",
    year: 2016,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2016/01 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2016/N5_Music_QP_2016.pdf",
    markingInstructionsPath: "../exampapers/n5/2016/mi_N5_Music_mi_2016.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 6, topic: "Music in different styles", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.86 }, { label: "(b)", time: 52.02 }, { label: "(c)", time: 98.16 },
          { label: "(d)", time: 142.54 }, { label: "(e)", time: 188.44 }, { label: "(f)", time: 234.64 },
        ])] },
        intro: "This question features music in different styles.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Reggae", "Ragtime", "Rock ‘n’ roll", "Gospel"].map(x => option(x)), answer: "Rock ‘n’ roll" },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to the bass in this excerpt. In the space below, identify the type of bass line featured.", acceptedAnswers: ["walking bass", "walking", "walkin bass", "walking bas"], answerDisplay: "Walking bass (or walking)" },
          { id: "q1c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a different piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Classical", "Ragtime", "Rondo", "Musical"].map(x => option(x)), answer: "Ragtime" },
          { id: "q1d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to the following excerpt. Name the family of instruments playing con sordino.", acceptedAnswers: ["brass", "brass family", "bras"], answerDisplay: "Brass" },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and name the keyboard instrument you hear.", acceptedAnswers: ["harpsichord", "harpsicord", "harpsichordd"], answerDisplay: "Harpsichord" },
          { id: "q1f", label: "(f)", marks: 1, type: "radio", prompt: "Listen to that excerpt again and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Coda", "Pedal", "Ground bass", "Contrapuntal"].map(x => option(x)), answer: "Contrapuntal" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [audio(3, [
          { label: "1st", time: 100.12 }, { label: "2nd", time: 169.02 }, { label: "3rd", time: 238.72 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music.",
          "A guide to the music has been laid out on the following page. You will see that further information is required and you should insert this in each of the four areas.",
          "There will now be a pause of one minute to allow you to read through the question.",
          "The music will be played three times, with a pause of 20 seconds between playings.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introTotalMarks: 4,
        showPartMarks: false,
        layout: "music-guide-vertical",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The instrument playing the melody is a/an", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "" }, acceptedAnswers: ["trumpet", "trumpets", "trumpit", "trumpett"], answerDisplay: "Trumpet" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "A feature of the rhythm is", inlineAnswer: { before: "A feature of the rhythm is", after: "" }, acceptedAnswers: ["syncopation", "syncopated", "syncopaton", "dotted rhythm", "dotted rhythms", "swing", "swung"], answerDisplay: "Syncopation, dotted rhythm or swing/swung" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The music is in time.", inlineAnswer: { before: "The music is in", after: "time." }, acceptedAnswers: ["simple", "simple time", "2/4", "4/4", "common time", "c"], answerDisplay: "Simple, 2/4, 4/4 or common time" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The melody features a descending", inlineAnswer: { before: "The melody features a descending", after: "" }, acceptedAnswers: ["glissando", "gliss", "glissandoo", "glisando"], answerDisplay: "Glissando (or gliss.)" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 15.28 }, { label: "1st", time: 127.98 }, { label: "2nd", time: 192.68 }, { label: "3rd", time: 257.60 },
        ])] },
        intro: [
          "You now have to answer questions relating to the guide score printed below.",
          "Listen to the excerpt and follow the music. Do not attempt to write during this playing. Here is the music.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "F major", bars: 16, sharedNotation: "n5-2016-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "3/4", answerDisplay: "3/4" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write an Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Moderato", acceptedAnswers: ["Moderato", "Andante"], answerDisplay: "Moderato or Andante" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "bar-label", prompt: "Write V above the bar where violins are first heard.", scoreHint: "Select V, then apply it above the correct bar.", options: [option("V")], answer: "bar-9", answerDisplay: "V anywhere above bar 9" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "The interval bracketed in bar 5 is a [answer].", inlineAnswer: { before: "The interval bracketed in bar 5 is a", after: "." }, acceptedAnswers: ["tone", "whole tone", "2nd", "second", "2"], answerDisplay: "Tone (whole tone or 2nd)" },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "The notes in bar 13 form the chord of [answer] major.", inlineAnswer: { before: "The notes in bar 13 form the chord of", after: "major." }, acceptedAnswers: ["f"], answerDisplay: "F major" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", prompt: "Insert the missing notes in bar 15 using the rhythm provided.", options: [], noteSlots: 3, answer: "E5,D5,C5", answerDisplay: "E crotchet, D dotted crotchet and C quaver" },
        ],
      },
      {
        id: "q4", number: "4", marks: 8, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 8.18 }, { label: "(b)", time: 48.70 }, { label: "(c)", time: 104.86 }, { label: "(d)", time: 146.30 },
          { label: "(e)", time: 197.22 }, { label: "(f)", time: 245.34 }, { label: "(g)", time: 326.32 },
        ])] },
        intro: "This question features vocal music in contrasting styles.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Aria", "Chorus", "Descant", "Atonal"].map(x => option(x)), answer: "Aria" },
          { id: "q4b", label: "(b)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to another excerpt and tick two boxes to describe features of the music.", boldPhrases: ["two"], options: ["Tenor", "Bass", "Alto", "Melismatic", "Syllabic"].map(x => option(x)), answers: ["Bass", "Syllabic"] },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "As you listen to this excerpt tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Mouth music", "Flutter tonguing", "A cappella", "Whole tone scale"].map(x => option(x)), answer: "A cappella" },
          { id: "q4d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt in a Scottish style and identify the type of vocal music you hear.", allowMusicSuffix: true, acceptedAnswers: ["bothy ballad", "bothy balad", "bothy-ballad"], answerDisplay: "Bothy ballad" },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", prompt: "Listen to that excerpt again and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Scat singing", "Chromatic", "Strophic", "Compound time"].map(x => option(x)), answer: "Strophic" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", continuationBefore: true, prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of G major. You will hear the excerpt twice, with a pause of 10 seconds between playings. Here is the excerpt for the first time. Here is the excerpt for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of G major.", "You will hear the excerpt twice, with a pause of 10 seconds between playings.", "", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "G D Em C" },
            { value: "I IV V VI", label: "I IV V VI", secondaryLabel: "G C D Em" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "G Em C D" },
          ], answer: "I VI IV V" },
          { id: "q4g", label: "(g)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Drone", "Adagio", "Change of key", "Alberti bass"].map(x => option(x)), answer: "Change of key" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 84.80 }, { label: "2nd", time: 148.68 }, { label: "3rd", time: 200.14 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music which will be played three times.",
          "Tick one answer only in each of the four sections.", "", "Solo instrument", "Rhythm/tempo", "Melody", "Style", "",
          "You have 1 minute to read the question before hearing the excerpt.", "", "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Solo instrument", "Rhythm/tempo", "Melody", "Style"],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Solo instrument", marks: 1, type: "radio", prompt: "Solo instrument", instruction: "Tick one box from this selection", options: ["Bassoon", "French horn", "Tuba"].map(x => option(x)), answer: "French horn" },
          { id: "q5b", label: "Rhythm/tempo", marks: 1, type: "radio", prompt: "Rhythm/tempo", instruction: "Tick one box from this selection", options: ["Andante", "Cross rhythms", "Allegro"].map(x => option(x)), answer: "Allegro" },
          { id: "q5c", label: "Melody", marks: 1, type: "radio", prompt: "Melody", instruction: "Tick one box from this selection", options: ["Pentatonic scale", "Sequence", "Descant"].map(x => option(x)), answer: "Sequence" },
          { id: "q5d", label: "Style", marks: 1, type: "radio", prompt: "Style", instruction: "Tick one box from this selection", options: ["Concerto", "Symphony", "Baroque"].map(x => option(x)), answer: "Concerto" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 57.12 }, { label: "2nd", time: 124.12 },
        ])] },
        intro: [
          "In this question you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings, and 20 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        introBoldPhrases: ["twice"],
        showPartMarks: false,
        totalMarksOnLastPart: true,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The tonality of this excerpt is [answer].", inlineAnswer: { before: "The tonality of this excerpt is", after: "." }, acceptedAnswers: ["major", "major key", "major tonality", "majour"], answerDisplay: "Major" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The Italian term to describe the string playing technique is [answer].", inlineAnswer: { before: "The Italian term to describe the string playing technique is", after: "." }, acceptedAnswers: ["arco", "arcko", "arko"], answerDisplay: "Arco" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The large scale orchestral work which this excerpt comes from is a/an [answer].", inlineAnswer: { before: "The large scale orchestral work which this excerpt comes from is a/an", after: "." }, acceptedAnswers: ["symphony", "simphony", "symfoni", "symphonie"], answerDisplay: "Symphony" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.70 }, { label: "(b)", time: 90.40 },
        ])] },
        intro: "This question features two contrasting excerpts.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of Scottish dance, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Jig", "Strathspey", "Reel", "Waltz"].map(x => option(x)), answer: "Jig" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["compound", "compound time", "6/8", "12/8", "the beat divides into 3", "beat divides into 3", "beat divides into three"], acceptedKeywords: ["compound"], acceptedKeywordGroups: [["beat", "divides", "3"], ["beat", "divides", "three"]], answerDisplay: "Compound time, 6/8, 12/8, or the beat divides into three" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["African music", "Minimalist", "Latin American", "Swing"].map(x => option(x)), answer: "Latin American" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["syncopation", "syncopated", "off beat", "offbeat", "cross rhythms", "cross rhythm", "percussion", "samba", "salsa", "dance rhythms", "dance rhythm"], acceptedKeywords: ["syncopation", "syncopated", "offbeat", "percussion", "samba", "salsa"], acceptedKeywordGroups: [["off", "beat"], ["cross", "rhythm"], ["dance", "rhythm"]], answerDisplay: "Syncopation, off beat, cross rhythms, percussion, samba, salsa or dance rhythms" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 47.00 }, { label: "2nd", time: 107.28 }, { label: "3rd", time: 167.00 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Rhythm/tempo", "Melody/harmony", "Instruments/voices", "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Rhythm/tempo", "Melody/harmony", "Instruments/voices", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 10,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "2 or 4 beats in a bar / 2/4 / 4/4 / simple time", answers: ["2 beats in a bar", "2 beats in the bar", "2 beats per bar", "two beats in a bar", "two beats in the bar", "two beats per bar", "4 beats in a bar", "4 beats in the bar", "4 beats per bar", "four beats in a bar", "four beats in the bar", "four beats per bar", "2/4", "4/4", "simple time"] },
              { label: "Drum fill(s)", answers: ["drum fill", "drum fills"], blockedAnswers: ["fill", "fills"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat"] },
              { label: "Andante or Moderato", answers: ["andante", "moderato"] },
              { label: "Dotted rhythms", answers: ["dotted rhythm", "dotted rhythms"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
            ] },
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Grace note(s)", answers: ["grace note", "grace notes"] },
              { label: "Perfect cadence", answers: ["perfect cadence", "perfect cadance"] },
              { label: "Pitch bend", answers: ["pitch bend", "pitch bends", "bent pitch"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"] },
            ] },
            { id: "instruments", label: "Instruments/voices", concepts: [
              { label: "Bagpipe(s)", answers: ["bagpipe", "bagpipes"], blockedAnswers: ["pipe", "pipes"] },
              { label: "Cymbal(s)", answers: ["cymbal", "cymbals"] },
              { label: "Drumkit", answers: ["drumkit", "drum kit"], blockedAnswers: ["drum", "drums"] },
              { label: "Electric guitar", answers: ["electric guitar", "electro acoustic guitar", "electro-acoustic guitar"], blockedAnswers: ["acoustic guitar", "bass guitar", "guitar"] },
            ], additionalGuidance: ["Do not accept pipes, drums, guitar, acoustic guitar or bass guitar. Electro-acoustic guitar is accepted."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "mp or mf", answers: ["mp", "mezzo piano", "mf", "mezzo forte"] },
              { label: "f or ff", answers: ["f", "forte", "ff", "fortissimo"], alwaysBlockedAnswers: ["mezzo forte"] },
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
