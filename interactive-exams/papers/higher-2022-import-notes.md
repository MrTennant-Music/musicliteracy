# Higher Music 2022 import notes

## Source inventory

- Official question paper: `exampapers/higher/2022/Music H 2022 Paper.pdf` (20 pages).
- Official marking instructions: `exampapers/higher/2022/Music H 2022 Answers.pdf` (6 pages).
- Official audio: Track 01 is the opening announcement; Tracks 02–09 are Questions 1–8.
- Question marks: `4, 5, 4, 6, 5, 5, 6, 5` (40 total).
- Question 8 is a copyrighted lyric-placement question. The interactive data stores 13 numbered placeholders only; no source lyric is stored.

## Audio calibration

All eight question tracks were transcribed with the local `small.en` Whisper model. Spoken cue starts were checked against the transcript and kept within the measured track duration.

| Question | Calibrated marker times (seconds) | Duration (seconds) |
| --- | --- | --- |
| 1 | 39.34, 115.38, 191.52 | 299.36 |
| 2 | 69.70, 167.72, 265.90 | 376.11 |
| 3 | 16.16, 56.86, 101.80, 174.98, 226.56 | 285.02 |
| 4 | 12.92, 209.88, 300.34, 386.94 | 565.03 |
| 5 | 41.72, 117.94, 231.14, 314.44 | 393.90 |
| 6 | 117.26, 207.32, 298.14, 385.20, 473.10, 559.44, 637.20 | 768.42 |
| 7 | 47.48, 143.66, 240.68 | 508.21 |
| 8 | 93.50, 185.42, 272.12 | 370.76 |

The regression test protects all 32 marker values, chronological order and duration bounds.

## Question 4 notation audit

The official page 7 was rendered at 600 dpi. Each of its five staff systems was inspected independently against the F-major treble-clef pitch map. The marking instructions were also rendered at 600 dpi to verify every editable answer.

