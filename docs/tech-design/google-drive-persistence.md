# Google Drive persistence

Status: proposed

Related research:
[Backendless Google Drive persistence](../research/google-drive-persistence.md)

## Product contract

Google Drive is an optional package and settings location. Connecting it must
not remove existing local files, local browser storage, or recovery drafts.

When connected:

- portable editor and game settings synchronize through Drive;
- new Drive packages save automatically after one quiet second;
- the editor and host can open the 20 most recent Drive packages;
- local recovery remains active until Drive confirms the latest write;
- disconnecting stops Drive access without deleting Drive data.

Browser automatic sync is guaranteed only while its short-lived access token is
valid. After expiry or reload, changes remain safe locally and the UI requires
an explicit reconnect. Desktop sync can refresh automatically using a securely
stored installed-app refresh token.

## Goals

- Authorize Google Drive without an SCHDK server.
- Keep access limited to SCHDK-created/selected files and app configuration.
- Automatically save packages without losing newer edits or local recovery.
- Synchronize portable settings between browser and desktop.
- Open recent packages by stable Drive file ID in both editor and host.
- Preserve current standalone browser and local desktop behavior.

## Non-goals

- SCHDK accounts, server sessions, or server-side token storage.
- Silent browser authorization across reloads or expired access tokens.
- Real-time collaborative editing or automatic package merge.
- Access to arbitrary unrelated Drive files.
- Replacing local recovery drafts or offline caches.
- APT-like Drive change subscriptions, push notifications, or background sync
  while the application is closed.
- Google Picker in the first version.

## Google Cloud configuration

Create separate development and production Google Cloud projects. In each:

1. Enable Google Drive API.
2. Configure OAuth branding, support contact, homepage, and privacy policy.
3. Register `drive.file` and `drive.appdata`.
4. Create a Web application client with exact development/production origins.
5. Create a Desktop application client.

Build configuration:

```text
VITE_GOOGLE_WEB_CLIENT_ID=<public web client ID>
GOOGLE_DESKTOP_CLIENT_ID=<public desktop client ID>
```

Client IDs are public. Do not introduce a client secret into browser code or
treat a desktop client secret as a security boundary.

Production web hosting must provide HTTPS and the GIS-compatible CSP, COOP, and
referrer-policy headers. Keep Google origins limited to the exact directives
required by GIS and Drive REST.

## Package ownership

Add one focused workspace package, `@schdk/google-drive`, because the same
Drive protocol is consumed by the browser shell and Electron main process.

It owns:

- Drive REST request/response types;
- scope constants;
- Drive file/folder discovery;
- settings file create/read/update;
- package create/read/update/list metadata;
- error classification and bounded retry;
- pure validation of Drive metadata and settings envelopes.

It uses native `fetch` and accepts an access-token provider. It must not import
React, Electron, Node-only APIs, `@schdk/ui`, or game-package schema code.

Existing ownership remains:

- `@schdk/common` parses, serializes, and validates `.schdk` content;
- `@schdk/all-web-app` owns connection state and portable settings sync;
- editor and host apps own package use and receive Drive operations through
  props;
- `@schdk/all-desktop-app` owns installed-app OAuth, token storage, and narrow
  Drive IPC;
- `@schdk/ui` owns connection/sync/recent-source visuals.

Do not create a generic cloud-provider abstraction. Google Drive is the only
requested provider.

## Drive model

### Folder

On first connection, query for the app-created folder:

```text
mimeType = 'application/vnd.google-apps.folder'
and trashed = false
and appProperties has { key='schdkType' and value='package-folder' }
```

Reuse the oldest matching folder. If none exists, create `SCHDK` in My Drive.
Persist its ID in `settings-v1.json` but revalidate it before use. Do not create
a new folder merely because the user renamed or moved the existing one.

### Package metadata

```ts
interface DrivePackageReference {
  fileId: string;
  name: string;
  version: string;
  modifiedTime: string;
}
```

Create packages with:

