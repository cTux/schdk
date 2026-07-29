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
- Keep the visible status indicator and show localized success toasts after
  completed package actions. Canceled and failed actions show no success toast;
  keep actionable validation and file-operation errors.
- A new package needs a destination before entering the editor. Canceling the
  save dialog leaves the start screen unchanged.
- Reject oversized image handouts before reading them, validate their generated
  data URLs, and confirm the complete candidate package remains serializable
  before changing package state.
- Reject oversized music breaks before reading them into memory.
- Bind asynchronous image and AI-generation results to the package session
  that started them; closing or switching packages invalidates unfinished
  results.
- Keep each filename synchronized with its filesystem-safe package title and
  the `.schdk` extension, within the Drive filename limit.
