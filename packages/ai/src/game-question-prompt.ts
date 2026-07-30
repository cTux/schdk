import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
} from '@schdk/common';
import { type GenerateGameQuestionInput } from './generate-game-question-input.js';
import { type GameQuestionGenerationRequest } from './game-question-generation-request.js';
import { type ExistingQuestionReference } from './existing-question-reference.js';
import { createGameQuestionPrompt } from './create-game-question-prompt.js';

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
    AI_QUESTION_RECOGNIZABILITIES.includes(input.recognizability);
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
  const hasValidExistingQuestions =
    Array.isArray(input.existingQuestions) &&
    input.existingQuestions.length <= 10_000 &&
    input.existingQuestions.every(
      (question) =>
        !!question &&
        typeof question.question === 'string' &&
        question.question.length <= 20_000 &&
        Array.isArray(question.answers) &&
        question.answers.length <= 100 &&
        question.answers.every(
          (answer) => typeof answer === 'string' && answer.length <= 1_000,
        ),
    ) &&
    input.existingQuestions.reduce(
      (total, question) =>
        total +
        question.question.length +
        question.answers.reduce((length, answer) => length + answer.length, 0),
      0,
    ) <= 5_000_000;
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
    !hasValidExistingQuestions ||
    !hasValidTextLengths
  ) {
    throw new TypeError('Invalid AI generation input');
  }
}

export {
  type GameQuestionGenerationRequest,
  type ExistingQuestionReference,
  type GenerateGameQuestionInput,
  assertGameQuestionGenerationInput,
  createGameQuestionPrompt,
};
