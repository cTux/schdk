import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hasEditableGamePackages,
  loadRecentGamePackages,
  registerGamePackageIpc,
} from './game-package-ipc.js';
import {
  closePresenterNotes,
  registerPresenterNotesIpc,
} from './presenter-notes.js';
import {
  requestSaveBeforeClose,
  type CloseController,
} from './window-close.js';

const closeControllers = new Map<number, CloseController>();
let mainWindow: BrowserWindow | null = null;

async function handleCloseFailure(
  window: BrowserWindow,
  controller: CloseController,
) {
  if (window.isDestroyed()) return;
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    title: 'Не вдалося закрити ЩДК',
    message: 'Не вдалося зберегти файл пакета.',
    detail:
      'Можна повторити збереження або закрити застосунок із ризиком втратити останні зміни.',
    buttons: [
      'Повторити збереження',
      'Закрити без збереження',
      'Скасувати закриття',
    ],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
  });

  if (response === 0) controller.retry();
  else if (response === 1) controller.discard();
  else controller.cancel();
}

function createWindow() {
  const window = new BrowserWindow({
    icon: app.isPackaged
      ? undefined
      : fileURLToPath(new URL('../../build/owl.png', import.meta.url)),
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: fileURLToPath(new URL('./preload.cjs', import.meta.url)),
    },
  });
  mainWindow = window;
  window.maximize();

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  const webContentsId = window.webContents.id;
  let closeController: CloseController;
  closeController = requestSaveBeforeClose(
    {
      isDestroyed: () => window.isDestroyed(),
      destroy: () => window.destroy(),
      onClose: (listener) => window.on('close', listener),
      sendCloseRequested: (attempt) => {
        if (!hasEditableGamePackages()) return false;
        window.webContents.send('close-requested', attempt);
        return true;
      },
    },
    () => void handleCloseFailure(window, closeController),
  );
  closeControllers.set(webContentsId, closeController);
  window.on('closed', () => {
    closeControllers.delete(webContentsId);
    if (mainWindow === window) mainWindow = null;
    closePresenterNotes();
  });

  void window.loadFile(
    app.isPackaged
      ? join(process.resourcesPath, 'web/index.html')
      : fileURLToPath(
          new URL('../../../all-web-app/dist/index.html', import.meta.url),
        ),
  );
}

ipcMain.on('close-attempt-finished', (event, attempt, succeeded) => {
  if (
    !Number.isSafeInteger(attempt) ||
    attempt < 1 ||
    typeof succeeded !== 'boolean'
  )
    return;
  closeControllers.get(event.sender.id)?.finished(attempt, succeeded);
});

registerGamePackageIpc();
registerPresenterNotesIpc(() => mainWindow);

app.whenReady().then(async () => {
  await loadRecentGamePackages();
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
