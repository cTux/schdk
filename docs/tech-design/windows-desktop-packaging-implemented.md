# Windows desktop packaging improvement

Status: implemented

Related research:
[Windows desktop artifact size research](../research/windows-desktop-artifact-size-implemented.md)

## Goals

- Reduce the unpacked Windows distribution and installer download size using
  the existing Electron/electron-builder stack.
- Produce unpacked, NSIS installer, and portable Windows artifacts.
- Preserve current Electron behavior, security boundaries, and icon handling.

## Non-goals

- Shrinking the stock Electron executable itself.
- Migrating to Tauri, Electron Forge, MSI, or a web installer.
- Adding publishing or automatic updates.
- Refactoring renderer or Electron application behavior.

## Design

### Package dependency classification

In `packages/desktop/package.json`, move
`@schdk/web: workspace:*` from `dependencies` to `devDependencies`.

The relationship is build-time only:

- Turbo uses it to build the web application before desktop packaging.
- electron-builder copies the compiled web output through `extraResources`.
- Electron loads `resources/web/index.html`; main/preload code does not import
  `@schdk/web` at runtime.

Classifying it as a development dependency prevents electron-builder from
copying the web package and its transitive React, Font Awesome, and SCHDK
dependencies into `app.asar`.

### electron-builder configuration

Keep the existing file filters, extra resource, and icon. Add locale and target
configuration:

```json
{
  "build": {
    "electronLanguages": ["uk", "en-US"],
    "win": {
      "icon": "build/owl.png",
      "target": ["nsis", "portable"]
    }
  }
}
```

Do not set `compression: maximum`; keep electron-builder's `normal` default.
Do not disable ASAR.

### Package scripts

Keep compilation and packaging separate. Normal local packaging builds the
unpacked directory; native Windows packaging builds the installer and portable
artifacts:

```json
{
  "scripts": {
    "build": "tsc",
    "package": "electron-builder --dir",
    "package:win": "electron-builder --win --x64"
  }
}
```

The configured Windows targets make `electron-builder --win` build `nsis` and
`portable`; electron-builder retains `win-unpacked` for verification. Keeping
`--dir` in the normal `package` command avoids compiling distributable artifacts
during local packaging.

### Output contract

Package-local output:

```text
packages/desktop/dist/release/
  win-unpacked/
  schdk-<version>-windows-x64-installer.exe
  schdk-<version>-windows-x64-installer.exe.blockmap
  schdk-<version>-windows-x64-portable.exe
```

Packaging commands leave this output in the package-local directory.

The block map is expected electron-builder output. It may be retained for
future updates even though publishing is out of scope.

## Implementation steps

1. Move `@schdk/web` to desktop `devDependencies` with pnpm and update
   `pnpm-lock.yaml`.
2. Add `electronLanguages: ["uk", "en-US"]`.
3. Configure the Windows targets as `nsis` and `portable`.
4. Keep compilation and platform packaging in separate scripts.
5. Run `pnpm install --frozen-lockfile` after the normal install verifies the
   lockfile is reproducible.
6. Run the verification and measurements below.
7. Update `docs/rules/desktop-apps.md`, `docs/rules/builds.md`,
   `$schdk-electron`, and user-facing build documentation to describe both
   artifacts.

## Verification

### Build graph

```powershell
pnpm turbo run build --dry=json
```

Confirm `@schdk/desktop#build` still depends on
`@schdk/web#build`. If moving the dependency category removes that
edge, stop and add an explicit Turbo build dependency before packaging.

### Repository checks

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Artifact checks

- Launch `win-unpacked/ЩДК.exe`.
- Confirm the shell, host, editor, visual editor, audio, icon, and Ukrainian UI
  load from packaged resources.
- Open, edit, save, reopen, and restore a `.schdk` file.
- Install with `ЩДК Setup <version>.exe`, launch the installed application, and
  uninstall it.
- Confirm both artifacts exist in the package-local `dist`.
- Inspect `resources/app.asar` and confirm it no longer contains React,
  Font Awesome, or SCHDK renderer workspace packages.
- Confirm only `uk.pak` and `en-US.pak` remain under `locales`.

### Size checks

Record the same metrics used by the research:

```powershell
$root = 'packages/desktop/dist/release'
$files = Get-ChildItem "$root/win-unpacked" -Recurse -File
($files | Measure-Object Length -Sum).Sum / 1MB
(Get-Item "$root/win-unpacked/ЩДК.exe").Length / 1MB
(Get-Item "$root/win-unpacked/resources/app.asar").Length / 1MB
(Get-Item "$root/ЩДК Setup 0.1.0.exe").Length / 1MB
```

Acceptance thresholds:

- unpacked directory: at most 305 MiB;
- NSIS installer: below the 96.61 MiB baseline and preferably below 90 MiB;
- `app.asar`: contains only desktop runtime files and is below 1 MiB;
- `ЩДК.exe`: no meaningful regression from the 215.17 MiB baseline.

## Risks and mitigations

| Risk                                                  | Mitigation                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Turbo stops building the web app first                | Verify the dry-run graph; add an explicit task edge if needed                  |
| electron-builder still packages renderer dependencies | Inspect ASAR contents and use an electron-builder file hook only as a fallback |
| Missing Electron locale causes fallback issues        | Keep both `uk` and `en-US`; test on Ukrainian and non-Ukrainian Windows        |
| Production builds become slower                       | Keep development on `--dir`; only production builds compile NSIS               |
| Unsigned installer triggers Windows warnings          | Keep artifact naming and release verification explicit                         |
| Windows locks an existing unpacked executable         | Close all packaged SCHDK processes before rebuilding                           |

## Rollback

Restore `@schdk/web` to production dependencies, remove
`electronLanguages`, restore `win.target: "dir"`, and restore the current
scripts. No application data or file-format migration is involved.
