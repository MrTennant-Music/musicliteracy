#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  REPOSITORY_ROOT,
  KNOWLEDGE_BANK_FILENAME,
  KNOWLEDGE_BANK_PATH,
  OUTPUT_DIRECTORY,
  RUNTIME_BANK_PATH,
  EDITOR_SLOTS_PATH,
  MEDIUM_FEATURE_DIRECTORY,
  loadManualQuestionOverrides,
  LEVELS,
  LEVEL_CODES,
  LEVEL_FILENAMES,
  DIFFICULTIES,
  DIFFICULTY_RANGES,
  CONCEPT_IDENTIFICATION_PROMPT,
  sha256File,
  sha256Text,
  normaliseText,
  normaliseStem,
  conceptTerms,
  hintForbiddenTerms,
  maskConceptTerms,
  ensureTerminalPunctuation,
  conceptQuestionPresentation,
  compactFact,
  humaniseIdentifier,
  questionId,
  senseRule,
  strongHintKey,
  loadStrongHints,
  loadKnowledgeBank,
} = require("./question-bank-common.js");

const STRONG_HINTS = loadStrongHints();

const EXPECTED_VALIDATION = {
  sourceSha256: "1b8ae6e92b1889f3aceba17da7acbe721874ebed637866e55030a54e7860053e",
  schemaVersion: "5.0",
  concepts: 300,
  facts: 710,
  comparisonGroups: 44,
  multipleSenseConcepts: 15,
  levelBreakdown: {
    "National 3": 68,
    "National 4": 75,
    "National 5": 70,
    Higher: 48,
    "Advanced Higher": 39,
  },
};

function numberedIds(prefix, start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => `${prefix}${String(start + index).padStart(3, "0")}`);
}

const CHORD_II_LITERACY_IDS = [
  "ah-literacy-hard-chord-004", "ah-literacy-hard-chord-005",
  "ah-literacy-hard-chord-018", "ah-literacy-hard-chord-019",
  "ah-literacy-hard-chord-032", "ah-literacy-hard-chord-033",
  "ah-literacy-hard-chord-046", "ah-literacy-hard-chord-047",
  "ah-literacy-hard-chord-060", "ah-literacy-hard-chord-061",
];
const CHORD_II_LITERACY_ID_SET = new Set(CHORD_II_LITERACY_IDS);

// Every entry below was manually checked against an existing stable local ID.
// Source files stay attached to their IDs because short IDs such as "perfect",
// "Tone" and "2/4" are only unambiguous inside their own component namespace.
const CURATED_LITERACY_TARGETS = {
  "MC-0010": [{ sourceFile: "practicequestions.html", localIds: ["chord"], matchKind: "exact-component-id" }],
  "MC-0015": [{ sourceFile: "millionaire-question-bank.js", localIds: ["n3-literacy-027"], matchKind: "exact-question-answer" }],
  "MC-0018": [{
    sourceFile: "millionaire-question-bank.js",
    localIds: [...numberedIds("n4-literacy-medium-", 9, 14), ...numberedIds("n4-literacy-medium-", 30, 33)],
    matchKind: "exact-question-answer",
  }],
  "MC-0019": [{ sourceFile: "millionaire-question-bank.js", localIds: ["n3-literacy-015"], matchKind: "exact-question-answer" }],
  "MC-0020": [{ sourceFile: "timesig.html", localIds: ["2/4", "3/4", "4/4"], matchKind: "exact-component-id" }],
  "MC-0021": [{ sourceFile: "practicequestions.html", localIds: ["accent"], matchKind: "exact-component-id" }],
  "MC-0022": [{ sourceFile: "practicequestions.html", localIds: ["adagio"], matchKind: "exact-component-id" }],
  "MC-0023": [{ sourceFile: "practicequestions.html", localIds: ["allegro"], matchKind: "exact-component-id" }],
  "MC-0036": [{
    sourceFile: "millionaire-question-bank.js",
    localIds: [...numberedIds("n5-literacy-medium-", 17, 20), "h-literacy-easy-020"],
    matchKind: "exact-question-answer",
  }],
  "MC-0053": [{ sourceFile: "practicequestions.html", localIds: ["slur"], matchKind: "reviewed-alias-component-id" }],
  "MC-0060": [{ sourceFile: "practicequestions.html", localIds: ["staccato"], matchKind: "exact-component-id" }],
  "MC-0080": [{ sourceFile: "practicequestions.html", localIds: ["broken_chords"], matchKind: "reviewed-listed-name-component-id" }],
  "MC-0086": [{
    sourceFile: "millionaire-question-bank.js",
    localIds: [...numberedIds("n5-literacy-medium-", 17, 20), "h-literacy-easy-020"],
    matchKind: "exact-question-answer",
  }],
  "MC-0097": [{ sourceFile: "practicequestions.html", localIds: ["andante"], matchKind: "exact-component-id" }],
  "MC-0098": [{ sourceFile: "timesig.html", localIds: ["6/8", "9/8", "12/8"], matchKind: "exact-component-id" }],
  "MC-0099": [{
    sourceFile: "rhythmsums.html",
    localIds: ["dotted-minim", "dotted-crotchet", "dotted-quaver", "dotted-quaver-semiquaver"],
    matchKind: "exact-component-id",
  }],
  "MC-0102": [{ sourceFile: "rhythmsums.html", localIds: ["scotch-snap"], matchKind: "exact-component-id" }],
  "MC-0103": [{ sourceFile: "timesig.html", localIds: ["2/4", "3/4", "4/4"], matchKind: "exact-component-id" }],
  "MC-0105": [{ sourceFile: "barlines.html", localIds: ["syncopation"], matchKind: "exact-component-id" }],
  "MC-0165": [{ sourceFile: "cadences.html", localIds: ["imperfect"], matchKind: "exact-component-id" }],
  "MC-0169": [{ sourceFile: "cadences.html", localIds: ["perfect"], matchKind: "exact-component-id" }],
  "MC-0171": [{ sourceFile: "accidentals.html", localIds: ["Semitone"], matchKind: "exact-answer-id" }],
  "MC-0173": [{ sourceFile: "accidentals.html", localIds: ["Tone"], matchKind: "exact-answer-id-for-reviewed-interval-sense" }],
  "MC-0176": [{ sourceFile: "timesig.html", localIds: ["6/8", "9/8", "12/8"], matchKind: "exact-component-id" }],
  "MC-0178": [{ sourceFile: "practicequestions.html", localIds: ["moderato"], matchKind: "exact-component-id" }],
  "MC-0227": [{ sourceFile: "practicequestions.html", localIds: ["add6"], matchKind: "exact-component-id" }],
  "MC-0228": [{ sourceFile: "practicequestions.html", localIds: ["dim7"], matchKind: "exact-component-id" }],
  "MC-0230": [{ sourceFile: "practicequestions.html", localIds: ["dom7"], matchKind: "exact-component-id" }],
  "MC-0232": [{ sourceFile: "cadences.html", localIds: ["interrupted"], matchKind: "exact-component-id" }],
  "MC-0233": [{
    sourceFile: "millionaire-question-bank.js",
    localIds: numberedIds("h-literacy-easy-", 14, 20),
    matchKind: "exact-question-set",
  }],
  "MC-0238": [{ sourceFile: "cadences.html", localIds: ["plagal"], matchKind: "exact-component-id" }],
  "MC-0246": [{ sourceFile: "barlines.html", localIds: ["time-changes"], matchKind: "exact-component-id" }],
  "MC-0247": [{
    sourceFile: "rhythmsums.html",
    localIds: ["triplet-quavers", "triplet-crotchets"],
    matchKind: "exact-component-id",
  }],
  "MC-0277": [{ sourceFile: "practicequestions.html", localIds: ["aug"], matchKind: "exact-component-id" }],
  "MC-0278": [{ sourceFile: "millionaire-question-bank.js", localIds: CHORD_II_LITERACY_IDS, matchKind: "reviewed-exact-question-set" }],
  "MC-0279": [{
    sourceFile: "millionaire-question-bank.js",
    localIds: numberedIds("ah-literacy-hard-chord-", 1, 106).filter((id) => !CHORD_II_LITERACY_ID_SET.has(id)),
    matchKind: "reviewed-exact-question-set",
  }],
  "MC-0283": [{
    sourceFile: "intervals.html",
    localIds: [
      "tritone-f-b", "augmented-4th-c-fsharp", "augmented-4th-g-csharp",
      "diminished-5th-b-f", "diminished-5th-e-bflat", "diminished-5th-a-eflat",
    ],
    matchKind: "exact-component-id",
  }],
};

const TYPE_HINTS = {
  articulation: [
    "Decide whether the notes should connect, separate or receive extra emphasis.",
    "Focus on the attack and the amount of space heard between notes.",
    "Imagine how a performer shapes the beginning and ending of each note.",
  ],
  instrument: [
    "Focus on how the sound is produced and on the instrument's usual register.",
    "Picture the performer and decide whether the sound is blown, bowed, plucked, struck or made electronically.",
    "Use the playing method and tone quality to rule out the other instruments.",
  ],
  instrument_family: [
    "Group the options by their shared method of producing sound.",
    "Think about how every member of the family starts its sound.",
    "The family is defined by musical function and sound production, not simply by what the instruments are made from.",
  ],
  instrumental_technique: [
    "Imagine the exact action the performer makes to create the sound.",
    "Focus on what the player's hands, bow, breath or equipment are doing.",
    "Match the physical playing action to the resulting sound.",
  ],
  tempo_marking: [
    "Match the speed word to the pace described.",
    "Think of the marking as an instruction about the music's basic speed.",
    "Rule out words that describe a change of speed rather than a steady tempo.",
  ],
  tempo_change_or_instruction: [
    "Track whether the pulse becomes quicker, becomes slower or returns to its earlier speed.",
    "This is about a change in pace, not a fixed tempo marking.",
    "Follow the direction of the speed change from beginning to end.",
  ],
  rhythmic_device: [
    "Place the feature against a steady pulse and notice where the emphasis falls.",
    "Count the beats evenly, then compare the rhythm with that pulse.",
    "Focus on the rhythm's pattern of long, short, strong and weak sounds.",
  ],
  pulse_or_metre: [
    "Count how the steady beats are grouped into bars.",
    "Separate the underlying pulse from the rhythm played over it.",
    "Look for the option that explains the beat grouping rather than a melody or instrument.",
  ],
  melodic_device: [
    "Follow what happens to the melodic idea when it returns.",
    "Compare the shape and pitch level of the musical idea each time it appears.",
    "Decide whether the notes repeat exactly, move to a new pitch or answer another phrase.",
  ],
  melodic_movement: [
    "Check whether the melody moves to a neighbouring note or skips over notes.",
    "Trace the distance from one pitch to the next.",
    "Focus on the size of the movement, not whether it travels up or down.",
  ],
  pitch_direction: [
    "Imagine the notes on a stave and follow their vertical direction.",
    "Track whether each new pitch is higher or lower than the last.",
    "The clue concerns direction of pitch, not the size of each interval.",
  ],
  scale_or_tonality: [
    "Focus on the organisation of pitches and the tonal centre they suggest.",
    "Use the pattern of notes and intervals rather than an emotional stereotype.",
    "Ask how the selected pitches relate to a central or home note.",
  ],
  chord_type: [
    "Identify the interval pattern inside the chord.",
    "Work from the chord's notes and the quality they create together.",
    "Compare the chord's root, third, fifth and any added notes.",
  ],
  cadence: [
    "Concentrate on the last two chords and the strength of the ending they create.",
    "Think about whether the phrase sounds finished, unfinished or unexpectedly diverted.",
    "The harmonic movement at the end of the phrase is the key clue.",
  ],
  accompaniment_or_sustained_pattern: [
    "Follow the supporting part while the melody or harmony changes above it.",
    "Decide whether the background idea is held, repeated or built from changing chord notes.",
    "Focus on the recurring or sustained layer beneath the main material.",
  ],
  accompaniment_pattern: [
    "Follow the order in which the notes of the supporting chord are played.",
    "Think about whether chord notes sound together or one after another.",
    "Focus on the pattern underneath the melody.",
  ],
  texture_or_imitative_device: [
    "Track how many parts are active and how their musical ideas relate.",
    "Notice whether parts move together or enter with related material at different times.",
    "Compare the timing and independence of the musical lines.",
  ],
  musical_form: [
    "Write the section letters in order and look for returns of earlier material.",
    "Follow the complete order of contrasting and repeated sections.",
    "The arrangement of sections is more important than the instruments used.",
  ],
  structural_section: [
    "Locate the section by what comes immediately before and after it.",
    "Think about the job this passage performs in the larger form.",
    "Follow the order of themes and transitions through the work.",
  ],
  musical_style: [
    "Match the combined rhythm, instruments, harmony and texture rather than relying on one clue alone.",
    "Look for the style whose characteristic musical features fit every detail.",
    "Use the groove, sound sources and performing approach to narrow the options.",
  ],
  historical_or_compositional_style: [
    "Use the musical language, texture and instruments; no date is needed.",
    "Identify the style from how the music is constructed and performed.",
    "Compare characteristic harmony, texture and instrumentation rather than historical years.",
  ],
  dance: [
    "Count the metre and match it to the characteristic dance rhythm.",
    "Use the beat grouping, pace and rhythmic pattern together.",
    "Imagine the steps: the metre and accent pattern provide the strongest clues.",
  ],
  ensemble: [
    "Identify the group from the combination of performers or instruments.",
    "Count the performing forces and match their roles to the ensemble.",
    "Focus on who performs together, not on the title of an individual instrument.",
  ],
  voice_type: [
    "Place the voice within the usual high-to-low vocal range.",
    "Compare register and vocal role rather than volume.",
    "Think about the singer's relative range within a choir or solo setting.",
  ],
  vocal_genre: [
    "Use the performing forces, text and dramatic or sacred setting together.",
    "Decide how the voices function within the larger work.",
    "Focus on the type of vocal piece and how it is performed.",
  ],
  vocal_technique: [
    "Concentrate on how the singer produces or shapes the vocal line.",
    "Match the treatment of words and pitches to the named technique.",
    "Think about what the voice is doing, not merely the style of the accompaniment.",
  ],
  ornament: [
    "Look at how the main note is decorated by nearby notes.",
    "Focus on the order and speed of the added notes around the principal pitch.",
    "Compare the small decorative figures attached to one main note.",
  ],
  electronic_or_timbre_effect: [
    "Follow how technology changes the original sound's colour or shape.",
    "Decide whether the effect alters tone quality, pitch, duration or repetition.",
    "Imagine the untreated sound first, then identify the electronic change.",
  ],
  fugue_component: [
    "Follow the order in which the main fugue idea enters in different voices.",
    "Decide whether the line presents, answers or accompanies the main theme.",
    "Use the function of the line within the fugue texture.",
  ],
  chord_progression: [
    "Follow the chord roots in order and notice which harmonies return.",
    "Think in Roman numerals and track the route from one chord to the next.",
    "Use the order of the harmonies, not just the quality of one chord.",
  ],
  ensemble_role: [
    "Ask whether the clue describes the featured smaller group or the full ensemble.",
    "Focus on the job performed by this group within the larger ensemble.",
    "Compare the number and prominence of the players in each group.",
  ],
  fugue_or_sonata_subject: [
    "Use the named form to decide which principal theme is being discussed.",
    "Identify the theme's structural role before choosing the terminology.",
    "Check whether the context is a fugue, sonata form or a general principal theme.",
  ],
  harmonic_change: [
    "Follow what changes in the harmony and where the new tonal centre settles.",
    "Decide whether the clue describes a new chord, a new key or a return home.",
    "Track the harmonic movement from its starting point to its destination.",
  ],
  harmonic_object: [
    "Focus on which pitches sound together and how closely they are spaced.",
    "Separate the actual group of notes from the broader harmony it creates.",
    "Count and compare the simultaneous pitches before naming the result.",
  ],
  instrumental_genre: [
    "Use the performing forces and the plan of contrasting movements together.",
    "Decide who the work is written for before considering its movement structure.",
    "The combination of soloist, ensemble and movement plan is the strongest clue.",
  ],
  interval_or_pitch_unit: [
    "Measure the distance between the pitches in letter names or semitones.",
    "Count the pitch distance carefully rather than judging register alone.",
    "Think about the exact size of the gap between the two notes.",
  ],
  performance_role: [
    "Decide whether the part is featured, supporting or shared equally.",
    "Focus on the performer's musical job within the complete texture.",
    "Ask which line is prominent and which parts provide support.",
  ],
  pitch_effect: [
    "Follow whether the pitch stays fixed, bends, slides or changes electronically.",
    "Concentrate on the direction and continuity of the pitch change.",
    "Imagine the pitch trace from the start of the sound to its end.",
  ],
  serial_or_transformational_technique: [
    "Track whether the note order, interval direction or starting pitch changes.",
    "Compare the transformed version with the original one interval by interval.",
    "Distinguish reversing the order from reversing the direction of intervals.",
  ],
  sound_source: [
    "Identify whether the sound begins with a voice, instrument, recording or electronic generator.",
    "Focus on the original source of the sound before any effects are applied.",
    "Separate how the sound is created from how it is later altered.",
  ],
};

