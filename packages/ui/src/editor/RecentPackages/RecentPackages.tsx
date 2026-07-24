import './styles.scss';

import { RecentPackageButton } from '../RecentPackageButton';
import type { RecentPackageItem } from '../types';

export interface RecentPackagesProps {
  hidden: boolean;
  packages: RecentPackageItem[];
  onOpen(recent: RecentPackageItem): void;
}

export function RecentPackages({
  hidden,
  packages,
  onOpen,
}: RecentPackagesProps) {
  if (packages.length === 0) return null;

  return (
    <section className="recent-packages" hidden={hidden}>
      <div className="recent-packages-heading">
        <h2>Недавні пакети</h2>
      </div>
      <div className="recent-package-list">
        {packages.map((recent) => (
          <RecentPackageButton
            key={recent.id}
            recent={recent}
            onOpen={() => onOpen(recent)}
          />
        ))}
      </div>
    </section>
  );
}
