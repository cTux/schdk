---
name: schdk-quality
description: Verify SCHDK changes and produce local build artifacts. Use for pre-commit checks, repository health audits, test or build failures, package-level validation, browser smoke tests, Electron build verification, root dist collection, or confirming that a change is ready to commit.
---

# SCHDK Quality

## Workflow

1. Read `docs/rules/tooling-and-quality.md` and the rule areas touched by the change.
2. Inspect `git status` and the diff before selecting checks. Preserve unrelated user changes.
3. Run the full static and test suite, then build affected packages in dependency order.
4. Use a real browser for changed UI. Build affected Electron apps for main, preload, packaging, icon, or bundled-resource changes.
5. Run root `pnpm build` only when packaged executables are closed; otherwise report the lock and use targeted builds.
6. Confirm `git diff --check` and ensure generated output remains ignored before committing.
7. Keep `.githooks/pre-commit` limited to `pnpm fmt:check` and `pnpm lint`; root `pnpm install` activates it. Run typechecks, tests, and builds outside the hook.
8. Keep Turbo caching disabled for `@schdk/all-desktop-app#build`; Electron binaries must not accumulate in the shared worktree cache.

On Windows icon-tool exit `3221225477` during parallel root packaging, rerun
the failed desktop package build alone, then run `node scripts/collect-dist.mjs`.

## Full Checks

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not commit `dist`, `node_modules`, `.turbo`, `.playwright-cli`, logs, coverage, or build-info files.
