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
  never enters the locally cached settings document. Question generation loads
  it inside the active Drive adapter and returns only a validated question.
- **DRV-12:** The Google login action remains visually stable on pointer hover.
- **DRV-13:** Each connected account reuses its own existing app-marked
  `SCHDK` folder, never a folder ID or mounted editor/host state retained from
  another account.
- **DRV-14:** Recents traverse every Drive API result page instead of hiding
  packages beyond the first page.
- **DRV-15:** Package loads validate Drive metadata against the canonical
  package-size limit before downloading package media.
- **DRV-16:** Every AI question rule is a separate visible `.aiquestion` ZIP
  file in the current account's app-marked `SCHDK` folder. Rule listing,
  loading, creation, renaming, updating, and trashing use the shared Drive
  adapter on web and desktop without local-storage persistence.
- **DRV-17:** The AI page also loads individually parsed `.aiquestion` archives
  from the configured shared Drive folder. Only allowlisted administrators can
  create, rename, update, trash, or select the single general shared rule;
  Drive folder permissions enforce the same boundary.
- **DRV-18:** Every personal AI question package is a separate visible
  `.aiquestionpackage` ZIP file in the current account's app-marked `SCHDK`
  folder. Listing, loading, creation, renaming, updating, and trashing use the
  shared Drive adapter on web and desktop without browser-local persistence.

## Invariants

- Browser tokens never enter localStorage or persisted settings.
- Desktop tokens remain in the Electron main process and never cross renderer
  IPC.
- Drive uses `drive` and `drive.appdata` scopes; the fixed shared folder cannot
  be discovered through per-file authorization.
- A failed package write keeps the same file open and requires retry or
  reconnection.
- Settings conflicts resolve per section, not by replacing the whole document.
- AI credentials remain scoped to the connected Google account.
- Package-folder discovery and restorable editor/host state remain scoped to
  the connected Google account.
- Transient Drive failures do not revoke or hide an authorized session.
- AI question archives are parsed through the canonical shared format before
  their rules are used.
- AI question package archives are parsed through the canonical shared format
  before generation uses them.

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
5. Save an AI API key, generate a question without exposing the key, reconnect
   to the same account and observe configured status, then connect another
   account and observe no key from the first.
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
11. Add, edit, favorite, disable, reload, and delete an AI question rule on web
    and desktop; observe one renamed `.aiquestion` ZIP file in the current
    account's `SCHDK` folder and no browser-local rule copy.
12. Connect as a regular account and load global rules without global mutation
    controls; connect as an allowlisted administrator and create, edit, and
    delete a global rule in the configured shared folder. Select two rules as
    general in turn and observe only the latest selection remains set.
13. Create, edit, reload, rename, and delete an AI question package on web and
    desktop; observe one `.aiquestionpackage` ZIP file in the current account's
    `SCHDK` folder and no browser-local copy.
