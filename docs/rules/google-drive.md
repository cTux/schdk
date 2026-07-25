# Google Drive settings synchronization

- Keep the Drive REST client and settings envelope in `@schdk/google-drive`.
  Treat option values as opaque there; the owning web shell validates them.
- Synchronize editor text options and game options only. Locale, theme,
  navigation, local paths, drafts, tokens, and package bytes remain local
  until their separately designed Drive features are implemented.
- Keep local storage as the immediate source and fallback. Merge remote
  settings per section by `updatedAt`, debounce uploads for one second, and
  retain local changes when Drive is unavailable.
- Store `settings-v1.json` in `appDataFolder` using only the non-sensitive
  `drive.file` and `drive.appdata` scopes.
- Browser authorization uses Google Identity Services from an explicit user
  action. Keep its access token in memory and require reconnect after expiry.
- Desktop authorization uses the system browser, PKCE S256, a random-state
  loopback callback on `127.0.0.1`, and refresh tokens encrypted with Electron
  `safeStorage`. Never persist a refresh token through Linux `basic_text`.
- Expose only status, connect, disconnect, settings load, and settings save
  through Electron IPC. Tokens and generic authenticated requests never cross
  into the renderer.
- Configure the browser's public client ID through
  `VITE_GOOGLE_WEB_CLIENT_ID`; a missing ID disables browser connection without
  affecting local operation.
- Bundle the production Desktop application client ID in the Electron main
  process. Allow `GOOGLE_DESKTOP_CLIENT_ID` to override it for development.
- Real OAuth smoke tests use development credentials and test accounts. Never
  put production credentials or OAuth tokens in repository files or logs.
