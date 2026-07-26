import { ipcMain } from 'electron';
import { loadAiApiKey, saveAiApiKey } from './ai-credentials.js';

export function registerAiCredentialsIpc() {
  ipcMain.handle('has-ai-api-key', async () => Boolean(await loadAiApiKey()));
  ipcMain.handle('save-ai-api-key', (_event, apiKey) => {
    if (apiKey !== null && typeof apiKey !== 'string') {
      throw new TypeError('Invalid AI API key');
    }
    return saveAiApiKey(apiKey);
  });
}
