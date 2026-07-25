# Builds and generated artifacts

- Use Turbo for `build`, `lint`, `typecheck`, and `test`; package builds must
  declare cacheable output under `dist/**`.
- Cache only `dist/electron/**` for the `@schdk/all-desktop-app` build. Run its
  Electron packaging task without caching so `dist/release/**`, including
  executable files, never enters the Turbo cache.
- Root `pnpm build` builds packages in dependency order, then packages the
  desktop application, and leaves artifacts in each package's own `dist`.
- Keep third-party modules from `node_modules` in a separate `vendors` chunk
  for every runnable Vite application instead of merging them into its main
  application bundle.
- If parallel root packaging makes Electron's Windows icon tool exit with
  `3221225477` after producing the icon, rerun the affected desktop package
  build sequentially.
- Do not edit or commit `node_modules`, `dist`, `.turbo`, `.playwright-cli`,
  logs, coverage, or TypeScript build-info files.
- Keep Electron output Windows-compatible and web output usable through
  relative `file:` URLs.