```json
{
  "name": "<filesystem-safe title and time>.schdk",
  "mimeType": "application/zip",
  "parents": ["<SCHDK folder ID>"],
  "appProperties": {
    "schdkType": "game-package",
    "formatVersion": "1"
  }
}
```

Treat `fileId` as identity. The visible name is mutable metadata and need not be
unique.

### Settings document

`settings-v1.json` in `appDataFolder`:

```ts
interface DriveSettingsDocument {
  schemaVersion: 1;
  packageFolderId?: string;
  sections: {
    editorTextOptions: TimedSection<unknown>;
    gameOptions: TimedSection<unknown>;
    recentPackages: TimedSection<DriveRecentPackage[]>;
  };
}

interface TimedSection<T> {
  updatedAt: string;
  value: T;
}

interface DriveRecentPackage {
  fileId: string;
  openedAt: string;
}
```

The shell validates option values with the existing option loaders before
applying them. Unknown fields are ignored. An invalid section falls back to its
local value without discarding other valid sections.

The Drive package must treat settings bytes as opaque JSON; it does not depend
on UI option types.

## Shared Drive API

Expose explicit operations:

```ts
interface GoogleDriveClient {
  getAccount(): Promise<DriveAccount>;
  loadSettings(): Promise<VersionedDriveSettings | null>;
  saveSettings(
    settings: DriveSettingsDocument,
  ): Promise<VersionedDriveSettings>;
  ensurePackageFolder(settings?: DriveSettingsDocument): Promise<string>;
  createPackage(
    name: string,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
  getPackage(fileId: string): Promise<DrivePackageDownload>;
  getPackageMetadata(fileId: string): Promise<DrivePackageReference>;
  updatePackage(
    reference: DrivePackageReference,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
}
```

No method accepts an arbitrary URL, OAuth token, query fragment, or raw Drive
request from the renderer.

The browser constructs this client with an in-memory GIS token provider. The
Electron main process constructs it with its installed-app token provider.

## Browser authorization

`@schdk/all-web-app` loads GIS once and creates a token client for:

```text
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.appdata
```

Connection state:

```ts
type GoogleDriveConnection =
  | { state: 'disconnected' }
  | { state: 'connecting' }
  | { state: 'connected'; account: DriveAccount; expiresAt: number }
  | { state: 'reauthorization-required'; account?: DriveAccount }
  | { state: 'error'; message: string };
```

Rules:

- request access only from the explicit connect/reconnect action;
- keep the access token in a closure, never React state or persistent storage;
- verify both scopes were granted;
- clear the token on disconnect;
- on `401`, transition to `reauthorization-required`;
- never open a popup from an autosave callback;
- replay pending settings/package writes only after explicit reconnect.

Use the Google-provided or approved localized button/branding. The user-facing
action is “Підключити Google Диск,” not an SCHDK account registration.

## Desktop authorization

Implement in Electron main:

```text
renderer connect request
  -> generate PKCE verifier/challenge and state
  -> listen on 127.0.0.1 random port
  -> shell.openExternal(Google authorization URL)
  -> validate loopback callback and state
  -> exchange code with verifier
  -> encrypt refresh token
  -> return account/status only
```

Use `node:crypto`, `node:http`, native `fetch`, Electron `shell`, and
asynchronous `safeStorage`; do not add an OAuth library unless the manual spike
shows a protocol gap.

Security requirements:

- bind only to `127.0.0.1`, never all interfaces;
- choose a random available port;
- require exact path, state, and one pending authorization attempt;
- close the listener on success, denial, timeout, or window shutdown;
- cap the flow at two minutes;
- use PKCE S256;
- never send tokens to the renderer;
- write encrypted refresh-token bytes only under `app.getPath('userData')`;
- do not persist on Linux when secure storage reports `basic_text` or is
  unavailable;
- revoke the token on disconnect when possible, then delete local credentials.

Extend the preload with named operations only:

