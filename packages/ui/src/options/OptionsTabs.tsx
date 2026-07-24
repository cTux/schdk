import { Button } from '../atoms/Button';

export type OptionsTab = 'editor' | 'game';

const TABS: readonly { id: OptionsTab; label: string }[] = [
  { id: 'game', label: 'Проведення гри' },
  { id: 'editor', label: 'Редагування питань' },
];

interface OptionsTabsProps {
  selected: OptionsTab;
  onSelect(tab: OptionsTab): void;
}

export function OptionsTabs({ selected, onSelect }: OptionsTabsProps) {
  return (
    <div
      className="options-tabs options-secondary-tabs"
      role="tablist"
      aria-label="Налаштування ЩДК"
    >
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          type="button"
          role="tab"
          id={`options-tab-${tab.id}`}
          aria-controls={`options-panel-${tab.id}`}
          aria-selected={selected === tab.id}
          className={selected === tab.id ? 'active' : ''}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
