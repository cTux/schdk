# Google Drive persistence

Status: implemented

## Goal

Keep packages and preferences available across web and desktop sessions while
preserving recoverable local state during temporary Drive failures.

## Requirements

- **DRV-1:** Unified web and desktop tools remain behind explicit Google
  authorization, become inaccessible again when authorization expires, and
  remain mounted through transient Drive failures.
- **DRV-2:** App-created packages live in a visible `SCHDK` Drive folder and
  carry private app identity metadata.
- **DRV-3:** Package title, filename, readiness, and modified time are available
  for recents without downloading package contents.
- **DRV-4:** Create, import, autosave, recent-open, delete, and host flows use a
  stable Drive file ID represented externally as `drive:<fileId>`.
- **DRV-5:** Local package selection is import-to-Drive; explicit download is
  export-from-Drive.
- **DRV-6:** Settings live in `settings-v1.json` in `appDataFolder`, merge by
  section `updatedAt`, and upload after one quiet second.
- **DRV-7:** Local settings apply immediately and remain available when Drive
  is unavailable.
- **DRV-8:** Browser login starts only from explicit user action, keeps a
  validated short-lived access token in per-tab session storage, renews the
  current account's token from an active click when no more than 20 minutes
  remain, throttles failed renewal attempts to once per five minutes, and
  requires reconnection after expiry.
- **DRV-9:** Desktop login uses the system browser, PKCE S256, random state, a
  loopback callback, and encrypted refresh-token persistence.
- **DRV-10:** Disconnect clears the active authorization state and hides tools
  behind the login screen.
- **DRV-11:** A user AI API key lives in a separate
  `ai-credentials-v1.json` file in the current account's `appDataFolder`; it
  never enters the locally cached settings document.
- **DRV-12:** The Google login action remains visually stable on pointer hover.
- **DRV-13:** Each connected account reuses its own existing app-marked
  `SCHDK` folder, never a folder ID or mounted editor/host state retained from
  another account.
- **DRV-14:** Recents traverse every Drive API result page instead of hiding
  packages beyond the first page.
- **DRV-15:** Package loads validate Drive metadata against the canonical
  package-size limit before downloading package media.

## Invariants

- Browser tokens never enter localStorage or persisted settings.
- Desktop tokens remain in the Electron main process and never cross renderer
  IPC.
- Drive uses only `drive.file` and `drive.appdata` scopes.
- A failed package write keeps the same file open and requires retry or
  reconnection.
- Settings conflicts resolve per section, not by replacing the whole document.
- AI credentials remain scoped to the connected Google account.
- Package-folder discovery and restorable editor/host state remain scoped to
  the connected Google account.
- Transient Drive failures do not revoke or hide an authorized session.

## Acceptance

1. Connect on web, click while no more than 20 minutes remain and renew the
   token without repeated consent; then expire it and require an explicit
   reconnect.
2. Connect on desktop, restart, restore through encrypted refresh credentials,
   then disconnect.
3. Edit different settings sections on two clients and merge the newest value
   of each section.
4. Lose Drive during an edit, retain local settings and pending package state,
   reconnect, and save to the original file ID.
5. Save an AI API key, reconnect to the same account and observe configured
   status, then connect another account and observe no key from the first.
6. Hover the Google login action and observe no background or border flash.
7. Connect account A, create a package, switch to account B, then reconnect
   account A and observe A's original package folder, recents, and restorable
   editor/host state without content from B.
8. Create more than one Drive API result page of packages and observe every
   package in recents.
9. While connected, make a Drive request fail without expiring authorization
   and observe the mounted tools remain available with their local state.
10. Open an oversized Drive package and observe it rejected before its media
    body is downloaded.
