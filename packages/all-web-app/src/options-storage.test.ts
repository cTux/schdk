import { describe, expect, it } from 'vitest';
import {
  loadEditorTextOptions,
  loadGameOptions,
  saveEditorTextOptions,
  saveGameOptions,
} from './options-storage';
import {
  DEFAULT_EDITOR_TEXT_OPTIONS,
  DEFAULT_GAME_OPTIONS,
} from '@schdk/ui/options';

function createStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
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
  it('defaults to 40% and persists only a valid volume', () => {
    const storage = createStorage();
    expect(loadGameOptions(storage)).toEqual(DEFAULT_GAME_OPTIONS);
    saveGameOptions(storage, { soundVolume: 0.65 });
    expect(loadGameOptions(storage)).toEqual({ soundVolume: 0.65 });
    expect(loadGameOptions(createStorage('{"soundVolume":2}'))).toEqual(
      DEFAULT_GAME_OPTIONS,
    );
  });
});
