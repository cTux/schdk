# SCHDK feature specifications

These documents describe shipped product behavior. They are acceptance
contracts, not implementation plans or a roadmap.

Project-wide goals, constraints, invariants, and bug history live in
[`../../SPEC.md`](../../SPEC.md).

| Area               | Specification                                           | Covered features                                                                 |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Package contract   | [Game package](game-package.md)                         | Questions, answers, handouts, music breaks, ZIP format, compatibility, readiness |
| Authoring          | [Package editor](package-editor.md)                     | Create, edit, AI generation, reorder, import, autosave, recents, export          |
| Gameplay           | [Game hosting](game-hosting.md)                         | Pre-game summary, stages, timers, audio, navigation, restoration                 |
| Presentation       | [Visual editor](visual-editor.md)                       | Layout, custom elements, backgrounds, templates                                  |
| Cloud              | [Google Drive persistence](google-drive-persistence.md) | Authorization, package and AI-rule storage, settings sync, recovery              |
| Application shell  | [Unified shell](unified-shell.md)                       | Navigation, localization, themes, settings, deep links, GitHub Pages             |
| Native application | [Desktop application](desktop-application.md)           | Cross-platform shell, presenter notes, close safety, native export, artifacts    |

## Maintenance

- Update the affected specification whenever shipped behavior changes.
- Keep requirements observable and platform-neutral unless a platform is part
  of the feature.
- Keep format details canonical in [`../GAME_PACKAGE.md`](../GAME_PACKAGE.md),
  [`../AI_QUESTION.md`](../AI_QUESTION.md), and
  [`../AI_QUESTION_PACKAGE.md`](../AI_QUESTION_PACKAGE.md); feature
  specifications link to those contracts instead of copying their schemas.
- Keep architecture, security, and contributor workflow in
  [`../RULES.md`](../RULES.md), not in product requirements.
