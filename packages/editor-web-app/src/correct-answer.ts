import { capitalizeFirstWord } from './text-correction';

export function correctAnswer(value: string) {
  return capitalizeFirstWord(value).replace(/\.+$/u, '');
}
