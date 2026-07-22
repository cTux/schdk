import { describe, expect, it } from 'vitest';
import { selectRecentPackages } from './recent-packages';

describe('selectRecentPackages', () => {
  it('keeps the 20 newest packages', () => {
    const records = Array.from({ length: 22 }, (_, index) => ({
      name: `game-${index}.schdk`,
      content: new Uint8Array(),
      openedAt: index,
    }));

    const recent = selectRecentPackages(records).map(({ name }) => name);

    expect(recent).toHaveLength(20);
    expect(recent[0]).toBe('game-21.schdk');
    expect(recent[19]).toBe('game-2.schdk');
  });
});
