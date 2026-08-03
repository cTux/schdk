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
  DriveSettingsFile,
} from '@schdk/google-drive';
import { type GoogleDriveConnection } from '../../services/google-drive/google-drive-connection';

interface GoogleDriveConnectionPort {
  status(): Promise<{
    state: 'unavailable' | 'disconnected' | 'connected';
    account?: DriveAccount;
  }>;
  connect(): Promise<DriveAccount>;
  disconnect(): Promise<void>;
  dispose?(): void;
  renewToken?(): Promise<void>;
}

interface AiCredentialsPort {
  hasAiApiKey(): Promise<boolean>;
  saveAiApiKey(apiKey: string | null): Promise<void>;
}

interface AiGenerationPort {
  renewToken?(): Promise<void>;
  generateAiQuestion(
    request: GameQuestionGenerationRequest,
    signal?: AbortSignal,
  ): Promise<GameQuestion>;
}

interface DriveSettingsStorage {
  loadSettings(): Promise<DriveSettingsFile | null>;
  saveSettings(
    settings: DriveSettingsDocument,
    expectedEtag: string | null,
  ): Promise<boolean>;
}

interface GoogleDriveBridge
  extends
    GoogleDriveConnectionPort,
    AiCredentialsPort,
    AiGenerationPort,
    DriveSettingsStorage,
    DrivePackageStorage,
    DriveAIQuestionsPackageStorage,
    DriveAIQuestionStorage,
    DriveGlobalAIQuestionStorage,
    DriveDictionaryStorage,
    DriveQuestionDatabaseStorage {}

export {
  type AiCredentialsPort,
  type AiGenerationPort,
  type DriveSettingsStorage,
  type GoogleDriveBridge,
  type GoogleDriveConnection,
  type GoogleDriveConnectionPort,
};
