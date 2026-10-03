// Keep the default rounds and accepted spellings in sync with Concept Recall.
(function () {
  const data = window.CONCEPT_RECALL_DATA;
  const core = window.CONCEPT_RECALL_CORE;
  const higherQuestions = core.questionsForLevel(data.QUESTIONS, "H");
  const higherCategories = new Set(higherQuestions.map((question) => question.category));
  const questions = [
    ...higherQuestions,
    ...core.questionsForLevel(data.QUESTIONS, "N5").filter((question) =>
      !higherCategories.has(question.category) && !question.category.toLowerCase().includes("styles")),
  ];
  const categories = [
    ["Ornaments", "Ornaments", "Name types of ornament"],
    ["Cadences", "Cadences", "Name types of cadence"],
    ["Chords", "Chords", "Name types of chord"],
    ["Tonalities", "Tonalities", "Name types of tonality"],
    ["Orchestral families", "Orchestral Families", "Name orchestral instrument families"],
    ["Textures", "Textures", "Name types of texture"],
    ["Key signatures", "Key Signatures", "Name keys with no sharps or flats, one sharp, or one flat"],
    ["Playing techniques", "Playing Techniques", "Name playing techniques"],
    ["Word setting", "Word Setting", "Name types of word setting"],
    ["Scales", "Scales", "Name types of scale"],
    ["Tempo", "Tempo", "Name tempo markings"],
    ["Tempo changes", "Tempo Changes", "Name tempo changes"],
    ["Concerto grosso", "Concerto Grosso", "Name five things you might find in a concerto grosso"],
    ["Bass lines", "Bass Lines", "Name types of bass line"],
    ["Voice types", "Voice Types", "Name voice types"],
    ["Dynamics", "Dynamics", "Name dynamic markings"],
  ];
  window.FAMILY_FORTUNES_ROUNDS = categories.map(([category, label, prompt]) => {
    const entries = questions.filter((question) => question.category === category);
    if (category === "Cadences") {
      const order = ["Perfect cadence", "Imperfect cadence", "Plagal cadence", "Interrupted cadence"];
      entries.sort((first, second) => order.indexOf(first.answer) - order.indexOf(second.answer));
    }
    if (category === "Concerto grosso") {
      return {
        id: "builtin-concept-recall-concerto-grosso",
        label,
        prompt,
        answers: ["Ripieno", "Ritornello", "Concertino", "Basso continuo", "Harpsichord"],
        answerAliases: Object.fromEntries(entries.map((question) => [question.answer, question.aliases || []])),
      };
    }
    return {
      id: `builtin-concept-recall-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label,
      prompt,
      answers: entries.map((question) => question.answer),
      answerAliases: Object.fromEntries(entries.map((question) => [question.answer, question.aliases || []])),
    };
  });
  // Higher Styles list: conceptlist.pdf, page 2 (Higher Styles column).
  // Facts: matching Higher definitions in the project knowledge bank.
  // Features describe common characteristics; they need not occur in every work.
  const higherStyleRounds = [
  {
    "id": "builtin-higher-style-plainchant",
    "label": "Plainchant",
    "prompt": "Name features of plainchant",
    "answers": [
      "Latin text",
      "A cappella",
      "Monophonic",
      "Unison",
      "Modal",
      "Free rhythm",
      "Sacred"
    ],
    "answerAliases": {
      "Latin text": [
        "Latin",
        "Sung in Latin"
      ],
      "A cappella": [
        "Unaccompanied",
        "No accompaniment",
        "Without instruments"
      ],
      "Monophonic": [
        "Single melodic line",
        "One melody",
        "Monophonic texture"
      ],
      "Unison": [
        "Sung in unison"
      ],
      "Modal": [
        "Modes",
        "Uses modes"
      ],
      "Free rhythm": [
        "No regular metre",
        "No regular meter",
        "No regular beat",
        "Flexible rhythm"
      ],
      "Sacred": [
        "Religious",
        "Church music",
        "Worship"
      ]
    }
  },
  {
    "id": "builtin-higher-style-oratorio",
    "label": "Oratorio",
    "prompt": "Name features of an oratorio",
    "answers": [
      "Solo voices",
      "Choir",
      "Orchestra",
      "Sacred or biblical story",
      "Arias",
      "Recitatives",
      "No acting, scenery or costumes",
      "Baroque origins"
    ],
    "answerAliases": {
      "Solo voices": [
        "Soloists",
        "Solo singers"
      ],
      "Choir": [
        "Chorus"
      ],
      "Orchestra": [
        "Orchestral accompaniment"
      ],
      "Sacred or biblical story": [
        "Religious",
        "Bible story",
        "Biblical story",
        "Sacred story",
        "Story from the Bible"
      ],
      "Arias": [
        "Aria"
      ],
      "Recitatives": [
        "Recitative"
      ],
      "No acting, scenery or costumes": [
        "No acting",
        "No costumes",
        "No scenery",
        "Not staged",
        "Concert performance"
      ],
      "Baroque origins": [
        "Baroque",
        "Baroque period"
      ]
    }
  },
  {
    "id": "builtin-higher-style-mass",
    "label": "Mass",
    "prompt": "Name features or sections of a mass",
    "answers": [
      "Latin text",
      "Roman Catholic worship",
      "Choir",
      "Kyrie",
      "Gloria",
      "Credo",
      "Sanctus",
      "Benedictus",
      "Agnus Dei"
    ],
    "answerAliases": {
      "Latin text": [
        "Latin",
        "Sung in Latin"
      ],
      "Roman Catholic worship": [
        "Catholic",
        "Roman Catholic",
        "Religious",
        "Sacred"
      ],
      "Choir": [
        "Chorus",
        "Choral"
      ],
      "Kyrie": [],
      "Gloria": [],
      "Credo": [],
      "Sanctus": [],
      "Benedictus": [],
      "Agnus Dei": []
    }
  },
  {
    "id": "builtin-higher-style-recitative",
    "label": "Recitative",
    "prompt": "Name features of recitative",
    "answers": [
      "Speech-like singing",
      "Solo voice",
      "Rhythm follows the words",
      "Flexible rhythm",
      "Sparse accompaniment",
      "Moves the story forward",
      "Often followed by an aria",
      "Used in opera and oratorio"
    ],
    "answerAliases": {
      "Speech-like singing": [
        "Speech like",
        "Like speech",
        "Spoken style",
        "Sung speech"
      ],
      "Solo voice": [
        "Solo singer",
        "Soloist"
      ],
      "Rhythm follows the words": [
        "Natural rhythm of words",
        "Text rhythm",
        "Word rhythm"
      ],
      "Flexible rhythm": [
        "Free rhythm",
        "Free tempo"
      ],
      "Sparse accompaniment": [
        "Simple accompaniment",
        "Minimal accompaniment",
        "Little accompaniment"
      ],
      "Moves the story forward": [
        "Tells the story",
        "Narrative",
        "Dialogue",
        "Advances the plot"
      ],
      "Often followed by an aria": [
        "Followed by an aria",
        "Aria follows"
      ],
      "Used in opera and oratorio": [
        "Opera",
        "Oratorio"
      ]
    }
  },
  {
    "id": "builtin-higher-style-sonata",
    "label": "Sonata",
    "prompt": "Name features of a sonata",
    "answers": [
      "Solo instrument",
      "May have piano accompaniment",
      "Several movements",
      "Contrasting movements",
      "First movement often in sonata form",
      "Often fast–slow–fast"
    ],
    "answerAliases": {
      "Solo instrument": [
        "Solo instrumental work",
        "One instrument"
      ],
      "May have piano accompaniment": [
        "Piano accompaniment",
        "Instrument and piano",
        "With piano"
      ],
      "Several movements": [
        "Multi movement",
        "Multiple movements",
        "Three or four movements",
        "3 or 4 movements"
      ],
      "Contrasting movements": [
        "Contrasting tempi",
        "Contrasting tempos",
        "Different tempos"
      ],
      "First movement often in sonata form": [
        "Sonata form",
        "First movement sonata form"
      ],
      "Often fast–slow–fast": [
        "Fast slow fast"
      ]
    }
  },
  {
    "id": "builtin-higher-style-chamber-music",
    "label": "Chamber Music",
    "prompt": "Name features or examples of chamber music",
    "answers": [
      "Small ensemble",
      "One player per part",
      "Usually no conductor",
      "Independent interacting parts",
      "String quartet",
      "Piano trio",
      "Instrumental sonata"
    ],
    "answerAliases": {
      "Small ensemble": [
        "Small group",
        "Small instrumental group"
      ],
      "One player per part": [
        "One to a part",
        "One instrument per part"
      ],
      "Usually no conductor": [
        "No conductor"
      ],
      "Independent interacting parts": [
        "Independent parts",
        "Parts interact",
        "Musical dialogue"
      ],
      "String quartet": [
        "Quartet"
      ],
      "Piano trio": [
        "Trio"
      ],
      "Instrumental sonata": [
        "Sonata"
      ]
    }
  },
  {
    "id": "builtin-higher-style-string-quartet",
    "label": "String Quartet",
    "prompt": "Name features of a string quartet",
    "answers": [
      "Two violins",
      "Viola",
      "Cello",
      "Independent interacting parts",
      "Usually four movements"
    ],
    "answerAliases": {
      "Two violins": [
        "2 violins",
        "First and second violin"
      ],
      "Viola": [
        "One viola"
      ],
      "Cello": [
        "One cello",
        "Violoncello"
      ],
      "Independent interacting parts": [
        "Independent parts",
        "Parts interact",
        "One player per part"
      ],
      "Usually four movements": [
        "Four movements",
        "4 movements"
      ]
    }
  },
  {
    "id": "builtin-higher-style-lied",
    "label": "Lied",
    "prompt": "Name features of a lied",
    "answers": [
      "German text",
      "Romantic period",
      "Solo voice",
      "Piano accompaniment",
      "Poetry set to music",
      "Expressive piano word painting",
      "Strophic or through-composed",
      "Voice and piano are equal partners"
    ],
    "answerAliases": {
      "German text": [
        "German",
        "Sung in German"
      ],
      "Romantic period": [
        "Romantic"
      ],
      "Solo voice": [
        "Solo singer",
        "Soloist"
      ],
      "Piano accompaniment": [
        "Piano",
        "Accompanied by piano"
      ],
      "Poetry set to music": [
        "Poem",
        "Poetry",
        "Based on a poem"
      ],
      "Expressive piano word painting": [
        "Word painting",
        "Piano illustrates the words",
        "Expressive accompaniment"
      ],
      "Strophic or through-composed": [
        "Strophic",
        "Through composed"
      ],
      "Voice and piano are equal partners": [
        "Equal partners",
        "Voice and piano equally important"
      ]
    }
  },
  {
    "id": "builtin-higher-style-impressionist",
    "label": "Impressionist",
    "prompt": "Name features of Impressionist music",
    "answers": [
      "Whole-tone scales",
      "Modal scales",
      "Parallel chords",
      "Unresolved or extended harmony",
      "Atmosphere and tone colour",
      "Delicate orchestration",
      "Sustain pedal",
      "Cross-rhythms"
    ],
    "answerAliases": {
      "Whole-tone scales": [
        "Whole tone",
        "Whole tone scale"
      ],
      "Modal scales": [
        "Modal",
        "Modes"
      ],
      "Parallel chords": [
        "Parallel harmony"
      ],
      "Unresolved or extended harmony": [
        "Unresolved chords",
        "Extended chords",
        "Extended harmony",
        "Unresolved harmony"
      ],
      "Atmosphere and tone colour": [
        "Atmosphere",
        "Tone colour",
        "Tone color",
        "Mood"
      ],
      "Delicate orchestration": [
        "Delicate instrumental colours",
        "Subtle orchestration"
      ],
      "Sustain pedal": [
        "Pedal",
        "Piano pedal"
      ],
      "Cross-rhythms": [
        "Cross rhythms",
        "Cross rhythm"
      ]
    }
  },
  {
    "id": "builtin-higher-style-musique-concrete",
    "label": "Musique Concrète",
    "prompt": "Name features of musique concrète",
    "answers": [
      "Recorded real-world sounds",
      "Cutting and splicing",
      "Loops and repetition",
      "Reversed recordings",
      "Layered sounds",
      "Changed playback speed",
      "Electronic filtering and transformation"
    ],
    "answerAliases": {
      "Recorded real-world sounds": [
        "Recorded sounds",
        "Everyday sounds",
        "Natural sounds",
        "Environmental sounds",
        "Real world sounds"
      ],
      "Cutting and splicing": [
        "Cutting",
        "Splicing",
        "Edited recordings",
        "Editing"
      ],
      "Loops and repetition": [
        "Loops",
        "Looping",
        "Repetition",
        "Repeated sounds"
      ],
      "Reversed recordings": [
        "Reversed sounds",
        "Reversing",
        "Played backwards",
        "Backwards"
      ],
      "Layered sounds": [
        "Layering",
        "Overlapping sounds"
      ],
      "Changed playback speed": [
        "Speed changes",
        "Changing speed",
        "Altered speed"
      ],
      "Electronic filtering and transformation": [
        "Filtering",
        "Electronic manipulation",
        "Electronic transformation",
        "Electronically transformed"
      ]
    }
  },
  {
    "id": "builtin-higher-style-jazz-funk",
    "label": "Jazz Funk",
    "prompt": "Name features of jazz funk",
    "answers": [
      "Jazz harmony",
      "Improvisation",
      "Syncopation",
      "Strong funk groove",
      "Drum kit",
      "Electric bass",
      "Amplified or electronic instruments",
      "Riffs"
    ],
    "answerAliases": {
      "Jazz harmony": [
        "Jazz chords"
      ],
      "Improvisation": [
        "Improvised solos",
        "Improvising"
      ],
      "Syncopation": [
        "Syncopated rhythms",
        "Syncopated groove"
      ],
      "Strong funk groove": [
        "Funk rhythm",
        "Strong groove",
        "Driving groove"
      ],
      "Drum kit": [
        "Drums"
      ],
      "Electric bass": [
        "Bass guitar",
        "Electric bass guitar"
      ],
      "Amplified or electronic instruments": [
        "Electric instruments",
        "Amplified instruments",
        "Electronic instruments",
        "Electric piano",
        "Synthesiser",
        "Synthesizer",
        "Electric guitar"
      ],
      "Riffs": [
        "Repeated riffs",
        "Riff"
      ]
    }
  },
  {
    "id": "builtin-higher-style-soul-music",
    "label": "Soul Music",
    "prompt": "Name features of soul music",
    "answers": [
      "Gospel and rhythm-and-blues influences",
      "Expressive vocals",
      "Call and response",
      "Strong groove",
      "Syncopation",
      "Improvised vocal decoration",
      "Horn section"
    ],
    "answerAliases": {
      "Gospel and rhythm-and-blues influences": [
        "Gospel",
        "Rhythm and blues",
        "R and B",
        "R&B",
        "Blues"
      ],
      "Expressive vocals": [
        "Expressive singing",
        "Emotional singing",
        "Emotional vocals"
      ],
      "Call and response": [
        "Call response"
      ],
      "Strong groove": [
        "Strong rhythm",
        "Groove"
      ],
      "Syncopation": [
        "Syncopated rhythm",
        "Syncopated rhythms"
      ],
      "Improvised vocal decoration": [
        "Vocal improvisation",
        "Improvisation",
        "Vocal embellishment",
        "Vocal ornamentation"
      ],
      "Horn section": [
        "Brass",
        "Brass section",
        "Horns"
      ]
    }
  }
];
  window.FAMILY_FORTUNES_ROUNDS.push(...higherStyleRounds);

  // Advanced Higher Styles: conceptlist.pdf, page 1. Facts are drawn from
  // the matching Advanced Higher entries in the project knowledge bank.
  const advancedHigherStyleRounds = [
  {
    "id": "builtin-ah-style-renaissance",
    "label": "Renaissance",
    "prompt": "Name features of renaissance music",
    "answers": [
      "Modal harmony",
      "Polyphonic texture",
      "Imitation",
      "A cappella singing",
      "Sacred and secular vocal music",
      "Lutes and viols",
      "Recorders and early brass"
    ],
    "answerAliases": {
      "Modal harmony": [
        "Modal",
        "Modes"
      ],
      "Polyphonic texture": [
        "Polyphonic",
        "Polyphony"
      ],
      "Imitation": [
        "Imitative entries"
      ],
      "A cappella singing": [
        "A cappella",
        "Unaccompanied voices"
      ],
      "Sacred and secular vocal music": [
        "Sacred music",
        "Secular music"
      ],
      "Lutes and viols": [
        "Lute",
        "Viols",
        "Viol"
      ],
      "Recorders and early brass": [
        "Recorders",
        "Early brass"
      ]
    }
  },
  {
    "id": "builtin-ah-style-pavan",
    "label": "Pavan",
    "prompt": "Name features of a pavan",
    "answers": [
      "Slow tempo",
      "Stately character",
      "Duple metre",
      "Renaissance court dance",
      "Often paired with a galliard",
      "Lute, keyboard or consort"
    ],
    "answerAliases": {
      "Slow tempo": [
        "Slow"
      ],
      "Stately character": [
        "Stately",
        "Dignified"
      ],
      "Duple metre": [
        "Duple",
        "Duple time",
        "Two beats",
        "2 beats"
      ],
      "Renaissance court dance": [
        "Renaissance",
        "Court dance"
      ],
      "Often paired with a galliard": [
        "Galliard",
        "Paired with galliard"
      ],
      "Lute, keyboard or consort": [
        "Lute",
        "Keyboard",
        "Consort"
      ]
    }
  },
  {
    "id": "builtin-ah-style-galliard",
    "label": "Galliard",
    "prompt": "Name features of a galliard",
    "answers": [
      "Lively tempo",
      "Triple metre",
      "Renaissance court dance",
      "Often follows a pavan",
      "Energetic rhythms",
      "May use hemiola"
    ],
    "answerAliases": {
      "Lively tempo": [
        "Lively",
        "Fast"
      ],
      "Triple metre": [
        "Triple time",
        "Triple",
        "Three beats",
        "3 beats"
      ],
      "Renaissance court dance": [
        "Renaissance",
        "Court dance"
      ],
      "Often follows a pavan": [
        "Pavan",
        "Follows pavan"
      ],
      "Energetic rhythms": [
        "Energetic rhythmic patterns"
      ],
      "May use hemiola": [
        "Hemiola"
      ]
    }
  },
  {
    "id": "builtin-ah-style-motet",
    "label": "Motet",
    "prompt": "Name features of a motet",
    "answers": [
      "Sacred text",
      "Latin text",
      "Polyphonic choral writing",
      "Imitation",
      "Modal harmony",
      "Often a cappella",
      "Renaissance origins",
      "Text separate from the Mass Ordinary"
    ],
    "answerAliases": {
      "Sacred text": [
        "Sacred",
        "Religious",
        "Religious text"
      ],
      "Latin text": [
        "Latin"
      ],
      "Polyphonic choral writing": [
        "Polyphonic",
        "Polyphony",
        "Choir"
      ],
      "Imitation": [
        "Imitative entries"
      ],
      "Modal harmony": [
        "Modal",
        "Modes"
      ],
      "Often a cappella": [
        "A cappella",
        "Unaccompanied"
      ],
      "Renaissance origins": [
        "Renaissance"
      ],
      "Text separate from the Mass Ordinary": [
        "Not the Mass Ordinary",
        "Separate sacred text"
      ]
    }
  },
  {
    "id": "builtin-ah-style-ayre-or-air",
    "label": "Ayre or Air",
    "prompt": "Name features of an ayre or air",
    "answers": [
      "Simple song or melody",
      "Solo voice",
      "Lute accompaniment",
      "English Renaissance origins",
      "May also be an instrumental melody"
    ],
    "answerAliases": {
      "Simple song or melody": [
        "Simple song",
        "Simple melody"
      ],
      "Solo voice": [
        "Solo singer",
        "Soloist"
      ],
      "Lute accompaniment": [
        "Lute"
      ],
      "English Renaissance origins": [
        "English",
        "Renaissance",
        "Late Renaissance"
      ],
      "May also be an instrumental melody": [
        "Instrumental melody",
        "Tuneful instrumental melody"
      ]
    }
  },
  {
    "id": "builtin-ah-style-ballett",
    "label": "Ballett",
    "prompt": "Name features of a ballett",
    "answers": [
      "Fa-la-la refrain",
      "Dance-like character",
      "Secular text",
      "Lively tempo",
      "Strophic form",
      "Several voices",
      "English Renaissance origins"
    ],
    "answerAliases": {
      "Fa-la-la refrain": [
        "Fa la la",
        "Fa la la refrain"
      ],
      "Dance-like character": [
        "Dance like",
        "Dance"
      ],
      "Secular text": [
        "Secular",
        "Non religious"
      ],
      "Lively tempo": [
        "Lively",
        "Fast"
      ],
      "Strophic form": [
        "Strophic"
      ],
      "Several voices": [
        "Part song",
        "Vocal ensemble"
      ],
      "English Renaissance origins": [
        "English",
        "Renaissance"
      ]
    }
  },
  {
    "id": "builtin-ah-style-madrigal",
    "label": "Madrigal",
    "prompt": "Name features of a madrigal",
    "answers": [
      "Secular text",
      "Renaissance origins",
      "Several voices",
      "Often a cappella",
      "Polyphonic texture",
      "Through-composed",
      "Word painting",
      "English texts in English madrigals"
    ],
    "answerAliases": {
      "Secular text": [
        "Secular",
        "Non religious"
      ],
      "Renaissance origins": [
        "Renaissance"
      ],
      "Several voices": [
        "Vocal ensemble",
        "Part song"
      ],
      "Often a cappella": [
        "A cappella",
        "Unaccompanied"
      ],
      "Polyphonic texture": [
        "Polyphonic",
        "Polyphony"
      ],
      "Through-composed": [
        "Through composed form"
      ],
      "Word painting": [
        "Reflects the meaning of the words"
      ],
      "English texts in English madrigals": [
        "English",
        "English text"
      ]
    }
  },
  {
    "id": "builtin-ah-style-anthem",
    "label": "Anthem",
    "prompt": "Name features of an anthem",
    "answers": [
      "English sacred text",
      "Religious choral work",
      "Protestant worship",
      "Renaissance origins",
      "A cappella or accompanied",
      "May include solo passages",
      "Homophonic or polyphonic writing"
    ],
    "answerAliases": {
      "English sacred text": [
        "English",
        "English text"
      ],
      "Religious choral work": [
        "Sacred",
        "Religious",
        "Choir",
        "Choral"
      ],
      "Protestant worship": [
        "Protestant",
        "Church of England"
      ],
      "Renaissance origins": [
        "Renaissance"
      ],
      "A cappella or accompanied": [
        "A cappella",
        "Unaccompanied",
        "Accompanied",
        "Organ",
        "Orchestra"
      ],
      "May include solo passages": [
        "Solo passages",
        "Soloists"
      ],
      "Homophonic or polyphonic writing": [
        "Homophonic",
        "Polyphonic",
        "Homophony",
        "Polyphony"
      ]
    }
  },
  {
    "id": "builtin-ah-style-chorale",
    "label": "Chorale",
    "prompt": "Name features of a chorale",
    "answers": [
      "German hymn tune",
      "Lutheran worship",
      "Clear regular rhythm",
      "Homophonic harmony",
      "Four SATB parts",
      "Used extensively by Bach"
    ],
    "answerAliases": {
      "German hymn tune": [
        "German",
        "German hymn"
      ],
      "Lutheran worship": [
        "Lutheran",
        "Protestant",
        "Lutheran hymn"
      ],
      "Clear regular rhythm": [
        "Regular rhythm",
        "Regular beat"
      ],
      "Homophonic harmony": [
        "Homophonic",
        "Homophony"
      ],
      "Four SATB parts": [
        "SATB",
        "Four parts",
        "4 parts",
        "Soprano alto tenor bass"
      ],
      "Used extensively by Bach": [
        "Bach",
        "J S Bach"
      ]
    }
  },
  {
    "id": "builtin-ah-style-nationalist",
    "label": "Nationalist",
    "prompt": "Name features of nationalist music",
    "answers": [
      "Folk melodies",
      "Traditional dances",
      "National or folk rhythms",
      "Traditional scales",
      "National stories or history",
      "Indigenous instruments",
      "Expresses national identity"
    ],
    "answerAliases": {
      "Folk melodies": [
        "Folk tunes",
        "Traditional melodies"
      ],
      "Traditional dances": [
        "Folk dances",
        "National dances"
      ],
      "National or folk rhythms": [
        "Folk rhythms",
        "Traditional rhythms"
      ],
      "Traditional scales": [
        "Folk scales",
        "National scales"
      ],
      "National stories or history": [
        "National stories",
        "History",
        "Historical subjects"
      ],
      "Indigenous instruments": [
        "Traditional instruments",
        "National instruments"
      ],
      "Expresses national identity": [
        "National identity",
        "National culture"
      ]
    }
  },
  {
    "id": "builtin-ah-style-neoclassical",
    "label": "Neoclassical",
    "prompt": "Name features of neoclassical music",
    "answers": [
      "Twentieth-century style",
      "Classical or earlier forms",
      "Balance and clarity",
      "Modern harmony",
      "Modern rhythm",
      "Often smaller ensembles",
      "Clear formal design",
      "Stravinsky or Prokofiev"
    ],
    "answerAliases": {
      "Twentieth-century style": [
        "20th century",
        "Twentieth century"
      ],
      "Classical or earlier forms": [
        "Classical forms",
        "Baroque forms",
        "Earlier forms"
      ],
      "Balance and clarity": [
        "Balance",
        "Clarity"
      ],
      "Modern harmony": [
        "Modern chords"
      ],
      "Modern rhythm": [
        "Modern rhythms"
      ],
      "Often smaller ensembles": [
        "Small ensembles",
        "Smaller ensembles"
      ],
      "Clear formal design": [
        "Clear structure",
        "Formal design"
      ],
      "Stravinsky or Prokofiev": [
        "Stravinsky",
        "Prokofiev"
      ]
    }
  },
  {
    "id": "builtin-ah-style-serial",
    "label": "Serial",
    "prompt": "Name features of serial music",
    "answers": [
      "Tone row or note row",
      "Twelve chromatic pitch classes",
      "Predetermined pitch order",
      "Transposition",
      "Inversion",
      "Retrograde",
      "Avoids functional tonality",
      "Schoenberg"
    ],
    "answerAliases": {
      "Tone row or note row": [
        "Tone row",
        "Note row"
      ],
      "Twelve chromatic pitch classes": [
        "12 notes",
        "Twelve notes",
        "All twelve notes",
        "All 12 notes"
      ],
      "Predetermined pitch order": [
        "Ordered pitches",
        "Ordered series",
        "Fixed order"
      ],
      "Transposition": [
        "Transposed row"
      ],
      "Inversion": [
        "Inverted row"
      ],
      "Retrograde": [
        "Row backwards",
        "Backwards row"
      ],
      "Avoids functional tonality": [
        "Atonal",
        "Atonality",
        "No functional tonality"
      ],
      "Schoenberg": [
        "Arnold Schoenberg"
      ]
    }
  },
  {
    "id": "builtin-ah-style-contemporary-jazz",
    "label": "Contemporary Jazz",
    "prompt": "Name features of contemporary jazz music",
    "answers": [
      "Improvisation",
      "Modal or extended harmony",
      "Chromatic harmony",
      "Complex or changing rhythms",
      "Grooves using few chords",
      "Electronics",
      "Extended techniques",
      "Funk, rock or world-music influences"
    ],
    "answerAliases": {
      "Improvisation": [
        "Improvised solos",
        "Improvising"
      ],
      "Modal or extended harmony": [
        "Modal harmony",
        "Extended chords",
        "Extended harmony",
        "Modal"
      ],
      "Chromatic harmony": [
        "Chromatic chords",
        "Chromatic"
      ],
      "Complex or changing rhythms": [
        "Complex rhythms",
        "Changing rhythms",
        "Cross rhythms"
      ],
      "Grooves using few chords": [
        "Few chords",
        "Limited chord groove"
      ],
      "Electronics": [
        "Electronic instruments",
        "Electric instruments"
      ],
      "Extended techniques": [
        "Extended playing techniques"
      ],
      "Funk, rock or world-music influences": [
        "Funk",
        "Rock",
        "World music",
        "Free jazz",
        "Avant garde"
      ]
    }
  },
  {
    "id": "builtin-ah-style-electronic-dance-music",
    "label": "Electronic Dance Music (EDM)",
    "prompt": "Name features of electronic dance music (EDM)",
    "answers": [
      "Electronic instruments",
      "Computer production",
      "Strong repetitive beat",
      "Loops",
      "Programmed drums",
      "Synthesisers",
      "Samples",
      "Sequencers",
      "Build-ups and drops",
      "Dance or club setting"
    ],
    "answerAliases": {
      "Electronic instruments": [
        "Electronic sounds",
        "Electronics"
      ],
      "Computer production": [
        "Computers",
        "Computer technology"
      ],
      "Strong repetitive beat": [
        "Repeated beat",
        "Repetitive beat",
        "Strong beat"
      ],
      "Loops": [
        "Looping",
        "Repeated patterns"
      ],
      "Programmed drums": [
        "Drum machine",
        "Drum programming"
      ],
      "Synthesisers": [
        "Synthesizers",
        "Synths"
      ],
      "Samples": [
        "Sampling",
        "Sampled sounds"
      ],
      "Sequencers": [
        "Sequencing"
      ],
      "Build-ups and drops": [
        "Build ups",
        "Drops",
        "Build ups and drops"
      ],
      "Dance or club setting": [
        "Dancing",
        "Dance music",
        "Clubs",
        "Club music"
      ]
    }
  }
];
  const advancedConcepts = core.questionsForLevel(data.QUESTIONS, "AH")
    .filter((question) => question.introducedAt === "AH" && !question.category.includes("Styles"));
  const advancedHigherRounds = window.FAMILY_FORTUNES_ROUNDS.map((round) => {
    const descriptor = categories.find(([, label]) => label === round.label);
    const additions = descriptor ? advancedConcepts.filter((question) => question.category === descriptor[0]) : [];
    return {
      ...round,
      prompt: round.label === "Key Signatures" ? "Name major keys with up to two sharps or flats, and minor keys with up to one" : round.prompt,
      answers: [...round.answers, ...additions.map((question) => question.answer)],
      answerAliases: { ...round.answerAliases, ...Object.fromEntries(additions.map((question) => [question.answer, question.aliases || []])) },
    };
  });
  for (const [category, label, prompt] of [
    ["Fugue", "Fugue", "Name features of a fugue"],
    ["Serial music", "Serial Music", "Name serial music techniques and concepts"],
  ]) {
    const entries = advancedConcepts.filter((question) => question.category === category);
    advancedHigherRounds.push({
      id: `builtin-ah-concept-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label, prompt,
      answers: entries.map((question) => question.answer),
      answerAliases: Object.fromEntries(entries.map((question) => [question.answer, question.aliases || []])),
    });
  }
  window.FAMILY_FORTUNES_ROUNDS_BY_LEVEL = {
    H: window.FAMILY_FORTUNES_ROUNDS,
    AH: [...advancedHigherRounds, ...advancedHigherStyleRounds],
  };
})();
