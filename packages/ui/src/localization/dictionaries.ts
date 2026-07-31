const dictionariesCopy = {
  uk: {
    title: 'Словники технічних термінів',
    description:
      'Значення, які використовуються під час налаштування генерації питань.',
    name: 'Назва',
    itemDescription: 'Опис',
    promptPart: 'Частина тексту для промпту',
    distribution: 'Розподіл за значеннями',
    add: 'Додати значення',
    loading: 'Завантаження словників із Google Диска…',
    failed: 'Не вдалося завантажити всі словники з Google Диска.',
    save: 'Зберегти',
    saveFailed: 'Не вдалося зберегти словник.',
  },
  en: {
    title: 'Technical term dictionaries',
    description: 'Values used to configure question generation.',
    name: 'Name',
    itemDescription: 'Description',
    promptPart: 'Prompt text fragment',
    distribution: 'Distribution by values',
    add: 'Add value',
    loading: 'Loading dictionaries from Google Drive…',
    failed: 'Could not load every dictionary from Google Drive.',
    save: 'Save',
    saveFailed: 'Could not save the dictionary.',
  },
};

export { dictionariesCopy };
