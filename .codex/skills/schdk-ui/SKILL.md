---
name: schdk-ui
description: Build, refactor, or review SCHDK React UI components and SCSS in @schdk/ui. Use for layouts, controls, icons, tooltips, responsive behavior, accessibility, Ukrainian copy, design consistency, or screenshot-led interface fixes across any web or desktop surface.
---

# SCHDK UI

## Workflow

1. Read `packages/ui/README.md`, `docs/rules/architecture.md`, `docs/rules/web-apps.md`, and `docs/rules/tooling-and-quality.md`.
2. Keep reusable markup, components, assets, tokens, and SCSS in `@schdk/ui`; keep application state and platform APIs outside it.
3. Reuse existing atoms and patterns. Add a dedicated component only for coherent behavior or realistic reuse.
4. Use Flexbox, shared tokens, Font Awesome control icons, Ukrainian copy, semantic controls, keyboard focus, and `aria-*` state.
5. Add the smallest focused test for non-trivial interaction or extracted logic.
6. Visually smoke-test the affected flow in a real browser at narrow and normal widths.

Keep the main answer and alternative answer as separate draggable layout
elements while rendering both through the shared host components.

## Checks

```powershell
pnpm --filter @schdk/ui lint
pnpm --filter @schdk/ui typecheck
pnpm --filter @schdk/ui test
pnpm --filter @schdk/all-web-app build
```

Use `$playwright` for browser interaction and screenshots.
