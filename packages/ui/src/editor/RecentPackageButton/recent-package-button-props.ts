import type { RecentPackageItem } from '../types';

export interface RecentPackageButtonProps {
  disabled?: boolean;
  opening?: boolean;
  recent: RecentPackageItem;
  onDelete?(): void;
  onDownload?(): void;
  onOpen(): void;
}
