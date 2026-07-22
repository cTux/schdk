import { describe, expect, it, vi } from 'vitest';
import { requestSaveBeforeClose } from './window-close';

describe('requestSaveBeforeClose', () => {
  it('asks the renderer to save instead of closing immediately', () => {
    const preventDefault = vi.fn();
    const send = vi.fn();
    const window = {
      on: vi.fn((_event, listener) => listener({ preventDefault })),
      webContents: { send },
    };

    requestSaveBeforeClose(window as never);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith('close-requested');
  });
});
