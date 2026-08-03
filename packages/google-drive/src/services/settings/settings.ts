import { type TimedSection } from '../../types/settings/timed-section.js';
import { type DriveRecentPackage } from '../../types/game-packages/drive-recent-package.js';
import { type DriveSettingsDocument } from '../../types/settings/drive-settings-document.js';
import { type VersionedAppData } from '../../types/app-data/app-data.js';

type DriveSettingsFile = VersionedAppData;

interface DriveVisualAssetsDocument {
  schemaVersion: 1;
  assets: Record<string, string>;
}

type DriveVisualAssetsFile = VersionedAppData<DriveVisualAssetsDocument>;

function parseDriveVisualAssetsDocument(
  value: unknown,
): DriveVisualAssetsDocument | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    !candidate.assets ||
    typeof candidate.assets !== 'object' ||
    Array.isArray(candidate.assets)
  ) {
    return null;
  }
  const entries = Object.entries(candidate.assets);
  if (
    entries.length > 64 ||
    entries.reduce(
      (total, [, data]) => total + (typeof data === 'string' ? data.length : 0),
      0,
    ) >
      32 * 1024 * 1024 ||
    !entries.every(
      ([id, data]) =>
        isDriveFileId(id) &&
        typeof data === 'string' &&
        data.startsWith('data:image/') &&
        data.length <= 3 * 1024 * 1024,
    )
  ) {
    return null;
  }
  return { schemaVersion: 1, assets: Object.fromEntries(entries) };
}

function isDriveFileId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 256 &&
    /^[\w-]+$/u.test(value)
  );
}

export {
  type TimedSection,
  type DriveRecentPackage,
  type DriveSettingsDocument,
  type DriveSettingsFile,
  type DriveVisualAssetsDocument,
  type DriveVisualAssetsFile,
  isDriveFileId,
  parseDriveVisualAssetsDocument,
};
