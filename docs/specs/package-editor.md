# Package editor

Status: implemented

## Goal

Let an author create, revise, recover, and exchange complete game packages
without losing in-progress work.

## Requirements

- **EDT-1:** Starting a new package creates 36 question slots and obtains a
  Google Drive destination before opening the editor.
- **EDT-2:** Authors can edit the package title, each optional tour phrase
  through a single-line field beside the tour heading, with its name as the
  placeholder and no separate visible label, and every field defined by the
  [game-package specification](game-package.md).
- **EDT-2a:** Sticky question navigation uses compact controls and spacing so
  all three tours remain visible on short desktop viewports.
- **EDT-3:** Question type selection exposes one, two, or three question parts
  for standard, 2×30 blitz, or 3×20 blitz respectively.
- **EDT-4:** Authors can add, replace, and remove text or validated image
  handouts and the two between-tour audio files. Text handouts use a monospace
  font while editing. The handout editor has no separate heading: its hatched
  image action stays left of the text field, and both match the dimensions of
  the question and answer-comment fields. Invalid handouts and oversized audio
  selections never mutate package state. Oversized images are rejected before
  reading, and an image replaces the current handout only when the complete
  candidate package remains serializable within canonical limits.
- **EDT-5:** Authors can copy a complete question as JSON, replace another
  question from parsed clipboard JSON after confirmation, and clear every
  field of the selected question from its red trailing action. `Ctrl+C` and
  `Ctrl+V` invoke the same copy and paste actions while the editor is open and
  no editable field has focus. A successful copy or paste shows a localized
  toast using the active application palette for two seconds; cancellation or
  failure does not.
- **EDT-6:** Dragging one question number onto another swaps the complete
  question records and keeps the moved question selected.
- **EDT-7:** Question navigation shows readiness, unresolved remarks, and a
  completed-question preview without exposing stale data. Every question that
  shares a normalized main or alternative answer with another package
  question is marked red, including the first question in the duplicate group.
- **EDT-8:** Enabled text correction runs on blur for configured question,
  answer, alternative-answer, and answer-comment fields.
- **EDT-9:** Every mutation becomes pending and autosaves to the same Drive file
  after one quiet second; older completed writes cannot mark newer edits saved.
- **EDT-10:** The visible save state is saved, pending, saving, or error.
- **EDT-11:** The start screen opens local `.schdk` files through a visible
  chooser or drag-and-drop, validates them, and imports them to Drive.
- **EDT-12:** Recents show Drive packages, readiness, download, and confirmed
  cloud deletion. Ready packages, packages with unresolved author remarks, and
  unfinished packages without remarks carry distinct localized status tags.
  Opening or deleting one row blocks conflicting start actions.
- **EDT-13:** Explicit download exports the latest Drive copy without changing
  the editor's backing file.
- **EDT-14:** The selected Drive package and question restore after refresh or
  desktop restart when still available. A failed restoration clears only that
  account's scoped session.
- **EDT-15:** The browser warns before unloading an open package with pending,
  saving, or failed changes and stops warning after the package is saved.
- **EDT-16:** An AI icon beside the selected question opens a non-modal,
  full-height panel docked to the editor's right with the same chrome as the
  left navigation and no blocking backdrop. The editor stays centered with
  equal spacing from the left navigation and the generation dock. It includes
  an account or global `AIQuestion` template
  selector, difficulty and
  recognizability selectors from very easy through very hard, and a context
  field. Medium difficulty and easy recognizability are selected by default.
  Favorite templates appear first, carry a star, and are name-sorted before
  the name-sorted remainder. Without a saved key the icon is disabled with an explanatory
  custom tooltip. The selectors use shared dictionary labels. Generation
  disables the complete panel, sends the selected dictionary prompt fragments
  in the provider prompt, and shows a thinking state; on success it replaces
  every generated question field
  before the panel resets and closes. While generation runs, the target
  question stays disabled and ready questions remain editable. The prompt
  requests a text handout when
  the selected rule or context requires one, returns no handout otherwise, and
  never asks the text model to invent an image or data URL. The one global rule
  marked as general is excluded from the selector and prepended to every
  selected template's generation instructions and examples. An allowlisted
  administrator can expand the panel beside its title to inspect the exact
  system and user prompt text in a read-only field; the wider two-column layout
  stacks vertically on narrow screens. Closing or switching the source package
  invalidates the request so a late result cannot modify another package.
- **EDT-17:** Every multiline package and generation field uses the same
  non-resizable shared control with dropdown-aligned borders, surfaces, hover,
  focus, and disabled states. Its label appears as the placeholder while empty
  and moves inside the populated textarea at the bottom right without changing
  the control's height. Adjacent question-editor fields use the same horizontal
  and vertical gap.
