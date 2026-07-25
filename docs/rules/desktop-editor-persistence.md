# Desktop editor persistence

- Keep up to 20 real `.schdk` recent paths and reopen current disk contents.
  Keep best-effort title metadata and remove unreadable entries.
- Persist the current path and selected question continuously. Restore through
  the authorized recent-file bridge and clear unavailable sessions.
- Recent-list persistence is best-effort and must not fail package operations.
- Autosave only with a desktop bridge and authorized path, after one quiet
  second.
- Serialize writes through one queue. An older write finishing must leave
  newer edits `pending`.
- Save before returning to start, then clear state.
- Window close requests a renderer save and waits for its result; timeout and
  recovery behavior live in [desktop-apps.md](desktop-apps.md).
- In the unified app, a connected Drive session stores editor packages by Drive
  file ID instead of local path. Persist that ID in the desktop editor session,
  retain pending recovery drafts locally, and use the native local save dialog
  if cloud persistence is unavailable while leaving the document.
