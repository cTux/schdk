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
