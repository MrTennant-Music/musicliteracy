(function (root) {
  "use strict";

  const audio = (question, markers = []) => {
    const track = String(question + 1).padStart(2, "0");
    return {
      file: `../exampapers/higher/2017/${track} Track ${question + 1}-1.mp3`,
      label: "Question audio",
      maxPlaysExam: 1,
      markers,
    };
  };
  const option = (value, label = value) => ({ value, label });
  const concept = (label, answers, correct = false, options = {}) => ({ label, answers: answers || [label], correct, ...options });

  const paper = {
    id: "higher-2017",
    title: "Higher Music 2017",
    level: "Higher",
    levelCode: "H",
    year: 2017,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 60,
    sourcePath: "../exampapers/higher/2017/NH_Music_QP_2017.pdf",
    markingInstructionsPath: "../exampapers/higher/2017/mi_NH_Music_mi_2017.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 5, topic: "Vocal music", audio: { clips: [audio(1, [
          { label: "(a) 1st", time: 43.94 }, { label: "(a) 2nd", time: 107.04 },
          { label: "(b) 1st", time: 211.54 }, { label: "(b) 2nd", time: 243.94 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          {
            id: "q1a", label: "(a)", marks: 4, type: "concept-lines", letteredConcept: true, lines: 4, requiredResponses: 4, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify four concepts in the music from those listed below.", "Read through the concepts before hearing the music."],
            prompt: "Insert your four answers on the lines below.", boldPhrases: ["four"],
            conceptBank: [
              concept("Lied"), concept("Irregular time signatures", ["irregular time signature", "irregular time signatures", "irregular metre", "irregular metres"], true),
              concept("Pedal", ["pedal", "pedal note"], true), concept("Da capo aria"), concept("Oratorio"), concept("Coloratura"), concept("Ripieno"),
              concept("Glissando", ["glissando"], true), concept("Mass", ["mass"], true), concept("Harmonic minor scale"),
            ],
            afterAnswerLines: ["The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before part (b).", "Here is the music for the first time.", "Here is the music for the second time."],
            answerDisplay: "Glissando, Irregular time signatures, Mass and Pedal",
            definition: "One mark is awarded for each credited concept, in any order.",
          },
          {
            id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true,
            prompt: "Listen to a different excerpt and identify the vocal style. The excerpt will be played twice.",
            promptLines: ["Listen to a different excerpt and identify the vocal style.", "The excerpt will be played twice."],
            beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."],
            acceptedAnswers: ["recitative", "recit", "recit."], answerDisplay: "Recitative or recit.", definition: "Recitative follows the natural rhythms and inflections of speech.",
          },
        ],
      },
      {
        id: "q2", number: "2", marks: 5, topic: "Orchestral music", audio: { clips: [audio(2, [
          { label: "1st", time: 77.5 }, { label: "2nd", time: 157.96 }, { label: "3rd", time: 238.14 },
        ])] },
        layout: "higher-guide",
        intro: [
          "In this question you will hear orchestral music.",
          "A guide to the music is shown below. You are required to complete this guide by inserting music concepts.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "The music will be played three times with a pause of 20 seconds between playings. You will then have a further 30 seconds to complete your answer.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["three"],
        subquestions: [
          { id: "q2a", label: "1.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, prompt: "The instrument playing the melody is a/an [answer].", acceptedAnswers: ["bassoon"], answerDisplay: "Bassoon", definition: "The bassoon is a low-pitched double-reed woodwind instrument." },
          { id: "q2b", label: "2.", marks: 1, type: "short-text", inlineAnswer: { before: "The cadence is", after: "." }, prompt: "The cadence is [answer].", acceptedAnswers: ["perfect", "perfect cadence"], answerDisplay: "Perfect", definition: "A perfect cadence moves from chord V to chord I." },
          { id: "q2c", label: "3.", marks: 1, type: "short-text", inlineAnswer: { before: "The time signature is", after: "." }, prompt: "The time signature is [answer].", acceptedAnswers: ["2/4", "2 / 4", "4/4", "4 / 4", "c", "common time", "2", "4", "2 beats in the bar", "two beats in the bar", "4 beats in the bar", "four beats in the bar"], allowCommonSpellings: false, answerDisplay: "2/4, 4/4, common time, or 2 or 4 beats in the bar", definition: "The official marking instructions accept either simple-duple or simple-quadruple notation." },
          { id: "q2d", label: "4.", marks: 1, type: "short-text", inlineAnswer: { before: "The ornament featured is a/an", after: "." }, prompt: "The ornament featured is a/an [answer].", acceptedAnswers: ["acciaccatura", "grace note"], answerDisplay: "Acciaccatura", definition: "An acciaccatura is a short crushed grace note." },
          { id: "q2e", label: "5.", marks: 1, type: "short-text", inlineAnswer: { before: "The bass line features a descending", after: " scale." }, prompt: "The bass line features a descending [answer] scale.", acceptedAnswers: ["chromatic", "chromatic scale"], answerDisplay: "Chromatic", definition: "A chromatic scale moves in semitone steps." },
        ],
      },
      {
        id: "q3", number: "3", marks: 4, topic: "Contrasting styles", audio: { clips: [audio(3, [
          { label: "(a)", time: 7.2 }, { label: "(b) 1st", time: 89.22 }, { label: "(b) 2nd", time: 105.6 },
          { label: "(c)", time: 127.4 }, { label: "(d) 1st", time: 199.42 }, { label: "(d) 2nd", time: 232.14 },
        ])] },
        intro: "This question features contrasting styles of music.",
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Insert the concept which describes the style of the music.", acceptedAnswers: ["impressionist", "impressionism"], answerDisplay: "Impressionist or Impressionism", definition: "Impressionist music often uses colour, atmosphere and unresolved harmony." },
          { id: "q3b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe the chord outlined by the piano. The excerpt is short and will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe the chord outlined by the piano.", "The excerpt is short and will be played twice."], afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one", "twice"], options: ["Added 6th", "Diminished 7th", "Dominant 7th", "Minor"].map(value => option(value)), answer: "Diminished 7th", definition: "A diminished seventh chord is built from stacked minor thirds." },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and insert the concept which describes the style of the music.", acceptedAnswers: ["jazz funk", "jazz-funk"], alwaysBlockedAnswers: ["jazz", "funk"], answerDisplay: "Jazz funk", definition: "Both words are required." },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and identify the final chord. The excerpt will be played twice.", promptLines: ["Listen to a new excerpt and identify the final chord.", "The excerpt will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["added 6th", "added sixth", "g6", "g 6", "g added 6th", "g added sixth"], answerDisplay: "Added 6th or G6", definition: "The final chord is a G major chord with an added sixth." },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Music literacy", audio: { clips: [audio(4, [
          { label: "Guide", time: 11.78 }, { label: "2nd", time: 221.46 }, { label: "3rd", time: 309.02 }, { label: "4th", time: 397.04 },
        ])] },
        intro: [
          "This question is based on rock music.", "Listen to the song and follow the guide to the music below.", "Here is the music for the first time.",
          "You now have 2 minutes to read the question.", "All answers must be written in the boxes below.",
        ],
        introBoldPhrases: ["All answers must be written in the boxes below."],
        outro: [
          "During the next three playings complete your answers (a) to (f).",
          "The music will be played three more times with a pause of 30 seconds between playings and a pause of 2 minutes before the next question starts.",
          "Here is the music for the second time.", "Here is the music for the third time.", "Here is the music for the fourth time.",
        ],
        outroBoldPhrases: ["three"], outroCompactRange: [2, 4], outroPosition: "before-score",
        score: { key: "G major", timeSignature: "4/4", bars: 23, sharedNotation: "higher-2017-q4" }, scorePosition: "before",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", inlineNotationControls: true, prompt: "Insert the time signature at the appropriate place in the music.", options: [option("2/4", "Two-four"), option("3/4", "Three-four"), option("4/4", "Four-four"), option("6/8", "Six-eight"), option("9/8", "Nine-eight"), option("12/8", "Twelve-eight")], answer: "4/4", acceptedAnswers: ["4/4", "c"], answerDisplay: "4/4 or common time", definition: "The music has four crotchet beats in each complete bar." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Describe the interval formed by the two notes in the box in bar 3. Write your answer in the box.", boldPhrases: ["bar 3"], acceptedAnswers: ["6", "6th", "sixth", "major 6th", "major sixth", "minor 6th", "minor sixth", "augmented 6th", "augmented sixth", "diminished 6th", "diminished sixth"], answerDisplay: "6th or 6", definition: "The two notes are six letter names apart." },
          { id: "q4c", label: "(c)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: false, prompt: "What is the total value of the two notes in the box in bar 5? Write your answer in the box.", boldPhrases: ["bar 5"], acceptedAnswers: ["1.5", "1 1/2", "1½", "1.5 beats", "1 1/2 beats", "1½ beats", "one and a half", "one and a half beats"], answerDisplay: "1.5 beats", definition: "A quaver and a crotchet total one and a half beats." },
          { id: "q4d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 11. The rhythm is given above the stave.", boldPhrases: ["bar 11"], options: [], noteSlots: 3, answer: "C5,B4,G4", answerDisplay: "C crotchet, B crotchet and G quaver", definition: "All three pitches and printed rhythms must be correct." },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Name the chords that you hear in bars 16 and 17. You may use letter names or numbers. The first chord is given.", boldPhrases: ["bars 16 and 17"], answerReference: { heading: "Choose from the following:", rows: [["G", "Chord I"], ["C", "Chord IV"], ["D", "Chord V"], ["Em", "Chord VI"]], footer: "Insert your answers in the boxes provided." }, acceptedAnswers: ["d g", "d, g", "v i", "v, i", "5 1", "5, 1", "chord v chord i", "chord v, chord i", "chord 5 chord 1", "chord 5, chord 1"], answerDisplay: "D and G; V and I; or 5 and 1", definition: "Both chords must be correct." },
          { id: "q4f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Transpose the notes in the box in bar 22 one octave lower into the bass clef. Use the given blank stave.", boldPhrases: ["bar 22", "one octave lower"], options: [], noteSlots: 4, answer: "C4,G3,G3,A3", answerDisplay: "C quaver, G quaver, G quaver and A crotchet, one octave lower", definition: "All four pitch positions and their printed rhythms must be correct." },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Instrumental music", audio: { clips: [audio(5, [
          { label: "(a) 1st", time: 46.46 }, { label: "(a) 2nd", time: 117.02 }, { label: "(b) 1st", time: 232.4 }, { label: "(b) 2nd", time: 303.56 },
        ])] },
        intro: "This question features instrumental music.",
        subquestions: [
          {
            id: "q5a", label: "(a)", marks: 3, type: "concept-lines", letteredConcept: true, lines: 3, requiredResponses: 3, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify three concepts in the music from those listed below.", "Read through the concepts before hearing the music."],
            prompt: "Insert your three answers on the lines below.", boldPhrases: ["three"],
            conceptBank: [
              concept("Alberti bass"), concept("Concertino", ["concertino"], true), concept("Basso continuo", ["basso continuo"], true), concept("Rondo"),
              concept("Tierce de Picardie"), concept("Inverted pedal"), concept("Modal"),
              concept("Modulation to the relative minor", ["modulation to the relative minor", "modulates to the relative minor", "relative minor", "modulation"], true), concept("Strophic"),
            ],
            afterAnswerLines: ["The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before the next question starts.", "Here is the music for the first time.", "Here is the music for the second time."],
            answerDisplay: "Basso continuo, Concertino and Modulation to the relative minor", definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q5b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt. Insert the concept which describes the form of the music. The excerpt will be played twice.", promptLines: ["Listen to a different excerpt.", "Insert the concept which describes the form of the music.", "The excerpt will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["passacaglia"], answerDisplay: "Passacaglia", definition: "A passacaglia is built over a repeating bass or harmonic pattern." },
        ],
      },
      {
        id: "q6", number: "6", marks: 5, topic: "Comparing music", audio: { clips: [audio(6, [
          { label: "E1 1st", time: 116.32 }, { label: "E2 1st", time: 210.33 }, { label: "E1 2nd", time: 305.76 },
          { label: "E2 2nd", time: 395.22 }, { label: "E1 3rd", time: 487.68 }, { label: "E2 3rd", time: 577.88 }, { label: "Column C", time: 664.3 },
        ])] },
        intro: [
          "This question is about comparing two excerpts of music.",
          "Identify concepts present in each excerpt and then decide which five concepts are common to both excerpts. Both excerpts will be played three times with a pause of 10 seconds between playings.",
          "As you listen, tick boxes in Column A and Column B to identify what you hear in Excerpt 1 and Excerpt 2.", "These columns are for rough work only and will not be marked.",
          "After the three playings of the music you will be given 2 minutes to decide which concepts are common to both excerpts and to tick five boxes in Column C.", "You now have 1 minute to read through the question.",
          "Here is Excerpt 1 for the first time. Remember to tick concepts in Column A.", "Here is Excerpt 2 for the first time. Remember to tick concepts in Column B.",
          "Here is Excerpt 1 for the second time.", "Here is Excerpt 2 for the second time.", "Here is Excerpt 1 for the third time.", "Here is Excerpt 2 for the third time.",
          "You now have 2 minutes to identify the five concepts common to both excerpts.", "Remember to tick five boxes only in Column C.",
        ],
        introBoldPhrases: ["five", "three", "Column A", "Column B", "Column C", "These columns are for rough work only and will not be marked.", "Remember to tick concepts in Column A.", "Remember to tick concepts in Column B.", "Remember to tick five boxes only in Column C."],
        introCompactRanges: [[6, 7], [8, 9], [10, 11]], introTotalMarks: 5, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q6a", label: "", marks: 5, type: "comparison-grid", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true,
          prompt: "Identify the five features common to both excerpts in Column C. Columns A and B are rough work only.",
          answers: ["Major tonality", "Syllabic", "Time changes", "Homophonic", "Musical"],
          columns: [{ id: "a", label: "Column A", sublabel: "Excerpt 1" }, { id: "b", label: "Column B", sublabel: "Excerpt 2" }, { id: "c", label: "Column C", sublabel: "5 features common to both" }],
          groups: [
            { label: "Melody/Harmony", concepts: [concept("Major tonality", ["major tonality"], true), concept("Plagal cadence"), concept("Syllabic", ["syllabic"], true)] },
            { label: "Rhythm", concepts: [concept("3 against 2"), concept("Diminution"), concept("Time changes", ["time changes"], true), concept("Augmentation")] },
            { label: "Texture/Structure/Form", concepts: [concept("Homophonic", ["homophonic"], true), concept("Cadenza"), concept("Ground bass")] },
            { label: "Style", concepts: [concept("Gospel"), concept("Soul"), concept("Opera"), concept("Musical", ["musical"], true)] },
          ],
          answerDisplay: "Major tonality; Syllabic; Time changes; Homophonic; Musical", definition: "Only Column C is marked. Additional incorrect selections are deducted.",
        }],
      },
      {
        id: "q7", number: "7", marks: 6, topic: "Listening analysis", audio: { clips: [audio(7, [
          { label: "1st", time: 49.32 }, { label: "2nd", time: 125.86 }, { label: "3rd", time: 203.12 },
        ])] },
        intro: [
          "This question is based on film music.", "In this question you should identify the most prominent concepts in the music.",
          "As you listen, identify at least two concepts from each of the following headings.", "Melody/Harmony", "Rhythm", "Timbre", "",
          "You will hear the music three times and you should make notes as you listen.", "Rough work will not be marked.", "Marks will only be awarded for the final answer.",
          "After the third playing you will have 3 minutes to write your final answer in the space provided.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["two", "Melody/Harmony", "Rhythm", "Timbre", "three times", "Rough work will not be marked."], introHeadingRowRange: [3, 5], introCompactRange: [11, 13], introTotalMarks: 6, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q7a", label: "Final answer", marks: 6, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, finalAnswerLines: 10, endOfPaper: false, requiredResponses: 6, prompt: "Final answer",
          headings: [
            { id: "melody", label: "Melody/Harmony", concepts: [
              { label: "Dominant 7th", answers: ["dominant 7th", "dominant seventh", "dominant 7"] }, { label: "Major", answers: ["major", "major tonality", "major key"] },
              { label: "Minor", answers: ["minor", "minor tonality", "minor key"] }, { label: "Modulation / key change", answers: ["modulation", "modulates", "key change", "change of key"] },
              { label: "Perfect cadence", answers: ["perfect cadence"] }, { label: "Vamp", answers: ["vamp"] },
            ] },
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "3/4 / Waltz", answers: ["3/4", "3 / 4", "waltz", "3 beats in the bar", "three beats in the bar"] },
              { label: "4/4 / 2/4", answers: ["4/4", "4 / 4", "2/4", "2 / 4", "4 beats in the bar", "four beats in the bar", "2 beats in the bar", "two beats in the bar"] },
              { label: "Anacrusis", answers: ["anacrusis", "upbeat", "pickup", "pick up"] }, { label: "Pause", answers: ["pause", "pauses"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] }, { label: "Time changes", answers: ["time changes", "time change", "irregular time signature", "irregular time signatures", "irregular metre", "irregular metres"] },
            ] },
            { id: "timbre", label: "Timbre", concepts: [
              { label: "Arco", answers: ["arco"] }, { label: "Clarinet", answers: ["clarinet", "clarinets"] }, { label: "Con sordino / Muted", answers: ["con sordino", "muted", "mute"] },
              { label: "Oboe", answers: ["oboe", "oboes"] }, { label: "Pizzicato", answers: ["pizzicato", "pizz"] }, { label: "Tremolando", answers: ["tremolando", "tremolo"] },
              { label: "Trumpet", answers: ["trumpet", "trumpets"] }, { label: "Violin", answers: ["violin", "violins"] }, { label: "Banjo", answers: ["banjo"] }, { label: "Mandolin", answers: ["mandolin"] },
            ] },
          ],
          answerDisplay: "Any six valid concepts, with no more than two credited from each heading", additionalGuidance: ["Concepts are credited even when written under a different heading."],
        }],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Song features", audio: { clips: [audio(8, [
          { label: "1st", time: 106.52 }, { label: "2nd", time: 200.54 }, { label: "3rd", time: 295.42 },
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
          playbackLines: ["The music will now be played three times with a pause of 20 seconds between playings and a pause of 30 seconds at the end.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
          features: [
            { before: "first appearance of ", word: "cello", after: "" }, { before: "the second ", word: "drum roll", after: "" },
            { before: "ascending ", word: "dominant 7th", after: " arpeggio" }, { before: "", word: "octave", after: " leap in voice" },
            { before: "first appearance of ", word: "xylophone", after: "" },
          ],
          lyricLines: [
            "All you have to do is",
            "Move your voice much higher",
            "High, low, high, low",
            "High it’s just like talking, only you",
            "Sustain it and you make it sound",
            "Pretty. No.",
            "Just sing a Christmas song.",
            "like magic if things go wrong.",
            "Just spread some Christmas cheer",
            "By singing loud for all to hear.",
            "“People are staring,",
            "Well that’s the point”",
            "Just sing a Christmas song",
            "And keep on singing all season long.",
            "Think of the joy you’ll bring if",
            "You just close your eyes and sing",
            "And if you’re short on cheer,",
            "Think about that year."
          ],
          concepts: [
            { id: "cello", label: "Cello", answers: ["cello"], lines: [6, 7] }, { id: "drum-roll", label: "Drum roll", answers: ["drum roll", "roll"], lines: [16] },
            { id: "dominant-7th", label: "Dominant 7th", answers: ["dominant 7th", "dominant seventh", "dominant 7"], lines: [4, 5, 6] },
            { id: "octave", label: "Octave", answers: ["octave", "octave leap"], lines: [3] }, { id: "xylophone", label: "Xylophone", answers: ["xylophone"], lines: [10] },
          ],
          answerDisplay: "Octave—line 3; Dominant 7th—line 4, 5 or 6; Cello—line 6 or 7; Xylophone—line 10; Drum roll—line 16",
          definition: "Each feature earns one mark when placed on an accepted lyric line.",
        }],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
