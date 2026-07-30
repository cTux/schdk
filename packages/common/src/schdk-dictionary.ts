import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import {
  AI_QUESTION_DIFFICULTIES,
  type AIQuestionDifficulty,
} from './ai-question.js';

const SCHDK_DICTIONARY_ENTRY = 'dictionary.json';
const MAX_SCHDK_DICTIONARY_BYTES = 256 * 1024;
const MAX_SCHDK_DICTIONARY_JSON_BYTES = 128 * 1024;

type SchdkDictionaryId = 'question-difficulty' | 'question-recognizability';

interface SchdkDictionaryItem {
  value: AIQuestionDifficulty;
  name: string;
  description: string;
  promptPart: string;
}

interface SchdkDictionary {
  id: SchdkDictionaryId;
  name: string;
  description: string;
  items: SchdkDictionaryItem[];
}

const DEFAULT_SCHDK_DICTIONARIES: readonly SchdkDictionary[] = [
  {
    id: 'question-difficulty',
    name: 'Складність питань',
    description: 'Рівень складності розв’язання питання.',
    items: [
      {
        value: 'very-easy',
        name: 'Дуже легка',
        description: 'Майже пряме прочитання питання.',
        promptPart:
          '0–1 очевидний бар’єр розв’язання та майже пряме прочитання.',
      },
      {
        value: 'easy',
        name: 'Легка',
        description: 'Прості зв’язки та сильна перевірочна підказка.',
        promptPart:
          '1–2 прості бар’єри розв’язання, очевидна асоціація та сильна перевірочна підказка.',
      },
      {
        value: 'medium',
        name: 'Середня',
        description: 'Кілька помірних кроків розв’язання.',
        promptPart:
          '2–3 помірні бар’єри розв’язання або один небуквальний перехід.',
      },
      {
        value: 'hard',
        name: 'Складна',
        description: 'Кілька взаємозалежних складних кроків.',
        promptPart:
          '3–4 взаємозалежні бар’єри розв’язання або складний перехід між темами.',
      },
      {
        value: 'very-hard',
        name: 'Дуже складна',
        description: 'Багато бар’єрів із достатніми опорами.',
        promptPart:
          'Щонайменше 4 бар’єри або 2 складні переходи; усі потрібні опори мають бути присутні, а відповідь — однозначна.',
      },
    ],
  },
  {
    id: 'question-recognizability',
    name: 'Впізнаваність питань',
    description: 'Рівень відомості відповіді для цільової аудиторії.',
    items: [
      {
        value: 'very-easy',
        name: 'Дуже легка',
        description: 'Відповідь знає майже вся аудиторія.',
        promptPart:
          'Обери загальновідому сутність, яку впізнає майже вся цільова аудиторія.',
      },
      {
        value: 'easy',
        name: 'Легка',
        description: 'Відповідь відома більшості аудиторії.',
        promptPart:
          'Обери широко відому сутність, знайому більшості аудиторії без спеціалізованих знань.',
      },
      {
        value: 'medium',
        name: 'Середня',
        description: 'Відповідь відома значній частині аудиторії.',
        promptPart:
          'Обери помірно відому сутність, знайому значній частині аудиторії; підказки мають дозволяти вивести відповідь без миттєвого впізнавання.',
      },
      {
        value: 'hard',
        name: 'Складна',
        description: 'Відповідь переважно відома знавцям теми.',
        promptPart:
          'Обери менш відому, але значущу сутність, переважно знайому людям, які цікавляться відповідною сферою; дай достатньо опор для інших гравців.',
      },
      {
        value: 'very-hard',
        name: 'Дуже складна',
        description: 'Відповідь нішова, але значуща.',
        promptPart:
          'Обери нішеву або спеціалізовану, але культурно чи тематично значущу сутність, а не випадковий маловідомий факт; усі потрібні для виведення опори мають бути в питанні.',
      },
    ],
  },
];

