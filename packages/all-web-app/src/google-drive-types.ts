import type { DriveAccount, DriveSettingsDocument } from '@schdk/google-drive';

export interface GoogleDriveBridge {
  status(): Promise<{
    state: 'unavailable' | 'disconnected' | 'connected';
    account?: DriveAccount;
  }>;
  connect(): Promise<DriveAccount>;
  disconnect(): Promise<void>;
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
