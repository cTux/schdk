import { type ClosableWindow } from './closable-window.js';
import { type CloseController } from './close-controller.js';

export const CLOSE_TIMEOUT_MS = 10_000;

export function requestSaveBeforeClose(
  window: ClosableWindow,
  onFailure: () => void,
): CloseController {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let waiting = false;
  let currentAttempt = 0;

  function clearTimer() {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  }

  function failed(attempt: number) {
    if (!waiting || attempt !== currentAttempt) return;
    waiting = false;
    clearTimer();
    onFailure();
  }

  function retry() {
    if (waiting || window.isDestroyed()) return;
    waiting = true;
    const attempt = ++currentAttempt;
    if (!window.sendCloseRequested(attempt)) {
      discard();
      return;
    }
    timeout = setTimeout(() => failed(attempt), CLOSE_TIMEOUT_MS);
  }

  function discard() {
    waiting = false;
    clearTimer();
    if (!window.isDestroyed()) window.destroy();
  }

  window.onClose((event) => {
    event.preventDefault();
    retry();
  });

  return {
    finished(attempt, succeeded) {
      if (!waiting || attempt !== currentAttempt) return;
      if (succeeded) discard();
      else failed(attempt);
    },
    retry,
    discard,
    cancel() {
      waiting = false;
      clearTimer();
    },
  };
}
