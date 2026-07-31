---
name: schdk-project-structure
description: Enforce SCHDK package, source, component, and export structure. Use for every source change, file move or split, boundary or entry-point change, and structural audit.
---

# SCHDK Project Structure

## Workflow

1. Follow `$schdk-development`, then read
   `docs/rules/project-structure.md` and `docs/rules/architecture.md`.
2. Inspect package manifests, imports, exports, and callers before moving files.
3. Apply the source-root, owner-directory, file-size, export, helper, and
   readable-condition rules only to new or touched structural scope.
4. For UI components, also read `packages/ui/README.md` and verify Storybook
   discovery when exports or props change.
   Keep cross-area UI features under a neutral subject owner instead of one
   consumer's directory.
5. Run `$schdk-quality` for the affected package and consumers.
