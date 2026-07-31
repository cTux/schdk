import { type DriveGamePackageWrite } from './drive-game-package-write.js';
import { type DriveGamePackageFile } from './drive-game-package-file.js';
import { type DriveGamePackage } from './drive-game-package.js';

export interface DrivePackageStorage {
  createGamePackage(
    value: DriveGamePackageWrite,
  ): Promise<DriveGamePackageFile>;
  updateGamePackage(
    fileId: string,
    value: DriveGamePackageWrite,
  ): Promise<DriveGamePackageFile>;
  deleteGamePackage(fileId: string): Promise<void>;
  listGamePackages(): Promise<DriveGamePackageFile[]>;
  loadGamePackage(fileId: string): Promise<DriveGamePackage>;
}
