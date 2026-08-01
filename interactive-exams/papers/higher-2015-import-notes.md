# Higher Music 2015 import notes

Read this file before importing Higher Music 2016 or any later Higher paper.

## Authority and audit status

- Treat this file as the durable record of the Higher 2015 build. For later Higher papers, read it after `AGENTS.md` and before inspecting or encoding the new paper.
- Work in this order: official question paper, official marking instructions, teacher-confirmed corrections or adaptations recorded here, then the completed National 5 interaction patterns. Never infer a Higher rule from the rendered 2015 page when the source or marking instructions say something different.
- The official Higher 2015 question paper and marking instructions were rendered at 300 dpi and checked page by page on 1 August 2026. The mark total, all written answers, the score inventory, the 17 lyric lines and all 31 audio markers are protected by `tests/higher-2015.test.js`.
- A complete official response currently scores 40/40. The focused Higher test, the full 86-test project suite and the desktop-layout audit all passed on 1 August 2026.
- A local HTTP browser pass verified the Question 4 wording and the mixed green/red Question 7 concept feedback on 1 August 2026. Browser automation remains blocked when the paper is opened with a `file://` address, so prefer serving the project locally for future browser verification.

## Source and marking checks

- Use the official question paper and marking instructions together. Higher papers introduce layouts and additional guidance that cannot be inferred reliably from the question paper alone.
- Build a question-by-question mark inventory before implementation. Higher 2015 has nine questions worth `3, 5, 3, 6, 3, 6, 4, 5, 5` marks, totalling 40.
- Keep rejected partial terms explicit in the data and tests. In 2015, examples include `diminished` without `7th`, `chant` without an accepted plainchant term, and `6th` without `added`.
- Higher 2015 Question 7 accepts `Harmonic minor scale` or `Harmonic minor` through the shared cautious spelling system. The teacher specifically confirmed that the pupil spelling `Haronimc minor scale` should earn the mark.
- Apply the official additional-answer rule to fixed-choice multi-answer responses where the paper requires a set number of selections. For extended analysis responses such as Higher 2015 Question 6, valid concepts are capped at the marks available for each heading and the whole question, but incorrect or additional responses are ignored rather than deducted.

## Official answer and marking inventory

- **Question 1:** Interrupted cadence; Concerto grosso; Basso continuo.
- **Question 2:** Homophonic/Homophony; Diminished 7th; Clarinet; `12/8`, with `6` or `6/8` also accepted but not `compound time` on its own; Perfect.
- **Question 3:** Plainchant/Plainsong/Gregorian chant; Recitative/Recit; Added 6th/D6. Do not accept `chant`, `6th` or `major 6th` on their own.
- **Question 4:** (a) E3 minim, G3 minim and C4 dotted minim; (b) `4th`, `4` or any answer naming a fourth; (c) flat; (d) E5 dotted crotchet, A4 quaver and A4 minim; (e) all three exact bar-line positions; (f) G then Am, or V then VI. The official guidance also accepts A in place of Am and `5`/`6` in place of V/VI.
- **Question 5:** 3 against 2; Impressionist/Impressionism; String quartet.
- **Question 6:** Melody/harmony — Major, Minor, Modulation/key change, Ornament/mordent, Perfect cadence, Plagal cadence. Rhythm — Anacrusis, Irregular time signatures/metres, Syncopation. Timbre — Accordion, Bass guitar, Claves/woodblock, Drum kit, Flute, Flutter tonguing. Award no more than two marks from each heading; writing a valid concept under the wrong heading does not lose the mark.
- **Question 7:** Time changes; Soul; Harmonic minor scale/Harmonic minor; Strophic.
- **Question 8:** Classical; Sonata; Acciaccatura; Sequence; Anacrusis. Only Column C is marked.
- **Question 9:** Glissando at line 6; Rallentando at line 10 or 11 or both; Tremolando at line 11; Scale at line 14; Rolls at line 16 or 17 or both. An accepted feature appearing on both of its permitted lines remains one answer, not an additional response.

