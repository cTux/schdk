import { describe, expect, it } from 'vitest';
import { getFitScale } from '../FitTextObserver';

describe('fit text scale', () => {
  it('finds the largest scale that fits', () => {
    expect(getFitScale((scale) => scale <= 0.42)).toBeCloseTo(0.42, 2);
    expect(getFitScale((scale) => scale <= 0.02)).toBe(0.35);
    expect(getFitScale((scale) => scale <= 2.5)).toBeCloseTo(2.5, 2);
    expect(getFitScale(() => true)).toBe(8);
  });
});
