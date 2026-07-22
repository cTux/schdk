import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  requestSaveBeforeClose,
  type CloseController,
} from './window-close.js';

const editableGamePackages = new Set<string>();
const closeControllers = new Map<number, CloseController>();

async function handleCloseFailure(
  window: BrowserWindow,
  controller: CloseController,
) {
  if (window.isDestroyed()) return;
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    title: 'Не вдалося закрити SCHDK',
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
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      nodeIntegrationInSubFrames: true,
      preload: fileURLToPath(new URL('./preload.cjs', import.meta.url)),
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const webContentsId = window.webContents.id;
  let closeController: CloseController;
  closeController = requestSaveBeforeClose(
    {
      isDestroyed: () => window.isDestroyed(),
      destroy: () => window.destroy(),
      onClose: (listener) => window.on('close', listener),
      sendCloseRequested: (attempt) => {
        for (const frame of window.webContents.mainFrame.framesInSubtree) {
          frame.send('close-requested', attempt);
        }
      },
    },
    () => void handleCloseFailure(window, closeController),
  );
  closeControllers.set(webContentsId, closeController);
  window.on('closed', () => closeControllers.delete(webContentsId));

  void window.loadFile(
    app.isPackaged
      ? join(process.resourcesPath, 'web/index.html')
      : fileURLToPath(
          new URL('../../../all-web-app/dist/index.html', import.meta.url),
        ),
  );
}

ipcMain.handle('save-game-package', async (_event, filename, content) => {
  if (typeof filename !== 'string' || !(content instanceof Uint8Array)) {
    throw new TypeError('Invalid game package');
  }

  const result = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [{ name: 'Пакет Що? Де? Коли?', extensions: ['schdk'] }],
  });
  if (result.canceled || !result.filePath) return null;

  const filePath = /\.schdk$/iu.test(result.filePath)
    ? result.filePath
    : `${result.filePath}.schdk`;
  await writeFile(filePath, content);
  editableGamePackages.add(filePath);
  return filePath;
});

ipcMain.handle('open-game-package', async (_event, filePath) => {
  if (typeof filePath !== 'string' || !/\.schdk$/iu.test(filePath)) {
    throw new TypeError('Invalid file path');
  }

  const content = await readFile(filePath);
  editableGamePackages.add(filePath);
  return { filePath, content: new Uint8Array(content) };
});

ipcMain.handle('write-game-package', async (_event, filePath, content) => {
  if (
    typeof filePath !== 'string' ||
    !(content instanceof Uint8Array) ||
    !editableGamePackages.has(filePath)
  ) {
    throw new TypeError('Invalid game package');
  }

  await writeFile(filePath, content);
});

ipcMain.on('close-attempt-finished', (event, attempt, succeeded) => {
  if (
    !Number.isSafeInteger(attempt) ||
    attempt < 1 ||
    typeof succeeded !== 'boolean'
  )
    return;
  closeControllers.get(event.sender.id)?.finished(attempt, succeeded);
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
