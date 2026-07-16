# The Music Literacy Hub project instructions

## Interactive exam notation questions

When creating or changing a notation-based question in Interactive Exam Papers:

1. Treat `practicequestions.html` as the source of truth for appearance and interaction. Find the closest existing question at the same qualification level before implementing anything new.
2. Reuse the established notation code, `shared-notation-config.js`, Bravura glyphs, staff spacing, note positioning, beaming, stem rules, buttons, hover behaviour, dragging, clear/reset behaviour and responsive layout. Do not create a separate approximation when an equivalent component already exists.
3. Compare the original Qualifications Scotland paper, the matching Practice Questions implementation and the shared notation configuration before writing code.
4. Describe the musical content as structured data: pitches, rhythms, bars, key and time signatures, barlines, repeat signs, editable elements and correct answers. Keep this content separate from the renderer.
5. Reuse complete interactions, not only their visual styling. If Practice Questions already supports placing notes, dynamics, time signatures, repeat signs or other symbols, adapt that behaviour directly.
6. Verify every bar against an explicit bar-by-bar inventory of pitches and rhythms before considering the question complete.
7. Check Bravura glyphs, staff and system spacing, note sizes, alignment, beaming, stems, barlines, editable-area boxes, hover previews, dragging, clear controls and desktop/mobile presentation.
8. Do not guess when the source paper is visually or musically ambiguous. Ask one precise musical question and wait for confirmation before encoding the uncertain detail.
9. Make the smallest maintainable change and preserve existing Practice Questions and shared notation behaviour.

## Reusable Digital Past Paper notation decisions

Apply these established decisions when the same interaction appears in later papers:

1. Keep shared score panels visually clean. Do not add a separate “Music guide” heading, explanatory strip or labels inside an editable notation box unless the source paper or the user specifically requires them.
2. For direct missing-note entry, show a right-aligned Clear control only. Do not add Undo, entry-count text or separate instructions telling the pupil to select notes on the score unless requested.
3. Hovered notes must preview in grey. Any ledger lines belonging to the preview must use the same opacity as the previewed note, including the stronger opacity used while dragging.
4. Repeat-sign placement must use the shared Bravura glyph and a faint glyph preview, never a shaded rectangular hover target. The preview and placed answer must use the same positioning helper so they remain aligned.
5. Treat repeat-sign placement as a one-use armed tool: clicking the answer button arms it; placing the sign disarms and visually deselects it; clicking the button again allows the pupil to move the answer elsewhere.
6. When the repeat tool is inactive, its invisible score targets must not receive pointer focus or show a coloured focus box. Preserve visible focus and keyboard placement when the tool is armed for accessibility.
7. Reuse the established dynamic and repeat-sign answer-button classes so Bravura glyphs retain their optical vertical centring. Do not position these glyphs using ordinary text baselines.
8. Keep Clear controls right-aligned and preserve the existing responsive button and score layout.

## Reusable Digital Past Paper design and interaction decisions

Use the completed National 5 Music 2014 paper in `interactive-exams/` as the reference implementation for later Digital Past Papers. Apply the following decisions by default unless the source paper or the user explicitly requires something different.

### Source fidelity and typography

1. Recreate the usable question area of the original Qualifications Scotland paper; do not embed the PDF and do not reproduce print-only material such as candidate boxes, barcodes, official-use columns, page-turn instructions or blank pages.
2. Follow the source paper wording verbatim, including its original use of “tick”, “write”, “insert”, “name”, punctuation, capitalisation, line breaks, bold text, question numbering, lettered parts and Roman-numeral subparts. Only change wording when a digital interaction makes the printed instruction impossible or misleading.
3. Omit repeated “Question … (continued)” headings when the content is presented continuously on one digital page.
4. Load the supplied Trebuchet MS files locally with `@font-face`, and use Trebuchet only for text that belongs to the original paper or for answers entered by the pupil. Keep site navigation, audio controls, toolbar buttons, mode controls, Clear controls and other added interface text in the normal Music Literacy Hub interface font.
5. Match the source paper’s emphasis rather than making all question text bold. Main “Question …” headings and mark numerals are bold; part labels such as “(a)” remain regular unless the source shows otherwise.

### Paper layout and marks

6. Present each question on a white, A4-proportioned paper panel with a sensible A4 minimum height, restrained border, subtle paper shadow and the source paper’s thick right-angle corner decorations. Keep the surrounding page white and do not add a coloured or grey backdrop container around the paper.
7. Keep the paper visually square and document-like. Rounded Music Literacy Hub styling remains appropriate for interface controls and menus, but not for the paper itself.
8. Put the paper toolbar inside the top of the paper, recessed between the upper corner decorations. Keep its controls close together without pushing the authentic question content down. Put the bottom navigation controls inside the paper as well.
9. Show `MARKS` in capitals at the top-right of every paper page. Show only the bold mark numeral beside the relevant source-paper row; do not append the word “mark” or “marks”. Do not invent a “Total marks” heading. Where the source gives one combined mark for a whole question, place that numeral on the same row as the source does rather than adding marks beside every answer.
10. Keep question letters, question text and mark numerals on the same row where the source does. Preserve the source indentation from part (a) onwards, its deliberate line wrapping and the alignment of answer spaces.
11. Do not add decorative divider lines between subquestions or thick rules below question headings unless they are genuinely part of the source layout.
12. Recreate distinctive source layouts directly, including guide shapes and arrows, chord-sequence grids, category tables, sentence-completion lines, rough-work tables and final-answer pages. Extend the digital paper vertically when required instead of compressing the source structure.

