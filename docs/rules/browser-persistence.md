# Browser editor persistence

- Package creation, import, autosave, recents, deep links, and restoration use
  Google Drive only. Do not store `.schdk` bytes or recovery drafts in
  localStorage or IndexedDB.
- Browser deep links contain only validated `drive:<fileId>` references and the
  selected question. Clear unavailable references without disk access.
- Selecting a local `.schdk` file validates and uploads it before opening it.
- Downloading a recent package loads its current Drive bytes and uses a native
  browser download. It does not change the editor's backing file.
- The editor package root has no local persistence fallback when rendered
  without an injected Drive bridge.
