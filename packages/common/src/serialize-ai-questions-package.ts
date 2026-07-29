import { strToU8, zipSync } from 'fflate';
import { type AIQuestionsPackage } from './ai-questions-package.js';
import { MAX_AI_QUESTIONS_PACKAGE_JSON_BYTES } from './max-ai-questions-package-json-bytes.js';
import { AI_QUESTIONS_PACKAGE_ENTRY } from './ai-questions-package-entry.js';
import { MAX_AI_QUESTIONS_PACKAGE_BYTES } from './max-ai-questions-package-bytes.js';

export function serializeAIQuestionsPackage(
  item: AIQuestionsPackage,
): Uint8Array {
  const content = strToU8(
    JSON.stringify(
      {
        format: 'schdk-ai-questions-package',
        version: 1,
        ...item,
        name: item.name.trim(),
        context: item.context.trim(),
        questions: item.questions.map((question) => ({
          questionNumber: question.questionNumber,
          ...(question.questionType?.trim()
            ? { questionType: question.questionType.trim() }
            : {}),
          context: question.context.trim(),
        })),
      },
      null,
      2,
    ),
  );
  if (content.byteLength > MAX_AI_QUESTIONS_PACKAGE_JSON_BYTES) {
    throw new Error('Invalid AI questions package');
  }
  const archive = zipSync({
    [AI_QUESTIONS_PACKAGE_ENTRY]: [content, { level: 9 }],
  });
  if (archive.byteLength > MAX_AI_QUESTIONS_PACKAGE_BYTES) {
    throw new Error('Invalid AI questions package');
  }
  return archive;
}
