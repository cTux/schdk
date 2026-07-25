# Package architecture and ownership

## Package boundaries

- `@schdk/common` owns the game-package types, constants, parser, serializer,
  and readiness validation. It must not depend on UI or platform code.
- `@schdk/ui` owns components, composed views, styles, design tokens, UI
  assets, Ukrainian/English application copy and locale context, and UI rules.
  Its detailed rules live in
  [`packages/ui/README.md`](../../packages/ui/README.md).
- `@schdk/editor-web-app` owns editor state, browser persistence, save
  orchestration, and the optional desktop bridge. It renders `@schdk/ui`
  views rather than defining an app-local visual layer.
- `@schdk/host-web-app` owns host behavior: package opening and recents,
  spoiler-free pre-game details, fullscreen gameplay state, keyboard
  navigation, timer/audio orchestration, and completion.
- `@schdk/all-web-app` owns shell navigation, persisted locale selection, and
  lazily loads the host and editor React application exports.
- `@schdk/all-desktop-app` is the only desktop application. It wraps
  `@schdk/all-web-app` and owns Electron main/preload code, packaging, and the
  narrow file bridge exposed to the trusted unified renderer.

## Dependency direction

- Keep browser applications usable without Electron. Treat `window.desktop`
  as an optional adapter, never as a prerequisite for the renderer.
- Keep Electron imports and direct filesystem access inside
  `@schdk/all-desktop-app`.
- Consume workspace packages through their declared package exports and list
  every workspace dependency in the consuming package manifest.
- Preserve workspace dependency edges used to bundle lazy application imports,
  including the unified shell's dependencies on the host and editor packages.
- Prefer shared ownership over copied implementations: data contracts belong
  in `common`, visuals in `ui`, browser behavior in web apps, and operating
  system integration in desktop apps.
- Do not add an abstraction, package, or dependency for hypothetical future
  use. Reuse existing helpers and native platform APIs first.
