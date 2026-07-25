# Shared browser application boundaries

- Web packages contain React state and platform-neutral browser behavior. They
  must not import Electron or Node APIs.
- Render all visual UI through `@schdk/ui`; do not add app-local component or
  stylesheet copies to `*-web-app` packages.
- Keep `window.desktop` optional and declare its narrow shape in the relevant
  `electron.d.ts` file.
- File-open controls must always invoke a visible native chooser. Use the
  renderer's hidden `<input type="file" accept=".schdk">`, clear its value
  after handling, and also support drag-and-drop.
- Keep standalone application copy Ukrainian. The unified shell supports
  Ukrainian and English, updates its HTML language metadata to the selected
  locale, and leaves embedded application copy Ukrainian until those
  applications are localized. Use the shared owl asset from `@schdk/ui` as the
  favicon.
- Keep Vite `base` relative so built apps work from Electron `file:` URLs.
