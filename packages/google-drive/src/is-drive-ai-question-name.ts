import { AI_QUESTION_EXTENSION } from './ai-question-extension.js';
import { MAX_DRIVE_FILE_NAME_LENGTH } from './max-drive-file-name-length.js';

export function isDriveAIQuestionName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > AI_QUESTION_EXTENSION.length &&
    value.length <= MAX_DRIVE_FILE_NAME_LENGTH &&
    /\.aiquestion$/iu.test(value)
  );
}
