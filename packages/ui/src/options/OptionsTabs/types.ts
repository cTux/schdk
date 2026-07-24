export type OptionsTab = 'editor' | 'game';

export interface OptionsTabsProps {
  selected: OptionsTab;
  onSelect(tab: OptionsTab): void;
}
