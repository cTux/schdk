# Package architecture and ownership

## Package boundaries

- `@schdk/common` owns the game-package, AI-question, and AI-question-package
  file types, constants, parsers, serializers, and game readiness validation.
  It must not depend on UI or platform code.
- `@schdk/ai` owns provider setup, localized generation prompts, structured
  response validation, and conversion to the canonical game-question type.
- `@schdk/ui` owns components, composed views, styles, design tokens, UI
  assets, Ukrainian/English application copy and locale context, and UI rules.
  Its detailed rules live in
  [`packages/ui/README.md`](../../packages/ui/README.md).
- `@schdk/editor-web-app` owns editor state, Drive persistence, save
  orchestration, and the optional download bridge. It renders `@schdk/ui`
  views rather than defining an app-local visual layer.
- `@schdk/host-web-app` owns host behavior: package opening and recents,
  spoiler-free pre-game details, fullscreen gameplay state, keyboard
  navigation, timer/audio orchestration, and completion.
- `@schdk/all-web-app` owns shell navigation, persisted locale selection, and
  lazily loads the host and editor React application exports.
- `@schdk/all-desktop-app` is the only desktop application. It wraps
  `@schdk/all-web-app` and owns Electron main/preload code, packaging, and the
  narrow Drive and explicit-download bridges exposed to the trusted unified
  renderer.
- `@schdk/google-drive` owns the platform-neutral Drive REST client and opaque
  settings envelope, package-storage types, and Drive reference helpers.
  Browser authorization stays in `@schdk/all-web-app`; installed-app
  authorization and OAuth credential storage stay in
  `@schdk/all-desktop-app`; user AI credentials stay in account-scoped Drive
  app data.

## Dependency direction

- Keep browser applications usable without Electron. Treat `window.desktop`
  as an optional adapter, never as a prerequisite for the renderer.
- Keep Electron imports and direct filesystem access inside
  `@schdk/all-desktop-app`.
- Consume workspace packages through their declared package exports and list
  every workspace dependency in the consuming package manifest.
- Preserve workspace dependency edges used to bundle lazy application imports,
  including the unified shell's dependencies on the host and editor packages.
- Editor and host applications may consume the platform-neutral package
  storage contract from `@schdk/google-drive`; they must not own authorization
  or tokens.
- The unified shell consumes the platform-neutral AI-question storage contract
  from `@schdk/google-drive`; it must not own authorization or tokens.
- Browser and Electron generation adapters call `@schdk/ai`; they load the
  account-scoped key internally and never expose it as renderer state or IPC
  output.
- Prefer shared ownership over copied implementations: data contracts belong
  in `common`, visuals in `ui`, browser behavior in web apps, and operating
  system integration in desktop apps.
- Application React packages compose exported `@schdk/ui` controls and views;
  they do not render native interactive JSX or define app-local visual
  controls.
- Do not add an abstraction, package, or dependency for hypothetical future
  use. Reuse existing helpers and native platform APIs first.
