---
name: schdk-development
description: Implement, debug, refactor, review, or document changes anywhere in the SCHDK pnpm monorepo. Use for repository-wide work, cross-package features, bug fixes, dependency changes, rule updates, or tasks that do not fit a narrower SCHDK skill.
---

# SCHDK Development

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, and every linked rule area touched by the task.
2. Trace the current flow and all callers before editing. Respect ownership: data in `common`, visuals in `ui`, browser behavior in web apps, and OS integration in desktop apps.
3. Reuse existing helpers and native APIs before adding code, dependencies, abstractions, or packages.
4. Make the smallest complete change and add one focused test for non-trivial logic.
5. Update the matching rule and project skill when the task creates or changes a durable workflow.
6. Run the checks required by `docs/rules/tooling-and-quality.md` before committing.

## Route Specialized Work

- Use `$schdk-ui` for components, styles, accessibility, or visual changes.
- Use `$schdk-game-packages` for `.schdk` schema, parsing, serialization, or readiness.
- Use `$schdk-editor-persistence` for editor saves, drafts, recents, or restoration.
- Use `$schdk-web-shell` for web entry points, navigation, lazy loading, or options.
- Use `$schdk-electron` for IPC, desktop windows, close handling, or packaging.
- Use `$schdk-quality` for repository verification and distributable builds.

## Baseline Checks

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
```
