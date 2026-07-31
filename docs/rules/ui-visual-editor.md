# Visual editor UI

- Reuse the host's game-element components and styles for previews.
- Keep main and alternative answers as separate draggable elements. Keep the
  game logo visible through every question stage with an upper-left default.
- Use a full-size dark workspace with a pannable, wheel-zoomable 16:9 game
  container.
- Keep the visual editor on its fixed dark presentation palette; application
  theme changes must not alter its canvas, controls, or text colors.
- Persist bounds as percentages and apply identical bounds and presentation
  settings in gameplay through the shared game-layout style mapper. Keep the
  standard layout until changed.
- Preview pointer drag and resize locally, then persist one final position when
  the interaction ends. Persist keyboard adjustments immediately.
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
- Share measured text-height fitting between the visual editor and gameplay,
  and never enlarge text beyond its configured size.
- Warn when fitted text cannot fit at the readable minimum size.
- Apply the question element's saved bounds to the complete stack of revealed
  blitz parts rather than positioning each part independently.
- Import and export versioned `.schdk-template` ZIP archives containing
  `template.json` with only visual layout, background, opacity, and custom
  elements. Continue importing legacy plain JSON templates and preserve
  unrelated game options such as sound volume.
