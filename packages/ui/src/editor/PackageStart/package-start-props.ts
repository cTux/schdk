import type { RecentPackageItem } from '../types';

export interface PackageStartProps {
  hidden: boolean;
  openingRecentPackageId?: string | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  onCreatePackage?(): void;
  onDeleteRecentPackage?(recent: RecentPackageItem): void;
  onDownloadRecentPackage?(recent: RecentPackageItem): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
}
