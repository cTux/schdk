---
name: schdk-release
description: Prepare, publish, and verify a complete SCHDK GitHub Release. Use when the user says "make a release", "create a release", "publish a release", asks to release a version, or asks to repair an incomplete release. Own the version, Ukrainian changelog, release-preparation PR, required checks, merge, native Windows/macOS/Linux artifacts, signing gates, GitHub Actions run, and final release verification.
---

# SCHDK Release

Treat a request to make a release as authorization to complete the entire
release flow, including the release-preparation commit and pull request, merge
after required checks pass, workflow dispatch, tag and GitHub Release creation,
and artifact publication. Do not ask the user to perform routine steps.

## Workflow

1. Read `AGENTS.md`, `docs/RULES.md`, `docs/rules/builds.md`,
   `docs/rules/verification.md`, `docs/rules/desktop-apps.md`,
   `docs/rules/security.md`, `docs/guide/releases.md`, `CHANGELOG.md`,
   `.github/workflows/release.yml`, `.github/workflows/desktop-builds.yml`,
   `scripts/release-notes.mjs`, and
   `packages/all-desktop-app/package.json`.
2. Fetch `origin main --tags`, inspect the latest GitHub Release and tags, and
   inspect open pull requests and recent release workflow runs. Release only
   commits merged into `main`.
3. Use an explicitly requested SemVer version. Otherwise increment the patch
   component of the highest stable SemVer release or tag. Treat `X.Y.Z` and
   `vX.Y.Z` as the same version when finding the maximum; publish the canonical
   tag `vX.Y.Z`. Never reuse or move an existing complete release tag.
4. Build the Ukrainian changelog entry from user-visible commits since the
   previous release tag. Preserve an existing non-empty `## X.Y.Z` section;
   never overwrite hand-written notes. Keep the entry concise and omit
   repository-only chores unless they affect installation, security, or
   release behavior.
5. Ensure the release pipeline implements the contract below. If it does not,
   make the smallest required workflow, documentation, rule, specification,
   and skill changes as part of the same release-preparation pull request.
6. Check required Actions secret names with `gh secret list --app actions`.
   Secret values must never enter logs or repository files. Stop with the exact
   missing names when any required secret is absent.
7. Put release-preparation changes on a prompt-based `codex/` branch. Run
   `$schdk-sync-specs`, then `$schdk-quality`. Commit all task changes, fetch
   and rebase onto `origin/main`, reverify when the rebase changes the result,
   push, create a pull request, and wait for every required check.
8. When checks pass, merge the release-preparation pull request and delete its
   branch. Confirm the merge commit is on `origin/main`. A request to make a
   release authorizes this merge; never merge with failing or pending required
   checks.
9. Dispatch `release.yml` on `main` with `version=X.Y.Z`. Capture the new run
   ID, wait for completion, and inspect failed job logs if it does not succeed.
   Fix release automation through another checked pull request and retry; do
   not create a manual partial release.
10. Verify the published release before reporting success:
    - tag is exactly `vX.Y.Z` and targets the released `main` commit;
    - title and Ukrainian notes match the changelog section;
    - the workflow's signing, notarization, and package-validation steps passed;
    - all expected assets below exist once, are non-empty, and contain
      `X.Y.Z` in their filenames.
11. Return the release URL, version, released commit, and asset list. Do not
    claim completion while any required asset or verification is missing.

## Release Contract

Run shared formatting, linting, typechecking, and tests once. Package on native
runners and publish only from the final job after every platform job succeeds:

- Windows x64:
  `schdk-X.Y.Z-windows-x64-installer.exe` and
  `schdk-X.Y.Z-windows-x64-portable.exe`.
- macOS x64:
  `schdk-X.Y.Z-macos-x64.zip` and `schdk-X.Y.Z-macos-x64.pkg`.
- macOS arm64:
  `schdk-X.Y.Z-macos-arm64.zip` and `schdk-X.Y.Z-macos-arm64.pkg`.
- Debian Linux x64: `schdk-X.Y.Z-linux-x64.deb`.

Use `scripts/release-notes.mjs X.Y.Z release-notes.md` as the changelog and
SemVer gate. Pass the version to electron-builder as
`--config.extraMetadata.version=X.Y.Z` in every platform job. Transfer native
outputs with pinned official upload/download artifact actions, then create one
GitHub Release only after all outputs validate.

Require valid Authenticode signatures for both Windows release executables.
Require Developer ID signing, PKG signing, notarization, and Gatekeeper
validation for both macOS architectures. Verify Debian package name `schdk`,
architecture `amd64`, non-empty maintainer, and version `X.Y.Z`. Unsigned
artifacts may remain manual development artifacts but must never be attached to
a GitHub Release.

Required secret names:

- `GOOGLE_DESKTOP_CREDENTIALS_JSON`
- `WINDOWS_CERTIFICATE_BASE64`
- `WINDOWS_CERTIFICATE_PASSWORD`
- `MACOS_APPLICATION_CERTIFICATE_BASE64`
- `MACOS_APPLICATION_CERTIFICATE_PASSWORD`
- `MACOS_INSTALLER_CERTIFICATE_BASE64`
- `MACOS_INSTALLER_CERTIFICATE_PASSWORD`
- `APPLE_API_KEY`
- `APPLE_API_KEY_ID`
- `APPLE_API_ISSUER`

Materialize certificates, OAuth credentials, and the Apple API key only under
the runner temporary directory. Remove them in `if: always()` cleanup steps.
Keep every third-party action pinned to a full commit SHA with its release tag
in a comment.

## Existing or Failed Releases

- If the selected version already has a complete release, report its URL and
  do not rebuild it.
- If the highest release is incomplete, malformed, or uses a noncanonical tag,
  default to the next patch version. Do not delete, retarget, or overwrite a
  published tag without an explicit request.
- If a workflow fails before GitHub Release creation, fix and rerun the same
  version.
- If publication partially succeeds, upload only verified missing assets when
  the existing canonical tag targets the intended commit and its notes match.
  Otherwise stop rather than mutating release history.
