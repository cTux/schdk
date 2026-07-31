import { AI_QUESTION_DIFFICULTIES } from '../../constants/ai-questions/ai-question-difficulties.js';
import { type AIQuestionDifficulty } from '../../types/ai-questions/ai-question-difficulty.js';
import { AI_QUESTION_RECOGNIZABILITIES } from '../../constants/ai-questions/ai-question-recognizabilities.js';
import { type AIQuestionRecognizability } from '../../types/ai-questions/ai-question-recognizability.js';
import { compareFavoriteItemsByName } from '../../utils/ai-questions/compare-favorite-items-by-name.js';
import { MAX_AI_QUESTION_BYTES } from '../../constants/ai-questions/max-ai-question-bytes.js';
import { parseAIQuestion } from '../../parsers/ai-questions/parse-ai-question.js';
import { serializeAIQuestion } from '../../serializers/ai-questions/serialize-ai-question.js';
import { parseAIQuestionArchive } from '../../parsers/ai-questions/parse-ai-question-archive.js';

interface AIQuestion {
  name: string;
  description: string;
  goodExamples: string;
  badExamples: string;
  enabled: boolean;
  favorite: boolean;
  generalRule: boolean;
}

export {
  AI_QUESTION_DIFFICULTIES,
  type AIQuestionDifficulty,
  AI_QUESTION_RECOGNIZABILITIES,
  type AIQuestionRecognizability,
  type AIQuestion,
  compareFavoriteItemsByName,
  MAX_AI_QUESTION_BYTES,
  parseAIQuestion,
  serializeAIQuestion,
  parseAIQuestionArchive,
};
