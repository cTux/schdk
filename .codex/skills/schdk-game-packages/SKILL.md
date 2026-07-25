---
name: schdk-game-packages
description: Maintain or diagnose the SCHDK .schdk file contract in @schdk/common. Use for game-package types, question fields, ZIP encoding, parsing, serialization, readiness validation, clipboard question JSON, compatibility, malformed files, or docs/GAME_PACKAGE.md changes.
---

# SCHDK Game Packages

## Workflow

1. Follow `$schdk-development`, then read `docs/GAME_PACKAGE.md` and `docs/rules/game-packages.md`.
2. Treat `packages/common/src/index.ts` as the executable source of truth; do not duplicate schema or validation logic in consumers.
3. Update implementation and `docs/GAME_PACKAGE.md` together for contract changes.
4. Rebuild affected consumers when exported types or behavior change.

## Checks

```powershell
pnpm --filter @schdk/common lint
pnpm --filter @schdk/common typecheck
pnpm --filter @schdk/common test
pnpm --filter @schdk/common build
pnpm --filter @schdk/editor-web-app typecheck
```
