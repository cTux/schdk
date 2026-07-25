---
name: schdk-scss
description: Write, refactor, review, or audit SCSS in SCHDK. Use for any change to .scss files, style architecture, theme tokens, responsive rules, selector specificity, nesting, motion, or Stylelint policy in @schdk/ui.
---

# SCHDK SCSS

## Workflow

1. Follow `$schdk-ui`, then read `docs/rules/ui-foundations.md`.
2. Trace the owning React markup, stylesheet entry point, and existing selectors
   before editing.
3. Reuse existing CSS custom properties, Sass tokens, primitives, and selectors.
   Prefer native CSS over a new Sass abstraction.
4. Make the smallest complete change and remove unused imports or empty
   stylesheet placeholders encountered in scope.
5. Run `pnpm --filter @schdk/ui lint`, the affected build, and a browser smoke
   test at normal and 320 px widths.

## Rules

- Load Sass modules with `@use` or `@forward`; never add Sass `@import`.
- Keep the palette in `styles/light.scss` and `styles/dark.scss`. Consume theme
  values through existing tokens everywhere else.
- Keep application rules scoped under their application root. Use class
  selectors, no IDs, and at most two levels of selector nesting.
- Name classes for a component, role, or state instead of their current visual
  appearance.
- Avoid `!important`. Permit it only when an accessibility or platform
  contract must override arbitrary authored rules, such as `[hidden]` or
  reduced motion, and document the Stylelint exception beside it.
- Keep responsive rules near the selectors they change and preserve usability
  from 320 px upward. Prefer mobile-first rules for new isolated layouts; do
  not churn working layouts solely to reverse existing media queries.
- Add a mixin, function, or variable only after a repeated semantic pattern
  exists. Do not abstract a one-off value or replace clear CSS with Sass math.
- Put genuinely component-specific rules in the component's `styles.scss`.
  Keep shared area entry points in `styles/{editor,host,shell}.scss` and split
  them into cohesive area-prefixed partials when needed. Do not create or import
  an empty placeholder stylesheet.
- Explain non-obvious constraints, not syntax. Delete commented-out code.

## Audit

Search all SCSS for deprecated imports, literal colors outside the palette,
IDs, `!important`, excessive nesting, empty files, unused imports, repeated
values, and accessibility regressions. Treat automated findings as leads:
inspect the compiled selector and caller before changing behavior.

## Sources

- Prefer current [Sass modules](https://sass-lang.com/documentation/at-rules/use/),
  [shallow nesting](https://sass-lang.com/documentation/style-rules/), and the
  official [`@import` deprecation](https://sass-lang.com/documentation/breaking-changes/import/).
- Preserve
  [reduced-motion accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).
- Treat the supplied [DEV article](https://dev.to/liaowow/8-css-best-practices-to-keep-in-mind-4n5h)
  and [Medium article](https://medium.com/@shahbishwa21/mastering-scss-the-correct-way-to-use-scss-in-your-projects-3a5cbc53e45b)
  as background reading, not authority; adapt their advice to current Sass and
  this repository.
