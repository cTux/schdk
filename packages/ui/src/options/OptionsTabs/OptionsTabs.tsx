import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { LOCALIZATION_COPY } from '../../localization';
import { TABS } from './constants';
import type { OptionsTabsProps } from './types';

export function OptionsTabs({
  copy = LOCALIZATION_COPY.uk,
  selected,
  onSelect,
}: OptionsTabsProps) {
  return (
    <div
      className={classNames('options-tabs', 'options-secondary-tabs')}
      role="tablist"
      aria-label={copy.settings.schdkTabsLabel}
    >
      {TABS.map((tab) => (
        <Button
          key={tab}
          type="button"
          role="tab"
          id={`options-tab-${tab}`}
          aria-controls={`options-panel-${tab}`}
          aria-selected={selected === tab}
          className={selected === tab ? 'active' : ''}
          onClick={() => onSelect(tab)}
        >
          {copy.settings[`${tab}Tab`]}
        </Button>
      ))}
    </div>
  );
}
