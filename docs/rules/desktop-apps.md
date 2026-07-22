# Desktop applications

## Window behavior

- All desktop applications open maximized, remove the application menu, and
  deny renderer-created windows.
- Standalone applications block renderer navigation. The unified shell keeps
  only its fixed host/editor iframe navigation and protects editor capabilities
  with the preload URL allowlist.
- Use the same owl PNG from `editor-desktop-app/build/owl.png` for every
  desktop executable and development window.
- Development launches build the corresponding web application before opening
  Electron. Packaged applications load web assets from `process.resourcesPath`.
- Editor-capable windows enable developer tools only outside packaged
  applications.
- The standalone editor window title includes the opened filename and returns
  to the editor title when no file is open.
- Block reload shortcuts in the standalone editor because reload can discard
  renderer state outside the save handshake.

## Save-before-close protocol

- Keep standalone-editor and unified-editor file, recent, autosave, and close
  behavior aligned. When a change would duplicate substantial logic, extract a
  shared pure helper rather than letting the two implementations drift.
- Intercept ordinary window close and ask the renderer to save before calling
  `destroy()`.
- Identify close attempts with increasing integers and ignore late results from
  older attempts.
- Wait at most 10 seconds for the active renderer/editor frame.
- On timeout or save failure, offer exactly three outcomes: retry saving, close
  without saving, or cancel closing. Never leave a window permanently
  uncloseable after a renderer or IPC failure.
- In the unified app, send the close request to frames in the window subtree so
  the embedded editor can respond.

## Preload and packaging

- Keep preload files as `.cts` so TypeScript emits sandbox-compatible `.cjs`,
  and reference `preload.cjs` from `BrowserWindow`.
- The unified preload exposes only the close API to the main shell and the
  editor API only to the whitelisted editor child-frame URL. Keep routing tests
  for development and packaged URLs.
- Package Windows apps with electron-builder's unpacked `dir` target under
  `dist/release/win-unpacked`; the project does not currently build installers.
- Keep `signExecutable: false` so executable resource editing can apply the
  shared icon without requiring signing.
- Include compiled Electron files, the package manifest, required build assets,
  and the matching web build as an extra resource.

Follow the additional trust-boundary rules in [security.md](security.md).