## Question-by-question blueprint

- **Question 1 — three concepts, 3 marks:** show the source concept bank before three ruled inputs. Each line is independently selectable. Mark all three lines as one response so answers may be entered in any order, on separate lines, or together on one line. Keep the single `3` in the `MARKS` column. The final top-to-bank gap was reduced so it matches the gap from the bank to `Insert your three answers on the lines below.`
- **Question 2 — guide, 5 marks:** use one short-answer line beneath each of the five prompts and put each `1` to the right. Feedback containers must remain inside the printed guide width. Official answers are Homophonic/homophony; Diminished 7th; Clarinet; 12/8 with the listed numerical alternatives; and Perfect.
- **Question 3 — vocal styles and chord, 3 marks:** retain three separate one-mark short answers. Explicitly reject `chant` on its own and `6th` or `major 6th` for the final chord.
- **Question 4 — music literacy, 6 marks:** all six answers belong directly in or on the printed score boxes. Use shared National 5 notation interactions and the teacher-confirmed score inventory below. Do not create answer-line substitutes for score answers.
- **Question 5 — three excerpts, 3 marks:** keep the four source checkboxes for part (a), followed by its two compact playback cues, then one short line each for parts (b) and (c).
- **Question 6 — extended analysis, 6 marks:** rough work is unmarked; only Final answer earns marks. Provide a selectable input on every final ruled line. Award one mark per valid concept, capped at two per heading. Six marks therefore requires two valid concepts from each of Melody/harmony, Rhythm and Timbre. Incorrect answers, extra answers and writing a concept under the wrong heading do not remove marks. For example, Accordion, Drum kit, Major, Perfect cadence and Syncopation earn 5 marks.
- **Question 7 — four concepts, 4 marks:** reuse the Question 1 concept-line interaction with four lines, any order and combined-line entry. Apply the official additional-answer deduction. Colour entered concepts individually in feedback rather than colouring the printed ruled lines.
- **Question 8 — comparison, 5 marks:** Columns A and B are unmarked rough work. Only Column C earns marks. The complete cells are clickable and extra selections remain possible. Put the `5 marks` footer directly beneath Column C. In feedback, show only green or red ticks; do not shade selected cells.
- **Question 9 — lyric placement, 5 marks:** retain all 17 lyric rows and the five underlined feature words. Accept the underlined word or its complete printed phrase. Colour only the pupil's entered words in feedback, with no coloured underline or outer-cell highlight.

## Intentional source adaptations

- Replace print-only location wording such as `on the next page` and `on the opposite page` with `below` when the score or table is on the same digital page. Do not otherwise paraphrase source instructions.
- The Question 9 question paper prints `To stay in and cuddle` and `When life gets rough`, while the official marking instructions print `To stay in cuddle` and `When life gets tough`. The teacher supplied and approved the marking-instruction versions, which are the versions used in the interactive table.
- The official Question 4(c) marking guidance places the flat before the first note in bar 11. The teacher explicitly extended the interactive answer so the pupil may place the flat before either of the two notes enclosed by the `(c) Accidental` box, including the final quaver. Preserve this as a deliberate teaching adaptation unless the teacher later reverses it.
- The official general marking principle deducts extra responses, but the teacher explicitly confirmed that Higher 2015 Question 6 and equivalent extended-analysis questions use positive marking only: valid concepts earn marks and incorrect or additional concepts do not deduct marks.

## Higher multi-answer layouts

