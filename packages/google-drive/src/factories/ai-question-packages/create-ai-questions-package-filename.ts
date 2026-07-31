import { MAX_DRIVE_FILE_NAME_LENGTH } from '../../constants/file-names/max-drive-file-name-length.js';
import { AI_QUESTIONS_PACKAGE_EXTENSION } from '../../constants/ai-question-packages/ai-questions-package-extension.js';

export function createAIQuestionsPackageFilename(name: string) {
  const safeName =
    name.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || 'AI package rule';
  return `${safeName
    .slice(
      0,
      MAX_DRIVE_FILE_NAME_LENGTH - AI_QUESTIONS_PACKAGE_EXTENSION.length,
    )
    .trimEnd()}${AI_QUESTIONS_PACKAGE_EXTENSION}`;
}
