import type { RecentPackageItem } from '../../editor/types';
import { type LocalizationCopy } from '../../localization';
import type { HostGameView } from '../types';
import type { CustomGameElement, GameLayout } from '../../options/types';
import { type HostPackageDetails } from './host-package-details';

export interface HostViewProps {
  backgroundImage: string | null;
  backgroundOpacity: number;
  copy?: LocalizationCopy;
  customElements?: CustomGameElement[];
  finished: boolean;
  game: HostGameView | null;
  layout: GameLayout | null;
  message: string;
  openingRecentPackageId?: string | null;
  packageDetails: HostPackageDetails | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  onBack(): void;
  onDeleteRecentPackage?(recent: RecentPackageItem): void;
  onDownloadRecentPackage?(recent: RecentPackageItem): void;
  onGameBack(): void;
  onGameNext(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onReturnToGames(): void;
  onStartGame(): void;
}
