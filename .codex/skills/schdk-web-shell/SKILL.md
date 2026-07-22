---
name: schdk-web-shell
description: Maintain SCHDK browser applications and the unified @schdk/all-web-app shell. Use for web entry points, shell navigation, fixed sidebar behavior, React.lazy bundle loading, application mounting, browser deep links, options tabs and storage, Vite configuration, or standalone versus unified renderer behavior.
---

# SCHDK Web Shell

## Workflow

1. Read `docs/rules/web-apps.md`, `docs/rules/architecture.md`, and `packages/ui/README.md`.
2. Keep browser packages free of Electron and Node imports; use the optional typed desktop adapter only where already defined.
3. Render visuals through `@schdk/ui`. Do not copy components or styles into web apps.
4. Lazy-load host and editor exports without iframes, then keep mounted applications alive while switching views.
5. Preserve relative Vite bases, Ukrainian metadata, shell deep links, keyboard navigation, and the strict `127.0.0.1:5173` development URL.
6. Add focused tests for routing, storage, or state-restoration logic and visually smoke-test changed navigation.

## Checks

```powershell
pnpm --filter @schdk/all-web-app lint
pnpm --filter @schdk/all-web-app typecheck
pnpm --filter @schdk/all-web-app test
pnpm --filter @schdk/all-web-app build
```

Use `$playwright` for browser flows.
