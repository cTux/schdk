import { describe, expect, it } from 'vitest';
import {
  loadDesktopEditorSession,
  saveDesktopEditorSession,
} from './desktop-session';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('desktop editor session', () => {
  it('restores a scoped file and selected question', () => {
    const storage = createStorage();
    saveDesktopEditorSession(storage, '/editor/index.html', {
      filePath: 'C:\\Games\\quiz.schdk',
      selectedIndex: 17,
    });

    expect(loadDesktopEditorSession(storage, '/editor/index.html')).toEqual({
      filePath: 'C:\\Games\\quiz.schdk',
      selectedIndex: 17,
    });
    expect(loadDesktopEditorSession(storage, '/all/index.html')).toBeNull();
  });

  it('rejects invalid session state', () => {
    const storage = createStorage();
    storage.setItem(
      'schdk.desktop.editor-session:/editor/index.html',
      JSON.stringify({ filePath: 'quiz.txt', selectedIndex: 36 }),
    );

    expect(loadDesktopEditorSession(storage, '/editor/index.html')).toBeNull();
  });
});
