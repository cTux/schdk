import { capitalizeFirstWord } from './text-correction';

export function correctSentence(value: string) {
  const corrected = capitalizeFirstWord(value);
  return corrected && !/\p{P}$/u.test(corrected) ? `${corrected}.` : corrected;
}
