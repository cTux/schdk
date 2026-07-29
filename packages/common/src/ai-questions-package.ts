import { type AIQuestionsPackageQuestion } from './ai-questions-package-question.js';
import { MAX_AI_QUESTIONS_PACKAGE_BYTES } from './max-ai-questions-package-bytes.js';
import { parseAIQuestionsPackage } from './parse-ai-questions-package.js';
import { serializeAIQuestionsPackage } from './serialize-ai-questions-package.js';
import { parseAIQuestionsPackageArchive } from './parse-ai-questions-package-archive.js';

interface AIQuestionsPackage {
  name: string;
  context: string;
  questions: AIQuestionsPackageQuestion[];
  enabled: boolean;
  favorite: boolean;
}

export {
  type AIQuestionsPackageQuestion,
  type AIQuestionsPackage,
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackage,
  serializeAIQuestionsPackage,
  parseAIQuestionsPackageArchive,
};
