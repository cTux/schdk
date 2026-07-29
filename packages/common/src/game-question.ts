import { type GameQuestionType } from './game-question-type.js';
import { type Handout } from './handout.js';
import { type AIQuestionGenerationMetadata } from './ai-question-generation-metadata.js';
import { type ImageHandout } from './image-handout.js';
import { type TextHandout } from './text-handout.js';
import { QUESTION_TYPE_CONFIG } from './question-type-config.js';
import { normalizeGameAnswer } from './normalize-game-answer.js';
import { getGameQuestionAnswers } from './get-game-question-answers.js';
import { createEmptyGameQuestion } from './create-empty-game-question.js';
import { parseGameQuestion } from './parse-game-question.js';
import { serializeGameQuestion } from './serialize-game-question.js';

interface GameQuestion {
  type: GameQuestionType;
  questionParts: string[];
  answer: string;
  answerComment?: string;
  alternativeAnswers: string[];
  wrongAnswers: string[];
  handout?: Handout;
  comment?: string;
  hostNotes?: string;
  aiGeneration?: AIQuestionGenerationMetadata;
}

export {
  type ImageHandout,
  type TextHandout,
  type Handout,
  QUESTION_TYPE_CONFIG,
  type GameQuestionType,
  type AIQuestionGenerationMetadata,
  type GameQuestion,
  normalizeGameAnswer,
  getGameQuestionAnswers,
  createEmptyGameQuestion,
  parseGameQuestion,
  serializeGameQuestion,
};
