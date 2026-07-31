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
import { reviewGameQuestion } from '../../utils/game-question-generation/question-review.js';
import { findSimilarQuestionCandidates } from '../../utils/game-question-generation/question-similarity.js';

import { type SupportedAiProvider } from '../../types/ai-providers/supported-ai-provider.js';
import { isSupportedAiProvider } from '../../utils/ai-providers/is-supported-ai-provider.js';

type GeneratedQuestion = Omit<
  GameQuestion,
  'comment' | 'handout' | 'hostNotes'
> & {
  answerComment: string;
  comment: string | null;
  handout: GameQuestion['handout'] | null;
  hostNotes: string | null;
};

const constructionLabelPattern =
  /(?:(?:фактологічн|асоціативн)\p{L}*\s+шлях\p{L}*|(?:factual|associative)\s+(?:path|route)s?)\s*(?:[—–:-]\s*)?/giu;

function removeConstructionLabels(value: string) {
  return value.replace(constructionLabelPattern, '').trim();
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
          'Required reader-facing question text parts without template or construction labels: 1 for standard, 2 for blitz-2x30, and 3 for blitz-3x20.',
      },
      answer: { type: 'string', description: 'Required main answer.' },
      answerComment: {
        type: 'string',
        minLength: 1,
        description:
          'Required natural reader-facing answer explanation without template or construction labels.',
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
        description:
          'Human-authored unresolved revision remark; never invent one and use null when absent or resolved.',
      },
      hostNotes: {
        ...nullableString(),
        description:
          'Optional delivery-only instructions shown to the host while reading the question, such as pronunciation, audible quotation marks, text to omit, pauses, or cues. Never include answer-checking guidance, difficulty estimates, or quality analysis; use null when absent.',
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
        const answerComment = removeConstructionLabels(generated.answerComment);
        if (!answerComment) {
          throw new Error('Answer comment is required');
        }
        const partCount = QUESTION_TYPE_CONFIG[generated.type].partCount;
        const sanitizedQuestionParts = generated.questionParts.map(
          removeConstructionLabels,
        );
        const questionParts =
          sanitizedQuestionParts.length > partCount
            ? [
                ...sanitizedQuestionParts.slice(0, partCount - 1),
                sanitizedQuestionParts.slice(partCount - 1).join('\n\n'),
              ]
            : sanitizedQuestionParts;
        return {
          success: true,
          value: parseGameQuestion({
            ...generated,
            questionParts,
            answerComment,
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
    [
      ...input.excludedAnswers,
      ...input.existingQuestions.flatMap((question) => question.answers),
    ].map(normalizeGameAnswer),
  );
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
    const repeatsAnswer = getGameQuestionAnswers(result.output).some((answer) =>
      excludedAnswers.has(normalizeGameAnswer(answer)),
    );
    if (repeatsAnswer) {
      rejectionFeedback =
        input.locale === 'uk'
          ? 'Відповідь повторює вже використану сутність. Обери іншу.'
          : 'The answer repeats an already used entity. Choose another one.';
    } else {
      const review = await reviewGameQuestion(
        model,
        input.locale,
        userPrompt,
        result.output,
        input.excludedAnswers,
        similarQuestions,
      );
      if (review.acceptable) return result.output;
      rejectionFeedback = review.feedback;
    }
    rejectedQuestion = result.output;
    rejectedQuestions = similarQuestions;
  }
  throw new Error('AI generated an unacceptable question');
}
