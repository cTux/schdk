import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
  webUtils,
} from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  saveGamePackage: (
    filename: string,
    content: Uint8Array,
  ): Promise<string | null> =>
    ipcRenderer.invoke('save-game-package', filename, content),
  openGamePackage: (file: File) =>
    ipcRenderer.invoke('open-game-package', webUtils.getPathForFile(file)),
  writeGamePackage: (filePath: string, content: Uint8Array): Promise<void> =>
    ipcRenderer.invoke('write-game-package', filePath, content),
  onCloseRequested: (callback: (attempt: number) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, attempt: unknown) => {
      if (Number.isSafeInteger(attempt) && Number(attempt) > 0)
        callback(Number(attempt));
    };
    ipcRenderer.on('close-requested', listener);
    return () => ipcRenderer.removeListener('close-requested', listener);
  },
  finishCloseAttempt: (attempt: number, succeeded: boolean) =>
    ipcRenderer.send('close-attempt-finished', attempt, succeeded),
});
