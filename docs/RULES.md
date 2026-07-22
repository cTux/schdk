# Project Rules

This file is the canonical index for project guidance. Read it before changing
the repository, then read every linked area affected by the task.

## Rule areas

| Area                                                    | Rules                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| Governance and documentation                            | [rules/governance.md](rules/governance.md)                   |
| Package architecture and ownership                      | [rules/architecture.md](rules/architecture.md)               |
| `.schdk` model, validation, and compatibility           | [rules/game-packages.md](rules/game-packages.md)             |
| Editor lifecycle, saving, drafts, and recents           | [rules/editor-persistence.md](rules/editor-persistence.md)   |
| Browser applications and the unified shell              | [rules/web-apps.md](rules/web-apps.md)                       |
| Electron applications and packaging                     | [rules/desktop-apps.md](rules/desktop-apps.md)               |
| Trust boundaries and Electron security                  | [rules/security.md](rules/security.md)                       |
| Dependencies, builds, tests, and generated files        | [rules/tooling-and-quality.md](rules/tooling-and-quality.md) |
| Components, styling, accessibility, and visual language | [../packages/ui/README.md](../packages/ui/README.md)         |

## Product contracts

- [GAME_PACKAGE.md](GAME_PACKAGE.md) is the user-facing `.schdk` format
  contract.
- [../README.md](../README.md) is the Ukrainian project and launch guide.

When a prompt contains a durable project convention or constraint, update the
appropriate rule document in the same change as described in
[governance.md](rules/governance.md).
