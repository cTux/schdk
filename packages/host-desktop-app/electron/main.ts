import { app, BrowserWindow, Menu } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
