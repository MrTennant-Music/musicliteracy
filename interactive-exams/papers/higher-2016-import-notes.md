# Higher Music 2016 import notes

Read this file before importing Higher Music 2017 or any later Higher paper.

## Authority and completed checks

- The official source is `exampapers/higher/2016/NH_Music_QP_2016.pdf`; the official marking instructions are `exampapers/higher/2016/mi_NH_Music_mi_2016.pdf`.
- The paper contains eight questions worth `4, 5, 3, 6, 6, 6, 5, 5` marks, totalling 40.
- The question paper and marking instructions were rendered and audited at 300 dpi on 2 August 2026.
- The focused Higher 2016 test, complete 87-test project suite and desktop-layout audit passed on 2 August 2026.
- A local browser pass verified the complete Question 4 score and the 20-row Question 8 table.

## Question 8 lyric-text decision

- On 2 August 2026, the teacher supplied and requested the original 20 lyric lines for Higher 2016 Question 8. This paper is therefore a specific exception to the placeholder policy.
- Later lyric-placement papers continue to use numbered placeholder text unless the teacher explicitly requests otherwise.
- Preserve the exact number and numbering of source lyric rows so official line-position marking still works.
- Preserve the official feature list, underlined answer words, accepted rows, duplicate accepted positions, additional-answer rule and audio.
- The exact teacher-supplied row order is protected by a regression hash without duplicating the text in the test or these notes.
- Accepted placements are: ritardando on row 3 or 4; arpeggio on row 5; modulation on row 6 or 12; tremolando on row 6; glockenspiel on row 19.

## Official answer inventory

- **Question 1:** Ritornello; Perfect cadence; Basso continuo; Harmonics (singular `Harmonic` is also accepted).
- **Question 2:** Oboe; Syncopation or Ostinato; Arco; Pedal; Melodic minor. Do not accept repetition or riff for the second answer.
- **Question 3:** Musique concrète; Irregular time signature/metre, time changes or an indication of seven beats in the bar; Jazz funk. Do not accept `Jazz` or `Funk` alone.
- **Question 4:** F major or F; Mordent; A dotted crotchet followed by G quaver in bar 5; 5th; E4-F4-G4 quavers at the end of bar 14; G3-F3-D3-E3-F3 one octave lower, with the final F represented by the printed tied minim and quaver.
- **Question 5:** Lied; Interrupted cadence; Strophic; Diminished 7th; Coloratura; Modal.
- **Question 6:** Positive marking, capped at two concepts per category. Credit valid concepts regardless of the heading under which the pupil writes them. The complete accepted inventory is protected in `tests/higher-2016.test.js`.
- **Question 7:** Dominant 7th; Trill; Alberti bass; Simple time; Classical. Only Column C is marked and the official additional-answer deduction applies.
- **Question 8:** Use the placeholder policy and accepted rows recorded above.

## Question 4 notation audit

- The source is in F major and 4/4, with a three-quaver anacrusis followed by 16 numbered treble-clef bars.
- The complete bar-by-bar pitch and rhythm inventory is stored as `HIGHER_2016_Q4_BARS` in `interactive-exams/exam-notation.js` and protected by `tests/higher-2016.test.js`. The user-confirmed numbered-bar pitches are recorded there exactly; shorthand `df` and `ef` are represented as D4 and E4 because the printed F-major score has no corresponding accidentals.
- User confirmation: bar 8 is F4-F4-C5-D5-E5.
- Bars 1-15 total four crotchet beats. The printed final bar is an explicit three-beat exception: tied F minim and quaver followed by a quaver rest.
- Bar 5 retains the two deliberately incorrect printed crotchets. Pupils arm the shared dot or quaver-tail tools and place the corrections directly on the first two notes. The accepted result is A dotted crotchet followed by G quaver.
- Bar 14 keeps editable note indices `[4, 5, 6]`, with E4-F4-G4 quavers as the answer.
- The six printed noteheads used by the transposition task are G4-F4-D4-E4-F4 tied to F4: the final two noteheads are the tied minim and quaver at the start of bar 16. The transpose box surrounds this complete source group and both staves.
- The transposition answer uses six written noteheads: G3-F3-D3-E3-F3-F3. The final F quaver is a separate required entry; it must not appear automatically when the tied F minim is placed. Once both F slots are entered, they are tied in the bass clef.
- The first four entered transposition quavers share one beam and each lower note is aligned under its corresponding printed source note above.
- Key, ornament and interval answers are typed inside their printed score boxes. Rhythm and pitch answers use shared Bravura notation, grey hover previews, dragging, feedback colours and right-aligned Clear controls.
- The barline between bars 15 and 16 is drawn on both staves. Neither stave has a final barline after bar 16.

## Audio markers

The eight official tracks contain 32 calibrated markers:

- Question 1: `45`, `120.5`, `227.12`.
- Question 2: `72.98`, `178.02`, `283.96`.
- Question 3: `6.78`, `55.3`, `102.68`.
- Question 4: `14.86`, `259.14`, `381.04`, `503.46`.
- Question 5: `47.8`, `127.4`, `206.7`, `316.06`, `379.22`, `419.62`.
- Question 6: `53.92`, `138.32`, `223.76`.
- Question 7: `121.82`, `191.56`, `292.12`, `356.54`, `455.22`, `521.56`, `611.56`.
- Question 8: `108.84`, `230.54`, `352.56`.

The regression test checks the exact values, count, chronological order and measured track-duration bounds.
