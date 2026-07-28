# Game package format

A «Що? Де? Коли?» package is stored as a ZIP archive with the `.schdk`
extension. The archive contains a UTF-8 JSON file named `game.json` and may
contain two audio files named `audio/break-1` and `audio/break-2`.

Readers and writers reject archives larger than 160 MiB, `game.json` entries
larger than 16 MiB, music-break entries larger than 64 MiB, and duplicate
recognized entries. Unrecognized ZIP entries are ignored without extraction.

- A package has a title and exactly 36 questions: three rounds of 12.
- Every question has a `type`, one or more required `questionParts`, and one
  required answer. Supported types are:
  - `standard`: one part with a 60-second timer;
  - `blitz-2x30`: two parts with a fresh 30-second timer for each;
  - `blitz-3x20`: three parts with a fresh 20-second timer for each.
- An answer comment is an optional string and does not affect question
  readiness.
- Alternative answers are an optional list of strings.
- A ready package cannot reuse a main or alternative answer in another
  question. Readiness comparison normalizes Unicode, letter case, surrounding
  whitespace, and repeated whitespace.
- Wrong answers are an optional list of strings.
- A handout is optional. It can be text or an image embedded in the same file
  as a base64 `data:image/*` URL matching its declared MIME type. External
  image URLs are invalid. Image handouts without a `kind` field remain
  supported; current image handouts use `kind: "image"` and text handouts use
  `kind: "text"` with a `text` string.
- A comment is an optional string. A question remains unfinished while it has
  an unresolved comment.
- Host notes are optional delivery instructions visible to the host while
  reading the question, such as pronunciation, text to omit, audible
  punctuation, pauses, or cues. They are not answer-review notes and do not
  affect question readiness.
- A package may contain one music break after round 1 and one after round 2.
  Each break keeps its original filename and MIME type in `game.json`, while
  its bytes are stored directly in the matching `audio/break-*` ZIP entry.
  The editor accepts every audio format supported by the current built-in
  browser player.

The root object has a `format: "schdk-game-package"` marker, version `3`, a
`title`, a `questions` array, and a two-item `musicBreaks` array. Array order
determines question numbers and break positions. A break item is `null` or an
object containing `name`, `mimeType`, and its fixed ZIP `entry`. The shared
TypeScript types and rules live in `@schdk/common`.

The editor saves new and unfinished packages to the same `.schdk` file. The
title, questions, and answers may remain empty during editing. Structural
parsing accepts unfinished packages; `validateGamePackage` performs the
separate readiness check when a complete package is required.
The filename follows the filesystem-safe package title plus `.schdk`.

Legacy `.schdk` files containing plain JSON are still supported. The editor
rewrites them in ZIP format on the next save.

Version `1` packages with a single `question` string and version `2` packages
without music remain readable. They are normalized to version `3` and rewritten
on the next save.
