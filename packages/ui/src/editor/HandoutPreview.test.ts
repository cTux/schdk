import { describe, expect, it } from 'vitest';
import { clampHandoutZoom } from './HandoutPreview';

describe('handout zoom', () => {
  it('keeps zoom between 100% and 400%', () => {
    expect(clampHandoutZoom(0.5)).toBe(1);
    expect(clampHandoutZoom(2.5)).toBe(2.5);
    expect(clampHandoutZoom(4.5)).toBe(4);
  });
});
