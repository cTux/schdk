import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLOSE_TIMEOUT_MS, requestSaveBeforeClose } from './window-close';

describe('requestSaveBeforeClose', () => {
  afterEach(() => vi.useRealTimers());

  function setup() {
    let close: (event: { preventDefault(): void }) => void = () => undefined;
    const preventDefault = vi.fn();
    const send = vi.fn();
    const destroy = vi.fn();
    const onFailure = vi.fn();
    const window = {
      on: vi.fn((_event, listener) => {
        close = listener;
      }),
      isDestroyed: () => false,
      destroy,
      webContents: { send },
    };
    const controller = requestSaveBeforeClose(window as never, onFailure);
    return { close, controller, destroy, onFailure, preventDefault, send };
  }

  it('closes only after the renderer reports a successful save', () => {
    vi.useFakeTimers();
    const { close, controller, destroy, onFailure, preventDefault, send } =
      setup();

    close({ preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith('close-requested', 1);

    controller.finished(1, true);
    vi.advanceTimersByTime(CLOSE_TIMEOUT_MS);
    expect(destroy).toHaveBeenCalledOnce();
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('reports a failure when the renderer does not respond', () => {
    vi.useFakeTimers();
    const { close, destroy, onFailure, preventDefault } = setup();

    close({ preventDefault });
    vi.advanceTimersByTime(CLOSE_TIMEOUT_MS);

    expect(onFailure).toHaveBeenCalledOnce();
    expect(destroy).not.toHaveBeenCalled();
  });

  it('ignores a late result from an older attempt', () => {
    vi.useFakeTimers();
    const { close, controller, destroy, onFailure, preventDefault, send } =
      setup();

    close({ preventDefault });
    vi.advanceTimersByTime(CLOSE_TIMEOUT_MS);
    controller.retry();
    controller.finished(1, false);

    expect(send).toHaveBeenLastCalledWith('close-requested', 2);
    expect(onFailure).toHaveBeenCalledOnce();
    expect(destroy).not.toHaveBeenCalled();

    controller.finished(2, true);
    expect(destroy).toHaveBeenCalledOnce();
  });
});
