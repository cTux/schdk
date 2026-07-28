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
  updates: {
    check: (): Promise<boolean> => ipcRenderer.invoke('check-app-update'),
    openReleasePage: (): Promise<void> =>
      ipcRenderer.invoke('open-app-release-page'),
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
    hasAiApiKey: (): Promise<boolean> =>
      ipcRenderer.invoke('has-google-drive-ai-api-key'),
    saveAiApiKey: (apiKey: string | null): Promise<void> =>
      ipcRenderer.invoke('save-google-drive-ai-api-key', apiKey),
    generateAiQuestion: (request: {
      provider: string;
      model: string;
      locale: 'uk' | 'en';
      template: {
        name: string;
        description: string;
        goodExamples: string;
        badExamples: string;
        enabled: boolean;
        favorite: boolean;
      };
      context: string;
    }) => ipcRenderer.invoke('generate-ai-question', request),
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
    listAIQuestions: () => ipcRenderer.invoke('list-google-drive-ai-questions'),
    loadAIQuestion: (fileId: string) =>
      ipcRenderer.invoke('load-google-drive-ai-question', fileId),
    createAIQuestion: (value: unknown) =>
      ipcRenderer.invoke('create-google-drive-ai-question', value),
    updateAIQuestion: (fileId: string, value: unknown) =>
      ipcRenderer.invoke('update-google-drive-ai-question', fileId, value),
    deleteAIQuestion: (fileId: string) =>
      ipcRenderer.invoke('delete-google-drive-ai-question', fileId),
    listAIQuestionsPackages: () =>
      ipcRenderer.invoke('list-google-drive-ai-questions-packages'),
    loadAIQuestionsPackage: (fileId: string) =>
      ipcRenderer.invoke('load-google-drive-ai-questions-package', fileId),
    createAIQuestionsPackage: (value: unknown) =>
      ipcRenderer.invoke('create-google-drive-ai-questions-package', value),
    updateAIQuestionsPackage: (fileId: string, value: unknown) =>
      ipcRenderer.invoke(
        'update-google-drive-ai-questions-package',
        fileId,
        value,
      ),
    deleteAIQuestionsPackage: (fileId: string) =>
      ipcRenderer.invoke('delete-google-drive-ai-questions-package', fileId),
    listGlobalAIQuestions: () => ipcRenderer.invoke('list-global-ai-questions'),
    loadGlobalAIQuestion: (fileId: string) =>
      ipcRenderer.invoke('load-global-ai-question', fileId),
    createGlobalAIQuestion: (value: unknown) =>
      ipcRenderer.invoke('create-global-ai-question', value),
    updateGlobalAIQuestion: (fileId: string, value: unknown) =>
      ipcRenderer.invoke('update-global-ai-question', fileId, value),
    deleteGlobalAIQuestion: (fileId: string) =>
      ipcRenderer.invoke('delete-global-ai-question', fileId),
  },
};

contextBridge.exposeInMainWorld('desktop', editorApi);
