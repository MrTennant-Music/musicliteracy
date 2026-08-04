# Higher Music 2018 import notes

## Sources

- Question paper: `exampapers/higher/2018/NH_Music_QP_2018.pdf`
- Marking instructions: `exampapers/higher/2018/mi_NH_Music_mi_2018.pdf`
- `01 Track 1-1.mp3` is the general introduction. Questions 1–8 use Tracks 2–9 respectively.
- The paper has eight questions worth 5, 6, 6, 6, 4, 3, 5 and 5 marks, totalling 40.

## Audio calibration

All question tracks were transcribed locally with Whisper `small.en`. Cue positions were checked against the spoken boundaries and the complete sequence of playback instructions.

- Question 1: `47.54`, `108.78`, `171.82`, `263.22`
- Question 2: `76.66`, `163.46`, `250.92`, `362.84`, `408.72`
- Question 3: `13.04`, `235.64`, `335.22`, `437.18`
- Question 4: `55.08`, `132.64`, `204.44`
- Question 5: `49.44`, `130.34`, `241.42`
- Question 6: `20.20`, `53.92`, `112.54`, `152.24`, `210.06`, `246.60`
- Question 7: `120.22`, `211.98`, `298.86`, `386.96`, `469.70`, `556.40`, `635.40`
- Question 8: `108.10`, `185.94`, `264.42`

There are 35 calibrated markers. Regression tests protect their exact values, chronological order and official-track duration bounds.

## Question 3 notation audit

- Source: pages 5–7 of the official question paper. The complete score page was rendered at 600 dpi and each of its nine printed lines was inspected separately.
- Key and metre: C major, 4/4, with the source's later stated change to C major retained in part (f).
- Line 1 contains 16 drum-set quavers with cross noteheads.
- Line 2 contains the continuous missing-barline exercise. The two accepted targets are between the first tied D crotchets and between the tied E crotchets; the final D pair is two tied crotchets with the barline between them printed, so it is not an answer target.
- Line 3 begins with A4 minim, E4 crotchet, A4 crotchet and F-sharp4 minim. Part (b) transposes them one octave lower to A3, E3, A3 and F-sharp3 in bass clef.
- Line 4's missing pitches are B4 minim, A4 crotchet and G4 crotchet.
- The boxed notes in line 5 form a fourth.
- Line 8 deliberately prints five crotchet beats in the incorrect bar: E5 crotchet, D5 crotchet, B4 crotchet and G4 minim. The first three notes must be changed to a crotchet triplet.
- Line 9 gives A minor/VI and requires F then G, also accepted as IV then V or 4 then 5.
- The staff systems and six response boxes use measurements taken from page 7 of the official PDF. The score keeps the source's compact nine-line page proportions, full-width staves, short line 9 stave, boxed `Am`/`VI` prompt and two square chord-answer fields.
- The exact inventory, missing targets, transposition, correction targets, rhythmic totals and final barline are protected by `interactive-exams/tests/higher-2018.test.js`.

### Teacher-confirmed pitch correction

On 3 August 2026, the teacher supplied a complete pitch pass for Question 3. The structured inventory now uses A4, C5, D5, E♭5, D5, D5 / A4, C5, A5, G5, E5, E5 / A4, C5, D5, E♭5, D5, D5 / A4, C5, A5, G5, E5, E4 for line 2, with the two E♭5 accidentals rendered explicitly. Lines 3–5 now use the supplied E4, A4 and D5 corrections while retaining the printed rests, ties, rhythms and the printed F-sharp accidentals at the starts of the relevant lines. Lines 6 and 7 use the confirmed repeated C4/F4 patterns, with each group explicitly beamed as one quaver followed by two semiquavers. Line 6 ends with E4 minim and A3 minim tied to an A3 semibreve; line 7 ends E4 tied to E4. Line 8 now reads F4, A4, C5 / B4, C5, D5 / E5, D5, C5, A4, and line 9 continues the tied A4 with F4, A4, C5 / B4, C5, D5 / G4. The line-8/line-9 A tie is rendered as a system-break tie, and the line-3 transposition entry positions are derived directly from the first four treble notes so pupil-entered bass notes remain vertically aligned. These pitch lists, accidentals, beam groups, ties and the editable line-2 beam/bar-line structure are regression-tested.

The line-2 engraving correction confirmed on the same date keeps ordinary quavers beamed in pairs, except for the printed final four-quaver group. After the second E-flat, the final D pair is two tied crotchets separated by the printed barline. After the tied E5 notes the A4 and C5 are quavers; the later A4 is a semiquaver followed by a dotted-quaver C5. The two A5 notes each have a slashed Bravura grace-note symbol for the G5 acciaccatura immediately before them. These rhythm, beam, ornament and barline details are part of the regression inventory.

### Teacher-confirmed interaction and engraving follow-up

The Line 8 rhythm control presents Dot, Tail, Quaver triplet and Crotchet triplet options. Dot and Tail are applied to individual crotchet notes; either triplet option applies to the complete three-note group. The triplet controls and score markings reuse the established construction from `triplets.html` and `correctrhythm.html`: elliptical noteheads and normal stems, a single beam for quaver triplets, the split open bracket for crotchet triplets, and the same bold serif `3` placement. The official answer remains the crotchet triplet. The two official Line 2 barline gaps remain the only scoring targets, but every internal note-to-note gap inside the marking box is available for placement practice. The bass-clef F-sharp accidental uses the same calibrated horizontal offset as the treble entry. Lines 6 and 7 share the source's unequal bar widths so the dense opening figures have room while the final bars remain compact; their first two dense bars use a small internal end margin so the final stems remain inside the printed barlines. Higher 2018 Question 3 regression tests protect these controls, target counts and layout measurements.

On 3 August 2026, the teacher confirmed that Line 2 barlines must remain exactly at the pupil's selected gaps. The interactive hit areas now divide the available gaps at their midpoints, so neighbouring targets cannot overlap or convert one selected gap into another. The same review found that the shared bass-clef staff height for F3 and F-sharp3 caused the final transposition click to be stored as natural F3; Question 3(b) now resolves that position to F-sharp3 and keeps the accidental in the answer renderer.

## Marking details

- Question 1(a), Question 5(a), Question 7 and Question 8 use the established additional-answer deduction.
- Question 1(b) requires `String quartet`; the incomplete answer `Strings` is rejected as directed by the official instructions.
- Question 4 uses positive marking, with no more than two marks from each of Style/Form, Melody/Harmony and Rhythm/Tempo.
- Question 7 marks Column C only; Columns A and B are rough work.
- Question 8 accepts glissando and imperfect cadence on line 4, harmony on line 9, octaves on line 13 or 14, and contrary motion on line 16.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 16 lyric lines for Higher 2018 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this test note. The shared lyric-placement completion rule counts multiple features placed on the same line, so line 4 correctly holds both `glissando` and `imperfect` while the question still becomes fully answered. Later lyric-placement papers continue to use numbered placeholder text unless the teacher explicitly requests otherwise.
