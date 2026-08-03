import { type TimedSection } from '../../types/settings/timed-section.js';
import { type DriveRecentPackage } from '../../types/game-packages/drive-recent-package.js';
import { type DriveSettingsDocument } from '../../types/settings/drive-settings-document.js';
import { type VersionedAppData } from '../../types/app-data/app-data.js';

type DriveSettingsFile = VersionedAppData;

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
  isDriveFileId,
};
