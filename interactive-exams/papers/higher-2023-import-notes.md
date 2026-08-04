# Higher Music 2023 import notes

## Source inventory

- Official question paper: `exampapers/higher/2023/NH_Music_QP_2023.pdf` (20 pages).
- Official marking instructions: `exampapers/higher/2023/mi_NH_Music_mi_2023.pdf` (6 pages).
- Official audio: Track 01 is the opening announcement; Tracks 02–09 are Questions 1–8.
- Question marks: `5, 5, 3, 6, 5, 6, 5, 5` (40 total).
- Question 8 is a copyrighted lyric-placement question. The teacher supplied its 16 lyric rows for this specific paper, and their order is protected by a regression hash.

## Audio calibration

All eight question tracks were transcribed with the local `small.en` Whisper model. Spoken cue starts were checked against the transcript and kept within the measured track duration. The missing third-play cue in Question 4 was confirmed with a separate high-resolution transcription of the relevant 45-second audio window.

| Question | Calibrated marker times (seconds) | Duration (seconds) |
| --- | --- | --- |
| 1 | 42.50, 116.68, 190.46, 294.22 | 357.54 |
| 2 | 70.66, 185.36, 300.24 | 426.24 |
| 3 | 18.58, 33.42, 61.20, 117.90 | 198.45 |
| 4 | 12.22, 201.10, 273.28, 345.92 | 510.20 |
| 5 | 44.36, 108.06, 201.14, 245.40 | 344.87 |
| 6 | 50.46, 137.90, 224.80 | 488.99 |
| 7 | 120.48, 208.98, 300.72, 385.46, 475.20, 558.04, 636.82 | 769.52 |
| 8 | 102.62, 171.12, 240.10 | 321.91 |

The regression test protects all 32 marker values, chronological order and duration bounds.

## Question 4 notation audit

The official page 7 was rendered at 600 dpi and split into its five staff systems. The F-major treble-clef pitch map was calibrated separately for each system, and the official marking instructions were rendered at the same resolution to confirm every editable answer.

- Key: F major.
- Time signature: 4/4.
- Score: 16 complete bars across five systems: `1–3`, `4–6`, `7–10`, `11–13`, `14–16`.
- Bar totals: every encoded bar contains four crotchet beats.
- The Question 4 lyric underlay is included to match the teacher-supplied source page and is aligned to the corresponding note positions.
- (a) start of bar 2: D5 quaver, a fourth above the preceding A4.
- (b) bar 4 one octave lower in bass clef: G3, G3, F3 and D3 quavers followed by D3 crotchet, with the final two D3 notes tied.
- (c) bar 7: A4, G4 and F4, all quavers.
- (d) bar 9: F4 quaver followed by E4 dotted crotchet.
- (e) bar 12 accepts crotchet rest plus quaver rest, three quaver rests, or one dotted crotchet rest. Quaver rest followed by crotchet rest is rejected.
- (f) bars 14–15: B♭ then C, IV then V, or 4 then 5.
- Final barline: double barline.

### Source-fidelity correction — 4 August 2026

A second independent audit of the 600 dpi source found that the original import had treated several answer boxes as whole-bar boxes and had split some notes at the wrong barlines. The corrected implementation now preserves the source-measured unequal bar widths, five system gaps, six answer boxes, bass-staff extent, given-chord box and both chord-answer boxes.

The corrected bar inventory records these source details explicitly:

- bar 7 continues after the three missing quavers with E4 crotchet, C4 quaver and G4 quaver tied into bar 8;
- bar 8 contains the tied G4 quaver, E4 dotted crotchet and minim rest;
- bar 9 continues after the two rhythm-correction notes with E4 quaver, F4 crotchet and G4 quaver tied into bar 10;
- bar 10 contains the tied G4 crotchet, crotchet rest, G4 crotchet and C5 crotchet;
- bar 13 ends with A4 tied into the first A4 of bar 14; the previously imported bar-11-to-bar-12 tie is not retained after the teacher's pitch correction;
- bar 13 contains C5, C5, B♭4, B♭4, B♭4 and A4, with the C5–B♭4 quaver pair beamed and no slur;
- B pitches governed by the F-major key signature are stored as B-flat pitches rather than natural-B placeholders.

