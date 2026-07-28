# Testing, verification, and commits

- Keep TypeScript strict. Web and UI packages use bundler resolution; Electron
  uses NodeNext; `@schdk/common` emits its build and declarations.
- Format with Oxfmt, lint TypeScript/React with Oxlint, and lint UI SCSS with
  Stylelint.
- Keep the versioned hooks under `.githooks`. Root `pnpm install` configures
  `core.hooksPath`; pre-commit must run only `pnpm fmt:check` and `pnpm lint`,
  never tests.
- Do not add tests automatically during feature, fix, or refactor work. Add
  them only when the prompt explicitly says `add missing tests`, using
  `$schdk-add-missing-tests` to cover all changes since the previous test batch.
- Prefer unit and integration tests, and use stable snapshots to catch UI
  regressions. Reserve fast end-to-end tests for critical flows that must never
  fail.
- Use `$schdk-technical-review` for project technical audits. Report only
  evidenced P0-P2 issues in a priority-sorted table.
- Keep pure logic outside React/Electron objects when that makes it directly
  testable.
- Run formatting, linting, typechecking, and tests in the pull-request `tests`
  job. Run the root build and Windows desktop packaging in a
  `windows-latest` `build` job. Treat both checks as required project policy,
  configure branch protection when repository settings support it, and do not
  merge until both are green.
- Keep CI smoke checks for the production browser shell and packaged Electron
  renderer. The Electron check must also confirm the preload bridge is exposed.
- Build workspace dependencies before testing their consumers so fresh clones
  can resolve packages that intentionally export compiled output.
- For cross-platform desktop packaging, verify native unpacked output and each
  requested installer or package before artifact upload. Inspect DEB identity
  and maintainer fields with `dpkg-deb`; preserve macOS `.app` bundles through
  electron-builder's ZIP target.
- Before committing, run `pnpm fmt:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and affected builds. Run root `pnpm build` for complete workspace
  build verification.
- For every prompt that changes repository files, work on a prompt-based
  `codex/` branch, commit all verified task changes, push the branch to `origin`,
  and create a GitHub pull request. Preserve unrelated user changes, confirm the
  worktree is clean, and keep changes local only when the user explicitly asks.
- Visually smoke-test changed UI and perform browser-based Google Drive file
  uploads in the user's already-open Brave browser; do not launch a separate
  browser for these tasks. Build the affected Electron package for preload,
  main-process, packaging, icon, or web-resource changes.
