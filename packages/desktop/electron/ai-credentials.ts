import { safeStorage } from 'electron';
import { readFile } from 'node:fs/promises';
import { canPersistApiKey } from './can-persist-api-key.js';
import { apiKeyPath } from './api-key-path.js';
import { saveAiApiKey } from './save-ai-api-key.js';

async function loadAiApiKey() {
  if (!canPersistApiKey()) return null;
  try {
    return safeStorage.decryptString(await readFile(apiKeyPath())) || null;
  } catch {
    return null;
  }
}

export { loadAiApiKey, saveAiApiKey };