### Answer controls and pupil input

13. Render choice answers as large empty square boxes aligned with their labels, matching the paper rather than using radio circles or quiz tiles. A selected box displays a Trebuchet-style tick. Retain correct radio or checkbox semantics invisibly for accessibility.
14. Limit each choice row’s clickable area to the square and its text; empty space to the right must not select an answer accidentally.
15. Use simple underline fields for short answers, inline answer lines for sentence completions and paper-like ruled or bordered areas for longer answers. Keep short-answer lines to the established Question 1 width unless the source clearly requires another length.
16. Display pupil-entered text in bold Trebuchet so it is distinct from printed paper text. Automatically capitalise the first character of standalone answers, but not answers embedded inside a sentence-completion line.
17. Give entered text and selected ticks a slow, subtle glimmer to distinguish pupil input. Keep the animation infrequent and respect reduced-motion preferences; do not add visible side borders or other artefacts to underlined fields.
18. Do not add Clear or Undo buttons to ordinary paper questions. Allow an entered choice, typed answer or score item to be removed with double-click, double-tap or right-click while retaining keyboard-accessible removal. Notation-specific Clear controls remain governed by the notation decisions above.
19. Before submission, keep answers visually neutral and do not expose correctness. Show marking feedback only after submission without substantially changing the paper layout.

### Audio, navigation and menus

20. Keep the active question’s audio player in the main site header beside the marks card. Match the marks card’s background, border and corner radius. In “Show All”/“All Questions”, place each question’s audio with that question and leave no line, placeholder or other artefact in the header.
21. The audio play button reads `Play` in Practice Mode. In Exam Mode, show the current question number without a play or document glyph and do not offer pause or replay controls.
22. Keep the Level and Year controls at the left of the in-paper toolbar. Centre the current-question control between fixed-width previous and next arrow buttons, and show the current mode at the right. The question button contains centred text only, with no glyph.
23. Use the same toolbar height, border, radius, font and menu appearance as equivalent controls elsewhere in the Hub. Use the established Practice Questions question-arrow width. Arrow buttons have no heavy black outline; unavailable arrows remain visible but are greyed out.
24. Keep bottom previous/next arrow buttons as a second navigation route. They use the same width and centred arrows as the toolbar buttons. On the final question, `Submit` replaces the next arrow in both places and remains immediately beside the question control.
25. The question menu labels untouched questions `Not attempted`, partly completed questions `Partially answered` and completed questions `Answered`. Keep the menu aligned and centred in both single-question and Show All views.
26. The QR button remains beside the Digital Past Papers title. Its modal heading uses `Level • Year`, its instruction reads `Scan to open this Digital Past Paper` without a full stop, and its link must encode the selected level and year.

### Practice Mode and Exam Mode

27. Always offer two title-cased modes: `Practice Mode` with `practicemode.svg`, and `Exam Mode` with `worksheet.svg`. The toolbar button displays the currently selected mode. Present both as full menu buttons styled like the Level menu, not as a native select dropdown, and retain a Reset control.
28. Practice Mode has no timer, unlimited audio replay and free movement between questions or into Show All. Do not interrupt normal next/previous navigation merely because a question is incomplete.
29. Before Exam Mode starts, show a clear warning overlay explaining the timer, continuous audio, ordered unlocking, one-sitting requirement and reset-on-leave behaviour. Start only after explicit confirmation.
30. Exam Mode uses a 45-minute timer and the All Questions view. The timer and continuous Question 1-to-Question 8 audio begin together when the attempt starts. Audio cannot be paused or replayed; future questions unlock as their audio begins.
31. An Exam Mode attempt must be completed in one sitting. Refreshing or leaving resets the attempt. The pupil may switch from Exam Mode to Practice Mode and retain progress, but switching from Practice Mode to Exam Mode starts a fresh exam attempt.
32. Allow moving forward or submitting even when answers are missing. Only show the unanswered-questions warning when the pupil attempts to submit, and clearly offer a way to keep working or submit anyway.
33. In Exam Mode, show Submit only once Question 8 is available. Place it where the next arrow normally appears in both the toolbar and bottom navigation.

### Implementation and verification

34. Extend the existing shared HTML, CSS and JavaScript rather than building a separate paper renderer. Store paper wording, marks, audio timing and answer data separately from reusable rendering and interaction behaviour.
35. Preserve keyboard labels, visible focus, radio/checkbox semantics, reduced-motion support and screen-reader names even when the visual controls imitate printed boxes.
36. When adding a new paper, compare every question against its source PDF and the 2014 reference implementation. Verify wording, bold text, indentation, line breaks, marks, control limits, audio markers, answer persistence, submission, both modes and Show All alignment before considering it complete.
