---
name: schdk-electron
description: Build, debug, secure, or package SCHDK Electron code. Use for windows, main/preload IPC, files, sessions, close handling, security, or electron-builder output.
---

# SCHDK Electron

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/desktop-apps.md`,
   `docs/rules/security.md`, and `docs/rules/builds.md`.
2. Trace main, preload, renderer, and packaging paths affected by the change.
3. Read `docs/rules/google-drive.md` only for OAuth, token storage, or Drive IPC
   changes.
4. For OAuth changes, verify required scopes before persistence and remove
   invalidated refresh credentials before requiring reconnection.
5. Validate changed IPC and filesystem paths from the renderer call through
   main-process handling and the resulting Drive or explicit-download action.
   Keep preload code within Electron's sandboxed API surface.
6. For Windows or Linux packaging changes, verify only on the matching native
   host or workflow described by the rules.

## Checks

Run tests and build the unified desktop package:

```powershell
pnpm --filter @schdk/desktop test
pnpm turbo package --filter @schdk/desktop
```

Close running packaged executables before rebuilding locked Windows output.
Run the matching native packaging command for packaging changes.
