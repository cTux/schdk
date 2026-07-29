import {
  faArrowRight,
  faDownload,
  faSpinner,
  faTrashCan,
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
  onDelete?(): void;
  onDownload?(): void;
  onOpen(): void;
}

export function RecentPackageButton({
  disabled = false,
  opening = false,
  recent,
  onDelete,
  onDownload,
  onOpen,
}: RecentPackageButtonProps) {
  const { copy } = useLocalization();
  const hasTitle = recent.title !== undefined;
  const title = hasTitle
    ? recent.title?.trim() || copy.shared.untitled
    : recent.name.replace(/\.schdk$/i, '');

  return (
    <div className="recent-package-item" aria-busy={opening}>
      <Button
        type="button"
        className={classNames('recent-package-open', {
          'is-opening': opening,
        })}
        disabled={disabled}
        onClick={onOpen}
        title={title}
      >
        <span className="recent-package-label">
          <span className="recent-package-title">
            <strong>{title}</strong>
            {recent.ready ? (
              <span className="recent-package-ready">{copy.shared.ready}</span>
            ) : recent.hasRemarks ? (
              <span className="recent-package-remarks">
                {copy.questionDatabase.hasRemarks}
              </span>
            ) : (
              <span className="recent-package-developing">
                {copy.questionDatabase.developing}
              </span>
            )}
          </span>
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
      {onDelete && (
        <Button
          type="button"
          className="recent-package-delete"
          disabled={disabled}
          aria-label={copy.shared.deletePackage}
          title={copy.shared.deletePackage}
          onClick={onDelete}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </Button>
      )}
    </div>
  );
}
