# Gameplay UI

- Keep the pre-game summary spoiler-free: title, filename, aggregate
  round/question/handout counts, and start/back actions only.
- Keep gameplay projector-first and fullscreen: centered animated intro;
  full-screen handout shrinking to the upper right; gradient question above a
  stable timer; comment below; answer at the bottom.
- Scale question text down from its configured size to fit its viewport-height
  slot without shrinking below the readable fitting limit.
- Render all revealed blitz parts inside the single persisted question layout
  bounds, stacking each new part below the previous parts.
- Preserve cumulative stages, disable controls during transitions, and show
  configured hotkeys in the controls.
- Keep separate signal-volume and music-volume sliders with current percentages
  in Game options.
- Render configured between-round audio on a dedicated music-break slide with
  native controls.
- Give image and text handouts the answer gradient and a soft black shadow
  without a border. Align images bottom-right and center text.
- Render text handouts with a monospace font so character alignment stays
  stable.
- Render the main answer prominently with smaller alternative answers above it.
  Show wrong answers in the same area in red.
