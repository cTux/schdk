# Web applications

## Renderer boundaries

- Web packages contain React state and platform-neutral browser behavior. They
  must not import Electron or Node APIs.
- Render all visual UI through `@schdk/ui`; do not add app-local component or
  stylesheet copies to `*-web-app` packages.
- Keep `window.desktop` optional and declare its narrow shape in the relevant
  `electron.d.ts` file.
- File-open controls must always invoke a visible native chooser. Use the
  renderer's hidden `<input type="file" accept=".schdk">`, clear its value
  after handling, and also support drag-and-drop.
- Reuse the shared package start view for editor and host. The host omits
  package creation, accepts only structurally valid and complete packages, and
  keeps up to 20 browser recent copies in its own IndexedDB database.
- After a host package opens, show a spoiler-free pre-game summary before
  gameplay. Limit it to the package title, filename, aggregate counts, and
  start/back actions; do not render question, answer, comment, or host-note
  text there.
- Starting a game requests fullscreen on the host root so the unified shell is
  excluded. Keep a fixed full-viewport fallback when fullscreen is denied.
- Advance each question through intro, optional handout, question, timer,
  optional answer comment, and answer stages. Revealed question content remains
  visible until the next question begins.
- Lock mouse and keyboard navigation through every exit/enter animation.
  `Space`, `PageDown`, and `ArrowRight` advance; `Backspace`, `PageUp`, and
  `ArrowLeft` go back.
- The question timer runs for 60 wall-clock seconds. Play the main signal on
  start and expiry and the pre-alarm when 10 seconds remain.
- Keep game signal volume in the shell's Game options, persist it in
  localStorage, and default it to 40%.
- Persist visual-editor positions, sizes, element background images, and
  presentation settings as
  validated viewport percentages and values in the shell options. Keep the
  standard host layout until the user changes an element and apply the same
  bounds and settings to the game without changing question stages.
- After the final answer, show `Дякуємо за гру!`; returning to games exits
  fullscreen and restores the package chooser and recents.
- Keep HTML language metadata and user-visible copy Ukrainian. Use the shared
  owl asset from `@schdk/ui` as the favicon.
- Keep Vite `base` relative so built apps work from Electron `file:` URLs.
- Reflect an opened browser package in the `package` URL query parameter. A
  unified-shell deep link with this parameter must open the editor view before
  loading the referenced package.

## Unified shell

- Root `pnpm dev` starts `@schdk/all-web-app`.
- Unified development uses the strict fixed shell address `127.0.0.1:5173`.
  Fail clearly instead of silently switching ports.
- Export the host and editor root components from their standalone packages and
  load them with `React.lazy`; do not embed them with iframes or copy their
  standalone builds into the unified output.
- Load an application chunk only after it is first selected, then keep its
  component mounted so switching shell views does not discard state.
- Preserve keyboard-accessible shell navigation while composing application
  components in the shared renderer.
- Group the host and editor pages under `ЩДК` in the fixed shell sidebar, using
  `Провести гру`, `Редагувати питання`, and `Візуальний редактор`. Keep the Options entry at the
  bottom. Nest `Проведення гри` and `Редагування питань` settings beneath the
  primary `ЩДК` tab, and persist editor text options in localStorage for both
  browser and unified desktop runs.