- A printed concept bank with ruled answer lines uses the reusable `concept-lines` interaction. Pupils may place all concepts on one line or use one concept per line.
- Put the concept bank before the instruction and answer lines when that is the order in the source paper. Keep the instruction immediately below the bank.
- Give every printed answer line its own input. Combine all line values for marking, ignore their order and accept several answers on one line as well as one answer per line.
- Completion status is based on the number of responses requested, not merely whether any text exists. Questions 1, 6, 7 and 8 remain `Partially answered` until 3, 6, 4 and 5 responses respectively have been entered. `Check Answers` remains available at every stage, including when blank.
- Align concept-answer lines with the left edge of the question text, not with the inset concept bank.
- Bold only the requested number of concepts in instructions such as `three` or `four`. Do not bold the word `answers` unless the source does.
- Put the combined bold mark numeral in the authentic `MARKS` column, not at the end of the answer-line width.
- For extended listening analysis, keep rough work visibly unmarked and mark only the final answer. Higher 2015 Question 6 is capped at two marks per heading and requires two correct concepts from each of Melody/harmony, Rhythm and Timbre for six marks. Incorrect or additional responses do not lose marks; a pupil can therefore earn five marks for five valid concepts spread across the headings.
- A comparison table uses `comparison-grid`. Columns A and B remain usable rough work; only Column C is marked. Do not limit the number of Column C selections in the interface because selecting too many is a markable pupil error.
- A lyrics-placement task uses `lyric-placement`. Mark the underlined concept word, accept the complete printed feature phrase, and preserve official alternative line positions. Where the instructions accept a feature on either of two lines or on both, the duplicate accepted placement must not trigger an additional-answer penalty.
- Keep `Check Answers` available in Practice Mode even when a question is blank or incomplete. This is separate from completion status: the question menu must still say `Not attempted`, `Partially answered` or `Answered` according to the required response count.

## Higher source layout and typography

- When the source paper superimposes a written-answer box on the score, put the digital field inside that same score box and do not add a duplicate underline beneath the written prompt. Preserve the source interaction: a single interval answer uses its printed line, while separate chord answers use separate small boxes.

- Recheck every bold phrase against the official PDF. Higher papers use selective emphasis inside instructions; do not infer bold styling from nearby text.
- Keep all source mark numerals bold and in the `MARKS` column. For marks aligned to a playback cue or instruction, place the numeral on that exact source row rather than beside the answer control.
- In guide-style questions such as Higher 2015 Question 2, put each answer line beneath its prompt and keep the individual `1` marks outside the guide box in the `MARKS` column.
- Preserve source paragraph order. Playback cues, answer banks, checkboxes and tables must appear before or after one another exactly as shown in the paper.
- Consecutive `Here is the music...` or `Here is Excerpt...` statements use compact line spacing. Group each source pair or set without adding paragraph-sized gaps between cues.
- Do not show `[END OF QUESTION PAPER]` after an intermediate rough-work or final-answer area. Show it only after the last actual question.

## Higher extended-analysis layout

- Present the Question 6 headings `Melody/Harmony`, `Rhythm` and `Timbre` in one centred row without bullet points.
- Leave a clear gap beneath that headings row before the next paragraph.
- Keep `Marks will only be awarded for the final answer.` regular weight. Retain bold only where the source uses it, such as `Rough work will not be marked.`
- Centre the `Rough work` and `Final answer` headings over their work areas.
- Keep the three playback statements close together and put the combined bold `6` on the source playback row.

## Higher comparison-table layout

- Put `Concepts` only above the concept-name column. The category-heading column has no visible header cell.
- Keep category headings such as `Styles` and `Melody/harmony` bold, but keep individual concepts such as `Classical` and `Sonata` regular weight.
- Make the complete cells in Columns A, B and C clickable. Use hidden native checkboxes for accessibility and show the shared tick across the cell when selected.
- Columns A and B are unmarked rough work. Column C remains the only marked column and must visually retain its stronger outline.
- Put the `5 marks` footer cell directly beneath Column C with no visible empty footer cells to its left.
- Allow `Check Answers` even when Column C is blank. Do not use a one-selection completion threshold to unlock checking; checking availability and question-completion status are separate behaviours.
- Remove repeated digital prompts above the table when the source instruction is already present. Put the bold `5` beside the source row `Remember to tick five boxes only in Column C.`

## Higher lyrics-placement layout

