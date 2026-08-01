# National 5 Music 2022 import notes

Use these notes before importing National 5 Music 2023 or any later Digital Past Paper.

## Official source set

- Question paper: `exampapers/n5/2022/N5_Music_QP_2022.pdf`
- Marking instructions: `exampapers/n5/2022/mi_N5_Music_mi_2022.pdf`
- Audio: official Tracks 1–9 in `exampapers/n5/2022/`
- Interactive data: `interactive-exams/papers/national5-2022.js`
- Regression tests: `interactive-exams/tests/national5-2022.test.js`

The question paper and marking instructions were rendered and checked page by page. Print-only candidate fields, barcode material, official-use margins, turn-over text and extra answer pages were not reproduced.

## Mark inventory

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 7 | Listening choices, short answers and two selections |
| 2 | 4 | Four-part vertical listening guide |
| 3 | 6 | Shared sixteen-bar notation score with tempo, dynamic and direct note entry |
| 4 | 7 | Vocal listening choices, chord grid and short answers |
| 5 | 4 | Four orchestral category groups |
| 6 | 3 | Sentence completion |
| 7 | 4 | Two style-and-reason groups |
| 8 | 5 | Rough work plus concept-marked final answer |

The question totals and individual-part totals must remain exactly 40.

## Whisper audio-marker workflow

Every official question track was transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker was taken from the beginning of the relevant spoken question, part or replay cue. False text produced from instrumental passages was ignored; only genuine spoken cues were used. The final values were checked against the official track durations and the small lead-in convention used by the completed 2014 paper.

Calibrated markers:

- Question 1: `6.42`, `51.20`, `90.08`, `134.68`, `188.72`, `267.54`
- Question 2: `97.30`, `176.96`, `257.22`
- Question 3: `7.48`, `138.16`, `216.52`, `295.16`
- Question 4: `6.28`, `89.10`, `173.12`, `220.58`, `268.24`, `376.34`
- Question 5: `83.66`, `140.50`, `197.60`
- Question 6: `54.42`, `142.10`
- Question 7: `6.66`, `77.02`
- Question 8: `37.96`, `136.40`, `235.24`

Official audio durations used for bounds checking are `321.02`, `338.21`, `464.98`, `465.27`, `263.18`, `231.58`, `148.90` and `450.95` seconds for Questions 1–8 respectively. The regression test protects all 29 exact marker values, their chronological order and track-duration bounds.

## Question 3 notation decisions

- The score is stored as a separate sixteen-bar pitch-and-rhythm inventory named `N5_2022_Q3_BARS`.
- The source is in C major and prints a 4/4 time signature and `mp` at the opening.
- The tempo answer is placed above bar 1. Accept Andante or Moderato.
- The dynamic answer is placed below the first note of bar 9. Accept `f`/forte or `mf`/mezzo forte.
- The X box surrounds the D minim in bar 5. The interval box in bar 11 contains C4–C5, an octave.
- Bar 13 uses direct draggable note entry. The two correct pitches are G4 and G4, with the printed dotted-crotchet and quaver rhythms.
- The cadence box surrounds bar 16. Accept imperfect cadence or an ending on V/5.
- Missing notes preview in grey and remain removable with the established notation gestures and Clear control.

The source-verified pitch and rhythm inventory is:

1. A4, G4, E4 and G4 quavers; A4 minim tied into bar 2
2. A4 dotted minim tied from bar 1; crotchet rest
3. A4, G4, E4 and D4 quavers; E4 and G4 quavers; G4 crotchet tied into bar 4
4. G4 dotted minim tied from bar 3; crotchet rest
5. G4, D4, D4 and D4 quavers; D4 minim marked X
6. G4, D4, D4 and D4 quavers; D4 and G4 crotchets
7. A4, G4, E4 and D4 quavers; E4 and G4 quavers; G4 crotchet tied into bar 8
8. G4 dotted minim tied from bar 7; two C4 quavers
9. Two C5 minims
10. G4 dotted minim; E4 and C4 quavers
11. C4 minim and C5 minim, forming the printed octave
12. A4 and G4 quavers, with G4 tied to a G4 minim; two C5 quavers
13. B4, G4, G4 and G4 quavers; missing G4 dotted crotchet and G4 quaver
14. A4, F4, F4 and F4 quavers; F4 minim
15. A4, F4, F4 and F4 quavers; F4 and A4 crotchets
16. F4, D4, D4 and D4 quavers; D4 minim

Every bar totals four crotchet beats. Before changing a note, compare the source PDF, this inventory and the 2022 regression test together.

## Official marking edge cases retained

- Question 1(d) accepts minimalist or minimalism, including the harmless suffix `music`.
- Question 1(f) accepts clarsach, Scottish harp, Celtic harp or harp.
- Question 2(1) accepts 2, 4, their number words, 2/4 and 4/4.
- Question 2(2) accepts xylophone or marimba.
- Question 3(a) accepts Andante or Moderato; Question 3(c) accepts forte or mezzo forte.
- Question 3(d) accepts octave leap, 8, 8th or 8ve.
- Question 6(b) accepts wind, military or concert band, but not marching band.
- Question 6(c) accepts binary, AB or AABB.
- Question 7(a)(ii) accepts improvised singing or sounds, nonsense/random/non-real words, or `Jazz` by itself. Other named jazz styles such as jazz funk, jazz fusion and jazz rock are not accepted.
- Question 7(b)(ii) accepts Scotch/Scots snap or dotted rhythms/notes.

## Question 8 rules

- Award at most two concepts per heading and five marks overall.
- Full marks require concepts from at least three headings.
- `Repetition` can gain only one mark across Melody/harmony and Rhythm.
- Only concepts which actually earn marks are highlighted in green.
- Accept clarinet for saxophone and banjo for trumpet under the additional guidance.
- Do not accept `drum` or `drums` alone for drum kit, cymbals or hi-hat.
- Accept `change of tempo`, but do not accept a gradual change of tempo.

## Required regression checks

Run:

- `interactive-exams/tests/national5-2022.test.js`
- `interactive-exams/tests/exam-engine.test.js`
- all earlier National 5 paper tests from 2015 onwards
- `pnpm test:desktop-layout`

The 2022 test protects the official alternatives and exclusions, audio marker values and bounds, all sixteen notation bars, direct bar-13 note entry, Question 8 caps and de-duplication, score-render smoke testing and a complete automatic `40/40` attempt.

## Checklist for the next import

1. Render both official PDFs and build the complete 40-mark inventory before entering any question data.
2. For notation, transcribe one bar at a time and check staff position, rhythm value, beam group, tie, rest and bar total separately. Use the completed marking-instruction score to verify missing notes whenever it is available.
3. Keep printed guide information separate from pupil-applied answers and require the pupil to place every notation response physically on the score.
4. Run Whisper with word timestamps before setting audio markers. Treat text recognised during instrumental passages as false unless it aligns with an audible spoken cue.
5. Encode every official accepted alternative and explicit exclusion before testing sample responses.
6. Add exact regression checks for notation content, marker values, duration bounds, marking caps, de-duplication and a full-mark attempt.
