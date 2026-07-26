import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry, generateText, jsonSchema, Output } from 'ai';
import {
  parseGameQuestion,
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
  'answerComment' | 'comment' | 'handout' | 'hostNotes'
> & {
  answerComment: string | null;
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
        description: 'Required question text parts.',
      },
      answer: { type: 'string', description: 'Required main answer.' },
      answerComment: {
        ...nullableString(),
        description: 'Optional answer explanation; null when absent.',
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
        return {
          success: true,
          value: parseGameQuestion({
            ...generated,
            ...(generated.answerComment === null
              ? { answerComment: undefined }
              : {}),
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

function prompt(input: GenerateGameQuestionInput) {
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
  const system =
    input.locale === 'uk'
      ? 'Створи питання для гри «Що? Де? Коли?» за обраним шаблоном. Заповни всі поля формату відповіді; для необов’язкових полів без значення поверни null, а для списків — порожній список.'
      : 'Create a What? Where? When? game question from the selected template. Fill every response field; use null for absent optional fields and empty arrays for absent lists.';
  const result = await generateText({
    model: registry.languageModel(`${provider}:${input.model}`),
    output: Output.object({
      name: 'game_question',
      description:
        'A complete game question with required and optional fields.',
      schema: generatedQuestionSchema,
    }),
    system,
    prompt: prompt(input),
  });
  return result.output;
}
