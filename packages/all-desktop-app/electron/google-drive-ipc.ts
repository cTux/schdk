import {
  GoogleDriveClient,
  isDriveFileId,
  parseDriveSettingsDocument,
  parseDriveGamePackageWrite,
} from '@schdk/google-drive';
import { ipcMain } from 'electron';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getGoogleDriveAccessToken,
  getGoogleDriveStatus,
} from './google-drive-auth.js';
import { loadAiApiKey, saveAiApiKey } from './ai-credentials.js';

const client = new GoogleDriveClient(getGoogleDriveAccessToken);

export function registerGoogleDriveIpc() {
  ipcMain.handle('google-drive-status', getGoogleDriveStatus);
  ipcMain.handle('connect-google-drive', connectGoogleDrive);
  ipcMain.handle('disconnect-google-drive', disconnectGoogleDrive);
  ipcMain.handle('has-google-drive-ai-api-key', async () => {
    if (await client.loadAiApiKey()) return true;
    const legacyApiKey = await loadAiApiKey();
    if (!legacyApiKey) return false;
    await client.saveAiApiKey(legacyApiKey);
    await saveAiApiKey(null);
    return true;
  });
  ipcMain.handle('save-google-drive-ai-api-key', async (_event, apiKey) => {
    if (apiKey !== null && typeof apiKey !== 'string') {
      throw new TypeError('Invalid AI API key');
    }
    await client.saveAiApiKey(apiKey);
    await saveAiApiKey(null);
  });
  ipcMain.handle('load-google-drive-settings', () => client.loadSettings());
  ipcMain.handle('save-google-drive-settings', async (_event, value) => {
    const settings = parseDriveSettingsDocument(value);
    if (!settings) throw new TypeError('Invalid Google Drive settings');
    await client.saveSettings(settings);
  });
  ipcMain.handle('list-google-drive-game-packages', () =>
    client.listGamePackages(),
  );
  ipcMain.handle('load-google-drive-game-package', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.loadGamePackage(fileId);
  });
  ipcMain.handle('create-google-drive-game-package', (_event, value) => {
    const gamePackage = parseDriveGamePackageWrite(value);
    if (!gamePackage) throw new TypeError('Invalid Google Drive package');
    return client.createGamePackage(gamePackage);
  });
  ipcMain.handle(
    'update-google-drive-game-package',
    (_event, fileId, value) => {
      const gamePackage = parseDriveGamePackageWrite(value);
      if (!isDriveFileId(fileId) || !gamePackage) {
        throw new TypeError('Invalid Google Drive package');
      }
      return client.updateGamePackage(fileId, gamePackage);
    },
  );
  ipcMain.handle('delete-google-drive-game-package', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.deleteGamePackage(fileId);
  });
}
