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
- Keep standalone applications Ukrainian by default. The unified application
  localizes all shell, settings, editor, host, gameplay, and visual-editor copy
  in Ukrainian and English through the shared `@schdk/ui` locale context.
  Update HTML language metadata and document copy with the selected locale.
  Use the shared owl asset from `@schdk/ui` as the favicon.
- Keep Vite `base` relative so built apps work from Electron `file:` URLs.
- Declare a default-deny Content Security Policy in each HTML entry point and
  add external origins only for integrations used by that application.
- Publish the unified web build from `packages/all-web-app/dist` to GitHub
  Pages; keep asset paths compatible with the repository subpath.
