# Unified shell

Status: implemented

## Goal

Provide one consistent entry point for visual editing, AI-assisted authoring,
package authoring, hosting, settings, and account state.

## Requirements

- **SHL-1:** Fixed navigation groups Question database, Visual editor, Question
  creation rules, Package creation rules, Dictionaries, Edit question
  packages, and Host a game under SCHDK, in that order, with Settings at the
  bottom. The Ukrainian
  question-rules label is
  `Правила створення питань`.
- **SHL-2:** Every navigable page chunk loads lazily on first selection and
  remains mounted afterward so navigation preserves state.
- **SHL-3:** Active view persists locally and in the validated `view` query
  parameter. The active primary settings group persists in the validated
  `settings` query parameter while settings are open. Browser back, forward,
  and deep links restore both values. Editing an existing question kind or
  package-creation rule or dictionary uses a dedicated page identified by the
  validated `edit` query parameter; direct links and browser history restore
  the editor or collection.
- **SHL-4:** A valid browser `package` query opens the editor and restores the
  referenced Drive package and selected question.
- **SHL-5:** Ukrainian is the default locale; explicit Ukrainian or English
  selection localizes shell, settings, editor, host, gameplay, visual editor,
  and AI question rules.
- **SHL-6:** Theme defaults to operating-system preference and supports
  persisted system, light, and dark choices.
- **SHL-7:** Settings expose application locale, Google account and sync state,
  custom shortcuts, and always-visible fieldsets for host options and editor
  text-correction options.
- **SHL-8:** Host settings persist automatic fullscreen, separate signal and
  music volumes, visual layout, background, and custom elements.
- **SHL-9:** Editor settings persist correction toggles for question text,
  answers, and answer comments.
- **SHL-10:** Before authorization, only the localized Google login screen is
  visible. The hosted web screen publicly identifies SCHDK, describes its
  purpose in both the rendered and static HTML. Before the JavaScript bundle
  loads, the static HTML uses the same centered branded card and operating-
  system light or dark palette as the rendered login screen. The hosted screen
  links its directly accessible same-domain privacy policy with compact themed
  hover and keyboard focus states; account status and disconnect remain
  available after connection.
- **SHL-11:** The Artificial intelligence page fills the available workspace
  width and lists name-sorted account rules followed by name-sorted global
  rules. The existing form creates account rules; allowlisted administrators
  can also create, edit, and delete global rules. Cards show only the name,
  description, and applicable favorite, edit, and delete actions in a compact
  layout without enable/disable controls or large internal gaps. The localized
  add action for each editable collection appears beside that collection's
  heading. Account and global collections independently show card skeletons
  while their rules load. Name and description are required before saving,
  deletion requires confirmation, and every change persists as the rule's
  `.aiquestion` ZIP file in Google Drive. A global-rule form shows
  administrators a shared checkbox in a dedicated settings row; selecting it
  makes that rule the only global rule applied to every question generation.
  Its card replaces the favorite action with a disabled lock indicator, so the
  general-rule state changes only through editing. Editing an existing account
  or global rule hides both collections until the editor is saved or canceled.
- **SHL-12:** Artificial intelligence settings expose separate provider and
  model dropdowns plus a user API key. The dropdowns use the models.dev catalog
  for the OpenAI, Anthropic, and Google providers supported by `@schdk/ai`,
  with a small built-in fallback when the catalog is unavailable. Changing the
  provider selects its default model; both selections persist locally. The API
  key persists in a
  separate app-data file owned by the current Google account and never enters
  synchronized settings or local browser persistence. When configured, the
  empty key field shows a fixed mask without reading the stored value, and the
  configured status is green.
- **SHL-13:** The production unified web application is deployed from `main`
  to the repository's GitHub Pages site and remains usable from its repository
  subpath.
- **SHL-14:** Amber primary actions use the same shared visual treatment across
  every mounted surface, brighten slightly on pointer hover, and do not flash
  when hover begins or ends.
- **SHL-15:** Pull requests load the production shell in a real headless browser
  and require the Google login view to render.
- **SHL-16:** Every multiline shell field uses the shared non-resizable control
  with the same chrome and interaction states as dropdowns. Its label appears
  as the placeholder while empty and moves inside the populated textarea at
  the bottom right.
- **SHL-17:** Package creation rules use a page visually consistent with
  question creation rules and show only the current account's packages. Each
  package edits a required name and shared context plus zero or more
  question-number contexts with an optional enabled AI question-rule type.
  Per-question contexts render as compact rows with two dropdowns and a
  single-line context field, stay sorted by question number, and do not allow
  duplicate question numbers. The rule collections are name-sorted. Question
  type dropdowns put starred favorites first and name-sort both the favorite
  and remaining rules. Enable, favorite, edit, delete, loading, and error states
  use the existing rule-card patterns. Editing an existing package rule hides
  its collection until the editor is saved or canceled.
- **SHL-18:** The GitHub Pages build publishes `version.json` at its root. The
  browser checks it immediately and every minute; when its version differs from
  the loaded build, a fixed green update icon appears at the bottom right with
  a localized tooltip and reloads the page when activated.
