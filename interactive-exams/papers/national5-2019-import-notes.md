# National 5 Music 2019 import notes

Use these notes before importing National 5 Music 2020 or any later Digital Past Paper.

## Official source set

- Question paper: `exampapers/n5/2019/N5_Music_QP_2019.pdf`
- Marking instructions: `exampapers/n5/2019/mi_N5_Music_mi_2019.pdf`
- Audio: official Tracks 1–9 in `exampapers/n5/2019/`
- Interactive data: `interactive-exams/papers/national5-2019.js`
- Regression tests: `interactive-exams/tests/national5-2019.test.js`

The official question paper and marking instructions were rendered and checked page by page. Print-only candidate fields, barcode material, official-use margins, turn-over text and additional answer pages were not reproduced.

## Mark inventory

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 7 | Listening choices, multi-select and chord-sequence grid |
| 2 | 4 | Four-part vertical listening guide |
| 3 | 6 | Shared eight-bar notation score with direct score entry and rhythm correction |
| 4 | 7 | Seven short listening answers |
| 5 | 4 | Four category groups |
| 6 | 3 | Sentence completion |
| 7 | 4 | Two style-and-reason groups |
| 8 | 5 | Rough work plus concept-marked final answer |

The question totals and individual-part totals must remain exactly 40.

## Whisper audio-marker workflow

Every official question track was transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker was taken from the beginning of the relevant spoken question, part or replay cue, then checked against the surrounding waveform boundary and the small lead-in convention used by the completed 2014 paper.

Calibrated markers:

- Question 1: `6.44`, `67.36`, `113.00`, `205.70`, `324.86`, `365.78`
- Question 2: `98.08`, `187.26`, `278.70`
- Question 3: `12.10`, `121.28`, `178.68`, `234.70`
- Question 4: `6.92`, `48.68`, `84.78`, `173.70`, `253.28`, `331.82`, `377.30`
- Question 5: `87.76`, `138.78`, `189.80`
- Question 6: `54.88`, `117.70`
- Question 7: `6.14`, `95.10`
- Question 8: `45.44`, `119.68`, `194.38`

Official audio durations used for bounds checking are `418.22`, `369.89`, `382.80`, `424.65`, `250.44`, `182.91`, `187.48` and `387.53` seconds for Questions 1–8 respectively. The regression test protects all 30 exact marker values, their chronological order and their track-duration bounds.

## Question 3 notation decisions

- The score is stored as a separate eight-bar pitch-and-rhythm inventory named `N5_2019_Q3_BARS`.
- The time-signature target is immediately after the key signature at the start of the score.
- Bar 4 uses direct draggable missing-note entry. The correct notes are D5 dotted quaver, B4 semiquaver and G4 crotchet.
- Bar 7 prints four downward-stem crotchets which the pupil must physically correct to semiquavers. The pupil has the established quaver-tail and dotted-crotchet modifier controls plus a semiquaver control; all four semiquavers must be applied for the mark.
- The source accidentals are explicit where required: C sharp in bar 3, then D sharp followed by D natural in bar 7.
- The final bar uses the source paper's double barline.
- Missing notes preview in grey and remain removable with the established notation gestures and Clear control.

The source-verified pitch and rhythm inventory is:

1. B4 minim; D5, C5, B4 and C5 semiquavers
2. D5 dotted quaver, B4 semiquaver, G4 crotchet, crotchet rest
3. G5 dotted crotchet; A5, G5, F-sharp5, E5, D5 and C-sharp5 semiquavers
4. D5 dotted quaver, B4 semiquaver, G4 crotchet, crotchet rest, with the first three notes omitted for pupil entry
5. C5 dotted quaver, A4 semiquaver, F-sharp4 quaver, then A4, B4 and C5 quavers
6. D5 dotted quaver, B4 semiquaver, G5 crotchet, crotchet rest
7. A5, G5, F-sharp5, G5, F-sharp5, E5, D-sharp5 and E5 semiquavers; then printed D5, C5, B4 and C5 downward-stem crotchets corrected by the pupil to semiquavers
8. B4 quaver, C5 and B4 semiquavers, A4 quaver, quaver rest, crotchet rest, followed by a double barline

Every bar totals three crotchet beats once the bar 7 correction is complete. Before changing any note, compare the source PDF, this inventory and the 2019 regression test together.

## Marking edge cases retained

- Question 1(b) accepts tenor or baritone.
- Question 1(c) awards one mark each for chorus and major key.
- Question 2(1) accepts 2, 4, their number words, 2/4 and 4/4.
- Question 2(2) accepts accordion, flute or whistle.
- Question 3(c) accepts B or minim.
- Question 3(f) accepts imperfect cadence or I–V.
- Question 4(c) accepts minimalist, minimalism or minimal.
- Question 6(c) accepts electric, rhythm or lead guitar.
- Question 7(a)(ii) accepts sitar and/or tabla.
- Question 7(b)(ii) must identify at least two distinct official concepts. Relevant concepts include male voice; solo or unaccompanied singing/song/story; strophic form; Scottish, Doric, accent or dialect; and farming or work. A phrase such as `He is singing about his life` earns the mark because it contains the separate male and singing concepts.

## Question 8 rules

- Award at most two concepts per heading and five marks overall.
- Full marks require concepts from at least three headings.
- `Repetition` or `ostinato` can gain only one mark across Melody/harmony and Rhythm/tempo.
- Only concepts which actually earn marks are highlighted in green.
- Accept the official instrument alternatives and spellings, including keyboard or synthesizer alongside saxophones.
- Do not accept `bass` or `double bass` for bass guitar.
- Do not accept `drums` for drum kit, cymbals or hi-hat.
- Do not accept `guitar` or acoustic guitar for electric or lead guitar.
- Accept `mf`, `mezzo forte`, `f` or `forte`; do not accept English dynamic equivalents.

## Required regression checks

Run:

- `interactive-exams/tests/national5-2019.test.js`
- `interactive-exams/tests/exam-engine.test.js`
- the earlier 2015, 2016, 2017 and 2018 paper tests
- `pnpm test:desktop-layout`

The 2019 test includes official alternatives and explicit rejections, the two-concept Bothy ballad reason rule, marker count/order/duration checks, notation structure and bar-duration checks, Question 8 caps and de-duplication, score-render smoke testing and a complete automatic `40/40` attempt.

## Checklist for the next import

1. Render both official PDFs and create a complete mark inventory before encoding questions.
2. Write an explicit pitch-and-rhythm inventory for every notation bar; confirm accidentals, beaming, rests, bar totals, editable items and the final barline against a high-resolution source image.
3. Separate printed notation from pupil-applied corrections so every requested notation answer must be physically placed.
4. Transcribe every track with word timestamps before setting any audio marker, then verify each cue against its waveform boundary.
5. Encode all official accepted alternatives and explicit exclusions before testing sample answers.
6. Add exact regression checks for notation content, marker values, duration bounds, marking caps, de-duplication and a full-mark attempt.
