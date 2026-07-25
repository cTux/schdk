---
name: schdk-find-next-feature
description: Find and suggest the next concrete SCHDK feature, fix, test, maintenance, security, or performance task. Use when the user asks what to build, fix, improve, or work on next, or requests a single actionable project task from the backlog and repository.
---

# SCHDK Find Next Feature

## Short-Circuit Rule

Inspect the sources below in order. As soon as one candidate is confirmed actionable against the current repository, stop the entire search and suggest resolving only that task. Do not finish the checklist, collect alternatives, rank a backlog, or change files unless the user also asks for implementation.

## Search Order

1. Read `TODO.md` from top to bottom.
   - Keep `TODO.md` tracked even when it has no entries; never remove the file.
   - Validate the first candidate against current code and documentation. Stop when it is still actionable.
2. Inspect `docs/research` and `docs/tech-design` in path order.
   - Never open files ending in `-implemented.md`.
   - Treat an unsuffixed document's first unimplemented outcome as the candidate.
   - When all outcomes from a document are implemented, rename it to `*-implemented.md` as part of that implementation task so future searches skip it.
3. Use `$schdk-project-structure` in audit mode and stop at the first concrete inconsistency.
4. Use `$schdk-react-components` in audit mode and stop at the first correctness or meaningful rendering-performance inconsistency.
5. Run `pnpm ncu --workspaces --packageManager pnpm` and stop at the first safe, useful dependency update.
6. Read `$schdk-add-missing-tests`, inspect its coverage window without adding tests, and stop at the first user-visible or contract-critical behavior missing coverage.
7. Use `$schdk-electron` to inspect each `*-desktop-app` against current Electron packaging, security, lifecycle, IPC, and platform guidance; stop at the first gap.
8. Look for a library only where repeated local code or friction proves it would increase development velocity. Prefer the platform and installed dependencies; stop at the first evidence-backed replacement.
9. Look for the first package boundary, oversized recurring context file, duplicated contract, or tightly coupled module that can be split or referenced to reduce AI-agent context usage without obscuring ownership.
10. Check the first concrete security improvement at a trust boundary, dependency, parser, browser surface, IPC channel, or file operation.
11. Check the first measurable performance improvement in rendering, parsing, persistence, build, packaging, or runtime work.

Use current primary documentation when dependency, Electron, library, security, or performance guidance may have changed.

## Output

Return one task with:

- a concise title;
- exact file or command evidence;
- why it is still actionable;
- the smallest implementation and verification scope.

If every source is exhausted without a task, say that no actionable task was found. Do not invent speculative work.
