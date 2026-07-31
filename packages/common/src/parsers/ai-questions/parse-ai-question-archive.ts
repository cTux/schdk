import { strFromU8, unzipSync } from 'fflate';
import { type AIQuestion } from '../../contracts/ai-questions/ai-question.js';
import { MAX_AI_QUESTION_BYTES } from '../../constants/ai-questions/max-ai-question-bytes.js';
import { AI_QUESTION_ENTRY } from '../../types/ai-questions/ai-question-entry.js';
import { MAX_AI_QUESTION_JSON_BYTES } from '../../constants/ai-questions/max-ai-question-json-bytes.js';
import { parseAIQuestion } from './parse-ai-question.js';

export function parseAIQuestionArchive(content: Uint8Array): AIQuestion {
  const hasAcceptableArchiveSize = content.byteLength <= MAX_AI_QUESTION_BYTES;
  const hasZipSignature = content[0] === 0x50 && content[1] === 0x4b;
  if (!hasAcceptableArchiveSize || !hasZipSignature) {
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
  const isObject = !!value && typeof value === 'object';
  const archive = value as Record<string, unknown>;
  const hasExpectedIdentity =
    isObject && archive.format === 'schdk-ai-question' && archive.version === 1;
  if (!hasExpectedIdentity) {
    throw new Error('Invalid AI question');
  }
  const question = parseAIQuestion(value);
  if (!question) throw new Error('Invalid AI question');
  return question;
}
