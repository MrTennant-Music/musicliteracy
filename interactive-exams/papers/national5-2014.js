(function (root) {
  "use strict";

  const practice = (href, label) => ({ href: `../${href}?level=N5`, label });
  const audio = (track, maxPlaysExam = 1, label = "Question audio", markers = []) => ({
    file: `../exampapers/n5/2014/N5 2014 Track ${track}-1.mp3`,
    label,
    maxPlaysExam,
    markers,
  });
  const timedAudio = (track, markers) => audio(track, 1, "Question audio", markers);
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });

  const paper = {
    id: "national5-2014",
    title: "National 5 Music 2014",
    level: "National 5",
    levelCode: "N5",
    year: 2014,
    totalMarks: 40,
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2014/N5 2014 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2014/N5_Music_QP_2014.pdf",
    markingInstructionsPath: "../exampapers/n5/2014/mi_N5_Music_QP_2014.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 5, topic: "Musical concepts", audio: { clips: [timedAudio(2, [
          { label: "(a)", time: 6.12 },
          { label: "(b)", time: 45.12 },
          { label: "(c)", time: 84.78 },
          { label: "(d)", time: 124.04 },
          { label: "(e)", time: 171.1 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Latin American", "Rapping", "Gospel", "Swing"].map(x => option(x)), answer: "Gospel", explanation: "The excerpt is in a Gospel style." },
          { id: "q1b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Minimalist", "Cadenza", "Baroque", "Symphony"].map(x => option(x)), answer: "Symphony", explanation: "The new piece is a symphony." },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", prompt: "Listen to a further excerpt from that piece and write the Italian term to describe the string playing technique.", acceptedAnswers: ["arco"], answerDisplay: "arco", explanation: "Arco means that the strings are played with the bow.", practiceLinks: [practice("articulation.html", "Practise articulation markings")] },
          { id: "q1d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Rubato", "Scotch snap", "Trill", "Cross rhythm"].map(x => option(x)), answer: "Cross rhythm", explanation: "The excerpt uses cross rhythm." },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", prompt: "Listen to a new excerpt and name the solo instrument.", acceptedAnswers: ["oboe"], answerDisplay: "oboe", explanation: "The solo instrument is an oboe." },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [timedAudio(3, [
          { label: "1st", time: 101.82 },
          { label: "2nd", time: 204.96 },
          { label: "3rd", time: 308.38 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music.",
          "A guide to the music has been laid out on the following page. You will see that further information is required and you should insert this in each of the four areas.",
          "There will now be a pause of one minute to allow you to read through the question.",
          "The music will be played three times, with a pause of 20 seconds between playings.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.",
          "Here is the music for the second time.",
          "Here is the music for the third time.",
        ],
        introTotalMarks: 4,
        showPartMarks: false,
        layout: "music-guide",
        contentHeading: "Question 2 (continued)",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The tonality is", inlineAnswer: { before: "The tonality is", after: "" }, acceptedAnswers: ["major"], answerDisplay: "major", explanation: "The excerpt is in a major key.", practiceLinks: [practice("keysig.html", "Practise keys and tonality")] },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "There are beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "4", "2/4", "4/4", "2 4", "4 4"], answerDisplay: "2 or 4 (2/4 or 4/4)", explanation: "The marking instructions accept 2 or 4, including 2/4 or 4/4." },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The instruments playing the melody belong to the family.", inlineAnswer: { before: "The instruments playing the melody belong to the", after: "family." }, acceptedAnswers: ["brass", "brass family"], answerDisplay: "brass", explanation: "The melody is played by brass instruments." },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The tempo change is called (Italian term)", inlineAnswer: { before: "The tempo change is called", after: "(Italian term)" }, acceptedAnswers: ["ritardando", "rit", "rallentando", "rall", "ritenuto"], answerDisplay: "ritardando (also rit, rallentando, rall or ritenuto)", explanation: "The tempo slows down.", practiceLinks: [practice("tempo.html", "Practise tempo concepts")] },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [timedAudio(4, [
          { label: "Preview", time: 14.6 },
          { label: "1st", time: 105.6 },
          { label: "2nd", time: 205.06 },
          { label: "3rd", time: 304.86 },
        ])] },
        intro: [
          "You now have to answer questions relating to the music guide printed below.",
          "Listen to the excerpt and follow the music. Do not attempt to write during this playing. Here is the music.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.",
          "Here is the music for the second time.",
          "Here is the music for the third time.",
        ],
        score: { key: "G major", bars: 8, sharedNotation: "n5-2014-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", answerDisplay: "4/4 or common time", explanation: "The music has four crotchet beats in each bar.", practiceLinks: [practice("timesig.html", "Practise time signatures")] },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "dynamic", prompt: "The piece is played quietly. Write the appropriate dynamic marking (Italian term) under the first note of bar 1.", scoreHint: "Select a button to apply it to the score.", options: [option("p", "p"), option("mp", "mp"), option("mf", "mf"), option("f", "f")], answer: "p", answerDisplay: "p (piano)", explanation: "Piano is the Italian term meaning quiet.", practiceLinks: [practice("dynamics.html", "Practise dynamics")] },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", prompt: "Complete bar 3 by inserting the missing notes.", scoreHint: "Use the score above to enter your answer.", options: [], noteSlots: 3, answer: "B4,D4,E4", answerDisplay: "B crotchet, D crotchet and E crotchet; the printed C–B–C figure completes beat 4", explanation: "The first three beats repeat the pitch and rhythm pattern heard in bar 1.", practiceLinks: [practice("missingnotes.html", "Practise melodic dictation")] },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "repeat-sign", prompt: "Insert a repeat sign at the appropriate place in the music.", scoreHint: "Select the button first, then apply to the score.", options: [option("end-repeat", "End repeat")], answer: "end-bar-8", answerDisplay: "A right repeat sign at the end of bar 8", explanation: "The repeat sign belongs at the end of bar 8.", practiceLinks: [practice("repeatsigns.html", "Practise repeat signs")] },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", prompt: "Name the key of this excerpt.", inlineAnswer: { before: "Name the key of this excerpt.", after: "" }, acceptedAnswers: ["g", "g major", "g maj"], answerDisplay: "G major", explanation: "One sharp in this melody indicates G major.", practiceLinks: [practice("keysig.html", "Practise key signatures")] },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", prompt: "Name the cadence at the end of the excerpt.", inlineAnswer: { before: "Name the cadence at the end of the excerpt.", after: "" }, acceptedAnswers: ["imperfect", "imperfect cadence", "i to v", "1 to 5", "I V", "I to V"], answerDisplay: "imperfect (I–V)", explanation: "The final chord movement is from chord I to chord V.", practiceLinks: [practice("cadences.html", "Practise cadences")] },
        ],
      },
      {
        id: "q4", number: "4", marks: 9, topic: "Vocal music", audio: { clips: [timedAudio(5, [
          { label: "(a)", time: 5.74 },
          { label: "(b)", time: 56.68 },
          { label: "(c)", time: 100.84 },
          { label: "(d)", time: 162.06 },
          { label: "(e)", time: 220.46 },
          { label: "(f)", time: 357.02 },
          { label: "(g)", time: 435.88 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Opera", "Syllabic", "A cappella", "Descant"].map(x => option(x)), answer: "Syllabic", explanation: "The words are set syllabically." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", prompt: "Listen to another excerpt and name the style.", acceptedAnswers: ["reggae"], answerDisplay: "reggae", explanation: "The excerpt is Reggae." },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Octave", "Compound time", "Anacrusis", "Change of key"].map(x => option(x)), answer: "Anacrusis", explanation: "The melody begins with an anacrusis (upbeat)." },
          { id: "q4d", label: "(d)", marks: 1, type: "short-text", prompt: "Listen to that excerpt again and name the type of voice.", acceptedAnswers: ["baritone"], answerDisplay: "baritone", explanation: "The singer has a baritone voice." },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", continuationBefore: true, prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of C major. You will hear the excerpt twice, with a pause of 10 seconds between playings. Here is the excerpt for the first time. Here is the excerpt for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of C major.", "You will hear the excerpt twice, with a pause of 10 seconds between playings.", "", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I IV V VI", label: "I IV V VI", secondaryLabel: "C F G Am" },
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "C G Am F" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "C Am F G" },
          ], answer: "I V VI IV", explanation: "The sequence is I–V–VI–IV: C–G–Am–F.", practiceLinks: [practice("chords.html", "Practise chord sequences")] },
          { id: "q4f", label: "(f)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt and tick two boxes to describe what you hear. The excerpt will be played twice. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Listen to this excerpt and tick two boxes to describe what you hear.", "The excerpt will be played twice.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["two"], options: ["Octave leap", "Harmony", "Polyphonic", "Contrary motion", "A cappella"].map(x => option(x)), answers: ["Octave leap", "A cappella"], explanation: "The excerpt contains an octave leap and is sung a cappella." },
          { id: "q4g", label: "(g)", marks: 2, type: "checkbox", maxSelections: 2, continuationBefore: true, prompt: "Listen to a further excerpt from the same piece and tick two boxes to describe what you hear.", boldPhrases: ["two"], options: ["3 beats in a bar", "Gaelic Psalm", "Descant", "Modulation", "Allegro"].map(x => option(x)), answers: ["Descant", "Modulation"], explanation: "A descant is heard and the music modulates." },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [timedAudio(6, [
          { label: "1st", time: 83.54 },
          { label: "2nd", time: 118.74 },
          { label: "3rd", time: 154.34 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of music which will be played three times.",
          "Tick one answer only in each of the four sections:",
          "",
          "Melody",
          "Rhythm",
          "Timbre",
          "Structure/form",
          "",
          "You have 1 minute to read the question before hearing the excerpt.",
          "",
          "Here is the excerpt for the first time.",
          "Here is the excerpt for the second time.",
          "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Melody", "Rhythm", "Timbre", "Structure/form"],
        introTotalMarks: 4,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Melody", marks: 1, type: "radio", prompt: "Melody", instruction: "Tick one box from this section", options: ["Inverted pedal", "Grace notes", "Countermelody"].map(x => option(x)), answer: "Grace notes", explanation: "Grace notes decorate the melody." },
          { id: "q5b", label: "Rhythm", marks: 1, type: "radio", prompt: "Rhythm", instruction: "Tick one box from this section", options: [option("Adagio"), option("Accelerando"), option("12/8", "12/8", { stackedFraction: ["12", "8"] })], answer: "12/8", explanation: "The excerpt is in 12/8 time." },
          { id: "q5c", label: "Timbre", marks: 1, type: "radio", prompt: "Timbre", instruction: "Tick one box from this section", options: ["Bodhran", "Tabla", "Clarsach"].map(x => option(x)), answer: "Bodhran", explanation: "The percussion instrument is a bodhrán." },
          { id: "q5d", label: "Structure/form", marks: 1, type: "radio", prompt: "Structure/form", instruction: "Tick one box from this section", options: ["Binary", "Ternary", "Rondo"].map(x => option(x)), answer: "Binary", explanation: "The music is in binary form." },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [timedAudio(7, [
          { label: "1st", time: 56.1 },
          { label: "2nd", time: 129.26 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will now be a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings and 20 seconds before the next question starts.",
        ],
        introBoldPhrases: ["twice"],
        outro: [
          "Here is the music for the first time.",
          "Here is the music for the second time.",
        ],
        outroTotalMarks: 3,
        showPartMarks: false,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "There are beats in each bar.", inlineAnswer: { before: "There are", after: "beats in each bar." }, acceptedAnswers: ["2", "4", "2/4", "4/4", "2 4", "4 4"], answerDisplay: "2 or 4 (2/4 or 4/4)", explanation: "The marking instructions accept 2 or 4." },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The two instruments that share the melody are violin and [answer].", inlineAnswer: { before: "The two instruments that share the melody are violin and", after: "." }, acceptedAnswers: ["flute"], answerDisplay: "flute", explanation: "The melody is shared by violin and flute." },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The Italian term to describe the string technique used in the accompaniment is [answer].", boldPhrases: ["accompaniment"], inlineAnswer: { before: "The Italian term to describe the string technique used in the accompaniment is", after: "." }, acceptedAnswers: ["pizzicato", "pizz"], answerDisplay: "pizzicato (pizz.)", explanation: "The accompaniment strings are plucked." },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [timedAudio(8, [
          { label: "(a)", time: 6.68 },
          { label: "(b)", time: 102.5 },
        ])] },
        intro: "This question features instrumental music.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instruction: "There will be a pause of 20 seconds before the next question starts. Here is the music.", instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Ragtime", "Symphony", "Baroque", "Concerto"].map(x => option(x)), answer: "Concerto", explanation: "The excerpt is a concerto." },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedAnswers: ["solo piano and orchestra", "solo instrument and orchestra", "piano and orchestra", "solo piano with orchestra", "solo instrument with orchestra", "piano with orchestra"], answerDisplay: "Solo piano/instrument and orchestra", explanation: "A concerto contrasts a solo instrument with an orchestra." },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instruction: "There will be a pause of 20 seconds before the next question starts. Here is the music.", instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Pibroch", "Minimalist", "Indian", "Blues"].map(x => option(x)), answer: "Minimalist", explanation: "The excerpt is Minimalist." },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", acceptedAnswers: ["repetition", "repeated melody", "repeated rhythm", "repeated cells", "repeated figures", "repeated ideas", "repeated motifs", "repeated notes", "ostinato", "riff", "repeated phrases"], answerDisplay: "Repetition (for example repeated cells, motifs, an ostinato or riff)", explanation: "Repetition is a defining feature of this Minimalist excerpt." },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [timedAudio(9, [
          { label: "1st", time: 47.58 },
          { label: "2nd", time: 126.34 },
          { label: "3rd", time: 205.64 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following:",
          "Rhythm/tempo",
          "Melody/harmony",
          "Instruments/voices",
          "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.",
          "Here is the music for the second time.",
          "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Rhythm/tempo", "Melody/harmony", "Instruments/voices", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "2 or 4 beats in the bar / 2/4 / 4/4 / simple time", answers: ["2 beats in the bar", "2 beats in a bar", "2 beats per bar", "two beats in the bar", "two beats in a bar", "two beats per bar", "4 beats in the bar", "4 beats in a bar", "4 beats per bar", "four beats in the bar", "four beats in a bar", "four beats per bar", "2/4", "4/4", "simple time"] },
              { label: "Dotted rhythms", answers: ["dotted rhythm", "dotted rhythms"] },
              { label: "Moderato or Andante", answers: ["moderato", "andante"] },
              { label: "Swing", answers: ["swing"] },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
            ] },
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Repetition", answers: ["repetition", "repeated"] },
              { label: "Riff", answers: ["riff", "riffs"] },
              { label: "Scat singing", answers: ["scat singing", "scat"] },
              { label: "Sequence", answers: ["sequence", "sequences"] },
              { label: "Syllabic", answers: ["syllabic"] },
              { label: "Walking bass", answers: ["walking bass"] },
            ] },
            { id: "instruments", label: "Instruments/voices", concepts: [
              { label: "Male solo/voice, baritone or tenor", answers: ["male solo", "male voice", "male solo voice", "baritone", "tenor"] },
              { label: "Backing vocals/singers", answers: ["backing vocal", "backing vocals", "backing singer", "backing singers"] },
              { label: "Big band", answers: ["big band"] },
              { label: "Drumkit", answers: ["drumkit", "drum kit"] },
              { label: "Double bass or bass guitar", answers: ["double bass", "bass guitar"] },
              { label: "Piano", answers: ["piano"] },
              { label: "Trombones", answers: ["trombones"], blockedAnswers: ["trombone"] },
              { label: "Violins", answers: ["violins"], blockedAnswers: ["violin"] },
            ] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "Crescendo", answers: ["crescendo", "cresc", "<", "＜"] },
              { label: "mp", answers: ["mp", "mezzo piano"] },
              { label: "mf or f", answers: ["mf", "mezzo forte", "f", "forte"] },
            ] },
          ], answerDisplay: "One mark for each valid concept, with a maximum of two marks per heading and five marks overall.", explanation: "Only the Final answer is marked. Valid concepts are banked wherever they appear in the response; irrelevant wording is ignored and rough work earns no marks.", practiceLinks: [practice("practicequestions.html", "Practise exam-style listening questions")] },
        ],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
