import type { DrivePackageStorage } from '@schdk/google-drive';
import type { GameOptions } from '@schdk/common';

export interface AppProps {
  options?: GameOptions;
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  sessionScope?: string;
  onDriveFailure?(): void;
  onExit?(): void;
}
