# Unified shell

Status: implemented

## Goal

Provide one consistent entry point for visual editing, AI-assisted authoring,
package authoring, hosting, settings, and account state.

## Requirements

- **SHL-1:** Fixed navigation groups Visual editor, Artificial intelligence,
  Edit question packages, and Host a game under SCHDK, in that order, with
  Settings at the bottom.
- **SHL-2:** Application chunks load lazily on first selection and remain
  mounted afterward so navigation preserves state.
- **SHL-3:** Active view persists locally and in the validated `view` query
  parameter. The active primary settings group persists in the validated
  `settings` query parameter while settings are open. Browser back, forward,
  and deep links restore both values.
- **SHL-4:** A valid browser `package` query opens the editor and restores the
  referenced Drive package and selected question.
- **SHL-5:** Ukrainian is the default locale; explicit Ukrainian or English
  selection localizes shell, settings, editor, host, gameplay, and visual
  editor.
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
  visible; account status and disconnect remain available after connection.
- **SHL-11:** The Artificial intelligence page is currently empty and reserved
  for bundled and user-authored question-generation rules.
- **SHL-12:** Artificial intelligence settings expose separate provider and
  model dropdowns plus a user API key. The dropdowns use the models.dev catalog
  of text-generation providers and non-deprecated models, with a small built-in
  fallback when the catalog is unavailable. Changing the provider selects its
  default model; both selections persist locally. The API key persists in a
  separate app-data file owned by the current Google account and never enters
  synchronized settings or local browser persistence. When configured, the
  empty key field shows a fixed mask without reading the stored value, and the
  configured status is green.

## Invariants

- Navigation stays keyboard accessible.
- Browser and Electron runtimes use the same shell and user-facing behavior.
- Standalone host and editor remain Ukrainian by default.
- Invalid stored locale, theme, view, package reference, or option values fall
  back to validated defaults.
- AI API keys never enter local storage, URLs, or synchronized settings and
  never carry across Google accounts.

## Acceptance

1. Deep-link to every shell page and primary settings group, then use browser
   history to restore prior pages and groups.
2. Switch locale and theme, reload, and observe the same selection on every
   mounted surface.
3. Navigate away from an in-progress editor and game, return, and observe
   preserved state.
4. Disconnect Google and verify mounted tools become inaccessible until
   reconnection.
5. Open the Artificial intelligence route directly, then configure its model
   and API key; reload and confirm both remain for the same Google account,
   then switch accounts and confirm the previous key is not exposed.
