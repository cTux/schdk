# Unified web shell

- Root `pnpm dev` starts `@schdk/all-web-app` at the strict
  `127.0.0.1:5173`; fail instead of switching ports.
- Export host and editor roots from their standalone packages and load them
  with `React.lazy`; do not use iframes or copy standalone builds.
- Load an application chunk on first selection, then keep it mounted so
  navigation does not discard state.
- Preserve keyboard-accessible navigation in the shared renderer.
- Group the host and editor pages under `ЩДК` in the fixed sidebar. Keep Options
  at the bottom, nest game and editor settings under the primary `ЩДК` tab, and
  persist editor text options in localStorage.
- Reflect an opened browser package in the `package` URL query parameter. A
  unified-shell deep link with this parameter opens the editor before loading
  the package.
- Persist validated visual-editor custom elements and background settings with
  the other game options.
