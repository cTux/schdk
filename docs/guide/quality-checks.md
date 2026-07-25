# Перевірка якості

Перед комітом запустіть повний набір перевірок:

```powershell
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Щоб застосувати форматування, а не лише перевірити його:

```powershell
pnpm fmt
```

Де це доречно, завдання виконуються в усьому робочому просторі через
Turborepo.
