import type { GoogleDriveAppData } from '../../types/app-data/app-data.js';
import { AI_CREDENTIALS_NAME } from '../../constants/ai-credentials/ai-credentials-name.js';
import { normalizeAiApiKey } from '../../utils/ai-credentials/normalize-ai-api-key.js';
import { saveAiApiKey } from '../../storage/ai-credentials/save-ai-api-key.js';

async function loadAiApiKey(appData: GoogleDriveAppData) {
  const value = await appData.load(AI_CREDENTIALS_NAME);
  if (value === null) return null;
  const hasExpectedSchema =
    typeof value === 'object' &&
    (value as { schemaVersion?: unknown }).schemaVersion === 1;
  if (!hasExpectedSchema) {
    throw new TypeError('Invalid AI credentials');
  }
  return normalizeAiApiKey((value as { apiKey?: unknown }).apiKey);
}

export { loadAiApiKey, saveAiApiKey };
