// National-level rounds: qualification membership and style definitions from
// Music_Concept_Knowledge_Bank_Ultimate_Codex_Edition.json. N5 keys and
// major/chromatic/whole-tone scales also follow concept-recall-data.js.
// Earlier styles are cumulative; facts use wording suitable for each level.
Object.assign(window.FAMILY_FORTUNES_ROUNDS_BY_LEVEL, {
  "N3": [
    {
      "id": "builtin-national-orchestral-families",
      "label": "Orchestral Families",
      "prompt": "Name orchestral instrument families",
      "answers": [
        "Strings",
        "Brass",
        "Woodwind",
        "Percussion"
      ],
      "answerAliases": {
        "Strings": [],
        "Brass": [],
        "Woodwind": [],
        "Percussion": []
      }
    },
    {
      "id": "builtin-national-tempo",
      "label": "Tempo",
      "prompt": "Name tempo markings",
      "answers": [
        "Allegro",
        "Adagio"
      ],
      "answerAliases": {
        "Allegro": [],
        "Adagio": []
      }
    },
    {
      "id": "builtin-national-textures",
      "label": "Textures",
      "prompt": "Name textures and ways of performing",
      "answers": [
        "Solo",
        "Unison",
        "Accompanied",
        "Unaccompanied"
      ],
      "answerAliases": {
        "Solo": [],
        "Unison": [],
        "Accompanied": [],
        "Unaccompanied": []
      }
    },
    {
      "id": "builtin-national-melodic-movement",
      "label": "Melodic Movement",
      "prompt": "Name ways a melody can move",
      "answers": [
        "Ascending",
        "Descending",
        "Stepwise",
        "Leaping"
      ],
      "answerAliases": {
        "Ascending": [
          "Ascends",
          "Upwards"
        ],
        "Descending": [
          "Descends",
          "Downwards"
        ],
        "Stepwise": [
          "Step",
          "Steps"
        ],
        "Leaping": [
          "Leap",
          "Leaps"
        ]
      }
    },
    {
      "id": "builtin-national-articulation",
      "label": "Articulation",
      "prompt": "Name types of articulation",
      "answers": [
        "Legato",
        "Staccato"
      ],
      "answerAliases": {
        "Legato": [],
        "Staccato": []
      }
    },
    {
      "id": "builtin-national-playing-techniques",
      "label": "Playing Techniques",
      "prompt": "Name playing techniques",
      "answers": [
        "Bowing",
        "Plucking",
        "Strumming",
        "Blowing",
        "Striking"
      ],
      "answerAliases": {
        "Bowing": [],
        "Plucking": [],
        "Strumming": [],
        "Blowing": [],
        "Striking": [
          "Hitting"
        ]
      }
    },
    {
      "id": "builtin-national-style-blues",
      "label": "Blues",
      "prompt": "Name features of blues music",
      "answers": [
        "Blue notes",
        "Call and response",
        "Repeated riffs",
        "Improvisation",
        "Often twelve bars",
        "Often four beats in a bar"
      ],
      "answerAliases": {
        "Blue notes": [
          "Blue note"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Repeated riffs": [],
        "Improvisation": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ],
        "Often four beats in a bar": [
          "4 beats",
          "Four beats",
          "4/4"
        ]
      }
    },
    {
      "id": "builtin-national-style-jazz",
      "label": "Jazz",
      "prompt": "Name features of jazz music",
      "answers": [
        "Improvisation",
        "Off-beat rhythms",
        "Instrumental solos",
        "Small or large ensembles",
        "Wind instruments",
        "Brass instruments",
        "Piano",
        "Drum kit"
      ],
      "answerAliases": {
        "Improvisation": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm"
        ],
        "Instrumental solos": [
          "Solos",
          "Solo"
        ],
        "Small or large ensembles": [],
        "Wind instruments": [],
        "Brass instruments": [],
        "Piano": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-latin-american",
      "label": "Latin American",
      "prompt": "Name features of latin american music",
      "answers": [
        "Dance music",
        "Lively rhythms",
        "Off-beat rhythms",
        "Strong dance pulse",
        "Prominent percussion"
      ],
      "answerAliases": {
        "Dance music": [],
        "Lively rhythms": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm"
        ],
        "Strong dance pulse": [
          "Dance pulse",
          "Strong beat"
        ],
        "Prominent percussion": [
          "Percussion"
        ]
      }
    },
    {
      "id": "builtin-national-style-musical",
      "label": "Musical",
      "prompt": "Name features of a musical",
      "answers": [
        "Spoken dialogue",
        "Songs",
        "Acting",
        "Dancing",
        "Band or orchestra",
        "Story and characters"
      ],
      "answerAliases": {
        "Spoken dialogue": [
          "Dialogue",
          "Speaking"
        ],
        "Songs": [],
        "Acting": [],
        "Dancing": [],
        "Band or orchestra": [
          "Band",
          "Orchestra"
        ],
        "Story and characters": []
      }
    },
    {
      "id": "builtin-national-style-pop",
      "label": "Pop",
      "prompt": "Name features of pop music",
      "answers": [
        "Memorable songs",
        "Repeated sections",
        "Verses and choruses",
        "Lead vocals",
        "Guitars",
        "Keyboards",
        "Drum kit"
      ],
      "answerAliases": {
        "Memorable songs": [],
        "Repeated sections": [],
        "Verses and choruses": [
          "Verse and chorus",
          "Verse",
          "Chorus"
        ],
        "Lead vocals": [
          "Lead singer",
          "Lead voice"
        ],
        "Guitars": [],
        "Keyboards": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock",
      "label": "Rock",
      "prompt": "Name features of rock music",
      "answers": [
        "Strong driving beat",
        "Amplified sound",
        "Electric guitar",
        "Drum kit",
        "Vocals",
        "Guitar riffs"
      ],
      "answerAliases": {
        "Strong driving beat": [],
        "Amplified sound": [],
        "Electric guitar": [
          "Electric guitars"
        ],
        "Drum kit": [
          "Drums"
        ],
        "Vocals": [
          "Singing",
          "Voice"
        ],
        "Guitar riffs": [
          "Riffs",
          "Riff"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock-n-roll",
      "label": "Rock 'n' Roll",
      "prompt": "Name features of rock 'n' roll",
      "answers": [
        "Lively tempo",
        "American origins",
        "Strong backbeat",
        "Bass moves steadily",
        "Riffs",
        "Often twelve bars"
      ],
      "answerAliases": {
        "Lively tempo": [],
        "American origins": [],
        "Strong backbeat": [
          "Backbeat"
        ],
        "Bass moves steadily": [],
        "Riffs": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ]
      }
    },
    {
      "id": "builtin-national-style-scottish",
      "label": "Scottish",
      "prompt": "Name features of scottish music",
      "answers": [
        "Fiddle",
        "Accordion",
        "Bagpipes",
        "Folk groups",
        "Scottish dance bands",
        "Traditional songs",
        "Traditional dances"
      ],
      "answerAliases": {
        "Fiddle": [],
        "Accordion": [],
        "Bagpipes": [],
        "Folk groups": [],
        "Scottish dance bands": [],
        "Traditional songs": [
          "Songs"
        ],
        "Traditional dances": [
          "Dances"
        ]
      }
    }
  ],
  "N4": [
    {
      "id": "builtin-national-orchestral-families",
      "label": "Orchestral Families",
      "prompt": "Name orchestral instrument families",
      "answers": [
        "Strings",
        "Brass",
        "Woodwind",
        "Percussion"
      ],
      "answerAliases": {
        "Strings": [],
        "Brass": [],
        "Woodwind": [],
        "Percussion": []
      }
    },
    {
      "id": "builtin-national-tempo",
      "label": "Tempo",
      "prompt": "Name tempo markings",
      "answers": [
        "Allegro",
        "Adagio",
        "Andante"
      ],
      "answerAliases": {
        "Allegro": [],
        "Adagio": [],
        "Andante": []
      }
    },
    {
      "id": "builtin-national-tempo-changes",
      "label": "Tempo Changes",
      "prompt": "Name tempo changes",
      "answers": [
        "Accelerando",
        "Rallentando",
        "A tempo"
      ],
      "answerAliases": {
        "Accelerando": [
          "Accel"
        ],
        "Rallentando": [
          "Rall"
        ],
        "A tempo": []
      }
    },
    {
      "id": "builtin-national-tonalities",
      "label": "Tonalities",
      "prompt": "Name types of tonality",
      "answers": [
        "Major",
        "Minor"
      ],
      "answerAliases": {
        "Major": [
          "Major tonality"
        ],
        "Minor": [
          "Minor tonality"
        ]
      }
    },
    {
      "id": "builtin-national-voice-types",
      "label": "Voice Types",
      "prompt": "Name voice types",
      "answers": [
        "Soprano",
        "Alto",
        "Tenor",
        "Bass"
      ],
      "answerAliases": {
        "Soprano": [],
        "Alto": [],
        "Tenor": [],
        "Bass": [
          "Bass voice"
        ]
      }
    },
    {
      "id": "builtin-national-textures",
      "label": "Textures",
      "prompt": "Name textures and ways of performing",
      "answers": [
        "Solo",
        "Unison",
        "Accompanied",
        "Unaccompanied"
      ],
      "answerAliases": {
        "Solo": [],
        "Unison": [],
        "Accompanied": [],
        "Unaccompanied": []
      }
    },
    {
      "id": "builtin-national-melodic-movement",
      "label": "Melodic Movement",
      "prompt": "Name ways a melody can move",
      "answers": [
        "Ascending",
        "Descending",
        "Stepwise",
        "Leaping"
      ],
      "answerAliases": {
        "Ascending": [
          "Ascends",
          "Upwards"
        ],
        "Descending": [
          "Descends",
          "Downwards"
        ],
        "Stepwise": [
          "Step",
          "Steps"
        ],
        "Leaping": [
          "Leap",
          "Leaps"
        ]
      }
    },
    {
      "id": "builtin-national-articulation",
      "label": "Articulation",
      "prompt": "Name types of articulation",
      "answers": [
        "Legato",
        "Staccato"
      ],
      "answerAliases": {
        "Legato": [],
        "Staccato": []
      }
    },
    {
      "id": "builtin-national-musical-forms",
      "label": "Musical Forms",
      "prompt": "Name musical forms",
      "answers": [
        "Round",
        "Canon",
        "Ternary",
        "Theme and variation",
        "Verse and chorus"
      ],
      "answerAliases": {
        "Round": [],
        "Canon": [],
        "Ternary": [
          "ABA"
        ],
        "Theme and variation": [
          "Theme and variations"
        ],
        "Verse and chorus": []
      }
    },
    {
      "id": "builtin-national-playing-techniques",
      "label": "Playing Techniques",
      "prompt": "Name playing techniques",
      "answers": [
        "Bowing",
        "Plucking",
        "Strumming",
        "Blowing",
        "Striking",
        "Muted"
      ],
      "answerAliases": {
        "Bowing": [],
        "Plucking": [],
        "Strumming": [],
        "Blowing": [],
        "Striking": [
          "Hitting"
        ],
        "Muted": [
          "Mute",
          "Using a mute"
        ]
      }
    },
    {
      "id": "builtin-national-style-blues",
      "label": "Blues",
      "prompt": "Name features of blues music",
      "answers": [
        "Blue notes",
        "Call and response",
        "Repeated riffs",
        "Improvisation",
        "Often twelve bars",
        "Often four beats in a bar"
      ],
      "answerAliases": {
        "Blue notes": [
          "Blue note"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Repeated riffs": [],
        "Improvisation": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ],
        "Often four beats in a bar": [
          "4 beats",
          "Four beats",
          "4/4"
        ]
      }
    },
    {
      "id": "builtin-national-style-jazz",
      "label": "Jazz",
      "prompt": "Name features of jazz music",
      "answers": [
        "Improvisation",
        "Off-beat rhythms",
        "Instrumental solos",
        "Small groups or big bands",
        "Saxophone",
        "Trumpet",
        "Piano",
        "Drum kit"
      ],
      "answerAliases": {
        "Improvisation": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm",
          "Syncopation",
          "Syncopated rhythms"
        ],
        "Instrumental solos": [
          "Solos",
          "Solo"
        ],
        "Small groups or big bands": [],
        "Saxophone": [],
        "Trumpet": [],
        "Piano": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-latin-american",
      "label": "Latin American",
      "prompt": "Name features of latin american music",
      "answers": [
        "Dance music",
        "Lively rhythms",
        "Off-beat rhythms",
        "Strong dance pulse",
        "Prominent percussion"
      ],
      "answerAliases": {
        "Dance music": [],
        "Lively rhythms": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm",
          "Syncopation",
          "Syncopated rhythms"
        ],
        "Strong dance pulse": [
          "Dance pulse",
          "Strong beat"
        ],
        "Prominent percussion": [
          "Percussion"
        ]
      }
    },
    {
      "id": "builtin-national-style-musical",
      "label": "Musical",
      "prompt": "Name features of a musical",
      "answers": [
        "Spoken dialogue",
        "Songs",
        "Acting",
        "Dancing",
        "Band or orchestra",
        "Story and characters"
      ],
      "answerAliases": {
        "Spoken dialogue": [
          "Dialogue",
          "Speaking"
        ],
        "Songs": [],
        "Acting": [],
        "Dancing": [],
        "Band or orchestra": [
          "Band",
          "Orchestra"
        ],
        "Story and characters": []
      }
    },
    {
      "id": "builtin-national-style-pop",
      "label": "Pop",
      "prompt": "Name features of pop music",
      "answers": [
        "Memorable songs",
        "Repeated sections",
        "Verses and choruses",
        "Lead vocals",
        "Guitars",
        "Keyboards",
        "Drum kit"
      ],
      "answerAliases": {
        "Memorable songs": [],
        "Repeated sections": [],
        "Verses and choruses": [
          "Verse and chorus",
          "Verse",
          "Chorus"
        ],
        "Lead vocals": [
          "Lead singer",
          "Lead voice"
        ],
        "Guitars": [],
        "Keyboards": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock",
      "label": "Rock",
      "prompt": "Name features of rock music",
      "answers": [
        "Strong driving beat",
        "Amplified sound",
        "Electric guitar",
        "Drum kit",
        "Vocals",
        "Guitar riffs"
      ],
      "answerAliases": {
        "Strong driving beat": [],
        "Amplified sound": [],
        "Electric guitar": [
          "Electric guitars"
        ],
        "Drum kit": [
          "Drums"
        ],
        "Vocals": [
          "Singing",
          "Voice"
        ],
        "Guitar riffs": [
          "Riffs",
          "Riff"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock-n-roll",
      "label": "Rock 'n' Roll",
      "prompt": "Name features of rock 'n' roll",
      "answers": [
        "Lively tempo",
        "American origins",
        "Strong backbeat",
        "Bass moves steadily",
        "Riffs",
        "Often twelve bars"
      ],
      "answerAliases": {
        "Lively tempo": [],
        "American origins": [],
        "Strong backbeat": [
          "Backbeat"
        ],
        "Riffs": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ]
      }
    },
    {
      "id": "builtin-national-style-scottish",
      "label": "Scottish",
      "prompt": "Name features of scottish music",
      "answers": [
        "Fiddle",
        "Accordion",
        "Bagpipes",
        "Folk groups",
        "Scottish dance bands",
        "Traditional songs",
        "Traditional dances"
      ],
      "answerAliases": {
        "Fiddle": [],
        "Accordion": [],
        "Bagpipes": [],
        "Folk groups": [],
        "Scottish dance bands": [],
        "Traditional songs": [
          "Songs"
        ],
        "Traditional dances": [
          "Dances"
        ]
      }
    },
    {
      "id": "builtin-national-style-african-music",
      "label": "African Music",
      "prompt": "Name features of african music music",
      "answers": [
        "Layered percussion",
        "Repeated rhythms",
        "Call and response",
        "Singing",
        "Clapping",
        "Overlapping rhythms"
      ],
      "answerAliases": {
        "Layered percussion": [
          "Percussion",
          "Drums"
        ],
        "Repeated rhythms": [
          "Repeated rhythmic patterns"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Singing": [],
        "Clapping": [],
        "Overlapping rhythms": [
          "Interlocking rhythms",
          "Cross rhythms"
        ]
      }
    },
    {
      "id": "builtin-national-style-baroque",
      "label": "Baroque",
      "prompt": "Name features of baroque music",
      "answers": [
        "Harpsichord",
        "Organ",
        "Ornaments",
        "Sequences",
        "Terraced dynamics",
        "Bach",
        "Handel"
      ],
      "answerAliases": {
        "Harpsichord": [],
        "Organ": [],
        "Ornaments": [
          "Ornament"
        ],
        "Sequences": [
          "Sequence"
        ],
        "Terraced dynamics": [],
        "Bach": [],
        "Handel": []
      }
    },
    {
      "id": "builtin-national-style-concerto",
      "label": "Concerto",
      "prompt": "Name features of a concerto",
      "answers": [
        "Solo instrument",
        "Orchestra",
        "Featured soloist",
        "Several movements",
        "Often three movements",
        "Often fast–slow–fast",
        "Cadenza"
      ],
      "answerAliases": {
        "Solo instrument": [
          "Soloist",
          "Solo instrumentalist"
        ],
        "Orchestra": [],
        "Featured soloist": [
          "Prominent soloist"
        ],
        "Several movements": [
          "Multiple movements"
        ],
        "Often three movements": [
          "Three movements",
          "3 movements"
        ],
        "Often fast–slow–fast": [
          "Fast slow fast"
        ],
        "Cadenza": []
      }
    },
    {
      "id": "builtin-national-style-mouth-music",
      "label": "Mouth Music",
      "prompt": "Name features of mouth music",
      "answers": [
        "Gaelic words or syllables",
        "Nonsense syllables",
        "Rhythmic singing",
        "Usually unaccompanied",
        "Music for dancing",
        "Puirt-a-beul"
      ],
      "answerAliases": {
        "Gaelic words or syllables": [
          "Gaelic",
          "Gaelic words"
        ],
        "Nonsense syllables": [
          "Nonsense words"
        ],
        "Rhythmic singing": [],
        "Usually unaccompanied": [
          "Unaccompanied",
          "No accompaniment"
        ],
        "Music for dancing": [
          "Dancing",
          "Dance music"
        ],
        "Puirt-a-beul": [
          "Puirt a beul"
        ]
      }
    },
    {
      "id": "builtin-national-style-opera",
      "label": "Opera",
      "prompt": "Name features of an opera",
      "answers": [
        "Sung story",
        "Soloists",
        "Chorus",
        "Orchestra",
        "Acting",
        "Costumes",
        "Scenery"
      ],
      "answerAliases": {
        "Sung story": [
          "Sung drama",
          "Singing"
        ],
        "Soloists": [
          "Solo singers"
        ],
        "Chorus": [],
        "Orchestra": [],
        "Acting": [],
        "Costumes": [],
        "Scenery": []
      }
    },
    {
      "id": "builtin-national-style-ragtime",
      "label": "Ragtime",
      "prompt": "Name features of ragtime music",
      "answers": [
        "Piano",
        "Syncopated melody",
        "Steady accompaniment",
        "Bass notes and chords",
        "Vamp-like accompaniment",
        "Influenced early jazz"
      ],
      "answerAliases": {
        "Piano": [],
        "Syncopated melody": [
          "Syncopation",
          "Syncopated tune"
        ],
        "Steady accompaniment": [],
        "Bass notes and chords": [
          "Alternating bass and chords"
        ],
        "Vamp-like accompaniment": [
          "Vamp",
          "Vamp accompaniment"
        ],
        "Influenced early jazz": []
      }
    },
    {
      "id": "builtin-national-style-rapping",
      "label": "Rapping",
      "prompt": "Name features of rapping",
      "answers": [
        "Spoken words",
        "Rhyming words",
        "Words in time with a beat",
        "Hip-hop",
        "Repeated grooves",
        "Samples or backing tracks"
      ],
      "answerAliases": {
        "Spoken words": [
          "Spoken",
          "Speaking"
        ],
        "Rhyming words": [
          "Rhymes",
          "Rhyming"
        ],
        "Words in time with a beat": [
          "Rhythmic speech",
          "Rhythmic words"
        ],
        "Hip-hop": [],
        "Repeated grooves": [],
        "Samples or backing tracks": [
          "Samples",
          "Backing tracks"
        ]
      }
    },
    {
      "id": "builtin-national-style-reggae",
      "label": "Reggae",
      "prompt": "Name features of reggae music",
      "answers": [
        "Jamaican origins",
        "Relaxed steady groove",
        "Prominent bass line",
        "Off-beat chords",
        "Staccato guitar or keyboard",
        "Often stresses beats two and four"
      ],
      "answerAliases": {
        "Jamaican origins": [
          "Jamaica",
          "Jamaican"
        ],
        "Relaxed steady groove": [],
        "Prominent bass line": [],
        "Off-beat chords": [
          "Off beat",
          "Off beat guitar",
          "Off beat keyboard"
        ],
        "Staccato guitar or keyboard": [
          "Staccato guitar",
          "Staccato keyboard",
          "Short chords"
        ],
        "Often stresses beats two and four": []
      }
    },
    {
      "id": "builtin-national-style-romantic",
      "label": "Romantic",
      "prompt": "Name features of romantic music",
      "answers": [
        "Expressive melody",
        "Flexible tempo",
        "Wide dynamic range",
        "Expanded orchestra",
        "Music inspired by a story or idea",
        "Chopin",
        "Liszt"
      ],
      "answerAliases": {
        "Expressive melody": [],
        "Flexible tempo": [],
        "Wide dynamic range": [],
        "Expanded orchestra": [],
        "Music inspired by a story or idea": [
          "Programme music",
          "Programmatic ideas"
        ],
        "Chopin": [],
        "Liszt": []
      }
    },
    {
      "id": "builtin-national-style-scots-ballad",
      "label": "Scots Ballad",
      "prompt": "Name features of scots ballad",
      "answers": [
        "Scottish song",
        "Scots language",
        "Tells a story",
        "Repeated verse melody",
        "Solo voice",
        "Simple accompaniment or unaccompanied"
      ],
      "answerAliases": {
        "Scottish song": [],
        "Scots language": [
          "Scots",
          "Scots dialect"
        ],
        "Tells a story": [],
        "Repeated verse melody": [
          "Strophic",
          "Same melody each verse"
        ],
        "Solo voice": [],
        "Simple accompaniment or unaccompanied": [
          "Simple accompaniment",
          "Unaccompanied"
        ]
      }
    },
    {
      "id": "builtin-national-style-swing",
      "label": "Swing",
      "prompt": "Name features of swing music",
      "answers": [
        "Big band",
        "Swung rhythms",
        "Danceable pulse",
        "Riffs",
        "Call and response",
        "Trumpets",
        "Trombones",
        "Saxophones",
        "Rhythm section"
      ],
      "answerAliases": {
        "Big band": [],
        "Swung rhythms": [
          "Swung rhythm",
          "Swing rhythms"
        ],
        "Danceable pulse": [],
        "Riffs": [],
        "Call and response": [
          "Question and answer"
        ],
        "Trumpets": [],
        "Trombones": [],
        "Saxophones": [],
        "Rhythm section": []
      }
    }
  ],
  "N5": [
    {
      "id": "builtin-national-orchestral-families",
      "label": "Orchestral Families",
      "prompt": "Name orchestral instrument families",
      "answers": [
        "Strings",
        "Brass",
        "Woodwind",
        "Percussion"
      ],
      "answerAliases": {
        "Strings": [],
        "Brass": [],
        "Woodwind": [],
        "Percussion": []
      }
    },
    {
      "id": "builtin-national-tempo",
      "label": "Tempo",
      "prompt": "Name tempo markings",
      "answers": [
        "Allegro",
        "Adagio",
        "Andante",
        "Moderato"
      ],
      "answerAliases": {
        "Allegro": [],
        "Adagio": [],
        "Andante": [],
        "Moderato": []
      }
    },
    {
      "id": "builtin-national-tempo-changes",
      "label": "Tempo Changes",
      "prompt": "Name tempo changes",
      "answers": [
        "Accelerando",
        "Rallentando",
        "A tempo",
        "Ritardando",
        "Rubato"
      ],
      "answerAliases": {
        "Accelerando": [
          "Accel"
        ],
        "Rallentando": [
          "Rall"
        ],
        "A tempo": [],
        "Ritardando": [
          "Rit"
        ],
        "Rubato": []
      }
    },
    {
      "id": "builtin-national-tonalities",
      "label": "Tonalities",
      "prompt": "Name types of tonality",
      "answers": [
        "Major",
        "Minor",
        "Atonal"
      ],
      "answerAliases": {
        "Major": [
          "Major tonality"
        ],
        "Minor": [
          "Minor tonality"
        ],
        "Atonal": [
          "Atonality"
        ]
      }
    },
    {
      "id": "builtin-national-cadences",
      "label": "Cadences",
      "prompt": "Name types of cadence",
      "answers": [
        "Perfect cadence",
        "Imperfect cadence"
      ],
      "answerAliases": {
        "Perfect cadence": [
          "Perfect"
        ],
        "Imperfect cadence": [
          "Imperfect"
        ]
      }
    },
    {
      "id": "builtin-national-ornaments",
      "label": "Ornaments",
      "prompt": "Name types of ornament",
      "answers": [
        "Trill",
        "Grace notes"
      ],
      "answerAliases": {
        "Trill": [],
        "Grace notes": [
          "Grace note"
        ]
      }
    },
    {
      "id": "builtin-national-scales",
      "label": "Scales",
      "prompt": "Name types of scale",
      "answers": [
        "Pentatonic scale",
        "Major scale",
        "Chromatic scale",
        "Whole-tone scale"
      ],
      "answerAliases": {
        "Pentatonic scale": [
          "Pentatonic"
        ],
        "Major scale": [
          "Major"
        ],
        "Chromatic scale": [
          "Chromatic"
        ],
        "Whole-tone scale": [
          "Whole tone",
          "Whole tone scale"
        ]
      }
    },
    {
      "id": "builtin-national-voice-types",
      "label": "Voice Types",
      "prompt": "Name voice types",
      "answers": [
        "Soprano",
        "Alto",
        "Tenor",
        "Bass",
        "Mezzo-soprano",
        "Baritone"
      ],
      "answerAliases": {
        "Soprano": [],
        "Alto": [],
        "Tenor": [],
        "Bass": [
          "Bass voice"
        ],
        "Mezzo-soprano": [
          "Mezzo soprano"
        ],
        "Baritone": []
      }
    },
    {
      "id": "builtin-national-textures",
      "label": "Textures",
      "prompt": "Name textures and ways of performing",
      "answers": [
        "Solo",
        "Unison",
        "Accompanied",
        "Unaccompanied",
        "Homophonic",
        "Polyphonic or contrapuntal"
      ],
      "answerAliases": {
        "Solo": [],
        "Unison": [],
        "Accompanied": [],
        "Unaccompanied": [],
        "Homophonic": [
          "Homophony"
        ],
        "Polyphonic or contrapuntal": [
          "Polyphonic",
          "Polyphony",
          "Contrapuntal"
        ]
      }
    },
    {
      "id": "builtin-national-word-setting",
      "label": "Word Setting",
      "prompt": "Name types of word setting",
      "answers": [
        "Syllabic",
        "Melismatic"
      ],
      "answerAliases": {
        "Syllabic": [],
        "Melismatic": []
      }
    },
    {
      "id": "builtin-national-bass-lines",
      "label": "Bass Lines",
      "prompt": "Name types of bass line",
      "answers": [
        "Alberti bass",
        "Walking bass",
        "Ground bass"
      ],
      "answerAliases": {
        "Alberti bass": [
          "Alberti"
        ],
        "Walking bass": [
          "Walking"
        ],
        "Ground bass": [
          "Ground"
        ]
      }
    },
    {
      "id": "builtin-national-key-signatures",
      "label": "Key Signatures",
      "prompt": "Name keys with no sharps or flats, one sharp, or one flat",
      "answers": [
        "C major",
        "A minor",
        "G major",
        "F major"
      ],
      "answerAliases": {
        "C major": [],
        "A minor": [],
        "G major": [],
        "F major": []
      }
    },
    {
      "id": "builtin-national-melodic-movement",
      "label": "Melodic Movement",
      "prompt": "Name ways a melody can move",
      "answers": [
        "Ascending",
        "Descending",
        "Stepwise",
        "Leaping"
      ],
      "answerAliases": {
        "Ascending": [
          "Ascends",
          "Upwards"
        ],
        "Descending": [
          "Descends",
          "Downwards"
        ],
        "Stepwise": [
          "Step",
          "Steps"
        ],
        "Leaping": [
          "Leap",
          "Leaps"
        ]
      }
    },
    {
      "id": "builtin-national-articulation",
      "label": "Articulation",
      "prompt": "Name types of articulation",
      "answers": [
        "Legato",
        "Staccato"
      ],
      "answerAliases": {
        "Legato": [],
        "Staccato": []
      }
    },
    {
      "id": "builtin-national-musical-forms",
      "label": "Musical Forms",
      "prompt": "Name musical forms",
      "answers": [
        "Round",
        "Canon",
        "Ternary",
        "Theme and variation",
        "Verse and chorus",
        "Binary",
        "Rondo",
        "Strophic"
      ],
      "answerAliases": {
        "Round": [],
        "Canon": [],
        "Ternary": [
          "ABA"
        ],
        "Theme and variation": [
          "Theme and variations"
        ],
        "Verse and chorus": [],
        "Binary": [
          "AB"
        ],
        "Rondo": [
          "ABACA"
        ],
        "Strophic": []
      }
    },
    {
      "id": "builtin-national-playing-techniques",
      "label": "Playing Techniques",
      "prompt": "Name playing techniques",
      "answers": [
        "Arco",
        "Pizzicato",
        "Strumming",
        "Blowing",
        "Striking",
        "Con sordino",
        "Rolls",
        "Flutter tonguing"
      ],
      "answerAliases": {
        "Arco": [
          "Bowing",
          "Bowed"
        ],
        "Pizzicato": [
          "Plucking",
          "Plucked"
        ],
        "Strumming": [],
        "Blowing": [],
        "Striking": [
          "Hitting"
        ],
        "Con sordino": [
          "Muted",
          "Mute"
        ],
        "Rolls": [
          "Roll",
          "Drum roll"
        ],
        "Flutter tonguing": [
          "Flutter tongue",
          "Flutter-tonguing"
        ]
      }
    },
    {
      "id": "builtin-national-style-blues",
      "label": "Blues",
      "prompt": "Name features of blues music",
      "answers": [
        "Blue notes",
        "Call and response",
        "Repeated riffs",
        "Improvisation",
        "Often twelve bars",
        "Often four beats in a bar"
      ],
      "answerAliases": {
        "Blue notes": [
          "Blue note"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Repeated riffs": [],
        "Improvisation": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ],
        "Often four beats in a bar": [
          "4 beats",
          "Four beats",
          "4/4"
        ]
      }
    },
    {
      "id": "builtin-national-style-jazz",
      "label": "Jazz",
      "prompt": "Name features of jazz music",
      "answers": [
        "Improvisation",
        "Off-beat rhythms",
        "Instrumental solos",
        "Small groups or big bands",
        "Saxophone",
        "Trumpet",
        "Piano",
        "Drum kit"
      ],
      "answerAliases": {
        "Improvisation": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm",
          "Syncopation",
          "Syncopated rhythms"
        ],
        "Instrumental solos": [
          "Solos",
          "Solo"
        ],
        "Small groups or big bands": [],
        "Saxophone": [],
        "Trumpet": [],
        "Piano": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-latin-american",
      "label": "Latin American",
      "prompt": "Name features of latin american music",
      "answers": [
        "Dance music",
        "Lively rhythms",
        "Off-beat rhythms",
        "Strong dance pulse",
        "Prominent percussion"
      ],
      "answerAliases": {
        "Dance music": [],
        "Lively rhythms": [],
        "Off-beat rhythms": [
          "Off beat",
          "Off beat rhythm",
          "Syncopation",
          "Syncopated rhythms"
        ],
        "Strong dance pulse": [
          "Dance pulse",
          "Strong beat"
        ],
        "Prominent percussion": [
          "Percussion"
        ]
      }
    },
    {
      "id": "builtin-national-style-musical",
      "label": "Musical",
      "prompt": "Name features of a musical",
      "answers": [
        "Spoken dialogue",
        "Songs",
        "Acting",
        "Dancing",
        "Band or orchestra",
        "Story and characters"
      ],
      "answerAliases": {
        "Spoken dialogue": [
          "Dialogue",
          "Speaking"
        ],
        "Songs": [],
        "Acting": [],
        "Dancing": [],
        "Band or orchestra": [
          "Band",
          "Orchestra"
        ],
        "Story and characters": []
      }
    },
    {
      "id": "builtin-national-style-pop",
      "label": "Pop",
      "prompt": "Name features of pop music",
      "answers": [
        "Memorable songs",
        "Repeated sections",
        "Verses and choruses",
        "Lead vocals",
        "Guitars",
        "Keyboards",
        "Drum kit"
      ],
      "answerAliases": {
        "Memorable songs": [],
        "Repeated sections": [],
        "Verses and choruses": [
          "Verse and chorus",
          "Verse",
          "Chorus"
        ],
        "Lead vocals": [
          "Lead singer",
          "Lead voice"
        ],
        "Guitars": [],
        "Keyboards": [],
        "Drum kit": [
          "Drums"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock",
      "label": "Rock",
      "prompt": "Name features of rock music",
      "answers": [
        "Strong driving beat",
        "Amplified sound",
        "Electric guitar",
        "Drum kit",
        "Vocals",
        "Guitar riffs"
      ],
      "answerAliases": {
        "Strong driving beat": [],
        "Amplified sound": [],
        "Electric guitar": [
          "Electric guitars"
        ],
        "Drum kit": [
          "Drums"
        ],
        "Vocals": [
          "Singing",
          "Voice"
        ],
        "Guitar riffs": [
          "Riffs",
          "Riff"
        ]
      }
    },
    {
      "id": "builtin-national-style-rock-n-roll",
      "label": "Rock 'n' Roll",
      "prompt": "Name features of rock 'n' roll",
      "answers": [
        "Lively tempo",
        "American origins",
        "Strong backbeat",
        "Walking bass line",
        "Riffs",
        "Often twelve bars"
      ],
      "answerAliases": {
        "Lively tempo": [],
        "American origins": [],
        "Strong backbeat": [
          "Backbeat"
        ],
        "Walking bass line": [
          "Walking bass"
        ],
        "Riffs": [],
        "Often twelve bars": [
          "Twelve bars",
          "12 bars",
          "12 bar blues",
          "Twelve bar blues"
        ]
      }
    },
    {
      "id": "builtin-national-style-scottish",
      "label": "Scottish",
      "prompt": "Name features of scottish music",
      "answers": [
        "Fiddle",
        "Accordion",
        "Bagpipes",
        "Folk groups",
        "Scottish dance bands",
        "Traditional songs",
        "Traditional dances"
      ],
      "answerAliases": {
        "Fiddle": [],
        "Accordion": [],
        "Bagpipes": [],
        "Folk groups": [],
        "Scottish dance bands": [],
        "Traditional songs": [
          "Songs"
        ],
        "Traditional dances": [
          "Dances"
        ]
      }
    },
    {
      "id": "builtin-national-style-african-music",
      "label": "African Music",
      "prompt": "Name features of african music music",
      "answers": [
        "Layered percussion",
        "Repeated rhythms",
        "Call and response",
        "Singing",
        "Clapping",
        "Overlapping rhythms"
      ],
      "answerAliases": {
        "Layered percussion": [
          "Percussion",
          "Drums"
        ],
        "Repeated rhythms": [
          "Repeated rhythmic patterns"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Singing": [],
        "Clapping": [],
        "Overlapping rhythms": [
          "Interlocking rhythms",
          "Cross rhythms"
        ]
      }
    },
    {
      "id": "builtin-national-style-baroque",
      "label": "Baroque",
      "prompt": "Name features of baroque music",
      "answers": [
        "Harpsichord",
        "Organ",
        "Ornaments",
        "Sequences",
        "Terraced dynamics",
        "Bach",
        "Handel"
      ],
      "answerAliases": {
        "Harpsichord": [],
        "Organ": [],
        "Ornaments": [
          "Ornament"
        ],
        "Sequences": [
          "Sequence"
        ],
        "Terraced dynamics": [],
        "Bach": [],
        "Handel": []
      }
    },
    {
      "id": "builtin-national-style-concerto",
      "label": "Concerto",
      "prompt": "Name features of a concerto",
      "answers": [
        "Solo instrument",
        "Orchestra",
        "Featured soloist",
        "Several movements",
        "Often three movements",
        "Often fast–slow–fast",
        "Cadenza"
      ],
      "answerAliases": {
        "Solo instrument": [
          "Soloist",
          "Solo instrumentalist"
        ],
        "Orchestra": [],
        "Featured soloist": [
          "Prominent soloist"
        ],
        "Several movements": [
          "Multiple movements"
        ],
        "Often three movements": [
          "Three movements",
          "3 movements"
        ],
        "Often fast–slow–fast": [
          "Fast slow fast"
        ],
        "Cadenza": []
      }
    },
    {
      "id": "builtin-national-style-mouth-music",
      "label": "Mouth Music",
      "prompt": "Name features of mouth music",
      "answers": [
        "Gaelic words or syllables",
        "Nonsense syllables",
        "Rhythmic singing",
        "Usually unaccompanied",
        "Music for dancing",
        "Puirt-a-beul"
      ],
      "answerAliases": {
        "Gaelic words or syllables": [
          "Gaelic",
          "Gaelic words"
        ],
        "Nonsense syllables": [
          "Nonsense words"
        ],
        "Rhythmic singing": [],
        "Usually unaccompanied": [
          "Unaccompanied",
          "No accompaniment"
        ],
        "Music for dancing": [
          "Dancing",
          "Dance music"
        ],
        "Puirt-a-beul": [
          "Puirt a beul"
        ]
      }
    },
    {
      "id": "builtin-national-style-opera",
      "label": "Opera",
      "prompt": "Name features of an opera",
      "answers": [
        "Sung story",
        "Soloists",
        "Chorus",
        "Orchestra",
        "Acting",
        "Costumes",
        "Scenery"
      ],
      "answerAliases": {
        "Sung story": [
          "Sung drama",
          "Singing"
        ],
        "Soloists": [
          "Solo singers"
        ],
        "Chorus": [],
        "Orchestra": [],
        "Acting": [],
        "Costumes": [],
        "Scenery": []
      }
    },
    {
      "id": "builtin-national-style-ragtime",
      "label": "Ragtime",
      "prompt": "Name features of ragtime music",
      "answers": [
        "Piano",
        "Syncopated melody",
        "Steady accompaniment",
        "Bass notes and chords",
        "Vamp-like accompaniment",
        "Influenced early jazz"
      ],
      "answerAliases": {
        "Piano": [],
        "Syncopated melody": [
          "Syncopation",
          "Syncopated tune"
        ],
        "Steady accompaniment": [],
        "Bass notes and chords": [
          "Alternating bass and chords"
        ],
        "Vamp-like accompaniment": [
          "Vamp",
          "Vamp accompaniment"
        ],
        "Influenced early jazz": []
      }
    },
    {
      "id": "builtin-national-style-rapping",
      "label": "Rapping",
      "prompt": "Name features of rapping",
      "answers": [
        "Spoken words",
        "Rhyming words",
        "Words in time with a beat",
        "Hip-hop",
        "Repeated grooves",
        "Samples or backing tracks"
      ],
      "answerAliases": {
        "Spoken words": [
          "Spoken",
          "Speaking"
        ],
        "Rhyming words": [
          "Rhymes",
          "Rhyming"
        ],
        "Words in time with a beat": [
          "Rhythmic speech",
          "Rhythmic words"
        ],
        "Hip-hop": [],
        "Repeated grooves": [],
        "Samples or backing tracks": [
          "Samples",
          "Backing tracks"
        ]
      }
    },
    {
      "id": "builtin-national-style-reggae",
      "label": "Reggae",
      "prompt": "Name features of reggae music",
      "answers": [
        "Jamaican origins",
        "Relaxed steady groove",
        "Prominent bass line",
        "Off-beat chords",
        "Staccato guitar or keyboard",
        "Often stresses beats two and four"
      ],
      "answerAliases": {
        "Jamaican origins": [
          "Jamaica",
          "Jamaican"
        ],
        "Relaxed steady groove": [],
        "Prominent bass line": [],
        "Off-beat chords": [
          "Off beat",
          "Off beat guitar",
          "Off beat keyboard"
        ],
        "Staccato guitar or keyboard": [
          "Staccato guitar",
          "Staccato keyboard",
          "Short chords"
        ],
        "Often stresses beats two and four": []
      }
    },
    {
      "id": "builtin-national-style-romantic",
      "label": "Romantic",
      "prompt": "Name features of romantic music",
      "answers": [
        "Expressive melody",
        "Flexible tempo",
        "Wide dynamic range",
        "Expanded orchestra",
        "Music inspired by a story or idea",
        "Chopin",
        "Liszt"
      ],
      "answerAliases": {
        "Expressive melody": [],
        "Flexible tempo": [
          "Rubato"
        ],
        "Wide dynamic range": [],
        "Expanded orchestra": [],
        "Music inspired by a story or idea": [
          "Programme music",
          "Programmatic ideas"
        ],
        "Chopin": [],
        "Liszt": []
      }
    },
    {
      "id": "builtin-national-style-scots-ballad",
      "label": "Scots Ballad",
      "prompt": "Name features of scots ballad",
      "answers": [
        "Scottish song",
        "Scots language",
        "Tells a story",
        "Repeated verse melody",
        "Solo voice",
        "Simple accompaniment or unaccompanied"
      ],
      "answerAliases": {
        "Scottish song": [],
        "Scots language": [
          "Scots",
          "Scots dialect"
        ],
        "Tells a story": [],
        "Repeated verse melody": [
          "Strophic",
          "Same melody each verse"
        ],
        "Solo voice": [],
        "Simple accompaniment or unaccompanied": [
          "Simple accompaniment",
          "Unaccompanied"
        ]
      }
    },
    {
      "id": "builtin-national-style-swing",
      "label": "Swing",
      "prompt": "Name features of swing music",
      "answers": [
        "Big band",
        "Swung rhythms",
        "Danceable pulse",
        "Riffs",
        "Call and response",
        "Trumpets",
        "Trombones",
        "Saxophones",
        "Rhythm section"
      ],
      "answerAliases": {
        "Big band": [],
        "Swung rhythms": [
          "Swung rhythm",
          "Swing rhythms"
        ],
        "Danceable pulse": [],
        "Riffs": [],
        "Call and response": [
          "Question and answer"
        ],
        "Trumpets": [],
        "Trombones": [],
        "Saxophones": [],
        "Rhythm section": []
      }
    },
    {
      "id": "builtin-national-style-aria",
      "label": "Aria",
      "prompt": "Name features of an aria",
      "answers": [
        "Solo song",
        "Found in opera",
        "Memorable melody",
        "Regular musical organisation",
        "Accompaniment",
        "Expresses feelings"
      ],
      "answerAliases": {
        "Solo song": [],
        "Found in opera": [
          "Opera"
        ],
        "Memorable melody": [],
        "Regular musical organisation": [],
        "Accompaniment": [],
        "Expresses feelings": [
          "Emotions",
          "Expressive"
        ]
      }
    },
    {
      "id": "builtin-national-style-bothy-ballad",
      "label": "Bothy Ballad",
      "prompt": "Name features of bothy ballad",
      "answers": [
        "North-East Scotland",
        "Farm workers",
        "Scots dialect",
        "Strophic",
        "Often unaccompanied",
        "Often male voice",
        "Story about work or local life"
      ],
      "answerAliases": {
        "North-East Scotland": [],
        "Farm workers": [
          "Farm work",
          "Farming"
        ],
        "Scots dialect": [],
        "Strophic": [],
        "Often unaccompanied": [
          "Unaccompanied",
          "A cappella"
        ],
        "Often male voice": [
          "Male voice",
          "Male singer"
        ],
        "Story about work or local life": [
          "Work",
          "Local life",
          "Tells a story"
        ]
      }
    },
    {
      "id": "builtin-national-style-celtic-rock",
      "label": "Celtic Rock",
      "prompt": "Name features of celtic rock",
      "answers": [
        "Celtic or Scottish folk influences",
        "Traditional melodies",
        "Traditional instruments",
        "Electric guitar",
        "Bass guitar",
        "Drum kit",
        "Amplified vocals"
      ],
      "answerAliases": {
        "Celtic or Scottish folk influences": [
          "Celtic",
          "Scottish folk",
          "Folk music"
        ],
        "Traditional melodies": [],
        "Traditional instruments": [],
        "Electric guitar": [
          "Electric guitars"
        ],
        "Bass guitar": [],
        "Drum kit": [
          "Drums"
        ],
        "Amplified vocals": []
      }
    },
    {
      "id": "builtin-national-style-chorus",
      "label": "Chorus",
      "prompt": "Name features of chorus",
      "answers": [
        "Group of singers",
        "Several vocal parts",
        "Part of a larger work",
        "Found in opera",
        "Comments on or participates in the story"
      ],
      "answerAliases": {
        "Group of singers": [
          "Choir",
          "Large group of singers"
        ],
        "Several vocal parts": [
          "Several parts",
          "Part singing"
        ],
        "Part of a larger work": [],
        "Found in opera": [
          "Opera"
        ],
        "Comments on or participates in the story": []
      }
    },
    {
      "id": "builtin-national-style-classical",
      "label": "Classical",
      "prompt": "Name features of classical music",
      "answers": [
        "Balanced phrases",
        "Clear melody",
        "Mostly homophonic",
        "Controlled dynamics",
        "Symphonies and concertos",
        "Mozart",
        "Haydn"
      ],
      "answerAliases": {
        "Balanced phrases": [],
        "Clear melody": [],
        "Mostly homophonic": [
          "Homophonic",
          "Homophony"
        ],
        "Controlled dynamics": [],
        "Symphonies and concertos": [
          "Symphony",
          "Concerto"
        ],
        "Mozart": [],
        "Haydn": []
      }
    },
    {
      "id": "builtin-national-style-gaelic-psalm",
      "label": "Gaelic Psalm",
      "prompt": "Name features of gaelic psalm",
      "answers": [
        "Scottish Gaelic",
        "Religious text",
        "Unaccompanied",
        "Precentor leads each line",
        "Congregation follows",
        "Ornamented overlapping voices",
        "Western Isles churches"
      ],
      "answerAliases": {
        "Scottish Gaelic": [
          "Gaelic"
        ],
        "Religious text": [
          "Religious",
          "Sacred"
        ],
        "Unaccompanied": [],
        "Precentor leads each line": [
          "Precentor",
          "Line leader"
        ],
        "Congregation follows": [
          "Congregation"
        ],
        "Ornamented overlapping voices": [],
        "Western Isles churches": []
      }
    },
    {
      "id": "builtin-national-style-gospel",
      "label": "Gospel",
      "prompt": "Name features of gospel music",
      "answers": [
        "Religious words",
        "Expressive vocals",
        "Solo and group singing",
        "Call and response",
        "Hand-clapping",
        "Strong rhythm",
        "Improvisation",
        "Popular-music instruments"
      ],
      "answerAliases": {
        "Religious words": [
          "Religious",
          "Christian",
          "Sacred"
        ],
        "Expressive vocals": [
          "Expressive singing",
          "Emotional singing"
        ],
        "Solo and group singing": [
          "Solo singing",
          "Group singing",
          "Choir"
        ],
        "Call and response": [
          "Question and answer"
        ],
        "Hand-clapping": [
          "Clapping"
        ],
        "Strong rhythm": [],
        "Improvisation": [],
        "Popular-music instruments": [
          "Popular instruments"
        ]
      }
    },
    {
      "id": "builtin-national-style-indian",
      "label": "Indian",
      "prompt": "Name features of indian music",
      "answers": [
        "Sitar",
        "Tabla",
        "Drone",
        "Improvised melody",
        "Ornamentation",
        "Repeating rhythmic cycles"
      ],
      "answerAliases": {
        "Sitar": [],
        "Tabla": [],
        "Drone": [],
        "Improvised melody": [
          "Improvisation",
          "Improvised tune"
        ],
        "Ornamentation": [],
        "Repeating rhythmic cycles": [
          "Rhythmic cycles",
          "Repeated rhythms"
        ]
      }
    },
    {
      "id": "builtin-national-style-minimalist",
      "label": "Minimalist",
      "prompt": "Name features of minimalist music",
      "answers": [
        "Short repeated patterns",
        "Gradual change",
        "Layered parts",
        "Adding or removing notes",
        "Shifting accents",
        "Changing harmony",
        "Phasing"
      ],
      "answerAliases": {
        "Short repeated patterns": [
          "Repeated patterns",
          "Repetition",
          "Ostinato"
        ],
        "Gradual change": [],
        "Layered parts": [
          "Layering"
        ],
        "Adding or removing notes": [
          "Adding notes",
          "Removing notes"
        ],
        "Shifting accents": [],
        "Changing harmony": [],
        "Phasing": []
      }
    },
    {
      "id": "builtin-national-style-pibroch",
      "label": "Pibroch",
      "prompt": "Name features of pibroch",
      "answers": [
        "Solo Highland bagpipes",
        "Theme and variations",
        "Increasingly elaborate variations",
        "Grace-note embellishments",
        "Continuous drones",
        "Ceol mor"
      ],
      "answerAliases": {
        "Solo Highland bagpipes": [
          "Bagpipes",
          "Highland bagpipes",
          "Solo bagpipes"
        ],
        "Theme and variations": [],
        "Increasingly elaborate variations": [],
        "Grace-note embellishments": [
          "Grace notes",
          "Ornaments"
        ],
        "Continuous drones": [
          "Drones",
          "Drone"
        ],
        "Ceol mor": [
          "Ceol mòr"
        ]
      }
    },
    {
      "id": "builtin-national-style-symphony",
      "label": "Symphony",
      "prompt": "Name features of a symphony",
      "answers": [
        "Orchestra",
        "Several movements",
        "Contrasting movements",
        "Often a fast opening movement",
        "Often four movements",
        "Often a slow movement"
      ],
      "answerAliases": {
        "Orchestra": [],
        "Several movements": [
          "Multiple movements"
        ],
        "Contrasting movements": [],
        "Often a fast opening movement": [
          "Fast first movement"
        ],
        "Often four movements": [
          "Four movements",
          "4 movements"
        ],
        "Often a slow movement": [
          "Slow movement"
        ]
      }
    },
    {
      "id": "builtin-national-style-waulking-song",
      "label": "Waulking Song",
      "prompt": "Name features of waulking song",
      "answers": [
        "Scottish Gaelic",
        "Work song",
        "Traditionally women singing",
        "Beating or fulling cloth",
        "Unaccompanied",
        "Steady pulse",
        "Call and response"
      ],
      "answerAliases": {
        "Scottish Gaelic": [
          "Gaelic"
        ],
        "Work song": [
          "Working song"
        ],
        "Traditionally women singing": [
          "Women",
          "Female voices"
        ],
        "Beating or fulling cloth": [
          "Fulling cloth",
          "Beating cloth",
          "Waulking cloth",
          "Cloth"
        ],
        "Unaccompanied": [],
        "Steady pulse": [],
        "Call and response": [
          "Question and answer"
        ]
      }
    }
  ]
});
