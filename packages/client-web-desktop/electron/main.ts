import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
  });

  void window.loadFile(
    fileURLToPath(new URL('../dist/index.html', import.meta.url)),
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
