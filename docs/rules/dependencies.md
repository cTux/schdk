# Workspace and dependencies

- Use Node.js 24.x LTS and pnpm 11.x; the repository pins Node `24.18.0` and pnpm
  `11.18.0`.
- Keep `package.json#packageManager` as the single pnpm version pin; GitHub
  workflows let `pnpm/action-setup` read it instead of declaring another version.
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
  for settings-only UI. Register only provider packages shipped in `@schdk/ai`;
  currently OpenAI, Anthropic, and Google.
- Use `@opencode-ai/models` as the provider and model metadata source; do not
  maintain a full catalog by hand.
