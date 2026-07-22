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
- Allow recent-file opens only for paths already present in the persisted
  recent list.
- Parse file content in `@schdk/common` before using it as a game package.
- Deny new-window requests from desktop renderers. Block navigation in
  standalone apps; constrain unified-shell iframe destinations to its fixed app
  URLs and the preload frame allowlist.
- In the unified app, expose editor capabilities only when both the frame role
  and its development or packaged URL match the allowlist.
- Treat persistence failures as recoverable where data safety permits, but do
  not swallow package read, parse, or write failures that the user must act on.
