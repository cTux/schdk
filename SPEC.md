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

## §I

I.specs|Feature acceptance contracts|`docs/specs/README.md`
I.package|Portable game file|`.schdk`
I.template|Portable visual layout|`.schdk-template`
I.web|Unified browser application|`@schdk/all-web-app`
I.desktop|Windows application|`@schdk/all-desktop-app`
I.drive|Package and settings persistence|Google Drive

## §V

V1|Every shipped feature belongs to one acceptance contract under `docs/specs`.
V2|Every imported package is parsed before use; file extension is never trusted.
V3|Readiness validation stays separate from structural package parsing.
V4|Pre-game hosting never exposes question, answer, comment, or host-note text.
V5|Browser and desktop package workflows remain Drive-backed after import.
V6|Desktop OAuth tokens stay in Electron main and never cross renderer IPC.
V7|Every prompt that changes shipped behavior creates or updates affected feature contracts before verification.

## §T

id|status|task|cites
T1|x|Distill shipped feature contracts|V1,V7,I.specs
T2|x|Automate post-prompt specification sync|V1,V7,I.specs

## §B

id|date|cause|fix
