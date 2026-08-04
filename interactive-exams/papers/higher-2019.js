(function (root) {
  "use strict";

  const audio = (question, markers = []) => {
    const track = String(question + 1).padStart(2, "0");
    return { file: `../exampapers/higher/2019/Music H 2019 - Track ${track}-1.mp3`, label: "Question audio", maxPlaysExam: 1, markers };
  };
  const option = (value, label = value) => ({ value, label });
  const concept = (label, answers, correct = false, options = {}) => ({ label, answers: answers || [label], correct, ...options });

  const paper = {
    id: "higher-2019",
    title: "Higher Music 2019",
    level: "Higher",
    levelCode: "H",
    year: 2019,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 60,
    sourcePath: "../exampapers/higher/2019/Music H 2019 Paper.pdf",
    markingInstructionsPath: "../exampapers/higher/2019/Music H 2019 Answers.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 5, topic: "Vocal music", audio: { clips: [audio(1, [
          { label: "(a) 1st", time: 42.64 }, { label: "(a) 2nd", time: 107.28 }, { label: "(b)", time: 202.18 }, { label: "(c)", time: 272.94 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          {
            id: "q1a", label: "(a)", marks: 3, type: "concept-lines", letteredConcept: true, lines: 3, requiredResponses: 3, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify three concepts in the music from those listed below.", "Read through the concepts before hearing the music."], prompt: "Give your three answers on the lines below.", boldPhrases: ["three"],
            conceptBank: [concept("Obbligato", ["obbligato"], true), concept("Lied"), concept("Coloratura"), concept("Modal"), concept("3 against 2"), concept("Melismatic", ["melismatic"], true), concept("Soul music"), concept("Gospel"), concept("Oratorio", ["oratorio"], true)],
            beforeAnswerLines: ["The music will be played twice with a pause of 10 seconds between playings and a pause of 40 seconds before part (b)."],
            afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."],
            answerDisplay: "Melismatic, Obbligato and Oratorio", definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and identify the vocal style. The music will be played twice.", promptLines: ["Listen to a different excerpt and identify the vocal style.", "The music will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["recitative", "recit"], answerDisplay: "Recitative or recit", definition: "The vocal style is recitative." },
          { id: "q1c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a new excerpt and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to a new excerpt and tick one box to describe what you hear.", "The music will be played twice."], beforeAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time."], options: ["Augmentation", "Diminution", "Interrupted cadence", "Plagal cadence"].map(value => option(value)), answer: "Plagal cadence", definition: "The excerpt ends with a plagal cadence." },
        ],
      },
      {
        id: "q2", number: "2", marks: 5, topic: "Musical guide", audio: { clips: [audio(2, [
          { label: "1st", time: 77.18 }, { label: "2nd", time: 173.36 }, { label: "3rd", time: 270.82 },
        ])] }, layout: "higher-guide",
        intro: ["In this question you will hear instrumental music.", "A guide to the music is shown below. You are required to complete this guide by inserting music concepts.", "There will now be a pause of 30 seconds to allow you to read through the question.", "The music will be played three times, with a pause of 20 seconds between playings. You will then have a further 30 seconds to complete your answer.", "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."], introCompactRange: [5, 7],
        subquestions: [
          { id: "q2a", label: "1.", marks: 1, type: "short-text", inlineAnswer: { before: "The opening is based on part of a", after: "minor scale." }, prompt: "The opening is based on part of a [answer] minor scale.", acceptedAnswers: ["harmonic"], answerDisplay: "Harmonic", definition: "The opening uses part of a harmonic minor scale." },
          { id: "q2b", label: "2.", marks: 1, type: "short-text", inlineAnswer: { before: "The Italian term for sliding between notes is", after: "." }, prompt: "The Italian term for sliding between notes is [answer].", acceptedAnswers: ["glissando", "portamento"], answerDisplay: "Glissando or portamento", definition: "Both Italian terms are accepted by the marking instructions." },
          { id: "q2c", label: "3.", marks: 1, type: "short-text", inlineAnswer: { before: "The instrument playing the lower part is a/an", after: "." }, prompt: "The instrument playing the lower part is a/an [answer].", acceptedAnswers: ["double bass", "string bass"], alwaysBlockedAnswers: ["bass"], answerDisplay: "Double bass or string bass", definition: "Bass on its own is not accepted." },
          { id: "q2d", label: "4.", marks: 1, type: "short-text", inlineAnswer: { before: "A third instrument starts playing. The technique used by this instrument is", after: "." }, prompt: "A third instrument starts playing. The technique used by this instrument is [answer].", acceptedAnswers: ["tremolando", "tremolo"], answerDisplay: "Tremolando or tremolo", definition: "The third instrument uses tremolando." },
          { id: "q2e", label: "5.", marks: 1, type: "short-text", inlineAnswer: { before: "The structure/form of this piece is a/an", after: "." }, prompt: "The structure/form of this piece is a/an [answer].", acceptedAnswers: ["passacaglia", "ground bass"], answerDisplay: "Passacaglia or ground bass", definition: "Both descriptions are accepted by the marking instructions." },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music literacy", audio: { clips: [audio(3, [
          { label: "Guide", time: 12.22 }, { label: "2nd", time: 218.24 }, { label: "3rd", time: 304.16 }, { label: "4th", time: 390.24 },
        ])] },
        intro: ["This question is based on a song.", "Listen to the excerpt and follow the guide to the music below.", "Here is the music for the first time.", "You now have 2 minutes to read the question.", "All answers must be written in the boxes below."], introBoldPhrases: ["All answers must be written in the boxes below."],
        outro: ["During the next three playings complete your answers (a) to (f).", "The music will be played three more times with a pause of 30 seconds between playings and a pause of 2 minutes before the next question starts.", "Here is the music for the second time.", "Here is the music for the third time.", "Here is the music for the fourth time."], outroBoldPhrases: ["three"], outroCompactRange: [2, 4], outroPosition: "before-score",
        score: { key: "F major", timeSignature: "6/8", bars: 25, sharedNotation: "higher-2019-q3" }, scorePosition: "before",
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", inlineNotationControls: true, prompt: "Insert the time signature at the appropriate place in the music.", options: [option("2/4", "Two-four"), option("3/4", "Three-four"), option("4/4", "Four-four"), option("6/8", "Six-eight"), option("9/8", "Nine-eight"), option("12/8", "Twelve-eight")], answer: "6/8", answerDisplay: "6/8", definition: "The complete time signature must be inserted using the musical symbol." },
          { id: "q3b", label: "(b)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Describe the interval formed by the two notes in the box in bars 2 and 3. Write your answer in the box.", acceptedAnswers: ["5", "5th", "fifth", "perfect 5th", "perfect fifth", "augmented 5th", "augmented fifth", "diminished 5th", "diminished fifth"], answerDisplay: "5th or 5", definition: "The two boxed notes form a fifth." },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", answerInScore: true, capitaliseAnswer: true, prompt: "Name the chords that you hear in bars 10 and 11. You may use letter names or numbers. The chord in bar 9 is given.", answerReference: { heading: "Choose from the following:", rows: [["F", "Chord I"], ["B♭", "Chord IV"], ["C", "Chord V"], ["Dm", "Chord VI"]], footer: "Insert your answers in the boxes provided." }, acceptedAnswers: ["c dm", "c, dm", "v vi", "v, vi", "5 6", "5, 6", "chord v chord vi", "chord v, chord vi", "chord 5 chord 6", "chord 5, chord 6"], answerDisplay: "C and Dm; V and VI; or 5 and 6", definition: "Both chords must be correct." },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bars 14 and 15. The rhythm is given above the stave.", options: [], noteSlots: 2, answer: "G4,F4", answerDisplay: "G4 dotted minim and F4 dotted minim", definition: "The pitch and rhythm of both notes must be correct." },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "rhythm-entry", inlineNotationControls: true, prompt: "Insert the missing rest in bar 21.", options: [option("semibreveRest", "Whole rest"), option("minimRest", "Minim rest"), option("crotchetRest", "Crotchet rest"), option("quaverRest", "Quaver rest")], answer: "quaverRest", answerDisplay: "Quaver rest before the first note in bar 21", definition: "The quaver rest may be placed anywhere before the first note in bar 21." },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Transpose the notes in the box in bar 24 one octave lower into the bass clef. Use the given blank stave.", boldPhrases: ["one octave lower"], options: [], noteSlots: 4, answer: "A3,A3,C4,A3", answerDisplay: "A3 quaver tied to A3 quaver, C4 quaver and A3 quaver", definition: "The pitch and rhythm of all four notes must be correct; the tie may be above or below." },
        ],
      },
      {
        id: "q4", number: "4", marks: 3, topic: "Contrasting music", audio: { clips: [audio(4, [
          { label: "(a) 1st", time: 18.66 }, { label: "(a) 2nd", time: 64.08 }, { label: "(b)", time: 114.82 },
        ])] }, intro: "This question features contrasting music.",
        subquestions: [
          { id: "q4ai", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, markOnAnswerPrompt: true, answerPromptLabel: "(i)", answerPrompt: "Identify the playing technique used by the guitar.", prompt: "Identify the playing technique used by the guitar.", promptLines: ["Listen to this excerpt and answer parts (i) and (ii).", "The music will be played twice.", "", "Here is the music for the first time.", "Here is the music for the second time."], acceptedAnswers: ["harmonics", "harmonic"], answerDisplay: "Harmonics", definition: "The guitar uses harmonics." },
          { id: "q4aii", label: "(ii)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Identify the ornament.", acceptedAnswers: ["mordent", "upper mordent", "lower mordent"], answerDisplay: "Mordent", definition: "Any mordent is accepted." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new piece of music and identify the style.", acceptedAnswers: ["sonata", "chamber music"], answerDisplay: "Sonata or chamber music", definition: "Either style is accepted by the marking instructions." },
        ],
      },
      {
        id: "q5", number: "5", marks: 5, topic: "Comparing music", audio: { clips: [audio(5, [
          { label: "E1 1st", time: 115.78 }, { label: "E2 1st", time: 204.14 }, { label: "E1 2nd", time: 290.04 }, { label: "E2 2nd", time: 373.24 }, { label: "E1 3rd", time: 454.56 }, { label: "E2 3rd", time: 537.38 }, { label: "Column C", time: 610.02 },
        ])] },
        intro: ["In this question you compare two excerpts of music.", "You must first identify concepts present in each excerpt and then decide which five concepts are common to both excerpts. Both excerpts will be played three times with a pause of 10 seconds between playings.", "As you listen, tick boxes in Column A and Column B to identify what you hear in Excerpt 1 and Excerpt 2.", "These columns are for rough work only and will not be marked.", "After the music has been played three times you will be given 2 minutes to decide which concepts are common to both excerpts and to tick five boxes in Column C.", "You now have one minute to read through the question.", "Here is Excerpt 1 for the first time. Remember to tick concepts in Column A.", "Here is Excerpt 2 for the first time. Remember to tick concepts in Column B.", "Here is Excerpt 1 for the second time.", "Here is Excerpt 2 for the second time.", "Here is Excerpt 1 for the third time.", "Here is Excerpt 2 for the third time.", "You now have 2 minutes to identify the five concepts common to both excerpts.", "Remember to tick five boxes only in Column C."], introBoldPhrases: ["five", "three", "Column A", "Column B", "Column C", "These columns are for rough work only and will not be marked.", "Remember to tick concepts in Column A.", "Remember to tick concepts in Column B.", "Remember to tick five boxes only in Column C."], introCompactRanges: [[6, 7], [8, 9], [10, 11]], introTotalMarks: 5, introTotalMarksIndex: 13, showPartMarks: false,
        subquestions: [{
          id: "q5a", label: "", marks: 5, type: "comparison-grid", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true, prompt: "Identify the five features common to both excerpts in Column C. Columns A and B are rough work only.", answers: ["Chamber music", "Modulation to relative major", "Perfect cadence", "Simple time", "Imitation"],
          columns: [{ id: "a", label: "Column A", sublabel: "Excerpt 1" }, { id: "b", label: "Column B", sublabel: "Excerpt 2" }, { id: "c", label: "Column C", sublabel: "5 concepts common to both" }],
          groups: [
            { label: "Style", concepts: [concept("Chamber music", ["chamber music"], true), concept("Classical"), concept("Romantic"), concept("String quartet")] },
            { label: "Melody/harmony", concepts: [concept("Modulation to relative major", ["modulation to relative major", "relative major"], true), concept("Mordent"), concept("Perfect cadence", ["perfect cadence"], true)] },
            { label: "Rhythm", concepts: [concept("Rubato"), concept("Simple time", ["simple time"], true), concept("Time changes"), concept("Triplets")] },
            { label: "Structure/form", concepts: [concept("Concerto grosso"), concept("Imitation", ["imitation"], true), concept("Through-composed")] },
          ],
          answerDisplay: "Chamber music; Modulation to relative major; Perfect cadence; Simple time; Imitation", definition: "Only Column C is marked. Additional incorrect selections are deducted.",
        }],
      },
      {
        id: "q6", number: "6", marks: 5, topic: "Instrumental music", audio: { clips: [audio(6, [
          { label: "(a) 1st", time: 44.5 }, { label: "(a) 2nd", time: 107.7 }, { label: "(a) 3rd", time: 170.96 }, { label: "(b)", time: 263.98 },
        ])] }, intro: "This question features instrumental music.",
        subquestions: [
          {
            id: "q6a", label: "(a)", marks: 4, type: "concept-lines", letteredConcept: true, lines: 4, requiredResponses: 4, additionalAnswerPenalty: true,
            leadLines: ["Listen to this excerpt and identify four concepts in the music from those listed below.", "Read through the concepts before hearing the music."], prompt: "Give your four answers on the lines below.", boldPhrases: ["four"],
            conceptBank: [concept("Jazz funk"), concept("Baroque"), concept("Basso continuo"), concept("Interrupted cadence", ["interrupted cadence"], true), concept("Harpsichord", ["harpsichord"], true), concept("Concertino"), concept("Cluster"), concept("Tierce de Picardie", ["tierce de picardie", "picardy third"], true), concept("Ground bass"), concept("Irregular time signatures", ["irregular time signatures", "irregular time signature", "irregular time"], true)],
            beforeAnswerLines: ["The music will be played three times with a pause of 10 seconds between playings and a pause of 40 seconds before part (b)."],
            afterAnswerLines: ["Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."], answerDisplay: "Harpsichord, Interrupted cadence, Irregular time signatures and Tierce de Picardie", definition: "One mark is awarded for each credited concept, in any order.",
          },
          { id: "q6b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a different excerpt and name the style of the music.", acceptedAnswers: ["impressionist", "impressionism", "sonata"], answerDisplay: "Impressionist, Impressionism or Sonata", definition: "All three answers are accepted by the official marking instructions." },
        ],
      },
      {
        id: "q7", number: "7", marks: 6, topic: "Listening analysis", audio: { clips: [audio(7, [
          { label: "1st", time: 51.1 }, { label: "2nd", time: 115.74 }, { label: "3rd", time: 181.42 },
        ])] },
        intro: ["This question is based on instrumental music.", "In this question you should identify the most prominent concepts which are present in the music.", "As you listen, identify at least two concepts from each of the following headings.", "Style/form", "Melody/harmony", "Timbre", "", "You will hear the music three times and you should make notes as you listen.", "Rough work will not be marked.", "Marks will only be awarded for the final answer.", "After the third playing you will have 3 minutes to write your final answer in the space provided.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."], introBoldPhrases: ["two", "Style/form", "Melody/harmony", "Timbre", "three times", "Rough work will not be marked."], introHeadingRowRange: [3, 5], introCompactRange: [11, 13], introTotalMarks: 6, introTotalMarksIndex: 10, showPartMarks: false,
        subquestions: [{
          id: "q7a", label: "Final answer", marks: 6, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, finalAnswerLines: 10, endOfPaper: false, requiredResponses: 6, prompt: "Final answer",
          headings: [
            { id: "style", label: "Style/form", concepts: [{ label: "Baroque", answers: ["baroque"] }, { label: "Basso continuo", answers: ["basso continuo", "continuo"] }, { label: "Concerto", answers: ["concerto"], blockedAnswers: ["concerto grosso"] }] },
            { id: "melody", label: "Melody/harmony", concepts: [{ label: "Major", answers: ["major", "major tonality"] }, { label: "Minor", answers: ["minor", "minor tonality"] }, { label: "Modulation / relative minor", answers: ["modulation", "relative minor", "modulation to relative minor"] }, { label: "Ornament / trills", answers: ["ornament", "ornaments", "trill", "trills"], blockedAnswers: ["mordent", "turn", "acciaccatura", "appoggiatura"] }, { label: "Pedal", answers: ["pedal", "pedal note"] }, { label: "Perfect cadence", answers: ["perfect cadence"] }, { label: "Sequence", answers: ["sequence"] }] },
            { id: "timbre", label: "Timbre", concepts: [{ label: "Arco", answers: ["arco"] }, { label: "Cello", answers: ["cello", "cellos"] }, { label: "Harpsichord", answers: ["harpsichord"] }, { label: "Pizzicato", answers: ["pizzicato", "pizz"] }, { label: "Recorder", answers: ["recorder", "recorders"] }, { label: "Violins / strings", answers: ["violins", "strings"], blockedAnswers: ["violin"] }] },
          ],
          answerDisplay: "Any six valid concepts, with no more than two credited from each heading", additionalGuidance: ["Concepts are credited even when written under a different heading."],
        }],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Song features", audio: { clips: [audio(8, [
          { label: "1st", time: 99.9 }, { label: "2nd", time: 162.52 }, { label: "3rd", time: 225.98 },
        ])] },
        intro: ["This question is based on a song from a musical.", "Below is a list of features which occur in the music.", "You now have one minute to read through the question.", "The song lyrics are shown in the table below. Insert each feature once in the column on the right at the point where it occurs.", "You only need to insert the underlined words."], showPartMarks: false,
        subquestions: [{
          id: "q8a", label: "", marks: 5, type: "lyric-placement", requiredResponses: 5, additionalAnswerPenalty: true, hidePrompt: true, prompt: "Insert the five underlined words at the point where they occur. Insert each word once only.",
          playbackLines: ["The music will now be played three times with a pause of 20 seconds between playings and a pause of 30 seconds at the end.", "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time."],
          features: [{ before: "change to ", word: "minor", after: " tonality" }, { before: "", word: "dominant 7th", after: " outlined in vocal part" }, { before: "first example of ", word: "con sordino", after: " brass" }, { before: "start of descending ", word: "chromatic", after: " countermelody in strings" }, { before: "", word: "sequence", after: "" }],
          lyricLines: [
            "Introduction",
            "Have you seen the well-to-do",
            "Up and down Park Avenue",
            "On that famous thoroughfare",
            "With their noses in the air?",
            "High hats and arrow collars",
            "White spats and lots of dollars",
            "Spending every dime",
            "For a wonderful time.",
            "If you’re blue",
            "And you don’t know",
            "Where to go to",
            "Why don’t you go",
            "Where fashion sits?",
            "Puttin’ on the Ritz"
          ],
          concepts: [{ id: "con-sordino", label: "Con sordino", answers: ["con sordino", "con sordino brass"], lines: [1] }, { id: "sequence", label: "Sequence", answers: ["sequence"], lines: [4, 5] }, { id: "chromatic", label: "Chromatic", answers: ["chromatic", "chromatic countermelody"], lines: [8, 10] }, { id: "minor", label: "Minor", answers: ["minor", "minor tonality"], lines: [10] }, { id: "dominant-7th", label: "Dominant 7th", answers: ["dominant 7th", "dominant seventh", "dominant 7"], lines: [14] }],
          answerDisplay: "Con sordino—line 1; Sequence—line 4 or 5; Chromatic—line 8 or 10; Minor—line 10; Dominant 7th—line 14", definition: "Each feature earns one mark when placed on an accepted lyric line.",
        }],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
