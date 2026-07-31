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
  const result = await generateText({
    model,
    output: Output.object({
      name: 'game_question',
      description:
        'A complete game question with required and optional fields.',
      schema: generatedQuestionSchema,
    }),
    system,
    prompt: userPrompt,
  });
  const { imagePrompt, ...question } = result.output;
  if (!imagePrompt) return question;
  if (provider !== 'openai') {
    throw new Error('Image generation requires the OpenAI provider');
  }
  return generateQuestionImage(input.apiKey, question, imagePrompt);
}
