import { describe, expect, it } from 'vitest';
import {
  loadEditorTextOptions,
  saveEditorTextOptions,
} from '../editor/editor-options-storage';
import { loadGameOptions } from './load-game-options';
import { saveGameOptions } from './save-game-options';
import { DEFAULT_GAME_LAYOUT, DEFAULT_GAME_OPTIONS } from '@schdk/common';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/ui/options';

function createStorage(initial: string | null = null, failWrites = false) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      if (failWrites) throw new Error('quota');
      value = next;
    },
  };
}

describe('editor text options', () => {
  it('persists valid options and falls back for invalid data', () => {
    const storage = createStorage();
    const options = { ...DEFAULT_EDITOR_TEXT_OPTIONS, correctAnswers: true };
    saveEditorTextOptions(storage, options);
    expect(loadEditorTextOptions(storage)).toEqual(options);
    expect(loadEditorTextOptions(createStorage('{'))).toEqual(
      DEFAULT_EDITOR_TEXT_OPTIONS,
    );
  });
});

describe('game options', () => {
  it('defaults to 5% and persists only a valid volume', () => {
    const storage = createStorage();
    expect(loadGameOptions(storage)).toEqual(DEFAULT_GAME_OPTIONS);
    expect(
      loadGameOptions(createStorage('{"soundVolume":0.4}')).musicVolume,
    ).toBe(0.05);
    const options = {
      ...DEFAULT_GAME_OPTIONS,
      soundVolume: 0.65,
      layout: {
        ...DEFAULT_GAME_LAYOUT,
        question: { ...DEFAULT_GAME_LAYOUT.question, hidden: true },
      },
      customElements: [
        {
          id: 'title',
          kind: 'text' as const,
          text: 'Заголовок',
          position: { ...DEFAULT_GAME_LAYOUT.question, hidden: true },
        },
      ],
    };
    expect(saveGameOptions(storage, options)).toBe(true);
    expect(loadGameOptions(storage)).toEqual(options);
    expect(loadGameOptions(createStorage('{"soundVolume":2}'))).toEqual(
      DEFAULT_GAME_OPTIONS,
    );
    expect(
      loadGameOptions(
        createStorage('{"soundVolume":0.4,"layout":{"timer":{"x":101,"y":0}}}'),
      ),
    ).toEqual(DEFAULT_GAME_OPTIONS);
  });

  it('adds new element positions to legacy layouts', () => {
    const {
      logo: _logo,
      ['alternative-answer']: _alternativeAnswer,
      ...previousLayout
    } = DEFAULT_GAME_LAYOUT;
    const legacyLayout = Object.fromEntries(
      Object.entries(previousLayout).map(([id, { x, y }]) => [
        id,
        {
          x,
          y,
          backgroundImage: 'data:image/png;base64,obsolete',
          backgroundOpacity: 0.5,
        },
      ]),
    );
    expect(
      loadGameOptions(
        createStorage(
          JSON.stringify({ soundVolume: 0.4, layout: legacyLayout }),
        ),
      ).layout,
    ).toEqual({
      ...DEFAULT_GAME_LAYOUT,
      logo: DEFAULT_GAME_LAYOUT.logo,
      'alternative-answer': {
        ...DEFAULT_GAME_LAYOUT['alternative-answer'],
        x: legacyLayout.answer.x,
        y: legacyLayout.answer.y - 18,
      },
    });
  });

  it('rejects unsafe background images', () => {
    expect(
      loadGameOptions(
        createStorage(
          JSON.stringify({
            soundVolume: 0.4,
            layout: DEFAULT_GAME_LAYOUT,
            backgroundImage: 'https://example.com/image.png',
            backgroundOpacity: 1,
          }),
        ),
      ),
    ).toEqual(DEFAULT_GAME_OPTIONS);
  });

  it('migrates missing custom elements and rejects invalid ones', () => {
    expect(
      loadGameOptions(
        createStorage(
          JSON.stringify({
            soundVolume: 0.4,
            layout: DEFAULT_GAME_LAYOUT,
          }),
        ),
      ).customElements,
    ).toEqual([]);
    const { hidden: _hidden, ...legacyPosition } = DEFAULT_GAME_LAYOUT.question;
    expect(
      loadGameOptions(
        createStorage(
          JSON.stringify({
            ...DEFAULT_GAME_OPTIONS,
            customElements: [
              {
                id: 'legacy',
                kind: 'text',
                text: 'Старий елемент',
                position: legacyPosition,
              },
            ],
          }),
        ),
      ).customElements[0]?.position.hidden,
    ).toBe(false);
    expect(
      loadGameOptions(
        createStorage(
          JSON.stringify({
            ...DEFAULT_GAME_OPTIONS,
            customElements: [
              {
                id: 'duplicate',
                kind: 'text',
                text: 'Один',
                position: DEFAULT_GAME_LAYOUT.question,
              },
              {
                id: 'duplicate',
                kind: 'text',
                text: 'Два',
                position: DEFAULT_GAME_LAYOUT.question,
              },
            ],
          }),
        ),
      ),
    ).toEqual(DEFAULT_GAME_OPTIONS);
  });

  it('reports storage write failures', () => {
    expect(
      saveGameOptions(createStorage(null, true), DEFAULT_GAME_OPTIONS),
    ).toBe(false);
  });
});
