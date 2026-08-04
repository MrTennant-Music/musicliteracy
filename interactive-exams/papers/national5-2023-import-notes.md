# National 5 Music 2023 import notes

Use these notes before importing National 5 Music 2024 or any later Digital Past Paper.

## Official source set

- Question paper: `exampapers/n5/2023/Music N5 2023 Paper.pdf`
- Marking instructions: `exampapers/n5/2023/Music N5 2023 Answers.pdf`
- Audio: official Tracks 1–9 in `exampapers/n5/2023/`
- Interactive data: `interactive-exams/papers/national5-2023.js`
- Regression tests: `interactive-exams/tests/national5-2023.test.js`

The question paper and marking instructions were rendered and checked page by page. Print-only candidate fields, barcodes, official-use material, page-turn instructions and additional blank answer pages were not reproduced.

## Mark inventory

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 6 | Vocal listening choices, short answers and two selections |
| 2 | 4 | Four-part vertical instrumental guide |
| 3 | 6 | Ten-bar shared score with tempo, direct note entry and repeat-sign placement |
| 4 | 8 | Seven listening parts including a two-selection item |
| 5 | 4 | Four instrumental category groups |
| 6 | 3 | Sentence completion |
| 7 | 4 | Two style-and-reason groups |
| 8 | 5 | Rough work plus concept-marked final answer |

The question totals and individual-part totals must remain exactly 40.

## Whisper audio-marker workflow

Every official question track was transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker was taken from the beginning of the genuine spoken part or replay cue. Instrumental and sung passages produced some false transcription, so these were ignored. The missing second-play cue in Question 3 was resolved from the silence boundary immediately before the spoken cue and checked against the surrounding first- and third-play structure.

Calibrated markers:

- Question 1: `5.90`, `63.74`, `137.86`, `202.40`, `250.44`
- Question 2: `97.94`, `172.12`, `245.38`
- Question 3: `8.40`, `134.92`, `208.08`, `280.48`
- Question 4: `6.38`, `43.64`, `107.60`, `164.80`, `260.58`, `315.00`, `362.80`
- Question 5: `83.40`, `135.44`, `188.38`
- Question 6: `54.60`, `169.08`
- Question 7: `6.64`, `85.70`
- Question 8: `40.36`, `115.96`, `192.38`

Official audio durations used for bounds checking are `362.997551`, `320.783673`, `445.910204`, `417.253878`, `250.462041`, `284.395102`, `168.385306` and `386.351020` seconds for Questions 1–8 respectively. The regression test protects all 29 exact marker values, their chronological order and their track-duration bounds.

## Question 3 notation decisions

- The score is stored as a separate ten-bar pitch-and-rhythm inventory named `N5_2023_Q3_BARS`, with the two-note anacrusis stored separately as `N5_2023_Q3_ANACRUSIS`.
- The source is in F major and prints a 4/4 time signature, an opening repeat sign and first- and second-time bars.
- The tempo answer is placed above the opening. Accept Andante or Moderato.
- The pupil enters A4 then B flat 4 directly into the two quaver spaces in bar 2. Hover and drag previews remain grey.
- The X box surrounds the F5 dotted crotchet in bar 3, worth one and a half beats.
- The interval box covers B flat 4 to A4 at the start of bar 5. Accept semitone, 2 or any second.
- The repeat-sign tool physically replaces the printed barline at the end of bar 8. It uses the shared one-use Bravura repeat interaction.
- The first ending covers bars 7–8 and the second ending covers bars 9–10. Ties continue from bar 7 to 8 and from bar 9 to 10.

The source-verified pitch and rhythm inventory is:

- Anacrusis: A4 and B flat 4 quavers
- Bar 1: C5 dotted minim; A4 and B flat 4 quavers
- Bar 2: C5 dotted minim; missing A4 and B flat 4 quavers
- Bar 3: C5 crotchet; B flat 4 crotchet; F5 dotted crotchet; D5 quaver
- Bar 4: C5 crotchet; B flat 4 minim; F4 and G4 quavers
- Bar 5: B flat 4 crotchet; A4 crotchet; E5 crotchet; E5 and E flat 5 quavers
- Bar 6: D5 minim; E4 natural crotchet; F4 and G4 quavers
- Bar 7: C5 semibreve tied into bar 8
- Bar 8: C5 minim tied from bar 7; crotchet rest; F4 and A4 quavers
- Bar 9: F4 semibreve tied into bar 10
- Bar 10: F4 minim tied from bar 9

Every complete numbered bar totals four crotchet beats. Before changing any note, compare the source paper, marking-instruction score, this inventory and the 2023 regression test together.

## Official marking edge cases retained

- Question 1(c) requires the full term `mezzo soprano`; `mezzo` alone is not accepted.
- Question 2 accepts French horn or horns, arco, trill, and perfect cadence or the equivalent V–I / 5–1 description.
- Question 3 accepts Andante or Moderato, numeric and written forms of one and a half beats, and semitone/2/any second for the interval. Feedback displays the decimal duration `1.5` first; fraction and written forms remain accepted.
- Question 6(c) accepts strophic, verse and chorus, or ABAB.
- Question 7(a)(ii) requires evidence of more than one vocalist, such as choir, singers or vocalists.
- Question 7(b)(ii) must link a Celtic/traditional feature or instrument with a rock feature or instrument. Either half by itself earns no mark.

## Question 8 rules

- Award at most two concepts per heading and five marks overall.
- Full marks require concepts from at least three headings.
- `Repetition` can gain only one mark across Rhythm and Melody/harmony.
- Only concepts which actually earn marks are highlighted in green.
- Do not accept `drum` or `drums` alone for drum kit, cymbals or hi-hat.
- Accept only plural `violins`, not singular `violin`.
- Accept full Italian dynamic terms, but not English equivalents such as quiet or loud.
- Keep perfect and imperfect cadence matching distinct. Keep mezzo forte from also gaining a separate forte mark.

## Required regression checks

Run:

- `interactive-exams/tests/national5-2023.test.js`
- `interactive-exams/tests/exam-engine.test.js`
- all earlier National 5 paper tests from 2015 onwards
- `pnpm test:desktop-layout`

The 2023 test protects the official alternatives and exclusions, all audio marker values and bounds, the complete ten-bar notation inventory, the anacrusis, endings, direct bar-2 note entry, physical repeat-sign placement, Question 7 linked-reason logic, Question 8 caps and exclusions, score-render smoke testing and a complete automatic `40/40` attempt.

## Checklist for the next import

1. Render both official PDFs and build the complete 40-mark inventory before entering question data.
2. For notation, inventory anacrusis material separately and verify each numbered bar by pitch, octave, rhythm, accidental, beam, stem, tie, ending and total duration.
3. Compare the blank question score and completed marking-instruction score. Never infer missing notes from surrounding pattern alone when the official answer score is available.
4. Keep printed notation, editable boxes and pupil-applied answers as separate data and layers. Require every notation response to be placed physically on the score.
5. Run Whisper with word timestamps before setting markers, then check silence boundaries for cues hidden by music or singing.
6. Encode every official alternative and exclusion, including multi-concept reason requirements, before testing sample responses.
7. Add exact regression checks for notation, marker values, duration bounds, marking caps, de-duplication and a full-mark attempt.
