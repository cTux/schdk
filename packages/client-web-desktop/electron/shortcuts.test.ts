import { describe, expect, it } from 'vitest';
import { isReloadShortcut } from './shortcuts';

describe('desktop shortcuts', () => {
  it('blocks reload without blocking other shortcuts', () => {
    expect(isReloadShortcut({ key: 'F5', control: false, meta: false })).toBe(
      true,
    );
    expect(isReloadShortcut({ key: 'r', control: true, meta: false })).toBe(
      true,
    );
    expect(isReloadShortcut({ key: 'R', control: false, meta: true })).toBe(
      true,
    );
    expect(isReloadShortcut({ key: 's', control: true, meta: false })).toBe(
      false,
    );
  });
});
