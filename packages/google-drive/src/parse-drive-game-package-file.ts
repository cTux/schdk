import { isDriveFileId } from './settings.js';
import { type DriveGamePackageFile } from './drive-game-package-file.js';
import { isDriveGamePackageName } from './is-drive-game-package-name.js';
import { DRIVE_APP_KIND_KEY } from './drive-app-kind-key.js';
import { DRIVE_PACKAGE_KIND } from './drive-package-kind.js';

export function parseDriveGamePackageFile(
  value: unknown,
): DriveGamePackageFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  if (
    !isDriveFileId(file.id) ||
    !isDriveGamePackageName(file.name) ||
    properties[DRIVE_APP_KIND_KEY] !== DRIVE_PACKAGE_KIND ||
    typeof file.modifiedTime !== 'string' ||
    !Number.isFinite(Date.parse(file.modifiedTime))
  ) {
    return null;
  }
  return {
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
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