// Most concepts can use the guidance for their broad type. Fugue needs more
// specific advice because section-letter guidance (useful for forms such as
// binary and rondo) would point pupils towards the wrong listening strategy.
const CONCEPT_HINTS = {
  "MC-0016": [
    "Listen for one phrase that seems to ask and a second phrase that responds.",
    "One phrase sounds unfinished; the next balances or completes it.",
    "Think of a musical conversation between two phrases.",
  ],
  "MC-0017": [
    "Check whether the musical idea comes back unchanged at the same pitch.",
    "Compare the returning idea's pitch pattern and rhythm with its first appearance.",
    "Look for an exact return rather than the same shape shifted higher or lower.",
  ],
  "MC-0024": [
    "A metronome marks this regular underlying unit.",
    "Tempo tells you how quickly these steady units pass.",
    "Count the regular units rather than the changing note lengths.",
  ],
  "MC-0030": [
    "Imagine a performer briefly taking control of the written duration.",
    "The curved arch and dot tell the player that the normal count is suspended.",
    "Think of a moment where the conductor decides when the music continues.",
  ],
  "MC-0042": [
    "Think of a portable keyboard instrument whose airflow comes from the player's arms.",
    "One hand can shape the melody while the other supplies bass and chords.",
    "The instrument expands and contracts as it is played.",
  ],
  "MC-0046": [
    "Imagine hair being drawn across a string to keep the sound going.",
    "The Italian marking arco tells a string player to use this technique.",
    "Contrast a sustained string sound with one made by pulling and releasing the string.",
  ],
  "MC-0051": [
    "The name changes with the performing tradition, not with the instrument's construction.",
    "Picture a Scottish reel played on the smallest standard orchestral string instrument.",
    "Think of a bowed string instrument in a traditional or folk setting.",
  ],
  "MC-0062": [
    "Rule out techniques that rely on air, friction or a continuous movement.",
    "Think of the sudden contact at the start of a drum sound.",
    "Compare this action with blowing, bowing, plucking, scraping and shaking.",
  ],
  "MC-0072": [
    "Think of a voice supplying dance rhythms without instruments.",
    "Rhythmic syllables can take the role that a dance band would normally play.",
    "The performer uses Gaelic or nonsense syllables to imitate lively instrumental patterns.",
  ],
  "MC-0080": [
    "Picture the harmony spreading across time rather than arriving as one block.",
    "The individual chord members form a flowing accompaniment pattern.",
    "Contrast a block chord with the same pitches unfolded through time.",
  ],
  "MC-0092": [
    "The answer concerns the overall pitch centre, not one chord in isolation.",
    "Think of the musical equivalent of a home address for pitch.",
    "Ask where the harmony feels settled after moving away.",
  ],
  "MC-0101": [
    "Follow a gradual decrease in speed rather than an immediate change.",
    "The pulse eases back over a passage instead of returning to an earlier tempo.",
    "Imagine the music applying the brakes little by little.",
  ],
  "MC-0129": [
    "Imagine the same instrument heard through a filter that changes its tone colour.",
    "Think of the accessory a brass player may place in the bell.",
    "The sound colour changes even though the instrument and written pitch stay the same.",
  ],
  "MC-0172": [
    "Count how many notes carry each individual unit of the text.",
    "The words remain clear because one text unit is not stretched across many pitches.",
    "Think of one note for each small spoken unit.",
  ],
  "MC-0174": [
    "Imagine two neighbouring pitches fluttering rapidly back and forth.",
    "The decoration alternates rather than approaching the main note only once.",
    "Look for a wavy marking above the note and a rapid two-note effect.",
  ],
  "MC-0176": [
    "The upper number in its common time signatures is a multiple of three greater than three.",
    "Try counting ONE-two-three, TWO-two-three.",
    "Tap the main pulse slowly while saying three quicker syllables inside each tap.",
  ],
  "MC-0207": [
    "Picture a string player setting the bow aside and using a fingertip.",
    "The attack is clear and the sound dies away more quickly than a bowed note.",
    "Contrast a plucked string sound with a sustained bowed sound.",
  ],
  "MC-0221": [
    "Think of one unaccompanied sacred melody shaped by the words rather than bar lines.",
    "All singers follow the same modal melodic line instead of singing harmony.",
    "The rhythm flows with Latin text rather than a regular metre.",
  ],
  "MC-0254": [
    "Follow the three-stage journey: present the main ideas, explore them, then bring them home.",
    "The final main stage restores both subjects in the tonic.",
    "Think of musical ideas being introduced, transformed and returned.",
  ],
  "MC-0288": [
    "In this context, it carries the music from the first subject group towards the second.",
    "Its job is to connect two subject groups while changing key.",
    "It builds momentum between the exposition's two main subjects.",
  ],
  "MC-0286": [
    "In a fugue, the second voice normally enters at the dominant.",
    "Compare the next voice's entry with the original subject.",
    "Decide whether the next entry is a real or tonal form.",
  ],
  "MC-0290": [
    "Track how the main musical idea enters successively in independent voices.",
    "Listen for entries of the opening idea and contrasting passages between them.",
    "Focus on how independent contrapuntal voices develop and imitate the main idea.",
  ],
};

// These concepts have more than one approved meaning. Their broad concept
// type does not always describe both senses, so the hint must follow the
// specific sense attached to the question's primary fact.
const SENSE_HINTS = {
  "MC-0083|MC-0083-S02": [
    "Focus on the continuous low-pitched pipes that accompany the chanter.",
    "Distinguish the melody pipe from the pipes that sustain the background pitches.",
    "Think about which pipes provide the steady background sound.",
  ],
  "MC-0225|MC-0225-S02": [
    "Use the movement plan and the fact that the music is written for four string players.",
    "Focus on the composition rather than the group of performers itself.",
    "Connect the work's four interacting parts with its usual multi-movement plan.",
  ],
  "MC-0225|MC-0225-S01": [
    "Count two upper string parts, one middle string part and one lower string part.",
    "Focus on four performers from the bowed-string family.",
    "The group contains two violins, one viola and one cello.",
  ],
  "MC-0291|MC-0291-S02": [
    "Look at which chord member is sounding as the bass note.",
    "Identify whether the root, third or fifth is the lowest note of the chord.",
    "The bass note determines the chord's position.",
  ],
  "MC-0299|MC-0299-S02": [
    "Use the movement plan together with the three instruments for which the work is written.",
    "Focus on the chamber composition rather than the performers as a group.",
    "Connect the work's three instrumental parts with its usual fast-slow-fast plan.",
  ],
};

const ORCHESTRAL_FAMILY_CONCEPT_IDS = new Set(["MC-0047", "MC-0056", "MC-0063", "MC-0068"]);

// Pupil-facing answer sets explicitly reviewed for a particular question.
const QUESTION_DISTRACTOR_OVERRIDES = {
  "MC-0056|MC-0056-F01|Easy": ["Strings", "Woodwind", "Brass"],
  "MC-0086|MC-0086-F01|Easy": ["Major", "Minor", "Tonality"],
};

