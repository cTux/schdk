import { describe, expect, it } from 'vitest';
import { clampImageZoom } from './ZoomableImage';

describe('handout zoom', () => {
  it('keeps zoom between 100% and 400%', () => {
    expect(clampImageZoom(0.5)).toBe(1);
    expect(clampImageZoom(2.5)).toBe(2.5);
    expect(clampImageZoom(4.5)).toBe(4);
  });
});