- Transcribe every printed lyric line verbatim from the official paper before building the table. Do not leave numbered placeholder text in a completed import.
- Centre the lyrics table on the paper. Use one uniform, light grid line for every outer and internal boundary; do not give the table a heavier outer outline.
- Keep each lyric row as a real table row and place the line number and text input inside the answer cell. Do not turn the table cell itself into a grid or flex container because that produces inconsistent collapsed borders.
- Put the feature list immediately after `You only need to insert the underlined word.` without an accumulated paragraph-sized gap.
- Put the playback paragraph and its three compact cue lines directly beneath the feature list.
- Do not repeat the complete insertion instruction as an extra subquestion heading. Show the lower two-line instruction once, and place the bold `5` beside the `Insert each word once only.` row.
- Preserve the paper's underlining in the feature list. The pupil may enter only the underlined word or the full printed phrase.

## Shared feedback and answer behaviour

- After checking, keep the pupil's correct text or notation green and an incorrect response red. Where notation is wrong or missing, retain the pupil's red answer and add the correct score answer in green, matching completed National 5 papers.
- Colour individual pupil answers, not the ruled line, table cell or lyric-table border. Question 8 uses ticks only. Question 9 uses coloured words only. A focused ruled input makes only its own underline heavier.
- When several concepts are entered on one ruled line, replace the marked line visually with position-matched text spans: every accepted concept is green and each unaccepted concept is red. Keep punctuation and connecting words neutral, preserve the original input for accessibility, and do not colour the ruled line itself.
- Use `Correct answer:` for one answer and `Correct answers:` whenever the feedback contains more than one answer.
- Permit checking a blank question and show `Not answered` feedback. Do not use answer completion to enable or disable the check button.
- Ordinary typed answers and choices keep the shared double-click, double-tap, right-click and keyboard removal behaviour. Higher score answers additionally use the right-aligned `Clear` controls described below.
- The shared cautious spelling system lives in `interactive-exams/exam-marking.js`. It combines teacher-approved alternatives with a one-character typo or adjacent-letter transposition allowance for longer specialist words. Keep short or easily confused answers, numbers, time signatures and accidentals strict. Use `allowCommonSpellings: false` or `allowFuzzy: false` when an official distinction would otherwise be lost.
- Some teacher-approved alternatives are also genuine words or neighbouring musical concepts, including `lead` for Lied, `real` for reel, `harmonic` for harmonics, `tremolo` for tremolando, `choral` for chorale and the noun/verb pair practice/practise. Before importing each answer key, check whether any shared alternative would erase a distinction that the question is assessing; opt that question out with `allowCommonSpellings: false` where necessary.
- In positive-marked structured answers, a rejected shorthand must not cancel a separate exact valid concept. For example, `Drum kit` still earns its mark if the pupil also writes `Drums`. A blocked phrase may suppress only the valid-looking term contained inside that same phrase, such as `forte` inside the rejected response `mezzo forte` where required by a paper's marking guidance.
- Do not show the sentence `Incorrect or additional responses are not penalised.` in Question 6 feedback. The marking behaviour remains positive, but that explanatory sentence was deliberately removed from the pupil-facing guidance.

## Literacy score

