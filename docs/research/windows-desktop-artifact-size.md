# Windows desktop artifact size research

Date: 2026-07-25

## Executive summary

Keep electron-builder. It already supports both required outputs, and changing
Electron packaging tools would not remove Electron's Chromium/Node runtime.

The recommended low-risk work is:

1. Keep only the Ukrainian and English Electron locale packs.
2. Stop packaging `@schdk/all-web-app` and its transitive runtime dependencies
   inside `app.asar`; the compiled web application is already copied as an
   extra resource.
3. Build electron-builder's `dir` and `nsis` targets in the same production
   command.

This reduces the distributable footprint, but it does not materially shrink
`ЩДК.exe` itself. That file is primarily the Electron runtime.

## Current implementation

`@schdk/all-desktop-app` uses Electron 43.2.0 and electron-builder 26.15.3.
Its package:

- compiles Electron main/preload code with TypeScript;
- runs `electron-builder --dir`;
- includes only compiled Electron files and `package.json` as application
  files;
- copies `@schdk/all-web-app/dist` to `resources/web`;
- declares `@schdk/all-web-app` as a production dependency;
- produces only `dist/release/win-unpacked`.

The file filter is already narrow, and ASAR is already enabled by
electron-builder's default. The main avoidable costs are locales and duplicated
web dependencies.

## Measured baseline

Measurements were taken from a clean x64 Windows build in this worktree.

| Artifact or section                  |          Size |
| ------------------------------------ | ------------: |
| Unpacked directory                   |    362.31 MiB |
| `ЩДК.exe`                            |    215.17 MiB |
| All Electron locale packs            |     46.65 MiB |
| `resources/app.asar`                 |     14.50 MiB |
| Compiled `resources/web` application | under 0.5 MiB |
| Default NSIS installer               |     96.61 MiB |

The NSIS baseline was produced without changing repository configuration:

```powershell
pnpm --filter @schdk/all-desktop-app exec electron-builder --win nsis
```

### What is inside `app.asar`

The desktop main process does not import the web workspace packages at runtime;
it loads the already-built `resources/web/index.html`. However, declaring
`@schdk/all-web-app` as a production dependency makes electron-builder package
that workspace dependency and its complete transitive tree.

Largest extracted ASAR groups:

| Group                                    |           Size |
| ---------------------------------------- | -------------: |
| `react-dom/cjs`                          |       6.97 MiB |
| `@fortawesome/free-solid-svg-icons`      |       3.94 MiB |
| `@fortawesome/fontawesome-svg-core`      |       0.50 MiB |
| SCHDK web/UI workspace packages combined | about 1.57 MiB |
| `fflate` builds                          | about 0.63 MiB |

Most of this is already compiled into the separate Vite output and is not
loaded by Electron's main process.

## Existing-solution options

### 1. Restrict Electron locales

electron-builder supports `electronLanguages`; without it, all Electron locales
are copied. A build with only `uk` was measured through a CLI override:

```powershell
pnpm --filter @schdk/all-desktop-app exec electron-builder --win nsis --config.electronLanguages=uk
```

| Artifact           |   Baseline | Ukrainian-only | Reduction |
| ------------------ | ---------: | -------------: | --------: |
| Unpacked directory | 362.31 MiB |     316.78 MiB | 45.53 MiB |
| NSIS installer     |  96.61 MiB |      88.54 MiB |  8.07 MiB |
| Locales            |  46.65 MiB |       1.12 MiB | 45.53 MiB |

The implementation should retain `uk` and `en-US` rather than only `uk`, so
Electron has a predictable fallback. The extra English pack is about 0.54 MiB
unpacked, leaving almost all measured savings intact.

### 2. Remove duplicated production dependencies from ASAR

Move the build-only `@schdk/all-web-app` workspace edge from `dependencies` to
`devDependencies`. Turbo still needs the workspace edge for build ordering, but
electron-builder excludes development dependencies from packaged application
files.

Expected effect:

- remove almost all of the current 14.50 MiB `app.asar`;
- keep only compiled Electron main/preload files and package metadata;
- reduce the compressed installer further, though less than 14.50 MiB because
  NSIS already compresses repeated/text-heavy files.

The implementation must verify Turbo's dry-run graph still places
`@schdk/all-web-app#build` before `@schdk/all-desktop-app#build`.

