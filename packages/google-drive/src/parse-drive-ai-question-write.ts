import { type DriveAIQuestionWrite } from './drive-ai-question-write.js';
import { isDriveAIQuestionName } from './is-drive-ai-question-name.js';

export function parseDriveAIQuestionWrite(
  value: unknown,
): DriveAIQuestionWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveAIQuestionName(candidate.name) &&
    candidate.content instanceof Uint8Array
    ? { name: candidate.name, content: candidate.content }
    : null;
}
