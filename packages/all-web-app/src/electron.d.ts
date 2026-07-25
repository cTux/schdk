import type { DriveAccount, DriveSettingsDocument } from '@schdk/google-drive';

export {};

declare global {
  interface SchdkDesktopApi {
    googleDrive?: {
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
