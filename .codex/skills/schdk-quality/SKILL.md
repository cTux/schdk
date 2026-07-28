---
name: schdk-quality
description: Verify SCHDK changes and produce local build artifacts. Use for pre-commit checks, repository health audits, test or build failures, package-level validation, browser smoke tests in the already-open Brave browser, Electron build verification, or confirming that a change is ready to commit.
---

# SCHDK Quality

## Workflow

1. Read `docs/rules/verification.md`, `docs/rules/builds.md`, and the rule areas touched by the change.
2. Inspect `git status` and the diff before selecting checks. Preserve unrelated user changes.
3. Confirm `$schdk-sync-specs` reviewed the final diff and created or updated
   required contracts. Do not start final verification while spec sync remains
   pending.
4. Run the full static and test suite, then build affected packages in dependency order.
   Keep the pull-request `tests` job responsible for formatting, linting,
   typechecking, and tests. Keep the required root `build` job on
   `windows-latest` so it verifies Windows desktop packaging. Keep Turbo test
   tasks dependent on dependency builds so fresh clones can resolve packages
   that export compiled output. Keep every third-party action pinned to a full
   commit SHA with its release tag in a comment.
5. Keep the pull-request production-browser and packaged-Electron smoke checks
   green. Use the browser smoke-test workflow below for changed UI. Build
   affected Electron apps for main, preload, packaging, icon, or
   bundled-resource changes.
6. Run root `pnpm build` for complete workspace build verification.
7. Confirm `git diff --check` and ensure generated output remains ignored before committing.
8. Keep the pre-commit hook limited to formatting and linting; run the remaining checks outside it.

## Full Checks

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not commit `dist`, `node_modules`, `.turbo`, `.playwright-cli`, logs, coverage, or build-info files.

## Browser Smoke Tests

1. Use `$computer-use:computer-use` to control the user's already-open Brave window.
2. Reuse that Brave window and its current session; do not launch another browser or add Playwright test code for a manual smoke test.
3. If no controllable Brave window is open, report that browser verification is blocked and ask the user to open Brave.
