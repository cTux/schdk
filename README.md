# Що? Де? Коли?

Monorepo for preparing and hosting intellectual game packages.

## Packages

- `client-web` — opens a saved game package and hosts the game in a browser.
- `client-web-desktop` — Electron application for creating, editing, and saving game packages to disk.

Both clients use React, TypeScript, Vite, Sass, Vitest, Oxlint, and Oxfmt. The desktop client also uses Electron and electron-builder.

## Development

Requirements: Node.js 25 and pnpm 11.

```sh
pnpm install
pnpm dev:web
pnpm dev:desktop
```

`dev:desktop` currently builds and opens the Electron app. A hot-reload desktop workflow can be added when desktop implementation starts.

## Quality

```sh
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Project behavior and file formats are intentionally not specified yet. See `docs/RULES.md` for the current boundaries.
