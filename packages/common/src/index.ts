import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import {
  createEmptyGameQuestion,
  parseGameQuestion,
  serializeGameQuestion,
  type GameQuestion,
} from './game-question';

export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;
const PACKAGE_ENTRY = 'game.json';
const MUSIC_BREAK_ENTRIES = ['audio/break-1', 'audio/break-2'] as const;

export {
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
  parseGameQuestion,
} from './game-question';
export type {
  GameQuestion,
  GameQuestionType,
  Handout,
  ImageHandout,
  TextHandout,
} from './game-question';

export interface GamePackage {
  format: 'schdk-game-package';
  version: 3;
  title: string;
  questions: GameQuestion[];
  musicBreaks: [MusicBreak | null, MusicBreak | null];
}

export interface MusicBreak {
  name: string;
  mimeType: string;
  data: Uint8Array;
}

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 3,
    title: 'Без назви',
    questions: Array.from({ length: QUESTION_COUNT }, createEmptyGameQuestion),
    musicBreaks: [null, null],
  };
}

export function validateGamePackage(gamePackage: GamePackage): string[] {
  const errors: string[] = [];

  if (!gamePackage.title.trim()) errors.push('Вкажіть назву пакета.');
  if (gamePackage.questions.length !== QUESTION_COUNT) {
    errors.push(`Пакет має містити рівно ${QUESTION_COUNT} питань.`);
    return errors;
  }

  gamePackage.questions.forEach((question, index) => {
    const number = index + 1;
    question.questionParts.forEach((part, partIndex) => {
      if (!part.trim()) {
        const suffix =
          question.questionParts.length === 1
            ? ''
            : `, частина ${partIndex + 1}`;
        errors.push(`Питання ${number}${suffix}: немає тексту.`);
      }
    });
    if (!question.answer.trim())
      errors.push(`Питання ${number}: немає відповіді.`);
    if (question.comment?.trim())
      errors.push(`Питання ${number}: є невирішений коментар.`);
  });

  return errors;
}

function serializeGamePackageJson(gamePackage: GamePackage): string {
  return JSON.stringify(
    {
      ...gamePackage,
      title: gamePackage.title.trim(),
      questions: gamePackage.questions.map(serializeGameQuestion),
      musicBreaks: gamePackage.musicBreaks.map((musicBreak, index) =>
        musicBreak
          ? {
              name: musicBreak.name,
              mimeType: musicBreak.mimeType,
              entry: MUSIC_BREAK_ENTRIES[index],
            }
          : null,
      ),
    },
    null,
    2,
  );
}

export function serializeGamePackage(gamePackage: GamePackage): Uint8Array {
  const entries: Zippable = {
    [PACKAGE_ENTRY]: [
      strToU8(serializeGamePackageJson(gamePackage)),
      { level: 9 },
    ],
  };
  gamePackage.musicBreaks.forEach((musicBreak, index) => {
    if (musicBreak) {
      entries[MUSIC_BREAK_ENTRIES[index]!] = [musicBreak.data, { level: 0 }];
    }
  });
  return zipSync(entries);
}

function readGamePackage(
  content: string | Uint8Array,
): [string, Record<string, Uint8Array>] {
  if (typeof content === 'string') return [content, {}];
  if (content[0] !== 0x50 || content[1] !== 0x4b) {
    return [strFromU8(content), {}];
  }

  const entries = unzipSync(content);
  const gamePackage = entries[PACKAGE_ENTRY];
  if (!gamePackage) throw new Error('Invalid game package');
  return [strFromU8(gamePackage), entries];
}

function parseMusicBreaks(
  value: Record<string, unknown>,
  entries: Record<string, Uint8Array>,
): [MusicBreak | null, MusicBreak | null] {
  if (value.version !== 3) return [null, null];
  if (!Array.isArray(value.musicBreaks) || value.musicBreaks.length !== 2) {
    throw new Error('Invalid game package');
  }
  return value.musicBreaks.map((item, index) => {
    if (item === null) return null;
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid game package');
    }
    const candidate = item as Record<string, unknown>;
    const expectedEntry = MUSIC_BREAK_ENTRIES[index]!;
    const data = entries[expectedEntry];
    if (
      typeof candidate.name !== 'string' ||
      !candidate.name ||
      typeof candidate.mimeType !== 'string' ||
      !candidate.mimeType.startsWith('audio/') ||
      candidate.entry !== expectedEntry ||
      !data?.byteLength
    ) {
      throw new Error('Invalid game package');
    }
    return {
      name: candidate.name,
      mimeType: candidate.mimeType,
      data,
    };
  }) as [MusicBreak | null, MusicBreak | null];
}

export function parseGamePackage(content: string | Uint8Array): GamePackage {
  const [json, entries] = readGamePackage(content);
  const value: unknown = JSON.parse(json);
  if (
    !value ||
    typeof value !== 'object' ||
    !('format' in value) ||
    value.format !== 'schdk-game-package' ||
    !('version' in value) ||
    (value.version !== 1 && value.version !== 2 && value.version !== 3) ||
    !('title' in value) ||
    typeof value.title !== 'string' ||
    !('questions' in value) ||
    !Array.isArray(value.questions) ||
    value.questions.length !== QUESTION_COUNT
  ) {
    throw new Error('Invalid game package');
  }

  let questions: GameQuestion[];
  let musicBreaks: [MusicBreak | null, MusicBreak | null];
  try {
    questions = value.questions.map(parseGameQuestion);
    musicBreaks = parseMusicBreaks(value as Record<string, unknown>, entries);
  } catch {
    throw new Error('Invalid game package');
  }

  return {
    format: value.format,
    version: 3,
    title: value.title,
    questions,
    musicBreaks,
  };
}
