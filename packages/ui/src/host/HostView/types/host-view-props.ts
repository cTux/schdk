import type { RecentPackageItem } from '../../../game-packages';
import { type LocalizationCopy } from '../../../localization';
import type { HostGameView } from '../../types';
import type { CustomGameElement, GameLayout } from '../../../options/types';
import { type HostPackageDetails } from './host-package-details';

export interface HostViewProps {
  copy?: LocalizationCopy;
  message: string;
  onExit?(): void;
  presentation: {
    backgroundImage: string | null;
    backgroundOpacity: number;
    backgroundGradientFrom: string | null;
    backgroundGradientTo: string;
    backgroundGradientDirection: number;
    customElements?: CustomGameElement[];
    layout: GameLayout | null;
  };
  packages: {
    openingRecentPackageId?: string | null;
    packageDetails: HostPackageDetails | null;
    recentPackages: RecentPackageItem[];
    recentPackagesLoading?: boolean;
    onBack(): void;
    onDelete?(recent: RecentPackageItem): void;
    onDownload?(recent: RecentPackageItem): void;
    onOpen(file: File): void;
    onOpenRecent(recent: RecentPackageItem): void;
    onStart(): void;
  };
  session: {
    finished: boolean;
    game: HostGameView | null;
    onBack(): void;
    onNext(): void;
    onReturn(): void;
  };
}
