# SCHDK project specification

Format: `FORMAT.md`
Feature contracts: `docs/specs/README.md`

## §G

G1|Create, store, edit, and host portable «Що? Де? Коли?» games on web and desktop.

## §C

C1|Keep shipped product behavior specified under `docs/specs`.
C2|Keep package format canonical in `docs/GAME_PACKAGE.md` and `@schdk/common`.
C3|Keep browser packages free of Electron and Node APIs.
C4|Keep renderer access to desktop and Google services narrow and validated.
C5|Keep user-visible unified application copy localized in Ukrainian and English.
C6|Keep unfinished packages editable and recoverable without silent destination changes.
C7|Keep user AI API keys in separate, account-scoped Google Drive app data and out of synchronized settings or local browser persistence.
C8|Keep personal and global AI question rules as individually parseable Google Drive files with folder-scoped ownership.
C9|Keep personal AI question packages as individually parseable Google Drive files and out of browser-local persistence.
C10|Keep the personal question database a rebuildable account-scoped projection; `.schdk` packages remain canonical.
C11|Keep shared question-generation dictionaries as validated archives in their fixed Google Drive folder and writable only by an allowlisted administrator.

## §I

I.specs|Feature acceptance contracts|`docs/specs/README.md`
I.package|Portable game file|`.schdk`
I.template|Portable visual layout|`.schdk-template`
I.web|Unified browser application|`@schdk/web`
I.desktop|Windows, macOS, and Linux application|`@schdk/desktop`
I.drive|Package and settings persistence|Google Drive
I.ai|Structured question generation|`@schdk/ai`
I.aiquestion|Portable AI question rule|`.aiquestion`
I.aiquestionpackage|Portable AI question package|`.aiquestionpackage`
I.questiondatabase|Personal question search index|`question-database-v1.json`
I.pages|Hosted browser application|GitHub Pages
I.release|Versioned unsigned Windows installer|GitHub Releases
I.version|Published browser version|`packages/web/version.json`
I.dictionary|Portable shared generation dictionary|`.schdk-dictionary`

## §V

