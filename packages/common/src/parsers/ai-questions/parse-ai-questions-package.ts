import { type AIQuestionsPackage } from '../../contracts/ai-questions/ai-questions-package.js';

export function parseAIQuestionsPackage(
  value: unknown,
): AIQuestionsPackage | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const questions = Array.isArray(item.questions)
    ? item.questions.flatMap((question) => {
        if (!question || typeof question !== 'object') return [];
        const candidate = question as Record<string, unknown>;
        const hasValidQuestionNumber =
          Number.isSafeInteger(candidate.questionNumber) &&
          Number(candidate.questionNumber) >= 1 &&
          Number(candidate.questionNumber) <= 36;
        const hasValidQuestionType =
          candidate.questionType === undefined ||
          typeof candidate.questionType === 'string';
        const hasValidContext =
          typeof candidate.context === 'string' &&
          Boolean(candidate.context.trim());
        const isValidQuestion =
          hasValidQuestionNumber && hasValidQuestionType && hasValidContext;
        return isValidQuestion
          ? [
              {
                questionNumber: Number(candidate.questionNumber),
                ...(candidate.questionType?.toString().trim()
                  ? { questionType: candidate.questionType.toString() }
                  : {}),
                context: candidate.context as string,
              },
            ]
          : [];
      })
    : [];
  const hasValidName =
    typeof item.name === 'string' && Boolean(item.name.trim());
  const hasValidContext =
    typeof item.context === 'string' && Boolean(item.context.trim());
  const hasValidQuestions =
    Array.isArray(item.questions) && questions.length === item.questions.length;
  const hasValidFlags =
    typeof item.enabled === 'boolean' && typeof item.favorite === 'boolean';
  const isValidPackage =
    hasValidName && hasValidContext && hasValidQuestions && hasValidFlags;

  return isValidPackage
    ? {
        name: item.name as string,
        context: item.context as string,
        questions,
        enabled: item.enabled as boolean,
        favorite: item.favorite as boolean,
      }
    : null;
}
