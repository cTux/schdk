# Editor state

- The editor controller owns package state; `@schdk/ui` receives data and
  callbacks and must not persist files.
- Every package mutation sets save status to `pending` and clears stale errors.
- Apply enabled text correction only on blur. Trim corrected values; capitalize
  configured question, answer, alternative-answer, and answer-comment fields.
  Add missing ending punctuation only to questions and answer comments. Remove
  trailing periods from main and alternative answers while preserving other
  punctuation.
- Preserve `saved`, `pending`, `saving`, and `error` states.
- Keep the visible status indicator, but no transient save, cancel, or download
  success messages. Show actionable validation and file-operation errors.
- A new package needs a destination before entering the editor. Canceling the
  save dialog leaves the start screen unchanged.
- Validate selected image handouts and their generated data URLs before
  changing package state.
- Reject oversized music breaks before reading them into memory.
- Keep each filename synchronized with its filesystem-safe package title and
  the `.schdk` extension.
