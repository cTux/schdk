import { AI_QUESTION_DIFFICULTIES } from './ai-question-difficulties.js';
import { type AIQuestionDifficulty } from './ai-question-difficulty.js';
import { AI_QUESTION_RECOGNIZABILITIES } from './ai-question-recognizabilities.js';
import { type AIQuestionRecognizability } from './ai-question-recognizability.js';
import { compareFavoriteItemsByName } from './compare-favorite-items-by-name.js';
import { MAX_AI_QUESTION_BYTES } from './max-ai-question-bytes.js';
import { parseAIQuestion } from './parse-ai-question.js';
import { serializeAIQuestion } from './serialize-ai-question.js';
import { parseAIQuestionArchive } from './parse-ai-question-archive.js';

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
