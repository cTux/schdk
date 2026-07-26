---
name: schdk-sync-specs
description: Synchronize SCHDK feature specifications, the root project specification, and related documentation after any prompt that changes repository files. Use as the mandatory post-change step before verification and commit for features, fixes, refactors, workflow changes, and documentation changes.
---

# SCHDK Spec Sync

## Workflow

1. Read `FORMAT.md`, `SPEC.md`, `docs/specs/README.md`, and the current task
   diff.
2. Classify the change:
   - Shipped behavior, public contract, UX, data, persistence, or platform
     integration changed: create or update the matching feature specification.
   - Durable workflow or ownership changed: update the matching rule and skill,
     plus `SPEC.md` when its project-level registry is affected.
   - Project-wide goal, constraint, interface, invariant, specification task,
     or confirmed bug changed: update `SPEC.md`.
   - Specification encoding changed: update `FORMAT.md`.
   - Internal implementation, tests, formatting, or generated output changed
     without a contract change: make no specification edit.
3. When no matching feature specification exists, create
   `docs/specs/<feature>.md` with status, goal, numbered requirements,
   invariants, and acceptance scenarios. Add it to `docs/specs/README.md`.
4. For a confirmed bug, append `§B` in `SPEC.md`; add a new `§V` invariant when
   it would catch recurrence. Update the feature contract when externally
   observable behavior changes.
5. Keep package schema in `docs/GAME_PACKAGE.md` and detailed shipped behavior
   in `docs/specs`.
6. Run before `$schdk-quality` and commit. State the specification files
   changed, or state that review found no contract change.

## Validation

- Follow `FORMAT.md`; keep identifiers monotonic and unique.
- Preserve required `SPEC.md` section order and exact `§T` / `§B` headers.
- Run formatting, resolve every changed relative Markdown link, and use
  `git diff --check`.
- Do not invent future behavior to make a specification look complete.
