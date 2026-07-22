import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHouse, faPen, faPlay } from '@fortawesome/free-solid-svg-icons';

export type ShellViewName = 'home' | 'host' | 'editor' | 'options';

export interface ShellItem {
  id: ShellViewName;
  icon: IconDefinition;
  label: string;
  description: string;
}

export const SHELL_ITEMS: readonly ShellItem[] = [
  {
    id: 'home',
    icon: faHouse,
    label: 'Домашня',
    description: 'Огляд інструментів для підготовки та проведення гри.',
  },
  {
    id: 'host',
    icon: faPlay,
    label: 'ЩДК Гра',
    description: 'Запускайте готовий пакет і проводьте гру для команд.',
  },
  {
    id: 'editor',
    icon: faPen,
    label: 'ЩДК Редактор',
    description: 'Створюйте та редагуйте пакети запитань у форматі .schdk.',
  },
];
