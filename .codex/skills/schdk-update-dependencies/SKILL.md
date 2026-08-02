---
name: schdk-update-dependencies
description: Update SCHDK pnpm or dependencies, lockfiles, and audit overrides. Use for upgrades, pnpm self-update, ncu, lockfile refresh, or vulnerability remediation.
---

# SCHDK Dependency Updates

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, `docs/rules/dependencies.md`, `docs/rules/builds.md`, and `docs/rules/verification.md`.
2. Inspect `git status --short --branch`. Create a new `codex/<prompt-slug>` branch from the current HEAD before changing files; do not remain detached.
3. Run `pnpm self-update`, then confirm `pnpm --version`. Update the pinned pnpm references in `package.json`, `README.md`, and `docs/rules/dependencies.md` when the version changes. Keep `package.json#packageManager` as the single CI pin; confirm `pnpm/action-setup` steps do not declare `version`.
4. Run `pnpm ncu --workspaces --packageManager pnpm` to review updates, then run `pnpm ncu --workspaces --packageManager pnpm -u`.
5. Run `pnpm install` to regenerate `pnpm-lock.yaml`.
6. Run `pnpm audit`.
7. For each remaining finding:
   - Run `pnpm why <package> -r` to confirm every vulnerable path.
   - Select a patched release from the audit result and `pnpm view <package> version`.
   - Add the smallest exact override under top-level `overrides` in `pnpm-workspace.yaml`. Do not use `package.json#pnpm.overrides`; pnpm 11 ignores it.
8. Run `pnpm install` again, preserve any generated `minimumReleaseAgeExclude` entry required for a new security release, and rerun `pnpm audit`.
9. Run the full checks from `$schdk-quality`, including `pnpm build`, plus `pnpm install --frozen-lockfile` and `git diff --check`.
10. Review the complete diff, commit all task changes on the new branch, and confirm the worktree is clean.

Keep `npm-check-updates` as a root dev dependency and use its local `ncu` binary.
