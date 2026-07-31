import { type DriveGamePackageFile } from './drive-game-package-file.js';

export interface DriveGamePackage extends DriveGamePackageFile {
  content: Uint8Array;
}
