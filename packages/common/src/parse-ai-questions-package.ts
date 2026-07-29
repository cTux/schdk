import { type AIQuestionsPackage } from './ai-questions-package.js';

export function parseAIQuestionsPackage(
  value: unknown,
): AIQuestionsPackage | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const questions = Array.isArray(item.questions)
    ? item.questions.flatMap((question) => {
        if (!question || typeof question !== 'object') return [];
        const candidate = question as Record<string, unknown>;
        return Number.isSafeInteger(candidate.questionNumber) &&
          Number(candidate.questionNumber) >= 1 &&
          Number(candidate.questionNumber) <= 36 &&
          (candidate.questionType === undefined ||
            typeof candidate.questionType === 'string') &&
          typeof candidate.context === 'string' &&
          Boolean(candidate.context.trim())
          ? [
              {
                questionNumber: Number(candidate.questionNumber),
                ...(candidate.questionType?.toString().trim()
                  ? { questionType: candidate.questionType.toString() }
                  : {}),
                context: candidate.context,
              },
            ]
          : [];
      })
    : [];
  return typeof item.name === 'string' &&
    Boolean(item.name.trim()) &&
    typeof item.context === 'string' &&
    Boolean(item.context.trim()) &&
    Array.isArray(item.questions) &&
    questions.length === item.questions.length &&
    typeof item.enabled === 'boolean' &&
    typeof item.favorite === 'boolean'
    ? {
        name: item.name,
        context: item.context,
        questions,
        enabled: item.enabled,
        favorite: item.favorite,
      }
    : null;
}
