# Editor UI

- Show save state with text and a live status role: green `saved`, amber
  `pending`, blue `saving`, and red `error`.
- Keep editor and host headers compact around their visible controls without
  decorative empty padding. Keep package title and save state on the editor
  header's right. Do not restore the completion counter. Show localized
  success toasts for completed editor actions, but not for canceled or failed
  actions; keep actionable validation and file errors.
- Place the optional image-or-text handout before question text. Show no image
  filename, put remove below the image thumbnail or text field, and open a
  100–400% zoomable, pannable full-size modal from the thumbnail.
- Render text handouts in the editor with a monospace font so character
  alignment stays stable.
- Put Font Awesome copy, paste, and trailing clear actions beside the question
  heading. Render the clear action as a red danger button. Copy all question
  fields as JSON; confirm before parsing clipboard JSON and replacing the
  selected question. While the editor is open,
  `Ctrl+C` and `Ctrl+V` invoke those same question actions only when no input,
  textarea, select, or editable element has focus. After a successful copy or
  paste, show the corresponding localized `react-toastify` success toast styled
  with the current SCHDK theme.
- Put the AI generation icon beside the question heading. Disable it when no
  API key is configured and explain the disabled state with the shared custom
  tooltip. Its panel opens non-modally, docked to the editor's right with the
  same full-height chrome as the left navigation and no blocking backdrop,
  while the editor stays centered with equal spacing from both docks, and
  selects an enabled `AIQuestion`
  template and a very easy, easy, medium, hard, or very hard difficulty,
  selects recognizability across the same range, accepts context, and disables
  every control while generation is pending. Pass the selected difficulty and
  recognizability into the provider prompt; default generation flows without
  explicit selectors to medium difficulty and easy recognizability. Successful
  structured output keeps question text and answer comments natural and free
  of template construction labels, replaces every question field, records the
  selected rule name, difficulty, and recognizability on the question, resets
  the panel, and closes it. While
  generation runs, keep only its target question disabled until completion;
  ready questions remain editable. Show read-only generation parameters in the
  editor whenever they are present.
- Put personal question-database search beside the question heading. Search
  question and answer text after two entered characters and show the shared
  question, answer, and included-packages table. Selecting a result loads the
  complete source question immediately when the current slot is empty and
  requires confirmation before replacing a populated slot.
- Put the package-generation icon beside the editable package title. Its panel
  opens docked to the editor's right and chooses missing questions, questions
  with unresolved author remarks, or the
  whole package and one enabled AI question package from a dropdown. It also
  selects difficulty and recognizability from very easy through very hard. When
  regenerating remarked questions, include the current question and remark in
  the prompt and clear the remark after resolving it. Generate slots
  sequentially, select the first target when generation starts, wait for each
  provider response, replace the complete question record with its selected
  rule, difficulty, and recognizability metadata, and continue to the next
  slot without taking selection away from the author. Keep unfinished target
  questions disabled, unlock each generated question for editing immediately,
  and close the panel after the final question succeeds.
- Put a red cloud-delete button after package generation in the editable
  package-title row. Confirm it before moving the active package to Google Drive
  trash and returning to the package list.
- Keep a similarity-check toggle in both question and package generation
  panels. Default it to off each time the panel opens. When enabled, refresh
  the current account's question database, reject semantically similar
  generated questions or answers, and regenerate once before reporting
  failure.
- Label optional fields. A non-empty unresolved remark keeps a question
  unfinished. Host notes contain only delivery instructions visible to the
  host while reading the question, such as pronunciation, omitted text,
  audible punctuation, pauses, or cues; they are not answer-review notes.
  Show only the host-notes field directly below the answer row, without a
  separate section title.
  Give question, remark, answer, and answer-comment text areas the same default
  height.
- Let authors add optional alternative and wrong answer lists. Keep each add
  action inline with its list title instead of rendering a separate button
  below the list.
- Let each package slot select `Звичайне`, `Бліц 2×30`, or `Бліц 3×20`.
  Standard questions have one text part; blitz questions have two or three
  separate text parts and still share one answer.
- Keep the file-open drop zone compact and at most 250 px tall. Keep recents
  below it and show non-interactive skeleton rows while Drive recents load.
- In recents, show only the package title and fall back to the filename without
  `.schdk` for legacy entries. Show `Готовий` only when shared validation finds
  no missing fields or unresolved remarks. Show `Має зауваження` when any
  question has an unresolved author remark. Show `Розробляється` when a package
  is unfinished and has no unresolved remarks. Give every recent row separate
  icon-only download and red cloud-delete buttons with localized accessible
  names. Confirm deletion and move the package to Google Drive trash. While a
  recent package opens or deletes, animate that row and disable all other
  start-screen actions until the Drive request settles.
- On question-number hover or focus, show completed question and answer text in
  a tooltip that stays within the layout. Show unresolved remarks below the
  question in red and mark their number dark red without a red border. Mark
  AI-generated questions blue unless an invalid or unresolved-remark state
  takes priority.
- Question-number hover and selection may change only its 2 px border. Hide
  tooltips while pressing or dragging.
- Dragging one question number onto another swaps complete records while the
  selection follows the same question.
- Give each tour an optional single-line field whose placeholder is
  `Фраза туру` / `Tour phrase`, without a separate visible label, and keep it
  on the same row as `Тур N` / `Tour N`. Between tours 1–2 and 2–3, let the
  author add, replace, or remove one audio file. Offer `audio/*` and reject
  files the native player cannot play. Keep the sticky question navigation
  vertically compact enough to remain visible on short desktop viewports.
