import { strFromU8, unzipSync } from 'fflate';
import { type AIQuestion } from './ai-question.js';
import { MAX_AI_QUESTION_BYTES } from './max-ai-question-bytes.js';
import { AI_QUESTION_ENTRY } from './ai-question-entry.js';
import { MAX_AI_QUESTION_JSON_BYTES } from './max-ai-question-json-bytes.js';
import { parseAIQuestion } from './parse-ai-question.js';

export function parseAIQuestionArchive(content: Uint8Array): AIQuestion {
  if (
    content.byteLength > MAX_AI_QUESTION_BYTES ||
    content[0] !== 0x50 ||
    content[1] !== 0x4b
  ) {
    throw new Error('Invalid AI question');
  }
  let entry: Uint8Array | undefined;
  let found = false;
  try {
    entry = unzipSync(content, {
      filter: ({ name, originalSize }) => {
        if (name !== AI_QUESTION_ENTRY) return false;
        if (found || originalSize > MAX_AI_QUESTION_JSON_BYTES) {
          throw new Error('Invalid AI question');
        }
        found = true;
        return true;
      },
    })[AI_QUESTION_ENTRY];
  } catch {
    throw new Error('Invalid AI question');
  }
  if (!entry) throw new Error('Invalid AI question');
  const value: unknown = JSON.parse(strFromU8(entry));
  if (
    !value ||
    typeof value !== 'object' ||
    (value as Record<string, unknown>).format !== 'schdk-ai-question' ||
    (value as Record<string, unknown>).version !== 1
  ) {
    throw new Error('Invalid AI question');
  }
  const question = parseAIQuestion(value);
  if (!question) throw new Error('Invalid AI question');
  return question;
}
