# Google Drive persistence

- Keep the Drive REST client, package-storage contract, reference helpers, and
  settings envelope in `@schdk/google-drive`. Treat option values as opaque
  there; the owning web shell validates them.
- Keep local storage as the immediate source and fallback. Merge remote
  settings per section by `updatedAt`, debounce uploads for one second, and
  retain local changes when Drive is unavailable.
- Store `settings-v1.json` in `appDataFolder` using only the non-sensitive
  `drive.file` and `drive.appdata` scopes.
- Store a user AI API key separately in `ai-credentials-v1.json` in the current
  account's `appDataFolder`. Never copy it into the settings document or its
  local cache, and never reuse one account's configured status for another.
- Store app-created `.schdk` files in a visible `SCHDK` Drive folder. Mark the
  folder and packages with private app properties, and expose package identity
  to browser deep links and sessions through validated `drive:<fileId>`
  references. Keep the package title in Drive file metadata so recents can show
  it without downloading package contents, and keep the Drive filename
  synchronized as the filesystem-safe title plus `.schdk`.
- Discover the current account's existing app-marked package folder instead of
  retaining a folder ID across authorization changes. Scope restorable editor
  and host state by account, and remount it only when the connected account
  changes; same-account authorization renewal keeps mounted state.
- Gate the unified web and desktop application behind Google authorization.
  Do not mount application tools before the first successful connection; when
  authorization expires, keep mounted state inaccessible until reconnection.
  Keep an authorized session mounted through transient Drive failures.
- Create or import every editor package in Drive and serialize every autosave
  to the same Drive file ID. Editor and Host recents list and load only those
  Drive packages across every Drive API result page. Never fall back to browser
  storage or desktop paths.
- Treat a local `.schdk` selection only as an import: validate it, upload it to
  Drive, and continue from the resulting Drive file. Treat the recent-file
  download action only as an explicit export to the user's computer.
- Never silently change a Drive-backed document to another destination after a
  failed write. Keep it open, report the failure, and require reconnection or a
  successful retry before leaving it.
- Browser authorization uses Google Identity Services only from an explicit
  login action. Keep its short-lived access token in per-tab session storage
  so a refresh can restore the connection; validate its client ID and expiry
  before use, and clear invalid, expired, or disconnected sessions. Never call
  the popup-based token flow during startup, page refresh, autosave, or other
  background work. While connected, use an active user click to renew the
  current account's token with no more than 20 minutes remaining, and throttle
  failed renewal attempts to once per five minutes. After token expiry, require
  explicit reconnection.
- Desktop authorization uses the system browser, PKCE S256, a random-state
  loopback callback on `127.0.0.1`, and refresh tokens encrypted with Electron
  `safeStorage`. Never persist a refresh token through Linux `basic_text`.
- Expose only status, connect, disconnect, settings and AI-key status/write
  operations, and validated package create/update/delete/list/load operations
  through Electron IPC. Tokens, stored AI keys, and generic authenticated
  requests never cross into the renderer.
- Bundle the production Web application client ID in the browser application.
  Allow `VITE_GOOGLE_WEB_CLIENT_ID` to override it for development.
- Bundle the production Desktop application client ID and installed-app client
  secret in the Electron main process. Package the client secret from the
  ignored credentials file selected by `GOOGLE_DESKTOP_CREDENTIALS_PATH`;
  never commit it. The client secret is distributed with the application and
  is not a confidential security boundary. Allow `GOOGLE_DESKTOP_CLIENT_ID`
  and `GOOGLE_DESKTOP_CLIENT_SECRET` to override them for development.
- Real OAuth smoke tests use development credentials and test accounts. Never
  put OAuth tokens or confidential production credentials in repository files
  or logs.
