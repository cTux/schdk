# Desktop applications

## Window behavior

- The unified desktop application opens maximized, removes the application
  menu, denies renderer-created windows, and blocks renderer navigation.
- Use `all-desktop-app/build/owl.png` for the desktop executable and
  development window.
- Development launches build the unified web application before opening
  Electron. Packaged applications load web assets from `process.resourcesPath`.
- Enable developer tools only outside packaged applications.

## Session restoration

- Persist restorable desktop renderer state continuously so normal and
  unexpected shutdowns can resume the last location.
- Restore the active section, opened `.schdk` path, and selected question.
- Restore files only through the authorized recent-file desktop bridge. Clear
  stale session state and show an actionable error when a remembered file is
  unavailable.
- Keep browser URL deep links and desktop session restoration separate. A
  desktop application resumes local state without encoding disk paths in URLs.

## Save-before-close protocol

- Intercept ordinary window close and ask the renderer to save before calling
  `destroy()`.
- Identify close attempts with increasing integers and ignore late results from
  older attempts.
- Wait at most 10 seconds for the active renderer/editor frame.
- On timeout or save failure, offer exactly three outcomes: retry saving, close
  without saving, or cancel closing. Never leave a window permanently
  uncloseable after a renderer or IPC failure.
- Send close requests to the main renderer only after a
  package path has been authorized. Otherwise close immediately because there
  is no desktop package state to save.

## Preload and packaging

- Keep preload files as self-contained `.cts` files with no local imports so
  TypeScript emits sandbox-compatible `.cjs`; reference `preload.cjs` from
  `BrowserWindow`.
- The preload exposes the narrow editor API to its trusted main renderer. Do
  not enable Node integration for renderer content or subframes.
- Package the Windows app with electron-builder's unpacked `dir` target under
  `dist/release/win-unpacked`; the project does not currently build installers.
- Keep `signExecutable: false` so executable resource editing can apply the
  shared icon without requiring signing.
- Include compiled Electron files, the package manifest, required build assets,
  and the matching web build as an extra resource.

Follow the additional trust-boundary rules in [security.md](security.md).
