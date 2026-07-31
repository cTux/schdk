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
packages/desktop/dist/release/win-unpacked/ЩДК.exe
```

Для збирання окремого пакета скористайтеся фільтром робочого простору pnpm:

```powershell
pnpm turbo build --filter=@schdk/web
pnpm turbo package --filter @schdk/desktop
```

Під час прямого збирання десктопного пакета спершу потрібно зібрати його
вебзалежність. Коренева команда `pnpm build` і всі десктопні `dev`-скрипти вже
враховують порядок залежностей.

Інсталятори й пакети потрібно створювати на відповідній операційній системі:

```powershell
pnpm turbo build --filter=@schdk/desktop
pnpm --filter @schdk/desktop package:win
pnpm --filter @schdk/desktop package:linux
```

`package:win` створює x64-інсталятор і портативний `.exe`; `package:linux` —
x64 `.deb`.
Workflow `Desktop builds` запускає ці команди вручну на нативних GitHub
runner-ах і зберігає результати як явно непідписані артефакти.

Версійний інсталятор і портативний `.exe` створює GitHub workflow `Release`.
Порядок випуску описано в розділі [«Релізи та вебверсія»](releases.md).
