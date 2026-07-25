# Browser editor persistence

- Prefer the File System Access API and fall back to Blob download. Treat save
  dialog `AbortError` as cancellation.
- Store pending recovery drafts in `localStorage`, keyed by filename. Offer to
  restore a valid matching draft and remove rejected or invalid drafts.
- Remove a draft only after the latest package version saves successfully.
- Store up to 20 saved copies in IndexedDB, newest first, with title metadata.
  Recents reopen stored copies, not unrestricted disk paths.
- Browser deep links identify an IndexedDB copy by recent-package ID. Restore
  it when available; clear unavailable links without disk access.
- IndexedDB failures must not prevent opening or saving packages.
- Browser pending changes trigger a save dialog before returning to start;
  cancellation keeps the package open.
