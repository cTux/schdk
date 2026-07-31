import type { RecentPackageItem } from '../types';

export interface RecentGamePackageButtonProps {
  disabled: boolean;
  opening: boolean;
  recent: RecentPackageItem;
  onDelete?(): void;
  onDownload?(): void;
  onOpen(): void;
}
