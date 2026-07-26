import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

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
  aiCredentials: {
    hasApiKey: (): Promise<boolean> => ipcRenderer.invoke('has-ai-api-key'),
    saveApiKey: (apiKey: string | null): Promise<void> =>
      ipcRenderer.invoke('save-ai-api-key', apiKey),
  },
  saveGamePackage: (
    filename: string,
    content: Uint8Array,
  ): Promise<string | null> =>
    ipcRenderer.invoke('save-game-package', filename, content),
  setEditorPackageOpen: (open: boolean): void =>
    ipcRenderer.send('set-editor-package-open', open),
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
    listGamePackages: () =>
      ipcRenderer.invoke('list-google-drive-game-packages'),
    loadGamePackage: (fileId: string) =>
      ipcRenderer.invoke('load-google-drive-game-package', fileId),
    createGamePackage: (value: unknown) =>
      ipcRenderer.invoke('create-google-drive-game-package', value),
    updateGamePackage: (fileId: string, value: unknown) =>
      ipcRenderer.invoke('update-google-drive-game-package', fileId, value),
    deleteGamePackage: (fileId: string) =>
      ipcRenderer.invoke('delete-google-drive-game-package', fileId),
  },
};

contextBridge.exposeInMainWorld('desktop', editorApi);
