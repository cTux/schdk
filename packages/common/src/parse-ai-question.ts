import { type AIQuestion } from './ai-question.js';

export function parseAIQuestion(value: unknown): AIQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  return typeof question.name === 'string' &&
    Boolean(question.name.trim()) &&
    typeof question.description === 'string' &&
    Boolean(question.description.trim()) &&
    typeof question.goodExamples === 'string' &&
    typeof question.badExamples === 'string' &&
    typeof question.enabled === 'boolean' &&
    typeof question.favorite === 'boolean' &&
    (question.generalRule === undefined ||
      typeof question.generalRule === 'boolean')
    ? {
        name: question.name,
        description: question.description,
        goodExamples: question.goodExamples,
        badExamples: question.badExamples,
        enabled: question.enabled,
        favorite: question.favorite,
        generalRule: question.generalRule ?? false,
      }
    : null;
}
