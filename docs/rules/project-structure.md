# Project structure

Keep packages under `packages/*` and preserve the ownership and dependency
directions in [architecture.md](architecture.md).

## Source roots

- Keep each `src` root minimal. A library package may keep only its public
  `index.ts` entry point there. A runnable application may additionally keep
  build-required entry points such as `main.tsx` and ambient declaration files
  such as `electron.d.ts`.
- Put every other module under `src/<role>/<subject-area>/<file>`, choosing a
  concrete role such as `components`, `constants`, `hooks`, `parsers`,
  `services`, `storage`, `types`, `utils`, or `validators`.
- Use the feature or data domain as the subject area, such as `game-packages`,
  `google-drive`, or `shell`. Keep tests beside the owning subject area.
- Do not use catch-all `common`, `misc`, or `shared` directories. When no
  existing role fits, name the module by what it does instead of creating a
  speculative abstraction.
- Treat each nested owner directory as a small source root. Keep its primary
  module, public entry point, public `types.ts`, `constants.ts`, stylesheet,
  and tests at that level.
- A single private secondary module may stay beside its owner. When an owner
  has multiple secondary modules, group all of them by role under directories
  such as `hooks`, `utils`, `types`, `context`, or `constants`.
- Preserve a more specific established structure after role grouping; do not
  add wrapper entry points inside private role directories.

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
- Export a file's single consumer-facing declaration directly, such as
  `export interface Props`; do not add a separate grouped export for one
  locally declared symbol.
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

- Put a UI feature shared by multiple application areas under its neutral
  subject area instead of nesting it under one consumer.
- Put each new or structurally changed component in its own
  `packages/ui/src/<area>/<ComponentName>/` directory.
- Include `ComponentName.tsx` and `index.ts`. Add `types.ts` only when the
  component owns types used outside its implementation. Add `styles.scss` only
  when the component emits component-specific CSS; never add empty placeholders.
- Keep private one-use props with the component. Put reusable component props
  in that component's own `types.ts`. Composite components may re-export child
  props from the child's public entry point, but must not copy them.
- Add `constants.ts` only for component-specific constants.
- When the component has multiple secondary modules, keep only
  `ComponentName.tsx`, `index.ts`, `types.ts`, `constants.ts`, `styles.scss`,
  and `__tests__` in its root. Move private hooks, helpers, secondary types,
  context modules, and secondary constants to their matching role
  directories.
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
