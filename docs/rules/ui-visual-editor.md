# Visual editor UI

- Reuse the host's game-element components and styles for previews.
- Keep main and alternative answers as separate draggable elements. Keep the
  game logo visible through every question stage with an upper-left default.
- Use a full-size light workspace with a pannable, wheel-zoomable 16:9 game
  container.
- Persist bounds as percentages and apply identical bounds and presentation
  settings in gameplay. Keep the standard layout until changed.
- Keep resize and property controls outside the transformed game container.
  Resize from invisible border zones and keep the grabbed point under the
  pointer.
- Wrap previews in a click-blocking target with a permanent transparent 2 px
  inset border; change only its color on selection so content never shifts.
- Clip overflow, keep the selected wrapper above others, and show its text or
  image controls in a fixed toolbar.
- Select the game canvas by default and restore it with Escape. Its toolbar
  owns the optional background image and opacity.
- Share measured text-height fitting between the visual editor and gameplay.
