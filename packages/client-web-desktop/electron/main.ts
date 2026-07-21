import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 680,
    webPreferences: {
      contextIsolation: true,
      preload: fileURLToPath(new URL('./preload.js', import.meta.url)),
    },
  });

  void window.loadFile(
    fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  );
}

ipcMain.handle('save-game-package', async (_event, filename, content) => {
  if (typeof filename !== 'string' || typeof content !== 'string') {
    throw new TypeError('Invalid game package');
  }

  const result = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [{ name: 'Пакет Що? Де? Коли?', extensions: ['schdk'] }],
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
