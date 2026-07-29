import { type DriveAIQuestionsPackageWrite } from './drive-ai-questions-package-write.js';
import { isDriveAIQuestionsPackageName } from './is-drive-ai-questions-package-name.js';

export function parseDriveAIQuestionsPackageWrite(
  value: unknown,
): DriveAIQuestionsPackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveAIQuestionsPackageName(candidate.name) &&
    candidate.content instanceof Uint8Array
    ? { name: candidate.name, content: candidate.content }
    : null;
}
