import type { DrivePackageStorage } from '@schdk/google-drive';
import type { CustomGameElement, GameLayout } from '@schdk/ui/options';

export interface AppProps {
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  customElements?: CustomGameElement[];
  layout?: GameLayout | null;
  soundVolume?: number;
  drive?: DrivePackageStorage;
  driveConnected?: boolean;
  driveReady?: boolean;
  onDriveFailure?(): void;
}
