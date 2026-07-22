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
});
