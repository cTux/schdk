import './styles.scss';
import { RecentGamePackageButton } from '../RecentGamePackageButton/RecentGamePackageButton';
import type { RecentGamePackagesProps } from '../types';

function RecentGamePackages({
  hidden,
  loading = false,
  openingPackageId = null,
  packages,
  onDelete,
  onDownload,
  onOpen,
}: RecentGamePackagesProps) {
  if (!loading && packages.length === 0) return null;
  return (
    <section className="recent-packages" hidden={hidden} aria-busy={loading}>
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
              <RecentGamePackageButton
                disabled={openingPackageId !== null}
                key={recent.id}
                opening={openingPackageId === recent.id}
                recent={recent}
                onDelete={onDelete ? () => onDelete(recent) : undefined}
                onDownload={onDownload ? () => onDownload(recent) : undefined}
                onOpen={() => onOpen(recent)}
              />
            ))}
      </div>
    </section>
  );
}

export { RecentGamePackages };
