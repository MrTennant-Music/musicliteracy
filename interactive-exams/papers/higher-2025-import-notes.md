# Higher Music 2025 import notes

## Source inventory

- Official question paper: `exampapers/higher/2025/Music H 2025 Paper.pdf` (20 pages).
- Official marking instructions: `exampapers/higher/2025/Music H 2025 Answers.pdf` (5 pages).
- Official audio: Track 01 is the opening announcement; Tracks 02–09 are Questions 1–8.
- Question marks: `4, 5, 4, 6, 5, 6, 5, 5` (40 total).

## Audio calibration

All eight question tracks were transcribed with the local `small.en` Whisper model and word timestamps. Question 3(b), Question 4's third playing, Question 5's second and third playings, Question 7's six excerpt transitions and Question 8's first playing were independently re-transcribed from short audio windows.

| Question | Calibrated marker times (seconds) | Duration (seconds) |
| --- | --- | --- |
| 1 | 43.02, 127.04, 241.30 | 293.80 |
| 2 | 70.92, 156.60, 242.72 | 340.56 |
| 3 | 7.02, 53.64, 73.88, 98.86, 169.36, 193.30 | 224.13 |
| 4 | 11.52, 211.88, 294.78, 378.58 | 553.38 |
| 5 | 43.26, 127.66, 211.54, 325.68 | 370.39 |
| 6 | 47.78, 122.36, 197.40 | 444.40 |
| 7 | 119.86, 214.32, 306.84, 397.06, 486.52, 575.60, 656.06 | 788.14 |
| 8 | 100.84, 187.62, 274.28 | 374.00 |

The regression test protects all 33 marker values, chronological order and duration bounds.

## Question 4 notation audit

The official score page and both marking-instruction pages were rendered at 600 dpi. The six staff systems were cropped and inspected independently against the G-major treble-clef pitch map.

- Key: G major.
- Time signature: 4/4.
- Score: 24 complete bars across six four-bar systems.
- Bar totals: every encoded bar contains four crotchet beats.
- (a) bar 3: the C5 quaver is the subdominant of G major.
- (a) interaction: the first-system 4/4 signature is positioned 20px farther right for visual separation from the key signature. A fresh attempt leaves the subdominant response blank and lets the pupil select any printed note in the bar-3 box; only the C5 selection earns the mark.
- (b) bars 7 and 8: D then Em, V then VI, or 5 then 6.
- (c) bar 11 one octave lower in bass clef: B3 quaver, C4 quaver, B3 crotchet, A3 quaver and G3 quaver. The slur is optional.
- (d) bar 17: D5 quaver followed by C5 quaver, confirmed by the teacher.
- (e) the missing bar line separates bars 21 and 22.
- (e) interaction: pupils may place one bar line in any note-to-note gap inside the answer box; selecting another gap moves it. Only the boundary after bar 21 earns the mark.
- (f) bar 23: a fourth.
- Final barline: double barline.

### Teacher-confirmed Question 4 pitch corrections

- Bars 5–7 (line 2): G4, G4, B4, B4, C5, G4; G4, G4, C5, C5, B4, A4; A4, G4, B4, B4, G4, G4. Bar 8 is a full-bar rest.
- Bar 10: B4 minim followed by a minim rest.
- Bars 13–15 (line 4) repeat the bar-5–7 pitch pattern above. Bar 16 is a full-bar rest.
- Bars 21–24 (line 6): G5, E5, G5, G5, E5, E5, G5, E5, A5, A5, F5, E5, D5, D5, with the printed rests and rhythms retained in the structured inventory.
- All different-pitch slurs were removed from the score at the teacher's request. The repeated-note ties in bars 5–7 and 13–15 remain, as does the E tie across bars 21–22.
- The complete six-system lyric underlay was added from the teacher-confirmed score reference. Each syllable, hyphen and continuation underline is mapped to its printed note position in the structured inventory.
- The bar-21 `heart_____` lyric is optically shifted 15px right.

The complete pitch, rhythm and lyric inventory, editable indices, beam groups, ties, answer targets and bar totals are stored in `exam-notation.js` and protected by `tests/higher-2025.test.js`.

## Official marking decisions preserved

- Questions 1(a), 5(a), 7 and 8 use the Higher additional-answer deduction rule.
- Question 1(b) accepts piano sonata but rejects sonata form.
- Question 2 accepts syncopation or ostinato and any clearly identified saxophone type.
- Question 3(c) accepts irregular time, time changes, 5/4 or any clear indication of five beats in a bar.
- Question 6 awards no more than two concepts per heading, accepts valid concepts under another heading and rejects relative major.
- Question 7 marks Column C only.
- Question 8 accepts dominant 7th on line 2; tremolando on line 2 or 3 or both; hi-hat on line 5 or 6 or both; con sordino on line 7 or 8 or both; and xylophone on line 15.

## Verification checklist

- Run the dedicated Higher 2025 regression test.
- Run the complete automated suite and permanent desktop-layout audit.
- Browser-check all eight questions, all six Question 4 interactions and all 15 Question 8 placeholder rows.
