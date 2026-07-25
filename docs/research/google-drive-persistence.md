# Backendless Google Drive persistence research

Date: 2026-07-25

## Executive summary

Google authorization and Drive persistence can be added without an application
server. The existing web and desktop applications can call Google Drive API v3
directly after the user grants access.

Use one Google Cloud project with two OAuth client types:

- a Web application client for the browser, using Google Identity Services'
  token model;
- a Desktop application client for Electron, using the system browser,
  authorization code flow, PKCE, and a loopback redirect.

Use only Google's non-sensitive `drive.file` and `drive.appdata` scopes:

- store user-visible `.schdk` packages in a visible `SCHDK` Drive folder;
- store settings and recent-package IDs in the hidden `appDataFolder`.

No Google API client npm package, proxy, Firebase project, Apps Script, or
packaging/authentication SaaS is needed. Native `fetch`, Google Identity
Services in the web app, and Electron/Node standard APIs are sufficient.

There is one unavoidable limitation: fully unattended browser autosave cannot
continue indefinitely without a backend. Google Identity Services issues a
short-lived browser access token, does not automatically refresh it, and
requires a user-driven event to request another token. Browser autosave can run
while authorization is valid, then preserve changes locally and ask the user to
reconnect. Electron can refresh automatically because Google's installed-app
flow returns a refresh token that can be protected by the operating system.

## Current SCHDK persistence

SCHDK currently has separate persistence paths:

| Data                             | Browser                                | Desktop                                    |
| -------------------------------- | -------------------------------------- | ------------------------------------------ |
| Editor text options              | `localStorage`                         | renderer `localStorage`                    |
| Game options, layout, background | `localStorage`                         | renderer `localStorage`                    |
| Pending recovery draft           | `localStorage`, keyed by filename      | renderer `localStorage`, keyed by filename |
| Editor recent packages           | full byte copies in IndexedDB          | local file paths in Electron user data     |
| Host recent packages             | separate full byte copies in IndexedDB | the same Electron local path list          |
| Package save                     | File System Access API or download     | authorized local path through IPC          |
| Autosave                         | recovery draft only                    | local file after one quiet second          |
| Shell/editor session             | URL/local storage                      | local storage plus local file path         |

Every downloaded or restored package is already parsed through
`@schdk/common`. Desktop writes are serialized, and newer edits remain pending
if an older write completes first. The Drive design should reuse these data
safety rules rather than replace them.

## Google authentication versus Drive authorization

SCHDK does not need a server-side account or login session. The feature is
OAuth authorization for the user's Drive, not authentication as an application
security boundary.

The UI should therefore say “Connect Google Drive,” display the connected
Google account returned by Drive's user metadata, and offer “Disconnect.” It
does not need to create an SCHDK account or validate an ID token on a server.

OAuth client IDs are public identifiers. They can be part of a browser or
desktop build. Access and refresh tokens are credentials and must never be
committed, logged, placed in URLs, or exposed through broad Electron IPC.

## Browser authorization

Use the Google Identity Services OAuth token model:

1. Load `https://accounts.google.com/gsi/client`.
2. Initialize `google.accounts.oauth2.initTokenClient` with the web client ID
   and Drive scopes.
3. Call `requestAccessToken()` from the user's “Connect Google Drive” action.
4. Keep the returned access token and expiry in memory.
5. Call Drive REST endpoints with an `Authorization: Bearer` header.

This flow is explicitly designed for direct browser REST/CORS calls and does
not need a backend or refresh-token storage.

The access token is short lived. Google requires another
`requestAccessToken()` call from a user-driven event after expiry and does not
support the previous automatic refresh behavior. Consequently:

- automatic saves work while the token is valid;
- an expired token changes sync state to `reauthorization-required`;
- local settings, IndexedDB package cache, and recovery drafts continue to
  protect changes;
- the next explicit reconnect resumes pending uploads;
- page reload cannot silently restore Drive access.

Storing the token in `localStorage`, IndexedDB, or a service worker would weaken
security and still would not create a refresh token. The Google Identity
Services code model is not an alternative because it is designed to send the
authorization code to a backend for exchange and secure refresh-token storage.

## Electron authorization

Google forbids OAuth authorization inside an embedded user-agent. The packaged
Electron `BrowserWindow` must not navigate to or embed Google's consent page.

Use Google's installed desktop application flow:

1. Generate a random PKCE verifier, S256 challenge, and state value in the
   Electron main process.
2. Start a temporary HTTP listener on `127.0.0.1` with a random available port.
3. Open Google's authorization URL in the operating system browser with
   Electron `shell.openExternal`.
4. Receive the authorization code through the loopback listener and validate
   state.
5. Exchange the code and PKCE verifier directly at Google's token endpoint.
6. Keep the access token in memory and encrypt the refresh token at rest with
   Electron `safeStorage`.