- **EDT-18:** AI generation phrases each question naturally as if written by a
  human rather than AI and requires a non-empty answer comment that explains
  only why the answer is correct, never why the question was generated or
  phrased that way. Question text and answer comments never expose internal
  template headings, construction techniques, paths, stages, or stock
  meta-commentary such as "Both clues independently point to". An AI icon
  beside the editable package title opens a panel docked to the editor's right
  that selects missing
  questions, questions with unresolved author remarks, or the whole package
  and one enabled AI question package from a dropdown. Remarked questions are
  regenerated from the current question and remark, and a resolved result
  clears the remark. The panel distributes generated questions by percentage
  across difficulty levels from very easy through very hard, defaults to 0%,
  30%, 60%, 10%, and 0% respectively, and requires the percentages to total
  100%. Each question independently receives a difficulty according to those
  weights. Recognizability defaults to easy. Favorite packages appear first with a star and each
  favorite and non-favorite group is name-sorted. The panel also selects all,
  favorite, or non-favorite enabled non-general question rules; each question
  without an explicitly configured type uses a random rule from that set, with
  favorite rules selected by default. An
  explicitly configured per-question type still takes priority, while the
  general rule is applied separately to every generated question. Only a
  missing question part or answer makes a question missing; optional fields do
  not.
  It selects the first target when generation starts, waits for each validated
  provider response, joins overflow text into the last part allowed by the
  declared question type, replaces the complete question record, and continues
  sequentially without taking selection away from the author.
  The weighted difficulty selected for each question and the selected
  recognizability are sent for every question. The
  visible cancel action asks for confirmation, then closes the panel and
  ignores any unfinished provider result only after confirmation.
  While generation runs, the panel shows the current question, its
  package-generation percentage, and an animated progress indicator that respects
  reduced-motion preferences.
  Questions still awaiting generation are disabled; each completed question
  becomes editable immediately while the same sequence continues. The docked
  panel closes after the final question succeeds. Closing or switching the
  source package invalidates the sequence and ignores every unfinished result.
  Browser generation renews Google authorization from the confirmation click
  before the sequence starts. A failed request keeps questions generated before
  the failure. An allowlisted administrator can expand the panel beside its
  title to inspect the exact read-only prompt for the first target before
  generation and the current target while generation advances.
- **EDT-19:** Successful package creation, import, recent opening, current
  autosave, explicit download, and confirmed deletion show a localized toast
  using the active application palette for two seconds. Canceled or failed
  actions and stale writes completed before newer edits show no success toast.
- **EDT-20:** AI generation includes the answers already used by other retained
  package questions in the provider prompt. Package generation adds each
  accepted result to that set before generating the next target. Exact
  normalized duplicates are rejected locally; every other candidate undergoes
  a structured provider review that rejects materially incorrect, ambiguous,
  underclued, answer-leaking, unnatural, or instruction-violating questions;
  insufficient answer explanations; aliases, synonyms, translations,
  qualifications, or descriptive names of the same entity; and answer choices
  that worsen package variety by overusing one entity type or answer form. The
  rejected candidate and the reviewer's actionable feedback are supplied to
  one retry; a second rejection fails without replacing the target question.
- **EDT-21:** Question and package generation panels each show a similarity
  checkbox inline with its label that resets to off whenever the panel closes.
  When enabled, generation
  refreshes the connected account's question database, rejects exact answers
  locally, shortlists lexically related questions, asks the selected provider
  to reject the same entity, central fact, logic, or material clue sequence,
  and regenerates one rejected draft before failing.
- **EDT-22:** The editable package-title row ends with a red delete action
  after package generation. After confirmation it moves the active Drive
  package to trash, clears the editor state, returns to the package list, and
  refreshes recents.
- **EDT-23:** A question-and-answer search beside the selected question heading
  starts after two entered characters and shows the same question, answer, and
  included-packages table as the personal question database. Selecting a row
  loads the complete canonical source question into an empty slot immediately.
  A populated slot is replaced only after explicit confirmation.
- **EDT-24:** Every AI-generated question stores the name of the question rule,
  difficulty, and recognizability actually used for its accepted generation.
  The editor shows these three read-only parameters whenever they are present.
  They survive package saving, reopening, and complete-question clipboard
  copying; manually created and legacy questions show no generation-parameter
  block.
- **EDT-25:** The host-notes textarea appears directly below the answer row
  without a separate section title. Alternative- and wrong-answer add actions
  appear inline with their respective list titles.
- **EDT-26:** Question navigation marks AI-generated questions blue while
  preserving higher-priority invalid and unresolved-remark states.

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
6. Select a file without an image MIME type and an image above the handout
   limit; observe both rejected before changing or autosaving the current
   handout. Select an image that would make the complete package exceed its
   serialization limit and observe the current handout remain unchanged.
7. Select a music break above the package entry limit and observe it rejected
   before the file is read.
8. Fail restoration for one account and observe its stale session cleared
   without changing another account's session.
9. With and without an AI key, inspect the generation icon and tooltip. With a
   key, confirm favorite templates are starred and listed before the
   name-sorted remainder. Generate from an enabled template and context that
   requests a text handout, observe the blocked thinking state, and confirm
   every returned field, including the handout, replaces the selected question.
   Start another request, return to recents, open another package, and confirm
   the late result does not modify it.
