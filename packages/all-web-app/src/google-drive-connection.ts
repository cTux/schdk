import type { DriveAccount } from '@schdk/google-drive';

export type GoogleDriveConnection =
  | { state: 'unavailable' }
  | { state: 'disconnected' }
  | { state: 'connecting' }
  | { state: 'connected'; account: DriveAccount }
  | { state: 'reauthorization-required'; account?: DriveAccount }
  | { state: 'error'; account?: DriveAccount };
