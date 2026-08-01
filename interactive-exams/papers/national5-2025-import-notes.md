# National 5 Music 2025 import notes

Use these notes before importing National 5 Music 2026 or any later Digital Past Paper.

## Official source set

- Question paper: `exampapers/n5/2025/Music N5 2025 Paper.pdf`
- Marking instructions: `exampapers/n5/2025/Music N5 2025 Answers.pdf`
- Audio: official Tracks 1–9 in `exampapers/n5/2025/`
- Interactive data: `interactive-exams/papers/national5-2025.js`
- Regression tests: `interactive-exams/tests/national5-2025.test.js`

Both official PDFs were rendered and checked page by page. Print-only candidate fields, barcodes, official-use material, page-turn instructions and additional blank answer pages were not reproduced.

## Mark inventory

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 8 | Six style questions, including two two-selection parts |
| 2 | 4 | Four-part vertical orchestral guide |
| 3 | 6 | Ten-bar shared score with tempo, direct note entry and repeat-sign placement |
| 4 | 6 | Six vocal-music questions and chord-sequence grid |
| 5 | 4 | Four musical-concept category groups |
| 6 | 3 | Sentence completion |
| 7 | 4 | Two style-and-reason groups |
| 8 | 5 | Rough work plus concept-marked final answer |

The question totals and individual-part totals must remain exactly 40.

## Whisper audio-marker workflow

Every official question track was transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker uses the beginning of the genuine spoken question part or replay cue, with the same small lead-in used by the completed earlier papers. False words produced from singing, music and warning tones were ignored. Question 3's long answer period was checked carefully because Whisper repeatedly hallucinated the warning sentence during instrumental and silent passages.

Calibrated markers:

- Question 1: `5.56`, `59.58`, `158.34`, `178.40`, `250.54`, `326.14`
- Question 2: `96.70`, `159.50`, `221.54`
- Question 3: `10.56`, `127.44`, `195.72`, `261.74`
- Question 4: `4.82`, `91.96`, `143.66`, `193.98`, `284.82`, `306.66`
- Question 5: `81.76`, `151.90`, `221.76`
- Question 6: `53.24`, `133.98`
- Question 7: `5.32`, `86.70`
- Question 8: `41.92`, `118.84`, `196.64`

Official audio durations used for bounds checking are `430.001633`, `286.876735`, `423.888980`, `419.683265`, `302.288980`, `217.573878`, `183.353469` and `393.639184` seconds for Questions 1–8 respectively. The regression test protects all 29 exact marker values, their chronological order and their track-duration bounds.

## Question 3 notation decisions

- User-confirmed correction: the final minim in bar 2 is F4, not G4.
- The ten numbered bars are stored as structured data in `N5_2025_Q3_BARS`.
- The score is in F major, with one flat and a printed 4/4 time signature.
- The score uses five systems of two bars. The first and second endings are retained: the first ending covers bars 7–8 and the second ending covers bar 9.
- The pupil physically places the tempo above bar 1. The expected answer is Moderato and Andante is accepted under the additional guidance.
- Bar 3 keeps three hidden crotchets in the data. The pupil enters F4, G4 and A4 directly into the score; hover and drag previews remain grey.
- The interval between the final A4 and B flat 4 in bar 6 is a semitone. `2` and `2nd` are also accepted.
- The pupil physically places a single end-repeat sign at the end of bar 8, replacing the ordinary barline. An extra sign at bar 1 may be disregarded by a human marker, but a sign at bar 1 alone is not correct; the digital one-use tool therefore marks only the required bar-8 placement.
- The cadence box spans the end of bar 9 and bar 10. Perfect cadence, V–I and 5–1 are accepted.
- Bar 10 ends with the source's final double barline.

The source-verified pitch and rhythm inventory is:

