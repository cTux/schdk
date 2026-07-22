export function capitalizeFirstWord(value: string) {
  return value.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase('uk-UA'));
}

export function correctSentence(value: string) {
  const corrected = capitalizeFirstWord(value).trimEnd();
  return corrected && !/\p{P}$/u.test(corrected) ? `${corrected}.` : corrected;
}
