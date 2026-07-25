export interface ImageHandout {
  kind?: 'image';
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface TextHandout {
  kind: 'text';
  text: string;
}

export type Handout = ImageHandout | TextHandout;

export const QUESTION_TYPE_CONFIG = {
  standard: { partCount: 1, seconds: 60 },
  'blitz-2x30': { partCount: 2, seconds: 30 },
  'blitz-3x20': { partCount: 3, seconds: 20 },
} as const;

export type GameQuestionType = keyof typeof QUESTION_TYPE_CONFIG;

export interface GameQuestion {
  type: GameQuestionType;
  questionParts: string[];
  answer: string;
  answerComment?: string;
  alternativeAnswers: string[];
  handout?: Handout;
  comment?: string;
  hostNotes?: string;
}

function isHandout(value: unknown): value is Handout {
  if (!value || typeof value !== 'object') return false;
  if ('kind' in value && value.kind === 'text') {
    return 'text' in value && typeof value.text === 'string';
  }
  return (
    (!('kind' in value) || value.kind === 'image') &&
    'name' in value &&
    typeof value.name === 'string' &&
    'mimeType' in value &&
    typeof value.mimeType === 'string' &&
    'dataUrl' in value &&
    typeof value.dataUrl === 'string'
  );
}

function isQuestionType(value: unknown): value is GameQuestionType {
  return typeof value === 'string' && value in QUESTION_TYPE_CONFIG;
}

function parseQuestionParts(value: object): {
  type: GameQuestionType;
  questionParts: string[];
} {
  if (
    'type' in value &&
    isQuestionType(value.type) &&
    'questionParts' in value &&
    Array.isArray(value.questionParts) &&
    value.questionParts.length === QUESTION_TYPE_CONFIG[value.type].partCount &&
    value.questionParts.every((part: unknown) => typeof part === 'string')
  ) {
    return { type: value.type, questionParts: value.questionParts };
  }
  if (
    !('type' in value) &&
    'question' in value &&
    typeof value.question === 'string'
  ) {
    return { type: 'standard', questionParts: [value.question] };
  }
  throw new Error('Invalid game question');
}

export function createEmptyGameQuestion(): GameQuestion {
  return {
    type: 'standard',
    questionParts: [''],
    answer: '',
    alternativeAnswers: [],
  };
}

export function parseGameQuestion(value: unknown): GameQuestion {
  if (
    !value ||
    typeof value !== 'object' ||
    !('answer' in value) ||
    typeof value.answer !== 'string' ||
    !('alternativeAnswers' in value) ||
    !Array.isArray(value.alternativeAnswers) ||
    !value.alternativeAnswers.every(
      (answer: unknown) => typeof answer === 'string',
    )
  ) {
    throw new Error('Invalid game question');
  }

  const { type, questionParts } = parseQuestionParts(value);
  const handout = 'handout' in value ? value.handout : undefined;
  const answerComment =
    'answerComment' in value ? value.answerComment : undefined;
  const comment = 'comment' in value ? value.comment : undefined;
  const hostNotes = 'hostNotes' in value ? value.hostNotes : undefined;
  if (handout !== undefined && !isHandout(handout)) {
    throw new Error('Invalid game question');
  }
  if (
    (answerComment !== undefined && typeof answerComment !== 'string') ||
    (comment !== undefined && typeof comment !== 'string') ||
    (hostNotes !== undefined && typeof hostNotes !== 'string')
  ) {
    throw new Error('Invalid game question');
  }

  return {
    type,
    questionParts,
    answer: value.answer,
    ...(answerComment !== undefined ? { answerComment } : {}),
    alternativeAnswers: value.alternativeAnswers,
    ...(handout ? { handout } : {}),
    ...(comment !== undefined ? { comment } : {}),
    ...(hostNotes !== undefined ? { hostNotes } : {}),
  };
}

export function serializeGameQuestion(question: GameQuestion) {
  const handout =
    question.handout?.kind === 'text'
      ? {
          kind: 'text' as const,
          text: question.handout.text.trim(),
        }
      : question.handout;
  return {
    type: question.type,
    questionParts: question.questionParts.map((part) => part.trim()),
    answer: question.answer.trim(),
    ...(question.answerComment?.trim()
      ? { answerComment: question.answerComment.trim() }
      : {}),
    alternativeAnswers: question.alternativeAnswers
      .map((answer) => answer.trim())
      .filter(Boolean),
    ...(handout && (handout.kind !== 'text' || handout.text)
      ? { handout }
      : {}),
    ...(question.comment?.trim() ? { comment: question.comment.trim() } : {}),
    ...(question.hostNotes?.trim()
      ? { hostNotes: question.hostNotes.trim() }
      : {}),
  };
}
