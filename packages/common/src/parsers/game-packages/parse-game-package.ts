import { strFromU8, strToU8, unzipSync } from 'fflate';
import {
  parseGameQuestion,
  type GameQuestion,
} from '../../contracts/game-questions/game-question.js';

import { MAX_GAME_JSON_BYTES } from '../../constants/game-packages/max-game-json-bytes.js';
import { MAX_GAME_PACKAGE_BYTES } from '../../constants/game-packages/max-game-package-bytes.js';
import { PACKAGE_ENTRY } from '../../types/game-packages/package-entry.js';
import { MUSIC_BREAK_ENTRIES } from '../../constants/music-breaks/music-break-entries.js';
import { MAX_MUSIC_BREAK_BYTES } from '../../constants/music-breaks/max-music-break-bytes.js';
import { type MusicBreak } from '../../types/music-breaks/music-break.js';
import { type GamePackage } from '../../types/game-packages/game-package.js';
import { QUESTION_COUNT } from '../../constants/game-questions/question-count.js';

function readGamePackage(
  content: string | Uint8Array,
): [string, Record<string, Uint8Array>] {
  if (typeof content === 'string') {
    if (strToU8(content).byteLength > MAX_GAME_JSON_BYTES) {
      throw new Error('Invalid game package');
    }
    return [content, {}];
  }
  const hasZipSignature = content[0] === 0x50 && content[1] === 0x4b;
  if (!hasZipSignature) {
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
  if (value.version !== 3 && value.version !== 4) return [null, null];
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
    const hasValidName =
      typeof candidate.name === 'string' && Boolean(candidate.name);
    const hasValidMimeType =
      typeof candidate.mimeType === 'string' &&
      candidate.mimeType.startsWith('audio/');
    const hasExpectedEntry = candidate.entry === expectedEntry;
    const hasAudioData = Boolean(data?.byteLength);
    if (
      !hasValidName ||
      !hasValidMimeType ||
      !hasExpectedEntry ||
      !hasAudioData
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

function parseTourPhrases(
  value: Record<string, unknown>,
): [string, string, string] {
  if (value.version !== 4) return ['', '', ''];
  const tourPhrases = Array.isArray(value.tourPhrases) ? value.tourPhrases : [];
  const hasThreeTourPhrases = tourPhrases.length === 3;
  const hasOnlyTextTourPhrases =
    hasThreeTourPhrases &&
    tourPhrases.every((phrase) => typeof phrase === 'string');
  if (!hasThreeTourPhrases || !hasOnlyTextTourPhrases) {
    throw new Error('Invalid game package');
  }
  return tourPhrases as [string, string, string];
}

export function parseGamePackage(content: string | Uint8Array): GamePackage {
  const [json, entries] = readGamePackage(content);
  const value: unknown = JSON.parse(json);
  const isObject = !!value && typeof value === 'object';
  if (!isObject) throw new Error('Invalid game package');

  const hasExpectedFormat =
    'format' in value && value.format === 'schdk-game-package';
  const hasSupportedVersion =
    'version' in value &&
    (value.version === 1 ||
      value.version === 2 ||
      value.version === 3 ||
      value.version === 4);
  const hasValidTitle = 'title' in value && typeof value.title === 'string';
  const hasExpectedQuestions =
    'questions' in value &&
    Array.isArray(value.questions) &&
    value.questions.length === QUESTION_COUNT;
  if (
    !hasExpectedFormat ||
    !hasSupportedVersion ||
    !hasValidTitle ||
    !hasExpectedQuestions
  ) {
    throw new Error('Invalid game package');
  }
  const gamePackage = value as {
    format: 'schdk-game-package';
    version: 1 | 2 | 3 | 4;
    title: string;
    questions: unknown[];
  };

  let questions: GameQuestion[];
  let musicBreaks: [MusicBreak | null, MusicBreak | null];
  let tourPhrases: [string, string, string];
  try {
    questions = gamePackage.questions.map(parseGameQuestion);
    musicBreaks = parseMusicBreaks(gamePackage, entries);
    tourPhrases = parseTourPhrases(gamePackage);
  } catch {
    throw new Error('Invalid game package');
  }

  return {
    format: gamePackage.format,
    version: 4,
    title: gamePackage.title,
    questions,
    tourPhrases,
    musicBreaks,
  };
}
