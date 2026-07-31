import { type AIQuestionsPackageQuestion } from '../../types/ai-questions/ai-questions-package-question.js';
import { MAX_AI_QUESTIONS_PACKAGE_BYTES } from '../../constants/ai-questions/max-ai-questions-package-bytes.js';
import { parseAIQuestionsPackage } from '../../parsers/ai-questions/parse-ai-questions-package.js';
import { serializeAIQuestionsPackage } from '../../serializers/ai-questions/serialize-ai-questions-package.js';
import { parseAIQuestionsPackageArchive } from '../../parsers/ai-questions/parse-ai-questions-package-archive.js';

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
