import type { DrivePackageStorage } from '@schdk/google-drive';
import type { CustomGameElement, GameLayout } from '@schdk/common';

export interface AppProps {
  autoFullscreen?: boolean;
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  backgroundGradientFrom?: string | null;
  backgroundGradientTo?: string;
  backgroundGradientDirection?: number;
  customElements?: CustomGameElement[];
  layout?: GameLayout | null;
  musicVolume?: number;
  soundVolume?: number;
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  sessionScope?: string;
  onDriveFailure?(): void;
  onExit?(): void;
}
