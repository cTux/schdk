import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHouse, faPen, faPlay } from '@fortawesome/free-solid-svg-icons';

export type ShellViewName = 'home' | 'host' | 'editor' | 'options';

export interface ShellItem {
  id: ShellViewName;
  icon: IconDefinition;
  label: string;
  description: string;
}

export const HOME_ITEM: ShellItem = {
  id: 'home',
  icon: faHouse,
  label: 'Домашня',
  description: 'Огляд інструментів для підготовки та проведення гри.',
};

export const SCHDK_ITEMS: readonly ShellItem[] = [
  {
    id: 'host',
    icon: faPlay,
    label: 'Провести гру',
    description: 'Запускайте готовий пакет і проводьте гру для команд.',
  },
  {
    id: 'editor',
    icon: faPen,
    label: 'Редагувати питання',
    description: 'Створюйте та редагуйте пакети запитань у форматі .schdk.',
  },
];
