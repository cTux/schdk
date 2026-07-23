# Package architecture and ownership

## Package boundaries

- `@schdk/common` owns the game-package types, constants, parser, serializer,
  and readiness validation. It must not depend on UI or platform code.
- `@schdk/ui` owns components, composed views, styles, design tokens, UI
  assets, and UI rules. Its detailed rules live in
  [`packages/ui/README.md`](../../packages/ui/README.md).
- `@schdk/editor-web-app` owns editor state, browser persistence, save
  orchestration, and the optional desktop bridge. It renders `@schdk/ui`
  views rather than defining an app-local visual layer.
- `@schdk/host-web-app` owns host behavior. It currently owns the package-open
  start screen and recent-package storage; do not claim that the gameplay flow
  is implemented until it is.
- `@schdk/all-web-app` owns shell navigation and lazily loads the host and
  editor React application exports.
- Each `*-desktop-app` owns only its Electron main/preload code and packaging
  configuration. Reuse the corresponding web application for renderer UI.
- The host desktop app exposes only read-only package open and recent-file
  operations. Do not expose editor write operations to the standalone host.
- Global desktop API declarations imported by the unified renderer must use a
  compatible superset shape across host and editor packages. A standalone
  preload may expose only the subset its application uses.
- `@schdk/all-desktop-app` wraps `@schdk/all-web-app` and exposes its narrow
  editor file bridge to the trusted unified renderer.

## Dependency direction

- Keep browser applications usable without Electron. Treat `window.desktop`
  as an optional adapter, never as a prerequisite for the renderer.
- Keep Electron imports and direct filesystem access inside desktop packages.
- Consume workspace packages through their declared package exports and list
  every workspace dependency in the consuming package manifest.
- Preserve workspace dependency edges used to bundle lazy application imports,
  including the unified shell's dependencies on the host and editor packages.
- Prefer shared ownership over copied implementations: data contracts belong
  in `common`, visuals in `ui`, browser behavior in web apps, and operating
  system integration in desktop apps.
- Do not add an abstraction, package, or dependency for hypothetical future
  use. Reuse existing helpers and native platform APIs first.
