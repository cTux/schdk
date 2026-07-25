---
name: schdk-project-structure
description: Maintain and audit SCHDK monorepo package, source, UI component, and public-export structure. Use when creating, moving, splitting, or reorganizing packages or React components; changing package boundaries or entry points; or checking structural consistency.
---

# SCHDK Project Structure

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/project-structure.md` and `docs/rules/architecture.md`.
2. Inspect package manifests, imports, exports, and callers before moving files.
3. Apply the structural convention to new or structurally changed files. Do not mass-migrate untouched legacy components without an explicit prompt.
4. Structure a UI component as:

```text
ComponentName/
  __tests__/
  ComponentName.tsx
  constants.ts
  index.ts
  types.ts
```

5. Add `styles.scss` only when the component emits component-specific CSS.
   Omit `constants.ts` when no component-specific constants exist. Create
   `__tests__` with the first explicitly requested test; Git cannot preserve an
   empty directory, and placeholder files and tests are forbidden.
6. Export only the component's consumer-facing component, types, and applicable constants from `index.ts`; update package entry points only when consumers need them.
7. Use `classnames` for conditional class composition. If the touched component needs it and `@schdk/ui` does not yet declare it, add it with pnpm; do not add an unused dependency.
8. Run `$schdk-quality` checks for the affected package and consumers.
