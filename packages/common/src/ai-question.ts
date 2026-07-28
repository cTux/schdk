import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export const AI_QUESTION_DIFFICULTIES = [
  'very-easy',
  'easy',
  'medium',
  'hard',
  'very-hard',
] as const;

export type AIQuestionDifficulty = (typeof AI_QUESTION_DIFFICULTIES)[number];

export interface AIQuestion {
  name: string;
  description: string;
  goodExamples: string;
  badExamples: string;
  enabled: boolean;
  favorite: boolean;
  generalRule: boolean;
}

const AI_QUESTION_ENTRY = 'ai-question.json';
export const MAX_AI_QUESTION_BYTES = 1024 * 1024;
const MAX_AI_QUESTION_JSON_BYTES = 512 * 1024;

export function parseAIQuestion(value: unknown): AIQuestion | null {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  return typeof question.name === 'string' &&
    Boolean(question.name.trim()) &&
    typeof question.description === 'string' &&
    Boolean(question.description.trim()) &&
    typeof question.goodExamples === 'string' &&
    typeof question.badExamples === 'string' &&
    typeof question.enabled === 'boolean' &&
    typeof question.favorite === 'boolean' &&
    (question.generalRule === undefined ||
      typeof question.generalRule === 'boolean')
    ? {
        name: question.name,
        description: question.description,
        goodExamples: question.goodExamples,
        badExamples: question.badExamples,
        enabled: question.enabled,
        favorite: question.favorite,
        generalRule: question.generalRule ?? false,
      }
    : null;
}

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
