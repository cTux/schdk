import { describe, expect, it, vi } from 'vitest';
import { saveWithPicker, type SaveFilePicker } from './browser-save';

describe('saveWithPicker', () => {
  it('writes the package through the browser save dialog', async () => {
    const write = vi.fn();
    const close = vi.fn();
    const picker = vi.fn(async () => ({
      name: 'saved.schdk',
      createWritable: async () => ({ write, close }),
    }));

    await expect(
      saveWithPicker(picker, 'game.schdk', new Uint8Array([1, 2, 3])),
    ).resolves.toBe('saved.schdk');
    expect(picker).toHaveBeenCalledWith(
      expect.objectContaining({ suggestedName: 'game.schdk' }),
    );
    expect(write).toHaveBeenCalledWith(expect.any(Blob));
    expect(close).toHaveBeenCalledOnce();
  });

  it('keeps editing when the save dialog is canceled', async () => {
    const canceled = Object.assign(new Error('Canceled'), {
      name: 'AbortError',
    });
    const picker = vi.fn(() => Promise.reject(canceled)) as SaveFilePicker;

    await expect(
      saveWithPicker(picker, 'game.schdk', new Uint8Array()),
    ).resolves.toBeNull();
  });
});
