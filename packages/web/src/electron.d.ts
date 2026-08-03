import type { GameQuestionGenerationRequest } from '@schdk/ai';
import type { GameQuestion } from '@schdk/common/game-question';
import type {
  DriveAccount,
  DriveAIQuestionStorage,
  DriveAIQuestionsPackageStorage,
  DriveGlobalAIQuestionStorage,
  DriveDictionaryStorage,
  DrivePackageStorage,
  DriveQuestionDatabaseStorage,
  DriveSettingsDocument,
  DriveSettingsFile,
  DriveVisualAssetsDocument,
  DriveVisualAssetsFile,
} from '@schdk/google-drive';

export {};

declare global {
  interface SchdkDesktopApi {
    saveGamePackage(
      filename: string,
      content: Uint8Array,
    ): Promise<string | null>;
    setEditorPackageOpen(open: boolean): void;
    setPresenterNotes(
      notes: {
        questionNumber: number;
        questionCount: number;
        notes: string;
      } | null,
    ): void;
    onCloseRequested(callback: (attempt: number) => void): () => void;
    finishCloseAttempt(attempt: number, succeeded: boolean): void;
    updates?: {
      check(): Promise<boolean>;
      openReleasePage(): Promise<void>;
    };
    googleDrive?: DrivePackageStorage &
      DriveAIQuestionStorage &
      DriveAIQuestionsPackageStorage &
      DriveGlobalAIQuestionStorage & {
        createDictionary: DriveDictionaryStorage['createDictionary'];
        updateDictionary: DriveDictionaryStorage['updateDictionary'];
        listDictionaries: DriveDictionaryStorage['listDictionaries'];
        loadDictionary: DriveDictionaryStorage['loadDictionary'];
        loadQuestionDatabase: DriveQuestionDatabaseStorage['loadQuestionDatabase'];
        saveQuestionDatabase: DriveQuestionDatabaseStorage['saveQuestionDatabase'];
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
          signal?: AbortSignal,
        ): Promise<GameQuestion>;
        loadSettings(): Promise<DriveSettingsFile | null>;
        saveSettings(
          settings: DriveSettingsDocument,
          expectedEtag: string | null,
        ): Promise<boolean>;
        loadVisualAssets(): Promise<DriveVisualAssetsFile | null>;
        saveVisualAssets(
          assets: DriveVisualAssetsDocument,
          expectedEtag: string | null,
        ): Promise<boolean>;
      };
  }

  interface Window {
    desktop?: SchdkDesktopApi;
  }
}
