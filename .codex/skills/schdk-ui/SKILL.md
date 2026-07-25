---
name: schdk-ui
description: Build, refactor, or review SCHDK React UI components and SCSS in @schdk/ui. Use for layouts, controls, icons, tooltips, responsive behavior, accessibility, Ukrainian copy, design consistency, or screenshot-led interface fixes across any web or desktop surface.
---

# SCHDK UI

## Workflow

1. Follow `$schdk-development`, then read `packages/ui/README.md` and only its rule areas touched by the task.
2. Follow `$schdk-scss` for any SCSS change or audit.
3. Use `$schdk-project-structure` for new or structurally changed components.
4. Use `$schdk-react-components` for component logic, hooks, and rendering performance.
5. Read `docs/rules/architecture.md` when ownership changes.
6. Reuse existing components and tokens before adding UI surface.
7. Put Ukrainian and English user-visible copy in the shared localization
   module and consume it through the locale context.
8. Visually smoke-test the affected flow at narrow and normal widths.

## Checks

```powershell
pnpm --filter @schdk/ui lint
pnpm --filter @schdk/ui typecheck
pnpm --filter @schdk/ui test
pnpm --filter @schdk/all-web-app build
```

Use the `$schdk-quality` browser smoke-test workflow for interaction and screenshots.
