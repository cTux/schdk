import type { DrivePackageStorage } from '@schdk/google-drive';
import type { EditorTextOptions } from '@schdk/ui/options';

export interface AppProps {
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  manageDocumentTitle?: boolean;
  textOptions?: EditorTextOptions;
  onDriveFailure?(): void;
}
