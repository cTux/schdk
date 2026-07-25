import './styles.scss';

import { PackageDropZone } from '../PackageDropZone';
import { RecentPackages } from '../RecentPackages';
import type { RecentPackageItem } from '../types';

export interface PackageStartProps {
  hidden: boolean;
  recentPackages: RecentPackageItem[];
  onCreatePackage?(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
}

export function PackageStart({
  hidden,
  recentPackages,
  onCreatePackage,
  onOpenPackage,
  onOpenRecentPackage,
}: PackageStartProps) {
  return (
    <>
      <PackageDropZone
        hidden={hidden}
        onCreate={onCreatePackage}
        onOpen={onOpenPackage}
      />
      <RecentPackages
        hidden={hidden}
        packages={recentPackages}
        onOpen={onOpenRecentPackage}
      />
    </>
  );
}
