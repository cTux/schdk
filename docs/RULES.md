# Project Rules

This file is the canonical index for project guidance. Read it before changing
the repository, then read every linked area affected by the task.

## Rule areas

Read only the areas touched by the task:

- Core: [governance](rules/governance.md), [architecture](rules/architecture.md),
  [project structure](rules/project-structure.md), and
  [game packages](rules/game-packages.md).
- Editor: [state](rules/editor-state.md),
  [browser persistence](rules/browser-persistence.md), and
  [desktop persistence](rules/desktop-editor-persistence.md).
- Applications: [shared web](rules/web-apps.md), [host](rules/host-app.md),
  [web shell](rules/web-shell.md), [desktop](rules/desktop-apps.md), and
  [Google Drive](rules/google-drive.md), and [security](rules/security.md).
- UI: [area index](../packages/ui/README.md).
- Workflow: [dependencies](rules/dependencies.md), [builds](rules/builds.md),
  and [verification](rules/verification.md).

## Product contracts

- [GAME_PACKAGE.md](GAME_PACKAGE.md) is the user-facing `.schdk` format
  contract.
- [../README.md](../README.md) is the short Ukrainian project overview and
  benefits page.
- [README.md](README.md) indexes the detailed Ukrainian topic guides under
  [`guide/`](guide/).

When a prompt contains a durable project convention or constraint, update the
appropriate rule document in the same change as described in
[governance.md](rules/governance.md).
