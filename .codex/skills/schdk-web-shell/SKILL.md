---
name: schdk-web-shell
description: Maintain SCHDK browser applications and the unified @schdk/all-web-app shell. Use for web entry points, shell navigation, fixed sidebar behavior, React.lazy bundle loading, application mounting, browser deep links, options tabs and storage, Vite configuration, or standalone versus unified renderer behavior.
---

# SCHDK Web Shell

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/web-apps.md` and `docs/rules/web-shell.md`.
2. Read `docs/rules/architecture.md` for ownership changes and `docs/rules/ui-shell.md` for visual changes.
3. Trace standalone and unified renderer paths separately.
4. Keep unified locale state and persistence in `@schdk/all-web-app`; keep
   translated copy and the locale context in `@schdk/ui`.
5. Visually smoke-test changed navigation.

## Checks

```powershell
pnpm --filter @schdk/all-web-app lint
pnpm --filter @schdk/all-web-app typecheck
pnpm --filter @schdk/all-web-app test
pnpm --filter @schdk/all-web-app build
```

Use `$playwright` for browser flows.
