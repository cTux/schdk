# Editor lifecycle and persistence

## Editing and status

- The editor controller owns package state; `@schdk/ui` receives data and
  callbacks and must not persist files itself.
- Every package mutation sets the save status to `pending` and clears stale
  errors.
- Preserve the four save states: `saved`, `pending`, `saving`, and `error`.
  Their visual treatment is defined in the UI rules.
- Keep the visible status indicator, but do not add transient save, cancel, or
  download success messages. Show actionable validation and file-operation
  errors.
- A new package must be saved or assigned a destination before entering the
  editor. Canceling the save dialog keeps the start screen unchanged.
- Generated filenames use a filesystem-safe title plus local
  `HH.MM.SS` time and the `.schdk` extension to avoid duplicate download
  suffixes.

## Browser persistence

- Prefer the File System Access API when available; fall back to a Blob
  download without making file selection or editing Electron-dependent.
- Treat a browser save-dialog `AbortError` as cancellation, not failure.
- Save pending crash-recovery drafts in `localStorage`, keyed by filename.
- When the same filename is opened and a valid draft exists, ask whether to
  restore it. Remove a rejected or invalid draft.
- Remove the draft only after the latest package version is successfully saved.
- Store up to five saved browser copies in IndexedDB, newest first. Browser
  recents reopen the stored copy, not an unrestricted disk path.
- IndexedDB recents are optional: their failure must not prevent opening or
  saving packages.

## Desktop persistence

- Desktop recents contain up to five real `.schdk` paths and reopen current
  disk contents. Remove a recent entry when its file can no longer be read.
- Persisting the recent list is best-effort and must not fail a package
  operation.
- Autosave only when a desktop bridge and an authorized file path exist. Write
  after one quiet second so save feedback remains responsive while typing is
  still debounced.
- Serialize desktop writes through one queue. Completion of an older write must
  leave newer edits `pending` rather than marking them saved.
- Returning to the start screen saves desktop changes before clearing state.
  In the browser, pending changes trigger a save dialog; cancellation keeps the
  package open.
- Closing a desktop window must request a renderer save and wait for its result.
  The timeout and recovery dialog behavior are defined in the desktop rules.
