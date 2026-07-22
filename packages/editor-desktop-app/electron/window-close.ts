import type { BrowserWindow } from 'electron';

export const CLOSE_TIMEOUT_MS = 10_000;

export interface CloseController {
  finished(attempt: number, succeeded: boolean): void;
  retry(): void;
  discard(): void;
  cancel(): void;
}

export function requestSaveBeforeClose(
  window: BrowserWindow,
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
    window.webContents.send('close-requested', attempt);
    timeout = setTimeout(() => failed(attempt), CLOSE_TIMEOUT_MS);
  }

  function discard() {
    waiting = false;
    clearTimer();
    if (!window.isDestroyed()) window.destroy();
  }

  window.on('close', (event) => {
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
