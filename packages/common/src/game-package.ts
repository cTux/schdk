import { type GameQuestion } from './game-question.js';

import { type MusicBreak } from './music-break.js';

export interface GamePackage {
  format: 'schdk-game-package';
  version: 4;
  title: string;
  questions: GameQuestion[];
  tourPhrases: [string, string, string];
  musicBreaks: [MusicBreak | null, MusicBreak | null];
}