- Key: F major.
- Time signature: 12/8.
- Score: 13 complete bars across five systems: `1–2`, `3–5`, `6–8`, `9–11`, `12–13`.
- Bar totals: every bar contains 12 quavers (six crotchet beats in the renderer's duration units).
- (a) `12/8`, inserted as a musical time-signature symbol rather than typed as a fraction.
- (b) start of bar 4: G5 dotted crotchet, a fifth above the preceding C5.
- (c) chord responses: C or C7 / V or V7 / 5, followed by Dm / VI / 6.
- (d) tonic selection: the F5 third note in bar 8, immediately before the dotted crotchet rest.
- (e) bar 11: A4, G4 and B-flat4, all dotted crotchets.
- (f) one octave lower in bass clef: G3 dotted crotchet, F3 crotchet, E3 quaver and F3 dotted minim.
- Final barline: double barline.

The score is stored as structured bar data in `exam-notation.js`. The regression inventory protects all 13 bars, the editable indices, the exact answer pitches and rhythms, bar totals and final barline type.

## Teacher-requested Higher literacy optimisation pass — 3 August 2026

The established Higher 2016–2019 literacy decisions were applied to this paper after a second comparison with the official page 7 source:

- the five systems now use source-measured unequal bar widths, including the indented first system and short final system;
- all six established Higher time-signature choices are offered: 2/4, 3/4, 4/4, 6/8, 9/8 and 12/8;
- the source marking boxes, the supplied F/I chord box and the two square chord-answer boxes follow the official proportions;
- every printed note in bar 8 can be selected for the tonic question, while only the first F after the rest is marked correct;
- chord answer lines remain visible in marked feedback and corrections appear above an incorrect pupil answer;
- the bass-clef transposition slots remain vertically aligned with their source notes above;
- the bar 12/13 dividing barline is present in both staves, and both staves finish with the official double barline; and
- the exact layout measurements, editable-note inventory and interaction answers are protected by regression tests.

Follow-up corrections from the 3 August 2026 browser review:

- the time-signature box is 5px wider and 5px taller, and the interval box is 30px farther left and 20px narrower from its right edge;
- the interval guide is raised by 20px and the transpose surround box is shifted 15px right;
- the bass stave includes the printed dotted minim rest in bar 13, with its F-major flat on the second bass-stave line; and
- the two chord answers in part (c) remain visible as individual square entry boxes in Practice Mode.

The final layout pass also preserves the source-paper positioning decisions: the time-signature box is subsequently moved a further 10px left, the interval box is tightened from its left edge and moved a further 10px left, the Notes box surrounds the first three dotted-crotchet guides in bar 11, those guide rhythms use a common B4 pitch so their noteheads align horizontally above the bar, and their stems remain upright; the transpose box is shortened from its top, and both staves use the calibrated Bravura final-barline glyph.

## Teacher-confirmed Question 4 pitch correction — 4 August 2026

The teacher supplied a complete bar-by-bar pitch list. The following inventory is now the source of truth for the interactive score; all B notes are B-flat under the printed one-flat key signature unless an explicit accidental or different pitch is stated.

- Bars 1–2: A5, A5, A5, A5, G5, F5 in each bar.
- Bar 3: B-flat5, A5, G5, F5, C5.
- Bar 4: the missing G5 answer, followed by A5, C6 tied into C6, A5, G5, A5 and G5.
- Bar 5: F5, F5, E5, D5 and E5, with the printed dotted-crotchet rest retained.
- Bar 6: A4, C5, B-flat4, A4 and G4, with the printed rest and F/I chord retained.
- Bar 7: F4, F5, E5, D5 and E5, with the Dm chord answer box.
- Bar 8: A5, G5, F5, the printed dotted-crotchet rest, C5, C5, C5, C5 and D4. The tonic answer is the F5.
- Bar 9: A4, G4, F4, A4, C5, F5, E5, D5 and E5, with the printed quaver rest retained.
- Bar 10: A4, F4, G4, A4, C5, B-flat4, A4 and B-flat4.
- Bar 11: missing A4, G4 and B-flat4 dotted crotchets, followed by the printed A4 crotchet and F4–G4 semiquaver pair.
- Bars 12–13: the printed source is A4, G4, F4, G4, F4, E4 and F4; the four transposed answers are G3 dotted crotchet, F3 crotchet, E3 quaver and F3 dotted minim.

The bar-4 interval answer is G5, and the bar-8 tonic selection is F5. The regression inventory protects these pitches, rhythms, ties, editable indices and final barline.

## Official marking decisions preserved

## Teacher-confirmed Question 4 Notes-box correction — 4 August 2026

- The `(e) Notes` box is moved 50px right to `x: 650`, keeping its width,
  height and vertical position unchanged so it surrounds all three dotted-
  crotchet note-entry guides in bar 11.

## Teacher-confirmed Question 4 interval-box correction — 4 August 2026

- The `(b) Interval` box is moved to `x: 305` so it surrounds the final note
  of bar 3 and the first note of bar 4, including their augmentation dots.
- The box is then extended 10px to the right, giving it a width of `120px`.

## Teacher-confirmed Question 4 Chords-box correction — 4 August 2026

- The `(c) Chords` box is moved 15px right to `x: 195`, with its size and
  vertical position unchanged.

## Teacher-confirmed Question 4 Tonic-note-box correction — 4 August 2026

- The `(d) Tonic note` box is moved 25px right to `x: 640`, with its size
  and vertical position unchanged.

## Teacher-confirmed Question 4 chord-entry-box correction — 4 August 2026

- Both individual chord-entry boxes in part (c) are moved 15px right to
  `x: 209` and `x: 378`, with their size and vertical position unchanged.

## Teacher-confirmed Question 4 Tonic-note-box width correction — 4 August 2026

- The `(d) Tonic note` box keeps its left edge at `x: 640` and is reduced to
  `275px` wide so its right edge aligns with the staff at `x: 915`.

## Teacher-confirmed Question 4 time-signature-position correction — 4 August 2026

- The inserted time signature in part (a) is moved 10px right to `x: 345`.
- It is moved another 10px right to `x: 355` following the subsequent layout
  correction.

## Teacher-confirmed Question 4 feedback correction — 4 August 2026

- Tonic-note feedback uses an unfilled outline circle for both the pupil’s
  selected note and the correct-note correction.
- Chord corrections appear beneath their individual chord-entry boxes.

## Teacher-confirmed Question 4 missing-note correction — 4 August 2026

- The correct notes for part (e), referred to by the teacher as the Notes
  part, are A4, G4 and B-flat4, all dotted crotchets.
- The regression inventory and marking answer now use `A4,G4,Bb4`.

## Teacher-confirmed Question 4 bar-width correction — 4 August 2026

- In lines 2, 3 and 4, each line now divides its three bars into equal
  widths while preserving the existing system start and end positions.
- The bar ends for those three systems are now `375`, `645` and `915`.
- The layout regression inventory protects the corrected geometry.

- Question 1 uses the Higher additional-answer deduction rule.
- Question 2 blocks `plucking` for pizzicato and accepts the official abbreviations and alternatives.
- Question 4 chord marking requires both chords for the single mark and blocks D on its own.
- Question 6 marks Column C only and uses the official additional-selection deductions, including zero for more than nine selections.
- Question 7 credits a maximum of two concepts per heading and accepts concepts written under another heading.
- Question 8 accepts glissando on line 1 or 2, perfect on line 3 or 6, trill on line 7 or 8, walking bass on line 4, and scale on line 12.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 13 lyric lines for Higher 2022 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this note.

## Verification completed

- The complete automated suite passes.
- The permanent desktop-layout audit passes.
- Browser checks covered Question 1 spacing, the Question 4 score and controls, multi-digit 12/8 rendering, tonic-note selection, Clear-control alignment and all 13 Question 8 placeholder rows.
