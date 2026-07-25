# Cross-platform desktop builds

Status: proposed

Related documents:

- [Cross-platform desktop build research](../research/cross-platform-desktop-builds.md)
- [Windows desktop packaging improvement](windows-desktop-packaging.md)

## Goals

- Build native desktop artifacts for Windows, macOS, and Debian-based Linux
  from the existing Electron application.
- Retain an unpacked application and an installer/package for every platform.
- Produce repeatable artifacts through local package scripts and native GitHub
  Actions runners.
- Sign and notarize macOS release artifacts without storing credentials in the
  repository.

## Non-goals

- Replacing Electron or electron-builder.
- Adding a packaging SaaS.
- Publishing to the Mac App Store, Microsoft Store, Snap Store, or an APT
  repository.
- Adding automatic updates.
- Supporting Windows arm64, Linux arm64, RPM, AppImage, DMG, or universal
  macOS binaries in the first iteration.
- Changing application behavior or the `.schdk` format.

## Output contract

| Platform | Architecture | Unpacked output        | Distributable output |
| -------- | ------------ | ---------------------- | -------------------- |
| Windows  | x64          | `win-unpacked/ЩДК.exe` | NSIS setup `.exe`    |
| macOS    | x64          | `mac/ЩДК.app`          | app ZIP and `.pkg`   |
| macOS    | arm64        | `mac-arm64/ЩДК.app`    | app ZIP and `.pkg`   |
| Linux    | x64          | `linux-unpacked/schdk` | `.deb`               |

The macOS ZIP is only a transport container for the `.app`; the application
bundle remains the unpacked output.

Every distributable filename must include version and architecture. Platform
jobs upload separately named artifacts so files cannot overwrite one another.

## Package configuration

Extend `packages/all-desktop-app/package.json` after applying the existing
Windows packaging design:

```json
{
  "author": {
    "name": "<release maintainer>",
    "email": "<maintainer email>"
  },
  "scripts": {
    "build": "tsc && electron-builder --dir",
    "build:win": "tsc && electron-builder --win --x64",
    "build:mac": "tsc && electron-builder --mac --x64 --arm64",
    "build:linux": "tsc && electron-builder --linux --x64"
  },
  "build": {
    "electronLanguages": ["uk", "en-US"],
    "win": {
      "icon": "build/owl.png",
      "signExecutable": false,
      "target": ["dir", "nsis"],
      "artifactName": "${productName}-${version}-windows-${arch}.${ext}"
    },
    "mac": {
      "icon": "build/owl.png",
      "category": "public.app-category.games",
      "hardenedRuntime": true,
      "target": ["dir", "zip", "pkg"],
      "artifactName": "${productName}-${version}-macos-${arch}.${ext}"
    },
    "pkg": {
      "installLocation": "/Applications"
    },
    "linux": {
      "icon": "build/owl.png",
      "category": "Game",
      "executableName": "schdk",
      "target": ["dir", "deb"],
      "artifactName": "schdk-${version}-linux-${arch}.${ext}"
    },
    "deb": {
      "packageName": "schdk",
      "synopsis": "ЩДК game package editor and host"
    }
  }
}
```

The actual maintainer identity is a required implementation input; do not
commit placeholder metadata. `deb.maintainer` defaults to `author`.

Keep the normal `build` script platform-local and unpacked so root development
builds do not unexpectedly produce every installer. Release jobs call the
explicit platform scripts.

Do not add custom DEB dependencies initially. electron-builder's defaults cover
the standard Electron runtime. Add overrides only in response to a verified
target-distribution failure.

## Build graph

