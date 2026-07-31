import { isDriveFileId } from '../../services/settings/settings.js';
import { type DriveAIQuestionFile } from '../../types/ai-questions/drive-ai-question-file.js';
import { isDriveAIQuestionName } from '../../utils/ai-questions/is-drive-ai-question-name.js';
import { DRIVE_AI_QUESTION_KIND } from '../../constants/ai-questions/drive-ai-question-kind.js';

export function parseDriveAIQuestionFile(
  value: unknown,
): DriveAIQuestionFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  const hasValidIdentity =
    isDriveFileId(file.id) && isDriveAIQuestionName(file.name);
  const hasExpectedKind = properties.schdkType === DRIVE_AI_QUESTION_KIND;
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
