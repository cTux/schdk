# Cross-platform desktop build research

Date: 2026-07-25

Status: implemented

## Answer

SCHDK builds its supported Windows and Debian-based Linux artifacts with the
existing electron-builder dependency. No specialized packaging service is
required.

Native GitHub-hosted runners are the smallest repeatable build environment:

- Windows produces an unpacked x64 application, NSIS installer, and portable
  executable;
- Ubuntu produces an unpacked x64 application and `.deb` package.

The platform scripts cannot replace native packaging tools or smoke tests.

## Implemented repository contract

`@schdk/desktop` exposes `package:win` and `package:linux`. The manually
dispatched `Desktop builds` workflow runs shared checks once, packages each
target on its native runner, validates the generated output, and uploads
separately named artifacts.

| Platform | Architecture | Unpacked output        | Distributable output |
| -------- | ------------ | ---------------------- | -------------------- |
| Windows  | x64          | `win-unpacked/ЩДК.exe` | NSIS and portable    |
| Linux    | x64          | `linux-unpacked/schdk` | `.deb`               |

Windows release publication remains a separate workflow. Direct `.deb`
downloads do not require package signing; publishing an APT repository would
be a separate feature.

## Sources

- [electron-builder multi-platform builds](https://www.electron.build/docs/features/multi-platform-build/)
- [electron-builder Windows targets](https://www.electron.build/win/)
- [electron-builder Linux targets](https://www.electron.build/linux/)
- [GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
