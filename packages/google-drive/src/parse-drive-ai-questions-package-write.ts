import { type DriveAIQuestionsPackageWrite } from './drive-ai-questions-package-write.js';
import { isDriveAIQuestionsPackageName } from './is-drive-ai-questions-package-name.js';

export function parseDriveAIQuestionsPackageWrite(
  value: unknown,
): DriveAIQuestionsPackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const hasValidName = isDriveAIQuestionsPackageName(candidate.name);
  const hasValidContent = candidate.content instanceof Uint8Array;
  return hasValidName && hasValidContent
    ? {
        name: candidate.name as string,
        content: candidate.content as Uint8Array,
      }
    : null;
}
