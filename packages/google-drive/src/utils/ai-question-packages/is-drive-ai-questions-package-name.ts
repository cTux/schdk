import { AI_QUESTIONS_PACKAGE_EXTENSION } from '../../constants/ai-question-packages/ai-questions-package-extension.js';
import { MAX_DRIVE_FILE_NAME_LENGTH } from '../../constants/file-names/max-drive-file-name-length.js';

export function isDriveAIQuestionsPackageName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > AI_QUESTIONS_PACKAGE_EXTENSION.length &&
    value.length <= MAX_DRIVE_FILE_NAME_LENGTH &&
    /\.aiquestionpackage$/iu.test(value)
  );
}
