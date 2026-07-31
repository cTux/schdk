---
name: schdk-react-components
description: Build, refactor, optimize, or review SCHDK React components and hooks. Use for props, state, effects, rendering performance, memoization, transitions, or React audits.
---

# SCHDK React Components

## Workflow

1. Follow `$schdk-development`, then read `packages/ui/README.md` and only the
   affected UI rules. Use `$schdk-project-structure` for new or structurally
   changed components.
2. Trace the component, callers, props, state, Effects, and identity-sensitive
   children before editing.
3. Apply the React behavior and performance rules in
   `docs/rules/ui-foundations.md`.
4. For performance work, establish correct behavior first, measure the affected
   production interaction, and keep an optimization only when it skips
   meaningful work without changing output, state, focus, timing, or
   accessibility.
5. Run focused existing tests, typecheck, and the `$schdk-quality` browser
   smoke-test workflow.

Use the current official React guidance for [purity](https://react.dev/learn/keeping-components-pure), [Effects](https://react.dev/learn/you-might-not-need-an-effect), [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), and [`useCallback`](https://react.dev/reference/react/useCallback).
