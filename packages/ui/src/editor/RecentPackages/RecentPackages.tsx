import { useLocalization } from '../../localization';
import { RecentPackageButton } from '../RecentPackageButton';
import type { RecentPackageItem } from '../types';

export interface RecentPackagesProps {
  hidden: boolean;
  packages: RecentPackageItem[];
  onDownload?(recent: RecentPackageItem): void;
  onOpen(recent: RecentPackageItem): void;
}

export function RecentPackages({
  hidden,
  packages,
  onDownload,
  onOpen,
}: RecentPackagesProps) {
  const { copy } = useLocalization();
  if (packages.length === 0) return null;

  return (
    <section className="recent-packages" hidden={hidden}>
      <div className="recent-packages-heading">
        <h2>{copy.shared.recentPackages}</h2>
      </div>
      <div className="recent-package-list">
        {packages.map((recent) => (
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
