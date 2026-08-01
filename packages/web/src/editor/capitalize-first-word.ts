export function capitalizeFirstWord(value: string) {
  return value
    .trim()
    .replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase('uk-UA'));
}
