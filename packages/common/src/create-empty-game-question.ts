import { type GameQuestion } from './game-question.js';

export function createEmptyGameQuestion(): GameQuestion {
  return {
    type: 'standard',
    questionParts: [''],
    answer: '',
    alternativeAnswers: [],
    wrongAnswers: [],
  };
}
