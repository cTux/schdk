import { parseDriveAccount, type DriveAccount } from './account.js';
import { GoogleDriveAIQuestionsPackageStorage } from './ai-questions-package-client.js';
import { GoogleDriveAIQuestionStorage } from './ai-question-client.js';
import {
  loadAiApiKey as loadStoredAiApiKey,
  saveAiApiKey as saveStoredAiApiKey,
} from './ai-credentials.js';
import type {
  DriveAIQuestionsPackageStorage,
  DriveAIQuestionsPackageWrite,
} from './ai-questions-packages.js';
import type {
  DriveAIQuestionStorage,
  DriveAIQuestionWrite,
} from './ai-questions.js';
import {
  GLOBAL_AI_QUESTION_FOLDER_ID,
  isGlobalAIQuestionAdmin,
} from './ai-questions.js';
import { GoogleDriveAppData } from './app-data.js';
import { GoogleDrivePackageStorage } from './game-package-client.js';
import {
  type DriveGamePackageWrite,
  type DrivePackageStorage,
} from './game-packages.js';
import type { DriveSettingsDocument } from './settings.js';
import {
  parseQuestionDatabaseDocument,
  type DriveQuestionDatabaseStorage,
  type QuestionDatabaseDocument,
} from './question-database.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const SETTINGS_NAME = 'settings-v1.json';
const QUESTION_DATABASE_NAME = 'question-database-v1.json';

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
] as const;

export type { DriveAccount } from './account.js';

export class GoogleDriveAuthorizationError extends Error {}

export class GoogleDriveClient
  implements
    DrivePackageStorage,
    DriveAIQuestionStorage,
    DriveAIQuestionsPackageStorage,
    DriveQuestionDatabaseStorage
{
  private readonly appData = new GoogleDriveAppData((input, init) =>
    this.request(input, init),
  );
  private readonly aiQuestions = new GoogleDriveAIQuestionStorage(
    (input, init) => this.request(input, init),
  );
  private readonly aiQuestionsPackages =
    new GoogleDriveAIQuestionsPackageStorage((input, init) =>
      this.request(input, init),
    );
  private readonly globalAiQuestions = new GoogleDriveAIQuestionStorage(
    (input, init) => this.request(input, init),
    GLOBAL_AI_QUESTION_FOLDER_ID,
  );
  private readonly packages = new GoogleDrivePackageStorage((input, init) =>
    this.request(input, init),
  );
  constructor(private readonly getAccessToken: () => Promise<string>) {}

  async getAccount(): Promise<DriveAccount> {
    const response = await this.request(
      `${DRIVE_API}/about?fields=user(displayName,emailAddress,photoLink)`,
    );
    const account = parseDriveAccount(await response.json());
    if (!account) {
      throw new Error('Google Drive account metadata is unavailable');
    }
    return account;
  }

  async loadSettings(): Promise<unknown | null> {
    return this.appData.load(SETTINGS_NAME);
  }

  async saveSettings(settings: DriveSettingsDocument): Promise<void> {
    await this.appData.save(SETTINGS_NAME, settings);
  }

  async loadQuestionDatabase(): Promise<QuestionDatabaseDocument | null> {
    return parseQuestionDatabaseDocument(
      await this.appData.load(QUESTION_DATABASE_NAME),
    );
  }

  async saveQuestionDatabase(value: QuestionDatabaseDocument): Promise<void> {
    const parsed = parseQuestionDatabaseDocument(value);
    if (!parsed) throw new TypeError('Invalid question database');
    await this.appData.save(QUESTION_DATABASE_NAME, parsed);
  }

  async loadAiApiKey(): Promise<string | null> {
    return loadStoredAiApiKey(this.appData);
  }

  async saveAiApiKey(apiKey: string | null): Promise<void> {
    await saveStoredAiApiKey(this.appData, apiKey);
  }

  createAIQuestion = (value: DriveAIQuestionWrite) =>
    this.aiQuestions.createAIQuestion(value);
  updateAIQuestion = (fileId: string, value: DriveAIQuestionWrite) =>
    this.aiQuestions.updateAIQuestion(fileId, value);
  deleteAIQuestion = (fileId: string) =>
    this.aiQuestions.deleteAIQuestion(fileId);
  listAIQuestions = () => this.aiQuestions.listAIQuestions();
  loadAIQuestion = (fileId: string) => this.aiQuestions.loadAIQuestion(fileId);
  listGlobalAIQuestions = () => this.globalAiQuestions.listAIQuestions();
  loadGlobalAIQuestion = (fileId: string) =>
    this.globalAiQuestions.loadAIQuestion(fileId);
  createGlobalAIQuestion = async (value: DriveAIQuestionWrite) => {
    await this.assertGlobalAIQuestionAdmin();
    return this.globalAiQuestions.createAIQuestion(value);
  };
  updateGlobalAIQuestion = async (
    fileId: string,
    value: DriveAIQuestionWrite,
  ) => {
    await this.assertGlobalAIQuestionAdmin();
    return this.globalAiQuestions.updateAIQuestion(fileId, value);
  };
  deleteGlobalAIQuestion = async (fileId: string) => {
    await this.assertGlobalAIQuestionAdmin();
    return this.globalAiQuestions.deleteAIQuestion(fileId);
  };
  createAIQuestionsPackage = (value: DriveAIQuestionsPackageWrite) =>
    this.aiQuestionsPackages.createAIQuestionsPackage(value);
  updateAIQuestionsPackage = (
    fileId: string,
    value: DriveAIQuestionsPackageWrite,
  ) => this.aiQuestionsPackages.updateAIQuestionsPackage(fileId, value);
  deleteAIQuestionsPackage = (fileId: string) =>
    this.aiQuestionsPackages.deleteAIQuestionsPackage(fileId);
  listAIQuestionsPackages = () =>
    this.aiQuestionsPackages.listAIQuestionsPackages();
  loadAIQuestionsPackage = (fileId: string) =>
    this.aiQuestionsPackages.loadAIQuestionsPackage(fileId);

  createGamePackage = (value: DriveGamePackageWrite) =>
    this.packages.createGamePackage(value);
  updateGamePackage = (fileId: string, value: DriveGamePackageWrite) =>
    this.packages.updateGamePackage(fileId, value);
  deleteGamePackage = (fileId: string) =>
    this.packages.deleteGamePackage(fileId);
  listGamePackages = () => this.packages.listGamePackages();
  loadGamePackage = (fileId: string) => this.packages.loadGamePackage(fileId);

  private async assertGlobalAIQuestionAdmin() {
    if (!isGlobalAIQuestionAdmin((await this.getAccount()).emailAddress)) {
      throw new GoogleDriveAuthorizationError(
        'Global AI question access denied',
      );
    }
  }

  private async request(input: string, init: RequestInit = {}) {
    const response = await fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${await this.getAccessToken()}`,
        ...init.headers,
      },
    });
    if (response.status === 401) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    if (!response.ok) {
      throw new Error(`Google Drive request failed (${response.status})`);
    }
    return response;
  }
}
