import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { type ShellViewName } from './shell-view-name';

export interface ShellItem {
  id: ShellViewName;
  icon: IconDefinition;
  label: string;
  description: string;
}
