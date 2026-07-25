import {
  faArrowRight,
  faDownload,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { RecentPackageItem } from '../types';

export interface RecentPackageButtonProps {
  disabled?: boolean;
  opening?: boolean;
  recent: RecentPackageItem;
  onDownload?(): void;
  onOpen(): void;
}

export function RecentPackageButton({
  disabled = false,
  opening = false,
  recent,
  onDownload,
  onOpen,
}: RecentPackageButtonProps) {
  const { copy } = useLocalization();
  const hasTitle = recent.title !== undefined;
  const title = hasTitle
    ? recent.title?.trim() || copy.shared.untitled
    : recent.name;

  return (
    <div className="recent-package-item" aria-busy={opening}>
      <Button
        type="button"
        className={classNames('recent-package-open', {
          'is-opening': opening,
        })}
        disabled={disabled}
        onClick={onOpen}
        title={hasTitle ? `${title} — ${recent.name}` : recent.name}
      >
        <span className="recent-package-label">
          <span className="recent-package-title">
            <strong>{title}</strong>
            {recent.ready && (
              <span className="recent-package-ready">{copy.shared.ready}</span>
            )}
          </span>
          {hasTitle && <small>{recent.name}</small>}
        </span>
        <span className="recent-package-arrow" aria-hidden="true">
          <FontAwesomeIcon
            className={opening ? 'recent-package-spinner' : undefined}
            icon={opening ? faSpinner : faArrowRight}
          />
        </span>
      </Button>
      {onDownload && (
        <Button
          type="button"
          className="recent-package-download"
          disabled={disabled}
          aria-label={copy.shared.downloadPackage}
          title={copy.shared.downloadPackage}
          onClick={onDownload}
        >
          <FontAwesomeIcon icon={faDownload} />
        </Button>
      )}
    </div>
  );
}
