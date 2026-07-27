# SCHDK UI rules

`@schdk/ui` owns shared components, composed views, styles, tokens, assets, and
visual rules. Applications own state, persistence, routing, and platform
integration.

Read only the areas touched by the task:

- [Component structure](../../docs/rules/project-structure.md): directories,
  colocated files, exports, props, tests, and conditional classes.
- [Foundations](../../docs/rules/ui-foundations.md): ownership, components,
  React behavior and performance, styling, accessibility, icons, and copy.
- [Editor UI](../../docs/rules/ui-editor.md): editor fields, status, handouts,
  question navigation, and recents.
- [Gameplay UI](../../docs/rules/ui-gameplay.md): host summary, question stages,
  projector layout, answers, handouts, and controls.
- [Visual editor UI](../../docs/rules/ui-visual-editor.md): canvas, selection,
  drag, resize, zoom, and persisted presentation.
- [Shell UI](../../docs/rules/ui-shell.md): sidebar, navigation groups, and
  settings tabs.

The project-wide index is [`docs/RULES.md`](../../docs/RULES.md).

## Storybook

Run `pnpm --filter @schdk/ui storybook` from the repository root. The toolbar
switches the locale and theme globally, while each generated story exposes its
component props through Storybook Controls.

Stories are generated from exported React function components. Keep new
components and changed props compatible with
`.storybook/generate-stories.mjs`, and update `.storybook/story-args.tsx` or
`.storybook/story-fixtures.ts` when a renderable default needs new data. Verify
component or prop changes with `pnpm --filter @schdk/ui build:storybook`.
