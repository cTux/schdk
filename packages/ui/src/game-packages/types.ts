interface RecentPackageItem {
  id: string;
  name: string;
  title?: string;
  ready?: boolean;
  hasRemarks?: boolean;
}

interface GamePackageActionsProps {
  compact?: boolean;
  disabled?: boolean;
  hidden: boolean;
  onCreate?(): void;
  onOpen(file: File): void;
}

interface RecentGamePackagesProps {
  hidden: boolean;
  loading?: boolean;
  openingPackageId?: string | null;
  packages: RecentPackageItem[];
  onDelete?(recent: RecentPackageItem): void;
  onDownload?(recent: RecentPackageItem): void;
  onOpen(recent: RecentPackageItem): void;
}

export type {
  GamePackageActionsProps,
  RecentGamePackagesProps,
  RecentPackageItem,
};
