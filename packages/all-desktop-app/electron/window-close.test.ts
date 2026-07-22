import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLOSE_TIMEOUT_MS, requestSaveBeforeClose } from './window-close';

describe('requestSaveBeforeClose', () => {
  afterEach(() => vi.useRealTimers());

  function setup() {
    let close: (event: { preventDefault(): void }) => void = () => undefined;
    const preventDefault = vi.fn();
    const sendCloseRequested = vi.fn();
    const destroy = vi.fn();
    const onFailure = vi.fn();
    const controller = requestSaveBeforeClose(
      {
        isDestroyed: () => false,
        destroy,
        onClose: (listener) => {
          close = listener;
        },
        sendCloseRequested,
      },
      onFailure,
    );
    return {
      close,
      controller,
      destroy,
      onFailure,
      preventDefault,
      sendCloseRequested,
    };
  }

  it('closes only after a frame reports a successful save', () => {
    vi.useFakeTimers();
    const {
      close,
      controller,
      destroy,
      onFailure,
      preventDefault,
      sendCloseRequested,
    } = setup();

    close({ preventDefault });
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(sendCloseRequested).toHaveBeenCalledWith(1);

    controller.finished(1, true);
    vi.advanceTimersByTime(CLOSE_TIMEOUT_MS);
    expect(destroy).toHaveBeenCalledOnce();
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('reports a failure when no frame responds', () => {
    vi.useFakeTimers();
    const { close, destroy, onFailure, preventDefault } = setup();

    close({ preventDefault });
    vi.advanceTimersByTime(CLOSE_TIMEOUT_MS);

    expect(onFailure).toHaveBeenCalledOnce();
    expect(destroy).not.toHaveBeenCalled();
  });
});
