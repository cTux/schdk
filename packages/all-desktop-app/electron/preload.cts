import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
  webUtils,
} from 'electron';

const closeApi = {
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
};

const editorApi = {
  saveGamePackage: (
    filename: string,
    content: Uint8Array,
  ): Promise<string | null> =>
    ipcRenderer.invoke('save-game-package', filename, content),
  openGamePackage: (file: File) =>
    ipcRenderer.invoke('open-game-package', webUtils.getPathForFile(file)),
  openHostGamePackage: (file: File) =>
    ipcRenderer.invoke('open-host-game-package', webUtils.getPathForFile(file)),
  listRecentGamePackages: () => ipcRenderer.invoke('list-recent-game-packages'),
  openRecentGamePackage: (filePath: string) =>
    ipcRenderer.invoke('open-recent-game-package', filePath),
  openRecentHostGamePackage: (filePath: string) =>
    ipcRenderer.invoke('open-recent-host-game-package', filePath),
  writeGamePackage: (filePath: string, content: Uint8Array): Promise<void> =>
    ipcRenderer.invoke('write-game-package', filePath, content),
  setPresenterNotes: (
    notes: {
      questionNumber: number;
      questionCount: number;
      notes: string;
    } | null,
  ): void => ipcRenderer.send('set-presenter-notes', notes),
  ...closeApi,
  googleDrive: {
    status: () => ipcRenderer.invoke('google-drive-status'),
    connect: () => ipcRenderer.invoke('connect-google-drive'),
    disconnect: () => ipcRenderer.invoke('disconnect-google-drive'),
    loadSettings: () => ipcRenderer.invoke('load-google-drive-settings'),
    saveSettings: (settings: unknown) =>
      ipcRenderer.invoke('save-google-drive-settings', settings),
  },
};

contextBridge.exposeInMainWorld('desktop', editorApi);
