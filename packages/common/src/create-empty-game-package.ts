import { createEmptyGameQuestion } from './game-question.js';

import { type GamePackage } from './game-package.js';
import { QUESTION_COUNT } from './question-count.js';

export function createEmptyGamePackage(): GamePackage {
  return {
    format: 'schdk-game-package',
    version: 4,
    title: 'Без назви',
    questions: Array.from({ length: QUESTION_COUNT }, createEmptyGameQuestion),
    tourPhrases: ['', '', ''],
    musicBreaks: [null, null],
  };
}
