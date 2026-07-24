# Tooling and quality

## Workspace and dependencies

- Use Node.js 25.x and pnpm 11.x; the repository pins Node `25.9.0` and pnpm
  `11.17.0`.
- Run workspace commands from the repository root unless a package-local
  command is explicitly required.
- Keep packages under `packages/*` and use `workspace:*` for internal
  dependencies.
- Put shared tool versions in the pnpm catalog. Add dependencies with pnpm and
  commit `pnpm-lock.yaml` with manifest changes.
- Keep `npm-check-updates` as a root dev dependency and use
  `$schdk-update-dependencies` for pnpm, dependency, lockfile, and audit updates.
- Start implementation in a new worktree with `$schdk-start-session`: create a
  prompt-based `codex/` branch, then run `pnpm install`.
- Prefer platform APIs and installed dependencies before adding new packages.
  Import only the Font Awesome icons used by the UI.

## Build and generated files

- Use Turbo for `build`, `lint`, `typecheck`, and `test`; package builds must
  declare cacheable output under `dist/**`.
- Do not cache the `@schdk/all-desktop-app` build in Turbo; packaged Electron
  binaries make each cache entry disproportionately large.
- Root `pnpm build` builds packages in dependency order, deletes the root
  `dist`, and collects each package's `dist` under `dist/<package>`.
- Close applications launched from root `dist` before collection; Windows will
  lock their executable directories and cause `EBUSY`.
- If parallel root packaging makes Electron's Windows icon tool exit with
  `3221225477` after producing the icon, rerun the affected desktop package
  build sequentially, then run the dist collection script.
- Do not edit or commit `node_modules`, `dist`, `.turbo`, `.playwright-cli`,
  logs, coverage, or TypeScript build-info files.
- Keep Electron output Windows-compatible and web output usable through
  relative `file:` URLs.

## Code quality and verification

- Keep TypeScript strict. Web and UI packages use bundler resolution; Electron
  uses NodeNext; `@schdk/common` emits its build and declarations.
- Format with Oxfmt, lint TypeScript/React with Oxlint, and lint UI SCSS with
  Stylelint.
- Keep the versioned hooks under `.githooks`. Root `pnpm install` configures
  `core.hooksPath`; pre-commit must run `pnpm fmt:check` and `pnpm lint`.
- Add the smallest runnable Vitest test for every non-trivial branch, parser,
  persistence rule, timer, IPC routing rule, or data-loss prevention path.
- Keep pure logic outside React/Electron objects when that makes it directly
  testable, as with autosave, preload routing, shortcuts, and close control.
- Before committing, run `pnpm fmt:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and the builds affected by the change. Run root `pnpm build`
  when no running packaged executable blocks artifact collection.
- Visually smoke-test changed UI in a real browser. Build the affected Electron
  package when changing preload, main-process, packaging, icon, or web-resource
  integration.
