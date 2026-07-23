# Millionaire custom question sets — manual test guide

Use a current version of Chrome, Edge, Firefox or Safari. Open `millionaire.html` from the normal Music Literacy Hub site or a local web server.

## Quick end-to-end check

1. Open **Customise**, then select **Create Questions**.
2. Confirm **← Back to Main Menu** is visible.
3. Select **Create New Set**, enter a name and select **Create Set**.
4. Confirm the editor uses the normal Millionaire question screen and its controls appear in the main toolbar.
5. Enter question text and four answers directly in the game layout, select one correct answer and add an optional hint.
6. Wait for **Saved.**, open Question 2, then reload the page and return to the set from the library.
7. Confirm the Question 1 content is still present.
8. Complete all 15 questions. Confirm the library changes from **Draft — not playable** to **Ready to play**.
9. Select **Play** and confirm the set opens in the normal Millionaire game with the usual timer, lifelines, animations and prize ladder.
10. Use **Hint** and confirm the saved hint appears.

## Media check

1. Confirm the large media panel offers Image, Audio and YouTube.
2. Drag an image or audio file onto the panel and confirm it is accepted.
3. Drag a YouTube link onto the panel, then repeat by focusing the panel and pasting a YouTube link.
4. Select YouTube and confirm the YouTube URL field opens.
5. Open **Media** and confirm only one option can be active: no media, image, audio or YouTube video.
6. Upload a PNG or JPEG smaller than 5 MB and enter useful alternative text.
7. Confirm its preview works, then change the same question to audio and confirm the image is removed.
8. Upload an MP3, WAV, M4A/AAC or OGG file smaller than 15 MB and confirm it does not autoplay.
9. Change the question to YouTube video, paste a valid YouTube link and confirm the inline preview appears.
10. Select **Replace** for an uploaded file and confirm the new file appears.
11. Select **Remove** and confirm the preview disappears.
12. Save, reload and confirm the selected media is still present.
13. Play the set and confirm the selected image, manual audio control or inline video appears in the normal question screen.

## Library actions

1. Rename a set and confirm surrounding spaces are removed.
2. Select **Duplicate** and confirm a separate set named `Original Name – Copy` appears.
3. Download both a complete set and an incomplete draft.
4. Delete a set and confirm the prompt includes its name and the warning that deletion cannot be undone.
5. Toggle **Include in random selection** off for one complete set.
6. Select **Play Random Set** and confirm only complete, included sets are chosen.

## Export and import

1. Download a set containing image, audio and YouTube questions.
2. Delete the local copy.
3. Select **Import Set** and choose the `.millionaire-set` file.
4. Confirm the preview lists its name, 15 questions, image count, audio count and readiness.
5. Import it, then edit and play it to confirm all text, answers, correct answers, hints and media survived.
6. Import the same file again and separately check **Replace Existing Set**, **Import as a Copy** and **Cancel**.
7. Try a renamed text file or damaged ZIP and confirm no partial set is added.

## Accessibility and responsive checks

1. Complete the main flows using Tab, Shift+Tab, Enter, Space and the arrow keys where appropriate.
2. Confirm dialogs keep keyboard focus inside them and Escape closes non-destructive dialogs.
3. Confirm the Question menu and previous/next controls can be used with the keyboard.
4. At a 390-pixel viewport, confirm the game-style editor stacks cleanly without page-level horizontal overflow.
5. Confirm buttons and form fields have visible keyboard focus and comfortable touch targets.

## Browser checks completed during implementation

The following were checked in a real browser on 23 July 2026:

- Creator entry, library and 15-slot game-style editor.
- IndexedDB autosave and persistence after reload.
- Disabled Play for a draft.
- Import preview and successful import with image and audio.
- Creator-to-normal-game handoff, image display, audio control and Hint lifeline.
- Random play excluding an incomplete draft.
- Duplicate-ID choices and **Import as a Copy**.
- Media removal, replacement upload and persistence.
- Rename trimming and named delete confirmation.
- Download preparation.
- Mobile layout at 390 pixels with no document-level overflow.
- No browser console errors during the tested flows.
