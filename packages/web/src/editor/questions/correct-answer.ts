import { capitalizeFirstWord } from './capitalize-first-word';

export function correctAnswer(value: string) {
  return capitalizeFirstWord(value).replace(/\.+$/u, '');
}
