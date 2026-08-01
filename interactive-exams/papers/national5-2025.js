(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2025/Music N5 2025 - Track ${String(track).padStart(2, "0")}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Swing commonly uses a steady pulse, syncopation and a swung rhythm.",
    q1b: "A strathspey is a Scottish dance featuring Scotch snaps and dotted rhythms.",
    q1c: "An Alberti bass is a broken-chord accompaniment commonly played low-high-middle-high.",
    q1d: "The time signature 6/8 has two dotted-crotchet beats in each bar; 12/8 has four.",
    q1e: "A cadenza is a virtuosic solo passage, usually heard near the end of a concerto movement.",
    q1f: "Chromatic music moves in semitone steps; distortion adds a rough or overdriven electronic sound.",
    q2a: "Arco means to play a string instrument with the bow; glissando means sliding between notes.",
    q2b: "Simple time divides each beat into two equal parts.",
    q2c: "The oboe is a double-reed woodwind instrument with a clear, penetrating tone.",
    q2d: "Rallentando, ritardando and ritenuto describe a slowing or held-back tempo.",
    q3a: "The key signature has one flat and the music centres on F, so the key is F major.",
    q3b: "Andante indicates a steady walking pace.",
    q3c: "The missing notes are F, G and A, written as crotchets.",
    q3d: "A semitone is the smallest interval between adjacent notes in Western music.",
    q3e: "The end-repeat sign at bar 8 sends the performer back to repeat the first ending before taking the second ending.",
    q3f: "A perfect cadence moves from chord V to chord I and sounds finished.",
    q4a: "A modulation is a change from one key to another.",
    q4b: "An aria is a solo song in an opera or oratorio.",
    q4c: "Mezzo soprano is a female voice between soprano and alto.",
    q4d: "A canon repeats the same melody in another part after a short delay.",
    q4e: "Homophonic texture has one main melody supported by chords.",
    q4f: "The chord sequence is I-VI-IV-V: G-E minor-C-D.",
    q5a: "Cross rhythms combine contrasting rhythmic groupings at the same time.",
    q5b: "Minor tonality is based on a minor scale.",
    q5c: "A sequence repeats a musical idea at a higher or lower pitch.",
    q5d: "The violin is the highest-pitched standard orchestral string instrument.",
    q6a: "An anacrusis is one or more notes heard before the first strong beat of a phrase.",
    q6b: "Syllabic word setting gives one note to each syllable.",
    q6c: "A folk group performs traditional music, often using voices and acoustic instruments.",
    q7a1: "A symphony is a large-scale orchestral work, usually in several movements.",
    q7a2: "A symphony is performed by an orchestra without a featured solo instrument.",
    q7b1: "Rapping uses rhythmic speech over a beat or musical accompaniment.",
    q7b2: "Evidence for rapping must link vocals, lyrics or speech with a beat, rhythm, music or accompaniment.",
  };

  const paper = {
    id: "national5-2025",
    title: "National 5 Music 2025",
    level: "National 5",
    levelCode: "N5",
    year: 2025,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2025/Music N5 2025 - Track 01-1.mp3",
    sourcePath: "../exampapers/n5/2025/Music N5 2025 Paper.pdf",
    markingInstructionsPath: "../exampapers/n5/2025/Music N5 2025 Answers.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 8, topic: "Different styles", audio: { clips: [audio(2, [
          { label: "(a)", time: 5.56 }, { label: "(b)", time: 59.58 }, { label: "(c)", time: 158.34 },
          { label: "(d)", time: 178.4 }, { label: "(e)", time: 250.54 }, { label: "(f)", time: 326.14 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt. Tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rock ‘n’ roll", "Pop", "Swing", "Ragtime"].map(x => option(x)), answer: "Swing" },
          { id: "q1b", label: "(b)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a new excerpt and tick two boxes to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to a new excerpt and tick two boxes to describe what you hear.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["two"], options: ["Reel", "Strathspey", "Pibroch", "Scotch snap", "Countermelody"].map(x => option(x)), answers: ["Strathspey", "Scotch snap"] },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to another excerpt and name the type of bass line.", acceptedAnswers: ["alberti bass", "alberti"], answerDisplay: "Alberti bass or Alberti" },
          { id: "q1d", label: "(d)", marks: 1, type: "short-text", prompt: "Listen to another excerpt and identify the time signature.", acceptedAnswers: ["6/8", "6 / 8", "12/8", "12 / 8"], answerDisplay: "6/8 or 12/8" },
          { id: "q1e", label: "(e)", marks: 1, type: "radio", continuationBefore: true, prompt: "Listen to another excerpt from the same piece and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Cadenza", "Rolls", "Cluster", "Ground bass"].map(x => option(x)), answer: "Cadenza" },
          { id: "q1f", label: "(f)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a new excerpt and tick two boxes to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to a new excerpt and tick two boxes to describe what you hear.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["two"], options: ["Chromatic", "Arpeggio", "Tabla", "Pentatonic scale", "Distortion"].map(x => option(x)), answers: ["Chromatic", "Distortion"] },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Orchestral music", audio: { clips: [audio(3, [
          { label: "1st", time: 96.7 }, { label: "2nd", time: 159.5 }, { label: "3rd", time: 221.54 },
        ])] },
        intro: [
          "In this question you will hear orchestral music.",
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
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The Italian term for the string playing technique is [answer].", inlineAnswer: { before: "The Italian term for the string playing technique is", after: "." }, acceptedAnswers: ["arco", "glissando", "gliss"], answerDisplay: "Arco or glissando" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "This piece is in [answer] time.", inlineAnswer: { before: "This piece is in", after: "time." }, acceptedAnswers: ["simple", "simple time", "2/4", "2 / 4", "4/4", "4 / 4"], answerDisplay: "Simple, 2/4 or 4/4" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The instrument playing the melody is a/an [answer].", inlineAnswer: { before: "The instrument playing the melody is a/an", after: "." }, acceptedAnswers: ["oboe"], answerDisplay: "Oboe" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The Italian term to describe the tempo change is [answer].", inlineAnswer: { before: "The Italian term to describe the tempo change is", after: "." }, acceptedAnswers: ["rallentando", "rall", "rall.", "ritardando", "rit", "rit.", "ritenuto"], answerDisplay: "Rallentando, ritardando, rall, rit or ritenuto" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 10.56 }, { label: "1st", time: 127.44 }, { label: "2nd", time: 195.72 }, { label: "3rd", time: 261.74 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have one minute to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "F major", bars: 10, sharedNotation: "n5-2025-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this excerpt [answer].", inlineAnswer: { before: "Name the key of this excerpt", after: "." }, acceptedAnswers: ["f", "f major", "f maj"], answerDisplay: "F or F major" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write the Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Moderato", acceptedAnswers: ["Moderato", "Andante"], answerDisplay: "Moderato or Andante" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 3.", options: [], noteSlots: 3, answer: "F4,G4,A4", answerDisplay: "F, G and A crotchets" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "The interval between the last two notes of bar 6 is a/an [answer].", inlineAnswer: { before: "The interval between the last two notes of bar 6 is a/an", after: "." }, acceptedAnswers: ["semitone", "2", "2nd", "second"], answerDisplay: "Semitone, 2 or 2nd" },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "repeat-sign", prompt: "Insert a repeat sign at the correct place in the music.", scoreHint: "Select the button first, then apply to the score.", options: [option("end-repeat", "End repeat")], answer: "end-bar-8", answerDisplay: "An end-repeat sign at the end of bar 8" },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the cadence in bars 9 to 10 [answer].", inlineAnswer: { before: "Name the cadence in bars 9 to 10", after: "." }, allowAnswerInPhrase: true, acceptedAnswers: ["perfect", "perfect cadence", "v to i", "v-i", "5 to 1", "5-1"], answerDisplay: "Perfect cadence (V-I or 5-1)" },
        ],
      },
      {
        id: "q4", number: "4", marks: 6, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 4.82 }, { label: "(b)", time: 91.96 }, { label: "(c)", time: 143.66 },
          { label: "(d)", time: 193.98 }, { label: "(e)", time: 284.82 }, { label: "(f)", time: 306.66 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The excerpt will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The excerpt will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["one"], options: ["Anacrusis", "Walking bass", "A cappella", "Modulation"].map(x => option(x)), answer: "Modulation" },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Chorus", "Aria", "Descant", "Middle 8"].map(x => option(x)), answer: "Aria" },
          { id: "q4c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to that excerpt again and name the type of voice heard.", acceptedAnswers: ["mezzo soprano", "mezzo-soprano"], answerDisplay: "Mezzo soprano" },
          { id: "q4d", label: "(d)", marks: 1, type: "radio", continuationBefore: true, prompt: "Listen to this excerpt and tick one box to describe what you hear. The excerpt is short and will be played twice.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The excerpt is short and will be played twice.", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["one"], options: ["Coda", "Scat singing", "Rubato", "Canon"].map(x => option(x)), answer: "Canon" },
          { id: "q4e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a new excerpt and identify the texture of the singing.", acceptedAnswers: ["homophonic", "homophony", "homophonic texture"], answerDisplay: "Homophonic" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of G major. You will hear the music twice, with a pause of 10 seconds between playings.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of G major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I IV VI V", label: "I IV VI V", secondaryLabel: "G C Em D" },
            { value: "I V IV VI", label: "I V IV VI", secondaryLabel: "G D C Em" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "G Em C D" },
          ], answer: "I VI IV V" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 81.76 }, { label: "2nd", time: 151.9 }, { label: "3rd", time: 221.76 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of music which will be played three times.",
          "Tick one answer only in each of the four sections:", "rhythm/tempo", "tonality", "melody", "string instrument.", "",
          "You now have one minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "rhythm/tempo", "tonality", "melody", "string instrument"],
        introBulletRange: [2, 5],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Rhythm/tempo", marks: 1, type: "radio", prompt: "Rhythm/tempo", instruction: "Tick one box from this selection", options: ["3/4", "Cross rhythms", "Adagio"].map(x => option(x)), answer: "Cross rhythms" },
          { id: "q5b", label: "Tonality", marks: 1, type: "radio", prompt: "Tonality", instruction: "Tick one box from this selection", options: ["Atonal", "Major", "Minor"].map(x => option(x)), answer: "Minor" },
          { id: "q5c", label: "Melody", marks: 1, type: "radio", prompt: "Melody", instruction: "Tick one box from this selection", options: ["Sequence", "Trill", "Whole-tone scale"].map(x => option(x)), answer: "Sequence" },
          { id: "q5d", label: "String instrument", marks: 1, type: "radio", prompt: "String instrument", instruction: "Tick one box from this selection", options: ["Violin", "Sitar", "Cello"].map(x => option(x)), answer: "Violin" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 53.24 }, { label: "2nd", time: 133.98 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
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
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The rhythmic concept heard at the start of each vocal phrase is a/an [answer].", inlineAnswer: { before: "The rhythmic concept heard at the start of each vocal phrase is a/an", after: "." }, acceptedAnswers: ["anacrusis", "upbeat", "up beat", "pickup", "pick up"], answerDisplay: "Anacrusis" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The word setting is [answer].", inlineAnswer: { before: "The word setting is", after: "." }, acceptedAnswers: ["syllabic", "syllabic word setting"], answerDisplay: "Syllabic" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The type of group performing is a/an [answer].", inlineAnswer: { before: "The type of group performing is a/an", after: "." }, acceptedAnswers: ["folk group", "folk", "scottish folk group", "celtic folk group"], answerDisplay: "Folk group, folk, Scottish folk group or Celtic folk group" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 5.32 }, { label: "(b)", time: 86.7 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Concerto", "Symphony", "Baroque", "Minimalist"].map(x => option(x)), answer: "Symphony" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["orchestra", "orchestral", "full orchestra"], acceptedKeywords: ["orchestra", "orchestral"], forbiddenExactKeywordGroups: [["solo", "instrument"], ["soloist"], ["concerto"]], answerDisplay: "Full orchestra, orchestra or orchestral, without suggesting a featured solo instrument" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Gospel", "Reggae", "Rapping", "Mouth music"].map(x => option(x)), answer: "Rapping" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", minAcceptedConcepts: 2, acceptedConcepts: [
            { id: "vocals", answers: ["vocal", "vocals", "lyrics", "rhyming", "words", "speaking", "spoken", "talking", "singer", "singing"] },
            { id: "music", answers: ["beat", "rhythm", "music", "accompaniment", "accompanied", "instrumental", "background", "hip hop", "song"] },
          ], answerDisplay: "A link between vocals, lyrics, rhyming or words and a beat, rhythm, music or accompaniment" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 41.92 }, { label: "2nd", time: 118.84 }, { label: "3rd", time: 196.64 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following:",
          "melody/harmony", "rhythm/tempo", "instruments", "dynamics (Italian terms).", "",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "melody/harmony", "rhythm/tempo", "instruments", "dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 8,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Change of key / modulation", answers: ["change of key", "key change", "modulation", "modulates", "modulated"] },
              { label: "Chromatic", answers: ["chromatic", "chromatic scale"] },
              { label: "Countermelody", answers: ["countermelody", "counter melody", "counter-melody"] },
              { label: "Glissando", answers: ["glissando", "gliss"] },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Perfect cadence", answers: ["perfect cadence", "perfect", "v i", "v to i", "5 1", "5 to 1"], allowFuzzy: false },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Sequence", answers: ["sequence", "sequences"] },
              { label: "Trills", answers: ["trill", "trills"] },
            ] },
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "2 or 4 beats / 2/4 / 4/4 / simple time", answers: ["2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "2/4", "4/4", "simple time"] },
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Allegro", answers: ["allegro"] },
              { label: "Drum fills", answers: ["drum fill", "drum fills"], blockedAnswers: ["fill", "fills"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Syncopation / off the beat", answers: ["syncopation", "syncopated", "off the beat", "off-beat", "off beat"] },
            ] },
            { id: "instruments", label: "Instruments", concepts: [
              { label: "Acoustic or electric guitar", answers: ["acoustic guitar", "electric guitar"], blockedAnswers: ["guitar"] },
              { label: "Bass guitar", answers: ["bass guitar"] },
              { label: "Drum kit", answers: ["drum kit"], blockedAnswers: ["drum"], alwaysBlockedAnswers: ["drums"] },
              { label: "Flute or piccolo", answers: ["flute", "flutes", "piccolo", "piccolos"] },
              { label: "Glockenspiel", answers: ["glockenspiel", "glock"] },
              { label: "Saxophones", answers: ["saxophone", "saxophones", "sax", "saxes"] },
              { label: "Timpani / kettle drums", answers: ["timpani", "kettle drum", "kettle drums"] },
              { label: "Trombones", answers: ["trombone", "trombones"] },
              { label: "Trumpets", answers: ["trumpet", "trumpets"] },
              { label: "Xylophone", answers: ["xylophone", "xylo"] },
            ], additionalGuidance: ["Guitar alone is not accepted.", "Drums alone is not accepted for drum kit."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "mp or mf", answers: ["mp", "mf", "mezzo piano", "mezzo forte"] },
              { label: "f or ff", answers: ["f", "ff", "forte", "fortissimo"], excludeWithinAnswers: ["mezzo forte"] },
              { label: "Crescendo", answers: ["crescendo", "cresc"] },
              { label: "Sforzando / sfz", answers: ["sforzando", "sforzato", "sfz"] },
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
