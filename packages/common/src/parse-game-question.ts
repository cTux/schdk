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
  return (
    (!('kind' in value) || value.kind === 'image') &&
    'name' in value &&
    typeof value.name === 'string' &&
    typeof mimeType === 'string' &&
    mimeType.startsWith('image/') &&
    typeof dataUrl === 'string' &&
    dataUrl.startsWith(`data:${mimeType};base64,`)
  );
}

function isQuestionType(value: unknown): value is GameQuestionType {
  return typeof value === 'string' && value in QUESTION_TYPE_CONFIG;
}

function isAIQuestionGenerationMetadata(
  value: unknown,
): value is AIQuestionGenerationMetadata {
  return (
    !!value &&
    typeof value === 'object' &&
    'rule' in value &&
    typeof value.rule === 'string' &&
    !!value.rule.trim() &&
    'difficulty' in value &&
    typeof value.difficulty === 'string' &&
    AI_QUESTION_DIFFICULTIES.includes(
      value.difficulty as AIQuestionDifficulty,
    ) &&
    'recognizability' in value &&
    typeof value.recognizability === 'string' &&
    AI_QUESTION_RECOGNIZABILITIES.includes(
      value.recognizability as AIQuestionRecognizability,
    )
  );
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
  const wrongAnswers = 'wrongAnswers' in value ? value.wrongAnswers : [];
  const comment = 'comment' in value ? value.comment : undefined;
  const hostNotes = 'hostNotes' in value ? value.hostNotes : undefined;
  const aiGeneration = 'aiGeneration' in value ? value.aiGeneration : undefined;
  if (handout !== undefined && !isHandout(handout)) {
    throw new Error('Invalid game question');
  }
  if (
    (answerComment !== undefined && typeof answerComment !== 'string') ||
    !Array.isArray(wrongAnswers) ||
    !wrongAnswers.every((answer: unknown) => typeof answer === 'string') ||
    (comment !== undefined && typeof comment !== 'string') ||
    (hostNotes !== undefined && typeof hostNotes !== 'string') ||
    (aiGeneration !== undefined &&
      !isAIQuestionGenerationMetadata(aiGeneration))
  ) {
    throw new Error('Invalid game question');
  }

  return {
    type,
    questionParts,
    answer: value.answer,
    ...(answerComment !== undefined ? { answerComment } : {}),
    alternativeAnswers: value.alternativeAnswers,
    wrongAnswers,
    ...(handout ? { handout } : {}),
    ...(comment !== undefined ? { comment } : {}),
    ...(hostNotes !== undefined ? { hostNotes } : {}),
    ...(aiGeneration !== undefined ? { aiGeneration } : {}),
  };
}
