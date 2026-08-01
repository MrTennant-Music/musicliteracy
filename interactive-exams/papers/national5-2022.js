(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2022/Music N5 2022 - Track ${String(track).padStart(2, "0")}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "Repetition means that a musical idea is heard again.",
    q1b: "Accents make particular notes sound stronger than the notes around them.",
    q1c: "Arco means to play a string instrument with the bow.",
    q1d: "Minimalist music develops short repeated patterns through gradual change.",
    q1e: "A vamp is a short repeated accompaniment pattern; a reel is a fast Scottish dance in simple time.",
    q1f: "The clarsach is a small Scottish or Celtic harp.",
    q2a: "The pulse is grouped into recurring groups of two or four beats.",
    q2b: "A xylophone or marimba is a tuned percussion instrument with bars arranged by pitch.",
    q2c: "An Alberti bass is a broken-chord accompaniment pattern, commonly played low-high-middle-high.",
    q2d: "A trill rapidly alternates between a note and the note above it.",
    q3a: "Andante means at a walking pace; Moderato means at a moderate speed.",
    q3b: "The note marked X is D, written as a minim.",
    q3c: "Forte means loud; mezzo forte means moderately loud.",
    q3d: "An octave is the interval between one note and the next note of the same letter name.",
    q3e: "The missing notes are G dotted crotchet followed by G quaver.",
    q3f: "An imperfect cadence ends on chord V and sounds unfinished.",
    q4a: "Backing vocals support the main singer; compound time divides each beat into three equal parts.",
    q4b: "An inverted pedal is a repeated or sustained high note above changing harmony.",
    q4c: "Syllabic word setting gives one note to each syllable.",
    q4d: "Homophonic texture has one main melody supported by chords.",
    q4e: "The chord sequence is I-IV-VI-V: F-B flat-D minor-C.",
    q4f: "A change of key, or modulation, moves the music to a different key.",
    q5a: "A sequence repeats a melodic idea at a higher or lower pitch.",
    q5b: "Moderato means at a moderate speed.",
    q5c: "The oboe is a double-reed woodwind instrument with a clear, penetrating tone.",
    q5d: "Baroque music commonly uses ornamentation, contrapuntal textures and terraced dynamics.",
    q6a: "Major tonality is based on a major scale.",
    q6b: "A wind band is made mainly from woodwind, brass and percussion instruments.",
    q6c: "Binary form has two sections, usually described as AB or AABB.",
    q7a1: "Scat singing uses improvised vocal sounds and syllables, often in jazz.",
    q7a2: "Scat singing commonly features improvised nonsense or random syllables in a jazz style.",
    q7b1: "A strathspey is a Scottish dance in simple time, commonly featuring the Scotch snap.",
    q7b2: "A Scotch snap is a short accented note followed by a longer note.",
  };

  const paper = {
    id: "national5-2022",
    title: "National 5 Music 2022",
    level: "National 5",
    levelCode: "N5",
    year: 2022,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2022/Music N5 2022 - Track 01-1.mp3",
    sourcePath: "../exampapers/n5/2022/N5_Music_QP_2022.pdf",
    markingInstructionsPath: "../exampapers/n5/2022/mi_N5_Music_mi_2022.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 7, topic: "Music in different styles", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.42 }, { label: "(b)", time: 51.2 }, { label: "(c)", time: 90.08 },
          { label: "(d)", time: 134.68 }, { label: "(e)", time: 188.72 }, { label: "(f)", time: 267.54 },
        ])] },
        intro: "This question features different styles of music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Modulation", "Dotted rhythms", "Rallentando", "Repetition"].map(x => option(x)), answer: "Repetition" },
          { id: "q1b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe a feature of the music.", boldPhrases: ["one"], options: ["Accents", "Distortion", "Ritardando", "Walking bass"].map(x => option(x)), answer: "Accents" },
          { id: "q1c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt and write the Italian term to describe the string playing technique.", acceptedAnswers: ["arco"], answerDisplay: "Arco" },
          { id: "q1d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, allowMusicSuffix: true, prompt: "Listen to a different excerpt and name the style of the music.", acceptedAnswers: ["minimalist", "minimalism"], answerDisplay: "Minimalist or minimalism" },
          { id: "q1e", label: "(e)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt. Tick two boxes to describe what you hear. You will hear the music twice.", promptLines: ["Listen to this excerpt. Tick two boxes to describe what you hear.", "You will hear the music twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Drone", "Strathspey", "Vamp", "Reel", "Pibroch"].map(x => option(x)), answers: ["Vamp", "Reel"] },
          { id: "q1f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a further excerpt of Scottish music and name the instrument accompanying the melody.", acceptedAnswers: ["clarsach", "scottish harp", "celtic harp", "harp"], answerDisplay: "Clarsach, Scottish harp, Celtic harp or harp" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Film music", audio: { clips: [audio(3, [
          { label: "1st", time: 97.3 }, { label: "2nd", time: 176.96 }, { label: "3rd", time: 257.22 },
        ])] },
        intro: [
          "In this question you will hear music from a film.",
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
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "There are beats in the bar.", inlineAnswer: { before: "There are", after: "beats in the bar." }, acceptedAnswers: ["2", "two", "4", "four", "2/4", "4/4"], answerDisplay: "2 or 4 (2/4 or 4/4)" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The tuned percussion instrument playing the melody is a/an", inlineAnswer: { before: "The tuned percussion instrument playing the melody is a/an", after: "" }, acceptedAnswers: ["xylophone", "marimba"], answerDisplay: "Xylophone or marimba" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The clarinet plays a/an bass.", inlineAnswer: { before: "The clarinet plays a/an", after: "bass." }, acceptedAnswers: ["alberti", "alberti bass"], answerDisplay: "Alberti bass" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The ornament played by the flute is a/an", inlineAnswer: { before: "The ornament played by the flute is a/an", after: "" }, acceptedAnswers: ["trill"], answerDisplay: "Trill" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Guide", time: 7.48 }, { label: "1st", time: 138.16 }, { label: "2nd", time: 216.52 }, { label: "3rd", time: 295.16 },
        ])] },
        intro: [
          "You now have to answer questions about the guide to the music printed below.",
          "Listen to the excerpt and follow the music. Here is the music.",
          "You now have one minute to read through the question.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "C major", bars: 16, sharedNotation: "n5-2022-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write an Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Adagio"), option("Andante"), option("Moderato"), option("Allegro")], answer: "Andante", acceptedAnswers: ["Andante", "Moderato"], answerDisplay: "Andante or Moderato" },
          { id: "q3b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the note marked X in bar 5 [answer].", inlineAnswer: { before: "Name the note marked X in bar 5", after: "." }, acceptedAnswers: ["d", "d4", "d minim", "minim"], answerDisplay: "D or minim" },
          { id: "q3c", label: "(c)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "dynamic", prompt: "Write an appropriate dynamic marking (Italian term) under the first note of bar 9.", scoreHint: "Select a button to apply it to the score.", options: [option("p"), option("mp"), option("mf"), option("f")], answer: "f", acceptedAnswers: ["f", "forte", "mf", "mezzo forte"], answerDisplay: "f, forte, mf or mezzo forte" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "The interval in bar 11 is a/an [answer].", inlineAnswer: { before: "The interval in bar 11 is a/an", after: "." }, acceptedAnswers: ["octave", "octave leap", "8", "8th", "8ve"], answerDisplay: "Octave, octave leap, 8, 8th or 8ve" },
          { id: "q3e", label: "(e)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", inlineNotationControls: true, prompt: "Insert the missing notes in bar 13 using the rhythm provided.", options: [], noteSlots: 2, answer: "G4,G4", answerDisplay: "G dotted crotchet followed by G quaver" },
          { id: "q3f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the cadence at bar 16 [answer].", inlineAnswer: { before: "Name the cadence at bar 16", after: "." }, allowAnswerInPhrase: true, acceptedAnswers: ["imperfect", "imperfect cadence", "ends in v", "ends on v", "ends in 5", "ends on 5", "cadence ending in v", "cadence ending in 5"], answerDisplay: "Imperfect cadence (ending on V or 5)" },
        ],
      },
      {
        id: "q4", number: "4", marks: 7, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 6.28 }, { label: "(b)", time: 89.1 }, { label: "(c)", time: 173.12 },
          { label: "(d)", time: 220.58 }, { label: "(e)", time: 268.24 }, { label: "(f)", time: 376.34 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to this excerpt and tick two boxes to describe what you hear. You will hear the music twice.", promptLines: ["Listen to this excerpt and tick two boxes to describe what you hear.", "You will hear the music twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["two"], options: ["Backing vocals", "Round", "Middle 8", "Aria", "Compound time"].map(x => option(x)), answers: ["Backing vocals", "Compound time"] },
          { id: "q4b", label: "(b)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear. The music will be played twice.", promptLines: ["Listen to a new piece of music and tick one box to describe what you hear.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Accelerando", "Rondo", "A cappella", "Inverted pedal"].map(x => option(x)), answer: "Inverted pedal" },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to the vocals in this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Syllabic", "Descant", "Polyphonic", "Imitation"].map(x => option(x)), answer: "Syllabic" },
          { id: "q4d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to that excerpt again and write the concept to describe the texture of the singing.", acceptedAnswers: ["homophonic", "homophony", "homophonic texture"], answerDisplay: "Homophonic" },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", prompt: "Tick one box to identify the chord sequence heard in this song. The music is in the key of F major. You will hear the music twice, with a pause of 10 seconds between playings.", promptLines: ["Tick one box to identify the chord sequence heard in this song.", "The music is in the key of F major.", "You will hear the music twice, with a pause of 10 seconds between playings.", "", "Here is the music for the first time.", "Here is the music for the second time."], markAlign: "prompt-end", boldPhrases: ["one"], options: [
            { value: "I IV VI V", label: "I IV VI V", secondaryLabel: "F B♭ Dm C" },
            { value: "I VI IV V", label: "I VI IV V", secondaryLabel: "F Dm B♭ C" },
            { value: "I IV V VI", label: "I IV V VI", secondaryLabel: "F B♭ C Dm" },
          ], answer: "I IV VI V" },
          { id: "q4f", label: "(f)", marks: 1, type: "radio", prompt: "Listen to a different excerpt and tick one box to describe a feature of the music. The music will be played twice.", promptLines: ["Listen to a different excerpt and tick one box to describe a feature of the music.", "The music will be played twice.", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Scat singing", "Change of key", "Imitation", "Strophic"].map(x => option(x)), answer: "Change of key" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Orchestral music", audio: { clips: [audio(6, [
          { label: "1st", time: 83.66 }, { label: "2nd", time: 140.5 }, { label: "3rd", time: 197.6 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of orchestral music which will be played three times.",
          "Tick one answer only in each of the four sections.", "Melody/harmony", "Tempo", "Solo instrument", "Style", "",
          "You now have one minute to read the question before hearing the excerpt.",
          "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Melody/harmony", "Tempo", "Solo instrument", "Style"],
        introBulletRange: [2, 5],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Melody/harmony", marks: 1, type: "radio", prompt: "Melody/harmony", instruction: "Tick one box from this selection", options: ["Cluster", "Sequence", "Whole tone scale"].map(x => option(x)), answer: "Sequence" },
          { id: "q5b", label: "Tempo", marks: 1, type: "radio", prompt: "Tempo", instruction: "Tick one box from this selection", options: ["Rubato", "A tempo", "Moderato"].map(x => option(x)), answer: "Moderato" },
          { id: "q5c", label: "Solo instrument", marks: 1, type: "radio", prompt: "Solo instrument", instruction: "Tick one box from this selection", options: ["Clarinet", "Oboe", "Bassoon"].map(x => option(x)), answer: "Oboe" },
          { id: "q5d", label: "Style", marks: 1, type: "radio", prompt: "Style", instruction: "Tick one box from this selection", options: ["Baroque", "Symphony", "Romantic"].map(x => option(x)), answer: "Baroque" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 54.42 }, { label: "2nd", time: 142.1 },
        ])] },
        intro: [
          "In this question, you are asked to describe music you hear by inserting the appropriate concepts in the text below.",
          "There will be now a pause of 30 seconds to allow you to read through the question.",
          "You will hear the music twice, with a pause of 20 seconds between playings and 20 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.",
        ],
        introBoldPhrases: ["twice"],
        introTotalMarks: 3,
        introTotalMarksIndex: 0,
        showPartMarks: false,
        layout: "sentence-completion",
        subquestions: [
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "The tonality of the music is [answer].", inlineAnswer: { before: "The tonality of the music is", after: "." }, acceptedAnswers: ["major", "major key", "major tonality"], answerDisplay: "Major" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The music is played by a [answer] band.", inlineAnswer: { before: "The music is played by a", after: "band." }, acceptedAnswers: ["wind", "wind band", "military", "military band", "concert", "concert band"], answerDisplay: "Wind, military or concert band" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "The structure of the excerpt is [answer] form.", inlineAnswer: { before: "The structure of the excerpt is", after: "form." }, acceptedAnswers: ["binary", "binary form", "ab", "a b", "aabb", "a a b b"], answerDisplay: "Binary, AB or AABB" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.66 }, { label: "(b)", time: 77.02 },
        ])] },
        intro: "This question features music in different styles.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Gospel", "Scat singing", "Opera", "Mouth music"].map(x => option(x)), answer: "Scat singing" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["jazz"], acceptedKeywords: ["improvised", "nonsense"], acceptedKeywordGroups: [["random", "words"], ["not", "real"], ["dont", "make", "sense"], ["do not", "make", "sense"]], forbiddenKeywordGroups: [["jazz", "funk"], ["jazz", "fusion"], ["jazz", "rock"]], answerDisplay: "Improvised singing or vocal sounds; nonsense or random words; or jazz" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Jig", "Reel", "Strathspey", "March"].map(x => option(x)), answer: "Strathspey" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["scotch snap", "scots snap", "scot snap", "dotted rhythm", "dotted rhythms", "dotted notes"], answerDisplay: "Scotch or Scots snap, or dotted rhythms" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 37.96 }, { label: "2nd", time: 136.4 }, { label: "3rd", time: 235.24 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Melody/harmony", "Rhythm", "Timbre", "Tempo",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Melody/harmony", "Rhythm", "Timbre", "Tempo", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 7,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Broken chord or arpeggio", answers: ["broken chord", "broken chords", "arpeggio", "arpeggios", "arpeggiated"] },
              { label: "Chromatic", answers: ["chromatic", "chromaticism", "semitone", "semitones"] },
              { label: "Contrary motion", answers: ["contrary motion"] },
              { label: "Countermelody", answers: ["countermelody", "counter melody"] },
              { label: "Glissando or pitch bend", answers: ["glissando", "gliss", "pitch bend", "pitch bending"] },
              { label: "Grace notes", answers: ["grace note", "grace notes", "ornament", "ornaments"] },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Sequence", answers: ["sequence", "sequences"] },
              { label: "Question and answer", answers: ["question and answer", "question answer"] },
            ] },
            { id: "rhythm", label: "Rhythm", concepts: [
              { label: "Simple time / 2 or 4 beats / 2/4 or 4/4", answers: ["simple time", "2 beats in the bar", "2 beats in a bar", "two beats in the bar", "two beats in a bar", "4 beats in the bar", "4 beats in a bar", "four beats in the bar", "four beats in a bar", "2/4", "4/4", "common time"] },
              { label: "Accents", answers: ["accent", "accents", "accented"] },
              { label: "Cross rhythms", answers: ["cross rhythm", "cross rhythms"] },
              { label: "Dotted rhythms", answers: ["dotted rhythm", "dotted rhythms", "dotted notes"] },
              { label: "Drum fills", answers: ["drum fill", "drum fills"] },
              { label: "Pause", answers: ["pause", "pauses"] },
              { label: "Repetition", answers: ["repetition", "repeated", "repeats"], creditId: "repetition" },
              { label: "Syncopation", answers: ["syncopation", "syncopated"] },
            ] },
            { id: "timbre", label: "Timbre", concepts: [
              { label: "Con sordino or muted", answers: ["con sordino", "muted", "mute"] },
              { label: "Drum kit, cymbals or hi-hat", answers: ["drum kit", "cymbal", "cymbals", "hi hat", "hi hats", "hi-hat", "hi-hats"], blockedAnswers: ["drum"], alwaysBlockedAnswers: ["drums"] },
              { label: "Piano", answers: ["piano"] },
              { label: "Saxophones or clarinets", answers: ["saxophone", "saxophones", "sax", "clarinet", "clarinets"] },
              { label: "Trombones", answers: ["trombone", "trombones"] },
              { label: "Trumpets or banjo", answers: ["trumpet", "trumpets", "banjo"] },
            ], additionalGuidance: ["Drum or drums alone is not accepted for drum kit, cymbals or hi-hat."] },
            { id: "tempo", label: "Tempo", concepts: [
              { label: "Adagio", answers: ["adagio"] },
              { label: "Allegro", answers: ["allegro"] },
              { label: "Rubato", answers: ["rubato"] },
              { label: "Change of tempo", answers: ["change of tempo", "tempo change"], alwaysBlockedAnswers: ["gradual change of tempo", "accelerando", "rallentando", "ritardando"] },
            ], additionalGuidance: ["A change of tempo is accepted, but a gradual change of tempo is not."] },
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
