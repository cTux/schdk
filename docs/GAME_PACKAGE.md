# Game package format

A «Що? Де? Коли?» package is stored as a ZIP archive with the `.schdk`
extension. The archive contains a UTF-8 JSON file named `game.json`.

- A package has a title and exactly 36 questions: three rounds of 12.
- Every question has required question text and an answer.
- Alternative answers are an optional list of strings.
- A handout is an optional image embedded in the same file as a data URL.
- A comment is an optional string. A question remains unfinished while it has
  an unresolved comment.
- Host notes are an optional string and do not affect question readiness.

The root object has a `format: "schdk-game-package"` marker, version `1`, a
`title`, and a `questions` array. Array order determines question numbers. The
shared TypeScript types and rules live in `@schdk/common`.

The editor saves new and unfinished packages to the same `.schdk` file. The
title, questions, and answers may remain empty during editing. Structural
parsing accepts unfinished packages; `validateGamePackage` performs the
separate readiness check when a complete package is required.

Legacy `.schdk` files containing plain JSON are still supported. The editor
rewrites them in ZIP format on the next save.