// This reviewed editorial layer keeps clues grammatical, answer-neutral and
// short enough for the Millionaire question panel.
const FACT_CLUE_OVERRIDES = {
  "MC-0004-F03": "Unlike most opera, it commonly combines spoken dialogue with theatre- or popular-style singing.",
  "MC-0008-F02": "Common instruments include fiddle, accordion and bagpipes, while common ensembles include folk groups and traditional dance bands.",
  "MC-0009-F02": "A scale or melody moving in this direction travels from a lower register towards a higher one.",
  "MC-0010-F03": "A three-note example is called a triad.",
  "MC-0010-F02": "These simultaneous groups of notes create harmony and can support, colour or accompany a melody.",
  "MC-0011-F02": "A sequence of these movements between chords creates a progression and shapes the harmony beneath a melody.",
  "MC-0012-F02": "A scale or melody moving in this direction travels from a higher register towards a lower one.",
  "MC-0013-F02": "The clashing tension may later resolve to a smoother, more settled chord.",
  "MC-0014-F01": "The performer creates music during the performance rather than playing a fully written part.",
  "MC-0014-F02": "Chords, a scale or an agreed structure may guide the performer.",
  "MC-0015-F02": "A melody skips one or more neighbouring scale notes, creating a larger pitch movement than a step.",
  "MC-0016-F01": "An opening musical phrase is followed by a responding phrase.",
  "MC-0016-F02": "The two phrases often balance through similar length or rhythm, while the response may complete, contrast with or imitate the opening.",
  "MC-0017-F01": "A musical idea returns without changing its pitch pattern or rhythm.",
  "MC-0017-F02": "The exact return may occur in melody, rhythm or structure.",
  "MC-0019-F02": "Movement to a neighbouring scale note is the smallest ordinary movement within that scale and contrasts with a larger skip.",
  "MC-0021-F01": "A note or beat receives extra emphasis, so it stands out from those around it.",
  "MC-0022-F02": "Music with this marking should move at a calm, unhurried speed.",
  "MC-0023-F02": "Music with this marking should move with energy and forward motion.",
  "MC-0024-F01": "The regular underlying foundation of the music is the steady pattern that a listener might tap or clap along with.",
  "MC-0024-F03": "These steady units are commonly grouped in twos, threes or fours, with the first one carrying the main stress.",
  "MC-0024-F02": "Tempo describes how quickly the steady underlying pattern moves.",
  "MC-0027-F02": "Music of this type is designed to support coordinated movement and often uses clear accents and percussion.",
  "MC-0027-F03": "Scottish examples are often performed by pipe bands, solo pipers, fiddle groups or Scottish dance bands.",
  "MC-0028-F02": "Patterns that emphasise weaker parts of the pulse or spaces between main beats can create lift, surprise or syncopated energy.",
  "MC-0029-F02": "Playing aligned directly with the main pulse reinforces the metre and usually sounds rhythmically stable.",
  "MC-0031-F02": "These dances have a quick, flowing pulse, are commonly in a major key and are often played by fiddle, accordion or a Scottish dance band.",
  "MC-0034-F02": "The supporting part may provide harmony, rhythm, texture or all three.",
  "MC-0035-F02": "The simultaneous combination may be created by chords or by independent parts joining together.",
  "MC-0036-F01": "The interval from a note to the next higher or lower note with the same letter name, such as C to C.",
  "MC-0037-F02": "The repeated pattern may be rhythmic or melodic and is often a memorable phrase in jazz, rock or other popular styles.",
  "MC-0039-F02": "One featured performer can still have accompaniment, provided that voice or instrument remains the prominent musical line.",
  "MC-0044-F02": "This Scottish Highland instrument is commonly used in marches, dances and pibroch.",
  "MC-0046-F01": "A performer draws a hair-covered implement across the strings of an instrument such as violin, viola, cello or double bass.",
  "MC-0046-F02": "Friction created as hair is drawn across a string produces a sustained tone.",
  "MC-0046-F03": "The Italian instruction arco tells a string player to resume this technique after a pizzicato passage.",
  "MC-0048-F02": "The singers may perform in unison or in several voice parts, with or without instrumental accompaniment.",
  "MC-0051-F02": "A violin used in traditional or folk music, especially Scottish music.",
  "MC-0052-F03": "A Scottish example may include fiddle, whistle, acoustic guitar, accordion and bagpipes.",
  "MC-0055-F02": "Pipe-based examples are strongly associated with churches, and several notes can be held while the keys remain pressed.",
  "MC-0055-F03": "Large pipe-based examples commonly have more than one keyboard, called manuals, plus a pedalboard played with the feet.",
  "MC-0056-F02": "Members of the family may be tuned, producing identifiable pitches, or untuned, producing indefinite pitch.",
  "MC-0057-F01": "Pressing a key causes a felt-covered hammer to strike a string.",
  "MC-0057-F03": "The instrument's full name reflects its ability to play softly or loudly through changes in touch.",
  "MC-0057-F04": "The same word is also the Italian dynamic marking meaning soft.",
  "MC-0062-F01": "Sound is produced when a performer makes contact with an instrument using a hand, stick, mallet or beater.",
  "MC-0063-F02": "Sound is produced by vibrations that are commonly started by bowing or plucking.",
  "MC-0064-F02": "Unlike sounding one string at a time, this technique normally sounds several strings in one sweeping action.",
  "MC-0069-F02": "Course examples may use layered percussion, repeated and overlapping rhythms, call and response, singing and clapping; traditions vary.",
  "MC-0071-F03": "A Classical example commonly has three movements in a fast-slow-fast plan, and its first movement often includes a cadenza.",
  "MC-0073-F02": "The production uses soloists, chorus, orchestral accompaniment, acting, costumes, scenery and theatrical movement, and may be sung in many languages.",
  "MC-0075-F02": "This vocal practice is central to hip-hop and may use repeated grooves, samples and backing tracks.",
  "MC-0080-F02": "A flowing rising, falling or patterned figure is created by sounding the notes of a chord one after another.",
  "MC-0080-F03": "The chord notes may appear in any order, although the more flowing form usually outlines them in an ordered rising or falling pattern.",
  "MC-0083-F01": "A note or fifth is sustained or repeated beneath a changing melody.",
  "MC-0083-F02": "Their continuous low-pitched pipes provide the sustained accompaniment.",
  "MC-0084-F01": "The tonality uses its characteristic seven-note scale and matching tonic chord.",
  "MC-0084-F02": "Music using this tonality often sounds bright or stable, but mood depends on other musical elements and is not always happy.",
  "MC-0084-F03": "Its scale pattern is tone-tone-semitone-tone-tone-tone-semitone.",
  "MC-0085-F01": "The tonality uses its characteristic seven-note scale and matching tonic chord.",
  "MC-0085-F02": "Music using this tonality often sounds darker or more tense than its counterpart, but it is not automatically sad.",
  "MC-0085-F03": "Natural, harmonic and melodic forms of the scale differ in their treatment of the sixth and seventh degrees.",
  "MC-0086-F01": "The interval between notes with the same letter name, eight scale degrees apart, such as C to C.",
  "MC-0087-F02": "Decorative figures such as grace notes, trills and mordents add expression, rhythmic detail or melodic interest without changing the tune's basic outline.",
  "MC-0088-F01": "A bass note is sustained or repeated while the harmony above changes.",
  "MC-0088-F02": "The sustained bass note may fit some chords and clash with others, creating stability or tension.",
  "MC-0089-F02": "Five-note scales are common in Scottish, Celtic, folk and world music and avoid some semitone tensions found in seven-note major and minor scales.",
  "MC-0090-F02": "These ordered pitch collections provide the material from which melodies and chords can be built.",
  "MC-0092-F02": "At this level, the term mainly concerns the contrast between music centred on a major key and music centred on a minor key.",
  "MC-0092-F03": "A home key is established through relationships between scale notes and chords, especially the pull from dominant to tonic harmony.",
  "MC-0098-F02": "The signatures 6/8, 9/8 and 12/8 contain two, three and four dotted-crotchet beats respectively; jigs commonly use this metre.",
  "MC-0099-F01": "Unequal long-short or short-long patterns are created by using notes lengthened by a dot.",
  "MC-0103-F02": "Examples have two, three or four crotchet beats per bar and are written with 4 as the lower number.",
  "MC-0104-F03": "In a traditional dance set, this dance commonly precedes a faster reel.",
  "MC-0106-F03": "Such featured solo passages were historically improvised by performers, although many are now written into the score.",
  "MC-0107-F03": "Because the following parts reproduce the melody exactly, this device is stricter than general imitation.",
  "MC-0115-F01": "It is the lowest standard adult voice or choral part.",
  "MC-0116-F03": "In a drum kit the instrument is operated by a foot pedal, while its orchestral counterpart is struck with a large soft-headed beater.",
  "MC-0118-F02": "A British-style ensemble of this kind commonly includes cornets, flugelhorn, tenor horns, baritones, euphoniums, trombones, tubas and percussion.",
  "MC-0127-F02": "A full-size orchestral example typically has 47 strings and seven pedals; each pedal changes every string of one note name between flat, natural and sharp.",
  "MC-0129-F01": "A device placed on or in an instrument changes its normal tone, often making it softer, thinner, more nasal or more distant.",
  "MC-0129-F02": "The exact effect depends on the instrument and the device used.",
  "MC-0131-F03": "The principal sizes in this family are descant, treble, tenor and bass.",
  "MC-0131-F02": "The family comes in several sizes and was especially important in Renaissance and Baroque music.",
  "MC-0137-F02": "The pitch of each drum can be adjusted by hand or pedal, and its head is struck with soft-headed mallets.",
  "MC-0137-F03": "Because they produce definite pitches, these drums can reinforce harmony as well as rhythm.",
  "MC-0140-F03": "The standard orchestral instrument normally has three valves.",
  "MC-0147-F01": "This is a group of singers, or music written for them.",
  "MC-0147-F02": "The group normally sings in several parts and may comment on or participate in the action.",
  "MC-0148-F01": "Features include clear melody, balanced phrases, mainly homophonic texture and controlled dynamics.",
  "MC-0151-F01": "Music associated with classical and traditional practices from South Asia.",
  "MC-0154-F02": "Classical and Romantic works of this kind commonly contain contrasting movements, with the first often organised in sonata form.",
  "MC-0157-F01": "A major-key sequence using tonic I, subdominant IV, dominant V and submediant VI.",
  "MC-0158-F02": "The scale consists entirely of semitone steps.",
  "MC-0158-F03": "A complete form of the scale contains all twelve pitch classes within the octave.",
  "MC-0159-F02": "Dense groups of neighbouring notes create strong dissonance and may be played with fingers, fist, forearm or several instruments.",
  "MC-0167-F02": "This type of word setting allows vocal decoration and contrasts with one note per syllable.",
  "MC-0164-F03": "Groups of these very short ornamental notes are especially characteristic of bagpipe decoration.",
  "MC-0174-F03": "This ornament is often used to signal the end of a concerto cadenza.",
  "MC-0173-F01": "It equals two semitones, such as C to D; on a fretted guitar it normally spans two frets.",
  "MC-0176-F01": "Metres with two, three or four dotted-crotchet beats per bar.",
  "MC-0176-F02": "Each main beat divides into three quavers: there may be two, three or four dotted-crotchet beats in the bar.",
  "MC-0182-F01": "A two-part form with a contrasting A section followed by B; either section may repeat.",
  "MC-0184-F01": "A texture in which two or more independent melodic lines interact simultaneously.",
  "MC-0189-F01": "The main A section returns repeatedly between contrasting episodes.",
  "MC-0189-F02": "The episodes are labelled B, C and so on, giving a pattern such as A-B-A-C-A; the recurring A section normally returns in the same key.",
  "MC-0185-F02": "The contrasting passages are normally labelled B, C and so on.",
  "MC-0185-F01": "A contrasting passage occurs between returns of the main A section.",
  "MC-0206-F03": "The Italian name of the instrument means small.",
  "MC-0208-F02": "This electronic effect can make a recording seem as though it was performed in a larger or more resonant space.",
  "MC-0209-F02": "The technique is common on snare drum and timpani and may use single-stroke, double-stroke or tremolo patterns.",
  "MC-0216-F02": "A strong syncopated groove from drum kit and electric bass supports riffs and improvisation on amplified or electronic instruments.",
  "MC-0218-F01": "A musical setting of the fixed sections of the Roman Catholic liturgy.",
  "MC-0218-F02": "Its movements commonly include Kyrie, Gloria, Credo, Sanctus and Agnus Dei.",
  "MC-0222-F03": "This speech-like vocal passage is often followed by a more lyrical solo song.",
  "MC-0223-F02": "Classical works of this type often have three or four contrasting movements, and the first commonly has its own large-scale internal form.",
  "MC-0223-F03": "A common Classical three-movement plan is fast-slow-fast, although later examples may contain additional movements.",
  "MC-0224-F01": "An African American popular style that developed from gospel, blues, and rhythm-and-blues traditions.",
  "MC-0225-F01": "It consists of two violins, viola and cello.",
  "MC-0225-F02": "The four players normally have independent, closely interacting parts, and a Classical work for them commonly contains four movements.",
  "MC-0227-F01": "A four-note chord formed by combining a major or minor triad with the pitch six scale steps above its root.",
  "MC-0230-F02": "It contains strong dissonance, including a tritone, and normally resolves towards chord I. In C major, G-B-D-F is labelled V7 or G7.",
  "MC-0232-F01": "Chord V moves unexpectedly to VI instead of resolving to I, interrupting the expected ending.",
  "MC-0235-F01": "Music based on one of the older seven-note pitch patterns rather than the familiar major or minor scales.",
  "MC-0235-F02": "Each pitch pattern has its own arrangement of tones and semitones and may create a distinctive tonal colour.",
  "MC-0235-F03": "The Dorian example can be heard or played on the white notes from D to D and follows tone-semitone-tone-tone-tone-semitone-tone.",
  "MC-0233-F02": "Pitch distances are numbered by counting letter names inclusively and may be described as major, minor, perfect, augmented or diminished.",
  "MC-0236-F03": "The upper form follows main note-upper neighbour-main note; the lower or inverted form uses the lower neighbour instead.",
  "MC-0239-F02": "Its tonic lies three semitones above the related minor tonic; for example, C major shares a key signature with A minor.",
  "MC-0240-F02": "Its tonic lies three semitones below the related major tonic; for example, A minor shares a key signature with C major.",
  "MC-0242-F03": "One part divides a span into two equal notes while another divides it into three; the note values can vary.",
  "MC-0247-F03": "Three quavers occupy one crotchet beat, while three crotchets occupy the time of two crotchets.",
  "MC-0248-F01": "In Baroque music, a bass instrument plays the written bass while a chordal instrument realises the harmony, often from figured bass.",
  "MC-0250-F02": "After the B section, da capo sends the singer back to the start; the final A is often ornamented.",
  "MC-0253-F02": "Unlike the main section of a rondo, the returning orchestral passage may reappear in different keys or in shortened form.",
  "MC-0253-F03": "In a concerto grosso, the ripieno often presents this recurring orchestral passage between episodes led by the concertino.",
  "MC-0254-F01": "A large-scale form with exposition, development and recapitulation; the subjects return in the tonic.",
  "MC-0255-F01": "It is the principal musical idea on which a work or section is based.",
  "MC-0255-F02": "In sonata form, it identifies the principal first and second themes.",
  "MC-0257-F03": "Rapid, agile vocal writing may include scales, arpeggios, leaps, trills and written or improvised ornamentation.",
  "MC-0260-F02": "Passages played by the larger ensemble normally create a fuller and more powerful sound.",
  "MC-0262-F02": "It may be unaccompanied or use organ or orchestra, and is the English counterpart of the Latin motet.",
  "MC-0263-F02": "In late-Renaissance England, this was commonly a solo song with lute accompaniment, although the same word can also mean a tuneful instrumental or vocal melody.",
  "MC-0265-F02": "These German hymn tunes are commonly harmonised homophonically in four SATB parts.",
  "MC-0266-F02": "It combines improvisation with complex harmony or rhythm, electronics and influences from styles such as funk, rock and world music.",
  "MC-0267-F01": "Dance music produced primarily with electronic instruments and computer technology for clubs or similar settings.",
  "MC-0267-F02": "It uses repetitive beats, programmed drums, synthesisers, samples, build-ups and drops; house and dubstep are related styles.",
  "MC-0269-F03": "In the English tradition, English texts, word painting and unaccompanied performance are common features.",
  "MC-0274-F01": "Features include modal harmony, flowing polyphony, imitation, a cappella singing, lute, viols, recorders and early brass.",
  "MC-0275-F02": "In the twelve-tone method, a tone row orders all twelve chromatic pitch classes and may be transposed, inverted or reversed.",
  "MC-0280-F02": "The narrower form uses exactly two keys at once, while the broader form allows two or more; the overlapping keys often create complex clashes.",
  "MC-0281-F02": "Preparation, a held dissonance and resolution create controlled harmonic tension.",
  "MC-0286-F01": "The subject is restated by the next voice, normally beginning a fifth above or a fourth below.",
  "MC-0286-F02": "The real form transposes every interval exactly, while the tonal form adjusts one or more intervals to preserve the key relationship.",
  "MC-0290-F02": "In the exposition, voices enter in turn with the subject or answer, often against a countersubject.",
  "MC-0291-F01": "Each interval changes direction: upward intervals become downward and vice versa.",
  "MC-0291-F02": "It applies when a note other than the root is in the bass.",
  "MC-0291-F03": "The first form places the third of the chord in the bass, while the second form places the fifth in the bass.",
  "MC-0293-F02": "In serial music, the reversed order may also be combined with a reversal of interval direction.",
  "MC-0296-F02": "The theme is heard alone first and then returns in other voices throughout the work.",
  "MC-0296-F01": "The term names the principal theme.",
  "MC-0288-F01": "A linking or transition passage connects the first and second subjects.",
  "MC-0297-F02": "A whole ensemble uses members of one instrument family, while a mixed or broken ensemble combines different families.",
  "MC-0299-F01": "It consists of piano, violin and cello.",
  "MC-0299-F03": "It is written for piano, violin and cello and commonly follows a fast-slow-fast three-movement plan.",
  "MC-0179-F03": "It has the same practical effect as rallentando.",
};

