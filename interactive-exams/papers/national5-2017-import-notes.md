# National 5 Music 2017 import notes

Completed: 31 July 2026

## Official sources

- Question paper: `exampapers/n5/2017/N5_Music_QP_2017.pdf`
- Marking instructions: `exampapers/n5/2017/mi_N5_Music_mi_2017.pdf`
- Introduction and Question 1–8 audio: official Tracks 1–9 in `exampapers/n5/2017/`
- Reference implementation: completed National 5 Music 2014 Digital Past Paper
- Previous import checklists: `national5-2015-review-notes.md` and `national5-2016-import-notes.md`

## Paper inventory

The paper contains eight questions worth 40 marks in total:

| Question | Marks | Main interaction |
| --- | ---: | --- |
| 1 | 7 | Choices and short answers |
| 2 | 4 | Four-part vertical music guide |
| 3 | 6 | Shared interactive notation score |
| 4 | 7 | Vocal-music choices, text and chord grid |
| 5 | 4 | Four-section category grid |
| 6 | 3 | Sentence completion with one combined mark |
| 7 | 4 | Style plus supporting reason |
| 8 | 5 | Rough work and concept-marked final answer |

The question totals and all individual parts both total 40. This is enforced by `interactive-exams/tests/national5-2017.test.js`.

## Audio transcription and calibrated markers

Every official question track was decoded locally and transcribed with a local Whisper model using word timestamps. The cue positions below use the start of the relevant spoken question letter or playback phrase and were checked against the decoded waveform boundaries.

| Question | Measured duration | Calibrated markers |
| --- | ---: | --- |
| 1 | 335.900 s | (a) 6.40, (b) 96.34, (c) 156.04, (d) 202.78, (e) 248.36, (f) 291.02 |
| 2 | 322.479 s | 1st 98.80, 2nd 172.76, 3rd 247.30 |
| 3 | 368.779 s | Preview 7.28, 1st 94.20, 2nd 154.38, 3rd 215.42 |
| 4 | 351.736 s | (a) 7.14, (b) 50.80, (c) 96.62, (d) 143.12, (e) 184.32, (f) 241.20 |
| 5 | 396.597 s | 1st 83.07, 2nd 187.11, 3rd 289.81 |
| 6 | 212.741 s | 1st 54.92, 2nd 133.38 |
| 7 | 189.428 s | (a) 5.96, (b) 97.70 |
| 8 | 386.241 s | 1st 42.62, 2nd 117.20, 3rd 191.82 |

The paper has 29 markers. The regression test locks every value, the total marker count, chronological order, official audio-file existence and duration bounds.

## Question 3 notation inventory

The guide score is in G major and 4/4, with a D-quaver anacrusis followed by four systems of two bars.

| Bar | Pitch and rhythm inventory |
| ---: | --- |
| Anacrusis | D quaver |
| 1 | G dotted crotchet, B quaver, D dotted crotchet, G quaver |
| 2 | F sharp dotted crotchet, B quaver, D crotchet, D crotchet; the pupil corrects the final pair to D dotted crotchet and D quaver |
| 3 | E dotted crotchet, F sharp quaver marked X, G dotted crotchet, E quaver |
| 4 | D dotted minim, B quaver, A quaver |
| 5 | G dotted crotchet, G quaver, G crotchet, missing B quaver, missing A quaver |
| 6 | G dotted crotchet, G quaver, G crotchet, A quaver, B quaver |
| 7 | B quaver, A crotchet, G quaver, E crotchet, A quaver, B quaver |
| 8 | B quaver, A quaver tied to A minim, followed by the final single barline |

Question 3 reuses the shared Bravura notation renderer and the closest existing Practice Questions behaviours:

- 4/4 is applied after the key signature and before the anacrusis.
- Adagio or Andante is placed above the anacrusis or bar 1.
- Bar 2 requires direct score placement: the pupil selects the dot tool and applies it to the third note, then selects the quaver-tail tool and applies it to the fourth note. The tools grey the already-printed part of each note and emphasise only the addition in black.
- The X and Rhythm boxes reproduce the printed score locations.
- Bar 5 uses direct hover/drag note entry with grey previews and a right-aligned Clear control.
- The missing B and A must both be quavers and both pitches must be correct for the mark.
- Marked feedback colours pupil notation and shows the correct notation beside an incorrect insertion.

## Marking decisions and edge cases

- Question 1(a) awards one mark for each correct selected style, including when the other selected style is wrong.
- Question 1(b) accepts imperfect cadence or I to V.
- Question 2 accepts 2, 4, 2/4 or 4/4, including the number words, and rejects all other beat counts.
- Question 2 accepts Arco only for the playing technique; bowing is rejected.
- Question 2 accepts Allegro or Moderato.
- Question 2 accepts snare drum or snare and rejects drum or drums.
- Question 3(c) accepts Adagio or Andante.
- Question 3(e) accepts F sharp/F# and, as explicitly stated in the official guidance, quaver.
- Question 4(c) awards one mark per correct selection and retains an earned mark when the other choice is wrong.
- Question 7(a)(ii) requires a singular voice with orchestra/strings, a solo song in opera, or an operatic-style explanation. Orchestra alone is rejected.
- Question 7(b)(ii) accepts syncopation on its own, or piano and vamp together. Piano alone and vamp alone are rejected.
- Question 8 uses a maximum of two marks per heading and five overall, with full marks requiring at least three headings.
- Question 8 accepts valid concepts in the wrong context, as required by the official guidance.
- Repetition can receive only one mark across Rhythm/tempo and Melody/harmony.
- Question 8 rejects key change for modulation, singular flute, singular violin, guitar alone and drum/drums.
- Only concepts that actually receive one of the five available marks are highlighted green.

## Checks completed

- All usable source-paper pages and both official PDFs were rendered and inspected.
- Official wording and authentic mark positions were mapped into the paper data.
- Every visible choice, accepted alternative and important official exclusion has a regression check.
- A fully correct automatic-marking result is tested at 40/40.
- All 29 Whisper-calibrated audio markers are tested.
- Question 3 has a bar-by-bar pitch/rhythm inventory, direct-interaction checks and a renderer smoke test.
- The complete project test suite passed: 79 tests.
- The fixed 1280px desktop-layout audit passed for all 34 desktop-only pages.

The in-app browser could not reload the local `file://` page during final checking because local-file navigation is blocked by its safety policy. The source renders, runtime notation smoke test and complete automated suite were used instead.

## Checklist for the next paper

1. Read this file, `national5-2016-import-notes.md` and `national5-2015-review-notes.md` before creating paper data.
2. Extract and render both official PDFs before implementation.
3. Build and test the complete 40-mark inventory before styling.
4. Transcribe all official audio locally with Whisper and word timestamps before writing any marker values.
5. Check each spoken cue against the decoded waveform; never infer marker spacing from the track duration.
6. Find the closest Practice Questions notation interaction and record every bar as explicit pitches and rhythms.
7. Encode every accepted alternative and every explicit rejection from the official additional guidance.
8. Test partial marks, shared-concept de-duplication, heading caps, authentic mark positions and feedback highlighting.
9. Test a fully correct 40/40 attempt, marker count/order/duration bounds and notation runtime rendering.
10. Run the complete project suite and fixed-desktop-layout audit.
