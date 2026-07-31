import { GLOBAL_AI_QUESTION_ADMIN_EMAILS } from '../../constants/ai-questions/global-ai-question-admin-emails.js';

export function isGlobalAIQuestionAdmin(emailAddress?: string) {
  return GLOBAL_AI_QUESTION_ADMIN_EMAILS.some(
    (email) => email === emailAddress?.toLowerCase(),
  );
}
