import {
  faBrain,
  faDatabase,
  faHouse,
  faObjectGroup,
  faLayerGroup,
  faPen,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import type { LocalizationCopy } from '../localization';
import { type ShellItem } from './shell-item';
import { type ShellViewName } from './shell-view-name';

function getShellContent(copy: LocalizationCopy) {
  const shell = copy.shell;
  const homeItem: ShellItem = {
    id: 'home',
    icon: faHouse,
    ...shell.home,
  };
  const items: readonly ShellItem[] = [
    {
      id: 'questionDatabase',
      icon: faDatabase,
      ...shell.questionDatabase,
    },
    {
      id: 'visualEditor',
      icon: faObjectGroup,
      ...shell.visualEditor,
    },
    {
      id: 'artificialIntelligence',
      icon: faBrain,
      ...shell.artificialIntelligence,
    },
    {
      id: 'packageRules',
      icon: faLayerGroup,
      ...shell.packageRules,
    },
    { id: 'editor', icon: faPen, ...shell.editor },
    { id: 'host', icon: faPlay, ...shell.host },
  ];

  return { ...shell, homeItem, items };
}

export { type ShellViewName, type ShellItem, getShellContent };