// These reviewed alternatives keep the same musical facts but express them
// in shorter, more direct language for secondary-school pupils. They sit
// above the general editorial overrides without changing the approved source
// knowledge bank.
const PUPIL_FRIENDLY_FACT_OVERRIDES = {
  // National 3
  "MC-0002-F01": "Common features are syncopation, improvisation, distinctive harmony and instrumental solos, played by small groups or big bands.",
  "MC-0003-F01": "Dance music from Latin America, often with lively syncopated or off-beat rhythms, a strong pulse and clear percussion.",
  "MC-0003-F02": "Common instruments include bongos, güiro, castanets and claves.",
  "MC-0001-F01": "It is usually in 4/4 and often uses a 12-bar chord pattern. 8-bar and 16-bar forms are also used.",
  "MC-0004-F01": "A stage show with speaking, songs, acting and usually dancing.",
  "MC-0006-F01": "A popular style with a strong driving beat and loud amplified sound.",
  "MC-0008-F01": "Traditional songs, dances and instrumental music from Scotland.",
  "MC-0010-F01": "Two or more different notes played together.",
  "MC-0010-F02": "Groups of notes played together create harmony and can support a melody.",
  "MC-0011-F02": "A change from one chord to another can form part of a progression and shape the harmony beneath a melody.",
  "MC-0014-F01": "The performer makes up music while playing instead of following a fully written part.",
  "MC-0016-F02": "The two phrases are often similar in length or rhythm. The second may complete, contrast with or copy the first.",
  "MC-0017-F02": "The same musical idea may return in the melody, rhythm or structure.",
  "MC-0018-F02": "The phrase keeps the same shape but starts on a different pitch.",
  "MC-0019-F02": "Moving to a neighbouring scale note is the smallest normal move; a leap skips one or more notes.",
  "MC-0020-F03": "2/4, 3/4 and 4/4 have two, three and four main beats. So do 6/8, 9/8 and 12/8.",
  "MC-0022-F03": "A slow tempo, often about 66-76 beats per minute, though the exact speed depends on the music.",
  "MC-0023-F03": "A fast tempo, often about 120-168 beats per minute, though the exact speed depends on the music.",
  "MC-0024-F01": "The steady pattern that you can tap or clap along with.",
  "MC-0024-F03": "You can tap these steady units. Music groups them in twos, threes or fours and usually stresses the first.",
  "MC-0027-F02": "Music that helps people move together in step and often uses clear accents and percussion.",
  "MC-0028-F01": "Notes or accents fall between the main beats or on their weaker parts.",
  "MC-0029-F01": "Notes or accents fall exactly on the main beat.",
  "MC-0029-F02": "Playing exactly with the main beat makes the rhythm feel steady.",
  "MC-0030-F02": "The performer or conductor decides how much longer to hold the note or rest.",
  "MC-0031-F02": "Quick, flowing dances, often in a major key, played by fiddle, accordion or a traditional dance band.",
  "MC-0030-F03": "The symbol, also called a fermata, is a dot beneath a curved arch.",
  "MC-0033-F02": "The first beat is strongest, giving a ONE-two-three pattern.",
  "MC-0035-F02": "The combined sound may come from chords or from independent parts.",
  "MC-0039-F01": "One voice or instrument performs alone or has the main part.",
  "MC-0039-F02": "A featured voice or instrument may have accompaniment but still remains the main musical line.",
  "MC-0040-F02": "A voice performs without any instrumental support.",
  "MC-0046-F01": "A performer moves stretched horsehair across the strings of a violin, viola, cello or double bass.",
  "MC-0046-F02": "Moving stretched horsehair across a string makes the note continue.",
  "MC-0050-F01": "A string instrument that uses pickups to send its sound to an amplifier.",
  "MC-0054-F03": "Its sections include strings, woodwind, brass and percussion, with instruments such as violin, flute, trumpet and timpani.",
  "MC-0055-F01": "A keyboard instrument that makes long sounds using pipes or electronic sound generators.",
  "MC-0055-F02": "Pipe versions are often found in churches, and several notes can continue while the keys are held down.",
  "MC-0056-F01": "A family of instruments played mainly by striking, shaking or scraping.",
  "MC-0056-F02": "Some instruments in this family play clear notes; others have no fixed pitch.",
  "MC-0057-F04": "Its name is also the Italian dynamic marking meaning soft.",
  "MC-0058-F02": "The technique gives each note a clear start and is used on guitar, harp and bowed strings.",
  "MC-0061-F01": "A group of tuned steel pans from Trinidad and Tobago.",
  "MC-0062-F01": "A performer makes an instrument sound with a hand, stick, mallet or beater.",
  "MC-0062-F02": "Many percussion instruments sound when a hand, stick, mallet or beater makes contact with them.",
  "MC-0063-F02": "The sound comes from vibrations made by bowing or plucking.",
  "MC-0064-F01": "A finger or plectrum sweeps quickly across several strings, usually to play a chord.",
  "MC-0064-F02": "Several strings sound in one sweeping movement rather than one at a time.",
  "MC-0065-F01": "Percussion instruments that play clear notes, scales or melodies.",
  "MC-0067-F01": "The sound made when a person sings or speaks.",
  "MC-0067-F02": "Vocal folds vibrate to make the pitch, and the mouth shapes the sound.",
  "MC-0068-F01": "An orchestral family played by blowing across an opening or through a single or double reed.",
  "MC-0068-F03": "Many modern instruments in this family, including flute and saxophone, are made from metal.",

  // National 4
  "MC-0069-F01": "Music from a range of African traditions.",
  "MC-0069-F02": "Examples may use layered percussion, overlapping rhythms, call and response, singing and clapping. African traditions vary.",
  "MC-0069-F03": "Examples may use interlocking rhythms, improvisation, layered percussion and call and response.",
  "MC-0071-F01": "A piece for solo instrument and orchestra.",
  "MC-0071-F02": "The soloist has the main part, and the piece usually has several movements.",
  "MC-0073-F01": "A stage drama in which most or all of the story is sung.",
  "MC-0073-F02": "The performance uses soloists, chorus, orchestra, acting, costumes and scenery.",
  "MC-0074-F03": "It is especially linked to piano.",
  "MC-0075-F01": "Rhyming words spoken in time with a beat.",
  "MC-0076-F01": "A relaxed, steady groove with a strong low bass line and short guitar or keyboard chords on off-beats, often stressing beats 2 and 4.",
  "MC-0079-F01": "A danceable swung rhythm with riffs and call and response, played by trumpets, trombones, saxophones and a rhythm section.",
  "MC-0080-F01": "The notes of a chord are played one after another, not together.",
  "MC-0080-F03": "The chord notes can be in any order, but often rise or fall smoothly.",
  "MC-0081-F01": "The music moves from one key to another.",
  "MC-0081-F02": "The scale and chords change when the music moves into a new key.",
  "MC-0085-F03": "Natural, harmonic and melodic forms use different sixth and seventh notes.",
  "MC-0090-F02": "Melodies and chords can be built from an ordered set of notes.",
  "MC-0091-F01": "Improvised jazz singing that uses nonsense syllables and sounds instead of words.",
  "MC-0092-F01": "Music is built around a central or home key.",
  "MC-0092-F02": "It tells you whether music is in a major or minor key.",
  "MC-0092-F03": "Scale notes and chords make a home key feel settled, especially V moving to I.",
  "MC-0095-F02": "The music gradually gets faster over a passage instead of jumping at once to a new speed.",
  "MC-0096-F01": "One or more notes before the first full bar lead into the first strong beat of a phrase.",
  "MC-0097-F03": "A walking tempo, often about 76-108 beats per minute, though the exact speed depends on the music.",
  "MC-0098-F02": "6/8, 9/8 and 12/8 have two, three and four dotted-crotchet beats. Jigs often use this metre.",
  "MC-0099-F01": "A dot adds half a note's value, creating long-short or short-long patterns.",
  "MC-0104-F02": "Listen for dotted rhythms, especially the Scotch snap.",
  "MC-0105-F02": "The usual accent pattern shifts, making the rhythm feel lively or surprising.",
  "MC-0106-F01": "A solo section in a concerto that lets the performer show musical and technical skill.",
  "MC-0111-F02": "Rhythm, harmony, texture, key, tempo or instruments can change while the theme stays recognisable.",
  "MC-0112-F01": "Verses repeat the same music with new words. A contrasting chorus returns with the same or similar words and music.",
  "MC-0115-F02": "It provides the lowest vocal line in SATB writing and often supports the harmony.",
  "MC-0116-F03": "In a drum kit, this drum is played with a foot pedal. In an orchestra, it is hit with a large soft beater.",
  "MC-0122-F01": "An electronic effect that makes an amplified sound rough or fuzzy.",
  "MC-0122-F02": "It is often heard on electric guitar in rock music.",
  "MC-0124-F01": "A high woodwind, usually made of metal, played by blowing across an opening instead of through a reed.",
  "MC-0124-F02": "Though made of metal, it belongs to the woodwind family because it is played by blowing across an opening.",
  "MC-0127-F02": "A full-size version has pedals that change notes between flat, natural and sharp.",
  "MC-0128-F01": "Pressing a key plucks a string inside this keyboard instrument.",
  "MC-0128-F03": "Its plucked strings give less control of loud and soft than a piano's hammers.",
  "MC-0129-F01": "An instrument's normal tone becomes softer, thinner, more nasal or more distant when a device is fitted.",
  "MC-0129-F02": "A fitted device changes an instrument's normal tone, and the exact sound depends on both.",
  "MC-0130-F01": "A set of tubes of different lengths tied together. Each tube makes a different pitch.",
  "MC-0131-F03": "The main sizes are descant, treble, tenor and bass.",
  "MC-0132-F01": "This single-reed instrument has a metal body, unlike the clarinet's wooden or plastic body.",
  "MC-0132-F02": "It has a strong, flexible tone and is important in jazz, wind bands and some popular music.",
  "MC-0133-F01": "An untuned drum with metal wires under the lower skin, giving a crisp rattling sound.",
  "MC-0133-F03": "A lever switches the metal snares on or off, changing the sound.",
  "MC-0137-F01": "Large tuned drums with skins stretched over bowl-shaped bodies.",
  "MC-0137-F02": "Their pitch is changed by hand or pedal, and they are played with soft beaters.",
  "MC-0137-F03": "They play clear pitches, so they can support harmony and rhythm.",
  "MC-0138-F02": "It makes a bright, ringing untuned sound.",
  "MC-0139-F01": "A low-to-middle brass instrument that uses a sliding tube to change pitch.",
  "MC-0143-F02": "It has a dry, bright and crisp sound.",

  // National 5
  "MC-0144-F02": "It usually has a memorable tune and accompaniment. It expresses a character's feelings instead of moving the story on.",
  "MC-0145-F01": "A strophic folk song from North-East Scotland, traditionally sung by farm workers who lived in a bothy.",
  "MC-0149-F02": "A precentor leads each unaccompanied line, and the congregation follows with overlapping, ornamented singing.",
  "MC-0151-F02": "This music often uses sitar, tabla, drone, improvised melody, ornaments and repeating rhythmic cycles.",
  "MC-0153-F02": "The theme returns in more decorated variations, with many grace notes above continuous drones.",
  "MC-0154-F02": "Classical and Romantic examples often have contrasting movements. The first is often in sonata form.",
  "MC-0155-F01": "A Scottish Gaelic work song sung by women while beating newly woven cloth to soften and shrink it.",
  "MC-0157-F03": "The tonic, subdominant, dominant and submediant chords can form all four main cadence types.",
  "MC-0157-F02": "Different orders of I, IV, V and VI create familiar patterns used in many major-key songs.",
  "MC-0158-F03": "The full scale contains all twelve notes within one octave.",
  "MC-0161-F02": "It has its own tune but remains less important than the main melody.",
  "MC-0163-F01": "A smooth slide from one pitch to another through the pitches in between.",
  "MC-0163-F02": "It can be sung or played on strings, trombone, harp, piano and other instruments.",
  "MC-0165-F01": "A two-chord cadence ending on V. It sounds open or unfinished because chord I has not arrived.",
  "MC-0166-F02": "It is like a bass pedal, but in a high part.",
  "MC-0168-F02": "The new key is made clear by its notes, chords and cadences.",
  "MC-0169-F01": "A V-I cadence that sounds complete, also called a full close.",
  "MC-0170-F02": "The effect can be made by bending a guitar string, using a keyboard pitch wheel, changing lip pressure or sliding the voice.",
  "MC-0177-F01": "Different rhythmic patterns sound at the same time, creating competing accents.",
  "MC-0178-F03": "The tempo is often about 108-120 beats per minute, though the exact speed depends on the music.",
  "MC-0180-F01": "The performer speeds up and slows down slightly for expression while keeping the music flowing.",
  "MC-0180-F02": "Performers often use it in Romantic music.",
  "MC-0181-F02": "It is often played by the left hand on piano and is common in Classical keyboard music.",
  "MC-0182-F01": "A two-part form with an opening A section followed by a contrasting B section. Either section may repeat.",
  "MC-0184-F01": "Two or more independent melodies sound together and interact.",
  "MC-0187-F01": "One main melody has chordal support, or all parts move in similar rhythms.",
  "MC-0188-F01": "Two or more independent melodies sound at the same time.",
  "MC-0186-F02": "The repeated bass supports variations above it.",
  "MC-0198-F02": "These untuned percussion instruments are often heard in flamenco and other Spanish dance music.",
  "MC-0208-F01": "Sound continues and reflects around a space after the original sound is made.",
  "MC-0208-F03": "Many quick sound reflections blend into one fading sound instead of a separate echo.",
  "MC-0210-F02": "Its resonant, buzzing sound is often heard in Indian music.",
  "MC-0212-F02": "It supplies the bass line in orchestras, brass bands and wind bands.",

  // Higher
  "MC-0215-F02": "Piano writing may use the sustain pedal, tied notes and cross-rhythms to make the pulse and sound less clear.",
  "MC-0215-F03": "The style focuses on atmosphere and tone colour rather than a strong sense of musical direction.",
  "MC-0219-F02": "Recorded sounds may be cut, repeated, reversed, layered, filtered or changed electronically to build the music.",
  "MC-0221-F02": "It uses one unison modal melody, with flexible rhythm shaped by the words.",
  "MC-0222-F02": "It delivers dialogue and moves the story on in opera and oratorio, with flexible rhythm and light accompaniment.",
  "MC-0223-F02": "Classical examples often have three or four contrasting movements. The first often uses a large-scale form.",
  "MC-0224-F02": "It often uses expressive singing, call and response, a strong groove, syncopation, vocal improvisation and a horn section.",
  "MC-0225-F01": "It has two violins, viola and cello.",
  "MC-0225-F02": "It is written for four string players, with closely interacting parts and usually four movements.",
  "MC-0228-F02": "Built from equal intervals, it creates strong tension and can resolve in several directions.",
  "MC-0229-F02": "Two stacked minor thirds create a tritone between the root and fifth.",
  "MC-0231-F03": "Its interval pattern is tone, semitone, tone, tone, semitone, tone-and-a-half, semitone.",
  "MC-0233-F02": "Count the letter names from the first note to the last, including both. The result may be major, minor, perfect, augmented or diminished.",
  "MC-0233-F03": "For C-F, count C, D, E and F. Four letter names make it a fourth.",
  "MC-0234-F01": "A minor scale that raises the sixth and seventh going up, then uses the natural minor notes coming down.",
  "MC-0235-F03": "The Dorian pattern uses the white notes from D to D: tone, semitone, tone, tone, tone, semitone, tone.",
  "MC-0236-F03": "The upper form follows main note, upper neighbour, main note. The lower form uses the lower neighbour instead.",
  "MC-0237-F01": "An important decorative instrumental line played alongside the main melody, especially a vocal part.",
  "MC-0238-F01": "A IV-I cadence with a softer finish than a perfect cadence, often heard on the final Amen of a hymn.",
  "MC-0242-F01": "One part plays two equal notes in the same time as another part plays three.",
  "MC-0243-F02": "The music lasts longer but keeps the same pitches and rhythmic pattern.",
  "MC-0243-F03": "The pulse stays the same, but the repeated idea sounds slower.",
  "MC-0244-F02": "The music moves faster but keeps the same basic pattern.",
  "MC-0244-F03": "The pulse stays the same, but the repeated idea sounds faster.",
  "MC-0246-F02": "The time signature changes during the music, altering the number or grouping of beats and sometimes unsettling the pulse.",
  "MC-0248-F01": "In Baroque music, a bass instrument plays the bass line while a chordal instrument fills in the harmony, often from figured bass.",
  "MC-0251-F02": "In sonata form, it introduces the first and second subjects. In a fugue, each voice enters with the subject or answer.",
  "MC-0252-F02": "The repeating bass continues while the upper parts become more varied.",
  "MC-0254-F03": "It is also called first-movement form because it is often used for the opening movements of sonatas and symphonies.",
  "MC-0255-F01": "It is the main musical idea on which a piece or section is based.",
  "MC-0255-F02": "This name is used for the first and second main themes in sonata form.",
  "MC-0256-F01": "The music keeps changing from beginning to end instead of repeating for each verse.",
  "MC-0256-F03": "The music can keep changing with the words and story instead of repeating for each verse.",
  "MC-0257-F01": "Highly agile, ornamented vocal writing with rapid scales, arpeggios, leaps, trills and other decorations.",
  "MC-0259-F01": "High, light sounds made by gently touching a string while bowing or plucking.",
  "MC-0259-F02": "Lightly touching the string stops its usual full vibration and lets a higher, lighter note sound.",
  "MC-0261-F02": "On strings, fast bow strokes repeat one note. On other instruments, one note or two alternating notes are played quickly.",

  // Advanced Higher
  "MC-0262-F01": "An English sacred choral work with a religious text, first used in Renaissance Protestant worship.",
  "MC-0262-F02": "It may be unaccompanied or use organ or orchestra. It is the English version of the Latin motet.",
  "MC-0267-F01": "Dance music made mainly with electronic instruments and computers, often for clubs.",
  "MC-0269-F03": "English examples often use word painting and are sung unaccompanied.",
  "MC-0270-F01": "A sacred Renaissance choral work, usually polyphonic and in Latin, using a text outside the fixed Mass movements.",
  "MC-0271-F02": "Composers may use traditional melodies, dances, scales, rhythms, stories, history or instruments from a particular country.",
  "MC-0272-F01": "It uses the balance, clarity, forms and textures of older Classical music, but with modern harmony, rhythm and orchestration.",
  "MC-0275-F01": "Music built from a fixed series instead of traditional major or minor tonality.",
  "MC-0276-F02": "It creates an accented dissonance. It is approached by leap and resolves by step to a chord note.",
  "MC-0277-F02": "Two stacked major thirds create a symmetrical, unsettled sound.",
  "MC-0278-F02": "In first inversion, the third is in the bass. It is labelled IIb or ii6 and often leads to chord V.",
  "MC-0279-F02": "In a major key, I, IV and V are major and VI is minor. In harmonic minor, i and iv are minor, while V and VI are major.",
  "MC-0279-F03": "These chords form the four cadence types: V-I perfect, ending on V imperfect, IV-I plagal and V-VI interrupted.",
  "MC-0280-F02": "Exactly two keys may sound at once, or there may be more than two. The keys often clash.",
  "MC-0281-F01": "A prepared note is held into the next chord, becomes dissonant, then resolves down by step.",
  "MC-0282-F03": "Using all twelve pitch classes before repeating one means no note automatically sounds like the tonic or dominant.",
  "MC-0285-F01": "The beat grouping changes from two groups of three to three groups of two, or the other way round. The note lengths stay the same.",
  "MC-0285-F02": "It briefly makes the beat grouping unclear, often near a cadence in Renaissance or Baroque music. It can sound as if the music is slowing.",
  "MC-0286-F02": "In a fugue, the real form copies every interval exactly. The tonal form changes one or more intervals to keep the key relationship.",
  "MC-0287-F01": "Two separated groups of singers or instruments answer each other across the space.",
  "MC-0288-F02": "In sonata form, it builds momentum and modulates from the tonic to the key of the second subject.",
  "MC-0289-F01": "A recurring counter-melody in a fugue.",
  "MC-0289-F02": "It is written to fit against the subject or answer and may return with later entries.",
  "MC-0290-F01": "A contrapuntal work in which each independent voice introduces the subject in turn.",
  "MC-0291-F01": "Each interval changes direction: upward intervals become downward and vice versa.",
  "MC-0292-F01": "A recurring musical idea linked to a character, object, place, emotion or dramatic idea.",
  "MC-0294-F02": "The songs share a story, character, poet, emotional journey or main theme, and are usually performed in a set order.",
  "MC-0295-F01": "In a fugue, a new subject entry begins before the previous one ends, so they overlap.",
  "MC-0296-F01": "It is the main theme.",
  "MC-0297-F02": "A whole group uses one instrument family; a mixed or broken group uses different families.",
  "MC-0298-F01": "A high adult male voice, usually sung mainly in falsetto, with a range similar to alto or sometimes mezzo-soprano.",
  "MC-0299-F01": "It has piano, violin and cello.",
  "MC-0299-F02": "All three instruments may have equally important parts rather than the piano only accompanying.",
  "MC-0299-F03": "It is written for piano, violin and cello, usually in a fast-slow-fast three-movement pattern.",
  "MC-0300-F02": "The singer follows the written pitch shape but quickly moves away from each note into speech.",
};