- The official paper orders Question 4 as prompts, chord reference, replay text, then score. The interactive paper uses `scorePosition: "before"`, so the score appears before the prompt/control rows. The teacher explicitly confirmed on 1 August 2026 that the Question 4 score must remain in its current position. Do not reorder this completed paper.
- Build Higher literacy scores with the same structured National 5 notation engine. Reuse the shared Bravura symbols, staff renderer, pitch-to-staff mapping, rhythm definitions, noteheads, stems, beaming, ties, ledger lines, time signatures, hover previews and answer-removal behaviour. Do not add a separate hand-drawn Higher approximation.
- Encode every bar as data containing pitches, rhythms, rests, accidentals, ties, beam groups and lyrics before drawing the score. Keep the score data separate from the renderer and expose a read-only inventory for regression tests.
- Keep all music content and answer targets in the shared score renderer. Include the treble and bass staves, printed time signatures, numbered bars, source boxes, missing-note areas, accidental target, bar-line targets and chord boxes.
- Direct note entry must remain physical score interaction. Clear buttons reset only their own notation answer.
- Bar-line entry has no separate selection button. Hovering or focusing within each valid area of the printed line 5 box previews a faint snapped bar line; clicking or tapping places it, and Clear removes the entered bar lines. All three official positions are required.
- Higher notation feedback follows the completed National 5 pattern: each pupil-entered score item remains visible and is coloured red when wrong, while the correct note, accidental, bar line, interval or chord is added directly to the score in green. Apply this shared behaviour to later Higher papers.
- Verify the full score against an explicit bar-by-bar inventory before considering future Higher literacy questions complete. Tests must assert the number of bars, every pitch and rhythm in order, the duration of every bar, the contents of unnumbered exercise lines and the official answer targets.
- Higher 2015 Question 4 has 16 numbered bars of four crotchet beats each. Its bar-line exercise contains four complete bars and its chord exercise contains three. The source-audited interactive answers are `E3, G3, C4` for part (a), a fourth for part (b), a flat for part (c), `E5, A4, A4` for part (d), the three printed line-5 boundaries for part (e), and `G/V` followed by `Am/VI` for part (f).
- On 1 August 2026, the user supplied and confirmed corrected pitches for printed score lines 2-6. Treat A-flat in bar 11 as the sounding pitch while leaving its flat absent for the pupil to place. The user also confirmed that bar 8's final two notes, bar 9's first tied note and bar 16's second note are all C5, not C4. The exact corrected inventory is protected in `tests/higher-2015.test.js`.
- The user supplied a close crop and then the complete rhythm/tie inventory from line 5's second bar onward. Indices 4-7 form the four-quaver group beginning with `was`; indices 12-13 and 16-17 form the later two-quaver groups. The tied C5 pair begins at index 7, the quaver-to-crotchet E5 tie begins at index 10, and the final E5 quaver pair begins at index 13. The second E5 of that final tied pair is standalone with its own tail.
- Keep a slur over the beamed D5-C5 pair at `souls` (line 5 indices 16-17). This is a slur, not a tie.
- The confirmed line 5 rhythm places the missing bar lines after item indices 3, 10 and 15: after `it`, between `im-` and `pri-`, and between `our` and `souls`. Earlier answer IDs pointing after indices 5 and 11 were stale and must not be restored.
- In part (c), both the dotted minim and the final quaver in bar 11 accept accidental placement. Their invisible targets surround the complete note shapes, including the quaver stem and tail, so either note is equally easy to select.
- A tie crossing a system break must be engraved as two shared tie segments: one to the end of the first system and one from the start of the next. Never draw one diagonal curve across systems.

### Question 4 interaction and layout refinements

- Part (a) starts blank. Place notes directly on the bass staff using the shared hover preview, dragging and removal behaviour. Limit placement to natural staff positions E2-C4. Align the three answer slots beneath the corresponding source notes. Double-click, double-tap, right-click or the keyboard removal shortcut removes an entered note.
- Part (b) is typed on the line inside the bar-6 interval box. Its prompt ends `Write your answer in the box.` The box's right edge was extended by 10 px so it closely encloses both relevant notes.
- Part (c) is a one-use armed accidental tool. Selecting a Bravura accidental is not itself an answer: the pupil must place it before one of the two accepted notes. The box was extended 15 px to the left, and both hit areas include the complete note, stem and quaver tail.
- Part (d) uses the printed rhythm above the stave and direct pitch placement below. The box was extended 5 px left and 5 px down. The guide rhythm was moved 20 px left and 10 px lower to align with the answer positions.
- Part (e) has no separate bar-line button. Every gap between adjacent score items is a valid placement target; hover or keyboard focus previews a faint snapped bar line. A single printed bar line closes line 5. All three pupil bar lines must be correct for the mark.
- Part (f) uses two separate score inputs with the same character restrictions and capitalisation as `chords.html`: unsupported characters are removed, Roman numerals are uppercase and minor `m` stays lowercase. The outer Chords box extends 10 px beyond the end of the music and its complete box and label were moved 20 px upward. The individual answer boxes begin 10 px to the right of their bar starts; their final width is 10% larger than the narrowed calibration and their final height is 15% taller. The final constants are `chordAnswerBoxWidth = 37.2 * 1.1`, `chordAnswerBoxTop = finalTop - 59` and `chordAnswerBoxHeight = 34 * 1.15`.
- Keep every notation-specific Clear control beside the final source row for its part. Clearing one part must remove only that part's input. Parts (b) and (f), whose inputs are inside the score, receive the same clear behaviour automatically.
- Keep answer boxes close to the notes they assess and do not use heavy printed-score focus outlines. Keyboard focus must remain visible with the shared subtle focus treatment.
- Preserve the score's printed boundary lines: the opening treble and bass staves are joined by one continuous initial bar line, line 5 ends with one single bar line, and the final chord line retains its internal and final single bar lines.

