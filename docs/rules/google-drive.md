# Google Drive persistence

- Keep the Drive REST client, package-storage contract, reference helpers, and
  settings envelope in `@schdk/google-drive`. Treat option values as opaque
  there; the owning web shell validates them.
- Keep local storage as the immediate source and fallback. Merge remote
  settings per section by `updatedAt`, debounce uploads for one second, and
  retain local changes when Drive is unavailable.
- Store `settings-v1.json` in `appDataFolder` using only the non-sensitive
  `drive.file` and `drive.appdata` scopes.
- Store app-created `.schdk` files in a visible `SCHDK` Drive folder. Mark the
  folder and packages with private app properties, and expose package identity
  to browser deep links and sessions through validated `drive:<fileId>`
  references. Keep the package title in Drive file metadata so recents can show
  it without downloading package contents, and keep the Drive filename
  synchronized as the filesystem-safe title plus `.schdk`.
- Gate the unified web and desktop application behind Google authorization.
  Do not mount application tools before the first successful connection; when
  authorization expires, keep mounted state inaccessible until reconnection.
- Create or import every editor package in Drive and serialize every autosave
  to the same Drive file ID. Editor and Host recents list and load only those
  Drive packages. Never fall back to browser storage or desktop paths.
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
  the popup-based token flow during startup, refresh, autosave, or other
  background work. After token expiry, require explicit reconnection.
- Desktop authorization uses the system browser, PKCE S256, a random-state
  loopback callback on `127.0.0.1`, and refresh tokens encrypted with Electron
  `safeStorage`. Never persist a refresh token through Linux `basic_text`.
- Expose only status, connect, disconnect, settings operations, and validated
  package create/update/delete/list/load operations through Electron IPC. Tokens and
  generic authenticated requests never cross into the renderer.
- Bundle the production Web application client ID in the browser application.
  Allow `VITE_GOOGLE_WEB_CLIENT_ID` to override it for development.
- Bundle the production Desktop application client ID in the Electron main
  process. Allow `GOOGLE_DESKTOP_CLIENT_ID` to override it for development.
- Real OAuth smoke tests use development credentials and test accounts. Never
  put production credentials or OAuth tokens in repository files or logs.
