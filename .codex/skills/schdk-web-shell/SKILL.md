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
   Keep routing and page composition in `@schdk/web`; load Drive collections
   with their first consumer and retain them for the shell session.
   Keep shell preference persistence and document metadata in their focused
   hooks, and pass cohesive host options as one grouped contract.
   Wrap lazy shell, editor, and host chunks in the shared localized loading and
   error boundary so chunk failures retain a usable shell and reload action.
   Let Vite derive chunks from that import graph; do not force all third-party
   modules into a global vendor chunk.
4. Keep GIS access tokens in memory only; page reload must require an explicit
   reconnect rather than restoring authorization from browser storage.
5. Visually smoke-test changed navigation, restoration, login gating, and
   loading states.
6. For production OAuth branding changes, verify the unauthenticated hosted
   login surface identifies the app, the same-domain public application
   homepage explains its features and use of Google Drive data, and both link a
   directly loadable same-domain privacy policy whose disclosures match
   `docs/rules/google-drive.md`. Confirm the production domain is owned in
   Google Search Console by a Cloud project owner or editor before submission.

## Checks

```powershell
pnpm --filter @schdk/web lint
pnpm --filter @schdk/web typecheck
pnpm --filter @schdk/web test
pnpm turbo build --filter=@schdk/web
```

Use the `$schdk-quality` browser smoke-test workflow for browser flows.
