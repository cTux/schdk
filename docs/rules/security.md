# Security and trust boundaries

- Keep `contextIsolation: true` for renderer windows. Do not enable general
  Node access in web content.
- Expose the minimum platform API through `contextBridge`; do not expose
  `ipcRenderer`, filesystem modules, or unrestricted invocation primitives.
- Validate every IPC argument in the main process, including primitive types,
  positive safe-integer attempt IDs, `.schdk` extensions, and `Uint8Array`
  content.
- Read local imports through renderer `File` bytes and validate them before
  upload; do not expose their native paths through Electron.
- Allow filesystem writes only through the explicit package download save
  dialog. Reject invalid filenames and non-`Uint8Array` content.
- Parse file content in `@schdk/common` before using it as a game package.
- Deny new-window requests and block navigation from all desktop renderers.
- The unified application bundles only trusted first-party host, editor, and
  shell code in one renderer. Expose the same narrow, validated editor bridge
  to that renderer; never expose Node or unrestricted IPC primitives.
- Treat persistence failures as recoverable where data safety permits, but do
  not swallow package read, parse, or write failures that the user must act on.
- Keep Google browser access tokens in per-tab session storage only, validate
  their client ID and expiry before use, and clear them on expiry or disconnect.
  Keep desktop OAuth and refresh tokens in the main process, encrypt persisted
  refresh tokens with `safeStorage`, and never expose tokens or generic
  authenticated requests through IPC.
