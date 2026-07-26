# Desktop application

Status: implemented

## Goal

Deliver the unified SCHDK experience as a safe Windows application with native
save and presenter-window integration.

## Requirements

- **DSK-1:** The application opens maximized, without an application menu, and
  uses the shared SCHDK owl icon.
- **DSK-2:** Packaged builds load the unified web assets from application
  resources; development builds load a freshly built unified web application.
- **DSK-3:** Renderer-created windows and navigation away from trusted bundled
  content are blocked.
- **DSK-4:** During a game, a separate always-on-top presenter window shows only
  current question number and private host notes, preferring another display.
- **DSK-5:** Closing the presenter window suppresses it for the current game;
  the next game may open it again.
- **DSK-6:** Active shell view, Drive package ID, selected question, and exact
  game stage restore after normal or unexpected shutdown.
- **DSK-7:** Closing with an open editor asks the renderer to save before the
  window is destroyed.
- **DSK-8:** Save failure or a ten-second timeout offers retry, close without
  saving, or cancel, and ignores late results from older close attempts.
- **DSK-9:** Native filesystem writes occur only through explicit package
  download with a save dialog.
- **DSK-10:** Desktop Google authorization and package operations use narrow,
  validated Electron bridges.
- **DSK-11:** Windows packaging produces an unpacked application under
  `dist/release/win-unpacked`.
- **DSK-12:** A user AI API key persists in the current Google account's
  separate Drive app data. Renderer IPC can save, remove, or query its presence
  but never read the stored value; a legacy `safeStorage` value migrates once
  after Drive connection.
- **DSK-13:** Each Windows GitHub Release contains version-matched x64 NSIS
  installer and portable executable assets plus release notes sourced from the
  matching Ukrainian changelog section.

## Invariants

- Renderer and subframes have no Node integration.
- `contextIsolation` stays enabled.
- IPC validates operation names and arguments; generic IPC and authenticated
  requests are not exposed.
- Desktop restoration never persists or reconstructs local package paths.
- Developer tools are unavailable in packaged applications.

## Acceptance

1. Restart from each shell view and from an active editor or game; restore the
   same Drive-backed location.
2. Close during pending edits and exercise save success, retry, discard, cancel,
   and timeout outcomes.
3. Start a game with host notes on a second display, dismiss the presenter, and
   verify it can return in the next game.
4. Attempt renderer navigation, a new window, malformed IPC, and a filesystem
   write outside explicit download; each is rejected.
5. Save, replace, and remove an AI API key; restart between operations and
   verify only its configured status crosses into the renderer, then switch
   Google accounts and verify the prior account's key is not exposed.
6. Create a release from `main`; verify its tag, Ukrainian notes, installer,
   portable executable, and embedded application versions all match.
