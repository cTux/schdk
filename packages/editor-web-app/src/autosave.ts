export const AUTOSAVE_DELAY_MS = 3_000;

export function scheduleAutosave(save: () => void): () => void {
  const timeout = globalThis.setTimeout(save, AUTOSAVE_DELAY_MS);
  return () => globalThis.clearTimeout(timeout);
}
