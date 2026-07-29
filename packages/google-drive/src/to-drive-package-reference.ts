import { isDriveFileId } from './settings.js';
import { DRIVE_REFERENCE_PREFIX } from './drive-reference-prefix.js';

export function toDrivePackageReference(fileId: string) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  return `${DRIVE_REFERENCE_PREFIX}${fileId}`;
}
