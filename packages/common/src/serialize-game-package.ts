import { strToU8, zipSync, type Zippable } from 'fflate';
import { serializeGameQuestion } from './game-question.js';
import { type GamePackage } from './game-package.js';
import { MUSIC_BREAK_ENTRIES } from './music-break-entries.js';
import { MAX_GAME_JSON_BYTES } from './max-game-json-bytes.js';
import { PACKAGE_ENTRY } from './package-entry.js';
import { MAX_MUSIC_BREAK_BYTES } from './max-music-break-bytes.js';
import { MAX_GAME_PACKAGE_BYTES } from './max-game-package-bytes.js';

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
