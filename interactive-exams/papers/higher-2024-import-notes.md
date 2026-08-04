# Higher Music 2024 import notes

## Source inventory

- Official question paper: `exampapers/higher/2024/Music H 2024 Paper.pdf` (20 pages).
- Official marking instructions: `exampapers/higher/2024/Music H 2024 Answers.pdf` (6 pages).
- Official audio: Track 01 is the opening announcement; Tracks 02–09 are Questions 1–8.
- Question marks: `4, 5, 3, 6, 6, 6, 5, 5` (40 total).
- Question 8 is a copyrighted lyric-placement question. The interactive data stores 17 numbered placeholders only; no source lyric is stored.

## Audio calibration

All eight question tracks were transcribed with the local `small.en` Whisper model. Ambiguous cue windows in Questions 1, 3 and 5 were re-transcribed separately with word timestamps and source-specific prompt text.

| Question | Calibrated marker times (seconds) | Duration (seconds) |
| --- | --- | --- |
| 1 | 41.66, 107.28, 215.68, 242.48 | 281.97 |
| 2 | 70.00, 145.00, 221.00 | 308.80 |
| 3 | 15.88, 47.60, 83.42, 133.12 | 179.96 |
| 4 | 11.20, 215.00, 302.00, 384.00 | 570.44 |
| 5 | 45.32, 132.44, 208.44, 347.28, 370.40, 408.40, 434.40 | 476.45 |
| 6 | 45.32, 87.04, 147.04 | 371.10 |
| 7 | 116.88, 206.88, 266.88, 356.88, 436.64, 543.84, 613.04 | 748.20 |
| 8 | 104.04, 207.76, 310.76 | 426.43 |

The regression test protects all 35 marker values, chronological order and duration bounds.

## Question 4 notation audit

The official page 7 and the corresponding marking-instruction pages were rendered at 600 dpi. The six staff systems were cropped and inspected independently against the F-major treble-clef pitch map.

- Key: F major.
- Time signature: 4/4.
- Score: 24 complete bars across six systems: `1–4`, `5–8`, `9–12`, `13–16`, `17–21`, `22–24`.
- Bar totals: every encoded bar contains four crotchet beats.
- The complete lyric underlay requested by the teacher is stored alongside the notes so each syllable remains aligned with its printed note.
- Source-confirmed corrections include F4 rather than E4 in the repeated opening figures, B♭4 rather than B4 in bars 4 and 8, D5 at the end of bars 10 and 14, and the higher-register melody in bars 18–24.
- On 4 August 2026 the teacher confirmed the complete pitch sequence: `b` means B♭ in F major; the teacher-supplied line 3 pattern also applies to line 4. The remaining corrections are protected in the bar inventory regression test.
- The teacher later confirmed that the first two A4 notes in bar 4 are tied.
- The two D5 notes in bar 19 are tied.
- Bar 21 is C5 crotchet tied from the final C5 quaver of bar 20, followed by D5 quaver and A4 quaver tied to A4 minim.
- Bar 17 contains a minim rest, crotchet rest, quaver rest and G4 quaver; it is not a full-bar rest.
- Bars 23 and 24 are tied F5 semibreves, with the bar-22 F5 quaver tied into bar 23.
- (a) bar 3: a fifth.
- (b) bar 6: two corrected quavers; tails may appear on either side.
- (c) bars 9–10: either or both C5 notes in bar 10 may be circled as the dominant of F major.
- (d) bar 14 one octave lower in bass clef: A3 crotchet, C4 quaver tied to C4 crotchet.
- (e) bars 19 and 21: B♭ then F, IV then I, or 4 then 1.
- (f) D.C., DC or Da capo at, below or after bar 24.
- Final barline: single barline.

The score is stored as structured bar data in `exam-notation.js`. The regression inventory protects every pitch and rhythm in all 24 bars, all within-bar and cross-bar ties, the 73 printed lyric items, editable indices, transposed pitches and rhythms, chord bars, Da capo target, source-measured system/bar geometry and final barline type.

## Official marking decisions preserved

- Questions 1 and 5 use the Higher additional-answer deduction rule.
- Question 2 accepts cross rhythms or triplets for 3 against 2, accepts A7 for dominant 7th and rejects dominant on its own.
- Question 4 accepts all official interval, dominant-note, chord and Da capo alternatives.
- Question 6 credits no more than two concepts per heading, accepts concepts under another heading, rejects major scale and minor on their own, and accepts only the listed Italian tempo terms.
- Question 7 marks Column C only and deducts additional incorrect selections.
- Question 8 accepts glissando on line 1, male on line 6 or 7, harmony on line 10, interrupted on line 16 and perfect on line 17.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 17 lyric lines for Higher 2024 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this note.

## Verification completed

- The dedicated Higher 2024 paper and Higher literacy rendering regressions pass.
- The permanent desktop-layout audit passes.
- Regression checks cover every Question 4 pitch, rhythm, tie, lyric item, editable index, answer-box position, chord field and final-system boundary.
