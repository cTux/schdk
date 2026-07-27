import type { GameQuestionGenerationRequest } from '@schdk/ai';
import type { GameQuestion } from '@schdk/common';
import type {
  DriveAccount,
  DriveAIQuestionsPackageStorage,
  DriveAIQuestionStorage,
  DriveGlobalAIQuestionStorage,
  DrivePackageStorage,
  DriveSettingsDocument,
} from '@schdk/google-drive';

export interface GoogleDriveBridge
  extends
    DrivePackageStorage,
    DriveAIQuestionsPackageStorage,
    DriveAIQuestionStorage,
    DriveGlobalAIQuestionStorage {
  status(): Promise<{
    state: 'unavailable' | 'disconnected' | 'connected';
    account?: DriveAccount;
  }>;
  connect(): Promise<DriveAccount>;
  disconnect(): Promise<void>;
  hasAiApiKey(): Promise<boolean>;
  saveAiApiKey(apiKey: string | null): Promise<void>;
  generateAiQuestion(
    request: GameQuestionGenerationRequest,
  ): Promise<GameQuestion>;
  loadSettings(): Promise<unknown | null>;
  saveSettings(settings: DriveSettingsDocument): Promise<void>;
}

export type GoogleDriveConnection =
  | { state: 'unavailable' }
  | { state: 'disconnected' }
  | { state: 'connecting' }
  | { state: 'connected'; account: DriveAccount }
  | { state: 'reauthorization-required'; account?: DriveAccount }
  | { state: 'error'; account?: DriveAccount };
