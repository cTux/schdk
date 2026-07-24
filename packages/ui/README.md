# SCHDK UI

`@schdk/ui` owns the visual layer shared by all SCHDK web applications:
components, styles, design tokens, assets, and UI rules. Application packages
own state, persistence, routing, and platform integration.

## Rules

- Keep all reusable UI components, composed views, SCSS, design tokens, and
  visual assets in this package. Web application packages own state and
  platform integration, not duplicate markup or styles.
- Build screens from the smallest practical components; keep atoms independent
  of application state and platform APIs.
- Maximize reusable dedicated components: extract every coherent control,
  repeated structure, and stateful interaction behind a named component.
  Keep one-off wrappers inline when they have no independent behavior,
  semantics, or realistic reuse value.
- Keep composed views controlled through typed data and callbacks. Do not read
  browser storage, Electron APIs, or the filesystem from UI components.
- Reuse the package's color tokens, typography, spacing, radii, and interaction
  patterns before introducing a new visual treatment.
- Prefer compact, readable layouts and omit decoration that carries no
  information.
- Preserve semantic elements, labels, `aria-*` state, visible keyboard focus,
  disabled states, and native control behavior.
- Keep editor and shell layouts usable from 320 px upward, and honor
  `prefers-reduced-motion`.
- Keep the shell sidebar fixed to the viewport while application content
  scrolls independently.
- Group `Провести гру`, `Редагувати питання`, and `Візуальний редактор` under `ЩДК` in the shell
  sidebar. Keep `Налаштування` in a separate navigation group fixed at the
  bottom. Organize settings with an accessible primary `ЩДК` tab and secondary
  `Проведення гри` and `Редагування питань` tabs.
- Use Flexbox for UI layout. Do not use CSS Grid.
- Use Font Awesome for icons inside controls and navigation. Import individual
  icons from the free SVG packages; keep product branding as separate assets.
- Use the shared owl only for SCHDK branding and favicons. Keep decorative
  images and icons out of the accessibility tree.
- Use `ЩДК Гра` as the user-facing name of the host application; keep `host` in
  technical package names and code identifiers.
- Keep save-state colors consistent: green for saved, amber for pending, blue
  for saving, and red for failure. Pair color with visible text and a live
  status role.
- Keep the package title and save state on the right side of the editor header.
  Do not restore the removed header completion counter.
- Place the optional handout before the question text in the question editor.
- Place Font Awesome copy and paste actions beside the question heading. Copy
  every question field as JSON; require confirmation before parsing clipboard
  JSON and fully replacing the selected question.
- Label optional editor fields explicitly. Question remarks are optional, but
  a non-empty unresolved remark keeps the question unfinished.
- Keep the question, remark, answer, and answer-comment text areas at the same
  default height.
- Show handouts without filenames, with the remove action below the thumbnail.
  Clicking the thumbnail must open a full-size modal with 100–400% zoom and
  drag-to-pan while zoomed.
- Keep the file-open drop zone compact: at most 250 px tall, shrinking further
  on short viewports. Keep recent packages below it, never inside it.
- Keep the host pre-game summary spoiler-free. Show only the package title,
  filename, aggregate round/question/handout counts, and start/back actions;
  never show question, answer, comment, or host-note text before the game.
- Keep gameplay projector-first and fullscreen: animated centered question
  intro; full-screen handout reveal that shrinks to the upper right with its
  bottom aligned to the question; gradient question above a stable timer, with
  the comment below it and the answer aligned along the bottom.
- Scale long question text against viewport height and contain it inside its
  slot; question text must never paint outside the gameplay viewport.
- Let users reposition and resize every gameplay element in the visual editor.
  Apply the same saved percentage bounds and presentation settings during
  gameplay, and preserve the standard layout until the user changes it. Keep
  the grabbed point under the pointer. Wrap previews in a click-blocking drag
  target with a permanent transparent 2 px inset border that does not consume
  layout space; change only its color to blue when selected so preview content
  never shifts. Keep overflowing content clipped and show the selected
  element's text or image controls in a fixed workspace toolbar. Keep the
  selected wrapper above every other element and resize from any border without
  a visible resize indicator. Let text elements
  optionally shrink their text to fit the wrapper height, using the same
  measured scale in the editor and gameplay.
  Render visual-editor previews with the same shared game-element components
  and styles used by the host. Keep the answer and alternative answer as
  separate draggable layout elements. Put the 16:9 game container on a
  full-size light workspace; pan it with right-button drag and zoom it with the
  mouse wheel. Keep the draggable game logo visible through every question
  stage, with its default position in the upper-left corner.
- Preserve cumulative question stages and disable controls during every
  transition. Show the configured hotkeys inside the controls.
- Put the game signal volume slider in the Game options tab and show its
  current percentage.
- Give handouts the answer gradient and a soft black shadow without a border.
  Align contained images to the bottom right so landscape images sit at the
  bottom and portrait images sit at the right. Render the main answer
  prominently with smaller alternative answers above it.
- Show the package title first and the filename second in each recent-package
  item. Fall back to the filename alone for legacy entries without title
  metadata. Show a `Готовий` tag beside the title only when shared package
  validation reports no missing required fields or unresolved remarks.
- On question-number hover or focus, show completed question-and-answer text in
  a custom tooltip. Show unresolved remarks below the question in red and mark
  their question number with a dark-red background, never a red border. Keep
  tooltips fully visible within the active layout instead of clipping their content.
  Hovering or selecting a question number may change only its border, never its
  background. Use a 2 px border for every question number.
- Let users drag one question number onto another to swap the complete question
  records while keeping the current selection attached to the same question.
  Hide question tooltips immediately while a number is pressed and keep all
  tooltips hidden while a drag is active.
- Put shared visual changes here instead of adding app-local components or
  styles.
- Scope application-specific styles under each application's root class so
  lazy components can share the unified document without CSS collisions.
- Keep user-facing text in the composed view that owns its context; atoms must
  not hard-code product copy.
- Keep user-facing copy Ukrainian. Do not add transient save, cancel, or
  download success messages; preserve actionable validation and file errors.

The project-wide rule index is [`docs/RULES.md`](../../docs/RULES.md).
