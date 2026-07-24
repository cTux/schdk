---
name: schdk-add-missing-tests
description: Backfill automated tests for all SCHDK changes since the previous test-adding commit. Use only when the user explicitly says "add missing tests"; do not trigger automatically after a fix, feature, refactor, or review.
---

# SCHDK Missing Tests

## Find the coverage window

1. Read `docs/rules/tooling-and-quality.md` and inspect `git status`.
2. Find the latest commit that added or changed tests:

```powershell
$testBase = git log -1 --format=%H -- ':(glob)**/*.test.*' ':(glob)**/*.spec.*' ':(glob)**/__snapshots__/**' ':(glob)**/tests/**'
```

3. If no test commit exists, use the repository root commit.
4. Inspect every commit and source change after that boundary, plus uncommitted changes:

```powershell
git log --oneline "$testBase..HEAD"
git diff --name-status "$testBase..HEAD"
git diff --name-status
```

5. Trace the changed behavior and existing tests package by package. Cover all missing behavior from the whole window, not only the latest prompt.

## Choose the smallest effective tests

- Use unit tests for pure logic and edge cases.
- Use integration tests for package boundaries, persistence, IPC, serialization, and other collaborating components.
- Use stable snapshots for UI output or screenshot states where an unintended visual change must be obvious.
- Use fast end-to-end tests only for critical flows that must never fail. Keep setup and assertions minimal, and ensure the root `pnpm test` command runs them.
- Reuse Vitest and existing package test patterns. Add another test dependency only when the required test type cannot use the installed tooling.

## Verify

1. Run focused tests while iterating.
2. Review snapshot updates; never accept them blindly.
3. Confirm every added test is reached by root `pnpm test`, then run the remaining checks required by `$schdk-quality`.
4. Confirm the PR `tests` check is green before merge.
