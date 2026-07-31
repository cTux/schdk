---
name: schdk-release
description: Prepare, publish, repair, and verify an SCHDK GitHub Release with one unsigned Windows x64 installer. Use for any request to release a version.
---

# SCHDK Release

Treat a request to make a release as authorization to complete the entire
release flow: prepare and merge the checked release pull request, dispatch the
workflow, and verify the published GitHub Release.

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, `docs/rules/builds.md`,
   `docs/rules/verification.md`, `docs/rules/desktop-apps.md`,
   `docs/rules/security.md`, `docs/guide/releases.md`, `CHANGELOG.md`,
   `.github/workflows/release.yml`, `scripts/release-notes.mjs`, and
   `packages/desktop/package.json`, and
   `packages/web/version.json`.
2. Fetch `origin main --tags`; inspect releases, tags, open pull requests, and
   recent release runs. Release only commits merged into `main`.
3. Use an explicitly requested SemVer version. Otherwise increment the patch
   component of the highest stable SemVer release or tag. Treat `X.Y.Z` and
   `vX.Y.Z` as the same version and publish the canonical tag `vX.Y.Z`.
4. Set `packages/web/version.json` to the selected version. Build
   concise Ukrainian changelog notes from commits since the previous release.
   Separate `### Продуктові рішення` from `### Технічні рішення` and prefix
   every item with `[NEW]`, `[CHANGE]`, `[FIX]`, `[DELETE]`, or `[SECURITY]`.
   Preserve existing non-empty notes.
5. Require `GOOGLE_DESKTOP_CREDENTIALS_JSON` in GitHub Actions. Never expose its
   value or commit it.
6. Put preparation changes on a prompt-based `codex/` branch. Run
   `$schdk-sync-specs`, then `$schdk-quality`. Commit, rebase onto
   `origin/main`, reverify if needed, push, create a pull request, and wait for
   required checks.
7. Merge only after required checks pass and confirm the merge is on
   `origin/main`.
8. Dispatch `release.yml` on `main` with `version=X.Y.Z`. Wait for completion;
   repair failures through another checked pull request and retry the same
   version if no release was created.
9. Verify the tag `vX.Y.Z` targets the released `main` commit, the Ukrainian
   notes match `CHANGELOG.md`, and the release contains exactly one non-empty
   asset named `schdk-X.Y.Z-windows-x64-installer.exe`.
10. Return the release URL, version, released commit, and asset name.

## Release Contract

Run formatting, linting, typechecking, and tests once. Package on
`windows-latest` with electron-builder's NSIS target and publish only:

`schdk-X.Y.Z-windows-x64-installer.exe`

Pass the version with `--config.extraMetadata.version=X.Y.Z`, disable signing
identity discovery, and verify the installer is non-empty and unsigned. Use
`scripts/release-notes.mjs X.Y.Z release-notes.md` as the changelog and SemVer
gate; it must reject missing decision sections, empty sections, unprefixed
items, and a mismatched `packages/web/version.json`. Materialize Google
desktop credentials only under the runner temporary directory and remove them
in an `if: always()` step. Keep third-party actions pinned to full commit SHAs.

## Existing or Failed Releases

- If the selected version already has a complete release, report it without
  rebuilding.
- Never reuse, move, delete, or overwrite a complete release tag.
- If a run fails before release creation, fix and rerun the same version.
- If publication partially succeeds, stop rather than mutating release history.
