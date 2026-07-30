# Project structure

Keep packages under `packages/*` and preserve the ownership and dependency
directions in [architecture.md](architecture.md).

## File size

- Keep every tracked source-code file at 256 physical lines or fewer, including
  blank lines and comments. This applies to `.cjs`, `.css`, `.html`, `.js`,
  `.jsx`, `.mjs`, `.scss`, `.ts`, and `.tsx` files.
- When a source file would exceed the limit, split it by cohesive
  responsibility into smaller modules, components, hooks, or stylesheet
  partials. Preserve ownership boundaries and public entry points; do not
  compress formatting or combine unrelated statements merely to satisfy the
  limit.
- Generated output, lockfiles, binary assets, and prose documentation are not
  source-code files and are outside this limit.

## Exports

- Keep at most one top-level `export` statement in each source-code file.
- Split files with multiple exported declarations by consumer-facing
  responsibility. Give each reusable symbol its own owning module instead of
  hiding multiple declarations behind one grouped export statement.
- Keep a helper in the same file as its primary exported function only when no
  other module uses it. When another module needs the helper, move it to its own
  file and export it there.
- Entry-point files may import consumer-facing symbols from their owning
  modules and expose them through one grouped `export` statement.
- Refactor an existing file that violates these rules when the file is changed;
  do not add another export to it.

## Readable conditions

- Make implementation-heavy control flow read as English. Name each semantic
  predicate before combining type checks, limits, regular expressions, or
  nested property checks in a branch.
- Prefer positive predicate names such as `hasValidFilenameType` and
  `hasAcceptableFilenameLength`, then compose them in the condition. Avoid
  double negatives.
- Keep a direct condition inline when its identifiers and operators already
  state the business rule clearly. Do not introduce aliases that only repeat
  an already-readable expression.

## UI components

- Put each new or structurally changed component in its own
  `packages/ui/src/<area>/<ComponentName>/` directory.
- Include `ComponentName.tsx`, `types.ts`, and `index.ts`. Add `styles.scss`
  only when the component emits component-specific CSS; never add an empty
  placeholder stylesheet or import.
- Add `constants.ts` only for component-specific constants.
- Keep tests in `__tests__/`. Because Git does not track empty directories and
  tests are added only by an explicit `add missing tests` prompt, create the
  directory with the first real test; never add placeholders.
- Export only consumer-facing components, types, and applicable constants from
  the component's `index.ts`. Import the component through that entry point.
- Maximize reuse through typed props. Keep application state, persistence,
  routing, and platform APIs outside reusable components.
- Use `classnames` when conditional classes are needed instead of manual array,
  template-string, or concatenation helpers. Add it to `@schdk/ui` with pnpm
  only when first needed.
- Existing flat components are migration debt. Apply this structure when they
  are explicitly reorganized; do not expand an unrelated prompt into a
  repository-wide move.
- Keep every exported React UI component discoverable in `@schdk/ui`
  Storybook. The Storybook generator must pick up new components and changed
  props, and its default args must keep each generated story renderable.
- Run `pnpm --filter @schdk/ui build:storybook` after adding a UI component or
  changing its props. Commit Storybook configuration and fixtures, never the
  generated stories or `dist/storybook`.
