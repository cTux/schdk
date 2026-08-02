import { type GameLayout } from '../../types/game-options/game-layout.js';
import { layout } from '../../utils/game-options/layout.js';

export const DEFAULT_GAME_LAYOUT: GameLayout = {
  logo: layout(5, 6, 6, 12, '#f1f3f6', 'center'),
  intro: { ...layout(50, 50, 46, 30, '#f1f3f6', 'center'), textBold: true },
  handout: layout(76, 31, 26, 22, '#f1f3f6', 'center'),
  question: { ...layout(24, 36, 34, 12), textBold: true },
  timer: { ...layout(16, 68, 20, 16, '#f1f3f6', 'center'), textBold: true },
  'answer-comment': layout(24, 84, 34, 12, '#d8dce3'),
  'alternative-answer': layout(76, 68, 34, 9, '#d4d8df', 'right'),
  answer: {
    ...layout(76, 84, 34, 16, '#efad3f', 'right'),
    textBold: true,
  },
  progress: layout(95, 4, 10, 7, '#b9c0cd', 'right'),
  controls: layout(50, 96, 27, 7, '#8b94a3', 'center'),
};