const MISCONCEPTION_CORRECTION_OVERRIDES = {
  "MC-0038": "All parts perform the same melody but begin at different times, so the melody overlaps itself.",
  "MC-0051": "A violin used in traditional or folk music, especially Scottish music.",
  "MC-0057": "Pressing a key makes a felt-covered hammer strike a string; the word can also mean soft in Italian.",
  "MC-0137": "Large tuned kettle drums have adjustable pitch and are struck with soft-headed mallets.",
  "MC-0144": "A lyrical solo song in an opera or oratorio expresses a character's feelings rather than moving the story on like recitative.",
  "MC-0147": "A group of singers performs in several parts and may comment on the action; here the term does not mean a song's refrain.",
  "MC-0156": "Music has no tonal centre or functional major or minor key; treating pitches with similar importance does not make it random.",
  "MC-0177": "Different rhythmic patterns sound at the same time, creating competing accents. This is different from syncopation.",
  "MC-0220": "A sacred concert work for soloists, choir and orchestra is performed without acting, scenery or costumes.",
  "MC-0223": "A multi-movement work for solo instrument, or instrument with piano, rather than a form within one movement.",
  "MC-0228": "A four-note chord built from stacked minor thirds has a symmetrical structure and several possible resolutions.",
  "MC-0235": "An older seven-note pitch pattern has its own arrangement of tones and semitones, distinct from major and minor.",
  "MC-0249": "A Baroque concerto contrasts a small concertino with the larger ripieno rather than using one soloist.",
  "MC-0280": "Two or more keys sound at the same time; the two-key form is the narrower version.",
  "MC-0281": "A prepared note is held into the next chord, becomes dissonant, then resolves down by step.",
  "MC-0285": "Two groups of three are heard as three groups of two, or the reverse; the written time signature need not change.",
};

const DISTINCTION_CLUE_OVERRIDES = {
  "MC-0083|MC-0088": "A pedal is always in the bass beneath changing harmony; this concept may be any sustained or repeated pitch or fifth.",
  "MC-0088|MC-0083": "This concept is a bass note beneath changing harmony; a drone may be any sustained or repeated pitch or fifth.",
  "MC-0010|MC-0035": "This concept is a particular group of simultaneous notes; harmony is the broader result of different notes and such groups sounding together.",
  "MC-0171|MC-0173": "This concept is the smallest standard pitch step in Western notation; a tone equals two of these intervals.",
  "MC-0037|MC-0017": "Repetition is any exact repeat; this concept describes a short pattern or phrase that recurs many times.",
  "MC-0019|MC-0015": "This concept uses neighbouring scale notes; a leap skips one or more neighbouring notes.",
  "MC-0034|MC-0040": "Music described by this concept has supporting parts; unaccompanied music does not.",
  "MC-0047|MC-0068": "This concept begins with buzzing lips in a mouthpiece; woodwind uses an air edge or reed.",
  "MC-0046|MC-0058": "With this concept, hair is drawn across a string to sustain it; plucking pulls and releases the string.",
  "MC-0063|MC-0056": "This concept produces sound from bowed or plucked vibrations; percussion is struck, shaken or scraped.",
  "MC-0068|MC-0047": "Brass begins with buzzing lips in a mouthpiece; this concept uses an air edge or reed.",
  "MC-0158|MC-0175": "This concept uses semitone movement; a whole-tone scale uses only tone steps.",
  "MC-0286|MC-0296": "The subject is the principal theme; this concept is its next entry, normally at the dominant.",
  "MC-0296|MC-0286": "This concept is the principal theme; the answer is its next entry, normally at the dominant.",
  "MC-0028|MC-0029": "On-the-beat notes reinforce the main pulse; notes described by this concept occur on weaker parts or between the main beats.",
  "MC-0029|MC-0028": "Notes described by this concept reinforce the main pulse; off-the-beat notes occur on weaker parts or between the main beats.",
  "MC-0098|MC-0103": "In simple time, each main beat divides into two equal parts; with this concept, each main beat divides into three.",
  "MC-0099|MC-0102": "This concept is a broad unequal long-short or short-long pattern; a Scotch snap is the specific accented short-long version.",
  "MC-0103|MC-0098": "With this concept, each main beat divides into two equal parts; in compound time, each main beat divides into three.",
  "MC-0187|MC-0188": "A texture described by this concept has a leading melody with chordal support or similar rhythms; polyphonic texture has independent melodic lines.",
  "MC-0188|MC-0187": "Homophonic texture has a leading melody with chordal support or similar rhythms; a texture described by this concept has independent melodic lines.",
};

// These approved facts are useful as supporting evidence but are not specific
// enough to make a fair stand-alone identification question.
const DO_NOT_USE_ALONE = new Set([
  "MC-0009-F03", "MC-0012-F03",
  "MC-0026-F02", "MC-0031-F03", "MC-0032-F02", "MC-0054-F02", "MC-0057-F03",
  "MC-0084-F01", "MC-0084-F02", "MC-0085-F01", "MC-0085-F02",
  "MC-0106-F03", "MC-0107-F02", "MC-0127-F03", "MC-0131-F02", "MC-0135-F03",
  "MC-0147-F03", "MC-0150-F03", "MC-0151-F01", "MC-0175-F02", "MC-0188-F03",
  "MC-0227-F02", "MC-0229-F03", "MC-0254-F02", "MC-0260-F02", "MC-0284-F02",
  "MC-0287-F02", "MC-0295-F02",
]);

const REDUNDANT_FACTS = new Set(["MC-0181-F03", "MC-0262-F03"]);

const DO_NOT_USE = new Set([
  // The source wording says every following part reproduces the melody
  // exactly. That is too absolute for transformed canons, so this fact is
  // omitted until the teacher-approved knowledge source is refined.
  "MC-0107-F03",
  // These facts repeat a shorter portion of another approved fact for the
  // same concept, so using both creates redundant clues and hints.
  ...REDUNDANT_FACTS,
]);

const ODD_ONE_OUT_CASES = [
  { target: "MC-0042", distractors: ["MC-0045", "MC-0046", "MC-0058"], criterion: "Which answer is an instrument rather than a playing technique?" },
  { target: "MC-0106", distractors: ["MC-0119", "MC-0120", "MC-0124"], criterion: "Which answer is a solo passage rather than an instrument?" },
  { target: "MC-0144", distractors: ["MC-0195", "MC-0197", "MC-0200"], criterion: "Which answer is a vocal piece rather than an instrument or playing instruction?" },
  { target: "MC-0215", distractors: ["MC-0235", "MC-0237", "MC-0238"], criterion: "Which answer is a musical style rather than a scale or tonality, melodic feature or cadence?" },
  { target: "MC-0262", distractors: ["MC-0286", "MC-0289", "MC-0290"], criterion: "Which answer is a choral work rather than a fugue term?" },
];

function assertKnowledgeBankReady(bank) {
  const summary = bank.validation_summary || {};
  const errors = [];
  const actualSourceHash = sha256File(KNOWLEDGE_BANK_PATH);
  const actualFactCount = (bank.concepts || []).reduce((total, concept) => total + (concept.question_eligible_facts || []).length, 0);
  if (actualSourceHash !== EXPECTED_VALIDATION.sourceSha256) errors.push(`SHA-256 is ${actualSourceHash}`);
  if (bank.schema_version !== EXPECTED_VALIDATION.schemaVersion) errors.push(`schema_version is ${bank.schema_version || "missing"}`);
  if (bank.concepts?.length !== EXPECTED_VALIDATION.concepts) errors.push(`concept count is ${bank.concepts?.length || 0}`);
  if (summary.question_eligible_facts !== EXPECTED_VALIDATION.facts) errors.push(`question-eligible fact count is ${summary.question_eligible_facts || 0}`);
  if (actualFactCount !== EXPECTED_VALIDATION.facts) errors.push(`actual question-eligible fact count is ${actualFactCount}`);
  if (bank.comparison_groups?.length !== EXPECTED_VALIDATION.comparisonGroups) errors.push(`comparison-group count is ${bank.comparison_groups?.length || 0}`);
  const multipleSenses = (bank.concepts || []).filter((concept) => concept.senses?.length).length;
  if (multipleSenses !== EXPECTED_VALIDATION.multipleSenseConcepts) errors.push(`multiple-sense concept count is ${multipleSenses}`);
  if (summary.validation_status !== "passed") errors.push(`validation status is ${summary.validation_status || "missing"}`);
  LEVELS.forEach((level) => {
    if (summary.level_breakdown?.[level] !== EXPECTED_VALIDATION.levelBreakdown[level]) {
      errors.push(`${level} concept count is ${summary.level_breakdown?.[level] ?? "missing"}`);
    }
  });
  if (errors.length) throw new Error(`Authoritative knowledge-bank validation failed:\n- ${errors.join("\n- ")}`);
}

function parseRequestedLevels() {
  const argument = process.argv.find((value) => value.startsWith("--level="));
  if (argument) {
    throw new Error("Per-level generation is not supported because the shared runtime bank and manifest must always contain all five levels. Run the generator without --level.");
  }
  return LEVELS.slice();
}

function rotate(items, amount) {
  if (!items.length) return [];
  const offset = ((amount % items.length) + items.length) % items.length;
  return items.slice(offset).concat(items.slice(0, offset));
}

function uniqueConcepts(items, target) {
  const seenNames = new Set([normaliseText(target.concept)]);
  return items.filter((concept) => {
    if (!concept || concept.concept_id === target.concept_id) return false;
    const name = normaliseText(concept.concept);
    if (!name || seenNames.has(name)) return false;
    seenNames.add(name);
    return true;
  });
}

function createDistractorPicker(bank) {
  const conceptsById = new Map(bank.concepts.map((concept) => [concept.concept_id, concept]));
  const groupsById = new Map(bank.comparison_groups.map((group) => [group.group_id, group]));
  return function pickDistractors(target, difficulty, salt = 0, explicitIds = []) {
    const isAllowedCandidate = (concept) => concept?.level === target.level
      && concept.concept_id !== target.concept_id
      && (target.primary_element === "Styles" || concept.primary_element !== "Styles");
    const sameLevel = bank.concepts.filter(isAllowedCandidate);
    if (ORCHESTRAL_FAMILY_CONCEPT_IDS.has(target.concept_id)) {
      return uniqueConcepts(bank.concepts.filter((concept) => ORCHESTRAL_FAMILY_CONCEPT_IDS.has(concept.concept_id)), target)
        .map((concept) => concept.concept);
    }
    const explicit = explicitIds.map((id) => conceptsById.get(id)).filter(isAllowedCandidate);
    const groupPeers = (target.comparison_group_ids || []).flatMap((groupId) =>
      (groupsById.get(groupId)?.member_concept_ids || []).map((id) => conceptsById.get(id)))
      .filter(isAllowedCandidate);
    const sameType = sameLevel.filter((concept) => concept.concept_type === target.concept_type);
    const sameElement = sameLevel.filter((concept) => concept.primary_element === target.primary_element);
    if (target.primary_element === "Styles") {
      const comparableHintText = (value) => ` ${normaliseText(value).replace(/[^a-z0-9]+/g, " ").trim()} `;
      const reviewedHints = Object.entries(STRONG_HINTS)
        .filter(([key]) => key === target.concept_id || key.startsWith(`${target.concept_id}|`))
        .map(([, hint]) => comparableHintText(hint));
      const hintSafeStyles = sameElement.filter((candidate) => !conceptTerms(candidate)
        .some((term) => reviewedHints.some((hint) => hint.includes(comparableHintText(term)))));
      const styleCandidates = rotate(uniqueConcepts(hintSafeStyles, target), Number(target.concept_id.slice(-4)) + salt * 7);
      if (styleCandidates.length < 3) throw new Error(`Not enough same-level style distractors for ${target.concept_id}.`);
      return styleCandidates.slice(0, 3).map((concept) => concept.concept);
    }
    const differentTypeSameElement = sameElement.filter((concept) => concept.concept_type !== target.concept_type);
    const differentType = sameLevel.filter((concept) => concept.concept_type !== target.concept_type);
    const easyGroupPeer = rotate(uniqueConcepts(groupPeers, target), Number(target.concept_id.slice(-4)) + salt * 7).slice(0, 1);
    const tiers = difficulty === "Easy"
      ? [easyGroupPeer, differentTypeSameElement, differentType, sameElement, sameType, sameLevel]
      : [explicit, groupPeers, sameType, sameElement, sameLevel];
    const rotatedTiers = tiers.map((tier, index) =>
      rotate(uniqueConcepts(tier, target), Number(target.concept_id.slice(-4)) + salt * 7 + index * 3));
    const candidates = uniqueConcepts(rotatedTiers.flat(), target);
    if (candidates.length < 3) throw new Error(`Not enough same-level distractors for ${target.concept_id}.`);
    return candidates.slice(0, 3).map((concept) => concept.concept);
  };
}

function factPriority(fact) {
  return fact.aural_relevance === "direct" ? 0 : 1;
}

function sortedFacts(concept) {
  return (concept.question_eligible_facts || []).slice().sort((left, right) =>
    factPriority(left) - factPriority(right) || left.fact_id.localeCompare(right.fact_id));
}

function pickQuestionType(concept, fact, preferred) {
  const conceptTypes = concept.question_support?.allowed_question_types || [];
  const factTypes = fact.question_types || [];
  return preferred.find((type) => conceptTypes.includes(type) && factTypes.includes(type))
    || preferred.find((type) => conceptTypes.includes(type))
    || factTypes.find((type) => conceptTypes.includes(type))
    || conceptTypes[0];
}

function strongHintFor(concept, senseId = null) {
  const key = strongHintKey(concept.concept_id, senseId);
  const hint = STRONG_HINTS[key];
  if (!hint) throw new Error(`No reviewed strong hint exists for ${key} (${concept.concept}).`);
  return pupilFriendlyText(hint);
}

function containsForbiddenHintTerm(hint, concept, correctText) {
  const normalisedHint = ` ${normaliseText(hint)} `;
  const forbidden = [...hintForbiddenTerms(concept), correctText]
    .map(normaliseText).filter(Boolean);
  return forbidden.some((term) => normalisedHint.includes(` ${term} `) || normalisedHint.trim() === term);
}

function createHint(concept, primaryFact) {
  const primarySenseId = senseRule(concept, primaryFact.fact_id).senseId;
  const text = strongHintFor(concept, primarySenseId);
  if (containsForbiddenHintTerm(text, concept, concept.concept)) {
    throw new Error(`Reviewed strong hint for ${strongHintKey(concept.concept_id, primarySenseId)} reveals the answer term.`);
  }
  return { text, factId: null };
}

function explanationFor(concept, fact) {
  return `${concept.concept} is correct: ${pupilFriendlyText(reviewedFactText(fact))}`;
}

// Keep the language around the required musical vocabulary direct and
// familiar. These substitutions are deliberately conservative: they change
// general prose, never a course term or an answer option.
const PUPIL_FRIENDLY_REPLACEMENTS = [
  [/\bcommonly\b/gi, "often"],
  [/\bfrequently\b/gi, "often"],
  [/\bnormally\b/gi, "usually"],
  [/\btypically\b/gi, "usually"],
  [/\btypical\b/gi, "common"],
  [/\bgenerally\b/gi, "usually"],
  [/\bprincipally\b/gi, "mainly"],
  [/\bprimarily\b/gi, "mainly"],
  [/\bprincipal\b/gi, "main"],
  [/\bsimultaneously\b/gi, "at the same time"],
  [/\bapproximately\b/gi, "about"],
  [/\broughly\b/gi, "about"],
  [/\bsuccessively\b/gi, "in turn"],
  [/\bintervening pitches\b/gi, "pitches in between"],
  [/\bsubstantial\b/gi, "large"],
  [/\borchestral counterpart\b/gi, "orchestral version"],
  [/\bconventional lyrics\b/gi, "usual lyrics"],
  [/\brecurs\b/gi, "returns"],
  [/\balthough\b/gi, "though"],
  [/\bprovided that\b/gi, "as long as"],
  [/\bIt is characterised by\b/g, "It has"],
  [/\bcharacterised by\b/gi, "with"],
  [/\bCharacteristic features include\b/g, "Common features are"],
  [/\bcharacteristic features include\b/gi, "common features are"],
];

function pupilFriendlyText(value) {
  return PUPIL_FRIENDLY_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, (match) =>
      /^[A-Z]/.test(match) ? `${replacement[0].toUpperCase()}${replacement.slice(1)}` : replacement),
    String(value || ""),
  ).replace(/\s+/g, " ").trim();
}

