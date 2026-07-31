import type { GoogleDriveAppData } from '../../types/app-data/app-data.js';
import { AI_CREDENTIALS_NAME } from '../../constants/ai-credentials/ai-credentials-name.js';
import { normalizeAiApiKey } from '../../utils/ai-credentials/normalize-ai-api-key.js';

export function saveAiApiKey(
  appData: GoogleDriveAppData,
  apiKey: string | null,
) {
  return appData.save(AI_CREDENTIALS_NAME, {
    schemaVersion: 1,
    apiKey: normalizeAiApiKey(apiKey),
  });
}
