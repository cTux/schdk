import { type GameQuestion } from '../../contracts/game-questions/game-question.js';

export function createEmptyGameQuestion(): GameQuestion {
  return {
    type: 'standard',
    questionParts: [''],
    answer: '',
    alternativeAnswers: [],
    wrongAnswers: [],
  };
}