10. Inspect every multiline editor and generation field at normal and narrow
    widths; confirm consistent shared styling, no native resize handle, label
    text as the empty placeholder, and the label inside the populated textarea
    at the bottom right.
11. Open generation as an allowlisted administrator, expand the prompt panel,
    and confirm its read-only text follows changes to the selected template,
    difficulty, recognizability, and context. Confirm the control is absent for
    other accounts.
12. Generate only missing slots, questions with unresolved remarks, and then
    the whole package after selecting one AI question package from the
    favorite-first rules dropdown and confirm favorite rules are the default
    random set before selecting each available question-rule set in turn.
    Set each difficulty to 100% in turn and select each recognizability; confirm
    both reach every provider prompt. Enter percentages that do not total 100%
    and confirm generation stays unavailable. Confirm remarked-question prompts include the current
    question and remark and accepted results clear the remark. Confirm fallback
    rules are randomly selected only from that set, while explicitly configured
    per-question types still win. Observe the first target selected at start,
    then select and edit a ready question while later targets generate without
    the selection being taken away. Confirm every generated record is replaced
    completely and prior successful results are retained when a request fails.
    Start cancellation during an unfinished
    request, dismiss its confirmation, and verify generation continues. Confirm
    cancellation and verify the unfinished result is ignored. Confirm the
    progress percentage matches the current target position,
    its activity indicator remains visibly animated between responses, and
    reduced-motion mode removes that animation. In the browser, confirm that
    generation starts with renewed Google authorization. As an allowlisted
    administrator, expand the prompt panel and confirm its read-only text follows
    the first pending target and each target being generated. Start another
    sequence, return to recents, open another package, and confirm unfinished
    results do not modify it.
13. Clear a populated question from its trailing heading action, then use
    `Ctrl+C` and `Ctrl+V` anywhere in the open editor and observe the same copy
    and confirmed paste behavior as the heading actions. Confirm each
    successful action shows its matching localized toast in the active theme
    for two seconds and cancellation or failure shows none. Focus each editable
    field and confirm the shortcuts keep the browser's native field-level copy
    and paste behavior instead.
14. Create, import, reopen, edit, download, and delete packages and confirm
    each completed action shows its matching localized toast for two seconds.
    Cancel the desktop download, fail an action, and complete a stale autosave
    while a newer edit remains pending; confirm none shows a success toast.
15. Generate one question and a complete package whose existing slots already
    contain answers. Confirm every provider prompt excludes retained and
    accepted answers. Return an exact duplicate, an alias or descriptive name
    of an existing entity, an answer that worsens an overrepresented type or
    form, an ambiguous or underclued question, and an unsupported answer
    explanation; confirm each is rejected with its candidate and actionable
    feedback supplied to one retry, and a second rejection leaves its target
    unchanged.
16. Open each generation panel and confirm it is a full-height right dock with
    the left navigation's chrome, no blocking backdrop, and an editor that
    remains centered with equal left and right spacing and stays interactive.
    Confirm its compact database checkbox stays on the same row as its label and
    defaults off.
    Enable it, return an answer and then a paraphrased question already present
    in another indexed package, and confirm each first draft is rejected and
    regenerated once. Close and reopen the panel and confirm the toggle is off.
17. Inspect the selected-question clear action and active-package delete action
    and confirm both use the shared red danger treatment. Delete the active
    package, confirm the dialog, and observe it disappear from Drive recents as
    the editor returns to the package list.
18. Search beside an empty question heading with one and then two characters.
    Select a grouped database row and confirm the complete source question is
    loaded. Repeat with a populated slot, cancel replacement, then confirm it.
    Reopen recents and confirm packages with unresolved remarks carry their
    separate status tag, while unfinished packages without remarks show the
    in-development tag.
19. Generate one question and then a package with different rule, difficulty,
    and recognizability selections. Confirm each accepted question shows its
    actual three parameters, retains them after saving and reopening, and
    preserves them through complete-question clipboard copying. Open a manual
    and legacy question and confirm neither shows the parameter block.
20. Generate from a rule whose description or examples name internal
    construction paths. Confirm neither the question text nor the answer
    comment repeats those labels and both read as natural player-facing prose.
21. Inspect the answer area at normal and narrow widths. Confirm only the
    host-notes field appears directly below the answer row, with no separate
    host-notes heading, and each answer-list add action stays inline with its
    list title.
22. Generate a question and confirm its navigation number turns blue. Add an
    unresolved remark or invalidate it and confirm the red state takes
    priority; select it and confirm the selected border remains visible. Give
    two questions the same normalized main or alternative answer and confirm
    both navigation numbers turn red immediately.
23. Inspect an empty handout at normal and narrow widths. Confirm there is no
    separate handout heading, the hatched image action stays left of the text
    field, both match the corresponding question-row field dimensions, and the
    question and remark fields match each other. Confirm every horizontal and
    vertical gap between the handout, question, remark, answer, answer comment,
    and host-notes fields is equal, and that filling any textarea does not
    change its height.
