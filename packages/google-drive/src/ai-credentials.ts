import type { GoogleDriveAppData } from './app-data.js';

const AI_CREDENTIALS_NAME = 'ai-credentials-v1.json';
const MAX_AI_API_KEY_LENGTH = 16_384;

function normalizeAiApiKey(value: unknown) {
  if (value === null) return null;
  if (typeof value !== 'string') throw new TypeError('Invalid AI API key');
  const apiKey = value.trim();
  if (!apiKey || apiKey.length > MAX_AI_API_KEY_LENGTH) {
    throw new TypeError('Invalid AI API key');
  }
  return apiKey;
}

export async function loadAiApiKey(appData: GoogleDriveAppData) {
  const value = await appData.load(AI_CREDENTIALS_NAME);
  if (value === null) return null;
  if (
    typeof value !== 'object' ||
    (value as { schemaVersion?: unknown }).schemaVersion !== 1
  ) {
    throw new TypeError('Invalid AI credentials');
  }
  return normalizeAiApiKey((value as { apiKey?: unknown }).apiKey);
}

export function saveAiApiKey(
  appData: GoogleDriveAppData,
  apiKey: string | null,
) {
  return appData.save(AI_CREDENTIALS_NAME, {
    schemaVersion: 1,
    apiKey: normalizeAiApiKey(apiKey),
  });
}
