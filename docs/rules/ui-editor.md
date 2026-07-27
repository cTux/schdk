# Editor UI

- Show save state with text and a live status role: green `saved`, amber
  `pending`, blue `saving`, and red `error`.
- Keep editor and host headers compact around their visible controls without
  decorative empty padding. Keep package title and save state on the editor
  header's right. Do not restore the completion counter or add transient save,
  cancel, or download success messages; keep actionable validation and file
  errors.
- Place the optional image-or-text handout before question text. Show no image
  filename, put remove below the image thumbnail or text field, and open a
  100–400% zoomable, pannable full-size modal from the thumbnail.
- Put Font Awesome copy, paste, and trailing clear actions beside the question
  heading. Copy all question fields as JSON; confirm before parsing clipboard
  JSON and replacing the selected question. While the editor is open,
  `Ctrl+C` and `Ctrl+V` invoke those same question actions.
- Put the AI generation icon beside the question heading. Disable it when no
  API key is configured and explain the disabled state with the shared custom
  tooltip. Its modal dims the background, selects an enabled `AIQuestion`
  template, accepts context, and disables every control while generation is
  pending. Successful structured output replaces every question field, resets
  the modal, and closes it.
- Put the package-generation icon beside the editable package title. Its modal
  chooses missing questions or the whole package and one or more enabled AI
  question packages. Generate slots sequentially, select the active slot
  behind the modal, wait for each provider response, replace the complete
  question record, and continue to the next slot.
- Label optional fields. A non-empty unresolved remark keeps a question
  unfinished. Give question, remark, answer, and answer-comment text areas the
  same default height.
- Let authors add optional alternative and wrong answer lists.
- Let each package slot select `Звичайне`, `Бліц 2×30`, or `Бліц 3×20`.
  Standard questions have one text part; blitz questions have two or three
  separate text parts and still share one answer.
- Keep the file-open drop zone compact and at most 250 px tall. Keep recents
  below it and show non-interactive skeleton rows while Drive recents load.
- In recents, show only the package title and fall back to the filename without
  `.schdk` for legacy entries. Show `Готовий` only when shared validation finds
  no missing fields or unresolved remarks. Give every recent row separate
  icon-only download and red cloud-delete buttons with localized accessible
  names. Confirm deletion and move the package to Google Drive trash. While a
  recent package opens or deletes, animate that row and disable all other
  start-screen actions until the Drive request settles.
- On question-number hover or focus, show completed question and answer text in
  a tooltip that stays within the layout. Show unresolved remarks below the
  question in red and mark their number dark red without a red border.
- Question-number hover and selection may change only its 2 px border. Hide
  tooltips while pressing or dragging.
- Dragging one question number onto another swaps complete records while the
  selection follows the same question.
- Between rounds 1–2 and 2–3, let the author add, replace, or remove one audio
  file. Offer `audio/*` and reject files the native player cannot play.
