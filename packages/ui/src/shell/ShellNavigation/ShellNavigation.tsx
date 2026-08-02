import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAnglesLeft,
  faAnglesRight,
  faGear,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { useState } from 'react';
import { AppIcon } from '../../atoms/AppIcon';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { getShellContent } from '../shellItems';
import { type ShellNavigationProps } from './types/shell-navigation-props';
import { type ShellAccount } from './types/shell-account';

function ShellNavigation({ preloading, view, onSelect }: ShellNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { copy } = useLocalization();
  const content = getShellContent(copy);

  return (
    <aside
      className={classNames('sidebar', { collapsed })}
      aria-busy={preloading}
    >
      <div className="brand">
        <AppIcon />
        <div>
          <strong>{content.brand}</strong>
          <span>{content.toolsLabel}</span>
        </div>
        {preloading && (
          <span
            className="sidebar-preloading"
            title={copy.shell.preloading}
            aria-hidden="true"
          >
            <FontAwesomeIcon icon={faSpinner} />
          </span>
        )}
        <IconButton
          className="sidebar-collapse"
          variant="ghost"
          icon={collapsed ? faAnglesRight : faAnglesLeft}
          label={collapsed ? content.expandLabel : content.collapseLabel}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        />
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
          <span
            id="sidebar-schdk-group"
            className="sidebar-group-label"
            aria-busy={preloading}
          >
            <span>{content.groupLabel}</span>
            {preloading && (
              <span
                className="sidebar-preloading"
                role="status"
                aria-label={copy.shell.preloading}
                title={copy.shell.preloading}
              >
                <FontAwesomeIcon icon={faSpinner} aria-hidden="true" />
              </span>
            )}
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

export { type ShellNavigationProps, type ShellAccount, ShellNavigation };
