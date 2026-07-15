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
  const option = (value, label = value) => ({ value, label });

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
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Choose the description that matches the first excerpt.", options: ["Latin American", "Rapping", "Gospel", "Swing"].map(x => option(x)), answer: "Gospel", explanation: "The excerpt is in a Gospel style." },
          { id: "q1b", label: "(b)", marks: 1, type: "radio", prompt: "Choose the description that matches the new piece of music.", options: ["Minimalist", "Cadenza", "Baroque", "Symphony"].map(x => option(x)), answer: "Symphony", explanation: "The new piece is a symphony." },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", prompt: "Write the Italian term for the string playing technique in the further excerpt.", acceptedAnswers: ["arco"], answerDisplay: "arco", explanation: "Arco means that the strings are played with the bow.", practiceLinks: [practice("articulation.html", "Practise articulation markings")] },
          { id: "q1d", label: "(d)", marks: 1, type: "radio", prompt: "Choose the description that matches the new piece.", options: ["Rubato", "Scotch snap", "Trill", "Cross rhythm"].map(x => option(x)), answer: "Cross rhythm", explanation: "The excerpt uses cross rhythm." },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", prompt: "Name the solo instrument in the final excerpt.", acceptedAnswers: ["oboe"], answerDisplay: "oboe", explanation: "The solo instrument is an oboe." },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [timedAudio(3, [
          { label: "1st", time: 101.82 },
          { label: "2nd", time: 204.96 },
          { label: "3rd", time: 308.38 },
        ])] },
        intro: "Listen to the instrumental excerpt and complete all four parts of the music guide.",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The tonality is…", acceptedAnswers: ["major"], answerDisplay: "major", explanation: "The excerpt is in a major key.", practiceLinks: [practice("keysig.html", "Practise keys and tonality")] },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "There are how many beats in the bar?", acceptedAnswers: ["2", "4", "2/4", "4/4", "2 4", "4 4"], answerDisplay: "2 or 4 (2/4 or 4/4)", explanation: "The marking instructions accept 2 or 4, including 2/4 or 4/4." },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The melody instruments belong to which family?", acceptedAnswers: ["brass", "brass family"], answerDisplay: "brass", explanation: "The melody is played by brass instruments." },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "Name the tempo change using an Italian term.", acceptedAnswers: ["ritardando", "rit", "rallentando", "rall", "ritenuto"], answerDisplay: "ritardando (also rit, rallentando, rall or ritenuto)", explanation: "The tempo slows down.", practiceLinks: [practice("tempo.html", "Practise tempo concepts")] },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [timedAudio(4, [
          { label: "Preview", time: 14.6 },
          { label: "1st", time: 105.6 },
          { label: "2nd", time: 205.06 },
          { label: "3rd", time: 304.86 },
        ])] },
        intro: "Follow the music guide, then complete the notation and written questions.",
        score: { key: "G major", bars: 8, sharedNotation: "n5-2014-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", answerDisplay: "4/4 or common time", explanation: "The music has four crotchet beats in each bar.", practiceLinks: [practice("timesig.html", "Practise time signatures")] },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "dynamic", prompt: "The piece is played quietly. Place the appropriate dynamic marking under the first note of bar 1.", options: [option("p", "p"), option("mp", "mp"), option("mf", "mf"), option("f", "f")], answer: "p", answerDisplay: "p (piano)", explanation: "Piano is the Italian term meaning quiet.", practiceLinks: [practice("dynamics.html", "Practise dynamics")] },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", prompt: "Complete the first three beats of bar 3 by inserting the missing notes.", options: [], noteSlots: 3, answer: "B4,D4,E4", answerDisplay: "B crotchet, D crotchet and E crotchet; the printed C–B–C figure completes beat 4", explanation: "The first three beats repeat the pitch and rhythm pattern heard in bar 1.", practiceLinks: [practice("missingnotes.html", "Practise melodic dictation")] },
          { id: "q3d", label: "(d)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "repeat-sign", prompt: "Insert the repeat sign at the appropriate place.", options: [option("end-repeat", "End repeat")], answer: "end-bar-8", answerDisplay: "A right repeat sign at the end of bar 8", explanation: "The repeat sign belongs at the end of bar 8.", practiceLinks: [practice("repeatsigns.html", "Practise repeat signs")] },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", prompt: "Name the key of the excerpt.", acceptedAnswers: ["g", "g major", "g maj"], answerDisplay: "G major", explanation: "One sharp in this melody indicates G major.", practiceLinks: [practice("keysig.html", "Practise key signatures")] },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", prompt: "Name the cadence at the end of the excerpt.", acceptedAnswers: ["imperfect", "imperfect cadence", "i to v", "1 to 5", "I V", "I to V"], answerDisplay: "imperfect (I–V)", explanation: "The final chord movement is from chord I to chord V.", practiceLinks: [practice("cadences.html", "Practise cadences")] },
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
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Choose the description that matches the first excerpt.", options: ["Opera", "Syllabic", "A cappella", "Descant"].map(x => option(x)), answer: "Syllabic", explanation: "The words are set syllabically." },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", prompt: "Name the style of the next excerpt.", acceptedAnswers: ["reggae"], answerDisplay: "reggae", explanation: "The excerpt is Reggae." },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Choose the description that matches the next excerpt.", options: ["Octave", "Compound time", "Anacrusis", "Change of key"].map(x => option(x)), answer: "Anacrusis", explanation: "The melody begins with an anacrusis (upbeat)." },
          { id: "q4d", label: "(d)", marks: 1, type: "short-text", prompt: "Name the type of voice.", acceptedAnswers: ["baritone"], answerDisplay: "baritone", explanation: "The singer has a baritone voice." },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", prompt: "Identify the chord sequence in C major.", options: [option("I IV V VI", "I–IV–V–VI · C–F–G–Am"), option("I V VI IV", "I–V–VI–IV · C–G–Am–F"), option("I VI IV V", "I–VI–IV–V · C–Am–F–G")], answer: "I V VI IV", explanation: "The sequence is I–V–VI–IV: C–G–Am–F.", practiceLinks: [practice("chords.html", "Practise chord sequences")] },
          { id: "q4f", label: "(f)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Choose two descriptions of the excerpt.", options: ["Octave leap", "Harmony", "Polyphonic", "Contrary motion", "A cappella"].map(x => option(x)), answers: ["Octave leap", "A cappella"], explanation: "The excerpt contains an octave leap and is sung a cappella." },
          { id: "q4g", label: "(g)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Choose two descriptions of the further excerpt.", options: ["3 beats in a bar", "Gaelic Psalm", "Descant", "Modulation", "Allegro"].map(x => option(x)), answers: ["Descant", "Modulation"], explanation: "A descant is heard and the music modulates." },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [timedAudio(6, [
          { label: "1st", time: 83.54 },
          { label: "2nd", time: 118.74 },
          { label: "3rd", time: 154.34 },
        ])] },
        intro: "Choose one answer in each section.",
        subquestions: [
          { id: "q5a", label: "Melody", marks: 1, type: "radio", prompt: "Melody", options: ["Inverted pedal", "Grace notes", "Countermelody"].map(x => option(x)), answer: "Grace notes", explanation: "Grace notes decorate the melody." },
          { id: "q5b", label: "Rhythm", marks: 1, type: "radio", prompt: "Rhythm", options: ["Adagio", "Accelerando", "12/8"].map(x => option(x)), answer: "12/8", explanation: "The excerpt is in 12/8 time." },
          { id: "q5c", label: "Timbre", marks: 1, type: "radio", prompt: "Timbre", options: ["Bodhran", "Tabla", "Clarsach"].map(x => option(x)), answer: "Bodhran", explanation: "The percussion instrument is a bodhrán." },
          { id: "q5d", label: "Structure/form", marks: 1, type: "radio", prompt: "Structure/form", options: ["Binary", "Ternary", "Rondo"].map(x => option(x)), answer: "Binary", explanation: "The music is in binary form." },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [timedAudio(7, [
          { label: "1st", time: 56.1 },
          { label: "2nd", time: 129.26 },
        ])] },
        intro: "Complete the description using the appropriate musical concepts.",
        subquestions: [
          { id: "q6a", label: "1", marks: 1, type: "short-text", prompt: "There are ___ beats in each bar.", acceptedAnswers: ["2", "4", "2/4", "4/4", "2 4", "4 4"], answerDisplay: "2 or 4 (2/4 or 4/4)", explanation: "The marking instructions accept 2 or 4." },
          { id: "q6b", label: "2", marks: 1, type: "short-text", prompt: "The two instruments sharing the melody are violin and ___.", acceptedAnswers: ["flute"], answerDisplay: "flute", explanation: "The melody is shared by violin and flute." },
          { id: "q6c", label: "3", marks: 1, type: "short-text", prompt: "Give the Italian term for the string technique in the accompaniment.", acceptedAnswers: ["pizzicato", "pizz"], answerDisplay: "pizzicato (pizz.)", explanation: "The accompaniment strings are plucked." },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [timedAudio(8, [
          { label: "(a)", time: 6.68 },
          { label: "(b)", time: 102.5 },
        ])] },
        intro: "Identify the style of each excerpt and give one supporting reason.",
        subquestions: [
          { id: "q7a1", label: "(a)(i)", marks: 1, type: "radio", prompt: "Identify the style of Excerpt A.", options: ["Ragtime", "Symphony", "Baroque", "Concerto"].map(x => option(x)), answer: "Concerto", explanation: "The excerpt is a concerto." },
          { id: "q7a2", label: "(a)(ii)", marks: 1, type: "short-text", prompt: "Give one reason supporting your answer to (a).", acceptedAnswers: ["solo piano and orchestra", "solo instrument and orchestra", "piano and orchestra", "solo piano with orchestra", "solo instrument with orchestra", "piano with orchestra"], answerDisplay: "Solo piano/instrument and orchestra", explanation: "A concerto contrasts a solo instrument with an orchestra." },
          { id: "q7b1", label: "(b)(i)", marks: 1, type: "radio", prompt: "Identify the style of Excerpt B.", options: ["Pibroch", "Minimalist", "Indian", "Blues"].map(x => option(x)), answer: "Minimalist", explanation: "The excerpt is Minimalist." },
          { id: "q7b2", label: "(b)(ii)", marks: 1, type: "short-text", prompt: "Give one reason supporting your answer to (b).", acceptedAnswers: ["repetition", "repeated melody", "repeated rhythm", "repeated cells", "repeated figures", "repeated ideas", "repeated motifs", "repeated notes", "ostinato", "riff", "repeated phrases"], answerDisplay: "Repetition (for example repeated cells, motifs, an ostinato or riff)", explanation: "Repetition is a defining feature of this Minimalist excerpt." },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [timedAudio(9, [
          { label: "1st", time: 47.58 },
          { label: "2nd", time: 126.34 },
          { label: "3rd", time: 205.64 },
        ])] },
        intro: "Identify prominent features in at least three headings. You may write bullet points or sentences.",
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", prompt: "Record your observations under the four headings.", headings: [
            { id: "rhythm", label: "Rhythm/tempo", markingPoints: ["2 or 4 beats in the bar", "2/4", "4/4", "simple time", "dotted rhythms", "moderato", "andante", "swing", "syncopation"] },
            { id: "melody", label: "Melody/harmony", markingPoints: ["major", "repetition", "riff", "scat singing", "sequence", "syllabic", "walking bass"] },
            { id: "instruments", label: "Instruments/voices", markingPoints: ["male solo voice", "baritone", "tenor", "backing vocals", "backing singers", "big band", "drumkit", "double bass", "bass guitar", "piano", "trombones", "violins"] },
            { id: "dynamics", label: "Dynamics (Italian terms)", markingPoints: ["crescendo", "cresc", "mp", "mf", "f", "forte"] },
          ], answerDisplay: "Up to five valid concepts, with comments across at least three headings for full marks.", explanation: "A teacher or learner should review this response against the listed marking points. Suggested matches are guidance only, because context and musical meaning require judgement.", practiceLinks: [practice("practicequestions.html", "Practise exam-style listening questions")] },
        ],
      },
    ],
  };

  root.InteractiveExamPapers = root.InteractiveExamPapers || {};
  root.InteractiveExamPapers[paper.id] = paper;
  if (typeof module !== "undefined" && module.exports) module.exports = paper;
})(typeof window !== "undefined" ? window : globalThis);
