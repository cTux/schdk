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
   Route visual-editor and host positions through the shared game-layout style
   mapper so both surfaces render the persisted presentation identically.
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
