import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry, generateText, Output } from 'ai';
import { type GameQuestion } from '@schdk/common';
import {
  assertGameQuestionGenerationInput,
  createGameQuestionPrompt,
  type GenerateGameQuestionInput,
} from './game-question-prompt.js';
import { reviewGameQuestion } from '../../utils/game-question-generation/question-review.js';
import { findSimilarQuestionCandidates } from '../../utils/game-question-generation/question-similarity.js';
import { generateQuestionImage } from '../../utils/game-question-generation/generate-question-image.js';
import { generatedQuestionSchema } from '../../utils/game-question-generation/generated-question-schema.js';

import { type SupportedAiProvider } from '../../types/ai-providers/supported-ai-provider.js';
import { isSupportedAiProvider } from '../../utils/ai-providers/is-supported-ai-provider.js';

function parseProvider(value: string): SupportedAiProvider {
  if (!isSupportedAiProvider(value)) {
    throw new TypeError('Unsupported AI provider');
  }
  return value as SupportedAiProvider;
}

export async function generateGameQuestion(
  input: GenerateGameQuestionInput,
): Promise<GameQuestion> {
  assertGameQuestionGenerationInput(input);
  const provider = parseProvider(input.provider);
  const registry = createProviderRegistry({
    openai: createOpenAI({ apiKey: input.apiKey }),
    anthropic: createAnthropic({
      apiKey: input.apiKey,
      headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
    }),
    google: createGoogleGenerativeAI({ apiKey: input.apiKey }),
  });
  const { system, prompt: userPrompt } = createGameQuestionPrompt(input);
  const model = registry.languageModel(`${provider}:${input.model}`);
  let rejectedQuestions: typeof input.existingQuestions = [];
  let rejectedQuestion: GameQuestion | undefined;
  let rejectionFeedback = '';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await generateText({
      model,
      output: Output.object({
        name: 'game_question',
        description:
          'A complete game question with required and optional fields.',
        schema: generatedQuestionSchema,
      }),
      system,
      prompt:
        attempt === 0
          ? userPrompt
          : `${userPrompt}\n\n${
              input.locale === 'uk'
                ? 'Попередній кандидат не пройшов редакторську перевірку. Виправ усі зазначені недоліки.'
                : 'The previous candidate failed editorial review. Correct every reported defect.'
            }\n\n${rejectionFeedback}\n\n${JSON.stringify({
              rejectedQuestion,
              similarQuestions: rejectedQuestions.slice(0, 5),
            })}`,
    });
    const similarQuestions = findSimilarQuestionCandidates(
      result.output,
      input.existingQuestions,
    );
    const review = await reviewGameQuestion(
      model,
      input.locale,
      userPrompt,
      result.output,
      similarQuestions,
    );
    if (review.acceptable) {
      const { imagePrompt, ...question } = result.output;
      if (!imagePrompt) return question;
      if (provider !== 'openai') {
        throw new Error('Image generation requires the OpenAI provider');
      }
      return generateQuestionImage(input.apiKey, question, imagePrompt);
    }
    rejectionFeedback = review.feedback;
    rejectedQuestion = result.output;
    rejectedQuestions = similarQuestions;
  }
  throw new Error('AI generated an unacceptable question');
}
