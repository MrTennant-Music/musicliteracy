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

