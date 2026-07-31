---
name: schdk-development
description: Handle SCHDK work spanning packages or lacking a narrower skill, including implementation, debugging, refactoring, review, documentation, dependencies, and rule updates.
---

# SCHDK Development

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, and every linked rule area touched by the task.
2. Route specialized work through the smallest matching skill below. Trace the
   current flow and all callers before editing.
3. Read `docs/rules/architecture.md` for ownership changes. Reuse existing
   helpers and native APIs, then make the smallest complete change.
   Reuse the shared `@schdk/google-drive` transport helpers for Drive endpoints,
   multipart uploads, and SCHDK-folder discovery.
   Keep AI-generation orchestration in `@schdk/web`; UI may only collect its
   inputs and render callback-driven progress.
   When research finds a credible scalable solution that is not needed yet,
   record its purpose, tradeoffs, and activation conditions in
   `docs/POTENTIAL_IMPROVEMENTS.md`.
4. Use `$schdk-project-structure` for every source-code change. Add tests only
   for the exact prompt `add missing tests`, using
   `$schdk-add-missing-tests`.
5. Update the matching rule and skill when a durable contract or workflow
   changes.
6. Run `$schdk-sync-specs`, then `$schdk-quality`.
7. After every prompt that changes repository files, stage and commit all task changes once verified; preserve unrelated changes and confirm the worktree is clean.
   Follow the push and pull-request workflow in `docs/rules/verification.md`.
   When the current session changes code, end the prompt response with the pull-request link.

## Route Specialized Work

- Use `$schdk-start-session` when initializing a new implementation worktree.
- Use `$schdk-sync-specs` after every prompt that changes repository files.
- Use `$schdk-update-dependencies` for pnpm, dependency, lockfile, or audit updates.
- Use `$schdk-add-missing-tests` only for an explicit `add missing tests` prompt.
- Use `$schdk-project-structure` for every source-code change, including
  package, component, file-layout, and public-export changes.
- Use `$schdk-react-components` for React component behavior, hooks, and rendering performance.
- Use `$schdk-find-next-feature` when asked to suggest one actionable task from the current repository.
- Read `docs/rules/host-app.md` for host gameplay behavior without a narrower skill.
- Use `$schdk-ui` for components, styles, accessibility, or visual changes.
- Use `$schdk-game-packages` for `.schdk` schema, parsing, serialization, or readiness.
- Use `$schdk-editor-persistence` for editor saves, drafts, recents, or restoration.
- Use `$schdk-web-shell` for web entry points, navigation, lazy loading, or options.
- Use `$schdk-electron` for IPC, desktop windows, close handling, or packaging.
- Use `$schdk-quality` for repository verification and distributable builds.
- Use `$schdk-release` when asked to prepare, publish, repair, or verify a
  versioned GitHub Release.
