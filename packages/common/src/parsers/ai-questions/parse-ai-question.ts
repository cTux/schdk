import { type AIQuestion } from '../../contracts/ai-questions/ai-question.js';

export function parseAIQuestion(value: unknown): AIQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  const hasValidName =
    typeof question.name === 'string' && Boolean(question.name.trim());
  const hasValidDescription =
    typeof question.description === 'string' &&
    Boolean(question.description.trim());
  const hasValidExamples =
    typeof question.goodExamples === 'string' &&
    typeof question.badExamples === 'string';
  const hasValidFlags =
    typeof question.enabled === 'boolean' &&
    typeof question.favorite === 'boolean' &&
    (question.generalRule === undefined ||
      typeof question.generalRule === 'boolean');
  const isValidQuestion =
    hasValidName && hasValidDescription && hasValidExamples && hasValidFlags;

  if (!isValidQuestion) return null;
  return {
    name: question.name as string,
    description: question.description as string,
    goodExamples: question.goodExamples as string,
    badExamples: question.badExamples as string,
    enabled: question.enabled as boolean,
    favorite: question.favorite as boolean,
    generalRule: (question.generalRule as boolean | undefined) ?? false,
  };
}
