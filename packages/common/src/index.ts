import {
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackage,
  parseAIQuestionsPackageArchive,
  serializeAIQuestionsPackage,
  type AIQuestionsPackage,
  type AIQuestionsPackageQuestion,
} from './contracts/ai-questions/ai-questions-package.js';
import {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
  compareFavoriteItemsByName,
  MAX_AI_QUESTION_BYTES,
  parseAIQuestion,
  parseAIQuestionArchive,
  serializeAIQuestion,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
} from './contracts/ai-questions/ai-question.js';
import {
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
  getGameQuestionAnswers,
  normalizeGameAnswer,
  parseGameQuestion,
  type AIQuestionGenerationMetadata,
  type GameQuestion,
  type GameQuestionType,
  type Handout,
  type ImageHandout,
  type TextHandout,
} from './contracts/game-questions/game-question.js';
import { hasGamePackageRemarks } from './validators/game-packages/game-package-validation.js';
import { QUESTION_COUNT } from './constants/game-questions/question-count.js';
import { QUESTIONS_PER_ROUND } from './constants/game-questions/questions-per-round.js';
import { MAX_GAME_PACKAGE_BYTES } from './constants/game-packages/max-game-package-bytes.js';
import { MAX_MUSIC_BREAK_BYTES } from './constants/music-breaks/max-music-break-bytes.js';
import { type GamePackage } from './types/game-packages/game-package.js';
import { type MusicBreak } from './types/music-breaks/music-break.js';
import { createEmptyGamePackage } from './factories/game-packages/create-empty-game-package.js';
import { validateGamePackage } from './validators/game-packages/validate-game-package.js';
import { serializeGamePackage } from './serializers/game-packages/serialize-game-package.js';
import { parseGamePackage } from './parsers/game-packages/parse-game-package.js';
import {
  DEFAULT_SCHDK_DICTIONARIES,
  MAX_SCHDK_DICTIONARY_BYTES,
  parseSchdkDictionary,
  parseSchdkDictionaryArchive,
  serializeSchdkDictionary,
  type SchdkDictionary,
  type SchdkDictionaryDistribution,
  type SchdkDictionaryId,
  type SchdkDictionaryItem,
} from './contracts/dictionaries/schdk-dictionary.js';

export {
  QUESTION_COUNT,
  QUESTIONS_PER_ROUND,
  MAX_GAME_PACKAGE_BYTES,
  MAX_MUSIC_BREAK_BYTES,
  type GamePackage,
  type MusicBreak,
  createEmptyGamePackage,
  validateGamePackage,
  serializeGamePackage,
  parseGamePackage,
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackage,
  parseAIQuestionsPackageArchive,
  serializeAIQuestionsPackage,
  type AIQuestionsPackage,
  type AIQuestionsPackageQuestion,
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
  compareFavoriteItemsByName,
  MAX_AI_QUESTION_BYTES,
  parseAIQuestion,
  parseAIQuestionArchive,
  serializeAIQuestion,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
  getGameQuestionAnswers,
  normalizeGameAnswer,
  parseGameQuestion,
  type AIQuestionGenerationMetadata,
  type GameQuestion,
  type GameQuestionType,
  type Handout,
  type ImageHandout,
  type TextHandout,
  hasGamePackageRemarks,
  DEFAULT_SCHDK_DICTIONARIES,
  MAX_SCHDK_DICTIONARY_BYTES,
  parseSchdkDictionary,
  parseSchdkDictionaryArchive,
  serializeSchdkDictionary,
  type SchdkDictionary,
  type SchdkDictionaryId,
  type SchdkDictionaryItem,
  type SchdkDictionaryDistribution,
};
