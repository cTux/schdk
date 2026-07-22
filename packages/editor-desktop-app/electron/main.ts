import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isReloadShortcut } from './shortcuts.js';
import {
  requestSaveBeforeClose,
  type CloseController,
} from './window-close.js';

const editableGamePackages = new Set<string>();
const closeControllers = new Map<number, CloseController>();
const RECENT_LIMIT = 5;
let recentGamePackages: string[] = [];

function recentGamePackagesPath() {
  return join(app.getPath('userData'), 'recent-game-packages.json');
}

async function loadRecentGamePackages() {
  try {
    const value: unknown = JSON.parse(
      await readFile(recentGamePackagesPath(), 'utf8'),
    );
    return Array.isArray(value)
      ? value.filter(
          (path): path is string =>
            typeof path === 'string' && /\.schdk$/iu.test(path),
        )
      : [];
  } catch {
    return [];
  }
}

async function rememberGamePackage(filePath: string) {
  recentGamePackages = [
    filePath,
    ...recentGamePackages.filter((path) => path !== filePath),
  ].slice(0, RECENT_LIMIT);
  await persistRecentGamePackages();
}

async function forgetGamePackage(filePath: string) {
  recentGamePackages = recentGamePackages.filter((path) => path !== filePath);
  await persistRecentGamePackages();
}

async function persistRecentGamePackages() {
  try {
    await writeFile(
      recentGamePackagesPath(),
      JSON.stringify(recentGamePackages),
    );
  } catch {
    // A package operation must not fail only because the recent list cannot persist.
  }
}

async function handleCloseFailure(
  window: BrowserWindow,
  controller: CloseController,
) {
  if (window.isDestroyed()) return;
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    title: 'Не вдалося закрити редактор',
    message: 'Не вдалося зберегти файл пакета.',
    detail:
      'Можна повторити збереження або закрити редактор з ризиком втратити останні зміни.',
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
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 680,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: fileURLToPath(new URL('./preload.cjs', import.meta.url)),
    },
  });
  window.maximize();

  window.webContents.on('before-input-event', (event, input) => {
    if (isReloadShortcut(input)) event.preventDefault();
  });
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const webContentsId = window.webContents.id;
  let closeController: CloseController;
  closeController = requestSaveBeforeClose(window, () => {
    void handleCloseFailure(window, closeController);
  });
  closeControllers.set(webContentsId, closeController);
  window.on('closed', () => closeControllers.delete(webContentsId));

  void window.loadFile(
    app.isPackaged
      ? join(process.resourcesPath, 'web/index.html')
      : fileURLToPath(
          new URL('../../../editor-web-app/dist/index.html', import.meta.url),
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
  await rememberGamePackage(filePath);
  return filePath;
});

ipcMain.handle('open-game-package', async (_event, filePath) => {
  if (typeof filePath !== 'string' || !/\.schdk$/iu.test(filePath)) {
    throw new TypeError('Invalid file path');
  }

  const content = await readFile(filePath);
  editableGamePackages.add(filePath);
  await rememberGamePackage(filePath);
  return { filePath, content: new Uint8Array(content) };
});

ipcMain.handle('list-recent-game-packages', () =>
  recentGamePackages.map((filePath) => ({
    filePath,
    fileName: basename(filePath),
  })),
);

ipcMain.handle('open-recent-game-package', async (_event, filePath) => {
  if (typeof filePath !== 'string' || !recentGamePackages.includes(filePath)) {
    throw new TypeError('Invalid recent game package');
  }

  try {
    const content = await readFile(filePath);
    editableGamePackages.add(filePath);
    await rememberGamePackage(filePath);
    return {
      filePath,
      fileName: basename(filePath),
      content: new Uint8Array(content),
    };
  } catch (error) {
    await forgetGamePackage(filePath);
    throw error;
  }
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
  const controller = closeControllers.get(event.sender.id);
  controller?.finished(attempt, succeeded);
});

app.whenReady().then(async () => {
  recentGamePackages = await loadRecentGamePackages();
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
