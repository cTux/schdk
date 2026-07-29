import { type TimedSection } from './timed-section.js';
import { type DriveRecentPackage } from './drive-recent-package.js';
import { isDriveFileId } from './settings.js';
import { type DriveSettingsDocument } from './drive-settings-document.js';

function isTimedSection(value: unknown): value is TimedSection {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.updatedAt === 'string' &&
    Number.isFinite(Date.parse(candidate.updatedAt)) &&
    'value' in candidate
  );
}

function isRecentPackages(
  section: TimedSection,
): section is TimedSection<DriveRecentPackage[]> {
  return (
    Array.isArray(section.value) &&
    section.value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        isDriveFileId((item as Record<string, unknown>).fileId) &&
        typeof (item as Record<string, unknown>).openedAt === 'string' &&
        Number.isFinite(
          Date.parse((item as Record<string, unknown>).openedAt as string),
        ),
    )
  );
}

export function parseDriveSettingsDocument(
  value: unknown,
): DriveSettingsDocument | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== 1 ||
    !candidate.sections ||
    typeof candidate.sections !== 'object' ||
    (candidate.packageFolderId !== undefined &&
      !isDriveFileId(candidate.packageFolderId))
  ) {
    return null;
  }
  const sections = candidate.sections as Record<string, unknown>;
  const editorTextOptions = sections.editorTextOptions;
  const gameOptions = sections.gameOptions;
  const recentPackages = sections.recentPackages;
  if (
    !isTimedSection(editorTextOptions) ||
    !isTimedSection(gameOptions) ||
    !isTimedSection(recentPackages) ||
    !isRecentPackages(recentPackages)
  ) {
    return null;
  }
  return {
    schemaVersion: 1,
    ...(candidate.packageFolderId
      ? { packageFolderId: candidate.packageFolderId }
      : {}),
    sections: { editorTextOptions, gameOptions, recentPackages },
  };
}
