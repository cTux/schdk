import { createEmptyGamePackage } from '@schdk/common';
import { describe, expect, it } from 'vitest';
import {
  createEditorSessionState,
  editorSessionReducer,
} from './use-editor-session';

describe('editor session', () => {
  it('opens a Drive package atomically', () => {
    const gamePackage = { ...createEmptyGamePackage(), title: 'Opened' };

    expect(
      editorSessionReducer(createEditorSessionState('Untitled'), {
        type: 'open',
        gamePackage,
        file: {
          id: 'drive-id',
          name: 'opened.schdk',
          modifiedTime: '2026-07-31T12:00:00.000Z',
        },
      }),
    ).toEqual({
      gamePackage,
      hasPackage: true,
      driveFileId: 'drive-id',
      driveModifiedTime: '2026-07-31T12:00:00.000Z',
      fileName: 'opened.schdk',
      saveStatus: 'saved',
    });
  });

  it('marks every package mutation pending', () => {
    const state = createEditorSessionState('Untitled');

    expect(
      editorSessionReducer(state, {
        type: 'change',
        value: (gamePackage) => ({ ...gamePackage, title: 'Changed' }),
      }),
    ).toMatchObject({
      gamePackage: { title: 'Changed' },
      saveStatus: 'pending',
    });
  });

  it('clears Drive backing when resetting the package', () => {
    const gamePackage = { ...createEmptyGamePackage(), title: 'New package' };
    const opened = editorSessionReducer(createEditorSessionState('Untitled'), {
      type: 'open',
      gamePackage,
      file: {
        id: 'drive-id',
        name: 'opened.schdk',
        modifiedTime: '2026-07-31T12:00:00.000Z',
      },
    });

    expect(
      editorSessionReducer(opened, { type: 'reset', gamePackage }),
    ).toEqual({
      gamePackage,
      hasPackage: false,
      driveFileId: null,
      driveModifiedTime: null,
      fileName: null,
      saveStatus: 'saved',
    });
  });
});
