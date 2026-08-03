import {
  parseDriveSettingsDocument,
  parseDriveVisualAssetsDocument,
  parseQuestionDatabaseDocument,
} from '@schdk/google-drive';
import { ipcMain } from 'electron';
import { GOOGLE_DRIVE_IPC_CHANNELS } from './google-drive-ipc-channels.js';
import { googleDriveClient } from './google-drive-ipc-client.js';

export function registerGoogleDriveSettingsIpc() {
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.loadSettings, () =>
    googleDriveClient.loadSettings(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.saveSettings,
    async (_event, value, expectedEtag) => {
      const settings = parseDriveSettingsDocument(value);
      const hasValidEtag =
        expectedEtag === null ||
        (typeof expectedEtag === 'string' && expectedEtag.length > 0);
      if (!settings || !hasValidEtag) {
        throw new TypeError('Invalid Google Drive settings');
      }
      return googleDriveClient.saveSettings(settings, expectedEtag);
    },
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.loadVisualAssets, () =>
    googleDriveClient.loadVisualAssets(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.saveVisualAssets,
    async (_event, value, expectedEtag) => {
      const assets = parseDriveVisualAssetsDocument(value);
      const hasValidEtag =
        expectedEtag === null ||
        (typeof expectedEtag === 'string' && expectedEtag.length > 0);
      if (!assets || !hasValidEtag) {
        throw new TypeError('Invalid Google Drive visual assets');
      }
      return googleDriveClient.saveVisualAssets(assets, expectedEtag);
    },
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.loadQuestionDatabase, () =>
    googleDriveClient.loadQuestionDatabase(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.saveQuestionDatabase,
    async (_event, value) => {
      const database = parseQuestionDatabaseDocument(value);
      if (!database) throw new TypeError('Invalid question database');
      await googleDriveClient.saveQuestionDatabase(database);
    },
  );
}
