import { type GameQuestion } from '../../contracts/game-questions/game-question.js';

import { type MusicBreak } from '../music-breaks/music-break.js';

export interface GamePackage {
  format: 'schdk-game-package';
  version: 4;
  title: string;
  questions: GameQuestion[];
  tourPhrases: [string, string, string];
  musicBreaks: [MusicBreak | null, MusicBreak | null];
}
