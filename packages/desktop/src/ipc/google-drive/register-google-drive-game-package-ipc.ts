import { isDriveFileId, parseDriveGamePackageWrite } from '@schdk/google-drive';
import { ipcMain } from 'electron';
import { GOOGLE_DRIVE_IPC_CHANNELS } from './google-drive-ipc-channels.js';
import { googleDriveClient } from './google-drive-ipc-client.js';

export function registerGoogleDriveGamePackageIpc() {
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.listGamePackages, () =>
    googleDriveClient.listGamePackages(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.loadGamePackage,
    (_event, fileId) => {
      if (!isDriveFileId(fileId))
        throw new TypeError('Invalid Google Drive file');
      return googleDriveClient.loadGamePackage(fileId);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.createGamePackage,
    (_event, value) => {
      const gamePackage = parseDriveGamePackageWrite(value);
      if (!gamePackage) throw new TypeError('Invalid Google Drive package');
      return googleDriveClient.createGamePackage(gamePackage);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.updateGamePackage,
    (_event, fileId, expectedModifiedTime, value) => {
      const gamePackage = parseDriveGamePackageWrite(value);
      const hasValidModifiedTime =
        typeof expectedModifiedTime === 'string' &&
        Number.isFinite(Date.parse(expectedModifiedTime));
      if (!isDriveFileId(fileId) || !hasValidModifiedTime || !gamePackage) {
        throw new TypeError('Invalid Google Drive package');
      }
      return googleDriveClient.updateGamePackage(
        fileId,
        expectedModifiedTime,
        gamePackage,
      );
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.deleteGamePackage,
    (_event, fileId) => {
      if (!isDriveFileId(fileId))
        throw new TypeError('Invalid Google Drive file');
      return googleDriveClient.deleteGamePackage(fileId);
    },
  );
}
