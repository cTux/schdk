import { jsonSchema } from 'ai';
import {
  parseGameQuestion,
  QUESTION_TYPE_CONFIG,
  type GameQuestion,
} from '@schdk/common/game-question';

type GeneratedQuestion = Omit<
  GameQuestion,
  'comment' | 'handout' | 'hostNotes'
> & {
  answerComment: string;
  comment: string | null;
  handout: GameQuestion['handout'] | null;
  hostNotes: string | null;
  imagePrompt: string | null;
};

const constructionLabelPattern =
  /(?:(?:фактологічн|асоціативн)\p{L}*\s+шлях\p{L}*|(?:factual|associative)\s+(?:path|route)s?)\s*(?:[—–:-]\s*)?/giu;

function removeConstructionLabels(value: string) {
  return value.replace(constructionLabelPattern, '').trim();
}

const nullableString = () => ({
  anyOf: [{ type: 'string' as const }, { type: 'null' as const }],
});

export const generatedQuestionSchema = jsonSchema<
  GameQuestion & { imagePrompt?: string }
>(
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
      imagePrompt: {
        ...nullableString(),
        description:
          'A self-contained prompt for an image handout to generate after approval, or null when no image is required.',
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
      'imagePrompt',
    ],
  },
  {
    validate(value) {
      try {
        const generated = value as GeneratedQuestion;
        const { imagePrompt, ...question } = generated;
        const answerComment = removeConstructionLabels(question.answerComment);
        if (!answerComment) {
          throw new Error('Answer comment is required');
        }
        if (question.handout && imagePrompt) {
          throw new Error('Only one handout can be generated');
        }
        const partCount = QUESTION_TYPE_CONFIG[question.type].partCount;
        const sanitizedQuestionParts = question.questionParts.map(
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
          value: {
            ...parseGameQuestion({
              ...question,
              questionParts,
              answerComment,
              ...(question.comment === null ? { comment: undefined } : {}),
              ...(question.handout === null ? { handout: undefined } : {}),
              ...(question.hostNotes === null ? { hostNotes: undefined } : {}),
            }),
            ...(imagePrompt?.trim() ? { imagePrompt: imagePrompt.trim() } : {}),
          },
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
