# Game package format

A «Що? Де? Коли?» package is stored as a ZIP archive with the `.schdk`
extension. The archive contains a UTF-8 JSON file named `game.json`.

- A package has a title and exactly 36 questions: three rounds of 12.
- Every question has a `type`, one or more required `questionParts`, and one
  required answer. Supported types are:
  - `standard`: one part with a 60-second timer;
  - `blitz-2x30`: two parts with a fresh 30-second timer for each;
  - `blitz-3x20`: three parts with a fresh 20-second timer for each.
- An answer comment is an optional string and does not affect question
  readiness.
- Alternative answers are an optional list of strings.
- Wrong answers are an optional list of strings.
- A handout is optional. It can be text or an image embedded in the same file
  as a data URL. Image handouts without a `kind` field remain supported;
  current image handouts use `kind: "image"` and text handouts use
  `kind: "text"` with a `text` string.
- A comment is an optional string. A question remains unfinished while it has
  an unresolved comment.
- Host notes are an optional string and do not affect question readiness.

The root object has a `format: "schdk-game-package"` marker, version `2`, a
`title`, and a `questions` array. Array order determines question numbers. The
shared TypeScript types and rules live in `@schdk/common`.

The editor saves new and unfinished packages to the same `.schdk` file. The
title, questions, and answers may remain empty during editing. Structural
parsing accepts unfinished packages; `validateGamePackage` performs the
separate readiness check when a complete package is required.

Legacy `.schdk` files containing plain JSON are still supported. The editor
rewrites them in ZIP format on the next save.

Version `1` packages with a single `question` string remain readable. They are
normalized to a version `2` standard question and rewritten on the next save.
