# Windows desktop packaging improvement

Status: proposed

Related research:
[Windows desktop artifact size research](../research/windows-desktop-artifact-size.md)

## Goals

- Reduce the unpacked Windows distribution and installer download size using
  the existing Electron/electron-builder stack.
- Produce both the unpacked application and a compiled NSIS installer from the
  normal production build.
- Preserve current Electron behavior, security boundaries, and icon handling.

## Non-goals

- Shrinking the stock Electron executable itself.
- Migrating to Tauri, Electron Forge, MSI, a web installer, or a portable
  single-file target.
- Adding publishing, automatic updates, or code signing.
- Refactoring renderer or Electron application behavior.

## Design

### Package dependency classification

In `packages/all-desktop-app/package.json`, move
`@schdk/all-web-app: workspace:*` from `dependencies` to `devDependencies`.

The relationship is build-time only:

- Turbo uses it to build the web application before desktop packaging.
- electron-builder copies the compiled web output through `extraResources`.
- Electron loads `resources/web/index.html`; main/preload code does not import
  `@schdk/all-web-app` at runtime.

Classifying it as a development dependency prevents electron-builder from
copying the web package and its transitive React, Font Awesome, and SCHDK
dependencies into `app.asar`.

### electron-builder configuration

Keep the existing file filters, extra resource, icon, and
`signExecutable: false`. Add locale and target configuration:

```json
{
  "build": {
    "electronLanguages": ["uk", "en-US"],
    "win": {
      "icon": "build/owl.png",
      "signExecutable": false,
      "target": ["dir", "nsis"]
    }
  }
}
```

Do not set `compression: maximum`; keep electron-builder's `normal` default.
Do not disable ASAR.

### Package scripts

Production builds must create both artifacts, while development startup should
continue building only the unpacked directory:

```json
{
  "scripts": {
    "dev": "pnpm --filter @schdk/all-web-app build && tsc && electron-builder --dir && electron .",
    "build": "tsc && electron-builder --win"
  }
}
```

The configured Windows targets make `electron-builder --win` build `dir` and
`nsis`. Keeping `--dir` in `dev` avoids compiling an installer on every local
application launch.

### Output contract

Package-local output:

```text
packages/all-desktop-app/dist/release/
  win-unpacked/
  ЩДК Setup <version>.exe
  ЩДК Setup <version>.exe.blockmap
```

Root `pnpm build` leaves this output in the package-local directory.

The block map is expected electron-builder output. It may be retained for
future updates even though publishing is out of scope.

## Implementation steps

1. Move `@schdk/all-web-app` to desktop `devDependencies` with pnpm and update
   `pnpm-lock.yaml`.
2. Add `electronLanguages: ["uk", "en-US"]`.
3. Change `win.target` from `"dir"` to `["dir", "nsis"]`.
4. Change the production and development scripts as specified above.
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

Confirm `@schdk/all-desktop-app#build` still depends on
`@schdk/all-web-app#build`. If moving the dependency category removes that
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
$root = 'packages/all-desktop-app/dist/release'
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
| Unsigned installer triggers Windows warnings          | Preserve current unsigned behavior; handle signing as a separate release task  |
| Windows locks an existing unpacked executable         | Close all packaged SCHDK processes before rebuilding                           |

## Rollback

Restore `@schdk/all-web-app` to production dependencies, remove
`electronLanguages`, restore `win.target: "dir"`, and restore the current
scripts. No application data or file-format migration is involved.
