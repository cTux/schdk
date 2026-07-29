---
name: schdk-game-packages
description: Maintain or diagnose the SCHDK .schdk, .aiquestion, and .aiquestionpackage file contracts in @schdk/common. Use for game-package, AI-question, or AI-question-package types, ZIP encoding, parsing, serialization, readiness validation, clipboard question JSON, compatibility, malformed files, or portable-format documentation changes.
---

# SCHDK Game Packages

## Workflow

1. Follow `$schdk-development`, then read `docs/GAME_PACKAGE.md` and `docs/rules/game-packages.md`.
2. Treat `packages/common/src/index.ts` as the public contract entry point and
   `packages/common/src/game-question.ts` as the owner of question types and
   parsing; do not duplicate schema or validation logic in consumers.
   Store music-break bytes in their fixed ZIP entries, not in `game.json`.
3. Update implementation and `docs/GAME_PACKAGE.md` together for contract changes.
4. Rebuild affected consumers when exported types or behavior change.
5. For `.aiquestion` changes, keep `packages/common/src/ai-question.ts` and
   `docs/AI_QUESTION.md` synchronized. Require a ZIP archive containing the
   canonical `ai-question.json` entry; do not duplicate its parser in Drive or
   UI consumers.
6. For `.aiquestionpackage` changes, keep
   `packages/common/src/ai-questions-package.ts` and
   `docs/AI_QUESTION_PACKAGE.md` synchronized. Require a ZIP archive containing
   the canonical `ai-questions-package.json` entry and validate it before
   Drive-backed use.

## Checks

```powershell
pnpm --filter @schdk/common lint
pnpm --filter @schdk/common typecheck
pnpm --filter @schdk/common test
pnpm --filter @schdk/common build
pnpm --filter @schdk/web typecheck
```
