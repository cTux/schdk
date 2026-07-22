import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  saveGamePackage: (
    filename: string,
    content: string,
  ): Promise<string | null> =>
    ipcRenderer.invoke('save-game-package', filename, content),
  openGamePackage: (file: File) =>
    ipcRenderer.invoke('open-game-package', webUtils.getPathForFile(file)),
  writeGamePackage: (filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke('write-game-package', filePath, content),
  onCloseRequested: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('close-requested', listener);
    return () => ipcRenderer.removeListener('close-requested', listener);
  },
  closeWindow: () => ipcRenderer.send('close-window'),
});
