import { type DriveAIQuestionWrite } from '../../types/ai-questions/drive-ai-question-write.js';
import { isDriveAIQuestionName } from '../../utils/ai-questions/is-drive-ai-question-name.js';

export function parseDriveAIQuestionWrite(
  value: unknown,
): DriveAIQuestionWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const hasValidName = isDriveAIQuestionName(candidate.name);
  const hasValidContent = candidate.content instanceof Uint8Array;
  return hasValidName && hasValidContent
    ? {
        name: candidate.name as string,
        content: candidate.content as Uint8Array,
      }
    : null;
}
