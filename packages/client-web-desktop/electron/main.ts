import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isReloadShortcut } from './shortcuts.js';

function createWindow() {
  const window = new BrowserWindow({
    icon: fileURLToPath(new URL('../build/owl.png', import.meta.url)),
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 680,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: fileURLToPath(new URL('./preload.js', import.meta.url)),
    },
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (isReloadShortcut(input)) event.preventDefault();
  });
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  void window.loadFile(
    fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  );
}

ipcMain.handle('save-game-package', async (_event, filename, content) => {
  if (typeof filename !== 'string' || typeof content !== 'string') {
    throw new TypeError('Invalid game package');
  }

  const extension = filename.endsWith('.schdk-draft') ? 'schdk-draft' : 'schdk';
  const result = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [{ name: 'Пакет Що? Де? Коли?', extensions: [extension] }],
  });
  if (result.canceled || !result.filePath) return false;

  await writeFile(result.filePath, content, 'utf8');
  return true;
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
