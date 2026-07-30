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
  const hasValidIdentity =
    isDriveFileId(file.id) && isDriveAIQuestionsPackageName(file.name);
  const hasExpectedKind =
    properties.schdkType === DRIVE_AI_QUESTIONS_PACKAGE_KIND;
  const hasValidModifiedTime =
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime));
  const isValidFile =
    hasValidIdentity && hasExpectedKind && hasValidModifiedTime;
  return isValidFile
    ? {
        id: file.id as string,
        name: file.name as string,
        modifiedTime: file.modifiedTime as string,
      }
    : null;
}
