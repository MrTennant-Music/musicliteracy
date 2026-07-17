# National 5 Music 2015 review and lessons for the 2016 import

Last reviewed: 17 July 2026

## Purpose

This file records the corrections made while reviewing the 2015 Digital Past Paper and turns them into a checklist for importing the 2016 paper. It should be read alongside the project instructions before work begins on National 5 Music 2016.

## Sources checked

- Official question paper: `exampapers/n5/2015/N5_Music_QP_2015.pdf`
- Official marking instructions: `exampapers/n5/2015/mi_N5_Music_mi_2015.pdf`
- Official audio tracks 1-9 in `exampapers/n5/2015/`
- The completed National 5 Music 2014 Digital Past Paper for shared layout, interaction and audio-marker conventions
- Direct teacher review of the music, notation and browser presentation

## Audio-marker corrections

All 30 section markers were checked against the spoken cues in the official recordings. A local Whisper speech-to-text transcription was used to locate every cue, then each position was refined against the waveform and the 2014 lead-in convention.

- Question 1: `(a) 0:06.54`, `(b) 0:50.32`, `(c) 1:33.56`, `(d) 2:29.76`, `(e) 3:41.68`, `(f) 4:17.90`
- Question 2: `1st 1:39.46`, `2nd 2:58.94`, `3rd 4:19.00`
- Question 3: `Preview 0:13.94`, `1st 1:06.70`, `2nd 2:10.66`, `3rd 3:14.48`
- Question 4: `(a) 0:05.74`, `(b) 0:42.96`, `(c) 1:19.52`, `(d) 2:22.60`, `(e) 3:18.06`, `(f) 4:48.88`, `(g) 5:38.86`
- Question 5: `1st 1:25.38`, `2nd 2:19.70`, `3rd 3:14.32`
- Question 6: `1st 0:57.80`, `2nd 2:35.92`
- Question 7: `(a) 0:06.28`, `(b) 1:25.72`
- Question 8: `1st 0:46.86`, `2nd 1:59.22`, `3rd 3:12.10`

Regression tests now preserve the exact values, total marker count, chronological order and track-duration limits.

## Question 2 guide and feedback layout

- Lowered the vertical guide arrows by `0.5px` for optical alignment.
- In marked feedback, placed each feedback box to the right of its matching guide answer on desktop.
- Kept the original guide column centred so showing feedback does not shift the pupil's work to the left.
- Kept the layout responsive so narrow screens can return to a readable stacked presentation.

## Question 3 notation corrections

- Added `20px` between every notation staff system.
- Added a further `30px` between systems 3 and 4 and increased the score height accordingly.
- Corrected bar 5 to the teacher-verified pitch sequence `A, A, A, A, G, A, B flat` after the opening rest.
- Corrected bar 6 to a C semibreve.
- Made bar 7 repeat bar 5's pitch pattern while retaining its missing-note interaction.
- Changed the last two notes and the matching guide rhythm in bar 7 to a pair of quavers.
- Moved the bar 7 guide rhythms down `30px`, aligned the guide pairs with their notes and adjusted the editable box around them.
- Moved the X above bar 5 up `7px`.
- Positioned each lyric word or syllable under its individual note, including split syllables and tied continuations.
- Updated the interactive missing-note answer and feedback to `A, G, A, B flat`.

Teacher-verified override: the final missing-note pitches above intentionally differ from the text extracted from the published 2015 marking-instruction PDF. Do not replace them with `A, A, B flat, C` without a new musical review and explicit teacher confirmation.

## Paper layout corrections

- Shortened ordinary answer lines by a total of `50px` from the right while retaining their established left edge.
- Positioned Question 6's combined `3` at the right of the final answer-line row, including marked feedback.
- Positioned Question 8's combined `5` beside “Here is the music for the third time.” and removed the duplicate beside the final-answer lines.
- Kept feedback boxes beside Question 2's visual-guide answers without moving the guide itself.

Teacher-verified override: the printed Question 8 paper places the `5` beside the final-answer page. The Digital Past Paper deliberately places it beside the third-playback instruction following the review decision above.

## Marking and feedback corrections

- Question 4(g) accepts both `Soprano` and the official alternative `Mezzo-soprano`. Its feedback now explains that both receive the mark.
- Question 7(a)(ii) still rejects an answer that describes a soloist with orchestra, but now correctly accepts natural negative wording such as “There is no solo instrument, only the full orchestra.”
- Question 8 now highlights only concepts that actually earned marks: no more than two per heading and no more than five overall.
- The same awarded-concept limit is used for green highlighting in the pupil's final answer.
- Restored submitted attempts are remarked from their saved answers, so marking corrections appear after refresh without deleting the pupil's work or completion time.
- The automatic-marking notice now begins with plain text: “Marking is automated using the official marking instructions.” The `Notice:` label and bold styling were removed, and the final sentence directs pupils to give feedback “using the link below”.

## Checks completed

- Confirmed eight questions and 40 marks, with official allocations of `6, 4, 6, 8, 4, 3, 4, 5`.
- Confirmed that every primary answer and declared accepted alternative earns its intended mark.
- Confirmed that every incorrect visible radio option earns zero.
- Confirmed Question 2 rejects `Brass` where `Trumpet(s)` is required.
- Confirmed all three accepted Question 3 tempo terms and both accepted Question 4(g) voice types.
- Checked all 65 declared Question 8 answer forms individually.
- Confirmed Question 8 rejects three beats, singular `violin` and English dynamic descriptions.
- Confirmed a blank paper scores zero and a complete correct paper scores 40.
- Confirmed Question 8's marked concepts and highlighted evidence never exceed its awarded marks.
- Confirmed submitted feedback survives refresh and is recalculated using the current marking rules.
- Passed JavaScript syntax checks, the complete Interactive Exam test suite and whitespace/error checks.

## Required process for the 2016 import

1. Extract and compare the complete official question paper and marking instructions before building questions.
2. Create a 40-mark answer inventory containing every expected answer, accepted alternative, explicit rejection and spelling decision.
3. Transcribe every official audio track with a local Whisper model. Calibrate each spoken cue against the waveform and the 2014 lead-in convention; never estimate markers from duration alone.
4. Add exact marker, marker-count, chronological-order and track-duration tests before considering audio complete.
5. For notation, write a bar-by-bar inventory of pitches, rhythms, rests, beams, lyrics, key/time signatures, editable notes and correct answers before changing the renderer.
6. Compare every distinctive layout with the source paper in both unanswered and marked-feedback views. Check mark numerals separately because their correct row can change between layouts.
7. Test every declared accepted answer automatically, every incorrect visible choice, the blank score, the full score and all multi-mark caps.
8. Test natural reason sentences, including negation, so keyword matching does not reverse the pupil's meaning.
9. Ensure feedback highlights only awarded concepts, not every recognised concept.
10. Reload a saved submitted attempt after any marking change to confirm that current feedback is restored without losing pupil answers or timestamps.
11. Record all teacher-verified deviations from the scanned paper or marking instructions explicitly so later maintenance does not accidentally undo them.

