import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  openGamePackage: (file: File) =>
    ipcRenderer.invoke('open-game-package', webUtils.getPathForFile(file)),
  listRecentGamePackages: () => ipcRenderer.invoke('list-recent-game-packages'),
  openRecentGamePackage: (filePath: string) =>
    ipcRenderer.invoke('open-recent-game-package', filePath),
});
