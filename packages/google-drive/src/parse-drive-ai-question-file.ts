import { isDriveFileId } from './settings.js';
import { type DriveAIQuestionFile } from './drive-ai-question-file.js';
import { isDriveAIQuestionName } from './is-drive-ai-question-name.js';
import { DRIVE_AI_QUESTION_KIND } from './drive-ai-question-kind.js';

export function parseDriveAIQuestionFile(
  value: unknown,
): DriveAIQuestionFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  return isDriveFileId(file.id) &&
    isDriveAIQuestionName(file.name) &&
    properties.schdkType === DRIVE_AI_QUESTION_KIND &&
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime))
    ? {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      }
    : null;
}
