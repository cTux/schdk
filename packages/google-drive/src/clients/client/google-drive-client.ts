import {
  parseDriveAccount,
  type DriveAccount,
} from '../../types/accounts/account.js';
import { GoogleDriveAIQuestionsPackageStorage } from '../ai-question-packages/ai-questions-package-client.js';
import { GoogleDriveAIQuestionStorage } from '../ai-questions/ai-question-client.js';
import { StaticAIQuestionStorage } from '../ai-questions/static-ai-question-client.js';
import {
  loadAiApiKey as loadStoredAiApiKey,
  saveAiApiKey as saveStoredAiApiKey,
} from '../../services/ai-credentials/ai-credentials.js';
import type {
  DriveAIQuestionsPackageStorage,
  DriveAIQuestionsPackageWrite,
} from '../../services/ai-question-packages/ai-questions-packages.js';
import type {
  DriveAIQuestionStorage,
  DriveAIQuestionWrite,
} from '../../services/ai-questions/ai-questions.js';

import { GoogleDriveAppData } from '../../types/app-data/app-data.js';
import { GoogleDrivePackageStorage } from '../game-packages/game-package-client.js';
import { StaticDictionaryStorage } from '../dictionaries/static-dictionary-client.js';
import type {
  DriveDictionaryStorage,
  DriveDictionaryWrite,
} from '../../services/dictionaries/dictionaries.js';
import {
  type DriveGamePackageWrite,
  type DrivePackageStorage,
} from '../../services/game-packages/game-packages.js';
import {
  parseDriveVisualAssetsDocument,
  type DriveSettingsDocument,
  type DriveVisualAssetsDocument,
  type DriveVisualAssetsFile,
} from '../../services/settings/settings.js';
import {
  parseQuestionDatabaseDocument,
  type DriveQuestionDatabaseStorage,
  type QuestionDatabaseDocument,
} from '../../services/question-database/question-database.js';

import { GoogleDriveAuthorizationError } from '../../errors/client/google-drive-authorization-error.js';
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';
import { GoogleDrivePreconditionError } from '../../errors/client/google-drive-precondition-error.js';
import type { VersionedAppData } from '../../types/app-data/app-data.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';

const SETTINGS_NAME = 'settings-v1.json';
const VISUAL_ASSETS_NAME = 'visual-assets-v1.json';

const QUESTION_DATABASE_NAME = 'question-database-v1.json';

export class GoogleDriveClient
  implements
    DrivePackageStorage,
    DriveAIQuestionStorage,
    DriveAIQuestionsPackageStorage,
    DriveQuestionDatabaseStorage,
    DriveDictionaryStorage
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
  private readonly globalAiQuestions = new StaticAIQuestionStorage();
  private readonly packages = new GoogleDrivePackageStorage((input, init) =>
    this.request(input, init),
  );
  private readonly dictionaries = new StaticDictionaryStorage();
  constructor(private readonly getAccessToken: () => Promise<string>) {}

  async getAccount(): Promise<DriveAccount> {
    const response = await this.request(
      `${DRIVE_API}/about?fields=user(displayName,emailAddress,photoLink)`,
    );
    const account = parseDriveAccount(await response.json());
    if (!account) {
      throw new GoogleDriveError(
        'Google Drive account metadata is unavailable',
        'invalid-data',
      );
    }
    return account;
  }

  async loadSettings(): Promise<VersionedAppData | null> {
    return this.appData.loadVersioned(SETTINGS_NAME);
  }

  async saveSettings(
    settings: DriveSettingsDocument,
    expectedEtag: string | null,
  ): Promise<boolean> {
    return this.appData.saveVersioned(SETTINGS_NAME, settings, expectedEtag);
  }

  async loadVisualAssets(): Promise<DriveVisualAssetsFile | null> {
    const file = await this.appData.loadVersioned(VISUAL_ASSETS_NAME);
    if (!file) return null;
    const value = parseDriveVisualAssetsDocument(file.value);
    return value ? { etag: file.etag, value } : null;
  }

  async saveVisualAssets(
    assets: DriveVisualAssetsDocument,
    expectedEtag: string | null,
  ): Promise<boolean> {
    const value = parseDriveVisualAssetsDocument(assets);
    if (!value) throw new TypeError('Invalid visual assets');
    return this.appData.saveVersioned(VISUAL_ASSETS_NAME, value, expectedEtag);
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
  createGlobalAIQuestion = (value: DriveAIQuestionWrite) =>
    this.globalAiQuestions.createAIQuestion(value);
  updateGlobalAIQuestion = (fileId: string, value: DriveAIQuestionWrite) =>
    this.globalAiQuestions.updateAIQuestion(fileId, value);
  deleteGlobalAIQuestion = (fileId: string) =>
    this.globalAiQuestions.deleteAIQuestion(fileId);
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
  listDictionaries = () => this.dictionaries.listDictionaries();
  loadDictionary = (fileId: string) => this.dictionaries.loadDictionary(fileId);
  createDictionary = (value: DriveDictionaryWrite) =>
    this.dictionaries.createDictionary(value);
  updateDictionary = (fileId: string, value: DriveDictionaryWrite) =>
    this.dictionaries.updateDictionary(fileId, value);

  createGamePackage = (value: DriveGamePackageWrite) =>
    this.packages.createGamePackage(value);
  updateGamePackage = (
    fileId: string,
    expectedModifiedTime: string,
    value: DriveGamePackageWrite,
  ) => this.packages.updateGamePackage(fileId, expectedModifiedTime, value);
  deleteGamePackage = (fileId: string) =>
    this.packages.deleteGamePackage(fileId);
  listGamePackages = () => this.packages.listGamePackages();
  loadGamePackage = (fileId: string) => this.packages.loadGamePackage(fileId);

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
    if (response.status === 412) {
      throw new GoogleDrivePreconditionError(
        'Google Drive file changed before update',
      );
    }
    if (!response.ok) {
      throw new GoogleDriveError(
        `Google Drive request failed (${response.status})`,
        'unavailable',
      );
    }
    return response;
  }
}
