(function initialiseMillionaireCustomSets(globalScope) {
  "use strict";

  const FORMAT = "millionaire-question-set";
  const FORMAT_VERSION = 1;
  const QUESTION_COUNT = 15;
  // Each prize level can offer up to five different questions. The first is
  // stored in `questions`; the remaining four stay in `variants` for backwards
  // compatibility with existing saved games.
  const MAX_VARIANTS = 5;
  const MIN_COMPLETE_VARIANTS = 2;
  const DB_NAME = "mlh-millionaire-custom-sets";
  const DB_VERSION = 1;
  const STORE_NAME = "questionSets";
  const TYPES = Object.freeze({
    text: { label: "Text", image: false, audio: false },
    image: { label: "Image", image: true, audio: false },
    audio: { label: "Audio", image: false, audio: true },
    youtube: { label: "YouTube video", image: false, audio: false, youtube: true },
  });
  const LIMITS = Object.freeze({
    imageBytes: 5 * 1024 * 1024,
    audioBytes: 15 * 1024 * 1024,
    packageBytes: 50 * 1024 * 1024,
    decompressedBytes: 60 * 1024 * 1024,
  });
  const IMAGE_MIME_TYPES = Object.freeze(["image/png", "image/jpeg", "image/gif", "image/webp"]);
  const AUDIO_MIME_TYPES = Object.freeze([
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg",
  ]);
  const S1_ORCHESTRA_STARTER_ID = "mlh-starter-s1-orchestra";
  const ORCHESTRA_STARTER_PACKAGE_URL = "millionaire-starter/orchestra/orchestra.millionaire-set";
  const S1_ORCHESTRA_STARTER_QUESTIONS = [
    [
      ["Which family does the violin belong to?", ["Strings", "Woodwind", "Brass", "Percussion"], 0, "It has four strings and is usually played with a bow."],
      ["Which family does the flute belong to?", ["Brass", "Woodwind", "Strings", "Percussion"], 1, "It is played by blowing across a hole rather than buzzing the lips."],
      ["Which family does the French horn belong to?", ["Woodwind", "Strings", "Brass", "Percussion"], 2, "Players make its sound by buzzing their lips into a mouthpiece."],
      ["Which family does the timpani belong to?", ["Strings", "Brass", "Woodwind", "Percussion"], 3, "It is a large tuned drum played with beaters."],
    ],
    [
      ["Which is the highest-pitched standard string instrument?", ["Double bass", "Cello", "Viola", "Violin"], 3, "It is the smallest of the four main string instruments."],
      ["Which is the lowest-pitched standard string instrument?", ["Double bass", "Violin", "Viola", "Cello"], 0, "It is the largest standard member of the string family."],
      ["Which string instrument is normally played sitting down between the knees?", ["Violin", "Cello", "Viola", "Double bass"], 1, "Its endpin rests on the floor."],
      ["Which string instrument is larger than a violin but smaller than a cello?", ["Double bass", "Cello", "Viola", "Harp"], 2, "It plays the middle part of the string family."],
    ],
    [
      ["Which woodwind instrument uses a single reed?", ["Flute", "Clarinet", "Oboe", "Bassoon"], 1, "Its reed is attached to a mouthpiece."],
      ["Which woodwind instrument uses a double reed?", ["Trumpet", "Flute", "Oboe", "Clarinet"], 2, "Its two small reeds vibrate together."],
      ["Which woodwind instrument is played by blowing across an opening and has no reed?", ["Flute", "Bassoon", "Clarinet", "Oboe"], 0, "It is held sideways."],
      ["Which woodwind instrument is a long, low instrument with a double reed?", ["Piccolo", "Clarinet", "Flute", "Bassoon"], 3, "It is one of the lowest regular woodwind instruments."],
    ],
    [
      ["How do brass players start the sound on their instruments?", ["By plucking strings", "By striking a drumhead", "By buzzing their lips", "By using a reed"], 2, "Think about the player's lips against the mouthpiece."],
      ["Which brass instrument is known for its slide?", ["Trombone", "Trumpet", "Tuba", "French horn"], 0, "Its long tube can move in and out."],
      ["Which brass instrument is usually played with three valves and has a bright sound?", ["Tuba", "French horn", "Trumpet", "Trombone"], 2, "It is a common instrument for fanfares."],
      ["Which is the lowest regular brass instrument?", ["Trumpet", "Tuba", "Trombone", "French horn"], 1, "It is the largest brass instrument in the orchestra."],
    ],
    [
      ["Which percussion instrument has a definite pitch that can be changed with a pedal?", ["Snare drum", "Timpani", "Cymbals", "Triangle"], 1, "It is a set of large orchestral drums."],
      ["What gives a snare drum its distinctive buzzing sound?", ["Strings", "Valves", "Snares", "Reeds"], 2, "They are wires stretched across the lower head."],
      ["Which percussion instrument has wooden bars arranged like a keyboard?", ["Xylophone", "Tambourine", "Bass drum", "Cymbals"], 0, "It is played with mallets."],
      ["Which percussion instrument is made from two metal discs clashed together?", ["Triangle", "Timpani", "Cymbals", "Glockenspiel"], 2, "It is often used for a loud crash."],
    ],
    [
      ["Who leads the orchestra during a performance?", ["The conductor", "The composer", "The audience", "The librarian"], 0, "They stand at the front and use gestures."],
      ["What does a conductor use to help show the beat?", ["A bow", "A baton", "A reed", "A mute"], 1, "It is a slim stick held in one hand."],
      ["What is the name for the written music containing every orchestral part?", ["A score", "A playlist", "A programme", "A solo"], 0, "The conductor reads it during rehearsals."],
      ["What is a section in an orchestra?", ["A group of similar instruments", "One page of music", "A type of audience seat", "A musical rest"], 0, "For example, all the violins form one."],
    ],
    [
      ["Where are the string instruments usually placed in an orchestra?", ["At the front", "At the very back", "Behind the audience", "On a balcony"], 0, "They need to be seen clearly by the conductor."],
      ["Which family is often positioned towards the back because it can be loud?", ["Brass", "Strings", "Woodwind", "Voices"], 0, "Trumpets and trombones belong to it."],
      ["Where is the percussion section usually found?", ["At the back", "At the front", "Beside the conductor", "In the audience"], 0, "Large instruments need space and can be very loud."],
      ["Which group is commonly seated between the strings and brass?", ["Woodwind", "Audience", "Choir", "Stage crew"], 0, "Flutes, oboes and clarinets belong to it."],
    ],
    [
      ["What does pizzicato mean for a string player?", ["Pluck the strings", "Play very loudly", "Use a mute", "Play faster"], 0, "The player uses a finger rather than the bow."],
      ["What does arco mean for a string player?", ["Play with the bow", "Pluck the strings", "Play silently", "Change instrument"], 0, "It is the usual way a violin is played."],
      ["What does a mute do to an instrument's sound?", ["Makes it softer or changes its tone", "Makes it higher", "Makes it longer", "Makes it faster"], 0, "It is placed on or in an instrument to change the sound."],
      ["What does tremolo mean on a string instrument?", ["Rapidly repeat or move the bow", "Play one long note", "Pluck once", "Stop playing"], 0, "It can create a trembling effect."],
    ],
    [
      ["Which instrument sounds higher than a flute?", ["Piccolo", "Tuba", "Cello", "Bassoon"], 0, "It looks like a small flute."],
      ["Which instrument has the lowest pitch in the brass family?", ["Trumpet", "French horn", "Tuba", "Trombone"], 2, "It has the longest tube of the choices."],
      ["Which instrument has the lowest pitch in the standard string family?", ["Violin", "Viola", "Cello", "Double bass"], 3, "It is the largest of the four."],
      ["Which instrument generally has the highest pitch in the standard woodwind family?", ["Piccolo", "Bassoon", "Clarinet", "Oboe"], 0, "It is smaller than the flute."],
    ],
    [
      ["Which instrument is well known for a bright, brilliant brass sound?", ["Trumpet", "Bassoon", "Cello", "Timpani"], 0, "It is often used for fanfares."],
      ["Which instrument is often described as having a warm, rich low string sound?", ["Cello", "Piccolo", "Triangle", "Trumpet"], 0, "It is played sitting down and has an endpin."],
      ["Which woodwind instrument often has a clear, reedy tone?", ["Oboe", "Tuba", "Violin", "Timpani"], 0, "It uses a double reed."],
      ["Which instrument can produce a very deep, powerful sound in the orchestra?", ["Double bass", "Piccolo", "Flute", "Triangle"], 0, "It is the largest standard string instrument."],
    ],
    [
      ["Which instrument is played with a bow and has four strings?", ["Violin", "Trumpet", "Flute", "Timpani"], 0, "It belongs at the front of the orchestra."],
      ["Which instrument has a bell, valves and is played by buzzing the lips?", ["Trumpet", "Clarinet", "Cello", "Xylophone"], 0, "It is a brass instrument."],
      ["Which instrument has keys and a single reed?", ["Clarinet", "Flute", "Trombone", "Viola"], 0, "It belongs to the woodwind family."],
      ["Which instrument is hit with beaters and can be tuned to different notes?", ["Timpani", "Cymbals", "Snare drum", "Tambourine"], 0, "It is also called kettle drums."],
    ],
    [
      ["What does the dynamic marking p mean?", ["Play quietly", "Play loudly", "Play quickly", "Play slowly"], 0, "It comes from the Italian word piano."],
      ["What does the dynamic marking f mean?", ["Play loudly", "Play quietly", "Play smoothly", "Play alone"], 0, "It comes from the Italian word forte."],
      ["What does crescendo mean?", ["Gradually get louder", "Gradually get quieter", "Gradually get slower", "Stop suddenly"], 0, "The sound grows."],
      ["What does diminuendo mean?", ["Gradually get quieter", "Gradually get louder", "Repeat the section", "Play higher"], 0, "The sound dies away."],
    ],
    [
      ["What does allegro usually mean?", ["Fast and lively", "Slow and calm", "Very quiet", "Very loud"], 0, "It is a common Italian tempo word."],
      ["What does adagio usually mean?", ["Slow", "Fast", "Very loud", "Very short"], 0, "It is slower than moderato."],
      ["What does moderato mean?", ["At a moderate speed", "As fast as possible", "Very slowly", "Without a beat"], 0, "It sits between fast and slow."],
      ["What does accelerando mean?", ["Gradually get faster", "Gradually get slower", "Gradually get louder", "Repeat from the start"], 0, "The tempo increases."],
    ],
    [
      ["What happens to pitch when vibrations become faster?", ["It gets higher", "It gets lower", "It stays the same", "It disappears"], 0, "High notes vibrate more quickly."],
      ["A longer string usually produces a pitch that is…", ["Lower", "Higher", "Always louder", "Always quieter"], 0, "Think about the large double bass compared with a violin."],
      ["A shorter air column in a wind instrument usually produces a pitch that is…", ["Higher", "Lower", "Silent", "Unchanged"], 0, "Compare a piccolo with a tuba."],
      ["Which change makes a string instrument sound higher?", ["Shortening the vibrating string", "Using a longer string", "Making the instrument larger", "Slowing the vibrations"], 0, "Players press the string to make the vibrating length shorter."],
    ],
    [
      ["Which pair are both members of the string family?", ["Violin and cello", "Flute and oboe", "Trumpet and trombone", "Timpani and cymbals"], 0, "Both are played with bows or by plucking."],
      ["Which pair are both members of the woodwind family?", ["Clarinet and bassoon", "Violin and viola", "Trumpet and tuba", "Snare drum and triangle"], 0, "Both are played by blowing air through the instrument."],
      ["Which pair are both members of the brass family?", ["Trumpet and French horn", "Flute and piccolo", "Cello and double bass", "Xylophone and timpani"], 0, "Both use cup-shaped mouthpieces."],
      ["Which pair are both members of the percussion family?", ["Cymbals and triangle", "Oboe and clarinet", "Violin and cello", "Tuba and trombone"], 0, "Both are struck to make a sound."],
    ],
  ];
  // The current Orchestra template follows the teaching sequence used in S1.
  // Media remains optional so the starter game is playable before media is added.
  const ORCHESTRA_TEMPLATE_QUESTIONS = [
    [
      ["Which family does the violin belong to?", ["Strings", "Woodwind", "Brass", "Percussion"], 0, "It has four strings and is normally played with a bow."],
      ["Which family does the flute belong to?", ["Brass", "Woodwind", "Strings", "Percussion"], 1, "It is played by blowing across an opening."],
      ["Which family does the trumpet belong to?", ["Woodwind", "Strings", "Brass", "Percussion"], 2, "Players buzz their lips to make the sound."],
      ["Which family does the snare drum belong to?", ["Strings", "Brass", "Woodwind", "Percussion"], 3, "It is struck with drumsticks."],
    ],
    [
      ["What are string instruments mainly played with?", ["A bow or fingers", "A reed", "Valves only", "Drumsticks only"], 0, "Think about how a violin makes a sound."],
      ["What are woodwind instruments mainly played by doing?", ["Blowing air through them", "Plucking strings", "Bowing strings", "Striking drumheads"], 0, "Flutes, oboes and clarinets belong to this family."],
      ["What are brass instruments played by doing?", ["Buzzing the lips", "Using a double reed", "Plucking strings", "Shaking bells"], 0, "The player's lips vibrate against a mouthpiece."],
      ["What are percussion instruments mainly played by doing?", ["Striking, shaking or scraping", "Bowing strings", "Blowing through a reed", "Buzzing the lips"], 0, "Drums and cymbals belong to this family."],
    ],
    [
      ["Which family would an instrument played with a bow belong to?", ["Strings", "Brass", "Woodwind", "Percussion"], 0, "Think of violin, viola and cello."],
      ["Which family would an instrument played with a reed belong to?", ["Woodwind", "Strings", "Brass", "Percussion"], 0, "Clarinets, oboes and bassoons use reeds."],
      ["Which family would an instrument with valves and a cup mouthpiece belong to?", ["Brass", "Woodwind", "Strings", "Percussion"], 0, "Trumpets and tubas are examples."],
      ["Which family would an instrument with tuned wooden bars belong to?", ["Percussion", "Strings", "Brass", "Woodwind"], 0, "Think of the xylophone."],
    ],
    [
      ["Look at the instrument above. Which family is it from?", ["Strings", "Woodwind", "Brass", "Percussion"], 0, "Use the instrument's shape and how it is played."],
      ["Look at the instrument above. Which family is it from?", ["Woodwind", "Brass", "Strings", "Percussion"], 1, "Look for keys, a reed or a blowing hole."],
      ["Look at the instrument above. Which family is it from?", ["Brass", "Strings", "Woodwind", "Percussion"], 2, "Look for a flared bell and a mouthpiece."],
      ["Look at the instrument above. Which family is it from?", ["Strings", "Brass", "Woodwind", "Percussion"], 3, "Think about whether it is struck, shaken or scraped."],
    ],
    [
      ["Look at the instrument above. What is its name?", ["Violin", "Cello", "Double bass", "Viola"], 0, "It is the highest regular string instrument."],
      ["Look at the instrument above. What is its name?", ["Piccolo", "Flute", "Clarinet", "Oboe"], 0, "It is the smallest and highest common woodwind instrument."],
      ["Look at the instrument above. What is its name?", ["Tuba", "Trumpet", "Trombone", "French horn"], 0, "It is the largest and lowest regular brass instrument."],
      ["Look at the instrument above. What is its name?", ["Timpani", "Snare drum", "Triangle", "Cymbals"], 0, "These are large tuned orchestral drums."],
    ],
    [
      ["Which is the highest-sounding member of the string family?", ["Violin", "Viola", "Cello", "Double bass"], 0, "It is the smallest standard string instrument."],
      ["Which is the highest-sounding common woodwind instrument?", ["Piccolo", "Flute", "Clarinet", "Bassoon"], 0, "It is smaller than a flute."],
      ["Which is the highest-sounding regular brass instrument?", ["Trumpet", "Trombone", "French horn", "Tuba"], 0, "It often plays fanfares."],
      ["Which is the highest-sounding tuned percussion instrument here?", ["Glockenspiel", "Xylophone", "Timpani", "Bass drum"], 0, "Its small metal bars make a bright high sound."],
    ],
    [
      ["Which is the lowest-sounding member of the string family?", ["Double bass", "Cello", "Viola", "Violin"], 0, "It is the largest standard string instrument."],
      ["Which is the lowest-sounding regular woodwind instrument?", ["Bassoon", "Clarinet", "Oboe", "Flute"], 0, "It is long and uses a double reed."],
      ["Which is the lowest-sounding brass instrument?", ["Tuba", "Trombone", "French horn", "Trumpet"], 0, "It has the longest tube of these instruments."],
      ["Which is the lowest-sounding tuned percussion instrument here?", ["Timpani", "Glockenspiel", "Triangle", "Xylophone"], 0, "They are large drums whose pitch can be changed."],
    ],
    [
      ["Is a xylophone a tuned or untuned percussion instrument?", ["Tuned", "Untuned", "Both", "Neither"], 0, "Its bars can play recognisable notes."],
      ["Is a snare drum a tuned or untuned percussion instrument?", ["Untuned", "Tuned", "Both", "Neither"], 0, "It makes a sound, but not a definite melody note."],
      ["Are timpani tuned or untuned percussion instruments?", ["Tuned", "Untuned", "Both", "Neither"], 0, "A pedal changes the note they produce."],
      ["Are cymbals tuned or untuned percussion instruments?", ["Untuned", "Tuned", "Both", "Neither"], 0, "They make a crash rather than a definite note."],
    ],
    [
      ["Listen to the music. Which instrument family can you hear?", ["Strings", "Woodwind", "Brass", "Percussion"], 0, "Listen for instruments played with bows or plucked strings."],
      ["Listen to the music. Which instrument family can you hear?", ["Woodwind", "Brass", "Strings", "Percussion"], 1, "Listen for a sound made by air and possibly a reed."],
      ["Listen to the music. Which instrument family can you hear?", ["Brass", "Strings", "Woodwind", "Percussion"], 2, "Listen for a bold sound made by buzzing lips."],
      ["Listen to the music. Which instrument family can you hear?", ["Strings", "Brass", "Woodwind", "Percussion"], 3, "Listen for instruments that are struck or shaken."],
    ],
    [
      ["Listen to the music. How are the string instruments being played?", ["With a bow", "By plucking", "By blowing", "By striking"], 0, "The sound should be smooth and sustained."],
      ["Listen to the music. How are the string instruments being played?", ["By plucking", "With a bow", "With a reed", "With valves"], 0, "The notes sound short and separated."],
      ["Which is the odd instrument out?", ["Trumpet", "Violin", "Viola", "Cello"], 0, "Three belong to the string family."],
      ["Which is the odd instrument out?", ["Timpani", "Flute", "Oboe", "Clarinet"], 0, "Three belong to the woodwind family."],
    ],
    [
      ["Listen to the music. Which instrument can you hear?", ["Violin", "Cello", "Tuba", "Timpani"], 0, "Listen for a high string sound."],
      ["Listen to the music. Which instrument can you hear?", ["Flute", "Bassoon", "Trombone", "Double bass"], 0, "Listen for a light, high woodwind sound."],
      ["Listen to the music. Which instrument can you hear?", ["Trumpet", "Clarinet", "Cello", "Xylophone"], 0, "Listen for a bright brass sound."],
      ["Listen to the music. Which instrument can you hear?", ["Timpani", "Triangle", "Violin", "Oboe"], 0, "Listen for large tuned drums."],
    ],
    [
      ["Listen to the music. Which playing technique can you hear?", ["Pizzicato", "Arco", "A reed", "A valve"], 0, "The strings are plucked rather than bowed."],
      ["Listen to the music. Which playing technique can you hear?", ["Arco", "Pizzicato", "Muted cymbals", "Valve playing"], 0, "The strings are played with a bow."],
      ["Listen to the music. Which playing technique can you hear?", ["Tremolo", "Pizzicato", "Glissando", "Silence"], 0, "The bow moves rapidly to create a trembling sound."],
      ["Listen to the music. Which effect can you hear?", ["Muted sound", "A faster tempo", "A higher pitch", "A new instrument family"], 0, "A mute changes and softens an instrument's tone."],
    ],
    [
      ["Which woodwind instrument uses a single reed?", ["Clarinet", "Flute", "Oboe", "Trumpet"], 0, "Its reed is attached to a mouthpiece."],
      ["Which woodwind instrument uses a double reed?", ["Oboe", "Flute", "Clarinet", "Trombone"], 0, "Two small reeds vibrate together."],
      ["Which woodwind instrument is played without a reed?", ["Flute", "Bassoon", "Oboe", "Clarinet"], 0, "The player blows across an opening."],
      ["Which instrument uses a double reed and has a low sound?", ["Bassoon", "Piccolo", "Trumpet", "Violin"], 0, "It is a long woodwind instrument."],
    ],
    [
      ["Which instrument uses keys to change notes?", ["Clarinet", "Trombone", "Violin", "Timpani"], 0, "It is a woodwind instrument with a single reed."],
      ["Which instrument uses valves to change notes?", ["Trumpet", "Flute", "Cello", "Xylophone"], 0, "It is a brass instrument with a bright sound."],
      ["Which instrument uses a slide to change notes?", ["Trombone", "Tuba", "Clarinet", "Viola"], 0, "Its long tube moves in and out."],
      ["Which instrument uses an endpin to rest on the floor?", ["Cello", "Violin", "Flute", "Trumpet"], 0, "It is a low string instrument played sitting down."],
    ],
    [
      ["How do brass players start the sound on their instruments?", ["By buzzing their lips", "By plucking strings", "By using a reed", "By striking a drumhead"], 0, "The lips vibrate against a cup-shaped mouthpiece."],
      ["Which family uses cup-shaped mouthpieces?", ["Brass", "Woodwind", "Strings", "Percussion"], 0, "Trumpet, trombone and tuba belong to this family."],
      ["Which brass instrument is known for its slide?", ["Trombone", "Trumpet", "Tuba", "French horn"], 0, "Its tube can move in and out."],
      ["Which brass instrument is usually played with three valves?", ["Trumpet", "Trombone", "Flute", "Violin"], 0, "It is a common instrument for fanfares."],
    ],
  ];

  function uniqueId(prefix = "id") {
    if (globalScope.crypto?.randomUUID) return `${prefix}-${globalScope.crypto.randomUUID()}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function cloneBlob(blob) {
    return blob instanceof Blob ? blob.slice(0, blob.size, blob.type) : null;
  }

  function cloneMedia(media, regenerateId = false) {
    if (!media || typeof media !== "object") return null;
    return {
      id: regenerateId ? uniqueId("media") : (typeof media.id === "string" && media.id ? media.id : uniqueId("media")),
      name: typeof media.name === "string" ? media.name : "media",
      type: typeof media.type === "string" ? media.type : media.blob?.type || "",
      size: Number.isFinite(media.size) ? media.size : media.blob?.size || 0,
      duration: Number.isFinite(media.duration) ? media.duration : null,
      blob: cloneBlob(media.blob),
    };
  }

  function emptyQuestion(number) {
    return {
      id: uniqueId("question"),
      number,
      type: "text",
      prompt: "",
      answers: ["", "", "", ""],
      correctAnswerIndex: null,
      hint: "",
      image: null,
      imageAlt: "",
      audio: null,
      youtubeUrl: "",
    };
  }

  function normaliseQuestion(question, number, regenerateIds = false) {
    const source = question && typeof question === "object" ? question : {};
    const answers = Array.isArray(source.answers) ? source.answers.slice(0, 4) : [];
    while (answers.length < 4) answers.push("");
    const sourceType = source.type === "image-audio"
      ? source.image ? "image" : source.audio ? "audio" : "text"
      : source.type;
    const type = TYPES[sourceType] ? sourceType : "text";
    return {
      id: regenerateIds ? uniqueId("question") : (typeof source.id === "string" && source.id ? source.id : uniqueId("question")),
      number,
      type,
      prompt: typeof source.prompt === "string" ? source.prompt : "",
      answers: answers.map((answer) => typeof answer === "string" ? answer : ""),
      correctAnswerIndex: Number.isInteger(source.correctAnswerIndex) ? source.correctAnswerIndex : null,
      hint: typeof source.hint === "string" ? source.hint : "",
      image: type === "image" ? cloneMedia(source.image, regenerateIds) : null,
      imageAlt: typeof source.imageAlt === "string" ? source.imageAlt : "",
      audio: type === "audio" ? cloneMedia(source.audio, regenerateIds) : null,
      youtubeUrl: type === "youtube" && typeof source.youtubeUrl === "string" ? source.youtubeUrl.trim() : "",
    };
  }

  function createSet(title) {
    const now = new Date().toISOString();
    return {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: uniqueId("set"),
      title: String(title || "").trim(),
      createdAt: now,
      updatedAt: now,
      includeInRandom: true,
      questions: Array.from({ length: QUESTION_COUNT }, (_, index) => emptyQuestion(index + 1)),
      variants: Array.from({ length: QUESTION_COUNT }, (_, index) => [emptyQuestion(index + 1)]),
      shuffleVariants: Array.from({ length: QUESTION_COUNT }, () => false),
    };
  }

  function starterQuestion({ prompt, answers, correctAnswerIndex, hint }, number) {
    return {
      ...emptyQuestion(number),
      prompt,
      answers: answers.slice(),
      correctAnswerIndex,
      hint,
    };
  }

  function rotateQuestionAnswers(question, offset) {
    const rotation = offset % question.answers.length;
    if (!rotation) return question;
    return {
      ...question,
      answers: question.answers.map((_, index) => question.answers[(index + rotation) % question.answers.length]),
      correctAnswerIndex: (question.correctAnswerIndex - rotation + question.answers.length) % question.answers.length,
    };
  }

  function createS1OrchestraStarterSet() {
    const starter = createSet("Example: Orchestra");
    starter.id = S1_ORCHESTRA_STARTER_ID;
    const questionGroups = ORCHESTRA_TEMPLATE_QUESTIONS.slice();
    [questionGroups[12], questionGroups[14]] = [questionGroups[14], questionGroups[12]];
    starter.questions = questionGroups.map((versions, index) => {
      const [prompt, answers, correctAnswerIndex, hint] = versions[0];
      return rotateQuestionAnswers(starterQuestion({ prompt, answers, correctAnswerIndex, hint }, index + 1), index);
    });
    starter.variants = questionGroups.map((versions, index) => versions.slice(1).map(([prompt, answers, correctAnswerIndex, hint], versionIndex) => rotateQuestionAnswers(starterQuestion({ prompt, answers, correctAnswerIndex, hint }, index + 1), index + versionIndex + 1)));
    return starter;
  }

  async function loadOrchestraStarterSet() {
    try {
      if (!globalScope.fetch || !globalScope.JSZip) throw new Error("The built-in game package is unavailable.");
      const response = await globalScope.fetch(ORCHESTRA_STARTER_PACKAGE_URL);
      if (!response.ok) throw new Error("The built-in game package could not be loaded.");
      const result = await importPackage(await response.blob(), globalScope.JSZip);
      const starter = result.set;
      starter.id = S1_ORCHESTRA_STARTER_ID;
      starter.title = "Example: Orchestra";
      return starter;
    } catch (error) {
      console.warn("Millionaire Orchestra starter package could not be loaded.", error);
      return createS1OrchestraStarterSet();
    }
  }

  function migrateS1OrchestraStarterSet(set) {
    if (!set || set.id !== S1_ORCHESTRA_STARTER_ID || set.title !== "S1 Orchestra") return set;
    const migrated = normaliseSet({ ...set, title: "Example: Orchestra" });
    [migrated.questions[3], migrated.questions[14]] = [migrated.questions[14], migrated.questions[3]];
    [migrated.variants[3], migrated.variants[14]] = [migrated.variants[14], migrated.variants[3]];
    return migrated;
  }

  function retainMedia(templateQuestion, existingQuestion) {
    const existing = existingQuestion && typeof existingQuestion === "object" ? existingQuestion : {};
    const mediaType = existing.image ? "image" : existing.audio ? "audio" : existing.youtubeUrl ? "youtube" : "text";
    return {
      ...templateQuestion,
      id: typeof existing.id === "string" ? existing.id : templateQuestion.id,
      type: mediaType,
      image: existing.image || null,
      imageAlt: existing.imageAlt || "",
      audio: existing.audio || null,
      youtubeUrl: existing.youtubeUrl || "",
    };
  }

  function refreshOrchestraStarterSet(set) {
    if (!set || set.id !== S1_ORCHESTRA_STARTER_ID || set.questions?.[5]?.prompt !== "Who leads the orchestra during a performance?") return set;
    const template = createS1OrchestraStarterSet();
    const refreshed = normaliseSet(set);
    refreshed.title = "Example: Orchestra";
    refreshed.questions = template.questions.map((question, index) => retainMedia(question, set.questions[index]));
    refreshed.variants = template.variants.map((versions, stageIndex) => versions.map((question, versionIndex) => retainMedia(question, set.variants?.[stageIndex]?.[versionIndex])));
    return refreshed;
  }

  function moveOrchestraReedQuestions(set) {
    if (!set || set.id !== S1_ORCHESTRA_STARTER_ID || set.questions?.[12]?.prompt !== "Which woodwind instrument uses a single reed?") return set;
    const moved = normaliseSet(set);
    [moved.questions[12], moved.questions[14]] = [moved.questions[14], moved.questions[12]];
    [moved.variants[12], moved.variants[14]] = [moved.variants[14], moved.variants[12]];
    return moved;
  }

  function shuffleOrchestraStarterAnswers(set) {
    const allQuestions = [
      ...(set?.questions || []),
      ...((set?.variants || []).flat()),
    ];
    const answersInFirstPosition = allQuestions.filter((question) => question?.correctAnswerIndex === 0).length;
    if (!set || set.id !== S1_ORCHESTRA_STARTER_ID || answersInFirstPosition < 30) return set;
    const shuffled = normaliseSet(set);
    shuffled.questions = shuffled.questions.map((question, stageIndex) => rotateQuestionAnswers(question, stageIndex));
    shuffled.variants = shuffled.variants.map((versions, stageIndex) => versions.map((question, versionIndex) => rotateQuestionAnswers(question, stageIndex + versionIndex + 1)));
    return shuffled;
  }

  function renameOrchestraStarterSet(set) {
    if (!set || set.id !== S1_ORCHESTRA_STARTER_ID || !["Orchestra", "S1 Orchestra"].includes(set.title)) return set;
    return normaliseSet({ ...set, title: "Example: Orchestra" });
  }

  function normaliseSet(value, options = {}) {
    const source = value && typeof value === "object" ? value : {};
    const regenerateIds = Boolean(options.regenerateIds);
    const now = new Date().toISOString();
    const sourceQuestions = Array.isArray(source.questions) ? source.questions : [];
    const sourceVariants = Array.isArray(source.variants) ? source.variants : [];
    return {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: regenerateIds ? uniqueId("set") : (typeof source.id === "string" && source.id ? source.id : uniqueId("set")),
      title: typeof source.title === "string" ? source.title.trim() : "",
      createdAt: regenerateIds ? now : (typeof source.createdAt === "string" ? source.createdAt : now),
      updatedAt: regenerateIds ? now : (typeof source.updatedAt === "string" ? source.updatedAt : now),
      includeInRandom: source.includeInRandom !== false,
      playOnly: source.playOnly === true,
      // Older Question Bank entries are intentionally not carried forward. Question
      // Alternative questions belong to a specific ladder question, so only the first 15 are kept.
      questions: Array.from({ length: QUESTION_COUNT }, (_, index) => normaliseQuestion(sourceQuestions[index], index + 1, regenerateIds)),
      variants: Array.from({ length: QUESTION_COUNT }, (_, stageIndex) => {
        const sourceStageVariants = Array.isArray(sourceVariants[stageIndex]) ? sourceVariants[stageIndex] : [];
        const variants = sourceStageVariants.slice(0, MAX_VARIANTS - 1)
          .map((question) => normaliseQuestion(question, stageIndex + 1, regenerateIds));
        return variants.length ? variants : [emptyQuestion(stageIndex + 1)];
      }),
      shuffleVariants: Array.from({ length: QUESTION_COUNT }, (_, index) => source.shuffleVariants?.[index] === true),
    };
  }

  function hasQuestionContent(question) {
    if (!question) return false;
    return Boolean(
      String(question.prompt || "").trim()
      || String(question.hint || "").trim()
      || String(question.imageAlt || "").trim()
      || (question.answers || []).some((answer) => String(answer || "").trim())
      || Number.isInteger(question.correctAnswerIndex)
      || question.image
      || question.audio
      || String(question.youtubeUrl || "").trim()
      || question.type !== "text"
    );
  }

  function mediaReadable(media, allowedTypes) {
    return Boolean(
      media
      && media.blob instanceof Blob
      && media.blob.size > 0
      && allowedTypes.includes(media.type || media.blob.type)
    );
  }

  function youtubeVideoId(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
      let id = "";
      if (hostname === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
      else if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
        if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
        else {
          const parts = url.pathname.split("/").filter(Boolean);
          if (["embed", "shorts", "live"].includes(parts[0])) id = parts[1] || "";
        }
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
    } catch {
      return "";
    }
  }

  function youtubeEmbedUrl(value) {
    const id = youtubeVideoId(value);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  }

  function validateQuestion(question) {
    const issues = [];
    if (!String(question?.prompt || "").trim()) issues.push({ field: "prompt", message: "has no question text" });
    if (!Array.isArray(question?.answers) || question.answers.length !== 4) {
      issues.push({ field: "answers", message: "must have exactly four answer options" });
    } else if (question.answers.some((answer) => !String(answer || "").trim())) {
      issues.push({ field: "answers", message: "has an empty answer option" });
    }
    if (!Number.isInteger(question?.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
      issues.push({ field: "correctAnswer", message: "has no correct answer" });
    }
    if (!String(question?.hint || "").trim()) issues.push({ field: "hint", message: "has no hint" });
    if (!TYPES[question?.type]) issues.push({ field: "type", message: "has an unsupported question type" });
    return issues;
  }

  function validateSet(set) {
    const issues = [];
    const questions = Array.isArray(set?.questions) ? set.questions : [];
    if (!String(set?.title || "").trim()) issues.push({ questionNumber: null, field: "title", message: "The set name is required." });
    if (questions.length < QUESTION_COUNT) {
      issues.push({ questionNumber: null, field: "questions", message: `The set must contain at least ${QUESTION_COUNT} main questions.` });
    }
    let completeCount = 0;
    let mainCompleteCount = 0;
    const completeVariantsByQuestion = [];
    for (let index = 0; index < QUESTION_COUNT; index += 1) {
      const variants = [questions[index], ...(Array.isArray(set?.variants?.[index]) ? set.variants[index] : [])];
      const completedVariants = variants.filter((question) => validateQuestion(question).length === 0);
      completeVariantsByQuestion.push(completedVariants.length);
      completeCount += completedVariants.length;
      if (completedVariants.length >= MIN_COMPLETE_VARIANTS) mainCompleteCount += 1;
      if (completedVariants.length < MIN_COMPLETE_VARIANTS) {
        issues.push({
          questionNumber: index + 1,
          field: "variants",
          message: `Prize level ${index + 1} needs ${MIN_COMPLETE_VARIANTS} complete questions for varied games and the Switch lifeline.`,
        });
      }
    }
    const incompleteCount = QUESTION_COUNT - mainCompleteCount;
    return {
      valid: issues.length === 0,
      completeCount,
      incompleteCount,
      mainCompleteCount,
      completeVariantsByQuestion,
      reserveCompleteCount: 0,
      reserveCount: 0,
      issues,
    };
  }

  function setSummary(set) {
    const validation = validateSet(set);
    return {
      id: set.id,
      title: set.title,
      updatedAt: set.updatedAt,
      includeInRandom: set.includeInRandom !== false,
      completeCount: validation.completeCount,
      incompleteCount: validation.incompleteCount,
      mainCompleteCount: validation.mainCompleteCount,
      completeVariantsByQuestion: validation.completeVariantsByQuestion,
      reserveCompleteCount: 0,
      reserveCount: 0,
      playable: validation.valid,
      hasImage: set.questions.some((question) => Boolean(question.image)),
      hasAudio: set.questions.some((question) => Boolean(question.audio)),
      hasYoutube: set.questions.some((question) => question.type === "youtube" && Boolean(youtubeVideoId(question.youtubeUrl))),
      issueCount: validation.issues.length,
    };
  }

  function duplicateSet(set) {
    const copy = normaliseSet(set, { regenerateIds: true });
    copy.title = `${String(set.title || "Untitled Set").trim()} – Copy`;
    return copy;
  }

  function duplicateQuestion(question, number) {
    const copy = normaliseQuestion(question, number, true);
    copy.number = number;
    return copy;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("The browser storage request failed."));
    });
  }

  class QuestionSetRepository {
    constructor(indexedDBFactory = globalScope.indexedDB) {
      this.indexedDB = indexedDBFactory;
      this.databasePromise = null;
    }

    async open() {
      if (!this.indexedDB) throw new Error("Browser storage is unavailable.");
      if (this.databasePromise) return this.databasePromise;
      this.databasePromise = new Promise((resolve, reject) => {
        const request = this.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("updatedAt", "updatedAt");
          }
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => database.close();
          resolve(database);
        };
        request.onerror = () => {
          this.databasePromise = null;
          reject(request.error || new Error("Browser storage could not be opened."));
        };
        request.onblocked = () => reject(new Error("Browser storage is blocked by another open page."));
      });
      return this.databasePromise;
    }

    async list() {
      const database = await this.open();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const sets = await requestToPromise(transaction.objectStore(STORE_NAME).getAll());
      return sets.map((set) => normaliseSet(set)).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    }

    async get(id) {
      const database = await this.open();
      const transaction = database.transaction(STORE_NAME, "readonly");
      const value = await requestToPromise(transaction.objectStore(STORE_NAME).get(id));
      return value ? normaliseSet(value) : null;
    }

    async save(set, options = {}) {
      const database = await this.open();
      const value = normaliseSet(set);
      if (options.touch !== false) value.updatedAt = new Date().toISOString();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("The question set could not be saved."));
        transaction.onabort = () => reject(transaction.error || new Error("The question set could not be saved."));
        transaction.objectStore(STORE_NAME).put(value);
      });
      return value;
    }

    async delete(id) {
      const database = await this.open();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error("The question set could not be deleted."));
        transaction.objectStore(STORE_NAME).delete(id);
      });
    }

    async duplicate(id) {
      const source = await this.get(id);
      if (!source) throw new Error("The question set could not be found.");
      return this.save(duplicateSet(source), { touch: false });
    }

    async idExists(id) {
      return Boolean(await this.get(id));
    }
  }

  function safeExtension(name, fallback) {
    const match = String(name || "").toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    return match ? match[1] : fallback;
  }

  function safeFilename(title) {
    const base = String(title || "question-set")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return `${base || "question-set"}.millionaire-set`;
  }

  async function exportSet(set, zipLibrary = globalScope.JSZip, options = {}) {
    if (!zipLibrary) throw new Error("ZIP support is unavailable.");
    const value = normaliseSet(set);
    const zip = new zipLibrary();
    const manifest = {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      id: value.id,
      title: value.title,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      includeInRandom: value.includeInRandom,
      playOnly: options.playOnly === true,
      questions: [],
      variants: [],
      shuffleVariants: value.shuffleVariants,
    };
    async function serialiseQuestion(question, stage, variant) {
      const type = TYPES[question.type] ? question.type : "text";
      const number = `${String(stage + 1).padStart(2, "0")}-v${variant + 1}`;
      const imageRelevant = TYPES[type].image && mediaReadable(question.image, IMAGE_MIME_TYPES);
      const audioRelevant = TYPES[type].audio && mediaReadable(question.audio, AUDIO_MIME_TYPES);
      const imagePath = imageRelevant ? `images/question-${number}.${safeExtension(question.image.name, "bin")}` : null;
      const audioPath = audioRelevant ? `audio/question-${number}.${safeExtension(question.audio.name, "bin")}` : null;
      if (imagePath) zip.file(imagePath, await question.image.blob.arrayBuffer());
      if (audioPath) zip.file(audioPath, await question.audio.blob.arrayBuffer());
      return {
        id: question.id,
        number: stage + 1,
        type,
        prompt: question.prompt,
        answers: [...question.answers],
        correctAnswerIndex: question.correctAnswerIndex,
        hint: question.hint,
        imageAlt: question.imageAlt,
        image: imagePath ? { path: imagePath, name: question.image.name, type: question.image.type, size: question.image.size } : null,
        audio: audioPath ? { path: audioPath, name: question.audio.name, type: question.audio.type, size: question.audio.size, duration: question.audio.duration } : null,
        youtubeUrl: type === "youtube" ? question.youtubeUrl : "",
      };
    }
    for (let stage = 0; stage < QUESTION_COUNT; stage += 1) {
      manifest.questions.push(await serialiseQuestion(value.questions[stage], stage, 0));
      manifest.variants.push(await Promise.all((value.variants[stage] || []).map((question, variant) => serialiseQuestion(question, stage, variant + 1))));
    }
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    if (blob.size > LIMITS.packageBytes) throw new Error(`The exported package is larger than ${Math.round(LIMITS.packageBytes / 1024 / 1024)} MB.`);
    const filename = safeFilename(value.title);
    return { blob, filename: options.playOnly ? filename.replace(/\.millionaire-set$/, "-play-only.millionaire-set") : filename };
  }

  function safeZipPath(path) {
    return typeof path === "string"
      && path.length > 0
      && !path.startsWith("/")
      && !path.startsWith("\\")
      && !path.includes("\\")
      && path.split("/").every((part) => part && part !== "." && part !== "..");
  }

  function assertManifestShape(manifest) {
    if (!manifest || typeof manifest !== "object") throw new Error("manifest.json is not valid.");
    if (manifest.format !== FORMAT) throw new Error("This is not a Millionaire question-set file.");
    if (manifest.formatVersion !== FORMAT_VERSION) throw new Error(`Question-set format version ${manifest.formatVersion} is not supported.`);
    if (!Array.isArray(manifest.questions) || manifest.questions.length < QUESTION_COUNT) {
      throw new Error(`The imported set must contain at least ${QUESTION_COUNT} main questions.`);
    }
    if (typeof manifest.title !== "string" || !manifest.title.trim()) throw new Error("The imported set has no name.");
  }

  async function importPackage(file, zipLibrary = globalScope.JSZip) {
    if (!zipLibrary) throw new Error("ZIP support is unavailable.");
    if (!(file instanceof Blob)) throw new Error("Choose a .millionaire-set file to import.");
    if (file.size > LIMITS.packageBytes) throw new Error(`The selected file is larger than ${Math.round(LIMITS.packageBytes / 1024 / 1024)} MB.`);
    let zip;
    try {
      zip = await zipLibrary.loadAsync(await file.arrayBuffer(), { createFolders: false });
    } catch (error) {
      console.error("Millionaire set ZIP could not be read.", error);
      throw new Error("The selected file is corrupt or is not a valid .millionaire-set package.");
    }
    const entries = Object.values(zip.files);
    if (entries.some((entry) => !safeZipPath(entry.dir && entry.name.endsWith("/") ? entry.name.slice(0, -1) : entry.name))) {
      throw new Error("The package contains an unsafe file path.");
    }
    const estimatedSize = entries.reduce((total, entry) => total + (entry?._data?.uncompressedSize || 0), 0);
    if (estimatedSize > LIMITS.decompressedBytes) throw new Error(`The unpacked package is larger than ${Math.round(LIMITS.decompressedBytes / 1024 / 1024)} MB.`);
    const manifestEntry = zip.file("manifest.json");
    if (!manifestEntry) throw new Error("The package does not contain manifest.json.");
    let manifest;
    try {
      manifest = JSON.parse(await manifestEntry.async("string"));
    } catch {
      throw new Error("manifest.json is not valid JSON.");
    }
    assertManifestShape(manifest);
    let totalUnpacked = 0;
    let imageCount = 0;
    let audioCount = 0;
    let youtubeCount = 0;
    const questions = [];
    const variants = [];
    const sourcesByStage = Array.from({ length: QUESTION_COUNT }, (_, index) => [
      manifest.questions[index],
      ...(Array.isArray(manifest.variants?.[index]) ? manifest.variants[index] : []),
    ]);
    for (let index = 0; index < sourcesByStage.length; index += 1) {
      const stageQuestions = [];
      for (let variant = 0; variant < sourcesByStage[index].length; variant += 1) {
        const source = sourcesByStage[index][variant];
      if (!source || typeof source !== "object") throw new Error(`Question ${index + 1} is malformed.`);
      if (!Array.isArray(source.answers) || source.answers.length !== 4 || source.answers.some((answer) => typeof answer !== "string")) {
        throw new Error(`Question ${index + 1} must contain four text answers.`);
      }
      if (!TYPES[source.type]) throw new Error(`Question ${index + 1} has an unsupported type.`);
      const question = normaliseQuestion(source, index + 1);
      if (source.type === "youtube" && youtubeVideoId(source.youtubeUrl)) youtubeCount += 1;
      for (const mediaKind of ["image", "audio"]) {
        if (!TYPES[source.type][mediaKind]) continue;
        const reference = source[mediaKind];
        if (!reference) continue;
        if (!safeZipPath(reference.path) || !reference.path.startsWith(`${mediaKind === "image" ? "images" : "audio"}/`)) {
          throw new Error(`Question ${index + 1} contains an unsafe ${mediaKind} path.`);
        }
        const entry = zip.file(reference.path);
        if (!entry) throw new Error(`Question ${index + 1} refers to missing ${mediaKind}.`);
        const mediaBuffer = await entry.async("arraybuffer");
        const blob = new Blob([mediaBuffer], { type: typeof reference.type === "string" ? reference.type : "" });
        totalUnpacked += blob.size;
        if (totalUnpacked > LIMITS.decompressedBytes) throw new Error("The unpacked package is too large.");
        const allowedTypes = mediaKind === "image" ? IMAGE_MIME_TYPES : AUDIO_MIME_TYPES;
        const declaredType = typeof reference.type === "string" ? reference.type : "";
        if (!allowedTypes.includes(declaredType)) throw new Error(`Question ${index + 1} has an unsupported ${mediaKind} type.`);
        const limit = mediaKind === "image" ? LIMITS.imageBytes : LIMITS.audioBytes;
        if (!blob.size || blob.size > limit) throw new Error(`Question ${index + 1} ${mediaKind} is empty or too large.`);
        question[mediaKind] = {
          id: uniqueId("media"),
          name: String(reference.name || `${mediaKind}-${index + 1}`).replace(/[\\/]/g, "_").slice(0, 160),
          type: declaredType,
          size: blob.size,
          duration: mediaKind === "audio" && Number.isFinite(reference.duration) ? reference.duration : null,
          blob: blob.slice(0, blob.size, declaredType),
        };
        if (mediaKind === "image") imageCount += 1;
        else audioCount += 1;
      }
        stageQuestions.push(question);
      }
      questions.push(stageQuestions[0]);
      variants.push(stageQuestions.slice(1));
    }
    const set = normaliseSet({ ...manifest, questions, variants });
    const validation = validateSet(set);
    return {
      set,
      summary: {
        title: set.title,
        questionCount: set.questions.length,
        imageCount,
        audioCount,
        youtubeCount,
        playable: validation.valid,
        completeCount: validation.completeCount,
        incompleteCount: validation.incompleteCount,
        mainCompleteCount: validation.mainCompleteCount,
        reserveCompleteCount: validation.reserveCompleteCount,
        reserveCount: validation.reserveCount,
        warnings: validation.issues.map((issue) => issue.message),
      },
    };
  }

  function runtimeSet(set) {
    const validation = validateSet(set);
    if (!validation.valid) {
      const error = new Error("This question set is incomplete and cannot be played.");
      error.validation = validation;
      throw error;
    }
    const objectUrls = [];
    const letters = ["A", "B", "C", "D"];
    const toRuntimeQuestion = (question, stage, variantIndex) => {
      const imageUrl = TYPES[question.type].image ? globalScope.URL.createObjectURL(question.image.blob) : "";
      const audioUrl = TYPES[question.type].audio ? globalScope.URL.createObjectURL(question.audio.blob) : "";
      const youtubeUrl = TYPES[question.type].youtube ? youtubeEmbedUrl(question.youtubeUrl) : "";
      if (imageUrl) objectUrls.push(imageUrl);
      if (audioUrl) objectUrls.push(audioUrl);
      return {
        id: `custom-${set.id}-${question.id}`,
        level: "N3",
        category: "literacy",
        difficulty: stage < 5 ? "easy" : stage < 10 ? "medium" : "hard",
        difficultyMin: stage < 5 ? 1 : stage < 10 ? 6 : 11,
        difficultyMax: stage < 5 ? 5 : stage < 10 ? 10 : 15,
        fixedStage: stage + 1,
        concept: "custom-question",
        question: question.prompt,
        prompt: question.prompt,
        answers: question.answers.map((text, answerIndex) => ({
          id: `answer-${answerIndex}`,
          originalId: `answer-${answerIndex}`,
          letter: letters[answerIndex],
          text,
        })),
        correctAnswer: `answer-${question.correctAnswerIndex}`,
        correctLetter: letters[question.correctAnswerIndex],
        explanation: `The correct answer is ${question.answers[question.correctAnswerIndex]}.`,
        tip: question.hint || "Consider each answer carefully.",
        type: imageUrl ? "image" : audioUrl ? "audio" : youtubeUrl ? "youtube" : "text",
        image: imageUrl ? { src: imageUrl, alt: question.imageAlt || "Question image" } : null,
        audioSrc: audioUrl,
        audio: null,
        youtube: youtubeUrl ? { src: youtubeUrl, title: `Video for Question ${stage + 1}` } : null,
        notationData: null,
        customSetId: set.id,
        customStage: stage,
        customVariant: variantIndex,
      };
    };
    const variants = Array.from({ length: QUESTION_COUNT }, (_, stage) => [
      set.questions[stage],
      ...(set.variants?.[stage] || []),
    ].filter((question) => validateQuestion(question).length === 0)
      .map((question, variantIndex) => toRuntimeQuestion(question, stage, variantIndex)));
    const questions = variants.map((stageVariants, stage) => {
      const selectedIndex = set.shuffleVariants?.[stage]
        ? Math.floor(Math.random() * stageVariants.length)
        : 0;
      return stageVariants[selectedIndex];
    });
    return {
      questions,
      variants,
      revoke() {
        objectUrls.splice(0).forEach((url) => globalScope.URL.revokeObjectURL(url));
      },
    };
  }

  const api = {
    FORMAT,
    FORMAT_VERSION,
    QUESTION_COUNT,
    MAX_VARIANTS,
    MIN_COMPLETE_VARIANTS,
    TYPES,
    LIMITS,
    IMAGE_MIME_TYPES,
    AUDIO_MIME_TYPES,
    S1_ORCHESTRA_STARTER_ID,
    ORCHESTRA_STARTER_PACKAGE_URL,
    uniqueId,
    emptyQuestion,
    createSet,
    createS1OrchestraStarterSet,
    loadOrchestraStarterSet,
    migrateS1OrchestraStarterSet,
    refreshOrchestraStarterSet,
    moveOrchestraReedQuestions,
    shuffleOrchestraStarterAnswers,
    renameOrchestraStarterSet,
    normaliseSet,
    normaliseQuestion,
    hasQuestionContent,
    validateQuestion,
    validateSet,
    youtubeVideoId,
    youtubeEmbedUrl,
    setSummary,
    duplicateSet,
    duplicateQuestion,
    safeFilename,
    safeZipPath,
    exportSet,
    importPackage,
    runtimeSet,
    QuestionSetRepository,
  };

  globalScope.MILLIONAIRE_CUSTOM_SETS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
