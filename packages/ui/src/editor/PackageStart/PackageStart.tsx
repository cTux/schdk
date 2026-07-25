import { PackageDropZone } from '../PackageDropZone';
import { RecentPackages } from '../RecentPackages';
import type { RecentPackageItem } from '../types';

export interface PackageStartProps {
  hidden: boolean;
  openingRecentPackageId?: string | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  onCreatePackage?(): void;
  onDownloadRecentPackage?(recent: RecentPackageItem): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
}

export function PackageStart({
  hidden,
  openingRecentPackageId = null,
  recentPackages,
  recentPackagesLoading = false,
  onCreatePackage,
  onDownloadRecentPackage,
  onOpenPackage,
  onOpenRecentPackage,
}: PackageStartProps) {
  const busy = openingRecentPackageId !== null;

  return (
    <>
      <PackageDropZone
        disabled={busy}
        hidden={hidden}
        onCreate={onCreatePackage}
        onOpen={onOpenPackage}
      />
      <RecentPackages
        hidden={hidden}
        loading={recentPackagesLoading}
        openingPackageId={openingRecentPackageId}
        packages={recentPackages}
        onDownload={onDownloadRecentPackage}
        onOpen={onOpenRecentPackage}
      />
    </>
  );
}
