---
name: schdk-game-packages
description: Maintain SCHDK .schdk, .aiquestion, .aiquestionpackage, and .schdk-dictionary contracts. Use for types, ZIPs, parsing, serialization, validation, compatibility, malformed files, or format docs.
---

# SCHDK Game Packages

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/game-packages.md` and the
   format contract affected by the task:
   `docs/GAME_PACKAGE.md`, `docs/AI_QUESTION.md`,
   `docs/AI_QUESTION_PACKAGE.md`, or `docs/SCHDK_DICTIONARY.md`.
2. Trace the owning `@schdk/common` parser, serializer, validator, public
   export, and every affected consumer before editing.
3. Update implementation and its format contract together.
4. Exercise round-trip and malformed-input paths, then rebuild affected
   consumers when exports or behavior change.

## Checks

```powershell
pnpm --filter @schdk/common lint
pnpm --filter @schdk/common typecheck
pnpm --filter @schdk/common test
pnpm --filter @schdk/common build
pnpm --filter @schdk/web typecheck
```
