# Host application and gameplay

- Reuse the shared package start view; the host omits package creation and
  accepts only structurally valid and complete packages.
- Show only the package title, filename, aggregate counts, and start/back
  actions before gameplay; never expose question, answer, comment, or host-note
  text.
- Request fullscreen on the host root when the enabled-by-default automatic
  fullscreen option is enabled. Keep a fixed full-viewport fallback when
  fullscreen is disabled or denied.
- Advance standard questions through intro, optional handout, question,
  60-second timer, optional answer comment, and answer. For blitz questions,
  show the first part with its timer, then reveal each next part below the
  previous ones while restarting a 30- or 20-second timer. Keep revealed
  content visible until the next question.
- Lock mouse and keyboard navigation during transitions. `Space`, `PageDown`,
  and `ArrowRight` advance; `Backspace`, `PageUp`, and `ArrowLeft` go back.
- Exit an active game with `Alt+Q` after explicit confirmation.
- Play the main signal when the timer starts and expires and the pre-alarm with
  10 seconds remaining.
- In the desktop application, publish the current question number and host notes
  to the separate presenter window while a game is active. Close it when the
  game ends or the host view unmounts.
- Persist game volume in shell options with a 5% default.
- List and load app-created packages from Google Drive only. A local file
  selected in Host must be validated, uploaded, and then hosted by Drive ID.
- Give every recent package an icon-only download action that exports the
  current Drive bytes without changing the selected package.
- Persist the selected package and exact game question/stage continuously on
  web and desktop. Restore the package by validated Drive reference and expose
  browser host state through validated deep-link query parameters.
- Persist validated visual-editor bounds, presentation settings, and background
  settings in shell options. Use the standard host layout until changed and
  apply the same settings without changing question stages.
- Render persisted custom text and image elements with the same bounds and
  presentation used in the visual editor.
- After the final answer, show the localized thank-you message; returning to
  games exits fullscreen and restores the package chooser and recents.
