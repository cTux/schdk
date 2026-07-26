import { app, safeStorage } from 'electron';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const MAX_API_KEY_LENGTH = 16_384;
const apiKeyPath = () => join(app.getPath('userData'), 'ai-api-key.bin');

function canPersistApiKey() {
  return (
    safeStorage.isEncryptionAvailable() &&
    !(
      process.platform === 'linux' &&
      safeStorage.getSelectedStorageBackend() === 'basic_text'
    )
  );
}

export async function loadAiApiKey() {
  if (!canPersistApiKey()) return null;
  try {
    return safeStorage.decryptString(await readFile(apiKeyPath())) || null;
  } catch {
    return null;
  }
}

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
