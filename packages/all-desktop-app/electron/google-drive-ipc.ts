import {
  GoogleDriveClient,
  parseDriveSettingsDocument,
} from '@schdk/google-drive';
import { ipcMain } from 'electron';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getGoogleDriveAccessToken,
  getGoogleDriveStatus,
} from './google-drive-auth.js';

const client = new GoogleDriveClient(getGoogleDriveAccessToken);

export function registerGoogleDriveIpc() {
  ipcMain.handle('google-drive-status', getGoogleDriveStatus);
  ipcMain.handle('connect-google-drive', connectGoogleDrive);
  ipcMain.handle('disconnect-google-drive', disconnectGoogleDrive);
  ipcMain.handle('load-google-drive-settings', () => client.loadSettings());
  ipcMain.handle('save-google-drive-settings', async (_event, value) => {
    const settings = parseDriveSettingsDocument(value);
    if (!settings) throw new TypeError('Invalid Google Drive settings');
    await client.saveSettings(settings);
  });
}
