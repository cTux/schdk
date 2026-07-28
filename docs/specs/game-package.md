# Game package

Status: implemented

## Goal

Provide one portable `.schdk` file containing a complete or in-progress
three-round game, including presentation media.

## Requirements

- **PKG-1:** A package has a title, exactly 36 ordered question slots, and two
  optional music-break slots.
- **PKG-2:** A question is `standard`, `blitz-2x30`, or `blitz-3x20` and has
  exactly the number of text parts required by its type.
- **PKG-3:** A question supports one main answer, alternative answers, wrong
  answers, an optional answer comment, an optional unresolved remark, and
  private host notes limited to question-delivery instructions.
- **PKG-4:** A question supports either a text handout or an embedded base64
  image handout that never loads an external image URL.
- **PKG-5:** Current files are ZIP archives with `game.json` and optional
  `audio/break-1` and `audio/break-2` entries.
- **PKG-6:** Structurally valid unfinished packages remain editable and
  saveable.
- **PKG-7:** Readiness validation reports missing required content and
  unresolved remarks separately from structural parsing.
- **PKG-8:** Legacy plain-JSON, version 1, and version 2 packages open and are
  normalized to the current format on the next save.
- **PKG-9:** The default filename is the filesystem-safe package title followed
  by `.schdk`, truncated when needed to remain a valid Drive package name.
- **PKG-10:** Package parsing enforces the canonical archive and entry size
  limits before extracting ZIP content.
- **PKG-11:** Readiness validation rejects a main or alternative answer reused
  by another question after Unicode, case, and whitespace normalization.

## Invariants

- Imported content is parsed before use; the extension alone is not trusted.
- Clipboard question JSON is parsed before it can replace a question.
- Array order determines question numbers and music-break positions.
- Audio bytes are ZIP entries, never JSON data URLs.
- Image handouts are embedded data URLs matching their declared image MIME
  type.
- ZIP extraction is limited to the three recognized entries and rejects
  oversized or duplicate recognized entries.

## Acceptance

1. A new empty package can be serialized, reopened, edited, and saved while
   incomplete.
2. A ready package round-trips without losing question fields, handouts, or
   music.
3. Each supported legacy format opens and saves as the current ZIP format.
4. Malformed files and malformed clipboard questions are rejected without
   replacing current editor state.
5. A matching embedded image handout opens, while an external or MIME-mismatched
   image URL is rejected before rendering.
6. An oversized compressed entry is rejected before decompression.
7. A package remains unfinished when two questions share a normalized main or
   alternative answer.

Canonical format: [`../GAME_PACKAGE.md`](../GAME_PACKAGE.md).
