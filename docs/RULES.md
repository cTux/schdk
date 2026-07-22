# Project Rules

This file is the canonical project guidance.

## Product boundaries

- `packages/host-web-app` hosts a game in a browser.
- `packages/editor-web-app` creates and edits game packages in a browser.
- `packages/host-desktop-app` packages `host-web-app` with Electron.
- `packages/editor-desktop-app` packages `editor-web-app` with Electron and saves game packages to disk.
- `packages/all-web-app` provides the shared sidebar and embeds the host and editor web bundles.
- `packages/all-desktop-app` packages `all-web-app` with Electron and provides the editor's disk bridge to its embedded frame.
- Keep the browser client independent of Electron APIs.
- Keep the game-package requirements documented in `docs/GAME_PACKAGE.md`.

## Engineering

- Use pnpm workspace packages and Turbo tasks from the repository root.
- Keep both clients on the same React, TypeScript, Vite, Sass, test, lint, and formatting stack.
- Put Electron-only code in the desktop app packages.
- Keep package-local build output cacheable; the root build collects it under `dist/<package>`.
- Prefer platform APIs and existing dependencies over new abstractions or packages.
- Add the smallest test that protects non-trivial behavior.
- Update this file when recurring architecture or workflow decisions change.
