import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry, generateText, jsonSchema, Output } from 'ai';
import {
  getGameQuestionAnswers,
  normalizeGameAnswer,
  parseGameQuestion,
  QUESTION_TYPE_CONFIG,
  type GameQuestion,
} from '@schdk/common';
import {
  assertGameQuestionGenerationInput,
  createGameQuestionPrompt,
  type GenerateGameQuestionInput,
} from './game-question-prompt.js';
import { hasDiverseAnswer } from './answer-diversity.js';

export { createGameQuestionPrompt } from './game-question-prompt.js';
export type {
  GameQuestionGenerationRequest,
  GenerateGameQuestionInput,
} from './game-question-prompt.js';

export const SUPPORTED_AI_PROVIDER_IDS = [
  'openai',
  'anthropic',
  'google',
] as const;

type SupportedAiProvider = (typeof SUPPORTED_AI_PROVIDER_IDS)[number];
type GeneratedQuestion = Omit<
  GameQuestion,
  'comment' | 'handout' | 'hostNotes'
> & {
  answerComment: string;
  comment: string | null;
  handout: GameQuestion['handout'] | null;
  hostNotes: string | null;
};

const nullableString = () => ({
  anyOf: [{ type: 'string' as const }, { type: 'null' as const }],
});

const generatedQuestionSchema = jsonSchema<GameQuestion>(
  {
    type: 'object',
    additionalProperties: false,
    properties: {
      type: {
        type: 'string',
        enum: ['standard', 'blitz-2x30', 'blitz-3x20'],
        description: 'Required question type.',
      },
      questionParts: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 3,
        description:
          'Required question text parts: 1 for standard, 2 for blitz-2x30, and 3 for blitz-3x20.',
      },
      answer: { type: 'string', description: 'Required main answer.' },
      answerComment: {
        type: 'string',
        minLength: 1,
        description: 'Required answer explanation.',
      },
      alternativeAnswers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Required list; use an empty list when absent.',
      },
      wrongAnswers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Required list; use an empty list when absent.',
      },
      handout: {
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              kind: { type: 'string', enum: ['text'] },
              text: { type: 'string' },
            },
            required: ['kind', 'text'],
          },
          { type: 'null' },
        ],
        description: 'Optional text handout; null when absent.',
      },
      comment: {
        ...nullableString(),
        description: 'Optional unresolved author remark; null when absent.',
      },
      hostNotes: {
        ...nullableString(),
        description: 'Optional host notes; null when absent.',
      },
    },
    required: [
      'type',
      'questionParts',
      'answer',
      'answerComment',
      'alternativeAnswers',
      'wrongAnswers',
      'handout',
      'comment',
      'hostNotes',
    ],
  },
  {
    validate(value) {
      try {
        const generated = value as GeneratedQuestion;
        if (!generated.answerComment.trim()) {
          throw new Error('Answer comment is required');
        }
        const partCount = QUESTION_TYPE_CONFIG[generated.type].partCount;
        const questionParts =
          generated.questionParts.length > partCount
            ? [
                ...generated.questionParts.slice(0, partCount - 1),
                generated.questionParts.slice(partCount - 1).join('\n\n'),
              ]
            : generated.questionParts;
        return {
          success: true,
          value: parseGameQuestion({
            ...generated,
            questionParts,
            ...(generated.comment === null ? { comment: undefined } : {}),
            ...(generated.handout === null ? { handout: undefined } : {}),
            ...(generated.hostNotes === null ? { hostNotes: undefined } : {}),
          }),
        };
      } catch {
        return {
          success: false,
          error: new Error('Invalid generated question'),
        };
      }
    },
  },
);

export function isSupportedAiProvider(
  value: string,
): value is SupportedAiProvider {
  return SUPPORTED_AI_PROVIDER_IDS.includes(value as SupportedAiProvider);
}

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
  const excludedAnswers = new Set(
    input.excludedAnswers.map(normalizeGameAnswer),
  );
  const model = registry.languageModel(`${provider}:${input.model}`);
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
                ? 'Попередня спроба не пройшла перевірку унікальності та різноманітності. Обери іншу сутність, тип і форму відповіді.'
                : 'The previous attempt failed the uniqueness and diversity review. Choose a different entity, type, and answer form.'
            }`,
    });
    const repeatsAnswer = getGameQuestionAnswers(result.output).some((answer) =>
      excludedAnswers.has(normalizeGameAnswer(answer)),
    );
    if (
      !repeatsAnswer &&
      (await hasDiverseAnswer(
        model,
        input.locale,
        result.output,
        input.excludedAnswers,
      ))
    ) {
      return result.output;
    }
  }
  throw new Error('AI generated a duplicate answer');
}
