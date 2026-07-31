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
import { DEFAULT_GAME_LAYOUT } from './constants/game-options/default-game-layout.js';
import { DEFAULT_GAME_OPTIONS } from './constants/game-options/default-game-options.js';
import { GAME_IMAGE_POSITIONS } from './constants/game-options/game-image-positions.js';
import { GAME_LAYOUT_ELEMENT_IDS } from './constants/game-options/game-layout-element-ids.js';
import { MAX_CUSTOM_GAME_ELEMENTS } from './constants/game-options/max-custom-game-elements.js';
import { MAX_CUSTOM_IMAGE_DATA_LENGTH } from './constants/game-options/max-custom-image-data-length.js';
import { getDefaultCustomElementPosition } from './factories/game-options/get-default-custom-element-position.js';
import { type CustomGameElement } from './types/game-options/custom-game-element.js';
import { type CustomImageElement } from './types/game-options/custom-image-element.js';
import { type CustomTextElement } from './types/game-options/custom-text-element.js';
import { type GameImagePosition } from './types/game-options/game-image-position.js';
import { type GameLayout } from './types/game-options/game-layout.js';
import { type GameLayoutElementId } from './types/game-options/game-layout-element-id.js';
import { type GameLayoutPosition } from './types/game-options/game-layout-position.js';
import { type GameOptions } from './types/game-options/game-options.js';
import { type GameTextGrowDirection } from './types/game-options/game-text-grow-direction.js';
import { normalizeGameOptions } from './validators/game-options/normalize-game-options.js';
import {
  MAX_VISUAL_TEMPLATE_BYTES,
  VISUAL_TEMPLATE_ENTRY,
  parseVisualEditorTemplate,
  serializeVisualEditorTemplate,
} from './contracts/game-options/visual-editor-template.js';

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
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  GAME_IMAGE_POSITIONS,
  GAME_LAYOUT_ELEMENT_IDS,
  MAX_CUSTOM_GAME_ELEMENTS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
  getDefaultCustomElementPosition,
  type CustomGameElement,
  type CustomImageElement,
  type CustomTextElement,
  type GameImagePosition,
  type GameLayout,
  type GameLayoutElementId,
  type GameLayoutPosition,
  type GameOptions,
  type GameTextGrowDirection,
  normalizeGameOptions,
  MAX_VISUAL_TEMPLATE_BYTES,
  VISUAL_TEMPLATE_ENTRY,
  parseVisualEditorTemplate,
  serializeVisualEditorTemplate,
};
