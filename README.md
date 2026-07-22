# Що? Де? Коли?

Monorepo for preparing and hosting intellectual game packages.

## Packages

- `host-web-app` — opens a saved game package and hosts the game in a browser.
- `editor-web-app` — creates and edits game packages in a browser.
- `host-desktop-app` — Electron build of the host.
- `editor-desktop-app` — Electron build of the editor with disk saving.
- `common` — shared game-package types and validation.

## Development

Requirements: Node.js 25 and pnpm 11.

```sh
pnpm install
pnpm dev:host-web
pnpm dev:editor-web
pnpm dev:host-desktop
pnpm dev:editor-desktop
```

Desktop development commands build their web app before opening Electron.

## Quality

```sh
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The root build uses Turbo's cache and collects every package artifact under `dist/<package>`.

The game-package format is documented in `docs/GAME_PACKAGE.md`. See `docs/RULES.md` for the current boundaries.
