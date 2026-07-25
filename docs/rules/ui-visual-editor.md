# Visual editor UI

- Reuse the host's game-element components and styles for previews.
- Keep main and alternative answers as separate draggable elements. Keep the
  game logo visible through every question stage with an upper-left default.
- Use a full-size dark workspace with a pannable, wheel-zoomable 16:9 game
  container.
- Persist bounds as percentages and apply identical bounds and presentation
  settings in gameplay. Keep the standard layout until changed.
- Let every built-in and custom element be marked hidden while remaining
  editable in the visual editor; omit hidden elements only from gameplay.
- Keep resize and property controls outside the transformed game container.
  Resize from invisible border zones and keep the grabbed point under the
  pointer.
- Wrap previews in a click-blocking target with a permanent transparent 2 px
  inset border; change only its color on selection so content never shifts.
- Clip overflow, keep the selected wrapper above others, and show its text or
  image controls in a fixed toolbar.
- Select the game canvas by default and restore it with Escape. Its toolbar
  owns the optional background image and opacity.
- Keep the add-elements rail permanently compact. Explain each icon with the
  shared tooltip on hover and focus. Support editable text and optional image
  elements, persist their bounds and presentation, and render them in gameplay.
- Share measured text-height fitting between the visual editor and gameplay.