function reviewedFactText(fact) {
  return PUPIL_FRIENDLY_FACT_OVERRIDES[fact.fact_id]
    || FACT_CLUE_OVERRIDES[fact.fact_id]
    || fact.text;
}

function cleanMaskedText(value, concept) {
  const cleaned = pupilFriendlyText(maskConceptTerms(value, concept))
    .replace(/\b(?:a|an|the)\s+this concept\b/gi, "this concept")
    .replace(/\bthis concept-theatre\b/gi, "theatre-style")
    .trim();
  return cleaned ? `${cleaned[0].toUpperCase()}${cleaned.slice(1)}` : cleaned;
}

function includesNormalisedPhrase(value, term) {
  const source = ` ${normaliseText(value)} `;
  const target = normaliseText(term);
  return Boolean(target) && source.includes(` ${target} `);
}

function makeClue(concept, fact, maximumLength = 190) {
  const source = reviewedFactText(fact);
  return compactFact(cleanMaskedText(source, concept), maximumLength);
}

function comparisonClue(concept, comparison, maximumLength) {
  const override = DISTINCTION_CLUE_OVERRIDES[`${concept.concept_id}|${comparison.concept_id}`];
  return compactFact(override || cleanMaskedText(comparison.difference, concept), maximumLength);
}

function selectComparison(concept, conceptsById) {
  const distinctions = (concept.distinguish_from || [])
    .map((item) => ({ ...item, target: conceptsById.get(item.concept_id) }))
    .filter((item) => item.target?.level === concept.level);
  return distinctions[0] || null;
}

function firstComparisonGroup(concept, validGroupIds) {
  return (concept.comparison_group_ids || []).find((id) => validGroupIds.has(id)) || null;
}

const MAX_QUESTION_STEM_LENGTH = 200;
const PREFERRED_QUESTION_STEM_LENGTH = 180;

// These variants shorten only at complete sentence or trailing-clause
// boundaries. The composer never slices words or silently removes a required
// musical idea.
function conciseClueVariants(value) {
  const full = ensureTerminalPunctuation(value).replace(/\s+/g, " ");
  const candidates = new Set([full]);
  const addCandidate = (candidate) => {
    const text = ensureTerminalPunctuation(String(candidate || "").trim().replace(/[;,]+$/, ""));
    if (text.length >= 35 && !/[,:;]\.$/.test(text)) candidates.add(text);
  };
  const firstSentence = full.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (firstSentence) addCandidate(firstSentence);
  const semicolonIndex = full.indexOf(";");
  if (semicolonIndex >= 0) addCandidate(full.slice(0, semicolonIndex));
  [
    /,\s+(?:although|while|whereas|but)\b/i,
    /,\s+(?:which|who|where|with|including|producing|creating|giving|allowing|performed|played|sung|heard|used|written|found|built|made|often|usually|sometimes)\b/i,
    /,\s+and\s+(?:may|can|often|usually|sometimes)\b/i,
  ].forEach((boundary) => {
    const match = full.match(boundary);
    if (match?.index != null) addCandidate(full.slice(0, match.index));
  });
  return [...candidates].sort((left, right) => right.length - left.length);
}

function factClueVariants(concept, fact) {
  return conciseClueVariants(makeClue(concept, fact));
}

function composeQuestionStem(requiredClueVariants, prompt, maximumLength = MAX_QUESTION_STEM_LENGTH) {
  let combinations = [[]];
  requiredClueVariants.forEach((variants) => {
    combinations = combinations.flatMap((combination) => variants.map((variant) => [...combination, variant]));
  });
  const fitting = combinations.map((clues) => `${clues.join(" ")} ${prompt}`)
    .filter((text) => text.length <= maximumLength)
    .sort((left, right) => right.length - left.length);
  if (!fitting.length) {
    const shortest = combinations.map((clues) => `${clues.join(" ")} ${prompt}`)
      .sort((left, right) => left.length - right.length)[0];
    throw new Error(`Required question clues exceed their ${maximumLength}-character layout budget: ${shortest}`);
  }
  return fitting[0];
}

function questionStemBudget(concept, fact) {
  return MAX_QUESTION_STEM_LENGTH - senseRule(concept, fact.fact_id).prefix.length;
}

function preferredQuestionStemBudget(concept, fact) {
  return PREFERRED_QUESTION_STEM_LENGTH - senseRule(concept, fact.fact_id).prefix.length;
}

function misconceptionCorrection(concept, misconception) {
  const correction = MISCONCEPTION_CORRECTION_OVERRIDES[concept.concept_id];
  if (!correction) {
    throw new Error(`No concise positive correction has been reviewed for ${concept.concept_id}: ${misconception}`);
  }
  return pupilFriendlyText(correction);
}

function buildCanonicalQuestions(bank, mappings, requestedLevels) {
  const conceptsById = new Map(bank.concepts.map((concept) => [concept.concept_id, concept]));
  const validGroupIds = new Set(bank.comparison_groups.map((group) => group.group_id));
  const pickDistractors = createDistractorPicker(bank);
  const mappingByConcept = new Map(mappings.filter((mapping) => mapping.resolutionStatus === "resolved")
    .map((mapping) => [mapping.conceptId, mapping]));
  const sequenceCounts = new Map();
  const comparisonPairsUsed = new Set();
  const records = [];

  function nextSequence(concept, fact, difficulty) {
    const key = `${concept.concept_id}|${fact.fact_id}|${difficulty}`;
    const sequence = (sequenceCounts.get(key) || 0) + 1;
    sequenceCounts.set(key, sequence);
    return sequence;
  }

  function addQuestion(concept, fact, difficulty, settings) {
    const sequence = nextSequence(concept, fact, difficulty);
    const sense = senseRule(concept, fact.fact_id);
    const explicitIds = settings.explicitDistractorIds || [];
    const distractors = settings.distractors || pickDistractors(concept, difficulty, sequence + records.length, explicitIds);
    const comparisonGroupId = settings.comparisonGroupId || firstComparisonGroup(concept, validGroupIds);
    const literacyMapping = mappingByConcept.get(concept.concept_id);
    const stemStartsWithSenseContext = sense.context
      && normaliseStem(settings.stem).startsWith(normaliseStem(sense.context));
    const questionText = sense.prefix && !stemStartsWithSenseContext
      ? `${sense.prefix}${settings.stem[0].toLowerCase()}${settings.stem.slice(1)}`
      : settings.stem;
    const generatedHint = settings.hint
      ? { text: settings.hint, factId: settings.hintFactId || null }
      : createHint(concept, fact);
    records.push({
      id: questionId({ level: concept.level, conceptId: concept.concept_id, factId: fact.fact_id, difficulty, sequence }),
      level: concept.level,
      category: concept.primary_element,
      categories: concept.categories.slice(),
      conceptId: concept.concept_id,
      concept: concept.concept,
      factId: fact.fact_id,
      supportingFactIds: settings.supportingFactIds || [],
      senseId: sense.senseId,
      senseContext: sense.context,
      comparisonGroupId: settings.useComparisonGroup === false ? null : comparisonGroupId,
      difficulty,
      questionType: settings.questionType,
      answerMode: "concept",
      question: questionText,
      answers: [],
      hint: generatedHint.text,
      hintFactId: generatedHint.factId,
      explanation: explanationFor(concept, fact),
      literacyLink: literacyMapping ? {
        relationship: literacyMapping.relationship,
        targets: literacyMapping.targets.map((target) => ({
          sourceFile: target.sourceFile,
          localIds: target.localIds.slice(),
          matchKind: target.matchKind,
        })),
        targetLiteracyIds: literacyMapping.targetLiteracyIds.slice(),
      } : null,
      _correctText: concept.concept,
      _distractors: distractors,
    });
  }

  bank.concepts.filter((concept) => requestedLevels.includes(concept.level)).forEach((concept) => {
    const facts = sortedFacts(concept).filter((fact) => !DO_NOT_USE.has(fact.fact_id));
    const standaloneFacts = facts.filter((fact) => !DO_NOT_USE_ALONE.has(fact.fact_id));
    const comparison = selectComparison(concept, conceptsById);
    const comparisonGroupId = firstComparisonGroup(concept, validGroupIds);

    standaloneFacts.slice(0, 3).forEach((fact, index) => {
      const clue = makeClue(concept, fact);
      const distractorOverride = QUESTION_DISTRACTOR_OVERRIDES[
        `${concept.concept_id}|${fact.fact_id}|Easy`
      ];
      const templates = [
        `${clue} What is this?`,
        `${clue} Which term fits?`,
        `${clue} Which concept fits?`,
      ];
      addQuestion(concept, fact, "Easy", {
        stem: templates[index % templates.length],
        questionType: pickQuestionType(concept, fact, [
          "definition", "feature_identification", "sound_production", "instrumentation_identification",
          "relative_register", "harmonic_function", "section_order", "classification",
        ]),
        comparisonGroupId,
        distractors: distractorOverride,
      });
    });

    const firstFact = standaloneFacts[0] || facts[0];
    const firstSenseId = senseRule(concept, firstFact.fact_id).senseId;
    const firstSenseFacts = facts.filter((fact) => senseRule(concept, fact.fact_id).senseId === firstSenseId);
    const secondFact = firstSenseFacts.find((fact) => fact.fact_id !== firstFact.fact_id);
    if (secondFact) {
      const mediumStem = composeQuestionStem(
        [factClueVariants(concept, firstFact)],
        "Which option matches the clue?",
        preferredQuestionStemBudget(concept, firstFact),
      );
      addQuestion(concept, firstFact, "Medium", {
        stem: mediumStem,
        questionType: pickQuestionType(concept, firstFact, ["written_listening_scenario", "feature_identification", "comparison", "structural_reasoning", "definition"]),
        comparisonGroupId,
      });
    } else {
      const mediumStem = composeQuestionStem(
        [factClueVariants(concept, firstFact)],
        "Which is the best match?",
        preferredQuestionStemBudget(concept, firstFact),
      );
      addQuestion(concept, firstFact, "Medium", {
        stem: mediumStem,
        questionType: pickQuestionType(concept, firstFact, ["feature_identification", "classification", "definition", "comparison"]),
        comparisonGroupId,
      });
    }

    const comparisonPair = comparison ? [concept.concept_id, comparison.concept_id].sort().join("|") : null;
    if (comparison && !comparisonPairsUsed.has(comparisonPair)) {
      comparisonPairsUsed.add(comparisonPair);
      const comparisonStem = composeQuestionStem(
        [factClueVariants(concept, firstFact)],
        "Which term matches?",
        questionStemBudget(concept, firstFact),
      );
      addQuestion(concept, firstFact, "Medium", {
        stem: comparisonStem,
        questionType: "comparison",
        explicitDistractorIds: [comparison.concept_id],
        comparisonTarget: comparison,
        comparisonGroupId,
      });
    } else if (firstSenseFacts.filter((fact) => !DO_NOT_USE_ALONE.has(fact.fact_id)).length >= 3) {
      const independentlyDiscriminatingSenseFacts = firstSenseFacts
        .filter((fact) => !DO_NOT_USE_ALONE.has(fact.fact_id));
      const lastFact = independentlyDiscriminatingSenseFacts.at(-1);
      const alternateMediumStem = composeQuestionStem(
        [factClueVariants(concept, lastFact)],
        "Which option matches the clue?",
        preferredQuestionStemBudget(concept, lastFact),
      );
      addQuestion(concept, lastFact, "Medium", {
        stem: alternateMediumStem,
        questionType: pickQuestionType(concept, lastFact, ["comparison", "written_listening_scenario", "structural_reasoning", "feature_identification", "definition"]),
        comparisonGroupId,
      });
    }

    const misconception = concept.common_misconceptions?.[0];
    const supportingFacts = facts.filter((fact) => fact.fact_id !== firstFact.fact_id
      && senseRule(concept, fact.fact_id).senseId === firstSenseId)
      .slice(0, comparison || misconception ? 1 : 2);
    if (supportingFacts.length || comparison || misconception) {
      const hardStem = comparison
        ? composeQuestionStem(
          [factClueVariants(concept, firstFact)],
          "Which term fits best?",
          questionStemBudget(concept, firstFact),
        )
        : misconception
          ? composeQuestionStem(
            [conciseClueVariants(misconceptionCorrection(concept, misconception))],
            "Which term fits best?",
            questionStemBudget(concept, firstFact),
          )
        : composeQuestionStem(
          [factClueVariants(concept, firstFact)],
          "Which term fits best?",
          questionStemBudget(concept, firstFact),
        );
      addQuestion(concept, firstFact, "Hard", {
        stem: hardStem,
        questionType: comparison || misconception
          ? "comparison"
          : pickQuestionType(concept, firstFact, concept.senses?.length
            ? ["terminology_disambiguation", "comparison", "structural_reasoning", "feature_identification"]
            : ["comparison", "structural_reasoning", "written_listening_scenario", "feature_identification", "definition"]),
        supportingFactIds: [],
        explicitDistractorIds: comparison ? [comparison.concept_id] : [],
        comparisonTarget: comparison,
        comparisonGroupId,
      });
    }
  });

  ODD_ONE_OUT_CASES.forEach((definition) => {
    const concept = conceptsById.get(definition.target);
    if (!concept || !requestedLevels.includes(concept.level)) return;
    if (concept.primary_element === "Styles") return;
    const facts = sortedFacts(concept);
    const distractorConcepts = definition.distractors.map((id) => conceptsById.get(id));
    if (distractorConcepts.some((candidate) => !candidate || candidate.level !== concept.level)) {
      throw new Error(`Odd-one-out case ${definition.target} contains an invalid or cross-level distractor.`);
    }
    addQuestion(concept, facts[0], "Hard", {
      stem: definition.criterion,
      questionType: "odd_one_out",
      distractors: distractorConcepts.map((candidate) => candidate.concept),
      useComparisonGroup: false,
    });
  });

  return records;
}

function loadMediumFeatureBank() {
  if (!fs.existsSync(MEDIUM_FEATURE_DIRECTORY)) throw new Error("The reviewed Medium feature directory is missing.");
  const combined = {};
  fs.readdirSync(MEDIUM_FEATURE_DIRECTORY).filter((filename) => filename.endsWith(".json")).sort().forEach((filename) => {
    const value = JSON.parse(fs.readFileSync(path.join(MEDIUM_FEATURE_DIRECTORY, filename), "utf8"));
    if (value?.schemaVersion !== "1.0" || !value.concepts || Array.isArray(value.concepts)) {
      throw new Error(`${filename}: invalid reviewed Medium feature file.`);
    }
    Object.entries(value.concepts).forEach(([conceptId, entry]) => {
      if (combined[conceptId]) throw new Error(`${conceptId}: reviewed Medium features are declared more than once.`);
      combined[conceptId] = entry;
    });
  });
  return combined;
}

function firstSlotFact(concept) {
  const facts = sortedFacts(concept);
  const preferred = facts.find((fact) => !DO_NOT_USE.has(fact.fact_id) && !DO_NOT_USE_ALONE.has(fact.fact_id));
  const fallback = facts.find((fact) => !DO_NOT_USE.has(fact.fact_id)) || facts[0];
  if (!preferred && !fallback) throw new Error(`${concept.concept_id}: no eligible fact is available for its fixed question slots.`);
  return preferred || fallback;
}

function slotQuestionId(concept, fact, difficulty) {
  return questionId({
    level: concept.level,
    conceptId: concept.concept_id,
    factId: fact.fact_id,
    difficulty,
    sequence: 1,
  });
}

