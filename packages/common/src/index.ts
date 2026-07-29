import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import {
  createEmptyGameQuestion,
  parseGameQuestion,
  serializeGameQuestion,
  type GameQuestion,
} from './game-question.js';
import {
  hasGamePackageRemarks,
  validateGamePackageReadiness,
} from './game-package-validation.js';

export {
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackage,
  parseAIQuestionsPackageArchive,
  serializeAIQuestionsPackage,
} from './ai-questions-package.js';
export type {
  AIQuestionsPackage,
  AIQuestionsPackageQuestion,
} from './ai-questions-package.js';
export {
  AI_QUESTION_DIFFICULTIES,
  AI_QUESTION_RECOGNIZABILITIES,
  compareFavoriteItemsByName,
  MAX_AI_QUESTION_BYTES,
  parseAIQuestion,
  parseAIQuestionArchive,
  serializeAIQuestion,
} from './ai-question.js';
export type {
  AIQuestion,
  AIQuestionDifficulty,
  AIQuestionRecognizability,
} from './ai-question.js';
export const QUESTION_COUNT = 36;
export const QUESTIONS_PER_ROUND = 12;
export const MAX_GAME_PACKAGE_BYTES = 160 * 1024 * 1024;
export const MAX_MUSIC_BREAK_BYTES = 64 * 1024 * 1024;
const PACKAGE_ENTRY = 'game.json';
const MUSIC_BREAK_ENTRIES = ['audio/break-1', 'audio/break-2'] as const;
const MAX_GAME_JSON_BYTES = 16 * 1024 * 1024;

export {
  QUESTION_TYPE_CONFIG,
  createEmptyGameQuestion,
  getGameQuestionAnswers,
  normalizeGameAnswer,
  parseGameQuestion,
} from './game-question.js';
export type {
  GameQuestion,
  GameQuestionType,
  Handout,
  ImageHandout,
  TextHandout,
} from './game-question.js';

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
  return validateGamePackageReadiness(gamePackage, QUESTION_COUNT);
}

export { hasGamePackageRemarks };

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
  const gameJson = strToU8(serializeGamePackageJson(gamePackage));
  if (gameJson.byteLength > MAX_GAME_JSON_BYTES) {
    throw new Error('Invalid game package');
  }
  const entries: Zippable = {
    [PACKAGE_ENTRY]: [gameJson, { level: 9 }],
  };
  gamePackage.musicBreaks.forEach((musicBreak, index) => {
    if (musicBreak) {
      if (musicBreak.data.byteLength > MAX_MUSIC_BREAK_BYTES) {
        throw new Error('Invalid game package');
      }
      entries[MUSIC_BREAK_ENTRIES[index]!] = [musicBreak.data, { level: 0 }];
    }
  });
  const archive = zipSync(entries);
  if (archive.byteLength > MAX_GAME_PACKAGE_BYTES) {
    throw new Error('Invalid game package');
  }
  return archive;
}

function readGamePackage(
  content: string | Uint8Array,
): [string, Record<string, Uint8Array>] {
  if (typeof content === 'string') {
    if (strToU8(content).byteLength > MAX_GAME_JSON_BYTES) {
      throw new Error('Invalid game package');
    }
    return [content, {}];
  }
  if (content[0] !== 0x50 || content[1] !== 0x4b) {
    if (content.byteLength > MAX_GAME_JSON_BYTES) {
      throw new Error('Invalid game package');
    }
    return [strFromU8(content), {}];
  }
  if (content.byteLength > MAX_GAME_PACKAGE_BYTES) {
    throw new Error('Invalid game package');
  }

  const seenEntries = new Set<string>();
  const entries = unzipSync(content, {
    filter: ({ name, originalSize }) => {
      const limit =
        name === PACKAGE_ENTRY
          ? MAX_GAME_JSON_BYTES
          : MUSIC_BREAK_ENTRIES.includes(
                name as (typeof MUSIC_BREAK_ENTRIES)[number],
              )
            ? MAX_MUSIC_BREAK_BYTES
            : 0;
      if (!limit) return false;
      if (seenEntries.has(name) || originalSize > limit) {
        throw new Error('Invalid game package');
      }
      seenEntries.add(name);
      return true;
    },
  });
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
