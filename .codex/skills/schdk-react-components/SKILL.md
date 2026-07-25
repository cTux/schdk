---
name: schdk-react-components
description: Build, refactor, optimize, or review React components and hooks across SCHDK web, UI, and desktop renderer packages. Use for component behavior, props, state, effects, rendering performance, React.memo, useMemo, useCallback, useTransition, useDeferredValue, or React best-practice audits.
---

# SCHDK React Components

## Workflow

1. Follow `$schdk-development`, read `packages/ui/README.md` and only the affected UI rules, and use `$schdk-project-structure` for new or structurally changed components.
2. Trace the component, its callers, props, state, Effects, and identity-sensitive children before editing.
3. Make rendering pure, keep transient state local, derive values during render, and reserve Effects for synchronization with external systems.
4. Establish correct behavior without memoization. Never store required state in `useMemo`, rely on a cached callback for correctness, omit reactive dependencies, or use caching to hide an Effect or state bug.
5. Evaluate every changed render path for useful optimization:
   - Use `memo` for a component that re-renders often with unchanged props and has meaningful render cost.
   - Use `useMemo` for an expensive pure calculation or to stabilize a value consumed by a memoized component or Hook.
   - Use `useCallback` for a callback consumed by a memoized component or identity-sensitive Hook.
   - Use `useTransition` or `useDeferredValue` when non-urgent rendering blocks an urgent interaction.
   - Prefer smaller props, local state, children, pure rendering, and fewer Effect chains when they remove the work entirely.
6. Include every reactive dependency. Prefer functional state updates or moving values inside an Effect only when that preserves behavior and safely removes a dependency.
7. Do not memoize trivial calculations, primitive values, or local handlers with no identity-sensitive consumer; the cache and dependency checks can cost more than the work.
8. Avoid custom `memo` comparators unless production profiling shows a win. Compare every prop, including functions, and preserve closure behavior.
9. Run focused existing tests, typecheck, and the `$schdk-quality` browser smoke-test workflow. For performance work, compare the affected interaction in a production build and confirm the optimization skips work without changing output, state, focus, timing, or accessibility.

Use the current official React guidance for [purity](https://react.dev/learn/keeping-components-pure), [Effects](https://react.dev/learn/you-might-not-need-an-effect), [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), and [`useCallback`](https://react.dev/reference/react/useCallback).
