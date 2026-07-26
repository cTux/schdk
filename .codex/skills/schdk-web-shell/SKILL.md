---
name: schdk-web-shell
description: Maintain SCHDK browser applications and the unified @schdk/all-web-app shell. Use for web entry points, shell navigation, fixed sidebar behavior, React.lazy bundle loading, application mounting, browser deep links, options tabs and storage, Vite configuration, or standalone versus unified renderer behavior.
---

# SCHDK Web Shell

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/web-apps.md` and `docs/rules/web-shell.md`.
2. Read `docs/rules/architecture.md` for ownership changes and `docs/rules/ui-shell.md` for visual changes.
   Read `docs/rules/google-drive.md` for settings authorization or synchronization.
3. Keep the unified web and desktop tools unmounted until Google authorization
   succeeds. Preserve mounted state behind the login gate after later expiry.
4. Keep unified locale state and persistence in `@schdk/all-web-app`; keep
   translated copy and the locale context in `@schdk/ui`.
5. Start Google browser token requests only from an explicit login action;
   restore valid short-lived tokens only from per-tab session storage, and never
   open OAuth from startup, refresh, or background synchronization.
6. Visually smoke-test changed navigation.
7. Keep browser AI API keys session-only and outside synchronized settings.

## Checks

```powershell
pnpm --filter @schdk/all-web-app lint
pnpm --filter @schdk/all-web-app typecheck
pnpm --filter @schdk/all-web-app test
pnpm --filter @schdk/all-web-app build
```

Use the `$schdk-quality` browser smoke-test workflow for browser flows.