function fixedSlotRecord(concept, fact, difficulty, mapping, values) {
  const sense = senseRule(concept, fact.fact_id);
  return {
    id: slotQuestionId(concept, fact, difficulty),
    level: concept.level,
    category: concept.primary_element,
    categories: concept.categories.slice(),
    conceptId: concept.concept_id,
    concept: concept.concept,
    factId: fact.fact_id,
    supportingFactIds: [],
    senseId: sense.senseId,
    senseContext: sense.context,
    comparisonGroupId: null,
    difficulty,
    questionType: values.questionType,
    answerMode: values.answerMode,
    conceptDescription: values.conceptDescription || "",
    prompt: values.prompt || "",
    question: values.question || "",
    answers: values.answers || [],
    hint: values.hint || "",
    hintFactId: null,
    explanation: values.explanation || "",
    literacyLink: mapping ? {
      relationship: mapping.relationship,
      targets: mapping.targets.map((target) => ({
        sourceFile: target.sourceFile,
        localIds: target.localIds.slice(),
        matchKind: target.matchKind,
      })),
      targetLiteracyIds: mapping.targetLiteracyIds.slice(),
    } : null,
    complete: values.complete === true,
    overridden: false,
    featureSourceConceptId: values.featureSourceConceptId || null,
    _correctOption: values.correctOption || null,
    _distractorOptions: values.distractorOptions || [],
  };
}

function answerOption(value, correct) {
  if (typeof value === "string") return { text: value, correct };
  return {
    text: value.text,
    correct,
    ...(value.featureOfConceptId ? { featureOfConceptId: value.featureOfConceptId } : {}),
  };
}

function assignFixedSlotAnswers(slots) {
  LEVELS.forEach((level) => {
    ["Easy", "Medium"].forEach((difficulty) => {
      slots.filter((slot) => slot.level === level && slot.difficulty === difficulty)
        .sort((left, right) => left.id.localeCompare(right.id))
        .forEach((slot, index) => {
          const answers = slot._distractorOptions.map((option) => answerOption(option, false));
          answers.splice(index % 4, 0, answerOption(slot._correctOption, true));
          slot.answers = answers;
        });
    });
  });
  slots.forEach((slot) => {
    delete slot._correctOption;
    delete slot._distractorOptions;
  });
}

function buildFixedQuestionSlots(bank, mappings, requestedLevels) {
  const reviewedMediumFeatures = loadMediumFeatureBank();
  const conceptsById = new Map(bank.concepts.map((concept) => [concept.concept_id, concept]));
  const mappingByConcept = new Map(mappings.filter((mapping) => mapping.resolutionStatus === "resolved")
    .map((mapping) => [mapping.conceptId, mapping]));
  const pickDistractors = createDistractorPicker(bank);
  const slots = [];

  bank.concepts.filter((concept) => requestedLevels.includes(concept.level)).forEach((concept, index) => {
    const fact = firstSlotFact(concept);
    const slotSense = senseRule(concept, fact.fact_id);
    const mapping = mappingByConcept.get(concept.concept_id);
    const baseDescription = makeClue(concept, fact);
    const description = ensureTerminalPunctuation(slotSense.prefix
      ? `${slotSense.prefix}${baseDescription[0].toLowerCase()}${baseDescription.slice(1)}`
      : baseDescription);
    const easyHint = createHint(concept, fact).text;
    const easyDistractorOverride = QUESTION_DISTRACTOR_OVERRIDES[
      `${concept.concept_id}|${fact.fact_id}|Easy`
    ];
    slots.push(fixedSlotRecord(concept, fact, "Easy", mapping, {
      questionType: pickQuestionType(concept, fact, [
        "definition",
        "feature_identification",
        "classification",
        "written_listening_scenario",
        "structural_reasoning",
        "comparison",
      ]),
      answerMode: "concept",
      conceptDescription: description,
      prompt: CONCEPT_IDENTIFICATION_PROMPT,
      question: `${description} What is this?`,
      hint: easyHint,
      explanation: description,
      complete: true,
      correctOption: concept.concept,
      distractorOptions: easyDistractorOverride || pickDistractors(concept, "Easy", index),
    }));

    const medium = reviewedMediumFeatures[concept.concept_id];
    if (!medium) throw new Error(`${concept.concept_id}: reviewed Medium features are missing.`);
    if (!Array.isArray(medium.trueFeatures) || medium.trueFeatures.length !== 3
      || medium.trueFeatures.some((feature) => !String(feature || "").trim() || String(feature).length > 120)) {
      throw new Error(`${concept.concept_id}: exactly three reviewed Medium features of 120 characters or fewer are required.`);
    }
    const falseFeature = String(medium.falseFeature || "").trim();
    const falseSource = conceptsById.get(medium.falseSourceConceptId);
    if (!falseFeature || falseFeature.length > 120 || !falseSource || falseSource.level !== concept.level || falseSource.concept_id === concept.concept_id) {
      throw new Error(`${concept.concept_id}: its reviewed false Medium feature or source concept is invalid.`);
    }
    const falseSourceFact = firstSlotFact(falseSource);
    const falseSourceHint = strongHintFor(falseSource, senseRule(falseSource, falseSourceFact.fact_id).senseId);
    const falseFeatureForFeedback = falseFeature.replace(/[.!?]+$/, "");
    const mediumPrompt = `Which is NOT a feature of ${concept.concept}?`;
    slots.push(fixedSlotRecord(concept, fact, "Medium", mapping, {
      questionType: "feature_exclusion",
      answerMode: "not_feature",
      prompt: mediumPrompt,
      question: mediumPrompt,
      hint: falseSourceHint,
      explanation: `The statement “${falseFeatureForFeedback}” describes ${falseSource.concept}, not ${concept.concept}. ${description}`,
      complete: true,
      featureSourceConceptId: falseSource.concept_id,
      correctOption: { text: falseFeature, featureOfConceptId: falseSource.concept_id },
      distractorOptions: medium.trueFeatures.map((text) => ({ text: String(text).trim(), featureOfConceptId: concept.concept_id })),
    }));

    slots.push(fixedSlotRecord(concept, fact, "Hard", mapping, {
      questionType: "teacher_authored",
      answerMode: "custom",
      complete: false,
      answers: Array.from({ length: 4 }, () => ({ text: "", correct: false })),
    }));
  });
  assignFixedSlotAnswers(slots);
  return slots;
}

function editableSlotIsComplete(slot) {
  const prompt = String(slot.prompt || "").trim();
  const conceptDescription = String(slot.conceptDescription || "").trim();
  const answers = Array.isArray(slot.answers) ? slot.answers : [];
  const answerTexts = answers.map((answer) => normaliseText(answer?.text));
  return Boolean(prompt && prompt.endsWith("?")
    && (slot.difficulty !== "Easy"
      || (conceptDescription && prompt === CONCEPT_IDENTIFICATION_PROMPT))
    && answers.length === 4
    && answerTexts.every(Boolean)
    && new Set(answerTexts).size === 4
    && answers.filter((answer) => answer.correct === true).length === 1
    && String(slot.hint || "").trim()
    && String(slot.explanation || "").trim());
}

function editableSlotCanEnterPool(slot) {
  const prompt = String(slot.prompt || "").trim();
  const answers = Array.isArray(slot.answers) ? slot.answers : [];
  return Boolean(prompt)
    && answers.length === 4
    && answers.every((answer) => String(answer?.text || "").trim())
    && answers.filter((answer) => answer.correct === true).length === 1;
}

function blankSlot(slot) {
  slot.conceptDescription = "";
  slot.prompt = "";
  slot.question = "";
  slot.answers = Array.from({ length: 4 }, () => ({ text: "", correct: false }));
  slot.hint = "";
  slot.explanation = "";
  slot.useDescriptionAsFeedback = false;
  slot.complete = false;
  slot.fullyComplete = false;
  slot.answerMode = "custom";
  slot.questionType = "teacher_authored";
  slot.featureSourceConceptId = null;
}

function applyFixedSlotOverrides(slots, manualOverrides) {
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
  Object.entries(manualOverrides.questions).forEach(([id, override]) => {
    const slot = slotsById.get(id);
    if (!slot) throw new Error(`Manual question override refers to unknown fixed slot ${id}.`);
    const generatedQuestionType = slot.questionType;
    const generatedFeatureSourceConceptId = slot.featureSourceConceptId;
    slot.overridden = true;
    if (override.cleared === true) {
      blankSlot(slot);
      return;
    }
    slot.conceptDescription = String(override.conceptDescription || "").trim();
    slot.prompt = String(override.prompt || "").trim();
    const answerTexts = Array.isArray(override.answers) ? override.answers.slice(0, 4).map((answer) => String(answer || "").trim()) : [];
    while (answerTexts.length < 4) answerTexts.push("");
    const correctAnswer = Number(override.correctAnswer);
    slot.answers = answerTexts.map((text, index) => ({
      text,
      correct: index === correctAnswer,
      ...(slot.difficulty === "Medium" ? {
        featureOfConceptId: index === correctAnswer ? generatedFeatureSourceConceptId : slot.conceptId,
      } : {}),
    }));
    slot.hint = String(override.hint || "").trim();
    slot.useDescriptionAsFeedback = override.useDescriptionAsFeedback === true
      || (override.useDescriptionAsFeedback == null
        && slot.difficulty === "Easy" && Boolean(slot.conceptDescription));
    slot.explanation = slot.useDescriptionAsFeedback
      ? slot.conceptDescription
      : String(override.explanation || "").trim();
    slot.question = slot.conceptDescription
      ? `${ensureTerminalPunctuation(slot.conceptDescription)} ${slot.prompt}`.trim()
      : slot.prompt;
    const standardMediumQuestion = slot.difficulty === "Medium"
      && !slot.conceptDescription
      && slot.prompt === `Which is NOT a feature of ${slot.concept}?`;
    slot.answerMode = slot.difficulty === "Easy" ? "concept" : standardMediumQuestion ? "not_feature" : "custom";
    slot.questionType = slot.difficulty === "Easy"
      ? generatedQuestionType
      : standardMediumQuestion ? "feature_exclusion" : "teacher_authored";
    slot.featureSourceConceptId = standardMediumQuestion ? generatedFeatureSourceConceptId : null;
    slot.fullyComplete = editableSlotIsComplete(slot);
    slot.complete = editableSlotCanEnterPool(slot);
    if (slot.complete && !slot.fullyComplete) {
      slot.answerMode = "custom";
      slot.questionType = "teacher_authored";
      slot.featureSourceConceptId = null;
    }
  });
}

function fixedSlotEditorRecord(slot) {
  const fullyComplete = slot.fullyComplete === true
    || (slot.fullyComplete == null && editableSlotIsComplete(slot));
  return {
    id: slot.id,
    level: slot.level,
    levelCode: LEVEL_CODES[slot.level],
    difficulty: slot.difficulty,
    category: slot.category,
    concept: slot.concept,
    conceptId: slot.conceptId,
    factId: slot.factId,
    questionType: slot.questionType,
    answerMode: slot.answerMode,
    conceptDescription: slot.conceptDescription,
    prompt: slot.prompt,
    answers: slot.answers.map((answer) => answer.text),
    correctAnswer: slot.answers.findIndex((answer) => answer.correct),
    hint: slot.hint,
    explanation: slot.explanation,
    useDescriptionAsFeedback: slot.useDescriptionAsFeedback === true
      || (slot.useDescriptionAsFeedback == null
        && Boolean(slot.conceptDescription) && slot.explanation === slot.conceptDescription),
    status: slot.complete ? "ready" : "draft",
    completionState: !slot.complete ? "incomplete" : fullyComplete ? "complete" : "needs-details",
    overridden: slot.overridden,
  };
}

function fixedSlotToCanonicalQuestion(slot) {
  const isFullyComplete = slot.fullyComplete === true
    || (slot.fullyComplete == null && editableSlotIsComplete(slot));
  const {
    conceptDescription,
    prompt,
    complete,
    fullyComplete: _fullyComplete,
    useDescriptionAsFeedback,
    overridden,
    featureSourceConceptId,
    ...question
  } = slot;
  if (featureSourceConceptId) question.featureSourceConceptId = featureSourceConceptId;
  if (!isFullyComplete) {
    const correctAnswer = question.answers.find((answer) => answer.correct === true)?.text || "the selected answer";
    question.answerMode = "custom";
    question.questionType = "teacher_authored";
    delete question.featureSourceConceptId;
    question.hint = question.hint || "No hint is available for this question.";
    question.explanation = question.explanation || `The correct answer is ${correctAnswer}.`;
  }
  return question;
}

function ensureUniqueStems(records) {
  const seen = new Map();
  const rewrites = [];
  records.forEach((record) => {
    let normalised = normaliseStem(record.question);
    if (!seen.has(normalised)) {
      seen.set(normalised, record.id);
      return;
    }
    const original = record.question;
    record.question = `For ${record.level} ${record.category.toLowerCase()}, ${record.question[0].toLowerCase()}${record.question.slice(1)}`;
    normalised = normaliseStem(record.question);
    if (seen.has(normalised)) {
      record.question = `${record.question} Choose the most precise ${humaniseIdentifier(record.conceptType || "musical")} term.`;
      normalised = normaliseStem(record.question);
    }
    if (seen.has(normalised)) throw new Error(`Could not make question stem unique for ${record.id}.`);
    seen.set(normalised, record.id);
    rewrites.push({ id: record.id, reason: "Exact duplicate stem was rewritten with qualification context.", original });
  });
  return rewrites;
}

function assertQuestionStemLengths(records) {
  const overLimit = records.filter((record) => record.question.length > MAX_QUESTION_STEM_LENGTH);
  if (overLimit.length) {
    throw new Error(`${overLimit[0].id} exceeds the ${MAX_QUESTION_STEM_LENGTH}-character Millionaire layout limit: ${overLimit[0].question}`);
  }
}

function balanceAnswerPositions(records) {
  LEVELS.forEach((level) => {
    DIFFICULTIES.forEach((difficulty) => {
      records.filter((record) => record.level === level && record.difficulty === difficulty)
        .sort((left, right) => left.id.localeCompare(right.id))
        .forEach((record, index) => {
          const distractors = record._distractors.map((text) => ({ text, correct: false }));
          distractors.splice(index % 4, 0, { text: record._correctText, correct: true });
          record.answers = distractors;
        });
    });
  });
  records.forEach((record) => {
    delete record._correctText;
    delete record._distractors;
  });
}

function applyManualQuestionStructure(records, manualOverrides) {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  Object.entries(manualOverrides.questions).forEach(([id, override]) => {
    const record = recordsById.get(id);
    if (!record) throw new Error(`Manual question override refers to unknown question ID ${id}.`);
    if (override.difficulty != null) {
      if (!DIFFICULTIES.includes(override.difficulty)) throw new Error(`${id}: invalid manual difficulty.`);
      record.difficulty = override.difficulty;
    }
    if (override.deleted === true) record._manuallyDeleted = true;
  });
}

function applyManualQuestionOverrides(records, manualOverrides) {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  Object.entries(manualOverrides.questions).forEach(([id, override]) => {
    if (override.deleted === true) return;
    const record = recordsById.get(id);
    if (!record) throw new Error(`Manual question override refers to unknown question ID ${id}.`);
    const description = typeof override.conceptDescription === "string" ? override.conceptDescription.trim() : "";
    const prompt = typeof override.prompt === "string" ? override.prompt.trim() : "";
    const answers = Array.isArray(override.answers) ? override.answers.map((answer) => String(answer).trim()) : [];
    const correctAnswer = Number(override.correctAnswer);
    const hint = typeof override.hint === "string" ? override.hint.trim() : "";
    const explanation = typeof override.explanation === "string" ? override.explanation.trim() : "";

    if (!prompt || !prompt.endsWith("?")) throw new Error(`${id}: the question prompt must end with a question mark.`);
    if (answers.length !== 4 || answers.some((answer) => !answer) || new Set(answers.map(normaliseText)).size !== 4) {
      throw new Error(`${id}: enter four different, non-empty answers.`);
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) throw new Error(`${id}: choose one correct answer.`);
    if (!hint || !explanation) throw new Error(`${id}: the hint and explanation cannot be blank.`);

    record.question = description ? `${ensureTerminalPunctuation(description)} What is this?` : prompt;
    record._correctText = answers[correctAnswer];
    record._distractors = answers.filter((answer, index) => index !== correctAnswer);
    record.hint = hint;
    record.hintFactId = null;
    record.explanation = explanation;
  });
}

