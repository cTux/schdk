# Package architecture and ownership

## Package boundaries

- `@schdk/common` owns the game-package, game-presentation options,
  AI-question, AI-question-package, and SCHDK-dictionary file types, constants,
  defaults, parsers, serializers, normalization, and game readiness validation.
  It must not depend on UI or platform code.
- `@schdk/ai` owns provider setup, localized generation prompts, structured
  response validation, and conversion to the canonical game-question type.
- `@schdk/ui` owns components, composed views, styles, design tokens, UI
  assets, neutral game-presentation primitives shared by gameplay and the visual
  editor, shared question-database presentation, Ukrainian/English application
  copy and locale context, and UI rules.
  Its detailed rules live in
  [`packages/ui/README.md`](../../packages/ui/README.md).
- `@schdk/web` is the only browser application package. It owns shell
  navigation and page composition, persisted locale selection, editor state and Drive persistence,
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
- Prefer a declared domain subpath when a consumer needs one contract only;
  keep the package root export for composition code that spans domains.
- Keep the allowed workspace dependency directions synchronized with the
  repository workflow test; new packages require an explicit policy entry.
- Keep editor and host feature modules inside `@schdk/web`; do not recreate
  standalone application packages or builds for them.
- Editor and host feature modules may consume the platform-neutral package
  storage contract from `@schdk/google-drive`; they must not own authorization
  or tokens.
- Outside application composition roots, accept the narrow Drive storage,
  credential, generation, or connection capability a workflow uses instead of
  the complete platform bridge.
- `@schdk/web` consumes the platform-neutral AI-question storage contract from
  `@schdk/google-drive`; it must not own authorization or tokens.
- The web application rebuilds and searches the current account's derived
  question database through `@schdk/google-drive`; `.schdk` packages remain
  the source of truth.
- Browser and Electron generation adapters call `@schdk/ai`; they load the
  account-scoped key and selected provider runtime only when generation starts,
  and never expose the key as renderer state or IPC output.
- Prefer shared ownership over copied implementations: data contracts belong
  in `common`, visuals in `ui`, browser behavior in `web`, and operating system
  integration in `desktop`.
- Keep package-open actions, recent-package rows, and their styles in the
  neutral `@schdk/ui` game-packages domain; editor and host views consume that
  domain without importing from each other.
- Keep recent-package listing, loading, downloading, and deletion behavior in
  the neutral `@schdk/web` game-packages controller; editor and host supply
  only their feature-specific validation, messages, and success effects.
- Keep game elements, fitted-text measurement, and persisted layout rendering
  in the neutral `@schdk/ui` game-presentation domain; host and visual-editor
  features consume it without importing from each other.
- Scope shared gameplay and visual-editor presentation styles under the neutral
  `.game-presentation` root; keep host-only behavior under `.host-app`.
- The web application composes exported `@schdk/ui` controls and views; it
  does not render native interactive JSX or define app-local visual controls.
- `@schdk/ui` exports shell page views and their styles as leaf entry points;
  it does not decide application routes, mounting, or data-fetch timing.
- Keep AI provider calls, token renewal, batch sequencing, and answer
  exclusion in `@schdk/web`; `@schdk/ui` owns only form and dialog lifecycle.
- Let the active UI dialog create one cancellation `AbortSignal` and propagate
  it through the web bridge to the provider call. Electron maps that signal to
  a narrow, request-scoped cancellation message handled in main.
- Keep workspace runtime imports acyclic. Public barrels may re-export leaf
  implementations but must not import an implementation that depends back on
  the barrel's owning module.
- Give browser platform adapters that install global listeners an explicit
  cleanup lifecycle owned by the hook that creates them.
- Do not add an abstraction, package, or dependency for hypothetical future
  use. Reuse existing helpers and native platform APIs first.

## Asynchronous control flow

- Prefer `async`/`await` for Promise-based asynchronous code. Avoid nested
  callback chains; keep callbacks only where an API or simple synchronous
  iteration naturally requires them, and wrap callback-only APIs at the
  integration boundary when practical.
