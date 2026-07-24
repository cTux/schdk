import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_LAYOUT } from '../options/types';
import {
  getDraggedPosition,
  getNextZoom,
  getResizedPosition,
} from './VisualEditor';

describe('visual editor drag position', () => {
  it('keeps the grabbed point under the pointer', () => {
    expect(
      getDraggedPosition({ x: 40, y: 30 }, { x: 45, y: 35 }, { x: 45, y: 35 }),
    ).toEqual({ x: 40, y: 30 });
    expect(
      getDraggedPosition({ x: 40, y: 30 }, { x: 45, y: 35 }, { x: 50, y: 45 }),
    ).toEqual({ x: 45, y: 40 });
  });

  it('clamps wheel zoom to the supported range', () => {
    expect(getNextZoom(1, -1)).toBeCloseTo(1.1);
    expect(getNextZoom(2.5, -1)).toBe(2.5);
    expect(getNextZoom(0.5, 1)).toBe(0.5);
  });

  it('resizes from the bottom right without moving the opposite corner', () => {
    expect(
      getResizedPosition(
        DEFAULT_GAME_LAYOUT.question,
        { x: 50, y: 50 },
        { x: 60, y: 55 },
      ),
    ).toEqual({
      x: DEFAULT_GAME_LAYOUT.question.x + 5,
      y: DEFAULT_GAME_LAYOUT.question.y + 2.5,
      width: DEFAULT_GAME_LAYOUT.question.width + 10,
      height: DEFAULT_GAME_LAYOUT.question.height + 5,
    });
  });
});
