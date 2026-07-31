---
name: schdk-web-shell
description: Maintain the @schdk/web shell. Use for entry points, navigation, sidebar, lazy loading, mounting, deep links, options persistence, or Vite configuration.
---

# SCHDK Web Shell

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/web-apps.md` and
   `docs/rules/web-shell.md`.
2. Read `docs/rules/architecture.md` for ownership changes,
   `docs/rules/ui-shell.md` for visual changes, and
   `docs/rules/google-drive.md` for authorization or synchronization changes.
3. Trace the affected shell state, URL state, lazy boundary, persistence, and
   authorization path before editing.
4. Visually smoke-test changed navigation, restoration, login gating, and
   loading states.

## Checks

```powershell
pnpm --filter @schdk/web lint
pnpm --filter @schdk/web typecheck
pnpm --filter @schdk/web test
pnpm turbo build --filter=@schdk/web
```

Use the `$schdk-quality` browser smoke-test workflow for browser flows.
