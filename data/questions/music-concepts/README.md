# Music Concept question banks

## How the Millionaire question system works

`Music_Concept_Knowledge_Bank_Ultimate_Codex_Edition.json` is the permanent,
authoritative source. It is read but never changed by the question generator.

The knowledge bank contains 300 assessed concepts. The development-time
generator creates three permanent Question Editor slots for every concept:
one Easy, one Medium and one Hard. This gives exactly 900 slots—300 at each
difficulty—recorded in `editor-slots.json`.

Easy slots ask `What concept is described?` and show the definition in the
upper box. Medium slots ask which option is **not** a feature of the named
concept. Hard slots begin blank so a teacher can write each one manually. The
concept shown as the slot title is the topic being assessed; it does not have
to be the final answer to a teacher-written Hard question.

Only complete slots are copied into the five qualification-level JSON banks
and `millionaire-music-concept-bank.js`. These are the canonical, auditable
playable records: they retain the concept, fact, sense, reviewed hint and Music
Literacy link metadata. An incomplete slot remains safely available in the
editor but cannot appear in a game.

The five files in `scripts/music-concepts/strong-hints/` contain one manually
reviewed, answer-specific Hint lifeline clue for every generated concept or
meaning. These short clues may use wordplay, a familiar phrase or a distinctive
musical feature. Production validation rejects missing hints, generic solving
instructions and wording that contains the answer or one of its approved names.

The Hub is a static website with synchronous script loading, so the generator
also creates `millionaire-music-concept-bank.js` as a smaller browser adapter.
`millionaire-question-bank.js` places those records into the existing level,
difficulty and category pools. Until teacher-written Hard Music Concept slots
are ready, the final five Music Concept stages use complete Medium questions.
When both Music Literacy and Music Concepts are selected, each five-question
block uses a balanced mixture.

All current Music Concept questions are text-only. They do not request audio,
notation or any runtime AI service.

## Editing questions manually

Double-click `Edit Millionaire Questions.command` in the main project folder.
The local Question Editor always shows all 900 slots. They can be filtered by
qualification, difficulty, exact concept, Edited/Unedited status or search
text. Each slot's difficulty is fixed so every concept always retains one Easy,
one Medium and one Hard position.

Edit the description, question, four answers, correct answer, hint and
explanation in one place. Pressing `Save Question` writes the change to
`manual-question-overrides.json`, regenerates the runtime bank and validates it
before reporting success. If validation fails, the editor restores the previous
working bank automatically.

`Clear Question` empties the editable fields but does not delete the permanent
slot. Nothing changes until `Save Question` is pressed. A cleared or partly
completed slot is saved as incomplete and excluded from Millionaire; completing
all required fields and saving it adds it back to the playable pool.

Description-question feedback is filled automatically from the displayed
description. Whenever a multiple-choice answer set contains a musical style,
all four choices must be styles from the same qualification. Whenever it
contains an orchestral-family name, the choices must be Brass, Percussion,
Strings and Woodwind. Feature-based Medium questions are unaffected because
their choices are descriptions rather than concept names.

Keep permanent teacher edits in `manual-question-overrides.json`. The generated
`editor-slots.json`, qualification-level banks and
`millionaire-music-concept-bank.js` must not be edited directly.

## Regenerating and checking the banks

From the repository root, run:

```text
pnpm run generate:music-concepts
pnpm run validate:music-concepts
pnpm run smoke:music-concepts
```

`pnpm run build` performs all three steps, checks the JavaScript syntax and
runs one complete 15-question smoke game at every qualification level.

Generation and validation always cover all five levels together. A per-level
run is deliberately rejected so it cannot leave the shared runtime adapter or
manifest incomplete.

## Audit files

- `manifest.json` records every level file, question count and file hash.
- `editor-slots.json` records all 900 permanent slots and whether each is ready
  or still a draft.
- `summary.json` contains the full machine-readable coverage and review data.
- `review-report.md` is the concise human-readable review.
- `music-literacy-links.json` records confirmed local links and candidates that
  still need teacher review; it never invents a local ID.
- `question-bank.schema.json` documents the canonical JSON format.

Question IDs are deterministic. Regenerating from the same approved knowledge
bank produces the same IDs and question content.
