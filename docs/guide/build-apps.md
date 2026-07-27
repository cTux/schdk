# Збирання готових застосунків

Зібрати всі пакети робочого простору:

```powershell
pnpm build
```

Turborepo збирає пакети в порядку залежностей, кешує локальні результати й
залишає їх у каталозі `dist` відповідного пакета. Пакування Electron завжди
виконується окремо: файли з `dist/release`, зокрема `.exe`, до кешу не потрапляють.

Звичайне локальне пакування використовує розпакований каталог electron-builder.
Виконуваний файл Windows розташований тут:

```text
packages/all-desktop-app/dist/release/win-unpacked/ЩДК.exe
```

Для збирання окремого пакета скористайтеся фільтром робочого простору pnpm:

```powershell
pnpm --filter @schdk/editor-web-app build
pnpm turbo package --filter @schdk/all-desktop-app
```

Під час прямого збирання десктопного пакета спершу потрібно зібрати його
вебзалежність. Коренева команда `pnpm build` і всі десктопні `dev`-скрипти вже
враховують порядок залежностей.

Інсталятори й пакети потрібно створювати на відповідній операційній системі:

```powershell
pnpm turbo build --filter=@schdk/all-desktop-app
pnpm --filter @schdk/all-desktop-app package:win
pnpm --filter @schdk/all-desktop-app package:mac
pnpm --filter @schdk/all-desktop-app package:linux
```

`package:win` створює x64-інсталятор і портативний `.exe`; `package:mac` —
окремі x64 та arm64 ZIP із `.app` і `.pkg`; `package:linux` — x64 `.deb`.
Workflow `Desktop builds` запускає ці команди вручну на нативних GitHub
runner-ах і зберігає результати як явно непідписані артефакти.

Версійний інсталятор і портативний `.exe` створює GitHub workflow `Release`.
Порядок випуску описано в розділі [«Релізи та вебверсія»](releases.md).
