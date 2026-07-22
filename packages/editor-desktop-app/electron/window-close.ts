import type { BrowserWindow } from 'electron';

export function requestSaveBeforeClose(window: BrowserWindow) {
  window.on('close', (event) => {
    event.preventDefault();
    window.webContents.send('close-requested');
  });
}