- Bar 1: F4, G4 and A4 crotchets; F4 dotted quaver and C4 semiquaver
- Bar 2: D4 and F4 crotchets; F4 minim
- Bar 3: missing F4, G4 and A4 crotchets; printed F4 dotted quaver and C4 semiquaver
- Bar 4: D4 and G4 crotchets; G4 minim
- Bar 5: crotchet rest; F4, F4 and G4 crotchets
- Bar 6: G4, A4, A4 and B flat 4 crotchets
- Bar 7: C5 minim tied to C5 quaver; A4, B flat 4 and F sharp 4 quavers
- Bar 8: A4 and G4 quavers; G4 dotted minim
- Bar 9: C5 minim tied to C5 quaver; A4, B flat 4 and E4 quavers
- Bar 10: G4 and F4 quavers; F4 dotted minim
- User-confirmed correction: the final note of the piece (bar 10) is F4, not E4; it remains a dotted minim.
- Layout correction: the sharp on the final quaver of bar 7 is positioned 4px further left for clear spacing.

Every bar totals four crotchet beats. Before changing any note, compare the blank source score, completed marking-instruction score, this inventory and the 2025 regression test together.

## Official marking edge cases retained

- Question 1(c) accepts Alberti bass or Alberti. Question 1(d) accepts 6/8 or 12/8, but not `compound time` on its own.
- Question 2(a) accepts arco or glissando. Question 2(b) accepts simple, 2/4 or 4/4, but not merely `2`, `4`, `two` or `four` beats. Question 2(d) accepts rallentando, ritardando, ritenuto and their official abbreviations.
- Question 3 accepts F major or F; the three missing notes must remain in the correct order.
- Question 7(a)(ii) accepts orchestra/orchestral evidence, but rejects an answer that suggests a featured solo instrument, soloist or concerto.
- Question 7(b)(ii) must link a vocal idea such as speaking, lyrics, words or rhyming with a beat, rhythm, music or accompaniment. The word `rapping` itself is not supporting evidence, and purely vocal evidence such as `words sung quickly` is insufficient.

## Question 8 rules

- Award at most two concepts per heading and five marks overall.
- Full marks require concepts from at least three headings.
- Repetition can gain only one mark across Melody/harmony and Rhythm/tempo.
- Only concepts which actually earn marks are highlighted in green.
- Do not accept `guitar` alone for acoustic/electric guitar, `drum` or `drums` alone for drum kit, or `fill` alone for drum fills.
- Accept full Italian dynamic terms, but not English equivalents.
- Keep the `mezzo forte` overlap protected: it earns the `mp or mf` concept only and must not also earn `f or ff`.

## Required regression checks

Run:

- `interactive-exams/tests/national5-2025.test.js`
- `interactive-exams/tests/exam-engine.test.js`
- all earlier National 5 paper tests
- `pnpm test:desktop-layout`

The 2025 test protects the official alternatives and exclusions, all audio marker values and bounds, the complete ten-bar notation inventory, direct bar-3 note entry, repeat placement, Question 7 evidence logic, Question 8 caps and overlapping terms, score-render smoke testing and a complete automatic `40/40` attempt.

## Checklist for the next import

1. Render the official question paper and marking instructions before entering question data, then build the exact 40-mark inventory.
2. For notation, compare the blank source score with the completed answer score and inventory every bar by pitch, octave, duration, accidental, beam, stem, tie, ending bracket and total beat count.
3. Keep printed notation, editable boxes and pupil-applied answers as separate data and layers. Require notation answers to be applied physically where the source asks the pupil to insert them.
4. Transcribe every official audio track locally with Whisper word timestamps. Align markers to real spoken cue starts, confirm difficult cues against silence boundaries and ignore false transcription during music.
5. Encode every official accepted alternative and explicit exclusion before writing marking tests.
6. Test multi-concept reason answers and overlapping musical terms so a phrase cannot gain an unintended extra mark.
7. Add exact regression checks for the musical inventory, marker values, duration bounds, marking caps, de-duplication, exclusions and a full-mark attempt.
