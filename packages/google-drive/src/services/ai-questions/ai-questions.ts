import { GLOBAL_AI_QUESTION_ADMIN_EMAILS } from '../../constants/ai-questions/global-ai-question-admin-emails.js';
import { DRIVE_AI_QUESTION_KIND } from '../../constants/ai-questions/drive-ai-question-kind.js';
import { DRIVE_AI_QUESTION_MIME_TYPE } from '../../constants/ai-questions/drive-ai-question-mime-type.js';
import { type DriveAIQuestionFile } from '../../types/ai-questions/drive-ai-question-file.js';
import { type DriveAIQuestion } from '../../types/ai-questions/drive-ai-question.js';
import { type DriveAIQuestionWrite } from '../../types/ai-questions/drive-ai-question-write.js';
import { type DriveAIQuestionStorage } from '../../types/ai-questions/drive-ai-question-storage.js';
import { type DriveGlobalAIQuestionStorage } from '../../types/ai-questions/drive-global-ai-question-storage.js';
import { createAIQuestionFilename } from '../../factories/ai-questions/create-ai-question-filename.js';
import { isDriveAIQuestionName } from '../../utils/ai-questions/is-drive-ai-question-name.js';
import { parseDriveAIQuestionWrite } from '../../parsers/ai-questions/parse-drive-ai-question-write.js';
import { parseDriveAIQuestionFile } from '../../parsers/ai-questions/parse-drive-ai-question-file.js';
import { isGlobalAIQuestionAdmin } from '../../utils/ai-questions/is-global-ai-question-admin.js';

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
