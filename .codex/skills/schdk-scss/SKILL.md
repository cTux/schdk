---
name: schdk-scss
description: Write, refactor, review, or audit SCHDK SCSS. Use for .scss files, tokens, responsive rules, selectors, nesting, motion, or Stylelint policy.
---

# SCHDK SCSS

## Workflow

1. Follow `$schdk-ui`, then read `docs/rules/ui-foundations.md`.
2. Trace the owning React markup, stylesheet entry point, imported partials,
   compiled selectors, and existing tokens before editing.
3. Apply the SCSS, responsive, motion, accessibility, and ownership rules from
   `docs/rules/ui-foundations.md`.
4. Make the smallest complete change; remove unused imports or empty
   stylesheets encountered in scope.
5. Run `pnpm --filter @schdk/ui lint`, the affected build, and a browser smoke
   test at normal and 320 px widths.

## Audit

Search all SCSS for deprecated imports, literal colors outside the palette,
IDs, `!important`, excessive nesting, empty files, unused imports, repeated
values, and accessibility regressions. Treat automated findings as leads:
inspect the compiled selector and caller before changing behavior.
