import type { DrivePackageStorage } from '@schdk/google-drive';
import type { CustomGameElement, GameLayout } from '@schdk/ui/options';

export interface AppProps {
  autoFullscreen?: boolean;
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  customElements?: CustomGameElement[];
  layout?: GameLayout | null;
  soundVolume?: number;
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  onDriveFailure?(): void;
}
