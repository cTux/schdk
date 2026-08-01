---
name: schdk-ui
description: Build, refactor, or review @schdk/ui components and styles. Use for layouts, controls, icons, responsive behavior, accessibility, copy, or screenshot-led fixes.
---

# SCHDK UI

## Workflow

1. Follow `$schdk-development`, then read `packages/ui/README.md` and only its
   rule areas touched by the task.
2. Follow `$schdk-scss` for any SCSS change or audit.
3. Use `$schdk-project-structure` for new or structurally changed components.
4. Use `$schdk-react-components` for component logic, hooks, and rendering performance.
5. Read `docs/rules/architecture.md` when ownership changes.
6. Trace the owning view and consumers, then reuse existing components and
   tokens before adding UI surface.
   Keep controls shared by editor and host in a neutral UI domain rather than
   importing one feature's components from the other.
   Keep feature-specific styles at the owning component boundary instead of
   loading them through an application-area stylesheet.
   Route visual-editor and host positions through the neutral game-presentation
   components and shared game-layout style mapper so both surfaces render the
   persisted presentation identically without importing from each other.
   Keep persisted visual-editor model updates in pure helpers and transient
   gesture state in the React hook.
   Keep bounded visual-editor undo and redo history in the web controller;
   expose only availability and callbacks to the UI, bound retained serialized
   presentation size, and clear history across account changes.
   Reuse the editor generation-task hook for AbortController ownership,
   unmount cleanup, and stale-result guards across generation dialogs.
   Bound visual-editor image files before reading and validate their embedded
   data URLs against the canonical image-data limit before applying them.
7. Verify Storybook for changed exports or props and visually smoke-test the
   affected flow at narrow and normal widths.

## Checks

```powershell
pnpm --filter @schdk/ui lint
pnpm --filter @schdk/ui typecheck
pnpm --filter @schdk/ui test
pnpm --filter @schdk/ui build:storybook
pnpm turbo build --filter=@schdk/web
```

Use the `$schdk-quality` browser smoke-test workflow for interaction and screenshots.
