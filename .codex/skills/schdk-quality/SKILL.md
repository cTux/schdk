---
name: schdk-quality
description: Verify SCHDK changes and produce local build artifacts. Use for pre-commit checks, repository health audits, test or build failures, package-level validation, browser smoke tests, Electron build verification, root dist collection, or confirming that a change is ready to commit.
---

# SCHDK Quality

## Workflow

1. Read `docs/rules/verification.md`, `docs/rules/builds.md`, and the rule areas touched by the change.
2. Inspect `git status` and the diff before selecting checks. Preserve unrelated user changes.
3. Run the full static and test suite, then build affected packages in dependency order.
   Keep the pull-request `tests` and root `build` GitHub Actions jobs required.
4. Use the browser smoke-test workflow below for changed UI. Build affected Electron apps for main, preload, packaging, icon, or bundled-resource changes.
5. Run root `pnpm build` only when packaged executables are closed; its dist cleanup fails after 10 seconds when locked, so report the lock and use targeted builds.
6. Confirm `git diff --check` and ensure generated output remains ignored before committing.
7. Keep the pre-commit hook limited to formatting and linting; run the remaining checks outside it.

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

1. Use `$chrome:control-chrome` and its browser-provided `tab.playwright` API when available; reuse the current browser connection.
2. Do not launch installed Chrome through standalone Playwright or add Playwright test code for a manual smoke test.
3. If Chrome control is unavailable, use `$playwright` with its bundled Chromium, not an installed Chrome channel.
4. Keep browser setup and fallback details internal. Report them only when verification cannot continue or requires user action.
