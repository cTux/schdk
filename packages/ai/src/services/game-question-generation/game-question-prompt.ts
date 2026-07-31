import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
} from '@schdk/common';
import { type GenerateGameQuestionInput } from '../../types/game-question-generation/generate-game-question-input.js';
import { type GameQuestionGenerationRequest } from '../../types/game-question-generation/game-question-generation-request.js';
import { createGameQuestionPrompt } from '../../utils/game-question-generation/create-game-question-prompt.js';

function assertGameQuestionGenerationInput(input: GenerateGameQuestionInput) {
  const hasValidProvider =
    typeof input.provider === 'string' &&
    typeof input.model === 'string' &&
    typeof input.apiKey === 'string';
  const hasValidLocale = input.locale === 'uk' || input.locale === 'en';
  const hasValidTemplate =
    !!input.template &&
    typeof input.template.name === 'string' &&
    typeof input.template.description === 'string' &&
    typeof input.template.goodExamples === 'string' &&
    typeof input.template.badExamples === 'string' &&
    Boolean(input.template.name.trim()) &&
    Boolean(input.template.description.trim());
  const hasValidGenerationOptions =
    typeof input.context === 'string' &&
    AI_QUESTION_DIFFICULTIES.includes(input.difficulty) &&
    AI_QUESTION_RECOGNIZABILITIES.includes(input.recognizability) &&
    typeof input.difficultyPrompt === 'string' &&
    Boolean(input.difficultyPrompt.trim()) &&
    input.difficultyPrompt.length <= 20_000 &&
    typeof input.recognizabilityPrompt === 'string' &&
    Boolean(input.recognizabilityPrompt.trim()) &&
    input.recognizabilityPrompt.length <= 20_000;
  const hasValidExcludedAnswers =
    Array.isArray(input.excludedAnswers) &&
    input.excludedAnswers.length <= 1_000 &&
    input.excludedAnswers.every(
      (answer) => typeof answer === 'string' && answer.length <= 1_000,
    ) &&
    input.excludedAnswers.reduce(
      (length, answer) => length + answer.length,
      0,
    ) <= 20_000;
  const hasValidTextLengths =
    Boolean(input.apiKey.trim()) &&
    input.apiKey.length <= 16_384 &&
    Boolean(input.model.trim()) &&
    input.model.length <= 256 &&
    Boolean(input.context.trim()) &&
    input.context.length <= 20_000;

  if (
    !hasValidProvider ||
    !hasValidLocale ||
    !hasValidTemplate ||
    !hasValidGenerationOptions ||
    !hasValidExcludedAnswers ||
    !hasValidTextLengths
  ) {
    throw new TypeError('Invalid AI generation input');
  }
}

export {
  type GameQuestionGenerationRequest,
  type GenerateGameQuestionInput,
  assertGameQuestionGenerationInput,
  createGameQuestionPrompt,
};
