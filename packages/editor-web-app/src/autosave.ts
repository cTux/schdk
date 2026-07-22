export const AUTOSAVE_DELAY_MS = 1_000;

export function scheduleAutosave(save: () => void): () => void {
  const timeout = globalThis.setTimeout(save, AUTOSAVE_DELAY_MS);
  return () => globalThis.clearTimeout(timeout);
}

export function saveStatusAfterWrite(isLatest: boolean): 'saved' | 'pending' {
  return isLatest ? 'saved' : 'pending';
}

export function shouldScheduleAutosave(status: string, canWrite: boolean) {
  return status === 'pending' && canWrite;
}
