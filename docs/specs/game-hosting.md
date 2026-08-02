# Game hosting

Status: implemented

## Goal

Guide a presenter through a complete game while keeping answers and private
content hidden until the correct stage.

## Requirements

- **HST-1:** Host opens a ready package from Drive recents or imports a local
  package through a visible chooser or drag-and-drop. The recents list uses
  the available host width and does not render a separate section heading.
- **HST-2:** Before start, the app shows only title, filename, aggregate tour,
  question, and handout counts, plus start and back actions.
- **HST-3:** Standard questions advance through intro, optional handout,
  question, 60-second timer, a stage that displays the timer at zero, optional
  answer comment, and answer. Text handouts render with a monospace font.
- **HST-4:** Blitz questions reveal two 30-second or three 20-second parts
  cumulatively, displaying the timer at zero before advancing to each next
  part.
- **HST-5:** Timer start, ten-seconds-remaining, and expiry signals use the
  persisted signal volume.
- **HST-6:** Questions 12 and 24 lead to a music-break slide when matching audio
  exists; music uses native controls and its own persisted volume.
- **HST-7:** Buttons and `Space` / `PageDown` / `ArrowRight` advance;
  `Backspace` / `PageUp` / `ArrowLeft` go back.
- **HST-8:** Navigation is locked during transitions, preserving cumulative
  visible stages.
- **HST-9:** Automatic fullscreen is enabled by default. Denial or disabling
  falls back to a fixed full-viewport presentation, including after fullscreen
  is exited.
- **HST-10:** `Alt+Q` exits an active game only after confirmation.
- **HST-11:** Package identity and exact question stage persist continuously
  and restore from a validated Drive reference.
- **HST-12:** The final answer leads to a localized completion screen; returning
  to games exits fullscreen and restores package selection.
- **HST-13:** Every recent Drive package offers an explicit download that does
  not select or change the package.
- **HST-14:** Before questions 1, 13, and 25, the host shows a dedicated static
  slide with the tour number and its optional smaller phrase fully visible
  inside the configured intro bounds.

## Invariants

- Pre-game UI never reveals question, answer, comment, or host-note text.
- Only structurally valid, ready packages can start.
- Host uses persisted visual-editor layout without changing stage order.
- Browser deep links contain validated Drive references and valid game state.

## Acceptance

1. Complete standard and both blitz types in forward and reverse navigation.
2. Reload at each stage and restore the same package, question, and stage.
3. Host a package with and without handouts, comments, and music breaks.
4. Deny fullscreen and complete the game using viewport fallback and keyboard
   controls.
5. Move forward and backward through all three tour slides, with empty and
   populated tour phrases and with or without music breaks.
