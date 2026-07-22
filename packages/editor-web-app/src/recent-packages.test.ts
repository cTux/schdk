import { describe, expect, it } from 'vitest';
import { selectRecentPackages } from './recent-packages';

describe('selectRecentPackages', () => {
  it('keeps the five newest packages', () => {
    const records = Array.from({ length: 7 }, (_, index) => ({
      name: `game-${index}.schdk`,
      content: new Uint8Array(),
      openedAt: index,
    }));

    expect(selectRecentPackages(records).map(({ name }) => name)).toEqual([
      'game-6.schdk',
      'game-5.schdk',
      'game-4.schdk',
      'game-3.schdk',
      'game-2.schdk',
    ]);
  });
});
