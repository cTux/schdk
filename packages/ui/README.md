# SCHDK UI

`@schdk/ui` owns the visual layer shared by all SCHDK web applications:
components, styles, design tokens, assets, and UI rules. Application packages
own state, persistence, routing, and platform integration.

## Rules

- Build screens from the smallest practical components; keep atoms independent
  of application state and platform APIs.
- Reuse the package's color tokens, typography, spacing, radii, and interaction
  patterns before introducing a new visual treatment.
- Prefer compact, readable layouts and omit decoration that carries no
  information.
- Keep keyboard focus visible and preserve native control semantics.
- Put shared visual changes here instead of adding app-local components or
  styles.
- Keep user-facing text in the composed view that owns its context; atoms must
  not hard-code product copy.
