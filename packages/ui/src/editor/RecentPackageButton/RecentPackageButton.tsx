import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { RecentPackageItem } from '../types';

export interface RecentPackageButtonProps {
  recent: RecentPackageItem;
  onOpen(): void;
}

export function RecentPackageButton({
  recent,
  onOpen,
}: RecentPackageButtonProps) {
  const { copy } = useLocalization();
  const hasTitle = recent.title !== undefined;
  const title = hasTitle
    ? recent.title?.trim() || copy.shared.untitled
    : recent.name;

  return (
    <Button
      type="button"
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
        <FontAwesomeIcon icon={faArrowRight} />
      </span>
    </Button>
  );
}
