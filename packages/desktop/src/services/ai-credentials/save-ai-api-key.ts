import { safeStorage } from 'electron';
import { rm, writeFile } from 'node:fs/promises';
import { apiKeyPath } from './api-key-path.js';
import { canPersistApiKey } from './can-persist-api-key.js';

const MAX_API_KEY_LENGTH = 16_384;

export async function saveAiApiKey(apiKey: string | null) {
  if (apiKey === null) {
    await rm(apiKeyPath(), { force: true });
    return;
  }
  const value = apiKey.trim();
  if (!value || value.length > MAX_API_KEY_LENGTH) {
    throw new TypeError('Invalid AI API key');
  }
  if (!canPersistApiKey()) {
    throw new Error('Encrypted credential storage is unavailable');
  }
  await writeFile(apiKeyPath(), safeStorage.encryptString(value));
}
