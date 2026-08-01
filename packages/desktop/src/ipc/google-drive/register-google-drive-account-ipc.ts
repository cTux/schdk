import type { GameQuestionGenerationRequest } from '@schdk/ai';
import { ipcMain } from 'electron';
import {
  loadAiApiKey,
  saveAiApiKey,
} from '../../services/ai-credentials/ai-credentials.js';
import { connectGoogleDrive } from '../../services/google-drive/connect-google-drive.js';
import { disconnectGoogleDrive } from '../../services/google-drive/google-drive-auth.js';
import { getGoogleDriveStatus } from '../../services/google-drive/get-google-drive-status.js';
import { GOOGLE_DRIVE_IPC_CHANNELS } from './google-drive-ipc-channels.js';
import { googleDriveClient } from './google-drive-ipc-client.js';

const generationControllers = new Map<string, AbortController>();

export function registerGoogleDriveAccountIpc() {
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.status, getGoogleDriveStatus);
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.connect, connectGoogleDrive);
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.disconnect, disconnectGoogleDrive);
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.hasAiApiKey, async () => {
    if (await googleDriveClient.loadAiApiKey()) return true;
    const legacyApiKey = await loadAiApiKey();
    if (!legacyApiKey) return false;
    await googleDriveClient.saveAiApiKey(legacyApiKey);
    await saveAiApiKey(null);
    return true;
  });
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.saveAiApiKey,
    async (_event, apiKey) => {
      if (apiKey !== null && typeof apiKey !== 'string') {
        throw new TypeError('Invalid AI API key');
      }
      await googleDriveClient.saveAiApiKey(apiKey);
      await saveAiApiKey(null);
    },
  );
  ipcMain.on(
    GOOGLE_DRIVE_IPC_CHANNELS.cancelAiQuestionGeneration,
    (_event, requestId) => {
      if (typeof requestId === 'string') {
        generationControllers.get(requestId)?.abort();
      }
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.generateAiQuestion,
    async (_event, requestId, request) => {
      if (typeof requestId !== 'string' || !requestId) {
        throw new TypeError('Invalid AI generation request');
      }
      const controller = new AbortController();
      generationControllers.set(requestId, controller);
      try {
        const apiKey = await googleDriveClient.loadAiApiKey();
        if (!apiKey) throw new Error('AI API key is not configured');
        controller.signal.throwIfAborted();
        const { generateGameQuestion } = await import('@schdk/ai');
        return await generateGameQuestion({
          ...(request as GameQuestionGenerationRequest),
          apiKey,
          abortSignal: controller.signal,
        });
      } finally {
        generationControllers.delete(requestId);
      }
    },
  );
}
