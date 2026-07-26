import type {
  DriveAccount,
  DrivePackageStorage,
  DriveSettingsDocument,
} from '@schdk/google-drive';

export {};

declare global {
  interface SchdkDesktopApi {
    aiCredentials?: {
      hasApiKey(): Promise<boolean>;
      saveApiKey(apiKey: string | null): Promise<void>;
    };
    googleDrive?: DrivePackageStorage & {
      status(): Promise<{
        state: 'unavailable' | 'disconnected' | 'connected';
        account?: DriveAccount;
      }>;
      connect(): Promise<DriveAccount>;
      disconnect(): Promise<void>;
      loadSettings(): Promise<unknown | null>;
      saveSettings(settings: DriveSettingsDocument): Promise<void>;
    };
  }

  interface Window {
    desktop?: SchdkDesktopApi;
  }
}
