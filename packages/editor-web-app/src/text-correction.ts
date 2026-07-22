export function capitalizeFirstWord(value: string) {
  return value
    .trim()
    .replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase('uk-UA'));
}

export function correctAnswer(value: string) {
  return capitalizeFirstWord(value).replace(/\.+$/u, '');
}

export function correctSentence(value: string) {
  const corrected = capitalizeFirstWord(value);
  return corrected && !/\p{P}$/u.test(corrected) ? `${corrected}.` : corrected;
}
