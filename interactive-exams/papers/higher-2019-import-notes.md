# Higher Music 2019 import notes

## Sources

- Question paper: `exampapers/higher/2019/Music H 2019 Paper.pdf`
- Marking instructions: `exampapers/higher/2019/Music H 2019 Answers.pdf`
- `Music H 2019 - Track 01-1.mp3` is the general introduction. Questions 1-8 use Tracks 02-09 respectively.
- The paper has eight questions worth 5, 5, 6, 3, 5, 5, 6 and 5 marks, totalling 40.

## Audio calibration

Every official question track was decoded with the local ffmpeg binary supplied by `imageio-ffmpeg` and transcribed locally with Whisper `small.en`, English language selection and word timestamps. Each marker uses the start of the genuine spoken question part or replay cue. False text produced from singing and instrumental passages was ignored. Question 7's second replay cue was independently re-transcribed from a short source-audio window because it was missed in the full-track transcription.

- Question 1: `42.64`, `107.28`, `202.18`, `272.94`
- Question 2: `77.18`, `173.36`, `270.82`
- Question 3: `12.22`, `218.24`, `304.16`, `390.24`
- Question 4: `18.66`, `64.08`, `114.82`
- Question 5: `115.78`, `204.14`, `290.04`, `373.24`, `454.56`, `537.38`, `610.02`
- Question 6: `44.50`, `107.70`, `170.96`, `263.98`
- Question 7: `51.10`, `115.74`, `181.42`
- Question 8: `99.90`, `162.52`, `225.98`

There are 31 calibrated markers. Regression tests protect their exact values, chronological order and official-track duration bounds.

## Question 3 notation audit

- Source: page 7 of the official question paper, rendered at 600 dpi. Each of the seven staff systems was checked independently against the source.
- Key and metre: F major, 6/8; 25 numbered bars.
- Bars 1-4: F4 dotted minim; C5 dotted minim; F4 dotted minim tied to F4 dotted crotchet, followed by a quaver rest and G4-A4 quavers.
- Bars 5-8: B-flat4 dotted minim tied to B-flat4 quaver, A4 crotchet tied to A4 dotted crotchet; G4 dotted minim; full-bar rest.
- Bars 9-12: D4 quaver-D4 crotchet-D4 dotted crotchet; D4 quaver-E4 crotchet-E4 dotted crotchet; F4 dotted minim; G4 crotchet-A4 quaver-A4 quaver-B-flat4 crotchet.
- Bars 13-16: A4 dotted minim; missing G4 dotted minim; missing F4 dotted minim; full-bar rest.
- Bars 17-20: E4 crotchet-A4 quaver-A4 quaver-C5 quaver-E5 quaver; D5 dotted minim; the bar-17 figure repeated; D5 dotted minim.
- Bars 21-23: missing quaver rest followed by F5 crotchet-F5 quaver-E5 quaver-D5 quaver; C5 quaver-D5 crotchet-D5 dotted crotchet; C5 quaver-C5 crotchet-C5 dotted crotchet.
- Bars 24-25: crotchet rest followed by A4-A4-C5-A4 quavers, then B-flat4 dotted minim. The boxed quavers transpose one octave lower to A3-A3-C4-A3 in bass clef, retaining the tie between the first two notes.
- Part (a): insert 6/8 as a musical time signature.
- Part (b): the boxed interval across bars 2 and 3 is a fifth.
- Part (c): bars 10 and 11 are C then D minor, also accepted as V-VI or 5-6.
- Part (d): bar 14 is G4 dotted minim and bar 15 is F4 dotted minim.
- Part (e): insert a quaver rest anywhere before the first printed note in bar 21.
- Part (f): A3-A3-C4-A3 quavers in bass clef, with the first two A notes tied.
- The exact pitch, rhythm, tie, editable-target and final-barline inventory is protected by `interactive-exams/tests/higher-2019.test.js`.

On 3 August 2026, the teacher confirmed the complete Question 3 pitch inventory. All unspecified pitches are octave 4: line 1 ends G4-A4; line 2 is B-flat4, B-flat4, A4, A4, G4; line 3 is D4, D4, D4, D4, E4, E4, F4, G4, A4, A4, B-flat4; line 4 is the printed A4 followed by editable G4 and F4; line 5 is E4, A4, A4, C5, E5, D5, E4, A4, A4, C5, E5, D5; line 6 is F5, F5, E5, D5, C5, D5, D5, C5, C5, C5; and line 7 is A4, A4, C5, A4, B-flat4.

On 3 August 2026, the teacher supplied the official Question 3 score crop and requested a closer visual match. The seven systems now use source-measured unequal bar widths, the shorter bars 24–25 final system, the six printed response-box boundaries, the boxed B-flat/IV prompt, square chord-answer fields and a bass stave aligned beneath bar 24. The lyric underlay is retained as layout data because its syllable positions materially determine the source spacing. Regression checks protect the complete layout geometry and exact lyric placement as well as the musical inventory.

On 3 August 2026, the teacher confirmed the following Question 3 corrections: the final note of bar 9 is tied into the first note of bar 10; bar 12's two A4 quavers are individually flagged rather than beamed, with their tie retained; the second and third notes of bars 17 and 19 are A4 quavers tied together; the bass-clef B-flat is placed on the second line up; the response boxes use the tightened or extended boundaries requested against the source; and the existing lyric anchors are retained at the confirmed note positions for `stay?`, `be`, `a`, `I`, `can't`, `-things` and `are`.

The `stay?`, `be`, `a`, `I` and `can't` lyrics begin directly under their confirmed notes in bars 3, 5, 6, 9 and 10 respectively, with their completion lines extending to the right.

The Interval, Chords and Notes response boxes were each extended a further 10px downward after visual review.

The Higher time-signature control uses the established six choices (2/4, 3/4, 4/4, 6/8, 9/8 and 12/8), with the Higher 2019 answer position calibrated 10px further right after visual review. The bar-21 rest control offers whole, minim, crotchet and quaver rests; the selected rest is rendered in the score before marking.

## Marking details

- Question 1(a), Question 5, Question 6(a) and Question 8 use the established additional-answer deduction.
- Question 2 accepts portamento for glissando, string bass for double bass, tremolo for tremolando and ground bass for passacaglia. `Bass` on its own is rejected.
- Question 4(b) accepts Sonata or chamber music.
- Question 5 marks Column C only; Columns A and B are rough work.
- Question 6(b) accepts Impressionist, Impressionism or Sonata.
- Question 7 uses positive marking, with no more than two marks from each of Style/form, Melody/harmony and Timbre. Concerto grosso is not accepted for Concerto, a named ornament is not accepted for Ornament/trills, and singular Violin is not accepted for Violins/strings.
- Question 8 accepts con sordino on line 1; sequence on line 4 or 5; chromatic on line 8 or 10; minor on line 10; and dominant 7th on line 14.

## Question 8 lyric-text decision

On 2 August 2026, the teacher supplied and requested the original 15 lyric lines for Higher 2019 Question 8. This paper is therefore a specific exception to the placeholder policy. The exact row order is protected by a regression hash without duplicating the text in this test note. The shared lyric-placement completion rule counts multiple features placed on the same row, so line 10 can correctly hold both `chromatic` and `minor` while the question still becomes fully answered.
