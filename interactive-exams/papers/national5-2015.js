(function (root) {
  "use strict";

  const audio = (track, markers = []) => ({
    file: `../exampapers/n5/2015/${String(track).padStart(2, "0")} Track ${track}-1.mp3`,
    label: "Question audio",
    maxPlaysExam: 1,
    markers,
  });
  const option = (value, label = value, presentation = {}) => ({ value, label, ...presentation });
  const definitions = {
    q1a: "A fusion of Scottish traditional music with rock instruments and rhythms.",
    q1b: "A lively Scottish dance in compound time.",
    q1c: "A song in which each verse uses the same music.",
    q1d: "Using the bow on a string instrument.",
    q1e: "A five-note scale.",
    q1f: "A low-pitched woodwind instrument with a double reed.",
    q2a: "Vocal music where each syllable is given one note.",
    q2b: "A mute is used to soften and change the tone colour of the trumpets.",
    q2c: "Pizzicato means plucking a string instrument.",
    q2d: "A continuously moving bass line, commonly heard in jazz.",
    q3a: "A 4/4 time signature means there are four crotchet beats in each bar.",
    q3b: "Andante means at a walking pace; Moderato means at a moderate speed.",
    q3c: "F major has one flat in its key signature: B flat.",
    q3d: "An imperfect cadence ends on chord V and sounds unfinished.",
    q3e: "B flat is the note B lowered by one semitone.",
    q3f: "The missing pitches are A, G, A and B flat, using the printed rhythm.",
    q4a: "Music in which the parts move together rhythmically.",
    q4b: "Popular vocal music with religious lyrics.",
    q4c: "A male singer with a range between tenor and bass.",
    q4d: "A second melody played or sung at the same time as the main melody.",
    q4e: "The chord sequence is I–V–VI–IV: F–C–Dm–B flat.",
    q4f: "An aria is a solo song in an opera or oratorio. Melismatic word setting gives several notes to one syllable.",
    q4g: "Soprano and mezzo-soprano are both accepted here. A mezzo-soprano has a lower vocal range than a soprano.",
    q5a: "Baroque music dates approximately from 1600 to 1750.",
    q5b: "Allegro means fast and lively.",
    q5c: "Contrapuntal music combines independent melodic lines.",
    q5d: "A sequence repeats a musical idea at a higher or lower pitch.",
    q6a: "The pulse is grouped into recurring groups of two or four beats.",
    q6b: "A trill rapidly alternates between a note and the note above it.",
    q6c: "A double-reed woodwind instrument with a clear, penetrating tone.",
    q7a1: "A large work for orchestra, usually in four movements.",
    q7a2: "A symphony is written for an orchestra.",
    q7b1: "Music from India often features instruments such as sitar and tabla.",
    q7b2: "The sitar is a plucked string instrument and the tabla is a pair of hand drums.",
  };

  const paper = {
    id: "national5-2015",
    title: "National 5 Music 2015",
    level: "National 5",
    levelCode: "N5",
    year: 2015,
    totalMarks: 40,
    openingInstructions: ["Total marks — 40", "Attempt ALL questions"],
    estimatedMinutes: 45,
    introductionAudio: "../exampapers/n5/2015/01 Track 1-1.mp3",
    sourcePath: "../exampapers/n5/2015/N5_Music_QP_2015.pdf",
    markingInstructionsPath: "../exampapers/n5/2015/mi_N5_Music_mi_2015.pdf",
    attribution: "Original question paper and audio content © Qualifications Scotland. Interactive adaptation created independently for non-commercial educational use. This resource is not endorsed by Qualifications Scotland.",
    questions: [
      {
        id: "q1", number: "1", marks: 6, topic: "Scottish music", audio: { clips: [audio(2, [
          { label: "(a)", time: 6.54 }, { label: "(b)", time: 50.32 }, { label: "(c)", time: 93.56 },
          { label: "(d)", time: 149.76 }, { label: "(e)", time: 221.68 }, { label: "(f)", time: 257.9 },
        ])] },
        intro: "This question is based on Scottish music.",
        subquestions: [
          { id: "q1a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Mouth music", "Celtic rock", "Pibroch", "Strathspey"].map(x => option(x)), answer: "Celtic rock" },
          { id: "q1b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to a continuation of that excerpt and name the Scottish dance featured.", acceptedAnswers: ["jig", "jigg", "gig"], answerDisplay: "Jig" },
          { id: "q1c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a different piece of music and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Gaelic Psalm", "Modulation", "Strophic", "Contrary motion"].map(x => option(x)), answer: "Strophic" },
          { id: "q1d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to a new piece of music and tick one box to describe what you hear. The excerpt will be played twice. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Listen to a new piece of music and tick one box to describe what you hear.", "The excerpt will be played twice.", "", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Arco", "Bodhran", "Canon", "Alberti bass"].map(x => option(x)), answer: "Arco" },
          { id: "q1e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to that excerpt again and name the scale on which the melody is based.", acceptedAnswers: ["pentatonic", "pentatonic scale", "pentatonnic", "pentatonicc"], answerDisplay: "Pentatonic" },
          { id: "q1f", label: "(f)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to another excerpt and name the woodwind instrument playing the melody.", acceptedAnswers: ["bassoon", "basoon", "basson", "bassoonn"], answerDisplay: "Bassoon" },
        ],
      },
      {
        id: "q2", number: "2", marks: 4, topic: "Musical concepts", audio: { clips: [audio(3, [
          { label: "1st", time: 99.46 }, { label: "2nd", time: 178.94 }, { label: "3rd", time: 259 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of vocal music.",
          "A guide to the music has been laid out on the following page. You will see that further information is required and you should insert this in each of the four areas.",
          "There will now be a pause of 1 minute to allow you to read through the question.",
          "The music will be played three times, with a pause of 20 seconds between playings.",
          "In the first two playings a voice will help guide you through the music. There is no voice in the third playing.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introTotalMarks: 4,
        showPartMarks: false,
        layout: "music-guide-vertical",
        subquestions: [
          { id: "q2a", label: "1", marks: 1, type: "short-text", prompt: "The type of word setting is", inlineAnswer: { before: "The type of word setting is", after: "" }, acceptedAnswers: ["syllabic", "sylabic", "syllabbic"], answerDisplay: "Syllabic" },
          { id: "q2b", label: "2", marks: 1, type: "short-text", prompt: "The instruments playing con sordino are", inlineAnswer: { before: "The instruments playing con sordino are", after: "" }, acceptedAnswers: ["trumpet", "trumpets", "trumpit", "trumpits"], answerDisplay: "Trumpet(s)" },
          { id: "q2c", label: "3", marks: 1, type: "short-text", prompt: "The double bass playing technique is (Italian term)", inlineAnswer: { before: "The double bass playing technique is", after: "(Italian term)" }, acceptedAnswers: ["pizzicato", "pizz", "pizzacato", "pizzicatto", "pitsicato", "pitzicato", "pitsickato"], answerDisplay: "Pizzicato (pizz.)" },
          { id: "q2d", label: "4", marks: 1, type: "short-text", prompt: "The type of bass line featured is a/an", inlineAnswer: { before: "The type of bass line featured is a/an", after: "" }, acceptedAnswers: ["walking", "walking bass", "walking bass line", "walkin bass"], answerDisplay: "Walking bass (or Walking)" },
        ],
      },
      {
        id: "q3", number: "3", marks: 6, topic: "Music notation", audio: { clips: [audio(4, [
          { label: "Preview", time: 13.94 }, { label: "1st", time: 66.7 }, { label: "2nd", time: 130.66 }, { label: "3rd", time: 194.48 },
        ])] },
        intro: [
          "You now have to answer questions relating to the guide score printed below.",
          "Listen to the excerpt and follow the music. Do not attempt to write during this playing. Here is the music.",
          "The music will be played three more times with a pause of 30 seconds between playings. After the final playing you will have 2 minutes in which to complete your answers. A warning tone will sound 30 seconds before the next question starts.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        score: { key: "F major", bars: 8, sharedNotation: "n5-2015-q3" },
        subquestions: [
          { id: "q3a", label: "(a)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "time-signature", prompt: "Insert the time signature in the correct place.", scoreHint: "Select a button to apply it to the score.", options: [option("2/4"), option("3/4"), option("4/4")], answer: "4/4", acceptedAnswers: ["4/4", "C", "common time"], answerDisplay: "4/4 or common time (C)" },
          { id: "q3b", label: "(b)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "tempo", prompt: "Write an Italian term at the correct place to indicate the tempo.", scoreHint: "Select a button to apply it to the score.", options: [option("Andante"), option("Moderato"), option("Adagio")], answer: "Andante", acceptedAnswers: ["Andante", "Moderato", "Adagio"], answerDisplay: "Andante, Moderato or Adagio" },
          { id: "q3c", label: "(c)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the key of this excerpt.", inlineAnswer: { before: "Name the key of this excerpt.", after: "" }, acceptedAnswers: ["f", "f major", "f maj", "f majer", "f majour"], answerDisplay: "F major" },
          { id: "q3d", label: "(d)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the cadence at bar 4.", inlineAnswer: { before: "Name the cadence at bar 4.", after: "" }, acceptedAnswers: ["imperfect", "imperfect cadence", "i v", "i to v", "1 5", "1 to 5", "imperfct", "imperfect cadance"], answerDisplay: "Imperfect (I–V)" },
          { id: "q3e", label: "(e)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Name the note marked X in bar 5.", inlineAnswer: { before: "Name the note marked X in bar 5.", after: "" }, acceptedAnswers: ["b flat", "bb", "b♭", "bflat"], answerDisplay: "B flat" },
          { id: "q3f", label: "(f)", marks: 1, type: "notation-choice", sharedScore: true, notationTool: "note-entry", prompt: "Complete bar 7 by inserting the missing notes. The rhythm is given above the bar.", scoreHint: "Use the score above to enter your answer.", options: [], noteSlots: 4, answer: "A4,G4,A4,Bb4", answerDisplay: "A dotted quaver, G semiquaver, A quaver and B flat quaver" },
        ],
      },
      {
        id: "q4", number: "4", marks: 8, topic: "Vocal music", audio: { clips: [audio(5, [
          { label: "(a)", time: 5.74 }, { label: "(b)", time: 42.96 }, { label: "(c)", time: 79.52 }, { label: "(d)", time: 142.6 },
          { label: "(e)", time: 198.06 }, { label: "(f)", time: 288.88 }, { label: "(g)", time: 338.86 },
        ])] },
        intro: "This question features vocal music.",
        subquestions: [
          { id: "q4a", label: "(a)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Descant", "Drone", "Homophonic", "Middle 8"].map(x => option(x)), answer: "Homophonic" },
          { id: "q4b", label: "(b)", marks: 1, type: "short-text", capitaliseAnswer: true, allowMusicSuffix: true, prompt: "Listen to that excerpt again and name the style.", acceptedAnswers: ["gospel", "gospal", "gospell"], answerDisplay: "Gospel" },
          { id: "q4c", label: "(c)", marks: 1, type: "radio", prompt: "Listen to a new excerpt and tick one box to describe what you hear.", boldPhrases: ["one"], options: ["Mezzo soprano", "Bass", "Baritone", "Alto"].map(x => option(x)), answer: "Baritone" },
          { id: "q4d", label: "(d)", marks: 1, type: "radio", prompt: "Listen to this excerpt and tick one box to describe what you hear. The excerpt is short and will be played twice. Here is the music for the first time. Here is the music for the second time.", promptLines: ["Listen to this excerpt and tick one box to describe what you hear.", "The excerpt is short and will be played twice.", "", "Here is the music for the first time.", "Here is the music for the second time."], boldPhrases: ["one"], options: ["Countermelody", "Rallentando", "Backing vocals", "Rondo"].map(x => option(x)), answer: "Countermelody" },
          { id: "q4e", label: "(e)", marks: 1, type: "radio", prompt: "Tick one box to identify the chord sequence heard in this music. You will hear the excerpt twice, with a pause of 10 seconds between playings. The excerpt is in the key of F major. Here is the excerpt for the first time. Here is the excerpt for the second time.", promptLines: ["Tick one box to identify the chord sequence heard in this music.", "You will hear the excerpt twice, with a pause of 10 seconds between playings.", "The excerpt is in the key of F major.", "", "Here is the excerpt for the first time.", "Here is the excerpt for the second time."], boldPhrases: ["one"], options: [
            { value: "I V VI IV", label: "I V VI IV", secondaryLabel: "F C Dm B♭" },
            { value: "I VI V IV", label: "I VI V IV", secondaryLabel: "F Dm C B♭" },
            { value: "I V IV VI", label: "I V IV VI", secondaryLabel: "F C B♭ Dm" },
          ], answer: "I V VI IV" },
          { id: "q4f", label: "(f)", marks: 2, type: "checkbox", maxSelections: 2, prompt: "Listen to a new excerpt and tick two boxes to describe features of the music.", boldPhrases: ["two"], options: ["A cappella", "Aria", "Chorus", "Scat singing", "Melismatic"].map(x => option(x)), answers: ["Aria", "Melismatic"] },
          { id: "q4g", label: "(g)", marks: 1, type: "short-text", capitaliseAnswer: true, prompt: "Listen to this excerpt. In the space provided name the type of voice that you hear.", acceptedAnswers: ["soprano", "mezzo soprano", "mezzo-soprano", "suprano", "saprano"], answerDisplay: "Soprano (or Mezzo-soprano)" },
        ],
      },
      {
        id: "q5", number: "5", marks: 4, topic: "Musical concepts", audio: { clips: [audio(6, [
          { label: "1st", time: 85.38 }, { label: "2nd", time: 139.7 }, { label: "3rd", time: 194.32 },
        ])] },
        intro: [
          "In this question you will hear an excerpt of instrumental music which will be played three times.",
          "Tick one answer only in each of the four sections.", "", "Style", "Tempo", "Texture/structure", "Melody/harmony", "",
          "You have 1 minute to read the question before hearing the excerpt.", "", "Here is the excerpt for the first time.", "Here is the excerpt for the second time.", "Here is the excerpt for the third time.",
        ],
        introBoldPhrases: ["one", "Style", "Tempo", "Texture/structure", "Melody/harmony"],
        introTotalMarks: 4,
        introTotalMarksIndex: 1,
        showPartMarks: false,
        layout: "category-groups",
        subquestions: [
          { id: "q5a", label: "Style", marks: 1, type: "radio", prompt: "Style", instruction: "Tick one box from this selection", options: ["Baroque", "Classical", "Romantic"].map(x => option(x)), answer: "Baroque" },
          { id: "q5b", label: "Tempo", marks: 1, type: "radio", prompt: "Tempo", instruction: "Tick one box from this selection", options: ["Adagio", "Ritardando", "Allegro"].map(x => option(x)), answer: "Allegro" },
          { id: "q5c", label: "Texture/structure", marks: 1, type: "radio", prompt: "Texture/structure", instruction: "Tick one box from this selection", options: ["Coda", "Contrapuntal", "Ground bass"].map(x => option(x)), answer: "Contrapuntal" },
          { id: "q5d", label: "Melody/harmony", marks: 1, type: "radio", prompt: "Melody/harmony", instruction: "Tick one box from this selection", options: ["Vamp", "Sequence", "Whole-tone scale"].map(x => option(x)), answer: "Sequence" },
        ],
      },
      {
        id: "q6", number: "6", marks: 3, topic: "Musical concepts", audio: { clips: [audio(7, [
          { label: "1st", time: 57.8 }, { label: "2nd", time: 155.92 },
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
          { id: "q6a", label: "", marks: 1, type: "short-text", prompt: "There are beats in each bar.", inlineAnswer: { before: "There are", after: "beats in each bar." }, acceptedAnswers: ["2", "4", "two", "four", "2/4", "4/4", "2 4", "4 4"], answerDisplay: "2 or 4 (2/4 or 4/4)" },
          { id: "q6b", label: "", marks: 1, type: "short-text", prompt: "The ornament featured in the flute melody is a [answer].", inlineAnswer: { before: "The ornament featured in the flute melody is a", after: "." }, acceptedAnswers: ["trill", "trills", "tril", "trll"], answerDisplay: "Trill" },
          { id: "q6c", label: "", marks: 1, type: "short-text", prompt: "Following this, the woodwind instrument playing the melody is a/an [answer].", boldPhrases: ["woodwind instrument"], inlineAnswer: { before: "Following this, the woodwind instrument playing the melody is a/an", after: "." }, acceptedAnswers: ["oboe", "obo", "obow"], answerDisplay: "Oboe" },
        ],
      },
      {
        id: "q7", number: "7", marks: 4, topic: "Styles and justification", audio: { clips: [audio(8, [
          { label: "(a)", time: 6.28 }, { label: "(b)", time: 85.72 },
        ])] },
        intro: "This question features instrumental music.",
        layout: "style-reason-groups",
        subquestions: [
          { id: "q7a1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(a)", prompt: "As you listen to the excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["Baroque", "Concerto", "Minimalist", "Symphony"].map(x => option(x)), answer: "Symphony" },
          { id: "q7a2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["orchestra", "orchestral", "full orchestra"], acceptedKeywords: ["orchestra", "orchestral"], forbiddenKeywordGroups: [["solo", "orchestra"], ["soloist", "orchestra"]], forbiddenExceptions: ["no solo instrument", "no soloist", "not a solo instrument", "not a soloist", "without a solo instrument", "without a soloist", "solo instrument is not present", "soloist is not present", "solo instrument does not play", "soloist does not play", "isnt a solo instrument", "isnt a soloist"], answerDisplay: "Full orchestra, orchestra or orchestral" },
          { id: "q7b1", label: "(i)", marks: 1, type: "radio", groupStart: { label: "(b)", prompt: "As you listen to a different excerpt:" }, prompt: "tick one box to describe the style of music, and", boldPhrases: ["one"], instructionLines: ["There will be a pause of 20 seconds before the next question starts.", "Here is the music."], options: ["African music", "Indian", "Latin American", "Ragtime"].map(x => option(x)), answer: "Indian" },
          { id: "q7b2", label: "(ii)", marks: 1, type: "short-text", answerStyle: "reason", prompt: "in the space below, give a reason to support your answer.", allowAnswerInPhrase: true, acceptedAnswers: ["sitar", "tabla", "sitar and tabla", "tabla and sitar"], acceptedKeywords: ["sitar", "tabla"], answerDisplay: "Sitar and/or tabla" },
        ],
      },
      {
        id: "q8", number: "8", marks: 5, topic: "Listening analysis", audio: { clips: [audio(9, [
          { label: "1st", time: 46.86 }, { label: "2nd", time: 119.22 }, { label: "3rd", time: 192.1 },
        ])] },
        intro: [
          "As you listen to this excerpt you are asked to identify the prominent features of the music.",
          "In your answer, comment on at least three of the following.",
          "Rhythm/tempo", "Melody/harmony", "Instruments/voices", "Dynamics (Italian terms)",
          "You will hear the music three times, with a pause of 2 minutes at the end for you to complete your final answer. A warning tone will sound 30 seconds before the end of the question paper.",
          "You may use the table below for rough working, but your final answer must be written on the opposite page.",
          "Here is the music for the first time.", "Here is the music for the second time.", "Here is the music for the third time.",
        ],
        introBoldPhrases: ["at least three", "Rhythm/tempo", "Melody/harmony", "Instruments/voices", "Dynamics (Italian terms)", "final answer must be written on the opposite page"],
        introBulletRange: [2, 5],
        introTotalMarks: 5,
        introTotalMarksIndex: 10,
        showPartMarks: false,
        subquestions: [
          { id: "q8a", label: "Final answer", marks: 5, type: "structured-review", autoMark: true, maxMarksPerHeading: 2, minHeadingsForFullMarks: 3, roughWork: true, finalAnswerField: true, continuationBefore: true, prompt: "Final answer", headings: [
            { id: "rhythm", label: "Rhythm/tempo", concepts: [
              { label: "2 or 4 beats / 2/4 / 4/4 / simple time", answers: ["2 beats", "two beats", "2 beats in the bar", "2 beats in a bar", "2 beats per bar", "two beats in the bar", "two beats in a bar", "two beats per bar", "4 beats", "four beats", "4 beats in the bar", "4 beats in a bar", "4 beats per bar", "four beats in the bar", "four beats in a bar", "four beats per bar", "2/4", "4/4", "simple time"] },
              { label: "Repetition", answers: ["repetition", "repeated"], creditId: "repetition" },
              { label: "Allegro", answers: ["allegro"] },
            ] },
            { id: "melody", label: "Melody/harmony", concepts: [
              { label: "Repetition", answers: ["repetition", "repeated"], creditId: "repetition" },
              { label: "Sequence(s)", answers: ["sequence", "sequences"] },
              { label: "Trill(s)", answers: ["trill", "trills"] },
              { label: "Major", answers: ["major", "major key", "major tonality"] },
              { label: "Minor", answers: ["minor", "minor key", "minor tonality"] },
              { label: "Change of key / Modulation", answers: ["change of key", "key change", "modulation", "modulates"] },
              { label: "Perfect cadence", answers: ["perfect cadence", "perfect cadance"] },
            ] },
            { id: "instruments", label: "Instruments/voices", concepts: [
              { label: "Cymbal(s)", answers: ["cymbal", "cymbals"] },
              { label: "Flute(s)", answers: ["flute", "flutes"] },
              { label: "Timpani", answers: ["timpani"] },
              { label: "Triangle", answers: ["triangle"] },
              { label: "Trombone(s)", answers: ["trombone", "trombones"] },
              { label: "Trumpet(s)", answers: ["trumpet", "trumpets"] },
              { label: "Violins", answers: ["violins"], blockedAnswers: ["violin"] },
            ], additionalGuidance: ["Violin must be plural: violins."] },
            { id: "dynamics", label: "Dynamics (Italian terms)", concepts: [
              { label: "p or mp", answers: ["p", "piano", "mp", "mezzo piano"] },
              { label: "mf, f or ff", answers: ["mf", "mezzo forte", "f", "forte", "ff", "fortissimo"] },
              { label: "Crescendo", answers: ["crescendo", "cresc", "<", "＜"] },
            ], additionalGuidance: ["Full Italian terms are accepted.", "English equivalents are not accepted."] },
          ], answerDisplay: "One mark for each valid concept, with a maximum of two marks per heading and five marks overall." },
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
