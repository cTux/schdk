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
- **DRV-3:** Package title, filename, readiness, unresolved-remark status, and
  modified time are available for recents without downloading package
  contents.
- **DRV-4:** Create, import, autosave, recent-open, delete, and host flows use a
  stable Drive file ID represented externally as `drive:<fileId>`.
- **DRV-5:** Local package selection is import-to-Drive; explicit download is
  export-from-Drive.
- **DRV-6:** Settings live in `settings-v1.json` in `appDataFolder`, merge by
  section `updatedAt`, and upload after one quiet second.
- **DRV-7:** Local settings apply immediately and remain available when Drive
  is unavailable.
- **DRV-8:** Browser login starts only from explicit user action, keeps a
  validated short-lived access token only in memory, renews the current
  account's token from an active click when no more than 20 minutes remain or
  immediately before package generation, throttles failed renewal attempts to
  once per five minutes, and requires reconnection after reload or expiry.
- **DRV-9:** Desktop login uses the system browser, PKCE S256, random state, a
  loopback callback, complete required-scope validation, encrypted refresh-token
  persistence, and invalid-token cleanup.
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
  Drive folder permissions enforce the same boundary. A replacement general
  rule is persisted before older general flags are cleared, so a failed
  replacement cannot remove the current rule.
- **DRV-18:** Every personal AI question package is a separate visible
  `.aiquestionpackage` ZIP file in the current account's app-marked `SCHDK`
  folder. Listing, loading, creation, renaming, updating, and trashing use the
  shared Drive adapter on web and desktop without browser-local persistence.
- **DRV-19:** `question-database-v1.json` in the connected account's
  `appDataFolder` stores a validated, rebuildable projection of non-empty
  questions and answers from parsed app-marked `.schdk` packages. Refresh
  compares file IDs and modification times, downloads only new or changed
  packages, removes missing packages, and reports packages that cannot be
  indexed without discarding a previous usable projection. A refresh is bound
  to its originating account and stops before persistence when that account
  changes.
- **DRV-20:** Initial recents loading shares concurrent editor and host work and
  lists the first Drive result page with one files request. Additional result
  pages remain traversed when present.
- **DRV-21:** Initial question-package, personal and global AI question-rule,
  AI question-package, and shared dictionary listing starts after authorization
  without depending on their pages being mounted.
- **DRV-22:** Shared `.schdk-dictionary` archives load only from the configured
  fixed folder. Every write requires the allowlisted administrator and a
  matching validated archive, filename, and parent folder.
- **DRV-23:** The hosted web login surface is publicly accessible before
  authorization and links a same-domain privacy policy that discloses Google
  data access and use, token and Drive storage, optional AI-provider transfers,
  retention, deletion, support, and Limited Use compliance.
- **DRV-24:** Package updates include the modification time observed when the
  editor opened or last saved the file. A changed time rejects the update
  before package bytes are uploaded.

## Invariants

- Browser tokens never enter browser storage, React state, or persisted
  settings.
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
- The question database never crosses accounts and never replaces canonical
  `.schdk` content.
- A stale package write never overwrites the newer Drive file.

## Acceptance

1. Connect on web, click while no more than 20 minutes remain and renew the
   token without repeated consent; then reload or expire it and require an
   explicit reconnect.
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
    general in turn and observe only the latest selection remains set. Fail the
    replacement write and confirm the previous general rule remains selected.
13. Create, edit, reload, rename, and delete an AI question package on web and
    desktop; observe one `.aiquestionpackage` ZIP file in the current account's
    `SCHDK` folder and no browser-local copy.
14. Build the question database, reopen it without downloading unchanged
    packages, then edit and delete packages and observe only the changed
    projection replaced or removed. Switch accounts during a refresh and
    confirm no prior-account rows appear or persist in the new account.
15. Save a package with and without unresolved remarks and confirm recents show
    the matching metadata tag without downloading the package.
16. Open recents with editor and host mounted and observe one Drive files
    request for the first result page, followed only by requests for real
    additional pages.
17. Connect without opening the question database or AI pages and observe
    their Drive-backed lists begin loading.
18. Open the hosted web login and privacy policy without a Google session and
    confirm both load directly and the policy matches the shipped data flow.
19. Open one package in two editors, save from the first, then edit from the
    second. Confirm the second editor does not overwrite the first save.
