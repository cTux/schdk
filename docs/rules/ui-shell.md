# Shell UI

- Keep the sidebar fixed while application content scrolls.
- Group, in this order, `Візуальний редактор`, `Правила створення питань`,
  `Правила створення пакету`, `Редагувати пакети питань`, and `Провести гру`
  under `ЩДК`. Keep
  `Налаштування` in a separate group at the bottom.
- Organize settings under an accessible primary `ЩДК` tab with always-visible
  `Проведення гри` and `Редагування питань` fieldsets.
- Keep the active primary settings tab controlled by the web shell so its URL
  deep link and browser history remain authoritative.
- Keep the native Ukrainian/English language control in the first `App`
  settings tab. Keep `WWW` as the second primary tab with its host/editor
  fieldsets and `Штучний інтелект` as the third primary tab.
- Keep AI provider and model as separate dropdowns backed by the application
  catalog; changing the provider refreshes the available text models.
- Keep the localized Google Drive connection and sync status in the first
  `App` settings tab, using the existing settings-row and button patterns.
- Keep a localized reference to every custom keyboard shortcut in the first
  `App` settings tab.
- Show the Google Drive account status immediately above the sidebar settings
  item, with the account avatar when available, an anonymous-user fallback, and
  a green connected or red disconnected indicator.
- Before the first successful connection, show only the centered Google login
  surface. When an active session loses authorization, hide the mounted shell
  behind the same login surface until reconnection.
