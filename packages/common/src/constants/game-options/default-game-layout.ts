import { type GameLayout } from '../../types/game-options/game-layout.js';
import { layout } from '../../utils/game-options/layout.js';

export const DEFAULT_GAME_LAYOUT: GameLayout = {
  logo: layout(5, 6, 6, 12),
  intro: layout(50, 50, 46, 30),
  handout: layout(76, 31, 26, 22),
  question: layout(24, 36, 34, 12),
  timer: layout(16, 68, 20, 16),
  'answer-comment': layout(24, 84, 34, 12, '#d8dce3'),
  'alternative-answer': layout(76, 68, 34, 9, '#d4d8df'),
  answer: layout(76, 84, 34, 16, '#efad3f'),
  progress: layout(95, 4, 10, 7, '#b9c0cd'),
  controls: layout(50, 96, 27, 7, '#8b94a3'),
};
