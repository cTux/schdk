export const questionDatabaseCopy = {
  uk: {
    navigation: {
      label: 'База питань',
      description: 'Шукайте питання у власних пакетах.',
    },
    title: 'База питань',
    description:
      'Це база питань поточного користувача з його пакетів SCHDK на Google Диску. Вона не є загальною базою інших користувачів.',
    search: 'Пошук',
    searchPlaceholder: 'Введіть текст питання або відповіді',
    searchField: 'Шукати в',
    fields: {
      all: 'Питаннях і відповідях',
      question: 'Питаннях',
      answer: 'Відповідях',
    },
    package: 'Пакет',
    number: '№',
    question: 'Питання',
    answer: 'Відповідь',
    loading: (current: number, total: number) =>
      `Індексація пакетів: ${current} із ${total}`,
    failed: 'Частину пакетів не вдалося додати до бази.',
    empty: 'Питань за заданими умовами не знайдено.',
    loadMore: 'Показати наступну порцію',
    showing: (shown: number, total: number) => `Показано ${shown} із ${total}`,
    sortQuestion: 'Сортувати за питанням',
    sortAnswer: 'Сортувати за відповіддю',
  },
  en: {
    navigation: {
      label: 'Question database',
      description: 'Search questions in your own packages.',
    },
    title: 'Question database',
    description:
      "This is the current user's question database built from their SCHDK packages in Google Drive. It is not a shared database of other users.",
    search: 'Search',
    searchPlaceholder: 'Enter question or answer text',
    searchField: 'Search in',
    fields: {
      all: 'Questions and answers',
      question: 'Questions',
      answer: 'Answers',
    },
    package: 'Package',
    number: 'No.',
    question: 'Question',
    answer: 'Answer',
    loading: (current: number, total: number) =>
      `Indexing packages: ${current} of ${total}`,
    failed: 'Some packages could not be added to the database.',
    empty: 'No questions match the current filters.',
    loadMore: 'Show next batch',
    showing: (shown: number, total: number) => `Showing ${shown} of ${total}`,
    sortQuestion: 'Sort by question',
    sortAnswer: 'Sort by answer',
  },
};
