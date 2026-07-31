import { isDriveFileId } from '../../services/settings/settings.js';
import { type DriveGamePackageFile } from '../../types/game-packages/drive-game-package-file.js';
import { isDriveGamePackageName } from '../../utils/game-packages/is-drive-game-package-name.js';
import { DRIVE_APP_KIND_KEY } from '../../constants/game-packages/drive-app-kind-key.js';
import { DRIVE_PACKAGE_KIND } from '../../constants/game-packages/drive-package-kind.js';

export function parseDriveGamePackageFile(
  value: unknown,
): DriveGamePackageFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  const hasValidIdentity =
    isDriveFileId(file.id) && isDriveGamePackageName(file.name);
  const hasExpectedKind = properties[DRIVE_APP_KIND_KEY] === DRIVE_PACKAGE_KIND;
  const hasValidModifiedTime =
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime));
  if (!hasValidIdentity || !hasExpectedKind || !hasValidModifiedTime) {
    return null;
  }
  return {
    id: file.id as string,
    name: file.name as string,
    modifiedTime: file.modifiedTime as string,
    ...(typeof file.description === 'string'
      ? { title: file.description }
      : {}),
    ...(properties.ready === 'true'
      ? { ready: true }
      : properties.ready === 'false'
        ? { ready: false }
        : {}),
    ...(properties.hasRemarks === 'true'
      ? { hasRemarks: true }
      : properties.hasRemarks === 'false'
        ? { hasRemarks: false }
        : {}),
  };
}
