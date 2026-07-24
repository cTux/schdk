---
name: schdk-editor-persistence
description: Change or debug SCHDK editor state and persistence in @schdk/editor-web-app and the unified desktop app. Use for open/save flows, autosave, save states, drafts, recents, readiness metadata, browser downloads, File System Access, deep links, desktop sessions, back navigation, or save-before-close behavior.
---

# SCHDK Editor Persistence

## Workflow

1. Read `docs/rules/editor-persistence.md`, `docs/rules/game-packages.md`, and `docs/rules/security.md`; also read `docs/rules/desktop-apps.md` for bridge or close changes.
2. Trace browser and desktop paths separately from `packages/editor-web-app/src/App.tsx` through storage or `window.desktop`.
3. Keep `window.desktop` optional. Never make browser editing depend on Electron.
4. Preserve pending data through save queues, drafts, autosave, navigation, and close failures. Do not mark stale writes saved.
5. Keep persisted data backward-compatible and best-effort where rules allow; validate every restored package through `@schdk/common`.
6. Add tests only through `$schdk-add-missing-tests` when explicitly prompted.

## Checks

```powershell
pnpm --filter @schdk/editor-web-app lint
pnpm --filter @schdk/editor-web-app typecheck
pnpm --filter @schdk/editor-web-app test
pnpm --filter @schdk/editor-web-app build
```

Build `@schdk/all-desktop-app` when the bridge or close flow changes.
