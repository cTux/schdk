---
name: schdk-game-packages
description: Maintain or diagnose the SCHDK .schdk file contract in @schdk/common. Use for game-package types, question fields, ZIP encoding, parsing, serialization, readiness validation, clipboard question JSON, compatibility, malformed files, or docs/GAME_PACKAGE.md changes.
---

# SCHDK Game Packages

## Workflow

1. Read `docs/GAME_PACKAGE.md` and `docs/rules/game-packages.md` before changing the contract.
2. Treat `packages/common/src/index.ts` as the executable source of truth; do not duplicate schema or validation logic in consumers.
3. Keep parsing structural and strict at trust boundaries while allowing unfinished packages to remain editable.
4. Use `validateGamePackage` only for readiness. Preserve optional fields and legacy compatibility unless a breaking change is explicit.
5. Update implementation, malformed-input and round-trip tests, and `docs/GAME_PACKAGE.md` together for every contract change.
6. Rebuild and test consumers when exported types or behavior change.

## Checks

```powershell
pnpm --filter @schdk/common lint
pnpm --filter @schdk/common typecheck
pnpm --filter @schdk/common test
pnpm --filter @schdk/common build
pnpm --filter @schdk/editor-web-app typecheck
```
