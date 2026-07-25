import type { LocalizationCopy } from '../../localization';

export type OptionsTab = 'editor' | 'game';

export interface OptionsTabsProps {
  copy?: LocalizationCopy;
  selected: OptionsTab;
  onSelect(tab: OptionsTab): void;
}
