// Shared accepted wording for Family Fortunes answers across every level.
// Concept spellings also use the aliases in the project music knowledge bank.
(function () {
  const normalize = (value) => String(value || "").toLocaleLowerCase("en-GB")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[♯#]/g, " sharp ").replace(/♭/g, " flat ")
    .replace(/[’']/g, "").replace(/&/g, " and ")
    .replace(/\bseventh\b/g, "7th").replace(/\bsixth\b/g, "6th")
    .replace(/\bone\b/g, "1").replace(/\btwo\b/g, "2").replace(/\bthree\b/g, "3")
    .replace(/\bfour\b/g, "4").replace(/\bfive\b/g, "5").replace(/\bsix\b/g, "6")
    .replace(/\bseven\b/g, "7").replace(/\beight\b/g, "8").replace(/\bnine\b/g, "9")
    .replace(/\bten\b/g, "10").replace(/\beleven\b/g, "11").replace(/\btwelve\b/g, "12")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  const entries = {
  "Solo voice": [
    "One voice",
    "One singer",
    "Single voice",
    "Single singer",
    "A solo singer",
    "Solo vocalist"
  ],
  "Solo voices": [
    "Solo singers",
    "Vocal soloists",
    "Singing soloists"
  ],
  "Solo instrument": [
    "One instrument",
    "Single instrument",
    "Instrumental solo",
    "A solo instrument"
  ],
  "Solo": [
    "One performer",
    "Single performer",
    "Performed alone"
  ],
  "Romantic period": [
    "Romantic",
    "Romantic era",
    "Romantic music"
  ],
  "A tempo": [
    "Return to original speed",
    "Back to the original tempo",
    "Original tempo",
    "Resume original tempo"
  ],
  "Accompanied": [
    "With accompaniment",
    "Has accompaniment",
    "With instruments"
  ],
  "Accompaniment": [
    "Backing",
    "Instrumental backing"
  ],
  "Accordion": [
    "Accordian",
    "Accordions"
  ],
  "Acting": [
    "Acts",
    "Theatrical acting",
    "Drama"
  ],
  "Adagio": [
    "Slow",
    "Slow tempo"
  ],
  "Agnus Dei": [
    "Lamb of God"
  ],
  "Allegro": [
    "Fast",
    "Fast tempo"
  ],
  "Alto": [
    "Low female voice",
    "Low female singer"
  ],
  "American origins": [
    "America",
    "American",
    "USA",
    "United States"
  ],
  "Amplified sound": [
    "Amplification",
    "Amplified",
    "Loud amplified sound"
  ],
  "Amplified vocals": [
    "Amplified singing",
    "Microphone vocals",
    "Singing through microphones"
  ],
  "Andante": [
    "Walking pace",
    "Walking speed"
  ],
  "Answer": [
    "Fugue answer",
    "Answer of the fugue"
  ],
  "Antiphonal": [
    "Antiphony",
    "Alternating groups",
    "Groups alternate",
    "Alternating performers"
  ],
  "Appoggiatura": [
    "Appogiatura",
    "Leaning note",
    "Appoggiaturas"
  ],
  "Bach": [
    "J S Bach",
    "JS Bach",
    "Johann Sebastian Bach"
  ],
  "Bagpipes": [
    "Bagpipe",
    "Pipes",
    "Highland pipes"
  ],
  "Balanced phrases": [
    "Balanced phrasing",
    "Symmetrical phrases",
    "Regular phrases"
  ],
  "Baritone": [
    "Middle male voice",
    "Mid male voice"
  ],
  "Bass guitar": [
    "Electric bass guitar",
    "Bass guitars"
  ],
  "Bass moves steadily": [
    "Steady moving bass",
    "Steadily moving bass line",
    "Bass on each beat"
  ],
  "Basso continuo": [
    "Continuo",
    "Continuous bass",
    "Bass and chordal accompaniment"
  ],
  "Benedictus": [
    "Blessed is he"
  ],
  "Big band": [
    "Big bands",
    "Large jazz band",
    "Jazz big band"
  ],
  "Blowing": [
    "Blown",
    "Blow",
    "Using breath"
  ],
  "Bowing": [
    "Bowed",
    "Bow",
    "Using a bow"
  ],
  "Brass instruments": [
    "Brass",
    "Brass family"
  ],
  "Cadenza": [
    "Solo cadenza",
    "Unaccompanied virtuoso passage",
    "Virtuosic solo passage"
  ],
  "Canon": [
    "Canonic",
    "Melody imitated by another part"
  ],
  "Changing harmony": [
    "Changing chords",
    "Changes in harmony",
    "Harmony changes"
  ],
  "Chopin": [
    "Frederic Chopin",
    "Frédéric Chopin",
    "F Chopin"
  ],
  "Chorus": [
    "Choir",
    "Choral group",
    "Group of singers"
  ],
  "Clapping": [
    "Hand clapping",
    "Clap",
    "Claps"
  ],
  "Clear melody": [
    "Clear tune",
    "Clear melodic line"
  ],
  "Comments on or participates in the story": [
    "Comments on the story",
    "Participates in the story",
    "Comments on the action",
    "Takes part in the action"
  ],
  "Concertino": [
    "Small solo group",
    "Group of soloists",
    "Small group of soloists"
  ],
  "Controlled dynamics": [
    "Restrained dynamics",
    "Controlled volume changes"
  ],
  "Costumes": [
    "Costume",
    "Stage costumes",
    "Theatrical costumes"
  ],
  "Credo": [
    "Creed",
    "I believe"
  ],
  "Dance music": [
    "Music for dancing",
    "Dancing music"
  ],
  "Danceable pulse": [
    "Dance pulse",
    "Danceable beat"
  ],
  "Dancing": [
    "Dance",
    "Dances"
  ],
  "Drone": [
    "Sustained note",
    "Sustained notes",
    "Continuous note",
    "Continuous notes"
  ],
  "Expanded orchestra": [
    "Larger orchestra",
    "Large orchestra",
    "Bigger orchestra",
    "Increased orchestra size"
  ],
  "Expressive melody": [
    "Expressive tune",
    "Emotional melody",
    "Lyrical melody"
  ],
  "Fiddle": [
    "Violin",
    "Fiddles"
  ],
  "Folk groups": [
    "Folk group",
    "Folk ensemble",
    "Folk ensembles"
  ],
  "Gloria": [
    "Glory"
  ],
  "Gradual change": [
    "Slow changes",
    "Changes gradually",
    "Gradually changing"
  ],
  "Guitars": [
    "Guitar"
  ],
  "Handel": [
    "George Frideric Handel",
    "G F Handel",
    "GF Handel"
  ],
  "Harpsichord": [
    "Harpsichords",
    "Harpsicord"
  ],
  "Haydn": [
    "Joseph Haydn",
    "J Haydn"
  ],
  "Hip-hop": [
    "Hip hop",
    "Hiphop"
  ],
  "Increasingly elaborate variations": [
    "Elaborate variations",
    "More elaborate variations",
    "Progressively complex variations"
  ],
  "Influenced early jazz": [
    "Influence on jazz",
    "Early jazz influence",
    "Influenced jazz"
  ],
  "Keyboards": [
    "Keyboard",
    "Keyboard instruments"
  ],
  "Kyrie": [
    "Kyrie eleison",
    "Lord have mercy"
  ],
  "Legato": [
    "Smooth",
    "Smoothly",
    "Connected notes"
  ],
  "Liszt": [
    "Franz Liszt",
    "F Liszt"
  ],
  "Lively rhythms": [
    "Lively rhythmic patterns",
    "Energetic rhythms"
  ],
  "Memorable melody": [
    "Memorable tune",
    "Catchy melody",
    "Catchy tune"
  ],
  "Memorable songs": [
    "Catchy songs",
    "Memorable song",
    "Catchy song"
  ],
  "Moderato": [
    "Moderate speed",
    "Moderate tempo",
    "Moderately"
  ],
  "Mordent": [
    "Mordents",
    "Upper or lower mordent"
  ],
  "Mozart": [
    "W A Mozart",
    "WA Mozart",
    "Wolfgang Amadeus Mozart"
  ],
  "North-East Scotland": [
    "North east Scotland",
    "Northeast Scotland",
    "NE Scotland"
  ],
  "Often stresses beats two and four": [
    "Beats two and four",
    "Emphasis on two and four",
    "Beats 2 and 4",
    "Accent on beats 2 and 4"
  ],
  "Organ": [
    "Pipe organ",
    "Organs"
  ],
  "Ornamentation": [
    "Ornaments",
    "Decorative notes",
    "Embellishments"
  ],
  "Ornamented overlapping voices": [
    "Overlapping voices",
    "Ornamented voices",
    "Highly ornamented voices",
    "Free overlapping vocal lines"
  ],
  "Part of a larger work": [
    "Part of a bigger work",
    "Section of a larger work"
  ],
  "Phasing": [
    "Phase shifting",
    "Patterns gradually move out of phase"
  ],
  "Plucking": [
    "Plucked",
    "Pluck",
    "Plucking strings"
  ],
  "Prominent bass line": [
    "Strong bass line",
    "Prominent bass",
    "Strong bass",
    "Low bass line"
  ],
  "Regular musical organisation": [
    "Regular structure",
    "Organised structure",
    "Structured music"
  ],
  "Relaxed steady groove": [
    "Relaxed groove",
    "Steady groove",
    "Laid back groove"
  ],
  "Repeated grooves": [
    "Repeated groove",
    "Repeating groove",
    "Repetitive groove"
  ],
  "Repeated riffs": [
    "Repeated riff",
    "Repeating riffs",
    "Riffs"
  ],
  "Repeated sections": [
    "Repeating sections",
    "Repetition of sections"
  ],
  "Rhythm section": [
    "Rhythm instruments",
    "Jazz rhythm section"
  ],
  "Rhythmic singing": [
    "Rhythmical singing",
    "Singing rhythmically"
  ],
  "Ripieno": [
    "Full orchestra",
    "Larger group",
    "Large orchestral group",
    "Full orchestral group"
  ],
  "Ritornello": [
    "Returning theme",
    "Recurring theme",
    "Repeated main theme",
    "Returning main theme"
  ],
  "Round": [
    "Round song",
    "Rounds",
    "Sung round"
  ],
  "Sanctus": [
    "Holy"
  ],
  "Saxophone": [
    "Sax",
    "Saxophones"
  ],
  "Scenery": [
    "Stage scenery",
    "Sets",
    "Stage set",
    "Set"
  ],
  "Scots dialect": [
    "Scots",
    "Scottish dialect"
  ],
  "Scottish dance bands": [
    "Scottish dance band",
    "Dance band from Scotland"
  ],
  "Scottish song": [
    "Song from Scotland",
    "Scottish folk song"
  ],
  "Shifting accents": [
    "Changing accents",
    "Moving accents",
    "Accent shifts"
  ],
  "Singing": [
    "Sung",
    "Voices",
    "Vocal music"
  ],
  "Sitar": [
    "Sitars"
  ],
  "Small groups or big bands": [
    "Small groups",
    "Big bands",
    "Small jazz groups",
    "Jazz ensembles"
  ],
  "Small or large ensembles": [
    "Small ensembles",
    "Large ensembles",
    "Groups of different sizes"
  ],
  "Solo song": [
    "Song for one singer",
    "Song for a solo singer",
    "Solo vocal song"
  ],
  "Songs": [
    "Song"
  ],
  "Soprano": [
    "High female voice",
    "High female singer"
  ],
  "Staccato": [
    "Short detached notes",
    "Detached",
    "Short notes",
    "Short and detached"
  ],
  "Steady accompaniment": [
    "Regular accompaniment",
    "Steady backing"
  ],
  "Steady pulse": [
    "Steady beat",
    "Regular beat",
    "Regular pulse"
  ],
  "Story and characters": [
    "Develops the story",
    "Develops the characters",
    "Characters",
    "Storytelling"
  ],
  "Stretto": [
    "Overlapping subject entries",
    "Subjects overlap",
    "Overlapping entries"
  ],
  "Strong driving beat": [
    "Driving beat",
    "Strong beat",
    "Driving rhythm"
  ],
  "Strong rhythm": [
    "Strong rhythmic pulse",
    "Strong beat"
  ],
  "Strophic": [
    "Same music each verse",
    "Same melody each verse",
    "Repeated verse music"
  ],
  "Strumming": [
    "Strummed",
    "Strum",
    "Strumming chords"
  ],
  "Subject": [
    "Fugue subject",
    "Main theme of a fugue",
    "Fugue theme"
  ],
  "Tabla": [
    "Tablas",
    "Tabla drums"
  ],
  "Tells a story": [
    "Storytelling",
    "Narrative",
    "A story"
  ],
  "Tenor": [
    "High male voice",
    "High male singer"
  ],
  "Terraced dynamics": [
    "Sudden dynamic changes",
    "Sudden changes in volume",
    "Contrasting loud and quiet"
  ],
  "Traditional instruments": [
    "Folk instruments",
    "Traditional musical instruments"
  ],
  "Traditional melodies": [
    "Folk melodies",
    "Traditional tunes",
    "Folk tunes"
  ],
  "Trill": [
    "Trills",
    "Rapid alternation of adjacent notes"
  ],
  "Trombones": [
    "Trombone"
  ],
  "Trumpet": [
    "Trumpets"
  ],
  "Turn": [
    "Turns",
    "Note above main note below main note"
  ],
  "Unaccompanied": [
    "No accompaniment",
    "Without accompaniment",
    "No instruments",
    "A cappella"
  ],
  "Verse and chorus": [
    "Verses and choruses",
    "Verse chorus form"
  ],
  "Western Isles churches": [
    "Western Isles",
    "Hebrides",
    "Hebridean churches"
  ],
  "Wide dynamic range": [
    "Wide range of dynamics",
    "Large dynamic range",
    "Wide volume range"
  ],
  "Wind instruments": [
    "Wind",
    "Woodwind and brass"
  ],
  "One player per part": [
    "One performer per part",
    "One to a part",
    "One person per part"
  ],
  "Four SATB parts": [
    "Four voices",
    "4 voices",
    "Four vocal parts",
    "SATB"
  ],
  "Two violins": [
    "2 violins",
    "Two violin players",
    "First and second violins"
  ],
  "Speech-like singing": [
    "Sung speech",
    "Singing like speaking",
    "Speech like",
    "Like talking"
  ],
  "Piano accompaniment": [
    "Piano",
    "Accompanied by piano",
    "Piano backing"
  ],
  "Latin text": [
    "Latin words",
    "Latin lyrics",
    "Latin language",
    "Latin"
  ],
  "German text": [
    "German words",
    "German lyrics",
    "German language",
    "German"
  ],
  "English sacred text": [
    "English religious text",
    "English words",
    "English language",
    "English"
  ],
  "Scots language": [
    "Scots words",
    "Scots lyrics",
    "Scots dialect",
    "Scots"
  ],
  "Scottish Gaelic": [
    "Gaelic words",
    "Gaelic lyrics",
    "Gaelic language",
    "Gaelic"
  ],
  "Syllabic": [
    "One note per syllable",
    "1 note per syllable"
  ],
  "Melismatic": [
    "Several notes per syllable",
    "Many notes per syllable",
    "More than one note per syllable"
  ],
  "Monophonic": [
    "One melodic line",
    "Single melody",
    "One melody",
    "Single line"
  ],
  "Homophonic": [
    "Melody with chords",
    "Melody and accompaniment",
    "Chordal texture"
  ],
  "Polyphonic or contrapuntal": [
    "Independent melodies",
    "Multiple melodies",
    "Two or more melodies",
    "Polyphony",
    "Polyphonic",
    "Contrapuntal"
  ],
  "Arco": [
    "With a bow",
    "Using a bow",
    "Bowed",
    "Bowing"
  ],
  "Pizzicato": [
    "Plucked strings",
    "Plucking",
    "Plucked"
  ],
  "Con sordino": [
    "With a mute",
    "Using a mute",
    "Muted"
  ],
  "Harmonics": [
    "Harmonic",
    "Lightly touched strings",
    "High flute like string sounds"
  ],
  "Tremolando": [
    "Tremolo",
    "Rapid repeated note",
    "Rapid repeated notes"
  ],
  "Grace notes": [
    "Grace note",
    "Small decorative notes",
    "Small decorative note"
  ],
  "Countertenor": [
    "Counter tenor",
    "Very high male voice"
  ],
  "Improvisation": [
    "Improvising",
    "Improvised",
    "Made up on the spot",
    "Making it up"
  ],
  "Bass": [
    "Low male voice",
    "Low male singer"
  ],
  "Mezzo-soprano": [
    "Middle female voice",
    "Mid female voice",
    "Mezzo soprano",
    "Mezzo"
  ],
  "A cappella": [
    "Acappella",
    "A capella",
    "Without instruments",
    "Unaccompanied"
  ],
  "Unison": [
    "Same notes together",
    "Same melody together",
    "Everyone on the same notes"
  ],
  "Orchestra": [
    "Orchestral",
    "Orchestral ensemble"
  ],
  "Choir": [
    "Chorus",
    "Group of singers",
    "Choral"
  ],
  "Solo Highland bagpipes": [
    "One bagpiper",
    "Solo bagpiper",
    "Highland bagpipes",
    "Solo pipes"
  ],
  "Religious text": [
    "Sacred text",
    "Religious lyrics",
    "Religious words"
  ],
  "Secular text": [
    "Secular words",
    "Non religious text",
    "Non religious",
    "Secular"
  ],
  "Sacred": [
    "Religious",
    "Church music",
    "Worship music"
  ],
  "Strophic or through-composed": [
    "Strophic",
    "Through composed",
    "Through-composed"
  ],
  "Often followed by an aria": [
    "Aria follows",
    "Followed by an aria",
    "Then an aria"
  ],
  "Usually no conductor": [
    "No conductor",
    "Without a conductor",
    "Unconducted"
  ],
  "Small ensemble": [
    "Small group",
    "Few players",
    "Small instrumental group"
  ],
  "Usually four movements": [
    "Four movements",
    "4 movements"
  ],
  "Baroque origins": [
    "Baroque era",
    "Baroque period",
    "Baroque"
  ],
  "Renaissance origins": [
    "Renaissance period",
    "Renaissance era",
    "Renaissance"
  ],
  "Electronic instruments": [
    "Electronically produced",
    "Electronic sound",
    "Electronic sounds"
  ],
  "Synthesisers": [
    "Synthesizers",
    "Synths",
    "Synthesiser",
    "Synthesizer"
  ],
  "Programmed drums": [
    "Drum programming",
    "Drum machine",
    "Electronic drums"
  ],
  "Sequencers": [
    "Sequencer",
    "Sequencing"
  ],
  "Samples": [
    "Sample",
    "Sampling",
    "Sampled sounds"
  ],
  "Loops": [
    "Loop",
    "Looping",
    "Repeated loop"
  ],
  "Tone row or note row": [
    "Tone row",
    "Note row",
    "Twelve tone row",
    "12 tone row"
  ],
  "Duple metre": [
    "Duple meter",
    "Duple time",
    "Two beats in the bar",
    "2 beats in a bar"
  ],
  "Triple metre": [
    "Triple meter",
    "Triple time",
    "Three beats in the bar",
    "3 beats in a bar"
  ],
  "Twelve chromatic pitch classes": [
    "12 chromatic notes",
    "Twelve chromatic notes",
    "All twelve notes",
    "All 12 notes"
  ],
  "Question and answer": [
    "Question",
    "Answer"
  ],
  "Accent / accented": [
    "Accent",
    "Accented"
  ],
  "Beat / pulse": [
    "Beat",
    "Pulse"
  ],
  "Ostinato / riff": [
    "Ostinato",
    "Riff"
  ],
  "Broken chord / arpeggio": [
    "Broken chord",
    "Arpeggio"
  ],
  "Simple time (2/4, 3/4 and 4/4)": [
    "Simple time"
  ],
  "Compound time (6/8, 9/8 and 12/8)": [
    "6/8",
    "9/8",
    "12/8"
  ],
  "Jazz funk": [
    "Jazz-funk"
  ],
  "Musique concrète": [
    "Musique concrete"
  ],
  "Mode / modal": [
    "Mode",
    "Modal"
  ],
  "Ayre / air": [
    "Ayre",
    "Air"
  ],
  "Electronic dance music (EDM)": [
    "EDM",
    "Electronic dance music"
  ],
  "Neoclassical": [
    "Neo-classical"
  ],
  "Augmented triad": [
    "Augmented chord"
  ],
  "Polytonality / bitonality": [
    "Polytonality",
    "Bitonality"
  ],
  "Tone row / note row": [
    "Tone row",
    "Note row"
  ],
  "Leitmotif": [
    "Leitmotiv"
  ],
  "A minor": [
    "Aminor",
    "Am",
    "A minor key"
  ],
  "C major": [
    "Cmajor",
    "Cmaj",
    "C major key"
  ],
  "F major": [
    "Fmajor",
    "Fmaj",
    "F major key"
  ],
  "G major": [
    "Gmajor",
    "Gmaj",
    "G major key"
  ],
  "Brass": [
    "Brass family",
    "Brass instruments"
  ],
  "Percussion": [
    "Percussion family",
    "Percussion instruments"
  ],
  "Strings": [
    "String family",
    "String instruments",
    "String section"
  ],
  "Woodwind": [
    "Woodwinds",
    "Woodwind family",
    "Woodwind instruments"
  ],
  "Ceol mor": [
    "Ceol mòr",
    "Ceolmor",
    "Great music"
  ],
  "Puirt-a-beul": [
    "Puirt a beul",
    "Puirtabeul",
    "Mouth music"
  ],
  "Contrasting movements": [
    "Different tempi in different movements",
    "Movements contrast",
    "Movements with different characters"
  ],
  "Flexible tempo": [
    "Flexible speed",
    "Freedom of tempo",
    "Rubato"
  ],
  "Inversion": [
    "Inverted",
    "Upside down intervals",
    "Row turned upside down"
  ],
  "Lively tempo": [
    "Lively",
    "Fast tempo",
    "Fast",
    "Quick"
  ],
  "Retrograde": [
    "Backwards",
    "Row backwards",
    "Reversed tone row"
  ],
  "Riffs": [
    "Riff",
    "Repeated short pattern",
    "Repeated pattern"
  ],
  "Rubato": [
    "Tempo rubato",
    "Flexible tempo",
    "Flexible speed",
    "Expressive freedom of tempo"
  ],
  "Saxophones": [
    "Saxophone",
    "Sax",
    "Saxes"
  ],
  "Trumpets": [
    "Trumpet"
  ],
  "Theme and variations": [
    "Theme and variation",
    "Variations on a theme",
    "Theme with variations"
  ]
};
  const bank = new Map(Object.entries(entries).map(([answer, aliases]) => [normalize(answer), aliases]));
  const dynamicAliases = {
    Pianissimo: ["pp", "very quiet", "very soft"], Piano: ["p", "quiet", "soft"],
    "Mezzo piano": ["mp", "moderately quiet", "moderately soft"],
    "Mezzo forte": ["mf", "moderately loud"], Forte: ["f", "loud"],
    Fortissimo: ["ff", "very loud"], Sforzando: ["sfz", "sudden accent", "suddenly accented"],
    Crescendo: ["cresc", "cres", "gradually louder", "getting louder"],
    Diminuendo: ["dim", "decrescendo", "gradually quieter", "getting quieter"],
  };
  const variantsFor = (round, answer) => {
    const key = normalize(answer);
    const dynamics = round.id === "builtin-concept-recall-dynamics" || normalize(round.label) === "dynamics";
    const variants = [answer, ...(round.answerAliases?.[answer] || [])];
    if (dynamics) variants.push(...(dynamicAliases[answer] || []));
    else {
      variants.push(...(bank.get(key) || []));
      // Qualifiers describe typical features, not a word required in the response.
      const unqualified = String(answer).replace(/^(?:often|usually|may have|may include|may use|may also be|mostly)\s+/i, "");
      if (unqualified !== answer) variants.push(unqualified, ...(bank.get(normalize(unqualified)) || []));
      if (key === "piano") variants.push("pianoforte", "acoustic piano");
      // These suffixes occur in the authored facts and their short concept names.
      for (const suffix of [" period", " origins", " harmony", " texture", " scales"]) {
        if (key.endsWith(suffix)) {
          const short = key.slice(0, -suffix.length);
          variants.push(short, ...(bank.get(short) || []));
        }
      }
    }
    return [...new Set(variants.map(normalize).filter(Boolean))];
  };
  const normalizeResponse = (value) => normalize(value)
    .replace(/^(?:it is|its|there is|there are|it has|it uses|they use|they have|uses|has|with)\s+/, "")
    .replace(/^(?:a|an|the)\s+/, "");
  const matchIndex = (round, response, revealed = []) => {
    const guess = normalizeResponse(response);
    if (!guess) return -1;
    // A canonical answer takes priority over another answer's optional wording.
    let index = round.answers.findIndex((answer) => normalizeResponse(answer) === guess);
    if (index < 0) index = round.answers.findIndex((answer) => variantsFor(round, answer).some((variant) => normalizeResponse(variant) === guess));
    return index >= 0 && !revealed.includes(index) ? index : -1;
  };
  window.FAMILY_FORTUNES_ANSWERS = { normalize, variantsFor, matchIndex };
})();
