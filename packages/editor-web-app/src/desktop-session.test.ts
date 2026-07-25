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
  it('restores a scoped Drive file and selected question', () => {
    const storage = createStorage();
    const session = {
      driveFileId: 'drive-file-id',
      fileName: 'quiz.schdk',
      selectedIndex: 17,
    };
    saveDesktopEditorSession(storage, '/editor/index.html', session);

    expect(loadDesktopEditorSession(storage, '/editor/index.html')).toEqual(
      session,
    );
    expect(loadDesktopEditorSession(storage, '/all/index.html')).toBeNull();
  });

  it('rejects local and invalid session state', () => {
    const storage = createStorage();
    storage.setItem(
      'schdk.desktop.editor-session:/editor/index.html',
      JSON.stringify({ filePath: 'quiz.schdk', selectedIndex: 17 }),
    );

    expect(loadDesktopEditorSession(storage, '/editor/index.html')).toBeNull();
  });
});
