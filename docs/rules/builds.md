# Builds and generated artifacts

- Use Turbo for `build`, `lint`, `typecheck`, and `test`; package builds must
  declare cacheable output under `dist/**`.
- Cache only `dist/electron/**` for the `@schdk/all-desktop-app` build. Run its
  Electron packaging task without caching so `dist/release/**`, including
  executable files, never enters the Turbo cache.
- Root `pnpm build` builds packages in dependency order, then packages the
  desktop application, and leaves artifacts in each package's own `dist`.
- Run the pull-request root build on `windows-latest` so CI verifies the
  supported Windows desktop package, then launch that packaged renderer through
  its smoke-test mode.
- Keep third-party modules from `node_modules` in a separate `vendors` chunk
  for every runnable Vite application instead of merging them into its main
  application bundle.
- If parallel root packaging makes Electron's Windows icon tool exit with
  `3221225477` after producing the icon, rerun the affected desktop package
  build sequentially.
- Do not edit or commit `node_modules`, `dist`, `.turbo`, `.playwright-cli`,
  logs, coverage, or TypeScript build-info files.
- Keep Electron output native to Windows, macOS, and Linux while web output
  remains usable through relative `file:` URLs.
- Run the manually dispatched `Desktop builds` workflow on native Windows,
  macOS, and Ubuntu runners after one shared verification job. Upload unsigned
  Windows x64, macOS x64/arm64, and Debian x64 artifacts separately; never
  attach them to a GitHub Release.
- Deploy `@schdk/all-web-app` to GitHub Pages after every push to `main` through
  the official Pages artifact and deployment actions.
- In pull requests, load the production unified web shell in headless Chrome
  and require its Google login view to render.
- Create releases only from `main` through the manual release workflow. Require
  a SemVer version and matching Ukrainian `CHANGELOG.md` section with separate
  product and technical decision lists. Prefix every list item with `[NEW]`,
  `[CHANGE]`, `[FIX]`, `[DELETE]`, or `[SECURITY]`, run shared checks once, and
  package on a native Windows runner.
- GitHub Releases contain exactly one non-empty, unsigned, version-matched
  Windows x64 NSIS installer.
- Route requests to prepare, publish, repair, or verify a GitHub Release through
  `$schdk-release`; it owns the changelog, checked release-preparation pull
  request, merge, workflow dispatch, wait, and final release verification.
