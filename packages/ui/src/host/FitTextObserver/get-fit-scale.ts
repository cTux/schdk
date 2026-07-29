import { MIN_FIT_SCALE } from './constants';

export function getFitScale(fits: (scale: number) => boolean) {
  if (fits(1)) return 1;
  if (!fits(MIN_FIT_SCALE)) return MIN_FIT_SCALE;
  let low = MIN_FIT_SCALE;
  let high = 1;
  for (let index = 0; index < 10; index += 1) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return low;
}
