---
name: schdk-electron
description: Build, debug, secure, or package SCHDK Electron applications. Use for BrowserWindow behavior, maximization, titles, icons, navigation blocking, main/preload IPC, file authorization, recent files, session restoration, save-before-close handshakes, Electron security, or electron-builder output.
---

# SCHDK Electron

## Workflow

1. Follow `$schdk-development`, then read `docs/rules/desktop-apps.md`, `docs/rules/security.md`, and `docs/rules/builds.md`.
2. Trace main, preload, renderer, and packaging paths affected by the change.
3. Keep Electron and filesystem access inside `@schdk/all-desktop-app`; preserve every trust boundary in the rules.
4. Read `docs/rules/google-drive.md` for OAuth, secure token storage, or Drive
   IPC changes. Package installed-app OAuth client configuration from the
   ignored credentials resource, keep it in Electron main, and never expose it
   through renderer IPC.
5. Keep Drive package IPC limited to validated create, update, delete, list,
   and load operations; renderer code never receives access tokens or generic
   requests.
6. Keep filesystem package IPC limited to explicit downloads. Local file import
   uses the renderer file chooser and uploads through the Drive bridge.
7. Keep user AI API keys in the current Google account's separate Drive app
   data; expose only save, remove, and configured-status IPC. Migrate a legacy
   `safeStorage` key only after a successful Drive write.
8. For Windows release packaging, keep local `package` output unpacked and use
   `package:win` for the versioned NSIS installer and portable executable.
   Release notes come from the matching Ukrainian `CHANGELOG.md` section.
   Require the PFX certificate secrets and verify every release executable's
   Authenticode signature before upload; local unpacked builds may be unsigned.

## Checks

Run tests and build the unified desktop package:

```powershell
pnpm --filter @schdk/all-desktop-app test
pnpm turbo package --filter @schdk/all-desktop-app
```

Close running packaged executables before rebuilding locked Windows output.
For release-packaging changes, also run
`pnpm --filter @schdk/all-desktop-app package:win`.
