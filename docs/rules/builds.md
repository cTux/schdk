# Builds and generated artifacts

- Use Turbo for `build`, `lint`, `typecheck`, and `test`; package builds must
  declare cacheable output under `dist/**`.
- Do not cache the `@schdk/all-desktop-app` build in Turbo; packaged Electron
  binaries make each cache entry disproportionately large.
- Root `pnpm build` builds packages in dependency order, deletes the root
  `dist`, and collects each package's `dist` under `dist/<package>`.
- Close applications launched from root `dist` before collection; Windows will
  lock their executable directories and cause `EBUSY`.
- If parallel root packaging makes Electron's Windows icon tool exit with
  `3221225477` after producing the icon, rerun the affected desktop package
  build sequentially, then run the dist collection script.
- Do not edit or commit `node_modules`, `dist`, `.turbo`, `.playwright-cli`,
  logs, coverage, or TypeScript build-info files.
- Keep Electron output Windows-compatible and web output usable through
  relative `file:` URLs.
