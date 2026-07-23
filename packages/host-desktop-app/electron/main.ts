import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RECENT_LIMIT = 20;
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

async function persistRecentGamePackages() {
  try {
    await writeFile(
      recentGamePackagesPath(),
      JSON.stringify(recentGamePackages),
    );
  } catch {
    // Opening a package must not fail only because recents cannot persist.
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

function createWindow() {
  const window = new BrowserWindow({
    icon: app.isPackaged
      ? undefined
      : fileURLToPath(
          new URL('../../editor-desktop-app/build/owl.png', import.meta.url),
        ),
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

  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  void window.loadFile(
    app.isPackaged
      ? join(process.resourcesPath, 'web/index.html')
      : fileURLToPath(
          new URL('../../../host-web-app/dist/index.html', import.meta.url),
        ),
  );
}

ipcMain.handle('open-game-package', async (_event, filePath) => {
  if (typeof filePath !== 'string' || !/\.schdk$/iu.test(filePath)) {
    throw new TypeError('Invalid file path');
  }
  const content = await readFile(filePath);
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
