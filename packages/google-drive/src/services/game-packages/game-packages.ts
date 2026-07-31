import { DRIVE_PACKAGE_MIME_TYPE } from '../../constants/game-packages/drive-package-mime-type.js';
import { DRIVE_APP_KIND_KEY } from '../../constants/game-packages/drive-app-kind-key.js';
import { DRIVE_PACKAGE_KIND } from '../../constants/game-packages/drive-package-kind.js';
import { DRIVE_FOLDER_KIND } from '../../constants/game-packages/drive-folder-kind.js';
import { type DriveGamePackageFile } from '../../types/game-packages/drive-game-package-file.js';
import { type DriveGamePackage } from '../../types/game-packages/drive-game-package.js';
import { type DriveGamePackageWrite } from '../../types/game-packages/drive-game-package-write.js';
import { type DrivePackageStorage } from '../../types/game-packages/drive-package-storage.js';
import { isDriveGamePackageName } from '../../utils/game-packages/is-drive-game-package-name.js';
import { createGamePackageFilename } from '../../factories/game-packages/create-game-package-filename.js';
import { parseDriveGamePackageWrite } from '../../parsers/game-packages/parse-drive-game-package-write.js';
import { parseDriveGamePackageFile } from '../../parsers/game-packages/parse-drive-game-package-file.js';
import { toDrivePackageReference } from '../../utils/game-packages/to-drive-package-reference.js';
import { parseDrivePackageReference } from '../../parsers/game-packages/parse-drive-package-reference.js';

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
