import type { OptionsTab } from './types';

export const TABS: readonly { id: OptionsTab; label: string }[] = [
  { id: 'game', label: 'Проведення гри' },
  { id: 'editor', label: 'Редагування питань' },
];