```ts
interface DesktopGoogleDriveApi {
  getGoogleDriveStatus(): Promise<GoogleDriveStatus>;
  connectGoogleDrive(): Promise<GoogleDriveStatus>;
  disconnectGoogleDrive(): Promise<void>;
  loadGoogleDriveSettings(): Promise<VersionedDriveSettings | null>;
  saveGoogleDriveSettings(settings: DriveSettingsDocument): Promise<void>;
  createGoogleDrivePackage(
    name: string,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
  openGoogleDrivePackage(fileId: string): Promise<DrivePackageDownload>;
  updateGoogleDrivePackage(
    reference: DrivePackageReference,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
}
```

Validate all file IDs, names, versions, JSON envelopes, and `Uint8Array`
content in main. Preserve the existing navigation and window-open denial; OAuth
uses only `shell.openExternal`.

## Settings synchronization

Local storage remains the immediate source during startup:

1. Load and render local options synchronously.
2. When Drive connects, load and validate remote settings.
3. Merge each section independently by `updatedAt`.
4. Apply newer remote sections to React state and local storage.
5. If local is newer, enqueue the merged document for Drive.

On a settings change:

1. Update React state and local storage immediately.
2. Mark only that section with a new UTC timestamp.
3. Debounce Drive sync for one second.
4. Refetch remote settings and merge sections.
5. Serialize writes through one queue.
6. On failure, retain local state and show sync status without blocking the
   shell.

Merge recent items by `fileId`, retaining the newest `openedAt`, sort newest
first, and keep 20.

The background image remains part of `gameOptions` and therefore synchronizes
inside JSON in the first version. Split it into a separate Drive blob only if
measured settings size or upload frequency becomes a problem.

## Package storage integration

Define an optional Google Drive package store prop shared by editor and host:

```ts
interface GoogleDrivePackageStore {
  listRecentPackages(): Promise<RecentPackageItem[]>;
  createPackage(
    name: string,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
  openPackage(fileId: string): Promise<DrivePackageDownload>;
  updatePackage(
    reference: DrivePackageReference,
    content: Uint8Array,
  ): Promise<DrivePackageReference>;
  rememberPackage(fileId: string): Promise<void>;
}
```

The unified shell supplies it while connected. Standalone editor/host builds
omit it and retain current local behavior.

Recent UI shows separate “Google Диск” and local sections. Do not merge entries
by filename. Both editor and host share the same Drive recent index; their
existing IndexedDB databases remain local caches and recovery sources.

### Create

- If Drive is connected, “new package” offers Google Drive as the default
  destination and local file as an explicit alternative.
- Serialize the empty package, create it in Drive, then enter the editor.
- If creation is canceled or fails, remain on the start screen.

### Open recent

- Download by Drive file ID.
- Parse with `parseGamePackage` before changing UI state.
- Host also rejects unfinished packages through `validateGamePackage`.
- Cache valid bytes in IndexedDB by `drive:<fileId>`.
- Update recents only after successful parsing/open.
- Remove inaccessible recent IDs best-effort.

### Autosave

Represent the open destination explicitly:

```ts
type PackageDestination =
  | { kind: 'browser-local'; name: string }
  | { kind: 'desktop-local'; filePath: string }
  | { kind: 'google-drive'; reference: DrivePackageReference };
```

For a Drive destination, reuse the current one-second debounce and serialized
save queue. After each successful upload, replace the stored Drive reference
with the returned version/modified time.

Before update, retrieve metadata. If its version differs from the open
reference:

- stop automatic writes;
- retain the recovery draft;
- set save state to `error`;
- offer “Reload from Drive” and “Save as a new Drive package”;
- never silently choose one copy.

This is optimistic conflict detection, not collaboration.

### Recovery

Key drafts and IndexedDB copies by storage identity:

```text
local:<filename-or-path-scope>
drive:<fileId>
```

Never clear a Drive draft until the latest serialized version has uploaded.
When browser authorization expires, continue updating that draft and show
“Saved locally; reconnect Google Drive to sync.”

## Browser deep links and desktop sessions

Browser:

```text
?package=drive:<url-encoded-file-id>
```

Open only after authorization and normal validation. Clear the query if access
is unavailable. Do not include tokens, names, or package content.

Desktop editor sessions become:

```ts
type DesktopEditorSession =
  | { source: 'local'; filePath: string; selectedIndex: number }
  | { source: 'google-drive'; fileId: string; selectedIndex: number };
```

