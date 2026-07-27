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
  handouts and the two between-round audio files. Invalid handouts and
  oversized audio selections never mutate package state.
- **EDT-5:** Authors can copy a complete question as JSON, replace another
  question from parsed clipboard JSON after confirmation, and clear every
  field of the selected question. `Ctrl+C` and `Ctrl+V` invoke the same copy
  and paste actions while the editor is open and no editable field has focus.
  A successful copy or paste shows a localized toast using the active
  application palette for two seconds; cancellation or failure does not.
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
  desktop restart when still available. A failed restoration clears only that
  account's scoped session.
- **EDT-15:** The browser warns before unloading an open package with pending,
  saving, or failed changes and stops warning after the package is saved.
- **EDT-16:** An AI icon beside the selected question opens a dimmed modal with
  an account or global `AIQuestion` template selector and context field. Without
  a saved key the icon is disabled with an explanatory custom tooltip. Generation
  disables the complete modal, shows a thinking state, and on success replaces
  every generated question field before the modal resets and closes. The one
  global rule marked as general is excluded from the selector and prepended to
  every selected template's generation instructions and examples. An
  allowlisted administrator can expand the modal beside its title to inspect
  the exact system and user prompt text in a read-only field; the wider
  two-column layout stacks vertically on narrow screens.
- **EDT-17:** Every multiline package and generation field uses the same
  non-resizable shared control with dropdown-aligned borders, surfaces, hover,
  focus, and disabled states.
- **EDT-18:** AI generation requires a non-empty answer comment. An AI icon
  beside the editable package title opens a modal that selects missing
  questions or the whole package and one enabled AI question package from a
  dropdown. Only a missing question part or answer makes a question missing;
  optional fields do not.
  It selects each target slot behind the modal, waits for a validated provider
  response, joins overflow text into the last part allowed by the declared
  question type, replaces the complete question record, and continues sequentially.
  A failed request keeps questions generated before the failure.

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
7. Select a music break above the package entry limit and observe it rejected
   before the file is read.
8. Fail restoration for one account and observe its stale session cleared
   without changing another account's session.
9. With and without an AI key, inspect the generation icon and tooltip. With a
   key, generate from an enabled template and context, observe the blocked
   thinking state, and confirm every returned field replaces the selected
   question.
10. Inspect every multiline editor and generation field at normal and narrow
    widths; confirm consistent shared styling and no native resize handle.
11. Open generation as an allowlisted administrator, expand the prompt panel,
    and confirm its read-only text follows changes to the selected template and
    context. Confirm the control is absent for other accounts.
12. Generate only missing slots and then the whole package after selecting one
    AI question package from the rules dropdown. Observe each target slot
    selected in order, every generated record replaced completely, and prior
    successful results retained when a later request fails.
13. Clear a populated question from its trailing heading action, then use
    `Ctrl+C` and `Ctrl+V` anywhere in the open editor and observe the same copy
    and confirmed paste behavior as the heading actions. Confirm each
    successful action shows its matching localized toast in the active theme
    for two seconds and cancellation or failure shows none. Focus each editable
    field and confirm the shortcuts keep the browser's native field-level copy
    and paste behavior instead.
