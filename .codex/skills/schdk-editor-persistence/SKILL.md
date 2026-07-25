---
name: schdk-editor-persistence
description: Change or debug Drive-backed SCHDK editor state and persistence in @schdk/editor-web-app and the unified desktop app. Use for imports, autosave, save states, Drive recents, downloads, deep links, desktop sessions, back navigation, or save-before-close behavior.
---

# SCHDK Editor Persistence

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/editor-state.md` and `docs/rules/game-packages.md`.
2. Trace browser and desktop paths separately from `packages/editor-web-app/src/App.tsx` through the injected Drive bridge.
3. Read `docs/rules/browser-persistence.md` or `docs/rules/desktop-editor-persistence.md` only for the affected platform.
4. Read `docs/rules/security.md` and `docs/rules/desktop-apps.md` only for bridge or close changes; read `docs/rules/ui-editor.md` only for visual changes.
5. Validate restored packages through `@schdk/common` and preserve pending data across every changed path.
6. Trace the stable Drive file ID, reconnect retry, deep link/session
   reference, title-synchronized filename, local import upload, and explicit
   download. Do not add local package persistence or recovery fallbacks.

## Checks

```powershell
pnpm --filter @schdk/editor-web-app lint
pnpm --filter @schdk/editor-web-app typecheck
pnpm --filter @schdk/editor-web-app test
pnpm --filter @schdk/editor-web-app build
```

Build `@schdk/all-desktop-app` when the bridge or close flow changes.
