import { MAX_DRIVE_FILE_NAME_LENGTH } from '../../constants/file-names/max-drive-file-name-length.js';
import { AI_QUESTION_EXTENSION } from '../../constants/ai-questions/ai-question-extension.js';

export function createAIQuestionFilename(name: string) {
  const safeName =
    name.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || 'AI question';
  return `${safeName
    .slice(0, MAX_DRIVE_FILE_NAME_LENGTH - AI_QUESTION_EXTENSION.length)
    .trimEnd()}${AI_QUESTION_EXTENSION}`;
}
