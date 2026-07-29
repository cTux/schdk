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
- Enforce package archive and entry size limits before ZIP extraction, and
  extract only recognized package entries.
- Reject oversized local package and visual-template files before reading their
  complete bytes into renderer memory.
- Accept package handout images only as embedded base64 `data:image/*` URLs
  matching their declared MIME type. Keep application image CSP restricted to
  trusted application, embedded, blob, and Google-account image sources.
- Keep the browser entry point on a default-deny CSP. Allow it to connect only
  to Google GIS, Drive REST, `models.dev`, and the registered OpenAI,
  Anthropic, and Google generation endpoints.
- Deny new-window requests and block navigation from all desktop renderers.
- Open the fixed SCHDK GitHub Releases page through Electron main; do not expose
  a generic external-URL opener or GitHub request bridge to the renderer.
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
- Keep global AI question access limited to the configured shared folder.
  Validate every global write against the centralized admin email allowlist and
  the folder parent; rely on the Drive ACL, not client-side obfuscation, as the
  authorization boundary.
- Keep AI API keys in a separate app-data file owned by the current Google
  account, never in local browser persistence or synchronized settings.
  Desktop renderer IPC may query only whether a key exists, replace or remove
  it, and request validated generation. Generation loads the key in Electron
  main and returns only the parsed question; never return the stored value.
- Keep similarity checking opt-in for every generation action. Search the
  current account's validated question index locally, send only shortlisted
  question and answer text to the selected AI provider for semantic review,
  and never mix another account's index into the request.
- Keep the installed-app OAuth client secret in the Electron main process. It
  is loaded from an ignored packaged resource, distributed with the desktop
  app, and must never be committed, treated as a security boundary, or exposed
  through renderer IPC.
- Materialize release-only desktop OAuth credentials from the
  `GOOGLE_DESKTOP_CREDENTIALS_JSON` GitHub Actions secret into the runner
  temporary directory and remove the file even when packaging fails.
- Pin every third-party GitHub Action to a full commit SHA and retain its
  release tag in a comment for maintainable supply-chain updates.
