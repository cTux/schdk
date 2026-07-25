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
- Keep pure logic outside React/Electron objects when that makes it directly
  testable.
- Run all tests and the root build in dedicated `tests` and `build` GitHub
  Actions jobs for every pull request. Treat both checks as required project
  policy, configure branch protection when repository settings support it, and
  do not merge until both are green.
- Build workspace dependencies before testing their consumers so fresh clones
  can resolve packages that intentionally export compiled output.
- Before committing, run `pnpm fmt:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and affected builds. Run root `pnpm build` for complete workspace
  build verification.
- For every prompt that changes repository files, work on a prompt-based
  `codex/` branch, commit all verified task changes, push the branch to `origin`,
  and create a GitHub pull request. Preserve unrelated user changes, confirm the
  worktree is clean, and keep changes local only when the user explicitly asks.
- Visually smoke-test changed UI in a real browser. Build the affected Electron
  package for preload, main-process, packaging, icon, or web-resource changes.
