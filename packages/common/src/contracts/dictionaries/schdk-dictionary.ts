import { strToU8, zipSync } from 'fflate';
import {
  AI_QUESTION_DIFFICULTIES,
  type AIQuestionDifficulty,
} from '../ai-questions/ai-question.js';
import { createDistributionDictionary } from './dictionary-distributions.js';
import { createScaleDictionary } from './dictionary-scales.js';

const SCHDK_DICTIONARY_ENTRY = 'dictionary.json';
const MAX_SCHDK_DICTIONARY_BYTES = 256 * 1024;
const MAX_SCHDK_DICTIONARY_JSON_BYTES = 128 * 1024;
type SchdkDictionaryId =
  | 'question-difficulty'
  | 'question-recognizability'
  | 'question-difficulty-distribution'
  | 'question-recognizability-distribution';

type SchdkDictionaryDistribution = Record<AIQuestionDifficulty, number>;
interface SchdkDictionaryItem {
  id?: string;
  value: AIQuestionDifficulty;
  name: string;
  description: string;
  promptPart?: string;
  distribution?: SchdkDictionaryDistribution;
}

interface SchdkDictionary {
  id: SchdkDictionaryId;
  name: string;
  description: string;
  items: SchdkDictionaryItem[];
}
const DEFAULT_QUESTION_DIFFICULTY: SchdkDictionary = createScaleDictionary(
  'question-difficulty',
  'Складність питань',
  'Рівень складності розв’язання питання.',
  {
    'very-easy': [
      'Дуже легка',
      'Майже пряме прочитання питання.',
      'Майже очевидна відповідь із 0–1 бар’єром.',
    ],
    easy: [
      'Легка',
      'Прості зв’язки та сильна перевірочна підказка.',
      'Очевидна асоціація з 1–2 простими бар’єрами.',
    ],
    medium: [
      'Середня',
      'Кілька помірних кроків розв’язання.',
      'Потрібно 2–3 помірні бар’єри або один небуквальний перехід.',
    ],
    hard: [
      'Складна',
      'Кілька взаємозалежних складних кроків.',
      'Потрібно 3–4 взаємозалежні бар’єри або складний перехід між темами.',
    ],
    'very-hard': [
      'Дуже складна',
      'Багато бар’єрів із достатніми опорами.',
      'Потрібні щонайменше 4 бар’єри або 2 складні переходи.',
    ],
  },
);
const DEFAULT_QUESTION_RECOGNIZABILITY: SchdkDictionary = createScaleDictionary(
  'question-recognizability',
  'Впізнаваність питань',
  'Рівень відомості відповіді для цільової аудиторії.',
  {
    'very-easy': [
      'Дуже легка',
      'Відповідь знає майже вся аудиторія.',
      'Обери загальновідому сутність, яку впізнає майже вся аудиторія.',
    ],
    easy: [
      'Легка',
      'Відповідь відома більшості аудиторії.',
      'Обери широко відому сутність без спеціалізованих знань.',
    ],
    medium: [
      'Середня',
      'Відповідь відома значній частині аудиторії.',
      'Обери помірно відому сутність і дай достатні підказки.',
    ],
    hard: [
      'Складна',
      'Відповідь переважно відома знавцям теми.',
      'Обери менш відому, але значущу сутність із опорами для інших гравців.',
    ],
    'very-hard': [
      'Дуже складна',
      'Відповідь нішова, але значуща.',
      'Обери нішову або спеціалізовану культурно чи тематично значущу сутність.',
    ],
  },
);

const DEFAULT_SCHDK_DICTIONARIES: readonly SchdkDictionary[] = [
  DEFAULT_QUESTION_DIFFICULTY,
  DEFAULT_QUESTION_RECOGNIZABILITY,
  createDistributionDictionary(
    'question-difficulty-distribution',
    'Розподілення складності',
    'Профілі розподілення питань за складністю.',
    DEFAULT_QUESTION_DIFFICULTY,
  ),
  createDistributionDictionary(
    'question-recognizability-distribution',
    'Розподілення впізнаваності',
    'Профілі розподілення питань за впізнаваністю.',
    DEFAULT_QUESTION_RECOGNIZABILITY,
  ),
];

function parseSchdkDictionary(value: unknown): SchdkDictionary | null {
  if (!value || typeof value !== 'object') return null;
  const dictionary = value as Record<string, unknown>;
  const hasValidId =
    dictionary.id === 'question-difficulty' ||
    dictionary.id === 'question-recognizability' ||
    dictionary.id === 'question-difficulty-distribution' ||
    dictionary.id === 'question-recognizability-distribution';
  const isDistributionDictionary =
    dictionary.id === 'question-difficulty-distribution' ||
    dictionary.id === 'question-recognizability-distribution';
  const items = Array.isArray(dictionary.items) ? dictionary.items : [];
  const parsedItems = items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    const hasValidValue =
      typeof candidate.value === 'string' &&
      AI_QUESTION_DIFFICULTIES.includes(
        candidate.value as AIQuestionDifficulty,
      );
    const textFields = isDistributionDictionary
      ? (['name', 'description'] as const)
      : (['name', 'description', 'promptPart'] as const);
    const hasValidText = textFields.every(
      (field) =>
        typeof candidate[field] === 'string' &&
        candidate[field].trim().length > 0 &&
        candidate[field].length <= 20_000,
    );
    const distribution = candidate.distribution as
      | Record<string, unknown>
      | undefined;
    const hasValidDistribution =
      distribution === undefined ||
      (distribution &&
        AI_QUESTION_DIFFICULTIES.every(
          (value) =>
            typeof distribution[value] === 'number' &&
            distribution[value] >= 0 &&
            distribution[value] <= 100,
        ) &&
        Object.values(distribution).reduce<number>(
          (total, value) => total + Number(value),
          0,
        ) === 100);
    return hasValidValue && hasValidText && hasValidDistribution
      ? [
          {
            id:
              typeof candidate.id === 'string'
                ? candidate.id.trim()
                : (candidate.value as string),
            value: candidate.value as AIQuestionDifficulty,
            name: (candidate.name as string).trim(),
            description: (candidate.description as string).trim(),
            ...(!isDistributionDictionary
              ? { promptPart: (candidate.promptPart as string).trim() }
              : {}),
            ...(distribution
              ? { distribution: distribution as SchdkDictionaryDistribution }
              : {}),
          },
        ]
      : [];
  });
  const hasEveryValue = AI_QUESTION_DIFFICULTIES.every((value) =>
    parsedItems.some((item) => item.value === value),
  );
  const hasValidMetadata =
    hasValidId &&
    typeof dictionary.name === 'string' &&
    Boolean(dictionary.name.trim()) &&
    dictionary.name.length <= 500 &&
    typeof dictionary.description === 'string' &&
    Boolean(dictionary.description.trim()) &&
    dictionary.description.length <= 5_000;
  return hasValidMetadata &&
    hasEveryValue &&
    (!isDistributionDictionary ||
      parsedItems.every((item) => item.distribution))
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

export {
  DEFAULT_SCHDK_DICTIONARIES,
  SCHDK_DICTIONARY_ENTRY,
  MAX_SCHDK_DICTIONARY_BYTES,
  MAX_SCHDK_DICTIONARY_JSON_BYTES,
  parseSchdkDictionary,
  serializeSchdkDictionary,
  type SchdkDictionary,
  type SchdkDictionaryId,
  type SchdkDictionaryItem,
  type SchdkDictionaryDistribution,
};
