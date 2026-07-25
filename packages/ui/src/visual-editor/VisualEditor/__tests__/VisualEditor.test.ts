import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_LAYOUT } from '../../../options/types';
import {
  createCustomElement,
  getDraggedPosition,
  getNextZoom,
  getResizedPosition,
} from '../VisualEditor';

describe('visual editor drag position', () => {
  it('keeps the grabbed point under the pointer', () => {
    expect(
      getDraggedPosition({ x: 40, y: 30 }, { x: 45, y: 35 }, { x: 45, y: 35 }),
    ).toEqual({ x: 40, y: 30 });
    expect(
      getDraggedPosition({ x: 40, y: 30 }, { x: 45, y: 35 }, { x: 50, y: 45 }),
    ).toEqual({ x: 45, y: 40 });
  });

  it('offsets new custom elements without changing their defaults', () => {
    expect(createCustomElement('text', 0, 'text')).toMatchObject({
      id: 'text',
      kind: 'text',
      text: 'Текст',
      position: { x: 50, y: 50, width: 24, height: 10 },
    });
    expect(createCustomElement('image', 2, 'image')).toMatchObject({
      id: 'image',
      kind: 'image',
      image: null,
      position: { x: 56, y: 56, width: 24, height: 24 },
    });
  });

  it('clamps wheel zoom to the supported range', () => {
    expect(getNextZoom(1, -1)).toBeCloseTo(1.1);
    expect(getNextZoom(2.5, -1)).toBe(2.5);
    expect(getNextZoom(0.5, 1)).toBe(0.5);
  });

  it('resizes from every side without moving the opposite edge', () => {
    expect(
      getResizedPosition(
        DEFAULT_GAME_LAYOUT.question,
        { x: 50, y: 50 },
        { x: 60, y: 50 },
        'right',
      ),
    ).toEqual({
      x: DEFAULT_GAME_LAYOUT.question.x + 5,
      y: DEFAULT_GAME_LAYOUT.question.y,
      width: DEFAULT_GAME_LAYOUT.question.width + 10,
      height: DEFAULT_GAME_LAYOUT.question.height,
    });
    expect(
      getResizedPosition(
        DEFAULT_GAME_LAYOUT.question,
        { x: 50, y: 50 },
        { x: 50, y: 55 },
        'top',
      ),
    ).toEqual({
      x: DEFAULT_GAME_LAYOUT.question.x,
      y: DEFAULT_GAME_LAYOUT.question.y + 2.5,
      width: DEFAULT_GAME_LAYOUT.question.width,
      height: DEFAULT_GAME_LAYOUT.question.height - 5,
    });
    expect(
      getResizedPosition(
        DEFAULT_GAME_LAYOUT.question,
        { x: 50, y: 50 },
        { x: 45, y: 50 },
        'left',
      ),
    ).toEqual({
      x: DEFAULT_GAME_LAYOUT.question.x - 2.5,
      y: DEFAULT_GAME_LAYOUT.question.y,
      width: DEFAULT_GAME_LAYOUT.question.width + 5,
      height: DEFAULT_GAME_LAYOUT.question.height,
    });
    expect(
      getResizedPosition(
        DEFAULT_GAME_LAYOUT.question,
        { x: 50, y: 50 },
        { x: 50, y: 55 },
        'bottom',
      ),
    ).toEqual({
      x: DEFAULT_GAME_LAYOUT.question.x,
      y: DEFAULT_GAME_LAYOUT.question.y + 2.5,
      width: DEFAULT_GAME_LAYOUT.question.width,
      height: DEFAULT_GAME_LAYOUT.question.height + 5,
    });
  });
});
