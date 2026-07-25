---
name: schdk-electron
description: Build, debug, secure, or package SCHDK Electron applications. Use for BrowserWindow behavior, maximization, titles, icons, navigation blocking, main/preload IPC, file authorization, recent files, session restoration, save-before-close handshakes, Electron security, or electron-builder output.
---

# SCHDK Electron

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/desktop-apps.md`, `docs/rules/security.md`, and `docs/rules/builds.md`.
2. Trace main, preload, renderer, and packaging paths affected by the change.
3. Keep Electron and filesystem access inside `@schdk/all-desktop-app`; preserve every trust boundary in the rules.
4. Read `docs/rules/google-drive.md` for OAuth, secure token storage, or Drive IPC changes.

## Checks

Run tests and build the unified desktop package:

```powershell
pnpm --filter @schdk/all-desktop-app test
pnpm turbo package --filter @schdk/all-desktop-app
```

Close running packaged executables before rebuilding locked Windows output.
