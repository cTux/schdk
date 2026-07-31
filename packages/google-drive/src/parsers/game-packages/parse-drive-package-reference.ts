import { isDriveFileId } from '../../services/settings/settings.js';
import { DRIVE_REFERENCE_PREFIX } from '../../constants/game-packages/drive-reference-prefix.js';

export function parseDrivePackageReference(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith(DRIVE_REFERENCE_PREFIX)) {
    return null;
  }
  const fileId = value.slice(DRIVE_REFERENCE_PREFIX.length);
  return isDriveFileId(fileId) ? fileId : null;
}
