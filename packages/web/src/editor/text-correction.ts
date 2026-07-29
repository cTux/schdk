import { correctAnswer } from './correct-answer';
import { correctSentence } from './correct-sentence';

function capitalizeFirstWord(value: string) {
  return value
    .trim()
    .replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase('uk-UA'));
}

export { capitalizeFirstWord, correctAnswer, correctSentence };
