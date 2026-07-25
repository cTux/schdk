# Project structure

Keep packages under `packages/*` and preserve the ownership and dependency
directions in [architecture.md](architecture.md).

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