V1|Every shipped feature belongs to one acceptance contract under `docs/specs`.
V2|Every imported package is parsed before use; file extension is never trusted.
V3|Readiness validation stays separate from structural package parsing.
V4|Pre-game hosting never exposes question, answer, comment, or host-note text.
V5|Browser and desktop package workflows remain Drive-backed after import.
V6|Desktop OAuth tokens stay in Electron main and never cross renderer IPC.
V7|Every prompt that changes shipped behavior creates or updates affected feature contracts before verification.
V8|AI API keys persist only in the current Google account's separate Drive app data; desktop renderer IPC exposes only save, remove, configured status, and validated generation without returning the key.
V9|Package-folder discovery and restorable editor/host state never cross connected Google accounts.
V10|Package handout images remain embedded and cannot trigger external image requests.
V11|Package imports enforce bounded archive and entry sizes before ZIP extraction.
V12|Amber primary actions keep their visual treatment stable across pointer hover on every application surface.
V13|Local package and visual-template imports enforce canonical limits before whole-file reads or ZIP extraction.
V14|Drive package recents traverse every API result page.
V15|Browser entry points deny unlisted scripts, connections, frames, objects, and form targets through CSP.
V16|Each GitHub Release contains exactly one unsigned version-matched Windows x64 installer.
V17|Third-party GitHub Actions execute only from reviewed immutable commit SHAs.
V18|Pull requests execute the production browser shell and packaged Electron renderer before their required checks pass.
V19|The browser warns before unloading a package whose current changes are not saved.
V20|AI output is validated as a complete game question before it can replace editor fields.
V21|Every multiline text input uses the shared non-resizable `Textarea` control; labeled fields show the label as an empty placeholder and inside the populated textarea at bottom right.
V22|Every personal or global AI question rule is parsed from its own `.aiquestion` ZIP archive and persisted through its assigned Google Drive folder.
V23|Global AI question writes require an allowlisted account and remain confined to the configured shared Drive folder.
V24|At most one global AI question rule is marked as general, only an allowlisted administrator can change it, and generation applies it to every selected template.
V25|Only an allowlisted administrator can preview the exact system and user prompt text used for AI question generation.
V26|Every personal AI question package is parsed from its own `.aiquestionpackage` ZIP archive before use and persisted through the current account's Google Drive folder.
V27|A ready package never reuses a normalized main or alternative answer across questions, and AI generation never accepts such a duplicate.
V28|Every AI-generated candidate undergoes editorial quality review and semantic review for entity uniqueness and package-wide type and form diversity before replacing editor state.
V29|Editing an existing question kind or package-creation rule occupies a dedicated deep-linkable shell page restored by reload and browser history.
V30|Web and desktop clients surface a newer published application version within one minute without granting the renderer generic network or navigation access.
V31|Question-database rows derive only from parsed packages owned by the connected account and never become canonical package data.
V32|Question-database similarity checking defaults off; when enabled, a semantically similar generated question or answer is rejected and regenerated once before failure.
V33|Host notes contain only delivery instructions visible while the host reads a question and never contain answer-review or quality-analysis notes.
V34|AI package regeneration of remarked questions includes the current question and author remark and clears the remark only after successful replacement.
V35|Selecting a personal-database result loads the complete canonical source question and never replaces a populated editor slot without explicit confirmation.
V36|Initial Drive recents loading issues one files request for its first result page even when editor and host are mounted.
V37|Question and package generation use a non-modal full-height right dock without a blocking backdrop, keep the editor centered with equal spacing from both docks, lock unfinished targets, unlock completed targets, preserve author selection, and close after final success.
V38|AI-generated question text and answer comments contain only natural player-facing prose without template construction labels, paths, stages, techniques, or stock meta-commentary.
V39|Asynchronous editor results apply only to the package session that started them.
V40|Account-scoped background work never persists after the connected Google account changes.
V41|Every game-package payload crossing Drive or desktop IPC is parsed before Drive or filesystem writes, and its Drive metadata matches the parsed package.
V42|Image handout selection is bounded before reading and cannot leave the editor with an unserializable package.
V43|A replacement global general rule is persisted before the previous general rule is cleared.
V44|Every shared generation dictionary is parsed from its `.schdk-dictionary` ZIP archive, remains folder-scoped and admin-writable, and supplies both dropdown labels and provider prompt fragments.
V45|AI review validates an image request through its generation description, and OpenAI generates and canonically parses the bounded embedded image only after the question passes review.
V46|Browser OAuth tokens remain memory-only, while desktop refresh credentials remain encrypted, scope-validated, and removed after invalidation.

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
B20|2026-07-26|Windows release packaging explicitly disabled executable signing|Superseded by B43.
B21|2026-07-26|GitHub workflows referenced mutable major-version action tags|V17
B22|2026-07-26|Pull-request CI built browser and Electron artifacts without executing either runtime|V18
B23|2026-07-26|Every Drive request failure was treated as lost authorization and hid the mounted tools|Keep authorized sessions mounted through transient Drive failures.
B24|2026-07-26|Browser unload could discard changes before delayed or failed autosave completed|V19
B25|2026-07-26|Image handout selection trusted the file chooser hint and could serialize a MIME-invalid handout that package parsing later rejected|Validate the selected MIME type and generated data URL before changing package state.
B26|2026-07-26|Drive package loading buffered media before checking the canonical package limit|V11
B27|2026-07-26|Music selection read oversized audio fully into memory before package serialization rejected it|Reject oversized music files before reading their bytes.
B28|2026-07-26|Generated package filenames could exceed the same length limit enforced by Drive package validation|Truncate generated filenames to the canonical Drive name limit.
B29|2026-07-26|Failed desktop restoration cleared the pathname session key instead of the account-scoped key that was loaded|V9
B30|2026-07-26|Adding AI page copy inline pushed both locale modules past the enforced source-file limit|Split the copy into a focused localization module; the existing repository workflow test covers recurrence.
B31|2026-07-26|The AI form relied on the shared textarea's Ukrainian optional-label default in English locale|Pass the active locale's optional label explicitly; C5 and SHL-5 already define the localization contract.
B32|2026-07-26|The generic button hover background overrode amber primary actions with the dark surface color|V12
B33|2026-07-26|AI question updates used an ES2023 array method outside the browser application's configured library target|Use the existing target-compatible array mapping pattern; typechecking covers recurrence.
B34|2026-07-26|The AI SDK declarations referenced Node and JSON Schema types that the new package did not include|Declare the ambient type packages explicitly; package typechecking covers recurrence.
B35|2026-07-26|The new NodeNext desktop consumer exposed extensionless relative exports in the shared package|Use runtime-correct `.js` specifiers in shared ESM exports; desktop typechecking covers recurrence.
B36|2026-07-26|OpenAI rejected handout discriminator schemas without an explicit JSON type|Provider-bound discriminator schemas declare both `type` and `enum`; a live Responses API request covers recurrence.
B37|2026-07-26|The packaged desktop application omitted the AI SDK's `zod` peer dependency and crashed before its smoke test could run|Declare `zod` as a direct `@schdk/ai` runtime dependency; V18's packaged Electron smoke test covers recurrence.
B38|2026-07-26|The packaged AI runtime resolved `@schdk/common` to TypeScript source under `node_modules`|Expose the built JavaScript as the package's default export while preserving source exports for types and development; V18 covers recurrence.
B39|2026-07-27|The AI question card stylesheet referenced a nonexistent large-font token and failed Sass compilation|Use the one-off font size directly; the required UI and root builds catch this mechanical regression.
B40|2026-07-27|AI question card sections each rendered their own background and border instead of forming one card|Keep chrome on the outer card and leave its title, centered text, and bottom actions unframed; `docs/specs/unified-shell.md` covers recurrence.
B41|2026-07-27|AI question cards used a minimum height and unconstrained centered text, so long content stretched cards indefinitely|Fix the card height and clamp left-aligned content with an ellipsis; `docs/specs/unified-shell.md` covers recurrence.
B42|2026-07-27|The new release-secret guide used an unformatted Markdown table|Apply the repository formatter; no new invariant is needed for this mechanical failure.
B43|2026-07-27|The signed cross-platform release contract required unavailable signing credentials and blocked publication|V16
B44|2026-07-27|Global AI question wiring pushed three source files beyond the enforced line limit|Split token storage, Drive package storage, and the collection view; the existing repository workflow test covers recurrence.
B45|2026-07-27|The account-rule add action lived in the page header instead of beside its collection heading|Keep each add action in its collection header as specified by `docs/specs/unified-shell.md`.
B46|2026-07-27|AI question collections rendered blank while their rules loaded|Render card skeletons for each loading collection as specified by `docs/specs/unified-shell.md`.
B47|2026-07-27|Skeleton markup used literal multi-class JSX strings outside the component composition contract|Use the existing `classNames` pattern; the repository workflow test covers recurrence.
B48|2026-07-27|The form's generic label layout overrode the general-rule switch and stretched it into a large circle below its title|Scope field-label layout to direct form children so the switch stays beside its title as specified by `docs/specs/unified-shell.md`.
B49|2026-07-27|General-rule cards exposed the ordinary favorite action and the form switch floated awkwardly beside its heading|Show a disabled lock on general-rule cards and place the editable switch in its own settings row as specified by `docs/specs/unified-shell.md`.
B50|2026-07-27|The prompt-panel state class used a BEM separator outside the enforced selector naming contract|Use the existing kebab-case selector convention; no new invariant is needed for this mechanical failure.
B51|2026-07-27|The prompt-panel conditional class bypassed the repository's component composition contract|Use the existing `classNames` pattern; the repository workflow test covers recurrence.
B52|2026-07-27|Generated questions were merged into existing records, leaving stale optional fields when the provider omitted them|V20
B53|2026-07-27|The shared rules page width excluded its own padding and overflowed narrow viewports|Keep the page border-box sized; `docs/specs/unified-shell.md` covers recurrence.
B54|2026-07-27|A redundant editor action label pushed the Ukrainian locale module past the enforced source-file limit|Reuse the existing shared remove label; the repository workflow test covers recurrence.
B55|2026-07-27|Global editor clipboard hotkeys intercepted native copy and paste while an editable field had focus|Ignore keyboard events from input, textarea, select, and contenteditable targets; `docs/specs/package-editor.md` covers recurrence.
B56|2026-07-28|The provider schema allowed more question parts than the generated question type accepted locally|V20
B57|2026-07-28|Editor toasts omitted React-Toastify's base CSS, used its obsolete background variable, and kept a 2.5-second timeout|Load the base styles, use the active SCHDK surface palette, and close automatically after two seconds; `docs/specs/package-editor.md` covers recurrence.
B58|2026-07-28|Rebase conflict resolution combined package-generation changes beyond the enforced source-file limit|Compact the existing icon import; the repository workflow test covers recurrence.
B59|2026-07-28|Adding every per-question context with number 1 allowed duplicate unsorted rows|Choose the first free number, disable occupied choices, and keep rows number-sorted as specified by `docs/specs/unified-shell.md`.
B60|2026-07-28|The compact context-row breakpoint used legacy media-query syntax rejected by the existing stylesheet policy|Use the required context range notation; linting already covers recurrence.
B61|2026-07-28|A timed-out root build overlapped its retry and both packagers wrote the same Electron output directory|Wait for the first packager to stop before retrying; no product invariant is needed.
B62|2026-07-28|The readiness test fixture assigned the same answer to every question after uniqueness became a package invariant|Give each fixture question a distinct answer; V27 covers product recurrence.
B63|2026-07-28|Answer uniqueness logic pushed three source files beyond the enforced 256-line limit|Split prompt, readiness-validation, and package-generation input helpers; the existing workflow test covers recurrence.
B64|2026-07-28|Rule-editor deep-link wiring pushed two source files beyond the enforced 256-line limit|Split URL-state handling and the question-form constant by cohesive responsibility; the existing workflow test covers recurrence.
B65|2026-07-28|The first route split let a collection index reach a boolean edit helper and left duplicate popstate ownership in App|Adapt the callback explicitly and consolidate shell view and editor navigation; linting and typechecking cover recurrence.
B66|2026-07-28|The base icon-button color overrode the update button's green state|Use the combined update-button selector; `docs/specs/unified-shell.md` covers recurrence.
B67|2026-07-28|The AI schema left host notes underspecified and package generation exposed no remarked-question scope|V33,V34
B68|2026-07-28|Adding remarked-question generation pushed its dialog past the enforced source-file limit|Move excluded-answer calculation into the existing pure generation-input module; the repository workflow test covers recurrence.
B69|2026-07-28|Text handouts used proportional fonts, so character-based diagrams lost alignment between editing and gameplay|Use monospace fonts on text handouts in both surfaces; `docs/specs/package-editor.md` and `docs/specs/game-hosting.md` cover recurrence.
B70|2026-07-28|The block-level package title forced its generation action onto a separate row|Keep the title field and generation action in one flex row as specified by `docs/specs/package-editor.md`.
B71|2026-07-28|Question-database editor wiring pushed four existing source files beyond the enforced 256-line limit|Move selection behavior and component-specific styles into their owning modules and keep new copy in the question-database localization module; the existing workflow test covers recurrence.
B72|2026-07-29|A repeated editor action reused an active toast ID without restarting its lifetime, so the latest notification could disappear immediately|Update the active toast and restart its two-second timeout; `docs/specs/package-editor.md` covers recurrence.
B73|2026-07-29|Unstable failure callbacks, separate editor and host loads, and package-folder discovery multiplied the initial recents request|V36
B74|2026-07-29|Recents rendered status tags only for ready or remarked packages, leaving unfinished packages without remarks unlabeled|Show a localized in-development tag for the remaining package state.
B75|2026-07-29|Adding recent-package copy to the full Ukrainian locale module exceeded the enforced source-file limit|Keep related recent-package status copy in the existing question-database localization module; the repository workflow test covers recurrence.
B76|2026-07-29|The export migration moved a Storybook fixture mutation before the declaration it initializes|Keep the fixture declaration before its mutation; Storybook typechecking covers recurrence.
B77|2026-07-29|The package merge left type-only imports of ambient declarations that moved to the shared web root|Remove the obsolete imports; web typechecking covers this one-time migration failure.
B78|2026-07-29|Preloading copy and indicator styles pushed two existing source files beyond the enforced 256-line limit|Split shell copy and navigation styles by cohesive responsibility; the existing repository workflow test covers recurrence.
B79|2026-07-29|Extracting question-generation state removed types still named by JSX casts|Infer the cast types from current state; UI typechecking covers recurrence.
B80|2026-07-29|Default dock classes were composed as multi-class JSX literals outside the repository contract|Use the existing `classNames` dependency; the repository workflow test covers recurrence.
B81|2026-07-29|Storybook fixtures imported component values that imported the fixtures back, leaving `gamePackage` uninitialized at runtime|Move the game-package fixture to its own acyclic module; browser smoke testing covers recurrence.
B82|2026-07-29|Docked generation panels remained modal cards with blocking backdrops and package generation repeatedly stole question selection|V37
B83|2026-07-29|The dock-width override replaced the editor's automatic margins and pinned it to the left navigation|V37
B84|2026-07-29|The centered editor reserved only the dock width and omitted its standard side gutters|V37
B85|2026-07-29|Generation passed labeled template guidance without explicitly separating or removing internal construction terminology from output|V38
B86|2026-07-29|Standard control heights and spacing made sticky question navigation taller than short desktop viewports|Use compact controls and spacing as specified by `docs/specs/package-editor.md`.
B87|2026-07-29|Compact navigation styling pushed an existing SCSS partial past the enforced source-file limit|Merge adjacent selectors; the existing repository workflow test covers recurrence.
B88|2026-07-29|Inline answer-list actions pushed the shared question-editor SCSS partial past the enforced source-file limit|Move the component-specific rules to `AnswerListField/styles.scss`; the existing repository workflow test covers recurrence.
B89|2026-07-29|The generated-question selector used chained simple `:not()` notation rejected by the stylesheet policy|Use the required complex `:not()` notation; linting covers recurrence.
B90|2026-07-29|The generation prompt allowed answer comments to begin with the stock phrase "Both clues independently point to"|V38
B91|2026-07-29|The optional handout used a redundant heading and vertically stacked controls with inconsistent dimensions|Use the two-column handout layout specified by `docs/specs/package-editor.md`.
B92|2026-07-29|Legacy textarea top margins made vertical editor-field gaps differ from the horizontal gap|Use the uniform field spacing specified by `docs/specs/package-editor.md`.
B93|2026-07-29|Uniform field spacing pushed the existing editor-question stylesheet past the enforced source-file limit|Move the textarea spacing override to the existing editor-fields rule; the repository workflow test covers recurrence.
B94|2026-07-29|The populated-field label added bottom padding only after text was entered, making equal-row textareas different heights|Reserve the label space in every labeled textarea as specified by `docs/specs/package-editor.md`.
B95|2026-07-29|TypeScript stylesheet imports omitted a Sass partial's required underscore and failed UI tests|Use the partial's literal filename; existing UI tests and Storybook build cover recurrence.
B96|2026-07-29|Base components depended on parent stylesheet context and the Storybook generator ignored grouped exports|Load base styles at the component boundary and render generated stories with their production area context; Storybook build and browser smoke testing cover recurrence.
B97|2026-07-29|The page's 320-pixel minimum width excluded the vertical scrollbar and caused horizontal overflow at the minimum supported viewport|Remove the redundant body minimum; the existing 320-pixel browser smoke test covers recurrence.
B98|2026-07-29|Background generation callbacks remained active after their source package closed and could replace questions in the next package|V39
B99|2026-07-29|Question-database refresh guarded stale UI updates but could still persist after the Drive account changed|V40
B100|2026-07-29|Selecting a replacement global general rule cleared the previous rule before the replacement write succeeded|V43
B101|2026-07-29|Desktop package IPC validated only argument shapes and allowed unparsed bytes or inconsistent metadata to reach writes|V41
B102|2026-07-29|Image handouts were read without a size bound and could make the package exceed its serialization limit|V42
B103|2026-07-29|A Drive client test used malformed package bytes after the shared write boundary began enforcing V41|V41
B104|2026-07-30|The new dictionary flow passed a generic typed array directly to Blob and omitted required dictionary props from generation-hook call objects|Copy the existing Blob input pattern and pass complete props; typechecking covers recurrence.
B105|2026-07-30|The generated dictionary-page story received a scalar placeholder instead of dictionary fixtures and crashed during visual verification|Add renderable dictionary defaults to the existing Storybook fixture map; the UI workflow requires visual smoke testing.
B106|2026-07-31|Skill compaction removed phrases enforced by repository workflow tests|Restore the machine-checked wording; the existing workflow tests cover recurrence.
B107|2026-07-30|The generation panel's generic label layout overrode the database checkbox row and separated the control from its text|Keep the compact checkbox inline as specified by `docs/specs/package-editor.md`.
B108|2026-07-31|The AI reviewer repeatedly rejected candidates for image handouts that the text-only generator cannot produce, exhausting all four provider calls and failing generation|V45
B109|2026-07-31|Browser OAuth persisted bearer tokens in session storage and desktop refresh retained invalid or partially authorized credentials|V46
