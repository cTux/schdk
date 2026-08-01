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
- Treat each nested owner directory as a small source root. Keep related
  implementation, private types, constants, styles, and tests together when
  that makes the feature easier to understand.
- A single private secondary module may stay beside its owner. When an owner
  has multiple secondary modules, group all of them by role under directories
  such as `hooks`, `utils`, `types`, `context`, or `constants`.
- Preserve a more specific established structure after role grouping; do not
  add wrapper entry points inside private role directories.

## Cohesion

- Split a source file when it owns multiple independently changing
  responsibilities, not when it crosses an arbitrary physical line count.
- Keep a component, its private props, and small private helpers together when
  they change as one unit. Extract a module only when it has another consumer,
  a separately testable responsibility, or materially improves readability.
- Do not create pass-through `types.ts`, `constants.ts`, or `index.ts` files for
  private symbols. Keep entry points only at real consumer boundaries.

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
- Put a reusable component with multiple implementation files in its own
  `packages/ui/src/<area>/<ComponentName>/` directory. A small leaf component
  may remain in one file under its owning area.
- Add `types.ts` only for types consumed outside the component implementation.
  Add `index.ts` only when the directory is a public or cross-feature import
  boundary. Add `styles.scss` only when the component emits component-specific
  CSS; never add empty placeholders.
- Keep private one-use props with the component. Put reusable component props
  in that component's own `types.ts`. Composite components may re-export child
  props from the child's public entry point, but must not copy them. Group
  large composed-view contracts by document data, feature actions, and
  supporting collections instead of growing one flat prop list.
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
