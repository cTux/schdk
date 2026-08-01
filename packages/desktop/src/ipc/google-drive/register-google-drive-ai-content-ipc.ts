import {
  isDriveFileId,
  parseDriveAIQuestionsPackageWrite,
  parseDriveAIQuestionWrite,
  parseDriveDictionaryWrite,
} from '@schdk/google-drive';
import { ipcMain } from 'electron';
import { GOOGLE_DRIVE_IPC_CHANNELS } from './google-drive-ipc-channels.js';
import { googleDriveClient } from './google-drive-ipc-client.js';

function assertFileId(fileId: unknown) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  return fileId;
}

export function registerGoogleDriveAiContentIpc() {
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.listAiQuestions, () =>
    googleDriveClient.listAIQuestions(),
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.loadAiQuestion, (_event, fileId) =>
    googleDriveClient.loadAIQuestion(assertFileId(fileId)),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.createAiQuestion,
    (_event, value) => {
      const question = parseDriveAIQuestionWrite(value);
      if (!question) throw new TypeError('Invalid Google Drive AI question');
      return googleDriveClient.createAIQuestion(question);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.updateAiQuestion,
    (_event, fileId, value) => {
      const question = parseDriveAIQuestionWrite(value);
      if (!question) throw new TypeError('Invalid Google Drive AI question');
      return googleDriveClient.updateAIQuestion(assertFileId(fileId), question);
    },
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.deleteAiQuestion, (_event, fileId) =>
    googleDriveClient.deleteAIQuestion(assertFileId(fileId)),
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.listAiQuestionPackages, () =>
    googleDriveClient.listAIQuestionsPackages(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.loadAiQuestionPackage,
    (_event, fileId) =>
      googleDriveClient.loadAIQuestionsPackage(assertFileId(fileId)),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.createAiQuestionPackage,
    (_event, value) => {
      const item = parseDriveAIQuestionsPackageWrite(value);
      if (!item)
        throw new TypeError('Invalid Google Drive AI questions package');
      return googleDriveClient.createAIQuestionsPackage(item);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.updateAiQuestionPackage,
    (_event, fileId, value) => {
      const item = parseDriveAIQuestionsPackageWrite(value);
      if (!item)
        throw new TypeError('Invalid Google Drive AI questions package');
      return googleDriveClient.updateAIQuestionsPackage(
        assertFileId(fileId),
        item,
      );
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.deleteAiQuestionPackage,
    (_event, fileId) =>
      googleDriveClient.deleteAIQuestionsPackage(assertFileId(fileId)),
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.listGlobalAiQuestions, () =>
    googleDriveClient.listGlobalAIQuestions(),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.loadGlobalAiQuestion,
    (_event, fileId) =>
      googleDriveClient.loadGlobalAIQuestion(assertFileId(fileId)),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.createGlobalAiQuestion,
    (_event, value) => {
      const question = parseDriveAIQuestionWrite(value);
      if (!question) throw new TypeError('Invalid global AI question');
      return googleDriveClient.createGlobalAIQuestion(question);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.updateGlobalAiQuestion,
    (_event, fileId, value) => {
      const question = parseDriveAIQuestionWrite(value);
      if (!question) throw new TypeError('Invalid global AI question');
      return googleDriveClient.updateGlobalAIQuestion(
        assertFileId(fileId),
        question,
      );
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.deleteGlobalAiQuestion,
    (_event, fileId) =>
      googleDriveClient.deleteGlobalAIQuestion(assertFileId(fileId)),
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.listDictionaries, () =>
    googleDriveClient.listDictionaries(),
  );
  ipcMain.handle(GOOGLE_DRIVE_IPC_CHANNELS.loadDictionary, (_event, fileId) =>
    googleDriveClient.loadDictionary(assertFileId(fileId)),
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.createDictionary,
    (_event, value) => {
      const dictionary = parseDriveDictionaryWrite(value);
      if (!dictionary) throw new TypeError('Invalid Google Drive dictionary');
      return googleDriveClient.createDictionary(dictionary);
    },
  );
  ipcMain.handle(
    GOOGLE_DRIVE_IPC_CHANNELS.updateDictionary,
    (_event, fileId, value) => {
      const dictionary = parseDriveDictionaryWrite(value);
      if (!dictionary) throw new TypeError('Invalid Google Drive dictionary');
      return googleDriveClient.updateDictionary(
        assertFileId(fileId),
        dictionary,
      );
    },
  );
}
