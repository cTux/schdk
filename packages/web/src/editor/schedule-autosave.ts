import { AUTOSAVE_DELAY_MS } from './autosave';

export function scheduleAutosave(save: () => void): () => void {
  const timeout = globalThis.setTimeout(save, AUTOSAVE_DELAY_MS);
  return () => globalThis.clearTimeout(timeout);
}
