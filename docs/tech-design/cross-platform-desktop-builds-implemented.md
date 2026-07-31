# Cross-platform desktop builds

Status: implemented

Related documents:

- [Cross-platform desktop build research](../research/cross-platform-desktop-builds-implemented.md)
- [Windows desktop packaging improvement](windows-desktop-packaging-implemented.md)

## Goals

- Build native desktop artifacts for Windows and Debian-based Linux from the
  existing Electron application.
- Retain an unpacked application and an installer or package for each platform.
- Produce repeatable artifacts through package scripts and native GitHub
  Actions runners.

## Non-goals

- Replacing Electron or electron-builder.
- Adding a packaging service or application store.
- Adding automatic updates beyond the existing release notification.
- Supporting additional architectures or Linux package formats without demand
  and a native test target.

## Output contract

| Platform | Architecture | Unpacked output        | Distributable output |
| -------- | ------------ | ---------------------- | -------------------- |
| Windows  | x64          | `win-unpacked/ЩДК.exe` | NSIS and portable    |
| Linux    | x64          | `linux-unpacked/schdk` | `.deb`               |

Every distributable filename includes its version and architecture. Platform
jobs upload separately named artifacts so files cannot overwrite one another.

## Build graph

Each native build executes:

1. `pnpm install --frozen-lockfile`
2. `pnpm turbo build --filter=@schdk/desktop`
3. the matching `package:win` or `package:linux` script
4. native artifact validation
5. artifact upload

The manually dispatched workflow runs shared formatting, linting, typechecking,
and tests once before both packaging jobs.

## Verification

Windows validation requires the unpacked executable, NSIS installer, and
portable executable. Linux validation requires an executable unpacked binary
and uses `dpkg-deb` to verify the package name, `amd64` architecture, and
non-empty maintainer.

Generated output stays under `packages/desktop/dist/release` and remains
untracked.
