(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2018/${String(track).padStart(2, "0")} ${String(track).padStart(2, "0")} Track ${track}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Pop music is a popular commercial style, often built around memorable songs and a clear beat.",
    q1b: "Contrapuntal music combines two or more independent melodic lines.",
    q1c: "Castanets are pairs of wooden clappers commonly associated with Spanish music.",
    q1d: "A middle 8 is a contrasting section in a song; 12/8 has four dotted-crotchet beats in each bar.",
    q1e: "Ritardando means gradually slowing down.",
    q1f: "An inverted pedal is a repeated or sustained high note above changing harmony; pizzicato means plucking a string instrument.",
    q2a: "Arco means to play a string instrument with the bow; vibrato is a slight regular variation in pitch.",
    q2b: "The pulse is grouped into recurring groups of two or four beats.",
    q2c: "Major tonality is based on a major scale and commonly sounds bright.",
    q2d: "A perfect cadence moves from chord V to chord I and sounds finished.",
    q3a: "A score with no sharps or flats and a tonal centre of C is in C major.",
    q3b: "A 4/4 time signature means there are four crotchet beats in each bar.",
    q3c: "The third and fourth notes in bar 2 are a dotted crotchet followed by a quaver.",
    q3d: "An imperfect cadence ends on chord V and sounds unfinished.",
    q3e: "The drum kit begins in bar 8 or bar 9.",
    q3f: "The missing notes are D and C, both written as crotchets.",
    q4a: "Homophonic texture has one main melody supported by chordal accompaniment.",
    q4b: "Modulation is a change from one key to another.",
    q4c: "Musical theatre combines songs, dialogue and acting in a staged dramatic work.",
    q4d: "Strophic form uses the same music for each verse.",
    q4e: "A mezzo soprano is a female voice between soprano and contralto.",
    q4f: "The chord sequence is I–V–VI–IV: C–G–Am–F.",
    q5a: "A French horn is a brass instrument with a coiled tube and a mellow tone.",
    q5b: "6/8 has two dotted-crotchet beats in each bar.",
    q5c: "Major tonality is based on a major scale and commonly sounds bright.",
    q5d: "Classical music commonly uses balanced phrases and clear formal structures.",
    q6a: "A cappella music is sung without instrumental accompaniment.",
    q6b: "Syllabic word setting gives one note to each syllable.",
    q6c: "Adagio means slowly; Andante means at a walking pace; Moderato means at a moderate speed.",
    q7a1: "A symphony is an extended work for orchestra.",
    q7a2: "A symphony is performed by an orchestra without a featured soloist.",
    q7b1: "Gospel is religious vocal music rooted in Christian worship.",
    q7b2: "Gospel lyrics commonly refer to Christian faith, praise or Jesus.",
  };

  const paper = {
    id: "national5-2018",
    title: "National 5 Music 2018",
    level: "National 5",
    levelCode: "N5",
    year: 2018,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2018/01 01 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2018/N5_Music_QP_2018.pdf",
    markingInstructionsPath: "../exampapers/n5/2018/mi_N5_Music_mi_2018.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 8, topic: "Music in different styles", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.52 }, { label: "(b)", time: 55.8 }, { label: "(c)", time: 115.8 },
          { label: "(d)", time: 160.8 }, { label: "(e)", time: 319.72 }, { label: "(f)", time: 398.68 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rapping", "Pop", "Gospel", "Blues"].map(x => option(x)), answer: "Pop" },
          { id: "q1b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to another excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Scotch snap", "Compound time", "Glissando", "Contrapuntal"].map(x => option(x)), answer: "Contrapuntal" },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and name the percussion instrument.", acceptedAnswers: ["castanets", "castanet", "castinets", "castanettes"], answerDisplay: "Castanets" },
          { id: "q1d", label: "(d)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt and tick two boxes to describe what you hear. The music will be played twice.", promptLines: ["Listen to this excerpt and tick two boxes to describe what you hear. The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Middle 8", "Latin American", "Canon", "12/8", "Sitar"].map(x => option(x)), answers: ["Middle 8", "12/8"] },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and write the Italian term to describe the change in tempo towards the end of the music. The excerpt is short and will be played twice.", promptLines: ["Listen to a new excerpt and write the Italian term to describe the change in tempo towards the end of the music.", "The excerpt is short and will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["ritardando", "rit", "rit.", "rallentando", "rall", "rall.", "ritenuto"], answerDisplay: "Ritardando, rit, rallentando, rall or ritenuto" },
          { id: "q1f", label: "(f)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to another piece of music and tick two boxes to describe what you hear.", boldPhrases: ["two"], options: ["Contrary motion", "Descant", "Inverted pedal", "Ground bass", "Pizzicato"].map(x => option(x)), answers: ["Inverted pedal", "Pizzicato"] },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [audio(3, [
          { label: "1st", time: 114.3 }, { label: "2nd", time: 220.78 }, { label: "3rd", time: 326.64 },
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
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The playing technique used by the violin is (Italian term)", inlineAnswer: { before: "The playing technique used by the violin is", after: "(Italian term)" }, acceptedAnswers: ["arco", "vibrato"], answerDisplay: "Arco or vibrato" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "There are beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "two", "4", "four", "2/4", "4/4"], answerDisplay: "2 or 4 (2/4 or 4/4)" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The tonality is", inlineAnswer: { before: "The tonality is", after: "" }, acceptedAnswers: ["major", "major key", "major tonality"], answerDisplay: "Major" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The final cadence is", inlineAnswer: { before: "The final cadence is", after: "" }, acceptedAnswers: ["perfect", "perfect cadence", "v to i", "5 to 1", "v-i", "5-1"], answerDisplay: "Perfect cadence (V–I or 5–1)" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 7.44 }, { label: "1st", time: 127.96 }, { label: "2nd", time: 221.98 }, { label: "3rd", time: 316.08 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have 30 seconds to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "C major", bars: 16, sharedNotation: "n5-2018-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this excerpt [answer].", inlineAnswer: { before: "Name the key of this excerpt", after: "." }, acceptedAnswers: ["c", "c major", "c maj"], answerDisplay: "C, C major or C maj" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", answerDisplay: "4/4" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", prompt: "Correct the rhythm in bar 2.", options: [option("dottedCrotchet", "Dotted crotchet"), option("quaver", "Quaver")], noteSlots: 2, answer: "dottedCrotchet,quaver", answerDisplay: "C dotted crotchet followed by D quaver" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the cadence in bars 7–8. Write your answer in the box provided.", allowAnswerInPhrase: true, acceptedAnswers: ["imperfect", "imperfect cadence", "ends on chord v", "ends on chord 5", "ends on v", "ends on 5"], answerDisplay: "Imperfect cadence (ending on V or 5)" },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "bar-label", barLabel: "D", prompt: "Write D above the bar where the drum kit starts to play.", options: [option("D")], answer: "bar-9", acceptedAnswers: ["bar-8", "bar-9"], answerDisplay: "D above bar 8 or bar 9" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Complete bar 11 by inserting the missing notes.", options: [], noteSlots: 2, answer: "D5,C5", answerDisplay: "D crotchet followed by C crotchet" },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 5.74 }, { label: "(b)", time: 92.32 }, { label: "(c)", time: 137.32 },
          { label: "(d)", time: 189.04 }, { label: "(e)", time: 298.56 }, { label: "(f)", time: 356.2 },
        ])] },
        intro: "This question is about vocal music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The excerpt will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Strophic", "Homophonic", "A cappella", "Opera"].map(x => option(x)), answer: "Homophonic" },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to another excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rallentando", "Mouth music", "Modulation", "Alberti bass"].map(x => option(x)), answer: "Modulation" },
          { id: "q4c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to one more excerpt in the same style. Name the style of music.", acceptedAnswers: ["musical", "musical theatre", "musical theater"], answerDisplay: "Musical or musical theatre" },
          { id: "q4d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to music in a different style. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Strophic", "Gaelic psalm", "Trill", "Descant"].map(x => option(x)), answer: "Strophic" },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, continuationBefore: true, prompt: "Listen to part of that excerpt again and name the type of voice.", acceptedAnswers: ["mezzo soprano", "mezzo-soprano", "mezzo"], answerDisplay: "Mezzo soprano or mezzo" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of C major. You will hear the music twice, with a pause of 10 seconds between playings. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of C major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "C Am F G" },
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "C G Am F" },
            { value: "I IV V VI", label: "I IV V VI", secondaryLabel: "C F G Am" },
          ], answer: "I V VI IV" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 100.44 }, { label: "2nd", time: 144.68 }, { label: "3rd", time: 184.78 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of orchestral music which will be played three times.",
          "Tick one answer only in each of the four sections.", "", "Solo instrument", "Rhythm/tempo", "Melody/harmony", "Style", "",
          "You now have 1 minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Solo instrument", "Rhythm/tempo", "Melody/harmony", "Style"],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Solo instrument", marks: 1, type: "radio", prompt: "Solo instrument", instruction: "Tick one box from this selection", options: ["Trumpet", "French horn", "Trombone"].map(x => option(x)), answer: "French horn" },
          { id: "q5b", label: "Rhythm/tempo", marks: 1, type: "radio", prompt: "Rhythm/tempo", instruction: "Tick one box from this selection", options: ["Adagio", "6/8", "Rubato"].map(x => option(x)), answer: "6/8" },
          { id: "q5c", label: "Melody/harmony", marks: 1, type: "radio", prompt: "Melody/harmony", instruction: "Tick one box from this selection", options: ["Major", "Minor", "Whole-tone scale"].map(x => option(x)), answer: "Major" },
          { id: "q5d", label: "Style", marks: 1, type: "radio", prompt: "Style", instruction: "Tick one box from this selection", options: ["Baroque", "Classical", "Romantic"].map(x => option(x)), answer: "Classical" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 64.16 }, { label: "2nd", time: 147.16 },
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
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The concept which describes unaccompanied singing is [answer]", inlineAnswer: { before: "The concept which describes unaccompanied singing is", after: "" }, acceptedAnswers: ["a cappella", "acappella", "a capella"], answerDisplay: "A cappella" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "and the word setting is mainly [answer].", inlineAnswer: { before: "and the word setting is mainly", after: "." }, acceptedAnswers: ["syllabic", "silabic", "syllabic word setting"], answerDisplay: "Syllabic" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The tempo is [answer] (Italian term).", inlineAnswer: { before: "The tempo is", after: "(Italian term)." }, acceptedAnswers: ["adagio", "andante", "moderato"], answerDisplay: "Adagio, Andante or Moderato" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.28 }, { label: "(b)", time: 94.48 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Baroque", "Symphony", "Concerto", "Minimalist"].map(x => option(x)), answer: "Symphony" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedKeywords: ["orchestra", "orchestral"], forbiddenKeywordGroups: [["solo", "instrument"], ["soloist"]], answerDisplay: "Full orchestra, orchestra or orchestral" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Gaelic psalm", "Rapping", "Aria", "Gospel"].map(x => option(x)), answer: "Gospel" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedKeywords: ["religious", "religion", "christian", "jesus", "praise", "worship"], acceptedKeywordGroups: [["religious", "vocal"], ["words", "praise"], ["singing", "jesus"]], answerDisplay: "Religious vocal music or another clear reference to Christian faith, Jesus or praise" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 44.3 }, { label: "2nd", time: 113.64 }, { label: "3rd", time: 182.82 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Melody/harmony", "Rhythm", "Instruments", "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Melody/harmony", "Rhythm", "Instruments", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Grace notes or ornaments", answers: ["grace note", "grace notes", "ornament", "ornaments", "ornamentation", "modal"] },
              { label: "Pedal or drone", answers: ["pedal", "pedal note", "drone", "drone bass"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
            ] },
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat"] },
              { label: "Dotted rhythms", answers: ["dotted rhythm", "dotted rhythms"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Simple time / 2 or 4 beats / 2/4 or 4/4", answers: ["simple time", "2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "2/4", "4/4"] },
              { label: "Strathspey", answers: ["strathspey"] },
              { label: "Syncopation or off the beat", answers: ["syncopation", "syncopated", "off the beat", "offbeat"] },
              { label: "Triplets", answers: ["triplet", "triplets"] },
            ] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Bodhran", answers: ["bodhran", "bodhrán", "bohran"], allowFuzzy: false, blockedAnswers: ["drum", "drums"] },
              { label: "Double bass or bass guitar", answers: ["double bass", "bass guitar"], blockedAnswers: ["bass"] },
              { label: "Fiddles or violins", answers: ["fiddle", "fiddles", "violin", "violins"] },
              { label: "Keyboard or piano", answers: ["keyboard", "piano"] },
            ], additionalGuidance: ["Drum or drums is not accepted for bodhran.", "Bass is not accepted on its own."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "mf or f", answers: ["mf", "mezzo forte", "f", "forte"] },
              { label: "sfz", answers: ["sfz", "sforzando", "sforzato"] },
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
