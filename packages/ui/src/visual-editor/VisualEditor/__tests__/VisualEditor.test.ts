import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_LAYOUT,
  DEFAULT_GAME_OPTIONS,
  MAX_CUSTOM_IMAGE_DATA_LENGTH,
} from '../../../options/types';
import { readVisualEditorImage } from '../utils/read-visual-editor-image';
import {
  createCustomElement,
  getDraggedPosition,
  getNextZoom,
  getResizedPosition,
} from '../VisualEditor';
import {
  removeVisualEditorElement,
  updateVisualEditorElement,
  updateVisualEditorPosition,
} from '../utils/update-visual-editor-game';

describe('visual editor drag position', () => {
  it('rejects oversized images before reading them', async () => {
    await expect(
      readVisualEditorImage({
        type: 'image/png',
        size: MAX_CUSTOM_IMAGE_DATA_LENGTH,
      } as File),
    ).rejects.toThrow('Invalid visual editor image');
  });

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

  it('updates built-in and custom elements without mutating game options', () => {
    const custom = createCustomElement('text', 0, 'custom');
    const game = {
      ...DEFAULT_GAME_OPTIONS,
      customElements: [custom],
    };

    const moved = updateVisualEditorPosition(
      game,
      { kind: 'built-in', id: 'question' },
      { x: 25 },
    );
    const renamed = updateVisualEditorElement(game, custom.id, {
      text: 'Changed',
    });
    const removed = removeVisualEditorElement(game, custom.id);

    expect(moved.layout?.question.x).toBe(25);
    expect(game.layout?.question.x).not.toBe(25);
    expect(renamed.customElements[0]).toMatchObject({ text: 'Changed' });
    expect(game.customElements[0]).toBe(custom);
    expect(removed.customElements).toEqual([]);
  });
});
