---
name: schdk-quality
description: Verify SCHDK changes and builds. Use for pre-commit checks, health audits, test or build failures, package validation, browser smoke tests, and Electron builds.
---

# SCHDK Quality

## Workflow

1. Read `docs/rules/verification.md`, `docs/rules/builds.md`, and the rule areas
   touched by the change.
2. Inspect `git status` and the diff, preserving unrelated changes.
3. Confirm `$schdk-sync-specs` reviewed the final diff.
4. Run the full checks below and any narrower affected-package checks required
   by the matching skill. Do not run `pnpm lint` automatically; pull-request CI
   owns Oxlint verification.
5. Use the browser smoke-test workflow for changed UI. Build affected Electron
   apps for main, preload, packaging, icon, or bundled-resource changes.
6. Confirm `git diff --check`, structural rules for changed source files, and
   that generated output remains ignored.
7. Treat the web bundle check as both the global chunk budget and the lazy
   visual-editor chunk budget.
8. Keep repository workflow checks aligned with durable architecture boundaries
   when ownership or mirrored preload IPC contracts change.
   Preserve UI platform isolation, exported-control-only application JSX, and
   direct-import isolation between editor, host, and visual-editor features.

## Full Checks

```powershell
pnpm fmt:check
pnpm typecheck
pnpm test
pnpm test:browser
pnpm build
pnpm --filter @schdk/web check:bundle
```

Do not commit generated output excluded by `docs/rules/builds.md`.

## Browser Smoke Tests

1. Use `$chrome:control-chrome` and its browser-provided `tab.playwright` API when available; reuse the current browser connection.
2. Do not launch installed Chrome through standalone Playwright or add Playwright test code for a manual smoke test.
3. If Chrome control is unavailable, use `$playwright` with its bundled Chromium, not an installed Chrome channel.
4. Keep browser setup and fallback details internal. Report them only when verification cannot continue or requires user action.
