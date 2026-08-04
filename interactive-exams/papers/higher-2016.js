(function (root) {
  "use strict";

  const audio = (question, markers = []) => ({
    file: "../exampapers/higher/2016/Question " + question + "-1.mp3",
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value) => ({ value, label });
  const concept = (label, answers, correct = false, options = {}) => ({ label, answers: answers || [label], correct, ...options });

  const paper = {
    id: "higher-2016",
    title: "Higher Music 2016",
    level: "Higher",
    levelCode: "H",
    year: 2016,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 60,
    sourcePath: "../exampapers/higher/2016/NH_Music_QP_2016.pdf",
    markingInstructionsPath: "../exampapers/higher/2016/mi_NH_Music_mi_2016.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 4, topic: "Instrumental music", audio: { clips: [audio(1, [
          { label: "(a) 1st", time: 45 }, { label: "(a) 2nd", time: 120.5 }, { label: "(b)", time: 227.12 },
        ])] },
        intro: "This question features instrumental music.",
        showPartMarks: true,
        subquestions: [
          {
            id: "q1a", label: "(a)", marks: 3, type: "concept-lines", letteredConcept: true, lines: 3, requiredResponses: 3, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify three concepts in the music from those listed below.", "Read through the concepts before hearing the music."],
            prompt: "Insert your three answers on the lines below.", boldPhrases: ["three"],
            conceptBank: [
              concept("Passacaglia"), concept("Basso continuo", ["basso continuo"], true), concept("Ritornello", ["ritornello"], true),
              concept("Time changes"), concept("Inverted pedal"), concept("Diminution"), concept("Obbligato"), concept("Rubato"),
              concept("Perfect cadence", ["perfect cadence"], true),
            ],
            afterAnswerLines: ["The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before the next question starts.", "Here is the music for the first time.", "Here is the music for the second time."],
            answerDisplay: "Ritornello, Perfect cadence and Basso continuo",
            definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt. Name the playing technique featured by the cello.", acceptedAnswers: ["harmonics", "harmonic"], answerDisplay: "Harmonics or harmonic", definition: "Harmonics are light, high notes produced by touching a string at a nodal point." },
        ],
      },
      {
        id: "q2", number: "2", marks: 5, topic: "Instrumental music", audio: { clips: [audio(2, [
          { label: "1st", time: 72.98 }, { label: "2nd", time: 178.02 }, { label: "3rd", time: 283.96 },
        ])] },
        layout: "higher-guide",
        intro: [
          "This question features instrumental music.",
          "A guide to the music is shown below. You are required to complete this guide by inserting music concepts.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "The music will be played three times with a pause of 20 seconds between playings. You will then have a further 30 seconds to complete your answer.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["three"],
        subquestions: [
          { id: "q2a", label: "1.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, prompt: "The instrument playing the melody is a/an [answer].", acceptedAnswers: ["oboe"], answerDisplay: "Oboe", definition: "The oboe is a double-reed woodwind instrument." },
          { id: "q2b", label: "2.", marks: 1, type: "short-text", inlineAnswer: { before: "The rhythmic feature heard in the accompanying instruments is", after: "." }, prompt: "The rhythmic feature heard in the accompanying instruments is [answer].", acceptedAnswers: ["syncopation", "syncopated", "ostinato"], allowCommonSpellings: false, answerDisplay: "Syncopation or ostinato", definition: "The marking instructions accept syncopation or ostinato, but not repetition or riff." },
          { id: "q2c", label: "3.", marks: 1, type: "short-text", inlineAnswer: { before: "The playing technique used by the upper strings is", after: " (Italian term)." }, prompt: "The playing technique used by the upper strings is [answer] (Italian term).", acceptedAnswers: ["arco"], answerDisplay: "Arco", definition: "Arco instructs string players to use the bow." },
          { id: "q2d", label: "4.", marks: 1, type: "short-text", inlineAnswer: { before: "The bass features a/an", after: " note." }, prompt: "The bass features a/an [answer] note.", acceptedAnswers: ["pedal", "pedal note"], answerDisplay: "Pedal", definition: "A pedal is a sustained or repeated note beneath changing harmony." },
          { id: "q2e", label: "5.", marks: 1, type: "short-text", inlineAnswer: { before: "The melody features a/an", after: " minor scale." }, prompt: "The melody features a/an [answer] minor scale.", acceptedAnswers: ["melodic", "melodic minor"], answerDisplay: "Melodic", definition: "The melodic minor scale raises its sixth and seventh notes when ascending." },
        ],
      },
      {
        id: "q3", number: "3", marks: 3, topic: "Contrasting styles", audio: { clips: [audio(3, [
          { label: "(a)", time: 6.78 }, { label: "(b)", time: 55.3 }, { label: "(c)", time: 102.68 },
        ])] },
        intro: "This question features music in contrasting styles.",
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and identify the style of the music.", acceptedAnswers: ["musique concrète", "musique concrete", "musique-concrète", "musique-concrete"], answerDisplay: "Musique concrète", definition: "Musique concrète uses recorded sounds as compositional material." },
          { id: "q3b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and describe the time signature.", acceptedAnswers: ["irregular time signature", "irregular time signatures", "irregular", "irregular metre", "irregular metres", "time changes", "7 beats in the bar", "seven beats in the bar", "7/4", "7/8"], answerDisplay: "Irregular time signature; any indication of 7 beats in the bar is also accepted", definition: "An irregular time signature groups beats unevenly, such as seven beats in a bar." },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and identify the style of the music.", acceptedAnswers: ["jazz funk", "jazz-funk"], alwaysBlockedAnswers: ["jazz", "funk"], answerDisplay: "Jazz funk", definition: "Both words are required: jazz or funk on its own is not accepted." },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Music literacy", audio: { clips: [audio(4, [
          { label: "Guide", time: 14.86 }, { label: "2nd", time: 259.14 }, { label: "3rd", time: 381.04 }, { label: "4th", time: 503.46 },
        ])] },
        intro: [
          "This question is based on an arrangement of a traditional song.",
          "Listen to the excerpt and follow the guide to the music below.", "Here is the music for the first time.",
          "You now have 2 minutes to read the question.", "All answers must be written in the boxes below.",
        ],
        introBoldPhrases: ["All answers must be written in the boxes below."],
        outro: [
          "During the next three playings complete your answers (a) to (f).",
          "The music will be played three more times with a pause of 30 seconds between playings and a pause of 2 minutes before the next question starts.",
          "Here is the music for the second time.", "Here is the music for the third time.", "Here is the music for the fourth time.",
        ],
        outroBoldPhrases: ["three"], outroCompactRange: [2, 4], outroPosition: "before-score",
        score: { key: "F major", timeSignature: "4/4", bars: 16, sharedNotation: "higher-2016-q4" }, scorePosition: "before",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Name the key of the music. Write your answer in the box at the beginning.", acceptedAnswers: ["f", "f major"], alwaysBlockedAnswers: ["f minor", "f flat"], answerDisplay: "F major or F", definition: "The key signature has one flat and the music is in F major." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Name the ornament heard in bar 2. Write your answer in the box.", boldPhrases: ["bar 2"], acceptedAnswers: ["mordent", "upper mordent", "lower mordent"], answerDisplay: "Mordent", definition: "Any reference to a mordent is accepted." },
          { id: "q4c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", inlineNotationControls: true, prompt: "Correct the rhythm in bar 5 to match what you hear.", boldPhrases: ["bar 5"], options: [option("dottedCrotchet", "Dot"), option("quaver", "Quaver tail")], answer: "dottedCrotchet,quaver", answerDisplay: "A dotted crotchet followed by a quaver on A and G", definition: "Both corrected rhythms must be placed on the correct notes." },
          { id: "q4d", label: "(d)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Describe the interval formed by the two notes in the box in bar 8. Write your answer in the box.", boldPhrases: ["bar 8"], acceptedAnswers: ["5", "5th", "fifth", "perfect 5th", "perfect fifth", "augmented 5th", "augmented fifth", "diminished 5th", "diminished fifth"], answerDisplay: "5th or 5", definition: "The two notes form a fifth." },
          { id: "q4e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Complete the last three notes in bar 14. The rhythm is given above the stave.", boldPhrases: ["last three notes", "bar 14"], options: [], noteSlots: 3, answer: "E4,F4,G4", answerDisplay: "E, F and G quavers", definition: "All three pitches and rhythms must be correct." },
          { id: "q4f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Transpose the last 5 notes one octave lower into the bass clef. Use the given blank bars.", boldPhrases: ["last 5 notes", "one octave lower"], options: [], noteSlots: 6, answer: "G3,F3,D3,E3,F3,F3", answerDisplay: "G, F, D and E quavers followed by F tied minim and its separately entered tied quaver, one octave lower", definition: "All six written pitches and rhythms must be correct." },
        ],
      },
      {
        id: "q5", number: "5", marks: 6, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a) 1st", time: 47.8 }, { label: "(a) 2nd", time: 127.4 }, { label: "(a) 3rd", time: 206.7 },
          { label: "(b)", time: 316.06 }, { label: "(c) 1st", time: 379.22 }, { label: "(c) 2nd", time: 419.62 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          {
            id: "q5a", label: "(a)", marks: 4, type: "concept-lines", letteredConcept: true, lines: 4, requiredResponses: 4, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify four concepts in the music from those listed below.", "Read through the concepts before hearing the music."],
            prompt: "Insert your four answers on the lines below.", boldPhrases: ["four"],
            conceptBank: [
              concept("Da capo aria"), concept("Recitative"), concept("Through-composed"), concept("Strophic", ["strophic", "strophic form"], true),
              concept("Lied", ["lied"], true, { allowCommonSpellings: false }), concept("Plagal cadence"), concept("Interrupted cadence", ["interrupted cadence"], true),
              concept("Diminished 7th", ["diminished 7th", "diminished seventh", "diminished 7", "dim 7", "dim7"], true),
              concept("Accelerando"), concept("Tierce de Picardie"),
            ],
            afterAnswerLines: ["The music will be played three times with a pause of 10 seconds between playings and a pause of 40 seconds before the next question starts.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
            answerDisplay: "Lied, Interrupted cadence, Strophic and Diminished 7th",
            definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q5b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and identify the vocal technique.", acceptedAnswers: ["coloratura"], answerDisplay: "Coloratura", definition: "Coloratura is elaborate, agile ornamentation in a vocal line." },
          { id: "q5c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to the following excerpt and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to the following excerpt and tick one box to describe what you hear.", "The music will be played twice."], afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one", "twice"], options: ["Modal", "Augmentation", "Added 6th", "Major"].map(value => option(value)), answer: "Modal", definition: "Modal music is based on a mode rather than the usual major or minor scale system." },
        ],
      },
      {
        id: "q6", number: "6", marks: 6, topic: "Listening analysis", audio: { clips: [audio(6, [
          { label: "1st", time: 53.92 }, { label: "2nd", time: 138.32 }, { label: "3rd", time: 223.76 },
        ])] },
        intro: [
          "This question is based on an excerpt of instrumental music.",
          "In this question you should identify the most prominent concepts in the music.",
          "As you listen, identify at least two concepts from each of the following headings.",
          "Melody/harmony", "Rhythm", "Timbre", "",
          "You will hear the music three times and you should make notes as you listen.",
          "Rough work will not be marked.", "Marks will only be awarded for the final answer.",
          "After the third playing you will have 3 minutes to write your final answer in the space provided.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["two", "Melody/harmony", "Rhythm", "Timbre", "three times", "Rough work will not be marked."], introHeadingRowRange: [3, 5], introCompactRange: [11, 13], introTotalMarks: 6, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q6a", label: "Final answer", marks: 6, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, finalAnswerLines: 10, endOfPaper: false, requiredResponses: 6, prompt: "Final answer",
          headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Acciaccatura / grace notes / ornament", answers: ["acciaccatura", "grace note", "grace notes", "ornament", "ornaments"] },
              { label: "Countermelody", answers: ["countermelody", "counter melody"] }, { label: "Discord", answers: ["discord", "discords", "dissonance", "dissonant"] },
              { label: "Major", answers: ["major", "major key", "major tonality"] }, { label: "Modulation / key change", answers: ["modulation", "modulates", "key change", "change of key"] },
              { label: "Mordent / turn", answers: ["mordent", "mordents", "turn", "turns"] }, { label: "Pedal", answers: ["pedal", "pedal note"] },
              { label: "Perfect cadence", answers: ["perfect cadence"] },
              { label: "Scale", answers: ["scale", "scales", "major scale", "ascending scale", "descending scale", "ascending scales", "descending scales"], alwaysBlockedAnswers: ["minor scale", "chromatic scale", "pentatonic scale", "whole tone scale", "whole-tone scale"] },
            ] },
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "Accents / sforzando", answers: ["accent", "accents", "accented", "sforzando", "sfz"] }, { label: "Anacrusis", answers: ["anacrusis", "upbeat", "up beat", "pickup", "pick up"] },
              { label: "Rallentando / ritardando", answers: ["rallentando", "rall", "ritardando", "rit"] }, { label: "Rubato", answers: ["rubato"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated", "off beat", "off the beat"] },
              { label: "Time changes / irregular time signatures", answers: ["time changes", "time change", "irregular time signature", "irregular time signatures", "irregular metre", "irregular metres"] },
              { label: "3/4 / waltz", answers: ["3/4", "3 / 4", "waltz", "3 beats in a bar", "three beats in a bar"] },
            ] },
            { id: "timbre", label: "Timbre", concepts: [
              { label: "Flute", answers: ["flute", "flutes"] }, { label: "Glockenspiel", answers: ["glockenspiel"] },
              { label: "Saxophone", answers: ["saxophone", "saxophones", "sax", "alto saxophone", "alto sax"] }, { label: "Trumpet", answers: ["trumpet", "trumpets"] },
              { label: "Tuba", answers: ["tuba"] }, { label: "Xylophone / marimba", answers: ["xylophone", "marimba"] },
            ] },
          ],
          answerDisplay: "Any six valid concepts, with no more than two credited from each heading",
          additionalGuidance: ["Concepts are credited even when written under a different heading."],
        }],
      },
      {
        id: "q7", number: "7", marks: 5, topic: "Comparing music", audio: { clips: [audio(7, [
          { label: "E1 1st", time: 121.82 }, { label: "E2 1st", time: 191.56 }, { label: "E1 2nd", time: 292.12 },
          { label: "E2 2nd", time: 356.54 }, { label: "E1 3rd", time: 455.22 }, { label: "E2 3rd", time: 521.56 }, { label: "Column C", time: 611.56 },
        ])] },
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
        introBoldPhrases: ["five", "three", "Column A", "Column B", "Column C", "These columns are for rough work only and will not be marked.", "Remember to tick concepts in Column A.", "Remember to tick concepts in Column B.", "Remember to tick five boxes only in Column C."],
        introCompactRanges: [[6, 7], [8, 9], [10, 11]], introTotalMarks: 5, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q7a", label: "", marks: 5, type: "comparison-grid", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true,
          prompt: "Identify the five features common to both excerpts in Column C. Columns A and B are rough work only.",
          answers: ["Dominant 7th", "Trill", "Alberti bass", "Simple time", "Classical"],
          columns: [{ id: "a", label: "Column A", sublabel: "Excerpt 1" }, { id: "b", label: "Column B", sublabel: "Excerpt 2" }, { id: "c", label: "Column C", sublabel: "5 features common to both" }],
          groups: [
            { label: "Melody/harmony", concepts: [concept("Acciaccatura"), concept("Dominant 7th", ["dominant 7th", "dominant seventh", "dominant 7"], true), concept("Plagal cadence"), concept("Trill", ["trill"], true)] },
            { label: "Texture", concepts: [concept("Alberti bass", ["alberti bass"], true), concept("Cadenza"), concept("Rondo")] },
            { label: "Rhythm/Tempo", concepts: [concept("3 against 2"), concept("4 beats in the bar"), concept("Simple time", ["simple time"], true)] },
            { label: "Styles", concepts: [concept("Impressionist"), concept("Classical", ["classical"], true), concept("String quartet")] },
          ],
          answerDisplay: "Dominant 7th; Trill; Alberti bass; Simple time; Classical",
          definition: "Only Column C is marked. One mark is awarded for each correct common feature, with deductions for additional incorrect choices.",
        }],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Song features", audio: { clips: [audio(8, [
          { label: "1st", time: 108.84 }, { label: "2nd", time: 230.54 }, { label: "3rd", time: 352.56 },
        ])] },
        intro: [
          "This question is based on a song from a musical.", "Below is a list of features which occur in the music.",
          "There will now be a pause of 1 minute to allow you to read through the question.",
          "The song lyrics are shown in the table below. Insert each feature once in the column on the right at the point where it occurs.",
          "You only need to insert the underlined word.",
        ],
        introBoldPhrases: ["once", "three"], showPartMarks: false,
        subquestions: [{
          id: "q8a", label: "", marks: 5, type: "lyric-placement", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true,
          prompt: "Insert the five underlined words at the point where they occur. Insert each word once only.",
          playbackLines: [
            "The music will now be played three times with a pause of 20 seconds between playings and a pause of 30 seconds at the end.",
            "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
          ],
          features: [
            { before: "", word: "modulation", after: "" }, { before: "", word: "glockenspiel", after: "" },
            { before: "the first example of ", word: "ritardando", after: "" }, { before: "first appearance of ", word: "tremolando", after: "" },
            { before: "dominant 7th ", word: "arpeggio", after: "" },
          ],
          lyricLines: [
            "A human being's made of more than air.",
            "With all that bulk you're bound to see him there.",
            "Unless that human being next to you",
            "Is unimpressive, undistinguished",
            "You, know, who",
            "Instrumental",
            "Should have been my name,",
            "Mister Cellophane,",
            "Cause you can look right through me,",
            "Walk right by me,",
            "And never know I'm there.",
            "I tell ya Cellophane",
            "Mister Cellophane should have been my name.",
            "Mister Cellophane",
            "'cause you can look right through me",
            "Walk right by me",
            "And never know I'm there.",
            "Never even know",
            "I'm there",
            "I hope I haven't taken up too much of your time."
          ],
          concepts: [
            { id: "ritardando", label: "Ritardando", answers: ["ritardando", "rit", "rit."], lines: [3, 4] },
            { id: "arpeggio", label: "Arpeggio", answers: ["arpeggio", "dominant 7th arpeggio", "dominant seventh arpeggio"], lines: [5] },
            { id: "modulation", label: "Modulation", answers: ["modulation"], lines: [6, 12] },
            { id: "tremolando", label: "Tremolando", answers: ["tremolando"], lines: [6] },
            { id: "glockenspiel", label: "Glockenspiel", answers: ["glockenspiel"], lines: [19] },
          ],
          answerDisplay: "Ritardando—line 3 or 4; Arpeggio—line 5; Modulation—line 6 or 12; Tremolando—line 6; Glockenspiel—line 19",
          definition: "Each feature earns one mark when placed on an accepted lyric line.",
        }],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