### Confirmed numbered-bar inventory

- **Bar 1:** E4 minim; G4 minim.
- **Bar 2:** C5 dotted minim; quaver rest; C5 quaver.
- **Bar 3:** E5 crotchet; F5 quaver and E5 quaver beamed; E5 quaver tied from the previous E5; D5 dotted crotchet.
- **Bar 4:** C5 dotted minim; quaver rest; G4 quaver.
- **Bar 5:** A-flat4 crotchet; G4 quaver and D5 quaver beamed; D5 quaver tied from the previous D5; D5 dotted crotchet.
- **Bar 6:** C5 crotchet; G4 minim; quaver rest; F-sharp4 quaver.
- **Bar 7:** F-sharp4 dotted crotchet; D5 quaver tied to D5 dotted crotchet; E4 quaver.
- **Bar 8:** F4 minim; D5 crotchet; two beamed C5 quavers, with the final C5 tied across the system break.
- **Bar 9:** C5 dotted minim tied from bar 8; crotchet rest.
- **Bar 10:** A4 minim; C5 minim.
- **Bar 11:** A-flat4 dotted minim with its flat omitted for part (c); quaver rest; A-flat4 quaver.
- **Bar 12:** C5 minim; B4 dotted crotchet; G4 quaver.
- **Bar 13:** E5 dotted crotchet; G4 quaver; G4 dotted crotchet; G4 quaver.
- **Bar 14:** missing E5 dotted crotchet; missing A4 quaver; missing A4 minim.
- **Bar 15:** E5 crotchet; two beamed B4 quavers, with the second tied to a standalone B4 quaver; D5 dotted crotchet.
- **Bar 16:** D5 quaver, C5 semiquaver and B4 semiquaver beamed; C5 crotchet; quaver rest; C5 quaver; D5 and E5 quavers beamed.

### Confirmed exercise-line inventory

- **Line 5:** F5 dotted crotchet; A4 quaver; A4 dotted crotchet; A4 quaver; B4 quaver; B4 quaver; B4 quaver; C5 quaver tied to C5 quaver; D5 crotchet; E5 quaver tied to E5 crotchet; F5 quaver; E5 quaver tied to a standalone E5 quaver; D5 dotted crotchet; D5 quaver; C5 quaver; crotchet rest; D5 crotchet; E5 crotchet.
- Line 5 beam groups are indices 4-7, 12-13 and 16-17. Tie starts are indices 7, 10 and 13; destinations are 8, 11 and 14. Keep the slur over the D5-C5 pair at `souls` (indices 16-17).
- **Final chord line:** F5 dotted crotchet; A4 quaver; A4 dotted crotchet; A4 quaver; F5 crotchet; B4 quaver; B4 quaver tied to a standalone B4 quaver; C5 crotchet; C5 quaver tied to C5 minim; minim rest. Beam only indices 5-6.
- The `world___` lyric in bar 16 is shifted 10 px to the right. Store this in the structured `lyricOffsets` inventory and protect it with a regression test.

