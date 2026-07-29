import { GLOBAL_AI_QUESTION_ADMIN_EMAILS } from './global-ai-question-admin-emails.js';
import { DRIVE_AI_QUESTION_KIND } from './drive-ai-question-kind.js';
import { DRIVE_AI_QUESTION_MIME_TYPE } from './drive-ai-question-mime-type.js';
import { type DriveAIQuestionFile } from './drive-ai-question-file.js';
import { type DriveAIQuestion } from './drive-ai-question.js';
import { type DriveAIQuestionWrite } from './drive-ai-question-write.js';
import { type DriveAIQuestionStorage } from './drive-ai-question-storage.js';
import { type DriveGlobalAIQuestionStorage } from './drive-global-ai-question-storage.js';
import { createAIQuestionFilename } from './create-ai-question-filename.js';
import { isDriveAIQuestionName } from './is-drive-ai-question-name.js';
import { parseDriveAIQuestionWrite } from './parse-drive-ai-question-write.js';
import { parseDriveAIQuestionFile } from './parse-drive-ai-question-file.js';
import { isGlobalAIQuestionAdmin } from './is-global-ai-question-admin.js';

const GLOBAL_AI_QUESTION_FOLDER_ID = '1qigJtM0zAQl2Yk8C2xjeragcGDybUVR1';

export {
  GLOBAL_AI_QUESTION_FOLDER_ID,
  GLOBAL_AI_QUESTION_ADMIN_EMAILS,
  DRIVE_AI_QUESTION_KIND,
  DRIVE_AI_QUESTION_MIME_TYPE,
  type DriveAIQuestionFile,
  type DriveAIQuestion,
  type DriveAIQuestionWrite,
  type DriveAIQuestionStorage,
  type DriveGlobalAIQuestionStorage,
  createAIQuestionFilename,
  isDriveAIQuestionName,
  parseDriveAIQuestionWrite,
  parseDriveAIQuestionFile,
  isGlobalAIQuestionAdmin,
};
