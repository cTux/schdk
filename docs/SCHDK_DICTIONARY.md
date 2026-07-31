# SCHDK dictionary format

An SCHDK dictionary is stored as a ZIP archive with the
`.schdk-dictionary` extension. The archive contains one UTF-8 JSON file named
`dictionary.json`.

The root object has a `format: "schdk-dictionary"` marker, version `1`, and
these fields:

- `id`: `question-difficulty`, `question-recognizability`,
  `question-difficulty-distribution`, or
  `question-recognizability-distribution`;
- `name`: the non-empty display name;
- `description`: the non-empty dictionary description;
- `items`: the five ordered values `very-easy`, `easy`, `medium`, `hard`, and
  `very-hard`.

Each item has:

- `value`: its stable machine-readable value;
- `name`: the label shown in generation dropdowns;
- `description`: the human-readable meaning;
- Base difficulty and recognizability dictionaries store `promptPart`, the
  exact instruction fragment sent to the AI provider. Distribution dictionaries
  do not store prompt text; generation resolves the selected value in the
  corresponding base dictionary.
- Distribution dictionaries additionally store `distribution`, with one
  percentage for each scale value. Percentages must be between 0 and 100 and
  total 100. Distribution items may be added by administrators.

Archives and their JSON entry are limited to 256 KiB and 128 KiB respectively.
Readers reject plain JSON, malformed archives, duplicate canonical entries,
unsupported versions, missing or duplicate scale values, empty fields, and
out-of-order scale values, empty fields, and oversized input. The shared
TypeScript types, parser, defaults, and serializer live in `@schdk/common`.
