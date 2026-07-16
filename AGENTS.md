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
