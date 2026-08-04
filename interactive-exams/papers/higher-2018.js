(function (root) {
  "use strict";

  const audio = (question, markers = []) => {
    const track = String(question + 1).padStart(2, "0");
    return { file: `../exampapers/higher/2018/${track} Track ${question + 1}-1.mp3`, label: "Question audio", maxPlaysExam: 1, markers };
  };
  const option = (value, label = value) => ({ value, label });
  const concept = (label, answers, correct = false, options = {}) => ({ label, answers: answers || [label], correct, ...options });

  const paper = {
    id: "higher-2018",
    title: "Higher Music 2018",
    level: "Higher",
    levelCode: "H",
    year: 2018,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 60,
    sourcePath: "../exampapers/higher/2018/NH_Music_QP_2018.pdf",
    markingInstructionsPath: "../exampapers/higher/2018/mi_NH_Music_mi_2018.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 5, topic: "Chamber music", audio: { clips: [audio(1, [
          { label: "(a) 1st", time: 47.54 }, { label: "(a) 2nd", time: 108.78 }, { label: "(a) 3rd", time: 171.82 }, { label: "(b)", time: 263.22 },
        ])] },
        intro: "This question features chamber music.",
        subquestions: [
          {
            id: "q1a", label: "(a)", marks: 4, type: "concept-lines", letteredConcept: true, lines: 4, requiredResponses: 4, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify four concepts in the music from those listed below.", "Read through the concepts before hearing the music."],
            prompt: "Insert your four answers on the lines below.", boldPhrases: ["four"],
            conceptBank: [
              concept("Ritornello"), concept("Impressionist"), concept("Classical", ["classical"], true), concept("Diminished 7th", ["diminished 7th", "diminished seventh", "diminished 7"], true),
              concept("Interrupted cadence", ["interrupted cadence"], true), concept("Ripieno"), concept("Pizzicato", ["pizzicato", "pizz"], true), concept("Ground bass"),
              concept("Concerto grosso"), concept("Tremolando"),
            ],
            afterAnswerLines: ["The music will be played three times with a pause of 10 seconds between playings and a pause of 40 seconds before part (b).", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
            answerDisplay: "Classical, Interrupted cadence, Pizzicato and Diminished 7th", definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a continuation of the excerpt. Insert the concept which describes the instrumental group.", acceptedAnswers: ["string quartet"], alwaysBlockedAnswers: ["strings", "string"], answerDisplay: "String quartet", definition: "The complete instrumental-group name is required." },
        ],
      },
      {
        id: "q2", number: "2", marks: 6, topic: "Musical guide", audio: { clips: [audio(2, [
          { label: "(a) 1st", time: 76.66 }, { label: "(a) 2nd", time: 163.46 }, { label: "(a) 3rd", time: 250.92 }, { label: "(b) 1st", time: 362.84 }, { label: "(b) 2nd", time: 408.72 },
        ])] }, layout: "higher-guide", guideBoxSubquestions: 5, introIndent: true, introPartLabel: "(a)",
        intro: [
          "In this question you will hear orchestral music.", "A guide to the music is shown below. You are required to complete this guide by inserting music concepts.",
          "There will now be a pause of 30 seconds to allow you to read through the question.", "The music will be played three times with a pause of 20 seconds between playings. You will then have a further 30 seconds to complete your answer.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ], introCompactRange: [5, 7],
        subquestions: [
          { id: "q2a", label: "1.", marks: 1, type: "short-text", inlineAnswer: { before: "The ornament is a/an", after: "." }, prompt: "The ornament is a/an [answer].", acceptedAnswers: ["mordent", "upper mordent", "lower mordent"], answerDisplay: "Mordent", definition: "The ornament is a mordent." },
          { id: "q2b", label: "2.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, prompt: "The instrument playing the melody is a/an [answer].", acceptedAnswers: ["oboe"], answerDisplay: "Oboe", definition: "The melody is played by an oboe." },
          { id: "q2c", label: "3.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, prompt: "The instrument playing the melody is a/an [answer].", acceptedAnswers: ["bassoon"], answerDisplay: "Bassoon", definition: "The melody is played by a bassoon." },
          { id: "q2d", label: "4.", marks: 1, type: "short-text", inlineAnswer: { before: "The phrase ends with a descending", after: " in the melody." }, prompt: "The phrase ends with a descending [answer] in the melody.", acceptedAnswers: ["arpeggio", "broken chord"], answerDisplay: "Arpeggio or broken chord", definition: "The melody descends through the notes of a chord." },
          { id: "q2e", label: "5.", marks: 1, type: "short-text", inlineAnswer: { before: "The strings are playing in", after: "." }, prompt: "The strings are playing in [answer].", acceptedAnswers: ["octaves", "octave", "unison", "unisons"], answerDisplay: "Octaves or unison", definition: "The official marking instructions accept either description." },
          { id: "q2f", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different piece of music which features part of a scale. Write the concept which describes the type of scale. The music will be played twice.", promptLines: ["Listen to a different piece of music which features part of a scale.", "Write the concept which describes the type of scale.", "The music will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["harmonic minor", "harmonic minor scale"], answerDisplay: "Harmonic minor or Harmonic minor scale", definition: "The excerpt features part of the harmonic minor scale." },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music literacy", audio: { clips: [audio(3, [
          { label: "Guide", time: 13.04 }, { label: "2nd", time: 235.64 }, { label: "3rd", time: 335.22 }, { label: "4th", time: 437.18 },
        ])] },
        intro: ["This question is based on popular music.", "Listen to the excerpt and follow the guide to the music below.", "Here is the music for the first time.", "You now have 2 minutes to read the question.", "All answers must be written in the boxes below."],
        introBoldPhrases: ["All answers must be written in the boxes below."],
        outro: ["During the next three playings complete your answers (a) to (f).", "The music will be played three more times with a pause of 30 seconds between playings and a pause of 2 minutes before the next question starts.", "Here is the music for the second time.", "Here is the music for the third time.", "Here is the music for the fourth time."],
        outroBoldPhrases: ["three"], outroCompactRange: [2, 4], outroPosition: "before-score",
        score: { key: "C major", timeSignature: "4/4", lines: 9, sharedNotation: "higher-2018-q3" }, scorePosition: "before",
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "barline-entry", inlineNotationControls: true, prompt: "Insert the two missing bar lines in line 2.", options: [], answer: "line2-gap-5,line2-gap-11", answerDisplay: "Both missing bar lines, placed between the first tied D crotchets and between the tied E crotchets; the bar line between the final tied D crotchets is printed", definition: "Both missing bar lines must be correctly placed." },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Transpose the first four notes in line 3 one octave lower into the bass clef. Use the given blank bars.", boldPhrases: ["one octave lower"], options: [], noteSlots: 4, answer: "A3,E3,A3,F♯3", acceptedAnswers: ["A3,E3,A3,F♯3", "A3,E3,A3,F#3"], answerDisplay: "A3 minim, E3 crotchet, A3 crotchet and F-sharp3 minim", definition: "All four pitches and rhythms, including the sharp, must be correct." },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in the box in line 4. The rhythm is given.", options: [], noteSlots: 3, answer: "B4,A4,G4", answerDisplay: "B4 minim, A4 crotchet and G4 crotchet", definition: "All three pitches and printed rhythms must be correct." },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Describe the interval formed by the two notes in the box in line 5. Write your answer in the box.", acceptedAnswers: ["4", "4th", "fourth", "perfect 4th", "perfect fourth", "augmented 4th", "augmented fourth", "diminished 4th", "diminished fourth"], answerDisplay: "4th or 4", definition: "The two boxed notes form a fourth." },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", inlineNotationControls: true, prompt: "Correct the rhythm in the box in line 8.", options: [option("dottedCrotchet", "Dot"), option("quaver", "Tail"), option("tripletQuaver", "Quaver triplet"), option("tripletCrotchet", "Crotchet triplet")], answer: "tripletCrotchet,tripletCrotchet,tripletCrotchet", answerDisplay: "Three triplet crotchets: E, D and C", definition: "The first three notes must form a crotchet triplet." },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "At line 8 the key changes to C major. Name the chords that you hear in line 9. You may use letter names or numbers. The first chord is given.", boldPhrases: ["C major"], answerReference: { heading: "Choose from the following:", rows: [["C", "Chord I"], ["F", "Chord IV"], ["G", "Chord V"], ["Am", "Chord VI"]], footer: "Insert your answers in the boxes provided." }, acceptedAnswers: ["f g", "f, g", "iv v", "iv, v", "4 5", "4, 5", "chord iv chord v", "chord iv, chord v", "chord 4 chord 5", "chord 4, chord 5"], answerDisplay: "F and G; IV and V; or 4 and 5", definition: "Both chords must be correct." },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Listening analysis", audio: { clips: [audio(4, [
          { label: "1st", time: 55.08 }, { label: "2nd", time: 132.64 }, { label: "3rd", time: 204.44 },
        ])] },
        intro: ["This question is based on vocal music.", "In this question you should identify the most prominent concepts in the music.", "As you listen, identify at least two concepts from each of the following headings.", "Style/Form", "Melody/Harmony", "Rhythm/Tempo", "", "You will hear the music three times and you should make notes as you listen.", "Rough work will not be marked.", "Marks will only be awarded for the final answer.", "After the third playing you will have 3 minutes to write your final answer in the space provided.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
        introBoldPhrases: ["two", "Style/Form", "Melody/Harmony", "Rhythm/Tempo", "three times", "Rough work will not be marked."], introHeadingRowRange: [3, 5], introCompactRange: [11, 13], introTotalMarks: 6, introTotalMarksIndex: 10, showPartMarks: false,
        subquestions: [{
          id: "q4a", label: "Final answer", marks: 6, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, finalAnswerLines: 10, endOfPaper: false, requiredResponses: 6, prompt: "Final answer",
          headings: [
            { id: "style", label: "Style/Form", concepts: [
              { label: "Chamber music", answers: ["chamber music"] }, { label: "Imitation", answers: ["imitation", "imitative"] }, { label: "Lied", answers: ["lied", "lieder"] }, { label: "Romantic", answers: ["romantic", "romantic period"] },
            ] },
            { id: "melody", label: "Melody/Harmony", concepts: [
              { label: "Acciaccatura", answers: ["acciaccatura", "grace note"] }, { label: "Dominant 7th", answers: ["dominant 7th", "dominant seventh", "dominant 7"] }, { label: "Major", answers: ["major", "major tonality", "major key"] },
              { label: "Pedal", answers: ["pedal", "pedal note"] }, { label: "Perfect cadence", answers: ["perfect cadence"] }, { label: "Syllabic", answers: ["syllabic"] },
            ] },
            { id: "rhythm", label: "Rhythm/Tempo", concepts: [
              { label: "Simple time / 2 or 4 beats", answers: ["simple time", "2/4", "2 / 4", "4/4", "4 / 4", "2 beats in the bar", "two beats in the bar", "4 beats in the bar", "four beats in the bar"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat", "pickup", "pick up"] }, { label: "A tempo", answers: ["a tempo"] }, { label: "Moderato / Andante", answers: ["moderato", "andante"] },
              { label: "Pause", answers: ["pause", "pauses"] }, { label: "Rallentando / Ritardando", answers: ["rallentando", "rall", "ritardando", "rit"] }, { label: "Rubato", answers: ["rubato"] },
            ] },
          ],
          answerDisplay: "Any six valid concepts, with no more than two credited from each heading", additionalGuidance: ["Concepts are credited even when written under a different heading."],
        }],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Baroque music", audio: { clips: [audio(5, [
          { label: "(a) 1st", time: 49.44 }, { label: "(a) 2nd", time: 130.34 }, { label: "(b)", time: 241.42 },
        ])] }, intro: "This question features Baroque music.",
        subquestions: [
          {
            id: "q5a", label: "(a)", marks: 3, type: "concept-lines", letteredConcept: true, lines: 3, requiredResponses: 3, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify three concepts in the music from those listed below.", "Read through the concepts before hearing the music."], prompt: "Insert your three answers on the lines below.", boldPhrases: ["three"],
            conceptBank: [concept("Relative major"), concept("Chromatic", ["chromatic"], true), concept("Concertino"), concept("Time changes"), concept("Through-composed"), concept("Rondo"), concept("Passacaglia", ["passacaglia"], true), concept("Tierce de Picardie", ["tierce de picardie", "picardy third"], true), concept("12/8")],
            afterAnswerLines: ["The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before part (b).", "Here is the music for the first time.", "Here is the music for the second time."],
            answerDisplay: "Passacaglia, Chromatic and Tierce de Picardie", definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q5b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Insert the concept which describes the trumpet part in this aria.", acceptedAnswers: ["obbligato"], answerDisplay: "Obbligato", definition: "The trumpet has an important independent obbligato part." },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Contrasting music", audio: { clips: [audio(6, [
          { label: "(a) 1st", time: 20.2 }, { label: "(a) 2nd", time: 53.92 }, { label: "(b) 1st", time: 112.54 }, { label: "(b) 2nd", time: 152.24 }, { label: "(c) 1st", time: 210.06 }, { label: "(c) 2nd", time: 246.6 },
        ])] }, intro: "This question features contrasting music.",
        subquestions: [
          { id: "q6a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The music will be played twice."], options: ["Diminution", "Modal", "Relative minor", "Whole tone scale"].map(value => option(value)), answer: "Modal", afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], definition: "The excerpt is modal." },
          { id: "q6b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new piece of music and insert the concept which describes the rhythmic feature at the end of the excerpt. The excerpt will be played twice.", promptLines: ["Listen to a new piece of music and insert the concept which describes the rhythmic feature at the end of the excerpt.", "The excerpt will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["augmentation"], answerDisplay: "Augmentation", definition: "The rhythm is presented in longer note values." },
          { id: "q6c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and identify the final cadence. The excerpt will be played twice.", promptLines: ["Listen to a different excerpt and identify the final cadence.", "The excerpt will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["plagal", "plagal cadence", "iv i", "iv-i", "4 1", "4-1"], answerDisplay: "Plagal cadence", definition: "The final cadence moves from chord IV to chord I." },
        ],
      },
      {
        id: "q7", number: "7", marks: 5, topic: "Comparing music", audio: { clips: [audio(7, [
          { label: "E1 1st", time: 120.22 }, { label: "E2 1st", time: 211.98 }, { label: "E1 2nd", time: 298.86 }, { label: "E2 2nd", time: 386.96 }, { label: "E1 3rd", time: 469.7 }, { label: "E2 3rd", time: 556.4 }, { label: "Column C", time: 635.4 },
        ])] },
        intro: ["This question is about comparing two excerpts of music.", "Identify concepts present in each excerpt and then decide which five concepts are common to both excerpts. Both excerpts will be played three times with a pause of 10 seconds between playings.", "As you listen, tick boxes in Column A and Column B to identify what you hear in Excerpt 1 and Excerpt 2.", "These columns are for rough work only and will not be marked.", "After the three playings of the music you will be given 2 minutes to decide which concepts are common to both excerpts and to tick five boxes in Column C.", "You now have 1 minute to read through the question.", "Here is Excerpt 1 for the first time. Remember to tick concepts in Column A.", "Here is Excerpt 2 for the first time. Remember to tick concepts in Column B.", "Here is Excerpt 1 for the second time.", "Here is Excerpt 2 for the second time.", "Here is Excerpt 1 for the third time.", "Here is Excerpt 2 for the third time.", "You now have 2 minutes to identify the five concepts common to both excerpts.", "Remember to tick five boxes only in Column C."],
        introBoldPhrases: ["five", "three", "Column A", "Column B", "Column C", "These columns are for rough work only and will not be marked.", "Remember to tick concepts in Column A.", "Remember to tick concepts in Column B.", "Remember to tick five boxes only in Column C."], introCompactRanges: [[6, 7], [8, 9], [10, 11]], introTotalMarks: 5, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q7a", label: "", marks: 5, type: "comparison-grid", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true,
          prompt: "Identify the five features common to both excerpts in Column C. Columns A and B are rough work only.", answers: ["Mass", "Sequence", "Syllabic", "Homophonic", "Ostinato"],
          columns: [{ id: "a", label: "Column A", sublabel: "Excerpt 1" }, { id: "b", label: "Column B", sublabel: "Excerpt 2" }, { id: "c", label: "Column C", sublabel: "5 features common to both" }],
          groups: [
            { label: "Styles", concepts: [concept("Mass", ["mass"], true), concept("Gospel"), concept("Recitative"), concept("Soul")] },
            { label: "Melody/Harmony", concepts: [concept("Cluster"), concept("Sequence", ["sequence"], true), concept("Inverted pedal"), concept("Syllabic", ["syllabic"], true)] },
            { label: "Rhythm", concepts: [concept("3 against 2"), concept("Rubato"), concept("Irregular time signatures")] },
            { label: "Texture/Structure/Form", concepts: [concept("Basso continuo"), concept("Homophonic", ["homophonic"], true), concept("Ostinato", ["ostinato"], true)] },
          ],
          answerDisplay: "Mass; Sequence; Syllabic; Homophonic; Ostinato", definition: "Only Column C is marked. Additional incorrect selections are deducted.",
        }],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Song features", audio: { clips: [audio(8, [
          { label: "1st", time: 108.1 }, { label: "2nd", time: 185.94 }, { label: "3rd", time: 264.42 },
        ])] },
        intro: ["This question is based on a song from a musical.", "Below is a list of features which occur in the music.", "There will now be a pause of 1 minute to allow you to read through the question.", "The song lyrics are shown in the table below. Insert each feature once in the column on the right at the point where it occurs.", "You only need to insert the underlined word."], introBoldPhrases: ["once", "three"], showPartMarks: false,
        subquestions: [{
          id: "q8a", label: "", marks: 5, type: "lyric-placement", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true,
          prompt: "Insert the five underlined words at the point where they occur. Insert each word once only.",
          playbackLines: ["The music will now be played three times with a pause of 20 seconds between playings and a pause of 30 seconds at the end.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
          features: [{ before: "first entry of voices in ", word: "harmony", after: "" }, { before: "voices in ", word: "octaves", after: "" }, { before: "", word: "contrary", after: " motion" }, { before: "first harp ", word: "glissando", after: "" }, { before: "", word: "imperfect", after: " cadence" }],
          lyricLines: [
            "Me and my girl,",
            "Meant for each other,",
            "Sent for each other",
            "And liking it so.",
            "Me and my girl,",
            "‘S’no use pretending,",
            "We knew the ending",
            "A long time ago.",
            "Some little church",
            "With a big steeple,",
            "Just a few people",
            "That both of us know,",
            "And we’ll have love, laughter",
            "Be happy ever after,",
            "Me and my girl.",
            "[Instrumental]"
          ],
          concepts: [
            { id: "harmony", label: "Harmony", answers: ["harmony", "voices in harmony"], lines: [9] }, { id: "octaves", label: "Octaves", answers: ["octaves", "voices in octaves"], lines: [13, 14] },
            { id: "contrary", label: "Contrary", answers: ["contrary", "contrary motion"], lines: [16] }, { id: "glissando", label: "Glissando", answers: ["glissando", "harp glissando"], lines: [4] },
            { id: "imperfect", label: "Imperfect", answers: ["imperfect", "imperfect cadence"], lines: [4] },
          ],
          answerDisplay: "Glissando and Imperfect—line 4; Harmony—line 9; Octaves—line 13 or 14; Contrary—line 16", definition: "Each feature earns one mark when placed on an accepted lyric line.",
        }],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
