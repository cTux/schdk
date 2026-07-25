# UI foundations

- Keep reusable components, composed views, SCSS, tokens, and assets in
  `@schdk/ui`; application packages own state and platform integration.
- Build screens from the smallest practical components. Extract coherent
  controls, repeated structures, and stateful interactions; keep one-off
  wrappers inline.
- Keep composed views controlled through typed data and callbacks. UI
  components must not read storage, Electron APIs, or the filesystem.
- Reuse existing visual tokens and interaction patterns. Prefer compact,
  readable layouts without decoration that carries no information.
- Use the shared ink/plum chrome, amber brand actions, periwinkle interaction
  states, warm canvases, soft elevation, and restrained translucent overlays.
- Keep action bars compact and icon-only with Ukrainian accessible labels shown
  by the shared tooltip on hover and keyboard focus.
- Preserve semantic elements, labels, `aria-*` state, visible focus, disabled
  states, native behavior, and `prefers-reduced-motion`.
- Keep editor and shell layouts usable from 320 px upward. Use Flexbox, not CSS
  Grid.
- Use individual Font Awesome free icons for controls and navigation. Keep
  product branding separate and decorative images outside the accessibility
  tree.
- Use the shared owl only for SCHDK branding and favicons.
- Scope application-specific styles under each application root to prevent
  collisions between lazy components.
- Keep contextual copy in its composed view, not atoms. Keep user-visible copy
  Ukrainian and use `Провести гру` as the host area name.
