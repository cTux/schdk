# Desktop editor persistence

- Persist only the current Drive file ID, Drive filename, and selected question
  continuously. Never persist or restore a local package path.
- Clear a failed restoration from the same account-scoped session key that
  supplied it.
- List and reopen recent packages through the Drive bridge only.
- Autosave only to the current Drive file after one quiet second.
- Serialize writes through one queue. An older write finishing must leave newer
  edits `pending`.
- Save before returning to start, then clear state.
- Window close requests a renderer save and waits for its result; timeout and
  recovery behavior live in [desktop-apps.md](desktop-apps.md).
- A local `.schdk` chooser is an import-to-Drive flow. The native save dialog
  is exposed only by the explicit recent-package download action.
