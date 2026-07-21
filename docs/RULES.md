# Project Rules

This file is the canonical project guidance.

## Product boundaries

- `packages/client-web` hosts a game by opening a saved game package.
- `packages/client-web-desktop` creates, edits, and saves game packages on disk.
- Keep the browser client independent of Electron APIs.
- Do not define the game-package format until its requirements are documented.

## Engineering

- Use pnpm workspace packages and Turbo tasks from the repository root.
- Keep both clients on the same React, TypeScript, Vite, Sass, test, lint, and formatting stack.
- Put Electron-only code under `packages/client-web-desktop/electron`.
- Prefer platform APIs and existing dependencies over new abstractions or packages.
- Add the smallest test that protects non-trivial behavior.
- Update this file when recurring architecture or workflow decisions change.
