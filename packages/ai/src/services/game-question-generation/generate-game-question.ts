import { generateText, Output, type LanguageModel } from 'ai';
import { type GameQuestion } from '@schdk/common/game-question';
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

async function createLanguageModel(
  provider: SupportedAiProvider,
  apiKey: string,
  model: string,
): Promise<LanguageModel> {
  switch (provider) {
    case 'openai': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      return createOpenAI({ apiKey })(model);
    }
    case 'anthropic': {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      return createAnthropic({
        apiKey,
        headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
      })(model);
    }
    case 'google': {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      return createGoogleGenerativeAI({ apiKey })(model);
    }
  }
}

export async function generateGameQuestion(
  input: GenerateGameQuestionInput,
): Promise<GameQuestion> {
  assertGameQuestionGenerationInput(input);
  const provider = parseProvider(input.provider);
  const { system, prompt: userPrompt } = createGameQuestionPrompt(input);
  const model = await createLanguageModel(provider, input.apiKey, input.model);
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
    abortSignal: input.abortSignal,
  });
  const { imagePrompt, ...question } = result.output;
  if (!imagePrompt) return question;
  if (provider !== 'openai') {
    throw new Error('Image generation requires the OpenAI provider');
  }
  return generateQuestionImage(
    input.apiKey,
    question,
    imagePrompt,
    input.abortSignal,
  );
}
