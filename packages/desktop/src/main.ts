import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerAppUpdateIpc } from './services/app-updates/app-update.js';
import { registerGamePackageIpc } from './ipc/game-packages/game-package-ipc.js';
import { closePresenterNotes } from './ipc/presenter-notes/presenter-notes.js';
import { registerPresenterNotesIpc } from './ipc/presenter-notes/register-presenter-notes-ipc.js';
import { registerGoogleDriveIpc } from './ipc/google-drive/google-drive-ipc.js';
import {
  requestSaveBeforeClose,
  type CloseController,
} from './utils/window-close/window-close.js';

const closeControllers = new Map<number, CloseController>();
let mainWindow: BrowserWindow | null = null;
let editorPackageOpen = false;

function attachSmokeTest(window: BrowserWindow) {
  if (!process.argv.includes('--smoke-test')) return;
  const timeout = setTimeout(() => {
    console.error('Electron smoke test timed out');
    app.exit(1);
  }, 15_000);
  window.webContents.once('did-fail-load', (_event, code, description) => {
    clearTimeout(timeout);
    console.error(`Electron smoke test failed to load: ${code} ${description}`);
    app.exit(1);
  });
  window.webContents.once('did-finish-load', async () => {
    try {
      const passed = await window.webContents.executeJavaScript(
        "Boolean(document.querySelector('#root')?.childElementCount && window.desktop?.googleDrive?.status && window.desktop?.updates?.check)",
      );
      if (!passed) throw new Error('Renderer or preload bridge is unavailable');
      clearTimeout(timeout);
      app.exit(0);
    } catch (error) {
      clearTimeout(timeout);
      console.error('Electron smoke test failed', error);
      app.exit(1);
    }
  });
}

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
  attachSmokeTest(window);

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
        if (!editorPackageOpen) return false;
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
    editorPackageOpen = false;
    closePresenterNotes();
  });

  void window.loadFile(
    app.isPackaged
      ? join(process.resourcesPath, 'web/index.html')
      : fileURLToPath(new URL('../../../web/dist/index.html', import.meta.url)),
  );
}

ipcMain.on('close-attempt-finished', (event, attempt, succeeded) => {
  const hasValidAttempt = Number.isSafeInteger(attempt) && attempt >= 1;
  const hasValidResult = typeof succeeded === 'boolean';
  if (!hasValidAttempt || !hasValidResult) return;
  closeControllers.get(event.sender.id)?.finished(attempt, succeeded);
});

ipcMain.on('set-editor-package-open', (event, open) => {
  const hasValidOpenState = typeof open === 'boolean';
  const isMainWindowSender =
    mainWindow && event.sender.id === mainWindow.webContents.id;
  if (hasValidOpenState && isMainWindowSender) {
    editorPackageOpen = open;
  }
});

registerGamePackageIpc();
registerGoogleDriveIpc();
registerPresenterNotesIpc(() => mainWindow);
registerAppUpdateIpc();

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
