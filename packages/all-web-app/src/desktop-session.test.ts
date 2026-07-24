import { describe, expect, it } from 'vitest';
import { loadDesktopShellView, saveDesktopShellView } from './desktop-session';

describe('desktop shell session', () => {
  it('restores a valid view only within the same scope', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    saveDesktopShellView(storage, '/all/index.html', 'editor');

    expect(loadDesktopShellView(storage, '/all/index.html')).toBe('editor');
    saveDesktopShellView(storage, '/all/index.html', 'options');
    expect(loadDesktopShellView(storage, '/all/index.html')).toBe('options');
    saveDesktopShellView(storage, '/all/index.html', 'visualEditor');
    expect(loadDesktopShellView(storage, '/all/index.html')).toBe(
      'visualEditor',
    );
    expect(loadDesktopShellView(storage, '/other/index.html')).toBeNull();
  });
});
