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

## Unified shell

- Root `pnpm dev` starts `@schdk/all-web-app`.
- Unified development uses strict fixed addresses: shell `5173`, host `5174`,
  and editor `5175`. Fail clearly instead of silently switching ports.
- In production, copy built host and editor apps under
  `all-web-app/dist/apps/<app>` and use relative iframe URLs.
- Load an embedded app only after it is first selected, then keep it mounted so
  switching shell views does not discard its state.
- Before the editor frame exists, the shell may acknowledge a close request.
  After it exists, the editor participates in the desktop save handshake.
- Keep iframe titles descriptive and preserve keyboard-accessible shell
  navigation.
