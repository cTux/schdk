import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  openGamePackage: (): Promise<string | null> =>
    ipcRenderer.invoke('open-game-package'),
  saveGamePackage: (filename: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('save-game-package', filename, content),
});
