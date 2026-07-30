import { type TimedSection } from './timed-section.js';
import { type DriveRecentPackage } from './drive-recent-package.js';
import { isDriveFileId } from './settings.js';
import { type DriveSettingsDocument } from './drive-settings-document.js';

function isTimedSection(value: unknown): value is TimedSection {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const hasValidTimestamp =
    typeof candidate.updatedAt === 'string' &&
    Number.isFinite(Date.parse(candidate.updatedAt));
  const hasValue = 'value' in candidate;
  return hasValidTimestamp && hasValue;
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
  const hasExpectedSchema = candidate.schemaVersion === 1;
  const hasSections =
    !!candidate.sections && typeof candidate.sections === 'object';
  const hasValidPackageFolder =
    candidate.packageFolderId === undefined ||
    isDriveFileId(candidate.packageFolderId);
  if (!hasExpectedSchema || !hasSections || !hasValidPackageFolder) {
    return null;
  }
  const sections = candidate.sections as Record<string, unknown>;
  const editorTextOptions = sections.editorTextOptions;
  const gameOptions = sections.gameOptions;
  const recentPackages = sections.recentPackages;
  const hasRequiredSections =
    isTimedSection(editorTextOptions) &&
    isTimedSection(gameOptions) &&
    isTimedSection(recentPackages);
  const hasValidRecentPackages =
    hasRequiredSections && isRecentPackages(recentPackages);
  if (!hasRequiredSections || !hasValidRecentPackages) {
    return null;
  }
  return {
    schemaVersion: 1,
    ...(candidate.packageFolderId
      ? { packageFolderId: candidate.packageFolderId as string }
      : {}),
    sections: { editorTextOptions, gameOptions, recentPackages },
  };
}
