---
name: schdk-editor-persistence
description: Change or debug Drive-backed SCHDK editor state and persistence in @schdk/web and the unified desktop app. Use for imports, autosave, save states, Drive recents, downloads, deep links, desktop sessions, back navigation, or save-before-close behavior.
---

# SCHDK Editor Persistence

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/editor-state.md` and `docs/rules/game-packages.md`.
2. Trace browser and desktop paths separately from `packages/web/src/editor/App.tsx` through the injected Drive bridge.
3. Read `docs/rules/browser-persistence.md` or `docs/rules/desktop-editor-persistence.md` only for the affected platform.
4. Read `docs/rules/security.md` and `docs/rules/desktop-apps.md` only for bridge or close changes; read `docs/rules/ui-editor.md` only for visual changes.
5. Validate restored packages through `@schdk/common` and preserve pending data across every changed path.
6. Trace the stable Drive file ID, reconnect retry, deep link/session
   reference, title-synchronized filename, local import upload, and explicit
   download. Do not add local package persistence or recovery fallbacks.
7. Bind asynchronous editor mutations to the package session that started
   them. Closing, deleting, or switching packages must invalidate unfinished
   image reads and AI-generation results.

## Checks

```powershell
pnpm --filter @schdk/web lint
pnpm --filter @schdk/web typecheck
pnpm --filter @schdk/web test
pnpm turbo build --filter=@schdk/web
```

Build `@schdk/desktop` when the bridge or close flow changes.
