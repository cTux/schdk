import { describe, expect, it } from 'vitest';
import {
  loadEditorTextOptions,
  saveEditorTextOptions,
} from './options-storage';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/ui/options';

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
