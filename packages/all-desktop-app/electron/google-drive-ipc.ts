import {
  GoogleDriveClient,
  isDriveFileId,
  parseDriveAIQuestionsPackageWrite,
  parseDriveAIQuestionWrite,
  parseDriveSettingsDocument,
  parseDriveGamePackageWrite,
} from '@schdk/google-drive';
import { ipcMain } from 'electron';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getGoogleDriveAccessToken,
  getGoogleDriveStatus,
} from './google-drive-auth.js';
import { loadAiApiKey, saveAiApiKey } from './ai-credentials.js';

const client = new GoogleDriveClient(getGoogleDriveAccessToken);

export function registerGoogleDriveIpc() {
  ipcMain.handle('google-drive-status', getGoogleDriveStatus);
  ipcMain.handle('connect-google-drive', connectGoogleDrive);
  ipcMain.handle('disconnect-google-drive', disconnectGoogleDrive);
  ipcMain.handle('has-google-drive-ai-api-key', async () => {
    if (await client.loadAiApiKey()) return true;
    const legacyApiKey = await loadAiApiKey();
    if (!legacyApiKey) return false;
    await client.saveAiApiKey(legacyApiKey);
    await saveAiApiKey(null);
    return true;
  });
  ipcMain.handle('save-google-drive-ai-api-key', async (_event, apiKey) => {
    if (apiKey !== null && typeof apiKey !== 'string') {
      throw new TypeError('Invalid AI API key');
    }
    await client.saveAiApiKey(apiKey);
    await saveAiApiKey(null);
  });
  ipcMain.handle('generate-ai-question', async (_event, request) => {
    const apiKey = await client.loadAiApiKey();
    if (!apiKey) throw new Error('AI API key is not configured');
    return generateGameQuestion({
      ...(request as GameQuestionGenerationRequest),
      apiKey,
    });
  });
  ipcMain.handle('load-google-drive-settings', () => client.loadSettings());
  ipcMain.handle('save-google-drive-settings', async (_event, value) => {
    const settings = parseDriveSettingsDocument(value);
    if (!settings) throw new TypeError('Invalid Google Drive settings');
    await client.saveSettings(settings);
  });
  ipcMain.handle('list-google-drive-game-packages', () =>
    client.listGamePackages(),
  );
  ipcMain.handle('load-google-drive-game-package', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.loadGamePackage(fileId);
  });
  ipcMain.handle('create-google-drive-game-package', (_event, value) => {
    const gamePackage = parseDriveGamePackageWrite(value);
    if (!gamePackage) throw new TypeError('Invalid Google Drive package');
    return client.createGamePackage(gamePackage);
  });
  ipcMain.handle(
    'update-google-drive-game-package',
    (_event, fileId, value) => {
      const gamePackage = parseDriveGamePackageWrite(value);
      if (!isDriveFileId(fileId) || !gamePackage) {
        throw new TypeError('Invalid Google Drive package');
      }
      return client.updateGamePackage(fileId, gamePackage);
    },
  );
  ipcMain.handle('delete-google-drive-game-package', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.deleteGamePackage(fileId);
  });
  ipcMain.handle('list-google-drive-ai-questions', () =>
    client.listAIQuestions(),
  );
  ipcMain.handle('load-google-drive-ai-question', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.loadAIQuestion(fileId);
  });
  ipcMain.handle('create-google-drive-ai-question', (_event, value) => {
    const question = parseDriveAIQuestionWrite(value);
    if (!question) throw new TypeError('Invalid Google Drive AI question');
    return client.createAIQuestion(question);
  });
  ipcMain.handle('update-google-drive-ai-question', (_event, fileId, value) => {
    const question = parseDriveAIQuestionWrite(value);
    if (!isDriveFileId(fileId) || !question) {
      throw new TypeError('Invalid Google Drive AI question');
    }
    return client.updateAIQuestion(fileId, question);
  });
  ipcMain.handle('delete-google-drive-ai-question', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.deleteAIQuestion(fileId);
  });
  ipcMain.handle('list-google-drive-ai-questions-packages', () =>
    client.listAIQuestionsPackages(),
  );
  ipcMain.handle('load-google-drive-ai-questions-package', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.loadAIQuestionsPackage(fileId);
  });
  ipcMain.handle(
    'create-google-drive-ai-questions-package',
    (_event, value) => {
      const item = parseDriveAIQuestionsPackageWrite(value);
      if (!item)
        throw new TypeError('Invalid Google Drive AI questions package');
      return client.createAIQuestionsPackage(item);
    },
  );
  ipcMain.handle(
    'update-google-drive-ai-questions-package',
    (_event, fileId, value) => {
      const item = parseDriveAIQuestionsPackageWrite(value);
      if (!isDriveFileId(fileId) || !item) {
        throw new TypeError('Invalid Google Drive AI questions package');
      }
      return client.updateAIQuestionsPackage(fileId, item);
    },
  );
  ipcMain.handle(
    'delete-google-drive-ai-questions-package',
    (_event, fileId) => {
      if (!isDriveFileId(fileId))
        throw new TypeError('Invalid Google Drive file');
      return client.deleteAIQuestionsPackage(fileId);
    },
  );
  ipcMain.handle('list-global-ai-questions', () =>
    client.listGlobalAIQuestions(),
  );
  ipcMain.handle('load-global-ai-question', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.loadGlobalAIQuestion(fileId);
  });
  ipcMain.handle('create-global-ai-question', (_event, value) => {
    const question = parseDriveAIQuestionWrite(value);
    if (!question) throw new TypeError('Invalid global AI question');
    return client.createGlobalAIQuestion(question);
  });
  ipcMain.handle('update-global-ai-question', (_event, fileId, value) => {
    const question = parseDriveAIQuestionWrite(value);
    if (!isDriveFileId(fileId) || !question) {
      throw new TypeError('Invalid global AI question');
    }
    return client.updateGlobalAIQuestion(fileId, question);
  });
  ipcMain.handle('delete-global-ai-question', (_event, fileId) => {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    return client.deleteGlobalAIQuestion(fileId);
  });
}
import {
  generateGameQuestion,
  type GameQuestionGenerationRequest,
} from '@schdk/ai';
