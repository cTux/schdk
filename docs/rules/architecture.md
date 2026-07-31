# Package architecture and ownership

## Package boundaries

- `@schdk/common` owns the game-package, game-presentation options,
  AI-question, AI-question-package, and SCHDK-dictionary file types, constants,
  defaults, parsers, serializers, normalization, and game readiness validation.
  It must not depend on UI or platform code.
- `@schdk/ai` owns provider setup, localized generation prompts, structured
  response validation, and conversion to the canonical game-question type.
- `@schdk/ui` owns components, composed views, styles, design tokens, UI
  assets, shared question-database presentation, Ukrainian/English application
  copy and locale context, and UI rules.
  Its detailed rules live in
  [`packages/ui/README.md`](../../packages/ui/README.md).
- `@schdk/web` is the only browser application package. It owns shell
  navigation, persisted locale selection, editor state and Drive persistence,
  AI-generation orchestration, and host gameplay behavior. Its editor and host feature modules render
  `@schdk/ui` views and remain lazily loaded.
- `@schdk/desktop` is the only desktop application. It wraps
  `@schdk/web` and owns Electron main/preload code, packaging, and the
  narrow Drive and explicit-download bridges exposed to the trusted unified
  renderer.
- `@schdk/google-drive` owns the platform-neutral Drive REST client and opaque
  settings envelope, package-storage types, the derived per-account question
  database contract, and Drive reference helpers.
  Browser authorization stays in `@schdk/web`; installed-app
  authorization and OAuth credential storage stay in
  `@schdk/desktop`; user AI credentials stay in account-scoped Drive
  app data.

## Dependency direction

- Keep the browser application usable without Electron. Treat `window.desktop`
  as an optional adapter, never as a prerequisite for the renderer.
- Keep Electron imports and direct filesystem access inside
  `@schdk/desktop`.
- Consume workspace packages through their declared package exports and list
  every workspace dependency in the consuming package manifest.
- Keep the allowed workspace dependency directions synchronized with the
  repository workflow test; new packages require an explicit policy entry.
- Keep editor and host feature modules inside `@schdk/web`; do not recreate
  standalone application packages or builds for them.
- Editor and host feature modules may consume the platform-neutral package
  storage contract from `@schdk/google-drive`; they must not own authorization
  or tokens.
- `@schdk/web` consumes the platform-neutral AI-question storage contract from
  `@schdk/google-drive`; it must not own authorization or tokens.
- The web application rebuilds and searches the current account's derived
  question database through `@schdk/google-drive`; `.schdk` packages remain
  the source of truth.
- Browser and Electron generation adapters call `@schdk/ai`; they load the
  account-scoped key internally and never expose it as renderer state or IPC
  output.
- Prefer shared ownership over copied implementations: data contracts belong
  in `common`, visuals in `ui`, browser behavior in `web`, and operating system
  integration in `desktop`.
- The web application composes exported `@schdk/ui` controls and views; it
  does not render native interactive JSX or define app-local visual controls.
- Keep AI provider calls, token renewal, batch sequencing, answer exclusion,
  and cancellation in `@schdk/web`; `@schdk/ui` only collects generation
  inputs and renders lifecycle state supplied through typed callbacks.
- Do not add an abstraction, package, or dependency for hypothetical future
  use. Reuse existing helpers and native platform APIs first.

## Asynchronous control flow

- Prefer `async`/`await` for Promise-based asynchronous code. Avoid nested
  callback chains; keep callbacks only where an API or simple synchronous
  iteration naturally requires them, and wrap callback-only APIs at the
  integration boundary when practical.
