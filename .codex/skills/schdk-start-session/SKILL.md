---
name: schdk-start-session
description: Initialize a new SCHDK implementation session or newly created Git worktree. Use at the start of repository work that will change files, especially when the worktree starts on a detached HEAD and needs a task-specific branch and installed dependencies.
---

# SCHDK Session Setup

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, and `docs/rules/dependencies.md`.
2. Inspect `git status --short --branch` and preserve any existing user changes.
3. Derive a short kebab-case branch slug from the prompt and create `codex/<prompt-slug>` from the current HEAD with `git switch -c`.
4. If that branch name already exists, choose another prompt-based name; do not reuse an unrelated branch.
5. Run `pnpm install` from the repository root.
6. Confirm the active branch and dependency install succeeded before changing files.
