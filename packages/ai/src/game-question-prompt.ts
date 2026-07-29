import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
} from '@schdk/common';
import { type GenerateGameQuestionInput } from './generate-game-question-input.js';
import { type GameQuestionGenerationRequest } from './game-question-generation-request.js';
import { type ExistingQuestionReference } from './existing-question-reference.js';
import { createGameQuestionPrompt } from './create-game-question-prompt.js';

function assertGameQuestionGenerationInput(input: GenerateGameQuestionInput) {
  if (
    typeof input.provider !== 'string' ||
    typeof input.model !== 'string' ||
    typeof input.apiKey !== 'string' ||
    (input.locale !== 'uk' && input.locale !== 'en') ||
    !input.template ||
    typeof input.template.name !== 'string' ||
    typeof input.template.description !== 'string' ||
    typeof input.template.goodExamples !== 'string' ||
    typeof input.template.badExamples !== 'string' ||
    typeof input.context !== 'string' ||
    !AI_QUESTION_DIFFICULTIES.includes(input.difficulty) ||
    !AI_QUESTION_RECOGNIZABILITIES.includes(input.recognizability) ||
    !Array.isArray(input.excludedAnswers) ||
    input.excludedAnswers.length > 1_000 ||
    input.excludedAnswers.some(
      (answer) => typeof answer !== 'string' || answer.length > 1_000,
    ) ||
    input.excludedAnswers.reduce(
      (length, answer) => length + answer.length,
      0,
    ) > 20_000 ||
    !Array.isArray(input.existingQuestions) ||
    input.existingQuestions.length > 10_000 ||
    input.existingQuestions.some(
      (question) =>
        !question ||
        typeof question.question !== 'string' ||
        question.question.length > 20_000 ||
        !Array.isArray(question.answers) ||
        question.answers.length > 100 ||
        question.answers.some(
          (answer) => typeof answer !== 'string' || answer.length > 1_000,
        ),
    ) ||
    input.existingQuestions.reduce(
      (total, question) =>
        total +
        question.question.length +
        question.answers.reduce((length, answer) => length + answer.length, 0),
      0,
    ) > 5_000_000 ||
    !input.apiKey.trim() ||
    input.apiKey.length > 16_384 ||
    !input.model.trim() ||
    input.model.length > 256 ||
    !input.context.trim() ||
    input.context.length > 20_000 ||
    !input.template.name.trim() ||
    !input.template.description.trim()
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
