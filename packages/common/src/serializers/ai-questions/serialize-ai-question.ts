import { strToU8, zipSync } from 'fflate';
import { type AIQuestion } from '../../contracts/ai-questions/ai-question.js';
import { MAX_AI_QUESTION_JSON_BYTES } from '../../constants/ai-questions/max-ai-question-json-bytes.js';
import { AI_QUESTION_ENTRY } from '../../types/ai-questions/ai-question-entry.js';
import { MAX_AI_QUESTION_BYTES } from '../../constants/ai-questions/max-ai-question-bytes.js';

export function serializeAIQuestion(question: AIQuestion): Uint8Array {
  const content = strToU8(
    JSON.stringify(
      {
        format: 'schdk-ai-question',
        version: 1,
        ...question,
        name: question.name.trim(),
        description: question.description.trim(),
        goodExamples: question.goodExamples.trim(),
        badExamples: question.badExamples.trim(),
      },
      null,
      2,
    ),
  );
  if (content.byteLength > MAX_AI_QUESTION_JSON_BYTES) {
    throw new Error('Invalid AI question');
  }
  const archive = zipSync({ [AI_QUESTION_ENTRY]: [content, { level: 9 }] });
  if (archive.byteLength > MAX_AI_QUESTION_BYTES) {
    throw new Error('Invalid AI question');
  }
  return archive;
}
