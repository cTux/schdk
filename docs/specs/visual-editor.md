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
- **VIS-4:** Text presentation supports color, scale, fitting, and growth
  direction; image presentation supports position.
- **VIS-5:** Canvas settings support an optional background image and opacity.
- **VIS-6:** Authors can add editable text and image elements, reposition them,
  configure them, hide them, and render them during gameplay.
- **VIS-7:** Resize handles keep the grabbed edge or corner under the pointer;
  selection borders do not move content.
- **VIS-8:** Text fitting is shared with gameplay, never enlarges beyond the
  configured size, and warns when content cannot fit at the readable minimum.
- **VIS-9:** Revealed blitz parts share the single question element bounds.
- **VIS-10:** Layout, background, and custom elements export to and import from
  versioned `.schdk-template` ZIP files.
- **VIS-11:** Legacy plain-JSON templates import without overwriting unrelated
  game options such as volume.
- **VIS-12:** Template imports reject archives and `template.json` entries
  larger than 16 MiB before allocating or extracting their content.
- **VIS-13:** Custom text editing uses the shared non-resizable multiline
  control.

## Invariants

- The standard layout remains active until the user changes it.
- Hidden elements stay editable in the visual editor and disappear only in
  gameplay.
- The game logo is visible by default in every question stage.
- Application light/dark theme does not alter the visual-editor presentation
  palette.

## Acceptance

1. Move and resize every built-in element, host a question, and observe matching
   bounds.
2. Add text and image elements, export a template, reset options, import it, and
   recover the same presentation.
3. Hide an element and verify it stays selectable in the editor but absent in
   gameplay.
4. Fit long standard and blitz text without overflow or growth above configured
   size.
5. Reject an oversized or duplicate-entry template without freezing the
   application.
6. Edit a custom text element and confirm its multiline control matches other
   application text areas and has no native resize handle.
