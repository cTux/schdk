import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHouse,
  faObjectGroup,
  faPen,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import type { LocalizationCopy } from '../localization';

export type ShellViewName =
  | 'home'
  | 'host'
  | 'editor'
  | 'visualEditor'
  | 'options';

export interface ShellItem {
  id: ShellViewName;
  icon: IconDefinition;
  label: string;
  description: string;
}

export function getShellContent(copy: LocalizationCopy) {
  const shell = copy.shell;
  const homeItem: ShellItem = {
    id: 'home',
    icon: faHouse,
    ...shell.home,
  };
  const items: readonly ShellItem[] = [
    { id: 'host', icon: faPlay, ...shell.host },
    { id: 'editor', icon: faPen, ...shell.editor },
    {
      id: 'visualEditor',
      icon: faObjectGroup,
      ...shell.visualEditor,
    },
  ];

  return { ...shell, homeItem, items };
}
