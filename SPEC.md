# SCHDK project specification

Format: `FORMAT.md`
Feature contracts: `docs/specs/README.md`

## §G

G1|Create, store, edit, and host portable «Що? Де? Коли?» games on web and Windows.

## §C

C1|Keep shipped product behavior specified under `docs/specs`.
C2|Keep package format canonical in `docs/GAME_PACKAGE.md` and `@schdk/common`.
C3|Keep browser packages free of Electron and Node APIs.
C4|Keep renderer access to desktop and Google services narrow and validated.
C5|Keep user-visible unified application copy localized in Ukrainian and English.
C6|Keep unfinished packages editable and recoverable without silent destination changes.
C7|Keep user AI API keys in separate, account-scoped Google Drive app data and out of synchronized settings or local browser persistence.

## §I

I.specs|Feature acceptance contracts|`docs/specs/README.md`
I.package|Portable game file|`.schdk`
I.template|Portable visual layout|`.schdk-template`
I.web|Unified browser application|`@schdk/all-web-app`
I.desktop|Windows application|`@schdk/all-desktop-app`
I.drive|Package and settings persistence|Google Drive
I.pages|Hosted browser application|GitHub Pages
I.release|Versioned Windows distribution|GitHub Releases

## §V

V1|Every shipped feature belongs to one acceptance contract under `docs/specs`.
V2|Every imported package is parsed before use; file extension is never trusted.
V3|Readiness validation stays separate from structural package parsing.
V4|Pre-game hosting never exposes question, answer, comment, or host-note text.
V5|Browser and desktop package workflows remain Drive-backed after import.
V6|Desktop OAuth tokens stay in Electron main and never cross renderer IPC.
V7|Every prompt that changes shipped behavior creates or updates affected feature contracts before verification.
V8|AI API keys persist only in the current Google account's separate Drive app data; desktop renderer IPC exposes only save, remove, and configured status.
V9|Package-folder discovery and restorable editor/host state never cross connected Google accounts.
V10|Package handout images remain embedded and cannot trigger external image requests.
V11|Package imports enforce bounded archive and entry sizes before ZIP extraction.
V12|Amber primary actions keep their visual treatment stable across pointer hover on every application surface.
V13|Local package and visual-template imports enforce canonical limits before whole-file reads or ZIP extraction.
V14|Drive package recents traverse every API result page.
V15|Browser entry points deny unlisted scripts, connections, frames, objects, and form targets through CSP.
V16|Windows GitHub Releases contain only Authenticode-valid executables.
V17|Third-party GitHub Actions execute only from reviewed immutable commit SHAs.
V18|Pull requests execute the production browser shell and packaged Electron renderer before their required checks pass.
V19|The browser warns before unloading a package whose current changes are not saved.

## §T

id|status|task|cites
T1|x|Distill shipped feature contracts|V1,V7,I.specs
T2|x|Automate post-prompt specification sync|V1,V7,I.specs

## §B

id|date|cause|fix
B1|2026-07-26|New AI settings wiring missed existing lint contracts for unused imports and media range syntax|Remove the unused import and use context range notation.
B2|2026-07-26|Equal dropdown widths truncated longer AI model names|Give the model dropdown more width while preserving the responsive stack.
B3|2026-07-26|The manually curated AI catalog exposed too few providers and models|Populate text-generation choices from models.dev with a built-in fallback.
B4|2026-07-26|AI API keys were stored per device instead of following the current Google account|Persist them in a separate account-scoped Drive app-data file and migrate legacy local values after connection.
B5|2026-07-26|Extracting shared app-data persistence accidentally removed an upload endpoint still used by package writes|Restore the shared upload endpoint constant; existing typechecking catches this mechanical regression.
B6|2026-07-26|The active settings group lived only in local component state, so its URL could not be shared or restored|Extend the shell deep-link contract to validate and restore the `settings` query parameter.
B7|2026-07-26|The new settings deep-link hook used a multiline import that differed from the repository formatter output|Apply the existing formatter; no new invariant is needed for this mechanical failure.
B8|2026-07-26|The Google login button replaced its gradient and border on hover, causing a visible flash|Keep its visual treatment stable across pointer hover.
B9|2026-07-26|The configured AI key field looked empty and its success status inherited muted text styling|Show a fixed mask without reading the stored key and use the existing success color token.
B10|2026-07-26|Activity-based token renewal pushed the browser Drive module past the enforced source-file limit|Split Google Identity Services loading into a focused browser module.
B11|2026-07-26|The initial deployment workflows called Vite directly before workspace dependencies emitted their package outputs|Build each deployable application through its Turbo dependency graph.
B12|2026-07-26|The Drive client retained a package-folder ID and mounted editor/host state across account changes|V9
B13|2026-07-26|Image handout parsing accepted arbitrary URLs that renderers used directly as image sources|V10
B14|2026-07-26|Synchronous package parsing extracted every ZIP entry without resource limits|V11
B15|2026-07-26|Shared and application-scoped amber button styles replaced a gradient with a non-interpolable solid hover background, causing visible flashes|V12
B16|2026-07-26|Local package and visual-template imports allocated complete oversized files before enforcing parser limits|V13
B17|2026-07-26|Adding a template size guard pushed the shell component past the enforced source-file limit|Use bounded native `File.slice`; the existing repository structure test covers recurrence.
B18|2026-07-26|Drive package recents stopped after the first 20 files|V14
B19|2026-07-26|Application CSP restricted only image sources and left executable and network capabilities unconstrained|V15
B20|2026-07-26|Windows release packaging explicitly disabled executable signing|V16
B21|2026-07-26|GitHub workflows referenced mutable major-version action tags|V17
B22|2026-07-26|Pull-request CI built browser and Electron artifacts without executing either runtime|V18
B23|2026-07-26|Every Drive request failure was treated as lost authorization and hid the mounted tools|Keep authorized sessions mounted through transient Drive failures.
B24|2026-07-26|Browser unload could discard changes before delayed or failed autosave completed|V19
B25|2026-07-26|Image handout selection trusted the file chooser hint and could serialize a MIME-invalid handout that package parsing later rejected|Validate the selected MIME type and generated data URL before changing package state.
B26|2026-07-26|Drive package loading buffered media before checking the canonical package limit|V11
B27|2026-07-26|Music selection read oversized audio fully into memory before package serialization rejected it|Reject oversized music files before reading their bytes.
B28|2026-07-26|Generated package filenames could exceed the same length limit enforced by Drive package validation|Truncate generated filenames to the canonical Drive name limit.
