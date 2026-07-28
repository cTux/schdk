import type { GameQuestionGenerationRequest } from '@schdk/ai';
import type { GameQuestion } from '@schdk/common';
import type {
  DriveAccount,
  DriveAIQuestionStorage,
  DriveAIQuestionsPackageStorage,
  DriveGlobalAIQuestionStorage,
  DrivePackageStorage,
  DriveSettingsDocument,
} from '@schdk/google-drive';

export {};

declare global {
  interface SchdkDesktopApi {
    updates?: {
      check(): Promise<boolean>;
      openReleasePage(): Promise<void>;
    };
    googleDrive?: DrivePackageStorage &
      DriveAIQuestionStorage &
      DriveAIQuestionsPackageStorage &
      DriveGlobalAIQuestionStorage & {
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
      };
  }

  interface Window {
    desktop?: SchdkDesktopApi;
  }
}
