import { type EditorToastAction } from './editor-toast-action';

const editorToastCopy = {
  uk: {
    copied: 'Питання скопійовано',
    created: 'Пакет створено',
    deleted: 'Пакет видалено',
    downloaded: 'Пакет завантажено',
    imported: 'Пакет імпортовано',
    opened: 'Пакет відкрито',
    pasted: 'Питання вставлено',
    saved: 'Пакет збережено',
    notifications: 'Сповіщення редактора',
  },
  en: {
    copied: 'Question copied',
    created: 'Package created',
    deleted: 'Package deleted',
    downloaded: 'Package downloaded',
    imported: 'Package imported',
    opened: 'Package opened',
    pasted: 'Question pasted',
    saved: 'Package saved',
    notifications: 'Editor notifications',
  },
};

export { editorToastCopy, type EditorToastAction };
