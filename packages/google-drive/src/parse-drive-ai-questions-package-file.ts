import { isDriveFileId } from './settings.js';
import { type DriveAIQuestionsPackageFile } from './drive-ai-questions-package-file.js';
import { isDriveAIQuestionsPackageName } from './is-drive-ai-questions-package-name.js';
import { DRIVE_AI_QUESTIONS_PACKAGE_KIND } from './ai-questions-packages.js';

export function parseDriveAIQuestionsPackageFile(
  value: unknown,
): DriveAIQuestionsPackageFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  return isDriveFileId(file.id) &&
    isDriveAIQuestionsPackageName(file.name) &&
    properties.schdkType === DRIVE_AI_QUESTIONS_PACKAGE_KIND &&
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime))
    ? {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      }
    : null;
}
