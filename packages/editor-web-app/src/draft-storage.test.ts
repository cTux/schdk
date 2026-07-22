import { createEmptyGamePackage } from '@schdk/common';
import { describe, expect, it, vi } from 'vitest';
import { loadDraft, removeDraft, saveDraft } from './draft-storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
}

describe('editor draft storage', () => {
  it('restores the pending version for the same filename', () => {
    const storage = createStorage();
    const gamePackage = createEmptyGamePackage();
    gamePackage.title = 'Аварійна версія';

    saveDraft(storage, 'game.schdk', gamePackage);

    expect(loadDraft(storage, 'game.schdk')?.title).toBe('Аварійна версія');
    expect(loadDraft(storage, 'other.schdk')).toBeNull();
  });

  it('removes the pending version after a real save', () => {
    const storage = createStorage();
    saveDraft(storage, 'game.schdk', createEmptyGamePackage());

    removeDraft(storage, 'game.schdk');

    expect(loadDraft(storage, 'game.schdk')).toBeNull();
  });

  it('discards an invalid pending version', () => {
    const storage = createStorage();
    storage.setItem('schdk:editor-draft:game.schdk', 'broken');

    expect(loadDraft(storage, 'game.schdk')).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledOnce();
  });
});
