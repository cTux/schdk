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
import type { RecentGamePackageButtonProps } from './types';

function RecentGamePackageButton(props: RecentGamePackageButtonProps) {
  const { copy } = useLocalization();
  const title =
    props.recent.title !== undefined
      ? props.recent.title.trim() || copy.shared.untitled
      : props.recent.name.replace(/\.schdk$/i, '');
  return (
    <div className="recent-package-item" aria-busy={props.opening}>
      <Button
        className={classNames('recent-package-open', {
          'is-opening': props.opening,
        })}
        disabled={props.disabled}
        title={title}
        type="button"
        onClick={props.onOpen}
      >
        <span className="recent-package-label">
          <span className="recent-package-title">
            <strong>{title}</strong>
            <span
              className={
                props.recent.ready
                  ? 'recent-package-ready'
                  : props.recent.hasRemarks
                    ? 'recent-package-remarks'
                    : 'recent-package-errors'
              }
            >
              {props.recent.ready
                ? copy.shared.ready
                : props.recent.hasRemarks
                  ? copy.questionDatabase.hasRemarks
                  : copy.questionDatabase.hasErrors}
            </span>
          </span>
        </span>
        <FontAwesomeIcon
          className={classNames('recent-package-arrow', {
            'recent-package-spinner': props.opening,
          })}
          icon={props.opening ? faSpinner : faArrowRight}
        />
      </Button>
      {props.onDownload && (
        <Button
          aria-label={copy.shared.downloadPackage}
          className="recent-package-download"
          disabled={props.disabled}
          title={copy.shared.downloadPackage}
          type="button"
          onClick={props.onDownload}
        >
          <FontAwesomeIcon icon={faDownload} />
        </Button>
      )}
      {props.onDelete && (
        <Button
          aria-label={copy.shared.deletePackage}
          className="recent-package-delete"
          disabled={props.disabled}
          title={copy.shared.deletePackage}
          type="button"
          onClick={props.onDelete}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </Button>
      )}
    </div>
  );
}

export { RecentGamePackageButton };
import './styles.scss';