## Audio calibration

- Transcribe every official track with the local Whisper model using `interactive-exams/scripts/transcribe-with-local-whisper.py`.
- If `ffmpeg` is not on the normal command path, pass its known local path with `--ffmpeg`. Do not fall back to estimating cues by duration.
- Set markers at the spoken cue boundary and keep them chronological and inside the measured track duration.
- Higher 2015 contains 31 calibrated markers across nine tracks. Regression tests lock the marker values, count, chronology and duration bounds.
- The locked marker times are: Q1 `41.30, 111.12`; Q2 `69.96, 150.00, 229.94`; Q3 `7.34, 71.56, 112.22`; Q4 `7.70, 227.24, 321.32, 416.28`; Q5 `6.42, 125.66, 202.24`; Q6 `44.64, 117.60, 183.36`; Q7 `45.38, 150.32, 255.74`; Q8 `116.10, 173.08, 236.08, 292.62, 349.18, 402.48, 455.04`; Q9 `105.52, 176.04, 246.48` seconds.
- Marker buttons must stop their click from falling through to the range slider. After seeking, verify the actual audio time, not only the marker's visual position. The current fallback creates a fully loaded object URL when direct server seeking fails, but its behaviour still needs a real browser regression test, especially when the paper is opened directly with `file://`.

## Shared layout decisions and unresolved policy conflict

- The product name is `Digital Question Papers` in the page title, header and homepage card.
- The current interactive-exam page uses `exam-canvas-fit.js` to scale the fixed 1280 px exam canvas down on narrow screens and hides horizontal page overflow so the desktop paper is not chopped off. This implements the teacher's no-side-scroll request for Digital Question Papers.
- `AGENTS.md` currently states the opposite general desktop-only rule: do not scale and allow normal horizontal scrolling. Do not copy or remove the exam-specific fitting behaviour until the teacher confirms which rule has priority.

## Audit decisions and fixes confirmed on 1 August 2026

- Keep the Question 4 score in its current position before the replay text and prompt/control rows.
- Restore `Write your answer in the box.` to Question 4(b).
- Apply cautious spelling tolerance to Question 7, including the confirmed `Haronimc minor scale` response.
- Render separate green and red phrases when correct and incorrect concepts share one answer line.
- Shift `world___` in bar 16 10 px to the right through structured notation data.
- Preserve an exact valid `Drum kit` response even when rejected `Drums` is also present, without weakening blocked-phrase safeguards in National 5 papers.
- Label Questions 1, 6, 7 and 8 `Answered` only after their required 3, 6, 4 and 5 responses; use `Partially answered` before then.

## Remaining audit decision

- **Question 6 marked text shows earned concepts in green but leaves uncredited text black.** This is visually calm and reflects positive marking, but it differs from the general red-for-incorrect feedback rule. Confirm whether uncredited Question 6 text should remain neutral or turn red.

## Regression checks

- Test all official answers and every additional-guidance alternative.
- Test explicit rejected partial answers.
- Test the additional-answer deduction for Questions 1, 7, 8 and 9. Test separately that Question 6 never deducts for incorrect or additional responses.
- Test concept-line answers on one line, on separate lines and in a different order.
- Test that Question 8 ignores Columns A and B.
- Test that `Check Answers` remains enabled when Question 8 is blank, while the question remains `Not attempted`; one to four Column C choices must be `Partially answered`, and five or more choices must be `Answered`.
- Test that Question 9 accepts full phrases, either-line placements and the official both-line alternative.
- Test that Question 9 contains every printed lyric line and no placeholder lyric rows.
- Test that a complete official response scores exactly 40/40.
- For every Higher literacy score, test the complete structured bar inventory and confirm that each bar has the correct metrical duration. This is required in addition to testing the marked answers.
- Add a browser-level audio marker test that proves a late marker changes the actual playback time instead of restarting the track.
- Run the complete project test suite and the fixed desktop-layout audit after shared UI, marking, notation or layout changes.
