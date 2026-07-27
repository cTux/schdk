import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export interface AIQuestionsPackageQuestion {
  questionNumber: number;
  questionType?: string;
  context: string;
}

export interface AIQuestionsPackage {
  name: string;
  context: string;
  questions: AIQuestionsPackageQuestion[];
  enabled: boolean;
  favorite: boolean;
}

const AI_QUESTIONS_PACKAGE_ENTRY = 'ai-questions-package.json';
export const MAX_AI_QUESTIONS_PACKAGE_BYTES = 1024 * 1024;
const MAX_AI_QUESTIONS_PACKAGE_JSON_BYTES = 512 * 1024;

export function parseAIQuestionsPackage(
  value: unknown,
): AIQuestionsPackage | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const questions = Array.isArray(item.questions)
    ? item.questions.flatMap((question) => {
        if (!question || typeof question !== 'object') return [];
        const candidate = question as Record<string, unknown>;
        return Number.isSafeInteger(candidate.questionNumber) &&
          Number(candidate.questionNumber) >= 1 &&
          Number(candidate.questionNumber) <= 36 &&
          (candidate.questionType === undefined ||
            typeof candidate.questionType === 'string') &&
          typeof candidate.context === 'string' &&
          Boolean(candidate.context.trim())
          ? [
              {
                questionNumber: Number(candidate.questionNumber),
                ...(candidate.questionType?.toString().trim()
                  ? { questionType: candidate.questionType.toString() }
                  : {}),
                context: candidate.context,
              },
            ]
          : [];
      })
    : [];
  return typeof item.name === 'string' &&
    Boolean(item.name.trim()) &&
    typeof item.context === 'string' &&
    Boolean(item.context.trim()) &&
    Array.isArray(item.questions) &&
    questions.length === item.questions.length &&
    typeof item.enabled === 'boolean' &&
    typeof item.favorite === 'boolean'
    ? {
        name: item.name,
        context: item.context,
        questions,
        enabled: item.enabled,
        favorite: item.favorite,
      }
    : null;
}

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
