---
name: schdk-web-shell
description: Maintain the @schdk/web browser application. Use for web entry points, shell navigation, fixed sidebar behavior, React.lazy feature loading, application mounting, browser deep links, options tabs and storage, or Vite configuration.
---

# SCHDK Web Shell

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/web-apps.md` and `docs/rules/web-shell.md`.
2. Read `docs/rules/architecture.md` for ownership changes and `docs/rules/ui-shell.md` for visual changes.
   Read `docs/rules/google-drive.md` for settings authorization or synchronization.
3. Keep the unified web and desktop tools unmounted until Google authorization
   succeeds. Preserve mounted state behind the login gate after later expiry.
   Keep Drive-backed list hooks, including shared dictionaries, above lazy page
   boundaries and expose their combined preloading state in the sidebar.
4. Keep unified locale state and persistence in `@schdk/web`; keep
   translated copy and the locale context in `@schdk/ui`.
5. Start Google browser token requests only from an explicit login action;
   restore valid short-lived tokens only from per-tab session storage, and never
   open OAuth from startup, refresh, or background synchronization.
6. Keep the shell view and primary settings group in validated URL query
   state; restore both through browser back/forward.
7. Lazy-load every page on first selection, keep visited pages mounted, and
   visually smoke-test changed navigation.
8. Keep AI provider and model as separate validated selections populated from
   models.dev with a built-in fallback. Keep AI API keys in a separate app-data
   file for the current Google account and outside local or synchronized
   settings.
9. Keep the production Vite base relative and deploy
   `packages/web/dist` through the GitHub Pages workflow after pushes to
   `main`.
10. Keep `packages/web/version.json` embedded in the browser build and
    published at the Pages root so the shell can poll it once per minute.

## Checks

```powershell
pnpm --filter @schdk/web lint
pnpm --filter @schdk/web typecheck
pnpm --filter @schdk/web test
pnpm turbo build --filter=@schdk/web
```

Use the `$schdk-quality` browser smoke-test workflow for browser flows.
