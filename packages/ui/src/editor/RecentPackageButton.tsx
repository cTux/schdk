import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../atoms/Button';
import type { RecentPackageItem } from './types';

interface RecentPackageButtonProps {
  recent: RecentPackageItem;
  onOpen(): void;
}

export function RecentPackageButton({
  recent,
  onOpen,
}: RecentPackageButtonProps) {
  const hasTitle = recent.title !== undefined;
  const title = hasTitle ? recent.title?.trim() || 'Без назви' : recent.name;

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
            <span className="recent-package-ready">Готовий</span>
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
