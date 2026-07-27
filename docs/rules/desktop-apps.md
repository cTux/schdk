# Desktop applications

## Window behavior

- The unified desktop application opens maximized, removes the application
  menu, denies renderer-created windows, and blocks renderer navigation.
- While hosting a game, show current host notes in a separate always-on-top
  window. Prefer another display, keep the window dismissed after the presenter
  closes it, and allow the next game to open it again.
- Use `all-desktop-app/build/owl.png` for the desktop executable and
  development window.
- Development launches build the unified web application before opening
  Electron. Packaged applications load web assets from `process.resourcesPath`.
- Enable developer tools only outside packaged applications.

## Session restoration

- Persist restorable desktop renderer state continuously so normal and
  unexpected shutdowns can resume the last location.
- Restore the active section, opened Drive file ID, and selected question.
- Restore packages only through the Drive bridge. Clear stale session state and
  show an actionable error when a remembered Drive file is unavailable.
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
- Send close requests to the main renderer only after a Drive-backed editor
  package is open. A failed Drive write continues to the standard retry,
  close-without-saving, or cancel-close outcomes without a local fallback.

## Preload and packaging

- Keep preload files as self-contained `.cts` files with no local imports so
  TypeScript emits sandbox-compatible `.cjs`; reference `preload.cjs` from
  `BrowserWindow`.
- The preload exposes the narrow Drive, close, presenter, and explicit package
  download APIs to its trusted main renderer. Do not expose local package open,
  recent-path, or autosave IPC. Do not enable Node integration for renderer
  content or subframes.
- Keep user AI API keys in the current Google account's separate Drive app
  data. Expose only save, remove, configured-status, and validated question
  generation operations to the renderer. Run generation in Electron main and
  return only the parsed question; migrate and remove a legacy `safeStorage`
  key only after a successful Drive write.
- Keep normal local packaging on electron-builder's unpacked `dir` target for
  the current host. Use `package:win`, `package:mac`, and `package:linux` only
  on their native operating systems.
- The manually dispatched `Desktop builds` workflow produces unsigned Windows
  x64, macOS x64/arm64, and Debian x64 artifacts on native runners. Keep
  unsigned artifact names explicit; macOS uploads use ZIP transport for the
  `.app` bundle plus `.pkg`, and Linux uploads use `.deb`.
- Sign every Windows GitHub Release executable through electron-builder and
  verify its Authenticode signature before upload. Sign and notarize both macOS
  app architectures and their PKGs, preserve each app in electron-builder's
  ZIP, and verify them with codesign, Gatekeeper, pkgutil, and stapler before
  upload. Local unpacked packaging may remain unsigned.
- Publish version-matched Windows x64, macOS x64/arm64, and Debian x64 assets in
  one GitHub Release only after every native packaging job succeeds.
- Include compiled Electron files, the package manifest, required build assets,
  and the matching web build as an extra resource.

Follow the additional trust-boundary rules in [security.md](security.md).
