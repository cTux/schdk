import { useLocalization } from '../../localization';
import { RecentPackageButton } from '../RecentPackageButton';
import type { RecentPackageItem } from '../types';

export interface RecentPackagesProps {
  hidden: boolean;
  loading?: boolean;
  packages: RecentPackageItem[];
  onDownload?(recent: RecentPackageItem): void;
  onOpen(recent: RecentPackageItem): void;
}

export function RecentPackages({
  hidden,
  loading = false,
  packages,
  onDownload,
  onOpen,
}: RecentPackagesProps) {
  const { copy } = useLocalization();
  if (!loading && packages.length === 0) return null;

  return (
    <section className="recent-packages" hidden={hidden} aria-busy={loading}>
      <div className="recent-packages-heading">
        <h2>{copy.shared.recentPackages}</h2>
      </div>
      <div className="recent-package-list">
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <div
                className="recent-package-skeleton"
                aria-hidden="true"
                key={index}
              >
                <span className="recent-package-skeleton-title" />
                <span className="recent-package-skeleton-name" />
              </div>
            ))
          : packages.map((recent) => (
              <RecentPackageButton
                key={recent.id}
                recent={recent}
                onDownload={onDownload ? () => onDownload(recent) : undefined}
                onOpen={() => onOpen(recent)}
              />
            ))}
      </div>
    </section>
  );
}
