import { describe, expect, it } from 'vitest';
import { createGamePackageFilename } from '@schdk/google-drive/game-packages';

describe('createGamePackageFilename', () => {
  it('uses the package title', () => {
    expect(
      createGamePackageFilename('Wix Astartes 22.07.2026', 'Незавершена гра'),
    ).toBe('Wix Astartes 22.07.2026.schdk');
  });

  it('keeps the generated filename safe', () => {
    expect(createGamePackageFilename('Game: final?', 'Незавершена гра')).toBe(
      'Game- final-.schdk',
    );
  });
});
