# Workspace and dependencies

- Use Node.js 25.x and pnpm 11.x; the repository pins Node `25.9.0` and pnpm
  `11.17.0`.
- Run workspace commands from the repository root unless a package-local
  command is explicitly required.
- Keep packages under `packages/*`, use `workspace:*` for internal
  dependencies, and put shared tool versions in the pnpm catalog.
- Add dependencies with pnpm and commit `pnpm-lock.yaml` with manifest changes.
- Keep `npm-check-updates` as a root dev dependency and use
  `$schdk-update-dependencies` for pnpm, dependency, lockfile, and audit updates.
- Start implementation in a new worktree with `$schdk-start-session`: create a
  prompt-based `codex/` branch, then run `pnpm install`.
- Prefer platform APIs and installed dependencies before adding packages.
  Import only the Font Awesome icons used by the UI.
- Use the Vercel AI SDK provider registry when question generation is
  implemented. Add its runtime dependency with the first generation call, not
  for settings-only UI.
