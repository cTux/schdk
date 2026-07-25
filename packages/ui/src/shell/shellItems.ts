import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHouse,
  faObjectGroup,
  faPen,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';

export type ShellViewName =
  | 'home'
  | 'host'
  | 'editor'
  | 'visualEditor'
  | 'options';

export type ShellLocale = 'uk' | 'en';

export interface ShellItem {
  id: ShellViewName;
  icon: IconDefinition;
  label: string;
  description: string;
}

const SHELL_COPY = {
  uk: {
    brand: 'Що? Де? Коли?',
    toolsLabel: 'Інструменти',
    groupLabel: 'ЩДК',
    settingsLabel: 'Налаштування',
    languageLabel: 'Мова',
    homeTitle: 'Усе для гри в одному місці',
    homeDescription:
      'Створіть пакет запитань у редакторі, а потім відкрийте його в розділі «Провести гру».',
    home: {
      label: 'Домашня',
      description: 'Огляд інструментів для підготовки та проведення гри.',
    },
    host: {
      label: 'Провести гру',
      description: 'Запускайте готовий пакет і проводьте гру для команд.',
    },
    editor: {
      label: 'Редагувати пакети питань',
      description: 'Створюйте та редагуйте пакети запитань у форматі .schdk.',
    },
    visualEditor: {
      label: 'Візуальний редактор',
      description: 'Створюйте власний макет екрана проведення гри.',
    },
  },
  en: {
    brand: 'What? Where? When?',
    toolsLabel: 'Tools',
    groupLabel: 'WWW',
    settingsLabel: 'Settings',
    languageLabel: 'Language',
    homeTitle: 'Everything for the game in one place',
    homeDescription:
      'Create a question package in the editor, then open it under “Host a game”.',
    home: {
      label: 'Home',
      description: 'Tools for preparing and hosting a game.',
    },
    host: {
      label: 'Host a game',
      description: 'Open a ready package and host a game for teams.',
    },
    editor: {
      label: 'Edit question packages',
      description: 'Create and edit question packages in the .schdk format.',
    },
    visualEditor: {
      label: 'Visual editor',
      description: 'Create a custom layout for the game screen.',
    },
  },
} as const;

export function getShellContent(locale: ShellLocale) {
  const copy = SHELL_COPY[locale];
  const homeItem: ShellItem = {
    id: 'home',
    icon: faHouse,
    ...copy.home,
  };
  const items: readonly ShellItem[] = [
    { id: 'host', icon: faPlay, ...copy.host },
    { id: 'editor', icon: faPen, ...copy.editor },
    {
      id: 'visualEditor',
      icon: faObjectGroup,
      ...copy.visualEditor,
    },
  ];

  return { ...copy, homeItem, items };
}
