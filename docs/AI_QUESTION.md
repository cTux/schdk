# AI question format

An AI question rule is stored as a ZIP archive with the `.aiquestion`
extension. The archive contains one UTF-8 JSON file named
`ai-question.json`.

The root JSON object has a `format: "schdk-ai-question"` marker, version `1`,
and these fields:

- `name`: required non-empty rule name;
- `description`: required non-empty generation instructions;
- `goodExamples`: optional good-question examples;
- `badExamples`: optional bad-question examples;
- `enabled`: whether the rule is available during generation;
- `favorite`: whether the rule is sorted before non-favorites;
- `generalRule`: whether this global rule is applied to every generated
  question instead of appearing as a selectable template. Missing values from
  older archives are treated as `false`.

Archives larger than 1 MiB and `ai-question.json` entries larger than 512 KiB
are rejected. Duplicate recognized entries are rejected. Unrecognized ZIP
entries are ignored without extraction.

Each personal rule is stored as its own visible Google Drive file. Its
filesystem-safe filename follows the rule name plus `.aiquestion`. Global rules
ship as a validated, bundled read-only collection.
