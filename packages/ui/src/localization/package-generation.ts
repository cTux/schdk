export const packageGenerationCopy = {
  uk: {
    open: 'Згенерувати пакет',
    title: 'Генерація пакету питань',
    description:
      'Оберіть питання для створення та правила, за якими треба згенерувати пакет.',
    scope: 'Які питання генерувати',
    missing: 'Тільки відсутні питання',
    all: 'Увесь пакет',
    rules: 'Правила створення пакету',
    noRules:
      'Немає активних правил створення пакету. Додайте або увімкніть правило.',
    progress: (current: number, total: number) =>
      `Генерується питання ${current} із ${total}…`,
    generate: 'Згенерувати',
    failed:
      'Не вдалося згенерувати пакет. Збережено питання, створені до помилки.',
    nothingMissing: 'Усі питання пакету вже заповнені.',
  },
  en: {
    open: 'Generate package',
    title: 'Generate question package',
    description:
      'Choose which questions to create and the rules for generating the package.',
    scope: 'Questions to generate',
    missing: 'Missing questions only',
    all: 'Entire package',
    rules: 'Package-generation rules',
    noRules: 'There are no active package-generation rules. Add or enable one.',
    progress: (current: number, total: number) =>
      `Generating question ${current} of ${total}…`,
    generate: 'Generate',
    failed:
      'Could not generate the package. Questions created before the error were kept.',
    nothingMissing: 'Every package question is already complete.',
  },
};
