export const packageGenerationCopy = {
  uk: {
    open: 'Згенерувати пакет',
    title: 'Генерація пакету питань',
    description:
      'Оберіть питання для створення та правила, за якими треба згенерувати пакет.',
    scope: 'Які питання генерувати',
    missing: 'Тільки відсутні питання',
    commented: 'Питання з зауваженнями',
    all: 'Увесь пакет',
    rules: 'Правила створення пакету',
    ruleSet: 'Набір правил для випадкового вибору',
    ruleSets: {
      all: 'Усі правила',
      favorites: 'Улюблені правила',
      nonFavorites: 'Неулюблені правила',
    },
    noTemplates: 'У вибраному наборі немає активних правил.',
    noRules:
      'Немає активних правил створення пакету. Додайте або увімкніть правило.',
    progress: (current: number, total: number) =>
      `Генерується питання ${current} із ${total}…`,
    cancel: 'Відмінити',
    generate: 'Згенерувати',
    failed:
      'Не вдалося згенерувати пакет. Збережено питання, створені до помилки.',
    nothingMissing: 'Усі питання пакету вже заповнені.',
    checkDatabase:
      'Перевіряти схожість із моєю базою питань і перегенеровувати за потреби',
    nothingCommented: 'У пакеті немає питань із зауваженнями.',
  },
  en: {
    open: 'Generate package',
    title: 'Generate question package',
    description:
      'Choose which questions to create and the rules for generating the package.',
    scope: 'Questions to generate',
    missing: 'Missing questions only',
    commented: 'Questions with remarks',
    all: 'Entire package',
    rules: 'Package-generation rules',
    ruleSet: 'Rule set for random selection',
    ruleSets: {
      all: 'All rules',
      favorites: 'Favorite rules',
      nonFavorites: 'Non-favorite rules',
    },
    noTemplates: 'The selected set has no active rules.',
    noRules: 'There are no active package-generation rules. Add or enable one.',
    progress: (current: number, total: number) =>
      `Generating question ${current} of ${total}…`,
    cancel: 'Cancel',
    generate: 'Generate',
    failed:
      'Could not generate the package. Questions created before the error were kept.',
    nothingMissing: 'Every package question is already complete.',
    checkDatabase:
      'Check similarity against my question database and regenerate if needed',
    nothingCommented: 'The package has no questions with remarks.',
  },
};
