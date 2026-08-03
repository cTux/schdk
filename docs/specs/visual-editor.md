# Visual editor

Status: implemented

## Goal

Let an author arrange the projected game once and apply the same presentation
to every hosted question.

## Requirements

- **VIS-1:** The workspace presents a pannable, wheel-zoomable 16:9 game canvas
  on a stable dark editing surface.
- **VIS-2:** Built-in logo, intro, progress, handout, question, timer, answer
  comment, alternative answer, answer, and controls elements are independently
  selectable, movable, resizable, configurable, and hideable.
- **VIS-3:** Bounds persist as percentages and render identically in gameplay.
- **VIS-4:** Text presentation supports horizontal and vertical alignment,
  color, scale, bold, italic, underline, line height, and letter spacing; image
  presentation supports position.
- **VIS-5:** Canvas settings support an optional background image with opacity
  and an optional two-color gradient with a configurable direction.
- **VIS-6:** Authors can add editable text and image elements, reposition them,
  configure them, hide them, and render them during gameplay.
- **VIS-7:** Resize handles keep the grabbed edge or corner under the pointer;
  selection borders do not move content.
- **VIS-8:** Text renders at its configured size without measuring or scaling
  to fit element bounds; overflow is clipped identically in editor and
  gameplay.
- **VIS-9:** Revealed blitz parts share the single question element bounds.
- **VIS-10:** Layout, background, and custom elements export to and import from
  versioned `.schdk-template` ZIP files.
- **VIS-11:** Legacy plain-JSON templates import without overwriting unrelated
  game options such as volume.
- **VIS-12:** Template imports reject archives and `template.json` entries
  larger than 16 MiB before allocating or extracting their content, and ZIP
  compression or extraction runs asynchronously without blocking interaction.
- **VIS-13:** Custom text editing uses the shared non-resizable multiline
  control.
- **VIS-14:** Background and custom-element image selection rejects files that
  cannot fit the canonical 3 MiB encoded-image limit before reading them, and
  validates the resulting embedded data URL before changing presentation.
- **VIS-15:** Authors can undo and redo presentation changes with the permanent
  visual-editor controls or standard keyboard shortcuts. One completed drag,
  resize, text edit, range adjustment, or color edit is one history entry, new
  edits clear redo history, and history never crosses connected Google
  accounts. History is bounded by both entry count and retained presentation
  size.
- **VIS-16:** Element backgrounds are transparent by default and support an
  optional solid color or directional two-color gradient, background opacity,
  corner rounding, and whole-element opacity.
- **VIS-17:** The selected-element top toolbar resembles a compact document
  editor, with direct alignment, bold, italic, and underline buttons and
  grouped typography, background, image-position, visibility, and removal
  controls.

## Invariants

- The standard layout remains active until the user changes it.
- Hidden elements stay editable in the visual editor and disappear only in
  gameplay.
- The game logo is visible by default in every question stage.
- Application light/dark theme does not alter the visual-editor presentation
  palette.
- New and legacy elements have no gradient background unless the author enables
  one.

## Acceptance

1. Move and resize every built-in element, host a question, and observe matching
   bounds.
2. Add text and image elements, export a template, reset options, import it, and
   recover the same presentation.
3. Hide an element and verify it stays selectable in the editor but absent in
   gameplay.
4. Resize long standard and blitz text elements and confirm the configured font
   size does not change while overflow remains clipped.
5. Reject an oversized or duplicate-entry template without freezing the
   application.
6. Edit a custom text element and confirm its multiline control matches other
   application text areas and has no native resize handle.
7. Select an image that cannot fit the encoded-image limit and confirm the
   editor rejects it before reading or changing presentation.
8. Change text, background, visibility, and element bounds; undo and redo each
   completed interaction with buttons and keyboard shortcuts, confirming that a
   continuous text, range, or color edit needs only one undo. Make a new edit
   after undo and confirm redo is unavailable, then switch accounts and confirm
   history is cleared.
9. Format text with alignment, bold, italic, underline, line height, and letter
   spacing; configure solid and gradient element backgrounds and confirm the
   hosted game matches the editor.
