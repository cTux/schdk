---
name: schdk-electron
description: Build, debug, secure, or package SCHDK Electron applications. Use for BrowserWindow behavior, maximization, titles, icons, navigation blocking, main/preload IPC, file authorization, recent files, session restoration, save-before-close handshakes, Electron security, or electron-builder output.
---

# SCHDK Electron

## Workflow

1. Read `docs/rules/desktop-apps.md`, `docs/rules/security.md`, `docs/rules/architecture.md`, and `docs/rules/tooling-and-quality.md`.
2. Keep filesystem and Electron APIs in `@schdk/all-desktop-app`. Expose only narrow validated methods through its self-contained `.cts` preload.
3. Preserve context isolation, navigation blocking, file-path authorization, recent-path allowlists, and IPC argument validation.
4. Preserve the bounded close handshake and three recovery choices. Never trade shutdown reliability for shorter code.
5. Add tests only through `$schdk-add-missing-tests` when explicitly prompted.

## Checks

Run tests and build the unified desktop package:

```powershell
pnpm --filter @schdk/all-desktop-app test
pnpm --filter @schdk/all-desktop-app build
```

Close running packaged executables before rebuilding locked Windows output.
