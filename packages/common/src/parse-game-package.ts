import { strFromU8, strToU8, unzipSync } from 'fflate';
import { parseGameQuestion, type GameQuestion } from './game-question.js';

import { MAX_GAME_JSON_BYTES } from './max-game-json-bytes.js';
import { MAX_GAME_PACKAGE_BYTES } from './max-game-package-bytes.js';
import { PACKAGE_ENTRY } from './package-entry.js';
import { MUSIC_BREAK_ENTRIES } from './music-break-entries.js';
import { MAX_MUSIC_BREAK_BYTES } from './max-music-break-bytes.js';
import { type MusicBreak } from './music-break.js';
import { type GamePackage } from './game-package.js';
import { QUESTION_COUNT } from './question-count.js';

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
