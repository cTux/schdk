import './styles.scss';

import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { TABS } from './constants';
import type { OptionsTabsProps } from './types';

export function OptionsTabs({ selected, onSelect }: OptionsTabsProps) {
  return (
    <div
      className={classNames('options-tabs', 'options-secondary-tabs')}
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