7. Refresh access tokens in the main process without renderer access to either
   token.

The loopback flow remains supported for Windows, macOS, and Linux desktop
applications. PKCE prevents a captured authorization code from being exchanged
without the verifier.

Use asynchronous `safeStorage`. On Linux, persistent refresh-token storage must
be disabled if secure storage is unavailable or resolves to the insecure
`basic_text` backend. In that case the user reconnects after restart; storing a
plaintext refresh token is not acceptable.

Electron's preload should expose only narrow connect/disconnect/status and Drive
file operations. It must not expose access tokens, refresh tokens, arbitrary
URLs, or a generic authenticated-fetch primitive.

## OAuth scopes

Request:

```text
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.appdata
```

Both are non-sensitive scopes recommended for narrow Drive integrations.

`drive.file` permits SCHDK to create and update files it created or that the
user explicitly opened with the app. It does not grant access to every file in
the user's Drive. `drive.appdata` permits access only to the application's
hidden configuration folder.

Do not request the broad `drive` or `drive.readonly` scopes. They are restricted
scopes, expose unrelated user files, increase verification burden, and are not
needed for this design.

If SCHDK later needs to import an arbitrary existing `.schdk` file from Drive,
use Google Picker to let the user grant `drive.file` access to that specific
file. Picker is not required for packages created and managed by SCHDK or for
opening those packages from its recent list.

## Drive data layout

### Packages

Create a visible folder named `SCHDK` in My Drive and tag it:

```json
{
  "appProperties": {
    "schdkType": "package-folder",
    "schemaVersion": "1"
  }
}
```

Store each package as its normal ZIP-based `.schdk` bytes with
`application/zip`. Tag package files:

```json
{
  "appProperties": {
    "schdkType": "game-package",
    "formatVersion": "1"
  }
}
```

Drive names are not unique. The Drive file ID, never the filename, is the
package identity. Renaming or moving a package must not break recent entries or
autosave.

Use multipart create/update for ordinary packages. Resumable upload is a
reasonable later optimization for large handout-heavy packages or unreliable
networks, but it adds a second request and upload-session state. Start with
multipart and keep the local recovery copy until Drive confirms success.

### Settings and recents

Create one hidden `settings-v1.json` file in `appDataFolder`. Store only
portable user preferences and Drive metadata:

```json
{
  "schemaVersion": 1,
  "sections": {
    "editorTextOptions": {
      "updatedAt": "2026-07-25T00:00:00.000Z",
      "value": {}
    },
    "gameOptions": {
      "updatedAt": "2026-07-25T00:00:00.000Z",
      "value": {}
    },
    "recentPackages": {
      "updatedAt": "2026-07-25T00:00:00.000Z",
      "value": [
        {
          "fileId": "drive-file-id",
          "openedAt": "2026-07-25T00:00:00.000Z"
        }
      ]
    }
  }
}
```

Do not sync:

- OAuth tokens;
- local disk paths or File System Access handles;
- active navigation view;
- selected question or open-window state;
- pending recovery drafts;
- upload queues or errors.

Those values are device/session state or safety data, not portable settings.
Keep at most 20 recent Drive IDs. Resolve current names and metadata from Drive
when rendering the list; a stale or deleted ID is removed best-effort.

The application data folder is hidden, app-private, and unsuitable for package
files users may want to see or share. It is appropriate for settings and the
recent index.

## Automatic saving

Use the existing one-second quiet-period behavior for Drive packages:

1. A package mutation remains `pending` and updates the local recovery draft.
2. After one quiet second, serialize the latest package.
3. Put writes for that Drive file through one promise queue.
4. Upload by Drive file ID.
5. On success, retain `pending` if newer edits exist; otherwise mark `saved`
   and remove only the matching recovery draft.
6. On network, quota, authorization, or conflict failure, mark `error`, keep the
   draft, and show an actionable message.

Retry `429` and transient `5xx` responses with bounded exponential backoff.
Do not retry validation, permission, quota-exhaustion, or invalid-credential
errors indefinitely. A `401` in the browser requires reconnect; Electron first
attempts one refresh and then requires reconnect.

The browser must not claim that changes are in Drive while authorization is
expired. “Saved locally; reconnect Google Drive to sync” is the accurate state.

## Recent packages

The Drive recent list lives in `settings-v1.json`, not in filenames or a broad
Drive search. Opening, creating, or successfully saving a Drive package moves
its ID to the front and truncates the list to 20.

To render recents:

1. Load the recent IDs.
2. Request current metadata for accessible IDs.
3. Remove inaccessible, deleted, or trashed entries.
4. Show filename, title/readiness metadata when locally cached, and Drive as the
   source.
