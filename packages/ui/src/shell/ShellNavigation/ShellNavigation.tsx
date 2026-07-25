import './styles.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { AppIcon } from '../../atoms/AppIcon';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import { getShellContent, type ShellViewName } from '../shellItems';

export interface ShellNavigationProps {
  view: ShellViewName;
  onSelect(view: ShellViewName): void;
}

export function ShellNavigation({ view, onSelect }: ShellNavigationProps) {
  const { copy } = useLocalization();
  const content = getShellContent(copy);

  return (
    <aside className="sidebar">
      <div className="brand">
        <AppIcon />
        <div>
          <strong>{content.brand}</strong>
          <span>{content.toolsLabel}</span>
        </div>
      </div>

      <nav aria-label={content.toolsLabel}>
        <Button
          variant="ghost"
          className={content.homeItem.id === view ? 'active' : ''}
          type="button"
          onClick={() => onSelect(content.homeItem.id)}
          aria-current={content.homeItem.id === view ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            <FontAwesomeIcon icon={content.homeItem.icon} />
          </span>
          {content.homeItem.label}
        </Button>

        <div
          className="sidebar-group"
          role="group"
          aria-labelledby="sidebar-schdk-group"
        >
          <span id="sidebar-schdk-group" className="sidebar-group-label">
            {content.groupLabel}
          </span>
          {content.items.map((item) => (
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

      <nav className="sidebar-options" aria-label={content.settingsLabel}>
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
          {content.settingsLabel}
        </Button>
      </nav>
    </aside>
  );
}
