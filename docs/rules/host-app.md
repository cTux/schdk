# Host application and gameplay

- Reuse the shared package start view; the host omits package creation, accepts
  only structurally valid and complete packages, and keeps up to 20 browser
  recent copies in its own IndexedDB database.
- Show only the package title, filename, aggregate counts, and start/back
  actions before gameplay; never expose question, answer, comment, or host-note
  text.
- Request fullscreen on the host root so the unified shell is excluded. Keep a
  fixed full-viewport fallback when fullscreen is denied.
- Advance through intro, optional handout, question, 60-second timer, optional
  answer comment, and answer. Keep revealed content visible until the next
  question.
- Lock mouse and keyboard navigation during transitions. `Space`, `PageDown`,
  and `ArrowRight` advance; `Backspace`, `PageUp`, and `ArrowLeft` go back.
- Play the main signal when the timer starts and expires and the pre-alarm with
  10 seconds remaining.
- In the desktop application, publish the current question number and host notes
  to the separate presenter window while a game is active. Close it when the
  game ends or the host view unmounts.
- Persist game volume in shell options with a 40% default.
- Persist validated visual-editor bounds, presentation settings, and background
  settings in shell options. Use the standard host layout until changed and
  apply the same settings without changing question stages.
- Render persisted custom text and image elements with the same bounds and
  presentation used in the visual editor.
- After the final answer, show `Дякуємо за гру!`; returning to games exits
  fullscreen and restores the package chooser and recents.
