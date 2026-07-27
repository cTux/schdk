import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry, generateText, jsonSchema, Output } from 'ai';
import {
  parseGameQuestion,
  QUESTION_TYPE_CONFIG,
  type AIQuestion,
  type GameQuestion,
} from '@schdk/common';

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

export interface GameQuestionGenerationRequest {
  provider: string;
  model: string;
  locale: 'uk' | 'en';
  template: AIQuestion;
  context: string;
}

export interface GenerateGameQuestionInput extends GameQuestionGenerationRequest {
  apiKey: string;
}

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
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              kind: { type: 'string', enum: ['image'] },
              name: { type: 'string' },
              mimeType: { type: 'string' },
              dataUrl: { type: 'string' },
            },
            required: ['kind', 'name', 'mimeType', 'dataUrl'],
          },
          { type: 'null' },
        ],
        description: 'Optional handout; null when absent.',
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

function assertInput(input: GenerateGameQuestionInput) {
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

function prompt(input: GameQuestionGenerationRequest) {
  const examples = input.locale === 'uk' ? 'Приклади' : 'Examples';
  const context = input.locale === 'uk' ? 'Контекст' : 'Context';
  return [
    `${input.template.name}: ${input.template.description}`,
    input.template.goodExamples
      ? `${examples} (${input.locale === 'uk' ? 'вдалі' : 'good'}): ${input.template.goodExamples}`
      : '',
    input.template.badExamples
      ? `${examples} (${input.locale === 'uk' ? 'невдалі' : 'bad'}): ${input.template.badExamples}`
      : '',
    `${context}: ${input.context}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function createGameQuestionPrompt(input: GameQuestionGenerationRequest) {
  return {
    system:
      input.locale === 'uk'
        ? 'Створи питання для гри «Що? Де? Коли?» за обраним шаблоном. Коментар до відповіді є обов’язковим: коротко поясни правильну відповідь. Заповни всі поля формату відповіді; для інших необов’язкових полів без значення поверни null, а для списків — порожній список.'
        : 'Create a What? Where? When? game question from the selected template. The answer comment is required: briefly explain the correct answer. Fill every response field; use null for other absent optional fields and empty arrays for absent lists.',
    prompt: prompt(input),
  };
}

export async function generateGameQuestion(
  input: GenerateGameQuestionInput,
): Promise<GameQuestion> {
  assertInput(input);
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
  const result = await generateText({
    model: registry.languageModel(`${provider}:${input.model}`),
    output: Output.object({
      name: 'game_question',
      description:
        'A complete game question with required and optional fields.',
      schema: generatedQuestionSchema,
    }),
    system,
    prompt: userPrompt,
  });
  return result.output;
}
