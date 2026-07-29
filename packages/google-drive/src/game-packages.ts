import { DRIVE_PACKAGE_MIME_TYPE } from './drive-package-mime-type.js';
import { DRIVE_APP_KIND_KEY } from './drive-app-kind-key.js';
import { DRIVE_PACKAGE_KIND } from './drive-package-kind.js';
import { DRIVE_FOLDER_KIND } from './drive-folder-kind.js';
import { type DriveGamePackageFile } from './drive-game-package-file.js';
import { type DriveGamePackage } from './drive-game-package.js';
import { type DriveGamePackageWrite } from './drive-game-package-write.js';
import { type DrivePackageStorage } from './drive-package-storage.js';
import { isDriveGamePackageName } from './is-drive-game-package-name.js';
import { createGamePackageFilename } from './create-game-package-filename.js';
import { parseDriveGamePackageWrite } from './parse-drive-game-package-write.js';
import { parseDriveGamePackageFile } from './parse-drive-game-package-file.js';
import { toDrivePackageReference } from './to-drive-package-reference.js';
import { parseDrivePackageReference } from './parse-drive-package-reference.js';

const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

export {
  DRIVE_FOLDER_MIME_TYPE,
  DRIVE_PACKAGE_MIME_TYPE,
  DRIVE_APP_KIND_KEY,
  DRIVE_PACKAGE_KIND,
  DRIVE_FOLDER_KIND,
  type DriveGamePackageFile,
  type DriveGamePackage,
  type DriveGamePackageWrite,
  type DrivePackageStorage,
  isDriveGamePackageName,
  createGamePackageFilename,
  parseDriveGamePackageWrite,
  parseDriveGamePackageFile,
  toDrivePackageReference,
  parseDrivePackageReference,
};
