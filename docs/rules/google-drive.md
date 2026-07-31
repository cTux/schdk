# Google Drive persistence

- Keep the Drive REST client, package-storage contract, reference helpers, and
  generic settings envelope in `@schdk/google-drive`. Its parser validates the
  envelope while the owning web shell binds and validates section value types.
- Keep local storage as the immediate source and fallback. Merge remote
  settings per section by `updatedAt`, debounce uploads for one second, and
  retain local changes when Drive is unavailable.
- Store `settings-v1.json` in `appDataFolder`. Request `drive` and
  `drive.appdata`; fixed-folder global listing requires the restricted `drive`
  scope because `drive.file` cannot discover files that users did not
  explicitly open with the app.
- Store a user AI API key separately in `ai-credentials-v1.json` in the current
  account's `appDataFolder`. Never copy it into the settings document or its
  local cache, and never reuse one account's configured status for another.
- Store the current account's rebuildable question index in
  `question-database-v1.json` in `appDataFolder`. Derive it only from parsed
  app-marked `.schdk` packages, compare package IDs and modification times
  before downloading media, abort refresh persistence when the connected
  account changes, and never treat the index as the source of truth.
- Store app-created `.schdk` files in a visible `SCHDK` Drive folder. Mark the
  folder and packages with private app properties, and expose package identity
  to browser deep links and sessions through validated `drive:<fileId>`
  references. Keep the package title in Drive file metadata so recents can show
  it without downloading package contents, and keep the Drive filename
  synchronized as the filesystem-safe title plus `.schdk`.
  Keep readiness and unresolved-remark status in private package properties so
  recents can show both tags without downloading package content.
- Store every AI question rule as its own visible `.aiquestion` ZIP archive in
  the same `SCHDK` Drive folder. Mark it with private app identity metadata,
  keep its filename synchronized as the filesystem-safe rule name plus
  `.aiquestion`, and parse its archive through `@schdk/common` before use.
- Store every personal AI question package as its own visible
  `.aiquestionpackage` ZIP archive in the same `SCHDK` Drive folder. Mark it
  with private app identity metadata, synchronize its filename with its
  display name, and parse it through `@schdk/common` before use.
- Load global AI question rules from the fixed shared Drive folder configured
  in `@schdk/google-drive`, after the current account's rules. Keep the admin
  email allowlist centralized and unobfuscated there; Drive folder permissions
  remain the security boundary for global writes.
- Load `.schdk-dictionary` archives from the fixed shared dictionary folder.
  Only the centralized allowlisted administrator can create or update them;
  initialize missing defaults for that administrator and keep folder
  permissions as the write authorization boundary.
- Persist a replacement global general rule before clearing the previous
  general flag. A failed replacement must leave the previous rule intact.
- Before creating a rule from an analyzed question, search the
  [shared Drive folder](https://drive.google.com/drive/folders/1qigJtM0zAQl2Yk8C2xjeragcGDybUVR1)
  for the same reusable mechanism. Extend an existing `.aiquestion` with
  material new instructions or examples instead of creating a duplicate rule.
  Automated creation or extension must keep at most three good examples and
  three bad examples, retaining the most useful non-duplicate examples in each
  category.
- Discover the current account's existing app-marked package folder instead of
  retaining a folder ID across authorization changes. Scope restorable editor
  and host state by account, and remount it only when the connected account
  changes; same-account authorization renewal keeps mounted state.
- Gate the unified web and desktop application behind Google authorization.
  Do not mount application tools before the first successful connection; when
  authorization expires, keep mounted state inaccessible until reconnection.
  Keep an authorized session mounted through transient Drive failures.
- Keep the hosted web login surface publicly accessible before authorization.
  Identify SCHDK, describe its user-facing purpose, and link the same-domain
  privacy policy used by the production OAuth branding configuration.
- Create or import every editor package in Drive and serialize every autosave
  to the same Drive file ID. Editor and Host recents list and load only those
  Drive packages across every Drive API result page. Never fall back to browser
  storage or desktop paths.
- Send the modification time observed on open or the previous successful save
  with every package update. Compare it with current Drive metadata before
  uploading bytes; on mismatch, keep local edits open and offer to save them as
  a titled copy before loading the newer original.
- List, create, update, and delete AI question rules and personal AI question
  packages through the active account's Drive adapter. Route global rules
  through the same narrow adapter, require an allowlisted account for global
  writes, and never persist these collections in browser local storage.
- Start Drive-backed question-package, personal and global AI question-rule,
  AI question-package, and dictionary listing after authorization,
  independently of lazy page mounting.
- Reject package metadata above the canonical package-size limit before
  downloading its media body.
- Treat a local `.schdk` selection only as an import: validate it, upload it to
  Drive, and continue from the resulting Drive file. Treat the recent-file
  download action only as an explicit export to the user's computer.
- Never silently change a Drive-backed document to another destination after a
  failed write. Keep it open, report the failure, and require reconnection or a
  successful retry before leaving it.
- Browser authorization uses Google Identity Services only from an explicit
  login action. Keep its short-lived access token only in memory and clear
  legacy persisted browser tokens during startup. Never call the popup-based
  token flow during startup, page refresh, autosave, or other background work.
  While connected, use an active user click to renew the current account's
  token with no more than 20 minutes remaining, and throttle failed renewal
  attempts to once per five minutes. Renew immediately from the
  package-generation confirmation click before sequential generation starts.
  After reload or token expiry, require explicit reconnection.
- Desktop authorization uses the system browser, PKCE S256, a random-state
  loopback callback on `127.0.0.1`, and refresh tokens encrypted with Electron
  `safeStorage`. Verify all required scopes before retaining credentials,
  delete invalidated refresh credentials, and never persist a refresh token
  through Linux `basic_text`.
- Expose only status, connect, disconnect, settings, AI-key status/write,
  question-database load/write, validated AI generation, and validated
  game-package, AI-question-rule, and AI-question-package
  create/update/delete/list/load operations through Electron IPC. Validate the
  complete question-database document before writing it. Tokens, stored AI
  keys, and generic authenticated requests never cross into the renderer.
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
- Keep the public privacy policy synchronized with actual Google data access,
  token storage, optional AI-provider transfers, retention, deletion, support,
  and Google API Services User Data Policy Limited Use disclosures.