function parseSchdkDictionary(value: unknown): SchdkDictionary | null {
  if (!value || typeof value !== 'object') return null;
  const dictionary = value as Record<string, unknown>;
  const hasValidId =
    dictionary.id === 'question-difficulty' ||
    dictionary.id === 'question-recognizability';
  const items = Array.isArray(dictionary.items) ? dictionary.items : [];
  const parsedItems = items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    const hasValidValue =
      typeof candidate.value === 'string' &&
      AI_QUESTION_DIFFICULTIES.includes(
        candidate.value as AIQuestionDifficulty,
      );
    const textFields = ['name', 'description', 'promptPart'] as const;
    const hasValidText = textFields.every(
      (field) =>
        typeof candidate[field] === 'string' &&
        candidate[field].trim().length > 0 &&
        candidate[field].length <= 20_000,
    );
    return hasValidValue && hasValidText
      ? [
          {
            value: candidate.value as AIQuestionDifficulty,
            name: (candidate.name as string).trim(),
            description: (candidate.description as string).trim(),
            promptPart: (candidate.promptPart as string).trim(),
          },
        ]
      : [];
  });
  const hasEveryValue =
    parsedItems.length === AI_QUESTION_DIFFICULTIES.length &&
    AI_QUESTION_DIFFICULTIES.every(
      (value) =>
        parsedItems.filter((item) => item.value === value).length === 1,
    ) &&
    parsedItems.every(
      (item, index) => item.value === AI_QUESTION_DIFFICULTIES[index],
    );
  const hasValidMetadata =
    hasValidId &&
    typeof dictionary.name === 'string' &&
    Boolean(dictionary.name.trim()) &&
    dictionary.name.length <= 500 &&
    typeof dictionary.description === 'string' &&
    Boolean(dictionary.description.trim()) &&
    dictionary.description.length <= 5_000;
  return hasValidMetadata && hasEveryValue
    ? {
        id: dictionary.id as SchdkDictionaryId,
        name: (dictionary.name as string).trim(),
        description: (dictionary.description as string).trim(),
        items: parsedItems,
      }
    : null;
}

function serializeSchdkDictionary(dictionary: SchdkDictionary): Uint8Array {
  const parsed = parseSchdkDictionary(dictionary);
  if (!parsed) throw new Error('Invalid SCHDK dictionary');
  const content = strToU8(
    JSON.stringify(
      { format: 'schdk-dictionary', version: 1, ...parsed },
      null,
      2,
    ),
  );
  if (content.byteLength > MAX_SCHDK_DICTIONARY_JSON_BYTES) {
    throw new Error('Invalid SCHDK dictionary');
  }
  const archive = zipSync({
    [SCHDK_DICTIONARY_ENTRY]: [content, { level: 9 }],
  });
  if (archive.byteLength > MAX_SCHDK_DICTIONARY_BYTES) {
    throw new Error('Invalid SCHDK dictionary');
  }
  return archive;
}

function parseSchdkDictionaryArchive(content: Uint8Array): SchdkDictionary {
  if (
    content.byteLength > MAX_SCHDK_DICTIONARY_BYTES ||
    content[0] !== 0x50 ||
    content[1] !== 0x4b
  ) {
    throw new Error('Invalid SCHDK dictionary');
  }
  let entry: Uint8Array | undefined;
  let found = false;
  try {
    entry = unzipSync(content, {
      filter: ({ name, originalSize }) => {
        if (name !== SCHDK_DICTIONARY_ENTRY) return false;
        if (found || originalSize > MAX_SCHDK_DICTIONARY_JSON_BYTES) {
          throw new Error('Invalid SCHDK dictionary');
        }
        found = true;
        return true;
      },
    })[SCHDK_DICTIONARY_ENTRY];
  } catch {
    throw new Error('Invalid SCHDK dictionary');
  }
  if (!entry) throw new Error('Invalid SCHDK dictionary');
  const value: unknown = JSON.parse(strFromU8(entry));
  const archive = value as Record<string, unknown>;
  const dictionary =
    value &&
    typeof value === 'object' &&
    archive.format === 'schdk-dictionary' &&
    archive.version === 1
      ? parseSchdkDictionary(value)
      : null;
  if (!dictionary) throw new Error('Invalid SCHDK dictionary');
  return dictionary;
}

export {
  DEFAULT_SCHDK_DICTIONARIES,
  MAX_SCHDK_DICTIONARY_BYTES,
  parseSchdkDictionary,
  parseSchdkDictionaryArchive,
  serializeSchdkDictionary,
  type SchdkDictionary,
  type SchdkDictionaryId,
  type SchdkDictionaryItem,
};
