import type { GameQuestionGenerationRequest } from '@schdk/ai';
import type { GameQuestion } from '@schdk/common';
import type {
  DriveAccount,
  DriveAIQuestionsPackageStorage,
  DriveAIQuestionStorage,
  DriveGlobalAIQuestionStorage,
  DriveDictionaryStorage,
  DrivePackageStorage,
  DriveQuestionDatabaseStorage,
  DriveSettingsDocument,
} from '@schdk/google-drive';
import { type GoogleDriveConnection } from './google-drive-connection';

interface GoogleDriveBridge
  extends
    DrivePackageStorage,
    DriveAIQuestionsPackageStorage,
    DriveAIQuestionStorage,
    DriveGlobalAIQuestionStorage,
    DriveDictionaryStorage,
    DriveQuestionDatabaseStorage {
  status(): Promise<{
    state: 'unavailable' | 'disconnected' | 'connected';
    account?: DriveAccount;
  }>;
  connect(): Promise<DriveAccount>;
  disconnect(): Promise<void>;
  hasAiApiKey(): Promise<boolean>;
  saveAiApiKey(apiKey: string | null): Promise<void>;
  renewToken?(): Promise<void>;
  generateAiQuestion(
    request: GameQuestionGenerationRequest,
  ): Promise<GameQuestion>;
  loadSettings(): Promise<unknown | null>;
  saveSettings(settings: DriveSettingsDocument): Promise<void>;
}

export { type GoogleDriveBridge, type GoogleDriveConnection };
