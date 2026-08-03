import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { GameQuestionGenerationRequest } from '@schdk/ai';

let generationRequestId = 0;

// Keep this self-contained mirror synchronized with google-drive-ipc-channels.ts.
const googleDriveIpcChannels = {
  status: 'google-drive-status',
  connect: 'connect-google-drive',
  disconnect: 'disconnect-google-drive',
  hasAiApiKey: 'has-google-drive-ai-api-key',
  saveAiApiKey: 'save-google-drive-ai-api-key',
  cancelAiQuestionGeneration: 'cancel-ai-question-generation',
  generateAiQuestion: 'generate-ai-question',
  loadSettings: 'load-google-drive-settings',
  saveSettings: 'save-google-drive-settings',
  loadVisualAssets: 'load-google-drive-visual-assets',
  saveVisualAssets: 'save-google-drive-visual-assets',
  loadQuestionDatabase: 'load-question-database',
  saveQuestionDatabase: 'save-question-database',
  listGamePackages: 'list-google-drive-game-packages',
  loadGamePackage: 'load-google-drive-game-package',
  createGamePackage: 'create-google-drive-game-package',
  updateGamePackage: 'update-google-drive-game-package',
  deleteGamePackage: 'delete-google-drive-game-package',
  listAiQuestions: 'list-google-drive-ai-questions',
  loadAiQuestion: 'load-google-drive-ai-question',
  createAiQuestion: 'create-google-drive-ai-question',
  updateAiQuestion: 'update-google-drive-ai-question',
  deleteAiQuestion: 'delete-google-drive-ai-question',
  listAiQuestionPackages: 'list-google-drive-ai-questions-packages',
  loadAiQuestionPackage: 'load-google-drive-ai-questions-package',
  createAiQuestionPackage: 'create-google-drive-ai-questions-package',
  updateAiQuestionPackage: 'update-google-drive-ai-questions-package',
  deleteAiQuestionPackage: 'delete-google-drive-ai-questions-package',
  listGlobalAiQuestions: 'list-global-ai-questions',
  loadGlobalAiQuestion: 'load-global-ai-question',
  createGlobalAiQuestion: 'create-global-ai-question',
  updateGlobalAiQuestion: 'update-global-ai-question',
  deleteGlobalAiQuestion: 'delete-global-ai-question',
  listDictionaries: 'list-google-drive-dictionaries',
  loadDictionary: 'load-google-drive-dictionary',
  createDictionary: 'create-google-drive-dictionary',
  updateDictionary: 'update-google-drive-dictionary',
} as const;

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
    status: () => ipcRenderer.invoke(googleDriveIpcChannels.status),
    connect: () => ipcRenderer.invoke(googleDriveIpcChannels.connect),
    disconnect: () => ipcRenderer.invoke(googleDriveIpcChannels.disconnect),
    hasAiApiKey: (): Promise<boolean> =>
      ipcRenderer.invoke(googleDriveIpcChannels.hasAiApiKey),
    saveAiApiKey: (apiKey: string | null): Promise<void> =>
      ipcRenderer.invoke(googleDriveIpcChannels.saveAiApiKey, apiKey),
    generateAiQuestion: (
      request: GameQuestionGenerationRequest,
      signal?: AbortSignal,
    ) => {
      const requestId = `${Date.now()}-${++generationRequestId}`;
      const cancel = () =>
        ipcRenderer.send(
          googleDriveIpcChannels.cancelAiQuestionGeneration,
          requestId,
        );
      if (signal?.aborted) {
        return Promise.reject(new Error('AI generation aborted'));
      }
      signal?.addEventListener('abort', cancel, { once: true });
      return ipcRenderer
        .invoke(googleDriveIpcChannels.generateAiQuestion, requestId, request)
        .finally(() => signal?.removeEventListener('abort', cancel));
    },
    loadSettings: () => ipcRenderer.invoke(googleDriveIpcChannels.loadSettings),
    saveSettings: (settings: unknown, expectedEtag: string | null) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.saveSettings,
        settings,
        expectedEtag,
      ),
    loadVisualAssets: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadVisualAssets),
    saveVisualAssets: (assets: unknown, expectedEtag: string | null) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.saveVisualAssets,
        assets,
        expectedEtag,
      ),
    loadQuestionDatabase: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadQuestionDatabase),
    saveQuestionDatabase: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.saveQuestionDatabase, value),
    listGamePackages: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.listGamePackages),
    loadGamePackage: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadGamePackage, fileId),
    createGamePackage: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.createGamePackage, value),
    updateGamePackage: (
      fileId: string,
      expectedModifiedTime: string,
      value: unknown,
    ) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.updateGamePackage,
        fileId,
        expectedModifiedTime,
        value,
      ),
    deleteGamePackage: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.deleteGamePackage, fileId),
    listAIQuestions: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.listAiQuestions),
    loadAIQuestion: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadAiQuestion, fileId),
    createAIQuestion: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.createAiQuestion, value),
    updateAIQuestion: (fileId: string, value: unknown) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.updateAiQuestion,
        fileId,
        value,
      ),
    deleteAIQuestion: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.deleteAiQuestion, fileId),
    listAIQuestionsPackages: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.listAiQuestionPackages),
    loadAIQuestionsPackage: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadAiQuestionPackage, fileId),
    createAIQuestionsPackage: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.createAiQuestionPackage, value),
    updateAIQuestionsPackage: (fileId: string, value: unknown) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.updateAiQuestionPackage,
        fileId,
        value,
      ),
    deleteAIQuestionsPackage: (fileId: string) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.deleteAiQuestionPackage,
        fileId,
      ),
    listGlobalAIQuestions: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.listGlobalAiQuestions),
    loadGlobalAIQuestion: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadGlobalAiQuestion, fileId),
    createGlobalAIQuestion: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.createGlobalAiQuestion, value),
    updateGlobalAIQuestion: (fileId: string, value: unknown) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.updateGlobalAiQuestion,
        fileId,
        value,
      ),
    deleteGlobalAIQuestion: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.deleteGlobalAiQuestion, fileId),
    listDictionaries: () =>
      ipcRenderer.invoke(googleDriveIpcChannels.listDictionaries),
    loadDictionary: (fileId: string) =>
      ipcRenderer.invoke(googleDriveIpcChannels.loadDictionary, fileId),
    createDictionary: (value: unknown) =>
      ipcRenderer.invoke(googleDriveIpcChannels.createDictionary, value),
    updateDictionary: (fileId: string, value: unknown) =>
      ipcRenderer.invoke(
        googleDriveIpcChannels.updateDictionary,
        fileId,
        value,
      ),
  },
};

contextBridge.exposeInMainWorld('desktop', editorApi);
