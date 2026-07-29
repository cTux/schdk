import { type GameQuestion } from './game-question.js';

import { type MusicBreak } from './music-break.js';

export interface GamePackage {
  format: 'schdk-game-package';
  version: 3;
  title: string;
  questions: GameQuestion[];
  musicBreaks: [MusicBreak | null, MusicBreak | null];
}
