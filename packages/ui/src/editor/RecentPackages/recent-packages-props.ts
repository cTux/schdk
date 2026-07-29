import type { RecentPackageItem } from '../types';

export interface RecentPackagesProps {
  hidden: boolean;
  loading?: boolean;
  openingPackageId?: string | null;
  packages: RecentPackageItem[];
  onDelete?(recent: RecentPackageItem): void;
  onDownload?(recent: RecentPackageItem): void;
  onOpen(recent: RecentPackageItem): void;
}
