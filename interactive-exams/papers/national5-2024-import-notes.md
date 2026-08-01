# National 5 Music 2024 import notes

Use these notes before importing National 5 Music 2025 or any later Digital Past Paper.

## Official source set

- Question paper: `exampapers/n5/2024/Music N5 2024 Paper.pdf`
- Marking instructions: `exampapers/n5/2024/Music N5 2024 Answers.pdf`
- Audio: official Tracks 1–9 in `exampapers/n5/2024/`
- Interactive data: `interactive-exams/papers/national5-2024.js`
- Regression tests: `interactive-exams/tests/national5-2024.test.js`

Both official PDFs were rendered and checked page by page. Print-only candidate fields, barcodes, official-use material, page-turn instructions and additional blank answer pages were not reproduced.

## Mark inventory

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 6 | Vocal listening choices, short answers and chord-sequence grid |
| 2 | 4 | Four-part vertical vocal guide |
| 3 | 6 | Eight-bar shared score with tempo, time signature, direct note entry and dynamic placement |
| 4 | 8 | Six listening parts including two two-selection items |
| 5 | 4 | Four folk-music category groups |
| 6 | 3 | Sentence completion |
| 7 | 4 | Two style-and-reason groups |
| 8 | 5 | Rough work plus concept-marked final answer |

The question totals and individual-part totals must remain exactly 40.

## Whisper audio-marker workflow

Every official question track was transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker uses the beginning of the genuine spoken question part or replay cue. False text produced from singing and instrumental passages was ignored. Question 3 replay cues were also checked against their silence boundaries because Whisper produced repeated false phrases during the long answer period.

Calibrated markers:

- Question 1: `5.54`, `51.86`, `114.24`, `164.00`, `210.64`, `310.68`
- Question 2: `95.82`, `183.32`, `270.70`
- Question 3: `7.44`, `114.56`, `169.68`, `225.40`
- Question 4: `5.98`, `74.96`, `115.76`, `160.40`, `264.02`, `302.12`
- Question 5: `81.66`, `171.34`, `261.00`
- Question 6: `43.88`, `119.98`
- Question 7: `5.66`, `93.20`
- Question 8: `40.78`, `132.68`, `223.96`

Official audio durations used for bounds checking are `382.458776`, `359.653878`, `371.722449`, `374.230204`, `360.803265`, `191.503673`, `187.088980` and `432.300408` seconds for Questions 1–8 respectively. The regression test protects all 29 exact marker values, their chronological order and their track-duration bounds.

## Question 3 notation decisions

- The eight numbered bars are stored as structured data in `N5_2024_Q3_BARS`.
- Layout correction: the flat on the final quaver of bar 2 is positioned 4px further left for clear spacing.
- The score has no printed key signature and uses 4/4. The outlined A–C–E notes in bar 1 form A minor, chord I.
- The pupil physically places the tempo above bar 1. Accept Andante or Moderato.
- The pupil physically inserts the 4/4 time signature at the opening. Common time is also an official accepted answer.
- Bar 3 keeps E5 then D5 as two hidden quavers in the data. The pupil enters them directly into the score; hover and drag previews remain grey.
- The X box surrounds the E5 minim in bar 6. Accept either the note name E or the rhythm name minim.
- The printed `mf` remains below bar 1 and the diminuendo remains below bar 7.
- The pupil physically places an appropriate quiet dynamic below bar 8. Accept `mp`, `p` or `pp`, including their full Italian terms.
- The final bar uses the source's double barline.

The source-verified pitch and rhythm inventory is:

- Bar 1: A4 and C5 quavers; E5 crotchet tied to E5 quaver; E5 quaver; D5 and C5 quavers
- Bar 2: D5 minim tied to D5 quaver; D5 quaver; C5 and B flat 4 quavers
- Bar 3: A4 and D5 quavers; F5 crotchet tied to F5 quaver; F5 quaver; missing E5 and D5 quavers
- Bar 4: E5 semibreve
- Bar 5: C5 and F5 quavers; A5 crotchet tied to A5 quaver; A5 quaver; G5 and F5 quavers
- Bar 6: G5 dotted crotchet; F5 quaver; E5 minim
- Bar 7: G sharp 4 and B4 quavers; E5 crotchet tied to E5 quaver; D5, C5 and B4 quavers
- Bar 8: A4 semibreve

Every bar totals four crotchet beats. Before changing any note, compare the source paper, completed marking-instruction score, this inventory and the 2024 regression test together.

## Official marking edge cases retained

- Question 1(b) accepts trumpet or muted trumpet; Question 1(c) accepts walking bass or walking.
- Question 2 accepts alto or mezzo soprano, `rall`, `rit`, their full terms, or `a tempo`, and chromatic or chromatic scale.
- Question 3 accepts A minor, Am or chord I, but not A on its own.
- Question 4(f) accepts imperfect cadence or the equivalent ending on V/5.
- Question 6 accepts two/four in digits or words, and Baroque, concerto or recorder concerto.
- Question 7(a)(ii) requires any two accepted Scots-ballad features. Farming/Bothy-ballad implications, English language/accent and Gaelic do not support the answer.
- Question 7(b)(ii) requires one singular singer/voice with orchestra or strings, an operatic vocal style, or a solo song in opera. Plural voices, choir and chorus do not support the answer.

## Question 8 rules

- Award at most two concepts per heading and five marks overall.
- Full marks require concepts from at least three headings.
- `Ostinato`, `riff` or `repetition` can gain only one mark across Melody/harmony and Rhythm/tempo.
- Only concepts which actually earn marks are highlighted in green.
- Do not accept `bass` alone for double bass, `drum` or `drums` alone for drum kit, or `fill` alone for drum fills.
- Accept Allegro or Andante, but not Moderato.
- Accept full Italian dynamic terms, but not English equivalents.
- Keep perfect and imperfect cadence matching distinct.
- Do not let the dynamic term `mezzo piano` also earn the Piano instrument mark. A standalone Piano entry must still be credited.

## Required regression checks

Run:

- `interactive-exams/tests/national5-2024.test.js`
- `interactive-exams/tests/exam-engine.test.js`
- all earlier National 5 paper tests
- `pnpm test:desktop-layout`

The 2024 test protects the official alternatives and exclusions, all audio marker values and bounds, the complete eight-bar notation inventory, direct bar-3 note entry, dynamic and tempo alternatives, Question 7 reason logic, Question 8 caps and exclusions, score-render smoke testing and a complete automatic `40/40` attempt.

## Checklist for the next import

1. Render the official question paper and marking instructions before entering question data, then build the exact 40-mark inventory.
2. For notation, compare the blank source score with the completed answer score and inventory every bar by pitch, octave, duration, accidental, beam, stem, tie and total beat count.
3. Keep printed notation, editable boxes and pupil-applied answers as separate data and layers. Require notation answers to be applied physically where the source asks the pupil to insert them.
4. Transcribe every official audio track locally with Whisper word timestamps. Confirm difficult cues against silence and waveform boundaries, and ignore false transcription during music.
5. Encode every official accepted alternative and explicit exclusion before writing marking tests.
6. Test overlapping musical terms so one phrase cannot accidentally earn two concepts, while preserving genuinely separate concepts in the same answer.
7. Add exact regression checks for the musical inventory, marker values, duration bounds, marking caps, de-duplication, exclusions and a full-mark attempt.
