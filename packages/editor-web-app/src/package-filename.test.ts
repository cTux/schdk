import { describe, expect, it } from 'vitest';
import { createPackageFilename } from './package-filename';

describe('createPackageFilename', () => {
  it('adds local time with seconds to prevent duplicate downloads', () => {
    const date = new Date(2026, 6, 22, 9, 8, 7);

    expect(createPackageFilename('Wix Astartes 22.07.2026', date)).toBe(
      'Wix Astartes 22.07.2026 09.08.07.schdk',
    );
  });

  it('keeps the generated filename safe', () => {
    const date = new Date(2026, 6, 22, 9, 8, 7);

    expect(createPackageFilename('Game: final?', date)).toBe(
      'Game- final- 09.08.07.schdk',
    );
  });
});
