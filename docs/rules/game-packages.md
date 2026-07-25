# Game package implementation

[`docs/GAME_PACKAGE.md`](../GAME_PACKAGE.md) is the canonical format and
compatibility contract. Do not duplicate its schema here.

## Ownership and use

- `packages/common/src/index.ts` is the executable source of truth. Reuse its
  types, constants, and package helpers instead of recreating format logic.
- Create packages with `createEmptyGamePackage` and write them with
  `serializeGamePackage`.
- Parse every imported, restored, or recent package with `parseGamePackage`;
  never trust content based only on its file extension.
- Parse question JSON from the clipboard with `parseGameQuestion` before
  replacing the selected question. Clipboard input is an untrusted boundary.
- Use `validateGamePackage` only when package readiness is required. A
  structurally valid unfinished package remains editable and saveable.
- Any format, validation, serialization, or compatibility change must update
  `@schdk/common` and `docs/GAME_PACKAGE.md` together. Add related round-trip
  and malformed-input tests only through `$schdk-add-missing-tests`.
