import type {
  DriveAccount,
  DrivePackageStorage,
  DriveSettingsDocument,
} from '@schdk/google-drive';

export {};

declare global {
  interface SchdkDesktopApi {
    googleDrive?: DrivePackageStorage & {
      status(): Promise<{
        state: 'unavailable' | 'disconnected' | 'connected';
        account?: DriveAccount;
      }>;
      connect(): Promise<DriveAccount>;
      disconnect(): Promise<void>;
      hasAiApiKey(): Promise<boolean>;
      saveAiApiKey(apiKey: string | null): Promise<void>;
      loadSettings(): Promise<unknown | null>;
      saveSettings(settings: DriveSettingsDocument): Promise<void>;
    };
  }

  interface Window {
    desktop?: SchdkDesktopApi;
  }
}
