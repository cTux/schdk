---
name: schdk-editor-persistence
description: Change or debug Drive-backed SCHDK editor persistence across web and desktop, including import, autosave, recents, downloads, restoration, navigation, and save-before-close.
---

# SCHDK Editor Persistence

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/editor-state.md`,
   `docs/rules/game-packages.md`, and the affected platform's persistence rule.
2. Trace browser and desktop paths separately from the editor session reducer
   through the injected Drive bridge; preserve atomic package, backing-file,
   and save-status transitions.
3. Read `docs/rules/security.md` and `docs/rules/desktop-apps.md` for bridge or
   close changes; read `docs/rules/ui-editor.md` for visual changes.
4. Exercise every changed create, import, restore, autosave, navigation,
   download, and close path that can preserve or discard pending data.

## Checks

```powershell
pnpm --filter @schdk/web lint
pnpm --filter @schdk/web typecheck
pnpm --filter @schdk/web test
pnpm turbo build --filter=@schdk/web
```

Build `@schdk/desktop` when the bridge or close flow changes.
