import type { RecentPackageItem } from '../types';

export interface PackageStartProps {
  hidden: boolean;
  openingRecentPackageId?: string | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  onDeleteRecentPackage?(recent: RecentPackageItem): void;
  onDownloadRecentPackage?(recent: RecentPackageItem): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
}
