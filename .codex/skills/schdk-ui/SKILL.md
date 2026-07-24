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
Keep the visual editor on a light full-size workspace with a pannable,
wheel-zoomable 16:9 game container.
Persist element bounds as percentages and apply the same bounds and
presentation settings in gameplay. Keep resize and element-property controls
outside the transformed game container. Resize from invisible border zones and
keep the selected wrapper and its border above every other preview. Select the
game canvas by default and restore its selection with Escape. Persist optional
element background images and opacity alongside the layout. Share measured
text height fitting between the visual editor and gameplay.
Keep the draggable game logo visible through every gameplay question stage.

## Checks

```powershell
pnpm --filter @schdk/ui lint
pnpm --filter @schdk/ui typecheck
pnpm --filter @schdk/ui test
pnpm --filter @schdk/all-web-app build
```

Use `$playwright` for browser interaction and screenshots.
