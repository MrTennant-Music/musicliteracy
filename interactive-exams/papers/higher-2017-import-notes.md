# Higher Music 2017 import notes

## Sources

- Question paper: `exampapers/higher/2017/NH_Music_QP_2017.pdf`
- Marking instructions: `exampapers/higher/2017/mi_NH_Music_mi_2017.pdf`
- `01 Track 1-1.mp3` is the general introduction. Questions 1–8 use Tracks 2–9 respectively.
- The paper has eight questions worth 5, 5, 4, 6, 4, 5, 6 and 5 marks, totalling 40.

## Audio calibration

All question tracks were transcribed locally with Whisper `small.en`. Cue positions were checked against word timestamps and kept at the start of the spoken section or replay cue.

- Question 1: `43.94`, `107.04`, `211.54`, `243.94`
- Question 2: `77.50`, `157.96`, `238.14`
- Question 3: `7.20`, `89.22`, `105.60`, `127.40`, `199.42`, `232.14`
- Question 4: `11.78`, `221.46`, `309.02`, `397.04`
- Question 5: `46.46`, `117.02`, `232.40`, `303.56`
- Question 6: `116.32`, `210.33`, `305.76`, `395.22`, `487.68`, `577.88`, `664.30`
- Question 7: `49.32`, `125.86`, `203.12`
- Question 8: `106.52`, `200.54`, `295.42`

There are 34 calibrated markers. Regression tests protect their values, order and track-duration bounds.

## Question 4 notation audit

- Source: page 7 of the official question paper, rendered and inspected at 600 dpi after a 300 dpi page audit.
- Key and metre: G major, 4/4.
- Inventory: 23 numbered bars across seven systems: bars `1–4`, `5–7`, `8–11`, `12–14`, `15–18`, `19–21`, `22–23`.
- Every bar totals four crotchet beats.
- Cross-bar ties occur at bars `3–4`, `6–7`, `11–12`, `15–16`, `19–20` and `22–23`.
- Part (a): insert `4/4` or common time before bar 1.
- Part (b): the boxed interval in bar 3 is a sixth.
- Part (c): the boxed quaver and crotchet in bar 5 total 1½ beats. Feedback displays the decimal form `1.5 beats` first, while fraction and written forms remain accepted.
- Part (d): bar 11 missing pitches are C5 crotchet, B4 crotchet and G4 quaver.
- Part (e): bars 16 and 17 are D then G, also accepted as V then I or 5 then 1.
- Part (f): the boxed notes in bar 22 transpose to C4 quaver, G3 quaver tied to G3 quaver, then A3 crotchet in bass clef.
- Exact pitch, rhythm, editable-index and final-barline inventories are protected by `interactive-exams/tests/higher-2017.test.js`.

The printed lyric underlay is retained in the interactive score so the seven systems preserve the source paper's spacing and visual alignment. The score uses source-measured unequal bar widths, fixed answer-box geometry, the full-width treble systems and the short bass-clef stave shown on page 7. These layout values are stored separately from the note inventory and protected by the Higher 2017 regression test.

The user-confirmed time-signature palette for Question 4(a) contains 2/4, 3/4, 4/4, 6/8, 9/8 and 12/8. Common time remains accepted by the marking logic for compatibility, but it is not displayed as a pupil choice.

The tied quaver pairs in bars 1, 9, 13 and 17 cross a crotchet-beat boundary. They retain separate quaver tails and must not be automatically beamed together.

The Question 4(a) time signature is positioned 15px to the right of the earlier score placement, with its answer-removal target moved by the same amount.

The user-confirmed Question 4 melody inventory updates the printed pitches across systems 1–7 while preserving the official rhythms, rests, ties and bar-11 marking-scheme note entry. The G-major F notes remain encoded as F♯4; the final bar-14 quaver is D4, and the line-7 ending is D5, C5, G4, G4, A4, A4, A4, G4.

In the bass clef below bar 22, the G-major sharp is placed on the fourth staff line (the F♯ position), not the top line.

The later source-alignment corrections retain a tie from the third B to the fourth B in bar 3, restore the internal tie between the repeated G quavers in bar 22, remove the unwanted internal tie in bar 23, and retain the printed tie from the final A in bar 22 into bar 23. The bar-19 crotchet is G4, not E4. The lyric underlay places `out__` under the second note of bar 1, `gan__` under the third note of bar 4, `ends__.` under the final note of bar 6, `gets` under the fifth note and `what__` under the final note of bar 19, and `lost____.` under the third note of bar 20. The final `ends______` remains under the final note of bar 22. The earlier bar-17/18 lyric placement and confirmed small offsets remain protected. The four chord boxes in the chords section are raised by 15px together so the printed and pupil-entry boxes remain aligned.

The bar-21 tie is positioned between the third and fourth notes; the second note remains untied.

The later score-box calibration extends the value box 5px downward, tightens the interval box to the final two notes of bar 3 and extends its bottom by a further 30px in total, extends the notes box 10px to the right, and lowers the outer chords box by 5px. The confirmed lyric offsets place `gets` 8px left, and `ends______`, `lost____.` and `ends__.` 15px right of their note anchors.

## Marking details

- Question 1(a), Question 5(a) and Question 6 use the established additional-answer deduction.
- Question 6 marks Column C only; Columns A and B are rough work.
- Question 7 uses positive marking, with no more than two marks from each of Melody/Harmony, Rhythm and Timbre. Banjo and mandolin are accepted under Timbre as stated in the official instructions.
- Question 8 has 18 source positions. Accepted placements are octave—line 3; dominant 7th—line 4, 5 or 6; cello—line 6 or 7; xylophone—line 10; drum roll—line 16.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 18 lyric lines for Higher 2017 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this test note. Later lyric-placement papers continue to use numbered placeholder text unless the teacher explicitly requests otherwise.
