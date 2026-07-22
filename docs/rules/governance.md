# Governance and documentation

## Applying rules

- Read `docs/RULES.md` before changing the repository and read each linked area
  touched by the task.
- Treat prompt statements about ownership, required behavior, naming,
  language, UX, formats, platforms, tooling, testing, or workflow as potential
  project rules.
- If a prompt contains a reusable convention or constraint, add or update the
  appropriate rule automatically in the same change, even when the prompt does
  not separately request documentation.
- Do not turn one-off content, temporary values, screenshots, or narrowly
  scoped implementation instructions into permanent rules.
- A newer explicit user instruction overrides an older rule. Update or remove
  the stale rule instead of leaving contradictory guidance.
- Add new rule areas to the index in `docs/RULES.md`. Link across areas instead
  of duplicating the same rule in multiple files.
- Rules describe current guarantees and accepted boundaries, not speculative
  future architecture.

## Documentation and language

- Keep the root `README.md` in Ukrainian. It is the user-facing project,
  setup, launch, build, and troubleshooting guide.
- Keep code identifiers, code comments, package metadata, developer documents,
  and rule documents in English.
- Keep user-visible application copy in Ukrainian unless a feature explicitly
  introduces localization.
- Update documentation whenever behavior, package ownership, commands, ports,
  file formats, or build outputs change.
- Keep `docs/GAME_PACKAGE.md` synchronized with the implemented format in
  `@schdk/common`.
- Use relative Markdown links for repository files and verify every link.
- The repository is private and `UNLICENSED`; do not describe it as publicly
  licensed or redistributable without an explicit license change.
