# Релізи та вебверсія

Вебверсія автоматично збирається після кожного оновлення гілки `main` і
публікується за адресою <https://ctux.github.io/schdk/>.

Щоб створити повний реліз, попросіть Codex: `make a release`. Репозиторна
навичка `$schdk-release` автоматично:

1. визначить наступну patch-версію, якщо версію не вказано;
2. підготує український розділ `## X.Y.Z` у `CHANGELOG.md`;
3. створить pull request, дочекається обов’язкових перевірок і об’єднає його;
4. запустить workflow `Release` для `main`;
5. дочекається збірок на Windows, macOS і Linux;
6. перевірить тег, нотатки, підписи й усі файли GitHub Release.

До одного релізу `vX.Y.Z` додаються:

- `schdk-X.Y.Z-windows-x64-installer.exe`;
- `schdk-X.Y.Z-windows-x64-portable.exe`;
- `schdk-X.Y.Z-macos-x64.zip`;
- `schdk-X.Y.Z-macos-x64.pkg`;
- `schdk-X.Y.Z-macos-arm64.zip`;
- `schdk-X.Y.Z-macos-arm64.pkg`;
- `schdk-X.Y.Z-linux-x64.deb`.

Для автоматичного випуску мають бути налаштовані GitHub Actions secrets:

- `GOOGLE_DESKTOP_CREDENTIALS_JSON`;
- `WINDOWS_CERTIFICATE_BASE64`;
- `WINDOWS_CERTIFICATE_PASSWORD`;
- `MACOS_APPLICATION_CERTIFICATE_BASE64`;
- `MACOS_APPLICATION_CERTIFICATE_PASSWORD`;
- `MACOS_INSTALLER_CERTIFICATE_BASE64`;
- `MACOS_INSTALLER_CERTIFICATE_PASSWORD`;
- `APPLE_API_KEY`;
- `APPLE_API_KEY_ID`;
- `APPLE_API_ISSUER`.

Workflow не створює частковий реліз. Він зупиняється до публікації, якщо
changelog або версія невалідні, перевірки не пройшли, бракує секрету чи
підпису, macOS-застосунок не нотаризовано або відсутній будь-який із семи
файлів.