Restore Drive sessions only after desktop token refresh and recent-access
validation. A failure returns to the start screen with an actionable message.

## Error behavior

| Condition                      | Behavior                                                 |
| ------------------------------ | -------------------------------------------------------- |
| Browser token expired/401      | Keep local draft; require reconnect                      |
| Desktop token expired          | Refresh once; reconnect if refresh fails                 |
| User revokes access            | Disconnect, delete local token, retain drafts            |
| Network offline                | Keep local state/draft; retry when online and authorized |
| 429 or transient 5xx           | Bounded exponential backoff with jitter                  |
| Permission/404                 | Remove stale recent entry; preserve open local draft     |
| Drive quota exhausted          | Stop retry loop and show actionable error                |
| Remote package version changed | Stop autosave; reload or save copy                       |
| Invalid remote settings        | Ignore invalid section and retain local settings         |
| Invalid package bytes          | Reject before updating editor/host state                 |

No Drive failure may discard pending content or prevent the application from
starting in local mode.

## Implementation phases

### Phase 1: browser connection and settings

1. Configure development Google Cloud credentials and static-host headers.
2. Add `@schdk/google-drive`.
3. Add browser GIS connection state.
4. Synchronize settings/app data with local fallback.
5. Verify expiry, reconnect, revoke, malformed settings, and offline behavior.

### Phase 2: browser Drive packages

1. Create/discover the visible package folder.
2. Add Drive create/open/autosave.
3. Add shared Drive recents to editor and host.
4. Re-key local caches/drafts by storage identity.
5. Add version-conflict handling and deep links.

### Phase 3: desktop authorization and IPC

1. Add system-browser PKCE/loopback authorization.
2. Add secure refresh-token persistence.
3. Add narrow Drive IPC and renderer adapter.
4. Restore Drive package sessions.
5. Verify Windows, macOS, and Linux secure-storage behavior.

### Phase 4: production readiness

1. Publish privacy/support pages.
2. Complete Google OAuth brand/basic verification.
3. Move production OAuth project out of Testing.
4. Exercise revocation, quota, token expiry, and account-policy failures.
5. Update rules, skills, README, and user help to match implemented behavior.

## Verification

Repository checks:

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Manual matrix:

- web production origin and localhost;
- Electron on Windows, macOS, and Debian/Ubuntu;
- personal Google account and a Workspace account with policy restrictions;
- first consent, reconnect, disconnect/revoke, access-token expiry, desktop
  refresh, and Testing-mode refresh-token expiry;
- create, edit, autosave, reopen from recent, rename/move in Drive, trash,
  restore, quota failure, offline recovery, and concurrent edits;
- settings merge between two devices;
- invalid settings and invalid/malicious `.schdk` bytes;
- Linux with and without a secure secret store.

Use a dedicated test Google Cloud project and test accounts. Never use
production credentials in automated tests. When a later `add missing tests`
prompt covers this feature, use a fake fetch/token provider and mock Google's
network boundary. Real OAuth remains a manual smoke test because it requires
user consent.

## Acceptance criteria

- No application server or serverless function is deployed.
- No broad or restricted Drive scope is requested.
- Tokens never appear in persistent browser storage, renderer state, IPC
  payloads, URLs, or logs.
- Desktop OAuth uses the system browser, PKCE S256, state validation, and
  loopback-only listener.
- Browser clearly reports when Drive sync requires reconnect.
- Desktop refreshes access without prompting when secure credentials are valid.
- The latest package edit is either confirmed in Drive or retained in local
  recovery.
- Editor and host open recent Drive packages by file ID and validate content.
- Remote version conflicts never silently overwrite either copy.
- Local-only operation remains functional when Drive is disconnected or down.

## Rollback

Disable the Google client IDs and hide the Drive connection UI. Existing local
settings, drafts, IndexedDB recents, and local files continue to work. Removing
the feature does not delete the user's visible `SCHDK` folder or hidden Drive
app data; users retain control through Google Drive and Google Account
permissions.
