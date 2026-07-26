# Package editor

Status: implemented

## Goal

Let an author create, revise, recover, and exchange complete game packages
without losing in-progress work.

## Requirements

- **EDT-1:** Starting a new package creates 36 question slots and obtains a
  Google Drive destination before opening the editor.
- **EDT-2:** Authors can edit the package title and every field defined by the
  [game-package specification](game-package.md).
- **EDT-3:** Question type selection exposes one, two, or three question parts
  for standard, 2×30 blitz, or 3×20 blitz respectively.
- **EDT-4:** Authors can add, replace, and remove text or validated image
  handouts and the two between-round audio files. Non-image selections never
  mutate package state.
- **EDT-5:** Authors can copy a complete question as JSON and replace another
  question from parsed clipboard JSON after confirmation.
- **EDT-6:** Dragging one question number onto another swaps the complete
  question records and keeps the moved question selected.
- **EDT-7:** Question navigation shows readiness, unresolved remarks, and a
  completed-question preview without exposing stale data.
- **EDT-8:** Enabled text correction runs on blur for configured question,
  answer, alternative-answer, and answer-comment fields.
- **EDT-9:** Every mutation becomes pending and autosaves to the same Drive file
  after one quiet second; older completed writes cannot mark newer edits saved.
- **EDT-10:** The visible save state is saved, pending, saving, or error.
- **EDT-11:** The start screen opens local `.schdk` files through a visible
  chooser or drag-and-drop, validates them, and imports them to Drive.
- **EDT-12:** Recents show Drive packages, readiness, download, and confirmed
  cloud deletion. Opening or deleting one row blocks conflicting start actions.
- **EDT-13:** Explicit download exports the latest Drive copy without changing
  the editor's backing file.
- **EDT-14:** The selected Drive package and question restore after refresh or
  desktop restart when still available.
- **EDT-15:** The browser warns before unloading an open package with pending,
  saving, or failed changes and stops warning after the package is saved.

## Invariants

- The current document remains Drive-backed; failed writes never silently
  switch destination.
- Returning to start saves before clearing editor state.
- Actionable validation and file errors stay visible; success notifications do
  not replace the save-state indicator.
- Package filenames track the filesystem-safe title.

## Acceptance

1. Create, edit, autosave, reload, and reopen the same Drive package.
2. Import a local package, edit it, and export the current Drive copy.
3. Interrupt autosave with a newer edit and observe pending state until the
   newer content is saved.
4. Cancel package creation or encounter a failed Drive write without losing or
   redirecting the current document.
5. Edit a browser package and observe an unload warning until autosave
   completes.
6. Select a file without an image MIME type and observe it rejected without
   changing or autosaving the current handout.