5. Download selected bytes with `files.get?alt=media`.
6. Parse with `parseGamePackage`; the host additionally requires
   `validateGamePackage` success.
7. Update the recent timestamp only after the package opens successfully.

Cache the last downloaded bytes in IndexedDB by Drive file ID. This preserves
fast startup and local recovery, but Drive remains the source of truth when
online.

Browser deep links should use an opaque storage reference such as
`package=drive:<fileId>`, not a filename. A file ID does not bypass OAuth, but
the app should still set a strict referrer policy and avoid logging URLs.

## Concurrent edits

Drive is file storage, not a collaborative document database. SCHDK should not
silently overwrite a package changed by another device.

Record the Drive file's monotonically increasing `version` when opening or
saving. Before an autosave, compare current remote metadata with the last known
version. If it changed:

- keep the local draft;
- stop autosave;
- offer to reload the Drive copy or save the local version as a new Drive
  package;
- do not implement field-level merge in the first version.

This check cannot make two independent clients transactionally collaborative,
but it prevents the normal stale-editor overwrite. Full real-time
collaboration would require a server or a different data model and is out of
scope.

Settings are merged per section using `updatedAt`; recent lists are combined by
file ID and newest `openedAt`. Refetch and merge before writing the settings
file so an unrelated setting changed on another device is not overwritten by a
local section.

## Google Cloud setup

One Google Cloud project must:

1. Enable Google Drive API.
2. Configure the OAuth consent screen with the two non-sensitive scopes.
3. Create a Web application OAuth client with exact authorized production and
   localhost JavaScript origins.
4. Create a Desktop application OAuth client for Electron.
5. Publish a public homepage, privacy policy, and support contact on a verified
   domain before production OAuth verification.
6. Keep separate development/testing and production projects or credentials.

The web client ID and desktop client ID are build configuration, not secrets.
Production domains must be HTTPS. Google Identity Services can require CSP,
COOP, and referrer-policy headers; static hosting must be able to set them.

An external OAuth project in Testing mode limits users and causes refresh tokens
for Drive scopes to expire after seven days. Production desktop autosave
therefore requires the OAuth app to move out of Testing and complete applicable
brand/basic verification.

## Alternatives

| Approach                               | Serverless                           | Automatic refresh             | Scope/privacy                             | Decision                                   |
| -------------------------------------- | ------------------------------------ | ----------------------------- | ----------------------------------------- | ------------------------------------------ |
| GIS token model in browser             | Yes                                  | No; user gesture after expiry | Narrow scopes                             | Use for web with explicit limitation       |
| Installed-app PKCE in Electron         | Yes                                  | Yes, with local refresh token | Narrow scopes                             | Use for desktop                            |
| GIS code model                         | No practical benefit without backend | Backend refresh               | Narrow scopes                             | Reject under no-server constraint          |
| Broad `drive` scope                    | Yes                                  | Depends on client             | Accesses unrelated Drive data; restricted | Reject                                     |
| Packages in `appDataFolder`            | Yes                                  | Depends on client             | Hidden and unshareable                    | Reject for packages; use for settings      |
| Google Drive for desktop synced folder | Desktop only                         | Managed by Drive client       | No app OAuth                              | Reject as primary; optional local workflow |
| Firebase, Apps Script, or custom API   | No                                   | Yes                           | Adds server/data processor                | Reject                                     |
| Service account                        | Not for each user's personal Drive   | N/A                           | Wrong ownership/isolation model           | Reject                                     |

## Recommendation

Implement a Drive-first optional storage mode without replacing local safety
storage:

- browser: direct GIS token model and Drive REST, automatic sync while the token
  is valid, local recovery plus reconnect when it expires;
- desktop: system-browser PKCE flow, encrypted refresh token in Electron main,
  and uninterrupted autosave while credentials remain valid;
- settings/recents: hidden app data;
- packages: visible Drive folder, identified by file ID;
- local files: keep existing open/save paths, with an explicit “Save a copy to
  Google Drive” transition.

This is the maximum reliable behavior compatible with “no server.” If the
product later requires silent browser sync across reloads and token expiry, a
backend OAuth code exchange and secure refresh-token store becomes necessary.

## Sources

- [Google Identity Services token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Google Identity Services migration and refresh limitation](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis)
- [Google OAuth for desktop applications](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies)
- [Google OAuth token expiration](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services web setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- [Google Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Google Drive application data](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Google Drive file search](https://developers.google.com/workspace/drive/api/guides/search-files)
- [Google Drive uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
- [Google Drive file resource](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)
- [Google Drive error handling](https://developers.google.com/workspace/drive/api/guides/handle-errors)
- [Google Picker](https://developers.google.com/workspace/drive/api/guides/picker)
- [Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage)
- [Electron shell](https://www.electronjs.org/docs/latest/api/shell)