- **SHL-19:** Question database is the first SCHDK page and explicitly states
  that it contains only the connected user's questions, not a global
  collection. It groups identical questions into question, answer, and
  included-packages columns; filters normalized text across questions,
  answers, or both only after two entered characters; sorts by question or
  answer in either direction; renders only a window around the scroll
  position; and loads at most 100 additional filtered rows from a bottom
  action. On desktop, the table consumes the remaining workspace height and
  scrolls without creating a second full-page scrollbar.
- **SHL-20:** After Google authorization, Drive-backed question packages,
  personal and global AI question rules, and AI question packages begin
  loading before their pages open. The sidebar brand and SCHDK group show a
  localized preloading indicator until those lists finish loading.
- **SHL-21:** UI animations default on and add motion to shell page changes and
  interactive feedback. The first App settings tab exposes a persisted UI
  animations toggle that disables CSS animations and transitions across every
  mounted web and desktop surface. Operating-system reduced-motion preference
  also shortens motion regardless of this setting.
- **SHL-22:** The shell keeps the existing light and dark color palettes while
  using a solid fixed sidebar, a separated brand row, compact uppercase section
  labels, flat active navigation, a plain workspace, and borderless major
  surfaces without decorative gradients, glows, or glass effects. Borders stay
  on controls and structural delimiters, including editor question numbers.

## Invariants

- Navigation stays keyboard accessible.
- Browser and Electron runtimes use the same shell and user-facing behavior.
- Standalone host and editor remain Ukrainian by default.
- Invalid stored locale, theme, view, package reference, or option values fall
  back to validated defaults.
- UI motion never delays host navigation while UI animations or operating-system
  motion are disabled.
- AI API keys never enter local storage, URLs, or synchronized settings and
  never carry across Google accounts.

## Acceptance

1. Deep-link to every shell page and primary settings group, then use browser
   history to restore prior pages and groups.
2. Switch locale and theme, reload, and observe the same selection on every
   mounted surface.
3. Navigate away from an in-progress editor and game, return, and observe
   preserved state.
4. Open the hosted web application without authorization and confirm its SCHDK
   identity, purpose, and privacy-policy link are public. Throttle or disable
   JavaScript and refresh; confirm the static fallback keeps the centered owl
   card and operating-system light or dark palette before the bundle runs.
   Hover and keyboard focus the link and confirm its themed interaction states.
   Disconnect Google and verify mounted tools become inaccessible until
   reconnection.
5. Open the Artificial intelligence route directly, add rules with required
   names and descriptions, and observe account rules followed by global rules,
   each sorted by name. Confirm cards show only name, description, and
   applicable favorite, edit, and delete actions without large internal gaps.
   Confirm each available add action sits beside its collection heading.
   Reload and confirm both collections show card skeletons until their
   respective rules finish loading.
   Verify a regular account cannot mutate global rules and an allowlisted
   administrator can add, edit, and delete them. As an administrator, select a
   general rule and verify its card shows a disabled lock instead of a favorite
   action. Edit another rule, select it as general, and verify the previous
   selection clears. Confirm editing hides both collections, copy the URL,
   reload it, and use browser back/forward to restore the editor and collection.
6. Configure an AI model and API key; reload and confirm both remain for the
   same Google account, then switch accounts and confirm the previous key is
   not exposed.
7. Deploy the unified build to GitHub Pages; load the repository URL directly,
   refresh it, and verify its assets and shell routes remain available.
8. Hover amber primary actions in the shell, settings, editor, and host; observe
   a slightly lighter amber state without a background flash.
9. Run pull-request checks and observe the production login shell render in
   headless Chrome.
10. Open the Artificial intelligence form and confirm every multiline field
    matches the shared dropdown styling without a resize handle, uses its label
    as the empty placeholder, and shows the label inside the populated textarea
    at the bottom right.
11. Open Package creation rules directly, create a package with shared and
    per-question context, and confirm its compact rows stay number-sorted,
    prevent duplicate question numbers, and offer favorite-first starred
    question types with each group sorted by name. Confirm the package-rule
    collection is name-sorted. Reload, edit its enabled and favorite states,
    and delete it. Confirm editing hides the collection and its copied URL
    restores the same editor after reload and through browser history. Confirm
    no global collection appears.
12. Keep a deployed browser build open, publish a different `version.json`,
    wait at most one minute, and verify the localized green update button
    appears and reloads the page.
13. Open Question database and confirm it is first in SCHDK navigation and
    identifies the collection as personal. Confirm duplicate questions list
    all containing packages in one row. Enter one and then two search
    characters, search question and answer text separately and together,
    reverse both sortable columns, scroll the dynamically sized desktop table
    without scrolling the whole page or rendering the complete result set, and
    load the next batch from the bottom action.
14. Connect Google without opening a SCHDK page and observe its Drive-backed
    lists begin loading. Confirm localized preloading indicators appear in the
    sidebar brand and SCHDK group until every list finishes, then navigate to
    each page and confirm its page chunk loads on first selection.
15. Navigate between every shell page and observe its entrance motion. Disable
    UI animations in App settings, navigate through shell, editor, and host
    interactions without animated delays, reload, and confirm the toggle
    remains off. Re-enable it and confirm motion returns.
16. Compare the shell in light and dark themes and confirm both retain their
    existing colors while the sidebar, active navigation, workspace, and
    panels use the flat visual treatment in SHL-22 at normal and 320-pixel
    widths.
