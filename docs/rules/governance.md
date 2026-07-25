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
- Keep rule files single-purpose and skills procedural. Route to the smallest
  relevant rule set instead of copying product contracts into skill bodies.
- Rules describe current guarantees and accepted boundaries, not speculative
  future architecture.
- Keep repository skills under `.codex/skills` synchronized with the workflows
  they guide. Update the affected skill in the same change when a durable
  workflow, command, ownership boundary, or verification requirement changes.
- Before creating a pull request, fetch `origin/main`, rebase the task branch
  onto it, resolve conflicts, and reverify the rebased result.
- Add a project skill only for a distinct recurring workflow. Do not create
  speculative skills for features or packages that do not exist yet.
- Keep the root `TODO.md` tracked even when it is empty.
- Remove `TODO.md` entries that are already implemented or no longer relevant
  when task discovery confirms they are stale.
- Remove a `TODO.md` item in the same change that resolves it.
- Rename completed task documents under `docs/research` and `docs/tech-design`
  with an `-implemented.md` suffix so task discovery can skip them.

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
