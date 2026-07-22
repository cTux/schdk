# SCHDK UI

`@schdk/ui` owns the visual layer shared by all SCHDK web applications:
components, styles, design tokens, assets, and UI rules. Application packages
own state, persistence, routing, and platform integration.

## Rules

- Keep all reusable UI components, composed views, SCSS, design tokens, and
  visual assets in this package. Web application packages own state and
  platform integration, not duplicate markup or styles.
- Build screens from the smallest practical components; keep atoms independent
  of application state and platform APIs.
- Keep composed views controlled through typed data and callbacks. Do not read
  browser storage, Electron APIs, or the filesystem from UI components.
- Reuse the package's color tokens, typography, spacing, radii, and interaction
  patterns before introducing a new visual treatment.
- Prefer compact, readable layouts and omit decoration that carries no
  information.
- Preserve semantic elements, labels, `aria-*` state, visible keyboard focus,
  disabled states, and native control behavior.
- Keep editor and shell layouts usable from 320 px upward, and honor
  `prefers-reduced-motion`.
- Keep the shell sidebar fixed to the viewport while application content
  scrolls independently.
- Use Flexbox for UI layout. Do not use CSS Grid.
- Use Font Awesome for icons inside controls and navigation. Import individual
  icons from the free SVG packages; keep product branding as separate assets.
- Use the shared owl only for SCHDK branding and favicons. Keep decorative
  images and icons out of the accessibility tree.
- Keep save-state colors consistent: green for saved, amber for pending, blue
  for saving, and red for failure. Pair color with visible text and a live
  status role.
- Keep the package title and save state on the right side of the editor header.
  Do not restore the removed header completion counter.
- Place the optional handout before the question text in the question editor.
- Keep the file-open drop zone compact: at most 250 px tall, shrinking further
  on short viewports. Keep recent packages below it, never inside it.
- On question-number hover or focus, show completed question-and-answer text in
  a custom tooltip. Show unresolved remarks below the question in red and mark
  their question number with a dark-red border and background. Keep tooltips
  fully visible within the active layout instead of clipping their content.
  Hovering or selecting a question number may change only its border, never its
  background. Use a 2 px border for every question number.
- Put shared visual changes here instead of adding app-local components or
  styles.
- Scope application-specific styles under each application's root class so
  lazy components can share the unified document without CSS collisions.
- Keep user-facing text in the composed view that owns its context; atoms must
  not hard-code product copy.
- Keep user-facing copy Ukrainian. Do not add transient save, cancel, or
  download success messages; preserve actionable validation and file errors.

The project-wide rule index is [`docs/RULES.md`](../../docs/RULES.md).
