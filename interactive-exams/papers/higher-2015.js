(function (root) {
  "use strict";

  const audio = (question, markers = []) => ({
    file: "../exampapers/higher/2015/Question " + question + "-1.mp3",
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value) => ({ value, label });
  const concept = (label, answers, correct = false, options = {}) => ({ label, answers: answers || [label], correct, ...options });

  const paper = {
    id: "higher-2015",
    title: "Higher Music 2015",
    level: "Higher",
    levelCode: "H",
    year: 2015,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 60,
    sourcePath: "../exampapers/higher/2015/NH_Music_QP_2015.pdf",
    markingInstructionsPath: "../exampapers/higher/2015/mi_NH_Music_mi_2015.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 3, topic: "Instrumental music", audio: { clips: [audio(1, [{ label: "1st", time: 41.3 }, { label: "2nd", time: 111.12 }])] },
        intro: [
          "This question features instrumental music.",
          "Listen to this excerpt and identify three concepts in the music from those listed below.",
          "Read through the concepts before hearing the music.",
        ],
        introBoldPhrases: ["three"],
        outro: [
          "The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        outroBoldPhrases: ["twice"],
        showPartMarks: false, totalMarksOnLastPart: true,
        subquestions: [{
          id: "q1a", label: "", marks: 3, type: "concept-lines", prompt: "Insert your three answers on the lines below.", lines: 3,
          boldPhrases: ["three answers"],
          requiredResponses: 3, additionalAnswerPenalty: true,
          conceptBank: [
            concept("Tierce de Picardie"), concept("Concerto grosso", ["concerto grosso"], true),
            concept("Through-composed", ["through composed", "through-composed"]), concept("Cluster"),
            concept("Harmonics"), concept("Obbligato"),
            concept("Interrupted cadence", ["interrupted cadence"], true), concept("Basso continuo", ["basso continuo"], true),
            concept("Whole tone scale", ["whole tone scale", "whole-tone scale"]),
          ],
          answerDisplay: "Interrupted cadence, Concerto grosso and Basso continuo",
          definition: "The three credited concepts are interrupted cadence, concerto grosso and basso continuo.",
        }],
      },
      {
        id: "q2", number: "2", marks: 5, topic: "Orchestral music", audio: { clips: [audio(2, [{ label: "1st", time: 69.96 }, { label: "2nd", time: 150 }, { label: "3rd", time: 229.94 }])] },
        intro: [
          "In this question you will hear orchestral music.",
          "A guide to the music is shown below. You are required to complete this guide by inserting music concepts.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "The music will be played three times with a pause of 20 seconds between playings. You will then have a further 30 seconds to complete your answer.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["three"],
        layout: "higher-guide",
        subquestions: [
          { id: "q2a", label: "1.", marks: 1, type: "short-text", inlineAnswer: { before: "The texture of the opening chords is", after: "." }, prompt: "The texture of the opening chords is [answer].", acceptedAnswers: ["homophonic", "homophony"], answerDisplay: "Homophonic or homophony", definition: "Homophonic texture has one main melody supported by chords." },
          { id: "q2b", label: "2.", marks: 1, type: "short-text", inlineAnswer: { before: "The chord outlined is a/an", after: "." }, prompt: "The chord outlined is a/an [answer].", acceptedAnswers: ["diminished 7th", "diminished seventh", "diminished 7", "dim 7", "dim7"], answerDisplay: "Diminished 7th", definition: "A diminished 7th chord is built from stacked minor thirds." },
          { id: "q2c", label: "3.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, prompt: "The instrument playing the melody is a/an [answer].", acceptedAnswers: ["clarinet"], answerDisplay: "Clarinet", definition: "The clarinet is a single-reed woodwind instrument." },
          { id: "q2d", label: "4.", marks: 1, type: "short-text", inlineAnswer: { before: "The time signature is", after: "." }, prompt: "The time signature is [answer].", acceptedAnswers: ["12/8", "12 / 8", "6/8", "6 / 8", "12", "6"], answerDisplay: "12/8; 6/8, 12 or 6 are also accepted", definition: "12/8 has four dotted-crotchet beats and 6/8 has two." },
          { id: "q2e", label: "5.", marks: 1, type: "short-text", inlineAnswer: { before: "The cadence is", after: "." }, prompt: "The cadence is [answer].", acceptedAnswers: ["perfect", "perfect cadence"], answerDisplay: "Perfect", definition: "A perfect cadence moves from chord V to chord I." },
        ],
      },
      {
        id: "q3", number: "3", marks: 3, topic: "Vocal music", audio: { clips: [audio(3, [{ label: "(a)", time: 7.34 }, { label: "(b)", time: 71.56 }, { label: "(c)", time: 112.22 }])] },
        intro: "This question features contrasting music for voices.",
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Insert the concept which describes the style of the music.", acceptedAnswers: ["plainchant", "plainsong", "gregorian chant"], answerDisplay: "Plainchant, plainsong or Gregorian chant", definition: "Plainchant is unaccompanied sacred vocal music sung in unison." },
          { id: "q3b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and name this vocal style.", acceptedAnswers: ["recitative", "recit"], answerDisplay: "Recitative or recit", definition: "Recitative is speech-like solo singing used to move a story forward." },
          { id: "q3c", label: "(c)", marks: 1, markAlign: "prompt-end", type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and identify the final chord.", promptLines: ["Listen to a new excerpt and identify the final chord.", "The excerpt is short and will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["added 6th", "added sixth", "d6", "d 6"], answerDisplay: "Added 6th or D6", definition: "An added 6th chord adds the sixth degree above the root to a major or minor triad." },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Music literacy", audio: { clips: [audio(4, [{ label: "Guide", time: 7.7 }, { label: "2nd", time: 227.24 }, { label: "3rd", time: 321.32 }, { label: "4th", time: 416.28 }])] },
        intro: [
          "This question is based on rock music.",
          "Listen to the song and follow the guide to the music below.", "Here is the music for the first time.",
          "You now have 2 minutes to read the question.", "All answers must be written in the boxes below.",
        ],
        introBoldPhrases: ["All answers must be written in the boxes below."],
        outro: [
          "During the next three playings complete your answers (a) to (f).",
          "The music will be played three more times with a pause of 30 seconds between playings and a pause of 2 minutes before the next question starts.",
          "Here is the music for the second time.", "Here is the music for the third time.", "Here is the music for the fourth time.",
        ],
        outroBoldPhrases: ["three"],
        outroCompactRange: [2, 4],
        outroPosition: "before-score",
        score: { key: "F major", bars: 20, sharedNotation: "higher-2015-q4" }, scorePosition: "before",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Transpose the first three notes one octave lower into the bass clef. Use the given blank bars.", boldPhrases: ["one octave lower"], options: [], noteSlots: 3, answer: "E3,G3,C4", answerDisplay: "E and G minims, then C dotted minim, one octave lower in the bass clef", definition: "All three transposed pitches and rhythms must be correct." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Describe the interval formed by the two notes in the box in bar 6. Write your answer in the box.", boldPhrases: ["bar 6"], acceptedAnswers: ["4", "4th", "fourth", "perfect 4th", "perfect fourth", "augmented 4th", "augmented fourth", "diminished 4th", "diminished fourth"], answerDisplay: "4th or 4", definition: "The two notes are four letter names apart, forming a 4th." },
          { id: "q4c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "accidental", accidentalNoteIndices: [0, 2], inlineNotationControls: true, prompt: "Insert the accidental missing from bar 11.", boldPhrases: ["bar 11"], options: [option("flat", "Flat"), option("natural", "Natural"), option("sharp", "Sharp")], answer: "flat", answerDisplay: "A flat before either note in bar 11", definition: "A flat lowers the selected note by one semitone." },
          { id: "q4d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 14. The rhythm is given.", boldPhrases: ["bar 14"], options: [], noteSlots: 3, answer: "E5,A4,A4", answerDisplay: "E dotted crotchet, A quaver and A minim", definition: "All three missing pitches and their printed rhythms must be correct." },
          { id: "q4e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "barline-entry", inlineNotationControls: true, prompt: "Insert the missing bar lines in line 5.", boldPhrases: ["line 5"], options: [], answer: "line5-gap-4,line5-gap-11,line5-15", answerDisplay: "Three bar lines in the official positions", definition: "All three missing bar lines must be placed correctly." },
          { id: "q4f", label: "(f)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Name the chords that you hear in the last line. You may use letter names or numbers. The first chord is given.", boldPhrases: ["the last line"], answerReference: { heading: "Choose from the following:", rows: [["C", "Chord I"], ["F", "Chord IV"], ["G", "Chord V"], ["Am", "Chord VI"]], footer: "Insert your answers in the boxes provided." }, acceptedAnswers: ["g am", "g a", "g, am", "g, a", "v vi", "v, vi", "5 6", "5, 6", "chord v chord vi", "chord v, chord vi", "chord 5 chord 6", "chord 5, chord 6"], answerDisplay: "G and Am; V and VI; or 5 and 6", definition: "Both chords must be correct: G followed by A minor." },
        ],
      },
      {
        id: "q5", number: "5", marks: 3, topic: "Instrumental music", audio: { clips: [audio(5, [{ label: "(a)", time: 6.42 }, { label: "(b)", time: 125.66 }, { label: "(c)", time: 202.24 }])] },
        intro: "This question features instrumental music.",
        subquestions: [
          { id: "q5a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to identify the rhythmic feature. The music will be played twice.", promptLines: ["Listen to this excerpt and tick one box to identify the rhythmic feature.", "The music will be played twice."], afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one", "twice"], options: ["3 against 2", "Augmentation", "Diminution", "Irregular time signatures"].map(value => option(value)), answer: "3 against 2", definition: "Three against two places three equal notes against two equal notes in the same time." },
          { id: "q5b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to the following excerpt and insert the concept which describes the style of the music.", acceptedAnswers: ["impressionist", "impressionism"], answerDisplay: "Impressionist or Impressionism", definition: "Impressionist music often uses colour, atmosphere, whole-tone scales and unresolved harmony." },
          { id: "q5c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt. Insert the concept which describes the type of group playing.", acceptedAnswers: ["string quartet"], answerDisplay: "String quartet", definition: "A string quartet normally consists of two violins, viola and cello." },
        ],
      },
      {
        id: "q6", number: "6", marks: 6, topic: "Listening analysis", audio: { clips: [audio(6, [{ label: "1st", time: 44.64 }, { label: "2nd", time: 117.6 }, { label: "3rd", time: 183.36 }])] },
        intro: [
          "This question is based on instrumental music.",
          "In this question you should identify the most prominent concepts in the music.",
          "As you listen, identify at least two concepts from each of the following headings:",
          "Melody/harmony", "Rhythm", "Timbre", "",
          "You will hear the music three times and you should make notes as you listen.",
          "Rough work will not be marked.", "Marks will only be awarded for the final answer.",
          "After the third playing you will have 3 minutes to write your final answer in the space provided.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["two", "Melody/harmony", "Rhythm", "Timbre", "three times", "Rough work will not be marked."], introHeadingRowRange: [3, 5], introCompactRange: [11, 13], introTotalMarks: 6, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q6a", label: "Final answer", marks: 6, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, endOfPaper: false, requiredResponses: 6, prompt: "Final answer",
          headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Major", answers: ["major", "major key", "major tonality"] }, { label: "Minor", answers: ["minor", "minor key", "minor tonality"] },
              { label: "Modulation / key change", answers: ["modulation", "modulates", "key change", "change of key"] }, { label: "Ornament / mordent", answers: ["ornament", "ornaments", "mordent", "mordents"] },
              { label: "Perfect cadence", answers: ["perfect cadence"] }, { label: "Plagal cadence", answers: ["plagal cadence"] },
            ] },
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "Anacrusis", answers: ["anacrusis", "upbeat", "up beat", "pickup", "pick up"] },
              { label: "Irregular time signatures / metres", answers: ["irregular time signature", "irregular time signatures", "irregular metre", "irregular metres", "time changes", "5 beats in a bar", "five beats in a bar"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated", "off beat", "off the beat"] },
            ] },
            { id: "timbre", label: "Timbre", concepts: [
              { label: "Accordion", answers: ["accordion"] }, { label: "Bass guitar", answers: ["bass guitar"] },
              { label: "Claves / woodblock", answers: ["claves", "clave", "woodblock", "wood block"] }, { label: "Drum kit", answers: ["drum kit", "drumkit"], alwaysBlockedAnswers: ["drums"] },
              { label: "Flute", answers: ["flute", "flutes"] }, { label: "Flutter tonguing", answers: ["flutter tonguing", "flutter-tonguing", "flutter tongue"] },
            ] },
          ],
          answerDisplay: "Two valid concepts from each of Melody/harmony, Rhythm and Timbre",
          additionalGuidance: ["Concepts written under the wrong heading are not penalised."],
        }],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Vocal music", audio: { clips: [audio(7, [{ label: "1st", time: 45.38 }, { label: "2nd", time: 150.32 }, { label: "3rd", time: 255.74 }])] },
        intro: [
          "This question features vocal music.",
          "Listen to this excerpt and identify four concepts in the music from those listed below.",
          "Read through the list before hearing the music.",
        ],
        introBoldPhrases: ["four"],
        outro: [
          "The music will be played three times with a pause of 10 seconds between playings and a pause of 40 seconds\nbefore the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        outroBoldPhrases: ["three"],
        outroCompactRange: [1, 3],
        showPartMarks: false, totalMarksOnLastPart: true,
        subquestions: [{
          id: "q7a", label: "", marks: 4, type: "concept-lines", prompt: "Insert your four answers on the lines below.", lines: 4,
          boldPhrases: ["four"],
          requiredResponses: 4, additionalAnswerPenalty: true,
          conceptBank: [
            concept("Time changes", ["time changes", "time change"], true), concept("Jazz funk", ["jazz funk", "jazz-funk"]),
            concept("Lied"), concept("Coloratura"), concept("Oratorio"), concept("Harmonic minor scale", ["harmonic minor scale", "harmonic minor"], true),
            concept("Ripieno"), concept("Da capo aria", ["da capo aria", "da-capo aria"]), concept("Soul", ["soul", "soul music"], true), concept("Strophic", ["strophic", "strophic form"], true),
          ],
          answerDisplay: "Time changes; Soul; Harmonic minor scale; Strophic",
          definition: "One mark is awarded for each correct concept, in any order.",
        }],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Comparing music", audio: { clips: [audio(8, [{ label: "E1 1st", time: 116.1 }, { label: "E2 1st", time: 173.08 }, { label: "E1 2nd", time: 236.08 }, { label: "E2 2nd", time: 292.62 }, { label: "E1 3rd", time: 349.18 }, { label: "E2 3rd", time: 402.48 }, { label: "Column C", time: 455.04 }])] },
        intro: [
          "This question is about comparing two excerpts of music.",
          "Identify concepts present in each excerpt and then decide which five concepts are common to both excerpts. Both excerpts will be played three times with a pause of 10 seconds between playings.",
          "As you listen, tick boxes in Column A and Column B to identify what you hear in Excerpt 1 and Excerpt 2.",
          "These columns are for rough work only and will not be marked.",
          "After the three playings of the music you will be given 2 minutes to decide which concepts are common to both excerpts and to tick five boxes in Column C.",
          "You now have 1 minute to read through the question.",
          "Here is Excerpt 1 for the first time. Remember to tick concepts in Column A.",
          "Here is Excerpt 2 for the first time. Remember to tick concepts in Column B.",
          "Here is Excerpt 1 for the second time.", "Here is Excerpt 2 for the second time.",
          "Here is Excerpt 1 for the third time.", "Here is Excerpt 2 for the third time.",
          "You now have 2 minutes to identify the five concepts common to both excerpts.",
          "Remember to tick five boxes only in Column C.",
        ],
        introBoldPhrases: [
          "five", "three", "Column A", "Column B", "Column C",
          "These columns are for rough work only and will not be marked.",
          "Remember to tick concepts in Column A.",
          "Remember to tick concepts in Column B.",
          "Remember to tick five boxes only in Column C.",
        ],
        introCompactRanges: [[6, 7], [8, 9], [10, 11]],
        introTotalMarks: 5, introTotalMarksIndex: 13,
        showPartMarks: false,
        subquestions: [{
          id: "q8a", label: "", marks: 5, type: "comparison-grid", requiredResponses: 5, additionalAnswerPenalty: true,
          hidePrompt: true,
          prompt: "Identify the five features common to both excerpts in Column C. Columns A and B are rough work only.",
          answers: ["Classical", "Sonata", "Acciaccatura", "Sequence", "Anacrusis"],
          columns: [{ id: "a", label: "Column A", sublabel: "Excerpt 1" }, { id: "b", label: "Column B", sublabel: "Excerpt 2" }, { id: "c", label: "Column C", sublabel: "5 features common to both" }],
          groups: [
            { label: "Styles", concepts: [
              concept("Classical", ["classical"], true), concept("Romantic"), concept("Sonata", ["sonata"], true), concept("Concerto"),
            ] },
            { label: "Melody/harmony", concepts: [
              concept("Acciaccatura", ["acciaccatura"], true), concept("Chromatic scale", ["chromatic scale"]), concept("Major tonality", ["major tonality", "major"]), concept("Sequence", ["sequence", "sequences"], true),
            ] },
            { label: "Rhythm", concepts: [
              concept("Cross rhythms", ["cross rhythms", "cross rhythm"]), concept("Compound time", ["compound time"]), concept("Anacrusis", ["anacrusis"], true),
            ] },
            { label: "Structure/Form", concepts: [
              concept("Alberti bass", ["alberti bass"]), concept("Ritornello", ["ritornello"]), concept("Cadenza", ["cadenza"]),
            ] },
          ],
          answerDisplay: "Classical; Sonata; Acciaccatura; Sequence; Anacrusis",
          definition: "Only Column C is marked. One mark is awarded for each correct common feature, with deductions for additional incorrect choices.",
        }],
      },
      {
        id: "q9", number: "9", marks: 5, topic: "Song features", audio: { clips: [audio(9, [{ label: "1st", time: 105.52 }, { label: "2nd", time: 176.04 }, { label: "3rd", time: 246.48 }])] },
        intro: ["This question is based on a song from a film.", "Below is a list of features which occur in the music.", "There will now be a pause of 1 minute to allow you to read through the question.", "The lyrics of the song are printed in the table below. You should insert each feature once in the column on the right at the point where it occurs.", "You only need to insert the underlined word."],
        introBoldPhrases: ["once", "three"],
        showPartMarks: false,
        subquestions: [{
          id: "q9a", label: "", marks: 5, type: "lyric-placement", requiredResponses: 5, additionalAnswerPenalty: true,
          hidePrompt: true,
          prompt: "Insert the five underlined words at the point where they occur. Insert each word once only.",
          playbackLines: [
            "The music will now be played three times with a pause of 20 seconds between playings and a pause of 30 seconds at the end.",
            "Here is the music for the first time.",
            "Here is the music for the second time.",
            "Here is the music for the third time.",
          ],
          features: [
            { before: "", word: "rallentando", after: "" },
            { before: "major ", word: "scale", after: " played by the strings" },
            { before: "harp ", word: "glissando", after: "" },
            { before: "timpani ", word: "rolls", after: "" },
            { before: "", word: "tremolando", after: " starts" },
          ],
          lyricLines: [
            "Rat dat dat dat dat dat",
            "Da da da da da ooh.",
            "Winter’s a good time",
            "To stay in cuddle",
            "But put me in summer",
            "And I’ll be a ... happy snowman!",
            "When life gets tough",
            "I like to hold on to my dream",
            "Of relaxing in the summer sun",
            "Just lettin’ off steam.",
            "Oh the sky will be blue,",
            "And you guys’ll be there too",
            "When I finally do",
            "What frozen things do in summer.",
            "I’m gonna tell him.",
            "Don’t you dare.",
            "In summer.",
          ],
          concepts: [
            { id: "glissando", label: "Glissando", answers: ["glissando", "harp glissando"], lines: [6] },
            { id: "rallentando", label: "Rallentando", answers: ["rallentando", "rall", "rall."], lines: [10, 11] },
            { id: "tremolando", label: "Tremolando", answers: ["tremolando", "tremolando starts"], lines: [11] },
            { id: "scale", label: "Scale", answers: ["scale", "major scale", "major scale played by the strings"], lines: [14] },
            { id: "rolls", label: "Rolls", answers: ["rolls", "timpani rolls"], lines: [16, 17] },
          ],
          answerDisplay: "Glissando—line 6; Rallentando—line 10 or 11; Tremolando—line 11; Scale—line 14; Rolls—line 16 or 17",
          definition: "Each feature earns one mark when placed at an accepted point in the song.",
        }],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
