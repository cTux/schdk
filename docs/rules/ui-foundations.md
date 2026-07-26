# UI foundations

- Keep reusable components, composed views, SCSS, tokens, and assets in
  `@schdk/ui`; application packages own state and platform integration.
- Render interactive controls in application packages only through exported
  `@schdk/ui` components. Native interactive JSX elements belong inside UI
  atoms and composed UI components, never directly in application packages.
- Build screens from the smallest practical components. Extract coherent
  controls, repeated structures, and stateful interactions; keep one-off
  wrappers inline.
- Keep rendering pure, derive values during render, keep transient state local,
  and use Effects only to synchronize with external systems.
- Treat `memo`, `useMemo`, and `useCallback` as performance optimizations, not
  correctness guarantees. Keep dependencies complete and use memoization where
  it skips meaningful work or stabilizes a value for an identity-sensitive
  consumer; do not cache trivial work.
- Keep composed views controlled through typed data and callbacks. UI
  components must not read storage, Electron APIs, or the filesystem.
- Reuse existing visual tokens and interaction patterns. Prefer compact,
  readable layouts without decoration that carries no information.
- Render amber primary actions with the shared `Button` `primary` variant;
  keep its visual states in the atom instead of application-scoped selectors.
- Every atom owns the base styles required to render correctly in isolation;
  composed-view styles may refine an atom but must not be its only styling
  source.
- Render every multiline text input through the shared `Textarea` atom. Keep
  its dropdown-aligned chrome and focus states consistent across surfaces and
  do not expose native resize handles.
- Define the complete light and dark color palettes in `styles/light.scss` and
  `styles/dark.scss`. Other SCSS files must consume those theme variables
  instead of declaring color values.
- Load Sass modules with `@use` or `@forward`, keep selector nesting at two
  levels or fewer, and use class selectors instead of IDs.
- Avoid `!important` except for documented accessibility or platform
  overrides, including `[hidden]` and reduced-motion rules.
- Create and import a component `styles.scss` only when it emits
  component-specific CSS; do not keep empty stylesheet placeholders.
- Use the shared ink/plum chrome, amber brand actions, periwinkle interaction
  states, warm canvases, soft elevation, and restrained translucent overlays.
- Keep action bars compact and icon-only with Ukrainian accessible labels shown
  by the shared tooltip on hover and keyboard focus.
- Preserve semantic elements, labels, `aria-*` state, visible focus, disabled
  states, native behavior, and `prefers-reduced-motion`.
- Use shared custom dialogs instead of browser alerts or confirms. Dialogs must
  dim the background, clearly state the action, and show explicit choices with
  the contrasting primary action focused by default.
- Keep editor and shell layouts usable from 320 px upward. Use Flexbox, not CSS
  Grid.
- Use individual Font Awesome free icons for controls and navigation. Keep
  product branding separate and decorative images outside the accessibility
  tree.
- Use the shared owl only for SCHDK branding and favicons.
- Scope application-specific styles under each application root to prevent
  collisions between lazy components.
- Keep contextual copy in its composed view, not atoms. Read user-visible copy
  from the shared Ukrainian/English locale context, default to Ukrainian
  outside the unified application, and use `Провести гру` / `Host a game` as
  the localized host area names.
