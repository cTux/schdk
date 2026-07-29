# Cross-platform desktop build research

Date: 2026-07-25

## Answer

SCHDK can build every requested artifact with its existing
electron-builder dependency:

- Windows: unpacked application containing `ЩДК.exe` and an NSIS `.exe`
  installer;
- macOS: an unpacked `.app` bundle and a `.pkg` installer;
- Debian-based Linux: an unpacked application and a `.deb` package.

No specialized packaging service is required. Package scripts can select the
targets, but they cannot replace the platform toolchains:

- production macOS signing works only on macOS;
- `.deb` should be built and tested on Linux;
- Windows output is safest to build and test on Windows.

The builds can run on local native machines, self-hosted CI runners, or hosted
CI. Because this repository already uses GitHub Actions, a three-platform
GitHub-hosted workflow is the smallest repeatable solution. Apple Developer
certificates and Apple's notarization service are still required for a trusted
macOS release; that is a distribution requirement, not a packaging service.

## Current repository

`@schdk/desktop` currently uses Electron 43.2.0 and electron-builder
26.15.3. Its production package:

- compiles platform-neutral TypeScript main and preload code;
- copies the already-built unified web application through `extraResources`;
- configures only the Windows `dir` target;
- produces `dist/release/win-unpacked/`, which contains `ЩДК.exe`;
- is not signed.

The Electron code already uses portable APIs for application data, paths,
dialogs, files, and resources. It also implements the normal macOS
`activate`/`window-all-closed` lifecycle. No application rewrite is required.

The existing 512×512 PNG meets electron-builder's minimum icon size for
Windows, macOS, and Linux. A 1024×1024 source or SVG would improve high-resolution
macOS rendering but is not a build blocker.

Related Windows installer and size work is documented in:

- [Windows desktop artifact size research](windows-desktop-artifact-size.md)
- [Windows desktop packaging design](../tech-design/windows-desktop-packaging.md)

## Artifact and build-host matrix

| Platform            | Requested output   | electron-builder target | Recommended host | Release trust requirement                                                        |
| ------------------- | ------------------ | ----------------------- | ---------------- | -------------------------------------------------------------------------------- |
| Windows x64         | unpacked `ЩДК.exe` | `dir`                   | Windows          | Optional signing; current behavior is unsigned                                   |
| Windows x64         | installer `.exe`   | `nsis`                  | Windows          | Code signing recommended                                                         |
| macOS x64 and arm64 | `.app` bundle      | `dir`                   | macOS            | Developer ID Application signature and notarization                              |
| macOS x64 and arm64 | `.pkg` installer   | `pkg`                   | macOS            | Developer ID Application plus Developer ID Installer signatures and notarization |
| Debian/Ubuntu x64   | `.deb`             | `deb`                   | Ubuntu/Debian    | No package signature required for direct download                                |

An `.app` is a directory bundle, not a single file. Keep the bundle in the
unpacked build output and also produce a ZIP transport artifact so CI and
download servers preserve the bundle structure, executable modes, and
signature.

## What build scripts can do

electron-builder supports platform flags and multiple configured targets. The
repository can expose deterministic scripts such as:

```json
{
  "scripts": {
    "build:win": "tsc && electron-builder --win --x64",
    "build:mac": "tsc && electron-builder --mac --x64 --arm64",
    "build:linux": "tsc && electron-builder --linux --x64"
  }
}
```

With `dir` plus the platform installer configured for each platform, these
commands create both unpacked and installable outputs. They work locally on the
appropriate OS and identically in CI.

Scripts do not provide an operating system, native signing tools, certificates,
or physical platform testing. electron-builder explicitly warns against
expecting one host to build everything. Native Node dependencies also need
target-compatible binaries; SCHDK currently has no native runtime dependency,
but that must be rechecked if dependencies change.

## Platform details

### Windows

The current Windows build already works. The separate Windows packaging design
adds the NSIS target while retaining `win-unpacked`. Keep x64 as the supported
architecture until Windows on ARM is requested and tested.

electron-builder can cross-build Windows under Wine, but a Windows runner is
simpler and permits a native launch/install smoke test. Signing remains a
separate release-hardening decision.

### macOS

The `dir` target emits a directory containing `ЩДК.app`; `pkg` emits Apple's
installer format. Add `zip` only as a transport wrapper around the signed app
bundle.

Build separate x64 and arm64 artifacts. This keeps each Electron download
smaller than a universal binary and avoids requiring users to download both
architectures. A universal build remains an option if a single download becomes
more important than size.

