import type { GoogleDriveAppData } from './app-data.js';
import { AI_CREDENTIALS_NAME } from './ai-credentials-name.js';
import { normalizeAiApiKey } from './normalize-ai-api-key.js';

export function saveAiApiKey(
  appData: GoogleDriveAppData,
  apiKey: string | null,
) {
  return appData.save(AI_CREDENTIALS_NAME, {
    schemaVersion: 1,
    apiKey: normalizeAiApiKey(apiKey),
  });
}