The dedicated regression test now protects every pitch, rhythm and tie in all 16 bars, the complete lyric sequence, the source-measured system and barline geometry, all box rectangles, editable indices and the final double barline.

The score is stored as structured bar data in `exam-notation.js`. The regression inventory protects all 16 bars, editable indices, answer pitches and rhythms, accepted rest combinations, bar totals and final barline type.

## Official marking decisions preserved

## Teacher-confirmed pitch correction — 4 August 2026

The teacher supplied the authoritative Higher 2023 Question 4 pitches after
reviewing the rendered paper. The lists are interpreted in reading order across
the five printed systems, with all pitches in octave 4 unless an octave is
shown explicitly. In F major, written `b` is stored as B-flat.

- Line 1 (bars 1–3): `A4, C5, C5, A4, C5, C5, A4`; `D5, C5, A4, A4, G4`; `G4, F4, F4, F4, D4`.
- Bar 3 rhythm: quaver, quaver, crotchet, crotchet, quaver rest, quaver. The word `and` sits beneath the final note of bar 3.
- Line 2 (bars 4–6): `G4, G4, F4, D4, D4`; `C4, D4, F4, A4, A4, A4, G4`; `A4, G4, F4, G4, G4, C4`.
- Line 3 (bars 7–10): `A4, A4, F4, G4, F4, D4, G4`; `G4, D4`; `G4, F4, F4, G4, A4`; `A4, A4, C5`. The three missing notes in part (c) are `A4, F4, G4`.
- Line 4 (bars 11–13): `D5, C5, C5, A4, A4`; the final A4 quaver in bar 11 ties to the opening A4 quaver in bar 12; bar 12 continues `F4 dotted crotchet, missing dotted-crotchet rest, F4 quaver`; bar 13 is `C5 crotchet, C5 quaver, B♭4 quaver, B♭4 quaver, B♭4 crotchet, A4 quaver`, with the C5–B♭4 quaver pair beamed and no slur.
- Line 5 (bars 14–16): `A4, G4, F4, F4`; `F4 quaver, A4 crotchet, G4 quaver tied to G4 quaver, F4 crotchet, F4 quaver tied into bar 16`; `F4 minim, minim rest`. The final A4 in bar 13 is tied to the first A4 in bar 14, and the final F4 quaver in bar 14 is tied to the first F4 quaver in bar 15.
- The final lyrics are aligned to the revised notes: `live` on the last note of bar 14; `-`, `ing`, `just____`, `the`, `same.___` on notes 1, 2, 3, 5 and 6 of bar 15. The tied G4 quavers in bar 15 remain individual, unbeamed quavers.
- The second individual chord-answer box in part (f) is positioned 10 px to the right of its previous position.

The inventory and marking answers were updated together, including D5 for
part (a), A4–F4–G4 for part (c), and the cross-bar A4 tie into bar 14.

- Questions 1 and 5 use the Higher additional-answer deduction rule.
- Question 2 accepts `pizz` but rejects `plucking`, accepts French horn or horn, and accepts B♭7 for dominant 7th.
- Question 4 accepts all official rest and chord alternatives.
- Question 6 credits no more than two concepts per heading, permits concepts under another heading, rejects harmonic minor and rejects sonata form.
- Question 7 marks Column C only and deducts additional incorrect selections.
- Question 8 accepts con sordino on line 1, violin on line 2 or 3, tremolando on line 11, glissando on line 13 and perfect on line 16.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 16 lyric lines for Higher 2023 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this note.

## Verification completed

- The dedicated Higher 2023 regression test passes.
- The complete automated suite and permanent desktop-layout audit are run before hand-off.
- Browser checks cover all eight questions, the six Question 4 interactions and all 16 Question 8 placeholder rows.
