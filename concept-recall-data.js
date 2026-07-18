(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  if (root) root.CONCEPT_RECALL_DATA = data;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const QUESTIONS = [
    { id: "ornaments-trill", hint: "Rapid alternation between two adjacent notes.", answer: "Trill", aliases: [], category: "Ornaments", introducedAt: "N5" },
    { id: "ornaments-grace-note", hint: "A small decorative note played quickly before the main note.", answer: "Grace notes", aliases: ["grace note"], category: "Ornaments", introducedAt: "N5", levels: ["N5"] },
    { id: "ornaments-acciaccatura", hint: "A quick, crushed note.", answer: "Acciaccatura", aliases: ["acciacatura", "acciaccattura"], category: "Ornaments", introducedAt: "H" },
    { id: "ornaments-mordent", hint: "Rapid alternation between the main note and the note directly above or below.", answer: "Mordent", aliases: [], category: "Ornaments", introducedAt: "H" },
    { id: "ornaments-appoggiatura", hint: "A non-chord note which leans on the main note.", answer: "Appoggiatura", aliases: [], category: "Ornaments", introducedAt: "AH" },
    { id: "ornaments-turn", hint: "Note above, main note, note below, then main note again.", answer: "Turn", aliases: [], category: "Ornaments", introducedAt: "AH" },

    { id: "cadences-perfect", hint: "V–I, ending on the tonic.", answer: "Perfect cadence", aliases: ["perfect"], category: "Cadences", introducedAt: "N5" },
    { id: "cadences-imperfect", hint: "Ends on chord V.", answer: "Imperfect cadence", aliases: ["imperfect"], category: "Cadences", introducedAt: "N5" },
    { id: "cadences-interrupted", hint: "V–VI instead of V–I.", answer: "Interrupted cadence", aliases: ["interrupted"], category: "Cadences", introducedAt: "H" },
    { id: "cadences-plagal", hint: "IV–I, often called the Amen cadence.", answer: "Plagal cadence", aliases: ["plagal"], category: "Cadences", introducedAt: "H" },

    { id: "chords-added-sixth", hint: "A major triad with an added sixth.", answer: "Added 6th", aliases: ["added sixth", "added6th", "added 6", "add 6", "add6", "add 6th"], category: "Chords", introducedAt: "H" },
    { id: "chords-diminished-seventh", hint: "A four-note chord built entirely from minor thirds.", answer: "Diminished 7th", aliases: ["diminished seventh", "diminished7th", "dim 7", "dim7", "dim 7th"], category: "Chords", introducedAt: "H" },
    { id: "chords-dominant-seventh", hint: "Chord V with an added minor seventh.", answer: "Dominant 7th", aliases: ["dominant seventh", "dominant7th", "dom 7", "dom7", "dom 7th"], category: "Chords", introducedAt: "H" },
    { id: "chords-augmented-triad", hint: "A major triad with a raised fifth.", answer: "Augmented triad", aliases: ["augmented", "augmentedtriad", "aug", "aug triad"], category: "Chords", introducedAt: "AH" },

    { id: "dynamics-pianissimo", hint: "Very quiet.", answer: "Pianissimo", aliases: [], category: "Dynamics", introducedAt: "N5", levels: ["N5"] },
    { id: "dynamics-piano", hint: "Quiet.", answer: "Piano", aliases: [], category: "Dynamics", introducedAt: "N3", levels: ["N5"] },
    { id: "dynamics-mezzo-piano", hint: "Moderately quiet.", answer: "Mezzo piano", aliases: ["mezzo-piano", "mezzopiano"], category: "Dynamics", introducedAt: "N4", levels: ["N5"] },
    { id: "dynamics-mezzo-forte", hint: "Moderately loud.", answer: "Mezzo forte", aliases: ["mezzo-forte", "mezzoforte"], category: "Dynamics", introducedAt: "N4", levels: ["N5"] },
    { id: "dynamics-forte", hint: "Loud.", answer: "Forte", aliases: [], category: "Dynamics", introducedAt: "N3", levels: ["N5"] },
    { id: "dynamics-fortissimo", hint: "Very loud.", answer: "Fortissimo", aliases: [], category: "Dynamics", introducedAt: "N5", levels: ["N5"] },
    { id: "dynamics-sforzando", hint: "A sudden strong accent.", answer: "Sforzando", aliases: ["sfz"], category: "Dynamics", introducedAt: "N5", levels: ["N5"] },
    { id: "dynamics-crescendo", hint: "Gradually getting louder.", answer: "Crescendo", aliases: ["cres", "cresc"], category: "Dynamics", introducedAt: "N3", levels: ["N5"] },
    { id: "dynamics-diminuendo", hint: "Gradually getting quieter.", answer: "Diminuendo", aliases: ["dim"], category: "Dynamics", introducedAt: "N3", levels: ["N5"] },

    { id: "tonality-major", hint: "Often sounds bright, happy or uplifting.", answer: "Major", aliases: ["major tonality"], multiAnswerAliases: ["major"], category: "Tonalities", introducedAt: "N4" },
    { id: "tonality-minor", hint: "Often sounds dark, sad or serious.", answer: "Minor", aliases: ["minor tonality"], category: "Tonalities", introducedAt: "N4" },
    { id: "tonality-atonal", hint: "Music without a tonal centre or home key.", answer: "Atonal", aliases: ["atonality"], category: "Tonalities", introducedAt: "N5" },
    { id: "tonality-modal", hint: "Music based on a mode rather than a major or minor key.", answer: "Modal", aliases: ["mode"], category: "Tonalities", introducedAt: "H" },
    { id: "tonality-polytonality-bitonality", hint: "Two or more keys used at the same time.", answer: "Polytonality or bitonality", aliases: ["polytonality", "bitonality"], category: "Tonalities", introducedAt: "AH" },

    { id: "family-strings", hint: "Violin", answer: "Strings", aliases: ["string", "string family"], category: "Orchestral families", introducedAt: "N3" },
    { id: "family-brass", hint: "Trumpet", answer: "Brass", aliases: ["brass family"], category: "Orchestral families", introducedAt: "N3" },
    { id: "family-woodwind", hint: "Flute", answer: "Woodwind", aliases: ["woodwinds", "woodwind family"], category: "Orchestral families", introducedAt: "N3" },
    { id: "family-percussion", hint: "Glockenspiel", answer: "Percussion", aliases: ["percussion family"], category: "Orchestral families", introducedAt: "N3" },

    { id: "texture-polyphonic", hint: "Two or more independent melody lines playing at the same time.", answer: "Polyphonic or contrapuntal", aliases: ["polyphonic", "polyphony", "contrapuntal"], category: "Textures", introducedAt: "N5" },
    { id: "texture-homophonic", hint: "One main melody with chordal accompaniment, or parts moving together rhythmically.", answer: "Homophonic", aliases: ["homophony"], category: "Textures", introducedAt: "N5" },
    { id: "texture-antiphonal", hint: "Two groups or performers alternate.", answer: "Antiphonal", aliases: [], category: "Textures", introducedAt: "AH" },

    { id: "fugue-subject", hint: "The main theme of a fugue.", answer: "Subject", aliases: [], category: "Fugue", introducedAt: "AH" },
    { id: "fugue-countersubject", hint: "A contrasting melody heard against the subject or answer.", answer: "Countersubject", aliases: ["counter subject"], category: "Fugue", introducedAt: "AH" },
    { id: "fugue-answer", hint: "An imitation of the subject, usually beginning in the dominant key.", answer: "Answer", aliases: [], category: "Fugue", introducedAt: "AH" },
    { id: "fugue-stretto", hint: "Entries of the subject overlap closely.", answer: "Stretto", aliases: [], category: "Fugue", introducedAt: "AH" },

    { id: "serial-tone-row", hint: "An ordered series of pitches forming the basis of a serial composition.", answer: "Tone row or note row", aliases: ["tone row", "note row"], category: "Serial music", introducedAt: "AH" },
    { id: "serial-inversion", hint: "The intervals of the tone row are turned upside down.", answer: "Inversion", aliases: [], category: "Serial music", introducedAt: "AH" },
    { id: "serial-retrograde", hint: "The tone row is played backwards.", answer: "Retrograde", aliases: [], category: "Serial music", introducedAt: "AH" },

    { id: "key-c-major", hint: "No sharps or flats.", answer: "C major", aliases: ["cmajor"], category: "Key signatures", introducedAt: "N5" },
    { id: "key-a-minor", hint: "Minor key – no sharps or flats; G♯ may appear as an accidental.", answer: "A minor", aliases: ["aminor", "am"], category: "Key signatures", introducedAt: "N5" },
    { id: "key-g-major", hint: "One sharp.", answer: "G major", aliases: ["gmajor"], category: "Key signatures", introducedAt: "N5" },
    { id: "key-f-major", hint: "One flat.", answer: "F major", aliases: ["fmajor"], category: "Key signatures", introducedAt: "N5" },
    { id: "key-d-major", hint: "Two sharps.", answer: "D major", aliases: ["dmajor"], category: "Key signatures", introducedAt: "AH" },
    { id: "key-b-flat-major", hint: "Two flats.", answer: "B flat major", aliases: ["b-flat major", "b♭ major", "bb major"], category: "Key signatures", introducedAt: "AH" },
    { id: "key-e-minor", hint: "Minor key - one sharp.", answer: "E minor", aliases: ["eminor", "em"], category: "Key signatures", introducedAt: "AH" },
    { id: "key-d-minor", hint: "Minor key - one flat.", answer: "D minor", aliases: ["dminor", "dm"], category: "Key signatures", introducedAt: "AH" },

    { id: "technique-roll", hint: "Rapid repeated notes on a percussion instrument, creating a sustained sound.", answer: "Rolls", aliases: ["roll", "drum roll", "percussion roll"], category: "Playing techniques", introducedAt: "N5" },
    { id: "technique-con-sordino", hint: "Performed using a mute.", answer: "Con sordino", aliases: [], category: "Playing techniques", introducedAt: "N5" },
    { id: "technique-arco", hint: "Using a bow.", answer: "Arco", aliases: ["bowed", "bowing"], category: "Playing techniques", introducedAt: "N5" },
    { id: "technique-pizzicato", hint: "Plucking the strings.", answer: "Pizzicato", aliases: [], category: "Playing techniques", introducedAt: "N5" },
    { id: "technique-flutter-tonguing", hint: "Rolling r’s into a wind instrument.", answer: "Flutter tonguing", aliases: ["flutter-tonguing", "fluttertonguing", "flutter tongue", "flutter-tongue", "flutter tunging", "flutter tonging", "flutter tounging", "flutter tongeing"], category: "Playing techniques", introducedAt: "N5" },
    { id: "technique-tremolando", hint: "Rapid repetition of the same note.", answer: "Tremolando", aliases: ["tremolo"], category: "Playing techniques", introducedAt: "H" },
    { id: "technique-harmonics", hint: "High, flute-like sounds made by lightly touching a string.", answer: "Harmonics", aliases: ["harmonic"], category: "Playing techniques", introducedAt: "H" },

    { id: "word-setting-syllabic", hint: "One note per syllable.", answer: "Syllabic", aliases: ["syllabic word setting"], category: "Word setting", introducedAt: "N5" },
    { id: "word-setting-melismatic", hint: "Multiple notes per syllable.", answer: "Melismatic", aliases: ["melismatic word setting"], category: "Word setting", introducedAt: "N5" },

    { id: "scale-melodic-minor", hint: "Minor scale with raised sixth and seventh notes ascending, restored descending.", answer: "Melodic minor", aliases: ["melodic minor scale"], category: "Scales", introducedAt: "H" },
    { id: "scale-harmonic-minor", hint: "Minor scale with a raised seventh note.", answer: "Harmonic minor", aliases: ["harmonic minor scale"], category: "Scales", introducedAt: "H" },
    { id: "scale-major", hint: "A seven-note scale with semitones between the third and fourth, and seventh and eighth notes.", answer: "Major scale", aliases: ["major"], multiAnswerAliases: ["major"], category: "Scales", introducedAt: "N5" },
    { id: "scale-whole-tone", hint: "Scale made entirely of whole tones.", answer: "Whole-tone scale", aliases: ["whole tone scale", "wholetone scale", "whole tone", "wholetone"], category: "Scales", introducedAt: "N5" },
    { id: "scale-chromatic", hint: "Scale made entirely of semitones.", answer: "Chromatic scale", aliases: ["chromatic"], category: "Scales", introducedAt: "N5" },
    { id: "scale-pentatonic", hint: "A five-note scale.", answer: "Pentatonic scale", aliases: ["pentatonic", "penta-tonic", "penta tonic"], category: "Scales", introducedAt: "N4" },

    { id: "tempo-allegro", hint: "Fast.", answer: "Allegro", aliases: [], category: "Tempo", introducedAt: "N3" },
    { id: "tempo-andante", hint: "Walking pace or moderate speed.", answer: "Andante or moderato", aliases: ["andante", "moderato"], category: "Tempo", introducedAt: "N3" },
    { id: "tempo-adagio", hint: "Slow.", answer: "Adagio", aliases: [], category: "Tempo", introducedAt: "N3" },

    { id: "tempo-change-accelerando", hint: "Gets faster gradually.", answer: "Accelerando", aliases: ["accelerando gradually", "accel"], category: "Tempo changes", introducedAt: "N4" },
    { id: "tempo-change-rallentando", hint: "Gets slower gradually.", answer: "Rallentando or ritardando", aliases: ["rallentando", "ritardando", "rall"], category: "Tempo changes", introducedAt: "N4" },
    { id: "tempo-change-rubato", hint: "Flexible tempo, with the performer subtly speeding up and slowing down for expression.", answer: "Rubato", aliases: ["tempo rubato"], category: "Tempo changes", introducedAt: "N5" },

    { id: "concerto-grosso-ripieno", hint: "The larger or full orchestral group in a concerto grosso.", answer: "Ripieno", aliases: [], category: "Concerto grosso", introducedAt: "H" },
    { id: "concerto-grosso-concertino", hint: "Small solo group.", answer: "Concertino", aliases: [], category: "Concerto grosso", introducedAt: "H" },
    { id: "concerto-grosso-basso-continuo", hint: "Continuous bass and chordal accompaniment, often played by harpsichord and cello.", answer: "Basso continuo", aliases: [], category: "Concerto grosso", introducedAt: "H" },
    { id: "concerto-grosso-ritornello", hint: "The main theme which returns between solo sections.", answer: "Ritornello", aliases: [], category: "Concerto grosso", introducedAt: "H" },

    { id: "bass-line-alberti", hint: "Low–high–middle–high.", answer: "Alberti bass", aliases: ["alberti"], category: "Bass lines", introducedAt: "N5" },
    { id: "bass-line-walking", hint: "A bass line that moves steadily, often one note per beat, commonly used in jazz.", answer: "Walking bass", aliases: ["walking"], category: "Bass lines", introducedAt: "N5" },
    { id: "bass-line-ground", hint: "Repeated bass line.", answer: "Ground bass", aliases: ["ground"], category: "Bass lines", introducedAt: "N5" },

    { id: "voice-soprano", hint: "High female.", answer: "Soprano", aliases: [], category: "Voice types", introducedAt: "N4" },
    { id: "voice-mezzo-soprano", hint: "Mid female.", answer: "Mezzo-soprano", aliases: ["mezzo soprano", "mezzosoprano"], category: "Voice types", introducedAt: "N5" },
    { id: "voice-alto", hint: "Low female.", answer: "Alto", aliases: [], category: "Voice types", introducedAt: "N4" },
    { id: "voice-tenor", hint: "High male.", answer: "Tenor", aliases: [], category: "Voice types", introducedAt: "N4" },
    { id: "voice-baritone", hint: "Mid male.", answer: "Baritone", aliases: [], category: "Voice types", introducedAt: "N5" },
    { id: "voice-bass", hint: "Low male.", answer: "Bass", aliases: ["bass voice"], category: "Voice types", introducedAt: "N4" },
    { id: "voice-countertenor", hint: "Very high male voice.", answer: "Countertenor", aliases: ["counter tenor"], category: "Voice types", introducedAt: "AH" },

    { id: "n5-style-symphony", hint: "A large orchestral work, usually in several movements.", answer: "Symphony", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-gospel", hint: "Christian vocal music with expressive singing, strong rhythms and call and response.", answer: "Gospel", aliases: ["gospel music"], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-classical", hint: "Balanced phrases, clear structures and mainly homophonic texture.", answer: "Classical", aliases: ["classical music"], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-pibroch", hint: "An extended variation form traditionally played on solo Highland bagpipes.", answer: "Pibroch", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-celtic-rock", hint: "Rock music combined with Celtic instruments, melodies or rhythms.", answer: "Celtic rock", aliases: ["celtic-rock"], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-bothy-ballad", hint: "A Scottish folk song about rural working life.", answer: "Bothy ballad", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-waulking-song", hint: "A Gaelic work song used while fulling cloth, often using call and response.", answer: "Waulking song", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-gaelic-psalm", hint: "Unaccompanied Gaelic psalm singing with free, overlapping vocal lines.", answer: "Gaelic psalm", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-aria", hint: "A solo song in an opera or oratorio, performed with accompaniment.", answer: "Aria", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-chorus", hint: "A section of a work sung by a group of voices.", answer: "Chorus", aliases: [], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-minimalist", hint: "Short musical patterns are repeated and changed gradually.", answer: "Minimalist", aliases: ["minimalism"], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },
    { id: "n5-style-indian", hint: "Music often featuring raga, drone, tabla and improvisation.", answer: "Indian", aliases: ["indian music"], category: "National 5 Styles", introducedAt: "N5", levels: ["N5"] },

    { id: "h-style-plainchant", hint: "Unaccompanied sacred singing in unison, using free rhythm and modes.", answer: "Plainchant", aliases: ["plain chant"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-oratorio", hint: "A large sacred work for soloists, chorus and orchestra, performed without staging.", answer: "Oratorio", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-mass", hint: "A sacred choral setting of the fixed texts of the Mass.", answer: "Mass", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-recitative", hint: "Speech-like solo singing used to move a story forward.", answer: "Recitative", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-sonata", hint: "A multi-movement work for a solo instrument or a small instrumental group.", answer: "Sonata", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-chamber-music", hint: "Music for a small instrumental group, usually with one player per part.", answer: "Chamber music", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-string-quartet", hint: "Music for two violins, viola and cello.", answer: "String quartet", aliases: [], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-lied", hint: "A German art song for solo voice and piano.", answer: "Lied", aliases: ["lieder"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-impressionist", hint: "Music using colour, atmosphere, fluid rhythm and often whole-tone or modal harmony.", answer: "Impressionist", aliases: ["impressionism"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-musique-concrete", hint: "Recorded everyday or natural sounds are edited and combined electronically.", answer: "Musique concrète", aliases: ["musique concrete"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-jazz-funk", hint: "Jazz harmony and improvisation combined with a strong funk groove and electric instruments.", answer: "Jazz funk", aliases: ["jazz-funk"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },
    { id: "h-style-soul-music", hint: "Expressive popular music influenced by gospel and rhythm and blues.", answer: "Soul music", aliases: ["soul"], category: "Higher Styles", introducedAt: "H", levels: ["H"] },

    { id: "ah-style-renaissance", hint: "Modal music, often vocal and polyphonic, with imitation between parts.", answer: "Renaissance", aliases: ["renaissance music"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-pavan", hint: "A slow, stately Renaissance dance in duple time.", answer: "Pavan", aliases: ["pavane"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-galliard", hint: "A lively Renaissance dance in triple time.", answer: "Galliard", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-motet", hint: "A sacred polyphonic choral work, often sung in Latin without accompaniment.", answer: "Motet", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-ayre-air", hint: "An English secular solo song, often accompanied by lute.", answer: "Ayre or air", aliases: ["ayre", "air"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-ballett", hint: "A light, strophic Renaissance part-song, often including fa-la-la refrains.", answer: "Ballett", aliases: ["ballet"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-madrigal", hint: "A secular polyphonic vocal work which often uses word painting.", answer: "Madrigal", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-anthem", hint: "An English sacred choral work.", answer: "Anthem", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-chorale", hint: "A German Protestant hymn tune, often set homophonically in four parts.", answer: "Chorale", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-nationalist", hint: "Music using folk traditions to express the identity of a nation.", answer: "Nationalist", aliases: ["nationalism"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-neoclassical", hint: "Twentieth-century music reviving Classical or Baroque forms with modern harmony.", answer: "Neoclassical", aliases: ["neo-classical", "neo classical", "neoclassicism"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-serial", hint: "Music organised using an ordered tone row or note row.", answer: "Serial", aliases: ["serial music", "serialism"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-contemporary-jazz", hint: "Modern jazz using improvisation, extended harmony and influences from other styles.", answer: "Contemporary jazz", aliases: [], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
    { id: "ah-style-edm", hint: "Dance music made electronically using a repeated beat, synthesisers and loops.", answer: "Electronic dance music (EDM)", aliases: ["electronic dance music", "edm"], category: "Advanced Higher Styles", introducedAt: "AH", levels: ["AH"] },
  ];

  // Incomplete content is kept here for easy teacher editing. These entries are
  // deliberately separate from QUESTIONS, so they can never appear to pupils.
  const INCOMPLETE_QUESTIONS = [
    { id: "vocal-style-1", placeholder: "Vocal style concept 1", hint: "", answer: "", aliases: [], category: "Vocal style", introducedAt: "" },
    { id: "vocal-style-2", placeholder: "Vocal style concept 2", hint: "", answer: "", aliases: [], category: "Vocal style", introducedAt: "" },
    { id: "vocal-style-3", placeholder: "Vocal style concept 3", hint: "", answer: "", aliases: [], category: "Vocal style", introducedAt: "" },
    { id: "vocal-style-4", placeholder: "Vocal style concept 4", hint: "", answer: "", aliases: [], category: "Vocal style", introducedAt: "" },
    { id: "vocal-style-5", placeholder: "Vocal style concept 5", hint: "", answer: "", aliases: [], category: "Vocal style", introducedAt: "" },
    { id: "instrumental-style-1", placeholder: "Instrumental style concept 1", hint: "", answer: "", aliases: [], category: "Instrumental style", introducedAt: "" },
    { id: "instrumental-style-2", placeholder: "Instrumental style concept 2", hint: "", answer: "", aliases: [], category: "Instrumental style", introducedAt: "" },
  ];

  return { QUESTIONS, INCOMPLETE_QUESTIONS };
});
