# Visual editor UI

- Reuse the neutral game-presentation components and styles shared with the
  host for previews; visual-editor code must not import from the host feature.
- Keep main and alternative answers as separate draggable elements. Keep the
  game logo visible through every question stage with an upper-left default.
- Use a full-size dark workspace with a pannable, wheel-zoomable 16:9 game
  container.
- Keep related transient interaction state (selection, pan, zoom, image target,
  message, and panning state) in one reducer; persisted game options continue
  to flow only through `onChange`.
- Keep workspace keyboard, pan, zoom, and image-input lifecycle in the visual
  editor controller hook so the composed view remains declarative.
- Keep the visual editor on its fixed dark presentation palette; application
  theme changes must not alter its canvas, controls, or text colors.
- Persist bounds as percentages and apply identical bounds and presentation
  settings in gameplay through the shared game-layout style mapper. Keep the
  standard layout until changed.
- Preview pointer drag and resize locally, then persist one final position when
  the interaction ends. Persist keyboard adjustments immediately.
- Cover selection, Escape dismissal, and wheel zoom with the Storybook-backed
  Playwright browser smoke test.
- Keep bounded undo and redo history in the web visual-editor controller, clear
  it when the connected account changes, and expose only availability and
  callbacks to `@schdk/ui`. Bound both entry count and retained serialized
  presentation size. Treat a completed pointer gesture as one change.
- Pass only layout, custom elements, background image, background opacity, and
  canvas-gradient settings through the visual-editor UI contract; preserve
  unrelated game options in the web controller.
- Keep `GameOptions` mutations in pure helpers; the React hook owns transient
  interaction state and delegates persisted model updates.
- Let every built-in and custom element be marked hidden while remaining
  editable in the visual editor; omit hidden elements only from gameplay.
- Keep resize and property controls outside the transformed game container.
  Resize only selected elements from invisible edge and corner zones, support
  diagonal resizing, and keep the grabbed point under the pointer.
- Wrap previews in a click-blocking target with a permanent transparent 2 px
  inset border; change only its color on selection so content never shifts.
- Clip overflow, keep the selected wrapper above others, and show its text or
  image controls in a fixed toolbar.
- Select the game canvas by default and restore it with Escape. Its toolbar
  owns the optional background image and opacity. Reject background and custom
  image files that cannot fit the canonical encoded-image limit before reading
  them, then validate the generated embedded data URL.
- Keep the add-elements rail permanently compact. Explain each icon with the
  shared tooltip on hover and focus. Keep add-element actions at the top and
  template import/export actions docked at the bottom. Support editable text
  and optional image elements, persist their bounds and presentation, and
  render them in gameplay.
- Never measure or scale text to fit element bounds. Render the configured size
  identically in the visual editor and gameplay and clip overflow at the fixed
  bounds.
- Keep element backgrounds transparent by default. Persist optional solid and
  directional-gradient backgrounds with opacity and corner rounding.
- Present selected-element formatting in a compact document-editor toolbar
  with direct alignment, bold, italic, and underline controls plus grouped
  typography and appearance settings.
- Apply the question element's saved bounds to the complete stack of revealed
  blitz parts rather than positioning each part independently.
- Import and export versioned `.schdk-template` ZIP archives containing
  `template.json` with only visual layout, image and gradient backgrounds,
  opacity, and custom elements. Continue importing legacy plain JSON templates
  and preserve unrelated game options such as sound volume. Compress and
  extract archives asynchronously so bounded template work does not block the
  editor interaction loop.
