import './styles.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { AppIcon } from '../../atoms/AppIcon';
import { Button } from '../../atoms/Button';
import { HOME_ITEM, SCHDK_ITEMS, type ShellViewName } from '../shellItems';

export interface ShellNavigationProps {
  view: ShellViewName;
  onSelect(view: ShellViewName): void;
}

export function ShellNavigation({ view, onSelect }: ShellNavigationProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <AppIcon />
        <div>
          <strong>Що? Де? Коли?</strong>
          <span>Інструменти</span>
        </div>
      </div>

      <nav aria-label="Інструменти">
        <Button
          variant="ghost"
          className={HOME_ITEM.id === view ? 'active' : ''}
          type="button"
          onClick={() => onSelect(HOME_ITEM.id)}
          aria-current={HOME_ITEM.id === view ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            <FontAwesomeIcon icon={HOME_ITEM.icon} />
          </span>
          {HOME_ITEM.label}
        </Button>

        <div
          className="sidebar-group"
          role="group"
          aria-labelledby="sidebar-schdk-group"
        >
          <span id="sidebar-schdk-group" className="sidebar-group-label">
            ЩДК
          </span>
          {SCHDK_ITEMS.map((item) => (
            <Button
              variant="ghost"
              className={item.id === view ? 'active' : ''}
              type="button"
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={item.id === view ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      <nav className="sidebar-options" aria-label="Налаштування">
        <Button
          variant="ghost"
          className={view === 'options' ? 'active' : ''}
          type="button"
          onClick={() => onSelect('options')}
          aria-current={view === 'options' ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faGear} />
          </span>
          Налаштування
        </Button>
      </nav>
    </aside>
  );
}