function useDescriptionsAsFeedback(records, manualOverrides) {
  records.forEach((record) => {
    const manual = manualOverrides.questions[record.id];
    const presentation = manual ? {
      conceptDescription: manual.conceptDescription || null,
      prompt: manual.prompt,
    } : conceptQuestionPresentation(record);
    if (presentation.conceptDescription && manual?.useDescriptionAsFeedback === true) {
      record.explanation = presentation.conceptDescription;
    }
  });
}

function displayedQuestionKey(record, manualOverrides) {
  const manual = manualOverrides.questions[record.id];
  const presentation = manual ? {
    conceptDescription: manual.conceptDescription || null,
    prompt: manual.prompt,
  } : conceptQuestionPresentation(record);
  const exactText = (value) => String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
  return [record.level, exactText(presentation.conceptDescription), exactText(presentation.prompt)].join("|");
}

function removeExactDisplayedDuplicates(records, manualOverrides) {
  const retained = [];
  const removed = [];
  LEVELS.forEach((level) => {
    const groups = new Map();
    records.filter((record) => record.level === level).forEach((record) => {
      const key = displayedQuestionKey(record, manualOverrides);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    });
    const difficultyCounts = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, 0]));
    const exactGroups = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
    exactGroups.filter(([, group]) => group.length === 1).forEach(([, group]) => {
      retained.push(group[0]);
      difficultyCounts[group[0].difficulty] += 1;
    });
    exactGroups.filter(([, group]) => group.length > 1)
      .sort(([, left], [, right]) => new Set(left.map((record) => record.difficulty)).size - new Set(right.map((record) => record.difficulty)).size
        || left[0].id.localeCompare(right[0].id))
      .forEach(([key, group]) => {
        const manuallyEdited = group.filter((record) => Object.prototype.hasOwnProperty.call(manualOverrides.questions, record.id));
        const reviewedAnswerSet = group.filter((record) => Object.prototype.hasOwnProperty.call(
          QUESTION_DISTRACTOR_OVERRIDES,
          `${record.conceptId}|${record.factId}|${record.difficulty[0].toUpperCase()}${record.difficulty.slice(1)}`,
        ));
        const candidates = manuallyEdited.length ? manuallyEdited : (reviewedAnswerSet.length ? reviewedAnswerSet : group);
        const availableDifficulties = [...new Set(candidates.map((record) => record.difficulty))]
          .sort((left, right) => difficultyCounts[left] - difficultyCounts[right]
            || DIFFICULTIES.indexOf(left) - DIFFICULTIES.indexOf(right));
        const retainedDifficulty = availableDifficulties[0];
        const kept = candidates.filter((record) => record.difficulty === retainedDifficulty)
          .sort((left, right) => left.id.localeCompare(right.id))[0];
        retained.push(kept);
        difficultyCounts[kept.difficulty] += 1;
        group.filter((record) => record.id !== kept.id).forEach((record) => removed.push({
          id: record.id,
          keptId: kept.id,
          level: record.level,
          difficulty: record.difficulty,
          reason: "Exact duplicate displayed description and question prompt.",
          duplicateKey: key,
        }));
      });
  });
  return { records: retained, removed };
}

function loadExistingLiteracyQuestions() {
  const bankPath = path.join(REPOSITORY_ROOT, "millionaire-question-bank.js");
  delete require.cache[require.resolve(bankPath)];
  return require(bankPath).filter((question) => question.category === "literacy");
}

function resolveLiteracyLinks(bank) {
  const literacyQuestions = loadExistingLiteracyQuestions();
  return bank.concepts.filter((concept) => concept.music_literacy_links?.length).flatMap((concept) =>
    concept.music_literacy_links.map((link) => {
      const terms = new Set((link.lookup_terms || []).map(normaliseText));
      const exactConceptMatches = literacyQuestions.filter((question) => terms.has(normaliseText(String(question.concept || "").replace(/-/g, " "))));
      const exactAnswerMatches = literacyQuestions.filter((question) => {
        const correct = question.answers?.find((answer) => answer.id === question.correctAnswer);
        return question.level === LEVEL_CODES[concept.level] && terms.has(normaliseText(correct?.text));
      });
      const targets = [...new Map([...exactConceptMatches, ...exactAnswerMatches]
        .filter((question) => question.level === LEVEL_CODES[concept.level])
        .map((question) => [question.id, question])).values()];
      const curatedTargets = (CURATED_LITERACY_TARGETS[concept.concept_id] || []).map((target) => ({
        sourceFile: target.sourceFile,
        localIds: target.localIds.slice(),
        matchKind: target.matchKind,
      }));
      const alreadyMappedQuestionIds = new Set(curatedTargets
        .filter((target) => target.sourceFile === "millionaire-question-bank.js")
        .flatMap((target) => target.localIds));
      const additionalQuestionIds = targets.map((question) => question.id)
        .filter((id) => !alreadyMappedQuestionIds.has(id)).sort();
      if (additionalQuestionIds.length) {
        curatedTargets.push({
          sourceFile: "millionaire-question-bank.js",
          localIds: additionalQuestionIds,
          matchKind: "automatic-exact-same-level-question-answer",
        });
      }
      const targetLiteracyIds = [...new Set(curatedTargets.flatMap((target) => target.localIds))].sort();
      return {
        conceptId: concept.concept_id,
        level: concept.level,
        concept: concept.concept,
        relationship: link.relationship,
        lookupTerms: (link.lookup_terms || []).slice(),
        targets: curatedTargets,
        targetLiteracyIds,
        resolutionStatus: curatedTargets.length ? "resolved" : "unresolved",
        resolutionMethod: curatedTargets.length
          ? "Manually reviewed exact canonical, listed-name or alias match to stable existing Music Literacy component or question IDs."
          : null,
      };
    }));
}

function toRuntimeQuestion(question, manualOverrides) {
  const answerIds = ["a", "b", "c", "d"];
  const answers = question.answers.map((answer, index) => ({ id: answerIds[index], text: answer.text }));
  const correctIndex = question.answers.findIndex((answer) => answer.correct);
  const range = DIFFICULTY_RANGES[question.difficulty];
  const manualPresentation = manualOverrides.questions[question.id];
  const presentation = manualPresentation ? {
    conceptDescription: manualPresentation.conceptDescription || null,
    prompt: manualPresentation.prompt,
  } : conceptQuestionPresentation(question);
  return {
    id: question.id,
    level: LEVEL_CODES[question.level],
    category: "concepts",
    concept: question.concept,
    conceptId: question.conceptId,
    factId: question.factId,
    supportingFactIds: question.supportingFactIds,
    senseId: question.senseId,
    comparisonGroupId: question.comparisonGroupId,
    musicConceptCategory: question.category,
    musicConceptCategories: question.categories,
    questionType: question.questionType,
    answerMode: question.answerMode,
    question: question.question,
    prompt: presentation.prompt,
    conceptDescription: presentation.conceptDescription,
    answers,
    correctAnswer: answerIds[correctIndex],
    explanation: question.explanation,
    tip: question.hint,
    difficulty: question.difficulty.toLowerCase(),
    difficultyMin: range.min,
    difficultyMax: range.max,
    type: "text",
    audioSrc: "",
    notationData: null,
    literacyLink: question.literacyLink,
  };
}

function countBy(items, keyFunction) {
  return Object.fromEntries([...items.reduce((map, item) => {
    const key = keyFunction(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function buildSummary(bank, records, mappings, sourceHash, duplicateRewrites, exactDuplicateRemovals, slots = []) {
  const countsByConcept = countBy(records, (question) => question.conceptId);
  const coverageByConcept = bank.concepts.map((concept) => {
    const conceptQuestions = records.filter((question) => question.conceptId === concept.concept_id);
    return {
      conceptId: concept.concept_id,
      level: concept.level,
      concept: concept.concept,
      Easy: conceptQuestions.filter((question) => question.difficulty === "Easy").length,
      Medium: conceptQuestions.filter((question) => question.difficulty === "Medium").length,
      Hard: conceptQuestions.filter((question) => question.difficulty === "Hard").length,
    };
  });
  const belowTarget = coverageByConcept.filter((entry) => entry.Easy < 1 || entry.Medium < 1)
    .map((entry) => {
      const source = bank.concepts.find((concept) => concept.concept_id === entry.conceptId);
      const independentlyDiscriminatingFacts = source.question_eligible_facts
        .filter((fact) => !DO_NOT_USE_ALONE.has(fact.fact_id) && !DO_NOT_USE.has(fact.fact_id)).length;
      const reasons = [];
      if (entry.Easy < 1) reasons.push(`No complete Easy slot is available from the ${independentlyDiscriminatingFacts} approved stand-alone facts.`);
      if (entry.Medium < 1) reasons.push("The reviewed NOT-a-feature slot is incomplete.");
      return { ...entry, target: { Easy: 1, Medium: 1 }, reasons };
    });
  const positions = {};
  LEVELS.forEach((level) => {
    positions[level] = {};
    DIFFICULTIES.forEach((difficulty) => {
      const questions = records.filter((question) => question.level === level && question.difficulty === difficulty);
      positions[level][difficulty] = [0, 1, 2, 3].map((position) =>
        questions.filter((question) => question.answers[position]?.correct).length);
    });
  });
  return {
    schemaVersion: "1.0",
    generatedAt: bank.edition?.date || null,
    sourceKnowledgeBank: KNOWLEDGE_BANK_FILENAME,
    sourceKnowledgeBankSha256: sourceHash,
    totalQuestions: records.length,
    totalEditorSlots: slots.length,
    editorSlotsPerDifficulty: countBy(slots, (slot) => slot.difficulty),
    readyEditorSlots: slots.filter((slot) => slot.complete).length,
    draftEditorSlots: slots.filter((slot) => !slot.complete).length,
    questionsPerLevel: countBy(records, (question) => question.level),
    questionsPerDifficulty: countBy(records, (question) => question.difficulty),
    questionsPerLevelAndDifficulty: Object.fromEntries(LEVELS.map((level) => [level,
      Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty,
        records.filter((question) => question.level === level && question.difficulty === difficulty).length]))])),
    questionsPerCategory: countBy(records, (question) => question.category),
    questionsPerConceptType: countBy(records, (question) =>
      bank.concepts.find((concept) => concept.concept_id === question.conceptId)?.concept_type || "unknown"),
    questionsPerQuestionType: countBy(records, (question) => question.questionType),
    questionsPerConcept: countsByConcept,
    correctAnswerPositionDistribution: positions,
    conceptsWithIncompleteRequiredSlots: belowTarget,
    blankHardSlots: coverageByConcept.filter((entry) => entry.Hard === 0),
    musicLiteracyLinks: {
      resolved: mappings.filter((mapping) => mapping.resolutionStatus === "resolved"),
      unresolved: mappings.filter((mapping) => mapping.resolutionStatus === "unresolved"),
    },
    duplicateQuestionsRemoved: exactDuplicateRemovals,
    ambiguousQuestionsRewrittenOrRemoved: [
      ...duplicateRewrites,
      ...[...DO_NOT_USE_ALONE].sort().map((factId) => ({
        factId,
        action: "used-only-as-supporting-evidence",
        reason: "Editorial review found that this fact was not independently discriminating enough for a fair stand-alone question.",
      })),
      ...[...DO_NOT_USE].sort().map((factId) => ({
        factId,
        action: "excluded-from-question-generation",
        reason: REDUNDANT_FACTS.has(factId)
          ? "Editorial review found that this fact repeated a shorter portion of another approved fact and produced redundant questions or clues."
          : "Editorial review found that the approved wording was too absolute to assess fairly without adding unapproved qualifications.",
      })),
      ...Object.keys(FACT_CLUE_OVERRIDES).sort().map((factId) => ({
        factId,
        action: "rewritten-as-answer-neutral-clue",
        reason: "An authored, source-faithful clue avoids revealing the answer, ungrammatical masking or excessive on-screen length.",
      })),
    ],
    nearDuplicateReview: [],
    validationStatus: "pending",
  };
}

function writeJson(filename, value) {
  fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`);
}

function writeRuntimeBank(records, sourceHash, manualOverrides) {
  const runtimeQuestions = records.map((question) => toRuntimeQuestion(question, manualOverrides));
  const content = `(function (root, factory) {\n  const questions = factory();\n  root.MILLIONAIRE_MUSIC_CONCEPT_QUESTION_BANK = questions;\n  if (typeof module === "object" && module.exports) module.exports = questions;\n})(typeof window !== "undefined" ? window : globalThis, function () {\n  "use strict";\n  // Generated from the five validated JSON banks. Do not edit this file directly.\n  // Source knowledge-bank SHA-256: ${sourceHash}\n  return ${JSON.stringify(runtimeQuestions, null, 2)};\n});\n`;
  fs.writeFileSync(RUNTIME_BANK_PATH, content);
  return sha256Text(content);
}

function main() {
  const requestedLevels = parseRequestedLevels();
  const bank = loadKnowledgeBank();
  assertKnowledgeBankReady(bank);
  const sourceHash = sha256File(KNOWLEDGE_BANK_PATH);
  const mappings = resolveLiteracyLinks(bank);
  const manualOverrides = loadManualQuestionOverrides();
  const slots = buildFixedQuestionSlots(bank, mappings, requestedLevels);
  applyFixedSlotOverrides(slots, manualOverrides);
  const records = slots.filter((slot) => slot.complete).map(fixedSlotToCanonicalQuestion);
  const duplicateRewrites = [];
  const exactDeduplication = { removed: [] };
  assertQuestionStemLengths(records);
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  writeJson(EDITOR_SLOTS_PATH, {
    schemaVersion: "1.0",
    slotCount: slots.length,
    slots: slots.map(fixedSlotEditorRecord),
  });

  const levelEntries = [];
  requestedLevels.forEach((level) => {
    const questions = records.filter((question) => question.level === level).sort((left, right) => left.id.localeCompare(right.id));
    const output = {
      schemaVersion: "1.0",
      bankType: "music-concept-questions",
      level,
      source: {
        knowledgeBankFile: KNOWLEDGE_BANK_FILENAME,
        knowledgeBankSchemaVersion: bank.schema_version,
        knowledgeBankSha256: sourceHash,
      },
      questions,
    };
    const filename = LEVEL_FILENAMES[level];
    const outputPath = path.join(OUTPUT_DIRECTORY, filename);
    writeJson(outputPath, output);
    levelEntries.push({
      level,
      levelCode: LEVEL_CODES[level],
      file: filename,
      questionCount: questions.length,
      difficultyCounts: Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty,
        questions.filter((question) => question.difficulty === difficulty).length])),
      sha256: sha256File(outputPath),
    });
  });

  writeJson(path.join(OUTPUT_DIRECTORY, "music-literacy-links.json"), {
    schemaVersion: "1.0",
    sourceKnowledgeBankSha256: sourceHash,
    mappings,
  });
  const runtimeSha256 = writeRuntimeBank(records, sourceHash, manualOverrides);
  writeJson(path.join(OUTPUT_DIRECTORY, "manifest.json"), {
    schemaVersion: "1.0",
    bankType: "music-concept-questions",
    generatedAt: bank.edition?.date || null,
    source: {
      knowledgeBankFile: KNOWLEDGE_BANK_FILENAME,
      knowledgeBankSchemaVersion: bank.schema_version,
      knowledgeBankSha256: sourceHash,
    },
    levels: levelEntries,
    runtimeAdapter: {
      file: path.relative(REPOSITORY_ROOT, RUNTIME_BANK_PATH),
      sha256: runtimeSha256,
      loadingNote: "The Hub is a no-build static site, so this generated adapter preserves the existing synchronous script-loading architecture.",
    },
    editorSlots: {
      file: path.relative(REPOSITORY_ROOT, EDITOR_SLOTS_PATH),
      slotCount: slots.length,
      sha256: sha256File(EDITOR_SLOTS_PATH),
    },
  });
  const summary = buildSummary(bank, records, mappings, sourceHash, duplicateRewrites, exactDeduplication.removed, slots);
  writeJson(path.join(OUTPUT_DIRECTORY, "summary.json"), summary);

  console.log(`Generated ${slots.length} fixed Music Concept editor slots (${records.length} currently playable).`);
  console.log(`Authoritative knowledge-bank SHA-256: ${sourceHash}`);
}

main();
