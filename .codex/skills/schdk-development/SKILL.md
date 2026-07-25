---
name: schdk-development
description: Implement, debug, refactor, review, or document changes anywhere in the SCHDK pnpm monorepo. Use for repository-wide work, cross-package features, bug fixes, dependency changes, rule updates, or tasks that do not fit a narrower SCHDK skill.
---

# SCHDK Development

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, and every linked rule area touched by the task.
2. Trace the current flow and all callers before editing. Respect ownership: data in `common`, visuals in `ui`, browser behavior in web apps, and OS integration in desktop apps.
3. Reuse existing helpers and native APIs before adding code, dependencies, abstractions, or packages.
4. Make the smallest complete change. Add tests only for the exact prompt `add missing tests`, using `$schdk-add-missing-tests`.
5. Update the matching rule and skill only when a durable contract or workflow changes.
6. Verify with `$schdk-quality`.
7. After every prompt that changes repository files, stage and commit all task changes once verified; preserve unrelated changes.
8. Before creating a pull request, run `git fetch origin main` and `git rebase origin/main`; resolve conflicts and reverify the rebased result.
9. Push the branch with `git push -u origin HEAD`, create the pull request with `gh pr create --fill`, wait for its checks with `gh pr checks --watch --fail-fast`, and confirm the worktree is clean unless the user explicitly asks to keep the change local. If rebasing rewrote a published branch, update it with `git push --force-with-lease`.

## Route Specialized Work

- Use `$schdk-start-session` when initializing a new implementation worktree.
- Use `$schdk-update-dependencies` for pnpm, dependency, lockfile, or audit updates.
- Use `$schdk-add-missing-tests` only for an explicit `add missing tests` prompt.
- Use `$schdk-project-structure` for package, component, file-layout, or public-export changes.
- Use `$schdk-react-components` for React component behavior, hooks, and rendering performance.
- Use `$schdk-find-next-feature` when asked to suggest one actionable task from the current repository.
- Read `docs/rules/host-app.md` for host gameplay behavior without a narrower skill.
- Use `$schdk-ui` for components, styles, accessibility, or visual changes.
- Use `$schdk-game-packages` for `.schdk` schema, parsing, serialization, or readiness.
- Use `$schdk-editor-persistence` for editor saves, drafts, recents, or restoration.
- Use `$schdk-web-shell` for web entry points, navigation, lazy loading, or options.
- Use `$schdk-electron` for IPC, desktop windows, close handling, or packaging.
- Use `$schdk-quality` for repository verification and distributable builds.
