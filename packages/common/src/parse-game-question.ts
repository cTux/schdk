import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from './ai-question.js';
import { type Handout } from './handout.js';
import { type GameQuestionType } from './game-question-type.js';
import { QUESTION_TYPE_CONFIG } from './question-type-config.js';
import { type AIQuestionGenerationMetadata } from './ai-question-generation-metadata.js';
import { type GameQuestion } from './game-question.js';

function isHandout(value: unknown): value is Handout {
  if (!value || typeof value !== 'object') return false;
  if ('kind' in value && value.kind === 'text') {
    return 'text' in value && typeof value.text === 'string';
  }
  const mimeType = 'mimeType' in value ? value.mimeType : undefined;
  const dataUrl = 'dataUrl' in value ? value.dataUrl : undefined;
  const hasImageKind = !('kind' in value) || value.kind === 'image';
  const hasValidName = 'name' in value && typeof value.name === 'string';
  const hasImageMimeType =
    typeof mimeType === 'string' && mimeType.startsWith('image/');
  const hasMatchingDataUrl =
    typeof dataUrl === 'string' &&
    dataUrl.startsWith(`data:${mimeType};base64,`);
  return hasImageKind && hasValidName && hasImageMimeType && hasMatchingDataUrl;
}

function isQuestionType(value: unknown): value is GameQuestionType {
  return typeof value === 'string' && value in QUESTION_TYPE_CONFIG;
}

function isAIQuestionGenerationMetadata(
  value: unknown,
): value is AIQuestionGenerationMetadata {
  if (!value || typeof value !== 'object') return false;
  const hasValidRule =
    'rule' in value &&
    typeof value.rule === 'string' &&
    Boolean(value.rule.trim());
  const hasValidDifficulty =
    'difficulty' in value &&
    typeof value.difficulty === 'string' &&
    AI_QUESTION_DIFFICULTIES.includes(value.difficulty as AIQuestionDifficulty);
  const hasValidRecognizability =
    'recognizability' in value &&
    typeof value.recognizability === 'string' &&
    AI_QUESTION_RECOGNIZABILITIES.includes(
      value.recognizability as AIQuestionRecognizability,
    );
  return hasValidRule && hasValidDifficulty && hasValidRecognizability;
}

function parseQuestionParts(value: object): {
  type: GameQuestionType;
  questionParts: string[];
} {
  const hasTypedQuestionParts =
    'type' in value &&
    isQuestionType(value.type) &&
    'questionParts' in value &&
    Array.isArray(value.questionParts) &&
    value.questionParts.length === QUESTION_TYPE_CONFIG[value.type].partCount &&
    value.questionParts.every((part: unknown) => typeof part === 'string');
  if (hasTypedQuestionParts) {
    return {
      type: value.type as GameQuestionType,
      questionParts: value.questionParts as string[],
    };
  }
  const hasLegacyQuestion =
    !('type' in value) &&
    'question' in value &&
    typeof value.question === 'string';
  if (hasLegacyQuestion) {
    return { type: 'standard', questionParts: [value.question as string] };
  }
  throw new Error('Invalid game question');
}

export function parseGameQuestion(value: unknown): GameQuestion {
  const isObject = !!value && typeof value === 'object';
  if (!isObject) throw new Error('Invalid game question');

  const hasAnswer = 'answer' in value && typeof value.answer === 'string';
  const hasAlternativeAnswers =
    'alternativeAnswers' in value &&
    Array.isArray(value.alternativeAnswers) &&
    value.alternativeAnswers.every(
      (answer: unknown) => typeof answer === 'string',
    );
  if (!hasAnswer || !hasAlternativeAnswers) {
    throw new Error('Invalid game question');
  }

  const { type, questionParts } = parseQuestionParts(value);
  const handout = 'handout' in value ? value.handout : undefined;
  const answerComment =
    'answerComment' in value ? value.answerComment : undefined;
  const wrongAnswers = 'wrongAnswers' in value ? value.wrongAnswers : [];
  const comment = 'comment' in value ? value.comment : undefined;
  const hostNotes = 'hostNotes' in value ? value.hostNotes : undefined;
  const aiGeneration = 'aiGeneration' in value ? value.aiGeneration : undefined;
  if (handout !== undefined && !isHandout(handout)) {
    throw new Error('Invalid game question');
  }
  const hasValidAnswerComment =
    answerComment === undefined || typeof answerComment === 'string';
  const hasValidWrongAnswers =
    Array.isArray(wrongAnswers) &&
    wrongAnswers.every((answer: unknown) => typeof answer === 'string');
  const hasValidComment = comment === undefined || typeof comment === 'string';
  const hasValidHostNotes =
    hostNotes === undefined || typeof hostNotes === 'string';
  const hasValidGenerationMetadata =
    aiGeneration === undefined || isAIQuestionGenerationMetadata(aiGeneration);
  if (
    !hasValidAnswerComment ||
    !hasValidWrongAnswers ||
    !hasValidComment ||
    !hasValidHostNotes ||
    !hasValidGenerationMetadata
  ) {
    throw new Error('Invalid game question');
  }

  return {
    type,
    questionParts,
    answer: value.answer as string,
    ...(answerComment !== undefined ? { answerComment } : {}),
    alternativeAnswers: value.alternativeAnswers as string[],
    wrongAnswers,
    ...(handout ? { handout } : {}),
    ...(comment !== undefined ? { comment } : {}),
    ...(hostNotes !== undefined ? { hostNotes } : {}),
    ...(aiGeneration !== undefined ? { aiGeneration } : {}),
  };
}
