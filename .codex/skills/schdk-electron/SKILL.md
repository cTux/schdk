---
name: schdk-electron
description: Build, debug, secure, or package SCHDK Electron applications. Use for BrowserWindow behavior, maximization, titles, icons, navigation blocking, main/preload IPC, file authorization, recent files, session restoration, save-before-close handshakes, Electron security, or electron-builder output.
---

# SCHDK Electron

## Workflow

1. Read `docs/rules/desktop-apps.md`, `docs/rules/security.md`, `docs/rules/architecture.md`, and `docs/rules/tooling-and-quality.md`.
2. Keep filesystem and Electron APIs in desktop packages. Expose only narrow validated methods through self-contained `.cts` preloads.
3. Preserve context isolation, navigation blocking, file-path authorization, recent-path allowlists, and IPC argument validation.
4. Keep standalone and unified editor save, recent, restoration, and close behavior aligned; extract only shared pure logic that prevents drift.
5. Preserve the bounded close handshake and three recovery choices. Never trade shutdown reliability for shorter code.
6. Add focused tests for IPC routing, preload shape, shortcuts, close attempts, timeouts, and failures.

## Checks

Run tests and build every affected desktop package, for example:

```powershell
pnpm --filter @schdk/editor-desktop-app test
pnpm --filter @schdk/editor-desktop-app build
pnpm --filter @schdk/all-desktop-app test
pnpm --filter @schdk/all-desktop-app build
```

Close running packaged executables before rebuilding locked Windows output.
