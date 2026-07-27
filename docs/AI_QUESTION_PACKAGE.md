# AI question package format

An AI question package is stored as a ZIP archive with the
`.aiquestionpackage` extension. The archive contains one UTF-8 JSON file named
`ai-questions-package.json`.

The root object has a `format: "schdk-ai-questions-package"` marker, version
`1`, and these fields:

- `name`: the non-empty display name;
- `context`: the non-empty context shared by every generated question;
- `questions`: optional additional contexts for individual question slots;
- `enabled`: whether the package can be selected for generation;
- `favorite`: whether it sorts before other packages.

Each item in `questions` has a `questionNumber` from 1 through 36, a non-empty
`context`, and an optional `questionType`. `questionType` stores the name of an
AI question rule. When that rule is unavailable, generation uses the normal
fallback rule order.

Archives and their JSON entry are size-limited to 1 MiB and 512 KiB
respectively. Readers reject plain JSON, malformed archives, duplicate
canonical entries, unsupported versions, invalid fields, and oversized input.
The shared TypeScript types, parser, and serializer live in `@schdk/common`.
