import { type GameQuestionType } from '../../types/game-questions/game-question-type.js';
import { type Handout } from '../../types/game-questions/handout.js';
import { type AIQuestionGenerationMetadata } from '../../types/ai-questions/ai-question-generation-metadata.js';
import { type ImageHandout } from '../../types/game-questions/image-handout.js';
import { type TextHandout } from '../../types/game-questions/text-handout.js';
import { QUESTION_TYPE_CONFIG } from '../../constants/game-questions/question-type-config.js';
import { normalizeGameAnswer } from '../../utils/game-questions/normalize-game-answer.js';
import { getGameQuestionAnswers } from '../../utils/game-questions/get-game-question-answers.js';
import { createEmptyGameQuestion } from '../../factories/game-questions/create-empty-game-question.js';
import { parseGameQuestion } from '../../parsers/game-questions/parse-game-question.js';
import { serializeGameQuestion } from '../../serializers/game-questions/serialize-game-question.js';

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
