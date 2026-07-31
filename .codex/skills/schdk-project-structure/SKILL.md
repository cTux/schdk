---
name: schdk-project-structure
description: Maintain and audit SCHDK monorepo package, source, UI component, and public-export structure. Use for every source-code change and when creating, moving, splitting, or reorganizing packages or React components; changing package boundaries or entry points; or checking structural consistency.
---

# SCHDK Project Structure

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/project-structure.md` and `docs/rules/architecture.md`.
2. Inspect package manifests, imports, exports, and callers before moving files.
3. Audit tracked files directly under each affected `src` root. Keep only a
   library's `index.ts`, or a runnable application's required entry points and
   ambient declarations. Move every other module to
   `src/<role>/<subject-area>/<file>` using concrete existing roles and domains.
4. Audit each affected nested owner directory as a small source root. Keep its
   primary module, entry point, public `types.ts`, `constants.ts`, stylesheet,
   and tests at that level. A single private secondary module may remain
   colocated; when there are multiple secondary modules, move all of them into
   concrete role directories such as `hooks`, `utils`, `types`, `context`, or
   `constants`.
5. Audit every tracked `.cjs`, `.css`, `.html`, `.js`, `.jsx`, `.mjs`,
   `.scss`, `.ts`, and `.tsx` file touched by the task. Keep each at 256
   physical lines or fewer; split larger files by cohesive responsibility
   without compressing formatting or weakening ownership boundaries.
6. Keep at most one top-level `export` statement in each source-code file.
   When a touched file has multiple exported declarations, split them into
   owning modules by consumer-facing responsibility; do not merely replace
   them with one grouped export statement.
7. Keep a helper beside its primary exported function only while it is private
   to that module. Before reusing it elsewhere, move it to its own file and
   export it there. Update every caller and preserve the existing public entry
   point where consumers still need it.
8. Let entry-point files import public symbols from their owning modules and
   expose them with one grouped `export` statement.
9. Apply the structural convention to new or structurally changed files. Do not mass-migrate untouched legacy components without an explicit prompt.
10. Structure a UI component as:

```text
ComponentName/
  __tests__/
  ComponentName.tsx
  constants.ts
  index.ts
  types.ts
```

11. Add `styles.scss` only when the component emits component-specific CSS.
    Omit `constants.ts` when no component-specific constants exist. Create
    `__tests__` with the first explicitly requested test; Git cannot preserve an
    empty directory, and placeholder files and tests are forbidden.
12. Export only the component's consumer-facing component, types, and applicable constants from `index.ts`; update package entry points only when consumers need them.
13. Keep each component's props in its own `types.ts`. A composite component
    may re-export child props from the child's public entry point, but must not
    define or store them in the composite's directory.
14. Use `classnames` for conditional class composition. If the touched component needs it and `@schdk/ui` does not yet declare it, add it with pnpm; do not add an unused dependency.
15. For every new exported UI component or changed component prop, confirm the
    Storybook generator discovers it, update Storybook default args when
    needed, and run `pnpm --filter @schdk/ui build:storybook`.
16. Run `$schdk-quality` checks for the affected package and consumers. The
    repository workflow test enforces the 256-line source limit.