### 3. Build unpacked and installer targets together

electron-builder supports multiple Windows targets. Configure:

```json
{
  "win": {
    "target": ["dir", "nsis"]
  }
}
```

Then a production `electron-builder --win` run emits both:

- `dist/release/win-unpacked/`;
- `dist/release/ЩДК Setup <version>.exe`.

Both artifacts remain under `packages/all-desktop-app/dist/release`.

### 4. Keep normal compression

electron-builder documents `normal` as the default and notes that `maximum`
does not produce a noticeable size improvement while increasing build time.
Changing compression is therefore not a useful optimization.

### 5. Keep ASAR enabled

ASAR is enabled by default. It reduces file-count overhead and provides a
single application archive, but it does not compress the Electron runtime.
Disabling it would not solve the size problem.

### 6. Do not build a custom Electron runtime

electron-builder can consume a custom Electron distribution, and Electron can
be built from source. That is the only route that might materially change the
215 MiB executable while retaining Electron, but it introduces a Chromium-scale
build, security-update, compatibility, and CI burden. Electron's own
documentation describes source builds as non-trivial. This is not justified
for SCHDK.

## Alternatives

| Alternative                                 | Size effect                                                                                                         | Installer/unpacked support                                                                              | Cost and risk                                                                                   | Decision                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Keep electron-builder                       | Removes locales and duplicate app dependencies; Electron runtime remains                                            | Native `dir` and NSIS targets                                                                           | Small configuration change                                                                      | Recommended                                                 |
| Electron Forge                              | Packages the same Electron runtime; no meaningful runtime-size advantage                                            | Forge makers produce Windows installers; electron-builder NSIS makers delegate back to electron-builder | Tooling migration without size benefit                                                          | Reject                                                      |
| `@electron/packager` plus installer tooling | Same Electron runtime floor; its docs state a minimal zipped app is approximately the prebuilt Electron binary size | Produces unpacked folders; requires separate installer tooling                                          | More moving pieces than the current solution                                                    | Reject                                                      |
| NSIS web installer                          | Tiny bootstrap executable, but downloads the same application payload                                               | Does not provide a self-contained offline installer                                                     | Requires network access during installation                                                     | Optional future distribution channel, not a replacement     |
| Tauri 2                                     | Materially smaller because it uses the OS WebView instead of bundling Chromium                                      | Produces NSIS setup executables and MSI packages                                                        | Rewrite Electron main/preload/IPC in Rust/plugins; WebView2 deployment and behavior differences | Reconsider only if size becomes a product-level requirement |

Tauri's size advantage is architectural, not a packaging flag. Its default
Windows installer may download the WebView2 bootstrapper; bundling an offline
or fixed WebView2 runtime adds roughly 127–180 MiB and removes much of the size
benefit.

## Recommendation

Implement locale filtering, move the web workspace edge to development
dependencies, and configure `dir` plus `nsis`. Expected unpacked size is about
303 MiB with both Ukrainian and English locales, roughly 16% below the current
baseline. The installer should remain below the measured 88.54 MiB
Ukrainian-only result plus the small English-locale cost, then shrink further
after duplicate ASAR dependencies are removed.

Treat the installer size and total unpacked directory as the useful metrics.
Do not use the size of `ЩДК.exe` as an acceptance criterion: it will remain near
215 MiB while SCHDK uses the stock Electron runtime.

## Sources

- [electron-builder configuration](https://www.electron.build/docs/configuration/)
- [electron-builder CLI](https://www.electron.build/docs/cli/)
- [electron-builder Windows target guide](https://www.electron.build/docs/targets/)
- [electron-builder NSIS target](https://www.electron.build/docs/nsis/)
- [Electron application distribution](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [Electron Packager size and distribution notes](https://electron.github.io/packager/main/index.html)
- [Electron Forge packaging](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging)
- [Electron Forge Squirrel.Windows maker](https://www.electronforge.io/config/makers/squirrel.windows)
- [Tauri overview and bundle-size model](https://tauri.app/start/)
- [Tauri process model](https://tauri.app/concept/process-model/)
- [Tauri Windows installers and WebView2 modes](https://v2.tauri.app/distribute/windows-installer/)
