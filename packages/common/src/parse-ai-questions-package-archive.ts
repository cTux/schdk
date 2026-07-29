import { strFromU8, unzipSync } from 'fflate';
import { type AIQuestionsPackage } from './ai-questions-package.js';
import { MAX_AI_QUESTIONS_PACKAGE_BYTES } from './max-ai-questions-package-bytes.js';
import { AI_QUESTIONS_PACKAGE_ENTRY } from './ai-questions-package-entry.js';
import { MAX_AI_QUESTIONS_PACKAGE_JSON_BYTES } from './max-ai-questions-package-json-bytes.js';
import { parseAIQuestionsPackage } from './parse-ai-questions-package.js';

export function parseAIQuestionsPackageArchive(
  content: Uint8Array,
): AIQuestionsPackage {
  if (
    content.byteLength > MAX_AI_QUESTIONS_PACKAGE_BYTES ||
    content[0] !== 0x50 ||
    content[1] !== 0x4b
  ) {
    throw new Error('Invalid AI questions package');
  }
  let entry: Uint8Array | undefined;
  let found = false;
  try {
    entry = unzipSync(content, {
      filter: ({ name, originalSize }) => {
        if (name !== AI_QUESTIONS_PACKAGE_ENTRY) return false;
        if (found || originalSize > MAX_AI_QUESTIONS_PACKAGE_JSON_BYTES) {
          throw new Error('Invalid AI questions package');
        }
        found = true;
        return true;
      },
    })[AI_QUESTIONS_PACKAGE_ENTRY];
  } catch {
    throw new Error('Invalid AI questions package');
  }
  if (!entry) throw new Error('Invalid AI questions package');
  const value: unknown = JSON.parse(strFromU8(entry));
  if (
    !value ||
    typeof value !== 'object' ||
    (value as Record<string, unknown>).format !==
      'schdk-ai-questions-package' ||
    (value as Record<string, unknown>).version !== 1
  ) {
    throw new Error('Invalid AI questions package');
  }
  const item = parseAIQuestionsPackage(value);
  if (!item) throw new Error('Invalid AI questions package');
  return item;
}