Each platform build must execute in this order:

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @schdk/all-web-app build`
3. `pnpm --filter @schdk/all-desktop-app build:<platform>`
4. platform validation
5. artifact upload

This explicit sequence keeps the renderer dependency classified as build-only
while guaranteeing that `extraResources` has a current web build.

Root `pnpm build` continues to produce development/unpacked output for the
current host in package-local `dist` directories. Release jobs upload directly
from `packages/all-desktop-app/dist/release`.

## GitHub Actions workflow

Add `.github/workflows/desktop-builds.yml` with three native jobs:

| Job       | Runner           | Command                                            |
| --------- | ---------------- | -------------------------------------------------- |
| `windows` | `windows-latest` | `pnpm --filter @schdk/all-desktop-app build:win`   |
| `macos`   | `macos-latest`   | `pnpm --filter @schdk/all-desktop-app build:mac`   |
| `linux`   | `ubuntu-latest`  | `pnpm --filter @schdk/all-desktop-app build:linux` |

Trigger the workflow with `workflow_dispatch` during rollout. Add version-tag
triggers only after all artifacts pass native smoke tests. Do not run these
large packaging jobs on every pull request; the existing PR tests workflow
remains the required correctness gate.

Use only official setup and artifact actions:

- `actions/checkout`;
- `pnpm/action-setup`;
- `actions/setup-node`;
- `actions/upload-artifact`.

Pin pnpm and Node to the versions declared by the repository. Cache pnpm's
store through `setup-node`; let electron-builder download platform tools on
demand.

Upload separately:

- `schdk-windows-x64`;
- `schdk-macos-x64`;
- `schdk-macos-arm64`;
- `schdk-linux-x64`.

The macOS job uploads electron-builder's ZIP and PKG files. It must not upload
the raw `.app` directory through a generic archiver.

## macOS signing and notarization

Release-quality macOS output requires:

- Developer ID Application certificate in `CSC_LINK`;
- its password in `CSC_KEY_PASSWORD`;
- Developer ID Installer certificate in `CSC_INSTALLER_LINK`;
- its password in `CSC_INSTALLER_KEY_PASSWORD`;
- Apple notarization API credentials in `APPLE_API_KEY`,
  `APPLE_API_KEY_ID`, and `APPLE_API_ISSUER`.

Store all values as GitHub Actions secrets. If the API key is stored as secret
content, materialize it into the runner's temporary directory and expose only
that temporary path as `APPLE_API_KEY`. Delete temporary credential files in an
`always()` cleanup step.

electron-builder performs signing and notarization when the variables are
present. The release workflow must fail rather than upload an unsigned macOS
artifact. Verify:

```bash
codesign --verify --deep --strict "dist/release/mac/ЩДК.app"
codesign --verify --deep --strict "dist/release/mac-arm64/ЩДК.app"
for pkg in dist/release/*.pkg; do pkgutil --check-signature "$pkg"; done
spctl --assess --type execute "dist/release/mac/ЩДК.app"
spctl --assess --type execute "dist/release/mac-arm64/ЩДК.app"
```

Use exact generated paths or resolve them once in the workflow; do not select
unrelated files with broad recursive globs.

Unsigned macOS builds are allowed only for local development and manual
experiments. They must use a distinct artifact name and never be attached to a
release.

## Platform verification

### Shared checks

Run before packaging:

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
```

Do not repeat the full shared suite in all three packaging jobs. Run it once,
then make packaging jobs depend on it.

### Windows

- Launch the unpacked executable.
- Install, launch, and uninstall the NSIS package.
- Open and save a `.schdk` file.
- Confirm the icon and Ukrainian UI.

### macOS

- Launch each architecture on matching hardware, or use an Intel test host and
  Apple Silicon test host before release.
- Verify app and PKG signatures and notarization.
- Install the PKG into `/Applications`, launch, then remove it.
- Confirm close/save behavior, file dialogs, recent files, and Dock icon.
- Confirm ZIP extraction preserves a runnable `.app`.

### Debian

Test on the oldest supported Ubuntu or Debian version and one current version:

```bash
sudo apt install ./schdk-*.deb
schdk
sudo apt remove schdk
```

Confirm the desktop launcher, icon, window association, file dialogs, audio,
open/save flows, and clean package removal. Run `dpkg-deb --info` and confirm
the package name, architecture, version, maintainer, description, and
dependencies.

## Rollout

1. Obtain the maintainer identity and Apple Developer credentials.
2. Apply the Windows size/installer design so the shared packaging baseline is
   current.
3. Add macOS and Linux configuration plus platform scripts.
4. Build unsigned local macOS and Linux test artifacts on native hosts.
5. Add the manually triggered GitHub Actions workflow.
6. Configure secrets and produce signed/notarized macOS artifacts.
7. Complete native smoke tests for all architectures.
8. Enable version-tag builds and document artifact download/install steps.
9. Update `docs/rules/desktop-apps.md`, `docs/rules/builds.md`,
   `$schdk-electron`, and the project README with the implemented contract.

## Risks and mitigations

| Risk                                                           | Mitigation                                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| macOS build silently skips signing                             | Validate signatures and Gatekeeper before upload                     |
| Wrong certificate signs PKG                                    | Supply the separate Installer certificate and check with `pkgutil`   |
| Notarization credentials leak                                  | Store only as CI secrets and use temporary files                     |
| x64 and arm64 artifacts overwrite each other                   | Include `${arch}` in filenames and artifact names                    |
| Raw `.app` loses metadata in transport                         | Distribute electron-builder's ZIP, retain `dir` only as build output |
| DEB metadata is incomplete                                     | Require maintainer identity and inspect with `dpkg-deb --info`       |
| Linux desktop launcher does not associate with the window      | Configure and test a stable executable/desktop identity              |
| Future native Node dependency breaks cross-architecture builds | Rebuild on target runners and add architecture-specific jobs         |
| Packaging consumes excessive PR minutes                        | Run on manual dispatch and version tags, not every PR                |

## Rollback

Remove the macOS/Linux target configuration, platform scripts, and desktop
workflow. Restore the Windows-only package configuration. No application data
or `.schdk` migration is involved.
