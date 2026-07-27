# Unified web shell

- Root `pnpm dev` starts `@schdk/all-web-app` at the strict
  `127.0.0.1:5173`; fail instead of switching ports.
- Export host and editor roots from their standalone packages and load them
  with `React.lazy`; do not use iframes or copy standalone builds.
- Load an application chunk on first selection, then keep it mounted so
  navigation does not discard state.
- Preserve keyboard-accessible navigation in the shared renderer.
- Group the visual editor, artificial intelligence, editor, and host pages
  under `ЩДК` in the fixed sidebar. Keep Options at the bottom, nest game and
  editor settings as always-visible fieldsets under the primary `ЩДК` tab, and
  persist editor text options in localStorage.
- Reflect an opened browser package in the `package` URL query parameter. A
  unified-shell deep link with this parameter opens the editor before loading
  the package.
- Persist the active shell page in browser storage on web and desktop. Reflect
  it in the `view` URL query parameter so every shell page can be deep-linked
  and browser back/forward restores the selected page.
- Reflect the active primary settings group in the validated `settings` URL
  query parameter while `view=options`; restore it through browser
  back/forward and remove it when leaving settings.
- Persist validated visual-editor custom elements and background settings with
  the other game options.
- Default the unified application to Ukrainian when no locale was selected.
  Persist an explicit Ukrainian or English selection in browser storage and
  apply it to every unified application surface.
- Default the unified application theme to the operating-system preference.
  Persist explicit system, light, or dark selections in browser storage and
  apply them to every unified application surface.
- Keep locale selection in the first `App` settings group, before the `WWW`
  group; do not place it in the sidebar.
- Populate the OpenAI, Anthropic, and Google text-model choices supported by
  `@schdk/ai` from models.dev, with a small built-in fallback. Keep the selected
  provider and model in local storage.
  Keep the AI API key in a separate app-data file for the current Google
  account; exclude it from local storage and synchronized Drive settings.
- Generate questions through the current Drive bridge. The bridge loads the
  saved key only for the selected provider call and returns a canonical
  validated game question, never the key.
- Keep personal AI question packages in Drive as `.aiquestionpackage` archives
  and expose their page immediately after question-generation rules.
- Show a localized Google login screen before mounting the unified tools.
  Authentication is mandatory on web and desktop; reconnect before restoring
  access after authorization expires.
- Keep the connected Google Drive account and disconnect action in the `App`
  settings group. Synchronize editor and game options through
  [google-drive.md](google-drive.md) while preserving immediate local storage.
