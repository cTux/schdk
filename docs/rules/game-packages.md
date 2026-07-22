# Game packages

The format contract is documented in
[`docs/GAME_PACKAGE.md`](../GAME_PACKAGE.md). The executable source of truth is
`packages/common/src/index.ts`.

## Format

- A `.schdk` file is a ZIP archive containing one UTF-8 `game.json` entry.
- Serialize with maximum ZIP compression. Continue accepting legacy plain-JSON
  `.schdk` content and rewrite it as ZIP on the next save.
- The root marker is `format: "schdk-game-package"` with `version: 1`.
- A package contains exactly 36 ordered questions: three rounds of 12. Use
  `QUESTION_COUNT` and `QUESTIONS_PER_ROUND` instead of repeating those values.
- New packages start with the title `Без назви` and 36 independent empty
  question objects.
- Required question fields are `question`, `answer`, and
  `alternativeAnswers`. Optional fields are `handout`, `comment`, and
  `hostNotes`.
- A handout remains embedded as a data URL with its name and MIME type.

## Parsing, validation, and serialization

- Parse all imported, restored, and recent package content through
  `parseGamePackage`; never trust JSON or archive data based only on its
  extension.
- Structural parsing and readiness validation are separate. Structurally valid
  unfinished packages remain editable and saveable.
- A ready package has a non-empty title, question text and answer for every
  question, and no unresolved non-empty comments. Alternative answers,
  handouts, and host notes do not determine readiness.
- Trim titles, questions, answers, comments, host notes, and alternative
  answers during serialization. Remove blank alternatives and blank optional
  strings from serialized output.
- Keep array order as the question-number source of truth.
- A schema, marker, version, validation, or compatibility change must update
  `@schdk/common`, its round-trip and malformed-input tests, this rule file,
  and `docs/GAME_PACKAGE.md` together.
