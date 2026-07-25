# Security and trust boundaries

- Keep `contextIsolation: true` for renderer windows. Do not enable general
  Node access in web content.
- Expose the minimum platform API through `contextBridge`; do not expose
  `ipcRenderer`, filesystem modules, or unrestricted invocation primitives.
- Validate every IPC argument in the main process, including primitive types,
  positive safe-integer attempt IDs, `.schdk` extensions, and `Uint8Array`
  content.
- Resolve native file paths from Electron's `webUtils.getPathForFile`; do not
  trust renderer-supplied path-like properties on `File` objects.
- Allow writes only to paths selected through save/open flows in the current
  process. Keep the editable-path allowlist and reject arbitrary renderer paths.
- Open host packages through read-only bridge methods that do not add their
  paths to the editable-path allowlist.
- Allow recent-file opens only for paths already present in the persisted
  recent list.
- Parse file content in `@schdk/common` before using it as a game package.
- Deny new-window requests and block navigation from all desktop renderers.
- The unified application bundles only trusted first-party host, editor, and
  shell code in one renderer. Expose the same narrow, validated editor bridge
  to that renderer; never expose Node or unrestricted IPC primitives.
- Treat persistence failures as recoverable where data safety permits, but do
  not swallow package read, parse, or write failures that the user must act on.
- Keep Google browser access tokens in memory. Keep desktop OAuth and refresh
  tokens in the main process, encrypt persisted refresh tokens with
  `safeStorage`, and never expose tokens or generic authenticated requests
  through IPC.