For direct distribution without Gatekeeper failures:

1. Sign the `.app` with a Developer ID Application certificate.
2. Sign the `.pkg` with the distinct Developer ID Installer certificate.
3. Enable Hardened Runtime.
4. Submit to Apple's notary service and staple the ticket.

electron-builder supports both certificates and notarization through
environment variables. Certificates and credentials must be CI secrets, never
repository files. Unsigned local builds are possible for development, but they
are not release artifacts.

PKG is supported, but it is heavier than necessary for a self-contained
consumer application that only belongs in `/Applications`. A DMG is the usual
consumer format. Keep PKG because it is explicitly required; reconsider DMG
only if user testing shows the native Installer flow is undesirable.

### Debian-based Linux

The `deb` target produces a package installable with `apt` or `dpkg`. Build it
on Ubuntu and retain the default Electron runtime dependencies unless testing
proves an override is needed.

The package needs:

- an ASCII package and executable name such as `schdk`;
- maintainer name and email;
- a short synopsis and description;
- a Linux desktop category and stable desktop-file identity;
- the application icon.

Start with x64. Add arm64 only when there is a supported device/test runner and
release demand. Direct `.deb` downloads do not require code signing. If SCHDK
later publishes an APT repository, repository metadata signing is a separate
requirement.

## Automation options

| Option                                 | Can build all requested outputs? | Advantages                                                                                     | Drawbacks                                                           | Decision                             |
| -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| Scripts on one Windows machine         | No production macOS build        | No infrastructure change                                                                       | Cannot perform macOS signing; Linux cross-build adds Docker/tooling | Reject                               |
| Local Windows, Mac, and Linux machines | Yes                              | No hosted build service                                                                        | Manual, environment drift, credentials on developer machines        | Suitable fallback                    |
| Self-hosted native CI runners          | Yes                              | Full control; no hosted compute dependency                                                     | Three machines to secure and maintain                               | Use only if hosted CI is unavailable |
| GitHub-hosted Actions matrix           | Yes                              | Native OS runners, parallel builds, existing repository integration, official artifact storage | Hosted minutes and secret management                                | Recommended                          |
| Specialized Electron packaging SaaS    | Yes                              | Managed signing/release features                                                               | Additional cost, credentials, lock-in, and no current need          | Reject                               |
| Docker on one host                     | Windows and Linux only           | Reproducible Linux toolchain                                                                   | Cannot solve macOS signing or native macOS validation               | Optional for local Linux builds      |

GitHub Actions is not technically required. It is the recommended execution
environment, while electron-builder remains the packaging implementation.

## Recommendation

Keep electron-builder and add platform-specific configuration and scripts.
Create one GitHub Actions workflow with native Windows, macOS, and Ubuntu jobs:

- build x64 Windows unpacked and NSIS outputs;
- build separate x64 and arm64 macOS app ZIPs and PKG installers, signed and
  notarized for releases;
- build x64 Linux unpacked and DEB outputs;
- upload artifacts with GitHub's official `upload-artifact` action;
- run on manual dispatch initially, then version tags after platform smoke tests
  are established.

Do not add a packaging SaaS. The only unavoidable external release dependency
is Apple Developer signing/notarization for trusted macOS distribution.

## Sources

- [electron-builder multi-platform build](https://www.electron.build/docs/features/multi-platform-build/)
- [electron-builder target selection](https://www.electron.build/docs/targets/)
- [electron-builder CLI](https://www.electron.build/docs/cli/)
- [electron-builder architecture support](https://www.electron.build/docs/architecture/)
- [electron-builder macOS configuration](https://www.electron.build/mac/)
- [electron-builder PKG target](https://www.electron.build/docs/pkg/)
- [electron-builder macOS code signing](https://www.electron.build/docs/features/code-signing/code-signing-mac/)
- [electron-builder notarization](https://www.electron.build/docs/notarization/)
- [electron-builder Linux and DEB configuration](https://www.electron.build/docs/linux/)
- [electron-builder icon requirements](https://www.electron.build/docs/features/icons-and-images/)
- [electron-builder GitHub Actions guide](https://www.electron.build/docs/features/github-actions/)
- [Apple software distribution](https://developer.apple.com/documentation/technologyoverviews/distribution)
- [Apple notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- [Apple Developer ID certificate types](https://developer.apple.com/help/glossary/developer-id-certificate/)
- [GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
